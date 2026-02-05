
import React, { useState, useMemo } from 'react';
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Bird, Scale, ShieldAlert,
  Award, User, Star, TrendingUp, X, EyeOff, Package, Users, Cpu, FileText,
  BarChart3, PieChart, Info, DollarSign, Activity, Target, Newspaper, 
  ChevronRight, MapPin, Truck, Warehouse, TrendingDown,
  Factory, CheckCircle2, ArrowUpCircle, ArrowDownCircle, Settings2, Flame,
  Briefcase, BarChart, ShoppingCart, Coins, Sparkles, Monitor, Percent, AlertOctagon,
  ShieldCheck
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { Championship, UserRole, CreditRating, Team, CurrencyType, MachineModel, MacroIndicators } from '../types';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM, DEFAULT_MACRO } from '../constants';

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  activeTeam?: Team | null;
  onClose: () => void;
}

type GazetteTab = 'individual' | 'collective_fin' | 'collective_market' | 'macro';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, userRole = 'player', activeTeam, onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('individual');
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
               <TabBtn active={activeTab === 'individual'} onClick={() => setActiveTab('individual')} label="Unidade" icon={<User size={14}/>} />
               <TabBtn active={activeTab === 'collective_fin'} onClick={() => setActiveTab('collective_fin')} label="Mercado" icon={<Landmark size={14}/>} />
               <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Conjuntura" icon={<Zap size={14}/>} />
            </nav>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-2xl transition-all active:scale-90"><X size={24} /></button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950/30">
         <AnimatePresence mode="wait">
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
