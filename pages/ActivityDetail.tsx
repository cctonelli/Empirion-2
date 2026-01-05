import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Factory, ShoppingCart, Briefcase, Tractor, DollarSign, 
  Hammer, ChevronRight, Zap, Target, BarChart3, Users, Box,
  Gavel, Cpu, Sparkles, ShieldCheck, Globe, Trophy, Play,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent, getModalities } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const ActivityDetail: React.FC = () => {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      // 1. Tentar buscar conteúdo dinâmico do banco (Activity ou Modality)
      const db = await fetchPageContent(`activity-${slug}`, i18n.language);
      if (db) {
        setContent(db);
      } else {
        // 2. Tentar encontrar em modalities dinâmicas do Supabase
        const mods = await getModalities();
        const foundMod = mods.find(m => m.slug === slug);
        if (foundMod) {
            setContent({
                name: foundMod.name,
                heroImage: foundMod.image_url || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000",
                body: foundMod.page_content.hero.subtitle,
                description: foundMod.description,
                features: foundMod.page_content.features,
                kpis: foundMod.page_content.kpis,
                accent: foundMod.page_content.accent_color || 'orange'
            });
            return;
        }

        // 3. Fallback para conteúdo local rico em constants.tsx
        const localContent = DEFAULT_PAGE_CONTENT[`activity-${slug}`];
        if (localContent) {
          setContent(localContent);
        } else {
          // 4. Fallback genérico final
          setContent({
            name: slug?.toUpperCase(),
            heroImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000",
            body: "Atividade estratégica em fase de inicialização no Command Node.",
            description: "Esta atividade está sendo mapeada pelos arquitetos do Empirion. Em breve, módulos de simulação de alta fidelidade estarão disponíveis para este setor.",
            features: ["Módulo em Desenvolvimento", "Engine Alpha Ativa", "Sincronização Oracle"],
            kpis: ["Status Nodo", "Versão Build", "Latência"],
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
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_30px_rgba(249,115,22,0.3)]"></div>
        <span className="text-white uppercase font-black text-xs tracking-[0.4em] animate-pulse italic">Acessando Nodo {slug}...</span>
      </div>
    </div>
  );

  const getIcon = () => {
    const s = slug?.toLowerCase();
    if (s?.includes('industrial')) return <Factory size={64} />;
    if (s?.includes('commercial') || s?.includes('comercial')) return <ShoppingCart size={64} />;
    if (s?.includes('services') || s?.includes('servicos')) return <Briefcase size={64} />;
    if (s?.includes('agri') || s?.includes('agro')) return <Tractor size={64} />;
    if (s?.includes('finance')) return <DollarSign size={64} />;
    if (s?.includes('construction')) return <Hammer size={64} />;
    if (s?.includes('negocios')) return <Gavel size={64} />;
    if (s?.includes('fabrica')) return <Cpu size={64} />;
    return <Box size={64} />;
  };

  const accentColor = content.accent === 'blue' ? 'text-blue-500' : content.accent === 'emerald' ? 'text-emerald-500' : 'text-orange-500';
  const bgAccent = content.accent === 'blue' ? 'bg-blue-600' : content.accent === 'emerald' ? 'bg-emerald-600' : 'bg-orange-600';
  const shadowAccent = content.accent === 'blue' ? 'shadow-blue-500/20' : content.accent === 'emerald' ? 'shadow-emerald-500/20' : 'shadow-orange-500/20';

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent selection:bg-orange-500 selection:text-white">
      <EmpireParticles />
      
      {/* 1. HERO SECTION DINÂMICO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent z-10" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
           <motion.img 
             initial={{ scale: 1.1 }}
             animate={{ scale: 1 }}
             transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
             src={content.heroImage} 
             className="w-full h-full object-cover brightness-50" 
             alt={content.name} 
           />
        </div>

        <div className="container mx-auto px-8 md:px-24 relative z-20">
           <div className="max-w-4xl space-y-12">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                 <div className={`w-24 h-24 ${bgAccent} rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl ${shadowAccent} group hover:rotate-12 transition-transform duration-500`}>
                    {getIcon()}
                 </div>
                 <div className="space-y-6">
                    <h1 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                       {content.name} <br/>
                       <span className={`${accentColor} italic`}>Arena</span>
                    </h1>
                    <p className="text-2xl md:text-3xl text-slate-300 font-medium leading-relaxed italic opacity-90 max-w-2xl">
                       "{content.body}"
                    </p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-6 pt-6">
                    <button 
                      onClick={() => navigate('/app/championships', { state: { preSelectedSlug: slug } })}
                      className={`px-14 py-6 ${bgAccent} text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl ${shadowAccent} flex items-center justify-center gap-4`}
                    >
                      <Play size={18} fill="currentColor" /> Iniciar Arena {content.name}
                    </button>
                    <Link to="/features" className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-4 backdrop-blur-xl">
                      Protocolo Técnico <Sparkles size={18} className={accentColor} />
                    </Link>
                 </div>
              </motion.div>
           </div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
           <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.5em] italic">Consolidando Escopo MVP v3.0</span>
           <div className="w-0.5 h-12 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        </motion.div>
      </section>

      {/* 2. DESCRIPTION & FEATURES */}
      <section className="py-40 container mx-auto px-8 md:px-24 space-y-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-12">
              <div className="space-y-4">
                 <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] ${accentColor}`}>Business Intelligence</h2>
                 <h3 className="text-5xl font-black text-white uppercase tracking-tighter italic">Visão Estratégica do Setor</h3>
              </div>
              <p className="text-xl text-slate-400 leading-relaxed font-medium">
                 {content.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                 {content.features?.map((f: string, i: number) => (
                   <div key={i} className="flex gap-4 items-start group">
                      <div className={`p-2 rounded-lg ${bgAccent}/10 ${accentColor} mt-1 group-hover:scale-110 transition-transform`}>
                         <ShieldCheck size={18} />
                      </div>
                      <span className="text-sm font-black text-slate-200 uppercase tracking-widest">{f}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              {content.features?.slice(0, 4).map((f: string, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-10 bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] space-y-6 hover:bg-slate-900 transition-all shadow-2xl group border-b-2 hover:border-b-orange-500">
                   <div className={`p-4 bg-white/5 rounded-2xl w-fit ${accentColor} group-hover:scale-110 transition-all`}><Zap size={24} /></div>
                   <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{f}</h4>
                   <div className="h-1 w-12 bg-white/10 rounded-full" />
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 3. ENGINE ANALYTICS (KPIs) */}
      <section className="py-40 bg-white/[0.02] relative z-10">
        <div className="container mx-auto px-8 md:px-24 space-y-24">
           <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-4 text-blue-500"><Target size={32} /></div>
              <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] ${accentColor}`}>Metrics Oracle</h2>
              <h3 className="text-6xl font-black text-white uppercase tracking-tighter italic">Core Simulation KPIs</h3>
              <p className="text-slate-500 font-medium text-lg italic">O sucesso nesta arena é auditado através de variáveis matemáticas precisas que refletem a saúde do seu império.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {content.kpis?.map((kpi: string, i: number) => (
                <div key={i} className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 text-center space-y-8 hover:-translate-y-2 transition-all shadow-2xl group">
                   <div className="w-20 h-20 mx-auto bg-white/5 rounded-3xl flex items-center justify-center text-slate-400 border border-white/10 group-hover:bg-white group-hover:text-slate-950 transition-all duration-500">
                      {i === 0 ? <BarChart3 size={32} /> : i === 1 ? <Trophy size={32} /> : <Users size={32} />}
                   </div>
                   <div>
                      <h4 className="text-3xl font-black text-white uppercase tracking-tight italic">{kpi}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-3">Métrica Vital Nodo {i+1}</p>
                   </div>
                   <div className="flex items-center justify-center gap-2 text-emerald-500">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Oracle Calibration ON</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. FOOTER CTA */}
      <section className="py-40 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-16">
           <div className="inline-flex p-6 bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl relative">
              <Globe size={48} className="text-blue-500 animate-[spin_10s_linear_infinite]" />
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-xl">E</div>
           </div>
           <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-2xl">
              Implemente o <br/>
              <span className={accentColor}>Protocolo {content.name}</span>
           </h2>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <button 
                onClick={() => navigate('/app/championships', { state: { preSelectedSlug: slug } })}
                className={`px-20 py-8 ${bgAccent} text-white rounded-full font-black text-sm uppercase tracking-[0.4em] hover:scale-110 transition-all shadow-[0_30px_70px_rgba(0,0,0,0.4)] active:scale-95 flex items-center gap-5`}
              >
                Ativar Arena Agora <ArrowRight size={20} />
              </button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default ActivityDetail;