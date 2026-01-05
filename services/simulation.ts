
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, AdvancedIndicators, BlackSwanEvent } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

/**
 * Motor Industrial Empirion v9.0 - Global Mastery Engine
 * Integração sistêmica: DRE -> Balanço -> Fluxo de Caixa -> Rating de Crédito
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MacroIndicators,
  previousState?: any,
  isRoundZero: boolean = false
) => {
  // ROUND 0: Paridade absoluta Bernard Legacy ($ 9.176.940 Ativo)
  if (isRoundZero) {
    return {
      revenue: 3322735, ebitda: 1044555, netProfit: 73928, salesVolume: 8932,
      marketShare: 12.5, cashFlowNext: 840200, receivables: 1823735,
      loanLimit: 2500000, creditRating: 'AAA',
      suggestRecovery: false, capexBlocked: false, indicators: getRoundZeroAdvanced()
    };
  }

  const currentIndicators = (indicators || {
    inflationRate: 0.01,
    providerPrices: { mpA: 20.20, mpB: 40.40 },
    demand_regions: [12000],
    sectorAvgSalary: 1313,
    difficulty: { price_sensitivity: 2.0, demand_elasticity: 1.5, marketing_effectiveness: 1.0, crisis_probability: 0.0 },
    active_event: null
  }) as MacroIndicators;

  const event: BlackSwanEvent | null = currentIndicators.active_event || null;
  const evMod = event?.modifiers || { inflation: 0, demand: 0, interest: 0, productivity: 1, cost_multiplier: 1 };
  const diff = currentIndicators.difficulty || {};
  
  // 1. HERANÇA E ESTRUTURA DE CAPITAL
  const currentEquity = sanitize(previousState?.equity || 5055447);
  const currentAssets = sanitize(previousState?.total_assets || 9176940);
  const currentCash = sanitize(previousState?.cash || 840200);
  const previousReceivables = sanitize(previousState?.receivables || 1823735);
  const previousPayables = sanitize(previousState?.payables || 717605);

  // 2. RATING DE CRÉDITO E LIMITE BANCÁRIO (Lógica de Risco)
  // Limite = 40% do PL + 20% do Ativo Total
  const loanLimit = (currentEquity * 0.4) + (currentAssets * 0.2);
  const totalDebt = sanitize(previousState?.total_debt || 3372362) + decisions.finance.loanRequest;
  const leverageRatio = totalDebt / Math.max(currentEquity, 1);
  const creditRating = leverageRatio > 1.5 ? 'C' : leverageRatio > 0.8 ? 'B' : 'A';

  // 3. COMERCIAL - Modelo de Atratividade Competitiva
  const regions = Object.values(decisions.regions || {});
  const avgPrice = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.price), 0) / regions.length : 372;
  const totalMarketing = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.marketing), 0) : 0;
  
  // Efeito dos Prazos de Venda (Term 0: Vista, Term 1: 30d, Term 2: 60d)
  const avgTermDays = regions.length > 0 
    ? regions.reduce((acc, r) => acc + (r.term === 2 ? 60 : r.term === 1 ? 30 : 0), 0) / regions.length 
    : 0;

  const basePotential = (currentIndicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1) * (1 + (evMod.demand || 0));
  const priceRatio = 372 / Math.max(avgPrice, 1);
  const priceScore = Math.pow(priceRatio, sanitize(diff.price_sensitivity, 2.0));
  const mktScore = Math.log10((totalMarketing * sanitize(diff.marketing_effectiveness, 1.0)) + 10);
  
  // Demanda Estimada vs Capacidade Real
  const demandTotal = basePotential * priceScore * mktScore * (1 + (avgTermDays / 365));
  
  // 4. PRODUÇÃO E CUSTOS (OEE)
  const plrEfficiency = 1 + (decisions.hr.participationPercent / 50); // PLR aumenta produtividade
  const maxProduction = 30000 * (decisions.production.activityLevel / 100) * plrEfficiency * (evMod.productivity || 1);
  const salesVolume = Math.min(demandTotal, maxProduction);
  const revenue = salesVolume * avgPrice;

  const costMarkup = evMod.cost_multiplier || 1.0;
  const mpCost = (currentIndicators.providerPrices.mpA * 1.0 + currentIndicators.providerPrices.mpB * 0.5) * costMarkup;
  const cpv = salesVolume * mpCost;

  // 5. RECURSOS HUMANOS
  const payroll = (decisions.hr.sales_staff_count * decisions.hr.salary * 1.6);
  const trainingExp = (decisions.hr.trainingPercent * 500);
  
  // 6. DRE (ACCRUAL BASIS)
  const ebitda = revenue - cpv - payroll - trainingExp - 145000; // 145k despesa fixa admin
  const depreciation = currentAssets * 0.01; // 1% de depreciação linear
  const interestExp = totalDebt * (sanitize(currentIndicators.interestRateTR, 3.0) / 100);
  const netProfitBeforeTax = ebitda - depreciation - interestExp;
  const taxes = netProfitBeforeTax > 0 ? netProfitBeforeTax * 0.15 : 0;
  const netProfit = netProfitBeforeTax - taxes;

  // 7. FLUXO DE CAIXA (CASH BASIS)
  // Entradas: Parte das vendas atuais (baseada em prazos) + Recebíveis do round anterior
  const cashInflowFromSales = decisions.regions[1]?.term === 0 ? revenue : revenue * 0.5; // Simplificação para projeção
  const totalInflow = cashInflowFromSales + previousReceivables + decisions.finance.loanRequest;
  
  // Saídas: Pagamentos Operacionais + Juros + Investimentos
  const totalOutflow = cpv + payroll + trainingExp + interestExp + taxes + previousPayables;
  const projectedCashNext = currentCash + totalInflow - totalOutflow - decisions.finance.application;

  const adv = calculateAdvanced(revenue, cpv, ebitda, netProfit, previousReceivables, previousPayables, currentCash, decisions);

  return {
    revenue, ebitda, netProfit, salesVolume,
    marketShare: (salesVolume / (basePotential * 8)) * 100,
    cashFlowNext: projectedCashNext,
    receivables: revenue - cashInflowFromSales, // O que sobra para o próximo round
    loanLimit,
    creditRating,
    suggestRecovery: projectedCashNext < -500000,
    capexBlocked: creditRating === 'C',
    indicators: adv,
    activeEvent: event
  };
};

const calculateAdvanced = (
  rev: number, cpv: number, ebitda: number, net: number, 
  rec: number, pay: number, cash: number, decisions: DecisionData
): AdvancedIndicators => {
  const dailyRev = Math.max(rev / 30, 1);
  const dailyCPV = Math.max(cpv / 30, 1);
  const pmrv = rec / dailyRev;
  const pmre = 1466605 / dailyCPV; 
  const pmpc = pay / dailyCPV;

  return {
    nldcg_days: (rec + 1466605 - pay) / dailyRev,
    nldcg_components: { receivables: rec, inventory_finished: 0, inventory_raw: 1466605, suppliers: pay, other_payables: 31528 },
    trit: (net / 9176940) * 100,
    insolvency_index: 2.19, 
    prazos: { pmre, pmrv, pmpc, pmdo: 69, pmmp: 96 },
    ciclos: { operacional: pmre + pmrv, financeiro: (pmre + pmrv) - pmpc, economico: pmre },
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
