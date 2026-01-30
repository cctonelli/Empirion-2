
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM as any;
import { 
  ArrowRight, ChevronLeft, ChevronRight, Factory, BrainCircuit, Globe,
  Rocket, Terminal, ShoppingCart, Briefcase, Tractor, DollarSign, Hammer,
  Trophy, Award, Calendar, CheckCircle2, Zap, TrendingUp, ShieldCheck,
  Star, Target, Cpu, Activity
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import Slider from 'react-slick';
import { DEFAULT_PAGE_CONTENT, APP_VERSION } from '../constants';
import { fetchPageContent, getModalities, subscribeToModalities } from '../services/supabase';
import { Modality } from '../types';
import EmpireParticles from './EmpireParticles';
import LanguageSwitcher from './LanguageSwitcher';

const NextArrow = (props: any) => (
  <button onClick={props.onClick} className="absolute -right-4 md:right-10 top-1/2 -translate-y-1/2 z-50 p-5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-orange-600 transition-all shadow-2xl active:scale-90">
    <ChevronRight size={32} />
  </button>
);

const PrevArrow = (props: any) => (
  <button onClick={props.onClick} className="absolute -left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 p-5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-orange-600 transition-all shadow-2xl active:scale-90">
    <ChevronLeft size={32} />
  </button>
);

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { i18n } = useTranslation('landing');
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['landing']);
  const [dynamicModalities, setDynamicModalities] = useState<Modality[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const db = await fetchPageContent('landing', i18n.language);
      if (db) setContent({ ...DEFAULT_PAGE_CONTENT['landing'], ...db });
      const mods = await getModalities();
      if (Array.isArray(mods)) setDynamicModalities(mods);
    };
    loadData();
    const channel = subscribeToModalities(loadData);
    return () => { channel.unsubscribe(); };
  }, [i18n.language]);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    customPaging: (i: number) => (
      <div className="w-2.5 h-2.5 rounded-full bg-white/20 mt-12 hover:bg-orange-500 transition-colors" />
    ),
    dotsClass: "slick-dots custom-dots"
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative overflow-x-hidden select-none">
      <EmpireParticles />
      
      {/* SEBRAE ORANGE CLOUDS - CAMADA DE FUNDO DINÂMICA */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2], rotate: [0, 45, 0] }} transition={{ duration: 25, repeat: Infinity }} className="absolute -top-[20%] -left-[10%] w-[1000px] h-[1000px] bg-orange-600/30 blur-[250px] rounded-full" />
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], x: [0, 100, 0] }} transition={{ duration: 20, repeat: Infinity, delay: 2 }} className="absolute top-[30%] -right-[10%] w-[800px] h-[800px] bg-orange-400/20 blur-[200px] rounded-full" />
      </div>

      {/* HERO SECTION - RECONSOLIDADO v1.1 */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-24 px-8 relative z-20 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-7xl mx-auto space-y-12">
           <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.6em] backdrop-blur-xl shadow-2xl">
              <Terminal size={14} className="animate-pulse" /> {APP_VERSION} CORE SYNCED
           </div>
           
           <h1 className="text-[55px] md:text-[90px] lg:text-[120px] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
              Forje Seu Império <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400"> Com Insight IA </span>
           </h1>

           <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-4xl mx-auto italic leading-relaxed opacity-90">
              A arena definitiva onde inteligência neural Gemini e estratégia humana colidem em simulações multiplayer de alta fidelidade.
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
              <Link to="/auth" className="px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:scale-110 hover:bg-white hover:text-orange-950 transition-all flex items-center gap-5 group">
                Entre na Arena <Rocket size={24} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link to="/solutions/simulators" className="px-16 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-white hover:text-slate-950 transition-all backdrop-blur-md active:scale-95">
                Explorar Ramos
              </Link>
           </div>
        </motion.div>
      </section>

      {/* DYNAMIC CAROUSEL - OBRIGATÓRIO DIRETRIZES IMUTÁVEIS */}
      <section className="relative z-30 -mt-20 md:-mt-32 px-6 md:px-24 mb-40">
         <div className="max-w-[1600px] mx-auto">
            <Slider {...carouselSettings}>
               <CarouselSlide 
                  icon={<Factory size={48}/>}
                  badge="Industrial Node"
                  title="Produção Massiva"
                  desc="Gerencie cadeias de suprimento e ativos de capital de $9M em 9 regiões globais."
                  img="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200"
               />
               <CarouselSlide 
                  icon={<BrainCircuit size={48}/>}
                  badge="Strategos Advisor"
                  title="Mentoria via Gemini 3"
                  desc="Feedbacks táticos em tempo real baseados no seu Balanço e DRE tático."
                  img="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200"
               />
            </Slider>
         </div>
      </section>

      {/* RAMOS CARDS */}
      <section className="landing-section bg-slate-950/40">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.8em] italic">Simulation Matrix</span>
               <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Nodos Disponíveis</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
               {[
                 { label: 'Industrial', icon: <Factory />, slug: 'industrial', desc: 'CapEx $9M Fidelity' },
                 { label: 'Comercial', icon: <ShoppingCart />, slug: 'commercial', desc: 'Varejo Híbrido' },
                 { label: 'Serviços', icon: <Briefcase />, slug: 'services', desc: 'Capital Intelectual' },
                 { label: 'Agronegócio', icon: <Tractor />, slug: 'agribusiness', desc: 'Ativos Biológicos' },
                 { label: 'Financeiro', icon: <DollarSign />, slug: 'finance', desc: 'Spread & Risco' },
                 { label: 'Construção', icon: <Hammer />, slug: 'construction', desc: 'Obras Pesadas' }
               ].map((r, i) => (
                 <Link key={r.label} to={`/branches/${r.slug}`} className="p-12 bg-slate-900 border border-white/5 rounded-[4rem] hover:border-orange-500/40 transition-all group shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-125 transition-transform rotate-12">{React.cloneElement(r.icon as any, { size: 180 })}</div>
                    <div className="flex justify-between items-start mb-12 relative z-10">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl">
                          {React.cloneElement(r.icon as any, { size: 32 })}
                       </div>
                       <ArrowRight className="text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" size={24} />
                    </div>
                    <div className="relative z-10">
                       <h4 className="text-3xl font-black text-white uppercase italic mb-2 leading-none">{r.label}</h4>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{r.desc}</p>
                    </div>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* PLACAR CAMPEONATOS - IMUTÁVEL v1.1 */}
      <section className="landing-section bg-[#020617]">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10">
               <div className="space-y-4">
                  <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.8em] italic">Live Standings</span>
                  <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Arenas em Andamento</h2>
               </div>
               <Link to="/solutions/open-tournaments" className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all">Ver Todas as Arenas</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <LeaderboardCard 
                  name="Torneio Nacional Alpha" 
                  branch="Industrial" 
                  cycle="08/12"
                  teams={[
                     { name: 'Equipe Sigma', tsr: 142.5, pos: 1 },
                     { name: 'Node Delta', tsr: 128.2, pos: 2 },
                     { name: 'Atlas Corp', tsr: 115.8, pos: 3 }
                  ]}
               />
               <LeaderboardCard 
                  name="Grand Prix Comercial" 
                  branch="Comercial" 
                  cycle="03/06"
                  teams={[
                     { name: 'Varejo Pro', tsr: 98.4, pos: 1 },
                     { name: 'Mega Store', tsr: 92.1, pos: 2 },
                     { name: 'Nexus Trade', tsr: 85.5, pos: 3 }
                  ]}
               />
            </div>
         </div>
      </section>

      {/* EMPIRE BADGES - IMUTÁVEL v1.1 */}
      <section className="landing-section bg-slate-900/20">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.8em] italic">Empire Gamification</span>
               <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Empire Badges</h2>
               <p className="text-xl text-slate-500 font-medium italic max-w-2xl mx-auto">"Conquiste honrarias auditadas pelo oráculo e valide sua senioridade estratégica."</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12">
               <BadgeIcon icon={<ShieldCheck size={40}/>} label="Strategos Master" color="text-amber-500" />
               <BadgeIcon icon={<Zap size={40}/>} label="Efficiency Lord" color="text-emerald-500" />
               <BadgeIcon icon={<Target size={40}/>} label="Market Sniper" color="text-rose-500" />
               <BadgeIcon icon={<Activity size={40}/>} label="Oracle Verified" color="text-blue-500" />
               <BadgeIcon icon={<Cpu size={40}/>} label="Asset Architect" color="text-indigo-500" />
            </div>
         </div>
      </section>

      {/* ROADMAP TIMELINE - IMUTÁVEL v1.1 */}
      <section className="landing-section bg-[#020617]">
         <div className="max-w-5xl mx-auto space-y-24">
            <div className="text-center space-y-4">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.8em] italic">Protocol Evolution</span>
               <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Roadmap Estratégico</h2>
            </div>
            
            <div className="relative space-y-16">
               <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5" />
               <RoadmapNode phase="Fase 1" title="Core Engine v15.0" desc="Lançamento do motor industrial com fidelidade 99.8% e IA Gemini integrada." status="COMPLETO" active />
               <RoadmapNode phase="Fase 2" title="Multi-Branch Node" desc="Expansão para Comercial, Agro e Serviços com mecânicas específicas." status="LIVE" active />
               <RoadmapNode phase="Fase 3" title="Intelligence Hub Opal" desc="Terminal premium com Google Search Grounding e Workflows avançados." status="LIVE" active />
               <RoadmapNode phase="Fase 4" title="Global Tournaments" desc="Arenas patrocinadas com premiações em ativos reais e NFTs de honra." status="Q2 2026" />
            </div>
         </div>
      </section>

      <footer className="py-24 border-t border-white/5 text-center bg-[#020617] relative z-20">
         <div className="container mx-auto px-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">CONSTRUINDO IMPÉRIOS EMPRESARIAIS DO FUTURO • EMPIRION 2026</p>
            <div className="mt-10 flex justify-center scale-75"><LanguageSwitcher light /></div>
         </div>
      </footer>
    </div>
  );
};

