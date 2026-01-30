
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType, MachineMaintenanceConfig, BuildingSpec, InitialBuilding } from '../types';
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
 * CORE ORACLE ENGINE v30.13 - RESTORED ACCOUNTING & DIVIDENDS FIDELITY
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

  // 0. CONTEXTO E CONFIGURAÇÕES
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...(roundRules?.[currentRound] || {}) };
  const maintenanceConfig: MachineMaintenanceConfig = championshipData?.config?.maintenance || {
    overload_coef: 1.2, aging_coef: 0.7, useful_life_years: { alfa: 40, beta: 40, gama: 40 },
    overload_extra_rate: 0.0008, advanced_physics_enabled: true, 
  };

  const prevBS = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(prevBS.equity?.total, 5055447);
  const prevClientsBalance = sanitize(previousState?.statements?.balance_sheet?.current?.clients, 1823735);
  const prevInvestmentsBalance = sanitize(previousState?.statements?.balance_sheet?.current?.investments, 0);
  const prevDividendsToPay = sanitize(previousState?.statements?.balance_sheet?.current?.dividends, 18481);

  // 1. STAFFING & PERFORMANCE GOAL
  const fleet = (previousState?.fleet || indicators.initial_machinery_mix) as InitialMachine[];
  const buildingSpec = indicators.building_spec;
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const extraProdPercent = sanitize(safeDecisions.production.extraProductionPercent, 0);
  const productionPercent = (activityLevel + extraProdPercent) / 100;
  const machineSpecs = indicators.machine_specs;
  const rd_percent = sanitize(safeDecisions.production.rd_investment, 0);
  const rd_productivity_bonus = Math.min(0.20, (rd_percent / 100) * 2.0); 

  const nominalCapacity = fleet.reduce((acc, m) => acc + (machineSpecs[m.model]?.production_capacity || 0), 0);
  const requiredProdStaff = fleet.reduce((acc, m) => acc + (machineSpecs[m.model]?.operators_required || 0), 0);

  const salaryBase = sanitize(safeDecisions.hr.salary, 1313);
  const prodBonusPercentInput = sanitize(safeDecisions.hr.misc, 0) / 100;
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  
  const marketAvgSalary = indicators.hr_base.salary || 1300;
  const baseMotivation = Math.min(1.0, (salaryBase / marketAvgSalary * 0.5) + (Math.min(prodBonusPercentInput * 5, 1.0) * 0.5));
  const isStriking = baseMotivation < 0.4;

  const effectiveProductivityBonus = (isStriking ? 0 : sanitize(indicators.labor_productivity, 1.0)) * (1 + rd_productivity_bonus);
  const actualEffortResult = productionPercent * effectiveProductivityBonus;
  const goalReached = actualEffortResult >= productionPercent && !isStriking;

  // 2. GESTÃO DE ATIVOS & DEPRECIAÇÃO
  const buildingDepreciation = buildingSpec.initial_value * buildingSpec.depreciation_rate;
  let totalDepreciationMachines = 0;
  let totalMaintenanceCost = 0;
  fleet.forEach((m: InitialMachine) => {
    const spec = machineSpecs[m.model];
    if (!spec) return;
    const baseValue = m.book_value ?? spec.initial_value;
    totalDepreciationMachines += (baseValue * spec.depreciation_rate);
    const baseRate = indicators.maintenance_physics[m.model === 'alfa' ? 'alpha' : m.model === 'beta' ? 'beta' : 'gamma'] || 0.05;
    const baseCost = baseValue * baseRate;
    let machineCost = baseCost;
    if (maintenanceConfig.advanced_physics_enabled) {
      const overloadCoef = spec.overload_coef ?? maintenanceConfig.overload_coef;
      const fatorProd = 1 + Math.max(0, (productionPercent - 1) * overloadCoef);
      const agingCoef = spec.aging_coef ?? maintenanceConfig.aging_coef;
      machineCost = baseCost * fatorProd * (1 + (m.age / 40) * agingCoef);
    }
    totalMaintenanceCost += machineCost;
  });

  // 3. CPP E CPV
  const salMOD_Base = (requiredProdStaff * salaryBase);
  const productivityBonusTotal = goalReached ? (salMOD_Base * prodBonusPercentInput) : 0;
  const baseHours = sanitize(indicators.production_hours_period, 946);
  const overtimeCost = Math.max(0, Math.ceil((productionPercent * baseHours) - baseHours)) * requiredProdStaff * ((salaryBase / baseHours) * 1.5);
  const indemnityCost = sanitize(safeDecisions.hr.fired, 0) * (salaryBase * 2);

  const unitsProduced = nominalCapacity * actualEffortResult;
  const mpConsumptionVal = (unitsProduced * 3 * indicators.prices.mp_a) + (unitsProduced * 2 * indicators.prices.mp_b);
  const socialChargesOnProduction = (salMOD_Base + overtimeCost + indemnityCost) * socialChargesRate;
  const totalProductionCost = mpConsumptionVal + salMOD_Base + overtimeCost + indemnityCost + socialChargesOnProduction + productivityBonusTotal + totalMaintenanceCost + totalDepreciationMachines + buildingDepreciation;
  const currentCPP = unitsProduced > 0 ? totalProductionCost / unitsProduced : 0;
  const wacPA = ( (2000 * 227) + (unitsProduced * currentCPP) ) / Math.max(1, (2000 + unitsProduced));

  // 4. CÁLCULO DE VENDAS E AMORTIZAÇÃO (ANNUITY)
  const rd_market_bonus = 1 + (rd_percent / 40); 
  const globalUnitsSold = (nominalCapacity * 0.125) * actualEffortResult * rd_market_bonus;
  
  let totalGrossRevenueEmbedded = 0;
  let cashSalesCurrent = 0;
  let newAccountsReceivableInClients = 0;

  const regions = Object.entries(safeDecisions.regions);
  const unitsPerRegion = globalUnitsSold / Math.max(regions.length, 1);
  const i_term = sanitize(safeDecisions.production.term_interest_rate, 1.5) / 100;

  regions.forEach(([id, reg]: [string, any]) => {
    const price = sanitize(reg.price, 375);
    const termType = reg.term || 0; // 0=A Vista, 1=50/50, 2=33/33/33
    const n = termType + 1; 
    
    let pmt = price;
    if (i_term > 0 && n > 1) {
      const pow = Math.pow(1 + i_term, n);
      pmt = price * (i_term * pow) / (pow - 1);
    }

    const totalToReceivePerUnit = pmt * n;
    totalGrossRevenueEmbedded += (totalToReceivePerUnit * unitsPerRegion);
    cashSalesCurrent += (pmt * unitsPerRegion);
    newAccountsReceivableInClients += ((totalToReceivePerUnit - pmt) * unitsPerRegion);
  });

  const cpv = globalUnitsSold * wacPA;
  const grossProfit = totalGrossRevenueEmbedded - cpv;

  const marketingTotal = sanitize(Object.values(safeDecisions.regions).reduce((acc, r) => acc + (r.marketing || 0), 0), 0) * indicators.prices.marketing_campaign;
  const distributionTotal = globalUnitsSold * indicators.prices.distribution_unit;
  const rd_expense = totalGrossRevenueEmbedded * (rd_percent / 100);

  const opexSales = (10 * salaryBase * 4) * (1 + socialChargesRate) + marketingTotal + distributionTotal;
  const opexAdm = (20 * salaryBase * 4) * (1 + socialChargesRate);
  const totalOpex = opexSales + opexAdm + rd_expense;
  const operatingProfit = grossProfit - totalOpex;

  // 5. RESULTADOS FINANCEIROS E NÃO OPERACIONAIS
  const applicationRevenue = prevInvestmentsBalance * (sanitize(indicators.investment_return_rate, 1.0) / 100);
  const financialExpenses = (sanitize(safeDecisions.finance.loanRequest, 0) * (sanitize(indicators.interest_rate_tr, 2.0) / 100)) + 15000; 
  const financialResult = applicationRevenue - financialExpenses;
  
  // RESTORE: Resultado Não Operacional
  const nonOpResult = 0; 
  
  const lair = operatingProfit + financialResult + nonOpResult;

  // 6. GATILHOS FISCAIS E DIVIDENDOS (APURAÇÃO BALANÇO)
  const irProvision = lair > 0 ? (lair * (sanitize(indicators.tax_rate_ir, 15) / 100)) : 0;
  const netIncome = (lair - irProvision) * (1 - (sanitize(safeDecisions.hr.participationPercent, 0) / 100));
  
  // Apuração de Dividendos: 25% (default) ou customizado pelo tutor
  const dividendRate = sanitize(championshipData?.dividend_percent ?? indicators.dividend_percent, 25) / 100;
  const newDividendsProvision = netIncome > 0 ? (netIncome * dividendRate) : 0;
  
  // Lucro/Prejuízo Líquido Retido (Alimenta o Lucro Acumulado no PL)
  const retainedProfit = netIncome - newDividendsProvision;

  // 7. FLUXO DE CAIXA (Sincronizado com Dividendos a Pagar do Período Anterior)
  const initialCash = sanitize(previousState?.cash, 170000);
  const termSalesReceiptFromPrev = prevClientsBalance * 0.4; 
  const netTermReceiptFromClients = termSalesReceiptFromPrev * (1 - sanitize(indicators.customer_default_rate, 2.6) / 100);
  
  // PAGAMENTO: Fluxo de Caixa paga o saldo de 'Dividendos a Pagar' vindo do round anterior
  const dividendsPaidThisRound = prevDividendsToPay;

  const totalInflow = cashSalesCurrent + netTermReceiptFromClients + prevInvestmentsBalance + applicationRevenue + sanitize(safeDecisions.finance.loanRequest, 0);
  const totalOutflow = (opexSales + opexAdm + salMOD_Base + overtimeCost + indemnityCost + productivityBonusTotal + rd_expense + (cpv * 0.7) + totalMaintenanceCost + financialExpenses + irProvision + dividendsPaidThisRound);

  const finalCash = initialCash + totalInflow - totalOutflow - sanitize(safeDecisions.finance.application, 0);

  return {
    revenue: totalGrossRevenueEmbedded,
    netProfit: netIncome,
    debtRatio: 40,
    creditRating: netIncome > 0 ? 'AAA' : 'C',
    marketShare: 12.5 * rd_market_bonus,
    health: { rating: netIncome > 0 ? 'AAA' : 'C', cpp: currentCPP, cash: finalCash, maint_cost: totalMaintenanceCost },
    kpis: {
      market_share: 12.5 * rd_market_bonus,
      rating: netIncome > 0 ? 'AAA' : 'C',
      insolvency_status: netIncome > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + retainedProfit,
      fleet: fleet,
      building: { age: (previousState?.building?.age || 40) + 1, purchase_value: 5440000 }
    },
    statements: {
      dre: { 
        revenue: totalGrossRevenueEmbedded, cpv, gross_profit: grossProfit, opex: totalOpex, operating_profit: operatingProfit,
        financial_result: financialResult, non_op_res: nonOpResult, lair, tax: irProvision, net_profit: netIncome,
        details: { cpp: currentCPP, building_deprec: buildingDepreciation, machine_deprec: totalDepreciationMachines, fin_rev: applicationRevenue }
      },
      cash_flow: {
        start: initialCash,
        inflow: { total: totalInflow, cash_sales: cashSalesCurrent, term_sales: netTermReceiptFromClients, investment_withdrawal: prevInvestmentsBalance + applicationRevenue },
        outflow: { total: totalOutflow, maintenance: totalMaintenanceCost, taxes: irProvision, dividends: dividendsPaidThisRound },
        final: finalCash
      },
      balance_sheet: {
        current: { 
          clients: prevClientsBalance + newAccountsReceivableInClients - termSalesReceiptFromPrev, 
          cash: finalCash, 
          investments: sanitize(safeDecisions.finance.application, 0),
          dividends: newDividendsProvision // Nova provisão gerada pelo lucro do round atual
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const rd_bonus = 1 + (sanitize(decisions.production.rd_investment, 0) / 30);
  return (Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.06)), 0) / 4) * rd_bonus;
};
