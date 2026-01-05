
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, AdvancedIndicators, BlackSwanEvent, CreditRating, FinancialHealth, ProjectionResult } from '../types';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

export const getSafeMachineryValues = (macro: MacroIndicators | undefined) => {
  const defaults = { alfa: 505000, beta: 1515000, gama: 3030000 };
  if (!macro) return defaults;
  const v = macro.machineryValues || (macro as any).config?.machineryValues || {};
  return {
    alfa: sanitize(v.alfa, defaults.alfa),
    beta: sanitize(v.beta || (v as any).Bird, defaults.beta),
    gama: sanitize(v.gama, defaults.gama)
  };
};

export const calculateDepreciation = (machines: { alfa: number, beta: number, gama: number }, macro: MacroIndicators, rate: number = 0.05) => {
  const prices = getSafeMachineryValues(macro);
  const totalValue = (machines.alfa * prices.alfa) + (machines.beta * prices.beta) + (machines.gama * prices.gama);
  const periodDepreciation = totalValue * rate;
  return { totalValue, periodDepreciation };
};

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
  const prevEquity = sanitize(previousState?.balance_sheet?.equity?.total || 5055447, 5055447);
  const prevCash = sanitize(previousState?.balance_sheet?.assets?.current?.cash || 840200, 840200);
  
  // 1. CAPEX e Depreciação (O coração do v12.8)
  const machines = decisions.finance.buyMachines || { alfa: 0, beta: 0, gama: 0 };
  const { totalValue, periodDepreciation } = calculateDepreciation(machines, indicators || {} as any);
  
  // 2. Simulação de Resultado (Simplificada para o Kernel)
  const revenue = 3322735; 
  const operatingCosts = decisions.hr.trainingPercent * 500 + 150000; // Mock de custos
  const netProfit = revenue - operatingCosts - periodDepreciation;
  
  // 3. Lógica de Insolvência e Rating
  const finalEquity = prevEquity + netProfit;
  const totalDebt = sanitize(previousState?.balance_sheet?.liabilities?.total_debt || 3372362, 3372362) + decisions.finance.loanRequest;
  const liquidityRatio = (prevCash + revenue) / Math.max(totalDebt, 1);
  
  let rating: CreditRating = 'AAA';
  let risk = 0;

  if (finalEquity <= 0 || prevCash < 0) {
    rating = 'D';
    risk = 100;
  } else if (liquidityRatio < 0.8) {
    rating = 'C';
    risk = 80;
  } else if (liquidityRatio < 1.3) {
    rating = 'B';
    risk = 45;
  } else if (liquidityRatio < 1.9) {
    rating = 'A';
    risk = 15;
  }

  return {
    revenue,
    netProfit,
    debtRatio: (totalDebt / Math.max(finalEquity, 1)) * 100,
    creditRating: rating,
    totalOutflow: operatingCosts + totalValue,
    totalLiquidity: prevCash + decisions.finance.loanRequest,
    health: {
      rating,
      insolvency_risk: risk,
      is_bankrupt: finalEquity <= 0,
      liquidity_ratio: liquidityRatio
    },
    costBreakdown: [
      { name: 'Depreciação de Ativos', total: periodDepreciation, impact: 'Desgaste de Capital' },
      { name: 'Custo Operacional', total: operatingCosts, impact: 'Manutenção do Nodo' }
    ]
  };
};
