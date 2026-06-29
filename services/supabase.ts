
import { createClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  Championship, 
  Team, 
  BusinessPlan, 
  EcosystemConfig, 
  Branch, 
  StrategicProfile,
  AccountNode,
  CurrencyType,
  MacroIndicators,
  TransparencyLevel,
  GazetaMode,
  InsolvencyStatus,
  RegionConfig,
  Modality
} from '../types';
import { generateBotDecision, calculateESDS } from './gemini';
import { calculateProjections } from './simulation';
import { INITIAL_FINANCIAL_TREE, INITIAL_MACHINES_R0, DEFAULT_INDUSTRIAL_CHRONOGRAM, MAX_CONSECUTIVE_MISSES, DEFAULT_MACRO } from '../constants';

// NOTA SÊNIOR: Suporte híbrido para leitura de envs em Vite e Node Standard (evita quebra em testes offline)
const getEnvVal = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  return '';
};

const supabaseUrl = getEnvVal('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVal('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isTestMode = true;

const findAccountInTree = (nodes: AccountNode[], id: string): AccountNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findAccountInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findAccountValue = (nodes: AccountNode[], path: string): number => {
  const node = findAccountInTree(nodes, path);
  if (node) return node.value;

  const parts = path.split('.');
  let current: AccountNode[] | undefined = nodes;
  
  for (let i = 0; i < parts.length; i++) {
    const node: AccountNode | undefined = current?.find(n => n.id === parts[i]);
    if (!node) return 0;
    if (i === parts.length - 1) return node.value;
    current = node.children;
  }
  return 0;
};

export const provisionDemoEnvironment = async () => {
  console.info("Empirion Demo Node: Provisioning simulated cluster...");
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (uid === '00000000-0000-0000-0000-000000000000') {
    return {
      id: uid,
      supabase_user_id: uid,
      name: "Trial Orchestrator",
      nickname: "Trial Orchestrator",
      email: "trial@empirion.com",
      phone: "",
      role: 'tutor',
      is_opal_premium: true,
      created_at: new Date().toISOString()
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('supabase_user_id', uid)
      .maybeSingle();
      
    if (error) {
      console.log("Profile Fetch (using local fallback for anon/trial session):", error.message || error);
      return {
        id: uid,
        supabase_user_id: uid,
        name: "User " + uid.slice(0, 5),
        nickname: "Player",
        email: "player@empirion.com",
        phone: "",
        role: 'player',
        is_opal_premium: false,
        created_at: new Date().toISOString()
      };
    }
    
    if (!data) {
      return {
        id: uid,
        supabase_user_id: uid,
        name: "User " + uid.slice(0, 5),
        nickname: "Player",
        email: "player@empirion.com",
        phone: "",
        role: 'player',
        is_opal_premium: false,
        created_at: new Date().toISOString()
      };
    }
    
    return data;
  } catch (catchErr: any) {
    console.log("Profile Fetch Exception (using local fallback):", catchErr?.message || catchErr);
    return {
      id: uid,
      supabase_user_id: uid,
      name: "User " + uid.slice(0, 5),
      nickname: "Player",
      email: "player@empirion.com",
      phone: "",
      role: 'player',
      is_opal_premium: false,
      created_at: new Date().toISOString()
    };
  }
};

export const getUserEmpirePoints = async (userId: string): Promise<number> => {
  const { data } = await supabase
    .from('empire_points')
    .select('total_points')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.total_points || 0;
};

export const getChampionships = async (isPublicOnly: boolean = false, forceTable?: 'live' | 'trial') => {
  const isTrialSession = localStorage.getItem('is_trial_session') === 'true';
  
  const fetchFromTable = async (type: 'live' | 'trial') => {
    const table = type === 'trial' ? 'trial_championships' : 'championships';
    const teamsTable = type === 'trial' ? 'trial_teams' : 'teams';
    let query = supabase.from(table).select(`*, teams:${teamsTable}(*)`);
    if (isPublicOnly) {
      query = query.eq('is_public', true).eq('status', 'active');
    }
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(c => mapChampionshipSynthetically({ ...c, is_trial: type === 'trial' }));
  };

  if (forceTable === 'live') return { data: await fetchFromTable('live'), error: null };
  if (forceTable === 'trial') return { data: await fetchFromTable('trial'), error: null };

  // Se não forçado, e estivermos em uma visualização de seleção (onde queremos ver tudo)
  // ou se o isTrialSession for o critério
  if (!isTrialSession) {
    // Tenta buscar de ambos para garantir que o Tutor veja tudo no Admin ou Seleção
    const [live, trial] = await Promise.all([fetchFromTable('live'), fetchFromTable('trial')]);
    return { data: [...live, ...trial], error: null };
  }

  return { data: await fetchFromTable('trial'), error: null };
};

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  return await supabase.from(table).delete().eq('id', id);
};

export const getActiveBusinessPlan = async (teamId: string, round: number, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  return await supabase
    .from('business_plans')
    .select('*')
    .eq('team_id', teamId)
    .eq('round', round)
    .maybeSingle();
};

export const saveBusinessPlan = async (payload: Partial<BusinessPlan>) => {
  if (payload.id) {
    return await supabase.from('business_plans').update(payload).eq('id', payload.id);
  }
  return await supabase.from('business_plans').insert(payload);
};

export const mapHistoryItemSynthetically = (item: any) => {
  if (!item) return item;
  const accessorFields = [
    'tsr', 'nlcdg', 'ebitda', 'solvency_score_kanitz', 'dcf_valuation',
    'total_assets', 'fixed_assets_value', 'stock_value', 'fixed_assets_depreciation',
    'ccc', 'interest_coverage', 'import_tariff_brazil', 'import_tariff_uk',
    'brl_rate', 'gbp_rate', 'compulsory_loan_balance', 'compulsory_loan_interest_paid',
    'scissors_effect', 'liquidity_current', 'solvency_index', 'inventory_turnover',
    'avg_receivable_days', 'avg_payable_days', 'price_elasticity', 'carbon_footprint',
    'credit_rating', 'altman_z_score', 'fco_livre', 'capex_manutencao', 'capex_estrategico',
    'stock_mpa_value', 'stock_mpb_value', 'vat_recoverable', 'vat_payable',
    'total_receivables', 'total_payables', 'supplier_interest_expenses',
    'emergency_purchase_expenses', 'emergency_units_total'
  ];
  const mapped = { ...item };
  if (mapped.kpis) {
    accessorFields.forEach(field => {
      if (mapped[field] === undefined || mapped[field] === null) {
        mapped[field] = mapped.kpis[field];
      }
    });
    if (mapped.kpis.esds) {
      if (mapped.esds_score === undefined || mapped.esds_score === null) mapped.esds_score = mapped.kpis.esds.esds_display || mapped.kpis.esds.score || 0;
      if (mapped.esds_zone === undefined || mapped.esds_zone === null) mapped.esds_zone = mapped.kpis.esds.zone || 'ALERTA';
      if (mapped.esds_gargalo === undefined || mapped.esds_gargalo === null) mapped.esds_gargalo = mapped.kpis.esds.gargalo_principal || '';
      if (mapped.esds_insights === undefined || mapped.esds_insights === null) mapped.esds_insights = mapped.kpis.esds.gemini_insights || '';
      if (mapped.esds_top_gargalos === undefined || mapped.esds_top_gargalos === null) mapped.esds_top_gargalos = mapped.kpis.esds.top_gargalos || [];
      if (mapped.esds_main_drivers === undefined || mapped.esds_main_drivers === null) mapped.esds_main_drivers = mapped.kpis.esds.main_drivers || [];
    }
  }
  return mapped;
};

export const mapChampionshipSynthetically = (c: any) => {
  if (!c) return c;
  
  let config = c.config || {};
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config);
    } catch (e) {
      config = {};
    }
  }
  
  const mapped = { ...c, config };
  
  const compactFields = [
    'regions_count', 'regions', 'region_names', 'region_configs', 'currency', 'sales_mode', 
    'scenario_type', 'social_charges', 'compulsory_loan_agio', 
    'production_hours_period', 'award_values', 'exchange_rates', 
    'staffing', 'prices', 'machinery_values', 'round_rules', 
    'brl_rate', 'gbp_rate', 'dividend_percent', 'initial_share_price'
  ];

  compactFields.forEach(field => {
    const isFieldEmptyObj = mapped[field] && typeof mapped[field] === 'object' && Object.keys(mapped[field]).length === 0;
    if (mapped[field] === undefined || mapped[field] === null || isFieldEmptyObj) {
      if (config[field] !== undefined && config[field] !== null) {
        mapped[field] = config[field];
      }
    }
  });

  if (mapped.regions_count === undefined || mapped.regions_count === null || mapped.regions_count === 0) {
    const list = config.regions || config.region_configs || c.region_configs || [];
    if (Array.isArray(list) && list.length > 0) {
      mapped.regions_count = list.length;
    } else {
      mapped.regions_count = 1;
    }
  }

  if (!mapped.currency && config.currency) {
    mapped.currency = config.currency;
  }

  // Harmonização Polimórfica e Sincronização Sênior de general_settings
  let genSettings = c.general_settings || config.general_settings || {};
  if (typeof genSettings === 'string') {
    try {
      genSettings = JSON.parse(genSettings);
    } catch (e) {
      genSettings = {};
    }
  } else {
    genSettings = { ...genSettings };
  }

  // Centralização Soberana: Unificação e Fusão de todos os dados imutáveis do Round 0 de 'config' para 'general_settings'
  const keysToSync = [
    'caixa_inicial', 'capital_social', 'land_value', 'building_value', 'building_age', 
    'building_mode', 'taxes_initial', 'clients_initial', 'suppliers_initial', 
    'dividends_initial', 'financial_investments', 'wip_stock_value', 'custom_pecld_val', 
    'storage_mp', 'storage_finished', 'monthly_rent_value', 'rent_allocation_productive', 
    'rent_allocation_administrative', 'rent_allocation_sales', 'machines_depreciation_rate', 
    'buildings_depreciation_rate', 'property_depreciation_rate', 'profit_incorporation_frequency', 
    'dividend_frequency', 'dividend_percent', 'share_price_initial', 'installations_value', 
    'admin_sales_installations', 'real_estate_acquisition_funding', 'segmentName', 
    'tournamentName', 'tutorName', 'institutionName', 'inventories', 'gazeta_mode', 
    'transparency_level', 'round_duration', 'activity_type', 'botsCount', 'teamNames', 
    'humanTeamsCount', 'total_rounds', 'regions', 'region_configs', 'region_names', 'currency', 'sales_mode',
    'scenario_type', 'social_charges', 'compulsory_loan_agio'
  ];

  keysToSync.forEach(key => {
    if (config[key] !== undefined && config[key] !== null) {
      genSettings[key] = config[key];
    }
  });

  // 1. Sincronização do starting_mode
  if (genSettings.starting_mode === undefined && c.starting_mode !== undefined) {
    genSettings.starting_mode = c.starting_mode;
  }
  if (genSettings.starting_mode === undefined && config.starting_mode !== undefined) {
    genSettings.starting_mode = config.starting_mode;
  }

  // 2. Unificação absoluta de machine_specs a partir do array 'machines' ou especificações legadas
  const specs = genSettings.machine_specs ? { ...genSettings.machine_specs } : {};
  
  // Alinhamento estrutural de nomes alternativos de modelos
  if (!specs.alpha && specs.alfa) specs.alpha = specs.alfa;
  if (!specs.gamma && specs.gama) specs.gamma = specs.gama;
  
  const configMachines = config.machines || genSettings.machines || [];
  const configWorkforce = config.workforce || genSettings.workforce || {};

  if (Array.isArray(configMachines) && configMachines.length > 0) {
    configMachines.forEach((m: any) => {
      const model = m.model?.toLowerCase();
      if (model) {
        // Obter de forma resiliente os operadores padrão parametrizados pelo tutor para o modelo de máquina
        let opsRequired = m.operators_required;
        if (!opsRequired) {
          if (model === 'alpha') opsRequired = configWorkforce.operatorsPerAlpha ?? 100;
          else if (model === 'beta') opsRequired = configWorkforce.operatorsPerBeta ?? 250;
          else if (model === 'gamma') opsRequired = configWorkforce.operatorsPerGamma ?? 500;
        }
        
        specs[model] = {
          model: model,
          initial_value: Number(m.price ?? m.initial_value ?? m.acquisition_value ?? (model === 'alpha' ? 1100000 : model === 'beta' ? 2200000 : 3300000)),
          production_capacity: Number(m.capacity_at_100 ?? m.production_capacity ?? (model === 'alpha' ? 2500 : model === 'beta' ? 6000 : 12000)),
          operators_required: Number(opsRequired ?? (model === 'alpha' ? 100 : model === 'beta' ? 250 : 500)),
          depreciation_rate: Number(m.depreciation_rate ?? config.machines_depreciation_rate ?? genSettings.machines_depreciation_rate ?? 0.05),
          useful_life_years: Number(m.useful_life_years ?? 20),
          overload_coef: Number(m.overload_coef ?? (model === 'alpha' ? 1.4 : model === 'beta' ? 1.2 : 1.0)),
          aging_coef: Number(m.aging_coef ?? (model === 'alpha' ? 0.8 : model === 'beta' ? 0.6 : 0.5)),
          overload_extra_rate: Number(m.overload_extra_rate ?? (model === 'alpha' ? 0.001 : model === 'beta' ? 0.0007 : 0.0005)),
          installation_cost: Number(m.installation_cost ?? m.installation_value ?? (model === 'alpha' ? 100000 : model === 'beta' ? 200000 : 300000)),
          efficiency: Number(m.efficiency ?? 1)
        };
      }
    });
  }

  // Garante que todos os 3 modelos possuem suas especificações fiduciárias preenchidas com os fallbacks do tutor
  if (!specs.alpha) {
    specs.alpha = { model: 'alpha', initial_value: 1100000.00, production_capacity: 2500, operators_required: configWorkforce.operatorsPerAlpha ?? 100, depreciation_rate: 0.05, overload_coef: 1.4, aging_coef: 0.8, useful_life_years: 20, overload_extra_rate: 0.001, installation_cost: 100000, efficiency: 1 };
  }
  if (!specs.beta) {
    specs.beta = { model: 'beta', initial_value: 2200000.00, production_capacity: 6000, operators_required: configWorkforce.operatorsPerBeta ?? 250, depreciation_rate: 0.05, overload_coef: 1.2, aging_coef: 0.6, useful_life_years: 20, overload_extra_rate: 0.0007, installation_cost: 200000, efficiency: 1 };
  }
  if (!specs.gamma) {
    specs.gamma = { model: 'gamma', initial_value: 3300000.00, production_capacity: 12000, operators_required: configWorkforce.operatorsPerGamma ?? 500, depreciation_rate: 0.05, overload_coef: 1.0, aging_coef: 0.5, useful_life_years: 20, overload_extra_rate: 0.0005, installation_cost: 300000, efficiency: 1 };
  }

  genSettings.machine_specs = specs;

  // 3. Unificação absoluta de machinery_values com machine_specs para eliminar duplicidades/ambiguidades
  if (!genSettings.machinery_values) {
    genSettings.machinery_values = {};
  }
  genSettings.machinery_values = {
    alpha: genSettings.machine_specs?.alpha?.initial_value ?? config.machinery_values?.alpha ?? config.machinery_values?.alfa ?? 1100000.00,
    beta: genSettings.machine_specs?.beta?.initial_value ?? config.machinery_values?.beta ?? 2200000.00,
    gamma: genSettings.machine_specs?.gamma?.initial_value ?? config.machinery_values?.gamma ?? config.machinery_values?.gama ?? 3300000.00,
  };
  mapped.machinery_values = genSettings.machinery_values;

  // 4. Unificação de workforce profundamente
  if (!genSettings.workforce) {
    genSettings.workforce = {};
  }
  
  // Mescla profunda das propriedades do workforce
  const workforceKeys = [
    'baseSalary', 'base_salary', 'max_shifts', 'admin_count', 'sales_count', 
    'trainingLevel', 'training_level', 'operatorsPerAlpha', 'operatorsPerBeta', 
    'operatorsPerGamma', 'salary_multiplier', 'production_hours_period'
  ];

  workforceKeys.forEach(wk => {
    if (configWorkforce[wk] !== undefined && configWorkforce[wk] !== null) {
      genSettings.workforce[wk] = configWorkforce[wk];
    }
  });

  // Unificação fiduciária de max_shifts e production_hours_period
  const maxShiftsVal = genSettings.workforce?.max_shifts ?? genSettings.max_shifts ?? config.workforce?.max_shifts ?? config.max_shifts ?? 1;
  const prodHoursVal = genSettings.workforce?.production_hours_period ?? genSettings.production_hours_period ?? config.workforce?.production_hours_period ?? config.production_hours_period ?? 176;

  genSettings.max_shifts = Number(maxShiftsVal);
  genSettings.production_hours_period = Number(prodHoursVal);

  genSettings.workforce.max_shifts = Number(maxShiftsVal);
  genSettings.workforce.production_hours_period = Number(prodHoursVal);

  mapped.max_shifts = Number(maxShiftsVal);
  mapped.production_hours_period = Number(prodHoursVal);

  // 5. Unificação de salários (base_salary, baseSalary, hr_base.salary)
  const baseSalaryVal = genSettings.workforce?.base_salary ?? genSettings.workforce?.baseSalary ?? genSettings.hr_base?.salary ?? config.workforce?.base_salary ?? config.workforce?.baseSalary ?? 2500;
  if (!genSettings.hr_base) {
    genSettings.hr_base = { salary: baseSalaryVal };
  } else {
    genSettings.hr_base.salary = baseSalaryVal;
  }
  genSettings.workforce.base_salary = baseSalaryVal;
  genSettings.workforce.baseSalary = baseSalaryVal;

  // Unificação fiduciária e robusta de staffing (admin_count, sales_count, salary_multiplier)
  const adminCountVal = genSettings.workforce?.admin_count ?? genSettings.staffing?.admin?.count ?? config.workforce?.admin_count ?? config.staffing?.admin?.count ?? 20;
  const salesCountVal = genSettings.workforce?.sales_count ?? genSettings.staffing?.sales?.count ?? config.workforce?.sales_count ?? config.staffing?.sales?.count ?? 10;
  const salaryMultVal = genSettings.workforce?.salary_multiplier ?? genSettings.staffing?.admin?.salaries ?? config.workforce?.salary_multiplier ?? config.staffing?.admin?.salaries ?? 4;

  if (!genSettings.staffing) {
    genSettings.staffing = {
      ...DEFAULT_MACRO.staffing
    };
  }
  genSettings.staffing = {
    ...genSettings.staffing,
    admin: {
      count: Number(adminCountVal),
      salaries: Number(salaryMultVal)
    },
    sales: {
      count: Number(salesCountVal),
      salaries: Number(salaryMultVal)
    }
  };
  mapped.staffing = genSettings.staffing;

  // 6. Unificação de preços MP_A e MP_B e custos de estocagem
  if (!genSettings.prices) {
    genSettings.prices = config.prices || {};
  }
  const mpaVal = genSettings.mpa_unit_val ?? genSettings.prices?.mpa_unit_val ?? genSettings.prices?.mp_a ?? config.prices?.mp_a ?? 20;
  const mpbVal = genSettings.mpb_unit_val ?? genSettings.prices?.mpb_unit_val ?? genSettings.prices?.mp_b ?? config.prices?.mp_b ?? 40;
  genSettings.prices = {
    ...genSettings.prices,
    mp_a: Number(mpaVal),
    mp_b: Number(mpbVal),
    storage_mp: genSettings.prices?.storage_mp ?? genSettings.storage_mp ?? config.prices?.storage_mp ?? 1.40,
    storage_finished: genSettings.prices?.storage_finished ?? genSettings.storage_finished ?? config.prices?.storage_finished ?? 20.00,
    distribution_unit: genSettings.prices?.distribution_unit ?? config.prices?.distribution_unit ?? 50.00
  };
  mapped.prices = genSettings.prices;

  mapped.general_settings = genSettings;

  // Resiliência de Runtime de Alto Nível: Injeção retrógrada das chaves de general_settings de volta em config em memória
  // para que qualquer leitura legado que acesse championship.config.caixa_inicial, etc. funcione perfeitamente
  if (mapped.config) {
    keysToSync.forEach(key => {
      if (mapped.config[key] === undefined && genSettings[key] !== undefined) {
        mapped.config[key] = genSettings[key];
      }
    });
    // Fornecer atalhos fiduciários em mapped.config para sub-objetos para as telas legadas
    if (!mapped.config.workforce && genSettings.workforce) {
      mapped.config.workforce = genSettings.workforce;
    }
    if (!mapped.config.regions && genSettings.regions) {
      mapped.config.regions = genSettings.regions;
    }
    if (!mapped.config.machine_specs && genSettings.machine_specs) {
      mapped.config.machine_specs = genSettings.machine_specs;
    }
    if (!mapped.config.machines && configMachines.length > 0) {
      mapped.config.machines = configMachines;
    }
  }

  return mapped;
};

