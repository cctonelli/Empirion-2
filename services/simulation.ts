
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs, MachineInstance, AccountNode, MachineModel, ESDSCalculation, ChampionshipConfig, CompanyState } from '../types';
import { INITIAL_FINANCIAL_TREE } from '../constants';
import { supabase } from './supabase';

/**
 * EMPIRION SIMULATION KERNEL v18.8 - STATEFUL COST ACCOUNTING
 * Foco: Diferenciação de reajustes MP vs Inflação e Fluxo de Estoque WAC.
 */

export const sanitize = (val: any, fallback: number): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

export const getCumulativeAdjust = (chronogram: any, round: number, key: string): number => {
  let factor = 1;
  // Reajustes começam a partir do Round 1. O Round 0 é o baseline.
  for (let i = 1; i <= round; i++) {
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
  for (const node of nodes) {
    if (node.id === id) return node.value;
    if (node.children && node.children.length > 0) {
      const val = findAccountValue(node.children, id);
      if (val !== 0) return val;
    }
  }
  return 0;
};

// Injeta novos valores na árvore, recalculando totalizadores
const injectValues = (tree: AccountNode[], values: Record<string, number>, zeroOut: boolean = false): AccountNode[] => {
  return tree.map(node => {
    let newVal = values[node.id] !== undefined ? values[node.id] : (zeroOut ? 0 : node.value);
    let newChildren = node.children ? injectValues(node.children, values, zeroOut) : undefined;
    
    if (node.type === 'totalizer' && newChildren) {
      newVal = newChildren.reduce((sum, child) => {
        // Se for despesa ou passivo na árvore DRE/DFC, subtrai do totalizador
        if (child.type === 'expense' || child.type === 'liability') return sum - Math.abs(child.value);
        return sum + child.value;
      }, 0);
    }

    return { ...node, value: newVal, children: newChildren };
  });
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
  const prevInvestments = findAccountValue(prevBS, 'assets.current.investments') || 0;
  const prevSuppliers = findAccountValue(prevBS, 'liabilities.current.suppliers') || 0;
  
  // --- 1. REAJUSTES TEMPORAIS ESPECÍFICOS ---
  // Se round e round_rules forem fornecidos, usamos o ajuste cumulativo.
  // Caso contrário, usamos o ajuste pontual do objeto indicators (fallback).
  const currentRound = round ?? 0;
  const rules = round_rules || {};

  const getAdjust = (key: string, fallback: number) => {
    if (round !== undefined && round_rules !== undefined) {
      return getCumulativeAdjust(round_rules, round, key);
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

  // C. ATUALIZAR IDADE E DEPRECIAÇÃO DAS MÁQUINAS QUE FICARAM (Apenas as que já existiam no início do round)
  const existingMachineIds = (team.kpis?.machines || []).map(m => m.id);
  currentMachines = currentMachines.map(m => {
    const isNew = !existingMachineIds.includes(m.id);
    const spec = indicators.machine_specs[m.model];
    const depVal = m.acquisition_value / (spec?.useful_life_years || 40);
    
    // Depreciação já começa a ser computada sobre a nova aquisição a partir do PRÓXIMO período
    // Então aqui só depreciamos se NÃO for nova
    if (!isNew) {
      periodDepreciation += depVal;
      return { ...m, age: m.age + 1, accumulated_depreciation: m.accumulated_depreciation + depVal };
    }
    return { ...m, age: m.age + 1 };
  });

  // D. VALOR TOTAL DO IMOBILIZADO (MÁQUINAS)
  const totalMachineryCost = currentMachines.reduce((acc, m) => acc + m.acquisition_value, 0);
  const totalMachineryDeprec = currentMachines.reduce((acc, m) => acc + m.accumulated_depreciation, 0);

  // Depreciação de Prédios (Stateful) - 0.2% por período
  const buildingsCost = findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings') || 5440000;
  const prevBuildingsDeprec = Math.abs(findAccountValue(prevBS, 'assets.noncurrent.fixed.buildings_deprec'));
  const buildingDepPeriod = buildingsCost * 0.002;
  const newBuildingsDeprecAccum = prevBuildingsDeprec + buildingDepPeriod;
  periodDepreciation += buildingDepPeriod;

  // --- 3. CÁLCULO DO CPP (CUSTO DO PRODUTO PRODUZIDO) ---
  const capacity = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.production_capacity || 0), 0);
  const activityLevel = sanitize(decision.production?.activityLevel, 100) / 100;

  // Verificação de Operadores vs Capacidade
  const operatorsAvailable = (team.kpis?.staffing?.production || 470) + sanitize(decision.hr?.hired, 0) - sanitize(decision.hr?.fired, 0);
  const operatorsRequired = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.operators_required || 0), 0);
  
  // Mão de Obra Direta (MOD) reajustada por inflação ou decisão
  const payrollMOD = operatorsRequired * currentSalary * activityLevel;
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
  
  // Impacto de Treinamento na Produtividade
  // Se comprou máquinas novas e investiu pouco em treinamento (< 5%), penaliza produtividade
  const boughtNew = machinePurchaseOutflow > 0;
  const trainingPercent = sanitize(decision.hr?.trainingPercent, 0);
  const trainingPenalty = (boughtNew && trainingPercent < 5) ? 0.75 : 1; // 25% de perda se não treinar
  
  // Custo de Treinamento (Baseado na folha da fábrica)
  const trainingCost = payrollMOD * (trainingPercent / 100);

  let unitsProduced = Math.floor(effectiveCapacity * activityLevel * trainingPenalty);

  // Produção Extra (Hora Extra) - Custo MOD 50% superior para o excedente
  const extraProductionPercent = sanitize(decision.production?.extraProductionPercent, 0);
  if (extraProductionPercent > 0) {
    const extraUnits = Math.floor(unitsProduced * (extraProductionPercent / 100));
    const extraModCost = (extraUnits / (unitsProduced || 1)) * totalMOD * 1.5;
    unitsProduced += extraUnits;
    // O custo extra é adicionado ao totalMOD para compor o CPP
    // totalMOD += extraModCost; // Não alteramos a variável totalMOD aqui para não duplicar no DFC, mas somamos no CPP
  }
  const extraProductionCost = extraProductionPercent > 0 ? (Math.floor(unitsProduced * (extraProductionPercent / (100 + extraProductionPercent))) / (unitsProduced || 1)) * totalMOD * 0.5 : 0;

  // --- 3.1 GESTÃO DE SUPRIMENTOS E COMPRAS DE EMERGÊNCIA (USER REQUEST) ---
  const purchaseMPA = sanitize(decision.production?.purchaseMPA, 0);
  const purchaseMPB = sanitize(decision.production?.purchaseMPB, 0);
  const supplierPaymentType = sanitize(decision.production?.paymentType, 0); // 0: A Vista, 1: A VISTA + 50%, 2: A VISTA + 33% + 33%
  
  // Fator de Juros do Fornecedor (se não for à vista)
  const supplierInterestRate = sanitize(indicators.supplier_interest, 0) / 100;
  const supplierInterestFactor = supplierPaymentType > 0 ? (1 + supplierInterestRate) : 1.0;

  // Verificação de Necessidade de Compra de Emergência
  const initialMPAStock = team.kpis?.stock_quantities?.mp_a || 0;
  const initialMPBStock = team.kpis?.stock_quantities?.mp_b || 0;
  
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
                                
  const emergencyPurchaseCost = (emergencyMPA * mpaPrice * supplierInterestFactor * specialPremium) + 
                                (emergencyMPB * mpbPrice * supplierInterestFactor * specialPremium);

  const totalPurchaseMP = plannedPurchaseCost + emergencyPurchaseCost;

  // Matéria-Prima Consumida (Com reajuste, juros e ágio se aplicável) - VALOR LÍQUIDO (sem IVA)
  const netEmergencyMpaPrice = netMpaPrice * supplierInterestFactor * specialPremium;
  const netEmergencyMpbPrice = netMpbPrice * supplierInterestFactor * specialPremium;
  const netPlannedMpaPrice = netMpaPrice * supplierInterestFactor;
  const netPlannedMpbPrice = netMpbPrice * supplierInterestFactor;

  // Consumo: Prioriza estoque inicial, depois compra planejada, depois emergência
  const totalUnitsMPA = Math.max(requiredMPA, availableMPA);
  const totalUnitsMPB = Math.max(requiredMPB, availableMPB);
  
  const avgNetMpaPrice = ((initialMPAStock * netMpaPrice) + (purchaseMPA * netPlannedMpaPrice) + (emergencyMPA * netEmergencyMpaPrice)) / (totalUnitsMPA || 1);
  const avgNetMpbPrice = ((initialMPBStock * netMpbPrice) + (purchaseMPB * netPlannedMpbPrice) + (emergencyMPB * netEmergencyMpbPrice)) / (totalUnitsMPB || 1);

  const totalMP = (unitsProduced * 3 * avgNetMpaPrice) + (unitsProduced * 2 * avgNetMpbPrice);

  const supplierInterestExpenses = totalPurchaseMP * (1 - (1 / supplierInterestFactor));
  const emergencyPurchaseExpenses = emergencyPurchaseCost;
  const emergencyUnitsTotal = emergencyMPA + emergencyMPB;

  // Manutenção Industrial (GGF reajustado por inflação)
  const maintenance = capacity * 2.5 * inflationMult; 

  // --- 3.2 COMPOSIÇÃO DO CIF E CPP (USER REQUEST) ---
  // CIF = MOD + Extras + Depreciação + Manutenção + Rescisão (Indenização + PPR Proporcional)
  const totalCIF = totalMOD + extraProductionCost + periodDepreciation + maintenance + custoIndenizacao + pprProporcional;
  
  // TOTAL CPP = MP + CIF
  const totalCPP = totalMP + totalCIF;
  const unitCPP = unitsProduced > 0 ? totalCPP / unitsProduced : 0;

  // --- 4. GESTÃO DE ESTOQUE E CPV (MÉTODO WAC) ---
  const prevStockQty = sanitize(team.kpis?.stock_quantities?.finished_goods, 0);
  const prevStockValue = findAccountValue(prevBS, 'assets.current.stock.pa');
  
  // Novo Valor e Quantidade Total para Média Ponderada
  const totalQtyForSale = prevStockQty + unitsProduced;
  const totalValueInInventory = prevStockValue + totalCPP;
  const wacUnit = totalQtyForSale > 0 ? totalValueInInventory / totalQtyForSale : unitCPP;

  // --- 4. DEMANDA E VENDAS POR REGIÃO ---
  let totalUnitsSold = 0;
  let totalRevenue = 0;
  let totalCashSales = 0;
  let totalCreditSales = 0;
  let totalMarketingExp = 0;
  let weightedPmrSum = 0;

  const regions = Object.entries(decision.regions || {});
  const regionCount = regions.length || 1;
  const baseDemandPerRegion = (capacity * 0.8) / regionCount;

  regions.forEach(([id, reg]: [string, any]) => {
    const regPrice = sanitize(reg.price, 425);
    const regMarketing = sanitize(reg.marketing, 0);
    const regTerm = sanitize(reg.term, 0); // 0: A VISTA, 1: A VISTA + 50%, 2: A VISTA + 33% + 33%

    // Marketing Expense (GGF Comercial)
    totalMarketingExp += regMarketing * indicators.prices.marketing_campaign * (sanitize(indicators.marketing_campaign_adjust, 0) / 100 + 1);

    // Algoritmo de Demanda Regional
    const priceIndex = indicators.avg_selling_price / regPrice;
    const marketingIndex = 1 + (regMarketing * 0.08); // +8% por ponto de marketing
    const termIndex = 1 + (regTerm * 0.05); // +5% por nível de prazo (incentivo comercial)
    
    let regDemand = Math.floor(baseDemandPerRegion * priceIndex * marketingIndex * termIndex * (1 + (indicators.demand_variation / 100)) * rjDemandPenalty);
    
    // Limitar pelo estoque disponível (distribuição simples)
    const regUnitsSold = Math.min(regDemand, Math.floor(totalQtyForSale / regionCount)); 
    totalUnitsSold += regUnitsSold;

    const regRevenue = regUnitsSold * regPrice;
    totalRevenue += regRevenue;

    // Mix de Prazo (User Request: A VISTA; A VISTA + 50%; A VISTA + 33% + 33%)
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

  // Ajuste final se o total vendido ultrapassar o estoque real (segurança)
  if (totalUnitsSold > totalQtyForSale) {
    const ratio = totalQtyForSale / totalUnitsSold;
    totalUnitsSold = totalQtyForSale;
    totalRevenue *= ratio;
    totalCashSales *= ratio;
    totalCreditSales *= ratio;
  }

  // CPV (Custo do Produto Vendido)
  const totalCPV = totalUnitsSold * wacUnit;
  
  // Proporção de MP e CIF no CPV (Baseado no WAC do período)
  const currentCppMpRatio = totalCPP > 0 ? totalMP / totalCPP : 0.6;
  const totalCPV_MP = totalCPV * currentCppMpRatio;
  const totalCPV_CIF = totalCPV * (1 - currentCppMpRatio);

  const closingStockPA = totalQtyForSale - totalUnitsSold;
  const closingStockValuePA = closingStockPA * wacUnit;

  // --- 5. RESULTADOS FINANCEIROS ---
  const revenue = totalRevenue;
  
  // PECLD (Inadimplência) - Apenas sobre vendas a prazo (User Request)
  const defaultRate = (sanitize(indicators.customer_default_rate, 2.5) / 100);
  const badDebtExp = totalCreditSales * defaultRate;

  // Suprimentos (Pagamento a Fornecedores)
  // totalPurchaseMP já calculado acima com juros e ágio
  let cashOutflowSuppliers = totalPurchaseMP;
  let newAccountsPayable = 0;
  
  if (supplierPaymentType === 1) {
    // A VISTA + 50% no próximo período
    cashOutflowSuppliers = totalPurchaseMP * 0.5;
    newAccountsPayable = totalPurchaseMP * 0.5;
  } else if (supplierPaymentType === 2) {
    // Parcelado: à vista + 33% + 33%
    cashOutflowSuppliers = totalPurchaseMP * 0.3333;
    newAccountsPayable = totalPurchaseMP * 0.6667;
  }
  
  // Distribuição e Estocagem
  const distributionCost = totalUnitsSold * indicators.prices.distribution_unit * getAdjust('distribution_cost_adjust', sanitize(indicators.distribution_cost_adjust, 0));
  const currentMPAStock = (team.kpis?.stock_quantities?.mp_a || 0) + purchaseMPA + emergencyMPA - (unitsProduced * 3);
  const currentMPBStock = (team.kpis?.stock_quantities?.mp_b || 0) + purchaseMPB + emergencyMPB - (unitsProduced * 2);
  const storageCost = (closingStockPA * indicators.prices.storage_finished * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0))) + 
                      (Math.max(0, currentMPAStock) * indicators.prices.storage_mp * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0))) + 
                      (Math.max(0, currentMPBStock) * indicators.prices.storage_mp * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0)));

  // OPEX reajustado + Marketing + Inadimplência
  const prevOpexSales = Math.abs(findAccountValue(prevStatements.dre, 'opex.sales') || 873250);
  const prevOpexAdm = Math.abs(findAccountValue(prevStatements.dre, 'opex.adm') || 216000);
  const prevOpexRd = Math.abs(findAccountValue(prevStatements.dre, 'opex.rd') || 41844);

  const currentOpexSales = (prevOpexSales * inflationMult) + totalMarketingExp + distributionCost + storageCost + totalPayrollSales;
  const currentOpexAdm = (prevOpexAdm * inflationMult) + totalPayrollAdm;
  
  // P&D Investimento dinâmico (% da Receita)
  const rdInvestmentPercent = sanitize(decision.production?.rd_investment, 0);
  const currentOpexRd = rdInvestmentPercent > 0 ? (revenue * (rdInvestmentPercent / 100)) : (prevOpexRd * inflationMult);

  const opex = currentOpexSales + currentOpexAdm + currentOpexRd + badDebtExp + trainingCost;
  
  // Juros e Amortização (Diferenciação Normal vs Compulsório vs BDI)
  const prevLoans = (team.kpis?.loans || []) as any[];
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
      amort = loan.amount * 0.1; // 10% padrão
    } else if (loan.type === 'compulsory') {
      amort = loan.amount; // Compulsório paga tudo no round seguinte
      interest = loan.amount * (sanitize(indicators.interest_rate_tr, 2) / 100) + (loan.amount * (sanitize(indicators.compulsory_loan_agio, 3) / 100));
    }

    totalInterestExp += interest;
    totalAmortization += amort;
    
    const remaining = loan.amount - amort;
    if (remaining > 0.01 && loan.remaining_rounds > 1) {
      currentLoans.push({
        ...loan,
        amount: remaining,
        remaining_rounds: loan.remaining_rounds - 1
      });
    }
  });

  // Adicionar Novo Empréstimo BDI se houve compra
  if (newBdiLoanAmount > 0) {
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
  const loanTerm = sanitize(decision.finance?.loanTerm, 0); // 0: 6 rounds, 1: 12 rounds, 2: 24 rounds
  const loanTermsMap = [6, 12, 24];
  const selectedTerm = loanTermsMap[loanTerm] || 12;

  if (loanRequest > 0 && !isRJ) {
    currentLoans.push({
      id: `L-REQ-${Math.random().toString(36).substr(2, 5)}`,
      type: 'normal',
      amount: loanRequest,
      interest_rate: sanitize(indicators.interest_rate_tr, 2) + 2, // 2% de spread para manual
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
  const pprRate = sanitize(decision.hr?.participationPercent, 10) / 100;
  const ppr = lair > 0 ? lair * pprRate : 0;
  const lairAfterPpr = lair - ppr;

  const taxRate = (sanitize(indicators.tax_rate_ir, 25) / 100);
  const taxProv = lairAfterPpr > 0 ? lairAfterPpr * taxRate : 0;
  const netProfit = lairAfterPpr - taxProv;
  
  const dividendPercent = (sanitize(indicators.dividend_percent, 25) / 100);
  const dividends = netProfit > 0 ? netProfit * dividendPercent : 0;
  
  // --- 4.6 MOTIVAÇÃO E CLIMA ORGANIZACIONAL (PPR IMPACT) ---
  // O PPR provisionado (currentPpr) e o salário influenciam a motivação
  const avgMarketSalary = indicators.hr_base.salary * inflationMult;
  const salaryIndex = currentSalary / avgMarketSalary;
  const pprIndex = 1 + (pprRate * 2); // PPR de 10% aumenta motivação em 20%
  const motivation = Math.min(1.2, salaryIndex * pprIndex);

  // Fluxo de Caixa (DFC)
  // Recebimento = Vendas à Vista (Atual) + Recebimento de Clientes (Anterior)
  const cashInflowFromSales = totalCashSales + prevClients;
  
  // Aplicação Financeira (Saída de Caixa)
  const applicationAmount = sanitize(decision.finance?.application, 0);

  // Total Outflows para cálculo de caixa
  // Inclui: Pagamento do PPR anterior (totalPprPayment) + Indenização de demissões (custoIndenizacao) + Dividendos anteriores + IVA anterior
  const totalOutflows = cashOutflowSuppliers + prevSuppliers + totalMOD + totalPayrollAdm + totalPayrollSales + totalPprPayment + custoIndenizacao + extraProductionCost + currentOpexRd + totalMarketingExp + distributionCost + storageCost + maintenance + machinePurchaseOutflow + interestExp + totalAmortization + taxProv + prevDividends + trainingCost + vatPayment + applicationAmount;

  let cashBeforeCompulsory = sanitize(team.kpis?.current_cash, 0) + cashInflowFromSales + machineSalesInflow + loanRequest + totalFinancialRevenue - totalOutflows;
  
  // Liberação Automática de Empréstimo Compulsório (Strategos Core)
  let newCompulsoryLoan = 0;
  if (cashBeforeCompulsory < 0) {
    newCompulsoryLoan = Math.abs(cashBeforeCompulsory);
    cashBeforeCompulsory = 0; // Caixa zerado, coberto pelo compulsório
  }

  const finalCash = cashBeforeCompulsory;

  // --- 6. ATUALIZAÇÃO DA ESTRUTURA CONTÁBIL ---
  let totalLoansST = newCompulsoryLoan;
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
    'assets.current.investments': prevInvestments + applicationAmount,
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
    'equity.profit': findAccountValue(prevBS, 'equity.profit') + netProfit
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
        'cf.inflow.term_sales': prevClients,
        'cf.inflow.machine_sales': machineSalesInflow,
        'cf.inflow.awards': totalAwards,
        'cf.inflow.investment_withdrawal': 0, 
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
        'cf.outflow.suppliers': -(cashOutflowSuppliers + prevSuppliers),
        'cf.outflow.misc': 0, 
        'cf.outflow.machine_buy': -machinePurchaseOutflow,
        'cf.outflow.maintenance': -maintenance,
        'cf.outflow.interest': -interestExp,
        'cf.outflow.amortization': -totalAmortization,
        'cf.outflow.late_penalties': 0, 
        'cf.outflow.taxes': -prevTaxes,
        'cf.outflow.dividends': -prevDividends,
        'cf.investment_apply': -applicationAmount,
        'cf.final': finalCashWithAwards 
      }, true),
      balance_sheet: injectValues(JSON.parse(JSON.stringify(finalBS)), {
        'assets.current.cash': finalCashWithAwards,
        'equity.profit': findAccountValue(prevBS, 'equity.profit') + finalNetProfit
      })
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
      mp_a: (team.kpis?.stock_quantities?.mp_a || 0) + sanitize(decision.production?.purchaseMPA, 0) - (unitsProduced * 3), 
      mp_b: (team.kpis?.stock_quantities?.mp_b || 0) + sanitize(decision.production?.purchaseMPB, 0) - (unitsProduced * 2), 
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
    }
  };

  // 7. CÁLCULO DO E-SDS DETERMINÍSTICO (User Request v1.2)
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
    divida_liquida: result.kpis.divida_liquida
  };

  result.kpis.esds = computeESDSDeterministic(esdsInputs, history, branch);

  return result;
};

