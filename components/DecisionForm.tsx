
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  MapPin, Boxes, Cpu, Info, ChevronRight, ChevronLeft, ShieldAlert,
  Lock, AlertTriangle, Scale, UserPlus, UserMinus, GraduationCap, 
  CheckCircle2, ShieldCheck, Flame, Zap, Landmark, Shield,
  Activity, HeartPulse, CreditCard, Banknote, AlertOctagon, HelpCircle,
  Clock, TrendingUp, ArrowDown, TrendingDown
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { calculateProjections, sanitize, getRiskSpread } from '../services/simulation';
import { DecisionData, Branch, Championship, MacroIndicators, ProjectionResult, CreditRating } from '../types';
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
  const [masterKeyUnlocked, setMasterKeyUnlocked] = useState(false);
  const [showInsolvencyModal, setShowInsolvencyModal] = useState(false);
  const [prevRoundData, setPrevRoundData] = useState<any>(null);

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const { data: teamData } = await supabase.from('teams').select('master_key_enabled').eq('id', teamId).maybeSingle();
          if (teamData?.master_key_enabled) setMasterKeyUnlocked(true);
          const { data: prevData } = await supabase.from('companies').select('*').eq('team_id', teamId).eq('round', found.current_round).maybeSingle();
          setPrevRoundData(prevData);
        }
      }
    };
    fetchContext();
  }, [champId, teamId]);

  const currentIndicators = useMemo(() => activeArena?.market_indicators || DEFAULT_MACRO, [activeArena]);
  const projections: ProjectionResult | null = useMemo(() => {
    const eco = activeArena?.ecosystemConfig || { inflationRate: 0.01, demandMultiplier: 1.0, interestRate: 0.03, marketVolatility: 0.05, scenarioType: 'simulated', modalityType: 'standard' };
    try { return calculateProjections(decisions, branch, eco, currentIndicators, prevRoundData); } catch (e) { return null; }
  }, [decisions, branch, activeArena, currentIndicators, prevRoundData]);

  const isInsolvent = (projections?.health?.rating === 'C' || projections?.health?.rating === 'D');

  const handleSubmit = async () => {
    if (isInsolvent && !showInsolvencyModal) {
      setShowInsolvencyModal(true);
      return;
    }
    setIsSaving(true);
    await saveDecisions(teamId, champId!, (activeArena?.current_round || 0) + 1, decisions);
    setIsSaving(false);
    alert("PROTOCOLO TRANSMITIDO COM SUCESSO.");
  };

  const updateDecision = (path: string, value: any) => {
    const newDecisions = JSON.parse(JSON.stringify(decisions));
    const keys = path.split('.');
    let current: any = newDecisions;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    setDecisions(newDecisions);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-3 pb-32 animate-in fade-in duration-700">
      <InsolvencyAlert 
        rating={projections?.health?.rating as CreditRating} 
        isOpen={showInsolvencyModal} 
        onClose={() => setShowInsolvencyModal(false)} 
      />

      <header className="bg-slate-900 border border-white/5 p-3 rounded-2xl shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-1">
           {STEPS.map((s, idx) => (
             <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                <span className="font-black text-[10px]">{idx + 1}</span>
                <span className="text-[9px] font-black uppercase hidden lg:block">{s.label}</span>
             </button>
           ))}
        </div>
        <div className="flex items-center gap-8 pr-6">
           <div className="text-right">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">RATING PROJETADO</span>
              <span className={`text-lg font-black italic ${projections?.health?.rating === 'D' ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                {projections?.health?.rating || '---'}
              </span>
           </div>
        </div>
      </header>

      <main className="bg-slate-950 p-10 rounded-[3rem] border border-white/5 shadow-2xl">
         {/* Conteúdo dinâmico das abas mantido para brevidade */}
         {activeStep === 5 && (
            <div className="flex flex-col items-center justify-center py-20 space-y-10">
               <div className="text-center space-y-4">
                  <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter">Finalizar Ciclo 0{(activeArena?.current_round || 0) + 1}</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest">Confirme a integridade dos dados antes da transmissão final.</p>
               </div>
               <button 
                 onClick={handleSubmit}
                 disabled={isSaving}
                 className={`px-24 py-8 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center gap-4 ${isInsolvent ? 'bg-rose-600 text-white hover:bg-white hover:text-rose-600' : 'bg-orange-600 text-white hover:bg-white hover:text-orange-600'}`}
               >
                  {isSaving ? <Loader2 className="animate-spin" /> : "Selar e Transmitir Decisão"}
               </button>
            </div>
         )}
      </main>
    </div>
  );
};

export default DecisionForm;
