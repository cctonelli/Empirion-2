
/**
 * EMPIRION V13.0 - ORACLE COCKPIT BUILD
 * Advanced high-density data structures for ERP-style orchestration.
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

// Fix: Added missing EcosystemConfig interface
export interface EcosystemConfig {
  scenario_type: ScenarioType;
  modality_type: ModalityType;
  inflation_rate: number;
  demand_multiplier: number;
  interest_rate: number;
  market_volatility: number;
}

// Fix: Added missing CommunityCriteria interface
export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

export interface Team {
  id: string;
  name: string;
  championship_id: string;
  status?: string;
  invite_code?: string;
  is_bot?: boolean;
  master_key_enabled?: boolean;
  kpis?: KPIs;
  insolvency_status?: InsolvencyStatus;
  intervention_log?: InterventionEntry[];
  created_at?: string;
  credit_limit: number;
  equity: number;
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

export interface KPIs {
  ciclos?: {
    pmre: number;
    pmrv: number;
    pmpc: number;
    operacional: number;
    financeiro: number;
  };
  scissors_effect?: {
    ncg: number;
    ccl: number;
    tesouraria: number;
    ccp: number;
    tsf: number;
    is_critical: boolean;
  };
  market_valuation?: {
    share_price: number;
    total_shares: number;
    market_cap: number;
    tsr: number;
  };
  banking?: {
    score: number;
    rating: CreditRating;
    interest_rate: number;
    credit_limit: number;
    can_borrow: boolean;
  };
  market_share: number;
  rating: CreditRating;
  insolvency_status: InsolvencyStatus;
  net_profit?: number;
  equity?: number;
  regional_pulse?: RegionalData[];
  [key: string]: any;
}

export interface ProjectionResult {
  revenue: number;
  netProfit: number;
  debtRatio: number;
  creditRating: CreditRating;
  health: FinancialHealth;
  kpis: KPIs;
  marketShare?: number;
  statements: {
    dre: any;
    balance_sheet: any;
    cash_flow: any;
  };
}

export interface FinancialHealth {
  rating: CreditRating;
  insolvency_risk: number;
  is_bankrupt: boolean;
  liquidity_ratio: number;
}

export interface DecisionData {
  regions: Record<number, { price: number; term: number; marketing: number }>;
  hr: { hired: number; fired: number; salary: number; trainingPercent: number; participationPercent: number; sales_staff_count: number };
  production: { purchaseMPA: number; purchaseMPB: number; paymentType: number; activityLevel: number; rd_investment: number };
  finance: { loanRequest: number; application: number; buyMachines: { alfa: number; beta: number; gama: number } };
  legal: { recovery_mode: RecoveryMode };
}

export interface MacroIndicators {
  growth_rate: number;
  inflation_rate: number;
  interest_rate_tr: number;
  tax_rate_ir: number;
  machinery_values: { alfa: number; beta: number; gama: number };
  active_event?: BlackSwanEvent;
  [key: string]: any;
}

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
  // Fix: Added missing round_frequency_days property
  round_frequency_days: number;
  regions_count: number; 
  bots_count: number; 
  region_type: RegionType; 
  analysis_source: AnalysisSource; 
  initial_share_price: number; 
  is_public?: boolean;
  config: any;
  market_indicators: MacroIndicators;
  kpis?: KPIs;
  initial_financials: any;
  round_started_at: string;
  is_trial?: boolean;
  teams?: Team[];
  created_at: string;
  sales_mode: SalesMode;
  scenario_type: ScenarioType;
  currency: CurrencyType;
  transparency_level: TransparencyLevel;
  gazeta_mode: GazetaMode;
  observers: string[] | any[];
  ecosystemConfig?: EcosystemConfig;
}

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'totalizer' | 'asset' | 'liability' | 'equity' | 'expense' | 'revenue';
  isEditable?: boolean;
  isReadOnly?: boolean;
  // Fix: Added missing isTemplateAccount property
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
    total_rounds: number;
    round_frequency_days: number;
    regions_count: number;
    bots_count: number;
    region_type: RegionType;
    analysis_source: AnalysisSource;
    transparency_level: TransparencyLevel;
    gazeta_mode: GazetaMode;
    modality_type: ModalityType;
    deadline_value: number;
    deadline_unit: DeadlineUnit;
    sales_mode: SalesMode;
    scenario_type: ScenarioType;
    teams_limit?: number;
  };
  market_indicators: MacroIndicators;
  initial_financials: any;
}

export interface BusinessPlan {
  id: string;
  championship_id: string;
  team_id: string;
  round: number;
  version: number;
  data: Record<number, string>;
  status: 'draft' | 'submitted' | 'approved';
}

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
    accent_color?: string;
  };
}

export interface AuditLog {
  user_id: string;
  changed_at: string;
  field_path: string;
  old_value: any;
  new_value: any;
}

export interface UserProfile {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  role: UserRole;
  is_opal_premium?: boolean;
  created_at: string;
}

export interface TeamProgress {
  team_id: string;
  team_name: string;
  status: string;
  rating: CreditRating;
  risk: number;
  insolvent: boolean;
  auditLogs: AuditLog[];
  // Fix: Added missing master_key_enabled property
  master_key_enabled?: boolean;
}

export interface InterventionEntry {
  type: 'CAPITAL_INJECTION' | 'DEBT_FORGIVENESS' | 'RJ_SUSPENSION' | 'MANUAL_STATUS';
  value?: number;
  tutor_note: string;
  timestamp: string;
}
