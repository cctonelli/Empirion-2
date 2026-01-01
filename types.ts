
export type UserRole = 'admin' | 'tutor' | 'player';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';

export interface UserProfile {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface InventoryStats {
  initial: number;
  purchases: number;
  consumption: number;
  sales: number;
  final: number;
  perishability_loss?: number; // Loss due to product expiration (SIAGRO)
}

export interface MachineStats {
  alfa: { qty: number; age: number };
  beta: { qty: number; age: number };
  gama: { qty: number; age: number };
}

export interface FinancialStatement {
  round: number;
  inventory: {
    mpa: InventoryStats;
    mpb: InventoryStats;
    finished: InventoryStats;
  };
  cash_flow: {
    inflow_sales: number;
    outflow_purchases: number;
    outflow_payroll: number;
    outflow_marketing: number;
    outflow_distribution: number;
    outflow_taxes: number;
    outflow_machines: number;
    net_cash: number;
  };
  hr: {
    total: number;
    productivity: number;
    motivation: string;
    strike: boolean;
    strike_intensity?: number;
  };
  machines: MachineStats;
  regional_demand: Record<number, { potential: number; sold: number }>;
  quality_index?: number;
}

export interface BalanceSheet {
  current_assets: {
    cash: number;
    accounts_receivable: number;
    inventory_raw_a: number;
    inventory_raw_b: number;
    inventory_finished: number;
    prepaid_expenses: number;
    portfolio_investments?: number;
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
    customer_deposits?: number;
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

export interface AccountNode {
  id: string;
  label: string;
  value: number;
  type: 'credit' | 'debit';
  children?: AccountNode[];
  isEditable?: boolean;
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
    climate_impact?: number; // Specific for Agribusiness
  };
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
    climate?: number;
  };
  stockMarketActive?: boolean;
  messageBoard?: MessageBoardItem[];
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number;
}

export interface ProductDefinition {
  name: string;
  unit_cost_base: number;
  suggested_price: number;
  initial_stock: number;
  max_capacity: number;
  is_perishable?: boolean;      // SIAGRO: Perishability flag
  perishability_rate?: number; // SIAGRO: % loss per round if not sold
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
  exchange_rate?: number;
  risk_premium?: number;
  stock_prices?: Record<string, number>;
  seasonality_index?: number; // SIAGRO: Crop seasonality (0.5 to 1.5)
  climate_status?: 'optimal' | 'dry' | 'flood' | 'storm';
}

export interface DecisionData {
  regions: Record<number, { price: number; term: number; marketing: number }>;
  hr: {
    hired: number;
    fired: number;
    salary: number;
    trainingPercent: number;
    participationPercent: number;
    others: number;
    overtimeHours?: number; // SIAGRO: Impact on productivity
  };
  production: {
    purchaseMPA: number;
    purchaseMPB: number;
    paymentType: 0 | 1 | 2;
    activityLevel: number;
    extraProduction: number;
    rd_investment?: number;
    agro_tech_investment?: number; // SIAGRO: Yield boost
  };
  finance: {
    loanRequest: number;
    loanType: 0 | 1 | 2;
    application: number;
    termSalesInterest: number;
    buyMachines: { alfa: number; beta: number; gama: number };
    sellMachines: { alfa: number; beta: number; gama: number };
    receivables_anticipation?: number; // SIAGRO: Cash flow tool
  };
  inBankruptcy?: boolean;
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
