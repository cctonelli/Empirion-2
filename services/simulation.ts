
import { DecisionData, Branch, EcosystemConfig, MacroIndicators } from '../types';

/**
 * EMPIRION MATHEMATICAL SANITIZER
 * Garante que nenhum input malicioso ou erro de arredondamento quebre o engine.
 */
const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

const calculateIndustrialResults = (decisions: DecisionData, ecoConfig: EcosystemConfig) => {
  const strategy = decisions.production.strategy || 'push_mrp';
  const automation = sanitize(decisions.production.automation_level, 0);
  
  let inventoryHoldingCostRate = 0.15;
  let leadTimeFactor = 1.0;
  let scaleBonus = 1.0;

  if (strategy === 'pull_kanban') {
    inventoryHoldingCostRate = 0.04;
    leadTimeFactor = 0.6;
    scaleBonus = 0.92;
  } else if (strategy === 'push_mrp') {
    inventoryHoldingCostRate = 0.28;
    leadTimeFactor = 1.3;
    scaleBonus = 1.45;
  }

  const trainingEffect = (sanitize(decisions.hr.trainingPercent, 0) / 100) * 0.45;
  const staffEfficiency = 0.4 + trainingEffect + (sanitize(decisions.hr.salary, 1300) / 2200) * 0.25;
  
  const oee = Math.min(100, (staffEfficiency * 65) + (automation * 35));
  
  return { inventoryHoldingCostRate, leadTimeFactor, scaleBonus, oee, productionCapacityBase: 10000 };
};

export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MacroIndicators
) => {
  const modality = ecoConfig.modalityType || 'standard';
  const metrics = calculateIndustrialResults(decisions, ecoConfig);

  let activeElasticity = modality === 'business_round' ? -2.85 : -1.8;
  let activeInflation = 1.0 + (ecoConfig.inflationRate || 0.04);

  // Cálculo de Demanda (Sanitizado)
  // Use proper types for reduce and access properties safely
  const regions = Object.values(decisions.regions);
  const avgPrice = regions.reduce((acc: number, r: any) => acc + sanitize(r.price, 340), 0) / (regions.length || 1);
  const totalMarketing = regions.reduce((acc: number, r: any) => acc + sanitize(r.marketing, 0), 0);
  
  const imageScore = Math.min(100, (totalMarketing * 2) + (metrics.oee * 0.4));
  // indicators might be MacroIndicators, checking for demand_regions property
  const marketPotential = (indicators?.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  const demand = marketPotential * Math.pow(avgPrice / 320, activeElasticity) * (1 + (imageScore - 50) / 100);

  // Produção (Sanitizado)
  const baseCost = 185 * activeInflation;
  const variableCost = baseCost * (1 - (sanitize(decisions.production.automation_level) * 0.22));
  const capacity = metrics.productionCapacityBase * (sanitize(decisions.production.activityLevel, 100) / 100) * metrics.scaleBonus * (metrics.oee / 100);
  
  const salesVolume = Math.min(demand, capacity);
  const revenue = salesVolume * avgPrice;
  const holdingCost = sanitize(decisions.production.purchaseMPA) * metrics.inventoryHoldingCostRate;
  const fixedCost = 48000 + (sanitize(decisions.production.automation_level) * 35000);
  
  const netProfit = (revenue - (salesVolume * variableCost) - fixedCost - holdingCost) * 0.85;

  return {
    revenue,
    netProfit,
    salesVolume,
    oee: metrics.oee,
    companyImage: imageScore,
    unitCost: (fixedCost + (salesVolume * variableCost)) / (salesVolume || 1),
    inventoryRisk: demand > capacity * 1.1 ? 'CRÍTICO' : 'ESTÁVEL',
    marketShare: (salesVolume / (marketPotential * 8)) * 100
  };
};
