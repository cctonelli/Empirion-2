import { AccountNode, CurrencyType } from '../types';
import { formatCurrency } from '../utils/formatters';

export interface TableData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Helper para buscar o valor de uma determinada conta na estrutura de árvore de um período
 */
const findValueInTree = (list: any[], nodeId: string): number => {
  if (!list || !Array.isArray(list)) return 0;
  
  const search = (subList: any[]): any => {
    for (const n of subList) {
      if (n.id === nodeId) return n.value;
      if (n.children && n.children.length > 0) {
        const v = search(n.children);
        if (v !== undefined) return v;
      }
    }
    return undefined;
  };
  
  const finalVal = search(list);
  return finalVal !== undefined ? finalVal : 0;
};

/**
 * Helper para buscar múltiplos níveis de chaves em um objeto ou retornar fallback do raw
 */
const getKpiValue = (p: any, kpiId: string) => {
  const keys = kpiId.split('.');
  let val = p.data;
  for (const key of keys) {
    val = val?.[key];
  }
  if ((val === undefined || val === null) && p.raw) {
    val = p.raw[kpiId];
  }
  return val;
};

/**
 * Processamento recursivo para achatar a estrutura em árvore das demonstrações financeiras (DRE, BP, DFC)
 */
const flattenAccountTree = (
  nodes: any[],
  periods: any[],
  currency: CurrencyType,
  level = 0
): (string | number)[][] => {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  let rows: (string | number)[][] = [];
  
  nodes.forEach((node: any) => {
    const isTotalizer = node.type === 'totalizer';
    
    // Identação visual no Excel/Sheets usando espaços simples
    const indentSymbol = level > 0 ? ' '.repeat(level * 4) + '↳ ' : '';
    const labelWithIndent = indentSymbol + node.label;
    
    const row: (string | number)[] = [labelWithIndent];
    
    // Coleta o valor correspondente a cada período
    periods.forEach((p) => {
      const periodData = Array.isArray(p.data) ? p.data : [];
      const val = findValueInTree(periodData, node.id);
      row.push(val); // Mantém o número original para que o Excel possa tratá-lo como numérico!
    });
    
    rows.push(row);
    
    // Processamento recursivo dos filhos
    if (node.children && node.children.length > 0) {
      const childRows = flattenAccountTree(node.children, periods, currency, level + 1);
      rows = [...rows, ...childRows];
    }
  });
  
  return rows;
};

/**
 * Mapeia o relatório DRE, Balanço Patrimonial ou Fluxo de Caixa (estruturas hierárquicas em árvore)
 */
const mapRecursiveReport = (
  title: string,
  rootData: any,
  periods: any[],
  currency: CurrencyType
): TableData => {
  const initialData = Array.isArray(rootData)
    ? rootData
    : Object.entries(rootData || {}).map(([k, v]: [string, any]) => ({
        id: k,
        label: k.replace(/_/g, ' ').toUpperCase(),
        value: typeof v === 'number' ? v : (v?.total || 0)
      }));
      
  const headers = [
    'Contas Contábeis de Movimento',
    ...periods.map((p) => {
      const nextRound = p.round + 1;
      const pad = nextRound < 10 ? '0' : '';
      if (p.isProjection) return `PROJEÇÃO P${pad}${nextRound}`;
      return `PERÍODO ${pad}${nextRound}`;
    })
  ];
  
  const rows = flattenAccountTree(initialData, periods, currency, 0);
  
  return {
    title,
    headers,
    rows
  };
};

/**
 * Mapeia o relatório Comando Estratégico (KPIs Avançados)
 */
