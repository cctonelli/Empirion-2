
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs, MachineInstance, AccountNode, MachineModel, ESDSCalculation, ChampionshipConfig, CompanyState } from '../types';
import { INITIAL_FINANCIAL_TREE } from '../constants';
import { supabase } from './supabase';
import { validateTripleConsistency, computeESDSDeterministic as coreComputeESDS, calculateKpisFromStatements as coreCalculateKpis, processRoundWithValidation } from './simulation-core';

/**
 * EMPIRION SIMULATION KERNEL v18.8 - STATEFUL COST ACCOUNTING
 * Foco: Diferenciação de reajustes MP vs Inflação e Fluxo de Estoque WAC.
 */

export const sanitize = (val: any, fallback: number): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

/**
 * Retorna o spread de taxa de juros com base no Rating de Crédito Corporativo da equipe
 * @param rating Rating de crédito da equipe
 */
export function getSpreadByRating(rating?: string): number {
  if (!rating) return 6.0;
  switch (rating.toUpperCase()) {
    case 'AAA': return 1.5; // +1.5% ao período
    case 'AA': return 2.0;  // +2.0% ao período
    case 'A': return 2.5;   // +2.5% ao período
    case 'BBB': return 3.5; // +3.5% ao período
    case 'BB': return 4.5;  // +4.5% ao período
    case 'B': return 6.0;   // +6.0% ao período
    case 'CCC': return 8.0; // +8.0% ao período
    case 'CC': return 10.0; // +10.0% ao período
    case 'C': return 12.0;  // +12.0% ao período
    case 'D': return 15.0;  // +15.0% ao período
    default: return 6.0;
  }
}

export const getCumulativeAdjust = (chronogram: any, round: number, key: string): number => {
  let factor = 1;
  // Reajustes começam a partir do Round 0.
  for (let i = 0; i <= round; i++) {
    const rules = chronogram[i];
    const adj = sanitize(rules?.[key], 0);
    // Reajustes são cumulativos, exceto Black Swan que é pontual
    if (i === round || !rules?.is_black_swan) {
      factor *= (1 + (adj / 100));
    }
  }
  return factor;
};

// Busca valor de conta recursivamente na árvore financeira
export const findAccountValue = (nodes: AccountNode[], id: string): number => {
  const findNode = (tree: AccountNode[]): AccountNode | null => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };
  const target = findNode(nodes);
  return target ? target.value : 0;
};

// Injeta novos valores na árvore, recalculando totalizadores
const injectValues = (tree: AccountNode[], values: Record<string, number>, zeroOut: boolean = false): AccountNode[] => {
  return tree.map(node => {
    let newVal = values[node.id] !== undefined ? values[node.id] : (zeroOut ? 0 : node.value);
    let newChildren = node.children ? injectValues(node.children, values, zeroOut) : undefined;
    
    if (node.type === 'totalizer' && newChildren) {
      newVal = newChildren.reduce((sum, child) => {
        // Se for despesa na árvore DRE/DFC, subtrai do totalizador
        // OBS: as contas de liability no Balanço Patrimonial devem somar positivamente
        if (child.type === 'expense') return sum - Math.abs(child.value);
        return sum + child.value;
      }, 0);
    }

    return { ...node, value: newVal, children: newChildren };
  });
};

/**
 * Calcula o preço reajustado de um item baseado no round e cronograma.
 * Centraliza a lógica para evitar duplicidade e confusão entre rounds.
 * @param basePrice Preço base original
 * @param key Chave de reajuste no cronograma
 * @param round Round de REFERÊNCIA (o round cujos resultados estamos vendo/calculando)
 * @param chronogram Cronograma de regras
 */
export const getAdjustedPrice = (basePrice: number, key: string, round: number, chronogram: any): number => {
  // O reajuste aplicado aos resultados do Round N é o acumulado até Round N-1.
  // Ex: Resultados de P1 usam reajuste de P0.
  // Ex: Resultados de P0 usam reajuste de P-1 (nenhum).
  return basePrice * getCumulativeAdjust(chronogram, round - 1, key);
};

