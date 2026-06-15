
import React, { useState, useEffect } from 'react';
import * as Router from 'react-router-dom';
const { useNavigate } = Router as any;
/**
 * Fix: Used motion as any to bypass internal library type resolution issues in this environment
 */
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
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
              <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.85] pr-6 md:pr-10 pb-1 select-none">
                 Campeonatos <br/>
                 <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 pr-4 pb-1">Trial Ativos</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {filtered.map((champ, i) => {
                 const isFinished = (champ as any).status === 'TOURNEND' || (champ as any).status === 'finished' || (champ as any).is_finished || false;
                 const botsCount = champ.teams?.filter(t => t.is_bot).length ?? (champ as any).bots_count ?? champ.config?.bots_count ?? 0;
                 const tutorName = (champ as any).tutor_name ?? champ.config?.tutor_name ?? champ.config?.tutorName ?? "Prof. Claudio Tonelli";
                 const institutionName = (champ as any).institution_name ?? champ.config?.institution_name ?? champ.config?.institutionName ?? "UNIVERSIDADE EMPIRION";
                 const startDateStr = champ.created_at ? new Date(champ.created_at).toLocaleDateString("pt-BR") : "15/06/2026";

                 return (
                   <motion.div 
                     key={champ.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                     className="bg-slate-900/50 backdrop-blur-3xl p-5 md:p-6 rounded-[2rem] border border-white/5 hover:border-orange-500/40 transition-all group flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                   >
                     <div className="absolute top-0 right-0 p-5 opacity-[0.02] group-hover:scale-110 transition-transform -rotate-12 pointer-events-none"><Building2 size={120}/></div>
                     
                     <div className="space-y-4 relative z-10 w-full">
                        <div className="flex justify-between items-center">
                           {isFinished ? (
                              <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                 <span className="text-[9px] font-black text-red-500 uppercase tracking-widest italic">TOURNEND</span>
                              </div>
                           ) : (
                              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Live Session</span>
                              </div>
                           )}
                           <div className="flex gap-1">
                              {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-amber-500" fill="currentColor" />)}
                           </div>
                        </div>

                        <div className="space-y-1">
                           <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight leading-none truncate group-hover:text-orange-500 transition-colors">{champ.name}</h3>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-60 leading-none">Cluster Industrial • Node 08-STREET</p>
                        </div>

                        {/* PUBLIC TOURNAMENT METADATA */}
                        <div className="space-y-1.5 border-t border-b border-white/5 py-3 my-1">
                           <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                              <span className="text-slate-500">Tutor:</span>
                              <span className="text-white tracking-wide truncate max-w-[190px]">{tutorName}</span>
                           </div>
                           <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                              <span className="text-slate-500">Entidade:</span>
                              <span className="text-white tracking-wide truncate max-w-[190px]">{institutionName}</span>
                           </div>
                           <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                              <span className="text-slate-500">Início:</span>
                              <span className="text-white tracking-wide">{startDateStr}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                           <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 shadow-inner">
                              <span className="block text-[8px] font-black text-slate-600 uppercase mb-1 tracking-widest">Progressão</span>
                              <div className="flex items-center gap-2 text-white font-black text-md md:text-lg italic">
                                 <Timer size={14} className="text-orange-500" /> {champ.current_round}/{champ.total_rounds}
                              </div>
                           </div>
                           <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 shadow-inner">
                              <span className="block text-[8px] font-black text-slate-600 uppercase mb-1 tracking-widest">Unidades IA</span>
                              <div className="flex items-center gap-2 text-white font-black text-md md:text-lg italic">
                                 <Users size={14} className="text-blue-500" /> {botsCount}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-5 flex flex-col gap-2 relative z-10 w-full">
                        <button onClick={() => handlePlayTrial(champ)} className="w-full py-3 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                           <Play size={14} fill="currentColor" /> Entrar no Cockpit
                        </button>
                        <button onClick={() => { localStorage.setItem('active_champ_id', champ.id); navigate('/app/admin'); }} className="w-full py-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
                           <Monitor size={14} /> Painel do Tutor
                        </button>
                     </div>
                   </motion.div>
                 );
               })}
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