export const getTeamSimulationHistory = async (teamId: string, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  const historyTable = isTrialSession ? 'trial_companies' : 'companies';
  const { data } = await supabase
    .from(historyTable)
    .select('*')
    .eq('team_id', teamId)
    .order('round', { ascending: true });
  return (data || []).map(mapHistoryItemSynthetically);
};

export const getChampionshipSimulationHistory = async (championshipId: string, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  const historyTable = isTrialSession ? 'trial_companies' : 'companies';
  const { data } = await supabase
    .from(historyTable)
    .select('*')
    .eq('championship_id', championshipId)
    .order('round', { ascending: true });
  return (data || []).map(mapHistoryItemSynthetically);
};

export const saveDecisions = async (teamId: string, champId: string, round: number, data: any, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  const table = isTrialSession ? 'trial_decisions' : 'current_decisions';
  
  // Garante o status de origem 'equipe' no JSONB de decisões
  const decisionData = {
    ...data,
    decision_status: 'equipe'
  };
  
  const { data: existing } = await supabase.from(table).select('id').eq('team_id', teamId).eq('round', round).maybeSingle();
  if (existing) {
    const { error } = await supabase.from(table).update({ data: decisionData, championship_id: champId }).eq('id', existing.id);
    return { success: !error, error: error?.message };
  } else {
    const { error } = await supabase.from(table).insert({ team_id: teamId, championship_id: champId, round, data: decisionData });
    return { success: !error, error: error?.message };
  }
};

