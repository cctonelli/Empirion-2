
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

/**
 * Sanitizador Alpha Node 08
 * Bloqueia NaN, Infinity e valores nulos do fluxo de dados.
 */
export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * CORE ORACLE ENGINE v17.2 - ABSOLUTE NUMERICAL STABILITY
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
  
  // Limpeza profunda de inputs para evitar propagações de NaN via JSON
  const safeDecisions: DecisionData = JSON.parse(JSON.stringify(decisions, (key, value) => {
      if (typeof value === 'number') return (isNaN(value) || !isFinite(value)) ? 0 : value;
      return value;
  }));

  const bs = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  const prevAccumulatedProfit = sanitize(bs.equity?.accumulated_profit, 55447);
  
  const roundOverride = roundRules?.[currentRound] || {};
  const indicators = { 
    ...DEFAULT_MACRO, 
    ...baseIndicators, 
    ...roundOverride 
  };
  
  const baseCurrency = championshipData?.currency || 'BRL';

  // 1. CAPACIDADE E PREÇOS DE ATIVOS
  const productivityFactor = sanitize(indicators.labor_productivity, 1.0);
  const baseCapacity = 10000; 
  
  const getAdjustedPrice = (model: MachineModel) => {
    const base = sanitize(baseIndicators.machinery_values[model], 500000);
    const keyPart = model === 'alfa' ? 'alpha' : model === 'gama' ? 'gamma' : 'beta';
    let adjPrice = base;

    for (let r = 0; r < currentRound; r++) {
      const rate = sanitize(roundRules?.[r]?.[`machine_${keyPart}_price_adjust`] ?? baseIndicators[`machine_${keyPart}_price_adjust`], 0);
      adjPrice *= (1 + rate / 100);
    }
    return adjPrice;
  };

  const currentAlfaPrice = getAdjustedPrice('alfa');
  const currentBetaPrice = getAdjustedPrice('beta');
  const currentGamaPrice = getAdjustedPrice('gama');

  const newMachinesCapacity = (sanitize(safeDecisions.machinery.buy.alfa) * sanitize(indicators.machine_specs?.alfa?.production_capacity, 2000)) +
                             (sanitize(safeDecisions.machinery.buy.beta) * sanitize(indicators.machine_specs?.beta?.production_capacity, 6000)) +
                             (sanitize(safeDecisions.machinery.buy.gama) * sanitize(indicators.machine_specs?.gama?.production_capacity, 12000));

  const effectiveCapacity = (baseCapacity + newMachinesCapacity) * productivityFactor;
  const unitsToProduce = effectiveCapacity * (sanitize(safeDecisions.production.activityLevel, 80) / 100);

  // 2. COMPRAS ESPECIAIS
  const requiredMPA = unitsToProduce * 3;
  const requiredMPB = unitsToProduce * 2;
  const currentMPAStock = sanitize(previousState?.inventory?.mpa, 31116);
  const currentMPBStock = sanitize(previousState?.inventory?.mpb, 20744);
  const decidedMPA = sanitize(safeDecisions.production.purchaseMPA, 0);
  const decidedMPB = sanitize(safeDecisions.production.purchaseMPB, 0);
  
  const deficitMPA = Math.max(0, requiredMPA - (currentMPAStock + decidedMPA));
  const deficitMPB = Math.max(0, requiredMPB - (currentMPBStock + decidedMPB));
  
  const premiumRate = sanitize(indicators.special_purchase_premium, 15) / 100;
  const specialPurchaseCost = (deficitMPA * sanitize(indicators.prices.mp_a, 20) * (1 + premiumRate)) + 
                               (deficitMPB * sanitize(indicators.prices.mp_b, 40) * (1 + premiumRate));

  // 3. MERCADO DINÂMICO
  const iceFactor = 1 + (sanitize(indicators.ice, 3) / 100);
  const demandVarFactor = 1 + (sanitize(indicators.demand_variation, 0) / 100);
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const totalMarketDemand = (baseCapacity * teamsCount) * iceFactor * demandVarFactor;
  
  let totalRevenueBase = 0;
  let totalUnitsSold = 0;
  const regions = championshipData?.region_configs || Array.from({ length: sanitize(indicators.regions_count, 4) }, (_, i) => ({
     id: i + 1,
     currency: 'BRL' as CurrencyType,
     demand_weight: 100 / sanitize(indicators.regions_count, 4)
  }));

  regions.forEach(reg => {
     const decision = safeDecisions.regions[reg.id] || { price: 375, term: 1, marketing: 0 };
     const regionalWeight = sanitize(reg.demand_weight || (100 / regions.length)) / 100;
     const regionalDemand = totalMarketDemand * regionalWeight;
     const priceFactor = Math.pow(sanitize(indicators.avg_selling_price, 340) / Math.max(sanitize(decision.price, 100), 100), 1.6);
     const promoFactor = 1 + (sanitize(decision.marketing) * 0.06);
     const shareMultiplier = priceFactor * promoFactor;
     
     const unitsSoldReg = Math.min(regionalDemand * (shareMultiplier / teamsCount), regionalDemand);
     totalUnitsSold += unitsSoldReg;
     const revenueLocal = unitsSoldReg * sanitize(decision.price, 375);
     const exchangeRate = sanitize(indicators.exchange_rates?.[reg.currency], 1);
     const baseExchangeRate = sanitize(indicators.exchange_rates?.[baseCurrency], 1);
     totalRevenueBase += revenueLocal * (exchangeRate / baseExchangeRate);
  });

  const salesAdjustmentFactor = totalUnitsSold > unitsToProduce ? unitsToProduce / totalUnitsSold : 1;
  const finalRevenue = totalRevenueBase * salesAdjustmentFactor;
  const finalUnitsSold = totalUnitsSold * salesAdjustmentFactor;

  // 4. DRE & LÓGICA DE DIVIDENDOS
  const cpv = (finalUnitsSold * (sanitize(indicators.prices.mp_a, 20) * 3 + sanitize(indicators.prices.mp_b, 40) * 2)) + 32000;
  const baseOpex = 916522 * (1 + (sanitize(indicators.inflation_rate, 1) / 100));
  const storageCost = (Math.max(0, unitsToProduce - finalUnitsSold) * sanitize(indicators.prices.storage_finished, 20)) +
                      (Math.max(0, (decidedMPA + deficitMPA) * 0.1) * sanitize(indicators.prices.storage_mp, 1.4));
  const totalOpex = baseOpex + storageCost + specialPurchaseCost;
  const netProfit = finalRevenue - cpv - totalOpex;

  const prevDivsToPay = sanitize(bs.liabilities?.current_divs, 0);
  const dividendRate = sanitize(indicators.dividend_percent, 25) / 100;
  const currentDivProvision = netProfit > 0 ? netProfit * dividendRate : 0;
  const retainedEarnings = netProfit - currentDivProvision;

  const finalEquity = prevEquity + retainedEarnings;
  const finalAccumulatedProfit = prevAccumulatedProfit + retainedEarnings;

  // 5. BALANÇO & KPIs
  const totalCapex = (sanitize(safeDecisions.machinery.buy.alfa) * currentAlfaPrice) +
                     (sanitize(safeDecisions.machinery.buy.beta) * currentBetaPrice) +
                     (sanitize(safeDecisions.machinery.buy.gama) * currentGamaPrice);

  const ac_financial = Math.max(0, sanitize(bs.assets?.current?.cash, 0) + sanitize(bs.assets?.current?.app, 0) - prevDivsToPay);
  const receivables = finalRevenue * 0.6;
  const inventoryValue = (Math.max(0, unitsToProduce - finalUnitsSold) * 235) + (requiredMPA * sanitize(indicators.prices.mp_a, 20)) + (requiredMPB * sanitize(indicators.prices.mp_b, 40));
  
  const ac_total = ac_financial + receivables + inventoryValue;
  const pc_suppliers = finalRevenue * 0.2;
  const pc_loans = sanitize(bs.liabilities?.current_loans, 1872362) + (sanitize(safeDecisions.finance.loanRequest) * 0.3);
  
  const pc_total = pc_suppliers + pc_loans + (netProfit > 0 ? netProfit * (sanitize(indicators.tax_rate_ir, 15) / 100) : 0) + currentDivProvision;
  const pnc = sanitize(bs.liabilities?.long_term, 1500000);

  const nlcdg = (receivables + inventoryValue) - pc_suppliers;

  const kanitz = calculateKanitzFactor({
    netProfit, equity: finalEquity, currentAssets: ac_total, longTermAssets: 0,
    currentLiabilities: pc_total, longTermLiabilities: pnc, inventory: inventoryValue
  });

  const rating = calculateBankRating(kanitz.fi, netProfit);

  const kpis: KPIs = {
    market_share: (finalUnitsSold / Math.max(totalMarketDemand, 1)) * 100,
    rating,
    insolvency_status: kanitz.status,
    equity: finalEquity,
    nlcdg: nlcdg,
    financing_sources: {
      ecp: pc_loans,
      elp: pnc,
      ccp: finalEquity
    },
    special_purchases_impact: specialPurchaseCost,
    capacity_utilization: (unitsToProduce / Math.max(effectiveCapacity, 1)) * 100,
    market_valuation: {
      share_price: (finalEquity / DEFAULT_TOTAL_SHARES) * 60,
      total_shares: DEFAULT_TOTAL_SHARES,
      market_cap: finalEquity,
      tsr: (netProfit / Math.max(prevEquity, 1)) * 100
    },
    statements: { 
      dre: { revenue: finalRevenue, cpv, opex: totalOpex, net_profit: netProfit },
      balance_sheet: { 
        assets: { total: ac_total + 5886600 + totalCapex }, 
        equity: { total: finalEquity, accumulated_profit: finalAccumulatedProfit },
        liabilities: { current_divs: currentDivProvision, current_loans: pc_loans }
      }
    }
  };

  return {
    revenue: finalRevenue, netProfit, debtRatio: ((pc_total + pnc) / Math.max(finalEquity, 1)) * 100, creditRating: rating,
    marketShare: kpis.market_share, health: { rating, kanitz_fi: kanitz.fi, status: kanitz.status, productivity: productivityFactor },
    kpis, statements: kpis.statements
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const regions = Object.values(decisions.regions);
  if (regions.length === 0) return 0.5;
  let totalAttraction = 0;
  regions.forEach(reg => {
    const priceFactor = Math.pow(370 / Math.max(sanitize(reg.price, 100), 100), 1.6);
    const marketingFactor = 1 + (sanitize(reg.marketing) * 0.07);
    totalAttraction += priceFactor * marketingFactor;
  });
  return totalAttraction / regions.length;
};

export const calculateKanitzFactor = (data: {
  netProfit: number, equity: number, currentAssets: number, longTermAssets: number,
  currentLiabilities: number, longTermLiabilities: number, inventory: number
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
  return { fi, status };
};

export const calculateBankRating = (fi: number, netProfit: number) => {
  if (fi > 3) return 'AAA';
  if (fi > 1) return 'AA';
  if (fi > 0) return 'A';
  if (fi > -1.5) return 'B';
  if (fi > -3) return 'C';
  return 'D';
};
