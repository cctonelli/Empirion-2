
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
  Award
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase, getUserProfile } from '../services/supabase';
import { DecisionData, Branch, Championship, MachineModel, MacroIndicators, Team } from '../types';
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

  // 1. CARGA INICIAL E PERSISTÊNCIA (HYDRATION)
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
            production: { ...prev.production, term_interest_rate: 0.00 } // Default Juros Venda
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

  // Preço auditado baseado no Chronograma do Round Anterior (P00 para Decisão P01)
  const getAdjustedMachinePrice = (model: MachineModel) => {
    const specs = currentMacro.machine_specs?.[model] || DEFAULT_MACRO.machine_specs[model];
    const base = specs.initial_value;
    const lookupRound = Math.max(0, round - 1);
    const rules = activeArena?.round_rules?.[lookupRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[lookupRound] || {};
    const adjust = rules[`machine_${model === 'alfa' ? 'alpha' : model === 'beta' ? 'beta' : 'gamma'}_price_adjust`] || 1.0;
    return base * adjust;
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

  const isBuyingMachines = (decisions.machinery.buy.alfa || 0) + (decisions.machinery.buy.beta || 0) + (decisions.machinery.buy.gama || 0) > 0;

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
                           className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 ${!decisions.judicial_recovery ? 'bg-orange-600 border-orange-400 text-white shadow-2xl' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-orange-500/20'}`}
                        >
                           <ShieldCheck size={40} />
                           <div className="text-center">
                              <span className="block font-black uppercase tracking-widest">Arena Padrão</span>
                              <p className="text-[10px] mt-2 opacity-70">Operação normal sem restrições de crédito.</p>
                           </div>
                        </button>
                        <button 
                           onClick={() => updateDecision('judicial_recovery', true)}
                           className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 ${decisions.judicial_recovery ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_40px_rgba(225,29,72,0.3)]' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-rose-500/20'}`}
                        >
                           <Scale size={40} />
                           <div className="text-center">
                              <span className="block font-black uppercase tracking-widest">Protocolo RJ</span>
                              <p className="text-[10px] mt-2 opacity-70">Recuperação Judicial: Crédito e Capex Limitados.</p>
                           </div>
                        </button>
                     </div>
                  </div>
               )}

               {/* CARD 2: COMERCIAL */}
               {activeStep === 1 && (
                  <div className="space-y-12">
                     <div className="flex justify-between items-end bg-slate-900/60 p-10 rounded-[4rem] border border-white/5 shadow-2xl">
                        <div className="space-y-2">
                           <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4"><Megaphone className="text-orange-500" /> Regiões de Vendas</h3>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configure preço, prazo e campanhas de marketing.</p>
                        </div>
                        <button onClick={replicateRegion} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3 shadow-lg active:scale-95">
                           <RefreshCw size={14} /> Replicar em Cluster
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Object.entries(decisions.regions).map(([id, reg]: [any, any]) => {
                           const regionName = activeArena?.region_names?.[id - 1] || activeArena?.region_configs?.[id-1]?.name || `Região ${id}`;
                           return (
                              <div key={id} className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-10 hover:border-orange-500/30 transition-all group shadow-xl">
                                 <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-xs font-black text-orange-500 uppercase italic">{regionName}</span>
                                    <HelpCircle size={14} className="text-slate-700 cursor-help hover:text-orange-500" />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Preço Unitário ($)</label>
                                    <input 
                                       type="number" 
                                       value={reg.price || 0} 
                                       onChange={e => updateDecision(`regions.${id}.price`, parseFloat(e.target.value))}
                                       className="w-full bg-slate-950 border-2 border-white/5 rounded-[1.5rem] p-6 text-3xl font-mono font-black text-white outline-none focus:border-orange-600 transition-all"
                                    />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Fluxo de Recebimento</label>
                                    <select 
                                       value={reg.term || 0} 
                                       onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))}
                                       className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-4 text-[10px] font-black text-white uppercase outline-none focus:border-orange-600"
                                    >
                                       <option value={0}>A VISTA</option>
                                       <option value={1}>50% / 50%</option>
                                       <option value={2}>33% / 33% / 33%</option>
                                    </select>
                                 </div>
                                 <InputCard 
                                    label="Unidades de Marketing (0-9)" 
                                    val={reg.marketing || 0} 
                                    onChange={(v:any)=>updateDecision(`regions.${id}.marketing`, Math.min(9, Math.max(0, v)))} 
                                    icon={<Megaphone size={14}/>} 
                                 />
                              </div>
                           );
                        })}
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
                                 <InputCard label="MP-A (Qtde)" val={decisions.production.purchaseMPA} onChange={(v:any)=>updateDecision('production.purchaseMPA', v)} icon={<Box size={16}/>} />
                                 <InputCard label="MP-B (Qtde)" val={decisions.production.purchaseMPB} onChange={(v:any)=>updateDecision('production.purchaseMPB', v)} icon={<Box size={16}/>} />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2 flex items-center gap-2">Fluxo Pagamento Fornecedor <HelpCircle size={10}/></label>
                                 <div className="grid grid-cols-3 gap-4">
                                    {['A VISTA', '50 / 50', '33/33/33'].map((l, i) => (
                                       <button key={l} onClick={() => updateDecision('production.paymentType', i)} className={`py-5 rounded-2xl text-[10px] font-black uppercase border transition-all ${decisions.production.paymentType === i ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl scale-[1.02]' : 'bg-slate-950 border-white/5 text-slate-500'}`}>{l}</button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                           <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 h-full">
                              <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4"><Activity className="text-blue-400"/> Produtividade</h3>
                              <div className="space-y-10 py-4">
                                 <RangeInput label="Uso da Capacidade (%)" val={decisions.production.activityLevel} color="blue" onChange={(v:any)=>updateDecision('production.activityLevel', v)} />
                                 <RangeInput label="Turno Extra (%)" val={decisions.production.extraProductionPercent} color="orange" onChange={(v:any)=>updateDecision('production.extraProductionPercent', v)} />
                                 <RangeInput label="Investimento P&D (%)" val={decisions.production.rd_investment} color="indigo" onChange={(v:any)=>updateDecision('production.rd_investment', v)} />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputCard label="Meta Lucro Líquido (%)" val={decisions.production.net_profit_target_percent} onChange={(v:any)=>updateDecision('production.net_profit_target_percent', v)} icon={<Target size={16}/>} />
                        <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-white/5 space-y-4 shadow-xl">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2 flex items-center gap-2">Juros Venda a Prazo (%) <HelpCircle size={10}/></label>
                           <input 
                              type="number" step="0.01"
                              value={decisions.production.term_interest_rate || 0.00} 
                              onChange={e => updateDecision('production.term_interest_rate', parseFloat(e.target.value))}
                              className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-3xl font-mono font-black text-orange-500 outline-none focus:border-orange-600 transition-all"
                           />
                           <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest italic">Aplica-se ao saldo financiado aos clientes por período.</p>
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
                        <p className="text-slate-400 italic">Equilibre headcount e motivação para garantir o nível de atividade.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputCard label="Novas Admissões" val={decisions.hr.hired} onChange={(v:any)=>updateDecision('hr.hired', v)} icon={<UserPlus size={20}/>} />
                        <InputCard label="Desligamentos" val={decisions.hr.fired} onChange={(v:any)=>updateDecision('hr.fired', v)} icon={<MinusCircle size={20}/>} />
                        <InputCard label="Piso Salarial ($)" val={decisions.hr.salary} onChange={(v:any)=>updateDecision('hr.salary', v)} icon={<Wallet size={20}/>} />
                     </div>
                  </div>
               )}

               {/* CARD 5: ATIVOS (CAPEX & DESINVESTIMENTO) */}
               {activeStep === 4 && (
                  <div className="space-y-20">
                     <div className="bg-slate-900/60 p-12 rounded-[5rem] border border-white/5 space-y-12 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-white/5 pb-10">
                           <div className="space-y-1">
                              <h3 className="text-4xl font-black text-white uppercase italic flex items-center gap-6"><TrendingUp className="text-emerald-500" /> Expansão CAPEX</h3>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aquisição de novos ativos para o ciclo P0{round}.</p>
                           </div>
                           <div className="px-6 py-3 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-full font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2">
                              <Info size={14}/> Preços Auditados P0{round}
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                           <MachineBuyCard model="ALFA" icon={<Cpu/>} cap="2.000" ops="94" price={getAdjustedMachinePrice('alfa')} val={decisions.machinery.buy.alfa} onChange={(v:any)=>updateDecision('machinery.buy.alfa', v)} round={round} />
                           <MachineBuyCard model="BETA" icon={<Cpu/>} cap="6.000" ops="235" price={getAdjustedMachinePrice('beta')} val={decisions.machinery.buy.beta} onChange={(v:any)=>updateDecision('machinery.buy.beta', v)} round={round} />
                           <MachineBuyCard model="GAMA" icon={<Cpu/>} cap="12.000" ops="445" price={getAdjustedMachinePrice('gama')} val={decisions.machinery.buy.gama} onChange={(v:any)=>updateDecision('machinery.buy.gama', v)} round={round} />
                        </div>
                     </div>

                     <div className="bg-slate-950/80 p-12 rounded-[5rem] border border-white/10 space-y-12 shadow-inner">
                        <div className="flex justify-between items-center border-b border-white/10 pb-10">
                           <div className="space-y-1">
                              <h3 className="text-4xl font-black text-white uppercase italic flex items-center gap-6"><TrendingDown className="text-rose-500" /> Desinvestimento</h3>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Venda de ativos da frota atual da Unidade.</p>
                           </div>
                           <div className="px-6 py-3 bg-rose-600/10 border border-rose-500/30 text-rose-500 rounded-full font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2 shadow-lg">
                              <AlertOctagon size={16}/> Deságio Venda: {currentMacro.machine_sale_discount || 10}%
                           </div>
                        </div>

                        {/* LISTAGEM DE MÁQUINAS REAIS DA EQUIPE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                           {activeTeam?.kpis?.fleet && activeTeam.kpis.fleet.length > 0 ? (
                              ['alfa', 'beta', 'gama'].map(model => {
                                 const modelFleet = activeTeam.kpis.fleet.filter((m:any) => m.model === model);
                                 if (modelFleet.length === 0) return null;
                                 
                                 return (
                                    <div key={model} className="space-y-6 bg-slate-900 p-8 rounded-[3.5rem] border border-white/5 shadow-xl relative group">
                                       <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                          <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 font-black italic">{model[0].toUpperCase()}</div>
                                             <h4 className="text-xl font-black text-white uppercase italic">Máquinas {model}</h4>
                                          </div>
                                          <div className="relative group/help">
                                             <HelpCircle size={18} className="text-slate-700 hover:text-rose-500 cursor-help transition-all" />
                                             <div className="absolute bottom-full right-0 mb-4 w-64 p-6 bg-slate-950 border border-white/10 rounded-2xl text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed opacity-0 group-hover/help:opacity-100 transition-all pointer-events-none z-50 shadow-3xl">
                                                Insira a quantidade deste lote que deseja liquidar. A venda ocorre pelo VNR (Valor Depreciado) com {currentMacro.machine_sale_discount}% de deságio.
                                             </div>
                                          </div>
                                       </div>
                                       <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                          {modelFleet.map((m: any, idx: number) => (
                                             <div key={idx} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex justify-between items-center group-hover:border-rose-500/20 transition-all">
                                                <div className="flex flex-col">
                                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {m.id?.split('-').pop() || `M${idx}`}</span>
                                                   <span className="text-[9px] font-bold text-blue-400 uppercase">Idade: {m.age} Ciclos</span>
                                                </div>
                                                <div className="text-right">
                                                   <span className="block text-[8px] font-black text-slate-600 uppercase">VNR (Estimado)</span>
                                                   <span className="text-xs font-mono font-black text-emerald-500">$ {(m.depreciated_value || 0).toLocaleString()}</span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                       <div className="pt-6 border-t border-white/5">
                                          <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 block text-center italic">Quantidade a Vender</label>
                                          <input 
                                             type="number" 
                                             value={decisions.machinery.sell[model as MachineModel] || 0} 
                                             onChange={e => updateDecision(`machinery.sell.${model}`, Math.max(0, Math.min(modelFleet.length, parseInt(e.target.value) || 0)))}
                                             className="w-full bg-slate-950 border-2 border-white/10 rounded-[1.5rem] p-6 text-2xl font-black text-white text-center outline-none focus:border-rose-500 shadow-inner" 
                                             placeholder="0" 
                                          />
                                       </div>
                                    </div>
                                 );
                              })
                           ) : (
                              <div className="col-span-full py-20 text-center opacity-40">
                                 <Package size={48} className="mx-auto mb-4" />
                                 <p className="text-[10px] font-black uppercase tracking-widest italic">Nenhum ativo imobilizado registrado nesta unidade.</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {/* CARD 6: FINANÇAS */}
               {activeStep === 5 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-12 rounded-[5rem] border border-white/5 shadow-3xl space-y-12">
                        <h3 className="text-3xl font-black text-white uppercase italic text-center flex items-center justify-center gap-6"><Landmark className="text-blue-400" /> Captação & Reserva</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <div className="space-y-8 bg-slate-950/50 p-8 rounded-[3.5rem] border border-white/5">
                              <InputCard label="Requisição Empréstimo ($)" val={decisions.finance.loanRequest} onChange={(v:any)=>updateDecision('finance.loanRequest', v)} icon={<DollarSign size={20}/>} />
                              <div className="space-y-3 px-2">
                                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Plano de Amortização</label>
                                 <select 
                                    value={decisions.finance.loanTerm} 
                                    onChange={e => updateDecision('finance.loanTerm', parseInt(e.target.value))}
                                    className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-4 text-[10px] font-black text-white uppercase outline-none focus:border-blue-600"
                                 >
                                    <option value={0}>A VISTA (CURTO PRAZO)</option>
                                    <option value={1}>50/50 (MÉDIO PRAZO)</option>
                                    <option value={2}>33/33/33 (LONGO PRAZO)</option>
                                 </select>
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between mx-2">
                                 <span className="text-[9px] font-bold text-slate-500 uppercase">Juros TR (Spread):</span>
                                 <span className="text-xs font-black text-emerald-500 italic">{currentMacro.interest_rate_tr}% p.p.</span>
                              </div>
                           </div>
                           <div className="space-y-8 bg-slate-950/50 p-8 rounded-[3.5rem] border border-white/5 flex flex-col justify-between">
                              <InputCard label="Aplicação Financeira ($)" val={decisions.finance.application} onChange={(v:any)=>updateDecision('finance.application', v)} icon={<TrendingUp size={20}/>} />
                              <div className="p-8 bg-slate-900 border-2 border-white/10 rounded-[2.5rem] space-y-4 shadow-inner">
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-600">
                                    <span>Rendimento Líquido</span>
                                    <span className="text-blue-400 italic">{currentMacro.investment_return_rate}% por período</span>
                                 </div>
                                 <p className="text-[9px] text-slate-500 leading-relaxed font-bold italic uppercase tracking-tighter">
                                    "O montante será debitado do caixa hoje e retornará com rendimentos no próximo ciclo em 'Resgate de Aplicação'."
                                 </p>
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
                        <p className="text-slate-400 italic">Preveja seu desempenho com precisão para ganhar Empire Points.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputCard label="Custo Unitário CPP ($)" val={decisions.estimates?.forecasted_unit_cost} onChange={(v:any)=>updateDecision('estimates.forecasted_unit_cost', v)} icon={<BarChart3 size={16}/>} />
                        <InputCard label="Receita Bruta ($)" val={decisions.estimates?.forecasted_revenue} onChange={(v:any)=>updateDecision('estimates.forecasted_revenue', v)} icon={<TrendingUp size={16}/>} />
                        <InputCard label="Lucro Líquido Total ($)" val={decisions.estimates?.forecasted_net_profit} onChange={(v:any)=>updateDecision('estimates.forecasted_net_profit', v)} icon={<Coins size={16}/>} />
                     </div>
                     <div className="bg-orange-600/5 border-2 border-orange-500/20 p-10 rounded-[3.5rem] space-y-6 text-center shadow-xl">
                        <h4 className="text-xs font-black uppercase text-orange-500 tracking-[0.3em] italic flex items-center justify-center gap-3"><Award size={18}/> Protocolo Oracle Sniper Ativo</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold italic leading-relaxed max-w-2xl mx-auto">
                           "Margens de erro menores que 5% nestas projeções desbloqueiam badges exclusivas no ranking global."
                        </p>
                     </div>
                  </div>
               )}

               {/* CARD 8: FINALIZAR */}
               {activeStep === 7 && (
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="bg-slate-900 p-16 rounded-[5rem] border border-white/5 shadow-3xl space-y-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><ShieldCheck size={200}/></div>
                        <div className="text-center space-y-4 relative z-10">
                           <ShieldCheck size={80} className="text-emerald-500 mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]" strokeWidth={2.5} />
                           <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Selo de Transmissão</h2>
                           <p className="text-slate-500 font-bold uppercase tracking-widest italic">Prepare sua unidade para o Turnover P0{round}</p>
                        </div>
                        
                        <div className="bg-slate-950/80 p-10 rounded-[3.5rem] border border-white/10 space-y-8 relative z-10 shadow-inner">
                           <h4 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">Resumo Tático P0{round}</h4>
                           <div className="grid grid-cols-2 gap-y-6 text-xs font-black uppercase italic">
                              <span className="text-slate-500 tracking-wider">Expansão de Ativos:</span>
                              <span className={`text-right ${isBuyingMachines ? 'text-emerald-400' : 'text-slate-400'}`}>{isBuyingMachines ? 'SOLICITADA' : 'ESTÁVEL'}</span>
                              <span className="text-slate-500 tracking-wider">Capex em Máquinas:</span>
                              <span className="text-white text-right">$ {((decisions.machinery.buy.alfa || 0) * getAdjustedMachinePrice('alfa') + (decisions.machinery.buy.beta || 0) * getAdjustedMachinePrice('beta') + (decisions.machinery.buy.gama || 0) * getAdjustedMachinePrice('gama')).toLocaleString()}</span>
                              <span className="text-slate-500 tracking-wider">Captação de Crédito:</span>
                              <span className="text-white text-right">$ {(decisions.finance.loanRequest || 0).toLocaleString()}</span>
                           </div>
                        </div>

                        <div className="bg-rose-600/10 border-2 border-rose-500/30 p-10 rounded-[3.5rem] space-y-6 relative z-10">
                           <div className="flex items-center gap-6 text-rose-500">
                              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg"><AlertOctagon size={24} /></div>
                              <span className="text-sm font-black uppercase tracking-[0.2em] italic">Aviso Crítico de Sincronização</span>
                           </div>
                           <p className="text-[11px] text-slate-300 leading-relaxed font-bold italic uppercase tracking-tighter">
                              "As decisões podem ser alteradas até antes de vencer o cronômetro. Se não houver transmissão dentro do prazo, a equipe será eliminada por W.O. (dados zerados)."
                           </p>
                        </div>
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

const InputCard = ({ label, val, icon, onChange, info }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all group shadow-inner">
     <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors">{icon}</div>
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label>
        </div>
        <HelpCircle size={12} className="text-slate-700 hover:text-slate-400 cursor-help transition-colors" />
     </div>
     <input type="number" value={val || 0} onChange={e => onChange?.(Math.max(0, Number(e.target.value)))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner group-hover:bg-slate-900 transition-all" />
  </div>
);

const RangeInput = ({ label, val, color, onChange, info, min = 0, max = 100 }: any) => (
   <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
         <label className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-2 italic tracking-widest">{label} <HelpCircle size={10} className="text-slate-700"/></label>
         <span className={`text-xl font-black italic font-mono ${color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : color === 'orange' ? 'text-orange-500' : 'text-indigo-500'}`}>{val}%</span>
      </div>
      <div className="relative pt-2">
         <input 
            type="range" min={min} max={max}
            value={val || 0} 
            onChange={e => onChange(Number(e.target.value))} 
            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-900 transition-all`} 
            style={{ 
               accentColor: color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'orange' ? '#f97316' : '#6366f1',
               background: `linear-gradient(to right, ${color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'orange' ? '#f97316' : '#6366f1'} 0%, ${color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'orange' ? '#f97316' : '#6366f1'} ${((val-min)/(max-min))*100}%, #0f172a ${((val-min)/(max-min))*100}%, #0f172a 100%)`
            }} 
         />
      </div>
      {info && <p className="text-[8px] text-slate-600 uppercase tracking-[0.2em] italic font-bold">{info}</p>}
   </div>
);

const MachineBuyCard = ({ model, cap, ops, price, val, onChange, icon, round }: any) => (
   <div className="bg-slate-950/80 p-8 rounded-[3rem] border border-white/5 space-y-6 group hover:border-orange-500/30 transition-all shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Cpu size={60}/></div>
      <div className="flex justify-between items-start relative z-10">
         <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-lg">{icon}</div>
         <div className="text-right">
            <h5 className="text-xl font-black text-white italic tracking-tighter">MÁQUINA {model}</h5>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{val > 0 ? 'Expansão Nodal' : 'Operacional Base'}</span>
         </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-white/5 relative z-10">
         <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter"><span>Capacidade</span><span className="text-white">{cap} UN a 100%</span></div>
         <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter"><span>Operadores</span><span className="text-white">{ops} Units</span></div>
         <div className="flex justify-between text-[9px] text-slate-600 font-black uppercase tracking-tighter pt-2 border-t border-white/5"><span>Preço Unit. P0{round}</span><span className="text-emerald-500 font-black italic">$ {price.toLocaleString()}</span></div>
      </div>
      <div className="relative group/input z-10">
         <input type="number" value={val || 0} onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl p-4 text-center text-white font-black text-xl outline-none focus:border-orange-500 focus:bg-slate-950 transition-all" placeholder="0" />
         <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity"><Zap size={14} className="text-orange-500" /></div>
      </div>
   </div>
);

export default DecisionForm;
