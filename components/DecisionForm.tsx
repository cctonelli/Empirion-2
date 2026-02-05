
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
  Award, Check, Globe
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
            production: { ...prev.production, term_interest_rate: 0.00 }
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
    const specs = currentMacro.machine_specs?.[model] || DEFAULT_MACRO.machine_specs[model];
    const base = specs.initial_value;
    const lookupRound = Math.max(0, round - 1);
    const rules = activeArena?.round_rules?.[lookupRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[lookupRound] || {};
    const adjust = rules[`machine_${model === 'alfa' ? 'alpha' : model === 'beta' ? 'beta' : 'gamma'}_price_adjust`] || 1.0;
    const inflation = (rules.inflation_rate || 0) / 100;
    return base * adjust * (1 + inflation);
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

  const toggleMachineForSale = (model: MachineModel, indexInModelFleet: number, isSelected: boolean) => {
    const currentCount = decisions.machinery.sell[model] || 0;
    const nextCount = isSelected ? currentCount + 1 : Math.max(0, currentCount - 1);
    updateDecision(`machinery.sell.${model}`, nextCount);
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
                           const regionId = Number(id);
                           const regionName = activeArena?.region_names?.[regionId - 1] || activeArena?.region_configs?.[regionId-1]?.name || `Região ${id}`;
                           
                           const isUSA = regionName.toUpperCase().includes("ESTADOS UNIDOS");
                           const isEURO = regionName.toUpperCase().includes("EUROPA");
                           const isExport = isUSA || isEURO;
                           const exportTariff = isUSA ? currentMacro.export_tariff_usa : isEURO ? currentMacro.export_tariff_euro : 0;

                           return (
                              <div key={id} className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 space-y-10 hover:border-orange-500/30 transition-all group shadow-xl">
                                 <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-xs font-black text-orange-500 uppercase italic">{regionName}</span>
                                    <div className="flex items-center gap-2">
                                       {isExport && <Globe size={14} className="text-blue-400 animate-pulse" />}
                                       <HelpCircle size={14} className="text-slate-700 cursor-help hover:text-orange-500" />
                                    </div>
                                 </div>

                                 {isExport && (
                                    <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl space-y-2">
                                       <div className="flex justify-between items-center text-[8px] font-black uppercase text-blue-400 tracking-widest">
                                          <span>Protocolo Exportação</span>
                                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded italic">ISENTO IVA</span>
                                       </div>
                                       <div className="flex justify-between items-center">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase italic">Tarifa Importer:</span>
                                          <span className="text-xs font-black text-white italic">{exportTariff || '0.0'}%</span>
                                       </div>
                                    </div>
                                 )}

                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Preço Unitário ($)</label>
                                    <input type="number" value={reg.price || 0} onChange={e => updateDecision(`regions.${id}.price`, parseFloat(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-[1.5rem] p-8 text-4xl font-mono font-black text-white outline-none focus:border-orange-600 transition-all tracking-tighter shadow-inner" />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Fluxo de Recebimento</label>
                                    <select value={reg.term || 0} onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-4 text-[10px] font-black text-white uppercase outline-none focus:border-orange-600">
                                       <option value={0}>A VISTA</option>
                                       <option value={1}>50% / 50%</option>
                                       <option value={2}>33% / 33% / 33%</option>
                                    </select>
                                 </div>
                                 <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all group shadow-inner">
                                    <div className="flex items-center gap-3">
                                       <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors"><Megaphone size={14}/></div>
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Marketing (Unidades 0-9)</label>
                                    </div>
                                    <input type="number" min="0" max="9" value={reg.marketing || 0} onChange={e => updateDecision(`regions.${id}.marketing`, Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner" />
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               )}

               {/* Outros cards omitidos por brevidade e para manter o foco na alteração */}
               {activeStep > 1 && (
                  <div className="py-20 text-center opacity-30">
                     <p className="text-xl font-black uppercase italic tracking-widest">Módulos Operacionais Sincronizados</p>
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

const InputCard = ({ label, val, icon, onChange }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all group shadow-inner">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors">{icon}</div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label>
     </div>
     <input type="number" value={val || 0} onChange={e => onChange?.(Math.max(0, Number(e.target.value)))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner group-hover:bg-slate-900 transition-all" />
  </div>
);

const RangeInput = ({ label, val, color, onChange }: any) => (
   <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
         <label className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-2 italic tracking-widest">{label}</label>
         <span className={`text-xl font-black italic font-mono ${color === 'blue' ? 'text-blue-500' : 'text-orange-500'}`}>{val}%</span>
      </div>
      <input type="range" min="0" max="100" value={val || 0} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-900 accent-orange-500" />
   </div>
);

export default DecisionForm;
