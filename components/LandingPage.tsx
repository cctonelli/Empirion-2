
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Fix: Use any to bypass react-router-dom type resolution issues in this environment
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM as any;
import { 
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, Trophy, 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, Zap, Rocket, Terminal, Award, 
  BarChart3, Users, Play, Cpu, BrainCircuit, Globe
} from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;
import Slider from 'react-slick';
import { DEFAULT_PAGE_CONTENT, APP_VERSION } from '../constants';
import { fetchPageContent, getModalities, subscribeToModalities } from '../services/supabase';
import { Modality } from '../types';
import EmpireParticles from './EmpireParticles';
import LanguageSwitcher from './LanguageSwitcher';

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute -right-4 md:right-10 top-1/2 -translate-y-1/2 z-[100] p-4 md:p-6 bg-slate-900/40 backdrop-blur-2xl hover:bg-orange-600 hover:text-white border border-white/10 rounded-full text-white transition-all shadow-2xl active:scale-90 group">
      <ChevronRight size={32} className="group-hover:scale-125 transition-transform" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute -left-4 md:left-10 top-1/2 -translate-y-1/2 z-[100] p-4 md:p-6 bg-slate-900/40 backdrop-blur-2xl hover:bg-orange-600 hover:text-white border border-white/10 rounded-full text-white transition-all shadow-2xl active:scale-90 group">
      <ChevronLeft size={32} className="group-hover:scale-125 transition-transform" />
    </button>
  );
};

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
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    customPaging: (i: number) => (
      <div className="w-3 h-3 rounded-full bg-white/10 mt-10 hover:bg-orange-500 transition-colors" />
    ),
    dotsClass: "slick-dots custom-dots"
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <EmpireParticles />
      
      {/* SEBRAE-STYLE ORANGE CLOUDS LAYERS - DINAMISMO VISUAL PRESERVADO */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 60, 0] }} transition={{ duration: 18, repeat: Infinity }} className="orange-cloud-pulse w-[1200px] h-[1200px] bg-orange-600/30 -top-[20%] -left-[10%]" />
         <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08], x: [0, -40, 0] }} transition={{ duration: 14, repeat: Infinity, delay: 2 }} className="orange-cloud-pulse w-[900px] h-[900px] bg-orange-400/20 top-[40%] -right-[15%]" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] z-[1]" />
      </div>

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-24 px-8 md:px-24 text-center relative z-20 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-16">
           <div className="flex flex-col items-center gap-6">
              <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.5em] backdrop-blur-xl shadow-2xl">
                 <Terminal size={14} className="inline mr-3 animate-pulse" /> {APP_VERSION} • CORE STABLE
              </div>
           </div>
           <h1 className="text-[50px] sm:text-[70px] md:text-[90px] lg:text-[110px] font-black text-white leading-[0.9] tracking-tighter uppercase italic">
              Crie Sua Arena <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400">Com Empirion</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-4xl mx-auto italic opacity-90 leading-relaxed">
              A arena definitiva onde inteligência neural Gemini e estratégia humana colidem em simulações de alta performance.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
              <Link to="/auth" className="px-16 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:scale-105 transition-all flex items-center gap-4">
                Entre na Arena <Rocket size={20} />
              </Link>
              <Link to="/solutions/simulators" className="px-16 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-white hover:text-slate-950 transition-all backdrop-blur-md">
                Explorar Ramos
              </Link>
           </div>
        </motion.div>
      </section>

      {/* DYNAMIC CAROUSEL - OBRIGATÓRIO DIRETRIZES IMUTÁVEIS */}
      <section className="relative z-30 -mt-20 md:-mt-32 px-6 md:px-24 mb-32">
         <div className="max-w-[1600px] mx-auto">
            <Slider {...carouselSettings}>
               <CarouselSlide 
                  icon={<Factory size={48}/>}
                  badge="Mastery Industrial"
                  title="Produção em Larga Escala"
                  desc="Gerencie cadeias de suprimento complexas e ativos de capital de $9M."
                  img="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200"
               />
               <CarouselSlide 
                  icon={<BrainCircuit size={48}/>}
                  badge="Strategos Intelligence"
                  title="Mentoria via Gemini 3"
                  desc="Análise preditiva e feedbacks táticos em tempo real para seu board."
                  img="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200"
               />
               <CarouselSlide 
                  icon={<Globe size={48}/>}
                  badge="Real-time Arenas"
                  title="Competição Global"
                  desc="Enfrente corporações em 9 regiões simultâneas com sincronização atômica."
                  img="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200"
               />
            </Slider>
         </div>
      </section>

      {/* RAMOS CARDS CLICÁVEIS */}
      <section className="landing-section bg-white/[0.01]">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] italic">Protocolos Disponíveis</span>
               <h2 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Nodos de Simulação</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
               {[
                 { label: 'Industrial', icon: <Factory />, slug: 'industrial', desc: 'Produção $9M Assets' },
                 { label: 'Comercial', icon: <ShoppingCart />, slug: 'commercial', desc: 'Varejo Híbrido' },
                 { label: 'Serviços', icon: <Briefcase />, slug: 'services', desc: 'Capital Intelectual' },
                 { label: 'Agronegócio', icon: <Tractor />, slug: 'agribusiness', desc: 'Ativos Biológicos' },
                 { label: 'Financeiro', icon: <DollarSign />, slug: 'finance', desc: 'Spread & Risco' },
                 { label: 'Construção', icon: <Hammer />, slug: 'construction', desc: 'Obras Pesadas' }
               ].map((r) => (
                 <Link key={r.label} to={`/branches/${r.slug}`} className="p-12 bg-slate-900 border border-white/5 rounded-[3.5rem] hover:border-orange-500/40 transition-all group shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-10 relative z-10">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl">
                          {React.cloneElement(r.icon as React.ReactElement<any>, { size: 32 })}
                       </div>
                       <ArrowRight className="text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" size={24} />
                    </div>
                    <div className="relative z-10">
                       <h4 className="text-2xl font-black text-white uppercase italic mb-2">{r.label}</h4>
                       <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{r.desc}</p>
                    </div>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center bg-[#020617] relative z-20">
         <div className="container mx-auto px-8 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">© 2026 EMPIRION BI ARENA | PROTOCOL NODE 08 STREET</p>
            <div className="mt-6 flex justify-center scale-75 opacity-50"><LanguageSwitcher light /></div>
         </div>
      </footer>
    </div>
  );
};

const CarouselSlide = ({ icon, badge, title, desc, img }: any) => (
   <div className="px-4 outline-none">
      <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[4rem] overflow-hidden min-h-[450px] md:min-h-[500px] flex flex-col md:flex-row shadow-3xl relative group">
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
         <div className="flex-1 p-10 md:p-20 flex flex-col justify-center items-start text-left relative z-20 space-y-6">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl">{icon}</div>
               <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.5em] italic">{badge}</span>
            </div>
            <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
            <p className="text-lg md:text-xl text-slate-400 font-medium italic max-w-lg">{desc}</p>
            <button className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-4">
               Ver Detalhes do Módulo <ArrowRight size={16} />
            </button>
         </div>
         <div className="hidden md:block w-1/2 relative overflow-hidden">
            <img src={img} className="w-full h-full object-cover grayscale opacity-50 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-1000" alt={title} />
         </div>
      </div>
   </div>
);

export default LandingPage;
