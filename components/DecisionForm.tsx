
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  ChevronRight, ChevronLeft, ShieldCheck, Activity, Scale, 
  Zap, Landmark, Shield, AlertTriangle, Brain, Sparkles, MapPin,
  Save, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { getLiveDecisionAdvice } from '../services/gemini';
import { DecisionData, Branch, Championship, ProjectionResult, CreditRating, EcosystemConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_MACRO } from '../constants';
import { InsolvencyAlert } from './InsolvencyAlert';

const STEPS = [
  { id: 'marketing', label: 'Comercial', icon: Megaphone, color: 'orange' },
  { id: 'production', label: 'Fábrica', icon: Factory, color: 'blue' },
  { id: 'hr', label: 'Staff', icon: Users2, color: 'emerald' },
  { id: 'finance', label: 'Capital', icon: DollarSign, color: 'indigo' },
  { id: 'review', label: 'Oracle Seal', icon: ShieldCheck, color: 'orange' },
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
  const [showInsolvencyModal, setShowInsolvencyModal] = useState(false);
  const [prevRoundData, setPrevRoundData] = useState<any>(null);
  const [activeRegion, setActiveRegion] = useState(1);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
    <div className="flex flex-col h-full bg-slate-900/50 rounded-[2.5rem] overflow-hidden">
      
      {/* WIZARD NAVIGATION BAR */}
      <nav className="flex items-center gap-1 bg-slate-950 p-1 border-b border-white/5">
         {STEPS.map((s, idx) => {
            const active = activeStep === idx;
            return (
              <button 
                key={s.id} 
                onClick={() => setActiveStep(idx)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 transition-all rounded-xl ${active ? 'bg-white/5 text-orange-500 shadow-inner' : 'text-slate-600 hover:text-slate-400'}`}
              >
                 <s.icon size={14} strokeWidth={active ? 3 : 2} />
                 <span className="text-[9px] font-black uppercase tracking-widest hidden md:block">{s.label}</span>
                 {active && <motion.div layoutId="stepUnder" className="w-1 h-1 rounded-full bg-orange-600" />}
              </button>
            );
         })}
      </nav>

      {/* OPERATIONAL WORKSPACE */}
      <div className="flex-1 p-8 overflow-y-auto no-scrollbar min-h-[500px]">
         <AnimatePresence mode="wait">
            {activeStep === 0 && (
               <motion.div key="mkt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                     <div className="p-3 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20"><Megaphone size={20}/></div>
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Estratégia Regional</h3>
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
                     {Array.from({ length: activeArena?.regions_count || 9 }).map((_, i) => (
                       <button 
                         key={i} 
                         onClick={() => setActiveRegion(i+1)}
                         className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeRegion === i+1 ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-950 text-slate-500 border border-white/5 hover:border-white/20'}`}
                       >
                         Região 0{i+1}
                       </button>
                     ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <ErpInput label="Preço Unitário ($)" desc="Baseline: $370.00" val={decisions.regions[activeRegion]?.price || 0} onChange={v => updateRegionDecision(activeRegion, 'price', v)} />
                     <ErpInput label="Marketing Regional ($)" desc="Impulso de Demanda" val={decisions.regions[activeRegion]?.marketing || 0} onChange={v => updateRegionDecision(activeRegion, 'marketing', v)} />
                     <div className="space-y-2 p-6 bg-slate-950 rounded-2xl border border-white/5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prazo (Ciclos)</label>
                        <select 
                           value={decisions.regions[activeRegion]?.term || 1} 
                           onChange={e => updateRegionDecision(activeRegion, 'term', Number(e.target.value))}
                           className="w-full bg-slate-900 border-none rounded-xl p-4 text-white font-black text-sm outline-none cursor-pointer"
                        >
                           <option value={1}>1x (Liquidez Imediata)</option>
                           <option value={2}>2x (Parcelado)</option>
                           <option value={3}>3x (Longo Prazo)</option>
                        </select>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeStep === 1 && (
               <motion.div key="prod" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                     <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"><Factory size={20}/></div>
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Supply & Produção</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <ErpInput label="Compra MP-A (Unid)" desc="Estoque Ótimo: 10k" val={decisions.production.purchaseMPA} onChange={v => setDecisions({...decisions, production: {...decisions.production, purchaseMPA: v}})} />
                     <ErpInput label="Compra MP-B (Unid)" desc="Estoque Ótimo: 5k" val={decisions.production.purchaseMPB} onChange={v => setDecisions({...decisions, production: {...decisions.production, purchaseMPB: v}})} />
                     <ErpInput label="Nível de Atividade (%)" desc="Máx 100% (Sem OEE extra)" val={decisions.production.activityLevel} onChange={v => setDecisions({...decisions, production: {...decisions.production, activityLevel: v}})} />
                     <ErpInput label="Investimento P&D ($)" desc="Melhoria de Qualidade" val={decisions.production.rd_investment} onChange={v => setDecisions({...decisions, production: {...decisions.production, rd_investment: v}})} />
                  </div>
               </motion.div>
            )}

            {activeStep === 4 && (
               <motion.div key="rev" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-12">
                  <div className="space-y-4">
                     <div className="w-24 h-24 bg-orange-600/10 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-orange-500/30 text-orange-500 shadow-inner animate-pulse">
                        <ShieldCheck size={48} />
                     </div>
                     <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Final Review</h2>
                     <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Oracle Fidelity Node Build v13</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-2xl">
                     <ReviewStat label="Impacto Lucro" val={`$ ${(projections?.netProfit || 0).toLocaleString()}`} pos={(projections?.netProfit || 0) > 0} />
                     <ReviewStat label="Market Share" val={`${(projections?.marketShare || 12.5).toFixed(1)}%`} pos />
                     <ReviewStat label="Rating Final" val={rating} pos={rating.includes('A')} />
                  </div>

                  <button 
                    onClick={handleTransmition}
                    disabled={isSaving}
                    className="px-20 py-8 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-white hover:text-orange-950 transition-all active:scale-95 flex items-center gap-6"
                  >
                     {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={24}/> Transmitir Comando</>}
                  </button>
               </motion.div>
            )}

            {(activeStep === 2 || activeStep === 3) && (
               <div className="flex flex-col items-center justify-center py-40 text-slate-700 italic font-black uppercase tracking-[0.3em]">
                  <LayoutGrid size={48} className="mb-6 opacity-10" />
                  Carregando Telemetria do Módulo {STEPS[activeStep].label}...
               </div>
            )}
         </AnimatePresence>
      </div>

      {/* FOOTER WIZARD CONTROLS */}
      <footer className="p-6 bg-slate-950 border-t border-white/5 flex justify-between items-center">
         <button 
           onClick={() => setActiveStep(s => Math.max(0, s-1))}
           disabled={activeStep === 0}
           className="px-8 py-3 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all disabled:opacity-0 flex items-center gap-2"
         >
            <ChevronLeft size={14} /> Anterior
         </button>
         <button 
           onClick={() => setActiveStep(s => Math.min(STEPS.length-1, s+1))}
           className="px-10 py-4 bg-white/5 hover:bg-orange-600 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95"
         >
            Próximo Protocolo <ChevronRight size={14} />
         </button>
      </footer>
    </div>
  );
};

const ErpInput = ({ label, desc, val, onChange }: any) => (
  <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 space-y-4 hover:border-orange-500/30 transition-all group">
     <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-orange-500 transition-colors">{label}</label>
        <p className="text-[8px] font-bold text-slate-700 uppercase italic leading-none">{desc}</p>
     </div>
     <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-mono text-xs">$</span>
        <input 
           type="number" 
           value={val} 
           onChange={e => onChange(Number(e.target.value))}
           className="w-full bg-slate-900 border-none rounded-xl pl-10 pr-4 py-4 text-white font-mono font-bold text-sm outline-none focus:ring-1 focus:ring-orange-600 transition-all shadow-inner"
        />
     </div>
  </div>
);

const ReviewStat = ({ label, val, pos }: any) => (
  <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-2">
     <span className="block text-[8px] font-black text-slate-500 uppercase">{label}</span>
     <span className={`text-2xl font-black italic font-mono ${pos ? 'text-emerald-400' : 'text-rose-500'}`}>{val}</span>
  </div>
);

export default DecisionForm;
