
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Zap, ShieldCheck, Database, Globe, Cpu, BarChart3, 
  Sparkles, CheckCircle2
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
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-32">
        <section className="text-center space-y-6 max-w-4xl mx-auto">
           <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-none">{content.title}</h1>
           <p className="text-2xl text-slate-400 font-medium italic">"{content.subtitle}"</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           {content.items.map((item: any, i: number) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white/5 backdrop-blur-xl p-12 rounded-[4rem] border border-white/5 space-y-8 group hover:bg-orange-600/5 transition-all"
             >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                   {i === 0 ? <Zap /> : i === 1 ? <Cpu /> : <Database />}
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed italic">{item.body}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
