
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Settings, Globe, Loader2, 
  ShieldCheck, ArrowLeft, UserPlus, Calculator,
  Trophy, Factory, ShoppingCart, Briefcase, Tractor,
  Gavel, Sparkles, Sliders, CheckCircle2, LayoutGrid,
  Zap, Eye, Users, Hourglass, PenTool, 
  Shield, UserCheck, Landmark, TrendingUp, Flag, Cpu, Bot, 
  Coins as CurrencyIcon, Scale, Newspaper, RefreshCw,
  Search, X, AtSign
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE } from '../constants';
import { Branch, ScenarioType, ModalityType, Championship, TransparencyLevel, SalesMode, ChampionshipTemplate, AccountNode, DeadlineUnit, GazetaMode, RegionType, AnalysisSource, CurrencyType, UserProfile } from '../types';
import { createChampionshipWithTeams, searchUsers } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialStructureEditor from './FinancialStructureEditor';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(CHAMPIONSHIP_TEMPLATES[0] || null);
  
  const [formData, setFormData] = useState({
    name: isTrial ? 'ARENA TESTE MASTER' : '', 
    description: isTrial ? 'Arena de validação tática.' : '',
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
  const [isSearching, setIsSearching] = useState(false);

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
    } catch (e: any) { alert(`ERRO NA ORQUESTRAÇÃO: ${e.message}`); }
    setIsSubmitting(false);
  };

  const handleSearchObservers = async (query: string) => {
    setObserverSearch(query);
    if (query.length < 3) return setSearchResults([]);
    setIsSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-[1500px] mx-auto bg-[#020617] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden font-sans">
      
      {/* COMPACT MINIMALIST HEADER */}
      <header className="px-10 py-6 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
           <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sliders size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Wizard Gold</h2>
              <p className="text-[8px] font-black uppercase text-orange-500 tracking-[0.3em] mt-1 opacity-70">Build v13.8 High-Fidelity</p>
           </div>
        </div>
        <div className="flex gap-1.5">
           {[1, 2, 3, 4, 5, 6].map((s) => (
             <div key={s} className={`w-8 h-1 rounded-full transition-all duration-500 ${step === s ? 'bg-orange-600' : step > s ? 'bg-orange-600/30' : 'bg-white/5'}`} />
           ))}
        </div>
      </header>

      {/* FLUID WORKSPACE WITH NO BUREAUCRACY */}
      <div className="flex-1 overflow-y-auto p-8 md:px-12 custom-scrollbar bg-slate-950/40">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto">
               <WizardHeader icon={<LayoutGrid />} title="Blueprint de Arena" desc="Selecione a arquitetura base do seu império." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-8 rounded-[2.5rem] border-2 transition-all text-left group flex flex-col justify-between ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white scale-[1.02] shadow-2xl' : 'bg-slate-900 border-white/5 hover:border-orange-500/50'}`}>
                       <div>
                          <h4 className="text-xl font-black uppercase italic text-white leading-tight">{tpl.name}</h4>
                          <p className={`text-xs mt-3 leading-relaxed line-clamp-2 ${selectedTemplate?.id === tpl.id ? 'text-white/70' : 'text-slate-500'}`}>{tpl.description}</p>
                       </div>
                       <div className="mt-8 flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${selectedTemplate?.id === tpl.id ? 'bg-white text-orange-600' : 'bg-white/5 text-slate-500'}`}>Gold Edition</span>
                          {selectedTemplate?.id === tpl.id && <CheckCircle2 size={18} />}
                       </div>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
               <WizardHeader icon={<Globe />} title="Escopo Baseline" desc="Parametrize os limites físicos e monetários." />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="grid grid-cols-1 gap-6 bg-white/5 p-8 rounded-[3rem] border border-white/5">
                    <WizardInput label="Identificação da Arena" val={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="EX: ALPHA INDUSTRIAL" />
                    <div className="grid grid-cols-2 gap-4">
                       <WizardSelect label="Moeda" val={formData.currency} onChange={v => setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL'},{v:'USD',l:'DÓLAR'},{v:'EUR',l:'EURO'}]} />
                       <WizardSelect label="Análise" val={formData.analysis_source} onChange={v => setFormData({...formData, analysis_source: v as AnalysisSource})} options={[{v:'parameterized',l:'PARAMÉTRICA'},{v:'ai_real_world',l:'IA REAL-WORLD'}]} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <WizardInput label="Regiões" type="number" val={formData.regions_count} onChange={v => setFormData({...formData, regions_count: Number(v)})} />
                       <WizardInput label="Equipes" type="number" val={formData.teams_limit} onChange={v => setFormData({...formData, teams_limit: Number(v)})} />
                       <WizardInput label="Bots" type="number" val={formData.bots_count} onChange={v => setFormData({...formData, bots_count: Number(v)})} />
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 flex flex-col justify-center gap-6">
                    <h4 className="font-black text-xs uppercase italic text-orange-500 flex items-center gap-2"><Hourglass size={14}/> Oracle Round Timer</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <WizardInput label="Duração" type="number" val={formData.deadline_value} onChange={v => setFormData({...formData, deadline_value: Number(v)})} />
                       <WizardSelect label="Unidade" val={formData.deadline_unit} onChange={v => setFormData({...formData, deadline_unit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'},{v:'weeks',l:'SEMANAS'}]} />
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
               <WizardHeader icon={<Scale />} title="Governança" desc="Regras de visibilidade e eventos sistêmicos." />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6 bg-white/5 p-8 rounded-[3rem]">
                     <WizardSelect label="Fidelidade de Mercado" val={formData.transparency_level} onChange={v => setFormData({...formData, transparency_level: v as TransparencyLevel})} options={[{v:'low',l:'LOW'},{v:'medium',l:'MEDIUM'},{v:'high',l:'HIGH'},{v:'full',l:'FULL'}]} />
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500">Observadores</label>
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                           <input value={observerSearch} onChange={e => handleSearchObservers(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-all" placeholder="Buscar por Nickname..." />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                           {formData.observers.map(id => (
                             <div key={id} className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-orange-500 border border-white/5 flex items-center gap-2">
                                {id.slice(0,8)}... <button onClick={() => setFormData({...formData, observers: formData.observers.filter(o => o !== id)})}><X size={10}/></button>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4 bg-slate-900 p-8 rounded-[3rem] border border-white/10">
                     <Toggle label="Cisne Negro" active={formData.rules.black_swan_events} onChange={v => setFormData({...formData, rules: {...formData.rules, black_swan_events: v}})} />
                     <Toggle label="Regulação ESG" active={formData.rules.esg_enabled} onChange={v => setFormData({...formData, rules: {...formData.rules, esg_enabled: v}})} />
                     <Toggle label="Obsolescência" active={formData.rules.obsolescence} onChange={v => setFormData({...formData, rules: {...formData.rules, obsolescence: v}})} />
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-6">
               <WizardHeader icon={<Calculator />} title="Auditória P00" desc="Estrutura de capital inicial (CPC 26)." />
               <div className="flex-1 bg-slate-950/60 rounded-[3rem] border border-white/10 p-2 overflow-hidden flex flex-col shadow-inner">
                  <div className="flex-1 overflow-x-auto custom-scrollbar p-6">
                     <FinancialStructureEditor 
                       initialBalance={financials?.balance_sheet} 
                       initialDRE={financials?.dre} 
                       onChange={setFinancials} 
                     />
                  </div>
               </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto">
               <WizardHeader icon={<PenTool />} title="Business Plan IA" desc="Exigência de planejamento estratégico." />
               <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 space-y-10">
                  <div className="flex items-center justify-between">
                     <div><h4 className="text-xl font-black text-white uppercase italic">Protocolo Obrigatório</h4><p className="text-xs text-slate-500 font-bold uppercase">Travar decisões sem plano entregue.</p></div>
                     <button onClick={() => setFormData({...formData, bp_enabled: !formData.bp_enabled})} className={`w-16 h-8 rounded-full p-1 transition-all flex ${formData.bp_enabled ? 'bg-orange-600 justify-end' : 'bg-slate-800 justify-start'}`}><div className="w-6 h-6 bg-white rounded-full" /></button>
                  </div>
                  {formData.bp_enabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-8 border-t border-white/5">
                       <WizardSelect label="Frequência" val={formData.bp_frequency} onChange={v => setFormData({...formData, bp_frequency: Number(v)})} options={[{v:1,l:'CADA CICLO'},{v:3,l:'CICLOS ÍMPARES'},{v:6,l:'SEMESTRAL'}]} />
                    </motion.div>
                  )}
               </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 max-w-5xl mx-auto">
               <WizardHeader icon={<ShieldCheck />} title="Implantação Final" desc="Manifesto de unidades prontas para orquestração." />
               <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-8 bg-slate-900 p-8 rounded-[3rem] border border-white/10 space-y-6">
                     <h4 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Users size={14}/> Registro de Nodos</h4>
                     <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {teams.map((t, i) => (
                          <div key={i} className="p-5 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${t.is_bot ? 'bg-indigo-600/20 text-indigo-400' : 'bg-orange-600 text-white'}`}>{t.is_bot ? <Bot size={16}/> : <UserCheck size={16}/>}</div>
                                <span className="font-black text-sm text-white uppercase italic">{t.name}</span>
                             </div>
                             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t.is_bot ? 'NODE AI' : 'HUMAN UNIT'}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="md:col-span-4 bg-orange-600 p-8 rounded-[3rem] text-white flex flex-col justify-center space-y-6 relative overflow-hidden">
                     <Sparkles className="absolute -bottom-10 -right-10 opacity-10" size={150} />
                     <h4 className="text-2xl font-black uppercase italic leading-none">Ready for Launch</h4>
                     <p className="text-xs font-medium opacity-80 italic leading-relaxed">Cenário: {formData.branch.toUpperCase()}<br/>Duração: {formData.total_rounds} Ciclos<br/>Moeda: {formData.currency}</p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* STICKY MINIMALIST FOOTER CTAS */}
      <footer className="sticky-wizard-footer flex justify-between items-center shadow-[0_-15px_40px_rgba(0,0,0,0.5)]">
         <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="px-10 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white disabled:opacity-0 flex items-center gap-3 transition-all">
            <ArrowLeft size={16} /> Voltar
         </button>
         <button onClick={step === 6 ? handleLaunch : () => setStep(s => s + 1)} disabled={isSubmitting} className="px-16 py-5 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-4 hover:bg-white hover:text-orange-950 transition-all active:scale-95 group">
            {isSubmitting ? <><Loader2 className="animate-spin" size={16}/> Sincronizando...</> : step === 6 ? 'Implantar Arena' : 'Avançar Protocolo'}
            {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
         </button>
      </footer>
    </div>
  );
};

const WizardHeader = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-5 border-b border-white/5 pb-6">
     <div className="p-3 bg-white/5 rounded-2xl text-orange-500 shadow-inner">{React.cloneElement(icon as React.ReactElement, { size: 24 })}</div>
     <div><h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{title}</h3><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{desc}</p></div>
  </div>
);

const WizardInput = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-1.5">
     <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{label}</label>
     <input type={type} value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner" placeholder={placeholder} />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-1.5">
     <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{label}</label>
     <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer">
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

const Toggle = ({ label, active, onChange }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
     <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">{label}</span>
     <button onClick={() => onChange(!active)} className={`w-12 h-6 rounded-full p-1 transition-all flex ${active ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-lg" /></button>
  </div>
);

export default ChampionshipWizard;
