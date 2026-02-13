
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs } from '../types';

/**
 * EMPIRION SIMULATION KERNEL v18.0 - ORACLE CORE
 * Motor determinístico de projeção financeira e análise de risco multiregional.
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
  
  // 1. Modelagem de Demanda Base (Oracle High Fidelity)
  const ice = sanitize(indicators.ice, 3.0);
  const demandVariation = sanitize(indicators.demand_variation, 0);
  const baseDemand = 10000 * (ice / 3) * (ecosystem.demand_multiplier || 1) * (1 + (demandVariation / 100));

  let totalRevenueBase = 0;
  let totalUnitsSoldAllRegions = 0;
  let totalDemandWeight = 0;

  // Processamento multiregional com conversão de moedas e tarifas v18.0
  Object.entries(regions).forEach(([id, reg]: [any, any]) => {
    const regionId = parseInt(id);
    
    // Busca config da região se existir no indicador de mercado
    const regionConfig = indicators.region_configs?.find((r: any) => r.id === regionId);
    const regionCurrency = regionConfig?.currency || indicators.currency || 'BRL';
    const regionWeight = regionConfig?.demand_weight || (100 / Math.max(1, Object.keys(regions).length));
    
    totalDemandWeight += regionWeight;

    const price = sanitize(reg.price, indicators.avg_selling_price || 425);
    const priceRatio = price / (indicators.avg_selling_price || 425);
    const priceEffect = Math.pow(1 / Math.max(0.1, priceRatio), 1.2);
    const marketingEffect = 1 + (sanitize(reg.marketing, 0) * 0.05);

    /**
     * DEMANDA ELÁSTICA v18.0
     * A demanda regional é baseada no peso alocado pelo Tutor.
     */
    const regionalDemand = baseDemand * (regionWeight / 100);
    const unitsSold = Math.floor(regionalDemand * priceEffect * marketingEffect);
    
    /**
     * CONVERSÃO CROSS-CURRENCY v18.0
     * Regra: Valor_Base = (Valor_Local * Cotação_Moeda_Local) / Cotação_Moeda_Base
     */
    const localRate = indicators.exchange_rates?.[regionCurrency] || indicators[regionCurrency] || 1;
    const baseRate = indicators.exchange_rates?.[indicators.currency || 'BRL'] || indicators[indicators.currency || 'BRL'] || 1;
    
    const regionalRevenueLocal = unitsSold * price;
    const regionalRevenueBase = (regionalRevenueLocal * localRate) / baseRate;

    totalRevenueBase += regionalRevenueBase;
    totalUnitsSoldAllRegions += unitsSold;
  });

  const revenue = totalRevenueBase;
  const totalUnitsSold = totalUnitsSoldAllRegions;
  
  // 2. Estrutura de Custos e OPEX (Calculados na Moeda Base)
  // Ajustadores de inflação e insumos v18.0
  const mpaCost = (indicators.prices?.mp_a || 20) * (1 + (indicators.raw_material_a_adjust || 0) / 100);
  const mpbCost = (indicators.prices?.mp_b || 40);
  const unitCost = mpaCost + mpbCost + ((indicators.prices?.distribution_unit || 50) / 2);
  
  const cogs = totalUnitsSold * unitCost;
  const grossProfit = revenue - cogs;
  
  const marketingSpend = Object.values(regions).reduce((acc, r) => acc + (sanitize((r as any).marketing, 0) * (indicators.prices?.marketing_campaign || 10000)), 0);
  const adminOpex = (indicators.staffing?.admin?.count || 20) * (indicators.staffing?.admin?.salaries || 4) * (indicators.hr_base?.salary || 2000);
  const totalOpex = adminOpex + marketingSpend;
  
  const operatingProfit = grossProfit - totalOpex;
  
  // 3. Resultado Financeiro (Aplicações e Juros)
  const finRes = -2500; 
  const lair = operatingProfit + finRes;
  const taxProv = lair > 0 ? lair * (sanitize(indicators.tax_rate_ir, 25) / 100) : 0;
  const netProfit = lair - taxProv;

  // 4. Métricas de Comando
  const baseEquity = 7252171.74;
  const currentEquity = team.equity || baseEquity;
  const finalEquity = currentEquity + netProfit;
  const tsr = round2(((finalEquity - baseEquity) / baseEquity) * 100);
  
  // Market Share Aggregate
  const marketShare = round2((totalUnitsSold / (baseDemand * (totalDemandWeight / 100) * 8)) * 100);
  
  const kanitz = round2((netProfit / currentEquity) * 10 + (operatingProfit / revenue) * 5);
  const dcf = round2(finalEquity * (1 + (tsr / 100)));

  let rating: CreditRating = 'AAA';
  if (kanitz < 0) rating = 'C';
  if (kanitz < -5) rating = 'D';

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
      dre: { 
        revenue, net_sales: revenue, cpv: cogs, gross_profit: grossProfit, 
        opex: totalOpex, operating_profit: operatingProfit, fin_res: finRes,
        non_op_res: 0, lair, taxes: taxProv, profit_after_tax: netProfit,
        ppr: 0, net_profit: netProfit 
      },
      cash_flow: { final: sanitize(team.kpis?.current_cash, 0) + netProfit },
      balance_sheet: team.kpis?.statements?.balance_sheet || []
    },
    kpis: {
      ...team.kpis,
      rating, tsr, ebitda: operatingProfit, equity: finalEquity, market_share: marketShare,
      solvency_score_kanitz: kanitz, dcf_valuation: dcf
    }
  };
};