export const createChampionshipWithTeams = async (config: any, teams: any[], isTrial: boolean) => {
  const champTable = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  const historyTable = isTrial ? 'trial_companies' : 'companies';
  
  // v19.14: Higienização Fiduciária de Payload (Database Payload Sanitization)
  // Filtra as propriedades do config para persistir apenas as colunas estruturais reais das tabelas no Supabase.
  // Colunas lógicas de transporte (como `initial_machines` ou `initial_stock_quantities`) continuarão no config
  // em memória para serem usadas nos KPIs iniciais abaixo, mas não quebram a query INSERT do PostgREST.
  const validTrialCols = [
    'name', 'branch', 'status', 'current_round', 'total_rounds', 'config',
    'initial_financials', 'general_settings', 'tutor_id',
    'deadline_value', 'deadline_unit', 'description', 'gazeta_mode', 'transparency_level',
    'observers', 'round_started_at', 'is_public', 'ecosystem_config',
    'is_trial', 'starting_mode'
  ];
  
  const validLiveCols = [...validTrialCols, 'products', 'resources', 'team_fee', 'start_date', 'end_date', 'sector', 'master_key_enabled', 'kpis'];
  const allowedKeys = isTrial ? validTrialCols : validLiveCols;
  const dbPayload: any = {};
  
  Object.keys(config).forEach(key => {
    if (allowedKeys.includes(key)) {
      dbPayload[key] = config[key];
    }
  });

  // Garantindo compatibilidade mínima de campos obrigatórios não nulos para campeonatos live
  if (!isTrial) {
    if (!dbPayload.products) dbPayload.products = {};
    if (!dbPayload.config) dbPayload.config = {};
  } else {
    if (!dbPayload.config) dbPayload.config = {};
  }

  // --- CENTRALIZAÇÃO SOBERANA NO MOMENTO DE CRIAÇÃO NO BANCO ---
  // Unificação de todas as chaves imutáveis do Round 0 de config para general_settings
  // e remoção física definitiva das colunas redundantes do config para evitar qualquer duplicidade no banco.
  if (!dbPayload.general_settings) {
    dbPayload.general_settings = {};
  } else if (typeof dbPayload.general_settings === 'string') {
    try {
      dbPayload.general_settings = JSON.parse(dbPayload.general_settings);
    } catch {
      dbPayload.general_settings = {};
    }
  }

  if (dbPayload.config && typeof dbPayload.config === 'object') {
    const cleanConfigObj = { ...dbPayload.config };

    const keysToClean = [
      'caixa_inicial', 'capital_social', 'land_value', 'building_value', 'building_age', 
      'building_mode', 'taxes_initial', 'clients_initial', 'suppliers_initial', 
      'dividends_initial', 'financial_investments', 'wip_stock_value', 'custom_pecld_val', 
      'storage_mp', 'storage_finished', 'monthly_rent_value', 'rent_allocation_productive', 
      'rent_allocation_administrative', 'rent_allocation_sales', 'machines_depreciation_rate', 
      'buildings_depreciation_rate', 'property_depreciation_rate', 'profit_incorporation_frequency', 
      'dividend_frequency', 'dividend_percent', 'share_price_initial', 'installations_value', 
      'admin_sales_installations', 'real_estate_acquisition_funding', 'segmentName', 
      'tournamentName', 'tutorName', 'institutionName', 'inventories', 'gazeta_mode', 
      'transparency_level', 'round_duration', 'activity_type', 'botsCount', 'teamNames', 
      'humanTeamsCount', 'total_rounds', 'regions', 'region_configs', 'region_names', 'currency', 'sales_mode',
      'scenario_type', 'social_charges', 'compulsory_loan_agio', 'machines', 'workforce',
      'remaining_ms_at_pause', 'accounting_template_id', 'initial_share_price', 
      'initial_stock_quantities', 'initial_machines', 'initial_financials'
    ];

    keysToClean.forEach(key => {
      if (cleanConfigObj[key] !== undefined && cleanConfigObj[key] !== null) {
        dbPayload.general_settings[key] = cleanConfigObj[key];
        delete cleanConfigObj[key];
      }
    });

    dbPayload.config = cleanConfigObj;
  }

  const { data: champ, error: champError } = await supabase.from(champTable).insert(dbPayload).select().single();
  if (champError) throw champError;
  
  const financials = config.initial_financials || INITIAL_FINANCIAL_TREE;
  const balanceSheet = financials.balance_sheet;

  const findAccount = (nodes: AccountNode[], id: string): AccountNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findAccount(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const totalAssets = findAccount(balanceSheet, 'assets')?.value || 9493163.54;
  const equity = findAccount(balanceSheet, 'equity')?.value || 7252171.74;
  const stockValue = findAccount(balanceSheet, 'assets.current.stock')?.value || 1407000.00;
  const fixedAssetsValue = findAccount(balanceSheet, 'assets.noncurrent.fixed')?.value || 6012500.00;
  const currentCash = findAccount(balanceSheet, 'assets.current.cash')?.value || 0;
  
  const buildingsDeprec = findAccount(balanceSheet, 'assets.noncurrent.fixed.buildings_deprec')?.value || 0;
  const machinesDeprec = findAccount(balanceSheet, 'assets.noncurrent.fixed.machines_deprec')?.value || 0;
  const totalDepreciation = Math.abs(buildingsDeprec) + Math.abs(machinesDeprec);

  const isZeroMode = config.starting_mode === 'start_from_zero' || currentCash === 0;
  const isBaseMode = config.starting_mode === 'start_with_base';

  const dreNodes = financials.dre || [];
  const cashFlowNodes = financials.cash_flow || [];

  // EBITDA dinâmico com base no resultado operacional e manutenção do período anterior
  const opProfit = findAccountValue(dreNodes, 'operating_profit');
  const dDeprec = findAccountValue(cashFlowNodes, 'cf.outflow.maintenance') || (isZeroMode ? 0 : 146402.50);
  const ebitda = isZeroMode ? 0 : (opProfit > 0 ? (opProfit + dDeprec) : 208387.77);

  const capexManut = isZeroMode ? 0 : 50000;
  const jurosPagos = isZeroMode ? 0 : 2500;
  const impostosPagos = isZeroMode ? 0 : (findAccountValue(balanceSheet, 'liabilities.current.taxes') || 14871);
  const fcoLivre = isZeroMode ? 0 : (ebitda - capexManut - jurosPagos - impostosPagos);

  const passivoCirculante = findAccountValue(balanceSheet, 'liabilities.current') || (isZeroMode ? 0 : 2240991.80);
  const despesasOperacionais = findAccountValue(dreNodes, 'opex') || (isZeroMode ? 0 : 1149623.86);
  const receitaLiquida = findAccountValue(dreNodes, 'rev') || (isZeroMode ? 0 : 4184440.05);

  const custoMedioDivida = passivoCirculante > 0 ? (jurosPagos / passivoCirculante) : 0;
  const alavancagemEfetiva = ebitda > 0 ? (passivoCirculante / ebitda) : 0;
  const dividaLiquida = Math.max(0, passivoCirculante - currentCash);
  const passivoLongoPrazo = findAccountValue(balanceSheet, 'liabilities.longterm');
  const passivoTotal = passivoCirculante + passivoLongoPrazo;

  // Initial KPIs for Round 0 (Individualized)
  const initialKpis = {
    statements: financials,
    machines: isZeroMode ? [] : (config.initial_machines || INITIAL_MACHINES_R0),
    current_cash: currentCash,
    stock_quantities: isZeroMode ? { mp_a: 0, mp_b: 0, finished_goods: 0 } : (config.initial_stock_quantities || { mp_a: 30150, mp_b: 20100, finished_goods: 0 }),
    equity: equity,
    total_assets: totalAssets,
    stock_value: stockValue,
    fixed_assets_value: fixedAssetsValue,
    fixed_assets_depreciation: totalDepreciation,
    rating: 'AAA',
    last_price: config.initial_share_price || 425,
    share_price: config.initial_share_price || 425,
    last_units_sold: 0,
    ebitda: ebitda, 
    tsr: 0,
    ccc: 0,
    interest_coverage: isZeroMode ? 100 : (jurosPagos > 0 ? (ebitda / jurosPagos) : 100),
    nlcdg: 0,
    solvency_score_kanitz: isZeroMode ? 10.0 : 1.5,
    altman_z_score: isZeroMode ? 99.9 : 6.25,
    dcf_valuation: isZeroMode ? 1.0 : 1.7,
    loans: isZeroMode ? [] : (config.initial_loans || [
      { id: 'L-INIT-ST', type: 'normal', amount: isBaseMode ? 500000 : 1372362.00, interest_rate: isBaseMode ? 14.5 : 12.0, term: 1, remaining_rounds: 1 },
      { id: 'L-INIT-LT', type: 'bdi', amount: isBaseMode ? 1000000 : 868629.80, interest_rate: isBaseMode ? 11.5 : 10.0, term: 8, remaining_rounds: 8, grace_period_remaining: 0 }
    ]),
    scissors_effect: 0,
    liquidity_current: isZeroMode ? 99.9 : (passivoCirculante > 0 ? ((totalAssets - fixedAssetsValue) / passivoCirculante) : 99.9),
    solvency_index: isZeroMode ? 99.9 : (passivoTotal > 0 ? (totalAssets / passivoTotal) : 99.9),
    inventory_turnover: 0,
    carbon_footprint: 0,
    avg_receivable_days: isZeroMode ? 0 : 45,
    avg_payable_days: isZeroMode ? 0 : 30,
    // E-SDS inputs
    fco_livre: fcoLivre,
    capex_manutencao: capexManut,
    capex_estrategico: 0,
    juros_pagos: jurosPagos,
    impostos_pagos: impostosPagos,
    passivo_circulante: passivoCirculante,
    despesas_operacionais_projetadas_proxima_rodada: despesasOperacionais,
    receita_liquida: receitaLiquida,
    custo_medio_divida: custoMedioDivida,
    alavancagem_efetiva: alavancagemEfetiva,
    divida_liquida: dividaLiquida,
    receita_recorrente_projetada: 0,
    caixa: currentCash,
    aplicacoes: 0,
    despesas_operacionais_diarias: despesasOperacionais / 30,
    passivo_total: passivoTotal,
    pl: equity,
    percentual_divida_curto_prazo: passivoTotal > 0 ? ((passivoCirculante / passivoTotal) * 100) : 100,
    commitments: {
      receivables: [
        { id: 'clients', label: 'Contas a Receber', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'assets.current.clients')?.value ?? 1407000.00) },
        { id: 'investments', label: 'Aplicações Financeiras', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'assets.current.investments')?.value ?? 0) },
        { id: 'vat_recoverable', label: 'IVA a Recuperar', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'assets.current.vat_recoverable')?.value ?? 0) }
      ],
      payables: [
        { id: 'suppliers', label: 'Fornecedores', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'liabilities.current.suppliers')?.value ?? 717605.00) },
        { id: 'loans_st', label: 'Empréstimos (Curto Prazo)', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'liabilities.current.loans_st')?.value ?? 1372362.00) },
        { id: 'loans_lt', label: 'Empréstimos (Longo Prazo)', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'liabilities.longterm.loans_lt')?.value ?? 868629.80) },
        { id: 'taxes', label: 'Imposto de Renda a Pagar', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'liabilities.current.taxes')?.value ?? 14871.31) },
        { id: 'dividends', label: 'Dividendos a Pagar', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'liabilities.current.dividends')?.value ?? 11153.49) },
        { id: 'ppr', label: 'PPR a Pagar', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'liabilities.current.ppr_payable')?.value ?? 0) },
        { id: 'vat_payable', label: 'IVA a Recolher', value: isZeroMode ? 0 : (findAccount(balanceSheet, 'liabilities.current.vat_payable')?.value ?? 0) },
        { id: 'interests', label: 'JUROS/SPREAD BANCÁRIO', value: isZeroMode ? 0 : (Math.abs(findAccountValue(dreNodes, 'fin.exp')) || jurosPagos) }
      ]
    }
  };

  // Calculate initial E-SDS for P0
  const p0Esds = await calculateESDS(0, config.branch || 'industrial', initialKpis, []);
  if (p0Esds) {
    (initialKpis as any).esds = p0Esds;
  }

  const teamsWithChamp = teams.map(t => ({ ...t, championship_id: champ.id, kpis: initialKpis, equity: initialKpis.equity }));
  const { data: createdTeams, error: teamsError } = await supabase.from(teamsTable).insert(teamsWithChamp).select();
  if (teamsError) throw teamsError;
  
  // Insert Round 0 into history for each team (Individualized)
  const historyEntries = (createdTeams || []).map(t => {
    const kpisPayload = {
      ...initialKpis,
      esds: p0Esds || (initialKpis as any).esds || {
        esds_display: 78,
        zone: 'Verde',
        gargalo_principal: 'Nenhum',
        gemini_insights: 'Empresa em perfeito equilíbrio contábil inicial. Ativos estruturados.',
        top_gargalos: [],
        main_drivers: []
      },
      total_receivables: initialKpis.commitments?.receivables?.reduce((sum: number, r: any) => sum + r.value, 0) || 0,
      total_payables: initialKpis.commitments?.payables?.reduce((sum: number, p: any) => sum + p.value, 0) || 0,
      supplier_interest_expenses: 0,
      emergency_purchase_expenses: 0,
      emergency_units_total: 0
    };

    return {
      team_id: t.id,
      championship_id: champ.id,
      round: 0,
      state: {}, 
      kpis: kpisPayload,
      equity: initialKpis.equity || 0,
      revenue: 0,
      net_profit: 0,
      market_share: 0
    };
  });
  
  const { error: historyError } = await supabase.from(historyTable).insert(historyEntries);
  if (historyError) {
    console.error(`[ERRO CRÍTICO SUPABASE] Falha ao inserir o histórico contábil de Abertura (R-0) em ${historyTable}:`, historyError);
    throw new Error(`[ERRO BANCO DE DADOS] Não foi possível persistir o estado contábil inicial (R-0) para as equipes: ${historyError.message}`);
  }
  
  return champ;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('user_profiles').select('*');
  return data || [];
};

