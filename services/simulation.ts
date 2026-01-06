
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES } from '../constants';

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
  if (lc > 1.2) score += 30; else if (lc > 1) score += 15;
  if (endividamento < 80) score += 25; else if (endividamento < 120) score += 10;
  if (margem > 10) score += 20; else if (margem > 0) score += 10;
  if (!hasScissorsEffect) score += 25;

  if (hasScissorsEffect) score -= 15;
  score = Math.max(0, score);

  let rating: CreditRating = 'AAA';
  let interest_rate = selic + 0.005; 
  let credit_limit = equity * 1.5;

  if (score < 30) {
    rating = 'E';
    interest_rate = 0; 
    credit_limit = 0;
  } else if (score < 50) {
    rating = 'C';
    interest_rate = selic + 0.10; 
    credit_limit = equity * 0.5;
  } else if (score < 70) {
    rating = 'B';
    interest_rate = selic + 0.05; 
    credit_limit = equity * 1.0;
  } else if (score < 90) {
    rating = 'AA';
    interest_rate = selic + 0.02; 
    credit_limit = equity * 1.5;
  }

  return { score, rating, interest_rate, credit_limit, can_borrow: score >= 30 };
};

/**
 * MARKET VALUATION KERNEL v1.0
 */
export const calculateMarketValuation = (
  equity: number, 
  netProfit: number, 
  rating: CreditRating, 
  previousSharePrice: number,
  initialShares: number = DEFAULT_TOTAL_SHARES
) => {
  const vpa = equity / initialShares;
  const ratingMultipliers: Record<CreditRating, number> = {
    'AAA': 1.4, 'AA': 1.25, 'A': 1.15, 'B': 1.0, 'C': 0.8, 'D': 0.5, 'E': 0.2, 'N/A': 1.0
  };
  const multi = ratingMultipliers[rating] || 1.0;
  const profitBonus = netProfit > 0 ? (netProfit / equity) * 5 : (netProfit / equity) * 10;
  const share_price = Math.max(0.01, vpa * (multi + profitBonus));
  const tsr = ((share_price - previousSharePrice) / Math.max(previousSharePrice, 0.01)) * 100;

  return { share_price, total_shares: initialShares, market_cap: share_price * initialShares, tsr };
};

/**
 * INSOLVENCY MONITOR v1.0
 */
export const checkInsolvencyStatus = (financials: any, history: any): { status: InsolvencyStatus, severity: number, canOperate: boolean, restriction?: string } => {
  const { pl, ac, pc, caixa, capitalSocial, endividamento, lc } = financials;
  if (pl <= 0 && caixa <= 0) return { status: 'BANKRUPT', severity: 3, canOperate: false };

  const isCFOpNegativeHistory = (history?.lastTwoRounds || []).length >= 2 && history.lastTwoRounds.every((r: any) => r.fluxoCaixaOperacional < 0);
  if (isCFOpNegativeHistory && endividamento > 150) return { status: 'RJ', severity: 2, canOperate: true, restriction: 'BLOCK_INVESTMENT' };

  if (lc < 0.8 || pl < (capitalSocial * 0.2)) return { status: 'ALERTA', severity: 1, canOperate: true, restriction: 'HIGH_INTEREST' };
  return { status: 'SAUDAVEL', severity: 0, canOperate: true };
};

