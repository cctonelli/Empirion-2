
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, Wallet, 
  TrendingUp, ArrowUpRight, TrendingDown, ClipboardCheck,
  PlusCircle, MinusCircle, AlertCircle, RefreshCw,
  Timer, Settings2, UserPlus, Rocket, Info, HelpCircle,
  HardDrive, Lock, Zap, Scale, Eye, BarChart3, PieChart,
  Activity, Receipt, Coins, Trash2, Box, AlertOctagon,
  Award, Check, Globe, UserMinus,
  // Fix: Added missing Lucide icon imports
  Percent, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase, getUserProfile } from '../services/supabase';
import { DecisionData, Branch, Championship, MachineModel, MacroIndicators, Team, InitialMachine } from '../types';
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
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 0, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0, sales_staff_count: 50 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 0, extraProductionPercent: 0, rd_investment: 0, net_profit_target_percent: 0, term_interest_rate: 0.00 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanTerm: 0, application: 0 },
    estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (!champId || !teamId) return;
      setIsLoadingDraft(true);
      
      try {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (!found) return;
        setActiveArena(found);

        const team = found.teams?.find(t => t.id === teamId);
        if (team) setActiveTeam(team);

        const table = found.is_trial ? 'trial_decisions' : 'current_decisions';
        const { data: draft } = await supabase.from(table)
          .select('data')
          .eq('championship_id', champId)
          .eq('team_id', teamId)
          .eq('round', round)
          .maybeSingle();

        const initialRegions: any = {};
        for (let i = 1; i <= (found.regions_count || 1); i++) {
          initialRegions[i] = draft?.data?.regions?.[i] || { price: 0, term: 0, marketing: 0 };
        }

        if (draft?.data) {
          setDecisions({
            ...draft.data,
            regions: initialRegions 
          });
        } else {
          setDecisions(prev => ({ 
            ...prev, 
            regions: initialRegions,
            production: { 
              ...prev.production, 
              purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 0, 
              extraProductionPercent: 0, rd_investment: 0, net_profit_target_percent: 0, 
              term_interest_rate: 0.00 
            }
          }));
        }
      } catch (err) {
        console.error("Hydration Error:", err);
      } finally {
        setIsLoadingDraft(false);
      }
    };
    initializeForm();
  }, [champId, teamId, round]);

  const currentMacro = useMemo(() => {
    if (!activeArena) return DEFAULT_MACRO;
    const rules = activeArena.round_rules?.[round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[round] || {};
    return { ...DEFAULT_MACRO, ...activeArena.market_indicators, ...rules } as MacroIndicators;
  }, [activeArena, round]);

  const getAdjustedMachinePrice = (model: MachineModel) => {
    const base = currentMacro.machinery_values?.[model] || DEFAULT_MACRO.machinery_values[model];
    // O ajuste é refletido no valor atual definido pelo tutor
    return base;
  };

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

  const handleTransmit = async () => {
    if (!teamId || !champId || isReadOnly) return;
    setIsSaving(true);
    try {
      const res = await saveDecisions(teamId, champId, round, decisions) as any;
      if (res.success) alert("PROTOCOLO SELADO: Suas decisões foram transmitidas ao motor Oracle.");
      else throw new Error(res.error);
    } catch (err: any) {
      alert(`FALHA NA TRANSMISSÃO: ${err.message}`);
    } finally { setIsSaving(false); }
  };

  if (isLoadingDraft) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950/20 rounded-[2.5rem] border border-white/5">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Terminal...</span>
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
               
               {/* CARD 1 - JURÍDICO */}
               {activeStep === 0 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/5 shadow-3xl text-center space-y-8">
                        <Gavel size={48} className="text-orange-500 mx-auto" />
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Status de Solvência</h2>
                        <p className="text-slate-400 italic">Defina o protocolo legal de operação da unidade para este ciclo.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <button onClick={() => updateDecision('judicial_recovery', false)} className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 ${!decisions.judicial_recovery ? 'bg-orange-600 border-orange-400 text-white shadow-2xl' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-orange-500/20'}`}>
                           <ShieldCheck size={40} />
                           <div className="text-center"><span className="block font-black uppercase tracking-widest">Arena Padrão</span><p className="text-[10px] mt-2 opacity-70">Operação normal sem restrições de crédito.</p></div>
                        </button>
                        <button onClick={() => updateDecision('judicial_recovery', true)} className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 ${decisions.judicial_recovery ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_40px_rgba(225,29,72,0.3)]' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-orange-500/20'}`}>
                           <Scale size={40} />
                           <div className="text-center"><span className="block font-black uppercase tracking-widest">Protocolo RJ</span><p className="text-[10px] mt-2 opacity-70">Recuperação Judicial: Crédito e Capex Limitados.</p></div>
                        </button>
                     </div>
                  </div>
               )}

               {/* CARD 2 - COMERCIAL */}
               {activeStep === 1 && (
                  <div className="space-y-12">
                     <div className="flex justify-between items-end bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 shadow-2xl">
                        <div className="space-y-2">
                           <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4"><Megaphone className="text-orange-500" /> Regiões de Vendas</h3>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configure preço, prazo e campanhas de marketing.</p>
                        </div>
                        <button onClick={() => {
                            const source = decisions.regions[1];
                            if (source) {
                                const next = { ...decisions.regions };
                                Object.keys(next).forEach(k => next[Number(k)] = { ...source });
                                updateDecision('regions', next);
                            }
                        }} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3 shadow-lg active:scale-95">
                           <RefreshCw size={14} /> Replicar em Cluster
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Object.entries(decisions.regions).map(([id, reg]: [any, any]) => (
                           <div key={id} className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-10 hover:border-orange-500/30 transition-all group shadow-xl">
                              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                 <span className="text-xs font-black text-orange-500 uppercase italic">Região 0{id}</span>
                                 <HelpCircle size={14} className="text-slate-700 cursor-help hover:text-orange-500" />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Preço Unitário ($)</label>
                                 <input type="number" value={reg.price} onChange={e => updateDecision(`regions.${id}.price`, parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-white/5 rounded-[1.5rem] p-8 text-4xl font-mono font-black text-white outline-none focus:border-orange-600 transition-all tracking-tighter" />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Fluxo de Recebimento</label>
                                 <select value={reg.term} onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-4 text-[10px] font-black text-white uppercase outline-none focus:border-orange-600">
                                    <option value={0}>A VISTA</option>
                                    <option value={1}>50% / 50%</option>
                                    <option value={2}>33% / 33% / 33%</option>
                                 </select>
                              </div>
                              <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Marketing (Unidades 0-9)</label>
                                 <input type="number" min="0" max="9" value={reg.marketing} onChange={e => updateDecision(`regions.${id}.marketing`, Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* CARD 3 - OPERAÇÕES */}
               {activeStep === 2 && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Factory />} title="Operações & Fábrica" desc="Gerencie o chão de fábrica e a cadeia de suprimentos." />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <InputCard label="MATÉRIA-PRIMA A (QTDE)" val={decisions.production.purchaseMPA} icon={<Package />} onChange={(v:any)=>updateDecision('production.purchaseMPA', v)} help="Quantidade de insumo Alpha a ser comprada este período." />
                        <InputCard label="MATÉRIA-PRIMA B (QTDE)" val={decisions.production.purchaseMPB} icon={<Package />} onChange={(v:any)=>updateDecision('production.purchaseMPB', v)} help="Quantidade de insumo Beta a ser comprada este período." />
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">PAGAMENTO FORNECEDOR <HelpCircle size={12}/></label>
                           <select value={decisions.production.paymentType} onChange={e => updateDecision('production.paymentType', parseInt(e.target.value))} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl p-6 text-xs font-black text-white uppercase outline-none focus:border-orange-600">
                              <option value={0}>A VISTA</option>
                              <option value={1}>50% / 50%</option>
                              <option value={2}>33% / 33% / 33%</option>
                           </select>
                        </div>
                        <RangeInput label="USO DA CAPACIDADE" val={decisions.production.activityLevel} onChange={(v:any)=>updateDecision('production.activityLevel', v)} help="Nível de utilização das máquinas instaladas." />
                        <RangeInput label="TURNO EXTRA" val={decisions.production.extraProductionPercent} onChange={(v:any)=>updateDecision('production.extraProductionPercent', v)} color="orange" help="Aumenta a produção além da capacidade base com custo de MO 50% maior." />
                        <RangeInput label="INVESTIMENTO P&D" val={decisions.production.rd_investment} onChange={(v:any)=>updateDecision('production.rd_investment', v)} color="blue" help="Reduz custo unitário a longo prazo e aumenta atratividade." />
                        <RangeInput label="META LUCRO LÍQUIDO" val={decisions.production.net_profit_target_percent} onChange={(v:any)=>updateDecision('production.net_profit_target_percent', v)} help="Alinhamento estratégico para o conselho." />
                        <div className="lg:col-span-1">
                           <InputCard label="JUROS VENDA A PRAZO (%)" val={decisions.production.term_interest_rate} icon={<Percent />} onChange={(v:any)=>updateDecision('production.term_interest_rate', v)} help="Taxa aplicada aos clientes que compram parcelado." />
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 4 - TALENTOS */}
               {activeStep === 3 && (
                  <div className="max-w-6xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Users2 />} title="Gestão de Talentos" desc="Defina a força de trabalho e incentivos salariais." />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <InputCard label="NOVAS ADMISSÕES" val={decisions.hr.hired} icon={<UserPlus />} onChange={(v:any)=>updateDecision('hr.hired', v)} help="Aumenta a capacidade de produção baseada em operadores/máquina." />
                        <InputCard label="DESLIGAMENTOS" val={decisions.hr.fired} icon={<UserMinus />} onChange={(v:any)=>updateDecision('hr.fired', v)} help="Reduz a folha de pagamento, mas gera custos de rescisão." />
                        <InputCard label="PISO SALARIAL ($)" val={decisions.hr.salary} icon={<DollarSign />} onChange={(v:any)=>updateDecision('hr.salary', v)} help="Define o salário base. Afeta motivação e atratividade de talentos." />
                        <RangeInput label="TREINAMENTO (%)" val={decisions.hr.trainingPercent} onChange={(v:any)=>updateDecision('hr.trainingPercent', v)} color="blue" help="Aumenta a produtividade por homem-hora." />
                        <RangeInput label="PARTICIPAÇÃO LUCROS (PPR %)" val={decisions.hr.participationPercent} onChange={(v:any)=>updateDecision('hr.participationPercent', v)} help="Motivador variável baseado no lucro líquido final." />
                        <RangeInput label="PRÊMIO PRODUTIVIDADE (%)" val={decisions.hr.productivityBonusPercent} onChange={(v:any)=>updateDecision('hr.productivityBonusPercent', v)} color="orange" help="Bônus imediato por atingimento de metas fabris." />
                     </div>
                  </div>
               )}

               {/* CARD 5 - ATIVOS */}
               {activeStep === 4 && (
                  <div className="max-w-6xl mx-auto space-y-16">
                     <WizardStepHeader icon={<Cpu />} title="Ativos & CapEx" desc="Expansão e desinvestimento de parque fabril." />
                     
                     <div className="space-y-8">
                        <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><ArrowUpCircle className="text-emerald-500"/> Expansão CapEx</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           {['alfa', 'beta', 'gama'].map((m: any) => {
                              const spec = currentMacro.machine_specs?.[m];
                              return (
                                 <div key={m} className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                       <span className="text-xs font-black text-orange-500 uppercase italic">Modelo {m.toUpperCase()}</span>
                                       <div className="p-3 bg-white/5 rounded-xl text-slate-500"><Cpu size={16}/></div>
                                    </div>
                                    <div className="space-y-2">
                                       <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest"><span>Capacidade:</span><span className="text-white">{spec?.production_capacity} units</span></div>
                                       <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest"><span>Operadores:</span><span className="text-white">{spec?.operators_required}</span></div>
                                       <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest"><span>Valor Atual:</span><span className="text-emerald-400">$ {getAdjustedMachinePrice(m).toLocaleString()}</span></div>
                                    </div>
                                    <div className="pt-4">
                                       <label className="text-[8px] font-black text-slate-600 uppercase mb-2 block">Quantidade para Compra</label>
                                       <input type="number" value={decisions.machinery.buy[m as MachineModel]} onChange={e => updateDecision(`machinery.buy.${m}`, parseInt(e.target.value) || 0)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white font-mono font-black" />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="flex justify-between items-center bg-rose-600/5 p-8 rounded-[3rem] border border-rose-500/20">
                           <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><ArrowDownCircle className="text-rose-500"/> Desinvestimento (Venda)</h4>
                           <div className="flex items-center gap-3 px-6 py-2 bg-rose-600/20 rounded-full border border-rose-500/30 text-rose-500 text-[9px] font-black uppercase italic">
                              <AlertOctagon size={14}/> Deságio de Venda: {currentMacro.machine_sale_discount}% aplicado no valor contábil
                           </div>
                        </div>
                        <div className="matrix-container p-6 bg-slate-950/40">
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] border-b border-white/5">
                                    <th className="p-4">Ativo</th>
                                    <th className="p-4">Depreciação</th>
                                    <th className="p-4">Vlr. Contábil</th>
                                    <th className="p-4 text-right">Vender (Qtd)</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 {['alfa', 'beta', 'gama'].map(m => (
                                    <tr key={m} className="hover:bg-white/[0.02] transition-colors">
                                       <td className="p-4 text-xs font-black text-white uppercase">Máquina {m}</td>
                                       <td className="p-4 text-[10px] font-bold text-slate-500 uppercase">2.5% p.p.</td>
                                       <td className="p-4 font-mono text-xs text-slate-400">$ {(currentMacro.machinery_values[m as MachineModel] * 0.8).toLocaleString()}</td>
                                       <td className="p-4 text-right">
                                          <input type="number" value={decisions.machinery.sell[m as MachineModel]} onChange={e => updateDecision(`machinery.sell.${m}`, parseInt(e.target.value) || 0)} className="w-20 bg-slate-900 border border-white/10 rounded-lg p-2 text-white font-mono text-center" />
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 6 - FINANÇAS */}
               {activeStep === 5 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Landmark />} title="Mercado de Capitais" desc="Gestão de liquidez e alavancagem financeira." />
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 space-y-8 shadow-2xl">
                           <div className="flex justify-between items-start">
                              <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><Coins className="text-orange-500"/> Crédito</h4>
                              <span className="px-4 py-1.5 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-lg text-[9px] font-black uppercase">Taxa TR: {currentMacro.interest_rate_tr}%</span>
                           </div>
                           <InputCard label="REQUISIÇÃO DE EMPRÉSTIMO ($)" val={decisions.finance.loanRequest} icon={<DollarSign/>} onChange={(v:any)=>updateDecision('finance.loanRequest', v)} />
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Protocolo Amortização</label>
                              <select value={decisions.finance.loanTerm} onChange={e => updateDecision('finance.loanTerm', parseInt(e.target.value))} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl p-6 text-xs font-black text-white uppercase outline-none focus:border-orange-600 transition-all">
                                 <option value={0}>A VISTA (Próximo Round)</option>
                                 <option value={1}>CURTO PRAZO (50% / 50%)</option>
                                 <option value={2}>LONGO PRAZO (33% / 33% / 33%)</option>
                              </select>
                           </div>
                        </div>

                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 space-y-8 shadow-2xl">
                           <div className="flex justify-between items-start">
                              <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><TrendingUp className="text-emerald-500"/> Aplicação</h4>
                              <span className="px-4 py-1.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase">Rendimento: {currentMacro.investment_return_rate}%</span>
                           </div>
                           <InputCard label="APLICAÇÃO FINANCEIRA ($)" val={decisions.finance.application} icon={<Activity/>} onChange={(v:any)=>updateDecision('finance.application', v)} help="Liquidez T+1: Rendimento creditado no Resultado Financeiro do próximo período." />
                           <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 text-[10px] font-bold text-slate-500 uppercase leading-relaxed italic">
                              "Valores aplicados sairão do caixa disponível imediatamente e retornarão no ciclo subsequente acrescidos de rendimentos."
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 7 - METAS */}
               {activeStep === 6 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <WizardStepHeader icon={<Target />} title="Projeções e Metas" desc="As premiações de auditoria dependem da sua precisão nestes campos." />
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/10 shadow-3xl space-y-12">
                        <div className="grid grid-cols-1 gap-8">
                           <InputCard label="PREVISÃO CUSTO UNITÁRIO (CPP)" val={decisions.estimates.forecasted_unit_cost} icon={<Zap/>} onChange={(v:any)=>updateDecision('estimates.forecasted_unit_cost', v)} help={`Tolerância Oracle: $ ${currentMacro.award_values.cost_precision}`} />
                           <InputCard label="PREVISÃO FATURAMENTO (BRUTO)" val={decisions.estimates.forecasted_revenue} icon={<BarChart3/>} onChange={(v:any)=>updateDecision('estimates.forecasted_revenue', v)} help={`Tolerância Oracle: $ ${currentMacro.award_values.revenue_precision}`} />
                           <InputCard label="PREVISÃO LUCRO LÍQUIDO" val={decisions.estimates.forecasted_net_profit} icon={<PieChart/>} onChange={(v:any)=>updateDecision('estimates.forecasted_net_profit', v)} help={`Tolerância Oracle: $ ${currentMacro.award_values.profit_precision}`} />
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 8 - REVISÃO */}
               {activeStep === 7 && (
                  <div className="max-w-5xl mx-auto space-y-12">
                     <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse">
                           <ShieldCheck size={56} />
                        </div>
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Ready for Oracle Transmit</h2>
                        <p className="text-xl text-slate-400 font-medium italic">"Revise seu protocolo tático antes de selar o ciclo P0{round}."</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-8">
                           <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Resumo Comercial</h4>
                           <div className="space-y-4">
                              <SummaryLine label="Preço Médio" val={`$ ${Object.values(decisions.regions).reduce((a,b)=>a+(b.price||0), 0) / Math.max(1, Object.keys(decisions.regions).length)}`} />
                              <SummaryLine label="Total Marketing" val={`${Object.values(decisions.regions).reduce((a,b)=>a+(b.marketing||0), 0)} units`} />
                           </div>
                        </div>
                        <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-8">
                           <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Resumo Industrial</h4>
                           <div className="space-y-4">
                              <SummaryLine label="Uso Capacidade" val={`${decisions.production.activityLevel}%`} />
                              <SummaryLine label="Turno Extra" val={`${decisions.production.extraProductionPercent}%`} />
                              <SummaryLine label="Novos Ativos" val={`${decisions.machinery.buy.alfa + decisions.machinery.buy.beta + decisions.machinery.buy.gama} unidades`} />
                           </div>
                        </div>
                     </div>

                     <div className="p-10 bg-orange-600/10 border-2 border-orange-500/30 rounded-[3.5rem] space-y-6">
                        <div className="flex items-center gap-4 text-orange-500">
                           <AlertCircle size={24} />
                           <h3 className="text-xl font-black uppercase italic tracking-tight">Aviso de Governança</h3>
                        </div>
                        <p className="text-slate-300 font-medium leading-relaxed italic">
                           "As decisões podem ser alteradas livremente até o vencimento do TIMER DE ROUND. Decisões não seladas (em rascunho) serão ignoradas pelo motor Oracle no momento do Turnover, resultando em dados zerados para sua unidade."
                        </p>
                     </div>
                  </div>
               )}

            </motion.div>
         </AnimatePresence>

         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="floating-nav-btn left-8 transition-all active:scale-90"><ChevronLeft size={28} strokeWidth={3} /></button>
         {activeStep === STEPS.length - 1 ? (
           <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="floating-nav-btn-primary group">
              {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Rocket size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />} TRANSMITIR PARA ORACLE
           </button>
         ) : (
           <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="floating-nav-btn right-8 transition-all active:scale-90"><ChevronRight size={28} strokeWidth={3} /></button>
         )}
      </div>
    </div>
  );
};

const WizardStepHeader = ({ icon, title, desc }: any) => (
   <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 shadow-2xl flex items-center gap-8">
      <div className="p-5 bg-orange-600 rounded-3xl text-white shadow-xl">{React.cloneElement(icon, { size: 32 })}</div>
      <div>
         <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{desc}</p>
      </div>
   </div>
);

const SummaryLine = ({ label, val }: any) => (
   <div className="flex justify-between items-center border-b border-white/5 pb-2">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-white italic">{val}</span>
   </div>
);

const InputCard = ({ label, val, icon, onChange, help }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all group shadow-inner">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors">{icon}</div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
           {/* Fix: Wrapped HelpCircle in span with title prop because Lucide icons don't support title directly */}
           {label} {help && <span title={help}><HelpCircle size={10} className="opacity-40" /></span>}
        </label>
     </div>
     <input type="number" value={val} onChange={e => onChange?.(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner" />
  </div>
);

const RangeInput = ({ label, val, color, onChange, help }: any) => (
   <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
         <label className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-2 italic tracking-widest">
            {/* Fix: Wrapped HelpCircle in span with title prop because Lucide icons don't support title directly */}
            {label} {help && <span title={help}><HelpCircle size={10} className="opacity-40" /></span>}
         </label>
         <span className={`text-xl font-black italic font-mono ${color === 'blue' ? 'text-blue-500' : color === 'orange' ? 'text-orange-500' : 'text-emerald-500'}`}>{val}%</span>
      </div>
      <input type="range" min="0" max="100" value={val || 0} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-900 accent-orange-500" />
   </div>
);

export default DecisionForm;