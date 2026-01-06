
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  ChevronRight, ChevronLeft, ShieldCheck, Activity, Scale, 
  Zap, Landmark, Shield, AlertTriangle, Brain, Sparkles
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { getLiveDecisionAdvice } from '../services/gemini';
import { DecisionData, Branch, Championship, ProjectionResult, CreditRating, EcosystemConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
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

const createInitialDecisions = (): DecisionData => ({
  regions: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 3 }])),
  hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
  production: { purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 1, activityLevel: 100, rd_investment: 0 },
  finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
  legal: { recovery_mode: 'none' }
});

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; userName?: string; }> = ({ teamId = 'alpha', champId = 'c1', round = 1, branch = 'industrial', userName }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [decisions, setDecisions] = useState<DecisionData>(createInitialDecisions());
  const [isSaving, setIsSaving] = useState(false);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [showInsolvencyModal, setShowInsolvencyModal] = useState(false);
  const [prevRoundData, setPrevRoundData] = useState<any>(null);
  
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
      return calculateProjections(decisions, branch, eco, currentIndicators, prevRoundData); 
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

        <main className="bg-slate-950/50 backdrop-blur-xl p-12 rounded-[4rem] border border-white/5 shadow-2xl min-h-[600px] flex flex-col items-center justify-center">
           {activeStep === 5 ? (
             <div className="text-center space-y-12 max-w-2xl">
                <div className="space-y-4">
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
             </div>
           ) : (
             <div className="w-full space-y-8 opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-center text-slate-500 font-black uppercase tracking-[0.4em] italic">Módulo de Entrada em Desenvolvimento - Use o formulário padrão v12.8</p>
             </div>
           )}
        </main>
      </div>

      {/* STRATEGOS LIVE COACH SIDEBAR */}
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

const MiniMetric = ({ label, val, pos }: any) => (
  <div className="flex justify-between items-center">
     <span className="text-[8px] font-bold text-slate-500 uppercase">{label}</span>
     <span className={`text-xs font-black font-mono italic ${pos ? 'text-emerald-400' : 'text-rose-500'}`}>{val}</span>
  </div>
);

export default DecisionForm;
