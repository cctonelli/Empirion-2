
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tutor' | 'player' | 'observer';
}

export interface DecisionData {
  purchases: {
    materialA: { volume: number; supplier: 'local' | 'intl'; contract: 'spot' | 'long' };
    materialB: { volume: number; supplier: 'local' | 'intl'; contract: 'spot' | 'long' };
  };
  production: {
    line1: number;
    line2: number;
    modernizationLevel: number; // 0 to 1
  };
  marketing: {
    branding: number;
    digital: number;
    traditional: number;
  };
  pricing: {
    productA: { price: number; localAllocation: number }; // allocation 0-1
    productB: { price: number; localAllocation: number };
  };
  logistics: {
    shippingMode: 'sea' | 'air' | 'land';
  };
  hr: {
    hiring: number;
    trainingBudget: number;
    salaryMultiplier: number; // 1.0 to 1.5
  };
  finance: {
    dividends: number;
    loansRequest: number;
    sharesBuyback: number;
  };
}

export interface Championship {
  id: string;
  name: string;
  description: string;
  branch: Branch;
  salesMode: SalesMode;
  scenarioType: ScenarioType;
  currency: string;
  currentRound: number;
  totalRounds: number;
  status: ChampionshipStatus;
  startDate: string;
  teamFee: number;
  transparencyLevel: TransparencyLevel;
}

export interface FinancialStatement {
  round: number;
  dre: {
    revenue: number;
    variableCosts: number;
    grossMargin: number;
    fixedCosts: number;
    ebitda: number;
    taxes: number;
    netProfit: number;
  };
  balance: {
    assets: number;
    cash: number;
    inventory: number;
    liabilities: number;
    equity: number;
  };
}

export interface Company {
  id: string;
  championshipId: string;
  name: string;
  round: number;
  statements: FinancialStatement[];
  kpis: {
    marketShare: number;
    roi: number;
    customerSatisfaction: number;
    esgScore: number;
    tsr: number; // Total Shareholder Return
  };
}

// Added ChampionshipTemplate interface to fix import error in constants.tsx
export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
  description: string;
  config: any;
}
