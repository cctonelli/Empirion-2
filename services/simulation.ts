
import { DecisionData, Branch, EcosystemConfig, MarketIndicators } from '../types';

/**
 * Empirion Advanced Economic Engine (v5.0 GOLD)
 * ScenarioType Awareness: Simulated vs Real with AI Grounding
 */

const BRANCH_BASE_COSTS = {
  industrial: 180,
  agribusiness: 120,
  services: 90,
  commercial: 70
};

const BRANCH_ELASTICITY = {
  industrial: -1.8,
  agribusiness: -1.2,
  services: -1.5,
  commercial: -2.0
};

export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig = { 
    scenarioType: 'simulated',
    inflationRate: 0.04, 
    demandMultiplier: 1.0, 
    interestRate: 0.12, 
    marketVolatility: 0, 
    esgPriority: 0.5 
  },
  indicators?: MarketIndicators
) => {
  // 0. SCENARIO MERGE LOGIC
  const isReal = ecoConfig.scenarioType === 'real';
  const weights = ecoConfig.realDataWeights || { inflation: 1, demand: 1, currency: 1 };

  // 1. DYNAMIC INFLATION & INTEREST
  const event = ecoConfig.activeEvent;
  const eventInfl = event?.modifiers.inflation || 0;
  const eventDem = event?.modifiers.demand || 0;
  const eventInt = event?.modifiers.interest || 0;
  const eventProd = event?.modifiers.productivity || 0;

  let inflation = ecoConfig.inflationRate;
  if (indicators?.inflation_rate) {
    const rawInfl = indicators.inflation_rate / 100;
    // Merge real data with tutor base using weights
    inflation = isReal 
      ? (rawInfl * weights.inflation + ecoConfig.inflationRate * (1 - weights.inflation))
      : ecoConfig.inflationRate;
  }
  inflation += eventInfl;

  const interest = (indicators?.interest_rate_tr ? (indicators.interest_rate_tr / 100) : ecoConfig.interestRate) + eventInt;
  
  const baseCost = BRANCH_BASE_COSTS[branch] || 100;
  const inflatedBaseCost = baseCost * (1 + inflation);

  const productionVolume = (decisions.production.activityLevel / 100) * 10000 + decisions.production.extraProduction;
  
  const learningRate = 0.92; 
  const experienceExponent = Math.log2(learningRate);
  const learningMultiplier = Math.pow((productionVolume + 1000) / 1000, experienceExponent);
  
  const unitVariableCost = inflatedBaseCost * learningMultiplier * (1 - eventProd);

  // 2. COGS (Direct Materials)
  const rawAPrice = (indicators?.raw_a_price || 20.2) * (1 + inflation);
  const rawBPrice = (indicators?.raw_b_price || 40.4) * (1 + inflation);
  const mpaCost = decisions.production.purchaseMPA * rawAPrice;
  const mpbCost = decisions.production.purchaseMPB * rawBPrice;
  const totalCogs = (productionVolume * unitVariableCost) + mpaCost + mpbCost;

  // 3. DEMAND ENGINE
  const activeRegions = Object.values(decisions.regions);
  const regionCount = activeRegions.length || 1;
  const avgPrice = activeRegions.reduce((acc, r) => acc + r.price, 0) / regionCount;
  
  const basePotential = indicators?.demand_regions 
    ? indicators.demand_regions.reduce((a, b) => a + b, 0) / indicators.demand_regions.length 
    : 12000;
    
  const esgImpact = (ecoConfig.esgPriority || 0.5) * 0.1; 
  
  // Real demand weighting
  const demandMult = isReal 
    ? (ecoConfig.demandMultiplier * (1 - weights.demand) + (indicators?.risk_premium ? 1 - indicators.risk_premium : 1) * weights.demand)
    : ecoConfig.demandMultiplier;

  const marketPotential = basePotential * (demandMult + eventDem + esgImpact);
  
  const totalMarketing = activeRegions.reduce((acc, r) => acc + r.marketing, 0);
  const marketingIndex = Math.log10(totalMarketing + 2) * 0.45 + 0.5;

  const referencePrice = branch === 'industrial' ? 340 : 200;
  const priceIndex = avgPrice / referencePrice;
  const elasticity = BRANCH_ELASTICITY[branch] || -1.5;
  
  const potentialVolume = marketPotential * Math.pow(priceIndex, elasticity) * marketingIndex;
  const salesVolume = Math.min(productionVolume, potentialVolume);
  
  const revenue = salesVolume * avgPrice;

  // 4. OPEX & FINANCIALS
  const fixedStructuralCost = 50000 * (1 + inflation);
  const avgSalary = (indicators?.average_salary || 1300) * (1 + (decisions.hr.participationPercent / 100));
  const salaryCost = (decisions.hr.hired * (avgSalary * 1.5)) + (decisions.hr.salary * 100);
  const trainingInvestment = (decisions.hr.trainingPercent / 100) * salaryCost;
  const depreciation = (2000000) * 0.025; 
  const totalOpex = fixedStructuralCost + (totalMarketing * (indicators?.marketing_cost_unit || 10200)) + trainingInvestment + depreciation;

  const grossProfit = revenue - totalCogs;
  const ebitda = grossProfit - (totalOpex - depreciation);
  const ebit = ebitda - depreciation;
  
  const netDebt = (decisions.finance.loanRequest) - (decisions.finance.application);
  const finalInterestRate = netDebt > 0 ? (interest / 4) : 0.012; 
  const financialResult = -netDebt * finalInterestRate;

  const preTaxProfit = ebit + financialResult;
  const isBankrupt = decisions.inBankruptcy || false;
  const taxRate = isBankrupt ? 0.05 : (preTaxProfit > 200000 ? 0.35 : (preTaxProfit > 0 ? 0.20 : 0));
  const taxes = preTaxProfit > 0 ? preTaxProfit * taxRate : 0;
  const netProfit = preTaxProfit - taxes;

  return {
    revenue,
    unitCost: unitVariableCost,
    totalVariableCosts: totalCogs,
    opex: totalOpex,
    ebitda,
    ebit,
    netProfit,
    salesVolume,
    depreciation,
    financialResult,
    breakEven: totalOpex / (avgPrice - unitVariableCost || 1),
    margin: revenue > 0 ? (netProfit / revenue) : 0,
    isBankrupt
  };
};
