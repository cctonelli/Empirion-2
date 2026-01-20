
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * Modelo de Kanitz – FATOR DE INSOLVÊNCIA (FI)
 * FI = (0.05 * X1) + (1.65 * X2) + (3.55 * X3) - (1.06 * X4) - (0.33 * X5)
 * Baseline Result: 2.19
 */
export const calculateKanitzFactor = (data: {
  netProfit: number,
  equity: number,
  currentAssets: number,
  longTermAssets: number,
  currentLiabilities: number,
  longTermLiabilities: number,
  inventory: number
}) => {
  const exigivelTotal = Math.max(data.currentLiabilities + data.longTermLiabilities, 1);
  const pl = Math.max(data.equity, 1);
  const pc = Math.max(data.currentLiabilities, 1);

  const x1 = data.netProfit / pl; 
  const x2 = (data.currentAssets + data.longTermAssets) / exigivelTotal; 
  const x3 = (data.currentAssets - data.inventory) / pc; 
  const x4 = data.currentAssets / pc; 
  const x5 = exigivelTotal / pl; 

  const fi = (0.05 * x1) + (1.65 * x2) + (3.55 * x3) - (1.06 * x4) - (0.33 * x5);
  
  let status: InsolvencyStatus = 'SAUDAVEL';
  if (fi <= -3) status = 'BANKRUPT';
  else if (fi <= 0) status = 'ALERTA';

  return { fi, x1, x2, x3, x4, x5, status };
};

/**
 * Cálculo de Atratividade Individual para Market Share
 */
export const calculateAttractiveness = (decisions: DecisionData) => {
  const regions = decisions.regions || {};
  let totalAttraction = 0;
  
  Object.values(regions).forEach((reg: any) => {
    const priceFactor = Math.pow(370 / Math.max(reg.price, 100), 1.5);
    const promoFactor = 1 + (reg.marketing * 0.05);
    const termFactor = 1 + (reg.term * 0.02);
    totalAttraction += priceFactor * promoFactor * termFactor;
  });
  
  return totalAttraction / Math.max(Object.keys(regions).length, 1);
};

export const calculateBankRating = (fi: number, netProfit: number) => {
  if (fi > 3) return 'AAA';
  if (fi > 1) return 'AA';
  if (fi > 0) return 'A';
  if (fi > -1.5) return 'B';
  if (fi > -3) return 'C';
  return 'D';
};

/**
 * CORE ORACLE ENGINE v14.9 - COMPETITIVE SHARING
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  baseIndicators: MacroIndicators = DEFAULT_MACRO,
  previousState?: any,
  roundHistory: any[] = [],
  currentRound: number = 1,
  roundRules?: Record<number, Partial<MacroIndicators>>,
  forcedShare?: number // Share calculado externamente pela competição real
): ProjectionResult => {
  const bs = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  const indicators = { ...baseIndicators, ...(roundRules?.[currentRound] || {}) };

  // 1. CAPEX & CAPACIDADE
  const getAdjustedPrice = (model: MachineModel, base: number) => {
    let adj = 1.0;
    const rate = indicators[`machine_${model}_price_adjust`] || 0;
    for (let i = 0; i < currentRound; i++) adj *= (1 + rate / 100);
    return base * adj;
  };

  const totalCapex = (decisions.machinery.buy.alfa * getAdjustedPrice('alfa', indicators.machinery_values.alfa));
  const downPayment = totalCapex * 0.4;

  const specs = indicators.machine_specs || DEFAULT_MACRO.machine_specs;
  const totalCapacity = 10000 + (decisions.machinery.buy.alfa * specs.alfa.production_capacity);

  // 2. DEMANDA & RECEITA (MODO COMPETITIVO)
  const iceMultiplier = 1 + (indicators.ice / 100);
  const totalMarketDemand = (2500 * (indicators.regions_count || 4) * 4) * iceMultiplier;
  
  // Se forcedShare não existir (em rascunho), simula um share saudável baseado na atratividade
  const finalShare = forcedShare ?? (calculateAttractiveness(decisions) * 10);
  const unitsSold = Math.min(totalCapacity, (totalMarketDemand * (finalShare / 100)));
  
  const avgPrice = Object.values(decisions.regions).reduce((acc, r) => acc + r.price, 0) / Math.max(Object.keys(decisions.regions).length, 1);
  const revenue = unitsSold * avgPrice;

  // 3. DRE & PL
  const cpv = unitsSold * (indicators.prices.mp_a * 3 + indicators.prices.mp_b * 2) + 32000;
  const opex = 917582 * (1 + (indicators.inflation_rate / 100));
  const netProfit = revenue - cpv - opex;
  const finalEquity = prevEquity + netProfit;

  // 4. BALANÇO & KANITZ (PRECISÃO 2.19)
  const ac = sanitize(bs.assets?.current?.total, 3290340) + netProfit - downPayment;
  const pc = sanitize(bs.liabilities?.current, 2621493);
  const pnc = sanitize(bs.liabilities?.long_term, 1500000);
  const inventory = 1466605;

  const kanitz = calculateKanitzFactor({
    netProfit, equity: finalEquity, currentAssets: ac, longTermAssets: 0,
    currentLiabilities: pc, longTermLiabilities: pnc, inventory
  });

  const rating = calculateBankRating(kanitz.fi, netProfit);
  const sharePrice = finalEquity / DEFAULT_TOTAL_SHARES;

  return {
    revenue, netProfit, debtRatio: ((pc + pnc) / finalEquity) * 100, creditRating: rating,
    marketShare: finalShare,
    health: { rating, kanitz_fi: kanitz.fi, status: kanitz.status },
    kpis: {
      market_share: finalShare,
      rating,
      insolvency_status: kanitz.status,
      equity: finalEquity,
      kanitz_factor: kanitz.fi,
      market_valuation: { 
        share_price: sharePrice, 
        total_shares: DEFAULT_TOTAL_SHARES, 
        market_cap: finalEquity, 
        tsr: ((sharePrice - 1.0) / 1.0) * 100 
      },
      statements: { 
        dre: { revenue, cpv, opex, net_profit: netProfit },
        balance_sheet: { assets: { total: ac + 5886600 + totalCapex }, equity: { total: finalEquity } }
      }
    },
    statements: { dre: { revenue, cpv, opex, net_profit: netProfit }, balance_sheet: { assets: { total: ac + 5886600 + totalCapex } } }
  };
};
