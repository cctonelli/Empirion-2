
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, Trophy, 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, Box, Zap, Rocket, Terminal
} from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import Slider from 'react-slick';
import { DEFAULT_PAGE_CONTENT, APP_VERSION, BUILD_DATE } from '../constants';
import { fetchPageContent, getModalities, subscribeToModalities } from '../services/supabase';
import { Modality } from '../types';
import EmpireParticles from './EmpireParticles';
import LanguageSwitcher from './LanguageSwitcher';

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] p-4 bg-slate-900/40 backdrop-blur-xl hover:bg-orange-600/90 border border-white/10 rounded-full text-white transition-all shadow-2xl active:scale-90">
      <ChevronRight size={24} />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute left-6 top-1/2 -translate-y-1/2 z-[100] p-4 bg-slate-900/40 backdrop-blur-xl hover:bg-orange-600/90 border border-white/10 rounded-full text-white transition-all shadow-2xl active:scale-90">
      <ChevronLeft size={24} />
    </button>
  );
};

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['landing']);
  const [dynamicModalities, setDynamicModalities] = useState<Modality[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const db = await fetchPageContent('landing', i18n.language);
      if (db) setContent({ ...DEFAULT_PAGE_CONTENT['landing'], ...db });
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
    dotsClass: "slick-dots custom-dots"
  };

  const allCarouselSlides = [
    ...content.carousel,
    ...dynamicModalities.map(m => ({
      id: m.id,
      title: m.name,
      subtitle: m.description,
      image: m.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000',
      badge: 'Arena Real-time',
      link: `/activities/${m.slug}`
    }))
  ];

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-100 relative selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <EmpireParticles />
      
      {/* FLOATING CTA */}
      <div className="fixed bottom-10 right-10 z-[5000] flex flex-col items-end gap-4 pointer-events-none">
         <Link 
           to="/test/industrial"
           className="pointer-events-auto group relative flex items-center gap-4 bg-orange-600 p-5 rounded-full shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white transition-all active:scale-95"
         >
            <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20" />
            <Rocket size={24} className="text-white group-hover:text-orange-600 transition-colors" />
         </Link>
      </div>

      {/* CARROSSEL NEBULOSA */}
      <section className="h-[85vh] min-h-[600px] relative overflow-hidden bg-transparent">
        <Slider {...carouselSettings}>
          {allCarouselSlides.map((slide: any) => (
            <div key={slide.id} className="relative h-[85vh] min-h-[600px] bg-transparent outline-none">
              <div className="absolute inset-0 z-0 bg-transparent">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/90 z-10" />
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-50 brightness-45 contrast-125" />
              </div>
              <div className="container mx-auto px-6 md:px-24 h-full flex items-center relative z-20">
                <div className="max-w-4xl space-y-10">
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-3xl text-orange-400 rounded-full text-[11px] font-black uppercase tracking-[0.4em] border border-white/10 shadow-2xl">
                    <Sparkles size={16} /> {slide.badge}
                  </motion.div>
                  <div className="space-y-6">
                    <motion.h2 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-9xl font-black text-white leading-[0.8] uppercase tracking-tighter italic">
                      {slide.title}
                    </motion.h2>
                    <p className="text-xl md:text-2xl text-slate-300 font-medium italic opacity-90 max-w-3xl">
                      {slide.subtitle}
                    </p>
                  </div>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Link to={slide.link} className="cyber-button inline-flex items-center gap-5 px-14 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.25em] shadow-2xl">
                      Acessar Nodo <ChevronRight size={18} className="text-orange-600" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* HERO PRINCIPAL COM NUVENS LARANJA (SEBRAE STYLE) */}
      <section className="py-40 px-6 md:px-24 text-center relative z-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-[-1]">
           <motion.div 
             animate={{ x: [-100, 100], y: [-50, 50], scale: [1, 1.1, 1] }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="w-[1200px] h-[1200px] bg-orange-600/15 blur-[200px] rounded-full absolute -top-1/2 -left-1/4"
           />
           <motion.div 
             animate={{ x: [100, -100], y: [50, -50], scale: [1.1, 0.9, 1.1] }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="w-[1000px] h-[1000px] bg-orange-500/10 blur-[180px] rounded-full absolute -bottom-1/2 -right-1/4"
           />
        </div>

        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-6xl mx-auto space-y-16">
           <div className="flex flex-col items-center gap-4 mb-4">
              <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono font-black text-orange-500 uppercase tracking-widest">
                 <Terminal size={10} className="inline mr-2" /> {APP_VERSION} • BUILD {BUILD_DATE}
              </div>
           </div>
           <h1 className="fluid-title font-black text-white leading-[0.8] tracking-tighter uppercase italic">
              Forje Seu Império <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400">Insight Estratégico IA</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-400 font-medium max-w-4xl mx-auto italic">
              A maior arena de simulações empresariais multiplayer assistida por Gemini IA.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12">
              <Link to="/test/industrial" className="cyber-button px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl">
                Entre na Arena <Rocket size={20} className="inline ml-2" />
              </Link>
           </div>
        </motion.div>
      </section>

      {/* SEÇÕES ADICIONAIS ... */}
      
      <footer className="py-20 border-t border-white/5 text-center relative z-20 bg-slate-950/40 backdrop-blur-3xl">
         <div className="container mx-auto px-6">
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-orange-500 italic mb-4">
               BUILD {APP_VERSION} GOLD • {BUILD_DATE}
            </p>
            <div className="flex justify-center gap-4">
               <LanguageSwitcher light />
            </div>
         </div>
      </footer>

      <style>{`
        .custom-dots { bottom: 60px !important; }
        .custom-dots li button:before { color: white !important; opacity: 0.1 !important; }
        .custom-dots li.slick-active button:before { color: #f97316 !important; opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default LandingPage;
