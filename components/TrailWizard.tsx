
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Rocket, 
  Loader2, Info, CheckCircle2, Factory, 
  Users, Globe, Timer, Cpu, Sparkles, 
  Settings, Landmark, DollarSign, Target, Calculator,
  Settings2, X, Bot, Boxes, TrendingUp, Percent,
  ArrowUpCircle, ArrowDownCircle, HardDrive, LayoutGrid,
  Zap, Flame, ShieldAlert, BarChart3, Coins, Hammer, Package,
  MapPin, Scale
} from 'lucide-react';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { createChampionshipWithTeams } from '../services/supabase';
import { INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import FinancialStructureEditor from './FinancialStructureEditor';
import EmpireParticles from './EmpireParticles';
import { Branch, SalesMode, ScenarioType, ModalityType, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, RegionConfig } from '../types';

const TrailWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    humanTeamsCount: 1,
    botsCount: 2,
    marketMode: 'hybrid' as SalesMode,
    regionsCount: 4,
    totalRounds: 12,
    roundTime: 24,
    roundUnit: 'hours' as DeadlineUnit,
    initialStockPrice: DEFAULT_INITIAL_SHARE_PRICE,
    currency: 'BRL' as CurrencyType
  });

  const [baseIndicators, setBaseIndicators] = useState<MacroIndicators>({
    ...DEFAULT_MACRO,
    exchange_rates: { BRL: 1, USD: 5.2, EUR: 5.5, GBP: 6.2 }
  });

  const [roundRules, setRoundRules] = useState<Record<number, Partial<MacroIndicators>>>(DEFAULT_INDUSTRIAL_CHRONOGRAM);
  const [teamNames, setTeamNames] = useState<string[]>(['EQUIPE ALPHA']);
  
  // Estrutura expandida de Regiões
  const [regionConfigs, setRegionConfigs] = useState<RegionConfig[]>([]);

  useEffect(() => {
    setTeamNames(prev => {
      const next = [...prev];
      if (next.length < formData.humanTeamsCount) {
        for (let i = next.length; i < formData.humanTeamsCount; i++) {
          next.push(`EQUIPE TRIAL 0${i + 1}`);
        }
      }
      return next.slice(0, formData.humanTeamsCount);
    });
  }, [formData.humanTeamsCount]);

  useEffect(() => {
    setRegionConfigs(prev => {
      const next = [...prev];
      const defaultWeight = Math.floor(100 / formData.regionsCount);
      if (next.length < formData.regionsCount) {
        for (let i = next.length; i < formData.regionsCount; i++) {
          next.push({
            id: i + 1,
            name: i === 0 ? 'SUDESTE' : i === 1 ? 'ESTADOS UNIDOS' : i === 2 ? 'EUROPA' : `REGIÃO 0${i + 1}`,
            currency: i === 0 ? 'BRL' : i === 1 ? 'USD' : i === 2 ? 'EUR' : 'BRL',
            demand_weight: defaultWeight
          });
        }
      }
      const sliced = next.slice(0, formData.regionsCount);
      // Ajusta o último peso para fechar 100%
      const currentSum = sliced.reduce((acc, r) => acc + r.demand_weight, 0);
      if (currentSum !== 100 && sliced.length > 0) {
        sliced[sliced.length - 1].demand_weight += (100 - currentSum);
      }
      return sliced;
    });
  }, [formData.regionsCount]);

  const updateRegion = (idx: number, updates: Partial<RegionConfig>) => {
    setRegionConfigs(prev => prev.map((r, i) => i === idx ? { ...r, ...updates } : r));
  };

  const normalizeWeights = () => {
    const sum = regionConfigs.reduce((acc, r) => acc + r.demand_weight, 0);
    if (sum === 0) return;
    setRegionConfigs(prev => prev.map(r => ({
      ...r,
      demand_weight: Math.round((r.demand_weight / sum) * 100)
    })));
  };

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const teamsToCreate = [
        ...teamNames.map(n => ({ name: n, is_bot: false })),
        ...Array.from({ length: formData.botsCount }, (_, i) => ({ name: `SYNTH NODE 0${i+1}`, is_bot: true }))
      ];

      await createChampionshipWithTeams({
        name: formData.name || `TRIAL ARENA ${new Date().toLocaleDateString()}`,
        description: "Sandbox de experimentação estratégica Empirion.",
        branch: 'industrial',
        status: 'active',
        current_round: 0,
        total_rounds: formData.totalRounds,
        deadline_value: formData.roundTime,
        deadline_unit: formData.roundUnit,
        regions_count: formData.regionsCount,
        region_names: regionConfigs.map(r => r.name),
        region_configs: regionConfigs,
        initial_financials: financials,
        initial_share_price: formData.initialStockPrice,
        currency: formData.currency,
        sales_mode: formData.marketMode,
        scenario_type: 'simulated' as ScenarioType,
        is_trial: true,
        market_indicators: baseIndicators,
        round_rules: roundRules,
        transparency_level: 'medium',
        gazeta_mode: 'anonymous',
        observers: []
      }, teamsToCreate, true);
      
      onComplete();
    } catch (e: any) {
      alert(`FALHA NA INICIALIZAÇÃO DO NODO: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRoundMacro = (round: number, key: string, val: any) => {
    setRoundRules(prev => ({
      ...prev,
      [round]: {
        ...(prev[round] || {}),
        [key]: val
      }
    }));
  };

  const stepsCount = 7;
  const totalPeriods = formData.totalRounds + 1;
  const totalWeight = regionConfigs.reduce((acc, r) => acc + r.demand_weight, 0);

  return (
    <div className="wizard-shell">
      <div ref={scrollRef} className="wizard-content">
        <div className="max-w-full pb-32">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="IDENTIDADE DA ARENA" desc="CONFIGURAÇÕES GLOBAIS DO AMBIENTE SANDBOX." />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                       <WizardField label="NOME DA INSTÂNCIA TRIAL" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="Ex: TESTE INDUSTRIAL ALPHA" />
                    </div>
                    <WizardSelect label="MOEDA BASE (RELATÓRIOS)" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'}]} />
                    
                    <WizardField label="TOTAL DE ROUNDS" type="number" val={formData.totalRounds} onChange={(v:any)=>setFormData({...formData, totalRounds: parseInt(v)})} />
                    <WizardField label="PREÇO AÇÃO P0 ($)" type="number" val={formData.initialStockPrice} onChange={(v:any)=>setFormData({...formData, initialStockPrice: parseFloat(v)})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                       <WizardField label="TEMPO ROUND" type="number" val={formData.roundTime} onChange={(v:any)=>setFormData({...formData, roundTime: parseInt(v)})} />
                       <WizardSelect label="UNIDADE" val={formData.roundUnit} onChange={(v:any)=>setFormData({...formData, roundUnit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Users size={32}/>} title="EQUIPES E BOTS" desc="DEFINA QUEM PARTICIPARÁ DA COMPETIÇÃO NO CLUSTER." />
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">Configuração do Cluster</h4>
                       <div className="grid grid-cols-2 gap-8">
                          <WizardField label="Unidades Humanas" type="number" val={formData.humanTeamsCount} onChange={(v:any)=>setFormData({...formData, humanTeamsCount: Math.max(1, parseInt(v))})} />
                          <WizardField label="Synthetic Nodes (IA)" type="number" val={formData.botsCount} onChange={(v:any)=>setFormData({...formData, botsCount: parseInt(v)})} />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] italic flex items-center gap-3"><CheckCircle2 size={16}/> Nomenclatura Operacional</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                          {teamNames.map((n, i) => (
                             <div key={i} className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-600">ID 0{i+1}</span>
                                <input value={n} onChange={e => { const next = [...teamNames]; next[i] = e.target.value; setTeamNames(next); }} className="w-full bg-slate-900 border border-white/10 pl-14 pr-4 py-4 rounded-2xl text-[10px] font-black text-white uppercase outline-none focus:border-blue-500 transition-all" />
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="GEOPOLÍTICA REGIONAL" desc="CONFIGURE MOEDAS E BALANCEAMENTO DE DEMANDA INTERNACIONAL." />
                 
                 <div className="bg-slate-950/60 p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl shadow-orange-600/20"><Scale size={24}/></div>
                       <div>
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Alocado</span>
                          <h4 className={`text-3xl font-black italic ${totalWeight === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>{totalWeight}% / 100%</h4>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <WizardField label="Total de Regiões" type="number" val={formData.regionsCount} onChange={(v:any)=>setFormData({...formData, regionsCount: Math.min(15, Math.max(1, parseInt(v)))})} />
                       <button onClick={normalizeWeights} className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all self-end mb-1">Auto-Balancear</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {regionConfigs.map((r, i) => (
                       <div key={i} className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 flex flex-wrap items-center gap-6 group hover:border-orange-500/30 transition-all shadow-xl">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 font-black italic">R{r.id}</div>
                          
                          <div className="flex-1 min-w-[200px]">
                             <label className="text-[8px] font-black uppercase text-slate-600 tracking-widest ml-2 mb-1 block italic">Identificador Regional</label>
                             <input value={r.name} onChange={e => updateRegion(i, { name: e.target.value.toUpperCase() })} className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-xs font-black text-white uppercase outline-none focus:border-orange-500" />
                          </div>

                          <div className="w-32">
                             <label className="text-[8px] font-black uppercase text-slate-600 tracking-widest ml-2 mb-1 block italic">Moeda Local</label>
                             <select value={r.currency} onChange={e => updateRegion(i, { currency: e.target.value as CurrencyType })} className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-[10px] font-black text-white outline-none cursor-pointer">
                                <option value="BRL">R$ - REAL</option>
                                <option value="USD">$ - DÓLAR</option>
                                <option value="EUR">€ - EURO</option>
                             </select>
                          </div>

                          <div className="w-32">
                             <label className="text-[8px] font-black uppercase text-slate-600 tracking-widest ml-2 mb-1 block italic">Demanda %</label>
                             <div className="relative">
                                <input type="number" value={r.demand_weight} onChange={e => updateRegion(i, { demand_weight: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-xs font-black text-orange-500 outline-none focus:border-orange-500 text-center" />
                                <Percent size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700" />
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Coins size={32}/>} title="MATRIZ DE PREÇOS BASE" desc="VALORES INICIAIS DE MERCADO (P00) PARA CÁLCULO DE REAJUSTES." />
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-8 bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3 italic border-b border-white/5 pb-4"><Package size={18}/> Insumos</h4>
                       <WizardField label="Matéria Prima A ($)" type="number" val={baseIndicators.prices.mp_a} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, mp_a: parseFloat(v)}})} />
                       <WizardField label="Matéria Prima B ($)" type="number" val={baseIndicators.prices.mp_b} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, mp_b: parseFloat(v)}})} />
                       <WizardField label="Distribuição Unit." type="number" val={baseIndicators.prices.distribution_unit} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, distribution_unit: parseFloat(v)}})} />
                    </div>

                    <div className="space-y-8 bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] flex items-center gap-3 italic border-b border-white/5 pb-4"><Cpu size={18}/> CAPEX</h4>
                       <WizardField label="Máquina ALFA ($)" type="number" val={baseIndicators.machinery_values.alfa} onChange={(v:any)=>setBaseIndicators({...baseIndicators, machinery_values: {...baseIndicators.machinery_values, alfa: parseFloat(v)}})} />
                       <WizardField label="Máquina BETA ($)" type="number" val={baseIndicators.machinery_values.beta} onChange={(v:any)=>setBaseIndicators({...baseIndicators, machinery_values: {...baseIndicators.machinery_values, beta: parseFloat(v)}})} />
                       <WizardField label="Máquina GAMA ($)" type="number" val={baseIndicators.machinery_values.gama} onChange={(v:any)=>setBaseIndicators({...baseIndicators, machinery_values: {...baseIndicators.machinery_values, gama: parseFloat(v)}})} />
                    </div>

                    <div className="space-y-8 bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] flex items-center gap-3 italic border-b border-white/5 pb-4"><Users size={18}/> OPEX HR</h4>
                       <WizardField label="Salário Base P00 ($)" type="number" val={baseIndicators.hr_base.salary} onChange={(v:any)=>setBaseIndicators({...baseIndicators, hr_base: {...baseIndicators.hr_base, salary: parseFloat(v)}})} />
                       <div className="p-8 bg-orange-600/5 rounded-3xl border border-orange-500/10 mt-10">
                          <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed italic">
                             "Estes valores definem o custo inicial absoluto (v13.2 Baseline)."
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                 <WizardStepTitle icon={<BarChart3 size={32}/>} title="CRONOGRAMA ESTRATÉGICO" desc="P00 É A BASE DE RELATÓRIO INICIAL. ROUNDS COMPETITIVOS INICIAM NO P01." />
                 
                 <div className="rounded-[3rem] bg-slate-950/90 border-2 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden h-[580px] flex flex-col relative group">
                    <div className="overflow-auto custom-scrollbar flex-1 relative">
                       <table className="w-full text-left border-separate border-spacing-0">
                          <thead>
                             <tr>
                                <th className="p-4 sticky top-0 left-0 bg-slate-900 z-[100] border-b-2 border-r-2 border-white/10 w-[260px] min-w-[260px]">
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Variações / Período</span>
                                      <span className="text-[8px] font-bold text-orange-500 mt-2 uppercase italic">Total: {formData.totalRounds} Rounds</span>
                                   </div>
                                </th>
                                {Array.from({ length: totalPeriods }).map((_, i) => (
                                   <th key={i} className={`p-4 sticky top-0 bg-slate-900 z-40 border-b-2 border-r border-white/5 text-center min-w-[85px] ${i === 0 ? 'bg-orange-600/10' : ''}`}>
                                      <span className={`text-[12px] font-black uppercase tracking-widest ${i === 0 ? 'text-white' : 'text-orange-500'}`}>P{i < 10 ? `0${i}` : i}</span>
                                      {i === 0 && <span className="block text-[7px] font-black text-orange-500/60 leading-none mt-1 uppercase italic">Base</span>}
                                   </th>
                                ))}
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                             <CompactMatrixRow periods={totalPeriods} label="ICE (CONF. CONS. %)" macroKey="ice" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="DEMANDA MERCADO (%)" macroKey="demand_variation" rules={roundRules} update={updateRoundMacro} icon={<Target size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="INFLAÇÃO PERÍODO (%)" macroKey="inflation_rate" rules={roundRules} update={updateRoundMacro} icon={<Flame size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="JUROS TR / SELIC (%)" macroKey="interest_rate_tr" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                             
                             <tr className="hover:bg-white/[0.03] transition-colors">
                                <td className="p-4 sticky left-0 bg-slate-950 z-30 font-black text-[9px] text-emerald-400 uppercase tracking-widest border-r-2 border-white/10 whitespace-nowrap">LIBERAR VENDA ATIVOS?</td>
                                {Array.from({ length: totalPeriods }).map((_, i) => (
                                   <td key={i} className="p-2 border-r border-white/5 text-center">
                                      <button 
                                        onClick={() => updateRoundMacro(i, 'allow_machine_sale', !(roundRules[i]?.allow_machine_sale ?? false))}
                                        className={`w-full py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${roundRules[i]?.allow_machine_sale ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-rose-600/10 border-rose-500/30 text-rose-500 opacity-40'}`}
                                      >
                                         {roundRules[i]?.allow_machine_sale ? 'SIM' : 'NÃO'}
                                      </button>
                                   </td>
                                ))}
                             </tr>

                             <CompactMatrixRow periods={totalPeriods} label="REAJUSTE MP-A (%)" macroKey="raw_material_a_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="REAJUSTE MP-B (%)" macroKey="raw_material_b_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="REAJUSTE MÁQ. ALFA (%)" macroKey="machine_alpha_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="REAJUSTE MÁQ. BETA (%)" macroKey="machine_beta_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="REAJUSTE MÁQ. GAMA (%)" macroKey="machine_gamma_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="REAJUSTE MARKETING (%)" macroKey="marketing_campaign_adjust" rules={roundRules} update={updateRoundMacro} />
                          </tbody>
                       </table>
                    </div>
                    {/* INDICADOR DE SCAN LATERAL */}
                    <motion.div animate={{ left: ['-1%', '101%'] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute top-0 bottom-0 w-px bg-orange-500/20 shadow-[0_0_15px_#f97316] z-[110] pointer-events-none" />
                 </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Calculator size={32}/>} title="ORACLE BASELINE" desc="EDITE OS BALANÇOS E DRES INICIAIS PARA O ROUND ZERO." />
                 <div className="bg-slate-950/90 p-4 rounded-[4rem] border-2 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                    <FinancialStructureEditor 
                       initialBalance={financials?.balance_sheet} 
                       initialDRE={financials?.dre} 
                       onChange={setFinancials} 
                    />
                 </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="s7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-24 text-center space-y-12">
                 <div className="w-40 h-40 bg-orange-600 rounded-[4rem] flex items-center justify-center mx-auto shadow-[0_20px_80px_rgba(249,115,22,0.4)] animate-bounce border-4 border-orange-400/50">
                    <ShieldCheck size={80} className="text-white" strokeWidth={3} />
                 </div>
                 <div className="space-y-6">
                    <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Cluster Sincronizado</h1>
                    <p className="text-2xl text-slate-400 font-medium italic max-w-3xl mx-auto leading-relaxed opacity-80">
                       A Arena Trial foi orquestrada com parâmetros auditados v13.2. Pronta para inicializar a simulação.
                    </p>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <footer className="wizard-footer-dock">
         <button 
           onClick={() => setStep(s => Math.max(1, s-1))} 
           disabled={step === 1} 
           className={`px-10 py-5 font-black uppercase text-[10px] tracking-[0.4em] transition-all flex items-center gap-5 active:scale-95 italic ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
         >
           <ArrowLeft size={24} /> Voltar Fase
         </button>
         
         <div className="flex items-center gap-12">
            <div className="hidden sm:flex flex-col items-end opacity-40">
               <span className="text-[8px] font-black text-white uppercase tracking-[0.6em]">Protocolo Trial v13.2</span>
               <span className="text-[10px] font-black text-orange-500 italic uppercase">Fase {step} de {stepsCount}</span>
            </div>
            <button 
              onClick={step === stepsCount ? handleLaunch : () => setStep(s => s + 1)} 
              disabled={isSubmitting} 
              className="px-20 py-8 bg-orange-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.5em] shadow-[0_20px_60px_rgba(249,115,22,0.5)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-8 active:scale-95 group border-4 border-orange-400/50"
            >
               {isSubmitting ? (
                 <><Loader2 className="animate-spin" size={24}/> Sincronizando Nodos...</>
               ) : step === stepsCount ? (
                 'Lançar Arena Trial'
               ) : (
                 <>Próxima Fase <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-3 transition-transform" /></>
               )}
            </button>
         </div>
      </footer>
    </div>
  );
};

const CompactMatrixRow = ({ label, macroKey, rules, update, icon, periods }: any) => (
   <tr className="hover:bg-white/[0.04] transition-colors group">
      <td className="p-3 sticky left-0 bg-slate-950 z-30 border-r-2 border-white/10 group-hover:bg-slate-900 transition-colors w-[260px] min-w-[260px]">
         <div className="flex items-center gap-3">
            <div className="text-slate-600 group-hover:text-orange-500 transition-colors shrink-0">{icon || <Settings size={10}/>}</div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic truncate">{label}</span>
         </div>
      </td>
      {Array.from({ length: periods }).map((_, i) => {
         const defaultVal = DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.[macroKey] ?? DEFAULT_MACRO[macroKey] ?? 0;
         return (
            <td key={i} className={`p-1 border-r border-white/5 ${i === 0 ? 'bg-orange-600/5' : ''}`}>
               <input 
                  type="number" step="0.1"
                  value={rules[i]?.[macroKey] ?? defaultVal}
                  onChange={e => update(i, macroKey, parseFloat(e.target.value))}
                  className={`w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-2.5 text-center text-[10px] font-black text-white outline-none focus:border-orange-500 transition-all shadow-inner ${i === 0 ? 'border-orange-500/40 text-white' : ''}`}
               />
            </td>
         );
      })}
   </tr>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-8">
     <div className="p-5 bg-slate-900 border-2 border-orange-500/30 rounded-[2rem] text-orange-500 shadow-2xl flex items-center justify-center">
        {icon}
     </div>
     <div>
        <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <input 
        type={type} 
        value={val} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-8 py-5 text-lg font-bold text-white outline-none focus:border-orange-600 transition-all shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)] placeholder:text-slate-800 font-mono" 
        placeholder={placeholder} 
     />
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative">
        <select 
          value={val} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-8 py-5 text-[11px] font-black text-white uppercase outline-none focus:border-orange-600 transition-all cursor-pointer appearance-none shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)]"
        >
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
           <Settings2 size={24} />
        </div>
     </div>
  </div>
);

export default TrailWizard;
