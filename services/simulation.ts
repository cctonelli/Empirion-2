import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * CÁLCULO DE CUSTO DE MANUTENÇÃO v13.2
 * Formula: Valor base * (1 + alpha * idade ^ beta) * (1 + gamma * utilizacao)
 */
export const calculateMaintenanceCost = (
  baseValue: number, 
  age: number, 
  utilization: number, 
  physics: { alpha: number, beta: number, gamma: number }
): number => {
  const ageFactor = 1 + physics.alpha * Math.pow(age, physics.beta);
  const utilizationFactor = 1 + physics.gamma * utilization;
  return baseValue * ageFactor * utilizationFactor * 0.01; // Estimativa de 1% do valor base escalonado
};

export const calculateBankRating = (data: { lc: number, endividamento: number, margem: number, equity: number }, hasScissorsEffect: boolean, tr: number) => {
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

export const calculateMarketValuation = (equity: number, profit: number, rating: CreditRating, prevPrice: number) => {
  const multiplier = rating === 'AAA' ? 1.5 : rating === 'AA' ? 1.3 : rating === 'A' ? 1.1 : rating === 'B' ? 0.9 : 0.7;
  const valuation = (equity + Math.max(0, profit) * 12) * multiplier;
  const sharePrice = Math.max(0.01, valuation / DEFAULT_TOTAL_SHARES);
  return { 
    share_price: sharePrice, 
    total_shares: DEFAULT_TOTAL_SHARES, 
    market_cap: valuation, 
    tsr: ((sharePrice - prevPrice) / Math.max(0.001, prevPrice)) * 100 
  };
};

export const checkInsolvencyStatus = (data: any, history?: any) => {
  const isHealthy = data.lc > 1.0 && data.endividamento < 150;
  let status: InsolvencyStatus = 'SAUDAVEL';
  
  if (!isHealthy) status = 'ALERTA';
  if (data.endividamento > 300 || data.lc < 0.2) status = 'RJ';
  if (data.endividamento > 500 || data.lc < 0.05) status = 'BANKRUPT';
  
  return { 
    status, 
    canOperate: status !== 'BANKRUPT',
    insolvency_risk: status === 'SAUDAVEL' ? 5 : status === 'ALERTA' ? 25 : status === 'RJ' ? 60 : 100
  };
};

/**
 * CORE ORACLE ENGINE v13.2 GOLD - ROUND-AWARE & CUMULATIVE
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  baseIndicators: MacroIndicators = DEFAULT_MACRO,
  previousState?: any,
  roundHistory: any[] = [],
  regionType: RegionType = 'mixed',
  currentRound: number = 1,
  roundRules?: Record<number, Partial<MacroIndicators>>
): ProjectionResult => {
  const bs = previousState?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  const prevKpis = previousState?.kpis || {};
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  const prevSharePrice = sanitize(prevKpis.market_valuation?.share_price, 1.0);

  // 1. RESOLVER INDICADORES DO ROUND (Prioriza roundRules)
  const roundSpecific = roundRules ? roundRules[currentRound] : {};
  const indicators = { ...baseIndicators, ...roundSpecific };

  // 2. CÁLCULO CUMULATIVO DE PREÇOS (Geométrico)
  let cumulativeInflation = 1.0;
  let cumulativeMPA = 1.0;
  let cumulativeSalary = 1.0;

  for (let r = 1; r <= currentRound; r++) {
      const rRule = roundRules?.[r] || {};
      cumulativeInflation *= (1 + (rRule.inflation_rate ?? indicators.inflation_rate) / 100);
      cumulativeMPA *= (1 + (rRule.raw_material_a_adjust ?? indicators.raw_material_a_adjust) / 100);
      cumulativeSalary *= (1 + (rRule.salary_adjust ?? indicators.salary_adjust) / 100);
  }

  // 3. CAPACIDADE PRODUTIVA E MANUTENÇÃO (v13.2)
  const specs = indicators.machine_specs || DEFAULT_MACRO.machine_specs;
  const mix = indicators.initial_machinery_mix || DEFAULT_MACRO.initial_machinery_mix;
  const physics = indicators.maintenance_physics || DEFAULT_MACRO.maintenance_physics;
  
  // Mix atualizado (considerando compras passadas - simplificado para o MVP)
  // No motor real, iteraríamos sobre o array individual de máquinas do time
  const totalCapacity = mix.reduce((acc, m) => acc + specs[m.model].production_capacity, 0);
  const totalOperators = mix.reduce((acc, m) => acc + specs[m.model].operators_required, 0);
  
  const utilization = decisions.production.activityLevel / 100;
  const maintenanceExpense = mix.reduce((acc, m) => {
    const cost = calculateMaintenanceCost(specs[m.model].initial_value, m.age + currentRound, utilization, physics);
    return acc + cost;
  }, 0);

  // 4. LOGICA DE RECEITA E DEMANDA
  const regionArray = Object.values(decisions.regions);
  const avgPrice = regionArray.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0) / Math.max(regionArray.length, 1);
  const totalMarketing = regionArray.reduce((acc: number, curr: any) => acc + (curr.marketing || 0), 0);
  
  const priceElasticity = Math.max(0.3, 1 - ((avgPrice - 370) / 370));
  const marketingBoost = Math.min(1.8, 1 + (totalMarketing / (Math.max(1, regionArray.length) * 10)));
  const demandFactor = (indicators.ice / 100 + 1) * (1 + (indicators.demand_variation / 100));
  
  const unitsSold = Math.min(
    totalCapacity * (1 + decisions.production.extraProductionPercent/100),
    Math.floor(10000 * priceElasticity * marketingBoost * demandFactor * (indicators.labor_productivity || 1.0))
  );
  const revenue = unitsSold * avgPrice;
  
  // 5. CUSTOS ACUMULADOS
  const mpACost = (indicators.prices.mp_a) * cumulativeMPA;
  const currentSalary = (indicators.hr_base.salary) * cumulativeSalary;
  
  const cpv = unitsSold * (mpACost * 0.7) + (totalOperators * currentSalary) + maintenanceExpense;
  const opex = 917582 * cumulativeInflation;
  
  // 6. TRABALHAR ATIVOS (MÁQUINAS)
  const canSell = indicators.allow_machine_sale;
  const saleRevenue = canSell ? (decisions.machinery.sell.alfa * specs.alfa.initial_value * (1 - indicators.machine_sale_discount/100)) : 0;
  const machineBuyCost = (decisions.machinery.buy.alfa * specs.alfa.initial_value);

  const netProfit = revenue - cpv - opex - (indicators.tax_rate_ir / 100 * revenue * 0.1); 
  const finalEquity = prevEquity + netProfit;
  
  // 7. EFEITO TESOURA E RATING
  const ac = 3290340 + netProfit; 
  const pc = 4121493 + machineBuyCost - saleRevenue; 
  const lc = ac / Math.max(pc, 1);
  const endividamento = (pc / Math.max(finalEquity, 1)) * 100;
  const margem = (netProfit / Math.max(revenue, 1)) * 100;

  const bankDetails = calculateBankRating({ lc, endividamento, margem, equity: finalEquity }, pc > ac, indicators.interest_rate_tr);
  const insolvency = checkInsolvencyStatus({ pl: finalEquity, ac, pc, endividamento, lc });
  const valuation = calculateMarketValuation(finalEquity, netProfit, bankDetails.rating, prevSharePrice);

  return {
    revenue, netProfit, debtRatio: endividamento, creditRating: bankDetails.rating,
    health: { rating: bankDetails.rating, insolvency_risk: insolvency.insolvency_risk, is_bankrupt: !insolvency.canOperate, liquidity_ratio: lc },
    kpis: {
      market_share: Math.min(100, (unitsSold / 100000) * 100),
      rating: bankDetails.rating,
      insolvency_status: insolvency.status,
      market_valuation: valuation,
      equity: finalEquity,
      banking: bankDetails,
      scissors_effect: { ncg: 1000000, ccl: ac-pc, tesouraria: (ac-pc)-1000000, is_critical: pc > ac, tsf: -10 }
    },
    statements: {
      dre: { revenue, cpv, opex, net_profit: netProfit },
      balance_sheet: { assets: { total: ac + 5886600 }, equity: { total: finalEquity }, liabilities: { total_debt: pc } }
    }
  };
};
