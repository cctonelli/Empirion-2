
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, Loan, AccountNode, Championship, InitialMachine } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * CORE ORACLE ENGINE v15.25 - CONSOLIDATED MVP BUILD
 * Processamento atômico de decisões com separação clara de custos variáveis e fixos.
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

  const prevCash = sanitize(previousState?.current_cash ?? getVal('assets.current.cash', prevBS), 170000);
  const prevInvestments = sanitize(getVal('assets.current.investments', prevBS), 0);
  const prevEquity = sanitize(previousState?.equity || 5055447);

  // --- 1. FOLHA DE PAGAMENTO (STAFFING) ---
  const staffing = indicators.staffing || DEFAULT_MACRO.staffing;
  const baseSalary = sanitize(decisions.hr.salary, 1313);
  
  const payrollBase = (staffing.admin.count * baseSalary * staffing.admin.salaries) +
                      (staffing.sales.count * baseSalary * staffing.sales.salaries) +
                      (staffing.production.count * baseSalary * staffing.production.salaries);
  
  const socialChargesRate = sanitize(indicators.social_charges, 35.0) / 100;
  const totalLaborCost = payrollBase * (1 + socialChargesRate);

  // --- 2. DEPRECIAÇÃO & CAPEX ---
  const fleet = (previousState?.kpis?.fleet || indicators.initial_machinery_mix || []) as InitialMachine[];
  const depreciationTotal = fleet.reduce((acc, m) => {
    const spec = indicators.machine_specs[m.model];
    const val = m.purchase_value || spec.initial_value;
    return acc + (val * spec.depreciation_rate);
  }, 0);

  // --- 3. DRE TÁTICO ---
  const totalPurchaseValue = (sanitize(decisions.production.purchaseMPA) * indicators.prices.mp_a) + 
                             (sanitize(decisions.production.purchaseMPB) * indicators.prices.mp_b);
  
  // Market Logic
  const avgPrice = Object.values(decisions.regions).reduce((a, b) => a + b.price, 0) / Math.max(1, Object.keys(decisions.regions).length);
  const demandFactor = Math.pow(indicators.avg_selling_price / Math.max(1, avgPrice), 1.2) * (1 + indicators.demand_variation/100);
  const revenue = 3322735 * demandFactor * (decisions.production.activityLevel / 100);

  // CPV (Custo Variável: 70% Insumos + 40% MOD Direta)
  const cpv = (totalPurchaseValue * 0.7) + (totalLaborCost * 0.4); 
  // OPEX (Custo Fixo: 60% MOD + Despesas + Depreciação)
  const opex = (totalLaborCost * 0.6) + (revenue * 0.08) + depreciationTotal;

  // --- 4. FLUXO DE CAIXA & DÍVIDA ---
  let activeLoans: Loan[] = previousState?.kpis?.loans || [];
  let currentInterest = 0;
  let currentAmortization = 0;
  const tr_rate = sanitize(indicators.interest_rate_tr, 2.0) / 100;

  activeLoans = activeLoans.map(loan => {
    currentInterest += loan.remaining_principal * (loan.interest_rate / 100);
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

  const inflow = (revenue * 0.6) + sanitize(decisions.finance.loanRequest);
  const baseOutflow = (totalPurchaseValue * 0.5) + totalLaborCost + currentInterest + currentAmortization;
  
  let projectedCash = prevCash + inflow - baseOutflow - sanitize(decisions.finance.application);
  let compulsoryAmount = 0;
  if (projectedCash < 0) {
    compulsoryAmount = Math.abs(projectedCash);
    projectedCash = 0;
    activeLoans.push({
      id: `compulsory-${Date.now()}`, type: 'compulsory', principal: compulsoryAmount, remaining_principal: compulsoryAmount,
      grace_periods: 0, total_installments: 1, remaining_installments: 1, interest_rate: tr_rate + 0.05, created_at_round: currentRound
    });
  }

  // --- 5. RESULTADO LÍQUIDO & PREMIAÇÕES ---
  const netProfit = revenue - cpv - opex - currentInterest;
  let awardBonus = 0;
  const revError = Math.abs(revenue - sanitize(decisions.estimates?.forecasted_revenue)) / Math.max(1, revenue);
  if (revError < 0.05) awardBonus += indicators.award_values.revenue_precision;

  const finalEquity = prevEquity + netProfit + awardBonus;

  const kpis: KPIs = {
    rating: netProfit > 0 ? 'AAA' : 'B',
    loans: activeLoans,
    equity: finalEquity,
    current_cash: projectedCash,
    market_share: demandFactor * 10,
    motivation_score: decisions.hr.salary > indicators.hr_base.salary ? 0.9 : 0.6,
    statements: {
      dre: { revenue, cpv, opex, net_profit: netProfit, award_bonus: awardBonus },
      cash_flow: { 
        start: prevCash, 
        inflow: { total: inflow + awardBonus + compulsoryAmount, award_bonus: awardBonus }, 
        outflow: { total: baseOutflow, payroll: totalLaborCost, interest: currentInterest }, 
        final: projectedCash 
      },
      balance_sheet: [
        { id: 'assets.current.cash', label: 'Disponibilidades', value: projectedCash, type: 'asset' },
        { id: 'equity.total', label: 'Patrimônio Líquido', value: finalEquity, type: 'equity' }
      ]
    }
  };

  return {
    revenue, netProfit, debtRatio: (activeLoans.reduce((a,b)=>a+b.remaining_principal,0) / finalEquity) * 100,
    creditRating: kpis.rating, health: { cash: projectedCash, rating: kpis.rating },
    kpis, statements: kpis.statements, marketShare: kpis.market_share
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