export const updateEcosystem = async (id: string, data: any, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  const table = isTrialSession ? 'trial_championships' : 'championships';

  const realCols = [
    'name', 'branch', 'status', 'current_round', 'total_rounds', 'config',
    'initial_financials', 'general_settings', 'tutor_id',
    'deadline_value', 'deadline_unit', 'description', 'gazeta_mode', 'transparency_level',
    'observers', 'round_started_at', 'is_public', 'ecosystem_config',
    'is_trial', 'starting_mode',
    'products', 'resources', 'team_fee', 'start_date', 'end_date', 'sector', 'master_key_enabled', 'kpis'
  ];

  // Buscamos a configuração existente para fazer o merge correto
  const { data: currentChamp } = await supabase
    .from(table)
    .select('config, general_settings')
    .eq('id', id)
    .maybeSingle();

  let existingConfig = currentChamp?.config || {};
  if (typeof existingConfig === 'string') {
    try {
      existingConfig = JSON.parse(existingConfig);
    } catch (e) {
      existingConfig = {};
    }
  }

  let existingGenSettings = currentChamp?.general_settings || {};
  if (typeof existingGenSettings === 'string') {
    try {
      existingGenSettings = JSON.parse(existingGenSettings);
    } catch (e) {
      existingGenSettings = {};
    }
  } else {
    existingGenSettings = { ...existingGenSettings };
  }

  const finalPayload: any = {};
  const newConfig = { ...existingConfig };
  const newGenSettings = { ...existingGenSettings };

  Object.keys(data).forEach(key => {
    if (realCols.includes(key)) {
      if (key === 'config') {
        Object.assign(newConfig, data[key]);
      } else if (key === 'general_settings') {
        Object.assign(newGenSettings, data[key]);
      } else {
        finalPayload[key] = data[key];
      }
    } else {
      // Campos virtuais de transporte (como round_rules, region_configs, etc.) vão para dentro do JSONB config
      newConfig[key] = data[key];
    }
  });

  // Higienização fiduciária: remove chaves que correspondem a colunas reais para evitar redundâncias no banco
  realCols.forEach(col => {
    if (col !== 'config') {
      delete newConfig[col];
    }
  });

  // Centralização Soberana: Migra e limpa chaves imutáveis do Round 0 de config para general_settings
  const keysToClean = [
    'caixa_inicial', 'capital_social', 'land_value', 'building_value', 'building_age', 
    'building_mode', 'taxes_initial', 'clients_initial', 'suppliers_initial', 
    'dividends_initial', 'financial_investments', 'wip_stock_value', 'custom_pecld_val', 
    'storage_mp', 'storage_finished', 'monthly_rent_value', 'rent_allocation_productive', 
    'rent_allocation_administrative', 'rent_allocation_sales', 'machines_depreciation_rate', 
    'buildings_depreciation_rate', 'property_depreciation_rate', 'profit_incorporation_frequency', 
    'dividend_frequency', 'dividend_percent', 'share_price_initial', 'installations_value', 
    'admin_sales_installations', 'real_estate_acquisition_funding', 'segmentName', 
    'tournamentName', 'tutorName', 'institutionName', 'inventories', 'gazeta_mode', 
    'transparency_level', 'round_duration', 'activity_type', 'botsCount', 'teamNames', 
    'humanTeamsCount', 'total_rounds', 'regions', 'region_configs', 'region_names', 'currency', 'sales_mode',
    'scenario_type', 'social_charges', 'compulsory_loan_agio', 'machines', 'workforce',
    'remaining_ms_at_pause', 'accounting_template_id', 'initial_share_price', 
    'initial_stock_quantities', 'initial_machines', 'initial_financials'
  ];

  keysToClean.forEach(key => {
    if (newConfig[key] !== undefined && newConfig[key] !== null) {
      newGenSettings[key] = newConfig[key];
      delete newConfig[key];
    }
  });

  finalPayload.config = newConfig;
  finalPayload.general_settings = newGenSettings;

  return await supabase.from(table).update(finalPayload).eq('id', id);
};

export const updatePageContent = async (slug: string, lang: string, content: any) => {
  const { data: existing } = await supabase.from('site_content').select('id').eq('page_slug', slug).eq('locale', lang).maybeSingle();
  if (existing) {
    return await supabase.from('site_content').update({ content }).eq('id', existing.id);
  }
  return await supabase.from('site_content').insert({ page_slug: slug, locale: lang, content });
};

export const fetchPageContent = async (slug: string, lang: string) => {
  const { data } = await supabase.from('site_content').select('content').eq('page_slug', slug).eq('locale', lang).maybeSingle();
  return data?.content;
};

export const getPublicReports = async (champId: string, round: number, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  const table = isTrialSession ? 'trial_companies' : 'companies';
  const res = await supabase.from(table).select('*').eq('championship_id', champId).eq('round', round);
  if (res.data) {
    res.data = res.data.map(mapHistoryItemSynthetically);
  }
  return res;
};

export const submitCommunityVote = async (voteData: any) => {
  return await supabase.from('community_votes').insert(voteData);
};

