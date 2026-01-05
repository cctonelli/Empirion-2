
import React, { useState, useMemo } from 'react';
import { 
  Newspaper, Globe, History, Shield, 
  ChevronLeft, Landmark, Zap, 
  Gavel, Download, AlertTriangle, Target, LayoutGrid,
  Flame, Bird
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship, UserRole, AdvancedIndicators, Team } from '../types';

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  onClose: () => void;
}

type GazetteTab = 'macro' | 'suppliers' | 'cycles' | 'benchmarking' | 'tutor';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('macro');
  const teams = arena.teams || [];
  const activeEvent = arena.market_indicators?.active_event;
  
  const currentInd: AdvancedIndicators = useMemo(() => ({
    nldcg_days: 70,
    trit: 0.95,
    insolvency_index: 2.19,
    prazos: { pmre: 58, pmrv: 49, pmpc: 46, pmdo: 69, pmmp: 96 },
    ciclos: { operacional: 107, financeiro: -7, economico: 62 },
    fontes_financiamento: { ecp: 2241288, ccp: -831153, elp: 1500000 },
    scissors_effect: { ncg: 2541209, available_capital: 668847, gap: -1890843 },
    nldcg_components: { receivables: 1823735, inventory_finished: 0, inventory_raw: 1466605, suppliers: 717605, other_payables: 31528 }
  }), []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[92vh] max-h-[1100px] relative"
    >
      <header className="bg-slate-950 p-8 border-b border-white/5">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-orange-600 text-white rounded-3xl shadow-2xl shadow-orange-500/20"><Zap size={32} /></div>
               <div>
                  <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Empirion <span className="text-orange-500">Street</span></h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Oracle System v6.0 GOLD • Audit Node 08</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex gap-4 mr-6">
                  <StatusBadge label="ROUND" val={`0${round}`} color="orange" />
                  <StatusBadge label="STATUS" val="Sincronizado" color="emerald" />
               </div>
               <button onClick={onClose} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-full border border-white/5 transition-all active:scale-90"><ChevronLeft size={24} /></button>
            </div>
         </div>

         <nav className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} icon={<Globe size={14}/>} label="Conjuntura" />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} icon={<Landmark size={14}/>} label="Fornecedores" />
            <TabBtn active={activeTab === 'cycles'} onClick={() => setActiveTab('cycles')} icon={<History size={14}/>} label="Ciclos & NLDCG" />
            <TabBtn active={activeTab === 'benchmarking'} onClick={() => setActiveTab('benchmarking')} icon={<LayoutGrid size={14}/>} label="Matriz 8 Equipes" />
            {userRole === 'tutor' && <TabBtn active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<Shield size={14}/>} label="Tutor Master" color="orange" />}
         </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
         <AnimatePresence mode="wait">
            {activeTab === 'macro' && (
              <motion.div key="macro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 
                 {/* BLACK SWAN BREAKING NEWS CARD */}
                 {activeEvent && (
                   <motion.div 
                     initial={{ x: -100, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     className="bg-rose-600 p-12 rounded-[4rem] border border-white/20 shadow-2xl relative overflow-hidden group"
                   >
                      <Bird className="absolute -bottom-10 -right-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform" size={300} />
                      <div className="relative z-10 space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="px-5 py-2 bg-white/20 backdrop-blur-xl rounded-full text-[10px] font-black uppercase text-white tracking-[0.4em] border border-white/10 animate-pulse">Breaking News: Black Swan Detected</div>
                         </div>
                         <h2 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">{activeEvent.title}</h2>
                         <p className="text-2xl text-rose-50 font-medium italic max-w-4xl">{activeEvent.impact}</p>
                         <div className="pt-8 border-t border-white/20 flex flex-wrap gap-8">
                            <EventStat label="Inflação" val={`+${(activeEvent.modifiers.inflation*100).toFixed(0)}%`} />
                            <EventStat label="Demanda" val={`${(activeEvent.modifiers.demand*100).toFixed(0)}%`} />
                            <EventStat label="Produtividade" val={`${(activeEvent.modifiers.productivity*100).toFixed(0)}%`} />
                         </div>
                      </div>
                   </motion.div>
                 )}

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                       <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"><Zap size={200} /></div>
                          <h3 className="text-orange-500 font-black text-[9px] uppercase tracking-[0.4em] mb-6 italic flex items-center gap-3">
                             <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" /> Oracle Intelligence Headline
                          </h3>
                          <h2 className="text-6xl font-black text-white italic leading-[0.9] tracking-tighter mb-8">{aiNews.split('\n')[0] || "Equilíbrio de Mercado Mantido"}</h2>
                          <p className="text-2xl text-slate-400 font-medium italic leading-relaxed">"{aiNews.split('\n')[1] || "A arena processa novos dados de fluxo de caixa conforme o ciclo avança."}"</p>
                       </div>
                    </div>
                    <div className="lg:col-span-4 bg-slate-900/50 p-10 rounded-[4rem] border border-white/5 space-y-8">
                       <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Status Econômico Oracle</h3>
                       <div className="space-y-6">
                          <MacroRow label="Taxa TR Mensal" val={`${(arena.market_indicators?.interestRateTR || 3.0).toFixed(1)}%`} />
                          <MacroRow label="Inflação Período" val={`${(arena.market_indicators?.inflationRate || 1.0).toFixed(1)}%`} />
                          <MacroRow label="Sensibilidade Preço" val={`${(arena.market_indicators?.difficulty?.price_sensitivity || 2.0).toFixed(1)}x`} />
                          <MacroRow label="Eficácia Mkt" val={`${(arena.market_indicators?.difficulty?.marketing_effectiveness || 1.0).toFixed(1)}x`} />
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'benchmarking' && (
              <motion.div key="bench" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                 <div className="flex justify-between items-end">
                    <div>
                       <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Empire <span className="text-orange-500">Audit Matrix</span></h2>
                    </div>
                 </div>

                 <div className="bg-slate-950 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                       <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-900 text-slate-500 font-black text-[9px] uppercase tracking-widest sticky top-0 z-20">
                             <tr className="border-b border-white/10">
                                <th className="p-8 border-r border-white/5 bg-slate-900 sticky left-0 z-30 min-w-[320px]">ESTRUTURA CONTÁBIL ($)</th>
                                {teams.map((t: Team, i: number) => (
                                  <th key={t.id} className="p-8 min-w-[200px] border-r border-white/5 text-center">
                                     <div className="text-orange-500 italic text-base mb-1">{t.name}</div>
                                     <div className="text-[7px] font-black opacity-30 tracking-[0.3em] uppercase">Unit 0{i+1}</div>
                                  </th>
                                ))}
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                             <MatrixRow label="RECEITA BRUTA VENDAS" teams={teams} val="3.322.735" bold />
                             <MatrixRow label="(=) LUCRO BRUTO" teams={teams} val="1.044.555" highlight />
                             <MatrixRow label="LUCRO OPERACIONAL (EBIT)" teams={teams} val="86.973" bold />
                             <MatrixRow label="LUCRO LÍQUIDO PERÍODO" teams={teams} val="73.928" total highlight />
                             <tr className="bg-white/10"><td colSpan={teams.length + 1} className="p-2 border-y border-white/10"></td></tr>
                             <MatrixRow label="ATIVO TOTAL CONSOLIDADO" teams={teams} val="9.176.940" bold highlight />
                             <MatrixRow label="Caixa & Bancos" teams={teams} val="840.200" indent />
                             <MatrixRow label="Patrimônio Líquido" teams={teams} val="5.055.447" bold />
                          </tbody>
                       </table>
                    </div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </main>

      <footer className="p-8 bg-slate-950 border-t border-white/5 flex justify-between items-center px-14">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-xl text-white shadow-xl shadow-orange-500/20"><Landmark size={14}/></div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">EMPIRE_STREET_ORACLE_V6</p>
         </div>
      </footer>
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, label, icon, color = 'blue' }: any) => (
  <button onClick={onClick} className={`px-8 py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-4 whitespace-nowrap active:scale-95 ${active ? (color === 'orange' ? 'bg-orange-600 text-white shadow-2xl scale-105' : 'bg-blue-600 text-white shadow-2xl scale-105') : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon} {label}
  </button>
);

const MatrixRow = ({ label, teams, val, bold, neg, highlight, total, indent }: any) => (
    <tr className={`hover:bg-white/[0.03] transition-all group ${bold ? 'font-black text-slate-200 bg-white/[0.02]' : 'text-slate-500'} ${total ? 'bg-slate-950' : ''}`}>
       <td className={`p-6 border-r border-white/5 sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 uppercase tracking-tighter text-[9px] ${highlight ? 'text-orange-500 italic' : ''} ${indent ? 'pl-16' : ''}`}>
          {label}
       </td>
       {teams.map((t: any) => (
         <td key={t.id} className="p-6 border-r border-white/5 text-center font-mono text-sm">
            <span className={`${neg ? 'text-rose-500' : highlight ? 'text-orange-400 font-black' : ''}`}>
               {neg && '('}$ {val}{neg && ')'}
            </span>
         </td>
       ))}
    </tr>
);

const MacroRow = ({ label, val }: any) => (
  <div className="flex justify-between items-center py-1 group">
     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
     <span className="text-lg font-black text-orange-500 italic font-mono">{val}</span>
  </div>
);

const GovCard = ({ icon, title, desc }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex gap-6 items-center group hover:bg-white/10 transition-all shadow-xl">
     <div className="p-4 bg-white/5 text-slate-400 rounded-2xl group-hover:bg-white group-hover:text-slate-900 transition-all">{icon}</div>
     <div>
        <h4 className="text-lg font-black text-white uppercase italic leading-none">{title}</h4>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1">{desc}</p>
     </div>
  </div>
);

const StatusBadge = ({ label, val, color }: any) => (
  <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}:</span>
     <span className={`text-[10px] font-black uppercase ${color === 'orange' ? 'text-orange-500' : 'text-emerald-500'}`}>{val}</span>
  </div>
);

const EventStat = ({ label, val }: { label: string, val: string }) => (
  <div className="flex flex-col">
     <span className="text-[8px] font-black text-rose-200 uppercase tracking-widest">{label}</span>
     <span className="text-xl font-black text-white font-mono">{val}</span>
  </div>
);

export default GazetteViewer;
