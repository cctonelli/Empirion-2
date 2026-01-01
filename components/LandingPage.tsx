
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ChevronRight, Sparkles, Trophy, 
  ChevronLeft, ExternalLink, Factory, ShoppingCart, 
  Briefcase, Tractor, DollarSign, Hammer, Box, Zap, Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import { DEFAULT_PAGE_CONTENT, MOCK_ONGOING_CHAMPIONSHIPS, LANDING_PAGE_DATA } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from './EmpireParticles';

// Styles for the carousel
const slickStyles = `
  .slick-dots { bottom: 25px; }
  .slick-dots li button:before { color: white; opacity: 0.2; }
  .slick-dots li.slick-active button:before { color: #f97316; opacity: 1; }
`;

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { i18n, t } = useTranslation(['landing', 'common', 'branches']);
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['landing']);
  const [loading, setLoading] = useState(true);
  const { branchesOverview } = LANDING_PAGE_DATA;

  useEffect(() => {
    const loadData = async () => {
      const dbContent = await fetchPageContent('landing', i18n.language);
      if (dbContent) setContent(dbContent);
      setLoading(false);
    };
    loadData();
  }, [i18n.language]);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 6000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: false
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-100 relative selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <style>{slickStyles}</style>
      <EmpireParticles />
      
      {/* 1. Dynamic Admin-Controlled Carousel */}
      <section className="h-[750px] relative">
        <Slider {...carouselSettings}>
          {content.carousel.map((slide: any) => (
            <div key={slide.id} className="relative h-[750px]">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent z-10" />
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover brightness-50" />
              </div>
              <div className="container mx-auto px-8 md:px-16 h-full flex items-center relative z-20">
                <div className="max-w-4xl space-y-10">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-3 px-6 py-2.5 bg-orange-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_40px_rgba(249,115,22,0.4)]"
                  >
                    <Sparkles size={14} /> {slide.badge}
                  </motion.div>
                  <div className="space-y-6">
                    <motion.h2 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="text-6xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter italic"
                    >
                      {slide.title}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl md:text-3xl text-slate-300 font-medium leading-relaxed max-w-3xl italic"
                    >
                      {slide.subtitle}
                    </motion.p>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link to={slide.link} className="inline-flex items-center gap-4 px-14 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-2xl group">
                      Ver Mais <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* 2. Live Arena Stats (Mock Data Admin-Ready) */}
      <section className="py-32 bg-slate-950/80 backdrop-blur-3xl border-y border-white/5 relative z-20">
        <div className="container mx-auto px-8 md:px-16 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic">Network intelligence</h2>
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter">Active Simulation Nodes</h3>
            </div>
            <Link to="/solutions/open-tournaments" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
              <ExternalLink size={16} /> Ver Painel Global
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_ONGOING_CHAMPIONSHIPS.map((champ, i) => (
              <motion.div 
                key={champ.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] space-y-6 hover:bg-white/10 transition-all cursor-default group"
              >
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                  </div>
                  <Trophy size={18} className="text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-white uppercase tracking-tight leading-tight">{champ.name}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{champ.branch}</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Progresso</span>
                    <span className="text-white">Rodada {champ.round}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Competidores</span>
                    <span className="text-white">{champ.teams} Unidades</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                  Observar Arena
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Hero / Branding Section */}
      <section id="home" className="py-40 px-8 md:px-24 flex flex-col items-center text-center relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative z-10 space-y-12 max-w-6xl"
        >
           <h1 className="text-8xl md:text-[10rem] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
              {content.hero.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-500">{content.hero.empire}</span>
           </h1>
           <p className="text-2xl md:text-3xl text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed italic">
              {content.hero.subtitle}
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-20 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_60px_rgba(37,99,235,0.4)]"
              >
                {content.hero.cta}
              </button>
              <button 
                onClick={() => scrollToSection('branches')}
                className="w-full sm:w-auto px-14 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                {content.hero.secondaryCta}
              </button>
           </div>
        </motion.div>
      </section>

      {/* 4. Branches Explorer */}
      <section id="branches" className="py-40 px-8 md:px-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-24">
           <div className="text-center md:text-left space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Core Matrix</h2>
              <h3 className="text-7xl font-black text-white uppercase tracking-tighter italic">Strategic Domains</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {branchesOverview.map((b) => (
                <Link 
                  to={`/branches/${b.slug}`}
                  key={b.id} 
                  className="group bg-white/5 backdrop-blur-xl p-12 rounded-[4rem] border border-white/5 shadow-2xl hover:border-orange-500/30 transition-all hover:-translate-y-4"
                >
                   <div className={`w-24 h-24 ${b.bg} ${b.color} rounded-[2rem] flex items-center justify-center mb-12 shadow-inner group-hover:scale-110 transition-transform`}>
                      {getBranchIcon(b.icon)}
                   </div>
                   <h4 className="text-4xl font-black text-white uppercase tracking-tight mb-4 italic">{t(`branches:${b.slug}.name`)}</h4>
                   <p className="text-slate-500 text-base font-medium leading-relaxed mb-10">{t(`branches:${b.slug}.description`)}</p>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 group-hover:text-orange-500 transition-colors">
                      Entrar no Módulo <ChevronRight size={16} />
                   </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* 5. Rewards Preview (Admin Controlled Icons) */}
      <section className="py-40 bg-[#020617] relative border-t border-white/5">
        <div className="container mx-auto px-8 md:px-16 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8 mb-24">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Fidelity Rewards</h2>
             <h3 className="text-7xl font-black text-white uppercase tracking-tighter italic leading-none">Empire Reputation Nodes</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
             {content.badges.map((badge: any) => (
               <div key={badge.id} className="p-12 bg-slate-900/50 rounded-[4rem] border border-white/5 flex gap-10 items-center group hover:bg-orange-600/5 transition-all hover:border-orange-600/30">
                  <div className="w-28 h-28 bg-orange-600 text-white rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl group-hover:rotate-12 transition-transform">
                     {getBranchIcon(badge.icon)}
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-3xl font-black text-white uppercase tracking-tight italic">{badge.name}</h4>
                     <p className="text-slate-500 font-bold uppercase text-sm leading-relaxed">{badge.desc}</p>
                     <div className="pt-4 flex items-center gap-4">
                        <span className="px-6 py-2 bg-white/5 rounded-full text-orange-500 font-black text-[10px] uppercase tracking-widest border border-orange-500/20">
                           +{badge.pts} Empire Pts
                        </span>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const getBranchIcon = (name: string) => {
  switch(name) {
    case 'Factory': return <Factory size={40} />;
    case 'ShoppingCart': return <ShoppingCart size={40} />;
    case 'Briefcase': return <Briefcase size={40} />;
    case 'Tractor': return <Tractor size={40} />;
    case 'DollarSign': return <DollarSign size={40} />;
    case 'Hammer': return <Hammer size={40} />;
    case 'Leaf': return <Leaf size={40} />;
    case 'Zap': return <Zap size={40} />;
    default: return <Box size={40} />;
  }
};

export default LandingPage;
