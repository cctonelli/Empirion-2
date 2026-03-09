
import React from 'react';
import { ChevronRight, TrendingUp, Activity, Landmark, Calculator, ArrowRight, CornerDownRight } from 'lucide-react';
import { AccountNode, CurrencyType } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MatrixProps {
  type: 'balance' | 'dre' | 'cashflow' | 'strategic';
  history: any[]; 
  projection: any; 
  currency: CurrencyType;
}

const FinancialReportMatrix: React.FC<MatrixProps> = ({ type, history, projection, currency }) => {
  const getTitle = () => {
    if (type === 'balance') return 'Balanço Patrimonial Auditado (v18.0)';
    if (type === 'dre') return 'DRE - Demonstrativo de Resultados (Competência)';
    if (type === 'cashflow') return 'DFC - Fluxo de Caixa Preditivo (Regime de Caixa)';
    return 'Comando Estratégico - KPIs Avançados';
  };

  const getIcon = () => {
    if (type === 'balance') return <Landmark className="text-blue-400" />;
    if (type === 'dre') return <TrendingUp className="text-orange-400" />;
    if (type === 'cashflow') return <Activity className="text-emerald-400" />;
    return <Calculator className="text-purple-400" />;
  };

  // Consolidação de períodos: Histórico + Projeção
  const periods = [
    ...history.map(h => ({ 
      round: h.round, 
      data: type === 'strategic' ? h.kpis : h.kpis?.statements?.[type === 'balance' ? 'balance_sheet' : (type === 'dre' ? 'dre' : 'cash_flow')],
      isProjection: false 
    })),
    { 
      round: 'PROJ (T+1)', 
      data: type === 'strategic' ? projection?.kpis : projection?.statements?.[type === 'balance' ? 'balance_sheet' : (type === 'dre' ? 'dre' : 'cash_flow')], 
      isProjection: true 
    }
  ];

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
        <td className="p-6 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[350px] shadow-xl">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.15em] text-white font-black group-hover:text-orange-500 transition-colors">{kpi.label}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-2 italic font-medium">{kpi.desc}</span>
          </div>
        </td>
        {periods.map((p: any, idx) => {
          const keys = kpi.id.split('.');
          let val = p.data;
          for (const key of keys) {
            val = val?.[key];
          }
          
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
            <td key={idx} className={`p-6 text-center font-mono text-sm ${p.isProjection ? 'bg-orange-600/5' : ''} ${colorClass}`}>
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg tracking-tighter">{displayVal}{val !== undefined ? kpi.suffix : ''}</span>
                {idx > 0 && typeof val === 'number' && typeof periods[idx-1].data?.[kpi.id] === 'number' && (
                  <div className={`flex items-center gap-1 text-[8px] font-black uppercase ${val > periods[idx-1].data[kpi.id] ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {val > periods[idx-1].data[kpi.id] ? <TrendingUp size={8}/> : <Activity size={8}/>}
                    {Math.abs(((val / periods[idx-1].data[kpi.id]) - 1) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    ));
  };

  // Função recursiva para renderizar a árvore de contas de forma hierárquica e completa
  const renderRows = (nodes: any[], level = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;

    return nodes.map((node: AccountNode) => {
      const isTotalizer = node.type === 'totalizer';
      return (
        <React.Fragment key={node.id}>
          <tr className={`border-b border-white/5 transition-all hover:bg-white/[0.03] group ${isTotalizer ? 'bg-white/[0.02] font-black' : ''}`}>
            <td className="p-5 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[350px] shadow-xl">
              <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 24}px` }}>
                {level > 0 && <CornerDownRight size={12} className="text-slate-600" />}
                <span className={`text-[11px] uppercase tracking-[0.1em] transition-colors ${isTotalizer ? 'text-white group-hover:text-orange-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
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
                <td key={idx} className={`p-5 text-center font-mono text-sm ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-black' : 'text-slate-300'}`}>
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
    <div className="flex flex-col h-full bg-slate-950 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
      <header className="p-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="p-5 bg-white/5 rounded-3xl shadow-inner border border-white/5">{getIcon()}</div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{getTitle()}</h3>
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.5em] mt-3 italic">Oracle High Fidelity Reporting Engine • v18.5</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 shadow-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Dados Auditados</span>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md shadow-2xl">
            <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
              <th className="p-6 sticky left-0 bg-slate-900 z-50 border-r border-white/10 shadow-xl">Contas Contábeis</th>
              {periods.map((p: any, i) => (
                <th key={i} className={`p-6 text-center border-r border-white/5 ${p.isProjection ? 'bg-orange-600/10 text-orange-500' : ''}`}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="opacity-50 text-[8px]">{p.isProjection ? 'PRÓXIMO CICLO' : 'HISTÓRICO'}</span>
                    <span className="text-sm tracking-tighter">{p.isProjection ? 'PROJEÇÃO T+1' : `ROUND 0${p.round}`}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {type === 'strategic' ? renderStrategicRows() : renderRows(initialData as any)}
          </tbody>
        </table>
      </div>

      <footer className="p-8 bg-slate-900/90 backdrop-blur-md border-t border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Calculator size={18} className="text-blue-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
            Projeções v18.5 baseadas em elasticidade-preço regional, PMP/PMR decidido e curvas de aprendizado industrial.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-mono text-slate-600 tracking-tighter">SEQ_NODE_ORACLE_REPORT_VALIDATED_P0{history.length}</span>
        </div>
      </footer>
    </div>
  );
};

export default FinancialReportMatrix;
