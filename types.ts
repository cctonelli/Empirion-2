
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';

export interface BalanceSheet {
  current_assets: {
    cash: number;
    accounts_receivable: number;
    inventory_raw_a: number;
    inventory_raw_b: number;
    inventory_finished: number;
    prepaid_expenses: number;
  };
  non_current_assets: {
    pp_e: {
      machinery: number;
      buildings: number;
      land: number;
    };
    accumulated_depreciation: number;
  };
  total_assets: number;
}

export interface LiabilitiesEquity {
  current_liabilities: {
    accounts_payable: number;
    short_term_loans: number;
    taxes_payable: number;
    dividends_payable: number;
  };
  non_current_liabilities: {
    long_term_loans: number;
  };
  equity: {
    capital_stock: number;
    retained_earnings: number;
  };
  total_liabilities_equity: number;
}

export interface ProductDefinition {
  name: string;
  unit_cost_base: number;
  suggested_price: number;
  initial_stock: number;
  max_capacity: number;
}

export interface ResourceUsage {
  water_consumption_monthly: number;
  energy_consumption_monthly: number;
  co2_emissions_monthly: number;
}

export interface MarketIndicators {
  inflation_rate: number;
  interest_rate_tr: number;
  supplier_interest: number;
  demand_regions: number[];
  raw_a_price: number;
  raw_b_price: number;
  distribution_cost: number;
  marketing_cost_unit: number;
  machine_alfa_price: number;
  machine_beta_price: number;
  machine_gama_price: number;
  average_salary: number;
}

export interface EcosystemConfig {
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

export interface ChampionshipConfig {
  regionsCount: number;
  initialStock: number;
  initialPrice: number;
  communityWeight: number; 
  votingCriteria: CommunityCriteria[];
}

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'debit' | 'credit';
  children?: AccountNode[];
  isEditable?: boolean;
}

export interface RegionalDecision {
  price: number;
  term: 0 | 1 | 2;
  marketing: number;
}

export interface DecisionData {
  regions: Record<number, RegionalDecision>;
  hr: {
    hired: number;
    fired: number;
    salary: number;
    trainingPercent: number;
    participationPercent: number;
    others: number;
  };
  production: {
    purchaseMPA: number;
    purchaseMPB: number;
    paymentType: 0 | 1 | 2;
    activityLevel: number;
    extraProduction: number;
  };
  finance: {
    loanRequest: number;
    loanType: 0 | 1 | 2;
    application: number;
    termSalesInterest: number;
    buyMachines: { alfa: number; beta: number; gama: number };
    sellMachines: { alfa: number; beta: number; gama: number };
  };
}

export interface FinancialStatement {
  round: number;
  dre: any;
  balance: any;
}

export interface Company {
  id: string;
  name: string;
  round: number;
  statements: FinancialStatement;
  kpis: {
    marketShare: number;
    productivity: number;
    motivation: 'Low' | 'Regular' | 'High';
    stockPrice: number;
    communityScore?: number;
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
  ecosystemConfig: EcosystemConfig;
  config: ChampionshipConfig;
  tutor_id: string;
  invite_code?: string;
  initial_financials?: {
    balance_sheet: BalanceSheet;
    liabilities_equity: LiabilitiesEquity;
  };
  market_indicators?: MarketIndicators;
  resources?: ResourceUsage;
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
    regionsCount?: number;
  };
  initial_financials: {
    balance_sheet: BalanceSheet;
    liabilities_equity: LiabilitiesEquity;
  };
  products: ProductDefinition[];
  resources: ResourceUsage;
  market_indicators: MarketIndicators;
}
