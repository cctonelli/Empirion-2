import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  ChevronRight, ChevronLeft, ShieldCheck, Activity, 
  Zap, Save, Sparkles, Package, Cpu, Target
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, Championship, ProjectionResult, EcosystemConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 'marketing', label: 'Comercial', icon: Megaphone },
  { id: 'production', label: 'Operações', icon: Factory },
  { id: 'hr', label: 'Recursos', icon: Users2 },
  { id: 'finance', label: 'Finanças', icon: DollarSign },
  { id: 'review', label: 'Transmitir', icon: ShieldCheck },
];

const createInitialDecisions = (regionsCount: number): DecisionData => ({
  regions: Object.fromEntries(Array.from({ length: regionsCount }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 1000 }])),
  hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
  production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0 },
  finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
  legal: { recovery_mode: 'none' }
});

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId = 'alpha', champId = 'c1', round = 1, branch = 'industrial', isReadOnly = false }) => {
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
          setDecisions(createInitialDecisions(found.regions_count || 9));
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
    try { return calculateProjections(decisions, branch as Branch, eco, activeArena.market_indicators, prevRoundData); } catch (e) { return null; }
  }, [decisions, branch, activeArena, prevRoundData]);

  const rating = projections?.health?.rating || 'AAA';

  const handleTransmition = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    try {
      await saveDecisions(teamId, champId!, (activeArena?.current_round || 0) + 1, decisions);
      alert("PROTOCOLO SINCRONIZADO COM O ORÁCULO.");
    } catch (e) { alert("ERRO NA TRANSMISSÃO."); } finally { setIsSaving(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-[2.5rem] overflow-hidden border border-white/5 relative">
      
      {/* HUD DE RATING PERSISTENTE */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
         <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
         <span className="text-[10px] font-black text-white italic tracking-widest uppercase">Oracle Rating: {rating}</span>
      </div>

      <nav className="flex bg-slate-950/40 p-1 border-b border-white/5 shrink-0">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 py-3 transition-all rounded-xl flex flex-col items-center gap-1 ${activeStep === idx ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}>
              <s.icon size={14} />
              <span className="text-[7px] font-black uppercase tracking-widest">{s.label}</span>
           </button>
         ))}
      </nav>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-900/20">
         <AnimatePresence mode="wait">
            {activeStep === 0 && (
               <motion.div key="mkt" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="horizontal-scroll-container pb-2">
                     <div className="flex gap-2">
                        {Array.from({ length: activeArena?.regions_count || 9 }).map((_, i) => (
                          <button key={i} onClick={() => setActiveRegion(i+1)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${activeRegion === i+1 ? 'bg-orange-600 text-white border-orange-500 shadow-md' : 'bg-slate-950 text-slate-600 border-white/5 hover:border-white/20'}`}>Região 0{i+1}</button>
                        ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InputCompact label="Preço Unitário" val={decisions.regions[activeRegion]?.price || 0} onChange={v => !isReadOnly && setDecisions({...decisions, regions: {...decisions.regions, [activeRegion]: {...decisions.regions[activeRegion], price: v}}})} icon={<DollarSign size={12}/>} />
                     <InputCompact label="Marketing" val={decisions.regions[activeRegion]?.marketing || 0} onChange={v => !isReadOnly && setDecisions({...decisions, regions: {...decisions.regions, [activeRegion]: {...decisions.regions[activeRegion], marketing: v}}})} icon={<Sparkles size={12}/>} />
                  </div>
               </motion.div>
            )}

            {activeStep === 1 && (
               <motion.div key="prod" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                  <InputCompact label="MP-A" val={decisions.production.purchaseMPA} onChange={v => !isReadOnly && setDecisions({...decisions, production: {...decisions.production, purchaseMPA: v}})} icon={<Package size={12}/>} />
                  <InputCompact label="MP-B" val={decisions.production.purchaseMPB} onChange={v => !isReadOnly && setDecisions({...decisions, production: {...decisions.production, purchaseMPB: v}})} icon={<Package size={12}/>} />
                  <InputCompact label="OEE Goal %" val={decisions.production.activityLevel} onChange={v => !isReadOnly && setDecisions({...decisions, production: {...decisions.production, activityLevel: v}})} icon={<Activity size={12}/>} />
                  <InputCompact label="R&D Inv." val={decisions.production.rd_investment} onChange={v => !isReadOnly && setDecisions({...decisions, production: {...decisions.production, rd_investment: v}})} icon={<Cpu size={12}/>} />
               </motion.div>
            )}

            {activeStep === 4 && (
               <motion.div key="rev" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-inner"><ShieldCheck size={32} /></div>
                  <div className="grid grid-cols-3 gap-3 w-full">
                     <ReviewBox label="Net Profit" val={`$ ${(projections?.netProfit || 0).toLocaleString()}`} pos={(projections?.netProfit || 0) >= 0} />
                     <ReviewBox label="Rating" val={rating} pos={rating.includes('A')} />
                     <ReviewBox label="Share" val={`${(projections?.marketShare || 12.5).toFixed(1)}%`} pos />
                  </div>
                  {!isReadOnly && (
                    <button onClick={handleTransmition} disabled={isSaving} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-white hover:text-orange-950 transition-all flex items-center justify-center gap-4">
                       {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Transmitir Ciclo</>}
                    </button>
                  )}
               </motion.div>
            )}
            
            {(activeStep === 2 || activeStep === 3) && <div className="flex items-center justify-center h-full opacity-20"><Loader2 size={32} className="animate-spin" /></div>}
         </AnimatePresence>
      </div>

      <footer className="sticky-wizard-footer bg-slate-950/80 p-4 border-t border-white/5">
         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="px-6 py-2 text-slate-500 font-black uppercase text-[8px] tracking-widest hover:text-white transition-all disabled:opacity-0 flex items-center gap-2">
            <ChevronLeft size={14} /> Voltar
         </button>
         <button onClick={() => setActiveStep(s => Math.min(STEPS.length-1, s+1))} disabled={activeStep === STEPS.length-1} className="px-10 py-3 bg-white/5 hover:bg-orange-600 text-white border border-white/10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 disabled:hidden">
            Avançar <ChevronRight size={14} />
         </button>
      </footer>
    </div>
  );
};

const InputCompact = ({ label, val, onChange, icon }: any) => (
  <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 space-y-2 hover:border-orange-500/30 transition-all shadow-inner">
     <div className="flex items-center gap-2">
        <div className="text-slate-600">{icon}</div>
        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest truncate">{label}</label>
     </div>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-900 border-none rounded-lg px-3 py-1.5 text-white font-mono font-black text-sm outline-none focus:ring-1 focus:ring-orange-600 transition-all" />
  </div>
);

const ReviewBox = ({ label, val, pos }: any) => (
  <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 space-y-1 shadow-inner text-center">
     <span className="block text-[6px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
     <span className={`text-[10px] font-black italic font-mono leading-none ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>{val}</span>
  </div>
);

export default DecisionForm;