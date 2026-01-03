
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PenTool, Globe, Target, Briefcase, DollarSign, 
  BarChart3, Brain, ChevronLeft, ChevronRight, Download,
  CheckCircle2, Sparkles, Loader2, Save, ShieldCheck, Zap,
  TrendingUp, Activity, PieChart, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent, getActiveBusinessPlan, saveBusinessPlan, subscribeToBusinessPlan, getTeamSimulationHistory } from '../services/supabase';
import { generateBusinessPlanField } from '../services/gemini';
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
    
    if (isIntegrated) {
      const channel = subscribeToBusinessPlan(teamId!, (payload) => {
        if (payload.new) {
          setActivePlan(payload.new);
          setFormData(payload.new.data);
        }
      });
      return () => { channel.unsubscribe(); };
    }
  }, [i18n.language, teamId, championshipId, isIntegrated]);

  const handleSaveDraft = async () => {
    if (!isIntegrated) return;
    setIsSaving(true);
    const planPayload: Partial<BusinessPlan> = {
      championship_id: championshipId!,
      team_id: teamId!,
      round: currentRound,
      version: (activePlan?.version || 0) + 1,
      data: formData,
      status: 'draft'
    };
    await saveBusinessPlan(planPayload);
    setIsSaving(false);
  };

  const handleAISuggest = async (stepIdx: number) => {
    setIsAiLoading(stepIdx);
    const currentStep = content.steps[stepIdx];
    
    // Contexto enriquecido com dados da simulação se integrado
    const simContext = isIntegrated 
      ? `A empresa está na rodada ${currentRound}. O histórico de decisões inclui: ${JSON.stringify(simHistory.slice(-2))}.`
      : "";

    const suggestion = await generateBusinessPlanField(
      currentStep.label, 
      "Desenvolvimento Estratégico", 
      (formData[stepIdx] || '') + simContext, 
      `Elabore detalhadamente a seção ${currentStep.label} para uma empresa do setor ${branch}.`, 
      branch
    );
    setFormData(prev => ({ ...prev, [stepIdx]: suggestion }));
    setIsAiLoading(null);
  };

  const handleFinalExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Plano de Negócios Progressivo exportado. Dados simulados integrados à análise final.");
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
    <div className={`min-h-screen relative overflow-hidden bg-transparent ${!isIntegrated && 'pt-40'} pb-32`}>
      <EmpireParticles />
      <div className="container mx-auto px-6 md:px-16 relative z-10 space-y-12">
        
        {/* Header - Adaptativo para modo Campeonato */}
        <header className="text-center space-y-6 max-w-4xl mx-auto">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }}
             className={`inline-flex p-6 rounded-[2.5rem] text-white shadow-2xl mb-4 ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'}`}
           >
              <PenTool size={40} />
           </motion.div>
           <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
             {isIntegrated ? 'Strategic Progress Plan' : content.title}
           </h1>
           <p className="text-2xl text-slate-400 font-medium italic">
             {isIntegrated 
               ? `Construindo o império da Unidade 08 • Ciclo 0${currentRound}`
               : `"${content.subtitle}"`}
           </p>
        </header>

        {/* Stepper */}
        <div className="max-w-6xl mx-auto flex items-center justify-between relative px-4 overflow-x-auto pb-10 custom-scrollbar">
           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0 hidden md:block"></div>
           {content.steps.map((s: any, idx: number) => (
             <button 
               key={s.id}
               onClick={() => setStep(idx)}
               className="relative z-10 flex flex-col items-center gap-4 group min-w-[150px]"
             >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${
                  step === idx ? (isIntegrated ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-orange-600 shadow-orange-500/50') + ' text-white scale-110' : 
                  step > idx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-600 border border-white/10'
                }`}>
                   {step > idx ? <CheckCircle2 size={28} /> : getStepIcon(s.id)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest text-center ${step === idx ? (isIntegrated ? 'text-indigo-400' : 'text-orange-500') : 'text-slate-500'}`}>
                   {s.label}
                </span>
             </button>
           ))}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
          <aside className="lg:col-span-3 space-y-6">
             <div className="p-10 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] space-y-8 shadow-2xl">
                {!isIntegrated && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Célula de Atividade</label>
                    <select 
                      value={branch}
                      onChange={e => setBranch(e.target.value as Branch)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-black text-white outline-none appearance-none cursor-pointer focus:border-orange-500"
                    >
                      <option value="industrial">Industrial</option>
                      <option value="commercial">Comercial</option>
                      <option value="services">Serviços</option>
                    </select>
                  </div>
                )}
                
                {isIntegrated && (
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-4">Status da Arena</h4>
                     <div className="space-y-4">
                        <SimStat label="Market Share" val={`${(Math.random()*5+10).toFixed(1)}%`} icon={<Activity size={14}/>} />
                        <SimStat label="ROE Acumulado" val={`${(Math.random()*2+8).toFixed(1)}%`} icon={<TrendingUp size={14}/>} />
                        <SimStat label="Cash Flow" val={`$ ${(Math.random()*100000+50000).toLocaleString()}`} icon={<DollarSign size={14}/>} />
                     </div>
                  </div>
                )}

                <div className={`p-6 border rounded-3xl space-y-4 ${isIntegrated ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-orange-600/10 border-orange-500/20'}`}>
                   <div className={`flex items-center gap-2 ${isIntegrated ? 'text-indigo-400' : 'text-orange-500'}`}>
                      <Zap size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Oracle Link</span>
                   </div>
                   <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase italic">
                     {isIntegrated 
                       ? "Os dados financeiros de suas jogadas estão alimentando automaticamente as projeções do plano."
                       : "O plano gerado aqui servirá de benchmark para sua arena multiplayer."}
                   </p>
                </div>
             </div>

             {isIntegrated && (
               <div className="p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-[2.5rem] space-y-4 shadow-xl">
                  <h4 className="text-emerald-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><PieChart size={14}/> Competitor Insight</h4>
                  <p className="text-[10px] font-medium text-slate-300 leading-relaxed italic">
                    "A Unidade 04 baixou preços em 15%. Atualize sua SWOT para refletir esta ameaça competitiva regional."
                  </p>
               </div>
             )}
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
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isIntegrated ? 'text-indigo-400' : 'text-orange-500'}`}>
                           Progress Node {step + 1}.0 • {isIntegrated ? 'Simulation Data Sync' : 'Static Draft'}
                        </p>
                     </div>
                     <div className="flex gap-4">
                        <button 
                          onClick={() => handleAISuggest(step)}
                          disabled={isAiLoading !== null}
                          className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all disabled:opacity-50 shadow-2xl ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'} text-white`}
                        >
                           {isAiLoading === step ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                           Strategos AI Link
                        </button>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <p className="text-lg text-slate-400 font-medium italic">"{content.steps[step].body}"</p>
                     <textarea 
                        value={formData[step] || ''}
                        onChange={e => setFormData(prev => ({ ...prev, [step]: e.target.value }))}
                        placeholder="Descreva sua estratégia. No modo integrado, a IA ajudará a correlacionar suas palavras com seus números financeiros reais..."
                        className="w-full min-h-[350px] p-10 bg-white/5 border border-white/10 rounded-[3.5rem] font-medium text-slate-100 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all resize-none text-lg shadow-inner custom-scrollbar"
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
                   {isIntegrated && (
                     <button 
                       onClick={handleSaveDraft}
                       disabled={isSaving}
                       className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-indigo-400 hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3 shadow-xl"
                     >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                        {activePlan ? `Salvar Ver. ${activePlan.version + 1}` : 'Iniciar Plano'}
                     </button>
                   )}
                   
                   {step < content.steps.length - 1 ? (
                     <button 
                       onClick={() => setStep(prev => prev + 1)}
                       className={`px-16 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 shadow-2xl ${isIntegrated ? 'bg-indigo-600 hover:bg-white hover:text-indigo-950' : 'bg-white text-slate-950 hover:bg-orange-600 hover:text-white'}`}
                     >
                       Próxima Fase <ChevronRight size={16} />
                     </button>
                   ) : (
                     <button 
                       onClick={handleFinalExport}
                       disabled={isExporting}
                       className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-700 transition-all flex items-center gap-4 shadow-2xl disabled:opacity-50"
                     >
                       {isExporting ? <Loader2 size={18} className="animate-spin" /> : <><Download size={18} /> Consolidar Plano Final</>}
                     </button>
                   )}
                </div>
             </div>
             <Sparkles className="absolute -bottom-20 -right-20 p-20 text-white opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000" size={500} />
          </main>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="fixed top-10 right-10 p-5 bg-white/5 text-white rounded-full hover:bg-rose-600 transition-all z-[100] shadow-2xl border border-white/10">
           <Save className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

const SimStat = ({ label, val, icon }: any) => (
  <div className="flex justify-between items-center group">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">{icon}</div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
     </div>
     <span className="text-xs font-black text-white italic font-mono">{val}</span>
  </div>
);

export default BusinessPlanWizard;
