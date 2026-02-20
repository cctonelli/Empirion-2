
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
  Calculator, Plus, Trash2, ArrowRight, Table as TableIcon,
  MessageSquare, Heart, Truck, Link, ShoppingCart,
  // Fix: Added missing Lucide icons used in the Canvas and Empathy Map components
  Box, Eye, Trophy
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_PAGE_CONTENT } from '../constants';
import { fetchPageContent, getActiveBusinessPlan, saveBusinessPlan, getTeamSimulationHistory, supabase } from '../services/supabase';
import { generateBusinessPlanField, auditBusinessPlan } from '../services/gemini';
import EmpireParticles from './EmpireParticles';
import { BusinessPlan, Branch, KPIs, BMCBlocks, EmpathyMap } from '../types';

interface IntegratedWizardProps {
  championshipId?: string;
  teamId?: string;
  currentRound?: number;
  onClose?: () => void;
}

const BP_STEPS = [
  { id: 0, label: 'MODELO DE NEGÓCIO (CANVAS)', icon: <LayoutGrid size={18}/>, desc: 'Visual Thinking: A lógica de como sua empresa cria valor.' },
  { id: 1, label: 'MAPA DE EMPATIA', icon: <Heart size={18}/>, desc: 'Entenda o que seu cliente pensa, vê, ouve e sente.' },
  { id: 2, label: 'SUMÁRIO EXECUTIVO (STORY)', icon: <Sparkles size={18}/>, desc: 'A narrativa estratégica do seu império.' },
  { id: 3, label: 'MARKETING & CANAIS', icon: <Truck size={18}/>, desc: 'Como o valor chega ao cliente final.' },
  { id: 4, label: 'OPERAÇÕES & PARCEIROS', icon: <Activity size={18}/>, desc: 'Atividades e recursos chave para a execução.' },
  { id: 5, label: 'PLANO FINANCEIRO', icon: <Calculator size={18}/>, desc: 'Matriz Master de Históricos: ROI, BEP e Solvência.' },
  { id: 6, label: 'ROTEIRO DE INOVAÇÃO', icon: <TrendingUp size={18}/>, desc: 'Epicentros de mudança e próximos passos.' },
];

