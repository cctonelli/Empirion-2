
/**
 * EMPIRION V14.0 - ORACLE MASTER BUILD
 */

export type UserRole = 'admin' | 'tutor' | 'player' | 'observer';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type RegionType = 'national' | 'international' | 'mixed';
export type AnalysisSource = 'parameterized' | 'ai_real_world';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type GazetaMode = 'anonymous' | 'identified';
export type ModalityType = 'standard' | 'business_round' | 'factory_efficiency';
export type CurrencyType = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type DeadlineUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
export type RecoveryMode = 'none' | 'extrajudicial' | 'judicial';
export type CreditRating = 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A';
export type InsolvencyStatus = 'SAUDAVEL' | 'ALERTA' | 'RJ' | 'BANKRUPT';
export type LaborAvailability = 'BAIXA' | 'MEDIA' | 'ALTA';
export type MachineModel = 'alfa' | 'beta' | 'gama';

export interface MachineSpec {
  model: MachineModel;
  initial_value: number;
  production_capacity: number;
  operators_required: number;
  depreciation_rate: number; 
}

export interface InitialMachine {
  id: string;
  model: MachineModel;
  age: number; 
}

export interface RegionConfig {
  id: number;
  name: string;
  currency: CurrencyType;
  demand_weight: number; // Percentual da demanda total (0-100)
}

export interface DecisionData {
  judicial_recovery: boolean;
  regions: Record<number, { 
    price: number; 
    term: number; 
    marketing: number 
  }>;
  hr: {
    hired: number;
    fired: number;
    salary: number;
    trainingPercent: number;
    participationPercent: number;
    misc: number;
    sales_staff_count: number;
  };
  production: {
    purchaseMPA: number;
    purchaseMPB: number;
    paymentType: number; 
    activityLevel: number;
    extraProductionPercent: number;
    rd_investment: number;
  };
  machinery: {
    buy: { alfa: number; beta: number; gama: number };
    sell: { alfa: number; beta: number; gama: number };
  };
  finance: {
    loanRequest: number;
    loanType: number; 
    application: number;
  };
  estimates: {
    forecasted_revenue: number;
    forecasted_unit_cost: number;
    forecasted_net_profit: number;
  };
}

export interface MacroIndicators {
  ice: number;
  demand_variation: number;
  inflation_rate: number;
  customer_default_rate: number;
  interest_rate_tr: number;
  supplier_interest: number;
  sales_interest_rate: number;
  tax_rate_ir: number;
  late_penalty_rate: number;
  machine_sale_discount: number;
  exchange_rates: Record<CurrencyType, number>; 
  
  raw_material_a_adjust: number;
  raw_material_b_adjust: number;
  marketing_campaign_adjust: number;
  distribution_cost_adjust: number;
  storage_cost_adjust: number;
  machine_alpha_price_adjust: number;
  machine_beta_price_adjust: number;
  machine_gamma_price_adjust: number;
  salary_adjust: number;
  
  allow_machine_sale: boolean;
  labor_productivity: number;
  labor_availability: LaborAvailability;
  
  machine_specs: Record<MachineModel, MachineSpec>;
  initial_machinery_mix: InitialMachine[];
  maintenance_physics: {
    alpha: number; 
    beta: number;  
    gamma: number; 
  };

  prices: {
    mp_a: number;
    mp_b: number;
    distribution_unit: number;
    marketing_campaign: number;
  };
  machinery_values: {
    alfa: number;
    beta: number;
    gama: number;
  };
  hr_base: {
    salary: number;
    training: number;
    profit_sharing: number;
    misc: number;
  };
  active_event?: BlackSwanEvent;
  [key: string]: any;
}

export interface Team { id: string; name: string; championship_id: string; status?: string; invite_code?: string; is_bot?: boolean; master_key_enabled?: boolean; kpis?: KPIs; insolvency_status?: InsolvencyStatus; equity: number; credit_limit: number; }
export interface KPIs { 
  market_share: number; 
  rating: CreditRating; 
  insolvency_status: InsolvencyStatus; 
  nlcdg?: number;
  financing_sources?: {
    ecp: number;
    elp: number;
    ccp: number;
  };
  [key: string]: any; 
}
export interface ProjectionResult { revenue: number; netProfit: number; debtRatio: number; creditRating: CreditRating; health: any; kpis: KPIs; marketShare?: number; statements: any; }
export interface AccountNode { id: string; label: string; value: number; type: string; isEditable?: boolean; isReadOnly?: boolean; isTemplateAccount?: boolean; children?: AccountNode[]; }
export interface BlackSwanEvent { title: string; description: string; impact: string; modifiers: any; }

export interface Championship { 
  id: string; 
  name: string; 
  description: string; 
  branch: Branch; 
  status: ChampionshipStatus; 
  current_round: number; 
  total_rounds: number; 
  deadline_value: number; 
  deadline_unit: DeadlineUnit; 
  regions_count: number; 
  region_names?: string[];
  region_configs?: RegionConfig[];
  team_names?: string[];
  bots_count: number; 
  market_indicators: MacroIndicators; 
  round_rules?: Record<number, Partial<MacroIndicators>>; 
  kpis?: KPIs; 
  initial_financials: any; 
  initial_share_price: number;
  created_at: string; 
  sales_mode: SalesMode; 
  scenario_type: ScenarioType; 
  currency: CurrencyType; 
  transparency_level: TransparencyLevel; 
  gazeta_mode: GazetaMode; 
  observers: string[] | any[]; 
  teams?: Team[];
  is_public?: boolean;
  is_trial?: boolean;
  config?: any;
  region_type?: RegionType;
  analysis_source?: AnalysisSource;
  ecosystemConfig?: EcosystemConfig;
  round_started_at?: string;
  tutor_id?: string;
}

export interface ChampionshipTemplate {
  id: string;
  name: string;
  description: string;
  branch: Branch;
}

export interface UserProfile {
  id: string;
  supabase_user_id: string;
  name: string;
  nickname: string;
  phone: string;
  email: string;
  role: UserRole;
  is_opal_premium: boolean;
  created_at: string;
}

export interface RegionalData {
  region_id: number;
  region_name: string;
  demand: number;
  units_sold: number;
  market_share: number;
  avg_price: number;
  competitors_count: number;
}

export interface EcosystemConfig {
  scenario_type: ScenarioType;
  modality_type: ModalityType;
  inflation_rate: number;
  demand_multiplier: number;
  interest_rate: number;
  market_volatility: number;
}

export interface MenuItemConfig {
  id: string;
  label: string;
  path: string;
  isVisible: boolean;
}

export interface BusinessPlan {
  id: string;
  championship_id: string;
  team_id: string;
  round: number;
  version: number;
  data: Record<number, string>;
  status: 'draft' | 'final';
  created_at?: string;
  updated_at?: string;
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

export interface Modality {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  page_content: {
    hero: { title: string; subtitle: string };
    features: string[];
    kpis: string[];
    accent_color?: 'orange' | 'blue' | 'emerald';
  };
}

export interface TeamProgress {
  team_id: string;
  team_name: string;
  status: 'pending' | 'sealed';
  rating: CreditRating;
  risk: number;
  insolvent: boolean;
  master_key_enabled?: boolean;
  auditLogs: AuditLog[];
}

export interface AuditLog {
  user_id: string;
  changed_at: string;
  field_path: string;
  new_value: any;
}
