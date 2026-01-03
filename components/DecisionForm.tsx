
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Save, Factory, Users2, ChevronRight, ChevronLeft,
  Loader2, Megaphone, Zap, Cpu, Boxes, Info, Sparkles, DollarSign,
  TrendingUp, Activity, SlidersHorizontal, MapPin, Package,
  ShoppingCart, Briefcase, PlusCircle, MinusCircle, UserPlus,
  ArrowRight, ShieldCheck, Gavel, CheckCircle2, AlertCircle, Eye,
  LayoutGrid, ListChecks, FileText
} from 'lucide-react';
import { saveDecisions } from '../services/supabase';
import { calculateProjections } from '../services/simulation';
import { DecisionData, Branch, DiscreteTerm, RecoveryMode } from '../types';
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

const createInitialDecisions = (regionsCount: number): DecisionData => {
  const regions: Record<number, any> = {};
  for (let i = 1; i <= regionsCount; i++) {
    regions[i] = { price: 372, term: 0, marketing: 3 };
  }
  return {
    regions,
    hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, sales_staff_count: 50 },
    production: { purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 0, activityLevel: 100, rd_investment: 0 },
    finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
    legal: { recovery_mode: 'none' }
  };
};

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round?: number; branch?: Branch; userName?: string }> = ({ 
  teamId = 'team-alpha', champId = 'c1', round = 1, branch = 'industrial', userName = 'Operator'
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [decisions, setDecisions] = useState<DecisionData>(() => createInitialDecisions(9));
  const [isSaving, setIsSaving] = useState(false);

  const projections = useMemo(() => 
    calculateProjections(decisions, branch as Branch, { inflationRate: 0.01, demandMultiplier: 1.0 } as any, DEFAULT_MACRO), 
  [decisions, branch]);

  const updateDecision = (path: string, value: any) => {
    const newDecisions = JSON.parse(JSON.stringify(decisions));
    const keys = path.split('.');
    let current: any = newDecisions;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setDecisions(newDecisions);
  };

  const StepIcon = STEPS[activeStep].icon;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      <header className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
           {STEPS.map((s, idx) => (
             <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${activeStep === idx ? 'bg-orange-600 text-white' : 'text-slate-500'}`}>
                <span className="font-black text-xs">{idx + 1}</span>
                <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{s.label}</span>
             </button>
           ))}
        </div>
        <div className="flex items-center gap-8 pr-6">
           <div className="text-right">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">CAIXA PROJETADO P{round+1}</span>
              <span className={`text-lg font-black font-mono italic ${projections.cashFlowNext > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                $ {projections.cashFlowNext.toLocaleString()}
              </span>
           </div>
        </div>
      </header>

      <main className="bg-slate-950 p-16 rounded-[4.5rem] border border-white/5 shadow-2xl relative">
        <AnimatePresence mode="wait">
          <motion.div key={STEPS[activeStep].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-10">
               <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter flex items-center gap-6">
                 <div className="p-4 bg-white/5 rounded-3xl text-orange-500"><StepIcon size={32} /></div>
                 {STEPS[activeStep].label}
               </h2>
            </div>

            {/* PASSO 1: COMERCIAL */}
            {activeStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {Object.entries(decisions.regions).map(([id, data]: [string, any]) => (
                  <div key={id} className="p-10 bg-white/[0.03] border border-white/10 rounded-[3rem] space-y-8">
                     <h4 className="text-2xl font-black text-white uppercase italic">Região {id}</h4>
                     <DecInput label="Preço Unitário" val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                     <DecInput label="Marketing Regional (0-9)" val={data.marketing} onChange={v => updateDecision(`regions.${id}.marketing`, v)} />
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prazo de Venda (0-1-2)</label>
                        <select value={data.term} onChange={e => updateDecision(`regions.${id}.term`, Number(e.target.value))} className="w-full bg-slate-900 text-white p-5 rounded-2xl border border-white/10 font-bold text-xs">
                           <option value={0}>0 - À Vista (Recebe no próximo período)</option>
                           <option value={1}>1 - Diferido (Recebe no período +2)</option>
                           <option value={2}>2 - Parcelado (50% no próximo, 50% no +2)</option>
                        </select>
                     </div>
                  </div>
                ))}
              </div>
            )}

            {/* PASSO 3: PRODUÇÃO */}
            {activeStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-10">
                    <h4 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 italic"><Boxes size={24} /> Suprimentos MP</h4>
                    <div className="grid grid-cols-2 gap-8">
                      <DecInput label="Qtde MP-A" val={decisions.production.purchaseMPA} onChange={v => updateDecision('production.purchaseMPA', v)} />
                      <DecInput label="Qtde MP-B" val={decisions.production.purchaseMPB} onChange={v => updateDecision('production.purchaseMPB', v)} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pagamento Fornecedores (0-1-2)</label>
                       <select value={decisions.production.paymentType} onChange={e => updateDecision('production.paymentType', Number(e.target.value))} className="w-full bg-slate-900 text-white p-5 rounded-2xl border border-white/10 font-bold text-xs">
                          <option value={0}>0 - À Vista (Paga no próximo período)</option>
                          <option value={1}>1 - Diferido (Paga no período +2)</option>
                          <option value={2}>2 - Parcelado (50% no próximo, 50% no +2)</option>
                       </select>
                    </div>
                 </div>
                 <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-10">
                    <h4 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 italic"><Cpu size={24} /> Eficiência Fabril</h4>
                    <DecInput label="Nível Atividade (%)" val={decisions.production.activityLevel} onChange={v => updateDecision('production.activityLevel', v)} />
                    <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                       <Info size={20} className="text-blue-400" />
                       <p className="text-[10px] font-bold text-blue-300 uppercase leading-relaxed">Produção acima de 100% gera custo de hora-extra severo.</p>
                    </div>
                 </div>
              </div>
            )}

            {/* DEMAIS PASSOS (Simplificado para o build) */}
            {activeStep === 5 && (
              <div className="text-center space-y-12">
                 <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10 max-w-2xl mx-auto space-y-8">
                    <h3 className="text-4xl font-black uppercase italic text-white tracking-tighter">Confirmar Transmissão</h3>
                    <div className="grid grid-cols-2 gap-8 text-left">
                       <SummaryNode label="EBITDA" val={`$ ${projections.ebitda.toLocaleString()}`} />
                       <SummaryNode label="Market Share" val={`${projections.marketShare.toFixed(1)}%`} />
                       <SummaryNode label="Caixa Final" val={`$ ${projections.cashFlowNext.toLocaleString()}`} />
                       <SummaryNode label="A Receber T+2" val={`$ ${projections.receivables.toLocaleString()}`} />
                    </div>
                    <button onClick={async () => { setIsSaving(true); await saveDecisions(teamId, champId!, round, decisions); setIsSaving(false); alert("SELO REALIZADO."); }} className="w-full py-8 bg-orange-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-white hover:text-orange-600 transition-all">
                       {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Transmitir Decisões de Período"}
                    </button>
                 </div>
              </div>
            )}

            <footer className="mt-20 pt-10 border-t border-white/5 flex justify-between">
               <button onClick={() => setActiveStep(s => Math.max(0, s-1))} className="px-10 py-5 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Voltar</button>
               <button onClick={() => setActiveStep(s => Math.min(5, s+1))} className="px-16 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-orange-600 hover:text-white transition-all">Próximo Protocolo</button>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const DecInput = ({ label, val, onChange }: any) => (
  <div className="space-y-4">
     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{label}</label>
     <input type="number" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 font-mono font-bold text-white text-xl outline-none focus:border-orange-500 transition-all shadow-inner" />
  </div>
);

const SummaryNode = ({ label, val }: any) => (
  <div className="space-y-1">
     <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     <span className="text-xl font-black italic text-white">{val}</span>
  </div>
);

export default DecisionForm;
