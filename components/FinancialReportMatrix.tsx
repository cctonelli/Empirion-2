
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
      { id: 'brl_rate', label: 'Câmbio: Real (BRL)', suffix: '', desc: 'Taxa de conversão BRL/USD' },
      { id: 'gbp_rate', label: 'Câmbio: Libra (GBP)', suffix: '', desc: 'Taxa de conversão GBP/USD' },
      { id: 'export_tariff_brazil', label: 'Tarifa Exportação Brasil', suffix: '%', desc: 'Imposto de exportação para o Brasil' },
      { id: 'export_tariff_uk', label: 'Tarifa Exportação UK', suffix: '%', desc: 'Imposto de exportação para o Reino Unido' },
    ];

    return kpiDefinitions.map(kpi => (
      <tr key={kpi.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
        <td className="p-4 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[300px]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-white font-black">{kpi.label}</span>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">{kpi.desc}</span>
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

          return (
            <td key={idx} className={`p-4 text-center font-mono text-xs ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-bold' : 'text-slate-300'}`}>
              {displayVal}{val !== undefined ? kpi.suffix : ''}
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
          <tr className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${isTotalizer ? 'bg-white/[0.02] font-black' : ''}`}>
            <td className="p-4 sticky left-0 bg-slate-900 z-30 border-r border-white/10 min-w-[300px]">
              <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
                {level > 0 && <CornerDownRight size={10} className="text-slate-600" />}
                <span className={`text-[10px] uppercase tracking-wider ${isTotalizer ? 'text-white' : 'text-slate-400'}`}>
                  {node.label}
                </span>
              </div>
            </td>
            {periods.map((p: any, idx) => {
              // Lógica de extração de valor: procura o nó correspondente no statement de cada período
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
                <td key={idx} className={`p-4 text-center font-mono text-xs ${p.isProjection ? 'bg-orange-600/5 text-orange-500 font-bold' : 'text-slate-300'}`}>
                  {formatCurrency(val, currency)}
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
  const rootData = periods[periods.length - 1].data || [];
  const initialData = Array.isArray(rootData) ? rootData : Object.entries(rootData).map(([k, v]: [string, any]) => ({ id: k, label: k.replace(/_/g, ' ').toUpperCase(), value: typeof v === 'number' ? v : (v?.total || 0) }));

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl">
      <header className="p-8 bg-slate-900 border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/5 rounded-2xl shadow-inner">{getIcon()}</div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none">{getTitle()}</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 italic">Oracle High Fidelity Reporting Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase">Dados Auditados</span>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-40 bg-slate-900 shadow-md">
            <tr className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              <th className="p-4 sticky left-0 bg-slate-900 z-50 border-r border-white/10">Contas Contábeis</th>
              {periods.map((p: any, i) => (
                <th key={i} className={`p-4 text-center border-r border-white/5 ${p.isProjection ? 'bg-orange-600/10 text-orange-500' : ''}`}>
                  {p.isProjection ? 'PROJEÇÃO T+1' : `ROUND 0${p.round}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {type === 'strategic' ? renderStrategicRows() : renderRows(initialData as any)}
          </tbody>
        </table>
      </div>

      <footer className="p-6 bg-slate-900/80 border-t border-white/5 flex items-center justify-between opacity-60 shrink-0">
        <div className="flex items-center gap-3">
          <Calculator size={14} className="text-blue-400" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Projeções v18.5 baseadas em elasticidade-preço regional e PMP/PMR decidido.</span>
        </div>
        <span className="text-[8px] font-mono text-slate-600">SEQ_NODE_ORACLE_REPORT_VALIDATED</span>
      </footer>
    </div>
  );
};

export default FinancialReportMatrix;
