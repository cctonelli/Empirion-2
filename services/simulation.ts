
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
 * CORE ORACLE ENGINE v15.36 - FIDELITY CASH FLOW KERNEL
 * Cálculo de MP com lógica de juros compostos (Excel Match)
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
  
  const legacyReceivables = sanitize(getVal('assets.current.clients', prevBS));
  const legacyPayables = sanitize(getVal('liabilities.current.suppliers', prevBS));

  // --- 2. FOLHA DE PAGAMENTO ---
  const staffing = indicators.staffing || DEFAULT_MACRO.staffing;
  const baseSalary = sanitize(decisions.hr.salary, 2000);
  const payrollBase = (staffing.admin.count * baseSalary * staffing.admin.salaries) +
                      (staffing.sales.count * baseSalary * staffing.sales.salaries) +
                      (staffing.production.count * baseSalary * staffing.production.salaries);
  const socialChargesRate = sanitize(indicators.social_charges, 35.0) / 100;
  const totalLaborCost = payrollBase * (1 + socialChargesRate);

  // --- 3. COMPRA DE MATÉRIA-PRIMA (LÓGICA EXCEL FIDELITY) ---
  const qtyA = sanitize(decisions.production.purchaseMPA);
  const qtyB = sanitize(decisions.production.purchaseMPB);
  const totalNominalPurchase = (qtyA * indicators.prices.mp_a) + (qtyB * indicators.prices.mp_b);
  
  const paymentType = decisions.production.paymentType || 0; // 0: à vista, 1: 50/50, 2: 33/33/33
  const supplierInterestRate = sanitize(indicators.supplier_interest, 1.5) / 100;
  
  let mpCashOut = 0;
  let mpFutureLiability = 0;
  let totalFinancialExpenseMP = 0;

  if (paymentType === 0) {
    mpCashOut = round2(totalNominalPurchase);
    mpFutureLiability = 0;
  } else {
    const divisor = paymentType === 1 ? 2 : 3;
    const baseParcel = totalNominalPurchase / divisor;
    
    // Parcela à Vista (Parcela 0)
    mpCashOut = round2(baseParcel);
    
    // Cálculo das parcelas a prazo com juros compostos
    for (let n = 1; n < divisor; n++) {
      const parcelWithInterest = round2(baseParcel * Math.pow(1 + supplierInterestRate, n));
      mpFutureLiability += parcelWithInterest;
      totalFinancialExpenseMP += (parcelWithInterest - baseParcel);
    }
  }

  // --- 4. PRODUÇÃO EXTRA (ÁGIO 5%) ---
  const avgPrice = Object.values(decisions.regions).reduce((a: any, b: any) => a + b.price, 0) / Math.max(1, Object.keys(decisions.regions).length);
  const demandFactor = Math.pow(indicators.avg_selling_price / Math.max(1, avgPrice), 1.2) * (1 + indicators.demand_variation/100);
  
  const baseRevenue = 4184440 * demandFactor * (decisions.production.activityLevel / 100);
  let extraRevenue = 0;
  let specialPurchaseValue = 0;
  
  if (demandFactor > (decisions.production.activityLevel / 100)) {
     const extraFactor = Math.min(0.2, demandFactor - (decisions.production.activityLevel / 100));
     extraRevenue = 4184440 * extraFactor;
     const premium = sanitize(indicators.special_purchase_premium, 5.0) / 100;
     specialPurchaseValue = (extraRevenue * 0.35) * (1 + premium); 
  }

  const revenue = baseRevenue + extraRevenue;
  // CPV considera o valor nominal da compra (estoque) + produção extra
  const cpv = (totalNominalPurchase * 0.7) + (specialPurchaseValue) + (totalLaborCost * 0.4); 

  // --- 5. GESTÃO DE DÍVIDA ---
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

  // --- 6. FLUXO DE CAIXA (DFC FIDELIDADE) ---
  const currentCashSales = revenue * 0.6;
  const manualLoanRequest = sanitize(decisions.finance.loanRequest);
  const totalInflow = currentCashSales + legacyReceivables + manualLoanRequest;

  // Saída de MP agora usa mpCashOut calculado pela regra do Excel
  const currentCashPurchases = mpCashOut + specialPurchaseValue;
  const totalOutflow = currentCashPurchases + legacyPayables + totalLaborCost + currentInterestLoans + currentAmortizationTotal;
  
  let projectedCash = prevCash + totalInflow - totalOutflow - sanitize(decisions.finance.application);
  
  // --- 7. EMPRÉSTIMO COMPULSÓRIO ---
  let compulsoryAmount = 0;
  if (projectedCash < 0) {
    compulsoryAmount = Math.abs(projectedCash);
    projectedCash = 0; 
    activeLoans.push({
      id: `compulsory-round${currentRound}-${Date.now()}`,
      type: 'compulsory', principal: compulsoryAmount, remaining_principal: compulsoryAmount,
      grace_periods: 0, total_installments: 1, remaining_installments: 1,
      interest_rate: indicators.interest_rate_tr, agio_rate_at_creation: indicators.compulsory_loan_agio, created_at_round: currentRound
    });
  }

  // --- 8. RESULTADO LÍQUIDO & PREMIAÇÕES ---
  // Juros de fornecedores entram no resultado financeiro
  const totalFinancialExpenses = currentInterestLoans + totalFinancialExpenseMP;
  const opex = (totalLaborCost * 0.6) + (revenue * 0.08) + 146402; // Manutenção fixa base

  const netProfit = revenue - cpv - opex - totalFinancialExpenses;
  let awardBonus = 0;
  const revError = Math.abs(revenue - sanitize(decisions.estimates?.forecasted_revenue)) / Math.max(1, revenue);
  if (revError < 0.05) awardBonus += indicators.award_values.revenue_precision;

  const finalEquity = prevEquity + netProfit + awardBonus;

  // --- 9. KPIs & STATEMENTS ---
  const kpis: KPIs = {
    rating: netProfit > 0 ? (finalEquity > 5000000 ? 'AAA' : 'AA') : 'B',
    loans: activeLoans,
    equity: finalEquity,
    current_cash: projectedCash,
    market_share: demandFactor * 11.1,
    motivation_score: decisions.hr.salary > indicators.hr_base.salary ? 0.9 : 0.6,
    statements: {
      dre: { revenue, cpv, opex, interest: totalFinancialExpenses, net_profit: netProfit, award_bonus: awardBonus },
      cash_flow: { 
        start: prevCash, 
        inflow: { total: totalInflow + awardBonus + compulsoryAmount, cash_sales: currentCashSales, legacy_receivables: legacyReceivables, manual_loan: manualLoanRequest, compulsory_trigger: compulsoryAmount, award_bonus: awardBonus }, 
        outflow: { total: totalOutflow, cash_purchases: currentCashPurchases, legacy_payables: legacyPayables, payroll: totalLaborCost, interest: totalFinancialExpenses, amortization: currentAmortizationTotal }, 
        final: projectedCash 
      },
      balance_sheet: [
        { 
          id: 'assets', label: 'ATIVO', value: finalEquity + activeLoans.reduce((a,b)=>a+b.remaining_principal,0) + mpFutureLiability, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: projectedCash, type: 'asset' },
            { id: 'assets.current.clients', label: 'Contas a Receber (Legado)', value: revenue * 0.4, type: 'asset' }
          ]
        },
        { 
          id: 'liabilities_pl', label: 'PASSIVO + PL', value: finalEquity + activeLoans.reduce((a,b)=>a+b.remaining_principal,0) + mpFutureLiability, type: 'totalizer', children: [
            { id: 'liabilities.suppliers', label: 'Fornecedores (A Pagar)', value: mpFutureLiability, type: 'liability' },
            { id: 'liabilities.loans', label: 'Empréstimos (ECP)', value: activeLoans.reduce((a,b)=>a+b.remaining_principal,0), type: 'liability' },
            { id: 'equity.total', label: 'Patrimônio Líquido', value: finalEquity, type: 'equity' }
          ]
        }
      ]
    }
  };

  return {
    revenue, netProfit, 
    debtRatio: ((activeLoans.reduce((a,b)=>a+b.remaining_principal,0) + mpFutureLiability) / Math.max(1, finalEquity)) * 100,
    creditRating: kpis.rating, 
    health: { cash: projectedCash, rating: kpis.rating },
    kpis, statements: kpis.statements, marketShare: kpis.market_share
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
