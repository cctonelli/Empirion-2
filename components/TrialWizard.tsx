
import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Loader2, Globe, Users, Target, 
  Settings2, ChevronLeft, ChevronRight,
  PieChart, BarChart, Activity, Flame, Package, MapPin, 
  Truck, Coins, ClipboardList, HardDrive, ShieldAlert, Plus, Trash2,
  DollarSign, Cpu, Zap, Award, Star, CheckCircle2, Box, Scale, TrendingUp,
  BarChart3, Landmark, Calculator, ArrowRight, Eye, Shield
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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
      <EmpireParticles />

      {/* Header fixo com Progresso Ativo */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-8 md:px-12 py-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Rocket size={28} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">Sandbox Trial</h2>
            <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] mt-1">Configuração Oracle v18.0 Gold</p>
          </div>
        </div>

        {/* Navegação por Steps (Principal agora) */}
        <div className="flex items-center gap-4">
          {Array.from({ length: stepsCount }).map((_, i) => {
            const s = i + 1;
            const isActive = step === s;
            const isCompleted = step > s;
            return (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`
                  w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 border
                  ${isActive 
                    ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_30px_rgba(249,115,22,0.5)] scale-110' 
                    : isCompleted 
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30'}
                `}
              >
                <span className="text-xs font-black">{s}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Viewport de Conteúdo Otimizado para Desktop Fluid */}
      <main ref={scrollRef} className="flex-1 pt-32 pb-10 px-6 md:px-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-full mx-auto w-full px-4 md:px-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                <WizardStepTitle icon={<Globe size={40}/>} title="Identidade do Torneio" desc="Definições globais de governança e reporte econômico." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2">
                    <WizardField label="Nome da Arena Trial" val={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Ex: Grand Prix Industrial 2026" />
                  </div>
                  <WizardSelect label="Moeda Base (Protocolo)" val={formData.currency} onChange={v => setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'},{v:'CNY',l:'YUAN (¥)'},{v:'BTC',l:'BITCOIN (₿)'}]} />
                  
                  <div className="grid grid-cols-2 gap-8">
                    <WizardField label="Duração Round" type="number" val={formData.roundTime} onChange={()=>{}} isLocked />
                    <WizardSelect label="Unidade Tempo" val={formData.roundUnit} onChange={()=>{}} options={[{v:'hours',l:'HORAS'},{v:'days',l:'DIAS'}]} isLocked />
                  </div>

                  <WizardSelect label="Transparência Auditoria" val={formData.transparency} onChange={v => setFormData({...formData, transparency: v as TransparencyLevel})} options={[{v:'low',l:'BAIXA (SIGILO)'},{v:'medium',l:'MÉDIA (PADRÃO)'},{v:'high',l:'ALTA (EXPOSTA)'},{v:'full',l:'TOTAL (OPEN)'}]} />
                  <WizardSelect label="Modo Oracle Gazette" val={formData.gazetaMode} onChange={v => setFormData({...formData, gazetaMode: v as GazetaMode})} options={[{v:'anonymous',l:'ANÔNIMA'},{v:'identified',l:'IDENTIFICADA'}]} />
                  
                  <WizardField label="Total de Ciclos (1-12)" type="number" val={formData.totalRounds} onChange={v => setFormData({...formData, totalRounds: Math.min(12, Math.max(1, parseInt(v)||0))})} />
                  <WizardField label="Preço Ação P00" type="currency" currency={formData.currency} val={formData.initialStockPrice} onChange={v => setFormData({...formData, initialStockPrice: v})} />
                  <WizardField label="Dividendos Min. (%)" type="number" val={formData.dividend_percent} onChange={v => setFormData({...formData, dividend_percent: parseFloat(v)})} />
                </div>
                <NextStepCall onNext={() => setStep(2)} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                <WizardStepTitle icon={<Users size={40}/>} title="Equipes e Participantes" desc="Composição do cluster de competidores e bots autônomos." />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4 bg-slate-900/40 p-10 rounded-[3rem] border border-white/10 shadow-2xl h-fit">
                    <h4 className="text-xl font-black text-orange-400 uppercase tracking-wider mb-8 italic">Volumetria</h4>
                    <div className="space-y-10">
                      <WizardField label="Equipes Humanas" type="number" val={formData.humanTeamsCount} onChange={v => setFormData({...formData, humanTeamsCount: Math.max(1, parseInt(v)||1)})} />
                      <WizardField label="Equipes Bots IA" type="number" val={formData.botsCount} onChange={v => setFormData({...formData, botsCount: parseInt(v)||0})} />
                    </div>
                  </div>
                  <div className="lg:col-span-8 bg-slate-900/30 p-10 rounded-[3rem] border border-white/5 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-6 italic">Nomenclatura das Unidades Strategos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {teamNames.map((name, idx) => (
                        <div key={idx} className="relative group">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 group-focus-within:text-orange-500">ID 0{idx+1}</span>
                          <input value={name} onChange={e => { const updated = [...teamNames]; updated[idx] = e.target.value; setTeamNames(updated); }} className="w-full bg-slate-950 border border-white/10 pl-16 pr-6 py-5 rounded-2xl text-base font-bold text-white uppercase outline-none focus:border-orange-500 transition-all shadow-inner" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <NextStepCall onNext={() => setStep(3)} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                <WizardStepTitle icon={<MapPin size={40}/>} title="Matriz de Nodos Regionais" desc="Configuração de regiões geográficas e pesos de demanda local." />
                <div className="flex justify-between items-center bg-slate-900/40 p-10 rounded-[3rem] border border-white/10 mb-8 shadow-2xl">
                  <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Nodos de Atividade em Operação</h4>
                  <button onClick={addRegion} className="px-12 py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_40px_rgba(249,115,22,0.3)] flex items-center gap-4 active:scale-95 transition-all">
                    <Plus size={24} strokeWidth={3} /> Adicionar Nodo de Consumo
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                  {regionConfigs.map((region, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 space-y-10 hover:border-orange-500/40 transition-all shadow-2xl relative group overflow-hidden">
                      <div className="space-y-6">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider italic">Identificador do Nodo</label>
                        <input value={region.name} onChange={e => updateRegion(idx, { name: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-base font-black text-white uppercase outline-none focus:border-orange-500 shadow-inner" />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider italic">Câmbio</label>
                          <select value={region.currency} onChange={e => updateRegion(idx, { currency: e.target.value as CurrencyType })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-base font-bold text-white outline-none focus:border-orange-500 appearance-none shadow-inner">
                            <option value="BRL">BRL</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="CNY">CNY</option><option value="BTC">BTC</option>
                          </select>
                        </div>
                        <div className="space-y-6">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider italic">Peso %</label>
                          <input type="number" value={region.demand_weight} onChange={e => updateRegion(idx, { demand_weight: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-center text-3xl font-black text-orange-400 outline-none focus:border-orange-500 shadow-inner" />
                        </div>
                      </div>
                      {regionConfigs.length > 1 && (
                        <button onClick={() => setRegionConfigs(regionConfigs.filter((_, i) => i !== idx))} className="absolute top-8 right-8 p-3 text-slate-600 hover:text-rose-500 transition-colors">
                          <Trash2 size={24} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
                <NextStepCall onNext={() => setStep(4)} />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12 h-full flex flex-col">
                <WizardStepTitle icon={<Settings2 size={40}/>} title="Regras e Premiações" desc="Parâmetros técnicos de custos, ativos e auditoria Oracle." />
                
                {/* Scroll vertical automático com altura flexível */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 overflow-y-auto max-h-[calc(100vh-450px)] pr-6 custom-scrollbar">
                  <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10 h-fit">
                    <h4 className="text-2xl font-black text-orange-400 uppercase tracking-tighter border-b border-orange-500/20 pb-6 italic">Cadeia de Insumos</h4>
                    <WizardField label="Matéria-Prima A (Base)" type="currency" currency={formData.currency} val={marketIndicators.prices.mp_a} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: v}})} />
                    <WizardField label="Matéria-Prima B (Base)" type="currency" currency={formData.currency} val={marketIndicators.prices.mp_b} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: v}})} />
                    <WizardField label="Ágio Compra Especial (%)" type="number" val={marketIndicators.special_purchase_premium} onChange={v => setMarketIndicators({...marketIndicators, special_purchase_premium: parseFloat(v)})} />
                    <div className="grid grid-cols-2 gap-6">
                      <WizardField label="Estoque MP" type="currency" currency={formData.currency} val={marketIndicators.prices.storage_mp} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, storage_mp: v}})} />
                      <WizardField label="Estoque PA" type="currency" currency={formData.currency} val={marketIndicators.prices.storage_finished} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, storage_finished: v}})} />
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10 h-fit">
                    <h4 className="text-2xl font-black text-blue-400 uppercase tracking-tighter border-b border-blue-500/20 pb-6 italic">CapEx & Infraestrutura</h4>
                    <WizardField label="Preço Máquina Alfa" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.alfa} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, alfa: v}})} />
                    <WizardField label="Preço Máquina Beta" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.beta} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, beta: v}})} />
                    <WizardField label="Preço Máquina Gama" type="currency" currency={formData.currency} val={marketIndicators.machinery_values.gama} onChange={v => setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, gama: v}})} />
                    <WizardField label="Deságio Venda (%)" type="number" val={marketIndicators.machine_sale_discount} onChange={v => setMarketIndicators({...marketIndicators, machine_sale_discount: parseFloat(v)})} />
                  </div>

                  <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10 h-fit">
                    <h4 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter border-b border-emerald-500/20 pb-6 italic">Mercado & RH</h4>
                    <WizardField label="Preço de Venda Médio" type="currency" currency={formData.currency} val={marketIndicators.avg_selling_price} onChange={v => setMarketIndicators({...marketIndicators, avg_selling_price: v})} />
                    <WizardField label="Custo Logístico Unit." type="currency" currency={formData.currency} val={marketIndicators.prices.distribution_unit} onChange={v => setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, distribution_unit: v}})} />
                    <WizardField label="Piso Salarial P00" type="currency" currency={formData.currency} val={marketIndicators.hr_base.salary} onChange={v => setMarketIndicators({...marketIndicators, hr_base: {...marketIndicators.hr_base, salary: v}})} />
                    <WizardField label="Horas Operacionais/Ciclo" type="number" val={marketIndicators.production_hours_period} onChange={v => setMarketIndicators({...marketIndicators, production_hours_period: parseInt(v)})} />
                  </div>

                  <div className="lg:col-span-3 bg-gradient-to-br from-indigo-900/20 to-slate-900 p-16 rounded-[5rem] border border-indigo-500/30 shadow-3xl space-y-10 h-fit mt-10">
                    <div className="flex items-center gap-6 mb-4">
                       <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20"><Award size={40} /></div>
                       <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle Integrity Awards</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      <WizardField label="Bônus Precisão Custo" type="currency" currency={formData.currency} val={marketIndicators.award_values.cost_precision} onChange={v => setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, cost_precision: v}})} />
                      <WizardField label="Bônus Precisão Receita" type="currency" currency={formData.currency} val={marketIndicators.award_values.revenue_precision} onChange={v => setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, revenue_precision: v}})} />
                      <WizardField label="Bônus Precisão Lucro" type="currency" currency={formData.currency} val={marketIndicators.award_values.profit_precision} onChange={v => setMarketIndicators({...marketIndicators, award_values: {...marketIndicators.award_values, profit_precision: v}})} />
                    </div>
                  </div>
                </div>
                <NextStepCall onNext={() => setStep(5)} />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                <WizardStepTitle icon={<BarChart3 size={40}/>} title="Matriz Econômica Oracle" desc="Cronograma de indicadores e regras de mercado (v18.0)." />
                
                {/* Expansão lateral máxima com Scroll Horizontal Automático */}
                <div className="bg-slate-950/80 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden relative group">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0 min-w-[3000px]">
                      <thead className="sticky top-0 z-30 bg-slate-900 shadow-2xl">
                        <tr>
                          <th className="sticky left-0 z-40 bg-slate-900 p-10 text-left border-r border-white/10 min-w-[500px]">
                            <span className="text-sm font-black uppercase tracking-widest text-slate-300 italic">Variável de Controle Sistêmico</span>
                          </th>
                          {Array.from({ length: totalPeriods }).map((_, i) => (
                            <th key={i} className={`p-8 text-center min-w-[180px] border-r border-white/5 ${i === 0 ? 'bg-orange-900/30' : ''}`}>
                              <div className="text-xl font-black uppercase tracking-tighter text-orange-400 italic">Ciclo P{i < 10 ? `0${i}` : i}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        <CompactMatrixRow periods={totalPeriods} label="ICE (CRESCIMENTO ECONÔMICO %)" macroKey="ice" rules={roundRules} update={updateRoundMacro} icon={<Activity size={20}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="VARIAÇÃO DE DEMANDA %" macroKey="demand_variation" rules={roundRules} update={updateRoundMacro} icon={<Target size={20}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="ÍNDICE DE INFLAÇÃO %" macroKey="inflation_rate" rules={roundRules} update={updateRoundMacro} icon={<Flame size={20}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="INADIMPLÊNCIA MÉDIA %" macroKey="customer_default_rate" rules={roundRules} update={updateRoundMacro} icon={<ShieldAlert size={20}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="JUROS BANCÁRIOS (TAXA TR %)" macroKey="interest_rate_tr" rules={roundRules} update={updateRoundMacro} icon={<Landmark size={20}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="IVA SOBRE COMPRAS %" macroKey="vat_purchases_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={20}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="IVA SOBRE VENDAS %" macroKey="vat_sales_rate" rules={roundRules} update={updateRoundMacro} icon={<Scale size={20}/>} />
                        <CompactMatrixRow periods={totalPeriods} label="DÓLAR (USD/BRL)" macroKey="USD" rules={roundRules} update={updateRoundMacro} icon={<DollarSign size={20}/>} isExchange />
                        <CompactMatrixRow periods={totalPeriods} label="EURO (EUR/BRL)" macroKey="EUR" rules={roundRules} update={updateRoundMacro} icon={<Globe size={20}/>} isExchange />
                        
                        {/* Regras Toggles v18.0 */}
                        <tr className="hover:bg-emerald-500/5 transition-colors">
                           <td className="p-10 sticky left-0 z-30 bg-slate-950 font-black text-sm text-emerald-400 uppercase tracking-widest border-r border-white/10 italic flex items-center gap-6">
                              <HardDrive size={24}/> Venda de Ativos (CapEx)
                           </td>
                           {Array.from({ length: totalPeriods }).map((_, i) => (
                              <td key={i} className="p-8 border-r border-white/5 text-center">
                                 <button 
                                   onClick={() => updateRoundMacro(i, 'allow_machine_sale', !(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)))}
                                   className={`w-full py-5 rounded-2xl text-xs font-black uppercase transition-all border-2 ${ (roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'bg-emerald-600 text-white border-emerald-400 shadow-xl scale-105' : 'bg-slate-900 border-white/10 text-slate-700 hover:text-slate-500'}`}
                                 >
                                    {(roundRules[i]?.allow_machine_sale ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.allow_machine_sale || false)) ? 'LIBERADO' : 'BLOQUEADO'}
                                 </button>
                              </td>
                           ))}
                        </tr>
                        <tr className="hover:bg-blue-500/5 transition-colors">
                           <td className="p-10 sticky left-0 z-30 bg-slate-950 font-black text-sm text-blue-400 uppercase tracking-widest border-r border-white/10 italic flex items-center gap-6">
                              <ClipboardList size={24}/> Exigir Business Plan
                           </td>
                           {Array.from({ length: totalPeriods }).map((_, i) => (
                              <td key={i} className="p-8 border-r border-white/5 text-center">
                                 <button 
                                   onClick={() => updateRoundMacro(i, 'require_business_plan', !(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)))}
                                   className={`w-full py-5 rounded-2xl text-xs font-black uppercase transition-all border-2 ${ (roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'bg-blue-600 text-white border-blue-400 shadow-xl scale-105' : 'bg-slate-900 border-white/10 text-slate-700 hover:text-slate-500'}`}
                                 >
                                    {(roundRules[i]?.require_business_plan ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[i]?.require_business_plan || false)) ? 'OBRIGATÓRIO' : 'OPCIONAL'}
                                 </button>
                              </td>
                           ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <NextStepCall onNext={() => setStep(6)} />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                <WizardStepTitle icon={<Calculator size={40}/>} title="Oracle Baselines" desc="Estrutura contábil inicial de Round Zero (P00)." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                  <SummaryCard label="Ativo Total Consolidado" val={totalAssets} currency={formData.currency} icon={<PieChart size={48}/>} color="orange" />
                  <SummaryCard label="Patrimônio Líquido Base" val={totalEquity} currency={formData.currency} icon={<BarChart size={48}/>} color="blue" />
                </div>
                <div className="bg-slate-900/60 p-16 rounded-[5rem] border border-white/10 shadow-3xl min-h-[600px]">
                  <FinancialStructureEditor 
                    initialBalance={financials.balance_sheet} 
                    initialDRE={financials.dre} 
                    initialCashFlow={financials.cash_flow} 
                    onChange={updated => setFinancials(updated as any)} 
                    currency={formData.currency} 
                  />
                </div>
                <NextStepCall onNext={() => setStep(7)} label="Sincronizar Protocolo" />
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="s7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-16 py-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 blur-[120px] opacity-20 animate-pulse" />
                  <CheckCircle2 size={200} className="text-emerald-500 relative z-10 drop-shadow-[0_0_60px_#10b981]" />
                </div>
                <div className="space-y-6">
                  <h2 className="text-8xl font-black text-white uppercase italic tracking-tighter leading-none">Arena Trial Pronta</h2>
                  <p className="text-3xl text-slate-400 max-w-4xl mx-auto italic font-medium leading-relaxed">
                    O cluster Oracle v18.0 Gold está estabilizado. <br/>
                    Todos os nodos regionais e baselines contábeis foram selados.
                  </p>
                </div>
                <button 
                  onClick={handleLaunch} 
                  disabled={isSubmitting} 
                  className="px-32 py-12 bg-orange-600 text-white rounded-full font-black text-3xl uppercase tracking-[0.4em] shadow-[0_40px_100px_rgba(249,115,22,0.6)] hover:bg-white hover:text-orange-950 transition-all border-8 border-orange-400/50 flex items-center gap-12 active:scale-95 transform"
                >
                   {isSubmitting ? <><Loader2 className="animate-spin" size={64}/> Sincronizando...</> : <><Rocket size={64} /> LANÇAR SANDBOX</>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const CompactMatrixRow = ({ label, macroKey, rules, update, icon, periods, isExchange = false }: any) => (
  <tr className="hover:bg-white/[0.04] transition-colors group/row">
    <td className="sticky left-0 z-20 bg-slate-950 p-10 border-r border-white/10 group-hover/row:bg-slate-900 transition-colors min-w-[500px]">
      <div className="flex items-center gap-8">
        <div className="text-slate-500 group-hover/row:text-orange-400 transition-colors shrink-0">{icon || <Settings2 size={24}/>}</div>
        <span className="text-base font-black text-slate-300 uppercase tracking-widest truncate italic">{label}</span>
      </div>
    </td>
    {Array.from({ length: periods }).map((_, i) => {
      const val = rules[i]?.[macroKey] ?? (DEFAULT_INDUSTRIAL_CHRONOGRAM[Math.min(i, 12)]?.[macroKey] ?? 0);
      return (
        <td key={i} className={`p-6 border-r border-white/5 text-center ${i === 0 ? 'bg-orange-600/10' : ''}`}>
          <input 
            type="number" 
            step={isExchange ? "0.000001" : "0.1"} 
            value={val} 
            onChange={e => update(i, macroKey, parseFloat(e.target.value))} 
            className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl px-6 py-5 text-center text-lg font-black text-white outline-none focus:border-orange-500 transition-all shadow-inner" 
          />
        </td>
      );
    })}
  </tr>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-12 border-b border-white/10 pb-16 mb-16">
     <div className="p-10 bg-slate-900 border-4 border-orange-500/30 rounded-[3rem] text-orange-500 shadow-3xl flex items-center justify-center shadow-orange-500/10">{icon}</div>
     <div>
        <h3 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-2xl font-black text-slate-500 uppercase tracking-[0.4em] mt-6 italic opacity-80">{desc}</p>
     </div>
  </div>
);

const NextStepCall = ({ onNext, label = "Continuar para Próximo Passo" }: { onNext: () => void, label?: string }) => (
  <div className="pt-16 mt-16 border-t border-white/10 flex justify-end">
    <button 
      onClick={onNext}
      className="px-20 py-10 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.5em] hover:bg-orange-600 hover:border-orange-400 transition-all shadow-3xl flex items-center gap-10 active:scale-95 group"
    >
      {label} <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" />
    </button>
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
    <div className="space-y-6 text-left group">
       <label className="text-sm font-black uppercase text-slate-500 tracking-[0.4em] ml-6 group-focus-within:text-orange-500 transition-colors italic leading-none">{label}</label>
       <div className="relative">
         <input 
          type={type === 'currency' ? 'text' : type === 'number' ? 'number' : type} 
          value={type === 'currency' ? displayValue : val} 
          readOnly={isLocked}
          onChange={handleTextChange} 
          className={`w-full bg-slate-950 border-4 border-white/10 rounded-[2.5rem] px-12 py-10 text-3xl font-black text-white outline-none transition-all shadow-inner ${isLocked ? 'opacity-40 cursor-not-allowed' : 'focus:border-orange-600'} font-mono`} 
          placeholder={placeholder} 
         />
         {(isCurrency || type === 'currency') && <span className="absolute right-12 top-1/2 -translate-y-1/2 text-sm font-black text-slate-700">{getCurrencySymbol(currency)}</span>}
       </div>
    </div>
  );
};

const WizardSelect = ({ label, val, onChange, options, isLocked }: any) => (
  <div className="space-y-6 text-left group">
     <label className="text-sm font-black uppercase text-slate-500 tracking-[0.4em] ml-6 group-focus-within:text-orange-500 transition-colors italic leading-none">{label}</label>
     <div className="relative">
        <select 
          value={val} 
          disabled={isLocked}
          onChange={e => onChange(e.target.value)} 
          className={`w-full bg-slate-950 border-4 border-white/10 rounded-[2.5rem] px-12 py-10 text-sm font-black text-white uppercase outline-none transition-all shadow-inner appearance-none ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer focus:border-orange-600'}`}
        >
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">
           <ChevronRight size={28} className="rotate-90" />
        </div>
     </div>
  </div>
);

const SummaryCard = ({ label, val, icon, color, currency }: any) => (
  <div className="bg-slate-900/80 p-16 rounded-[5rem] border border-white/10 flex items-center gap-12 shadow-4xl group hover:border-orange-500/30 transition-all">
     <div className={`p-10 rounded-[3rem] ${color === 'orange' ? 'bg-orange-600/20 text-orange-500 shadow-orange-500/10' : 'bg-blue-600/20 text-blue-500 shadow-blue-500/10'} shadow-3xl transition-transform group-hover:scale-110`}>{icon}</div>
     <div>
       <span className="block text-sm font-black text-slate-600 uppercase tracking-[0.5em] mb-4 italic">{label}</span>
       <span className="text-7xl font-black text-white font-mono italic tracking-tighter drop-shadow-2xl">{formatCurrency(val, currency)}</span>
     </div>
  </div>
);

export default TrialWizard;
