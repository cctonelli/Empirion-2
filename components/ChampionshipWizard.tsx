
import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowRight, Globe, Loader2, Calculator,
  Sliders, CheckCircle2, LayoutGrid, Hourglass, Scale, Sparkles, X, 
  Settings2, Users, DollarSign, Package, Cpu, Factory, ChevronLeft, ChevronRight, FileJson
} from 'lucide-react';
import { INITIAL_FINANCIAL_TREE, DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { Branch, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators } from '../types';
import { createChampionshipWithTeams } from '../services/supabase';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import FinancialStructureEditor from './FinancialStructureEditor';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

const ChampionshipWizard: React.FC<{ onComplete: () => void, isTrial?: boolean }> = ({ onComplete, isTrial = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    total_rounds: 12,
    regions_count: 9, 
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
  const [financials, setFinancials] = useState<{ balance_sheet: AccountNode[], dre: AccountNode[], cash_flow: AccountNode[] }>(INITIAL_FINANCIAL_TREE as any);

  useEffect(() => {
    setRegionNames(prev => Array.from({ length: formData.regions_count }, (_, i) => prev[i] || `Região ${i+1}`));
    setTeamNames(prev => Array.from({ length: formData.teams_count }, (_, i) => prev[i] || `Equipe ${i+1}`));
  }, [formData.regions_count, formData.teams_count]);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    const teamsToCreate = [
      ...teamNames.map(n => ({ name: n, is_bot: false })),
      ...Array.from({ length: formData.bots_count }, (_, i) => ({ name: `BOT Oracle 0${i+1}`, is_bot: true }))
    ];
    try {
      await createChampionshipWithTeams({
        ...formData,
        status: 'active',
        region_names: regionNames,
        initial_financials: financials,
        market_indicators: marketIndicators,
        round_rules: DEFAULT_INDUSTRIAL_CHRONOGRAM,
      }, teamsToCreate, isTrial);
      onComplete();
    } catch (e: any) { alert(`FALHA: ${e.message}`); }
    finally { setIsSubmitting(false); }
  };

  const stepsCount = 6; 

  return (
    <div className="wizard-shell bg-slate-950/90 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
      <header className="wizard-header-fixed px-12 py-10 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-xl"><Sliders size={32} /></div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Strategos Creator</h2>
              <p className="text-[11px] font-black uppercase text-orange-500 tracking-[0.5em] mt-2 italic">Nova Arena • Nodo {formData.currency}</p>
           </div>
        </div>
        <div className="flex gap-4">
           {Array.from({ length: stepsCount }).map((_, i) => (
             <div key={i} className={`h-2 rounded-full transition-all duration-700 ${step === i+1 ? 'w-20 bg-orange-600 shadow-[0_0_20px_#f97316]' : step > i+1 ? 'w-10 bg-emerald-500' : 'w-10 bg-white/5'}`} />
           ))}
        </div>
      </header>

      <div className="wizard-content custom-scrollbar p-12 md:p-20">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-5xl mx-auto">
               <WizardStepTitle icon={<Globe size={48}/>} title="Identidade Sistêmica" desc="Orquestre a escala global do seu torneio." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <WizardField label="Nome da Arena" val={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} placeholder="EX: TORNEIO NACIONAL ALPHA" />
                  <WizardSelect label="Moeda Base" val={formData.currency} onChange={(v:any)=>setFormData({...formData, currency: v as CurrencyType})} options={[{v:'BRL',l:'REAL (R$)'},{v:'USD',l:'DÓLAR ($)'},{v:'EUR',l:'EURO (€)'},{v:'CNY',l:'YUAN (¥)'},{v:'BTC',l:'BITCOIN (₿)'}]} />
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-16 max-w-6xl mx-auto">
               <WizardStepTitle icon={<LayoutGrid size={48}/>} title="Mapeamento de Regiões" desc="Configure os nodos regionais de demanda." />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {regionNames.map((n, i) => (
                     <WizardField key={i} label={`Nome Região ${i+1}`} val={n} onChange={(v:any)=> {
                        const copy = [...regionNames]; copy[i] = v; setRegionNames(copy);
                     }} />
                  ))}
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-16 max-w-6xl mx-auto">
               <WizardStepTitle icon={<Users size={48}/>} title="Unidades Strategos" desc="Identifique as equipes participantes." />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {teamNames.map((n, i) => (
                     <WizardField key={i} label={`Nome Equipe ${i+1}`} val={n} onChange={(v:any)=> {
                        const copy = [...teamNames]; copy[i] = v; setTeamNames(copy);
                     }} />
                  ))}
               </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <WizardStepTitle icon={<Calculator size={48}/>} title="Baselines Contábeis" desc="Estrutura inicial em escala global." />
                <FinancialStructureEditor 
                   initialBalance={financials.balance_sheet} 
                   initialDRE={financials.dre} 
                   initialCashFlow={financials.cash_flow} 
                   onChange={(u) => setFinancials(u as any)}
                   currency={formData.currency}
                />
             </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 max-w-5xl mx-auto">
               <WizardStepTitle icon={<Settings2 size={48}/>} title="Regras de Insumos" desc="Defina os custos iniciais da arena." />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <WizardField label={`Preço MP-A (${getCurrencySymbol(formData.currency)})`} type="number" val={marketIndicators.prices.mp_a} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_a: parseFloat(v)}})} />
                  <WizardField label={`Preço MP-B (${getCurrencySymbol(formData.currency)})`} type="number" val={marketIndicators.prices.mp_b} onChange={(v:any)=>setMarketIndicators({...marketIndicators, prices: {...marketIndicators.prices, mp_b: parseFloat(v)}})} />
               </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 text-center py-20">
               <CheckCircle2 size={120} className="text-emerald-500 mx-auto animate-wow" />
               <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">Protocolo Validado</h2>
               <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Tudo pronto para inicializar o cluster de simulação em {formData.currency}.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1} className="floating-nav-btn left-10"><ChevronLeft size={32} /></button>
      {step === stepsCount ? (
        <button onClick={handleLaunch} disabled={isSubmitting} className="floating-nav-btn-primary">
          {isSubmitting ? <><Loader2 className="animate-spin" size={24}/> Lançando...</> : 'LANÇAR ARENA MASTER'}
        </button>
      ) : (
        <button onClick={() => setStep(s => s + 1)} className="floating-nav-btn right-10"><ChevronRight size={32} /></button>
      )}
    </div>
  );
};

const WizardStepTitle = ({ icon, title, desc }: any) => (
  <div className="flex items-center gap-10 border-b border-white/5 pb-12">
     <div className="p-8 bg-slate-900 border border-orange-500/30 rounded-[2.5rem] text-orange-500 shadow-2xl flex items-center justify-center">{icon}</div>
     <div>
        <h3 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">{desc}</p>
     </div>
  </div>
);

const WizardField = ({ label, val, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-4 text-left group">
     <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 group-focus-within:text-orange-500 transition-colors italic">{label}</label>
     <input type={type} value={val} step="0.01" onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl px-10 py-7 text-xl font-bold text-white outline-none focus:border-orange-600 transition-all shadow-inner" placeholder={placeholder} />
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

export default ChampionshipWizard;
