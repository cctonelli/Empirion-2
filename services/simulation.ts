
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, Loan, AccountNode, Championship, InitialMachine, RegionalData } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * CORE ORACLE ENGINE v15.85 - CHRONOGRAM FIDELITY LINK
 * Garante que todos os 12 períodos do cronograma afetem os resultados.
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

  // --- 1. SALDOS E LIQUIDEZ ---
  const prevCash = sanitize(previousState?.current_cash ?? getVal('assets.current.cash', prevBS), 0);
  const prevEquity = sanitize(previousState?.equity || 7252171.74);
  const investmentReturnRate = sanitize(indicators.investment_return_rate, 1.0) / 100;
  const financialRevenue = prevCash > 0 ? round2(prevCash * investmentReturnRate) : 0;

  const legacyReceivables = sanitize(getVal('assets.current.clients', prevBS));
  const legacyPayables = sanitize(getVal('liabilities.current.suppliers', prevBS));
  const legacyVatPayable = sanitize(getVal('liabilities.current.vat_payable', prevBS));
  const legacyTaxPayable = sanitize(getVal('liabilities.current.taxes', prevBS));
  const legacyDividends = sanitize(getVal('liabilities.current.dividends', prevBS));
  const legacyVatRecoverable = sanitize(getVal('assets.current.vat_recoverable', prevBS));

  // --- 2. COMPRAS E CUSTO MÉDIO (WAC) ---
  const vatRatePurch = sanitize(indicators.vat_purchases_rate, 0) / 100;
  const supplierInterestRate = sanitize(indicators.supplier_interest, 1.5) / 100;

  const qtyPurchA = sanitize(decisions.production.purchaseMPA);
  const rawMaterialAdjust = sanitize(indicators.raw_material_a_adjust, 1.0);
  const purchA_GrossTotal = (qtyPurchA * indicators.prices.mp_a * rawMaterialAdjust) * (1 + supplierInterestRate);
  const purchA_NetIVA = purchA_GrossTotal / (1 + vatRatePurch);
  const vatPurchA = purchA_GrossTotal - purchA_NetIVA;

  const qtyPurchB = sanitize(decisions.production.purchaseMPB);
  const purchB_GrossTotal = (qtyPurchB * indicators.prices.mp_b * rawMaterialAdjust) * (1 + supplierInterestRate);
  const purchB_NetIVA = purchB_GrossTotal / (1 + vatRatePurch);
  const vatPurchB = purchB_GrossTotal - purchB_NetIVA;

  const stockValueA_Start = sanitize(getVal('assets.current.stock.mpa', prevBS));
  const stockQtyA_Start = currentRound === 1 ? 30000 : sanitize(previousState?.kpis?.stock_quantities?.mpa, 30000);
  const wacA = (stockValueA_Start + purchA_NetIVA) / Math.max(1, stockQtyA_Start + qtyPurchA);

  const stockValueB_Start = sanitize(getVal('assets.current.stock.mpb', prevBS));
  const stockQtyB_Start = currentRound === 1 ? 20000 : sanitize(previousState?.kpis?.stock_quantities?.mpb, 20000);
  const wacB = (stockValueB_Start + purchB_NetIVA) / Math.max(1, stockQtyB_Start + qtyPurchB);

  const activityLevel = sanitize(decisions.production.activityLevel, 80) / 100;
  const unitsToProduce = 10000 * activityLevel;
  const consumeA = unitsToProduce * 1;
  const consumeB = unitsToProduce * 0.5;
  const cpv_material = (consumeA * wacA) + (consumeB * wacB);

  const stockQtyA_End = Math.max(0, stockQtyA_Start + qtyPurchA - consumeA);
  const stockValueA_End = round2(stockQtyA_End * wacA);
  const stockQtyB_End = Math.max(0, stockQtyB_Start + qtyPurchB - consumeB);
  const stockValueB_End = round2(stockQtyB_End * wacB);

  // --- 3. FOLHA E OPERACIONAL (INFLATION LINKED) ---
  const inflationFactor = 1 + (sanitize(indicators.inflation_rate, 1.0) / 100);
  const staffing = indicators.staffing || DEFAULT_MACRO.staffing;
  const baseSalary = sanitize(decisions.hr.salary, 2000);
  const modCount = staffing.production.count + sanitize(decisions.hr.hired) - sanitize(decisions.hr.fired);
  const payrollBase = ((staffing.sales.count * baseSalary * 4) + (staffing.admin.count * baseSalary * 4) + (modCount * baseSalary * 1)) * inflationFactor;
  const totalPayrollWithCharges = payrollBase * (1 + sanitize(indicators.social_charges, 35.0)/100);
  const trainingExpense = round2(payrollBase * (sanitize(decisions.hr.trainingPercent, 0) / 100));

  // --- 4. VENDAS E APURAÇÃO FISCAL (ICE & EXPORT LINKED) ---
  const vatRateSales = sanitize(indicators.vat_sales_rate, 0) / 100;
  const iceFactor = sanitize(indicators.ice, 3.0) / 3.0; 
  const defaultRate = sanitize(indicators.customer_default_rate, 2.6) / 100;

  let totalRevenueGross = 0;
  let totalVatOnSales = 0;
  let totalExportTariffs = 0;
  let currentCashInflowFromSales = 0;
  let totalQuantitySold = 0;

  Object.entries(decisions.regions).forEach(([id, reg]: [string, RegionalData]) => {
    const regionId = Number(id);
    const price = sanitize(reg.price, 425);
    const demandFactor = Math.pow(indicators.avg_selling_price / Math.max(1, price), 1.2) * (1 + (indicators.demand_variation || 0)/100) * iceFactor;
    const qty = (9700 / (Object.keys(decisions.regions).length || 1)) * demandFactor * activityLevel;
    
    totalQuantitySold += qty;
    const grossVal = round2(price * qty);
    totalRevenueGross += grossVal;
    
    // Inadimplência aplicada no ato do recebimento à vista
    currentCashInflowFromSales += (grossVal * 0.5) * (1 - defaultRate);

    const rName = championshipData?.region_names?.[regionId - 1] || "";
    const isUSA = rName.toUpperCase().includes("ESTADOS UNIDOS");
    const isEURO = rName.toUpperCase().includes("EUROPA");

    if (isUSA || isEURO) {
        const tariff = isUSA ? sanitize(indicators.export_tariff_usa, 0) : sanitize(indicators.export_tariff_euro, 0);
        totalExportTariffs += round2(grossVal * (tariff / 100));
    } else {
        totalVatOnSales += round2(grossVal - (grossVal / (1 + vatRateSales)));
    }
  });

  const netSalesRevenue = round2(totalRevenueGross - totalVatOnSales - totalExportTariffs);

  // --- 5. DRE (COMPETÊNCIA) ---
  const cpv_total = round2(cpv_material + (totalPayrollWithCharges * 0.4) + trainingExpense);
  const marketingAdjust = sanitize(indicators.marketing_campaign_adjust, 1.0);
  const distributionAdjust = sanitize(indicators.distribution_cost_adjust, 1.0);
  const opex_total = round2((totalPayrollWithCharges * 0.6) + (netSalesRevenue * 0.10 * marketingAdjust * distributionAdjust));
  
  const operatingProfit = round2(netSalesRevenue - cpv_total - opex_total);
  const trRate = sanitize(indicators.interest_rate_tr, 2.0) / 100;
  const financialExpense = prevCash < 0 ? Math.abs(prevCash) * trRate : 2500;
  const finRes = financialRevenue - financialExpense;
  
  const lair = round2(operatingProfit + finRes);
  const taxProv = lair > 0 ? round2(lair * (sanitize(indicators.tax_rate_ir, 25.0)/100)) : 0;
  const pprValue = (lair - taxProv) > 0 ? round2((lair - taxProv) * (sanitize(decisions.hr.participationPercent, 0)/100)) : 0;
  const finalNetProfit = round2(lair - taxProv - pprValue);

  // --- 6. FLUXO DE CAIXA ---
  const totalInflow = round2(currentCashInflowFromSales + legacyReceivables);
  const legacyOutflowTotal = round2(legacyPayables + legacyVatPayable + legacyTaxPayable + legacyDividends);
  const totalGrossPurchasesCurrent = round2(purchA_GrossTotal + purchB_GrossTotal);
  const currentSuppliersOutflow = round2(totalGrossPurchasesCurrent * 0.5); 
  const currentPayrollOutflow = round2(totalPayrollWithCharges + trainingExpense);

  const totalOutflow = round2(legacyOutflowTotal + currentSuppliersOutflow + currentPayrollOutflow);
  const projectedCash = round2(prevCash + totalInflow - totalOutflow);

  // --- 7. APURAÇÃO ---
  const periodVatNet = round2(totalVatOnSales - (vatPurchA + vatPurchB));
  let nextVatPayable = 0;
  let nextVatRecoverable = 0;
  let finalVatApurated = periodVatNet - legacyVatRecoverable;
  if (finalVatApurated > 0) nextVatPayable = round2(finalVatApurated);
  else nextVatRecoverable = round2(Math.abs(finalVatApurated));

  const kpis: KPIs = {
    rating: projectedCash > 0 && finalNetProfit > 0 ? 'AAA' : projectedCash < 0 ? 'D' : 'B',
    loans: previousState?.kpis?.loans || [],
    equity: round2(prevEquity + finalNetProfit),
    current_cash: projectedCash,
    stock_quantities: { mpa: stockQtyA_End, mpb: stockQtyB_End },
    statements: {
      dre: { 
        revenue: totalRevenueGross, vat_sales: totalVatOnSales, export_tariffs: totalExportTariffs, net_sales: netSalesRevenue,
        cpv: cpv_total, opex: opex_total, operating_profit: operatingProfit, fin_res: finRes, lair: lair, taxes: taxProv, ppr: pprValue, net_profit: finalNetProfit 
      },
      cash_flow: { 
        start: prevCash, 
        inflow: { total: totalInflow, current_sales: currentCashInflowFromSales, legacy_receivables: legacyReceivables }, 
        outflow: { total: totalOutflow, current_payroll: currentPayrollOutflow, current_suppliers: currentSuppliersOutflow, legacy_suppliers: legacyPayables, legacy_vat: legacyVatPayable, legacy_taxes: legacyTaxPayable, legacy_dividends: legacyDividends }, 
        final: projectedCash 
      },
      balance_sheet: [
        { id: 'assets', label: 'ATIVO', value: round2(projectedCash + stockValueA_End + stockValueB_End + nextVatRecoverable + (totalRevenueGross * 0.5) + 6000000), type: 'totalizer', children: [
            { id: 'assets.current', label: 'ATIVO CIRCULANTE', value: round2(projectedCash + stockValueA_End + stockValueB_End + nextVatRecoverable + (totalRevenueGross * 0.5)), type: 'totalizer', children: [
                { id: 'assets.current.cash', label: 'Caixa/Bancos', value: projectedCash, type: 'asset' },
                { id: 'assets.current.clients', label: 'Clientes (Prazo)', value: round2(totalRevenueGross * 0.5), type: 'asset' },
                { id: 'assets.current.stock.mpa', label: 'MP A', value: stockValueA_End, type: 'asset' },
                { id: 'assets.current.stock.mpb', label: 'MP B', value: stockValueB_End, type: 'asset' },
                { id: 'assets.current.vat_recoverable', label: 'Crédito IVA', value: nextVatRecoverable, type: 'asset' }
            ]}
        ]},
        { id: 'liabilities_pl', label: 'PASSIVO + PL', value: round2(round2(prevEquity + finalNetProfit) + (totalGrossPurchasesCurrent * 0.5) + nextVatPayable + taxProv + pprValue + 2000000), type: 'totalizer', children: [
            { id: 'liabilities.current', label: 'PASSIVO CIRCULANTE', value: round2((totalGrossPurchasesCurrent * 0.5) + nextVatPayable + taxProv + pprValue), type: 'totalizer', children: [
                { id: 'liabilities.current.suppliers', label: 'Fornecedores (Prazo)', value: round2(totalGrossPurchasesCurrent * 0.5), type: 'liability' },
                { id: 'liabilities.current.vat_payable', label: 'IVA a recolher', value: nextVatPayable, type: 'liability' },
                { id: 'liabilities.current.taxes', label: 'IR a pagar', value: taxProv, type: 'liability' },
                { id: 'liabilities.current.ppr', label: 'PPR a pagar', value: pprValue, type: 'liability' }
            ]},
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
