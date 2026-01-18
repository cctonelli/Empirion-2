
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
 * CORE ORACLE ENGINE v13.5 GOLD - CUMULATIVE GEOMETRIC COSTS & BDI LOGIC
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
  
  // 1. RESOLVER INDICADORES (Prioriza roundRules)
  const roundSpecific = roundRules ? roundRules[currentRound] : {};
  const indicators = { ...baseIndicators, ...roundSpecific };

  // 2. CÁLCULO CUMULATIVO (Reajustes de máquinas específicos)
  const getAdjustedPrice = (model: MachineModel, base: number) => {
    let adj = 1.0;
    const rate = indicators[`machine_${model}_price_adjust`] || 0;
    for (let i = 0; i < currentRound; i++) adj *= (1 + rate / 100);
    return base * adj;
  };

  const adjPrices = {
    alfa: getAdjustedPrice('alfa', indicators.machinery_values.alfa),
    beta: getAdjustedPrice('beta', indicators.machinery_values.beta),
    gama: getAdjustedPrice('gama', indicators.machinery_values.gama)
  };

  // 3. CAPEX & BDI (40/60)
  const totalCapex = (decisions.machinery.buy.alfa * adjPrices.alfa) + 
                     (decisions.machinery.buy.beta * adjPrices.beta) + 
                     (decisions.machinery.buy.gama * adjPrices.gama);
  
  const downPayment = totalCapex * 0.4;
  const bdiFinanced = totalCapex * 0.6;

  // 4. CAPACIDADE E FÍSICA (Máquinas compradas entram no ato)
  const specs = indicators.machine_specs || DEFAULT_MACRO.machine_specs;
  const mix = indicators.initial_machinery_mix || DEFAULT_MACRO.initial_machinery_mix;
  const physics = indicators.maintenance_physics || DEFAULT_MACRO.maintenance_physics;
  
  // Capacidade total inclui novas compras
  const totalCapacity = mix.reduce((acc, m) => acc + specs[m.model].production_capacity, 0) +
                        (decisions.machinery.buy.alfa * specs.alfa.production_capacity) +
                        (decisions.machinery.buy.beta * specs.beta.production_capacity) +
                        (decisions.machinery.buy.gama * specs.gama.production_capacity);

  // Depreciação NÃO inclui as novas compras deste ciclo (começa ciclo seguinte)
  const currentDepreciation = mix.reduce((acc, m) => {
    const dep = specs[m.model].initial_value * specs[m.model].depreciation_rate;
    return acc + dep;
  }, 0);

  // 5. LOGICA DE RECEITA & CUSTOS (v13.5)
  const regionArray = Object.values(decisions.regions);
  const avgPrice = regionArray.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0) / Math.max(regionArray.length, 1);
  const unitsSold = Math.min(totalCapacity, Math.floor(10000 * (1 - (avgPrice - 370)/370)));
  const revenue = unitsSold * avgPrice;
  
  const mpCost = unitsSold * (indicators.prices.mp_a * 0.4 + indicators.prices.mp_b * 0.3);
  const cpv = mpCost + currentDepreciation + 150000; // + manutenção base
  
  const interestRate = (indicators.interest_rate_tr || 3) / 100;
  const debtInterest = (sanitize(bs.liabilities?.total_debt, 4121493) * interestRate);
  
  const netProfit = revenue - cpv - 400000 - debtInterest; // OPEX simplificado
  const finalEquity = prevEquity + netProfit;
  
  // 6. SOLVÊNCIA & MUTAÇÃO DE PASSIVOS
  const ac = 3290340 + netProfit - downPayment; 
  // Mutação: Próxima parcela do BDI ou empréstimo migra do Longo para Curto Prazo
  const bdiInstallment = bdiFinanced / 4; 
  const pc = sanitize(bs.liabilities?.current, 2621493) + bdiInstallment; 
  
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
      dre: { revenue, cpv, opex: 400000, net_profit: netProfit },
      balance_sheet: { assets: { total: ac + 5886600 + totalCapex }, equity: { total: finalEquity }, liabilities: { total_debt: pc + bdiFinanced } }
    }
  };
};
