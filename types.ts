/**
 * EMPIRION V12.8.0 - PRODUCTION TYPES (Armored Version)
 */

export type UserRole = 'admin' | 'tutor' | 'player' | 'observer';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid' | string;
export type ScenarioType = 'simulated' | 'real' | string;
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full' | string;
export type ModalityType = 'standard' | 'business_round' | 'factory_efficiency' | string;
export type CurrencyType = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type DeadlineUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
export type RecoveryMode = 'none' | 'extrajudicial' | 'judicial';
export type CreditRating = 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D' | 'N/A';

// Added Team interface to fix import errors in Supabase service and views
export interface Team {
  id: string;
  name: string;
  championship_id: string;
  status?: string;
  invite_code?: string;
  master_key_enabled?: boolean;
  created_at?: string;
}

export interface AuditLog {
  field_path: string;
  old_value: any;
  new_value: any;
  changed_at: string;
  user_id?: string;
  impact_on_cash?: number;
}

export interface MessageBoardItem {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isImportant?: boolean;
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
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
    cost_multiplier?: number;
  };
}

export interface FinancialHealth {
  rating: CreditRating;
  insolvency_risk: number;
  is_bankrupt: boolean;
  liquidity_ratio?: number;
  debt_to_equity?: number;
  insolvency_deficit?: number;
}

export interface ProjectionResult {
  revenue: number;
  netProfit: number;
  debtRatio: number;
  creditRating: CreditRating;
  totalOutflow: number;
  totalLiquidity: number;
  health: FinancialHealth;
  marketShare?: number;
  costBreakdown?: { name: string; total: number; impact: string }[];
  statements: {
    dre: any;
    balance_sheet: any;
    cash_flow: any;
    kpis: any;
  };
  [key: string]: any;
}

export interface DecisionData {
  regions: Record<number, { price: number; term: number; marketing: number }>;
  hr: { 
    hired: number; 
    fired: number; 
    salary: number; 
    trainingPercent: number; 
    participationPercent: number; 
    sales_staff_count: number 
  };
  production: { 
    purchaseMPA: number; 
    purchaseMPB: number; 
    paymentType: number; 
    activityLevel: number; 
    rd_investment: number 
  };
  finance: { 
    loanRequest: number; 
    application: number; 
    buyMachines: { alfa: number; beta: number; gama: number } 
  };
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
  laborAvailability: string;
  providerPrices: { mpA: number; mpB: number };
  distributionCostUnit: number;
  marketingExpenseBase: number;
  machineryValues: { alfa: number; beta: number; gama: number };
  sectorAvgSalary: number;
  stockMarketPrice: number;
  initialExchangeRateUSD: number;
  active_event?: BlackSwanEvent | null;
  difficulty?: {
    price_sensitivity: number;
    marketing_effectiveness: number;
  };
  [key: string]: any;
}

// Added AdvancedIndicators interface to fix import errors in simulation and gazette
export interface AdvancedIndicators {
  [key: string]: any;
}

export interface EcosystemConfig {
  scenarioType: ScenarioType;
  modalityType: ModalityType;
  inflationRate: number;
  demandMultiplier: number;
  interestRate: number;
  marketVolatility: number;
}

export interface TeamProgress {
  team_id: string;
  team_name: string;
  status: 'pending' | 'draft' | 'sealed' | string;
  last_update?: string;
  rating: CreditRating;
  risk: number;
  insolvent: boolean;
  master_key_enabled?: boolean;
  auditLogs: AuditLog[];
  last_activity?: string;
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
  is_public?: boolean;
  master_key_enabled?: boolean;
  config: any;
  market_indicators: MacroIndicators;
  initial_financials?: any;
  round_started_at?: string;
  is_trial?: boolean;
  // Fixed: Updated from any[] to Team[] to resolve type errors in views
  teams?: Team[];
  created_at: string;
  sales_mode?: SalesMode;
  scenario_type?: ScenarioType;
  currency?: CurrencyType;
  round_frequency_days?: number;
  transparency_level?: TransparencyLevel;
  ecosystemConfig?: EcosystemConfig;
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
    roundFrequencyDays?: number;
    salesMode?: SalesMode;
    scenarioType?: ScenarioType;
    transparencyLevel?: TransparencyLevel;
    modalityType?: ModalityType;
    deadlineValue?: number;
    deadlineUnit?: DeadlineUnit;
  };
  market_indicators: MacroIndicators;
  initial_financials: {
    balance_sheet: AccountNode[];
    dre: AccountNode[];
  };
}

export interface BusinessPlan {
  id: string;
  championship_id: string;
  team_id: string;
  round: number;
  version: number;
  data: Record<number, string>;
  status: 'draft' | 'submitted' | 'approved';
  updated_at: string;
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
