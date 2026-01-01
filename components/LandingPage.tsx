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
import { DEFAULT_PAGE_CONTENT, LANDING_PAGE_DATA } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from './EmpireParticles';

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
    speed: 1500,
    autoplay: true,
    autoplaySpeed: 8000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: false,
    pauseOnHover: false
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative selection:bg-blue-500 selection:text-white overflow-x-hidden">
      <EmpireParticles />
      
      {/* Hero Carousel Section (95vh) */}
      <section className="h-[95vh] min-h-[700px] relative overflow-hidden">
        <Slider {...carouselSettings}>
          {content.carousel.map((slide: any) => (
            <div key={slide.id} className="relative h-[95vh] min-h-[700px]">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-10" />
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover scale-105 animate-[slowZoom_30s_infinite_alternate]" />
              </div>
              <div className="container mx-auto px-6 md:px-16 h-full flex items-center relative z-20">
                <div className="max-w-5xl space-y-12">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-3 px-8 py-3 bg-blue-600/20 backdrop-blur-xl text-blue-400 rounded-full text-[11px] font-black uppercase tracking-[0.4em] border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                  >
                    <Sparkles size={16} /> {slide.badge}
                  </motion.div>
                  <div className="space-y-8">
                    <motion.h2 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="fluid-title font-black text-white leading-[0.85] uppercase tracking-tighter italic drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                    >
                      {slide.title}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl md:text-3xl text-slate-300 font-medium leading-relaxed max-w-4xl italic opacity-90"
                    >
                      {slide.subtitle}
                    </motion.p>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-8"
                  >
                    <Link to={slide.link} className="cyber-button inline-flex items-center gap-5 px-16 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.25em] transition-all shadow-[0_25px_60px_rgba(0,0,0,0.4)] group overflow-hidden relative">
                      <span className="relative z-10">Explorar Nodo</span>
                      <ChevronRight className="group-hover:translate-x-3 transition-transform relative z-10 text-orange-600" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Brand Hero Callout */}
      <section className="py-60 px-6 md:px-24 text-center relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-16"
        >
           <h1 className="fluid-title font-black text-white leading-[0.8] tracking-tighter uppercase italic">
              {content.hero.title} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-orange-500 animate-gradient-x">{content.hero.empire}</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed italic opacity-80">
              {content.hero.subtitle}
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-16">
              <button 
                onClick={onLogin}
                className="cyber-button w-full sm:w-auto px-20 py-8 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] transition-all shadow-[0_30px_70px_rgba(37,99,235,0.4)]"
              >
                {content.hero.cta}
              </button>
              <Link 
                to="/solutions/simulators"
                className="cyber-button w-full sm:w-auto px-16 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-5 backdrop-blur-xl"
              >
                Conhecer Setores <ArrowRight size={22} className="text-blue-500" />
              </Link>
           </div>
        </motion.div>
      </section>

      {/* Grid de Setores (WOW 1.0) */}
      <section className="py-60 px-6 md:px-12 bg-white/[0.01] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto space-y-32">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-l-8 border-orange-600 pl-12">
              <div className="space-y-6">
                <h2 className="text-[14px] font-black uppercase tracking-[0.6em] text-orange-500 italic">Core Simulation Hub</h2>
                <h3 className="fluid-title text-white uppercase tracking-tighter italic leading-none">Strategic Domains</h3>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {branchesOverview.map((b, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  key={b.id}
                >
                  <Link 
                    to={`/branches/${b.slug}`}
                    className="group flex flex-col h-full bg-slate-900/40 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-blue-500/40 transition-all duration-700 hover:-translate-y-8 relative overflow-hidden"
                  >
                    {/* Shadow Graphic Background */}
                    <div className="absolute -bottom-16 -right-16 opacity-[0.02] group-hover:scale-150 group-hover:opacity-[0.08] group-hover:rotate-12 transition-all duration-1000">
                        {getBranchIcon(b.icon, 280)}
                    </div>

                    <div className={`w-28 h-28 ${b.bg} ${b.color} rounded-[2.5rem] flex items-center justify-center mb-16 shadow-inner group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 border border-white/5`}>
                        {getBranchIcon(b.icon, 48)}
                    </div>
                    
                    <h4 className="text-4xl font-black text-white uppercase tracking-tight mb-8 italic group-hover:text-blue-400 transition-colors">{t(`branches:${b.slug}.name`)}</h4>
                    <p className="text-slate-500 text-sm font-bold uppercase leading-relaxed mb-16 flex-1 italic opacity-80">{t(`branches:${b.slug}.description`)}</p>
                    
                    <div className="flex items-center gap-5 text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 group-hover:text-white transition-all">
                        Entrar no Módulo <ChevronRight size={18} className="group-hover:translate-x-4 transition-transform text-orange-500" />
                    </div>
                  </Link>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      <style>{`
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.2); } }
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x(15s) ease infinite; }
        .slick-dots { bottom: 40px !important; }
        .slick-dots li button:before { color: white !important; opacity: 0.15 !important; font-size: 10px !important; }
        .slick-dots li.slick-active button:before { color: #3b82f6 !important; opacity: 1 !important; text-shadow: 0 0 15px #3b82f6; }
      `}</style>
    </div>
  );
};

const getBranchIcon = (name: string, size: number = 40) => {
  switch(name) {
    case 'Factory': return <Factory size={size} />;
    case 'ShoppingCart': return <ShoppingCart size={size} />;
    case 'Briefcase': return <Briefcase size={size} />;
    case 'Tractor': return <Tractor size={size} />;
    case 'DollarSign': return <DollarSign size={size} />;
    case 'Hammer': return <Hammer size={size} />;
    case 'Leaf': return <Leaf size={size} />;
    case 'Zap': return <Zap size={size} />;
    default: return <Box size={size} />;
  }
};

export default LandingPage;