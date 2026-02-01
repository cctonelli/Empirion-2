
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, Trash2, ShoppingCart, Info, Award,
  Zap, HelpCircle, MapPin, ChevronLeft, Wallet, 
  Percent, TrendingUp, BarChart3, LineChart, ShieldCheck
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
import { calculateProjections, sanitize } from '../services/simulation';
import { DecisionData, Branch, Championship, ProjectionResult, EcosystemConfig, MachineModel } from '../types';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

// Fix: Moved icon definition to use the correctly imported ShieldCheck
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
  const [activeRegion, setActiveRegion] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 0, misc: 0, sales_staff_count: 50 },
    production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 80, extraProductionPercent: 0, rd_investment: 0, net_profit_target_percent: 5.0, term_interest_rate: 1.5 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanTerm: 1, application: 0 },
    estimates: { forecasted_revenue: 0, forecasted_unit_cost: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const initialRegions: any = {};
          const defaultPrice = sanitize(found.market_indicators?.avg_selling_price, 375);
          for (let i = 1; i <= (found.regions_count || 4); i++) {
            initialRegions[i] = { price: defaultPrice, term: 1, marketing: 0 };
          }
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      }
    };
    fetchContext();
  }, [champId]);

  const machinePrices = useMemo(() => {
    if (!activeArena) return { alfa: 0, beta: 0, gama: 0, desagio: 0 };
    const getAdjusted = (model: MachineModel) => {
      const base = sanitize(activeArena.market_indicators.machinery_values?.[model], 500000);
      const keyPart = model === 'alfa' ? 'alpha' : model === 'gama' ? 'gamma' : 'beta';
      let adj = base;
      for (let r = 0; r < round; r++) {
        const rate = sanitize(activeArena.round_rules?.[r]?.[`machine_${keyPart}_price_adjust`] ?? 
                     activeArena.market_indicators[`machine_${keyPart}_price_adjust`], 0);
        adj *= (1 + rate / 100);
      }
      return adj;
    };
    return {
      alfa: getAdjusted('alfa'),
      beta: getAdjusted('beta'),
      gama: getAdjusted('gama'),
      desagio: sanitize(activeArena.market_indicators.machine_sale_discount, 10)
    };
  }, [activeArena, round]);

  const projections = useMemo(() => {
    if (!activeArena) return null;
    return calculateProjections(decisions, branch as Branch, activeArena.ecosystemConfig as any, activeArena.market_indicators, null, [], round, activeArena.round_rules, undefined, activeArena);
  }, [decisions, activeArena, round]);

  const updateDecision = (path: string, val: any) => {
    const keys = path.split('.');
    setDecisions(prev => {
      const next = { ...prev };
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      const safeVal = (typeof val === 'number') ? sanitize(val) : val;
      current[keys[keys.length - 1]] = safeVal;
      return next;
    });
  };

  const handleTransmit = async () => {
    if (!teamId || !champId) return;
    setIsSaving(true);
    try {
      const result = await saveDecisions(teamId, champId, round, decisions) as any;
      if (result.success) alert("PROTOCOLO SELADO: Suas decisões foram transmitidas ao motor Oracle.");
      else throw new Error(result.error);
    } catch (e: any) { alert(`FALHA NA TRANSMISSÃO: ${e.message}`); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/10 rounded-[2.5rem] border border-white/5 overflow-hidden relative">
      <nav className="flex p-1 gap-1 bg-slate-900 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar shadow-inner">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[100px] py-3 px-2 rounded-2xl transition-all flex flex-col items-center gap-1.5 border ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white shadow-xl scale-[1.02] z-10' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300'}`}>
              <s.icon size={12} strokeWidth={3} />
              <span className="text-[7px] font-black uppercase tracking-tighter text-center">{s.label}</span>
           </button>
         ))}
      </nav>

      <div ref={scrollContainerRef} className="flex-1 overflow-hidden bg-slate-950/40 relative">
         <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto custom-scrollbar p-10 pb-32">
               
               {activeStep === 6 && (
                  <div className="space-y-12 max-w-4xl mx-auto py-10">
                     <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-orange-600/20 rounded-[2rem] flex items-center justify-center mx-auto text-orange-500 border border-orange-500/30">
                           <Target size={40} />
                        </div>
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Projeções e Metas</h2>
                        <p className="text-slate-400 text-sm font-medium italic">"Seu erro entre o previsto e o real define o bônus de precisão Oracle."</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 space-y-6 shadow-2xl group hover:border-blue-500/40 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl"><LineChart size={24}/></div>
                              <label className="text-xs font-black text-white uppercase tracking-widest italic">Faturamento Previsto ($)</label>
                           </div>
                           <input 
                              type="number" value={decisions.estimates?.forecasted_revenue} 
                              onChange={e => updateDecision('estimates.forecasted_revenue', Number(e.target.value))}
                              className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-2xl outline-none focus:border-blue-500 transition-all" 
                           />
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 space-y-6 shadow-2xl group hover:border-emerald-500/40 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl"><DollarSign size={24}/></div>
                              <label className="text-xs font-black text-white uppercase tracking-widest italic">Lucro Líquido Alvo ($)</label>
                           </div>
                           <input 
                              type="number" value={decisions.estimates?.forecasted_net_profit} 
                              onChange={e => updateDecision('estimates.forecasted_net_profit', Number(e.target.value))}
                              className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-2xl outline-none focus:border-emerald-500 transition-all" 
                           />
                        </div>
                     </div>

                     <div className="p-8 bg-indigo-600/10 border-2 border-indigo-500/20 rounded-[3rem] flex gap-6 items-center">
                        <Award size={32} className="text-indigo-400" />
                        <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest leading-relaxed">
                           Dica: Erros de previsão menores que 5% geram um bônus imediato de $ {activeArena?.market_indicators.award_values.revenue_precision.toLocaleString()} no seu caixa do próximo round.
                        </p>
                     </div>
                  </div>
               )}

               {/* Outros steps permanecem... */}
               {activeStep === 0 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-10 max-w-4xl mx-auto py-10">
                     <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} className={`p-8 rounded-[3rem] border-4 shadow-2xl transition-all ${decisions.judicial_recovery ? 'bg-rose-600 border-rose-400 text-white shadow-rose-600/20' : 'bg-slate-900 border-emerald-500 text-emerald-500 shadow-emerald-500/10'}`}>
                        <Gavel size={64} strokeWidth={2.5} />
                     </motion.div>
                     <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Status de Solvência</h2>
                        <p className="text-slate-400 text-sm font-medium italic leading-relaxed">"A Recuperação Judicial bloqueia CAPEX e empréstimos, mas protege seus ativos contra liquidação imediata."</p>
                     </div>
                     <div className="flex gap-6 w-full max-w-2xl">
                        <button onClick={() => updateDecision('judicial_recovery', false)} className={`flex-1 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] border-2 transition-all ${!decisions.judicial_recovery ? 'bg-emerald-600 text-white border-emerald-400 shadow-xl' : 'bg-slate-900 border-white/5 text-slate-600'}`}>Arena Padrão</button>
                        <button onClick={() => updateDecision('judicial_recovery', true)} className={`flex-1 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] border-2 transition-all ${decisions.judicial_recovery ? 'bg-rose-600 text-white border-rose-400 shadow-xl' : 'bg-slate-900 border-white/5 text-slate-600'}`}>Protocolo RJ</button>
                     </div>
                  </div>
               )}

               {/* Step 1-5 ... */}
               {activeStep === 1 && (
                  <div className="flex flex-col lg:flex-row h-full gap-8">
                     <div className="w-full lg:w-[320px] flex flex-col gap-3 border-r border-white/5 pr-6 overflow-y-auto custom-scrollbar shrink-0">
                        {Object.keys(decisions.regions).map((id) => {
                           const regId = Number(id);
                           const isActive = activeRegion === regId;
                           return (
                              <button key={regId} onClick={() => setActiveRegion(regId)} className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-1 relative overflow-hidden ${isActive ? 'bg-orange-600 border-orange-400 shadow-2xl scale-[1.02]' : 'bg-slate-900 border-white/10 hover:bg-slate-800'}`}>
                                 <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-600'}`}>ID 0{regId}</span>
                                 <h4 className={`text-md font-black uppercase italic ${isActive ? 'text-white' : 'text-slate-200'}`}>{activeArena?.region_names?.[regId-1] || `Região ${regId}`}</h4>
                              </button>
                           );
                        })}
                     </div>
                     <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2 pb-20">
                        <InputCard label="Preço Unitário ($)" val={decisions.regions[activeRegion]?.price} onChange={(v: number) => updateDecision(`regions.${activeRegion}.price`, v)} icon={<DollarSign size={24}/>} />
                        <SelectCard label="Prazo de Venda" val={decisions.regions[activeRegion]?.term} onChange={(v: number) => updateDecision(`regions.${activeRegion}.term`, v)} options={[{v:0,l:'À VISTA'},{v:1,l:'50/50'},{v:2,l:'33/33/33'}]} icon={<Landmark size={24} />} />
                        <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-10 flex flex-col gap-6 shadow-2xl">
                           <div className="flex items-center justify-between">
                              <label className="text-[12px] font-black text-white uppercase tracking-widest">Investimento em Marketing Regional</label>
                              <span className="text-6xl font-black text-orange-500 italic">{decisions.regions[activeRegion]?.marketing || 0}</span>
                           </div>
                           <input type="range" min="0" max="9" step="1" value={decisions.regions[activeRegion]?.marketing || 0} onChange={e => updateDecision(`regions.${activeRegion}.marketing`, Number(e.target.value))} className="w-full h-3 bg-slate-950 rounded-full appearance-none cursor-pointer accent-orange-600" />
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 7 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-12 max-w-5xl mx-auto py-10">
                     <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-32 h-32 bg-orange-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl border-4 border-orange-400 mb-8">
                        <ShieldCheck size={64} className="text-white" />
                     </motion.div>
                     <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">Review Estratégico</h2>
                     <p className="text-slate-400 text-lg font-medium italic">"Revise seu protocolo tático antes de selar o ciclo."</p>
                  </div>
               )}
            </motion.div>
         </AnimatePresence>
         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="floating-nav-btn left-8"><ChevronLeft size={28} strokeWidth={3} /></button>
         {activeStep === STEPS.length - 1 ? (
           <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="floating-nav-btn-primary">{isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} Transmitir para Oracle</button>
         ) : (
           <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="floating-nav-btn right-8"><ChevronRight size={28} strokeWidth={3} /></button>
         )}
      </div>
    </div>
  );
};

const InputCard = ({ label, val, icon, onChange, placeholder }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all">
     <div className="flex items-center gap-4"><div className="text-slate-500">{icon}</div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label></div>
     <input type="number" value={val || ''} placeholder={placeholder || '0'} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600" />
  </div>
);

const SelectCard = ({ label, val, options, icon, onChange }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all">
     <div className="flex items-center gap-4"><div className="text-slate-500">{icon}</div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label></div>
     <select value={val} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-black text-[12px] uppercase outline-none appearance-none cursor-pointer">
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

export default DecisionForm;
