
import React, { useState, useEffect } from 'react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import { 
  Newspaper, Calendar, User, ArrowRight, 
  Newspaper as GazetteIcon, Sparkles, 
  MessageSquare, Share2, Tag, Clock,
  TrendingUp, Newspaper as NewsIcon
} from 'lucide-react';
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
      <div className="container mx-auto px-6 md:px-24 relative z-10 space-y-24">
        {/* HEADER - GAZETTE TITLE */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/10 pb-16">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-orange-600/10 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-orange-500/20">
                 <GazetteIcon size={14} /> Official Intelligence Feed
              </div>
              <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-[0.8] drop-shadow-2xl">
                 Gazeta <br/>
                 <span className="text-orange-500">Empirion</span>
              </h1>
              <p className="text-xl md:text-3xl text-slate-400 font-medium italic leading-relaxed max-w-3xl">
                 "{content.subtitle}"
              </p>
           </div>
           <div className="hidden lg:block text-right space-y-2">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Status do Nodo</span>
              <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Sincronizado v6.0
              </div>
           </div>
        </header>

        {/* FEATURED POST (DYNAMIC LOOK) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8">
              <div className="grid grid-cols-1 gap-12">
                 {content.items.map((post: any, i: number) => (
                   <motion.article 
                     key={post.id}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[4rem] overflow-hidden group hover:bg-white/[0.04] transition-all border-l-4 hover:border-l-orange-600 shadow-2xl"
                   >
                      <div className="p-10 md:p-16 space-y-8">
                         <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5"><Calendar size={14} className="text-orange-500" /> {post.date}</div>
                            <div className="flex items-center gap-2"><User size={14} className="text-blue-500" /> {post.author}</div>
                            <div className="flex items-center gap-2"><Clock size={14} /> 5 min read</div>
                         </div>
                         <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-[0.95] group-hover:text-orange-500 transition-colors italic">
                            {post.title}
                         </h3>
                         <p className="text-lg text-slate-400 font-medium leading-relaxed italic line-clamp-3">
                            Análise profunda sobre os novos protocolos de processamento neural e seu impacto na simulação de cenários industriais de alta volatilidade.
                         </p>
                         <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                            <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 group-hover:translate-x-3 transition-transform">
                               Acessar Briefing <ArrowRight size={18} />
                            </button>
                            <div className="flex gap-4">
                               <button className="p-3 text-slate-600 hover:text-white transition-colors"><Share2 size={18}/></button>
                               <button className="p-3 text-slate-600 hover:text-white transition-colors"><MessageSquare size={18}/></button>
                            </div>
                         </div>
                      </div>
                   </motion.article>
                 ))}
              </div>
           </div>

           {/* SIDEBAR - INTELLIGENCE DASHBOARD */}
           <aside className="lg:col-span-4 space-y-10">
              <div className="p-10 bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[3.5rem] space-y-8">
                 <h4 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                    <TrendingUp size={16} /> Tópicos em Alta
                 </h4>
                 <div className="flex wrap gap-3">
                    {['Estratégia IA', 'Industrial', 'Market Share', 'Bernard Legacy', 'CVM', 'Strategos'].map(tag => (
                      <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-orange-600 hover:text-white transition-all cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                 </div>
              </div>

              <div className="p-10 bg-gradient-to-br from-orange-600 to-red-700 rounded-[3.5rem] text-white shadow-2xl space-y-6 relative overflow-hidden group">
                 <Sparkles className="absolute -top-10 -right-10 opacity-10 group-hover:scale-150 transition-transform duration-1000" size={150} />
                 <h4 className="text-xl font-black uppercase italic leading-none">Strategos Insight</h4>
                 <p className="text-xs font-medium text-orange-50 leading-relaxed opacity-90">
                    "O sucesso não é um destino, é um algoritmo otimizado continuamente pelo processamento de falhas passadas."
                 </p>
                 <div className="pt-6 border-t border-white/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><UserIcon size={16}/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Strategos Core Alpha</span>
                 </div>
              </div>

              <div className="p-10 bg-blue-600/10 border border-blue-500/20 rounded-[3.5rem] space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Newsletter do Terminal</h4>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">Receba atualizações de arena diretamente no seu feed neural.</p>
                 <div className="flex gap-2">
                    <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="E-mail de Operador" />
                    <button className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-500 transition-all"><ArrowRight size={18}/></button>
                 </div>
              </div>
           </aside>
        </div>
      </div>
    </div>
  );
};

const UserIcon = ({ size }: { size: number }) => <User size={size} />;

export default BlogPage;
