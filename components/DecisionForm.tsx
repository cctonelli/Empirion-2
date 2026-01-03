
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
import { DecisionData, Branch, ModalityType, RecoveryMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

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
    const price = i === 8 ? 344 : i === 9 ? 399 : 372;
    regions[i] = { price: price, term: 1, marketing: 3 };
  }
  return {
    regions,
    hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 2, others: 0, sales_staff_count: 50 },
    production: { 
      purchaseMPA: 30000, purchaseMPB: 20000, paymentType: 1, activityLevel: 100, extraProduction: 0, 
      rd_investment: 0, strategy: 'push_mrp', automation_level: 0, batch_size: 1000 
    },
    finance: { 
      loanRequest: 1090000, loanType: 2, application: 0, termSalesInterest: 2.0, 
      buyMachines: { alfa: 0, beta: 0, gama: 0 }, sellMachines: { alfa: 0, beta: 0, gama: 0 } 
    },
    legal: {
      recovery_mode: 'none'
    }
  };
};

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round?: number; branch?: Branch; modality?: ModalityType; userName?: string }> = ({ 
  teamId = 'team-alpha', champId = 'c1', round = 1, branch = 'industrial', modality = 'standard', userName = 'Operator'
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [decisions, setDecisions] = useState<DecisionData>(() => createInitialDecisions(9));
  const [isSaving, setIsSaving] = useState(false);
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    const trialFlag = localStorage.getItem('is_trial_session') === 'true';
    setIsTrial(trialFlag);
  }, []);

  const projections = useMemo(() => 
    calculateProjections(decisions, branch as Branch, { modalityType: modality } as any), 
  [decisions, branch, modality]);

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

  const handleNext = () => setActiveStep(prev => Math.min(STEPS.length - 1, prev + 1));
  const handleBack = () => setActiveStep(prev => Math.max(0, prev - 1));

  // Fix: Extracting Step Icon component to a capitalized variable to satisfy JSX requirements
  const StepIcon = STEPS[activeStep].icon;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      
      {/* STEPPER HORIZONTAL SUPERIOR */}
      <header className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
           {STEPS.map((s, idx) => (
             <div key={s.id} className="flex items-center">
                <button 
                  onClick={() => setActiveStep(idx)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${activeStep === idx ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${activeStep === idx ? 'bg-white text-orange-600' : 'bg-slate-800'}`}>
                      {activeStep > idx ? <CheckCircle2 size={16} /> : idx + 1}
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && <div className="w-8 h-px bg-white/5 mx-2 hidden lg:block" />}
             </div>
           ))}
        </div>
        <div className="hidden xl:flex items-center gap-6 pl-8 border-l border-white/5 ml-8">
           <div className="text-right">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">LUCRO PROJETADO</span>
              <span className={`text-lg font-black font-mono italic ${projections.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                $ {projections.netProfit.toLocaleString()}
              </span>
           </div>
        </div>
      </header>

      <main className="bg-slate-950 p-10 md:p-16 rounded-[4.5rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={STEPS[activeStep].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[500px] flex flex-col"
          >
            <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-10">
               <div>
                  <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter flex items-center gap-6">
                    {/* Fix: Using the capitalized variable for the JSX component */}
                    <div className="p-4 bg-white/5 rounded-3xl text-orange-500"><StepIcon size={32} /></div>
                    {STEPS[activeStep].label}
                  </h2>
                  <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-3 italic">Protocolo Oracle v6.0 • Transmissão Período 0{round}</p>
               </div>
               {activeStep === 0 && (
                 <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-3 text-blue-400">
                    <Info size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Preços médios históricos sugeridos.</span>
                 </div>
               )}
            </div>

            <div className="flex-1">
              {/* PASSO 1: MARKETING & REGIÕES */}
              {activeStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Object.entries(decisions.regions).map(([id, data]: [string, any]) => (
                    <div key={id} className="p-10 bg-white/[0.03] border border-white/10 rounded-[3rem] space-y-10 group hover:bg-white/[0.06] transition-all hover:-translate-y-1">
                       <div className="flex items-center justify-between border-b border-white/5 pb-6">
                          <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">Região {id}</h4>
                          <div className="p-3 bg-white/5 rounded-xl text-orange-500"><MapPin size={20} className="group-hover:animate-bounce" /></div>
                       </div>
                       <div className="space-y-8">
                          <DecInput label="Preço Unitário ($)" val={data.price} onChange={v => updateDecision(`regions.${id}.price`, v)} />
                          <DecInput label="Marketing Regional (0-9)" val={data.marketing} min={0} max={9} onChange={v => updateDecision(`regions.${id}.marketing`, v)} />
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prazo de Venda</label>
                             <select value={data.term} onChange={e => updateDecision(`regions.${id}.term`, Number(e.target.value))} className="w-full bg-slate-900 text-white p-5 rounded-2xl border border-white/10 text-xs font-bold focus:border-orange-500 outline-none">
                                <option value={0}>0 - Pagamento À Vista</option>
                                <option value={1}>1 - Prazo Médio (Padrão)</option>
                                <option value={2}>2 - Parcelamento Estendido</option>
                             </select>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PASSO 2: RECURSOS HUMANOS */}
              {activeStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-10 shadow-inner">
                      <h4 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 italic"><UserPlus size={24} /> Recrutamento e Vendas</h4>
                      <div className="grid grid-cols-2 gap-8">
                        <DecInput label="Contratações" val={decisions.hr.hired} onChange={v => updateDecision('hr.hired', v)} />
                        <DecInput label="Desligamentos" val={decisions.hr.fired} onChange={v => updateDecision('hr.fired', v)} />
                      </div>
                      <DecInput label="Equipe de Vendedores (Units)" val={decisions.hr.sales_staff_count} onChange={v => updateDecision('hr.sales_staff_count', v)} />
                   </div>
                   <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-10">
                      <h4 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 italic"><Sparkles size={24} /> Benefícios e Retenção</h4>
                      <DecInput label="Salário Nominal ($)" val={decisions.hr.salary} onChange={v => updateDecision('hr.salary', v)} />
                      <div className="grid grid-cols-2 gap-8">
                        <DecInput label="Treinamento (%)" val={decisions.hr.trainingPercent} onChange={v => updateDecision('hr.trainingPercent', v)} />
                        <DecInput label="PLR (%)" val={decisions.hr.participationPercent} onChange={v => updateDecision('hr.participationPercent', v)} />
                      </div>
                   </div>
                </div>
              )}

              {/* PASSO 3: PRODUÇÃO */}
              {activeStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-10">
                      <h4 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 italic"><Boxes size={24} /> Suprimentos MP-A / MP-B</h4>
                      <div className="grid grid-cols-2 gap-8">
                        <DecInput label="Qtde MP-A" val={decisions.production.purchaseMPA} onChange={v => updateDecision('production.purchaseMPA', v)} />
                        <DecInput label="Qtde MP-B" val={decisions.production.purchaseMPB} onChange={v => updateDecision('production.purchaseMPB', v)} />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Condição de Pagamento (M-P)</label>
                         <select value={decisions.production.paymentType} onChange={e => updateDecision('production.paymentType', Number(e.target.value))} className="w-full bg-slate-900 text-white p-5 rounded-2xl border border-white/10 text-xs font-bold focus:border-orange-500 outline-none">
                            <option value={0}>À Vista (100% no Período)</option>
                            <option value={1}>30/60/90 Dias (Standard)</option>
                            <option value={2}>Linha de Longo Prazo</option>
                         </select>
                      </div>
                   </div>
                   <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-10">
                      <h4 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 italic"><Cpu size={24} /> Engenharia e OEE</h4>
                      <DecInput label="Nível Atividade (%)" val={decisions.production.activityLevel} onChange={v => updateDecision('production.activityLevel', v)} />
                      <DecInput label="Adicional de Produção" val={decisions.production.extraProduction || 0} onChange={v => updateDecision('production.extraProduction', v)} />
                      <DecInput label="P&D (Inovação) ($)" val={decisions.production.rd_investment} onChange={v => updateDecision('production.rd_investment', v)} />
                   </div>
                </div>
              )}

              {/* PASSO 4: FINANÇAS & CAPEX */}
              {activeStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-10">
                      <h4 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 italic"><DollarSign size={24} /> Fluxo de Caixa</h4>
                      <DecInput label="Solicitar Empréstimo ($)" val={decisions.finance.loanRequest} onChange={v => updateDecision('finance.loanRequest', v)} />
                      <DecInput label="Aplicações Financeiras ($)" val={decisions.finance.application || 0} onChange={v => updateDecision('finance.application', v)} />
                      <DecInput label="Juros Venda Prazo (%)" val={decisions.finance.termSalesInterest || 2.0} onChange={v => updateDecision('finance.termSalesInterest', v)} />
                   </div>
                   <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[4rem] space-y-10">
                      <h4 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 italic"><Zap size={24} /> CapEx: Expansão Fabril</h4>
                      <div className="grid grid-cols-3 gap-6">
                        <DecInput label="Máq. Alfa" val={decisions.finance.buyMachines.alfa} onChange={v => updateDecision('finance.buyMachines.alfa', v)} />
                        <DecInput label="Máq. Beta" val={decisions.finance.buyMachines.beta} onChange={v => updateDecision('finance.buyMachines.beta', v)} />
                        <DecInput label="Máq. Gama" val={decisions.finance.buyMachines.gama} onChange={v => updateDecision('finance.buyMachines.gama', v)} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">
                        Nota: Máquinas Alfa (Versatilidade), Beta (Eficiência), Gama (Alta Escala).
                      </p>
                   </div>
                </div>
              )}

              {/* PASSO 5: PROTOCOLO JURÍDICO (NOVO) */}
              {activeStep === 4 && (
                <div className="max-w-4xl mx-auto space-y-12">
                   <div className="text-center space-y-4 mb-16">
                      <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Status Legal da Unidade</h3>
                      <p className="text-slate-400 font-medium italic">Selecione o regime jurídico para este período. Decisões de recuperação impactam diretamente seu TSR e Rating de Crédito.</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <RecoveryOption 
                        mode="none" 
                        active={decisions.legal?.recovery_mode === 'none'} 
                        onClick={() => updateDecision('legal.recovery_mode', 'none')} 
                        label="Fluxo Normal"
                        desc="Operação padrão sem intervenção judicial."
                        icon={<ShieldCheck size={32} />}
                      />
                      <RecoveryOption 
                        mode="extrajudicial" 
                        active={decisions.legal?.recovery_mode === 'extrajudicial'} 
                        onClick={() => updateDecision('legal.recovery_mode', 'extrajudicial')} 
                        label="Extrajudicial"
                        desc="Negociação direta com credores. Foco em repactuação amigável."
                        icon={<ListChecks size={32} />}
                      />
                      <RecoveryOption 
                        mode="judicial" 
                        active={decisions.legal?.recovery_mode === 'judicial'} 
                        onClick={() => updateDecision('legal.recovery_mode', 'judicial')} 
                        label="Judicial (RJ)"
                        desc="Proteção legal contra execuções. Restrição severa de CapEx e crédito."
                        icon={<Gavel size={32} />}
                        critical
                      />
                   </div>

                   {decisions.legal?.recovery_mode === 'judicial' && (
                     <div className="p-8 bg-rose-600/10 border border-rose-500/20 rounded-[2.5rem] flex items-center gap-6 animate-in zoom-in-95 duration-500">
                        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg"><AlertCircle size={28} /></div>
                        <div>
                           <h5 className="text-rose-500 font-black uppercase text-sm italic">Alerta de Protocolo Crítico</h5>
                           <p className="text-xs text-rose-400 font-bold opacity-80 leading-relaxed uppercase mt-1">Ao entrar em RJ, sua empresa terá o TSR reduzido e será proibida de realizar grandes investimentos em máquinas neste ciclo.</p>
                        </div>
                     </div>
                   )}
                </div>
              )}

              {/* PASSO 6: REVISÃO & SUBMISSÃO */}
              {activeStep === 5 && (
                <div className="space-y-12">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-2 space-y-10">
                         <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-12 space-y-10">
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Sumário Executivo P{round}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                               <SummaryNode label="EBITDA Projetado" val={`$ ${projections.netProfit.toLocaleString()}`} color={projections.netProfit > 0 ? 'text-emerald-400' : 'text-rose-400'} />
                               <SummaryNode label="OEE Fabril" val={`${projections.oee.toFixed(1)}%`} />
                               <SummaryNode label="Status Jurídico" val={decisions.legal?.recovery_mode?.toUpperCase() || 'NORMAL'} color="text-orange-500" />
                               <SummaryNode label="Equipe Vendas" val={decisions.hr.sales_staff_count} />
                               {/* Fix: Ensuring numeric calculation for price average to satisfy arithmetic operation requirements */}
                               <SummaryNode label="Preço Médio" val={`$ ${(Object.values(decisions.regions as Record<string, any>).reduce((a: number, b: any) => a + (Number(b.price) || 0), 0) / 9).toFixed(2)}`} />
                               <SummaryNode label="Market Share Est." val={`${projections.marketShare.toFixed(1)}%`} color="text-blue-400" />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                            <Sparkles className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform" size={150} />
                            <h4 className="text-xl font-black uppercase italic mb-6">Selo de Transmissão</h4>
                            <p className="text-xs font-bold text-blue-100 leading-relaxed uppercase opacity-80 mb-10 italic">"Ao transmitir estes comandos, o Oráculo Empirion processará sua estratégia contra todos os competidores simultaneamente. O selo é irrevogável."</p>
                            
                            <button 
                              onClick={async () => { 
                                setIsSaving(true); 
                                try { 
                                  await saveDecisions(teamId, champId!, round, decisions, isTrial); 
                                  alert("PROTOCOLO SELADO: Sua visão estratégica foi transmitida."); 
                                } catch(e:any){ 
                                  alert(e.message); 
                                } finally { 
                                  setIsSaving(false); 
                                } 
                              }} 
                              className="w-full py-6 bg-white text-blue-900 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                               {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Selar Ciclo 0{round}</>}
                            </button>
                         </div>
                         <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 flex items-center gap-4 opacity-40">
                            <ShieldCheck size={24} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Audit Node 08 Secure</span>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* BOTÕES DE NAVEGAÇÃO WIZARD */}
            <footer className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center">
               <button 
                 onClick={handleBack} 
                 disabled={activeStep === 0}
                 className={`flex items-center gap-4 px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeStep === 0 ? 'opacity-0' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
               >
                  <ChevronLeft size={16} /> Voltar Protocolo
               </button>

               {activeStep < STEPS.length - 1 && (
                 <button 
                   onClick={handleNext}
                   className="flex items-center gap-6 px-16 py-6 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-white hover:text-orange-600 transition-all active:scale-95 group"
                 >
                    Avançar Etapa <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </button>
               )}
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const DecInput = ({ label, val, onChange, min, max }: any) => (
  <div className="space-y-4">
     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{label}</label>
     <input 
        type="number" 
        value={val} 
        min={min} 
        max={max}
        onChange={e => onChange(Number(e.target.value))} 
        className="w-full bg-slate-950 border border-white/10 rounded-3xl p-6 font-mono font-bold text-white text-2xl outline-none focus:border-orange-500 focus:bg-white/5 shadow-inner transition-all" 
     />
  </div>
);

const RecoveryOption = ({ mode, active, onClick, label, desc, icon, critical }: any) => (
  <button 
    onClick={onClick} 
    className={`p-10 rounded-[3.5rem] border-2 text-left transition-all group flex flex-col justify-between h-full ${
      active 
        ? (critical ? 'bg-rose-600/10 border-rose-500 shadow-2xl scale-[1.05]' : 'bg-orange-600/10 border-orange-500 shadow-2xl scale-[1.05]') 
        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
    }`}
  >
     <div className={`p-5 rounded-2xl w-fit mb-8 transition-all ${active ? (critical ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white') : 'bg-slate-800 text-slate-500'}`}>
        {icon}
     </div>
     <div className="space-y-4">
        <h4 className={`text-2xl font-black uppercase italic ${active ? 'text-white' : 'text-slate-400'}`}>{label}</h4>
        <p className={`text-xs font-medium leading-relaxed ${active ? 'text-slate-200' : 'text-slate-600'}`}>{desc}</p>
     </div>
     {active && <div className={`mt-8 flex items-center gap-2 font-black text-[9px] uppercase tracking-widest ${critical ? 'text-rose-500' : 'text-orange-500'}`}><CheckCircle2 size={12}/> Selecionado</div>}
  </button>
);

const SummaryNode = ({ label, val, color }: any) => (
  <div className="space-y-2">
     <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     <span className={`text-xl font-black italic tracking-tighter ${color || 'text-white'}`}>{val}</span>
  </div>
);

export default DecisionForm;