const BusinessPlanWizard: React.FC<IntegratedWizardProps> = ({ championshipId, teamId, currentRound = 1, onClose }) => {
  const { i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState<Branch>('industrial');
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activePlan, setActivePlan] = useState<BusinessPlan | null>(null);
  const [formData, setFormData] = useState<Record<number, any>>({});
  const [canvasData, setCanvasData] = useState<BMCBlocks>({
    customer_segments: '', value_propositions: '', channels: '', 
    customer_relationships: '', revenue_streams: '', key_resources: '',
    key_activities: '', key_partnerships: '', cost_structure: ''
  });
  const [empathyData, setEmpathyData] = useState<EmpathyMap>({
    think_feel: '', hear: '', see: '', say_do: '', pains: '', gains: ''
  });
  const [epicenter, setEpicenter] = useState<'resource' | 'offer' | 'customer' | 'finance'>('offer');

  const [simHistory, setSimHistory] = useState<any[]>([]);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    const loadBaseData = async () => {
      if (championshipId && teamId) {
        const { data } = await getActiveBusinessPlan(teamId!, currentRound);
        if (data) {
          setActivePlan(data);
          setFormData(data.data?.steps || {});
          if (data.data?.canvas) setCanvasData(data.data.canvas);
          if (data.data?.empathy) setEmpathyData(data.data.empathy);
          if (data.data?.epicenter) setEpicenter(data.data.epicenter);
        }
        const history = await getTeamSimulationHistory(teamId!);
        setSimHistory(history);
      }
    };
    loadBaseData();
  }, [teamId, championshipId, currentRound]);

  const handleSave = async (status: 'draft' | 'submitted' | 'approved' | 'finalized' = 'draft') => {
    setIsSaving(true);
    try {
        const payload: Partial<BusinessPlan> = {
          id: activePlan?.id,
          championship_id: championshipId,
          team_id: teamId,
          round: currentRound,
          version: (activePlan?.version || 0) + 1,
          data: {
            steps: formData,
            canvas: canvasData,
            empathy: empathyData,
            epicenter: epicenter
          },
          status: status,
          visibility: 'private',
          is_template: false,
          shared_with: []
        };
        await saveBusinessPlan(payload);
        if (status === 'submitted') onClose?.();
        alert(status === 'submitted' ? "PLANO DE NEGÓCIOS HISTÓRICO TRANSMITIDO AO TUTOR." : "RASCUNHO ATUALIZADO.");
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
      "Design de Modelo de Negócio", 
      JSON.stringify({ step: formData[stepIdx], canvas: canvasData, empathy: empathyData }), 
      `Com base no framework de Osterwalder, gere uma análise para ${BP_STEPS[stepIdx].label}. Considere o histórico P00-P${currentRound-1}: ${JSON.stringify(simHistory.map(h => ({ round: h.round, kpis: h.kpis })))}. Analise a coesão entre os blocos do canvas.`, 
      branch
    );
    setFormData(prev => ({ ...prev, [stepIdx]: { ...prev[stepIdx], text: suggestion } }));
    setIsAiLoading(null);
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    const result = await auditBusinessPlan(
      BP_STEPS[step].label, 
      JSON.stringify({ text: formData[step]?.text, canvas: canvasData, epicenter }), 
      simHistory
    );
    setAuditResult(result);
    setIsAuditing(false);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden bg-transparent ${!teamId && 'pt-40'} pb-32 font-sans print:bg-white`}>
      <div className="print:hidden"><EmpireParticles /></div>
      
      <div className="container mx-auto px-6 md:px-12 relative z-10 space-y-10">
        <header className="text-center space-y-6 max-w-4xl mx-auto print:hidden">
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex p-5 bg-orange-600 rounded-[2rem] text-white shadow-2xl mb-2">
              <PenTool size={32} />
           </motion.div>
           <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">Strategos <span className="text-orange-500">BMG Edition</span></h1>
           <p className="text-lg text-slate-400 font-medium italic tracking-wide">Inspirado na metodologia de Alexander Osterwalder & Yves Pigneur</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
          <main className="lg:col-span-9 bg-slate-900/80 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-2xl min-h-[900px] flex flex-col print:col-span-12 print:bg-white print:p-0 print:shadow-none">
             
             <AnimatePresence mode="wait">
               <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                     <div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">{BP_STEPS[step].label}</h2>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] italic mt-2">{BP_STEPS[step].desc}</p>
                     </div>
                     <div className="flex gap-3">
                        {step === 0 && (
                           <select 
                              value={epicenter} 
                              onChange={(e) => setEpicenter(e.target.value as any)}
                              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[8px] font-black uppercase tracking-widest text-orange-500 outline-none focus:border-orange-500"
                           >
                              <option value="offer">Foco na Oferta</option>
                              <option value="customer">Foco no Cliente</option>
                              <option value="resource">Foco em Recursos</option>
                              <option value="finance">Foco em Finanças</option>
                           </select>
                        )}
                        <button onClick={() => handleAISuggest(step)} disabled={isAiLoading !== null} className="flex items-center gap-3 px-6 py-3.5 bg-orange-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-orange-950 transition-all shadow-xl active:scale-95">
                           {isAiLoading === step ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />} Consultar Oráculo
                        </button>
                     </div>
                  </div>

                  {/* PASSO 0: VISUAL BUSINESS MODEL CANVAS */}
                  {step === 0 && (
                     <div className="flex-1 grid grid-cols-5 grid-rows-3 gap-3 min-h-[600px] animate-in zoom-in-95 duration-700">
                        {/* Linha 1 */}
                        <CanvasBlock label="Parceiros Chave" icon={<Link size={14}/>} val={canvasData.key_partnerships} onChange={(v: string)=>setCanvasData({...canvasData, key_partnerships:v})} className="row-span-2" />
                        <div className="grid grid-rows-2 gap-3 row-span-2">
                           <CanvasBlock label="Atividades Chave" icon={<Zap size={14}/>} val={canvasData.key_activities} onChange={(v: string)=>setCanvasData({...canvasData, key_activities:v})} />
                           <CanvasBlock label="Recursos Chave" icon={<Box size={14}/>} val={canvasData.key_resources} onChange={(v: string)=>setCanvasData({...canvasData, key_resources:v})} />
                        </div>
                        <CanvasBlock label="Proposta de Valor" icon={<Star size={14}/>} val={canvasData.value_propositions} onChange={(v: string)=>setCanvasData({...canvasData, value_propositions:v})} className="row-span-2 bg-orange-500/10 border-orange-500/30" />
                        <div className="grid grid-rows-2 gap-3 row-span-2">
                           <CanvasBlock label="Relacionamento" icon={<Heart size={14}/>} val={canvasData.customer_relationships} onChange={(v: string)=>setCanvasData({...canvasData, customer_relationships:v})} />
                           <CanvasBlock label="Canais" icon={<Truck size={14}/>} val={canvasData.channels} onChange={(v: string)=>setCanvasData({...canvasData, channels:v})} />
                        </div>
                        <CanvasBlock label="Segmentos de Clientes" icon={<Users size={14}/>} val={canvasData.customer_segments} onChange={(v: string)=>setCanvasData({...canvasData, customer_segments:v})} className="row-span-2" />
                        
                        {/* Linha 3 (Base) */}
                        <CanvasBlock label="Estrutura de Custos" icon={<ArrowDownCircle size={14}/>} val={canvasData.cost_structure} onChange={(v: string)=>setCanvasData({...canvasData, cost_structure:v})} className="col-span-2.5 lg:col-span-2" />
                        <div className="hidden lg:block"></div>
                        <CanvasBlock label="Fontes de Receita" icon={<DollarSign size={14}/>} val={canvasData.revenue_streams} onChange={(v: string)=>setCanvasData({...canvasData, revenue_streams:v})} className="col-span-2.5 lg:col-span-2 bg-emerald-500/10" />
                     </div>
                  )}

                  {/* PASSO 1: MAPA DE EMPATIA */}
                  {step === 1 && (
                     <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-10 duration-700">
                        <EmpathyBox label="O que o cliente VÊ?" icon={<Eye size={18}/>} val={empathyData.see} onChange={(v: string)=>setEmpathyData({...empathyData, see:v})} desc="O ambiente, amigos, o mercado oferece." />
                        <EmpathyBox label="O que o cliente OUVE?" icon={<Activity size={18}/>} val={empathyData.hear} onChange={(v: string)=>setEmpathyData({...empathyData, hear:v})}  desc="O que os influenciadores e chefes dizem." />
                        <EmpathyBox label="O que o cliente PENSA e SENTE?" icon={<Brain size={18}/>} val={empathyData.think_feel} onChange={(v: string)=>setEmpathyData({...empathyData, think_feel:v})} desc="O que realmente conta, suas aspirações." />
                        <EmpathyBox label="O que o cliente DIZ e FAZ?" icon={<MessageSquare size={18}/>} val={empathyData.say_do} onChange={(v: string)=>setEmpathyData({...empathyData, say_do:v})} desc="Atitude em público, comportamento." />
                        <EmpathyBox label="Quais as DORES?" icon={<ShieldAlert size={18}/>} val={empathyData.pains} onChange={(v: string)=>setEmpathyData({...empathyData, pains:v})} desc="Medos, frustrações e obstáculos." color="rose" />
                        <EmpathyBox label="Quais os GANHOS?" icon={<Trophy size={18}/>} val={empathyData.gains} onChange={(v: string)=>setEmpathyData({...empathyData, gains:v})} desc="Desejos, medidas de sucesso." color="emerald" />
                     </div>
                  )}

                  {/* OUTROS PASSOS: TEXTO ARGUMENTATIVO */}
                  {step > 1 && step !== 5 && (
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-4 flex items-center gap-2">
                           <FileText size={12}/> Detalhamento Estratégico do Pilar
                        </label>
                        <textarea 
                           value={formData[step]?.text || ''}
                           onChange={e => setFormData(prev => ({ ...prev, [step]: { ...prev[step], text: e.target.value } }))}
                           className="w-full min-h-[450px] p-10 bg-white/5 border-2 border-white/10 rounded-[3rem] text-lg font-medium text-slate-100 outline-none focus:border-orange-500 transition-all custom-scrollbar resize-none shadow-inner"
                           placeholder="Descreva aqui sua estratégia. Use os insights do Canvas e do Mapa de Empatia para enriquecer o texto..."
                        />
                     </div>
                  )}

                  {/* PASSO 5: MATRIZ FINANCEIRA (Fidelidade v17.5) */}
                  {step === 5 && (
                     <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-center gap-4 text-orange-500">
                           <TableIcon size={24} />
                           <h3 className="text-xl font-black uppercase tracking-tight">Telemetria de KPIs: Série Histórica</h3>
                        </div>
                        <div className="matrix-container h-[500px] overflow-auto border-2 border-white/10 rounded-[3rem] bg-slate-950/80">
                           <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-900 z-50 shadow-xl">
                                 <tr className="text-[9px] font-black uppercase text-slate-400 border-b border-white/10">
                                    <th className="p-6 border-r border-white/5 bg-slate-900 sticky left-0 min-w-[240px]">Indicador Oracle</th>
                                    {simHistory.map((h, i) => (
                                       <th key={i} className={`p-6 border-r border-white/5 text-center min-w-[100px] ${i === 0 ? 'bg-orange-600/10' : ''}`}>
                                          <span className="text-orange-500">P{h.round < 10 ? `0${h.round}` : h.round}</span>
                                       </th>
                                    ))}
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 font-mono text-xs">
                                 <HistoryRow label="ROI (%)" kpi="roi" history={simHistory} suffix="%" />
                                 <HistoryRow label="Break-Even (Unidades)" kpi="bep" history={simHistory} />
                                 <HistoryRow label="Índice de Solvência" kpi="solvency_index" history={simHistory} />
                                 <HistoryRow label="Liquidez Corrente" kpi="liquidity_current" history={simHistory} />
                                 <HistoryRow label="Efeito Tesoura (Gap Dias)" kpi="scissors_effect" history={simHistory} />
                                 <HistoryRow label="Patrimônio Líquido ($)" kpi="equity" history={simHistory} />
                              </tbody>
                           </table>
                        </div>
                        <textarea 
                           value={formData[step]?.text || ''}
                           onChange={e => setFormData(prev => ({ ...prev, [step]: { ...prev[step], text: e.target.value } }))}
                           className="w-full min-h-[200px] p-8 bg-white/5 border-2 border-white/10 rounded-[2.5rem] text-sm font-medium text-slate-300 outline-none focus:border-orange-500 transition-all resize-none shadow-inner"
                           placeholder="Interprete os dados históricos acima conforme a saúde do seu modelo de negócio..."
                        />
                     </div>
                  )}
               </motion.div>
             </AnimatePresence>

             <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center print:hidden">
                <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="flex items-center gap-3 px-8 py-4 text-slate-500 hover:text-white font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-0">
                   <ChevronLeft /> Voltar
                </button>
                <div className="flex gap-3">
                   <button onClick={() => window.print()} className="px-8 py-4 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3 shadow-inner">
                      <Printer size={14} /> PDF Report
                   </button>
                   {step === BP_STEPS.length - 1 ? (
                      <button onClick={() => handleSave('submitted')} className="px-14 py-5 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-orange-400">
                         Transmitir Protocolo
                      </button>
                   ) : (
                      <button onClick={() => setStep(s => s + 1)} className="px-12 py-5 bg-white text-slate-950 rounded-full font-black uppercase text-[9px] tracking-[0.2em] shadow-xl hover:bg-orange-600 hover:text-white transition-all active:scale-95">
                         Próximo Pilar <ChevronRight />
                      </button>
                   )}
                </div>
             </footer>
          </main>

          <aside className="lg:col-span-3 space-y-6 print:hidden">
             <div className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] shadow-2xl space-y-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-xl"><BadgeCheck size={20}/></div>
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Oracle BMG Audit</h3>
                </div>
                <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 relative overflow-hidden min-h-[300px]">
                   <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><History size={60}/></div>
                   {isAuditing ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-4">
                         <Loader2 className="animate-spin text-indigo-400" size={24} />
                         <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 text-center">Analysing Business <br/> Model Integrity...</span>
                      </div>
                   ) : auditResult ? (
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 text-indigo-400"><Star size={10} fill="currentColor"/><span className="text-[9px] font-black uppercase tracking-widest">Temporal Verdict</span></div>
                         <p className="text-xs font-medium text-slate-300 leading-relaxed italic">"{auditResult}"</p>
                      </div>
                   ) : (
                      <div className="text-center py-10 opacity-30 space-y-4">
                         <FileWarning size={32} className="mx-auto" />
                         <p className="text-[8px] font-black uppercase tracking-widest leading-relaxed">Aguardando auditoria lógica baseada no Canvas.</p>
                      </div>
                   )}
                </div>
                <button onClick={handleAudit} disabled={isAuditing} className="w-full py-5 bg-white/5 border border-white/10 hover:bg-white hover:text-slate-950 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                   <Zap size={16} fill="currentColor" /> Auditar Coesão
                </button>
             </div>

             <div className="p-8 bg-slate-900 border border-white/5 rounded-[3rem] space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Info size={12}/> BMG Insights
                </h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase italic leading-loose">
                   "Um modelo de negócio não é fixo. Use a IA para simular epicentros de mudança e pivotar sua estratégia no round subsequente."
                </p>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const CanvasBlock = ({ label, icon, val, onChange, className }: any) => (
  <div className={`p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2 group hover:border-orange-500/40 transition-all ${className}`}>
     <div className="flex items-center gap-2 text-slate-500 group-hover:text-orange-500 transition-colors">
        {icon}
        <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
     </div>
     <textarea 
        value={val} 
        onChange={(e)=>onChange(e.target.value)}
        className="flex-1 bg-transparent text-[10px] font-bold text-white outline-none resize-none custom-scrollbar placeholder:text-slate-700" 
        placeholder="..."
     />
  </div>
);

const EmpathyBox = ({ label, icon, val, onChange, desc, color }: any) => (
  <div className={`p-6 bg-slate-950 rounded-[2rem] border border-white/10 flex flex-col gap-4 group hover:bg-white/5 transition-all ${color === 'rose' ? 'border-rose-500/20' : color === 'emerald' ? 'border-emerald-500/20' : ''}`}>
     <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl bg-white/5 ${color === 'rose' ? 'text-rose-500' : color === 'emerald' ? 'text-emerald-500' : 'text-blue-400'}`}>{icon}</div>
        <div>
           <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
           <span className="text-[8px] font-bold text-slate-600 uppercase italic leading-none">{desc}</span>
        </div>
     </div>
     <textarea 
        value={val} 
        onChange={(e)=>onChange(e.target.value)}
        className="w-full h-32 bg-slate-900 rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner"
        placeholder="Descreva aqui..."
     />
  </div>
);

const HistoryRow = ({ label, kpi, history, suffix = '', isStatement = false }: any) => (
  <tr className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
     <td className="p-4 sticky left-0 bg-slate-950 z-30 border-r border-white/10 font-black text-[9px] text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</td>
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

const ArrowDownCircle = ({ size }: { size: number }) => <ShoppingCart size={size} />;

export default BusinessPlanWizard;
