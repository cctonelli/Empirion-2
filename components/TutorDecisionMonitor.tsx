import React, { useState, useEffect } from 'react';
import { 
  Users, Eye, CheckCircle2, AlertCircle, FileText, 
  BarChart3, RefreshCw, ChevronRight, MapPin, DollarSign,
  Factory, Megaphone, UserPlus, Sliders, Target, Monitor,
  TrendingUp, ShieldAlert, Activity, Scale, Shield,
  History, User, AlertOctagon, Key, Banknote, Landmark
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship } from '../types';

interface TeamProgress {
  team_id: string;
  team_name: string;
  status: 'sealed' | 'draft' | 'pending';
  last_update?: string;
  data?: any;
  risk?: number;
  rating?: string;
  insolvent?: boolean;
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
      const { data: arenaData } = await supabase.from('championships').select('*').eq('id', championshipId).single();
      if (arenaData) setArena(arenaData);

      const { data: teamsData } = await supabase.from('teams').select('id, name, master_key_enabled').eq('championship_id', championshipId);
      const { data: decisionsData } = await supabase.from('current_decisions').select('*').eq('championship_id', championshipId).eq('round', round);
      const { data: auditData } = await supabase.from('decision_audit_log').select('*').eq('championship_id', championshipId).eq('round', round).order('changed_at', { ascending: false });

      if (teamsData && arenaData) {
        const progress = teamsData.map(t => {
          const decision = decisionsData?.find(d => d.team_id === t.id);
          const proj = decision ? calculateProjections(
             decision.data, 
             arenaData.branch, 
             arenaData.ecosystemConfig, 
             arenaData.market_indicators
          ) : null;

          const teamAudit = auditData?.filter(a => a.team_id === t.id) || [];

          return {
            team_id: t.id,
            team_name: t.name,
            status: decision ? (decision.status === 'sealed' ? 'sealed' : 'draft') : 'pending',
            last_update: decision?.submitted_at,
            data: decision?.data,
            risk: proj?.health?.insolvency_risk ?? 0,
            rating: proj?.health?.rating ?? 'N/A',
            insolvent: proj ? ((proj.totalOutflow ?? 0) > (proj.totalLiquidity ?? 0)) : false,
            master_key_enabled: t.master_key_enabled,
            auditLogs: teamAudit
          } as TeamProgress;
        });
        setTeams(progress);
        
        if (selectedTeam) {
            const updatedSelected = progress.find(t => t.team_id === selectedTeam.team_id);
            if (updatedSelected) setSelectedTeam(updatedSelected);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
          <header className="flex items-center justify-between border-b border-slate-50 pb-10">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><ShieldAlert size={32}/></div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Oracle Inquisitor Node (P0{round})</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Detecção de Risco e Monitoramento de Insolvência</p>
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
                        <span className={`block text-[10px] font-black uppercase tracking-widest ${team.rating === 'D' ? 'text-rose-600 font-black animate-pulse' : 'text-slate-400'}`}>{team.rating}</span>
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
                        {selectedTeam.auditLogs?.length === 0 ? (
                          <div className="p-10 bg-white/5 border border-white/5 border-dashed rounded-[3rem] text-center opacity-40">
                             <FileText size={48} className="mx-auto mb-4" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Sem logs de alteração neste round.</p>
                          </div>
                        ) : (
                          selectedTeam.auditLogs?.map((log, idx) => (
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
                                     {log.current_balance_at_time !== undefined && (
                                       <div className="flex items-center justify-end gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                          <div className="text-right">
                                             <span className="block text-[7px] font-black text-slate-500 uppercase">Saldo Estimado</span>
                                             <span className="text-xs font-mono font-black text-blue-400">
                                                $ {log.current_balance_at_time.toLocaleString()}
                                             </span>
                                          </div>
                                          <Landmark size={14} className="text-blue-500" />
                                       </div>
                                     )}
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
                  <div className="bg-indigo-600 p-12 rounded-[4rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
                     <Shield size={140} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
                     <h4 className="text-2xl font-black uppercase italic leading-none">Inquisitor Protocol</h4>
                     <p className="text-sm font-bold text-indigo-100 opacity-80 leading-relaxed uppercase italic">"A transparência na auditoria é o que evita o colapso da governança em equipes sob pressão."</p>
                  </div>
               </aside>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

export default TutorDecisionMonitor;