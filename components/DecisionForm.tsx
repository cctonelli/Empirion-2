
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  ArrowRight, ArrowLeft, ShieldCheck, Activity, 
  Save, Sparkles, Package, Cpu, ChevronRight, Target, 
  TrendingUp, Landmark, Cloud, HardDrive, AlertCircle, 
  ShieldAlert, Gavel, Trash2, ShoppingCart, Info, Award,
  Zap, HelpCircle, ArrowUpCircle, ArrowDownCircle, MapPin,
  Layers, Copy, CheckCircle2, ChevronLeft, Wallet, PieChart, TrendingDown,
  Percent, HeartPulse
} from 'lucide-react';
import { saveDecisions, getChampionships } from '../services/supabase';
import { calculateProjections, sanitize } from '../services/simulation';
import { DecisionData, Branch, Championship, ProjectionResult, EcosystemConfig, MachineModel, MacroIndicators } from '../types';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const STEPS = [
  { id: 'legal', label: '1. JURÍDICO', icon: Gavel },
  { id: 'marketing', label: '2. COMERCIAL', icon: Megaphone },
  { id: 'production', label: '3. OPERAÇÕES', icon: Factory },
  { id: 'hr', label: '4. TALENTOS', icon: Users2 },
  { id: 'assets', label: '5. ATIVOS', icon: Cpu },
  { id: 'finance', label: '6. FINANÇAS', icon: Landmark },
  { id: 'review', label: '7. FINALIZAR', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId, champId, round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRegion, setActiveRegion] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 0, misc: 0, sales_staff_count: 50 },
    production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 80, extraProductionPercent: 0, rd_investment: 0, net_profit_target_percent: 5.0, term_interest_rate: 1.5 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanTerm: 1, application: 0 },
    estimates: { forecasted_revenue: 0, forecasted_unit_cost: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    const fetchContext = async () => {
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(a => a.id === champId);
        if (found) {
          setActiveArena(found);
          const initialRegions: any = {};
          const defaultPrice = sanitize(found.market_indicators?.avg_selling_price, 375);
          for (let i = 1; i <= (found.regions_count || 4); i++) {
            initialRegions[i] = { price: defaultPrice, term: 1, marketing: 0 };
          }
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      }
    };
    fetchContext();
  }, [champId]);

  const activeTeamName = useMemo(() => {
    return activeArena?.teams?.find(t => t.id === teamId)?.name || 'ALPHA';
  }, [activeArena, teamId]);

  const machinePrices = useMemo(() => {
    if (!activeArena) return { alfa: 0, beta: 0, gama: 0, desagio: 0 };
    const getAdjusted = (model: MachineModel) => {
      const base = sanitize(activeArena.market_indicators.machinery_values?.[model], 500000);
      const keyPart = model === 'alfa' ? 'alpha' : model === 'gama' ? 'gamma' : 'beta';
      let adj = base;
      for (let r = 0; r < round; r++) {
        const rate = sanitize(activeArena.round_rules?.[r]?.[`machine_${keyPart}_price_adjust`] ?? 
                     activeArena.market_indicators[`machine_${keyPart}_price_adjust`], 0);
        adj *= (1 + rate / 100);
      }
      return adj;
    };
    return {
      alfa: getAdjusted('alfa'),
      beta: getAdjusted('beta'),
      gama: getAdjusted('gama'),
      desagio: sanitize(activeArena.market_indicators.machine_sale_discount, 10)
    };
  }, [activeArena, round]);

  const projections: ProjectionResult | null = useMemo(() => {
    if (!activeArena) return null;
    const eco = (activeArena.ecosystemConfig || { inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' }) as EcosystemConfig;
    return calculateProjections(decisions, branch as Branch, eco, activeArena.market_indicators, null, [], round, activeArena.round_rules, undefined, activeArena);
  }, [decisions, activeArena, round]);

  const rating = projections?.health?.rating || 'AAA';

  const updateDecision = (path: string, val: any) => {
    const keys = path.split('.');
    setDecisions(prev => {
      const next = { ...prev };
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      const safeVal = (typeof val === 'number') ? sanitize(val) : val;
      current[keys[keys.length - 1]] = safeVal;
      return next;
    });
  };

  const syncAllRegions = () => {
    const source = decisions.regions[activeRegion];
    const nextRegions = { ...decisions.regions };
    Object.keys(nextRegions).forEach(key => {
      nextRegions[Number(key)] = { ...source };
    });
    setDecisions(prev => ({ ...prev, regions: nextRegions }));
  };

  const handleTransmit = async () => {
    if (!teamId || !champId) return;
    setIsSaving(true);
    try {
      const result = await saveDecisions(teamId, champId, round, decisions) as any;
      if (result.success) alert("TRANSMISSÃO CONCLUÍDA: Suas decisões foram seladas pelo motor Oracle.");
      else throw new Error(result.error);
    } catch (e: any) { alert(`FALHA NA TRANSMISSÃO: ${e.message}`); }
    finally { setIsSaving(false); }
  };

  if (!teamId || !champId) return <div className="h-full flex items-center justify-center text-slate-500 font-black uppercase text-xs">Node Ready...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900/10 rounded-[2.5rem] border border-white/5 overflow-hidden relative">
      <div className="bg-slate-950 px-8 py-3 flex items-center justify-between border-b border-orange-500/20 shrink-0">
         <div className="flex items-center gap-6">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${decisions.judicial_recovery ? 'bg-rose-500 shadow-rose-500 animate-pulse' : 'bg-emerald-500 shadow-emerald-500'}`} />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Operador: <span className="text-orange-500">{activeTeamName}</span></span>
         </div>
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-5 py-1.5 bg-orange-600/10 rounded-full border border-orange-500/30 shadow-lg">
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Oracle Health:</span>
               <span className="text-[12px] font-mono font-black text-white">{rating}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[10px] font-black text-white uppercase italic tracking-widest">Turnover Ciclo 0{round}</span>
         </div>
      </div>

      <nav className="flex p-1 gap-1 bg-slate-900 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar shadow-inner">
         {STEPS.map((s, idx) => (
           <button 
            key={s.id} 
            onClick={() => setActiveStep(idx)} 
            className={`flex-1 min-w-[110px] py-3 px-2 rounded-2xl transition-all flex flex-col items-center gap-1.5 border ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white shadow-xl shadow-orange-600/20 scale-[1.02] z-10' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/20'}`}
           >
              <s.icon size={14} strokeWidth={3} />
              <span className="text-[8px] font-black uppercase tracking-tighter text-center whitespace-nowrap">{s.label}</span>
           </button>
         ))}
      </nav>

      <div ref={scrollContainerRef} className="flex-1 overflow-hidden bg-slate-950/40 relative">
         <AnimatePresence mode="wait">
            <motion.div 
               key={activeStep} 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} 
               className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 pb-32"
            >
               {activeStep === 0 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-10 max-w-4xl mx-auto py-10">
                     <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} className={`p-8 rounded-[3rem] border-4 shadow-2xl transition-all ${decisions.judicial_recovery ? 'bg-rose-600 border-rose-400 text-white shadow-rose-600/20' : 'bg-slate-900 border-emerald-500 text-emerald-500 shadow-emerald-500/10'}`}>
                        <Gavel size={64} strokeWidth={2.5} />
                     </motion.div>
                     <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Status de Solvência</h2>
                        <p className="text-slate-400 text-sm font-medium italic leading-relaxed">"A Recuperação Judicial bloqueia CAPEX e empréstimos, mas protege seus ativos contra liquidação imediata."</p>
                     </div>
                     <div className="flex gap-6 w-full max-w-2xl">
                        <button onClick={() => updateDecision('judicial_recovery', false)} className={`flex-1 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] border-2 transition-all ${!decisions.judicial_recovery ? 'bg-emerald-600 text-white border-emerald-400 shadow-xl' : 'bg-slate-900 border-white/5 text-slate-600'}`}>Arena Padrão</button>
                        <button onClick={() => updateDecision('judicial_recovery', true)} className={`flex-1 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] border-2 transition-all ${decisions.judicial_recovery ? 'bg-rose-600 text-white border-rose-400 shadow-xl' : 'bg-slate-900 border-white/5 text-slate-600'}`}>Protocolo RJ</button>
                     </div>
                  </div>
               )}

               {activeStep === 1 && (
                  <div className="flex flex-col lg:flex-row h-full gap-8">
                     <div className="w-full lg:w-[320px] flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-white/5 pb-6 lg:pb-0 lg:pr-6 overflow-y-auto custom-scrollbar shrink-0 max-h-[300px] lg:max-h-full">
                        <div className="sticky top-0 bg-[#020617]/80 backdrop-blur-md z-10 pb-4 border-b border-white/5 mb-4">
                           <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] flex items-center gap-3"><MapPin size={16} /> Regiões de Venda</h3>
                        </div>
                        {Object.keys(decisions.regions).map((id) => {
                           const regId = Number(id);
                           const regName = activeArena?.region_names?.[regId-1] || `Região 0${regId}`;
                           const data = decisions.regions[regId];
                           const isActive = activeRegion === regId;
                           return (
                              <button key={regId} onClick={() => setActiveRegion(regId)} className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-1 group relative overflow-hidden ${isActive ? 'bg-orange-600 border-orange-400 shadow-2xl scale-[1.02]' : 'bg-slate-900 border-white/10 hover:border-white/30 hover:bg-slate-800'}`}>
                                 <div className="flex justify-between items-center relative z-10">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-600'}`}>ID 0{regId}</span>
                                    <span className={`text-sm font-mono font-black ${isActive ? 'text-white' : 'text-emerald-500'}`}>$ {sanitize(data?.price, 375)}</span>
                                 </div>
                                 <h4 className={`text-md font-black uppercase truncate italic ${isActive ? 'text-white' : 'text-slate-200'}`}>{regName}</h4>
                              </button>
                           );
                        })}
                     </div>
                     <div className="flex-1 space-y-8 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[3.5rem] border border-white/10 shadow-2xl">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white font-black italic shadow-xl text-3xl">R{activeRegion}</div>
                              <div>
                                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em]">Edição Ativa</span>
                                 <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mt-1">{activeArena?.region_names?.[activeRegion-1] || `Região ${activeRegion}`}</h4>
                              </div>
                           </div>
                           <button onClick={syncAllRegions} className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white hover:text-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 shadow-xl"><Copy size={16} /> Replicar em Cluster</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                           <InputCard label="Preço Unitário ($)" val={sanitize(decisions.regions[activeRegion]?.price, 375)} onChange={(v: number) => updateDecision(`regions.${activeRegion}.price`, v)} icon={<DollarSign size={24}/>} />
                           <SelectCard label="Prazo de Venda" val={decisions.regions[activeRegion]?.term || 1} onChange={(v: number) => updateDecision(`regions.${activeRegion}.term`, v)} options={[{v:0,l:'À VISTA'},{v:1,l:'50/50'},{v:2,l:'33/33/33'}]} icon={<Landmark size={24} />} />
                           <div className="md:col-span-2 bg-slate-900 border border-white/10 rounded-[3.5rem] p-10 flex flex-col gap-6 shadow-2xl">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-5">
                                    <div className="p-4 bg-orange-600/20 text-orange-500 rounded-2xl shadow-inner"><Sparkles size={32} /></div>
                                    <div><label className="text-[12px] font-black text-white uppercase tracking-widest">Investimento em Marketing Regional</label><p className="text-[10px] text-slate-500 font-bold uppercase italic mt-1">Escala 0 a 9</p></div>
                                 </div>
                                 <span className="text-6xl font-black text-orange-500 italic">{sanitize(decisions.regions[activeRegion]?.marketing, 0)}</span>
                              </div>
                              <input type="range" min="0" max="9" step="1" value={sanitize(decisions.regions[activeRegion]?.marketing, 0)} onChange={e => updateDecision(`regions.${activeRegion}.marketing`, Number(e.target.value))} className="w-full h-3 bg-slate-950 rounded-full appearance-none cursor-pointer accent-orange-600 border border-white/5" />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 2 && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-full">
                       <InputCard label="Matéria-Prima A (QTDE)" val={decisions.production.purchaseMPA} onChange={(v: number) => updateDecision('production.purchaseMPA', v)} icon={<Package size={24}/>} />
                       <InputCard label="Matéria-Prima B (QTDE)" val={decisions.production.purchaseMPB} onChange={(v: number) => updateDecision('production.purchaseMPB', v)} icon={<Package size={24}/>} />
                       <SelectCard label="Fluxo Pagamento Fornecedor" val={decisions.production.paymentType} onChange={(v: number) => updateDecision('production.paymentType', v)} options={[{v:0,l:'À VISTA'},{v:1,l:'50/50'},{v:2,l:'33/33/33'}]} icon={<DollarSign size={24}/>} />
                       <InputCard label="Uso da Capacidade %" val={decisions.production.activityLevel} onChange={(v: number) => updateDecision('production.activityLevel', v)} icon={<Activity size={24}/>} />
                       <InputCard label="Turno Extra (%)" val={decisions.production.extraProductionPercent} onChange={(v: number) => updateDecision('production.extraProductionPercent', v)} icon={<Zap size={24}/>} />
                       <InputCard label="Investimento P&D (%)" val={decisions.production.rd_investment} onChange={(v: number) => updateDecision('production.rd_investment', v)} icon={<Percent size={24}/>} />
                       <InputCard label="Meta Lucro Líquido (%)" val={decisions.production.net_profit_target_percent} onChange={(v: number) => updateDecision('production.net_profit_target_percent', v)} icon={<Target size={24}/>} />
                       <InputCard label="Juros Venda a Prazo (%)" val={decisions.production.term_interest_rate} onChange={(v: number) => updateDecision('production.term_interest_rate', v)} icon={<Percent size={24}/>} />
                    </div>
                    <div className="bg-indigo-600/10 border-2 border-indigo-500/30 p-8 rounded-[3rem] flex gap-8 items-center shadow-2xl">
                       <Sparkles size={48} className="text-indigo-400 shrink-0" />
                       <div>
                          <h4 className="text-sm font-black text-indigo-100 uppercase tracking-widest italic">Vantagem Tecnológica Oracle</h4>
                          <p className="text-xs text-slate-400 font-medium italic leading-relaxed mt-2 uppercase tracking-tight">"A meta de lucratividade orienta os algoritmos de Market Share sobre o seu apetite por margem vs volume. Planeje com precisão."</p>
                       </div>
                    </div>
                  </div>
               )}

               {activeStep === 3 && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-full pb-10">
                       <InputCard label="Novas Admissões" val={decisions.hr.hired} onChange={(v: number) => updateDecision('hr.hired', v)} icon={<Users2 size={24}/>} />
                       <InputCard label="Desligamentos" val={decisions.hr.fired} onChange={(v: number) => updateDecision('hr.fired', v)} icon={<Users2 size={24}/>} />
                       <InputCard label="Piso Salarial ($)" val={decisions.hr.salary} onChange={(v: number) => updateDecision('hr.salary', v)} icon={<DollarSign size={24}/>} />
                       <InputCard label="Treinamento %" val={decisions.hr.trainingPercent} onChange={(v: number) => updateDecision('hr.trainingPercent', v)} icon={<Target size={24}/>} />
                       <InputCard label="Participação Lucros %" val={decisions.hr.participationPercent} onChange={(v: number) => updateDecision('hr.participationPercent', v)} icon={<Award size={24}/>} />
                       <div className="relative group">
                          <InputCard label="Prêmio Produtividade (%)" val={decisions.hr.misc} onChange={(v: number) => updateDecision('hr.misc', v)} icon={<Zap size={24} className="text-blue-500" />} />
                          <div className="absolute -top-2 -right-2 p-2 bg-slate-900 border border-white/10 rounded-full text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-help z-50">
                             <HelpCircle size={14} />
                             <div className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-slate-900 border border-blue-500/30 rounded-2xl text-[10px] font-medium text-slate-300 shadow-2xl pointer-events-none italic">
                                "Protocolo Strike Goal: Bônus binário sobre o salário base. Só é pago se a meta de produção (Uso da Capacidade + Turno Extra) for atingida. Isento de encargos sociais."
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="bg-blue-600/10 border-2 border-blue-500/20 p-8 rounded-[3rem] flex gap-6 items-center">
                       <Zap size={32} className="text-blue-400" />
                       <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest leading-relaxed">
                          Dica do Oráculo: O prêmio produtividade estimula a MOD a atingir as metas operacionais. Se a produção real falhar em relação à meta (Card 3), nada é pago.
                       </p>
                    </div>
                  </div>
               )}

               {activeStep === 4 && (
                  <div className="space-y-10 max-w-full pb-10">
                     <div className="p-8 bg-blue-600/10 border-2 border-blue-500/30 rounded-[3rem] flex gap-8 items-center shadow-2xl">
                        <Info size={48} className="text-blue-400 shrink-0" />
                        <p className="text-md font-black text-blue-100 italic leading-relaxed uppercase tracking-tight">"Protocolo BDI: 60% Financiado / 40% À Vista. 4 Rounds de carência (juros TR). Depreciação inicia no Ciclo P+1."</p>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6 bg-slate-900 p-10 rounded-[4rem] border-2 border-emerald-500/30 shadow-2xl">
                           <h4 className="text-2xl font-black uppercase text-emerald-500 tracking-tighter flex items-center gap-4 italic"><ShoppingCart size={28}/> Expansão CAPEX</h4>
                           <div className="grid grid-cols-1 gap-4">
                              <PriceInput label="Máquina ALFA" val={decisions.machinery.buy.alfa} price={machinePrices.alfa} onChange={(v: number) => updateDecision('machinery.buy.alfa', v)} />
                              <PriceInput label="Máquina BETA" val={decisions.machinery.buy.beta} price={machinePrices.beta} onChange={(v: number) => updateDecision('machinery.buy.beta', v)} />
                              <PriceInput label="Máquina GAMA" val={decisions.machinery.buy.gama} price={machinePrices.gama} onChange={(v: number) => updateDecision('machinery.buy.gama', v)} />
                           </div>
                        </div>
                        <div className="space-y-6 bg-slate-900 p-10 rounded-[4rem] border-2 border-rose-500/30 shadow-2xl">
                           <h4 className="text-2xl font-black uppercase text-rose-500 tracking-tighter flex items-center gap-4 italic"><Trash2 size={28}/> Desinvestimento</h4>
                           <div className="grid grid-cols-1 gap-4">
                              <PriceInput label="Venda ALFA" val={decisions.machinery.sell.alfa} price={machinePrices.alfa * (1 - machinePrices.desagio/100)} isSell desagio={machinePrices.desagio} onChange={(v: number) => updateDecision('machinery.sell.alfa', v)} />
                              <PriceInput label="Venda BETA" val={decisions.machinery.sell.beta} price={machinePrices.beta * (1 - machinePrices.desagio/100)} isSell desagio={machinePrices.desagio} onChange={(v: number) => updateDecision('machinery.sell.beta', v)} />
                              <PriceInput label="Venda GAMA" val={decisions.machinery.sell.gama} price={machinePrices.gama * (1 - machinePrices.desagio/100)} isSell desagio={machinePrices.desagio} onChange={(v: number) => updateDecision('machinery.sell.gama', v)} />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeStep === 5 && (
                  <div className="space-y-10 max-w-full pb-10">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                           <div className="bg-slate-900 border border-white/5 p-10 rounded-[4rem] shadow-2xl space-y-10">
                              <h3 className="text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-5">
                                 <Landmark size={32} className="text-blue-500"/> Alocação de Capital
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <InputCard label="Requisição de Empréstimo ($)" val={decisions.finance.loanRequest} onChange={(v: number) => updateDecision('finance.loanRequest', v)} icon={<DollarSign size={24}/>} />
                                 <SelectCard label="Fluxo de Pagamento (Amortização)" val={decisions.finance.loanTerm} onChange={(v: number) => updateDecision('finance.loanTerm', v)} options={[{v:0,l:'À VISTA (ROUND ATUAL)'},{v:1,l:'50/50 (CURTO PRAZO)'},{v:2,l:'33/33/33 (LONGO PRAZO)'}]} icon={<Activity size={24}/>} />
                                 <div className="md:col-span-2">
                                    <InputCard label="Aplicação Financeira ($)" val={decisions.finance.application} onChange={(v: number) => updateDecision('finance.application', v)} icon={<TrendingUp size={24}/>} placeholder="Investir excedente de caixa..." />
                                 </div>
                              </div>
                           </div>
                        </div>
                        <aside className="space-y-6">
                           <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-[3rem] space-y-6">
                              <h4 className="text-xs font-black uppercase text-blue-400 tracking-widest flex items-center gap-3"><Wallet size={16}/> Condições de Crédito</h4>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Taxa de Juros (TR)</span>
                                    <span className="text-lg font-mono font-black text-white">2.0%</span>
                                 </div>
                                 <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Multa Compulsório</span>
                                    <span className="text-lg font-mono font-black text-rose-500">15.0%</span>
                                 </div>
                              </div>
                           </div>
                        </aside>
                     </div>
                  </div>
               )}

               {activeStep === 6 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-12 max-w-5xl mx-auto py-10">
                     <div className="space-y-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-32 h-32 bg-orange-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl border-4 border-orange-400 mb-8">
                           <ShieldCheck size={64} className="text-white" />
                        </motion.div>
                        <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">Review Estratégico</h2>
                        <p className="text-slate-400 text-lg font-medium italic">"Revise seu protocolo tático antes de selar o ciclo."</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                        <ReviewBox label="Preço Médio" val={`$ ${(Object.values(decisions.regions).reduce((acc, r) => acc + sanitize(r.price, 375), 0) / Math.max(1, Object.keys(decisions.regions).length)).toFixed(2)}`} icon={<DollarSign size={16}/>} />
                        <ReviewBox label="Capacidade" val={`${sanitize(decisions.production.activityLevel, 80)}%`} icon={<Activity size={16}/>} />
                        <ReviewBox label="Contratações" val={sanitize(decisions.hr.hired, 0)} icon={<Users2 size={16}/>} />
                        <ReviewBox label="Empréstimo" val={`$ ${sanitize(decisions.finance.loanRequest, 0).toLocaleString()}`} icon={<Landmark size={16}/>} />
                     </div>
                  </div>
               )}
            </motion.div>
         </AnimatePresence>
         <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="floating-nav-btn left-8"><ChevronLeft size={28} strokeWidth={3} /></button>
         {activeStep === STEPS.length - 1 ? (
           <button disabled={isReadOnly || isSaving} onClick={handleTransmit} className="floating-nav-btn-primary">{isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} Transmitir para Oracle</button>
         ) : (
           <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="floating-nav-btn right-8"><ChevronRight size={28} strokeWidth={3} /></button>
         )}
      </div>
    </div>
  );
};

