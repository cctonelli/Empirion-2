
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tutor' | 'player' | 'observer';
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
}

export interface FinancialData {
  revenue: number;
  costs: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  netProfit: number;
  assets: number;
  liabilities: number;
  equity: number;
}

export interface Company {
  id: string;
  championshipId: string;
  name: string;
  round: number;
  financials: FinancialData;
  kpis: {
    marketShare: number;
    roi: number;
    customerSatisfaction: number;
    esgScore: number;
  };
}

export interface Decision {
  id: string;
  teamId: string;
  round: number;
  data: {
    price: number;
    marketingBudget: number;
    productionQuantity: number;
    rdInvestment: number;
    hrTraining: number;
  };
  lastUpdated: string;
  updatedBy: string;
}
