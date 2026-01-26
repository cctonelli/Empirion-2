
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

/**
 * Sanitizador Alpha Node 08
 */
export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * Auxiliar para cálculo de valor com juros compostos sobre parcelas
 * Part 1: Cash (0% i)
 * Part 2: T+1 (1 period i)
 * Part 3: T+2 (2 periods i compound)
 */
const calculateInstallmentValue = (nominalTotal: number, term: number, interestRate: number): number => {
  const i = interestRate / 100;
  if (term === 0) return nominalTotal; // À vista
  if (term === 1) { // 50/50
    const part = nominalTotal / 2;
    return part + (part * (1 + i));
  }
  if (term === 2) { // 33/33/33
    const part = nominalTotal / 3;
    return part + (part * (1 + i)) + (part * Math.pow(1 + i, 2));
  }
  return nominalTotal;
};

/**
 * CORE ORACLE ENGINE v22.0 - COMPOUND INTEREST & AUTO-PURCHASE PREMIUM
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
  
  const safeDecisions: DecisionData = JSON.parse(JSON.stringify(decisions, (key, value) => {
      if (typeof value === 'number') return (isNaN(value) || !isFinite(value)) ? 0 : value;
      return value;
  }));

  const bs = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  const roundOverride = roundRules?.[currentRound] || {};
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...roundOverride };

  // 0. CONFIGURAÇÕES TRIBUTÁRIAS E MACRO
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  const socialChargesFactor = 1 + socialChargesRate;
  const specialPremium = sanitize(indicators.special_purchase_premium, 15) / 100;

  // 1. ESTRUTURA DE STAFFING (Headcount Global)
  const staffProd = sanitize(indicators.staffing.production.count, 470);
  const staffAdmin = sanitize(indicators.staffing.admin.count, 10);
  const staffSales = sanitize(indicators.staffing.sales.count, 20);
  const totalHeadcount = staffProd + staffAdmin + staffSales;

  // 2. GESTÃO DE TALENTOS E MOTIVAÇÃO
  const salaryDecided = sanitize(safeDecisions.hr.salary, 1313);
  const marketAvgSalary = sanitize(indicators.avg_selling_price * 4, 1350); 
  const salaryRatio = salaryDecided / marketAvgSalary;
  const trainingEffect = sanitize(safeDecisions.hr.trainingPercent, 0) / 100;
  let motivationIndex = Math.min(1.2, (salaryRatio * 0.7) + (trainingEffect * 0.3));
  const productivityFactor = sanitize(indicators.labor_productivity, 1.0) * (motivationIndex > 0.8 ? 1.05 : motivationIndex);

  // 3. CAPACIDADE E PRODUÇÃO
  const baseCapacity = 10000;
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80) / 100;
  const unitsToProduce = baseCapacity * productivityFactor * activityLevel;

  // 4. SUPRIMENTOS (CMP) E COMPRAS EXTRAS AUTOMÁTICAS
  const mpaQtyInitial = sanitize(previousState?.inventory?.mpa_qty, 31116);
  const mpaValInitial = sanitize(previousState?.inventory?.mpa_value, 622320); 
  const mpbQtyInitial = sanitize(previousState?.inventory?.mpb_qty, 20744);
  const mpbValInitial = sanitize(previousState?.inventory?.mpb_value, 829760);

  const marketPriceMPA = sanitize(indicators.prices.mp_a, 20);
  const marketPriceMPB = sanitize(indicators.prices.mp_b, 40);
  
  // A. Compras Manuais (Sujeitas a juros de fornecedor)
  const mpaQtyManual = sanitize(safeDecisions.production.purchaseMPA, 0);
  const mpbQtyManual = sanitize(safeDecisions.production.purchaseMPB, 0);
  const supplierInt = sanitize(indicators.supplier_interest, 1.5);
  const purchaseTerm = sanitize(safeDecisions.production.paymentType, 1);

  const costPerUnitMPA = calculateInstallmentValue(marketPriceMPA, purchaseTerm, supplierInt);
  const costPerUnitMPB = calculateInstallmentValue(marketPriceMPB, purchaseTerm, supplierInt);
  
  const manualPurchaseCostMPA = mpaQtyManual * costPerUnitMPA;
  const manualPurchaseCostMPB = mpbQtyManual * costPerUnitMPB;

  // B. Verificação de Déficit (Compras Extras com Ágio e 100% à vista)
  const mpaNeeded = unitsToProduce * 3;
  const mpbNeeded = unitsToProduce * 2;
  
  let mpaExtraQty = Math.max(0, mpaNeeded - (mpaQtyInitial + mpaQtyManual));
  let mpbExtraQty = Math.max(0, mpbNeeded - (mpbQtyInitial + mpbQtyManual));
  
  const extraCostPerUnitMPA = marketPriceMPA * (1 + specialPremium);
  const extraCostPerUnitMPB = marketPriceMPB * (1 + specialPremium);

  const extraPurchaseCostMPA = mpaExtraQty * extraCostPerUnitMPA;
  const extraPurchaseCostMPB = mpbExtraQty * extraCostPerUnitMPB;

  // C. Recálculo do CMP (Custo Médio Ponderado)
  const totalMpaVal = mpaValInitial + manualPurchaseCostMPA + extraPurchaseCostMPA;
  const totalMpaQty = mpaQtyInitial + mpaQtyManual + mpaExtraQty;
  const mpaCMP = totalMpaVal / Math.max(1, totalMpaQty);

  const totalMpbVal = mpbValInitial + manualPurchaseCostMPB + extraPurchaseCostMPB;
  const totalMpbQty = mpbQtyInitial + mpbQtyManual + mpbExtraQty;
  const mpbCMP = totalMpbVal / Math.max(1, totalMpbQty);

  const totalMPCostInDRE = (mpaNeeded * mpaCMP) + (mpbNeeded * mpbCMP);

  // 5. CUSTO DE PRODUÇÃO (CPP)
  const payrollMOD = staffProd * salaryDecided * socialChargesFactor; 
  const depTotal = (2360000 * 0.025) + (5440000 * 0.01);
  const maintenanceCost = (2360000 * 0.01) * (0.5 + activityLevel);
  const storageCost = (unitsToProduce * 0.1 * 20) + ((totalMpaQty + totalMpbQty) * 0.5 * 1.4);

  const rdPercentDecided = sanitize(safeDecisions.production.rd_investment, 0);
  const rdEfficiencyFactor = 1 - (Math.min(rdPercentDecided * 30000, 500000) / 10000000);

  const totalProductionCost = (totalMPCostInDRE * rdEfficiencyFactor) + payrollMOD + depTotal + maintenanceCost + storageCost;
  const unitCostRound = totalProductionCost / Math.max(unitsToProduce, 1);

  // 6. MERCADO E VENDAS (Juros sobre Vendas)
  const rdQualityBonus = 1 + (Math.min(rdPercentDecided * 30000, 200000) / 1000000); 
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const totalMarketDemand = (baseCapacity * teamsCount) * (1 + sanitize(indicators.ice, 3)/100);
  const salesInterest = sanitize(indicators.sales_interest_rate, 1.5);
  
  let totalRevenueReal = 0;
  let unitsSoldTotal = 0;
  
  const regions = championshipData?.region_configs || [{ id: 1, demand_weight: 100, currency: 'BRL' as CurrencyType }];
  regions.forEach(reg => {
    const regDec = safeDecisions.regions[reg.id] || { price: 375, marketing: 0, term: 1 };
    const priceFactor = Math.pow(370 / Math.max(regDec.price, 100), 1.6);
    const mktFactor = 1 + (regDec.marketing * 0.06);
    const regionalDemand = (totalMarketDemand * (reg.demand_weight/100)) / teamsCount;
    
    const sold = Math.min(regionalDemand * priceFactor * mktFactor * rdQualityBonus, regionalDemand);
    unitsSoldTotal += sold;

    // Aplicação dos juros compostos sobre o preço de venda parcelado
    const effectivePrice = calculateInstallmentValue(regDec.price, regDec.term, salesInterest);
    totalRevenueReal += sold * effectivePrice;
  });

  const finalUnitsSold = Math.min(unitsSoldTotal, unitsToProduce);
  const finalRevenue = totalRevenueReal * (finalUnitsSold / Math.max(unitsSoldTotal, 1));

  // 7. OPEX E DRE FINAL
  const adminPayroll = staffAdmin * (salaryDecided * 4) * socialChargesFactor;
  const salesPayroll = staffSales * (salaryDecided * 4) * socialChargesFactor;
  const opex = adminPayroll + salesPayroll + 350000 + (finalRevenue * (rdPercentDecided / 100));

  const cpv = finalUnitsSold * unitCostRound;
  const operatingProfit = (finalRevenue - cpv) - opex;
  
  const plrPercent = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const totalPLRPool = operatingProfit > 0 ? (operatingProfit * plrPercent) : 0;
  const netProfit = operatingProfit - totalPLRPool;

  return {
    revenue: finalRevenue,
    netProfit,
    debtRatio: 40,
    creditRating: netProfit > 0 ? 'AAA' : 'B',
    marketShare: (finalUnitsSold / totalMarketDemand) * 100,
    health: { rating: netProfit > 0 ? 'AAA' : 'B', motivation: motivationIndex, strike_risk: motivationIndex < 0.7 ? (0.7 - motivationIndex) * 100 : 0 },
    kpis: {
      market_share: (finalUnitsSold / totalMarketDemand) * 100,
      rating: netProfit > 0 ? 'AAA' : 'B',
      insolvency_status: 'SAUDAVEL',
      equity: prevEquity + (netProfit * 0.75),
      capacity_utilization: activityLevel * 100,
      motivation_index: motivationIndex
    },
    statements: {
      dre: { 
        revenue: finalRevenue, 
        cpv, 
        gross_profit: finalRevenue - cpv, 
        opex: opex, 
        operating_profit: operatingProfit,
        plr: totalPLRPool,
        net_profit: netProfit,
        details: {
          mp_extra_qty: mpaExtraQty + mpbExtraQty,
          mp_extra_cost: extraPurchaseCostMPA + extraPurchaseCostMPB,
          social_charges_rate: socialChargesRate * 100,
          special_premium_rate: specialPremium * 100,
          unit_cost: unitCostRound
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const rdPercent = sanitize(decisions.production.rd_investment, 0);
  const rdBonus = 1 + (Math.min(rdPercent * 30000, 200000) / 1000000);
  return Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/r.price, 1.5) * (1 + r.marketing*0.05) * rdBonus), 0) / 4;
};
