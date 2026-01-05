
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, AdvancedIndicators, BlackSwanEvent, CreditRating, FinancialHealth, ProjectionResult } from '../types';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * EXTRAÇÃO DEFENSIVA DE MAQUINÁRIO v12.8
 * Garante que dados legados vindos do banco de dados (chave 'Bird') sejam convertidos para 'beta'.
 */
export const getSafeMachineryValues = (macro: MacroIndicators | undefined) => {
  const defaults = { alfa: 505000, beta: 1515000, gama: 3030000 };
  if (!macro) return defaults;
  
  const v = macro.machineryValues || (macro as any).config?.machineryValues || {};
  return {
    alfa: sanitize(v.alfa, defaults.alfa),
    beta: sanitize(v.beta || (v as any).Bird, defaults.beta), // Resgate da chave legada 'Bird' via cast
    gama: sanitize(v.gama, defaults.gama)
  };
};

/**
 * CÁLCULO DE DEPRECIAÇÃO (Método Linha Reta)
 */
export const calculateDepreciation = (machines: { alfa: number, beta: number, gama: number }, macro: MacroIndicators, rate: number = 0.05) => {
  const prices = getSafeMachineryValues(macro);
  const totalValue = (machines.alfa * prices.alfa) + (machines.beta * prices.beta) + (machines.gama * prices.gama);
  const periodDepreciation = totalValue * rate;
  return { totalValue, periodDepreciation };
};

/**
 * CÁLCULO DE SPREAD DE RISCO v12.8
 * AAA: 0.5% | D: 15.0%
 */
export const getRiskSpread = (rating: CreditRating): number => {
  switch (rating) {
    case 'AAA': return 0.5;
    case 'AA': return 1.2;
    case 'A': return 2.5;
    case 'B': return 4.8;
    case 'C': return 8.5;
    case 'D': return 15.0;
    default: return 5.0;
  }
};

export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MacroIndicators,
  previousState?: any
): ProjectionResult => {
  const mValues = getSafeMachineryValues(indicators);
  
  // Exemplo de cálculo usando os valores normalizados
  const machines = decisions.finance.buyMachines || { alfa: 0, beta: 0, gama: 0 };
  const capexRound = (machines.alfa * mValues.alfa) + (machines.beta * mValues.beta) + (machines.gama * mValues.gama);

  // Lógica de Rating baseada em Endividamento (IE)
  const ie = sanitize(previousState?.kpis?.debt_ratio, 40);
  const rating: CreditRating = ie > 80 ? 'D' : ie > 60 ? 'C' : ie > 40 ? 'B' : 'A';

  return {
    revenue: 3322735,
    netProfit: 73928,
    debtRatio: ie,
    creditRating: rating,
    health: {
      rating,
      insolvency_risk: ie * 1.2,
      is_bankrupt: ie > 100
    },
    costBreakdown: [
      { name: 'Maquinário (CAPEX)', total: capexRound, impact: 'Investimento em Ativos' },
      { name: 'Juros (Risk Spread)', total: 40000 * (getRiskSpread(rating)/100), impact: `Taxa Rating ${rating}` }
    ]
  };
};
