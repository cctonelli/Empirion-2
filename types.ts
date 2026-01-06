
/**
 * EMPIRION V12.8.5 - PRODUCTION TYPES (ERPS GOLD Build)
 * Advanced financial status and intervention mapping.
 */

export type UserRole = 'admin' | 'tutor' | 'player' | 'observer';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type GazetaMode = 'anonymous' | 'identified';
export type ModalityType = 'standard' | 'business_round' | 'factory_efficiency';
export type CurrencyType = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type DeadlineUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
export type RecoveryMode = 'none' | 'extrajudicial' | 'judicial';
export type CreditRating = 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A';
export type InsolvencyStatus = 'SAUDAVEL' | 'ALERTA' | 'RJ' | 'BANKRUPT';

export interface Team {
  id: string;
  name: string;
  championship_id: string;
  status?: string;
  invite_code?: string;
  master_key_enabled?: boolean;
  kpis?: KPIs;
  insolvency_status?: InsolvencyStatus;
  intervention_log?: InterventionEntry[];
  created_at?: string;
  credit_limit: number; // Persistent GOLD Field (NOT NULL)
  equity: number;        // Persistent GOLD Field (NOT NULL)
}

/**
 * Interface representing a snapshot in the 'companies' table (History).
 */
export interface CompanyHistoryRecord {
  id?: string;
  team_id: string;
  team_name: string;
  championship_id: string;
  round: number;
  state: any;
  dre: any;
  balance_sheet: any;
  cash_flow: any;
  kpis: KPIs;
  credit_rating: CreditRating;
  insolvency_index: number;
  credit_limit: number; // Persistent GOLD Field (NOT NULL)
  equity: number;        // Persistent GOLD Field (NOT NULL)
  created_at?: string;
}

export interface InterventionEntry {
  type: 'CAPITAL_INJECTION' | 'DEBT_FORGIVENESS' | 'RJ_SUSPENSION' | 'MANUAL_STATUS';
  value?: number;
  tutor_note: string;
  timestamp: string;
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
    gap: number;
    is_critical: boolean;
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

export interface EcosystemConfig {
  scenario_type: ScenarioType;
  modality_type: ModalityType;
  inflation_rate: number;
  demand_multiplier: number;
  interest_rate: number;
  market_volatility: number;
}

export interface TeamProgress {
  team_id: string;
  team_name: string;
  status: string;
  rating: CreditRating;
  master_key_enabled?: boolean;
  risk?: number;
  insolvent?: boolean;
  kpis?: KPIs;
  auditLogs: AuditLog[];
}

export interface Championship {
  id: string;
  name: string;
  description: string; // Required GOLD Field (NOT NULL)
  branch: Branch;
  status: ChampionshipStatus;
  current_round: number; 
  total_rounds: number;   
  deadline_value: number;
  deadline_unit: DeadlineUnit;
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
  round_frequency_days?: number;
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

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'totalizer' | 'asset' | 'liability' | 'equity' | 'expense' | 'revenue';
  isEditable?: boolean;
  isReadOnly?: boolean;
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
    round_frequency_days: number;
    transparency_level: TransparencyLevel;
    gazeta_mode: GazetaMode;
    modality_type: ModalityType;
    deadline_value: number;
    deadline_unit: DeadlineUnit;
    sales_mode: SalesMode;
    scenario_type: ScenarioType;
  };
  market_indicators: MacroIndicators;
  initial_financials: any;
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
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
  updated_at: string;
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
