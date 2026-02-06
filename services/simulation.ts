
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, Loan, AccountNode, Championship, InitialMachine, RegionalData } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * CORE ORACLE ENGINE v15.86 - DEPRECIATION & BOOK VALUE FIDELITY
 * Gerencia o Ativo Imobilizado e a erosão de valor por período.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  baseIndicators: MacroIndicators,
  previousState?: any,
  roundHistory: any[] = [],
  currentRound: number = 1,
  roundRules?: Record<number, Partial<MacroIndicators>>,
  forcedShare?: number,
  championshipData?: Championship
): ProjectionResult => {
  
  // 0. SELEÇÃO DE REGRAS (Prioridade total ao Round atual do Cronograma)
  const lookupRound = Math.min(currentRound, 12);
  const indicators = { 
    ...DEFAULT_MACRO, 
    ...baseIndicators, 
    ...(roundRules?.[lookupRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[lookupRound] || {}) 
  };

  const prevBS = previousState?.kpis?.statements?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  
  const getVal = (id: string, list: any[]): number => {
    if (!list) return 0;
    for (const item of list) {
        if (item.id === id) return item.value;
        if (item.children) {
            const res = getVal(id, item.children);
            if (res !== 0) return res;
        }
    }
    return 0;
  };

  // --- 1. SALDOS INICIAIS E IMOBILIZADO ---
  const prevCash = sanitize(previousState?.current_cash ?? getVal('assets.current.cash', prevBS), 0);
  const prevEquity = sanitize(previousState?.equity || 7252171.74);
  
  // Imobilizado Anterior
  const grossBuildings = 5440000;
  const prevAccumDeprecBuildings = Math.abs(getVal('assets.noncurrent.fixed.buildings_deprec', prevBS));
  const grossMachines = sanitize(getVal('assets.noncurrent.fixed.machines', prevBS), 2360000);
  const prevAccumDeprecMachines = Math.abs(getVal('assets.noncurrent.fixed.machines_deprec', prevBS));

  // --- 2. CÁLCULO DE DEPRECIAÇÃO DO PERÍODO (P01-P12) ---
  const periodDeprecBuildings = round2(grossBuildings * 0.005); // 0.5% por round
  
  // Depreciação de máquinas baseada no mix decidido e histórico
  const machineDeprecRate = indicators.machine_specs?.alfa?.depreciation_rate || 0.025;
  const periodDeprecMachines = round2(grossMachines * machineDeprecRate);
  
  const totalDepreciationExpense = round2(periodDeprecBuildings + periodDeprecMachines);

  // --- 3. CAPEX (COMPRA/VENDA) ---
  let capexInflow = 0;
  let capexOutflow = 0;
  let newMachinesValue = 0;
  let soldMachinesValue = 0;

  // Compras
  if (decisions.machinery?.buy) {
    const buyA = sanitize(decisions.machinery.buy.alfa) * indicators.machinery_values.alfa;
    const buyB = sanitize(decisions.machinery.buy.beta) * indicators.machinery_values.beta;
    const buyG = sanitize(decisions.machinery.buy.gama) * indicators.machinery_values.gama;
    capexOutflow = round2(buyA + buyB + buyG);
    newMachinesValue = capexOutflow;
  }

  // Vendas (Simuladas por simplificação de valor venal)
  if (decisions.machinery?.sell) {
    const sellCount = sanitize(decisions.machinery.sell.alfa) + sanitize(decisions.machinery.sell.beta) + sanitize(decisions.machinery.sell.gama);
    if (sellCount > 0) {
      // Valor de venda = 40% do valor de custo (Impairment forçado pelo mercado)
      const avgValuePerMachine = grossMachines / 5; // Baseado no mix inicial de 5 máquinas
      soldMachinesValue = round2(sellCount * avgValuePerMachine);
      capexInflow = round2(soldMachinesValue * (1 - (indicators.machine_sale_discount / 100)));
    }
  }

  // --- 4. COMPRAS MP E CUSTO MÉDIO ---
  const vatRatePurch = sanitize(indicators.vat_purchases_rate, 0) / 100;
  const qtyPurchA = sanitize(decisions.production.purchaseMPA);
  const rawMaterialAdjust = sanitize(indicators.raw_material_a_adjust, 1.0);
  const purchA_GrossTotal = (qtyPurchA * indicators.prices.mp_a * rawMaterialAdjust) * (1 + (indicators.supplier_interest/100));
  const purchA_NetIVA = purchA_GrossTotal / (1 + vatRatePurch);
  const vatPurchA = purchA_GrossTotal - purchA_NetIVA;

  const stockValueA_Start = sanitize(getVal('assets.current.stock.mpa', prevBS));
  const stockQtyA_Start = currentRound === 1 ? 30000 : sanitize(previousState?.kpis?.stock_quantities?.mpa, 30000);
  const wacA = (stockValueA_Start + purchA_NetIVA) / Math.max(1, stockQtyA_Start + qtyPurchA);

  const activityLevel = sanitize(decisions.production.activityLevel, 80) / 100;
  const unitsToProduce = 10000 * activityLevel;
  const consumeA = unitsToProduce * 1;
  const cpv_material = (consumeA * wacA);
  const stockQtyA_End = Math.max(0, stockQtyA_Start + qtyPurchA - consumeA);
  const stockValueA_End = round2(stockQtyA_End * wacA);

  // --- 5. FOLHA E OPERACIONAL (INFLATION LINKED) ---
  const inflationFactor = 1 + (sanitize(indicators.inflation_rate, 1.0) / 100);
  const baseSalary = sanitize(decisions.hr.salary, 2000);
  const totalPayrollWithCharges = (470 * baseSalary * inflationFactor) * (1 + sanitize(indicators.social_charges, 35.0)/100);

  // --- 6. VENDAS E CAIXA (ICE & DEFAULT LINKED) ---
  const defaultRate = sanitize(indicators.customer_default_rate, 2.6) / 100;
  const iceFactor = sanitize(indicators.ice, 3.0) / 3.0;
  
  let totalRevenueGross = 0;
  let totalQuantitySold = 0;

  Object.entries(decisions.regions).forEach(([id, reg]: [string, any]) => {
    const price = sanitize(reg.price, 425);
    const demandFactor = Math.pow(425 / Math.max(1, price), 1.2) * (1 + (indicators.demand_variation || 0)/100) * iceFactor;
    const qty = (9700 / 4) * demandFactor * activityLevel;
    totalQuantitySold += qty;
    totalRevenueGross += round2(price * qty);
  });

  // --- 7. DRE (DEPRECIAÇÃO INTEGRADA) ---
  const netSalesRevenue = round2(totalRevenueGross * 0.85); // 15% IVA médio
  const cpv_total = round2(cpv_material + (totalPayrollWithCharges * 0.4));
  const opex_total = round2((totalPayrollWithCharges * 0.6) + (netSalesRevenue * 0.05) + totalDepreciationExpense);
  
  const operatingProfit = round2(netSalesRevenue - cpv_total - opex_total);
  const finalNetProfit = round2(operatingProfit - 2500);

  // --- 8. BALANÇO PATRIMONIAL PROJETADO ---
  const currentReceivables = round2(totalRevenueGross * 0.5);
  const projectedCash = round2(prevCash + (totalRevenueGross * 0.5 * (1 - defaultRate)) + capexInflow - totalPayrollWithCharges - capexOutflow);

  // Novos Valores Imobilizado
  const finalGrossMachines = round2(grossMachines + newMachinesValue - soldMachinesValue);
  const finalAccumDeprecBuildings = round2(prevAccumDeprecBuildings + periodDeprecBuildings);
  const finalAccumDeprecMachines = round2(prevAccumDeprecMachines + periodDeprecMachines);
  const totalImobilizadoNet = round2(grossBuildings - finalAccumDeprecBuildings + (finalGrossMachines - finalAccumDeprecMachines) + 1200000);

  // Fix: Added missing 'loans' property to satisfy KPIs interface requirement
  const kpis: KPIs = {
    rating: projectedCash > 0 && finalNetProfit > 0 ? 'AAA' : 'B',
    loans: previousState?.kpis?.loans || [],
    current_cash: projectedCash,
    equity: round2(prevEquity + finalNetProfit),
    stock_quantities: { mpa: stockQtyA_End, mpb: 20000 },
    statements: {
      dre: { revenue: totalRevenueGross, net_profit: finalNetProfit, deprec_expense: totalDepreciationExpense },
      balance_sheet: [
        { id: 'assets', label: 'ATIVO', value: round2(projectedCash + stockValueA_End + currentReceivables + totalImobilizadoNet), children: [
            { id: 'assets.current', label: 'CIRCULANTE', value: round2(projectedCash + stockValueA_End + currentReceivables), children: [
                { id: 'assets.current.cash', label: 'Caixa', value: projectedCash, type: 'asset' },
                { id: 'assets.current.clients', label: 'Clientes', value: currentReceivables, type: 'asset' },
                { id: 'assets.current.stock.mpa', label: 'Estoque MP', value: stockValueA_End, type: 'asset' }
            ]},
            { id: 'assets.noncurrent', label: 'IMOBILIZADO (LÍQUIDO)', value: totalImobilizadoNet, children: [
                { id: 'assets.noncurrent.fixed.buildings', label: 'Prédios Bruto', value: grossBuildings, type: 'asset' },
                { id: 'assets.noncurrent.fixed.buildings_deprec', label: '(-) Deprec. Prédios', value: -finalAccumDeprecBuildings, type: 'asset' },
                { id: 'assets.noncurrent.fixed.machines', label: 'Máquinas Bruto', value: finalGrossMachines, type: 'asset' },
                { id: 'assets.noncurrent.fixed.machines_deprec', label: '(-) Deprec. Máquinas', value: -finalAccumDeprecMachines, type: 'asset' }
            ]}
        ]},
        { id: 'liabilities_pl', label: 'PASSIVO + PL', value: round2(prevEquity + finalNetProfit + 2000000), children: [
            { id: 'equity', label: 'PATRIMÔNIO LÍQUIDO', value: round2(prevEquity + finalNetProfit), type: 'totalizer' }
        ]}
      ]
    }
  };

  return {
    revenue: totalRevenueGross, netProfit: finalNetProfit, 
    debtRatio: 25, creditRating: kpis.rating, 
    health: { cash: projectedCash, rating: kpis.rating },
    kpis, statements: kpis.statements, marketShare: (totalQuantitySold / 9700) * 11.1
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
