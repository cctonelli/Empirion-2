
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
 * CORE ORACLE ENGINE v24.4 - MOTIVATION & STRIKE PROTOCOL
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
  
  // 2. ALGORITMO DE MOTIVAÇÃO (VETORES)
  // Vetor 1: Salário vs Inflação (Peso 30%)
  const inflationImpact = 1 + (sanitize(indicators.inflation_rate, 1) / 100);
  const targetSalary = sanitize(indicators.hr_base.salary, 1300) * inflationImpact;
  const salaryScore = Math.min(1.2, salaryDecided / targetSalary);

  // Vetor 2: Stress Produtivo (Peso 25%)
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const stressPenalty = activityLevel > 100 ? (activityLevel - 100) / 100 : 0;
  const stressScore = 1.0 - stressPenalty;

  // Vetor 3: Competência/Treinamento (Peso 10%)
  const hasNewMachines = (safeDecisions.machinery.buy.alfa + safeDecisions.machinery.buy.beta + safeDecisions.machinery.buy.gama) > 0;
  const trainingReadiness = hasNewMachines 
    ? (sanitize(safeDecisions.hr.trainingPercent, 0) / 10) // Exige 10% para score full
    : 1.0;
  const trainingScore = Math.min(1.0, trainingReadiness);

  // Vetor 4: Solvência (Peso 15%)
  // Simulado com base no histórico de rating (ou neutro se round 1)
  const solvencyScore = previousState?.kpis?.rating === 'D' ? 0.4 : previousState?.kpis?.rating === 'C' ? 0.7 : 1.0;

  // Vetor 5: PLR (Será refinado após cálculo do lucro, mas usamos a decisão de % como proxy de intenção)
  const plrIntentScore = Math.min(1.0, (sanitize(safeDecisions.hr.participationPercent, 0) / 5));

  const motivationIndex = (
    (salaryScore * 0.35) + 
    (stressScore * 0.25) + 
    (trainingScore * 0.15) + 
    (solvencyScore * 0.15) + 
    (plrIntentScore * 0.10)
  );

  // 3. PROTOCOLO DE GREVE (STRIKE)
  const isOnStrike = motivationIndex < 0.15;
  const strikeRisk = motivationIndex < 0.35;

  // 4. PRODUÇÃO E CPV
  // Se em GREVE, produção = 0.
  const effectiveActivity = isOnStrike ? 0 : activityLevel;
  const unitsProduced = 10000 * sanitize(indicators.labor_productivity, 1.0) * (effectiveActivity / 100);
  
  const totalMPCost = (unitsProduced * 3 * sanitize(indicators.prices.mp_a, 20)) + (unitsProduced * 2 * sanitize(indicators.prices.mp_b, 40));
  const modDirect = (staffProd * salaryDecided) * socialChargesFactor;
  const productionCost = totalMPCost + modDirect + 150000; 
  const unitCost = unitsProduced > 0 ? productionCost / unitsProduced : 0;

  // 5. VENDAS E RECEITA
  const teamsCount = Math.max(championshipData?.teams?.length || 1, 1);
  const marketDemand = (10000 * teamsCount) * (1 + sanitize(indicators.ice, 3)/100);
  const myShare = forcedShare || (100 / teamsCount);
  const unitsSold = Math.min(unitsProduced, (marketDemand * (myShare/100)));
  const avgPrice = sanitize(Object.values(safeDecisions.regions)[0]?.price, 375);
  const revenue = unitsSold * avgPrice;

  // 6. DRE TÁTICO
  const cpv = unitsSold * unitCost;
  const grossProfit = revenue - cpv;
  const opex = ((staffAdmin + staffSales) * salaryDecided) * socialChargesFactor + 350000;
  const operatingProfit = grossProfit - opex;
  const lair = operatingProfit - 40000;

  const taxRateIR = sanitize(indicators.tax_rate_ir, 15) / 100;
  const irProvision = lair > 0 ? (lair * taxRateIR) : 0;
  const profitAfterTax = lair - irProvision;

  // PPR/PLR FINAL
  const plrPercent = sanitize(safeDecisions.hr.participationPercent, 0) / 100;
  const plrValue = profitAfterTax > 0 ? (profitAfterTax * plrPercent) : 0;
  const plrPerEmployee = plrValue / Math.max(totalStaff, 1);

  const netProfit = profitAfterTax - plrValue;

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
        label: isOnStrike ? 'GREVE' : (motivationIndex > 0.75 ? 'BOA' : (motivationIndex > 0.4 ? 'REGULAR' : 'RUIM')),
        is_strike_active: isOnStrike,
        is_strike_imminent: strikeRisk && !isOnStrike,
        plr_per_capita: plrPerEmployee,
        factors: {
          salary: salaryScore,
          stress: stressScore,
          training: trainingScore,
          solvency: solvencyScore
        }
      }
    },
    kpis: {
      market_share: myShare,
      rating: netProfit > 0 ? 'AAA' : 'C',
      insolvency_status: netProfit > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: prevEquity + netProfit,
      motivation_score: motivationIndex,
      is_on_strike: isOnStrike
    },
    statements: {
      dre: { 
        revenue, cpv, gross_profit: grossProfit, opex, operating_profit: operatingProfit,
        lair, tax: irProvision, profit_after_tax: profitAfterTax,
        plr: plrValue, net_profit: netProfit,
        details: { unit_cost: unitCost, total_staff: totalStaff, plr_per_employee: plrPerEmployee }
      },
      cash_flow: {
        outflow: {
          payroll: (totalStaff * salaryDecided * socialChargesFactor) + plrValue,
          taxes: prevTaxProvision 
        }
      }
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  return Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.05)), 0) / 4;
};
