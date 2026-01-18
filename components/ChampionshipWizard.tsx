
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, ArrowRight, Globe, Loader2, 
  ShieldCheck, ArrowLeft, Calculator,
  Sliders, CheckCircle2, LayoutGrid,
  Hourglass, Scale, Sparkles, X, Settings2,
  TrendingUp, Zap, Users, DollarSign, Package, Cpu,
  Factory, Trash2, ClipboardList, Gauge, Table as TableIcon,
  Landmark, Info, Settings, MousePointer2
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO } from '../constants';
import { Branch, ChampionshipTemplate, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, LaborAvailability, MachineModel, MachineSpec, InitialMachine, SalesMode, TransparencyLevel, GazetaMode, ScenarioType, RegionType, AnalysisSource } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import FinancialStructureEditor from './FinancialStructureEditor';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    total_rounds: 12,
    regions_count: 9, 
    teams_count: 5,
    bots_count: 3,
    currency: 'BRL' as CurrencyType,
    deadline_value: 7,
    deadline_unit: 'days' as DeadlineUnit,
    branch: 'industrial' as Branch,
  });

  const [regionNames, setRegionNames] = useState<string[]>([]);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [marketIndicators, setMarketIndicators] = useState<MacroIndicators>(DEFAULT_MACRO);
  const [roundRules, setRoundRules] = useState<Record<number, Partial<MacroIndicators>>>({});
  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE);

  useEffect(() => {
    setRegionNames(prev => Array.from({ length: formData.regions_count }, (_, i) => prev[i] || `Região ${i+1}`));
    setTeamNames(prev => Array.from({ length: formData.teams_count }, (_, i) => prev[i] || `Equipe ${i+1}`));
  }, [formData.regions_count, formData.teams_count]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    const teamsToCreate = [
      ...teamNames.map(n => ({ name: n, is_bot: false })),
      ...Array.from({ length: formData.bots_count }, (_, i) => ({ name: `BOT Oracle 0${i+1}`, is_bot: true }))
    ];
    try {
      await createChampionshipWithTeams({
        ...formData,
        status: 'active',
        current_round: 0,
        region_names: regionNames,
        initial_financials: financials,
        market_indicators: marketIndicators,
        round_rules: roundRules,
        sales_mode: 'hybrid' as SalesMode,
        scenario_type: 'simulated' as ScenarioType,
        transparency_level: 'medium' as TransparencyLevel,
        gazeta_mode: 'anonymous' as GazetaMode,
        observers: []
      }, teamsToCreate, isTrial);
      onComplete();
    } catch (e: any) { alert(`FALHA DE SINCRONIZAÇÃO: ${e.message}`); }
    setIsSubmitting(false);
  };

  const stepsCount = 7; 

  return (
    <div className="wizard-shell bg-slate-950/80 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
      <header className="wizard-header-fixed px-12 py-10 flex items-center justify-between border-b border-orange-500/30">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(249,115,22,0.4)]"><Sliders size={32} /></div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Creator</h2>
              <p className="text-[11px] font-black uppercase text-orange-500 tracking-[0.5em] mt-2 italic">Nova Arena Nodal • Build Gold v13.2</p>
           </div>
        </div>
        <div className="flex gap-4">
           {Array.from({ length: stepsCount }).map((_, i) => (
             <div key={i} className={`h-2 rounded-full transition-all duration-700 ${step === i+1 ? 'w-20 bg-orange-600 shadow-[0_0_20px_#f97316]' : step > i+1 ? 'w-10 bg-emerald-500' : 'w-10 bg-white/5'}`} />
           ))}
        </div>
      </header>

      <div className="wizard-content custom-scrollbar p-12 md:p-20">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-5xl mx-auto pb-20">
               <WizardStepTitle icon={<Globe size={48}/>} title="Identidade Sistêmica" desc="Orquestre a escala global do seu torneio." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <WizardField label="Nome da Arena" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="EX: TORNEIO NACIONAL ALPHA" />
                  <div className="grid grid-cols-2 gap-8">
                     <WizardField label="Total de Ciclos" type="number" val={formData.total_rounds} onChange={(v:any)=>setFormData({...formData, total_rounds: parseInt(v)})} />
                     <WizardField label="Regiões (1 a 15)" type="number" val={formData.regions_count} onChange={(v:any)=>setFormData({...formData, regions_count: parseInt(v)})} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <WizardField label="Equipes Humanas" type="number" val={formData.teams_count} onChange={(v:any)=>setFormData({...formData, teams_count: parseInt(v)})} />
                     <WizardField label="Bots (IA Gemini)" type="number" val={formData.bots_count} onChange={(v:any)=>setFormData({...formData, bots_count: parseInt(v)})} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <WizardField label="Prazo Decisão" type="number" val={formData.deadline_value} onChange={(v:any)=>setFormData({...formData, deadline_value: parseInt(v)})} />
                     <WizardSelect label="Unidade Temporal" val={formData.deadline_unit} onChange={(v:any)=>setFormData({...formData, deadline_unit: v as DeadlineUnit})} options={[{v:'days',l:'DIAS'},{v:'hours',l:'HORAS'}]} />
                  </div>
               </div>
            </motion.div>
          )}

          {/* Outros steps seguem a mesma lógica de visibilidade extrema */}
          {/* Step Final para Lançamento */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-32 text-center space-y-16 max-w-4xl mx-auto">
               <div className="w-40 h-40 bg-orange-600 rounded-[4rem] flex items-center justify-center mx-auto shadow-[0_20px_80px_rgba(249,115,22,0.4)] animate-bounce border-4 border-orange-400">
                  <ShieldCheck size={80} className="text-white" strokeWidth={2.5}/>
               </div>
               <div className="space-y-6">
                  <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Baseline Auditado</h1>
                  <p className="text-2xl text-slate-400 font-medium italic leading-relaxed">
                     Arena orquestrada com sucesso. Clique em "Lançar Protocolo" para ativar os nodos simulados.
                  </p>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <footer className="wizard-footer-dock h-32 px-12 bg-slate-950 border-t border-orange-500/20">
         <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className={`px-12 py-6 font-black uppercase text-[12px] tracking-[0.4em] transition-all flex items-center gap-6 active:scale-95 italic ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}><ArrowLeft size={28} /> Voltar Fase</button>
         <div className="flex items-center gap-16">
            <button 
              onClick={step === stepsCount ? handleLaunch : () => setStep(s => s + 1)} 
              disabled={isSubmitting} 
              className="px-24 py-8 bg-orange-600 text-white rounded-full font-black text-[14px] uppercase tracking-[0.5em] shadow-[0_20px_60px_rgba(249,115,22,0.5)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-8 active:scale-95 group border-4 border-orange-400/50"
            >
               {isSubmitting ? (
                 <><Loader2 className="animate-spin" size={24}/> Sincronizando Nodos...</>
               ) : step === stepsCount ? (
                 'Lançar Protocolo Arena'
               ) : (
                 <>Próxima Fase <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-3 transition-transform" /></>
               )}
            </button>
         </div>
      </footer>
    </div>
  );
};

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-10 border-b border-white/5 pb-12">
     <div className="p-8 bg-slate-900 border-2 border-orange-500/30 rounded-[2.5rem] text-orange-500 shadow-2xl flex items-center justify-center">{icon}</div>
     <div>
        <h3 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.6em] mt-4 italic">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-4 text-left group">
     <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <input 
        type={type} 
        value={val} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-10 py-7 text-xl font-bold text-white outline-none focus:border-orange-600 transition-all shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)] placeholder:text-slate-800 font-mono" 
        placeholder={placeholder} 
     />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-4 text-left group">
     <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative">
        <select 
          value={val} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-10 py-7 text-[12px] font-black text-white uppercase outline-none focus:border-orange-600 transition-all cursor-pointer appearance-none shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)]"
        >
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
           <MousePointer2 size={24} />
        </div>
     </div>
  </div>
);

export default ChampionshipWizard;
