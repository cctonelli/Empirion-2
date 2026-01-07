import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  ChevronRight, ChevronLeft, ShieldCheck, Activity, Scale, 
  Zap, Landmark, Shield, AlertTriangle, Brain, Sparkles, MapPin,
  // Fix: Added missing Cpu icon import
  Save, LayoutGrid, CheckCircle2, Package, TrendingUp, Info, Cpu
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, Championship, ProjectionResult, CreditRating, EcosystemConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 'marketing', label: 'Market', icon: Megaphone, color: 'orange' },
  { id: 'production', label: 'Factory', icon: Factory, color: 'blue' },
  { id: 'hr', label: 'Staff', icon: Users2, color: 'emerald' },
  { id: 'finance', label: 'Capital', icon: DollarSign, color: 'indigo' },
  { id: 'review', label: 'Seal', icon: ShieldCheck, color: 'orange' },
];

const createInitialDecisions = (regionsCount: number): DecisionData => ({
  regions: Object.fromEntries(Array.from({ length: regionsCount }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 1000 }])),
  hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
  production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0 },
  finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
  legal: { recovery_mode: 'none' }
});

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; }> = ({ teamId = 'alpha', champId = 'c1', round = 1, branch = 'industrial' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [decisions, setDecisions] = useState<DecisionData>(createInitialDecisions(9));
  const [isSaving, setIsSaving] = useState(false);
  const [prevRoundData, setPrevRoundData] = useState<any>(null);
  const [activeRegion, setActiveRegion] = useState(1);

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const rCount = found.regions_count || 9;
          setDecisions(createInitialDecisions(rCount));
          const { data: prevData } = await supabase.from('companies').select('*').eq('team_id', teamId).eq('round', found.current_round).maybeSingle();
          setPrevRoundData(prevData);
        }
      }
    };
    fetchContext();
  }, [champId, teamId]);

  const projections: ProjectionResult | null = useMemo(() => {
    if (!activeArena) return null;
    const eco = (activeArena.ecosystemConfig || { inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' }) as EcosystemConfig;
    try { 
      return calculateProjections(decisions, branch as Branch, eco, activeArena.market_indicators, prevRoundData); 
    } catch (e) { return null; }
  }, [decisions, branch, activeArena, prevRoundData]);

  const rating = projections?.health?.rating || 'AAA';

  const updateRegionDecision = (regionId: number, field: string, val: number) => {
     setDecisions(prev => ({ ...prev, regions: { ...prev.regions, [regionId]: { ...prev.regions[regionId], [field]: val } } }));
  };

  const handleTransmition = async () => {
    setIsSaving(true);
    try {
      await saveDecisions(teamId, champId!, (activeArena?.current_round || 0) + 1, decisions);
      alert("PROTOCOLO SINCRONIZADO: O Oráculo recebeu os dados.");
    } catch (e) {
      alert("ERRO DE TRANSMISSÃO.");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5">
      
      {/* COMPACT NAV */}
      <nav className="flex bg-slate-950/80 p-0.5 border-b border-white/5 shrink-0">
         {STEPS.map((s, idx) => {
            const active = activeStep === idx;
            return (
              <button 
                key={s.id} 
                onClick={() => setActiveStep(idx)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 transition-all rounded-lg ${active ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
              >
                 <s.icon size={12} strokeWidth={active ? 3 : 2} />
                 <span className="text-[8px] font-black uppercase tracking-widest hidden md:block">{s.label}</span>
              </button>
            );
         })}
      </nav>

      {/* WORKSPACE */}
      <div className="flex-1 p-5 overflow-y-auto no-scrollbar min-h-[380px] bg-slate-900/30">
         <AnimatePresence mode="wait">
            {activeStep === 0 && (
               <motion.div key="mkt" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                     <div className="p-1.5 bg-orange-600 text-white rounded-lg"><Megaphone size={14}/></div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Market Strategy</h3>
                  </div>
                  
                  <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2">
                     {Array.from({ length: activeArena?.regions_count || 9 }).map((_, i) => (
                       <button 
                         key={i} 
                         onClick={() => setActiveRegion(i+1)}
                         className={`px-3 py-1.5 rounded-lg text-[7px] font-black uppercase transition-all whitespace-nowrap border ${activeRegion === i+1 ? 'bg-orange-600 text-white border-orange-500 shadow-md' : 'bg-slate-950 text-slate-600 border-white/5 hover:border-white/20'}`}
                       >
                         R0{i+1}
                       </button>
                     ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <ErpInputCompact label="Unit Price ($)" val={decisions.regions[activeRegion]?.price || 0} onChange={v => updateRegionDecision(activeRegion, 'price', v)} icon={<DollarSign size={10}/>} />
                     <ErpInputCompact label="Regional Mkt ($)" val={decisions.regions[activeRegion]?.marketing || 0} onChange={v => updateRegionDecision(activeRegion, 'marketing', v)} icon={<Sparkles size={10}/>} />
                     <div className="space-y-1.5 p-3 bg-slate-950/50 rounded-xl border border-white/5">
                        <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Payment Term</label>
                        <select 
                           value={decisions.regions[activeRegion]?.term || 1} 
                           onChange={e => updateRegionDecision(activeRegion, 'term', Number(e.target.value))}
                           className="w-full bg-slate-900 border-none rounded-lg p-2 text-white font-black text-[10px] outline-none cursor-pointer appearance-none"
                        >
                           <option value={1}>1x (Immediate)</option>
                           <option value={2}>2x (Installments)</option>
                           <option value={3}>3x (Long Term)</option>
                        </select>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeStep === 1 && (
               <motion.div key="prod" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                     <div className="p-1.5 bg-blue-600 text-white rounded-lg"><Factory size={14}/></div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Supply & Activity</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <ErpInputCompact label="Buy MP-A (Units)" val={decisions.production.purchaseMPA} onChange={v => setDecisions({...decisions, production: {...decisions.production, purchaseMPA: v}})} icon={<Package size={10}/>} />
                     <ErpInputCompact label="Buy MP-B (Units)" val={decisions.production.purchaseMPB} onChange={v => setDecisions({...decisions, production: {...decisions.production, purchaseMPB: v}})} icon={<Package size={10}/>} />
                     <ErpInputCompact label="Activity Level (%)" val={decisions.production.activityLevel} onChange={v => setDecisions({...decisions, production: {...decisions.production, activityLevel: v}})} icon={<Activity size={10}/>} />
                     <ErpInputCompact label="R&D Inv. ($)" val={decisions.production.rd_investment} onChange={v => setDecisions({...decisions, production: {...decisions.production, rd_investment: v}})} icon={<Cpu size={10}/>} />
                  </div>
               </motion.div>
            )}

            {activeStep === 4 && (
               <motion.div key="rev" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-6 text-center space-y-8">
                  <div className="space-y-2">
                     <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/30 text-orange-500 shadow-inner">
                        <ShieldCheck size={32} />
                     </div>
                     <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Final Approval</h2>
                     <p className="text-slate-600 font-bold uppercase tracking-widest text-[8px]">Oracle Node Gold Certification</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                     <ReviewBox label="Profit Impact" val={`$ ${(projections?.netProfit || 0).toLocaleString()}`} pos={(projections?.netProfit || 0) > 0} />
                     <ReviewBox label="Target Share" val={`${(projections?.marketShare || 12.5).toFixed(1)}%`} pos />
                     <ReviewBox label="Final Rating" val={rating} pos={rating.includes('A')} />
                  </div>

                  <button 
                    onClick={handleTransmition}
                    disabled={isSaving}
                    className="w-full py-5 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-white hover:text-orange-950 transition-all active:scale-95 flex items-center justify-center gap-4"
                  >
                     {isSaving ? <Loader2 className="animate-spin" size={14} /> : <><Save size={16}/> Transmit Sequence</>}
                  </button>
               </motion.div>
            )}

            {(activeStep === 2 || activeStep === 3) && (
               <div className="flex flex-col items-center justify-center py-20 text-slate-700 italic font-black uppercase tracking-widest">
                  <Loader2 size={32} className="mb-4 animate-spin opacity-20" />
                  <span className="text-[8px]">Synchronizing Module {STEPS[activeStep].label}...</span>
               </div>
            )}
         </AnimatePresence>
      </div>

      {/* FOOTER WIZARD CONTROLS */}
      <footer className="p-3 bg-slate-950/80 border-t border-white/5 flex justify-between items-center shrink-0">
         <button 
           onClick={() => setActiveStep(s => Math.max(0, s-1))}
           disabled={activeStep === 0}
           className="px-4 py-2 text-slate-600 font-black uppercase text-[8px] tracking-widest hover:text-white transition-all disabled:opacity-0 flex items-center gap-1.5"
         >
            <ChevronLeft size={10} /> Prev
         </button>
         <button 
           onClick={() => setActiveStep(s => Math.min(STEPS.length-1, s+1))}
           disabled={activeStep === STEPS.length-1}
           className="px-6 py-2 bg-white/5 hover:bg-orange-600 text-white border border-white/10 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 disabled:opacity-0"
         >
            Forward <ChevronRight size={10} />
         </button>
      </footer>
    </div>
  );
};

const ErpInputCompact = ({ label, val, onChange, icon }: any) => (
  <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 space-y-2 hover:border-orange-500/30 transition-all group shadow-inner">
     <div className="flex items-center gap-2">
        <div className="p-1 bg-white/5 rounded text-slate-500 group-hover:text-orange-500 transition-colors">{icon}</div>
        <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</label>
     </div>
     <div className="relative">
        <input 
           type="number" 
           value={val} 
           onChange={e => onChange(Number(e.target.value))}
           className="w-full bg-slate-900 border-none rounded-lg px-3 py-2 text-white font-mono font-black text-xs outline-none focus:ring-1 focus:ring-orange-600 transition-all shadow-inner"
        />
     </div>
  </div>
);

const ReviewBox = ({ label, val, pos }: any) => (
  <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-1 shadow-inner">
     <span className="block text-[6px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
     <span className={`text-base font-black italic font-mono leading-none ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>{val}</span>
  </div>
);

export default DecisionForm;