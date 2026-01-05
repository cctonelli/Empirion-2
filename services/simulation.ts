
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, AdvancedIndicators, BlackSwanEvent, CreditRating, FinancialHealth } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

/**
 * Motor Industrial Empirion v11.0 - Full Statement Generator
 * Gera DRE, Balanço e Fluxo de Caixa completos para persistência.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MacroIndicators,
  previousState?: any,
  isRoundZero: boolean = false
) => {
  // ROUND 0: Bernard Legacy Parity ($ 9.176.940 Assets)
  if (isRoundZero) {
    return {
      revenue: 3322735, ebitda: 1044555, netProfit: 73928, salesVolume: 8932,
      lostSales: 0,
      marketShare: 12.5, cashFlowNext: 840200, receivables: 1823735,
      loanLimit: 2500000, creditRating: 'AAA' as CreditRating,
      health: { liquidity_ratio: 1.5, debt_to_equity: 0.6, insolvency_risk: 10, rating: 'AAA', is_bankrupt: false } as FinancialHealth,
      suggestRecovery: false, capexBlocked: false,
      statements: null,
      indicators: getRoundZeroAdvanced()
    };
  }

  const currentIndicators = (indicators || {
    inflationRate: 0.01,
    providerPrices: { mpA: 20.20, mpB: 40.40 },
    demand_regions: [12000],
    sectorAvgSalary: 1313,
    difficulty: { price_sensitivity: 2.0, marketing_effectiveness: 1.0 },
    active_event: null
  }) as MacroIndicators;

  const event: BlackSwanEvent | null = currentIndicators.active_event || null;
  const evMod = event?.modifiers || { inflation: 0, demand: 0, interest: 0, productivity: 1, cost_multiplier: 1 };
  
  // 1. HERANÇA (SNAPSHOT)
  // Extrai valores do round anterior via JSONB ou template inicial
  const prevEquity = sanitize(previousState?.balance_sheet?.equity?.total || 5055447);
  const prevAssets = sanitize(previousState?.balance_sheet?.assets?.total || 9176940);
  const prevCash = sanitize(previousState?.balance_sheet?.assets?.current?.cash || 840200);
  const prevReceivables = sanitize(previousState?.balance_sheet?.assets?.current?.receivables || 1823735);
  const prevPayables = sanitize(previousState?.balance_sheet?.liabilities?.current?.suppliers || 717605);
  const prevDebt = sanitize(previousState?.balance_sheet?.liabilities?.total_debt || 3372362);

  // 2. ORACLE RISK NODE
  const totalDebt = prevDebt + decisions.finance.loanRequest;
  const loanLimit = Math.max((prevEquity * 0.6) + (prevAssets * 0.1), 0);
  const debtToEquity = totalDebt / Math.max(prevEquity, 1);
  const rating: CreditRating = debtToEquity > 1.8 ? 'C' : debtToEquity > 1.2 ? 'B' : debtToEquity > 0.6 ? 'A' : 'AAA';
  
  // 3. COMERCIAL & DEMANDA
  const regions = Object.values(decisions.regions || {});
  const avgPrice = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.price), 0) / regions.length : 372;
  const totalMarketing = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.marketing), 0) : 0;
  const avgTermDays = regions.length > 0 
    ? regions.reduce((acc, r) => acc + (r.term === 2 ? 60 : r.term === 1 ? 30 : 0), 0) / regions.length 
    : 0;

  const basePotential = (currentIndicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1) * (1 + (evMod.demand || 0));
  const priceRatio = 372 / Math.max(avgPrice, 1);
  const priceScore = Math.pow(priceRatio, currentIndicators.difficulty?.price_sensitivity || 2.0);
  const mktScore = Math.log10(((totalMarketing * (currentIndicators.difficulty?.marketing_effectiveness || 1.0))) + 10);
  const demandTotal = basePotential * priceScore * mktScore * (1 + (avgTermDays / 365));
  
  // 4. PRODUÇÃO & OEE
  const currentOEE = (1.0 + (decisions.hr.trainingPercent / 1000) + (decisions.hr.participationPercent / 200)) * (evMod.productivity || 1);
  const maxProduction = 30000 * (decisions.production.activityLevel / 100) * currentOEE;
  const salesVolume = Math.min(demandTotal, maxProduction);
  const lostSales = Math.max(demandTotal - maxProduction, 0);
  const revenue = salesVolume * avgPrice;

  // 5. DRE GENERATION
  const mpCost = (currentIndicators.providerPrices.mpA + currentIndicators.providerPrices.mpB * 0.5) * (evMod.cost_multiplier || 1);
  const cpv = salesVolume * mpCost;
  const payroll = (decisions.hr.sales_staff_count * decisions.hr.salary * 1.6);
  const marketingExp = totalMarketing * 5000;
  const ebitda = revenue - cpv - payroll - marketingExp - (decisions.hr.trainingPercent * 500) - 145000;
  const depreciation = prevAssets * 0.01;
  const interestExp = totalDebt * (sanitize(currentIndicators.interestRateTR, 3.0) / 100);
  const netProfit = (ebitda - depreciation - interestExp) * 0.85;

  // 6. CASH FLOW & BALANCE SHEET RECONCILIATION
  const cashInflow = revenue * (avgTermDays === 0 ? 1 : 0.4) + prevReceivables;
  const cashOutflow = cpv + payroll + interestExp + prevPayables;
  const finalCash = prevCash + cashInflow + decisions.finance.loanRequest - cashOutflow - decisions.finance.application;
  
  const finalReceivables = revenue * (avgTermDays === 0 ? 0 : 0.6);
  const finalAssets = finalCash + finalReceivables + (prevAssets * 0.99);
  const finalEquity = prevEquity + netProfit;

  return {
    revenue, ebitda, netProfit, salesVolume,
    lostSales,
    marketShare: (salesVolume / (basePotential * 8)) * 100,
    cashFlowNext: finalCash,
    receivables: finalReceivables,
    loanLimit,
    creditRating: rating,
    health: { 
        liquidity_ratio: finalCash / Math.max(totalDebt * 0.2, 1), 
        debt_to_equity: debtToEquity, 
        insolvency_risk: Math.min((debtToEquity * 50), 100), 
        rating, 
        is_bankrupt: finalEquity < 0 
    },
    suggestRecovery: debtToEquity > 1.5,
    capexBlocked: rating === 'C',
    activeEvent: event,
    statements: {
        dre: { revenue, cpv, ebitda, depreciation, interest: interestExp, net_profit: netProfit },
        balance_sheet: { 
            assets: { total: finalAssets, current: { cash: finalCash, receivables: finalReceivables }, fixed: prevAssets * 0.99 },
            liabilities: { total: finalAssets - finalEquity, current: { suppliers: cpv * 0.3 }, total_debt: totalDebt },
            equity: { total: finalEquity }
        },
        cash_flow: { inflow: cashInflow, outflow: cashOutflow, net: cashInflow - cashOutflow },
        kpis: { market_share: (salesVolume / (basePotential * 8)) * 100, roe: (netProfit / Math.max(finalEquity,1)) * 100 }
    },
    indicators: calculateAdvanced(revenue, cpv, ebitda, netProfit, finalReceivables, cpv * 0.3, finalCash, decisions)
  };
};

const calculateAdvanced = (rev: number, cpv: number, ebitda: number, net: number, rec: number, pay: number, cash: number, decisions: DecisionData): AdvancedIndicators => {
  const dailyRev = Math.max(rev / 30, 1);
  const dailyCPV = Math.max(cpv / 30, 1);
  return {
    nldcg_days: (rec + 1466605 - pay) / dailyRev,
    nldcg_components: { receivables: rec, inventory_finished: 0, inventory_raw: 1466605, suppliers: pay, other_payables: 31528 },
    trit: (net / 9176940) * 100,
    insolvency_index: 2.19, 
    prazos: { pmre: 58, pmrv: rec / dailyRev, pmpc: pay / dailyCPV, pmdo: 69, pmmp: 96 },
    ciclos: { operacional: 107, financeiro: -7, economico: 62 },
    fontes_financiamento: { ecp: rec + 417553, ccp: net - 905000, elp: 1500000 },
    scissors_effect: { ncg: rec + 717474, available_capital: cash + 500000, gap: (cash + 500000) - (rec + 717474) }
  };
};

const getRoundZeroAdvanced = (): AdvancedIndicators => ({
  nldcg_days: 70,
  nldcg_components: { receivables: 1823735, inventory_finished: 0, inventory_raw: 1466605, suppliers: 717605, other_payables: 31528 },
  trit: 0.95, insolvency_index: 2.19, prazos: { pmre: 58, pmrv: 49, pmpc: 46, pmdo: 69, pmmp: 96 },
  ciclos: { operacional: 107, financeiro: -7, economico: 62 },
  fontes_financiamento: { ecp: 2241288, ccp: -831153, elp: 1500000 },
  scissors_effect: { ncg: 2541209, available_capital: 668847, gap: -1890843 }
});
