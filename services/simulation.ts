
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * Modelo de Kanitz – FATOR DE INSOLVÊNCIA (FI)
 * "Termômetro de Insolvência"
 * FI = (0.05 * X1) + (1.65 * X2) + (3.55 * X3) - (1.06 * X4) - (0.33 * X5)
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
  const exigivelTotal = Math.max(data.currentLiabilities + data.longTermLiabilities, 1);
  const pl = Math.max(data.equity, 1);
  const pc = Math.max(data.currentLiabilities, 1);

  // X1: Rentabilidade do PL
  const x1 = data.netProfit / pl; 
  // X2: Liquidez Geral (AC + RLP) / Exigível Total
  const x2 = (data.currentAssets + data.longTermAssets) / exigivelTotal; 
  // X3: Liquidez Seca (AC - Estoques) / PC
  const x3 = (data.currentAssets - data.inventory) / pc; 
  // X4: Liquidez Corrente (AC / PC)
  const x4 = data.currentAssets / pc; 
  // X5: Grau de Endividamento (Exigível Total / PL)
  const x5 = exigivelTotal / pl; 

  const fi = (0.05 * x1) + (1.65 * x2) + (3.55 * x3) - (1.06 * x4) - (0.33 * x5);
  
  // Mapeamento de Status Kanitz Oficial
  let status: InsolvencyStatus = 'SAUDAVEL';
  if (fi <= -3) status = 'BANKRUPT'; // Insolvente
  else if (fi <= 0) status = 'ALERTA'; // Indefinida
  else status = 'SAUDAVEL'; // Solvente

  return { fi, x1, x2, x3, x4, x5, status };
};

export const calculateBankRating = (fi: number, netProfit: number) => {
  let rating: CreditRating = 'AAA';
  if (fi > 3) rating = 'AAA';
  else if (fi > 1) rating = 'AA';
  else if (fi > 0) rating = 'A';
  else if (fi > -1.5) rating = 'B';
  else if (fi > -3) rating = 'C';
  else rating = 'D';
  if (netProfit < 0 && (rating === 'AAA' || rating === 'AA')) rating = 'A';
  return rating;
};

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

  // 1. CAPEX & PRODUÇÃO
  const getAdjustedPrice = (model: MachineModel, base: number) => {
    let adj = 1.0;
    const rate = indicators[`machine_${model}_price_adjust`] || 0;
    for (let i = 0; i < currentRound; i++) adj *= (1 + rate / 100);
    return base * adj;
  };

  const totalCapex = (decisions.machinery.buy.alfa * getAdjustedPrice('alfa', indicators.machinery_values.alfa)) + 
                     (decisions.machinery.buy.beta * getAdjustedPrice('beta', indicators.machinery_values.beta)) + 
                     (decisions.machinery.buy.gama * getAdjustedPrice('gama', indicators.machinery_values.gama));
  
  const downPayment = totalCapex * 0.4;
  const bdiFinanced = totalCapex * 0.6;

  const specs = indicators.machine_specs || DEFAULT_MACRO.machine_specs;
  const mix = indicators.initial_machinery_mix || DEFAULT_MACRO.initial_machinery_mix;
  const totalCapacity = mix.reduce((acc, m) => acc + specs[m.model].production_capacity, 0) +
                        (decisions.machinery.buy.alfa * specs.alfa.production_capacity);

  // 2. MARKET SHARE & RECIETA (DINÂMICO)
  const regions = decisions.regions || {};
  const regionIds = Object.keys(regions);
  const iceMultiplier = 1 + (indicators.ice / 100);
  
  let totalWeightedShare = 0;
  let totalMarketDemand = 0;
  let totalRevenue = 0;

  regionIds.forEach(id => {
    const reg = regions[Number(id)];
    const baseDemand = 2500 * (indicators.demand_multiplier || 1.0) * iceMultiplier;
    const priceFactor = Math.pow(370 / Math.max(reg.price, 200), 1.5);
    const promoFactor = 1 + (reg.marketing * 0.04); // Marketing mais agressivo no share
    const attractiveness = priceFactor * promoFactor;
    
    const msr = Math.min(100, (attractiveness / 10) * 100); 
    const sales = Math.floor(baseDemand * (msr / 100));
    
    totalRevenue += sales * reg.price;
    totalWeightedShare += (msr * baseDemand);
    totalMarketDemand += baseDemand;
  });

  const averageMarketShare = totalMarketDemand > 0 ? totalWeightedShare / totalMarketDemand : 0;

  // 3. DRE
  const cpv = totalCapacity * 0.65 * (indicators.prices.mp_a + indicators.prices.mp_b);
  const opex = 917582 * (1 + indicators.inflation_rate/100);
  const netProfit = totalRevenue - cpv - opex;
  const finalEquity = prevEquity + netProfit;

  // 4. KANITZ (PRECISÃO AUDITADA 2.19)
  const ac = 3290340 + netProfit - downPayment;
  const pc = sanitize(bs.liabilities?.current, 2621493);
  const pnc = sanitize(bs.liabilities?.long_term, 1500000) + bdiFinanced;
  const inventory = 1466605;

  const kanitz = calculateKanitzFactor({
    netProfit, equity: finalEquity, currentAssets: ac, longTermAssets: 0,
    currentLiabilities: pc, longTermLiabilities: pnc, inventory
  });

  const rating = calculateBankRating(kanitz.fi, netProfit);
  const pl = Math.max(finalEquity, 1);

  return {
    revenue: totalRevenue, netProfit, debtRatio: ((pc+pnc) / pl) * 100, creditRating: rating,
    marketShare: averageMarketShare,
    health: { rating, kanitz_fi: kanitz.fi, status: kanitz.status },
    kpis: {
      market_share: averageMarketShare,
      rating,
      insolvency_status: kanitz.status,
      equity: finalEquity,
      kanitz_factor: kanitz.fi,
      market_valuation: { 
        share_price: finalEquity / DEFAULT_TOTAL_SHARES, 
        total_shares: DEFAULT_TOTAL_SHARES, 
        market_cap: finalEquity, 
        tsr: ((finalEquity / DEFAULT_TOTAL_SHARES - 1.0) / 1.0) * 100 
      }
    },
    statements: {
      dre: { revenue: totalRevenue, cpv, opex, net_profit: netProfit },
      balance_sheet: { assets: { total: ac + 5886600 + totalCapex }, equity: { total: finalEquity } }
    }
  };
};
