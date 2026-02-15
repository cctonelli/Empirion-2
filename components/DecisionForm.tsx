
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, Wallet, 
  TrendingUp, ArrowUpRight, TrendingDown, ClipboardCheck,
  PlusCircle, MinusCircle, AlertCircle, RefreshCw,
  Timer, Settings2, UserPlus, Rocket, Info, HelpCircle,
  HardDrive, Lock, Zap, Scale, Eye, BarChart3, PieChart,
  Activity, Receipt, Coins, Trash2, Box, AlertOctagon,
  Award, Check, Globe, UserMinus, Percent, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase, getUserProfile } from '../services/supabase';
import { DecisionData, Branch, Championship, MachineModel, MacroIndicators, Team, InitialMachine, CurrencyType } from '../types';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

const STEPS = [
  { id: 'legal', label: '1. JURÍDICO', icon: Gavel },
  { id: 'marketing', label: '2. COMERCIAL', icon: Megaphone },
  { id: 'production', label: '3. OPERAÇÕES', icon: Factory },
  { id: 'hr', label: '4. TALENTOS', icon: Users2 },
  { id: 'assets', label: '5. ATIVOS', icon: Cpu },
  { id: 'finance', label: '6. FINANÇAS', icon: Landmark },
  { id: 'goals', label: '7. METAS', icon: Target },
  { id: 'review', label: '8. FINALIZAR', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId, champId, round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 0, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0, sales_staff_count: 50 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 0, extraProductionPercent: 0, rd_investment: 0, net_profit_target_percent: 0, term_interest_rate: 0.00 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanTerm: 0, application: 0 },
    estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (!champId || !teamId) return;
      setIsLoadingDraft(true);
      
      try {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (!found) return;
        setActiveArena(found);

        const team = found.teams?.find(t => t.id === teamId);
        if (team) setActiveTeam(team);

        const table = found.is_trial ? 'trial_decisions' : 'current_decisions';
        const { data: draft } = await supabase.from(table)
          .select('data')
          .eq('championship_id', champId)
          .eq('team_id', teamId)
          .eq('round', round)
          .maybeSingle();

        const initialRegions: any = {};
        for (let i = 1; i <= (found.regions_count || 1); i++) {
          initialRegions[i] = draft?.data?.regions?.[i] || { price: 0, term: 0, marketing: 0 };
        }

        if (draft?.data) {
          setDecisions({ ...draft.data, regions: initialRegions });
        } else {
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      } catch (err) {
        console.error("Hydration Error:", err);
      } finally {
        setIsLoadingDraft(false);
      }
    };
    initializeForm();
  }, [champId, teamId, round]);

  const currency = activeArena?.currency || 'BRL';

  const updateDecision = (path: string, val: any) => {
    if (isReadOnly) return;
    const keys = path.split('.');
    setDecisions(prev => {
      const next = { ...prev };
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const handleTransmit = async () => {
    if (!teamId || !champId || isReadOnly) return;
    setIsSaving(true);
    try {
      const res = await saveDecisions(teamId, champId, round, decisions) as any;
      if (res.success) alert("PROTOCOLO SELADO: Suas decisões foram transmitidas ao motor Oracle.");
      else throw new Error(res.error);
    } catch (err: any) {
      alert(`FALHA NA TRANSMISSÃO: ${err.message}`);
    } finally { setIsSaving(false); }
  };

  if (isLoadingDraft) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950/20 rounded-[2.5rem] border border-white/5">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Terminal...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/20 rounded-[2.5rem] border border-white/5 overflow-hidden">
      <nav className="flex p-1 gap-1 bg-slate-900/80 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar shadow-xl">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[110px] py-3 px-2 rounded-2xl transition-all flex flex-col items-center gap-1.5 border ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white shadow-xl scale-[1.02] z-10' : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300'}`}>
              <s.icon size={12} strokeWidth={3} />
              <span className="text-[7px] font-black uppercase tracking-tighter text-center">{s.label}</span>
           </button>
         ))}
      </nav>

      <div className="flex-1 overflow-hidden bg-slate-950/40 relative">
         <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto custom-scrollbar p-6 md:p-12 pb-32">
               
               {activeStep === 1 && (
                  <div className="space-y-12">
                     <WizardStepHeader icon={<Megaphone />} title="Regiões de Vendas" desc="Configure preço, prazo e marketing por nodo regional." />
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Object.entries(decisions.regions).map(([id, reg]: [any, any]) => (
                           <div key={id} className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-10 hover:border-orange-500/30 transition-all group shadow-xl">
                              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                 <span className="text-xs font-black text-orange-500 uppercase italic">Nodo Regional 0{id}</span>
                                 <span className="text-[10px] font-black text-slate-600">{currency}</span>
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Preço Unitário ({getCurrencySymbol(currency)})</label>
                                 <input type="number" step="0.01" value={reg.price} onChange={e => updateDecision(`regions.${id}.price`, parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-white/5 rounded-[1.5rem] p-8 text-4xl font-mono font-black text-white outline-none focus:border-orange-600 transition-all tracking-tighter" />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Prazo de Recebimento</label>
                                 <select value={reg.term} onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-4 text-[10px] font-black text-white uppercase outline-none focus:border-orange-600">
                                    <option value={0}>A VISTA</option>
                                    <option value={1}>PARCELADO (50/50)</option>
                                    <option value={2}>LONGO PRAZO (33/33/33)</option>
                                 </select>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeStep === 3 && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Users2 />} title="Gestão de Talentos" desc="Defina a força de trabalho e incentivos salariais." />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <InputCard label="NOVAS ADMISSÕES" val={decisions.hr.hired} icon={<UserPlus />} onChange={(v:any)=>updateDecision('hr.hired', v)} />
                        <InputCard label="DESLIGAMENTOS" val={decisions.hr.fired} icon={<UserMinus />} onChange={(v:any)=>updateDecision('hr.fired', v)} />
                        <InputCard label={`PISO SALARIAL (${getCurrencySymbol(currency)})`} val={decisions.hr.salary} icon={<DollarSign />} onChange={(v:any)=>updateDecision('hr.salary', v)} isCurrency currency={currency} />
                     </div>
                  </div>
               )}

               {activeStep === 5 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Landmark />} title="Mercado de Capitais" desc="Gestão de liquidez e alavancagem financeira." />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 space-y-8">
                           <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><Coins className="text-orange-500"/> Requisitar Crédito</h4>
                           <InputCard label={`VALOR EMPRÉSTIMO (${getCurrencySymbol(currency)})`} val={decisions.finance.loanRequest} icon={<DollarSign/>} onChange={(v:any)=>updateDecision('finance.loanRequest', v)} isCurrency currency={currency} />
                        </div>
                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 space-y-8">
                           <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><TrendingUp className="text-emerald-500"/> Aplicação Liquidez</h4>
                           <InputCard label={`APLICAÇÃO FINANCEIRA (${getCurrencySymbol(currency)})`} val={decisions.finance.application} icon={<Activity/>} onChange={(v:any)=>updateDecision('finance.application', v)} isCurrency currency={currency} />
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 7 && (
                  <div className="max-w-5xl mx-auto space-y-12 text-center">
                     <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse">
                        <ShieldCheck size={56} />
                     </div>
                     <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Pronto para Transmissão</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-4">
                           <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Consolidado</h4>
                           <p className="text-xs text-slate-400">Moeda da Arena: <span className="text-white font-black">{currency} ({getCurrencySymbol(currency)})</span></p>
                        </div>
                     </div>
                  </div>
               )}

            </motion.div>
         </AnimatePresence>

         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="floating-nav-btn left-8 transition-all active:scale-90"><ChevronLeft size={28} strokeWidth={3} /></button>
         {activeStep === STEPS.length - 1 ? (
           <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="floating-nav-btn-primary group">
              {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Rocket size={24} />} TRANSMITIR PROTOCOLO
           </button>
         ) : (
           <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="floating-nav-btn right-8 transition-all active:scale-90"><ChevronRight size={28} strokeWidth={3} /></button>
         )}
      </div>
    </div>
  );
};

const WizardStepHeader = ({ icon, title, desc }: any) => (
   <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 shadow-2xl flex items-center gap-8">
      <div className="p-5 bg-orange-600 rounded-3xl text-white shadow-xl">{React.cloneElement(icon, { size: 32 })}</div>
      <div>
         <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{desc}</p>
      </div>
   </div>
);

const InputCard = ({ label, val, icon, onChange, help, isCurrency, currency }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all group shadow-inner">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors">{icon}</div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
           {label} {help && <span title={help}><HelpCircle size={10} className="opacity-40" /></span>}
        </label>
     </div>
     <div className="relative">
       <input 
         type="number" 
         step={isCurrency ? "0.01" : "1"}
         value={val} 
         onChange={e => onChange?.(Math.max(0, parseFloat(e.target.value) || 0))} 
         className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner" 
       />
       {isCurrency && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700">{currency}</span>}
     </div>
  </div>
);

export default DecisionForm;
