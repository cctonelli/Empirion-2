
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, Loan, AccountNode, Championship, InitialMachine } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

const calculatePMT = (rate: number, nper: number, pv: number): number => {
  if (rate === 0) return pv / nper;
  const pmt = (pv * rate) / (1 - Math.pow(1 + rate, -nper));
  return round2(pmt);
};

/**
 * CORE ORACLE ENGINE v15.40 - FIDELITY IVA KERNEL
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
  
  const indicators = { 
    ...DEFAULT_MACRO, 
    ...DEFAULT_INDUSTRIAL_CHRONOGRAM[0], 
    ...baseIndicators, 
    ...(roundRules?.[currentRound] || {}) 
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

  const prevCash = sanitize(previousState?.current_cash ?? getVal('assets.current.cash', prevBS), 0);
  const prevEquity = sanitize(previousState?.equity || 7303448.32);
  const legacyReceivables = sanitize(getVal('assets.current.clients', prevBS));
  const legacyPayables = sanitize(getVal('liabilities.current.suppliers', prevBS));
  
  // Apuração de IVA Pendente (T+1 logic)
  const legacyVatPayable = sanitize(getVal('liabilities.current.vat_payable', prevBS));
  const legacyVatRecoverable = sanitize(getVal('assets.current.vat_recoverable', prevBS));

  // --- 1. IVA SOBRE COMPRAS & VALORAÇÃO DE ESTOQUE (WAC LÍQUIDO) ---
  const vatRatePurch = sanitize(indicators.vat_purchases_rate, 0) / 100;
  
  // Compra MP-A
  const qtyPurchA = sanitize(decisions.production.purchaseMPA);
  const priceA_Gross = indicators.prices.mp_a;
  const priceA_Base = priceA_Gross / (1 + vatRatePurch);
  const vatPurchA = (priceA_Gross - priceA_Base) * qtyPurchA;
  const totalGrossPurchA = priceA_Gross * qtyPurchA;

  // Compra MP-B
  const qtyPurchB = sanitize(decisions.production.purchaseMPB);
  const priceB_Gross = indicators.prices.mp_b;
  const priceB_Base = priceB_Gross / (1 + vatRatePurch);
  const vatPurchB = (priceB_Gross - priceB_Base) * qtyPurchB;
  const totalGrossPurchB = priceB_Gross * qtyPurchB;

  const totalVatPurchased = round2(vatPurchA + vatPurchB);
  const totalGrossPurchases = round2(totalGrossPurchA + totalGrossPurchB);

  // --- 2. FOLHA DE PAGAMENTO E TREINAMENTO ---
  const staffing = indicators.staffing || DEFAULT_MACRO.staffing;
  const baseSalary = sanitize(decisions.hr.salary, 2000);
  const modCount = staffing.production.count + sanitize(decisions.hr.hired) - sanitize(decisions.hr.fired);
  const modPayrollBase = modCount * baseSalary;
  const trainingRate = sanitize(decisions.hr.trainingPercent, 0) / 100;
  const trainingExpense = round2(modPayrollBase * trainingRate);
  const payrollTotalBase = (staffing.admin.count * baseSalary * staffing.admin.salaries) +
                           (staffing.sales.count * baseSalary * staffing.sales.salaries) +
                           (modCount * baseSalary * staffing.production.salaries);
  const totalLaborCost = round2(payrollTotalBase * (1 + (sanitize(indicators.social_charges, 35.0) / 100)));

  // --- 3. VENDAS, IVA SOBRE VENDAS E RECEITA LÍQUIDA ---
  const vatRateSales = sanitize(indicators.vat_sales_rate, 0) / 100;
  const salesInterest = sanitize(indicators.sales_interest_rate, 1.0) / 100;
  let totalRevenueGross = 0;
  let totalCurrentCashInflow = 0;
  let totalQuantitySold = 0;

  Object.entries(decisions.regions).forEach(([id, reg]) => {
    const price = sanitize(reg.price, 425);
    const termType = sanitize(reg.term, 1);
    const demandFactor = Math.pow(indicators.avg_selling_price / Math.max(1, price), 1.2) * (1 + indicators.demand_variation/100);
    const qty = 9700 * demandFactor * (decisions.production.activityLevel / 100) / (Object.keys(decisions.regions).length || 1);
    totalQuantitySold += qty;

    const grossValue = round2(price * qty);
    totalRevenueGross += grossValue;

    if (termType === 0) {
      totalCurrentCashInflow += grossValue;
    } else {
      const nper = termType === 1 ? 2 : 3;
      const pmt = calculatePMT(salesInterest, nper, price);
      totalCurrentCashInflow += round2(pmt * qty);
    }
  });

  const totalVatOnSales = round2(totalRevenueGross - (totalRevenueGross / (1 + vatRateSales)));
  const netSalesRevenue = round2(totalRevenueGross - totalVatOnSales);

  // --- 4. APURAÇÃO DE IVA DO PERÍODO ---
  // IVA Líquido = IVA sobre Vendas - IVA sobre Compras
  const periodVatNet = round2(totalVatOnSales - totalVatPurchased);
  let nextVatPayable = 0;
  let nextVatRecoverable = 0;

  // Compensação com créditos legados
  let finalApurated = periodVatNet - legacyVatRecoverable;
  if (finalApurated > 0) {
     nextVatPayable = finalApurated;
     nextVatRecoverable = 0;
  } else {
     nextVatPayable = 0;
     nextVatRecoverable = Math.abs(finalApurated);
  }

  // --- 5. CUSTOS E CPV (WAC LÍQUIDO) ---
  const cpv = round2((totalGrossPurchases * 0.7 / (1 + vatRatePurch)) + (totalLaborCost * 0.4) + trainingExpense);
  const opex = round2((totalLaborCost * 0.6) + (netSalesRevenue * 0.08) + (netSalesRevenue * 0.02) + 146402);

  // --- 6. GESTÃO DE DÍVIDA E CAPEX ---
  let activeLoans: Loan[] = previousState?.kpis?.loans ? JSON.parse(JSON.stringify(previousState.kpis.loans)) : [];
  let currentInterestLoans = 0;
  let currentAmortizationTotal = 0;

  activeLoans = activeLoans.map(loan => {
    const periodicInterest = round2(loan.remaining_principal * (loan.interest_rate / 100));
    currentInterestLoans += periodicInterest;
    if (loan.grace_periods > 0) loan.grace_periods -= 1;
    else {
      const amort = round2(loan.remaining_principal / Math.max(1, loan.remaining_installments));
      currentAmortizationTotal += amort;
      loan.remaining_principal -= amort;
      loan.remaining_installments -= 1;
    }
    return loan;
  }).filter(l => l.remaining_principal > 0.01);

  const machineBuyCost = (sanitize(decisions.machinery.buy.alfa) * indicators.machinery_values.alfa) + 
                         (sanitize(decisions.machinery.buy.beta) * indicators.machinery_values.beta) + 
                         (sanitize(decisions.machinery.buy.gama) * indicators.machinery_values.gama);

  // --- 7. FLUXO DE CAIXA (DFC) COM IVA T+1 ---
  const totalInflow = round2(totalCurrentCashInflow + legacyReceivables + sanitize(decisions.finance.loanRequest));
  
  // Saída de IVA: Paga o que foi apurado no round anterior
  const vatOutflow = legacyVatPayable;

  const totalOutflow = round2(totalGrossPurchases + machineBuyCost + legacyPayables + totalLaborCost + currentInterestLoans + currentAmortizationTotal + trainingExpense + vatOutflow);
  
  let projectedCash = round2(prevCash + totalInflow - totalOutflow);
  let compulsoryAmount = 0;
  if (projectedCash < 0) {
    compulsoryAmount = Math.abs(projectedCash);
    projectedCash = 0; 
    activeLoans.push({
      id: `compulsory-${Date.now()}`,
      type: 'compulsory', principal: compulsoryAmount, remaining_principal: compulsoryAmount,
      grace_periods: 0, total_installments: 1, remaining_installments: 1,
      interest_rate: 5.0, created_at_round: currentRound
    });
  }

  const netProfit = round2(netSalesRevenue - cpv - opex - currentInterestLoans);
  const finalEquity = round2(prevEquity + netProfit);

  const kpis: KPIs = {
    rating: netProfit > 0 ? 'AAA' : 'B',
    motivation_score: 0.85,
    loans: activeLoans,
    equity: finalEquity,
    current_cash: projectedCash,
    market_share: (totalQuantitySold / 9700) * 11.1,
    statements: {
      dre: { 
        revenue: totalRevenueGross, 
        vat_sales: totalVatOnSales,
        net_sales: netSalesRevenue,
        cpv, 
        opex, 
        net_profit: netProfit 
      },
      cash_flow: { 
        start: prevCash, 
        inflow: { total: totalInflow + compulsoryAmount, cash_sales: totalCurrentCashInflow }, 
        outflow: { total: totalOutflow, vat_payable: vatOutflow, training: trainingExpense, payroll: totalLaborCost, interest: currentInterestLoans }, 
        final: projectedCash 
      },
      balance_sheet: [
        { id: 'assets', label: 'ATIVO', value: finalEquity + 2000000, type: 'totalizer', children: [
            { id: 'assets.current', label: 'ATIVO CIRCULANTE', value: projectedCash + nextVatRecoverable + 500000, type: 'totalizer', children: [
                { id: 'assets.current.cash', label: 'Caixa/Bancos', value: projectedCash, type: 'asset' },
                { id: 'assets.current.vat_recoverable', label: 'Crédito de IVA a recuperar', value: nextVatRecoverable, type: 'asset' }
            ]}
        ]},
        { id: 'liabilities_pl', label: 'PASSIVO + PL', value: finalEquity + 2000000, type: 'totalizer', children: [
            { id: 'liabilities.current', label: 'PASSIVO CIRCULANTE', value: nextVatPayable + 200000, type: 'totalizer', children: [
                { id: 'liabilities.current.vat_payable', label: 'IVA a recolher', value: nextVatPayable, type: 'liability' }
            ]}
        ]}
      ]
    }
  };

  return {
    revenue: totalRevenueGross, netProfit, 
    debtRatio: 25, creditRating: kpis.rating, 
    health: { cash: projectedCash, rating: kpis.rating },
    kpis, statements: kpis.statements, marketShare: kpis.market_share
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
