import { DecisionData, Branch, EcosystemConfig, MacroIndicators, AdvancedIndicators, BlackSwanEvent, CreditRating, FinancialHealth, ProjectionResult } from '../types';

/**
 * Sanitize: Permite números negativos para suportar prejuízos reais no P&L e depreciação.
 */
export const sanitize = (val: any, fallback: number = 0): number => {
  const num = Number(val);
  return isFinite(num) ? num : fallback;
};

/**
 * Helper: Detecta se o rating atual é pior que o anterior.
 */
export const isRatingLower = (current: CreditRating, previous: CreditRating): boolean => {
  const order: CreditRating[] = ['AAA', 'AA', 'A', 'B', 'C', 'D', 'N/A'];
  const curIdx = order.indexOf(current);
  const prevIdx = order.indexOf(previous);
  if (curIdx === -1 || prevIdx === -1) return false;
  return curIdx > prevIdx;
};

/**
 * Tabela de Spread de Risco - Protocolo v2.85
 * AAA: 0% | AA: 2% | A: 5% | B: 10% | C: 20% | D: 40%
 */
const getRiskSpread = (rating: CreditRating): number => {
  const spreads: Record<string, number> = {
    'AAA': 0,
    'AA': 2.0,
    'A': 5.0,
    'B': 10.0,
    'C': 20.0,
    'D': 40.0,
    'N/A': 10.0
  };
  return spreads[rating] ?? 10.0;
};

/**
 * Motor Industrial Empirion v13.0 - Oracle Integrity Kernel
 * Final Blindagem Protocol v2.86 - Downgrade Detection
 */
