
import React, { useState, useEffect, useMemo, memo } from 'react';
import Chart from 'react-apexcharts';
import { 
  History, Users, Landmark, Monitor, TrendingUp, 
  Zap, Activity, Trophy, ArrowRight,
  ShieldCheck, Loader2, DollarSign,
  Thermometer, ActivitySquare, GripVertical,
  AlertTriangle, BrainCircuit, MessageSquare, Sparkles, X, Clock
} from 'lucide-react';
import { motion as _motion, AnimatePresence, Reorder } from 'framer-motion';
const motion = _motion as any;
import { supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { GoogleGenAI } from '@google/genai';
import { Branch, EcosystemConfig, CreditRating, TutorTeamView, AuditLog, Championship } from '../types';

interface MonitorProps {
  championshipId: string;
  round: number;
  isTrial?: boolean;
}

const TutorDecisionMonitor: React.FC<MonitorProps> = ({ championshipId, round, isTrial = false }) => {
  const [teams, setTeams] = useState<TutorTeamView[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimelineNode, setActiveTimelineNode] = useState(round + 1);
  const [arena, setArena] = useState<Championship | null>(null);

  const fetchLiveState = async (targetNode: number) => {
    try {
      const champTable = isTrial ? 'trial_championships' : 'championships';
      const teamsTable = isTrial ? 'trial_teams' : 'teams';
      const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';
      const historyTable = isTrial ? 'trial_companies' : 'companies';

      const { data: arenaData } = await supabase.from(champTable).select('*').eq('id', championshipId).single();
      if (!arena) setArena(arenaData);

      let processedTeams: TutorTeamView[] = [];

      if (targetNode > round) {
        const { data: teamsData } = await supabase.from(teamsTable).select('*').eq('championship_id', championshipId);
        const { data: decisionsData } = await supabase.from(decisionsTable).select('*').eq('championship_id', championshipId).eq('round', targetNode);

        processedTeams = (teamsData || []).map(t => {
          const decision = decisionsData?.find(d => d.team_id === t.id);
          const branch = (arenaData?.branch || 'industrial') as Branch;
          const eco: EcosystemConfig = (arenaData?.ecosystemConfig || { 
            inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' 
          });
          
          const proj = decision ? calculateProjections(decision.data, branch, eco, arenaData?.market_indicators || arenaData?.initial_market_data, t) : null;

          return {
            id: t.id,
            name: t.name,
            rating: (proj?.kpis?.rating || t.kpis?.rating || 'N/A') as CreditRating,
            tsr: proj?.kpis?.tsr || t.kpis?.tsr || 0, 
            market_share: (proj?.marketShare || t.kpis?.market_share || 0),
            nlcdg: proj?.kpis?.nlcdg || t.kpis?.nlcdg || 0,
            ebitda: proj?.kpis?.ebitda || t.kpis?.ebitda || 0,
            kanitz: proj?.kpis?.solvency_score_kanitz || t.kpis?.solvency_score_kanitz || 0,
            dcf: proj?.kpis?.dcf_valuation || t.kpis?.dcf_valuation || 0,
            ccc: proj?.kpis?.ccc || t.kpis?.ccc || 0,
            interest_coverage: proj?.kpis?.interest_coverage || t.kpis?.interest_coverage || 0,
            auditLogs: (decision?.data?.audit_logs || []) as AuditLog[],
            current_decision: decision?.data,
            is_bot: t.is_bot,
            strategic_profile: t.strategic_profile
          };
        });
      } else {
        const { data: historyData } = await supabase.from(historyTable)
          .select('*, team:teams(name, is_bot, strategic_profile)')
          .eq('championship_id', championshipId)
          .eq('round', targetNode);

        processedTeams = (historyData || []).map(h => ({
          id: h.team_id,
          name: h.team?.name || 'Unidade Histórica',
          rating: (h.kpis?.rating || 'N/A') as CreditRating,
          tsr: h.tsr || h.kpis?.tsr || 0,
          market_share: h.market_share || h.kpis?.market_share || 0,
          nlcdg: h.nlcdg || h.kpis?.nlcdg || 0,
          ebitda: h.ebitda || h.kpis?.ebitda || 0,
          kanitz: h.solvency_score_kanitz || h.kpis?.solvency_score_kanitz || 0,
          dcf: h.dcf_valuation || h.kpis?.dcf_valuation || 0,
          ccc: h.ccc || h.kpis?.ccc || 0,
          interest_coverage: h.interest_coverage || h.kpis?.interest_coverage || 0,
          auditLogs: [],
          is_bot: h.team?.is_bot,
          strategic_profile: h.team?.strategic_profile
        }));
      }
      setTeams(processedTeams);
    } catch (e) {
      console.error("Oracle Sync Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveState(activeTimelineNode);
    if (activeTimelineNode > round) {
      const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';
      const channel = supabase.channel(`tutor-monitor-${championshipId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: decisionsTable, filter: `championship_id=eq.${championshipId}` }, () => fetchLiveState(activeTimelineNode))
        .subscribe();
      return () => { channel.unsubscribe(); };
    }
  }, [championshipId, activeTimelineNode, round]);

  if (loading && teams.length === 0) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-orange-500" size={64} />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Sincronizando War Room...</span>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-40">
      <header className="px-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
               Dashboard do Tutor: <span className="text-orange-500">Comando Estratégico</span>
            </h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Arena Empirion Oracle v18.0 • IA Telemetry Control</p>
         </div>
         <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 border border-white/10 rounded-2xl">
            <div className={`w-2 h-2 rounded-full ${activeTimelineNode > round ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
               {activeTimelineNode > round ? 'Monitorando Decisões Live' : `Visualizando Histórico P0${activeTimelineNode}`}
            </span>
         </div>
      </header>

      <div className="px-4">
        <Reorder.Group axis="x" values={teams} onReorder={setTeams} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {teams.map((team, idx) => (
            <Reorder.Item key={team.id} value={team}>
              <TeamCardDetailed team={team} index={idx} isLive={activeTimelineNode > round} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 h-32 bg-slate-950/90 backdrop-blur-3xl border-t border-white/10 z-[3000] flex items-center justify-center px-12">
         <div className="max-w-7xl w-full flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
            {Array.from({ length: 13 }).map((_, i) => (
               <button key={i} onClick={() => setActiveTimelineNode(i)} className={`relative z-10 w-14 h-14 rounded-full border-4 transition-all flex items-center justify-center group ${activeTimelineNode === i ? 'bg-orange-600 border-orange-400 scale-125 shadow-[0_0_30px_#f97316]' : i <= round ? 'bg-slate-800 border-blue-500/50' : 'bg-slate-950 border-white/5 opacity-40'}`}>
                  <span className={`text-xs font-black font-mono ${activeTimelineNode === i ? 'text-white' : 'text-slate-500'}`}>P{i < 10 ? `0${i}` : i}</span>
               </button>
            ))}
         </div>
      </footer>
    </div>
  );
};

const TeamCardDetailed = memo(({ team, index, isLive }: { team: TutorTeamView, index: number, isLive: boolean }) => {
   const [isAuditing, setIsAuditing] = useState(false);
   const [aiVerdict, setAiVerdict] = useState<string | null>(null);

   const performAiAudit = async () => {
      if (isAuditing || !team.current_decision) return;
      setIsAuditing(true);
      try {
         const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
         const res = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Como auditor senior, analise estas decisões da equipe ${team.name}: ${JSON.stringify(team.current_decision)}. KPIs Projetados: TSR ${team.tsr}%, Rating ${team.rating}. Forneça um veredito técnico de 20 palavras focando no risco de insolvência ou vantagem competitiva.`,
            config: { thinkingConfig: { thinkingBudget: 0 } }
         });
         setAiVerdict(res.text || null);
      } catch (err) {
         setAiVerdict("Erro na conexão neural.");
      } finally {
         setIsAuditing(false);
      }
   };

   const ratingOptions: any = {
      chart: { type: 'radialBar', sparkline: { enabled: true } },
      plotOptions: {
         radialBar: {
            startAngle: -135, endAngle: 135,
            hollow: { size: '65%' },
            track: { background: 'rgba(255,255,255,0.05)' },
            dataLabels: { name: { show: false }, value: { offsetY: 10, fontSize: '28px', fontWeight: '900', color: '#fff', formatter: () => team.rating } }
         }
      },
      colors: [team.rating.startsWith('A') ? '#10b981' : team.rating.startsWith('B') ? '#f59e0b' : '#ef4444'],
      stroke: { lineCap: 'round' }
   };

   return (
      <div className={`bg-slate-900/90 border-2 rounded-[4rem] backdrop-blur-3xl p-10 relative overflow-hidden transition-all hover:scale-[1.02] flex flex-col justify-between min-h-[600px] shadow-2xl ${team.rating.startsWith('A') ? 'border-emerald-500/30' : 'border-rose-500/40'}`}>
         
         <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
               <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{team.is_bot ? 'Autonomous Node' : `Equipe ${String.fromCharCode(65 + index)}`}</h4>
                  {team.is_bot && team.strategic_profile && (
                     <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[7px] font-black uppercase tracking-widest">{team.strategic_profile}</span>
                  )}
               </div>
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{team.name}</h3>
            </div>
            <div className="text-right">
               <span className="block text-[8px] font-black uppercase text-slate-500 italic">TSR MOMENTUM</span>
               <div className="text-2xl font-black text-emerald-400 italic font-mono">{team.tsr.toFixed(1)}%</div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 items-center py-6 relative z-10">
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Oracle Rating</span>
               <div className="w-full h-32"><Chart options={ratingOptions} series={[85]} type="radialBar" height="100%" /></div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">AI Tactical Audit</span>
               {aiVerdict ? (
                  <div className="relative">
                    <p className="text-[10px] text-indigo-300 font-bold italic leading-relaxed">"{aiVerdict}"</p>
                    <button onClick={() => setAiVerdict(null)} className="absolute -top-6 -right-2 text-slate-500 hover:text-white"><X size={10}/></button>
                  </div>
               ) : (
                  <button onClick={performAiAudit} disabled={isAuditing || !isLive} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all flex items-center justify-center gap-2">
                     {isAuditing ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={14} />} Executar Auditoria
                  </button>
               )}
            </div>
         </div>

         <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5 relative z-10">
            <MetricBox label="Kanitz Solvency" val={team.kanitz.toFixed(1)} icon={<Thermometer size={12} className="text-emerald-400"/>} trend={team.kanitz > 0 ? 'safe' : 'danger'} />
            <MetricBox label="Market Share" val={`${team.market_share.toFixed(1)}%`} icon={<Activity size={12} className="text-orange-500"/>} />
            <MetricBox label="Ciclo Caixa (CCC)" val={`${team.ccc?.toFixed(0)}d`} icon={<Clock size={12} className="text-blue-400"/>} />
            <MetricBox label="Cobertura Juros" val={`${team.interest_coverage?.toFixed(1)}x`} icon={<ShieldCheck size={12} className="text-purple-400"/>} />
            <MetricBox label="NLCDG Unit" val={`$ ${team.nlcdg.toFixed(1)}M`} icon={<Zap size={12} className="text-orange-500"/>} />
            <MetricBox label="DCF Valuation" val={`$ ${team.dcf.toFixed(1)}M`} icon={<DollarSign size={12} className="text-indigo-400"/>} highlight />
         </div>
      </div>
   );
});

const MetricBox = ({ label, val, icon, trend, highlight }: any) => (
   <div className={`p-4 rounded-2xl border flex flex-col gap-1 ${highlight ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-slate-950/60 border-white/5'}`}>
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">{icon}<span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{label}</span></div>
         {trend && <div className={`w-1.5 h-1.5 rounded-full ${trend === 'safe' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />}
      </div>
      <span className={`text-lg font-black italic font-mono ${highlight ? 'text-indigo-400' : 'text-slate-100'}`}>{val}</span>
   </div>
);

export default TutorDecisionMonitor;
