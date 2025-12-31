import { DecisionData, Branch, EcosystemConfig } from '../types';

/**
 * Empirion Advanced Economic Engine (v3.14)
 * Based on the competitive equilibrium archetype.
 * 
 * Features:
 * - Price Elasticity of Demand (relative to Market Expectation)
 * - Marketing GRP Efficiency (logarithmic returns)
 * - Production Learning Curve (experience-based unit cost reduction)
 * - Financial WACC and Tax Tiers
 */

const BRANCH_BASE_COSTS = {
  industrial: 180,
  agribusiness: 120,
  services: 90,
  commercial: 70
};

const BRANCH_ELASTICITY = {
  industrial: -1.8,    // High sensitivity
  agribusiness: -1.2,  // Essential commodity
  services: -1.5,      // Competitive
  commercial: -2.0     // Very high sensitivity
};

export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig = { inflationRate: 0.04, demandMultiplier: 1.0, interestRate: 0.12, marketVolatility: 0 }
) => {
  // 1. DYNAMIC COST STRUCTURE (Unit Cost)
  const baseCost = BRANCH_BASE_COSTS[branch] || 100;
  const inflatedBaseCost = baseCost * (1 + ecoConfig.inflationRate);

  // Production Scale & Learning Curve
  // Volume produced this round
  const productionVolume = (decisions.production.activityLevel / 100) * 10000 + decisions.production.extraProduction;
  
  // Experience effect: costs drop as volume increases (log model)
  // Formula: Cost(v) = Cost(1) * v^log2(learning_rate)
  const learningRate = 0.92; // 92% learning curve
  const experienceExponent = Math.log2(learningRate);
  const learningMultiplier = Math.pow((productionVolume + 1000) / 1000, experienceExponent);
  
  const unitVariableCost = inflatedBaseCost * learningMultiplier;

  // 2. COGS (Direct Materials)
  const mpaCost = decisions.production.purchaseMPA * 15 * (1 + ecoConfig.inflationRate);
  const mpbCost = decisions.production.purchaseMPB * 22 * (1 + ecoConfig.inflationRate);
  const totalCogs = (productionVolume * unitVariableCost) + mpaCost + mpbCost;

  // 3. DEMAND ENGINE (Market Equilibrium)
  // Calculate average price across all selected regions
  const activeRegions = Object.values(decisions.regions);
  const regionCount = activeRegions.length || 1;
  const avgPrice = activeRegions.reduce((acc, r) => acc + r.price, 0) / regionCount;
  
  // Base Market Potential (Aggregated)
  const marketPotential = 12000 * ecoConfig.demandMultiplier;
  
  // Marketing Efficiency (Logarithmic - Spending more has diminishing returns)
  const totalMarketing = activeRegions.reduce((acc, r) => acc + r.marketing, 0);
  const marketingIndex = Math.log10(totalMarketing + 2) * 0.45 + 0.5;

  // Price Elasticity Model
  // Reference Price for the sector
  const referencePrice = branch === 'industrial' ? 340 : branch === 'agribusiness' ? 450 : 200;
  const priceIndex = avgPrice / referencePrice;
  const elasticity = BRANCH_ELASTICITY[branch] || -1.5;
  
  // Sales Volume (Market Clearing)
  // Volume is constrained by Production and influenced by Price/Marketing
  const potentialVolume = marketPotential * Math.pow(priceIndex, elasticity) * marketingIndex;
  const salesVolume = Math.min(productionVolume, potentialVolume);
  
  const revenue = salesVolume * avgPrice;

  // 4. OPEX (Fixed Costs & SG&A)
  const fixedStructuralCost = 50000 * (1 + ecoConfig.inflationRate);
  const salaryCost = (decisions.hr.hired * 1500) + (decisions.hr.salary * 100);
  const trainingInvestment = (decisions.hr.trainingPercent / 100) * salaryCost;
  
  // Capital Expenditure Depreciation (CapEx)
  // Simulated fixed asset base: 2M
  const machineInvestment = (decisions.finance.buyMachines.alfa * 50000) + (decisions.finance.buyMachines.beta * 80000);
  const depreciation = (machineInvestment + 2000000) * 0.025; // 10% annual / 4 quarters

  const totalOpex = fixedStructuralCost + (totalMarketing * 1200) + trainingInvestment + depreciation;

  // 5. FINANCIALS (EBIDTA to Net Profit)
  const grossProfit = revenue - totalCogs;
  const ebitda = grossProfit - (totalOpex - depreciation);
  const ebit = ebitda - depreciation;
  
  // Interest: Debt vs Investment
  // Positive application = income; Negative (loan) = expense
  const netDebt = (decisions.finance.loanRequest) - (decisions.finance.application);
  const interestRate = netDebt > 0 ? (ecoConfig.interestRate / 4) : 0.012; // 1.2% quarterly yield
  const financialResult = -netDebt * interestRate;

  const preTaxProfit = ebit + financialResult;
  
  // Effective Tax Rate (Progressive)
  const taxRate = preTaxProfit > 200000 ? 0.35 : (preTaxProfit > 0 ? 0.20 : 0);
  const taxes = preTaxProfit > 0 ? preTaxProfit * taxRate : 0;
  const netProfit = preTaxProfit - taxes;

  // KPI Calculations
  const breakEvenUnits = totalOpex / (avgPrice - unitVariableCost || 1);

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
    breakEven: breakEvenUnits,
    margin: revenue > 0 ? (netProfit / revenue) : 0
  };
};
