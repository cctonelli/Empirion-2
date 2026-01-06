
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import { 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, ChevronRight, Zap, Target, BarChart3, Users, Box
} from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const BranchDetail: React.FC = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation('branches');
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const db = await fetchPageContent(`branch-${slug}`, i18n.language);
      setContent(db || DEFAULT_PAGE_CONTENT[`branch-${slug}`]);
    };
    load();
  }, [slug, i18n.language]);

  if (!content) return <div className="pt-40 text-center text-white uppercase font-black">Node Initializing...</div>;

  const getIcon = () => {
    switch(slug) {
      case 'industrial': return <Factory size={64} />;
      case 'commercial': return <ShoppingCart size={64} />;
      case 'services': return <Briefcase size={64} />;
      case 'agribusiness': return <Tractor size={64} />;
      case 'finance': return <DollarSign size={64} />;
      case 'construction': return <Hammer size={64} />;
      default: return <Box size={64} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-32">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             className="space-y-10"
           >
              <div className="w-24 h-24 bg-orange-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl">
                 {getIcon()}
              </div>
              <div className="space-y-6">
                 <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">
                    {content.name} <br/>
                    <span className="text-orange-500">Arena</span>
                 </h1>
                 <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed italic">
                    "{content.body}"
                 </p>
              </div>
              <div className="flex gap-4">
                 <Link 
                   to="/solutions/open-tournaments"
                   className="px-12 py-5 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
                 >
                   Ver Campeonatos Abertos
                 </Link>
              </div>
           </motion.div>

           <div className="grid grid-cols-2 gap-8">
              {content.features.map((f: string, i: number) => (
                <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-4">
                   <div className="p-3 bg-white/10 rounded-xl w-fit text-orange-500"><Zap size={20} /></div>
                   <h4 className="text-lg font-black text-white uppercase tracking-tight">{f}</h4>
                </div>
              ))}
           </div>
        </section>

        {/* Technical Data */}
        <section className="bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border border-white/5 p-16 space-y-16">
           <div className="text-center space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Engine Analytics</h2>
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter">Core Simulation KPIs</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {content.kpis.map((kpi: string, i: number) => (
                <div key={i} className="text-center space-y-6">
                   <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 border border-white/10">
                      {i === 0 ? <BarChart3 /> : i === 1 ? <Target /> : <Users />}
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight">{kpi}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Métrica Primária {content.name}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
};

export default BranchDetail;
