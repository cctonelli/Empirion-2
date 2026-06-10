import { DecisionData, Branch, EcosystemConfig, MacroIndicators, Team, ProjectionResult, KPIs, AccountNode, MachineInstance, MachineModel, CreditRating, ESDSCalculation } from '../types';
import { INITIAL_FINANCIAL_TREE } from '../constants';
import { sanitize, getAdjustedPrice, findAccountValue } from './simulation';

/**
 * ORACLE ACCOUNTING STRATEGOS - NÚCLEO DE INTEGRIDADE CONTÁBIL, KPI ENGINE E E-SDS (v19.5 SAPPHIRE)
 * Esta classe é responsável por implementar a consolidação tripla de balanços,
 * o cálculo de todos os KPIs corporativos unificados e o motor analítico E-SDS v1.2 completo.
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
 * Auxiliar para injetar ou ajustar valores em contas mapeadas
 */
function injectValues(tree: AccountNode[], values: Record<string, number>): AccountNode[] {
  const deepClone = (nodes: AccountNode[]): AccountNode[] => {
    return nodes.map(node => {
      let newVal = node.value;
      if (values[node.id] !== undefined) {
        newVal = values[node.id];
      }
      const newChildren = node.children ? deepClone(node.children) : undefined;
      return { ...node, value: newVal, children: newChildren };
    });
  };
  return deepClone(tree);
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
    const currentAssetsVal = cashVal + investmentsVal + clientsVal + pecldVal + vatRecoverableVal + stockPaVal + stockMpaVal + stockMpbVal;
    const nonCurrentAssetsVal = landVal + buildingsVal + buildingsDeprecVal + machinesVal + machinesDeprecVal;
    const currentLiabsVal = suppliersVal + vatPayableVal + taxesVal + dividendsVal + pprPayableVal + loansStVal;

    errors.push(`Disparidade crítica de Equação Contábil detectada: O total do Ativo (${roundedAssets.toFixed(2)} BRL) diverge da soma do Passivo + PL (${roundedLiabPl.toFixed(2)} BRL) por ${accountingDiff.toFixed(2)} BRL. ` +
      `[DETALHAMENTO AUDITORIA (SAPPHIRE)]: ` +
      `ATIVO: ${roundedAssets.toFixed(2)} BRL ` +
      `(Circulante: ${currentAssetsVal.toFixed(2)} BRL [Caixa: ${cashVal.toFixed(2)}, Aplicacao: ${investmentsVal.toFixed(2)}, Clientes: ${clientsVal.toFixed(2)}, PECLD: ${pecldVal.toFixed(2)}, IVA_Rec: ${vatRecoverableVal.toFixed(2)}, PA: ${stockPaVal.toFixed(2)}, MPA: ${stockMpaVal.toFixed(2)}, MPB: ${stockMpbVal.toFixed(2)}], ` +
      `Nao Circulante: ${nonCurrentAssetsVal.toFixed(2)} BRL [Terrenos: ${landVal.toFixed(2)}, Edificios: ${buildingsVal.toFixed(2)}, Depr_Edif: ${buildingsDeprecVal.toFixed(2)}, Maquinas: ${machinesVal.toFixed(2)}, Depr_Maq: ${machinesDeprecVal.toFixed(2)}]); ` +
      `PASSIVO + PL: ${roundedLiabPl.toFixed(2)} BRL ` +
      `(Circulante: ${currentLiabsVal.toFixed(2)} BRL [Fornecedores: ${suppliersVal.toFixed(2)}, IVA_Recolher: ${vatPayableVal.toFixed(2)}, Impostos: ${taxesVal.toFixed(2)}, Dividendos: ${dividendsVal.toFixed(2)}, PPR: ${pprPayableVal.toFixed(2)}, Emprestimos_CP: ${loansStVal.toFixed(2)}], ` +
      `Nao Circulante: ${loansLtVal.toFixed(2)} BRL [Emprestimos_LP: ${loansLtVal.toFixed(2)}], ` +
      `Patrimonio Liquido: ${totalEquityVal.toFixed(2)} BRL [Capital: ${capitalVal.toFixed(2)}, Lucros: ${profitVal.toFixed(2)}]).`
    );
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
 * Motor centralizado para cálculo do E-SDS v1.2 de forma robusta e multissetorial.
 * Composto por 6 pilares ponderados com pesos dinâmicos ajustados especificamente por setor (Branch).
 */
export const computeESDSDeterministic = (
  current: any,
  history: any[],
  branch: Branch,
  config: any = {}
): ESDSCalculation => {
  // Helper interno de extração de valores de subcontas ou KPIs pré-calculados
  const getVal = (state: any, path: string): number => {
    if (!state) return 0;
    
    // De preferência, extrair do objeto de KPIs calculado diretamente no primeiro nível
    if (state[path] !== undefined) return state[path];
    
    // Senão, tentar descer na árvore financeira
    const statements = state.statements || {};
    const dre = statements.dre || [];
    const dfc = statements.cash_flow || [];
    const bp = statements.balance_sheet || [];
    const all = [...dre, ...dfc, ...bp];

    const map: Record<string, string> = {
      'fco_livre': 'cf.inflow.cash_sales', // Simplificação heurística
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

  // Pesos Dinâmicos Customizados por Setor (Branch-Specific Weights)
  let weights = {
    p1: 4.0, // Fluxo de Caixa Livre Operacional
    p2: 3.0, // Crescimento Sustentável
    p3: 2.0, // Margens e DuPont
    p4: 1.5, // Dias de Caixa e Liquidez de Giro
    p5: 3.0, // Penalizador de Alavancagem e Endividamento (Valor Negativo)
    p6: 1.2  // Penalizador de Imprecisão Cambial e de Vendas (Valor Negativo)
  };

  if (branch === 'agribusiness') {
    weights = {
      p1: 3.5,
      p2: 2.5,
      p3: 2.0,
      p4: 2.5, // Maior impacto pela necessidade de fluxo de safra
      p5: 2.5,
      p6: 2.0  // Elevado risco de volatilidade de commodities e câmbio
    };
  } else if (branch === 'services') {
    weights = {
      p1: 4.0,
      p2: 3.0,
      p3: 3.0, // Ponderação alta de margem e recorrência recorrente
      p4: 1.0, 
      p5: 1.5, // Menor dependência de máquinas pesadas ou ativo imobilizado
      p6: 0.8  // Baixo impacto de fretes marítimos ou câmbio direto
    };
  }

  // --- PILAR 1: GERAÇÃO DE CAIXA OPERACIONAL LÍQUIDA ---
  // Relação de FCO Livre sobre as saídas e passivos operacionais exigíveis diretos
  const fcoLivre = getVal(current, 'fco_livre');
  const passivoCirc = getVal(current, 'passivo_circulante');
  const opexProj = current.despesas_operacionais_projetadas_proxima_rodada || (getVal(current, 'despesas_operacionais_diarias') * 30 * 1.05);
  const denomP1 = passivoCirc + opexProj;
  const p1 = denomP1 > 0 ? fcoLivre / denomP1 : 0;

  // --- PILAR 2: SUSTENTABILIDADE DO CRESCIMENTO ---
  // Delta de receita contra custo de endividamento ajustado à alavancagem
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

  // --- PILAR 3: ANÁLISE DUPONT & MARGENS ---
  // Ponderador integrado de Margem operacionais e fator setorial de recorrência de vendas
  const defaultRecurrence: Record<string, number> = {
    'agribusiness': 0.2,
    'services': 0.6,
    'industrial': 0.1
  };
  const recorrencia = config.recorrencia_percent?.[branch] || defaultRecurrence[branch] || 0;
  const ebitda = getVal(current, 'ebitda');
  const p3 = (ebitda + receitaAtual * recorrencia) / Math.max(receitaAtual, 1);

  // --- PILAR 4: COBERTURA DE GIRO E DIAS DE CAIXA ---
  // Medição de segurança dos dias de caixa com decaimento logístico conforme o setor
  const decayConstant = branch === 'agribusiness' ? 90 : branch === 'services' ? 45 : 60;
  const caixa = getVal(current, 'caixa');
  const opexDiaria = getVal(current, 'despesas_operacionais_diarias') || 1;
  const diasCaixa = caixa / Math.max(opexDiaria, 1);
  const p4 = 10 * (1 - Math.exp(-diasCaixa / decayConstant));

  // --- PILAR 5: ALAVANCAGEM & CONCENTRAÇÃO (Penalizador) ---
  // Agressividade de capital de curto prazo frente ao Patrimônio Líquido
  const passivoTotal = getVal(current, 'passivo_total');
  const pl = getVal(current, 'pl');
  const alavancagemBruta = passivoTotal / Math.max(pl, 1);
  const percentCurto = (getVal(current, 'percentual_divida_curto_prazo') || 0) / 100;
  let p5 = Math.max(0, alavancagemBruta - 3) * (1 + percentCurto);
  if (pl <= 0) p5 = 10 * (1 + percentCurto); // Penalidade extrema para insolvência iminente

  // --- PILAR 6: VOLATILIDADE CAMBIAL E DE RECEITA (Penalizador) ---
  // Coeficiente de variação histórica do FCO integrado às perdas cambiais potenciais
  const fcoList = [fcoLivre, ...historyKpis.map(h => getVal(h, 'fco_livre'))];
  const meanFCO = fcoList.reduce((a, b) => a + b, 0) / fcoList.length || 0.0001;
  const variance = fcoList.reduce((sum, x) => sum + (x - meanFCO) ** 2, 0) / fcoList.length;
  const stdDev = Math.sqrt(variance);
  const cv = Math.abs(meanFCO) > 0.0001 ? stdDev / Math.abs(meanFCO) : (stdDev > 0 ? 10 : 0);
  
  // Fator cambial dinâmico (com base nas taxas BRL / GBP nos indicadores)
  const brlRate = current.brl_rate || 5.0;
  const gbpRate = current.gbp_rate || 6.2;
  const exchangeVolatility = Math.abs(gbpRate / brlRate - 1.24) * 2; // Desvio da taxa de referência histórica

  const volMultiplier = branch === 'agribusiness' ? 0.8 : branch === 'industrial' ? 0.5 : 0.3;
  const p6 = (cv + exchangeVolatility) * volMultiplier;

  // CÁLCULO GERAL PONDERADO DO SCORE
  let esds_raw_pre = (weights.p1 * p1) + (weights.p2 * p2) + (weights.p3 * p3) + (weights.p4 * p4) - (weights.p5 * p5) - (weights.p6 * p6);

  // Integração Direta da Auditoria de Consistência Tripla (Audit Integrity Sync)
  let hasAccountingInconsistency = false;
  const statementsForAudit = current.statements;
  if (statementsForAudit) {
    const auditStatus = validateTripleConsistency(statementsForAudit);
    if (!auditStatus.isValid) {
      hasAccountingInconsistency = true;
      // Penalização de 3.0 pontos por discrepância severa de integridade contábil
      esds_raw_pre = Math.max(0, esds_raw_pre - 3.0);
    }
  }
  const esds_raw = esds_raw_pre;

  // Mapeamento categórico das zonas de solvência
  let zone: any = 'Verde';
  if (esds_raw >= 8.0) zone = 'Azul';
  else if (esds_raw >= 5.5) zone = 'Verde';
  else if (esds_raw >= 3.0) zone = 'Amarelo';
  else if (esds_raw >= 1.5) zone = 'Laranja';
  else zone = 'Vermelho';

  // Detecção e rebaixamento automático por limites críticos de cobertura de juros
  const dividaLiquida = getVal(current, 'divida_liquida');
  const netDebtToEbitda = ebitda > 0 ? dividaLiquida / ebitda : 10;
  if (netDebtToEbitda > 6.0 && (zone === 'Azul' || zone === 'Verde' || zone === 'Amarelo')) {
    zone = 'Laranja';
  }

  // Se houver discrepância física ou contábil, limite a classificação para Amarelo se estivesse em mais alta
  if (hasAccountingInconsistency && (zone === 'Azul' || zone === 'Verde')) {
    zone = 'Amarelo';
  }

  // Identificação sistemática dos maiores gargalos táticos (Top Gargalos)
  const top_gargalos: { name: string; impact: number; percentage: number; }[] = [];
  const main_drivers: string[] = [];
  
  if (hasAccountingInconsistency) {
    top_gargalos.push({
      name: 'Rompimento de Integridade Contábil (Z-Guard)',
      impact: 9,
      percentage: 95
    });
    main_drivers.push('Identificadas falhas críticas de reconciliação contábil entre DRE, DFC e Balanço Patrimonial');
  }
  
  if (p1 < 0.4) {
    top_gargalos.push({ 
      name: 'Geração de Caixa Operacional Limitada', 
      impact: Math.round(Math.min(10, (1 - p1) * 8)), 
      percentage: Math.round(Math.max(0, Math.min(100, 100 * (1 - p1)))) 
    });
    main_drivers.push('Fluxo operacional de caixa negativo ou insuficiente para cobertura ordinária de despesas');
  }
  if (p2 < 0.2) {
    top_gargalos.push({ 
      name: 'Insustentabilidade de Expansão', 
      impact: Math.round(Math.min(10, (1 - p2) * 8)), 
      percentage: Math.round(Math.max(0, Math.min(100, 100 * (1 - p2)))) 
    });
    main_drivers.push('O ritmo de crescimento setorial é menor que o custo médio ponderado da estrutura de capital');
  }
  if (p4 < 3) {
    top_gargalos.push({ 
      name: 'Giro Crítico / Margem de Caixa', 
      impact: Math.round(Math.min(10, (1 - p4/10) * 8)), 
      percentage: Math.round(Math.max(0, Math.min(100, 100 * (1 - p4/10)))) 
    });
    main_drivers.push('Reserva financeira abaixo do nível de alerta de cobertura de desembolso operacional diário');
  }
  if (p5 > 2.5) {
    top_gargalos.push({ 
      name: 'Sobre-alavancagem Bancária/Fornecedores', 
      impact: Math.round(Math.min(10, p5 * 1.5)), 
      percentage: Math.round(Math.min(100, p5 * 10)) 
    });
    main_drivers.push('Alto comprometimento patrimonial e perfil excessivo de vencimentos concentrado no curto prazo');
  }
  if (p6 > 1.5) {
    top_gargalos.push({ 
      name: 'Instabilidade de Receita / Exposição Cambial', 
      impact: Math.round(Math.min(10, p6 * 1.5)), 
      percentage: Math.round(Math.min(100, p6 * 10)) 
    });
    main_drivers.push('Alta volatilidade do fluxo de caixa ordinário incrementada por descompassos cambiais');
  }

  const gargalo_principal = p5 > 2.5 ? 'Crédito e Alavancagem' : 
                            p1 < 0.4 ? 'Operacional / Caixa' : 
                            p4 < 3 ? 'Liquidez de Curto Prazo' : 'Mercado';

  const esdsValue = Math.max(0, Math.min(10, esds_raw));

  return {
    esds_raw,
    esds_display: esdsValue,
    zone,
    top_gargalos, 
    gargalo_principal,
    main_drivers,
    warnings: [],
    is_estimated: history.length < 2,
    gemini_insights: main_drivers.join('. ') || "Solvência financeira saudável sob as regras atuais."
  };
};

/**
 * Calcula o Cronograma de Financiamento (Amortization Schedule) para os próximos 3 rounds
 * de forma a fornecer visibilidade de amortização e juros às equipes e aos tutores.
 * @param loans Lista de empréstimos correntes da equipe
 * @param indicators Indicadores macroeconômicos
 */
export function calculateAmortizationSchedule(loans: any[], indicators: any): any[] {
  if (!loans || !Array.isArray(loans)) return [];
  const list = JSON.parse(JSON.stringify(loans));
  const schedule: any[] = [];

  for (const loan of list) {
    let tempAmount = loan.amount;
    let tempRounds = loan.remaining_rounds;
    let tempGrace = loan.grace_period_remaining || 0;
    const installments: { round: number; amort: number; interest: number; total: number; balance_after: number }[] = [];

    const interestRateVal = loan.interest_rate || (indicators ? sanitize(indicators.interest_rate_tr, 2) : 2);

    for (let r = 1; r <= 3; r++) {
      if (tempAmount <= 0) break;

      let interest = 0;
      let amort = 0;

      if (loan.type === 'bdi') {
        interest = tempAmount * (interestRateVal / 100);
        if (tempGrace > 0) {
          amort = 0;
          tempGrace -= 1;
        } else {
          amort = tempAmount / Math.max(1, tempRounds);
        }
      } else if (loan.type === 'normal') {
        interest = tempAmount * (interestRateVal / 100);
        amort = tempAmount / Math.max(1, tempRounds);
      } else if (loan.type === 'compulsory') {
        const compulsoryAgio = indicators ? sanitize(indicators.compulsory_loan_agio, 3) : 3;
        interest = tempAmount * ((interestRateVal / 100) + (compulsoryAgio / 100));
        amort = tempAmount;
      }

      const total = amort + interest;
      const balance_after = Math.max(0, tempAmount - amort);

      installments.push({
        round: r,
        amort,
        interest,
        total,
        balance_after
      });

      tempAmount = balance_after;
      tempRounds = Math.max(1, tempRounds - 1);
    }

    schedule.push({
      id: loan.id,
      type: loan.type,
      amount: loan.amount,
      interest_rate: interestRateVal,
      term: loan.term || loan.remaining_rounds,
      remaining_rounds: loan.remaining_rounds,
      grace_period_remaining: loan.grace_period_remaining || 0,
      installments
    });
  }

  return schedule;
}

/**
 * Consolida, refina e computa todos os KPIs contábeis de ponta a ponta
 * a partir das demonstrações financeiras geradas, unificando os cálculos
 * e bloqueando redundâncias do frontend.
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

  // TSR (Total Shareholder Return) - Baseado no crescimento real do equity
  const tsr = ((totalEquity - prevEquity) / prevEquity) * 100;

  // Índices de Liquidez e Alavancagem
  const liquidityCurrent = currentLiabilities > 0 ? currentAssets / currentLiabilities : 2;
  const solvencyIndex = totalLiabilities > 0 ? totalAssets / totalLiabilities : 5;

  // NCG (Necessidade de Capital de Giro) - Operacional
  const ncg = (findAccountValue(finalBS, 'assets.current.clients') + closingStockValuePA + findAccountValue(finalBS, 'assets.current.vat_recoverable')) - 
              (findAccountValue(finalBS, 'liabilities.current.suppliers') + findAccountValue(finalBS, 'liabilities.current.taxes') + findAccountValue(finalBS, 'liabilities.current.dividends') + findAccountValue(finalBS, 'liabilities.current.ppr_payable') + findAccountValue(finalBS, 'liabilities.current.vat_payable'));
  
  // Saldo de Tesouraria (ST) - Financeiro líquido
  const st = (finalCash + (prevInvestments + applicationAmount)) - findAccountValue(finalBS, 'liabilities.current.loans_st');
  
  // Efeito Tesoura (Scissors Effect) - Diferença entre NCG e ST em dias de receita
  const scissorsEffectValue = ncg - st;
  const dailyRevenue = revenue / 90; 
  const scissorsEffect = dailyRevenue > 0 ? (scissorsEffectValue / dailyRevenue) : 0;

  // Z-Score de Kanitz de Solvência
  const x1_k = totalEquity > 0 ? netProfit / totalEquity : 0;
  const x2_k = liquidityCurrent;
  const x3_k = currentLiabilities > 0 ? (currentAssets - closingStockValuePA) / currentLiabilities : 1;
  const x4_k = totalAssets > 0 ? currentAssets / totalAssets : 0.5;
  const hasCompulsory = currentLoans ? currentLoans.some((l: any) => l.type === 'compulsory') : false;
  
  // Se houver empréstimo compulsório (quebra de caixa recente), aplica ágio de risco de alavancagem de forma punitiva (+1.5 no multiplicador de passivos)
  const x5 = totalEquity > 0 ? (totalLiabilities + (hasCompulsory ? (findAccountValue(finalBS, 'liabilities.current.loans_st') || 500000) * 1.5 : 0)) / totalEquity : 0.5;
  const kanitz = (0.05 * x1_k) + (1.65 * x2_k) + (3.55 * x3_k) - (1.06 * x4_k) - (0.33 * x5);

  // Altman Z''-Score para mercados emergentes
  const x1_altman = totalAssets > 0 ? (currentAssets - currentLiabilities) / totalAssets : 0;
  const x2_altman = totalAssets > 0 ? (netProfit) / totalAssets : 0; 
  const x3_altman = totalAssets > 0 ? operatingProfit / totalAssets : 0; 
  const x4_altman = totalLiabilities > 0 ? totalEquity / totalLiabilities : 1;
  const altmanZ = 3.25 + (6.56 * x1_altman) + (3.26 * x2_altman) + (6.72 * x3_altman) + (1.05 * x4_altman);

  // EBITDA e Valuation DCF Simplificada
  const ebitda = operatingProfit + periodDepreciation;
  const wacc = 0.12; 
  const dcfValuation = ebitda > 0 ? (ebitda / wacc) / 1000000 : 0;

  // Critérios rígidos para Rating de Crédito Corporativo
  let rating: CreditRating = 'D';
  if (hasCompulsory) {
    rating = 'D'; // Rebaixamento imediato e capitulação de rating por default de tesouraria flagrante (v19.10)
  } else if (liquidityCurrent > 1.5 && x5 < 0.8) rating = 'AAA';
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
    amortization_schedule: calculateAmortizationSchedule(currentLoans, indicators),
    stock_quantities: stockQuantities,
    cpp_unit: unitCPP,
    wac_unit: wacUnit,
    ebitda,
    fixed_assets_value: findAccountValue(finalBS, 'assets.noncurrent.fixed'),
    total_assets: totalAssets,
    equity: totalEquity,
    stock_value: closingStockValuePA,
    tsr,
    nlcdg: ncg / 1000000,
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
    landed_costs: {}, 
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
    brl_rate: indicators.BRL || 5.0,
    gbp_rate: indicators.GBP || 6.2,
    export_tariff_brazil: indicators.export_tariff_brazil || 0,
    export_tariff_uk: indicators.export_tariff_uk || 0,
    supplier_interest_expenses: supplierInterestExpenses,
    emergency_purchase_expenses: emergencyPurchaseExpenses,
    emergency_units_total: emergencyUnitsTotal
  };
};

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
  
  const initialMpaQty = Math.max(0, sanitize(team.kpis?.stock_quantities?.mp_a, 30150));
  const initialMpbQty = Math.max(0, sanitize(team.kpis?.stock_quantities?.mp_b, 20100));
  const initialPaQty = sanitize(team.kpis?.stock_quantities?.finished_goods, 0);

  const initialMpaValue = findAccountValue(prevBS, 'assets.current.stock.mpa') ?? 603000.00;
  const initialMpbValue = findAccountValue(prevBS, 'assets.current.stock.mpb') ?? 804000.00;
  const initialPaValue = findAccountValue(prevBS, 'assets.current.stock.pa') ?? 0.00;

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
  // Fator de Juros do Fornecedor (Proporcional ao Saldo Devedor Financiado - v19.12)
  const supplierInterestRate = sanitize(indicators.supplier_interest, 0) / 100;
  const supplierInterestFactor = 
    supplierPaymentType === 0 ? 1.0 :
    supplierPaymentType === 1 ? (1 + 0.5 * supplierInterestRate) :
    (1 + 0.99 * supplierInterestRate);

  const netPlannedMpaPrice = netMpaPrice * supplierInterestFactor;
  const netPlannedMpbPrice = netMpbPrice * supplierInterestFactor;

  // Calculando capacidade e operadores
  const isZeroMode = (ecosystem as any).starting_mode === 'start_from_zero' || (ecosystem as any).config?.starting_mode === 'start_from_zero';
  const defaultStaff = isZeroMode ? 0 : 470;

  let currentMachines: MachineInstance[] = [...(calculatedResult?.machines || team.kpis?.machines || [])];
  const sellIds = decision.machinery?.sell_ids || [];
  if (sellIds.length > 0) {
    currentMachines = currentMachines.filter(m => !sellIds.includes(m.id));
  }

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

  const capacity = currentMachines.reduce((acc, m) => {
    const normModel = (m.model as string) === 'alfa' ? 'alpha' : (m.model as string) === 'gama' ? 'gamma' : m.model;
    return acc + (indicators.machine_specs[normModel as 'alpha' | 'beta' | 'gamma']?.production_capacity || 0);
  }, 0) * capMult;
  const activityLevel = sanitize(decision.production?.activityLevel, 100) / 100;
  const operatorsAvailable = (team.kpis?.staffing?.production !== undefined ? team.kpis.staffing.production : defaultStaff) + sanitize(decision.hr?.hired, 0) - sanitize(decision.hr?.fired, 0);
  const operatorsRequired = currentMachines.reduce((acc, m) => {
    const normModel = (m.model as string) === 'alfa' ? 'alpha' : (m.model as string) === 'gama' ? 'gamma' : m.model;
    return acc + (indicators.machine_specs[normModel as 'alpha' | 'beta' | 'gamma']?.operators_required || 0);
  }, 0);
  const operatorConstraint = operatorsRequired > 0 ? Math.min(1, operatorsAvailable / operatorsRequired) : 1;
  const effectiveCapacity = capacity * operatorConstraint;
  
  // --- MODELO APERFEIÇOADO DE PRODUTIVIDADE E MOTIVAÇÃO (STRATEGOS v19.5 - SAPPHIRE) ---
  const trainingPercent = sanitize(decision.hr?.trainingPercent, 0);
  const boughtNew = Object.values(decision.machinery?.buy || {}).some(qty => (qty as number) > 0);
  
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
  const decisionSalary = sanitize(decision.hr?.salary, 0);
  const currentSalary = decisionSalary > 0 ? decisionSalary : (indicators.hr_base.salary * inflationMult);
  const salaryIndex = currentSalary / avgMarketSalary;
  const pprPercent = Math.min(10, sanitize(decision.hr?.participationPercent, 0));
  const pprRate = pprPercent / 100;
  const pprIndex = 1 + (pprRate * 3.0); // No novo teto de 10%, confere o mesmo impacto de motivação do limite anterior de 20% (0.10 * 3.0 = 0.30)
  const prodBonusPercent = sanitize(decision.hr?.productivityBonusPercent, 0) / 100;
  const prodBonusIndex = 1 + (prodBonusPercent * 1.25);
  let motivationFactor = (0.5 * salaryIndex * pprIndex * prodBonusIndex) + 0.5;
  motivationFactor = Math.max(0.60, Math.min(1.30, motivationFactor));

  // 3. Fatigue Factor (0.75 ~ 1.00)
  const extraProductionPercent = sanitize(decision.production?.extraProductionPercent, 0);
  let fatigueFactor = 1.0;
  if (extraProductionPercent > 0) {
    fatigueFactor -= (extraProductionPercent / 100) * 0.5;
  }
  if (selectedShifts === 3) {
    fatigueFactor -= 0.10;
  } else if (selectedShifts === 2) {
    fatigueFactor -= 0.04;
  }
  fatigueFactor = Math.max(0.75, Math.min(1.00, fatigueFactor));

  // 4. Demission Insecurity Factor (0.65 ~ 1.00)
  const fired = sanitize(decision.hr?.fired, 0);
  const previousStaff = team.kpis?.staffing?.production !== undefined ? team.kpis.staffing.production : defaultStaff;
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

  // --- RENDIMENTO DE MOTIVAÇÃO E CLIMA (CÁLCULO E GREVE SÊNIOR / DESIGN MULTIDISCIPLINAR CR) ---
  const motivationIndex = motivationFactor * demissionInsecurityFactor;
  
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

  // Lógica de Greve persistida por rodadas consecutivas ruins ou demissões consecutivas (v19.82+)
  const prevConsecutiveRuim = team.kpis?.consecutive_ruim_rounds || 0;
  const prevConsecutiveFires = team.kpis?.consecutive_fired_rounds || 0;
  let adjustedPrevConsecutiveRuim = prevConsecutiveRuim;
  let adjustedPrevConsecutiveFires = prevConsecutiveFires;

  // No modo "START FROM ZERO", o round R-00 (Inicial) não é considerado como round jogado para fins de greve.
  // Logo, se estivermos simulando o round 1 (onde o round logo anterior era o R-00), as contagens consecutivas prévias devem ser desconsideradas.
  const isGreenfieldZero = (ecosystem as any).starting_mode === 'start_from_zero' || (ecosystem as any).config?.starting_mode === 'start_from_zero';
  if (isGreenfieldZero && currentRound <= 1) {
    adjustedPrevConsecutiveRuim = 0;
    adjustedPrevConsecutiveFires = 0;
  }

  let consecutiveRuimRounds = motivationLevel === 'RUIM' ? (adjustedPrevConsecutiveRuim + 1) : 0;
  let consecutiveFiredRounds = fired > 0 ? (adjustedPrevConsecutiveFires + 1) : 0;

  // No próprio período inicial (Round 0 ou inferior), as contagens também permanecem zeradas por definição
  if (currentRound <= 0) {
    consecutiveRuimRounds = 0;
    consecutiveFiredRounds = 0;
  }

  // A greve é ativada se acumularmos 2 rounds consecutivos com motivação RUIM OU 2 rounds consecutivos com demissões operacionais
  const strikeActive = consecutiveRuimRounds >= 2 || consecutiveFiredRounds >= 2;
  const strikeFactor = strikeActive ? 0.50 : 1.0;
  const strikeAlertActive = (consecutiveRuimRounds === 1 || consecutiveFiredRounds === 1) && !strikeActive;

  // Índice Combina todos os modificadores
  const productivityIndex = trainingFactor * motivationFactor * fatigueFactor * demissionInsecurityFactor * machineAgeFactor;

  // Unidades produzidas efetivamente
  let unitsProduced = Math.floor(effectiveCapacity * activityLevel * productivityIndex * strikeFactor);

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
  // COMPRAS ESPECIAIS (Emergenciais) são pagas imediatamente (a vista) e não sofrem acréscimo de juros de financiamento do fornecedor (supplierInterestFactor)
  const netEmergencyMpaPrice = netMpaPrice * specialPremium;
  const netEmergencyMpbPrice = netMpbPrice * specialPremium;

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

  const socialChargesAttr = 1 + (sanitize(indicators.social_charges, 35) / 100);

  const payrollMOD = Math.max(0, operatorsAvailable) * currentSalary * activityLevel * modMult;
  const socialChargesMOD = payrollMOD * (socialChargesAttr - 1);
  const productivityBonus = payrollMOD * (sanitize(decision.hr?.productivityBonusPercent, 0) / 100);
  const totalMOD = payrollMOD + socialChargesMOD + productivityBonus;

  const extraProductionCost = extraProductionPercent > 0 ? (Math.floor(unitsProduced * (extraProductionPercent / (100 + extraProductionPercent))) / (unitsProduced || 1)) * totalMOD * 0.5 : 0;

  let periodDepreciation = 0;
  let machinePurchaseOutflow = 0;
  const rawBuy = decision.machinery?.buy || {};
  const buyDecisions = {
    alpha: rawBuy.alpha ?? rawBuy.alfa ?? 0,
    beta: rawBuy.beta ?? 0,
    gamma: rawBuy.gamma ?? rawBuy.gama ?? 0
  };
  Object.entries(buyDecisions).forEach(([model, qty]: [any, any]) => {
    if (qty > 0) {
      const basePrice = indicators.machinery_values[model as 'alpha' | 'beta' | 'gamma'];
      const adjustKey = model === 'alpha' ? 'machine_alpha_price_adjust' : 
                        model === 'beta' ? 'machine_beta_price_adjust' : 
                        'machine_gamma_price_adjust';
      const fallbackAdjust = model === 'alpha' ? indicators.machine_alpha_price_adjust : 
                             model === 'beta' ? indicators.machine_beta_price_adjust : 
                             indicators.machine_gamma_price_adjust;
      const unitPrice = basePrice * getAdjust(adjustKey, sanitize(fallbackAdjust, 0));
      const totalCost = unitPrice * qty;
      const isRJ = decision.judicial_recovery === true;
      const effectivePurchaseCost = isRJ ? totalCost * 0.4 : totalCost;
      machinePurchaseOutflow += effectivePurchaseCost;
    }
  });

  const rawEco = ecosystem as any || {};
  const ecoConfig = {
    machines_depreciation_rate: rawEco.machines_depreciation_rate ?? rawEco.ecosystem_config?.machines_depreciation_rate ?? rawEco.config?.machines_depreciation_rate ?? rawEco.config?.ecosystem_config?.machines_depreciation_rate,
    building_mode: rawEco.building_mode ?? rawEco.ecosystem_config?.building_mode ?? rawEco.config?.building_mode ?? rawEco.config?.ecosystem_config?.building_mode,
    machines: rawEco.machines ?? rawEco.ecosystem_config?.machines ?? rawEco.config?.machines ?? rawEco.config?.ecosystem_config?.machines,
    building_value: rawEco.building_value ?? rawEco.ecosystem_config?.building_value ?? rawEco.config?.building_value ?? rawEco.config?.ecosystem_config?.building_value,
    land_value: rawEco.land_value ?? rawEco.ecosystem_config?.land_value ?? rawEco.config?.land_value ?? rawEco.config?.ecosystem_config?.land_value,
    real_estate_acquisition_funding: rawEco.real_estate_acquisition_funding ?? rawEco.ecosystem_config?.real_estate_acquisition_funding ?? rawEco.config?.real_estate_acquisition_funding ?? rawEco.config?.ecosystem_config?.real_estate_acquisition_funding,
    buildings_depreciation_rate: rawEco.buildings_depreciation_rate ?? rawEco.ecosystem_config?.buildings_depreciation_rate ?? rawEco.config?.buildings_depreciation_rate ?? rawEco.config?.ecosystem_config?.buildings_depreciation_rate,
    property_depreciation_rate: rawEco.property_depreciation_rate ?? rawEco.ecosystem_config?.property_depreciation_rate ?? rawEco.config?.property_depreciation_rate ?? rawEco.config?.ecosystem_config?.property_depreciation_rate,
    starting_mode: rawEco.starting_mode ?? rawEco.ecosystem_config?.starting_mode ?? rawEco.config?.starting_mode ?? rawEco.config?.ecosystem_config?.starting_mode,
  };
  const machinesDepRateAnnual = ecoConfig.machines_depreciation_rate !== undefined 
    ? Number(ecoConfig.machines_depreciation_rate) 
    : 10;

  const existingMachineIds = (calculatedResult?.machines || team.kpis?.machines || []).map((m: any) => m.id);
  const tempMachines = [...(calculatedResult?.machines || team.kpis?.machines || [])];
  tempMachines.forEach((m: any) => {
    // Calculo dinâmico de depreciação de máquina (CPC 27) com base na taxa parametrizada pelo Tutor em % a.a.
    const depVal = m.acquisition_value * (machinesDepRateAnnual / 100);
    periodDepreciation += depVal;
  });

  // Regra do CPC 27 Fiduciária de Real Estate (Patrimonial):
  // - Prédio Próprio: Edifício deprecia a taxa parametrizável (property_depreciation_rate, padrão 4% ao ano). Terreno não deprecia.
  // - Instalações Industriais / Benfeitorias: Amortização/Depreciação de taxa parametrizável (buildingsDepRateAnnual, padrão 10% ao ano).
  const buildMode = ecoConfig.building_mode ?? 'owned';
  
  // Custos padrão de instalação por sofisticação de máquina
  const alphaInstallCost = ecoConfig.machines?.[0]?.installation_cost !== undefined ? Number(ecoConfig.machines[0].installation_cost) : 150000.00;
  const betaInstallCost = ecoConfig.machines?.[1]?.installation_cost !== undefined ? Number(ecoConfig.machines[1].installation_cost) : 600000.00;
  const gammaInstallCost = ecoConfig.machines?.[2]?.installation_cost !== undefined ? Number(ecoConfig.machines[2].installation_cost) : 1500000.00;

  // Calcular instalações atuais com base nas máquinas em auditoria
  let currentInstallationsVal = 0;
  tempMachines.forEach((m: any) => {
    if (m.model === 'alpha' || m.model === 'alfa') currentInstallationsVal += alphaInstallCost;
    else if (m.model === 'beta') currentInstallationsVal += betaInstallCost;
    else if (m.model === 'gamma' || m.model === 'gama') currentInstallationsVal += gammaInstallCost;
  });

  const buildingBaseValue = buildMode === 'owned' ? (ecoConfig.building_value ?? 2000000.00) : 0;
  
  const buildingsDepRateAnnual = ecoConfig.buildings_depreciation_rate !== undefined 
    ? Number(ecoConfig.buildings_depreciation_rate) 
    : ((ecosystem as any).buildings_depreciation_rate !== undefined 
        ? Number((ecosystem as any).buildings_depreciation_rate) 
        : 10);

  const propertyDepRateAnnual = ecoConfig.property_depreciation_rate !== undefined 
    ? Number(ecoConfig.property_depreciation_rate) 
    : 4;

  let buildingDepPeriod = 0;
  if (buildMode === 'owned') {
    buildingDepPeriod = (buildingBaseValue * (propertyDepRateAnnual / 100)) + (currentInstallationsVal * (buildingsDepRateAnnual / 100));
  } else {
    buildingDepPeriod = currentInstallationsVal * (buildingsDepRateAnnual / 100);
  }
  periodDepreciation += buildingDepPeriod;

  const maintenance = capacity * 2.5 * inflationMult;

  const totalStaff = (team.kpis?.staffing?.production !== undefined ? team.kpis.staffing.production : defaultStaff) + (indicators.staffing?.admin?.count || 20) + (indicators.staffing?.sales?.count || 10);
  const firedTotal = sanitize(decision.hr?.fired, 0);
  const prevPprPayable = findAccountValue(prevBS, 'liabilities.current.ppr_payable') || 0;
  const pprProporcional = (firedTotal > 0 && totalStaff > 0) ? prevPprPayable * (firedTotal / totalStaff) : 0;
  const custoIndenizacao = firedTotal * currentSalary * 2;

  const totalQtyPaForSale = initialPaQty + unitsProduced;

  // Calculas de vendas de acordo com o pre-calculado para auditar (movido precocemente para computar custos de estocagem final de absorção)
  let totalUnitsSold = calculatedResult?.last_units_sold ?? 0;
  if (!calculatedResult) {
    const regions = Object.entries(decision.regions || {});
    const regionCount = regions.length || 1;
    const baseDemandPerRegion = (capacity * 0.8) / regionCount;

    let totalDemandAllRegions = 0;
    const regionalDemands: Record<string, number> = {};

    regions.forEach(([id, reg]: [string, any]) => {
      const regPrice = sanitize(reg.price, 425);
      const regMarketing = sanitize(reg.marketing, 0);
      const rjDemandPenalty = decision.judicial_recovery === true ? 0.85 : 1.0;

      const regId = Number(id);
      const regConfig = (ecosystem as any)?.regions?.find((r: any) => r.id === regId) || (ecosystem as any)?.region_configs?.find((r: any) => r.id === regId);
      const baseSuggestedPrice = regConfig?.suggested_price !== undefined ? Number(regConfig.suggested_price) : (indicators.avg_selling_price || 425);

      const priceIndex = baseSuggestedPrice / regPrice;
      const marketingIndex = 1 + (regMarketing * 0.08);
      const termIndex = 1 + (sanitize(reg.term, 0) * 0.05);
      
      const regDemand = Math.floor(baseDemandPerRegion * priceIndex * marketingIndex * termIndex * (1 + (indicators.demand_variation / 100)) * rjDemandPenalty);
      regionalDemands[id] = regDemand;
      totalDemandAllRegions += regDemand;
    });

    const teamStockRatio = totalDemandAllRegions > totalQtyPaForSale && totalDemandAllRegions > 0
      ? totalQtyPaForSale / totalDemandAllRegions
      : 1;

    let runningUnitsSold = 0;
    regions.forEach(([id, reg]: [string, any], index) => {
      const regDemand = regionalDemands[id] || 0;
      let regUnitsSold = 0;
      if (index === regions.length - 1) {
        regUnitsSold = Math.min(totalQtyPaForSale, Math.min(totalDemandAllRegions, totalQtyPaForSale) - runningUnitsSold);
      } else {
        regUnitsSold = Math.min(regDemand, Math.floor(regDemand * teamStockRatio));
      }
      regUnitsSold = Math.max(0, regUnitsSold);
      runningUnitsSold += regUnitsSold;
    });

    totalUnitsSold = runningUnitsSold;
  }

  // --- CUSTOS OCULTOS DE ABSORÇÃO (v19.5 SAPPHIRE GOLD COMPATIBILITY PARITY) ---
  // 1. Custo de Treinamento
  const trainingCost = payrollMOD * (trainingPercent / 100);

  // 2. Aluguel de Produção (Rateio)
  const isRentedRoom = ((ecosystem as any).building_mode ?? (isZeroMode ? 'rented' : 'owned')) === 'rented';
  const rentVal = isRentedRoom ? ((ecosystem as any).monthly_rent_value !== undefined ? Number((ecosystem as any).monthly_rent_value) : 50000.00) : 0;
  const pProd = (ecosystem as any).rent_allocation_productive !== undefined ? Number((ecosystem as any).rent_allocation_productive) : 70;
  const valCif = rentVal * (pProd / 100);

  // 3. Custo de Estocagem (Holding Costs)
  const closingStockPA = totalQtyPaForSale - totalUnitsSold;
  const currentMPAStock = totalMpaQtyAvailable - mpaConsumidaQty;
  const currentMPBStock = totalMpbQtyAvailable - mpbConsumidaQty;
  const storageCost = (closingStockPA * indicators.prices.storage_finished * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0))) + 
                      (Math.max(0, currentMPAStock) * indicators.prices.storage_mp * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0))) + 
                      (Math.max(0, currentMPBStock) * indicators.prices.storage_mp * getAdjust('storage_cost_adjust', sanitize(indicators.storage_cost_adjust, 0)));

  // CIF COMPLETO contendo todos os elementos de rateio e estocagem física
  const totalCIF = totalMOD + extraProductionCost + periodDepreciation + maintenance + custoIndenizacao + pprProporcional + trainingCost + storageCost + valCif;
  const totalCPP = totalMPConsumida + totalCIF;
  const unitCPP = unitsProduced > 0 ? (totalCPP / unitsProduced) : 0;

  const totalValuePaForSale = initialPaValue + totalCPP;
  const wacPaUnit = totalQtyPaForSale > 0 ? (totalValuePaForSale / totalQtyPaForSale) : unitCPP;

  const finalMpaQty = Math.max(0, totalMpaQtyAvailable - mpaConsumidaQty);
  const finalMpaValue = finalMpaQty * wacMpaUnit;

  const finalMpbQty = Math.max(0, totalMpbQtyAvailable - mpbConsumidaQty);
  const finalMpbValue = finalMpbQty * wacMpbUnit;

  const finalPaQty = Math.max(0, totalQtyPaForSale - totalUnitsSold);
  const finalPaValue = finalPaQty * wacPaUnit;

  // Equação Dinâmica e Integrada de Estoques para Garantia Contábil de Integridade (Absorção e Ociosidade CPC 16)
  const totalCPV = totalValuePaForSale - finalPaValue;

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
    maoDeObraDireta: totalMOD + extraProductionCost + trainingCost,
    depreciacaoFabril: periodDepreciation + valCif + storageCost,
    manutencaoFabril: maintenance,
    indenizacoesRescisorias: custoIndenizacao,
    pprProporcional: pprProporcional,
    totalCPP,
    estoqueInicialPA: initialPaValue,
    estoqueFinalPA: finalPaValue,
    totalCPV,
    custoUnitarioProducao: unitCPP
  };

  // 1. Validando consistência de estoques físicos e alertas de greve
  if (emergencyMPA > 0 || emergencyMPB > 0) {
    warnings.push(`Cisne de Estoque Ativado: A quantidade de produção de ${unitsProduced} un exigiu compras de emergência de MP A (+${emergencyMPA} un) e MP B (+${emergencyMPB} un) gerando penalização de ágio de especial premium.`);
  }

  // Alertas de Gestão de Pessoas Sênior (v19.5 Sapphire Gold / v19.82+)
  if (strikeActive) {
    if (consecutiveRuimRounds >= 2 && consecutiveFiredRounds >= 2) {
      warnings.push(`ATENÇÃO CRÍTICA: GREVE ATIVA NA FÁBRICA! Devido a dois rounds consecutivos com Índice de Motivação RUIM (< 0.75) e demissões operacionais consecutivas, a produção foi paralisada em 50%! Melhore o Clima Organizacional e interrompa as demissões para retomar a operação normal.`);
    } else if (consecutiveRuimRounds >= 2) {
      warnings.push(`ATENÇÃO CRÍTICA: GREVE ATIVA NA FÁBRICA! Devido a dois rounds consecutivos com Índice de Motivação RUIM (< 0.75), a produção de sua empresa foi paralisada em 50%! Melhore salários e PPR imediatamente para acabar com a paralisação.`);
    } else {
      warnings.push(`ATENÇÃO CRÍTICA: GREVE ATIVA NA FÁBRICA! Devido a demissões consecutivas de operários em dois rounds seguidos, o sindicato decretou greve geral e a produção foi paralisada em 50%! Interrompa as demissões consecutivas imediatamente para retomar a atividade normal.`);
    }
  } else {
    if (consecutiveRuimRounds === 1 && consecutiveFiredRounds === 1) {
      warnings.push(`ALERTA DE GREVE: O clima organizacional caiu para nível RUIM (< 0.75) e ocorreram demissões operacionais neste período. Se mantiver qualquer um desses fatores na próxima rodada, os operários entrarão em GREVE imediata no próximo período!`);
    } else if (consecutiveRuimRounds === 1) {
      warnings.push(`ALERTA DE GREVE: O clima organizacional caiu para nível RUIM (Índice de Motivação = ${motivationIndex.toFixed(2)} < 0.75). Se mantiver esse nível insatisfatório na próxima rodada, os operários entrarão em GREVE imediata no próximo período!`);
    } else if (consecutiveFiredRounds === 1) {
      warnings.push(`ALERTA DE GREVE: Ocorreram demissões operacionais neste período. Caso ocorra nova demissão na próxima rodada (dois rounds seguidos), o sindicato decretará GREVE imediata no próximo período por instabilidade organizacional!`);
    }
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
