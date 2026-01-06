
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PenTool, Globe, Target, Briefcase, DollarSign, 
  BarChart3, Brain, ChevronLeft, ChevronRight, Download,
  CheckCircle2, Sparkles, Loader2, Save, ShieldCheck, Zap,
  TrendingUp, Activity, PieChart, Info, ShieldAlert, Star
} from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent, getActiveBusinessPlan, saveBusinessPlan, subscribeToBusinessPlan, getTeamSimulationHistory } from '../services/supabase';
import { generateBusinessPlanField, auditBusinessPlan } from '../services/gemini';
import EmpireParticles from './EmpireParticles';
import { BusinessPlan, Branch } from '../types';

interface IntegratedWizardProps {
  championshipId?: string;
  teamId?: string;
  currentRound?: number;
  onClose?: () => void;
}

const BusinessPlanWizard: React.FC<IntegratedWizardProps> = ({ championshipId, teamId, currentRound = 1, onClose }) => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<any>(DEFAULT_PAGE_CONTENT['solutions-bp']);
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState<Branch>('industrial');
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [activePlan, setActivePlan] = useState<BusinessPlan | null>(null);
  const [formData, setFormData] = useState<Record<number, string>>({});
  const [simHistory, setSimHistory] = useState<any[]>([]);

  // Audit state
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const isIntegrated = !!(championshipId && teamId);

  useEffect(() => {
    const loadBaseData = async () => {
      const dbContent = await fetchPageContent('solutions-bp', i18n.language);
      if (dbContent) setContent(dbContent);
      
      if (isIntegrated) {
        const { data } = await getActiveBusinessPlan(teamId!, currentRound);
        if (data) {
          setActivePlan(data);
          setFormData(data.data || {});
        }
        const history = await getTeamSimulationHistory(teamId!);
        setSimHistory(history);
      }
    };
    loadBaseData();
  }, [i18n.language, teamId, championshipId, isIntegrated]);

  const handleSaveDraft = async () => {
    if (!isIntegrated) return;
    setIsSaving(true);
    await saveBusinessPlan({
      championship_id: championshipId!,
      team_id: teamId!,
      round: currentRound,
      version: (activePlan?.version || 0) + 1,
      data: formData,
      status: 'draft'
    });
    setIsSaving(false);
    alert("PLAN RASCUNHO SINCRONIZADO.");
  };

  const handleAISuggest = async (stepIdx: number) => {
    setIsAiLoading(stepIdx);
    const suggestion = await generateBusinessPlanField(
      content.steps[stepIdx].label, 
      "Plano Estratégico", 
      (formData[stepIdx] || ''), 
      `Elabore a seção ${content.steps[stepIdx].label} para ${branch}.`, 
      branch
    );
    setFormData(prev => ({ ...prev, [stepIdx]: suggestion }));
    setIsAiLoading(null);
  };

  const handleAudit = async () => {
    const currentText = formData[step];
    if (!currentText) return;
    setIsAuditing(true);
    const result = await auditBusinessPlan(content.steps[step].label, currentText, simHistory[simHistory.length - 1]);
    setAuditResult(result);
    setIsAuditing(false);
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
    <div className={`min-h-screen relative overflow-hidden bg-transparent ${!isIntegrated && 'pt-40'} pb-32 font-sans`}>
      <EmpireParticles />
      <div className="container mx-auto px-6 md:px-16 relative z-10 space-y-12">
        
        <header className="text-center space-y-6 max-w-4xl mx-auto">
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`inline-flex p-6 rounded-[2.5rem] text-white shadow-2xl mb-4 ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'}`}>
              <PenTool size={40} />
           </motion.div>
           <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
             {isIntegrated ? 'Oracle Progress Plan' : content.title}
           </h1>
           <p className="text-2xl text-slate-400 font-medium italic">
             {isIntegrated ? `Unidade 08 • Ciclo 0${currentRound} Audit Node` : `"${content.subtitle}"`}
           </p>
        </header>

        <div className="max-w-6xl mx-auto flex items-center justify-between relative px-4 overflow-x-auto pb-10 no-scrollbar">
           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0 hidden md:block"></div>
           {content.steps.map((s: any, idx: number) => (
             <button key={s.id} onClick={() => { setStep(idx); setAuditResult(null); }} className="relative z-10 flex flex-col items-center gap-4 group min-w-[150px]">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${step === idx ? (isIntegrated ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-orange-600 shadow-orange-500/50') + ' text-white scale-110' : step > idx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-600 border border-white/10'}`}>
                   {step > idx ? <CheckCircle2 size={28} /> : getStepIcon(s.id)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest text-center ${step === idx ? (isIntegrated ? 'text-indigo-400' : 'text-orange-500') : 'text-slate-500'}`}>{s.label}</span>
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
          <main className="lg:col-span-8 bg-slate-900/50 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl min-h-[650px] flex flex-col relative overflow-hidden group">
             <AnimatePresence mode="wait">
               <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1 space-y-12 relative z-10">
                  <div className="flex items-center justify-between pb-10 border-b border-white/5">
                     <div className="space-y-2">
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">{content.steps[step].label}</h2>
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isIntegrated ? 'text-indigo-400' : 'text-orange-500'}`}>Oracle Node {step + 1}.0</p>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => handleAISuggest(step)} disabled={isAiLoading !== null} className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-2xl ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'} text-white`}>
                           {isAiLoading === step ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />} Sugerir IA
                        </button>
                     </div>
                  </div>
                  <textarea 
                    value={formData[step] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [step]: e.target.value }))}
                    className="w-full min-h-[400px] p-10 bg-white/5 border border-white/10 rounded-[3.5rem] font-medium text-slate-100 outline-none focus:border-indigo-500 transition-all resize-none text-lg shadow-inner"
                    placeholder="Descreva sua arquitetura estratégica aqui..."
                  />
               </motion.div>
             </AnimatePresence>

             <div className="pt-12 mt-12 border-t border-white/5 flex items-center justify-between relative z-10">
                <button onClick={() => { setStep(prev => Math.max(0, prev - 1)); setAuditResult(null); }} disabled={step === 0} className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white disabled:opacity-0 flex items-center gap-3">
                  <ChevronLeft size={16} /> Voltar
                </button>
                <div className="flex gap-4">
                   {isIntegrated && <button onClick={handleSaveDraft} disabled={isSaving} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-indigo-400 hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3">{isSaving ? <Loader2 className="animate-spin" /> : <Save size={16} />} Salvar Rascunho</button>}
                   <button onClick={() => { setStep(prev => prev + 1); setAuditResult(null); }} className={`px-16 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 ${isIntegrated ? 'bg-indigo-600' : 'bg-white text-slate-950 hover:bg-orange-600 hover:text-white'}`}>
                      Próxima Fase <ChevronRight size={16} />
                   </button>
                </div>
             </div>
          </main>

          <aside className="lg:col-span-4 space-y-8">
             <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] space-y-10 shadow-2xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><ShieldCheck size={24}/></div>
                   <h3 className="text-xl font-black text-white uppercase italic">Auditoria Strategos</h3>
                </div>

                <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/5 min-h-[200px]">
                   {isAuditing ? (
                     <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="animate-spin text-indigo-400" size={32} />
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">Cruzando dados táticos...</span>
                     </div>
                   ) : auditResult ? (
                     <div className="space-y-6">
                        <p className="text-xs font-medium text-slate-300 leading-relaxed italic">"{auditResult}"</p>
                        <div className="flex items-center gap-2 text-indigo-400">
                           <Star size={12} fill="currentColor"/> <span className="text-[10px] font-black uppercase">Rating de Coerência v5.8</span>
                        </div>
                     </div>
                   ) : (
                     <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter leading-relaxed">
                        Clique em "Auditar Seção" para que a IA analise se suas palavras condizem com sua saúde financeira real.
                     </p>
                   )}
                </div>

                <button 
                  onClick={handleAudit} 
                  disabled={!formData[step] || isAuditing}
                  className="w-full py-6 bg-white/5 border border-white/10 hover:bg-white hover:text-slate-950 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-30"
                >
                   <Zap size={16} /> Auditar Seção Master
                </button>
             </div>

             <div className="p-10 bg-indigo-600 rounded-[3.5rem] text-white space-y-6 relative overflow-hidden group">
                <Sparkles className="absolute -top-10 -right-10 opacity-10 group-hover:scale-150 transition-transform duration-1000" size={200} />
                <div className="relative z-10">
                   <h4 className="text-xl font-black uppercase italic">Dica do Oráculo</h4>
                   <p className="text-xs font-medium text-indigo-100 opacity-90 leading-relaxed mt-4">
                      "Para uma nota 10, certifique-se de que seu Capex planejado para o Round 4 está provisionado no seu Ativo Circulante atual."
                   </p>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanWizard;
