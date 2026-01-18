import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Fix: Use any to bypass react-router-dom type resolution issues in this environment
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM as any;
import { 
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, Trophy, 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, Zap, Rocket, Terminal, Award, 
  BarChart3, Users, Play
} from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion } from 'framer-motion';
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
  const { i18n } = useTranslation('landing');
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

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 relative selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <EmpireParticles />
      
      {/* SEBRAE-STYLE ORANGE CLOUDS LAYERS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], x: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity }} className="orange-cloud-pulse w-[1000px] h-[1000px] bg-orange-600/30 -top-[20%] -left-[10%]" />
         <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05], x: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }} className="orange-cloud-pulse w-[800px] h-[800px] bg-orange-50/20 top-[40%] -right-[10%]" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617] z-[1]" />
      </div>

      <section className="min-h-screen flex items-center justify-center pt-24 px-8 md:px-24 text-center relative z-20 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-16">
           <div className="flex flex-col items-center gap-6">
              <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.5em] backdrop-blur-xl">
                 <Terminal size={14} className="inline mr-3 animate-pulse" /> {APP_VERSION} • CORE STABLE
              </div>
           </div>
           <h1 className="fluid-title font-black text-white leading-[0.8] tracking-tighter uppercase italic">
              Forje Seu Império <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-orange-400">Strategos IA</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-300 font-medium max-w-4xl mx-auto italic opacity-90">
              A arena definitiva onde inteligência neural e estratégia empresarial colidem.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
              <Link to="/auth" className="px-16 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">
                Entre na Arena <Rocket size={20} className="inline ml-3" />
              </Link>
              <Link to="/solutions/simulators" className="px-16 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-white hover:text-slate-950 transition-all">
                Explorar Ramos
              </Link>
           </div>
        </motion.div>
      </section>

      {/* RAMOS CARDS CLICÁVEIS */}
      <section className="landing-section bg-white/[0.01]">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <span className="text-[11px] font-black uppercase text-orange-500 tracking-[0.6em] italic">Protocolos Disponíveis</span>
               <h2 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Nodos de Simulação</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
               {[
                 { label: 'Industrial', icon: <Factory />, slug: 'industrial', desc: 'Produção $9M Assets' },
                 { label: 'Comercial', icon: <ShoppingCart />, slug: 'commercial', desc: 'Varejo Híbrido' },
                 { label: 'Serviços', icon: <Briefcase />, slug: 'services', desc: 'Capital Intelectual' },
                 { label: 'Agronegócio', icon: <Tractor />, slug: 'agribusiness', desc: 'Ativos Biológicos' },
                 { label: 'Financeiro', icon: <DollarSign />, slug: 'finance', desc: 'Spread & Risco' },
                 { label: 'Construção', icon: <Hammer />, slug: 'construction', desc: 'Obras Pesadas' }
               ].map((r) => (
                 <Link key={r.label} to={`/branches/${r.slug}`} className="p-12 bg-slate-900 border border-white/5 rounded-[3.5rem] hover:border-orange-500/40 transition-all group shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-10 relative z-10">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl">
                          {React.cloneElement(r.icon as React.ReactElement<any>, { size: 32 })}
                       </div>
                       <ArrowRight className="text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" size={24} />
                    </div>
                    <div className="relative z-10">
                       <h4 className="text-2xl font-black text-white uppercase italic mb-2">{r.label}</h4>
                       <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{r.desc}</p>
                    </div>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center bg-[#020617] relative z-20">
         <div className="container mx-auto px-8 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">© 2026 EMPIRION BI ARENA | PROTOCOL NODE 08 STREET</p>
            <div className="mt-6 flex justify-center scale-75 opacity-50"><LanguageSwitcher light /></div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;