
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Chart from 'react-apexcharts';
// Added missing 'Users' and 'Star' to the imports from lucide-react
import { 
  History, User, Users, Key, Landmark, 
  ShieldAlert, Loader2, Monitor, Scale, 
  Activity, FileText, CheckCircle2, AlertOctagon, ShieldCheck,
  ChevronDown, LayoutGrid, Megaphone, Factory, Package, Cpu, Zap, DollarSign, Target, Briefcase,
  TrendingUp, ArrowUpRight, MousePointer2, Info, Search, Filter, Layers, ZapOff,
  Percent, ArrowUpCircle, ArrowDownCircle, BarChart3, PieChart, Globe, Truck,
  Thermometer, Gauge, ChevronRight, Star
} from 'lucide-react';
import { motion as _motion, AnimatePresence, Reorder } from 'framer-motion';
const motion = _motion as any;
import { supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { Branch, EcosystemConfig, CreditRating, TeamProgress, AuditLog, DecisionData, Team } from '../types';
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

interface MonitorProps {
  championshipId: string;
  round: number;
  isTrial?: boolean;
}

const TutorDecisionMonitor: React.FC<MonitorProps> = ({ championshipId, round, isTrial = false }) => {
  const [teams, setTeams] = useState<(TeamProgress & { current_decision?: DecisionData, equity?: number, tsr?: number, market_share?: number, nlcdg?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimelineNode, setActiveTimelineNode] = useState(round);
  const [viewMode, setViewMode] = useState<'history' | 'audit' | 'elasticity'>('history');

  const fetchLiveState = async () => {
    try {
      const champTable = isTrial ? 'trial_championships' : 'championships';
      const teamsTable = isTrial ? 'trial_teams' : 'teams';
      const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';

      const { data: arenaData } = await supabase.from(champTable).select('*').eq('id', championshipId).single();
      const { data: teamsData } = await supabase.from(teamsTable).select('*').eq('championship_id', championshipId);
      const { data: decisionsData } = await supabase.from(decisionsTable).select('*').eq('championship_id', championshipId).eq('round', round);

      const processedTeams = (teamsData || []).map(t => {
        const decision = decisionsData?.find(d => d.team_id === t.id);
        const branch = (arenaData?.branch || 'industrial') as Branch;
        const eco: EcosystemConfig = (arenaData?.ecosystemConfig || { 
          inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' 
        });
        
        const proj = decision ? calculateProjections(decision.data, branch, eco, arenaData?.market_indicators || arenaData?.initial_market_data, null) : null;

        return {
          team_id: t.id,
          team_name: t.name,
          status: decision ? 'sealed' : 'pending',
          rating: (proj?.health?.rating || 'N/A') as CreditRating,
          equity: t.equity || 7252171,
          tsr: (Math.random() * 15) + 5, // Mock TSR for visualization
          market_share: (proj?.marketShare || 12.5),
          nlcdg: (Math.random() * 8) + 2, // Mock NLCDG
          auditLogs: (decision?.data?.audit_logs || []) as AuditLog[],
          current_decision: decision?.data 
        };
      });

      setTeams(processedTeams);
    } catch (e) {
      console.error("Oracle Sync Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveState();
    const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';
    const channel = supabase.channel(`tutor-monitor-${championshipId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: decisionsTable, filter: `championship_id=eq.${championshipId}` }, () => fetchLiveState())
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [championshipId, round]);

  // Determinar o ViewMode baseado na Timeline selecionada
  useEffect(() => {
     if (activeTimelineNode <= 4) setViewMode('history');
     else if (activeTimelineNode <= 8) setViewMode('audit');
     else setViewMode('elasticity');
  }, [activeTimelineNode]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" size={48} /></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      
      {/* 1. TITULO E COMANDO MASTER */}
      <header className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 px-4">
         <div className="space-y-2">
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
               Dashboard do Tutor: <span className="text-orange-500">Comando Estratégico</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] italic">Arena Empirion Oracle v16.0 Master Node</p>
         </div>
         <div className="flex gap-4">
            <div className="px-6 py-3 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-4 shadow-xl">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase text-slate-400">Status da Rede: Sincronizada</span>
            </div>
         </div>
      </header>

      {/* 2. TEAM PERFORMANCE PANEL - DRAGGABLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
         {teams.map((team, idx) => (
           <TeamPerformanceCard key={team.team_id} team={team} index={idx} />
         ))}
      </div>

      {/* 3. CONTEXTUAL ANALYSIS VIEW (Dinamizado pela Timeline) */}
      <div className="px-4">
         <AnimatePresence mode="wait">
            {viewMode === 'history' && (
               <motion.div key="history" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-slate-900/60 p-10 rounded-[4rem] border border-white/10 shadow-2xl min-h-[450px]">
                     <div className="flex justify-between items-start mb-10">
                        <div className="space-y-2">
                           <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-3"><History className="text-blue-500"/> Monitoramento Histórico e Evolução</h3>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gráfico Consolidado de Equity P00 - P0{activeTimelineNode}</p>
                        </div>
                     </div>
                     <div className="h-[300px]">
                        <Chart 
                          options={historyChartOptions} 
                          series={[
                            { name: 'Equity Total', data: [7252171, 7400000, 7800000, 8100000, 8500000].slice(0, activeTimelineNode + 1) },
                            { name: 'Lucro Líquido', data: [500000, 650000, 420000, 780000, 950000].slice(0, activeTimelineNode + 1) }
                          ]} 
                          type="area" 
                          height="100%" 
                        />
                     </div>
                  </div>
                  <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-10">
                     <h4 className="text-lg font-black text-white uppercase italic border-b border-white/5 pb-4 flex items-center gap-3"><Landmark size={18} className="text-orange-500"/> Painel Fiscal e IVA</h4>
                     <div className="grid grid-cols-1 gap-4">
                        <MiniMetric label="IVA a Recuperar" val="$ 128.450" icon={<ArrowUpCircle className="text-emerald-500"/>} />
                        <MiniMetric label="IVA a Recolher" val="$ 45.200" icon={<ArrowDownCircle className="text-rose-500"/>} />
                        <MiniMetric label="Tarifa Exportação" val="12% (Média)" icon={<Globe className="text-blue-500"/>} />
                     </div>
                  </div>
               </motion.div>
            )}

            {viewMode === 'audit' && (
               <motion.div key="audit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/10 shadow-2xl min-h-[450px] space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-orange-600 rounded-3xl text-white shadow-xl"><Monitor size={24}/></div>
                     <div>
                        <h3 className="text-2xl font-black text-white uppercase italic">Monitor de Decisões e Audit Timeline</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atividade em Tempo Real P05 - P08</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {teams.map(t => (
                        <div key={t.team_id} className="bg-slate-950/50 p-6 rounded-[2.5rem] border border-white/5 space-y-6">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-white uppercase italic">{t.team_name}</span>
                              <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-slate-500 uppercase">{t.auditLogs.length} Ações</span>
                           </div>
                           <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                              {t.auditLogs.length > 0 ? t.auditLogs.slice(0, 4).map((log, i) => (
                                 <div key={i} className="text-[9px] border-l-2 border-orange-500/30 pl-3 py-1">
                                    <span className="text-orange-500 font-black uppercase">{log.field_path}:</span> <span className="text-slate-400">{JSON.stringify(log.new_value)}</span>
                                 </div>
                              )) : <p className="text-[9px] text-slate-700 italic text-center py-4">Aguardando telemetria...</p>}
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}

            {viewMode === 'elasticity' && (
               <motion.div key="elasticity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-slate-900/60 p-10 rounded-[4rem] border border-white/10 shadow-2xl min-h-[450px]">
                     <div className="flex items-center gap-4 mb-10">
                        <h3 className="text-2xl font-black text-white uppercase italic">Cross-Market e Elasticidade</h3>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase">P09 - P12 Focus</span>
                     </div>
                     <div className="h-[300px]">
                        <Chart 
                          options={elasticityChartOptions} 
                          series={[
                            { name: 'Preço Alpha', data: [425, 430, 410, 450, 390] },
                            { name: 'Relação Mercado', data: [12, 14, 11, 16, 9] }
                          ]} 
                          type="line" 
                          height="100%" 
                        />
                     </div>
                  </div>
                  <div className="lg:col-span-4 grid grid-cols-1 gap-8">
                     <div className="bg-slate-900 p-8 rounded-[3.5rem] border border-white/10 flex flex-col justify-between">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Análise de CAPEX</h4>
                        <div className="flex items-end justify-between">
                           <span className="text-3xl font-black text-white italic">14.2% ROI</span>
                           <TrendingUp className="text-emerald-500" size={32} />
                        </div>
                     </div>
                     <div className="bg-slate-900 p-8 rounded-[3.5rem] border border-white/10 flex flex-col justify-between">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Gasto com Folha</h4>
                        <div className="flex items-end justify-between">
                           <span className="text-3xl font-black text-white italic">+3.2% vs Inf.</span>
                           <Users className="text-blue-500" size={32} />
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* 4. MASTER NAV TIMELINE RODAPÉ */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 z-[3000] flex items-center justify-center px-12">
         <div className="max-w-6xl w-full flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            
            {Array.from({ length: 13 }).map((_, i) => (
               <button 
                  key={i} 
                  onClick={() => setActiveTimelineNode(i)}
                  className={`relative z-10 w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center group ${
                    activeTimelineNode === i 
                    ? 'bg-orange-600 border-orange-400 shadow-[0_0_25px_#f97316] scale-125' 
                    : i <= round 
                    ? 'bg-slate-800 border-emerald-500/50 hover:border-orange-500' 
                    : 'bg-slate-950 border-white/5 opacity-40 grayscale'
                  }`}
               >
                  <span className={`text-[10px] font-black font-mono transition-colors ${activeTimelineNode === i ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                     P{i < 10 ? `0${i}` : i}
                  </span>
                  {activeTimelineNode === i && (
                    <motion.div layoutId="timelineGlow" className="absolute -inset-2 bg-orange-600/20 blur-lg rounded-full" />
                  )}
               </button>
            ))}

            <div className="absolute -top-10 left-0 flex gap-20 text-[9px] font-black uppercase text-slate-500 italic tracking-widest pointer-events-none">
               <span className={activeTimelineNode <= 4 ? 'text-blue-400' : ''}>Histórico de Rodadas</span>
               <span className={activeTimelineNode > 4 && activeTimelineNode <= 8 ? 'text-orange-500' : ''}>Audit Timeline</span>
               <span className={activeTimelineNode > 8 ? 'text-emerald-500' : ''}>Cross-Market & Elasticidade</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

/* --- MINI COMPONENTES AUXILIARES --- */

const TeamPerformanceCard = ({ team, index }: { team: any, index: number }) => {
   const ratingColors = {
      'AAA': 'from-emerald-600/40 to-emerald-900/40 border-emerald-500/50 text-emerald-400',
      'A-': 'from-amber-600/40 to-amber-900/40 border-amber-500/50 text-amber-400',
      'BB+': 'from-rose-600/40 to-rose-900/40 border-rose-500/50 text-rose-400',
      'N/A': 'from-slate-600/40 to-slate-900/40 border-white/10 text-slate-500'
   };
   
   const accent = ratingColors[team.rating as keyof typeof ratingColors] || ratingColors['N/A'];

   return (
      <motion.div 
         drag 
         dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: index * 0.1 }}
         className={`bg-gradient-to-br ${accent} p-10 rounded-[3.5rem] border-2 shadow-2xl backdrop-blur-3xl group relative overflow-hidden cursor-grab active:cursor-grabbing`}
      >
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Trophy size={160} /></div>
         
         <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="space-y-1">
               <h4 className="text-xs font-black text-white/50 uppercase tracking-widest leading-none">EQUIPE</h4>
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{team.team_name}</h3>
            </div>
            <div className="text-right">
               <span className="block text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">RATING DE CRÉDITO</span>
               <div className="text-5xl font-black italic tracking-tighter drop-shadow-2xl">{team.rating}</div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-8 items-end relative z-10">
            <div className="space-y-6">
               <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">TSR FINAL</span>
                  <div className="flex items-center gap-3 text-3xl font-black text-white font-mono italic">
                     {team.tsr.toFixed(1)}% <TrendingUp size={24} className="text-emerald-400" />
                  </div>
                  <p className="text-[7px] text-white/30 font-bold uppercase">Valorização do Império</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <span className="block text-[8px] font-black text-white/40 uppercase mb-1">NLCDG</span>
                     <span className="text-xl font-black text-white font-mono">{team.nlcdg.toFixed(1)}</span>
                  </div>
                  <div>
                     <span className="block text-[8px] font-black text-white/40 uppercase mb-1">EBITDA</span>
                     <span className="text-xl font-black text-white font-mono">1.2M</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-center gap-2">
               <div className="w-24 h-24 relative flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                  <div className="absolute inset-0 border-4 border-orange-500 rounded-full" style={{ clipPath: `inset(0 0 ${100 - team.market_share}% 0)` }} />
                  <span className="text-xl font-black text-white italic">{team.market_share}%</span>
               </div>
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">MARKET SHARE %</span>
            </div>
         </div>
      </motion.div>
   );
};

const MiniMetric = ({ label, val, icon }: any) => (
   <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
      <div className="flex items-center gap-4">
         <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-black text-white font-mono">{val}</span>
   </div>
);

/* --- CONFIGURAÇÕES DE GRÁFICOS --- */

const historyChartOptions: any = {
  chart: { toolbar: { show: false }, background: 'transparent', sparkline: { enabled: false } },
  stroke: { curve: 'smooth', width: 4 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
  colors: ['#3b82f6', '#f97316'],
  grid: { borderColor: 'rgba(255,255,255,0.03)', strokeDashArray: 4 },
  xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: '#475569', fontSize: '10px', fontWeight: 800 } } },
  legend: { show: false },
  tooltip: { theme: 'dark' }
};

const elasticityChartOptions: any = {
  chart: { toolbar: { show: false }, background: 'transparent' },
  stroke: { curve: 'smooth', width: [3, 3], dashArray: [0, 8] },
  colors: ['#f97316', '#10b981'],
  grid: { borderColor: 'rgba(255,255,255,0.03)' },
  xaxis: { labels: { show: false } },
  yaxis: { labels: { style: { colors: '#475569', fontSize: '10px' } } },
  legend: { show: false },
  tooltip: { theme: 'dark' }
};

const Trophy = ({ size }: { size: number }) => <Star size={size} />;

export default TutorDecisionMonitor;
