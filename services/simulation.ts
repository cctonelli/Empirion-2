
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * CORE ORACLE ENGINE v17.0 - FULL DYNAMIC PARAMETERS
 * Este motor consome exclusivamente os indicadores salvos no banco de dados.
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
  const prevAccumulatedProfit = sanitize(bs.equity?.accumulated_profit, 55447);
  
  // LOGICA DE RESOLUÇÃO DE INDICADORES:
  // 1. Regra específica da rodada (Round Rules salva pelo Tutor no Wizard ou Intervenção)
  // 2. Fallback para indicadores base do torneio
  // 3. Fallback absoluto para constantes (emergência)
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
    const base = baseIndicators.machinery_values[model];
    const keyPart = model === 'alfa' ? 'alpha' : model === 'gama' ? 'gamma' : 'beta';
    let adjPrice = base;

    // Calcula o preço acumulado respeitando o histórico de reajustes do banco
    for (let r = 0; r < currentRound; r++) {
      const rate = roundRules?.[r]?.[`machine_${keyPart}_price_adjust`] ?? baseIndicators[`machine_${keyPart}_price_adjust`] ?? 0;
      adjPrice *= (1 + rate / 100);
    }
    return adjPrice;
  };

  const currentAlfaPrice = getAdjustedPrice('alfa');
  const currentBetaPrice = getAdjustedPrice('beta');
  const currentGamaPrice = getAdjustedPrice('gama');

  const newMachinesCapacity = (decisions.machinery.buy.alfa * (indicators.machine_specs?.alfa.production_capacity || 2000)) +
                             (decisions.machinery.buy.beta * (indicators.machine_specs?.beta.production_capacity || 6000)) +
                             (decisions.machinery.buy.gama * (indicators.machine_specs?.gama.production_capacity || 12000));

  const effectiveCapacity = (baseCapacity + newMachinesCapacity) * productivityFactor;
  const unitsToProduce = effectiveCapacity * (decisions.production.activityLevel / 100);

  // 2. COMPRAS ESPECIAIS (Dinamizadas pelo Ágio definido pelo Tutor)
  const requiredMPA = unitsToProduce * 3;
  const requiredMPB = unitsToProduce * 2;
  const currentMPAStock = sanitize(previousState?.inventory?.mpa, 628545 / 20.20);
  const currentMPBStock = sanitize(previousState?.inventory?.mpb, 838060 / 40.40);
  const decidedMPA = sanitize(decisions.production.purchaseMPA, 0);
  const decidedMPB = sanitize(decisions.production.purchaseMPB, 0);
  
  const deficitMPA = Math.max(0, requiredMPA - (currentMPAStock + decidedMPA));
  const deficitMPB = Math.max(0, requiredMPB - (currentMPBStock + decidedMPB));
  
  const premiumRate = sanitize(indicators.special_purchase_premium, 15) / 100;
  const specialPurchaseCost = (deficitMPA * indicators.prices.mp_a * (1 + premiumRate)) + 
                               (deficitMPB * indicators.prices.mp_b * (1 + premiumRate));

  // 3. MERCADO DINÂMICO
  const iceFactor = 1 + (indicators.ice / 100);
  const demandVarFactor = 1 + (indicators.demand_variation / 100);
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const totalMarketDemand = (baseCapacity * teamsCount) * iceFactor * demandVarFactor;
  
  let totalRevenueBase = 0;
  let totalUnitsSold = 0;
  const regions = championshipData?.region_configs || Array.from({ length: indicators.regions_count || 4 }, (_, i) => ({
     id: i + 1,
     currency: 'BRL' as CurrencyType,
     demand_weight: 100 / (indicators.regions_count || 4)
  }));

  regions.forEach(reg => {
     const decision = decisions.regions[reg.id] || { price: 375, term: 1, marketing: 0 };
     const regionalWeight = (reg.demand_weight || (100 / regions.length)) / 100;
     const regionalDemand = totalMarketDemand * regionalWeight;
     const priceFactor = Math.pow(indicators.avg_selling_price / Math.max(decision.price, 100), 1.6);
     const promoFactor = 1 + (decision.marketing * 0.06);
     const shareMultiplier = priceFactor * promoFactor;
     
     const unitsSoldReg = Math.min(regionalDemand * (shareMultiplier / teamsCount), regionalDemand);
     totalUnitsSold += unitsSoldReg;
     const revenueLocal = unitsSoldReg * decision.price;
     const exchangeRate = indicators.exchange_rates?.[reg.currency] || 1;
     const baseExchangeRate = indicators.exchange_rates?.[baseCurrency] || 1;
     totalRevenueBase += revenueLocal * (exchangeRate / baseExchangeRate);
  });

  const salesAdjustmentFactor = totalUnitsSold > unitsToProduce ? unitsToProduce / totalUnitsSold : 1;
  const finalRevenue = totalRevenueBase * salesAdjustmentFactor;
  const finalUnitsSold = totalUnitsSold * salesAdjustmentFactor;

  // 4. DRE & LÓGICA DE DIVIDENDOS
  const cpv = (finalUnitsSold * (indicators.prices.mp_a * 3 + indicators.prices.mp_b * 2)) + 32000;
  const baseOpex = 916522 * (1 + (indicators.inflation_rate / 100));
  const storageCost = (Math.max(0, unitsToProduce - finalUnitsSold) * indicators.prices.storage_finished) +
                      (Math.max(0, (decidedMPA + deficitMPA) * 0.1) * indicators.prices.storage_mp);
  const totalOpex = baseOpex + storageCost + specialPurchaseCost;
  const netProfit = finalRevenue - cpv - totalOpex;

  // DIVIDENDOS (REGRA P/P+1)
  const prevDivsToPay = sanitize(bs.liabilities?.current_divs, 0);
  const dividendRate = sanitize(indicators.dividend_percent, 25) / 100;
  const currentDivProvision = netProfit > 0 ? netProfit * dividendRate : 0;
  const retainedEarnings = netProfit - currentDivProvision;

  const finalEquity = prevEquity + retainedEarnings;
  const finalAccumulatedProfit = prevAccumulatedProfit + retainedEarnings;

  // 5. BALANÇO & KPIs
  const totalCapex = (decisions.machinery.buy.alfa * currentAlfaPrice) +
                     (decisions.machinery.buy.beta * currentBetaPrice) +
                     (decisions.machinery.buy.gama * currentGamaPrice);

  const ac_financial = Math.max(0, sanitize(bs.assets?.current?.cash, 0) + sanitize(bs.assets?.current?.app, 0) - prevDivsToPay);
  const receivables = finalRevenue * 0.6;
  const inventoryValue = (Math.max(0, unitsToProduce - finalUnitsSold) * 235) + (requiredMPA * indicators.prices.mp_a) + (requiredMPB * indicators.prices.mp_b);
  
  const ac_total = ac_financial + receivables + inventoryValue;
  const pc_suppliers = finalRevenue * 0.2;
  const pc_loans = sanitize(bs.liabilities?.current_loans, 1872362) + (decisions.finance.loanRequest * 0.3);
  
  const pc_total = pc_suppliers + pc_loans + (netProfit > 0 ? netProfit * (indicators.tax_rate_ir / 100) : 0) + currentDivProvision;
  const pnc = sanitize(bs.liabilities?.long_term, 1500000);

  const nlcdg = (receivables + inventoryValue) - pc_suppliers;

  const kanitz = calculateKanitzFactor({
    netProfit, equity: finalEquity, currentAssets: ac_total, longTermAssets: 0,
    currentLiabilities: pc_total, longTermLiabilities: pnc, inventory: inventoryValue
  });

  const rating = calculateBankRating(kanitz.fi, netProfit);

  const kpis: KPIs = {
    market_share: (finalUnitsSold / totalMarketDemand) * 100,
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
    capacity_utilization: (unitsToProduce / effectiveCapacity) * 100,
    market_valuation: {
      share_price: (finalEquity / DEFAULT_TOTAL_SHARES) * 60,
      total_shares: DEFAULT_TOTAL_SHARES,
      market_cap: finalEquity,
      tsr: (netProfit / prevEquity) * 100
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
    revenue: finalRevenue, netProfit, debtRatio: ((pc_total + pnc) / finalEquity) * 100, creditRating: rating,
    marketShare: kpis.market_share, health: { rating, kanitz_fi: kanitz.fi, status: kanitz.status, productivity: productivityFactor },
    kpis, statements: kpis.statements
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
