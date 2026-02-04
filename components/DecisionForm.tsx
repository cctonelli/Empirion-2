
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, Wallet, 
  TrendingUp, ArrowUpRight, TrendingDown, ClipboardCheck,
  PlusCircle, MinusCircle, AlertCircle, RefreshCw,
  Timer, Settings2, UserPlus, Rocket, Info, HelpCircle,
  HardDrive, Lock, Zap, Scale, Eye, BarChart3, PieChart,
  Activity, Receipt, Coins, Trash2,
  // Fix: Added missing icon imports Box and AlertOctagon
  Box, AlertOctagon
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
import { sanitize } from '../services/simulation';
import { DecisionData, Branch, Championship, MachineModel, InitialMachine, MacroIndicators } from '../types';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

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

  const currentMacro = useMemo(() => {
    if (!activeArena) return DEFAULT_MACRO;
    const rules = activeArena.round_rules?.[round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[round] || {};
    return { ...DEFAULT_MACRO, ...activeArena.market_indicators, ...rules } as MacroIndicators;
  }, [activeArena, round]);

  const updateDecision = (path: string, val: any) => {
    if (isReadOnly) return;
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
    const base = currentMacro.machinery_values?.[model] || 500000;
    const adjust = currentMacro[`machine_${model}_price_adjust`] || 1.0;
    return base * adjust;
  };

  const replicateRegion = () => {
    const source = decisions.regions[1];
    if (!source) return;
    const nextRegions = { ...decisions.regions };
    Object.keys(nextRegions).forEach(id => {
      nextRegions[Number(id)] = { ...source };
    });
    updateDecision('regions', nextRegions);
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
               
               {/* CARD 1: JURÍDICO */}
               {activeStep === 0 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/5 shadow-3xl text-center space-y-8">
                        <Gavel size={48} className="text-orange-500 mx-auto" />
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Status de Solvência</h2>
                        <p className="text-slate-400 italic">Defina o protocolo legal de operação da unidade para este ciclo.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <button 
                           onClick={() => updateDecision('judicial_recovery', false)}
                           className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 ${!decisions.judicial_recovery ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                        >
                           <ShieldCheck size={40} />
                           <div className="text-center">
                              <span className="block font-black uppercase tracking-widest">Arena Padrão</span>
                              <p className="text-[10px] mt-2 opacity-70">Operação normal sem restrições de crédito.</p>
                           </div>
                        </button>
                        <button 
                           onClick={() => updateDecision('judicial_recovery', true)}
                           className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 ${decisions.judicial_recovery ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_40px_rgba(225,29,72,0.3)]' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                        >
                           <Scale size={40} />
                           <div className="text-center">
                              <span className="block font-black uppercase tracking-widest">Protocolo RJ</span>
                              <p className="text-[10px] mt-2 opacity-70">Recuperação Judicial: Crédito limitado.</p>
                           </div>
                        </button>
                     </div>
                     <div className="p-6 bg-white/5 rounded-3xl flex items-center gap-4 border border-white/10">
                        <HelpCircle size={24} className="text-blue-400" />
                        <p className="text-xs text-slate-400 leading-relaxed font-medium italic">"O Protocolo RJ protege a empresa contra execuções imediatas, mas o Oráculo Oracle impõe um spread de risco severo e bloqueia expansões massivas de Capex."</p>
                     </div>
                  </div>
               )}

               {/* CARD 2: COMERCIAL */}
               {activeStep === 1 && (
                  <div className="space-y-12">
                     <div className="flex justify-between items-end bg-slate-900/60 p-10 rounded-[4rem] border border-white/5">
                        <div className="space-y-2">
                           <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4"><Megaphone className="text-orange-500" /> Regiões de Vendas</h3>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configure preço, prazo e marketing para as {Object.keys(decisions.regions).length} regiões.</p>
                        </div>
                        <button onClick={replicateRegion} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3">
                           <RefreshCw size={14} /> Replicar em Cluster
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {Object.entries(decisions.regions).map(([id, reg]: [any, any]) => (
                           <div key={id} className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 space-y-8 hover:border-orange-500/30 transition-all">
                              <div className="flex justify-between items-center">
                                 <span className="text-xs font-black text-orange-500 uppercase italic">Região 0{id}</span>
                                 <HelpCircle size={14} className="text-slate-700" />
                              </div>
                              <InputCard label="Preço Unit. ($)" val={reg.price} onChange={(v:any)=>updateDecision(`regions.${id}.price`, v)} />
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Fluxo de Recebimento</label>
                                 <select 
                                    value={reg.term} 
                                    onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))}
                                    className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-4 text-xs font-black text-white uppercase"
                                 >
                                    <option value={0}>A VISTA</option>
                                    <option value={1}>50% / 50%</option>
                                    <option value={2}>33% / 33% / 33%</option>
                                 </select>
                              </div>
                              <RangeInput label="Marketing (0-9)" val={reg.marketing} color="blue" onChange={(v:any)=>updateDecision(`regions.${id}.marketing`, v)} />
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* CARD 3: OPERAÇÕES */}
               {activeStep === 2 && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-8">
                           <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl space-y-10">
                              <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Package className="text-emerald-500"/> Suprimentos & Matéria-Prima</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {/* Fix: Line 212: Use Box icon */}
                                 <InputCard label="MP-A (Qtde)" val={decisions.production.purchaseMPA} onChange={(v:any)=>updateDecision('production.purchaseMPA', v)} icon={<Box size={16}/>} />
                                 {/* Fix: Line 213: Use Box icon */}
                                 <InputCard label="MP-B (Qtde)" val={decisions.production.purchaseMPB} onChange={(v:any)=>updateDecision('production.purchaseMPB', v)} icon={<Box size={16}/>} />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Fluxo de Pagamento Fornecedor</label>
                                 <div className="grid grid-cols-3 gap-4">
                                    {['A VISTA', '50 / 50', '33/33/33'].map((l, i) => (
                                       <button key={l} onClick={() => updateDecision('production.paymentType', i)} className={`py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${decisions.production.paymentType === i ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500'}`}>{l}</button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                           <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl space-y-10">
                              <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Activity className="text-blue-400"/> Produtividade</h3>
                              <RangeInput label="Capacidade (%)" val={decisions.production.activityLevel} color="blue" onChange={(v:any)=>updateDecision('production.activityLevel', v)} />
                              <RangeInput label="Turno Extra (%)" val={decisions.production.extraProductionPercent} color="orange" onChange={(v:any)=>updateDecision('production.extraProductionPercent', v)} />
                              <RangeInput label="Investimento P&D (%)" val={decisions.production.rd_investment_pct} color="indigo" onChange={(v:any)=>updateDecision('production.rd_investment_pct', v)} />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputCard label="Meta Lucro Líquido (%)" val={decisions.production.net_profit_target_percent} onChange={(v:any)=>updateDecision('production.net_profit_target_percent', v)} icon={<Target size={16}/>} />
                        <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 flex items-center justify-between">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-500 uppercase">Juros Venda a Prazo</span>
                              <h4 className="text-2xl font-black text-orange-500 italic">{currentMacro.sales_interest_rate || 1.5}% p.p.</h4>
                           </div>
                           <TrendingUp size={32} className="text-slate-800" />
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 4: TALENTOS */}
               {activeStep === 3 && (
                  <div className="max-w-5xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/5 shadow-3xl text-center space-y-8">
                        <Users2 size={48} className="text-indigo-400 mx-auto" />
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gestão de Talentos</h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputCard label="Novas Admissões" val={decisions.hr.hired} onChange={(v:any)=>updateDecision('hr.hired', v)} icon={<UserPlus size={20}/>} />
                        <InputCard label="Desligamentos" val={decisions.hr.fired} onChange={(v:any)=>updateDecision('hr.fired', v)} icon={<MinusCircle size={20}/>} />
                        <InputCard label="Piso Salarial ($)" val={decisions.hr.salary} onChange={(v:any)=>updateDecision('hr.salary', v)} icon={<Wallet size={20}/>} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5">
                           <RangeInput label="Treinamento (%)" val={decisions.hr.trainingPercent} onChange={(v:any)=>updateDecision('hr.trainingPercent', v)} color="indigo" />
                        </div>
                        <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5">
                           <RangeInput label="Participação Lucros (%)" val={decisions.hr.participationPercent} onChange={(v:any)=>updateDecision('hr.participationPercent', v)} color="emerald" />
                        </div>
                        <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5">
                           <RangeInput label="Prêmio Produtividade (%)" val={decisions.hr.productivityBonusPercent} onChange={(v:any)=>updateDecision('hr.productivityBonusPercent', v)} color="blue" />
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 5: ATIVOS (CAPEX & DESINVESTIMENTO) */}
               {activeStep === 4 && (
                  <div className="space-y-16">
                     <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 space-y-10">
                        <div className="flex justify-between items-center">
                           <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-6"><TrendingUp className="text-emerald-500" /> Expansão CAPEX</h3>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2"><Info size={12}/> Reajustes aplicados para P0{round}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <MachineBuyCard model="ALFA" icon={<Cpu/>} cap="2.000" ops="94" price={getAdjustedMachinePrice('alfa')} val={decisions.machinery.buy.alfa} onChange={(v:any)=>updateDecision('machinery.buy.alfa', v)} />
                           <MachineBuyCard model="BETA" icon={<Cpu/>} cap="6.000" ops="235" price={getAdjustedMachinePrice('beta')} val={decisions.machinery.buy.beta} onChange={(v:any)=>updateDecision('machinery.buy.beta', v)} />
                           <MachineBuyCard model="GAMA" icon={<Cpu/>} cap="12.000" ops="445" price={getAdjustedMachinePrice('gama')} val={decisions.machinery.buy.gama} onChange={(v:any)=>updateDecision('machinery.buy.gama', v)} />
                        </div>
                     </div>

                     <div className="bg-slate-950/80 p-12 rounded-[4rem] border border-white/10 space-y-10 shadow-inner">
                        <div className="flex justify-between items-center">
                           <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-6"><TrendingDown className="text-rose-500" /> Desinvestimento</h3>
                           <div className="px-6 py-2 bg-rose-600/10 border border-rose-500/30 text-rose-500 rounded-full font-black text-[9px] uppercase tracking-widest">
                              Deságio Venda: {currentMacro.machine_sale_discount || 10}%
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Vender ALFA (Qtde)</label>
                              <input type="number" value={decisions.machinery.sell.alfa} onChange={e=>updateDecision('machinery.sell.alfa', parseInt(e.target.value)||0)} className="w-full bg-slate-900 border-2 border-white/5 rounded-3xl p-6 text-white font-black text-center" placeholder="0" />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Vender BETA (Qtde)</label>
                              <input type="number" value={decisions.machinery.sell.beta} onChange={e=>updateDecision('machinery.sell.beta', parseInt(e.target.value)||0)} className="w-full bg-slate-900 border-2 border-white/5 rounded-3xl p-6 text-white font-black text-center" placeholder="0" />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Vender GAMA (Qtde)</label>
                              <input type="number" value={decisions.machinery.sell.gama} onChange={e=>updateDecision('machinery.sell.gama', parseInt(e.target.value)||0)} className="w-full bg-slate-900 border-2 border-white/5 rounded-3xl p-6 text-white font-black text-center" placeholder="0" />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 6: FINANÇAS */}
               {activeStep === 5 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/5 shadow-3xl space-y-10">
                        <h3 className="text-3xl font-black text-white uppercase italic text-center flex items-center justify-center gap-6"><Landmark className="text-blue-400" /> Captação & Reserva</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-6">
                              <InputCard label="Requisição Empréstimo ($)" val={decisions.finance.loanRequest} onChange={(v:any)=>updateDecision('finance.loanRequest', v)} icon={<DollarSign size={20}/>} />
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Plano de Amortização</label>
                                 <select 
                                    value={decisions.finance.loanTerm} 
                                    onChange={e => updateDecision('finance.loanTerm', parseInt(e.target.value))}
                                    className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl p-4 text-xs font-black text-white uppercase"
                                 >
                                    <option value={0}>A VISTA (IMEDIATO)</option>
                                    <option value={1}>50/50 (CURTO PRAZO)</option>
                                    <option value={2}>33/33/33 (LONGO PRAZO)</option>
                                 </select>
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase text-center bg-white/5 p-4 rounded-xl">Juros TR Aplicado: <span className="text-emerald-500">{currentMacro.interest_rate_tr}% p.p.</span></p>
                           </div>
                           <div className="space-y-6">
                              <InputCard label="Aplicação Financeira ($)" val={decisions.finance.application} onChange={(v:any)=>updateDecision('finance.application', v)} icon={<TrendingUp size={20}/>} />
                              <div className="p-8 bg-slate-950 border-2 border-white/10 rounded-[2.5rem] space-y-4">
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-600">
                                    <span>Rendimento Previsto</span>
                                    <span className="text-blue-400">{currentMacro.investment_return_rate}% p.p.</span>
                                 </div>
                                 <p className="text-[9px] text-slate-500 leading-relaxed italic">"O montante será debitado do caixa hoje e retornará com rendimentos no próximo ciclo em 'Resgate de Aplicação'."</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 7: METAS */}
               {activeStep === 6 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/5 shadow-3xl text-center space-y-8">
                        <Target size={48} className="text-orange-500 mx-auto" />
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Projeções e Metas</h2>
                        <p className="text-slate-400 italic">Preveja seu desempenho para ganhar Empire Points por precisão.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputCard label="Custo Unitário CPP ($)" val={decisions.estimates.forecasted_unit_cost} onChange={(v:any)=>updateDecision('estimates.forecasted_unit_cost', v)} />
                        <InputCard label="Receita Bruta ($)" val={decisions.estimates.forecasted_revenue} onChange={(v:any)=>updateDecision('estimates.forecasted_revenue', v)} />
                        <InputCard label="Lucro Líquido Total ($)" val={decisions.estimates.forecasted_net_profit} onChange={(v:any)=>updateDecision('estimates.forecasted_net_profit', v)} />
                     </div>
                     <div className="bg-orange-600/5 border border-orange-500/20 p-8 rounded-[3rem] space-y-4 text-center">
                        <h4 className="text-xs font-black uppercase text-orange-500 tracking-widest">Protocolo de Premiação Ativo</h4>
                        <p className="text-[10px] text-slate-500 uppercase font-bold italic leading-relaxed">"Erros menores que 5% nestas projeções desbloqueiam badges 'Oracle Sniper'."</p>
                     </div>
                  </div>
               )}

               {/* CARD 8: FINALIZAR */}
               {activeStep === 7 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-16 rounded-[5rem] border border-white/5 shadow-3xl space-y-12">
                        <div className="text-center space-y-4">
                           <ShieldCheck size={64} className="text-emerald-500 mx-auto" />
                           <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Selo de Transmissão</h2>
                        </div>
                        
                        <div className="bg-slate-950/80 p-10 rounded-[3rem] border border-white/10 space-y-6">
                           <h4 className="text-[11px] font-black text-orange-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Resumo do Ciclo P0{round}</h4>
                           <div className="grid grid-cols-2 gap-y-4 text-xs font-bold uppercase italic">
                              <span className="text-slate-500">Expansão de Ativos:</span>
                              <span className="text-white text-right">{isBuyingMachines ? 'SOLICITADA' : 'ESTÁVEL'}</span>
                              <span className="text-slate-500">Capex Máquinas:</span>
                              <span className="text-white text-right">$ {((decisions.machinery.buy.alfa * getAdjustedMachinePrice('alfa')) + (decisions.machinery.buy.beta * getAdjustedMachinePrice('beta')) + (decisions.machinery.buy.gama * getAdjustedMachinePrice('gama'))).toLocaleString()}</span>
                              <span className="text-slate-500">Crédito Solicitado:</span>
                              <span className="text-white text-right">$ {decisions.finance.loanRequest.toLocaleString()}</span>
                           </div>
                        </div>

                        <div className="bg-rose-600/10 border border-rose-500/30 p-8 rounded-[3rem] space-y-4">
                           <div className="flex items-center gap-4 text-rose-500">
                              {/* Fix: Line 395: Use AlertOctagon icon */}
                              <AlertOctagon size={24} />
                              <span className="text-xs font-black uppercase tracking-widest">Aviso Crítico de Sincronização</span>
                           </div>
                           <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                              "As decisões podem ser editadas até o vencimento do cronômetro. Se o prazo expirar sem a transmissão, sua equipe será eliminada por W.O. (dados zerados)."
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
     <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="text-slate-500">{icon}</div>
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label>
        </div>
        <HelpCircle size={12} className="text-slate-700" />
     </div>
     <input type="number" value={val || 0} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner" />
  </div>
);

const RangeInput = ({ label, val, color, onChange, info }: any) => (
   <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
         <label className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-2">{label} <HelpCircle size={10}/></label>
         <span className={`text-lg font-black italic ${color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : 'text-indigo-500'}`}>{val}%</span>
      </div>
      <input type="range" value={val} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-950" style={{ accentColor: color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#f97316' }} />
      {info && <p className="text-[8px] text-slate-500 uppercase tracking-widest italic">{info}</p>}
   </div>
);

const MachineBuyCard = ({ model, cap, ops, price, val, onChange, icon }: any) => (
   <div className="bg-slate-950/80 p-8 rounded-[3rem] border border-white/5 space-y-6 group hover:border-orange-500/30 transition-all shadow-xl">
      <div className="flex justify-between items-start">
         <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-lg">{icon}</div>
         <div className="text-right">
            <h5 className="text-xl font-black text-white italic">MÁQUINA {model}</h5>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">P0{val > 0 ? 'Expansão' : 'Operacional'}</span>
         </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-white/5">
         <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase"><span>Capacidade</span><span className="text-white">{cap} UN</span></div>
         <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase"><span>Operadores</span><span className="text-white">{ops} Units</span></div>
         <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase"><span>Preço Atual</span><span className="text-emerald-500 font-black">$ {price.toLocaleString()}</span></div>
      </div>
      <div className="relative group">
         <input type="number" value={val} onChange={e => onChange(parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl p-4 text-center text-white font-black focus:border-orange-500 outline-none" placeholder="0" />
         <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity"><Zap size={14} className="text-orange-500" /></div>
      </div>
   </div>
);

export default DecisionForm;
