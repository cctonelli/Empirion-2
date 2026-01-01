
import React, { useState } from 'react';
import { 
  FileText, Sparkles, ArrowRight, ArrowLeft, Save, 
  CheckCircle2, Download, Loader2, Target, Briefcase, 
  Users, TrendingUp, DollarSign, PenTool, Layout, 
  BarChart3, Globe, ShieldCheck, Zap, Info, ChevronRight
} from 'lucide-react';
import { BUSINESS_PLAN_STRUCTURE } from '../constants';
import { Branch, BusinessPlanSection } from '../types';
import { generateBusinessPlanField } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import EmpireParticles from './EmpireParticles';

const SEBRAE_STEPS = [
  { id: 0, label: 'Sumário Executivo', icon: <PenTool size={18} /> },
  { id: 1, label: 'Análise de Mercado', icon: <Globe size={18} /> },
  { id: 2, label: 'Plano de Marketing', icon: <Target size={18} /> },
  { id: 3, label: 'Plano Operacional', icon: <Briefcase size={18} /> },
  { id: 4, label: 'Plano Financeiro', icon: <DollarSign size={18} /> },
  { id: 5, label: 'Cenários & Avaliação', icon: <BarChart3 size={18} /> }
];

const BusinessPlanWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState<Branch>('industrial');
  const [planName, setPlanName] = useState('Meu Império v1.0');
  const [sections, setSections] = useState<BusinessPlanSection[]>(BUSINESS_PLAN_STRUCTURE);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Extend structure for remaining steps if they are placeholders in constants
  const currentSection = sections[step] || { id: 'wip', title: SEBRAE_STEPS[step].label, fields: [] };

  const updateField = (sectionIdx: number, fieldId: string, value: any) => {
    const newSections = [...sections];
    if (!newSections[sectionIdx]) return;
    const fieldIdx = newSections[sectionIdx].fields.findIndex(f => f.id === fieldId);
    if (fieldIdx === -1) return;
    newSections[sectionIdx].fields[fieldIdx].value = value;
    setSections(newSections);
  };

  const handleAiAssist = async (fieldId: string, label: string, prompt: string) => {
    setIsAiLoading(fieldId);
    const userContext = sections[step]?.fields.find(f => f.id === fieldId)?.value || '';
    const aiText = await generateBusinessPlanField(currentSection.title, label, userContext, prompt, branch);
    updateField(step, fieldId, aiText);
    setIsAiLoading(null);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert("Relatório PDF Profissional Gerado com Sucesso! (Demonstração)");
      setIsExporting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent pt-40 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-8 md:px-16 relative z-10 space-y-12">
        {/* Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
           <div className="inline-flex p-4 bg-orange-600 text-white rounded-[2rem] shadow-2xl">
              <PenTool size={32} />
           </div>
           <div className="space-y-2">
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Strategos BP Builder</h1>
              <p className="text-slate-400 font-medium italic">"Transforme sua visão em um documento estratégico auditado pela IA Gemini."</p>
           </div>
        </section>

        {/* Stepper SEBRAE Style */}
        <div className="max-w-5xl mx-auto flex items-center justify-between relative px-4 overflow-x-auto pb-6">
           <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 z-0 hidden md:block"></div>
           {SEBRAE_STEPS.map((s, idx) => (
             <button 
               key={s.id}
               onClick={() => setStep(idx)}
               className="relative z-10 flex flex-col items-center gap-4 group min-w-[120px]"
             >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  step === idx ? 'bg-orange-600 text-white shadow-[0_0_30px_rgba(234,88,12,0.3)] scale-110' : 
                  step > idx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-600 border border-white/10'
                }`}>
                   {step > idx ? <CheckCircle2 size={24} /> : s.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest text-center ${step === idx ? 'text-orange-500' : 'text-slate-500'}`}>
                   {s.label}
                </span>
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-3 space-y-3">
             <div className="p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[3rem] space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome do Império</label>
                   <input 
                     type="text" 
                     value={planName} 
                     onChange={e => setPlanName(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-white outline-none focus:border-orange-500 transition-all"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Setor de Atuação</label>
                   <select 
                     value={branch}
                     onChange={e => setBranch(e.target.value as Branch)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-white outline-none appearance-none"
                   >
                     <option value="industrial">Industrial</option>
                     <option value="commercial">Comercial</option>
                     <option value="services">Serviços</option>
                     <option value="agribusiness">Agronegócio</option>
                   </select>
                </div>
             </div>

             <div className="p-10 bg-gradient-to-tr from-orange-600 to-orange-500 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <Sparkles className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform" size={150} />
                <div className="relative z-10 space-y-4">
                   <h4 className="text-sm font-black uppercase tracking-widest">Status: Rascunho Node</h4>
                   <p className="text-[11px] font-medium opacity-80 leading-relaxed italic">
                     "Este plano será a base para sua primeira rodada de simulação. Capriche no Sumário Executivo."
                   </p>
                </div>
             </div>
          </aside>

          <main className="lg:col-span-9 bg-slate-900/50 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl min-h-[600px] flex flex-col relative overflow-hidden">
             <div className="flex items-center justify-between mb-12 pb-8 border-b border-white/5 relative z-10">
                <div className="space-y-2">
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">{currentSection.title}</h2>
                   <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em]">Business Intelligence Matrix</p>
                </div>
                <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                   <Zap className="text-orange-500" size={18} />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Strategos Guard Active</span>
                </div>
             </div>

             <AnimatePresence mode="wait">
               <motion.div 
                 key={step}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="flex-1 space-y-12 relative z-10"
               >
                  {currentSection.fields.length > 0 ? currentSection.fields.map((field) => (
                    <div key={field.id} className="space-y-6">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            {field.label}
                            <Info size={14} className="text-slate-600" />
                          </label>
                          {field.aiPrompt && (
                            <button 
                              onClick={() => handleAiAssist(field.id, field.label, field.aiPrompt!)}
                              disabled={!!isAiLoading}
                              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600/10 text-orange-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
                            >
                              {isAiLoading === field.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              Gerar via IA
                            </button>
                          )}
                       </div>
                       
                       <textarea 
                          value={field.value}
                          onChange={e => updateField(step, field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full min-h-[180px] p-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-medium text-slate-100 outline-none focus:border-orange-500 focus:bg-white/10 transition-all resize-none shadow-inner"
                       />
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6 opacity-30">
                       <ShieldCheck size={80} />
                       <h3 className="text-xl font-black uppercase tracking-widest">Fase em Construção</h3>
                       <p className="text-sm font-medium">Este módulo está sendo auditado pelo motor SISERV/Bernard.</p>
                    </div>
                  )}
               </motion.div>
             </AnimatePresence>

             <div className="pt-12 mt-12 border-t border-white/5 flex items-center justify-between relative z-10">
                <button 
                  onClick={() => setStep(prev => Math.max(0, prev - 1))}
                  disabled={step === 0}
                  className="px-10 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors disabled:opacity-0 flex items-center gap-3"
                >
                  <ArrowLeft size={16} /> Fase Anterior
                </button>
                
                <div className="flex gap-4">
                   <button className="px-10 py-5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all flex items-center gap-3">
                      <Save size={16} /> Sincronizar Rascunho
                   </button>
                   {step < SEBRAE_STEPS.length - 1 ? (
                     <button 
                       onClick={() => setStep(prev => prev + 1)}
                       className="px-14 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center gap-4 shadow-xl shadow-white/5"
                     >
                       Próxima Fase <ArrowRight size={16} />
                     </button>
                   ) : (
                     <button 
                       onClick={handleExport}
                       className="px-14 py-5 bg-orange-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center gap-4 shadow-xl"
                     >
                       Gerar Plano Final <ShieldCheck size={18} />
                     </button>
                   )}
                </div>
             </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanWizard;
