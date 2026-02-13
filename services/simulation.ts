
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs } from '../types';

/**
 * EMPIRION SIMULATION KERNEL v18.0 - ORACLE CORE
 * Motor determinístico de projeção financeira e análise de risco.
 */

export const sanitize = (val: any, fallback: number): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

export const round2 = (val: number): number => Math.round(val * 100) / 100;

export const calculateProjections = (
  decision: DecisionData,
  branch: Branch,
  ecosystem: EcosystemConfig,
  indicators: MacroIndicators,
  team: Team
): ProjectionResult => {
  const regions = decision.regions || {};
  const firstRegionId = Object.keys(regions)[0] || "1";
  const reg1 = regions[Number(firstRegionId)] || {};
  const price = sanitize(reg1.price, indicators.avg_selling_price || 425);
  
  // 1. Modelagem de Demanda Baseada em Preço e Macro (ICE)
  const ice = sanitize(indicators.ice, 3.0);
  const baseDemand = 10000 * (ice / 3) * (ecosystem.demand_multiplier || 1);
  const priceRatio = price / (indicators.avg_selling_price || 425);
  const priceEffect = Math.pow(1 / Math.max(0.1, priceRatio), 1.2);
  const marketingEffect = 1 + (Object.values(regions).reduce((acc, r) => acc + sanitize(r.marketing, 0), 0) * 0.05);
  
  const totalUnitsSold = Math.floor(baseDemand * priceEffect * marketingEffect);
  const revenue = totalUnitsSold * price;
  
  // 2. Custos e OPEX
  const unitCost = (indicators.prices?.mp_a || 20) + (indicators.prices?.mp_b || 40) + ((indicators.prices?.distribution_unit || 50) / 2);
  const cogs = totalUnitsSold * unitCost;
  const grossProfit = revenue - cogs;
  
  const marketingSpend = Object.values(regions).reduce((acc, r) => acc + (sanitize(r.marketing, 0) * (indicators.prices?.marketing_campaign || 10000)), 0);
  const adminOpex = (indicators.staffing?.admin?.count || 20) * (indicators.staffing?.admin?.salaries || 4) * (indicators.hr_base?.salary || 2000);
  const totalOpex = adminOpex + marketingSpend;
  
  const ebitda = grossProfit - totalOpex;
  const baseEquity = 7252171.74;
  const currentEquity = team.equity || baseEquity;
  const depreciation = currentEquity * 0.025;
  const netProfit = (ebitda - depreciation) * 0.75; // 25% Tax proxy

  // 3. Métricas Avançadas (War Room Telemetry)
  const finalEquity = currentEquity + netProfit;
  const tsr = round2(((finalEquity - baseEquity) / baseEquity) * 100);
  const marketShare = round2((totalUnitsSold / (baseDemand * 8)) * 100);
  
  // NLCDG: Necessidade de Capital de Giro (proxy baseada em ciclo financeiro)
  const nlcdg = round2((revenue / 360) * (sanitize(reg1.term, 1) * 30));
  
  // Termômetro de Kanitz (Solvência) - Simplificado para simulador
  const kanitz = round2((netProfit / currentEquity) * 10 + (ebitda / revenue) * 5);
  
  // DCF Valuation (Fluxo de Caixa Descontado Simplificado)
  const dcf = round2(finalEquity * (1 + (tsr / 100)));

  let rating: CreditRating = 'AAA';
  if (kanitz < 0) rating = 'C';
  if (kanitz < -5) rating = 'D';
  if (netProfit < 0 && rating === 'AAA') rating = 'B';

  return {
    revenue,
    netProfit,
    debtRatio: 15.5,
    creditRating: rating,
    health: {
      cash: sanitize(team.kpis?.current_cash, 0) + netProfit,
      rating: rating
    },
    marketShare,
    statements: {
      dre: { revenue, net_sales: revenue, cpv: cogs, gross_profit: grossProfit, opex: totalOpex, operating_profit: ebitda, net_profit: netProfit },
      cash_flow: { final: sanitize(team.kpis?.current_cash, 0) + netProfit },
      balance_sheet: team.kpis?.statements?.balance_sheet || []
    },
    kpis: {
      ...team.kpis,
      rating, tsr, ebitda, equity: finalEquity, market_share: marketShare,
      nlcdg, solvency_score_kanitz: kanitz, dcf_valuation: dcf
    }
  };
};
