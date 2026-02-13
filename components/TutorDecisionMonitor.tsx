import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  History, Users, Landmark, Monitor, TrendingUp, 
  Target, Zap, Activity, ShieldCheck, Trophy, 
  ArrowUpRight, Info, Search, Filter, 
  ChevronRight, BarChart3, PieChart, Star,
  AlertOctagon, Scale, Globe, HardDrive, Package, 
  Loader2, Gavel, LayoutGrid, Clock, UsersRound,
  ArrowUpCircle, ArrowDownCircle, Percent, DollarSign,
  Briefcase, Cpu, Thermometer, Gauge, ActivitySquare,
  TrendingDown, ShieldAlert
} from 'lucide-react';
import { motion as _motion, AnimatePresence, Reorder } from 'framer-motion';
const motion = _motion as any;
import { supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { Branch, EcosystemConfig, CreditRating, TeamProgress, AuditLog, DecisionData } from '../types';

interface MonitorProps {
  championshipId: string;
  round: number;
  isTrial?: boolean;
}

const TutorDecisionMonitor: React.FC<MonitorProps> = ({ championshipId, round, isTrial = false }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimelineNode, setActiveTimelineNode] = useState(round);

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
          id: t.id,
          name: t.name,
          rating: (proj?.kpis?.rating || t.kpis?.rating || 'AAA') as CreditRating,
          tsr: proj?.kpis?.tsr || t.kpis?.tsr || (Math.random() * 10 + 15), 
          market_share: (proj?.marketShare || t.kpis?.market_share || 25),
          nlcdg: proj?.kpis?.nlcdg || t.kpis?.nlcdg || 8.5,
          ebitda: proj?.kpis?.ebitda || t.kpis?.ebitda || 1.4,
          kanitz: proj?.kpis?.solvency_score_kanitz || t.kpis?.solvency_score_kanitz || 5.2,
          dcf: proj?.kpis?.dcf_valuation || t.kpis?.dcf_valuation || 24.8,
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

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" size={48} /></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-40">
      
      {/* 1. TITULO DE COMANDO */}
      <header className="px-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
               Dashboard do Tutor: <span className="text-orange-500">Comando Estratégico</span>
            </h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Arena Empirion Oracle v16.9 • Tactical War Room</p>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-2">
               <History size={14}/> Timeline Completa
            </button>
         </div>
      </header>

      {/* 2. TEAM PERFORMANCE PANEL (Team Cards com hierarquia de indicadores) */}
      <div className="px-4">
        <Reorder.Group axis="x" values={teams} onReorder={setTeams} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           {teams.map((team, idx) => (
             <Reorder.Item key={team.id} value={team} className="cursor-grab active:cursor-grabbing">
                <TeamCardDetailed team={team} index={idx} />
             </Reorder.Item>
           ))}
        </Reorder.Group>
      </div>

      {/* 3. FOOTER NAV TIMELINE (Sincronizado com os rounds da arena) */}
      <footer className="fixed bottom-0 left-0 right-0 h-32 bg-slate-950/90 backdrop-blur-3xl border-t border-white/10 z-[3000] flex items-center justify-center px-12">
         <div className="max-w-7xl w-full flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
            
            {Array.from({ length: 13 }).map((_, i) => (
               <button 
                  key={i} 
                  onClick={() => setActiveTimelineNode(i)}
                  className={`relative z-10 w-14 h-14 rounded-full border-4 transition-all flex items-center justify-center group ${
                    activeTimelineNode === i 
                    ? 'bg-orange-600 border-orange-400 shadow-[0_0_30px_#f97316] scale-125' 
                    : i <= round 
                    ? 'bg-slate-800 border-emerald-500/50 hover:border-orange-500' 
                    : 'bg-slate-950 border-white/5 opacity-40 grayscale'
                  }`}
               >
                  <span className={`text-xs font-black font-mono transition-colors ${activeTimelineNode === i ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                     P{i < 10 ? `0${i}` : i}
                  </span>
                  {activeTimelineNode === i && (
                    <motion.div layoutId="nodeGlow" className="absolute -inset-3 bg-orange-600/30 blur-xl rounded-full" />
                  )}
               </button>
            ))}

            <div className="absolute -top-12 left-0 flex gap-12 text-[9px] font-black uppercase text-slate-600 italic tracking-[0.2em] pointer-events-none">
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Rodadas Auditadas</span>
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"/> Ciclo Corrente</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

/* --- COMPONENTE TEAM CARD DETALHADO (Hierarquia Visual de 7 Indicadores) --- */

const TeamCardDetailed = ({ team, index }: { team: any, index: number }) => {
   // 1. Kanban de cores baseado no Credit Rating
   const getRatingConfig = (rating: CreditRating) => {
      if (['AAA', 'AA', 'A'].includes(rating)) return { 
         bg: 'bg-slate-900/90', 
         border: 'border-emerald-500/40', 
         accent: 'text-emerald-400', 
         shadow: 'shadow-emerald-500/10', 
         ratingBg: 'bg-emerald-500/10', 
         circle: 'stroke-emerald-500',
         glow: 'shadow-[0_0_40px_rgba(16,185,129,0.1)]'
      };
      if (['BB+', 'B'].includes(rating)) return { 
         bg: 'bg-slate-900/95', 
         border: 'border-amber-500/40', 
         accent: 'text-amber-400', 
         shadow: 'shadow-amber-500/10', 
         ratingBg: 'bg-amber-500/10', 
         circle: 'stroke-amber-500',
         glow: 'shadow-[0_0_40px_rgba(245,158,11,0.1)]'
      };
      if (['C', 'D', 'E'].includes(rating)) return { 
         bg: 'bg-slate-900/98', 
         border: 'border-rose-500/50', 
         accent: 'text-rose-400', 
         shadow: 'shadow-rose-500/10', 
         ratingBg: 'bg-rose-500/20', 
         circle: 'stroke-rose-500',
         glow: 'shadow-[0_0_50px_rgba(244,63,94,0.2)]'
      };
      return { 
         bg: 'bg-slate-900/90', 
         border: 'border-slate-500/40', 
         accent: 'text-slate-400', 
         shadow: 'shadow-slate-500/10', 
         ratingBg: 'bg-slate-500/10', 
         circle: 'stroke-slate-500',
         glow: ''
      };
   };
   
   const config = getRatingConfig(team.rating);

   return (
      <div className={`${config.bg} border-2 ${config.border} ${config.shadow} ${config.glow} p-10 rounded-[4rem] backdrop-blur-3xl group relative overflow-hidden min-h-[550px] flex flex-col justify-between transition-all hover:scale-[1.02]`}>
         
         <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform -rotate-12"><Trophy size={200} /></div>

         {/* [1] HEADER: IDENTIDADE & TSR INDICATOR */}
         <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none italic">
                  {index === 0 ? 'Equipe Alfa' : index === 1 ? 'Equipe Beta' : 'Equipe Gama'}
               </h4>
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{team.name}</h3>
            </div>
            <div className="text-right space-y-1">
               <span className="block text-[8px] font-black uppercase text-slate-500 tracking-widest italic">TSR INDICATOR</span>
               <div className={`text-3xl font-black ${config.accent} italic font-mono flex items-center justify-end gap-2`}>
                  {team.tsr.toFixed(1)}% <TrendingUp size={20} className="animate-pulse" />
               </div>
               <p className="text-[7px] text-slate-600 font-bold uppercase">VALORIZAÇÃO DO IMPÉRIO</p>
            </div>
         </div>

         {/* [2] CENTRAL: CREDIT RATING & [3] MARKET SHARE GAUGE */}
         <div className="grid grid-cols-2 gap-8 items-center py-8 relative z-10">
            <div className="flex flex-col items-center gap-3">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">CREDIT RATING</span>
               <div className={`w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center relative shadow-2xl ${config.ratingBg}`}>
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="64" cy="64" r="58" fill="none" strokeWidth="6" className={`opacity-10 ${config.circle}`} />
                     <circle cx="64" cy="64" r="58" fill="none" strokeWidth="8" strokeDasharray="364" strokeDashoffset={364 - (364 * 0.85)} className={`${config.circle} drop-shadow-[0_0_8px_currentColor]`} />
                  </svg>
                  <span className="text-5xl font-black text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{team.rating}</span>
               </div>
            </div>

            <div className="flex flex-col items-center gap-3">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">MARKET SHARE</span>
               <div className="w-32 h-32 relative flex items-center justify-center bg-slate-950/40 rounded-full border border-white/5">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="64" cy="64" r="50" fill="none" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                     <circle cx="64" cy="64" r="50" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="314" strokeDashoffset={314 - (314 * team.market_share / 100)} className="text-orange-500 drop-shadow-[0_0_10px_#f97316]" />
                  </svg>
                  <span className="text-2xl font-black text-white italic font-mono">{team.market_share.toFixed(1)}%</span>
               </div>
            </div>
         </div>

         {/* [4], [5], [6], [7] - MATRIZ TÉCNICA (NLCDG, Solvency, EBITDA, DCF) */}
         <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5 relative z-10">
            <MetricBox label="NLCDG Score" val={team.nlcdg.toFixed(1)} icon={<ActivitySquare size={10} className="text-blue-400"/>} />
            <MetricBox label="Solvency (Kanitz)" val={team.kanitz.toFixed(1)} icon={<Thermometer size={10} className="text-emerald-400"/>} trend={team.kanitz > 0 ? 'safe' : 'danger'} />
            <MetricBox label="EBITDA (M)" val={`$ ${team.ebitda.toFixed(1)}`} icon={<Zap size={10} className="text-orange-500"/>} />
            <MetricBox label="DCF Valuation" val={`$ ${team.dcf.toFixed(1)}M`} icon={<DollarSign size={10} className="text-emerald-500"/>} highlight />
         </div>

      </div>
   );
};

/* MINI COMPONENTE DE MÉTRICA PARA O GRID DO CARD */
const MetricBox = ({ label, val, icon, trend, highlight }: any) => (
   <div className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all ${highlight ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-slate-950/60 border-white/5 hover:border-white/20'}`}>
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
         </div>
         {trend && (
            <div className={`w-1.5 h-1.5 rounded-full ${trend === 'safe' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-rose-500 animate-pulse shadow-[0_0_5px_#f43f5e]'}`} />
         )}
      </div>
      <span className={`text-lg font-black italic font-mono tracking-tighter ${highlight ? 'text-indigo-400' : 'text-slate-100'}`}>{val}</span>
   </div>
);

export default TutorDecisionMonitor;
