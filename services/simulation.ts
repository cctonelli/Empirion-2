
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * CORE ORACLE ENGINE v15.2 - SPECIAL PURCHASES & PRODUCTIVITY DYNAMICS
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

  // 1. PRODUTIVIDADE E CAPACIDADE EFETIVA
  const productivityFactor = sanitize(indicators.labor_productivity, 1.0);
  const baseCapacity = 10000; // Capacidade padrão das 5 máquinas iniciais
  
  const getAdjustedPrice = (model: MachineModel, base: number) => {
    let adj = 1.0;
    const rate = indicators[`machine_${model}_price_adjust`] || 0;
    for (let i = 0; i < currentRound; i++) adj *= (1 + rate / 100);
    return base * adj;
  };

  const newMachinesCapacity = (decisions.machinery.buy.alfa * (indicators.machine_specs?.alfa.production_capacity || 2000)) +
                             (decisions.machinery.buy.beta * (indicators.machine_specs?.beta.production_capacity || 6000)) +
                             (decisions.machinery.buy.gama * (indicators.machine_specs?.gama.production_capacity || 12000));

  // Capacidade Real ajustada pela Produtividade do Round
  const effectiveCapacity = (baseCapacity + newMachinesCapacity) * productivityFactor;
  const unitsToProduce = effectiveCapacity * (decisions.production.activityLevel / 100);

  // 2. LÓGICA DE COMPRAS ESPECIAIS (NÃO PENALIZAR PRODUÇÃO)
  // Requisito: 3 unidades de MP-A e 2 unidades de MP-B por Produto Acabado
  const requiredMPA = unitsToProduce * 3;
  const requiredMPB = unitsToProduce * 2;
  
  const currentMPAStock = sanitize(previousState?.inventory?.mpa, 0);
  const currentMPBStock = sanitize(previousState?.inventory?.mpb, 0);
  
  const decidedMPA = sanitize(decisions.production.purchaseMPA, 0);
  const decidedMPB = sanitize(decisions.production.purchaseMPB, 0);
  
  const deficitMPA = Math.max(0, requiredMPA - (currentMPAStock + decidedMPA));
  const deficitMPB = Math.max(0, requiredMPB - (currentMPBStock + decidedMPB));
  
  // Compras Especiais Automáticas (Preço Spot + ágio parametrizado)
  const premium = 1 + (sanitize(indicators.special_purchase_premium, 15) / 100);
  const specialPurchaseCost = (deficitMPA * indicators.prices.mp_a * premium) + 
                               (deficitMPB * indicators.prices.mp_b * premium);

  // 3. MERCADO GLOBAL (PULO DO GATO: ICE + VARIAÇÃO DE DEMANDA)
  const iceFactor = 1 + (indicators.ice / 100);
  const demandVarFactor = 1 + (indicators.demand_variation / 100);
  const totalMarketDemand = (2500 * (indicators.regions_count || 4) * 4) * iceFactor * demandVarFactor;
  
  let totalRevenueBase = 0;
  let totalUnitsSold = 0;

  const regions = championshipData?.region_configs || Array.from({ length: indicators.regions_count || 4 }, (_, i) => ({
     id: i + 1,
     currency: 'BRL' as CurrencyType,
     demand_weight: 100 / (indicators.regions_count || 4)
  }));

  regions.forEach(reg => {
     const decision = decisions.regions[reg.id] || { price: 375, term: 1, marketing: 0 };
     const regionalWeight = reg.demand_weight / 100;
     const regionalDemand = totalMarketDemand * regionalWeight;
     
     // Elasticidade Preço e Marketing
     const priceFactor = Math.pow(indicators.avg_selling_price / Math.max(decision.price, 100), 1.6);
     const promoFactor = 1 + (decision.marketing * 0.06);
     const shareMultiplier = priceFactor * promoFactor;
     
     const unitsSoldReg = Math.min(regionalDemand * (shareMultiplier / 10), regionalDemand);
     totalUnitsSold += unitsSoldReg;

     const revenueLocal = unitsSoldReg * decision.price;
     const exchangeRate = indicators.exchange_rates?.[reg.currency] || 1;
     const baseExchangeRate = indicators.exchange_rates?.[baseCurrency] || 1;
     const conversionFactor = exchangeRate / baseExchangeRate;
     totalRevenueBase += revenueLocal * conversionFactor;
  });

  // Ajuste de Vendas pela Produção Disponível
  const salesAdjustmentFactor = totalUnitsSold > unitsToProduce ? unitsToProduce / totalUnitsSold : 1;
  const finalRevenue = totalRevenueBase * salesAdjustmentFactor;
  const finalUnitsSold = totalUnitsSold * salesAdjustmentFactor;

  // 4. DRE & FLUXO OPERACIONAL
  const mpaCost = decidedMPA * indicators.prices.mp_a;
  const mpbCost = decidedMPB * indicators.prices.mp_b;
  const cpv = (finalUnitsSold * (indicators.prices.mp_a * 3 + indicators.prices.mp_b * 2)) + 32000;
  
  const baseOpex = 917582 * (1 + (indicators.inflation_rate / 100));
  const storageCost = (Math.max(0, unitsToProduce - finalUnitsSold) * indicators.prices.storage_finished) +
                      (Math.max(0, (decidedMPA + deficitMPA) * 0.1) * indicators.prices.storage_mp);
  
  const totalOpex = baseOpex + storageCost + specialPurchaseCost;
  
  const netProfit = finalRevenue - cpv - totalOpex;
  const finalEquity = prevEquity + netProfit;

  // 5. BALANÇO & STATUS DE SAÚDE
  const totalCapex = (decisions.machinery.buy.alfa * getAdjustedPrice('alfa', indicators.machinery_values.alfa));
  const ac = sanitize(bs.assets?.current?.total, 3290340) + netProfit - (totalCapex * 0.4);
  const pc = sanitize(bs.liabilities?.current, 2621493);
  const pnc = sanitize(bs.liabilities?.long_term, 1500000);

  const kanitz = calculateKanitzFactor({
    netProfit, equity: finalEquity, currentAssets: ac, longTermAssets: 0,
    currentLiabilities: pc, longTermLiabilities: pnc, inventory: 1466605
  });

  const rating = calculateBankRating(kanitz.fi, netProfit);

  return {
    revenue: finalRevenue, netProfit, debtRatio: ((pc + pnc) / finalEquity) * 100, creditRating: rating,
    marketShare: (finalUnitsSold / totalMarketDemand) * 100,
    health: { rating, kanitz_fi: kanitz.fi, status: kanitz.status, productivity: productivityFactor },
    kpis: {
      market_share: (finalUnitsSold / totalMarketDemand) * 100,
      rating,
      insolvency_status: kanitz.status,
      equity: finalEquity,
      special_purchases_impact: specialPurchaseCost,
      capacity_utilization: (unitsToProduce / effectiveCapacity) * 100,
      statements: { 
        dre: { revenue: finalRevenue, cpv, opex: totalOpex, net_profit: netProfit },
        balance_sheet: { assets: { total: ac + 5886600 + totalCapex }, equity: { total: finalEquity } }
      }
    },
    statements: { dre: { revenue: finalRevenue, cpv, opex: totalOpex, net_profit: netProfit }, balance_sheet: { assets: { total: ac + 5886600 + totalCapex } } }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const regions = Object.values(decisions.regions);
  if (regions.length === 0) return 0.5;
  let totalAttraction = 0;
  regions.forEach(reg => {
    const priceFactor = Math.pow(370 / Math.max(reg.price, 100), 1.6);
    const marketingFactor = 1 + (reg.marketing * 0.07);
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
