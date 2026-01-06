
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  ChevronRight, ChevronLeft, ShieldCheck, Activity, Scale, 
  Zap, Landmark, Shield, AlertTriangle, Brain, Sparkles, MapPin
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { getLiveDecisionAdvice } from '../services/gemini';
import { DecisionData, Branch, Championship, ProjectionResult, CreditRating, EcosystemConfig } from '../types';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_MACRO } from '../constants';
import { InsolvencyAlert } from './InsolvencyAlert';

const STEPS = [
  { id: 'marketing', label: 'Comercial', icon: Megaphone },
  { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
  { id: 'production', label: 'Produção & Fábrica', icon: Factory },
  { id: 'finance', label: 'Finanças & CapEx', icon: DollarSign },
  { id: 'legal', label: 'Protocolo Jurídico', icon: Gavel },
  { id: 'review', label: 'Viabilidade & Selo', icon: ShieldCheck },
];

const createInitialDecisions = (regionsCount: number): DecisionData => ({
  regions: Object.fromEntries(Array.from({ length: regionsCount }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 3 }])),
  hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
  production: { purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 1, activityLevel: 100, rd_investment: 0 },
  finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
  legal: { recovery_mode: 'none' }
});

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; userName?: string; }> = ({ teamId = 'alpha', champId = 'c1', round = 1, branch = 'industrial', userName }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [decisions, setDecisions] = useState<DecisionData>(createInitialDecisions(9));
  const [isSaving, setIsSaving] = useState(false);
  const [showInsolvencyModal, setShowInsolvencyModal] = useState(false);
  const [prevRoundData, setPrevRoundData] = useState<any>(null);
  
  // Dynamic Region Tabs state
  const [activeRegion, setActiveRegion] = useState(1);
  
  // AI Coach State
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          // Reinicializa decisões com o count correto de regiões da arena
          setDecisions(createInitialDecisions(found.regions_count || 9));
          const { data: prevData } = await supabase.from('companies').select('*').eq('team_id', teamId).eq('round', found.current_round).maybeSingle();
          setPrevRoundData(prevData);
        }
      }
    };
    fetchContext();
  }, [champId, teamId]);

  const currentIndicators = useMemo(() => activeArena?.market_indicators || DEFAULT_MACRO, [activeArena]);
  
  const projections: ProjectionResult | null = useMemo(() => {
    const eco = (activeArena?.ecosystemConfig || { 
      inflation_rate: 0.01, 
      demand_multiplier: 1.0, 
      interest_rate: 0.03, 
      market_volatility: 0.05, 
      scenario_type: 'simulated', 
      modality_type: 'standard' 
    }) as EcosystemConfig;
    try { 
      return calculateProjections(decisions, branch as Branch, eco, currentIndicators, prevRoundData); 
    } catch (e) { 
      return null; 
    }
  }, [decisions, branch, activeArena, currentIndicators, prevRoundData]);

  const rating = projections?.health?.rating || 'AAA';
  const isInsolvent = rating === 'C' || rating === 'D';

  const handleConsultStrategos = async () => {
    setIsAiLoading(true);
    const advice = await getLiveDecisionAdvice(decisions, branch);
    setAiAdvice(advice);
    setIsAiLoading(false);
  };

  const updateRegionDecision = (regionId: number, field: string, val: number) => {
     setDecisions(prev => ({
        ...prev,
        regions: {
           ...prev.regions,
           [regionId]: {
              ...prev.regions[regionId],
              [field]: val
           }
        }
     }));
  };

  const handleSubmit = async () => {
    if (isInsolvent && !showInsolvencyModal) {
      setShowInsolvencyModal(true);
      return;
    }
    setIsSaving(true);
    try {
      await saveDecisions(teamId, champId!, (activeArena?.current_round || 0) + 1, decisions);
      alert("PROTOCOLO TRANSMITIDO COM SUCESSO.");
    } catch (e) {
      alert("FALHA NA TRANSMISSÃO.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-32 animate-in fade-in duration-700 grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
      <InsolvencyAlert rating={rating as CreditRating} isOpen={showInsolvencyModal} onClose={() => setShowInsolvencyModal(false)} />

      <div className="lg:col-span-3 space-y-6">
        <header className="bg-slate-900 border border-white/10 p-4 rounded-[2rem] shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
             {STEPS.map((s, idx) => (
               <button 
                 key={s.id} 
                 onClick={() => setActiveStep(idx)} 
                 className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all whitespace-nowrap ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
               >
                  <s.icon size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">{s.label}</span>
               </button>
             ))}
          </div>
          <div className="pr-6 text-right shrink-0">
             <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Oracle Standing</span>
             <span className={`text-2xl font-black italic leading-none ${rating === 'D' ? 'text-rose-500' : rating === 'C' ? 'text-amber-500' : 'text-emerald-400'}`}>{rating}</span>
          </div>
        </header>

        <main className="bg-slate-950/50 backdrop-blur-xl p-8 md:p-12 rounded-[4rem] border border-white/5 shadow-2xl min-h-[600px] flex flex-col">
           <AnimatePresence mode="wait">
             {activeStep === 0 && (
               <motion.div key="marketing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
                     <div className="space-y-1">
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Matriz Comercial</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Defina o mix em {activeArena?.regions_count || 0} territórios</p>
                     </div>
                     <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar pb-2">
                        {Array.from({ length: activeArena?.regions_count || 1 }).map((_, i) => (
                          <button 
                            key={i} 
                            onClick={() => setActiveRegion(i+1)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeRegion === i+1 ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}
                          >
                            Região 0{i+1}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <DecisionInput 
                        label="Preço de Venda ($)" 
                        desc="Preço médio de mercado: $370"
                        val={decisions.regions[activeRegion]?.price || 0} 
                        onChange={v => updateRegionDecision(activeRegion, 'price', v)} 
                     />
                     <DecisionInput 
                        label="Investimento Marketing ($)" 
                        desc="Impacto na elasticidade-preço"
                        val={decisions.regions[activeRegion]?.marketing || 0} 
                        onChange={v => updateRegionDecision(activeRegion, 'marketing', v)} 
                     />
                     <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> Prazo (Ciclos)</label>
                        <select 
                           value={decisions.regions[activeRegion]?.term || 1} 
                           onChange={e => updateRegionDecision(activeRegion, 'term', Number(e.target.value))}
                           className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-black outline-none appearance-none cursor-pointer"
                        >
                           <option value={1}>À Vista (1 Período)</option>
                           <option value={2}>Parcelado (2 Períodos)</option>
                           <option value={3}>Extendido (3 Períodos)</option>
                        </select>
                     </div>
                  </div>
               </motion.div>
             )}

             {activeStep === 5 && (
               <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                  <div className="space-y-4 max-w-2xl">
                     <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">Selo de Integridade</h2>
                     <p className="text-slate-500 font-bold uppercase tracking-[0.3em] italic leading-relaxed">
                       A transmissão do ciclo {(activeArena?.current_round || 0) + 1} exige a validação do Oráculo. Rating Atual: {rating}.
                     </p>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={`px-20 py-8 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-6 ${isInsolvent ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white'}`}
                  >
                     {isSaving ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24}/> Transmitir Nodo</>}
                  </button>
               </motion.div>
             )}

             {/* Outros passos (HR, Prod, Fin) seriam implementados aqui seguindo o mesmo padrão UI */}
             {activeStep !== 0 && activeStep !== 5 && (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
                   <p className="text-slate-600 font-black uppercase tracking-[0.4em] italic text-center">Implementando Telemetria do Módulo {STEPS[activeStep].label}...</p>
                </motion.div>
             )}
           </AnimatePresence>
        </main>
      </div>

      <aside className="lg:col-span-1 space-y-6">
         <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl sticky top-24">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                  <Brain size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-black text-white uppercase italic">Strategos Coach</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Análise Tática Live</p>
               </div>
            </div>

            <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/5 space-y-4">
               {aiAdvice ? (
                 <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-slate-300 leading-relaxed italic">
                   "{aiAdvice}"
                 </motion.p>
               ) : (
                 <p className="text-xs font-medium text-slate-600 leading-relaxed uppercase tracking-tighter">
                   Solicite uma auditoria rápida das suas decisões atuais antes de selar o período.
                 </p>
               )}
            </div>

            <button 
              onClick={handleConsultStrategos}
              disabled={isAiLoading}
              className="w-full py-5 bg-indigo-600 hover:bg-white hover:text-indigo-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
               {isAiLoading ? <Loader2 className="animate-spin" size={16}/> : <><Sparkles size={16}/> Consultar Oráculo</>}
            </button>

            <div className="pt-8 border-t border-white/5">
               <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Projeção do Oráculo</h4>
               <div className="space-y-4">
                  <MiniMetric label="Net Profit" val={`$ ${(projections?.netProfit || 0).toLocaleString()}`} pos={(projections?.netProfit || 0) > 0} />
                  <MiniMetric label="Cash Flow" val={`$ ${(projections?.statements.cash_flow.total || 0).toLocaleString()}`} pos={(projections?.statements.cash_flow.total || 0) > 0} />
                  <MiniMetric label="Market Share" val={`${(projections?.marketShare || 12.5).toFixed(1)}%`} pos={true} />
               </div>
            </div>
         </div>
      </aside>
    </div>
  );
};

const DecisionInput = ({ label, desc, val, onChange }: any) => (
   <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4 group hover:border-orange-500/30 transition-all">
      <div className="space-y-1">
         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block group-hover:text-orange-500 transition-colors">{label}</label>
         <p className="text-[8px] font-bold text-slate-600 uppercase italic">{desc}</p>
      </div>
      <div className="relative">
         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-xs">$</span>
         <input 
            type="number" 
            value={val} 
            onChange={e => onChange(Number(e.target.value))}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-8 pr-4 py-4 text-white font-mono font-bold outline-none focus:border-orange-600 transition-all"
         />
      </div>
   </div>
);

const MiniMetric = ({ label, val, pos }: any) => (
  <div className="flex justify-between items-center">
     <span className="text-[8px] font-bold text-slate-500 uppercase">{label}</span>
     <span className={`text-xs font-black font-mono italic ${pos ? 'text-emerald-400' : 'text-rose-500'}`}>{val}</span>
  </div>
);

export default DecisionForm;
