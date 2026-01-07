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
    <div className="flex flex-col h-[90vh] w-full max-w-[1600px] mx-auto bg-[#020617] rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden font-sans">
      
      {/* HEADER COMPACTO */}
      <header className="px-12 py-8 border-b border-white/5 bg-slate-900/40 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
              <Sliders size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Wizard Gold</h2>
              <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1.5 opacity-80">Oracle Configuration Protocol</p>
           </div>
        </div>
        <div className="flex gap-2">
           {[1, 2, 3, 4, 5, 6].map((s) => (
             <div key={s} className={`w-12 h-1.5 rounded-full transition-all duration-700 ${step === s ? 'bg-orange-600 shadow-[0_0_15px_#f97316]' : step > s ? 'bg-orange-600/30' : 'bg-white/5'}`} />
           ))}
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO COM SCROLL INTELIGENTE */}
      <div className="flex-1 overflow-y-auto p-12 md:px-20 custom-scrollbar bg-slate-950/20">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 max-w-6xl mx-auto">
               <WizardHeader icon={<LayoutGrid size={28}/>} title="Arquitetura de Arena" desc="Escolha o template que definirá as regras fiscais e operacionais." />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-10 rounded-[3.5rem] border-2 transition-all text-left flex flex-col justify-between min-h-[350px] relative group ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white shadow-2xl scale-[1.03]' : 'bg-slate-900/60 border-white/5 hover:border-orange-500/40'}`}>
                       <div className="space-y-6">
                          <h4 className="text-2xl font-black uppercase italic text-white leading-tight">{tpl.name}</h4>
                          <p className={`text-sm leading-relaxed ${selectedTemplate?.id === tpl.id ? 'text-white/80' : 'text-slate-500'}`}>{tpl.description}</p>
                       </div>
                       <div className="mt-8 flex items-center justify-between">
                          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedTemplate?.id === tpl.id ? 'bg-white text-orange-600' : 'bg-white/5 text-slate-500'}`}>Node 08 Blueprint</span>
                          {selectedTemplate?.id === tpl.id && <CheckCircle2 size={24} />}
                       </div>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-5xl mx-auto">
               <WizardHeader icon={<Globe size={28}/>} title="Limites de Nodo" desc="Configure a moeda e as dimensões competitivas da arena." />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 space-y-10">
                    <WizardInput label="Título da Instância" val={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="EX: ALPHA INDUSTRIAL CLUSTER" />
                    <div className="grid grid-cols-2 gap-6">
                       <WizardSelect label="Baseline Monetária" val={formData.currency} onChange={v => setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (BRL)'},{v:'USD',l:'DÓLAR (USD)'},{v:'EUR',l:'EURO (EUR)'}]} />
                       <WizardSelect label="Intelligence Source" val={formData.analysis_source} onChange={v => setFormData({...formData, analysis_source: v as AnalysisSource})} options={[{v:'parameterized',l:'PARAMÉTRICO'},{v:'ai_real_world',l:'REAL-WORLD IA'}]} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <WizardInput label="Regiões" type="number" val={formData.regions_count} onChange={v => setFormData({...formData, regions_count: Number(v)})} />
                       <WizardInput label="Strategists" type="number" val={formData.teams_limit} onChange={v => setFormData({...formData, teams_limit: Number(v)})} />
                       <WizardInput label="AI Bots" type="number" val={formData.bots_count} onChange={v => setFormData({...formData, bots_count: Number(v)})} />
                    </div>
                  </div>
                  <div className="bg-orange-600/5 p-10 rounded-[4rem] border border-orange-500/10 flex flex-col justify-center space-y-10 shadow-inner">
                    <div className="flex items-center gap-4 text-orange-500">
                       <Hourglass size={32} className="animate-pulse"/>
                       <h4 className="font-black text-2xl uppercase italic tracking-tighter">Oracle Round Timer</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <WizardInput label="Valor do Ciclo" type="number" val={formData.deadline_value} onChange={v => setFormData({...formData, deadline_value: Number(v)})} />
                       <WizardSelect label="Unidade Temporal" val={formData.deadline_unit} onChange={v => setFormData({...formData, deadline_unit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'},{v:'weeks',l:'SEMANAS'}]} />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">O processamento será selado automaticamente no final deste período.</p>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-5xl mx-auto">
               <WizardHeader icon={<Scale size={28}/>} title="Governança Oracle" desc="Regras de transparência e eventos sistêmicos." />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8 bg-slate-900/60 p-10 rounded-[4rem] border border-white/5">
                     <WizardSelect label="Fidelidade do Mercado" val={formData.transparency_level} onChange={v => setFormData({...formData, transparency_level: v as TransparencyLevel})} options={[{v:'low',l:'LOW FIDELITY'},{v:'medium',l:'MEDIUM'},{v:'high',l:'HIGH'},{v:'full',l:'FULL ORACLE'}]} />
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Observadores de Arena</label>
                        <div className="relative">
                           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                           <input value={observerSearch} onChange={e => handleSearchObservers(e.target.value)} className="w-full pl-12 pr-6 py-5 bg-slate-950 border border-white/5 rounded-2xl text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner" placeholder="Nickname ou Identidade..." />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                           {formData.observers.map(id => (
                             <div key={id} className="px-4 py-2 bg-orange-600/10 rounded-xl text-[10px] font-black text-orange-500 border border-orange-500/20 flex items-center gap-3">
                                {id.slice(0,8)}... <button onClick={() => setFormData({...formData, observers: formData.observers.filter(o => o !== id)})} className="hover:text-white"><X size={12}/></button>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4 bg-slate-900/40 p-10 rounded-[4rem] border border-white/5 flex flex-col justify-center">
                     <Toggle label="Cisne Negro (Eventos)" active={formData.rules.black_swan_events} onChange={v => setFormData({...formData, rules: {...formData.rules, black_swan_events: v}})} />
                     <Toggle label="Protocolo ESG Ativo" active={formData.rules.esg_enabled} onChange={v => setFormData({...formData, rules: {...formData.rules, esg_enabled: v}})} />
                     <Toggle label="Obsolescência de Ativos" active={formData.rules.obsolescence} onChange={v => setFormData({...formData, rules: {...formData.rules, obsolescence: v}})} />
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-10">
               <WizardHeader icon={<Calculator size={28}/>} title="Auditória Inicial P00" desc="Definição da estrutura de capital conforme CPC 26." />
               <div className="flex-1 bg-slate-950/80 rounded-[4rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                  <div className="flex-1 overflow-x-auto custom-scrollbar p-10">
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

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-4xl mx-auto">
               <WizardHeader icon={<PenTool size={28}/>} title="Plano de Negócios IA" desc="Exija inteligência estratégica para validação de ciclos." />
               <div className="bg-slate-900 p-16 rounded-[5rem] border border-white/5 space-y-12 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                     <div className="space-y-2">
                        <h4 className="text-3xl font-black text-white uppercase italic leading-none">Entrega Obrigatória</h4>
                        <p className="text-slate-500 font-bold uppercase tracking-widest">Travar submissões sem planejamento aprovado.</p>
                     </div>
                     <button onClick={() => setFormData({...formData, bp_enabled: !formData.bp_enabled})} className={`w-20 h-10 rounded-full p-1.5 transition-all flex ${formData.bp_enabled ? 'bg-orange-600 justify-end' : 'bg-slate-800 justify-start'}`}>
                        <div className="w-7 h-7 bg-white rounded-full shadow-lg" />
                     </button>
                  </div>
                  {formData.bp_enabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-12 border-t border-white/5">
                       <WizardSelect label="Ciclo de Auditoria" val={formData.bp_frequency} onChange={v => setFormData({...formData, bp_frequency: Number(v)})} options={[{v:1,l:'CADA CICLO (FULL)'},{v:3,l:'CICLOS ÍMPARES'},{v:6,l:'REVISÃO SEMESTRAL'}]} />
                    </motion.div>
                  )}
                  <Bot className="absolute -bottom-10 -right-10 opacity-[0.03]" size={300} />
               </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 max-w-5xl mx-auto">
               <WizardHeader icon={<ShieldCheck size={28}/>} title="Manifesto Final" desc="Resumo da implantação tática." />
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-7 bg-slate-900 p-12 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl">
                     <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-3"><Users size={16} className="text-orange-500"/> Registro de Unidades</h4>
                     <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                        {teams.map((t, i) => (
                          <div key={i} className="p-6 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-orange-500/30 transition-all">
                             <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${t.is_bot ? 'bg-indigo-600/20 text-indigo-400' : 'bg-orange-600 text-white'}`}>
                                   {t.is_bot ? <Bot size={20}/> : <UserCheck size={20}/>}
                                </div>
                                <span className="font-black text-md text-white uppercase italic">{t.name}</span>
                             </div>
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.is_bot ? 'NODE IA' : 'OPERADOR'}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="lg:col-span-5 bg-orange-600 p-12 rounded-[4rem] text-white flex flex-col justify-center space-y-10 relative overflow-hidden shadow-2xl">
                     <Sparkles className="absolute -bottom-20 -right-20 opacity-10" size={300} />
                     <h4 className="text-4xl font-black uppercase italic leading-none">Pronto para o Despacho</h4>
                     <div className="space-y-4 font-mono">
                        <ReviewLine label="Ramo" val={formData.branch.toUpperCase()} />
                        <ReviewLine label="Rounds" val={formData.total_rounds} />
                        <ReviewLine label="Baseline" val={formData.currency} />
                        <ReviewLine label="Regiões" val={formData.regions_count} />
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER FIXO - STICKY CTA PROTOCOL */}
      <footer className="sticky bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-3xl border-t border-white/10 p-8 px-16 flex justify-between items-center z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.6)]">
         <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="px-12 py-5 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-white disabled:opacity-0 flex items-center gap-4 transition-all">
            <ArrowLeft size={20} /> Voltar
         </button>
         <button onClick={step === 6 ? handleLaunch : () => setStep(s => s + 1)} disabled={isSubmitting} className="px-20 py-6 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(249,115,22,0.4)] flex items-center gap-6 hover:bg-white hover:text-orange-950 transition-all active:scale-95 group">
            {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> Orquestrando Instância...</> : step === 6 ? 'Implantar Arena' : 'Avançar Protocolo'}
            {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
         </button>
      </footer>
    </div>
  );
};

const WizardHeader = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-center gap-6 border-b border-white/5 pb-8">
     <div className="p-4 bg-white/5 rounded-[1.5rem] text-orange-500 shadow-inner flex items-center justify-center">
       {icon}
     </div>
     <div>
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{title}</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{desc}</p>
     </div>
  </div>
);

const WizardInput = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{label}</label>
     <input type={type} value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner placeholder:text-slate-800" placeholder={placeholder} />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{label}</label>
     <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer">
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

const Toggle = ({ label, active, onChange }: any) => (
  <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 transition-all group">
     <span className="text-xs font-black uppercase text-slate-400 group-hover:text-white tracking-widest">{label}</span>
     <button onClick={() => onChange(!active)} className={`w-14 h-7 rounded-full p-1 transition-all flex ${active ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'}`}><div className="w-5 h-5 bg-white rounded-full shadow-lg" /></button>
  </div>
);

const ReviewLine = ({ label, val }: any) => (
  <div className="flex justify-between border-b border-white/10 pb-3">
     <span className="text-[10px] font-black uppercase opacity-60">{label}</span>
     <span className="text-lg font-black italic">{val}</span>
  </div>
);

export default ChampionshipWizard;