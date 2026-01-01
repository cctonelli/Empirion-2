
import { DecisionData, Branch, EcosystemConfig, MarketIndicators } from '../types';

/**
 * Empirion Advanced Economic Engine (v5.2 GOLD)
 * Bernard SIND Fidelity Update: Product Quality (R&D) & Strike Intensity
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

  // 1. QUALITY INDEX (R&D) - SIND Bernard Fidelity
  // Research investment directly impacts demand quality multiplier.
  const rdBench = 50000; // Benchmark R&D per period
  const currentRD = decisions.production.rd_investment || 0;
  const qualityIndex = 1.0 + Math.log10((currentRD + 1000) / 1000) * 0.12;

  // 2. STRIKE & MOTIVATION LOGIC
  const salaryBenchmark = indicators?.average_salary || 1300;
  const salaryGap = decisions.hr.salary / salaryBenchmark;
  
  // Strike probability and intensity based on Bernard logic (salaries, training, layoffs)
  let strikeIntensity = 0;
  if (salaryGap < 0.9) strikeIntensity += (0.9 - salaryGap) * 2;
  if (decisions.hr.fired > (decisions.hr.hired + 10)) strikeIntensity += 0.15;
  
  const motivationScore = Math.max(0, Math.min(100, 
    (salaryGap * 60) + 
    ((decisions.hr.trainingPercent || 0) * 5) - 
    (strikeIntensity * 50)
  ));
  
  const strikeOccurs = strikeIntensity > 0.4 && Math.random() < strikeIntensity;

  // 3. ESG & REPUTATION (v5.2 Extended)
  const trainingScore = Math.min(100, (decisions.hr.trainingPercent || 0) * 10);
  const participationScore = Math.min(100, (decisions.hr.participationPercent || 0) * 5);
  const salaryScore = Math.min(100, (salaryGap - 0.8) * 100);
  
  const esgScore = (trainingScore * 0.4) + (participationScore * 0.3) + (Math.max(0, salaryScore) * 0.3);
  const reputation = (esgScore * 0.7) + (trainingScore * 0.3);

  // 4. DYNAMIC INFLATION & INTEREST
  const event = ecoConfig.activeEvent;
  const eventInfl = event?.modifiers.inflation || 0;
  const eventDem = event?.modifiers.demand || 0;
  const eventInt = event?.modifiers.interest || 0;
  const eventProd = event?.modifiers.productivity || 0;

  let inflation = ecoConfig.inflationRate;
  if (indicators?.inflation_rate) {
    const rawInfl = indicators.inflation_rate / 100;
    inflation = isReal 
      ? (rawInfl * weights.inflation + ecoConfig.inflationRate * (1 - weights.inflation))
      : ecoConfig.inflationRate;
  }
  inflation += eventInfl;

  const interest = (indicators?.interest_rate_tr ? (indicators.interest_rate_tr / 100) : ecoConfig.interestRate) + eventInt;
  
  const baseCost = BRANCH_BASE_COSTS[branch] || 100;
  const inflatedBaseCost = baseCost * (1 + inflation);

  // Strike impacts production efficiency
  const strikeEfficiencyDrop = strikeOccurs ? 0.6 : 1.0;
  const productionVolume = ((decisions.production.activityLevel / 100) * 10000 + decisions.production.extraProduction) * strikeEfficiencyDrop;
  
  const learningRate = 0.92; 
  const experienceExponent = Math.log2(learningRate);
  const learningMultiplier = Math.pow((productionVolume + 1000) / 1000, experienceExponent);
  
  const unitVariableCost = inflatedBaseCost * learningMultiplier * (1 - eventProd);

  // 5. COGS
  const rawAPrice = (indicators?.raw_a_price || 20.2) * (1 + inflation);
  const rawBPrice = (indicators?.raw_b_price || 40.4) * (1 + inflation);
  const mpaCost = decisions.production.purchaseMPA * rawAPrice;
  const mpbCost = decisions.production.purchaseMPB * rawBPrice;
  const totalCogs = (productionVolume * unitVariableCost) + mpaCost + mpbCost;

  // 6. DEMAND ENGINE (Impacted by Quality Index and Reputation)
  const activeRegions = Object.values(decisions.regions);
  const regionCount = activeRegions.length || 1;
  const avgPrice = activeRegions.reduce((acc, r) => acc + r.price, 0) / regionCount;
  
  const basePotential = indicators?.demand_regions 
    ? indicators.demand_regions.reduce((a, b) => a + b, 0) / indicators.demand_regions.length 
    : 12000;
    
  const esgPriorityFactor = ecoConfig.esgPriority || 0.5;
  const demandBoost = (reputation / 100) * 0.15 * esgPriorityFactor;
  
  const demandMult = isReal 
    ? (ecoConfig.demandMultiplier * (1 - weights.demand) + (indicators?.risk_premium ? 1 - indicators.risk_premium : 1) * weights.demand)
    : ecoConfig.demandMultiplier;

  // Quality index boost
  const marketPotential = basePotential * (demandMult + eventDem + demandBoost) * qualityIndex;
  
  const totalMarketing = activeRegions.reduce((acc, r) => acc + r.marketing, 0);
  const marketingIndex = Math.log10(totalMarketing + 2) * 0.45 + 0.5;

  const referencePrice = branch === 'industrial' ? 340 : 200;
  const priceIndex = avgPrice / referencePrice;
  const elasticity = BRANCH_ELASTICITY[branch] || -1.5;
  
  const potentialVolume = marketPotential * Math.pow(priceIndex, elasticity) * marketingIndex;
  const salesVolume = Math.min(productionVolume, potentialVolume);
  
  const revenue = salesVolume * avgPrice;

  // 7. OPEX & FINANCIALS
  const fixedStructuralCost = 50000 * (1 + inflation);
  const currentSalary = decisions.hr.salary || salaryBenchmark;
  const salaryCost = (decisions.hr.hired * (currentSalary * 1.5)) + (currentSalary * 100);
  const trainingInvestment = (decisions.hr.trainingPercent / 100) * salaryCost;
  const rdCost = decisions.production.rd_investment || 0;
  const depreciation = (2000000) * 0.025; 
  const totalOpex = fixedStructuralCost + (totalMarketing * (indicators?.marketing_cost_unit || 10200)) + trainingInvestment + rdCost + depreciation;

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

  // Bernard SIND Specific: Stock Price Calculation (TSR Logic)
  const stockPrice = Math.max(0.1, (ebitda / 100000) + (revenue / 1000000) + (reputation / 50));

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
    isBankrupt,
    esgScore,
    reputation,
    qualityIndex,
    motivationScore,
    strikeOccurs,
    stockPrice
  };
};
