import React, { useState, useMemo, useEffect } from 'react';
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
  const [decisions, setDecisions] = useState<DecisionData>({
    regions: {}, hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
    production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0 },
    finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
    legal: { recovery_mode: 'none' }
  });

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
    <div className="wizard-shell h-[70vh]">
      {/* HUD DE RATING PERSISTENTE NO TOPO DO WIZARD */}
      <div className="absolute top-4 right-6 z-[400] flex items-center gap-3 bg-slate-950/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
         <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
         <span className="text-[11px] font-black text-white italic tracking-[0.2em] uppercase">Oracle Rating: {rating}</span>
      </div>

      {/* STEPPER DE NAVEGAÇÃO DA EQUIPE */}
      <nav className="flex bg-slate-950/60 p-2 border-b border-white/5 shrink-0">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 py-4 transition-all rounded-2xl flex flex-col items-center gap-1.5 ${activeStep === idx ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}>
              <s.icon size={16} />
              <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
           </button>
         ))}
      </nav>

      <div className="wizard-content">
         <AnimatePresence mode="wait">
            {activeStep === 0 && (
               <motion.div key="mkt" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                  <div className="matrix-container p-4">
                     <div className="flex gap-2">
                        {Array.from({ length: activeArena?.regions_count || 9 }).map((_, i) => (
                          <button key={i} onClick={() => setActiveRegion(i+1)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeRegion === i+1 ? 'bg-orange-600 text-white border-orange-500 shadow-xl' : 'bg-slate-950 text-slate-600 border-white/5 hover:border-white/20'}`}>Região 0{i+1}</button>
                        ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <InputCard label="Preço Unitário" val={decisions.regions[activeRegion]?.price || 372} icon={<DollarSign size={14}/>} />
                     <InputCard label="Marketing" val={decisions.regions[activeRegion]?.marketing || 1000} icon={<Sparkles size={14}/>} />
                  </div>
               </motion.div>
            )}

            {activeStep === 1 && (
               <motion.div key="prod" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-2 gap-6">
                  <InputCard label="Compra MP-A" val={decisions.production.purchaseMPA} icon={<Package size={14}/>} />
                  <InputCard label="Compra MP-B" val={decisions.production.purchaseMPB} icon={<Package size={14}/>} />
                  <InputCard label="OEE Goal %" val={decisions.production.activityLevel} icon={<Activity size={14}/>} />
                  <InputCard label="P&D Inv." val={decisions.production.rd_investment} icon={<Cpu size={14}/>} />
               </motion.div>
            )}

            {activeStep === 4 && (
               <motion.div key="rev" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-10 py-10">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-inner"><ShieldCheck size={48} /></div>
                  <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                     <ReviewPanel label="Net Profit" val={`$ ${(projections?.netProfit || 0).toLocaleString()}`} pos={(projections?.netProfit || 0) >= 0} />
                     <ReviewPanel label="Rating" val={rating} pos={rating.includes('A')} />
                     <ReviewPanel label="Share" val={`${(projections?.marketShare || 12.5).toFixed(1)}%`} pos />
                  </div>
               </motion.div>
            )}
            
            {(activeStep === 2 || activeStep === 3) && <div className="flex flex-col items-center justify-center py-20 opacity-20"><Loader2 size={64} className="animate-spin text-orange-500" /><p className="mt-4 font-black uppercase text-[10px] tracking-widest">Sincronizando Módulo...</p></div>}
         </AnimatePresence>
      </div>

      <footer className="wizard-footer-dock">
         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className={`px-10 py-5 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-4 active:scale-95 ${activeStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}>
            <ArrowLeft size={20} /> Anterior
         </button>
         
         <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:block">Etapa {activeStep + 1}/5</span>
            {activeStep === STEPS.length - 1 ? (
              <button disabled={isReadOnly} className="px-16 py-6 bg-orange-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl hover:bg-white hover:text-orange-950 transition-all flex items-center gap-6 active:scale-95 group">
                <Save size={20} /> Transmitir Ciclo
              </button>
            ) : (
              <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="px-16 py-6 bg-white/5 hover:bg-orange-600 text-white border border-white/10 rounded-full font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center gap-6 active:scale-95 group">
                Próximo Passo <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            )}
         </div>
      </footer>
    </div>
  );
};

const InputCard = ({ label, val, icon }: any) => (
  <div className="p-6 bg-slate-900/80 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-orange-500/30 transition-all shadow-xl group">
     <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors">{icon}</div>
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
     </div>
     <input type="number" defaultValue={val} className="w-full bg-slate-950 border-none rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:ring-2 focus:ring-orange-600 transition-all shadow-inner" />
  </div>
);

const ReviewPanel = ({ label, val, pos }: any) => (
  <div className="p-8 bg-slate-950/80 rounded-[2rem] border border-white/5 space-y-2 shadow-inner">
     <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
     <span className={`text-2xl font-black italic font-mono leading-none ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>{val}</span>
  </div>
);

export default DecisionForm;