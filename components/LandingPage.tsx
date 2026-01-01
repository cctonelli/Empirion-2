
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, Zap, Clock, Newspaper, BarChart3, Shield, 
  Globe, Brain, Users, Map, LogIn, ChevronRight, Sparkles, 
  TrendingUp, Leaf, Star, CheckCircle2, Factory, ShoppingCart, 
  Briefcase, Tractor, DollarSign, Hammer, Target, Trophy, Info,
  Command, Box, Cpu, FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LANDING_PAGE_DATA } from '../constants';
import EmpireParticles from './EmpireParticles';
import LandingCharts from './LandingCharts';
import LanguageSwitcher from './LanguageSwitcher';

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation(['landing', 'common']);
  const { 
    menuItems, 
    features, 
    branchesOverview, 
    branchesDetailData, 
    iaFeatures, 
    community, 
    roadmap 
  } = LANDING_PAGE_DATA;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-100 relative selection:bg-blue-500 selection:text-white">
      <EmpireParticles />
      
      {/* Cinematic Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 right-0 h-20 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 z-[100] flex items-center justify-between px-8 md:px-16"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <span className="text-white font-black text-xl">E</span>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase text-white">EMPIRION</span>
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => scrollToSection(item.id)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-all hover:scale-105"
            >
              {t(`common:${item.id}`, { defaultValue: item.label })}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <LanguageSwitcher light />
          <button 
            onClick={onLogin}
            className="group flex items-center gap-3 px-8 py-3 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-2xl active:scale-95"
          >
            <LogIn size={16} /> {t('common:login')}
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="pt-48 pb-32 px-8 md:px-24 flex flex-col items-center text-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="relative z-10 space-y-12 max-w-6xl"
        >
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="inline-flex items-center gap-4 px-6 py-2 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full"
           >
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Empire Protocol v5.5 GOLD Live</span>
           </motion.div>
           
           <motion.h1 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.7 }}
             className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase italic"
           >
              {t('heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Empire</span>
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1, duration: 1 }}
             className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed"
           >
              {t('heroSubtitle')}
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.2 }}
             className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
           >
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-16 py-7 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(37,99,235,0.3)] flex items-center gap-4"
              >
                {t('cta')} <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => scrollToSection('branches')}
                className="w-full sm:w-auto px-12 py-7 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-4"
              >
                {t('secondaryCta')}
              </button>
           </motion.div>
        </motion.div>
        
        {/* The rest of the Landing Page remains similar but should use t() where text is hardcoded */}
      </section>
    </div>
  );
};

// ... icon helper functions ...

export default LandingPage;