export const calculateProjections = (
  decision: DecisionData,
  branch: Branch,
  ecosystem: EcosystemConfig,
  indicators: MacroIndicators,
  team: Team,
  history: any[] = [],
  round?: number,
  round_rules?: Record<number, any>
): ProjectionResult => {
  // 0. RECUPERAR ESTADO ANTERIOR
  const prevStatements = team.kpis?.statements || INITIAL_FINANCIAL_TREE;
  const prevBS = prevStatements.balance_sheet || [];
  const prevTaxes = findAccountValue(prevBS, 'liabilities.current.taxes') || 0;
  const prevDividends = findAccountValue(prevBS, 'liabilities.current.dividends') || 0;
  const prevPprPayable = findAccountValue(prevBS, 'liabilities.current.ppr_payable') || 0;
  const prevVatRecoverable = findAccountValue(prevBS, 'assets.current.vat_recoverable') || 0;
  const prevVatPayable = findAccountValue(prevBS, 'liabilities.current.vat_payable') || 0;
  const prevClients = findAccountValue(prevBS, 'assets.current.clients') || 0;
  const prevPecld = Math.abs(findAccountValue(prevBS, 'assets.current.pecld') || 0);
  const prevInvestments = findAccountValue(prevBS, 'assets.current.investments') || 0;
  const prevSuppliers = findAccountValue(prevBS, 'liabilities.current.suppliers') || 0;
  
  // --- 1. REAJUSTES TEMPORAIS ESPECÍFICOS ---
  // Se round e round_rules forem fornecidos, usamos o ajuste cumulativo.
  // Caso contrário, usamos o ajuste pontual do objeto indicators (fallback).
  const currentRound = round ?? 0;
  const rules = round_rules || {};

  const getAdjust = (key: string, fallback: number) => {
    if (round !== undefined && round_rules !== undefined) {
      return getAdjustedPrice(1, key, round, round_rules);
    }
    return 1 + (fallback / 100);
  };

  // Inflação geral afeta Manutenção e Despesas Fixas
  const inflationMult = getAdjust('inflation_rate', sanitize(indicators.inflation_rate, 0));
  
  // Reajuste de MP é independente da inflação geral (conforme diretriz v18.8)
  const mpaPrice = indicators.prices.mp_a * getAdjust('raw_material_a_adjust', sanitize(indicators.raw_material_a_adjust, 0));
  const mpbPrice = indicators.prices.mp_b * getAdjust('raw_material_b_adjust', sanitize(indicators.raw_material_b_adjust, 0));
  
  const vatPurchasesRate = sanitize(indicators.vat_purchases_rate, 0) / 100;
  const vatSalesRate = sanitize(indicators.vat_sales_rate, 0) / 100;
  
  // Preços LÍQUIDOS para estoque (conforme recomendação IVA: Estoque MP ← valor sem IVA)
  const netMpaPrice = mpaPrice * (1 - vatPurchasesRate);
  const netMpbPrice = mpbPrice * (1 - vatPurchasesRate);
  
  // Decisão de Salário da Equipe (ou base se não preenchido)
  const decisionSalary = sanitize(decision.hr?.salary, 0);
  const currentSalary = decisionSalary > 0 ? decisionSalary : (indicators.hr_base.salary * inflationMult);
  const socialChargesAttr = 1 + (sanitize(indicators.social_charges, 35) / 100);

  // Impacto de Recuperação Judicial (RJ)
  const isRJ = decision.judicial_recovery === true;
  const rjDemandPenalty = isRJ ? 0.85 : 1.0; // 15% de queda na demanda por estigma
  const rjInterestAgio = isRJ ? 1.5 : 1.0; // 50% de aumento nos juros

  // --- 2. GESTÃO DE ATIVOS E DEPRECIAÇÃO (ABSORÇÃO) ---
  let currentMachines: MachineInstance[] = [...(team.kpis?.machines || [])];
  let periodDepreciation = 0;
  let machineSalesInflow = 0;
  let machineSalesLoss = 0;
  let machinePurchaseOutflow = 0;
  let newBdiLoanAmount = 0;
  
  // A. PROCESSAR VENDAS (SELL_IDS)
  const sellIds = decision.machinery?.sell_ids || [];
  const desagioVenda = (sanitize(indicators.machine_sale_discount, 10) / 100);
  
  if (sellIds.length > 0) {
    currentMachines = currentMachines.filter(m => {
      if (sellIds.includes(m.id)) {
        const bookValue = Math.max(0, m.acquisition_value - m.accumulated_depreciation);
        const salePrice = bookValue * (1 - desagioVenda); 
        machineSalesInflow += salePrice;
        machineSalesLoss += (bookValue - salePrice); // Deságio considerado como perda não operacional
        return false;
      }
      return true;
    });
  }

  // B. PROCESSAR COMPRAS
  const buyDecisions = decision.machinery?.buy || { alfa: 0, beta: 0, gama: 0 };
  Object.entries(buyDecisions).forEach(([model, qty]: [any, any]) => {
    if (qty > 0) {
      const basePrice = indicators.machinery_values[model as MachineModel];
      const adjustKey = model === 'alfa' ? 'machine_alpha_price_adjust' : 
                        model === 'beta' ? 'machine_beta_price_adjust' : 
                        'machine_gamma_price_adjust';
      
      const fallbackAdjust = model === 'alfa' ? indicators.machine_alpha_price_adjust : 
                             model === 'beta' ? indicators.machine_beta_price_adjust : 
                             indicators.machine_gamma_price_adjust;

      const unitPrice = basePrice * getAdjust(adjustKey, sanitize(fallbackAdjust, 0));
      const totalCost = unitPrice * qty;
      
      // Se em RJ, limita investimento a 40% do solicitado
      const effectivePurchaseCost = isRJ ? totalCost * 0.4 : totalCost;
      const effectiveQty = isRJ ? Math.floor(qty * 0.4) : qty;

      machinePurchaseOutflow += effectivePurchaseCost;
      // Financiamento BDI: 100% Longo Prazo (Regra: 4 carência + 4 amortização) - Bloqueado em RJ
      if (!isRJ) {
        newBdiLoanAmount += effectivePurchaseCost;
      }

      for (let i = 0; i < effectiveQty; i++) {
        currentMachines.push({
          id: `M-${Math.random().toString(36).substr(2, 9)}`,
          model: model as MachineModel,
          age: 0,
          acquisition_value: unitPrice,
          accumulated_depreciation: 0 // Depreciação começa no PRÓXIMO período
        });
      }
    }
  });

  // NOTA SÊNIOR: Cálculo da saída fiduciária real de caixa próprio para compra de máquinas.
  // Se houver financiamento de fomento (BDI), a saída líquida imediata de caixa próprio é zero.
  const cashFlowMachBuy = Math.max(0, machinePurchaseOutflow - newBdiLoanAmount);

  // C. ATUALIZAR IDADE E DEPRECIAÇÃO DE TODAS AS MÁQUINAS (Computadas de imediato a partir do período de aquisição)
  const existingMachineIds = (team.kpis?.machines || []).map(m => m.id);
  currentMachines = currentMachines.map(m => {
    const spec = indicators.machine_specs[m.model];
    // Regra do CPC 27: Máquinas e Equipamentos com vida útil de 10 Anos (10% ao ano sobre o valor de aquisição)
    const depVal = m.acquisition_value / (spec?.useful_life_years || 10);
    
    // NOTA SÊNIOR / CPC 27: A depreciação é computada de imediato sobre todas as máquinas ativas (existentes e novas)
    periodDepreciation += depVal;
    return { ...m, age: m.age + 1, accumulated_depreciation: m.accumulated_depreciation + depVal };
  });

  // D. VALOR TOTAL DO IMOBILIZADO (MÁQUINAS)
  const totalMachineryCost = currentMachines.reduce((acc, m) => acc + m.acquisition_value, 0);
  const totalMachineryDeprec = currentMachines.reduce((acc, m) => acc + m.accumulated_depreciation, 0);

  // Regra do CPC 27 Fiduciária de Real Estate (Patrimonial) - Ajuste Recorrente de Depreciação:
  // - Prédio Próprio: Edifício deprecia a 4% ao ano. Terreno não deprecia.
  // - Instalações Industriais / Benfeitorias: Amortização/Depreciação de 10% ao ano (buildingsDepRateAnnual).
  const ecoConfig = (ecosystem as any).ecosystem_config || (ecosystem as any).config?.ecosystem_config || {};
  const isZeroModeLocal = (ecosystem as any).starting_mode === 'start_from_zero' || (ecosystem as any).config?.starting_mode === 'start_from_zero';
  const buildMode = ecoConfig.building_mode ?? 'owned';
  const installationsVal = ecoConfig.installations_value ?? 500000.00;
  const buildingBaseValue = buildMode === 'owned' ? (ecoConfig.building_value ?? 2000000.00) : 0;
  const buildingsCost = findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings') || (buildingBaseValue + installationsVal);
  const buildingsDepRateAnnual = ecoConfig.buildings_depreciation_rate !== undefined 
    ? Number(ecoConfig.buildings_depreciation_rate) 
    : ((ecosystem as any).buildings_depreciation_rate !== undefined 
        ? Number((ecosystem as any).buildings_depreciation_rate) 
        : 10);

  const prevBuildingsDeprec = Math.abs(findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings_deprec'));
  
  let buildingDepPeriod = 0;
  if (buildMode === 'owned') {
    buildingDepPeriod = (buildingBaseValue * 0.04) + (installationsVal * (buildingsDepRateAnnual / 100));
  } else {
    buildingDepPeriod = installationsVal * (buildingsDepRateAnnual / 100);
  }

  const newBuildingsDeprecAccum = prevBuildingsDeprec + buildingDepPeriod;
  periodDepreciation += buildingDepPeriod;

  // --- 3. CÁLCULO DO CPP (CUSTO DO PRODUTO PRODUZIDO) ---
  const selectedShifts = sanitize(decision.production?.shifts, 1);
  let capMult = 1.0;
  let modMult = 1.0;
  if (selectedShifts === 2) {
    capMult = 1.8;
    modMult = 1.5;
  } else if (selectedShifts === 3) {
    capMult = 2.3;
    modMult = 2.0;
  }

  const capacity = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.production_capacity || 0), 0) * capMult;
  const activityLevel = sanitize(decision.production?.activityLevel, 100) / 100;

  // Verificação de Operadores vs Capacidade
  const operatorsAvailable = (team.kpis?.staffing?.production || 470) + sanitize(decision.hr?.hired, 0) - sanitize(decision.hr?.fired, 0);
  const operatorsRequired = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.operators_required || 0), 0);
  
  // Mão de Obra Direta (MOD) reajustada por inflação ou decisão e pelos turnos extras
  const payrollMOD = operatorsRequired * currentSalary * activityLevel * modMult;
  const socialChargesMOD = payrollMOD * (socialChargesAttr - 1);
  const productivityBonus = payrollMOD * (sanitize(decision.hr?.productivityBonusPercent, 0) / 100);
  const totalMOD = payrollMOD + socialChargesMOD + productivityBonus;

  // Folha Administrativa e de Vendas (User Request: Breakdown Adm/Vendas)
  const staffAdmin = indicators.staffing?.admin?.count || 20;
  const staffSales = indicators.staffing?.sales?.count || 10;
  
  const payrollAdm = staffAdmin * currentSalary * (indicators.staffing?.admin?.salaries || 4);
  const socialChargesAdm = payrollAdm * (socialChargesAttr - 1);
  const totalPayrollAdm = payrollAdm + socialChargesAdm;

  const payrollSales = staffSales * currentSalary * (indicators.staffing?.sales?.salaries || 4);
  const socialChargesSales = payrollSales * (socialChargesAttr - 1);
  const totalPayrollSales = payrollSales + socialChargesSales;

  // --- 3.1 CÁLCULO DE RESCISÃO E PPR PROPORCIONAL (USER REQUEST) ---
  const totalStaff = (team.kpis?.staffing?.production || 470) + staffAdmin + staffSales;
  const firedTotal = sanitize(decision.hr?.fired, 0);
  
  // PPR proporcional aos demitidos (liquidado na rescisão)
  const pprProporcional = (firedTotal > 0 && totalStaff > 0) ? prevPprPayable * (firedTotal / totalStaff) : 0;
  
  // Indenização base: 1 salário base + 1 multa (total 2 salários)
  const custoIndenizacao = firedTotal * currentSalary * 2;
  
  // O PPR restante (dos que ficaram) também será pago nesta rodada (regra: pago no período seguinte)
  const pprNormalPayment = prevPprPayable - pprProporcional;
  const totalPprPayment = prevPprPayable; // No final, todo o passivo anterior é liquidado

  // Se faltar operador, a capacidade efetiva é reduzida proporcionalmente
  const operatorConstraint = operatorsRequired > 0 ? Math.min(1, operatorsAvailable / operatorsRequired) : 1;
  const effectiveCapacity = capacity * operatorConstraint;
  
  // --- MODELO APERFEIÇOADO DE PRODUTIVIDADE E MOTIVAÇÃO (STRATEGOS v19.5 - SAPPHIRE) ---
  const trainingPercent = sanitize(decision.hr?.trainingPercent, 0);
  const boughtNew = machinePurchaseOutflow > 0;
  
  // 1. Training Factor (0.75 ~ 1.35)
  const hired = sanitize(decision.hr?.hired, 0);
  const hiredFraction = hired / (operatorsAvailable || 1);
  let trainingFactor = 1.0;
  if (hiredFraction > 0 || boughtNew) {
    const pressure = (hiredFraction * 0.9) + (boughtNew ? 0.25 : 0);
    trainingFactor = 1.0 - pressure + (trainingPercent / 10) * 0.55;
  } else {
    trainingFactor = 1.0 + (trainingPercent - 3) * 0.04; // Baseline ao redor de 3%
  }
  trainingFactor = Math.max(0.75, Math.min(1.35, trainingFactor));

  // 2. Motivation Factor (0.60 ~ 1.30)
  const avgMarketSalary = indicators.hr_base.salary * inflationMult;
  const salaryIndex = currentSalary / avgMarketSalary;
  const pprRate = sanitize(decision.hr?.participationPercent, 10) / 100;
  const pprIndex = 1 + (pprRate * 1.5); // PPR até 20% aumenta a motivação
  const prodBonusPercent = sanitize(decision.hr?.productivityBonusPercent, 0) / 100;
  const prodBonusIndex = 1 + (prodBonusPercent * 1.25); // Prêmio por Produtividade (até 20%) aumenta motivação
  let motivationFactor = (0.5 * salaryIndex * pprIndex * prodBonusIndex) + 0.5;
  motivationFactor = Math.max(0.60, Math.min(1.30, motivationFactor));

  // 3. Fatigue Factor (0.75 ~ 1.00)
  const extraProductionPercent = selectedShifts > 1 ? 0 : Math.min(25, sanitize(decision.production?.extraProductionPercent, 0));
  let fatigueFactor = 1.0;
  if (extraProductionPercent > 0) {
    fatigueFactor -= (extraProductionPercent / 100) * 0.5; // Mutação severa de hora extra prolongada
  }
  if (selectedShifts === 3) {
    fatigueFactor -= 0.10;
  } else if (selectedShifts === 2) {
    fatigueFactor -= 0.04;
  }
  fatigueFactor = Math.max(0.75, Math.min(1.00, fatigueFactor));

  // 4. Demission Insecurity Factor (0.65 ~ 1.00)
  const fired = sanitize(decision.hr?.fired, 0);
  const previousStaff = team.kpis?.staffing?.production || 470;
  const firedFraction = fired / (previousStaff || 1);
  let demissionInsecurityFactor = 1.0;
  if (firedFraction > 0) {
    demissionInsecurityFactor = 1.0 - (firedFraction * 1.5);
  }
  demissionInsecurityFactor = Math.max(0.65, Math.min(1.00, demissionInsecurityFactor));

  // 5. Machine Age Factor (0.70 ~ 1.00)
  const totalAge = currentMachines.reduce((acc, m) => acc + m.age, 0);
  const avgAge = currentMachines.length > 0 ? (totalAge / currentMachines.length) : 0;
  let machineAgeFactor = 1.0;
  if (avgAge > 1) {
    machineAgeFactor -= (avgAge - 1) * 0.06;
  }
  machineAgeFactor = Math.max(0.70, Math.min(1.00, machineAgeFactor));

  // --- RENDIMENTO DE MOTIVAÇÃO E CLIMA (CÁLCULO E GREVE SÊNIOR) ---
  const motivationIndex = (motivationFactor + (1.0 - demissionInsecurityFactor)) / 2.0;
  
  let motivationLevel: 'ALTO' | 'BOM' | 'REGULAR' | 'RUIM' = 'REGULAR';
  if (motivationIndex >= 1.15) {
    motivationLevel = 'ALTO';
  } else if (motivationIndex >= 0.95) {
    motivationLevel = 'BOM';
  } else if (motivationIndex >= 0.75) {
    motivationLevel = 'REGULAR';
  } else {
    motivationLevel = 'RUIM';
  }

  // Lógica de Greve persistida por rodadas consecutivas ruins
  const prevConsecutiveRuim = team.kpis?.consecutive_ruim_rounds || 0;
  const consecutiveRuimRounds = motivationLevel === 'RUIM' ? (prevConsecutiveRuim + 1) : 0;
  const strikeActive = consecutiveRuimRounds >= 2;
  const strikeFactor = strikeActive ? 0.50 : 1.0; // Paralisação severa de 50%
  const strikeAlertActive = consecutiveRuimRounds === 1;

  // Índice Combina todos os modificadores
  const productivityIndex = trainingFactor * motivationFactor * fatigueFactor * demissionInsecurityFactor * machineAgeFactor;

  // Custo de Treinamento (Folha industrial afetada de treinamento)
  const trainingCost = payrollMOD * (trainingPercent / 100);

  // Unidades produzidas efetivamente
  let unitsProduced = Math.floor(effectiveCapacity * activityLevel * productivityIndex * strikeFactor);

  // Produção Extra (Hora Extra) - Custo MOD 50% superior para o excedente
  if (extraProductionPercent > 0) {
    const extraUnits = Math.floor(unitsProduced * (extraProductionPercent / 100));
    unitsProduced += extraUnits;
  }
  const extraProductionCost = extraProductionPercent > 0 ? (Math.floor(unitsProduced * (extraProductionPercent / (100 + extraProductionPercent))) / (unitsProduced || 1)) * totalMOD * 0.5 : 0;

  // --- 3.1 GESTÃO DE SUPRIMENTOS E COMPRAS DE EMERGÊNCIA (USER REQUEST) ---
  const purchaseMPA = sanitize(decision.production?.purchaseMPA, 0);
  const purchaseMPB = sanitize(decision.production?.purchaseMPB, 0);
  const supplierPaymentType = sanitize(decision.production?.paymentType, 0); // 0: A Vista, 1: A VISTA + 50%, 2: A VISTA + 33% + 33%
  
  // Fator de Juros do Fornecedor (Proporcional ao Saldo Devedor Financiado - v19.12)
  const supplierInterestRate = sanitize(indicators.supplier_interest, 0) / 100;
  const supplierInterestFactor = 
    supplierPaymentType === 0 ? 1.0 :
    supplierPaymentType === 1 ? (1 + 0.5 * supplierInterestRate) :
    (1 + 0.99 * supplierInterestRate);

  // Verificação de Necessidade de Compra de Emergência
  const initialMPAStock = Math.max(0, team.kpis?.stock_quantities?.mp_a || 0);
  const initialMPBStock = Math.max(0, team.kpis?.stock_quantities?.mp_b || 0);
  
  const requiredMPA = unitsProduced * 3;
  const requiredMPB = unitsProduced * 2;
  
  const availableMPA = initialMPAStock + purchaseMPA;
  const availableMPB = initialMPBStock + purchaseMPB;
  
  let emergencyMPA = 0;
  let emergencyMPB = 0;
  
  if (requiredMPA > availableMPA) emergencyMPA = requiredMPA - availableMPA;
  if (requiredMPB > availableMPB) emergencyMPB = requiredMPB - availableMPB;
  
  // Ágio de Compra Especial
  const specialPremium = 1 + (sanitize(indicators.special_purchase_premium, 5) / 100);
  
  // Cálculo dos Custos de Aquisição (Considerando Juros e Ágio)
  const plannedPurchaseCost = (purchaseMPA * mpaPrice * supplierInterestFactor) + 
                                (purchaseMPB * mpbPrice * supplierInterestFactor);
                                
  const emergencyPurchaseCost = (emergencyMPA * mpaPrice * specialPremium) + 
                                (emergencyMPB * mpbPrice * specialPremium);

  const totalPurchaseMP = plannedPurchaseCost + emergencyPurchaseCost;

  // Matéria-Prima Consumida (Com reajuste, juros e ágio se aplicável) - VALOR LÍQUIDO (sem IVA)
  // COMPRAS ESPECIAIS (Emergenciais) são pagas imediatamente (a vista) e não sofrem acréscimo de juros de financiamento do fornecedor (supplierInterestFactor)
  const netEmergencyMpaPrice = netMpaPrice * specialPremium;
  const netEmergencyMpbPrice = netMpbPrice * specialPremium;
  const netPlannedMpaPrice = netMpaPrice * supplierInterestFactor;
  const netPlannedMpbPrice = netMpbPrice * supplierInterestFactor;

  // Consumo: Prioriza estoque inicial, depois compra planejada, depois emergência
  const totalUnitsMPA = Math.max(requiredMPA, availableMPA);
  const totalUnitsMPB = Math.max(requiredMPB, availableMPB);
  
  // WAC fidedigno usando saldos reais do balanço patrimonial anterior (v19.14 Gold Standard)
  const initialMpaValue = findAccountValue(prevBS, 'assets.current.stock.mpa') || (initialMPAStock * netMpaPrice);
  const initialMpbValue = findAccountValue(prevBS, 'assets.current.stock.mpb') || (initialMPBStock * netMpbPrice);

  const avgNetMpaPrice = (initialMpaValue + (purchaseMPA * netPlannedMpaPrice) + (emergencyMPA * netEmergencyMpaPrice)) / (totalUnitsMPA || 1);
  const avgNetMpbPrice = (initialMpbValue + (purchaseMPB * netPlannedMpbPrice) + (emergencyMPB * netEmergencyMpbPrice)) / (totalUnitsMPB || 1);

  const totalMP = (unitsProduced * 3 * avgNetMpaPrice) + (unitsProduced * 2 * avgNetMpbPrice);

  const supplierInterestExpenses = totalPurchaseMP * (1 - (1 / supplierInterestFactor));
  const emergencyPurchaseExpenses = emergencyPurchaseCost;
  const emergencyUnitsTotal = emergencyMPA + emergencyMPB;

  // Manutenção Industrial (GGF reajustado por inflação)
  const maintenance = capacity * 2.5 * inflationMult; 

  // --- 4. GESTÃO FISICA DE ESTOQUES E DEMANDA ---
  // Para evitar dependências cíclicas com o WAC, os fluxos físicos e de venda são computados primeiro,
  // permitindo auferir precisamente o custo de estocagem do período que integrará o CIF.
  const prevStockQty = sanitize(team.kpis?.stock_quantities?.finished_goods, 0);
  const prevStockValue = findAccountValue(prevBS, 'assets.current.stock.pa');
  
  // Quantidade total disponível para venda
  const totalQtyForSale = prevStockQty + unitsProduced;

  // Demanda e Vendas por Região (Físico)
  let totalUnitsSold = 0;
  let totalRevenue = 0;
  let totalCashSales = 0;
  let totalCreditSales = 0;
  let totalMarketingExp = 0;
  let weightedPmrSum = 0;

  const regions = Object.entries(decision.regions || {});
  const regionCount = regions.length || 1;
  const baseDemandPerRegion = (capacity * 0.8) / regionCount;

  // Dicionário para guardar as demandas calculadas por região para ponderar a distribuição se necessário
  const regionalDemands: Record<string, number> = {};

  regions.forEach(([id, reg]: [string, any]) => {
    const regPrice = sanitize(reg.price, 425);
    const regMarketing = sanitize(reg.marketing, 0);
    const regTerm = sanitize(reg.term, 0); // 0: A VISTA, 1: A VISTA + 50%, 2: A VISTA + 33% + 33%

    const regId = Number(id);
    const regConfig = (ecosystem as any)?.regions?.find((r: any) => r.id === regId) || (ecosystem as any)?.region_configs?.find((r: any) => r.id === regId);
    
    const baseSuggestedPrice = regConfig?.suggested_price !== undefined ? Number(regConfig.suggested_price) : (indicators.avg_selling_price || 425);
    const baseMarketingCost = regConfig?.marketing_cost !== undefined ? Number(regConfig.marketing_cost) : (indicators.prices.marketing_campaign || 10000);

    totalMarketingExp += regMarketing * baseMarketingCost * (sanitize(indicators.marketing_campaign_adjust, 0) / 100 + 1);

    const priceIndex = baseSuggestedPrice / regPrice;
    const marketingIndex = 1 + (regMarketing * 0.08);
    const termIndex = 1 + (regTerm * 0.05);
    
    let regDemand = Math.floor(baseDemandPerRegion * priceIndex * marketingIndex * termIndex * (1 + (indicators.demand_variation / 100)) * rjDemandPenalty);
    regionalDemands[id] = regDemand;

    const regUnitsSold = Math.min(regDemand, Math.floor(totalQtyForSale / regionCount)); 
    totalUnitsSold += regUnitsSold;

    const regRevenue = regUnitsSold * regPrice;
    totalRevenue += regRevenue;

    let cashPercent = 1;
    let avgDays = 0;
    if (regTerm === 1) {
      cashPercent = 0.5;
      avgDays = 15;
    }
    if (regTerm === 2) {
      cashPercent = 0.3333;
      avgDays = 30;
    }

    totalCashSales += regRevenue * cashPercent;
    totalCreditSales += regRevenue * (1 - cashPercent);
    weightedPmrSum += avgDays * regRevenue;
  });

  const pmr = totalRevenue > 0 ? weightedPmrSum / totalRevenue : 0;

  // Ajuste proporcional pelas quantidades disponíveis
  let scaleRatio = 1;
  if (totalUnitsSold > totalQtyForSale) {
    scaleRatio = totalQtyForSale / totalUnitsSold;
    totalUnitsSold = totalQtyForSale;
    totalRevenue *= scaleRatio;
    totalCashSales *= scaleRatio;
    totalCreditSales *= scaleRatio;
  }

  // Custo de Distribuição comercial regionalizado e fidedigno
  let totalDistributionCost = 0;
  regions.forEach(([id, reg]: [string, any]) => {
    const regId = Number(id);
    const regConfig = (ecosystem as any)?.regions?.find((r: any) => r.id === regId) || (ecosystem as any)?.region_configs?.find((r: any) => r.id === regId);
    const baseDistributionUnitCost = regConfig?.distribution_cost !== undefined ? Number(regConfig.distribution_cost) : (indicators.prices.distribution_unit || 50);

    const regDemand = regionalDemands[id] || 0;
    let regUnitsSold = Math.min(regDemand, Math.floor(totalQtyForSale / regionCount));
    
    if (scaleRatio < 1) {
      regUnitsSold *= scaleRatio;
    }

    totalDistributionCost += regUnitsSold * baseDistributionUnitCost * getAdjust('distribution_cost_adjust', sanitize(indicators.distribution_cost_adjust, 0));
  });

  const distributionCost = totalDistributionCost;

  // Estoque Final de Produto Acabado e Matéria-Prima Físicos
  const closingStockPA = totalQtyForSale - totalUnitsSold;
  const currentMPAStock = (team.kpis?.stock_quantities?.mp_a || 0) + purchaseMPA + emergencyMPA - (unitsProduced * 3);
  const currentMPBStock = (team.kpis?.stock_quantities?.mp_b || 0) + purchaseMPB + emergencyMPB - (unitsProduced * 2);

  // Custo Real de Estocagem do Período (calculado sobre saldos físicos finais)
  const storageCost = (closingStockPA * indicators.prices.storage_finished * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0))) + 
                      (Math.max(0, currentMPAStock) * indicators.prices.storage_mp * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0))) + 
                      (Math.max(0, currentMPBStock) * indicators.prices.storage_mp * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0)));

  // --- 4.0 ANÁLISE E RATEIO DE ALUGUEL ---
  const isZeroMode = (ecosystem as any).starting_mode === 'start_from_zero';
  const isRented = ((ecosystem as any).building_mode ?? (isZeroMode ? 'rented' : 'owned')) === 'rented';
  const rentVal = isRented ? ((ecosystem as any).monthly_rent_value !== undefined ? Number((ecosystem as any).monthly_rent_value) : 50000.00) : 0;
  const pProd = (ecosystem as any).rent_allocation_productive !== undefined ? Number((ecosystem as any).rent_allocation_productive) : 70;
  const pAdm = (ecosystem as any).rent_allocation_administrative !== undefined ? Number((ecosystem as any).rent_allocation_administrative) : 10;
  const pSales = (ecosystem as any).rent_allocation_sales !== undefined ? Number((ecosystem as any).rent_allocation_sales) : 20;

  const valCif = rentVal * (pProd / 100);
  const valAdm = rentVal * (pAdm / 100);
  const valSales = rentVal * (pSales / 100);

  // --- 4.1 COMPOSIÇÃO DE CUSTO MOD E CIF (SISTEMÁTICA REAL DE ABSORÇÃO) ---
  // MOD COMPLETA: Salário-Base + Encargos Sociais + Indenização (Rescisão) + Hora-Extra + Prêmio Produtividade
  const finalMOD = totalMOD + extraProductionCost + (custoIndenizacao + pprProporcional);

  // CIF COMPLETO: Despesas de Treinamento + Manutenção + Estocagem de MP/PA + Depreciação de Prédios + Depreciação de Máquinas + Rateio Aluguel
  const finalCIF = periodDepreciation + maintenance + trainingCost + storageCost + valCif;

  // CPP TOTAL: MP Consumida + MOD Completa + CIF Completo
  const totalCPP = totalMP + finalMOD + finalCIF;
  const unitCPP = unitsProduced > 0 ? totalCPP / unitsProduced : 0;

  // --- 4.2 GESTÃO CONTÁBIL DE ESTOQUES (KARDEX-WAC FINANCEIRO) ---
  const totalValueInInventory = prevStockValue + totalCPP;
  const wacUnit = totalQtyForSale > 0 ? totalValueInInventory / totalQtyForSale : unitCPP;

  // CPV (Custo do Produto Vendido)
  const totalCPV = totalUnitsSold * wacUnit;
  const closingStockValuePA = closingStockPA * wacUnit;

  // Desmembramento de Proporções Industriais do CPV
  const currentCppMpRatio = totalCPP > 0 ? totalMP / totalCPP : 0.6;
  const currentCppModRatio = totalCPP > 0 ? finalMOD / totalCPP : 0.25;
  const currentCppCifRatio = totalCPP > 0 ? finalCIF / totalCPP : 0.15;

  const totalCPV_MP = totalCPV * currentCppMpRatio;
  const totalCPV_MOD = totalCPV * currentCppModRatio;
  const totalCPV_CIF = totalCPV * currentCppCifRatio;

  // --- 5. RESULTADOS FINANCEIROS ---
  const revenue = totalRevenue;
  
  // PECLD (Inadimplência) - Apenas sobre vendas a prazo (User Request)
  const defaultRate = (sanitize(indicators.customer_default_rate, 2.5) / 100);
  const badDebtExp = totalCreditSales * defaultRate;

  // Suprimentos (Pagamento a Fornecedores - v19.12)
  // COMPRAS ESPECIAIS (Emergenciais) são pagas 100% no mesmo período (à vista), enquanto as compras planejadas podem ser financiadas.
  const normalPurchaseCost = (purchaseMPA * mpaPrice) + (purchaseMPB * mpbPrice);
  const emergencyPurchaseCostCombined = (emergencyMPA * mpaPrice * specialPremium) + (emergencyMPB * mpbPrice * specialPremium);

  let cashOutflowSuppliers = normalPurchaseCost;
  let newAccountsPayable = 0;
  
  if (supplierPaymentType === 1) {
    // A VISTA 50% (sem juros) + 50% no próximo período (com juros de 1 período: i)
    cashOutflowSuppliers = normalPurchaseCost * 0.5;
    newAccountsPayable = normalPurchaseCost * 0.5 * (1 + supplierInterestRate);
  } else if (supplierPaymentType === 2) {
    // À vista 34% (sem juros) + 33% em T+1 (com juros sobre 66%) + 33% em T+2 (com juros sobre 33%)
    cashOutflowSuppliers = normalPurchaseCost * 0.34;
    newAccountsPayable = normalPurchaseCost * (0.66 + 0.99 * supplierInterestRate);
  }

  // Compras de emergência são adicionas integralmente (100%) nas saídas de caixa deste período
  cashOutflowSuppliers += emergencyPurchaseCostCombined;
  
  // OPEX reajustado + Marketing + Inadimplência
  const currentRoundNum = round ?? 1;
  const zeroOpexInP1 = isZeroMode && currentRoundNum === 1;

  // No modo Start From Zero, as despesas operacionais anteriores são rigorosamente zeradas no round P1
  const prevOpexSales = zeroOpexInP1 ? 0 : Math.abs(findAccountValue(prevStatements.dre, 'opex.sales') || 873250);
  const prevOpexAdm = zeroOpexInP1 ? 0 : Math.abs(findAccountValue(prevStatements.dre, 'opex.adm') || 216000);
  const prevOpexRd = zeroOpexInP1 ? 0 : Math.abs(findAccountValue(prevStatements.dre, 'opex.rd') || 41844);

  // NOTA SÊNIOR: Como storageCost e trainingCost foram capitalizados no CIF contábil e incorporados ao CPP,
  // eles NÃO transitam de forma duplicada no OPEX de vendas/adm operacional imediato do DRE.
  const currentOpexSales = (prevOpexSales * inflationMult) + totalMarketingExp + distributionCost + totalPayrollSales + valSales;
  const currentOpexAdm = (prevOpexAdm * inflationMult) + totalPayrollAdm + valAdm;
  
  // P&D Investimento dinâmico (% da Receita)
  const rdInvestmentPercent = sanitize(decision.production?.rd_investment, 0);
  const currentOpexRd = rdInvestmentPercent > 0 ? (revenue * (rdInvestmentPercent / 100)) : (prevOpexRd * inflationMult);

  const opex = currentOpexSales + currentOpexAdm + currentOpexRd + badDebtExp;
  
  // Juros e Amortização (Diferenciação Normal vs Compulsório vs BDI)
  let prevLoans = (team.kpis?.loans || []) as any[];

  // BLINDAGEM DE INTEGRIDADE CONTÁBIL (SAPPHIRE v19.5):
  // Se a lista lógica de empréstimos (loans) nos KPIs estiver vazia, mas existirem passivos de empréstimos de curto (loans_st) ou
  // de longo prazo (loans_lt) no balanço patrimonial anterior, regeneramos os objetos de empréstimos correspondentes
  // de forma que não haja o desaparecimento misterioso da dívida projetada.
  if (prevLoans.length === 0) {
    const bsStVal = findAccountValue(prevBS, 'liabilities.current.loans_st') || 0;
    const bsLtVal = findAccountValue(prevBS, 'liabilities.longterm.loans_lt') || 0;

    if (bsStVal > 0) {
      prevLoans.push({
        id: 'L-INIT-ST-AUTO',
        type: 'normal',
        amount: bsStVal,
        interest_rate: branch === 'industrial' ? 12.0 : 14.5,
        term: 1,
        remaining_rounds: 1
      });
    }
    if (bsLtVal > 0) {
      prevLoans.push({
        id: 'L-INIT-LT-AUTO',
        type: 'normal',
        amount: bsLtVal,
        interest_rate: branch === 'industrial' ? 10.0 : 12.5,
        term: 8,
        remaining_rounds: 8
      });
    }
  }

  let totalInterestExp = 0;
  let totalAmortization = 0;
  const currentLoans: any[] = [];

  // Processar Empréstimos Existentes
  prevLoans.forEach(loan => {
    let interest = loan.amount * (loan.interest_rate / 100) * rjInterestAgio;
    let amort = 0;

    if (loan.type === 'bdi') {
      if (loan.grace_period_remaining > 0) {
        // Carência: paga apenas juros
        amort = 0;
        loan.grace_period_remaining -= 1;
      } else {
        // Amortização: principal + juros (Amortização Constante baseada nos rounds restantes)
        amort = loan.amount / loan.remaining_rounds;
      }
    } else if (loan.type === 'normal') {
      amort = loan.amount / loan.remaining_rounds;
    } else if (loan.type === 'compulsory') {
      amort = loan.amount; // Compulsório paga tudo no round seguinte
      interest = loan.amount * (sanitize(indicators.interest_rate_tr, 2) / 100) + (loan.amount * (sanitize(indicators.compulsory_loan_agio, 3) / 100));
    }

    totalInterestExp += interest;
    totalAmortization += amort;
    
    const remaining = loan.amount - amort;
    if (remaining > 0.01) {
      currentLoans.push({
        ...loan,
        amount: remaining,
        remaining_rounds: Math.max(1, loan.remaining_rounds - 1)
      });
    }
  });

  // Adicionar Novo Empréstimo BDI se houve compra e cobrar juros dele de imediato
  let newBdiInterest = 0;
  if (newBdiLoanAmount > 0) {
    newBdiInterest = newBdiLoanAmount * (sanitize(indicators.interest_rate_tr, 2) / 100) * rjInterestAgio;
    totalInterestExp += newBdiInterest;

    currentLoans.push({
      id: `L-BDI-${Math.random().toString(36).substr(2, 5)}`,
      type: 'bdi',
      amount: newBdiLoanAmount,
      interest_rate: sanitize(indicators.interest_rate_tr, 2),
      term: 8,
      remaining_rounds: 8,
      grace_period_remaining: 4
    });
  }

  // Processar Novo Empréstimo Solicitado (Manual)
  const loanRequest = sanitize(decision.finance?.loanRequest, 0);
  const loanTerm = sanitize(decision.finance?.loanTerm, 0); // 0: 1 round, 1: 2 rounds, 2: 3 rounds
  const loanTermsMap = [1, 2, 3];
  const selectedTerm = loanTermsMap[loanTerm] || 1;

  if (loanRequest > 0 && !isRJ) {
    const loanSpread = getSpreadByRating(team.kpis?.rating || 'B');
    const normalInterestRate = sanitize(indicators.interest_rate_tr, 2) + loanSpread;

    currentLoans.push({
      id: `L-REQ-${Math.random().toString(36).substr(2, 5)}`,
      type: 'normal',
      amount: loanRequest,
      interest_rate: normalInterestRate, // Base TR + spread de rating
      term: selectedTerm,
      remaining_rounds: selectedTerm
    });
  }

  const interestExp = totalInterestExp;
  
  // Rendimentos de Aplicações Financeiras
  const investmentReturn = prevInvestments * (sanitize(indicators.investment_return_rate, 1) / 100);
  
  // Receita Financeira de Vendas a Prazo (Juros de Prazo)
  const termInterestRate = sanitize(decision.production?.term_interest_rate, 0) / 100;
  const termInterestRevenue = totalCreditSales * termInterestRate;
  
  const totalFinancialRevenue = investmentReturn + termInterestRevenue;
  
  // --- 4.5 APURAÇÃO DE IVA (GOLD STANDARD v19.0) ---
  const ivaOnSales = revenue * vatSalesRate; // Débito gerado nas vendas
  const ivaRecoverableGenerated = totalPurchaseMP * vatPurchasesRate; // Crédito gerado nas compras

  // 1. Pagamento automático do passivo anterior (Fluxo de Caixa)
  const vatPayment = prevVatPayable; 

  // 2. Acúmulo de Créditos (Anterior + Atual) - CORREÇÃO v19.0: Crédito atual entra no ativo antes da netting
  const totalRecoverableAvailable = prevVatRecoverable + ivaRecoverableGenerated;

  // 3. Apuração do Saldo Líquido do Período
  // Saldo = Débito (Vendas) - Crédito Total Disponível
  const netIvaBalance = ivaOnSales - totalRecoverableAvailable;

  let finalVatPayable = 0;
  let finalVatRecoverable = 0;

  if (netIvaBalance > 0) {
    // Empresa deve pagar a diferença (Saldo Devedor)
    finalVatPayable = netIvaBalance;
    finalVatRecoverable = 0;
  } else {
    // Empresa fica com crédito acumulado (Saldo Credor)
    finalVatPayable = 0;
    finalVatRecoverable = Math.abs(netIvaBalance);
  }

  const operatingProfit = (revenue - ivaOnSales) - totalCPV - opex;
  const lair = operatingProfit - interestExp + totalFinancialRevenue - machineSalesLoss;
  
  // PPR (Participação nos Lucros) - Dinâmico conforme decisão (0-20%)
  const ppr = lair > 0 ? lair * pprRate : 0;
  const lairAfterPpr = lair - ppr;

  const taxRate = (sanitize(indicators.tax_rate_ir, 25) / 100);
  const taxProv = lairAfterPpr > 0 ? lairAfterPpr * taxRate : 0;
  const netProfit = lairAfterPpr - taxProv;
  
  const dividendPercent = (sanitize(indicators.dividend_percent, 25) / 100);
  const dividends = netProfit > 0 ? netProfit * dividendPercent : 0;
  
  // --- 4.6 MOTIVAÇÃO E CLIMA ORGANIZACIONAL (v19.5 SAPPHIRE) ---
  const motivation = motivationIndex;

  // Fluxo de Caixa (DFC)
  // Recebimento = Vendas à Vista (Atual) + Recebimento Líquido de Clientes (Anterior)
  const cashInflowFromSales = totalCashSales + (prevClients - prevPecld);
  
  // Aplicação Financeira (Saída de Caixa)
  const applicationAmount = sanitize(decision.finance?.application, 0);

  // Total Outflows para cálculo de caixa
  // Inclui: Pagamento do PPR anterior (totalPprPayment) + Indenização de demissões (custoIndenizacao) + Dividendos anteriores + IVA anterior + Imposto de Renda do período anterior (prevTaxes)
  // NOTA SÊNIOR: Trocamos 'taxProv' por 'prevTaxes' nas saídas de caixa para preservar o regime de caixa correto dos tributos federais de rodada a rodada.
  const salesOverhead = prevOpexSales * inflationMult;
  const admOverhead = prevOpexAdm * inflationMult;
  const totalOutflows = cashOutflowSuppliers + prevSuppliers + totalMOD + totalPayrollAdm + totalPayrollSales + totalPprPayment + custoIndenizacao + extraProductionCost + currentOpexRd + totalMarketingExp + distributionCost + storageCost + maintenance + cashFlowMachBuy + interestExp + totalAmortization + prevTaxes + prevDividends + trainingCost + vatPayment + applicationAmount + rentVal + salesOverhead + admOverhead;

  if (isNaN(totalOutflows) || isNaN(team.kpis?.current_cash)) {
    console.log("DIAGNOSTICO DE NaN:", {
      cashOutflowSuppliers,
      prevSuppliers,
      totalMOD,
      totalPayrollAdm,
      totalPayrollSales,
      totalPprPayment,
      custoIndenizacao,
      extraProductionCost,
      currentOpexRd,
      totalMarketingExp,
      distributionCost,
      storageCost,
      maintenance,
      cashFlowMachBuy,
      interestExp,
      totalAmortization,
      prevTaxes,
      prevDividends,
      trainingCost,
      vatPayment,
      applicationAmount,
      rentVal,
      current_cash: team.kpis?.current_cash,
      cashInflowFromSales,
      machineSalesInflow,
      loanRequest,
      newBdiLoanAmount,
      totalFinancialRevenue
    });
  }

  // NOTA SÊNIOR: O desembolso de Capex financiado já foi neteado via cashFlowMachBuy, portanto, não adicionamos newBdiLoanAmount nas entradas de caixa para manter a DFC operacional pura.
  let cashBeforeCompulsory = sanitize(team.kpis?.current_cash, 0) + cashInflowFromSales + machineSalesInflow + loanRequest + totalFinancialRevenue - totalOutflows;
  
  // NOTA SÊNIOR: Mecanismo Inteligente de Resgate Automático de Aplicações Financeiras (v19.11)
  // Se o caixa operacional projetado for ficar negativo, resgatamos os investimentos temporários acumulados
  // para evitar o acionamento indesejado do traumático Empréstimo Compulsório / Emergencial.
  let investmentWithdrawal = 0;
  if (cashBeforeCompulsory < 0 && prevInvestments > 0) {
    investmentWithdrawal = Math.min(Math.abs(cashBeforeCompulsory), prevInvestments);
    cashBeforeCompulsory += investmentWithdrawal;
  }

  // Liberação Automática de Empréstimo Compulsório (Strategos Core)
  let newCompulsoryLoan = 0;
  if (cashBeforeCompulsory < 0) {
    newCompulsoryLoan = Math.abs(cashBeforeCompulsory);
    cashBeforeCompulsory = 0; // Caixa zerado, coberto pelo compulsório

    // NOTA SÊNIOR: Adiciona o compulsório à nossa carteira corrente de empréstimos (currentLoans)
    // para que ele seja projetado, amortizado e auditado adequadamente nas telas e no próximo round do motor.
    const compulsoryAgio = sanitize(indicators.compulsory_loan_agio, 3);
    const riskSpread = getSpreadByRating(team.kpis?.rating || 'B');
    const punitiveRate = sanitize(indicators.interest_rate_tr, 2) + compulsoryAgio + riskSpread + 5.0; // TR + agio + spread + 5% default penalty

    currentLoans.push({
      id: `L-CMP-${Math.random().toString(36).substr(2, 5)}`,
      type: 'compulsory',
      amount: newCompulsoryLoan,
      interest_rate: punitiveRate,
      term: 1,
      remaining_rounds: 1
    });
  }

  const finalCash = cashBeforeCompulsory;

  // --- 6. ATUALIZAÇÃO DA ESTRUTURA CONTÁBIL ---
  let totalLoansST = 0;
  let totalLoansLT = 0;

  currentLoans.forEach(l => {
    if (l.type === 'bdi') {
      // Mutação BDI: Próxima parcela de principal vai para Curto Prazo
      if (l.grace_period_remaining === 0) {
        const nextAmort = l.amount / l.remaining_rounds;
        totalLoansST += nextAmort;
        totalLoansLT += (l.amount - nextAmort);
      } else {
        // Ainda em carência, o principal só vira ST quando o próximo round for de amortização
        totalLoansLT += l.amount;
      }
    } else {
      // Outros empréstimos (Normal, Compulsório) são tratados como ST
      totalLoansST += l.amount;
    }
  });

  const closingMpaQty = (team.kpis?.stock_quantities?.mp_a || 0) + purchaseMPA + emergencyMPA - (unitsProduced * 3);
  const closingMpbQty = (team.kpis?.stock_quantities?.mp_b || 0) + purchaseMPB + emergencyMPB - (unitsProduced * 2);
  const closingMpaValue = Math.max(0, closingMpaQty) * avgNetMpaPrice;
  const closingMpbValue = Math.max(0, closingMpbQty) * avgNetMpbPrice;

  const bsValues = {
    'assets.current.cash': finalCash,
    'assets.current.investments': Math.max(0, prevInvestments - investmentWithdrawal) + applicationAmount,
    'assets.current.stock.pa': closingStockValuePA,
    'assets.current.stock.mpa': closingMpaValue,
    'assets.current.stock.mpb': closingMpbValue,
    'assets.current.clients': totalCreditSales,
    'assets.current.pecld': -badDebtExp,
    'assets.current.vat_recoverable': finalVatRecoverable,
    'assets.noncurrent.fixed.machines': totalMachineryCost,
    'assets.noncurrent.fixed.machines_deprec': -totalMachineryDeprec,
    'assets.noncurrent.fixed.buildings_deprec': -newBuildingsDeprecAccum,
    'liabilities.current.suppliers': newAccountsPayable,
    'liabilities.current.loans_st': totalLoansST,
    'liabilities.current.vat_payable': finalVatPayable, // O pagamento (vatPayment) já liquidou o anterior, finalVatPayable é a nova dívida
    'liabilities.current.taxes': taxProv,
    'liabilities.current.dividends': dividends, // Provisiona os novos dividendos, os anteriores (prevDividends) foram pagos
    'liabilities.current.ppr_payable': ppr, // Provisiona o PPR calculado nesta rodada para pagar na próxima
    'liabilities.longterm.loans_lt': totalLoansLT,
    'equity.profit': findAccountValue(prevBS, 'equity.profit') + netProfit - dividends
  };

  const finalBS = injectValues(JSON.parse(JSON.stringify(prevBS)), bsValues);

  // --- 8. PREMIAÇÕES POR PRECISÃO (AUDIT AWARDS) ---
  let totalAwards = 0;
  const tolerance = 0.05; // 5% de tolerância padrão Oracle

  // A. Precisão de Custo Unitário
  const costDiff = Math.abs(unitCPP - sanitize(decision.estimates?.forecasted_unit_cost, 0));
  if (unitCPP > 0 && (costDiff / unitCPP) <= tolerance) {
    totalAwards += sanitize(indicators.award_values?.cost_precision, 0);
  }

  // B. Precisão de Faturamento
  const revDiff = Math.abs(revenue - sanitize(decision.estimates?.forecasted_revenue, 0));
  if (revenue > 0 && (revDiff / revenue) <= tolerance) {
    totalAwards += sanitize(indicators.award_values?.revenue_precision, 0);
  }

  // C. Precisão de Lucro Líquido
  const profitDiff = Math.abs(netProfit - sanitize(decision.estimates?.forecasted_net_profit, 0));
  if (Math.abs(netProfit) > 0 && (profitDiff / Math.abs(netProfit)) <= tolerance) {
    totalAwards += sanitize(indicators.award_values?.profit_precision, 0);
  }

  // Re-ajustar lucro e caixa com as premiações
  const finalNetProfit = netProfit + totalAwards;
  const finalCashWithAwards = finalCash + totalAwards;

  // --- 6.5 CÁLCULOS INTERMEDIÁRIOS PARA KPIs ---
  const weightedAvgPrice = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : indicators.avg_selling_price;
  const priceIndex = indicators.avg_selling_price / weightedAvgPrice;
  const pmp = supplierPaymentType === 1 ? 15 : (supplierPaymentType === 2 ? 30 : 0);
  
  const marketingInvestment = sanitize(Object.values(decision.regions || {})[0]?.marketing, 0);
  const marketingIndex = 1 + (Math.log10(marketingInvestment + 1) / 10);
  const projectedMarketShare = Math.min(40, 12.5 * priceIndex * marketingIndex * (1 + (indicators.demand_variation / 100)));

  // --- 7. CÁLCULO DE MÉTRICAS AVANÇADAS (ESTRATÉGICAS) ---
  const kpis = calculateKpisFromStatements({
    statements: { 
      dre: injectValues(JSON.parse(JSON.stringify(prevStatements.dre)), { 
        'rev': revenue, 
        'vat_sales': -ivaOnSales,
        'cpv': -totalCPV, 
        'dre.mod': -totalCPV_MOD,
        'dre.cif': -totalCPV_CIF,
        'dre.cpv_mp': -totalCPV_MP,
        'gross_profit': revenue - ivaOnSales - totalCPV,
        'opex.sales': -currentOpexSales,
        'opex.adm': -currentOpexAdm,
        'opex.payroll_adm': -totalPayrollAdm,
        'opex.payroll_sales': -totalPayrollSales,
        'opex.rd': -currentOpexRd,
        'opex.bad_debt': -badDebtExp,
        'operating_profit': operatingProfit,
        'fin.rev': totalFinancialRevenue,
        'fin.exp': -interestExp,
        'non_op.rev': totalAwards,
        'non_op.exp': -machineSalesLoss,
        'lair': lair,
        'tax_prov': -taxProv,
        'ppr': -ppr,
        'final_profit': finalNetProfit 
      }, true),
      cash_flow: injectValues(JSON.parse(JSON.stringify(prevStatements.cash_flow)), { 
        'cf.start': sanitize(team.kpis?.current_cash, 0),
        'cf.inflow.cash_sales': totalCashSales,
        'cf.inflow.term_sales': prevClients - prevPecld,
        'cf.inflow.machine_sales': machineSalesInflow,
        'cf.inflow.awards': totalAwards,
        'cf.inflow.investment_withdrawal': investmentWithdrawal, 
        'cf.inflow.loans_normal': loanRequest,
        'cf.inflow.compulsory': newCompulsoryLoan,
        'cf.inflow.fin_rev': totalFinancialRevenue,
        'cf.outflow.payroll': -(payrollMOD + payrollAdm + payrollSales + totalPprPayment + custoIndenizacao + productivityBonus + extraProductionCost),
        'cf.outflow.social_charges': -(socialChargesMOD + socialChargesAdm + socialChargesSales),
        'cf.outflow.vat_payable': -vatPayment,
        'cf.outflow.rd': -currentOpexRd,
        'cf.outflow.marketing': -totalMarketingExp,
        'cf.outflow.training': -trainingCost,
        'cf.outflow.distribution': -distributionCost,
        'cf.outflow.storage': -storageCost,
        'cf.outflow.suppliers': -(cashOutflowSuppliers + prevSuppliers + salesOverhead + admOverhead),
        'cf.outflow.rent': -rentVal,
        'cf.outflow.misc': 0, 
        'cf.outflow.machine_buy': -cashFlowMachBuy,
        'cf.outflow.maintenance': -maintenance,
        'cf.outflow.interest': -interestExp,
        'cf.outflow.amortization': -totalAmortization,
        'cf.outflow.late_penalties': 0, 
        'cf.outflow.taxes': -prevTaxes,
        'cf.outflow.dividends': -prevDividends,
        'cf.investment_apply': -applicationAmount,
        'cf.final': finalCashWithAwards 
      }, true),
      balance_sheet: (() => {
        let bsFinal = injectValues(JSON.parse(JSON.stringify(finalBS)), {
          'assets.current.cash': finalCashWithAwards,
          'equity.profit': findAccountValue(prevBS, 'equity.profit') + finalNetProfit - dividends
        });

        // NOTA SÊNIOR: Reconciliação Científica de Float Precision (Ativo vs Passivo + PL)
        // Calcula a soma exata de todos os nós folha do Ativo
        const totalAssetsVal = (findAccountValue(bsFinal, 'assets.current.cash') || 0) +
          (findAccountValue(bsFinal, 'assets.current.investments') || 0) +
          (findAccountValue(bsFinal, 'assets.current.clients') || 0) +
          (findAccountValue(bsFinal, 'assets.current.pecld') || 0) + // valor negativo redutor
          (findAccountValue(bsFinal, 'assets.current.vat_recoverable') || 0) +
          (findAccountValue(bsFinal, 'assets.current.stock.pa') || 0) +
          (findAccountValue(bsFinal, 'assets.current.stock.mpa') || 0) +
          (findAccountValue(bsFinal, 'assets.current.stock.mpb') || 0) +
          (findAccountValue(bsFinal, 'assets.noncurrent.fixed.land') || 0) +
          (findAccountValue(bsFinal, 'assets.noncurrent.fixed.buildings') || 0) +
          (findAccountValue(bsFinal, 'assets.noncurrent.fixed.buildings_deprec') || 0) + // valor negativo redutor
          (findAccountValue(bsFinal, 'assets.noncurrent.fixed.machines') || 0) +
          (findAccountValue(bsFinal, 'assets.noncurrent.fixed.machines_deprec') || 0); // valor negativo redutor

        // Calcula a soma exata de todos os nós folha do Passivo e PL
        const totalLiabilitiesVal = (findAccountValue(bsFinal, 'liabilities.current.suppliers') || 0) +
          (findAccountValue(bsFinal, 'liabilities.current.vat_payable') || 0) +
          (findAccountValue(bsFinal, 'liabilities.current.taxes') || 0) +
          (findAccountValue(bsFinal, 'liabilities.current.dividends') || 0) +
          (findAccountValue(bsFinal, 'liabilities.current.ppr_payable') || 0) +
          (findAccountValue(bsFinal, 'liabilities.current.loans_st') || 0) +
          (findAccountValue(bsFinal, 'liabilities.longterm.loans_lt') || 0);

        const totalEquityVal = (findAccountValue(bsFinal, 'equity.capital') || 0) +
          (findAccountValue(bsFinal, 'equity.profit') || 0);

        const roundedAssets = Math.round(totalAssetsVal * 100) / 100;
        const roundedLiabPl = Math.round((totalLiabilitiesVal + totalEquityVal) * 100) / 100;
        const accountingDiff = roundedAssets - roundedLiabPl;

        // Se houver qualquer microdescompasso de float decorrente do motor contábil, harmoniza no PL do balanço projetado
        if (Math.abs(accountingDiff) > 0 && Math.abs(accountingDiff) < 100.0) {
          const currentProfit = findAccountValue(bsFinal, 'equity.profit') || 0;
          bsFinal = injectValues(bsFinal, {
            'equity.profit': currentProfit + accountingDiff
          });
        }

        // --- MUTAÇÃO CONTÁBIL SÊNIOR: INCORPORAÇÃO AUTOMÁTICA DO LUCRO/PREJUÍZO ACUMULADO NO CAPITAL SOCIAL ---
        // Recuperamos a frequência parametrizada pelo Tutor em seu ecossistema
        const profitIncFreq = (ecosystem as any).profit_incorporation_frequency ?? (ecosystem as any).config?.profit_incorporation_frequency;
        if (profitIncFreq && (profitIncFreq === 1 || profitIncFreq === 2 || profitIncFreq === 4)) {
          const currentRound = round ?? 0;
          // Se estamos em um período múltiplo do prazo determinado pelo Tutor
          if (currentRound > 0 && currentRound % profitIncFreq === 0) {
            const currentCapital = findAccountValue(bsFinal, 'equity.capital') || 0;
            const currentProfit = findAccountValue(bsFinal, 'equity.profit') || 0;
            
            // Fato Permutativo Contábil do Patrimônio Líquido:
            // Incorpora o saldo acumulado de Lucro/Prejuízo no Capital Social e zera a conta de Lucro Acumulado
            bsFinal = injectValues(bsFinal, {
              'equity.capital': parseFloat((currentCapital + currentProfit).toFixed(2)),
              'equity.profit': 0
            });
          }
        }

        return bsFinal;
      })()
    },
    prevStatements,
    revenue,
    netProfit: finalNetProfit,
    operatingProfit,
    totalAwards,
    finalCash: finalCashWithAwards,
    prevEquity: team.equity || 7252171,
    prevInvestments,
    applicationAmount,
    totalMachineryCost,
    buildingsCost,
    totalMachineryDeprec,
    newBuildingsDeprecAccum,
    unitsProduced,
    totalUnitsSold,
    closingStockPA,
    closingStockValuePA,
    unitCPP,
    wacUnit,
    periodDepreciation,
    weightedAvgPrice,
    totalRevenue: revenue,
    prevStockValue,
    pmr,
    pmp,
    indicators,
    branch,
    history,
    supplierInterestExpenses,
    emergencyPurchaseExpenses,
    emergencyUnitsTotal,
    currentMachines,
    currentLoans,
    stockQuantities: { 
      mp_a: Math.max(0, closingMpaQty), 
      mp_b: Math.max(0, closingMpbQty), 
      finished_goods: closingStockPA 
    }
  });

  const result: ProjectionResult = {
    revenue, netProfit: finalNetProfit, debtRatio: kpis.percentual_divida_curto_prazo, creditRating: kpis.rating,
    health: { cash: finalCashWithAwards, rating: kpis.rating },
    marketShare: projectedMarketShare,
    kpis: {
      ...team.kpis,
      ...kpis,
      market_share: projectedMarketShare,
      // --- CAPÍTULO DE PRODUTIVIDADE E RECURSOS HUMANOS (v19.5 SAPPHIRE) ---
      productivity_index: Math.round(productivityIndex * 100),
      motivation_index: parseFloat(motivationIndex.toFixed(3)),
      motivation_level: motivationLevel,
      consecutive_ruim_rounds: consecutiveRuimRounds,
      strike_active: strikeActive,
      strike_activated: strikeActive ? 'SIM' : 'NÃO',
      strike_alert_active: strikeAlertActive,
      training_factor: parseFloat(trainingFactor.toFixed(3)),
      motivation_factor: parseFloat(motivationFactor.toFixed(3)),
      fatigue_factor: parseFloat(fatigueFactor.toFixed(3)),
      demission_insecurity_factor: parseFloat(demissionInsecurityFactor.toFixed(3)),
      machine_age_factor: parseFloat(machineAgeFactor.toFixed(3))
    }
  };

  // Executa centralizadamente a orquestração de validações, Kardex-WAC e CPV através de simulation-core (v19.5 Sapphire Gold)
  const validationResult = processRoundWithValidation(
    decision,
    branch,
    ecosystem,
    indicators,
    team,
    history,
    currentRound,
    rules,
    result.kpis
  );

  result.kpis.kardex = validationResult.kardex;
  result.kpis.cpv_details = validationResult.cpvDetails;
  result.kpis.validation = {
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    warnings: validationResult.warnings
  };

  // 7. CÁLCULO DO E-SDS DETERMINÍSTICO COM INTEGRAÇÃO SIMBIÓTICA (User Request v1.2)
  const esdsInputs = {
    fco_livre: result.kpis.fco_livre,
    passivo_circulante: result.kpis.passivo_circulante,
    despesas_operacionais_projetadas_proxima_rodada: result.kpis.despesas_operacionais_projetadas_proxima_rodada,
    receita_liquida: result.kpis.receita_liquida,
    ebitda: result.kpis.ebitda,
    caixa: result.kpis.caixa,
    despesas_operacionais_diarias: result.kpis.despesas_operacionais_diarias,
    passivo_total: result.kpis.passivo_total,
    pl: result.kpis.pl,
    percentual_divida_curto_prazo: result.kpis.percentual_divida_curto_prazo,
    custo_medio_divida: result.kpis.custo_medio_divida,
    alavancagem_efetiva: result.kpis.alavancagem_efetiva,
    divida_liquida: result.kpis.divida_liquida,
    statements: result.kpis.statements  // Enviado para viabilizar auditoria simbiótica profunda do E-SDS v1.2
  };

  result.kpis.esds = computeESDSDeterministic(esdsInputs, history, branch);

  return result;
};