/**
 * Calcula KPIs a partir das demonstrações financeiras (v2026-03.11)
 */
export const calculateKpisFromStatements = (params: {
  statements: any;
  prevStatements?: any;
  revenue: number;
  netProfit: number;
  operatingProfit: number;
  totalAwards: number;
  finalCash: number;
  prevEquity: number;
  prevInvestments: number;
  applicationAmount: number;
  totalMachineryCost: number;
  buildingsCost: number;
  totalMachineryDeprec: number;
  newBuildingsDeprecAccum: number;
  unitsProduced: number;
  totalUnitsSold: number;
  closingStockPA: number;
  closingStockValuePA: number;
  unitCPP: number;
  wacUnit: number;
  periodDepreciation: number;
  weightedAvgPrice: number;
  totalRevenue: number;
  prevStockValue: number;
  pmr: number;
  pmp: number;
  indicators: MacroIndicators;
  branch: Branch;
  history: any[];
  supplierInterestExpenses: number;
  emergencyPurchaseExpenses: number;
  emergencyUnitsTotal: number;
  currentMachines: any[];
  currentLoans: any[];
  stockQuantities: any;
}): any => {
  const { statements, prevStatements = {}, revenue, netProfit, operatingProfit, totalAwards, finalCash, prevEquity, prevInvestments, applicationAmount, totalMachineryCost, buildingsCost, totalMachineryDeprec, newBuildingsDeprecAccum, unitsProduced, totalUnitsSold, closingStockPA, closingStockValuePA, unitCPP, wacUnit, periodDepreciation, weightedAvgPrice, totalRevenue, prevStockValue, pmr, pmp, indicators, branch, history, supplierInterestExpenses, emergencyPurchaseExpenses, emergencyUnitsTotal, currentMachines, currentLoans, stockQuantities } = params;
  
  const finalBS = statements.balance_sheet;
  const totalAssets = findAccountValue(finalBS, 'assets');
  const totalEquity = findAccountValue(finalBS, 'equity');
  const currentAssets = findAccountValue(finalBS, 'assets.current');
  const currentLiabilities = findAccountValue(finalBS, 'liabilities.current');
  const totalLiabilities = findAccountValue(finalBS, 'liabilities');

  // TSR (Total Shareholder Return) - Baseado no crescimento do Equity
  const tsr = ((totalEquity - prevEquity) / prevEquity) * 100;

  // Liquidez e Solvência
  const liquidityCurrent = currentLiabilities > 0 ? currentAssets / currentLiabilities : 2;
  const solvencyIndex = totalLiabilities > 0 ? totalAssets / totalLiabilities : 5;

  // NCG (Necessidade de Capital de Giro) - Operacional
  const ncg = (findAccountValue(finalBS, 'assets.current.clients') + closingStockValuePA + findAccountValue(finalBS, 'assets.current.vat_recoverable')) - 
              (findAccountValue(finalBS, 'liabilities.current.suppliers') + findAccountValue(finalBS, 'liabilities.current.taxes') + findAccountValue(finalBS, 'liabilities.current.dividends') + findAccountValue(finalBS, 'liabilities.current.ppr_payable') + findAccountValue(finalBS, 'liabilities.current.vat_payable'));
  
  // Saldo de Tesouraria (ST) - Financeiro
  const st = (finalCash + (prevInvestments + applicationAmount)) - findAccountValue(finalBS, 'liabilities.current.loans_st');
  
  // Efeito Tesoura (Scissors Effect) - Diferença entre NCG e ST em DIAS
  const scissorsEffectValue = ncg - st;
  const dailyRevenue = revenue / 90; 
  const scissorsEffect = dailyRevenue > 0 ? (scissorsEffectValue / dailyRevenue) : 0;
  
  const nlcdg = ncg; 

  // Z-Score de Kanitz (Legado)
  const x1_k = totalEquity > 0 ? netProfit / totalEquity : 0;
  const x2_k = liquidityCurrent;
  const x3_k = currentLiabilities > 0 ? (currentAssets - closingStockValuePA) / currentLiabilities : 1;
  const x4_k = totalAssets > 0 ? currentAssets / totalAssets : 0.5;
  const x5 = totalEquity > 0 ? totalLiabilities / totalEquity : 0.5;
  const kanitz = (0.05 * x1_k) + (1.65 * x2_k) + (3.55 * x3_k) - (1.06 * x4_k) - (0.33 * x5);

  // Altman Z''-Score
  const x1_altman = totalAssets > 0 ? (currentAssets - currentLiabilities) / totalAssets : 0;
  const x2_altman = totalAssets > 0 ? (netProfit) / totalAssets : 0; 
  const x3_altman = totalAssets > 0 ? operatingProfit / totalAssets : 0; 
  const x4_altman = totalLiabilities > 0 ? totalEquity / totalLiabilities : 1;
  const altmanZ = 3.25 + (6.56 * x1_altman) + (3.26 * x2_altman) + (6.72 * x3_altman) + (1.05 * x4_altman);

  // DCF Valuation
  const ebitda = operatingProfit + periodDepreciation;
  const wacc = 0.12; 
  const dcfValuation = ebitda > 0 ? (ebitda / wacc) / 1000000 : 0;

  // Rating de Crédito
  let rating: CreditRating = 'D';
  if (liquidityCurrent > 1.5 && x5 < 0.8) rating = 'AAA';
  else if (liquidityCurrent > 1.2 && x5 < 1.2) rating = 'AA';
  else if (liquidityCurrent > 1.0 && x5 < 1.5) rating = 'A';
  else if (liquidityCurrent > 0.8 && x5 < 2.0) rating = 'B';
  else if (liquidityCurrent > 0.5 && x5 < 3.0) rating = 'C';
  else rating = 'D';

  const ccc = (pmr + (closingStockValuePA > 0 ? (closingStockValuePA / (revenue / 90)) : 0)) - pmp;
  const interestCoverage = Math.abs(findAccountValue(statements.dre, 'fin.exp')) > 0 ? operatingProfit / Math.abs(findAccountValue(statements.dre, 'fin.exp')) : 100;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const assetTurnover = totalAssets > 0 ? revenue / totalAssets : 0;
  const leverage = totalEquity > 0 ? totalAssets / totalEquity : 1;

  return {
    statements,
    current_cash: finalCash,
    commitments: {
      receivables: [
        { id: 'clients', label: 'Contas a Receber (Clientes)', value: findAccountValue(finalBS, 'assets.current.clients') },
        { id: 'investments', label: 'Aplicações Financeiras', value: findAccountValue(finalBS, 'assets.current.investments') },
        { id: 'vat_recoverable', label: 'IVA a Recuperar', value: findAccountValue(finalBS, 'assets.current.vat_recoverable') }
      ],
      payables: [
        { id: 'suppliers', label: 'Fornecedores', value: findAccountValue(finalBS, 'liabilities.current.suppliers') },
        { id: 'loans_st', label: 'Empréstimos (Curto Prazo)', value: findAccountValue(finalBS, 'liabilities.current.loans_st') },
        { id: 'loans_lt', label: 'Empréstimos (Longo Prazo)', value: findAccountValue(finalBS, 'liabilities.longterm.loans_lt') },
        { id: 'taxes', label: 'Imposto de Renda a Pagar', value: findAccountValue(finalBS, 'liabilities.current.taxes') },
        { id: 'dividends', label: 'Dividendos a Pagar', value: findAccountValue(finalBS, 'liabilities.current.dividends') },
        { id: 'ppr', label: 'PPR a Pagar', value: findAccountValue(finalBS, 'liabilities.current.ppr_payable') },
        { id: 'vat_payable', label: 'IVA a Recolher', value: findAccountValue(finalBS, 'liabilities.current.vat_payable') }
      ]
    },
    machines: currentMachines,
    loans: currentLoans,
    stock_quantities: stockQuantities,
    cpp_unit: unitCPP,
    wac_unit: wacUnit,
    ebitda,
    fixed_assets_value: findAccountValue(finalBS, 'assets.noncurrent.fixed'),
    total_assets: totalAssets,
    equity: totalEquity,
    stock_value: closingStockValuePA,
    tsr,
    nlcdg: nlcdg / 1000000,
    solvency_score_kanitz: kanitz,
    altman_z_score: altmanZ,
    dcf_valuation: dcfValuation,
    scissors_effect: scissorsEffect / 1000000,
    liquidity_current: liquidityCurrent,
    solvency_index: solvencyIndex,
    inventory_turnover: (revenue / 4) > 0 ? (revenue / 4 / ((prevStockValue + closingStockValuePA) / 2)) : 0,
    ccc,
    interest_coverage: interestCoverage,
    dupont: {
      margin: netMargin,
      turnover: assetTurnover,
      leverage: leverage
    },
    rating,
    landed_costs: {}, // Placeholder se não houver regionalização
    price_elasticity: 0,
    regional_cac: {},
    carbon_footprint: 0,
    last_price: weightedAvgPrice,
    last_units_sold: totalUnitsSold,
    markup: (wacUnit > 0 && totalUnitsSold > 0) ? ((totalRevenue / totalUnitsSold) / wacUnit) - 1 : 0,
    market_share: 0, 
    share_price: totalEquity / 72000,
    avg_receivable_days: pmr,
    avg_payable_days: pmp,
    compulsory_loan_balance: findAccountValue(finalBS, 'liabilities.current.loans_st'),
    compulsory_loan_interest_paid: Math.abs(findAccountValue(statements.dre, 'fin.exp')),
    fco_livre: ebitda - findAccountValue(statements.cash_flow, 'cf.outflow.maintenance') - Math.abs(findAccountValue(statements.dre, 'fin.exp')) - Math.abs(findAccountValue(statements.dre, 'tax_prov')),
    capex_manutencao: findAccountValue(statements.cash_flow, 'cf.outflow.maintenance'),
    capex_estrategico: findAccountValue(statements.cash_flow, 'cf.outflow.machine_buy'),
    juros_pagos: Math.abs(findAccountValue(statements.dre, 'fin.exp')),
    impostos_pagos: Math.abs(findAccountValue(statements.dre, 'tax_prov')),
    passivo_circulante: currentLiabilities,
    despesas_operacionais_projetadas_proxima_rodada: Math.abs(findAccountValue(statements.dre, 'opex')) * 1.05,
    receita_liquida: revenue,
    custo_medio_divida: totalLiabilities > 0 ? Math.abs(findAccountValue(statements.dre, 'fin.exp')) / totalLiabilities : 0,
    alavancagem_efetiva: (totalLiabilities - finalCash) / Math.max(ebitda, 0.01),
    divida_liquida: totalLiabilities - finalCash,
    receita_recorrente_projetada: branch === 'services' ? revenue * 0.4 : 0,
    caixa: finalCash,
    aplicacoes: findAccountValue(finalBS, 'assets.current.investments'),
    despesas_operacionais_diarias: Math.abs(findAccountValue(statements.dre, 'opex')) / 90,
    passivo_total: totalLiabilities,
    pl: totalEquity,
    percentual_divida_curto_prazo: totalLiabilities > 0 ? (currentLiabilities / totalLiabilities) * 100 : 100,
    brl_rate: indicators.BRL || 1,
    gbp_rate: indicators.GBP || 0,
    export_tariff_brazil: indicators.export_tariff_brazil || 0,
    export_tariff_uk: indicators.export_tariff_uk || 0,
    supplier_interest_expenses: supplierInterestExpenses,
    emergency_purchase_expenses: emergencyPurchaseExpenses,
    emergency_units_total: emergencyUnitsTotal
  };
};

