
import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Loader2, Globe, Users, Target, 
  Settings2, ChevronLeft, ChevronRight,
  PieChart, BarChart, Activity, Flame, Package, MapPin, 
  Truck, Coins, ClipboardList, HardDrive, ShieldAlert, Plus, Trash2,
  DollarSign, Cpu, Zap, Award, Star, CheckCircle2, Box, Scale, TrendingUp,
  BarChart3, Landmark, Calculator, Info, ShieldCheck, ZapOff
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { createChampionshipWithTeams } from '../services/supabase';
import { INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import FinancialStructureEditor from './FinancialStructureEditor';
import EmpireParticles from './EmpireParticles';
import { Branch, SalesMode, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, RegionConfig, TransparencyLevel, GazetaMode } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

const TrialWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    humanTeamsCount: 1,
    botsCount: 2,
    marketMode: 'hybrid' as SalesMode,
    regionsCount: 4,
    totalRounds: 12, 
    roundTime: 1, 
    roundUnit: 'hours' as DeadlineUnit,
    initialStockPrice: DEFAULT_INITIAL_SHARE_PRICE,
    currency: 'BRL' as CurrencyType,
    transparency: 'medium' as TransparencyLevel,
    gazetaMode: 'anonymous' as GazetaMode,
    dividend_percent: 25.0,
    branch: 'industrial' as Branch
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
    if (regionConfigs.length === 0) {
      setRegionConfigs([
        { id: 1, name: 'BRASIL (LOCAL)', currency: 'BRL', demand_weight: 40 },
        { id: 2, name: 'EUA (EXPORT)', currency: 'USD', demand_weight: 20 },
        { id: 3, name: 'EUROPA (EXPORT)', currency: 'EUR', demand_weight: 20 },
        { id: 4, name: 'CHINA (EXPORT)', currency: 'CNY', demand_weight: 20 },
      ]);
    }
  }, []);

  const addRegion = () => {
    const nextId = regionConfigs.length + 1;
    setRegionConfigs([...regionConfigs, { id: nextId, name: `REGIÃO 0${nextId}`, currency: 'BRL', demand_weight: 10 }]);
  };

  const updateRegion = (index: number, updates: Partial<RegionConfig>) => {
    const next = [...regionConfigs];
    next[index] = { ...next[index], ...updates };
    setRegionConfigs(next);
  };

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] }>(INITIAL_FINANCIAL_TREE as any);

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
        ...formData,
        region_names: regionConfigs.map(r => r.name), 
        region_configs: regionConfigs, 
        initial_financials: financials,
        is_trial: true, 
        market_indicators: { ...marketIndicators, dividend_percent: formData.dividend_percent, region_configs: regionConfigs },
        round_rules: roundRules, 
      }, teamsToCreate, true);
      onComplete();
    } catch (e: any) { alert(`FALHA NA ARENA: ${e.message}`); } finally { setIsSubmitting(false); }
  };

  const updateRoundMacro = (round: number, key: string, val: any) => {
    setRoundRules(prev => ({ ...prev, [round]: { ...(prev[round] || {}), [key]: val } }));
  };

  const stepsCount = 7;
  const totalPeriods = formData.totalRounds + 1;
  const totalAssets = financials?.balance_sheet.find(n => n.id === 'assets')?.value || 0;
  const totalEquity = financials?.balance_sheet.find(n => n.id === 'liabilities_pl')?.children?.find(n => n.id === 'equity')?.value || 7252171.74;

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      <EmpireParticles />

      {/* ORANGE CLOUDS SEBRAE STYLE */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity }} className="orange-cloud-pulse w-[1000px] h-[1000px] bg-orange-600/30 -top-[20%] -left-[10%]" />
         <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1], x: [0, -40, 0] }} transition={{ duration: 25, repeat: Infinity }} className="orange-cloud-pulse w-[800px] h-[800px] bg-blue-600/20 -bottom-[10%] -right-[10%]" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617] z-[1]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#020617]/80 backdrop-blur-3xl border-b border-white/10 px-8 md:px-16 py-8 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(249,115,22,0.4)] border border-orange-400/30">
            <Rocket size={32} />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">Sandbox <span className="text-orange-600">Setup</span></h2>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em] mt-2 italic">Oracle Protocol v18.0 Gold</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {Array.from({ length: stepsCount }).map((_, i) => {
            const s = i + 1;
            const isActive = step === s;
            const isCompleted = step > s;
            return (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => setStep(s)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 border-2 ${isActive ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_30px_rgba(249,115,22,0.6)] scale-110' : isCompleted ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-600 hover:text-slate-400'}`}
                >
                  {s}
                </button>
                {s < stepsCount && <div className={`w-6 h-0.5 mx-1 rounded-full ${isCompleted ? 'bg-emerald-500/50' : 'bg-white/5'}`} />}
              </div>
            );
          })}
        </div>
      </header>

      <div ref={scrollRef} className="pt-40 pb-40 max-w-7xl mx-auto px-8 lg:px-16 custom-scrollbar min-h-screen relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16">
              <WizardStepTitle icon={<Globe size={48}/>} title="Identidade da Arena" desc="Configurações globais de governança e reporte financeiro." />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  <WizardField label="Nome do Torneio" val={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Ex: TORNEIO INDUSTRIAL ELITE 2026" />
                </div>
                <WizardSelect label="Moeda de Auditoria" val={formData.currency} onChange={v => setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'Real (R$)'},{v:'USD',l:'Dólar ($)'},{v:'EUR',l:'Euro (€)'},{v:'CNY',l:'Yuan (¥)'},{v:'BTC',l:'Bitcoin (₿)'}]} />
                
                <div className="grid grid-cols-2 gap-8">
                  <WizardField label="Tempo/Round" type="number" val={formData.roundTime} onChange={()=>{}} isLocked />
                  <WizardSelect label="Unidade" val={formData.roundUnit} onChange={()=>{}} options={[{v:'hours',l:'Horas'},{v:'days',l:'Dias'}]} isLocked />
                </div>

                <WizardSelect label="Nível de Transparência" val={formData.transparency} onChange={v => setFormData({...formData, transparency: v as TransparencyLevel})} options={[{v:'low',l:'Baixa (Sigilosa)'},{v:'medium',l:'MÉDIA (Padrão)'},{v:'high',l:'Alta (Transparente)'}]} />
                <WizardSelect label="Modo da Gazeta" val={formData.gazetaMode} onChange={v => setFormData({...formData, gazetaMode: v as GazetaMode})} options={[{v:'anonymous',l:'ANÔNIMA'},{v:'identified',l:'IDENTIFICADA'}]} />
                
                <WizardField label="Duração (Rounds)" type="number" val={formData.totalRounds} onChange={v => setFormData({...formData, totalRounds: Math.min(12, Math.max(1, parseInt(v)||1))})} />
                <WizardField label="Preço Unit. Ação" type="currency" currency={formData.currency} val={formData.initialStockPrice} onChange={v => setFormData({...formData, initialStockPrice: v})} />
                <WizardField label="Dividendos (%)" type="number" val={formData.dividend_percent} onChange={v => setFormData({...formData, dividend_percent: parseFloat(v)})} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-16">
              <WizardStepTitle icon={<Users size={48}/>} title="Grid de Competidores" desc="Composição do cluster entre equipes humanas e unidades IA." />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="bg-slate-900/60 backdrop-blur-xl p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10">
                   <h4 className="text-2xl font-black text-orange-500 uppercase italic tracking-tight flex items-center gap-3 border-b border-white/5 pb-6">Configurar Nodes</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <WizardField label="Human Nodes" type="number" val={formData.humanTeamsCount} onChange={v => setFormData({...formData, humanTeamsCount: Math.max(1, parseInt(v)||1)})} />
                      <WizardField label="Synthetic Bots" type="number" val={formData.botsCount} onChange={v => setFormData({...formData, botsCount: parseInt(v)||0})} />
                   </div>
                </div>
                <div className="bg-slate-950/40 p-10 rounded-[4rem] border border-white/5 max-h-[600px] overflow-y-auto custom-scrollbar space-y-4">
                  {teamNames.map((name, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 group-focus-within:text-orange-500 transition-colors uppercase">Node 0{idx+1}</div>
                      <input value={name} onChange={e => { const updated = [...teamNames]; updated[idx] = e.target.value.toUpperCase(); setTeamNames(updated); }} className="w-full bg-slate-900 border border-white/10 pl-24 pr-8 py-6 rounded-3xl text-lg font-black text-white uppercase outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-inner" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16">
              <WizardStepTitle icon={<MapPin size={48}/>} title="Nodos de Mercado" desc="Configure regiões geográficas e pesos de demanda." />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-10">
                <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Matriz Regional</h4>
                <button onClick={addRegion} className="px-12 py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-orange-950 transition-all shadow-[0_15px_40px_rgba(249,115,22,0.3)] flex items-center gap-3 active:scale-95">
                  <Plus size={20} strokeWidth={3} /> Adicionar Nodo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {regionConfigs.map((region, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-10 space-y-10 hover:border-orange-500/40 transition-all shadow-2xl relative overflow-hidden group">
                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">Identificador Regional</label>
                      <input value={region.name} onChange={e => updateRegion(idx, { name: e.target.value.toUpperCase() })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-base font-black text-white uppercase outline-none focus:border-orange-500 shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">Moeda Local</label>
                        <select value={region.currency} onChange={e => updateRegion(idx, { currency: e.target.value as CurrencyType })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none focus:border-orange-600 appearance-none cursor-pointer">
                          <option value="BRL">BRL</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="CNY">CNY</option><option value="BTC">BTC</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic ml-2">Demanda (%)</label>
                        <input type="number" value={region.demand_weight} onChange={e => updateRegion(idx, { demand_weight: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-center text-3xl font-mono font-black text-orange-400 outline-none focus:border-orange-500 shadow-inner" />
                      </div>
                    </div>
                    {regionConfigs.length > 1 && (
                      <button onClick={() => setRegionConfigs(regionConfigs.filter((_, i) => i !== idx))} className="absolute top-6 right-6 p-3 text-slate-700 hover:text-rose-500 transition-colors">
                        <Trash2 size={24} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-16">
              <WizardStepTitle icon={<Settings2 size={48}/>} title="Parâmetros de Custo" desc="Valores base para insumos, ativos de capital e premiações." />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10">
                  <h4 className="text-xl font-black text-orange-500 uppercase italic tracking-widest border-b border-white/5 pb-6">Insumos & Stock</h4>
                  <div className="space-y-10">
                    <WizardField label="MP-A Base ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.mp_a} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: v}})} />
                    <WizardField label="MP-B Base ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.mp_b} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: v}})} />
                    <WizardField label="Ágio Compra Especial (%)" type="number" val={marketIndicators.special_purchase_premium} onChange={v => setMarketIndicators({...marketIndicators, special_purchase_premium: parseFloat(v)})} />
                    <div className="grid grid-cols-2 gap-6">
                      <WizardField label="Estocagem MP" type="currency" currency={formData.currency} val={marketIndicators.prices.storage_mp} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, storage_mp: v}})} />
                      <WizardField label="Estocagem PA" type="currency" currency={formData.currency} val={marketIndicators.prices.storage_finished} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, storage_finished: v}})} />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10">
                  <h4 className="text-xl font-black text-blue-500 uppercase italic tracking-widest border-b border-white/5 pb-6">Ativo Fixo (Capex)</h4>
                  <div className="space-y-10">
                    <WizardField label="Máquina Alfa ($)" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.alfa} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, alfa: v}})} />
                    <WizardField label="Máquina Beta ($)" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.beta} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, beta: v}})} />
                    <WizardField label="Máquina Gama ($)" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.gama} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, gama: v}})} />
                    <WizardField label="Deságio Venda (%)" type="number" val={marketIndicators.machine_sale_discount} onChange={v => setMarketIndicators({...marketIndicators, machine_sale_discount: parseFloat(v)})} />
                  </div>
                </div>
                <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10">
                  <h4 className="text-xl font-black text-emerald-500 uppercase italic tracking-widest border-b border-white/5 pb-6">Mercado & RH</h4>
                  <div className="space-y-10">
                    <WizardField label="Preço Venda Médio ($)" type="currency" currency={formData.currency} val={marketIndicators.avg_selling_price} onChange={v => setMarketIndicators({...marketIndicators, avg_selling_price: v})} />
                    <WizardField label="Distribuição Unit. ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.distribution_unit} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, distribution_unit: v}})} />
                    <WizardField label="Base Marketing ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.marketing_campaign} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, marketing_campaign: v}})} />
                    <WizardField label="Salário Base P00 ($)" type="currency" currency={formData.currency} val={marketIndicators.hr_base.salary} onChange={v => setMarketIndicators({...marketIndicators, hr_base: {...marketIndicators.hr_base, salary: v}})} />
                    <WizardField label="Prod. Horas/Período" type="number" val={marketIndicators.production_hours_period} onChange={v => setMarketIndicators({...marketIndicators, production_hours_period: parseInt(v)})} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
              <WizardStepTitle icon={<BarChart3 size={48}/>} title="Matriz Econômica" desc="Cronograma de indicadores macroeconômicos por período." />
              <div className="bg-slate-950 border-2 border-white/10 rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0 font-mono">
                      <thead className="sticky top-0 z-50 bg-slate-900 shadow-xl">
                        <tr className="text-[10px] font-black uppercase text-slate-500 border-b border-white/10">
                          <th className="p-8 bg-slate-950 sticky left-0 min-w-[350px] border-r-2 border-white/10 text-left">Indicador / Regra Oracle</th>
                          {Array.from({ length: totalPeriods }).map((_, i) => (
                            <th key={i} className={`p-6 text-center min-w-[120px] border-r border-white/5 ${i === 0 ? 'bg-orange-600/10' : ''}`}>
                              <span className="text-orange-500">P{i < 10 ? `0${i}` : i}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        <CompactMatrixRow periods={totalPeriods} label="ICE CRESC. ECONÔMICO (%)" macroKey="ice" rules={roundRules} update={updateRoundMacro} icon={<Activity size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="VARIAÇÕES DE DEMANDA (%)" macroKey="demand_variation" rules={roundRules} update={updateRoundMacro} icon={<Target size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="ÍNDICE DE INFLAÇÃO (%)" macroKey="inflation_rate" rules={roundRules} update={updateRoundMacro} icon={<Flame size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="ÍNDICE DE INADIMPLÊNCIA (%)" macroKey="customer_default_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="JUROS BANCÁRIOS + TR (%)" macroKey="interest_rate_tr" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="JUROS DE FORNECEDORES (%)" macroKey="supplier_interest" rules={roundRules} update={updateRoundMacro} icon={<Truck size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="RENDIMENTO APLICAÇÃO (%)" macroKey="investment_return_rate" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="IVA SOBRE COMPRAS (%)" macroKey="vat_purchases_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="IVA SOBRE VENDAS (%)" macroKey="vat_sales_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />							 
                        <CompactMatrixRow periods={totalPeriods} label="IMPOSTO DE RENDA (%)" macroKey="tax_rate_ir" rules={roundRules} update={updateRoundMacro} icon={<Scale size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="MULTA POR ATRASOS (%)" macroKey="late_penalty_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="DESÁGIO VENDA MÁQUINAS (%)" macroKey="machine_sale_discount" rules={roundRules} update={updateRoundMacro} icon={<TrendingUp size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="ÁGIO COMPRAS ESPECIAIS (%)" macroKey="special_purchase_premium" rules={roundRules} update={updateRoundMacro} icon={<Package size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="ÁGIO EMPRÉSTIMO COMPULSÓRIO (%)" macroKey="compulsory_loan_agio" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="ENCARGOS SOCIAIS (%)" macroKey="social_charges" rules={roundRules} update={updateRoundMacro} icon={<Users size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="MATÉRIAS-PRIMAS (%)" macroKey="raw_material_a_adjust" rules={roundRules} update={updateRoundMacro} />
                        <CompactMatrixRow periods={totalPeriods} label="MÁQUINA ALFA (%)" macroKey="machine_alpha_price_adjust" rules={roundRules} update={updateRoundMacro} />
                        <CompactMatrixRow periods={totalPeriods} label="MÁQUINA BETA (%)" macroKey="machine_beta_price_adjust" rules={roundRules} update={updateRoundMacro} />
                        <CompactMatrixRow periods={totalPeriods} label="MÁQUINA GAMA (%)" macroKey="machine_gamma_price_adjust" rules={roundRules} update={updateRoundMacro} />
                        <CompactMatrixRow periods={totalPeriods} label="CAMPANHAS MARKETING (%)" macroKey="marketing_campaign_adjust" rules={roundRules} update={updateRoundMacro} />
                        <CompactMatrixRow periods={totalPeriods} label="DISTRIBUIÇÃO DE PRODUTOS (%)" macroKey="distribution_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                        <CompactMatrixRow periods={totalPeriods} label="GASTOS COM ESTOCAGEM (%)" macroKey="storage_cost_adjust" rules={roundRules} update={updateRoundMacro} />
                        <CompactMatrixRow periods={totalPeriods} label="TARIFA EXPORTAÇÃO EUA (%)" macroKey="export_tariff_usa" rules={roundRules} update={updateRoundMacro} />
                        <CompactMatrixRow periods={totalPeriods} label="TARIFA EXPORTAÇÃO EURO (%)" macroKey="export_tariff_euro" rules={roundRules} update={updateRoundMacro} />							 
                        <CompactMatrixRow periods={totalPeriods} label="TARIFA EXPORT CHINA" macroKey="export_tariff_china" rules={roundRules} update={updateRoundMacro} icon={<Globe size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="TARIFA EXPORT BTC" macroKey="export_tariff_btc" rules={roundRules} update={updateRoundMacro} icon={<Coins size={10}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: DÓLAR (USD)" macroKey="USD" rules={roundRules} update={updateRoundMacro} icon={<DollarSign size={10}/>} isExchange />
                        <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: EURO (EUR)" macroKey="EUR" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={10}/>} isExchange />
                        <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: YUAN (CNY)" macroKey="CNY" rules={roundRules} update={updateRoundMacro} icon={<Globe size={10}/>} isExchange />
                        <CompactMatrixRow periods={totalPeriods} label="CÂMBIO: BITCOIN (BTC)" macroKey="BTC" rules={roundRules} update={updateRoundMacro} icon={<Coins size={10}/>} isExchange />
                        
                        <tr className="hover:bg-white/[0.03] transition-colors">
                           <td className="p-6 sticky left-0 bg-slate-950 z-30 font-black text-[10px] text-emerald-400 uppercase tracking-widest border-r-2 border-white/10 flex items-center gap-4"><HardDrive size={16}/> LIBERAR COMPRA/VENDA MÁQUINAS</td>
                           {Array.from({ length: totalPeriods }).map((_, i) => (
                              <td key={i} className="p-4 border-r border-white/5 text-center">
                                 <button 
                                   onClick={() => updateRoundMacro(i, 'allow_machine_sale', !(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)))}
                                   className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase transition-all border-2 ${ (roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-700 opacity-40'}`}
                                 >
                                    {(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'SIM' : 'NÃO'}
                                 </button>
                              </td>
                           ))}
                        </tr>
                        <tr className="hover:bg-white/[0.03] transition-colors">
                           <td className="p-6 sticky left-0 bg-slate-950 z-30 font-black text-[10px] text-blue-400 uppercase tracking-widest border-r-2 border-white/10 flex items-center gap-4"><ClipboardList size={16}/> EXIGIR BUSINESS PLAN</td>
                           {Array.from({ length: totalPeriods }).map((_, i) => (
                              <td key={i} className="p-4 border-r border-white/5 text-center">
                                 <button 
                                   onClick={() => updateRoundMacro(i, 'require_business_plan', !(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)))}
                                   className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase transition-all border-2 ${ (roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-white/10 text-slate-700 opacity-40'}`}
                                 >
                                    {(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'SIM' : 'NÃO'}
                                 </button>
                              </td>
                           ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-16">
              <WizardStepTitle icon={<Calculator size={48}/>} title="Configuração Contábil" desc="Definição de ativos e balanço para o Período Zero." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <SummaryCard label="Ativo Total Consolidado" val={totalAssets} currency={formData.currency} icon={<PieChart size={32}/>} color="orange" />
                <SummaryCard label="Patrimônio Líquido Oracle" val={totalEquity} currency={formData.currency} icon={<BarChart size={32}/>} color="blue" />
              </div>
              <div className="bg-slate-900/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl">
                <FinancialStructureEditor 
                  initialBalance={financials.balance_sheet} 
                  initialDRE={financials.dre} 
                  initialCashFlow={financials.cash_flow} 
                  onChange={updated => setFinancials(updated as any)} 
                  currency={formData.currency} 
                />
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12 py-10">
              <div className="w-48 h-48 bg-orange-600 rounded-[5rem] flex items-center justify-center text-white shadow-[0_20px_100px_rgba(249,115,22,0.5)] animate-wow border-4 border-orange-400/50">
                 <CheckCircle2 size={100} />
              </div>
              <div className="space-y-6">
                 <h2 className="text-7xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Protocolo Pronto</h2>
                 <p className="text-2xl text-slate-400 max-w-2xl mx-auto italic leading-relaxed">
                   "A Arena Trial Master Node 08 está pronta para inicialização. Todas as variáveis Oracle v18.0 foram sincronizadas."
                 </p>
              </div>
              <div className="flex gap-4 pt-10">
                 <div className="px-6 py-2 bg-emerald-600/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14}/> Integridade Validada
                 </div>
                 <div className="px-6 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14}/> Sincronização em 128ms
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-12 flex justify-between items-center pointer-events-none z-[100] bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent">
         <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="pointer-events-auto p-10 bg-slate-900 text-white border-2 border-white/10 rounded-full shadow-[0_15px_60px_rgba(0,0,0,0.5)] hover:bg-white hover:text-slate-950 transition-all active:scale-90 disabled:opacity-0 disabled:pointer-events-none group">
            <ChevronLeft size={40} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
         </button>
         
         {step === stepsCount ? (
           <button onClick={handleLaunch} disabled={isSubmitting} className="pointer-events-auto px-24 py-10 bg-orange-600 text-white rounded-full font-black text-xl md:text-2xl uppercase tracking-[0.4em] shadow-[0_30px_100px_rgba(249,115,22,0.4)] hover:scale-105 hover:bg-white hover:text-orange-950 transition-all border-4 border-orange-400/50 flex items-center gap-10 active:scale-95 group">
              {isSubmitting ? <><Loader2 className="animate-spin" size={32}/> Sincronizando...</> : <><Rocket size={32} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" /> LANÇAR PROTOCOLO</>}
           </button>
         ) : (
           <button onClick={() => setStep(s => s + 1)} className="pointer-events-auto p-10 bg-orange-600 text-white border-2 border-orange-400/30 rounded-full shadow-[0_20px_80px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all active:scale-90 group">
              <ChevronRight size={40} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
           </button>
         )}
      </div>
    </div>
  );
};

const CompactMatrixRow = ({ label, macroKey, rules, update, icon, periods, isExchange = false }: any) => (
  <tr className="hover:bg-white/[0.04] transition-colors group">
    <td className="sticky left-0 z-30 bg-slate-950 p-8 border-r-2 border-white/10 group-hover:bg-slate-900 transition-colors min-w-[350px]">
      <div className="flex items-center gap-4">
        <div className="text-slate-600 group-hover:text-orange-500 transition-colors shrink-0">{icon || <Settings2 size={16}/>}</div>
        <span className="text-xs font-black text-slate-300 uppercase tracking-widest italic truncate">{label}</span>
      </div>
    </td>
    {Array.from({ length: periods }).map((_, i) => {
      const val = rules[i]?.[macroKey] ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[Math.min(i, 12)]?.[macroKey] ?? 0);
      return (
        <td key={i} className={`p-4 border-r border-white/5 text-center ${i === 0 ? 'bg-orange-600/5' : ''}`}>
          <input type="number" step={isExchange ? "0.000001" : "0.1"} value={val} onChange={e => update(i, macroKey, parseFloat(e.target.value))} className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl px-4 py-4 text-center text-sm font-black text-white outline-none focus:border-orange-500 transition-all shadow-inner" />
        </td>
      );
    })}
  </tr>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-12 border-b border-white/5 pb-16">
     <div className="p-10 bg-slate-900 border border-orange-500/30 rounded-[3.5rem] text-orange-500 shadow-2xl flex items-center justify-center relative group">
        <div className="absolute inset-0 bg-orange-600/20 rounded-[3.5rem] blur-2xl group-hover:blur-3xl transition-all" />
        {React.cloneElement(icon, { size: 56, className: 'relative z-10' })}
     </div>
     <div>
        <h3 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.5em] mt-6 italic">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder, isCurrency, currency, isLocked }: any) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (type === 'currency' && typeof val === 'number') {
      setDisplayValue(formatCurrency(val, currency, false));
    } else {
      setDisplayValue(String(val));
    }
  }, [val, type, currency]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawText = e.target.value;
    if (type === 'currency') {
      const digits = rawText.replace(/\D/g, '');
      const numericValue = parseInt(digits || '0') / 100;
      onChange(numericValue);
    } else if (type === 'number') {
      onChange(parseFloat(rawText) || 0);
    } else {
      onChange(rawText);
    }
  };

  return (
    <div className="space-y-5 text-left group">
       <label className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] ml-6 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
       <div className="relative">
         <input 
          type={type === 'currency' ? 'text' : type === 'number' ? 'number' : type} 
          value={type === 'currency' ? displayValue : val} 
          readOnly={isLocked}
          onChange={handleTextChange} 
          className={`w-full bg-slate-950 border-4 border-white/5 rounded-[2.5rem] px-12 py-10 text-2xl font-black text-white outline-none transition-all shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)] ${isLocked ? 'opacity-40 cursor-not-allowed' : 'focus:border-orange-600'} font-mono italic`} 
          placeholder={placeholder} 
         />
         {(isCurrency || type === 'currency') && <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs font-black text-slate-700 tracking-widest">{getCurrencySymbol(currency)}</span>}
       </div>
    </div>
  );
};

const WizardSelect = ({ label, val, onChange, options, isLocked }: any) => (
  <div className="space-y-5 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] ml-6 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative">
        <select 
          value={val} 
          disabled={isLocked}
          onChange={e => onChange(e.target.value)} 
          className={`w-full bg-slate-950 border-4 border-white/5 rounded-[2.5rem] px-12 py-10 text-[11px] font-black text-white uppercase outline-none transition-all shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)] appearance-none ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer focus:border-orange-600 italic'}`}
        >
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">
           <ChevronRight size={24} className="rotate-90" />
        </div>
     </div>
  </div>
);

const SummaryCard = ({ label, val, icon, color, currency }: any) => (
  <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 flex items-center gap-10 shadow-2xl hover:border-white/10 transition-all">
     <div className={`p-8 rounded-[2.5rem] ${color === 'orange' ? 'bg-orange-600/20 text-orange-500' : 'bg-blue-600/20 text-blue-500 shadow-blue-500/10'} shadow-2xl`}>{icon}</div>
     <div>
       <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic">{label}</span>
       <span className="text-5xl font-black text-white font-mono italic tracking-tighter">{formatCurrency(val, currency)}</span>
     </div>
  </div>
);

export default TrialWizard;
