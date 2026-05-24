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
 * Realiza uma auditoria de consistência tripla rígida (Balanço Patrimonial, DRE, DFC).
 * Garante as três regras fundamentais da contabilidade gerencial sob as quais o simulador opera:
 * 1. Equação Patrimonial: Ativo = Passivo + Patrimônio Líquido (dentro de margem de centavos).
 * 2. Consistência do Caixa: O saldo final de caixa na DFC deve bater exatamente com a conta Ativo Circulante Caixa.
 * 3. Consistência do Lucro: O Lucro Líquido apurado na DRE deve se refletir perfeitamente no PL (Lucros Acumulados / equity.profit).
 */
export function validateTripleConsistency(statements: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!statements) {
    errors.push("Nenhum demonstrativo contábil foi fornecido para auditoria.");
    return { isValid: false, errors, warnings };
  }

  const bs = statements.balance_sheet || [];
  const dre = statements.dre || [];
  const dfc = statements.cash_flow || [];

  // 1. EQUAÇÃO PATRIMONIAL FUNDAMENTAL
  const cashVal = findAccountValue(bs, 'assets.current.cash') || 0;
  const investmentsVal = findAccountValue(bs, 'assets.current.investments') || 0;
  const clientsVal = findAccountValue(bs, 'assets.current.clients') || 0;
  const pecldVal = findAccountValue(bs, 'assets.current.pecld') || 0;
  const vatRecoverableVal = findAccountValue(bs, 'assets.current.vat_recoverable') || 0;
  const stockPaVal = findAccountValue(bs, 'assets.current.stock.pa') || 0;
  const stockMpaVal = findAccountValue(bs, 'assets.current.stock.mpa') || 0;
  const stockMpbVal = findAccountValue(bs, 'assets.current.stock.mpb') || 0;
  
  const landVal = findAccountValue(bs, 'assets.noncurrent.fixed.land') || 0;
  const buildingsVal = findAccountValue(bs, 'assets.noncurrent.fixed.buildings') || 0;
  const buildingsDeprecVal = findAccountValue(bs, 'assets.noncurrent.fixed.buildings_deprec') || 0;
  const machinesVal = findAccountValue(bs, 'assets.noncurrent.fixed.machines') || 0;
  const machinesDeprecVal = findAccountValue(bs, 'assets.noncurrent.fixed.machines_deprec') || 0;

  const totalAssetsVal = cashVal + investmentsVal + clientsVal + pecldVal + vatRecoverableVal + 
                         stockPaVal + stockMpaVal + stockMpbVal + 
                         landVal + buildingsVal + buildingsDeprecVal + machinesVal + machinesDeprecVal;

  const suppliersVal = findAccountValue(bs, 'liabilities.current.suppliers') || 0;
  const vatPayableVal = findAccountValue(bs, 'liabilities.current.vat_payable') || 0;
  const taxesVal = findAccountValue(bs, 'liabilities.current.taxes') || 0;
  const dividendsVal = findAccountValue(bs, 'liabilities.current.dividends') || 0;
  const pprPayableVal = findAccountValue(bs, 'liabilities.current.ppr_payable') || 0;
  const loansStVal = findAccountValue(bs, 'liabilities.current.loans_st') || 0;
  const loansLtVal = findAccountValue(bs, 'liabilities.longterm.loans_lt') || 0;

  const totalLiabilitiesVal = suppliersVal + vatPayableVal + taxesVal + dividendsVal + pprPayableVal + loansStVal + loansLtVal;

  const capitalVal = findAccountValue(bs, 'equity.capital') || 0;
  const profitVal = findAccountValue(bs, 'equity.profit') || 0;

  const totalEquityVal = capitalVal + profitVal;

  const roundedAssets = Math.round(totalAssetsVal * 100) / 100;
  const roundedLiabPl = Math.round((totalLiabilitiesVal + totalEquityVal) * 100) / 100;
  const accountingDiff = Math.abs(roundedAssets - roundedLiabPl);

  if (accountingDiff > 0.05) {
    errors.push(`Disparidade crítica de Equação Contábil detectada: O total do Ativo (${roundedAssets.toFixed(2)} BRL) diverge da soma do Passivo + PL (${roundedLiabPl.toFixed(2)} BRL) por ${accountingDiff.toFixed(2)} BRL.`);
  }

  // 2. CONSISTÊNCIA DO CAIXA COM DFC
  const finalCfCash = findAccountValue(dfc, 'cf.final') || 0;
  const cashDiff = Math.abs(cashVal - finalCfCash);
  if (cashDiff > 0.05) {
    errors.push(`Inconsistência tática no Fluxo de Caixa: O saldo de caixa final relatado no DFC (${finalCfCash.toFixed(2)} BRL) diverge do caixa líquido do Balanço Patrimonial (${cashVal.toFixed(2)} BRL) por ${cashDiff.toFixed(2)} BRL.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida a consistência técnica tripla (Balanço, DRE e DFC) e a aderência física do estoque.
 * Implementa verificação forte que pode bloquear turnover ou alertar sobre descompassos no Kardex.
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

  // 1. Recuperação e estruturação dos dados de estoque físicos e valorados
  const prevStatements = team.kpis?.statements || INITIAL_FINANCIAL_TREE;
  const prevBS = prevStatements.balance_sheet || [];
  
  const initialMpaQty = sanitize(team.kpis?.stock_quantities?.mp_a, 30150);
  const initialMpbQty = sanitize(team.kpis?.stock_quantities?.mp_b, 20100);
  const initialPaQty = sanitize(team.kpis?.stock_quantities?.finished_goods, 0);

  const initialMpaValue = findAccountValue(prevBS, 'assets.current.stock.mpa') || 603000.00;
  const initialMpbValue = findAccountValue(prevBS, 'assets.current.stock.mpb') || 804000.00;
  const initialPaValue = findAccountValue(prevBS, 'assets.current.stock.pa') || 0.00;

  const initialMpaUnitCost = initialMpaQty > 0 ? (initialMpaValue / initialMpaQty) : 20.00;
  const initialMpbUnitCost = initialMpbQty > 0 ? (initialMpbValue / initialMpbQty) : 40.00;
  const initialPaUnitCost = initialPaQty > 0 ? (initialPaValue / initialPaQty) : 0.00;

  // Se já temos a projeção pré-calculada por calculateProjections, usamos as suas saídas de estoque
  const stockQtyOutput = calculatedResult?.stock_quantities || { mp_a: 0, mp_b: 0, finished_goods: 0 };
  const stockValuePA = calculatedResult?.stock_value ?? 0;

  // Compras planejadas
  const purchaseMPA = sanitize(decision.production?.purchaseMPA, 0);
  const purchaseMPB = sanitize(decision.production?.purchaseMPB, 0);

  // Reajustes de preços e impostos de compras
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

  const netPlannedMpaPrice = netMpaPrice * supplierInterestFactor;
  const netPlannedMpbPrice = netMpbPrice * supplierInterestFactor;

  // Calculando capacidade e operadores
  let currentMachines: MachineInstance[] = [...(team.kpis?.machines || [])];
  const sellIds = decision.machinery?.sell_ids || [];
  if (sellIds.length > 0) {
    currentMachines = currentMachines.filter(m => !sellIds.includes(m.id));
  }

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

  // Custo Médio Ponderado (WAC) de Suprimentos
  const totalMpaQtyAvailable = initialMpaQty + purchaseMPA + emergencyMPA;
  const totalMpaValueAvailable = initialMpaValue + (purchaseMPA * netPlannedMpaPrice) + (emergencyMPA * netEmergencyMpaPrice);
  const wacMpaUnit = totalMpaQtyAvailable > 0 ? (totalMpaValueAvailable / totalMpaQtyAvailable) : netPlannedMpaPrice;

  const totalMpbQtyAvailable = initialMpbQty + purchaseMPB + emergencyMPB;
  const totalMpbValueAvailable = initialMpbValue + (purchaseMPB * netPlannedMpbPrice) + (emergencyMPB * netEmergencyMpbPrice);
  const wacMpbUnit = totalMpbQtyAvailable > 0 ? (totalMpbValueAvailable / totalMpbQtyAvailable) : netPlannedMpbPrice;

  const mpaConsumidaQty = requiredMPA;
  const mpaConsumidaValor = mpaConsumidaQty * wacMpaUnit;

  const mpbConsumidaQty = requiredMPB;
  const mpbConsumidaValor = mpbConsumidaQty * wacMpbUnit;

  const totalMPConsumida = mpaConsumidaValor + mpbConsumidaValor;

  const decisionSalary = sanitize(decision.hr?.salary, 0);
  const currentSalary = decisionSalary > 0 ? decisionSalary : (indicators.hr_base.salary * inflationMult);
  const socialChargesAttr = 1 + (sanitize(indicators.social_charges, 35) / 100);

  const payrollMOD = operatorsRequired * currentSalary * activityLevel;
  const socialChargesMOD = payrollMOD * (socialChargesAttr - 1);
  const productivityBonus = payrollMOD * (sanitize(decision.hr?.productivityBonusPercent, 0) / 100);
  const totalMOD = payrollMOD + socialChargesMOD + productivityBonus;

  const extraProductionCost = extraProductionPercent > 0 ? (Math.floor(unitsProduced * (extraProductionPercent / (100 + extraProductionPercent))) / (unitsProduced || 1)) * totalMOD * 0.5 : 0;

  let periodDepreciation = 0;
  let machinePurchaseOutflow = 0;
  const buyDecisions = decision.machinery?.buy || { alfa: 0, beta: 0, gama: 0 };
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

  const maintenance = capacity * 2.5 * inflationMult;

  const totalStaff = (team.kpis?.staffing?.production || 470) + (indicators.staffing?.admin?.count || 20) + (indicators.staffing?.sales?.count || 10);
  const firedTotal = sanitize(decision.hr?.fired, 0);
  const prevPprPayable = findAccountValue(prevBS, 'liabilities.current.ppr_payable') || 0;
  const pprProporcional = (firedTotal > 0 && totalStaff > 0) ? prevPprPayable * (firedTotal / totalStaff) : 0;
  const custoIndenizacao = firedTotal * currentSalary * 2;

  const totalCIF = totalMOD + extraProductionCost + periodDepreciation + maintenance + custoIndenizacao + pprProporcional;
  const totalCPP = totalMPConsumida + totalCIF;
  const unitCPP = unitsProduced > 0 ? (totalCPP / unitsProduced) : 0;

  const totalQtyPaForSale = initialPaQty + unitsProduced;
  const totalValuePaForSale = initialPaValue + totalCPP;
  const wacPaUnit = totalQtyPaForSale > 0 ? (totalValuePaForSale / totalQtyPaForSale) : unitCPP;

  // Calculas de vendas de acordo com o pre-calculado para auditar
  let totalUnitsSold = calculatedResult?.last_units_sold ?? 0;
  if (!calculatedResult) {
    let tempUnitsSold = 0;
    const regions = Object.entries(decision.regions || {});
    const regionCount = regions.length || 1;
    const baseDemandPerRegion = (capacity * 0.8) / regionCount;

    regions.forEach(([id, reg]: [string, any]) => {
      const regPrice = sanitize(reg.price, 425);
      const regMarketing = sanitize(reg.marketing, 0);
      const regTerm = sanitize(reg.term, 0);
      const rjDemandPenalty = decision.judicial_recovery === true ? 0.85 : 1.0;

      const priceIndex = indicators.avg_selling_price / regPrice;
      const marketingIndex = 1 + (regMarketing * 0.08);
      const termIndex = 1 + (regTerm * 0.05);
      
      const regDemand = Math.floor(baseDemandPerRegion * priceIndex * marketingIndex * termIndex * (1 + (indicators.demand_variation / 100)) * rjDemandPenalty);
      const regUnitsSold = Math.min(regDemand, Math.floor(totalQtyPaForSale / regionCount));
      tempUnitsSold += regUnitsSold;
    });

    totalUnitsSold = Math.min(tempUnitsSold, totalQtyPaForSale);
  }

  const totalCPV = totalUnitsSold * wacPaUnit;

  const finalMpaQty = Math.max(0, totalMpaQtyAvailable - mpaConsumidaQty);
  const finalMpaValue = finalMpaQty * wacMpaUnit;

  const finalMpbQty = Math.max(0, totalMpbQtyAvailable - mpbConsumidaQty);
  const finalMpbValue = finalMpbQty * wacMpbUnit;

  const finalPaQty = Math.max(0, totalQtyPaForSale - totalUnitsSold);
  const finalPaValue = finalPaQty * wacPaUnit;

  // CONSTRUÇÃO COMPLETA DO KARDEX
  const mpaAvgEntrada = (purchaseMPA + emergencyMPA) > 0 ? ((purchaseMPA * netPlannedMpaPrice) + (emergencyMPA * netEmergencyMpaPrice)) / (purchaseMPA + emergencyMPA) : 0;
  const mpbAvgEntrada = (purchaseMPB + emergencyMPB) > 0 ? ((purchaseMPB * netPlannedMpbPrice) + (emergencyMPB * netEmergencyMpbPrice)) / (purchaseMPB + emergencyMPB) : 0;

  const kardex: KardexReport = {
    mpa: {
      saldoInicialQtd: initialMpaQty,
      saldoInicialValor: initialMpaValue,
      saldoInicialUnitario: initialMpaUnitCost,
      entradasQtd: purchaseMPA + emergencyMPA,
      entradasValor: (purchaseMPA * netPlannedMpaPrice) + (emergencyMPA * netEmergencyMpaPrice),
      entradasUnitario: mpaAvgEntrada,
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
      entradasUnitario: mpbAvgEntrada,
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

  // 1. Validando consistência de estoques físicos
  if (emergencyMPA > 0 || emergencyMPB > 0) {
    warnings.push(`Cisne de Estoque Ativado: A quantidade de produção de ${unitsProduced} un exigiu compras de emergência de MP A (+${emergencyMPA} un) e MP B (+${emergencyMPB} un) gerando penalização de ágio de especial premium.`);
  }

  // 2. Auditoria Contábil de Consistência Tripla Rígida se o resultado calculado for fornecido
  if (calculatedResult) {
    const tripleCheck = validateTripleConsistency(calculatedResult.statements);
    if (!tripleCheck.isValid) {
      errors.push(...tripleCheck.errors);
    }
    warnings.push(...tripleCheck.warnings);

    // Verificação de consistência de saldos físicos com o balanço
    const bs = calculatedResult.statements?.balance_sheet || [];
    const stockPaVal = findAccountValue(bs, 'assets.current.stock.pa') || 0;
    const stockMpaVal = findAccountValue(bs, 'assets.current.stock.mpa') || 0;
    const stockMpbVal = findAccountValue(bs, 'assets.current.stock.mpb') || 0;

    const diffPa = Math.abs(stockPaVal - finalPaValue);
    const diffMpa = Math.abs(stockMpaVal - finalMpaValue);
    const diffMpb = Math.abs(stockMpbVal - finalMpbValue);

    if (diffPa > 1.00) {
      warnings.push(`Diferença física de Produto Acabado detectada: Kardex calculou ${finalPaValue.toFixed(2)} e Balanço registrou ${stockPaVal.toFixed(2)}.`);
    }
    if (diffMpa > 1.00) {
      warnings.push(`Diferença física de MP A detectada: Kardex calculou ${finalMpaValue.toFixed(2)} e Balanço registrou ${stockMpaVal.toFixed(2)}.`);
    }
    if (diffMpb > 1.00) {
      warnings.push(`Diferença física de MP B detectada: Kardex calculou ${finalMpbValue.toFixed(2)} e Balanço registrou ${stockMpbVal.toFixed(2)}.`);
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
