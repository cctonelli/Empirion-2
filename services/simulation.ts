
import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, CreditRating, KPIs, MachineInstance, AccountNode, MachineModel } from '../types';
import { INITIAL_FINANCIAL_TREE } from '../constants';

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
const injectValues = (tree: AccountNode[], values: Record<string, number>): AccountNode[] => {
  return tree.map(node => {
    let newVal = values[node.id] !== undefined ? values[node.id] : node.value;
    let newChildren = node.children ? injectValues(node.children, values) : undefined;
    
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
  // Inflação geral afeta Salários, Manutenção e Despesas Fixas
  const inflationMult = 1 + (sanitize(indicators.inflation_rate, 0) / 100);
  
  // Reajuste de MP é independente da inflação geral (conforme diretriz v18.8)
  const mpaPrice = indicators.prices.mp_a * (1 + (sanitize(indicators.raw_material_a_adjust, 0) / 100));
  const mpbPrice = indicators.prices.mp_b * (1 + (sanitize(indicators.raw_material_b_adjust, 0) / 100));
  
  const currentSalary = indicators.hr_base.salary * inflationMult;
  const socialChargesAttr = 1 + (sanitize(indicators.social_charges, 35) / 100);

  // --- 2. GESTÃO DE ATIVOS E DEPRECIAÇÃO (ABSORÇÃO) ---
  let currentMachines: MachineInstance[] = [...(team.kpis?.machines || [])];
  let periodDepreciation = 0;
  let machineSalesInflow = 0;
  let machineSalesLoss = 0;
  let machinePurchaseOutflow = 0;
  let newLoansST = 0;
  let newLoansLT = 0;

  // A. PROCESSAR VENDAS (SELL_IDS)
  const sellIds = decision.machinery?.sell_ids || [];
  if (sellIds.length > 0) {
    currentMachines = currentMachines.filter(m => {
      if (sellIds.includes(m.id)) {
        const spec = indicators.machine_specs[m.model];
        // Depreciação do período para a máquina vendida (pro-rata)
        const depVal = m.acquisition_value / (spec?.useful_life_years || 40);
        const bookValue = Math.max(0, m.acquisition_value - (m.accumulated_depreciation + depVal));
        
        // Venda por 80% do valor contábil (exemplo de perda estratégica)
        const salePrice = bookValue * 0.8; 
        machineSalesInflow += salePrice;
        machineSalesLoss += (bookValue - salePrice);
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
      
      machinePurchaseOutflow += totalCost;
      // Financiamento padrão: 20% Curto Prazo, 80% Longo Prazo
      newLoansST += totalCost * 0.2;
      newLoansLT += totalCost * 0.8;

      for (let i = 0; i < qty; i++) {
        currentMachines.push({
          id: `M-${Math.random().toString(36).substr(2, 9)}`,
          model: model as MachineModel,
          age: 0,
          acquisition_value: unitPrice,
          accumulated_depreciation: 0
        });
      }
    }
  });

  // C. ATUALIZAR IDADE E DEPRECIAÇÃO DAS MÁQUINAS QUE FICARAM
  currentMachines = currentMachines.map(m => {
    const spec = indicators.machine_specs[m.model];
    const depVal = m.acquisition_value / (spec?.useful_life_years || 40);
    periodDepreciation += depVal;
    return { ...m, age: m.age + 1, accumulated_depreciation: m.accumulated_depreciation + depVal };
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
  const unitsProduced = Math.floor(capacity * activityLevel);

  // Mão de Obra Direta (MOD) reajustada por inflação
  const operatorsRequired = currentMachines.reduce((acc, m) => acc + (indicators.machine_specs[m.model]?.operators_required || 0), 0);
  const totalMOD = (operatorsRequired * currentSalary * socialChargesAttr) * activityLevel;

  // Matéria-Prima Consumida (Com reajuste específico de MP A/B e consumo 3:2)
  const totalMP = (unitsProduced * 3 * mpaPrice) + (unitsProduced * 2 * mpbPrice);

  // Manutenção Industrial (GGF reajustado por inflação)
  const maintenance = capacity * 2.5 * inflationMult; 

  // TOTAL CPP = MP (Reajuste Específico) + MOD (Inflação) + Depreciação (Histórica) + Manutenção (Inflação)
  const totalCPP = totalMP + totalMOD + periodDepreciation + maintenance;
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
    
    let regDemand = Math.floor(baseDemandPerRegion * priceIndex * marketingIndex * termIndex * (1 + (indicators.demand_variation / 100)));
    
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
  const closingStockPA = totalQtyForSale - totalUnitsSold;
  const closingStockValuePA = closingStockPA * wacUnit;

  // --- 5. RESULTADOS FINANCEIROS ---
  const revenue = totalRevenue;
  
  // PECLD (Inadimplência) - Apenas sobre vendas a prazo (User Request)
  const defaultRate = (sanitize(indicators.customer_default_rate, 2.5) / 100);
  const badDebtExp = totalCreditSales * defaultRate;

  // OPEX reajustado + Marketing + Inadimplência
  const prevOpexSales = Math.abs(findAccountValue(prevStatements.dre, 'opex.sales') || 873250);
  const prevOpexAdm = Math.abs(findAccountValue(prevStatements.dre, 'opex.adm') || 216000);
  const prevOpexRd = Math.abs(findAccountValue(prevStatements.dre, 'opex.rd') || 41844);

  const currentOpexSales = (prevOpexSales * inflationMult) + totalMarketingExp;
  const currentOpexAdm = prevOpexAdm * inflationMult;
  const currentOpexRd = prevOpexRd * inflationMult;

  const opex = currentOpexSales + currentOpexAdm + currentOpexRd + badDebtExp;
  
  // Juros e Amortização (Diferenciação Normal vs Compulsório)
  const prevLoansST = findAccountValue(prevBS, 'liabilities.current.loans_st');
  const prevCashFlow = team.kpis?.statements?.cash_flow || [];
  const prevCompulsoryLoan = findAccountValue(prevCashFlow, 'cf.inflow.compulsory');
  const prevNormalLoans = Math.max(0, prevLoansST - prevCompulsoryLoan);

  // Custos do Empréstimo Compulsório (Sempre pago no round seguinte)
  const compulsoryInterest = prevCompulsoryLoan * (sanitize(indicators.interest_rate_tr, 2) / 100);
  const compulsoryAgio = prevCompulsoryLoan * (sanitize(indicators.compulsory_loan_agio, 3) / 100);
  const totalCompulsoryCost = compulsoryInterest + compulsoryAgio;
  const compulsoryRepayment = prevCompulsoryLoan;

  // Custos de Empréstimos Normais
  const normalInterest = (prevNormalLoans + newLoansST) * (sanitize(indicators.interest_rate_tr, 2) / 100);
  const normalAmortization = prevNormalLoans * 0.1; // Amortiza 10% do saldo normal anterior

  const interestExp = normalInterest + totalCompulsoryCost;
  const totalAmortization = normalAmortization + compulsoryRepayment;

  const operatingProfit = revenue - totalCPV - opex;
  const lair = operatingProfit - interestExp - machineSalesLoss;
  const netProfit = lair > 0 ? lair * (1 - (sanitize(indicators.tax_rate_ir, 25) / 100)) : lair; 
  
  // Fluxo de Caixa (DFC)
  // Recebimento = Vendas à Vista (Atual) + Recebimento de Clientes (Anterior)
  const prevClients = findAccountValue(prevBS, 'assets.current.clients');
  const cashInflowFromSales = totalCashSales + prevClients;

  let cashBeforeCompulsory = sanitize(team.kpis?.current_cash, 0) + cashInflowFromSales - totalCPV - opex + machineSalesInflow - machinePurchaseOutflow - interestExp - totalAmortization;
  
  // Liberação Automática de Empréstimo Compulsório (Strategos Core)
  let newCompulsoryLoan = 0;
  if (cashBeforeCompulsory < 0) {
    newCompulsoryLoan = Math.abs(cashBeforeCompulsory);
    cashBeforeCompulsory = 0; // Caixa zerado, coberto pelo compulsório
  }

  const finalCash = cashBeforeCompulsory;

  // --- 6. ATUALIZAÇÃO DA ESTRUTURA CONTÁBIL ---
  const bsValues = {
    'assets.current.cash': finalCash,
    'assets.current.stock.pa': closingStockValuePA,
    'assets.current.clients': totalCreditSales,
    'assets.current.pecld': -badDebtExp,
    'assets.noncurrent.fixed.machines': totalMachineryCost,
    'assets.noncurrent.fixed.machines_deprec': -totalMachineryDeprec,
    'assets.noncurrent.fixed.buildings_deprec': -newBuildingsDeprecAccum,
    'liabilities.current.loans_st': prevNormalLoans + newLoansST - normalAmortization + newCompulsoryLoan,
    'liabilities.longterm.loans_lt': findAccountValue(prevBS, 'liabilities.longterm.loans_lt') + newLoansLT,
    'equity.profit': netProfit
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
    'equity.profit': finalNetProfit
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
    statements: {
      dre: injectValues(JSON.parse(JSON.stringify(prevStatements.dre)), { 
        'rev': revenue, 
        'cpv': -totalCPV, 
        'opex.sales': -currentOpexSales,
        'opex.adm': -currentOpexAdm,
        'opex.rd': -currentOpexRd,
        'opex.bad_debt': -badDebtExp,
        'operating_profit': operatingProfit,
        'fin.exp': -interestExp,
        'non_op.rev': totalAwards,
        'non_op.exp': -machineSalesLoss,
        'final_profit': finalNetProfit 
      }),
      cash_flow: injectValues(JSON.parse(JSON.stringify(prevStatements.cash_flow)), { 
        'cf.inflow.cash_sales': totalCashSales,
        'cf.inflow.term_sales': prevClients,
        'cf.inflow.machine_sales': machineSalesInflow,
        'cf.inflow.awards': totalAwards,
        'cf.inflow.compulsory': newCompulsoryLoan,
        'cf.outflow.machine_buy': -machinePurchaseOutflow,
        'cf.outflow.opex': currentOpexSales + currentOpexAdm + currentOpexRd,
        'cf.outflow.interest': -interestExp,
        'cf.outflow.amortization': -totalAmortization,
        'cf.final': finalCashWithAwards 
      }),
      balance_sheet: finalBSWithAwards
    },
    kpis: {
      ...team.kpis,
      current_cash: finalCashWithAwards,
      machines: currentMachines,
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
      compulsory_loan_interest_paid: totalCompulsoryCost,

      // E-SDS v1.1 Inputs
      fco_livre: (operatingProfit + periodDepreciation) - maintenance - interestExp - (lair > 0 ? lair * (sanitize(indicators.tax_rate_ir, 25) / 100) : 0),
      capex_manutencao: maintenance,
      capex_estrategico: machinePurchaseOutflow,
      juros_pagos: interestExp,
      impostos_pagos: lair > 0 ? lair * (sanitize(indicators.tax_rate_ir, 25) / 100) : 0,
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
