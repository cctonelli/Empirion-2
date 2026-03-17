
import React from 'react';
import { ChevronRight, TrendingUp, Activity, Landmark, Calculator, ArrowRight, CornerDownRight } from 'lucide-react';
import { AccountNode, CurrencyType } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MatrixProps {
  type: 'balance' | 'dre' | 'cashflow' | 'strategic' | 'commitments';
  history: any[]; 
  projection: any; 
  currency: CurrencyType;
}

const FinancialReportMatrix: React.FC<MatrixProps> = ({ type, history, projection, currency }) => {
  const getTitle = () => {
    if (type === 'balance') return 'Balanço Patrimonial Auditado (v18.0)';
    if (type === 'dre') return 'DRE - Demonstrativo de Resultados (Competência)';
    if (type === 'cashflow') return 'DFC - Fluxo de Caixa Preditivo (Regime de Caixa)';
    if (type === 'commitments') return 'Agenda de Compromissos Financeiros (Direitos e Deveres)';
    return 'Comando Estratégico - KPIs Avançados';
  };

  const getIcon = () => {
    if (type === 'balance') return <Landmark className="text-blue-400" />;
    if (type === 'dre') return <TrendingUp className="text-orange-400" />;
    if (type === 'cashflow') return <Activity className="text-emerald-400" />;
    if (type === 'commitments') return <Landmark className="text-amber-400" />;
    return <Calculator className="text-purple-400" />;
  };

  // Consolidação de períodos: Histórico + Projeção
  const periods = [
    ...history.map(h => ({ 
      round: h.round, 
      data: type === 'strategic' ? h.kpis : h.kpis?.statements?.[type === 'balance' ? 'balance_sheet' : (type === 'dre' ? 'dre' : 'cash_flow')],
      raw: h,
      isProjection: false 
    })),
    { 
      round: 'PROJ (T+1)', 
      data: type === 'strategic' ? projection?.kpis : projection?.kpis?.statements?.[type === 'balance' ? 'balance_sheet' : (type === 'dre' ? 'dre' : 'cash_flow')], 
      raw: projection,
      isProjection: true 
    }
  ];

  // Helper para buscar valor com fallback
  const getKpiValue = (p: any, kpiId: string) => {
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
    ];

    return kpiDefinitions.map(kpi => (
      <tr key={kpi.id} className="border-b border-white/5 transition-all hover:bg-white/[0.03] group">
        <td className="p-1.5 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[200px] shadow-xl">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.15em] text-white font-black group-hover:text-orange-500 transition-colors">{kpi.label}</span>
            <span className="text-[7px] text-slate-500 uppercase tracking-widest mt-0.5 italic font-medium">{kpi.desc}</span>
          </div>
        </td>
        {periods.map((p: any, idx) => {
          const val = getKpiValue(p, kpi.id);
          const prevVal = idx > 0 ? getKpiValue(periods[idx-1], kpi.id) : undefined;
          
          const displayVal = typeof val === 'number' 
            ? (kpi.isPercent ? (val * 100).toFixed(2) : val.toFixed(2)) 
            : 'N/A';

          let colorClass = p.isProjection ? 'text-orange-500 font-black' : 'text-slate-300';
          if (kpi.id === 'altman_z_score' && typeof val === 'number') {
            if (val > 5.85) colorClass = 'text-emerald-500 font-black';
            else if (val < 4.15) colorClass = 'text-rose-500 font-black';
            else colorClass = 'text-amber-500 font-black';
          }

          return (
            <td key={idx} className={`p-1.5 text-center font-mono text-[10px] ${p.isProjection ? 'bg-orange-600/5' : ''} ${colorClass}`}>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm tracking-tighter">{displayVal}{val !== undefined && val !== null && val !== 'N/A' ? kpi.suffix : ''}</span>
                {idx > 0 && typeof val === 'number' && typeof prevVal === 'number' && prevVal !== 0 && (
                  <div className={`flex items-center gap-0.5 text-[6px] font-black uppercase ${val > prevVal ? 'text-emerald-500' : 'text-rose-500'}`}>
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
              <span className="text-[8px] uppercase tracking-[0.1em] text-slate-300 group-hover:text-white">{item.label}</span>
            </td>
            {periods.map((p: any, idx: number) => {
              const val = p.data?.commitments?.receivables?.find((r: any) => r.id === item.id)?.value || 0;
              return (
                <td key={idx} className={`p-1.5 text-center font-mono text-[10px] ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-black' : 'text-slate-300'}`}>
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
              <span className="text-[8px] uppercase tracking-[0.1em] text-slate-300 group-hover:text-white">{item.label}</span>
            </td>
            {periods.map((p: any, idx: number) => {
              const val = p.data?.commitments?.payables?.find((r: any) => r.id === item.id)?.value || 0;
              return (
                <td key={idx} className={`p-1.5 text-center font-mono text-[10px] ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-black' : 'text-slate-300'}`}>
                  <span className="tracking-tighter">{formatCurrency(val, currency)}</span>
                </td>
              );
            })}
          </tr>
        ))}
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
                <span className={`text-[10px] uppercase tracking-[0.1em] transition-colors ${isTotalizer ? 'text-white group-hover:text-orange-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {node.label}
                </span>
              </div>
            </td>
            {periods.map((p: any, idx) => {
              const periodData = Array.isArray(p.data) ? p.data : [];
              const findVal = (list: any[]): number => {
                for (const n of list) {
                  if (n.id === node.id) return n.value;
                  if (n.children) {
                    const v = findVal(n.children);
                    if (v !== undefined) return v;
                  }
                }
                return 0;
              };
              
              const val = findVal(periodData);
              return (
                <td key={idx} className={`p-3 text-center font-mono text-xs ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-black' : 'text-slate-300'}`}>
                  <span className="tracking-tighter">{formatCurrency(val, currency)}</span>
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
            <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.5em] mt-0.5 italic">Oracle High Fidelity Reporting Engine • v18.5</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 shadow-lg">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Dados Auditados</span>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md shadow-2xl">
            <tr className="text-[7px] font-black uppercase text-slate-500 tracking-[0.1em]">
              <th className="p-1.5 sticky left-0 bg-slate-900 z-50 border-r border-white/10 shadow-xl">Contas Contábeis</th>
              {periods.map((p: any, i) => (
                <th key={i} className={`p-1.5 text-center border-r border-white/5 ${p.isProjection ? 'bg-orange-600/10 text-orange-500' : ''}`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="opacity-50 text-[5px]">{p.isProjection ? 'PRÓXIMO CICLO' : 'HISTÓRICO'}</span>
                    <span className="text-[9px] tracking-tighter">{p.isProjection ? 'PROJEÇÃO T+1' : `ROUND 0${p.round}`}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {type === 'strategic' ? renderStrategicRows() : (type === 'commitments' ? renderCommitmentRows() : renderRows(initialData as any))}
          </tbody>
        </table>
      </div>

      <footer className="p-2 bg-slate-900/90 backdrop-blur-md border-t border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Calculator size={12} className="text-blue-400" />
          <span className="text-[7px] font-black uppercase tracking-[0.1em] text-slate-400 leading-relaxed">
            Projeções v18.5 baseadas em elasticidade-preço regional, PMP/PMR decidido e curvas de aprendizado industrial.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-mono text-slate-600 tracking-tighter">SEQ_NODE_ORACLE_REPORT_VALIDATED_P0{history.length}</span>
        </div>
      </footer>
    </div>
  );
};

export default FinancialReportMatrix;
