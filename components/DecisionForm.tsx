
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, 
  MapPin, Boxes, Cpu, Info, ChevronRight, ChevronLeft, ShieldAlert,
  Lock, AlertTriangle, Scale, UserPlus, UserMinus, GraduationCap, 
  TrendingUp, CheckCircle2, ShieldCheck, Flame, Zap, Landmark, Shield,
  // Added missing Activity import
  Activity
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

  const currentIndicators = useMemo(() => activeArena?.market_indicators || DEFAULT_MACRO, [activeArena]);

  const projections = useMemo(() => {
    const eco = activeArena?.ecosystemConfig || { inflationRate: 0.01, demandMultiplier: 1.0, interestRate: 0.03, marketVolatility: 0.05, scenarioType: 'simulated', modalityType: 'standard' };
    return calculateProjections(decisions, branch, eco, currentIndicators);
  }, [decisions, branch, activeArena, currentIndicators]);

  const updateDecision = (path: string, value: any) => {
    const newDecisions = JSON.parse(JSON.stringify(decisions));
    const keys = path.split('.');
    let current: any = newDecisions;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    setDecisions(newDecisions);
  };

  const isBlocked = projections.health.rating === 'C' && decisions.finance.loanRequest > 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-3 pb-32 animate-in fade-in duration-700">
      
      {/* INSOLVENCY ALERT PANEL */}
      <AnimatePresence>
        {projections.health.rating === 'C' && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-rose-600 p-5 rounded-[2rem] flex items-center justify-between border border-white/20 shadow-2xl mb-4">
             <div className="flex items-center gap-5">
                <div className="p-3 bg-white/20 rounded-xl text-white animate-pulse"><ShieldAlert size={24} /></div>
                <div>
                   <h4 className="text-white font-black uppercase text-sm italic tracking-tighter">ALERTA BANCÁRIO ORACLE: RATING C (CRÍTICO)</h4>
                   <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest">Limite de endividamento excedido. Transmissão de empréstimo bloqueada.</p>
                </div>
             </div>
             <button onClick={() => setActiveStep(4)} className="px-6 py-2 bg-white text-rose-600 rounded-full text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">Declarar Recuperação</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-slate-900 border border-white/5 p-3 rounded-2xl shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-1">
           {STEPS.map((s, idx) => (
             <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                <span className="font-black text-[10px]">{idx + 1}</span>
                <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">{s.label}</span>
             </button>
           ))}
        </div>
        <div className="flex items-center gap-8 pr-6">
           <div className="text-right border-r border-white/10 pr-8">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">HEALTH MONITOR</span>
              <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full animate-pulse ${projections.health.insolvency_risk > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                 <span className={`text-sm font-black italic ${projections.health.rating === 'AAA' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {projections.health.rating} NODE
                 </span>
              </div>
           </div>
           <div className="text-right">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">LUCRO PROJETADO P{safeRound + 1}</span>
              <span className={`text-lg font-black font-mono italic ${projections.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                $ {projections.netProfit.toLocaleString()}
              </span>
           </div>
        </div>
      </header>

      <main className="bg-slate-950 p-6 md:p-10 rounded-[3rem] border border-white/5 relative shadow-2xl overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div key={STEPS[activeStep].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            
            {activeStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
                 <div className="lg:col-span-8 space-y-10">
                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-10 shadow-inner">
                       <h4 className="text-sm font-black uppercase text-blue-400 flex items-center gap-3 italic border-b border-white/5 pb-6"><Boxes size={22} /> Industrial Capacity Planning</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <DecInput label="Compra MP-A (Unid)" val={decisions.production.purchaseMPA} onChange={v => updateDecision('production.purchaseMPA', v)} />
                          <DecInput label="Compra MP-B (Unid)" val={decisions.production.purchaseMPB} onChange={v => updateDecision('production.purchaseMPB', v)} />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Cpu size={14}/> Nível de Atividade Industrial (%)</label>
                          <input type="range" min="0" max="100" step="10" value={decisions.production.activityLevel} onChange={e => updateDecision('production.activityLevel', Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                          <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase">
                             <span>Parada Total</span>
                             <span>Plena Carga (100%)</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <aside className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[3.5rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group/side">
                       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/side:rotate-12 transition-transform"><Cpu size={120} /></div>
                       <h4 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-3">
                          {/* Activity icon from lucide-react used here */}
                          <Activity size={16}/> OEE Operational Insight
                       </h4>
                       <div className="space-y-6">
                          <OracleData label="Capacidade Máxima" val={`${(30000 * (decisions.production.activityLevel / 100)).toLocaleString()} un.`} />
                          <OracleData label="Volume Solicitado" val={`${projections.salesVolume.toFixed(0)} un.`} color="text-white" />
                          {projections.lostSales > 0 && (
                            <div className="p-4 bg-rose-600/10 border border-rose-500/20 rounded-2xl space-y-2">
                               <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={10}/> Vendas Perdidas</span>
                               <span className="text-xl font-black text-white italic font-mono">{projections.lostSales.toFixed(0)} <small className="text-[10px] font-bold">UNIDADES</small></span>
                               <p className="text-[8px] text-slate-500 italic leading-none">Aumente o Nível de Atividade para capturar este Share.</p>
                            </div>
                          )}
                       </div>
                    </div>
                 </aside>
              </div>
            )}

            {/* Default Steps (0, 1, 3, 4) - Same logic, updated UI consistency */}
            {activeStep === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(decisions.regions).map(([id, data]: [any, any]) => (
                  <div key={id} className="p-5 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4 hover:border-orange-500/40 transition-all shadow-xl">
                     <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h4 className="text-xs font-black text-white uppercase italic tracking-tighter">Região 0{id}</h4>
                        <MapPin size={14} className="text-orange-500" />
                     </div>
                     <DecInputCompact label="Preço Unit." val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                     <DecInputCompact label="Mkt Effort" val={data.marketing} onChange={v => updateDecision(`regions.${id}.marketing`, v)} />
                     <div className="grid grid-cols-3 gap-1">
                        {[0, 1, 2].map(t => (
                          <button key={t} onClick={() => updateDecision(`regions.${id}.term`, t)} className={`py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${data.term === t ? 'bg-blue-600 border-white text-white shadow-lg' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                             T+{t === 0 ? '0' : t === 1 ? '30' : '60'}
                          </button>
                        ))}
                     </div>
                  </div>
                ))}
              </div>
            )}

            {activeStep === 5 && (
              <div className="text-center space-y-10 py-10">
                 <div className="bg-slate-900 p-16 rounded-[4rem] border border-white/10 max-w-3xl mx-auto space-y-12 shadow-[0_50px_100px_rgba(0,0,0,0.7)] relative overflow-hidden">
                    <CheckCircle2 className="absolute -top-10 -right-10 text-emerald-500 opacity-5" size={400} />
                    <div className="space-y-4 relative z-10">
                       <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter flex items-center justify-center gap-6"><ShieldCheck className="text-emerald-500" size={48} /> Oracle Protocol v9.5</h3>
                       <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] italic">Vetting and Simulation Sequence Node 08</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-y border-white/5 py-10 relative z-10">
                       <SummaryNode label="Share Projetado" val={`${projections.marketShare.toFixed(1)}%`} />
                       <SummaryNode label="EBITDA P{safeRound+1}" val={`$ ${projections.ebitda.toLocaleString()}`} />
                       <SummaryNode label="Insolvency Risk" val={`${projections.health.insolvency_risk.toFixed(0)}%`} />
                       <SummaryNode label="Oracle Rating" val={projections.health.rating} />
                    </div>

                    <button 
                      onClick={async () => { 
                         if (isBlocked) { alert("SISTEMA BLOQUEADO: Seu rating C impede novas tomadas de crédito."); return; }
                         setIsSaving(true); 
                         await saveDecisions(teamId, champId!, safeRound, decisions); 
                         setIsSaving(false); 
                         alert("PROTOCOLADO COM SUCESSO."); 
                      }} 
                      disabled={isSaving || isBlocked}
                      className={`w-full py-8 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 relative z-10 ${isBlocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-white hover:text-orange-600'}`}
                    >
                       {isSaving ? <Loader2 className="animate-spin mx-auto" /> : isBlocked ? "Crédito Bloqueado" : "Transmitir Ordem Industrial"}
                    </button>
                 </div>
              </div>
            )}

            <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center px-6">
               <button onClick={() => setActiveStep(s => Math.max(0, s-1))} className="px-8 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all flex items-center gap-3">
                  <ChevronLeft size={18} /> Voltar Protocolo
               </button>
               <button onClick={() => setActiveStep(s => Math.min(5, s+1))} className="px-12 py-5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-orange-600 hover:text-white transition-all flex items-center gap-4">
                  Avançar Orquestração <ChevronRight size={18} />
               </button>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const DecInput = ({ label, val, onChange, icon }: any) => (
  <div className="space-y-4 flex-1 group">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 text-slate-500 group-focus-within:text-orange-500 transition-colors">{icon}</div>
        <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest group-focus-within:text-slate-300 transition-colors">{label}</label>
     </div>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 font-mono font-bold text-white text-xl outline-none focus:border-orange-500 shadow-inner transition-all" />
  </div>
);

const DecInputCompact = ({ label, val, onChange }: any) => (
  <div className="space-y-1.5">
     <label className="text-[9px] font-black text-slate-600 uppercase italic leading-none">{label}</label>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-4 font-mono font-bold text-white text-sm outline-none focus:border-orange-500 transition-all shadow-inner" />
  </div>
);

const OracleData = ({ label, val, color }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 group">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">{label}</span>
     <span className={`text-sm font-black italic font-mono ${color || 'text-orange-500'}`}>{val}</span>
  </div>
);

const SummaryNode = ({ label, val }: any) => (
  <div className="space-y-2 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 group hover:bg-white/10 transition-all">
     <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-orange-500 transition-colors">{label}</span>
     <span className="text-2xl font-black italic text-white font-mono tracking-tighter">{val}</span>
  </div>
);

export default DecisionForm;
