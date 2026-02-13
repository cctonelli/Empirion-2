
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
  
  // 1. Modelagem de Demanda (Oracle High Fidelity)
  const ice = sanitize(indicators.ice, 3.0);
  const demandVariation = sanitize(indicators.demand_variation, 0);
  const baseDemand = 10000 * (ice / 3) * (ecosystem.demand_multiplier || 1) * (1 + (demandVariation / 100));

  let totalRevenueBase = 0;
  let totalUnitsSoldAllRegions = 0;

  // Processamento multiregional com conversão de moedas
  Object.entries(regions).forEach(([id, reg]: [any, any]) => {
    const regionId = parseInt(id);
    
    // Busca config da região se existir no indicador de mercado
    const regionConfig = indicators.region_configs?.find((r: any) => r.id === regionId);
    const regionCurrency = regionConfig?.currency || indicators.currency || 'BRL';
    const regionWeight = regionConfig?.demand_weight || (100 / Math.max(1, Object.keys(regions).length));
    
    const price = sanitize(reg.price, indicators.avg_selling_price || 425);
    const priceRatio = price / (indicators.avg_selling_price || 425);
    const priceEffect = Math.pow(1 / Math.max(0.1, priceRatio), 1.2);
    const marketingEffect = 1 + (sanitize(reg.marketing, 0) * 0.05);

    // Demanda Regional agora permite excedente (Elástica)
    const regionalDemand = baseDemand * (regionWeight / 100);
    const unitsSold = Math.floor(regionalDemand * priceEffect * marketingEffect);
    
    /**
     * CONVERSÃO CROSS-CURRENCY v18.0
     * Regra: Valor_Base = (Valor_Local * Câmbio_Local) / Câmbio_Base
     * Pivot: BRL (1.0). Se Moeda Base = USD (5.2) e Local = EUR (6.2):
     * Receita_Base = (Preço_Local * Unidades * 6.2) / 5.2
     */
    const localRate = indicators.exchange_rates?.[regionCurrency] || 1;
    const baseRate = indicators.exchange_rates?.[indicators.currency || 'BRL'] || 1;
    
    const regionalRevenueLocal = unitsSold * price;
    const regionalRevenueBase = (regionalRevenueLocal * localRate) / baseRate;

    totalRevenueBase += regionalRevenueBase;
    totalUnitsSoldAllRegions += unitsSold;
  });

  const revenue = totalRevenueBase;
  const totalUnitsSold = totalUnitsSoldAllRegions;
  
  // 2. Estrutura de Custos e OPEX (Calculados na Moeda Base)
  const unitCost = (indicators.prices?.mp_a || 20) + (indicators.prices?.mp_b || 40) + ((indicators.prices?.distribution_unit || 50) / 2);
  const cogs = totalUnitsSold * unitCost;
  const grossProfit = revenue - cogs;
  
  const marketingSpend = Object.values(regions).reduce((acc, r) => acc + (sanitize(r.marketing, 0) * (indicators.prices?.marketing_campaign || 10000)), 0);
  const adminOpex = (indicators.staffing?.admin?.count || 20) * (indicators.staffing?.admin?.salaries || 4) * (indicators.hr_base?.salary || 2000);
  const totalOpex = adminOpex + marketingSpend;
  
  const operatingProfit = grossProfit - totalOpex;
  
  // 3. Resultado Financeiro e Não Operacional
  const finRes = -2500; 
  const nonOpRes = 0;   
  
  const lair = operatingProfit + finRes + nonOpRes;
  const taxProv = lair > 0 ? lair * (indicators.tax_rate_ir / 100) : 0;
  const profitAfterTax = lair - taxProv;
  
  const ppr = sanitize(decision.hr?.participationPercent, 0) > 0 ? profitAfterTax * (sanitize(decision.hr?.participationPercent, 0) / 100) : 0;
  const netProfit = profitAfterTax - ppr;

  // 4. Métricas de Comando
  const baseEquity = 7252171.74;
  const currentEquity = team.equity || baseEquity;
  const finalEquity = currentEquity + netProfit;
  const tsr = round2(((finalEquity - baseEquity) / baseEquity) * 100);
  const marketShare = round2((totalUnitsSold / (baseDemand * 8)) * 100);
  
  const nlcdg = round2((revenue / 360) * (sanitize(Object.values(regions)[0]?.term || 1, 1) * 30));
  const kanitz = round2((netProfit / currentEquity) * 10 + (operatingProfit / revenue) * 5);
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
      dre: { 
        revenue, net_sales: revenue, cpv: cogs, gross_profit: grossProfit, 
        opex: totalOpex, operating_profit: operatingProfit, fin_res: finRes,
        non_op_res: nonOpRes, lair, taxes: taxProv, profit_after_tax: profitAfterTax,
        ppr, net_profit: netProfit 
      },
      cash_flow: { final: sanitize(team.kpis?.current_cash, 0) + netProfit },
      balance_sheet: team.kpis?.statements?.balance_sheet || []
    },
    kpis: {
      ...team.kpis,
      rating, tsr, ebitda: operatingProfit, equity: finalEquity, market_share: marketShare,
      nlcdg, solvency_score_kanitz: kanitz, dcf_valuation: dcf
    }
  };
};
