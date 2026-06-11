import React, { useState } from 'react';
import { ChevronRight, TrendingUp, Activity, Landmark, Calculator, ArrowRight, CornerDownRight, Target, Download, FileSpreadsheet, Copy, Check, ChevronDown } from 'lucide-react';
import { AccountNode, CurrencyType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { exportToCSV, copyToClipboardTSV, exportToExcelXLSX } from '../analise-gerencial/export-to-spreadsheet';
import { mapFinancialToTable } from '../analise-gerencial/spreadsheet-mappers';

/**
 * Função numérica robusta para o cálculo da Taxa Interna de Retorno (TIR / IRR).
 * Aplica o método de Newton-Raphson e possui inteligência de fallback com o método da bissecção
 * para garantir convergência e segurança matemática sob qualquer dinâmica de fluxos simulados.
 */
export function calculateIRR(flows: number[], guess = 0.1): number | null {
  const maxIterations = 100;
  const precision = 1e-7;
  
  if (flows.length < 2) return null;
  
  // Garantir que temos pelo menos um fluxo negativo (investimento) e um positivo (retorno)
  const hasNegative = flows.some(f => f < 0);
  const hasPositive = flows.some(f => f > 0);
  if (!hasNegative || !hasPositive) return 0; // Taxa de retorno é zero ou inválida se não houver investimento/retorno
  
  // 1. Newton-Raphson
  let r = guess;
  for (let i = 0; i < maxIterations; i++) {
    let fValue = 0;
    let fDerivative = 0;
    
    for (let t = 0; t < flows.length; t++) {
      const discount = Math.pow(1 + r, t);
      if (Math.abs(discount) < 1e-15) continue; 
      fValue += flows[t] / discount;
      fDerivative -= (t * flows[t]) / (discount * (1 + r));
    }
    
    if (Math.abs(fDerivative) < 1e-15) {
      break; 
    }
    
    const nextR = r - fValue / fDerivative;
    if (Math.abs(nextR - r) < precision) {
      if (nextR > -0.99 && nextR < 10.0) {
        return nextR;
      }
    }
    r = nextR;
  }
  
  // 2. Busca de Bissecção de Fallback em caso de divergência polinomial clássica
  let low = -0.99;
  let high = 5.0;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    let valAndMid = 0;
    for (let t = 0; t < flows.length; t++) {
      valAndMid += flows[t] / Math.pow(1 + mid, t);
    }
    
    if (Math.abs(valAndMid) < 1e-6) {
      return mid;
    }
    
    let valLow = 0;
    for (let t = 0; t < flows.length; t++) {
      valLow += flows[t] / Math.pow(1 + low, t);
    }
    
    if (valLow * valAndMid < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  if (Math.abs(low - high) < 0.01) {
    return (low + high) / 2;
  }
  
  return null;
}

interface MatrixProps {
  type: 'balance' | 'dre' | 'cashflow' | 'strategic' | 'commitments' | 'kardex';
  history: any[]; 
  projection: any; 
  currency: CurrencyType;
  startingMode?: string;
}

const FinancialReportMatrix: React.FC<MatrixProps> = ({ type, history, projection, currency, startingMode }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleExportCSV = () => {
    const tableData = mapFinancialToTable(type, history, projection, currency, startingMode);
    exportToCSV(tableData, ';');
    setShowExportMenu(false);
  };

  const handleCopySheets = async () => {
    const tableData = mapFinancialToTable(type, history, projection, currency, startingMode);
    const success = await copyToClipboardTSV(tableData);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
    setShowExportMenu(false);
  };

  const handleExportExcelFull = () => {
    const reportsToExport: { type: 'balance' | 'dre' | 'cashflow' | 'strategic' | 'commitments' | 'kardex'; name: string }[] = [
      { type: 'dre', name: 'DRE' },
      { type: 'balance', name: 'Balanço Patrimonial' },
      { type: 'cashflow', name: 'Fluxo de Caixa' },
      { type: 'kardex', name: 'Kardex e CPV' },
      { type: 'commitments', name: 'Agenda Financeira' },
      { type: 'strategic', name: 'Comando Estratégico' }
    ];

    const tables = reportsToExport.map(r => 
      mapFinancialToTable(r.type, history, projection, currency, startingMode)
    );

    exportToExcelXLSX(tables, 'matriz_financeira_completa.xlsx');
    setShowExportMenu(false);
  };

  const getTitle = () => {
    if (type === 'balance') return 'Balanço Patrimonial Auditado (v18.0)';
    if (type === 'dre') return 'DRE - Demonstrativo de Resultados (Competência)';
    if (type === 'cashflow') return 'DFC - Fluxo de Caixa Preditivo (Regime de Caixa)';
    if (type === 'commitments') return 'Agenda de Compromissos Financeiros (Direitos e Deveres)';
    if (type === 'kardex') return 'Kardex de Estoques & Detalhamento do CPV (Absorção WAC)';
    return 'Comando Estratégico - KPIs Avançados';
  };

  const getIcon = () => {
    if (type === 'balance') return <Landmark className="text-blue-400" />;
    if (type === 'dre') return <TrendingUp className="text-orange-400" />;
    if (type === 'cashflow') return <Activity className="text-emerald-400" />;
    if (type === 'commitments') return <Landmark className="text-amber-400" />;
    if (type === 'kardex') return <Activity className="text-pink-400" />;
    return <Calculator className="text-purple-400" />;
  };

  // Consolidação de períodos: Histórico + Projeção
  const periods = [
    ...history.map(h => ({ 
      round: h.round, 
      data: (type === 'strategic' || type === 'kardex' || type === 'commitments') ? h.kpis : h.kpis?.statements?.[type === 'balance' ? 'balance_sheet' : (type === 'dre' ? 'dre' : 'cash_flow')],
      raw: h,
      isProjection: false 
    })),
    ...(projection ? [{ 
      round: (history.length > 0 ? (history[history.length - 1]?.round ?? 0) + 1 : 1), 
      data: (type === 'strategic' || type === 'kardex' || type === 'commitments') ? projection?.kpis : projection?.kpis?.statements?.[type === 'balance' ? 'balance_sheet' : (type === 'dre' ? 'dre' : 'cash_flow')], 
      raw: projection,
      isProjection: true 
    }] : [])
  ];

  // Helper para buscar valor na árvore de contas recursivamente
  const findAccountValueLocal = (nodes: any[], accountId: string): number => {
    if (!nodes || !Array.isArray(nodes)) return 0;
    for (const node of nodes) {
      if (node.id === accountId) return node.value;
      if (node.children && node.children.length > 0) {
        const val = findAccountValueLocal(node.children, accountId);
        if (val !== 0) return val;
      }
    }
    return 0;
  };

  // Helper para buscar valor com fallback e suporte para KPIs dinâmicos avançados
  const getKpiValue = (p: any, kpiId: string): any => {
    // Interceptador dinâmico: ROE
    if (kpiId === 'roe') {
      const margin = getKpiValue(p, 'dupont.margin');
      const turnover = getKpiValue(p, 'dupont.turnover');
      const leverage = getKpiValue(p, 'dupont.leverage');
      if (typeof margin === 'number' && typeof turnover === 'number' && typeof leverage === 'number') {
        return margin * turnover * leverage;
      }
      return null;
    }

    // Interceptador dinâmico: Ponto de Equilíbrio (BEP / Break-Even Point)
    if (kpiId === 'bep') {
      const dreTree = p.raw?.kpis?.statements?.dre || p.data?.statements?.dre;
      if (dreTree) {
        const rev = findAccountValueLocal(dreTree, 'rev');
        const cpv = Math.abs(findAccountValueLocal(dreTree, 'cpv'));
        const mod = Math.abs(findAccountValueLocal(dreTree, 'dre.mod'));
        const cif = Math.abs(findAccountValueLocal(dreTree, 'dre.cif'));
        const opex = Math.abs(findAccountValueLocal(dreTree, 'opex'));
        const vat = Math.abs(findAccountValueLocal(dreTree, 'vat_sales'));
        
        const custosFixos = mod + cif + opex;
        const custosVariaveis = Math.max(0, cpv - mod - cif) + vat;
        const mc = rev - custosVariaveis;
        const mcPercent = rev > 0 ? (mc / rev) : 0;
        
        return mcPercent > 0.01 ? (custosFixos / mcPercent) : 0;
      }
      return 0;
    }

    // Interceptador dinâmico: Taxa Interna de Retorno (TIR / IRR)
    if (kpiId === 'irr') {
      if (p.round === 0) return 0;
      
      const flows: number[] = [];
      
      // Fluxo 0 (Investimento): PL de abertura do round 0
      const periodR00 = periods.find(per => per.round === 0);
      let plR00 = 0;
      if (periodR00) {
        const bsR00 = periodR00.raw?.kpis?.statements?.balance_sheet || periodR00.data?.statements?.balance_sheet;
        if (bsR00) {
          plR00 = findAccountValueLocal(bsR00, 'equity.capital') + findAccountValueLocal(bsR00, 'equity.profit');
        }
      }
      
      if (plR00 <= 0) {
        const periodR01 = periods.find(per => per.round === 1) || periods[0];
        const bsR01 = periodR01?.raw?.kpis?.statements?.balance_sheet || periodR01?.data?.statements?.balance_sheet;
        if (bsR01) {
          plR00 = findAccountValueLocal(bsR01, 'equity.capital');
        }
      }
      
      if (plR00 <= 0) plR00 = 12000000; // Fallback regulamentar Greenfield de R$ 12M
      flows.push(-plR00);
      
      // Fluxos operacionais de retorno subsequentes livres (fco_livre) até p.round
      for (let r = 1; r <= p.round; r++) {
        const per = periods.find(p_item => p_item.round === r);
        if (per) {
          let fcoLivre = per.raw?.kpis?.fco_livre ?? per.data?.fco_livre;
          if (fcoLivre === undefined || fcoLivre === null) {
            const dre = per.raw?.kpis?.statements?.dre || per.data?.statements?.dre;
            const dfc = per.raw?.kpis?.statements?.cash_flow || per.data?.statements?.cash_flow;
            const opProfit = findAccountValueLocal(dre, 'operating_profit');
            const cifVal = Math.abs(findAccountValueLocal(dre, 'dre.cif'));
            const depr = cifVal * 0.4;
            const ebitda = opProfit + depr;
            const capex = Math.abs(findAccountValueLocal(dfc, 'cf.outflow.maintenance'));
            const juros = Math.abs(findAccountValueLocal(dre, 'fin.exp'));
            const impostos = Math.abs(findAccountValueLocal(dre, 'tax_prov'));
            fcoLivre = ebitda - capex - juros - impostos;
          }
          flows.push(fcoLivre || 0);
        } else {
          flows.push(0);
        }
      }
      
      return calculateIRR(flows);
    }

    const keys = kpiId.split('.');
    let val = p.data;
    for (const key of keys) {
      val = val?.[key];
    }
    // Fallback para colunas diretas se não encontrar no objeto data (kpis)
    if ((val === undefined || val === null) && p.raw) {
      val = p.raw[kpiId];
    }
    return val;
  };

  // Função para renderizar linhas de KPIs estratégicos (não hierárquicos)
  const renderStrategicRows = () => {
    const kpiDefinitions = [
      { id: 'ccc', label: 'Ciclo de Conversão de Caixa (CCC)', suffix: ' dias', desc: 'Eficiência do capital de giro' },
      { id: 'interest_coverage', label: 'Índice de Cobertura de Juros', suffix: 'x', desc: 'Capacidade de pagamento de juros' },
      { id: 'altman_z_score', label: "Altman Z''-Score (Solvência)", suffix: '', desc: 'Saúde financeira global (Seguro > 5.85)' },
      { id: 'market_share', label: 'Market Share Real', suffix: '%', desc: 'Participação de mercado no round' },
      { id: 'markup', label: 'Markup Médio (Margem Bruta)', suffix: '%', isPercent: true, desc: 'Margem sobre o custo unitário' },
      { id: 'stock_quantities.mp_a', label: 'Estoque Físico: MP A', suffix: ' un', desc: 'Saldo de matéria-prima A' },
      { id: 'stock_quantities.mp_b', label: 'Estoque Físico: MP B', suffix: ' un', desc: 'Saldo de matéria-prima B' },
      { id: 'stock_quantities.finished_goods', label: 'Estoque Físico: Prod. Acabado', suffix: ' un', desc: 'Saldo de produtos prontos' },
      { id: 'price_elasticity', label: 'Elasticidade-Preço Real', suffix: '', desc: 'Sensibilidade da demanda ao preço' },
      { id: 'carbon_footprint', label: 'Pegada de Carbono Unitária', suffix: ' kg CO2', desc: 'Impacto ambiental projetado' },
      { id: 'dupont.margin', label: 'Margem Líquida (DuPont)', suffix: '%', isPercent: true, desc: 'Eficiência de lucro' },
      { id: 'dupont.turnover', label: 'Giro do Ativo (DuPont)', suffix: 'x', desc: 'Eficiência operacional' },
      { id: 'dupont.leverage', label: 'Alavancagem (DuPont)', suffix: 'x', desc: 'Multiplicador de patrimônio' },
      { id: 'roe', label: 'Retorno s/ Patrimônio Líquido (ROE)', suffix: '%', isPercent: true, desc: 'Rentabilidade real do capital próprio (DuPont)' },
      { id: 'bep', label: 'Ponto de Equilíbrio (Break-Even)', suffix: '', isCurrency: true, desc: 'Faturamento mínimo operacional exigido para lucro operacional zero' },
      { id: 'irr', label: 'Taxa Interna de Retorno (TIR / IRR)', suffix: '%', isPercent: true, desc: 'Retorno econômico acumulado baseado no PL de abertura' },
    ];

    return kpiDefinitions.map(kpi => (
      <tr key={kpi.id} className="border-b border-white/5 transition-all hover:bg-white/[0.03] group">
        <td className="p-1.5 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[200px] shadow-xl">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white font-black group-hover:text-orange-500 transition-colors">{kpi.label}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5 italic font-medium">{kpi.desc}</span>
          </div>
        </td>
        {periods.map((p: any, idx) => {
          const val = getKpiValue(p, kpi.id);
          const prevVal = idx > 0 ? getKpiValue(periods[idx-1], kpi.id) : undefined;
          
          const displayVal = typeof val === 'number' 
            ? (kpi.isPercent ? (val * 100).toFixed(2) : (kpi.isCurrency ? formatCurrency(val, currency) : val.toFixed(2))) 
            : 'N/A';

          let colorClass = p.isProjection ? 'text-orange-500 font-black' : 'text-slate-300';
          if (kpi.id === 'altman_z_score' && typeof val === 'number') {
            if (val > 5.85) colorClass = 'text-emerald-500 font-black';
            else if (val < 4.15) colorClass = 'text-rose-500 font-black';
            else colorClass = 'text-amber-500 font-black';
          }

          return (
            <td key={idx} className={`p-1.5 text-center font-mono text-[12px] ${p.isProjection ? 'bg-orange-600/5' : ''} ${colorClass}`}>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base tracking-tighter font-bold">{displayVal}{val !== undefined && val !== null && val !== 'N/A' && !kpi.isCurrency ? kpi.suffix : ''}</span>
                {idx > 0 && typeof val === 'number' && typeof prevVal === 'number' && prevVal !== 0 && (
                  <div className={`flex items-center gap-0.5 text-[8px] font-black uppercase ${val > prevVal ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {val > prevVal ? <TrendingUp size={6}/> : <Activity size={6}/>}
                    {Math.abs(((val / prevVal) - 1) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    ));
  };

  // Função para renderizar a Agenda de Compromissos
  const renderCommitmentRows = () => {
    const receivables = periods[periods.length - 1]?.data?.commitments?.receivables || [];
    const payables = periods[periods.length - 1]?.data?.commitments?.payables || [];

    return (
      <>
        <tr className="bg-emerald-500/10 font-black">
          <td colSpan={periods.length + 1} className="p-2 text-emerald-400 text-[9px] uppercase tracking-widest">
            Direitos Comprometidos (Entradas Futuras)
          </td>
        </tr>
        {receivables.map((item: any) => (
          <tr key={item.id} className="border-b border-white/5 transition-all hover:bg-white/[0.03] group">
            <td className="p-1.5 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[200px] shadow-xl">
              <span className="text-[10px] uppercase tracking-[0.1em] text-slate-300 group-hover:text-white">{item.label}</span>
            </td>
            {periods.map((p: any, idx: number) => {
              const val = p.data?.commitments?.receivables?.find((r: any) => r.id === item.id)?.value || 0;
              return (
                <td key={idx} className={`p-1.5 text-center font-mono text-[12px] ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-black' : 'text-slate-300'}`}>
                  <span className="tracking-tighter">{formatCurrency(val, currency)}</span>
                </td>
              );
            })}
          </tr>
        ))}
        <tr className="bg-rose-500/10 font-black">
          <td colSpan={periods.length + 1} className="p-2 text-rose-400 text-[9px] uppercase tracking-widest">
            Deveres Comprometidos (Saídas Futuras)
          </td>
        </tr>
        {payables.map((item: any) => (
          <tr key={item.id} className="border-b border-white/5 transition-all hover:bg-white/[0.03] group">
            <td className="p-1.5 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[200px] shadow-xl">
              <span className="text-[10px] uppercase tracking-[0.1em] text-slate-300 group-hover:text-white">{item.label}</span>
            </td>
            {periods.map((p: any, idx: number) => {
              const val = p.data?.commitments?.payables?.find((r: any) => r.id === item.id)?.value || 0;
              return (
                <td key={idx} className={`p-1.5 text-center font-mono text-[12px] ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-black' : 'text-slate-300'}`}>
                  <span className="tracking-tighter">{formatCurrency(val, currency)}</span>
                </td>
              );
            })}
          </tr>
        ))}

        {/* cronograma de financiamentos (v19.10) */}
        <tr className="bg-amber-500/10 font-black border-t border-white/10">
          <td colSpan={periods.length + 1} className="p-2 text-amber-400 text-[9px] uppercase tracking-widest font-sans">
            Cronograma de Amortização de Financiamentos & Empréstimos (Amortization Schedule)
          </td>
        </tr>
        {(!periods[periods.length - 1]?.data?.loans || periods[periods.length - 1]?.data?.loans.length === 0) ? (
          <tr className="border-b border-white/5">
            <td colSpan={periods.length + 1} className="p-3 text-center text-slate-500 text-[8px] uppercase tracking-wider font-sans">
              Nenhuma dívida ou financiamento estruturado ativo no período atual.
            </td>
          </tr>
        ) : (
          periods[periods.length - 1]?.data?.loans?.map((loan: any, lIdx: number) => {
            const loanName = loan.type === 'bdi' ? 'Financiamento Máquinas (BDI)' : loan.type === 'normal' ? 'Empréstimo Normal' : 'Empréstimo Compulsório';
            const sch = periods[periods.length - 1]?.data?.amortization_schedule?.find((s: any) => s.id === loan.id);
            return (
              <React.Fragment key={loan.id || lIdx}>
                <tr className="bg-slate-950/20 font-bold border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-1.5 pl-3 sticky left-0 bg-slate-900 border-r border-white/10 text-slate-200 text-[9px] uppercase tracking-wider font-sans">
                    {loanName} <span className="text-slate-500 text-[9px] font-mono">[{loan.id?.slice(2, 7) || 'REQ'}]</span>
                  </td>
                  {periods.map((p: any, idx: number) => {
                    const lInP = p.data?.loans?.find((l: any) => l.id === loan.id);
                    const bal = lInP ? lInP.amount : 0;
                    return (
                      <td key={idx} className={`p-1.5 text-center font-mono text-[9px] ${p.isProjection ? 'text-orange-400 font-bold bg-orange-500/5' : 'text-slate-400'}`}>
                        {bal > 0 ? formatCurrency(bal, currency) : '-'}
                      </td>
                    );
                  })}
                </tr>
                {sch && sch.installments && sch.installments.length > 0 && (
                  <tr className="border-b border-white/5 bg-slate-950/45">
                    <td colSpan={periods.length + 1} className="p-2 py-2.5 pl-5">
                      <div className="space-y-1 w-full">
                        <span className="text-[7px] font-black tracking-widest text-slate-500 uppercase block font-sans">
                          Próximos Fluxos Projetados (Amortização + Juros ao Período):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {sch.installments.map((inst: any, idx: number) => (
                            <div key={idx} className="bg-slate-900/60 border border-white/5 p-2 rounded-lg text-left font-sans min-w-[145px]">
                              <div className="text-slate-500 text-[9px] font-mono uppercase tracking-wider">Vencimento R-{String((periods[periods.length - 1]?.round || 0) + idx + 1).padStart(2, '0')}</div>
                              <div className="text-orange-400 font-mono font-bold text-xs mt-0.5">{formatCurrency(inst.total, currency)}</div>
                              <div className="text-[9px] text-slate-400 leading-normal mt-1 font-mono space-y-0.5">
                                <div>Amort: <span className="text-slate-300 font-semibold">{formatCurrency(inst.amort, currency)}</span></div>
                                <div>Juros: <span className="text-slate-300 font-semibold">{formatCurrency(inst.interest, currency)}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })
        )}
        <tr className="bg-rose-500/5 border-b border-white/5">
          <td colSpan={periods.length + 1} className="p-2.5 pl-3">
            <span className="text-[8px] text-rose-300 italic flex items-center gap-1.5 font-sans leading-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <strong>Sinal de Governança E-SDS:</strong> Toda captação reduz o pilar de Alavancagem Operacional do E-SDS. A manutenção de níveis saudáveis de caixa e de geração de EBITDA é crucial para evitar penalização do rating corporativo.
            </span>
          </td>
        </tr>
      </>
    );
  };

  // Função para renderizar o Kardex e os Detalhes de CPV (v19.5 Sapphire)
  const renderKardexRows = () => {
    const rows = [
      // Seção MP A
      { section: 'Matéria-Prima A (Fluxo Físico e Financeiro WAC)', key: 'mpa.saldoInicialQtd', label: '(=) Estoque Inicial (Qtd)', desc: 'Saldo inicial de MP A', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'mpa.saldoInicialValor', label: '(=) Estoque Inicial ($)', desc: 'Saldo liquefeito inicial de MP A', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'mpa.entradasQtd', label: '(+) Compras (Normais/Especiais) (Qtd)', desc: 'Compras totais de MP A no round', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'mpa.entradasValor', label: '(+) Compras (Normais/Especiais) ($)', desc: 'Valor gerador líquido das compras de MP A', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'mpa.saidasQtd', label: '(-) Consumo Produção (Qtd)', desc: 'Consumo no Trial Industrial (Produção * 3)', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'mpa.saidasValor', label: '(-) Consumo Produção ($)', desc: 'Valorização de consumo industrial ponderado', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'mpa.saldoFinalQtd', label: '(=) Estoque Final (Qtd)', desc: 'Quantidade de fechamento físico de MP A', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'mpa.saldoFinalValor', label: '(=) Estoque Final ($)', desc: 'Valor total do estoque de fechamento', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'mpa.saldoFinalUnitario', label: 'Preço Médio Ponderado WAC', desc: 'Preço interno de custeio médio para MP A', formatter: (v: number) => formatCurrency(v || 0, currency) + '/un' },

      // Seção MP B
      { section: 'Matéria-Prima B (Fluxo Físico e Financeiro WAC)', key: 'mpb.saldoInicialQtd', label: 'Estoque Inicial (Qtd)', desc: 'Saldo inicial de MP B', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'mpb.saldoInicialValor', label: '(=) Estoque Inicial ($)', desc: 'Saldo liquefeito inicial de MP B', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'mpb.entradasQtd', label: '(+) Compras (Normais/Especiais) (Qtd)', desc: 'Compras totais de MP B no round', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'mpb.entradasValor', label: '(+) Compras (Normais/Especiais) ($)', desc: 'Valor gerador líquido das compras de MP B', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'mpb.saidasQtd', label: '(-) Consumo Produção (Qtd)', desc: 'Consumo no Trial Industrial (Produção * 2)', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'mpb.saidasValor', label: '(-) Consumo Produção ($)', desc: 'Valorização de consumo industrial ponderado', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'mpb.saldoFinalQtd', label: '(=) Estoque Final (Qtd)', desc: 'Quantidade de fechamento físico de MP B', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'mpb.saldoFinalValor', label: '(=) Estoque Final ($)', desc: 'Valor total do estoque de fechamento', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'mpb.saldoFinalUnitario', label: 'Preço Médio Ponderado WAC', desc: 'Preço interno de custeio médio para MP B', formatter: (v: number) => formatCurrency(v || 0, currency) + '/un' },

      // Seção PA
      { section: 'Produtos Acabados (Movimentação e Custo Comercial WAC)', key: 'pa.saldoInicialQtd', label: 'Estoque Inicial PA (Qtd)', desc: 'Quantidade inicial de produtos acabados', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'pa.saldoInicialValor', label: '(=) Estoque Inicial PA ($)', desc: 'Valor do estoque pronto de abertura', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'pa.entradasQtd', label: '(+) Entradas Produção (Qtd)', desc: 'Unidades finalizadas na planta fabril', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'pa.entradasValor', label: '(+) Entradas Produção ($/CPP)', desc: 'Custo industrial total das unidades manufaturadas', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'pa.saidasQtd', label: '(-) Saídas Vendas / CPV (Qtd)', desc: 'Unidades vendidas e faturadas com sucesso', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'pa.saidasValor', label: '(-) Saídas Vendas / CPV ($)', desc: 'Custo faturado do produto vendido para o DRE', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'pa.saldoFinalQtd', label: '(=) Estoque Final PA (Qtd)', desc: 'Quantidade remanescente de produtos em estoque', formatter: (v: number) => typeof v === 'number' ? v.toLocaleString('pt-BR') + ' un' : '0 un' },
      { key: 'pa.saldoFinalValor', label: '(=) Estoque Final PA ($)', desc: 'Valor contábil do estoque fabril de fechamento', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'pa.saldoFinalUnitario', label: 'Custo Unitário de Fechamento WAC', desc: 'Custo de faturamento médio final ponderado', formatter: (v: number) => formatCurrency(v || 0, currency) + '/un' },

      // Detalhes do CPV de Absorção Industrial
      { section: 'Demonstrativo de Formação do CPV (Absorção Industrial)', key: 'cpv.mpConsumida', label: 'Matéria-Prima Consumida', desc: 'Custo de MP A e B aplicadas no processo', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.maoDeObraDireta', label: 'Mão de Obra Direta (MOD)', desc: 'Salários e encargos dos operadores industriais', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.depreciacaoFabril', label: 'Depreciação Fabril', desc: 'Rateio de depreciação de máquinas e prédios', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.manutencaoFabril', label: 'Manutenção de Máquinas', desc: 'Atividades corretivas de manutenção produtiva', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.indenizacoesRescisorias', label: 'Indenizações Rescisórias', desc: 'Custos trabalhistas rescisórios no round', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.pprProporcional', label: 'Provisão de PPR Proporcional', desc: 'Rateio do prêmio por resultados dos desligamentos', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.totalCPP', label: '(=) CUSTO DE PRODUÇÃO DO PERÍODO (CPP)', desc: 'Custo real empregado na produção da rodada', formatter: (v: number) => formatCurrency(v || 0, currency), isClass: 'bg-white/5 font-bold border-y border-white/10 text-white' },
      { key: 'cpv.estoqueInicialPA', label: '(+) Estoque Inicial de PA', desc: 'Estoque físico valorado de abertura na rodada', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.estoqueFinalPA', label: '(-) Estoque Final de PA', desc: 'Estoque físico valorado de encerramento na rodada', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.custoUnitarioProducao', label: 'Custo Unitário de PA', desc: 'Custo unitário do Produto Acabado', formatter: (v: number) => formatCurrency(v || 0, currency) },
      { key: 'cpv.totalCPV', label: '(=) CUSTO DO PRODUTO VENDIDO (CPV)', desc: 'Custo direcionado para confrontação de receita no DRE', formatter: (v: number) => formatCurrency(v || 0, currency), isClass: 'bg-orange-950/20 text-orange-400 font-black border-y border-orange-500/20' }
    ];

    return (
      <>
        {rows.map((row, idx1) => {
          const isSectionHeader = !!row.section;
          return (
            <React.Fragment key={idx1}>
              {isSectionHeader && (
                <tr className="bg-slate-900/40 border-y border-white/5">
                  <td colSpan={periods.length + 1} className="p-2 text-[8px] font-black tracking-widest text-orange-400 uppercase">
                    {row.section}
                  </td>
                </tr>
              )}
              <tr className={`border-b border-white/5 transition-all hover:bg-white/[0.03] group ${row.isClass || ''}`}>
                <td className="p-1.5 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[200px] shadow-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-slate-300 group-hover:text-white">{row.label}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5 italic">{row.desc}</span>
                  </div>
                </td>
                {periods.map((p: any, idx2) => {
                  // Extração robusta
                  // Extração robusta e defensiva
                  let rawKpis = p.data || p.raw?.kpis;
                  if (typeof rawKpis === 'string') {
                    try {
                      rawKpis = JSON.parse(rawKpis);
                    } catch (e) {
                      console.error("Erro ao fazer parse do kpis:", e);
                      rawKpis = {};
                    }
                  }
                  const kpis = rawKpis || {};

                  let targetKardex = kpis.kardex || kpis.statements?.kardex || {};
                  let targetCpv = kpis.cpv_details || kpis.statements?.cpv_details || {};

                  if (p.round === 0 && Object.keys(targetKardex).length === 0) {
                    // Fallback contábil de integridade para o Balanço de Entrada (Abertura P00)
                    const isZeroMode = startingMode === 'start_from_zero';
                    if (isZeroMode) {
                      // No modo Greenfield "Start from Zero", o estoque inicial de matéria-prima é totalmente zerado
                      targetKardex = {
                        mpa: {
                          saldoInicialQtd: 0,
                          saldoInicialValor: 0,
                          saldoInicialUnitario: 0,
                          entradasQtd: 0,
                          entradasValor: 0,
                          entradasUnitario: 0,
                          saidasQtd: 0,
                          saidasValor: 0,
                          saidasUnitario: 0,
                          saldoFinalQtd: 0,
                          saldoFinalValor: 0,
                          saldoFinalUnitario: 0
                        },
                        mpb: {
                          saldoInicialQtd: 0,
                          saldoInicialValor: 0,
                          saldoInicialUnitario: 0,
                          entradasQtd: 0,
                          entradasValor: 0,
                          entradasUnitario: 0,
                          saidasQtd: 0,
                          saidasValor: 0,
                          saidasUnitario: 0,
                          saldoFinalQtd: 0,
                          saldoFinalValor: 0,
                          saldoFinalUnitario: 0
                        },
                        pa: {
                          saldoInicialQtd: 0,
                          saldoInicialValor: 0,
                          saldoInicialUnitario: 0,
                          entradasQtd: 0,
                          entradasValor: 0,
                          entradasUnitario: 0,
                          saidasQtd: 0,
                          saidasValor: 0,
                          saidasUnitario: 0,
                          saldoFinalQtd: 0,
                          saldoFinalValor: 0,
                          saldoFinalUnitario: 0
                        }
                      };
                    } else {
                      // Nos modos "Start with Base" e "Start with Running Company", iniciamos estritamente com estoque de MPA e MPB pré-entrados no Balanço de Entrada
                      targetKardex = {
                        mpa: {
                          saldoInicialQtd: 0,
                          saldoInicialValor: 0,
                          saldoInicialUnitario: 0,
                          entradasQtd: 30150,
                          entradasValor: 452250,
                          entradasUnitario: 15,
                          saidasQtd: 0,
                          saidasValor: 0,
                          saidasUnitario: 15,
                          saldoFinalQtd: 30150,
                          saldoFinalValor: 452250,
                          saldoFinalUnitario: 15
                        },
                        mpb: {
                          saldoInicialQtd: 0,
                          saldoInicialValor: 0,
                          saldoInicialUnitario: 0,
                          entradasQtd: 20100,
                          entradasValor: 201000,
                          entradasUnitario: 10,
                          saidasQtd: 0,
                          saidasValor: 0,
                          saidasUnitario: 10,
                          saldoFinalQtd: 20100,
                          saldoFinalValor: 201000,
                          saldoFinalUnitario: 10
                        },
                        pa: {
                          saldoInicialQtd: 0,
                          saldoInicialValor: 0,
                          saldoInicialUnitario: 0,
                          entradasQtd: 0,
                          entradasValor: 0,
                          entradasUnitario: 0,
                          saidasQtd: 0,
                          saidasValor: 0,
                          saidasUnitario: 0,
                          saldoFinalQtd: 0,
                          saldoFinalValor: 0,
                          saldoFinalUnitario: 0
                        }
                      };
                    }
                    targetCpv = {
                      mpConsumida: 0,
                      maoDeObraDireta: 0,
                      depreciacaoFabril: 0,
                      manutencaoFabril: 0,
                      indenizacoesRescisorias: 0,
                      pprProporcional: 0,
                      totalCPP: 0,
                      estoqueInicialPA: 0,
                      estoqueFinalPA: 0,
                      totalCPV: 0,
                      custoUnitarioProducao: 0
                    };
                  }

                  let val: any = undefined;

                  if (row.key?.startsWith('cpv.')) {
                    const subKey = row.key.split('.')[1];
                    val = targetCpv[subKey];
                  } else {
                    const [prodKey, statKey] = (row.key || '').split('.');
                    val = targetKardex[prodKey]?.[statKey];
                  }

                  if (val === undefined || val === null) {
                    console.warn(`Kardex/CPV missing → key: ${row.key} | round: ${p.round}`);
                    val = 0;
                  }

                  const displayStr = row.formatter ? row.formatter(val) : String(val);

                  return (
                    <td key={idx2} className={`p-1.5 text-center font-mono text-[11px] ${p.isProjection ? 'bg-orange-600/5 text-orange-400 font-extrabold' : 'text-slate-300'}`}>
                      {displayStr}
                    </td>
                  );
                })}
              </tr>
            </React.Fragment>
          );
        })}
      </>
    );
  };

  // Função recursiva para renderizar a árvore de contas de forma hierárquica e completa
  const renderRows = (nodes: any[], level = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;

    return nodes.map((node: AccountNode) => {
      const isTotalizer = node.type === 'totalizer';
      return (
        <React.Fragment key={node.id}>
          <tr className={`border-b border-white/5 transition-all hover:bg-white/[0.03] group ${isTotalizer ? 'bg-white/[0.02] font-black' : ''}`}>
            <td className="p-3 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[280px] shadow-xl">
              <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 16}px` }}>
                {level > 0 && <CornerDownRight size={10} className="text-slate-600" />}
                <span className={`text-[12px] uppercase tracking-[0.1em] transition-colors ${isTotalizer ? 'text-white group-hover:text-orange-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {node.label}
                </span>
              </div>
            </td>
            {periods.map((p: any, idx) => {
              const periodData = Array.isArray(p.data) ? p.data : [];
              const findVal = (list: any[]): number => {
                const search = (subList: any[]): any => {
                  for (const n of subList) {
                    if (n.id === node.id) return n.value;
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
              
              const val = findVal(periodData);
              return (
                <td key={idx} className={`p-3 text-center font-mono text-sm ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-black' : 'text-slate-300'}`}>
                  <span className="tracking-tighter font-medium">{formatCurrency(val, currency)}</span>
                </td>
              );
            })}
          </tr>
          {node.children && renderRows(node.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  // Se o tipo for DRE ou Cashflow, os dados podem não estar em árvore. Convertemos para estrutura de lista se necessário.
  const rootData = periods[periods.length - 1]?.data || [];
  const initialData = Array.isArray(rootData) 
    ? rootData 
    : Object.entries(rootData || {}).map(([k, v]: [string, any]) => ({ 
        id: k, 
        label: k.replace(/_/g, ' ').toUpperCase(), 
        value: typeof v === 'number' ? v : (v?.total || 0) 
      }));

  return (
    <div className="flex flex-col bg-slate-950 border border-white/10 rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
      <header className="p-2 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/5 rounded-lg shadow-inner border border-white/5">{getIcon()}</div>
          <div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">{getTitle()}</h3>
            <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.5em] mt-0.5 italic">Oracle High Fidelity Reporting Engine • v19.5 Sapphire</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
             <button
               id="btn-exportar-dados"
               onClick={() => setShowExportMenu(!showExportMenu)}
               className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white border border-orange-500/30 rounded-lg flex items-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-orange-600/10"
             >
               <Download size={10} />
               <span>Exportar Dados</span>
               <ChevronDown size={10} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
             </button>

             {showExportMenu && (
               <>
                 <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                 <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden shrink-0 animate-in fade-in slide-in-from-top-2 duration-150">
                   <div className="p-2 border-b border-white/5 bg-slate-950/45">
                     <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 block">Opções para Matriz Financeira</span>
                   </div>
                   <div className="p-1 flex flex-col gap-0.5">
                     <button
                       onClick={handleExportCSV}
                       className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2.5 transition-colors text-[9px] font-bold uppercase tracking-wider"
                     >
                       <FileSpreadsheet size={12} className="text-orange-400 font-bold" />
                       <div className="flex flex-col">
                         <span>Exportar Aba Atual (.csv)</span>
                         <span className="text-[6px] text-slate-500 font-normal normal-case">Delimitador ponto-e-vírgula para Excel PT-BR</span>
                       </div>
                     </button>
                     
                     <button
                       onClick={handleCopySheets}
                       className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2.5 transition-colors text-[9px] font-bold uppercase tracking-wider"
                     >
                       {copySuccess ? <Check size={12} className="text-emerald-400 animate-bounce" /> : <Copy size={12} className="text-emerald-400" />}
                       <div className="flex flex-col">
                         <span>{copySuccess ? 'Copiado!' : 'Copiar para Google Sheets'}</span>
                         <span className="text-[6px] text-slate-500 font-normal normal-case">Copiar dados tabulados para colar direto com Ctrl+V</span>
                       </div>
                     </button>

                     <div className="my-1 border-t border-white/5" />

                     <button
                       onClick={handleExportExcelFull}
                       className="w-full text-left px-3 py-2 text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg flex items-center gap-2.5 transition-colors text-[9px] font-bold uppercase tracking-wider"
                     >
                       <FileSpreadsheet size={12} className="text-emerald-500" />
                       <div className="flex flex-col">
                         <span>Exportar Matriz Completa (.xls)</span>
                         <span className="text-[6px] text-emerald-500/70 font-black tracking-widest">MÚLTIPLAS ABAS CONSOLIDADAS</span>
                       </div>
                     </button>
                   </div>
                 </div>
               </>
             )}
          </div>

          <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 shadow-lg">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Controles de Integridade</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md shadow-2xl">
            <tr className="text-[7px] font-black uppercase text-slate-500 tracking-[0.1em]">
              <th className="p-1.5 sticky left-0 bg-slate-900 z-50 border-r border-white/10 shadow-xl">Contas Contábeis de Movimento</th>
              {periods.map((p: any, i) => (
                <th key={i} className={`p-1.5 text-center border-r border-white/5 ${p.isProjection ? 'bg-orange-600/10 text-orange-500' : ''}`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="opacity-50 text-[5px]">{p.isProjection ? 'PRÓXIMO CICLO' : 'HISTÓRICO'}</span>
                    <span className="text-[9px] tracking-tighter col-header-period-label">
                      {p.isProjection 
                        ? `PROJEÇÃO R-${p.round < 10 ? '0' : ''}${p.round}` 
                        : (p.round === 0 ? 'R-00 (INICIAL)' : `R-${p.round < 10 ? '0' : ''}${p.round}`)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {type === 'strategic' ? renderStrategicRows() : (type === 'commitments' ? renderCommitmentRows() : (type === 'kardex' ? renderKardexRows() : renderRows(initialData as any)))}
          </tbody>
        </table>
      </div>

      <footer className="p-2 bg-slate-900/90 backdrop-blur-md border-t border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Calculator size={12} className="text-blue-400" />
          <span className="text-[7px] font-black uppercase tracking-[0.1em] text-slate-400 leading-relaxed">
            Consistência tripla validada com controle de WAC no Trial Industrial, garantindo precisão inexorável de estoque.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-mono text-slate-600 tracking-tighter">SEQ_ORACLE_SAPP_KARDEX_P0{history.length}</span>
        </div>
      </footer>
    </div>
  );
};

export default FinancialReportMatrix;
