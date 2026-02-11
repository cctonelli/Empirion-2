
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, AccountNode, Championship } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

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
  
  const lookupRound = Math.min(currentRound, 12);
  const indicators = { 
    ...DEFAULT_MACRO, 
    ...baseIndicators, 
    ...(roundRules?.[lookupRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[lookupRound] || {}) 
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

  // --- 1. SALDOS INICIAIS ---
  const prevCash = sanitize(previousState?.current_cash ?? getVal('assets.current.cash', prevBS), 0);
  const prevEquity = sanitize(previousState?.equity || 7252171.74);
  const prevAssets = sanitize(getVal('assets', prevBS), 9493163.54);
  const prevLiabilities = sanitize(getVal('liabilities.current', prevBS) + getVal('liabilities.longterm', prevBS), 2240991.80);

  // --- 2. OPERACIONAL (SIMPLIFICADO PARA O CONTEXTO) ---
  const qtyPurchA = sanitize(decisions.production?.purchaseMPA);
  const purchA_GrossTotal = (qtyPurchA * indicators.prices.mp_a) * (1 + (indicators.supplier_interest/100));
  
  const activityLevel = sanitize(decisions.production?.activityLevel, 80) / 100;
  const unitsToProduce = 10000 * activityLevel;
  
  // Vendas
  let totalRevenueGross = 0;
  let totalQty = 0;
  Object.values(decisions.regions || {}).forEach((reg: any) => {
    const price = sanitize(reg.price, 425);
    const qty = (9700 / 4) * Math.pow(425/Math.max(1, price), 1.1) * activityLevel;
    totalQty += qty;
    totalRevenueGross += round2(price * qty);
  });

  const netSalesRevenue = totalRevenueGross * 0.85;
  const cpv = totalRevenueGross * 0.65;
  const ebit = netSalesRevenue - cpv - 500000; // OPEX fixo mock
  const netProfit = ebit - 2500; // Despesa juros mock

  const projectedCash = prevCash + (totalRevenueGross * 0.5) - cpv;
  const currentReceivables = totalRevenueGross * 0.5;
  const currentPayables = purchA_GrossTotal * 0.5;
  
  const finalEquity = round2(prevEquity + netProfit);
  const finalAssets = round2(prevAssets + netProfit + 100000); // Mock expansion
  const finalLiabilities = round2(finalAssets - finalEquity);

  // --- 3. CÁLCULO DE KPIs AVANÇADOS v17.0 ---
  const kpis: KPIs = {
    rating: projectedCash > 0 ? 'AAA' : 'C',
    loans: previousState?.kpis?.loans || [],
    current_cash: projectedCash,
    equity: finalEquity,
    market_share: (totalQty / 9700) * 11.1,
    
    // Cálculos de Auditoria
    solvency_index: round2(finalAssets / Math.max(1, finalLiabilities)),
    nlcdg: round2(currentReceivables - currentPayables),
    inventory_turnover: round2(cpv / Math.max(1, (finalAssets * 0.15))), // Mock inventory
    liquidity_current: round2((projectedCash + currentReceivables) / Math.max(1, currentPayables)),
    trit: round2(ebit / 2500),
    scissors_effect: round2(30 - 45), // Mock: PMR - PMP
    avg_receivable_days: 45,
    avg_payable_days: 30,
    equity_immobilization: round2(6012500 / finalEquity),
    debt_participation_pct: round2((finalLiabilities / finalEquity) * 100),
    debt_composition_st_pct: 100, // No trial tudo é ST
    
    statements: {
      dre: { revenue: totalRevenueGross, net_profit: netProfit, ebit: ebit },
      balance_sheet: [
        { id: 'assets', label: 'ATIVO', value: finalAssets, children: [
            { id: 'assets.current', label: 'CIRCULANTE', value: round2(projectedCash + currentReceivables), children: [
                { id: 'assets.current.cash', label: 'Caixa', value: projectedCash, type: 'asset' },
                { id: 'assets.current.clients', label: 'Clientes', value: currentReceivables, type: 'asset' }
            ]}
        ]},
        { id: 'liabilities_pl', label: 'PASSIVO + PL', value: finalAssets, children: [
            { id: 'equity', label: 'PATRIMÔNIO LÍQUIDO', value: finalEquity, type: 'totalizer' }
        ]}
      ]
    }
  };

  return {
    revenue: totalRevenueGross, 
    netProfit: netProfit, 
    debtRatio: kpis.debt_participation_pct || 0, 
    creditRating: kpis.rating, 
    health: { cash: projectedCash, rating: kpis.rating },
    kpis, 
    statements: kpis.statements, 
    marketShare: kpis.market_share || 0
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
