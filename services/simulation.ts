
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
  const productionVolume = decisions.production.line1 + decisions.production.line2;
  const learningMultiplier = Math.pow((productionVolume + 1000) / 1000, learningRate);
  const unitCost = baseCost * learningMultiplier;

  // 2. Variable Costs
  const totalVariableCosts = productionVolume * unitCost + 
    (decisions.purchases.materialA.volume * 12) + 
    (decisions.purchases.materialB.volume * 18);

  // 3. Operational Expenses (Fixed + Decision based)
  const opex = decisions.marketing.branding + 
    decisions.marketing.digital + 
    decisions.marketing.traditional + 
    decisions.hr.trainingBudget + 
    25000; // Fixed structural cost

  // 4. Market Demand Estimation (Simplification of Shared Demand)
  // In a real simulation, this depends on ALL teams.
  const estimatedMarketShare = 0.25; // 4 teams placeholder
  const totalDemand = 5000; // Placeholder
  const salesVolume = Math.min(productionVolume, totalDemand * estimatedMarketShare);
  
  const revenue = salesVolume * decisions.pricing.productA.price;
  const grossMargin = revenue - totalVariableCosts;
  const ebitda = grossMargin - opex;
  const netProfit = ebitda * 0.85; // Simple 15% tax flat

  return {
    revenue,
    unitCost,
    totalVariableCosts,
    opex,
    ebitda,
    netProfit,
    salesVolume,
    projectedCash: 1250000 + netProfit - decisions.finance.dividends // Starting cash + profit
  };
};
