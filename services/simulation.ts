
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
 * CORE ORACLE ENGINE v24.3 - MOTIVATION & PLR KERNEL
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

  // 0. CONTEXTO MACRO E STAFFING
  const prevBS = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevEquity = sanitize(prevBS.equity?.total, 5055447);
  const prevTaxProvision = sanitize(prevBS.liabilities?.current_taxes || 13045);

  const roundOverride = roundRules?.[currentRound] || {};
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...roundOverride };

  const staffAdmin = sanitize(indicators.staffing.admin.count, 20);
  const staffSales = sanitize(indicators.staffing.sales.count, 10);
  const staffProd = sanitize(indicators.staffing.production.count, 470);
  const totalStaff = staffAdmin + staffSales + staffProd;

  // 1. GESTÃO DE PESSOAL E CUSTOS FIXOS
  const salaryDecided = sanitize(safeDecisions.hr.salary, 1313);
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  const socialChargesFactor = 1 + socialChargesRate;
  
  // 2. PRODUÇÃO E CPV
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const unitsProduced = 10000 * sanitize(indicators.labor_productivity, 1.0) * (activityLevel / 100);
  const totalMPCost = (unitsProduced * 3 * sanitize(indicators.prices.mp_a, 20)) + (unitsProduced * 2 * sanitize(indicators.prices.mp_b, 40));
  
  const modDirect = (staffProd * salaryDecided) * socialChargesFactor;
  const productionCost = totalMPCost + modDirect + 150000; 
  const unitCost = productionCost / Math.max(unitsProduced, 1);

  // 3. VENDAS E RECEITA
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const marketDemand = (10000 * teamsCount) * (1 + sanitize(indicators.ice, 3)/100);
  const myShare = forcedShare || (100 / teamsCount);
  const unitsSold = Math.min(unitsProduced, (marketDemand * (myShare/100)));
  const avgPrice = sanitize(Object.values(safeDecisions.regions)[0]?.price, 375);
  const revenue = unitsSold * avgPrice;

  // 4. DRE TÁTICO
  const cpv = unitsSold * unitCost;
  const grossProfit = revenue - cpv;
  const opex = ((staffAdmin + staffSales) * salaryDecided) * socialChargesFactor + 350000;
  const operatingProfit = grossProfit - opex;
  const lair = operatingProfit - 40000; // Financeiro fixo baseline

  // IR (Provisionado para o passivo, pago no próximo)
  const taxRateIR = sanitize(indicators.tax_rate_ir, 15) / 100;
  const irProvision = lair > 0 ? (lair * taxRateIR) : 0;
  const profitAfterTax = lair - irProvision;

  // REGRA PLR (PPR): Calculado após lucro pós-IR e pago no mesmo período
  const plrPercent = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const plrValue = profitAfterTax > 0 ? (profitAfterTax * plrPercent) : 0;
  const plrPerEmployee = plrValue / Math.max(totalStaff, 1);

  const netProfit = profitAfterTax - plrValue;

  // 5. ALGORITMO DE MOTIVAÇÃO (Metadata para Greve)
  // Vetor Salário vs Inflação
  const inflationImpact = 1 + (sanitize(indicators.inflation_rate, 1) / 100);
  const salaryHealth = Math.min(1.2, salaryDecided / (sanitize(indicators.hr_base.salary, 1300) * inflationImpact));
  
  // Vetor Stress (Acima de 100% penaliza)
  const stressFactor = activityLevel > 100 ? 1 - ((activityLevel - 100) / 100) : 1.0;
  
  // Vetor Treinamento vs Novos Ativos
  const hasNewMachines = (safeDecisions.machinery.buy.alfa + safeDecisions.machinery.buy.beta + safeDecisions.machinery.buy.gama) > 0;
  const trainingReadiness = hasNewMachines ? (sanitize(safeDecisions.hr.trainingPercent, 0) / 10) : 1.0;

  const motivationIndex = (
    (salaryHealth * 0.4) + 
    (stressFactor * 0.3) + 
    (trainingReadiness * 0.1) + 
    (Math.min(1.5, (plrPerEmployee / 100)) * 0.2)
  );

  const motivationLabel = motivationIndex > 0.8 ? 'BOA' : motivationIndex > 0.5 ? 'REGULAR' : 'RUIM';

  // 6. FINANCEIRO (Fluxo e Balanço)
  const totalPayrollOutflow = (totalStaff * salaryDecided * socialChargesFactor) + plrValue;

  return {
    revenue,
    netProfit,
    debtRatio: 40,
    creditRating: netProfit > 0 ? 'AAA' : 'C',
    marketShare: myShare,
    health: { 
      rating: netProfit > 0 ? 'AAA' : 'C',
      motivation: {
        index: motivationIndex,
        label: motivationLabel,
        is_strike_imminent: motivationIndex < 0.3,
        plr_per_capita: plrPerEmployee
      }
    },
    kpis: {
      market_share: myShare,
      rating: netProfit > 0 ? 'AAA' : 'C',
      insolvency_status: netProfit > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + netProfit,
      motivation_score: motivationIndex
    },
    statements: {
      dre: { 
        revenue, 
        cpv, 
        gross_profit: grossProfit, 
        opex, 
        operating_profit: operatingProfit,
        lair,
        tax: irProvision, 
        profit_after_tax: profitAfterTax,
        plr: plrValue,
        net_profit: netProfit,
        details: {
           unit_cost: unitCost,
           plr_per_employee: plrPerEmployee,
           total_staff: totalStaff,
           motivation_index: motivationIndex
        }
      },
      balance_sheet: {
        liabilities: {
          current_taxes: irProvision
        }
      },
      cash_flow: {
        outflow: {
          payroll: totalPayrollOutflow,
          taxes: prevTaxProvision 
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  return Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.05)), 0) / 4;
};
