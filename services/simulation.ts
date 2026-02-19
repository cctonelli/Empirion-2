
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs, MachineInstance, AccountNode, MachineModel } from '../types';
import { INITIAL_FINANCIAL_TREE } from '../constants';

/**
 * EMPIRION SIMULATION KERNEL v18.5 - PLATINUM ASSET MANAGEMENT
 * Motor determinístico de alta fidelidade com gestão de ativos e depreciação técnica.
 */

export const sanitize = (val: any, fallback: number): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

export const round2 = (val: number): number => Math.round(val * 100) / 100;

const injectValues = (tree: AccountNode[], values: Record<string, number>): AccountNode[] => {
  return tree.map(node => {
    let newVal = values[node.id] !== undefined ? values[node.id] : node.value;
    let newChildren = node.children ? injectValues(node.children, values) : undefined;
    
    if (node.type === 'totalizer' && newChildren) {
      newVal = newChildren.reduce((sum, child) => {
        // No DRE e DFC, despesas/saídas são subtraídas
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
  const regions = decision.regions || {};
  const reg1 = regions[1] || { price: 425, marketing: 0, term: 0 };
  const price = sanitize(reg1.price, indicators.avg_selling_price || 425);
  
  // 1. REAJUSTE DE PREÇOS DE MERCADO (Novas Máquinas)
  // Aplica o ajuste acumulado definido nas chaves macroKey
  const getMachineMarketPrice = (model: MachineModel) => {
    const base = indicators.machinery_values[model] || 0;
    const adjustKey = `machine_${model}_price_adjust`;
    const adjust = sanitize((indicators as any)[adjustKey], 0);
    return base * (1 + (adjust / 100));
  };

  // 2. GESTÃO DE ATIVOS E DEPRECIAÇÃO (MÁQUINA POR MÁQUINA)
  let currentMachines: MachineInstance[] = [...(team.kpis?.machines || [])];
  let totalPeriodDepreciation = 0;
  let totalAccumulatedDepreciation = 0;
  let totalAcquisitionValue = 0;
  let nonOperatingLoss = 0; // Deságio na venda (DRE)
  let cashFromSales = 0;    // Valor líquido recebido (DFC)

  // PROCESSAR ORDENS DE VENDA (Vende as máquinas mais antigas primeiro por modelo)
  const sellOrders = decision.machinery.sell || { alfa: 0, beta: 0, gama: 0 };
  Object.entries(sellOrders).forEach(([model, qty]) => {
    for(let i = 0; i < (qty as number); i++) {
      const idx = currentMachines.findIndex(m => m.model === model);
      if (idx !== -1) {
        const m = currentMachines[idx];
        const vcl = m.acquisition_value - m.accumulated_depreciation; // Valor Contábil Líquido
        const discount = (indicators.machine_sale_discount || 10) / 100;
        const saleValue = vcl * (1 - discount);
        
        nonOperatingLoss += (vcl - saleValue); // Perda contábil que vai para o DRE
        cashFromSales += saleValue; // Entrada de caixa que vai para o DFC
        currentMachines.splice(idx, 1);
      }
    }
  });

  // CALCULAR DEPRECIAÇÃO LINEAR DO PERÍODO E ATUALIZAR PARQUE
  currentMachines = currentMachines.map(m => {
    const spec = indicators.machine_specs[m.model];
    const usefulLife = spec?.useful_life_years || 40; // rounds/períodos
    const periodDep = m.acquisition_value / usefulLife; 
    
    totalPeriodDepreciation += periodDep;
    const newAccum = m.accumulated_depreciation + periodDep;
    totalAcquisitionValue += m.acquisition_value;
    totalAccumulatedDepreciation += newAccum;

    return { ...m, age: m.age + 1, accumulated_depreciation: newAccum };
  });

  // PROCESSAR NOVAS AQUISIÇÕES
  const buyOrders = decision.machinery.buy || { alfa: 0, beta: 0, gama: 0 };
  let capexOutflow = 0;
  Object.entries(buyOrders).forEach(([model, qty]) => {
    const mPrice = getMachineMarketPrice(model as MachineModel);
    const cost = (qty as number) * mPrice;
    capexOutflow += cost;
    
    for(let i = 0; i < (qty as number); i++) {
      const newMachine: MachineInstance = {
        id: `m-${Date.now()}-${i}`,
        model: model as MachineModel,
        age: 0,
        acquisition_value: mPrice,
        accumulated_depreciation: 0
      };
      currentMachines.push(newMachine);
      totalAcquisitionValue += mPrice;
    }
  });

  // 3. OPERAÇÃO (Simplificada para foco em CAPEX)
  const unitsProduced = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.production_capacity || 0), 0) * (sanitize(decision.production?.activityLevel, 100) / 100);
  const revenue = unitsProduced * price;
  const cogs = unitsProduced * ((indicators.prices?.mp_a || 20) + (indicators.prices?.mp_b || 40));
  const grossProfit = revenue - cogs;
  const opex = (indicators.prices?.marketing_campaign || 10000) + totalPeriodDepreciation;
  const operatingProfit = grossProfit - opex;

  // 4. RESULTADO LÍQUIDO E FINANCEIRO
  const netProfit = (operatingProfit - nonOperatingLoss) * 0.75; // Incidência de IR fictícia
  const currentCash = sanitize(team.kpis?.current_cash, 0);
  const finalCash = currentCash + revenue - cogs - (opex - totalPeriodDepreciation) - capexOutflow + cashFromSales;
  const finalEquity = (team.equity || 7252171.74) + netProfit;

  // 5. INJEÇÃO DE DADOS NOS DEMONSTRATIVOS ORACLE
  const dreValues: Record<string, number> = {
    'rev': revenue,
    'cpv': cogs,
    'gross_profit': grossProfit,
    'opex.adm': opex - totalPeriodDepreciation,
    'operating_profit': operatingProfit,
    'non_op.exp': nonOperatingLoss, // PERDA NA VENDA (DESÁGIO)
    'final_profit': netProfit
  };

  const cfValues: Record<string, number> = {
    'cf.start': currentCash,
    'cf.inflow.cash_sales': revenue,
    'cf.inflow.machine_sales': cashFromSales, // VALOR LÍQUIDO RECEBIDO
    'cf.outflow.machine_buy': capexOutflow,
    'cf.final': finalCash
  };

  const bsValues: Record<string, number> = {
    'assets.current.cash': finalCash,
    'assets.noncurrent.fixed.machines': totalAcquisitionValue,
    'assets.noncurrent.fixed.machines_deprec': totalAccumulatedDepreciation, // DEPRECIAÇÃO ACUMULADA REAL
    'equity.profit': netProfit
  };

  return {
    revenue, netProfit, debtRatio: 0, creditRating: 'AAA',
    health: { cash: finalCash, rating: 'AAA' },
    marketShare: 12.5,
    statements: {
      dre: injectValues(JSON.parse(JSON.stringify(INITIAL_FINANCIAL_TREE.dre)), dreValues),
      cash_flow: injectValues(JSON.parse(JSON.stringify(INITIAL_FINANCIAL_TREE.cash_flow)), cfValues),
      balance_sheet: injectValues(JSON.parse(JSON.stringify(INITIAL_FINANCIAL_TREE.balance_sheet)), bsValues)
    },
    kpis: {
      ...team.kpis,
      equity: finalEquity,
      current_cash: finalCash,
      machines: currentMachines,
      tsr: round2(((finalEquity - 7252171.74) / 7252171.74) * 100),
      ebitda: operatingProfit + totalPeriodDepreciation
    }
  };
};
