
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType, MachineMaintenanceConfig } from '../types';
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
 * CORE ORACLE ENGINE v30.0 - ADVANCED PHYSICS UPDATE
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

  // 0. CONTEXTO E CONFIGURAÇÕES DE FÍSICA
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...(roundRules?.[currentRound] || {}) };
  const maintenanceConfig: MachineMaintenanceConfig = championshipData?.config?.maintenance || {
    overload_coef: 1.2,
    aging_coef: 0.7,
    useful_life_years: { alfa: 25, beta: 30, gama: 35 },
    overload_extra_rate: 0.0008,
    advanced_physics_enabled: true, // Default ON para novas arenas v30
  };

  const prevBS = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(prevBS.equity?.total, 5055447);
  const prevClientsBalance = sanitize(previousState?.statements?.balance_sheet?.current?.clients, 1823735);
  const prevInvestmentsBalance = sanitize(previousState?.statements?.balance_sheet?.current?.investments, 0);

  // 1. MATÉRIAS-PRIMAS
  const stockMPA_Initial_Val = 200000;
  const purchaseMPA_Qty = sanitize(safeDecisions.production.purchaseMPA, 0);
  const purchaseMPA_Val = purchaseMPA_Qty * indicators.prices.mp_a;
  const wacMPA = (stockMPA_Initial_Val + purchaseMPA_Val) / Math.max(1, (10000 + purchaseMPA_Qty));

  const stockMPB_Initial_Val = 200000;
  const purchaseMPB_Qty = sanitize(safeDecisions.production.purchaseMPB, 0);
  const purchaseMPB_Val = purchaseMPB_Qty * indicators.prices.mp_b;
  const wacMPB = (stockMPB_Initial_Val + purchaseMPB_Val) / Math.max(1, (5000 + purchaseMPB_Qty));

  // 2. STAFFING & PERFORMANCE GOAL
  const fleet = (previousState?.fleet || indicators.initial_machinery_mix) as InitialMachine[];
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const extraProdPercent = sanitize(safeDecisions.production.extraProductionPercent, 0);
  const targetEffortLevel = (activityLevel + extraProdPercent) / 100;

  const machineSpecs = indicators.machine_specs;
  const rd_percent = sanitize(safeDecisions.production.rd_investment, 0);
  const rd_productivity_bonus = Math.min(0.20, (rd_percent / 100) * 2.0); 

  const buy = safeDecisions.machinery.buy;
  const nominalCapacity = (fleet.length * machineSpecs.alfa.production_capacity) + (buy.alfa * machineSpecs.alfa.production_capacity); 
  const requiredProdStaff = (fleet.length * machineSpecs.alfa.operators_required);

  const salaryBase = sanitize(safeDecisions.hr.salary, 1313);
  const prodBonusPercentInput = sanitize(safeDecisions.hr.misc, 0) / 100;
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  
  const marketAvgSalary = indicators.hr_base.salary || 1300;
  const salaryRatio = salaryBase / marketAvgSalary;
  const baseMotivation = Math.min(1.0, (salaryRatio * 0.5) + (Math.min(prodBonusPercentInput * 5, 1.0) * 0.5));
  const isStriking = baseMotivation < 0.4;

  const effectiveProductivityBonus = (isStriking ? 0 : sanitize(indicators.labor_productivity, 1.0)) * (1 + rd_productivity_bonus);
  const actualEffortResult = targetEffortLevel * effectiveProductivityBonus;
  const goalReached = actualEffortResult >= targetEffortLevel && !isStriking;

  // 3. GESTÃO DE ATIVOS & MANUTENÇÃO AVANÇADA v30.0
  const structuralDepreciation = 54400; 
  let totalDepreciationMachines = 0;
  let totalMaintenanceCost = 0;
  const machineMaintenanceBreakdown: any[] = [];

  // Fator Produtividade: Desgaste cresce com o esforço
  const productionPercent = targetEffortLevel;

  fleet.forEach((m: InitialMachine) => {
    const spec = machineSpecs[m.model];
    if (!spec) return;

    totalDepreciationMachines += (spec.initial_value * spec.depreciation_rate);
    
    // Custo Base de Manutenção (Taxa base do round)
    const baseRate = indicators.maintenance_physics[m.model === 'alfa' ? 'alpha' : m.model === 'beta' ? 'beta' : 'gamma'] || 0.05;
    const purchaseVal = m.purchase_value || spec.initial_value;
    const baseCost = purchaseVal * baseRate;

    let machineCost = baseCost;

    if (maintenanceConfig.advanced_physics_enabled) {
      // a) Fator Produtividade (Linear com coeficiente de sobrecarga)
      const overloadCoef = spec.overload_coef ?? maintenanceConfig.overload_coef;
      const fatorProd = 1 + Math.max(0, (productionPercent - 1) * overloadCoef);

      // b) Fator Idade (Frequência de quebras aumenta com o tempo)
      const age = m.age || 0;
      const usefulLife = spec.useful_life_years ?? maintenanceConfig.useful_life_years[m.model] ?? 25;
      const agingCoef = spec.aging_coef ?? maintenanceConfig.aging_coef;
      const fatorIdade = 1 + (age / usefulLife) * agingCoef;

      machineCost = baseCost * fatorProd * fatorIdade;

      // c) Penalidade de Sobrecarga Crítica (>130%)
      if (productionPercent > 1.3) {
        const overloadExcess = productionPercent - 1.3;
        const extraRate = spec.overload_extra_rate ?? maintenanceConfig.overload_extra_rate;
        machineCost += spec.initial_value * overloadExcess * extraRate;
      }
    }

    totalMaintenanceCost += machineCost;
    machineMaintenanceBreakdown.push({
      id: m.id,
      model: m.model,
      age: m.age,
      cost: machineCost
    });
  });

  // 4. CPP E CPV
  const salMOD_Base = (requiredProdStaff * salaryBase);
  const productivityBonusTotal = goalReached ? (salMOD_Base * prodBonusPercentInput) : 0;
  const salAdmin = (20 * salaryBase * 4);
  const salSales = (10 * salaryBase * 4);
  const baseHours = sanitize(indicators.production_hours_period, 946);
  const extraHoursPerMan = Math.max(0, Math.ceil(((activityLevel / 100) * baseHours) - baseHours));
  const overtimeCost = extraHoursPerMan * requiredProdStaff * ((salaryBase / baseHours) * 1.5);
  const indemnityCost = sanitize(safeDecisions.hr.fired, 0) * (salaryBase * 2);

  const unitsProduced = nominalCapacity * actualEffortResult;
  const mpConsumptionVal = (unitsProduced * 3 * wacMPA) + (unitsProduced * 2 * wacMPB);
  const socialChargesOnProduction = (salMOD_Base + overtimeCost + indemnityCost) * socialChargesRate;
  
  const totalProductionCost = mpConsumptionVal + salMOD_Base + overtimeCost + indemnityCost + socialChargesOnProduction + productivityBonusTotal + totalMaintenanceCost + totalDepreciationMachines + structuralDepreciation;
  const currentCPP = unitsProduced > 0 ? totalProductionCost / unitsProduced : 0;
  const wacPA = ( (2000 * 227) + (unitsProduced * currentCPP) ) / Math.max(1, (2000 + unitsProduced));

  // 5. RECEITA E OPEX
  const rd_market_bonus = 1 + (rd_percent / 40); 
  const unitsSold = (nominalCapacity * 0.125) * actualEffortResult * rd_market_bonus;
  const avgPrice = sanitize(Object.values(safeDecisions.regions)[0]?.price, 375);
  const grossRevenue = unitsSold * avgPrice;
  const cpv = unitsSold * wacPA;
  const grossProfit = grossRevenue - cpv;

  const marketingTotal = sanitize(Object.values(safeDecisions.regions).reduce((acc, r) => acc + (r.marketing || 0), 0), 0) * indicators.prices.marketing_campaign;
  const distributionTotal = unitsSold * indicators.prices.distribution_unit;
  const rd_expense = grossRevenue * (rd_percent / 100);

  const opexSales = salSales + (socialChargesRate * salSales) + marketingTotal + distributionTotal;
  const opexAdm = salAdmin + (socialChargesRate * salAdmin);
  const totalOpex = opexSales + opexAdm + rd_expense;
  const operatingProfit = grossProfit - totalOpex;

  // 6. RESULTADOS FINANCEIROS
  const investmentReturnRate = sanitize(indicators.investment_return_rate, 1.0) / 100;
  const applicationRevenue = prevInvestmentsBalance * investmentReturnRate;
  
  const bankInterestRate = sanitize(indicators.interest_rate_tr, 2.0) / 100;
  const financialExpenses = (sanitize(safeDecisions.finance.loanRequest, 0) * bankInterestRate) + 15000; 
  const financialResult = applicationRevenue - financialExpenses;
  const lair = operatingProfit + financialResult;

  // 7. GATILHOS FISCAIS
  const taxRateIR = sanitize(indicators.tax_rate_ir, 15) / 100;
  const irProvision = lair > 0 ? (lair * taxRateIR) : 0;
  const profitAfterIR = lair - irProvision;
  const plr_pct = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const plrAmount = profitAfterIR > 0 ? (profitAfterIR * plr_pct) : 0;
  const netIncome = profitAfterIR - plrAmount;
  const div_pct = sanitize(championshipData?.dividend_percent ?? indicators.dividend_percent, 25) / 100;
  const dividends = netIncome > 0 ? (netIncome * div_pct) : 0;
  const retainedProfit = netIncome - dividends;

  // 8. FLUXO DE CAIXA
  const initialCash = sanitize(previousState?.cash, 170000);
  const cashSales = grossRevenue * 0.5; 
  const termSalesDueTotal = prevClientsBalance * 0.4; 
  const badDebtRate = sanitize(indicators.customer_default_rate, 2.6) / 100;
  const badDebtAmount = termSalesDueTotal * badDebtRate;
  const netTermSalesReceipt = termSalesDueTotal - badDebtAmount;
  
  const totalInvestmentResgate = prevInvestmentsBalance + applicationRevenue;
  const loanEntry = sanitize(safeDecisions.finance.loanRequest, 0);
  const totalInflow = cashSales + netTermSalesReceipt + totalInvestmentResgate + loanEntry;
  
  const payrollTotalCash = salAdmin + salSales + salMOD_Base + overtimeCost + indemnityCost + plrAmount + productivityBonusTotal;
  const chargesTotalCash = (salAdmin + salSales + salMOD_Base + overtimeCost + indemnityCost) * socialChargesRate;
  const supplierPayment = cpv * 0.7; 
  const totalOutflow = payrollTotalCash + chargesTotalCash + rd_expense + marketingTotal + distributionTotal + supplierPayment + totalMaintenanceCost + financialExpenses + irProvision + dividends;

  const investmentApply = sanitize(safeDecisions.finance.application, 0);
  const finalCash = initialCash + totalInflow - totalOutflow - investmentApply;

  // 9. PROJEÇÃO PATRIMONIAL
  const newTermSalesCreated = grossRevenue * 0.5;
  const newClientsBalance = prevClientsBalance + newTermSalesCreated - netTermSalesReceipt;
  const newInvestmentsBalance = investmentApply;

  return {
    revenue: grossRevenue,
    netProfit: netIncome,
    debtRatio: 40,
    creditRating: netIncome > 0 ? 'AAA' : 'C',
    marketShare: 12.5 * rd_market_bonus,
    health: { 
      rating: netIncome > 0 ? 'AAA' : 'C',
      cpp: currentCPP,
      cash: finalCash,
      bad_debt: badDebtAmount,
      motivation: baseMotivation,
      investment_yield: applicationRevenue,
      maint_cost: totalMaintenanceCost,
      breakdown: machineMaintenanceBreakdown
    },
    kpis: {
      market_share: 12.5 * rd_market_bonus,
      rating: netIncome > 0 ? 'AAA' : 'C',
      insolvency_status: netIncome > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + retainedProfit,
      last_decision: safeDecisions,
      machine_maintenance_breakdown: machineMaintenanceBreakdown
    },
    statements: {
      dre: { 
        revenue: grossRevenue, cpv, gross_profit: grossProfit, opex: totalOpex, operating_profit: operatingProfit,
        financial_result: financialResult, lair, tax: irProvision, profit_after_ir: profitAfterIR,
        plr: plrAmount, net_profit: netIncome, dividends, retained_profit: retainedProfit,
        details: { 
          rd_investment: rd_expense, social_charges: chargesTotalCash, payroll_net: payrollTotalCash,
          cpp: currentCPP, wac_pa: wacPA, productivity_bonus: productivityBonusTotal,
          fin_rev: applicationRevenue
        }
      },
      cash_flow: {
        start: initialCash,
        inflow: {
          total: totalInflow,
          cash_sales: cashSales,
          term_sales: netTermSalesReceipt,
          investment_withdrawal: totalInvestmentResgate,
          machine_sales: 0,
          awards: 0,
          loans_normal: loanEntry,
          compulsory: 0
        },
        outflow: {
          total: totalOutflow,
          payroll: payrollTotalCash,
          social_charges: chargesTotalCash,
          rd: rd_expense,
          marketing: marketingTotal,
          distribution: distributionTotal,
          storage: 0,
          suppliers: supplierPayment,
          misc: 0,
          machine_buy: 0,
          maintenance: totalMaintenanceCost,
          amortization: 0,
          late_penalties: 0,
          interest: financialExpenses,
          training: 0,
          taxes: irProvision,
          dividends: dividends
        },
        investment_apply: investmentApply,
        final: finalCash
      },
      balance_sheet: {
        current: { 
          clients: newClientsBalance, 
          cash: finalCash,
          investments: newInvestmentsBalance
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const rd_bonus = 1 + (sanitize(decisions.production.rd_investment, 0) / 30);
  return (Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.06)), 0) / 4) * rd_bonus;
};
