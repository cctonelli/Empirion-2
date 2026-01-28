
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
 * CORE ORACLE ENGINE v28.0 - FISCAL GATING & EQUITY PROTECTION
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

  // 1. MATÉRIAS-PRIMAS
  const stockMPA_Initial_Val = 200000;
  const purchaseMPA_Qty = sanitize(safeDecisions.production.purchaseMPA, 0);
  const purchaseMPA_Val = purchaseMPA_Qty * indicators.prices.mp_a;
  const wacMPA = (stockMPA_Initial_Val + purchaseMPA_Val) / Math.max(1, (10000 + purchaseMPA_Qty));

  const stockMPB_Initial_Val = 200000;
  const purchaseMPB_Qty = sanitize(safeDecisions.production.purchaseMPB, 0);
  const purchaseMPB_Val = purchaseMPB_Qty * indicators.prices.mp_b;
  const wacMPB = (stockMPB_Initial_Val + purchaseMPB_Val) / Math.max(1, (5000 + purchaseMPB_Qty));

  // 2. GESTÃO DE ATIVOS E EFEITO P&D
  const machineSpecs = indicators.machine_specs;
  const mPhysics = indicators.maintenance_physics;
  const structuralDepreciation = 54400; // 1% de 5.44M
  let totalDepreciationMachines = 0;
  let totalMaintenanceCost = 0;

  const fleet = previousState?.fleet || indicators.initial_machinery_mix;
  const rd_percent = sanitize(safeDecisions.production.rd_investment, 0);
  const rd_productivity_bonus = Math.min(0.20, (rd_percent / 100) * 2.0); 
  const effectiveProductivity = sanitize(indicators.labor_productivity, 1.0) * (1 + rd_productivity_bonus);

  fleet.forEach((m: InitialMachine) => {
    const spec = machineSpecs[m.model];
    totalDepreciationMachines += (spec.initial_value * spec.depreciation_rate);
    const baseMaintRate = m.model === 'alfa' ? mPhysics.alpha : m.model === 'beta' ? mPhysics.beta : mPhysics.gamma;
    totalMaintenanceCost += (spec.initial_value * baseMaintRate);
  });

  // 3. STAFFING E ENCARGOS SOCIAIS (20 ADM / 10 VENDAS)
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const buy = safeDecisions.machinery.buy;
  const nominalCapacity = (fleet.length * machineSpecs.alfa.production_capacity) + (buy.alfa * machineSpecs.alfa.production_capacity); 
  const requiredProdStaff = (fleet.length * machineSpecs.alfa.operators_required);

  const salaryBase = sanitize(safeDecisions.hr.salary, 1313);
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;

  const salAdmin = (20 * salaryBase * 4);
  const salSales = (10 * salaryBase * 4);
  const salMOD_Base = (requiredProdStaff * salaryBase);
  
  const baseHours = sanitize(indicators.production_hours_period, 946);
  const extraHoursPerMan = Math.max(0, Math.ceil(((activityLevel / 100) * baseHours) - baseHours));
  const overtimeCost = extraHoursPerMan * requiredProdStaff * ((salaryBase / baseHours) * 1.5);
  const indemnityCost = sanitize(safeDecisions.hr.fired, 0) * (salaryBase * 2);

  // 4. CPP E CPV
  const unitsProduced = nominalCapacity * (activityLevel / 100) * effectiveProductivity;
  const mpConsumptionVal = (unitsProduced * 3 * wacMPA) + (unitsProduced * 2 * wacMPB);
  const productionSocialCharges = (salMOD_Base + overtimeCost + indemnityCost) * socialChargesRate;
  
  const totalProductionCost = mpConsumptionVal + salMOD_Base + overtimeCost + indemnityCost + productionSocialCharges + totalMaintenanceCost + totalDepreciationMachines + structuralDepreciation;
  const currentCPP = unitsProduced > 0 ? totalProductionCost / unitsProduced : 0;
  const wacPA = ( (2000 * 227) + (unitsProduced * currentCPP) ) / Math.max(1, (2000 + unitsProduced));

  // 5. RECEITA E OPEX
  const rd_market_bonus = 1 + (rd_percent / 40); 
  const unitsSold = (nominalCapacity * 0.125) * (activityLevel/100) * rd_market_bonus;
  const avgPrice = sanitize(Object.values(safeDecisions.regions)[0]?.price, 375);
  const grossRevenue = unitsSold * avgPrice;
  const cpv = unitsSold * wacPA;
  const grossProfit = grossRevenue - cpv;

  const marketingTotal = sanitize(Object.values(safeDecisions.regions).reduce((acc, r) => acc + (r.marketing || 0), 0), 0) * indicators.prices.marketing_campaign;
  const distributionTotal = unitsSold * indicators.prices.distribution_unit;
  const rd_expense = grossRevenue * (rd_percent / 100);

  const opexSales = salSales + (salSales * socialChargesRate) + marketingTotal + distributionTotal;
  const opexAdm = salAdmin + (salAdmin * socialChargesRate);
  const totalOpex = opexSales + opexAdm + rd_expense;
  const operatingProfit = grossProfit - totalOpex;

  // 6. RESULTADO FINANCEIRO E LAIR
  const investmentReturnRate = sanitize(indicators.investment_return_rate, 1.0) / 100;
  const applicationRevenue = sanitize(safeDecisions.finance.application, 0) * investmentReturnRate;
  const bankInterestRate = sanitize(indicators.interest_rate_tr, 2.0) / 100;
  const financialExpenses = (sanitize(safeDecisions.finance.loanRequest, 0) * bankInterestRate) + 15000; 
  const financialResult = applicationRevenue - financialExpenses;

  const lair = operatingProfit + financialResult;

  // 7. GATILHOS FISCAIS v28.0 (PROTOCOLOS CONDICIONAIS)
  const taxRateIR = sanitize(indicators.tax_rate_ir, 15) / 100;
  
  // REGRA IR: Só debita IR a pagar se LAIR > 0
  const irProvision = lair > 0 ? (lair * taxRateIR) : 0;
  const profitAfterIR = lair - irProvision;

  // REGRA PLR: Só paga PLR se Lucro Após IR > 0
  const plr_pct = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const plrAmount = profitAfterIR > 0 ? (profitAfterIR * plr_pct) : 0;
  const netIncome = profitAfterIR - plrAmount;

  // REGRA DIVIDENDOS: Só calcula se Lucro Líquido > 0
  const div_pct = sanitize(championshipData?.dividend_percent ?? indicators.dividend_percent, 25) / 100;
  const dividends = netIncome > 0 ? (netIncome * div_pct) : 0;
  
  // IMPACTO FINAL NO PATRIMÔNIO LÍQUIDO
  const retainedProfit = netIncome - dividends;

  // 8. CONSOLIDAÇÃO FLUXO DE CAIXA
  const payrollNet = salAdmin + salSales + salMOD_Base + overtimeCost + indemnityCost + plrAmount;
  const totalSocialCharges = (salAdmin + salSales + salMOD_Base + overtimeCost + indemnityCost) * socialChargesRate;

  return {
    revenue: grossRevenue,
    netProfit: netIncome,
    debtRatio: 40,
    creditRating: netIncome > 0 ? 'AAA' : 'C',
    marketShare: 12.5 * rd_market_bonus,
    health: { 
      rating: netIncome > 0 ? 'AAA' : 'C',
      cpp: currentCPP,
      rd_boost: rd_productivity_bonus,
      ir_applied: irProvision > 0,
      retained_profit: retainedProfit
    },
    kpis: {
      market_share: 12.5 * rd_market_bonus,
      rating: netIncome > 0 ? 'AAA' : 'C',
      insolvency_status: netIncome > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + retainedProfit, // PROTOCOLO v28: Soma Lucro Retido (já descontado dividendos)
      last_decision: safeDecisions 
    },
    statements: {
      dre: { 
        revenue: grossRevenue, cpv, gross_profit: grossProfit, opex: totalOpex, operating_profit: operatingProfit,
        financial_result: financialResult, lair, tax: irProvision, profit_after_ir: profitAfterIR,
        plr: plrAmount, net_profit: netIncome, dividends, retained_profit: retainedProfit,
        details: { 
          rd_investment: rd_expense,
          social_charges: totalSocialCharges,
          payroll_net: payrollNet,
          cpp: currentCPP,
          wac_pa: wacPA
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const rd_bonus = 1 + (sanitize(decisions.production.rd_investment, 0) / 30);
  return (Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.06)), 0) / 4) * rd_bonus;
};
