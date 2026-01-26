
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
 * CORE ORACLE ENGINE v23.5 - PRECISION AWARDS & OVERTIME KERNEL
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
  const nominalHours = sanitize(indicators.production_hours_period, 946);

  // 1. ESTRUTURA DE STAFFING (Headcount Fixo v23)
  const staffProd = sanitize(indicators.staffing.production.count, 470);
  const staffAdmin = 20; 
  const staffSales = 10; 

  // 2. GESTÃO DE TALENTOS E PRODUTIVIDADE
  const salaryDecided = sanitize(safeDecisions.hr.salary, 1313);
  const marketAvgSalary = sanitize(indicators.avg_selling_price * 4, 1350); 
  const salaryRatio = salaryDecided / marketAvgSalary;
  const trainingEffect = sanitize(safeDecisions.hr.trainingPercent, 0) / 100;
  
  let motivationIndex = Math.min(1.2, (salaryRatio * 0.7) + (trainingEffect * 0.3));
  const productivityFactor = sanitize(indicators.labor_productivity, 1.0) * (motivationIndex > 0.8 ? 1.05 : motivationIndex);

  // 3. CÁLCULO DE FOLHA E HORAS EXTRAS
  const adminPayroll = salaryDecided * 4 * staffAdmin;
  const salesPayroll = salaryDecided * 4 * staffSales;
  const modPayrollBase = salaryDecided * 1 * staffProd;

  let overtimeCost = 0;
  let extraHoursTotal = 0;
  // Regra: Se a produção exigida ultrapassa a capacidade nominal (Produtividade > 1.0)
  if (productivityFactor > 1.0) {
    extraHoursTotal = Math.ceil((nominalHours * productivityFactor) - nominalHours);
    const hourlyRateNormal = modPayrollBase / (staffProd * nominalHours);
    // Adicional de 50% (1.5x)
    overtimeCost = extraHoursTotal * 1.5 * hourlyRateNormal * staffProd;
  }

  const firedCount = sanitize(safeDecisions.hr.fired, 0);
  const indemnificationCost = (salaryDecided * 2) * firedCount;
  const basePayrollWithCharges = (adminPayroll + salesPayroll + modPayrollBase + overtimeCost + indemnificationCost) * socialChargesFactor;

  // 4. PRODUÇÃO E CUSTOS DIRETOS
  const baseCapacity = 10000;
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80) / 100;
  const unitsToProduce = baseCapacity * productivityFactor * activityLevel;

  const marketPriceMPA = sanitize(indicators.prices.mp_a, 20);
  const marketPriceMPB = sanitize(indicators.prices.mp_b, 40);
  const totalMPCost = (unitsToProduce * 3 * marketPriceMPA) + (unitsToProduce * 2 * marketPriceMPB);

  const depTotal = 150000; // Simplificado para o Oracle Kernel
  const maintenanceCost = 50000 * (0.5 + activityLevel);
  const totalProductionCost = totalMPCost + (modPayrollBase + overtimeCost + (indemnificationCost * 0.7)) * socialChargesFactor + depTotal + maintenanceCost;
  const unitCostRound = totalProductionCost / Math.max(unitsToProduce, 1);

  // 5. MERCADO E VENDAS (SIMULAÇÃO DE DEMANDA REGIONAL)
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const totalMarketDemand = (baseCapacity * teamsCount) * (1 + sanitize(indicators.ice, 3)/100);
  let unitsSoldTotal = 0;
  let totalRevenueReal = 0;
  
  const regions = championshipData?.region_configs || [{ id: 1, demand_weight: 100, currency: 'BRL' as CurrencyType }];
  regions.forEach(reg => {
    const regDec = safeDecisions.regions[reg.id] || { price: 375, marketing: 0, term: 1 };
    const priceFactor = Math.pow(370 / Math.max(regDec.price, 100), 1.6);
    const regionalDemand = (totalMarketDemand * (reg.demand_weight/100)) / teamsCount;
    const sold = Math.min(regionalDemand * priceFactor * (1 + regDec.marketing * 0.05), regionalDemand);
    unitsSoldTotal += sold;
    totalRevenueReal += sold * regDec.price;
  });

  const finalUnitsSold = Math.min(unitsSoldTotal, unitsToProduce);
  const finalRevenue = totalRevenueReal * (finalUnitsSold / Math.max(unitsSoldTotal, 1));

  // 6. RESULTADO LÍQUIDO E REGRA DE PRECISÃO (AWARDS)
  const opex = (adminPayroll + salesPayroll + (indemnificationCost * 0.3)) * socialChargesFactor + 350000;
  const cpv = finalUnitsSold * unitCostRound;
  const operatingProfit = finalRevenue - cpv - opex;
  
  const irRate = sanitize(indicators.tax_rate_ir, 15) / 100;
  const tax = operatingProfit > 0 ? (operatingProfit * irRate) : 0;
  const profitBeforeAwards = operatingProfit - tax;

  // VERIFICAÇÃO DE PRECISÃO DE META DE LUCRO
  const targetProfitPercent = sanitize(safeDecisions.production.net_profit_target_percent, 0);
  const actualProfitPercent = (profitBeforeAwards / Math.max(finalRevenue, 1)) * 100;
  const precisionGap = Math.abs(targetProfitPercent - actualProfitPercent);
  
  // Se a meta foi atingida com erro < 1%, ganha bônus de precisão
  const precisionBonus = (precisionGap <= 1.0 && profitBeforeAwards > 0) ? sanitize(indicators.award_values.profit_precision, 100000) : 0;
  
  const profitAfterTax = profitBeforeAwards + precisionBonus;

  // PLR
  const plrPercent = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const totalPLRPool = profitAfterTax > 0 ? (profitAfterTax * plrPercent) : 0;
  const netProfitFinal = profitAfterTax - totalPLRPool;

  return {
    revenue: finalRevenue,
    netProfit: netProfitFinal,
    debtRatio: 40,
    creditRating: netProfitFinal > 0 ? 'AAA' : 'C',
    marketShare: (finalUnitsSold / totalMarketDemand) * 100,
    health: { 
      rating: netProfitFinal > 0 ? 'AAA' : 'C', 
      motivation: motivationIndex,
      overtime_hours: extraHoursTotal,
      precision_bonus_awarded: precisionBonus > 0
    },
    kpis: {
      market_share: (finalUnitsSold / totalMarketDemand) * 100,
      rating: netProfitFinal > 0 ? 'AAA' : 'C',
      insolvency_status: netProfitFinal > -500000 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + (netProfitFinal * 0.8),
      motivation_index: motivationIndex
    },
    statements: {
      dre: { 
        revenue: finalRevenue, 
        cpv, 
        gross_profit: finalRevenue - cpv, 
        opex, 
        operating_profit: operatingProfit,
        tax,
        profit_after_tax: profitBeforeAwards,
        precision_bonus: precisionBonus,
        plr: totalPLRPool,
        net_profit: netProfitFinal,
        details: {
          payroll_total_cash: basePayrollWithCharges + totalPLRPool,
          overtime_cost: overtimeCost * socialChargesFactor,
          unit_cost: unitCostRound,
          target_gap: precisionGap
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  return Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.05)), 0) / 4;
};
