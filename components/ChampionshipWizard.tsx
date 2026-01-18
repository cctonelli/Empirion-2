import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, ArrowRight, Globe, Loader2, 
  ShieldCheck, ArrowLeft, Calculator,
  Sliders, CheckCircle2, LayoutGrid,
  Hourglass, Scale, Sparkles, X, Settings2,
  TrendingUp, Zap, Users, DollarSign, Package, Cpu,
  Briefcase, BarChart3, ShieldAlert, Award,
  Factory, HardDrive, Thermometer, UserPlus, Info, CalendarRange, 
  Trash2, ClipboardList, Gauge
} from 'lucide-react';
import { CHAMPIONSHIP_TEMPLATES, INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO } from '../constants';
import { Branch, ScenarioType, ModalityType, TransparencyLevel, SalesMode, ChampionshipTemplate, AccountNode, DeadlineUnit, GazetaMode, RegionType, AnalysisSource, CurrencyType, MacroIndicators, LaborAvailability, MachineModel, MachineSpec, InitialMachine } from '../types';
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

  const [marketIndicators, setMarketIndicators] = useState<MacroIndicators>(DEFAULT_MACRO);
  const [roundRules, setRoundRules] = useState<Record<number, Partial<MacroIndicators>>>({});
  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const updateRoundRule = (round: number, field: string, value: any) => {
    setRoundRules(prev => ({
      ...prev,
      [round]: { ...prev[round], [field]: value }
    }));
  };

  const updateMachineSpec = (model: MachineModel, updates: Partial<MachineSpec>) => {
    setMarketIndicators(prev => ({
      ...prev,
      machine_specs: {
        ...prev.machine_specs,
        [model]: { ...prev.machine_specs[model], ...updates }
      }
    }));
  };

  const addInitialMachine = (model: MachineModel) => {
    const newMachine: InitialMachine = {
      id: crypto.randomUUID(),
      model,
      age: 0
    };
    setMarketIndicators(prev => ({
      ...prev,
      initial_machinery_mix: [...prev.initial_machinery_mix, newMachine]
    }));
  };

  const removeInitialMachine = (id: string) => {
    setMarketIndicators(prev => ({
      ...prev,
      initial_machinery_mix: prev.initial_machinery_mix.filter(m => m.id !== id)
    }));
  };

  const updateInitialMachineAge = (id: string, age: number) => {
    setMarketIndicators(prev => ({
      ...prev,
      initial_machinery_mix: prev.initial_machinery_mix.map(m => m.id === id ? { ...m, age } : m)
    }));
  };

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      await createChampionshipWithTeams({
        ...formData,
        status: 'active',
        is_public: true,
        current_round: 0,
        initial_financials: financials,
        market_indicators: marketIndicators,
        round_rules: roundRules
      }, [], isTrial);
      onComplete();
    } catch (e: any) { alert(`ERRO NA SINCRONIZAÇÃO: ${e.message}`); }
    setIsSubmitting(false);
  };

  const stepsCount = 10; 

  return (
    <div className="wizard-shell">
      <header className="wizard-header-fixed px-10 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20"><Sliders size={22} /></div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Strategos Wizard</h2>
              <p className="text-[9px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1.5 opacity-80">Orquestração v13.2 GOLD</p>
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
            <motion.div key="s1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<LayoutGrid size={28}/>} title="Arquitetura de Arena" desc="Escolha o blueprint base para sua simulação." />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CHAMPIONSHIP_TEMPLATES.map((tpl) => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-10 rounded-[3.5rem] border-2 transition-all text-left flex flex-col justify-between min-h-[240px] group ${selectedTemplate?.id === tpl.id ? 'bg-orange-600 border-white shadow-2xl scale-[1.02]' : 'bg-slate-900/60 border-white/5 hover:border-orange-500/40'}`}>
                       <div><h4 className="text-xl font-black uppercase italic text-white leading-tight group-hover:translate-x-1 transition-transform">{tpl.name}</h4><p className={`text-xs mt-4 leading-relaxed line-clamp-3 font-medium ${selectedTemplate?.id === tpl.id ? 'text-white/80' : 'text-slate-500'}`}>{tpl.description}</p></div>
                       <div className="mt-10 flex items-center justify-between"><span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${selectedTemplate?.id === tpl.id ? 'bg-white text-orange-600' : 'bg-white/5 text-slate-500'}`}>Template Oracle</span>{selectedTemplate?.id === tpl.id && <CheckCircle2 size={24} />}</div>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-5xl mx-auto pb-20">
               <WizardStepTitle icon={<Globe size={28}/>} title="Configurações Base" desc="Parametrização de capital e fluxos de mercado." />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="glass-card p-10 space-y-8 bg-white/[0.03] border-white/5">
                    <WizardField label="Nome da Arena" val={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} placeholder="EX: CLUSTER INDUSTRIAL ALPHA" />
                    <div className="grid grid-cols-2 gap-6">
                       <WizardField label="Total de Rounds" type="number" val={formData.total_rounds} onChange={(v: string) => setFormData({...formData, total_rounds: Number(v)})} />
                       <WizardField label="Regiões" type="number" val={formData.regions_count} onChange={(v: string) => setFormData({...formData, regions_count: Number(v)})} />
                    </div>
                  </div>
                  <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 flex flex-col justify-center space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><Hourglass size={120} /></div>
                    <div className="flex items-center gap-4 text-orange-500 relative z-10"><Hourglass size={28} className="animate-pulse" /><h4 className="font-black text-lg uppercase tracking-widest italic">Ciclo de Decisão</h4></div>
                    <div className="grid grid-cols-2 gap-6 relative z-10">
                       <WizardField label="Duração" type="number" val={formData.deadline_value} onChange={(v: string) => setFormData({...formData, deadline_value: Number(v)})} />
                       <WizardSelect label="Unidade" val={formData.deadline_unit} onChange={(v: string) => setFormData({...formData, deadline_unit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<TrendingUp size={28}/>} title="Macroeconomia Master (P00)" desc="Sincronize os índices financeiros globais v13.2." />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  <WizardField label="ICE (Crescimento %)" type="number" val={marketIndicators.ice} onChange={(v:any)=>setMarketIndicators({...marketIndicators, ice: parseFloat(v)})} />
                  <WizardField label="Inflação Período (%)" type="number" val={marketIndicators.inflation_rate} onChange={(v:any)=>setMarketIndicators({...marketIndicators, inflation_rate: parseFloat(v)})} />
                  <WizardField label="Juros Bancários TR (%)" type="number" val={marketIndicators.interest_rate_tr} onChange={(v:any)=>setMarketIndicators({...marketIndicators, interest_rate_tr: parseFloat(v)})} />
                  <WizardField label="Inadimplência de Clientes (%)" type="number" val={marketIndicators.customer_default_rate} onChange={(v:any)=>setMarketIndicators({...marketIndicators, customer_default_rate: parseFloat(v)})} />
                  <WizardField label="Juros de Fornecedores (%)" type="number" val={marketIndicators.supplier_interest} onChange={(v:any)=>setMarketIndicators({...marketIndicators, supplier_interest: parseFloat(v)})} />
                  <WizardField label="Juros Médios de Vendas (%)" type="number" val={marketIndicators.sales_interest_rate} onChange={(v:any)=>setMarketIndicators({...marketIndicators, sales_interest_rate: parseFloat(v)})} />
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-7xl mx-auto pb-20">
               <WizardStepTitle icon={<Factory size={28}/>} title="Catálogo de Ativos" desc="Defina a capacidade e o custo operacional por modelo." />
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {(['alfa', 'beta', 'gama'] as MachineModel[]).map(model => (
                    <div key={model} className="bg-slate-900/60 p-8 rounded-[3.5rem] border border-white/10 space-y-8 shadow-2xl">
                       <h4 className="text-2xl font-black text-white uppercase italic flex items-center gap-3">
                          <Cpu className={model === 'alfa' ? 'text-orange-500' : model === 'beta' ? 'text-blue-500' : 'text-emerald-500'} /> Máquina {model}
                       </h4>
                       <div className="space-y-6">
                          <WizardField label="Valor Inicial P0 ($)" type="number" val={marketIndicators.machine_specs[model].initial_value} onChange={(v:any) => updateMachineSpec(model, { initial_value: parseFloat(v) })} />
                          <WizardField label="Produção a 100% (UN)" type="number" val={marketIndicators.machine_specs[model].production_capacity} onChange={(v:any) => updateMachineSpec(model, { production_capacity: parseInt(v) })} />
                          <WizardField label="Operadores / Máquina" type="number" val={marketIndicators.machine_specs[model].operators_required} onChange={(v:any) => updateMachineSpec(model, { operators_required: parseInt(v) })} />
                          <WizardField label="Depreciação / Ciclo (%)" type="number" val={marketIndicators.machine_specs[model].depreciation_rate * 100} onChange={(v:any) => updateMachineSpec(model, { depreciation_rate: parseFloat(v) / 100 })} />
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<ClipboardList size={28}/>} title="Inventário P00 (Round 0)" desc="Defina o mix inicial de máquinas e suas idades." />
               <div className="bg-white/[0.02] p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                  <div className="flex justify-between items-center">
                     <div className="space-y-1">
                        <h4 className="text-xl font-black text-white uppercase italic">Máquinas em Operação</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Idade média impacta custo de manutenção.</p>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => addInitialMachine('alfa')} className="px-5 py-2 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">+ ALFA</button>
                        <button onClick={() => addInitialMachine('beta')} className="px-5 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">+ BETA</button>
                        <button onClick={() => addInitialMachine('gama')} className="px-5 py-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">+ GAMA</button>
                     </div>
                  </div>
                  
                  <div className="matrix-container max-h-[400px] overflow-y-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-900/80 sticky top-0 z-10">
                           <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                              <th className="p-6"># ID Node</th>
                              <th className="p-6">Modelo</th>
                              <th className="p-6">Idade (Ciclos)</th>
                              <th className="p-6 text-right">Ação</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {marketIndicators.initial_machinery_mix.map((m, i) => (
                             <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-6 font-mono text-slate-500">M-0{i+1}</td>
                                <td className="p-6 font-black text-white uppercase italic">{m.model}</td>
                                <td className="p-6">
                                   <input 
                                     type="number" 
                                     value={m.age} 
                                     onChange={e => updateInitialMachineAge(m.id, parseInt(e.target.value) || 0)}
                                     className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-orange-500 w-24 outline-none focus:border-orange-500" 
                                   />
                                </td>
                                <td className="p-6 text-right">
                                   <button onClick={() => removeInitialMachine(m.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-5xl mx-auto pb-20">
               <WizardStepTitle icon={<Gauge size={28}/>} title="Engenharia de Manutenção" desc="Defina a física de custo por obsolescência." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/10 space-y-10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-5"><TrendingUp size={120} /></div>
                     <h4 className="text-xs font-black uppercase text-blue-400 tracking-widest flex items-center gap-3">
                        <Sparkles size={16}/> Parâmetros da Fórmula
                     </h4>
                     <div className="space-y-8 relative z-10">
                        <WizardField label="Alpha (Crescimento Base %)" type="number" val={marketIndicators.maintenance_physics.alpha * 100} onChange={(v:any)=>setMarketIndicators({...marketIndicators, maintenance_physics: {...marketIndicators.maintenance_physics, alpha: parseFloat(v)/100}})} />
                        <WizardField label="Beta (Aceleração Exponencial)" type="number" val={marketIndicators.maintenance_physics.beta} onChange={(v:any)=>setMarketIndicators({...marketIndicators, maintenance_physics: {...marketIndicators.maintenance_physics, beta: parseFloat(v)}})} />
                        <WizardField label="Gamma (Impacto de Carga)" type="number" val={marketIndicators.maintenance_physics.gamma} onChange={(v:any)=>setMarketIndicators({...marketIndicators, maintenance_physics: {...marketIndicators.maintenance_physics, gamma: parseFloat(v)}})} />
                     </div>
                  </div>
                  <div className="bg-indigo-600/10 border border-indigo-500/20 p-12 rounded-[4rem] space-y-8 flex flex-col justify-center">
                     <h4 className="text-xl font-black text-white uppercase italic">Impacto Projetado</h4>
                     <p className="text-lg text-indigo-100 font-medium italic leading-relaxed">
                        "Com Beta em {marketIndicators.maintenance_physics.beta}, máquinas com mais de 20 períodos de idade terão custo de manutenção {marketIndicators.maintenance_physics.beta > 1.2 ? 'agressivo' : 'moderado'}."
                     </p>
                     <div className="p-6 bg-slate-950/60 rounded-3xl border border-white/5">
                        <code className="text-[10px] text-emerald-400 font-mono">
                           Maintenance = ValBase * (1 + {marketIndicators.maintenance_physics.alpha} * Age ^ {marketIndicators.maintenance_physics.beta})
                        </code>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<CalendarRange size={28}/>} title="Arquitetura de Ciclos" desc="Defina a volatilidade futura round a round." />
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-3 space-y-3 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                     {Array.from({ length: formData.total_rounds }).map((_, i) => (
                       <button key={i} onClick={() => setActiveRoundEdit(i+1)} className={`w-full p-6 rounded-2xl border font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-between ${activeRoundEdit === i+1 ? 'bg-orange-600 text-white border-white shadow-xl' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'}`}>
                          <span>Round 0{i+1}</span>
                          {roundRules[i+1] && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                       </button>
                     ))}
                  </div>
                  <div className="lg:col-span-9 bg-white/[0.02] p-10 rounded-[4rem] border border-white/5 space-y-10">
                     <h4 className="text-xl font-black text-white uppercase italic">Configuração do Ciclo 0{activeRoundEdit}</h4>
                     <div className="grid grid-cols-2 gap-8">
                        <WizardField label="Inflação Round (%)" type="number" val={roundRules[activeRoundEdit]?.inflation_rate ?? marketIndicators.inflation_rate} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'inflation_rate', parseFloat(v))} />
                        <WizardField label="Variação Demanda (%)" type="number" val={roundRules[activeRoundEdit]?.demand_variation ?? 0} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'demand_variation', parseFloat(v))} />
                        <WizardField label="Reajuste MP-A (%)" type="number" val={roundRules[activeRoundEdit]?.raw_material_a_adjust ?? marketIndicators.raw_material_a_adjust} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'raw_material_a_adjust', parseFloat(v))} />
                        <WizardField label="Reajuste Salário (%)" type="number" val={roundRules[activeRoundEdit]?.salary_adjust ?? marketIndicators.salary_adjust} onChange={(v:any)=>updateRoundRule(activeRoundEdit, 'salary_adjust', parseFloat(v))} />
                     </div>
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Os valores em branco herdam a base definida nos passos anteriores.</p>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div key="s8" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-6xl mx-auto pb-20">
               <WizardStepTitle icon={<Package size={28}/>} title="Insumos e Custos Base" desc="Defina a base P0 dos suprimentos." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white/[0.02] p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-inner">
                     <h4 className="text-xs font-black uppercase text-orange-500 tracking-widest flex items-center gap-3 border-b border-white/5 pb-6 italic">
                        <DollarSign size={16}/> Valores P0
                     </h4>
                     <div className="grid grid-cols-1 gap-6">
                        <WizardField label="Preço MP-A ($)" type="number" val={marketIndicators.prices.mp_a} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: parseFloat(v)}})} />
                        <WizardField label="Preço MP-B ($)" type="number" val={marketIndicators.prices.mp_b} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: parseFloat(v)}})} />
                        <WizardField label="Salário Base ($)" type="number" val={marketIndicators.hr_base.salary} onChange={(v:any)=>setMarketIndicators({...marketIndicators, hr_base: {...marketIndicators.hr_base, salary: parseFloat(v)}})} />
                     </div>
                  </div>
                  <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 space-y-8 shadow-2xl flex flex-col justify-center items-center text-center">
                     <h4 className="text-xs font-black uppercase text-blue-400 tracking-widest italic">Governança de Ativos</h4>
                     <div className="space-y-4">
                        <span className="text-lg font-black text-white uppercase italic">Permitir Desinvestimento?</span>
                        <div className="flex gap-4 justify-center">
                           <button onClick={()=>setMarketIndicators({...marketIndicators, allow_machine_sale: true})} className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${marketIndicators.allow_machine_sale ? 'bg-emerald-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>Habilitar Venda</button>
                           <button onClick={()=>setMarketIndicators({...marketIndicators, allow_machine_sale: false})} className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${!marketIndicators.allow_machine_sale ? 'bg-rose-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>Bloquear Venda</button>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 9 && (
            <motion.div key="s9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
               <WizardStepTitle icon={<Calculator size={28}/>} title="Balanço Inicial P00" desc="Ajuste o capital social e reservas." />
               <div className="bg-slate-950/60 p-4 rounded-[4rem] border border-white/5">
                  <FinancialStructureEditor initialBalance={financials?.balance_sheet} initialDRE={financials?.dre} onChange={setFinancials} />
               </div>
            </motion.div>
          )}

          {step === 10 && (
            <motion.div key="finish" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 max-w-4xl mx-auto text-center py-24 pb-20">
               <WizardStepTitle icon={<ShieldCheck size={28}/>} title="Handshake Final" desc="Pronto para despacho v13.2 Oracle Gold." />
               <div className="bg-slate-900/60 p-20 rounded-[5rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group">
                  <Sparkles size={80} className="text-orange-600 mx-auto animate-pulse" />
                  <div className="space-y-4 relative z-10"><h3 className="text-4xl font-black text-white uppercase italic leading-none">Baseline Ready</h3><p className="text-xl text-slate-400 font-medium italic max-w-2xl mx-auto leading-relaxed">Arena estratégica com catálogo de {Object.keys(marketIndicators.machine_specs).length} modelos, inventário de {marketIndicators.initial_machinery_mix.length} máquinas e física de manutenção ativada.</p></div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="wizard-footer-dock">
         <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className={`px-10 py-5 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}><ArrowLeft size={20} /> Voltar</button>
         <div className="flex items-center gap-10">
            <button onClick={step === stepsCount ? handleLaunch : () => setStep(s => s + 1)} disabled={isSubmitting} className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 active:scale-95 group">
               {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> Sincronizando...</> : step === stepsCount ? 'Implantar Arena Master' : <>Avançar Protocolo <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>}
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