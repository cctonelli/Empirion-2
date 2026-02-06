
import React, { useState, useEffect } from 'react';
// Fix: Use any to bypass react-router-dom type resolution issues in this environment
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, Link, useNavigate } = ReactRouterDOM as any;
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import { 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, ChevronRight, Zap, Target, BarChart3, Users, Box,
  Gavel, Cpu, Sparkles, ShieldCheck, Globe, Trophy, Play,
  Landmark, TrendingUp, BrainCircuit, Rocket, ShieldAlert,
  ArrowRight, CheckCircle2, Flame, Award
} from 'lucide-react';
import { getPageContent } from '../constants';
import { fetchPageContent, getModalities } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const ActivityDetail: React.FC = () => {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      // 1. DATABASE PRIORITY
      let dbContent = await fetchPageContent(`branch-${slug}`, i18n.language);
      if (!dbContent) dbContent = await fetchPageContent(`activity-${slug}`, i18n.language);

      if (dbContent) {
        setContent(dbContent);
      } else {
        // 2. LOCAL CONSTANTS FALLBACK (Prioritize the rich structure if available)
        const localContent = getPageContent(slug || '');
        if (localContent) {
          setContent(localContent);
        } else {
          // 3. MINIMAL FALLBACK
          setContent({
            name: slug?.toUpperCase() || 'ARENA',
            heroImage: "https://images.unsplash.com/photo-1570269691511-2a0007f5fe6f?q=80&w=774q=80&w=1200&auto=format&fit=crop",
            titlePrefix: "Inicie o Comando",
            titleHighlight: "Master Node Arena",
            body: "Aguardando sincronização de briefing regional...",
            description: "Este setor estratégico está em fase de mapeamento para simulações de alta performance.",
            features: ["Módulo Alpha Ready", "Real-time Metrics", "AI Powered"],
            themes: [],
            accent: "blue"
          });
        }
      }
    };
    load();
  }, [slug, i18n.language]);

  if (!content) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <span className="text-white uppercase font-black text-xs tracking-[0.4em] animate-pulse italic">Connecting Node {slug}...</span>
      </div>
    </div>
  );

  const getIcon = (iconName?: string) => {
    const s = iconName || slug?.toLowerCase() || '';
    if (s.includes('industrial') || s === 'Factory') return <Factory size={64} />;
    if (s.includes('commercial') || s === 'ShoppingCart') return <ShoppingCart size={64} />;
    if (s.includes('services') || s === 'Briefcase') return <Briefcase size={64} />;
    if (s.includes('agri') || s === 'Tractor') return <Tractor size={64} />;
    if (s.includes('finance') || s === 'DollarSign') return <DollarSign size={64} />;
    if (s.includes('construction') || s === 'Hammer') return <Hammer size={64} />;
    if (s === 'TrendingUp') return <TrendingUp size={64} />;
    if (s === 'BarChart3') return <BarChart3 size={64} />;
    if (s === 'Globe') return <Globe size={64} />;
    if (s === 'BrainCircuit') return <BrainCircuit size={64} />;
    return <Sparkles size={64} />;
  };

  const accentColor = content.accent === 'blue' ? 'text-blue-500' : content.accent === 'emerald' ? 'text-emerald-500' : content.accent === 'indigo' ? 'text-indigo-400' : 'text-orange-500';
  const bgAccent = content.accent === 'blue' ? 'bg-blue-600' : content.accent === 'emerald' ? 'bg-emerald-600' : content.accent === 'indigo' ? 'bg-indigo-600' : 'bg-orange-600';
  const borderAccent = content.accent === 'blue' ? 'border-blue-500/30' : content.accent === 'emerald' ? 'border-emerald-500/30' : content.accent === 'indigo' ? 'border-indigo-500/30' : 'border-orange-500/30';
  const shadowAccent = content.accent === 'blue' ? 'shadow-blue-500/20' : content.accent === 'emerald' ? 'shadow-emerald-500/20' : content.accent === 'indigo' ? 'shadow-indigo-500/20' : 'shadow-orange-500/20';

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-orange-500">
      <EmpireParticles />
      
      {/* SEÇÃO HERO DO TEMPLATE */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
         <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/60 to-[#020617] z-10" />
           <img src={content.heroImage} className="w-full h-full object-cover opacity-40 grayscale-[0.5] contrast-125" alt={content.name} />
         </div>

         <div className="container mx-auto px-8 lg:px-24 relative z-20 text-center space-y-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <span className={`inline-block px-6 py-2 ${bgAccent}/20 border ${borderAccent} rounded-full text-sm font-black uppercase tracking-[0.4em] ${accentColor}`}>
                  {content.badge || `Template ${content.name} – Ativo`}
               </span>
               <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
                  {content.titlePrefix || 'Forje Seu'} <br/>
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${content.accent === 'orange' ? 'from-orange-600 via-orange-400 to-white' : 'from-blue-600 via-blue-400 to-white'}`}>
                     {content.titleHighlight || content.name}
                  </span>
               </h1>
               <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-4xl mx-auto italic leading-relaxed opacity-90">
                  {content.body}
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <button 
                    onClick={() => navigate('/auth', { state: { template: slug } })}
                    className={`px-16 py-8 ${bgAccent} text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl ${shadowAccent} hover:scale-110 hover:bg-white hover:text-slate-950 transition-all flex items-center gap-6 group active:scale-95`}
                  >
                    Iniciar Batalha <Rocket size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <Link to="/solutions/simulators" className="px-12 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-xl">
                    Outros Setores
                  </Link>
               </div>
            </motion.div>
         </div>
      </section>

      {/* SEÇÃO DIFERENCIADORES (VALUE PROP) */}
      <section className="py-32 bg-slate-950/40 relative z-10">
         <div className="container mx-auto px-8 lg:px-24">
            <div className={`bg-slate-900/60 backdrop-blur-2xl p-16 md:p-24 rounded-[5rem] border ${borderAccent} shadow-[0_40px_100px_rgba(0,0,0,0.6)]`}>
               <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-16 text-center leading-none">
                  Por que o Template <span className={accentColor}>{content.name}</span> é imbatível?
               </h2>
               <div className="grid md:grid-cols-2 gap-16 text-lg text-slate-300 leading-relaxed font-medium">
                  {content.advantages ? (
                    <>
                      <ul className="space-y-8">
                         {content.advantages.slice(0, 3).map((adv: string, i: number) => (
                           <li key={i} className="flex gap-6 items-start">
                              <div className={`p-2 rounded-lg ${bgAccent} text-white shrink-0 mt-1`}><CheckCircle2 size={20}/></div>
                              <p dangerouslySetInnerHTML={{ __html: adv.replace(/–|—/g, '<strong>–</strong>') }} />
                           </li>
                         ))}
                      </ul>
                      <ul className="space-y-8">
                         {content.advantages.slice(3).map((adv: string, i: number) => (
                           <li key={i} className="flex gap-6 items-start">
                              <div className={`p-2 rounded-lg ${bgAccent} text-white shrink-0 mt-1`}><CheckCircle2 size={20}/></div>
                              <p dangerouslySetInnerHTML={{ __html: adv.replace(/–|—/g, '<strong>–</strong>') }} />
                           </li>
                         ))}
                      </ul>
                    </>
                  ) : (
                    <p className="col-span-2 text-center text-slate-500 italic">Mapeando diferenciais estratégicos para este setor...</p>
                  )}
               </div>
               <p className={`mt-20 text-center text-2xl italic ${accentColor} font-black uppercase tracking-widest`}>
                  Nenhum outro simulador combina tamanha profundidade
               </p>
            </div>
         </div>
      </section>

      {/* GRADE DE TEMAS TÉCNICOS (THEMES) */}
      <section className="py-40 container mx-auto px-8 lg:px-24 relative z-10 space-y-24">
         <div className="text-center space-y-4">
            <span className={`text-[11px] font-black uppercase tracking-[0.8em] ${accentColor} italic`}>Technical Ecosystem</span>
            <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter">Domínios de Controle</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {content.themes?.map((theme: any, i: number) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/50 p-8 rounded-[4rem] border border-white/5 hover:border-white/20 transition-all group shadow-2xl relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform rotate-12">
                    {getIcon(theme.icon)}
                 </div>
                 <div className="flex items-center gap-6 mb-10 relative z-10">
                    <div className={`p-5 rounded-3xl ${theme.color === 'orange' ? 'bg-orange-600/20 text-orange-400' : theme.color === 'blue' ? 'bg-blue-600/20 text-blue-400' : theme.color === 'emerald' ? 'bg-emerald-600/20 text-emerald-400' : theme.color === 'indigo' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-purple-600/20 text-purple-400'} shadow-xl`}>
                       {React.cloneElement(getIcon(theme.icon) as any, { size: 32 })}
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white uppercase italic leading-none tracking-tight">{theme.title}</h3>
                 </div>
                 <ul className="space-y-4 relative z-10">
                    {theme.points.map((pt: string, j: number) => (
                       <li key={j} className="flex items-center gap-4 text-slate-400 font-bold text-sm group-hover:text-slate-200 transition-colors uppercase tracking-tight">
                          <div className={`w-1.5 h-1.5 rounded-full ${bgAccent} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} /> {pt}
                       </li>
                    ))}
                 </ul>
              </motion.div>
            ))}
         </div>
      </section>

      {/* CTA FINAL DE FECHAMENTO */}
      <section className="py-40 relative z-10 overflow-hidden">
         <div className="container mx-auto px-8 lg:px-24 text-center space-y-12">
            <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-10 leading-none">
               Pronto para forjar seu <br/> <span className={accentColor}>Império {content.name}</span>?
            </h2>
            <Link 
              to="/auth" 
              className={`inline-flex items-center gap-8 px-20 py-10 ${bgAccent} text-white rounded-full font-black text-xl md:text-2xl uppercase tracking-[0.3em] shadow-[0_30px_80px_rgba(0,0,0,0.6)] hover:scale-110 hover:bg-white hover:text-slate-950 transition-all group border-4 border-white/10 active:scale-95`}
            >
               Inicializar Arena Agora
               <Rocket size={40} className="group-hover:translate-x-3 transition-transform" />
            </Link>
            <div className="pt-8 space-y-4">
               <p className="text-2xl text-slate-400 italic font-medium">Trial gratuito – Protocolo Elite v15.25 Sincronizado</p>
               <div className="flex justify-center gap-8 opacity-40 grayscale">
                  <div className="flex items-center gap-2"><ShieldCheck size={16}/> <span>Fidelidade 99.8%</span></div>
                  <div className="flex items-center gap-2"><Zap size={16}/> <span>Real-time Sync</span></div>
                  <div className="flex items-center gap-2"><Award size={16}/> <span>Certificação EMPIRION</span></div>
               </div>
            </div>
         </div>
      </section>

      <footer className="py-24 border-t border-white/5 text-center opacity-40">
         <p className="text-[10px] font-black uppercase tracking-[0.5em]">EMPIRION STRATEGIC COMMAND • {content.name.toUpperCase()} LANDING PROTOCOL</p>
      </footer>
    </div>
  );
};

export default ActivityDetail;
