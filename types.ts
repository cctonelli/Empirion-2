
export type UserRole = 'admin' | 'tutor' | 'player' | 'observer';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type ModalityType = 'standard' | 'business_round' | 'factory_efficiency' | string;
export type CurrencyType = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type DeadlineUnit = 'hours' | 'days' | 'weeks' | 'months';
export type RecoveryMode = 'none' | 'extrajudicial' | 'judicial';

export type DiscreteTerm = 0 | 1 | 2;

/**
 * DNA base de uma simulação. Define as regras de partida.
 */
export interface GameTemplate {
  id: string;
  name: string;
  baseProductionCost: number;
  baseLaborCost: number;
  marketSize: number;
  taxRate: number;
  inflationSchedule: number[]; 
}

export interface AdvancedIndicators {
  nldcg_days: number;
  nldcg_components: {
    receivables: number;
    inventory_finished: number;
    inventory_raw: number;
    suppliers: number;
    other_payables: number;
  };
  trit: number;
  insolvency_index: number;
  prazos: {
    pmre: number; // Estoques
    pmrv: number; // Recebimento
    pmpc: number; // Pagamento Compras
    pmdo: number; // Despesas Operacionais
    pmmp: number; // Estocagem MP
  };
  ciclos: {
    operacional: number;
    financeiro: number;
    economico: number;
  };
  fontes_financiamento: {
    ecp: number; // Curto Prazo
    ccp: number; // Capital Próprio
    elp: number; // Longo Prazo
  };
  scissors_effect: {
    ncg: number;
    available_capital: number;
    gap: number;
  };
}

export interface UserProfile {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  role: UserRole;
  is_opal_premium: boolean;
  created_at: string;
}

export interface DecisionData {
  regions: Record<number, { price: number; term: DiscreteTerm; marketing: number }>;
  hr: { hired: number; fired: number; salary: number; trainingPercent: number; participationPercent: number; sales_staff_count: number };
  production: { purchaseMPA: number; purchaseMPB: number; paymentType: DiscreteTerm; activityLevel: number; rd_investment: number };
  finance: { loanRequest: number; application: number; buyMachines: { alfa: number; beta: number; gama: number } };
  legal: { recovery_mode: RecoveryMode };
}

export interface MacroIndicators {
  growthRate: number;
  inflationRate: number;
  interestRateTR: number;
  providerInterest: number;
  salesAvgInterest: number;
  avgProdPerMan: number;
  importedProducts: number;
  laborAvailability: 'low' | 'medium' | 'high' | string;
  providerPrices: { mpA: number; mpB: number };
  distributionCostUnit: number;
  marketingExpenseBase: number;
  machineryValues: { alfa: number; beta: number; gama: number };
  sectorAvgSalary: number;
  stockMarketPrice: number;
  initialExchangeRateUSD: number;
  demand_regions?: number[];
}

export interface EcosystemConfig {
  scenarioType: ScenarioType;
  modalityType: ModalityType;
  inflationRate: number;
  demandMultiplier: number;
  interestRate: number;
  marketVolatility: number;
}

export interface Team {
  id: string;
  name: string;
  championship_id: string;
  status?: string;
  invite_code?: string;
}

export interface Championship {
  id: string;
  name: string;
  description?: string;
  branch: Branch;
  status: ChampionshipStatus;
  current_round: number; 
  total_rounds: number;   
  deadline_value: number;
  deadline_unit: DeadlineUnit;
  template_id?: string;
  config: {
    bp_enabled?: boolean;
    bp_frequency?: number;
    bp_mandatory?: boolean;
    teamsLimit?: number;
    customRules?: Partial<GameTemplate>;
    [key: string]: any;
  };
  market_indicators: MacroIndicators;
  initial_financials?: any;
  round_started_at?: string;
  is_trial?: boolean;
  teams?: Team[];
  market_history?: AdvancedIndicators[];
  is_public?: boolean;
  created_at: string;
  sales_mode?: SalesMode;
  scenario_type?: ScenarioType;
  currency?: CurrencyType;
  round_frequency_days?: number;
  transparency_level?: TransparencyLevel;
  ecosystemConfig?: EcosystemConfig;
}

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'totalizer' | 'asset' | 'liability' | 'equity' | 'expense' | 'revenue';
  isReadOnly?: boolean;
  isEditable?: boolean;
  isTemplateAccount?: boolean;
  children?: AccountNode[];
}

export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
  sector: string;
  description: string;
  config: {
    roundFrequencyDays: number;
    salesMode: SalesMode;
    scenarioType: ScenarioType;
    transparencyLevel: TransparencyLevel;
    modalityType: ModalityType;
    deadlineValue?: number;
    deadlineUnit?: DeadlineUnit;
    customRules?: Partial<GameTemplate>;
  };
  market_indicators: MacroIndicators;
  initial_financials: any;
}

// Fixed missing types used across the application
export interface BlackSwanEvent {
  title: string;
  description: string;
  impact: string;
  modifiers: {
    inflation: number;
    demand: number;
    interest: number;
    productivity: number;
  };
}

export interface MessageBoardItem {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isImportant?: boolean;
}

export interface BusinessPlan {
  id: string;
  championship_id: string;
  team_id: string;
  round: number;
  version: number;
  data: Record<number, string>;
  status: 'draft' | 'submitted';
  updated_at: string;
}

export interface Modality {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  page_content: {
    hero: {
      title: string;
      subtitle: string;
    };
    features: string[];
    kpis: string[];
    accent_color?: 'orange' | 'blue' | 'emerald';
  };
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}
