
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Timer, Sparkles, ChevronRight, Search, Filter, Globe, Loader2, AlertCircle } from 'lucide-react';
import { getChampionships } from '../services/supabase';
import { Championship } from '../types';
import EmpireParticles from '../components/EmpireParticles';

const OpenTournaments: React.FC = () => {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPublicArenas = async () => {
      setLoading(true);
      const { data } = await getChampionships(true); // true = apenas públicas e ativas
      if (data) setChampionships(data);
      setLoading(false);
    };
    fetchPublicArenas();
  }, []);

  const filtered = championships.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-24">
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-10">
           <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-orange-500/10 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                 <Sparkles size={14} /> Global Federation
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic">Public Arenas</h1>
              <p className="text-xl text-slate-400 font-medium italic">"Compita globalmente, suba no ranking TSR e ganhe prestígio na rede Oracle."</p>
           </div>
           
           <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Buscar Arena..."
                   className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-orange-500 transition-all"
                 />
              </div>
              <button className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors">
                 <Filter size={20} />
              </button>
           </div>
        </section>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
             <Loader2 size={48} className="text-orange-500 animate-spin" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Sincronizando com Oracle Node...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 text-center space-y-8 bg-white/5 border border-white/10 border-dashed rounded-[4rem]">
             <AlertCircle size={64} className="text-slate-700 mx-auto" />
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase italic">Nenhuma Arena Detectada</h3>
                <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Seja o primeiro a orquestrar um campeonato global no Master Control.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             {filtered.map((champ, i) => (
               <motion.div 
                 key={champ.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[3.5rem] space-y-8 hover:bg-white/5 transition-all group relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                     <Trophy size={140} className="text-white" />
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                     <div className="px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live Now
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{champ.branch}</span>
                  </div>

                  <div className="space-y-2 relative z-10">
                     <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none group-hover:text-orange-500 transition-colors">{champ.name}</h3>
                     <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Global Ranking Node</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5 relative z-10">
                     <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current Cycle</span>
                        <div className="flex items-center gap-2 text-white font-black text-lg">
                           <Timer size={16} className="text-orange-500" /> {champ.current_round}/{champ.total_rounds}
                        </div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Capacidade</span>
                        <div className="flex items-center gap-2 text-white font-black text-lg">
                           <Users size={16} className="text-blue-500" /> {champ.config.teamsLimit} Units
                        </div>
                     </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl space-y-3 relative z-10">
                     <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Status da Inscrição</span>
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">Aberto para Estrategistas</span>
                        <ChevronRight size={14} className="text-slate-500" />
                     </div>
                  </div>

                  <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-95">
                     Entrar na Batalha
                  </button>
               </motion.div>
             ))}
          </div>
        )}

        {/* Global Stats Footer */}
        <section className="pt-24 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left opacity-60">
           <div className="flex items-center gap-4">
              <Globe className="text-blue-500" size={32} />
              <div>
                 <span className="block text-2xl font-black text-white">Active</span>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Arena Network</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Users className="text-emerald-500" size={32} />
              <div>
                 <span className="block text-2xl font-black text-white">Verified</span>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Oracle Node Strategists</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Trophy size={32} className="text-orange-500" />
              <div>
                 <span className="block text-2xl font-black text-white">Gold</span>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Build Fidelity v6.0</span>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default OpenTournaments;