/**
 * CORE ORACLE ENGINE v12.9.1 GOLD
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators: MacroIndicators = { growth_rate: 3, inflation_rate: 1, interest_rate_tr: 3, tax_rate_ir: 15.0, machinery_values: { alfa: 505000, beta: 1515000, gama: 3030000 } },
  previousState?: any,
  history?: any,
  regionType: RegionType = 'mixed'
): ProjectionResult => {
  const bs = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevKpis = previousState?.kpis || {};
  
  const prevEquity = sanitize(bs.equity?.total || (bs.equity?.accumulated_profit + bs.equity?.capital_social), 5055447);
  const prevCash = sanitize(bs.assets?.current?.cash, 0);
  const selic = sanitize(indicators?.interest_rate_tr, 3.0) / 100;
  const prevSharePrice = sanitize(prevKpis.market_valuation?.share_price, 1.0);
  
  // LOGICA DE ESCOPO GEOGRÁFICO
  let logisticsMultiplier = 1.0;
  let opexBase = 917582;
  
  if (regionType === 'international') {
      logisticsMultiplier = 1.6;
      opexBase *= 1.25;
  } else if (regionType === 'mixed') {
      logisticsMultiplier = 1.3;
      opexBase *= 1.1;
  }

  const regionArray = Object.values(decisions.regions);
  const avgPrice = regionArray.reduce((acc, curr) => acc + curr.price, 0) / Math.max(regionArray.length, 1);
  const totalMarketing = regionArray.reduce((acc, curr) => acc + curr.marketing, 0);
  
  const priceElasticity = Math.max(0.5, 1 - ((avgPrice - 370) / 370));
  const marketingBoost = Math.min(1.5, 1 + (totalMarketing / (regionArray.length * 5000)));
  const demandFactor = indicators.growth_rate / 100 + 1;
  
  const unitsSold = Math.floor(10000 * priceElasticity * marketingBoost * demandFactor * (ecoConfig.demand_multiplier || 1));
  const revenue = unitsSold * avgPrice;
  
  const cpv = unitsSold * (indicators.providerPrices?.mpA || 62.8) * 0.8;
  const opex = opexBase * (1 + indicators.inflation_rate / 100);
  const fin_exp = 40000 * (1 + selic);
  const ir_prov = Math.max(0, (revenue - cpv - opex - fin_exp) * 0.15);
  
  const netProfit = revenue - cpv - opex - fin_exp - ir_prov;
  const finalEquity = prevEquity + netProfit;
  
  // EFEITO TESOURA - Cálculos Precisos v12.9.1
  const ac = 3290340; 
  const pc = 4121493; // Ajustado conforme exemplo P0 (incluindo financiamentos CP)
  const cgl = ac - pc;
  
  const estoques = 1466605;
  const clientes = 1823735;
  const fornecedores = 717605;
  
  const ncg = clientes + estoques - fornecedores;
  const tesouraria = cgl - ncg;
  const hasScissorsEffect = ncg > cgl;
  const tsf = (tesouraria / Math.max(ncg, 1)) * 100;

  const lc = ac / Math.max(pc, 1);
  const totalDebt = pc + 1500000;
  const endividamento = (totalDebt / Math.max(finalEquity, 1)) * 100;
  const margem = (netProfit / Math.max(revenue, 1)) * 100;

  const bankDetails = calculateBankRating({ lc, endividamento, margem, equity: finalEquity }, hasScissorsEffect, selic);
  const insolvency = checkInsolvencyStatus({ 
    pl: finalEquity, ac, pc, caixa: prevCash + netProfit, 
    capitalSocial: 5000000, 
    endividamento, lc 
  }, history);

  const valuation = calculateMarketValuation(finalEquity, netProfit, bankDetails.rating, prevSharePrice);

  const kpis: KPIs = {
    ciclos: { pmre: 30, pmrv: 45, pmpc: 46, operacional: 75, financeiro: 29 },
    scissors_effect: { 
      ncg, 
      ccl: cgl, 
      tesouraria, 
      ccp: finalEquity - 5886600, 
      tsf,
      is_critical: hasScissorsEffect 
    },
    banking: bankDetails,
    market_valuation: valuation,
    market_share: Math.min(100, (unitsSold / 100000) * 100),
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
    marketShare: kpis.market_share,
    statements: {
      dre: { revenue, cpv, opex, depreciation: 0, net_profit: netProfit },
      balance_sheet: {
        assets: { current: { cash: prevCash + netProfit, receivables: 1823735 }, total: 9176940 },
        equity: { total: finalEquity },
        liabilities: { total_debt: totalDebt }
      },
      cash_flow: { operational: revenue - opex, total: prevCash + netProfit }
    }
  };
};
