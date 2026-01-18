
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * Added missing calculateBankRating implementation
 */
export const calculateBankRating = (data: { lc: number, endividamento: number, margem: number, equity: number }, hasScissorsEffect: boolean, selic: number) => {
  let score = 0;
  if (data.lc > 1.2) score += 30;
  if (data.endividamento < 50) score += 30;
  if (data.margem > 5) score += 40;
  if (hasScissorsEffect) score -= 20;

  let rating: CreditRating = 'AAA';
  if (score < 30) rating = 'D';
  else if (score < 50) rating = 'C';
  else if (score < 70) rating = 'B';
  else if (score < 85) rating = 'A';
  else if (score < 95) rating = 'AA';

  return { rating, score, credit_limit: Math.max(0, data.equity * 0.5) };
};

/**
 * Added missing calculateMarketValuation implementation
 */
export const calculateMarketValuation = (equity: number, profit: number, rating: CreditRating, prevPrice: number) => {
  const multiplier = rating === 'AAA' ? 1.5 : rating === 'AA' ? 1.3 : rating === 'A' ? 1.1 : rating === 'B' ? 0.9 : 0.7;
  const valuation = (equity + Math.max(0, profit) * 12) * multiplier;
  const sharePrice = Math.max(0.01, valuation / DEFAULT_TOTAL_SHARES);
  return { 
    share_price: sharePrice, 
    total_shares: DEFAULT_TOTAL_SHARES, 
    market_cap: valuation, 
    tsr: ((sharePrice - prevPrice) / Math.max(0.001, prevPrice)) * 100 
  };
};

/**
 * Added missing checkInsolvencyStatus implementation
 * Fix: Ensure 'BANKRUPT' is reachable to avoid unintentional type comparison error
 */
export const checkInsolvencyStatus = (data: any, history?: any) => {
  const isHealthy = data.lc > 1.0 && data.endividamento < 150;
  let status: InsolvencyStatus = 'SAUDAVEL';
  
  if (!isHealthy) status = 'ALERTA';
  if (data.endividamento > 300 || data.lc < 0.2) status = 'RJ';
  if (data.endividamento > 500 || data.lc < 0.05) status = 'BANKRUPT';
  
  return { 
    status, 
    canOperate: status !== 'BANKRUPT',
    insolvency_risk: status === 'SAUDAVEL' ? 5 : status === 'ALERTA' ? 25 : status === 'RJ' ? 60 : 100
  };
};

/**
 * CORE ORACLE ENGINE v13.2 GOLD
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators: MacroIndicators = DEFAULT_MACRO,
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
  
  // LOGICA DE RECEITA E DEMANDA
  const regionArray = Object.values(decisions.regions);
  const avgPrice = regionArray.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0) / Math.max(regionArray.length, 1);
  const totalMarketing = regionArray.reduce((acc: number, curr: any) => acc + (curr.marketing || 0), 0);
  
  const priceElasticity = Math.max(0.5, 1 - ((avgPrice - 370) / 370));
  const marketingBoost = Math.min(1.5, 1 + (totalMarketing / (Math.max(1, regionArray.length) * 5))); // Escala 0-9
  const demandFactor = (indicators.ice || 3) / 100 + 1;
  
  // PRODUÇÃO IMPACTADA POR PRODUTIVIDADE (PDF TUTOR)
  const laborFactor = indicators.labor_productivity || 1.0;
  const rawUnitsSold = 10000 * priceElasticity * marketingBoost * demandFactor * (ecoConfig.demand_multiplier || 1);
  const unitsSold = Math.floor(rawUnitsSold * laborFactor);
  
  const revenue = unitsSold * avgPrice;
  
  // CUSTOS REAJUSTADOS
  const mpACost = (indicators.prices?.mp_a || 20) * (1 + (indicators.raw_material_a_adjust || 0) / 100);
  const mpBCost = (indicators.prices?.mp_b || 40) * (1 + (indicators.raw_material_b_adjust || 0) / 100);
  
  const cpv = unitsSold * (mpACost * 0.8 + mpBCost * 0.2); // Mix simplificado
  const opex = 917582 * (1 + (indicators.inflation_rate || 0) / 100);
  const netProfit = revenue - cpv - opex - 40000; 
  const finalEquity = prevEquity + netProfit;
  
  // EFEITO TESOURA E RATING (Lógica Financeira v1.0)
  const ac = 3290340; 
  const pc = 4121493; 
  const cgl = ac - pc;
  const ncg = 1823735 + 1466605 - 717605;
  const tesouraria = cgl - ncg;
  const hasScissorsEffect = ncg > cgl;

  const lc = ac / Math.max(pc, 1);
  const endividamento = ((pc + 1500000) / Math.max(finalEquity, 1)) * 100;
  const margem = (netProfit / Math.max(revenue, 1)) * 100;

  const bankDetails = calculateBankRating({ lc, endividamento, margem, equity: finalEquity }, hasScissorsEffect, selic);
  const insolvency = checkInsolvencyStatus({ pl: finalEquity, ac, pc, caixa: prevCash + netProfit, capitalSocial: 5000000, endividamento, lc }, history);
  const valuation = calculateMarketValuation(finalEquity, netProfit, bankDetails.rating, prevSharePrice);

  const kpis: KPIs = {
    ciclos: { pmre: 30, pmrv: 45, pmpc: 46, operacional: 75, financeiro: 29 },
    scissors_effect: { ncg, ccl: cgl, tesouraria, ccp: finalEquity - 5886600, tsf: (tesouraria/ncg)*100, is_critical: hasScissorsEffect },
    banking: bankDetails,
    market_valuation: valuation,
    market_share: Math.min(100, (unitsSold / 100000) * 100),
    rating: bankDetails.rating,
    insolvency_status: insolvency.status,
    net_profit: netProfit,
    equity: finalEquity
  };

  return {
    revenue, netProfit, debtRatio: endividamento, creditRating: bankDetails.rating,
    health: { rating: bankDetails.rating, insolvency_risk: insolvency.insolvency_risk, is_bankrupt: !insolvency.canOperate, liquidity_ratio: lc },
    kpis, marketShare: kpis.market_share,
    statements: {
      dre: { revenue, cpv, opex, depreciation: 0, net_profit: netProfit },
      balance_sheet: {
        assets: { current: { cash: prevCash + netProfit, receivables: 1823735 }, total: 9176940 },
        equity: { total: finalEquity },
        liabilities: { total_debt: pc + 1500000 }
      },
      current_cash: prevCash + netProfit
    } as any
  };
};
