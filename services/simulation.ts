
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, CurrencyType, MachineMaintenanceConfig, BuildingSpec, InitialBuilding, AccountNode } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_TOTAL_SHARES, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

/**
 * Sanitizador Alpha Node 08 - Preservação de Floats
 */
export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * CORE ORACLE ENGINE v30.26 - EFICÁCIA CONTÁBIL TOTAL (CPP EXCELLENCE)
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  baseIndicators: MacroIndicators = DEFAULT_MACRO,
  previousState?: any,
  roundHistory: any[] = [],
  currentRound: number = 1,
  roundRules?: Record<number, Partial<MacroIndicators>>,
  forcedShare?: number,
  championshipData?: Championship
): ProjectionResult => {
  
  const safeDecisions: DecisionData = JSON.parse(JSON.stringify(decisions, (key, value) => {
      if (typeof value === 'number') return (isNaN(value) || !isFinite(value)) ? 0 : value;
      return value;
  }));

  // --- 0. PREPARAÇÃO DE SALDOS INICIAIS ---
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...(roundRules?.[currentRound] || {}) };
  const prevBS = previousState?.statements?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet;
  
  const getVal = (id: string, list: any[]): number => {
    for (const item of list) {
        if (item.id === id) return item.value;
        if (item.children) {
            const res = getVal(id, item.children);
            if (res !== 0) return res;
        }
    }
    return 0;
  };

  const prevCash = previousState?.cash ?? 170000;
  const prevClients = getVal('assets.current.clients', prevBS) || 1823735;
  const prevSuppliers = getVal('liabilities.current.suppliers', prevBS) || 717605;
  const prevMPA_Val = getVal('assets.current.stock.mpa', prevBS) || 628545;
  const prevMPB_Val = getVal('assets.current.stock.mpb', prevBS) || 838060;
  const prevPA_Val = getVal('assets.current.stock.pa', prevBS) || 454000;
  const prevPA_Qty = 2000; // Baseline fixa no MVP v15
  
  const prevEquity = sanitize(previousState?.equity || 5055447);
  const prevInvestments = getVal('assets.current.investments', prevBS) || 0;
  const prevLoansST = getVal('liabilities.current.loans_st', prevBS) || 1872362;
  const prevLoansLT = getVal('liabilities.longterm.loans_lt', prevBS) || 1500000;

  // --- 1. OPERAÇÕES: PRODUÇÃO E CAPACIDADE ---
  const fleet = (previousState?.fleet || indicators.initial_machinery_mix) as InitialMachine[];
  const machineSpecs = indicators.machine_specs;
  const buildingSpec = indicators.building_spec;
  
  const nominalCapacity = fleet.reduce((acc, m) => acc + (machineSpecs[m.model]?.production_capacity || 0), 0);
  const requiredProdStaff = fleet.reduce((acc, m) => acc + (machineSpecs[m.model]?.operators_required || 0), 0);
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const unitsProduced = nominalCapacity * (activityLevel / 100);

  // --- 2. CICLO COMERCIAL (ANTECIPADO PARA CÁLCULO DE ESTOQUE FINAL PA) ---
  const rd_percent = sanitize(safeDecisions.production.rd_investment, 0);
  const rd_market_bonus = 1 + (rd_percent / 40);
  // Cálculo de demanda real antes do CPP para determinar o custo de manutenção do pátio
  const unitsSold = Math.min(prevPA_Qty + unitsProduced, (nominalCapacity * 0.125) * rd_market_bonus * (forcedShare ? forcedShare/12.5 : 1));
  const qtyPA_End = Math.max(0, prevPA_Qty + unitsProduced - unitsSold);

  // --- 3. FORMAÇÃO COMPLETA DO CPP (CUSTO DE PRODUÇÃO) ---
  const i_supp = sanitize(indicators.supplier_interest, 1.5) / 100;
  const payType = safeDecisions.production.paymentType || 0;
  const n_supp = payType + 1;
  
  let purchasePriceMPA = indicators.prices.mp_a;
  let purchasePriceMPB = indicators.prices.mp_b;

  if (i_supp > 0 && n_supp > 1) {
    const pmtFactor = (i_supp * Math.pow(1 + i_supp, n_supp)) / (Math.pow(1 + i_supp, n_supp) - 1);
    purchasePriceMPA = (indicators.prices.mp_a * pmtFactor) * n_supp;
    purchasePriceMPB = (indicators.prices.mp_b * pmtFactor) * n_supp;
  }

  const purchaseMPA_Qty = sanitize(safeDecisions.production.purchaseMPA, 0);
  const purchaseMPB_Qty = sanitize(safeDecisions.production.purchaseMPB, 0);
  const totalPurchaseValue = (purchaseMPA_Qty * purchasePriceMPA) + (purchaseMPB_Qty * purchasePriceMPB);

  // Saída de Caixa Fornecedores
  const cashOutflowSuppliers = (totalPurchaseValue / n_supp) + (prevSuppliers * 0.5); 
  const newSuppliersLiability = (prevSuppliers * 0.5) + (totalPurchaseValue * (n_supp - 1) / n_supp);

  // Transformação e Depreciação
  const salaryBase = sanitize(safeDecisions.hr.salary, 1313);
  const socialChargesRate = sanitize(indicators.social_charges, 35) / 100;
  const payrollProduction = (requiredProdStaff * salaryBase) * (1 + socialChargesRate);
  const machineDeprec = fleet.reduce((acc, m) => acc + ((m.book_value || 500000) * 0.025), 0);
  const buildingDeprec = buildingSpec.initial_value * buildingSpec.depreciation_rate;
  const totalDeprec = machineDeprec + buildingDeprec;
  const totalMaint = fleet.length * 5000;

  // Consumo MP e Gestão de Estoques
  const totalMP_Consumed = (unitsProduced * 3 * purchasePriceMPA) + (unitsProduced * 2 * purchasePriceMPB);
  const qtyMPA_End = Math.max(0, (prevMPA_Val / indicators.prices.mp_a) + purchaseMPA_Qty - (unitsProduced * 3));
  const qtyMPB_End = Math.max(0, (prevMPB_Val / indicators.prices.mp_b) + purchaseMPB_Qty - (unitsProduced * 2));

  // GASTOS COM ESTOCAGEM (MASTER UPDATE: MP + PA)
  const storageCostMP = (qtyMPA_End + qtyMPB_End) * indicators.prices.storage_mp;
  const storageCostPA = qtyPA_End * indicators.prices.storage_finished;
  const totalStorageCost = storageCostMP + storageCostPA;

  // CONSOLIDAÇÃO CPP MASTER
  const currentCPP_Total = totalMP_Consumed + payrollProduction + totalDeprec + totalMaint + totalStorageCost;
  const unitCPP = unitsProduced > 0 ? currentCPP_Total / unitsProduced : 0;
  
  // WAC (Custo Médio Ponderado) absorvendo custos de estocagem
  const wacPA = unitsProduced > 0 
    ? (prevPA_Val + currentCPP_Total) / (prevPA_Qty + unitsProduced)
    : (prevPA_Val / Math.max(1, prevPA_Qty));

  // --- 4. RECEBIMENTOS E VENDAS ---
  let totalRevenue = 0;
  let cashFromNewSales = 0;
  let i_term = sanitize(safeDecisions.production.term_interest_rate, 1.5) / 100;
  const regions = Object.values(safeDecisions.regions);
  const unitsPerRegion = unitsSold / Math.max(regions.length, 1);

  regions.forEach((reg: any) => {
    const price = sanitize(reg.price, 375);
    const n = (reg.term || 0) + 1;
    let pmt = price;
    if (i_term > 0 && n > 1) {
      const pow = Math.pow(1 + i_term, n);
      pmt = price * (i_term * pow) / (pow - 1);
    }
    totalRevenue += (pmt * n * unitsPerRegion);
    cashFromNewSales += (pmt * unitsPerRegion);
  });

  const collectionFromPrev = prevClients * 0.45;
  const badDebt = prevClients * (sanitize(indicators.customer_default_rate, 2.6) / 100);
  const totalCashInflowClients = cashFromNewSales + collectionFromPrev;
  const newClientsBalance = (prevClients - collectionFromPrev - badDebt) + (totalRevenue - cashFromNewSales);

  // --- 5. DRE (RESULTADO) ---
  const cpv = unitsSold * wacPA;
  const grossProfit = totalRevenue - cpv;
  const opexSales = (10 * salaryBase * 4) * (1 + socialChargesRate); 
  const opexAdm = (20 * salaryBase * 4) * (1 + socialChargesRate);   
  const rd_expense = totalRevenue * (rd_percent / 100);
  const totalOpex = opexSales + opexAdm + rd_expense + badDebt;
  const operatingProfit = grossProfit - totalOpex;
  
  const finRev = prevInvestments * (sanitize(indicators.investment_return_rate, 1.0) / 100);
  const finExp = (prevLoansST * 0.02) + (prevLoansLT * 0.015) + (sanitize(safeDecisions.finance.loanRequest, 0) * 0.03);
  const finResult = finRev - finExp;
  
  const lair = operatingProfit + finResult;
  const tax = lair > 0 ? lair * (sanitize(indicators.tax_rate_ir, 15) / 100) : 0;
  const netProfit = lair - tax;

  // --- 6. FLUXO DE CAIXA ---
  const loanInflow = sanitize(safeDecisions.finance.loanRequest, 0);
  const applicationOutflow = sanitize(safeDecisions.finance.application, 0);
  const dividendsPaid = previousState?.pending_dividends || 0;

  const totalInflow = totalCashInflowClients + finRev + loanInflow;
  const totalOutflow = cashOutflowSuppliers + payrollProduction + opexSales + opexAdm + rd_expense + totalMaint + finExp + tax + dividendsPaid;
  const finalCash = prevCash + totalInflow - totalOutflow - applicationOutflow;

  // --- 7. BALANÇO RECONCILIADO ---
  const finalStockPAValue = qtyPA_End * wacPA;
  const finalStockMPValue = (qtyMPA_End * indicators.prices.mp_a) + (qtyMPB_End * indicators.prices.mp_b);
  
  const dividendsProvision = netProfit > 0 ? netProfit * (sanitize(indicators.dividend_percent, 25) / 100) : 0;
  const finalEquity = prevEquity + (netProfit - dividendsProvision);

  const finalFixedAssets = (getVal('assets.noncurrent.fixed.machines', prevBS) || 2360000);
  const finalAccumDeprec = (getVal('assets.noncurrent.fixed.machines_deprec', prevBS) || -811500) - machineDeprec;
  const finalBuildingVal = (getVal('assets.noncurrent.fixed.buildings', prevBS) || 5440000);
  const finalBuildingDeprec = (getVal('assets.noncurrent.fixed.buildings_deprec', prevBS) || -2176000) - buildingDeprec;

  const buildBS = (): AccountNode[] => [
    { id: 'assets', label: 'ATIVO', value: finalCash + newClientsBalance + finalStockMPValue + finalStockPAValue + applicationOutflow + prevInvestments + finalFixedAssets + finalAccumDeprec + finalBuildingVal + finalBuildingDeprec + 1200000, type: 'totalizer', children: [
        { id: 'assets.current', label: 'ATIVO CIRCULANTE', value: finalCash + newClientsBalance + finalStockMPValue + finalStockPAValue + applicationOutflow + prevInvestments, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: finalCash, type: 'asset' },
            { id: 'assets.current.investments', label: 'Aplicação Financeira', value: prevInvestments + applicationOutflow, type: 'asset' },
            { id: 'assets.current.clients', label: 'Clientes', value: newClientsBalance, type: 'asset' },
            { id: 'assets.current.stock', label: 'ESTOQUES', value: finalStockMPValue + finalStockPAValue, type: 'totalizer', children: [
                { id: 'assets.current.stock.mpa', label: 'Matéria-Prima', value: finalStockMPValue, type: 'asset' },
                { id: 'assets.current.stock.pa', label: 'Produto Acabado', value: finalStockPAValue, type: 'asset' }
            ]}
        ]},
        { id: 'assets.noncurrent', label: 'ATIVO NÃO CIRCULANTE', value: finalFixedAssets + finalAccumDeprec + finalBuildingVal + finalBuildingDeprec + 1200000, type: 'totalizer', children: [
            { id: 'assets.noncurrent.fixed', label: 'IMOBILIZADO', value: finalFixedAssets + finalAccumDeprec + finalBuildingVal + finalBuildingDeprec + 1200000, type: 'totalizer', children: [
                { id: 'assets.noncurrent.fixed.land', label: 'Terrenos', value: 1200000, type: 'asset' },
                { id: 'assets.noncurrent.fixed.machines', label: 'Máquinas', value: finalFixedAssets, type: 'asset' },
                { id: 'assets.noncurrent.fixed.machines_deprec', label: '(-) Deprec. Máquinas', value: finalAccumDeprec, type: 'asset' },
                { id: 'assets.noncurrent.fixed.buildings', label: 'Prédios', value: finalBuildingVal, type: 'asset' },
                { id: 'assets.noncurrent.fixed.buildings_deprec', label: '(-) Deprec. Prédios', value: finalBuildingDeprec, type: 'asset' }
            ]}
        ]}
    ]},
    { id: 'liabilities_pl', label: 'PASSIVO + PL', value: finalCash + newClientsBalance + finalStockMPValue + finalStockPAValue + applicationOutflow + prevInvestments + finalFixedAssets + finalAccumDeprec + finalBuildingVal + finalBuildingDeprec + 1200000, type: 'totalizer', children: [
        { id: 'liabilities.current', label: 'PASSIVO CIRCULANTE', value: newSuppliersLiability + tax + dividendsProvision + prevLoansST + loanInflow, type: 'totalizer', children: [
            { id: 'liabilities.current.suppliers', label: 'Fornecedores', value: newSuppliersLiability, type: 'liability' },
            { id: 'liabilities.current.taxes', label: 'Impostos a Pagar', value: tax, type: 'liability' },
            { id: 'liabilities.current.dividends', label: 'Dividendos a Pagar', value: dividendsProvision, type: 'liability' },
            { id: 'liabilities.current.loans_st', label: 'Empréstimos CP', value: prevLoansST + loanInflow, type: 'liability' }
        ]},
        { id: 'liabilities.longterm', label: 'PASSIVO NÃO CIRCULANTE', value: prevLoansLT, type: 'totalizer', children: [
            { id: 'liabilities.longterm.loans_lt', label: 'Empréstimos LP', value: prevLoansLT, type: 'liability' }
        ]},
        { id: 'equity', label: 'PATRIMÔNIO LÍQUIDO', value: finalEquity, type: 'totalizer', children: [
            { id: 'equity.capital', label: 'Capital Social', value: 5000000, type: 'equity' },
            { id: 'equity.profit', label: 'Lucro Acumulado', value: finalEquity - 5000000, type: 'equity' }
        ]}
    ]}
  ];

  return {
    revenue: totalRevenue,
    netProfit: netProfit,
    debtRatio: ((prevLoansST + loanInflow + prevLoansLT) / (finalCash + newClientsBalance + finalStockMPValue + finalStockPAValue + applicationOutflow + prevInvestments + finalFixedAssets + finalAccumDeprec + finalBuildingVal + finalBuildingDeprec + 1200000)) * 100,
    creditRating: netProfit > 0 ? (lair > totalRevenue * 0.1 ? 'AAA' : 'AA') : (finalCash < 0 ? 'D' : 'B'),
    marketShare: 12.5 * rd_market_bonus,
    health: { 
        rating: netProfit > 0 ? 'AAA' : 'B', 
        cpp: unitCPP, 
        cash: finalCash,
        insolvency_risk: finalCash < 0 ? 80 : 5
    },
    kpis: {
      market_share: 12.5 * rd_market_bonus,
      rating: netProfit > 0 ? 'AAA' : 'B',
      insolvency_status: finalCash > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: finalEquity,
      fleet: fleet.map(m => ({ ...m, age: m.age + 1 }))
    },
    statements: {
      dre: {
        revenue: totalRevenue,
        cpv,
        gross_profit: grossProfit,
        opex: totalOpex,
        operating_profit: operatingProfit,
        financial_result: finResult,
        lair,
        tax,
        net_profit: netProfit,
        details: { cpp: unitCPP, wac_pa: wacPA, storage_cost: totalStorageCost, bad_debt: badDebt, deprec: totalDeprec }
      },
      cash_flow: {
        start: prevCash,
        inflow: { total: totalInflow, cash_sales: cashFromNewSales, term_sales: collectionFromPrev, loans: loanInflow },
        outflow: { total: totalOutflow, suppliers: cashOutflowSuppliers, payroll: payrollProduction, taxes: tax, interest: finExp, dividends: dividendsPaid },
        investment_apply: applicationOutflow,
        final: finalCash
      },
      balance_sheet: buildBS()
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const rd_bonus = 1 + (sanitize(decisions.production.rd_investment, 0) / 30);
  return (Object.values(decisions.regions).reduce((acc, r) => acc + (Math.pow(370/Math.max(r.price, 1), 1.5) * (1 + (r.marketing || 0)*0.06)), 0) / 4) * rd_bonus;
};
