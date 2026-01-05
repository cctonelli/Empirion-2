
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  ChevronRight, ChevronLeft, ShieldCheck, Activity, Scale, 
  Zap, Landmark, Shield, AlertTriangle
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { calculateProjections, sanitize } from '../services/simulation';
import { DecisionData, Branch, Championship, MacroIndicators, ProjectionResult, CreditRating, EcosystemConfig } from '../types';
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
      alert("FALHA NA TRANSMISSÃO: Link neural instável.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-32 animate-in fade-in duration-700">
      <InsolvencyAlert rating={rating as CreditRating} isOpen={showInsolvencyModal} onClose={() => setShowInsolvencyModal(false)} />

      <header className="bg-slate-900 border border-white/10 p-4 rounded-[2rem] shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
           {STEPS.map((s, idx) => (
             <button 
               key={s.id} 
               onClick={() => setActiveStep(idx)} 
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all whitespace-nowrap ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
             >
                <s.icon size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{s.label}</span>
             </button>
           ))}
        </div>
        <div className="pr-6 text-right shrink-0">
           <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Oracle Standing</span>
           <span className={`text-2xl font-black italic leading-none ${rating === 'D' ? 'text-rose-500' : rating === 'C' ? 'text-amber-500' : 'text-emerald-400'}`}>{rating}</span>
        </div>
      </header>

      <main className="bg-slate-950/50 backdrop-blur-xl p-12 rounded-[4rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] min-h-[600px] flex flex-col items-center justify-center">
         {activeStep === 5 ? (
           <div className="text-center space-y-12 max-w-2xl">
              <div className="space-y-4">
                 <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">Selo de Integridade</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-[0.3em] italic leading-relaxed">
                   "A transmissão do ciclo {(activeArena?.current_round || 0) + 1} exige a validação do comitê executivo. O Oráculo auditou sua projeção com Rating {rating}."
                 </p>
              </div>

              {isInsolvent && (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-6 text-left">
                  <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg animate-pulse"><AlertTriangle size={24}/></div>
                  <div>
                    <span className="block text-[10px] font-black text-rose-500 uppercase tracking-widest">Alerta de Risco</span>
                    <p className="text-xs font-bold text-rose-200">Sua unidade está operando em zona de insolvência técnica. A transmissão é permitida, mas o risco de encerramento do nodo é alto.</p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className={`px-20 py-8 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-6 ${isInsolvent ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white'}`}
              >
                 {isSaving ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24}/> Transmitir Nodo {branch?.toUpperCase()}</>}
              </button>
           </div>
         ) : (
           <div className="text-center space-y-8 max-w-md opacity-30">
              <div className="p-10 bg-white/5 rounded-full w-fit mx-auto border border-white/5">
                <Activity size={100} className="text-slate-700" />
              </div>
              <div>
                <p className="text-2xl font-black uppercase text-slate-500 tracking-[0.2em] italic">Módulo em Edição</p>
                <p className="text-sm font-bold text-slate-600 uppercase mt-4">Preencha os dados estratégicos para habilitar o selo de transmissão.</p>
              </div>
           </div>
         )}
      </main>
    </div>
  );
};

export default DecisionForm;
