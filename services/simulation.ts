
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, Loan, AccountNode, Championship, InitialMachine } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

// Utilitário de precisão contábil
const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Função PGTO (PMT) - Simula o comportamento do Excel
 * rate: taxa de juros por período
 * nper: número de parcelas
 * pv: preço à vista (valor presente)
 */
const calculatePMT = (rate: number, nper: number, pv: number): number => {
  if (rate === 0) return pv / nper;
  const pmt = (pv * rate) / (1 - Math.pow(1 + rate, -nper));
  return round2(pmt);
};

/**
 * CORE ORACLE ENGINE v15.36 - FIDELITY CASH FLOW KERNEL
 * Processamento de vendas com lógica PGTO (Excel Match)
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
  
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...(roundRules?.[currentRound] || {}) };
  
  // 1. Extração de Dados do Balanço Anterior
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
  
  // Saldos de Ciclos Anteriores (Legado)
  const legacyReceivables = sanitize(getVal('assets.current.clients', prevBS));
  const legacyPayables = sanitize(getVal('liabilities.current.suppliers', prevBS));

  // --- 2. VENDAS E RECEITA (LÓGICA PGTO EXCEL) ---
  const salesInterest = sanitize(indicators.sales_interest_rate, 1.0) / 100;
  let totalRevenue = 0;
  let totalCurrentCashInflow = 0;
  let totalQuantitySold = 0;

  // Cálculo por região para fidelidade de market share
  Object.entries(decisions.regions).forEach(([id, reg]) => {
    const regionId = parseInt(id);
    const price = sanitize(reg.price, 425);
    const termType = sanitize(reg.term, 1); // 0: à vista, 1: 50/50, 2: 33/33/33
    
    // Elasticidade e Demanda (Base 9700 unidades em P00)
    const demandFactor = Math.pow(indicators.avg_selling_price / Math.max(1, price), 1.2) * (1 + indicators.demand_variation/100);
    const qty = 9700 * demandFactor * (decisions.production.activityLevel / 100) / (Object.keys(decisions.regions).length || 1);
    totalQuantitySold += qty;

    if (termType === 0) {
      // À VISTA
      const rev = price * qty;
      totalRevenue += rev;
      totalCurrentCashInflow += rev;
    } else {
      // 50/50 (2 parcelas) ou 33/33/33 (3 parcelas)
      const nper = termType === 1 ? 2 : 3;
      const pmt = calculatePMT(salesInterest, nper, price);
      
      const regionTotalRevenue = (pmt * nper) * qty;
      const regionCashInflow = pmt * qty; // Apenas a primeira parcela entra no caixa
      
      totalRevenue += regionTotalRevenue;
      totalCurrentCashInflow += regionCashInflow;
    }
  });

  const accountsReceivable = totalRevenue - totalCurrentCashInflow;
  const badDebtRate = sanitize(indicators.customer_default_rate, 2.6) / 100;
  const badDebtExpense = accountsReceivable * badDebtRate;

  // --- 3. CUSTOS E DESPESAS ---
  const qtyA = sanitize(decisions.production.purchaseMPA);
  const qtyB = sanitize(decisions.production.purchaseMPB);
  const totalNominalPurchase = (qtyA * indicators.prices.mp_a) + (qtyB * indicators.prices.mp_b);
  
  // Produção Extra (Ágio 5%)
  let extraRevenue = 0;
  let specialPurchaseValue = 0;
  if (totalQuantitySold > (9700 * (decisions.production.activityLevel / 100))) {
     const extraQty = totalQuantitySold - (9700 * (decisions.production.activityLevel / 100));
     extraRevenue = extraQty * (totalRevenue / totalQuantitySold);
     const premium = sanitize(indicators.special_purchase_premium, 5.0) / 100;
     specialPurchaseValue = (extraQty * indicators.prices.mp_a * 1.5) * (1 + premium); 
  }

  // Folha de Pagamento
  const staffing = indicators.staffing || DEFAULT_MACRO.staffing;
  const baseSalary = sanitize(decisions.hr.salary, 2000);
  const payrollBase = (staffing.admin.count * baseSalary * staffing.admin.salaries) +
                      (staffing.sales.count * baseSalary * staffing.sales.salaries) +
                      (staffing.production.count * baseSalary * staffing.production.salaries);
  const totalLaborCost = payrollBase * (1 + (sanitize(indicators.social_charges, 35.0) / 100));

  const cpv = (totalNominalPurchase * 0.7) + specialPurchaseValue + (totalLaborCost * 0.4);
  const opex = (totalLaborCost * 0.6) + (totalRevenue * 0.08) + badDebtExpense + 146402; // Manutenção + Inadimplência

  // --- 4. GESTÃO DE DÍVIDA ---
  let activeLoans: Loan[] = previousState?.kpis?.loans ? JSON.parse(JSON.stringify(previousState.kpis.loans)) : [];
  let currentInterestLoans = 0;
  let currentAmortizationTotal = 0;

  activeLoans = activeLoans.map(loan => {
    let periodicInterest = 0;
    if (loan.type === 'compulsory') {
        periodicInterest = loan.principal * ((sanitize(loan.agio_rate_at_creation, 3.0) + loan.interest_rate) / 100);
    } else {
        periodicInterest = loan.remaining_principal * (loan.interest_rate / 100);
    }
    currentInterestLoans += periodicInterest;
    if (loan.grace_periods > 0) loan.grace_periods -= 1;
    else {
      const amort = loan.type === 'compulsory' ? loan.remaining_principal : loan.remaining_principal / Math.max(1, loan.remaining_installments);
      currentAmortizationTotal += amort;
      loan.remaining_principal -= amort;
      loan.remaining_installments -= 1;
    }
    return loan;
  }).filter(l => l.remaining_principal > 0.01);

  // --- 5. FLUXO DE CAIXA (DFC) ---
  const manualLoanRequest = sanitize(decisions.finance.loanRequest);
  const totalInflow = totalCurrentCashInflow + legacyReceivables + manualLoanRequest;
  const currentCashPurchases = (totalNominalPurchase * 0.5) + specialPurchaseValue;
  const totalOutflow = currentCashPurchases + legacyPayables + totalLaborCost + currentInterestLoans + currentAmortizationTotal;
  
  let projectedCash = prevCash + totalInflow - totalOutflow - sanitize(decisions.finance.application);
  
  // Empréstimo Compulsório
  let compulsoryAmount = 0;
  if (projectedCash < 0) {
    compulsoryAmount = Math.abs(projectedCash);
    projectedCash = 0; 
    activeLoans.push({
      id: `compulsory-${Date.now()}`,
      type: 'compulsory', principal: compulsoryAmount, remaining_principal: compulsoryAmount,
      grace_periods: 0, total_installments: 1, remaining_installments: 1,
      interest_rate: indicators.interest_rate_tr, agio_rate_at_creation: indicators.compulsory_loan_agio, created_at_round: currentRound
    });
  }

  // --- 6. RESULTADO LÍQUIDO ---
  const netProfit = totalRevenue - cpv - opex - currentInterestLoans;
  const finalEquity = prevEquity + netProfit;

  // --- 7. KPIs & BALANÇO ---
  const kpis: KPIs = {
    rating: netProfit > 0 ? 'AAA' : 'B',
    loans: activeLoans,
    equity: finalEquity,
    current_cash: projectedCash,
    market_share: (totalQuantitySold / 9700) * 11.1,
    statements: {
      dre: { revenue: totalRevenue, cpv, opex, interest: currentInterestLoans, net_profit: netProfit },
      cash_flow: { 
        start: prevCash, 
        inflow: { total: totalInflow, cash_sales: totalCurrentCashInflow, legacy_receivables: legacyReceivables, manual_loan: manualLoanRequest, compulsory_trigger: compulsoryAmount }, 
        outflow: { total: totalOutflow, cash_purchases: currentCashPurchases, legacy_payables: legacyPayables, payroll: totalLaborCost, interest: currentInterestLoans, amortization: currentAmortizationTotal }, 
        final: projectedCash 
      },
      balance_sheet: [
        { 
          id: 'assets', label: 'ATIVO', value: finalEquity + activeLoans.reduce((a,b)=>a+b.remaining_principal,0), type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: projectedCash, type: 'asset' },
            { id: 'assets.current.clients_group', label: 'CONTAS A RECEBER', value: accountsReceivable - badDebtExpense, type: 'totalizer', children: [
                { id: 'assets.current.clients', label: 'Clientes', value: accountsReceivable, type: 'asset' },
                { id: 'assets.current.pecld', label: '(-) Inadimplência', value: -badDebtExpense, type: 'asset' }
            ]}
          ]
        },
        { 
          id: 'liabilities_pl', label: 'PASSIVO + PL', value: finalEquity + activeLoans.reduce((a,b)=>a+b.remaining_principal,0), type: 'totalizer', children: [
            { id: 'liabilities.suppliers', label: 'Fornecedores', value: totalNominalPurchase * 0.5, type: 'liability' },
            { id: 'liabilities.loans', label: 'Empréstimos', value: activeLoans.reduce((a,b)=>a+b.remaining_principal,0), type: 'liability' },
            { id: 'equity.total', label: 'Patrimônio Líquido', value: finalEquity, type: 'equity' }
          ]
        }
      ]
    }
  };

  return {
    revenue: totalRevenue, netProfit, 
    debtRatio: (activeLoans.reduce((a,b)=>a+b.remaining_principal,0) / Math.max(1, finalEquity)) * 100,
    creditRating: kpis.rating, 
    health: { cash: projectedCash, rating: kpis.rating },
    kpis, statements: kpis.statements, marketShare: kpis.market_share
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
