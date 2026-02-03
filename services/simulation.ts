
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
 * CORE ORACLE ENGINE v15.36 - FIDELITY CASH FLOW KERNEL
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
  
  // MERGE LOGIC: Prioriza Round Atual -> Round 0 (Chronogram) -> Baseline Estático
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

  // --- 1. FOLHA DE PAGAMENTO E TREINAMENTO ---
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

  const isExpanding = (sanitize(decisions.hr.hired) > 0) || 
                      (decisions.machinery.buy.alfa + decisions.machinery.buy.beta + decisions.machinery.buy.gama > 0);
  
  let productivityModifier = 1.0;
  if (isExpanding && trainingRate < 0.15) {
     productivityModifier = 0.90; 
  }

  // --- 2. VENDAS E VARIAÇÃO CAMBIAL ---
  const salesInterest = sanitize(indicators.sales_interest_rate, 1.0) / 100;
  let totalRevenue = 0;
  let totalCurrentCashInflow = 0;
  let totalQuantitySold = 0;
  let totalFxGain = 0;
  let totalFxLoss = 0;

  const prevIndicators = currentRound > 0 ? { ...DEFAULT_MACRO, ...DEFAULT_INDUSTRIAL_CHRONOGRAM[0], ...baseIndicators, ...(roundRules?.[currentRound - 1] || {}) } : indicators;

  Object.entries(decisions.regions).forEach(([id, reg]) => {
    const regConfig = championshipData?.region_configs?.find(rc => rc.id === Number(id));
    const currency = regConfig?.currency || 'BRL';
    const price = sanitize(reg.price, 425);
    const termType = sanitize(reg.term, 1);
    
    const effectiveActivityLevel = (decisions.production.activityLevel / 100) * productivityModifier;
    const demandFactor = Math.pow(indicators.avg_selling_price / Math.max(1, price), 1.2) * (1 + indicators.demand_variation/100);
    const qty = 9700 * demandFactor * effectiveActivityLevel / (Object.keys(decisions.regions).length || 1);
    totalQuantitySold += qty;

    if (termType === 0) {
      const rev = round2(price * qty);
      totalRevenue += rev;
      totalCurrentCashInflow += rev;
    } else {
      const nper = termType === 1 ? 2 : 3;
      const pmt = calculatePMT(salesInterest, nper, price);
      const regionTotalRevenue = round2((pmt * nper) * qty);
      const regionCashInflow = round2(pmt * qty);
      totalRevenue += regionTotalRevenue;
      totalCurrentCashInflow += regionCashInflow;

      if (currency !== 'BRL') {
        const currentRate = indicators[currency] || indicators.exchange_rates?.[currency] || 1;
        const previousRate = prevIndicators[currency] || prevIndicators.exchange_rates?.[currency] || 1;
        if (currentRate !== previousRate && legacyReceivables > 0) {
           const fxImpact = legacyReceivables * ((currentRate / previousRate) - 1);
           if (fxImpact > 0) totalFxGain += fxImpact;
           else totalFxLoss += Math.abs(fxImpact);
        }
      }
    }
  });

  // --- 3. CUSTOS E CPP ---
  const totalNominalPurchase = (sanitize(decisions.production.purchaseMPA) * indicators.prices.mp_a) + 
                               (sanitize(decisions.production.purchaseMPB) * indicators.prices.mp_b);
  
  let specialPurchaseValue = 0;
  if (totalQuantitySold > (9700 * (decisions.production.activityLevel / 100))) {
     const extraQty = totalQuantitySold - (9700 * (decisions.production.activityLevel / 100));
     specialPurchaseValue = round2((extraQty * indicators.prices.mp_a * 1.5) * 1.15); 
  }

  const cpv = round2((totalNominalPurchase * 0.7) + specialPurchaseValue + (totalLaborCost * 0.4) + trainingExpense);
  
  const opex = round2(
    (totalLaborCost * 0.6) + 
    (totalRevenue * 0.08) + 
    (totalRevenue * 0.02) + 
    (146402)
  );

  // --- 4. GESTÃO DE DÍVIDA E CAPEX ---
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

  // --- 5. FLUXO DE CAIXA (DFC) ---
  const totalInflow = round2(totalCurrentCashInflow + legacyReceivables + totalFxGain + sanitize(decisions.finance.loanRequest));
  const totalOutflow = round2(totalNominalPurchase + machineBuyCost + legacyPayables + totalFxLoss + totalLaborCost + currentInterestLoans + currentAmortizationTotal + trainingExpense);
  
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

  const netProfit = round2(totalRevenue - cpv - opex - currentInterestLoans + totalFxGain - totalFxLoss);
  const finalEquity = round2(prevEquity + netProfit);

  const kpis: KPIs = {
    rating: netProfit > 0 ? 'AAA' : 'B',
    motivation_score: productivityModifier < 1 ? 0.70 : 0.85,
    loans: activeLoans,
    equity: finalEquity,
    current_cash: projectedCash,
    market_share: (totalQuantitySold / 9700) * 11.1,
    statements: {
      dre: { revenue: totalRevenue, cpv, opex, net_profit: netProfit },
      cash_flow: { 
        start: prevCash, 
        inflow: { total: totalInflow + compulsoryAmount, cash_sales: totalCurrentCashInflow }, 
        outflow: { total: totalOutflow, training: trainingExpense, payroll: totalLaborCost, interest: currentInterestLoans }, 
        final: projectedCash 
      },
      balance_sheet: [
        { id: 'assets', label: 'ATIVO', value: finalEquity + 2000000, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: projectedCash, type: 'asset' }
        ]}
      ]
    }
  };

  return {
    revenue: totalRevenue, netProfit, 
    debtRatio: 25, creditRating: kpis.rating, 
    health: { cash: projectedCash, rating: kpis.rating },
    kpis, statements: kpis.statements, marketShare: kpis.market_share
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
