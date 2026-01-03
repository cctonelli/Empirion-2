
import React, { useState, useMemo } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, FileText,
  MapPin, Boxes, Cpu, Info, Save, ChevronRight, ChevronLeft, ShieldAlert,
  Lock, Unlock, AlertTriangle, Scale
} from 'lucide-react';
import { saveDecisions } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, RecoveryMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_MACRO } from '../constants';

const STEPS = [
  { id: 'marketing', label: 'Comercial', icon: Megaphone },
  { id: 'hr', label: 'Recursos Humanos', icon: Users2 },
  { id: 'production', label: 'Produção & Fábrica', icon: Factory },
  { id: 'finance', label: 'Finanças & CapEx', icon: DollarSign },
  { id: 'legal', label: 'Protocolo Jurídico', icon: Gavel },
  { id: 'review', label: 'Revisão & Selo', icon: FileText },
];

const createInitialDecisions = (): DecisionData => ({
  regions: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, { price: 372, term: 0, marketing: 3 }])),
  hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
  production: { purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 0, activityLevel: 100, rd_investment: 0 },
  finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
  legal: { recovery_mode: 'none' }
} as any);

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round?: number; branch?: Branch; userName?: string }> = ({ 
  teamId = 'team-alpha', champId = 'c1', round = 1, branch = 'industrial'
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [decisions, setDecisions] = useState<DecisionData>(createInitialDecisions());
  const [isSaving, setIsSaving] = useState(false);

  const projections = useMemo(() => 
    calculateProjections(decisions, branch as Branch, { inflationRate: 0.01, demandMultiplier: 1.0 } as any, DEFAULT_MACRO), 
  [decisions, branch]);

  const updateDecision = (path: string, value: any) => {
    const newDecisions = JSON.parse(JSON.stringify(decisions));
    const keys = path.split('.');
    let current: any = newDecisions;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    setDecisions(newDecisions);
  };

  const isInRJ = decisions.legal.recovery_mode === 'judicial';

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-32 animate-in fade-in duration-700">
      <header className="bg-slate-900 border border-white/5 p-3 rounded-3xl shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-1">
           {STEPS.map((s, idx) => (
             <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${activeStep === idx ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                <span className="font-black text-[9px]">{idx + 1}</span>
                <span className="text-[8px] font-black uppercase tracking-widest hidden xl:block">{s.label}</span>
             </button>
           ))}
        </div>
        <div className="flex items-center gap-6 pr-4">
           {projections.suggestRecovery && (
             <div className="flex items-center gap-2 bg-rose-600/20 text-rose-500 px-3 py-1.5 rounded-lg border border-rose-500/20 animate-pulse">
                <ShieldAlert size={12} /> <span className="text-[8px] font-black uppercase">Sugestão: Protocolo RJ</span>
             </div>
           )}
           <div className="text-right">
              <span className="block text-[7px] font-black text-slate-500 uppercase">PROJEÇÃO CAIXA P{round+1}</span>
              <span className={`text-sm font-black font-mono italic ${projections.cashFlowNext > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                $ {projections.cashFlowNext.toLocaleString()}
              </span>
           </div>
        </div>
      </header>

      <main className="bg-slate-950 p-6 md:p-10 rounded-[3rem] border border-white/5 relative">
        <AnimatePresence mode="wait">
          <motion.div key={STEPS[activeStep].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            
            {activeStep === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(decisions.regions).map(([id, data]: [any, any]) => (
                  <div key={id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 group hover:border-orange-500/30 transition-all">
                     <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">Região {id}</h4>
                        <MapPin size={10} className="text-slate-600" />
                     </div>
                     <div className="grid grid-cols-1 gap-2">
                        <DecInputCompact label="Preço Unit." val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                        <DecInputCompact label="Marketing" val={data.marketing} onChange={v => updateDecision(`regions.${id}.marketing`, v)} />
                     </div>
                     <select value={data.term} onChange={e => updateDecision(`regions.${id}.term`, Number(e.target.value))} className="w-full bg-slate-900 text-white py-1.5 px-2 rounded-lg border border-white/5 font-bold text-[9px] outline-none cursor-pointer">
                        <option value={0}>0 - À Vista</option>
                        <option value={1}>1 - Diferido</option>
                        <option value={2}>2 - Parcelado</option>
                     </select>
                  </div>
                ))}
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6">
                    <h4 className="text-lg font-black uppercase text-blue-500 flex items-center gap-3 italic"><DollarSign size={18} /> Operações Financeiras</h4>
                    <DecInput label="Solicitar Empréstimo ($)" val={decisions.finance.loanRequest} onChange={v => updateDecision('finance.loanRequest', v)} />
                    <DecInput label="Aplicação Financeira ($)" val={decisions.finance.application} onChange={v => updateDecision('finance.application', v)} />
                 </div>
                 <div className={`p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 relative ${isInRJ ? 'opacity-50' : ''}`}>
                    {isInRJ && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-[2.5rem]">
                       <Lock size={32} className="text-rose-500 mb-2" />
                       <span className="text-[10px] font-black uppercase text-white">Bloqueado em RJ</span>
                    </div>}
                    <h4 className="text-lg font-black uppercase text-orange-500 flex items-center gap-3 italic"><Cpu size={18} /> Aquisição de CapEx</h4>
                    <div className="grid grid-cols-3 gap-4">
                       <DecInputCompact label="MÁQ. ALFA" val={decisions.finance.buyMachines.alfa} onChange={v => !isInRJ && updateDecision('finance.buyMachines.alfa', v)} />
                       <DecInputCompact label="MÁQ. BETA" val={decisions.finance.buyMachines.beta} onChange={v => !isInRJ && updateDecision('finance.buyMachines.beta', v)} />
                       <DecInputCompact label="MÁQ. GAMA" val={decisions.finance.buyMachines.gama} onChange={v => !isInRJ && updateDecision('finance.buyMachines.gama', v)} />
                    </div>
                 </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="max-w-3xl mx-auto space-y-10">
                 <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-orange-500 border border-white/5 shadow-xl"><Scale size={40} /></div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Protocolo Jurídico de Crise</h3>
                    <p className="text-slate-500 font-medium">Selecione o status legal da sua unidade para este ciclo. A escolha impacta custos e crédito.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RecoveryCard active={decisions.legal.recovery_mode === 'none'} onClick={() => updateDecision('legal.recovery_mode', 'none')} title="Operação Normal" icon={<CheckCircle2 size={24}/>} color="blue" desc="Sem restrições. Fluxo pleno." />
                    <RecoveryCard active={decisions.legal.recovery_mode === 'extrajudicial'} onClick={() => updateDecision('legal.recovery_mode', 'extrajudicial')} title="Rec. Extrajudicial" icon={<AlertTriangle size={24}/>} color="amber" desc="Acordo com credores. Redução leve de juros e custos fixos." />
                    <RecoveryCard active={decisions.legal.recovery_mode === 'judicial'} onClick={() => updateDecision('legal.recovery_mode', 'judicial')} title="Rec. Judicial (RJ)" icon={<ShieldAlert size={24}/>} color="rose" desc="Proteção extrema de ativos. Bloqueio de CapEx. Juros elevados." />
                 </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="text-center space-y-8 py-10">
                 <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 max-w-xl mx-auto space-y-8">
                    <div className="flex items-center justify-center gap-4">
                       <div className="p-3 bg-emerald-500 rounded-2xl text-slate-950 shadow-lg"><FileText size={24}/></div>
                       <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">Selo do Período</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left border-y border-white/5 py-8">
                       <SummaryNode label="Projeção Lucro" val={`$ ${projections.netProfit.toLocaleString()}`} />
                       <SummaryNode label="Market Share" val={`${projections.marketShare.toFixed(1)}%`} />
                       <SummaryNode label="Status Legal" val={decisions.legal.recovery_mode.toUpperCase()} />
                       <SummaryNode label="Nível Atividade" val={`${decisions.production.activityLevel}%`} />
                    </div>
                    <button onClick={async () => { setIsSaving(true); await saveDecisions(teamId, champId!, round, decisions); setIsSaving(false); alert("PROTOCOLADO COM SUCESSO."); }} className="w-full py-6 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-white hover:text-orange-600 transition-all">
                       {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Transmitir para Oráculo Oracle"}
                    </button>
                 </div>
              </div>
            )}

            <footer className="mt-8 pt-6 border-t border-white/5 flex justify-between">
               <button onClick={() => setActiveStep(s => Math.max(0, s-1))} className="px-6 py-3 text-slate-500 font-black uppercase text-[8px] tracking-widest hover:text-white">Voltar</button>
               <button onClick={() => setActiveStep(s => Math.min(5, s+1))} className="px-10 py-4 bg-white text-slate-950 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl">Próximo Passo</button>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const DecInput = ({ label, val, onChange }: any) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{label}</label>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 font-mono font-bold text-white text-base outline-none focus:border-orange-500 shadow-inner" />
  </div>
);

const DecInputCompact = ({ label, val, onChange }: any) => (
  <div className="space-y-0.5">
     <label className="text-[7px] font-black text-slate-600 uppercase italic leading-none">{label}</label>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/5 rounded-lg py-1.5 px-2 font-mono font-bold text-white text-xs outline-none focus:border-orange-500 shadow-inner" />
  </div>
);

const SummaryNode = ({ label, val }: any) => (
  <div className="space-y-1">
     <span className="block text-[7px] font-black text-slate-500 uppercase">{label}</span>
     <span className="text-base font-black italic text-white leading-none">{val}</span>
  </div>
);

const RecoveryCard = ({ active, onClick, title, icon, color, desc }: any) => (
  <button onClick={onClick} className={`p-6 rounded-[2rem] border-2 text-left transition-all group ${active ? (color === 'rose' ? 'border-rose-600 bg-rose-600/10' : color === 'amber' ? 'border-amber-600 bg-amber-600/10' : 'border-blue-600 bg-blue-600/10') : 'bg-white/5 border-white/5 opacity-60'}`}>
     <div className={`p-3 rounded-xl w-fit mb-4 ${active ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/5 text-slate-500'}`}>{icon}</div>
     <h4 className="text-lg font-black text-white uppercase italic leading-none mb-2">{title}</h4>
     <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{desc}</p>
  </button>
);

const CheckCircle2 = (props: any) => <FileText {...props} />;

export default DecisionForm;
