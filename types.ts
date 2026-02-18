
/**
 * EMPIRION V18.0 - BUSINESS MODEL GENERATION EDITION
 */

export type UserRole = 'admin' | 'tutor' | 'player' | 'observer';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type CreditRating = 'AAA' | 'AA' | 'A' | 'BB+' | 'B' | 'C' | 'D' | 'E' | 'N/A';
export type InsolvencyStatus = 'SAUDAVEL' | 'ALERTA' | 'RJ' | 'BANKRUPT';
export type MachineModel = 'alfa' | 'beta' | 'gama';
export type DeadlineUnit = 'hours' | 'days' | 'weeks' | 'months';
export type CurrencyType = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'CNY' | 'BTC';
export type LaborAvailability = 'BAIXA' | 'MEDIA' | 'ALTA';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type GazetaMode = 'anonymous' | 'identified';
export type ModalityType = 'standard' | 'blitz' | 'marathon';
export type AnalysisSource = 'parameterized' | 'ai_real_world';
export type RegionType = 'domestic' | 'international';
export type BPVisibility = 'private' | 'shared' | 'public';

export interface MenuItemConfig {
  label: string;
  path: string;
  sub?: {
    id: string;
    label: string;
    path: string;
    icon?: string;
  }[];
}

export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
}

export interface InitialMachine {
  model: MachineModel;
  count: number;
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

export interface Loan {
  id?: string;
  amount: number;
  remaining_rounds: number;
  total_rounds: number;
  interest_rate: number;
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

export interface BMCBlocks {
  customer_segments: string;
  value_propositions: string;
  channels: string;
  customer_relationships: string;
  revenue_streams: string;
  key_resources: string;
  key_activities: string;
  key_partnerships: string;
  cost_structure: string;
}

export interface EmpathyMap {
  think_feel: string;
  hear: string;
  see: string;
  say_do: string;
  pains: string;
  gains: string;
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

export interface KPIs {
  rating: CreditRating;
  loans: any[];
  statements: any;
  current_cash: number;
  equity: number;
  market_share?: number;
  stock_quantities?: any;
  tsr?: number; 
  nlcdg?: number; 
  ebitda?: number;
  roi?: number; 
  bep?: number; 
  solvency_index?: number;
  solvency_score_kanitz?: number;
  dcf_valuation?: number;
  inventory_turnover?: number;
  liquidity_current?: number;
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
  locale?: string; // Novo: Suporte a idioma da unidade
}

export interface TutorTeamView {
  id: string;
  name: string;
  rating: CreditRating;
  tsr: number;
  market_share: number;
  nlcdg: number;
  kanitz: number;
  ebitda: number;
  dcf: number;
  auditLogs: AuditLog[];
  current_decision?: DecisionData;
  is_bot?: boolean;
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
  locale?: string; // Novo: Idioma oficial da Arena
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

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type?: 'totalizer' | 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  isEditable?: boolean;
  isReadOnly?: boolean;
  children?: AccountNode[];
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
  
  raw_material_a_adjust?: number;
  machine_alpha_price_adjust?: number;
  machine_beta_price_adjust?: number;
  machine_gamma_price_adjust?: number;
  marketing_campaign_adjust?: number;
  distribution_cost_adjust?: number;
  storage_cost_adjust?: number;
  
  export_tariff_usa?: number;
  export_tariff_euro?: number;
  export_tariff_china?: number;
  export_tariff_btc?: number;

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
  staffing: {
    admin: { count: number; salaries: number };
    sales: { count: number; salaries: number };
    production: { count: number; salaries: number };
  };
  hr_base: { salary: number };
  exchange_rates: Record<string, number>;
  region_configs?: RegionConfig[];
  [key: string]: any;
}

export interface BusinessPlan {
  id?: string;
  championship_id?: string;
  team_id?: string;
  user_id?: string;
  round: number;
  version: number;
  data: {
    steps: Record<number, any>;
    canvas: BMCBlocks;
    empathy: EmpathyMap;
    epicenter: string;
  };
  status: 'draft' | 'submitted' | 'approved' | 'finalized';
  visibility: BPVisibility;
  is_template: boolean;
  shared_with: string[];
  updated_at?: string;
}

export interface EcosystemConfig {
  inflation_rate: number;
  demand_multiplier: number;
  interest_rate: number;
  market_volatility: number;
  scenario_type: ScenarioType;
  modality_type: ModalityType;
}

export interface ProjectionResult {
  revenue: number;
  netProfit: number;
  debtRatio: number;
  creditRating: CreditRating;
  health: {
    cash: number;
    rating: CreditRating;
  };
  kpis: KPIs;
  statements: any;
  marketShare: number;
}

export interface Modality {
  id: string;
  slug: string;
  name: string;
  page_content: {
    hero: { title: string; subtitle: string };
    features: string[];
    kpis: string[];
    accent_color?: 'blue' | 'emerald' | 'orange';
  };
}
