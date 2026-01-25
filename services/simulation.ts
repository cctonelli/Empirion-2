
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
 * CORE ORACLE ENGINE v21.0 - DYNAMIC SOCIAL CHARGES & HEADCOUNT PLR
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

  // FATOR DINÂMICO DE ENCARGOS SOCIAIS (Definido pelo Tutor)
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  const socialChargesFactor = 1 + socialChargesRate;

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
  
  // Motivação base (Salário + Treinamento)
  let motivationIndex = Math.min(1.2, (salaryRatio * 0.7) + (trainingEffect * 0.3));
  
  const strikeRisk = motivationIndex < 0.7 ? (0.7 - motivationIndex) * 100 : 0;
  const productivityFactor = sanitize(indicators.labor_productivity, 1.0) * (motivationIndex > 0.8 ? 1.05 : motivationIndex);

  // 3. CAPACIDADE OPERACIONAL
  const baseCapacity = 10000;
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80) / 100;
  const unitsToProduce = baseCapacity * productivityFactor * activityLevel;

  // 4. PONDERAÇÃO DE MATÉRIAS-PRIMAS (CMP)
  const mpaQtyInitial = sanitize(previousState?.inventory?.mpa_qty, 31116);
  const mpaValInitial = sanitize(previousState?.inventory?.mpa_value, 622320); 
  const mpbQtyInitial = sanitize(previousState?.inventory?.mpb_qty, 20744);
  const mpbValInitial = sanitize(previousState?.inventory?.mpb_value, 829760);

  const acquisitionCostMPA = sanitize(indicators.prices.mp_a, 20) * (safeDecisions.production.paymentType > 0 ? 1.015 : 1);
  const acquisitionCostMPB = sanitize(indicators.prices.mp_b, 40) * (safeDecisions.production.paymentType > 0 ? 1.015 : 1);
  
  const mpaQtyPurchased = sanitize(safeDecisions.production.purchaseMPA, 0);
  const mpbQtyPurchased = sanitize(safeDecisions.production.purchaseMPB, 0);
  
  const mpaCMP = (mpaValInitial + (mpaQtyPurchased * acquisitionCostMPA)) / Math.max(1, mpaQtyInitial + mpaQtyPurchased);
  const mpbCMP = (mpbValInitial + (mpbQtyPurchased * acquisitionCostMPB)) / Math.max(1, mpbQtyInitial + mpbQtyPurchased);

  const mpaConsumed = unitsToProduce * 3;
  const mpbConsumed = unitsToProduce * 2;
  const totalMPCost = (mpaConsumed * mpaCMP) + (mpbConsumed * mpbCMP);

  // 5. CUSTO DE PRODUÇÃO (CPP) - MOD com Encargos Dinâmicos
  const payrollMOD = staffProd * salaryDecided * socialChargesFactor; 
  
  const machineValue = 2360000; 
  const depTotal = (machineValue * 0.025) + (5440000 * 0.01);
  const maintenanceCost = (machineValue * 0.01) * (0.5 + activityLevel);
  const storageCost = (unitsToProduce * 0.1 * 20) + ((mpaQtyPurchased + mpbQtyPurchased) * 0.5 * 1.4);

  const rdInvestment = sanitize(safeDecisions.production.rd_investment, 0);
  const rdEfficiencyFactor = 1 - (Math.min(rdInvestment, 500000) / 10000000);

  const totalProductionCost = (totalMPCost * rdEfficiencyFactor) + payrollMOD + depTotal + maintenanceCost + storageCost;
  const unitCostRound = totalProductionCost / Math.max(unitsToProduce, 1);

  // 6. MERCADO E VENDAS
  const rdQualityBonus = 1 + (Math.min(rdInvestment, 200000) / 1000000); 
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const totalMarketDemand = (baseCapacity * teamsCount) * (1 + sanitize(indicators.ice, 3)/100);
  
  let totalRevenue = 0;
  let unitsSold = 0;
  
  const regions = championshipData?.region_configs || [{ id: 1, demand_weight: 100, currency: 'BRL' as CurrencyType }];
  regions.forEach(reg => {
    const regDec = safeDecisions.regions[reg.id] || { price: 375, marketing: 0 };
    const priceFactor = Math.pow(370 / Math.max(regDec.price, 100), 1.6);
    const mktFactor = 1 + (regDec.marketing * 0.06);
    const regionalDemand = (totalMarketDemand * (reg.demand_weight/100)) / teamsCount;
    
    const sold = Math.min(regionalDemand * priceFactor * mktFactor * rdQualityBonus, regionalDemand);
    unitsSold += sold;
    totalRevenue += sold * regDec.price;
  });

  const finalUnitsSold = Math.min(unitsSold, unitsToProduce);
  const finalRevenue = totalRevenue * (finalUnitsSold / Math.max(unitsSold, 1));

  // 7. DESPESAS OPERACIONAIS (OPEX) - Adm/Vendas com Encargos Dinâmicos
  // Adm e Vendas ganham 4x o salário base decidido pela equipe
  const adminPayroll = staffAdmin * (salaryDecided * 4) * socialChargesFactor;
  const salesPayroll = staffSales * (salaryDecided * 4) * socialChargesFactor;
  const otherOpexBase = 350000; // Base fixa de operação
  const totalOpex = adminPayroll + salesPayroll + otherOpexBase + rdInvestment;

  // 8. DRE E PLR IGUALITÁRIO
  const cpv = finalUnitsSold * unitCostRound;
  const grossProfit = finalRevenue - cpv;
  const operatingProfit = grossProfit - totalOpex;
  
  const plrPercent = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const totalPLRPool = operatingProfit > 0 ? (operatingProfit * plrPercent) : 0;
  
  // Rateio igualitário por cabeça (Headcount)
  const plrPerPerson = totalPLRPool / Math.max(1, totalHeadcount);
  
  // O PLR per person afeta a motivação final
  if (plrPerPerson > 0) {
    const plrMotivationBonus = Math.min(0.1, (plrPerPerson / (salaryDecided * 0.5)));
    motivationIndex += plrMotivationBonus;
  }

  const netProfit = operatingProfit - totalPLRPool;

  return {
    revenue: finalRevenue,
    netProfit,
    debtRatio: 40,
    creditRating: netProfit > 0 ? 'AAA' : 'B',
    marketShare: (finalUnitsSold / totalMarketDemand) * 100,
    health: { rating: netProfit > 0 ? 'AAA' : 'B', motivation: motivationIndex, strike_risk: strikeRisk },
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
        gross_profit: grossProfit, 
        opex: totalOpex, 
        operating_profit: operatingProfit,
        plr: totalPLRPool,
        net_profit: netProfit,
        details: {
          mp_ponderada: totalMPCost,
          mod_with_charges: payrollMOD,
          admin_with_charges: adminPayroll,
          sales_with_charges: salesPayroll,
          depreciation: depTotal,
          maintenance: maintenanceCost,
          unit_cost: unitCostRound,
          social_charges_rate: socialChargesRate * 100,
          plr_per_head: plrPerPerson
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const rdInvestment = sanitize(decisions.production.rd_investment, 0);
  const rdBonus = 1 + (Math.min(rdInvestment, 200000) / 1000000);
  return Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/r.price, 1.5) * (1 + r.marketing*0.05) * rdBonus), 0) / 4;
};
