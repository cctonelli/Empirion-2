
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, ChevronRight, Play, Loader2, Target, Shield, Globe, Box } from 'lucide-react';
import { getChampionships, isTestMode } from '../services/supabase';
import { Championship } from '../types';

const ChampionshipsView: React.FC<{ onSelectTeam: (champId: string, teamId: string) => void }> = ({ onSelectTeam }) => {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await getChampionships();
      if (data) setChampionships(data as any);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Acessando Tabuleiro Global...</span>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end px-4">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Arena <span className="text-orange-600">Dashboard</span></h1>
            <p className="text-slate-500 font-medium text-sm mt-1 italic">"Escolha seu batalhão e inicie as jogadas estratégicas."</p>
         </div>
         <div className="flex items-center gap-3 px-6 py-2 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
            <Globe size={14} className="animate-pulse" /> Oracle Node Active
         </div>
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
             {championships.map((champ) => (
               <div key={champ.id} className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/5 space-y-8 hover:bg-white/[0.03] transition-all group relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Trophy size={120}/></div>
                  <div className="flex justify-between items-start">
                     <div className="px-4 py-1 bg-emerald-500 text-slate-950 rounded-full text-[8px] font-black uppercase">Live Board</div>
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{champ.branch}</span>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{champ.name}</h3>
                     <p className="text-xs text-slate-500 font-medium mt-2">Ciclo {champ.currentRound} de {champ.totalRounds}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                     <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Equipes</span>
                        <div className="text-white font-black">{champ.teams?.length || 0} Peças</div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Visibilidade</span>
                        <div className="text-orange-500 font-black uppercase text-[10px] italic">Pública</div>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedArena(champ)}
                    className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    Entrar no Tabuleiro <ChevronRight size={16} />
                  </button>
               </div>
             ))}
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
                   <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Selecione sua <span className="text-orange-600">Peça de Jogo</span></h2>
                   <p className="text-slate-400 font-medium italic">No modo "Xadrez dos Negócios", você pode operar qualquer equipe da arena.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {(selectedArena as any).teams?.map((team: any) => (
                     <button 
                       key={team.id}
                       onClick={() => onSelectTeam(selectedArena.id, team.id)}
                       className="p-8 bg-white/5 border border-white/10 rounded-[3rem] text-center space-y-6 hover:bg-orange-600 hover:border-white group transition-all"
                     >
                        <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] flex items-center justify-center mx-auto text-orange-500 group-hover:bg-white shadow-xl">
                           <Target size={32} />
                        </div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{team.name}</h4>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[8px] font-black uppercase text-slate-500 group-hover:text-white">
                           <Play size={10} fill="currentColor"/> Iniciar Jogadas
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
