
import { DecisionData, Branch, EcosystemConfig, MarketIndicators, ProductDefinition, ServiceLevel, ProductionStrategy } from '../types';

/**
 * Empirion Advanced Economic Engine (v5.8 - Heavy Industry & Commercial Tactics)
 * Literatura Base: 
 * - MRP/MRP II: Orlicky's Material Requirements Planning
 * - JIT: Taiichi Ohno (Toyota Production System)
 * - OPT: Eliyahu Goldratt (Theory of Constraints)
 * - Business Round: Cournot Competition & Price Elasticity Models
 */

export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MarketIndicators
) => {
  const modality = ecoConfig.modalityType || 'standard';
  const round = 1; // Simplificado para exemplo, idealmente vem do estado do campeonato
  
  // --- 1. LÓGICA DE RODADA DE NEGÓCIOS (COMMERCIAL) ---
  let inflationFactor = 1.0;
  let priceElasticity = -1.8; // Padrão

  if (modality === 'business_round') {
    // Inflação Composta: Preço dos insumos sobe exponencialmente
    inflationFactor = Math.pow(1 + (ecoConfig.inflationRate || 0.04), round);
    // Elasticidade na Rodada de Negócios é muito maior (Guerra de Preços)
    priceElasticity = -2.8; 
  }

  // --- 2. LÓGICA DE EFICIÊNCIA DE FÁBRICA (INDUSTRIAL) ---
  const strategy = decisions.production.strategy || 'push_mrp';
  const automation = decisions.production.automation_level || 0;
  
  // Parâmetros de Literatura
  let inventoryHoldingCostRate = 0.15; // 15% ao mês (WACC + Armazenagem)
  let leadTimeFactor = 1.0;
  let setupTimePenalty = 0.2; // 20% da capacidade perdida em trocas de lote
  let scaleBonus = 1.0;

  if (modality === 'factory_efficiency') {
    switch(strategy) {
      case 'pull_kanban': // JUST-IN-TIME (Pull)
        inventoryHoldingCostRate = 0.04; // Estoque mínimo, custo baixo
        leadTimeFactor = 0.6; // Muito mais ágil (60% do tempo normal)
        setupTimePenalty = 0.05; // Foco em SMED (Troca Rápida de Ferramenta)
        scaleBonus = 0.9; // Perde eficiência em escala bruta
        break;
      
      case 'push_mrp': // MRP II (Push)
        inventoryHoldingCostRate = 0.25; // Altos estoques, custo financeiro pesado
        leadTimeFactor = 1.2; // Lead time longo devido a filas
        setupTimePenalty = 0.3; // Grandes lotes, trocas demoradas
        scaleBonus = 1.35; // Bônus massivo de escala (Economia de Escala)
        break;

      case 'opt': // THEORY OF CONSTRAINTS (Bottleneck)
        // O foco aqui é proteger o gargalo. Se a automação for no gargalo, ganho é 2x
        scaleBonus = 1.1 + (automation * 0.5); 
        inventoryHoldingCostRate = 0.12;
        break;
    }
  }

  // --- 3. CÁLCULO DE PRODUTIVIDADE E OEE ---
  const trainingEffect = (decisions.hr.trainingPercent / 100) * 0.4;
  const automationEffect = automation * 0.6;
  const staffEfficiency = 0.5 + trainingEffect + (decisions.hr.salary / 2000) * 0.2;
  
  // OEE = Disponibilidade * Performance * Qualidade
  const oee = Math.min(100, (staffEfficiency * 70) + (automation * 30));

  // --- 4. DEMANDA E MERCADO ---
  const avgPrice = Object.values(decisions.regions).reduce((acc, r) => acc + r.price, 0) / 9;
  const imageScore = Math.min(100, (Object.values(decisions.regions).reduce((acc, r) => acc + r.marketing, 0) * 2) + (oee * 0.4));
  
  // Fórmula de Demanda Exponencial
  const marketPotential = (indicators?.demand_regions[0] || 12000) * (ecoConfig.demandMultiplier || 1);
  const demand = marketPotential * Math.pow(avgPrice / 300, priceElasticity) * (1 + (imageScore - 50) / 100);

  // --- 5. RESULTADO FINANCEIRO ---
  const baseCost = 180 * inflationFactor; // Custo base inflacionado
  const variableCost = baseCost * (1 - (automation * 0.2)); // Automação reduz custo variável
  const capacity = 10000 * (decisions.production.activityLevel / 100) * scaleBonus * (oee / 100);
  
  const salesVolume = Math.min(demand, capacity);
  const revenue = salesVolume * avgPrice;
  
  const holdingCost = (decisions.production.purchaseMPA * inventoryHoldingCostRate);
  const fixedCost = 45000 + (automation * 30000); // Automação aumenta custo fixo (manutenção/amortização)
  
  const ebitda = revenue - (salesVolume * variableCost) - fixedCost - holdingCost;
  const netProfit = ebitda * 0.85; // Simplificado

  return {
    revenue,
    netProfit,
    salesVolume,
    oee,
    companyImage: imageScore,
    unitCost: (fixedCost + (salesVolume * variableCost)) / (salesVolume || 1),
    inventoryRisk: strategy === 'pull_kanban' && demand > capacity ? 'ALTO (Ruptura de Estoque)' : 'NORMAL',
    marketShare: (salesVolume / (marketPotential * 8)) * 100
  };
};
