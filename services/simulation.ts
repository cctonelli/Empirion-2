
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, AdvancedIndicators, BlackSwanEvent, CreditRating, FinancialHealth } from '../types';

const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) && num >= 0 ? num : fallback;
};

/**
 * Motor Industrial Empirion v11.6 - Solvency & Governance Engine
 * Implementa custos exponenciais de marketing, inflação composta e auditoria de desembolso.
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MacroIndicators,
  previousState?: any,
  isRoundZero: boolean = false
) => {
  // Configurações Base do Oráculo
  const currentIndicators = (indicators || {
    inflationRate: 0.01,
    providerPrices: { mpA: 20.20, mpB: 40.40 },
    demand_regions: [12000],
    sectorAvgSalary: 1313,
    marketingExpenseBase: 17165, // Ajustado para resultar em ~$802k no Round 0 (Nível 3)
    distributionCostUnit: 50.50,
    difficulty: { price_sensitivity: 2.0, marketing_effectiveness: 1.0 },
    active_event: null
  }) as MacroIndicators;

  const inflationMult = (1 + (currentIndicators.inflationRate || 0));
  const event: BlackSwanEvent | null = currentIndicators.active_event || null;
  const evMod = event?.modifiers || { inflation: 0, demand: 0, interest: 0, productivity: 1, cost_multiplier: 1 };
  
  if (isRoundZero) {
    return {
      revenue: 3322735, ebitda: 1044555, netProfit: 73928, salesVolume: 8932,
      lostSales: 0, totalMarketingCost: 802702, debtRatio: 44.9,
      marketShare: 12.5, cashFlowNext: 840200, receivables: 1823735,
      loanLimit: 2500000, creditRating: 'AAA' as CreditRating,
      health: { liquidity_ratio: 1.5, debt_to_equity: 0.6, insolvency_risk: 10, rating: 'AAA', is_bankrupt: false } as FinancialHealth,
      suggestRecovery: false, capexBlocked: false,
      statements: null,
      indicators: getRoundZeroAdvanced(),
      costBreakdown: []
    };
  }

  // 1. HERANÇA (SNAPSHOT)
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
  
  // LOGICA MARKETING EXPONENCIAL V3.3 - CORREÇÃO INFLACIONÁRIA
  const baseMkt = sanitize(currentIndicators.marketingExpenseBase, 17165) * inflationMult;
  const totalMarketingCost = regions.reduce((acc, r) => {
    const level = sanitize(r.marketing);
    if (level === 0) return acc;
    // Formula Exponencial: (Base * Nível^1.5)
    return acc + (baseMkt * Math.pow(level, 1.5));
  }, 0);

  const avgTermDays = regions.length > 0 
    ? regions.reduce((acc, r) => acc + (r.term === 2 ? 60 : r.term === 1 ? 30 : 0), 0) / regions.length 
    : 0;

  const basePotential = (currentIndicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1) * (1 + (evMod.demand || 0));
  const priceRatio = 372 / Math.max(avgPrice, 1);
  const priceScore = Math.pow(priceRatio, currentIndicators.difficulty?.price_sensitivity || 2.0);
  const totalMktPoints = regions.reduce((a, b) => a + sanitize(b.marketing), 0);
  const mktScore = Math.log10(((totalMktPoints * (currentIndicators.difficulty?.marketing_effectiveness || 1.0))) + 10);
  const demandTotal = basePotential * priceScore * mktScore * (1 + (avgTermDays / 365));
  
  // 4. PRODUÇÃO & CUSTOS INFLACIONADOS
  const currentOEE = (1.0 + (decisions.hr.trainingPercent / 1000) + (decisions.hr.participationPercent / 200)) * (evMod.productivity || 1);
  const maxProduction = 30000 * (decisions.production.activityLevel / 100) * currentOEE;
  const salesVolume = Math.min(demandTotal, maxProduction);
  const revenue = salesVolume * avgPrice;

  const unitMpA = sanitize(currentIndicators.providerPrices.mpA, 20.20) * inflationMult;
  const unitMpB = sanitize(currentIndicators.providerPrices.mpB, 40.40) * inflationMult;
  const mpCostTotal = (decisions.production.purchaseMPA * unitMpA) + (decisions.production.purchaseMPB * unitMpB);
  
  const unitSalary = sanitize(currentIndicators.sectorAvgSalary, 1313) * inflationMult;
  const payrollTotal = (decisions.hr.sales_staff_count * unitSalary * 1.6);
  
  const unitDist = sanitize(currentIndicators.distributionCostUnit, 50.50) * inflationMult;
  const distributionTotal = salesVolume * unitDist;

  // 5. DRE
  const cpv = salesVolume * (unitMpA + unitMpB * 0.5);
  const ebitda = revenue - cpv - payrollTotal - totalMarketingCost - (decisions.hr.trainingPercent * 500) - 145000;
  const interestExp = totalDebt * (sanitize(currentIndicators.interestRateTR, 3.0) / 100);
  const netProfit = (ebitda - (prevAssets * 0.01) - interestExp) * 0.85;

  // 6. CASH FLOW AUDIT (O "PULO DO GATO")
  // Gastos imediatos (Prazo 0) vs Prazo 1/2
  const mktOutflow = totalMarketingCost; // Mkt é desembolso imediato
  const mpOutflow = decisions.production.paymentType === 0 ? mpCostTotal : 0; // Se prazo > 0, vira Passivo
  
  const cashInflow = revenue * (avgTermDays === 0 ? 1 : 0.4) + prevReceivables;
  const totalOutflow = mpOutflow + payrollTotal + interestExp + prevPayables + mktOutflow + distributionTotal;
  const finalCash = prevCash + cashInflow + decisions.finance.loanRequest - totalOutflow - decisions.finance.application;
  
  const finalAssets = finalCash + (revenue * 0.6) + (prevAssets * 0.99);
  const finalEquity = prevEquity + netProfit;
  const debtRatio = ((finalAssets - finalEquity) / Math.max(finalAssets, 1)) * 100;

  // Itens para a Tabela de Viabilidade
  const costBreakdown = [
    { name: 'Matéria-Prima (Desembolso)', total: mpOutflow, impact: mpOutflow > 0 ? 'Saída de Caixa Imediata' : 'Vira Passivo Fornecedores' },
    { name: 'Marketing Exponencial', total: mktOutflow, impact: 'Consumo de Caixa p/ Vendas' },
    { name: 'Folha Salarial Industrial', total: payrollTotal, impact: 'Custo Fixo Corrigido' },
    { name: 'Distribuição & Logística', total: distributionTotal, impact: 'Variável por Volume' },
    { name: 'Juros & Taxas Bancárias', total: interestExp, impact: 'Custo da Dívida Acumulada' }
  ];

  return {
    revenue, ebitda, netProfit, salesVolume, totalMarketingCost, debtRatio, totalOutflow,
    marketShare: (salesVolume / (basePotential * 8)) * 100,
    cashFlowNext: finalCash,
    loanLimit,
    creditRating: rating,
    health: { 
        liquidity_ratio: finalCash / Math.max(totalDebt * 0.2, 1), 
        debt_to_equity: debtToEquity, 
        insolvency_risk: Math.min((debtRatio * 1.2), 100), 
        rating, 
        is_bankrupt: finalEquity < 0 
    },
    suggestRecovery: debtRatio > 60,
    capexBlocked: rating === 'C',
    activeEvent: event,
    costBreakdown,
    totalLiquidity: prevCash + cashInflow + decisions.finance.loanRequest,
    statements: {
        dre: { revenue, cpv, ebitda, net_profit: netProfit },
        balance_sheet: { 
            assets: { total: finalAssets, current: { cash: finalCash } },
            liabilities: { total_debt: totalDebt },
            equity: { total: finalEquity }
        },
        kpis: { market_share: (salesVolume / (basePotential * 8)) * 100, debt_ratio: debtRatio }
    },
    indicators: calculateAdvanced(revenue, cpv, ebitda, netProfit, (revenue * 0.6), mpCostTotal * 0.3, finalCash, decisions)
  };
};

const calculateAdvanced = (rev: number, cpv: number, ebitda: number, net: number, rec: number, pay: number, cash: number, decisions: DecisionData): AdvancedIndicators => {
  const dailyRev = Math.max(rev / 30, 1);
  return {
    nldcg_days: (rec + 1466605 - pay) / dailyRev,
    nldcg_components: { receivables: rec, inventory_finished: 0, inventory_raw: 1466605, suppliers: pay, other_payables: 31528 },
    trit: (net / 9176940) * 100,
    insolvency_index: 2.19, 
    prazos: { pmre: 58, pmrv: rec / dailyRev, pmpc: pay / Math.max(cpv/30, 1), pmdo: 69, pmmp: 96 },
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
