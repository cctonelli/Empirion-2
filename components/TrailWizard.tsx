
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Rocket, 
  Loader2, Info, CheckCircle2, Factory, 
  Users, Globe, Timer, Cpu, Sparkles, 
  Settings, Landmark, DollarSign, Target, Calculator,
  Settings2, X, Bot, Boxes, TrendingUp, Percent,
  ArrowUpCircle, ArrowDownCircle, HardDrive, LayoutGrid,
  Zap, Flame, ShieldAlert, BarChart3, Coins, Hammer, Package,
  MapPin, Scale, Eye, EyeOff, ChevronLeft, ChevronRight, Truck, Warehouse, Megaphone,
  BarChart, PieChart, Activity, Award, ClipboardList, ShoppingCart, UserPlus, Briefcase
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { createChampionshipWithTeams } from '../services/supabase';
import { INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import FinancialStructureEditor from './FinancialStructureEditor';
import EmpireParticles from './EmpireParticles';
import { Branch, SalesMode, ScenarioType, ModalityType, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, RegionConfig, TransparencyLevel, GazetaMode } from '../types';

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
    currency: 'BRL' as CurrencyType,
    transparency: 'medium' as TransparencyLevel,
    gazetaMode: 'anonymous' as GazetaMode,
    dividend_percent: 25.0 
  });

  const [baseIndicators, setBaseIndicators] = useState<MacroIndicators>({
    ...DEFAULT_MACRO,
    exchange_rates: { BRL: 1, USD: 5.2, EUR: 5.5, GBP: 6.2 }
  });

  const [roundRules, setRoundRules] = useState<Record<number, Partial<MacroIndicators>>>(DEFAULT_INDUSTRIAL_CHRONOGRAM);
  const [teamNames, setTeamNames] = useState<string[]>(['EQUIPE ALPHA']);
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

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] } | null>({
    balance_sheet: INITIAL_FINANCIAL_TREE.balance_sheet,
    dre: INITIAL_FINANCIAL_TREE.dre,
    cash_flow: INITIAL_FINANCIAL_TREE.cash_flow
  });

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
        transparency_level: formData.transparency,
        gazeta_mode: formData.gazetaMode,
        is_trial: true,
        market_indicators: { ...baseIndicators, dividend_percent: formData.dividend_percent },
        round_rules: roundRules,
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
    if (key === 'USD' || key === 'EUR') {
       setRoundRules(prev => ({
         ...prev,
         [round]: {
           ...(prev[round] || {}),
           exchange_rates: {
             ...(prev[round]?.exchange_rates || baseIndicators.exchange_rates),
             [key]: val
           }
         }
       }));
    } else {
       setRoundRules(prev => ({
         ...prev,
         [round]: {
           ...(prev[round] || {}),
           [key]: val
         }
       }));
    }
  };

  const stepsCount = 7;
  const totalWeight = regionConfigs.reduce((acc, r) => acc + r.demand_weight, 0);
  const totalPeriods = formData.totalRounds + 1;

  const totalAssetsSummary = financials?.balance_sheet.find(n => n.id === 'assets')?.value || 0;
  const totalProfitSummary = financials?.dre.find(n => n.id === 'final_profit')?.value || 0;
  const totalEquitySummary = financials?.balance_sheet.find(n => n.id === 'liabilities_pl')?.children?.find(n => n.id === 'equity')?.value || 5055447;

  return (
    <div className="wizard-shell">
      <EmpireParticles />
      <div ref={scrollRef} className="wizard-content">
        <div className="max-w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="IDENTIDADE DO TORNEIO" desc="CONFIGURAÇÕES GLOBAIS DO TORNEIO." />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                       <WizardField label="NOME DO TORNEIO" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="Ex: TORNEIO DOS CAMPEÕES" />
                    </div>
                    <WizardSelect label="MOEDA BASE (RELATÓRIOS)" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'}]} />
                    
                    <div className="space-y-2">
                       <WizardField label="TOTAL DE ROUNDS" type="number" val={formData.totalRounds} onChange={(v:any)=>setFormData({...formData, totalRounds: Math.min(12, Math.max(1, parseInt(v) || 0))})} />
                       {formData.totalRounds >= 12 && <p className="text-[10px] font-black text-rose-500 uppercase italic ml-4 animate-pulse">MÁXIMO DE 12 PERÍODOS</p>}
                    </div>
                    
                    <WizardField label="PREÇO AÇÃO INICIAL ($)" type="number" val={formData.initialStockPrice} onChange={(v:any)=>setFormData({...formData, initialStockPrice: parseFloat(v)})} />
                    <WizardField label="% DIVIDENDOS" type="number" val={formData.dividend_percent} onChange={(v:any)=>setFormData({...formData, dividend_percent: parseFloat(v)})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                       <WizardField label="TEMPO ROUND" type="number" val={formData.roundTime} onChange={(v:any)=>setFormData({...formData, roundTime: parseInt(v)})} />
                       <WizardSelect label="UNIDADE" val={formData.roundUnit} onChange={(v:any)=>setFormData({...formData, roundUnit: v as DeadlineUnit})} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} />
                    </div>
                 </div>

                 <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8 mt-12">
                    <h4 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] italic flex items-center gap-3"><Settings size={18}/> Governança Tática</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nível de Transparência</label>
                          <div className="grid grid-cols-2 gap-3">
                             {['low', 'medium', 'high', 'full'].map(lvl => (
                                <button key={lvl} onClick={() => setFormData({...formData, transparency: lvl as TransparencyLevel})} className={`py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${formData.transparency === lvl ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}>{lvl}</button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Identidade na Gazeta</label>
                          <div className="flex gap-4">
                             <button onClick={() => setFormData({...formData, gazetaMode: 'anonymous'})} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all flex items-center justify-center gap-3 ${formData.gazetaMode === 'anonymous' ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}><EyeOff size={14}/> Anônimo</button>
                             <button onClick={() => setFormData({...formData, gazetaMode: 'identified'})} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all flex items-center justify-center gap-3 ${formData.gazetaMode === 'identified' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}><Eye size={14}/> Identificado</button>
                          </div>
                       </div>
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
                          <WizardField label="Nº Equipes Humanas" type="number" val={formData.humanTeamsCount} onChange={(v:any)=>setFormData({...formData, humanTeamsCount: Math.max(1, parseInt(v))})} />
                          <WizardField label="Nº Equipes Bots)" type="number" val={formData.botsCount} onChange={(v:any)=>setFormData({...formData, botsCount: parseInt(v)})} />
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
                 <WizardStepTitle icon={<Award size={32}/>} title="REGRAS E PREMIAÇÕES" desc="DEFINA VALORES BASE E PREMIAÇÕES POR PRECISÃO DE CÁLCULO." />
                 
                 {/* PRIMEIRA LINHA: 3 COLUNAS EXPANDIDAS */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="space-y-8 bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl transition-all hover:border-emerald-500/20">
                       <h4 className="text-xl font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-4 italic border-b border-white/5 pb-6"><Package size={28}/> INSUMOS & ESTOCAGEM</h4>
                       <div className="grid grid-cols-1 gap-6">
                          <WizardField label="MP-A ($)" type="number" val={baseIndicators.prices.mp_a} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, mp_a: parseFloat(v)}})} />
                          <WizardField label="MP-B ($)" type="number" val={baseIndicators.prices.mp_b} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, mp_b: parseFloat(v)}})} />
                          <WizardField label="Ágio Compras Esp. (%)" type="number" val={baseIndicators.special_purchase_premium} onChange={(v:any)=>setBaseIndicators({...baseIndicators, special_purchase_premium: parseFloat(v)})} />
                          <div className="grid grid-cols-2 gap-6">
                             <WizardField label="Estocagem MP ($)" type="number" step="0.1" val={baseIndicators.prices.storage_mp || 1.40} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, storage_mp: parseFloat(v)}})} />
                             <WizardField label="Estocagem PROD ($)" type="number" val={baseIndicators.prices.storage_finished || 20.00} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, storage_finished: parseFloat(v)}})} />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8 bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl transition-all hover:border-blue-500/20">
                       <h4 className="text-xl font-black text-blue-400 uppercase tracking-[0.4em] flex items-center gap-4 italic border-b border-white/5 pb-6"><Cpu size={28}/> ATIVOS & CAPEX</h4>
                       <div className="grid grid-cols-1 gap-6">
                          <WizardField label="Máquina ALFA ($)" type="number" val={baseIndicators.machinery_values.alfa} onChange={(v:any)=>setBaseIndicators({...baseIndicators, machinery_values: {...baseIndicators.machinery_values, alfa: parseFloat(v)}})} />
                          <WizardField label="Máquina BETA ($)" type="number" val={baseIndicators.machinery_values.beta} onChange={(v:any)=>setBaseIndicators({...baseIndicators, machinery_values: {...baseIndicators.machinery_values, beta: parseFloat(v)}})} />
                          <WizardField label="Máquina GAMA ($)" type="number" val={baseIndicators.machinery_values.gama} onChange={(v:any)=>setBaseIndicators({...baseIndicators, machinery_values: {...baseIndicators.machinery_values, gama: parseFloat(v)}})} />
                       </div>
                    </div>

                    <div className="space-y-8 bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl transition-all hover:border-orange-500/20">
                       <h4 className="text-xl font-black text-orange-400 uppercase tracking-[0.4em] flex items-center gap-4 italic border-b border-white/5 pb-6"><ShoppingCart size={28}/> MERCADO</h4>
                       <div className="grid grid-cols-1 gap-6">
                          <WizardField label="Preço Venda Médio ($)" type="number" val={baseIndicators.avg_selling_price || 340} onChange={(v:any)=>setBaseIndicators({...baseIndicators, avg_selling_price: parseFloat(v)})} />
                          <WizardField label="Distribuição Unit. ($)" type="number" val={baseIndicators.prices.distribution_unit || 50} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, distribution_unit: parseFloat(v)}})} />
                          <WizardField label="Campanha Marketing ($)" type="number" val={baseIndicators.prices.marketing_campaign || 10000} onChange={(v:any)=>setBaseIndicators({...baseIndicators, prices: {...baseIndicators.prices, marketing_campaign: parseFloat(v)}})} />
                       </div>
                    </div>
                 </div>

                 {/* SEGUNDA LINHA: 2 COLUNAS EXPANDIDAS */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8 bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 shadow-2xl transition-all hover:border-indigo-500/20">
                       <h4 className="text-2xl font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-6 italic border-b border-white/5 pb-8"><Briefcase size={32}/> STAFFING & PAYROLL</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-6">
                             <WizardField label="Salário Base P00 ($)" type="number" val={baseIndicators.hr_base.salary || 1300} onChange={(v:any)=>setBaseIndicators({...baseIndicators, hr_base: {...baseIndicators.hr_base, salary: parseFloat(v)}})} />
                             <p className="text-xs text-slate-500 italic font-medium leading-relaxed">"O salário base afeta todos os níveis operacionais. Reajustes impactam o CPV diretamente."</p>
                          </div>
                          <div className="space-y-4">
                             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2 block italic">Distribuição de Headcount</span>
                             <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-white uppercase italic">Administração</span>
                                   <span className="text-[9px] font-bold text-indigo-400 uppercase">Salário Base x 4.0</span>
                                </div>
                                <span className="text-2xl font-mono font-black text-white">20 Units</span>
                             </div>
                             <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-white uppercase italic">Vendas</span>
                                   <span className="text-[9px] font-bold text-indigo-400 uppercase">Salário Base x 4.0</span>
                                </div>
                                <span className="text-2xl font-mono font-black text-white">10 Units</span>
                             </div>
                             <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-white uppercase italic">Produção</span>
                                   <span className="text-[9px] font-bold text-emerald-400 uppercase">Salário Base x 1.0</span>
                                </div>
                                <span className="text-2xl font-mono font-black text-white">470 Units</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8 bg-orange-600/10 p-12 rounded-[4rem] border-2 border-orange-500/20 shadow-[0_0_80px_rgba(249,115,22,0.1)] transition-all hover:bg-orange-600/15">
                       <h4 className="text-2xl font-black text-orange-400 uppercase tracking-[0.4em] flex items-center gap-6 italic border-b border-orange-500/10 pb-8"><Award size={32}/> PREMIAÇÕES POR PRECISÃO</h4>
                       <div className="grid grid-cols-1 gap-8">
                          <WizardField label="Prêmio: Custo Unitário ($)" type="number" val={baseIndicators.award_values.cost_precision} onChange={(v:any)=>setBaseIndicators({...baseIndicators, award_values: {...baseIndicators.award_values, cost_precision: parseFloat(v)}})} />
                          <WizardField label="Prêmio: Faturamento ($)" type="number" val={baseIndicators.award_values.revenue_precision} onChange={(v:any)=>setBaseIndicators({...baseIndicators, award_values: {...baseIndicators.award_values, revenue_precision: parseFloat(v)}})} />
                          <WizardField label="Prêmio: Lucro Líquido ($)" type="number" val={baseIndicators.award_values.profit_precision} onChange={(v:any)=>setBaseIndicators({...baseIndicators, award_values: {...baseIndicators.award_values, profit_precision: parseFloat(v)}})} />
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                 <WizardStepTitle icon={<BarChart3 size={32}/>} title="INDICADORES ESTRATÉGICOS" desc="CONFIGURAÇÃO COMPLETA DA MATRIZ ECONÔMICA POR PERÍODO." />
                 
                 <div className="rounded-[3rem] bg-slate-950/90 border-2 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden h-[620px] flex flex-col relative group">
                    <div className="overflow-auto custom-scrollbar flex-1 relative">
                       <table className="w-full text-left border-separate border-spacing-0">
                          <thead className="sticky top-0 z-[100] bg-slate-900 shadow-xl">
                             <tr>
                                <th className="p-4 bg-slate-900 border-b-2 border-r-2 border-white/10 w-[280px] min-w-[280px]">
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Variações / Período</span>
                                   </div>
                                </th>
                                {Array.from({ length: totalPeriods }).map((_, i) => (
                                   <th key={i} className={`p-4 bg-slate-900 border-b-2 border-r border-white/5 text-center min-w-[95px] ${i === 0 ? 'bg-orange-600/10' : ''}`}>
                                      <span className={`text-[12px] font-black uppercase tracking-widest ${i === 0 ? 'text-white' : 'text-orange-500'}`}>P{i < 10 ? `0${i}` : i}</span>
                                      {i === 0 && <span className="block text-[7px] font-black text-orange-500/60 leading-none mt-1 uppercase italic">Base</span>}
                                   </th>
                                ))}
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                             <CompactMatrixRow periods={totalPeriods} label="ICE (CRESC. ECONÔMICO)" macroKey="ice" rules={roundRules} update={updateRoundMacro} icon={<Activity size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="VARIAÇÕES DE DEMANDA" macroKey="demand_variation" rules={roundRules} update={updateRoundMacro} icon={<Target size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="ÍNDICE DE INFLAÇÃO" macroKey="inflation_rate" rules={roundRules} update={updateRoundMacro} icon={<Flame size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="ÍNDICE DE INADIMPLÊNCIA" macroKey="customer_default_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="JUROS BANCÁRIOS (TR)" macroKey="interest_rate_tr" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="JUROS DE FORNECEDORES" macroKey="supplier_interest" rules={roundRules} update={updateRoundMacro} icon={<Truck size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="JUROS MÉDIOS DE VENDAS" macroKey="sales_interest_rate" rules={roundRules} update={updateRoundMacro} icon={<DollarSign size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: DÓLAR (USD)" macroKey="USD" rules={roundRules} update={updateRoundMacro} icon={<DollarSign size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: EURO (EUR)" macroKey="EUR" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="IMPOSTO DE RENDA (%)" macroKey="tax_rate_ir" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="MULTA POR ATRASOS (%)" macroKey="late_penalty_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                             <CompactMatrixRow periods={totalPeriods} label="DESÁGIO VENDA MÁQ. (%)" macroKey="machine_sale_discount" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                             
                             <CompactMatrixRow periods={totalPeriods} label="MATÉRIAS-PRIMAS" macroKey="raw_material_a_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="MÁQUINA ALFA" macroKey="machine_alpha_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="MÁQUINA BETA" macroKey="machine_beta_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="MÁQUINA GAMA" macroKey="machine_gamma_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="CAMPANHAS MARKETING" macroKey="marketing_campaign_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="DISTRIBUIÇÃO DE PRODUTOS" macroKey="distribution_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow periods={totalPeriods} label="GASTOS COM ESTOCAGEM" macroKey="storage_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                             
                             <tr className="hover:bg-white/[0.03] transition-colors">
                                <td className="p-4 sticky left-0 bg-slate-950 z-30 font-black text-[9px] text-emerald-400 uppercase tracking-widest border-r-2 border-white/10 whitespace-nowrap flex items-center gap-2"><HardDrive size={10}/> LIBERAR VENDA ATIVOS?</td>
                                {Array.from({ length: totalPeriods }).map((_, i) => (
                                   <td key={i} className="p-2 border-r border-white/5 text-center">
                                      <button 
                                        onClick={() => updateRoundMacro(i, 'allow_machine_sale', !(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)))}
                                        className={`w-full py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${ (roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-rose-600/10 border-rose-500/30 text-rose-500 opacity-40'}`}
                                      >
                                         {(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'SIM' : 'NÃO'}
                                      </button>
                                   </td>
                                ))}
                             </tr>

                             <tr className="hover:bg-white/[0.03] transition-colors">
                                <td className="p-4 sticky left-0 bg-slate-950 z-30 font-black text-[9px] text-blue-400 uppercase tracking-widest border-r-2 border-white/10 whitespace-nowrap flex items-center gap-2"><ClipboardList size={10}/> APRESENTAR BUSINESS PLAN</td>
                                {Array.from({ length: totalPeriods }).map((_, i) => (
                                   <td key={i} className="p-2 border-r border-white/5 text-center">
                                      <button 
                                        onClick={() => updateRoundMacro(i, 'require_business_plan', !(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)))}
                                        className={`w-full py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${ (roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-700 opacity-40'}`}
                                      >
                                         {(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'SIM' : 'NÃO'}
                                      </button>
                                   </td>
                                ))}
                             </tr>
                          </tbody>
                       </table>
                    </div>
                    <motion.div animate={{ left: ['-1%', '101%'] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute top-0 bottom-0 w-px bg-orange-500/20 shadow-[0_0_15px_#f97316] z-[110] pointer-events-none" />
                 </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Calculator size={32}/>} title="CONTÁBIL E FINANCEIRO" desc="EDITE OS BALANÇOS, DRES E FLUXO DE CAIXA INICIAIS PARA O ROUND ZERO." />
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <SummaryCard label="ATIVO TOTAL P00" val={totalAssetsSummary} icon={<PieChart size={20}/>} color="orange" />
                    <SummaryCard label="PATRIMÔNIO LÍQUIDO P00" val={totalEquitySummary} icon={<BarChart size={20}/>} color="blue" />
                    <SummaryCard label="RESULTADO LÍQUIDO P00" val={totalProfitSummary} icon={<Activity size={20}/>} color="emerald" />
                 </div>

                 <div className="bg-slate-950/90 p-4 rounded-[4rem] border-2 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                    <FinancialStructureEditor 
                       initialBalance={financials?.balance_sheet} 
                       initialDRE={financials?.dre} 
                       initialCashFlow={financials?.cash_flow}
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
                       A Arena Trial foi orquestrada com parâmetros auditados v14.2. Pronta para inicializar a simulação.
                    </p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button 
        onClick={() => setStep(s => Math.max(1, s-1))} 
        disabled={step === 1} 
        className="floating-nav-btn left-10"
        title="Voltar Protocolo"
      >
        <ChevronLeft size={32} />
      </button>
      
      {step === stepsCount ? (
        <button 
          onClick={handleLaunch} 
          disabled={isSubmitting} 
          className="floating-nav-btn-primary"
        >
          {isSubmitting ? (
            <><Loader2 className="animate-spin" size={24}/> Sincronizando Nodos...</>
          ) : (
            'Lançar Arena Trial'
          )}
        </button>
      ) : (
        <button 
          onClick={() => setStep(s => s + 1)} 
          className="floating-nav-btn right-10"
          title="Próxima Fase"
        >
          <ChevronRight size={32} />
        </button>
      )}

      <div className="fixed bottom-6 right-1/2 translate-x-1/2 opacity-30 flex flex-col items-center">
         <span className="text-[7px] font-black text-white uppercase tracking-[0.6em]">Protocolo Trial v14.2</span>
         <span className="text-[9px] font-black text-orange-500 italic uppercase">Fase {step} de {stepsCount}</span>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, val, icon, color }: any) => (
  <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl">
     <div className={`p-4 rounded-2xl ${color === 'orange' ? 'bg-orange-600/20 text-orange-500' : color === 'blue' ? 'bg-blue-600/20 text-blue-500' : 'bg-emerald-600/20 text-emerald-500'}`}>
        {icon}
     </div>
     <div>
        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-2xl font-black text-white font-mono italic">$ {val.toLocaleString()}</span>
     </div>
  </div>
);

const CompactMatrixRow = ({ label, macroKey, rules, update, icon, periods }: any) => (
   <tr className="hover:bg-white/[0.04] transition-colors group">
      <td className="p-3 sticky left-0 bg-slate-950 z-30 border-r-2 border-white/10 group-hover:bg-slate-900 transition-colors w-[280px] min-w-[280px]">
         <div className="flex items-center gap-3">
            <div className="text-slate-600 group-hover:text-orange-500 transition-colors shrink-0">{icon || <Settings size={10}/>}</div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic truncate">{label}</span>
         </div>
      </td>
      {Array.from({ length: periods }).map((_, i) => {
         const lookupRound = Math.min(i, 12);
         
         let val = 0;
         if (macroKey === 'USD' || macroKey === 'EUR') {
            val = rules[i]?.exchange_rates?.[macroKey] ?? (DEFAULT_MACRO.exchange_rates[macroKey as CurrencyType] || 0);
         } else {
            val = rules[i]?.[macroKey] ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[lookupRound]?.[macroKey] ?? (DEFAULT_MACRO[macroKey] ?? 0));
         }

         const isNegative = val < 0;

         return (
            <td key={i} className={`p-1 border-r border-white/5 ${i === 0 ? 'bg-orange-600/5' : ''}`}>
               <input 
                  type="number" step="0.1"
                  value={val}
                  onChange={e => update(i, macroKey, parseFloat(e.target.value))}
                  className={`w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-2.5 text-center text-[10px] font-black outline-none focus:border-orange-500 transition-all shadow-inner ${i === 0 ? 'border-orange-500/40 text-white' : isNegative ? 'text-rose-500 border-rose-500/20' : 'text-white'}`}
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

const WizardField = ({ label, val, onChange, type = 'text', placeholder, step = "1" }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <input 
        type={type} 
        step={step}
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
