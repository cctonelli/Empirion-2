import { DecisionData, Branch, EcosystemConfig, MarketIndicators, ProductDefinition, ServiceLevel, ProductionStrategy } from '../types';

/**
 * Empirion Advanced Economic Engine (v6.0 - Independent Modular Logic)
 * Cada ramo agora possui seu próprio "Cérebro Matemático" independente.
 * Suporta crescimento infinito adicionando novos "Calculators".
 */

// 1. CALCULADORA INDUSTRIAL (MRP II / JIT / OEE)
const calculateIndustrialResults = (decisions: DecisionData, ecoConfig: EcosystemConfig, indicators?: MarketIndicators) => {
  const strategy = decisions.production.strategy || 'push_mrp';
  const automation = decisions.production.automation_level || 0;
  
  let inventoryHoldingCostRate = 0.15;
  let leadTimeFactor = 1.0;
  let scaleBonus = 1.0;

  // Lógica de Modificadores por Estratégia (Base HBR 1985)
  if (strategy === 'pull_kanban') {
    inventoryHoldingCostRate = 0.04;
    leadTimeFactor = 0.6;
    scaleBonus = 0.92;
  } else if (strategy === 'push_mrp') {
    inventoryHoldingCostRate = 0.28;
    leadTimeFactor = 1.3;
    scaleBonus = 1.45; // Economia de escala bruta
  }

  const trainingEffect = (decisions.hr.trainingPercent / 100) * 0.45;
  const staffEfficiency = 0.4 + trainingEffect + (decisions.hr.salary / 2200) * 0.25;
  
  // OEE Realista
  const oee = Math.min(100, (staffEfficiency * 65) + (automation * 35));
  
  return { 
    inventoryHoldingCostRate, 
    leadTimeFactor, 
    scaleBonus, 
    oee,
    productionCapacityBase: 10000 
  };
};

// 2. CALCULADORA COMERCIAL (RODADA DE NEGÓCIOS / VOLATILIDADE)
const calculateCommercialResults = (decisions: DecisionData, ecoConfig: EcosystemConfig, indicators?: MarketIndicators) => {
  const round = 1; 
  const inflationFactor = Math.pow(1 + (ecoConfig.inflationRate || 0.04), round);
  const priceElasticity = -2.85; // Alta sensibilidade em rodada de negócios
  
  return {
    inflationFactor,
    priceElasticity,
    marketingMultiplier: 1.25 // Bônus comercial
  };
};

// 3. CORE ENGINE (ORCHESTRATOR)
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MarketIndicators
) => {
  const modality = ecoConfig.modalityType || 'standard';
  
  // Injeção de Inteligência por Ramo
  const indMetrics = calculateIndustrialResults(decisions, ecoConfig, indicators);
  const commMetrics = calculateCommercialResults(decisions, ecoConfig, indicators);

  // Seleção de Parâmetros Baseada na Modalidade Ativa
  let activeElasticity = -1.8;
  let activeInflation = 1.0;
  let activeScale = indMetrics.scaleBonus;

  if (modality === 'business_round') {
    activeElasticity = commMetrics.priceElasticity;
    activeInflation = commMetrics.inflationFactor;
  }

  // CÁLCULO DE DEMANDA (Curva Cournot adaptada)
  const avgPrice = Object.values(decisions.regions).reduce((acc, r) => acc + r.price, 0) / 9;
  const totalMarketing = Object.values(decisions.regions).reduce((acc, r) => acc + r.marketing, 0);
  const imageScore = Math.min(100, (totalMarketing * 2) + (indMetrics.oee * 0.4));
  
  const marketPotential = (indicators?.demand_regions[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  const demand = marketPotential * Math.pow(avgPrice / 320, activeElasticity) * (1 + (imageScore - 50) / 100);

  // CÁLCULO DE PRODUÇÃO E CUSTOS
  const baseCost = 185 * activeInflation;
  const variableCost = baseCost * (1 - (decisions.production.automation_level! * 0.22));
  const capacity = indMetrics.productionCapacityBase * (decisions.production.activityLevel / 100) * activeScale * (indMetrics.oee / 100);
  
  const salesVolume = Math.min(demand, capacity);
  const revenue = salesVolume * avgPrice;
  
  const holdingCost = (decisions.production.purchaseMPA * indMetrics.inventoryHoldingCostRate);
  const fixedCost = 48000 + (decisions.production.automation_level! * 35000);
  
  const ebitda = revenue - (salesVolume * variableCost) - fixedCost - holdingCost;
  const netProfit = ebitda * 0.85;

  return {
    revenue,
    netProfit,
    salesVolume,
    oee: indMetrics.oee,
    companyImage: imageScore,
    unitCost: (fixedCost + (salesVolume * variableCost)) / (salesVolume || 1),
    inventoryRisk: demand > capacity * 1.1 ? 'CRÍTICO (Stockout)' : 'ESTÁVEL',
    marketShare: (salesVolume / (marketPotential * 8)) * 100
  };
};
