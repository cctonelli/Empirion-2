import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trophy, Timer, ChevronRight, Search, 
  Filter, Globe, Loader2, AlertCircle, Rocket, 
  Terminal, ShieldCheck, Building2, Star, Play, 
  ArrowRight, Users, Bot, Landmark
} from 'lucide-react';
import { getChampionships, provisionDemoEnvironment } from '../services/supabase';
import { Championship } from '../types';
import EmpireParticles from '../components/EmpireParticles';

const TestTerminal: React.FC = () => {
  const navigate = useNavigate();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    provisionDemoEnvironment();
    const fetchTrialArenas = async () => {
      setLoading(true);
      try {
        const { data } = await getChampionships();
        // Filtra apenas arenas trial
        const trials = (data || []).filter(a => a.is_trial);
        setChampionships(trials);
      } catch (err) {
        console.error("Trial Sync Fault", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrialArenas();
  }, []);

  const filtered = championships.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] pt-32 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-6 md:px-24 relative z-10 space-y-20">
        
        {/* HEADER TELA 1 - TRIAL MASTER HUB */}
        <section className="flex flex-col lg:flex-row justify-between items-end gap-10 border-b border-white/5 pb-16">
           <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-6 py-2 bg-orange-600/10 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-[0.5em] border border-orange-500/20"
              >
                 <Rocket size={14} className="animate-pulse" /> Trial Master Node 08
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">
                 Campeonatos <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400">Trial Ativos</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium italic max-w-2xl leading-relaxed">
                 "Ambiente sandbox aberto: experimente, orquestre e lidere o mercado industrial sem barreiras v13.2."
              </p>
           </div>

           <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Buscar Arena Trial..."
                   className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white font-bold outline-none focus:border-orange-500 transition-all placeholder:text-slate-700"
                 />
              </div>
              <button 
                onClick={() => navigate('/trial/new')}
                className="px-10 py-5 bg-orange-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_20px_50px_rgba(249,115,22,0.4)] flex items-center justify-center gap-4 active:scale-95"
              >
                 <Plus size={20} /> Novo Torneio Trial
              </button>
           </div>
        </section>

        {/* LISTA DE CARDS - TELA 1 (GRID) */}
        {loading ? (
          <div className="py-40 text-center space-y-6">
             <Loader2 size={48} className="text-orange-600 animate-spin mx-auto" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Sincronizando com Cluster Sandbox...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[4rem] space-y-10">
             <AlertCircle size={64} className="text-slate-700 mx-auto" />
             <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase italic">Nenhuma Arena Trial Ativa</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest max-w-md mx-auto">
                   Seja o primeiro operador a inicializar o motor industrial hoje. Use o botão "Novo Torneio" acima.
                </p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {filtered.map((champ, i) => (
               <motion.div 
                 key={champ.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 hover:border-orange-500/40 transition-all group flex flex-col justify-between min-h-[480px] shadow-2xl overflow-hidden relative"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><Building2 size={160}/></div>
                  
                  <div className="space-y-8 relative z-10">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Live Session</span>
                        </div>
                        <div className="flex gap-1">
                           {[1,2,3].map(s => <Star key={s} size={10} className="text-amber-500" fill="currentColor" />)}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none group-hover:text-orange-500 transition-colors">{champ.name}</h3>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Ramo: Industrial Node 08</p>
                     </div>

                     <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                        <div className="space-y-1">
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Progress</span>
                           <div className="flex items-center gap-2 text-white font-mono font-black text-xl italic">
                              <Timer size={16} className="text-orange-500" /> {champ.current_round}/{champ.total_rounds}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Equipes</span>
                           <div className="flex items-center gap-2 text-white font-mono font-black text-xl italic">
                              <Users size={16} className="text-blue-500" /> {champ.teams?.length || 0}
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-950 p-5 rounded-3xl space-y-2 border border-white/5">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Market Leader</span>
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-black text-white uppercase italic">Alpha Unit</span>
                           <span className="text-xs font-black text-emerald-500">$ 60.12</span>
                        </div>
                     </div>
                  </div>

                  <div className="pt-10 flex gap-3 relative z-10">
                     <button 
                       onClick={() => navigate('/app/championships', { state: { preSelectedBranch: 'industrial' } })}
                       className="flex-1 py-5 bg-white/5 border border-white/10 hover:bg-white hover:text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                     >
                        Ver Ranking <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                     <button 
                       onClick={() => {
                         localStorage.setItem('active_champ_id', champ.id);
                         navigate('/app/dashboard');
                       }}
                       className="p-5 bg-orange-600 text-white rounded-2xl hover:bg-white hover:text-orange-600 transition-all shadow-xl active:scale-90"
                     >
                        <Play size={20} fill="currentColor" />
                     </button>
                  </div>
               </motion.div>
             ))}
          </div>
        )}

        <div className="pt-20 opacity-40 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-center gap-4">
              <ShieldCheck className="text-emerald-500" size={32} />
              <div>
                 <span className="block text-white font-black uppercase text-xs italic tracking-widest leading-none">Security Node</span>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Protocolo RLS Desabilitado no modo Trial</span>
              </div>
           </div>
           <div className="flex gap-12 text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] italic">
              <span>Fidelidade v13.2</span>
              <span>Oracle Synchronized</span>
              <span>Node-08-Street</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TestTerminal;