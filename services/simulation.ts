
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, Loan, AccountNode, Championship } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * CORE ORACLE ENGINE v30.36 - STABILITY BUILD
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
  const prevBS = previousState?.kpis?.statements?.balance_sheet || (previousState?.statements?.balance_sheet || INITIAL_INDUSTRIAL_FINANCIALS.balance_sheet);
  
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

  const prevCash = previousState?.cash ?? (getVal('assets.current.cash', prevBS) || 170000);
  const prevSuppliers = getVal('liabilities.current.suppliers', prevBS) || 717605;
  const prevInvestments = getVal('assets.current.investments', prevBS) || 0;
  const prevEquity = sanitize(previousState?.equity || 5055447);
  const prevPA_Val = getVal('assets.current.stock.pa', prevBS) || 454000;
  const prevPA_Qty = prevPA_Val / 227;

  // --- 1. OPERAÇÕES & DRE PRELIMINAR ---
  const tr_rate = sanitize(indicators.interest_rate_tr, 2.0) / 100;
  const agio_rate = sanitize(indicators.compulsory_loan_agio, 4.0) / 100;
  const late_penalty = sanitize(indicators.late_penalty_rate, 15.0) / 100;

  const totalPurchaseValue = (decisions.production.purchaseMPA * indicators.prices.mp_a) + (decisions.production.purchaseMPB * indicators.prices.mp_b);
  const revenue = 3322735 * (1 + (decisions.production.activityLevel / 200)); 
  const cpv = revenue * 0.65;
  const opex = revenue * 0.25;

  // --- 2. GESTÃO DE DÍVIDAS ---
  let activeLoans: Loan[] = previousState?.kpis?.loans || [];
  let currentInterest = 0;
  let currentAmortization = 0;

  activeLoans = activeLoans.map(loan => {
    const effectiveRate = loan.type === 'compulsory' ? (loan.interest_rate + agio_rate) : loan.interest_rate;
    currentInterest += loan.remaining_principal * effectiveRate;

    if (loan.grace_periods > 0) {
      loan.grace_periods -= 1;
    } else {
      const amort = loan.remaining_principal / Math.max(1, loan.remaining_installments);
      currentAmortization += amort;
      loan.remaining_principal -= amort;
      loan.remaining_installments -= 1;
    }
    return loan;
  }).filter(l => l.remaining_principal > 0.01);

  const buy = decisions.machinery.buy;
  const capex = (buy.alfa * indicators.machinery_values.alfa) + (buy.beta * indicators.machinery_values.beta) + (buy.gama * indicators.machinery_values.gama);
  
  if (capex > 0) {
    const bdiAmount = capex * 0.60;
    activeLoans.push({
      id: `bdi-${currentRound}-${Date.now()}`,
      type: 'bdi',
      principal: bdiAmount,
      remaining_principal: bdiAmount,
      grace_periods: 4,
      total_installments: 8,
      remaining_installments: 8,
      interest_rate: tr_rate,
      created_at_round: currentRound
    });
  }

  if (decisions.finance.loanRequest > 0) {
    const term = decisions.finance.loanTerm;
    activeLoans.push({
      id: `normal-${currentRound}-${Date.now()}`,
      type: 'normal',
      principal: decisions.finance.loanRequest,
      remaining_principal: decisions.finance.loanRequest,
      grace_periods: 0,
      total_installments: term === 0 ? 1 : term === 1 ? 4 : 12,
      remaining_installments: term === 0 ? 1 : term === 1 ? 4 : 12,
      interest_rate: tr_rate,
      created_at_round: currentRound
    });
  }

  // --- 3. FLUXO DE CAIXA & GATILHO COMPULSÓRIO ---
  const inflow = (revenue * 0.5) + (decisions.finance.loanRequest) + (capex * 0.6);
  const outflow = (totalPurchaseValue * 0.5) + (capex * 0.4) + opex + currentInterest + currentAmortization;
  
  let projectedCash = prevCash + inflow - outflow - decisions.finance.application;
  let penaltyCharge = 0;
  let compulsoryAmount = 0;

  if (projectedCash < 0) {
    compulsoryAmount = Math.abs(projectedCash);
    penaltyCharge = compulsoryAmount * late_penalty; 
    projectedCash = 0;

    activeLoans.push({
      id: `compulsory-${currentRound}-${Date.now()}`,
      type: 'compulsory',
      principal: compulsoryAmount,
      remaining_principal: compulsoryAmount,
      grace_periods: 0,
      total_installments: 1,
      remaining_installments: 1,
      interest_rate: tr_rate,
      created_at_round: currentRound
    });
  }

  // --- 4. RESULTADO LÍQUIDO & BALANÇO ---
  const finResult = (prevInvestments * 0.01) - currentInterest - penaltyCharge;
  const lair = (revenue - cpv - opex) + finResult;
  const tax = lair > 0 ? lair * (indicators.tax_rate_ir / 100) : 0;
  const netProfit = lair - tax;

  const ecp_total = activeLoans.reduce((acc, l) => {
    const nextAmort = l.grace_periods > 0 ? 0 : l.remaining_principal / Math.max(1, l.remaining_installments);
    return acc + (l.type === 'compulsory' ? l.remaining_principal : nextAmort);
  }, 0);
  const elp_total = activeLoans.reduce((acc, l) => acc + l.remaining_principal, 0) - ecp_total;

  const finalEquity = prevEquity + netProfit;

  const kpis: KPIs = {
    rating: netProfit > 0 ? (lair > revenue * 0.1 ? 'AAA' : 'AA') : 'B',
    loans: activeLoans,
    equity: finalEquity,
    market_share: 12.5,
    insolvency_status: projectedCash > 0 ? 'SAUDAVEL' : 'ALERTA',
    statements: {
      dre: { revenue, cpv, gross_profit: revenue - cpv, opex, operatingProfit: revenue - cpv - opex, financial_result: finResult, net_profit: netProfit },
      cash_flow: { start: prevCash, inflow: { total: inflow + compulsoryAmount, compulsory: compulsoryAmount }, outflow: { total: outflow + penaltyCharge, interest: currentInterest, amortization: currentAmortization, penalties: penaltyCharge }, final: projectedCash },
      balance_sheet: [
        { id: 'liabilities.current.ecp', label: 'Empréstimos CP (ECP)', value: ecp_total, type: 'liability' },
        { id: 'liabilities.longterm.elp', label: 'Empréstimos LP (ELP)', value: elp_total, type: 'liability' }
      ]
    }
  };

  return {
    revenue,
    netProfit,
    debtRatio: ((ecp_total + elp_total) / finalEquity) * 100,
    creditRating: kpis.rating,
    health: { cash: projectedCash, rating: kpis.rating },
    kpis,
    statements: kpis.statements
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
