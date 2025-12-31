import { DecisionData, Branch, EcosystemConfig } from '../types';

/**
 * Implements core economic formulas inspired by Bonopoly.
 * Used for real-time frontend projections before the backend process runs.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig = { inflationRate: 0.04, demandMultiplier: 1.0, interestRate: 0.12, marketVolatility: 0 }
) => {
  // 1. Learning Curve Factor (Bonopoly inspired)
  const learningRate = -0.211; // Standard 85% curve
  const baseCost = branch === 'industrial' ? 45 : 30;
  
  // Apply Inflation to base costs
  const inflatedBaseCost = baseCost * (1 + ecoConfig.inflationRate);

  const productionVolume = (decisions.production.activityLevel / 100) * 1000 + (decisions.production.extraProduction / 100) * 200;
  const learningMultiplier = Math.pow((productionVolume + 1000) / 1000, learningRate);
  const unitCost = inflatedBaseCost * learningMultiplier;

  // 2. Variable Costs
  const totalVariableCosts = productionVolume * unitCost + 
    (decisions.production.purchaseMPA * 12 * (1 + ecoConfig.inflationRate)) + 
    (decisions.production.purchaseMPB * 18 * (1 + ecoConfig.inflationRate));

  // 3. Operational Expenses (Fixed + Decision based)
  const totalMarketing = Object.values(decisions.regions).reduce((acc, r) => acc + (r.marketing * 500), 0);
  const trainingExp = (decisions.hr.trainingPercent / 100) * decisions.hr.salary * 10; 

  // Structural cost affected by inflation
  const fixedStructuralCost = 25000 * (1 + ecoConfig.inflationRate);
  const opex = totalMarketing + trainingExp + fixedStructuralCost;

  // 4. Market Demand Estimation (Affected by Demand Multiplier)
  const estimatedMarketShare = 0.25; // 4 teams placeholder
  const totalDemand = 5000 * ecoConfig.demandMultiplier; 
  const salesVolume = Math.min(productionVolume, totalDemand * estimatedMarketShare);
  
  const regionValues = Object.values(decisions.regions);
  const avgPrice = regionValues.length > 0 ? regionValues.reduce((acc, r) => acc + r.price, 0) / regionValues.length : 340;
  
  const revenue = salesVolume * avgPrice;
  const grossMargin = revenue - totalVariableCosts;
  
  // Financial Result (Affected by Interest Rate)
  // Simplified: 10% of cash as positive result or negative if debt
  const financialResult = (1250000 * (ecoConfig.interestRate / 12)); 

  const ebitda = grossMargin - opex + financialResult;
  const netProfit = ebitda * 0.85; // Simple 15% tax flat

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