
import React, { useState, useEffect } from 'react';
import { 
  Users, Eye, CheckCircle2, AlertCircle, FileText, 
  BarChart3, RefreshCw, ChevronRight, MapPin, DollarSign,
  Factory, Megaphone, UserPlus, Sliders, Target, Monitor,
  TrendingDown, ShieldAlert, Activity, Scale
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

      const { data: teamsData } = await supabase.from('teams').select('id, name').eq('championship_id', championshipId);
      const { data: decisionsData } = await supabase.from('current_decisions').select('*').eq('championship_id', championshipId).eq('round', round);

      if (teamsData && arenaData) {
        const progress = teamsData.map(t => {
          const decision = decisionsData?.find(d => d.team_id === t.id);
          const proj = decision ? calculateProjections(
             decision.data, 
             arenaData.branch, 
             arenaData.ecosystemConfig, 
             arenaData.market_indicators
          ) : null;

          return {
            team_id: t.id,
            team_name: t.name,
            status: decision ? (decision.is_sealed ? 'sealed' : 'draft') : 'pending',
            last_update: decision?.updated_at,
            data: decision?.data,
            risk: proj?.health.insolvency_risk || 0,
            rating: proj?.health.rating || 'N/A'
          } as TeamProgress;
        });
        setTeams(progress);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLiveDecisions();
    const channel = supabase.channel(`monitor-${championshipId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'current_decisions' }, () => fetchLiveDecisions())
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [championshipId, round]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
          <header className="flex items-center justify-between border-b border-slate-50 pb-10">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><ShieldAlert size={32}/></div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Oracle Inquisitor Node (P0{round})</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Detecção de Risco e Monitoramento Prescritivo</p>
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
                  <div className="flex justify-between items-start mb-8">
                     <div className={`p-4 rounded-2xl ${team.status === 'sealed' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : team.status === 'draft' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-slate-100 text-slate-300'}`}>
                        {team.status === 'sealed' ? <CheckCircle2 size={20}/> : team.status === 'draft' ? <Activity size={20}/> : <Monitor size={20}/>}
                     </div>
                     <div className="text-right">
                        <span className={`block text-[10px] font-black uppercase tracking-widest ${team.status === 'sealed' ? 'text-emerald-600' : 'text-slate-400'}`}>{team.rating}</span>
                        <div className={`w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden`}>
                           <div className={`h-full ${team.risk! > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${team.risk}%` }} />
                        </div>
                     </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{team.team_name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{team.status === 'pending' ? 'AGUARDANDO CONEXÃO' : 'DECISÃO EM PROCESSAMENTO'}</p>
               </button>
             ))}
          </div>
       </div>

       <AnimatePresence mode="wait">
          {selectedTeam && selectedTeam.data && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 bg-slate-900 p-16 rounded-[5rem] border border-white/10 shadow-2xl text-white space-y-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 opacity-[0.02] rotate-12"><Scale size={400}/></div>
                  
                  <header className="flex justify-between items-end border-b border-white/5 pb-12 relative z-10">
                     <div className="space-y-4">
                        <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Audit Briefing</span>
                        <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{selectedTeam.team_name}</h3>
                     </div>
                     <div className="text-right">
                        <span className="block text-[9px] font-black text-slate-500 uppercase mb-2">Oracle Risk Index</span>
                        <div className="text-6xl font-black italic font-mono text-orange-500">{selectedTeam.risk?.toFixed(0)}%</div>
                     </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                     <AnalysisNode 
                        title="Aggressiveness" 
                        icon={<Megaphone />} 
                        stats={[
                           { l: 'Invest. Mkt Total', v: `${Object.values(selectedTeam.data.regions as Record<string, any>).reduce((a, b) => a + Number(b.marketing), 0)} pts` },
                           { l: 'Regional Bias', v: selectedTeam.data.regions[1]?.price < 350 ? 'PREDATOR' : 'STABLE' }
                        ]}
                     />
                     <AnalysisNode 
                        title="Leverage Protocol" 
                        icon={<DollarSign />} 
                        stats={[
                           { l: 'Loan Requested', v: `$ ${selectedTeam.data.finance.loanRequest.toLocaleString()}` },
                           { l: 'Credit Health', v: selectedTeam.risk! > 50 ? 'DISTRESSED' : 'ELITE' }
                        ]}
                     />
                  </div>

                  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6 relative z-10">
                     <h4 className="text-xl font-black uppercase italic text-emerald-400 flex items-center gap-3"><CheckCircle2 size={24}/> Strategos Prescriptive Analysis</h4>
                     <p className="text-lg text-slate-400 font-medium italic leading-relaxed">
                        "A unidade apresenta um risco de endividamento de {selectedTeam.risk}%. Sua estratégia de preço agressiva pode gerar insolvência se o round macro sofrer um evento de cisne negro. Tutor, sugira revisão do fluxo de caixa."
                     </p>
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
                  <div className="bg-indigo-600 p-12 rounded-[4rem] text-white shadow-2xl space-y-6">
                     <h4 className="text-2xl font-black uppercase italic leading-none">Inquisitor Tip</h4>
                     <p className="text-sm font-bold text-indigo-100 opacity-80 leading-relaxed uppercase">Use os dados de OEE para identificar equipes que estão subutilizando seu Capex imobilizado de $ 9.1M.</p>
                  </div>
               </aside>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

const AnalysisNode = ({ title, icon, stats }: any) => (
  <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-8 hover:bg-white/[0.08] transition-all group">
     <div className="flex items-center gap-4 text-orange-500 group-hover:scale-105 transition-transform">
        {React.cloneElement(icon, { size: 28 })}
        <span className="text-sm font-black uppercase tracking-[0.2em]">{title}</span>
     </div>
     <div className="space-y-6">
        {stats.map((s: any, i: number) => (
          <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.l}</span>
             <span className="text-lg font-black italic">{s.v}</span>
          </div>
        ))}
     </div>
  </div>
);

export default TutorDecisionMonitor;
