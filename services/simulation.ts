
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
 * CORE ORACLE ENGINE v25.5 - MARKET-DRIVEN INTEREST PROTOCOL
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

  // 0. CONTEXTO E INDICADORES
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...(roundRules?.[currentRound] || {}) };
  const prevBS = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(prevBS.equity?.total, 5055447);

  // 1. WAC - MATÉRIAS-PRIMAS
  const stockMPA_Initial_Qty = 10000;
  const stockMPA_Initial_Val = 200000;
  const purchaseMPA_Qty = sanitize(safeDecisions.production.purchaseMPA, 0);
  const purchaseMPA_Val = purchaseMPA_Qty * indicators.prices.mp_a;
  const wacMPA = (stockMPA_Initial_Val + purchaseMPA_Val) / Math.max(1, (stockMPA_Initial_Qty + purchaseMPA_Qty));

  const stockMPB_Initial_Qty = 5000; 
  const stockMPB_Initial_Val = 200000;
  const purchaseMPB_Qty = sanitize(safeDecisions.production.purchaseMPB, 0);
  const purchaseMPB_Val = purchaseMPB_Qty * indicators.prices.mp_b;
  const wacMPB = (stockMPB_Initial_Val + purchaseMPB_Val) / Math.max(1, (stockMPB_Initial_Qty + purchaseMPB_Qty));

  // 2. GESTÃO DE ATIVOS E MANUTENÇÃO (CPP)
  const machineSpecs = indicators.machine_specs;
  const mPhysics = indicators.maintenance_physics;
  let totalMaintenanceBase = 0;
  let totalDepreciation = 40000; 

  indicators.initial_machinery_mix.forEach(m => {
    const age = m.age + currentRound;
    const spec = machineSpecs[m.model];
    const baseRate = m.model === 'alfa' ? mPhysics.alpha : m.model === 'beta' ? mPhysics.beta : mPhysics.gamma;
    const ageMultiplier = age > 10 ? Math.pow(1.05, age - 10) : 1.0;
    totalMaintenanceBase += (spec.initial_value * baseRate) * ageMultiplier;
    totalDepreciation += (spec.initial_value * spec.depreciation_rate);
  });

  const newBuy = safeDecisions.machinery.buy;
  totalMaintenanceBase += (newBuy.alfa * machineSpecs.alfa.initial_value * mPhysics.alpha);

  // 3. CAPACIDADE E STAFFING (MOD)
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const currentMachines = {
    alfa: 5 + (newBuy.alfa || 0) - (safeDecisions.machinery.sell.alfa || 0),
    beta: 0 + (newBuy.beta || 0) - (safeDecisions.machinery.sell.beta || 0),
    gama: 0 + (newBuy.gama || 0) - (safeDecisions.machinery.sell.gama || 0),
  };

  const nominalCapacity = (currentMachines.alfa * machineSpecs.alfa.production_capacity) + (currentMachines.beta * machineSpecs.beta.production_capacity) + (currentMachines.gama * machineSpecs.gama.production_capacity);
  const requiredProdStaff = (currentMachines.alfa * machineSpecs.alfa.operators_required) + (currentMachines.beta * machineSpecs.beta.operators_required) + (currentMachines.gama * machineSpecs.gama.operators_required);

  const salaryDecided = sanitize(safeDecisions.hr.salary, 1313);
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  const baseHours = sanitize(indicators.production_hours_period, 946);
  const extraHoursPerMan = Math.max(0, Math.ceil(((activityLevel / 100) * baseHours) - baseHours));
  const overtimeCost = extraHoursPerMan * requiredProdStaff * ((salaryDecided / baseHours) * 1.5);
  const indemnityCost = sanitize(safeDecisions.hr.fired, 0) * (salaryDecided * 2);
  const finalMOD = ((requiredProdStaff * salaryDecided) + overtimeCost + indemnityCost) * (1 + socialChargesRate);

  // 4. FORMAÇÃO DO CPP E WAC PA
  const unitsProduced = nominalCapacity * (activityLevel / 100);
  const mpConsumptionVal = (unitsProduced * 3 * wacMPA) + (unitsProduced * 2 * wacMPB);
  const maintenanceStress = activityLevel > 100 ? Math.pow(activityLevel/100, 1.8) : activityLevel/100;
  const finalMaintenanceCost = totalMaintenanceBase * maintenanceStress;
  const storageCostMP = purchaseMPA_Qty * indicators.prices.storage_mp; 
  
  const totalProductionCost = mpConsumptionVal + finalMOD + finalMaintenanceCost + totalDepreciation + storageCostMP;
  const currentCPP = unitsProduced > 0 ? totalProductionCost / unitsProduced : 0;

  const stockPA_Initial_Qty = 2000;
  const stockPA_Initial_Val = stockPA_Initial_Qty * 227; 
  const totalPA_Qty = stockPA_Initial_Qty + unitsProduced;
  const wacPA = (stockPA_Initial_Val + (unitsProduced * currentCPP)) / Math.max(1, totalPA_Qty);

  // 5. RECEITA E JUROS DE VENDA A PRAZO
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const marketDemand = (nominalCapacity * teamsCount) * (1 + sanitize(indicators.ice, 3)/100);
  const myShare = forcedShare || (100 / teamsCount);
  const unitsSold = Math.min(totalPA_Qty, (marketDemand * (myShare/100)));
  const avgPrice = sanitize(Object.values(safeDecisions.regions)[0]?.price, 375);
  const grossRevenue = unitsSold * avgPrice;

  // Cálculo de Receita Financeira por Juros de Venda
  const termInterestRate = sanitize(safeDecisions.production.term_interest_rate, 0) / 100;
  // Simplificação: Consideramos que 70% das vendas são a prazo no modelo Oracle industrial se term > 0
  const avgTerm = Object.values(safeDecisions.regions).reduce((acc, r) => acc + sanitize(r.term, 1), 0) / Math.max(1, Object.keys(safeDecisions.regions).length);
  const financialRevenueFromSales = avgTerm > 0 ? (grossRevenue * 0.7 * termInterestRate) : 0;
  
  const totalRevenue = grossRevenue + financialRevenueFromSales;

  // 6. DRE FINAL
  const cpv = unitsSold * wacPA;
  const grossProfit = totalRevenue - cpv;
  const staffAdmin = sanitize(indicators.staffing.admin.count, 20);
  const staffSales = sanitize(indicators.staffing.sales.count, 10);
  const opex = ((staffAdmin + staffSales) * salaryDecided) * (1 + socialChargesRate) + 350000;
  const lair = grossProfit - opex;

  const taxRateIR = sanitize(indicators.tax_rate_ir, 15) / 100;
  const irProvision = lair > 0 ? (lair * taxRateIR) : 0;
  const netProfit = lair - irProvision;

  return {
    revenue: totalRevenue,
    netProfit,
    debtRatio: 40,
    creditRating: netProfit > 0 ? 'AAA' : 'C',
    marketShare: myShare,
    health: { 
      rating: netProfit > 0 ? 'AAA' : 'C',
      cpp: currentCPP,
      wac_pa: wacPA,
      sales_interest_revenue: financialRevenueFromSales
    },
    kpis: {
      market_share: myShare,
      rating: netProfit > 0 ? 'AAA' : 'C',
      insolvency_status: netProfit > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + netProfit,
      last_decision: safeDecisions // Essencial para a média da Gazeta
    },
    statements: {
      dre: { 
        revenue: totalRevenue, cpv, gross_profit: grossProfit, opex, lair, tax: irProvision, net_profit: netProfit,
        details: { 
          cpp: currentCPP, wac_pa: wacPA, mp_consumption: mpConsumptionVal, mod_total: finalMOD,
          maintenance: finalMaintenanceCost, depreciation_total: totalDepreciation, 
          overtime_cost: overtimeCost, sales_interest: financialRevenueFromSales
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  return Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.05)), 0) / 4;
};
