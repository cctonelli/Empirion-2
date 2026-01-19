
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
 * CORE ORACLE ENGINE v14.1 GOLD - DYNAMIC MARKET SHARE BUILD
 * Calcula vendas e market share proporcionalmente ao número de regiões ativas.
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
  const prevEquity = sanitize(bs.equity?.total, 5055447);
  
  // 1. RESOLVER INDICADORES (Prioriza roundRules)
  const roundSpecific = roundRules ? roundRules[currentRound] : {};
  const indicators = { ...baseIndicators, ...roundSpecific };

  // 2. CÁLCULO CUMULATIVO DE PREÇOS DE MÁQUINAS
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

  // 4. CAPACIDADE PRODUTIVA
  const specs = indicators.machine_specs || DEFAULT_MACRO.machine_specs;
  const mix = indicators.initial_machinery_mix || DEFAULT_MACRO.initial_machinery_mix;
  
  const totalCapacity = mix.reduce((acc, m) => acc + specs[m.model].production_capacity, 0) +
                        (decisions.machinery.buy.alfa * specs.alfa.production_capacity) +
                        (decisions.machinery.buy.beta * specs.beta.production_capacity) +
                        (decisions.machinery.buy.gama * specs.gama.production_capacity);

  // 5. LÓGICA DE VENDAS REGIONAIS DINÂMICAS
  const regions = decisions.regions || {};
  const regionIds = Object.keys(regions);
  const numRegions = Math.max(regionIds.length, 1);
  
  // Demanda Base por Região: 2.500 unidades
  const baseDemandPerRegion = 2500 * (indicators.demand_multiplier || 1.0);
  const totalMarketDemand = baseDemandPerRegion * numRegions;
  
  let totalUnitsSold = 0;
  let totalRevenue = 0;

  regionIds.forEach(id => {
    const reg = regions[Number(id)];
    const price = reg.price || 370;
    const marketing = reg.marketing || 0;
    
    // Elasticidade: Preço ideal $370. Marketing (0-9) adiciona até 20% de bônus de tração.
    const priceEffect = 1 - (price - 370) / 370;
    const marketingEffect = 1 + (marketing * 0.022); // Max 1.2x
    
    const regionalSales = Math.floor(baseDemandPerRegion * priceEffect * marketingEffect);
    totalUnitsSold += Math.max(0, regionalSales);
    totalRevenue += Math.max(0, regionalSales) * price;
  });

  // Limita vendas à capacidade produtiva
  const actualUnitsSold = Math.min(totalUnitsSold, totalCapacity);
  // Ajusta receita proporcionalmente se houver quebra de estoque (falta de capacidade)
  const revenue = totalUnitsSold > 0 ? (actualUnitsSold / totalUnitsSold) * totalRevenue : 0;
  
  const marketShare = (actualUnitsSold / totalMarketDemand) * 100;

  // 6. CPV DETALHADO
  const baseDepreciation = 54400;
  const prodFixedCosts = baseDepreciation * 0.60;
  const mpCost = actualUnitsSold * (indicators.prices.mp_a * 3 + indicators.prices.mp_b * 2);
  const modCost = (actualUnitsSold / Math.max(totalCapacity, 1)) * (decisions.hr.salary * 500);
  const supplierCharges = decisions.production.paymentType > 0 ? mpCost * 0.03 : 0;
  
  const cpv = mpCost + modCost + prodFixedCosts + supplierCharges;
  
  // 7. RESULTADO FINANCEIRO
  const interestRate = (indicators.interest_rate_tr || 3) / 100;
  const debtInterest = (sanitize(bs.liabilities?.total_debt, 4121493) * interestRate);
  const finRevenue = (sanitize(bs.assets?.current?.cash, 0) * 0.005);
  
  // 8. RESULTADO LÍQUIDO
  const opex = (actualUnitsSold * 22) + 400000 + (baseDepreciation * 0.40);
  const ebitda = revenue - cpv - opex;
  const netProfit = ebitda + finRevenue - debtInterest;
  const finalEquity = prevEquity + netProfit;
  
  // 9. SOLVÊNCIA & RATING
  const ac = 3290340 + netProfit - downPayment; 
  const bdiInstallment = bdiFinanced / 4; 
  const pc = sanitize(bs.liabilities?.current, 2621493) + bdiInstallment; 
  
  const lc = ac / Math.max(pc, 1);
  const endividamento = (pc / Math.max(finalEquity, 1)) * 100;
  const bankDetails = calculateBankRating({ lc, endividamento, margem: (netProfit/Math.max(revenue, 1))*100, equity: finalEquity }, pc > ac);

  return {
    revenue, netProfit, debtRatio: endividamento, creditRating: bankDetails.rating,
    marketShare,
    health: { 
      rating: bankDetails.rating, 
      insolvency_risk: (lc < 0.5 ? 80 : 10), 
      is_bankrupt: lc < 0.1, 
      liquidity_ratio: lc 
    },
    kpis: {
      market_share: marketShare,
      rating: bankDetails.rating,
      insolvency_status: lc < 0.5 ? 'RJ' : 'SAUDAVEL',
      equity: finalEquity,
      scissors_effect: { tsf: lc - 1.0, is_critical: lc < 1.0 }
    },
    statements: {
      dre: { 
        revenue, cpv, opex, 
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