const LeaderboardCard = ({ name, branch, cycle, teams }: any) => (
  <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8 group hover:border-orange-500/30 transition-all">
     <div className="flex justify-between items-start">
        <div className="space-y-1">
           <h3 className="text-2xl font-black text-white uppercase italic leading-none">{name}</h3>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{branch} Node</p>
        </div>
        <div className="px-4 py-1 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-lg text-[9px] font-black uppercase">Ciclo {cycle}</div>
     </div>
     <div className="space-y-4">
        {teams.map((t: any) => (
           <div key={t.pos} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-all">
              <div className="flex items-center gap-6">
                 <span className="text-lg font-black text-slate-600 italic">#0{t.pos}</span>
                 <span className="text-sm font-black text-white uppercase tracking-tight">{t.name}</span>
              </div>
              <div className="text-right">
                 <span className="block text-[8px] font-black text-slate-500 uppercase">TSR Final</span>
                 <span className="text-lg font-mono font-black text-emerald-500">{t.tsr.toFixed(1)}%</span>
              </div>
           </div>
        ))}
     </div>
  </div>
);

const BadgeIcon = ({ icon, label, color }: any) => (
   <div className="flex flex-col items-center gap-4 group">
      <motion.div whileHover={{ scale: 1.2, rotate: 12 }} className={`w-24 h-24 bg-white/5 rounded-full flex items-center justify-center ${color} border border-white/10 shadow-2xl group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all relative overflow-hidden`}>
         <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
         {icon}
      </motion.div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">{label}</span>
   </div>
);

