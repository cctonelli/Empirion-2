import React, { useState, useMemo } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, Gavel, FileText,
  MapPin, Boxes, Cpu, Info, Save, ChevronRight, ChevronLeft, ShieldAlert,
  Lock, Unlock, AlertTriangle, Scale, UserPlus, UserMinus, GraduationCap, 
  Coins, TrendingUp, CheckCircle2
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
    <div className="max-w-[1600px] mx-auto space-y-3 pb-32 animate-in fade-in duration-700">
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
           {projections.suggestRecovery && (
             <div className="flex items-center gap-2 bg-rose-600/20 text-rose-500 px-3 py-1 rounded-lg border border-rose-500/20 animate-pulse">
                <ShieldAlert size={10} /> <span className="text-[7px] font-black uppercase">Sugestão: Protocolo RJ</span>
             </div>
           )}
           <div className="text-right">
              <span className="block text-[7px] font-black text-slate-500 uppercase">CAIXA PROJETADO P{round+1}</span>
              <span className={`text-sm font-black font-mono italic ${projections.cashFlowNext > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                $ {projections.cashFlowNext.toLocaleString()}
              </span>
           </div>
        </div>
      </header>

      <main className="bg-slate-950 p-4 md:p-8 rounded-[2rem] border border-white/5 relative shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div key={STEPS[activeStep].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            
            {/* 1. COMERCIAL */}
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
                     <div className="space-y-0.5">
                        <label className="text-[6px] font-black text-slate-600 uppercase">Prazo de Venda</label>
                        <select value={data.term} onChange={e => updateDecision(`regions.${id}.term`, Number(e.target.value))} className="w-full bg-slate-900 text-white py-1 px-1.5 rounded border border-white/5 font-bold text-[8px] outline-none cursor-pointer">
                           <option value={0}>0 - À Vista (T+1)</option>
                           <option value={1}>1 - Diferido (T+2)</option>
                           <option value={2}>2 - Parcelado (50/50)</option>
                        </select>
                     </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. RECURSOS HUMANOS */}
            {activeStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                 <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <h4 className="text-sm font-black uppercase text-blue-400 flex items-center gap-2 italic border-b border-white/5 pb-3"><UserPlus size={16} /> Movimentação de Mão de Obra</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <DecInput label="Admitir" val={decisions.hr.hired} onChange={v => updateDecision('hr.hired', v)} icon={<UserPlus size={14} className="text-emerald-500"/>} />
                       <DecInput label="Demitir" val={decisions.hr.fired} onChange={v => updateDecision('hr.fired', v)} icon={<UserMinus size={14} className="text-rose-500"/>} />
                    </div>
                    <DecInput label="Salário Nominal ($)" val={decisions.hr.salary} onChange={v => updateDecision('hr.salary', v)} />
                 </div>
                 <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <h4 className="text-sm font-black uppercase text-orange-500 flex items-center gap-2 italic border-b border-white/5 pb-3"><GraduationCap size={16} /> Investimentos & Benefícios</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <DecInput label="Treinamento (%)" val={decisions.hr.trainingPercent} onChange={v => updateDecision('hr.trainingPercent', v)} />
                       <DecInput label="Participação (%)" val={decisions.hr.participationPercent} onChange={v => updateDecision('hr.participationPercent', v)} />
                    </div>
                    <DecInput label="Equipe Comercial (Qtde)" val={decisions.hr.sales_staff_count} onChange={v => updateDecision('hr.sales_staff_count', v)} />
                 </div>
              </div>
            )}

            {/* 3. PRODUÇÃO & FORNECEDORES (EXPANDIDO) */}
            {activeStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                 <div className="lg:col-span-8 space-y-6">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
                       <h4 className="text-sm font-black uppercase text-blue-400 flex items-center gap-2 italic border-b border-white/5 pb-4"><Boxes size={18} /> Ordem de Compra & Suprimentos</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <DecInput label="Compra MP-A (Unid)" val={decisions.production.purchaseMPA} onChange={v => updateDecision('production.purchaseMPA', v)} />
                          <DecInput label="Compra MP-B (Unid)" val={decisions.production.purchaseMPB} onChange={v => updateDecision('production.purchaseMPB', v)} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Protocolo de Pagamento Insumos</label>
                          <select value={decisions.production.paymentType} onChange={e => updateDecision('production.paymentType', Number(e.target.value))} className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl border border-white/10 font-bold text-sm outline-none focus:border-blue-500">
                             <option value={0}>0 - À Vista (100%) - T+1</option>
                             <option value={1}>1 - Diferido (100%) - T+2</option>
                             <option value={2}>2 - Parcelado (50/50)</option>
                          </select>
                       </div>
                    </div>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                       <h4 className="text-sm font-black uppercase text-orange-500 flex items-center gap-2 italic border-b border-white/5 pb-4"><Cpu size={18} /> Escala de Atividade Industrial</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <DecInput label="Nível Atividade (%)" val={decisions.production.activityLevel} onChange={v => updateDecision('production.activityLevel', v)} />
                          <DecInput label="Investimento P&D ($)" val={decisions.production.rd_investment} onChange={v => updateDecision('production.rd_investment', v)} />
                       </div>
                    </div>
                 </div>

                 <aside className="lg:col-span-4 space-y-6">
                    <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[3rem] space-y-6 shadow-xl">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg text-white"><TrendingUp size={16}/></div>
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Painel de Cotações P0{round}</h4>
                       </div>
                       <div className="space-y-4">
                          <PriceQuote label="MP-A (Base Oracle)" val="$ 20,20" trend="+2%" />
                          <PriceQuote label="MP-B (Base Oracle)" val="$ 40,40" trend="+2%" />
                          <PriceQuote label="Distribuição Unit." val="$ 50,50" trend="OK" />
                          <PriceQuote label="Juros Fornecedor" val="2.0% AM" trend="FIXO" />
                       </div>
                       <div className="pt-6 border-t border-white/10">
                          <p className="text-[9px] text-blue-300 font-bold uppercase leading-relaxed italic">
                             *Cotação atualizada pelo motor Oracle. Reajustes automáticos aplicados no P0{round+1}.
                          </p>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-[2.5rem] flex items-center gap-4">
                       <Info size={20} className="text-orange-500" />
                       <p className="text-[9px] text-slate-400 font-medium leading-tight uppercase tracking-tighter">OEE industrial base: 100% = 30k unid. Atividade acima de 100% gera custo marginal de 1.5x.</p>
                    </div>
                 </aside>
              </div>
            )}

            {/* 4. FINANCEIRO */}
            {activeStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                 <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <h4 className="text-sm font-black uppercase text-blue-400 flex items-center gap-2 italic border-b border-white/5 pb-3"><DollarSign size={16} /> Fluxo de Caixa</h4>
                    <DecInput label="Solicitar Empréstimo ($)" val={decisions.finance.loanRequest} onChange={v => updateDecision('finance.loanRequest', v)} />
                    <DecInput label="Aplicação Financeira ($)" val={decisions.finance.application} onChange={v => updateDecision('finance.application', v)} />
                 </div>
                 <div className={`p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6 relative ${isInRJ ? 'opacity-50 grayscale' : ''}`}>
                    {isInRJ && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-3xl">
                       <Lock size={24} className="text-rose-500 mb-2" />
                       <span className="text-[8px] font-black uppercase text-white">Bloqueado em RJ</span>
                    </div>}
                    <h4 className="text-sm font-black uppercase text-emerald-400 flex items-center gap-2 italic border-b border-white/5 pb-3"><Cpu size={16} /> Investimentos em CapEx</h4>
                    <div className="grid grid-cols-3 gap-3">
                       <DecInputCompact label="MÁQ. ALFA" val={decisions.finance.buyMachines.alfa} onChange={v => !isInRJ && updateDecision('finance.buyMachines.alfa', v)} />
                       <DecInputCompact label="MÁQ. BETA" val={decisions.finance.buyMachines.beta} onChange={v => !isInRJ && updateDecision('finance.buyMachines.beta', v)} />
                       <DecInputCompact label="MÁQ. GAMA" val={decisions.finance.buyMachines.gama} onChange={v => !isInRJ && updateDecision('finance.buyMachines.gama', v)} />
                    </div>
                 </div>
              </div>
            )}

            {/* 5. JURÍDICO */}
            {activeStep === 4 && (
              <div className="max-w-3xl mx-auto space-y-8">
                 <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-orange-500 border border-white/5 shadow-xl"><Scale size={32} /></div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Protocolo Jurídico</h3>
                    <p className="text-slate-500 font-medium text-xs">Gestão de estabilidade e recuperação de unidade industrial.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <RecoveryCard active={decisions.legal.recovery_mode === 'none'} onClick={() => updateDecision('legal.recovery_mode', 'none')} title="Normal" icon={<FileText size={18}/>} color="blue" desc="Operação plena." />
                    <RecoveryCard active={decisions.legal.recovery_mode === 'extrajudicial'} onClick={() => updateDecision('legal.recovery_mode', 'extrajudicial')} title="REJ" icon={<AlertTriangle size={18}/>} color="amber" desc="Acordo Moderado." />
                    <RecoveryCard active={decisions.legal.recovery_mode === 'judicial'} onClick={() => updateDecision('legal.recovery_mode', 'judicial')} title="Rec. Judicial" icon={<ShieldAlert size={18}/>} color="rose" desc="Proteção Total." />
                 </div>
              </div>
            )}

            {/* 6. REVISÃO */}
            {activeStep === 5 && (
              <div className="text-center space-y-6 py-4">
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 max-w-xl mx-auto space-y-6 shadow-2xl">
                    <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter flex items-center justify-center gap-3"><CheckCircle2 className="text-emerald-500" /> Selo Oráculo Oracle</h3>
                    <div className="grid grid-cols-2 gap-3 text-left border-y border-white/5 py-6">
                       <SummaryNode label="Projeção Lucro" val={`$ ${projections.netProfit.toLocaleString()}`} />
                       <SummaryNode label="Market Share" val={`${projections.marketShare.toFixed(1)}%`} />
                       <SummaryNode label="Status Legal" val={decisions.legal.recovery_mode.toUpperCase()} />
                       <SummaryNode label="Nível Atividade" val={`${decisions.production.activityLevel}%`} />
                    </div>
                    <button onClick={async () => { setIsSaving(true); await saveDecisions(teamId, champId!, round, decisions); setIsSaving(false); alert("PROTOCOLADO COM SUCESSO."); }} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-white hover:text-orange-600 transition-all active:scale-95">
                       {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Transmitir Decisões de Período"}
                    </button>
                 </div>
              </div>
            )}

            <footer className="mt-6 pt-4 border-t border-white/5 flex justify-between">
               <button onClick={() => setActiveStep(s => Math.max(0, s-1))} className="px-5 py-2 text-slate-500 font-black uppercase text-[7px] tracking-widest hover:text-white transition-all">Voltar</button>
               <button onClick={() => setActiveStep(s => Math.min(5, s+1))} className="px-8 py-3 bg-white text-slate-950 rounded-full font-black text-[8px] uppercase tracking-[0.2em] shadow-lg hover:bg-orange-600 hover:text-white transition-all">Próximo Protocolo</button>
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
        <span className="text-[7px] font-black text-emerald-400 uppercase">{trend}</span>
     </div>
  </div>
);

const SummaryNode = ({ label, val }: any) => (
  <div className="space-y-0.5">
     <span className="block text-[7px] font-black text-slate-500 uppercase">{label}</span>
     <span className="text-sm font-black italic text-white leading-tight">{val}</span>
  </div>
);

const RecoveryCard = ({ active, onClick, title, icon, color, desc }: any) => (
  <button onClick={onClick} className={`p-4 rounded-2xl border-2 text-left transition-all ${active ? (color === 'rose' ? 'border-rose-600 bg-rose-600/10' : color === 'amber' ? 'border-amber-600 bg-amber-600/10' : 'border-blue-600 bg-blue-600/10') : 'bg-white/5 border-white/5 opacity-60'}`}>
     <div className={`p-2 rounded-lg w-fit mb-2 ${active ? 'bg-white text-slate-900 shadow-md' : 'bg-white/5 text-slate-500'}`}>{icon}</div>
     <h4 className="text-xs font-black text-white uppercase italic leading-none mb-1">{title}</h4>
     <p className="text-[8px] text-slate-400 font-medium leading-tight">{desc}</p>
  </button>
);

export default DecisionForm;
