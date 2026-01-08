import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, ArrowRight, Globe, Loader2, 
  ShieldCheck, ArrowLeft, Calculator,
  Sliders, CheckCircle2, LayoutGrid,
  Hourglass, Scale, Sparkles, X, Settings2
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE } from '../constants';
import { Branch, ScenarioType, ModalityType, TransparencyLevel, SalesMode, ChampionshipTemplate, AccountNode, DeadlineUnit, GazetaMode, RegionType, AnalysisSource, CurrencyType } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialStructureEditor from './FinancialStructureEditor';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(CHAMPIONSHIP_TEMPLATES[0] || null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: isTrial ? 'ARENA ALPHA MASTER' : '', 
    description: isTrial ? 'Sessão de validação de alta performance.' : '',
    branch: 'industrial' as Branch,
    sales_mode: 'hybrid' as SalesMode,
    scenario_type: 'simulated' as ScenarioType,
    region_type: 'mixed' as RegionType,
    analysis_source: 'parameterized' as AnalysisSource,
    modality_type: 'standard' as ModalityType,
    transparency_level: 'medium' as TransparencyLevel,
    gazeta_mode: 'anonymous' as GazetaMode,
    observers: [] as string[],
    total_rounds: 12,
    regions_count: 9, 
    bots_count: 1,
    initial_share_price: DEFAULT_INITIAL_SHARE_PRICE,
    teams_limit: 4,
    currency: 'BRL' as CurrencyType,
    deadline_value: 7,
    deadline_unit: 'days' as DeadlineUnit,
  });

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        branch: selectedTemplate.branch,
        modality_type: selectedTemplate.config.modality_type,
        sales_mode: selectedTemplate.config.sales_mode,
        total_rounds: selectedTemplate.config.total_rounds,
        regions_count: selectedTemplate.config.regions_count || 9,
      }));
      setFinancials(selectedTemplate.initial_financials || INITIAL_FINANCIAL_TREE);
    }
  }, [selectedTemplate]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      await createChampionshipWithTeams({
        ...formData,
        status: 'active',
        is_public: true,
        current_round: 0,
        initial_financials: financials,
      }, [], isTrial);
      onComplete();
    } catch (e: any) { alert(`ERRO NA SINCRONIZAÇÃO: ${e.message}`); }
    setIsSubmitting(false);
  };

  const stepsCount = 6;

  return (
    <div className="wizard-shell">
      {/* HEADER - FIXED */}
      <header className="wizard-header-fixed px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
              <Sliders size={22} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Wizard</h2>
              <p className="text-[9px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1.5 opacity-80">Orquestração v15.2 GOLD</p>
           </div>
        </div>
        <div className="flex gap-2">
           {Array.from({ length: stepsCount }).map((_, i) => (
             <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step === i+1 ? 'w-12 bg-orange-600 shadow-[0_0_15px_#f97316]' : step > i+1 ? 'w-6 bg-orange-600/40' : 'w-6 bg-white/5'}`} />
           ))}
        </div>
      </header>

      {/* CONTENT - SCROLLABLE */}
      <div ref={scrollRef} className="wizard-content">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<LayoutGrid size={28}/>} title="Arquitetura de Arena" desc="Escolha o blueprint base para sua simulação." />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button 
                      key={tpl.id} 
                      onClick={() => setSelectedTemplate(tpl)} 
                      className={`p-10 rounded-[3.5rem] border-2 transition-all text-left flex flex-col justify-between min-h-[240px] group ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white shadow-2xl scale-[1.02]' : 'bg-slate-900/60 border-white/5 hover:border-orange-500/40'}`}
                    >
                       <div>
                          <h4 className="text-xl font-black uppercase italic text-white leading-tight group-hover:translate-x-1 transition-transform">{tpl.name}</h4>
                          <p className={`text-xs mt-4 leading-relaxed line-clamp-3 font-medium ${selectedTemplate?.id === tpl.id ? 'text-white/80' : 'text-slate-500'}`}>{tpl.description}</p>
                       </div>
                       <div className="mt-10 flex items-center justify-between">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${selectedTemplate?.id === tpl.id ? 'bg-white text-orange-600' : 'bg-white/5 text-slate-500'}`}>Template Oracle</span>
                          {selectedTemplate?.id === tpl.id && <CheckCircle2 size={24} />}
                       </div>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-5xl mx-auto pb-20">
               <WizardStepTitle icon={<Globe size={28}/>} title="Configurações Base" desc="Parametrização de capital e fluxos de mercado." />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="glass-card p-10 space-y-8">
                    <WizardField label="Nome da Arena" val={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} placeholder="EX: CLUSTER INDUSTRIAL ALPHA" />
                    <div className="grid grid-cols-2 gap-6">
                       <WizardSelect label="Moeda" val={formData.currency} onChange={(v: string) => setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (BRL)'},{v:'USD',l:'DÓLAR (USD)'}]} />
                       <WizardField label="Regiões" type="number" val={formData.regions_count} onChange={(v: string) => setFormData({...formData, regions_count: Number(v)})} />
                    </div>
                  </div>
                  <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 flex flex-col justify-center space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><Hourglass size={120} /></div>
                    <div className="flex items-center gap-4 text-orange-500 relative z-10">
                       <Hourglass size={28} className="animate-pulse" />
                       <h4 className="font-black text-lg uppercase tracking-widest italic">Ciclo de Decisão</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6 relative z-10">
                       <WizardField label="Duração" type="number" val={formData.deadline_value} onChange={(v: string) => setFormData({...formData, deadline_value: Number(v)})} />
                       <WizardSelect label="Unidade" val={formData.deadline_unit} onChange={(v: string) => setFormData({...formData, deadline_unit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center italic relative z-10">Processamento automático após o prazo.</p>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
               <WizardStepTitle icon={<Calculator size={28}/>} title="Estrutura P00" desc="Balanço Inicial auditado (CPC 26)." />
               <div className="bg-slate-950/60 p-2 md:p-8 rounded-[4rem] border border-white/5">
                  <FinancialStructureEditor 
                    initialBalance={financials?.balance_sheet} 
                    initialDRE={financials?.dre} 
                    onChange={setFinancials} 
                  />
               </div>
            </motion.div>
          )}

          {(step === 3 || step === 5 || step === 6) && (
            <motion.div key="finish" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 max-w-4xl mx-auto text-center py-24 pb-20">
               <WizardStepTitle icon={<ShieldCheck size={28}/>} title="Validação Final" desc="Pronto para despacho para a rede Oracle." />
               <div className="bg-slate-900/60 p-20 rounded-[5rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <Sparkles size={80} className="text-orange-600 mx-auto animate-pulse" />
                  <div className="space-y-4 relative z-10">
                     <h3 className="text-4xl font-black text-white uppercase italic leading-none">Baseline v15.2 Ready</h3>
                     <p className="text-xl text-slate-400 font-medium italic max-w-2xl mx-auto leading-relaxed">"Arena estratégica mapeada e auditada. O engine de turnover industrial está em standby para o Ciclo 1."</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-emerald-500 font-black text-[11px] uppercase tracking-[0.5em] relative z-10 pt-6">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Link de Dados Estável
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER - FIXED */}
      <footer className="wizard-footer-dock">
         <button 
           onClick={() => setStep(s => Math.max(1, s-1))} 
           disabled={step === 1} 
           className={`px-10 py-5 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
         >
            <ArrowLeft size={20} /> Voltar
         </button>
         
         <div className="flex items-center gap-10">
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocolo Strategos</span>
               <span className="text-[11px] font-black text-slate-400 uppercase italic">Fase {step} de {stepsCount}</span>
            </div>
            <button 
              onClick={step === stepsCount ? handleLaunch : () => setStep(s => s + 1)} 
              disabled={isSubmitting} 
              className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 active:scale-95 group"
            >
               {isSubmitting ? (
                 <><Loader2 className="animate-spin" size={20}/> Sincronizando...</>
               ) : step === stepsCount ? (
                 'Implantar Arena Master'
               ) : (
                 <>Avançar Protocolo <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
               )}
            </button>
         </div>
      </footer>
    </div>
  );
};

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-12">
     <div className="p-5 bg-white/5 rounded-[1.75rem] text-orange-500 shadow-inner flex items-center justify-center border border-white/5">{icon}</div>
     <div>
        <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">{label}</label>
     <input 
       type={type} 
       value={val} 
       onChange={e => onChange(e.target.value)} 
       className="w-full bg-slate-950 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner placeholder:text-slate-800" 
       placeholder={placeholder} 
     />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors">{label}</label>
     <div className="relative">
       <select 
         value={val} 
         onChange={e => onChange(e.target.value)} 
         className="w-full bg-slate-950 border border-white/10 rounded-2xl px-8 py-5 text-[10px] font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none"
       >
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
       </select>
       <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <Settings2 size={16} />
       </div>
     </div>
  </div>
);

export default ChampionshipWizard;