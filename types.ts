
export type UserRole = 'admin' | 'tutor' | 'player';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type ModalityType = 'standard' | 'business_round' | 'factory_efficiency' | string;

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'totalizer';
  isReadOnly?: boolean;
  children?: AccountNode[];
  isEditable?: boolean;
}

export interface RegionConfig {
  id: string;
  name: string;
  demandTotal: number; // Unidades
  initialMarketShare: number; // %
  initialPrice: number; // $
}

export interface MacroIndicators {
  growthRate: number; // %
  inflationRate: number; // %
  interestRateTR: number; // %
  providerInterest: number; // %
  salesAvgInterest: number; // %
  avgProdPerMan: number; // unidades
  importedProducts: number; // unidades
  laborAvailability: 'low' | 'medium' | 'high';
  providerPrices: {
    mpA: number;
    mpB: number;
  };
  distributionCostUnit: number;
  marketingExpenseBase: number;
  machineryValues: {
    alfa: number;
    beta: number;
    gama: number;
  };
  sectorAvgSalary: number;
  stockMarketPrice: number;
  demand_regions?: number[];
}

export interface EcosystemConfig {
  scenarioType: ScenarioType;
  modalityType: ModalityType;
  inflationRate: number;
  demandMultiplier: number;
  interestRate: number;
  marketVolatility: number;
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

export interface Championship {
  id: string;
  name: string;
  description: string;
  branch: Branch;
  status: ChampionshipStatus;
  is_public: boolean;
  currentRound: number;
  totalRounds: number;
  config: {
    currency: string;
    roundFrequencyDays: number;
    salesMode: SalesMode;
    scenarioType: ScenarioType;
    transparencyLevel: TransparencyLevel;
    modalityType: ModalityType;
    teamsLimit: number;
    botsCount: number;
    votingCriteria?: CommunityCriteria[];
  };
  initial_financials?: {
    balance_sheet: AccountNode[];
    dre: AccountNode[];
  };
  initial_market_data?: {
    regions: RegionConfig[];
  };
  market_indicators?: MacroIndicators;
  ecosystemConfig?: EcosystemConfig;
}

export interface TeamHistoricalData {
  teamId: string;
  teamName: string;
  isUserTeam: boolean;
  isBot: boolean;
  financials: {
    balance_sheet: AccountNode[];
    dre: AccountNode[];
  };
}

export interface UserProfile {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  role: UserRole;
  is_opal_premium: boolean;
  created_at: string;
  opal_config?: {
    opal_url: string;
  };
}

export interface DecisionData {
  regions: Record<number, {
    price: number;
    term: number;
    marketing: number;
  }>;
  hr: { hired: number; fired: number; salary: number; trainingPercent: number; participationPercent: number; others: number; sales_staff_count: number; };
  production: { purchaseMPA: number; purchaseMPB: number; paymentType: number; activityLevel: number; extraProduction: number; rd_investment: number; strategy: 'push_mrp' | 'pull_kanban'; automation_level: number; batch_size: number; };
  finance: { loanRequest: number; loanType: number; application: number; termSalesInterest: number; buyMachines: { alfa: number; beta: number; gama: number }; sellMachines: { alfa: number; beta: number; gama: number }; };
}

export interface Modality {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  is_public: boolean;
  page_content: {
    hero: { title: string; subtitle: string };
    features: string[];
    kpis: string[];
    accent_color?: 'blue' | 'emerald' | 'orange';
  };
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
  };
  market_indicators: MacroIndicators;
  initial_financials: {
    balance_sheet: AccountNode[];
    dre: AccountNode[];
  };
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

export interface MessageBoardItem {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isImportant?: boolean;
}
