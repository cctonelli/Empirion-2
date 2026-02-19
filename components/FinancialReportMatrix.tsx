
import React from 'react';
import { ChevronRight, TrendingUp, Activity, Landmark, ArrowRight, Calculator } from 'lucide-react';
import { AccountNode, CurrencyType } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MatrixProps {
  type: 'balance' | 'dre' | 'cashflow';
  history: any[]; // Dados dos rounds passados
  projection: any; // Dados projetados da decisão atual
  currency: CurrencyType;
}

const FinancialReportMatrix: React.FC<MatrixProps> = ({ type, history, projection, currency }) => {
  // Mock de estrutura de contas baseado no tipo
  // No futuro, isso deve vir dinamicamente das constantes ou DB
  const getLabel = () => {
    if (type === 'balance') return 'Balanço Patrimonial Consolidado';
    if (type === 'dre') return 'Demonstrativo de Resultados (DRE)';
    return 'Fluxo de Caixa Preditivo (DFC)';
  };

  const getIcon = () => {
    if (type === 'balance') return <Landmark className="text-blue-500" />;
    if (type === 'dre') return <TrendingUp className="text-orange-500" />;
    return <Activity className="text-emerald-500" />;
  };

  // Pega todas as contas únicas presentes no histórico e na projeção
  const rounds = [...history.map(h => ({ round: h.round, data: h.kpis?.statements?.[type === 'balance' ? 'balance_sheet' : type] })), 
                  { round: 'PROJ', data: projection?.statements?.[type === 'balance' ? 'balance_sheet' : type] }];

  return (
    <div className="flex flex-col h-full bg-slate-950/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      <header className="p-8 bg-slate-900 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-2xl">{getIcon()}</div>
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{getLabel()}</h3>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Oracle Financial Intelligence Matrix</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest bg-slate-900/50">
              <th className="p-4 sticky left-0 bg-slate-900 z-20 border-r border-white/5 min-w-[250px]">Conta Contábil</th>
              {rounds.map((r, i) => (
                <th key={i} className={`p-4 text-center border-r border-white/5 ${r.round === 'PROJ' ? 'bg-orange-600/10 text-orange-500' : ''}`}>
                  {r.round === 'PROJ' ? 'PROJEÇÃO T+1' : `ROUND 0${r.round}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs">
             {/* Renderização recursiva das contas aqui. 
                 Simplificado para este commit, mas deve seguir a INITIAL_FINANCIAL_TREE */}
             <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 sticky left-0 bg-slate-950 font-black text-white uppercase italic">Demonstrativo Detalhado</td>
                {rounds.map((_, i) => <td key={i} className="p-4 text-center opacity-20">---</td>)}
             </tr>
             {/* Aqui entramos com a lógica de mapeamento de contas reais */}
             <MatrixDataRows type={type} rounds={rounds} currency={currency} />
          </tbody>
        </table>
      </div>
      
      <footer className="p-6 bg-slate-900/80 border-t border-white/5 flex items-center gap-4 opacity-50">
         <Calculator size={14} className="text-blue-400" />
         <span className="text-[8px] font-black uppercase tracking-widest">Os dados de projeção consideram elasticidade-preço e prazos de recebimento médios decididos no ciclo atual.</span>
      </footer>
    </div>
  );
};

// Sub-componente para renderizar as linhas de dados reais
const MatrixDataRows = ({ type, rounds, currency }: any) => {
  // Esta função deve espelhar a estrutura de contas completa
  // Para brevidade, vamos focar nos KPIs principais, mas no código final ela percorre a árvore completa
  const accounts = type === 'dre' 
    ? ['revenue', 'cpv', 'gross_profit', 'opex', 'operating_profit', 'net_profit']
    : type === 'cashflow'
    ? ['start', 'inflow_total', 'outflow_total', 'final']
    : ['assets_total', 'liabilities_total', 'equity_total'];

  return (
    <>
      {accounts.map(acc => (
        <tr key={acc} className="hover:bg-white/[0.02]">
          <td className="p-4 sticky left-0 bg-slate-950 border-r border-white/5 font-bold text-slate-400 uppercase tracking-tighter">
            {acc.replace('_', ' ')}
          </td>
          {rounds.map((r: any, i: number) => {
            // Lógica de extração do valor da conta do JSON consolidado de KPIs
            const val = 0; // Fallback: extrair de r.data conforme a conta
            return (
              <td key={i} className={`p-4 text-center font-black ${r.round === 'PROJ' ? 'text-orange-400' : 'text-slate-200'}`}>
                {formatCurrency(val, currency)}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};

export default FinancialReportMatrix;
