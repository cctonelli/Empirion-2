import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, KPIs, AccountNode, MachineInstance, MachineModel } from '../types';
import { INITIAL_FINANCIAL_TREE } from '../constants';
import { sanitize, getAdjustedPrice, findAccountValue } from './simulation';

/**
 * ORACLE ACCOUNTING STRATEGOS - NUCLEO DE INTEGRIDADE CONTABIL E GESTÃO DE ESTOQUES (v19.5 SAPPHIRE)
 * Esta classe é responsável por implementar a consolidação tripla e auditoria fina de estoque
 * através de um Kardex estruturado (fluxo quantitativo e valorizado de MP e PA via WAC).
 */

export interface KardexItem {
  saldoInicialQtd: number;
  saldoInicialValor: number;
  saldoInicialUnitario: number;
  
  entradasQtd: number;
  entradasValor: number;
  entradasUnitario: number;
  
  saidasQtd: number;
  saidasValor: number;
  saidasUnitario: number;
  
  saldoFinalQtd: number;
  saldoFinalValor: number;
  saldoFinalUnitario: number;
}

export interface KardexReport {
  mpa: KardexItem;
  mpb: KardexItem;
  pa: KardexItem;
}

export interface CPVDetails {
  mpConsumida: number;
  maoDeObraDireta: number;
  depreciacaoFabril: number;
  manutencaoFabril: number;
  indenizacoesRescisorias: number;
  pprProporcional: number;
  totalCPP: number; // Custo de Produção do Período
  estoqueInicialPA: number;
  estoqueFinalPA: number;
  totalCPV: number;
  custoUnitarioProducao: number;
}

/**
 * Valida a consistência técnica tripla (Balanço, DRE e DFC) e a aderência física do estoque
 */
