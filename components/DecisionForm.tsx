
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  MapPin, Boxes, Cpu, Info, ChevronRight, ChevronLeft, ShieldAlert,
  Lock, AlertTriangle, Scale, UserPlus, UserMinus, GraduationCap, 
  TrendingUp, CheckCircle2, ShieldCheck, Flame, Zap, Landmark, Shield
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, Championship, MacroIndicators } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_MACRO } from '../constants';

const STEPS = [
  { id: 'marketing', label: 'Comercial', icon: Megaphone },
  { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
  { id: 'production', label: 'Produção & Fábrica', icon: Factory },
  { id: 'finance', label: 'Finanças & CapEx', icon: DollarSign },
  { id: 'legal', label: 'Protocolo Jurídico', icon: Gavel },
  { id: 'review', label: 'Revisão & Selo', icon: ShieldCheck },
];

const createInitialDecisions = (): DecisionData => ({
  regions: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 3 }])),
  hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
  production: { purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 1, activityLevel: 100, rd_investment: 0 },
  finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
  legal: { recovery_mode: 'none' }
});

interface DecisionFormProps {
  teamId?: string;
  champId?: string;
  round: number; 
  branch?: Branch;
  userName?: string;
}

const DecisionForm: React.FC<DecisionFormProps> = ({ 
  teamId = 'team-alpha', 
  champId = 'c1', 
  round = 1, 
  branch = 'industrial',
  userName 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [decisions, setDecisions] = useState<DecisionData>(createInitialDecisions());
  const [isSaving, setIsSaving] = useState(false);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);

  const safeRound = useMemo(() => {
    const r = Number(round);
    return isNaN(r) ? 1 : r;
  }, [round]);

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data } = await getChampionships();
        const found = data?.find(a => a.id === champId);
        if (found) setActiveArena(found);
      }
    };
    fetchContext();
  }, [champId]);

  // Defined currentIndicators to fix "Cannot find name 'currentIndicators'" error on line 189
  const currentIndicators = activeArena?.market_indicators || DEFAULT_MACRO;

  const projections = useMemo(() => {
    const macro = currentIndicators;
    const eco = activeArena?.ecosystemConfig || { inflationRate: 0.01, demandMultiplier: 1.0, interestRate: 0.03, marketVolatility: 0.05, scenarioType: 'simulated', modalityType: 'standard' };
    return calculateProjections(decisions, branch, eco, macro);
  }, [decisions, branch, activeArena, currentIndicators]);

  const updateDecision = (path: string, value: any) => {
    const newDecisions = JSON.parse(JSON.stringify(decisions));
    const keys = path.split('.');
    let current: any = newDecisions;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    setDecisions(newDecisions);
  };

  const activeEvent = projections.activeEvent;
  const isInRJ = decisions.legal.recovery_mode === 'judicial';

  return (
    <div className="max-w-[1600px] mx-auto space-y-3 pb-32 animate-in fade-in duration-700">
      
      {/* CRISIS & CREDIT ALERTS */}
      <AnimatePresence>
        {projections.creditRating === 'C' && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-amber-600 p-4 rounded-2xl flex items-center justify-between border border-white/20 shadow-2xl mb-2">
             <div className="flex items-center gap-4">
                <ShieldAlert size={20} className="text-white animate-pulse" />
                <span className="text-white font-black uppercase text-[10px] tracking-widest">Risco de Insolvência: Rating C • Linhas de Crédito Reduzidas</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-slate-900 border border-white/5 p-2 rounded-2xl shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-1">
           {STEPS.map((s, idx) => (
             <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                <span className="font-black text-[9px]">{idx + 1}</span>
                <span className="text-[8px] font-black uppercase tracking-widest hidden lg:block">{s.label}</span>
             </button>
           ))}
        </div>
        <div className="flex items-center gap-6 pr-4">
           <div className="text-right border-r border-white/10 pr-6">
              <span className="block text-[7px] font-black text-slate-500 uppercase">RATING ORACLE</span>
              <span className={`text-sm font-black italic ${projections.creditRating === 'A' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {projections.creditRating} NODE
              </span>
           </div>
           <div className="text-right">
              <span className="block text-[7px] font-black text-slate-500 uppercase">LUCRO PROJETADO P{safeRound + 1}</span>
              <span className={`text-sm font-black font-mono italic ${projections.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                $ {projections.netProfit.toLocaleString()}
              </span>
           </div>
        </div>
      </header>

      <main className="bg-slate-950 p-4 md:p-8 rounded-[2rem] border border-white/5 relative shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div key={STEPS[activeStep].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            
            {activeStep === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {Object.entries(decisions.regions).map(([id, data]: [any, any]) => (
                  <div key={id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 group hover:border-orange-500/30 transition-all">
                     <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-xs font-black text-white uppercase italic">Região {id}</h4>
                        <MapPin size={12} className="text-orange-500" />
                     </div>
                     <DecInputCompact label="Preço Unit." val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                     <DecInputCompact label="Marketing" val={data.marketing} onChange={v => updateDecision(`regions.${id}.marketing`, v)} />
                     <div className="space-y-1">
                        <label className="text-[7px] font-black text-slate-600 uppercase italic">Prazo (0=Vista, 1=30, 2=60)</label>
                        <input type="number" min="0" max="2" value={data.term} onChange={e => updateDecision(`regions.${id}.term`, Number(e.target.value))} className="w-full bg-slate-900 border border-white/5 rounded-lg py-1 px-2 text-white font-mono text-xs outline-none focus:border-orange-500" />
                     </div>
                  </div>
                ))}
              </div>
            )}

            {activeStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                 <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 shadow-inner">
                    <h4 className="text-sm font-black uppercase text-blue-400 flex items-center gap-3 italic border-b border-white/5 pb-4"><UserPlus size={18} /> Staff Operations</h4>
                    <div className="grid grid-cols-2 gap-6">
                       <DecInput label="Admitir" val={decisions.hr.hired} onChange={v => updateDecision('hr.hired', v)} icon={<UserPlus size={14} className="text-emerald-500"/>} />
                       <DecInput label="Demitir" val={decisions.hr.fired} onChange={v => updateDecision('hr.fired', v)} icon={<UserMinus size={14} className="text-rose-500"/>} />
                    </div>
                    <DecInput label="Salário Nominal ($)" val={decisions.hr.salary} onChange={v => updateDecision('hr.salary', v)} />
                 </div>
                 <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 shadow-inner">
                    <h4 className="text-sm font-black uppercase text-orange-500 flex items-center gap-3 italic border-b border-white/5 pb-4"><GraduationCap size={18} /> Performance Node</h4>
                    <DecInput label="Vendedores (Qtde)" val={decisions.hr.sales_staff_count} onChange={v => updateDecision('hr.sales_staff_count', v)} />
                    <DecInput label="Participação Lucros (%)" val={decisions.hr.participationPercent} onChange={v => updateDecision('hr.participationPercent', v)} />
                 </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                 <div className="lg:col-span-8 p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-10 shadow-2xl">
                    <h4 className="text-sm font-black uppercase text-blue-400 flex items-center gap-3 italic border-b border-white/5 pb-6"><Landmark size={20} /> Capital Structuring</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <DecInput label="Solicitar Empréstimo ($)" val={decisions.finance.loanRequest} onChange={v => updateDecision('finance.loanRequest', v)} />
                          <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                             <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Limite Oracle Bancário</span>
                             <span className="text-xs font-black text-white font-mono">$ {projections.loanLimit.toLocaleString()}</span>
                          </div>
                       </div>
                       <DecInput label="Aplicação Financeira ($)" val={decisions.finance.application} onChange={v => updateDecision('finance.application', v)} />
                    </div>
                 </div>

                 <aside className="lg:col-span-4 bg-slate-900 p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3 text-orange-500">
                       <Shield size={20} />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Credit Assessment</h4>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic uppercase">
                       "Baseado no Ativo de $ {currentIndicators.initialExchangeRateUSD > 0 ? '9.1M' : '0'}, seu Rating {projections.creditRating} permite taxas de 2.2% AM. Exceder o limite bancário ativará o modo de Recuperação Judicial automática."
                    </p>
                 </aside>
              </div>
            )}

            {activeStep === 5 && (
              <div className="text-center space-y-8 py-8">
                 <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/10 max-w-2xl mx-auto space-y-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    <CheckCircle2 className="absolute -top-10 -right-10 text-emerald-500 opacity-5" size={300} />
                    <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter flex items-center justify-center gap-4 relative z-10"><CheckCircle2 className="text-emerald-500" /> Oracle Seal v9.0</h3>
                    <div className="grid grid-cols-2 gap-4 text-left border-y border-white/5 py-8 relative z-10">
                       <SummaryNode label="Volume Vendas (Est.)" val={projections.salesVolume.toFixed(0)} />
                       <SummaryNode label="Market Share" val={`${projections.marketShare.toFixed(1)}%`} />
                       <SummaryNode label="Caixa Projetado" val={`$ ${projections.cashFlowNext.toLocaleString()}`} />
                       <SummaryNode label="Credit Rating" val={projections.creditRating} />
                    </div>
                    <button onClick={async () => { setIsSaving(true); await saveDecisions(teamId, champId!, safeRound, decisions); setIsSaving(false); alert("PROTOCOLO TRANSMITIDO COM SUCESSO."); }} className="w-full py-6 bg-orange-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-orange-600 transition-all active:scale-95 relative z-10">
                       {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Sincronizar Ciclo Industrial"}
                    </button>
                 </div>
              </div>
            )}

            <footer className="mt-10 pt-6 border-t border-white/5 flex justify-between">
               <button onClick={() => setActiveStep(s => Math.max(0, s-1))} className="px-6 py-3 text-slate-500 font-black uppercase text-[8px] tracking-widest hover:text-white transition-all flex items-center gap-2">
                  <ChevronLeft size={16} /> Voltar
               </button>
               <button onClick={() => setActiveStep(s => Math.min(5, s+1))} className="px-10 py-4 bg-white text-slate-950 rounded-full font-black text-[9px] uppercase tracking-[0.25em] shadow-xl hover:bg-orange-600 hover:text-white transition-all flex items-center gap-3">
                  Próxima Etapa <ChevronRight size={16} />
               </button>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const DecInput = ({ label, val, onChange, icon }: any) => (
  <div className="space-y-3 flex-1">
     <div className="flex items-center gap-2">
        {icon}
        <label className="text-[10px] font-black text-slate-500 uppercase italic">{label}</label>
     </div>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 font-mono font-bold text-white text-lg outline-none focus:border-orange-500 shadow-inner" />
  </div>
);

const DecInputCompact = ({ label, val, onChange }: any) => (
  <div className="space-y-1">
     <label className="text-[8px] font-black text-slate-600 uppercase italic">{label}</label>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 font-mono font-bold text-white text-xs outline-none focus:border-orange-500 transition-all" />
  </div>
);

const SummaryNode = ({ label, val }: any) => (
  <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/5">
     <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     <span className="text-xl font-black italic text-white font-mono">{val}</span>
  </div>
);

export default DecisionForm;
