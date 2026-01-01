
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Correct: Import Link from react-router-dom
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Zap, Clock, Newspaper, BarChart3, Shield, 
  Globe, Brain, Users, Map, LogIn, ChevronRight, Sparkles, 
  TrendingUp, Leaf, Star, CheckCircle2, Factory, ShoppingCart, 
  Briefcase, Tractor, DollarSign, Hammer, Target, Trophy, Info,
  Command, Box, Cpu, FileCheck, ArrowLeft, Play, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANDING_PAGE_DATA, CAROUSEL_ITEMS, MOCK_ONGOING_CHAMPIONSHIPS, EMPIRE_BADGES_MOCK } from '../constants';
import EmpireParticles from './EmpireParticles';
import LandingCharts from './LandingCharts';
import LanguageSwitcher from './LanguageSwitcher';

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation(['landing', 'common', 'branches']);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const { menuItems, features, branchesOverview } = LANDING_PAGE_DATA;

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-100 relative selection:bg-orange-500 selection:text-white">
      <EmpireParticles />
      
      {/* 1. Dynamic Command Carousel (Below Header) */}
      <section className="pt-24 h-[600px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={carouselIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent z-10" />
            <img 
              src={CAROUSEL_ITEMS[carouselIdx].image} 
              alt="slide" 
              className="w-full h-full object-cover opacity-60"
            />
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-8 md:px-16 h-full flex items-center relative z-20">
          <div className="max-w-3xl space-y-8">
            <motion.div 
              key={`badge-${carouselIdx}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(249,115,22,0.3)]"
            >
              <Sparkles size={14} /> {CAROUSEL_ITEMS[carouselIdx].badge}
            </motion.div>
            
            <motion.div
              key={`content-${carouselIdx}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter italic">
                {CAROUSEL_ITEMS[carouselIdx].title}
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-2xl">
                {CAROUSEL_ITEMS[carouselIdx].subtitle}
              </p>
            </motion.div>

            <motion.div
              key={`actions-${carouselIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-6"
            >
              <button className="px-12 py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center gap-3 group">
                Ver Mais <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex gap-2">
                {CAROUSEL_ITEMS.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCarouselIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${carouselIdx === i ? 'w-10 bg-orange-500' : 'w-3 bg-white/20 hover:bg-white/40'}`} 
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Placar de Campeonatos em Andamento */}
      <section className="py-24 bg-slate-950/50 backdrop-blur-3xl border-y border-white/5">
        <div className="container mx-auto px-8 md:px-16 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic">Live Intelligence</h2>
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter">Arena Leaderboards</h3>
            </div>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
              <ExternalLink size={16} /> Ver Todos Campeonatos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_ONGOING_CHAMPIONSHIPS.map((champ, i) => (
              <motion.div 
                key={champ.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/5 p-8 rounded-[3rem] space-y-6 hover:bg-white/10 transition-all cursor-default group"
              >
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                  </div>
                  <Trophy size={18} className="text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{champ.name}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{champ.branch}</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Rodada</span>
                    <span className="text-white">{champ.round}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Equipes</span>
                    <span className="text-white">{champ.teams}</span>
                  </div>
                  <div className="pt-2">
                    <span className="block text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Top Performer</span>
                    <span className="text-xs font-bold text-slate-300">{champ.leader}</span>
                  </div>
                </div>
                <button className="w-full py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Observar Arena
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Hero / Main CTA Integration */}
      <section id="home" className="py-32 px-8 md:px-24 flex flex-col items-center text-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative z-10 space-y-12 max-w-6xl"
        >
           <motion.h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
              {t('hero.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-500">{t('hero.empire')}</span>
           </motion.h1 >
           <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed italic">
              "A fusão definitiva entre o prestígio acadêmico da simulação clássica e o poder cognitivo da IA Gemini."
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-16 py-7 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(37,99,235,0.3)] flex items-center gap-4"
              >
                {t('hero.cta')} <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => scrollToSection('branches')}
                className="w-full sm:w-auto px-12 py-7 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-4"
              >
                Explorar Ramos
              </button>
           </div>
        </motion.div>
      </section>

      {/* 4. Branches Grid */}
      <section id="branches" className="py-32 px-8 md:px-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto space-y-24">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 text-center md:text-left">
              <div className="space-y-4">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Supported Sectors</h2>
                 <h3 className="text-6xl font-black text-white uppercase tracking-tighter">Choose Your Field</h3>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {branchesOverview.map((b) => (
                <motion.div 
                  key={b.id} 
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group bg-white/5 backdrop-blur-xl p-12 rounded-[4rem] border border-white/5 shadow-2xl cursor-pointer relative overflow-hidden transition-all hover:border-orange-500/30"
                >
                   <div className={`w-20 h-20 ${b.bg} ${b.color} rounded-3xl flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      {getBranchIcon(b.icon)}
                   </div>
                   <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-4">{t(`branches:${b.slug}.name`)}</h4>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">{t(`branches:${b.slug}.description`)}</p>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 group-hover:text-orange-500 transition-colors">
                      Explorar Módulo <ChevronRight size={16} />
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. Empire Points (Gamification Showcase) */}
      <section className="py-40 bg-[#020617] relative">
        <div className="container mx-auto px-8 md:px-16 relative z-10">
          <div className="max-w-3xl space-y-8 mb-24">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic">Empire Loyalty Program</h2>
             <h3 className="text-6xl font-black text-white uppercase tracking-tighter">Your Reputation, Quantified.</h3>
             <p className="text-xl text-slate-400 font-medium">Acumule pontos em cada arena e desbloqueie privilégios exclusivos de governança e personalização.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             {EMPIRE_BADGES_MOCK.map((badge, i) => (
               <div key={badge.id} className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3.5rem] border border-white/5 flex flex-col items-center text-center space-y-6 group hover:border-orange-500/50 transition-all">
                  <div className="w-24 h-24 bg-orange-500 text-white rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.2)] group-hover:rotate-12 transition-transform">
                     {getBranchIcon(badge.icon)}
                  </div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight italic">{badge.name}</h4>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed px-4">{badge.desc}</p>
                  <div className="px-6 py-2 bg-white/5 rounded-full text-orange-500 font-black text-[10px] uppercase tracking-widest border border-orange-500/20">
                     +{badge.points} XP Empire
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 pt-32 pb-16 px-8 border-t border-white/5">
        <div className="container mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
              <div className="col-span-2 space-y-8">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                     <span className="text-white font-black text-xl italic">E</span>
                   </div>
                   <span className="text-2xl font-black tracking-tighter uppercase text-white italic">EMPIRION</span>
                 </div>
                 <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">
                   A arquitetura definitiva de simulação empresarial. Onde o prestígio acadêmico encontra a inovação neural.
                 </p>
              </div>
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Navigation</h5>
                 <div className="flex flex-col gap-4">
                    {/* Fixed: Re-added missing Link components from react-router-dom */}
                    <Link to="/" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Home</Link>
                    <Link to="/rewards" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Loyalty Program</Link>
                    <Link to="/solutions/business-plan" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">BP Quiz IA</Link>
                 </div>
              </div>
           </div>
           <div className="text-center pt-16 border-t border-white/5">
              <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.8em] italic">
                 © 2026 EMPIRION BI ARENA | SIAGRO-SISERV-SIMCO FIDELITY
              </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

const getBranchIcon = (name: string) => {
  switch(name) {
    case 'Factory': return <Factory size={32} />;
    case 'ShoppingCart': return <ShoppingCart size={32} />;
    case 'Briefcase': return <Briefcase size={32} />;
    case 'Tractor': return <Tractor size={32} />;
    case 'DollarSign': return <DollarSign size={32} />;
    case 'Hammer': return <Hammer size={32} />;
    case 'Leaf': return <Leaf size={32} />;
    case 'Zap': return <Zap size={32} />;
    default: return <Box size={32} />;
  }
};

export default LandingPage;
