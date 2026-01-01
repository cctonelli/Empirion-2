
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, ChevronRight, Trophy, Sparkles, Globe
} from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const SimulatorsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['solutions-simulators']);

  useEffect(() => {
    const loadData = async () => {
      const db = await fetchPageContent('solutions-simulators', i18n.language);
      if (db) setContent(db);
    };
    loadData();
  }, [i18n.language]);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'Factory': return <Factory size={32} />;
      case 'ShoppingCart': return <ShoppingCart size={32} />;
      case 'Briefcase': return <Briefcase size={32} />;
      case 'Tractor': return <Tractor size={32} />;
      case 'DollarSign': return <DollarSign size={32} />;
      case 'Hammer': return <Hammer size={32} />;
      default: return <Globe size={32} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-24">
        <section className="text-center space-y-6 max-w-4xl mx-auto">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }}
             className="inline-flex p-6 bg-blue-600 text-white rounded-[2.5rem] shadow-[0_0_50px_rgba(37,99,235,0.3)]"
           >
              <Trophy size={40} />
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">{content.title}</h1>
           <p className="text-2xl text-slate-400 font-medium italic">"{content.subtitle}"</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {content.items.map((item: any, i: number) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               whileHover={{ y: -10 }}
               className="group bg-slate-900/50 backdrop-blur-2xl border border-white/5 p-12 rounded-[4rem] hover:border-orange-500/30 transition-all shadow-2xl"
             >
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-blue-400 mb-10 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all">
                   {getIcon(item.icon)}
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tight mb-4 italic">{item.label}</h3>
                <p className="text-slate-500 font-bold uppercase text-sm mb-10">{item.desc}</p>
                <Link 
                  to={`/branches/${item.slug}`}
                  className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 group-hover:text-orange-500 transition-colors"
                >
                  Entrar na Arena <ChevronRight size={16} />
                </Link>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SimulatorsPage;
