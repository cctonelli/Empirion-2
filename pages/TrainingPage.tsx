
import React, { useState, useEffect } from 'react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import { 
  GraduationCap, Briefcase, PlayCircle, Users, 
  Award, CheckCircle2, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const TrainingPage: React.FC<{ mode: 'online' | 'corporate' }> = ({ mode }) => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['solutions-training']);

  useEffect(() => {
    const loadData = async () => {
      const db = await fetchPageContent('solutions-training', i18n.language);
      if (db) setContent(db);
    };
    loadData();
  }, [i18n.language, mode]);

  const track = content.tracks.find((t: any) => t.id === (mode === 'online' ? 'online' : 'corp')) || content.tracks[0];

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-orange-600/10 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                 <Sparkles size={14} /> Intelligence Academy
              </div>
              <div className="space-y-6">
                 <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">
                    {track.label} <br/>
                    <span className="text-blue-500">Expertise</span>
                 </h1>
                 <p className="text-2xl text-slate-400 font-medium italic leading-relaxed">
                    "{track.body}"
                 </p>
              </div>
              <button className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-2xl flex items-center gap-4">
                 Solicitar Demo <ArrowRight size={18} />
              </button>
           </motion.div>

           <div className="grid grid-cols-1 gap-8">
              <div className="bg-slate-900/80 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 space-y-10">
                 <h3 className="text-2xl font-black uppercase text-white">O que está incluído:</h3>
                 <div className="space-y-6">
                    {[
                      'Simuladores Real-time ilimitados',
                      'Certificação Strategos Oracle',
                      'Análise de Scorecard via Gemini 3',
                      'Suporte Técnico Core Node 24/7'
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-4">
                         <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                            <CheckCircle2 size={16} />
                         </div>
                         <span className="text-lg font-bold text-slate-300 uppercase tracking-tight">{feat}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default TrainingPage;
