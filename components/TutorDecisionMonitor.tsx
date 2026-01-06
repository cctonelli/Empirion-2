
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Chart from 'react-apexcharts';
import { 
  History, User, Key, Landmark, 
  ShieldAlert, Loader2, Monitor, Scale, 
  Activity, FileText, CheckCircle2, AlertOctagon, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { Branch, EcosystemConfig, CreditRating, TeamProgress, AuditLog } from '../types';

/**
 * ClassCreditHealth: Histograma Memoizado para exibição de Ratings.
 */
const ClassCreditHealth = React.memo(({ teamsProjections }: { teamsProjections: TeamProgress[] }) => {
  const ratingsOrder: CreditRating[] = ['AAA', 'AA', 'A', 'B', 'C', 'D'];
  
  const distribution = useMemo(() => {
    return ratingsOrder.map(r => ({
      rating: r,
      count: teamsProjections.filter(t => (t.rating ?? 'N/A') === r).length
    }));
  }, [teamsProjections]);

  const COLORS_MAP = {
    'AAA': '#10b981', 'AA': '#34d399', 'A': '#6ee7b7',
    'B': '#fbbf24', 'C': '#f87171', 'D': '#b91c1c', 'E': '#7c2d12', 'N/A': '#334155'
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
      labels: { 
        style: { 
          colors: '#94a3b8', 
          fontSize: '13px', 
          fontWeight: 800,
          fontFamily: 'JetBrains Mono'
        } 
      } 
    },
    yaxis: { 
      labels: { style: { colors: '#475569', fontSize: '11px' } }, 
      tickAmount: 4 
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    tooltip: { theme: 'dark' },
    legend: { show: false }
  };

  return (
    <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl">
      <div className="flex justify-between items-start mb-8">
         <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Saúde Sistêmica</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Distribuição de Rating em Tempo Real</p>
         </div>
         <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <span className="text-[10px] text-orange-500 font-black uppercase">N = {teamsProjections.length} Strategists</span>
         </div>
      </div>
      <div className="h-[280px] w-full">
         <Chart options={chartOptions} series={[{ name: 'Equipes', data: distribution.map(d => d.count) }]} type="bar" height="100%" />
      </div>
    </div>
  );
});

const TutorDecisionMonitor: React.FC<{ championshipId: string; round: number }> = ({ championshipId, round }) => {
  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamProgress | null>(null);
  const isMounted = useRef(true);

  const fetchLiveDecisions = async (signal?: AbortSignal) => {
    try {
      if (isMounted.current) setLoading(true);
      
      const { data: arenaData } = await supabase.from('championships').select('*').eq('id', championshipId).single();
      const { data: teamsData } = await supabase.from('teams').select('*').eq('championship_id', championshipId);
      const { data: decisionsData } = await supabase.from('current_decisions').select('*').eq('championship_id', championshipId).eq('round', round);

      if (signal?.aborted) return;

      const progress: TeamProgress[] = (teamsData || []).map(t => {
        const decision = decisionsData?.find(d => d.team_id === t.id);
        const branch = (arenaData?.branch || 'industrial') as Branch;
        const eco: EcosystemConfig = (arenaData?.ecosystemConfig || { 
          inflation_rate: 0.01, 
          demand_multiplier: 1.0, 
          interest_rate: 0.03, 
          market_volatility: 0.05, 
          scenario_type: 'simulated', 
          modality_type: 'standard' 
        });
        
        const proj = decision ? calculateProjections(decision.data, branch, eco, arenaData?.market_indicators, null) : null;

        return {
          team_id: t.id,
          team_name: t.name,
          status: decision?.status || 'pending',
          rating: (proj?.health?.rating || 'N/A') as CreditRating,
          risk: proj?.health?.insolvency_risk ?? 0,
          insolvent: proj?.health?.is_bankrupt ?? false,
          master_key_enabled: t.master_key_enabled,
          auditLogs: (decision?.audit_logs || []) as AuditLog[]
        };
      });

      if (isMounted.current) {
        setTeams(progress);
        if (selectedTeam) {
          const updated = progress.find(pt => pt.team_id === selectedTeam.team_id);
          if (updated) setSelectedTeam(updated);
        }
      }
    } catch (e) {
      console.error("Critical Failure in Sync:", e);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();
    
    fetchLiveDecisions(controller.signal);

    const channel = supabase.channel(`monitor-${championshipId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'current_decisions' }, () => fetchLiveDecisions(controller.signal))
      .subscribe();

    return () => {
      isMounted.current = false;
      controller.abort();
      channel.unsubscribe();
    };
  }, [championshipId, round]);

  const handleToggleMasterKey = async (teamId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('teams').update({ master_key_enabled: !currentStatus }).eq('id', teamId);
    if (!error && isMounted.current) fetchLiveDecisions();
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <ClassCreditHealth teamsProjections={teams} />
        </div>
        <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><ShieldAlert size={160} /></div>
           <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                 <ShieldAlert className="text-orange-500" size={24} />
                 <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Risco Sistêmico</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unidades Críticas</span>
                    <span className="text-3xl font-black text-rose-500 italic">{teams.filter(t => t.rating === 'D').length}</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-600 transition-all duration-1000" style={{ width: `${(teams.filter(t => t.rating === 'D').length / Math.max(teams.length, 1)) * 100}%` }} />
                 </div>
              </div>
           </div>
           <p className="text-[9px] text-slate-500 font-bold uppercase italic mt-6 leading-relaxed relative z-10">
              "Use o Oracle Master para reajustar taxas se o risco sistêmico ultrapassar 50% das unidades."
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {teams.map(team => (
          <button 
            key={team.team_id} 
            onClick={() => setSelectedTeam(team)}
            className={`p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden text-left ${
              selectedTeam?.team_id === team.team_id ? 'border-orange-600 bg-orange-50/5 shadow-2xl scale-[1.02]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'
            }`}
          >
             {team.rating === 'D' && <div className="absolute top-0 right-0 p-4 bg-rose-600 text-white animate-pulse"><AlertOctagon size={16} /></div>}
             <div className="flex justify-between items-center mb-6">
                <div className={`p-3 rounded-xl ${team.status === 'sealed' ? 'bg-emerald-500' : 'bg-blue-500'} text-white shadow-lg`}>
                   {team.status === 'sealed' ? <CheckCircle2 size={16}/> : <Activity size={16}/>}
                </div>
                <span className={`font-black text-[11px] uppercase tracking-widest ${team.rating === 'D' ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>{team.rating}</span>
             </div>
             <h4 className="text-xl font-black text-white uppercase italic leading-none truncate">{team.team_name}</h4>
             <p className="text-[8px] font-bold text-slate-500 uppercase mt-2">{team.rating === 'D' ? 'INSOLVÊNCIA CRÍTICA' : 'NODE STATUS ACTIVE'}</p>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedTeam && (
          <motion.div 
            key={selectedTeam.team_id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            <div className="lg:col-span-8 bg-slate-900 p-16 rounded-[5rem] border border-white/10 shadow-2xl text-white space-y-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-20 opacity-[0.02] rotate-12"><Scale size={400}/></div>
               <header className="flex justify-between items-end border-b border-white/5 pb-12 relative z-10">
                  <div className="space-y-4">
                     <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Audit Briefing</span>
                     <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{selectedTeam.team_name}</h3>
                  </div>
                  <button 
                    onClick={() => handleToggleMasterKey(selectedTeam.team_id, !!selectedTeam.master_key_enabled)}
                    className={`px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${selectedTeam.master_key_enabled ? 'bg-orange-600 text-white shadow-xl' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                  >
                     <Key size={14} /> {selectedTeam.master_key_enabled ? 'Master Key Unlocked' : 'Authorize Protocol'}
                  </button>
               </header>
               <div className="space-y-10 relative z-10">
                  <h4 className="text-xl font-black uppercase italic flex items-center gap-3"><History size={24} className="text-blue-400" /> Audit Timeline</h4>
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                     {(!selectedTeam.auditLogs || selectedTeam.auditLogs.length === 0) ? (
                       <div className="p-20 bg-white/5 border border-white/5 border-dashed rounded-[3rem] text-center opacity-30">
                          <FileText size={48} className="mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Aguardando telemetria de alteração...</p>
                       </div>
                     ) : (
                       selectedTeam.auditLogs.map((log, idx) => (
                         <div key={idx} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-4 hover:bg-white/[0.08] transition-all">
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center"><User size={16}/></div>
                                  <span className="text-xs font-black uppercase text-white tracking-tight">{log.user_id || 'Membro Alpha'}</span>
                               </div>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(log.changed_at).toLocaleTimeString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                               <div className="space-y-2">
                                  <span className="block text-[8px] font-black text-slate-500 uppercase">Campo Alterado</span>
                                  <span className="text-xs font-mono text-orange-400">{log.field_path}</span>
                               </div>
                               <div className="text-right">
                                  <span className="block text-[8px] font-black text-slate-500 uppercase">Novo Valor</span>
                                  <span className="text-xs font-mono text-white font-black">{JSON.stringify(log.new_value)}</span>
                               </div>
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-orange-600/10 border border-orange-500/20 p-10 rounded-[3rem] space-y-6">
                 <h4 className="text-xl font-black uppercase italic text-orange-500 flex items-center gap-3"><ShieldCheck size={20}/> Tutor Verdict</h4>
                 <textarea className="w-full h-40 bg-slate-950/50 border border-white/10 rounded-[2.5rem] p-8 text-sm font-medium focus:border-orange-500 outline-none resize-none transition-all" placeholder="Enter strategic feedback for this team..."></textarea>
                 <button className="w-full py-5 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-white hover:text-orange-600 transition-all active:scale-95">Send Briefing</button>
              </div>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorDecisionMonitor;
