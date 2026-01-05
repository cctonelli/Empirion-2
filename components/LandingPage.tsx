import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, Trophy, 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, Box, Zap, Rocket, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      
      {/* FLOATING CTA: TESTE GRÁTIS */}
      <div className="fixed bottom-10 right-10 z-[5000] flex flex-col items-end gap-4 pointer-events-none">
         <motion.div 
           initial={{ opacity: 0, x: 50 }} 
           animate={{ opacity: 1, x: 0 }}
           className="hidden md:block bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] mb-2"
         >
            <p className="text-[9px] font-black uppercase text-orange-500 tracking-[0.2em] mb-1">Oferta Alpha</p>
            <p className="text-white font-bold text-xs uppercase tracking-tighter leading-tight">Experimente a Arena <br/> sem compromisso</p>
         </motion.div>
         <Link 
           to="/test/industrial"
           className="pointer-events-auto group relative flex items-center gap-4 bg-orange-600 p-5 rounded-full shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white transition-all active:scale-95 active:shadow-inner"
         >
            <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20 group-hover:hidden" />
            <motion.div 
              initial={{ width: 60 }} 
              whileHover={{ width: 220 }}
              className="overflow-hidden flex items-center justify-end whitespace-nowrap"
            >
               <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-950 mr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  Teste Grátis Agora
               </span>
               <Rocket size={24} className="text-white group-hover:text-orange-600 transition-colors shrink-0" />
            </motion.div>
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
                    <motion.h2 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-9xl font-black text-white leading-[0.8] uppercase tracking-tighter italic drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
                      {slide.title}
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl italic opacity-90">
                      {slide.subtitle}
                    </motion.p>
                  </div>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                    <Link to={slide.link} className="cyber-button inline-flex items-center gap-5 px-14 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.25em] shadow-2xl active:scale-95">
                      Acessar Nodo <ChevronRight size={18} className="text-orange-600" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* HERO PRINCIPAL COM NUVENS LARANJA (SEBRAE STYLE - WOW) */}
      <section className="py-40 px-6 md:px-24 text-center relative z-20 overflow-hidden">
        {/* MULTI-LAYER DRIFTING CLOUDS */}
        <div className="absolute inset-0 pointer-events-none z-[-1]">
           <motion.div 
             animate={{ x: [-100, 100, -100], y: [-50, 50, -50], scale: [1, 1.2, 1] }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="w-[1400px] h-[1400px] bg-orange-600/20 blur-[200px] rounded-full absolute -top-1/2 -left-1/4"
           />
           <motion.div 
             animate={{ x: [100, -100, 100], y: [50, -50, 50], scale: [1.1, 0.9, 1.1] }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="w-[1200px] h-[1200px] bg-orange-500/15 blur-[180px] rounded-full absolute -bottom-1/2 -right-1/4"
           />
           <motion.div 
             animate={{ x: [-50, 50, -50], y: [100, -100, 100], opacity: [0.3, 0.6, 0.3] }}
             transition={{ duration: 12, repeat: Infinity }}
             className="w-[1000px] h-[1000px] bg-orange-700/10 blur-[220px] rounded-full absolute top-1/4 left-1/4"
           />
        </div>

        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-6xl mx-auto space-y-16">
           <div className="flex flex-col items-center gap-4 mb-4">
              <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                 <Terminal size={10} /> {APP_VERSION} • BUILD {BUILD_DATE}
              </div>
           </div>
           <h1 className="fluid-title font-black text-white leading-[0.8] tracking-tighter uppercase italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              Forje Seu Império <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400 animate-gradient-x">Insight Estratégico IA</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed italic opacity-90">
              A maior arena de simulações empresariais multiplayer assistida por Gemini IA. Onde a orquestração tática encontra a execução perfeita.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12">
              <Link to="/test/industrial" className="cyber-button w-full sm:w-auto px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-[0_30px_70px_rgba(249,115,22,0.4)] active:scale-95 flex items-center justify-center gap-4">
                Entre na Arena <Rocket size={20} className="animate-pulse" />
              </Link>
              <Link to="/solutions/simulators" className="cyber-button w-full sm:w-auto px-16 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-5 backdrop-blur-xl">
                Explorar Ramos <ArrowRight size={22} className="text-orange-500" />
              </Link>
           </div>
        </motion.div>
      </section>

      {/* PLACAR CAMPEONATOS */}
      <section className="py-20 px-6 md:px-24 relative z-20">
         <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-orange-500">Live Leaderboard</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sincronização via Oracle Node 08</p>
               </div>
               <Link to="/solutions/open-tournaments" className="text-xs font-black uppercase text-blue-400 flex items-center gap-2">Ver Todos <ChevronRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {content.leaderboard.map((champ: any) => (
                 <div key={champ.id} className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] flex items-center justify-between group hover:border-orange-500/40 transition-all shadow-2xl">
                    <div className="space-y-4">
                       <div className="px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest w-fit shadow-lg">Arena Ativa</div>
                       <h4 className="text-3xl font-black uppercase tracking-tight italic text-white">{champ.name}</h4>
                       <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>{champ.status}</span>
                          <span>{champ.teams} Equipes</span>
                       </div>
                    </div>
                    <div className="text-right">
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
            <Link to="/" className="flex items-center justify-center gap-4 opacity-80">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">E</div>
              <span className="text-xl font-black tracking-tighter text-white uppercase italic">Empirion</span>
            </Link>
            <div className="flex flex-col gap-2">
               <p className="text-[11px] font-black uppercase tracking-[0.6em] text-orange-500 italic">
                  BUILD {APP_VERSION} GOLD • {BUILD_DATE}
               </p>
               <p className="text-[9px] font-bold uppercase tracking-[0.4em] max-w-2xl mx-auto leading-relaxed text-slate-600 italic">
                  Construindo impérios empresariais do futuro através da orquestração neural. <br/> 
                  Protocol Command Node 08 • Oracle Engine Integration
               </p>
            </div>
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
      `}</style>
    </div>
  );
};

export default LandingPage;