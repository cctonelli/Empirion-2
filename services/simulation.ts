
import { DecisionData, Branch, EcosystemConfig, MarketIndicators, ProductDefinition, ServiceLevel } from '../types';

/**
 * Empirion Advanced Economic Engine (v5.5 GOLD)
 * SISERV Services Update: Formation Matching, Quality Index & Contract Modes
 */

const BRANCH_BASE_COSTS = {
  industrial: 180,
  agribusiness: 120,
  services: 110, // Cost is largely human capital
  commercial: 60
};

const BRANCH_ELASTICITY = {
  industrial: -1.8,
  agribusiness: -1.4,
  services: -1.6, // Services depend heavily on image/quality
  commercial: -2.2
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
  // 0. SCENARIO & CONTEXT
  const isReal = ecoConfig.scenarioType === 'real';
  const weights = ecoConfig.realDataWeights || { inflation: 1, demand: 1, currency: 1, climate: 1, ecommerce: 1, service_demand: 1 };
  
  // 1. SERVICE QUALITY & IMAGE (SISERV Core)
  const trainingScore = Math.min(100, (decisions.hr.trainingPercent || 0) * 10);
  const participationBonus = (decisions.hr.participationPercent || 0) * 0.5;
  
  // Accumulated quality index (Training + QA Investment)
  const qualityIndex = Math.min(100, 
    (trainingScore * 0.4) + 
    (participationBonus * 0.2) + 
    ((decisions.production.rd_investment || 0) / 2000) + 40
  );

  // Company Image (Marketing + Quality History)
  const totalMarketing = Object.values(decisions.regions).reduce((acc, r) => acc + r.marketing, 0);
  const companyImage = Math.min(100, (totalMarketing * 5) + (qualityIndex * 0.6));

  // 2. STAFFING QUALIFICATION MATCHING (SISERV)
  // If branch is services, check if staff level matches the service mix
  let qualificationFactor = 1.0;
  if (branch === 'services') {
    const staff = decisions.hr.staff_by_level || { low: 50, mid: 20, high: 10 };
    const mix = decisions.production.service_level_allocation || { low: 60, mid: 30, high: 10 };
    
    // Simple penalty for mismatch
    const lowMatch = Math.min(1, staff.low / (mix.low || 1));
    const midMatch = Math.min(1, staff.mid / (mix.mid || 1));
    const highMatch = Math.min(1, staff.high / (mix.high || 1));
    
    qualificationFactor = (lowMatch * 0.3) + (midMatch * 0.4) + (highMatch * 0.3);
  }

  // 3. MOTIVATION & STRIKE
  const salaryBenchmark = indicators?.average_salary || 1300;
  const salaryGap = decisions.hr.salary / salaryBenchmark;
  
  let strikeIntensity = 0;
  if (salaryGap < 0.9) strikeIntensity += (0.9 - salaryGap) * 2;
  
  const motivationScore = Math.max(0, Math.min(100, 
    (salaryGap * 60) + (trainingScore * 0.2) - (strikeIntensity * 50)
  ));
  
  const strikeOccurs = strikeIntensity > 0.4 && Math.random() < strikeIntensity;

  // 4. ECONOMIC VARIABLES
  const event = ecoConfig.activeEvent;
  const eventInfl = event?.modifiers.inflation || 0;
  const eventDem = event?.modifiers.demand || 0;

  let inflation = ecoConfig.inflationRate;
  if (indicators?.inflation_rate) {
    const rawInfl = indicators.inflation_rate / 100;
    inflation = isReal 
      ? (rawInfl * weights.inflation + ecoConfig.inflationRate * (1 - weights.inflation))
      : ecoConfig.inflationRate;
  }
  inflation += eventInfl;

  const baseCost = BRANCH_BASE_COSTS[branch] || 100;
  const inflatedBaseCost = baseCost * (1 + inflation);

  // Productivity
  const efficiencyDrop = strikeOccurs ? 0.6 : 1.0;
  const productivity = (motivationScore / 100) * qualificationFactor * efficiencyDrop;
  
  // Available Service Capacity (Man-hours / Projects)
  const capacity = ((decisions.production.activityLevel / 100) * 10000 + decisions.production.extraProduction) * productivity;

  // 5. DEMAND ENGINE (Image & Quality Driven)
  const activeRegions = Object.values(decisions.regions);
  const avgPrice = activeRegions.reduce((acc, r) => acc + r.price, 0) / (activeRegions.length || 1);
  
  const basePotential = indicators?.demand_regions 
    ? indicators.demand_regions.reduce((a, b) => a + b, 0) / indicators.demand_regions.length 
    : 12000;
    
  const demandMult = isReal 
    ? (ecoConfig.demandMultiplier * (1 - weights.demand) + (indicators?.risk_premium ? 1 - indicators.risk_premium : 1) * weights.demand)
    : ecoConfig.demandMultiplier;

  // SISERV: Services are highly dependent on Image (Company Reputation)
  const imageMultiplier = 1.0 + (companyImage - 50) / 100 * 0.3;
  const qualityMultiplier = 1.0 + (qualityIndex - 50) / 100 * 0.2;
  
  const marketPotential = basePotential * (demandMult + eventDem) * imageMultiplier * qualityMultiplier;
  
  const marketingIndex = Math.log10(totalMarketing + 2) * 0.45 + 0.55;
  const potentialVolume = marketPotential * Math.pow(avgPrice / 300, BRANCH_ELASTICITY.services) * marketingIndex;
  
  const salesVolume = Math.min(capacity, potentialVolume);
  
  // SISERV: Contract Multiplier (Previous vs Immediate)
  // Immediate contracts have 10% lower revenue due to spot pricing
  const contractFactor = decisions.production.contract_mode === 'immediate' ? 0.9 : 1.0;
  const revenue = salesVolume * avgPrice * contractFactor;

  // 6. OPEX & FINANCIALS
  const fixedStructuralCost = 45000 * (1 + inflation);
  const currentSalary = decisions.hr.salary || salaryBenchmark;
  
  // Different levels have different salary weights in Services
  const staff = decisions.hr.staff_by_level || { low: 50, mid: 20, high: 10 };
  const basePayroll = (staff.low * currentSalary) + (staff.mid * currentSalary * 1.5) + (staff.high * currentSalary * 2.5);
  const totalPayroll = basePayroll * 1.6; // Taxes/Social
  
  const trainingInvestment = (decisions.hr.trainingPercent / 100) * totalPayroll;
  const marketingCost = totalMarketing * (indicators?.marketing_cost_unit || 10200);
  
  const totalOpex = fixedStructuralCost + marketingCost + totalPayroll + trainingInvestment;

  const ebitda = revenue - totalOpex;
  const netProfit = (ebitda - (2000000 * 0.02)) * 0.8; // Simplified depreciation/tax

  return {
    revenue,
    unitCost: totalOpex / (salesVolume || 1),
    opex: totalOpex,
    ebitda,
    netProfit,
    salesVolume,
    qualityIndex,
    companyImage,
    motivationScore,
    strikeOccurs,
    staffEfficiency: qualificationFactor * 100,
    contractMode: decisions.production.contract_mode || 'immediate'
  };
};
