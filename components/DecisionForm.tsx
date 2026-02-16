
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, Wallet, 
  TrendingUp, Activity, Receipt, Coins, Trash2, Box, Award, 
  PlusCircle, MinusCircle, AlertCircle, RefreshCw, UserPlus, UserMinus, Globe,
  // Added missing Rocket import
  Rocket
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { DecisionData, Branch, Championship, Team, CurrencyType } from '../types';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
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

        const table = found.is_trial ? 'trial_decisions' : 'current_decisions';
        const { data: draft } = await supabase.from(table).select('data').eq('championship_id', champId).eq('team_id', teamId).eq('round', round).maybeSingle();

        const initialRegions: any = {};
        for (let i = 1; i <= (found.regions_count || 1); i++) {
          initialRegions[i] = draft?.data?.regions?.[i] || { price: 0, term: 0, marketing: 0 };
        }

        if (draft?.data) {
          setDecisions({ ...draft.data, regions: { ...initialRegions, ...draft.data.regions } });
        } else {
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      } catch (err) { console.error("Hydration Error:", err); } 
      finally { setIsLoadingDraft(false); }
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
      const res = await saveDecisions(teamId, champId, round, decisions);
      if (res.success) alert("TRANSMISSÃO CONCLUÍDA.");
      else throw new Error(res.error);
    } catch (err: any) { alert(`FALHA: ${err.message}`); } 
    finally { setIsSaving(false); }
  };

  if (isLoadingDraft) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950/20 py-20">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Terminal...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/20 rounded-[2.5rem] border border-white/5 overflow-hidden">
      <nav className="flex p-1 gap-1 bg-slate-900 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar shadow-xl">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[120px] py-3 px-2 rounded-2xl transition-all flex flex-col items-center gap-1.5 border ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-950/40 border-white/5 text-slate-500'}`}>
              <s.icon size={14} />
              <span className="text-[8px] font-black uppercase tracking-tighter text-center">{s.label}</span>
           </button>
         ))}
      </nav>

      <div className="flex-1 overflow-hidden bg-slate-950/40 relative">
         <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto custom-scrollbar p-6 md:p-12 pb-32">
               
               {activeStep === 0 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Gavel />} title="Status Jurídico" desc="Defina o regime legal da operação." />
                     <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 space-y-6">
                        <label className="flex items-center gap-4 cursor-pointer group">
                           <input type="checkbox" checked={decisions.judicial_recovery} onChange={e => updateDecision('judicial_recovery', e.target.checked)} className="w-6 h-6 rounded-lg bg-slate-950 border-white/10 text-orange-600 focus:ring-orange-600" />
                           <span className="text-lg font-black text-white uppercase italic group-hover:text-orange-500 transition-colors">Solicitar Recuperação Judicial</span>
                        </label>
                        <p className="text-xs text-slate-500 italic leading-relaxed">Atenção: O status de RJ impõe restrições severas de alavancagem financeira e CAPEX, mas suspende pagamentos de dívidas antigas.</p>
                     </div>
                  </div>
               )}

               {activeStep === 1 && (
                  <div className="space-y-12">
                     <WizardStepHeader icon={<Megaphone />} title="Estratégia Regional" desc="Configure preço e marketing por nodo geográfico." />
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Object.entries(decisions.regions).map(([id, reg]: [any, any]) => (
                           <div key={id} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-8 hover:border-orange-500/30 transition-all">
                              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                 <span className="text-xs font-black text-orange-500 uppercase italic">Nodo {id}</span>
                                 <span className="text-[10px] font-black text-slate-600">{currency}</span>
                              </div>
                              <WizardField label={`Preço (${getCurrencySymbol(currency)})`} val={reg.price} type="number" onChange={(v:any)=>updateDecision(`regions.${id}.price`, v)} isCurrency currency={currency} />
                              <WizardField label="Verba Marketing (Campanhas)" val={reg.marketing} type="number" onChange={(v:any)=>updateDecision(`regions.${id}.marketing`, v)} />
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeStep === 2 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Factory />} title="Processo Industrial" desc="Defina a compra de materiais e nível de operação." />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputCard label="COMPRA MP-A (UNID)" val={decisions.production.purchaseMPA} icon={<Package/>} onChange={(v:any)=>updateDecision('production.purchaseMPA', v)} />
                        <InputCard label="COMPRA MP-B (UNID)" val={decisions.production.purchaseMPB} icon={<Package/>} onChange={(v:any)=>updateDecision('production.purchaseMPB', v)} />
                        <InputCard label="NÍVEL DE ATIVIDADE (%)" val={decisions.production.activityLevel} icon={<Activity/>} onChange={(v:any)=>updateDecision('production.activityLevel', v)} />
                        <InputCard label="INVESTIMENTO P&D ($)" val={decisions.production.rd_investment} icon={<Sparkles/>} onChange={(v:any)=>updateDecision('production.rd_investment', v)} isCurrency currency={currency} />
                     </div>
                  </div>
               )}

               {activeStep === 3 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Users2 />} title="Recursos Humanos" desc="Gestão de headcount e remuneração." />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputCard label="CONTRATAÇÕES" val={decisions.hr.hired} icon={<UserPlus/>} onChange={(v:any)=>updateDecision('hr.hired', v)} />
                        <InputCard label="DEMISSÕES" val={decisions.hr.fired} icon={<UserMinus/>} onChange={(v:any)=>updateDecision('hr.fired', v)} />
                        <InputCard label={`PISO SALARIAL (${getCurrencySymbol(currency)})`} val={decisions.hr.salary} icon={<DollarSign/>} onChange={(v:any)=>updateDecision('hr.salary', v)} isCurrency currency={currency} />
                     </div>
                  </div>
               )}

               {activeStep === 4 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Cpu />} title="Ativos de Capital" desc="Compra e venda de maquinário." />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputCard label="COMPRA ALFA" val={decisions.machinery.buy.alfa} icon={<PlusCircle/>} onChange={(v:any)=>updateDecision('machinery.buy.alfa', v)} />
                        <InputCard label="COMPRA BETA" val={decisions.machinery.buy.beta} icon={<PlusCircle/>} onChange={(v:any)=>updateDecision('machinery.buy.beta', v)} />
                        <InputCard label="COMPRA GAMA" val={decisions.machinery.buy.gama} icon={<PlusCircle/>} onChange={(v:any)=>updateDecision('machinery.buy.gama', v)} />
                     </div>
                  </div>
               )}

               {activeStep === 5 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Landmark />} title="Mercado Financeiro" desc="Gestão de liquidez e alavancagem." />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputCard label={`EMPRÉSTIMO (${getCurrencySymbol(currency)})`} val={decisions.finance.loanRequest} icon={<Landmark/>} onChange={(v:any)=>updateDecision('finance.loanRequest', v)} isCurrency currency={currency} />
                        <InputCard label={`APLICAÇÃO (${getCurrencySymbol(currency)})`} val={decisions.finance.application} icon={<TrendingUp/>} onChange={(v:any)=>updateDecision('finance.application', v)} isCurrency currency={currency} />
                     </div>
                  </div>
               )}

               {activeStep === 6 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Target />} title="Estimativas e Metas" desc="Defina seus objetivos para o prêmio de precisão." />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputCard label="PREVISÃO CUSTO UNIT." val={decisions.estimates.forecasted_unit_cost} icon={<Box/>} onChange={(v:any)=>updateDecision('estimates.forecasted_unit_cost', v)} isCurrency currency={currency} />
                        <InputCard label="PREVISÃO RECEITA" val={decisions.estimates.forecasted_revenue} icon={<Activity/>} onChange={(v:any)=>updateDecision('estimates.forecasted_revenue', v)} isCurrency currency={currency} />
                        <InputCard label="PREVISÃO LUCRO LÍQ." val={decisions.estimates.forecasted_net_profit} icon={<TrendingUp/>} onChange={(v:any)=>updateDecision('estimates.forecasted_net_profit', v)} isCurrency currency={currency} />
                     </div>
                  </div>
               )}

               {activeStep === 7 && (
                  <div className="max-w-4xl mx-auto space-y-12 text-center">
                     <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(16,185,129,0.3)]">
                        <ShieldCheck size={56} />
                     </div>
                     <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Pilar de Decisões Pronto</h2>
                     <p className="text-slate-400 font-medium">Aperte o botão abaixo para transmitir o protocolo à arena.</p>
                  </div>
               )}

            </motion.div>
         </AnimatePresence>

         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="floating-nav-btn left-8 active:scale-90"><ChevronLeft size={28} /></button>
         {activeStep === STEPS.length - 1 ? (
           <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="floating-nav-btn-primary">
              {/* Fix: Rocket icon was missing in imports */}
              {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Rocket size={24} />} TRANSMITIR DECISÕES
           </button>
         ) : (
           <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="floating-nav-btn right-8 active:scale-90"><ChevronRight size={28} /></button>
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

const WizardField = ({ label, val, onChange, type = 'text', isCurrency, currency }: any) => (
  <div className="space-y-3 group">
     <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic ml-2">{label}</label>
     <div className="relative">
       <input type={type} value={val} step="0.01" onChange={e => onChange(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl p-6 text-xl font-bold text-white outline-none focus:border-orange-600 transition-all shadow-inner" />
       {isCurrency && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700">{getCurrencySymbol(currency)}</span>}
     </div>
  </div>
);

const InputCard = ({ label, val, icon, onChange, isCurrency, currency }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-4 hover:border-orange-500/30 transition-all">
     <div className="flex items-center gap-3">
        <div className="p-3 bg-white/5 rounded-2xl text-orange-500">{icon}</div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label>
     </div>
     <div className="relative">
       <input type="number" step={isCurrency ? "0.01" : "1"} value={val} onChange={e => onChange?.(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl px-6 py-5 text-white font-mono font-black text-xl outline-none focus:border-orange-600" />
       {isCurrency && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700">{getCurrencySymbol(currency)}</span>}
     </div>
  </div>
);

export default DecisionForm;
