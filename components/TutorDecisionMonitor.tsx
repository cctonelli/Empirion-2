
import React, { useState, useEffect, useMemo, memo } from 'react';
import Chart from 'react-apexcharts';
import { 
  History, Users, Landmark, Monitor, TrendingUp, 
  Zap, Activity, Trophy, ArrowRight,
  ShieldCheck, Loader2, DollarSign,
  Thermometer, ActivitySquare, GripVertical,
  AlertTriangle, BrainCircuit, MessageSquare, Sparkles, X, Clock, Globe, PoundSterling, Scale
} from 'lucide-react';
import { motion as _motion, AnimatePresence, Reorder } from 'framer-motion';
const motion = _motion as any;
import { supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { GoogleGenAI } from '@google/genai';
import { Branch, EcosystemConfig, CreditRating, TutorTeamView, AuditLog, Championship, MacroIndicators } from '../types';
import ChampionshipTimer from './ChampionshipTimer';

import GazetteViewer from './GazetteViewer';
import { Newspaper, PackagePlus, FileEdit } from 'lucide-react';

import FinancialReportMatrix from './FinancialReportMatrix';

interface MonitorProps {
  championshipId: string;
  round: number;
  isTrial?: boolean;
}

const TutorDecisionMonitor: React.FC<MonitorProps> = ({ championshipId, round, isTrial = false }) => {
  const [teams, setTeams] = useState<TutorTeamView[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimelineNode, setActiveTimelineNode] = useState(round);
  const [arena, setArena] = useState<Championship | null>(null);
  const [showGazette, setShowGazette] = useState(false);

  const fetchLiveState = async (targetNode: number) => {
    setLoading(true);
    try {
      const champTable = isTrial ? 'trial_championships' : 'championships';
      const teamsTable = isTrial ? 'trial_teams' : 'teams';
      const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';
      const historyTable = isTrial ? 'trial_companies' : 'companies';

      const { data: arenaData } = await supabase.from(champTable).select('*').eq('id', championshipId).single();
      if (arenaData) setArena(arenaData);

      let processedTeams: TutorTeamView[] = [];
      const isLive = targetNode >= round;

      if (isLive) {
        const { data: teamsData } = await supabase.from(teamsTable).select('*').eq('championship_id', championshipId);
        const { data: decisionsData } = await supabase.from(decisionsTable).select('*').eq('championship_id', championshipId).eq('round', targetNode);

        processedTeams = (teamsData || []).map(t => {
          const decision = decisionsData?.find(d => d.team_id === t.id);
          const branch = (arenaData?.branch || 'industrial') as Branch;
          const eco: EcosystemConfig = (arenaData?.ecosystemConfig || { 
            inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' 
          });
          
          const currentRules = arenaData?.round_rules?.[targetNode] || DEFAULT_INDUSTRIAL_CHRONOGRAM[targetNode] || arenaData?.market_indicators;
          const indicatorsForNode = { ...arenaData?.market_indicators, ...currentRules };
          
          const proj = decision ? calculateProjections(decision.data, branch, eco, indicatorsForNode, t) : null;

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
            export_tariff_brazil: proj?.kpis?.export_tariff_brazil || t.kpis?.export_tariff_brazil || 0,
            export_tariff_uk: proj?.kpis?.export_tariff_uk || t.kpis?.export_tariff_uk || 0,
            brl_rate: proj?.kpis?.brl_rate || t.kpis?.brl_rate || 1,
            gbp_rate: proj?.kpis?.gbp_rate || t.kpis?.gbp_rate || 0,
            auditLogs: (decision?.data?.audit_logs || []) as AuditLog[],
            current_decision: decision?.data,
            statements: proj?.statements || t.kpis?.statements,
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
          export_tariff_brazil: h.export_tariff_brazil || h.kpis?.export_tariff_brazil || 0,
          export_tariff_uk: h.export_tariff_uk || h.kpis?.export_tariff_uk || 0,
          brl_rate: h.brl_rate || h.kpis?.brl_rate || 1,
          gbp_rate: h.gbp_rate || h.kpis?.gbp_rate || 0,
          auditLogs: [],
          statements: h.kpis?.statements,
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
    if (activeTimelineNode >= round) {
      const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';
      const channel = supabase.channel(`tutor-monitor-${championshipId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: decisionsTable, filter: `championship_id=eq.${championshipId}` }, () => fetchLiveState(activeTimelineNode))
        .subscribe();
      return () => { channel.unsubscribe(); };
    }
  }, [championshipId, activeTimelineNode, round]);

  const currentIndicators = useMemo(() => {
    if (!arena) return null;
    const rules = arena.round_rules?.[activeTimelineNode] || DEFAULT_INDUSTRIAL_CHRONOGRAM[activeTimelineNode] || arena.market_indicators;
    return { ...arena.market_indicators, ...rules } as MacroIndicators;
  }, [arena, activeTimelineNode]);

  if (loading && teams.length === 0) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-orange-500" size={64} />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Sincronizando War Room...</span>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-40">
      <header className="px-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div className="flex flex-col md:flex-row md:items-end gap-6">
            {arena && (
               <div className="mb-2">
                  <ChampionshipTimer 
                    variant="compact"
                    roundStartedAt={arena.round_started_at}
                    deadlineValue={arena.deadline_value}
                    deadlineUnit={arena.deadline_unit}
                    createdAt={arena.created_at}
                  />
               </div>
            )}
            <div>
               <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                  Dashboard do Tutor: <span className="text-orange-500">Comando Estratégico</span>
               </h1>
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Arena Empirion Oracle v18.0 • IA Telemetry Control</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowGazette(true)}
              className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              <Newspaper size={14} /> Gazeta P0{activeTimelineNode}
            </button>
            <div className="flex items-center gap-3 px-6 py-2 bg-slate-900 border border-white/10 rounded-2xl">
               <div className={`w-2 h-2 rounded-full ${activeTimelineNode >= round ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {activeTimelineNode >= round ? 'Monitorando Decisões Live' : `Visualizando Histórico P0${activeTimelineNode}`}
               </span>
            </div>
         </div>
      </header>

      {/* Indicadores do Período Selecionado */}
      {currentIndicators && (
        <div className="px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
           <QuickIndicator label="ICE" val={`${currentIndicators.ice}%`} />
           <QuickIndicator label="Inflação" val={`${currentIndicators.inflation_rate}%`} />
           <QuickIndicator label="Taxa TR" val={`${currentIndicators.interest_rate_tr}%`} />
           <QuickIndicator label="Demanda" val={`${currentIndicators.demand_variation}%`} />
           <QuickIndicator label="BP Obrigatório" val={currentIndicators.require_business_plan ? 'SIM' : 'NÃO'} highlight={currentIndicators.require_business_plan} />
           <QuickIndicator label="Compra Máquinas" val={currentIndicators.allow_machine_sale ? 'LIBERADA' : 'BLOQUEADA'} highlight={currentIndicators.allow_machine_sale} />
        </div>
      )}

      <div className="px-4">
        <Reorder.Group axis="x" values={teams} onReorder={setTeams} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {teams.map((team, idx) => (
            <Reorder.Item key={team.id} value={team}>
              <TeamCardDetailed team={team} index={idx} isLive={activeTimelineNode >= round} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 h-32 bg-slate-950/90 backdrop-blur-3xl border-t border-white/10 z-[3000] flex items-center justify-center px-12">
         <div className="max-w-7xl w-full flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
            {Array.from({ length: (arena?.total_rounds || 12) + 1 }).map((_, i) => {
               const rules = arena?.round_rules?.[i] || DEFAULT_INDUSTRIAL_CHRONOGRAM[i] || arena?.market_indicators;
               const hasBP = rules?.require_business_plan;
               const canBuy = rules?.allow_machine_sale;
               
               return (
                  <button 
                    key={i} 
                    onClick={() => setActiveTimelineNode(i)} 
                    className={`relative z-10 w-14 h-14 rounded-full border-4 transition-all flex items-center justify-center group ${activeTimelineNode === i ? 'bg-orange-600 border-orange-400 scale-125 shadow-[0_0_30px_#f97316]' : i <= round ? 'bg-slate-800 border-blue-500/50' : 'bg-slate-950 border-white/5 opacity-40'}`}
                  >
                     <span className={`text-xs font-black font-mono ${activeTimelineNode === i ? 'text-white' : 'text-slate-500'}`}>P{i < 10 ? `0${i}` : i}</span>
                     
                     {/* Metadata Icons */}
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {hasBP && <div className="p-1 bg-blue-600 rounded text-[6px] text-white font-black uppercase flex items-center gap-1 shadow-lg"><FileEdit size={6}/> BP</div>}
                        {canBuy && <div className="p-1 bg-emerald-600 rounded text-[6px] text-white font-black uppercase flex items-center gap-1 shadow-lg"><PackagePlus size={6}/> MÁQ</div>}
                     </div>
                  </button>
               );
            })}
         </div>
      </footer>

      <AnimatePresence>
        {showGazette && arena && (
          <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-10">
            <GazetteViewer 
              arena={arena} 
              aiNews="" 
              round={activeTimelineNode} 
              onClose={() => setShowGazette(false)} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuickIndicator = ({ label, val, highlight }: any) => (
  <div className={`p-4 rounded-2xl border ${highlight ? 'bg-orange-600/10 border-orange-500/30' : 'bg-slate-900 border-white/5'} flex flex-col gap-1`}>
    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-black italic ${highlight ? 'text-orange-500' : 'text-white'}`}>{val}</span>
  </div>
);

const TeamCardDetailed = memo(({ team, index, isLive }: { team: TutorTeamView, index: number, isLive: boolean }) => {
   const [isAuditing, setIsAuditing] = useState(false);
   const [aiVerdict, setAiVerdict] = useState<string | null>(null);
   const [showReports, setShowReports] = useState(false);
   const [reportType, setReportType] = useState<'dre' | 'balance' | 'cashflow'>('dre');

   const performAiAudit = async () => {
      if (isAuditing || (!team.current_decision && !team.statements)) return;
      setIsAuditing(true);
      try {
         const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
         const context = {
            decisions: team.current_decision,
            kpis: { tsr: team.tsr, rating: team.rating, market_share: team.market_share, ebitda: team.ebitda },
            statements: team.statements
         };

         const res = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Como auditor senior da Empirion, analise a saúde financeira e estratégica da equipe ${team.name}. 
            Contexto: ${JSON.stringify(context)}. 
            Forneça um veredito técnico de 25 palavras focado em riscos críticos ou oportunidades de mercado.`,
            config: { thinkingConfig: { thinkingBudget: 0 } }
         });
         setAiVerdict(res.text || null);
         setShowReports(true); // Abre os relatórios automaticamente ao auditar
      } catch (err) {
         console.error("Audit Error:", err);
         setAiVerdict("Erro na conexão neural. Verifique a API Key.");
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
                    <div className="flex gap-2 mt-4">
                       <button onClick={() => setShowReports(true)} className="flex-1 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-white/10 transition-all">Ver Relatórios</button>
                       <button onClick={() => setAiVerdict(null)} className="p-2 bg-white/5 border border-white/10 text-slate-500 hover:text-white rounded-lg transition-all"><X size={10}/></button>
                    </div>
                  </div>
               ) : (
                  <button onClick={performAiAudit} disabled={isAuditing || !isLive} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all flex items-center justify-center gap-2">
                     {isAuditing ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={14} />} Executar Auditoria
                  </button>
               )}
            </div>
         </div>

         <AnimatePresence>
            {showReports && (
               <div className="fixed inset-0 z-[6000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 border border-white/10 rounded-[4rem] w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-3xl">
                     <header className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><ShieldCheck size={24}/></div>
                           <div>
                              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Auditoria Financeira: {team.name}</h3>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Análise de Balanço, DRE e Fluxo de Caixa</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex p-1 bg-slate-950 rounded-xl border border-white/5">
                              <button onClick={() => setReportType('dre')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${reportType === 'dre' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>DRE</button>
                              <button onClick={() => setReportType('balance')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${reportType === 'balance' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Balanço</button>
                              <button onClick={() => setReportType('cashflow')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${reportType === 'cashflow' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>DFC</button>
                           </div>
                           <button onClick={() => setShowReports(false)} className="p-3 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-xl transition-all"><X size={20}/></button>
                        </div>
                     </header>
                     <div className="flex-1 overflow-hidden p-8">
                        <FinancialReportMatrix 
                           type={reportType} 
                           history={[]} 
                           projection={{ statements: team.statements } as any} 
                           currency="BRL" 
                        />
                     </div>
                     {aiVerdict && (
                        <footer className="p-6 bg-indigo-600/10 border-t border-indigo-500/20">
                           <div className="flex items-center gap-4">
                              <Sparkles size={16} className="text-indigo-400 animate-pulse"/>
                              <p className="text-xs text-indigo-200 font-bold italic">Veredito Oracle: "{aiVerdict}"</p>
                           </div>
                        </footer>
                     )}
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5 relative z-10">
            <MetricBox label="Kanitz Solvency" val={team.kanitz.toFixed(1)} icon={<Thermometer size={12} className="text-emerald-400"/>} trend={team.kanitz > 0 ? 'safe' : 'danger'} />
            <MetricBox label="Market Share" val={`${team.market_share.toFixed(1)}%`} icon={<Activity size={12} className="text-orange-500"/>} />
            <MetricBox label="Ciclo Caixa (CCC)" val={`${team.ccc?.toFixed(0)}d`} icon={<Clock size={12} className="text-blue-400"/>} />
            <MetricBox label="Cobertura Juros" val={`${team.interest_coverage?.toFixed(1)}x`} icon={<ShieldCheck size={12} className="text-purple-400"/>} />
            <MetricBox label="NLCDG Unit" val={`$ ${team.nlcdg.toFixed(1)}M`} icon={<Zap size={12} className="text-orange-500"/>} />
            <MetricBox label="DCF Valuation" val={`$ ${team.dcf.toFixed(1)}M`} icon={<DollarSign size={12} className="text-indigo-400"/>} highlight />
         </div>

         {/* Market Intelligence v18.8 */}
         <div className="mt-6 flex flex-wrap gap-2 relative z-10">
            <div className="px-3 py-1.5 bg-slate-950/80 border border-white/5 rounded-lg flex items-center gap-2">
               <Globe size={10} className="text-emerald-400"/>
               <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">BRL: {team.brl_rate?.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-950/80 border border-white/5 rounded-lg flex items-center gap-2">
               <PoundSterling size={10} className="text-blue-400"/>
               <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">GBP: {team.gbp_rate?.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-950/80 border border-white/5 rounded-lg flex items-center gap-2">
               <Scale size={10} className="text-orange-400"/>
               <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Tarifa BR: {team.export_tariff_brazil}%</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-950/80 border border-white/5 rounded-lg flex items-center gap-2">
               <Scale size={10} className="text-blue-400"/>
               <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Tarifa UK: {team.export_tariff_uk}%</span>
            </div>
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
