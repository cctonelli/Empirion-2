
export type UserRole = 'admin' | 'tutor' | 'player';
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

export interface MarketPulse {
  total_rj: number;
  total_rej: number;
  total_loans_count: number;
  total_loans_value: number;
  machines_traded: { bought: number; sold: number };
  avg_liquidity: number;
  avg_debt: number;
}

/* Added MacroIndicators interface to fix multiple errors in constants.tsx, simulation.ts and TutorArenaControl.tsx */
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

/* Added EcosystemConfig interface to fix multiple errors in supabase.ts, simulation.ts and TutorArenaControl.tsx */
export interface EcosystemConfig {
  scenarioType: ScenarioType;
  modalityType: ModalityType;
  inflationRate: number;
  demandMultiplier: number;
  interestRate: number;
  marketVolatility: number;
}

/* Added Team interface to fix multiple errors in supabase.ts and ChampionshipsView.tsx */
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
  config: {
    bp_enabled?: boolean;
    bp_frequency?: number;
    bp_mandatory?: boolean;
    teamsLimit?: number;
    [key: string]: any;
  };
  market_indicators: MacroIndicators;
  initial_financials?: any;
  round_started_at?: string;
  is_trial?: boolean;
  teams?: Team[];
  marketPulse?: MarketPulse;
  /* Added missing properties to Championship to fix multiple property access errors */
  is_public?: boolean;
  created_at?: string;
  initial_market_data?: any;
  sales_mode?: SalesMode;
  scenario_type?: ScenarioType;
  currency?: CurrencyType;
  round_frequency_days?: number;
  transparency_level?: TransparencyLevel;
  ecosystemConfig?: EcosystemConfig;
  tutor_id?: string;
}

/* Added ChampionshipTemplate interface to fix errors in constants.tsx and ChampionshipWizard.tsx */
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
  };
  market_indicators: MacroIndicators;
  initial_financials: {
    balance_sheet: AccountNode[];
    dre: AccountNode[];
  };
}

/* Added BlackSwanEvent interface to fix errors in Dashboard.tsx and TutorArenaControl.tsx */
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

/* Added MessageBoardItem interface to fix errors in Dashboard.tsx */
export interface MessageBoardItem {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isImportant?: boolean;
}

/* Added BusinessPlan interface to fix errors in supabase.ts and BusinessPlanWizard.tsx */
export interface BusinessPlan {
  id: string;
  championship_id: string;
  team_id: string;
  round: number;
  version: number;
  data: Record<number, string>;
  status: 'draft' | 'final';
  updated_at?: string;
}

/* Added CommunityCriteria interface to fix errors in TutorArenaControl.tsx and CommunityView.tsx */
export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

/* Added Modality interface to fix errors in LandingPage.tsx, ModalityDetail.tsx and useModalities.ts */
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
    accent_color?: 'blue' | 'emerald' | 'orange';
  };
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
