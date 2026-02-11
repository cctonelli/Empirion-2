
/**
 * EMPIRION V17.0 - ADVANCED ANALYTICS PROTOCOL
 */

export type UserRole = 'admin' | 'tutor' | 'player' | 'observer';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type CreditRating = 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A';
export type InsolvencyStatus = 'SAUDAVEL' | 'ALERTA' | 'RJ' | 'BANKRUPT';
export type MachineModel = 'alfa' | 'beta' | 'gama';
export type DeadlineUnit = 'hours' | 'days' | 'weeks' | 'months';
export type CurrencyType = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type LaborAvailability = 'BAIXA' | 'MEDIA' | 'ALTA';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type GazetaMode = 'anonymous' | 'identified';
export type ModalityType = 'standard' | 'blitz' | 'marathon';
export type AnalysisSource = 'parameterized' | 'ai_real_world';
export type RegionType = 'domestic' | 'international';
export type BPVisibility = 'private' | 'shared' | 'public';

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

export interface BusinessPlan {
  id: string;
  user_id: string;
  championship_id?: string;
  team_id?: string;
  round: number;
  version: number;
  data: Record<number, any>;
  status: 'draft' | 'submitted' | 'approved' | 'finalized';
  is_template: boolean;
  visibility: BPVisibility;
  shared_with: string[];
  exported_formats: Record<string, string>;
  constraints: Record<string, any>;
  updated_at?: string;
}

export interface KPIs {
  rating: CreditRating;
  loans: any[];
  statements: any;
  current_cash: number;
  equity: number;
  market_share?: number;
  stock_quantities?: any;
  
  // Advanced Historical KPIs v17.0
  solvency_index?: number;
  nlcdg?: number; // Necessidade Líquida de Capital de Giro
  inventory_turnover?: number; // Giro de Estoque
  liquidity_current?: number;
  trit?: number; // Cobertura de Juros
  scissors_effect?: number; // Diferença PMR - PMP
  avg_receivable_days?: number;
  avg_payable_days?: number;
  equity_immobilization?: number;
  debt_participation_pct?: number;
  debt_composition_st_pct?: number;
  
  [key: string]: any;
}

export interface Team {
  id: string;
  name: string;
  championship_id: string;
  kpis: KPIs;
  equity: number;
  is_bot?: boolean;
  insolvency_status?: InsolvencyStatus;
  master_key_enabled?: boolean;
}

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'totalizer' | 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  children?: AccountNode[];
  isEditable?: boolean;
  isReadOnly?: boolean;
  isTemplateAccount?: boolean;
}

export interface MacroIndicators {
  ice: number;
  demand_variation: number;
  inflation_rate: number;
  customer_default_rate: number;
  interest_rate_tr: number;
  supplier_interest: number;
  investment_return_rate: number;
  avg_selling_price: number;
  [key: string]: any;
}

export interface DecisionData {
  judicial_recovery: boolean;
  regions: Record<number, any>;
  hr: any;
  production: any;
  machinery: any;
  finance: any;
  estimates: any;
  audit_logs?: any[];
}

export interface Championship {
  id: string;
  name: string;
  current_round: number;
  total_rounds: number;
  branch: Branch;
  regions_count: number;
  market_indicators: any;
  round_rules?: Record<number, any>;
  teams?: Team[];
  is_trial?: boolean;
  is_public?: boolean;
  currency?: CurrencyType;
  deadline_value?: number;
  deadline_unit?: DeadlineUnit;
  created_at?: string;
  round_started_at?: string;
  observers?: string[];
  config?: any;
}

// Added missing exports based on project errors
export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
}

export interface MachineSpec {
  model: MachineModel;
  initial_value: number;
  production_capacity: number;
  operators_required: number;
  depreciation_rate: number;
  overload_coef: number;
  aging_coef: number;
  useful_life_years: number;
  overload_extra_rate: number;
}

export interface InitialMachine {
  id: string;
  model: MachineModel;
  age: number;
  purchase_value: number;
  depreciated_value: number;
}

export interface MenuItemConfig {
  label: string;
  path: string;
  id?: string;
  icon?: string;
  sub?: {
    id: string;
    label: string;
    path: string;
    icon: string;
  }[];
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

export interface EcosystemConfig {
  inflation_rate: number;
  demand_multiplier: number;
  interest_rate: number;
  market_volatility: number;
  scenario_type: ScenarioType;
  modality_type: ModalityType;
}

export interface Loan {
  id: string;
  amount: number;
  term: number;
  round_issued: number;
  remaining_rounds: number;
}

export interface ProjectionResult {
  revenue: number;
  netProfit: number;
  debtRatio: number;
  creditRating: CreditRating;
  health: {
    cash: number;
    rating: CreditRating;
    insolvency_risk?: number;
    status?: string;
  };
  kpis: KPIs;
  statements: any;
  marketShare: number;
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

export interface Modality {
  id: string;
  slug: string;
  name: string;
  page_content: any;
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
  old_value: any;
  new_value: any;
}

export interface RegionConfig {
  id: number;
  name: string;
  currency: CurrencyType;
  demand_weight: number;
}
