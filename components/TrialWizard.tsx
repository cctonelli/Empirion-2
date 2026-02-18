
import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Loader2, Globe, Users, Target, 
  Settings2, ChevronLeft, ChevronRight,
  PieChart, BarChart, Activity, Flame, Package, MapPin, 
  Truck, Coins, ClipboardList, HardDrive, ShieldAlert, Plus, Trash2,
  DollarSign, Cpu, Zap, Award, Star, CheckCircle2, Box, Scale, TrendingUp,
  // Fix: Added missing icons reported by the build process
  BarChart3, Landmark, Calculator
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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <EmpireParticles />

      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Rocket size={28} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Sandbox Trial Setup</h2>
            <p className="text-xs font-black uppercase text-orange-500 tracking-widest mt-1">Nova Arena • Nodo {formData.currency}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {Array.from({ length: stepsCount }).map((_, i) => {
            const s = i + 1;
            const isActive = step === s;
            const isCompleted = step > s;
            return (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${isActive ? 'bg-orange-600 text-white shadow-[0_0_25px_rgba(249,115,22,0.6)] scale-110' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-400'}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </header>

      <div ref={scrollRef} className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-12 custom-scrollbar min-h-screen">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
              <WizardStepTitle icon={<Globe size={40}/>} title="IDENTIDADE DO TORNEIO" desc="Configurações globais da Arena Sandbox Trial" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <WizardField label="Nome do Torneio" val={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Ex: Torneio Trial Master 2026" />
                </div>
                <WizardSelect label="Moeda Base (Reporte)" val={formData.currency} onChange={v => setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'Real (R$)'},{v:'USD',l:'Dólar ($)'},{v:'EUR',l:'Euro (€)'},{v:'CNY',l:'Yuan (¥)'},{v:'BTC',l:'Bitcoin (₿)'}]} />
                
                <div className="grid grid-cols-2 gap-6">
                  <WizardField label="Tempo por Round" type="number" val={formData.roundTime} onChange={()=>{}} isLocked />
                  <WizardSelect label="Unidade" val={formData.roundUnit} onChange={()=>{}} options={[{v:'hours',l:'Horas'},{v:'days',l:'Dias'}]} isLocked />
                </div>

                <WizardSelect label="Nível de Transparência" val={formData.transparency} onChange={v => setFormData({...formData, transparency: v as TransparencyLevel})} options={[{v:'low',l:'Baixa (Sigilosa)'},{v:'medium',l:'MÉDIA (Padrão)'},{v:'high',l:'Alta (Transparente)'},{v:'full',l:'Total (Open Data)'}]} />
                <WizardSelect label="Identidade da Gazeta" val={formData.gazetaMode} onChange={v => setFormData({...formData, gazetaMode: v as GazetaMode})} options={[{v:'anonymous',l:'Anônima'},{v:'identified',l:'Identificada'}]} />
                
                <WizardField label="Total de Rounds" type="number" val={formData.totalRounds} onChange={v => setFormData({...formData, totalRounds: Math.min(12, Math.max(1, parseInt(v)||0))})} />
                <WizardField label="Preço Inicial da Ação" type="currency" currency={formData.currency} val={formData.initialStockPrice} onChange={v => setFormData({...formData, initialStockPrice: v})} />
                <WizardField label="Dividendos (%)" type="number" val={formData.dividend_percent} onChange={v => setFormData({...formData, dividend_percent: parseFloat(v)})} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16">
              <WizardStepTitle icon={<Users size={40}/>} title="EQUIPES E BOTS" desc="Defina a composição do cluster de competidores" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-slate-900/40 backdrop-blur-sm p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
                  <h4 className="text-xl font-black text-orange-400 uppercase tracking-wider border-b border-orange-500/20 pb-4">Participantes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <WizardField label="Equipes Humanas" type="number" val={formData.humanTeamsCount} onChange={v => setFormData({...formData, humanTeamsCount: Math.max(1, parseInt(v)||1)})} />
                    <WizardField label="Equipes Bots" type="number" val={formData.botsCount} onChange={v => setFormData({...formData, botsCount: parseInt(v)||0})} />
                  </div>
                </div>
                <div className="bg-slate-900/30 p-8 rounded-[3rem] border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar space-y-4">
                  {teamNames.map((name, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">ID 0{idx+1}</span>
                      <input value={name} onChange={e => { const updated = [...teamNames]; updated[idx] = e.target.value; setTeamNames(updated); }} className="w-full bg-slate-950 border border-white/10 pl-16 pr-6 py-5 rounded-2xl text-base font-bold text-white uppercase outline-none focus:border-orange-500 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16">
              <WizardStepTitle icon={<MapPin size={40}/>} title="MERCADOS E REGIÕES" desc="Peso da demanda, moedas locais e nodos de exportação" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <h4 className="text-2xl font-black text-white uppercase italic">Configuração de Regiões</h4>
                <button onClick={addRegion} className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-base uppercase tracking-wider hover:brightness-110 transition-all shadow-xl flex items-center gap-3 active:scale-95">
                  <Plus size={20} /> Adicionar Nodo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {regionConfigs.map((region, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 border border-white/10 rounded-[3rem] p-8 space-y-8 hover:border-orange-500/40 transition-all shadow-xl group relative overflow-hidden">
                    <div className="space-y-4">
                      <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">Nome da Região</label>
                      <input value={region.name} onChange={e => updateRegion(idx, { name: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-base font-bold text-white uppercase outline-none focus:border-orange-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">Moeda</label>
                        <select value={region.currency} onChange={e => updateRegion(idx, { currency: e.target.value as CurrencyType })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-base font-bold text-white outline-none focus:border-orange-500 appearance-none">
                          <option value="BRL">BRL</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="CNY">CNY</option><option value="BTC">BTC</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">Demanda (%)</label>
                        <input type="number" value={region.demand_weight} onChange={e => updateRegion(idx, { demand_weight: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-center text-2xl font-black text-orange-400 outline-none focus:border-orange-500" />
                      </div>
                    </div>
                    {regionConfigs.length > 1 && (
                      <button onClick={() => setRegionConfigs(regionConfigs.filter((_, i) => i !== idx))} className="absolute top-5 right-5 p-3 text-slate-500 hover:text-rose-400 transition-colors opacity-60 hover:opacity-100">
                        <Trash2 size={24} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16">
              <WizardStepTitle icon={<Settings2 size={40}/>} title="REGRAS E PREMIAÇÕES" desc="Parâmetros de custo base, mercado e incentivos de precisão" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
                  <h4 className="text-xl font-black text-orange-400 uppercase tracking-wider border-b border-orange-500/20 pb-4">Insumos e Estocagem</h4>
                  <div className="space-y-8">
                    <WizardField label="MP-A Base ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.mp_a} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: v}})} />
                    <WizardField label="MP-B Base ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.mp_b} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: v}})} />
                    <WizardField label="Ágio Compras Esp. (%)" type="number" val={marketIndicators.special_purchase_premium} onChange={v => setMarketIndicators({...marketIndicators, special_purchase_premium: parseFloat(v)})} />
                    <div className="grid grid-cols-2 gap-6">
                      <WizardField label="Estocagem MP ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.storage_mp} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, storage_mp: v}})} />
                      <WizardField label="Estocagem PA ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.storage_finished} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, storage_finished: v}})} />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
                  <h4 className="text-xl font-black text-blue-400 uppercase tracking-wider border-b border-blue-500/20 pb-4">Ativo Fixo & CapEx</h4>
                  <div className="space-y-8">
                    <WizardField label="Máquina Alfa ($)" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.alfa} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, alfa: v}})} />
                    <WizardField label="Máquina Beta ($)" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.beta} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, beta: v}})} />
                    <WizardField label="Máquina Gama ($)" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.gama} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, gama: v}})} />
                    <WizardField label="Deságio Venda (%)" type="number" val={marketIndicators.machine_sale_discount} onChange={v => setMarketIndicators({...marketIndicators, machine_sale_discount: parseFloat(v)})} />
                  </div>
                </div>
                <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
                  <h4 className="text-xl font-black text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 pb-4">Mercado & RH</h4>
                  <div className="space-y-8">
                    <WizardField label="Preço Venda Médio ($)" type="currency" currency={formData.currency} val={marketIndicators.avg_selling_price} onChange={v => setMarketIndicators({...marketIndicators, avg_selling_price: v})} />
                    <WizardField label="Distribuição Unit. ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.distribution_unit} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, distribution_unit: v}})} />
                    <WizardField label="Campanha Marketing ($)" type="currency" currency={formData.currency} val={marketIndicators.prices.marketing_campaign} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, marketing_campaign: v}})} />
                    <WizardField label="Salário Base P00 ($)" type="currency" currency={formData.currency} val={marketIndicators.hr_base.salary} onChange={v => setMarketIndicators({...marketIndicators, hr_base: {...marketIndicators.hr_base, salary: v}})} />
                    <WizardField label="Produção Horas/Homem" type="number" val={marketIndicators.production_hours_period} onChange={v => setMarketIndicators({...marketIndicators, production_hours_period: parseInt(v)})} />
                  </div>
                </div>
                <div className="lg:col-span-3 bg-gradient-to-br from-orange-950/30 to-slate-950 p-10 rounded-[4rem] border border-orange-500/20 shadow-2xl space-y-8">
                  <h4 className="text-xl font-black text-orange-400 uppercase tracking-wider">Premiações por Precisão (Audit Awards)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <WizardField label="Prêmio Custo Unit. ($)" type="currency" currency={formData.currency} val={marketIndicators.award_values.cost_precision} onChange={v => setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, cost_precision: v}})} />
                    <WizardField label="Prêmio Faturamento ($)" type="currency" currency={formData.currency} val={marketIndicators.award_values.revenue_precision} onChange={v => setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, revenue_precision: v}})} />
                    <WizardField label="Prêmio Lucro Líquido ($)" type="currency" currency={formData.currency} val={marketIndicators.award_values.profit_precision} onChange={v => setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, profit_precision: v}})} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16">
              <WizardStepTitle icon={<BarChart3 size={40}/>} title="MATRIZ ECONÔMICA ORACLE" desc="Indicadores macroeconômicos e regras por período (v18.0)" />
              <div className="bg-slate-950/80 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0 min-w-[1400px]">
                      <thead className="sticky top-0 z-20 bg-slate-900 shadow-lg">
                        <tr>
                          <th className="sticky left-0 z-30 bg-slate-950 p-6 text-left min-w-[380px] border-r border-white/10">
                            <span className="text-sm font-black uppercase tracking-wider text-slate-300">Indicador / Regra</span>
                          </th>
                          {Array.from({ length: totalPeriods }).map((_, i) => (
                            <th key={i} className={`p-6 text-center min-w-[130px] border-r border-white/5 ${i === 0 ? 'bg-orange-900/20' : ''}`}>
                              <div className="text-sm font-black uppercase tracking-wider text-orange-400">P{i < 10 ? `0${i}` : i}</div>
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
                           <td className="p-6 sticky left-0 bg-slate-950 z-30 font-black text-sm text-emerald-400 uppercase tracking-widest border-r border-white/10 whitespace-nowrap flex items-center gap-4"><HardDrive size={16}/> LIBERAR COMPRA/VENDA MÁQUINAS</td>
                           {Array.from({ length: totalPeriods }).map((_, i) => (
                              <td key={i} className="p-4 border-r border-white/5 text-center">
                                 <button 
                                   onClick={() => updateRoundMacro(i, 'allow_machine_sale', !(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)))}
                                   className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${ (roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg' : 'bg-slate-900 border-white/10 text-slate-600'}`}
                                 >
                                    {(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'SIM' : 'NÃO'}
                                 </button>
                              </td>
                           ))}
                        </tr>
                        <tr className="hover:bg-white/[0.03] transition-colors">
                           <td className="p-6 sticky left-0 bg-slate-950 z-30 font-black text-sm text-blue-400 uppercase tracking-widest border-r border-white/10 whitespace-nowrap flex items-center gap-4"><ClipboardList size={16}/> EXIGIR BUSINESS PLAN</td>
                           {Array.from({ length: totalPeriods }).map((_, i) => (
                              <td key={i} className="p-4 border-r border-white/5 text-center">
                                 <button 
                                   onClick={() => updateRoundMacro(i, 'require_business_plan', !(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)))}
                                   className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${ (roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-slate-900 border-white/10 text-slate-600'}`}
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
            <motion.div key="s6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16">
              <WizardStepTitle icon={<Calculator size={40}/>} title="ORACLE BASELINES" desc="Estrutura contábil inicial – Round Zero" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <SummaryCard label="Ativo Total" val={totalAssets} currency={formData.currency} icon={<PieChart size={28}/>} color="orange" />
                <SummaryCard label="Patrimônio Líquido" val={totalEquity} currency={formData.currency} icon={<BarChart size={28}/>} color="blue" />
              </div>
              <div className="flex flex-wrap gap-4 justify-center mb-10">
                {['Balanço Patrimonial', 'Demonstração de Resultado', 'Fluxo de Caixa'].map((tabName, idx) => (
                  <button key={tabName} onClick={() => setActiveTab(idx)} className={`px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 ${activeTab === idx ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-xl scale-105' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                    {tabName}
                  </button>
                ))}
              </div>
              <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/10 shadow-2xl min-h-[600px]">
                <FinancialStructureEditor 
                  initialBalance={activeTab === 0 ? financials.balance_sheet : undefined} 
                  initialDRE={activeTab === 1 ? financials.dre : undefined} 
                  initialCashFlow={activeTab === 2 ? financials.cash_flow : undefined} 
                  onChange={updated => setFinancials(updated as any)} currency={formData.currency} 
                />
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-12 py-20">
              <CheckCircle2 size={140} className="text-emerald-500 animate-pulse" />
              <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">Arena Trial Pronta</h2>
              <p className="text-2xl text-slate-400 max-w-3xl mx-auto italic">Protocolo Oracle v18.0 Gold sincronizado. O cluster temporário está pronto para simulação.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-10 flex justify-between items-center pointer-events-none z-[100]">
         <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="pointer-events-auto p-8 bg-slate-900 text-white border border-white/10 rounded-full shadow-2xl hover:bg-white hover:text-slate-950 transition-all active:scale-90 disabled:opacity-0">
            <ChevronLeft size={25} />
         </button>
         
         {step === stepsCount ? (
           <button onClick={handleLaunch} disabled={isSubmitting} className="pointer-events-auto px-20 py-8 bg-orange-600 text-white rounded-full font-black text-lg uppercase tracking-[0.3em] shadow-[0_20px_80px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all border-4 border-orange-400/50 flex items-center gap-6 active:scale-95">
              {isSubmitting ? <><Loader2 className="animate-spin" size={28}/> Sincronizando...</> : 'LANÇAR SANDBOX'}
           </button>
         ) : (
           <button onClick={() => setStep(s => s + 1)} className="pointer-events-auto p-8 bg-orange-600 text-white rounded-full shadow-2xl hover:bg-white hover:text-orange-950 transition-all active:scale-90 border-4 border-orange-400/50">
              <ChevronRight size={25} />
           </button>
         )}
      </div>
    </div>
  );
};

const CompactMatrixRow = ({ label, macroKey, rules, update, icon, periods, isExchange = false }: any) => (
  <tr className="hover:bg-white/[0.03] transition-colors group">
    <td className="sticky left-0 z-10 bg-slate-950 p-6 border-r border-white/10 group-hover:bg-slate-900 transition-colors min-w-[380px]">
      <div className="flex items-center gap-4">
        <div className="text-slate-500 group-hover:text-orange-400 transition-colors shrink-0">{icon || <Settings2 size={16}/>}</div>
        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider truncate">{label}</span>
      </div>
    </td>
    {Array.from({ length: periods }).map((_, i) => {
      const val = rules[i]?.[macroKey] ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[Math.min(i, 12)]?.[macroKey] ?? 0);
      return (
        <td key={i} className={`p-4 border-r border-white/5 text-center ${i === 0 ? 'bg-orange-900/10' : ''}`}>
          <input type="number" step={isExchange ? "0.000001" : "0.1"} value={val} onChange={e => update(i, macroKey, parseFloat(e.target.value))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-center text-sm font-bold text-white outline-none focus:border-orange-500 transition-all" />
        </td>
      );
    })}
  </tr>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-10 border-b border-white/5 pb-12">
     <div className="p-8 bg-slate-900 border border-orange-500/30 rounded-[3rem] text-orange-500 shadow-2xl flex items-center justify-center">{icon}</div>
     <div>
        <h3 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">{desc}</p>
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
    <div className="space-y-4 text-left group">
       <label className="text-xs font-black uppercase text-slate-500 tracking-[0.3em] ml-4 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
       <div className="relative">
         <input 
          type={type === 'currency' ? 'text' : type === 'number' ? 'number' : type} 
          value={type === 'currency' ? displayValue : val} 
          readOnly={isLocked}
          onChange={handleTextChange} 
          className={`w-full bg-slate-950 border-4 border-white/5 rounded-[2rem] px-10 py-7 text-xl font-bold text-white outline-none transition-all shadow-inner ${isLocked ? 'opacity-40 cursor-not-allowed' : 'focus:border-orange-600'} font-mono`} 
          placeholder={placeholder} 
         />
         {(isCurrency || type === 'currency') && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs font-black text-slate-700">{getCurrencySymbol(currency)}</span>}
       </div>
    </div>
  );
};

const WizardSelect = ({ label, val, onChange, options, isLocked }: any) => (
  <div className="space-y-4 text-left group">
     <label className="text-xs font-black uppercase text-slate-500 tracking-[0.3em] ml-4 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative">
        <select 
          value={val} 
          disabled={isLocked}
          onChange={e => onChange(e.target.value)} 
          className={`w-full bg-slate-950 border-4 border-white/5 rounded-[2rem] px-10 py-7 text-sm font-black text-white uppercase outline-none transition-all shadow-inner appearance-none ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer focus:border-orange-600'}`}
        >
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">
           <ChevronRight size={20} className="rotate-90" />
        </div>
     </div>
  </div>
);

const SummaryCard = ({ label, val, icon, color, currency }: any) => (
  <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 flex items-center gap-8 shadow-xl">
     <div className={`p-6 rounded-[2rem] ${color === 'orange' ? 'bg-orange-600/20 text-orange-500' : 'bg-blue-600/20 text-blue-500 shadow-blue-500/10'} shadow-2xl`}>{icon}</div>
     <div>
       <span className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
       <span className="text-4xl font-black text-white font-mono italic tracking-tighter">{formatCurrency(val, currency)}</span>
     </div>
  </div>
);

export default TrialWizard;