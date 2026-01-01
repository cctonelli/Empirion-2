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

const slickStyles = `
  .slick-dots { bottom: 35px; }
  .slick-dots li button:before { color: white; opacity: 0.15; font-size: 8px; }
  .slick-dots li.slick-active button:before { color: #3b82f6; opacity: 1; text-shadow: 0 0 10px #3b82f6; }
  .fluid-title { font-size: clamp(2.5rem, 8vw + 1rem, 10rem); }
  .fluid-subtitle { font-size: clamp(1rem, 2vw + 0.5rem, 2rem); }
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
    speed: 1200,
    autoplay: true,
    autoplaySpeed: 7000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: false,
    pauseOnHover: false
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative selection:bg-blue-500 selection:text-white overflow-x-hidden">
      <style>{slickStyles}</style>
      <EmpireParticles />
      
      {/* Hero Carousel Section */}
      <section className="h-[90vh] min-h-[600px] relative overflow-hidden">
        <Slider {...carouselSettings}>
          {content.carousel.map((slide: any) => (
            <div key={slide.id} className="relative h-[90vh] min-h-[600px]">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-10" />
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover scale-105 animate-[slowZoom_20s_infinite_alternate]" />
              </div>
              <div className="container mx-auto px-6 md:px-16 h-full flex items-center relative z-20">
                <div className="max-w-5xl space-y-10">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-600/20 backdrop-blur-xl text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  >
                    <Sparkles size={14} /> {slide.badge}
                  </motion.div>
                  <div className="space-y-6">
                    <motion.h2 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="fluid-title font-black text-white leading-[0.9] uppercase tracking-tighter italic drop-shadow-2xl"
                    >
                      {slide.title}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="fluid-subtitle text-slate-300 font-medium leading-relaxed max-w-3xl italic"
                    >
                      {slide.subtitle}
                    </motion.p>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-6"
                  >
                    <Link to={slide.link} className="inline-flex items-center gap-4 px-12 py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl group overflow-hidden relative">
                      <span className="relative z-10">Explorar Nodo</span>
                      <ChevronRight className="group-hover:translate-x-2 transition-transform relative z-10" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Main Hero Branding */}
      <section className="py-40 px-6 md:px-24 text-center relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-12"
        >
           <h1 className="fluid-title font-black text-white leading-[0.85] tracking-tighter uppercase italic">
              {content.hero.title} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-orange-500 animate-gradient-x">{content.hero.empire}</span>
           </h1>
           <p className="fluid-subtitle text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed italic">
              {content.hero.subtitle}
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-16 py-7 bg-blue-600 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:scale-105 hover:bg-blue-500 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95"
              >
                {content.hero.cta}
              </button>
              <Link 
                to="/solutions/simulators"
                className="w-full sm:w-auto px-12 py-7 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                Conhecer Setores <ArrowRight size={18} />
              </Link>
           </div>
        </motion.div>
      </section>

      {/* Grid de Setores Refinado */}
      <section className="py-40 px-6 md:px-12 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-24">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-4 border-orange-600 pl-8">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Core Engine Nodes</h2>
                <h3 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic">Strategic Domains</h3>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {branchesOverview.map((b, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={b.id}
                >
                  <Link 
                    to={`/branches/${b.slug}`}
                    className="group flex flex-col h-full bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-4"
                  >
                    <div className={`w-20 h-20 ${b.bg} ${b.color} rounded-[1.5rem] flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        {getBranchIcon(b.icon)}
                    </div>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-4 italic group-hover:text-blue-400 transition-colors">{t(`branches:${b.slug}.name`)}</h4>
                    <p className="text-slate-500 text-sm font-bold uppercase leading-relaxed mb-10 flex-1">{t(`branches:${b.slug}.description`)}</p>
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 group-hover:text-white transition-all">
                        Entrar no Módulo <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      <style>{`
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.15); } }
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 10s ease infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const getBranchIcon = (name: string) => {
  const size = 32;
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