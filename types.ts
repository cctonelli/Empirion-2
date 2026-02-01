
/**
 * EMPIRION V15.2 - ORACLE MASTER BUILD (STABILITY UPDATE)
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

// Fix: Added missing exported member 'AnalysisSource' (Error in services/gemini.ts:3, constants.tsx:2, components/ChampionshipWizard.tsx:13)
export type AnalysisSource = 'parameterized' | 'ai_real_world';

// Fix: Added missing exported member 'RegionType' (Error in services/gemini.ts:3, constants.tsx:2, components/ChampionshipWizard.tsx:13)
export type RegionType = 'domestic' | 'international';

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

export interface MenuItemConfig {
  label: string;
  path: string;
  sub?: { id: string; label: string; path: string; icon?: string }[];
}

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
  book_value?: number;
  purchase_value?: number;
}

export interface RegionConfig {
  id: number;
  name: string;
  currency: CurrencyType;
  demand_weight: number;
}

export interface RegionalData {
  price: number;
  term: number;
  marketing: number;
}

export interface AuditLog {
  user_id: string;
  changed_at: string;
  field_path: string;
  old_value: any;
  new_value: any;
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
  interest_rate_tr: number;
  compulsory_loan_agio: number;
  late_penalty_rate: number;
  tax_rate_ir: number;
  dividend_percent: number;
  prices: {
    mp_a: number;
    mp_b: number;
    distribution_unit: number;
    marketing_campaign: number;
    storage_mp: number;
    storage_finished: number;
  };
  machinery_values: Record<MachineModel, number>;
  initial_machinery_mix: InitialMachine[];
  hr_base: { salary: number; [key: string]: any };
  [key: string]: any;
}

export interface DecisionData {
  judicial_recovery: boolean;
  regions: Record<number, RegionalData>;
  hr: { salary: number; hired: number; fired: number; [key: string]: any };
  production: { purchaseMPA: number; purchaseMPB: number; activityLevel: number; rd_investment: number; [key: string]: any };
  machinery: { buy: Record<MachineModel, number>; sell: Record<MachineModel, number> };
  finance: { loanRequest: number; loanTerm: number; application: number };
  estimates?: any;
  audit_logs?: AuditLog[];
}

export interface AccountNode { 
  id: string; 
  label: string; 
  value: number; 
  type: string; 
  children?: AccountNode[]; 
  isEditable?: boolean;
  isReadOnly?: boolean;
  isTemplateAccount?: boolean;
}

export interface KPIs {
  rating: CreditRating;
  loans: Loan[];
  statements: any;
  insolvency_status?: InsolvencyStatus;
  equity?: number;
  market_share?: number;
  motivation_score?: number;
  is_on_strike?: boolean;
  market_valuation?: { share_price: number; tsr: number };
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

export interface ProjectionResult {
  revenue: number;
  netProfit: number;
  debtRatio: number;
  creditRating: CreditRating;
  health: {
    cash: number;
    rating: CreditRating;
    status?: string;
    insolvency_risk?: number;
  };
  kpis: KPIs;
  statements: any;
  marketShare?: number;
}

export interface Championship {
  id: string;
  name: string;
  current_round: number;
  total_rounds: number;
  branch: Branch;
  market_indicators: MacroIndicators;
  round_rules?: Record<number, Partial<MacroIndicators>>;
  teams?: Team[];
  is_trial?: boolean;
  is_public?: boolean;
  currency?: CurrencyType;
  deadline_value?: number;
  deadline_unit?: DeadlineUnit;
  created_at?: string;
  round_started_at?: string;
  region_names?: string[];
  region_configs?: RegionConfig[];
  gazeta_mode?: GazetaMode;
  transparency_level?: TransparencyLevel;
  config?: any;
  ecosystemConfig?: EcosystemConfig;
  [key: string]: any;
}

// Fix: Added missing exported member 'BlackSwanEvent' (Error in components/TutorArenaControl.tsx:11)
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

// Fix: Added missing exported member 'CommunityCriteria' (Error in components/CommunityView.tsx:16)
export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

// Fix: Added missing exported member 'Modality' (Error in components/LandingPage.tsx:17, pages/ModalityDetail.tsx:13, hooks/useModalities.ts:4)
export interface Modality {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url?: string;
  page_content: {
    hero: { title: string; subtitle: string };
    features: string[];
    kpis: string[];
    accent_color?: 'orange' | 'blue' | 'emerald';
  };
}

// Fix: Added missing exported member 'TeamProgress' (Error in components/TutorDecisionMonitor.tsx:15)
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
