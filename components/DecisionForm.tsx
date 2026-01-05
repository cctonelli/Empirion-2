
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  MapPin, Boxes, Cpu, Info, ChevronRight, ChevronLeft, ShieldAlert,
  Lock, AlertTriangle, Scale, UserPlus, UserMinus, GraduationCap, 
  TrendingUp, CheckCircle2, ShieldCheck, Flame, Zap
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
  regions: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, { price: 372, term: 0, marketing: 3 }])),
  hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
  production: { purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 0, activityLevel: 100, rd_investment: 0 },
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

  const projections = useMemo(() => {
    const macro = activeArena?.market_indicators || DEFAULT_MACRO;
    const eco = activeArena?.ecosystemConfig || { inflationRate: 0.01, demandMultiplier: 1.0, interestRate: 0.03, marketVolatility: 0.05, scenarioType: 'simulated', modalityType: 'standard' };
    return calculateProjections(decisions, branch, eco, macro);
  }, [decisions, branch, activeArena]);

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
      
      {/* BLACK SWAN TACTICAL ALERT */}
      <AnimatePresence>
        {activeEvent && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-rose-600 p-4 rounded-2xl flex items-center justify-between border border-white/20 shadow-2xl overflow-hidden mb-2"
          >
             <div className="flex items-center gap-6">
                <div className="p-3 bg-white/20 rounded-xl text-white animate-pulse shadow-lg"><Flame size={24} /></div>
                <div>
                   <h4 className="text-white font-black uppercase text-sm italic tracking-tighter">ALERTA TÁTICO: {activeEvent.title}</h4>
                   <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest">{activeEvent.impact}</p>
                </div>
             </div>
             <div className="px-6 py-2 bg-slate-950/30 rounded-full text-[9px] font-black text-white uppercase border border-white/10">
                Protocolo de Crise Ativo
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
        <div className="flex items-center gap-4 pr-4">
           <div className="text-right">
              <span className="block text-[7px] font-black text-slate-500 uppercase">LUCRO PROJETADO P{safeRound + 1}</span>
              <span className={`text-sm font-black font-mono italic ${projections.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'} ${activeEvent ? 'animate-pulse' : ''}`}>
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
                  <div key={id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 group hover:border-orange-500/30 transition-all">
                     <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <h4 className="text-xs font-black text-white uppercase italic tracking-tight">Região {id}</h4>
                        <MapPin size={10} className="text-slate-700" />
                     </div>
                     <div className="grid grid-cols-1 gap-1.5">
                        <DecInputCompact label="Preço Unit." val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                        <DecInputCompact label="Marketing" val={data.marketing} onChange={v => updateDecision(`regions.${id}.marketing`, v)} />
                     </div>
                  </div>
                ))}
              </div>
            )}

            {activeStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                 <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <h4 className="text-sm font-black uppercase text-blue-400 flex items-center gap-2 italic border-b border-white/5 pb-3"><UserPlus size={16} /> Movimentação de Mão de Obra</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <DecInput label="Admitir" val={decisions.hr.hired} onChange={v => updateDecision('hr.hired', v)} icon={<UserPlus size={14} className="text-emerald-500"/>} />
                       <DecInput label="Demitir" val={decisions.hr.fired} onChange={v => updateDecision('hr.fired', v)} icon={<UserMinus size={14} className="text-rose-500"/>} />
                    </div>
                 </div>
                 <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <h4 className="text-sm font-black uppercase text-orange-500 flex items-center gap-2 italic border-b border-white/5 pb-3"><GraduationCap size={16} /> Equipe de Vendas</h4>
                    <DecInput label="Vendedores (Qtde)" val={decisions.hr.sales_staff_count} onChange={v => updateDecision('hr.sales_staff_count', v)} />
                 </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                 <div className="lg:col-span-8 space-y-6">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
                       <h4 className="text-sm font-black uppercase text-blue-400 flex items-center gap-2 italic border-b border-white/5 pb-4"><Boxes size={18} /> Ordem de Compra</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <DecInput label="Compra MP-A (Unid)" val={decisions.production.purchaseMPA} onChange={v => updateDecision('production.purchaseMPA', v)} />
                          <DecInput label="Compra MP-B (Unid)" val={decisions.production.purchaseMPB} onChange={v => updateDecision('production.purchaseMPB', v)} />
                       </div>
                    </div>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                       <h4 className="text-sm font-black uppercase text-orange-500 flex items-center gap-2 italic border-b border-white/5 pb-4"><Cpu size={18} /> Produção Industrial</h4>
                       <DecInput label="Nível Atividade (%)" val={decisions.production.activityLevel} onChange={v => updateDecision('production.activityLevel', v)} />
                    </div>
                 </div>

                 <aside className="lg:col-span-4 space-y-6">
                    <div className={`p-8 rounded-[3rem] space-y-6 shadow-xl border ${activeEvent ? 'bg-rose-600/10 border-rose-500/20' : 'bg-blue-600/10 border-blue-500/20'}`}>
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg text-white ${activeEvent ? 'bg-rose-600' : 'bg-blue-600'}`}><TrendingUp size={16}/></div>
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Oracle Quote Node</h4>
                       </div>
                       <div className="space-y-4">
                          <PriceQuote label="MP-A (Atual)" val={`$ ${((activeArena?.market_indicators?.providerPrices?.mpA || 20.20) * (activeEvent?.modifiers?.cost_multiplier || 1)).toFixed(2)}`} trend={activeEvent ? 'CRISIS' : 'OK'} />
                          <PriceQuote label="MP-B (Atual)" val={`$ ${((activeArena?.market_indicators?.providerPrices?.mpB || 40.40) * (activeEvent?.modifiers?.cost_multiplier || 1)).toFixed(2)}`} trend={activeEvent ? 'CRISIS' : 'OK'} />
                          <PriceQuote label="Demanda Global" val={`${((activeArena?.ecosystemConfig?.demandMultiplier || 1) * (1 + (activeEvent?.modifiers?.demand || 0))).toFixed(1)}x`} trend="DYN" />
                       </div>
                    </div>
                 </aside>
              </div>
            )}

            {activeStep === 5 && (
              <div className="text-center space-y-6 py-4">
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 max-w-xl mx-auto space-y-6 shadow-2xl">
                    <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter flex items-center justify-center gap-3"><CheckCircle2 className="text-emerald-500" /> Selo Oráculo Oracle</h3>
                    <div className="grid grid-cols-2 gap-3 text-left border-y border-white/5 py-6">
                       <SummaryNode label="Volume Vendas" val={projections.salesVolume.toFixed(0)} />
                       <SummaryNode label="Market Share" val={`${projections.marketShare.toFixed(1)}%`} />
                       <SummaryNode label="Lucro Líquido" val={`$ ${projections.netProfit.toLocaleString()}`} />
                       <SummaryNode label="Status Evento" val={activeEvent ? activeEvent.title.toUpperCase() : 'ESTÁVEL'} />
                    </div>
                    <button onClick={async () => { setIsSaving(true); await saveDecisions(teamId, champId!, safeRound, decisions); setIsSaving(false); alert("PROTOCOLADO COM SUCESSO."); }} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-white hover:text-orange-600 transition-all active:scale-95">
                       {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Transmitir Decisões de Período"}
                    </button>
                 </div>
              </div>
            )}

            <footer className="mt-6 pt-4 border-t border-white/5 flex justify-between">
               <button onClick={() => setActiveStep(s => Math.max(0, s-1))} className="px-5 py-2 text-slate-500 font-black uppercase text-[7px] tracking-widest hover:text-white transition-all flex items-center gap-2">
                  <ChevronLeft size={14} /> Voltar
               </button>
               <button onClick={() => setActiveStep(s => Math.min(5, s+1))} className="px-8 py-3 bg-white text-slate-950 rounded-full font-black text-[8px] uppercase tracking-[0.2em] shadow-lg hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2">
                  Próximo Protocolo <ChevronRight size={14} />
               </button>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const DecInput = ({ label, val, onChange, icon }: any) => (
  <div className="space-y-2 flex-1">
     <div className="flex items-center gap-2">
        {icon}
        <label className="text-[9px] font-black text-slate-500 uppercase italic leading-none">{label}</label>
     </div>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-mono font-bold text-white text-base outline-none focus:border-orange-500 transition-all" />
  </div>
);

const DecInputCompact = ({ label, val, onChange }: any) => (
  <div className="space-y-0.5">
     <label className="text-[7px] font-black text-slate-600 uppercase italic leading-none">{label}</label>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/5 rounded-lg py-1.5 px-2 font-mono font-bold text-white text-[11px] outline-none focus:border-orange-500 transition-all" />
  </div>
);

const PriceQuote = ({ label, val, trend }: any) => (
  <div className="flex justify-between items-center group">
     <span className="text-[8px] font-black text-blue-300 uppercase tracking-tighter">{label}</span>
     <div className="text-right">
        <span className="block text-sm font-black text-white italic font-mono leading-none">{val}</span>
        <span className={`text-[7px] font-black uppercase ${trend === 'CRISIS' ? 'text-rose-400' : 'text-emerald-400'}`}>{trend}</span>
     </div>
  </div>
);

const SummaryNode = ({ label, val }: any) => (
  <div className="space-y-0.5">
     <span className="block text-[7px] font-black text-slate-500 uppercase">{label}</span>
     <span className="text-sm font-black italic text-white leading-tight">{val}</span>
  </div>
);

export default DecisionForm;
