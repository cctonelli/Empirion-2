import { DecisionData, Branch, EcosystemConfig, MacroIndicators, AdvancedIndicators, CreditRating, ProjectionResult } from '../types';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * EXTRAÇÃO DEFENSIVA DE MAQUINÁRIO v12.8.2
 * Standardized Oracle Node mapping for industrial assets.
 */
export const getSafeMachineryValues = (macro: MacroIndicators | undefined) => {
  const defaults = { alfa: 505000, beta: 1515000, gama: 3030000 };
  
  if (!macro) return defaults;
  
  const v = macro.machineryValues || (macro as any).config?.machineryValues || {};
  return {
    alfa: sanitize(v.alfa, defaults.alfa),
    beta: sanitize(v.beta, defaults.beta), 
    gama: sanitize(v.gama, defaults.gama)
  };
};

/**
 * CÁLCULO DE DEPRECIAÇÃO (Fidelity Standard 5%)
 * Linear period depreciation based on machine types.
 */
export const calculateDepreciation = (machines: { alfa: number, beta: number, gama: number }, macro: MacroIndicators, rate: number = 0.05) => {
  const prices = getSafeMachineryValues(macro);
  const totalValue = (machines.alfa * prices.alfa) + (machines.beta * prices.beta) + (machines.gama * prices.gama);
  const periodDepreciation = totalValue * rate;
  return { totalValue, periodDepreciation };
};

/**
 * CORE ORACLE PROJECTION v12.8.2
 * Calculates full financial and operational status of a strategy node.
 */
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
  
  // 1. CAPEX and Asset Cycle
  const machinesOwned = previousState?.resources?.machines || { alfa: 2, beta: 1, gama: 0 };
  const { periodDepreciation } = calculateDepreciation(machinesOwned, indicators || {} as any);
  
  // 2. Operational Dynamics
  const revenue = 3322735; // Simulated revenue baseline
  const totalMarketingCost = Object.values(decisions.regions).reduce((acc, r) => acc + (r.marketing * 10000), 0);
  const operatingCosts = (decisions.hr.trainingPercent * 500) + 150000 + totalMarketingCost; 
  const netProfit = revenue - operatingCosts - periodDepreciation;
  
  // 3. Solvency Audit Node
  const finalEquity = prevEquity + netProfit;
  const totalDebt = sanitize(previousState?.balance_sheet?.liabilities?.total_debt || 3372362, 3372362) + decisions.finance.loanRequest;
  const liquidityRatio = (prevCash + revenue) / Math.max(totalDebt, 1);
  
  let rating: CreditRating = 'AAA';
  let risk = 5;

  if (finalEquity <= 0 || prevCash < 0 || liquidityRatio < 0.5) {
    rating = 'D'; risk = 100;
  } else if (liquidityRatio < 0.85) {
    rating = 'C'; risk = 80;
  } else if (liquidityRatio < 1.3) {
    rating = 'B'; risk = 45;
  } else if (liquidityRatio < 1.9) {
    rating = 'A'; risk = 15;
  }

  // 4. Advanced Indicators v12.8.2 - Fidelity Logic (NCG, Cycles, Scissors)
  const advanced: AdvancedIndicators = {
    ciclos: {
      operacional: branch === 'industrial' ? 60 : 35,
      financeiro: branch === 'industrial' ? 40 : 20,
      economico: 25
    },
    scissors_effect: {
      ncg: revenue * 0.14, // Needs for Working Capital
      available_capital: prevCash + revenue - operatingCosts,
      gap: (revenue * 0.14) - (prevCash + revenue - operatingCosts)
    },
    productivity: {
      oee: branch === 'industrial' ? 84.2 : undefined,
      csat: branch === 'commercial' ? 9.2 : undefined,
      efficiency_index: 0.88
    },
    risk_index: risk / 100,
    market_share: 12.5
  };

  return {
    revenue,
    netProfit,
    debtRatio: (totalDebt / Math.max(finalEquity, 1)) * 100,
    creditRating: rating,
    totalOutflow: operatingCosts + (decisions.finance.buyMachines.alfa * mValues.alfa),
    totalLiquidity: prevCash + decisions.finance.loanRequest,
    health: {
      rating,
      insolvency_risk: risk,
      is_bankrupt: finalEquity <= 0,
      liquidity_ratio: liquidityRatio
    },
    advanced,
    costBreakdown: [
      { name: 'Depreciação', total: periodDepreciation, impact: 'Fidelity Wear' },
      { name: 'OPEX', total: operatingCosts, impact: 'Maintainability' }
    ],
    statements: {
      dre: { revenue, operating_profit: netProfit + periodDepreciation, net_profit: netProfit },
      balance_sheet: {
        assets: { current: { cash: prevCash + revenue - operatingCosts }, total: prevCash + revenue + (machinesOwned.alfa * mValues.alfa) },
        equity: { total: finalEquity },
        liabilities: { total_debt: totalDebt }
      },
      cash_flow: { operating_cash_flow: revenue - operatingCosts },
      kpis: { market_share: 12.5, debt_to_equity: (totalDebt / Math.max(finalEquity, 1)) }
    }
  };
};
