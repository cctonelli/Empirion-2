
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Target, BarChart3, Users, Box, ChevronRight, 
  Sparkles, ShieldCheck, Globe, Loader2
} from 'lucide-react';
import { getModalities, subscribeToModalities } from '../services/supabase';
import { Modality } from '../types';
import EmpireParticles from '../components/EmpireParticles';

const ModalityDetail: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [modality, setModality] = useState<Modality | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMod = async () => {
      setLoading(true);
      const mods = await getModalities();
      const found = mods.find(m => m.slug === slug);
      if (found) {
        setModality(found);
      } else {
        // Redireciona se não existir
        // navigate('/solutions/simulators');
      }
      setLoading(false);
    };
    fetchMod();
    const sub = subscribeToModalities(fetchMod);
    return () => { sub.unsubscribe(); };
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!modality) return null;

  const { hero, features, kpis, accent_color = 'orange' } = modality.page_content;
  const accentHex = accent_color === 'blue' ? 'text-blue-500' : accent_color === 'emerald' ? 'text-emerald-500' : 'text-orange-500';
  const bgAccent = accent_color === 'blue' ? 'bg-blue-600' : accent_color === 'emerald' ? 'bg-emerald-600' : 'bg-orange-600';

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-32">
        
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className={`w-24 h-24 ${bgAccent} rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl`}>
                 <Sparkles size={48} />
              </div>
              <div className="space-y-6">
                 <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">
                    {hero.title} <br/>
                    <span className={accentHex}>Arena</span>
                 </h1>
                 <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed italic">
                    "{hero.subtitle}"
                 </p>
              </div>
              <div className="flex gap-4">
                 <button className={`px-12 py-5 ${bgAccent} text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl`}>
                   Iniciar Simulação Beta
                 </button>
              </div>
           </motion.div>

           <div className="grid grid-cols-2 gap-8">
              {features.map((f: string, i: number) => (
                <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-4 hover:bg-white/10 transition-all">
                   <div className={`p-3 bg-white/10 rounded-xl w-fit ${accentHex}`}><Zap size={20} /></div>
                   <h4 className="text-lg font-black text-white uppercase tracking-tight">{f}</h4>
                </div>
              ))}
           </div>
        </section>

        <section className="bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border border-white/5 p-16 space-y-16">
           <div className="text-center space-y-4">
              <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] ${accentHex}`}>Engine DNA</h2>
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter">Variáveis de Impacto</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {kpis.map((kpi: string, i: number) => (
                <div key={i} className="text-center space-y-6">
                   <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 border border-white/10">
                      {i === 0 ? <BarChart3 /> : i === 1 ? <Target /> : <Users />}
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight">{kpi}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Core Metric Node</p>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
};

export default ModalityDetail;
