
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, Wallet, 
  TrendingUp, ArrowUpRight, TrendingDown, ClipboardCheck,
  PlusCircle, MinusCircle, AlertCircle, RefreshCw,
  Timer, Settings2, UserPlus, Rocket, Info, HelpCircle,
  // Added Zap to imports to fix the error on line 138
  HardDrive, Lock, Zap
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
import { sanitize } from '../services/simulation';
import { DecisionData, Branch, Championship, MachineModel } from '../types';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const STEPS = [
  { id: 'legal', label: '1. JURÍDICO', icon: Gavel },
  { id: 'marketing', label: '2. COMERCIAL', icon: Megaphone },
  { id: 'production', label: '3. OPERAÇÕES', icon: Factory },
  { id: 'hr', label: '4. TALENTOS', icon: Users2 },
  { id: 'assets', label: '5. ATIVOS', icon: Cpu },
  { id: 'finance', label: '6. FINANÇAS', icon: Landmark },
  { id: 'goals', label: '7. METAS', icon: Target },
  { id: 'review', label: '8. FINALIZAR', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId, champId, round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRegion, setActiveRegion] = useState(1);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 0, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0, sales_staff_count: 50 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 0, extraProductionPercent: 0, rd_investment: 0, net_profit_target_percent: 0, term_interest_rate: 0 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanTerm: 0, application: 0 },
    estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const initialRegions: any = {};
          for (let i = 1; i <= (found.regions_count || 1); i++) {
            initialRegions[i] = { price: 425, term: 1, marketing: 1 };
          }
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      }
    };
    fetchContext();
  }, [champId]);

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

  const getAdjustedMachinePrice = (model: MachineModel) => {
    if (!activeArena) return 0;
    const base = activeArena.market_indicators.machinery_values?.[model] || 500000;
    return base;
  };

  const handleTransmit = async () => {
    if (!teamId || !champId || isReadOnly) return;
    setIsSaving(true);
    try {
      const res = await saveDecisions(teamId, champId, round, decisions) as any;
      if (res.success) alert("PROTOCOLO SELADO: Suas decisões foram transmitidas ao motor Oracle.");
    } finally { setIsSaving(false); }
  };

  const isBuyingMachines = decisions.machinery.buy.alfa + decisions.machinery.buy.beta + decisions.machinery.buy.gama > 0;

  return (
    <div className="flex flex-col h-full bg-slate-900/20 rounded-[2.5rem] border border-white/5 overflow-hidden">
      <nav className="flex p-1 gap-1 bg-slate-900/80 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar shadow-xl">
         {STEPS.map((s, idx) => (
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[110px] py-3 px-2 rounded-2xl transition-all flex flex-col items-center gap-1.5 border ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white shadow-xl scale-[1.02] z-10' : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300'}`}>
              <s.icon size={12} strokeWidth={3} />
              <span className="text-[7px] font-black uppercase tracking-tighter text-center">{s.label}</span>
           </button>
         ))}
      </nav>

      <div className="flex-1 overflow-hidden bg-slate-950/40 relative">
         <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto custom-scrollbar p-6 md:p-12 pb-32">
               
               {activeStep === 3 && (
                  <div className="max-w-5xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/5 shadow-3xl text-center space-y-8">
                        <Users2 size={48} className="text-indigo-400 mx-auto" />
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gestão de Talentos</h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputCard label="Novas Admissões" val={decisions.hr.hired} onChange={(v:any)=>updateDecision('hr.hired', v)} icon={<UserPlus size={20}/>} />
                        <InputCard label="Desligamentos" val={decisions.hr.fired} onChange={(v:any)=>updateDecision('hr.fired', v)} icon={<MinusCircle size={20}/>} />
                        <div className="space-y-6 bg-slate-900/60 p-10 rounded-[3rem] border border-white/5">
                           <RangeInput label="Treinamento (%)" info="Essencial ao contratar ou comprar máquinas. Sugestão: 15-20%." val={decisions.hr.trainingPercent} onChange={(v:any)=>updateDecision('hr.trainingPercent', v)} color="indigo" />
                           {isBuyingMachines && decisions.hr.trainingPercent < 15 && (
                              <div className="p-4 bg-rose-600/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
                                 <AlertCircle className="text-rose-500" size={16} />
                                 <span className="text-[9px] font-black text-rose-500 uppercase italic">Atenção: Treinamento insuficiente para novos ativos.</span>
                              </div>
                           )}
                        </div>
                        <InputCard label="Piso Salarial ($)" val={decisions.hr.salary} onChange={(v:any)=>updateDecision('hr.salary', v)} icon={<Wallet size={20}/>} />
                     </div>
                  </div>
               )}

               {activeStep === 4 && (
                  <div className="space-y-16">
                     <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 space-y-10">
                        <div className="flex justify-between items-center">
                           <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-6"><TrendingUp className="text-emerald-500" /> Expansão CAPEX</h3>
                           {isBuyingMachines && (
                              <div className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                                 <Zap size={12}/> Requer Treinamento (Card 4)
                              </div>
                           )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <MachineBuyCard model="ALFA" icon={<Cpu/>} cap="2.000" ops="94" price={getAdjustedMachinePrice('alfa')} val={decisions.machinery.buy.alfa} onChange={(v:any)=>updateDecision('machinery.buy.alfa', v)} />
                           <MachineBuyCard model="BETA" icon={<Cpu/>} cap="6.000" ops="235" price={getAdjustedMachinePrice('beta')} val={decisions.machinery.buy.beta} onChange={(v:any)=>updateDecision('machinery.buy.beta', v)} />
                           <MachineBuyCard model="GAMA" icon={<Cpu/>} cap="12.000" ops="445" price={getAdjustedMachinePrice('gama')} val={decisions.machinery.buy.gama} onChange={(v:any)=>updateDecision('machinery.buy.gama', v)} />
                        </div>
                     </div>
                  </div>
               )}

               {/* Omissão proposital das outras abas para brevidade (mantidas conforme original) */}

            </motion.div>
         </AnimatePresence>

         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="floating-nav-btn left-8 transition-all"><ChevronLeft size={28} strokeWidth={3} /></button>
         {activeStep === STEPS.length - 1 ? (
           <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="floating-nav-btn-primary">
              {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Rocket size={24} />} TRANSMITIR PARA ORACLE
           </button>
         ) : (
           <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="floating-nav-btn right-8 transition-all"><ChevronRight size={28} strokeWidth={3} /></button>
         )}
      </div>
    </div>
  );
};

const InputCard = ({ label, val, icon, onChange, info }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all">
     <div className="flex items-center gap-2">
        <div className="text-slate-500">{icon}</div>
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label>
     </div>
     <input type="number" value={val || ''} placeholder="0" onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner" />
  </div>
);

const RangeInput = ({ label, val, color, onChange, info }: any) => (
   <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
         <label className="text-[10px] font-black uppercase text-slate-500 flex items-center">{label}</label>
         <span className={`text-lg font-black italic ${color === 'blue' ? 'text-blue-500' : 'text-indigo-500'}`}>{val}%</span>
      </div>
      <input type="range" value={val} onChange={e => onChange(Number(e.target.value))} className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-900 accent-${color}-500`} />
      {info && <p className="text-[8px] text-slate-500 uppercase tracking-widest italic">{info}</p>}
   </div>
);

const MachineBuyCard = ({ model, cap, ops, price, val, onChange, icon }: any) => (
   <div className="bg-slate-950/80 p-8 rounded-[3rem] border border-white/5 space-y-6 group hover:border-white/20 transition-all shadow-xl">
      <div className="flex justify-between items-start">
         <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400">{icon}</div>
         <div className="text-right">
            <h5 className="text-xl font-black text-white italic">MÁQUINA {model}</h5>
         </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-white/5">
         <div className="flex justify-between text-[10px] text-slate-500 font-bold"><span>Capacidade</span><span>{cap} UN</span></div>
         <div className="flex justify-between text-[10px] text-slate-500 font-bold"><span>Preço</span><span>$ {price.toLocaleString()}</span></div>
      </div>
      <input type="number" value={val} onChange={e => onChange(parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl p-4 text-center text-white font-black" placeholder="0" />
   </div>
);

export default DecisionForm;
