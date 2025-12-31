
import { DecisionData, Branch } from '../types';

/**
 * Implements core economic formulas inspired by Bonopoly.
 * Used for real-time frontend projections before the backend process runs.
 */
export const calculateProjections = (decisions: DecisionData, branch: Branch) => {
  // 1. Learning Curve Factor (Bonopoly inspired)
  // Cost units decrease as cumulative production increases
  const learningRate = -0.211; // Standard 85% curve
  const baseCost = branch === 'industrial' ? 45 : 30;
  
  // FIXED: Replaced non-existent line1/line2 with activityLevel-based volume calculation
  const productionVolume = (decisions.production.activityLevel / 100) * 1000 + (decisions.production.extraProduction / 100) * 200;
  const learningMultiplier = Math.pow((productionVolume + 1000) / 1000, learningRate);
  const unitCost = baseCost * learningMultiplier;

  // 2. Variable Costs
  // FIXED: Accessing correct purchase volume properties on the production object
  const totalVariableCosts = productionVolume * unitCost + 
    (decisions.production.purchaseMPA * 12) + 
    (decisions.production.purchaseMPB * 18);

  // 3. Operational Expenses (Fixed + Decision based)
  // FIXED: Summing marketing from regions and estimating training expense from trainingPercent
  const totalMarketing = Object.values(decisions.regions).reduce((acc, r) => acc + (r.marketing * 500), 0);
  const trainingExp = (decisions.hr.trainingPercent / 100) * decisions.hr.salary * 10; 

  const opex = totalMarketing + trainingExp + 25000; // Fixed structural cost

  // 4. Market Demand Estimation (Simplification of Shared Demand)
  // In a real simulation, this depends on ALL teams.
  const estimatedMarketShare = 0.25; // 4 teams placeholder
  const totalDemand = 5000; // Placeholder
  const salesVolume = Math.min(productionVolume, totalDemand * estimatedMarketShare);
  
  // FIXED: Replaced missing 'pricing' property with an average price derived from regions
  const regionValues = Object.values(decisions.regions);
  const avgPrice = regionValues.length > 0 ? regionValues.reduce((acc, r) => acc + r.price, 0) / regionValues.length : 340;
  
  const revenue = salesVolume * avgPrice;
  const grossMargin = revenue - totalVariableCosts;
  const ebitda = grossMargin - opex;
  const netProfit = ebitda * 0.85; // Simple 15% tax flat

  // FIXED: Removed invalid dividends access and updated projectedCash logic
  return {
    revenue,
    unitCost,
    totalVariableCosts,
    opex,
    ebitda,
    netProfit,
    salesVolume,
    projectedCash: 1250000 + netProfit // Starting cash + profit
  };
};
