
import React, { useState, useMemo } from 'react';
import { 
  Newspaper, TrendingUp, Activity, AlertTriangle, 
  Landmark, DollarSign, Cpu, Boxes, ChevronLeft, Globe, Scale,
  BarChart3, PieChart as PieIcon, Briefcase, User, Layers,
  History, Table, Sliders, Zap, Shield
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

type GazetteTab = 'news' | 'market_matrix' | 'unit_history' | 'tutor_node';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, news, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('news');
  const macro = arena.market_indicators;
  
  // MOCK DE DADOS COLETIVOS (Público para todas as equipes)
  const pulseData = arena.marketPulse || {
    total_rj: 2, total_rej: 1, total_loans_count: 5, total_loans_value: 4500000,
    machines_traded: { bought: 12, sold: 3 }, avg_liquidity: 1.15, avg_debt: 2.4
  };

  // Matriz de Balanços Públicos (Todas as equipes veem de todas)
  const competitorMatrix = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Unidade 0${i + 1}`,
    revenue: 3322735 + (Math.random() * 500000 - 250000),
    netProfit: 73928 + (Math.random() * 20000 - 10000),
    cash: 840200 + (Math.random() * 100000),
    equity: 5055447,
    status: i % 3 === 0 ? 'RJ' : i === 4 ? 'REJ' : 'NORMAL'
  })), [round]);

  const statusOptions: any = {
    chart: { type: 'donut', background: 'transparent' },
    colors: ['#3b82f6', '#f59e0b', '#ef4444'],
    labels: ['Normal', 'Rec. Extrajudicial', 'Rec. Judicial'],
    legend: { show: true, position: 'bottom', labels: { colors: '#94a3b8' } },
    stroke: { show: false },
    plotOptions: { donut: { size: '70%' } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[1000px] relative"
    >
      {/* HEADER DINÂMICO */}
      <header className="bg-slate-950 p-6 border-b border-white/5 flex flex-col gap-6">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20"><Newspaper size={24} /></div>
               <div>
                  <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Empirion <span className="text-orange-500">Street</span></h1>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Industrial Intelligence Dashboard • Ciclo 0{round}</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={onClose} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full transition-all active:scale-90"><ChevronLeft size={20} /></button>
            </div>
         </div>

         {/* NAVEGAÇÃO DE AMBIENTES */}
         <nav className="flex gap-1 p-1 bg-slate-900 rounded-2xl border border-white/5 w-fit">
            <GazetteTabBtn active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={<Globe size={14}/>} label="Market News" />
            <GazetteTabBtn active={activeTab === 'market_matrix'} onClick={() => setActiveTab('market_matrix')} icon={<Table size={14}/>} label="Análise de Concorrentes" />
            <GazetteTabBtn active={activeTab === 'unit_history'} onClick={() => setActiveTab('unit_history')} icon={<History size={14}/>} label="Minha Evolução" />
            {userRole === 'tutor' && (
              <GazetteTabBtn active={activeTab === 'tutor_node'} onClick={() => setActiveTab('tutor_node')} icon={<Shield size={14}/>} label="Tutor Control" color="orange" />
            )}
         </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
         <AnimatePresence mode="wait">
            {/* 1. AMBIENTE COMUM: NOTÍCIAS E PULSO */}
            {activeTab === 'news' && (
              <motion.div key="news" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-6">
                       <h3 className="text-xs font-black uppercase text-orange-500 tracking-[0.4em] italic">Manchetes de Mercado</h3>
                       <h2 className="text-5xl font-black text-white italic leading-none tracking-tight">{news.split('\n')[0]}</h2>
                       <p className="text-xl text-slate-400 leading-relaxed font-medium italic">{news.substring(news.indexOf('\n') + 1)}</p>
                    </div>
                    <div className="lg:col-span-5 bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pulso de Estabilidade Setorial</h3>
                       <div className="h-48">
                          <Chart options={statusOptions} series={[80 - (pulseData.total_rj*10), pulseData.total_rej*10, pulseData.total_rj*10]} type="donut" height="100%" />
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                          <StatMini label="RJ" val={pulseData.total_rj} color="rose" />
                          <StatMini label="REJ" val={pulseData.total_rej} color="amber" />
                          <StatMini label="Normal" val={8 - pulseData.total_rj - pulseData.total_rej} color="blue" />
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
                    <MetricCard icon={<Landmark size={16}/>} label="Crédito Total" val={`$ ${(pulseData.total_loans_value/1000000).toFixed(1)}M`} desc="Injeção no Mercado" />
                    <MetricCard icon={<Cpu size={16}/>} label="CapEx Global" val={`+${pulseData.machines_traded.bought}`} desc="Expansão Fabril" />
                    <MetricCard icon={<Briefcase size={16}/>} label="Média Liquidez" val={`${pulseData.avg_liquidity}x`} desc="Saúde de Curto Prazo" />
                    <MetricCard icon={<TrendingUp size={16}/>} label="CVM (EMPR8)" val={`$ ${macro.stockMarketPrice}`} desc="Média do Setor" />
                 </div>
              </motion.div>
            )}

            {/* 2. AMBIENTE PÚBLICO: MATRIZ DE CONCORRENTES (TODOS VEEM TODOS) */}
            {activeTab === 'market_matrix' && (
              <motion.div key="matrix" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-center gap-4">
                    <Zap size={20} className="text-blue-400" />
                    <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest leading-relaxed">
                       Transparência Oracle Nível Médio: Balanços e DREs de todas as unidades estão abertos para benchmarking desde o Round 0.
                    </p>
                 </div>
                 <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-slate-950 text-[9px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                          <tr>
                             <th className="p-6">Unidade Industrial</th>
                             <th className="p-6">Status Legal</th>
                             <th className="p-6">Receita (DRE)</th>
                             <th className="p-6">Lucro Líquido</th>
                             <th className="p-6">Caixa Final</th>
                             <th className="p-6">Ações</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {competitorMatrix.map(unit => (
                            <tr key={unit.id} className="hover:bg-white/[0.02] transition-colors group">
                               <td className="p-6">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center font-black text-xs text-orange-500">{unit.id}</div>
                                     <span className="font-black text-white uppercase italic">{unit.name}</span>
                                  </div>
                               </td>
                               <td className="p-6">
                                  <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase ${unit.status === 'RJ' ? 'bg-rose-500/20 text-rose-500' : unit.status === 'REJ' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{unit.status}</span>
                               </td>
                               <td className="p-6 font-mono text-xs text-slate-300">$ {unit.revenue.toLocaleString()}</td>
                               <td className="p-6 font-mono text-xs text-emerald-400 font-bold">$ {unit.netProfit.toLocaleString()}</td>
                               <td className="p-6 font-mono text-xs text-blue-400">$ {unit.cash.toLocaleString()}</td>
                               <td className="p-6"><button className="text-slate-600 hover:text-white transition-colors"><BarChart3 size={16}/></button></td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {/* 3. AMBIENTE PRIVADO: HISTÓRICO DA EQUIPE */}
            {activeTab === 'unit_history' && (
              <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                       <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest">Evolução do Market Share</h4>
                       <div className="h-40 bg-white/5 rounded-2xl flex items-center justify-center italic text-slate-600 text-[10px] uppercase font-black">Histórico P0 a P{round}</div>
                    </div>
                    <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                       <h4 className="text-xs font-black uppercase text-emerald-400 tracking-widest">Acúmulo de Lucro</h4>
                       <div className="h-40 bg-white/5 rounded-2xl flex items-center justify-center italic text-slate-600 text-[10px] uppercase font-black">Curva de Rentabilidade</div>
                    </div>
                    <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                       <h4 className="text-xs font-black uppercase text-blue-400 tracking-widest">Custo de Hora-Extra</h4>
                       <div className="h-40 bg-white/5 rounded-2xl flex items-center justify-center italic text-slate-600 text-[10px] uppercase font-black">Eficiência Fabril (OEE)</div>
                    </div>
                 </div>
                 <div className="p-10 bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] space-y-4">
                    <h4 className="text-sm font-black uppercase text-indigo-400 flex items-center gap-2 italic"><Zap size={16}/> Strategos Private Advisor</h4>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                       "Seu histórico indica que o reajuste salarial do P1 foi absorvido pela margem bruta. No P{round+1}, considere otimizar o giro de estoque para liberar caixa, visto que sua liquidez recuou 4%."
                    </p>
                 </div>
              </motion.div>
            )}

            {/* 4. AMBIENTE TUTOR: CONTROLES DE "SAL" (SALTINESS) */}
            {activeTab === 'tutor_node' && userRole === 'tutor' && (
              <motion.div key="tutor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-8">
                       <h4 className="text-lg font-black uppercase text-orange-500 italic flex items-center gap-3"><Sliders size={20}/> Saltiness Macro</h4>
                       <div className="space-y-10">
                          <TutorSlider label="Fator de Inflação" val="8%" />
                          <TutorSlider label="Escassez de Mão de Obra" val="Alta" />
                          <TutorSlider label="Juros Bancários" val="14.5%" />
                       </div>
                    </div>
                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-8">
                       <h4 className="text-lg font-black uppercase text-blue-500 italic flex items-center gap-3"><Newspaper size={20}/> Editor de Manchete IA</h4>
                       <textarea className="w-full h-32 bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-orange-500 transition-all" placeholder="Digite o tema da próxima notícia..."></textarea>
                       <button className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Gerar Notícia Customizada</button>
                    </div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </main>

      <footer className="p-4 bg-slate-950 border-t border-white/5 text-center flex justify-between px-10">
         <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">BUILD_SYNC_ORACLE_V6.5</p>
         <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest italic animate-pulse">Sincronização Ativa • Node 08</p>
      </footer>
    </motion.div>
  );
};

const GazetteTabBtn = ({ active, onClick, label, icon, color = 'blue' }: any) => (
  <button 
    onClick={onClick} 
    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
      active 
        ? (color === 'orange' ? 'bg-orange-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg') 
        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    {icon} {label}
  </button>
);

const StatMini = ({ label, val, color }: any) => (
  <div className="flex-1 p-3 bg-white/5 rounded-xl text-center border border-white/5">
     <span className={`text-[7px] font-black uppercase block ${color === 'rose' ? 'text-rose-500' : color === 'amber' ? 'text-amber-500' : 'text-blue-500'}`}>{label}</span>
     <span className="text-sm font-black text-white font-mono">{val}</span>
  </div>
);

const MetricCard = ({ icon, label, val, desc }: any) => (
  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 hover:bg-white/[0.05] transition-all group">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     </div>
     <div>
        <span className="text-xl font-black text-white italic leading-none">{val}</span>
        <span className="block text-[7px] font-bold text-slate-600 uppercase mt-1">{desc}</span>
     </div>
  </div>
);

const TutorSlider = ({ label, val }: any) => (
  <div className="space-y-4">
     <div className="flex justify-between items-center text-[10px] font-black uppercase italic">
        <span className="text-slate-400">{label}</span>
        <span className="text-orange-500">{val}</span>
     </div>
     <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
        <div className="h-full bg-orange-600 shadow-[0_0_15px_#f97316]" style={{ width: '60%' }} />
     </div>
  </div>
);

export default GazetteViewer;
