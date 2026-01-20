
import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Bird, Scale, ShieldAlert,
  Award, User, Star, TrendingUp, X, EyeOff
} from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { Championship, UserRole, CreditRating } from '../types';

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  onClose: () => void;
}

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<'benchmarking' | 'macro' | 'solvency'>('benchmarking');
  const teams = arena.teams || [];
  const isAnonymous = arena.gazeta_mode === 'anonymous' && userRole !== 'tutor' && userRole !== 'admin';
  
  // RANKING REAL - CONEXÃO COM KPIs REAIS DAS EQUIPES (REMOVIDO MOCK)
  const competitiveRanking = useMemo(() => {
    return teams.map((t, i) => {
      // Fix: Added rating property to the fallback object to satisfy the union type requirement
      const kpis = t.kpis || { market_share: 0, equity: 5055447, rating: 'N/A' as CreditRating, statements: { dre: { net_profit: 0 } } };
      return {
        id: t.id,
        name: isAnonymous ? `Unidade 0${i + 1}` : t.name,
        share: kpis.market_share || 0,
        profit: kpis.statements?.dre?.net_profit || 0,
        equity: kpis.equity || 5055447,
        rating: kpis.rating || 'N/A'
      };
    }).sort((a, b) => b.equity - a.equity); // Ordenação por Patrimônio (Padrão Elite)
  }, [teams, isAnonymous]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[92vh] max-w-6xl w-full relative"
    >
      <header className="bg-slate-950 p-8 border-b border-white/5">
         <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
               <Zap className="text-orange-500" size={32} />
               <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Oracle Gazette</h1>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
         </div>
         <div className="flex gap-4">
            <TabBtn active={activeTab === 'benchmarking'} onClick={() => setActiveTab('benchmarking')} label="Ranking Competitivo" icon={<Trophy size={14}/>} />
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Headline News" icon={<Globe size={14}/>} />
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
         {activeTab === 'benchmarking' && (
           <div className="space-y-12">
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                 <div>
                    <h4 className="text-xl font-black text-white uppercase italic">Consolidado P0{round}</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Status de Fechamento da Arena</p>
                 </div>
                 <div className="text-right">
                    <span className="block text-[8px] font-black text-orange-500 uppercase tracking-[0.4em]">Leader Unit (Equity)</span>
                    <span className="text-2xl font-black text-white uppercase italic">{competitiveRanking[0]?.name || 'N/A'}</span>
                 </div>
              </div>

              <table className="w-full text-left">
                 <thead className="bg-slate-900 text-slate-500 font-black text-[9px] uppercase tracking-widest border-b border-white/5">
                    <tr>
                       <th className="p-6 rounded-tl-2xl">Ranking</th>
                       <th className="p-6">Unidade Strategos</th>
                       <th className="p-6 text-center">Market Share</th>
                       <th className="p-6 text-center">Rating</th>
                       <th className="p-6 text-right rounded-tr-2xl">Lucro Líquido</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 font-mono">
                    {competitiveRanking.map((r, i) => (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                         <td className="p-6 text-slate-600">#0{i+1}</td>
                         <td className="p-6 text-white font-black uppercase italic">{r.name}</td>
                         <td className="p-6 text-blue-400 text-center font-bold">{r.share.toFixed(1)}%</td>
                         <td className="p-6 text-center">
                            <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-orange-500">{r.rating}</span>
                         </td>
                         <td className={`p-6 text-right font-black ${r.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {r.profit >= 0 ? '+' : ''}$ {r.profit.toLocaleString()}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}

         {activeTab === 'macro' && (
           <div className="space-y-12">
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Bird size={200} /></div>
                 <h3 className="text-orange-500 font-black text-[9px] uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" /> Oracle Feed Ativo
                 </h3>
                 <div className="text-3xl text-white font-medium italic leading-relaxed whitespace-pre-wrap max-w-4xl">
                    {aiNews || "Aguardando sincronização de briefing regional..."}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] space-y-4">
                    <h4 className="text-blue-400 font-black text-[10px] uppercase tracking-widest">Indicador TR (Juros)</h4>
                    <div className="flex items-end gap-2">
                       <span className="text-4xl font-black text-white italic">{arena.market_indicators.interest_rate_tr}%</span>
                       <span className="text-[10px] text-slate-500 uppercase font-black pb-1">Acumulado Arena</span>
                    </div>
                 </div>
                 <div className="p-8 bg-rose-600/10 border border-rose-500/20 rounded-[2.5rem] space-y-4">
                    <h4 className="text-rose-400 font-black text-[10px] uppercase tracking-widest">Inflação Projetada</h4>
                    <div className="flex items-end gap-2">
                       <span className="text-4xl font-black text-white italic">{arena.market_indicators.inflation_rate}%</span>
                       <span className="text-[10px] text-slate-500 uppercase font-black pb-1">Impacto nos Insumos</span>
                    </div>
                 </div>
              </div>
           </div>
         )}
      </main>
      
      <footer className="p-6 bg-slate-950 border-t border-white/5 flex justify-between items-center opacity-40">
         <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.4em]">Oracle Gazette Node 08 Build Gold</span>
         <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
         </div>
      </footer>
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, label, color, icon }: any) => {
  return (
    <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white bg-white/5'}`}>
      {icon} {label}
    </button>
  );
};

const Trophy = ({ size }: { size: number }) => <Award size={size} />;

export default GazetteViewer;