const mapStrategicReport = (periods: any[]): TableData => {
  const title = 'Comando Estratégico - KPIs Avançados';
  const headers = [
    'Indicador Sapiens',
    'Descrição / Detalhe Técnico',
    ...periods.map((p) => {
      const nextRound = p.round + 1;
      const pad = nextRound < 10 ? '0' : '';
      return p.isProjection ? `PROJEÇÃO P${pad}${nextRound}` : `PERÍODO ${pad}${nextRound}`;
    })
  ];
  
  const kpiDefinitions = [
    { id: 'ccc', label: 'Ciclo de Conversão de Caixa (CCC) (dias)', desc: 'Eficiência do capital de giro' },
    { id: 'interest_coverage', label: 'Índice de Cobertura de Juros (x)', desc: 'Capacidade de pagamento de juros' },
    { id: 'altman_z_score', label: "Altman Z''-Score (Solvência)", desc: 'Saúde financeira global (Seguro > 5.85)' },
    { id: 'market_share', label: 'Market Share Real (%)', desc: 'Participação de mercado no round', isPercent: true },
    { id: 'markup', label: 'Markup Médio (Margem Bruta) (%)', desc: 'Margem sobre o custo unitário', isPercent: true },
    { id: 'stock_quantities.mp_a', label: 'Estoque Físico: MP A (un)', desc: 'Saldo de matéria-prima A' },
    { id: 'stock_quantities.mp_b', label: 'Estoque Físico: MP B (un)', desc: 'Saldo de matéria-prima B' },
    { id: 'stock_quantities.finished_goods', label: 'Estoque Físico: Prod. Acabado (un)', desc: 'Saldo de produtos prontos' },
    { id: 'price_elasticity', label: 'Elasticidade-Preço Real', desc: 'Sensibilidade da demanda ao preço' },
    { id: 'carbon_footprint', label: 'Pegada de Carbono Unitária (kg CO2)', desc: 'Impacto ambiental projetado' },
    { id: 'dupont.margin', label: 'Margem Líquida (DuPont) (%)', desc: 'Eficiência de lucro', isPercent: true },
    { id: 'dupont.turnover', label: 'Giro do Ativo (DuPont) (x)', desc: 'Eficiência operacional' },
    { id: 'dupont.leverage', label: 'Alavancagem (DuPont) (x)', desc: 'Multiplicador de patrimônio' }
  ];
  
  const rows = kpiDefinitions.map((kpi) => {
    const row: (string | number)[] = [kpi.label, kpi.desc];
    
    periods.forEach((p) => {
      const val = getKpiValue(p, kpi.id);
      if (typeof val === 'number') {
        row.push(kpi.isPercent ? val * 100 : val);
      } else {
        row.push('N/A');
      }
    });
    
    return row;
  });
  
  return {
    title,
    headers,
    rows
  };
};

/**
 * Mapeia o relatório Agenda Financeira (Compromissos)
 */
const mapCommitmentsReport = (periods: any[]): TableData => {
  const title = 'Agenda de Compromissos Financeiros (Direitos e Deveres)';
  const headers = [
    'Compromisso / Fluxo do Período',
    ...periods.map((p) => {
      const nextRound = p.round + 1;
      const pad = nextRound < 10 ? '0' : '';
      return p.isProjection ? `PROJEÇÃO P${pad}${nextRound}` : `PERÍODO ${pad}${nextRound}`;
    })
  ];
  
  const rows: (string | number)[][] = [];
  
  const lastPeriod = periods[periods.length - 1];
  const receivables = lastPeriod?.data?.commitments?.receivables || [];
  const payables = lastPeriod?.data?.commitments?.payables || [];
  const loans = lastPeriod?.data?.loans || [];
  
  // Seção de Entradas
  rows.push(['DIREITOS COMPROMETIDOS (ENTRADAS FUTURAS)']);
  receivables.forEach((item: any) => {
    const row: (string | number)[] = ['  ↳ ' + item.label];
    periods.forEach((p) => {
      const val = p.data?.commitments?.receivables?.find((r: any) => r.id === item.id)?.value || 0;
      row.push(val);
    });
    rows.push(row);
  });
  
  // Seção de Saídas
  rows.push(['DEVERES COMPROMETIDOS (SAÍDAS FUTURAS)']);
  payables.forEach((item: any) => {
    const row: (string | number)[] = ['  ↳ ' + item.label];
    periods.forEach((p) => {
      const val = p.data?.commitments?.payables?.find((r: any) => r.id === item.id)?.value || 0;
      row.push(val);
    });
    rows.push(row);
  });
  
  // Seção de Financiamentos
  rows.push(['CRONOGRAMA DE AMORTIZAÇÃO DE FINANCIAMENTOS & EMPRÉSTIMOS']);
  if (!loans || loans.length === 0) {
    rows.push(['  (Nenhum empréstimo ativo no período)']);
  } else {
    loans.forEach((loan: any) => {
      const loanName = loan.type === 'bdi' ? 'Financiamento Máquinas (BDI)' : loan.type === 'normal' ? 'Empréstimo Normal' : 'Empréstimo Compulsório';
      const detailLabel = `  ↳ ${loanName} [${loan.id?.slice(2, 7) || 'REQ'}]`;
      const row: (string | number)[] = [detailLabel];
      
      periods.forEach((p) => {
        const lInP = p.data?.loans?.find((l: any) => l.id === loan.id);
        row.push(lInP ? lInP.amount : 0);
      });
      rows.push(row);
    });
  }
  
  return {
    title,
    headers,
    rows
  };
};

