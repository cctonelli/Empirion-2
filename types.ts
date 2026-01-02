
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
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  children?: AccountNode[];
  isEditable?: boolean;
}

export interface RegionConfig {
  id: number;
  name: string;
  demand: number;
  initialShare: number;
  suggestedPrice: number;
}

export interface MacroIndicators {
  inflation_rate: number;
  interest_rate_tr: number;
  exchange_rate_usd_brl: number;
  commodity_index: number;
  average_salary: number;
}

// Added BlackSwanEvent to support simulation events and Dashboard integration
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

// Added CommunityCriteria to support gamification and voting features
export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

// Added MarketIndicators to unify market data across the simulation engine
export interface MarketIndicators {
  macro?: MacroIndicators;
  regions?: RegionConfig[];
  demand_regions?: number[];
  inflation_rate?: number;
  interest_rate_tr?: number;
  exchange_rate?: number;
  demand_potential?: number;
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
  market_indicators?: MarketIndicators;
  ecosystemConfig?: any;
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
    modalityType: ModalityType;
    // Added missing configuration properties found in constants and wizard
    team_fee?: number;
    community_enabled?: boolean;
    regionsCount?: number;
  };
  initial_financials: any;
  market_indicators: MarketIndicators;
  products: any[];
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

export interface MessageBoardItem {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isImportant?: boolean;
}

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
  // Added votingCriteria to support CommunityView logic
  votingCriteria?: CommunityCriteria[];
}
