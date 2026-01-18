import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

export const calculateMaintenanceCost = (baseValue: number, age: number, utilization: number, physics: { alpha: number, beta: number, gamma: number }): number => {
  const ageFactor = 1 + physics.alpha * Math.pow(age, physics.beta);
  const utilizationFactor = 1 + physics.gamma * utilization;
  return baseValue * ageFactor * utilizationFactor * 0.01;
};

export const calculateBankRating = (data: { lc: number, endividamento: number, margem: number, equity: number }, hasScissorsEffect: boolean) => {
  let score = 0;
  if (data.lc > 1.2) score += 30;
  if (data.endividamento < 50) score += 30;
  if (data.margem > 5) score += 40;
  if (hasScissorsEffect) score -= 20;

  let rating: CreditRating = 'AAA';
  if (score < 30) rating = 'D';
  else if (score < 50) rating = 'C';
  else if (score < 70) rating = 'B';
  else if (score < 85) rating = 'A';
  else if (score < 95) rating = 'AA';

  return { rating, score, credit_limit: Math.max(0, data.equity * 0.5) };
};

/**
 * CORE ORACLE ENGINE v13.5 GOLD - CUMULATIVE GEOMETRIC COSTS
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  baseIndicators: MacroIndicators = DEFAULT_MACRO,
  previousState?: any,
  roundHistory: any[] = [],
  currentRound: number = 1,
  roundRules?: Record<number, Partial<MacroIndicators>>
): ProjectionResult => {
  const bs = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevKpis = previousState?.kpis || {};
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  const prevSharePrice = sanitize(prevKpis.market_valuation?.share_price, 1.0);

  // 1. RESOLVER INDICADORES (Prioriza roundRules)
  const roundSpecific = roundRules ? roundRules[currentRound] : {};
  const indicators = { ...baseIndicators, ...roundSpecific };

  // 2. CÁLCULO CUMULATIVO (Geométrico baseado no histórico de todos os rounds passados)
  let cumulativeMPA = 1.0;
  let cumulativeMPB = 1.0;
  let cumulativeInflation = 1.0;
  let cumulativeSalary = 1.0;

  for (let r = 0; r <= currentRound; r++) {
      const rRule = roundRules?.[r] || {};
      cumulativeMPA *= (1 + (rRule.raw_material_a_adjust ?? baseIndicators.raw_material_a_adjust) / 100);
      cumulativeMPB *= (1 + (rRule.raw_material_b_adjust ?? baseIndicators.raw_material_b_adjust) / 100);
      cumulativeInflation *= (1 + (rRule.inflation_rate ?? baseIndicators.inflation_rate) / 100);
      cumulativeSalary *= (1 + (rRule.salary_adjust ?? baseIndicators.salary_adjust) / 100);
  }

  // 3. CAPACIDADE E FÍSICA (v13.2)
  const specs = indicators.machine_specs || DEFAULT_MACRO.machine_specs;
  const mix = indicators.initial_machinery_mix || DEFAULT_MACRO.initial_machinery_mix;
  const physics = indicators.maintenance_physics || DEFAULT_MACRO.maintenance_physics;
  
  const totalCapacity = mix.reduce((acc, m) => acc + specs[m.model].production_capacity, 0);
  const totalOperators = mix.reduce((acc, m) => acc + specs[m.model].operators_required, 0);
  
  const utilization = decisions.production.activityLevel / 100;
  const maintenanceExpense = mix.reduce((acc, m) => {
    const cost = calculateMaintenanceCost(specs[m.model].initial_value, m.age + currentRound, utilization, physics);
    return acc + cost;
  }, 0);

  // 4. LOGICA DE RECEITA (v13.5)
  const regionArray = Object.values(decisions.regions);
  const avgPrice = regionArray.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0) / Math.max(regionArray.length, 1);
  const totalMarketing = regionArray.reduce((acc: number, curr: any) => acc + (curr.marketing || 0), 0);
  
  const priceElasticity = Math.max(0.3, 1 - ((avgPrice - 370) / 370));
  const marketingBoost = Math.min(1.8, 1 + (totalMarketing / (Math.max(1, regionArray.length) * 10)));
  const demandFactor = (indicators.ice / 100 + 1) * (1 + (indicators.demand_variation / 100));
  
  const unitsSold = Math.min(
    totalCapacity * (1 + decisions.production.extraProductionPercent/100),
    Math.floor(10000 * priceElasticity * marketingBoost * demandFactor)
  );
  const revenue = unitsSold * avgPrice;
  
  // 5. CUSTOS ACUMULADOS
  const mpACost = (indicators.prices.mp_a) * cumulativeMPA;
  const mpBCost = (indicators.prices.mp_b) * cumulativeMPB;
  const currentSalary = (indicators.hr_base.salary) * cumulativeSalary;
  
  const cpv = unitsSold * (mpACost * 0.4 + mpBCost * 0.3) + (totalOperators * currentSalary) + maintenanceExpense;
  const opex = 917582 * cumulativeInflation;
  
  const netProfit = revenue - cpv - opex - (indicators.tax_rate_ir / 100 * revenue * 0.1); 
  const finalEquity = prevEquity + netProfit;
  
  // 6. SOLVÊNCIA
  const ac = 3290340 + netProfit; 
  const pc = 4121493 + (decisions.machinery.buy.alfa * specs.alfa.initial_value); 
  const lc = ac / Math.max(pc, 1);
  const endividamento = (pc / Math.max(finalEquity, 1)) * 100;
  const bankDetails = calculateBankRating({ lc, endividamento, margem: (netProfit/revenue)*100, equity: finalEquity }, pc > ac);

  return {
    revenue, netProfit, debtRatio: endividamento, creditRating: bankDetails.rating,
    health: { rating: bankDetails.rating, insolvency_risk: (lc < 0.5 ? 80 : 10), is_bankrupt: lc < 0.1, liquidity_ratio: lc },
    kpis: {
      market_share: Math.min(100, (unitsSold / 100000) * 100),
      rating: bankDetails.rating,
      insolvency_status: lc < 0.5 ? 'RJ' : 'SAUDAVEL',
      equity: finalEquity
    },
    statements: {
      dre: { revenue, cpv, opex, net_profit: netProfit },
      balance_sheet: { assets: { total: ac + 5886600 }, equity: { total: finalEquity }, liabilities: { total_debt: pc } }
    }
  };
};