/**
 * Mapeia o Kardex de Estoques e do CPV (Sapphire WAC)
 */
const mapKardexReport = (periods: any[], startingMode?: string): TableData => {
  const title = 'Kardex de Estoques & Detalhamento do CPV (Absorção WAC)';
  const headers = [
    'Movimentação Física e Financeira de Estoque',
    ...periods.map((p) => {
      const nextRound = p.round + 1;
      const pad = nextRound < 10 ? '0' : '';
      return p.isProjection ? `PROJEÇÃO P${pad}${nextRound}` : `PERÍODO ${pad}${nextRound}`;
    })
  ];
  
  // Estrutura padrão de linhas do Kardex
  const kardexDefinitions = [
    // Seção MP A
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.saldoInicialQtd', label: '(=) Estoque Inicial (Qtd)' },
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.saldoInicialValor', label: '(=) Estoque Inicial ($)' },
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.entradasQtd', label: '(+) Compras (Normal/Especial) (Qtd)' },
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.entradasValor', label: '(+) Compras (Normal/Especial) ($)' },
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.saidasQtd', label: '(-) Consumo Produção (Qtd)' },
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.saidasValor', label: '(-) Consumo Produção ($)' },
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.saldoFinalQtd', label: '(=) Estoque Final (Qtd)' },
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.saldoFinalValor', label: '(=) Estoque Final ($)' },
    { category: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.saldoFinalUnitario', label: 'Preço Médio Ponderado WAC' },

    // Seção MP B
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.saldoInicialQtd', label: '(=) Estoque Inicial (Qtd)' },
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.saldoInicialValor', label: '(=) Estoque Inicial ($)' },
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.entradasQtd', label: '(+) Compras (Normal/Especial) (Qtd)' },
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.entradasValor', label: '(+) Compras (Normal/Especial) ($)' },
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.saidasQtd', label: '(-) Consumo Produção (Qtd)' },
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.saidasValor', label: '(-) Consumo Produção ($)' },
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.saldoFinalQtd', label: '(=) Estoque Final (Qtd)' },
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.saldoFinalValor', label: '(=) Estoque Final (Valor)' },
    { category: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.saldoFinalUnitario', label: 'Preço Médio Ponderado WAC' },

    // Seção PA
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.saldoInicialQtd', label: '(=) Estoque Inicial PA (Qtd)' },
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.saldoInicialValor', label: '(=) Estoque Inicial PA ($)' },
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.entradasQtd', label: '(+) Entradas Produção (Qtd)' },
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.entradasValor', label: '(+) Entradas Produção ($ CPP)' },
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.saidasQtd', label: '(-) Vendas/CPV (Qtd)' },
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.saidasValor', label: '(-) Vendas/CPV ($)' },
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.saldoFinalQtd', label: '(=) Estoque Final PA (Qtd)' },
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.saldoFinalValor', label: '(=) Estoque Final PA ($)' },
    { category: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.saldoFinalUnitario', label: 'Custo Unitário de Fechamento WAC' },

    // Detalhes do CPV
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.mpConsumida', label: 'Matéria-Prima Consumida' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.maoDeObraDireta', label: 'Mão de Obra Direta (MOD)' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.depreciacaoFabril', label: 'Depreciação Fabril' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.manutencaoFabril', label: 'Manutenção de Máquinas' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.indenizacoesRescisorias', label: 'Indenizações Rescisórias' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.pprProporcional', label: 'Provisão de PPR Proporcional' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.totalCPP', label: '(=) CUSTO DE PRODUÇÃO DO PERÍODO (CPP)' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.estoqueInicialPA', label: '(+) Estoque Inicial de PA' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.estoqueFinalPA', label: '(-) Estoque Final de PA' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.custoUnitarioProducao', label: 'Custo Unitário de PA' },
    { category: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.totalCPV', label: '(=) CUSTO DO PRODUTO VENDIDO (CPV)' }
  ];
  
  const rows: (string | number)[][] = [];
  let currentCategory = '';
  
  kardexDefinitions.forEach((def) => {
    if (def.category !== currentCategory) {
      currentCategory = def.category;
      rows.push([currentCategory.toUpperCase()]);
    }
    
    const row: (string | number)[] = ['  ↳ ' + def.label];
    
    periods.forEach((p) => {
      let val: any = undefined;
      const isRound0 = p.round === 0 || p.round === '0' || p.round === '00';
      const isZeroMode = startingMode === 'start_from_zero';
      
      // Busca defensiva e resiliente de KPIs (v19.12 Gold Standard)
      let targetKpis = p.data;
      if (!targetKpis && p.raw?.kpis) {
        targetKpis = typeof p.raw.kpis === 'string' ? JSON.parse(p.raw.kpis) : p.raw.kpis;
      } else if (typeof targetKpis === 'string') {
        try {
          targetKpis = JSON.parse(targetKpis);
        } catch (e) {
          console.error("Erro ao parsear kpis no histórico export:", e);
        }
      }

      const targetKardex = targetKpis?.kardex ?? targetKpis?.statements?.kardex ?? p.raw?.kardex;
      const targetCpv = targetKpis?.cpv_details ?? targetKpis?.statements?.cpv_details ?? p.raw?.cpv_details;

      if (def.key.startsWith('cpv.')) {
        const subKey = def.key.split('.')[1];
        val = targetCpv?.[subKey];
        if (val === undefined || val === null) {
          // Fallbacks idênticos aos da UI
          if (subKey === 'mpConsumida') val = isRound0 ? 0 : 2520000;
          else if (subKey === 'maoDeObraDireta') val = isRound0 ? 0 : 540000;
          else if (subKey === 'depreciacaoFabril') val = isRound0 ? 0 : 92000;
          else if (subKey === 'manutencaoFabril') val = isRound0 ? 0 : 25000;
          else if (subKey === 'indenizacoesRescisorias') val = 0;
          else if (subKey === 'pprProporcional') val = 0;
          else if (subKey === 'totalCPP') val = isRound0 ? 0 : 3177000;
          else if (subKey === 'estoqueInicialPA') val = 0;
          else if (subKey === 'estoqueFinalPA') val = 0;
          else if (subKey === 'custoUnitarioProducao') val = isRound0 ? 0 : 75.64;
          else if (subKey === 'totalCPV') val = isRound0 ? 0 : 3177000;
        }
      } else {
        const [prodKey, statKey] = def.key.split('.');
        val = targetKardex?.[prodKey]?.[statKey];
        if (val === undefined || val === null) {
          // Fallbacks idênticos aos da UI
          if (prodKey === 'mpa') {
            if (statKey === 'saldoInicialQtd') val = isZeroMode ? 0 : 30150;
            else if (statKey === 'saldoInicialValor') val = isZeroMode ? 0 : 603000;
            else if (statKey === 'saldoInicialUnitario') val = isZeroMode ? 0 : 20;
            else if (statKey === 'entradasQtd') val = isRound0 ? 0 : 126000;
            else if (statKey === 'entradasValor') val = isRound0 ? 0 : 2520000;
            else if (statKey === 'saidasQtd') val = isRound0 ? 0 : 126000;
            else if (statKey === 'saidasValor') val = isRound0 ? 0 : 2520000;
            else if (statKey === 'saldoFinalQtd') val = isZeroMode ? 0 : 30150;
            else if (statKey === 'saldoFinalValor') val = isZeroMode ? 0 : 603000;
            else if (statKey === 'saldoFinalUnitario') val = isZeroMode ? 0 : 20;
          } else if (prodKey === 'mpb') {
            if (statKey === 'saldoInicialQtd') val = isZeroMode ? 0 : 20100;
            else if (statKey === 'saldoInicialValor') val = isZeroMode ? 0 : 804000;
            else if (statKey === 'saldoInicialUnitario') val = isZeroMode ? 0 : 40;
            else if (statKey === 'entradasQtd') val = isRound0 ? 0 : 84000;
            else if (statKey === 'entradasValor') val = isRound0 ? 0 : 3360000;
            else if (statKey === 'saidasQtd') val = isRound0 ? 0 : 84000;
            else if (statKey === 'saidasValor') val = isRound0 ? 0 : 3360000;
            else if (statKey === 'saldoFinalQtd') val = isZeroMode ? 0 : 20100;
            else if (statKey === 'saldoFinalValor') val = isZeroMode ? 0 : 804000;
            else if (statKey === 'saldoFinalUnitario') val = isZeroMode ? 0 : 40;
          } else if (prodKey === 'pa') {
            if (statKey === 'saldoInicialQtd') val = 0;
            else if (statKey === 'saldoInicialValor') val = 0;
            else if (statKey === 'saldoInicialUnitario') val = 0;
            else if (statKey === 'entradasQtd') val = isRound0 ? 0 : 42000;
            else if (statKey === 'entradasValor') val = isRound0 ? 0 : 3177000;
            else if (statKey === 'entradasUnitario') val = isRound0 ? 0 : 75.64;
            else if (statKey === 'saidasQtd') val = isRound0 ? 0 : 42000;
            else if (statKey === 'saidasValor') val = isRound0 ? 0 : 3177000;
            else if (statKey === 'saldoFinalQtd') val = 0;
            else if (statKey === 'saldoFinalValor') val = 0;
            else if (statKey === 'saldoFinalUnitario') val = 0;
          }
        }
      }
      
      row.push(val !== undefined ? val : 0);
    });
    
    rows.push(row);
  });
  
  return {
    title,
    headers,
    rows
  };
};

/**
 * Mapeia os dados brutos e filtros de contexto na estrutura uniforme para exportação
 */
export const mapFinancialToTable = (
  type: 'balance' | 'dre' | 'cashflow' | 'strategic' | 'commitments' | 'kardex',
  history: any[],
  projection: any,
  currency: CurrencyType,
  startingMode?: string
): TableData => {
  // Consolidação de períodos para consistência exata com o componente visual
  const periods = [
    ...history.map((h) => ({
      round: h.round,
      data:
        type === 'strategic' || type === 'kardex' || type === 'commitments'
          ? h.kpis
          : h.kpis?.statements?.[
              type === 'balance' ? 'balance_sheet' : type === 'dre' ? 'dre' : 'cash_flow'
            ],
      raw: h,
      isProjection: false
    })),
    ...(projection ? [{
      round: (history.length > 0 ? (history[history.length - 1]?.round ?? 0) + 1 : 1),
      data:
        type === 'strategic' || type === 'kardex' || type === 'commitments'
          ? projection?.kpis
          : projection?.kpis?.statements?.[
              type === 'balance' ? 'balance_sheet' : type === 'dre' ? 'dre' : 'cash_flow'
            ],
      raw: projection,
      isProjection: true
    }] : [])
  ];

  if (type === 'strategic') {
    return mapStrategicReport(periods);
  }
  if (type === 'commitments') {
    return mapCommitmentsReport(periods);
  }
  if (type === 'kardex') {
    return mapKardexReport(periods, startingMode);
  }

  // Relatórios em árvore / hierárquicos (DRE, BP, DFC)
  const rootData = periods[periods.length - 1]?.data || [];
  let title = 'Relatório Financeiro';
  if (type === 'balance') title = 'Balanço Patrimonial Auditado';
  if (type === 'dre') title = 'DRE - Demonstrativo de Resultados (Competência)';
  if (type === 'cashflow') title = 'DFC - Fluxo de Caixa Preditivo (Regime de Caixa)';

  return mapRecursiveReport(title, rootData, periods, currency);
};
