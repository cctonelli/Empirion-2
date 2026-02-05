
/**
 * EMPIRION V15.80 - HYBRID BUSINESS PLAN PROTOCOL
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
  data: Record<number, string>;
  status: 'draft' | 'submitted' | 'approved' | 'finalized';
  is_template: boolean;
  visibility: BPVisibility;
  shared_with: string[];
  exported_formats: Record<string, string>;
  constraints: Record<string, any>;
  updated_at?: string;
}

export interface AuditLog {
  user_id: string;
  changed_at: string;
  field_path: string;
  old_value: any;
  new_value: any;
}

export interface EcosystemConfig {
  inflation_rate: number;
  demand_multiplier: number;
  interest_rate: number;
  market_volatility: number;
  scenario_type: ScenarioType;
  modality_type: ModalityType;
}

export interface KPIs {
  rating: CreditRating;
  loans: any[];
  statements: any;
  current_cash?: number;
  equity?: number;
  market_share?: number;
  stock_quantities?: any;
  fleet?: any[];
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

// Added missing AccountNode type
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

// Added missing MachineSpec type
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

// Added missing InitialMachine type
export interface InitialMachine {
  id: string;
  model: MachineModel;
  age: number;
  purchase_value: number;
  depreciated_value: number;
}

// Added missing MacroIndicators type
export interface MacroIndicators {
  ice: number;
  demand_variation: number;
  inflation_rate: number;
  customer_default_rate: number;
  interest_rate_tr: number;
  supplier_interest: number;
  investment_return_rate: number;
  avg_selling_price: number;
  late_penalty_rate: number;
  machine_sale_discount: number;
  special_purchase_premium: number;
  compulsory_loan_agio: number;
  social_charges: number;
  allow_machine_sale: boolean;
  require_business_plan: boolean;
  tax_rate_ir: number;
  vat_purchases_rate: number;
  vat_sales_rate: number;
  dividend_percent: number;
  production_hours_period: number;
  award_values: {
    cost_precision: number;
    revenue_precision: number;
    profit_precision: number;
  };
  prices: {
    mp_a: number;
    mp_b: number;
    distribution_unit: number;
    marketing_campaign: number;
    storage_mp: number;
    storage_finished: number;
  };
  machinery_values: Record<MachineModel, number>;
  machine_specs: Record<MachineModel, MachineSpec>;
  initial_machinery_mix: InitialMachine[];
  staffing: {
    admin: { count: number; salaries: number };
    sales: { count: number; salaries: number };
    production: { count: number; salaries: number };
  };
  hr_base: { salary: number };
  exchange_rates: Record<string, number>;
  [key: string]: any;
}

// Added missing RegionalData type
export interface RegionalData {
  price: number;
  term: number;
  marketing: number;
}

// Added missing DecisionData type
export interface DecisionData {
  judicial_recovery: boolean;
  regions: Record<number, RegionalData>;
  hr: {
    hired: number;
    fired: number;
    salary: number;
    trainingPercent: number;
    participationPercent: number;
    sales_staff_count: number;
    productivityBonusPercent?: number;
    misc: number;
  };
  production: {
    purchaseMPA: number;
    purchaseMPB: number;
    paymentType: number;
    activityLevel: number;
    rd_investment: number;
    net_profit_target_percent: number;
    term_interest_rate: number;
    extraProductionPercent: number;
  };
  machinery: {
    buy: Record<MachineModel, number>;
    sell: Record<MachineModel, number>;
  };
  finance: {
    loanRequest: number;
    loanTerm: number;
    application: number;
  };
  estimates: {
    forecasted_revenue: number;
    forecasted_unit_cost: number;
    forecasted_net_profit: number;
  };
  audit_logs?: AuditLog[];
}

// Added missing MenuItemConfig type
export interface MenuItemConfig {
  label: string;
  path: string;
  sub?: {
    id: string;
    label: string;
    path: string;
    icon: string;
  }[];
}

// Added missing ChampionshipTemplate type
export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
}

// Added missing BlackSwanEvent type
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

// Added missing RegionConfig type
export interface RegionConfig {
  id: number;
  name: string;
  currency: CurrencyType;
  demand_weight: number;
}

// Added missing ProjectionResult type
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

// Added missing Loan type
export interface Loan {
  id: string;
  amount: number;
  term: number;
  remaining_terms: number;
  interest_rate: number;
}

// Added missing CommunityCriteria type
export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

// Added missing Modality type
export interface Modality {
  id: string;
  slug: string;
  name: string;
  page_content: {
    hero: { title: string; subtitle: string };
    features: string[];
    kpis: string[];
    accent_color?: string;
  };
}

// Added missing TeamProgress type
export interface TeamProgress {
  team_id: string;
  team_name: string;
  status: 'pending' | 'sealed';
  rating: CreditRating;
  risk: number;
  insolvent: boolean;
  master_key_enabled?: boolean;
  auditLogs?: AuditLog[];
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
  region_names?: string[];
  region_configs?: any[];
  // Added missing properties to Championship interface
  round_started_at?: string;
  observers?: string[];
  config?: any;
}
