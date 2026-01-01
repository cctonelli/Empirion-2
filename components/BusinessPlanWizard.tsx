
import React, { useState } from 'react';
// Fix: Import Info icon to resolve reference error on line 133
import { 
  FileText, Sparkles, ArrowRight, ArrowLeft, Save, 
  CheckCircle2, Download, Loader2, Target, Briefcase, 
  Users, TrendingUp, DollarSign, PenTool, Layout, 
  BarChart3, Globe, ShieldCheck, Zap, Info
} from 'lucide-react';
import { BUSINESS_PLAN_STRUCTURE } from '../constants';
import { Branch, BusinessPlanSection } from '../types';
import { generateBusinessPlanField } from '../services/gemini';

const BusinessPlanWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState<Branch>('industrial');
  const [planName, setPlanName] = useState('Meu Plano de Negócios v1.0');
  const [sections, setSections] = useState<BusinessPlanSection[]>(BUSINESS_PLAN_STRUCTURE);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const currentSection = sections[step];

  const updateField = (sectionIdx: number, fieldId: string, value: any) => {
    const newSections = [...sections];
    const fieldIdx = newSections[sectionIdx].fields.findIndex(f => f.id === fieldId);
    newSections[sectionIdx].fields[fieldIdx].value = value;
    setSections(newSections);
  };

  const handleAiAssist = async (fieldId: string, label: string, prompt: string) => {
    setIsAiLoading(fieldId);
    const userContext = sections[step].fields.find(f => f.id === fieldId)?.value || '';
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
    <div className="max-w-6xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
                <FileText size={24} />
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">AI Business Planner</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg">Modelo SEBRAE Professional + Inteligência Strategos.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={handleExport}
             disabled={isExporting}
             className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center gap-3"
           >
             {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
             Exportar PDF Completo
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-3">
           <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identificação</label>
              <input 
                type="text" 
                value={planName} 
                onChange={e => setPlanName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none focus:border-blue-500 transition-colors"
              />
           </div>

           {sections.map((s, idx) => (
             <button 
               key={s.id}
               onClick={() => setStep(idx)}
               className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all border text-left group ${
                 step === idx 
                   ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-x-2' 
                   : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'
               }`}
             >
                <div className={`p-2 rounded-xl transition-colors ${step === idx ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                   {getSectionIcon(s.id, step === idx)}
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest flex-1">{s.title}</span>
                {idx < step && <CheckCircle2 size={16} className="text-emerald-500" />}
             </button>
           ))}

           <div className="mt-8 p-8 bg-blue-600 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
              <Sparkles className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform" size={150} />
              <div className="relative z-10 space-y-4">
                 <h4 className="text-sm font-black uppercase tracking-widest">AI Strategos Guard</h4>
                 <p className="text-[11px] font-medium opacity-80 leading-relaxed">
                   "Ao preencher o plano financeiro, use o Strategos para calcular o ROI e o Ponto de Equilíbrio automaticamente."
                 </p>
              </div>
           </div>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 min-h-[600px] flex flex-col">
           <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
              <div className="space-y-1">
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{currentSection.title}</h2>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Fase {step + 1} de {sections.length} • Business Architecture</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100">
                 <Zap size={18} className="text-blue-600" />
                 <span className="text-[10px] font-black text-blue-900 uppercase">AI-Assist Active</span>
              </div>
           </div>

           <div className="flex-1 space-y-10">
              {currentSection.fields.map((field) => (
                <div key={field.id} className="space-y-4 animate-in slide-in-from-bottom-2">
                   <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        {field.label}
                        <Info size={14} className="text-slate-300" />
                      </label>
                      {field.aiPrompt && (
                        <button 
                          onClick={() => handleAiAssist(field.id, field.label, field.aiPrompt!)}
                          disabled={!!isAiLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isAiLoading === field.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          Assistência IA
                        </button>
                      )}
                   </div>
                   
                   {field.type === 'textarea' ? (
                     <textarea 
                        value={field.value}
                        onChange={e => updateField(step, field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full min-h-[150px] p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium text-slate-800 focus:ring-8 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all resize-none"
                     />
                   ) : field.type === 'number' ? (
                      <div className="relative">
                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          type="number"
                          value={field.value}
                          onChange={e => updateField(step, field.id, parseFloat(e.target.value))}
                          placeholder={field.placeholder}
                          className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg text-slate-900 outline-none focus:border-blue-600 transition-all"
                        />
                      </div>
                   ) : (
                     <input 
                        type="text"
                        value={field.value}
                        onChange={e => updateField(step, field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-600 transition-all"
                     />
                   )}
                </div>
              ))}
           </div>

           <div className="pt-10 mt-10 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => setStep(prev => Math.max(0, prev - 1))}
                disabled={step === 0}
                className="px-10 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors disabled:opacity-0"
              >
                <div className="flex items-center gap-2"><ArrowLeft size={16} /> Etapa Anterior</div>
              </button>
              
              <div className="flex gap-4">
                 <button className="px-8 py-5 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Save size={16} /> Salvar Rascunho
                 </button>
                 {step < sections.length - 1 ? (
                   <button 
                     onClick={() => setStep(prev => prev + 1)}
                     className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-4 shadow-xl active:scale-95"
                   >
                     Próxima Seção <ArrowRight size={16} />
                   </button>
                 ) : (
                   <button 
                     onClick={handleExport}
                     className="px-12 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-4 shadow-xl active:scale-95"
                   >
                     Finalizar e Baixar PDF <ShieldCheck size={18} />
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const getSectionIcon = (id: string, active: boolean) => {
  const size = 18;
  const color = active ? 'text-white' : 'text-blue-600';
  switch(id) {
    case 'executive_summary': return <PenTool size={size} className={color} />;
    case 'market_analysis': return <Globe size={size} className={color} />;
    case 'marketing_plan': return <Target size={size} className={color} />;
    case 'operational_plan': return <Briefcase size={size} className={color} />;
    case 'financial_plan': return <DollarSign size={size} className={color} />;
    default: return <Layout size={size} className={color} />;
  }
};

export default BusinessPlanWizard;
