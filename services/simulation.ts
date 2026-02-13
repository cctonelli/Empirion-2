import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs } from '../types';

/**
 * EMPIRION SIMULATION KERNEL v18.0
 * Strategic Calculation Engine for Business Model Generation
 */

// Helper to sanitize numeric inputs from potentially dirty decision objects
// Added export to fix "is not a module" error in supabase.ts
export const sanitize = (val: any, fallback: number): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

// Helper for 2-decimal rounding for consistent financial reporting
// Added export to fix scope errors in calculateProjections
export const round2 = (val: number): number => Math.round(val * 100) / 100;

/**
 * calculateProjections
 * Main deterministic engine that converts decisions and macro context into financial outputs.
 * This implementation resolves all "Cannot find name" errors from the previous snippet.
 */
export const calculateProjections = (
  decision: DecisionData,
  branch: Branch,
  ecosystem: EcosystemConfig,
  indicators: MacroIndicators,
  team: Team
): ProjectionResult => {
  // Use price from Region 1 as proxy for aggregate pricing in this simplified calculation
  const regions = decision.regions || {};
  const firstRegionId = Object.keys(regions)[0] || "1";
  const price = sanitize(regions[Number(firstRegionId)]?.price, indicators.avg_selling_price || 425);
  
  // 1. Demand Modeling
  // Demand is driven by Macro Confidence (ICE), price relative to market, and ecosystem multiplier
  const ice = sanitize(indicators.ice, 3.0);
  const baseDemand = 10000 * (ice / 3) * (ecosystem.demand_multiplier || 1);
  const priceElasticity = 1.2;
  const avgPrice = indicators.avg_selling_price || 425;
  const priceRatio = price / avgPrice;
  const priceEffect = Math.pow(1 / Math.max(0.1, priceRatio), priceElasticity);
  
  // Total Market Demand for this unit
  const demandVariation = sanitize(indicators.demand_variation, 0);
  const totalUnitsSold = Math.floor(baseDemand * priceEffect * (1 + (demandVariation / 100)));
  
  // 2. Financial Performance
  const revenue = totalUnitsSold * price;
  
  // Cost of Goods Sold (Unit materials + labor proxy)
  const unitCost = (indicators.prices?.mp_a || 20) + (indicators.prices?.mp_b || 40) + ((indicators.prices?.distribution_unit || 50) / 2);
  const cogs = totalUnitsSold * unitCost;
  const grossProfit = revenue - cogs;
  
  // Operational Expenses (Admin staff + Marketing proxy)
  const marketingSpend = Object.values(regions).reduce((acc, r) => acc + (sanitize(r.marketing, 0) * (indicators.prices?.marketing_campaign || 10000)), 0);
  const adminCount = indicators.staffing?.admin?.count || 20;
  const adminSalaries = indicators.staffing?.admin?.salaries || 4;
  const baseSalary = indicators.hr_base?.salary || 2000;
  const adminOpex = adminCount * adminSalaries * baseSalary;
  const totalOpex = adminOpex + marketingSpend;
  
  const ebitda = grossProfit - totalOpex;
  const depreciation = (team.equity || 7252171.74) * 0.025; // 2.5% flat depreciation proxy
  const netProfitBeforeTax = ebitda - depreciation;
  
  const taxRate = indicators.tax_rate_ir || 25.0;
  const tax = netProfitBeforeTax > 0 ? netProfitBeforeTax * (taxRate / 100) : 0;
  const netProfit = netProfitBeforeTax - tax;

  // 3. TSR (Total Shareholder Return) - Valorização + Dividendos
  // Calculation refined: (Current Equity + Dividends Paid - Initial Equity) / Initial Equity
  const dividendPercent = indicators.dividend_percent || 25.0;
  const dividends = (netProfit > 0) ? (netProfit * (dividendPercent / 100)) : 0;
  
  // Use a stable base for equity calculation in this mock
  // Fallback to initial value from constants
  const baseEquity = 7252171.74; 
  const currentEquity = team.equity || baseEquity;
  const finalEquity = currentEquity + netProfit - dividends;
  
  // Fixed calculation logic to satisfy the snippet requirements
  const tsr = round2(((finalEquity + dividends - baseEquity) / baseEquity) * 100);

  // 4. Market Metrics
  const totalMarketSize = baseDemand * 5; // Assuming 5 competitors
  const marketShare = round2((totalUnitsSold / totalMarketSize) * 100);

  // 5. Audit Ratings (Simplified Logic)
  let rating: CreditRating = 'AAA';
  if (netProfit < 0) rating = 'B';
  if (finalEquity < baseEquity * 0.8) rating = 'C';
  if (finalEquity < baseEquity * 0.5) rating = 'D';

  return {
    revenue,
    netProfit,
    debtRatio: 15.5,
    creditRating: rating,
    health: {
      cash: sanitize(team.kpis?.current_cash, 0) + netProfit - dividends,
      rating: rating
    },
    marketShare,
    statements: {
      dre: { 
        revenue, 
        vat_sales: 0,
        net_sales: revenue,
        cpv: cogs, 
        gross_profit: grossProfit, 
        opex: totalOpex,
        operating_profit: ebitda,
        taxes: tax,
        ppr: 0,
        net_profit: netProfit 
      },
      cash_flow: { 
        start: sanitize(team.kpis?.current_cash, 0),
        inflow: { total: revenue },
        outflow: { total: cogs + totalOpex + tax + dividends },
        final: sanitize(team.kpis?.current_cash, 0) + netProfit - dividends
      },
      balance_sheet: team.kpis?.statements?.balance_sheet || []
    },
    kpis: {
      ...team.kpis,
      rating,
      tsr,
      ebitda: round2(ebitda),
      equity: round2(finalEquity),
      market_share: marketShare,
      solvency_index: 2.1,
      solvency_score_kanitz: round2((netProfit / baseEquity) * 10),
      dcf_valuation: round2(finalEquity * 1.2),
      liquidity_current: 2.5,
      nlcdg: 92.4,
      avg_receivable_days: 45,
      avg_payable_days: 30,
      scissors_effect: -15
    }
  };
};