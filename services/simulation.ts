
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, InsolvencyStatus, RegionType, Championship, MachineModel, MachineSpec, InitialMachine, Loan, AccountNode } from '../types';
import { INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_MACRO } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

/**
 * CORE ORACLE ENGINE v30.30 - FULL DEBT & CASH SURVIVAL
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

  // --- 0. INDICADORES E SALDOS INICIAIS ---
  const indicators = { ...DEFAULT_MACRO, ...baseIndicators, ...(roundRules?.[currentRound] || {}) };
  // Fix: Added parentheses to resolve mixed logical operators warning
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

  // Fix: Added parentheses to resolve mixed logical operators warning
  const prevCash = previousState?.cash ?? (getVal('assets.current.cash', prevBS) || 170000);
  const prevClients = getVal('assets.current.clients', prevBS) || 1823735;
  const prevSuppliers = getVal('liabilities.current.suppliers', prevBS) || 717605;
  const prevMPA_Val = getVal('assets.current.stock.mpa', prevBS) || 628545;
  const prevMPB_Val = getVal('assets.current.stock.mpb', prevBS) || 838060;
  const prevPA_Val = getVal('assets.current.stock.pa', prevBS) || 454000;
  // Fix: Defined missing prevPA_Qty using a standard unit cost divisor
  const prevPA_Qty = prevPA_Val / 227; 
  const prevEquity = sanitize(previousState?.equity || 5055447);
  const prevInvestments = getVal('assets.current.investments', prevBS) || 0;

  // --- 1. OPERAÇÕES & PRODUÇÃO ---
  const fleet = (previousState?.fleet || indicators.initial_machinery_mix) as InitialMachine[];
  const machineSpecs = indicators.machine_specs;
  const nominalCapacity = fleet.reduce((acc, m) => acc + (machineSpecs[m.model]?.production_capacity || 0), 0);
  const activityLevel = sanitize(safeDecisions.production.activityLevel, 80);
  const unitsProduced = nominalCapacity * (activityLevel / 100);

  // Custos de Insumos
  const purchasePriceMPA = indicators.prices.mp_a;
  const purchasePriceMPB = indicators.prices.mp_b;
  const purchaseMPA_Qty = sanitize(safeDecisions.production.purchaseMPA, 0);
  const purchaseMPB_Qty = sanitize(safeDecisions.production.purchaseMPB, 0);
  const totalPurchaseValue = (purchaseMPA_Qty * purchasePriceMPA) + (purchaseMPB_Qty * purchasePriceMPB);

  // --- 2. GESTÃO DE DÍVIDAS (ORACLE DEBT MANAGER) ---
  let activeLoans: Loan[] = previousState?.kpis?.loans || [];
  let totalInterest = 0;
  let totalAmortization = 0;
  const tr_rate = sanitize(indicators.interest_rate_tr, 2.0) / 100;
  const agio_rate = sanitize(indicators.compulsory_loan_agio, 15.0) / 100;

  // Adicionar Novo BDI (Compra de Máquinas - 60% Financiado)
  const buy = safeDecisions.machinery.buy;
  const capexTotal = (buy.alfa * indicators.machinery_values.alfa) + 
                     (buy.beta * indicators.machinery_values.beta) + 
                     (buy.gama * indicators.machinery_values.gama);
  
  if (capexTotal > 0) {
    const bdiAmount = capexTotal * 0.60;
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

  // Adicionar Empréstimo Normal Decidido
  if (safeDecisions.finance.loanRequest > 0) {
    const term = safeDecisions.finance.loanTerm; // 0=CP, 1=LP, 2=VLP
    activeLoans.push({
      id: `normal-${currentRound}-${Date.now()}`,
      type: 'normal',
      principal: safeDecisions.finance.loanRequest,
      remaining_principal: safeDecisions.finance.loanRequest,
      grace_periods: 0,
      total_installments: term === 0 ? 1 : term === 1 ? 4 : 8,
      remaining_installments: term === 0 ? 1 : term === 1 ? 4 : 8,
      interest_rate: tr_rate,
      created_at_round: currentRound
    });
  }

  // Processamento de Juros e Amortização de Rodada
  activeLoans = activeLoans.map(loan => {
    let currentInterest = 0;
    let currentAmort = 0;
    const effectiveRate = loan.type === 'compulsory' ? (loan.interest_rate + agio_rate) : loan.interest_rate;
    
    // 1. Juros sobre o saldo devedor
    currentInterest = loan.remaining_principal * effectiveRate;
    totalInterest += currentInterest;

    // 2. Verificação de Carência (apenas BDI)
    if (loan.grace_periods > 0) {
      loan.grace_periods -= 1;
    } else {
      // 3. Amortização do Principal
      currentAmort = loan.remaining_principal / Math.max(1, loan.remaining_installments);
      totalAmortization += currentAmort;
      loan.remaining_principal -= currentAmort;
      loan.remaining_installments -= 1;
    }
    return loan;
  }).filter(loan => loan.remaining_principal > 0.01);

  // --- 3. CICLO COMERCIAL & DRE ---
  // Fix: Using prevPA_Qty now that it's defined
  const unitsSold = Math.min(prevPA_Qty + unitsProduced, (nominalCapacity * 0.125) * (1 + (safeDecisions.production.rd_investment / 40)));
  const totalRevenue = unitsSold * sanitize(indicators.avg_selling_price, 375);
  
  // Fix: Using prevPA_Qty now that it's defined
  const wacPA = unitsProduced > 0 ? (prevPA_Val + (unitsProduced * 280)) / (prevPA_Qty + unitsProduced) : 227;
  const cpv = unitsSold * wacPA;
  const opex = (unitsSold * 45) + 250000;
  const badDebt = prevClients * (indicators.customer_default_rate / 100);
  
  const operatingProfit = totalRevenue - cpv - opex - badDebt;
  const finRev = prevInvestments * (indicators.investment_return_rate / 100);
  const finResult = finRev - totalInterest;
  const lair = operatingProfit + finResult;
  const tax = lair > 0 ? lair * (indicators.tax_rate_ir / 100) : 0;
  const netProfit = lair - tax;

  // --- 4. FLUXO DE CAIXA & GATILHO COMPULSÓRIO ---
  const inflowFromSales = (totalRevenue * 0.5) + (prevClients * 0.45);
  const machineSalesInflow = (safeDecisions.machinery.sell.alfa * indicators.machinery_values.alfa * (1 - indicators.machine_sale_discount/100));
  
  const totalInflow = inflowFromSales + machineSalesInflow + finRev + safeDecisions.finance.loanRequest + (capexTotal * 0.6);
  
  const suppliersOutflow = (totalPurchaseValue * 0.5) + (prevSuppliers * 0.5);
  const capexCashOut = capexTotal * 0.40; // 40% à vista no round da compra
  const totalOutflow = suppliersOutflow + capexCashOut + opex + totalInterest + totalAmortization + tax;

  let finalCash = prevCash + totalInflow - totalOutflow - safeDecisions.finance.application;
  let compulsoryInflow = 0;

  // GATILHO: EMPRÉSTIMO COMPULSÓRIO (Anti-Caixa Negativo)
  if (finalCash < 0) {
    compulsoryInflow = Math.abs(finalCash);
    finalCash = 0;
    activeLoans.push({
      id: `compulsory-${currentRound}-${Date.now()}`,
      type: 'compulsory',
      principal: compulsoryInflow,
      remaining_principal: compulsoryInflow,
      grace_periods: 0,
      total_installments: 1,
      remaining_installments: 1,
      interest_rate: tr_rate, // Ágio somado no próximo processamento
      created_at_round: currentRound
    });
  }

  // --- 5. BALANÇO (ECP vs ELP) ---
  const ecp = activeLoans.reduce((acc, l) => acc + (l.grace_periods === 0 ? l.remaining_principal / Math.max(1, l.remaining_installments) : 0), 0) + (compulsoryInflow > 0 ? 0 : 0);
  // O compulsório recém-criado entra como ECP total para o próximo round
  const ecp_total = activeLoans.filter(l => l.remaining_installments === 1 || l.type === 'compulsory').reduce((acc, l) => acc + l.remaining_principal, 0);
  const elp_total = activeLoans.reduce((acc, l) => acc + l.remaining_principal, 0) - ecp_total;

  const finalEquity = prevEquity + netProfit;

  const buildBS = (): AccountNode[] => [
    { id: 'assets', label: 'ATIVO', value: finalCash + (prevClients * 0.8) + 8000000, type: 'totalizer', children: [
        { id: 'assets.current', label: 'ATIVO CIRCULANTE', value: finalCash + (prevClients * 0.8) + 1500000, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: finalCash, type: 'asset' },
            { id: 'assets.current.clients', label: 'Contas a Receber', value: prevClients * 0.8, type: 'asset' },
            { id: 'assets.current.investments', label: 'Aplicações', value: prevInvestments + safeDecisions.finance.application, type: 'asset' }
        ]},
        { id: 'assets.fixed', label: 'ATIVO IMOBILIZADO', value: 6500000, type: 'asset' }
    ]},
    { id: 'liabilities_pl', label: 'PASSIVO + PL', value: finalCash + (prevClients * 0.8) + 8000000, type: 'totalizer', children: [
        { id: 'liabilities.current', label: 'PASSIVO CIRCULANTE', value: ecp_total + (prevSuppliers * 0.5) + tax, type: 'totalizer', children: [
            { id: 'liabilities.current.ecp', label: 'Empréstimos Curto Prazo (ECP)', value: ecp_total, type: 'liability' },
            { id: 'liabilities.current.suppliers', label: 'Fornecedores', value: prevSuppliers * 0.5, type: 'liability' },
            { id: 'liabilities.current.taxes', label: 'Impostos a Pagar', value: tax, type: 'liability' }
        ]},
        { id: 'liabilities.longterm', label: 'PASSIVO NÃO CIRCULANTE', value: elp_total, type: 'totalizer', children: [
            { id: 'liabilities.longterm.elp', label: 'Empréstimos Longo Prazo (ELP)', value: elp_total, type: 'liability' }
        ]},
        { id: 'equity', label: 'PATRIMÔNIO LÍQUIDO', value: finalEquity, type: 'totalizer', children: [
            { id: 'equity.capital', label: 'Capital Social', value: 5000000, type: 'equity' },
            { id: 'equity.profit', label: 'Lucros Acumulados', value: finalEquity - 5000000, type: 'equity' }
        ]}
    ]}
  ];

  return {
    revenue: totalRevenue,
    netProfit: netProfit,
    debtRatio: ((ecp_total + elp_total) / finalEquity) * 100,
    creditRating: netProfit > 0 ? (lair > totalRevenue * 0.15 ? 'AAA' : 'AA') : (finalCash <= 0 ? 'D' : 'B'),
    health: { 
        rating: netProfit > 0 ? 'AAA' : 'B', 
        cash: finalCash,
        insolvency_risk: (ecp_total + elp_total) > finalEquity ? 70 : 10
    },
    kpis: {
      market_share: 12.5,
      rating: netProfit > 0 ? 'AAA' : 'B',
      insolvency_status: finalCash > 0 ? 'SAUDAVEL' : 'ALERTA',
      equity: finalEquity,
      loans: activeLoans,
      fleet: fleet.map(m => ({ ...m, age: m.age + 1 })),
      motivation_score: 0.8,
      is_on_strike: false,
      market_valuation: { share_price: 1.0, tsr: 0.0 }
    },
    statements: {
      dre: {
        revenue: totalRevenue,
        cpv,
        gross_profit: totalRevenue - cpv,
        opex: opex + badDebt,
        // Fix: corrected typo operating_profit -> operatingProfit
        operatingProfit: operatingProfit,
        financial_result: finResult,
        lair,
        tax,
        net_profit: netProfit,
        details: { interest: totalInterest, bad_debt: badDebt }
      },
      cash_flow: {
        start: prevCash,
        inflow: { total: totalInflow + compulsoryInflow, cash_sales: inflowFromSales, loans: safeDecisions.finance.loanRequest + (capexTotal * 0.6), compulsory: compulsoryInflow },
        outflow: { total: totalOutflow, suppliers: suppliersOutflow, interest: totalInterest, amortization: totalAmortization, taxes: tax },
        final: finalCash
      },
      balance_sheet: buildBS()
    }
  };
};

export const calculateAttractiveness = (decisions: DecisionData): number => {
  const priceAvg = Object.values(decisions.regions).reduce((acc, r) => acc + sanitize(r.price, 375), 0) / Math.max(1, Object.keys(decisions.regions).length);
  const mktAvg = Object.values(decisions.regions).reduce((acc, r) => acc + sanitize(r.marketing, 0), 0) / Math.max(1, Object.keys(decisions.regions).length);
  return (Math.pow(370 / Math.max(1, priceAvg), 1.5)) * (1 + (mktAvg * 0.05));
};