const ReviewBox = ({ label, val, icon }: any) => (
   <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] flex flex-col items-center gap-4 hover:border-orange-500/30 transition-all shadow-xl">
      <div className="p-3 bg-white/5 rounded-2xl text-orange-500">{icon}</div>
      <div>
         <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">{label}</span>
         <span className="text-xl font-black text-white italic">{val}</span>
      </div>
   </div>
);

const InputCard = ({ label, val, icon, onChange, placeholder }: any) => {
  const displayVal = (isNaN(val) || val === null || val === undefined) ? '' : val;
  return (
    <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all">
       <div className="flex items-center gap-4"><div className="text-slate-500">{icon}</div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label></div>
       <input type="number" value={displayVal} placeholder={placeholder || '0'} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600" />
    </div>
  );
};

const PriceInput = ({ label, val, price, isSell, desagio, onChange }: any) => {
  const upfront = isSell ? price : price * 0.4;
  const displayVal = (isNaN(val) || val === null || val === undefined) ? '' : val;
  return (
    <div className="bg-slate-950 border-2 border-white/5 rounded-[2rem] p-6 flex flex-col gap-4 group hover:border-blue-500/30 transition-all">
       <div className="flex justify-between items-start">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">{label}</label>
          <div className="text-right"><span className="block text-[8px] font-black text-slate-600 uppercase italic">P0 {isSell ? 'Deságio' : 'Mercado'}</span><span className="text-sm font-mono font-black text-white">$ {Math.round(price).toLocaleString()}</span></div>
       </div>
       <div className="flex items-center gap-5">
          <input type="number" value={displayVal} placeholder="0" onChange={e => onChange?.(Number(e.target.value))} className="w-24 bg-slate-900 border-2 border-white/5 rounded-xl px-4 py-4 text-white font-mono font-black text-2xl outline-none focus:border-blue-600" />
          <div className="flex-1 space-y-2">
             <div className="flex justify-between text-[8px] font-black uppercase tracking-widest"><span className="text-slate-500">{isSell ? 'Cash Inflow' : 'Entrada (40%)'}</span><span className="text-emerald-500">$ {Math.round(upfront * (val || 0)).toLocaleString()}</span></div>
          </div>
       </div>
    </div>
  );
};

const SelectCard = ({ label, val, options, icon, onChange }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 hover:border-orange-500/30 transition-all">
     <div className="flex items-center gap-4"><div className="text-slate-500">{icon}</div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label></div>
     <div className="relative">
        <select value={val} onChange={e => onChange?.(Number(e.target.value))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-black text-[12px] uppercase outline-none appearance-none cursor-pointer">
           {options.map((o: any) => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
        </select>
        <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 rotate-90" />
     </div>
  </div>
);

export default DecisionForm;
