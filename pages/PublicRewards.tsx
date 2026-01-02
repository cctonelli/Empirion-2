
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Award, Star, Zap, Gift, TrendingUp, Trophy, 
  Crown, Shield, CheckCircle2, ChevronRight,
  ArrowUpRight, Sparkles, Gem, Target, Layers,
  // Added missing ShieldCheck import
  ShieldCheck
} from 'lucide-react';
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

  if (!content) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
       <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-6 md:px-24 relative z-10 space-y-32">
        
        {/* HERO - PRESTIGE SYSTEM */}
        <section className="text-center space-y-10 max-w-5xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-28 h-28 bg-amber-500/10 rounded-[3rem] flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20 shadow-[0_0_80px_rgba(251,191,36,0.2)] group"
           >
              <Trophy size={56} className="group-hover:rotate-12 transition-transform duration-500" />
           </motion.div>
           <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                 <span className="px-6 py-2 rounded-full bg-white/5 border border-amber-500/30 text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">
                    Elite Prestige Node
                 </span>
              </div>
              <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-[0.8] drop-shadow-2xl">
                 Empire <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-white to-amber-400">Rewards</span>
              </h1>
              <p className="text-xl md:text-3xl text-slate-400 font-medium max-w-3xl mx-auto italic leading-relaxed">
                 "{content.subtitle}"
              </p>
           </div>
        </section>

        {/* TIERS GRID - METALLIC LOOK */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {content.tiers.map((tier: any, i: number) => (
             <motion.div 
               key={tier.name}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-12 rounded-[4rem] text-center space-y-10 hover:bg-white/[0.06] transition-all group relative overflow-hidden shadow-2xl"
             >
                <div className={`absolute top-0 left-0 w-1 h-full bg-current ${tier.color} opacity-40`} />
                <div className={`text-[11px] font-black uppercase tracking-[0.5em] ${tier.color} drop-shadow-sm`}>{tier.name}</div>
                <div className="space-y-4">
                   <div className="text-6xl font-black text-white tracking-tighter italic">{tier.pts}</div>
                   <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">PONTOS MÍNIMOS</div>
                </div>
                <div className="pt-8 border-t border-white/5 space-y-6">
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full bg-current ${tier.color} shadow-[0_0_15px_rgba(0,0,0,0.5)]`} style={{ width: i === 0 ? '100%' : '10%' }}></div>
                   </div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {i === 0 ? 'STATUS ATUAL' : 'LOCKED: REQUER EVOLUÇÃO'}
                   </p>
                </div>
                {i === 3 && <Crown className="absolute -top-6 -right-6 text-amber-500 opacity-5 rotate-12" size={200} />}
             </motion.div>
           ))}
        </div>

        {/* HOW TO EARN & BENEFITS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
           <div className="bg-slate-950/60 backdrop-blur-3xl p-12 md:p-20 rounded-[4rem] border border-white/10 space-y-16 flex flex-col justify-between shadow-2xl">
              <div className="space-y-12">
                 <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Empire Dynamics</h2>
                    <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter">Protocolos de Acúmulo</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {content.accumulation.map((acc: any, i: number) => (
                      <div key={i} className="flex gap-6 group">
                         <div className="p-4 bg-white/5 text-blue-500 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl h-fit border border-white/5">
                            <Zap size={20} fill="currentColor" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase text-slate-500 mb-1 group-hover:text-slate-300 transition-colors">{acc.action}</div>
                            <div className="text-2xl font-black text-white italic">{acc.val}</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="pt-10 border-t border-white/5 flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                 <ShieldCheck size={18} className="text-emerald-500" /> Sincronização via Oracle Node 08 Ativa
              </div>
           </div>

           <div className="bg-gradient-to-tr from-indigo-700 via-blue-700 to-indigo-900 p-12 md:p-20 rounded-[4rem] text-white shadow-[0_50px_100px_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <Gem className="absolute -bottom-20 -right-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000" size={400} />
              <div className="relative z-10 space-y-12">
                 <div className="space-y-4">
                    <h3 className="text-5xl font-black uppercase tracking-tighter italic">Privilégios de Elite</h3>
                    <p className="text-blue-100 font-medium opacity-80 text-lg italic">"Sua excelência estratégica é convertida em ativos reais de plataforma."</p>
                 </div>
                 <ul className="space-y-8">
                    {[
                      { t: "Isenção de Team Fee", d: "Acesso gratuito a arenas de torneios patrocinados.", i: <Layers /> },
                      { t: "Acesso Antecipado", d: "Teste novos módulos Beta antes da rede global.", i: <Target /> },
                      { t: "Certificação Strategos", d: "Badge oficial auditado para seu perfil profissional.", i: <Award /> }
                    ].map((feat, i) => (
                      <li key={i} className="flex gap-6 items-start group/item">
                         <div className="p-4 bg-white/10 rounded-2xl shrink-0 group-hover/item:scale-110 transition-transform">{feat.i}</div>
                         <div className="space-y-1">
                            <h5 className="text-xl font-black uppercase italic leading-none">{feat.t}</h5>
                            <p className="text-xs font-bold text-blue-200 opacity-70 uppercase tracking-tight">{feat.d}</p>
                         </div>
                      </li>
                    ))}
                 </ul>
                 <button className="w-full py-7 bg-white text-slate-950 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4">
                    Sincronizar Perfil Agora <ArrowUpRight size={20} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRewards;
