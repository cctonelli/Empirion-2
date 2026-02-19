
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs, MachineInstance, AccountNode, MachineModel } from '../types';
import { INITIAL_FINANCIAL_TREE } from '../constants';

/**
 * EMPIRION SIMULATION KERNEL v18.7 - ADVANCED ASSET TELEMETRY
 * Foco: Fidelidade na Depreciação Acumulada e Valor Contábil Líquido (VCL).
 */

export const sanitize = (val: any, fallback: number): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

export const round2 = (val: number): number => Math.round(val * 100) / 100;

const findAccountValue = (nodes: AccountNode[], id: string): number => {
  for (const node of nodes) {
    if (node.id === id) return node.value;
    if (node.children) {
      const val = findAccountValue(node.children, id);
      if (val !== undefined) return val;
    }
  }
  return 0;
};

const injectValues = (tree: AccountNode[], values: Record<string, number>): AccountNode[] => {
  return tree.map(node => {
    let newVal = values[node.id] !== undefined ? values[node.id] : node.value;
    let newChildren = node.children ? injectValues(node.children, values) : undefined;
    
    if (node.type === 'totalizer' && newChildren) {
      newVal = newChildren.reduce((sum, child) => {
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
  const prevStatements = team.kpis?.statements || INITIAL_FINANCIAL_TREE;
  const prevBS = prevStatements.balance_sheet || [];
  
  // 1. REAJUSTE DE PREÇOS DE MERCADO
  const getMachineMarketPrice = (model: MachineModel) => {
    const base = indicators.machinery_values[model] || 0;
    const adjust = sanitize((indicators as any)[`machine_${model}_price_adjust`], 0);
    return base * (1 + (adjust / 100));
  };

  // 2. GESTÃO DE IMOBILIZADO (CAPEX + EDIFICAÇÕES)
  let currentMachines: MachineInstance[] = [...(team.kpis?.machines || [])];
  let totalPeriodDepreciation = 0;
  let nonOperatingLoss = 0;
  let cashFromSales = 0;

  // Processamento de Venda de Ativos
  const sellOrders = decision.machinery.sell || { alfa: 0, beta: 0, gama: 0 };
  Object.entries(sellOrders).forEach(([model, qty]) => {
    for(let i = 0; i < (qty as number); i++) {
      const idx = currentMachines.findIndex(m => m.model === model);
      if (idx !== -1) {
        const m = currentMachines[idx];
        const vcl = m.acquisition_value - m.accumulated_depreciation;
        const saleValue = vcl * (1 - (indicators.machine_sale_discount / 100));
        nonOperatingLoss += (vcl - saleValue);
        cashFromSales += saleValue;
        currentMachines.splice(idx, 1);
      }
    }
  });

  // Depreciação de Máquinas (Linear Individualizada)
  currentMachines = currentMachines.map(m => {
    const spec = indicators.machine_specs[m.model];
    const periodDep = m.acquisition_value / (spec?.useful_life_years || 40);
    totalPeriodDepreciation += periodDep;
    return { ...m, age: m.age + 1, accumulated_depreciation: m.accumulated_depreciation + periodDep };
  });

  // Depreciação de Prédios e Instalações (Stateful)
  const buildingsCost = findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings');
  const prevBuildingsDeprec = Math.abs(findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings_deprec'));
  const buildingPeriodDep = buildingsCost * 0.002; // 0.2% por round
  const newBuildingsDeprecAccum = prevBuildingsDeprec + buildingPeriodDep;
  totalPeriodDepreciation += buildingPeriodDep;

  // Aquisição de Novas Máquinas
  const buyOrders = decision.machinery.buy || { alfa: 0, beta: 0, gama: 0 };
  let capexOutflow = 0;
  Object.entries(buyOrders).forEach(([model, qty]) => {
    const mPrice = getMachineMarketPrice(model as MachineModel);
    capexOutflow += (qty as number) * mPrice;
    for(let i = 0; i < (qty as number); i++) {
      currentMachines.push({
        id: `m-${Date.now()}-${i}`,
        model: model as MachineModel,
        age: 0,
        acquisition_value: mPrice,
        accumulated_depreciation: 0
      });
    }
  });

  // 3. MOVIMENTAÇÃO DE ESTOQUE
  const unitsProduced = Math.floor(currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.production_capacity || 0), 0) * (sanitize(decision.production?.activityLevel, 100) / 100));
  const closingMPA = (team.kpis?.stock_quantities?.mp_a || 0) + sanitize(decision.production?.purchaseMPA, 0) - unitsProduced;
  const closingMPB = (team.kpis?.stock_quantities?.mp_b || 0) + sanitize(decision.production?.purchaseMPB, 0) - unitsProduced;
  const stockValue = (closingMPA * indicators.prices.mp_a) + (closingMPB * indicators.prices.mp_b);

  // 4. RESULTADOS FINANCEIROS
  const revenue = unitsProduced * (sanitize(Object.values(decision.regions || {})[0]?.price, 425));
  const cogs = unitsProduced * (indicators.prices.mp_a + indicators.prices.mp_b + 50);
  const operatingProfit = revenue - cogs - (totalPeriodDepreciation + 160000);
  const netProfit = (operatingProfit - nonOperatingLoss) * 0.75;
  const finalCash = sanitize(team.kpis?.current_cash, 0) + revenue - cogs - (160000) - capexOutflow + cashFromSales;

  // 5. CÁLCULO DE TELEMETRIA CAPEX (VCL)
  const totalMachinesCost = currentMachines.reduce((acc, m) => acc + m.acquisition_value, 0);
  const totalMachinesDeprecAccum = currentMachines.reduce((acc, m) => acc + m.accumulated_depreciation, 0);
  const totalAccumulatedDeprec = totalMachinesDeprecAccum + newBuildingsDeprecAccum;
  const totalFixedAssetsCost = totalMachinesCost + buildingsCost + findAccountValue(prevBS, 'assets.noncurrent.fixed.land');
  const netBookValue = totalFixedAssetsCost - totalAccumulatedDeprec;

  const bsValues = {
    'assets.current.cash': finalCash,
    'assets.current.stock.mpa': closingMPA * indicators.prices.mp_a,
    'assets.current.stock.mpb': closingMPB * indicators.prices.mp_b,
    'assets.noncurrent.fixed.machines': totalMachinesCost,
    'assets.noncurrent.fixed.machines_deprec': -totalMachinesDeprecAccum,
    'assets.noncurrent.fixed.buildings_deprec': -newBuildingsDeprecAccum,
    'equity.profit': netProfit
  };

  const finalBS = injectValues(JSON.parse(JSON.stringify(prevBS)), bsValues);

  return {
    revenue, netProfit, debtRatio: 0, creditRating: 'AAA',
    health: { cash: finalCash, rating: 'AAA' },
    marketShare: 12.5,
    statements: {
      dre: injectValues(JSON.parse(JSON.stringify(prevStatements.dre)), { 'rev': revenue, 'cpv': cogs, 'operating_profit': operatingProfit, 'final_profit': netProfit }),
      cash_flow: injectValues(JSON.parse(JSON.stringify(prevStatements.cash_flow)), { 'cf.final': finalCash }),
      balance_sheet: finalBS
    },
    kpis: {
      ...team.kpis,
      current_cash: finalCash,
      machines: currentMachines,
      stock_quantities: { mp_a: closingMPA, mp_b: closingMPB, finished_goods: 0 },
      fixed_assets_value: netBookValue, // VALOR CONTÁBIL LÍQUIDO PERSISTIDO
      fixed_assets_depreciation: -totalAccumulatedDeprec, // DEPRECIAÇÃO ACUMULADA PERSISTIDA
      total_assets: finalBS.find(n => n.id === 'assets')?.value || 0
    }
  };
};
