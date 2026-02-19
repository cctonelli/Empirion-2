
import React, { useState, useMemo, useEffect } from 'react';
// Fix: Added missing Lucide icons (Sparkles, Monitor, Flame, ShieldAlert, Coins)
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Newspaper, 
  X, User, Star, TrendingUp, Target, Activity, ShieldCheck, Loader2,
  Table as TableIcon, Info, Users, BarChart3, ChevronRight, MapPin, 
  ArrowUpRight, ArrowDownRight, Package, ShoppingCart, Sparkles, Monitor, Flame, ShieldAlert, Coins
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { Championship, UserRole, Team, MacroIndicators } from '../types';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM, DEFAULT_MACRO } from '../constants';
import { generateDynamicMarketNews } from '../services/gemini';
import { supabase } from '../services/supabase';

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  activeTeam?: Team | null;
  onClose: () => void;
}

type GazetteTab = 'news' | 'market_intelligence' | 'macro' | 'individual';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, activeTeam, onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('news');
  const [dynamicNews, setDynamicNews] = useState<string>('');
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  
  const currentMacro = useMemo((): MacroIndicators => {
    const rules = arena.round_rules?.[round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[round] || {};
    return { ...DEFAULT_MACRO, ...arena.market_indicators, ...rules } as MacroIndicators;
  }, [arena, round]);

  const fetchMarketIntelligence = async () => {
     if (round === 0) return;
     setLoadingCompetitors(true);
     try {
        const historyTable = arena.is_trial ? 'trial_companies' : 'companies';
        const { data } = await supabase
           .from(historyTable)
           .select('*, team:teams(name)')
           .eq('championship_id', arena.id)
           .eq('round', round);
        
        if (data) setCompetitors(data);
     } catch (err) { console.error("Intel Fetch Fault", err); }
     finally { setLoadingCompetitors(false); }
  };

  useEffect(() => {
    if (activeTab === 'market_intelligence') fetchMarketIntelligence();
  }, [activeTab, round]);

  useEffect(() => {
    const fetchNews = async () => {
      if (round === 0) { setDynamicNews("Aguardando encerramento do Ciclo P00."); return; }
      setIsGeneratingNews(true);
      try {
        const historyTable = arena.is_trial ? 'trial_companies' : 'companies';
        const { data: teamsData } = await supabase
          .from(historyTable)
          .select('*, team:teams(name)')
          .eq('championship_id', arena.id)
          .eq('round', round);

        if (teamsData && teamsData.length > 0) {
          const news = await generateDynamicMarketNews(
            arena.name, round, arena.branch, 
            teamsData.map(t => ({ name: t.team?.name, market_share: t.kpis?.market_share, equity: t.equity, rating: t.kpis?.rating })),
            currentMacro, arena.transparency_level || 'medium', arena.gazeta_mode || 'anonymous'
          );
          setDynamicNews(news);
        }
      } catch (err) { setDynamicNews("Canal de notícias instável."); }
      finally { setIsGeneratingNews(false); }
    };
    if (activeTab === 'news' && !dynamicNews) fetchNews();
  }, [activeTab, round]);

  const isFullTransparency = arena.transparency_level === 'full';
  const isIdentified = arena.gazeta_mode === 'identified';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-[#020617] border border-white/10 rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[90vh] max-w-[1400px] w-full relative">
      <header className="bg-slate-950 px-12 py-8 border-b border-white/5 flex items-center justify-between shrink-0 shadow-2xl z-10">
         <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-xl border border-orange-400/30"><Newspaper size={32} /></div>
            <div>
               <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Gazette</h1>
               <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] italic mt-2">Ciclo de Auditoria: 0{round}</p>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <nav className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
               <TabBtn active={activeTab === 'news'} onClick={() => setActiveTab('news')} label="Notícias" icon={<Sparkles size={14}/>} />
               <TabBtn active={activeTab === 'market_intelligence'} onClick={() => setActiveTab('market_intelligence')} label="Monitoramento" icon={<Landmark size={14}/>} />
               <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Economia" icon={<Zap size={14}/>} />
               <TabBtn active={activeTab === 'individual'} onClick={() => setActiveTab('individual')} label="Unidade" icon={<User size={14}/>} />
            </nav>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-2xl transition-all"><X size={24} /></button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950/30">
         <AnimatePresence mode="wait">
            {activeTab === 'news' && (
              <motion.div key="news" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12">
                 <div className="p-16 bg-white/[0.02] border border-white/5 rounded-[5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-20 opacity-[0.02] group-hover:scale-110 transition-transform"><Newspaper size={400} /></div>
                    <div className="relative z-10 space-y-10">
                       <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" /><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Transmissão Strategos</span></div>
                       {isGeneratingNews ? <div className="flex flex-col items-center gap-6 py-10"><Loader2 className="animate-spin text-orange-600" size={48} /><span className="text-[10px] font-black text-slate-500 uppercase">Gerando Manchetes Competitivas...</span></div> : <div className="text-slate-100 text-3xl font-medium leading-relaxed italic border-l-4 border-orange-600 pl-10 whitespace-pre-line">{dynamicNews}</div>}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'market_intelligence' && (
               <motion.div key="intel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                  <div className="bg-indigo-600/10 border-2 border-indigo-500/20 p-12 rounded-[5rem] shadow-3xl flex items-center justify-between">
                     <div className="space-y-4">
                        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Comparativo de Unidades</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                           Protocolo de Governança: <span className="text-indigo-400">{arena.transparency_level.toUpperCase()}</span> • <span className="text-blue-400">{arena.gazeta_mode.toUpperCase()}</span>
                        </p>
                     </div>
                     <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl"><Monitor size={40}/></div>
                  </div>

                  <div className="matrix-container border-2 border-white/10 rounded-[3rem] bg-slate-950/80 overflow-hidden shadow-2xl">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] bg-slate-900 border-b border-white/10">
                              <th className="p-8 border-r border-white/5">Equipe (Strategos Unit)</th>
                              <th className="p-8 text-center">Market Share</th>
                              <th className="p-8 text-center">Equity (Patrimônio)</th>
                              <th className="p-8 text-center">Rating</th>
                              {isFullTransparency && <th className="p-8 text-center">Vendas (P. Médio)</th>}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                           {loadingCompetitors ? (
                             <tr><td colSpan={5} className="p-20 text-center text-slate-500 italic uppercase font-black text-xs"><Loader2 className="animate-spin mx-auto mb-4"/> Sincronizando dados competitivos...</td></tr>
                           ) : competitors.map((t, i) => (
                             <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                <td className="p-8 border-r border-white/5">
                                   <div className="flex items-center gap-6">
                                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 font-black italic">{i+1}</div>
                                      <span className="text-xl font-black text-white uppercase italic tracking-tight">{isIdentified ? t.team?.name : `Unidade Alpha-${t.team_id.slice(0,4)}`}</span>
                                   </div>
                                </td>
                                <td className="p-8 text-center text-orange-500 font-black text-2xl italic">{(t.kpis?.market_share || 0).toFixed(1)}%</td>
                                <td className="p-8 text-center text-white font-black text-lg">$ {t.equity.toLocaleString()}</td>
                                <td className="p-8 text-center">
                                   <span className={`px-5 py-2 rounded-xl font-black text-sm border-2 ${t.kpis?.rating === 'AAA' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-white/10 text-slate-500'}`}>{t.kpis?.rating || 'N/A'}</span>
                                </td>
                                {isFullTransparency && (
                                   <td className="p-8 text-center">
                                      <div className="flex flex-col gap-1">
                                         <span className="text-xs font-black text-blue-400">$ {(t.kpis?.statements?.dre?.revenue / Math.max(1, t.kpis?.statements?.dre?.revenue / 425)).toFixed(2)}</span>
                                         <span className="text-[8px] font-black text-slate-600 uppercase">Média Regional</span>
                                      </div>
                                   </td>
                                )}
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </motion.div>
            )}

            {activeTab === 'macro' && (
               <motion.div key="macro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <MacroBox label="Crescimento (ICE)" val={`${currentMacro.ice}%`} icon={<Activity className="text-emerald-500"/>} />
                     <MacroBox label="Inflação" val={`${currentMacro.inflation_rate}%`} icon={<Flame className="text-rose-500"/>} />
                     <MacroBox label="Taxa TR" val={`${currentMacro.interest_rate_tr}%`} icon={<Landmark className="text-blue-500"/>} />
                     <MacroBox label="Inadimplência" val={`${currentMacro.customer_default_rate}%`} icon={<ShieldAlert className="text-orange-500"/>} />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="bg-slate-900/60 p-12 rounded-[5rem] border border-white/10 shadow-3xl">
                        <h3 className="text-2xl font-black text-white uppercase italic mb-10 flex items-center gap-4"><Coins className="text-orange-500"/> Custos de Insumos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                           <CostUnit label="Matéria-Prima A" val={currentMacro.prices.mp_a * (1 + (currentMacro.raw_material_a_adjust || 0)/100)} color="text-blue-400" />
                           <CostUnit label="Matéria-Prima B" val={currentMacro.prices.mp_b * (1 + (currentMacro.raw_material_b_adjust || 0)/100)} color="text-indigo-400" />
                           <CostUnit label="Distribuição" val={currentMacro.prices.distribution_unit * (1 + (currentMacro.distribution_cost_adjust || 0)/100)} color="text-orange-400" />
                        </div>
                     </div>
                     <div className="bg-slate-900/60 p-12 rounded-[5rem] border border-white/10 shadow-3xl">
                        <h3 className="text-2xl font-black text-white uppercase italic mb-10 flex items-center gap-4"><Package className="text-blue-500"/> Taxas de Estocagem</h3>
                        <div className="grid grid-cols-2 gap-10">
                           <CostUnit label="Armazenagem MP" val={currentMacro.prices.storage_mp} color="text-slate-400" />
                           <CostUnit label="Armazenagem PA" val={currentMacro.prices.storage_finished} color="text-slate-400" />
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'individual' && activeTeam && (
               <motion.div key="ind" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="bg-slate-900/80 p-16 rounded-[5rem] border border-white/5 shadow-3xl text-center">
                     <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-10 text-orange-600 shadow-2xl border border-white/5"><User size={48} /></div>
                     <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">Relatório: {activeTeam.name}</h3>
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Análise de Performance Ciclo 0{round}</p>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                        <KpiItem label="Equity Final" val={`$ ${activeTeam.equity.toLocaleString()}`} icon={<ShieldCheck className="text-emerald-500" />} />
                        <KpiItem label="Market Share" val={`${(activeTeam.kpis?.market_share || 0).toFixed(1)}%`} icon={<Target className="text-orange-500" />} />
                        <KpiItem label="Rating" val={activeTeam.kpis?.rating || 'AAA'} icon={<Star className="text-amber-500" />} />
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </main>
      <footer className="px-12 py-6 bg-slate-950 border-t border-white/5 flex justify-between items-center opacity-60 shrink-0"><span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.8em] italic">Protocolo Oracle v18.0 Gold High Fidelity</span></footer>
    </motion.div>
  );
};

const KpiItem = ({ label, val, icon }: any) => (
  <div className="p-8 bg-slate-950 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4 shadow-inner group hover:border-orange-500/30 transition-all">
     <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
     <div className="text-center"><span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span><span className="text-2xl font-black text-white italic">{val}</span></div>
  </div>
);

const MacroBox = ({ label, val, icon }: any) => (
   <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] flex flex-col gap-4 shadow-xl">
      <div className="p-3 bg-white/5 rounded-2xl w-fit">{icon}</div>
      <div><span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 italic">{label}</span><span className="text-3xl font-black text-white italic tracking-tighter leading-none">{val}</span></div>
   </div>
);

const CostUnit = ({ label, val, color }: any) => (
   <div className="p-8 bg-slate-950/50 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-3 group hover:border-orange-500/20 transition-all shadow-inner">
      <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</span>
      <span className="text-2xl font-black text-white font-mono">$ {val.toLocaleString()}</span>
   </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 border-2 italic active:scale-95 whitespace-nowrap ${active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'text-slate-500 hover:text-white bg-slate-950 border-transparent hover:border-white/10'}`}>{icon} {label}</button>
);

export default GazetteViewer;
