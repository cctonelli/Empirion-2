
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Timer, Sparkles, ChevronRight, Search, Filter, Globe } from 'lucide-react';
import { MOCK_ONGOING_CHAMPIONSHIPS } from '../constants';
import EmpireParticles from '../components/EmpireParticles';

const OpenTournaments: React.FC = () => {
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
                   placeholder="Buscar Arena..."
                   className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-orange-500 transition-all"
                 />
              </div>
              <button className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors">
                 <Filter size={20} />
              </button>
           </div>
        </section>

        {/* Live Arenas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {MOCK_ONGOING_CHAMPIONSHIPS.map((champ, i) => (
             <motion.div 
               key={champ.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[3.5rem] space-y-8 hover:bg-white/5 transition-all group relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                   <Trophy size={140} />
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
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current Round</span>
                      <div className="flex items-center gap-2 text-white font-black text-lg">
                         <Timer size={16} className="text-orange-500" /> {champ.round}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Contestants</span>
                      <div className="flex items-center gap-2 text-white font-black text-lg">
                         <Users size={16} className="text-blue-500" /> {champ.teams} Units
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl space-y-3 relative z-10">
                   <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">TSR Oracle Leader</span>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{champ.leader}</span>
                      <ChevronRight size={14} className="text-slate-500" />
                   </div>
                </div>

                <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-95">
                   Assistir Batalha
                </button>
             </motion.div>
           ))}
        </div>

        {/* Global Stats Footer */}
        <section className="pt-24 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left opacity-60">
           <div className="flex items-center gap-4">
              <Globe className="text-blue-500" size={32} />
              <div>
                 <span className="block text-2xl font-black text-white">128</span>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active International Arenas</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Users className="text-emerald-500" size={32} />
              <div>
                 <span className="block text-2xl font-black text-white">4,281</span>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Strategists</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Trophy className="text-orange-500" size={32} />
              <div>
                 <span className="block text-2xl font-black text-white">$12.4B</span>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulated Revenue Processed</span>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default OpenTournaments;
