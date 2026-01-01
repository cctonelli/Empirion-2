
import { DecisionData, Branch, EcosystemConfig, MarketIndicators, ProductDefinition } from '../types';

/**
 * Empirion Advanced Economic Engine (v5.3 GOLD)
 * SIAGRO Agribusiness Update: Seasonality, Perishability, Yield & Climate
 */

const BRANCH_BASE_COSTS = {
  industrial: 180,
  agribusiness: 120, // Lower base, higher volatility
  services: 90,
  commercial: 70
};

const BRANCH_ELASTICITY = {
  industrial: -1.8,
  agribusiness: -1.4,
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
  indicators?: MarketIndicators,
  products: ProductDefinition[] = []
) => {
  // 0. SCENARIO & SEASONALITY MERGE
  const isReal = ecoConfig.scenarioType === 'real';
  const weights = ecoConfig.realDataWeights || { inflation: 1, demand: 1, currency: 1, climate: 1 };
  
  // SIAGRO: Seasonality Index (1.0 default)
  const seasonalityIndex = indicators?.seasonality_index || 1.0;
  const climateFactor = (indicators?.climate_status === 'dry' || indicators?.climate_status === 'flood') ? 0.8 : 
                        (indicators?.climate_status === 'optimal' ? 1.1 : 1.0);

  // 1. QUALITY & AGRO YIELD
  const currentRD = decisions.production.rd_investment || 0;
  const qualityIndex = 1.0 + Math.log10((currentRD + 1000) / 1000) * 0.12;
  
  // SIAGRO: Agro Tech Investment boosts Yield
  const yieldBoost = 1.0 + Math.log10((decisions.production.agro_tech_investment || 0) + 1) * 0.05;

  // 2. STRIKE & MOTIVATION
  const salaryBenchmark = indicators?.average_salary || 1300;
  const salaryGap = decisions.hr.salary / salaryBenchmark;
  
  // SIAGRO: Overtime boosts productivity but risks fatigue
  const overtimeBonus = (decisions.hr.overtimeHours || 0) > 0 ? (decisions.hr.overtimeHours! / 40) * 0.1 : 0;
  
  let strikeIntensity = 0;
  if (salaryGap < 0.9) strikeIntensity += (0.9 - salaryGap) * 2;
  if (decisions.hr.fired > (decisions.hr.hired + 10)) strikeIntensity += 0.15;
  
  const motivationScore = Math.max(0, Math.min(100, 
    (salaryGap * 60) + 
    ((decisions.hr.trainingPercent || 0) * 5) - 
    (strikeIntensity * 50) - 
    ((decisions.hr.overtimeHours || 0) > 20 ? 10 : 0) // Fatigue penalty
  ));
  
  const strikeOccurs = strikeIntensity > 0.4 && Math.random() < strikeIntensity;

  // 3. ESG & REPUTATION
  const trainingScore = Math.min(100, (decisions.hr.trainingPercent || 0) * 10);
  const participationScore = Math.min(100, (decisions.hr.participationPercent || 0) * 5);
  const salaryScore = Math.min(100, (salaryGap - 0.8) * 100);
  
  const esgScore = (trainingScore * 0.4) + (participationScore * 0.3) + (Math.max(0, salaryScore) * 0.3);
  const reputation = (esgScore * 0.7) + (trainingScore * 0.3);

  // 4. ECONOMIC VARIABLES
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

  // SIAGRO: Climate and Seasonality affect Production Yield
  const strikeEfficiencyDrop = strikeOccurs ? 0.6 : 1.0;
  const productionVolume = (
    ((decisions.production.activityLevel / 100) * 10000 + decisions.production.extraProduction) * 
    strikeEfficiencyDrop * 
    seasonalityIndex * 
    climateFactor * 
    yieldBoost *
    (1 + overtimeBonus)
  );
  
  const unitVariableCost = inflatedBaseCost * (1 - eventProd);

  // 5. COGS
  const rawAPrice = (indicators?.raw_a_price || 20.2) * (1 + inflation) / (branch === 'agribusiness' ? seasonalityIndex : 1);
  const rawBPrice = (indicators?.raw_b_price || 40.4) * (1 + inflation);
  const mpaCost = decisions.production.purchaseMPA * rawAPrice;
  const mpbCost = decisions.production.purchaseMPB * rawBPrice;
  const totalCogs = (productionVolume * unitVariableCost) + mpaCost + mpbCost;

  // 6. DEMAND ENGINE
  const activeRegions = Object.values(decisions.regions);
  const avgPrice = activeRegions.reduce((acc, r) => acc + r.price, 0) / (activeRegions.length || 1);
  
  const basePotential = indicators?.demand_regions 
    ? indicators.demand_regions.reduce((a, b) => a + b, 0) / indicators.demand_regions.length 
    : 12000;
    
  const esgPriorityFactor = ecoConfig.esgPriority || 0.5;
  const demandBoost = (reputation / 100) * 0.15 * esgPriorityFactor;
  
  const demandMult = isReal 
    ? (ecoConfig.demandMultiplier * (1 - weights.demand) + (indicators?.risk_premium ? 1 - indicators.risk_premium : 1) * weights.demand)
    : ecoConfig.demandMultiplier;

  const marketPotential = basePotential * (demandMult + eventDem + demandBoost) * qualityIndex;
  
  const totalMarketing = activeRegions.reduce((acc, r) => acc + r.marketing, 0);
  const marketingIndex = Math.log10(totalMarketing + 2) * 0.45 + 0.5;

  const referencePrice = branch === 'agribusiness' ? 220 : (branch === 'industrial' ? 340 : 200);
  const priceIndex = avgPrice / referencePrice;
  const elasticity = BRANCH_ELASTICITY[branch] || -1.5;
  
  const potentialVolume = marketPotential * Math.pow(priceIndex, elasticity) * marketingIndex;
  const salesVolume = Math.min(productionVolume, potentialVolume);
  
  // SIAGRO: Perishability Calculation
  let perishabilityLoss = 0;
  const unsoldStock = productionVolume - salesVolume;
  if (unsoldStock > 0 && products.length > 0) {
    const mainProduct = products[0];
    if (mainProduct.is_perishable) {
      perishabilityLoss = unsoldStock * (mainProduct.perishability_rate || 0.2);
    }
  }

  const revenue = salesVolume * avgPrice;

  // 7. OPEX & FINANCIALS
  const fixedStructuralCost = 50000 * (1 + inflation);
  const currentSalary = decisions.hr.salary || salaryBenchmark;
  const salaryCost = (decisions.hr.hired * (currentSalary * 1.5)) + (currentSalary * 100);
  const trainingInvestment = (decisions.hr.trainingPercent / 100) * salaryCost;
  const totalOpex = fixedStructuralCost + (totalMarketing * (indicators?.marketing_cost_unit || 10200)) + trainingInvestment + (perishabilityLoss * unitVariableCost);

  const grossProfit = revenue - totalCogs;
  const ebitda = grossProfit - (totalOpex - (2000000 * 0.025)); // simplified depreciation
  
  // SIAGRO: Receivables anticipation reduces cash but adds immediate liquidity
  const anticipationDiscount = (decisions.finance.receivables_anticipation || 0) * 0.05;
  const financialResult = (-(decisions.finance.loanRequest - decisions.finance.application) * (interest / 4)) - anticipationDiscount;

  const netProfit = (ebitda - (2000000 * 0.025) + financialResult) * 0.75; // simplified tax

  return {
    revenue,
    unitCost: unitVariableCost,
    totalVariableCosts: totalCogs,
    opex: totalOpex,
    ebitda,
    netProfit,
    salesVolume,
    perishabilityLoss,
    qualityIndex,
    motivationScore,
    strikeOccurs,
    yieldBoost,
    seasonalityImpact: seasonalityIndex
  };
};
