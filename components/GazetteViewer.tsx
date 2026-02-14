
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Bird, Scale, ShieldAlert,
  Award, User, Star, TrendingUp, X, EyeOff, Package, Users, Cpu, FileText,
  BarChart3, PieChart, Info, DollarSign, Activity, Target, Newspaper, 
  ChevronRight, MapPin, Truck, Warehouse, TrendingDown,
  Factory, CheckCircle2, ArrowUpCircle, ArrowDownCircle, Settings2, Flame,
  Briefcase, BarChart, ShoppingCart, Coins, Sparkles, Monitor, Percent, AlertOctagon,
  ShieldCheck, Loader2, Search
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { Championship, UserRole, CreditRating, Team, CurrencyType, MachineModel, MacroIndicators } from '../types';
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

type GazetteTab = 'individual' | 'collective_fin' | 'collective_market' | 'macro' | 'news';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, userRole = 'player', activeTeam, onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('news');
  const [dynamicNews, setDynamicNews] = useState<string>('');
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const currencySymbol = arena.currency === 'BRL' ? 'R$' : '$';
  
  const currentMacro = useMemo((): MacroIndicators => {
    const rules = arena.round_rules?.[round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[round] || {};
    return { ...DEFAULT_MACRO, ...arena.market_indicators, ...rules } as MacroIndicators;
  }, [arena, round]);

  const isBlackSwanActive = useMemo(() => {
    const baseInfl = arena.market_indicators.inflation_rate || 1.0;
    const baseDem = arena.market_indicators.demand_variation || 0;
    return Math.abs(currentMacro.inflation_rate - baseInfl) > 5 || Math.abs(currentMacro.demand_variation - baseDem) > 15;
  }, [currentMacro, arena]);

  useEffect(() => {
    const fetchAndGenerateNews = async () => {
      if (round === 0) {
        setDynamicNews("Aguardando o encerramento do Ciclo Base P00 para geração de notícias competitivas.");
        return;
      }

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
            arena.name,
            round,
            arena.branch,
            teamsData.map(t => ({
              name: t.team?.name || 'Equipe',
              market_share: t.kpis?.market_share || 0,
              equity: t.equity,
              rating: t.kpis?.rating || 'N/A',
              net_profit: t.kpis?.statements?.dre?.net_profit || 0,
              roi: t.kpis?.roi || 0
            })),
            currentMacro,
            arena.config?.transparency || 'medium',
            arena.config?.gazetaMode || 'anonymous'
          );
          setDynamicNews(news);
        } else {
          setDynamicNews("Dados insuficientes para análise cruzada este período.");
        }
      } catch (err) {
        console.error("Gazette Generation Error:", err);
        setDynamicNews("O canal de notícias via satélite está temporariamente fora do ar.");
      } finally {
        setIsGeneratingNews(false);
      }
    };

    if (activeTab === 'news' && !dynamicNews) {
      fetchAndGenerateNews();
    }
  }, [activeTab, round, arena]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-[#020617] border border-white/10 rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[90vh] max-w-[1400px] w-full relative">
      <header className="bg-slate-950 px-12 py-8 border-b border-white/5 shrink-0 shadow-2xl relative z-10 flex items-center justify-between">
         <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_50px_rgba(249,115,22,0.4)] border border-orange-400/30"><Newspaper size={32} strokeWidth={2.5} /></div>
            <div>
               <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Gazette</h1>
               <div className="flex items-center gap-4 mt-2"><span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Auditoria Master: Ciclo 0{round}</span></div>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <nav className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
               <TabBtn active={activeTab === 'news'} onClick={() => setActiveTab('news')} label="Notícias" icon={<Sparkles size={14}/>} />
               <TabBtn active={activeTab === 'individual'} onClick={() => setActiveTab('individual')} label="Unidade" icon={<User size={14}/>} />
               <TabBtn active={activeTab === 'collective_fin'} onClick={() => setActiveTab('collective_fin')} label="Mercado" icon={<Landmark size={14}/>} />
               <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Conjuntura" icon={<Zap size={14}/>} />
            </nav>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-2xl transition-all active:scale-90"><X size={24} /></button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950/30">
         <AnimatePresence mode="wait">
            {activeTab === 'news' && (
              <motion.div key="news" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-12">
                 <div className="p-16 bg-white/[0.02] border border-white/5 rounded-[5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-20 opacity-[0.02] group-hover:scale-110 transition-transform">
                       <Newspaper size={400} />
                    </div>
                    
                    <div className="relative z-10 space-y-10">
                       <div className="flex items-center gap-4">
                          <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.6em] italic">Breaking Market Report</span>
                       </div>

                       {isGeneratingNews ? (
                          <div className="space-y-8 py-10">
                             <div className="h-10 bg-white/5 rounded-full w-3/4 animate-pulse" />
                             <div className="space-y-4">
                                <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                                <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                                <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
                             </div>
                             <div className="flex flex-col items-center justify-center pt-10 gap-3">
                                <Loader2 className="animate-spin text-orange-600" size={32} />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sincronizando dados cruzados entre unidades...</span>
                             </div>
                          </div>
                       ) : (
                          <div className="space-y-10">
                             <div className="prose prose-invert prose-orange max-w-none">
                                <div className="text-slate-100 text-2xl md:text-3xl font-medium leading-relaxed italic whitespace-pre-line border-l-4 border-orange-600 pl-10">
                                   {dynamicNews}
                                </div>
                             </div>
                             
                             <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl"><ShieldCheck size={20}/></div>
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Verificação Oracle</span>
                                      <span className="text-[8px] font-bold text-slate-500 uppercase">Fidelidade v18.0 Gold Sincronizada</span>
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">IA Powered</span>
                                   <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${arena.config?.gazetaMode === 'anonymous' ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' : 'bg-blue-600/10 text-blue-400 border border-blue-400/20'}`}>
                                      Modo: {arena.config?.gazetaMode?.toUpperCase() || 'ANONYMOUS'}
                                   </span>
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Seção de Destaques Rápidos */}
                 {!isGeneratingNews && dynamicNews && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-6">
                          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic flex items-center gap-2"><Target size={14}/> Radar de Oportunidade</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">
                             O Oráculo detectou uma ineficiência na alocação de Capex do setor. Unidades que focarem em giro rápido de MP-A podem ganhar 2% de share residual.
                          </p>
                       </div>
                       <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-6">
                          <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic flex items-center gap-2"><ShieldAlert size={14}/> Alerta de Risco</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">
                             A volatilidade cambial pode penalizar pesadamente quem não possuir reservas em BTC se o ICE cair abaixo de 2.8 no próximo ciclo.
                          </p>
                       </div>
                    </div>
                 )}
              </motion.div>
            )}

            {activeTab === 'macro' && (
               <motion.div key="macro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <MacroSummaryBox label="Crescimento (ICE)" val={`${currentMacro.ice}%`} icon={<Activity className="text-emerald-500"/>} />
                     <MacroSummaryBox label="Inflação" val={`${currentMacro.inflation_rate}%`} icon={<Flame className="text-rose-500"/>} />
                     <MacroSummaryBox label="Taxa TR" val={`${currentMacro.interest_rate_tr}%`} icon={<Landmark className="text-blue-500"/>} />
                     <MacroSummaryBox label="Inadimplência" val={`${currentMacro.customer_default_rate}%`} icon={<ShieldAlert className="text-orange-500"/>} />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="bg-slate-900/60 p-12 rounded-[5rem] border border-white/10 shadow-3xl">
                        <h3 className="text-2xl font-black text-white uppercase italic mb-10 flex items-center gap-4"><Coins className="text-orange-500"/> Matriz de Custos Fornecedores</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                           <CostUnit label="Matéria-Prima A" val={currentMacro.prices.mp_a} color="text-blue-400" />
                           <CostUnit label="Matéria-Prima B" val={currentMacro.prices.mp_b} color="text-indigo-400" />
                           <CostUnit label="Distribuição Unit." val={currentMacro.prices.distribution_unit} color="text-orange-400" />
                        </div>
                     </div>
                     <div className="bg-blue-600/10 p-12 rounded-[5rem] border border-blue-500/20 shadow-3xl">
                        <h3 className="text-2xl font-black text-white uppercase italic mb-10 flex items-center gap-4"><Globe className="text-blue-400"/> Acordos Internacionais (Tarifas)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="p-8 bg-slate-950/50 rounded-[2.5rem] border border-white/5 space-y-2">
                              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Exportação EUA</span>
                              <div className="flex justify-between items-end"><span className="text-xl font-black text-white">Tarifa Importer:</span><span className="text-3xl font-mono font-black text-blue-400">{currentMacro.export_tariff_usa || 0}%</span></div>
                           </div>
                           <div className="p-8 bg-slate-950/50 rounded-[2.5rem] border border-white/5 space-y-2">
                              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Exportação EUROPA</span>
                              <div className="flex justify-between items-end"><span className="text-xl font-black text-white">Tarifa Importer:</span><span className="text-3xl font-mono font-black text-blue-400">{currentMacro.export_tariff_euro || 0}%</span></div>
                           </div>
                        </div>
                        <p className="mt-6 text-[9px] text-slate-400 font-bold uppercase italic leading-relaxed">"Nota: Exportações para estas regiões são ISENTAS de IVA/VAT no markup de saída brasileiro."</p>
                     </div>
                  </div>
               </motion.div>
            )}
            {activeTab === 'individual' && activeTeam && (
               <motion.div key="ind" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="bg-slate-900/80 p-12 rounded-[5rem] border border-white/5 shadow-3xl">
                     <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-10">Performance Unidade: {activeTeam.name}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <KpiBadge label="Equity Final" val={`${currencySymbol} ${activeTeam.equity.toLocaleString()}`} icon={<ShieldCheck className="text-emerald-500" />} />
                        <KpiBadge label="Market Share" val={`${(activeTeam.kpis?.market_share || 0).toFixed(1)}%`} icon={<Target className="text-orange-500" />} />
                        <KpiBadge label="Rating Oracle" val={activeTeam.kpis?.rating || 'AAA'} icon={<Star className="text-amber-500" />} />
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </main>
      <footer className="px-12 py-6 bg-slate-950 border-t border-white/5 flex justify-between items-center opacity-60 shrink-0"><span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.8em] italic">Protocolo High Fidelity Oracle v15.75</span></footer>
    </motion.div>
  );
};

const KpiBadge = ({ label, val, icon }: any) => (
  <div className="p-8 bg-slate-950 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4">
     <div className="p-4 bg-white/5 rounded-2xl">{icon}</div>
     <div className="text-center"><span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span><span className="text-2xl font-black text-white italic">{val}</span></div>
  </div>
);

const MacroSummaryBox = ({ label, val, icon }: any) => (
   <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] flex flex-col gap-4 shadow-xl">
      <div className="p-3 bg-white/5 rounded-2xl w-fit">{icon}</div>
      <div><span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 italic">{label}</span><span className="text-3xl font-black text-white italic tracking-tighter truncate leading-none">{val}</span></div>
   </div>
);

const CostUnit = ({ label, val, color }: any) => (
   <div className="p-8 bg-slate-950/50 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-3">
      <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</span>
      <span className="text-2xl font-black text-white font-mono">$ {val.toLocaleString()}</span>
   </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 border-2 italic active:scale-95 whitespace-nowrap ${active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'text-slate-500 hover:text-white bg-slate-950 border-transparent hover:border-white/10'}`}>{icon} {label}</button>
);

export default GazetteViewer;