/**
 * Calcula E-SDS v1.2 de forma determinística (sem IA)
 */
export const computeESDSDeterministic = (
  current: any,
  history: any[],
  branch: Branch,
  config: any = {}
): ESDSCalculation => {
  // Helper para extrair valores de KPIs ou CompanyState
  const getVal = (state: any, path: string): number => {
    if (!state) return 0;
    
    // Se for um objeto KPIs (já calculado)
    if (state.fco_livre !== undefined) {
      const kpiMap: Record<string, string> = {
        'fco_livre': 'fco_livre',
        'receita_liquida': 'receita_liquida',
        'ebitda': 'ebitda',
        'caixa': 'caixa',
        'passivo_total': 'passivo_total',
        'pl': 'pl',
        'divida_liquida': 'divida_liquida',
        'passivo_circulante': 'passivo_circulante',
        'despesas_operacionais_diarias': 'despesas_operacionais_diarias',
        'custo_medio_divida': 'custo_medio_divida',
        'alavancagem_efetiva': 'alavancagem_efetiva',
        'percentual_divida_curto_prazo': 'percentual_divida_curto_prazo'
      };
      const key = kpiMap[path] || path;
      if (state[key] !== undefined) return state[key];
    }

    // Se for um CompanyState (árvore financeira)
    const statements = state.statements || {};
    const dre = statements.dre || [];
    const dfc = statements.cash_flow || [];
    const bp = statements.balance_sheet || [];
    const all = [...dre, ...dfc, ...bp];

    const map: Record<string, string> = {
      'fco_livre': 'cf.inflow.cash_sales', // Simplificação se não tiver o campo calculado
      'receita_liquida': 'rev',
      'ebitda': 'ebitda',
      'caixa': 'assets.current.cash',
      'passivo_total': 'liabilities',
      'pl': 'equity',
      'divida_liquida': 'divida_liquida',
      'passivo_circulante': 'liabilities.current',
      'despesas_operacionais_diarias': 'opex.adm'
    };

    const accountId = map[path] || path;
    return Math.abs(findAccountValue(all, accountId));
  };

  const weights = {
    p1: 4.0,
    p2: 3.0,
    p3: 2.0,
    p4: 1.5,
    p5: branch === 'agribusiness' || branch === 'industrial' ? -3.0 : -2.5,
    p6: branch === 'agribusiness' ? -2.0 : branch === 'services' ? -0.8 : -1.2,
  };

  // Pilar 1: Geração de Caixa Operacional Líquida
  const fcoLivre = getVal(current, 'fco_livre');
  const passivoCirc = getVal(current, 'passivo_circulante');
  const opexProj = current.despesas_operacionais_projetadas_proxima_rodada || (getVal(current, 'despesas_operacionais_diarias') * 30 * 1.05);
  const denomP1 = passivoCirc + opexProj;
  const p1 = denomP1 > 0 ? fcoLivre / denomP1 : 0;

  // Pilar 2: Sustentabilidade do Crescimento
  const receitaAtual = getVal(current, 'receita_liquida');
  const historyKpis = history.map(h => h.kpis || h.state || h);
  const receitaList = [receitaAtual, ...historyKpis.map(h => getVal(h, 'receita_liquida'))];
  
  const deltas: number[] = [];
  for (let i = 1; i < Math.min(4, receitaList.length); i++) {
    const recAtual = receitaList[i - 1];
    const recAnt = receitaList[i];
    deltas.push(recAnt !== 0 ? (recAtual - recAnt) / Math.abs(recAnt) : 0);
  }
  const deltaMedia = deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;
  const custoDivida = getVal(current, 'custo_medio_divida') || 0.05;
  const alavancagemEfetiva = getVal(current, 'alavancagem_efetiva') || 1;
  const p2 = deltaMedia / (custoDivida * alavancagemEfetiva + 0.0001);

  // Pilar 3: Margem de Segurança + Recorrência
  const defaultRecurrence: Record<string, number> = {
    'agribusiness': 0.2,
    'services': 0.6,
    'industrial': 0.1
  };
  const recorrencia = config.recorrencia_percent?.[branch] || defaultRecurrence[branch] || 0;
  const ebitda = getVal(current, 'ebitda');
  const p3 = (ebitda + receitaAtual * recorrencia) / Math.max(receitaAtual, 1);

  // Pilar 4: Eficiência de Giro (Dias de Caixa)
  const decayConstant = branch === 'agribusiness' ? 90 : branch === 'services' ? 45 : 60;
  const caixa = getVal(current, 'caixa');
  const opexDiaria = getVal(current, 'despesas_operacionais_diarias') || 1;
  const diasCaixa = caixa / Math.max(opexDiaria, 1);
  const p4 = 10 * (1 - Math.exp(-diasCaixa / decayConstant));

  // Pilar 5: Penalizador de Alavancagem
  const passivoTotal = getVal(current, 'passivo_total');
  const pl = getVal(current, 'pl');
  const alavancagemBruta = passivoTotal / Math.max(pl, 1);
  const percentCurto = (getVal(current, 'percentual_divida_curto_prazo') || 0) / 100;
  let p5 = Math.max(0, alavancagemBruta - 3) * (1 + percentCurto);
  if (pl <= 0) p5 *= 1.5;

  // Pilar 6: Penalizador de Volatilidade
  const fcoList = [fcoLivre, ...historyKpis.map(h => getVal(h, 'fco_livre'))];
  const meanFCO = fcoList.reduce((a, b) => a + b, 0) / fcoList.length || 0.0001;
  const variance = fcoList.reduce((sum, x) => sum + (x - meanFCO) ** 2, 0) / fcoList.length;
  const stdDev = Math.sqrt(variance);
  const cv = Math.abs(meanFCO) > 0.0001 ? stdDev / Math.abs(meanFCO) : (stdDev > 0 ? 10 : 0);
  const volMultiplier = branch === 'agribusiness' ? 0.8 : branch === 'industrial' ? 0.5 : 0.3;
  const p6 = cv * volMultiplier;

  const esds_raw = weights.p1 * p1 + weights.p2 * p2 + weights.p3 * p3 + weights.p4 * p4 - weights.p5 * p5 - weights.p6 * p6;

  let zone: any = 'Verde';
  if (esds_raw >= 8.0) zone = 'Azul';
  else if (esds_raw >= 5.5) zone = 'Verde';
  else if (esds_raw >= 3.0) zone = 'Amarelo';
  else if (esds_raw >= 1.5) zone = 'Laranja';
  else zone = 'Vermelho';

  const dividaLiquida = getVal(current, 'divida_liquida');
  const netDebtToEbitda = ebitda > 0 ? dividaLiquida / ebitda : 10;
  if (netDebtToEbitda > 6.0 && (zone === 'Azul' || zone === 'Verde' || zone === 'Amarelo')) {
    zone = 'Laranja';
  }

  // Drivers didáticos
  const main_drivers: string[] = [];
  if (p1 < 0.5) main_drivers.push('Geração de caixa operacional insuficiente para cobrir obrigações imediatas');
  if (p2 < 0.3) main_drivers.push('Crescimento da receita não compensa o custo de capital empregado');
  if (p4 < 3) main_drivers.push('Reserva de liquidez em níveis críticos');
  if (p5 > 2) main_drivers.push('Estrutura de capital com dependência excessiva de terceiros');

  return {
    esds_raw,
    esds_display: Math.max(0, Math.min(10, esds_raw)),
    zone,
    top_gargalos: [], 
    gargalo_principal: p5 > 2 ? 'Financeiro' : p1 < 0.5 ? 'Operacional' : 'Estratégico',
    main_drivers,
    warnings: [],
    is_estimated: history.length < 2,
    gemini_insights: main_drivers.join('. ') || "Estrutura de solvência equilibrada."
  };
};

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
