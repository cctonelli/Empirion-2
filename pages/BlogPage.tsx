
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Newspaper, Calendar, User, ArrowRight, Newspaper as GazetteIcon } from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const BlogPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['blog']);

  useEffect(() => {
    const loadData = async () => {
      const db = await fetchPageContent('blog', i18n.language);
      if (db) setContent(db);
    };
    loadData();
  }, [i18n.language]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-24">
        <header className="flex flex-col md:flex-row justify-between items-end gap-10">
           <div className="space-y-6">
              <div className="inline-flex p-4 bg-orange-600 text-white rounded-2xl shadow-xl">
                 <GazetteIcon size={32} />
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">{content.title}</h1>
              <p className="text-2xl text-slate-400 font-medium italic">"{content.subtitle}"</p>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {content.items.map((post: any, i: number) => (
             <motion.article 
               key={post.id}
               initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-[4rem] overflow-hidden group hover:border-blue-500/30 transition-all"
             >
                <div className="p-12 space-y-8">
                   <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <div className="flex items-center gap-2"><Calendar size={14} /> {post.date}</div>
                      <div className="flex items-center gap-2"><User size={14} /> {post.author}</div>
                   </div>
                   <h3 className="text-4xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-blue-400 transition-colors">{post.title}</h3>
                   <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 group-hover:translate-x-2 transition-transform">
                      Continuar Lendo <ArrowRight size={16} />
                   </button>
                </div>
             </motion.article>
           ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
