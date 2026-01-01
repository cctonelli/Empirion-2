
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Trophy, Brain, PlusCircle, ArrowRight, Sparkles } from 'lucide-react';
import EmpireParticles from '../components/EmpireParticles';

const GenericSolutionPage: React.FC<{ type: 'university' | 'corporate' | 'individual' | 'create' }> = ({ type }) => {
  const config = {
    university: { title: 'University', accent: 'text-blue-400', icon: <Users size={48} />, body: 'Formação acadêmica de elite para as maiores instituições do país.' },
    corporate: { title: 'Corporate', accent: 'text-indigo-400', icon: <Shield size={48} />, body: 'Desenvolvimento de liderança e alinhamento estratégico in-company.' },
    individual: { title: 'Individual IA', accent: 'text-emerald-400', icon: <Brain size={48} />, body: 'Treine seu raciocínio contra o Oráculo Gemini 3 em partidas solo.' },
    create: { title: 'Custom Arena', accent: 'text-orange-500', icon: <PlusCircle size={48} />, body: 'Configure cada variável e lance seu próprio ecossistema competitivo.' }
  }[type];

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-24">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
           <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`w-28 h-28 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto ${config.accent} border border-white/10 shadow-2xl`}>
              {config.icon}
           </motion.div>
           <div className="space-y-4">
              <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-none">
                 {config.title} <br/>
                 <span className={config.accent}>Solution</span>
              </h1>
              <p className="text-2xl text-slate-400 font-medium italic">"{config.body}"</p>
           </div>
           <div className="pt-10">
              <button className="px-16 py-7 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl flex items-center gap-4 mx-auto group">
                 Iniciar Protocolo <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </section>
      </div>
    </div>
  );
};

export default GenericSolutionPage;
