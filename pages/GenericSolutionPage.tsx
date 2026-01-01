
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Users, Trophy, Brain, PlusCircle, ArrowRight, Sparkles, Box } from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const GenericSolutionPage: React.FC<{ type: 'university' | 'corporate' | 'individual' | 'create' }> = ({ type }) => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const db = await fetchPageContent(`solution-${type}`, i18n.language);
      setContent(db || DEFAULT_PAGE_CONTENT[`solution-${type}`]);
    };
    load();
  }, [type, i18n.language]);

  if (!content) return <div className="pt-40 text-center text-white uppercase font-black">Node Initializing...</div>;

  const getIcon = () => {
    switch(content.icon) {
      case 'Users': return <Users size={48} />;
      case 'Shield': return <Shield size={48} />;
      case 'Brain': return <Brain size={48} />;
      case 'PlusCircle': return <PlusCircle size={48} />;
      default: return <Box size={48} />;
    }
  };

  const accentColor = content.icon === 'Users' ? 'text-blue-400' : 
                      content.icon === 'Shield' ? 'text-indigo-400' : 
                      content.icon === 'Brain' ? 'text-emerald-400' : 'text-orange-500';

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-24">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
           <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`w-28 h-28 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto ${accentColor} border border-white/10 shadow-2xl`}>
              {getIcon()}
           </motion.div>
           <div className="space-y-4">
              <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-none">
                 {content.title} <br/>
                 <span className={accentColor}>Solution</span>
              </h1>
              <p className="text-2xl text-slate-400 font-medium italic">"{content.body}"</p>
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
