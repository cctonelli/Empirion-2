
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award, Star, Zap, Gift, TrendingUp, Trophy } from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const PublicRewards: React.FC = () => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const db = await fetchPageContent('rewards', i18n.language);
      setContent(db || DEFAULT_PAGE_CONTENT['rewards']);
    };
    load();
  }, [i18n.language]);

  if (!content) return <div className="pt-40 text-center text-white uppercase font-black">Node Initializing...</div>;

  return (
    <div className="pt-40 pb-32 px-8 md:px-24 min-h-screen relative overflow-hidden bg-transparent">
      <EmpireParticles />
      <div className="max-w-7xl mx-auto space-y-32 relative z-10">
        {/* Hero */}
        <section className="text-center space-y-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20 shadow-[0_0_50px_rgba(251,191,36,0.1)]"
           >
              <Trophy size={48} />
           </motion.div>
           <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic">{content.title}</h1>
              <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto">{content.subtitle}</p>
           </div>
        </section>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {content.tiers.map((tier: any, i: number) => (
             <motion.div 
               key={tier.name}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white/5 border border-white/5 p-10 rounded-[3rem] text-center space-y-6 hover:bg-white/10 transition-all cursor-default"
             >
                <div className={`text-[10px] font-black uppercase tracking-[0.4em] ${tier.color}`}>{tier.name}</div>
                <div className="text-4xl font-black text-white tracking-tighter">{tier.pts} <span className="text-sm opacity-40">pts</span></div>
                <div className="pt-6 border-t border-white/5">
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-current ${tier.color}`} style={{ width: i === 0 ? '100%' : '10%' }}></div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* How to Earn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-12">
              <div className="space-y-4">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Empire Gamification</h2>
                 <h3 className="text-5xl font-black text-white uppercase tracking-tighter">Como Acumular?</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 {content.accumulation.map((acc: any, i: number) => (
                   <div key={i} className="flex items-center gap-6 p-6 bg-slate-900 rounded-[2rem] border border-white/5 group">
                      <div className="p-3 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                         <Zap size={18} className="text-white" />
                      </div>
                      <div>
                         <div className="text-[10px] font-black uppercase text-slate-500 mb-1">{acc.action}</div>
                         <div className="text-lg font-black text-white">{acc.val}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
              <Gift className="absolute -bottom-20 -right-20 opacity-10 group-hover:rotate-12 transition-transform duration-700" size={300} />
              <div className="relative z-10 space-y-8">
                 <h3 className="text-4xl font-black uppercase tracking-tighter">Resgates Estratégicos</h3>
                 <ul className="space-y-6">
                    <li className="flex gap-4 items-start">
                       <div className="p-1.5 bg-white/20 rounded-lg shrink-0 mt-1"><Star size={16} /></div>
                       <p className="text-sm font-bold leading-relaxed uppercase">Isenção de Team Fee para Torneios de Elite.</p>
                    </li>
                    <li className="flex gap-4 items-start">
                       <div className="p-1.5 bg-white/20 rounded-lg shrink-0 mt-1"><TrendingUp size={16} /></div>
                       <p className="text-sm font-bold leading-relaxed uppercase">Acesso antecipado a novos módulos de simulação.</p>
                    </li>
                    <li className="flex gap-4 items-start">
                       <div className="p-1.5 bg-white/20 rounded-lg shrink-0 mt-1"><Award size={16} /></div>
                       <p className="text-sm font-bold leading-relaxed uppercase">Badges de perfil auditados pelo Command Center.</p>
                    </li>
                 </ul>
                 <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl">Cadastrar para Começar</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRewards;
