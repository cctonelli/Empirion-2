
import { DecisionData, Branch, EcosystemConfig, MarketIndicators, ProductDefinition } from '../types';

/**
 * Empirion Advanced Economic Engine (v5.4 GOLD)
 * SIMCO Commercial Update: E-commerce Split, Sales Commissions & Satisfaction
 */

const BRANCH_BASE_COSTS = {
  industrial: 180,
  agribusiness: 120,
  services: 90,
  commercial: 60 // Lower base cost, higher operational overhead (stores)
};

const BRANCH_ELASTICITY = {
  industrial: -1.8,
  agribusiness: -1.4,
  services: -1.5,
  commercial: -2.2 // Retail is highly elastic
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
  // 0. SCENARIO & CHANNEL SETUP
  const isReal = ecoConfig.scenarioType === 'real';
  const weights = ecoConfig.realDataWeights || { inflation: 1, demand: 1, currency: 1, climate: 1, ecommerce: 1 };
  
  // SIMCO: E-commerce Share (Macro)
  const baseECShare = indicators?.ecommerce_adoption_rate || 0.15;
  const eventECSurge = ecoConfig.activeEvent?.modifiers.ecommerce_surge || 0;
  const currentECShare = Math.min(0.6, baseECShare + eventECSurge);

  // 1. CONSUMER SATISFACTION (Retail Core)
  const digitalInvestment = decisions.production.digital_exp_investment || 0;
  const trainingScore = Math.min(100, (decisions.hr.trainingPercent || 0) * 10);
  const commissionBonus = (decisions.hr.commission_percent || 0) * 2;
  
  const consumerSatisfaction = Math.min(100, 
    (digitalInvestment / 1000) + 
    (trainingScore * 0.3) + 
    (commissionBonus * 0.5) + 40
  );

  // 2. MOTIVATION & STRIKE
  const salaryBenchmark = indicators?.average_salary || 1300;
  const salaryGap = decisions.hr.salary / salaryBenchmark;
  
  let strikeIntensity = 0;
  if (salaryGap < 0.85) strikeIntensity += (0.85 - salaryGap) * 2.5;
  
  const motivationScore = Math.max(0, Math.min(100, 
    (salaryGap * 50) + 
    (trainingScore * 0.2) + 
    (decisions.hr.commission_percent || 0) - 
    (strikeIntensity * 60)
  ));
  
  const strikeOccurs = strikeIntensity > 0.45 && Math.random() < strikeIntensity;

  // 3. ECONOMIC VARIABLES
  const event = ecoConfig.activeEvent;
  const eventInfl = event?.modifiers.inflation || 0;
  const eventDem = event?.modifiers.demand || 0;
  const eventInt = event?.modifiers.interest || 0;

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

  // Capacity / Procurement
  const efficiencyDrop = strikeOccurs ? 0.5 : 1.0;
  const volumeAvailable = ((decisions.production.activityLevel / 100) * 15000 + decisions.production.extraProduction) * efficiencyDrop;
  
  const unitVariableCost = inflatedBaseCost;

  // 4. COGS & PROCUREMENT
  const rawAPrice = (indicators?.raw_a_price || 20.2) * (1 + inflation);
  const totalCogs = (volumeAvailable * unitVariableCost) + (decisions.production.purchaseMPA * rawAPrice);

  // 5. DEMAND ENGINE (Split Channel)
  const activeRegions = Object.values(decisions.regions);
  const avgTradPrice = activeRegions.reduce((acc, r) => acc + r.price, 0) / (activeRegions.length || 1);
  const avgECPrice = activeRegions.reduce((acc, r) => acc + (r.ecommerce_price || r.price * 0.95), 0) / (activeRegions.length || 1);
  
  const basePotential = indicators?.demand_regions 
    ? indicators.demand_regions.reduce((a, b) => a + b, 0) / indicators.demand_regions.length 
    : 12000;
    
  const demandMult = isReal 
    ? (ecoConfig.demandMultiplier * (1 - weights.demand) + (indicators?.risk_premium ? 1 - indicators.risk_premium : 1) * weights.demand)
    : ecoConfig.demandMultiplier;

  // Satisfaction Boost
  const satisfactionMultiplier = 1.0 + (consumerSatisfaction - 50) / 100 * 0.2;
  const marketPotential = basePotential * (demandMult + eventDem) * satisfactionMultiplier;
  
  // Traditional Demand
  const tradPotential = marketPotential * (1 - currentECShare);
  const totalTradMarketing = activeRegions.reduce((acc, r) => acc + r.marketing, 0);
  const tradMarketingIndex = Math.log10(totalTradMarketing + 2) * 0.4 + 0.6;
  const tradVolume = tradPotential * Math.pow(avgTradPrice / 250, BRANCH_ELASTICITY.commercial) * tradMarketingIndex;

  // E-commerce Demand
  const ecPotential = marketPotential * currentECShare;
  const totalECMarketing = activeRegions.reduce((acc, r) => acc + (r.ecommerce_marketing || 0), 0);
  const ecMarketingIndex = Math.log10(totalECMarketing + 5) * 0.5 + 0.5;
  const ecVolume = ecPotential * Math.pow(avgECPrice / 220, BRANCH_ELASTICITY.commercial) * ecMarketingIndex;

  const totalDemand = tradVolume + ecVolume;
  const salesVolume = Math.min(volumeAvailable, totalDemand);
  
  // Weighted Average Price for Revenue
  const actualTradSales = (tradVolume / totalDemand) * salesVolume;
  const actualECSales = (ecVolume / totalDemand) * salesVolume;
  const revenue = (actualTradSales * avgTradPrice) + (actualECSales * avgECPrice);

  // 6. OPEX & FINANCIALS
  const fixedStructuralCost = 60000 * (1 + inflation);
  const salesmanSalary = (decisions.hr.salary || salaryBenchmark);
  const commissionCost = revenue * ((decisions.hr.commission_percent || 0) / 100);
  const payroll = (decisions.hr.hired * salesmanSalary * 1.5) + (salesmanSalary * 50) + commissionCost;
  
  const marketingCost = (totalTradMarketing + totalECMarketing) * (indicators?.marketing_cost_unit || 10200);
  const totalOpex = fixedStructuralCost + marketingCost + payroll + digitalInvestment;

  const ebitda = revenue - totalCogs - (totalOpex - (2000000 * 0.025));
  
  // SIMCO: Special loans / Seizure
  const emergencyLoanCost = (decisions.finance.emergency_loan || 0) * 0.15; // 15% immediate hit
  const anticipationDiscount = (decisions.finance.receivables_anticipation || 0) * 0.04;
  
  const financialResult = (-(decisions.finance.loanRequest - decisions.finance.application) * (interest / 4)) - anticipationDiscount - emergencyLoanCost;
  const netProfit = (ebitda - (2000000 * 0.025) + financialResult) * 0.78;

  return {
    revenue,
    unitCost: unitVariableCost,
    totalVariableCosts: totalCogs,
    opex: totalOpex,
    ebitda,
    netProfit,
    salesVolume,
    tradSales: actualTradSales,
    ecSales: actualECSales,
    consumerSatisfaction,
    motivationScore,
    strikeOccurs,
    ecommerceShare: currentECShare * 100,
    commissionPaid: commissionCost
  };
};
