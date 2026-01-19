
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
 * CORE ORACLE ENGINE v13.6 GOLD - INDUSTRIAL FIDELITY BUILD
 * Implements PDF logic: CPV = MP + MOD + Fixed + Charges
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

  // 2. CÁLCULO CUMULATIVO DE PREÇOS
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

  // 4. CAPACIDADE E FÍSICA
  const specs = indicators.machine_specs || DEFAULT_MACRO.machine_specs;
  const mix = indicators.initial_machinery_mix || DEFAULT_MACRO.initial_machinery_mix;
  const physics = indicators.maintenance_physics || DEFAULT_MACRO.maintenance_physics;
  
  const totalCapacity = mix.reduce((acc, m) => acc + specs[m.model].production_capacity, 0) +
                        (decisions.machinery.buy.alfa * specs.alfa.production_capacity) +
                        (decisions.machinery.buy.beta * specs.beta.production_capacity) +
                        (decisions.machinery.buy.gama * specs.gama.production_capacity);

  // Depreciação de Ativos (Página 3 PDF: 60% Produção, 20% Adm, 20% Vendas)
  // Valor fixo base da arena: $54.400,00 por round
  const baseDepreciation = 54400;
  const prodFixedCosts = baseDepreciation * 0.60; // $32.640,00 para CPV
  const admOpexFix = baseDepreciation * 0.20; 
  const salesOpexFix = baseDepreciation * 0.20;

  // 5. LOGICA DE RECEITA (Elasticidade v13.6)
  const regionArray = Object.values(decisions.regions);
  const avgPrice = regionArray.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0) / Math.max(regionArray.length, 1);
  const demandBasis = 10000 * (indicators.demand_multiplier || 1.0);
  const unitsSold = Math.min(totalCapacity, Math.floor(demandBasis * (1 - (avgPrice - 370)/370)));
  const revenue = unitsSold * avgPrice;
  
  // 6. CPV DETALHADO (Página 2 PDF)
  // WAC A + WAC B + MOD + FIXO + ENCARGOS
  const mpCost = unitsSold * (indicators.prices.mp_a * 3 + indicators.prices.mp_b * 2); // Multiplicadores da Ficha Técnica (PDF p.1)
  const modCost = (unitsSold / totalCapacity) * (decisions.hr.salary * 500); // Mão de obra simplificada
  const supplierCharges = decisions.production.paymentType > 0 ? mpCost * 0.03 : 0; // Encargos financeiros fornecedores
  
  const cpv = mpCost + modCost + prodFixedCosts + supplierCharges;
  
  // 7. RESULTADO FINANCEIRO (SEPARADO)
  const interestRate = (indicators.interest_rate_tr || 3) / 100;
  const debtInterest = (sanitize(bs.liabilities?.total_debt, 4121493) * interestRate);
  const finRevenue = (sanitize(bs.assets?.current?.cash, 0) * 0.005); // 0.5% rendimento caixa
  
  // 8. RESULTADO LÍQUIDO
  const opex = (unitsSold * 22) + 400000 + admOpexFix + salesOpexFix; // Distribuição $22/unidade (PDF p.1)
  const ebitda = revenue - cpv - opex;
  const netProfit = ebitda + finRevenue - debtInterest;
  const finalEquity = prevEquity + netProfit;
  
  // 9. SOLVÊNCIA
  const ac = 3290340 + netProfit - downPayment; 
  const bdiInstallment = bdiFinanced / 4; 
  const pc = sanitize(bs.liabilities?.current, 2621493) + bdiInstallment; 
  
  const lc = ac / Math.max(pc, 1);
  const endividamento = (pc / Math.max(finalEquity, 1)) * 100;
  const bankDetails = calculateBankRating({ lc, endividamento, margem: (netProfit/revenue)*100, equity: finalEquity }, pc > ac);

  return {
    revenue, netProfit, debtRatio: endividamento, creditRating: bankDetails.rating,
    health: { 
      rating: bankDetails.rating, 
      insolvency_risk: (lc < 0.5 ? 80 : 10), 
      is_bankrupt: lc < 0.1, 
      liquidity_ratio: lc 
    },
    kpis: {
      market_share: Math.min(100, (unitsSold / (demandBasis * 10)) * 100),
      rating: bankDetails.rating,
      insolvency_status: lc < 0.5 ? 'RJ' : 'SAUDAVEL',
      equity: finalEquity,
      scissors_effect: { tsf: lc - 1.0, is_critical: lc < 1.0 }
    },
    statements: {
      dre: { 
        revenue, 
        cpv, 
        opex, 
        financial_revenue: finRevenue,
        financial_expense: debtInterest,
        net_profit: netProfit 
      },
      balance_sheet: { 
        assets: { total: ac + 5886600 + totalCapex }, 
        equity: { total: finalEquity }, 
        liabilities: { total_debt: pc + bdiFinanced } 
      }
    }
  };
};
