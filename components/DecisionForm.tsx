import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  ArrowRight, ArrowLeft, ShieldCheck, Activity, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  TrendingUp, Landmark, Cloud, HardDrive, AlertCircle, ShieldAlert
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
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

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId, champId, round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRegion, setActiveRegion] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [decisions, setDecisions] = useState<DecisionData>({
    regions: {}, hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
    production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0 },
    finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
    legal: { recovery_mode: 'none' }
  });

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeStep]);

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const initialRegions: any = {};
          for (let i = 1; i <= (found.regions_count || 9); i++) {
            initialRegions[i] = { price: 372, term: 1, marketing: 0 };
          }
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
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

  if (!teamId || !champId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6 bg-slate-900/40 rounded-[3rem] border border-white/5">
         <div className="p-5 bg-orange-600/10 rounded-2xl text-orange-500 animate-pulse"><ShieldAlert size={48}/></div>
         <div className="space-y-2">
            <h3 className="text-2xl font-black text-white uppercase italic">Aguardando Sincronização</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-sm">
               O formulário de decisões requer um Nodo de Equipe ativo. Selecione sua unidade no menu de campeonatos.
            </p>
         </div>
      </div>
    );
  }

  const updateDecision = (path: string, val: any) => {
    const keys = path.split('.');
    setDecisions(prev => {
      const next = { ...prev };
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const handleTransmit = async () => {
    setIsSaving(true);
    try {
      const result = await saveDecisions(teamId, champId, round, decisions);
      if (result.source === 'cloud') {
         alert("TRANSMISSÃO CONCLUÍDA: Dados sincronizados na nuvem Oracle.");
      } else {
         alert(`TRANSMISSÃO LOCAL: Decisões salvas em modo sandbox resiliente.`);
      }
    } catch (e: any) { 
      alert(`ERRO NA TRANSMISSÃO: ${e.message}`); 
    }
    setIsSaving(false);
  };

  return (
    <div className="wizard-shell">
      <div className="absolute top-4 right-8 z-[60] flex items-center gap-3 bg-slate-950/80 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/10 shadow-2xl pointer-events-none">
         <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
         <span className="text-[10px] font-black text-white italic tracking-[0.2em] uppercase">Oracle Projection: {rating}</span>
      </div>

      <nav className="wizard-header-fixed flex p-2.5 shrink-0 gap-1.5 overflow-x-auto no-scrollbar">
         {STEPS.map((s, idx) => (
           <button 
             key={s.id} 
             onClick={() => setActiveStep(idx)} 
             className={`flex-1 min-w-[80px] py-3 transition-all rounded-2xl flex flex-col items-center gap-1.5 ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
           >
              <s.icon size={16} />
              <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
           </button>
         ))}
      </nav>

      <div ref={scrollContainerRef} className="wizard-content">
         <AnimatePresence mode="wait">
            <motion.div 
              key={activeStep} 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }} className="pb-10"
            >
               {activeStep === 0 && (
                  <div className="space-y-12">
                     <div className="matrix-container p-4">
                        <div className="flex gap-2">
                           {Array.from({ length: activeArena?.regions_count || 9 }).map((_, i) => (
                             <button key={i} onClick={() => setActiveRegion(i+1)} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase border transition-all whitespace-nowrap ${activeRegion === i+1 ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'bg-slate-950 text-slate-500 border-white/5 hover:border-white/20'}`}>
                               Região 0{i+1}
                             </button>
                           ))}
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputCard label="Preço de Venda" val={decisions.regions[activeRegion]?.price || 372} onChange={(v: number) => updateDecision(`regions.${activeRegion}.price`, v)} icon={<DollarSign size={18}/>} />
                        <InputCard label="Marketing Local" desc="(0 a 9)" val={decisions.regions[activeRegion]?.marketing || 0} onChange={(v: number) => updateDecision(`regions.${activeRegion}.marketing`, v)} icon={<Sparkles size={18}/>} />
                     </div>
                  </div>
               )}

               {activeStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputCard label="Compra MP-A" val={decisions.production.purchaseMPA} onChange={(v: number) => updateDecision('production.purchaseMPA', v)} icon={<Package size={18}/>} />
                     <InputCard label="Compra MP-B" val={decisions.production.purchaseMPB} onChange={(v: number) => updateDecision('production.purchaseMPB', v)} icon={<Package size={18}/>} />
                     <InputCard label="OEE Goal %" val={decisions.production.activityLevel} onChange={(v: number) => updateDecision('production.activityLevel', v)} icon={<Activity size={18}/>} />
                     <InputCard label="P&D Inv." val={decisions.production.rd_investment} onChange={(v: number) => updateDecision('production.rd_investment', v)} icon={<Cpu size={18}/>} />
                  </div>
               )}

               {activeStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputCard label="Contratações" val={decisions.hr.hired} onChange={(v: number) => updateDecision('hr.hired', v)} icon={<Users2 size={18}/>} />
                     <InputCard label="Desligamentos" val={decisions.hr.fired} onChange={(v: number) => updateDecision('hr.fired', v)} icon={<Users2 size={18}/>} />
                     <InputCard label="Salário Médio" val={decisions.hr.salary} onChange={(v: number) => updateDecision('hr.salary', v)} icon={<DollarSign size={18}/>} />
                     <InputCard label="Treinamento %" val={decisions.hr.trainingPercent} onChange={(v: number) => updateDecision('hr.trainingPercent', v)} icon={<Target size={18}/>} />
                  </div>
               )}

               {activeStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputCard label="Tomada Empréstimo" val={decisions.finance.loanRequest} onChange={(v: number) => updateDecision('finance.loanRequest', v)} icon={<Landmark size={18}/>} />
                     <InputCard label="Aplicação Fin." val={decisions.finance.application} onChange={(v: number) => updateDecision('finance.application', v)} icon={<TrendingUp size={18}/>} />
                  </div>
               )}

               {activeStep === 4 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-12 py-10">
                     <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-2xl"><ShieldCheck size={48} /></div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
                        <ReviewPanel label="Net Profit Est." val={`$ ${(projections?.netProfit || 0).toLocaleString()}`} pos={(projections?.netProfit || 0) >= 0} />
                        <ReviewPanel label="Oracle Rating" val={rating} pos={rating.includes('A')} />
                        <ReviewPanel label="Market Share" val={`${(projections?.marketShare || 12.5).toFixed(1)}%`} pos />
                     </div>
                     <p className="text-slate-500 font-bold italic text-sm max-w-xl">"O selo Oracle garante que os dados estão prontos para transmissão."</p>
                  </div>
               )}
            </motion.div>
         </AnimatePresence>
      </div>

      <footer className="wizard-footer-dock">
         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className={`px-8 py-4 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-3 active:scale-95 ${activeStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}>
            <ArrowLeft size={18} /> Voltar
         </button>
         
         <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Etapa Atual</span>
               <span className="text-[10px] font-black text-slate-400 uppercase">{activeStep + 1} de {STEPS.length}</span>
            </div>
            {activeStep === STEPS.length - 1 ? (
              <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="px-14 py-5 bg-orange-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all flex items-center gap-4 active:scale-95 group">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Transmitir Ciclo
              </button>
            ) : (
              <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="px-14 py-5 bg-white/5 border border-white/10 hover:bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center gap-4 active:scale-95 group">
                Avançar <ArrowRight size={18} />
              </button>
            )}
         </div>
      </footer>
    </div>
  );
};

const InputCard = ({ label, desc, val, icon, onChange }: any) => (
  <div className="glass-card p-8 space-y-6 group text-left">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors border border-white/5">{icon}</div>
        <div>
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{label}</label>
           {desc && <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter mt-0.5">{desc}</p>}
        </div>
     </div>
     <input type="number" value={val} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950/60 border-none rounded-2xl px-6 py-5 text-white font-mono font-black text-3xl outline-none focus:ring-2 focus:ring-orange-600 transition-all shadow-inner" />
  </div>
);

const ReviewPanel = ({ label, val, pos }: any) => (
  <div className="p-8 bg-slate-950/60 rounded-[2rem] border border-white/5 space-y-3 shadow-inner group hover:border-white/10 transition-colors">
     <span className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</span>
     <span className={`text-2xl font-black italic font-mono leading-none ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>{val}</span>
  </div>
);

export default DecisionForm;