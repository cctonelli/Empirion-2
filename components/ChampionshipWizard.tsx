
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Settings, Globe, Loader2, 
  ShieldCheck, ArrowLeft, UserPlus, Calculator,
  Trophy, Factory, ShoppingCart, Briefcase, Tractor,
  Gavel, Sparkles, Sliders, CheckCircle2, LayoutGrid,
  FileText, ShieldAlert, Zap, Flame, Leaf, Eye, EyeOff,
  Users, Clock, Calendar, Hourglass, PenTool, Layout,
  Shield, UserCheck
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES } from '../constants';
import { Branch, ScenarioType, ModalityType, Championship, TransparencyLevel, SalesMode, ChampionshipTemplate, AccountNode, DeadlineUnit, GazetaMode } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialStructureEditor from './FinancialStructureEditor';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(CHAMPIONSHIP_TEMPLATES[0] || null);
  
  const [formData, setFormData] = useState({
    name: isTrial ? 'ARENA TESTE GRÁTIS' : '', 
    branch: 'industrial' as Branch,
    sales_mode: 'hybrid' as SalesMode,
    scenario_type: 'simulated' as ScenarioType,
    modality_type: 'standard' as ModalityType,
    transparency_level: 'medium' as TransparencyLevel,
    gazeta_mode: 'anonymous' as GazetaMode,
    observers: [] as string[],
    observerInput: '',
    total_rounds: 12,
    teams_limit: 8,
    currency: 'BRL',
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

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(null);
  const [teams, setTeams] = useState<{ name: string }[]>([]);

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        branch: selectedTemplate.branch,
        modality_type: selectedTemplate.config.modality_type,
        sales_mode: selectedTemplate.config.sales_mode,
        scenario_type: selectedTemplate.config.scenario_type,
        transparency_level: selectedTemplate.config.transparency_level,
        gazeta_mode: selectedTemplate.config.gazeta_mode || 'anonymous',
        deadline_value: selectedTemplate.config.deadline_value,
        deadline_unit: selectedTemplate.config.deadline_unit,
        round_frequency_days: selectedTemplate.config.round_frequency_days
      }));
      setFinancials(selectedTemplate.initial_financials);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    const currentCount = teams.length;
    if (currentCount !== formData.teams_limit) {
      const newTeams = Array.from({ length: formData.teams_limit }).map((_, i) => ({
        name: teams[i]?.name || `Equipe ${String.fromCharCode(65 + i)}` 
      }));
      setTeams(newTeams);
    }
  }, [formData.teams_limit]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const champPayload: Partial<Championship> = {
        name: formData.name || (isTrial ? 'ARENA TESTE' : 'Simulação Oracle'),
        branch: formData.branch,
        status: 'active',
        is_public: true,
        current_round: 0,
        total_rounds: formData.total_rounds,
        sales_mode: formData.sales_mode,
        scenario_type: formData.scenario_type,
        currency: formData.currency as any,
        deadline_value: formData.deadline_value,
        deadline_unit: formData.deadline_unit,
        round_frequency_days: formData.round_frequency_days,
        transparency_level: formData.transparency_level,
        gazeta_mode: formData.gazeta_mode,
        observers: formData.observers,
        config: {
           ...formData,
           rules: formData.rules
        } as any,
        initial_financials: financials,
        market_indicators: selectedTemplate?.market_indicators
      };
      
      await createChampionshipWithTeams(champPayload, teams, isTrial);
      onComplete();
    } catch (e: any) { 
      alert(`FALHA NA ORQUESTRAÇÃO: ${e.message}`); 
    }
    setIsSubmitting(false);
  };

  const addObserver = () => {
    if (formData.observerInput.trim() && !formData.observers.includes(formData.observerInput)) {
      setFormData({
        ...formData,
        observers: [...formData.observers, formData.observerInput.trim()],
        observerInput: ''
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-slate-900 rounded-[4rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden">
      <header className="p-10 border-b border-white/5 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
              <Sliders size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Strategos Wizard Gold</h2>
              <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1 italic">
                 {isTrial ? 'Sandbox Mode • Parametrização Completa' : 'Oracle Production Node'}
              </p>
           </div>
        </div>
        <div className="flex gap-4">
           {[1, 2, 3, 4, 5, 6].map((s) => (
             <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/5'}`} />
           ))}
        </div>
      </header>

      <div className="p-12 min-h-[600px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
               <h3 className="text-xl font-black text-white uppercase italic">1. Matriz de Atividade</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-8 rounded-[3rem] border transition-all text-left ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-orange-500/50'}`}>
                       <h4 className="text-xl font-black uppercase italic text-white">{tpl.name}</h4>
                       <p className="text-xs text-slate-400 mt-2">{tpl.description}</p>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg"><Settings size={20}/></div>
                  <h3 className="text-xl font-black text-white uppercase italic">2. Arena & Protocolos Temporais</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Trophy size={12}/> Nome da Arena</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Users size={12}/> Limite de Equipes</label>
                      <input type="number" value={formData.teams_limit} onChange={e => setFormData({...formData, teams_limit: Number(e.target.value)})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all font-mono" />
                    </div>
                  </div>

                  <div className="p-8 bg-orange-600/5 border border-orange-500/20 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Clock size={80}/></div>
                    <div className="space-y-1">
                       <h4 className="text-orange-500 font-black text-xs uppercase tracking-widest flex items-center gap-2"><Hourglass size={14}/> Cronômetro de Rodada</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-500 uppercase">Valor</label>
                          <input type="number" min="1" value={formData.deadline_value} onChange={e => setFormData({...formData, deadline_value: Number(e.target.value)})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-xl text-white font-mono font-bold outline-none focus:border-orange-500" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-500 uppercase">Unidade</label>
                          <select value={formData.deadline_unit} onChange={e => setFormData({...formData, deadline_unit: e.target.value as DeadlineUnit})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-orange-500 appearance-none">
                             <option value="hours">Horas</option>
                             <option value="days">Dias</option>
                          </select>
                       </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg"><Shield size={20}/></div>
                  <h3 className="text-xl font-black text-white uppercase italic">3. Protocolos de Transparência</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">Identidade na Gazeta</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                             onClick={() => setFormData({...formData, gazeta_mode: 'anonymous'})}
                             className={`p-5 rounded-2xl border transition-all text-left space-y-2 ${formData.gazeta_mode === 'anonymous' ? 'bg-emerald-600 border-white text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                           >
                              <div className="flex justify-between items-center">
                                <EyeOff size={16} />
                                {formData.gazeta_mode === 'anonymous' && <CheckCircle2 size={14} />}
                              </div>
                              <span className="block text-[10px] font-black uppercase">Anônimo</span>
                           </button>
                           <button 
                             onClick={() => setFormData({...formData, gazeta_mode: 'identified'})}
                             className={`p-5 rounded-2xl border transition-all text-left space-y-2 ${formData.gazeta_mode === 'identified' ? 'bg-emerald-600 border-white text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                           >
                              <div className="flex justify-between items-center">
                                <UserCheck size={16} />
                                {formData.gazeta_mode === 'identified' && <CheckCircle2 size={14} />}
                              </div>
                              <span className="block text-[10px] font-black uppercase">Identificado</span>
                           </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Nominar Observadores (ID/Email)</label>
                        <div className="flex gap-2">
                           <input 
                             value={formData.observerInput} 
                             onChange={e => setFormData({...formData, observerInput: e.target.value})}
                             placeholder="Ex: tutor@empirion.ia"
                             className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-emerald-500"
                           />
                           <button onClick={addObserver} className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-500 transition-all"><Plus size={20}/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {formData.observers.map(obs => (
                             <span key={obs} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-emerald-400 flex items-center gap-2">
                               {obs} <button onClick={() => setFormData({...formData, observers: formData.observers.filter(o => o !== obs)})} className="text-rose-500">×</button>
                             </span>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-emerald-600/5 border border-emerald-500/20 rounded-[2.5rem] space-y-4">
                     <h4 className="text-emerald-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Sparkles size={14}/> Oracle Rule</h4>
                     <p className="text-xs text-slate-400 leading-relaxed italic">
                        O modo anônimo protege a marca das equipes em fases iniciais de treinamento. Observadores nominados têm acesso read-only completo a todos os balanços independentemente do nível de transparência pública.
                     </p>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && financials && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <FinancialStructureEditor 
                 initialBalance={financials.balance_sheet} 
                 initialDRE={financials.dre} 
                 onChange={(data) => setFinancials(data)} 
               />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><PenTool size={20}/></div>
                  <h3 className="text-xl font-black text-white uppercase italic">5. Plano de Negócios Progressivo</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`p-10 rounded-[3rem] border-2 transition-all ${formData.bp_enabled ? 'border-indigo-600 bg-indigo-600/10' : 'border-white/5 bg-white/5 opacity-50'}`}>
                     <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-black text-white uppercase italic">Ativar Módulo BP</h4>
                        <button 
                          onClick={() => setFormData({...formData, bp_enabled: !formData.bp_enabled})}
                          className={`w-12 h-6 rounded-full transition-all relative ${formData.bp_enabled ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.bp_enabled ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase">Frequência de Submissão (Ciclos)</label>
                           <input type="number" min="1" value={formData.bp_frequency} onChange={e => setFormData({...formData, bp_frequency: Number(e.target.value)})} className="w-full p-4 bg-slate-950 border border-white/10 rounded-xl text-white font-mono" />
                        </div>
                        <div className="flex items-center gap-3">
                           <input type="checkbox" checked={formData.bp_mandatory} onChange={e => setFormData({...formData, bp_mandatory: e.target.checked})} className="w-5 h-5 rounded bg-slate-950 border-white/10 accent-indigo-500" />
                           <span className="text-xs font-bold text-slate-400 uppercase">Entrega Obrigatória para Avançar</span>
                        </div>
                     </div>
                  </div>

                  <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                     <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14}/> Simulation Data Fill</h4>
                     <p className="text-sm text-slate-400 leading-relaxed italic">
                        O motor Empirion preencherá automaticamente as seções financeiras do BP com o histórico das jogadas de cada equipe, forçando a análise SWOT baseada na concorrência real.
                     </p>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <h3 className="text-xl font-black text-white uppercase italic">6. Matriz de Competidores</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {teams.map((t, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                       <span className="text-[8px] font-black text-slate-500 uppercase">Unidade 0{i+1}</span>
                       <input value={t.name} onChange={e => { const nt = [...teams]; nt[i].name = e.target.value; setTeams(nt); }} className="w-full bg-transparent border-none outline-none text-white font-black text-xs uppercase" />
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="p-10 border-t border-white/5 bg-slate-950/50 flex justify-between">
         <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-8 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Voltar</button>
         <button onClick={step === 6 ? handleLaunch : () => setStep(s => s + 1)} className="px-14 py-5 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-4 hover:bg-white hover:text-orange-600 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : step === 6 ? 'Ativar Arena Master' : 'Próximo Protocolo'} <ArrowRight size={18} />
         </button>
      </footer>
    </div>
  );
};

export default ChampionshipWizard;
