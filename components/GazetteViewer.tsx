import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  Globe, ChevronLeft, Landmark, Zap, 
  AlertTriangle, LayoutGrid, Bird, Scale, ShieldAlert,
  Activity, Award, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship, UserRole } from '../types';

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  onClose: () => void;
}

type GazetteTab = 'macro' | 'suppliers' | 'solvency' | 'benchmarking' | 'tutor';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('macro');
  const teams = arena.teams || [];
  const activeEvent = arena.market_indicators?.active_event;
  
  // v12.8.2 Oracle Ranking Engine (Simulated Matrix Metrics)
  const competitiveRanking = useMemo(() => {
    return teams.map((t, i) => {
      const share = [12.5, 14.2, 11.1, 13.0, 10.5, 15.0, 12.0, 11.7][i] || 12.5;
      const profit = [73928, -120500, 45000, 12000, -8000, 95000, 32000, 15000][i] || 0;
      const coreKpi = arena.branch === 'industrial' ? `${(80 + Math.random() * 10).toFixed(1)}% OEE` : `${(8 + Math.random() * 2).toFixed(1)} CSAT`;

      return {
        name: t.name,
        ratio: [35.2, 82.5, 65.0, 41.2, 58.7, 30.1, 74.2, 50.0][i] || 45,
        share,
        profit,
        coreKpi
      };
    }).sort((a, b) => b.profit - a.profit);
  }, [teams, arena.branch]);

  const chartOptions: any = {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
    colors: [({ value }: any) => value > 60 ? '#ef4444' : value > 40 ? '#f59e0b' : '#10b981'],
    plotOptions: { bar: { borderRadius: 12, columnWidth: '60%', distributed: true } },
    xaxis: { 
      categories: competitiveRanking.map(r => r.name),
      labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 800 } }
    },
    yaxis: { max: 100, labels: { style: { colors: '#94a3b8' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    tooltip: { theme: 'dark' },
    legend: { show: false }
  };

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
                  <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Empirion <span className="text-orange-500">Oracle Gazette</span></h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Oracle Node v12.8.2 GOLD • Benchmarking Ready</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={onClose} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-full border border-white/5 transition-all active:scale-90"><ChevronLeft size={24} /></button>
            </div>
         </div>

         <nav className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} icon={<Globe size={14}/>} label="Conjuntura" />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} icon={<Landmark size={14}/>} label="Fornecedores" />
            <TabBtn active={activeTab === 'solvency'} onClick={() => setActiveTab('solvency')} icon={<Scale size={14}/>} label="Solvência" />
            <TabBtn active={activeTab === 'benchmarking'} onClick={() => setActiveTab('benchmarking')} icon={<LayoutGrid size={14}/>} label="Matriz Competitiva" />
            {userRole === 'tutor' && <TabBtn active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<Award size={14}/>} label="Tutor Control" color="orange" />}
         </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
         <AnimatePresence mode="wait">
            {activeTab === 'macro' && (
              <motion.div key="macro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 {activeEvent && (
                   <div className="bg-rose-600 p-12 rounded-[4rem] border border-white/20 shadow-2xl relative overflow-hidden group">
                      <Bird className="absolute -bottom-10 -right-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform" size={300} />
                      <div className="relative z-10 space-y-6">
                         <h2 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">{activeEvent.title}</h2>
                         <p className="text-2xl text-rose-50 font-medium italic max-w-4xl">{activeEvent.impact}</p>
                      </div>
                   </div>
                 )}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 p-12 bg-white/[0.02] border border-white/5 rounded-[4rem]">
                       <h3 className="text-orange-500 font-black text-[9px] uppercase tracking-[0.4em] mb-6 italic flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" /> Headline Oracle v12.8.2
                       </h3>
                       <h2 className="text-6xl font-black text-white italic leading-[0.9] tracking-tighter mb-8">{aiNews.split('\n')[0] || "Estabilidade no Fluxo de Valor"}</h2>
                       <p className="text-slate-400 text-lg leading-relaxed italic">{aiNews.split('\n').slice(1).join(' ') || "O motor reporta estabilidade operacional. Unidades focadas em NCG apresentam melhores rácios de liquidez."}</p>
                    </div>
                    <div className="lg:col-span-4 bg-slate-900/50 p-10 rounded-[4rem] border border-white/5 space-y-8">
                       <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Pulse Node 08</h3>
                       <MacroRow label="Taxa TR Mensal" val="3.0%" />
                       <MacroRow label="Inflação Período" val={`${arena.market_indicators?.inflationRate || 1.0}%`} />
                       <MacroRow label="Risco Médio Setor" val="1.8%" />
                       <MacroRow label="Dólar de Referência" val="R$ 5,28" />
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'solvency' && (
              <motion.div key="solvency" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                       <div className="p-10 bg-slate-900/50 border border-white/5 rounded-[4rem] shadow-xl">
                          <div className="flex justify-between items-center mb-10">
                             <div>
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Heatmap de Solvência</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alavancagem Sistêmica (%) • Ciclo 0{round}</p>
                             </div>
                             <div className="flex items-center gap-4 px-6 py-2 bg-rose-600/10 border border-rose-500/20 rounded-full text-rose-500">
                                <AlertTriangle size={16}/>
                                <span className="text-[9px] font-black uppercase tracking-widest">Zona Crítica > 60%</span>
                             </div>
                          </div>
                          <div className="h-[400px]">
                             <Chart options={chartOptions} series={[{ name: 'Alavancagem', data: competitiveRanking.map(r => r.ratio) }]} type="bar" height="100%" />
                          </div>
                       </div>
                    </div>
                    <div className="lg:col-span-4 space-y-8">
                       <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-8 shadow-inner">
                          <h4 className="text-xl font-black text-orange-500 uppercase italic flex items-center gap-3"><ShieldAlert /> Oracle Verdict</h4>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                             "Unidades em zona vermelha devem priorizar a geração de caixa operacional (EBITDA) e suspender novos investimentos em máquinas até a recuperação do PL."
                          </p>
                       </div>
                       <div className="p-10 bg-indigo-600 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                          <Activity size={140} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" />
                          <h4 className="text-xl font-black text-white uppercase italic">Spread Adjust</h4>
                          <p className="text-xs font-bold text-indigo-100 uppercase tracking-tight mt-4 leading-relaxed">
                            Aumento de 1.5% no custo de capital para empresas com Rating 'C' neste período.
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'benchmarking' && (
              <motion.div key="benchmarking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 <div className="bg-slate-950 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                       <thead className="bg-slate-900 text-slate-500 font-black text-[9px] uppercase tracking-widest border-b border-white/5">
                          <tr>
                             <th className="p-8">Ranking</th>
                             <th className="p-8">Unidade</th>
                             <th className="p-8 text-center">Mkt Share</th>
                             <th className="p-8 text-center">Lucro (P0{round})</th>
                             <th className="p-8 text-center">Setor</th>
                             <th className="p-8 text-right">Primary KPI</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5 text-[12px] font-mono">
                          {competitiveRanking.map((r, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                               <td className="p-8 font-black text-slate-600 italic">#0{i+1}</td>
                               <td className="p-8">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-lg bg-orange-600/10 text-orange-500 flex items-center justify-center"><User size={14}/></div>
                                     <span className="font-black text-white uppercase italic tracking-tighter">{r.name}</span>
                                  </div>
                               </td>
                               <td className="p-8 text-center font-black text-blue-400">{r.share.toFixed(1)}%</td>
                               <td className={`p-8 text-center font-black ${r.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  $ {r.profit.toLocaleString()}
                               </td>
                               <td className="p-8 text-center">
                                  <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">{arena.branch}</span>
                               </td>
                               <td className="p-8 text-right">
                                  <div className="flex flex-col items-end">
                                     <span className="text-white font-black italic uppercase tracking-tighter">{r.coreKpi}</span>
                                     <span className="text-[7px] text-slate-500 uppercase tracking-widest mt-1">Auditado Oracle</span>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </main>

      <footer className="p-8 bg-slate-950 border-t border-white/5 flex justify-between items-center px-14">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-xl text-white shadow-xl shadow-orange-500/20"><Landmark size={14}/></div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic">EMPIRE_GAZETTE_GOLD_v12.8.2_FINAL</p>
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

const MacroRow = ({ label, val }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 group">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
     <span className="text-lg font-black text-orange-500 italic font-mono">{val}</span>
  </div>
);

export default GazetteViewer;
