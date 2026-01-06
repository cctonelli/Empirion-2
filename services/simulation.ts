
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * BANKING RATING ENGINE v1.0
 * Calculates credit score based on fidelity indicators.
 */
export const calculateBankRating = (financials: any, hasScissorsEffect: boolean, selic: number) => {
  const { lc, endividamento, margem, equity } = financials;
  
  let score = 0;
  // Weighted calculation following spec v1.0
  if (lc > 1.2) score += 30; else if (lc > 1) score += 15;
  if (endividamento < 80) score += 25; else if (endividamento < 120) score += 10;
  if (margem > 10) score += 20; else if (margem > 0) score += 10;
  if (!hasScissorsEffect) score += 25;

  // Penalty for Scissors Effect (NCG > CCL)
  if (hasScissorsEffect) score -= 15;
  score = Math.max(0, score);

  let rating: CreditRating = 'AAA';
  let interest_rate = selic + 0.005; // 0.5% spread
  let credit_limit = equity * 1.5;

  if (score < 30) {
    rating = 'E';
    interest_rate = 0; // Credit Denied
    credit_limit = 0;
  } else if (score < 50) {
    rating = 'C';
    interest_rate = selic + 0.10; // 10% spread
    credit_limit = equity * 0.5;
  } else if (score < 70) {
    rating = 'B';
    interest_rate = selic + 0.05; // 5% spread
    credit_limit = equity * 1.0;
  } else if (score < 90) {
    rating = 'AA';
    interest_rate = selic + 0.02; // 2% spread
    credit_limit = equity * 1.5;
  }

  return { score, rating, interest_rate, credit_limit, can_borrow: score >= 30 };
};

/**
 * INSOLVENCY MONITOR v1.0
 * Triggers RJ and Bankruptcy states based on ERPS fidelity.
 */
export const checkInsolvencyStatus = (financials: any, history: any): { status: InsolvencyStatus, severity: number, canOperate: boolean, restriction?: string } => {
  const { pl, ac, pc, caixa, capitalSocial, endividamento, lc } = financials;
  
  // 1. Bankruptcy (Terminal State)
  if (pl <= 0 && caixa <= 0) {
    return { status: 'BANKRUPT', severity: 3, canOperate: false };
  }

  // 2. Judicial Recovery (RJ) - CFO negative for 2 rounds + Debt > 150%
  const isCFOpNegativeHistory = (history?.lastTwoRounds || []).length >= 2 && history.lastTwoRounds.every((r: any) => r.fluxoCaixaOperacional < 0);
  if (isCFOpNegativeHistory && endividamento > 150) {
    return { status: 'RJ', severity: 2, canOperate: true, restriction: 'BLOCK_INVESTMENT' };
  }

  // 3. Alert
  if (lc < 0.8 || pl < (capitalSocial * 0.2)) {
    return { status: 'ALERTA', severity: 1, canOperate: true, restriction: 'HIGH_INTEREST' };
  }

  return { status: 'SAUDAVEL', severity: 0, canOperate: true };
};

/**
 * CORE ORACLE ENGINE v12.8.5 GOLD
 * Orchestrates cycles, ratings and insolvency for industrial fidelity.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MacroIndicators,
  previousState?: any,
  history?: any
): ProjectionResult => {
  const bs = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  
  const prevEquity = sanitize(bs.equity?.total || bs.equity?.accumulated_profit + bs.equity?.capital_social, 5055447);
  const prevCash = sanitize(bs.assets?.current?.cash, 840200);
  const selic = sanitize(indicators?.interest_rate_tr, 3.0) / 100;
  
  // 1. Revenue & Costs (Fidelity Mode)
  const revenue = 3322735; 
  const cpv = revenue * 0.65;
  const marketingCost = Object.values(decisions.regions).reduce((acc, r) => acc + (sanitize(r.marketing) * 10000), 0);
  const opex = 957582 + marketingCost;
  const depreciation = sanitize(bs.assets?.fixed?.machinery_gross, 5000000) * 0.05;
  
  const netProfit = revenue - cpv - opex - depreciation;
  const finalEquity = prevEquity + netProfit;
  
  // 2. Base Indices for Rating
  const ac = sanitize(bs.assets?.current?.cash) + sanitize(bs.assets?.current?.receivables) + sanitize(bs.assets?.current?.inventory_mpa) + sanitize(bs.assets?.current?.inventory_mpb);
  const pc = sanitize(bs.liabilities?.current?.suppliers) + sanitize(bs.liabilities?.current?.taxes_payable) + sanitize(bs.liabilities?.current?.loans_short_term);
  const lc = ac / Math.max(pc, 1);
  const totalDebt = pc + sanitize(bs.liabilities?.long_term?.loans_long_term);
  const endividamento = (totalDebt / Math.max(finalEquity, 1)) * 100;
  const margem = (netProfit / Math.max(revenue, 1)) * 100;

  // 3. Scissors Effect Detection
  const ncg = revenue * 0.14; // Needs of Working Capital
  const ccl = ac - pc;      // Net Working Capital
  const hasScissorsEffect = ncg > ccl;

  // 4. Banking Rating & Insolvency Execution
  const bankDetails = calculateBankRating({ lc, endividamento, margem, equity: finalEquity }, hasScissorsEffect, selic);
  const insolvency = checkInsolvencyStatus({ 
    pl: finalEquity, ac, pc, caixa: prevCash + netProfit, 
    capitalSocial: sanitize(bs.equity?.capital_social, 5000000), 
    endividamento, lc 
  }, history);

  const kpis: KPIs = {
    ciclos: { pmre: 30, pmrv: 45, pmpc: 46, operacional: 75, financeiro: 29 },
    scissors_effect: { ncg, ccl, gap: ncg - ccl, is_critical: hasScissorsEffect },
    banking: bankDetails,
    market_share: 12.5,
    rating: bankDetails.rating,
    insolvency_status: insolvency.status,
    net_profit: netProfit,
    equity: finalEquity
  };

  return {
    revenue,
    netProfit,
    debtRatio: endividamento,
    creditRating: bankDetails.rating,
    health: { 
      rating: bankDetails.rating, 
      insolvency_risk: bankDetails.score < 50 ? 80 : 10, 
      is_bankrupt: !insolvency.canOperate, 
      liquidity_ratio: lc 
    },
    kpis,
    marketShare: 12.5,
    statements: {
      dre: { revenue, cpv, opex, depreciation, net_profit: netProfit },
      balance_sheet: {
        assets: { current: { cash: prevCash + netProfit, receivables: revenue * 0.5 }, total: finalEquity + totalDebt },
        equity: { total: finalEquity },
        liabilities: { total_debt: totalDebt }
      },
      cash_flow: { operational: revenue - opex, total: prevCash + netProfit }
    }
  };
};
