
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';

export interface ChampionshipTemplate {
  id: string;
  name: string;
  branch: Branch;
  description: string;
  config: {
    regionsCount: number;
    initialStock: number;
    initialPrice: number;
    currency: string;
  };
}

export interface RegionalDecision {
  price: number;
  term: 0 | 1 | 2; // 0: Vista, 1: 30d, 2: 60d
  marketing: number; // 0-9 intensity
}

export interface DecisionData {
  regions: Record<number, RegionalDecision>; // Regions 1-N
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
    activityLevel: number; // %
    extraProduction: number; // %
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
  dre: {
    salesRevenue: number;
    cpv: number;
    grossProfit: number;
    operatingExpenses: {
      sales: number;
      admin: number;
      financial: number;
    };
    operatingProfit: number;
    netProfitBeforeTax: number;
    taxProvision: number;
    netProfit: number;
  };
  balance: {
    assets: {
      cash: number;
      clients: number;
      inventoryMPA: number;
      inventoryMPB: number;
      inventoryFinished: number;
      machines: number;
      accumulatedDepreciation: number;
      land: number;
      buildings: number;
    };
    liabilities: {
      suppliers: number;
      taxesPayable: number;
      dividendsPayable: number;
      shortTermLoans: number;
      longTermLoans: number;
      equity: number;
      accumulatedProfit: number;
    };
  };
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
  };
}
