
import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  Users, Eye, CheckCircle2, AlertCircle, FileText, 
  BarChart3, RefreshCw, ChevronRight, MapPin, DollarSign,
  Factory, Megaphone, UserPlus, Sliders, Target, Monitor,
  TrendingUp, ShieldAlert, Activity, Scale, Shield,
  History, User, AlertOctagon, Key, Banknote, Landmark,
  TrendingDown, HeartPulse, Loader2
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship, CreditRating, Branch, EcosystemConfig, MacroIndicators } from '../types';

interface TeamProgress {
  team_id: string;
  team_name: string;
  status: 'sealed' | 'draft' | 'pending';
  last_update?: string;
  data?: any;
  risk?: number;
  rating?: CreditRating;
  insolvent?: boolean;
  insolvency_deficit?: number;
  master_key_enabled?: boolean;
  auditLogs?: any[];
}

const TutorDecisionMonitor: React.FC<{ championshipId: string; round: number }> = ({ championshipId, round }) => {
  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamProgress | null>(null);
  const [arena, setArena] = useState<Championship | null>(null);

  const fetchLiveDecisions = async () => {
    setLoading(true);
    try {
      const { data: arenaData } = await supabase.from('championships').select('*').eq('id', championshipId).maybeSingle();
      if (arenaData) setArena(arenaData as Championship);

      const { data: teamsData } = await supabase.from('teams').select('id, name, master_key_enabled').eq('championship_id', championshipId);
      const { data: decisionsData } = await supabase.from('current_decisions').select('*').eq('championship_id', championshipId).eq('round', round);
      const { data: auditData } = await supabase.from('decision_audit_log').select('*').eq('championship_id', championshipId).eq('round', round).order('changed_at', { ascending: false });

      if (teamsData && arenaData) {
        const progress: TeamProgress[] = teamsData.map(t => {
          const decision = decisionsData?.find(d => d.team_id === t.id);
          
          // Cast explicitly for calculation safety
          const branch = (arenaData.branch || 'industrial') as Branch;
          const eco = (arenaData.ecosystemConfig || { 
            inflationRate: 0.01, 
            demandMultiplier: 1.0, 
            interestRate: 0.03, 
            marketVolatility: 0.05, 
            scenarioType: 'simulated', 
            modalityType: 'standard' 
          }) as EcosystemConfig;
          const macro = (arenaData.market_indicators) as MacroIndicators;

          const proj = decision ? calculateProjections(decision.data, branch, eco, macro) : null;
          const teamAudit = auditData?.filter(a => a.team_id === t.id) || [];

          return {
            team_id: t.id,
            team_name: t.name,
            status: decision ? (decision.status === 'sealed' ? 'sealed' : 'draft') : 'pending',
            last_update: decision?.submitted_at,
            data: decision?.data,
            risk: proj?.health?.insolvency_risk ?? 0,
            rating: (proj?.health?.rating ?? 'N/A') as CreditRating,
            insolvent: proj ? ((proj.totalOutflow ?? 0) > (proj.totalLiquidity ?? 0)) : false,
            insolvency_deficit: proj?.health?.insolvency_deficit ?? 0,
            master_key_enabled: t.master_key_enabled,
            auditLogs: teamAudit
          };
        });
        
        setTeams(progress);
        
        if (selectedTeam) {
            const updatedSelected = progress.find(t => t.team_id === selectedTeam.team_id);
            if (updatedSelected) setSelectedTeam(updatedSelected);
        }
      }
    } catch (e) { 
      console.error("Monitor Data Fetch Failure:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchLiveDecisions();
    const channel = supabase.channel(`monitor-${championshipId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'current_decisions' }, () => fetchLiveDecisions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests' }, () => fetchLiveDecisions())
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [championshipId, round]);

  const handleToggleMasterKey = async (teamId: string, current: boolean) => {
    const { error } = await supabase.from('teams').update({ master_key_enabled: !current }).eq('id', teamId);
    if (!error) fetchLiveDecisions();
  };

  if (loading && teams.length === 0) {
    return (
      <div className="p-20 text-center space-y-4">
        <Loader2 className="animate-spin mx-auto text-orange-500" size={48} />
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Sincronizando Auditoria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
       
       {/* DASHBOARD DE SAÚDE SISTÊMICA PARA O TUTOR */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
             <ClassCreditHealth teamsProjections={teams} />
          </div>
          <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12"><ShieldAlert size={160} /></div>
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                   <ShieldAlert className="text-orange-500" size={24} />
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Resumo de Auditoria</h3>
                </div>
                <div className="space-y-4">
                   <AuditKPI label="Equipes em Draft" val={teams.filter(t => t.status === 'draft').length} color="blue" />
                   <AuditKPI label="Risco Crítico (C/D)" val={teams.filter(t => t.rating === 'C' || t.rating === 'D').length} color="rose" />
                   <AuditKPI label="Unidades Insolventes" val={teams.filter(t => t.insolvent).length} color="rose" highlight />
                </div>
             </div>
             <div className="pt-6 border-t border-white/5 relative z-10">
                <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-relaxed">
                   "Use o Oracle Master para reajustar taxas se o risco sistêmico ultrapassar 50% das unidades."
                </p>
             </div>
          </div>
       </div>

       <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
          <header className="flex items-center justify-between border-b border-slate-50 pb-10">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><Monitor size={32}/></div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Node Inquisitor (P0{round})</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Monitoramento Granular e Autorização Master</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Arena Sync</span>
                      <span className="text-xs font-black text-emerald-500 uppercase">Realtime Active</span>
                   </div>
                   <button onClick={fetchLiveDecisions} className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                      <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                   </button>
                </div>
             </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {teams.map((team) => (
               <button 
                 key={team.team_id}
                 onClick={() => setSelectedTeam(team)}
                 className={`p-10 rounded-[3.5rem] border transition-all text-left group relative overflow-hidden ${
                   selectedTeam?.team_id === team.team_id ? 'border-orange-600 bg-orange-50 shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:shadow-xl'
                 }`}
               >
                  {team.rating === 'D' && (
                     <div className="absolute top-0 right-0 p-4 bg-rose-600 text-white animate-pulse">
                        <AlertOctagon size={20} />
                     </div>
                  )}
                  <div className="flex justify-between items-start mb-8">
                     <div className={`p-4 rounded-2xl ${team.status === 'sealed' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : team.status === 'draft' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-slate-100 text-slate-300'}`}>
                        {team.status === 'sealed' ? <CheckCircle2 size={20}/> : team.status === 'draft' ? <Activity size={20}/> : <Monitor size={20}/>}
                     </div>
                     <div className="text-right">
                        <span className={`block text-[10px] font-black uppercase tracking-widest ${team.rating === 'D' ? 'text-rose-600 font-black animate-pulse' : 'text-slate-400'}`}>{team.rating ?? 'N/A'}</span>
                        <div className={`w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden`}>
                           <div className={`h-full ${team.rating === 'D' ? 'bg-rose-600' : (team.risk ?? 0) > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${team.risk ?? 0}%` }} />
                        </div>
                     </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{team.team_name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{team.rating === 'D' ? 'INSOLVÊNCIA CRÍTICA DETETADA' : team.status === 'pending' ? 'AGUARDANDO CONEXÃO' : 'DECISÃO EM RASCUNHO'}</p>
               </button>
             ))}
          </div>
       </div>

       <AnimatePresence mode="wait">
          {selectedTeam && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 bg-slate-900 p-16 rounded-[5rem] border border-white/10 shadow-2xl text-white space-y-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 opacity-[0.02] rotate-12"><Scale size={400}/></div>
                  
                  <header className="flex justify-between items-end border-b border-white/5 pb-12 relative z-10">
                     <div className="space-y-4">
                        <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Audit Briefing</span>
                        <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{selectedTeam.team_name}</h3>
                     </div>
                     <div className="text-right">
                        <span className="block text-[9px] font-black text-slate-500 uppercase mb-2">Insolvency Status</span>
                        <div className={`text-6xl font-black italic font-mono ${selectedTeam.rating === 'D' ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                           {selectedTeam.rating === 'D' ? 'BROKE' : 'STABLE'}
                        </div>
                     </div>
                  </header>

                  <div className="space-y-10 relative z-10">
                     <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black uppercase italic flex items-center gap-3"><History size={24} className="text-blue-400" /> Relatório de Auditoria (Timeline)</h4>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleToggleMasterKey(selectedTeam.team_id, !!selectedTeam.master_key_enabled)}
                             className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${selectedTeam.master_key_enabled ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                           >
                              <Key size={14} /> {selectedTeam.master_key_enabled ? 'Master Key Ativa' : 'Autorizar Submissão'}
                           </button>
                        </div>
                     </div>

                     <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                        {(!selectedTeam.auditLogs || selectedTeam.auditLogs.length === 0) ? (
                          <div className="p-10 bg-white/5 border border-white/5 border-dashed rounded-[3rem] text-center opacity-40">
                             <FileText size={48} className="mx-auto mb-4" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Sem logs de alteração neste round.</p>
                          </div>
                        ) : (
                          selectedTeam.auditLogs.map((log, idx) => (
                            <div key={idx} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-4 hover:bg-white/[0.08] transition-all">
                               <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center"><User size={16}/></div>
                                     <span className="text-xs font-black uppercase text-white tracking-tight">{log.user_id || 'Membro Alpha'}</span>
                                  </div>
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(log.changed_at).toLocaleString()}</span>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                  <div className="space-y-4">
                                     <div>
                                        <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">Campo Alterado</span>
                                        <span className="text-xs font-mono text-orange-400">{log.field_path}</span>
                                     </div>
                                     {log.impact_on_cash !== undefined && (
                                       <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                          <Banknote size={14} className="text-emerald-500" />
                                          <div>
                                             <span className="block text-[7px] font-black text-slate-500 uppercase">Impacto no Caixa</span>
                                             <span className={`text-xs font-mono font-black ${log.impact_on_cash < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                $ {log.impact_on_cash.toLocaleString()}
                                             </span>
                                          </div>
                                       </div>
                                     )}
                                  </div>
                                  <div className="space-y-4">
                                     <div className="flex justify-between">
                                        <div>
                                           <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">Anterior</span>
                                           <span className="text-xs font-mono text-slate-500 line-through">{JSON.stringify(log.old_value)}</span>
                                        </div>
                                        <div className="text-right">
                                           <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">Novo</span>
                                           <span className="text-xs font-mono text-white font-black">{JSON.stringify(log.new_value)}</span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
               </div>

               <aside className="lg:col-span-4 space-y-8">
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
                     <h4 className="text-xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-3"><Target className="text-orange-600" /> Comando do Tutor</h4>
                     <div className="space-y-6">
                        <textarea className="w-full h-40 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 text-sm font-medium focus:border-orange-500 outline-none resize-none transition-all" placeholder="Digite seu veredito estratégico..."></textarea>
                        <button className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 transition-all shadow-xl active:scale-95">Injetar Feedback</button>
                     </div>
                  </div>
               </aside>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

/**
 * ClassCreditHealth: Histograma de Rating de Crédito da Turma.
 */
const ClassCreditHealth = ({ teamsProjections }: { teamsProjections: TeamProgress[] }) => {
  const ratingsOrder: CreditRating[] = ['AAA', 'AA', 'A', 'B', 'C', 'D'];
  
  const distribution = useMemo(() => {
    if (!teamsProjections) return ratingsOrder.map(r => ({ rating: r, count: 0 }));
    return ratingsOrder.map(r => ({
      rating: r,
      count: teamsProjections.filter(t => (t.rating ?? 'N/A') === r).length
    }));
  }, [teamsProjections]);

  const COLORS_MAP = {
    'AAA': '#10b981', 'AA': '#34d399', 'A': '#6ee7b7',
    'B': '#fbbf24', 'C': '#f87171', 'D': '#b91c1c', 'N/A': '#334155'
  };

  const chartOptions: any = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    plotOptions: { 
      bar: { 
        borderRadius: 12, 
        columnWidth: '55%', 
        distributed: true,
        dataLabels: { position: 'top' }
      } 
    },
    colors: ratingsOrder.map(r => COLORS_MAP[r as keyof typeof COLORS_MAP]),
    xaxis: {
      categories: ratingsOrder,
      labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 900 } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: '#475569', fontWeight: 700 } },
      tickAmount: 4
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 0 ? val : '',
      style: { colors: ['#fff'], fontSize: '10px', fontWeight: 900 },
      offsetY: -20
    },
    tooltip: { theme: 'dark' },
    legend: { show: false }
  };

  return (
    <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8">
       <div className="flex justify-between items-start">
          <div className="space-y-1">
             <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Saúde Sistêmica da Arena</h3>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Distribuição de Rating de Crédito em Tempo Real</p>
          </div>
          <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
             <span className="text-[10px] text-orange-500 font-black uppercase">N = {teamsProjections?.length ?? 0} Strategists</span>
          </div>
       </div>

       <div className="h-[280px] w-full">
          <Chart options={chartOptions} series={[{ name: 'Equipes', data: distribution.map(d => d.count) }]} type="bar" height="100%" />
       </div>

       <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zona de Estabilidade (AAA-A)</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risco de Default (C-D)</span>
          </div>
       </div>
    </div>
  );
};

const AuditKPI = ({ label, val, color, highlight }: any) => (
  <div className={`p-4 rounded-2xl flex justify-between items-center transition-all ${highlight ? 'bg-rose-500 text-white shadow-xl' : 'bg-white/5 border border-white/5'}`}>
     <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-white' : 'text-slate-500'}`}>{label}</span>
     <span className={`text-xl font-black font-mono ${highlight ? 'text-white' : color === 'rose' ? 'text-rose-500' : 'text-blue-400'}`}>{val}</span>
  </div>
);

export default TutorDecisionMonitor;
