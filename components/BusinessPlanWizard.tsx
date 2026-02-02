
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PenTool, Globe, Target, Briefcase, DollarSign, 
  BarChart3, Brain, ChevronLeft, ChevronRight, Download,
  CheckCircle2, Sparkles, Loader2, Save, ShieldCheck, Zap,
  TrendingUp, Activity, PieChart, Info, ShieldAlert, Star,
  Printer, FileText, History, TrendingDown, ArrowUpRight
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent, getActiveBusinessPlan, saveBusinessPlan, getTeamSimulationHistory, supabase } from '../services/supabase';
import { generateBusinessPlanField, auditBusinessPlan } from '../services/gemini';
import EmpireParticles from './EmpireParticles';
import { BusinessPlan, Branch, KPIs } from '../types';

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

  const handleSaveDraft = async (status: 'draft' | 'submitted' = 'draft') => {
    if (!isIntegrated) return;
    setIsSaving(true);
    try {
        await saveBusinessPlan({
          championship_id: championshipId!,
          team_id: teamId!,
          round: currentRound,
          version: (activePlan?.version || 0) + 1,
          data: formData,
          status: status
        });
        alert(status === 'submitted' ? "PLANO ESTRATÉGICO SELADO E ENVIADO AO TUTOR." : "RASCUNHO SINCRONIZADO.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleAISuggest = async (stepIdx: number) => {
    setIsAiLoading(stepIdx);
    const lastKPIs = simHistory.length > 0 ? simHistory[simHistory.length - 1] : null;
    const suggestion = await generateBusinessPlanField(
      content.steps[stepIdx].label, 
      "Plano Estratégico", 
      (formData[stepIdx] || ''), 
      `Elabore a seção ${content.steps[stepIdx].label} para ${branch}. Contexto de performance: ${JSON.stringify(lastKPIs)}`, 
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

  const handlePrint = () => {
    window.print();
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
    <div className={`min-h-screen relative overflow-hidden bg-transparent ${!isIntegrated && 'pt-40'} pb-32 font-sans print:bg-white print:pt-0`}>
      <div className="print:hidden"><EmpireParticles /></div>
      
      <div className="container mx-auto px-6 md:px-16 relative z-10 space-y-12">
        
        {/* HEADER - OCULTO NO PRINT PARA DAR LUGAR AO CABEÇALHO FORMAL */}
        <header className="text-center space-y-6 max-w-4xl mx-auto print:hidden">
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`inline-flex p-6 rounded-[2.5rem] text-white shadow-2xl mb-4 ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'}`}>
              <PenTool size={40} />
           </motion.div>
           <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
             {isIntegrated ? 'Oracle Business Plan' : content.title}
           </h1>
           <p className="text-2xl text-slate-400 font-medium italic">
             {isIntegrated ? `Unidade de Gestão • Ciclo 0${currentRound}` : `"${content.subtitle}"`}
           </p>
        </header>

        {/* CABEÇALHO FORMAL APENAS PARA IMPRESSÃO */}
        <div className="hidden print:block border-b-4 border-slate-950 pb-10 mb-10">
           <div className="flex justify-between items-end">
              <div>
                 <h1 className="text-4xl font-black uppercase tracking-tighter italic">Relatório de Planejamento Estratégico</h1>
                 <p className="text-slate-500 font-black uppercase text-xs tracking-widest mt-2">Empirion Oracle System • v15.36 Fidelity</p>
              </div>
              <div className="text-right">
                 <p className="font-black text-sm uppercase">Arena ID: {championshipId}</p>
                 <p className="font-black text-sm uppercase text-indigo-600">Round de Referência: P0{currentRound}</p>
              </div>
           </div>
        </div>

        {/* STEPS SELECTOR - OCULTO NO PRINT */}
        <div className="max-w-6xl mx-auto flex items-center justify-between relative px-4 overflow-x-auto pb-10 no-scrollbar print:hidden">
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
          {/* ÁREA DE CONTEÚDO */}
          <main className="lg:col-span-8 bg-slate-900/50 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl min-h-[650px] flex flex-col relative overflow-hidden print:col-span-12 print:bg-white print:border-0 print:shadow-none print:p-0">
             
             {/* VISUALIZAÇÃO DE PRINT (TODAS AS SEÇÕES) */}
             <div className="hidden print:block space-y-16">
                {content.steps.map((s: any, idx: number) => (
                   <div key={idx} className="space-y-6 break-inside-avoid">
                      <h2 className="text-3xl font-black uppercase italic border-b-2 border-slate-200 pb-4">{s.label}</h2>
                      <div className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap font-medium min-h-[100px]">
                         {formData[idx] || "Nenhuma estratégia definida para este pilar."}
                      </div>
                   </div>
                ))}
             </div>

             {/* INTERFACE EDITÁVEL (OCULTA NO PRINT) */}
             <AnimatePresence mode="wait">
               <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1 space-y-12 relative z-10 print:hidden">
                  <div className="flex items-center justify-between pb-10 border-b border-white/5">
                     <div className="space-y-2">
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">{content.steps[step].label}</h2>
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isIntegrated ? 'text-indigo-400' : 'text-orange-500'}`}>Arquitetura Nodal {step + 1}.0</p>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => handleAISuggest(step)} disabled={isAiLoading !== null} className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-2xl ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'} text-white`}>
                           {isAiLoading === step ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />} Consultar Oráculo
                        </button>
                     </div>
                  </div>
                  <textarea 
                    value={formData[step] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [step]: e.target.value }))}
                    className="w-full min-h-[400px] p-10 bg-white/5 border border-white/10 rounded-[3.5rem] font-medium text-slate-100 outline-none focus:border-indigo-500 transition-all resize-none text-lg shadow-inner"
                    placeholder="Descreva sua visão estratégica neste pilar..."
                  />
               </motion.div>
             </AnimatePresence>

             <div className="pt-12 mt-12 border-t border-white/5 flex items-center justify-between relative z-10 print:hidden">
                <button onClick={() => { setStep(prev => Math.max(0, prev - 1)); setAuditResult(null); }} disabled={step === 0} className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white disabled:opacity-0 flex items-center gap-3">
                  <ChevronLeft size={16} /> Voltar
                </button>
                <div className="flex gap-4">
                   <button onClick={handlePrint} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3">
                      <Printer size={16} /> Exportar PDF
                   </button>
                   {isIntegrated && <button onClick={() => handleSaveDraft('draft')} disabled={isSaving} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-indigo-400 hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3">{isSaving ? <Loader2 className="animate-spin" /> : <Save size={16} />} Salvar Rascunho</button>}
                   
                   {step === content.steps.length - 1 ? (
                      <button onClick={() => handleSaveDraft('submitted')} className="px-16 py-6 bg-emerald-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 hover:scale-105 shadow-xl shadow-emerald-500/20">
                         Selar e Submeter <ChevronRight size={16} />
                      </button>
                   ) : (
                      <button onClick={() => { setStep(prev => prev + 1); setAuditResult(null); }} className={`px-16 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 ${isIntegrated ? 'bg-indigo-600' : 'bg-white text-slate-950 hover:bg-orange-600 hover:text-white'}`}>
                         Próxima Fase <ChevronRight size={16} />
                      </button>
                   )}
                </div>
             </div>
          </main>

          {/* ASIDE - INSIGHTS E PERFORMANCE (OCULTO NO PRINT) */}
          <aside className="lg:col-span-4 space-y-8 print:hidden">
             
             {/* PERFORMANCE REAL INJETADA */}
             <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg"><History size={24}/></div>
                   <h3 className="text-xl font-black text-white uppercase italic">Performance Real</h3>
                </div>
                
                <div className="space-y-4">
                   <HistoryStat label="Market Share" val={`${(simHistory[simHistory.length-1]?.state?.market_share || 11.1).toFixed(1)}%`} trend="+1.2%" pos />
                   <HistoryStat label="Resultado P00" val={`$ ${simHistory[simHistory.length-1]?.equity?.toLocaleString() || '7.3M'}`} trend="Baseline" pos />
                   <HistoryStat label="Rating Oracle" val={simHistory[simHistory.length-1]?.state?.rating || 'AAA'} trend="Stable" pos />
                </div>
                
                <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed">
                   "Utilize estes números reais para fundamentar sua argumentação no Plano Financeiro."
                </p>
             </div>

             <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><ShieldCheck size={24}/></div>
                   <h3 className="text-xl font-black text-white uppercase italic">Auditoria IA</h3>
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
                           <Star size={12} fill="currentColor"/> <span className="text-[10px] font-black uppercase">Coerência Strategos v5.8</span>
                        </div>
                     </div>
                   ) : (
                     <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter leading-relaxed">
                        Clique abaixo para que a IA valide se suas metas condizem com a saúde financeira real da unidade.
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
          </aside>
        </div>
      </div>
    </div>
  );
};

const HistoryStat = ({ label, val, trend, pos }: any) => (
   <div className="flex justify-between items-center p-4 bg-slate-950/50 rounded-2xl border border-white/5">
      <div>
         <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
         <span className="text-lg font-black text-white font-mono">{val}</span>
      </div>
      <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>
         {pos ? <TrendingUp size={10}/> : <TrendingDown size={10}/>} {trend}
      </div>
   </div>
);

export default BusinessPlanWizard;
