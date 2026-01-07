
import React, { useState, useEffect } from 'react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import { 
  Zap, ShieldCheck, Database, Globe, Cpu, BarChart3, 
  Sparkles, CheckCircle2, LayoutGrid, Workflow, Terminal,
  Layers, Lock, Server, Share2, Activity
} from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const FeaturesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['features']);

  useEffect(() => {
    const loadData = async () => {
      const db = await fetchPageContent('features', i18n.language);
      if (db) setContent(db);
    };
    loadData();
  }, [i18n.language]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-6 md:px-24 relative z-10 space-y-32">
        {/* HEADER - TECHNICAL BLUEPRINT */}
        <section className="text-center space-y-8 max-w-5xl mx-auto">
           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 px-6 py-2 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.5em] border border-blue-500/20 mb-4">
              <Terminal size={14} /> System Core Architecture
           </motion.div>
           <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-[0.8] drop-shadow-2xl">
              Superioridade <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Operacional</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-400 font-medium italic leading-relaxed max-w-4xl mx-auto">
              "A arquitetura do Empirion foi projetada para desafiar os melhores estrategistas através de simulações de fidelidade extrema."
           </p>
        </section>

        {/* CORE FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {content.items.map((item: any, i: number) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 space-y-8 group hover:bg-white/[0.06] transition-all hover:-translate-y-2 shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
                   <LayoutGrid size={120} />
                </div>
                <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                   {getFeatureIcon(i)}
                </div>
                <div className="space-y-4 relative z-10">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tight italic">{item.title}</h3>
                   <p className="text-slate-400 font-medium leading-relaxed italic">{item.body}</p>
                </div>
                <div className="pt-6 border-t border-white/5 space-y-4 relative z-10">
                   <div className="flex items-center gap-3 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Status: Online & Auditado
                   </div>
                   <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <Activity size={12} /> Latência: 12ms Response
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* TECHNICAL STACK BREAKDOWN */}
        <section className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[4rem] p-12 md:p-24 space-y-16">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                 <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Under the Hood</h2>
                    <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter">O Motor Empirion v6.0</h3>
                 </div>
                 <p className="text-lg text-slate-400 leading-relaxed font-medium">
                    Nossa infraestrutura combina o legado de décadas de simulação Empirion com o poder de processamento da IA generativa de última geração.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <TechItem label="IA Gemini 3 Pro" icon={<BrainCircuit size={20}/>} />
                    <TechItem label="Supabase Realtime" icon={<Server size={20}/>} />
                    <TechItem label="Encryption TLS 1.3" icon={<Lock size={20}/>} />
                    <TechItem label="ApexCharts Analytics" icon={<BarChart3 size={20}/>} />
                 </div>
              </div>
              <div className="relative">
                 <div className="aspect-square bg-blue-600/10 rounded-full blur-[100px] absolute inset-0 animate-pulse" />
                 <div className="relative z-10 grid grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl space-y-4 flex flex-col items-center text-center">
                         <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-blue-500"><Workflow /></div>
                         <span className="text-[9px] font-black text-slate-500 uppercase">Subsystem 0{n}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

const getFeatureIcon = (i: number) => {
  const size = 32;
  switch(i) {
    case 0: return <Zap size={size} />;
    case 1: return <Cpu size={size} />;
    case 2: return <Database size={size} />;
    case 3: return <Globe size={size} />;
    case 4: return <Layers size={size} />;
    default: return <Share2 size={size} />;
  }
};

const TechItem = ({ label, icon }: any) => (
  <div className="flex items-center gap-4 group">
     <div className="p-3 bg-white/5 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">{icon}</div>
     <span className="text-sm font-black text-slate-200 uppercase tracking-widest">{label}</span>
  </div>
);

const BrainCircuit = ({ size }: { size: number }) => <Cpu size={size} />;

export default FeaturesPage;
