
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, 
  TrendingUp, Activity, Box, AlertOctagon, 
  Zap, BarChart3, PieChart, Coins, Rocket, Info,
  HelpCircle, Scale, RefreshCw, Layers, Globe, Boxes, Plus, Sparkles,
  LayoutGrid, FileText, Maximize2, Minimize2, Eye, Shield, Users,
  HeartPulse, Briefcase, Warehouse, TrendingDown, Hammer, Truck,
  UserPlus, UserMinus, Trash2, Settings2, Percent
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase, getTeamSimulationHistory } from '../services/supabase';
import { DecisionData, Branch, Championship, MachineModel, MacroIndicators, Team, MachineInstance } from '../types';
import { calculateProjections, sanitize } from '../services/simulation';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM, INITIAL_MACHINES_P00 } from '../constants';
import { formatCurrency } from '../utils/formatters';
import FinancialReportMatrix from './FinancialReportMatrix';

const STEPS = [
  { id: 'legal', label: '1. JURÍDICO', icon: Gavel },
  { id: 'marketing', label: '2. COMERCIAL', icon: Megaphone },
  { id: 'assets', label: '3. ATIVOS', icon: Cpu },
  { id: 'production', label: '4. SUPRIMENTOS', icon: Package },
  { id: 'factory', label: '5. FÁBRICA', icon: Factory },
  { id: 'hr', label: '6. TALENTOS', icon: Users2 },
  { id: 'finance', label: '7. FINANÇAS', icon: Landmark },
  { id: 'review', label: '8. ORÁCULO', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ teamId?: string; champId?: string; round: number; branch?: Branch; isReadOnly?: boolean }> = ({ teamId, champId, round = 1, branch = 'industrial', isReadOnly = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [showStrategicHub, setShowStrategicHub] = useState(false);
  const [hubTab, setHubTab] = useState<'dre' | 'balance' | 'cashflow' | 'strategic'>('dre');
  const [history, setHistory] = useState<any[]>([]);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 2000, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 100, extraProductionPercent: 0, rd_investment: 0, term_interest_rate: 0.00 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
    finance: { loanRequest: 0, loanTerm: 0, application: 0 },
    estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (!champId || !teamId) return;
      setIsLoadingDraft(true);
      try {
        const [champsRes, historyRes] = await Promise.all([
           getChampionships(),
           getTeamSimulationHistory(teamId)
        ]);
        
        setHistory(historyRes);
        const found = champsRes.data?.find(a => a.id === champId);
        if (found) setActiveArena(found);

        const team = found?.teams?.find((t: Team) => t.id === teamId);
        if (team) {
           // Injeção de segurança do parque P00 se estiver no Round 1 e vazio
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
      } catch (err) { console.error("Cockpit Error:", err); } 
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
      if (res.success) alert("PROTOCOLO SELADO: Suas decisões foram transmitidas ao Oráculo.");
      else throw new Error(res.error);
    } catch (err: any) { alert(`FALHA NA TRANSMISSÃO: ${err.message}`); } 
    finally { setIsSaving(false); }
  };

  if (isLoadingDraft) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950/20 rounded-[3rem]">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Terminal...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#020617] rounded-[3rem] border border-white/5 overflow-hidden shadow-3xl">
      {/* HEADER TÁTICO FIXO */}
      <header className="px-10 py-6 bg-slate-900 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 z-[100] shadow-2xl">
         <div className="flex items-center gap-8">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em] italic leading-none">Decision Terminal v18.5</span>
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mt-1">
                  War Room: <span className="text-slate-400">{activeTeam?.name}</span>
               </h2>
            </div>
            <div className="h-10 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-4">
               <QuickKpi label="EBITDA Projetado" val={formatCurrency(projections?.kpis?.ebitda || 0, activeArena?.currency || 'BRL')} icon={<Zap size={12}/>} color="text-orange-400" />
               <QuickKpi label="Caixa Final T+1" val={formatCurrency(projections?.statements?.cash_flow?.final || 0, activeArena?.currency || 'BRL')} icon={<Coins size={12}/>} color="text-emerald-400" />
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowStrategicHub(!showStrategicHub)}
              className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border shadow-xl ${
                showStrategicHub ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700'
              }`}
            >
               {showStrategicHub ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
               {showStrategicHub ? 'Voltar para Decisões' : 'Ver Relatórios Completos'}
            </button>
            <button onClick={handleTransmit} disabled={isSaving || isReadOnly} className="px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-white hover:text-emerald-950 transition-all flex items-center gap-3 active:scale-95">
               {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />} Transmitir Protocolo
            </button>
         </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL COM SCROLL REAL */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
         <AnimatePresence mode="wait">
            {!showStrategicHub ? (
              <motion.div 
                key="inputs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                 {/* NAV BAR DE PASSOS - Fixa abaixo do header */}
                 <nav className="flex p-1.5 gap-1 bg-slate-900/60 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
                    {STEPS.map((s, idx) => (
                      <button key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[130px] py-4 px-2 rounded-2xl transition-all flex flex-col items-center gap-2 border ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white shadow-xl scale-[1.02] z-10' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                         <s.icon size={14} strokeWidth={3} />
                         <span className="text-[8px] font-black uppercase tracking-tighter">{s.label}</span>
                      </button>
                    ))}
                 </nav>

                 {/* CONTEÚDO DO PASSO COM SCROLL VERTICAL */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-slate-950/40 relative">
                    <div className="max-w-5xl mx-auto pb-40 space-y-16">
                        {/* STEP 1 - JURÍDICO */}
                        {activeStep === 0 && (
                           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <WizardStepHeader icon={<Gavel />} title="Status de Solvência" desc="Defina o protocolo legal de operação da unidade para este ciclo." help="Clique em Recuperação Judicial caso queira requerê-la." />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <button 
                                   onClick={() => updateDecision('judicial_recovery', false)}
                                   className={`p-10 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group ${!decisions.judicial_recovery ? 'bg-slate-900 border-emerald-500 shadow-[0_20px_60px_rgba(16,185,129,0.2)]' : 'bg-slate-950 border-white/5 opacity-40'}`}
                                 >
                                    <div className="flex items-center gap-4 mb-4">
                                       <div className={`p-4 rounded-2xl ${!decisions.judicial_recovery ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-600'}`}><ShieldCheck size={24}/></div>
                                       <span className="text-xl font-black text-white uppercase italic">Operação Normal</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Unidade operando com plena capacidade jurídica e acesso a crédito.</p>
                                 </button>

                                 <button 
                                   onClick={() => updateDecision('judicial_recovery', true)}
                                   className={`p-10 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group ${decisions.judicial_recovery ? 'bg-slate-900 border-rose-500 shadow-[0_20px_60px_rgba(244,63,94,0.2)]' : 'bg-slate-950 border-white/5 opacity-40'}`}
                                 >
                                    <div className="flex items-center gap-4 mb-4">
                                       <div className={`p-4 rounded-2xl ${decisions.judicial_recovery ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-600'}`}><AlertOctagon size={24}/></div>
                                       <span className="text-xl font-black text-white uppercase italic">Protocolo RJ</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Recuperação Judicial: Crédito e Capex Limitados. Foco em reestruturação.</p>
                                 </button>
                              </div>
                           </div>
                        )}

                        {/* STEP 2 - COMERCIAL */}
                        {activeStep === 1 && (
                           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <WizardStepHeader icon={<Megaphone />} title="Regiões de Vendas" desc="Configure preço, prazo e campanhas de marketing." />
                              
                              <div className="flex justify-end">
                                 <button className="px-6 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">
                                    Replicar em Cluster
                                 </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {Object.entries(decisions.regions).map(([id, reg]: [any, any]) => (
                                    <div key={id} className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl hover:border-orange-500/20 transition-all group">
                                       <div className="flex justify-between items-center">
                                          <span className="text-xs font-black text-orange-500 uppercase italic">Região 0{id}</span>
                                          <Globe size={16} className="text-slate-700 group-hover:text-orange-500/50 transition-colors" />
                                       </div>
                                       <div className="space-y-6">
                                          <div className="space-y-4">
                                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Preço Unitário ($)</label>
                                             <input type="number" value={reg.price} onChange={e => updateDecision(`regions.${id}.price`, parseFloat(e.target.value) || 0.00)} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-5 text-2xl font-mono font-black text-white outline-none focus:border-orange-600 shadow-inner" />
                                          </div>
                                          
                                          <div className="space-y-4">
                                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2 flex items-center gap-2">
                                                Prazo de Recebimento <HelpCircle size={12} className="text-slate-700" />
                                             </label>
                                             <select 
                                               value={reg.term} 
                                               onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))}
                                               className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-5 text-xs font-black text-white uppercase outline-none focus:border-orange-600"
                                             >
                                                <option value={0}>A VISTA</option>
                                                <option value={1}>A VISTA+50%</option>
                                                <option value={2}>A VISTA+50%+50%</option>
                                             </select>
                                          </div>

                                          <div className="space-y-4">
                                             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Campanhas de Marketing (Unid. 0-9)</label>
                                             <input type="number" min="0" max="9" value={reg.marketing} onChange={e => updateDecision(`regions.${id}.marketing`, Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-orange-600 shadow-inner" />
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>

                              <div className="max-w-md">
                                 <InputCard 
                                   label="JUROS VENDA A PRAZO (%)" 
                                   val={decisions.production.term_interest_rate} 
                                   icon={<Percent />} 
                                   onChange={(v:any)=>updateDecision('production.term_interest_rate', v)} 
                                   help="Taxa aplicada aos clientes que compram parcelado." 
                                 />
                              </div>
                           </div>
                        )}

                        {/* STEP 3 - ATIVOS */}
                        {activeStep === 2 && (
                           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <WizardStepHeader icon={<Cpu />} title="Ativos & CapEx" desc="Expansão e desinvestimento de parque fabril." />
                              
                              {/* INVENTÁRIO ATUAL (MÁQUINAS EXISTENTES NO P00) */}
                              <div className="space-y-6">
                                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                    <Warehouse size={16} className="text-blue-400"/> Parque de Máquinas Operacional (P00+)
                                 </h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(activeTeam?.kpis?.machines || []).map((m: MachineInstance, idx: number) => (
                                       <div key={m.id} className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] flex justify-between items-center group shadow-xl">
                                          <div className="flex items-center gap-4">
                                             <div className="p-4 bg-white/5 rounded-2xl text-blue-400">
                                                <Settings2 size={24}/>
                                             </div>
                                             <div>
                                                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Unit {m.id}</span>
                                                <span className="text-sm font-black text-white uppercase tracking-tight">{m.model.toUpperCase()} (Idade: {m.age} rounds)</span>
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <span className="block text-[8px] font-black text-slate-600 uppercase italic">Valor Contábil Residual</span>
                                             <div className="text-sm font-mono font-black text-emerald-400 mb-4">
                                                $ {(m.acquisition_value - m.accumulated_depreciation).toLocaleString()}
                                             </div>
                                             <label className="flex items-center gap-2 justify-end cursor-pointer group/check">
                                                <span className="text-[9px] font-black text-slate-500 uppercase group-hover/check:text-rose-500 transition-colors">VENDER</span>
                                                <input type="checkbox" className="w-4 h-4 rounded bg-slate-950 border-white/10 accent-rose-600" />
                                             </label>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* ORDENS DE AQUISIÇÃO (COM REAJUSTE MACRO) */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                 <AssetCard 
                                    model="alfa" 
                                    val={decisions.machinery.buy.alfa} 
                                    onChange={(v: any)=>updateDecision('machinery.buy.alfa', v)} 
                                    price={currentMacro.machinery_values.alfa * (1 + (sanitize(currentMacro.machine_alpha_price_adjust, 0) / 100))} 
                                    spec={currentMacro.machine_specs.alfa}
                                 />
                                 <AssetCard 
                                    model="beta" 
                                    val={decisions.machinery.buy.beta} 
                                    onChange={(v: any)=>updateDecision('machinery.buy.beta', v)} 
                                    price={currentMacro.machinery_values.beta * (1 + (sanitize(currentMacro.machine_beta_price_adjust, 0) / 100))} 
                                    spec={currentMacro.machine_specs.beta}
                                 />
                                 <AssetCard 
                                    model="gama" 
                                    val={decisions.machinery.buy.gama} 
                                    onChange={(v: any)=>updateDecision('machinery.buy.gama', v)} 
                                    price={currentMacro.machinery_values.gama * (1 + (sanitize(currentMacro.machine_gamma_price_adjust, 0) / 100))} 
                                    spec={currentMacro.machine_specs.gama}
                                 />
                              </div>

                              {/* ORDENS DE VENDA */}
                              <div className="bg-rose-900/10 border-2 border-rose-500/20 p-10 rounded-[3rem] space-y-8 shadow-2xl">
                                 <div className="flex items-center gap-4 text-rose-500">
                                    <Trash2 size={24}/>
                                    <h3 className="text-xl font-black uppercase tracking-tight italic">Desinvestimento Estratégico</h3>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <SellInput label="Vender ALFA (Qtd)" val={decisions.machinery.sell.alfa} onChange={(v: any)=>updateDecision('machinery.sell.alfa', v)} />
                                    <SellInput label="Vender BETA (Qtd)" val={decisions.machinery.sell.beta} onChange={(v: any)=>updateDecision('machinery.sell.beta', v)} />
                                    <SellInput label="Vender GAMA (Qtd)" val={decisions.machinery.sell.gama} onChange={(v: any)=>updateDecision('machinery.sell.gama', v)} />
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* STEP 4 - SUPRIMENTOS */}
                        {activeStep === 3 && (
                           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <WizardStepHeader icon={<Package />} title="Suprimentos" desc="Gerencie a cadeia de suprimentos." />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <InputCard label="MATÉRIA-PRIMA A (QTDE)" val={decisions.production.purchaseMPA} icon={<Package />} onChange={(v:any)=>updateDecision('production.purchaseMPA', v)} help="Quantidade de insumo MP A a ser comprado para o próximo período." />
                                 <InputCard label="MATÉRIA-PRIMA B (QTDE)" val={decisions.production.purchaseMPB} icon={<Package />} onChange={(v:any)=>updateDecision('production.purchaseMPB', v)} help="Quantidade de insumo MP B a ser comprado para o próximo período." />
                              </div>

                              <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">PAGAMENTO FORNECEDOR <HelpCircle size={12}/></label>
                                 <select value={decisions.production.paymentType} onChange={e => updateDecision('production.paymentType', parseInt(e.target.value))} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl p-6 text-xs font-black text-white uppercase outline-none focus:border-orange-600 transition-all">
                                    <option value={0}>A VISTA</option>
                                    <option value={1}>A VISTA+50%</option>
                                    <option value={2}>A VISTA+33%+33%</option>
                                 </select>
                              </div>
                           </div>
                        )}

                        {/* STEP 5 - FÁBRICA */}
                        {activeStep === 4 && (
                           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <WizardStepHeader icon={<Factory />} title="Chão de Fábrica" desc="Gerencie o chão de fábrica." />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <RangeInput label="USO DA CAPACIDADE (%)" val={decisions.production.activityLevel} onChange={(v:any)=>updateDecision('production.activityLevel', v)} help="De 0 a 100%. Nível de utilização das máquinas instaladas." />
                                 <RangeInput label="TURNO EXTRA (%)" val={decisions.production.extraProductionPercent} onChange={(v:any)=>updateDecision('production.extraProductionPercent', v)} color="orange" help="Aumenta a produção além da capacidade normal. Custo-hora do aalário base da MOD aumenta em 50%." />
                                 <RangeInput label="INVESTIMENTO P&D (%)" val={decisions.production.rd_investment} onChange={(v:any)=>updateDecision('production.rd_investment', v)} color="blue" help="Percentual sobre o Faturamento Bruto. Reduz custo unitário a longo prazo e aumenta atratividade." />
                              </div>
                           </div>
                        )}

                        {/* STEP 6 - TALENTOS */}
                        {activeStep === 5 && (
                           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <WizardStepHeader icon={<Users2 />} title="Gestão de Talentos" desc="Defina a força de trabalho e incentivos salariais." />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <InputCard label="NOVAS ADMISSÕES" val={decisions.hr.hired} icon={<UserPlus />} onChange={(v:any)=>updateDecision('hr.hired', v)} help="Aumenta a capacidade de produção baseada em operadores/máquina." />
                                 <InputCard label="DESLIGAMENTOS" val={decisions.hr.fired} icon={<UserMinus />} onChange={(v:any)=>updateDecision('hr.fired', v)} help="Reduz a folha de pagamento, mas gera custos de rescisão." />
                                 <InputCard label="PISO SALARIAL ($)" val={decisions.hr.salary} icon={<DollarSign />} onChange={(v:any)=>updateDecision('hr.salary', v)} help="Define o salário base. Afeta motivação e atratividade de talentos." />
                                 <RangeInput label="TREINAMENTO (%)" val={decisions.hr.trainingPercent} onChange={(v:any)=>updateDecision('hr.trainingPercent', v)} color="blue" help="Aumenta a produtividade por homem-hora." />
                                 <RangeInput label="PARTICIPAÇÃO LUCROS (PPR %)" val={decisions.hr.participationPercent} onChange={(v:any)=>updateDecision('hr.participationPercent', v)} help="Motivador variável baseado no lucro líquido final." />
                                 <RangeInput label="PRÊMIO PRODUTIVIDADE (%)" val={decisions.hr.productivityBonusPercent} onChange={(v:any)=>updateDecision('hr.productivityBonusPercent', v)} color="orange" help="Bônus imediato por atingimento de metas fabris." />
                              </div>
                           </div>
                        )}

                        {/* STEP 7 - FINANÇAS & METAS */}
                        {activeStep === 6 && (
                           <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="space-y-10">
                                 <WizardStepHeader icon={<Landmark />} title="Mercado de Capitais" desc="Gestão de liquidez e alavancagem financeira." />
                                 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                       <div className="flex items-center justify-between">
                                          <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><Landmark className="text-orange-500"/> Crédito</h4>
                                          <span className="px-4 py-1.5 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-lg text-[9px] font-black uppercase">Taxa TR: {currentMacro.interest_rate_tr}%</span>
                                       </div>
                                       <InputCard label="REQUISIÇÃO DE EMPRÉSTIMO ($)" val={decisions.finance.loanRequest} icon={<DollarSign/>} onChange={(v:any)=>updateDecision('finance.loanRequest', v)} />
                                       <div className="space-y-4">
                                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Prazo de Amortização</label>
                                          <select value={decisions.finance.loanTerm} onChange={e => updateDecision('finance.loanTerm', parseInt(e.target.value))} className="w-full bg-slate-950 border-4 border-white/5 rounded-3xl p-6 text-xs font-black text-white uppercase outline-none focus:border-orange-600 transition-all">
                                             <option value={0}>A VISTA (Próximo Round)</option>
                                             <option value={1}>CURTO PRAZO (A VISTA+50%)</option>
                                             <option value={2}>LONGO PRAZO (A VISTA+33%+33%)</option>
                                          </select>
                                       </div>
                                    </div>

                                    <div className="space-y-8">
                                       <div className="flex items-center justify-between">
                                          <h4 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><TrendingUp className="text-emerald-500"/> Aplicação</h4>
                                          <span className="px-4 py-1.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase">Rendimento: {currentMacro.investment_return_rate}%</span>
                                       </div>
                                       <InputCard label="APLICAÇÃO FINANCEIRA ($)" val={decisions.finance.application} icon={<Activity/>} onChange={(v:any)=>updateDecision('finance.application', v)} help="Liquidez T+1: Rendimento creditado no Resultado Financeiro do próximo período." />
                                       <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-white/5 text-[10px] font-bold text-slate-500 uppercase leading-relaxed italic">
                                          "Valores aplicados sairão do caixa disponível imediatamente e retornarão no ciclo subsequente acrescidos de rendimentos."
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-10 pt-16 border-t border-white/5">
                                 <WizardStepHeader icon={<Target />} title="Projeções e Metas" desc="As premiações de auditoria dependem da sua precisão nestes campos." />
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <InputCard label="PREVISÃO CUSTO UNITÁRIO (CPP)" val={decisions.estimates.forecasted_unit_cost} icon={<Zap/>} onChange={(v:any)=>updateDecision('estimates.forecasted_unit_cost', v)} help={`Tolerância Oracle: $ ${currentMacro.award_values.cost_precision}`} />
                                    <InputCard label="PREVISÃO FATURAMENTO (BRUTO)" val={decisions.estimates.forecasted_revenue} icon={<BarChart3/>} onChange={(v:any)=>updateDecision('estimates.forecasted_revenue', v)} help={`Tolerância Oracle: $ ${currentMacro.award_values.revenue_precision}`} />
                                    <InputCard label="PREVISÃO LUCRO LÍQUIDO" val={decisions.estimates.forecasted_net_profit} icon={<PieChart/>} onChange={(v:any)=>updateDecision('estimates.forecasted_net_profit', v)} help={`Tolerância Oracle: $ ${currentMacro.award_values.profit_precision}`} />
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* STEP 8 - REVISÃO */}
                        {activeStep === 7 && (
                           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                              <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse mb-8">
                                 <ShieldCheck size={48} />
                              </div>
                              <div className="space-y-4">
                                 <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Ready for Oracle Transmit</h2>
                                 <p className="text-slate-400 font-medium italic">"Revise seu protocolo tático antes de selar o ciclo P0{round}."</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left max-w-4xl mx-auto pt-12">
                                 <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 space-y-6">
                                    <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest italic mb-4">Resumo Comercial</h4>
                                    <SummaryLine label="Preço Médio" val={`$ ${(Object.values(decisions.regions).reduce((a:any,b:any)=>a+(b.price||0), 0) / Math.max(1, Object.keys(decisions.regions).length)).toFixed(2)}`} />
                                    <SummaryLine label="Total Marketing" val={`${Object.values(decisions.regions).reduce((a:any,b:any)=>a+(b.marketing||0), 0)} units`} />
                                 </div>
                                 <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 space-y-6">
                                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest italic mb-4">Resumo Industrial</h4>
                                    <SummaryLine label="Uso Capacidade" val={`${decisions.production.activityLevel}%`} />
                                    <SummaryLine label="Turno Extra" val={`${decisions.production.extraProductionPercent}%`} />
                                    <SummaryLine label="Novos Ativos" val={`${decisions.machinery.buy.alfa + decisions.machinery.buy.beta + decisions.machinery.buy.gama} unidades`} />
                                 </div>
                              </div>

                              <div className="max-w-2xl mx-auto p-8 bg-rose-600/10 border border-rose-500/20 rounded-3xl space-y-4">
                                 <div className="flex items-center gap-3 text-rose-500 justify-center">
                                    <AlertOctagon size={20} />
                                    <h5 className="font-black uppercase italic text-sm">Aviso de Governança</h5>
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic">
                                    "As decisões podem ser alteradas livremente até o vencimento do TIMER DE ROUND. Decisões não seladas (em rascunho) serão ignoradas pelo motor Oracle no momento do Turnover, resultando em dados zerados para sua unidade."
                                 </p>
                              </div>
                           </div>
                        )}
                    </div>
                 </div>

                 {/* BOTTOM CONTROL BAR - Fixa, sem sobrepor conteúdo */}
                 <footer className="h-28 bg-slate-900 border-t border-white/10 flex items-center justify-between px-10 shrink-0 z-[100] shadow-top-2xl">
                    <button 
                      onClick={() => setActiveStep(s => Math.max(0, s-1))} 
                      disabled={activeStep === 0} 
                      className="px-10 py-4 bg-slate-800 border border-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all flex items-center gap-4 disabled:opacity-0"
                    >
                       <ChevronLeft size={16}/> Voltar
                    </button>
                    <div className="flex gap-2">
                       {STEPS.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeStep === i ? 'bg-orange-500 scale-150 shadow-[0_0_10px_#f97316]' : 'bg-white/10'}`} />
                       ))}
                    </div>
                    {activeStep === STEPS.length - 1 ? (
                      <button 
                        onClick={handleTransmit} 
                        className="px-14 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                      >
                         Transmitir <Rocket size={16}/>
                      </button>
                    ) : (
                      <button 
                        onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))} 
                        className="px-14 py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl flex items-center gap-4 active:scale-95"
                      >
                         Próximo <ChevronRight size={16}/>
                      </button>
                    )}
                 </footer>
              </motion.div>
            ) : (
              <motion.div 
                key="hub" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col bg-slate-950 p-10"
              >
                 <div className="flex justify-between items-end mb-10 shrink-0">
                    <div className="space-y-2">
                       <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Strategic <span className="text-orange-500">Analysis Hub</span></h2>
                       <p className="text-slate-400 font-medium italic">Visão 360° do Império: Histórico Auditado + Projeção v18.5</p>
                    </div>
                    <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
                       <HubTabBtn active={hubTab === 'dre'} onClick={() => setHubTab('dre')} label="DRE Master" icon={<TrendingUp size={14}/>} />
                       <HubTabBtn active={hubTab === 'balance'} onClick={() => setHubTab('balance')} label="Balanço Master" icon={<Landmark size={14}/>} />
                       <HubTabBtn active={hubTab === 'cashflow'} onClick={() => setHubTab('cashflow')} label="Fluxo de Caixa (DFC)" icon={<Activity size={14}/>} />
                       <HubTabBtn active={hubTab === 'strategic'} onClick={() => setHubTab('strategic')} label="Comando Estratégico" icon={<Target size={14}/>} />
                    </div>
                 </div>

                 <div className="flex-1 overflow-hidden">
                    <FinancialReportMatrix 
                      type={hubTab} 
                      history={history} 
                      projection={projections} 
                      currency={activeArena?.currency || 'BRL'} 
                    />
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

// COMPONENTES AUXILIARES DE UI
const WizardStepHeader = ({ icon, title, desc, help }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-12">
     <div className="p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl shrink-0 text-orange-500">{icon}</div>
     <div>
        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none flex items-center gap-4">
           {title} {help && <span title={help} className="cursor-help"><HelpCircle size={20} className="text-slate-700" /></span>}
        </h3>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">{desc}</p>
     </div>
  </div>
);

const InputCard = ({ label, val, icon, onChange, help }: any) => (
  <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl group hover:border-orange-500/20 transition-all">
     <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
           {label} {help && <span title={help} className="cursor-help"><HelpCircle size={12} className="text-slate-700" /></span>}
        </label>
        <div className="text-slate-700 group-hover:text-orange-500/50 transition-colors">{icon}</div>
     </div>
     <input 
       type="number" 
       value={val} 
       onChange={e => onChange(parseFloat(e.target.value) || 0)} 
       className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-6 text-2xl font-mono font-black text-white outline-none focus:border-orange-600 shadow-inner" 
     />
  </div>
);

const RangeInput = ({ label, val, onChange, help, color = "orange" }: any) => (
  <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
     <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
           {label} {help && <span title={help} className="cursor-help"><HelpCircle size={12} className="text-slate-700" /></span>}
        </label>
        <span className={`text-2xl font-black font-mono ${color === 'orange' ? 'text-orange-500' : 'text-blue-500'}`}>{val}%</span>
     </div>
     <input 
       type="range" 
       min="0" 
       max="100" 
       value={val} 
       onChange={e => onChange(parseInt(e.target.value) || 0)} 
       className={`w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-${color === 'orange' ? 'orange-600' : 'blue-600'}`}
     />
  </div>
);

const SummaryLine = ({ label, val }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     <span className="text-xs font-black text-white uppercase italic">{val}</span>
  </div>
);

const StepHeader = ({ title, subtitle, icon }: any) => (
  <div className="flex items-center gap-8 border-b border-white/5 pb-12">
     <div className="p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl shrink-0">{icon}</div>
     <div>
        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">{subtitle}</p>
     </div>
  </div>
);

const AssetCard = ({ model, val, onChange, price, spec }: any) => (
  <div className="bg-slate-900/80 p-10 rounded-[3rem] border border-white/5 space-y-6 group hover:border-blue-500/30 transition-all shadow-xl">
     <div className="flex justify-between items-center">
        <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Machine {model.toUpperCase()}</h4>
        <Cpu className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
     </div>
     <div className="space-y-2">
        <span className="text-[9px] font-black text-slate-500 uppercase">Preço Unitário Oracle</span>
        <div className="text-xl font-black text-blue-400 font-mono">$ {price.toLocaleString()}</div>
        {spec && <span className="block text-[8px] font-black text-slate-600 uppercase italic mt-1">{spec.operators_required} operators required</span>}
     </div>
     <div className="pt-4 space-y-4">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-2">COMPRAR (Qtd)</label>
        <input type="number" min="0" value={val} onChange={e => onChange(parseInt(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-5 text-2xl font-mono font-black text-white outline-none focus:border-blue-600 shadow-inner" />
     </div>
  </div>
);

const SellInput = ({ label, val, onChange }: any) => (
  <div className="space-y-4 group">
     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">{label}</label>
     <input type="number" min="0" value={val} onChange={e => onChange(parseInt(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-rose-500/20 rounded-2xl p-5 text-2xl font-mono font-black text-rose-500 outline-none focus:border-rose-600 shadow-inner" />
  </div>
);

const QuickKpi = ({ label, val, icon, color }: any) => (
  <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5">
     <div className={`${color}`}>{icon}</div>
     <div className="flex flex-col">
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
        <span className="text-[11px] font-black text-white italic mt-1">{val}</span>
     </div>
  </div>
);

const HubTabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border-2 italic active:scale-95 ${active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'bg-slate-950 border-transparent text-slate-500 hover:text-white'}`}>
    {icon} {label}
  </button>
);

export default DecisionForm;
