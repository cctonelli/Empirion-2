
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
  Calculator, Plus, Trash2, ArrowRight, Table as TableIcon
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

const Megaphone = ({ size }: { size: number }) => <Target size={size} />;
const Settings2 = ({ size }: { size: number }) => <Activity size={size} />;

const BP_STEPS = [
  { id: 0, label: 'SUMÁRIO EXECUTIVO', icon: <Sparkles size={18}/>, desc: 'Trends e síntese estratégica baseada em históricos.' },
  { id: 1, label: 'MERCADO & SWOT', icon: <Globe size={18}/>, desc: 'Análise setorial v17.0 e competitividade temporal.' },
  { id: 2, label: 'PROPOSTA DE VALOR', icon: <Target size={18}/>, desc: 'Value Proposition e validação Lean P00-Pn.' },
  { id: 3, label: 'MARKETING & TRAÇÃO', icon: <Megaphone size={18}/>, desc: 'Giro de estoque e prazos médios de venda.' },
  { id: 4, label: 'OPERAÇÕES & RISCOS', icon: <Settings2 size={18}/>, desc: 'Mitigação de riscos e imobilização do PL.' },
  { id: 5, label: 'PLANO FINANCEIRO', icon: <Calculator size={18}/>, desc: 'Matriz Master de Históricos e KPIs Oracle.' },
  { id: 6, label: 'FUNDING & ROADMAP', icon: <TrendingUp size={18}/>, desc: 'Captação e composição do endividamento.' },
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

  useEffect(() => {
    const loadBaseData = async () => {
      if (championshipId && teamId) {
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
  }, [teamId, championshipId, currentRound]);

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
        alert(status === 'submitted' ? "PLANO DE NEGÓCIOS HISTÓRICO TRANSMITIDO." : "RASCUNHO ATUALIZADO.");
    } catch (err: any) {
        alert(`FALHA: ${err.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAISuggest = async (stepIdx: number) => {
    setIsAiLoading(stepIdx);
    const suggestion = await generateBusinessPlanField(
      BP_STEPS[stepIdx].label, 
      "Plano com Análise Histórica", 
      JSON.stringify(formData[stepIdx] || {}), 
      `Gere um texto para ${BP_STEPS[stepIdx].label}. Branch: ${branch}. Histórico P00-P${currentRound-1}: ${JSON.stringify(simHistory.map(h => h.kpis))}. Analise tendências e justifique o round ${currentRound}.`, 
      branch
    );
    setFormData(prev => ({ ...prev, [stepIdx]: { ...prev[stepIdx], text: suggestion } }));
    setIsAiLoading(null);
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    const result = await auditBusinessPlan(BP_STEPS[step].label, JSON.stringify(formData[step]), simHistory);
    setAuditResult(result);
    setIsAuditing(false);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden bg-transparent ${!teamId && 'pt-40'} pb-32 font-sans print:bg-white`}>
      <div className="print:hidden"><EmpireParticles /></div>
      
      <div className="container mx-auto px-6 md:px-16 relative z-10 space-y-12">
        <header className="text-center space-y-6 max-w-4xl mx-auto print:hidden">
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex p-6 bg-orange-600 rounded-[2.5rem] text-white shadow-2xl mb-4">
              <PenTool size={40} />
           </motion.div>
           <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic">Strategos Business Plan</h1>
           <p className="text-2xl text-slate-400 font-medium italic">Fidelidade v17.0 Master Oracle • Histórico Consolidado</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1600px] mx-auto">
          <main className="lg:col-span-9 bg-slate-900/60 backdrop-blur-3xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl min-h-[900px] print:col-span-12 print:bg-white print:p-0 print:shadow-none">
             
             <AnimatePresence mode="wait">
               <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                     <div>
                        <h2 className="text-4xl font-black text-white uppercase italic">{BP_STEPS[step].label}</h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic mt-2">{BP_STEPS[step].desc}</p>
                     </div>
                     <button onClick={() => handleAISuggest(step)} disabled={isAiLoading !== null} className="flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-orange-950 transition-all shadow-xl">
                        {isAiLoading === step ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />} Analisar Tendências IA
                     </button>
                  </div>

                  {/* MATRIZ DE HISTÓRICOS - VISÍVEL NO STEP 5 (FINANCEIRO) */}
                  {step === 5 && (
                     <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4 text-orange-500">
                           <TableIcon size={24} />
                           <h3 className="text-xl font-black uppercase tracking-tight">Telemetria Histórica de KPIs P00-P{currentRound-1}</h3>
                        </div>
                        <div className="matrix-container h-[500px] overflow-auto border-2 border-white/10 rounded-[3rem] bg-slate-950/80">
                           <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-900 z-50 shadow-xl">
                                 <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-white/10">
                                    <th className="p-6 border-r border-white/5 bg-slate-900 sticky left-0 min-w-[220px]">Indicador / Round</th>
                                    {simHistory.map((h, i) => (
                                       <th key={i} className={`p-6 border-r border-white/5 text-center min-w-[100px] ${i === 0 ? 'bg-orange-600/10' : ''}`}>
                                          <span className="text-orange-500">P{h.round < 10 ? `0${h.round}` : h.round}</span>
                                       </th>
                                    ))}
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 font-mono text-xs">
                                 <HistoryRow label="Solvência (Indice)" kpi="solvency_index" history={simHistory} />
                                 <HistoryRow label="NLCDG ($)" kpi="nlcdg" history={simHistory} />
                                 <HistoryRow label="Giro de Estoque" kpi="inventory_turnover" history={simHistory} />
                                 <HistoryRow label="Liquidez Corrente" kpi="liquidity_current" history={simHistory} />
                                 <HistoryRow label="Cobertura Juros (TRIT)" kpi="trit" history={simHistory} />
                                 <HistoryRow label="Efeito Tesoura (PMR-PMP)" kpi="scissors_effect" history={simHistory} />
                                 <HistoryRow label="Imobilização do PL" kpi="equity_immobilization" history={simHistory} />
                                 <HistoryRow label="Cap. Terceiros (%)" kpi="debt_participation_pct" history={simHistory} suffix="%" />
                                 <HistoryRow label="Equity Total ($)" kpi="equity" history={simHistory} />
                                 <HistoryRow label="Lucro Líquido ($)" kpi="net_profit" history={simHistory} isStatement />
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}

                  <div className="space-y-6">
                     <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Argumentação Estratégica</label>
                     <textarea 
                        value={formData[step]?.text || ''}
                        onChange={e => setFormData(prev => ({ ...prev, [step]: { ...prev[step], text: e.target.value } }))}
                        className="w-full min-h-[400px] p-12 bg-white/5 border-2 border-white/10 rounded-[4rem] text-lg font-medium text-slate-100 outline-none focus:border-orange-500 transition-all custom-scrollbar resize-none"
                        placeholder="Insira as justificativas baseadas na performance histórica..."
                     />
                  </div>
               </motion.div>
             </AnimatePresence>

             <footer className="mt-16 pt-10 border-t border-white/5 flex justify-between items-center print:hidden">
                <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="flex items-center gap-3 px-10 py-5 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-0">
                   <ChevronLeft /> Voltar
                </button>
                <div className="flex gap-4">
                   <button onClick={() => window.print()} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3 shadow-inner">
                      <Printer size={16} /> PDF Report
                   </button>
                   {step === BP_STEPS.length - 1 ? (
                      <button onClick={() => handleSave('submitted')} className="px-20 py-6 bg-orange-600 text-white rounded-full font-black uppercase text-sm tracking-[0.4em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                         Finalizar Protocolo
                      </button>
                   ) : (
                      <button onClick={() => setStep(s => s + 1)} className="px-16 py-6 bg-white text-slate-950 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-orange-600 hover:text-white transition-all">
                         Avançar <ChevronRight />
                      </button>
                   )}
                </div>
             </footer>
          </main>

          <aside className="lg:col-span-3 space-y-8 print:hidden">
             <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] shadow-2xl space-y-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 rounded-xl text-white"><BadgeCheck size={24}/></div>
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Oracle Audit</h3>
                </div>
                <div className="p-8 bg-slate-950 rounded-3xl border border-white/5 relative overflow-hidden min-h-[300px]">
                   <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><History size={80}/></div>
                   {isAuditing ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                         <Loader2 className="animate-spin text-indigo-400" size={32} />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Deep Reasoning...</span>
                      </div>
                   ) : auditResult ? (
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 text-indigo-400"><Star size={12} fill="currentColor"/><span className="text-[10px] font-black uppercase tracking-widest">Temporal Verdict</span></div>
                         <p className="text-sm font-medium text-slate-300 leading-relaxed italic">"{auditResult}"</p>
                      </div>
                   ) : (
                      <div className="text-center py-10 opacity-30 space-y-4">
                         <FileWarning size={40} className="mx-auto" />
                         <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Aguardando auditoria do pilar estratégico atual.</p>
                      </div>
                   )}
                </div>
                <button onClick={handleAudit} disabled={!formData[step]?.text || isAuditing} className="w-full py-6 bg-white/5 border border-white/10 hover:bg-white hover:text-slate-950 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                   <Zap size={18} fill="currentColor" /> Auditar Pilar
                </button>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const HistoryRow = ({ label, kpi, history, suffix = '', isStatement = false }: any) => (
  <tr className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
     <td className="p-4 sticky left-0 bg-slate-950 z-30 border-r border-white/10 font-black text-[10px] text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</td>
     {history.map((h: any, i: number) => {
        const val = isStatement ? h.kpis?.statements?.dre?.[kpi] : h.kpis?.[kpi];
        return (
          <td key={i} className="p-4 border-r border-white/5 text-center text-white font-bold">
             {val !== undefined ? `${val.toLocaleString()}${suffix}` : '—'}
          </td>
        );
     })}
  </tr>
);

export default BusinessPlanWizard;
