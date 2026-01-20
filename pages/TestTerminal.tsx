
import React, { useState, useEffect } from 'react';
import * as Router from 'react-router-dom';
const { useNavigate } = Router as any;
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Timer, ChevronRight, Search, 
  Loader2, AlertCircle, Rocket, 
  ShieldCheck, Building2, Star, Play, 
  Users, Monitor, Target, Scan, Layers
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

  const handlePlayTrial = (champ: Championship) => {
    localStorage.setItem('active_champ_id', champ.id);
    localStorage.setItem('is_trial_session', 'true');
    const firstHuman = champ.teams?.find(t => !t.is_bot);
    if (firstHuman) localStorage.setItem('active_team_id', firstHuman.id);
    navigate('/app/dashboard');
  };

  const filtered = championships.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] pt-32 pb-20">
      <EmpireParticles />
      
      {/* SEBRAE-STYLE ORANGE CLOUDS LAYERS - BACKGROUND AMBIENTE */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1], x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} className="orange-cloud-pulse w-[800px] h-[800px] bg-orange-600/20 -top-[10%] -left-[10%]" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617] z-[1]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        {/* HEADER & TOOLBAR - ALINHAMENTO DE PRECISÃO */}
        <header className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16 pb-10 border-b border-white/5">
           <div className="space-y-5 flex-1">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-1.5 bg-orange-600/10 text-orange-500 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border border-orange-500/20 backdrop-blur-md"
              >
                 <Rocket size={12} className="animate-pulse" /> Sandbox Arena Master Node 08
              </motion.div>
              <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.85]">
                 Campeonatos <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Trial Ativos</span>
              </h1>
              <p className="text-slate-400 font-medium italic text-lg max-w-2xl">
                 "Ambiente sandbox aberto: experimente, orquestre e lidere o mercado industrial sem barreiras v13.2."
              </p>
           </div>

           <div className="flex items-center gap-4 w-full lg:w-auto shrink-0 pb-2">
              <div className="relative w-full lg:w-[400px] group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                 <input 
                   type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Buscar Arena Trial..."
                   className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-full text-white font-bold outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all backdrop-blur-xl placeholder:text-slate-700"
                 />
              </div>
              <button onClick={() => navigate('/trial/new')} className="px-10 py-5 bg-orange-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/30 hover:bg-white hover:text-orange-950 transition-all flex items-center justify-center gap-4 active:scale-95 shrink-0">
                 <Plus size={20} strokeWidth={3} /> Novo Torneio
              </button>
           </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="min-h-[500px]">
          {loading ? (
            <div className="py-40 text-center space-y-8">
               <Loader2 size={64} className="text-orange-600 animate-spin mx-auto" />
               <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] animate-pulse">Sincronizando com Cluster Industrial...</span>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="py-32 flex flex-col items-center justify-center text-center relative group"
            >
               {/* SCANNING FRAME DESIGN */}
               <div className="relative p-20 mb-10">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white/10 rounded-tl-3xl group-hover:border-orange-500 transition-colors duration-700" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white/10 rounded-tr-3xl group-hover:border-orange-500 transition-colors duration-700" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white/10 rounded-bl-3xl group-hover:border-orange-500 transition-colors duration-700" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white/10 rounded-br-3xl group-hover:border-orange-500 transition-colors duration-700" />
                  
                  <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-700 shadow-2xl relative overflow-hidden">
                     <Target size={64} className="animate-pulse" />
                     <motion.div 
                        animate={{ top: ['-10%', '110%'] }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-orange-500/50 shadow-[0_0_15px_#f97316] z-10"
                     />
                  </div>
               </div>

               <div className="space-y-4 max-w-lg">
                  <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Nenhuma Arena Detectada</h3>
                  <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em] leading-relaxed">
                     Seja o primeiro operador a inicializar o motor industrial hoje. <br/>
                     Use o botão "Novo Torneio" acima para começar.
                  </p>
               </div>
               <button onClick={() => navigate('/trial/new')} className="mt-12 px-12 py-6 bg-white/5 border border-white/10 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 hover:border-orange-500 transition-all active:scale-95 shadow-xl">
                  Lançar Protocolo Experimental
               </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
               {filtered.map((champ, i) => (
                 <motion.div 
                   key={champ.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                   className="bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 hover:border-orange-500/40 transition-all group flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform -rotate-12"><Building2 size={180}/></div>
                    
                    <div className="space-y-8 relative z-10">
                       <div className="flex justify-between items-center">
                          <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-3">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Live Session</span>
                          </div>
                          <div className="flex gap-1.5">
                             {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-amber-500" fill="currentColor" />)}
                          </div>
                       </div>

                       <div className="space-y-2">
                          <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight leading-none truncate group-hover:text-orange-500 transition-colors">{champ.name}</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic opacity-70">Cluster Industrial • Node 08-STREET</p>
                       </div>

                       <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                          <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5 shadow-inner">
                             <span className="block text-[8px] font-black text-slate-600 uppercase mb-2 tracking-widest">Progressão</span>
                             <div className="flex items-center gap-3 text-white font-black text-xl italic">
                                <Timer size={18} className="text-orange-500" /> {champ.current_round}/{champ.total_rounds}
                             </div>
                          </div>
                          <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5 shadow-inner">
                             <span className="block text-[8px] font-black text-slate-600 uppercase mb-2 tracking-widest">Unidades IA</span>
                             <div className="flex items-center gap-3 text-white font-black text-xl italic">
                                <Users size={18} className="text-blue-500" /> {champ.teams?.length || 0}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-10 flex flex-col gap-4 relative z-10">
                       <button onClick={() => handlePlayTrial(champ)} className="w-full py-6 bg-white text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4">
                          <Play size={18} fill="currentColor" /> Entrar no Cockpit
                       </button>
                       <button onClick={() => { localStorage.setItem('active_champ_id', champ.id); navigate('/app/admin'); }} className="w-full py-5 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3">
                          <Monitor size={16} /> Painel do Tutor
                       </button>
                    </div>
                 </motion.div>
               ))}
            </div>
          )}
        </div>

        {/* FOOTER SECURITY NODE */}
        <footer className="mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center opacity-40">
           <div className="flex items-center gap-4 mb-6 md:mb-0">
              <ShieldCheck size={32} className="text-emerald-500" />
              <div>
                 <span className="block text-[10px] font-black text-white uppercase tracking-widest">Security Node</span>
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Protocolo Trial Master v13.2 Ativo</span>
              </div>
           </div>
           <div className="flex gap-12">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Fidelidade v13.2</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Oracle Synchronized</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Node-08-STREET</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default TestTerminal;
