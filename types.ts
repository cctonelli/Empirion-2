
export type UserRole = 'admin' | 'tutor' | 'player';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type ModalityType = 'standard' | 'business_round' | 'factory_efficiency' | string;
export type CurrencyType = 'BRL' | 'USD' | 'EUR' | 'GBP';

export interface MacroIndicators {
  growthRate: number;
  inflationRate: number;
  interestRateTR: number;
  providerInterest: number;
  salesAvgInterest: number;
  avgProdPerMan: number;
  importedProducts: number;
  laborAvailability: 'low' | 'medium' | 'high';
  providerPrices: { mpA: number; mpB: number };
  distributionCostUnit: number;
  marketingExpenseBase: number;
  machineryValues: { alfa: number; beta: number; gama: number };
  sectorAvgSalary: number;
  stockMarketPrice: number;
  initialExchangeRateUSD: number;
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
  description?: string;
  branch: Branch;
  status: ChampionshipStatus;
  is_public: boolean;
  current_round: number; 
  total_rounds: number;   
  tutor_id?: string;
  sector?: string;
  sales_mode: SalesMode;
  scenario_type: ScenarioType;
  currency: CurrencyType;
  round_frequency_days: number;
  transparency_level: TransparencyLevel;
  config: {
    currency: CurrencyType;
    roundFrequencyDays: number;
    salesMode: SalesMode;
    scenarioType: ScenarioType;
    transparencyLevel: TransparencyLevel;
    modalityType: ModalityType;
    teamsLimit: number;
    botsCount: number;
    votingCriteria?: CommunityCriteria[];
  };
  initial_financials?: any;
  initial_market_data?: any;
  market_indicators?: any;
  teams?: Team[];
  is_local?: boolean; 
  is_trial?: boolean; // Flag virtual apenas para controle de UI, não necessária no DB principal
  created_at?: string;
  ecosystemConfig?: EcosystemConfig;
}

export interface Team {
  id: string;
  name: string;
  championship_id: string;
  status?: string; // Optional for Trial teams
  invite_code?: string; // Optional for Trial teams
  created_at?: string;
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

export interface DecisionData {
  regions: any;
  hr: any;
  production: any;
  finance: any;
}

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'totalizer';
  children?: AccountNode[];
  isReadOnly?: boolean;
  isEditable?: boolean;
  isTemplateAccount?: boolean;
}

export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
  sector: string;
  description: string;
  config: Partial<Championship['config']>;
  market_indicators: MacroIndicators;
  initial_financials: any;
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