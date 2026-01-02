
export type UserRole = 'admin' | 'tutor' | 'player';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type ServiceLevel = 'low' | 'mid' | 'high';
export type ModalityType = 'standard' | 'business_round' | 'factory_efficiency' | string;
export type ProductionStrategy = 'push_mrp' | 'pull_kanban' | 'opt' | 'heijunka';

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'credit' | 'debit';
  children?: AccountNode[];
  isEditable?: boolean;
}

export interface MarketConfig {
  regionsCount: number;
  demand_per_region: Record<number, number>;
  initial_market_share_per_region: Record<number, number>;
  initial_prices_per_region: Record<number, number>;
  share_price_initial: number;
  shares_outstanding: number;
}

export interface MacroIndicators {
  inflation_rate: number;
  interest_rate_tr: number;
  exchange_rate_usd_brl: number;
  commodity_index: number;
  average_salary: number;
}

// Added missing MarketIndicators type used in simulation services
export interface MarketIndicators {
  inflation_rate: number;
  interest_rate_tr: number;
  exchange_rate: number;
  demand_potential: number;
  demand_regions: number[];
}

// Added missing BlackSwanEvent type for dynamic simulation events
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

export interface Championship {
  id: string;
  name: string;
  description: string;
  branch: Branch;
  status: ChampionshipStatus;
  is_public: boolean;
  currentRound: number;
  totalRounds: number;
  config: any;
  initial_financials?: any;
  ecosystemConfig?: EcosystemConfig;
}

// Added missing EcosystemConfig for simulation environment parameters
export interface EcosystemConfig {
  scenarioType: ScenarioType;
  modalityType: ModalityType;
  inflationRate: number;
  demandMultiplier: number;
  interestRate: number;
  marketVolatility: number;
  esgPriority?: number;
  activeEvent?: BlackSwanEvent | null;
  aiOpponents?: {
    enabled: boolean;
    count: number;
    strategy: 'aggressive' | 'conservative' | 'balanced';
  };
  gazetaConfig?: {
    focus: string[];
    style: 'sensationalist' | 'analytical' | 'neutral';
  };
  realDataWeights?: {
    inflation: number;
    demand: number;
    currency: number;
  };
}

export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
  sector: string;
  description: string;
  is_public: boolean;
  config: {
    currency: string;
    round_frequency_days: number;
    total_rounds: number;
    sales_mode: SalesMode;
    scenario_type: ScenarioType;
    transparency_level: TransparencyLevel;
    team_fee: number;
    community_enabled: boolean;
    regionsCount: number;
    modalityType: ModalityType;
  };
  initial_financials: any;
  products: any[];
  resources: any;
  market_indicators: any;
}

export interface UserProfile {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  role: UserRole;
  is_opal_premium: boolean;
  created_at: string;
  opal_config?: any;
}

export interface Modality {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  page_content: any;
  config_template: any;
  is_public: boolean;
  created_at: string;
}

export interface DecisionData {
  regions: Record<number, any>;
  hr: any;
  production: any;
  finance: any;
}

// Added missing MessageBoardItem for dashboard news feed
export interface MessageBoardItem {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isImportant?: boolean;
}

// Added missing CommunityCriteria for voting mechanics
export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}
