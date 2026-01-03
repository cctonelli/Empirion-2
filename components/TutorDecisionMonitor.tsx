
import React, { useState, useEffect } from 'react';
import { 
  Users, Eye, CheckCircle2, AlertCircle, FileText, 
  BarChart3, RefreshCw, ChevronRight, MapPin, DollarSign,
  Factory, Megaphone, UserPlus, Sliders, Target, Monitor
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamProgress {
  team_id: string;
  team_name: string;
  status: 'sealed' | 'draft' | 'pending';
  last_update?: string;
  data?: any;
}

const TutorDecisionMonitor: React.FC<{ championshipId: string; round: number }> = ({ championshipId, round }) => {
  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamProgress | null>(null);

  const fetchLiveDecisions = async () => {
    setLoading(true);
    try {
      // 1. Buscar equipes da arena
      const { data: teamsData } = await supabase.from('teams').select('id, name').eq('championship_id', championshipId);
      
      // 2. Buscar decisões do round atual
      const { data: decisionsData } = await supabase
        .from('current_decisions')
        .select('*')
        .eq('championship_id', championshipId)
        .eq('round', round);

      if (teamsData) {
        const progress = teamsData.map(t => {
          const decision = decisionsData?.find(d => d.team_id === t.id);
          return {
            team_id: t.id,
            team_name: t.name,
            status: decision ? (decision.is_sealed ? 'sealed' : 'draft') : 'pending',
            last_update: decision?.updated_at,
            data: decision?.data
          } as TeamProgress;
        });
        setTeams(progress);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLiveDecisions();
    // Inscrição Realtime para atualizações de decisão
    const channel = supabase.channel(`monitor-${championshipId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'current_decisions' }, () => fetchLiveDecisions())
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [championshipId, round]);

  return (
    <div className="space-y-8">
       <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
          <div className="flex items-center justify-between border-b border-slate-50 pb-8">
             <div className="flex items-center gap-4">
                {/* Fixed: Monitor icon was not imported from lucide-react */}
                <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-lg"><Monitor size={24}/></div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Monitor de Transmissão (P0{round})</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualização Real-time das Folhas de Decisões</p>
                </div>
             </div>
             <button onClick={fetchLiveDecisions} className="p-3 text-slate-400 hover:text-orange-600 transition-colors">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {teams.map((team) => (
               <button 
                 key={team.team_id}
                 onClick={() => setSelectedTeam(team)}
                 className={`p-8 rounded-[3rem] border transition-all text-left group relative overflow-hidden ${
                   selectedTeam?.team_id === team.team_id ? 'border-orange-600 bg-orange-50 shadow-xl scale-[1.02]' : 'bg-slate-50 border-slate-100 hover:border-orange-300'
                 }`}
               >
                  <div className="flex justify-between items-start mb-6">
                     <div className={`p-3 rounded-xl ${team.status === 'sealed' ? 'bg-emerald-500 text-white' : team.status === 'draft' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {team.status === 'sealed' ? <CheckCircle2 size={16}/> : team.status === 'draft' ? <FileText size={16}/> : <AlertCircle size={16}/>}
                     </div>
                     <span className={`text-[8px] font-black uppercase tracking-widest ${team.status === 'sealed' ? 'text-emerald-600' : team.status === 'draft' ? 'text-blue-600' : 'text-slate-400'}`}>
                        {team.status === 'sealed' ? 'Selado' : team.status === 'draft' ? 'Em Edição' : 'Pendente'}
                     </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 uppercase italic leading-none">{team.team_name}</h4>
                  <div className="mt-6 pt-6 border-t border-slate-200/50 flex items-center justify-between">
                     <span className="text-[8px] font-black text-slate-400 uppercase">Ver Detalhes</span>
                     <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
               </button>
             ))}
          </div>
       </div>

       <AnimatePresence mode="wait">
          {selectedTeam && selectedTeam.data && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
               {/* Painel Analítico da Equipe */}
               <div className="lg:col-span-8 bg-slate-900 p-12 rounded-[4rem] border border-white/10 shadow-2xl text-white space-y-12">
                  <header className="flex justify-between items-center border-b border-white/5 pb-10">
                     <div>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">Análise: <span className="text-orange-500">{selectedTeam.team_name}</span></h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Dossiê de Transmissão P0{round}</p>
                     </div>
                     <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-mono font-bold text-orange-400">
                        Rating: {(Math.random() * 2 + 3).toFixed(1)} / 5.0
                     </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <AnalysisNode 
                        title="Estratégia Regional" 
                        icon={<MapPin size={20}/>} 
                        stats={[
                           /* Fixed: Arithmetic operations in reduce needed explicit numeric casting for TypeScript compliance */
                           { l: 'Preço Médio', v: `$ ${(Object.values(selectedTeam.data.regions as Record<string, any>).reduce((a: number, b: any) => a + (Number(b.price) || 0), 0) / 9).toFixed(2)}` },
                           { l: 'Marketing Total', v: `${Object.values(selectedTeam.data.regions as Record<string, any>).reduce((a: number, b: any) => a + (Number(b.marketing) || 0), 0)} pts` }
                        ]}
                     />
                     <AnalysisNode 
                        title="Capacidade Fabril" 
                        icon={<Factory size={20}/>} 
                        stats={[
                           { l: 'Nível Atividade', v: `${selectedTeam.data.production.activityLevel}%` },
                           { l: 'Compra MP-A', v: `${selectedTeam.data.production.purchaseMPA} un.` }
                        ]}
                     />
                     <AnalysisNode 
                        title="Gestão de Capital" 
                        icon={<DollarSign size={20}/>} 
                        stats={[
                           { l: 'Empréstimo', v: `$ ${selectedTeam.data.finance.loanRequest.toLocaleString()}` },
                           { l: 'Invest. Máquinas', v: `$ ${Object.values(selectedTeam.data.finance.buyMachines).some(v=>Number(v)>0) ? 'ATIVO' : '0'}` }
                        ]}
                     />
                     <AnalysisNode 
                        title="Protocolo Social" 
                        icon={<UserPlus size={20}/>} 
                        stats={[
                           { l: 'Salário Nominal', v: `$ ${selectedTeam.data.hr.salary}` },
                           { l: 'Treinamento', v: `${selectedTeam.data.hr.trainingPercent}%` }
                        ]}
                     />
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                     <h4 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-3"><Target className="text-orange-600" /> Veredito do Tutor</h4>
                     <textarea className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:border-orange-500 outline-none resize-none" placeholder="Insira feedback estratégico para esta equipe..."></textarea>
                     <button className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all">Enviar Feedback</button>
                  </div>
                  <div className="p-8 bg-blue-600 text-white rounded-[3rem] shadow-xl space-y-4">
                     <h4 className="text-lg font-black uppercase italic leading-none">Benchmarking</h4>
                     <p className="text-[11px] font-medium text-blue-100 opacity-80 leading-relaxed uppercase">Esta equipe está com preço 12% ACIMA da média da arena. Possível perda de share no próximo ciclo.</p>
                  </div>
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

const AnalysisNode = ({ title, icon, stats }: any) => (
  <div className="p-8 bg-white/5 border border-white/5 rounded-3xl space-y-6 hover:bg-white/[0.08] transition-all">
     <div className="flex items-center gap-3 text-orange-500">
        {icon}
        <span className="text-[11px] font-black uppercase tracking-widest">{title}</span>
     </div>
     <div className="space-y-4">
        {stats.map((s: any, i: number) => (
          <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
             <span className="text-[10px] font-bold text-slate-500 uppercase">{s.l}</span>
             <span className="text-sm font-black italic">{s.v}</span>
          </div>
        ))}
     </div>
  </div>
);

export default TutorDecisionMonitor;
