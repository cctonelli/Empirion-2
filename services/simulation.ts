
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs, MachineInstance } from '../types';

/**
 * EMPIRION SIMULATION KERNEL v18.0 - ORACLE GOLD CORE
 * Motor determinístico de projeção financeira, gestão de estoques e CAPEX.
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
  const reg1 = regions[1] || { price: 0, marketing: 0, term: 0 };
  const price = sanitize(reg1.price, indicators.avg_selling_price || 425);
  
  // 1. APLICAÇÃO DE REAJUSTES MACRO (ACUMULADOS)
  const mp_a_cost = (indicators.prices?.mp_a || 20) * (1 + (sanitize(indicators.raw_material_a_adjust, 0) / 100));
  const mp_b_cost = (indicators.prices?.mp_b || 40) * (1 + (sanitize(indicators.raw_material_b_adjust, 0) / 100));
  const dist_cost = (indicators.prices?.distribution_unit || 50) * (1 + (sanitize(indicators.distribution_cost_adjust, 0) / 100));
  
  // 2. GESTÃO DE CAPEX E DEPRECIAÇÃO (FIDELIDADE POR IDADE)
  const currentMachines: MachineInstance[] = team.kpis?.machines || [];
  let totalDepreciation = 0;
  let currentMachineValue = 0;

  const updatedMachines = currentMachines.map(m => {
    const spec = indicators.machine_specs[m.model];
    const depRate = spec?.depreciation_rate || 0.025;
    const periodDep = m.acquisition_value * depRate;
    
    totalDepreciation += periodDep;
    const nextAccum = m.accumulated_depreciation + periodDep;
    currentMachineValue += (m.acquisition_value - nextAccum);

    return {
      ...m,
      age: m.age + 1,
      accumulated_depreciation: nextAccum
    };
  });

  // 3. MODELAGEM DE DEMANDA E VENDAS
  const ice = sanitize(indicators.ice, 3.0);
  const demandVariation = sanitize(indicators.demand_variation, 0);
  const baseDemand = 10000 * (ice / 3) * (ecosystem.demand_multiplier || 1) * (1 + (demandVariation / 100));
  
  const priceRatio = price / (indicators.avg_selling_price || 425);
  const priceEffect = Math.pow(1 / Math.max(0.1, priceRatio), 1.2);
  const totalMkt = Object.values(regions).reduce((acc, r: any) => acc + sanitize(r.marketing, 0), 0);
  const marketingEffect = 1 + (totalMkt * 0.05);
  
  const totalUnitsPotential = Math.floor(baseDemand * priceEffect * marketingEffect);

  // 4. FLUXO DE ESTOQUE (MATERIAIS E PRODUTO ACABADO)
  const openingMPA = team.kpis?.stock_quantities?.mp_a || 30150;
  const openingMPB = team.kpis?.stock_quantities?.mp_b || 20100;
  const openingPA = team.kpis?.stock_quantities?.finished_goods || 0;

  const boughtMPA = sanitize(decision.production?.purchaseMPA, 0);
  const boughtMPB = sanitize(decision.production?.purchaseMPB, 0);

  // Produção baseada em máquinas e RH (Simplificado para o Cockpit)
  const productionLevel = sanitize(decision.production?.activityLevel, 0) / 100;
  const maxCapacity = updatedMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.production_capacity || 0), 0);
  const extraProd = 1 + (sanitize(decision.production?.extraProductionPercent, 0) / 100);
  const unitsProduced = Math.floor(maxCapacity * productionLevel * extraProd);

  // Consumo de MP (1 MPA + 1 MPB por unidade produzida)
  const consumptionA = Math.min(unitsProduced, openingMPA + boughtMPA);
  const consumptionB = Math.min(unitsProduced, openingMPB + boughtMPB);
  const actualProduction = Math.min(consumptionA, consumptionB);

  // Vendas reais limitadas pelo estoque PA
  const totalPAAvailable = openingPA + actualProduction;
  const unitsSold = Math.min(totalUnitsPotential, totalPAAvailable);
  
  const revenue = unitsSold * price;
  
  // 5. DRE E ESTRUTURA DE CUSTOS
  const unitCostRaw = mp_a_cost + mp_b_cost;
  const cogs = unitsSold * (unitCostRaw + (dist_cost / 2));
  const storageCost = ( (openingMPA + boughtMPA - consumptionA) * (indicators.prices.storage_mp || 1.4) ) + 
                      ( (totalPAAvailable - unitsSold) * (indicators.prices.storage_finished || 20) );

  const grossProfit = revenue - cogs;
  
  const marketingSpend = totalMkt * (indicators.prices?.marketing_campaign || 10000);
  const adminOpex = (indicators.staffing?.admin?.count || 20) * (indicators.hr_base?.salary || 2000) * 4;
  const totalOpex = adminOpex + marketingSpend + storageCost + totalDepreciation;
  
  const operatingProfit = grossProfit - totalOpex;

  // 6. PREMIAÇÕES POR PRECISÃO (AUDIT AWARDS)
  let nonOpRes = 0;
  const forecastedNet = sanitize(decision.estimates?.forecasted_net_profit, 0);
  const forecastedRev = sanitize(decision.estimates?.forecasted_revenue, 0);
  
  // Se erro < 5%, ganha prêmio
  if (forecastedRev > 0 && Math.abs(forecastedRev - revenue) / revenue < 0.05) nonOpRes += indicators.award_values.revenue_precision;
  
  const finRes = -2500;
  const lair = operatingProfit + finRes + nonOpRes;
  const netProfit = lair > 0 ? lair * (1 - (sanitize(indicators.tax_rate_ir, 25)/100)) : lair;

  // 7. BALANÇO E KPIs
  const currentCash = sanitize(team.kpis?.current_cash, 0);
  const finalCash = currentCash + netProfit + totalDepreciation; // EBITDA proxy
  const baseEquity = 7252171.74;
  const finalEquity = (team.equity || baseEquity) + netProfit;
  const tsr = round2(((finalEquity - baseEquity) / baseEquity) * 100);

  const kanitz = round2((netProfit / finalEquity) * 10 + (operatingProfit / Math.max(1, revenue)) * 5);

  let rating: CreditRating = 'AAA';
  if (kanitz < 0) rating = 'C';
  if (kanitz < -5) rating = 'D';

  return {
    revenue,
    netProfit,
    debtRatio: 15.5,
    creditRating: rating,
    health: { cash: finalCash, rating },
    marketShare: round2((unitsSold / (baseDemand * 8)) * 100),
    statements: {
      dre: { 
        revenue, cpv: cogs, gross_profit: grossProfit, opex: totalOpex, operating_profit: operatingProfit, 
        non_op_res: nonOpRes, net_profit: netProfit, depreciation: totalDepreciation 
      },
      cash_flow: {
        start: currentCash,
        inflow: { total: revenue + nonOpRes },
        outflow: { total: cogs + totalOpex - totalDepreciation }, // Capex not handled here for sim
        final: finalCash
      },
      balance_sheet: [] // Gerado dinamicamente no componente se necessário
    },
    kpis: {
      ...team.kpis,
      rating, tsr, ebitda: operatingProfit, equity: finalEquity, 
      current_cash: finalCash,
      stock_quantities: {
        mp_a: openingMPA + boughtMPA - consumptionA,
        mp_b: openingMPB + boughtMPB - consumptionB,
        finished_goods: totalPAAvailable - unitsSold
      },
      machines: updatedMachines,
      solvency_score_kanitz: kanitz,
      inventory_turnover: round2(unitsSold / Math.max(1, (totalPAAvailable - unitsSold)))
    }
  };
};
