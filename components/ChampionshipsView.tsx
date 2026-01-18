import React, { useState, useEffect } from 'react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
// Fix: Use any to bypass react-router-dom type resolution issues in this environment
import * as Router from 'react-router-dom';
const { useLocation } = Router as any;
import { Trophy, ChevronRight, Play, Loader2, Filter, X, Users, Building2, Terminal, Shield, RefreshCw, Bot, Eye } from 'lucide-react';
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

  const fetchArenas = async () => {
    setLoading(true);
    try {
      const { data } = await getChampionships();
      if (data) setChampionships(data);
      
      const state = location.state as NavigationState | null;
      const preFilter = state?.preSelectedBranch ?? state?.preSelectedSlug ?? state?.preSelectedActivity ?? state?.preSelectedModality;

      if (preFilter) {
        setActiveFilter(preFilter);
      }
    } catch (err) {
      console.error("Arena Sync Fault", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArenas();
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
         <div className="flex items-center gap-4">
           {activeFilter && (
             <div className="flex items-center gap-3 bg-orange-600/10 border border-orange-500/20 px-5 py-2.5 rounded-full">
                <Filter size={14} className="text-orange-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Filtro: {activeFilter}</span>
                <button onClick={() => setActiveFilter(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                   <X size={14} className="text-orange-500" />
                </button>
             </div>
           )}
           <button onClick={fetchArenas} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
             <RefreshCw size={20} />
           </button>
         </div>
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
                         <Users size={14} className="text-orange-500" /> {champ.teams?.length || 0} Equipes
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
                    Ver Equipes & Bots <ChevronRight size={16} />
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Selecione uma Equipe:</span>
                        <button onClick={() => setExpandedArena(null)} className="text-[9px] font-black text-slate-500 uppercase hover:text-white transition-colors flex items-center gap-1">Fechar <X size={12}/></button>
                     </div>
                     <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {champ.teams && champ.teams.length > 0 ? (
                          champ.teams.map((team: Team) => (
                            <button 
                              key={team.id}
                              disabled={team.is_bot}
                              onClick={() => onSelectTeam(champ.id, team.id, !!champ.is_trial)}
                              className={`w-full p-6 bg-slate-950/80 border rounded-2xl flex items-center justify-between group transition-all text-left ${
                                team.is_bot 
                                ? 'border-indigo-500/20 cursor-default opacity-80' 
                                : 'border-white/5 hover:bg-orange-600 hover:border-white'
                              }`}
                            >
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    team.is_bot ? 'bg-indigo-600/20 text-indigo-400' : 'bg-white/5 text-orange-500 group-hover:bg-white group-hover:text-orange-600'
                                  }`}>
                                     {team.is_bot ? <Bot size={20}/> : <Shield size={18} />}
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-sm font-black text-white uppercase italic">{team.name}</span>
                                     {team.is_bot && <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Autonomous Synthetic Node</span>}
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  {team.is_bot ? (
                                    <div className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center gap-2">
                                       <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
                                       <span className="text-[8px] font-black text-indigo-400 uppercase">AI OPERATING</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <span className="text-[9px] font-black text-white uppercase">Assumir Comando</span>
                                       <Play size={12} fill="currentColor" />
                                    </div>
                                  )}
                               </div>
                            </button>
                          ))
                        ) : (
                          <div className="py-10 text-center space-y-4">
                            <p className="text-[10px] text-slate-500 italic uppercase font-black">Nenhuma equipe detectada.</p>
                            <button onClick={fetchArenas} className="text-[9px] text-orange-500 font-bold uppercase underline">Forçar Re-scan</button>
                          </div>
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