
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
            insolvent: proj ? proj.health?.is_bankrupt : false,
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
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [championshipId, round]);

  const handleToggleMasterKey = async (teamId: string, current: boolean) => {
    const { error } = await supabase.from('teams').update({ master_key_enabled: !current }).eq('id', teamId);
    if (!error) fetchLiveDecisions();
  };

  const ratingsOrder: CreditRating[] = ['AAA', 'AA', 'A', 'B', 'C', 'D'];
  const distribution = useMemo(() => {
    return ratingsOrder.map(r => ({
      rating: r,
      count: teams.filter(t => (t.rating ?? 'N/A') === r).length
    }));
  }, [teams]);

  const chartOptions: any = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { borderRadius: 8, columnWidth: '50%', distributed: true } },
    colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f87171', '#b91c1c'],
    xaxis: { categories: ratingsOrder, labels: { style: { colors: '#94a3b8', fontWeight: 900 } } },
    yaxis: { labels: { style: { colors: '#475569' } }, tickAmount: 4 },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    tooltip: { theme: 'dark' },
    legend: { show: false }
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
          <div className="lg:col-span-8 bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8">
             <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Saúde Sistêmica da Arena</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Distribuição de Rating de Crédito em Tempo Real</p>
                </div>
                <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                   <span className="text-[10px] text-orange-500 font-black uppercase">N = {teams.length} Strategists</span>
                </div>
             </div>
             <div className="h-[280px] w-full">
                <Chart options={chartOptions} series={[{ name: 'Equipes', data: distribution.map(d => d.count) }]} type="bar" height="100%" />
             </div>
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
             <button onClick={fetchLiveDecisions} className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
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
                  <div className="flex justify-between items-start mb-8">
                     <div className={`p-4 rounded-2xl ${team.status === 'sealed' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : team.status === 'draft' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-slate-100 text-slate-300'}`}>
                        {team.status === 'sealed' ? <CheckCircle2 size={20}/> : team.status === 'draft' ? <Activity size={20}/> : <Monitor size={20}/>}
                     </div>
                     <span className={`font-black text-[11px] uppercase tracking-widest ${team.rating === 'D' ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>{team.rating ?? 'N/A'}</span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{team.team_name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{team.rating === 'D' ? 'INSOLVÊNCIA CRÍTICA' : 'NODE STATUS ACTIVE'}</p>
               </button>
             ))}
          </div>
       </div>

       {selectedTeam && (
          <div className="bg-slate-900 p-16 rounded-[5rem] border border-white/10 shadow-2xl text-white space-y-12 animate-in slide-in-from-bottom-4">
             <header className="flex justify-between items-end border-b border-white/5 pb-12">
                <div className="space-y-4">
                   <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Audit Briefing</span>
                   <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{selectedTeam.team_name}</h3>
                </div>
                <button 
                  onClick={() => handleToggleMasterKey(selectedTeam.team_id, !!selectedTeam.master_key_enabled)}
                  className={`px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${selectedTeam.master_key_enabled ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400'}`}
                >
                   <Key size={14} /> {selectedTeam.master_key_enabled ? 'Master Key Unlocked' : 'Authorize Protocol'}
                </button>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="p-8 bg-white/5 border border-white/5 rounded-[3rem] space-y-6">
                   <h4 className="text-xl font-black uppercase italic flex items-center gap-3"><History size={20} className="text-blue-400" /> Audit Timeline</h4>
                   <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedTeam.auditLogs?.map((log, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl text-xs space-y-1">
                           <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-500">
                              <span>{log.field_path}</span>
                              <span>{new Date(log.changed_at).toLocaleTimeString()}</span>
                           </div>
                           <p className="text-white font-bold">{JSON.stringify(log.new_value)}</p>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="bg-orange-600/10 border border-orange-500/20 p-10 rounded-[3rem] space-y-6">
                   <h4 className="text-xl font-black uppercase italic text-orange-500">Tutor Veredict</h4>
                   <textarea className="w-full h-40 bg-slate-950/50 border border-white/10 rounded-[2.5rem] p-8 text-sm font-medium focus:border-orange-500 outline-none resize-none" placeholder="Enter strategic feedback for this team..."></textarea>
                   <button className="w-full py-5 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-white hover:text-orange-600 transition-all">Send Briefing</button>
                </div>
             </div>
          </div>
       )}
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
