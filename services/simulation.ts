
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, Loan, AccountNode, Championship, InitialMachine } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * CORE ORACLE ENGINE v15.35 - FIDELITY CASH FLOW KERNEL
 * Processamento de decisões com liquidação de saldos legados (AR/AP) e dívidas punitivas.
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
  
  // 1. Extração de Dados do Balanço Anterior (Baseline para Round 1)
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

  const prevCash = sanitize(previousState?.current_cash ?? getVal('assets.current.cash', prevBS), 170000);
  const prevEquity = sanitize(previousState?.equity || 5055447);
  
  // Saldos de Ciclos Anteriores (Ex: Clientes $2M e Fornecedores $717k do P00)
  const legacyReceivables = sanitize(getVal('assets.current.clients', prevBS));
  const legacyPayables = sanitize(getVal('liabilities.current.suppliers', prevBS));

  // --- 2. FOLHA DE PAGAMENTO (STAFFING) ---
  const staffing = indicators.staffing || DEFAULT_MACRO.staffing;
  const baseSalary = sanitize(decisions.hr.salary, 1313);
  const payrollBase = (staffing.admin.count * baseSalary * staffing.admin.salaries) +
                      (staffing.sales.count * baseSalary * staffing.sales.salaries) +
                      (staffing.production.count * baseSalary * staffing.production.salaries);
  const socialChargesRate = sanitize(indicators.social_charges, 35.0) / 100;
  const totalLaborCost = payrollBase * (1 + socialChargesRate);

  // --- 3. DEPRECIAÇÃO & CAPEX ---
  const fleet = (previousState?.kpis?.fleet || indicators.initial_machinery_mix || []) as InitialMachine[];
  const depreciationTotal = fleet.reduce((acc, m) => {
    const spec = indicators.machine_specs[m.model];
    const val = m.purchase_value || spec.initial_value;
    return acc + (val * spec.depreciation_rate);
  }, 0);

  // --- 4. DRE TÁTICO ---
  const totalPurchaseValue = (sanitize(decisions.production.purchaseMPA) * indicators.prices.mp_a) + 
                             (sanitize(decisions.production.purchaseMPB) * indicators.prices.mp_b);
  
  const avgPrice = Object.values(decisions.regions).reduce((a, b) => a + b.price, 0) / Math.max(1, Object.keys(decisions.regions).length);
  const demandFactor = Math.pow(indicators.avg_selling_price / Math.max(1, avgPrice), 1.2) * (1 + indicators.demand_variation/100);
  const revenue = 3322735 * demandFactor * (decisions.production.activityLevel / 100);

  const cpv = (totalPurchaseValue * 0.7) + (totalLaborCost * 0.4); 
  const opex = (totalLaborCost * 0.6) + (revenue * 0.08) + depreciationTotal;

  // --- 5. GESTÃO DE DÍVIDA (AMORTIZAÇÃO E JUROS) ---
  let activeLoans: Loan[] = previousState?.kpis?.loans ? JSON.parse(JSON.stringify(previousState.kpis.loans)) : [];
  let currentInterestTotal = 0;
  let currentAmortizationTotal = 0;

  activeLoans = activeLoans.map(loan => {
    let periodicInterest = 0;
    if (loan.type === 'compulsory') {
        const agioRate = sanitize(loan.agio_rate_at_creation, 3.0);
        const trRate = loan.interest_rate; 
        periodicInterest = loan.principal * ((agioRate + trRate) / 100);
    } else {
        periodicInterest = loan.remaining_principal * (loan.interest_rate / 100);
    }
    
    currentInterestTotal += periodicInterest;

    if (loan.grace_periods > 0) {
      loan.grace_periods -= 1;
    } else {
      const amort = loan.type === 'compulsory' 
        ? loan.remaining_principal 
        : loan.remaining_principal / Math.max(1, loan.remaining_installments);
      
      currentAmortizationTotal += amort;
      loan.remaining_principal -= amort;
      loan.remaining_installments -= 1;
    }
    return loan;
  }).filter(l => l.remaining_principal > 0.01);

  // --- 6. FLUXO DE CAIXA (DFC FIDELIDADE) ---
  const manualLoanRequest = sanitize(decisions.finance.loanRequest);
  
  // Inflow = Vendas à vista do ciclo (60%) + Recebimento total do ciclo anterior (Legado) + Premiações
  const currentCashSales = revenue * 0.6;
  const totalInflow = currentCashSales + legacyReceivables + manualLoanRequest;

  // Outflow = Compras à vista (50%) + Pagamento total do ciclo anterior (Legado) + Folha + Dívida
  const currentCashPurchases = totalPurchaseValue * 0.5;
  const totalOutflow = currentCashPurchases + legacyPayables + totalLaborCost + currentInterestTotal + currentAmortizationTotal;
  
  let projectedCash = prevCash + totalInflow - totalOutflow - sanitize(decisions.finance.application);
  
  // --- 7. GERAÇÃO DE EMPRÉSTIMO COMPULSÓRIO (SISTÊMICO) ---
  let compulsoryAmount = 0;
  if (projectedCash < 0) {
    compulsoryAmount = Math.abs(projectedCash);
    projectedCash = 0; 

    const currentTR = sanitize(indicators.interest_rate_tr, 2.0);
    const currentAgio = sanitize(indicators.compulsory_loan_agio, 3.0);

    activeLoans.push({
      id: `compulsory-round${currentRound}-${Date.now()}`,
      type: 'compulsory',
      principal: compulsoryAmount,
      remaining_principal: compulsoryAmount,
      grace_periods: 0,
      total_installments: 1,
      remaining_installments: 1,
      interest_rate: currentTR, 
      agio_rate_at_creation: currentAgio, 
      created_at_round: currentRound
    });
  }

  // --- 8. RESULTADO LÍQUIDO & PREMIAÇÕES ---
  const netProfit = revenue - cpv - opex - currentInterestTotal;
  let awardBonus = 0;
  const revError = Math.abs(revenue - sanitize(decisions.estimates?.forecasted_revenue)) / Math.max(1, revenue);
  if (revError < 0.05) awardBonus += indicators.award_values.revenue_precision;

  const finalEquity = prevEquity + netProfit + awardBonus;

  // --- 9. KPIs & STATEMENTS ---
  const kpis: KPIs = {
    rating: netProfit > 0 ? (finalEquity > 2000000 ? 'AAA' : 'AA') : 'B',
    loans: activeLoans,
    equity: finalEquity,
    current_cash: projectedCash,
    market_share: demandFactor * 10,
    motivation_score: decisions.hr.salary > indicators.hr_base.salary ? 0.9 : 0.6,
    statements: {
      dre: { 
        revenue, cpv, opex, 
        interest: currentInterestTotal, 
        net_profit: netProfit, 
        award_bonus: awardBonus 
      },
      cash_flow: { 
        start: prevCash, 
        inflow: { 
          total: totalInflow + awardBonus + compulsoryAmount, 
          cash_sales: currentCashSales,
          legacy_receivables: legacyReceivables,
          manual_loan: manualLoanRequest,
          compulsory_trigger: compulsoryAmount,
          award_bonus: awardBonus 
        }, 
        outflow: { 
          total: totalOutflow, 
          cash_purchases: currentCashPurchases,
          legacy_payables: legacyPayables,
          payroll: totalLaborCost, 
          interest: currentInterestTotal,
          amortization: currentAmortizationTotal
        }, 
        final: projectedCash 
      },
      balance_sheet: [
        { 
          id: 'assets', label: 'ATIVO', value: finalEquity + activeLoans.reduce((a,b)=>a+b.remaining_principal,0), type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: projectedCash, type: 'asset' },
            { id: 'assets.current.clients', label: 'Contas a Receber (Próximo Ciclo)', value: revenue * 0.4, type: 'asset' }
          ]
        },
        { 
          id: 'liabilities_pl', label: 'PASSIVO + PL', value: finalEquity + activeLoans.reduce((a,b)=>a+b.remaining_principal,0), type: 'totalizer', children: [
            { id: 'liabilities.suppliers', label: 'Fornecedores (Próximo Ciclo)', value: totalPurchaseValue * 0.5, type: 'liability' },
            { id: 'liabilities.loans', label: 'Empréstimos (ECP)', value: activeLoans.reduce((a,b)=>a+b.remaining_principal,0), type: 'liability' },
            { id: 'equity.total', label: 'Patrimônio Líquido', value: finalEquity, type: 'equity' }
          ]
        }
      ]
    }
  };

  return {
    revenue, netProfit, 
    debtRatio: (activeLoans.reduce((a,b)=>a+b.remaining_principal,0) / Math.max(1, finalEquity)) * 100,
    creditRating: kpis.rating, 
    health: { cash: projectedCash, rating: kpis.rating },
    kpis, 
    statements: kpis.statements, 
    marketShare: kpis.market_share
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
