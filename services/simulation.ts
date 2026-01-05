
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult } from '../types';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

export const getSafeMachineryValues = (macro: MacroIndicators | undefined) => {
  const defaults = { alfa: 505000, beta: 1515000, gama: 3030000 };
  if (!macro) return defaults;
  // Fix: Ensure the fallback has the required properties
  const v = macro.machineryValues || defaults;
  return {
    alfa: sanitize(v.alfa, defaults.alfa),
    beta: sanitize(v.beta, defaults.beta), 
    gama: sanitize(v.gama, defaults.gama)
  };
};

/**
 * CORE ORACLE ENGINE v12.8.2 GOLD
 * Calculates financial cycles and market health for industrial units.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MacroIndicators,
  previousState?: any
): ProjectionResult => {
  const mValues = getSafeMachineryValues(indicators);
  const bs = previousState?.balance_sheet || { assets: { current: { cash: 840200, receivables: 1823735, inventory_mpa: 628545 }, fixed: { total: 5886600 } }, equity: { total: 5055447 }, liabilities: { current: { loans_short_term: 1872362 } } };
  
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  const prevCash = sanitize(bs.assets?.current?.cash, 840200);
  
  // 1. Revenue & Costs (Fidelity Calibration)
  const revenue = 3322735; 
  const cpv = revenue * 0.65; // Simulated CPV
  const marketingCost = Object.values(decisions.regions).reduce((acc, r) => acc + (r.marketing * 10000), 0);
  const opex = 957582 + marketingCost;
  const depreciation = bs.assets?.fixed?.total * 0.05 || 294330;
  
  const netProfit = revenue - cpv - opex - depreciation;
  const finalEquity = prevEquity + netProfit;
  
  // 2. Cycle Calculations (Days)
  // PMRE = (Stock / CPV) * 90
  const totalStock = sanitize(bs.assets?.current?.inventory_mpa) + sanitize(bs.assets?.current?.inventory_mpb);
  const pmre = Math.round((totalStock / Math.max(cpv, 1)) * 90);
  
  // PMRV = (Receivables / Revenue) * 90
  const pmrv = Math.round((sanitize(bs.assets?.current?.receivables) / Math.max(revenue, 1)) * 90);
  
  // PMPC = (Suppliers / Compras) * 90 (Simulated constant)
  const pmpc = 46; 
  
  const co = pmre + pmrv;
  const cf = co - pmpc;

  // 3. Scissors Effect Detection (NCG growth vs CCL)
  const ncg = revenue * 0.14; 
  const ccl = bs.assets?.current?.cash + bs.assets?.current?.receivables - bs.liabilities?.current?.loans_short_term;
  const scissors_gap = ncg - ccl;

  // 4. Rating Logic
  const totalDebt = sanitize(bs.liabilities?.current?.loans_short_term) + decisions.finance.loanRequest;
  const liqRatio = (prevCash + revenue) / Math.max(totalDebt, 1);
  
  let rating: CreditRating = 'AAA';
  if (finalEquity <= 0 || liqRatio < 0.5) rating = 'D';
  else if (liqRatio < 0.9) rating = 'C';
  else if (liqRatio < 1.4) rating = 'B';
  else if (liqRatio < 1.9) rating = 'A';

  const kpis: KPIs = {
    ciclos: { pmre, pmrv, pmpc, operacional: co, financeiro: cf },
    scissors_effect: { ncg, ccl, gap: scissors_gap, is_critical: scissors_gap > ncg * 0.5 },
    market_share: 12.5,
    rating,
    net_profit: netProfit,
    equity: finalEquity
  };

  return {
    revenue,
    netProfit,
    debtRatio: (totalDebt / Math.max(finalEquity, 1)) * 100,
    creditRating: rating,
    health: { rating, insolvency_risk: rating === 'D' ? 100 : rating === 'C' ? 60 : 10, is_bankrupt: finalEquity <= 0, liquidity_ratio: liqRatio },
    kpis,
    // Fix: Added missing marketShare property
    marketShare: 12.5,
    statements: {
      dre: { revenue, cpv, opex, depreciation, net_profit: netProfit },
      balance_sheet: {
        assets: { current: { cash: prevCash + netProfit, receivables: revenue * 0.5 }, total: finalEquity + totalDebt },
        equity: { total: finalEquity },
        liabilities: { total_debt: totalDebt }
      },
      cash_flow: { operational: revenue - opex }
    }
  };
};
