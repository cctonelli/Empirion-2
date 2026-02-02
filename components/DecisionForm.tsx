
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, Trash2, ShoppingCart, Info, Award,
  Zap, HelpCircle, MapPin, ChevronLeft, Wallet, 
  Percent, TrendingUp, BarChart3, LineChart, ShieldCheck,
  Scale, Users, ArrowUpRight, TrendingDown, ClipboardCheck,
  PlusCircle, MinusCircle, AlertCircle, RefreshCw,
  // Fix: Added missing imports from lucide-react to resolve "Cannot find name" errors
  Timer, Settings2, UserPlus, Rocket
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
import { calculateProjections, sanitize } from '../services/simulation';
import { DecisionData, Branch, Championship, ProjectionResult, EcosystemConfig, MachineModel, RegionConfig } from '../types';
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
            initialRegions[i] = { price: 0, term: 0, marketing: 1 };
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

  const replicateRegions = () => {
    const activeData = decisions.regions[activeRegion];
    const nextRegions = { ...decisions.regions };
    Object.keys(nextRegions).forEach(id => {
      nextRegions[Number(id)] = { ...activeData };
    });
    setDecisions(prev => ({ ...prev, regions: nextRegions }));
    alert("CLUSTER SINCRONIZADO: Decisão regional replicada em todos os nodos.");
  };

  // Preços ajustados conforme inflação/reajuste do tutor
  const getAdjustedMachinePrice = (model: MachineModel) => {
    if (!activeArena) return 0;
    const base = activeArena.market_indicators.machinery_values?.[model] || 500000;
    const adjustKey = `machine_${model === 'alfa' ? 'alpha' : model === 'beta' ? 'beta' : 'gamma'}_price_adjust`;
    const adjustRate = activeArena.round_rules?.[round]?.[adjustKey] ?? activeArena.market_indicators[adjustKey] ?? 0;
    return base * (1 + adjustRate / 100);
  };

  const handleTransmit = async () => {
    if (!teamId || !champId || isReadOnly) return;
    setIsSaving(true);
    try {
      const res = await saveDecisions(teamId, champId, round, decisions) as any;
      if (res.success) alert("PROTOCOLO SELADO: Suas decisões foram transmitidas ao motor Oracle.");
    } finally { setIsSaving(false); }
  };

  const InfoTag = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-2 cursor-help">
      <HelpCircle size={14} className="text-slate-500 hover:text-orange-500 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl text-[10px] font-medium leading-relaxed text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );

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
               
               {/* CARD 1: JURÍDICO */}
               {activeStep === 0 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-10 max-w-4xl mx-auto py-10">
                     <div className={`p-8 rounded-[3rem] border-4 shadow-2xl transition-all ${decisions.judicial_recovery ? 'bg-rose-600 border-rose-400 text-white animate-wow' : 'bg-slate-900 border-emerald-500 text-emerald-500'}`}>
                        <Gavel size={64} />
                     </div>
                     <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter flex items-center justify-center">Status de Solvência <InfoTag text="O Protocolo RJ protege ativos mas bloqueia CAPEX e eleva juros de curto prazo." /></h2>
                        <p className="text-slate-400 text-sm font-medium italic">"Defina a postura jurídica da sua unidade estrategicamente."</p>
                     </div>
                     <div className="flex gap-6 w-full max-w-2xl">
                        <button onClick={() => updateDecision('judicial_recovery', false)} className={`flex-1 py-8 rounded-[2rem] font-black text-xs uppercase tracking-widest border-2 transition-all ${!decisions.judicial_recovery ? 'bg-emerald-600 text-white border-emerald-400 shadow-xl' : 'bg-slate-900 border-white/5 text-slate-600'}`}>Arena Padrão</button>
                        <button onClick={() => updateDecision('judicial_recovery', true)} className={`flex-1 py-8 rounded-[2rem] font-black text-xs uppercase tracking-widest border-2 transition-all ${decisions.judicial_recovery ? 'bg-rose-600 text-white border-rose-400 shadow-xl' : 'bg-slate-900 border-white/5 text-slate-600'}`}>Protocolo RJ</button>
                     </div>
                  </div>
               )}

               {/* CARD 2: COMERCIAL */}
               {activeStep === 1 && (
                  <div className="flex flex-col lg:flex-row h-full gap-8">
                     <div className="w-full lg:w-[320px] flex flex-col gap-3 border-r border-white/5 pr-6 overflow-y-auto custom-scrollbar shrink-0">
                        {Object.keys(decisions.regions).map((id) => {
                           const regId = Number(id);
                           const isActive = activeRegion === regId;
                           return (
                              <button key={regId} onClick={() => setActiveRegion(regId)} className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-1 ${isActive ? 'bg-orange-600 border-orange-400 shadow-xl scale-[1.02]' : 'bg-slate-900 border-white/5 hover:bg-slate-800'}`}>
                                 <span className={`text-[8px] font-black uppercase ${isActive ? 'text-white/60' : 'text-slate-600'}`}>Node Regional</span>
                                 <h4 className={`text-md font-black uppercase italic ${isActive ? 'text-white' : 'text-slate-200'}`}>{activeArena?.region_names?.[regId-1] || `Região ${regId}`}</h4>
                              </button>
                           );
                        })}
                     </div>
                     <div className="flex-1 space-y-10 overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[3rem] border border-white/5">
                           <div className="space-y-1">
                              <h3 className="text-xl font-black text-white uppercase italic">Configuração do Nodo 0{activeRegion}</h3>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Ajuste os parâmetros de conversão regional.</p>
                           </div>
                           <button onClick={replicateRegions} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2">
                              <RefreshCw size={14} /> Replicar em Cluster
                           </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <InputCard label="Preço Unitário ($)" info="Preço de venda bruto. Default: 0." val={decisions.regions[activeRegion]?.price} onChange={(v:any)=>updateDecision(`regions.${activeRegion}.price`, v)} icon={<DollarSign size={20}/>} />
                           <SelectCard label="Fluxo de Prazo" info="Define a liquidez do ativo circulante." val={decisions.regions[activeRegion]?.term} onChange={(v:any)=>updateDecision(`regions.${activeRegion}.term`, v)} options={[{v:0,l:'À VISTA'},{v:1,l:'50/50'},{v:2,l:'33/33/33'}]} icon={<Timer size={20}/>} />
                        </div>

                        <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8">
                           <div className="flex justify-between items-center">
                              <label className="text-xs font-black text-white uppercase tracking-widest flex items-center">Investimento Marketing <InfoTag text="Escala de impacto 0-9. Default: 1." /></label>
                              <span className="text-6xl font-black text-orange-500 italic">{decisions.regions[activeRegion]?.marketing || 1}</span>
                           </div>
                           <input type="range" min="0" max="9" step="1" value={decisions.regions[activeRegion]?.marketing || 1} onChange={e => updateDecision(`regions.${activeRegion}.marketing`, Number(e.target.value))} className="w-full h-3 bg-slate-950 rounded-full appearance-none cursor-pointer accent-orange-600" />
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 3: OPERAÇÕES */}
               {activeStep === 2 && (
                  <div className="space-y-10 max-w-6xl mx-auto">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-10">
                           <h4 className="text-xl font-black text-emerald-400 uppercase italic flex items-center gap-4"><Package size={24}/> Cadeia de Insumos</h4>
                           <InputCard label="Matéria-Prima A (QTDE)" info="Estoque basal para produção Alfa. Default: 0." val={decisions.production.purchaseMPA} onChange={(v:any)=>updateDecision('production.purchaseMPA', v)} />
                           <InputCard label="Matéria-Prima B (QTDE)" info="Estoque basal para produção Beta/Gama. Default: 0." val={decisions.production.purchaseMPB} onChange={(v:any)=>updateDecision('production.purchaseMPB', v)} />
                           <SelectCard label="Fluxo Pgto Fornecedor" info="Dita a saída imediata de caixa por compras." val={decisions.production.paymentType} onChange={(v:any)=>updateDecision('production.paymentType', v)} options={[{v:0,l:'À VISTA'},{v:1,l:'50/50'},{v:2,l:'33/33/33'}]} />
                        </div>
                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-8">
                           <h4 className="text-xl font-black text-blue-400 uppercase italic flex items-center gap-4"><Settings2 size={24}/> Fábrica & Core</h4>
                           <div className="space-y-6">
                              <RangeInput label="Uso da Capacidade (%)" info="Eficiência das máquinas atuais." val={decisions.production.activityLevel} onChange={(v:any)=>updateDecision('production.activityLevel', v)} color="blue" />
                              <RangeInput label="Turno Extra (%)" info="Custo de MO elevado para pico de demanda." val={decisions.production.extraProductionPercent} onChange={(v:any)=>updateDecision('production.extraProductionPercent', v)} color="rose" />
                              <RangeInput label="Investimento P&D (%)" info="Gera valor tecnológico de longo prazo." val={decisions.production.rd_investment} onChange={(v:any)=>updateDecision('production.rd_investment', v)} color="emerald" />
                           </div>
                           <div className="grid grid-cols-2 gap-4 pt-4">
                              <InputCard label="Meta Lucro (%)" val={decisions.production.net_profit_target_percent} onChange={(v:any)=>updateDecision('production.net_profit_target_percent', v)} />
                              <InputCard label="Juros Venda (%)" val={decisions.production.term_interest_rate} onChange={(v:any)=>updateDecision('production.term_interest_rate', v)} />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 4: TALENTOS */}
               {activeStep === 3 && (
                  <div className="max-w-5xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/5 shadow-3xl text-center space-y-8">
                        <Users2 size={48} className="text-indigo-400 mx-auto" />
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gestão de Talentos <InfoTag text="O moral da equipe e produtividade dependem destes KPIs." /></h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputCard label="Novas Admissões" info="Reforça os nodos de produção." val={decisions.hr.hired} onChange={(v:any)=>updateDecision('hr.hired', v)} icon={<UserPlus size={20}/>} />
                        <InputCard label="Desligamentos" info="Reduz OPEX imediato." val={decisions.hr.fired} onChange={(v:any)=>updateDecision('hr.fired', v)} icon={<MinusCircle size={20}/>} />
                        <InputCard label="Piso Salarial ($)" info="Default: 0.00. Base de cálculo do payroll." val={decisions.hr.salary} onChange={(v:any)=>updateDecision('hr.salary', v)} icon={<Wallet size={20}/>} />
                        <div className="space-y-4">
                           <RangeInput label="Treinamento (%)" val={decisions.hr.trainingPercent} onChange={(v:any)=>updateDecision('hr.trainingPercent', v)} color="indigo" />
                           <RangeInput label="PPR (%)" val={decisions.hr.participationPercent} onChange={(v:any)=>updateDecision('hr.participationPercent', v)} color="indigo" />
                           <RangeInput label="Prêmio Prod. (%)" val={decisions.hr.productivityBonusPercent} onChange={(v:any)=>updateDecision('hr.productivityBonusPercent', v)} color="indigo" />
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 5: ATIVOS (CAPEX) */}
               {activeStep === 4 && (
                  <div className="space-y-16">
                     <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 space-y-10">
                        <div className="flex justify-between items-center">
                           <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-6"><TrendingUp className="text-emerald-500" /> Expansão CAPEX <InfoTag text="Compra de novas máquinas ajustadas pelo índice do Tutor." /></h3>
                           <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full font-black text-[9px] uppercase tracking-widest animate-pulse">Novas Unidades Ativas</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <MachineBuyCard model="ALFA" icon={<Cpu/>} cap="2.000" ops="94" price={getAdjustedMachinePrice('alfa')} val={decisions.machinery.buy.alfa} onChange={(v:any)=>updateDecision('machinery.buy.alfa', v)} />
                           <MachineBuyCard model="BETA" icon={<Cpu/>} cap="6.000" ops="235" price={getAdjustedMachinePrice('beta')} val={decisions.machinery.buy.beta} onChange={(v:any)=>updateDecision('machinery.buy.beta', v)} />
                           <MachineBuyCard model="GAMA" icon={<Cpu/>} cap="12.000" ops="445" price={getAdjustedMachinePrice('gama')} val={decisions.machinery.buy.gama} onChange={(v:any)=>updateDecision('machinery.buy.gama', v)} />
                        </div>
                     </div>

                     <div className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 space-y-10">
                        <div className="flex justify-between items-center">
                           <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-6"><TrendingDown className="text-rose-500" /> Desinvestimento <InfoTag text={`Venda de ativos com deságio de ${activeArena?.market_indicators.machine_sale_discount || 10}%`} /></h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                           {activeArena?.market_indicators.initial_machinery_mix.map((m: any, idx: number) => (
                             <div key={idx} className="bg-slate-950 p-8 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all">
                                <div className="flex items-center gap-6">
                                   <div className="p-4 bg-white/5 rounded-2xl text-slate-500"><HardDrive size={24}/></div>
                                   <div>
                                      <h4 className="text-xl font-black text-white uppercase italic">Machine {m.model.toUpperCase()} #{m.id}</h4>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Depreciação: {m.age} Ciclos • Valor Contábil: $ {sanitize(m.purchase_value * 0.7).toLocaleString()}</p>
                                   </div>
                                </div>
                                <div className="w-48">
                                   <input type="number" placeholder="QTDE VENDA" className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-center text-white font-black" />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 6: FINANÇAS */}
               {activeStep === 5 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-8">
                           <h4 className="text-xl font-black text-orange-400 uppercase italic flex items-center gap-4"><Scale size={24}/> Requisitar Alavancagem</h4>
                           <InputCard label="Requisição Empréstimo ($)" val={decisions.finance.loanRequest} onChange={(v:any)=>updateDecision('finance.loanRequest', v)} icon={<DollarSign size={20}/>} />
                           <SelectCard label="Amortização (Fluxo)" val={decisions.finance.loanTerm} onChange={(v:any)=>updateDecision('finance.loanTerm', v)} options={[{v:0,l:'À VISTA'},{v:1,l:'50/50 (CURTO)'},{v:2,l:'33/33/33 (LONGO)'}]} />
                           <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-[2rem] flex items-center gap-4">
                              <AlertCircle className="text-orange-500" size={24} />
                              <span className="text-[10px] font-black uppercase text-white tracking-widest italic">Custo de Capital (TR): {activeArena?.market_indicators.interest_rate_tr}% ao Ciclo</span>
                           </div>
                        </div>
                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-8">
                           <h4 className="text-xl font-black text-blue-400 uppercase italic flex items-center gap-4"><LineChart size={24}/> Aplicação Financeira</h4>
                           <InputCard label="Valor Aplicado ($)" info="Default 0. Liquidez retorna no próximo ciclo." val={decisions.finance.application} onChange={(v:any)=>updateDecision('finance.application', v)} icon={<ArrowUpRight size={20}/>} />
                           <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center gap-4">
                              <Zap className="text-blue-500" size={24} />
                              <span className="text-[10px] font-black uppercase text-white tracking-widest italic">Rendimento Projetado: {activeArena?.market_indicators.investment_return_rate}% ao Ciclo</span>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 7: PROJEÇÕES E METAS */}
               {activeStep === 6 && (
                  <div className="max-w-5xl mx-auto space-y-12">
                     <div className="text-center space-y-4">
                        <Award size={48} className="text-orange-500 mx-auto animate-bounce" />
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Matriz de Bônus de Precisão</h2>
                        <p className="text-slate-500 font-medium italic">"Seja cirúrgico. Erros menores que 5% desbloqueiam o Oracle Incentive."</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <GoalCard label="Custo Unitário (CPP)" award="$ 50k" val={decisions.estimates?.forecasted_unit_cost} onChange={(v:any)=>updateDecision('estimates.forecasted_unit_cost', v)} color="blue" />
                        <GoalCard label="Receita Bruta" award="$ 100k" val={decisions.estimates?.forecasted_revenue} onChange={(v:any)=>updateDecision('estimates.forecasted_revenue', v)} color="orange" />
                        <GoalCard label="Lucro Líquido" award="$ 150k" val={decisions.estimates?.forecasted_net_profit} onChange={(v:any)=>updateDecision('estimates.forecasted_net_profit', v)} color="emerald" />
                     </div>
                  </div>
               )}

               {/* CARD 8: FINALIZAR */}
               {activeStep === 7 && (
                  <div className="max-w-4xl mx-auto space-y-12 py-10">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/10 shadow-3xl text-center space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><ShieldCheck size={200} /></div>
                        <ClipboardCheck size={64} className="text-orange-500 mx-auto" />
                        <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">Review de Ciclo</h2>
                        
                        <div className="grid grid-cols-2 gap-4 text-left pt-10">
                           <SummaryItem label="Regime Jurídico" val={decisions.judicial_recovery ? "RECUPERAÇÃO JUDICIAL" : "NORMAL"} />
                           <SummaryItem label="Preço Médio Nodo" val={`$ ${decisions.regions[activeRegion]?.price}`} />
                           <SummaryItem label="Nível Atividade" val={`${decisions.production.activityLevel}%`} />
                           <SummaryItem label="Staffing (Novos)" val={decisions.hr.hired} />
                        </div>

                        <div className="p-8 bg-rose-600/10 border-2 border-rose-500/20 rounded-[3rem] mt-10">
                           <p className="text-xs font-black uppercase text-rose-400 tracking-widest leading-relaxed">
                              ⚠️ ATENÇÃO OPERADOR: Decisões podem ser alteradas livremente até o vencimento do timer global. Após o Turnover, o protocolo é selado permanentemente.
                           </p>
                        </div>
                     </div>
                  </div>
               )}

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
        {info && <InfoTip text={info} />}
     </div>
     <input type="number" value={val || ''} placeholder="0" onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner" />
  </div>
);

const RangeInput = ({ label, val, color, onChange, info }: any) => (
   <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
         <label className="text-[10px] font-black uppercase text-slate-500 flex items-center">{label} {info && <InfoTip text={info} />}</label>
         <span className={`text-lg font-black italic ${color === 'blue' ? 'text-blue-500' : color === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>{val}%</span>
      </div>
      <input type="range" value={val} onChange={e => onChange(Number(e.target.value))} className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-900 accent-${color}-500`} />
   </div>
);

const MachineBuyCard = ({ model, cap, ops, price, val, onChange, icon }: any) => (
   <div className="bg-slate-950/80 p-8 rounded-[3rem] border border-white/5 space-y-6 group hover:border-white/20 transition-all shadow-xl">
      <div className="flex justify-between items-start">
         <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400">{icon}</div>
         <div className="text-right">
            <h5 className="text-xl font-black text-white italic">MÁQUINA {model}</h5>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Oracle Spec v16</p>
         </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-white/5">
         <SpecRow label="Capacidade" val={`${cap} UN`} />
         <SpecRow label="Operadores" val={`${ops} Units`} />
         <div className="flex justify-between items-center py-2">
            <span className="text-[9px] font-black text-emerald-400 uppercase">Valor Ajustado</span>
            <span className="text-lg font-mono font-black text-white italic">$ {price.toLocaleString()}</span>
         </div>
      </div>
      <input type="number" value={val} onChange={e => onChange(parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl p-4 text-center text-white font-black outline-none focus:border-emerald-500" placeholder="0" />
   </div>
);

const GoalCard = ({ label, award, val, onChange, color }: any) => (
   <div className={`p-10 rounded-[3.5rem] border-2 bg-slate-900 shadow-2xl flex flex-col gap-6 group hover:border-${color}-500/30 transition-all border-white/5`}>
      <div className="flex justify-between items-center">
         <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-${color}-400`}>{label}</span>
         <div className={`px-4 py-1.5 rounded-full bg-${color}-500/10 border border-${color}-500/20 text-${color}-500 text-[9px] font-black uppercase`}>Bônus {award}</div>
      </div>
      <input type="number" value={val || ''} onChange={e => onChange(Number(e.target.value))} className="bg-transparent border-b-2 border-white/5 outline-none text-4xl font-black text-white italic font-mono focus:border-white transition-all w-full" placeholder="0" />
   </div>
);

const SpecRow = ({ label, val }: any) => (
   <div className="flex justify-between items-center">
      <span className="text-[8px] font-black text-slate-500 uppercase">{label}</span>
      <span className="text-xs font-black text-slate-300">{val}</span>
   </div>
);

const SummaryItem = ({ label, val }: any) => (
   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
      <span className="block text-[8px] font-black text-slate-500 uppercase mb-1">{label}</span>
      <span className="text-sm font-black text-white italic">{val}</span>
   </div>
);

const SelectCard = ({ label, val, options, icon, onChange, info }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all">
     <div className="flex items-center gap-2"><div className="text-slate-500">{icon}</div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label>{info && <InfoTip text={info}/>}</div>
     <select value={val} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-black text-[12px] uppercase outline-none appearance-none cursor-pointer">
        {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
     </select>
  </div>
);

const InfoTip = ({ text }: { text: string }) => (
   <div className="group relative cursor-help">
      <Info size={12} className="text-slate-600 hover:text-white" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 border border-white/10 rounded-xl text-[8px] text-slate-400 hidden group-hover:block z-50 shadow-2xl">
         {text}
      </div>
   </div>
);

const HardDrive = ({ size, className }: any) => <Cpu size={size} className={className} />;

export default DecisionForm;