const RoadmapNode = ({ phase, title, desc, status, active }: any) => (
   <div className="relative pl-24 group">
      <div className={`absolute left-0 top-0 w-16 h-16 rounded-3xl border-2 flex items-center justify-center transition-all ${active ? 'bg-orange-600 border-orange-400 text-white shadow-2xl' : 'bg-slate-900 border-white/10 text-slate-700'}`}>
         <span className="text-[10px] font-black uppercase italic">{phase}</span>
      </div>
      <div className="space-y-2">
         <div className="flex items-center gap-6">
            <h4 className={`text-3xl font-black uppercase italic tracking-tighter ${active ? 'text-white' : 'text-slate-700'}`}>{title}</h4>
            <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${active ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-slate-800'}`}>{status}</span>
         </div>
         <p className="text-slate-500 font-medium italic max-w-xl">{desc}</p>
      </div>
   </div>
);

const CarouselSlide = ({ icon, badge, title, desc, img }: any) => (
   <div className="px-4 outline-none">
      <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[5rem] overflow-hidden min-h-[500px] flex flex-col md:flex-row shadow-3xl relative group border-t-orange-600/30 border-t-4">
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
         <div className="flex-1 p-12 md:p-24 flex flex-col justify-center items-start text-left relative z-20 space-y-8">
            <div className="flex items-center gap-5">
               <div className="p-4 bg-orange-600 rounded-3xl text-white shadow-2xl">{icon}</div>
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] italic">{badge}</span>
            </div>
            <h3 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">{title}</h3>
            <p className="text-xl md:text-2xl text-slate-400 font-medium italic max-w-xl">{desc}</p>
            <button className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 hover:border-orange-400 transition-all flex items-center gap-4 group/btn shadow-xl active:scale-95">
               Ativar Módulo <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
            </button>
         </div>
         <div className="hidden md:block w-1/2 relative overflow-hidden">
            <img src={img} className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-1000" alt={title} />
         </div>
      </div>
   </div>
);

export default LandingPage;
