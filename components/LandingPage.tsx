import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, Trophy, 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, Box, Zap, Rocket, Terminal, Loader2, Award, 
  Target, BarChart3, Users, Globe, LayoutGrid, Timer, CheckCircle2, Play
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
    <button onClick={onClick} className="absolute right-10 top-1/2 -translate-y-1/2 z-[100] p-6 bg-slate-900/40 backdrop-blur-2xl hover:bg-orange-600 hover:text-white border border-white/10 rounded-full text-white transition-all shadow-2xl active:scale-90 group">
      <ChevronRight size={32} className="group-hover:scale-125 transition-transform" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} className="absolute left-10 top-1/2 -translate-y-1/2 z-[100] p-6 bg-slate-900/40 backdrop-blur-2xl hover:bg-orange-600 hover:text-white border border-white/10 rounded-full text-white transition-all shadow-2xl active:scale-90 group">
      <ChevronLeft size={32} className="group-hover:scale-125 transition-transform" />
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
    speed: 1500,
    autoplay: true,
    autoplaySpeed: 7000,
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
      badge: 'Arena Live Sincronizada',
      link: `/activities/${m.slug}`
    }))
  ];

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <EmpireParticles />
      
      {/* HERO PRINCIPAL - SEBRAE INSPIRED ORANGE CLOUDS */}
      <section className="min-h-screen flex items-center justify-center pt-24 px-8 md:px-24 text-center relative z-20 overflow-hidden">
        {/* ORANGE CLOUDS LAYER */}
        <div className="absolute inset-0 pointer-events-none z-[-1]">
           <motion.div 
             animate={{ x: [-200, 200], y: [-100, 100], scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
             transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
             className="w-[1400px] h-[1400px] bg-orange-600/20 blur-[250px] rounded-full absolute -top-[40%] -left-[20%]"
           />
           <motion.div 
             animate={{ x: [200, -200], y: [100, -100], scale: [1.2, 0.8, 1.2], rotate: [0, -15, 0] }}
             transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
             className="w-[1200px] h-[1200px] bg-orange-500/15 blur-[220px] rounded-full absolute -bottom-[40%] -right-[20%]"
           />
        </div>

        <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-16">
           <div className="flex flex-col items-center gap-6">
              <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.5em] backdrop-blur-xl shadow-2xl">
                 <Terminal size={14} className="inline mr-3 animate-pulse" /> {APP_VERSION} • CORE STABLE
              </div>
           </div>
           <h1 className="fluid-title font-black text-white leading-[0.8] tracking-tighter uppercase italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              Forje Seu Império <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400">Insight Estratégico IA</span>
           </h1>
           <p className="text-2xl md:text-4xl text-slate-300 font-medium max-w-5xl mx-auto italic opacity-90 leading-relaxed">
              {content.hero?.subtitle || "A maior arena de simulações empresariais multiplayer assistida por Gemini IA."}
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-10">
              <Link to="/auth" className="cyber-button px-24 py-10 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_30px_70px_rgba(249,115,22,0.5)] hover:scale-105 hover:bg-white hover:text-orange-950 transition-all active:scale-95">
                Entre na Arena <Rocket size={24} className="inline ml-3" />
              </Link>
              <Link to="/test/industrial" className="px-16 py-10 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-orange-600/20 hover:border-orange-500/50 transition-all backdrop-blur-3xl shadow-xl flex items-center gap-3 group">
                <Sparkles size={20} className="text-orange-500 group-hover:rotate-12 transition-transform" /> {content.hero?.secondaryCta || "Trial Master Sandbox"}
              </Link>
           </div>
        </motion.div>
      </section>

      {/* CARROSSEL DINÂMICO - SEÇÃO IMUTÁVEL UAU */}
      <section className="py-32 relative overflow-hidden bg-transparent z-20">
        <div className="container mx-auto px-8 mb-16 text-center space-y-4">
           <h3 className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] mb-2 italic">Protocolos Ativos v13.2</h3>
           <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic">Nodos de Simulação</h2>
        </div>
        <div className="max-w-[1700px] mx-auto px-8 h-[75vh] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.7)] relative border border-white/5 group">
           <Slider {...carouselSettings}>
             {allCarouselSlides.map((slide: any) => (
               <div key={slide.id} className="relative h-[75vh] bg-[#020617] outline-none overflow-hidden rounded-[5rem]">
                 <div className="absolute inset-0 z-0">
                   <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-transparent to-[#020617]/95 z-10" />
                   <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 via-transparent to-transparent z-10" />
                   <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-70 brightness-50 contrast-125 scale-105 group-hover:scale-100 transition-transform duration-[10000ms] ease-out" />
                 </div>
                 <div className="container mx-auto px-16 md:px-32 h-full flex items-center relative z-20">
                   <div className="max-w-4xl space-y-10">
                     <div className="inline-flex items-center gap-4 px-8 py-3 bg-orange-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl border border-white/20">
                        <Sparkles size={18} /> {slide.badge}
                     </div>
                     <h2 className="text-6xl md:text-9xl font-black text-white uppercase italic leading-[0.85] tracking-tighter drop-shadow-2xl">{slide.title}</h2>
                     <p className="text-2xl md:text-3xl text-slate-300 font-medium italic opacity-90 leading-relaxed max-w-2xl">{slide.subtitle}</p>
                     <Link to={slide.link} className="inline-flex items-center gap-6 px-14 py-7 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95 group/btn">
                       Sincronizar Nodo <ChevronRight size={22} className="group-hover/btn:translate-x-2 transition-transform" />
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
         <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] italic">Arquitetura Core Engine v6.0</span>
               <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">Superioridade Operacional</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               <FeatureCard 
                 icon={<Zap />} 
                 title="Concorrência Real-time" 
                 desc="Infraestrutura Supabase para decisões coletivas instantâneas com latência sub-10ms." 
               />
               <FeatureCard 
                 icon={<Sparkles />} 
                 title="Oráculo Gemini 3" 
                 desc="Raciocínio profundo aplicado ao seu Balanço Patrimonial e DRE para insights preditivos." 
               />
               <FeatureCard 
                 icon={<BarChart3 />} 
                 title="Deep Analytics" 
                 desc="Dashboards ApexCharts de alta densidade projetados para clareza em mercados complexos." 
               />
            </div>
         </div>
      </section>

      {/* RAMOS CARDS */}
      <section className="landing-section bg-white/[0.01] border-y border-white/5">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
               <div className="space-y-6">
                  <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] italic">Protocolos de Versatilidade</span>
                  <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Ecossistema Suportado</h2>
               </div>
               <p className="text-2xl text-slate-400 font-medium italic max-w-xl leading-relaxed lg:text-right">"De commodities rurais a fundos de hedge, o Empirion modela qualquer mercado com precisão matemática v13.2."</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
               {[
                 { label: 'Industrial', icon: <Factory />, slug: 'industrial', desc: 'CapEx & Produção' },
                 { label: 'Comercial', icon: <ShoppingCart />, slug: 'commercial', desc: 'Varejo Híbrido' },
                 { label: 'Serviços', icon: <Briefcase />, slug: 'services', desc: 'Capital Intelectual' },
                 { label: 'Agronegócio', icon: <Tractor />, slug: 'agribusiness', desc: 'Ativos Biológicos' },
                 { label: 'Financeiro', icon: <DollarSign />, slug: 'finance', desc: 'Spread & Risco' },
                 { label: 'Construção', icon: <Hammer />, slug: 'construction', desc: 'Obras Pesadas' }
               ].map((r, i) => (
                 <Link key={r.label} to={`/branches/${r.slug}`} className="p-12 bg-slate-900 border border-white/5 rounded-[4rem] hover:border-orange-500/40 transition-all group shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-125 transition-transform rotate-12">{r.icon}</div>
                    <div className="flex justify-between items-start mb-10 relative z-10">
                       <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl border border-white/5">
                          {React.cloneElement(r.icon as React.ReactElement<any>, { size: 32 })}
                       </div>
                       <ArrowRight className="text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" size={28} />
                    </div>
                    <div className="relative z-10">
                       <h4 className="text-3xl font-black text-white uppercase italic mb-3">{r.label}</h4>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{r.desc}</p>
                    </div>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* PLACAR CAMPEONATOS EM ANDAMENTO */}
      <section className="landing-section">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] italic">Live Arena Intelligence</span>
               <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Torneios Ativos</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {content.leaderboard?.map((item: any) => (
                 <div key={item.id} className="p-12 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] flex flex-col sm:flex-row justify-between items-center gap-10 group hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-1 h-20 bg-orange-600/50 -translate-y-1/2" />
                    <div className="space-y-6 flex-1">
                       <div className="flex items-center gap-4">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]" />
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">{item.status}</span>
                       </div>
                       <h4 className="text-3xl md:text-4xl font-black text-white uppercase italic leading-none tracking-tight">{item.name}</h4>
                       <div className="flex flex-wrap items-center gap-8 text-slate-500 text-[11px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-2"><Users size={14} className="text-blue-500" /> {item.teams} Equipes</div>
                          <div className="flex items-center gap-2"><Trophy size={14} className="text-amber-500" /> Líder: {item.lead}</div>
                       </div>
                    </div>
                    <Link to="/auth" className="w-full sm:w-auto px-10 py-6 bg-white/5 border border-white/10 rounded-3xl text-orange-500 hover:bg-orange-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-4 group/play active:scale-95">
                       <Play size={28} className="group-hover/play:scale-110 transition-transform" />
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* EMPIRE BADGES SHOWCASE */}
      <section className="landing-section bg-slate-950/80">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] italic">Sistema de Prestígio Elite</span>
               <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Empire Badges</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-16 md:gap-24">
               {content.badges?.map((badge: any, i: number) => (
                 <motion.div 
                   key={badge.id} 
                   initial={{ opacity: 0, scale: 0.8 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex flex-col items-center gap-8 group"
                 >
                    <div className="w-40 h-40 bg-white/5 rounded-[3.5rem] border border-white/10 flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:rotate-12 group-hover:border-orange-500/50 transition-all relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       <Award size={80} className={`${badge.color} group-hover:scale-110 transition-transform relative z-10`} />
                    </div>
                    <div className="text-center space-y-1">
                       <span className="text-lg font-black uppercase italic text-white tracking-widest">{badge.name}</span>
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Protocolo {badge.id.toUpperCase()}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ROADMAP TIMELINE */}
      <section className="landing-section">
         <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] italic">Projeto Strategos Roadmap</span>
               <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Evolução do Protocolo</h2>
            </div>
            <div className="relative">
               <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 hidden md:block" />
               <div className="space-y-32">
                  <TimelineItem year="2025" title="Oracle Core v12.8 Gold" desc="Integração profunda com Gemini 3 Pro Reasoning e análise de Balanço Real-time." side="left" active />
                  <TimelineItem year="2026" title="Global Arena Network" desc="Expansão para 256 nodos globais com torneios simultâneos de massa e rankings TSR." side="right" active />
                  <TimelineItem year="2027" title="Self-Evolving Markets" desc="Ecossistemas simulados que reagem dinamicamente a feeds de notícias geopolíticas reais via Grounding." side="left" />
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-40 border-t border-white/5 text-center relative z-20 bg-[#020617] backdrop-blur-3xl overflow-hidden">
         <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />
         <div className="container mx-auto px-8 space-y-16 relative z-10">
            <div className="flex flex-col items-center gap-8">
               <div className="w-24 h-24 bg-orange-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl italic shadow-[0_20px_50px_rgba(249,115,22,0.4)] border border-white/20 mb-6">E</div>
               <p className="text-2xl md:text-3xl text-slate-400 font-medium italic max-w-3xl mx-auto leading-relaxed">
                 "Construindo impérios empresariais do futuro através da tecnologia neural e estratégia de elite v13.2."
               </p>
            </div>
            <div className="pt-20 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-12 opacity-60">
               <div className="flex flex-col items-center lg:items-start gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.8em] text-orange-500 italic leading-none">
                     BUILD {APP_VERSION} GOLD
                  </p>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{BUILD_DATE} • NODE-08-STREET</span>
               </div>
               <div className="flex gap-12 scale-110">
                  <LanguageSwitcher light />
               </div>
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] italic">© 2026 EMPIRION BI ARENA | FIDELIDADE SIAGRO-SISERV-SIMCO</p>
            </div>
         </div>
      </footer>

      <style>{`
        .custom-dots { bottom: 40px !important; }
        .custom-dots li button:before { color: white !important; opacity: 0.15 !important; font-size: 12px !important; }
        .custom-dots li.slick-active button:before { color: #f97316 !important; opacity: 1 !important; }
        .fluid-title { font-size: clamp(4rem, 12vw, 10rem); }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="p-16 bg-slate-900/60 border border-white/5 rounded-[5rem] space-y-10 hover:bg-slate-900 transition-all group shadow-2xl relative overflow-hidden border-b-4 hover:border-b-orange-600">
     <div className="absolute top-0 right-0 p-10 opacity-[0.02] rotate-12 group-hover:scale-125 transition-transform">{icon}</div>
     <div className="w-24 h-24 bg-orange-600/10 rounded-[2.5rem] flex items-center justify-center text-orange-500 shadow-xl group-hover:bg-orange-600 group-hover:text-white transition-all border border-orange-500/10">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 40 })}
     </div>
     <div className="space-y-4">
        <h3 className="text-4xl font-black text-white uppercase italic tracking-tight leading-none">{title}</h3>
        <p className="text-xl text-slate-400 font-medium italic leading-relaxed opacity-80">{desc}</p>
     </div>
  </div>
);

const TimelineItem = ({ year, title, desc, side, active }: any) => (
  <div className={`flex flex-col md:flex-row items-center gap-16 ${side === 'right' ? 'md:flex-row-reverse' : ''} relative group`}>
     <div className={`w-full md:w-1/2 space-y-6 ${side === 'right' ? 'md:text-left' : 'md:text-right'} px-10`}>
        <div className={`text-6xl font-black italic transition-colors ${active ? 'text-orange-600' : 'text-slate-800 group-hover:text-slate-600'}`}>{year}</div>
        <h4 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">{title}</h4>
        <p className="text-xl text-slate-500 font-medium italic leading-relaxed">{desc}</p>
     </div>
     <div className={`w-8 h-8 rounded-full border-8 z-10 hidden md:block transition-all duration-500 ${active ? 'bg-orange-600 border-white/20 shadow-[0_0_30px_#f97316] scale-125' : 'bg-slate-950 border-white/5'}`} />
     <div className="w-full md:w-1/2 px-10 hidden md:block" />
  </div>
);

export default LandingPage;