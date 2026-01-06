import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Trophy, ChevronRight, Play, Loader2, Target, Filter, X, Users, Building2, Terminal } from 'lucide-react';
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
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
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
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end px-4 gap-6">
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

      <AnimatePresence mode="wait">
        {!selectedArena ? (
          <motion.div 
            key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
          >
             {filteredChamps.map((champ) => (
               <div key={champ.id} className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/5 space-y-8 hover:bg-white/[0.03] transition-all group relative overflow-hidden shadow-2xl">
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
                  <button 
                    onClick={() => setSelectedArena(champ)}
                    className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-orange-600 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    Ver Equipes & Entrar <ChevronRight size={16} />
                  </button>
               </div>
             ))}
             {filteredChamps.length === 0 && (
               <div className="col-span-full py-20 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10">
                  <Trophy size={48} className="text-slate-700 mx-auto mb-6" />
                  <p className="text-slate-500 font-black uppercase text-sm tracking-widest">Nenhuma arena encontrada para este filtro.</p>
               </div>
             )}
          </motion.div>
        ) : (
          <motion.div 
            key="teams" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="space-y-10 px-4"
          >
             <button onClick={() => setSelectedArena(null)} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">
                <ChevronRight size={14} className="rotate-180" /> Voltar para Arenas
             </button>
             <div className="bg-slate-900 p-10 md:p-16 rounded-[4rem] border border-white/10 space-y-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                   <Target size={300} className="text-white" />
                </div>
                <div className="text-center space-y-4 relative z-10">
                   <span className="px-5 py-2 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">Selecione sua Unidade Strategos</span>
                   <h2 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter">{selectedArena.name}</h2>
                   <p className="text-slate-400 font-medium text-lg italic max-w-2xl mx-auto">Escolha sua empresa para acessar o Ambiente Hermético de decisões.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                   {selectedArena.teams?.map((team: Team) => (
                     <button 
                       key={team.id}
                       onClick={() => onSelectTeam(selectedArena.id, team.id, !!selectedArena.is_trial)}
                       className="group p-10 bg-slate-950/50 border border-white/5 rounded-[3.5rem] text-center space-y-8 hover:bg-orange-600 hover:border-white transition-all shadow-2xl relative overflow-hidden"
                     >
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-orange-500 group-hover:bg-white group-hover:scale-110 transition-all shadow-inner">
                           <Target size={40} />
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-white transition-colors">{team.name}</h4>
                           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-white/60">Node de Operação Ativo</span>
                        </div>
                        <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-3 text-[10px] font-black uppercase text-orange-500 group-hover:text-white transition-all">
                           <Play size={14} fill="currentColor" className="animate-pulse" /> Assumir Comando
                        </div>
                     </button>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChampionshipsView;