
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PenTool, Globe, Target, Briefcase, DollarSign, 
  BarChart3, Brain, ChevronLeft, ChevronRight, Download,
  CheckCircle2, Sparkles, Loader2, Save, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent } from '../services/supabase';
import { generateBusinessPlanField } from '../services/gemini';
import EmpireParticles from './EmpireParticles';

const BusinessPlanWizard: React.FC = () => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['solutions-bp']);
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState('industrial');
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadData = async () => {
      const dbContent = await fetchPageContent('solutions-bp', i18n.language);
      if (dbContent) setContent(dbContent);
    };
    loadData();
  }, [i18n.language]);

  const handleAISuggest = async (stepIdx: number) => {
    setIsAiLoading(stepIdx);
    const currentStep = content.steps[stepIdx];
    const suggestion = await generateBusinessPlanField(
      currentStep.label, 
      "Desenvolvimento Estratégico", 
      formData[stepIdx] || '', 
      `Elabore detalhadamente a seção ${currentStep.label} para uma empresa de médio porte no Brasil.`, 
      branch
    );
    setFormData(prev => ({ ...prev, [stepIdx]: suggestion }));
    setIsAiLoading(null);
  };

  const handleFinalExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Protocolo de Plano de Negócios encriptado e exportado com sucesso para seu terminal local.");
    }, 2500);
  };

  const getStepIcon = (id: number) => {
    switch(id) {
      case 0: return <PenTool size={18} />;
      case 1: return <Globe size={18} />;
      case 2: return <Target size={18} />;
      case 3: return <Briefcase size={18} />;
      case 4: return <DollarSign size={18} />;
      default: return <BarChart3 size={18} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-12">
        {/* Header */}
        <header className="text-center space-y-6 max-w-4xl mx-auto">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }}
             className="inline-flex p-6 bg-orange-600 text-white rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.3)] mb-4"
           >
              <PenTool size={40} />
           </motion.div>
           <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">{content.title}</h1>
           <p className="text-2xl text-slate-400 font-medium italic">"{content.subtitle}"</p>
        </header>

        {/* Stepper Node Grid */}
        <div className="max-w-6xl mx-auto flex items-center justify-between relative px-4 overflow-x-auto pb-10 custom-scrollbar">
           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0 hidden md:block"></div>
           {content.steps.map((s: any, idx: number) => (
             <button 
               key={s.id}
               onClick={() => setStep(idx)}
               className="relative z-10 flex flex-col items-center gap-4 group min-w-[150px]"
             >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${
                  step === idx ? 'bg-orange-600 text-white shadow-[0_0_40px_rgba(249,115,22,0.5)] scale-110' : 
                  step > idx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-600 border border-white/10'
                }`}>
                   {step > idx ? <CheckCircle2 size={28} /> : getStepIcon(s.id)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest text-center ${step === idx ? 'text-orange-500' : 'text-slate-500'}`}>
                   {s.label}
                </span>
             </button>
           ))}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
          <aside className="lg:col-span-3 space-y-6">
             <div className="p-10 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Célula Industrial</label>
                   <select 
                     value={branch}
                     onChange={e => setBranch(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-black text-white outline-none appearance-none cursor-pointer focus:border-orange-500"
                   >
                     <option value="industrial">Industrial</option>
                     <option value="commercial">Comercial</option>
                     <option value="services">Serviços</option>
                     <option value="agribusiness">Agronegócio</option>
                   </select>
                </div>
                <div className="p-6 bg-gradient-to-tr from-orange-600/10 to-transparent border border-orange-500/20 rounded-3xl space-y-4">
                   <div className="flex items-center gap-2 text-orange-500">
                      <Zap size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Core Status</span>
                   </div>
                   <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">O plano gerado aqui servirá de benchmark para sua arena multiplayer.</p>
                </div>
             </div>
          </aside>

          <main className="lg:col-span-9 bg-slate-900/50 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl min-h-[650px] flex flex-col relative overflow-hidden group">
             <AnimatePresence mode="wait">
               <motion.div 
                 key={step}
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -30 }}
                 className="flex-1 space-y-12 relative z-10"
               >
                  <div className="flex items-center justify-between pb-10 border-b border-white/5">
                     <div className="space-y-2">
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">{content.steps[step].label}</h2>
                        <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]">Audit Node {step + 1}.0</p>
                     </div>
                     <button 
                       onClick={() => handleAISuggest(step)}
                       disabled={isAiLoading !== null}
                       className="flex items-center gap-3 px-8 py-3 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all disabled:opacity-50 shadow-2xl"
                     >
                        {isAiLoading === step ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                        Assistência Strategos
                     </button>
                  </div>

                  <div className="space-y-6">
                     <p className="text-lg text-slate-400 font-medium italic">"{content.steps[step].body}"</p>
                     <textarea 
                        value={formData[step] || ''}
                        onChange={e => setFormData(prev => ({ ...prev, [step]: e.target.value }))}
                        placeholder="Insira sua visão estratégica ou use o Strategos AI para iniciar o rascunho..."
                        className="w-full min-h-[350px] p-10 bg-white/5 border border-white/10 rounded-[3.5rem] font-medium text-slate-100 outline-none focus:border-orange-500 focus:bg-white/10 transition-all resize-none text-lg shadow-inner"
                     />
                  </div>
               </motion.div>
             </AnimatePresence>

             <div className="pt-12 mt-12 border-t border-white/5 flex items-center justify-between relative z-10">
                <button 
                  onClick={() => setStep(prev => Math.max(0, prev - 1))}
                  disabled={step === 0}
                  className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-0 flex items-center gap-3"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
                
                <div className="flex gap-4">
                   <button className="hidden md:flex px-10 py-5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all items-center gap-3">
                      <Save size={16} /> Salvar Rascunho
                   </button>
                   {step < content.steps.length - 1 ? (
                     <button 
                       onClick={() => setStep(prev => prev + 1)}
                       className="px-16 py-6 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all flex items-center gap-4 shadow-2xl"
                     >
                       Próxima Fase <ChevronRight size={16} />
                     </button>
                   ) : (
                     <button 
                       onClick={handleFinalExport}
                       disabled={isExporting}
                       className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-700 transition-all flex items-center gap-4 shadow-2xl disabled:opacity-50"
                     >
                       {isExporting ? <Loader2 size={18} className="animate-spin" /> : <><Download size={18} /> Gerar Plano Final</>}
                     </button>
                   )}
                </div>
             </div>
             <Sparkles className="absolute -bottom-20 -right-20 p-20 text-white opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000" size={500} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanWizard;
