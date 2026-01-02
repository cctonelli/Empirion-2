import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, Trophy, 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, Box, Zap, Leaf, Shield, Brain, LayoutGrid, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import { DEFAULT_PAGE_CONTENT, LANDING_PAGE_DATA } from '../constants';
import { fetchPageContent, getModalities, subscribeToModalities } from '../services/supabase';
import { Modality } from '../types';
import EmpireParticles from './EmpireParticles';
import LanguageSwitcher from './LanguageSwitcher';

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] p-4 bg-slate-900/40 backdrop-blur-xl hover:bg-orange-600/90 border border-white/10 rounded-full text-white transition-all group hidden md:flex items-center justify-center shadow-2xl active:scale-90" aria-label="Next slide">
      <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute left-6 top-1/2 -translate-y-1/2 z-[100] p-4 bg-slate-900/40 backdrop-blur-xl hover:bg-orange-600/90 border border-white/10 rounded-full text-white transition-all group hidden md:flex items-center justify-center shadow-2xl active:scale-90" aria-label="Previous slide">
      <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
    </button>
  );
};

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['landing']);
  const [dynamicModalities, setDynamicModalities] = useState<Modality[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const dbContent = await fetchPageContent('landing', i18n.language);
      if (dbContent) setContent({ ...DEFAULT_PAGE_CONTENT['landing'], ...dbContent });
      const mods = await getModalities();
      setDynamicModalities(mods);
    };
    loadData();
    const channel = subscribeToModalities(loadData);
    return () => { channel.unsubscribe(); };
  }, [i18n.language]);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 1200,
    autoplay: true,
    autoplaySpeed: 6000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    pauseOnHover: true,
    dotsClass: "slick-dots custom-dots"
  };

  const allCarouselSlides = [
    ...content.carousel,
    ...dynamicModalities.map(m => ({
      id: m.id,
      title: m.name,
      subtitle: m.description,
      image: m.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000',
      badge: 'Arena Real-time',
      link: `/activities/${m.slug}`
    }))
  ];

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-100 relative selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <EmpireParticles />
      
      {/* 1. CARROSSEL NEBULOSA (CORREÇÃO DE TRANSLUCIDEZ - 50% OPACITY) */}
      <section className="h-[85vh] min-h-[600px] relative overflow-hidden bg-transparent">
        <Slider {...carouselSettings}>
          {allCarouselSlides.map((slide: any) => (
            <div key={slide.id} className="relative h-[85vh] min-h-[600px] bg-transparent outline-none">
              <div className="absolute inset-0 z-0 bg-transparent">
                {/* Imagem com 50% de opacidade e blend mode para deixar o cosmos visível */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/90 z-10 pointer-events-none" />
                <div className="absolute inset-0 backdrop-blur-[4px] z-[5] pointer-events-none" />
                <img 
                   src={slide.image} 
                   alt={slide.title} 
                   className="w-full h-full object-cover scale-105 opacity-50 brightness-45 contrast-125 transition-transform duration-[15s] ease-linear mix-blend-screen" 
                />
              </div>
              <div className="container mx-auto px-6 md:px-24 h-full flex items-center relative z-20">
                <div className="max-w-4xl space-y-10">
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-3xl text-orange-400 rounded-full text-[11px] font-black uppercase tracking-[0.4em] border border-white/10 shadow-2xl">
                    <Sparkles size={16} className="animate-pulse" /> {slide.badge}
                  </motion.div>
                  <div className="space-y-6">
                    <motion.h2 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-9xl font-black text-white leading-[0.8] uppercase tracking-tighter italic drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
                      {slide.title}
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl italic opacity-90 drop-shadow-lg">
                      {slide.subtitle}
                    </motion.p>
                  </div>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                    <Link to={slide.link} className="cyber-button inline-flex items-center gap-5 px-14 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.25em] transition-all shadow-2xl active:scale-95">
                      Iniciar Protocolo <ChevronRight size={18} className="text-orange-600" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* 2. HERO PRINCIPAL (TRANSLÚCIDO E IDENTIDADE PURA) */}
      <section className="py-40 px-6 md:px-24 text-center relative z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-[-1] opacity-40">
           <div className="w-[1000px] h-[1000px] bg-blue-600/10 blur-[180px] rounded-full absolute top-0 left-0 animate-pulse"></div>
           <div className="w-[800px] h-[800px] bg-orange-600/10 blur-[160px] rounded-full absolute bottom-0 right-0 animate-pulse [animation-delay:2s]"></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-6xl mx-auto space-y-16">
           <h1 className="fluid-title font-black text-white leading-[0.8] tracking-tighter uppercase italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              Forje Seu Império <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-orange-400 animate-gradient-x">Com Insight Estratégico IA</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed italic opacity-90">
              A Arena Definitiva onde a Inteligência Artificial Gemini e a Estratégia Humana colidem em simulações exclusivas da plataforma Empirion.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12">
              <button onClick={onLogin} className="cyber-button w-full sm:w-auto px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] transition-all shadow-[0_30px_70px_rgba(249,115,22,0.4)] active:scale-95">
                Entre na Arena
              </button>
              <Link to="/solutions/simulators" className="cyber-button w-full sm:w-auto px-16 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-5 backdrop-blur-xl active:scale-95">
                Explorar Atividades <ArrowRight size={22} className="text-orange-500" />
              </Link>
           </div>
        </motion.div>
      </section>

      {/* 3. PLACAR CAMPEONATOS (GLASSMORPHISM) */}
      <section className="py-20 px-6 md:px-24 relative z-20">
         <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-orange-500">Global Standings</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Placar em tempo real via Oracle Audit Node</p>
               </div>
               <Link to="/solutions/open-tournaments" className="text-xs font-black uppercase text-blue-400 hover:text-white transition-colors flex items-center gap-2">Ver Painel Global <ChevronRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {content.leaderboard.map((champ: any) => (
                 <div key={champ.id} className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] flex items-center justify-between group hover:border-orange-500/40 transition-all shadow-2xl">
                    <div className="space-y-4">
                       <div className="px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest w-fit shadow-lg shadow-emerald-500/20">Arena Ativa</div>
                       <h4 className="text-3xl font-black uppercase tracking-tight italic leading-none text-white">{champ.name}</h4>
                       <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>{champ.status}</span>
                          <span>{champ.teams} Equipes Ativas</span>
                       </div>
                    </div>
                    <div className="text-right space-y-2">
                       <span className="block text-[10px] font-black text-orange-500 uppercase tracking-widest">Oracle Leader</span>
                       <span className="text-xl font-black text-white italic">{champ.lead}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <footer className="py-32 border-t border-white/5 text-center relative z-20 bg-slate-950/40 backdrop-blur-3xl">
         <div className="container mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row justify-center items-center gap-10">
               <Link to="/" className="flex items-center gap-4 opacity-80">
                  <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">E</div>
                  <span className="text-xl font-black tracking-tighter text-white uppercase italic">Empirion</span>
               </Link>
               <nav className="flex gap-10">
                  {['Privacidade', 'Termos de Uso', 'SaaS Hub', 'Suporte'].map(link => (
                    <a key={link} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors">{link}</a>
                  ))}
               </nav>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.6em] max-w-2xl mx-auto leading-relaxed text-slate-600 italic">
               Construindo impérios empresariais do futuro através da orquestração neural. <br/> 
               Build v6.0 GOLD • Protocol Command Node 08
            </p>
            <div className="flex justify-center gap-4 pt-10">
               <LanguageSwitcher light />
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 15s ease infinite; }
        .custom-dots { bottom: 60px !important; }
        .custom-dots li button:before { color: white !important; opacity: 0.1 !important; font-size: 12px !important; }
        .custom-dots li.slick-active button:before { color: #f97316 !important; opacity: 1 !important; text-shadow: 0 0 20px #f97316; }
        .slick-list { background: transparent !important; }
        .slick-track { background: transparent !important; }
      `}</style>
    </div>
  );
};

const getBranchIcon = (name: string) => {
  const size = 42;
  switch(name) {
    case 'Factory': return <Factory size={size} />;
    case 'ShoppingCart': return <ShoppingCart size={size} />;
    case 'Briefcase': return <Briefcase size={size} />;
    case 'Tractor': return <Tractor size={size} />;
    case 'DollarSign': return <DollarSign size={size} />;
    case 'Hammer': return <Hammer size={size} />;
    default: return <Box size={size} />;
  }
};

export default LandingPage;