export const getModalities = async (): Promise<Modality[]> => {
  const { data } = await supabase.from('modalities').select('*');
  return data || [];
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase.channel('modalities-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, callback).subscribe();
};

export const getGlobalLeaderboard = async () => {
  return [];
};

export const getAvailableBadges = async () => {
  const { data } = await supabase.from('badges').select('*');
  return data || [];
};

export const getUserBadges = async (userId: string) => {
  const { data } = await supabase.from('user_badges').select('*').eq('user_id', userId);
  return data || [];
};

export const fetchBlogPosts = async (query?: string) => {
  let q = supabase.from('blog_posts').select('*');
  if (query) {
    q = q.ilike('question', `%${query}%`);
  }
  return await q;
};

export const getTeamAuditLog = async (teamId: string, round: number) => {
  const { data } = await supabase.from('audit_logs').select('*').eq('team_id', teamId).eq('round', round);
  return data || [];
};

export const getSystemSecret = async (name: string): Promise<string | null> => {
  const { data } = await supabase
    .from('system_secrets')
    .select('key_value')
    .eq('key_name', name)
    .maybeSingle();
  return data?.key_value || null;
};

export const processRoundTurnover = async (id: string, round: number, isTrial?: boolean) => {
    const nextRound = round + 1;
    try {
        const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
        const champTable = isTrialSession ? 'trial_championships' : 'championships';
        const teamsTable = isTrialSession ? 'trial_teams' : 'teams';
        const decisionsTable = isTrialSession ? 'trial_decisions' : 'current_decisions';
        const historyTable = isTrialSession ? 'trial_companies' : 'companies';

        let { data: rawChamp } = await supabase.from(champTable).select('*').eq('id', id).single();
        if (!rawChamp) throw new Error("Arena não encontrada.");
        const champ = mapChampionshipSynthetically(rawChamp);
        const { data: teams } = await supabase.from(teamsTable).select('*').eq('championship_id', id);

        const maxRounds = champ.total_rounds || 6;
        if (champ.current_round >= maxRounds) {
            throw new Error(`BLOQUEIO DE SEGURANÇA: Esta arena já atingiu o final do torneio (${maxRounds} "rounds" planejados). Não é permitido efetuar turnovers adicionais.`);
        }

        // v2026.161: Saneamento preventivo e eliminação de duplicidades decorrentes de re-tentativas de turnovers parciais falhos.
        // Se este turnover falhou ou foi interrompido no meio do loop em execuções anteriores, limpamos todos os registros de resultado contábil
        // do 'nextRound' para esta arena de forma a garantir que os novos cálculos usem um histórico limpo e livre de qualquer auto-interferência.
        const { error: prepCleanupErr } = await supabase
            .from(historyTable)
            .delete()
            .eq('championship_id', id)
            .eq('round', nextRound);

        if (prepCleanupErr) {
            console.warn(`[PRE-LIMPEZA CONVENÇÃO] Falha ao executar limpeza prévia de resultados para o round ${nextRound} em ${historyTable}:`, prepCleanupErr.message);
        }

        // Get indicators for the round being processed (Round 1, 2, etc.)
        const currentRules = champ.round_rules?.[nextRound] || 
                             champ.config?.round_rules?.[nextRound] || 
                             champ.config?.DEFAULT_INDUSTRIAL_CHRONOGRAM?.[nextRound] || 
                             DEFAULT_INDUSTRIAL_CHRONOGRAM[nextRound] || 
                             champ.general_settings || {};

        // Unificação Polimórfica e Higienização de Parâmetros de general_settings conforme orientações do PO
        const rawGen = champ.general_settings || {};
        
        // 1. Unificação de preços MP_A e MP_B
        const ecoMpaVal = rawGen.mpa_unit_val ?? rawGen.prices?.mpa_unit_val ?? rawGen.prices?.mp_a;
        const ecoMpbVal = rawGen.mpb_unit_val ?? rawGen.prices?.mpb_unit_val ?? rawGen.prices?.mp_b;
        
        // 2. Unificação de salário base
        const ecoBaseSalary = rawGen.workforce?.base_salary ?? rawGen.workforce?.baseSalary ?? rawGen.hr_base?.salary;

        // 3. Unificação de turnos e carga horária
        const ecoMaxShifts = currentRules.max_shifts ?? currentRules.workforce?.max_shifts ?? rawGen.max_shifts ?? rawGen.workforce?.max_shifts ?? DEFAULT_MACRO.max_shifts;
        const ecoProdHours = currentRules.production_hours_period ?? currentRules.workforce?.production_hours_period ?? rawGen.production_hours_period ?? rawGen.workforce?.production_hours_period ?? DEFAULT_MACRO.production_hours_period;

        // 4. Unificação de staffing para a rodada
        const ecoAdminCount = currentRules.workforce?.admin_count ?? currentRules.staffing?.admin?.count ?? rawGen.workforce?.admin_count ?? rawGen.staffing?.admin?.count ?? DEFAULT_MACRO.staffing.admin.count;
        const ecoSalesCount = currentRules.workforce?.sales_count ?? currentRules.staffing?.sales?.count ?? rawGen.workforce?.sales_count ?? rawGen.staffing?.sales?.count ?? DEFAULT_MACRO.staffing.sales.count;
        const ecoSalaryMult = currentRules.workforce?.salary_multiplier ?? currentRules.staffing?.admin?.salaries ?? rawGen.workforce?.salary_multiplier ?? rawGen.staffing?.admin?.salaries ?? DEFAULT_MACRO.staffing.admin.salaries;

        const indicatorsForRound = {
            ...DEFAULT_MACRO,
            ...(champ.general_settings || {}),
            ...currentRules,
            max_shifts: Number(ecoMaxShifts),
            production_hours_period: Number(ecoProdHours),
            workforce: {
                ...(champ.general_settings?.workforce || {}),
                ...(currentRules.workforce || {}),
                max_shifts: Number(ecoMaxShifts),
                production_hours_period: Number(ecoProdHours)
            },
            prices: {
                ...DEFAULT_MACRO.prices,
                ...(champ.general_settings?.prices || {}),
                ...(ecoMpaVal !== undefined ? { mp_a: Number(ecoMpaVal) } : {}),
                ...(ecoMpbVal !== undefined ? { mp_b: Number(ecoMpbVal) } : {}),
                ...(currentRules.prices || {})
            },
            hr_base: {
                ...DEFAULT_MACRO.hr_base,
                ...(champ.general_settings?.hr_base || {}),
                ...(ecoBaseSalary !== undefined ? { salary: Number(ecoBaseSalary) } : {}),
                ...(currentRules.hr_base || {})
            },
            machinery_values: {
                ...DEFAULT_MACRO.machinery_values,
                ...(champ.general_settings?.machinery_values || {}),
                ...(currentRules.machinery_values || {})
            },
            machine_specs: {
                alpha: {
                    ...DEFAULT_MACRO.machine_specs.alpha,
                    ...(champ.general_settings?.machine_specs?.alpha || {}),
                    ...(currentRules.machine_specs?.alpha || {})
                },
                beta: {
                    ...DEFAULT_MACRO.machine_specs.beta,
                    ...(champ.general_settings?.machine_specs?.beta || {}),
                    ...(currentRules.machine_specs?.beta || {})
                },
                gamma: {
                    ...DEFAULT_MACRO.machine_specs.gamma,
                    ...(champ.general_settings?.machine_specs?.gamma || {}),
                    ...(currentRules.machine_specs?.gamma || {})
                }
            },
            exchange_rates: {
                BRL: currentRules.BRL !== undefined ? Number(currentRules.BRL) : (champ.general_settings?.exchange_rates?.BRL ?? champ.general_settings?.BRL ?? 1.0),
                USD: currentRules.USD !== undefined ? Number(currentRules.USD) : (champ.general_settings?.exchange_rates?.USD ?? champ.general_settings?.USD ?? 1.0),
                EUR: currentRules.EUR !== undefined ? Number(currentRules.EUR) : (champ.general_settings?.exchange_rates?.EUR ?? champ.general_settings?.EUR ?? 1.0),
                GBP: currentRules.GBP !== undefined ? Number(currentRules.GBP) : (champ.general_settings?.exchange_rates?.GBP ?? champ.general_settings?.GBP ?? 1.0),
                CNY: currentRules.CNY !== undefined ? Number(currentRules.CNY) : (champ.general_settings?.exchange_rates?.CNY ?? champ.general_settings?.CNY ?? 1.0),
                BTC: currentRules.BTC !== undefined ? Number(currentRules.BTC) : (champ.general_settings?.exchange_rates?.BTC ?? champ.general_settings?.BTC ?? 1.0),
                ...(currentRules.exchange_rates || {})
            },
            staffing: {
                ...DEFAULT_MACRO.staffing,
                ...(champ.general_settings?.staffing || {}),
                ...(currentRules.staffing || {}),
                admin: {
                    count: Number(ecoAdminCount),
                    salaries: Number(ecoSalaryMult)
                },
                sales: {
                    count: Number(ecoSalesCount),
                    salaries: Number(ecoSalaryMult)
                }
            }
        };

        // v2026.188: Definição fiduciária unificada de regiões ativas na rodada sob Turnover
        let activeRegionConfigs: any[] = champ.round_rules?.[nextRound]?.regions || 
                                         champ.round_rules?.[nextRound]?.region_configs || 
                                         champ.config?.regions || 
                                         champ.config?.region_configs || 
                                         champ.region_configs || [];
        if (!activeRegionConfigs || activeRegionConfigs.length === 0) {
            const regCount = champ.regions_count || 1;
            activeRegionConfigs = Array.from({ length: regCount }, (_, i) => ({
                id: i + 1,
                name: `Região ${i + 1}`,
                currency: 'BRL',
                demand_weight: 100 / regCount,
                suggested_price: indicatorsForRound.avg_selling_price || 425,
                distribution_cost: 50,
                marketing_cost: 10000
            }));
        }
        // Filtrar apenas as regiões vigentes na rodada correspondente (nextRound)
        activeRegionConfigs = activeRegionConfigs.filter((r: any) => !r.start_round || r.start_round <= nextRound);

        const teamResults: any[] = [];
        const marketDecisions: Record<string, any> = {};

        // 1. Coletar todas as decisões e gerar para bots ou carregar carry-forward sanitizado para humanos ausentes (timeout de timer)
        for (const team of (teams || [])) {
            const { data: dec } = await supabase.from(decisionsTable).select('*').eq('team_id', team.id).eq('round', nextRound).maybeSingle();
            let finalDecision = dec?.data;
            
            // Controle fiduciário de W.O. (Walkover)
            const prevKpis = team.kpis || {};
            let isWO = !!prevKpis.is_wo || team.status === 'wo_eliminated';
            let consecutiveMisses = prevKpis.consecutive_no_submissions !== undefined ? Number(prevKpis.consecutive_no_submissions) : 0;
            let decisionOrigin: 'equipe' | 'sistema' | 'bloqueada' = 'equipe';

            if (!team.is_bot) {
              if (finalDecision) {
                // A equipe enviou a decisão ativamente em tempo hábil
                consecutiveMisses = 0;
                isWO = false;
                decisionOrigin = 'equipe';
                
                // Atualiza o registro para garantir o status da decisão como equipe
                finalDecision = { ...finalDecision, decision_status: 'equipe' };
                await supabase.from(decisionsTable).update({ data: finalDecision }).eq('id', dec.id);
              } else {
                // A equipe NÃO enviou a decisão (omissão ou desqualificação por W.O.)
                consecutiveMisses += 1;
                
                if (isWO || consecutiveMisses > MAX_CONSECUTIVE_MISSES) {
                  // Já estava em W.O. ou acabou de estourar a tolerância fiduciária configurada
                  isWO = true;
                  decisionOrigin = 'bloqueada';
                  
                  // Decisão vazia e bloqueada (Insolvência Assistida)
                  finalDecision = {
                    judicial_recovery: false,
                    regions: {},
                    hr: { hired: 0, fired: 0, salary: indicatorsForRound.min_salary || indicatorsForRound.hr_base?.salary || 2500, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0 },
                    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 0, extraProductionPercent: 0, rd_investment: 0, term_interest_rate: 0.00 },
                    machinery: { buy: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 }, sell: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 }, sell_ids: [] },
                    finance: { loanRequest: 0, loanTerm: 0, application: 0 },
                    estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 },
                    decision_status: 'bloqueada'
                  };
                } else {
                  // Primeiro miss - dentro do limite de tolerância (duplicada pelo sistema de forma automática)
                  decisionOrigin = 'sistema';
                  let baseDecisions: any = null;
                  
                  if (round >= 1) {
                    const { data: prevDec } = await supabase
                      .from(decisionsTable)
                      .select('*')
                      .eq('team_id', team.id)
                      .eq('round', round)
                      .maybeSingle();
                    if (prevDec?.data) {
                      baseDecisions = JSON.parse(JSON.stringify(prevDec.data));
                      
                      // Sanitizar Maquinário (CAPEX): Zera compras e vendas pontuais, e esvazia ids marcados para venda
                      baseDecisions.machinery = {
                        buy: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 },
                        sell: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 },
                        sell_ids: []
                      };
                      
                      // Sanitizar Recursos Humanos: Zera novas contratações e demissões espontâneas
                      if (baseDecisions.hr) {
                        baseDecisions.hr.hired = 0;
                        baseDecisions.hr.fired = 0;
                      }
                      
                      // Sanitizar Finanças: Zera solicitações de empréstimos táticos / aplicações
                      if (baseDecisions.finance) {
                        baseDecisions.finance.loanRequest = 0;
                        baseDecisions.finance.loanTerm = 0;
                        baseDecisions.finance.application = 0;
                      }
                      
                      // Sanitizar Estimativas do Oráculo
                      if (baseDecisions.estimates) {
                        baseDecisions.estimates.forecasted_unit_cost = 0;
                        baseDecisions.estimates.forecasted_revenue = 0;
                        baseDecisions.estimates.forecasted_net_profit = 0;
                      }
                    }
                  }

                  if (!baseDecisions) {
                    const initialRegions: any = {};
                    activeRegionConfigs.forEach((regionConf: any) => {
                      const rId = regionConf.id;
                      const defaultSugPrice = regionConf?.suggested_price !== undefined ? Number(regionConf.suggested_price) : 425;
                      initialRegions[rId] = { price: defaultSugPrice, term: 0, marketing: 0 };
                    });

                    baseDecisions = {
                      judicial_recovery: false,
                      regions: initialRegions,
                      hr: { hired: 0, fired: 0, salary: indicatorsForRound.min_salary || indicatorsForRound.hr_base?.salary || 2500, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0 },
                      production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 100, extraProductionPercent: 0, rd_investment: 0, term_interest_rate: 0.00 },
                      machinery: { buy: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 }, sell: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 }, sell_ids: [] },
                      finance: { loanRequest: 0, loanTerm: 0, application: 0 },
                      estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 }
                    };
                  }

                  finalDecision = { ...baseDecisions, decision_status: 'sistema' };
                }

                // Salva a decisão simulada no banco de dados para auditoria posterior das equipes e fidedignidade contábil
                const { error: insertDecErr } = await supabase.from(decisionsTable).insert({
                  team_id: team.id,
                  championship_id: id,
                  round: nextRound,
                  data: finalDecision
                });

                if (insertDecErr) {
                  console.error(`Erro ao inserir decisão de carry-forward fiduciário para ${team.name}:`, insertDecErr);
                  throw new Error(`[ERRO BANCO DE DADOS] Falha ao registrar decisão automática para ${team.name} em ${decisionsTable}: ${insertDecErr.message}`);
                }
              }
            }

            // Atualiza localmente os metadados na equipe de modo que o cálculo concorrencial herde o W.O. imediatamente
            team.kpis = {
              ...prevKpis,
              is_wo: isWO,
              consecutive_no_submissions: consecutiveMisses,
              decision_status: decisionOrigin
            };
            if (isWO) {
              team.status = 'wo_eliminated';
            }

            if (team.is_bot && !finalDecision) {
              // Buscar KPIs atuais do BOT para decisão contextualizada
              const { data: lastHistory } = await supabase
                .from(historyTable)
                .select('kpis')
                .eq('team_id', team.id)
                .order('round', { ascending: false })
                .limit(1)
                .maybeSingle();

              finalDecision = await generateBotDecision(
                champ.branch, 
                nextRound, 
                activeRegionConfigs.length, 
                indicatorsForRound, 
                team.name, 
                team.strategic_profile,
                lastHistory?.kpis
              );
              const { error: botDecErr } = await supabase.from(decisionsTable).insert({
                team_id: team.id,
                championship_id: id,
                round: nextRound,
                data: finalDecision
              });
              if (botDecErr) {
                console.error(`Erro ao inserir decisão para o bot ${team.name}:`, botDecErr);
                throw new Error(`[ERRO BANCO DE DADOS] Falha ao registrar decisão automática do Bot ${team.name} em ${decisionsTable}: ${botDecErr.message}`);
              }
            }
            marketDecisions[team.id] = finalDecision;
        }

        // 2. Calcular Médias de Mercado (Preço e Marketing) para Market Share Competitivo
        const validDecisions = Object.values(marketDecisions).filter(d => !!d);
        const avgPrice = validDecisions.length > 0 
          ? validDecisions.reduce((acc, d) => acc + (Object.values(d.regions || {})[0] as any)?.price || 0, 0) / validDecisions.length 
          : indicatorsForRound.avg_selling_price;
        
        const totalMarketing = validDecisions.reduce((acc, d) => acc + (Object.values(d.regions || {})[0] as any)?.marketing || 0, 0);
        const avgMarketing = validDecisions.length > 0 ? totalMarketing / validDecisions.length : 0;

        // --- MODELO CONCORRENCIAL MULTIRREGIONAL DE MARKET SHARE (v19.5 Sapphire) ---
        // 2.1 Configuração de Regiões do Campeonato (Alinhado com as regiões ativas na rodada)
        const regionConfigs: RegionConfig[] = activeRegionConfigs;

        // 2.2 Passo Inicial (Standalone): Coletar Capacidades e Scores Competitivos Regionais de cada Equipe
        const teamCapacities: Record<string, number> = {};
        const teamRegionScores: Record<string, Record<string, number>> = {};

        for (const team of (teams || [])) {
            const finalDecision = marketDecisions[team.id];
            if (finalDecision) {
                const ecoWithCurrency = { starting_mode: champ.starting_mode, ...(champ.config || {}), currency: champ.currency } as EcosystemConfig;
                const res = calculateProjections(finalDecision, champ.branch, ecoWithCurrency, indicatorsForRound, team, [], nextRound, champ.round_rules);
                if (res && res.kpis) {
                    res.kpis.is_wo = team.kpis?.is_wo || false;
                    res.kpis.consecutive_no_submissions = team.kpis?.consecutive_no_submissions || 0;
                    res.kpis.decision_status = team.kpis?.decision_status || 'equipe';
                }
                
                // Obter Turnos e multiplicador
                const selectedShifts = finalDecision?.production?.shifts ?? 1;
                const capMult = selectedShifts === 2 ? 1.8 : selectedShifts === 3 ? 2.3 : 1.0;
                const teamMachines = res.kpis?.machines || [];
                const capacity = teamMachines.reduce((acc: number, m: any) => {
                    const normModel = (m.model as string) === 'alfa' ? 'alpha' : (m.model as string) === 'gama' ? 'gamma' : m.model;
                    return acc + (indicatorsForRound.machine_specs[normModel as 'alpha' | 'beta' | 'gamma']?.production_capacity || 0);
                }, 0) * capMult;

                teamCapacities[team.id] = capacity;

                // Calcular score competitivo da equipe para cada região base
                teamRegionScores[team.id] = {};
                regionConfigs.forEach((r: any) => {
                    const regIdStr = r.id.toString();
                    const reg = finalDecision.regions?.[regIdStr] || finalDecision.regions?.[r.id] || {};

                    const baseSuggestedPrice = r.suggested_price !== undefined ? Number(r.suggested_price) : (indicatorsForRound.avg_selling_price || 425);
                    const regPrice = reg.price > 0 ? reg.price : baseSuggestedPrice;
                    const regMarketing = reg.marketing || 0;
                    const regTerm = reg.term || 0;

                    const isRJ = finalDecision.judicial_recovery === true;
                    const rjDemandPenalty = isRJ ? 0.85 : 1.0;

                    const priceIndex = regPrice > 0 ? (baseSuggestedPrice / regPrice) : 1;
                    const marketingIndex = 1 + (regMarketing * 0.08);
                    const termIndex = 1 + (regTerm * 0.05);

                    teamRegionScores[team.id][regIdStr] = priceIndex * marketingIndex * termIndex * rjDemandPenalty;
                });
            }
        }

        // 2.3 Calcular Capacidade Total da Indústria e Demanda das Regiões
        const isZeroMode = champ.starting_mode === 'start_from_zero' || champ.config?.starting_mode === 'start_from_zero';
        const totalCapacityAllTeamsRaw = Object.values(teamCapacities).reduce((sum, cap) => sum + cap, 0);
        const nominalTeamCapacity = 10000;
        // No modo START FROM ZERO, se ainda não há capacidade real instalada (por exemplo, no Round 0),
        // a capacidade global deve ser 0 em vez de forçar o fallback para capacidade nominal de 10.000 un por equipe.
        const totalCapacityAllTeams = isZeroMode
            ? totalCapacityAllTeamsRaw
            : (totalCapacityAllTeamsRaw > 0 ? totalCapacityAllTeamsRaw : (nominalTeamCapacity * (teams || []).length));

        const regionalDemands: Record<string, number> = {};
        let totalMarketDemandRound = 0;

        regionConfigs.forEach((r: any) => {
            const demandWeight = Number(r.demand_weight || r.weight || 0);
            const baseRegDemand = totalCapacityAllTeams * (demandWeight / 100);
            const varPercent = indicatorsForRound.demand_variation !== undefined ? Number(indicatorsForRound.demand_variation) : 0;
            const regDemand = Math.floor(baseRegDemand * (1 + (varPercent / 100)));
            regionalDemands[r.id.toString()] = regDemand;
            totalMarketDemandRound += regDemand;
        });

        // Só aplica o fallback para 40000 se não estiver no modo START FROM ZERO
        if (totalMarketDemandRound === 0 && !isZeroMode) {
            totalMarketDemandRound = 40000;
        }

        // 2.4 Alocar a Demanda das Regiões e Calcular os Market Shares Finais de cada Equipe
        const competitiveDemandsPerTeamReg: Record<string, Record<string, number>> = {};
        const teamOverallMarketShares: Record<string, number> = {};

        for (const team of (teams || [])) {
            competitiveDemandsPerTeamReg[team.id] = {};
            teamOverallMarketShares[team.id] = 0;
        }

        regionConfigs.forEach((r: any) => {
            const regIdStr = r.id.toString();
            const regDemand = regionalDemands[regIdStr] || 0;

            const scoresWithTeams = (teams || []).map(team => ({
                teamId: team.id,
                score: teamRegionScores[team.id]?.[regIdStr] ?? 0
            }));

            const totalScoreReg = scoresWithTeams.reduce((sum, item) => sum + item.score, 0);

            scoresWithTeams.forEach(item => {
                const shareReg = totalScoreReg > 0 ? (item.score / totalScoreReg) : (1 / (teams || []).length);
                const teamCapturedDemand = Math.floor(regDemand * shareReg);
                competitiveDemandsPerTeamReg[item.teamId][regIdStr] = teamCapturedDemand;

                const shareContribution = totalMarketDemandRound > 0 ? (teamCapturedDemand / totalMarketDemandRound) * 100 : 0;
                teamOverallMarketShares[item.teamId] += shareContribution;
            });
        });

        // --- 2.5 SIMULAÇÃO DE ESTOQUE E COBERTURA DE DEMANDA (SPILLOVER CONCORRENCIAL) ---
        // Rodamos uma simulação rápida de primeiro passo para mapear rupturas de estoque por equipe e por região
        const teamQtyAvailable: Record<string, number> = {};
        const unfulfilledDemandPerRegion: Record<string, number> = {};
        const teamRegionVendasR1: Record<string, Record<string, number>> = {};
        const teamRegionRupturaR1: Record<string, Record<string, number>> = {};
        
        regionConfigs.forEach((r: any) => {
            unfulfilledDemandPerRegion[r.id.toString()] = 0;
        });

        for (const team of (teams || [])) {
            const finalDecision = marketDecisions[team.id];
            teamRegionVendasR1[team.id] = {};
            teamRegionRupturaR1[team.id] = {};
            
            if (finalDecision) {
                const teamCompDemands = { ...(competitiveDemandsPerTeamReg[team.id] || {}) };
                const competitiveIndicators = { ...indicatorsForRound, avg_selling_price: avgPrice };
                const ecoWithCurrency = { starting_mode: champ.starting_mode, ...(champ.config || {}), currency: champ.currency } as EcosystemConfig;
                
                const prelimRes = calculateProjections(
                    finalDecision, 
                    champ.branch, 
                    ecoWithCurrency, 
                    competitiveIndicators, 
                    team, 
                    [], 
                    nextRound, 
                    champ.round_rules,
                    teamCompDemands
                );
                if (prelimRes && prelimRes.kpis) {
                    prelimRes.kpis.is_wo = team.kpis?.is_wo || false;
                    prelimRes.kpis.consecutive_no_submissions = team.kpis?.consecutive_no_submissions || 0;
                    prelimRes.kpis.decision_status = team.kpis?.decision_status || 'equipe';
                }
                
                // Mapear vendas e rupturas físicas reais de primeiro passo por região
                regionConfigs.forEach((r: any) => {
                    const regIdStr = r.id.toString();
                    const demand = teamCompDemands[regIdStr] || 0;
                    const sold = prelimRes.kpis?.regional_units_sold?.[regIdStr] ?? 0;
                    const rupture = Math.max(0, demand - sold);
                    
                    teamRegionVendasR1[team.id][regIdStr] = sold;
                    teamRegionRupturaR1[team.id][regIdStr] = rupture;
                    
                    // Somar a demanda não atendida pelo concorrente que ficará órfã na região
                    unfulfilledDemandPerRegion[regIdStr] += rupture;
                });
                
                // Estoque físico remanescente após suprir a demanda inicial captada de R1
                const totalStockAndProduction = (prelimRes.kpis?.stock_quantities?.finished_goods ?? 0) + (prelimRes.kpis?.last_units_sold ?? 0);
                const totalSoldR1 = Object.values(teamRegionVendasR1[team.id]).reduce((sum, v) => sum + v, 0);
                teamQtyAvailable[team.id] = Math.max(0, totalStockAndProduction - totalSoldR1);
            } else {
                teamQtyAvailable[team.id] = 0;
                regionConfigs.forEach((r: any) => {
                    teamRegionVendasR1[team.id][r.id.toString()] = 0;
                    teamRegionRupturaR1[team.id][r.id.toString()] = 0;
                });
            }
        }

        // --- 2.6 REDISTRIBUIÇÃO ATIVA DE DEMANDA ÓRFÃ (SPILLOVER SEGUNDA RODADA) ---
        // Equipes que de fato investiram em fábrica, operários e estoque herdam essa disputa baseado em seus scores
        const finalDemandsWithSpillover: Record<string, Record<string, number>> = {};
        for (const team of (teams || [])) {
            finalDemandsWithSpillover[team.id] = { ...(competitiveDemandsPerTeamReg[team.id] || {}) };
        }

        regionConfigs.forEach((r: any) => {
            const regIdStr = r.id.toString();
            const totalOrphanDemand = unfulfilledDemandPerRegion[regIdStr] || 0;
            
            if (totalOrphanDemand > 0) {
                // Quais concorrentes têm estoque livre sobrando para absorver este spillover na região?
                const eligibleTeams = (teams || []).filter(t => (teamQtyAvailable[t.id] || 0) > 0);
                
                if (eligibleTeams.length > 0) {
                    const totalEligibleScore = eligibleTeams.reduce((sum, t) => sum + (teamRegionScores[t.id]?.[regIdStr] ?? 0), 0);
                    
                    if (totalEligibleScore > 0) {
                        eligibleTeams.forEach((t) => {
                            const scoreTeam = teamRegionScores[t.id]?.[regIdStr] ?? 0;
                            const shareOfSpillover = scoreTeam / totalEligibleScore;
                            
                            // Demanda spillover capturada proporcional ao score concorrencial
                            let teamSpilloverAlloc = Math.floor(totalOrphanDemand * shareOfSpillover);
                            const avail = teamQtyAvailable[t.id] || 0;
                            teamSpilloverAlloc = Math.min(teamSpilloverAlloc, avail);
                            
                            // Adicionar à demanda qualificada final da equipe
                            finalDemandsWithSpillover[t.id][regIdStr] = (finalDemandsWithSpillover[t.id][regIdStr] || 0) + teamSpilloverAlloc;
                            
                            // Deduzir da gordura e estoque remanescente físico
                            teamQtyAvailable[t.id] = Math.max(0, avail - teamSpilloverAlloc);
                        });
                    }
                }
            }
        });

        // 3. Processar cada equipe com o contexto competitivo real (Já recalculado com Spillover)
        for (const team of (teams || [])) {
            const finalDecision = marketDecisions[team.id];

            if (finalDecision) {
                const teamCompDemands = finalDemandsWithSpillover[team.id] || {};
                const competitiveIndicators = { ...indicatorsForRound, avg_selling_price: avgPrice };
                const ecoWithCurrency = { starting_mode: champ.starting_mode, ...(champ.config || {}), currency: champ.currency } as EcosystemConfig;
                const res = calculateProjections(
                    finalDecision, 
                    champ.branch, 
                    ecoWithCurrency, 
                    competitiveIndicators, 
                    team, 
                    [], 
                    nextRound, 
                    champ.round_rules,
                    teamCompDemands
                );
                if (res && res.kpis) {
                    res.kpis.is_wo = team.kpis?.is_wo || false;
                    res.kpis.consecutive_no_submissions = team.kpis?.consecutive_no_submissions || 0;
                    res.kpis.decision_status = team.kpis?.decision_status || 'equipe';
                }
                
                // 3.1 Calcular E-SDS v1.2 via Gemini
                const { data: previousRounds } = await supabase
                  .from(historyTable)
                  .select('*')
                  .eq('team_id', team.id)
                  .order('round', { ascending: false })
                  .limit(3);

                const esdsResult = await calculateESDS(nextRound, champ.branch, res.kpis, previousRounds || []);
                if (esdsResult) {
                  res.kpis.esds = esdsResult;
                }

                // O Market Share conceitual nominal inicial da captação
                const finalTeamMS = teamOverallMarketShares[team.id] || 0;
                res.kpis.market_share_conceptual = finalTeamMS;
                
                // Registramos temporariamente o volume vendido como rawScore para herdar o rateio final real
                const unitsRealSold = res.kpis?.last_units_sold || 0;
                teamResults.push({ team, res, rawScore: unitsRealSold });
            }
        }

        // 4. Normalizar Market Share para somar 100% (com o teto/salvaguarda de arredondamento)
        const totalScore = teamResults.reduce((acc, r) => acc + r.rawScore, 0);
        for (const item of teamResults) {
            const competitiveShare = totalScore > 0 
                ? (item.rawScore / totalScore) * 100 
                : (item.res.kpis.market_share_conceptual || (100 / teams!.length));
            item.res.kpis.market_share = competitiveShare;
            item.res.marketShare = competitiveShare;

            // Bloqueio Rígido de Integridade Contábil (v19.5 Sapphire)
            if (item.res.kpis?.validation?.isValid === false) {
                const checkErrors = item.res.kpis.validation.errors || [];
                throw new Error(`BLOQUEIO DE SEGURANÇA CONTÁBIL (SAPPHIRE): Inconsistência crítica identificada para ${item.team.name}: ${checkErrors.join(' | ')}`);
            }

            const payload = {
                team_id: item.team.id, 
                championship_id: id, 
                round: nextRound, 
                state: marketDecisions[item.team.id], 
                kpis: item.res.kpis, 
                equity: item.res.kpis.equity || 0,
                revenue: item.res.revenue || 0,
                net_profit: item.res.netProfit || 0,
                market_share: Math.round(competitiveShare)
            };

            const { error: insertErr } = await supabase.from(historyTable).insert(payload);

            if (insertErr) {
                // Auditoria forense de tipos para nossa equipe de engenharia e banco de dados
                const suspeitos = Object.entries(payload)
                  .filter(([_, val]) => typeof val === 'number' && !Number.isInteger(val))
                  .map(([key, val]) => `${key}: float(${val})`)
                  .join(' | ');
                
                console.error(`[AUDITORIA ESTRETA SUPABASE] Erro crítico no insert para ${item.team.name}. Suspeitos (Floats):`, suspeitos);
                console.error("Payload completo enviado:", JSON.stringify(payload, null, 2));
                
                throw new Error(
                  `[ERRO HISTÓRICO] Erro Supabase no insert de ${historyTable} para ${item.team.name}.\n` +
                  `Mensagem: ${insertErr.message} (Código: ${insertErr.code || 'N/A'})\n` +
                  `Valores Decimais Suspeitos: [${suspeitos || 'Nenhum'}]\n` +
                  `Payload Compacto para análise: ${JSON.stringify({ 
                     avg_receivable_days: payload.kpis?.avg_receivable_days, 
                     avg_payable_days: payload.kpis?.avg_payable_days, 
                     emergency_units_total: payload.kpis?.emergency_units_total,
                     market_share: payload.market_share 
                  })}`
                );
            }

            const { error: teamUpdateErr } = await supabase.from(teamsTable).update({ 
                equity: item.res.kpis.equity, 
                kpis: item.res.kpis 
            }).eq('id', item.team.id);

            if (teamUpdateErr) {
                console.error(`Erro ao atualizar KPIs para equipe ${item.team.name}:`, teamUpdateErr);
                throw new Error(`[ERRO KPIs] Não foi possível atualizar os KPIs em ${teamsTable} para ${item.team.name}: ${teamUpdateErr.message}`);
            }
        }

        // 5. Preparar indicadores para o PRÓXIMO round (round + 2)
        const nextNextRound = nextRound + 1;
        const nextRules = champ.round_rules?.[nextNextRound] || 
                          champ.config?.round_rules?.[nextNextRound] || 
                          champ.config?.DEFAULT_INDUSTRIAL_CHRONOGRAM?.[nextNextRound] || 
                          DEFAULT_INDUSTRIAL_CHRONOGRAM[nextNextRound] || 
                          indicatorsForRound;
        // Atualiza o preço médio de mercado para o próximo round baseado na realidade deste round
        const nextIndicators = { 
            ...indicatorsForRound, 
            ...nextRules, 
            avg_selling_price: avgPrice,
            prices: {
                ...(indicatorsForRound.prices || {}),
                ...(nextRules.prices || {})
            },
            exchange_rates: {
                ...(indicatorsForRound.exchange_rates || {}),
                BRL: nextRules.BRL !== undefined ? Number(nextRules.BRL) : (indicatorsForRound.exchange_rates?.BRL ?? 1.0),
                USD: nextRules.USD !== undefined ? Number(nextRules.USD) : (indicatorsForRound.exchange_rates?.USD ?? 1.0),
                EUR: nextRules.EUR !== undefined ? Number(nextRules.EUR) : (indicatorsForRound.exchange_rates?.EUR ?? 1.0),
                GBP: nextRules.GBP !== undefined ? Number(nextRules.GBP) : (indicatorsForRound.exchange_rates?.GBP ?? 1.0),
                CNY: nextRules.CNY !== undefined ? Number(nextRules.CNY) : (indicatorsForRound.exchange_rates?.CNY ?? 1.0),
                BTC: nextRules.BTC !== undefined ? Number(nextRules.BTC) : (indicatorsForRound.exchange_rates?.BTC ?? 1.0),
                ...(nextRules.exchange_rates || {})
            },
            staffing: {
                ...(indicatorsForRound.staffing || {}),
                ...(nextRules.staffing || {})
            }
        };

        // v19.59: Limpeza fiduciária de variáveis de pausa ao realizar Turnover de Rodada
        // Se houver regras de região específicas para o round seguinte que agora se torna ativa (nextNextRound),
        // nós as promovemos para a raiz do config para servir de linha de base fluida.
        const nextRoundRegions = champ.round_rules?.[nextNextRound]?.regions || 
                                 champ.round_rules?.[nextNextRound]?.region_configs;
        
        const updatedRoundRules = {
            ...(champ.round_rules || {}),
            // Congela as regiões utilizadas no round que acaba de ser concluído (nextRound)
            [nextRound]: {
                ...(champ.round_rules?.[nextRound] || {}),
                regions: regionConfigs,
                region_configs: regionConfigs.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    currency: r.currency,
                    demand_weight: r.demand_weight,
                    suggested_price: r.suggested_price,
                    distribution_cost: r.distribution_cost,
                    marketing_cost: r.marketing_cost
                }))
            }
        };

        const updatedConfig = {
            ...(champ.config || {}),
            is_paused: false,
            paused_at: null,
            remaining_ms_at_pause: null,
            round_rules: updatedRoundRules, // Salva também dentro de config para redundância perfeita
            ...(nextRoundRegions ? {
                regions: nextRoundRegions,
                region_configs: nextRoundRegions.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    currency: r.currency,
                    demand_weight: r.demand_weight,
                    suggested_price: r.suggested_price,
                    distribution_cost: r.distribution_cost,
                    marketing_cost: r.marketing_cost
                }))
            } : {})
        };

        // Gravação estrita na coluna física 'round_rules' e na coluna 'config'
        const { error: champUpdateErr } = await supabase.from(champTable).update({ 
            current_round: nextRound, 
            general_settings: nextIndicators,
            round_started_at: new Date().toISOString(),
            config: updatedConfig,
            round_rules: updatedRoundRules
        }).eq('id', id);

        if (champUpdateErr) {
            console.error(`Erro crítico ao atualizar campeonato no Supabase:`, champUpdateErr);
            
            // Tratamento didático e estrito para erro de coluna inexistente ou cache de esquema desatualizado
            const isMissingColumn = champUpdateErr.message?.includes('round_rules') || 
                                    champUpdateErr.code === 'PGRST204' || 
                                    champUpdateErr.code === '42703';
            
            if (isMissingColumn) {
                throw new Error(
                    `[ERRO CAMPEONATO - SUPABASE STRUCTURAL OUT OF SYNC]\n` +
                    `Tabela física '${champTable}' não possui a coluna 'round_rules' ou o cache de esquemas está desatualizado no Supabase.\n` +
                    `Detalhes do Erro: [${champUpdateErr.code}] ${champUpdateErr.message}\n\n` +
                    `👉 COMO CORRIGIR (Ajuste SQL no SUPABASE):\n` +
                    `1. Acesse o SQL Editor do seu Supabase e execute o seguinte comando DDL:\n` +
                    `   ALTER TABLE ${champTable} ADD COLUMN IF NOT EXISTS round_rules JSONB;\n` +
                    `2. Recarregue o cache de esquema (Schema Cache) executando:\n` +
                    `   NOTIFY pgrst, 'reload schema';\n` +
                    `3. Em seguida, re-execute o Turnover.`
                );
            } else {
                throw new Error(
                    `[ERRO CRÍTICO CRUD SUPABASE - ${champTable}]\n` +
                    `Não foi possível persistir os dados da rodada ${nextRound} no banco de dados.\n` +
                    `Código do Erro: ${champUpdateErr.code}\n` +
                    `Mensagem: ${champUpdateErr.message}\n` +
                    `Por favor, verifique a conexão com o Supabase, as políticas de segurança RLS ou a estrutura da tabela física.`
                );
            }
        }
        
        return { success: true };
    } catch (err: any) {
        try {
            // Salvar no log de erros do Supabase para notificação e análise do Administrador do Sistema
            await supabase.from('error_logs').insert({
                championship_id: id,
                round: nextRound,
                error_message: err.message,
                context_data: {
                    error_stack: err.stack,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (logErr) {
            console.error("Falha ao salvar log de erro fiduciário no Supabase:", logErr);
        }
        return { success: false, error: err.message };
    }
};

const normalizeTemplates = (list: any[]): any[] => {
  if (!list || !Array.isArray(list)) return [];
  return list.map((item: any) => {
    if (!item) return item;
    let cfg = item.config;
    if (typeof cfg === 'string') {
      try {
        cfg = JSON.parse(cfg);
      } catch (e) {
        console.error("Error parsing template config:", e);
      }
    }
    
    // Tratamento estrutural robusto caso haja aninhamento indesejado (versões legadas ou auto-geradas que salvaram o template todo em config)
    if (cfg && typeof cfg === 'object' && cfg.config && typeof cfg.config === 'object') {
      cfg = {
        ...cfg.config,
        currency: cfg.config.currency || cfg.currency || 'USD',
        starting_mode: cfg.config.starting_mode || cfg.starting_mode || 'start_from_zero',
      };
    }
    
    // Garantir estrutura mínima para evitar telas pretas em propriedades críticas de visualização no UI/UX
    if (cfg && typeof cfg === 'object') {
      if (!cfg.machines || !Array.isArray(cfg.machines)) {
        cfg.machines = [
          { model: "alpha", qty: 0, age: 0, efficiency: 1.0 },
          { model: "beta", qty: 0, age: 0, efficiency: 1.0 },
          { model: "gamma", qty: 0, age: 0, efficiency: 1.0 },
        ];
      }
      if (!cfg.regions || !Array.isArray(cfg.regions)) {
        cfg.regions = [];
      }
      if (!cfg.inventories || typeof cfg.inventories !== 'object') {
        cfg.inventories = {
          mpa_qty: 0,
          mpa_unit_val: 20.0,
          mpb_qty: 0,
          mpb_unit_val: 40.0,
          finished_qty: 0,
          finished_unit_val: 0.0,
        };
      }
      if (!cfg.workforce || typeof cfg.workforce !== 'object') {
        cfg.workforce = {
          baseSalary: 2500,
        };
      }
    } else {
      // Se por algum motivo o config ainda for nulo ou inválido, criamos um esqueleto mínimo padrão fiduciário
      cfg = {
        starting_mode: 'start_from_zero',
        currency: 'USD',
        caixa_inicial: 10000000.0,
        capital_social: 10000000.0,
        financial_investments: 0,
        building_mode: "rented",
        building_value: 0.0,
        land_value: 0.0,
        building_age: 0,
        installations_value: 500000.0,
        admin_sales_installations: 500000.0,
        machines: [
          { model: "alpha", qty: 0, age: 0, efficiency: 1.0 },
          { model: "beta", qty: 0, age: 0, efficiency: 1.0 },
          { model: "gamma", qty: 0, age: 0, efficiency: 1.0 },
        ],
        regions: [],
        inventories: {
          mpa_qty: 0,
          mpa_unit_val: 20.0,
          mpb_qty: 0,
          mpb_unit_val: 40.0,
          finished_qty: 0,
          finished_unit_val: 0.0,
        },
        workforce: {
          baseSalary: 2500,
        }
      };
    }
    
    return {
      ...item,
      config: cfg
    };
  });
};

export const getP0Templates = async (): Promise<any[]> => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser_id = authData?.user?.id || null;

    // Se estiver no Trial ou Sandbox, trazemos tudo (aberto de forma colaborativa a todos)
    // Se o modo Industrial/módulos for oficializado (isTrialSession é false e temos tutor de fato),
    // aplicamos controle rígido filtrando apenas os templates correspondentes ao tutor logado.
    const isTrialSession = localStorage.getItem('is_trial_session') === 'true' || !currentUser_id;

    let query = supabase.from('r0_templates').select('*');
    
    // Se não estiver em Trial (Modo Oficializado), filtramos rigidamente no banco pelo tutor logado
    if (!isTrialSession && currentUser_id) {
      query = query.eq('tutor_id', currentUser_id);
    }

    const { data: dbData, error } = await query.order('created_at', { ascending: false });
    
    // Obter dados locais persistidos de forma híbrida
    const local = localStorage.getItem('local_r0_templates');
    const localList = local ? JSON.parse(local) : [];

    if (error) {
      console.warn("Using local fallback for r0_templates due to database response:", error);
      // Filtramos também a lista local no modo oficializado
      const fallbackList = !isTrialSession && currentUser_id
        ? localList.filter((item: any) => item.tutor_id === currentUser_id)
        : localList;
      return normalizeTemplates(fallbackList);
    }

    const remoteList = dbData || [];
    
    // Mesclar as duas fontes eliminando duplicatas por 'code' ou 'id' para consistência contábil
    const combined = [...remoteList];
    localList.forEach((localItem: any) => {
      // Se estiver no Modo Oficializado, também filtramos o LocalStorage para segurança máxima
      if (!isTrialSession && currentUser_id && localItem.tutor_id !== currentUser_id) {
        return; // Pula templates locais de outros tutores
      }

      const exists = combined.some(
        (dbItem: any) => dbItem.code === localItem.code || dbItem.id === localItem.id
      );
      if (!exists) {
        combined.push(localItem);
      }
    });

    // Ordenar decrescentemente por data de criação para excelente usabilidade (mais recentes primeiro)
    combined.sort(
      (a: any, b: any) =>
        new Date(b.created_at || b.updated_at || 0).getTime() -
        new Date(a.created_at || a.updated_at || 0).getTime()
    );

    return normalizeTemplates(combined);
  } catch (err) {
    const local = localStorage.getItem('local_r0_templates');
    const fallbackList = local ? JSON.parse(local) : [];
    return normalizeTemplates(fallbackList);
  }
};

const isValidUUID = (str: string): boolean => {
  if (!str) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

export const saveP0Template = async (template: any) => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    
    // HIGIENIZAÇÃO DE PAYLOAD (ADR-DB-04):
    // Removemos 'category' e 'code' do payload de inserção no banco de dados,
    // pois essas colunas de transporte não existem fisicamente na tabela 'r0_templates' de Supabase-PostgREST,
    // o que causaria um erro de Bad Request (Coluna inexistente).
    const { category, code, ...dbSafeTemplate } = template;

    const payload: any = {
      ...dbSafeTemplate,
      tutor_id: authData?.user?.id || null,
      updated_at: new Date().toISOString()
    };

    // Se o ID não for um UUID válido (ex: 'tpl-xxxx'), removemos para que o Supabase gere um novo UUID automaticamente.
    // Se for um UUID válido, fazemos UPSERT para atualizar o template existente em vez de duplicar.
    const isUpdating = payload.id && isValidUUID(payload.id);
    if (!isUpdating) {
      delete payload.id;
    }
    
    // Identificador único local provisório (mantendo code e category para fallbacks em memória e LocalStorage)
    const initialId = template.id || `tpl-${Math.random().toString(36).substr(2, 9)}`;
    const payloadLocal = {
      ...payload,
      id: initialId,
      code: code || `TPL_${initialId.toUpperCase()}`,
      category: category || "industrial",
      created_at: template.created_at || new Date().toISOString()
    };

    // 1. Tenta gravar no banco de dados Supabase (upsert se estiver atualizando, insert se for novo)
    const { data: dbData, error } = isUpdating
      ? await supabase.from('r0_templates').upsert(payload).select()
      : await supabase.from('r0_templates').insert(payload).select();
      
    if (error) {
      console.warn("Database storage failed, falling back to LocalStorage:", error);
      // Fallback local robusto
      const local = localStorage.getItem('local_r0_templates');
      const list = local ? JSON.parse(local) : [];
      const existsIdx = list.findIndex((x: any) => x.code === payloadLocal.code);
      if (existsIdx >= 0) {
        list[existsIdx] = payloadLocal;
      } else {
        list.push(payloadLocal);
      }
      localStorage.setItem('local_r0_templates', JSON.stringify(list));
      return { data: [payloadLocal], error: null };
    }

    // 2. Com sucesso no banco, grava também localmente com o UUID gerado pelas nuvens
    const dbRecord = dbData && dbData[0] ? dbData[0] : null;
    const savedRecord = dbRecord ? {
      ...dbRecord,
      code: code || `TPL_${dbRecord.id}`,
      category: category || "industrial"
    } : payloadLocal;
    
    const local = localStorage.getItem('local_r0_templates');
    const list = local ? JSON.parse(local) : [];
    
    // Elimina qualquer duplicata local com o mesmo 'code' para consistência
    const filteredList = list.filter((item: any) => item.code !== savedRecord.code);
    filteredList.push(savedRecord);
    localStorage.setItem('local_r0_templates', JSON.stringify(filteredList));

    return { data: [savedRecord], error: null };
  } catch (err) {
    console.error("Exception during saveP0Template:", err);
    const local = localStorage.getItem('local_r0_templates');
    const list = local ? JSON.parse(local) : [];
    const fallbackId = template.id || `tpl-${Math.random().toString(36).substr(2, 9)}`;
    const payloadFallback = { 
      ...template, 
      id: fallbackId, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };
    const existsIdx = list.findIndex((x: any) => x.code === payloadFallback.code);
    if (existsIdx >= 0) {
      list[existsIdx] = payloadFallback;
    } else {
      list.push(payloadFallback);
    }
    localStorage.setItem('local_r0_templates', JSON.stringify(list));
    return { data: [payloadFallback], error: null };
  }
};

export const deleteP0Template = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('r0_templates')
      .delete()
      .eq('id', id);
    
    // Limpeza fiduciária no LocalStorage para cenários offline ou fallbacks locais coerentes
    const local = localStorage.getItem('local_r0_templates');
    if (local) {
      const list = JSON.parse(local);
      const filtered = list.filter((item: any) => item.id !== id);
      localStorage.setItem('local_r0_templates', JSON.stringify(filtered));
    }

    if (error) {
      console.warn("Using local delete fallback for r0_templates:", error);
    }
    return { success: true };
  } catch (err: any) {
    const local = localStorage.getItem('local_r0_templates');
    if (local) {
      const list = JSON.parse(local);
      const filtered = list.filter((item: any) => item.id !== id);
      localStorage.setItem('local_r0_templates', JSON.stringify(filtered));
    }
    return { success: true };
  }
};


