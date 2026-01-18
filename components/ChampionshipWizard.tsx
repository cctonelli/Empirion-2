
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, ArrowRight, Globe, Loader2, 
  ShieldCheck, ArrowLeft, Calculator,
  Sliders, CheckCircle2, LayoutGrid,
  Hourglass, Scale, Sparkles, X, Settings2,
  TrendingUp, Zap, Users, DollarSign, Package, Cpu,
  Factory, Trash2, ClipboardList, Gauge, Table as TableIcon,
  // Fix: Added missing Landmark icon import
  Landmark
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO } from '../constants';
import { Branch, ChampionshipTemplate, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, LaborAvailability, MachineModel, MachineSpec, InitialMachine, SalesMode, TransparencyLevel, GazetaMode, ScenarioType, RegionType, AnalysisSource } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialStructureEditor from './FinancialStructureEditor';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChampionshipTemplate | null>(CHAMPIONSHIP_TEMPLATES[0] || null);
  const [activeRoundEdit, setActiveRoundEdit] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    total_rounds: 8,
    regions_count: 4, 
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

  // Sync arrays 1 to N
  useEffect(() => {
    setRegionNames(prev => Array.from({ length: formData.regions_count }, (_, i) => prev[i] || `Região ${i+1}`));
    setTeamNames(prev => Array.from({ length: formData.teams_count }, (_, i) => prev[i] || `Equipe ${i+1}`));
  }, [formData.regions_count, formData.teams_count]);

  const updateRoundRule = (round: number, field: string, value: any) => {
    setRoundRules(prev => ({
      ...prev,
      [round]: { ...prev[round], [field]: value }
    }));
  };

  const handleLaunch = async () => {
    setIsSubmitting(true);
    const teamsToCreate = [
      ...teamNames.map(n => ({ name: n, is_bot: false })),
      ...Array.from({ length: formData.bots_count }, (_, i) => ({ name: `BOT Node ${i+1}`, is_bot: true }))
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
    } catch (e: any) { alert(`ERRO NA SINCRONIZAÇÃO: ${e.message}`); }
    setIsSubmitting(false);
  };

  const stepsCount = 8; 

  return (
    <div className="wizard-shell">
      <header className="wizard-header-fixed px-10 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20"><Sliders size={22} /></div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Wizard</h2>
              <p className="text-[9px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1.5 opacity-80">Orquestração v13.5 GOLD</p>
           </div>
        </div>
        <div className="flex gap-2">
           {Array.from({ length: stepsCount }).map((_, i) => (
             <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step === i+1 ? 'w-12 bg-orange-600 shadow-[0_0_15px_#f97316]' : step > i+1 ? 'w-6 bg-orange-600/40' : 'w-6 bg-white/5'}`} />
           ))}
        </div>
      </header>

      <div ref={scrollRef} className="wizard-content">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-5xl mx-auto pb-20">
               <WizardStepTitle icon={<Globe size={28}/>} title="Identidade da Arena" desc="Defina a escala do seu torneio estratégico." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <WizardField label="Nome da Arena" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="Ex: TORNEIO INDUSTRIAL ALPHA" />
                  <div className="grid grid-cols-2 gap-4">
                     <WizardField label="Rounds PN" type="number" val={formData.total_rounds} onChange={(v:any)=>setFormData({...formData, total_rounds: parseInt(v)})} />
                     <WizardField label="Regiões (1-N)" type="number" val={formData.regions_count} onChange={(v:any)=>setFormData({...formData, regions_count: parseInt(v)})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <WizardField label="Equipes Humanas" type="number" val={formData.teams_count} onChange={(v:any)=>setFormData({...formData, teams_count: parseInt(v)})} />
                     <WizardField label="Bots (IA)" type="number" val={formData.bots_count} onChange={(v:any)=>setFormData({...formData, bots_count: parseInt(v)})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <WizardField label="Tempo Decisão" type="number" val={formData.deadline_value} onChange={(v:any)=>setFormData({...formData, deadline_value: parseInt(v)})} />
                     <WizardSelect label="Unidade" val={formData.deadline_unit} onChange={(v:any)=>setFormData({...formData, deadline_unit: v as DeadlineUnit})} options={[{v:'days',l:'DIAS'},{v:'hours',l:'HORAS'}]} />
                  </div>
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<LayoutGrid size={28}/>} title="Unidades & Geopolítica" desc="Nomeie os nodos estratégicos (1 a N)." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-6">
                     <h4 className="text-sm font-black text-orange-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Nomes das Regiões</h4>
                     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {regionNames.map((n, i) => (
                           <input key={i} value={n} onChange={e => { const next = [...regionNames]; next[i] = e.target.value; setRegionNames(next); }} className="w-full bg-slate-950 border border-white/5 p-4 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500" placeholder={`Região ${i+1}`} />
                        ))}
                     </div>
                  </div>
                  <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-6">
                     <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest italic border-b border-white/5 pb-4">Nomes das Equipes</h4>
                     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {teamNames.map((n, i) => (
                           <input key={i} value={n} onChange={e => { const next = [...teamNames]; next[i] = e.target.value; setTeamNames(next); }} className="w-full bg-slate-950 border border-white/5 p-4 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-400" placeholder={`Equipe ${i+1}`} />
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<TableIcon size={28}/>} title="Matriz Mestra de Índices" desc="Defina a volatilidade futura por período." />
               <div className="bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="p-6 bg-slate-950 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
                     {Array.from({ length: formData.total_rounds }).map((_, i) => (
                        <button key={i} onClick={() => setActiveRoundEdit(i+1)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeRoundEdit === i+1 ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}>Round 0{i+1}</button>
                     ))}
                  </div>
                  <div className="p-12 space-y-10">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <WizardField label="ICE (Crescimento %)" type="number" val={roundRules[activeRoundEdit]?.ice ?? marketIndicators.ice} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'ice', parseFloat(v))} />
                        <WizardField label="Inflação Round (%)" type="number" val={roundRules[activeRoundEdit]?.inflation_rate ?? marketIndicators.inflation_rate} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'inflation_rate', parseFloat(v))} />
                        <WizardField label="TR (Juros Bancários %)" type="number" val={roundRules[activeRoundEdit]?.interest_rate_tr ?? marketIndicators.interest_rate_tr} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'interest_rate_tr', parseFloat(v))} />
                        <WizardField label="Reajuste MP-A (%)" type="number" val={roundRules[activeRoundEdit]?.raw_material_a_adjust ?? marketIndicators.raw_material_a_adjust} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'raw_material_a_adjust', parseFloat(v))} />
                        <WizardField label="Reajuste Máquina ALFA (%)" type="number" val={roundRules[activeRoundEdit]?.machine_alpha_price_adjust ?? 0} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'machine_alpha_price_adjust', parseFloat(v))} />
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest italic">Venda de Ativos</label>
                           <button onClick={() => updateRoundRule(activeRoundEdit, 'allow_machine_sale', !(roundRules[activeRoundEdit]?.allow_machine_sale ?? marketIndicators.allow_machine_sale))} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${ (roundRules[activeRoundEdit]?.allow_machine_sale ?? marketIndicators.allow_machine_sale) ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-950 border-white/5 text-slate-600'}`}> { (roundRules[activeRoundEdit]?.allow_machine_sale ?? marketIndicators.allow_machine_sale) ? 'LIBERADO' : 'BLOQUEADO' } </button>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<Package size={28}/>} title="Física de Insumos P0" desc="Base monetária para o Período 0." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/10 space-y-6">
                     <WizardField label="Preço Base MP-A ($)" type="number" val={marketIndicators.prices.mp_a} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: parseFloat(v)}})} />
                     <WizardField label="Preço Base MP-B ($)" type="number" val={marketIndicators.prices.mp_b} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: parseFloat(v)}})} />
                  </div>
                  <div className="bg-indigo-600/10 border border-indigo-500/20 p-10 rounded-[3.5rem] flex flex-col justify-center text-center space-y-4">
                     <Landmark size={48} className="mx-auto text-indigo-400" />
                     <h4 className="text-xl font-black text-white uppercase italic">Custo Geométrico v13.5</h4>
                     <p className="text-xs text-indigo-200 font-medium italic leading-relaxed">"O sistema acumulará os índices de reajuste definidos na grade mestra período a período automaticamente."</p>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-7xl mx-auto pb-20">
               <WizardStepTitle icon={<Factory size={28}/>} title="Catálogo de Ativos" desc="Capacidade instalada v13.5." />
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {(['alfa', 'beta', 'gama'] as MachineModel[]).map(model => (
                    <div key={model} className="bg-slate-900/60 p-8 rounded-[3.5rem] border border-white/10 space-y-8 shadow-2xl">
                       <h4 className="text-2xl font-black text-white uppercase italic flex items-center gap-3">
                          <Cpu className={model === 'alfa' ? 'text-orange-500' : model === 'beta' ? 'text-blue-500' : 'text-emerald-500'} /> Máquina {model}
                       </h4>
                       <div className="space-y-6">
                          <WizardField label="Preço P0 ($)" type="number" val={marketIndicators.machine_specs[model].initial_value} onChange={(v:any) => setMarketIndicators(prev => ({...prev, machine_specs: {...prev.machine_specs, [model]: {...prev.machine_specs[model], initial_value: parseFloat(v)}}}))} />
                          <WizardField label="Capacidade UN" type="number" val={marketIndicators.machine_specs[model].production_capacity} onChange={(v:any) => setMarketIndicators(prev => ({...prev, machine_specs: {...prev.machine_specs, [model]: {...prev.machine_specs[model], production_capacity: parseInt(v)}}}))} />
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
               <WizardStepTitle icon={<Calculator size={28}/>} title="Audit P00 Baseline" desc="Ajuste o capital social e reservas iniciais." />
               <div className="bg-slate-950/60 p-4 rounded-[4rem] border border-white/5 shadow-2xl">
                  <FinancialStructureEditor initialBalance={financials?.balance_sheet} initialDRE={financials?.dre} onChange={setFinancials} />
               </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 max-w-4xl mx-auto text-center py-24 pb-20">
               <WizardStepTitle icon={<ShieldCheck size={28}/>} title="Protocolo Pronto" desc="Tudo pronto para despacho v13.5 Oracle Gold." />
               <div className="bg-slate-900/60 p-20 rounded-[5rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group">
                  <Sparkles size={80} className="text-orange-600 mx-auto animate-pulse" />
                  <div className="space-y-4 relative z-10"><h3 className="text-4xl font-black text-white uppercase italic leading-none">Baseline Synchronized</h3><p className="text-xl text-slate-400 font-medium italic max-w-2xl mx-auto leading-relaxed">Arena com {formData.regions_count} regiões e {formData.total_rounds} ciclos dinâmicos orquestrados.</p></div>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <footer className="wizard-footer-dock">
         <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className={`px-10 py-5 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}><ArrowLeft size={20} /> Voltar</button>
         <div className="flex items-center gap-10">
            <button onClick={step === 7 ? handleLaunch : () => setStep(s => s + 1)} disabled={isSubmitting} className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 active:scale-95 group">
               {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> Sincronizando...</> : step === 7 ? 'Lançar Arena Master' : <>Próxima Fase <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>}
            </button>
         </div>
      </footer>
    </div>
  );
};

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-12">
     <div className="p-5 bg-white/5 rounded-[1.75rem] text-orange-500 shadow-inner flex items-center justify-center border border-white/5">{icon}</div>
     <div><h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{desc}</p></div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-3 text-left group"><label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <input type={type} value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner placeholder:text-slate-800 font-mono" placeholder={placeholder} />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-3 text-left group"><label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative"><select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-8 py-5 text-[10px] font-black text-white uppercase outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none">
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
       </select><div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Settings2 size={16} /></div></div>
  </div>
);

export default ChampionshipWizard;
