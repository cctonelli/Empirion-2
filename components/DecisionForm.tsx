
import React, { useState, useMemo, useEffect } from 'react';
// Fix: Added missing Lucide icons (Globe, Boxes, Plus, Sparkles)
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, 
  TrendingUp, Activity, Box, AlertOctagon, 
  Zap, BarChart3, PieChart, Coins, Rocket, Info,
  HelpCircle, Scale, RefreshCw, Layers, Globe, Boxes, Plus, Sparkles
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase } from '../services/supabase';
import { DecisionData, Branch, Championship, MachineModel, MacroIndicators, Team, MachineInstance } from '../types';
import { calculateProjections } from '../services/simulation';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM, INITIAL_MACHINES_P00 } from '../constants';
import { formatCurrency } from '../utils/formatters';

const STEPS = [
  { id: 'legal', label: '1. JURÍDICO', icon: Gavel },
  { id: 'marketing', label: '2. COMERCIAL', icon: Megaphone },
  { id: 'production', label: '3. SUPRIMENTOS', icon: Package },
  { id: 'factory', label: '4. FÁBRICA', icon: Factory },
  { id: 'hr', label: '5. TALENTOS', icon: Users2 },
  { id: 'assets', label: '6. ATIVOS', icon: Cpu },
  { id: 'finance', label: '7. FINANÇAS', icon: Landmark },
  { id: 'goals', label: '8. METAS', icon: Target },
  { id: 'review', label: '9. ORÁCULO', icon: ShieldCheck },
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
    hr: { hired: 0, fired: 0, salary: 2000, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 100, extraProductionPercent: 0, rd_investment: 0, net_profit_target_percent: 0, term_interest_rate: 0.00 },
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
        if (found) setActiveArena(found);

        const team = found?.teams?.find(t => t.id === teamId);
        if (team) {
           // Se P00 e sem máquinas no banco, injeta o setup inicial fidelidade
           if (round === 1 && (!team.kpis?.machines || team.kpis.machines.length === 0)) {
              team.kpis = { ...team.kpis, machines: INITIAL_MACHINES_P00 as MachineInstance[] };
           }
           setActiveTeam(team);
        }

        const table = found?.is_trial ? 'trial_decisions' : 'current_decisions';
        const { data: draft } = await supabase.from(table).select('data').eq('team_id', teamId).eq('round', round).maybeSingle();

        const initialRegions: any = {};
        for (let i = 1; i <= (found?.regions_count || 1); i++) {
          initialRegions[i] = draft?.data?.regions?.[i] || { price: 425, term: 0, marketing: 0 };
        }

        if (draft?.data) {
          setDecisions({ ...draft.data, regions: initialRegions });
        } else {
          setDecisions(prev => ({ ...prev, regions: initialRegions }));
        }
      } catch (err) { console.error("Hydration Error:", err); } 
      finally { setIsLoadingDraft(false); }
    };
    initializeForm();
  }, [champId, teamId, round]);

  const currentMacro = useMemo(() => {
    if (!activeArena) return DEFAULT_MACRO;
    const rules = activeArena.round_rules?.[round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[round] || {};
    return { ...DEFAULT_MACRO, ...activeArena.market_indicators, ...rules } as MacroIndicators;
  }, [activeArena, round]);

  const projections = useMemo(() => {
    if (!activeTeam || !activeArena) return null;
    const eco = { inflation_rate: 0.01, demand_multiplier: 1, interest_rate: 0.02, market_volatility: 0.05, scenario_type: 'simulated' as any, modality_type: 'standard' as any };
    return calculateProjections(decisions, branch, eco, currentMacro, activeTeam);
  }, [decisions, activeTeam, activeArena, currentMacro]);

  const updateDecision = (path: string, val: any) => {
    if (isReadOnly) return;
    const keys = path.split('.');
    setDecisions(prev => {
      const next = JSON.parse(JSON.stringify(prev));
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
    } catch (err: any) { alert(`FALHA NA TRANSMISSÃO: ${err.message}`); } 
    finally { setIsSaving(false); }
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
           <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[100px] py-3 px-2 rounded-2xl transition-all flex flex-col items-center gap-1.5 border ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white shadow-xl scale-[1.02] z-10' : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300'}`}>
              <s.icon size={12} strokeWidth={3} />
              <span className="text-[7px] font-black uppercase tracking-tighter text-center">{s.label}</span>
           </button>
         ))}
      </nav>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
         
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 pb-32">
            <AnimatePresence mode="wait">
               <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  
                  {/* STEP 2: COMERCIAL */}
                  {activeStep === 1 && (
                     <div className="space-y-10">
                        <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 flex justify-between items-center shadow-xl">
                           <div className="space-y-2">
                              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4"><Megaphone className="text-orange-500" /> Regional Nodes</h3>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Ajuste os parâmetros de venda para cada região.</p>
                           </div>
                           <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-xl">
                              <Info size={14} className="text-blue-400" />
                              <span className="text-[8px] font-black text-slate-400 uppercase italic">Referência Global: $ {currentMacro.avg_selling_price}</span>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                           {Object.entries(decisions.regions).map(([id, reg]: [any, any]) => (
                              <div key={id} className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 space-y-8 hover:border-orange-500/30 transition-all shadow-xl group">
                                 <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-xs font-black text-orange-500 uppercase italic">Região 0{id}</span>
                                    <Globe size={14} className="text-slate-700" />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Preço Unitário ($)</label>
                                    <input type="number" value={reg.price} onChange={e => updateDecision(`regions.${id}.price`, parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-6 text-2xl font-mono font-black text-white outline-none focus:border-orange-600 transition-all" />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">MKT (Unidades 0-9)</label>
                                    <input type="number" min="0" max="9" value={reg.marketing} onChange={e => updateDecision(`regions.${id}.marketing`, Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))} className="w-full bg-slate-900 border-2 border-white/5 rounded-2xl p-4 text-xl font-mono font-black text-white outline-none focus:border-blue-600" />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* STEP 3: SUPRIMENTOS (ESTOQUE) */}
                  {activeStep === 2 && (
                    <div className="max-w-5xl mx-auto space-y-12">
                       <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 shadow-2xl flex items-center gap-10">
                          <div className="p-6 bg-orange-600 rounded-[2rem] text-white shadow-xl shadow-orange-600/20"><Package size={48}/></div>
                          <div>
                             <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Gestão de Insumos</h3>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 italic">"Sem matéria-prima, os robôs param. Excesso de estoque gera custos de estocagem."</p>
                          </div>
                       </div>

                       {/* NOVO: PAINEL DE VISUALIZAÇÃO DE ESTOQUE ATUAL */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <StockViewCard label="MATÉRIA-PRIMA A" val={activeTeam?.kpis?.stock_quantities?.mp_a || 0} unit="un" icon={<Boxes className="text-blue-400"/>} />
                          <StockViewCard label="MATÉRIA-PRIMA B" val={activeTeam?.kpis?.stock_quantities?.mp_b || 0} unit="un" icon={<Boxes className="text-indigo-400"/>} />
                          <StockViewCard label="PRODUTO ACABADO" val={activeTeam?.kpis?.stock_quantities?.finished_goods || 0} unit="un" icon={<Package className="text-orange-500"/>} />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                          <InputCard label="COMPRAR MP-A (QTDE)" val={decisions.production.purchaseMPA} icon={<Plus/>} onChange={(v:any)=>updateDecision('production.purchaseMPA', v)} help={`Preço Oracle: $ ${currentMacro.prices.mp_a}`} />
                          <InputCard label="COMPRAR MP-B (QTDE)" val={decisions.production.purchaseMPB} icon={<Plus/>} onChange={(v:any)=>updateDecision('production.purchaseMPB', v)} help={`Preço Oracle: $ ${currentMacro.prices.mp_b}`} />
                       </div>
                    </div>
                  )}

                  {/* STEP 4: FÁBRICA */}
                  {activeStep === 3 && (
                     <div className="max-w-5xl mx-auto space-y-12">
                        <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 shadow-2xl flex items-center gap-10">
                          <div className="p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-600/20"><Factory size={48}/></div>
                          <div>
                             <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Chão de Fábrica</h3>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 italic">Define o nível de utilização e investimentos em P&D.</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <RangeInput label="USO DA CAPACIDADE" val={decisions.production.activityLevel} onChange={(v:any)=>updateDecision('production.activityLevel', v)} help="Porcentagem das máquinas que estarão operando." />
                          <RangeInput label="TURNO EXTRA (PROD)" val={decisions.production.extraProductionPercent} onChange={(v:any)=>updateDecision('production.extraProductionPercent', v)} color="orange" help="MO em turno extra custa 50% mais caro." />
                          <div className="md:col-span-2">
                             <InputCard label="INVESTIMENTO EM P&D ($)" val={decisions.production.rd_investment} icon={<Zap/>} onChange={(v:any)=>updateDecision('production.rd_investment', v)} />
                          </div>
                       </div>
                     </div>
                  )}

                  {/* STEP 6: ATIVOS (CAPEX) */}
                  {activeStep === 5 && (
                     <div className="space-y-12">
                        <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl flex justify-between items-center">
                           <div className="flex items-center gap-6">
                              <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl"><Cpu size={32}/></div>
                              <div>
                                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Investimento em Ativos</h3>
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 italic">Aumente sua capacidade produtiva adquirindo novas máquinas.</p>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           {['alfa', 'beta', 'gama'].map((m: any) => {
                              const spec = currentMacro.machine_specs[m as MachineModel];
                              const price = currentMacro.machinery_values[m as MachineModel];
                              return (
                                 <div key={m} className="bg-slate-950/60 p-8 rounded-[3.5rem] border border-white/5 space-y-6 group hover:border-orange-500/30 transition-all">
                                    <div className="flex justify-between items-start">
                                       <div className="text-xs font-black text-orange-500 uppercase italic">Modelo {m}</div>
                                       <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-slate-500">Cap: {spec?.production_capacity} un</span>
                                    </div>
                                    <div className="space-y-2">
                                       <span className="block text-[8px] font-black text-slate-600 uppercase">Preço Unitário</span>
                                       <div className="text-2xl font-mono font-black text-white italic">$ {price.toLocaleString()}</div>
                                    </div>
                                    <div className="pt-4 space-y-3">
                                       <label className="text-[9px] font-black text-slate-500 uppercase italic">Quantidade Compra</label>
                                       <input type="number" value={decisions.machinery.buy[m as MachineModel]} onChange={e => updateDecision(`machinery.buy.${m}`, Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono font-black" />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}

                  {/* PASSO 9: REVISÃO DO ORÁCULO */}
                  {activeStep === 8 && (
                     <div className="max-w-4xl mx-auto space-y-12">
                        <div className="text-center space-y-6">
                           <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse">
                              <ShieldCheck size={56} />
                           </div>
                           <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Transmit Protocol</h2>
                           <p className="text-lg text-slate-400 font-medium italic">"Revise as métricas projetadas antes de selar o ciclo P0{round}."</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-slate-900/80 p-10 rounded-[3.5rem] border border-white/5 space-y-8 shadow-2xl">
                              <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Indicadores Projetados</h4>
                              <div className="space-y-6">
                                 <ProjectedMetric label="Market Share" val={`${(projections?.marketShare || 0).toFixed(1)}%`} icon={<Target size={14}/>} />
                                 <ProjectedMetric label="Lucro Líquido" val={`$ ${(projections?.netProfit || 0).toLocaleString()}`} icon={<DollarSign size={14}/>} />
                                 <ProjectedMetric label="Oracle Rating" val={projections?.creditRating || 'AAA'} icon={<StarIcon size={14}/>} color="text-emerald-400" />
                              </div>
                           </div>
                           <div className="bg-rose-600/10 border-2 border-rose-500/20 p-10 rounded-[3.5rem] space-y-6">
                              <div className="flex items-center gap-4 text-rose-500"><AlertOctagon size={24}/> <h3 className="text-xl font-black uppercase italic">Selamento de Dados</h3></div>
                              <p className="text-slate-300 font-medium leading-relaxed italic text-sm">
                                 Ao transmitir, suas decisões serão gravadas no registro histórico da arena. Mudanças após o TURNOVER serão impossíveis. Verifique se possui MP suficiente para a produção planejada.
                              </p>
                           </div>
                        </div>
                     </div>
                  )}

               </motion.div>
            </AnimatePresence>

            {/* BARRA DE NAVEGAÇÃO FLUTUANTE */}
            <div className="fixed bottom-12 left-0 right-0 px-8 flex justify-center items-center pointer-events-none gap-4">
               <button onClick={() => setActiveStep(s => Math.max(0, s-1))} disabled={activeStep === 0} className="pointer-events-auto p-6 bg-slate-900 border border-white/10 rounded-full text-slate-500 hover:text-white transition-all shadow-2xl active:scale-90 disabled:opacity-0"><ChevronLeft size={32}/></button>
               {activeStep === STEPS.length - 1 ? (
                  <button onClick={handleTransmit} disabled={isSaving || isReadOnly} className="pointer-events-auto px-20 py-8 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-2xl hover:bg-white hover:text-orange-950 transition-all flex items-center gap-8 active:scale-95 border-4 border-orange-400/50">
                    {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Rocket size={24} />} TRANSMITIR PROTOCOLO
                  </button>
               ) : (
                  <button onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} className="pointer-events-auto p-6 bg-slate-900 border border-white/10 rounded-full text-slate-500 hover:text-orange-500 transition-all shadow-2xl active:scale-90"><ChevronRight size={32}/></button>
               )}
            </div>
         </div>

         {/* SIDEBAR DE PROJEÇÕES EM TEMPO REAL - FIDELIDADE v18.0 */}
         <aside className="w-full lg:w-[450px] bg-slate-900/60 border-l border-white/10 flex flex-col overflow-hidden shrink-0 relative z-[2000] backdrop-blur-3xl shadow-[-20px_0_60px_rgba(0,0,0,0.5)]">
            <header className="p-8 border-b border-white/5 bg-slate-950 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><Activity size={18}/></div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Oracle Intelligence Brief</h4>
               </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
               {/* MINI DRE PROJETADA */}
               <div className="space-y-6">
                  <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic flex items-center gap-2"><BarChart3 size={14} className="text-orange-500"/> DRE Projetada (P0{round})</h5>
                  <div className="bg-slate-950 border border-white/5 rounded-[2.5rem] p-8 space-y-3 font-mono shadow-inner">
                     <ReportLineItem label="(+) RECEITA BRUTA" val={projections?.revenue || 0} color="text-white" />
                     <ReportLineItem label="(-) CPV (CUSTOS)" val={projections?.statements?.dre?.cpv || 0} neg />
                     <ReportLineItem label="(=) LUCRO BRUTO" val={projections?.statements?.dre?.gross_profit || 0} bold />
                     <ReportLineItem label="(-) OPEX/MKT/ESTOQ" val={projections?.statements?.dre?.opex || 0} neg />
                     <div className="pt-2 border-t border-white/5">
                        <ReportLineItem label="(=) LUCRO LÍQUIDO" val={projections?.netProfit || 0} total color="text-orange-500" />
                     </div>
                  </div>
               </div>

               {/* MINI FLUXO DE CAIXA PROJETADO */}
               <div className="space-y-6">
                  <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic flex items-center gap-2"><Coins size={14} className="text-emerald-500"/> Fluxo de Caixa (T+1)</h5>
                  <div className="bg-emerald-600/5 border border-emerald-500/10 rounded-[2.5rem] p-8 space-y-4 shadow-inner">
                     <div className="flex justify-between items-end">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">SALDO INICIAL</span>
                        <span className="text-sm font-black text-white">$ {(activeTeam?.kpis?.current_cash || 0).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-end">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">(+) ENTRADAS</span>
                        <span className="text-sm font-black text-emerald-500">$ {((projections?.statements?.cash_flow?.inflow?.total || 0)).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-end">
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic">(-) SAÍDAS</span>
                        <span className="text-sm font-black text-rose-500">$ {((projections?.statements?.cash_flow?.outflow?.total || 0)).toLocaleString()}</span>
                     </div>
                     <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">CAIXA FINAL</span>
                        <span className="text-2xl font-black text-emerald-400 italic tracking-tighter font-mono">$ {(projections?.statements?.cash_flow?.final || 0).toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>
            
            <footer className="p-8 bg-slate-950 border-t border-white/5 opacity-50 flex items-center gap-3">
               <ShieldCheck size={14} className="text-emerald-500" />
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Oracle Simulation Kernel Sync Active</span>
            </footer>
         </aside>
      </div>
    </div>
  );
};

const StockViewCard = ({ label, val, unit, icon }: any) => (
  <div className="bg-slate-950/60 border border-white/5 p-6 rounded-3xl flex items-center gap-5 shadow-inner">
     <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
     <div>
        <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{label}</span>
        <div className="flex items-end gap-1"><span className="text-xl font-black text-white font-mono">{val.toLocaleString()}</span><span className="text-[9px] font-bold text-slate-600 mb-1">{unit}</span></div>
     </div>
  </div>
);

const ProjectedMetric = ({ label, val, icon, color }: any) => (
   <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-3">{icon}<span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</span></div>
      <span className={`text-lg font-black italic ${color || 'text-white'}`}>{val}</span>
   </div>
);

const ReportLineItem = ({ label, val, neg, bold, total, color }: any) => (
  <div className={`flex justify-between items-center ${bold ? 'py-1' : 'opacity-80'}`}>
     <span className={`text-[8px] font-black uppercase tracking-tighter ${bold ? 'text-slate-300' : 'text-slate-500'}`}>{label}</span>
     <span className={`text-xs font-black ${neg ? 'text-rose-500' : total ? 'text-lg' : ''} ${color || 'text-slate-200'}`}>
        {neg && '('}{formatCurrency(val, 'BRL', false)}{neg && ')'}
     </span>
  </div>
);

const StarIcon = ({ size }: { size: number }) => <Sparkles size={size} />;

const InputCard = ({ label, val, icon, onChange, help }: any) => (
  <div className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 hover:border-orange-500/30 transition-all group shadow-inner">
     <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white/5 rounded-2xl text-slate-500 group-hover:text-orange-500 transition-colors">{icon}</div>
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label>
        </div>
        {help && <div title={help} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg cursor-help"><HelpCircle size={14}/></div>}
     </div>
     <input type="number" value={val} onChange={e => onChange?.(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-slate-950 border-4 border-white/5 rounded-[1.5rem] px-8 py-6 text-white font-mono font-black text-3xl outline-none focus:border-orange-600 transition-all" />
  </div>
);

const RangeInput = ({ label, val, color, onChange, help }: any) => (
   <div className="space-y-6 bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 shadow-xl">
      <div className="flex justify-between items-center px-2">
         <label className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.2em]">{label}</label>
         <div className="flex items-center gap-4">
            <span className={`text-3xl font-black italic font-mono ${color === 'orange' ? 'text-orange-500' : 'text-emerald-500'}`}>{val}%</span>
            {help && <div title={help} className="p-1.5 bg-blue-500/10 text-blue-400 rounded-full cursor-help"><Info size={12}/></div>}
         </div>
      </div>
      <input type="range" min="0" max="100" value={val || 0} onChange={e => onChange(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-950 accent-orange-500 border border-white/5" />
   </div>
);

export default DecisionForm;
