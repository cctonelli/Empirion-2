
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  ArrowRight, ArrowLeft, ShieldCheck, Activity, 
  Save, Sparkles, Package, Cpu
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
  { id: 'review', label: 'Sincronizar', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId = 'alpha', champId = 'c1', round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRegion, setActiveRegion] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const [decisions, setDecisions] = useState<DecisionData>({
    regions: {}, hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
    production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0 },
    finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
    legal: { recovery_mode: 'none' }
  });

  // Auto-scroll reset on step change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeStep]);

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) setActiveArena(found);
      }
    };
    fetchContext();
  }, [champId]);

  const projections: ProjectionResult | null = useMemo(() => {
    if (!activeArena) return null;
    const eco = (activeArena.ecosystemConfig || { inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' }) as EcosystemConfig;
    return calculateProjections(decisions, branch as Branch, eco, activeArena.market_indicators);
  }, [decisions, activeArena]);

  const rating = projections?.health?.rating || 'AAA';

  return (
    <div className="wizard-shell">
      {/* HUD DE RATING PERSISTENTE NO TOPO DO WIZARD */}
      <div className="absolute top-4 right-8 z-[500] flex items-center gap-3 bg-slate-950/80 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-2xl">
         <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
         <span className="text-xs font-black text-white italic tracking-[0.2em] uppercase">Oracle Rating: {rating}</span>
      </div>

      {/* STEPPER DE NAVEGAÇÃO DA EQUIPE - FIXED AT TOP OF SHELL */}
      <nav className="wizard-header-fixed flex p-2 shrink-0">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 py-4 transition-all rounded-2xl flex flex-col items-center gap-2 ${activeStep === idx ? 'bg-orange-600 text-white shadow-xl scale-[1.02]' : 'text-slate-600 hover:text-slate-400'}`}>
              <s.icon size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
           </button>
         ))}
      </nav>

      <div ref={contentRef} className="wizard-content">
         <AnimatePresence mode="wait">
            {activeStep === 0 && (
               <motion.div key="mkt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 pb-10">
                  <div className="matrix-container p-5">
                     <div className="flex gap-3">
                        {Array.from({ length: activeArena?.regions_count || 9 }).map((_, i) => (
                          <button key={i} onClick={() => setActiveRegion(i+1)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeRegion === i+1 ? 'bg-orange-600 text-white border-orange-500 shadow-xl' : 'bg-slate-950 text-slate-600 border-white/5 hover:border-white/20'}`}>Região 0{i+1}</button>
                        ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputCard label="Preço Unitário" val={decisions.regions[activeRegion]?.price || 372} icon={<DollarSign size={16}/>} />
                     <InputCard label="Marketing Regional" val={decisions.regions[activeRegion]?.marketing || 1000} icon={<Sparkles size={16}/>} />
                  </div>
               </motion.div>
            )}

            {activeStep === 1 && (
               <motion.div key="prod" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                  <InputCard label="Compra MP-A" val={decisions.production.purchaseMPA} icon={<Package size={16}/>} />
                  <InputCard label="Compra MP-B" val={decisions.production.purchaseMPB} icon={<Package size={16}/>} />
                  <InputCard label="OEE Goal %" val={decisions.production.activityLevel} icon={<Activity size={16}/>} />
                  <InputCard label="P&D Inv." val={decisions.production.rd_investment} icon={<Cpu size={16}/>} />
               </motion.div>
            )}

            {activeStep === 4 && (
               <motion.div key="rev" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-12 py-16 pb-10">
                  <div className="w-28 h-28 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.1)]"><ShieldCheck size={56} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
                     <ReviewPanel label="Net Profit" val={`$ ${(projections?.netProfit || 0).toLocaleString()}`} pos={(projections?.netProfit || 0) >= 0} />
                     <ReviewPanel label="Oracle Rating" val={rating} pos={rating.includes('A')} />
                     <ReviewPanel label="Market Share" val={`${(projections?.marketShare || 12.5).toFixed(1)}%`} pos />
                  </div>
                  <p className="text-slate-500 font-bold italic text-sm">"Revise as métricas acima antes da transmissão final para o núcleo."</p>
               </motion.div>
            )}
            
            {(activeStep === 2 || activeStep === 3) && (
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 size={64} className="animate-spin text-orange-500" />
                    <p className="mt-6 font-black uppercase text-xs tracking-[0.5em] text-slate-500">Syncing Module Terminal...</p>
                </div>
            )}
         </AnimatePresence>
      </div>

      <footer className="wizard-footer-dock">
         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className={`px-10 py-5 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${activeStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}>
            <ArrowLeft size={20} /> Anterior
         </button>
         
         <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:block">Etapa {activeStep + 1}/5</span>
            {activeStep === STEPS.length - 1 ? (
              <button disabled={isReadOnly} className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 active:scale-95 group">
                <Save size={20} /> Transmitir Ciclo
              </button>
            ) : (
              <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="px-16 py-6 bg-white/5 border border-white/10 hover:bg-orange-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center gap-6 active:scale-95 group">
                Próximo Passo <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            )}
         </div>
      </footer>
    </div>
  );
};

const InputCard = ({ label, val, icon }: any) => (
  <div className="p-8 bg-slate-900/80 rounded-[2.5rem] border border-white/5 space-y-6 hover:border-orange-500/40 transition-all shadow-xl group text-left">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors border border-white/5">{icon}</div>
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
     </div>
     <input type="number" defaultValue={val} className="w-full bg-slate-950 border-none rounded-2xl px-6 py-5 text-white font-mono font-black text-2xl outline-none focus:ring-2 focus:ring-orange-600 transition-all shadow-inner" />
  </div>
);

const ReviewPanel = ({ label, val, pos }: any) => (
  <div className="p-10 bg-slate-950/80 rounded-[2.5rem] border border-white/5 space-y-3 shadow-inner">
     <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
     <span className={`text-3xl font-black italic font-mono leading-none ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>{val}</span>
  </div>
);

export default DecisionForm;
