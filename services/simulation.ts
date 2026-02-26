
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs, MachineInstance, AccountNode, MachineModel } from '../types';
import { INITIAL_FINANCIAL_TREE } from '../constants';

/**
 * EMPIRION SIMULATION KERNEL v18.8 - STATEFUL COST ACCOUNTING
 * Foco: Diferenciação de reajustes MP vs Inflação e Fluxo de Estoque WAC.
 */

export const sanitize = (val: any, fallback: number): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

// Busca valor de conta recursivamente na árvore financeira
const findAccountValue = (nodes: AccountNode[], id: string): number => {
  for (const node of nodes) {
    if (node.id === id) return node.value;
    if (node.children) {
      const val = findAccountValue(node.children, id);
      if (val !== undefined && val !== 0) return val;
    }
  }
  return 0;
};

// Injeta novos valores na árvore, recalculando totalizadores
const injectValues = (tree: AccountNode[], values: Record<string, number>): AccountNode[] => {
  return tree.map(node => {
    let newVal = values[node.id] !== undefined ? values[node.id] : node.value;
    let newChildren = node.children ? injectValues(node.children, values) : undefined;
    
    if (node.type === 'totalizer' && newChildren) {
      newVal = newChildren.reduce((sum, child) => {
        // Se for despesa ou passivo na árvore DRE/DFC, subtrai do totalizador
        if (child.type === 'expense' || child.type === 'liability') return sum - Math.abs(child.value);
        return sum + child.value;
      }, 0);
    }

    return { ...node, value: newVal, children: newChildren };
  });
};

