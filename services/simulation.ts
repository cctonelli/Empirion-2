
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
const findAccountValue = (nodes: AccountNode[], id: string): number => {
  for (const node of nodes) {
    if (node.id === id) return node.value;
    if (node.children) {
      const val = findAccountValue(node.children, id);
      if (val !== undefined && val !== 0) return val;
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
  team: Team
): ProjectionResult => {
  // 0. RECUPERAR ESTADO ANTERIOR
  const prevStatements = team.kpis?.statements || INITIAL_FINANCIAL_TREE;
  const prevBS = prevStatements.balance_sheet || [];
  
  // --- 1. REAJUSTES TEMPORAIS ESPECÍFICOS ---
  // Inflação geral afeta Manutenção e Despesas Fixas
  const inflationMult = 1 + (sanitize(indicators.inflation_rate, 0) / 100);
  
  // Reajuste de MP é independente da inflação geral (conforme diretriz v18.8)
  const mpaPrice = indicators.prices.mp_a * (1 + (sanitize(indicators.raw_material_a_adjust, 0) / 100));
  const mpbPrice = indicators.prices.mp_b * (1 + (sanitize(indicators.raw_material_b_adjust, 0) / 100));
  
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
      const adjust = model === 'alfa' ? indicators.machine_alpha_price_adjust : 
                     model === 'beta' ? indicators.machine_beta_price_adjust : 
                     indicators.machine_gamma_price_adjust;
      const unitPrice = basePrice * (1 + (sanitize(adjust, 0) / 100));
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
  const prevPprPayable = findAccountValue(prevBS, 'liabilities.current.ppr_payable') || 0;
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

  // Matéria-Prima Consumida (Com reajuste específico de MP A/B e consumo 3:2) - VALOR LÍQUIDO (sem IVA)
  const totalMP = (unitsProduced * 3 * netMpaPrice) + (unitsProduced * 2 * netMpbPrice);

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
    if (regTerm === 1) cashPercent = 0.5;
    if (regTerm === 2) cashPercent = 0.3333;

    totalCashSales += regRevenue * cashPercent;
    totalCreditSales += regRevenue * (1 - cashPercent);
  });

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
  const purchaseMPA = sanitize(decision.production?.purchaseMPA, 0);
  const purchaseMPB = sanitize(decision.production?.purchaseMPB, 0);
  const totalPurchaseMP = (purchaseMPA * mpaPrice) + (purchaseMPB * mpbPrice);
  
  // Tipo de Pagamento Fornecedores (0: A Vista, 1: 30 dias, 2: 60 dias)
  const supplierPaymentType = sanitize(decision.production?.paymentType, 0);
  let cashOutflowSuppliers = totalPurchaseMP;
  let newAccountsPayable = 0;
  
  if (supplierPaymentType > 0) {
    cashOutflowSuppliers = 0; // Paga no round seguinte
    newAccountsPayable = totalPurchaseMP;
  }
  
  const prevSuppliers = findAccountValue(prevBS, 'liabilities.current.suppliers');

  // Distribuição e Estocagem
  const distributionCost = totalUnitsSold * indicators.prices.distribution_unit * (1 + (sanitize(indicators.distribution_cost_adjust, 0) / 100));
  const currentMPAStock = (team.kpis?.stock_quantities?.mp_a || 0) + purchaseMPA - (unitsProduced * 3);
  const currentMPBStock = (team.kpis?.stock_quantities?.mp_b || 0) + purchaseMPB - (unitsProduced * 2);
  const storageCost = (closingStockPA * indicators.prices.storage_finished) + (Math.max(0, currentMPAStock) * indicators.prices.storage_mp) + (Math.max(0, currentMPBStock) * indicators.prices.storage_mp);

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
  const prevInvestments = findAccountValue(prevBS, 'assets.current.investments');
  const investmentReturn = prevInvestments * (sanitize(indicators.investment_return_rate, 1) / 100);
  
  // Receita Financeira de Vendas a Prazo (Juros de Prazo)
  const termInterestRate = sanitize(decision.production?.term_interest_rate, 0) / 100;
  const termInterestRevenue = totalCreditSales * termInterestRate;
  
  const totalFinancialRevenue = investmentReturn + termInterestRevenue;
  
  // --- 4.5 APURAÇÃO DE IVA (GOLD STANDARD v19.0) ---
  const ivaOnSales = revenue * vatSalesRate; // Débito gerado nas vendas
  const ivaRecoverableGenerated = totalPurchaseMP * vatPurchasesRate; // Crédito gerado nas compras

  const prevVatRecoverable = findAccountValue(prevBS, 'assets.current.vat_recoverable');
  const prevVatPayable = findAccountValue(prevBS, 'liabilities.current.vat_payable');

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
  
  // Pagamento de Dividendos do período anterior (USER REQUEST)
  const prevDividends = findAccountValue(prevBS, 'liabilities.current.dividends') || 0;

  // --- 4.6 MOTIVAÇÃO E CLIMA ORGANIZACIONAL (PPR IMPACT) ---
  // O PPR provisionado (currentPpr) e o salário influenciam a motivação
  const avgMarketSalary = indicators.hr_base.salary * inflationMult;
  const salaryIndex = currentSalary / avgMarketSalary;
  const pprIndex = 1 + (pprRate * 2); // PPR de 10% aumenta motivação em 20%
  const motivation = Math.min(1.2, salaryIndex * pprIndex);

  // Fluxo de Caixa (DFC)
  // Recebimento = Vendas à Vista (Atual) + Recebimento de Clientes (Anterior)
  const prevClients = findAccountValue(prevBS, 'assets.current.clients');
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

  const closingMpaQty = (team.kpis?.stock_quantities?.mp_a || 0) + purchaseMPA - (unitsProduced * 3);
  const closingMpbQty = (team.kpis?.stock_quantities?.mp_b || 0) + purchaseMPB - (unitsProduced * 2);
  const closingMpaValue = Math.max(0, closingMpaQty) * netMpaPrice;
  const closingMpbValue = Math.max(0, closingMpbQty) * netMpbPrice;

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

  // --- 7. CÁLCULO DE MÉTRICAS AVANÇADAS (ESTRATÉGICAS) ---
  const totalAssets = findAccountValue(finalBS, 'assets');
  const totalEquity = findAccountValue(finalBS, 'equity');
  const currentAssets = findAccountValue(finalBS, 'assets.current');
  const currentLiabilities = findAccountValue(finalBS, 'liabilities.current');
  const totalLiabilities = findAccountValue(finalBS, 'liabilities');
  
  // TSR (Total Shareholder Return) - Baseado no crescimento do Equity
  const prevEquity = team.equity || 7252171;
  const tsr = ((totalEquity - prevEquity) / prevEquity) * 100;

  // Liquidez e Solvência
  const liquidityCurrent = currentLiabilities > 0 ? currentAssets / currentLiabilities : 2;
  const solvencyIndex = totalLiabilities > 0 ? totalAssets / totalLiabilities : 5;

  // NLCDG (Necessidade Líquida de Capital de Giro)
  const accountsReceivable = totalCreditSales; 
  const inventoryValue = closingStockValuePA;
  const accountsPayable = (totalMP + maintenance) * 0.4; // Estimativa: 40% dos custos a prazo
  const nlcdg = (accountsReceivable + inventoryValue) - accountsPayable;

  // Efeito Tesoura (Scissors Effect)
  const treasuryBalance = finalCashWithAwards;
  const scissorsEffect = nlcdg - treasuryBalance;

  // Z-Score de Kanitz (Legado)
  const x1_k = totalEquity > 0 ? finalNetProfit / totalEquity : 0;
  const x2_k = liquidityCurrent;
  const x3_k = currentLiabilities > 0 ? (currentAssets - inventoryValue) / currentLiabilities : 1;
  const x4_k = totalAssets > 0 ? currentAssets / totalAssets : 0.5;
  const x5 = totalEquity > 0 ? totalLiabilities / totalEquity : 0.5;
  const kanitz = (0.05 * x1_k) + (1.65 * x2_k) + (3.55 * x3_k) - (1.06 * x4_k) - (0.33 * x5);

  // Altman Z''-Score (Emerging Markets / Private Firms)
  // Z'' = 3.25 + 6.56X1 + 3.26X2 + 6.72X3 + 1.05X4
  const x1_altman = totalAssets > 0 ? (currentAssets - currentLiabilities) / totalAssets : 0;
  const x2_altman = totalAssets > 0 ? (finalNetProfit) / totalAssets : 0; // Lucros Retidos (Proxy: Lucro do Período)
  const x3_altman = totalAssets > 0 ? operatingProfit / totalAssets : 0; // EBIT
  const x4_altman = totalLiabilities > 0 ? totalEquity / totalLiabilities : 1;
  const altmanZ = 3.25 + (6.56 * x1_altman) + (3.26 * x2_altman) + (6.72 * x3_altman) + (1.05 * x4_altman);

  // DCF Valuation (Fluxo de Caixa Descontado - Perpetuidade Simplificada)
  const ebitda = operatingProfit + periodDepreciation;
  const wacc = 0.12; // Taxa de desconto padrão 12%
  const dcfValuation = ebitda > 0 ? (ebitda / wacc) / 1000000 : 0; // Em milhões

  // Rating de Crédito Dinâmico (Alinhado com restrição SQL: AAA, AA, A, B, C, D)
  let rating: CreditRating = 'D';
  if (liquidityCurrent > 1.5 && x5 < 0.8) rating = 'AAA';
  else if (liquidityCurrent > 1.2 && x5 < 1.2) rating = 'AA';
  else if (liquidityCurrent > 1.0 && x5 < 1.5) rating = 'A';
  else if (liquidityCurrent > 0.8 && x5 < 2.0) rating = 'B';
  else if (liquidityCurrent > 0.5 && x5 < 3.0) rating = 'C';
  else rating = 'D';

  // Atualizar Balanço com valores finais
  const finalBSWithAwards = injectValues(JSON.parse(JSON.stringify(finalBS)), {
    'assets.current.cash': finalCashWithAwards,
    'equity.profit': findAccountValue(prevBS, 'equity.profit') + finalNetProfit
  });

  const netMargin = revenue > 0 ? finalNetProfit / revenue : 0;
  const assetTurnover = totalAssets > 0 ? revenue / totalAssets : 0;
  const leverage = totalEquity > 0 ? totalAssets / totalEquity : 1;

  // Ciclo de Conversão de Caixa (Simplificado para Projeção)
  const pmr = 30; // Prazo médio de recebimento padrão
  const pme = totalCPV > 0 ? (closingStockValuePA / totalCPV) * 90 : 0;
  const pmp = 45; // Prazo médio de pagamento padrão
  const ccc = pme + pmr - pmp;

  // Cobertura de Juros
  const finExp = Math.abs(findAccountValue(prevStatements.dre, 'fin.exp') || 2500);
  const interestCoverage = finExp > 0 ? operatingProfit / finExp : 100;

  const weightedAvgPrice = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : indicators.avg_selling_price;
  const priceIndex = indicators.avg_selling_price / weightedAvgPrice;

  // Elasticidade-Preço (Comparativo com round anterior)
  const prevPrice = team.kpis?.last_price || indicators.avg_selling_price;
  const priceChange = (weightedAvgPrice - prevPrice) / prevPrice;
  const demandChange = (totalUnitsSold - (team.kpis?.last_units_sold || totalUnitsSold)) / (team.kpis?.last_units_sold || totalUnitsSold || 1);
  const priceElasticity = priceChange !== 0 ? Math.abs(demandChange / priceChange) : 1;

  // Landed Cost e CAC Regional
  const regionalCac: Record<number, number> = {};
  const landedCosts: Record<number, number> = {};
  
  Object.entries(decision.regions || {}).forEach(([id, reg]: [string, any]) => {
    const regId = Number(id);
    const regUnits = totalUnitsSold / (Object.keys(decision.regions || {}).length || 1); 
    regionalCac[regId] = regUnits > 0 ? sanitize(reg.marketing, 0) / regUnits : 0;
    landedCosts[regId] = unitCPP + (regionalCac[regId] * 1.2); // Adiciona margem de logística/tarifas
  });

  // Pegada de Carbono (0.8kg CO2 por unidade + logística)
  const carbonFootprint = (unitsProduced * 0.8) + (totalUnitsSold * 0.2);

  // Cálculo de Market Share Projetado (Sensibilidade a Preço e Marketing)
  const marketingInvestment = sanitize(Object.values(decision.regions || {})[0]?.marketing, 0);
  const marketingIndex = 1 + (Math.log10(marketingInvestment + 1) / 10); // Escala logarítmica para marketing
  const projectedMarketShare = Math.min(40, 12.5 * priceIndex * marketingIndex * (1 + (indicators.demand_variation / 100)));

  return {
    revenue, netProfit: finalNetProfit, debtRatio: x5, creditRating: rating,
    health: { cash: finalCashWithAwards, rating: rating },
    marketShare: projectedMarketShare,
    kpis: {
      ...team.kpis,
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
          'cf.inflow.investment_withdrawal': 0, // Placeholder se não houver decisão explícita
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
          'cf.outflow.misc': 0, // Placeholder
          'cf.outflow.machine_buy': -machinePurchaseOutflow,
          'cf.outflow.maintenance': -maintenance,
          'cf.outflow.interest': -interestExp,
          'cf.outflow.amortization': -totalAmortization,
          'cf.outflow.late_penalties': 0, // Placeholder
          'cf.outflow.taxes': -taxProv,
          'cf.outflow.dividends': -prevDividends,
          'cf.investment_apply': -applicationAmount,
          'cf.final': finalCashWithAwards 
        }, true),
        balance_sheet: finalBSWithAwards
      },
      current_cash: finalCashWithAwards,
      machines: currentMachines,
      loans: currentLoans,
      stock_quantities: { 
        mp_a: (team.kpis?.stock_quantities?.mp_a || 0) + sanitize(decision.production?.purchaseMPA, 0) - (unitsProduced * 3), 
        mp_b: (team.kpis?.stock_quantities?.mp_b || 0) + sanitize(decision.production?.purchaseMPB, 0) - (unitsProduced * 2), 
        finished_goods: closingStockPA 
      },
      cpp_unit: unitCPP,
      wac_unit: wacUnit,
      ebitda: operatingProfit + periodDepreciation,
      fixed_assets_value: totalMachineryCost + buildingsCost + 1200000 - totalMachineryDeprec - newBuildingsDeprecAccum,
      
      // Novos KPIs Estratégicos
      total_assets: totalAssets,
      equity: totalEquity,
      stock_value: closingStockValuePA,
      tsr,
      nlcdg: nlcdg / 1000000, // Em milhões para o dashboard
      solvency_score_kanitz: kanitz,
      altman_z_score: altmanZ,
      dcf_valuation: dcfValuation,
      scissors_effect: scissorsEffect / 1000000, // Em milhões
      liquidity_current: liquidityCurrent,
      solvency_index: solvencyIndex,
      inventory_turnover: totalCPV > 0 ? (totalCPV / ((prevStockValue + closingStockValuePA) / 2)) : 0,
      ccc,
      interest_coverage: interestCoverage,
      dupont: {
        margin: netMargin,
        turnover: assetTurnover,
        leverage: leverage
      },
      landed_costs: landedCosts,
      price_elasticity: priceElasticity,
      regional_cac: regionalCac,
      carbon_footprint: carbonFootprint,
      last_price: weightedAvgPrice,
      last_units_sold: totalUnitsSold,
      markup: (wacUnit > 0 && totalUnitsSold > 0) ? ((totalRevenue / totalUnitsSold) / wacUnit) - 1 : 0,
      market_share: projectedMarketShare, 
      share_price: totalEquity / 72000,
      avg_receivable_days: pmr,
      avg_payable_days: pmp,
      
      // KPIs de Empréstimo Compulsório
      compulsory_loan_balance: newCompulsoryLoan,
      compulsory_loan_interest_paid: interestExp,

      // E-SDS v1.2 Inputs
      fco_livre: (operatingProfit + periodDepreciation) - maintenance - interestExp - taxProv,
      capex_manutencao: maintenance,
      capex_estrategico: machinePurchaseOutflow,
      juros_pagos: interestExp,
      impostos_pagos: taxProv,
      passivo_circulante: currentLiabilities,
      despesas_operacionais_projetadas_proxima_rodada: opex * 1.05, // Projeção conservadora
      receita_liquida: revenue,
      custo_medio_divida: totalLiabilities > 0 ? interestExp / totalLiabilities : 0,
      alavancagem_efetiva: (totalLiabilities - finalCashWithAwards) / Math.max(operatingProfit + periodDepreciation, 0.01),
      divida_liquida: totalLiabilities - finalCashWithAwards,
      receita_recorrente_projetada: branch === 'services' ? revenue * 0.4 : 0,
      caixa: finalCashWithAwards,
      aplicacoes: 0, 
      despesas_operacionais_diarias: opex / 30,
      passivo_total: totalLiabilities,
      pl: totalEquity,
      percentual_divida_curto_prazo: totalLiabilities > 0 ? (currentLiabilities / totalLiabilities) * 100 : 100,

      // Indicadores de Moeda e Tarifas (v18.8)
      brl_rate: indicators.BRL || 1,
      gbp_rate: indicators.GBP || 0,
      export_tariff_brazil: indicators.export_tariff_brazil || 0,
      export_tariff_uk: indicators.export_tariff_uk || 0
    }
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
    .limit(5); // margem para deltas e volatilidade

  if (error || !rounds?.length) throw new Error('Dados insuficientes para cálculo E-SDS');

  const sorted = rounds.sort((a, b) => b.round - a.round);
  const current: CompanyState = sorted[0].state;
  const prevStates = sorted.slice(1).map(r => r.state as CompanyState);
  const allStates = [current, ...prevStates];

  // 2. Config do campeonato
  const { data: champ } = await supabase
    .from('championships')
    .select('config')
    .eq('id', current.championship_id)
    .single();

  const config = (champ?.config as ChampionshipConfig) || {};
  const branch = config.branch || 'industrial';

  // Pesos dinâmicos
  const weights = {
    p1: 4.0,
    p2: 3.0,
    p3: 2.0,
    p4: 1.5,
    p5: branch === 'agribusiness' || branch === 'industrial' ? -3.0 : -2.5,
    p6: branch === 'agribusiness' ? -2.0 : branch === 'services' ? -0.8 : -1.2,
  };

  // 3. Função auxiliar segura de extração que entende a árvore financeira
  const getVal = (state: CompanyState, path: string): number => {
    // Se o path for direto no objeto state
    const parts = path.split('.');
    let val: any = state;
    for (const part of parts) {
      if (val && val[part] !== undefined) {
        val = val[part];
      } else {
        val = undefined;
        break;
      }
    }
    if (typeof val === 'number') return val;

    // Se não encontrou, tenta buscar nas árvores financeiras (DRE, DFC, BP)
    const statements = state.statements || {};
    const dre = statements.dre || [];
    const dfc = statements.cash_flow || [];
    const bp = statements.balance_sheet || [];

    // Mapeamento de paths simplificados para IDs da árvore
    const map: Record<string, string> = {
      'balance_sheet.patrimonio_liquido': 'equity',
      'balance_sheet.ativo_total': 'assets',
      'dre.receita_liquida': 'rev',
      'cash_flow.operational_cash_flow': 'cf.inflow.cash_sales',
      'financials.juros_totais': 'fin.exp',
      'liabilities.divida_media': 'liabilities',
      'dre.ebitda': 'ebitda',
      'assets.caixa_aplicacoes': 'assets.current.cash',
      'opex.diaria': 'opex.adm',
      'liabilities.total': 'liabilities',
      'liabilities.curto_prazo': 'liabilities.current',
      'liabilities.divida_liquida': 'divida_liquida',
      'liabilities.divida_total': 'liabilities'
    };

    const accountId = map[path] || path;
    return Math.abs(findAccountValue([...dre, ...dfc, ...bp], accountId));
  };

  // Variáveis extraídas (com defaults seguros)
  const pl = getVal(current, 'balance_sheet.patrimonio_liquido');
  const ativoTotal = getVal(current, 'balance_sheet.ativo_total') || 1;
  const receitaList = allStates.map(s => getVal(s, 'dre.receita_liquida'));
  const fcoList = allStates.map(s => getVal(s, 'cash_flow.operational_cash_flow'));
  const jurosTotais = getVal(current, 'financials.juros_totais');
  const dividaMedia = getVal(current, 'liabilities.divida_media') || 1;
  const ebitda = getVal(current, 'dre.ebitda') || 0.01;
  const caixaAplic = getVal(current, 'assets.caixa_aplicacoes');
  const opexDiaria = (getVal(current, 'opex.adm') + getVal(current, 'opex.sales')) / 30 || 1;
  const passivoTotal = getVal(current, 'liabilities.total') || 1;
  const dividaCurto = getVal(current, 'liabilities.curto_prazo');
  const percentCurto = dividaCurto / Math.max(passivoTotal, 1);

  let isEstimated = false;
  const warnings: string[] = [];

  // Flags de estimativa
  const defaultRecurrence: Record<string, number> = {
    'agribusiness': 0.2,
    'services': 0.6,
    'industrial': 0.1
  };
  const recorrenciaConfigurada = !!config.recorrencia_percent?.[branch];
  const recorrencia = recorrenciaConfigurada 
    ? config.recorrencia_percent![branch] 
    : (defaultRecurrence[branch] || 0);

  if (!recorrenciaConfigurada) {
    isEstimated = true;
    warnings.push(`Recorrência estimada em ${Math.round(recorrencia * 100)}% (configuração ausente no campeonato)`);
  }

  // 4. Pilares com média móvel onde aplicável
  const n = Math.min(3, allStates.length);

  // Pilar 1: FCO Livre (nuance CapEx estratégico)
  const p1_values = allStates.slice(0, n).map(state => {
    const fco = getVal(state, 'cash_flow.operational_cash_flow');
    const capexTotal = getVal(state, 'investments.total_capex') || 0;
    const isEstrategico = !!state.decisions?.capex_strategic_approved;
    const capexManut = isEstrategico ? capexTotal * 0.3 : capexTotal; // 70% manut se não estratégico
    const fcoLivre = fco - capexManut - getVal(state, 'financials.juros_pagos') - getVal(state, 'taxes.paid');
    const denom = getVal(state, 'liabilities.current') + getVal(state, 'opex.projected_next_round');
    return denom > 0 ? fcoLivre / denom : 0;
  });
  const p1_avg = p1_values.reduce((a, b) => a + b, 0) / p1_values.length;

  // Pilar 2: Sustentabilidade Crescimento Alavancado (média delta 3 rodadas)
  const deltas: number[] = [];
  const n_p2 = Math.min(4, receitaList.length); // Precisamos de n+1 para n deltas
  for (let i = 1; i < n_p2; i++) {
    const recAtual = receitaList[i - 1];
    const recAnt = receitaList[i];
    deltas.push(recAnt !== 0 ? (recAtual - recAnt) / Math.abs(recAnt) : 0);
  }
  const deltaMedia = deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;

  const custoDivida = jurosTotais / Math.max(dividaMedia, 1);
  const alavancagemEfetiva =
    pl > 0
      ? getVal(current, 'liabilities.divida_liquida') / Math.max(ebitda, 0.01)
      : getVal(current, 'liabilities.divida_total') / Math.max(pl, 0.01 * ativoTotal);

  const p2 = deltaMedia / (custoDivida * alavancagemEfetiva + 0.0001);
  const p2_avg = p2;

  if (pl <= 0) {
    isEstimated = true;
    warnings.push('Fallback aplicado em alavancagem devido a PL ≤ 0');
  }

  // Pilar 3: Margem + Recorrência
  const p3 = (ebitda + receitaList[0] * recorrencia) / Math.max(receitaList[0], 1);
  const p3_avg = p3;

  // Pilar 4: Dias de Caixa (Decaimento setorial)
  const decayConstant = branch === 'agribusiness' ? 90 : branch === 'services' ? 45 : 60;
  const diasCaixa = caixaAplic / Math.max(opexDiaria, 1);
  const p4_avg = 10 * (1 - Math.exp(-diasCaixa / decayConstant));

  // Pilar 5: Alavancagem Excessiva
  const alavancagemBruta = passivoTotal / Math.max(pl, 1);
  let p5 = Math.max(0, alavancagemBruta - 3) * (1 + percentCurto);
  if (pl <= 0) p5 *= 1.5;
  const p5_avg = p5;

  // Pilar 6: Volatilidade (Calibragem setorial)
  const meanFCO = fcoList.reduce((a, b) => a + b, 0) / fcoList.length || 0.0001;
  const variance = fcoList.reduce((sum, x) => sum + (x - meanFCO) ** 2, 0) / fcoList.length;
  const stdDev = Math.sqrt(variance);
  const cv = meanFCO > 0.0001 ? stdDev / meanFCO : stdDev > 0 ? 10 : 0;
  const volMultiplier = branch === 'agribusiness' ? 0.8 : branch === 'industrial' ? 0.5 : 0.3;
  const p6_avg = cv * volMultiplier;

  // 5. Score bruto
  const esds_raw =
    weights.p1 * p1_avg +
    weights.p2 * p2_avg +
    weights.p3 * p3_avg +
    weights.p4 * p4_avg -
    weights.p5 * p5_avg -
    weights.p6 * p6_avg;

  // Threshold hard
  if (p5_avg > 6) {
    warnings.push('Alavancagem extrema detectada');
  }

  // 6. Zona
  const zone =
    esds_raw >= 8.0 ? 'Azul' :
    esds_raw >= 5.5 ? 'Verde' :
    esds_raw >= 3.0 ? 'Amarelo' :
    esds_raw >= 1.5 ? 'Laranja' : 'Vermelho';

  // 7. Gargalos baseados em contribuição negativa direta
  const pillars = [
    { name: 'Insuficiência de Caixa Operacional', contribution: weights.p1 * p1_avg },
    { name: 'Crescimento não sustenta custo da dívida', contribution: weights.p2 * p2_avg },
    { name: 'Margem/Recorrência Fraca', contribution: weights.p3 * p3_avg },
    { name: 'Buffer de Caixa Insuficiente', contribution: weights.p4 * p4_avg },
    { name: 'Estrutura de Capital Sobrecarregada', contribution: weights.p5 * p5_avg },
    { name: 'Instabilidade Crônica de Fluxo', contribution: weights.p6 * p6_avg },
  ];

  const negative = pillars.filter(p => p.contribution < 0);
  const totalNegativeImpact = negative.reduce((sum, p) => sum + Math.abs(p.contribution), 0) || 1;

  const top_gargalos = negative
    .map(p => ({
      name: p.name,
      impact: Math.abs(p.contribution),
      percentage: Math.round((Math.abs(p.contribution) / totalNegativeImpact) * 100),
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);

  const gargalo_principal = top_gargalos[0]?.name || 'Nenhum gargalo dominante';

  // 8. Drivers equilibrados (positivos + negativos)
  const main_drivers: string[] = [];

  // Negativos
  if (p1_avg < 1.0) main_drivers.push('Caixa operacional insuficiente – priorize redução de custos ou aceleração de recebíveis');
  if (p2_avg < 0.5) main_drivers.push('Crescimento não cobre o custo da dívida – revise investimentos ou renegocie financiamentos');
  if (p3_avg < 0.25) main_drivers.push('Margem e recorrência baixas – busque contratos de longo prazo ou fidelização');
  if (p4_avg < 5) main_drivers.push('Buffer de caixa crítico – acumule reservas com urgência');
  if (p5_avg > 3) main_drivers.push('Alavancagem excessiva – reduza dependência de terceiros');
  if (p6_avg > 0.8) main_drivers.push('Fluxo volátil – estabilize com planejamento sazonal ou hedges');

  // Positivos
  if (p1_avg > 1.5) main_drivers.push('Caixa operacional forte – excelente cobertura de curto prazo');
  if (p2_avg > 1.2) main_drivers.push('Crescimento sustentável em relação ao custo da dívida');
  if (p3_avg > 0.35) main_drivers.push('Margem e recorrência sólidas – base previsível');
  if (p4_avg > 8) main_drivers.push('Buffer de caixa robusto – alta resiliência');
  if (p5_avg < 1.5) main_drivers.push('Alavancagem controlada – estrutura saudável');
  if (p6_avg < 0.5) main_drivers.push('Fluxo de caixa estável – boa gestão operacional');

  // 9. Warnings adicionais
  if (pl <= 0) warnings.push('Equity wipeout – patrimônio líquido negativo');
  if (p5_avg > 6) warnings.push('Alavancagem extrema – risco crítico de inadimplência');
  if (p6_avg > 1.0) warnings.push('Volatilidade crítica de caixa – mesmo com média positiva');
  if (!!current.decisions?.capex_strategic_approved && p1_avg < 0.5) {
    warnings.push('FCO negativo majoritariamente por investimento estratégico aprovado');
  }

  // 10. Retorno final
  const result: ESDSCalculation = {
    esds_raw,
    esds_display: Math.max(0, Math.min(10, esds_raw)),
    zone,
    top_gargalos,
    gargalo_principal,
    main_drivers,
    warnings,
    is_estimated: isEstimated,
    gemini_insights: main_drivers.join('. ')
  };

  esdsCache.set(cacheKey, result);
  return result;
}
