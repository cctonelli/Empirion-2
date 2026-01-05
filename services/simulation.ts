import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus } from '../types';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * BANKING RATING ENGINE v1.0
 * Calculates credit score based on fidelity indicators.
 */
export const calculateBankRating = (financials: any, hasScissorsEffect: boolean, selic: number) => {
  const { lc, endividamento, margem } = financials;
  
  let score = 0;
  if (lc > 1.2) score += 30; else if (lc > 1) score += 15;
  if (endividamento < 80) score += 25; else if (endividamento < 120) score += 10;
  if (margem > 10) score += 20; else if (margem > 0) score += 10;
  if (!hasScissorsEffect) score += 25;

  // Max Penalty for Scissors Effect
  if (hasScissorsEffect) score -= 15;
  score = Math.max(0, score);

  let rating: CreditRating = 'AAA';
  let interest_rate = selic + 0.005; // 0.5%
  let credit_limit = financials.equity * 1.5;

  if (score < 30) {
    rating = 'E';
    interest_rate = 0; // Credit Denied
    credit_limit = 0;
  } else if (score < 50) {
    rating = 'C';
    interest_rate = selic + 0.10; // 10% spread
    credit_limit = financials.equity * 0.5;
  } else if (score < 70) {
    rating = 'B';
    interest_rate = selic + 0.05; // 5% spread
    credit_limit = financials.equity * 1.0;
  } else if (score < 90) {
    rating = 'A';
    interest_rate = selic + 0.02; // 2% spread
    credit_limit = financials.equity * 1.5;
  }

  return { score, rating, interest_rate, credit_limit, can_borrow: score > 30 };
};

/**
 * INSOLVENCY MONITOR v1.0
 * Triggers RJ and Bankruptcy states based on ERPS fidelity.
 */
export const checkInsolvency = (financials: any, history: any): { status: InsolvencyStatus, restriction?: string } => {
  const { pl, ac, pc, caixa, capitalSocial, endividamento, lc } = financials;
  
  // 1. Bankruptcy (Terminal State)
  if (pl <= 0 && caixa <= 0) {
    return { status: 'BANKRUPT' };
  }

  // 2. Judicial Recovery (RJ)
  const isCFOpNegativeHistory = (history?.lastTwoRounds || []).every((r: any) => r.fluxoCaixaOperacional < 0);
  if (isCFOpNegativeHistory && endividamento > 150) {
    return { status: 'RJ', restriction: 'BLOCK_INVESTMENT' };
  }

  // 3. Alert
  if (lc < 0.8 || pl < (capitalSocial * 0.2)) {
    return { status: 'ALERTA', restriction: 'HIGH_INTEREST' };
  }

  return { status: 'SAUDAVEL' };
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
  const bs = previousState?.balance_sheet || { 
    assets: { current: { cash: 840200, receivables: 1823735, inventory_mpa: 628545, inventory_mpb: 838060 }, fixed: { total: 5886600 } }, 
    equity: { total: 5055447, capital_social: 5000000 }, 
    liabilities: { current: { loans_short_term: 1872362, total: 2603012 }, total: 4103012 } 
  };
  
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  const prevCash = sanitize(bs.assets?.current?.cash, 840200);
  const selic = sanitize(indicators?.interestRateTR, 3.0) / 100;
  
  // 1. Revenue & Costs
  const revenue = 3322735; 
  const cpv = revenue * 0.65;
  const marketingCost = Object.values(decisions.regions).reduce((acc, r) => acc + (r.marketing * 10000), 0);
  const opex = 957582 + marketingCost;
  const depreciation = bs.assets?.fixed?.total * 0.05 || 294330;
  const netProfit = revenue - cpv - opex - depreciation;
  const finalEquity = prevEquity + netProfit;
  
  // 2. Base Indices
  const ac = bs.assets?.current?.cash + bs.assets?.current?.receivables + bs.assets?.current?.inventory_mpa + bs.assets?.current?.inventory_mpb;
  const pc = sanitize(bs.liabilities?.current?.total, 2603012);
  const lc = ac / Math.max(pc, 1);
  const endividamento = (sanitize(bs.liabilities?.total, 4103012) / Math.max(finalEquity, 1)) * 100;
  const margem = (netProfit / Math.max(revenue, 1)) * 100;

  // 3. Scissors Effect
  const ncg = revenue * 0.14; 
  const ccl = ac - pc;
  const hasScissorsEffect = ncg > ccl;

  // 4. Banking & Insolvency
  const bankDetails = calculateBankRating({ lc, endividamento, margem, equity: finalEquity }, hasScissorsEffect, selic);
  const insolvency = checkInsolvency({ pl: finalEquity, ac, pc, caixa: prevCash + netProfit, capitalSocial: bs.equity?.capital_social, endividamento, lc }, history);

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
    health: { rating: bankDetails.rating, insolvency_risk: bankDetails.score < 50 ? 80 : 10, is_bankrupt: insolvency.status === 'BANKRUPT', liquidity_ratio: lc },
    kpis,
    statements: {
      dre: { revenue, cpv, opex, depreciation, net_profit: netProfit },
      balance_sheet: {
        assets: { current: { cash: prevCash + netProfit, receivables: revenue * 0.5 }, total: finalEquity + (pc * 1.5) },
        equity: { total: finalEquity },
        liabilities: { total: pc * 1.5 }
      },
      cash_flow: { operational: revenue - opex, total: prevCash + netProfit }
    }
  };
};