export const calculateProjections = (
  decision: DecisionData,
  branch: Branch,
  ecosystem: EcosystemConfig,
  indicators: MacroIndicators,
  team: Team
): ProjectionResult => {
  // 0. RECUPERAR ESTADO ANTERIOR
  const prevStatements = team.kpis?.statements || INITIAL_FINANCIAL_TREE;
  const prevBS = prevStatements.balance_sheet || [];
  
  // --- 1. REAJUSTES TEMPORAIS ESPECÍFICOS ---
  // Inflação geral afeta Salários, Manutenção e Despesas Fixas
  const inflationMult = 1 + (sanitize(indicators.inflation_rate, 0) / 100);
  
  // Reajuste de MP é independente da inflação geral (conforme diretriz v18.8)
  const mpaPrice = indicators.prices.mp_a * (1 + (sanitize(indicators.raw_material_a_adjust, 0) / 100));
  const mpbPrice = indicators.prices.mp_b * (1 + (sanitize(indicators.raw_material_b_adjust, 0) / 100));
  
  const currentSalary = indicators.hr_base.salary * inflationMult;
  const socialChargesAttr = 1 + (sanitize(indicators.social_charges, 35) / 100);

  // --- 2. GESTÃO DE ATIVOS E DEPRECIAÇÃO (ABSORÇÃO) ---
  let currentMachines: MachineInstance[] = [...(team.kpis?.machines || [])];
  let periodDepreciation = 0;

  // Atualiza idade e depreciação acumulada das máquinas existentes
  currentMachines = currentMachines.map(m => {
    const spec = indicators.machine_specs[m.model];
    const depVal = m.acquisition_value / (spec?.useful_life_years || 40);
    periodDepreciation += depVal;
    return { ...m, age: m.age + 1, accumulated_depreciation: m.accumulated_depreciation + depVal };
  });

  // Depreciação de Prédios (Stateful) - 0.2% por período
  const buildingsCost = findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings') || 5440000;
  const prevBuildingsDeprec = Math.abs(findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings_deprec'));
  const buildingDepPeriod = buildingsCost * 0.002;
  const newBuildingsDeprecAccum = prevBuildingsDeprec + buildingDepPeriod;
  periodDepreciation += buildingDepPeriod;

  // --- 3. CÁLCULO DO CPP (CUSTO DO PRODUTO PRODUZIDO) ---
  const capacity = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.production_capacity || 0), 0);
  const activityLevel = sanitize(decision.production?.activityLevel, 100) / 100;
  const unitsProduced = Math.floor(capacity * activityLevel);

  // Mão de Obra Direta (MOD) reajustada por inflação
  const operatorsRequired = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.operators_required || 0), 0);
  const totalMOD = (operatorsRequired * currentSalary * socialChargesAttr) * activityLevel;

  // Matéria-Prima Consumida (Com reajuste específico de MP A/B)
  const totalMP = (unitsProduced * mpaPrice) + (unitsProduced * mpbPrice);

  // Manutenção Industrial (GGF reajustado por inflação)
  const maintenance = capacity * 2.5 * inflationMult; 

  // TOTAL CPP = MP (Reajuste Específico) + MOD (Inflação) + Depreciação (Histórica) + Manutenção (Inflação)
  const totalCPP = totalMP + totalMOD + periodDepreciation + maintenance;
  const unitCPP = unitsProduced > 0 ? totalCPP / unitsProduced : 0;

  // --- 4. GESTÃO DE ESTOQUE E CPV (MÉTODO WAC) ---
  const prevStockQty = sanitize(team.kpis?.stock_quantities?.finished_goods, 0);
  const prevStockValue = findAccountValue(prevBS, 'assets.current.stock.pa');
  
  // Novo Valor e Quantidade Total para Média Ponderada
  const totalQtyForSale = prevStockQty + unitsProduced;
  const totalValueInInventory = prevStockValue + totalCPP;
  const wacUnit = totalQtyForSale > 0 ? totalValueInInventory / totalQtyForSale : unitCPP;

  // Demanda e Vendas
  const firstRegionId = Object.keys(decision.regions || {})[0] || 1;
  const price = sanitize(decision.regions?.[Number(firstRegionId)]?.price, 425);
  // Algoritmo de demanda simples para o Cockpit
  const priceIndex = indicators.avg_selling_price / price;
  const unitsSold = Math.min(totalQtyForSale, Math.floor((capacity * 0.8) * priceIndex * (1 + (indicators.demand_variation / 100))));

  // CPV (Custo do Produto Vendido)
  const totalCPV = unitsSold * wacUnit;
  const closingStockPA = totalQtyForSale - unitsSold;
  const closingStockValuePA = closingStockPA * wacUnit;

  // --- 5. RESULTADOS FINANCEIROS ---
  const revenue = unitsSold * price;
  const opex = 160000 * inflationMult; // Despesas fixas sob inflação
  const operatingProfit = revenue - totalCPV - opex;
  const netProfit = operatingProfit * 0.75; 
  
  const finalCash = sanitize(team.kpis?.current_cash, 0) + revenue - totalCPV - opex;

  // --- 6. ATUALIZAÇÃO DA ESTRUTURA CONTÁBIL ---
  const bsValues = {
    'assets.current.cash': finalCash,
    'assets.current.stock.pa': closingStockValuePA,
    'assets.noncurrent.fixed.machines_deprec': -(currentMachines.reduce((acc, m) => acc + m.accumulated_depreciation, 0)),
    'assets.noncurrent.fixed.buildings_deprec': -newBuildingsDeprecAccum,
    'equity.profit': netProfit
  };

  const finalBS = injectValues(JSON.parse(JSON.stringify(prevBS)), bsValues);

  // --- 7. CÁLCULO DE MÉTRICAS AVANÇADAS (ESTRATÉGICAS) ---
  const totalAssets = findAccountValue(finalBS, 'assets');
  const totalEquity = findAccountValue(finalBS, 'equity');
  const netMargin = revenue > 0 ? netProfit / revenue : 0;
  const assetTurnover = totalAssets > 0 ? revenue / totalAssets : 0;
  const leverage = totalEquity > 0 ? totalAssets / totalEquity : 1;

  // Ciclo de Conversão de Caixa (Simplificado para Projeção)
  const pmr = 30; // Prazo médio de recebimento padrão
  const pme = totalCPV > 0 ? (closingStockValuePA / totalCPV) * 90 : 0;
  const pmp = 45; // Prazo médio de pagamento padrão
  const ccc = pme + pmr - pmp;

  // Cobertura de Juros
  const finExp = Math.abs(findAccountValue(prevStatements.dre, 'fin.exp') || 2500);
  const interestCoverage = finExp > 0 ? operatingProfit / finExp : 100;

  // Elasticidade-Preço (Comparativo com round anterior)
  const prevPrice = team.kpis?.last_price || indicators.avg_selling_price;
  const priceChange = (price - prevPrice) / prevPrice;
  const demandChange = (unitsSold - (team.kpis?.last_units_sold || unitsSold)) / (team.kpis?.last_units_sold || unitsSold || 1);
  const priceElasticity = priceChange !== 0 ? Math.abs(demandChange / priceChange) : 1;

  // Landed Cost e CAC Regional
  const regionalCac: Record<number, number> = {};
  const landedCosts: Record<number, number> = {};
  
  Object.entries(decision.regions || {}).forEach(([id, reg]: [string, any]) => {
    const regId = Number(id);
    const regUnits = unitsSold; // Simplificado: assume venda proporcional ou total na primeira região no cockpit
    regionalCac[regId] = regUnits > 0 ? sanitize(reg.marketing, 0) / regUnits : 0;
    landedCosts[regId] = unitCPP + (regionalCac[regId] * 1.2); // Adiciona margem de logística/tarifas
  });

  // Pegada de Carbono (0.8kg CO2 por unidade + logística)
  const carbonFootprint = (unitsProduced * 0.8) + (unitsSold * 0.2);

  return {
    revenue, netProfit, debtRatio: 0, creditRating: 'AAA',
    health: { cash: finalCash, rating: 'AAA' },
    marketShare: 12.5,
    statements: {
      dre: injectValues(JSON.parse(JSON.stringify(prevStatements.dre)), { 
        'rev': revenue, 
        'cpv': -totalCPV, 
        'operating_profit': operatingProfit, 
        'final_profit': netProfit 
      }),
      cash_flow: injectValues(JSON.parse(JSON.stringify(prevStatements.cash_flow)), { 'cf.final': finalCash }),
      balance_sheet: finalBS
    },
    kpis: {
      ...team.kpis,
      current_cash: finalCash,
      machines: currentMachines,
      stock_quantities: { 
        mp_a: (team.kpis?.stock_quantities?.mp_a || 0) + sanitize(decision.production?.purchaseMPA, 0) - unitsProduced, 
        mp_b: (team.kpis?.stock_quantities?.mp_b || 0) + sanitize(decision.production?.purchaseMPB, 0) - unitsProduced, 
        finished_goods: closingStockPA 
      },
      cpp_unit: unitCPP,
      wac_unit: wacUnit,
      ebitda: operatingProfit + periodDepreciation,
      fixed_assets_value: (findAccountValue(finalBS, 'assets.noncurrent.fixed.machines') + buildingsCost + 1200000) - periodDepreciation,
      
      // Novos KPIs Estratégicos
      total_assets: totalAssets,
      equity: totalEquity,
      stock_value: closingStockValuePA,
      ccc,
      interest_coverage: interestCoverage,
      dupont: {
        margin: netMargin,
        turnover: assetTurnover,
        leverage: leverage
      },
      landed_costs: landedCosts,
      price_elasticity: priceElasticity,
      regional_cac: regionalCac,
      carbon_footprint: carbonFootprint,
      last_price: price,
      last_units_sold: unitsSold,
      // Indicadores de Moeda e Tarifas (v18.8)
      brl_rate: indicators.BRL || 1,
      gbp_rate: indicators.GBP || 0,
      export_tariff_brazil: indicators.export_tariff_brazil || 0,
      export_tariff_uk: indicators.export_tariff_uk || 0
    }
  };
};
