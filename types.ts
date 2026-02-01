
/**
 * EMPIRION V15.0 - ORACLE MASTER BUILD (FINANCE INFRASTRUCTURE)
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

/**
 * Fix: Added missing UserProfile interface
 */
export interface UserProfile {
  id: string;
  supabase_user_id: string;
  name: string;
  nickname?: string;
  phone?: string;
  email: string;
  role: UserRole;
  is_opal_premium: boolean;
  created_at: string;
}

/**
 * Fix: Added missing MenuItemConfig interface
 */
export interface MenuItemConfig {
  label: string;
  path: string;
  sub?: { id: string; label: string; path: string; icon: string }[];
}

/**
 * Fix: Added missing ChampionshipTemplate interface
 */
export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
  description: string;
}

/**
 * Fix: Added missing RegionConfig interface
 */
export interface RegionConfig {
  id: number;
  name: string;
  currency: CurrencyType;
  demand_weight: number;
}

/**
 * Fix: Added missing RegionalData interface
 */
export interface RegionalData {
  regionId: number;
  price: number;
  term: number;
  marketing: number;
}

/**
 * Fix: Added missing EcosystemConfig interface
 */
export interface EcosystemConfig {
  inflation_rate: number;
  demand_multiplier: number;
  interest_rate: number;
  market_volatility: number;
  scenario_type: ScenarioType;
  modality_type: ModalityType;
  votingCriteria?: CommunityCriteria[];
}

/**
 * Fix: Added missing BusinessPlan interface
 */
export interface BusinessPlan {
  id?: string;
  championship_id: string;
  team_id: string;
  round: number;
  version: number;
  data: Record<number, string>;
  status: 'draft' | 'submitted' | 'approved';
}

/**
 * Fix: Added missing Modality interface
 */
export interface Modality {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url?: string;
  is_public: boolean;
  page_content: {
    hero: { title: string; subtitle: string };
    features: string[];
    kpis: string[];
    accent_color?: string;
  };
}

/**
 * Fix: Added missing CommunityCriteria interface
 */
export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

/**
 * Fix: Added missing AuditLog interface
 */
export interface AuditLog {
  user_id: string;
  field_path: string;
  old_value: any;
  new_value: any;
  changed_at: string;
}

/**
 * Fix: Added missing TeamProgress interface
 */
export interface TeamProgress {
  team_id: string;
  team_name: string;
  status: 'sealed' | 'pending';
  rating: CreditRating;
  risk: number;
  insolvent: boolean;
  master_key_enabled?: boolean;
  auditLogs?: AuditLog[];
}

/**
 * Fix: Added missing BlackSwanEvent interface
 */
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

export interface BuildingSpec {
  initial_value: number;
  depreciation_rate: number;
  useful_life_periods: number;
}

export interface InitialBuilding {
  age: number;
  purchase_value: number;
}

export interface Loan {
  id: string;
  type: 'bdi' | 'normal' | 'compulsory';
  principal: number;
  remaining_principal: number;
  grace_periods: number;
  total_installments: number;
  remaining_installments: number;
  interest_rate: number;
  created_at_round: number;
}

export interface MacroIndicators {
  ice: number;
  demand_variation: number;
  inflation_rate: number;
  customer_default_rate: number;
  interest_rate_tr: number;
  supplier_interest: number;
  sales_interest_rate: number;
  investment_return_rate: number; 
  avg_selling_price: number;
  tax_rate_ir: number;
  late_penalty_rate: number;
  machine_sale_discount: number;
  special_purchase_premium: number;
  compulsory_loan_agio: number;
  exchange_rates: Record<CurrencyType, number>; 
  dividend_percent: number;
  social_charges: number; 
  production_hours_period: number; 
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
  require_business_plan: boolean;
  labor_productivity: number;
  labor_availability: LaborAvailability;
  award_values: {
    cost_precision: number;
    revenue_precision: number;
    profit_precision: number;
  };
  machine_specs: Record<MachineModel, MachineSpec>;
  initial_machinery_mix: InitialMachine[];
  building_spec: BuildingSpec;
  initial_building: InitialBuilding;
  prices: {
    mp_a: number;
    mp_b: number;
    distribution_unit: number;
    marketing_campaign: number;
    storage_mp: number;
    storage_finished: number;
  };
  machinery_values: {
    alfa: number;
    beta: number;
    gama: number;
  };
  staffing: {
    admin: { count: number; salaries: number };
    sales: { count: number; salaries: number };
    production: { count: number; salaries: number };
  };
  hr_base: {
    salary: number;
    training: number;
    profit_sharing: number;
    misc: number;
  };
  [key: string]: any;
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
    net_profit_target_percent: number; 
    term_interest_rate: number; 
  };
  machinery: {
    buy: { alfa: number; beta: number; gama: number };
    sell: { alfa: number; beta: number; gama: number };
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
}

/**
 * Fix: Added is_bot, master_key_enabled and created_at to Team
 */
export interface Team { 
  id: string; 
  name: string; 
  championship_id: string; 
  status?: string; 
  equity: number; 
  kpis?: KPIs; 
  insolvency_status?: InsolvencyStatus;
  is_bot?: boolean;
  master_key_enabled?: boolean;
  created_at?: string;
}

export interface KPIs { 
  market_share: number; 
  rating: CreditRating; 
  insolvency_status: InsolvencyStatus; 
  equity: number;
  fleet?: InitialMachine[];
  loans?: Loan[];
  statements?: any;
  last_decision?: DecisionData;
  motivation_score: number;
  is_on_strike: boolean;
  market_valuation: { share_price: number; tsr: number };
  [key: string]: any; 
}

export interface ProjectionResult { 
  revenue: number; 
  netProfit: number; 
  debtRatio: number; 
  creditRating: CreditRating; 
  health: any; 
  kpis: KPIs; 
  marketShare?: number; 
  statements: any; 
}

/**
 * Fix: Added isTemplateAccount to AccountNode
 */
export interface AccountNode { 
  id: string; 
  label: string; 
  value: number; 
  type: string; 
  isEditable?: boolean; 
  isReadOnly?: boolean; 
  isTemplateAccount?: boolean;
  children?: AccountNode[]; 
}

/**
 * Fix: Added missing MachineSpec properties
 */
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
  purchase_value?: number; 
  book_value?: number;
}

/**
 * Fix: Added missing Championship properties (is_public, region_configs, etc.)
 */
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
  initial_financials: {
    balance_sheet: AccountNode[];
    dre: AccountNode[];
    cash_flow?: AccountNode[];
  }; 
  market_indicators: MacroIndicators; 
  round_rules?: Record<number, Partial<MacroIndicators>>; 
  sales_mode: SalesMode; 
  scenario_type: ScenarioType; 
  currency: CurrencyType; 
  transparency_level: TransparencyLevel; 
  gazeta_mode: GazetaMode; 
  observers: string[]; 
  teams?: Team[];
  is_trial?: boolean;
  is_public?: boolean;
  round_started_at?: string;
  created_at?: string;
  dividend_percent?: number;
  config?: any;
  ecosystemConfig?: EcosystemConfig;
}
