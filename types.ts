
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

export type CreditRating = 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D' | 'N/A';

export type DiscreteTerm = 0 | 1 | 2;

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
    hero: { title: string; subtitle: string };
    features: string[];
    kpis: string[];
    accent_color?: 'orange' | 'blue' | 'emerald';
  };
}

export interface FinancialHealth {
  liquidity_ratio?: number;
  debt_to_equity?: number;
  insolvency_risk?: number;
  rating?: CreditRating;
  debt_rating?: CreditRating;
  previous_rating?: CreditRating;
  is_downgraded?: boolean;
  is_bankrupt?: boolean;
  insolvency_deficit?: number;
}

export interface ProjectionResult {
  revenue?: number;
  cpv?: number;
  ebitda?: number;
  netProfit?: number;
  salesVolume?: number;
  totalMarketingCost?: number;
  debtRatio?: number;
  marketShare?: number;
  cashFlowNext?: number;
  totalOutflow?: number;
  totalLiquidity?: number;
  loanLimit?: number;
  creditRating?: CreditRating;
  health?: FinancialHealth;
  insolvency_deficit?: number;
  interestExp?: number;
  riskSpread?: number;
  suggestRecovery?: boolean;
  capexBlocked?: boolean;
  statements?: any;
  indicators?: AdvancedIndicators;
  costBreakdown?: any[];
  activeEvent?: BlackSwanEvent | null;
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

export interface AdvancedIndicators {
  nldcg_days?: number;
  nldcg_components?: {
    receivables?: number;
    inventory_finished?: number;
    inventory_raw?: number;
    suppliers?: number;
    other_payables?: number;
  };
  trit?: number;
  insolvency_index?: number;
  prazos?: {
    pmre?: number; 
    pmrv?: number; 
    pmpc?: number; 
    pmdo?: number; 
    pmmp?: number; 
  };
  ciclos?: {
    operacional?: number;
    financeiro?: number;
    economico?: number;
  };
  fontes_financiamento?: {
    ecp?: number; 
    ccp?: number; 
    elp?: number; 
  };
  scissors_effect?: {
    ncg?: number;
    available_capital?: number;
    gap?: number;
  };
}

export interface DecisionData {
  regions: Record<number, { price: number; term: DiscreteTerm; marketing: number }>;
  hr: { hired: number; fired: number; salary: number; trainingPercent: number; participationPercent: number; sales_staff_count: number };
  production: { purchaseMPA: number; purchaseMPB: number; paymentType: DiscreteTerm; activityLevel: number; rd_investment: number };
  finance: { loanRequest: number; application: number; buyMachines: { alfa: number; beta: number; gama: number } };
  legal: { recovery_mode: RecoveryMode };
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
  master_key_enabled?: boolean;
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
  is_public?: boolean;
  master_key_enabled?: boolean;
  config: {
    bp_enabled?: boolean;
    bp_frequency?: number;
    bp_mandatory?: boolean;
    teamsLimit?: number;
    customRules?: any;
    votingCriteria?: CommunityCriteria[];
    machineryValues?: { alfa: number, beta: number, gama: number };
    [key: string]: any;
  };
  market_indicators: MacroIndicators;
  initial_financials?: any;
  round_started_at?: string;
  is_trial?: boolean;
  teams?: Team[];
  created_at: string;
  sales_mode?: SalesMode;
  scenario_type?: ScenarioType;
  currency?: CurrencyType;
  round_frequency_days?: number;
  transparency_level?: TransparencyLevel;
  ecosystemConfig?: EcosystemConfig;
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
  difficulty?: {
      price_sensitivity?: number;
      marketing_effectiveness?: number;
  };
  active_event?: BlackSwanEvent | null;
  [key: string]: any;
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
    roundFrequencyDays: number;
    salesMode: SalesMode;
    scenarioType: ScenarioType;
    transparencyLevel: TransparencyLevel;
    modalityType: ModalityType;
    deadlineValue?: number;
    deadlineUnit?: DeadlineUnit;
    customRules?: any;
    [key: string]: any;
  };
  market_indicators: MacroIndicators;
  initial_financials: {
    balance_sheet: AccountNode[];
    dre: AccountNode[];
  };
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

/**
 * FIX: Added missing TeamProgress interface to resolve the import error in TutorDecisionMonitor.tsx.
 * This provides the base structure for monitoring team activity within an arena.
 */
export interface TeamProgress {
  team_id: string;
  status: string;
  last_activity?: string;
}
