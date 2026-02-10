
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PenTool, Globe, Target, Briefcase, DollarSign, 
  BarChart3, Brain, ChevronLeft, ChevronRight, Download,
  CheckCircle2, Sparkles, Loader2, Save, ShieldCheck, Zap,
  TrendingUp, Activity, PieChart, Info, ShieldAlert, Star,
  Printer, FileText, History, TrendingDown, ArrowUpRight,
  LayoutGrid, Users, Rocket, ExternalLink, HelpCircle,
  AlertOctagon, BadgeCheck, FileWarning, Scale, 
  Calculator, Plus, Trash2, ArrowRight
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

/**
 * Fix: Declarations moved before use in BP_STEPS to avoid reference error
 */
const Megaphone = ({ size }: { size: number }) => <Target size={size} />; // Fallback icon
const Settings2 = ({ size }: { size: number }) => <Activity size={size} />; // Fallback icon

const BP_STEPS = [
  { id: 0, label: 'SUMÁRIO EXECUTIVO', icon: <Sparkles size={18}/>, desc: 'A visão panorâmica gerada por IA.' },
  { id: 1, label: 'MERCADO & SWOT', icon: <Globe size={18}/>, desc: 'Análise setorial e matriz de competitividade.' },
  { id: 2, label: 'PROPOSTA DE VALOR', icon: <Target size={18}/>, desc: 'Value Proposition e diferenciação Lean.' },
  { id: 3, label: 'MARKETING & TRAÇÃO', icon: <Megaphone size={18}/>, desc: '4Ps, canais e aquisição de clientes.' },
  { id: 4, label: 'OPERAÇÕES & RISCOS', icon: <Settings2 size={18}/>, desc: 'Processos e matriz de mitigação de falhas.' },
  { id: 5, label: 'PLANO FINANCEIRO', icon: <Calculator size={18}/>, desc: 'Cálculo de ROI, Break-Even e Capital.' },
  { id: 6, label: 'FUNDING & ROADMAP', icon: <TrendingUp size={18}/>, desc: 'Investimento e marcos de evolução.' },
];

