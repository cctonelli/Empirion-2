import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Globe, Loader2, 
  ShieldCheck, ArrowLeft, Calculator,
  Sliders, CheckCircle2, LayoutGrid,
  Hourglass, PenTool, 
  UserCheck, Scale, Search, X, Bot, Sparkles, Users
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE } from '../constants';
import { Branch, ScenarioType, ModalityType, TransparencyLevel, SalesMode, ChampionshipTemplate, AccountNode, DeadlineUnit, GazetaMode, RegionType, AnalysisSource, CurrencyType, UserProfile } from '../types';
import { createChampionshipWithTeams, searchUsers } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialStructureEditor from './FinancialStructureEditor';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(CHAMPIONSHIP_TEMPLATES[0] || null);
  
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
    round_frequency_days: 7, 
    bp_enabled: true,
    bp_frequency: 3,
    bp_mandatory: false,
    rules: {
      esg_enabled: false,
      inflation_active: true,
      black_swan_events: true,
      community_voting: false,
      obsolescence: true
    }
  });

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE);
  const [teams, setTeams] = useState<{ name: string, is_bot?: boolean }[]>([]);
  
  const [observerSearch, setObserverSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        branch: selectedTemplate.branch,
        modality_type: selectedTemplate.config.modality_type,
        sales_mode: selectedTemplate.config.sales_mode,
        scenario_type: selectedTemplate.config.scenario_type,
        region_type: selectedTemplate.config.region_type || 'mixed',
        analysis_source: selectedTemplate.config.analysis_source || 'parameterized',
        transparency_level: selectedTemplate.config.transparency_level,
        gazeta_mode: selectedTemplate.config.gazeta_mode || 'anonymous',
        deadline_value: selectedTemplate.config.deadline_value,
        deadline_unit: selectedTemplate.config.deadline_unit,
        round_frequency_days: selectedTemplate.config.round_frequency_days,
        total_rounds: selectedTemplate.config.total_rounds,
        regions_count: selectedTemplate.config.regions_count || 9,
        bots_count: selectedTemplate.config.bots_count || 1,
        teams_limit: selectedTemplate.config.teams_limit || 4
      }));
      setFinancials(selectedTemplate.initial_financials || INITIAL_FINANCIAL_TREE);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    const total = formData.teams_limit;
    const botsCount = Math.min(formData.bots_count, total);
    const humansCount = total - botsCount;
    const newTeams = Array.from({ length: total }).map((_, i) => ({
      name: (i >= humansCount ? `AI BOT UNIT 0${i - humansCount + 1}` : `EQUIPE STRATEGOS ${String.fromCharCode(65 + i)}`),
      is_bot: i >= humansCount
    }));
    setTeams(newTeams);
  }, [formData.teams_limit, formData.bots_count]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      await createChampionshipWithTeams({
        ...formData,
        status: 'active',
        is_public: true,
        current_round: 0,
        initial_financials: financials,
        market_indicators: selectedTemplate?.market_indicators
      }, teams, isTrial);
      onComplete();
    } catch (e: any) { alert(`ERRO NA SINCRONIZAÇÃO: ${e.message}`); }
    setIsSubmitting(false);
  };

  const handleSearchObservers = async (query: string) => {
    setObserverSearch(query);
    if (query.length < 3) return;
    const results = await searchUsers(query);
    setSearchResults(results);
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-[1500px] mx-auto bg-slate-950 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden font-sans relative">
      
      {/* HEADER FIXO NO TOPO DO CONTAINER */}
      <header className="px-12 py-6 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-5">
           <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
              <Sliders size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Wizard Gold</h2>
              <p className="text-[8px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1 opacity-70">Build v14.2 Command Dock</p>
           </div>
        </div>
        <div className="flex gap-1.5">
           {[1, 2, 3, 4, 5, 6].map((s) => (
             <div key={s} className={`w-10 h-1 rounded-full transition-all duration-700 ${step === s ? 'bg-orange-600 shadow-[0_0_15px_#f97316]' : step > s ? 'bg-orange-600/30' : 'bg-white/5'}`} />
           ))}
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO COM SCROLL INDEPENDENTE */}
      <div className="flex-1 overflow-y-auto p-12 md:px-20 custom-scrollbar bg-slate-900/20 pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto">
               <WizardHeader icon={<LayoutGrid size={24}/>} title="Arquitetura de Arena" desc="Escolha o blueprint operacional do seu império." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between min-h-[200px] ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white shadow-2xl scale-[1.02]' : 'bg-slate-900/60 border-white/5 hover:border-orange-500/40'}`}>
                       <div className="space-y-3">
                          <h4 className="text-lg font-black uppercase italic text-white leading-tight">{tpl.name}</h4>
                          <p className={`text-xs leading-relaxed line-clamp-2 ${selectedTemplate?.id === tpl.id ? 'text-white/70' : 'text-slate-500'}`}>{tpl.description}</p>
                       </div>
                       <div className="mt-6 flex items-center justify-between">
                          <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${selectedTemplate?.id === tpl.id ? 'bg-white text-orange-600' : 'bg-white/5 text-slate-500'}`}>Node 08 Gold</span>
                          {selectedTemplate?.id === tpl.id && <CheckCircle2 size={20} />}
                       </div>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-4xl mx-auto pb-10">
               <WizardHeader icon={<Globe size={24}/>} title="Baseline Monetária" desc="Configuração de capital e limites geográficos." />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-6">
                    <WizardInput label="Identificação da Arena" val={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="EX: CLUSTER INDUSTRIAL ALPHA" />
                    <div className="grid grid-cols-2 gap-4">
                       <WizardSelect label="Moeda Base" val={formData.currency} onChange={v => setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (BRL)'},{v:'USD',l:'DÓLAR (USD)'}]} />
                       <WizardSelect label="Intelligence" val={formData.analysis_source} onChange={v => setFormData({...formData, analysis_source: v as AnalysisSource})} options={[{v:'parameterized',l:'PARAMÉTRICA'},{v:'ai_real_world',l:'REAL-WORLD'}]} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <WizardInput label="Regiões" type="number" val={formData.regions_count} onChange={v => setFormData({...formData, regions_count: Number(v)})} />
                       <WizardInput label="Equipes" type="number" val={formData.teams_limit} onChange={v => setFormData({...formData, teams_limit: Number(v)})} />
                       <WizardInput label="AI Bots" type="number" val={formData.bots_count} onChange={v => setFormData({...formData, bots_count: Number(v)})} />
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 flex flex-col justify-center space-y-8 shadow-2xl">
                    <div className="flex items-center gap-4 text-orange-500">
                       <Hourglass size={24} className="animate-pulse" />
                       <h4 className="font-black text-sm uppercase tracking-widest italic">Oracle Round Timer</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <WizardInput label="Duração" type="number" val={formData.deadline_value} onChange={v => setFormData({...formData, deadline_value: Number(v)})} />
                       <WizardSelect label="Unidade" val={formData.deadline_unit} onChange={v => setFormData({...formData, deadline_unit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-6">
               <WizardHeader icon={<Calculator size={24}/>} title="Auditória Inicial P00" desc="Estrutura de capital conforme CPC 26." />
               <div className="flex-1 erp-table-container">
                  <div className="flex-1 horizontal-scroll-container p-8">
                     <div className="min-w-[900px]">
                        <FinancialStructureEditor 
                          initialBalance={financials?.balance_sheet} 
                          initialDRE={financials?.dre} 
                          onChange={setFinancials} 
                        />
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {(step === 3 || step === 5 || step === 6) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-4xl mx-auto text-center pb-10">
               <WizardHeader icon={<Scale size={24}/>} title="Governança Oracle" desc="Protocolos de transparência e implantação." />
               <div className="bg-slate-900/60 p-16 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                  <Sparkles size={64} className="text-orange-600 mx-auto animate-pulse" />
                  <h3 className="text-3xl font-black text-white uppercase italic">SincronizaçãoBaseline v14.2</h3>
                  <p className="text-lg text-slate-400 font-medium italic max-w-2xl mx-auto">"Arena configurada. Protocolos de auditoria e contingência ativados."</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER FIXO (COMMAND DOCK) - SEMPRE VISÍVEL NA BASE DO CONTAINER */}
      <footer className="sticky-wizard-footer">
         <button 
           onClick={() => setStep(s => Math.max(1, s-1))} 
           disabled={step === 1} 
           className={`px-10 py-5 font-black uppercase text-[11px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${step === 1 ? 'text-slate-800 opacity-20 cursor-not-allowed' : 'text-slate-500 hover:text-white'}`}
         >
            <ArrowLeft size={20} /> Voltar
         </button>
         
         <div className="flex items-center gap-8">
            <div className="flex flex-col items-end hidden md:flex">
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Node Sync</span>
               <span className="text-[8px] font-bold text-slate-600 uppercase">Protocolo {step} de 6</span>
            </div>
            <button 
              onClick={step === 6 ? handleLaunch : () => setStep(s => s + 1)} 
              disabled={isSubmitting} 
              className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 active:scale-95 group"
            >
               {isSubmitting ? (
                 <><Loader2 className="animate-spin" size={20}/> Processando...</>
               ) : step === 6 ? (
                 'Implantar Live Arena'
               ) : (
                 <>Avançar Protocolo <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
               )}
            </button>
         </div>
      </footer>
    </div>
  );
};

const WizardHeader = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-center gap-6 border-b border-white/5 pb-8">
     <div className="p-4 bg-white/5 rounded-2xl text-orange-500 shadow-inner flex items-center justify-center">
       {icon}
     </div>
     <div className="space-y-1">
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{desc}</p>
     </div>
  </div>
);

const WizardInput = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{label}</label>
     <input type={type} value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner placeholder:text-slate-800" placeholder={placeholder} />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{label}</label>
     <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer">
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

export default ChampionshipWizard;