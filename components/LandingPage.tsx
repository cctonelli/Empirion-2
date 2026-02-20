import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM as any;
import { 
  ArrowRight, ChevronLeft, ChevronRight, Factory, BrainCircuit, Globe,
  Rocket, Terminal, ShoppingCart, Briefcase, Tractor, DollarSign, Hammer,
  Trophy, Award, Calendar, CheckCircle2, Zap, TrendingUp, ShieldCheck,
  Star, Target, Cpu, Activity, BarChart3, Users, Clock, Loader2, Sparkles
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import Slider from 'react-slick';
import { DEFAULT_PAGE_CONTENT, APP_VERSION } from '../constants';
import { fetchPageContent, getGlobalLeaderboard } from '../services/supabase';
import EmpireParticles from './EmpireParticles';

const NextArrow = (props: any) => (
  <button 
    onClick={props.onClick} 
    className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-50 p-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-orange-600 hover:scale-110 transition-all active:scale-90 hidden md:flex"
  >
    <ChevronRight size={32} />
  </button>
);

const PrevArrow = (props: any) => (
  <button 
    onClick={props.onClick} 
    className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-50 p-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-orange-600 hover:scale-110 transition-all active:scale-90 hidden md:flex"
  >
    <ChevronLeft size={32} />
  </button>
);

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t, i18n } = useTranslation(['landing', 'common']);
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['landing']);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [db, boards] = await Promise.all([
          fetchPageContent('landing', i18n.language),
          getGlobalLeaderboard()
        ]);
        if (db) setContent({ ...DEFAULT_PAGE_CONTENT['landing'], ...db });
        if (boards) setLeaderboards(boards);
      } catch (err) {
        console.error("Landing Data Sync Fault:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [i18n.language]);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots custom-dots",
    fade: true,
    pauseOnHover: false
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
       <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-4" />
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Sincronizando Nodo Principal...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative overflow-x-hidden selection:bg-orange-600/30">
      <EmpireParticles />
      
      {/* SEBRAE ORANGE CLOUDS LAYER */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 40, 0] }} 
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute -top-[10%] -left-[5%] w-[1200px] h-[1000px] bg-orange-600/20 blur-[200px] rounded-full" 
         />
         <motion.div 
           animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1], x: [0, -30, 0] }} 
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute -bottom-[20%] -right-[10%] w-[1000px] h-[1000px] bg-blue-600/10 blur-[250px] rounded-full" 
         />
      </div>

      {/* HERO & CAROUSEL SECTION */}
      <section className="relative min-h-screen pt-20 flex flex-col z-20">
        <div className="flex-1 max-w-[1600px] mx-auto w-full px-6 md:px-12 flex flex-col">
          
          <Slider {...carouselSettings} className="flex-1">
            {/* Slide 1: Hero Principal */}
            <div className="outline-none h-full py-20">
              <div className="max-w-5xl space-y-10">
                <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-orange-600/10 border border-orange-500/20 rounded-full text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.6em] backdrop-blur-xl">
                  <Terminal size={14} className="animate-pulse" /> {APP_VERSION} GOLD SYNCED
                </div>
                
                <h1 className="text-[50px] md:text-[100px] lg:text-[140px] font-black text-white leading-[0.85] tracking-tighter uppercase italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {content?.hero?.title || "Forje Seu"} <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400">
                    {content?.hero?.subtitle || "Império Estratégico"}
                  </span>
                </h1>

                <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-4xl italic opacity-90 leading-relaxed">
                  "Onde a Inteligência Artificial Gemini e a estratégia humana colidem em simulações de alta fidelidade contábil."
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-8 pt-8">
                  <Link to="/auth" className="px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-110 hover:bg-white hover:text-orange-950 transition-all flex items-center gap-5 group active:scale-95">
                    Entrar na Arena <Rocket size={24} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link to="/features" className="px-12 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-xl flex items-center gap-3">
                    Explorar Protocolos <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Slide 2: IA Oráculo */}
            <div className="outline-none h-full py-20">
               <div className="max-w-5xl space-y-10">
                  <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 mb-8">
                    <BrainCircuit size={40} />
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Inteligência <br/> <span className="text-blue-500">Neural Strategos</span>
                  </h2>
                  <p className="text-2xl text-slate-400 font-medium italic max-w-3xl">
                    Análises preditivas via Gemini 3 Pro integradas diretamente ao seu DRE e Balanço em tempo real.
                  </p>
                  <Link to="/solutions/simulators" className="inline-flex items-center gap-4 text-blue-400 font-black uppercase text-sm tracking-[0.3em] hover:text-white transition-colors group">
                    Descobrir o Oráculo <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </Link>
               </div>
            </div>
          </Slider>

        </div>
      </section>

      {/* BRANCHES GRID SECTION */}
      <section className="landing-section bg-slate-950/40 relative z-10 border-t border-white/5">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.8em] italic">Simulation Matrix</span>
               <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Ramos de Atuação</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
               {[
                 { label: "Industrial", icon: <Factory />, slug: 'industrial', desc: 'CapEx & Depreciação Oracle', color: 'orange' },
                 { label: "Varejo", icon: <ShoppingCart />, slug: 'commercial', desc: 'Giro de Estoque SIMCO', color: 'blue' },
                 { label: "Serviços", icon: <Briefcase />, slug: 'services', desc: 'Capital Intelectual SISERV', color: 'emerald' },
               ].map((r, i) => (
                 <Link key={r.slug} to={`/branches/${r.slug}`} className="p-12 bg-slate-900 border border-white/5 rounded-[4rem] hover:border-orange-500/40 transition-all group shadow-2xl relative overflow-hidden h-[450px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform rotate-12">
                       {React.cloneElement(r.icon as any, { size: 200 })}
                    </div>
                    <div>
                       <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-${r.color}-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl mb-12`}>
                          {React.cloneElement(r.icon as any, { size: 32 })}
                       </div>
                       <h4 className="text-4xl font-black text-white uppercase italic mb-4">{r.label}</h4>
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{r.desc}</p>
                    </div>
                    <div className="flex items-center gap-3 text-orange-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                       Ativar Protocolo <ArrowRight size={14} />
                    </div>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* LEADERBOARD SECTION */}
      <section className="landing-section bg-[#020617] relative z-10 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-600/5 blur-[150px] pointer-events-none" />
         <div className="max-w-7xl mx-auto space-y-24 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10">
               <div className="space-y-4">
                  <span className="text-[11px] font-black uppercase text-blue-500 tracking-[0.8em] italic">Network Pulse</span>
                  <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Global Rankings</h2>
               </div>
               <Link to="/rewards" className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">Ver Todas Conquistas</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {leaderboards.length > 0 ? leaderboards.map(board => (
                  <LeaderboardCard key={board.id} name={board.name} branch={board.branch} cycle={`${board.round}/${board.total}`} teams={board.topTeams} />
               )) : (
                  <div className="col-span-full py-20 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10">
                     <Trophy size={64} className="text-slate-800 mx-auto mb-6" />
                     <p className="text-slate-500 font-black uppercase text-sm tracking-widest">Aguardando Conclusão de Ciclos Globais...</p>
                  </div>
               )}
            </div>
         </div>
      </section>

      <footer className="py-24 border-t border-white/5 bg-slate-950 relative z-20 text-center space-y-10">
         <div className="flex justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <Globe size={40} /> <Target size={40} /> <Activity size={40} /> <Zap size={40} />
         </div>
         <div className="space-y-4">
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.5em]">EMPIRION BUSINESS INTELLIGENCE ARENA • COPYRIGHT 2026</p>
            <p className="text-slate-700 text-[8px] font-mono uppercase tracking-widest">Protocolo v15.25.0-Oracle-Gold High Fidelity</p>
         </div>
      </footer>
    </div>
  );
};

const LeaderboardCard = ({ name, branch, cycle, teams }: any) => (
  <div className="bg-slate-900/60 backdrop-blur-2xl p-12 rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)] space-y-10 group hover:border-blue-500/30 transition-all">
     <div className="flex justify-between items-center">
        <div>
           <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">{name}</h3>
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{branch} • Ciclo {cycle}</span>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
           <Trophy size={24} />
        </div>
     </div>
     <div className="space-y-4">
        {teams.map((t: any, i: number) => (
           <div key={i} className="flex items-center justify-between p-6 bg-slate-950 border border-white/5 rounded-3xl group/item hover:bg-orange-600 transition-all">
              <div className="flex items-center gap-5">
                 <span className="text-xl font-mono font-black text-slate-700 group-hover/item:text-white/40">#0{i+1}</span>
                 <span className="text-sm font-black text-white uppercase italic group-hover/item:text-white">{t.name}</span>
              </div>
              <span className="text-lg font-mono font-black text-emerald-500 group-hover/item:text-white">{t.tsr.toFixed(1)}% TSR</span>
           </div>
        ))}
     </div>
  </div>
);

export default LandingPage;