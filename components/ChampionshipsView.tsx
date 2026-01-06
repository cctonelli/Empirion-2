import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Trophy, ChevronRight, Play, Loader2, Target, Filter, X, Users, Building2, Terminal, Shield } from 'lucide-react';
import { getChampionships } from '../services/supabase';
import { Championship, Team } from '../types';

interface NavigationState {
  preSelectedBranch?: string;
  preSelectedSlug?: string;
  preSelectedActivity?: string;
  preSelectedModality?: string;
}

const ChampionshipsView: React.FC<{ onSelectTeam: (champId: string, teamId: string, isTrial: boolean) => void }> = ({ onSelectTeam }) => {
  const location = useLocation();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArena, setExpandedArena] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await getChampionships();
      if (data) setChampionships(data);
      
      const state = location.state as NavigationState | null;
      const preFilter = state?.preSelectedBranch ?? state?.preSelectedSlug ?? state?.preSelectedActivity ?? state?.preSelectedModality;

      if (preFilter) {
        setActiveFilter(preFilter);
      }
      setLoading(false);
    };
    fetch();
  }, [location.state]);

  const filteredChamps = activeFilter 
    ? championships.filter(c => {
        const branch = (c.branch || '').toLowerCase();
        const filter = activeFilter!.toLowerCase();
        return branch.includes(filter) || filter.includes(branch);
      })
    : championships;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Nodos Oracle...</span>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Arena <span className="text-orange-500">Control</span></h1>
            <p className="text-slate-500 font-medium text-sm mt-1 italic">Ambientes de Simulação e Treinamento Estratégico.</p>
         </div>
         {activeFilter && (
           <div className="flex items-center gap-3 bg-orange-600/10 border border-orange-500/20 px-5 py-2.5 rounded-full">
              <Filter size={14} className="text-orange-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Filtro: {activeFilter}</span>
              <button onClick={() => setActiveFilter(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                 <X size={14} className="text-orange-500" />
              </button>
           </div>
         )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredChamps.map((champ) => (
           <div key={champ.id} className={`bg-slate-900/50 backdrop-blur-xl p-10 rounded-[3.5rem] border transition-all duration-500 relative overflow-hidden shadow-2xl ${expandedArena === champ.id ? 'border-orange-500/50 ring-4 ring-orange-500/10' : 'border-white/5'}`}>
              
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                   <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${champ.is_trial ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-slate-950'}`}>
                      {champ.is_trial ? 'Teste Grátis' : 'Arena Live'}
                   </div>
                   <div className="flex items-center gap-2 text-slate-500">
                      <Building2 size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{champ.branch}</span>
                   </div>
                </div>

                <div className="space-y-2">
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">{champ.name}</h3>
                   <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                         <Users size={14} className="text-orange-500" /> {champ.teams?.length || 0} Empresas
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                         <Terminal size={14} className="text-blue-500" /> Ciclo 0{champ.current_round}
                      </div>
                   </div>
                </div>

                {expandedArena !== champ.id ? (
                  <button 
                    onClick={() => setExpandedArena(champ.id)}
                    className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-orange-600 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    Ver Equipes & Entrar <ChevronRight size={16} />
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Selecione sua Unidade:</span>
                        <button onClick={() => setExpandedArena(null)} className="text-[9px] font-black text-slate-500 uppercase hover:text-white transition-colors flex items-center gap-1">Fechar <X size={12}/></button>
                     </div>
                     <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {champ.teams?.map((team: Team) => (
                          <button 
                            key={team.id}
                            onClick={() => onSelectTeam(champ.id, team.id, !!champ.is_trial)}
                            className="w-full p-6 bg-slate-950/80 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-orange-600 hover:border-white transition-all text-left"
                          >
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-white group-hover:text-orange-600 transition-colors">
                                   <Shield size={18} />
                                </div>
                                <span className="text-sm font-black text-white uppercase italic group-hover:text-white transition-colors">{team.name}</span>
                             </div>
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-black text-white uppercase">Acessar</span>
                                <Play size={12} fill="currentColor" />
                             </div>
                          </button>
                        ))}
                        {(!champ.teams || champ.teams.length === 0) && (
                          <p className="text-[10px] text-slate-500 italic text-center py-4">Nenhuma unidade detectada neste node.</p>
                        )}
                     </div>
                  </motion.div>
                )}
              </div>
           </div>
         ))}
         
         {filteredChamps.length === 0 && (
           <div className="col-span-full py-20 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10">
              <Trophy size={48} className="text-slate-700 mx-auto mb-6" />
              <p className="text-slate-500 font-black uppercase text-sm tracking-widest">Nenhuma arena encontrada para este filtro.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default ChampionshipsView;