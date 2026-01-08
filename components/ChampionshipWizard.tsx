
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, ArrowRight, Globe, Loader2, 
  ShieldCheck, ArrowLeft, Calculator,
  Sliders, CheckCircle2, LayoutGrid,
  Hourglass, Scale, Sparkles, X
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
  const contentRef = useRef<HTMLDivElement>(null);
  
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
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="wizard-shell">
      <header className="wizard-header-fixed px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
           <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-xl">
              <Sliders size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Wizard Gold</h2>
              <p className="text-[8px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1 opacity-70">Build v15.1 Oracle Ergonomics</p>
           </div>
        </div>
        <div className="flex gap-1.5">
           {[1, 2, 3, 4, 5, 6].map((s) => (
             <div key={s} className={`w-10 h-1 rounded-full transition-all duration-700 ${step === s ? 'bg-orange-600 shadow-[0_0_15px_#f97316]' : step > s ? 'bg-orange-600/30' : 'bg-white/5'}`} />
           ))}
        </div>
      </header>

      <div ref={contentRef} className="wizard-content">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto">
               <WizardStepTitle icon={<LayoutGrid size={24}/>} title="Arquitetura de Arena" desc="Escolha o blueprint base para sua simulação." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between min-h-[200px] ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white shadow-2xl scale-[1.02]' : 'bg-slate-900/60 border-white/5 hover:border-orange-500/40'}`}>
                       <div>
                          <h4 className="text-lg font-black uppercase italic text-white leading-tight">{tpl.name}</h4>
                          <p className={`text-xs mt-3 leading-relaxed line-clamp-3 ${selectedTemplate?.id === tpl.id ? 'text-white/70' : 'text-slate-500'}`}>{tpl.description}</p>
                       </div>
                       <div className="mt-8 flex items-center justify-between">
                          <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${selectedTemplate?.id === tpl.id ? 'bg-white text-orange-600' : 'bg-white/5 text-slate-500'}`}>Node Sync Oracle</span>
                          {selectedTemplate?.id === tpl.id && <CheckCircle2 size={20} />}
                       </div>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-4xl mx-auto">
               <WizardStepTitle icon={<Globe size={24}/>} title="Baseline Monetária" desc="Parametrização de capital e fluxos de mercado." />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-inner">
                    <WizardField label="Identificação da Arena" val={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="EX: CLUSTER INDUSTRIAL ALPHA" />
                    <div className="grid grid-cols-2 gap-4">
                       <WizardSelect label="Moeda Base" val={formData.currency} onChange={v => setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (BRL)'},{v:'USD',l:'DÓLAR (USD)'}]} />
                       <WizardField label="Nº de Regiões" type="number" val={formData.regions_count} onChange={v => setFormData({...formData, regions_count: Number(v)})} />
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 flex flex-col justify-center space-y-8 shadow-2xl">
                    <div className="flex items-center gap-4 text-orange-500">
                       <Hourglass size={24} className="animate-pulse" />
                       <h4 className="font-black text-sm uppercase tracking-widest italic">Ciclo de Decisão</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <WizardField label="Duração" type="number" val={formData.deadline_value} onChange={v => setFormData({...formData, deadline_value: Number(v)})} />
                       <WizardSelect label="Unidade" val={formData.deadline_unit} onChange={v => setFormData({...formData, deadline_unit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed italic">O processamento será selado automaticamente após o prazo.</p>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
               <WizardStepTitle icon={<Calculator size={24}/>} title="Auditória P00" desc="Estrutura de balanço inicial conforme CPC 26." />
               <div className="matrix-container p-6 bg-slate-950/60 shadow-inner">
                  <div className="min-w-[900px]">
                    <FinancialStructureEditor 
                      initialBalance={financials?.balance_sheet} 
                      initialDRE={financials?.dre} 
                      onChange={setFinancials} 
                    />
                  </div>
               </div>
            </motion.div>
          )}

          {(step === 3 || step === 5 || step === 6) && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-4xl mx-auto text-center py-20">
               <WizardStepTitle icon={<Scale size={24}/>} title="Governança de Implantação" desc="Última etapa antes do despacho para a rede." />
               <div className="bg-slate-900/60 p-16 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                  <Sparkles size={64} className="text-orange-600 mx-auto animate-pulse" />
                  <h3 className="text-3xl font-black text-white uppercase italic leading-none">Baseline v15.1 Sincronizado</h3>
                  <p className="text-lg text-slate-400 font-medium italic max-w-2xl mx-auto">"Arena estrategicamente mapeada. O motor Oracle está pronto para processar o Ciclo 1."</p>
                  <div className="flex items-center justify-center gap-4 text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Link de Dados Estável
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="wizard-footer-dock">
         <button 
           onClick={() => setStep(s => Math.max(1, s-1))} 
           disabled={step === 1} 
           className={`px-10 py-5 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
         >
            <ArrowLeft size={20} /> Voltar
         </button>
         
         <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:block">Protocolo {step}/6</span>
            <button 
              onClick={step === 6 ? handleLaunch : () => setStep(s => s + 1)} 
              disabled={isSubmitting} 
              className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 group"
            >
               {isSubmitting ? (
                 <><Loader2 className="animate-spin" size={20}/> Sincronizando...</>
               ) : step === 6 ? (
                 'Implantar Arena Live'
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
  <div className="flex items-center gap-6 border-b border-white/5 pb-10 mb-10">
     <div className="p-4 bg-white/5 rounded-2xl text-orange-500 shadow-inner flex items-center justify-center border border-white/5">{icon}</div>
     <div>
        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-2 text-left">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">{label}</label>
     <input type={type} value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner placeholder:text-slate-800" placeholder={placeholder} />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-2 text-left">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">{label}</label>
     <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer">
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

export default ChampionshipWizard;
