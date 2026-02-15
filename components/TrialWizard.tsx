
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
  Lock, Gavel, Newspaper, FileJson, Plus, Trash2
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { createChampionshipWithTeams } from '../services/supabase';
import { INITIAL_FINANCIAL_TREE, DEFAULT_INITIAL_SHARE_PRICE, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import FinancialStructureEditor from './FinancialStructureEditor';
import EmpireParticles from './EmpireParticles';
import { Branch, SalesMode, ScenarioType, ModalityType, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, RegionConfig, TransparencyLevel, GazetaMode } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

const TrialWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
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

  const updateRegion = (idx: number, updates: Partial<RegionConfig>) => {
    setRegionConfigs(prev => prev.map((r, i) => i === idx ? { ...r, ...updates } : r));
  };

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] } | null>(INITIAL_FINANCIAL_TREE as any);

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
        observers: []
      }, teamsToCreate, true);
      onComplete();
    } catch (e: any) { alert(`FALHA NA INICIALIZAÇÃO DO NODO: ${e.message}`); } finally { setIsSubmitting(false); }
  };

  const updateRoundMacro = (round: number, key: string, val: any) => {
    setRoundRules(prev => ({ ...prev, [round]: { ...(prev[round] || {}), [key]: val } }));
  };

  const stepsCount = 7;
  const totalPeriods = formData.totalRounds + 1;
  const totalAssetsSummary = financials?.balance_sheet.find(n => n.id === 'assets')?.value || 0;
  const totalEquitySummary = financials?.balance_sheet.find(n => n.id === 'liabilities_pl')?.children?.find(n => n.id === 'equity')?.value || 7252171.74;

  return (
    <div className="wizard-shell">
      <EmpireParticles />

      <header className="wizard-header-fixed px-12 py-10 flex items-center justify-between border-b border-orange-500/30">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(249,115,22,0.4)]"><Rocket size={32} /></div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">CONFIGURE O TORNEIO</h2>
              <p className="text-[11px] font-black uppercase text-orange-500 tracking-[0.5em] mt-2 italic">Sandbox • Moeda: {formData.currency}</p>
           </div>
        </div>
        <div className="flex gap-4">
           {Array.from({ length: stepsCount }).map((_, i) => (
             <div key={i} className={`h-2 rounded-full transition-all duration-700 ${step === i+1 ? 'w-20 bg-orange-600 shadow-[0_0_20px_#f97316]' : step > i+1 ? 'w-10 bg-emerald-500' : 'w-10 bg-white/5'}`} />
           ))}
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
                    <WizardSelect label="MOEDA BASE (REPORTE)" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'},{v:'CNY',l:'YUAN (¥)'},{v:'BTC',l:'BITCOIN (₿)'}]} />
                 </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 pb-24">
                 <WizardStepTitle icon={<Settings size={32}/>} title="REGRAS E PREMIAÇÕES" desc="CONFIGURAÇÃO DE CUSTOS BASE EM MÁSCARA LOCAL." />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-6 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">Insumos ({getCurrencySymbol(formData.currency)})</h4>
                       <WizardField label="MP-A Base" type="number" val={marketIndicators.prices.mp_a} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: parseFloat(v)}})} isCurrency currency={formData.currency} />
                       <WizardField label="MP-B Base" type="number" val={marketIndicators.prices.mp_b} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: parseFloat(v)}})} isCurrency currency={formData.currency} />
                    </div>
                    <div className="space-y-6 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                       <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">Ativo & CapEx ({getCurrencySymbol(formData.currency)})</h4>
                       <WizardField label="MÁQUINA ALFA" type="number" val={marketIndicators.machinery_values.alfa} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, alfa: parseFloat(v)}})} isCurrency currency={formData.currency} />
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Calculator size={32}/>} title="CONTÁBIL E FINANCEIRO" desc="DADOS INICIAIS DO ROUND ZERO." />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SummaryCard label="ATIVO TOTAL P00" val={totalAssetsSummary} currency={formData.currency} icon={<PieChart size={20}/>} color="orange" />
                    <SummaryCard label="PATRIMÔNIO LÍQUIDO P00" val={totalEquitySummary} currency={formData.currency} icon={<BarChart size={20}/>} color="blue" />
                 </div>
                 <FinancialStructureEditor 
                    initialBalance={financials?.balance_sheet} 
                    initialDRE={financials?.dre} 
                    initialCashFlow={financials?.cash_flow} 
                    onChange={(u) => setFinancials(u)}
                    currency={formData.currency}
                 />
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

const SummaryCard = ({ label, val, icon, color, currency }: any) => (
  <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/5 flex items-center gap-6 shadow-xl">
     <div className={`p-4 rounded-2xl ${color === 'orange' ? 'bg-orange-600/20 text-orange-500' : color === 'blue' ? 'bg-blue-600/20 text-blue-500' : 'bg-emerald-600/20 text-emerald-500'}`}>{icon}</div>
     <div>
       <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
       <span className="text-2xl font-black text-white font-mono italic">{formatCurrency(val, currency)}</span>
     </div>
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
              <input type="number" step={isExchange ? "0.000001" : "0.1"} value={val} onChange={e => !readOnly && update(i, macroKey, parseFloat(e.target.value))} readOnly={readOnly} className={`w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-2.5 text-center text-[10px] font-black outline-none transition-all shadow-inner ${readOnly ? 'cursor-not-allowed opacity-60 text-slate-400' : 'focus:border-orange-500 text-white'}`} />
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

const WizardField = ({ label, val, onChange, type = 'text', placeholder, isLocked, isCurrency, currency }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2 group-focus-within:text-orange-500 transition-colors italic flex items-center gap-2">{label} {isLocked && <Lock size={10} className="text-indigo-500" />}</label>
     <div className="relative">
       <input 
         type={type} 
         value={val} 
         onChange={e => !isLocked && onChange(e.target.value)} 
         readOnly={isLocked} 
         className={`w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-8 py-5 text-lg font-bold text-white outline-none transition-all shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)] placeholder:text-slate-800 font-mono ${isLocked ? 'cursor-not-allowed border-indigo-500/20 opacity-60' : 'focus:border-orange-600'}`} 
         placeholder={placeholder} 
       />
       {isCurrency && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700">{getCurrencySymbol(currency)}</span>}
     </div>
  </div>
);

const WizardSelect = ({ label, val, onChange, options, isLocked }: any) => (
  <div className="space-y-3 text-left group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] ml-2 group-focus-within:text-orange-500 transition-colors italic flex items-center gap-2">{label} {isLocked && <Lock size={10} className="text-indigo-500" />}</label>
     <div className="relative">
        <select value={val} onChange={e => !isLocked && onChange(e.target.value)} disabled={isLocked} className={`w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-8 py-5 text-[11px] font-black text-white uppercase outline-none transition-all appearance-none shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)] ${isLocked ? 'cursor-not-allowed border-indigo-500/20 opacity-60' : 'cursor-pointer focus:border-orange-600'}`}>
          {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Settings2 size={24} /></div>
     </div>
  </div>
);

export default TrialWizard;
