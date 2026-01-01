
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

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] p-4 bg-slate-900/40 backdrop-blur-xl hover:bg-blue-600/90 border border-white/10 rounded-full text-white transition-all group hidden md:flex items-center justify-center shadow-2xl active:scale-90" aria-label="Next slide">
      <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute left-6 top-1/2 -translate-y-1/2 z-[100] p-4 bg-slate-900/40 backdrop-blur-xl hover:bg-blue-600/90 border border-white/10 rounded-full text-white transition-all group hidden md:flex items-center justify-center shadow-2xl active:scale-90" aria-label="Previous slide">
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
      badge: 'Nova Modalidade',
      link: `/solutions/${m.slug}`
    }))
  ];

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative selection:bg-blue-500 selection:text-white overflow-x-hidden">
      <EmpireParticles />
      
      {/* 1. CARROSSEL HERO */}
      <section className="h-[85vh] min-h-[650px] relative overflow-hidden">
        <Slider {...carouselSettings}>
          {allCarouselSlides.map((slide: any) => (
            <div key={slide.id} className="relative h-[85vh] min-h-[650px]">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent z-10" />
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover scale-105" />
              </div>
              <div className="container mx-auto px-6 md:px-24 h-full flex items-center relative z-20">
                <div className="max-w-4xl space-y-10">
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-8 py-3 bg-blue-600/20 backdrop-blur-xl text-blue-400 rounded-full text-[11px] font-black uppercase tracking-[0.4em] border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                    <Sparkles size={16} /> {slide.badge}
                  </motion.div>
                  <div className="space-y-6">
                    <motion.h2 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-black text-white leading-[0.85] uppercase tracking-tighter italic drop-shadow-2xl">
                      {slide.title}
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl italic opacity-90">
                      {slide.subtitle}
                    </motion.p>
                  </div>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                    <Link to={slide.link} className="cyber-button inline-flex items-center gap-5 px-14 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.25em] transition-all shadow-2xl active:scale-95">
                      Explorar Nodo <ChevronRight size={18} className="text-orange-600" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* 2. MAIN HERO SECTION (Full Context) */}
      <section className="py-40 px-6 md:px-24 text-center relative z-20">
        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-6xl mx-auto space-y-16">
           <h1 className="fluid-title font-black text-white leading-[0.8] tracking-tighter uppercase italic">
              {content.hero.title} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-orange-500 animate-gradient-x">{content.hero.empire}</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed italic opacity-80">
              {content.hero.subtitle}
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12">
              <button onClick={onLogin} className="cyber-button w-full sm:w-auto px-20 py-8 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] transition-all shadow-[0_30px_70px_rgba(37,99,235,0.4)] active:scale-95">
                {content.hero.cta}
              </button>
              <Link to="/solutions/simulators" className="cyber-button w-full sm:w-auto px-16 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-5 backdrop-blur-xl active:scale-95">
                {content.hero.secondaryCta} <ArrowRight size={22} className="text-blue-500" />
              </Link>
           </div>
        </motion.div>
      </section>

      {/* 3. PLACAR DE CAMPEONATOS (Leaderboard) */}
      <section className="py-20 px-6 md:px-24 relative z-20">
         <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Strategic Leaderboards</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tempo real via Oracle Cloud</p>
               </div>
               <Link to="/solutions/open-tournaments" className="text-xs font-black uppercase text-blue-400 hover:text-white transition-colors flex items-center gap-2">Ver Todas <ChevronRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {content.leaderboard.map((champ: any) => (
                 <div key={champ.id} className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 p-10 rounded-[3rem] flex items-center justify-between group hover:bg-blue-600/5 transition-all">
                    <div className="space-y-4">
                       <div className="px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest w-fit">Live Arena</div>
                       <h4 className="text-3xl font-black uppercase tracking-tight italic leading-none">{champ.name}</h4>
                       <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>{champ.status}</span>
                          <span>{champ.teams} Equipes</span>
                       </div>
                    </div>
                    <div className="text-right space-y-2">
                       <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">Leader</span>
                       <span className="text-xl font-black text-white italic">{champ.lead}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. EMPIRE POINTS / BADGES */}
      <section className="py-20 px-6 md:px-24 relative z-20 bg-blue-600/5">
         <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-2xl mb-4"><Award size={32} /></div>
               <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Empire Rewards Program</h2>
               <p className="text-slate-400 font-medium max-w-2xl mx-auto italic">Acumule pontos em campeonatos públicos e troque por badges de prestígio auditados pelo Command Center.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {content.badges.map((badge: any) => (
                 <div key={badge.id} className="bg-slate-900/80 p-10 rounded-[3.5rem] border border-white/5 text-center space-y-6 hover:translate-y-[-10px] transition-all">
                    <div className={`w-20 h-20 mx-auto bg-white/5 rounded-3xl flex items-center justify-center text-3xl shadow-inner ${badge.color}`}>
                       {badge.icon === 'Factory' ? <Factory /> : badge.icon === 'Leaf' ? <Leaf /> : <Zap />}
                    </div>
                    <div>
                       <h4 className="text-xl font-black uppercase tracking-tight">{badge.name}</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{badge.desc}</p>
                    </div>
                    <div className="text-2xl font-black text-white">{badge.pts} <span className="text-[10px] opacity-40">EXP</span></div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. FEATURES CORE GRID */}
      <section className="py-40 px-6 md:px-24 relative z-20">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
               <div className="lg:col-span-4 space-y-8">
                  <div className="inline-flex p-3 bg-blue-600 text-white rounded-2xl"><Zap size={24} /></div>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.9]">Tecnologia <br/> de Núcleo</h2>
                  <p className="text-slate-400 font-medium italic leading-relaxed">
                     O Empirion não é apenas um simulador. É um ecossistema de orquestração empresarial que utiliza inteligência preditiva para moldar o futuro das corporações.
                  </p>
                  <div className="pt-6">
                     <button onClick={onLogin} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors group">
                        Ver Roadmap Técnico <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform"/>
                     </button>
                  </div>
               </div>
               <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {content.features.map((f: any) => (
                    <div key={f.id} className="bg-white/5 p-12 rounded-[4rem] border border-white/5 space-y-6 group hover:bg-white/10 transition-all">
                       <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 transition-transform group-hover:scale-110">
                          {f.icon === 'Zap' ? <Zap /> : f.icon === 'Brain' ? <Brain /> : <Shield />}
                       </div>
                       <h4 className="text-2xl font-black uppercase italic tracking-tight">{f.title}</h4>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 6. SETORES (BRANCHES) GRID */}
      <section className="py-40 px-6 md:px-24 relative z-20 bg-slate-900/40">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <h2 className="text-5xl font-black uppercase italic tracking-tighter">Domínios Estratégicos</h2>
               <p className="text-slate-400 font-medium max-w-3xl mx-auto italic">
                  Modelamos a complexidade de múltiplos setores com fidelidade absoluta. <br/> Escolha seu campo de batalha industrial ou comercial.
               </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
               {LANDING_PAGE_DATA.branchesOverview.map(branch => (
                 <Link key={branch.id} to={`/branches/${branch.slug}`} className="group relative">
                    <div className={`aspect-square rounded-[3rem] ${branch.bg} border border-white/5 flex flex-col items-center justify-center gap-6 transition-all group-hover:scale-105 group-hover:bg-blue-600 group-hover:shadow-3xl overflow-hidden`}>
                       <div className={`${branch.color} group-hover:text-white transition-colors transform group-hover:scale-125 transition-transform duration-500`}>
                          {getBranchIcon(branch.icon)}
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-white transition-colors">{branch.slug}</span>
                    </div>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* FOOTER MINIMAL */}
      <footer className="py-20 border-t border-white/5 text-center relative z-20">
         <div className="container mx-auto px-6 space-y-6 opacity-40">
            <div className="flex justify-center gap-10">
               <span className="text-[9px] font-black uppercase tracking-widest">Protocol Engine v5.5 Gold</span>
               <span className="text-[9px] font-black uppercase tracking-widest">© 2026 EMPIRION BI ARENA</span>
            </div>
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed">
               A Arena Definitiva onde a Inteligência Artificial e a Estratégia Humana colidem. Fidelidade SIAGRO-SISERV-SIMCO.
            </p>
         </div>
      </footer>

      <style>{`
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 15s ease infinite; }
        .custom-dots { bottom: 60px !important; }
        .custom-dots li button:before { color: white !important; opacity: 0.1 !important; font-size: 12px !important; }
        .custom-dots li.slick-active button:before { color: #3b82f6 !important; opacity: 1 !important; text-shadow: 0 0 20px #3b82f6; }
        .slick-prev:before, .slick-next:before { display: none; }
      `}</style>
    </div>
  );
};

const getBranchIcon = (name: string) => {
  const size = 48;
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
