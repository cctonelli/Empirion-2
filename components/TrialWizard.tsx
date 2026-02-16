
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Rocket, Loader2, Info, 
  CheckCircle2, Factory, Users, Globe, Timer, Cpu, Sparkles, 
  Settings, Landmark, DollarSign, Target, Calculator,
  Settings2, X, Bot, Boxes, TrendingUp, Percent, ChevronLeft, ChevronRight,
  PieChart, BarChart
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

  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] }>(INITIAL_FINANCIAL_TREE as any);

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
        round_rules: DEFAULT_INDUSTRIAL_CHRONOGRAM, 
      }, teamsToCreate, true);
      onComplete();
    } catch (e: any) { alert(`FALHA: ${e.message}`); } finally { setIsSubmitting(false); }
  };

  const stepsCount = 6;
  const totalAssets = financials?.balance_sheet.find(n => n.id === 'assets')?.value || 0;
  const totalEquity = financials?.balance_sheet.find(n => n.id === 'liabilities_pl')?.children?.find(n => n.id === 'equity')?.value || 7252171.74;

  return (
    <div className="wizard-shell bg-slate-950/95 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
      <EmpireParticles />
      <header className="wizard-header-fixed px-12 py-10 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-xl"><Rocket size={32} /></div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sandbox Trial Setup</h2>
              <p className="text-[11px] font-black uppercase text-orange-500 tracking-[0.5em] mt-2 italic">Nova Arena • Moeda: {formData.currency}</p>
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
              <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                 <WizardStepTitle icon={<Globe size={32}/>} title="Identidade Sandbox" desc="Defina as configurações globais da arena trial." />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2"><WizardField label="NOME DO TORNEIO" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="Ex: TORNEIO TRIAL ALPHA" /></div>
                    <WizardSelect label="MOEDA BASE" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'},{v:'CNY',l:'YUAN (¥)'},{v:'BTC',l:'BITCOIN (₿)'}]} />
                 </div>
              </motion.div>
            )}

            {step === 2 && (
               <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <WizardStepTitle icon={<Users size={32}/>} title="Capacidade Humana" desc="Configuração de equipes e bots de IA." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <WizardField label="EQUIPES HUMANAS" type="number" val={formData.humanTeamsCount} onChange={(v:any)=>setFormData({...formData, humanTeamsCount: parseInt(v)})} />
                     <WizardField label="BOTS ORACLE" type="number" val={formData.botsCount} onChange={(v:any)=>setFormData({...formData, botsCount: parseInt(v)})} />
                  </div>
               </motion.div>
            )}

            {step === 3 && (
               <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <WizardStepTitle icon={<Factory size={32}/>} title="Expansão de Mercado" desc="Mapeie o número de regiões da arena." />
                  <div className="max-w-md mx-auto">
                     <WizardField label="NÚMERO DE REGIÕES" type="number" val={formData.regionsCount} onChange={(v:any)=>setFormData({...formData, regionsCount: parseInt(v)})} />
                  </div>
               </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                 <WizardStepTitle icon={<Settings size={32}/>} title="Custos de Operação" desc="Ajuste os preços base de insumos e ativos." />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <WizardField label={`Preço MP-A (${getCurrencySymbol(formData.currency)})`} type="number" val={marketIndicators.prices.mp_a} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: parseFloat(v)}})} />
                    <WizardField label={`Preço ALFA (${getCurrencySymbol(formData.currency)})`} type="number" val={marketIndicators.machinery_values.alfa} onChange={(v:any)=>setMarketIndicators({...marketIndicators, machinery_values: {...marketIndicators.machinery_values, alfa: parseFloat(v)}})} />
                 </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 <WizardStepTitle icon={<Calculator size={32}/>} title="Oracle Baselines" desc="Dados contábeis iniciais para o Ciclo Zero." />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <SummaryCard label="ATIVO TOTAL" val={totalAssets} currency={formData.currency} icon={<PieChart size={20}/>} color="orange" />
                    <SummaryCard label="PATRIMÔNIO LÍQUIDO" val={totalEquity} currency={formData.currency} icon={<BarChart size={20}/>} color="blue" />
                 </div>
                 <FinancialStructureEditor 
                    initialBalance={financials.balance_sheet} 
                    initialDRE={financials.dre} 
                    initialCashFlow={financials.cash_flow} 
                    onChange={(u) => setFinancials(u as any)}
                    currency={formData.currency}
                 />
              </motion.div>
            )}

            {step === 6 && (
               <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 text-center py-20">
                  <CheckCircle2 size={120} className="text-emerald-500 mx-auto animate-pulse" />
                  <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">Arena Trial Pronta</h2>
                  <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto italic">Clique abaixo para inicializar o cluster industrial temporário.</p>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="floating-nav-btn left-10"><ChevronLeft size={32} /></button>
      {step === stepsCount ? (
        <button onClick={handleLaunch} disabled={isSubmitting} className="floating-nav-btn-primary">
          {isSubmitting ? <><Loader2 className="animate-spin" size={24}/> Sincronizando...</> : 'LANÇAR SANDBOX'}
        </button>
      ) : (
        <button onClick={() => setStep(s => s + 1)} className="floating-nav-btn right-10"><ChevronRight size={32} /></button>
      )}
    </div>
  );
};

const SummaryCard = ({ label, val, icon, color, currency }: any) => (
  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-xl">
     <div className={`p-4 rounded-2xl ${color === 'orange' ? 'bg-orange-600/20 text-orange-500' : 'bg-blue-600/20 text-blue-500'}`}>{icon}</div>
     <div>
       <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
       <span className="text-3xl font-black text-white font-mono italic">{formatCurrency(val, currency)}</span>
     </div>
  </div>
);

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-8">
     <div className="p-6 bg-slate-900 border border-orange-500/30 rounded-[2.5rem] text-orange-500 shadow-2xl flex items-center justify-center">{icon}</div>
     <div><h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3><p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic">{desc}</p></div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-4 text-left group">
     <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <div className="relative">
       <input type={type} value={val} step="0.01" onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-10 py-7 text-xl font-bold text-white outline-none focus:border-orange-600 transition-all shadow-inner" placeholder={placeholder} />
     </div>
  </div>
);

const WizardSelect = ({ label, val, onChange, options }: any) => (
  <div className="space-y-4 text-left group">
     <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <select value={val} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-10 py-7 text-[12px] font-black text-white uppercase outline-none focus:border-orange-600 transition-all cursor-pointer shadow-inner appearance-none">
       {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

export default TrialWizard;
