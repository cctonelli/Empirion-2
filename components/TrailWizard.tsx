
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
  BarChart, PieChart, Activity, Award, ClipboardList, ShoppingCart, UserPlus, Briefcase,
  Lock, Gavel, Newspaper, FileJson, Plus
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
    roundTime: 1, // BLOQUEADO EM 1 NO TRIAL
    roundUnit: 'hours' as DeadlineUnit, // BLOQUEADO EM HORAS NO TRIAL
    initialStockPrice: DEFAULT_INITIAL_SHARE_PRICE,
    currency: 'BRL' as CurrencyType,
    transparency: 'medium' as TransparencyLevel,
    gazetaMode: 'anonymous' as GazetaMode,
    dividend_percent: 25.0 
  });

  const [marketIndicators, setMarketIndicators] = useState<MacroIndicators>({
    ...DEFAULT_MACRO,
    ...DEFAULT_INDUSTRIAL_CHRONOGRAM[0] as MacroIndicators
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
            name: i === 0 ? 'REGIÃO SUL' : i === 1 ? 'ESTADOS UNIDOS' : i === 2 ? 'EUROPA' : `REGIÃO 0${i + 1}`,
            currency: i === 0 ? 'BRL' : i === 1 ? 'USD' : i === 2 ? 'EUR' : 'BRL',
            demand_weight: defaultWeight
          });
        }
      }
      const sliced = next.slice(0, formData.regionsCount);
      const currentSum = sliced.reduce((acc, r) => acc + r.demand_weight, 0);
      if (currentSum !== 100 && sliced.length > 0) sliced[sliced.length - 1].demand_weight += (100 - currentSum);
      return sliced;
    });
  }, [formData.regionsCount]);

  const updateRegion = (idx: number, updates: Partial<RegionConfig>) => {
    setRegionConfigs(prev => prev.map((r, i) => i === idx ? { ...r, ...updates } : r));
  };

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] } | null>({
    balance_sheet: INITIAL_FINANCIAL_TREE.balance_sheet as AccountNode[],
    dre: INITIAL_FINANCIAL_TREE.dre as AccountNode[],
    cash_flow: INITIAL_FINANCIAL_TREE.cash_flow as AccountNode[]
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
        description: "Experimente o melhor simulador de estratégia empresarial do mercado.",
        branch: 'industrial', status: 'active', current_round: 0, total_rounds: formData.totalRounds,
        deadline_value: formData.roundTime, deadline_unit: formData.roundUnit, regions_count: formData.regionsCount,
        region_names: regionConfigs.map(r => r.name), region_configs: regionConfigs, initial_financials: financials,
        initial_share_price: formData.initialStockPrice, currency: formData.currency, sales_mode: formData.marketMode,
        scenario_type: 'simulated' as ScenarioType, transparency_level: formData.transparency, gazeta_mode: formData.gazetaMode,
        is_trial: true, market_indicators: { ...marketIndicators, dividend_percent: formData.dividend_percent },
        round_rules: roundRules, observers: []
      }, teamsToCreate, true);
      onComplete();
    } catch (e: any) { alert(`FALHA NA INICIALIZAÇÃO DO NODO: ${e.message}`); } finally { setIsSubmitting(false); }
  };

  const updateRoundMacro = (round: number, key: string, val: any) => {
    // Read only check if needed, but here it's purely UI based on user request for READONLY visualization
    setRoundRules(prev => ({ ...prev, [round]: { ...(prev[round] || {}), [key]: val } }));
  };

  const stepsCount = 7;
  const totalPeriods = formData.totalRounds + 1;
  const totalAssetsSummary = financials?.balance_sheet.find(n => n.id === 'assets')?.value || 0;
  const totalProfitSummary = financials?.dre.find(n => n.id === 'final_profit')?.value || 0;
  const totalEquitySummary = financials?.balance_sheet.find(n => n.id === 'liabilities_pl')?.children?.find(n => n.id === 'equity')?.value || 7252171.74;

  return (
    <div className="wizard-shell">
      <EmpireParticles />

      {/* HEADER FIXO DO WIZARD COM CTA GLOBAL */}
      <header className="wizard-header-fixed px-12 py-10 flex items-center justify-between border-b border-orange-500/30">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(249,115,22,0.4)]"><Rocket size={32} /></div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Trial Strategos</h2>
              <p className="text-[11px] font-black uppercase text-orange-500 tracking-[0.5em] mt-2 italic">Ambiente Sandbox • Oracle Master v13.2</p>
           </div>
        </div>
        <div className="flex items-center gap-10">
           <a 
             href="https://ai.google.dev/gemini-api/docs/billing" 
             target="_blank" 
             className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-indigo-950 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 active:scale-95"
           >
              <Zap size={14} fill="currentColor" /> MODO TRIAL – CONHEÇA NOSSOS PLANOS
           </a>
           <div className="flex gap-4">
              {Array.from({ length: stepsCount }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-700 ${step === i+1 ? 'w-20 bg-orange-600 shadow-[0_0_20px_#f97316]' : step > i+1 ? 'w-10 bg-emerald-500' : 'w-10 bg-white/5'}`} />
              ))}
           </div>
        </div>
      </header>

      <div ref={scrollRef} className="wizard-content custom-scrollbar">
        <div className="max-w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="IDENTIDADE DO TORNEIO" desc="CONFIGURAÇÕES GLOBAIS DA ARENA SANDBOX." />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2"><WizardField label="NOME DO TORNEIO" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="Ex: TORNEIO TRIAL MASTER" /></div>
                    <WizardSelect label="MOEDA BASE" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'}]} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <WizardField label="TEMPO ROUND" type="number" val={formData.roundTime} onChange={()=>{}} isLocked />
                      <WizardSelect label="Horas/Dias" val={formData.roundUnit} onChange={()=>{}} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} isLocked />
                    </div>

                    <WizardSelect label="GOVERNANÇA TÁTICA" val={formData.transparency} onChange={(v:any)=>setFormData({...formData, transparency: v as TransparencyLevel})} options={[{v:'low',l:'BAIXA (SIGILOSA)'},{v:'medium',l:'MÉDIA (PADRÃO)'},{v:'high',l:'ALTA (TRANSPARENTE)'},{v:'full',l:'TOTAL (OPEN DATA)'}]} />
                    <WizardSelect label="IDENTIDADE GAZETA" val={formData.gazetaMode} onChange={(v:any)=>setFormData({...formData, gazetaMode: v as GazetaMode})} options={[{v:'anonymous',l:'ANÔNIMA'},{v:'identified',l:'IDENTIFICADA'}]} />
                    
                    <WizardField label="TOTAL DE ROUNDS" type="number" val={formData.totalRounds} onChange={(v:any)=>setFormData({...formData, totalRounds: Math.min(12, Math.max(1, parseInt(v) || 0))})} />
                    <WizardField label="PREÇO AÇÃO INICIAL ($)" type="number" val={formData.initialStockPrice} onChange={(v:any)=>setFormData({...formData, initialStockPrice: parseFloat(v)})} />
                    <WizardField label="DIVIDENDOS (%)" type="number" val={formData.dividend_percent} onChange={(v:any)=>setFormData({...formData, dividend_percent: parseFloat(v)})} />
                 </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                 <WizardStepTitle icon={<Users size={32}/>} title="EQUIPES E BOTS" desc="DEFINA QUEM PARTICIPARÁ DA COMPETIÇÃO NO CLUSTER." />
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">Participantes</h4>
                       <div className="grid grid-cols-2 gap-8">
                          <WizardField label="EQUIPES HUMANAS" type="number" val={formData.humanTeamsCount} onChange={(v:any)=>setFormData({...formData, humanTeamsCount: Math.max(1, parseInt(v))})} />
                          <WizardField label="EQUIPES BOTS" type="number" val={formData.botsCount} onChange={(v:any)=>setFormData({...formData, botsCount: parseInt(v)})} />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                       {teamNames.map((n, i) => (
                          <div key={i} className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-600">ID 0{i+1}</span><input value={n} onChange={e => { const next = [...teamNames]; next[i] = e.target.value; setTeamNames(next); }} className="w-full bg-slate-900 border border-white/10 pl-14 pr-4 py-4 rounded-2xl text-[10px] font-black text-white uppercase outline-none focus:border-blue-500 transition-all" /></div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="GEOPOLÍTICA REGIONAL" desc="NOMINAÇÃO E PARÂMETROS DE MERCADO POR REGIÃO." />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {regionConfigs.map((reg, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-6 hover:border-orange-500/30 transition-all group">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-orange-500 uppercase italic">Região 0{idx+1}</span>
                            <MapPin size={14} className="text-slate-600 group-hover:text-orange-500 transition-colors" />
                         </div>
                         <input 
                           value={reg.name} 
                           onChange={e => updateRegion(idx, { name: e.target.value.toUpperCase() })} 
                           className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white uppercase outline-none focus:border-orange-500" 
                         />
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[8px] font-black text-slate-600 uppercase">Moeda</label>
                               <select 
                                 value={reg.currency} 
                                 onChange={e => updateRegion(idx, { currency: e.target.value as CurrencyType })}
                                 className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-[10px] font-black text-white outline-none"
                               >
                                  <option value="BRL">REAL</option>
                                  <option value="USD">DOLAR</option>
                                  <option value="EUR">EURO</option>
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[8px] font-black text-slate-600 uppercase">Demanda %</label>
                               <input 
                                 type="number" 
                                 value={reg.demand_weight} 
                                 onChange={e => updateRegion(idx, { demand_weight: parseInt(e.target.value) || 0 })}
                                 className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-[10px] font-black text-white outline-none"
                               />
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-center">
                    {/* Added missing Plus icon import to fix the error */}
                    <button onClick={() => setFormData({...formData, regionsCount: Math.min(15, formData.regionsCount + 1)})} className="p-4 bg-white/5 border border-dashed border-white/20 rounded-full text-slate-500 hover:text-white hover:bg-orange-600 hover:border-orange-500 transition-all active:scale-90"><Plus size={24}/></button>
                 </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 pb-20">
                 <WizardStepTitle icon={<Settings size={32}/>} title="REGRAS E PREMIAÇÕES" desc="DADOS BASE DA ECONOMIA DA ARENA TRIAL." />
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* INSUMOS */}
                    <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl">
                       <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-3 italic"><Package size={16}/> Insumos & Estocagem</h4>
                       <div className="space-y-6">
                          <WizardField label="MP-A ($)" type="number" val={marketIndicators.prices.mp_a} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: parseFloat(v)}})} />
                          <WizardField label="MP-B ($)" type="number" val={marketIndicators.prices.mp_b} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: parseFloat(v)}})} />
                          <WizardField label="ÁGIO COMPRAS ESP. (%)" type="number" val={marketIndicators.special_purchase_premium} onChange={(v:any)=>setMarketIndicators({...marketIndicators, special_purchase_premium: parseFloat(v)})} />
                          <div className="grid grid-cols-2 gap-4">
                            <WizardField label="ESTOCAGEM MP ($)" type="number" val={marketIndicators.prices.storage_mp} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, storage_mp: parseFloat(v)}})} />
                            <WizardField label="ESTOCAGEM PROD ($)" type="number" val={marketIndicators.prices.storage_finished} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, storage_finished: parseFloat(v)}})} />
                          </div>
                       </div>
                    </div>

                    {/* CAPEX */}
                    <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl">
                       <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-3 italic"><Cpu size={16}/> Ativo & CAPEX</h4>
                       <div className="space-y-6">
                          <WizardField label="MÁQUINA ALFA ($)" type="number" val={marketIndicators.machinery_values.alfa} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, alfa: parseFloat(v)}})} />
                          <WizardField label="MÁQUINA BETA ($)" type="number" val={marketIndicators.machinery_values.beta} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, beta: parseFloat(v)}})} />
                          <WizardField label="MÁQUINA GAMA ($)" type="number" val={marketIndicators.machinery_values.gama} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, gama: parseFloat(v)}})} />
                       </div>
                    </div>

                    {/* MERCADO */}
                    <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl">
                       <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3 italic"><ShoppingCart size={16}/> Mercado Base</h4>
                       <div className="space-y-6">
                          <WizardField label="PREÇO VENDA MÉDIO ($)" type="number" val={marketIndicators.avg_selling_price} onChange={(v:any)=>setMarketIndicators({...marketIndicators, avg_selling_price: parseFloat(v)})} />
                          <WizardField label="DISTRIBUIÇÃO UNIT. ($)" type="number" val={marketIndicators.prices.distribution_unit} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, distribution_unit: parseFloat(v)}})} />
                          <WizardField label="CAMPANHA MARKETING ($)" type="number" val={marketIndicators.prices.marketing_campaign} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, marketing_campaign: parseFloat(v)}})} />
                       </div>
                    </div>

                    {/* STAFFING */}
                    <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl">
                       <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-3 italic"><Briefcase size={16}/> Staffing & Payroll</h4>
                       <div className="space-y-6">
                          <WizardField label="SALÁRIO BASE P00 ($)" type="number" val={marketIndicators.hr_base.salary} onChange={(v:any)=>setMarketIndicators({...marketIndicators, hr_base: {...marketIndicators.hr_base, salary: parseFloat(v)}})} />
                          <WizardField label="HORAS PRODUÇÃO/HOMEM" type="number" val={marketIndicators.production_hours_period} onChange={(v:any)=>setMarketIndicators({...marketIndicators, production_hours_period: parseInt(v)})} />
                       </div>
                    </div>

                    {/* PREMIAÇÕES */}
                    <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl lg:col-span-2">
                       <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-3 italic"><Award size={16}/> Premiações por Precisão</h4>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <WizardField label="PRÊMIO: CUSTO UNIT. ($)" type="number" val={marketIndicators.award_values.cost_precision} onChange={(v:any)=>setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, cost_precision: parseFloat(v)}})} />
                          <WizardField label="PRÊMIO: FATURAMENTO ($)" type="number" val={marketIndicators.award_values.revenue_precision} onChange={(v:any)=>setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, revenue_precision: parseFloat(v)}})} />
                          <WizardField label="PRÊMIO: LUCRO LÍQUIDO ($)" type="number" val={marketIndicators.award_values.profit_precision} onChange={(v:any)=>setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, profit_precision: parseFloat(v)}})} />
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
                             <CompactMatrixRow readOnly periods={totalPeriods} label="ICE CRESC. ECONÔMICO (%)" macroKey="ice" rules={roundRules} update={updateRoundMacro} icon={<Activity size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="VARIAÇÕES DE DEMANDA (%)" macroKey="demand_variation" rules={roundRules} update={updateRoundMacro} icon={<Target size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="ÍNDICE DE INFLAÇÃO (%)" macroKey="inflation_rate" rules={roundRules} update={updateRoundMacro} icon={<Flame size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="ÍNDICE DE INADIMPLÊNCIA (%)" macroKey="customer_default_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="JUROS BANCÁRIOS + TR (%)" macroKey="interest_rate_tr" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="JUROS DE FORNECEDORES (%)" macroKey="supplier_interest" rules={roundRules} update={updateRoundMacro} icon={<Truck size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="RENDIMENTO APLICAÇÃO (%)" macroKey="investment_return_rate" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="IVA SOBRE COMPRAS (%)" macroKey="vat_purchases_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="IVA SOBRE VENDAS (%)" macroKey="vat_sales_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />							 
                             <CompactMatrixRow readOnly periods={totalPeriods} label="IMPOSTO DE RENDA (%)" macroKey="tax_rate_ir" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="MULTA POR ATRASOS (%)" macroKey="late_penalty_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="DESÁGIO VENDA MÁQUINAS (%)" macroKey="machine_sale_discount" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="ÁGIO COMPRAS ESPECIAIS (%)" macroKey="special_purchase_premium" rules={roundRules} update={updateRoundMacro} icon={<Package size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="ÁGIO EMPRÉSTIMO COMPULSÓRIO (%)" macroKey="compulsory_loan_agio" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="ENCARGOS SOCIAIS (%)" macroKey="social_charges" rules={roundRules} update={updateRoundMacro} icon={<Users size={10}/>} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="MATÉRIAS-PRIMAS (%)" macroKey="raw_material_a_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="MÁQUINA ALFA (%)" macroKey="machine_alpha_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="MÁQUINA BETA (%)" macroKey="machine_beta_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="MÁQUINA GAMA (%)" macroKey="machine_gamma_price_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="CAMPANHAS MARKETING (%)" macroKey="marketing_campaign_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="DISTRIBUIÇÃO DE PRODUTOS (%)" macroKey="distribution_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="GASTOS COM ESTOCAGEM (%)" macroKey="storage_cost_adjust" rules={roundRules} update={updateRoundMacro} />
							                <CompactMatrixRow readOnly periods={totalPeriods} label="TARIFA EXPORTAÇÃO EUA (%)" macroKey="export_tariff_usa" rules={roundRules} update={updateRoundMacro} />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="TARIFA EXPORTAÇÃO EURO (%)" macroKey="export_tariff_euro" rules={roundRules} update={updateRoundMacro} />							 
                             <CompactMatrixRow readOnly periods={totalPeriods} label="CÂMBIO: DÓLAR (USD)" macroKey="USD" rules={roundRules} update={updateRoundMacro} icon={<DollarSign size={10}/>} isExchange />
                             <CompactMatrixRow readOnly periods={totalPeriods} label="CÂMBIO: EURO (EUR)" macroKey="EUR" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} isExchange />

                             <tr className="hover:bg-white/[0.03] transition-colors">
                                <td className="p-4 sticky left-0 bg-slate-950 z-30 font-black text-[9px] text-emerald-400 uppercase tracking-widest border-r-2 border-white/10 whitespace-nowrap flex items-center gap-2"><HardDrive size={10}/> LIBERAR COMPRA/VENDA MÁQUINAS</td>
                                {Array.from({ length: totalPeriods }).map((_, i) => (
                                   <td key={i} className="p-2 border-r border-white/5 text-center">
                                      <button 
                                        disabled
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
                                        disabled
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
                 <WizardStepTitle icon={<Calculator size={32}/>} title="CONTÁBIL E FINANCEIRO" desc="DADOS INICIAIS DO ROUND ZERO (IMUTÁVEL NO MODO TRIAL)." />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <SummaryCard label="ATIVO TOTAL P00" val={totalAssetsSummary} icon={<PieChart size={20}/>} color="orange" />
                    <SummaryCard label="PATRIMÔNIO LÍQUIDO P00" val={totalEquitySummary} icon={<BarChart size={20}/>} color="blue" />
                    <SummaryCard label="RESULTADO LÍQUIDO P00" val={totalProfitSummary} icon={<Activity size={20}/>} color="emerald" />
                 </div>
                 
                 <div className="bg-slate-950/90 p-4 rounded-[4rem] border-2 border-white/10 relative group">
                    <div className="absolute top-4 right-10 z-50">
                       <span className="px-6 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-full font-black text-[8px] uppercase tracking-widest flex items-center gap-2">
                          <Lock size={10}/> Visualização de Baseline Trial
                       </span>
                    </div>
                    <FinancialStructureEditor readOnly initialBalance={financials?.balance_sheet} initialDRE={financials?.dre} initialCashFlow={financials?.cash_flow} />
                 </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="s7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-24 text-center space-y-12">
                 <div className="w-40 h-40 bg-orange-600 rounded-[4rem] flex items-center justify-center mx-auto shadow-[0_20px_80px_rgba(249,115,22,0.4)] animate-bounce border-4 border-orange-400/50"><ShieldCheck size={80} className="text-white" strokeWidth={3} /></div>
                 <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter">Arena Pronta</h1>
                 <p className="text-2xl text-slate-400 font-medium italic">Sincronizando Cluster Sandbox com Oracle Engine...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="floating-nav-btn left-10"><ChevronLeft size={32} /></button>
      {step === stepsCount ? (
        <button onClick={handleLaunch} disabled={isSubmitting} className="floating-nav-btn-primary">{isSubmitting ? <><Loader2 className="animate-spin" size={24}/> Sincronizando...</> : 'Lançar Arena Trial'}</button>
      ) : (
        <button onClick={() => setStep(s => s + 1)} className="floating-nav-btn right-10"><ChevronRight size={32} /></button>
      )}
    </div>
  );
};

const SummaryCard = ({ label, val, icon, color }: any) => (
  <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl">
     <div className={`p-4 rounded-2xl ${color === 'orange' ? 'bg-orange-600/20 text-orange-500' : color === 'blue' ? 'bg-blue-600/20 text-blue-500' : 'bg-emerald-600/20 text-emerald-500'}`}>{icon}</div>
     <div><span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span><span className="text-2xl font-black text-white font-mono italic">$ {val.toLocaleString()}</span></div>
  </div>
);

const CompactMatrixRow = ({ label, macroKey, rules, update, icon, periods, isExchange, readOnly }: any) => (
   <tr className="hover:bg-white/[0.04] transition-colors group">
      <td className="p-3 sticky left-0 bg-slate-950 z-30 border-r-2 border-white/10 group-hover:bg-slate-900 transition-colors w-[280px] min-w-[280px]"><div className="flex items-center gap-3"><div className="text-slate-600 group-hover:text-orange-500 transition-colors shrink-0">{icon || <Settings size={10}/>}</div><span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic truncate">{label}</span></div></td>
      {Array.from({ length: periods }).map((_, i) => {
         const lookupRound = Math.min(i, 12);
         const val = rules[i]?.[macroKey] ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[lookupRound]?.[macroKey] ?? 0);
         return (
            <td key={i} className={`p-1 border-r border-white/5 ${i === 0 ? 'bg-orange-600/5' : ''}`}>
              <input 
                type="number" 
                step={isExchange ? "0.01" : "0.1"} 
                value={isExchange ? val.toFixed(2) : val} 
                onChange={e => !readOnly && update(i, macroKey, parseFloat(e.target.value))} 
                readOnly={readOnly}
                className={`w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-2.5 text-center text-[10px] font-black outline-none transition-all shadow-inner ${readOnly ? 'cursor-not-allowed opacity-60 text-slate-400' : 'focus:border-orange-500 text-white'} ${i === 0 ? 'border-orange-500/40' : ''}`} 
              />
            </td>
         );
      })}
   </tr>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-8">
     <div className="p-5 bg-slate-900 border-2 border-orange-500/30 rounded-[2rem] text-orange-500 shadow-2xl flex items-center justify-center">{icon}</div>
     <div><h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3><p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic">{desc}</p></div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder, isLocked }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2 group-focus-within:text-orange-500 transition-colors italic flex items-center gap-2">
       {label} {isLocked && <Lock size={10} className="text-indigo-500" />}
     </label>
     <input 
       type={type} 
       value={val} 
       onChange={e => !isLocked && onChange(e.target.value)} 
       readOnly={isLocked}
       className={`w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-8 py-5 text-lg font-bold text-white outline-none transition-all shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)] placeholder:text-slate-800 font-mono ${isLocked ? 'cursor-not-allowed border-indigo-500/20 opacity-60' : 'focus:border-orange-600'}`} 
       placeholder={placeholder} 
     />
  </div>
);

const WizardSelect = ({ label, val, onChange, options, isLocked }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2 group-focus-within:text-orange-500 transition-colors italic flex items-center gap-2">
       {label} {isLocked && <Lock size={10} className="text-indigo-500" />}
     </label>
     <div className="relative">
        <select 
          value={val} 
          onChange={e => !isLocked && onChange(e.target.value)} 
          disabled={isLocked}
          className={`w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-8 py-5 text-[11px] font-black text-white uppercase outline-none transition-all appearance-none shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)] ${isLocked ? 'cursor-not-allowed border-indigo-500/20 opacity-60' : 'cursor-pointer focus:border-orange-600'}`}
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