const BusinessPlanWizard: React.FC<IntegratedWizardProps> = ({ championshipId, teamId, currentRound = 1, onClose }) => {
  const { i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState<Branch>('industrial');
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activePlan, setActivePlan] = useState<BusinessPlan | null>(null);
  const [formData, setFormData] = useState<Record<number, any>>({});
  const [simHistory, setSimHistory] = useState<any[]>([]);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Financial Auto-Calculations
  const financialMetrics = useMemo(() => {
    const data = formData[5] || {};
    const revenue = parseFloat(data.projected_revenue) || 0;
    const fixedCosts = parseFloat(data.fixed_costs) || 0;
    const varCosts = parseFloat(data.variable_costs_unit) || 0;
    const price = parseFloat(data.avg_price) || 1;
    const investment = parseFloat(data.total_investment) || 1;

    const breakEven = fixedCosts / Math.max(0.01, (price - varCosts));
    const roi = ((revenue - (fixedCosts + (breakEven * varCosts)) - investment) / investment) * 100;

    return {
      breakEven: Math.ceil(breakEven),
      roi: roi.toFixed(1),
      margin: (((price - varCosts) / price) * 100).toFixed(1)
    };
  }, [formData]);

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
        await saveBusinessPlan(payload);
        alert(status === 'submitted' ? "PLANO ESTRATÉGICO SUBMETIDO PARA AUDITORIA." : "RASCUNHO SINCRONIZADO.");
    } catch (err: any) {
        alert(`FALHA: ${err.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAISuggest = async (stepIdx: number) => {
    setIsAiLoading(stepIdx);
    const lastKPIs = simHistory.length > 0 ? simHistory[simHistory.length - 1] : null;
    const suggestion = await generateBusinessPlanField(
      BP_STEPS[stepIdx].label, 
      "Plano Estratégico Detalhado", 
      JSON.stringify(formData[stepIdx] || {}), 
      `Gere um texto profissional para a seção ${BP_STEPS[stepIdx].label}. Branch: ${branch}. KPIs Atuais: ${JSON.stringify(lastKPIs)}. Seja específico e use terminologia de mercado (EBITDA, ROI, Market Fit).`, 
      branch
    );
    setFormData(prev => ({ ...prev, [stepIdx]: { ...prev[stepIdx], text: suggestion } }));
    setIsAiLoading(null);
  };

  const handleAudit = async () => {
    const currentText = JSON.stringify(formData[step]);
    if (!currentText) return;
    setIsAuditing(true);
    const result = await auditBusinessPlan(BP_STEPS[step].label, currentText, simHistory[simHistory.length - 1]);
    setAuditResult(result);
    setIsAuditing(false);
  };

  const updateNestedField = (stepIdx: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [stepIdx]: { ...(prev[stepIdx] || {}), [field]: value }
    }));
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
             {isIntegrated ? 'Simulation Business Plan' : 'Independent Strategos Builder'}
           </h1>
           <p className="text-2xl text-slate-400 font-medium italic">
             {isIntegrated ? `Unidade Tática • Ciclo 0${currentRound}` : 'Arquitete sua empresa com IA nível Oracle'}
           </p>
        </header>

        {/* PROGRESS TRACKER */}
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
          <main className="lg:col-span-8 bg-slate-900/50 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl min-h-[800px] flex flex-col relative overflow-hidden print:col-span-12 print:bg-white print:border-0 print:shadow-none print:p-0">
             
             <AnimatePresence mode="wait">
               <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-10 relative z-10 print:hidden">
                  <div className="flex items-center justify-between pb-8 border-b border-white/5">
                     <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{BP_STEPS[step].label}</h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{BP_STEPS[step].desc}</p>
                     </div>
                     <button onClick={() => handleAISuggest(step)} disabled={isAiLoading !== null} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-2xl ${isIntegrated ? 'bg-indigo-600' : 'bg-orange-600'} text-white`}>
                        {isAiLoading === step ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />} Consultar Strategos
                     </button>
                  </div>

                  {/* DINAMIC CONTENT BY STEP */}
                  <div className="space-y-8">
                     {step === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                           <SwotField label="FORÇAS" color="text-emerald-500" value={formData[1]?.strengths} onChange={v => updateNestedField(1, 'strengths', v)} />
                           <SwotField label="FRAQUEZAS" color="text-rose-500" value={formData[1]?.weaknesses} onChange={v => updateNestedField(1, 'weaknesses', v)} />
                           <SwotField label="OPORTUNIDADES" color="text-blue-500" value={formData[1]?.opportunities} onChange={v => updateNestedField(1, 'opportunities', v)} />
                           <SwotField label="AMEAÇAS" color="text-orange-500" value={formData[1]?.threats} onChange={v => updateNestedField(1, 'threats', v)} />
                        </div>
                     )}

                     {step === 5 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/40 p-10 rounded-[3rem] border border-white/5">
                           <FinancialInput label="Faturamento Projetado ($)" value={formData[5]?.projected_revenue} onChange={v => updateNestedField(5, 'projected_revenue', v)} />
                           <FinancialInput label="Custos Fixos Totais ($)" value={formData[5]?.fixed_costs} onChange={v => updateNestedField(5, 'fixed_costs', v)} />
                           <FinancialInput label="Custo Variável Unitário ($)" value={formData[5]?.variable_costs_unit} onChange={v => updateNestedField(5, 'variable_costs_unit', v)} />
                           <FinancialInput label="Preço Médio de Venda ($)" value={formData[5]?.avg_price} onChange={v => updateNestedField(5, 'avg_price', v)} />
                           <FinancialInput label="Investimento Inicial ($)" value={formData[5]?.total_investment} onChange={v => updateNestedField(5, 'total_investment', v)} />
                           
                           <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                              <MetricResult label="Break-Even" val={`${financialMetrics.breakEven} unid`} />
                              <MetricResult label="ROI Projetado" val={`${financialMetrics.roi}%`} />
                              <MetricResult label="Margem de Contrib." val={`${financialMetrics.margin}%`} />
                           </div>
                        </div>
                     )}

                     <textarea 
                        value={formData[step]?.text || ''}
                        onChange={e => updateNestedField(step, 'text', e.target.value)}
                        className="w-full min-h-[300px] p-12 bg-white/5 border border-white/10 rounded-[3.5rem] font-medium text-slate-100 outline-none focus:border-indigo-500/50 transition-all resize-none text-lg shadow-inner custom-scrollbar"
                        placeholder={`Justificativa estratégica para ${BP_STEPS[step].label}...`}
                     />
                  </div>
               </motion.div>
             </AnimatePresence>

             {/* ACTIONS */}
             <div className="pt-12 mt-12 border-t border-white/5 flex items-center justify-between relative z-10 print:hidden">
                <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white disabled:opacity-0 flex items-center gap-3">
                  <ChevronLeft size={16} /> Voltar
                </button>
                <div className="flex gap-4">
                   <button onClick={() => window.print()} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3">
                      <Printer size={16} /> Export PDF
                   </button>
                   <button onClick={() => handleSave('draft')} disabled={isSaving} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-3">
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Trial
                   </button>
                   {step === BP_STEPS.length - 1 ? (
                      <button onClick={() => handleSave(isIntegrated ? 'submitted' : 'finalized')} className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 hover:scale-105 shadow-xl">
                         Finalizar Plano <ChevronRight size={16} />
                      </button>
                   ) : (
                      <button onClick={() => setStep(s => s + 1)} className={`px-16 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 ${isIntegrated ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-white text-slate-950 hover:bg-orange-600 hover:text-white'}`}>
                         Avançar <ChevronRight size={16} />
                      </button>
                   )}
                </div>
             </div>
          </main>

          {/* ASIDE - INSIGHTS & AUDIT */}
          <aside className="lg:col-span-4 space-y-8 print:hidden">
             <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] space-y-8 shadow-2xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><BadgeCheck size={24}/></div>
                   <h3 className="text-xl font-black text-white uppercase italic">Auditoria de Viabilidade</h3>
                </div>

                <div className="p-8 bg-slate-950 rounded-3xl border border-white/5 min-h-[300px] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-125 transition-transform"><ShieldCheck size={100}/></div>
                   {isAuditing ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-indigo-400" size={40} />
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">Deep Reasoning...</span>
                     </div>
                   ) : auditResult ? (
                     <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-2 text-indigo-400">
                           <Star size={12} fill="currentColor"/> <span className="text-[10px] font-black uppercase tracking-widest">Oracle Verdict v6.0</span>
                        </div>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed italic">"{auditResult}"</p>
                     </div>
                   ) : (
                     <div className="space-y-4 text-center py-10 relative z-10">
                        <HelpCircle size={40} className="text-slate-700 mx-auto" />
                        <p className="text-[11px] text-slate-500 font-bold uppercase italic leading-relaxed">
                           Sua estratégia para "{BP_STEPS[step].label}" ainda não foi validada pela IA.
                        </p>
                     </div>
                   )}
                </div>

                <button 
                  onClick={handleAudit} 
                  disabled={!formData[step]?.text || isAuditing}
                  className="w-full py-7 bg-white/5 border border-white/10 hover:bg-white hover:text-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-30 active:scale-95"
                >
                   <Zap size={18} fill="currentColor" /> Auditar Pilar Estratégico
                </button>
             </div>

             <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-10 rounded-[3rem] space-y-6">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Status do Projeto</h4>
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-xs font-bold text-white uppercase">Trial Oracle Ativo</span>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <p className="text-[9px] text-slate-600 uppercase font-black leading-relaxed italic">
                      "Utilize os módulos da Escola de Negócios para aprofundar seu conhecimento em ROI e SWOT antes da submissão final."
                   </p>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const SwotField = ({ label, color, value, onChange }: any) => (
   <div className="space-y-2">
      <label className={`text-[10px] font-black uppercase tracking-widest ${color} italic ml-2`}>{label}</label>
      <textarea 
         value={value || ''}
         onChange={e => onChange(e.target.value)}
         placeholder="..."
         className="w-full h-32 p-6 bg-slate-950 border border-white/5 rounded-2xl text-xs font-bold text-white outline-none focus:border-white/20 transition-all resize-none shadow-inner"
      />
   </div>
);

const FinancialInput = ({ label, value, onChange }: any) => (
   <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">{label}</label>
      <input 
         type="number" 
         value={value || ''}
         onChange={e => onChange(e.target.value)}
         className="w-full p-4 bg-slate-900 border border-white/5 rounded-xl text-lg font-mono font-black text-white outline-none focus:border-indigo-500 transition-all shadow-inner"
      />
   </div>
);

const MetricResult = ({ label, val }: any) => (
   <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
      <span className="block text-[8px] font-black uppercase text-slate-500 mb-1">{label}</span>
      <span className="text-sm font-black text-white italic">{val}</span>
   </div>
);

export default BusinessPlanWizard;
