import { DecisionData, Branch, EcosystemConfig, MacroIndicators, KPIs, CreditRating, ProjectionResult, AccountNode, Championship } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

export const sanitize = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return (isNaN(num) || !isFinite(num)) ? fallback : num;
};

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Utilitário de Conversão Cambial Relativa
 */
export const convertValue = (value: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>) => {
  if (!rates[fromCurrency] || !rates[toCurrency]) return value;
  return value * (rates[fromCurrency] / rates[toCurrency]);
};

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

  const defaultCurrency = championshipData?.currency || 'BRL';
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
  const initialEquity = 7200000; // Capital Social base

  // --- 2. OPERACIONAL ---
  const qtyPurchA = sanitize(decisions.production?.purchaseMPA);
  const purchA_GrossTotal = (qtyPurchA * indicators.prices.mp_a) * (1 + (indicators.supplier_interest/100));
  const activityLevel = sanitize(decisions.production?.activityLevel, 80) / 100;
  
  let totalRevenueGross = 0;
  let totalQty = 0;
  let avgPrice = 0;
  const regionsCount = Object.keys(decisions.regions || {}).length || 1;
  const regionConfigs = (championshipData as any)?.region_configs || [];

  Object.entries(decisions.regions || {}).forEach(([id, reg]: [any, any]) => {
    const regConfig = regionConfigs.find((rc: any) => rc.id === Number(id));
    const regCurrency = regConfig?.currency || defaultCurrency;
    
    const price = sanitize(reg.price, 425);
    const qty = (9700 / 4) * Math.pow(425/Math.max(1, price), 1.1) * activityLevel;
    totalQty += qty;

    let regionalRev = price * qty;
    if (regCurrency === 'BTC') {
       regionalRev *= (1 + (Math.random() * 0.6 - 0.3)); 
    }

    const convertedRev = convertValue(regionalRev, regCurrency, defaultCurrency, indicators.exchange_rates);
    totalRevenueGross += round2(convertedRev);
    avgPrice += price / regionsCount;
  });

  const netSalesRevenue = totalRevenueGross * 0.85;
  const opexBase = 500000;
  const cpv = totalRevenueGross * 0.65;
  const variableCostPerUnit = cpv / Math.max(1, totalQty);
  const ebit = netSalesRevenue - cpv - opexBase; 
  const netProfit = ebit - 2500; 

  const projectedCash = prevCash + (totalRevenueGross * 0.5) - cpv;
  const currentReceivables = totalRevenueGross * 0.5;
  const currentPayables = purchA_GrossTotal * 0.5;
  
  const finalEquity = round2(prevEquity + netProfit);
  const finalAssets = round2(prevAssets + netProfit + 100000); 
  const finalLiabilities = round2(finalAssets - finalEquity);

  // --- 3. MÉTRICAS AVANÇADAS ORACLE ---
  const liquidityCurrent = round2((projectedCash + currentReceivables) / Math.max(1, currentPayables));
  
  // Termômetro de Kanitz (Z-Score adaptado)
  const kanitzScore = round2((netProfit / Math.max(1, finalEquity)) * 10 + liquidityCurrent - (finalLiabilities / finalAssets));
  
  // TSR (Total Shareholder Return) - Valorização + Dividendos
  const dividends = (netProfit > 0) ? (netProfit * (indicators.dividend_percent / 100)) : 0;
  const tsr = round2(((finalEquity + dividends - initialEquity) / initialEquity) * 100);

  // DCF Valuation (Free Cash Flow / (WACC - G))
  const wacc = 0.12; 
  const growth = 0.03; 
  const fcf = ebit * 0.75; 
  const dcfValuation = round2(fcf / (wacc - growth));

  const kpis: KPIs = {
    rating: projectedCash > 0 ? 'AAA' : 'C',
    loans: previousState?.kpis?.loans || [],
    current_cash: projectedCash,
    equity: finalEquity,
    market_share: (totalQty / 9700) * 11.1,
    tsr: tsr,
    roi: round2((netProfit / Math.max(1, finalEquity)) * 100),
    bep: round2(opexBase / Math.max(0.1, (avgPrice - variableCostPerUnit))),
    solvency_index: round2(finalAssets / Math.max(1, finalLiabilities)),
    solvency_score_kanitz: kanitzScore,
    dcf_valuation: dcfValuation,
    ebitda: round2(ebit * 1.2),
    nlcdg: round2(currentReceivables - currentPayables),
    inventory_turnover: round2(cpv / Math.max(1, (finalAssets * 0.15))), 
    liquidity_current: liquidityCurrent,
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
    debtRatio: round2((finalLiabilities / Math.max(1, finalEquity)) * 100), 
    creditRating: kpis.rating, 
    health: { cash: projectedCash, rating: kpis.rating },
    kpis, 
    statements: kpis.statements, 
    marketShare: kpis.market_share || 0
  };
};

export const calculateAttractiveness = (d: DecisionData) => 50;
