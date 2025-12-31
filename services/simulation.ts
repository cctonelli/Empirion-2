import { DecisionData, Branch, EcosystemConfig } from '../types';

/**
 * Empirion Advanced Economic Engine (v3.12)
 * Inspired by Bonopoly but expanded with non-linear elasticity and financial depth.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig = { inflationRate: 0.04, demandMultiplier: 1.0, interestRate: 0.12, marketVolatility: 0 }
) => {
  // 1. DYNAMIC COST STRUCTURE
  const baseCost = branch === 'industrial' ? 180 : branch === 'agribusiness' ? 120 : 80;
  const inflatedBaseCost = baseCost * (1 + ecoConfig.inflationRate);

  // Learning Curve (85% Standard)
  const productionVolume = (decisions.production.activityLevel / 100) * 10000 + decisions.production.extraProduction;
  const learningRate = -0.234; 
  const learningMultiplier = Math.pow((productionVolume + 5000) / 5000, learningRate);
  
  const unitVariableCost = inflatedBaseCost * learningMultiplier;

  // 2. RAW MATERIAL & LOGISTICS
  const mpaCost = decisions.production.purchaseMPA * 15 * (1 + ecoConfig.inflationRate);
  const mpbCost = decisions.production.purchaseMPB * 22 * (1 + ecoConfig.inflationRate);
  const cogs = (productionVolume * unitVariableCost) + mpaCost + mpbCost;

  // 3. DEMAND & ELASTICITY MODEL
  // Price Elasticity: Volume = Base * (Price / AvgPrice)^-Elasticity
  const avgPrice = Object.values(decisions.regions).reduce((acc, r) => acc + r.price, 0) / (Object.keys(decisions.regions).length || 1);
  const baseMarketDemand = 8000 * ecoConfig.demandMultiplier;
  
  // Simulated Market Share based on Marketing and Price
  const totalMarketing = Object.values(decisions.regions).reduce((acc, r) => acc + r.marketing, 0);
  const marketingMultiplier = Math.log10(totalMarketing + 1) * 0.5 + 0.5;
  
  // Price relative to market expectation (Standard: 340)
  const priceIndex = avgPrice / 340;
  const priceElasticity = -1.5; // High elasticity for industrial/commercial
  const salesVolume = Math.min(productionVolume, baseMarketDemand * Math.pow(priceIndex, priceElasticity) * marketingMultiplier);
  
  const revenue = salesVolume * avgPrice;

  // 4. OPEX & DEPRECIATION
  const fixedStructuralCost = 45000 * (1 + ecoConfig.inflationRate);
  const hrCost = (decisions.hr.hired * 1500) + (decisions.hr.salary * 100); // Sample HR formula
  const trainingExp = (decisions.hr.trainingPercent / 100) * hrCost;
  
  // CapEx Depreciation (Simulated 10% annual on machines)
  const machineValue = (decisions.finance.buyMachines.alfa * 50000) + (decisions.finance.buyMachines.beta * 80000);
  const depreciation = (machineValue + 1000000) * 0.025; // 2.5% per quarter

  const opex = fixedStructuralCost + (totalMarketing * 800) + trainingExp + depreciation;

  // 5. FINANCIAL RESULT (Interest Expense / Application)
  const cashPosition = 1250000 - (decisions.finance.application);
  const interestResult = cashPosition > 0 
    ? cashPosition * (0.01) // 1% yield
    : cashPosition * (ecoConfig.interestRate / 4); // Quarterly interest

  const ebitda = (revenue - cogs) - (opex - depreciation);
  const ebit = ebitda - depreciation;
  const preTaxProfit = ebit + interestResult;
  
  // Tax Tiers
  const taxRate = preTaxProfit > 100000 ? 0.25 : 0.15;
  const netProfit = preTaxProfit > 0 ? preTaxProfit * (1 - taxRate) : preTaxProfit;

  return {
    revenue,
    unitCost: unitVariableCost,
    totalVariableCosts: cogs,
    opex,
    ebitda,
    netProfit,
    salesVolume,
    depreciation,
    financialResult: interestResult,
    breakEven: opex / (avgPrice - unitVariableCost)
  };
};
