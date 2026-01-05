
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Trophy, ChevronRight, Play, Loader2, Target, Globe, Filter, X } from 'lucide-react';
import { getChampionships } from '../services/supabase';
import { Championship, Team } from '../types';

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
      
      // Captura pré-seleção enviada via roteamento
      const preSlug = location.state?.preSelectedSlug;
      if (preSlug) {
        setActiveFilter(preSlug);
      }
      
      setLoading(false);
    };
    fetch();
  }, [location.state]);

  const filteredChamps = activeFilter 
    ? championships.filter(c => 
        c.branch.toLowerCase().includes(activeFilter.toLowerCase()) || 
        activeFilter.toLowerCase().includes(c.branch.toLowerCase())
      )
    : championships;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Arenas...</span>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end px-4 gap-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Arena <span className="text-orange-500">Control</span></h1>
            <p className="text-slate-500 font-medium text-sm mt-1 italic">Arenas ativas e sessões de teste disponíveis.</p>
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
            key="list" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
          >
             {filteredChamps.map((champ) => (
               <div key={champ.id} className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/5 space-y-8 hover:bg-white/[0.03] transition-all group relative overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-start">
                     <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${champ.is_trial ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-slate-950'}`}>
                        {champ.is_trial ? 'Teste Grátis' : 'Arena Live'}
                     </div>
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{champ.branch}</span>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{champ.name}</h3>
                     <p className="text-xs text-slate-500 font-medium mt-2">Ciclo {champ.current_round} de {champ.total_rounds}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedArena(champ)}
                    className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    Selecionar Equipe <ChevronRight size={16} />
                  </button>
               </div>
             ))}
             {filteredChamps.length === 0 && (
               <div className="col-span-full py-20 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10">
                  <Trophy size={48} className="text-slate-700 mx-auto mb-6" />
                  <p className="text-slate-500 font-black uppercase text-sm tracking-widest">Nenhuma arena encontrada para este filtro.</p>
                  <button onClick={() => setActiveFilter(null)} className="mt-4 text-orange-500 font-bold uppercase text-[10px] tracking-widest hover:underline">Ver todas as arenas</button>
               </div>
             )}
          </motion.div>
        ) : (
          <motion.div 
            key="teams" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10 px-4"
          >
             <button onClick={() => setSelectedArena(null)} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">
                <ChevronRight size={14} className="rotate-180" /> Voltar para Arenas
             </button>
             <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 space-y-10 shadow-2xl">
                <div className="text-center space-y-3">
                   <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Escolha sua <span className="text-orange-600">Unidade</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {selectedArena.teams?.map((team: Team) => (
                     <button 
                       key={team.id}
                       onClick={() => onSelectTeam(selectedArena.id, team.id, !!selectedArena.is_trial)}
                       className="p-8 bg-white/5 border border-white/10 rounded-[3rem] text-center space-y-6 hover:bg-orange-600 hover:border-white group transition-all"
                     >
                        <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] flex items-center justify-center mx-auto text-orange-500 group-hover:bg-white shadow-xl">
                           <Target size={32} />
                        </div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{team.name}</h4>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-slate-500 group-hover:text-white">
                           <Play size={10} fill="currentColor"/> Iniciar Simulação
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