export const calculateProjections = (
  decisions: DecisionData, 
  branch: Branch, 
  ecoConfig: EcosystemConfig,
  indicators?: MacroIndicators,
  previousState?: any,
  isRoundZero: boolean = false
): ProjectionResult => {
  try {
    const getAttr = (camel: string, snake: string, fallback: any) => {
      const data = indicators as any;
      return data?.[snake] ?? data?.[camel] ?? fallback;
    };

    const currentIndicators = {
      inflationRate: getAttr('inflationRate', 'inflation_rate', 0.01),
      interestRateTR: getAttr('interestRateTR', 'interest_rate', 3.0),
      marketingExpenseBase: getAttr('marketingExpenseBase', 'base_marketing_cost', 17165),
      baseAdminCost: getAttr('baseAdminCost', 'base_admin_cost', 114880),
      factoryMaxCapacity: getAttr('avgProdPerMan', 'factory_max_capacity', 50000),
      providerPrices: indicators?.providerPrices || { mpA: 20.20, mpB: 40.40 },
      demand_regions: indicators?.demand_regions || [12000],
      sectorAvgSalary: indicators?.sectorAvgSalary || 1313,
      distributionCostUnit: getAttr('distributionCostUnit', 'base_freight_unit_cost', 50.50),
      difficulty: indicators?.difficulty || { price_sensitivity: 2.0, marketing_effectiveness: 1.0 },
      active_event: indicators?.active_event || null
    };

    const inflationMult = (1 + (sanitize(currentIndicators.inflationRate, 0)));
    const event: BlackSwanEvent | null = currentIndicators.active_event || null;
    const evMod = event?.modifiers || { inflation: 0, demand: 0, interest: 0, productivity: 1, cost_multiplier: 1 };
    
    if (isRoundZero) {
      return {
        revenue: 3322735, ebitda: 1044555, netProfit: 73928, salesVolume: 8932,
        totalMarketingCost: 802702, debtRatio: 44.9,
        marketShare: 12.5, cashFlowNext: 840200,
        loanLimit: 2500000, totalOutflow: 0, totalLiquidity: 840200,
        creditRating: 'AAA' as CreditRating,
        health: { 
          liquidity_ratio: 1.5, 
          debt_to_equity: 0.6, 
          insolvency_risk: 10, 
          rating: 'AAA' as CreditRating, 
          debt_rating: 'AAA' as CreditRating,
          is_bankrupt: false,
          insolvency_deficit: 0
        } as FinancialHealth,
        insolvency_deficit: 0,
        suggestRecovery: false, capexBlocked: false,
        statements: null,
        indicators: getRoundZeroAdvanced(),
        costBreakdown: [],
        activeEvent: null
      };
    }

    // 1. Snapshot de Herança
    const prevEquity = sanitize(previousState?.balance_sheet?.equity?.total || 5055447, 5055447);
    const prevAssets = sanitize(previousState?.balance_sheet?.assets?.total || 9176940, 9176940);
    const prevCash = sanitize(previousState?.balance_sheet?.assets?.current?.cash || 840200, 840200);
    const prevReceivables = sanitize(previousState?.balance_sheet?.assets?.current?.receivables || 1823735, 1823735);
    const prevPayables = sanitize(previousState?.balance_sheet?.liabilities?.current?.suppliers || 717605, 717605);
    const prevDebt = sanitize(previousState?.balance_sheet?.liabilities?.total_debt || 3372362, 3372362);
    const prevRating: CreditRating = previousState?.health?.rating || 'AAA';

    // 2. Oracle Risk Core
    const totalDebt = sanitize(prevDebt + decisions.finance.loanRequest, 0);
    const debtToEquity = sanitize(totalDebt / Math.max(prevEquity, 1), 0);
    const is_bankrupt = prevEquity < 0;

    const rating: CreditRating = (
      is_bankrupt ? 'D' : 
      debtToEquity > 2.5 ? 'D' : 
      debtToEquity > 1.8 ? 'C' : 
      debtToEquity > 1.2 ? 'B' : 'A'
    ) as CreditRating;

    const is_downgraded = isRatingLower(rating, prevRating);
    const loanLimit = Math.max((prevEquity * 0.6) + (prevAssets * 0.1), 0);
    
    // 3. Comercial & Demanda
    const regions = Object.values(decisions.regions || {});
    const avgPrice = regions.length > 0 ? regions.reduce((acc, r) => acc + sanitize(r.price, 372), 0) / regions.length : 372;
    const baseMkt = sanitize(currentIndicators.marketingExpenseBase, 17165) * inflationMult;
    const totalMarketingCost = regions.reduce((acc, r) => {
      const level = sanitize(r.marketing, 0);
      return level === 0 ? acc : acc + (baseMkt * Math.pow(level, 1.5));
    }, 0);

    const avgTermDays = regions.length > 0 
      ? regions.reduce((acc, r) => acc + (r.term === 2 ? 60 : r.term === 1 ? 30 : 0), 0) / regions.length 
      : 0;

    const basePotential = (currentIndicators.demand_regions?.[0] || 12000) * (ecoConfig.demandMultiplier || 1) * (1 + (evMod.demand || 0));
    const priceScore = Math.pow(372 / Math.max(avgPrice, 1), currentIndicators.difficulty?.price_sensitivity || 2.0);
    const totalMktPoints = regions.reduce((a, b) => a + sanitize(b.marketing, 0), 0);
    const mktScore = Math.log10(((totalMktPoints * (currentIndicators.difficulty?.marketing_effectiveness || 1.0))) + 10);
    const demandTotal = basePotential * priceScore * mktScore * (1 + (avgTermDays / 365));
    
    // 4. Produção
    const currentOEE = (1.0 + (decisions.hr.trainingPercent / 1000) + (decisions.hr.participationPercent / 200)) * (evMod.productivity || 1);
    const maxProduction = (currentIndicators.factoryMaxCapacity || 30000) * (decisions.production.activityLevel / 100) * currentOEE;
    const salesVolume = Math.min(demandTotal, maxProduction);
    const revenue = salesVolume * avgPrice;

    const unitMpA = sanitize(currentIndicators.providerPrices.mpA, 20.20) * inflationMult;
    const unitMpB = sanitize(currentIndicators.providerPrices.mpB, 40.40) * inflationMult;
    const mpCostTotal = (decisions.production.purchaseMPA * unitMpA) + (decisions.production.purchaseMPB * unitMpB);
    
    const unitSalary = sanitize(currentIndicators.sectorAvgSalary, 1313) * inflationMult;
    const payrollTotal = (decisions.hr.sales_staff_count * unitSalary * 1.6);
    const adminExpenses = sanitize(currentIndicators.baseAdminCost, 114880) * inflationMult;

    // 5. DRE com Juros Baseados em Rating (Risk Premium)
    const cpv = salesVolume * (unitMpA + unitMpB * 0.5);
    const ebitda = revenue - cpv - payrollTotal - totalMarketingCost - (decisions.hr.trainingPercent * 500) - adminExpenses;
    
    const baseInterest = sanitize(currentIndicators.interestRateTR, 3.0);
    const riskSpread = getRiskSpread(rating);
    const effectiveAnnualRate = baseInterest + riskSpread;
    const interestExp = totalDebt * (effectiveAnnualRate / 100); 

    const netProfit = (ebitda - (prevAssets * 0.01) - interestExp) * 0.85;

    // 6. Fluxo de Caixa e Insolvência
    const mpOutflow = decisions.production.paymentType === 0 ? mpCostTotal : 0;
    const cashInflow = revenue * (avgTermDays === 0 ? 1 : 0.4) + prevReceivables;
    const unitDist = sanitize(currentIndicators.distributionCostUnit, 50.50) * inflationMult;
    const totalOutflow = mpOutflow + payrollTotal + interestExp + prevPayables + totalMarketingCost + (salesVolume * unitDist) + adminExpenses;
    const totalLiquidity = prevCash + cashInflow + decisions.finance.loanRequest;
    const finalCash = totalLiquidity - totalOutflow - decisions.finance.application;
    const insolvency_deficit = Math.max(totalOutflow - totalLiquidity, 0);
    
    const finalAssets = finalCash + (revenue * 0.6) + (prevAssets * 0.99);
    const finalEquity = prevEquity + netProfit;
    const debtRatio = ((finalAssets - finalEquity) / Math.max(finalAssets, 1)) * 100;

    return {
      revenue, ebitda, netProfit, salesVolume, totalMarketingCost, debtRatio, totalOutflow, totalLiquidity,
      marketShare: (salesVolume / (basePotential * 8)) * 100,
      cashFlowNext: finalCash,
      loanLimit,
      creditRating: rating,
      interestExp,
      riskSpread,
      health: { 
          liquidity_ratio: finalCash / Math.max(totalDebt * 0.2, 1), 
          debt_to_equity: debtToEquity, 
          insolvency_risk: Math.min((debtRatio * 1.2), 100), 
          rating, 
          debt_rating: rating,
          previous_rating: prevRating,
          is_downgraded,
          is_bankrupt: finalEquity < 0,
          insolvency_deficit
      } as FinancialHealth,
      insolvency_deficit,
      suggestRecovery: debtRatio > 60,
      capexBlocked: rating === 'C' || rating === 'D',
      activeEvent: event,
      costBreakdown: [
        { name: 'Matéria-Prima', total: mpOutflow, impact: 'Desembolso Imediato' },
        { name: 'Marketing Exponencial', total: totalMarketingCost, impact: 'Burn Rate Vendas' },
        { name: 'Folha & Admin', total: payrollTotal + adminExpenses, impact: 'Custo Fixo Inflacionado' },
        { name: `Juros Bancários (Rating ${rating})`, total: interestExp, impact: `Taxa de ${effectiveAnnualRate.toFixed(2)}% (Base: ${baseInterest}% + Risco: ${riskSpread}%)` }
      ],
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
  } catch (error) {
    console.error("Simulation Engine Critical Failure (v13.0):", error);
    return {
      revenue: 0, totalOutflow: 0, totalLiquidity: 0, insolvency_deficit: 0,
      health: { rating: 'D' as CreditRating, debt_rating: 'D' as CreditRating, is_bankrupt: true, insolvency_deficit: 0, insolvency_risk: 100 }
    };
  }
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