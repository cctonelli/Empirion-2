
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM as any;
import { 
  ArrowRight, ChevronLeft, ChevronRight, Factory, BrainCircuit, Globe,
  Rocket, Terminal, ShoppingCart, Briefcase, Tractor, DollarSign, Hammer,
  Trophy, Award, Calendar, CheckCircle2, Zap, TrendingUp, ShieldCheck,
  Star, Target, Cpu, Activity, BarChart3, Users, Clock, Loader2
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import Slider from 'react-slick';
import { DEFAULT_PAGE_CONTENT, APP_VERSION } from '../constants';
import { fetchPageContent, getModalities, subscribeToModalities, getGlobalLeaderboard } from '../services/supabase';
import { Modality } from '../types';
import EmpireParticles from './EmpireParticles';
import LanguageSwitcher from './LanguageSwitcher';

const NextArrow = (props: any) => (
  <button 
    onClick={props.onClick} 
    className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-50 p-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-orange-600 hover:scale-110 transition-all active:scale-90"
    aria-label="Next"
  >
    <ChevronRight size={32} />
  </button>
);

const PrevArrow = (props: any) => (
  <button 
    onClick={props.onClick} 
    className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-50 p-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-orange-600 hover:scale-110 transition-all active:scale-90"
    aria-label="Previous"
  >
    <ChevronLeft size={32} />
  </button>
);

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t, i18n } = useTranslation(['landing', 'common']);
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['landing']);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Prioridade: Conteúdo Editável via CMS (Hero etc)
      const db = await fetchPageContent('landing', i18n.language);
      if (db) setContent({ ...DEFAULT_PAGE_CONTENT['landing'], ...db });
      
      const boards = await getGlobalLeaderboard();
      setLeaderboards(boards);
      setLoadingBoards(false);
    };
    loadData();
  }, [i18n.language]);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative overflow-x-hidden select-none">
      <EmpireParticles />
      
      <div className="fixed inset-0 pointer-events-none z-0">
         <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 25, repeat: Infinity }} className="absolute -top-[20%] -left-[10%] w-[1000px] h-[1000px] bg-orange-600/30 blur-[250px] rounded-full" />
      </div>

      <section className="min-h-screen flex flex-col items-center justify-center pt-24 px-8 relative z-20 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-12">
           <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.6em] backdrop-blur-xl">
              <Terminal size={14} /> {APP_VERSION} CORE SYNCED
           </div>
           
           <h1 className="text-[55px] md:text-[90px] lg:text-[120px] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
              {content?.hero?.title || t('hero.title')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400"> {content?.hero?.subtitle || t('hero.subtitle')} </span>
           </h1>

           <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-4xl mx-auto italic opacity-90 leading-relaxed">
              {t('hero.subtitle_long', 'A arena definitiva onde IA e estratégia humana colidem.')}
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
              <Link to="/auth" className="px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-2xl hover:scale-110 hover:bg-white hover:text-orange-950 transition-all flex items-center gap-5 group">
                {t('hero.cta')} <Rocket size={24} className="group-hover:translate-x-2 transition-transform" />
              </Link>
           </div>
        </motion.div>
      </section>

      <section className="landing-section bg-slate-950/40">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.8em] italic">Simulation Matrix</span>
               <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">{t('common:branches').toUpperCase()}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
               {[
                 { label: t('branches:industrial.name'), icon: <Factory />, slug: 'industrial', desc: 'CapEx Oracle' },
                 { label: t('branches:commercial.name'), icon: <ShoppingCart />, slug: 'commercial', desc: 'Varejo Elite' },
                 { label: t('branches:services.name'), icon: <Briefcase />, slug: 'services', desc: 'Capital Matrix' },
               ].map((r, i) => (
                 <Link key={r.slug} to={`/branches/${r.slug}`} className="p-12 bg-slate-900 border border-white/5 rounded-[4rem] hover:border-orange-500/40 transition-all group shadow-2xl">
                    <div className="flex justify-between items-start mb-12">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl">
                          {r.icon}
                       </div>
                    </div>
                    <h4 className="text-3xl font-black text-white uppercase italic mb-2">{r.label}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{r.desc}</p>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      <section className="landing-section bg-[#020617]">
         <div className="max-w-7xl mx-auto space-y-24">
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">{t('community.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {leaderboards.map(board => (
                  <LeaderboardCard key={board.id} name={board.name} branch={board.branch} cycle={`${board.round}/${board.total}`} teams={board.topTeams} />
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

const LeaderboardCard = ({ name, branch, cycle, teams }: any) => (
  <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8">
     <h3 className="text-2xl font-black text-white uppercase italic">{name}</h3>
     <div className="space-y-4">
        {teams.map((t: any) => (
           <div key={t.pos} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl">
              <span className="text-sm font-black text-white uppercase">{t.name}</span>
              <span className="text-lg font-mono font-black text-emerald-500">{t.tsr.toFixed(1)}%</span>
           </div>
        ))}
     </div>
  </div>
);

export default LandingPage;
