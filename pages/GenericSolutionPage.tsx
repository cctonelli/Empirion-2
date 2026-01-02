import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Shield, Users, Trophy, Brain, PlusCircle, ArrowRight, 
  Sparkles, Box, ShieldCheck, Zap, Globe, Target, Cpu, 
  ChevronRight, BarChart3, Database, Workflow
} from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const GenericSolutionPage: React.FC<{ type: 'university' | 'corporate' | 'individual' }> = ({ type }) => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const db = await fetchPageContent(`solution-${type}`, i18n.language);
      setContent(db || DEFAULT_PAGE_CONTENT[`solution-${type}`]);
    };
    load();
  }, [type, i18n.language]);

  if (!content) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const getIcon = () => {
    switch(content.icon) {
      case 'Users': return <Users size={56} />;
      case 'Shield': return <Shield size={56} />;
      case 'Brain': return <Brain size={56} />;
      default: return <Box size={56} />;
    }
  };

  const accentColor = type === 'university' ? 'text-blue-400' : type === 'corporate' ? 'text-indigo-400' : 'text-emerald-400';
  const bgAccent = type === 'university' ? 'bg-blue-600' : type === 'corporate' ? 'bg-indigo-600' : 'bg-emerald-600';
  const borderAccent = type === 'university' ? 'border-blue-500/30' : type === 'corporate' ? 'border-indigo-500/30' : 'border-emerald-500/30';

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-32 pb-32">
      <EmpireParticles />
      
      <div className="container mx-auto px-6 md:px-24 relative z-10 space-y-32">
        {/* HERO SECTION - COMMAND BRIEFING */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className={`w-24 h-24 ${bgAccent} rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group hover:rotate-6 transition-transform duration-500`}>
                 {getIcon()}
              </div>
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full bg-white/5 border ${borderAccent} text-[10px] font-black uppercase tracking-[0.3em] ${accentColor}`}>
                       Protocolo {type.toUpperCase()} Ativo
                    </span>
                 </div>
                 <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-[0.85]">
                    {content.title} <br/>
                    <span className={`${accentColor} opacity-80`}>Command Node</span>
                 </h1>
                 <p className="text-xl md:text-3xl text-slate-400 font-medium italic leading-relaxed max-w-2xl">
                    "{content.body}"
                 </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                 <button className={`px-14 py-6 ${bgAccent} text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-4`}>
                    Ativar Arena <ArrowRight size={18} />
                 </button>
                 <button className="px-10 py-6 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-xl">
                    Documentação Técnica
                 </button>
              </div>
           </motion.div>

           <div className="relative">
              <div className="absolute -inset-10 bg-blue-600/5 blur-[100px] rounded-full animate-pulse" />
              <div className="grid grid-cols-1 gap-6 relative z-10">
                 <CapabilityCard 
                    icon={<Cpu />} 
                    title="Engine v6.0 Fidelity" 
                    desc="Processamento de elasticidade-preço e market share com precisão militar."
                    accent={accentColor}
                 />
                 <CapabilityCard 
                    icon={<Brain />} 
                    title="Strategos AI Mentor" 
                    desc="Assistência cognitiva via Gemini 3 Pro para cada decisão tática."
                    accent={accentColor}
                 />
                 <CapabilityCard 
                    icon={<Database />} 
                    title="Real-time Audit" 
                    desc="Sincronização instantânea de balanços e fluxos de caixa via Supabase."
                    accent={accentColor}
                 />
              </div>
           </div>
        </section>

        {/* DETAILED FEATURES GRID */}
        <section className="space-y-16">
           <div className="text-center space-y-4">
              <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] ${accentColor}`}>Operational Capacity</h2>
              <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Recursos de Alta Performance</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { t: "Simulação Realista", d: "Modelagem de 9 regiões geográficas e gestão de Capex/Opex.", i: <Target /> },
                { t: "Dashboards Avançados", d: "Visualização em tempo real via ApexCharts de alta fidelidade.", i: <BarChart3 /> },
                { t: "Colaboração em Massa", d: "Suporte para centenas de equipes operando simultaneamente.", i: <Users /> }
              ].map((item, i) => (
                <div key={i} className="p-10 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] space-y-6 hover:bg-white/[0.06] transition-all group">
                   <div className={`p-4 rounded-2xl w-fit ${bgAccent}/20 ${accentColor} group-hover:scale-110 transition-transform`}>{item.i}</div>
                   <h4 className="text-2xl font-black text-white uppercase tracking-tight italic">{item.t}</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.d}</p>
                   <div className="pt-4 flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      <ShieldCheck size={12} className="text-emerald-500" /> Auditoria Oracle Validada
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-12 md:p-24 rounded-[4rem] text-center space-y-10 relative overflow-hidden">
           <Zap className="absolute -bottom-20 -right-20 opacity-5 text-white" size={400} />
           <div className="space-y-4 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Pronto para a Liderança?</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Inicie sua jornada no Empirion e transforme a complexidade empresarial em vantagem competitiva.</p>
           </div>
           <button className={`relative z-10 px-20 py-8 ${bgAccent} text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:scale-110 transition-all flex items-center gap-6 mx-auto group active:scale-95`}>
              Implementar Protocolo <ChevronRight className="group-hover:translate-x-2 transition-transform" />
           </button>
        </section>
      </div>
    </div>
  );
};

const CapabilityCard = ({ icon, title, desc, accent }: any) => (
  <div className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex gap-6 items-center hover:bg-white/[0.08] transition-all group border-l-4 hover:border-l-blue-500">
     <div className={`p-4 rounded-2xl bg-white/5 ${accent} group-hover:scale-110 transition-transform shadow-xl`}>
        {React.cloneElement(icon, { size: 28 })}
     </div>
     <div className="space-y-1">
        <h4 className="text-lg font-black text-white uppercase tracking-tight italic leading-none">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
     </div>
  </div>
);

export default GenericSolutionPage;