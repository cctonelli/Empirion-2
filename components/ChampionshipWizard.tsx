
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Settings, Globe, Loader2, 
  ShieldCheck, ArrowLeft, UserPlus, Calculator,
  Trophy, Factory, ShoppingCart, Briefcase, Tractor,
  Gavel, Sparkles, Sliders, CheckCircle2, LayoutGrid,
  FileText, ShieldAlert, Zap, Flame, Leaf, Eye, EyeOff,
  Users, Clock, Calendar, Hourglass
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES } from '../constants';
import { Branch, ScenarioType, ModalityType, Championship, TransparencyLevel, SalesMode, ChampionshipTemplate, AccountNode, DeadlineUnit } from '../types';
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
    salesMode: 'hybrid' as SalesMode,
    scenarioType: 'simulated' as ScenarioType,
    modalityType: 'standard' as ModalityType,
    transparency: 'medium' as TransparencyLevel,
    totalRounds: 12,
    teamsLimit: 8,
    currency: 'BRL',
    deadlineValue: 7,
    deadlineUnit: 'days' as DeadlineUnit,
    roundFrequencyDays: 7, // Mantido para compatibilidade legado
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
        modalityType: selectedTemplate.config.modalityType || 'standard',
        salesMode: selectedTemplate.config.salesMode || 'hybrid',
        scenarioType: selectedTemplate.config.scenarioType || 'simulated',
        transparency: selectedTemplate.config.transparencyLevel || 'medium',
        deadlineValue: selectedTemplate.config.deadlineValue || 7,
        deadlineUnit: selectedTemplate.config.deadlineUnit || 'days'
      }));
      setFinancials(selectedTemplate.initial_financials);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    const currentCount = teams.length;
    if (currentCount !== formData.teamsLimit) {
      const newTeams = Array.from({ length: formData.teamsLimit }).map((_, i) => ({
        name: teams[i]?.name || `Equipe ${String.fromCharCode(65 + i)}` 
      }));
      setTeams(newTeams);
    }
  }, [formData.teamsLimit]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const champPayload: Partial<Championship> = {
        name: formData.name || (isTrial ? 'ARENA TESTE' : 'Simulação Oracle'),
        branch: formData.branch,
        status: 'active',
        is_public: true,
        current_round: 0,
        total_rounds: formData.totalRounds,
        sales_mode: formData.salesMode,
        scenario_type: formData.scenarioType,
        currency: formData.currency as any,
        deadline_value: formData.deadlineValue,
        deadline_unit: formData.deadlineUnit,
        round_frequency_days: formData.roundFrequencyDays,
        transparency_level: formData.transparency,
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
           {[1, 2, 3, 4, 5].map((s) => (
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
                  <h3 className="text-xl font-black text-white uppercase italic">2. Configuração da Arena e Protocolos Temporais</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Identidade */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Trophy size={12}/> Nome Identificador da Arena</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all font-bold" placeholder="Ex: Arena Bernard v5.0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Users size={12}/> Limite de Equipes</label>
                      <input type="number" value={formData.teamsLimit} onChange={e => setFormData({...formData, teamsLimit: Number(e.target.value)})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all font-mono" />
                    </div>
                  </div>

                  {/* Gestão do Cronômetro (NOVO) */}
                  <div className="p-8 bg-orange-600/5 border border-orange-500/20 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Clock size={80}/></div>
                    <div className="space-y-1">
                       <h4 className="text-orange-500 font-black text-xs uppercase tracking-widest flex items-center gap-2"><Hourglass size={14}/> Cronômetro de Rodada</h4>
                       <p className="text-[9px] text-slate-500 uppercase font-bold">Defina o prazo limite para transmissão das decisões.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-500 uppercase">Valor</label>
                          <input 
                            type="number" 
                            min="1"
                            value={formData.deadlineValue} 
                            onChange={e => setFormData({...formData, deadlineValue: Number(e.target.value)})} 
                            className="w-full p-4 bg-slate-950 border border-white/10 rounded-xl text-white font-mono font-bold outline-none focus:border-orange-500" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-500 uppercase">Unidade</label>
                          <select 
                            value={formData.deadlineUnit} 
                            onChange={e => setFormData({...formData, deadlineUnit: e.target.value as DeadlineUnit})}
                            className="w-full p-4 bg-slate-950 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-orange-500 appearance-none"
                          >
                             <option value="hours">Horas</option>
                             <option value="days">Dias</option>
                             <option value="weeks">Semanas</option>
                             <option value="months">Meses</option>
                          </select>
                       </div>
                    </div>
                    
                    <div className="pt-4 flex items-center gap-3">
                       <div className="p-2 bg-orange-600 rounded-lg text-white"><Zap size={12}/></div>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">
                          O Oráculo aplicará o prazo de {formData.deadlineValue} {formData.deadlineUnit === 'hours' ? 'horas' : formData.deadlineUnit === 'days' ? 'dias' : formData.deadlineUnit === 'weeks' ? 'semanas' : 'meses'} por ciclo.
                       </span>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && financials && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase italic">3. Estrutura Financeira (Fidelidade Bernard)</h3>
                  <div className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-500/20">Modo Editor Ativo</div>
               </div>
               <FinancialStructureEditor 
                 initialBalance={financials.balance_sheet} 
                 initialDRE={financials.dre} 
                 onChange={(data) => setFinancials(data)} 
               />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
               <h3 className="text-xl font-black text-white uppercase italic">4. Protocolos de Simulação</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <RuleToggle 
                    label="ESG & Sustentabilidade" desc="Sua imagem afeta diretamente a demanda regional." 
                    active={formData.rules.esg_enabled} 
                    onClick={() => setFormData({...formData, rules: {...formData.rules, esg_enabled: !formData.rules.esg_enabled}})} 
                    icon={<Leaf />} 
                  />
                  <RuleToggle 
                    label="Cisne Negro (Gemini AI)" desc="Crises e eventos de mercado gerados via IA." 
                    active={formData.rules.black_swan_events} 
                    onClick={() => setFormData({...formData, rules: {...formData.rules, black_swan_events: !formData.rules.black_swan_events}})} 
                    icon={<Flame />} 
                  />
                  <RuleToggle 
                    label="Voto da Comunidade" desc="Observadores influenciam o ranking TSR." 
                    active={formData.rules.community_voting} 
                    onClick={() => setFormData({...formData, rules: {...formData.rules, community_voting: !formData.rules.community_voting}})} 
                    icon={<Users />} 
                  />
                  <RuleToggle 
                    label="Inflação Composta" desc="Ajuste automático de preços MP A e B." 
                    active={formData.rules.inflation_active} 
                    onClick={() => setFormData({...formData, rules: {...formData.rules, inflation_active: !formData.rules.inflation_active}})} 
                    icon={<Zap />} 
                  />
               </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <h3 className="text-xl font-black text-white uppercase italic">5. Matriz de Competidores</h3>
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
         <button onClick={step === 5 ? handleLaunch : () => setStep(s => s + 1)} className="px-14 py-5 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-4 hover:bg-white hover:text-orange-600 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : step === 5 ? 'Ativar Arena Master' : 'Próximo Protocolo'} <ArrowRight size={18} />
         </button>
      </footer>
    </div>
  );
};

const RuleToggle = ({ label, desc, active, onClick, icon }: any) => (
  <button onClick={onClick} className={`p-8 rounded-[2.5rem] border text-left transition-all flex gap-6 ${active ? 'bg-orange-600/10 border-orange-500 shadow-lg' : 'bg-white/5 border-white/10 opacity-60'}`}>
     <div className={`p-4 rounded-2xl h-fit ${active ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{icon}</div>
     <div className="space-y-2">
        <h4 className={`text-lg font-black uppercase italic ${active ? 'text-white' : 'text-slate-400'}`}>{label}</h4>
        <p className="text-xs text-slate-500 font-medium">{desc}</p>
        <div className="flex items-center gap-2 mt-2">
           {active ? <CheckCircle2 size={12} className="text-orange-500" /> : <ShieldAlert size={12} />}
           <span className="text-[8px] font-black uppercase tracking-widest">{active ? 'Ativo' : 'Desativado'}</span>
        </div>
     </div>
  </button>
);

export default ChampionshipWizard;
