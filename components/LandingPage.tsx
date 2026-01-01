
import React from 'react';
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

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { 
    hero, 
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
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogin}
          className="group flex items-center gap-3 px-8 py-3 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-2xl active:scale-95"
        >
          <LogIn size={16} /> Dashboard Login
        </button>
      </motion.header>

      {/* Hero Section: MasterClass Style */}
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
              Forge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Empire</span>
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1, duration: 1 }}
             className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed"
           >
              {hero.subtitle}
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
                {hero.cta} <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => scrollToSection('branches')}
                className="w-full sm:w-auto px-12 py-7 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-4"
              >
                {hero.secondaryCta}
              </button>
           </motion.div>
        </motion.div>

        {/* Real-time Demo Chart Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 w-full max-w-5xl aspect-video bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden"
        >
           <div className="absolute top-0 left-0 right-0 h-16 bg-white/5 flex items-center justify-between px-10">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Live Simulation Node 08: Global Industrial Arena</span>
              </div>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-500/20"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500/20"></div>
              </div>
           </div>
           <div className="h-full pt-16">
              <LandingCharts />
           </div>
        </motion.div>
      </section>

      {/* Feature Grid: Linear.app Style */}
      <section id="features" className="py-32 px-8 md:px-24">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="space-y-4 text-center md:text-left">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Core Engine Architecture</h2>
             <h3 className="text-5xl font-black text-white uppercase tracking-tighter">Superioridade Operacional</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1px bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden">
            {features.map((f, i) => (
              <motion.div 
                key={f.id} 
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                className="p-12 space-y-8 bg-slate-950/20"
              >
                 <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-600/20">
                    {getIcon(f.icon)}
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{f.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.description}</p>
                 </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Branch Navigator */}
      <section id="branches" className="py-32 px-8 md:px-24 bg-white/[0.02] backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto space-y-24">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="space-y-4">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Versatility Protocols</h2>
                 <h3 className="text-6xl font-black text-white uppercase tracking-tighter">Setores Suportados</h3>
              </div>
              <p className="text-slate-400 font-medium max-w-md text-lg leading-relaxed italic">"De commodities rurais a fundos de hedge complexos, o Empirion modela qualquer mercado com precisão matemática."</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {branchesOverview.map((b) => (
                <motion.div 
                  key={b.id} 
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => scrollToSection(`detail-${b.slug}`)}
                  className="group bg-white/5 backdrop-blur-xl p-12 rounded-[4rem] border border-white/5 shadow-2xl cursor-pointer relative overflow-hidden transition-all hover:border-white/20"
                >
                   <div className={`w-20 h-20 ${b.bg} ${b.color} rounded-3xl flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      {getBranchIcon(b.icon)}
                   </div>
                   <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-4">{b.name}</h4>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">{b.description}</p>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 group-hover:text-white transition-colors">
                      {b.cta} <ChevronRight size={16} />
                   </div>
                   
                   {/* Background Glow */}
                   <div className={`absolute -bottom-20 -right-20 w-40 h-40 ${b.bg} blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity`}></div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Detailed Module Views */}
      <div className="space-y-1px bg-white/5">
        {Object.entries(branchesDetailData).map(([slug, data]) => (
          <section key={slug} id={`detail-${slug}`} className="py-40 px-8 md:px-32 bg-slate-950/80 backdrop-blur-md relative scroll-mt-20 overflow-hidden border-b border-white/5">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-16"
              >
                <div className="space-y-6">
                  <span className={`px-5 py-2 rounded-full ${getBranchColor(slug)} bg-opacity-10 text-[10px] font-black uppercase tracking-[0.3em] border border-white/5 inline-block`}>
                    Module {slug.toUpperCase()}
                  </span>
                  <h3 className="text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                    {data.title}
                  </h3>
                  <p className="text-2xl text-slate-400 font-medium italic opacity-60">
                    {data.subtitle}
                  </p>
                </div>

                <p className="text-xl text-slate-400 leading-relaxed font-medium">
                  {data.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
                   <div className="space-y-6">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Core Architecture</h5>
                      <ul className="space-y-4">
                         {data.features.map((f, idx) => (
                           <li key={idx} className="text-sm font-bold text-slate-200 leading-snug flex items-start gap-4">
                             <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                             {f}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="space-y-8">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">KPI Registry</h5>
                        <div className="flex flex-wrap gap-2">
                          {data.kpis.map((k, idx) => (
                            <span key={idx} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-tight text-white shadow-xl">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-8 border-t border-white/5">
                         <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-3">Template Reference</h5>
                         <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase">{data.templateExample}</p>
                      </div>
                   </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                 <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full"></div>
                 <div className="bg-white/5 backdrop-blur-3xl p-16 rounded-[5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden flex flex-col items-center justify-center space-y-10 group">
                    <div className="p-12 rounded-[3.5rem] bg-white/5 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                       {getBranchIconLarge(slug)}
                    </div>
                    <button 
                      onClick={onLogin}
                      className="px-14 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                      Lançar Instância {slug}
                    </button>
                    
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                       <Command size={180} />
                    </div>
                 </div>
              </motion.div>
            </div>
          </section>
        ))}
      </div>

      {/* Strategos IA: Dark Highlight */}
      <section id="ia" className="py-40 px-8 md:px-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
           <div className="space-y-16">
              <div className="space-y-6">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 italic">Project Strategos</h2>
                 <h3 className="text-7xl font-black uppercase tracking-tighter leading-none text-white italic">Neural Core <br/> Intelligence</h3>
                 <p className="text-slate-400 text-xl font-medium leading-relaxed">{iaFeatures.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {iaFeatures.items.map((item, i) => (
                  <div key={i} className="space-y-3 group">
                     <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full group-hover:scale-y-125 transition-transform"></div>
                        <h5 className="font-black uppercase tracking-widest text-sm text-white">{item.title}</h5>
                     </div>
                     <p className="text-slate-500 text-xs font-bold leading-relaxed ml-6">{item.desc}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/5 p-16 rounded-[5rem] space-y-10 shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              <Brain className="absolute -top-20 -right-20 text-blue-500/10 pointer-events-none group-hover:rotate-12 transition-transform duration-1000" size={300} />
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-blue-600 rounded-3xl shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                    <Zap size={32} className="text-white" />
                 </div>
                 <span className="font-black uppercase tracking-[0.3em] text-[12px] text-blue-400 italic">Deep Reasoning Active</span>
              </div>
              <div className="space-y-8 relative z-10">
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                    ></motion.div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[11px] font-mono text-blue-300/60 leading-relaxed uppercase">
                       &gt; analyzing_market_entropy... [OK]<br/>
                       &gt; calculating_p12_projections... [OK]<br/>
                       &gt; status: strategic_dominance_assured
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Community: The Pulse */}
      <section id="community" className="py-40 px-8 md:px-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-24">
           <div className="text-center space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Network Pulse</h2>
              <h3 className="text-6xl font-black text-white uppercase tracking-tighter">{community.title}</h3>
              <p className="text-slate-500 font-medium text-xl max-w-2xl mx-auto leading-relaxed italic opacity-60">
                "{community.description}"
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden">
              {community.stats.map((s, i) => (
                <div key={i} className="text-center p-20 bg-slate-950/40 hover:bg-white/[0.02] transition-colors">
                   <span className="text-7xl font-black text-white tracking-tighter mb-4 block italic">{s.val}</span>
                   <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">{s.label}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Roadmap: Horizontal Cinematic Flow */}
      <section id="roadmap" className="py-40 px-8 md:px-24 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-32">
           <div className="flex items-center gap-8">
              <div className="p-4 bg-white/5 rounded-3xl"><Map size={40} className="text-blue-400" /></div>
              <h3 className="text-6xl font-black text-white uppercase tracking-tighter italic">Protocol <br/> Evolution</h3>
           </div>

           <div className="relative space-y-24">
              <div className="absolute top-0 left-8 md:left-1/2 bottom-0 w-px bg-white/5 -translate-x-1/2 hidden md:block"></div>
              
              {roadmap.map((r, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-12 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                   <div className="md:w-1/2 space-y-4 px-12 text-right md:text-inherit">
                      <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">{r.version}</div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{r.item}</h4>
                   </div>
                   <div className="absolute left-8 md:left-1/2 w-5 h-5 bg-blue-600 rounded-full border-8 border-slate-950 -translate-x-1/2 z-10 shadow-[0_0_30px_rgba(37,99,235,0.8)]"></div>
                   <div className="md:w-1/2"></div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Ultra Premium Footer */}
      <footer className="bg-slate-950 pt-32 pb-16 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
              <div className="col-span-2 space-y-8">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                     <span className="text-white font-black text-xl">E</span>
                   </div>
                   <span className="text-2xl font-black tracking-tighter uppercase text-white">EMPIRION</span>
                 </div>
                 <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">
                   A mais avançada arquitetura de simulação empresarial. 
                   Onde a economia real encontra o processamento neural.
                 </p>
                 <div className="flex gap-6">
                    <div className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer transition-colors"><Globe size={20} className="text-slate-400"/></div>
                    <div className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer transition-colors"><Users size={20} className="text-slate-400"/></div>
                    <div className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer transition-colors"><Cpu size={20} className="text-slate-400"/></div>
                 </div>
              </div>
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Navigation</h5>
                 <div className="flex flex-col gap-4">
                    {menuItems.map(item => <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors text-left">{item.label}</button>)}
                 </div>
              </div>
              <div className="space-y-6">
                 <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Legals</h5>
                 <div className="flex flex-col gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer transition-colors">Privacy Cloud</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer transition-colors">Terms & Service</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer transition-colors">Security Audit</span>
                 </div>
              </div>
           </div>
           <div className="text-center pt-16 border-t border-white/5">
              <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.8em] italic">
                 © 2025 EMPIRION BI ARENA | SIAGRO-SISERV-SIMCO FIDELITY
              </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

const getIcon = (name: string) => {
  switch(name) {
    case 'Clock': return <Clock size={28} />;
    case 'Newspaper': return <Newspaper size={28} />;
    case 'BarChart3': return <BarChart3 size={28} />;
    case 'Shield': return <Shield size={28} />;
    case 'FileText': return <FileCheck size={28} />;
    default: return <Zap size={28} />;
  }
};

const getBranchIcon = (name: string) => {
  switch(name) {
    case 'Factory': return <Factory size={32} />;
    case 'ShoppingCart': return <ShoppingCart size={32} />;
    case 'Briefcase': return <Briefcase size={32} />;
    case 'Tractor': return <Tractor size={32} />;
    case 'DollarSign': return <DollarSign size={32} />;
    case 'Hammer': return <Hammer size={32} />;
    default: return <Box size={32} />;
  }
};

const getBranchIconLarge = (slug: string) => {
  const size = 72;
  switch(slug) {
    case 'industrial': return <Factory size={size} className="text-blue-400" />;
    case 'commercial': return <ShoppingCart size={size} className="text-emerald-400" />;
    case 'services': return <Briefcase size={size} className="text-indigo-400" />;
    case 'agribusiness': return <Tractor size={size} className="text-amber-400" />;
    case 'finance': return <DollarSign size={size} className="text-rose-400" />;
    case 'construction': return <Hammer size={size} className="text-orange-400" />;
    default: return <Target size={size} className="text-slate-400" />;
  }
};

const getBranchColor = (slug: string) => {
  switch(slug) {
    case 'industrial': return 'text-blue-400';
    case 'commercial': return 'text-emerald-400';
    case 'services': return 'text-indigo-400';
    case 'agribusiness': return 'text-amber-400';
    case 'finance': return 'text-rose-400';
    case 'construction': return 'text-orange-400';
    default: return 'text-slate-400';
  }
};

export default LandingPage;