export function processRoundWithValidation(
  decision: DecisionData,
  branch: Branch,
  ecosystem: EcosystemConfig,
  indicators: MacroIndicators,
  team: Team,
  history: any[] = [],
  round?: number,
  round_rules?: Record<number, any>,
  calculatedResult?: any // aceita pré-cálculo para auditar
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  kardex: KardexReport;
  cpvDetails: CPVDetails;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Se já temos os resultados projetados ou vamos calculá-los de forma estrita para auditoria fina:
  // Faremos o cálculo explícito dos estoques para o Kardex
  const prevStatements = team.kpis?.statements || INITIAL_FINANCIAL_TREE;
  const prevBS = prevStatements.balance_sheet || [];
  
  // 1. Estoque inicial quantitativo e financeiro
  const initialMpaQty = sanitize(team.kpis?.stock_quantities?.mp_a, 30150);
  const initialMpbQty = sanitize(team.kpis?.stock_quantities?.mp_b, 20100);
  const initialPaQty = sanitize(team.kpis?.stock_quantities?.finished_goods, 0);

  const initialMpaValue = findAccountValue(prevBS, 'assets.current.stock.mpa') || 603000.00;
  const initialMpbValue = findAccountValue(prevBS, 'assets.current.stock.mpb') || 804000.00;
  const initialPaValue = findAccountValue(prevBS, 'assets.current.stock.pa') || 0.00;

  const initialMpaUnitCost = initialMpaQty > 0 ? (initialMpaValue / initialMpaQty) : 20.00;
  const initialMpbUnitCost = initialMpbQty > 0 ? (initialMpbValue / initialMpbQty) : 40.00;
  const initialPaUnitCost = initialPaQty > 0 ? (initialPaValue / initialPaQty) : 0.00;

  // 2. Aquisições e Compras planejadas
  const purchaseMPA = sanitize(decision.production?.purchaseMPA, 0);
  const purchaseMPB = sanitize(decision.production?.purchaseMPB, 0);
  
  // 3. Capacidade física e Produção efetiva de máquinas do time
  let currentMachines: MachineInstance[] = [...(team.kpis?.machines || [])];
  
  // Vendas de máquinas planejadas
  const sellIds = decision.machinery?.sell_ids || [];
  if (sellIds.length > 0) {
    currentMachines = currentMachines.filter(m => !sellIds.includes(m.id));
  }

  // Preços de MP bruto e líquido reajustados para a rodada N-1
  const currentRound = round ?? 0;
  const getAdjust = (key: string, fallback: number) => {
    if (round !== undefined && round_rules !== undefined) {
      return getAdjustedPrice(1, key, round, round_rules);
    }
    return 1 + (fallback / 100);
  };

  const inflationMult = getAdjust('inflation_rate', sanitize(indicators.inflation_rate, 0));
  const mpaPrice = indicators.prices.mp_a * getAdjust('raw_material_a_adjust', sanitize(indicators.raw_material_a_adjust, 0));
  const mpbPrice = indicators.prices.mp_b * getAdjust('raw_material_b_adjust', sanitize(indicators.raw_material_b_adjust, 0));
  const vatPurchasesRate = sanitize(indicators.vat_purchases_rate, 0) / 100;
  const netMpaPrice = mpaPrice * (1 - vatPurchasesRate);
  const netMpbPrice = mpbPrice * (1 - vatPurchasesRate);

  const supplierPaymentType = sanitize(decision.production?.paymentType, 0);
  const supplierInterestRate = sanitize(indicators.supplier_interest, 0) / 100;
  const supplierInterestFactor = supplierPaymentType > 0 ? (1 + supplierInterestRate) : 1.0;

  // Preço de compra líquido planejado
  const netPlannedMpaPrice = netMpaPrice * supplierInterestFactor;
  const netPlannedMpbPrice = netMpbPrice * supplierInterestFactor;

  // Capacidade e produção físicas estimadas
  const capacity = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.production_capacity || 0), 0);
  const activityLevel = sanitize(decision.production?.activityLevel, 100) / 100;
  const operatorsAvailable = (team.kpis?.staffing?.production || 470) + sanitize(decision.hr?.hired, 0) - sanitize(decision.hr?.fired, 0);
  const operatorsRequired = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.operators_required || 0), 0);
  const operatorConstraint = operatorsRequired > 0 ? Math.min(1, operatorsAvailable / operatorsRequired) : 1;
  const effectiveCapacity = capacity * operatorConstraint;
  
  const boughtNew = Object.values(decision.machinery?.buy || {}).some(qty => (qty as number) > 0);
  const trainingPercent = sanitize(decision.hr?.trainingPercent, 0);
  const trainingPenalty = (boughtNew && trainingPercent < 5) ? 0.75 : 1;
  
  let unitsProduced = Math.floor(effectiveCapacity * activityLevel * trainingPenalty);
  const extraProductionPercent = sanitize(decision.production?.extraProductionPercent, 0);
  if (extraProductionPercent > 0) {
    unitsProduced += Math.floor(unitsProduced * (extraProductionPercent / 100));
  }

  // 4. Verificação de necessidade de compra emergencial
  const requiredMPA = unitsProduced * 3;
  const requiredMPB = unitsProduced * 2;
  const availableMPA = initialMpaQty + purchaseMPA;
  const availableMPB = initialMpbQty + purchaseMPB;

  let emergencyMPA = 0;
  let emergencyMPB = 0;
  if (requiredMPA > availableMPA) emergencyMPA = requiredMPA - availableMPA;
  if (requiredMPB > availableMPB) emergencyMPB = requiredMPB - availableMPB;

  const specialPremium = 1 + (sanitize(indicators.special_purchase_premium, 5) / 100);
  const netEmergencyMpaPrice = netMpaPrice * supplierInterestFactor * specialPremium;
  const netEmergencyMpbPrice = netMpbPrice * supplierInterestFactor * specialPremium;

  // 5. Custo Médio Ponderado (WAC) de Suprimentos (Média de MP A e B)
  const totalMpaQtyAvailable = initialMpaQty + purchaseMPA + emergencyMPA;
  const totalMpaValueAvailable = initialMpaValue + (purchaseMPA * netPlannedMpaPrice) + (emergencyMPA * netEmergencyMpaPrice);
  const wacMpaUnit = totalMpaQtyAvailable > 0 ? (totalMpaValueAvailable / totalMpaQtyAvailable) : netPlannedMpaPrice;

  const totalMpbQtyAvailable = initialMpbQty + purchaseMPB + emergencyMPB;
  const totalMpbValueAvailable = initialMpbValue + (purchaseMPB * netPlannedMpbPrice) + (emergencyMPB * netEmergencyMpbPrice);
  const wacMpbUnit = totalMpbQtyAvailable > 0 ? (totalMpbValueAvailable / totalMpbQtyAvailable) : netPlannedMpbPrice;

  // Consumo no processo fabril
  const mpaConsumidaQty = requiredMPA;
  const mpaConsumidaValor = mpaConsumidaQty * wacMpaUnit;

  const mpbConsumidaQty = requiredMPB;
  const mpbConsumidaValor = mpbConsumidaQty * wacMpbUnit;

  const totalMPConsumida = mpaConsumidaValor + mpbConsumidaValor;

  // 6. Custos Fabris (Mão de Obra e GGF)
  const decisionSalary = sanitize(decision.hr?.salary, 0);
  const currentSalary = decisionSalary > 0 ? decisionSalary : (indicators.hr_base.salary * inflationMult);
  const socialChargesAttr = 1 + (sanitize(indicators.social_charges, 35) / 100);

  const payrollMOD = operatorsRequired * currentSalary * activityLevel;
  const socialChargesMOD = payrollMOD * (socialChargesAttr - 1);
  const productivityBonus = payrollMOD * (sanitize(decision.hr?.productivityBonusPercent, 0) / 100);
  const totalMOD = payrollMOD + socialChargesMOD + productivityBonus;

  // Custos extras de produção
  const extraProductionCost = extraProductionPercent > 0 ? (Math.floor(unitsProduced * (extraProductionPercent / (100 + extraProductionPercent))) / (unitsProduced || 1)) * totalMOD * 0.5 : 0;

  // Depreciação de máquinas e de prédios
  let periodDepreciation = 0;
  const buyDecisions = decision.machinery?.buy || { alfa: 0, beta: 0, gama: 0 };
  let machinePurchaseOutflow = 0;
  Object.entries(buyDecisions).forEach(([model, qty]: [any, any]) => {
    if (qty > 0) {
      const basePrice = indicators.machinery_values[model as 'alfa' | 'beta' | 'gama'];
      const adjustKey = model === 'alfa' ? 'machine_alpha_price_adjust' : 
                        model === 'beta' ? 'machine_beta_price_adjust' : 
                        'machine_gamma_price_adjust';
      const fallbackAdjust = model === 'alfa' ? indicators.machine_alpha_price_adjust : 
                             model === 'beta' ? indicators.machine_beta_price_adjust : 
                             indicators.machine_gamma_price_adjust;
      const unitPrice = basePrice * getAdjust(adjustKey, sanitize(fallbackAdjust, 0));
      const totalCost = unitPrice * qty;
      const isRJ = decision.judicial_recovery === true;
      const effectivePurchaseCost = isRJ ? totalCost * 0.4 : totalCost;
      machinePurchaseOutflow += effectivePurchaseCost;
    }
  });

  const existingMachineIds = (team.kpis?.machines || []).map(m => m.id);
  const tempMachines = [...(team.kpis?.machines || [])];
  tempMachines.forEach(m => {
    const spec = indicators.machine_specs[m.model];
    const depVal = m.acquisition_value / (spec?.useful_life_years || 40);
    periodDepreciation += depVal;
  });

  const buildingsCost = findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings') || 5440000;
  const buildingDepPeriod = buildingsCost * 0.002;
  periodDepreciation += buildingDepPeriod;

  // Manutenção fabril
  const maintenance = capacity * 2.5 * inflationMult;

  // Encargos de demissão e PPR Proporcional
  const totalStaff = (team.kpis?.staffing?.production || 470) + (indicators.staffing?.admin?.count || 20) + (indicators.staffing?.sales?.count || 10);
  const firedTotal = sanitize(decision.hr?.fired, 0);
  const prevPprPayable = findAccountValue(prevBS, 'liabilities.current.ppr_payable') || 0;
  const pprProporcional = (firedTotal > 0 && totalStaff > 0) ? prevPprPayable * (firedTotal / totalStaff) : 0;
  const custoIndenizacao = firedTotal * currentSalary * 2;

  // Custo de Transformação Total (MOD + GGF)
  const totalCIF = totalMOD + extraProductionCost + periodDepreciation + maintenance + custoIndenizacao + pprProporcional;
  
  // Custo de Produção do Período (CPP)
  const totalCPP = totalMPConsumida + totalCIF;
  const unitCPP = unitsProduced > 0 ? (totalCPP / unitsProduced) : 0;

  // 7. Média Ponderada (WAC) de Produto Acabado (PA)
  const totalQtyPaForSale = initialPaQty + unitsProduced;
  const totalValuePaForSale = initialPaValue + totalCPP;
  const wacPaUnit = totalQtyPaForSale > 0 ? (totalValuePaForSale / totalQtyPaForSale) : unitCPP;

  // Demanda e vendas para a projeção
  let totalUnitsSold = 0;
  const regions = Object.entries(decision.regions || {});
  const regionCount = regions.length || 1;
  const baseDemandPerRegion = (capacity * 0.8) / regionCount;

  regions.forEach(([id, reg]: [string, any]) => {
    const regPrice = sanitize(reg.price, 425);
    const regMarketing = sanitize(reg.marketing, 0);
    const regTerm = sanitize(reg.term, 0);
    const isRJ = decision.judicial_recovery === true;
    const rjDemandPenalty = isRJ ? 0.85 : 1.0;

    const priceIndex = indicators.avg_selling_price / regPrice;
    const marketingIndex = 1 + (regMarketing * 0.08);
    const termIndex = 1 + (regTerm * 0.05);
    
    const regDemand = Math.floor(baseDemandPerRegion * priceIndex * marketingIndex * termIndex * (1 + (indicators.demand_variation / 100)) * rjDemandPenalty);
    const regUnitsSold = Math.min(regDemand, Math.floor(totalQtyPaForSale / regionCount));
    totalUnitsSold += regUnitsSold;
  });

  if (totalUnitsSold > totalQtyPaForSale) {
    totalUnitsSold = totalQtyPaForSale;
  }

  // CPV final real baseado no Custo Médio (WAC) de PA
  const totalCPV = totalUnitsSold * wacPaUnit;

  // Estoques pós rodada
  const finalMpaQty = Math.max(0, totalMpaQtyAvailable - mpaConsumidaQty);
  const finalMpaValue = finalMpaQty * wacMpaUnit;

  const finalMpbQty = Math.max(0, totalMpbQtyAvailable - mpbConsumidaQty);
  const finalMpbValue = finalMpbQty * wacMpbUnit;

  const finalPaQty = Math.max(0, totalQtyPaForSale - totalUnitsSold);
  const finalPaValue = finalPaQty * wacPaUnit;

  // GERAÇÃO DO REGISTRO DO KARDEX
  const kardex: KardexReport = {
    mpa: {
      saldoInicialQtd: initialMpaQty,
      saldoInicialValor: initialMpaValue,
      saldoInicialUnitario: initialMpaUnitCost,
      entradasQtd: purchaseMPA + emergencyMPA,
      entradasValor: (purchaseMPA * netPlannedMpaPrice) + (emergencyMPA * netEmergencyMpaPrice),
      entradasUnitario: (purchaseMPA + emergencyMPA) > 0 ? ((purchaseMPA * netPlannedMpaPrice) + (emergencyMPA * netEmergencyMpaPrice)) / (purchaseMPA + emergencyMPA) : 0,
      saidasQtd: mpaConsumidaQty,
      saidasValor: mpaConsumidaValor,
      saidasUnitario: wacMpaUnit,
      saldoFinalQtd: finalMpaQty,
      saldoFinalValor: finalMpaValue,
      saldoFinalUnitario: wacMpaUnit
    },
    mpb: {
      saldoInicialQtd: initialMpbQty,
      saldoInicialValor: initialMpbValue,
      saldoInicialUnitario: initialMpbUnitCost,
      entradasQtd: purchaseMPB + emergencyMPB,
      entradasValor: (purchaseMPB * netPlannedMpbPrice) + (emergencyMPB * netEmergencyMpbPrice),
      entradasUnitario: (purchaseMPB + emergencyMPB) > 0 ? ((purchaseMPB * netPlannedMpbPrice) + (emergencyMPB * netEmergencyMpbPrice)) / (purchaseMPB + emergencyMPB) : 0,
      saidasQtd: mpbConsumidaQty,
      saidasValor: mpbConsumidaValor,
      saidasUnitario: wacMpbUnit,
      saldoFinalQtd: finalMpbQty,
      saldoFinalValor: finalMpbValue,
      saldoFinalUnitario: wacMpbUnit
    },
    pa: {
      saldoInicialQtd: initialPaQty,
      saldoInicialValor: initialPaValue,
      saldoInicialUnitario: initialPaUnitCost,
      entradasQtd: unitsProduced,
      entradasValor: totalCPP,
      entradasUnitario: unitCPP,
      saidasQtd: totalUnitsSold,
      saidasValor: totalCPV,
      saidasUnitario: wacPaUnit,
      saldoFinalQtd: finalPaQty,
      saldoFinalValor: finalPaValue,
      saldoFinalUnitario: wacPaUnit
    }
  };

  const cpvDetails: CPVDetails = {
    mpConsumida: totalMPConsumida,
    maoDeObraDireta: totalMOD,
    depreciacaoFabril: periodDepreciation,
    manutencaoFabril: maintenance,
    indenizacoesRescisorias: custoIndenizacao,
    pprProporcional: pprProporcional,
    totalCPP,
    estoqueInicialPA: initialPaValue,
    estoqueFinalPA: finalPaValue,
    totalCPV,
    custoUnitarioProducao: unitCPP
  };

  // 8. AUDITORIA CONTABIL SÁPRIA (Z-GUARD AUDIT)
  // Se recebemos um pré-cálculo para auditar ou fazemos a auditoria de simulação básica
  if (calculatedResult) {
    const bs = calculatedResult.statements?.balance_sheet || [];
    
    const cashVal = findAccountValue(bs, 'assets.current.cash') || 0;
    const stockPaVal = findAccountValue(bs, 'assets.current.stock.pa') || 0;
    const stockMpaVal = findAccountValue(bs, 'assets.current.stock.mpa') || 0;
    const stockMpbVal = findAccountValue(bs, 'assets.current.stock.mpb') || 0;
    
    // Verificação de consistência física x valorada (Estoque)
    const diffPa = Math.abs(stockPaVal - finalPaValue);
    const diffMpa = Math.abs(stockMpaVal - finalMpaValue);
    const diffMpb = Math.abs(stockMpbVal - finalMpbValue);

    if (diffPa > 10.0) {
      warnings.push(`Diferença física de Produto Acabado detectada: Kardex calculou ${finalPaValue.toFixed(2)} e Balanço registrou ${stockPaVal.toFixed(2)}.`);
    }
    if (diffMpa > 10.0) {
      warnings.push(`Diferença física de MP A detectada: Kardex calculou ${finalMpaValue.toFixed(2)} e Balanço registrou ${stockMpaVal.toFixed(2)}.`);
    }
    if (diffMpb > 10.0) {
      warnings.push(`Diferença física de MP B detectada: Kardex calculou ${finalMpbValue.toFixed(2)} e Balanço registrou ${stockMpbVal.toFixed(2)}.`);
    }

    // Equação contábil Ativo x Passivo + PL
    const totalAssetsVal = (findAccountValue(bs, 'assets.current.cash') || 0) +
      (findAccountValue(bs, 'assets.current.investments') || 0) +
      (findAccountValue(bs, 'assets.current.clients') || 0) +
      (findAccountValue(bs, 'assets.current.pecld') || 0) + 
      (findAccountValue(bs, 'assets.current.vat_recoverable') || 0) +
      (findAccountValue(bs, 'assets.current.stock.pa') || 0) +
      (findAccountValue(bs, 'assets.current.stock.mpa') || 0) +
      (findAccountValue(bs, 'assets.current.stock.mpb') || 0) +
      (findAccountValue(bs, 'assets.noncurrent.fixed.land') || 0) +
      (findAccountValue(bs, 'assets.noncurrent.fixed.buildings') || 0) +
      (findAccountValue(bs, 'assets.noncurrent.fixed.buildings_deprec') || 0) + 
      (findAccountValue(bs, 'assets.noncurrent.fixed.machines') || 0) +
      (findAccountValue(bs, 'assets.noncurrent.fixed.machines_deprec') || 0);

    const totalLiabilitiesVal = (findAccountValue(bs, 'liabilities.current.suppliers') || 0) +
      (findAccountValue(bs, 'liabilities.current.vat_payable') || 0) +
      (findAccountValue(bs, 'liabilities.current.taxes') || 0) +
      (findAccountValue(bs, 'liabilities.current.dividends') || 0) +
      (findAccountValue(bs, 'liabilities.current.ppr_payable') || 0) +
      (findAccountValue(bs, 'liabilities.current.loans_st') || 0) +
      (findAccountValue(bs, 'liabilities.longterm.loans_lt') || 0);

    const totalEquityVal = (findAccountValue(bs, 'equity.capital') || 0) +
      (findAccountValue(bs, 'equity.profit') || 0);

    const roundedAssets = Math.round(totalAssetsVal * 100) / 100;
    const roundedLiabPl = Math.round((totalLiabilitiesVal + totalEquityVal) * 100) / 100;
    const accountingDiff = Math.abs(roundedAssets - roundedLiabPl);

    if (accountingDiff > 0.05) {
      errors.push(`Disparidade de Equação Contábil encontrada: Ativo (${roundedAssets.toFixed(2)}) difere de Passivo + PL (${roundedLiabPl.toFixed(2)}) por ${accountingDiff.toFixed(2)}.`);
    }

    // Reconciliação do Caixa Final com o Caixa do Balanço
    const cf = calculatedResult.statements?.cash_flow || [];
    const finalCfCash = findAccountValue(cf, 'cf.final') || 0;
    if (Math.abs(cashVal - finalCfCash) > 0.05) {
      errors.push(`Inconsistência de Caixa: DFC relata Caixa Final de ${finalCfCash.toFixed(2)}, enquanto Balanço registra ${cashVal.toFixed(2)}.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    kardex,
    cpvDetails
  };
}
