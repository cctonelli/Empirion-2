
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PenTool, Globe, Target, Briefcase, DollarSign, 
  BarChart3, Brain, ChevronLeft, ChevronRight, Download,
  CheckCircle2, Sparkles, Loader2, Save, ShieldCheck, Zap,
  TrendingUp, Activity, PieChart, Info, ShieldAlert, Star,
  Printer, FileText, History, TrendingDown, ArrowUpRight,
  LayoutGrid, Users, Rocket, ExternalLink, HelpCircle,
  AlertOctagon, BadgeCheck, FileWarning
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

const BP_STEPS = [
  { id: 0, label: 'SUMÁRIO EXECUTIVO', icon: <Sparkles size={18}/>, desc: 'A visão panorâmica gerada por IA.' },
  { id: 1, label: 'ANÁLISE DE MERCADO', icon: <Globe size={18}/>, desc: 'Matriz SWOT, TAM/SAM/SOM e concorrentes.' },
  { id: 2, label: 'PRODUTOS & SERVIÇOS', icon: <LayoutGrid size={18}/>, desc: 'Diferenciais, USP e ciclo de vida.' },
  { id: 3, label: 'ESTRATÉGIA MKT/VENDAS', icon: <Target size={18}/>, desc: '4Ps, canais e pricing regional.' },
  { id: 4, label: 'ORGANIZAÇÃO & GESTÃO', icon: <Users size={18}/>, desc: 'Organograma, headcount e cultura.' },
  { id: 5, label: 'PLANO FINANCEIRO', icon: <DollarSign size={18}/>, desc: 'Necessidade de capital e projeções.' },
  { id: 6, label: 'PLANO CONTINGÊNCIA', icon: <AlertOctagon size={18}/>, desc: 'Resposta a eventos Black Swan.' },
];