/**
 * Realiza auditoria de equivalência patrimonial local no motor de simulação (Vite/Node)
 */
export const validateTripleConsistencyLocal = validateTripleConsistency;

/**
 * Calcula KPIs a partir das demonstrações financeiras (v2026-03.11)
 */
export const calculateKpisFromStatements = coreCalculateKpis;

/**
 * Prorroga a inteligência calculada de solvência E-SDS v1.2 de forma determinística setorial
 */
export const computeESDSDeterministic = coreComputeESDS;

// Cache simples em memória (para protótipo – migre para Supabase kpis cache em prod)
const esdsCache = new Map<string, ESDSCalculation>();

/**
 * Calcula E-SDS v1.2 completo com todas as correções
 * @param companyId UUID da company
 * @param currentRound Rodada atual
 */
export async function calculateESDS(
  companyId: string,
  currentRound: number
): Promise<ESDSCalculation> {
  const cacheKey = `${companyId}-${currentRound}`;
  if (esdsCache.has(cacheKey)) {
    return esdsCache.get(cacheKey)!;
  }

  // 1. Buscar dados da company (atual + anteriores)
  const { data: rounds, error } = await supabase
    .from('companies')
    .select('round, state')
    .eq('id', companyId)
    .lte('round', currentRound)
    .order('round', { ascending: false })
    .limit(5);

  if (error || !rounds?.length) throw new Error('Dados insuficientes para cálculo E-SDS');

  const sorted = rounds.sort((a, b) => b.round - a.round);
  const current: CompanyState = sorted[0].state;
  const prevStates = sorted.slice(1).map(r => r.state as CompanyState);

  // 2. Config do campeonato
  const { data: champ } = await supabase
    .from('championships')
    .select('config')
    .eq('id', current.championship_id)
    .single();

  const config = (champ?.config as ChampionshipConfig) || {};
  const branch = config.branch || 'industrial';

  // 3. Cálculo Determinístico Unificado
  const result = computeESDSDeterministic(current, prevStates, branch, config);

  esdsCache.set(cacheKey, result);
  return result;
}
