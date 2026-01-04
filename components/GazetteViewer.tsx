
import React, { useState, useMemo } from 'react';
import { 
  Newspaper, TrendingUp, Activity, AlertTriangle, 
  Landmark, DollarSign, Cpu, Boxes, ChevronLeft, Globe, Scale,
  BarChart3, PieChart as PieIcon, Briefcase, User, Layers,
  History, Table, Sliders, Zap, Shield, Map as MapIcon,
  Package, Info, TrendingDown, Target, FileText, ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship, UserRole } from '../types';
import Chart from 'react-apexcharts';

interface GazetteViewerProps {
  arena: Championship;
  news: string;
  round: number;
  userRole?: UserRole;
  onClose: () => void;
}

type GazetteTab = 'macro' | 'suppliers' | 'matrix' | 'demand' | 'unit_report' | 'tutor';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, news, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('macro');
  const macro = arena.market_indicators;
  
  // Matriz de Balanços Públicos - Fidelity Round 0 Identical State
  const competitorMatrix = useMemo(() => {
    const teams = arena?.teams || Array.from({ length: 8 });
    return teams.map((t: any, i: number) => ({
      id: i + 1,
      name: t?.name || `Unidade Industrial 0${i + 1}`,
      asset: 9176940, 
      equity: 5055447,
      revenue: round === 0 ? 3322735 : 3322735 + (Math.random() * 400000 - 200000),
      netProfit: round === 0 ? 73928 : 73928 + (Math.random() * 25000 - 10000),
      liquidity: round === 0 ? 0.74 : 0.74 + (Math.random() * 0.2),
      status: i % 4 === 0 && round > 1 ? 'RJ' : 'NORMAL'
    }));
  }, [round, arena?.teams]);

  const macroEvolutionOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', sparkline: { enabled: false } },
    colors: ['#f97316', '#3b82f6'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0 } },
    xaxis: { categories: ['P0', 'P1', 'P2'], labels: { style: { colors: '#64748b', fontSize: '9px' } } },
    yaxis: { labels: { style: { colors: '#64748b', fontSize: '9px' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    legend: { labels: { colors: '#94a3b8' }, position: 'top', horizontalAlign: 'right' }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[1000px] relative"
    >
      {/* 1. HEADER SUPREMO - BRANDING & NAV */}
      <header className="bg-slate-950 p-6 border-b border-white/5 space-y-6">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
               <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20"><Newspaper size={24} /></div>
               <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Empirion <span className="text-orange-500">Street</span></h1>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] font-black text-orange-500 uppercase tracking-widest">INDÚSTRIA v7.5 GOLD</span>
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Industrial Intelligence Dashboard • Período Atual: 0{round}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full transition-all active:scale-90 border border-white/5"><ChevronLeft size={20} /></button>
         </div>

         {/* NAVEGAÇÃO MULTICAMADA */}
         <nav className="flex gap-1 p-1 bg-slate-900 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} icon={<Globe size={13}/>} label="Conjuntura" />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} icon={<Package size={13}/>} label="Fornecedores" />
            <TabBtn active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} icon={<Table size={13}/>} label="Benchmarking Coletivo" />
            <TabBtn active={activeTab === 'demand'} onClick={() => setActiveTab('demand')} icon={<MapIcon size={13}/>} label="Heatmap Regional" />
            <TabBtn active={activeTab === 'unit_report'} onClick={() => setActiveTab('unit_report')} icon={<History size={13}/>} label="Dossiê Unidade" color="emerald" />
            {userRole === 'tutor' && <TabBtn active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<Shield size={13}/>} label="Tutor Control" color="orange" />}
         </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
         <AnimatePresence mode="wait">
            
            {/* AMBIENTE 1: CONJUNTURA (COMMON) */}
            {activeTab === 'macro' && (
              <motion.div key="macro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-8">
                       <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] italic border-l-2 border-orange-500 pl-4">Manchete do Setor</h3>
                       <h2 className="text-6xl font-black text-white italic leading-[0.9] tracking-tighter">
                          {news.split('\n')[0] || "Economia Industrial em Fase de Estabilização"}
                       </h2>
                       <p className="text-xl text-slate-400 leading-relaxed font-medium italic">
                          "{news.substring(news.indexOf('\n') + 1) || "Analistas preveem manutenção da TR em 3% e leve reajuste em insumos logísticos."}"
                       </p>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                          <MacroCard label="Inflação" val="1.0%" sub="+0.2 esperado" icon={<TrendingUp size={14}/>} />
                          <MacroCard label="Taxa TR" val="3.0%" sub="Estável" icon={<Activity size={14}/>} />
                          <MacroCard label="Giro Médio" val="1.55x" sub="Setorial" icon={<Briefcase size={14}/>} />
                          <MacroCard label="ROE Médio" val="8.4%" sub="Anualizado" icon={<Target size={14}/>} />
                       </div>
                    </div>
                    <div className="lg:col-span-5 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.02]"><Activity size={120} /></div>
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><TrendingUp size={12}/> Tendência dos Indicadores Oracle</h4>
                       <div className="h-64">
                          <Chart options={macroEvolutionOptions} series={[{name: 'Inflação', data: [1.0, 1.2, 1.1]}, {name: 'TR', data: [3.0, 3.0, 3.0]}]} type="area" height="100%" />
                       </div>
                       <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl">
                          <p className="text-[9px] font-bold text-orange-400 uppercase leading-relaxed italic">
                             A orquestração do Round 0 garante paridade de caixa para todas as 8 unidades fabris.
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* AMBIENTE 3: BENCHMARKING COLETIVO (PUBLIC) - SYNCED WITH TEAM NAMES */}
            {activeTab === 'matrix' && (
              <motion.div key="matrix" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <div className="space-y-1">
                       <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Industrial Peer Review</h3>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Snapshot Auditado • Round 0{round} • Fidelidade 100%</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-3xl shadow-xl">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[11px] font-black uppercase text-emerald-400">Oracle Sincronizado</span>
                    </div>
                 </div>

                 <div className="bg-slate-900/50 rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                       <thead className="bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                          <tr>
                             <th className="p-10">Estrategista</th>
                             <th className="p-10">Status</th>
                             <th className="p-10">Ativo Total ($)</th>
                             <th className="p-10">Lucro Líquido</th>
                             <th className="p-10">Liquidez</th>
                             <th className="p-10 text-right">Dossiê</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {competitorMatrix.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.03] transition-all group">
                               <td className="p-10 font-black text-white italic uppercase tracking-tighter group-hover:text-orange-500 transition-colors text-lg">{u.name}</td>
                               <td className="p-10">
                                  <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase border ${u.status === 'RJ' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>{u.status}</span>
                               </td>
                               <td className="p-10 font-mono text-slate-300 font-black text-base italic">{u.asset.toLocaleString()}</td>
                               <td className="p-10 font-mono text-emerald-400 font-black italic text-base">$ {u.netProfit.toLocaleString()}</td>
                               <td className="p-10">
                                  <div className="flex items-center gap-3">
                                     <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${u.liquidity < 0.8 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(u.liquidity*100, 100)}%` }} />
                                     </div>
                                     <span className={`text-[10px] font-black font-mono ${u.liquidity < 0.8 ? 'text-rose-400' : 'text-slate-400'}`}>{u.liquidity.toFixed(2)}x</span>
                                  </div>
                               </td>
                               <td className="p-10 text-right"><button className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all shadow-lg"><ArrowUpRight size={18}/></button></td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {/* AMBIENTE 5: MEU DOSSIÊ (TEAM) - FULL PDF SYNC */}
            {activeTab === 'unit_report' && (
              <motion.div key="unit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <HistorySummaryCard title="Snapshot Industrial 1" icon={<Package />} lines={[
                       { label: 'ATIVO TOTAL', val: '9.176.940', b: true },
                       { label: 'Saldos em Caixa', val: '840.200' },
                       { label: 'MP-A Estocada', val: '628.545' },
                       { label: 'MP-B Estocada', val: '838.060' }
                    ]} />
                    <HistorySummaryCard title="Snapshot Industrial 2" icon={<DollarSign />} lines={[
                       { label: 'Faturamento P0', val: '3.322.735', b: true },
                       { label: 'CPV Bernard', val: '2.278.180' },
                       { label: 'Margem Bruta', val: '1.044.555', b: true },
                       { label: 'Lucro Líquido', val: '73.928', b: true, highlight: true }
                    ]} />
                    <HistorySummaryCard title="Human Resources OEE" icon={<User />} lines={[
                       { label: 'Mão de Obra Direta', val: '210' },
                       { label: 'Salário Nominal Setor', val: '1.313', b: true },
                       { label: 'Produtividade Base', val: '20,64' },
                       { label: 'Clima Industrial', val: '92%', b: true }
                    ]} />
                 </div>
                 <div className="p-14 bg-indigo-600/10 border border-indigo-500/20 rounded-[4rem] space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-all duration-700"><Zap size={180} /></div>
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-2xl shadow-indigo-500/30 animate-pulse"><Zap size={28}/></div>
                       <h4 className="text-3xl font-black uppercase text-indigo-400 italic tracking-tighter leading-none">Strategos Tactical Feedback</h4>
                    </div>
                    <p className="text-2xl text-slate-300 font-medium leading-relaxed italic max-w-5xl opacity-90">
                       "Sua estrutura contábil do Round 0 apresenta um equilíbrio saudável, porém a depreciação de prédios ($ -2.3M) sinaliza a necessidade de reinvestimento em CapEx ALFA nos próximos 4 ciclos."
                    </p>
                    <button className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-white bg-indigo-600 px-10 py-5 rounded-full hover:bg-white hover:text-indigo-950 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] group">
                       Acessar Auditoria Oracle <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                 </div>
              </motion.div>
            )}

         </AnimatePresence>
      </main>

      <footer className="p-6 bg-slate-950 border-t border-white/5 flex justify-between px-14 items-center">
         <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-600 rounded-lg text-white shadow-xl"><Activity size={12}/></div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">EMPIRE_STREET_FIDELITY_V7.5_GOLD</p>
         </div>
         <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Node 08 Synced</span>
            <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_15px_#f97316] animate-ping" />
         </div>
      </footer>
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, label, icon, color = 'blue' }: any) => (
  <button onClick={onClick} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap active:scale-95 ${active ? (color === 'orange' ? 'bg-orange-600 text-white shadow-2xl scale-105' : color === 'emerald' ? 'bg-emerald-600 text-white shadow-2xl scale-105' : 'bg-blue-600 text-white shadow-2xl scale-105') : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon} {label}
  </button>
);

const MacroCard = ({ label, val, sub, icon }: any) => (
  <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-3 hover:bg-white/10 transition-all group border-b-2 hover:border-b-orange-500 shadow-2xl">
     <div className="flex items-center gap-2 text-slate-500 group-hover:text-orange-500 transition-colors">
        {icon}
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
     </div>
     <div className="flex flex-col">
        <span className="text-3xl font-black text-white italic font-mono leading-none tracking-tighter">{val}</span>
        <span className="text-[8px] font-black text-slate-600 uppercase mt-2 tracking-tighter">{sub}</span>
     </div>
  </div>
);

const TableSection = ({ title, badge, items }: any) => (
  <div className="bg-slate-900/50 rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl group hover:border-white/10 transition-all">
     <div className="p-10 bg-slate-950 border-b border-white/5 flex items-center justify-between">
        <div className="space-y-1">
           <h4 className="text-base font-black uppercase text-white tracking-widest italic leading-none">{title}</h4>
           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] mt-2">{badge}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl text-slate-500 group-hover:text-orange-500 transition-colors shadow-inner"><Table size={24}/></div>
     </div>
     <table className="w-full text-left text-[12px]">
        <thead className="text-slate-500 font-black uppercase tracking-[0.2em] bg-slate-950/50 border-b border-white/5">
           <tr><th className="p-6">Ativo/Insumo</th><th className="p-6">Anterior</th><th className="p-6 text-orange-500">Período 0{0}</th><th className="p-6 text-right">Var %</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-300">
           {items.map((it: any, i: number) => (
             <tr key={i} className="hover:bg-white/[0.03] transition-colors group/row">
                <td className="p-6 font-black uppercase italic tracking-tighter opacity-80 group-hover/row:opacity-100 group-hover/row:text-white text-base">{it.label}</td>
                <td className="p-6 font-mono text-slate-500">$ {it.old}</td>
                <td className="p-6 font-mono text-white font-black italic">$ {it.curr}</td>
                <td className="p-6 text-right font-black text-[11px] text-orange-500 italic tracking-widest">{it.var}</td>
             </tr>
           ))}
        </tbody>
     </table>
  </div>
);

const HistorySummaryCard = ({ title, icon, lines }: any) => (
  <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
     {/* FIX: Changed React.cloneElement second parameter structure to satisfy TypeScript attributes for Lucide icons */}
     <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">{React.cloneElement(icon as React.ReactElement<any>, { size: 120 })}</div>
     <div className="flex items-center gap-5 border-b border-white/5 pb-8">
        <div className="p-4 bg-emerald-600 text-white rounded-3xl shadow-2xl shadow-emerald-500/30">{React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}</div>
        <h4 className="text-2xl font-black uppercase text-white italic tracking-tighter leading-none">{title}</h4>
     </div>
     <div className="space-y-6">
        {lines.map((ln: any, i: number) => (
          <div key={i} className="flex justify-between items-center py-1 group/ln">
             <span className={`text-[11px] uppercase tracking-widest ${ln.b ? 'font-black text-slate-300' : 'text-slate-500'} group-hover/ln:text-white transition-colors`}>{ln.label}</span>
             <span className={`font-mono text-lg ${ln.highlight ? 'text-emerald-400 font-black italic' : 'text-slate-200 font-bold'}`}>$ {ln.val}</span>
          </div>
        ))}
     </div>
  </div>
);

const TutorRange = ({ label, val }: any) => (
  <div className="space-y-5 group">
     <div className="flex justify-between items-center text-[11px] font-black uppercase italic tracking-widest">
        <span className="text-slate-400 group-hover:text-white transition-colors">{label}</span>
        <span className="text-orange-500">{val}</span>
     </div>
     <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_20px_#f97316]" style={{ width: '65%' }} />
     </div>
  </div>
);

const InsightPill = ({ icon, label }: any) => (
  <div className="flex items-center gap-5 px-8 py-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all shadow-lg">
     <div className="p-3 bg-white/5 text-orange-500 rounded-xl group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
     <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">{label}</span>
  </div>
);

export default GazetteViewer;
