
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';

export interface EcosystemConfig {
  inflationRate: number; // 0 to 1 (e.g., 0.05 for 5%)
  demandMultiplier: number; // 0.5 to 2.0
  interestRate: number; // 0 to 1
  marketVolatility: number; // 0 to 1
}

export interface CommunityCriteria {
  id: string;
  label: string;
  weight: number; // 0 to 1
}

export interface ChampionshipConfig {
  regionsCount: number;
  initialStock: number;
  initialPrice: number;
  communityWeight: number; // 0 to 1 (e.g. 0.3 for 30%)
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
}

export interface CommunityRating {
  id: string;
  championship_id: string;
  team_id: string;
  user_id?: string; // Null for anonymous
  round: number;
  scores: Record<string, number>; // criteria_id -> score (1-10)
  comment?: string;
}

// Added ChampionshipTemplate interface to fix error in constants.tsx
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
