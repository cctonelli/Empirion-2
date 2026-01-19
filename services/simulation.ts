
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * Modelo de Kanitz – ÍNDICE DE SOLVÊNCIA
 * FI = 0,05*X1 + 1,65*X2 + 3,55*X3 - 1,06*X4 - 0,33*X5
 */
export const calculateKanitzFactor = (data: {
  netProfit: number,
  equity: number,
  currentAssets: number,
  longTermAssets: number,
  currentLiabilities: number,
  longTermLiabilities: number,
  inventory: number
}) => {
  const exigivelTotal = data.currentLiabilities + data.longTermLiabilities;
  const pl = Math.max(data.equity, 1);
  const pc = Math.max(data.currentLiabilities, 1);

  const x1 = data.netProfit / pl; // Rentabilidade do PL
  const x2 = (data.currentAssets + data.longTermAssets) / Math.max(exigivelTotal, 1); // Liquidez Geral
  const x3 = (data.currentAssets - data.inventory) / pc; // Liquidez Seca
  const x4 = data.currentAssets / pc; // Liquidez Corrente
  const x5 = exigivelTotal / pl; // Grau de Endividamento

  const fi = (0.05 * x1) + (1.65 * x2) + (3.55 * x3) - (1.06 * x4) - (0.33 * x5);
  
  return {
    fi,
    x1, x2, x3, x4, x5,
    status: fi > 0 ? 'SAUDAVEL' : fi > -3 ? 'ALERTA' : 'RJ' as InsolvencyStatus
  };
};

export const calculateBankRating = (fi: number, netProfit: number) => {
  let rating: CreditRating = 'AAA';
  
  if (fi > 4) rating = 'AAA';
  else if (fi > 2) rating = 'AA';
  else if (fi > 0) rating = 'A';
  else if (fi > -1.5) rating = 'B';
  else if (fi > -3) rating = 'C';
  else rating = 'D';

  // Penalidade por prejuízo severo
  if (netProfit < 0 && (rating === 'AAA' || rating === 'AA')) rating = 'A';

  return rating;
};

/**
 * CORE ORACLE ENGINE v14.2 GOLD - KANITZ INSOLVENCY BUILD
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
  
  const roundSpecific = roundRules ? roundRules[currentRound] : {};
  const indicators = { ...baseIndicators, ...roundSpecific };

  // 1. CAPEX & PREÇOS (v14.1 logic maintained)
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

  const totalCapex = (decisions.machinery.buy.alfa * adjPrices.alfa) + 
                     (decisions.machinery.buy.beta * adjPrices.beta) + 
                     (decisions.machinery.buy.gama * adjPrices.gama);
  
  const downPayment = totalCapex * 0.4;
  const bdiFinanced = totalCapex * 0.6;

  // 2. PRODUÇÃO & VENDAS (v14.1 dynamic share logic)
  const specs = indicators.machine_specs || DEFAULT_MACRO.machine_specs;
  const mix = indicators.initial_machinery_mix || DEFAULT_MACRO.initial_machinery_mix;
  
  const totalCapacity = mix.reduce((acc, m) => acc + specs[m.model].production_capacity, 0) +
                        (decisions.machinery.buy.alfa * specs.alfa.production_capacity) +
                        (decisions.machinery.buy.beta * specs.beta.production_capacity) +
                        (decisions.machinery.buy.gama * specs.gama.production_capacity);

  const regions = decisions.regions || {};
  const regionIds = Object.keys(regions);
  const numRegions = Math.max(regionIds.length, 1);
  const baseDemandPerRegion = 2500 * (indicators.demand_multiplier || 1.0);
  const totalMarketDemand = baseDemandPerRegion * numRegions;
  
  let totalUnitsSold = 0;
  let totalRevenue = 0;

  regionIds.forEach(id => {
    const reg = regions[Number(id)];
    const price = reg.price || 370;
    const marketing = reg.marketing || 0;
    const priceEffect = 1 - (price - 370) / 370;
    const marketingEffect = 1 + (marketing * 0.022);
    const regionalSales = Math.floor(baseDemandPerRegion * priceEffect * marketingEffect);
    totalUnitsSold += Math.max(0, regionalSales);
    totalRevenue += Math.max(0, regionalSales) * price;
  });

  const actualUnitsSold = Math.min(totalUnitsSold, totalCapacity);
  const revenue = totalUnitsSold > 0 ? (actualUnitsSold / totalUnitsSold) * totalRevenue : 0;
  const marketShare = (actualUnitsSold / totalMarketDemand) * 100;

  // 3. FINANCEIRO & DRE
  const mpCost = actualUnitsSold * (indicators.prices.mp_a * 3 + indicators.prices.mp_b * 2);
  const modCost = (actualUnitsSold / Math.max(totalCapacity, 1)) * (decisions.hr.salary * 500);
  const cpv = mpCost + modCost + 32640; // 32640 = prod fixed costs
  
  const interestRate = (indicators.interest_rate_tr || 3) / 100;
  const debtInterest = (sanitize(bs.liabilities?.total_debt, 4121493) * interestRate);
  const opex = (actualUnitsSold * 22) + 400000 + 21760;
  const netProfit = revenue - cpv - opex - debtInterest;
  const finalEquity = prevEquity + netProfit;

  // 4. BALANÇO PROJETADO PARA KANITZ
  const ac = 3290340 + netProfit - downPayment;
  const inventory = (sanitize(bs.assets?.current?.inventory_mpa, 0) + sanitize(bs.assets?.current?.inventory_mpb, 0)) * 0.8; // Simplificação de quebra de estoque
  const realizavelLP = sanitize(bs.assets?.noncurrent?.longterm?.sale, 0);
  const pc = sanitize(bs.liabilities?.current, 2621493) + (bdiFinanced / 4);
  const pnc = sanitize(bs.liabilities?.long_term, 1500000) + (bdiFinanced * 0.75);

  // 5. CÁLCULO DO FATOR DE KANITZ
  const kanitz = calculateKanitzFactor({
    netProfit,
    equity: finalEquity,
    currentAssets: ac,
    longTermAssets: realizavelLP,
    currentLiabilities: pc,
    longTermLiabilities: pnc,
    inventory
  });

  const rating = calculateBankRating(kanitz.fi, netProfit);

  return {
    revenue, netProfit, debtRatio: ( (pc+pnc) / Math.max(finalEquity, 1) ) * 100, creditRating: rating,
    marketShare,
    health: { 
      rating, 
      insolvency_risk: kanitz.fi < -3 ? 90 : kanitz.fi < 0 ? 50 : 10,
      is_bankrupt: kanitz.fi < -4,
      liquidity_ratio: ac / pc,
      kanitz_fi: kanitz.fi 
    },
    kpis: {
      market_share: marketShare,
      rating,
      insolvency_status: kanitz.status,
      equity: finalEquity,
      kanitz_factor: kanitz.fi,
      scissors_effect: { tsf: (ac/pc) - 1.0, is_critical: (ac/pc) < 1.0 }
    },
    statements: {
      dre: { revenue, cpv, opex, net_profit: netProfit },
      balance_sheet: { 
        assets: { total: ac + 5886600 + totalCapex }, 
        equity: { total: finalEquity }, 
        liabilities: { total_debt: pc + pnc } 
      }
    }
  };
};
