
import React, { useState, useEffect } from 'react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import { 
  Newspaper as GazetteIcon, 
  Search, 
  ChevronDown, 
  Loader2, 
  Sparkles,
  HelpCircle,
  BookOpen,
  History,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { fetchBlogPosts } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

interface BlogPost {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
}

const BlogPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadPosts = async (query?: string) => {
    setLoading(true);
    try {
      const { data, error } = await fetchBlogPosts(query);
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Falha ao carregar posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts(searchQuery);
    }, 400); // Debounce de 400ms para evitar spam no Supabase
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] pt-40 pb-32">
      <EmpireParticles />
      
      <div className="container mx-auto px-6 md:px-24 relative z-10 space-y-20">


        {/* SEARCH BOX TACTICAL */}
        <div className="max-w-4xl mx-auto">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-[2.5rem] opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity" />
              <div className="relative flex items-center bg-slate-900 border-2 border-white/10 rounded-[2rem] overflow-hidden focus-within:border-orange-500 transition-all shadow-2xl">
                 <div className="pl-8 text-slate-500">
                    <Search size={24} />
                 </div>
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquise por termos técnicos, filosofia ou mecânicas (ex: O que é Empirion?)..."
                    className="w-full px-8 py-8 bg-transparent text-white text-lg font-bold outline-none placeholder:text-slate-700"
                 />
                 {loading && (
                    <div className="pr-8">
                       <Loader2 size={24} className="animate-spin text-orange-500" />
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* QUESTIONS LIST - ACCORDION STYLE */}
        <div className="max-w-5xl mx-auto space-y-6">
           {posts.length > 0 ? (
             posts.map((post) => (
               <motion.div 
                 key={post.id}
                 layout
                 className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden group hover:bg-white/[0.04] transition-all"
               >
                  <button 
                    onClick={() => toggleExpand(post.id)}
                    className="w-full text-left p-8 md:p-10 flex items-center justify-between gap-6"
                  >
                     <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl bg-white/5 transition-colors ${expandedId === post.id ? 'bg-orange-600 text-white' : 'text-orange-500'}`}>
                           <HelpCircle size={24} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-orange-500 transition-colors">
                           {post.question}
                        </h3>
                     </div>
                     <motion.div 
                        animate={{ rotate: expandedId === post.id ? 180 : 0 }}
                        className="text-slate-600"
                     >
                        <ChevronDown size={28} />
                     </motion.div>
                  </button>

                  <AnimatePresence>
                     {expandedId === post.id && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.4, ease: "circOut" }}
                       >
                          <div className="px-10 md:px-24 pb-12 border-t border-white/5 pt-10">
                             <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                   <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Resposta do Oráculo v13.3</span>
                                </div>
                                <div className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed italic whitespace-pre-line">
                                   {post.answer}
                                </div>
                                <div className="pt-8 flex items-center justify-between border-t border-white/5">
                                   <div className="flex gap-3">
                                      <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">{post.category}</span>
                                      <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span>
                                   </div>
                                   <button className="flex items-center gap-2 text-[9px] font-black uppercase text-orange-500 hover:translate-x-2 transition-transform">
                                      Referência Técnica <ArrowRight size={14} />
                                   </button>
                                </div>
                             </div>
                          </div>
                       </motion.div>
                     )}
                  </AnimatePresence>
               </motion.div>
             ))
           ) : !loading && (
             <div className="py-32 text-center space-y-8 bg-white/5 border-2 border-dashed border-white/5 rounded-[4rem]">
                <History size={64} className="mx-auto text-slate-700" />
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-white uppercase italic">Nenhum Registro Encontrado</h3>
                   <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Tente buscar por termos mais genéricos ou verifique a conexão com o nodo.</p>
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-8 py-4 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-orange-950 transition-all"
                >
                   Limpar Filtros
                </button>
             </div>
           )}
        </div>

        {/* SIDEBAR TACTICAL INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <InsightCard 
              icon={<BookOpen className="text-blue-400"/>} 
              title="Filosofia Core" 
              desc="Construa impérios, não apenas planilhas. O foco é a fidelidade real."
           />
           <InsightCard 
              icon={<Terminal className="text-emerald-400"/>} 
              title="Comando Strategos" 
              desc="Sua unidade de resposta tática operada por inteligência neural Gemini 3."
           />
           <InsightCard 
              icon={<Sparkles className="text-orange-400"/>} 
              title="Gamificação Elite" 
              desc="Medalhas e rankings auditados para validar sua senioridade executiva."
           />
        </div>
      </div>

      <footer className="py-24 border-t border-white/5 text-center opacity-40">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">EMPIRION INTELLIGENCE REPOSITORY • COPYRIGHT 2026</p>
      </footer>
    </div>
  );
};

const InsightCard = ({ icon, title, desc }: any) => (
   <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[3rem] space-y-4 hover:border-orange-500/20 transition-all group">
      <div className="p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">{icon}</div>
      <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 font-bold leading-relaxed">{desc}</p>
   </div>
);

export default BlogPage;