const BusinessPlanWizard: React.FC<IntegratedWizardProps> = ({ championshipId, teamId, currentRound = 1, onClose }) => {
  const { i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState<Branch>('industrial');
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activePlan, setActivePlan] = useState<BusinessPlan | null>(null);
  const [formData, setFormData] = useState<Record<number, string>>({});
  const [simHistory, setSimHistory] = useState<any[]>([]);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const isIntegrated = !!(championshipId && teamId);

  useEffect(() => {
    const loadBaseData = async () => {
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
  }, [teamId, championshipId, isIntegrated, currentRound]);

  const handleSave = async (status: 'draft' | 'submitted' | 'finalized' = 'draft') => {
    setIsSaving(true);
    try {
        const payload: Partial<BusinessPlan> = {
          id: activePlan?.id,
          championship_id: championshipId,
          team_id: teamId,
          round: currentRound,
          version: (activePlan?.version || 0) + 1,
          data: formData,
          status: status,
          visibility: 'private',
          is_template: false,
          shared_with: []
        };
        const { data, error } = await saveBusinessPlan(payload) as any;
        if (error) throw error;
        alert(status === 'submitted' ? "PLANO ESTRATÉGICO SUBMETIDO PARA AUDITORIA DO TUTOR." : "RASCUNHO SINCRONIZADO.");
    } catch (err: any) {
        alert(`FALHA NA SINCRONIZAÇÃO: ${err.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAISuggest = async (stepIdx: number) => {
    setIsAiLoading(stepIdx);
    const lastKPIs = simHistory.length > 0 ? simHistory[simHistory.length - 1] : null;
    const suggestion = await generateBusinessPlanField(
      BP_STEPS[stepIdx].label, 
      "Plano Estratégico", 
      (formData[stepIdx] || ''), 
      `Elabore a seção ${BP_STEPS[stepIdx].label} para uma empresa de ${branch}. Use tom executivo. Se for Simulação, considere KPIs: ${JSON.stringify(lastKPIs)}`, 
      branch
    );
    setFormData(prev => ({ ...prev, [stepIdx]: suggestion }));
    setIsAiLoading(null);
  };

  const handleAudit = async () => {
    const currentText = formData[step];
    if (!currentText) return;
    setIsAuditing(true);
    const result = await auditBusinessPlan(BP_STEPS[step].label, currentText, simHistory[simHistory.length - 1]);
    setAuditResult(result);
    setIsAuditing(false);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden bg-transparent ${!isIntegrated && 'pt-40'} pb-32 font-sans print:bg-white print:pt-0`}>
      <div className="print:hidden"><EmpireParticles /></div>
      
      <div className="container mx-auto px-6 md:px-16 relative z-10 space-y-12">
        
        {/* HEADER */}
        <header className="text-center space-y-6 max-w-4xl mx-auto print:hidden">
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`inline-flex p-6 rounded-[2.5rem] text-white shadow-2xl mb-4 ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'}`}>
              <PenTool size={40} />
           </motion.div>
           <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
             {isIntegrated ? 'Simulation Business Plan' : 'Independent Business Builder'}
           </h1>
           <p className="text-2xl text-slate-400 font-medium italic">
             {isIntegrated ? `Unidade Tática • Ciclo 0${currentRound}` : 'Crie sua estratégia para o mercado real'}
           </p>
        </header>

        {/* INDICADOR DE MODO */}
        <div className="flex justify-center print:hidden">
           <div className={`px-6 py-2 rounded-full border flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] ${isIntegrated ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-orange-600/10 border-orange-500/30 text-orange-400'}`}>
              {isIntegrated ? <><Rocket size={14}/> Sincronizado com Arena</> : <><ExternalLink size={14}/> Modo Independente Standalone</>}
           </div>
        </div>

        {/* STEPS SELECTOR */}
        <div className="max-w-7xl mx-auto flex items-center justify-between relative px-4 overflow-x-auto pb-10 no-scrollbar print:hidden">
           <div className="absolute top-[32px] left-0 right-0 h-0.5 bg-white/5 -z-0 hidden lg:block"></div>
           {BP_STEPS.map((s, idx) => (
             <button key={s.id} onClick={() => { setStep(idx); setAuditResult(null); }} className="relative z-10 flex flex-col items-center gap-4 group min-w-[140px]">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 border ${step === idx ? (isIntegrated ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.4)]' : 'bg-orange-600 border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.4)]') + ' text-white scale-110' : 'bg-slate-900 text-slate-600 border-white/5 group-hover:border-white/20'}`}>
                   {s.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest text-center max-w-[120px] ${step === idx ? (isIntegrated ? 'text-indigo-400' : 'text-orange-500') : 'text-slate-500'}`}>{s.label}</span>
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
          {/* EDITOR PRINCIPAL */}
          <main className="lg:col-span-8 bg-slate-900/50 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl min-h-[700px] flex flex-col relative overflow-hidden print:col-span-12 print:bg-white print:border-0 print:shadow-none print:p-0">
             
             <div className="hidden print:block border-b-4 border-slate-950 pb-10 mb-10">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Plano de Negócios Consolidado</h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Empirion Strategos • Node Alpha v15.80</p>
             </div>

             <AnimatePresence mode="wait">
               <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-10 relative z-10 print:hidden">
                  <div className="flex items-center justify-between pb-8 border-b border-white/5">
                     <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{BP_STEPS[step].label}</h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{BP_STEPS[step].desc}</p>
                     </div>
                     <button onClick={() => handleAISuggest(step)} disabled={isAiLoading !== null} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-2xl ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'} text-white`}>
                        {isAiLoading === step ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />} Sugestão Oráculo
                     </button>
                  </div>
                  <textarea 
                    value={formData[step] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [step]: e.target.value }))}
                    className="w-full min-h-[450px] p-12 bg-white/5 border border-white/10 rounded-[3.5rem] font-medium text-slate-100 outline-none focus:border-indigo-500/50 transition-all resize-none text-lg shadow-inner custom-scrollbar"
                    placeholder={`Redija o conteúdo para ${BP_STEPS[step].label}...`}
                  />
               </motion.div>
             </AnimatePresence>

             {/* INTERFACE DE PRINT */}
             <div className="hidden print:block space-y-20">
                {BP_STEPS.map((s, idx) => (
                   <div key={idx} className="space-y-6 break-inside-avoid">
                      <h3 className="text-3xl font-black uppercase italic border-b-2 border-slate-200 pb-4 text-slate-900">{s.label}</h3>
                      <div className="text-xl text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                         {formData[idx] || "Seção não preenchida pelo estrategista."}
                      </div>
                   </div>
                ))}
             </div>

             <div className="pt-12 mt-12 border-t border-white/5 flex items-center justify-between relative z-10 print:hidden">
                <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white disabled:opacity-0 flex items-center gap-3">
                  <ChevronLeft size={16} /> Voltar
                </button>
                <div className="flex gap-4">
                   <button onClick={() => window.print()} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3">
                      <Printer size={16} /> Print Protocol
                   </button>
                   <button onClick={() => handleSave('draft')} disabled={isSaving} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-3">
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Sincronizar Rascunho
                   </button>
                   {step === BP_STEPS.length - 1 ? (
                      <button onClick={() => handleSave(isIntegrated ? 'submitted' : 'finalized')} className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 hover:scale-105 shadow-xl shadow-orange-500/20">
                         Selar e Finalizar <ChevronRight size={16} />
                      </button>
                   ) : (
                      <button onClick={() => setStep(s => s + 1)} className={`px-16 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 ${isIntegrated ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-white text-slate-950 hover:bg-orange-600 hover:text-white'}`}>
                         Avançar <ChevronRight size={16} />
                      </button>
                   )}
                </div>
             </div>
          </main>

          {/* ASIDE - ANALYTICS & AUDIT */}
          <aside className="lg:col-span-4 space-y-8 print:hidden">
             
             {isIntegrated && simHistory.length > 0 && (
                <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg"><Activity size={24}/></div>
                      <h3 className="text-xl font-black text-white uppercase italic">Contexto Simulado</h3>
                   </div>
                   <div className="space-y-4">
                      <HistoryStat label="Equity Atual" val={`$ ${simHistory[simHistory.length-1]?.equity?.toLocaleString()}`} trend="Real-time" pos />
                      <HistoryStat label="Market Share" val={`${(simHistory[simHistory.length-1]?.state?.market_share || 0).toFixed(1)}%`} trend="Market" pos />
                      <HistoryStat label="Rating" val={simHistory[simHistory.length-1]?.state?.rating || 'N/A'} trend="Oracle" pos />
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed">
                      "Utilize estes números do motor industrial para validar suas justificativas operacionais."
                   </p>
                </div>
             )}

             <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><BadgeCheck size={24}/></div>
                   <h3 className="text-xl font-black text-white uppercase italic">Auditoria Master</h3>
                </div>

                <div className="p-8 bg-slate-950 rounded-3xl border border-white/5 min-h-[250px] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-125 transition-transform"><ShieldCheck size={100}/></div>
                   {isAuditing ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-indigo-400" size={40} />
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">Validando Coerência...</span>
                     </div>
                   ) : auditResult ? (
                     <div className="space-y-6 relative z-10">
                        <p className="text-sm font-medium text-slate-300 leading-relaxed italic">"{auditResult}"</p>
                        <div className="flex items-center gap-2 text-indigo-400">
                           <Star size={12} fill="currentColor"/> <span className="text-[10px] font-black uppercase">Fidelidade Oracle v5.8</span>
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-4 text-center py-10 relative z-10">
                        <HelpCircle size={40} className="text-slate-700 mx-auto" />
                        <p className="text-[11px] text-slate-500 font-bold uppercase italic leading-relaxed">
                           Seu rascunho atual para "{BP_STEPS[step].label}" ainda não foi auditado pela IA.
                        </p>
                     </div>
                   )}
                </div>

                <button 
                  onClick={handleAudit} 
                  disabled={!formData[step] || isAuditing}
                  className="w-full py-7 bg-white/5 border border-white/10 hover:bg-white hover:text-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-30 active:scale-95"
                >
                   <Zap size={18} fill="currentColor" /> Analisar Pilar Estratégico
                </button>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const HistoryStat = ({ label, val, trend, pos }: any) => (
   <div className="flex justify-between items-center p-5 bg-slate-950/80 rounded-2xl border border-white/5">
      <div>
         <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
         <span className="text-xl font-black text-white font-mono">{val}</span>
      </div>
      <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>
         {pos ? <TrendingUp size={10}/> : <TrendingDown size={10}/>} {trend}
      </div>
   </div>
);

export default BusinessPlanWizard;
