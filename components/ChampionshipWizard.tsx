
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Settings, Globe, Loader2, 
  ShieldCheck, ArrowLeft, UserPlus, Calculator,
  Trophy, Factory, ShoppingCart, Briefcase, Tractor,
  Gavel, Sparkles, Sliders, CheckCircle2, LayoutGrid,
  FileText, ShieldAlert, Zap, Flame, Leaf, Eye, EyeOff,
  Users, Clock, Calendar, Hourglass, PenTool, Layout,
  Shield, UserCheck, Landmark, Coins, TrendingUp,
  History, Map, Flag, Cpu, Bot, Coins as CurrencyIcon,
  Scale, FileSearch, AlertCircle, Newspaper, RefreshCw
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE } from '../constants';
import { Branch, ScenarioType, ModalityType, Championship, TransparencyLevel, SalesMode, ChampionshipTemplate, AccountNode, DeadlineUnit, GazetaMode, RegionType, AnalysisSource, CurrencyType } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialStructureEditor from './FinancialStructureEditor';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(CHAMPIONSHIP_TEMPLATES[0] || null);
  
  const [formData, setFormData] = useState({
    name: isTrial ? 'ARENA TESTE MASTER' : '', 
    description: isTrial ? 'Arena de validação tática para o setor selecionado.' : '',
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

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        branch: selectedTemplate.branch,
        description: selectedTemplate.description,
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

    const newTeams = Array.from({ length: total }).map((_, i) => {
      const isBot = i >= humansCount;
      return {
        name: (isBot ? `AI BOT UNIT 0${i - humansCount + 1}` : `EQUIPE STRATEGOS ${String.fromCharCode(65 + i)}`),
        is_bot: isBot
      };
    });
    setTeams(newTeams);
  }, [formData.teams_limit, formData.bots_count]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const champPayload: Partial<Championship> = {
        name: formData.name || 'Simulação Oracle',
        description: formData.description,
        branch: formData.branch,
        status: 'active',
        is_public: true,
        current_round: 0,
        total_rounds: formData.total_rounds,
        regions_count: formData.regions_count,
        bots_count: formData.bots_count,
        region_type: formData.region_type,
        analysis_source: formData.analysis_source,
        initial_share_price: formData.initial_share_price,
        sales_mode: formData.sales_mode,
        scenario_type: formData.scenario_type,
        currency: formData.currency,
        deadline_value: formData.deadline_value,
        deadline_unit: formData.deadline_unit,
        round_frequency_days: formData.round_frequency_days,
        transparency_level: formData.transparency_level,
        gazeta_mode: formData.gazeta_mode,
        observers: formData.observers,
        config: { ...formData, rules: formData.rules },
        initial_financials: financials,
        market_indicators: selectedTemplate?.market_indicators
      };
      
      await createChampionshipWithTeams(champPayload, teams, isTrial);
      onComplete();
    } catch (e: any) { alert(`ERRO NA ORQUESTRAÇÃO: ${e.message}`); }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-[1400px] mx-auto bg-slate-900 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden font-sans">
      
      {/* HEADER - STICKY TOP */}
      <header className="p-8 border-b border-white/5 bg-slate-950/80 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Sliders size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Wizard Gold</h2>
              <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1 italic">
                 Build v13.0 Oracle Parameterization
              </p>
           </div>
        </div>
        <div className="flex gap-3">
           {[1, 2, 3, 4, 5, 6].map((s) => (
             <div key={s} className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-orange-600 shadow-[0_0_12px_#f97316]' : 'bg-white/5'}`} />
           ))}
        </div>
      </header>

      {/* CONTENT AREA - FLEX-1 SCROLLABLE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 bg-slate-900/40">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 max-w-5xl mx-auto">
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <LayoutGrid size={28} className="text-orange-500"/>
                  <h3 className="text-3xl font-black text-white uppercase italic">1. DNA da Arena</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-10 rounded-[3rem] border-2 transition-all text-left relative group flex flex-col justify-between min-h-[280px] ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-orange-500/50'}`}>
                       <div>
                          <h4 className="text-2xl font-black uppercase italic text-white mb-4 leading-tight">{tpl.name}</h4>
                          <p className={`text-sm font-medium leading-relaxed ${selectedTemplate?.id === tpl.id ? 'text-white/80' : 'text-slate-400'}`}>{tpl.description}</p>
                       </div>
                       <div className="mt-8 flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedTemplate?.id === tpl.id ? 'bg-white text-orange-600' : 'bg-white/5 text-slate-500'}`}>Template Node</span>
                          {selectedTemplate?.id === tpl.id && <CheckCircle2 size={20} className="text-white ml-auto" />}
                       </div>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 max-w-5xl mx-auto">
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <Globe size={28} className="text-orange-500"/>
                  <h3 className="text-3xl font-black text-white uppercase italic">2. Protocolos de Escopo & IA</h3>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <WizardField label="Identidade da Arena" icon={<Trophy size={18}/>}>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="wizard-input text-lg" placeholder="NOME DO CAMPEONATO" />
                    </WizardField>

                    <div className="grid grid-cols-2 gap-6">
                       <WizardField label="Moeda Base" icon={<CurrencyIcon size={18}/>}>
                          <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as CurrencyType})} className="wizard-input font-black uppercase">
                             <option value="BRL">BRL (Real R$)</option>
                             <option value="USD">USD (Dólar $)</option>
                             <option value="EUR">EUR (Euro €)</option>
                          </select>
                       </WizardField>
                       <WizardField label="Cérebro da Análise" icon={<Cpu size={18}/>}>
                          <select value={formData.analysis_source} onChange={e => setFormData({...formData, analysis_source: e.target.value as AnalysisSource})} className="wizard-input font-black uppercase">
                             <option value="parameterized">Parametrizado (Tutor)</option>
                             <option value="ai_real_world">Realidade Grounded (IA)</option>
                          </select>
                       </WizardField>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                       <WizardField label="Regiões" icon={<Map size={18}/>}>
                          <input type="number" min={1} max={15} value={formData.regions_count} onChange={e => setFormData({...formData, regions_count: Number(e.target.value)})} className="wizard-input text-center text-xl" />
                       </WizardField>
                       <WizardField label="Limite Equipes" icon={<Users size={18}/>}>
                          <input type="number" min={1} max={50} value={formData.teams_limit} onChange={e => setFormData({...formData, teams_limit: Number(e.target.value)})} className="wizard-input text-center text-xl" />
                       </WizardField>
                       <WizardField label="Competidores Bots" icon={<Bot size={18}/>}>
                          <input type="number" min={0} value={formData.bots_count} onChange={e => setFormData({...formData, bots_count: Number(e.target.value)})} className="wizard-input text-center text-xl text-indigo-400" />
                       </WizardField>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-10 rounded-[3.5rem] border border-white/5 space-y-10">
                    <div className="flex items-center gap-4 text-orange-500">
                       <Hourglass size={24}/>
                       <h4 className="font-black text-xl uppercase italic tracking-widest leading-none">Cronômetro Oracle</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <WizardField label="Valor">
                          <input type="number" value={formData.deadline_value} onChange={e => setFormData({...formData, deadline_value: Number(e.target.value)})} className="wizard-input text-center text-2xl" />
                       </WizardField>
                       <WizardField label="Unidade">
                          <select value={formData.deadline_unit} onChange={e => setFormData({...formData, deadline_unit: e.target.value as DeadlineUnit})} className="wizard-input font-black uppercase text-center">
                             <option value="hours">Horas</option>
                             <option value="days">Dias</option>
                             <option value="weeks">Semanas</option>
                          </select>
                       </WizardField>
                    </div>
                    <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-3xl flex gap-4">
                       <Flag size={20} className="text-blue-500 shrink-0 mt-1" />
                       <div>
                          <span className="block text-[10px] font-black uppercase text-blue-400 mb-1">Impacto Logístico</span>
                          <p className="text-xs text-slate-400 leading-relaxed font-bold">O motor Oracle processará o encerramento do ciclo automaticamente ao final deste tempo.</p>
                       </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 max-w-5xl mx-auto">
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <Scale size={28} className="text-orange-500"/>
                  <h3 className="text-3xl font-black text-white uppercase italic">3. Governança & Visibilidade</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                     <WizardField label="Transparência Corporativa" icon={<Shield size={18}/>}>
                        <div className="grid grid-cols-2 gap-3">
                           {['low', 'medium', 'high', 'full'].map((lvl) => (
                             <button key={lvl} onClick={() => setFormData({...formData, transparency_level: lvl as TransparencyLevel})} className={`p-4 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${formData.transparency_level === lvl ? 'bg-orange-600 border-white text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                                {lvl} Fidelity
                             </button>
                           ))}
                        </div>
                     </WizardField>
                     
                     <WizardField label="Modo Gazeta (Relatório Coletivo)" icon={<Newspaper size={18}/>}>
                        <div className="flex gap-4 p-1.5 bg-slate-950 rounded-2xl border border-white/5">
                           <button onClick={() => setFormData({...formData, gazeta_mode: 'anonymous'})} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all ${formData.gazeta_mode === 'anonymous' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}>
                              Sigiloso (Codinomes)
                           </button>
                           <button onClick={() => setFormData({...formData, gazeta_mode: 'identified'})} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all ${formData.gazeta_mode === 'identified' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}>
                              Exposto (Nomes Reais)
                           </button>
                        </div>
                     </WizardField>
                  </div>

                  <div className="space-y-8 bg-slate-950/60 p-10 rounded-[3.5rem] border border-white/5">
                     <h4 className="font-black text-xl uppercase italic text-white flex items-center gap-3"><Zap size={20} className="text-blue-400" /> Toggles de Arena</h4>
                     <div className="space-y-6">
                        <RulesToggle 
                           label="Cisnes Negros (Eventos IA)" 
                           active={formData.rules.black_swan_events} 
                           onChange={(v) => setFormData({...formData, rules: {...formData.rules, black_swan_events: v}})} 
                           desc="Permite ao motor gerar crises econômicas dinâmicas."
                        />
                        <RulesToggle 
                           label="Regulação ESG Ativa" 
                           active={formData.rules.esg_enabled} 
                           onChange={(v) => setFormData({...formData, rules: {...formData.rules, esg_enabled: v}})} 
                           desc="Impacta market share baseado em práticas sustentáveis."
                        />
                        <RulesToggle 
                           label="Obsolescência de CAPEX" 
                           active={formData.rules.obsolescence} 
                           onChange={(v) => setFormData({...formData, rules: {...formData.rules, obsolescence: v}})} 
                           desc="Maquinário perde eficiência ao longo dos ciclos."
                        />
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && financials && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 h-full flex flex-col overflow-hidden max-w-[1300px] mx-auto">
               <div className="flex items-center justify-between border-b border-white/5 pb-6 shrink-0">
                  <div className="flex items-center gap-4">
                     <Calculator size={28} className="text-blue-500"/>
                     <h3 className="text-3xl font-black text-white uppercase italic">4. Auditória de Estrutura P00</h3>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Currency Baseline</span>
                        <span className="text-lg font-mono font-black text-orange-500">{formData.currency}</span>
                     </div>
                  </div>
               </div>
               
               {/* INTERNAL SCROLL - PARA NÃO PERDER FOOTER */}
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 bg-slate-950/40 rounded-[3rem] p-10 border border-white/5">
                  <FinancialStructureEditor 
                    initialBalance={financials.balance_sheet} 
                    initialDRE={financials.dre} 
                    onChange={(data) => setFinancials(data)} 
                  />
               </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 max-w-5xl mx-auto">
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <PenTool size={28} className="text-orange-500"/>
                  <h3 className="text-3xl font-black text-white uppercase italic">5. Módulo Plano de Negócios</h3>
               </div>
               
               <div className="bg-slate-950/60 p-12 rounded-[4rem] border border-white/5 space-y-12">
                  <div className="flex items-center justify-between">
                     <div className="space-y-2">
                        <h4 className="text-2xl font-black text-white uppercase italic leading-none">Entrega Obrigatória</h4>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Ativação da Auditoria de Visão Estratégica.</p>
                     </div>
                     <button onClick={() => setFormData({...formData, bp_enabled: !formData.bp_enabled})} className={`w-20 h-10 rounded-full p-1.5 transition-all flex ${formData.bp_enabled ? 'bg-orange-600 justify-end' : 'bg-slate-800 justify-start'}`}>
                        <div className="w-7 h-7 bg-white rounded-full shadow-lg" />
                     </button>
                  </div>

                  <AnimatePresence>
                     {formData.bp_enabled && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-10 pt-10 border-t border-white/5">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <WizardField label="Frequência de Atualização" icon={<RefreshCw size={18}/>}>
                                 <select value={formData.bp_frequency} onChange={e => setFormData({...formData, bp_frequency: Number(e.target.value)})} className="wizard-input">
                                    <option value={1}>Todo Ciclo (Crítico)</option>
                                    <option value={3}>A cada 3 Ciclos (Tático)</option>
                                    <option value={6}>Semestral (Estratégico)</option>
                                 </select>
                              </WizardField>
                              <WizardField label="Impacto em TSR" icon={<TrendingUp size={18}/>}>
                                 <div className="p-6 bg-slate-900 rounded-[2rem] flex items-center justify-between border border-white/5">
                                    <span className="text-xs font-black uppercase text-slate-500">Bônus de Nota IA</span>
                                    <span className="text-lg font-black text-emerald-500">+1.5% TSR</span>
                                 </div>
                              </WizardField>
                           </div>
                           <RulesToggle 
                             label="Bloquear Próxima Rodada sem BP" 
                             active={formData.bp_mandatory} 
                             onChange={(v) => setFormData({...formData, bp_mandatory: v})} 
                             desc="Equipes não podem submeter decisões sem um plano de negócios atualizado."
                           />
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-5xl mx-auto pb-10">
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <ShieldCheck size={28} className="text-emerald-500"/>
                  <h3 className="text-3xl font-black text-white uppercase italic">6. Selo de Orquestração</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  <div className="md:col-span-8 space-y-10">
                     <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-8">
                        <h4 className="text-xl font-black uppercase italic text-white flex items-center gap-3">
                           <Users size={20} className="text-orange-500" /> Manifesto de Unidades
                        </h4>
                        <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                           {teams.map((t, i) => (
                             <div key={i} className="p-5 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-orange-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className={`p-2 rounded-xl ${t.is_bot ? 'bg-indigo-600/20 text-indigo-400' : 'bg-orange-600 text-white shadow-lg'}`}>
                                      {t.is_bot ? <Bot size={16}/> : <UserCheck size={16}/>}
                                   </div>
                                   <span className="font-black text-sm uppercase italic text-white">{t.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                   {t.is_bot ? 'Node AI Active' : 'Human Command Ready'}
                                </span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="md:col-span-4 space-y-8">
                     <div className="bg-orange-600 p-10 rounded-[3rem] text-white shadow-2xl space-y-6 relative overflow-hidden group">
                        <Sparkles className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-150 transition-transform duration-1000" size={240} />
                        <h4 className="text-2xl font-black uppercase italic leading-none">Oracle Verdict</h4>
                        <p className="text-sm font-medium opacity-90 leading-relaxed italic">
                           "Arena {formData.name} pronta para implantação. Configuração detectada: {formData.branch.toUpperCase()} Node com {formData.currency} baseline."
                        </p>
                     </div>

                     <div className="p-10 bg-slate-950 border border-white/5 rounded-[3rem] space-y-6">
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                              <span>Sincronização Cloud</span>
                              <span className="text-emerald-500">Pronto</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-full" />
                           </div>
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed text-center">
                           Ao confirmar, as unidades serão geradas e o Periodo 00 será selado.
                        </p>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* STICKY FOOTER - FIXED POSITION ALWAYS VISIBLE */}
      <footer className="p-8 md:px-12 border-t border-white/5 bg-slate-950/90 backdrop-blur-md shrink-0 flex justify-between items-center z-10">
         <button 
           onClick={() => setStep(s => Math.max(1, s - 1))} 
           disabled={step === 1} 
           className="px-10 py-5 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-white disabled:opacity-0 flex items-center gap-3"
         >
            <ArrowLeft size={18} /> Voltar Protocolo
         </button>
         <div className="hidden sm:flex gap-2 items-center opacity-40">
            <AlertCircle size={14} className="text-orange-500" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Build Oracle Gold v13.0 Integrity</span>
         </div>
         <button 
           onClick={step === 6 ? handleLaunch : () => setStep(s => s + 1)} 
           disabled={isSubmitting}
           className="px-14 py-6 bg-orange-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl flex items-center gap-4 hover:bg-white hover:text-orange-950 transition-all active:scale-95 group"
         >
            {isSubmitting ? (
               <><Loader2 className="animate-spin" size={18}/> Processando Nodos...</>
            ) : (
               <>{step === 6 ? 'Confirmar Implantação Master' : 'Próxima Fase Auditada'} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
            )}
         </button>
      </footer>

      <style>{`
        .wizard-input {
          width: 100%;
          padding: 1.25rem;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.08);
          border-radius: 1.5rem;
          color: white;
          font-weight: 800;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .wizard-input:focus { 
          border-color: #f97316; 
          background: rgba(255,255,255,0.1); 
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.15), inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .wizard-input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

const WizardField = ({ label, icon, children }: any) => (
  <div className="space-y-3 group">
     <label className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-3 tracking-[0.2em] group-focus-within:text-orange-500 transition-colors">
        {icon} {label}
     </label>
     {children}
  </div>
);

const RulesToggle = ({ label, active, onChange, desc }: any) => (
  <div className="flex items-center justify-between gap-6 p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-blue-500/30 transition-all">
     <div className="flex-1 space-y-1">
        <span className="block text-sm font-black text-white uppercase tracking-tight">{label}</span>
        <p className="text-[10px] text-slate-500 font-bold leading-tight">{desc}</p>
     </div>
     <button 
       onClick={() => onChange(!active)} 
       className={`w-16 h-8 rounded-full p-1 transition-all flex ${active ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'}`}
     >
        <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
     </button>
  </div>
);

export default ChampionshipWizard;
