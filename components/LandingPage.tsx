
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, Trophy, 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, Box, Zap, Rocket, Terminal, Loader2, Award, 
  Target, BarChart3, Users, Globe, LayoutGrid, Timer, CheckCircle2
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
  const { i18n, t } = useTranslation('landing');
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['landing']);
  const [dynamicModalities, setDynamicModalities] = useState<Modality[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const db = await fetchPageContent('landing', i18n.language);
      if (db) setContent({ ...DEFAULT_PAGE_CONTENT['landing'], ...db });
      const mods = await getModalities();
      if (Array.isArray(mods)) setDynamicModalities(mods);
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
    ...(content.carousel || []),
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
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <EmpireParticles />
      
      {/* HERO PRINCIPAL COM NUVENS LARANJA (SEBRAE STYLE) */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-6 md:px-24 text-center relative z-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-[-1]">
           <motion.div 
             animate={{ x: [-100, 100], y: [-50, 50], scale: [1, 1.1, 1] }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="w-[1200px] h-[1200px] bg-orange-600/20 blur-[200px] rounded-full absolute -top-1/2 -left-1/4"
           />
           <motion.div 
             animate={{ x: [100, -100], y: [50, -50], scale: [1.1, 0.9, 1.1] }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="w-[1000px] h-[1000px] bg-orange-500/15 blur-[180px] rounded-full absolute -bottom-1/2 -right-1/4"
           />
        </div>

        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-16">
           <div className="flex flex-col items-center gap-4">
              <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono font-black text-orange-500 uppercase tracking-widest">
                 <Terminal size={10} className="inline mr-2" /> {APP_VERSION} • BUILD {BUILD_DATE}
              </div>
           </div>
           <h1 className="fluid-title font-black text-white leading-[0.85] tracking-tighter uppercase italic drop-shadow-2xl">
              Forje Seu Império <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400">Insight Estratégico IA</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-4xl mx-auto italic opacity-90">
              {content.hero?.subtitle || "A maior arena de simulações empresariais multiplayer assistida por Gemini IA."}
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-8">
              <Link to="/auth" className="cyber-button px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(249,115,22,0.4)]">
                Entre na Arena <Rocket size={20} className="inline ml-2" />
              </Link>
              <Link to="/solutions/simulators" className="px-14 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all backdrop-blur-xl">
                Explorar Ramos
              </Link>
           </div>
        </motion.div>
      </section>

      {/* CARROSSEL DINÂMICO - LOGO ABAIXO HEADER / HERO */}
      <section className="py-20 relative overflow-hidden bg-transparent z-20">
        <div className="container mx-auto px-6 mb-10">
           <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.5em] mb-2 text-center">Modalidades Ativas</h3>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 h-[70vh] rounded-[4rem] overflow-hidden shadow-2xl relative">
           <Slider {...carouselSettings}>
             {allCarouselSlides.map((slide: any) => (
               <div key={slide.id} className="relative h-[70vh] bg-transparent outline-none overflow-hidden rounded-[4rem]">
                 <div className="absolute inset-0 z-0">
                   <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/90 z-10" />
                   <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60 brightness-45 contrast-125" />
                 </div>
                 <div className="container mx-auto px-12 md:px-24 h-full flex items-center relative z-20">
                   <div className="max-w-3xl space-y-8">
                     <div className="inline-flex items-center gap-3 px-6 py-2 bg-orange-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        <Sparkles size={14} /> {slide.badge}
                     </div>
                     <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic leading-none">{slide.title}</h2>
                     <p className="text-xl text-slate-300 font-medium italic opacity-90">{slide.subtitle}</p>
                     <Link to={slide.link} className="inline-flex items-center gap-4 px-10 py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">
                       Acessar Nodo <ChevronRight size={18} />
                     </Link>
                   </div>
                 </div>
               </div>
             ))}
           </Slider>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="landing-section">
         <div className="max-w-6xl mx-auto space-y-24">
            <div className="text-center space-y-4">
               <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.5em]">Arquitetura Core Engine</span>
               <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic">Superioridade Operacional</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               <FeatureCard 
                 icon={<Zap />} 
                 title="Concorrência Real-time" 
                 desc="Infraestrutura Supabase para decisões coletivas instantâneas com latência zero." 
               />
               <FeatureCard 
                 icon={<Sparkles />} 
                 title="Oráculo Gemini 3" 
                 desc="O cérebro por trás da Gazeta e do Advisor. Raciocínio profundo aplicado ao seu Balanço." 
               />
               <FeatureCard 
                 icon={<BarChart3 />} 
                 title="Deep Analytics" 
                 desc="Dashboards ApexCharts projetados para clareza máxima em cenários complexos." 
               />
            </div>
         </div>
      </section>

      {/* RAMOS CARDS */}
      <section className="landing-section bg-white/[0.02]">
         <div className="max-w-6xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10">
               <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.5em]">Protocolos de Versatilidade</span>
                  <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Setores Suportados</h2>
               </div>
               <p className="text-slate-400 font-medium italic max-w-md">"De commodities rurais a fundos de hedge complexos, o Empirion modela qualquer mercado com precisão matemática."</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {['Industrial', 'Comercial', 'Serviços', 'Agronegócio', 'Financeiro', 'Construção'].map((r, i) => (
                 <Link key={r} to={`/branches/${r.toLowerCase()}`} className="p-10 bg-slate-900 border border-white/5 rounded-[3.5rem] hover:border-orange-500/30 transition-all group shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl">
                          {i === 0 ? <Factory /> : i === 1 ? <ShoppingCart /> : i === 2 ? <Briefcase /> : i === 3 ? <Tractor /> : i === 4 ? <DollarSign /> : <Hammer />}
                       </div>
                       <ArrowRight className="text-slate-700 group-hover:text-white transition-all" size={24} />
                    </div>
                    <h4 className="text-2xl font-black text-white uppercase italic mb-2">{r}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Explorar Módulo</p>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* PLACAR CAMPEONATOS EM ANDAMENTO */}
      <section className="landing-section">
         <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.5em]">Arena Intelligence</span>
               <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Torneios em Andamento</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {content.leaderboard?.map((item: any) => (
                 <div key={item.id} className="p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[3rem] flex justify-between items-center group hover:bg-orange-600/5 transition-all shadow-xl">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{item.status}</span>
                       </div>
                       <h4 className="text-2xl font-black text-white uppercase italic">{item.name}</h4>
                       <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase">
                          <Users size={12} /> {item.teams} Equipes
                          <Trophy size={12} /> Líder: {item.lead}
                       </div>
                    </div>
                    <Link to="/auth" className="p-4 bg-white/5 rounded-2xl text-orange-500 hover:bg-orange-600 hover:text-white transition-all shadow-xl border border-white/5">
                       <Play size={24} fill="currentColor" />
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* EMPIRE BADGES SHOWCASE */}
      <section className="landing-section bg-slate-950">
         <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.5em]">Sistema de Prestígio</span>
               <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Empire Badges</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-12">
               {content.badges?.map((badge: any) => (
                 <div key={badge.id} className="flex flex-col items-center gap-6 group">
                    <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                       <Award size={64} className={badge.color} />
                    </div>
                    <span className="text-sm font-black uppercase italic text-white tracking-widest">{badge.name}</span>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ROADMAP TIMELINE */}
      <section className="landing-section">
         <div className="max-w-6xl mx-auto space-y-24">
            <div className="text-center space-y-4">
               <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.5em]">Projeto Strategos</span>
               <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Evolução do Protocolo</h2>
            </div>
            <div className="relative">
               <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 hidden md:block" />
               <div className="space-y-20">
                  <TimelineItem year="2025" title="Oracle Core v12.8" desc="Integração profunda com Gemini 3 Pro e análise de Balanço em tempo real." side="left" active />
                  <TimelineItem year="2026" title="Global Arena Network" desc="Expansão para 128 nodos globais com torneios simultâneos de massa." side="right" active />
                  <TimelineItem year="2027" title="Self-Evolving Markets" desc="Mercados simulados que reagem dinamicamente a eventos geopolíticos reais." side="left" />
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-32 border-t border-white/5 text-center relative z-20 bg-slate-950/80 backdrop-blur-3xl">
         <div className="container mx-auto px-6 space-y-10">
            <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-2xl mb-4">E</div>
               <p className="text-slate-400 font-medium italic max-w-xl mx-auto">"Construindo impérios empresariais do futuro através da tecnologia neural e estratégia de elite."</p>
            </div>
            <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
               <p className="text-[10px] font-black uppercase tracking-[0.6em] text-orange-500 italic">
                  BUILD {APP_VERSION} GOLD • {BUILD_DATE}
               </p>
               <div className="flex gap-10">
                  <LanguageSwitcher light />
               </div>
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">© 2026 EMPIRION BI ARENA</p>
            </div>
         </div>
      </footer>

      <style>{`
        .custom-dots { bottom: 30px !important; }
        .custom-dots li button:before { color: white !important; opacity: 0.1 !important; font-size: 10px !important; }
        .custom-dots li.slick-active button:before { color: #f97316 !important; opacity: 1 !important; }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="p-12 bg-slate-900 border border-white/5 rounded-[4rem] space-y-8 hover:bg-white/[0.04] transition-all group shadow-2xl">
     <div className="w-20 h-20 bg-orange-600/10 rounded-[2rem] flex items-center justify-center text-orange-500 shadow-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
        {React.cloneElement(icon, { size: 32 })}
     </div>
     <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">{title}</h3>
     <p className="text-lg text-slate-400 font-medium italic leading-relaxed">{desc}</p>
  </div>
);

const TimelineItem = ({ year, title, desc, side, active }: any) => (
  <div className={`flex flex-col md:flex-row items-center gap-10 ${side === 'right' ? 'md:flex-row-reverse' : ''} relative`}>
     <div className="w-full md:w-1/2 space-y-4 md:text-right px-10">
        <div className={`text-4xl font-black italic ${active ? 'text-orange-600' : 'text-slate-800'}`}>{year}</div>
        <h4 className="text-2xl font-black text-white uppercase italic">{title}</h4>
        <p className="text-slate-500 font-medium italic">{desc}</p>
     </div>
     <div className={`w-6 h-6 rounded-full border-4 z-10 hidden md:block ${active ? 'bg-orange-600 border-white/20 shadow-[0_0_20px_#f97316]' : 'bg-slate-950 border-white/5'}`} />
     <div className="w-full md:w-1/2 px-10 hidden md:block" />
  </div>
);

const Play = ({ size, fill }: { size: number, fill?: string }) => <Timer size={size} fill={fill} />;

export default LandingPage;
