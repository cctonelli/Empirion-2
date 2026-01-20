
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * CORE ORACLE ENGINE v15.0 - INTERNATIONAL MULTI-CURRENCY
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
  forcedShare?: number,
  championshipData?: Championship
): ProjectionResult => {
  const bs = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  const indicators = { ...baseIndicators, ...(roundRules?.[currentRound] || {}) };
  const baseCurrency = championshipData?.currency || 'BRL';

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

  // 2. DEMANDA REGIONAL E CONVERSÃO CAMBIAL
  const iceMultiplier = 1 + (indicators.ice / 100);
  const totalMarketDemand = (2500 * (indicators.regions_count || 4) * 4) * iceMultiplier;
  
  let totalRevenueBase = 0;
  let totalUnitsSold = 0;

  // Itera sobre as configurações regionais se existirem
  const regions = championshipData?.region_configs || Array.from({ length: indicators.regions_count || 4 }, (_, i) => ({
     id: i + 1,
     currency: 'BRL' as CurrencyType,
     demand_weight: 100 / (indicators.regions_count || 4)
  }));

  regions.forEach(reg => {
     const decision = decisions.regions[reg.id] || { price: 375, term: 1, marketing: 0 };
     const regionalWeight = reg.demand_weight / 100;
     const regionalDemand = totalMarketDemand * regionalWeight;
     
     // Cálculo de share simulado por região
     const priceFactor = Math.pow(370 / Math.max(decision.price, 100), 1.5);
     const promoFactor = 1 + (decision.marketing * 0.05);
     const shareMultiplier = priceFactor * promoFactor;
     
     const unitsSoldReg = Math.min(regionalDemand * (shareMultiplier / 10), regionalDemand);
     totalUnitsSold += unitsSoldReg;

     // Receita na moeda local da região
     const revenueLocal = unitsSoldReg * decision.price;

     // Conversão para moeda base do campeonato
     const exchangeRate = indicators.exchange_rates?.[reg.currency] || 1;
     const baseExchangeRate = indicators.exchange_rates?.[baseCurrency] || 1;
     
     // Se a moeda regional for USD e a base for BRL, revenueBase = revenueLocal * (5.2 / 1)
     const conversionFactor = exchangeRate / baseExchangeRate;
     totalRevenueBase += revenueLocal * conversionFactor;
  });

  // Limita vendas pela capacidade produtiva
  const salesAdjustmentFactor = totalUnitsSold > totalCapacity ? totalCapacity / totalUnitsSold : 1;
  const finalRevenue = totalRevenueBase * salesAdjustmentFactor;
  const finalUnitsSold = totalUnitsSold * salesAdjustmentFactor;

  // 3. DRE & PL
  const cpv = finalUnitsSold * (indicators.prices.mp_a * 3 + indicators.prices.mp_b * 2) + 32000;
  const opex = 917582 * (1 + (indicators.inflation_rate / 100));
  const netProfit = finalRevenue - cpv - opex;
  const finalEquity = prevEquity + netProfit;

  // 4. BALANÇO & KANITZ
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
    revenue: finalRevenue, netProfit, debtRatio: ((pc + pnc) / finalEquity) * 100, creditRating: rating,
    marketShare: (finalUnitsSold / totalMarketDemand) * 100,
    health: { rating, kanitz_fi: kanitz.fi, status: kanitz.status },
    kpis: {
      market_share: (finalUnitsSold / totalMarketDemand) * 100,
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
        dre: { revenue: finalRevenue, cpv, opex, net_profit: netProfit },
        balance_sheet: { assets: { total: ac + 5886600 + totalCapex }, equity: { total: finalEquity } }
      }
    },
    statements: { dre: { revenue: finalRevenue, cpv, opex, net_profit: netProfit }, balance_sheet: { assets: { total: ac + 5886600 + totalCapex } } }
  };
};

/**
 * Fix: Added missing calculateAttractiveness export for competitive market share simulation
 */
export const calculateAttractiveness = (decisions: DecisionData): number => {
  const regions = Object.values(decisions.regions);
  if (regions.length === 0) return 0.5;

  let totalAttraction = 0;
  regions.forEach(reg => {
    // Fator Preço: Mais barato = mais atraente. Base $370.
    const priceFactor = Math.pow(370 / Math.max(reg.price, 100), 1.5);
    // Fator Marketing: 0 a 9 impactando progressivamente.
    const marketingFactor = 1 + (reg.marketing * 0.08);
    totalAttraction += priceFactor * marketingFactor;
  });

  return totalAttraction / regions.length;
};

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

export const calculateBankRating = (fi: number, netProfit: number) => {
  if (fi > 3) return 'AAA';
  if (fi > 1) return 'AA';
  if (fi > 0) return 'A';
  if (fi > -1.5) return 'B';
  if (fi > -3) return 'C';
  return 'D';
};
