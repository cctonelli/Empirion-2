
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Save, Package, Cpu, ChevronRight, Target, 
  Landmark, Gavel, ShieldCheck, ChevronLeft, AlertTriangle, 
  TrendingUp, Activity, Box, AlertOctagon, 
  Zap, BarChart3, PieChart, Coins, Rocket, Info,
  HelpCircle, Scale, RefreshCw, Layers, Globe, Boxes, Plus, Sparkles,
  LayoutGrid, FileText, Maximize2, Minimize2, Eye, Shield, Users,
  HeartPulse, Briefcase, Warehouse, TrendingDown, Hammer, Truck,
  UserPlus, UserMinus, Trash2, Settings2, Percent
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase, getTeamSimulationHistory } from '../services/supabase';
import { DecisionData, Branch, Championship, MachineModel, MacroIndicators, Team, MachineInstance } from '../types';
import { calculateProjections, sanitize, getCumulativeAdjust } from '../services/simulation';
import { calculateESDS } from '../services/gemini';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM, INITIAL_MACHINES_P00 } from '../constants';
import { formatCurrency } from '../utils/formatters';
import FinancialReportMatrix from './FinancialReportMatrix';
import GazetteViewer from './GazetteViewer';
import { Newspaper } from 'lucide-react';

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
  const [hubTab, setHubTab] = useState<'dre' | 'balance' | 'cashflow' | 'strategic' | 'gazette'>('dre');
  const [history, setHistory] = useState<any[]>([]);
  const [isCalculatingESDS, setIsCalculatingESDS] = useState(false);
  const [projectedESDS, setProjectedESDS] = useState<any>(null);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 2000, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 100, extraProductionPercent: 0, rd_investment: 0, term_interest_rate: 0.00 },
    machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 }, sell_ids: [] },
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

  const replicateInCluster = () => {
    if (isReadOnly) return;
    const firstRegion = decisions.regions[1];
    if (!firstRegion) return;
    
    const nextRegions = { ...decisions.regions };
    Object.keys(nextRegions).forEach(id => {
      nextRegions[Number(id)] = { ...firstRegion };
    });
    updateDecision('regions', nextRegions);
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

  const handleSimulateESDS = async () => {
    if (!projections || !activeArena) return;
    setIsCalculatingESDS(true);
    try {
      const res = await calculateESDS(round, activeArena.branch, projections.kpis, history);
      setProjectedESDS(res);
    } catch (err) {
      console.error("ESDS Projection Fault", err);
    } finally {
      setIsCalculatingESDS(false);
    }
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
               <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">E-SDS Projetado</span>
                     <span className={`text-xs font-black ${projectedESDS ? (projectedESDS.zone === 'Azul' || projectedESDS.zone === 'Verde' ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-400'}`}>
                        {isCalculatingESDS ? 'Calculando...' : projectedESDS ? `${projectedESDS.display.toFixed(1)} (${projectedESDS.zone})` : '---'}
                     </span>
                  </div>
                  <button 
                    onClick={handleSimulateESDS} 
                    disabled={isCalculatingESDS || !projections}
                    className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-all disabled:opacity-50"
                    title="Simular E-SDS com IA"
                  >
                    <Sparkles size={12} className={isCalculatingESDS ? 'animate-spin' : ''} />
                  </button>
               </div>
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
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-slate-950/40 relative">
                    <div className="max-w-[1400px] mx-auto pb-40 space-y-12 px-4">
                        {/* STEP 1 - JURÍDICO */}
                        {activeStep === 0 && (
                        <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           {/* Cabeçalho */}
                           <WizardStepHeader
                              icon={<Gavel size={32} strokeWidth={2.5} />}
                              title="Status Jurídico & Solvência"
                              desc="Defina o regime jurídico da empresa para este ciclo. A escolha impacta diretamente acesso a crédito, capacidade de investimento, percepção de mercado e risco de intervenção do Oracle."
                              help="Recuperação Judicial é uma medida extrema. Use apenas quando o caixa e a estrutura financeira estão insustentáveis sem reestruturação forçada."
                           />

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                              {/* Operação Normal */}
                              <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateDecision('judicial_recovery', false)}
                              disabled={isReadOnly}
                              className={`
                                 relative p-8 lg:p-10 rounded-3xl border-2 text-left transition-all duration-300 group
                                 ${!decisions.judicial_recovery
                                    ? 'bg-slate-900 border-emerald-500 shadow-2xl ring-2 ring-emerald-500/40'
                                    : 'bg-slate-950/60 border-slate-700/50 opacity-65 hover:opacity-90 hover:border-emerald-500/40'}
                              `}
                              >
                              <div className="flex justify-between items-start mb-8">
                                 <div className="max-w-[75%]">
                                    <h5 className="text-2xl font-black text-emerald-400 uppercase tracking-tight mb-4">
                                    Operação Normal
                                    </h5>
                                    <p className="text-base text-slate-300 leading-relaxed mb-6">
                                    Empresa opera em plena conformidade jurídica e financeira. Acesso irrestrito a linhas de crédito, CapEx, emissão de ações e fornecedores sem restrições.
                                    </p>
                                    <ul className="space-y-3 text-sm text-emerald-200/90">
                                    <li className="flex items-start gap-3">
                                       <ShieldCheck size={18} className="shrink-0 mt-1" />
                                       Crédito disponível na taxa base do mercado
                                    </li>
                                    <li className="flex items-start gap-3">
                                       <ShieldCheck size={18} className="shrink-0 mt-1" />
                                       Investimentos e expansão sem limitações regulatórias
                                    </li>
                                    <li className="flex items-start gap-3">
                                       <ShieldCheck size={18} className="shrink-0 mt-1" />
                                       Percepção positiva no mercado → menor custo de capital implícito
                                    </li>
                                    </ul>
                                 </div>

                                 <div className="p-5 rounded-2xl bg-emerald-600/20 group-hover:bg-emerald-600/30 transition-colors shrink-0">
                                    <ShieldCheck size={40} className="text-emerald-400" />
                                 </div>
                              </div>

                              <div className="absolute bottom-6 right-6">
                                 <span className="text-lg font-black text-emerald-500/90 uppercase tracking-widest">
                                    Recomendado
                                 </span>
                              </div>
                              </motion.button>

                              {/* Recuperação Judicial */}
                              <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateDecision('judicial_recovery', true)}
                              disabled={isReadOnly}
                              className={`
                                 relative p-8 lg:p-10 rounded-3xl border-2 text-left transition-all duration-300 group
                                 ${decisions.judicial_recovery
                                    ? 'bg-slate-900 border-rose-500 shadow-2xl ring-2 ring-rose-500/40'
                                    : 'bg-slate-950/60 border-slate-700/50 opacity-65 hover:opacity-90 hover:border-rose-500/40'}
                              `}
                              >
                              <div className="flex justify-between items-start mb-8">
                                 <div className="max-w-[75%]">
                                    <h5 className="text-2xl font-black text-rose-400 uppercase tracking-tight mb-4">
                                    Protocolo de Recuperação Judicial (RJ)
                                    </h5>
                                    <p className="text-base text-slate-300 leading-relaxed mb-6">
                                    Ativa regime especial de proteção contra credores. Permite reestruturação forçada, mas impõe restrições severas por vários rounds.
                                    </p>

                                    <div className="space-y-5 mt-6">
                                    <h6 className="text-sm font-semibold text-rose-300 uppercase tracking-wide">
                                       Consequências principais (no contexto da simulação):
                                    </h6>
                                    <ul className="space-y-3 text-sm text-rose-200/90">
                                       <li className="flex items-start gap-3">
                                          <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                                          Novo crédito bloqueado ou com spread altíssimo (taxa + 4–8%)
                                       </li>
                                       <li className="flex items-start gap-3">
                                          <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                                          CapEx e compra de máquinas limitado a ~40% do valor normal
                                       </li>
                                       <li className="flex items-start gap-3">
                                          <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                                          Dívidas existentes congeladas + correção monetária (inflação aplicada)
                                       </li>
                                       <li className="flex items-start gap-3">
                                          <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                                          Percepção de risco elevada → demanda pode cair 10–30% por rounds
                                       </li>
                                       <li className="flex items-start gap-3">
                                          <AlertOctagon size={18} className="shrink-0 mt-1 text-rose-400" />
                                          Duração típica: 4–8 rounds até aprovação do plano de recuperação
                                       </li>
                                    </ul>
                                    </div>
                                 </div>

                                 <div className="p-5 rounded-2xl bg-rose-600/20 group-hover:bg-rose-600/30 transition-colors shrink-0">
                                    <AlertOctagon size={40} className="text-rose-400" />
                                 </div>
                              </div>

                              <div className="absolute bottom-6 right-6">
                                 <span className="text-lg font-black text-rose-500/90 uppercase tracking-widest">
                                    Último recurso
                                 </span>
                              </div>
                              </motion.button>
                           </div>

                           {/* Caixa de recomendação estratégica */}
                           <div className="bg-slate-950/70 border border-slate-700/50 rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto text-center">
                              <div className="flex items-center justify-center gap-4 mb-6">
                              <Scale size={28} className="text-yellow-400" />
                              <h6 className="text-xl font-black text-yellow-300 uppercase tracking-wide">
                                 Quando realmente vale acionar RJ?
                              </h6>
                              </div>
                              <p className="text-base text-slate-300 leading-relaxed mb-8">
                              RJ é ferramenta de <strong>sobrevivência</strong>, não de crescimento. Considere apenas se:
                              </p>
                              <ul className="text-left max-w-3xl mx-auto space-y-4 text-sm text-slate-300">
                              <li className="flex items-start gap-4">
                                 <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-1" />
                                 Caixa projetado negativo por 2+ rounds consecutivos sem solução viável
                              </li>
                              <li className="flex items-start gap-4">
                                 <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-1" />
                                 Dívidas vencidas {' > '} 45–60% do patrimônio líquido atual
                              </li>
                              <li className="flex items-start gap-4">
                                 <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-1" />
                                 Sem acesso realista a empréstimos normais ou vendas de ativos para cobrir rombo
                              </li>
                              </ul>
                              <p className="mt-10 text-lg font-medium text-emerald-300 italic">
                              Na maioria dos campeonatos competitivos, ajuste agressivo de custos + gestão de caixa é muito mais vantajoso do que entrar em RJ.
                              </p>
                           </div>

                           <div className="h-24 lg:h-32" />
                        </div>
                        )}


                        {/* STEP 2 - COMERCIAL */}
                        {activeStep === 1 && (
                        <div className="space-y-12 lg:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           {/* Cabeçalho do passo – mantido curto */}
                           <WizardStepHeader
                              icon={<Megaphone size={32} strokeWidth={2.5} />}
                              title="Estratégia Comercial"
                              desc="Configure preço, prazo e marketing por região. Decisões afetam demanda, margem e fluxo de caixa."
                              help="Use o botão replicar para aplicar a Região 1 em todas as demais."
                           />

                           {/* Bloco único de explicações – visível sempre */}
                           <div className="bg-slate-900/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/10 shadow-xl">
                              <h5 className="text-lg font-black text-orange-400 uppercase tracking-wide mb-6 flex items-center gap-3">
                              <Info size={20} />
                              Entenda o impacto de cada decisão comercial
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-sm">
                              {/* Juros de venda a prazo */}
                              <div className="space-y-2">
                                 <label className="font-semibold text-slate-300 flex items-center gap-2">
                                    Juros de Venda a Prazo (%)
                                    <HelpCircle size={14} className="text-slate-500" />
                                 </label>
                                 <p className="text-slate-400 leading-relaxed">
                                    Taxa cobrada em vendas parceladas. Alto → mais receita financeira, mas menor atratividade e volume de vendas. Mantenha baixo (0.8–2.5%) em mercados competitivos.
                                 </p>
                              </div>

                              {/* Preço Unitário */}
                              <div className="space-y-2">
                                 <label className="font-semibold text-slate-300 flex items-center gap-2">
                                    Preço Unitário
                                    <HelpCircle size={14} className="text-slate-500" />
                                 </label>
                                 <p className="text-slate-400 leading-relaxed">
                                    Preço de venda na região. Alto → maior margem unitária, mas menor volume (elasticidade-preço). Baixo → ganha market share, mas comprime lucro. Alinhe com custo projetado + markup desejado.
                                 </p>
                              </div>

                              {/* Prazo de Recebimento */}
                              <div className="space-y-2">
                                 <label className="font-semibold text-slate-300 flex items-center gap-2">
                                    Prazo de Recebimento
                                    <HelpCircle size={14} className="text-slate-500" />
                                 </label>
                                 <p className="text-slate-400 leading-relaxed">
                                    Parcelamento oferecido. Prazo longo → mais vendas, mas fluxo de caixa piora e risco de inadimplência cresce. À vista → preserva liquidez, mas pode limitar volume em regiões sensíveis.
                                 </p>
                              </div>

                              {/* Campanhas de Marketing */}
                              <div className="space-y-2">
                                 <label className="font-semibold text-slate-300 flex items-center gap-2">
                                    Campanhas de Marketing (0–9)
                                    <HelpCircle size={14} className="text-slate-500" />
                                 </label>
                                 <p className="text-slate-400 leading-relaxed">
                                    Intensidade publicitária. Cada ponto aumenta demanda, mas consome verba fixa. Retorno decrescente: invista mais em regiões com alta elasticidade-preço. 0 = sem esforço, 9 = campanha agressiva.
                                 </p>
                              </div>
                              </div>
                           </div>

                           {/* Configuração global: Juros + Replicar */}
                           <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 bg-slate-900/60 p-6 lg:p-8 rounded-3xl border border-white/10 shadow-xl">
                              <div className="w-full lg:w-80 space-y-4">
                              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-3">
                                 Juros de Venda a Prazo (%)
                                 <HelpCircle size={16} className="text-slate-500 hover:text-orange-400 transition-colors cursor-help" />
                              </label>
                              <div className="relative">
                                 <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="20"
                                    value={decisions.production.term_interest_rate}
                                    onChange={e => updateDecision('production.term_interest_rate', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-5 py-4 text-xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                                    placeholder="0.00"
                                 />
                                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-orange-400">%</span>
                              </div>
                              </div>

                              <button
                              onClick={replicateInCluster}
                              disabled={Object.keys(decisions.regions).length <= 1}
                              className={`
                                 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-3 shadow-xl
                                 ${Object.keys(decisions.regions).length <= 1
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                    : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border border-orange-400/30 active:scale-95'}
                              `}
                              >
                              <RefreshCw size={16} />
                              Replicar Região 1
                              </button>
                           </div>



                           {/* Cards de regiões – agora bem compactos */}
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                              {Object.entries(decisions.regions).map(([id, reg]: [string, any]) => (
                              <div
                                 key={id}
                                 className="bg-slate-900/70 backdrop-blur-sm p-6 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 transition-all duration-300 group"
                              >
                                 <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-lg font-black text-orange-400 uppercase italic tracking-tight">
                                    {activeArena?.region_names?.[Number(id) - 1] || `Região ${id}`}
                                    </h4>
                                    <Globe size={20} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
                                 </div>

                                 <div className="space-y-6">
                                    {/* Preço */}
                                    <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Preço Unitário</label>
                                    <CurrencyInput
                                       value={reg.price}
                                       onChange={v => updateDecision(`regions.${id}.price`, v)}
                                       currency={activeArena?.currency || 'BRL'}
                                    />
                                    </div>

                                    {/* Prazo */}
                                    <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Prazo de Recebimento</label>
                                    <select
                                       value={reg.term}
                                       onChange={e => updateDecision(`regions.${id}.term`, parseInt(e.target.value))}
                                       className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-orange-500 transition-all appearance-none"
                                    >
                                       <option value={0}>A VISTA</option>
                                       <option value={1}>A VISTA + 50%</option>
                                       <option value={2}>A VISTA + 33% + 33%</option>
                                    </select>
                                    </div>

                                    {/* Marketing */}
                                    <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Marketing (0–9)</label>
                                    <input
                                       type="number"
                                       min="0"
                                       max="9"
                                       value={reg.marketing}
                                       onChange={e => {
                                          const val = Math.min(9, Math.max(0, parseInt(e.target.value) || 0));
                                          updateDecision(`regions.${id}.marketing`, val);
                                       }}
                                       className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base font-mono text-white outline-none focus:border-orange-500 transition-all"
                                    />
                                    </div>
                                 </div>
                              </div>
                              ))}
                           </div>

                           {/* Espaçamento final */}
                           <div className="h-20 lg:h-28" />
                        </div>
                        )}




                        {/* STEP 3 - ATIVOS */}
                        {activeStep === 2 && (
                        <div className="space-y-12 lg:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           {/* Cabeçalho do passo */}
                           <WizardStepHeader
                              icon={<Cpu size={32} strokeWidth={2.5} />}
                              title="Gestão de Ativos & CapEx"
                              desc="Analise o parque atual e decida sobre expansão (compra) ou desinvestimento (venda). Cada máquina nova exige operadores, treinamento e pode ter reajustes progressivos."
                              help="Venda gera caixa imediato (com deságio), mas reduz capacidade. Compra nova pode ser financiada via BDI com carência."
                           />

                           {/* Ajuda estratégica centralizada – aparece uma única vez */}
                           <div className="bg-slate-900/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/10 shadow-xl">
                              <h5 className="text-lg font-black text-orange-400 uppercase tracking-wide mb-6 flex items-center gap-3">
                              <Info size={20} /> Informações essenciais para decisões de CapEx
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-slate-300">
                              <div className="space-y-2">
                                 <span className="font-semibold text-emerald-300">Financiamento BDI (novas máquinas)</span>
                                 <p className="leading-relaxed">
                                    Carência de 4 rounds (paga apenas juros) + 4 rounds amortizando principal + juros. Taxa definida no macro. Ideal para expansão sem comprometer caixa imediato.
                                 </p>
                              </div>

                              <div className="space-y-2">
                                 <span className="font-semibold text-emerald-300">Operadores necessários</span>
                                 <p className="leading-relaxed">
                                    Cada máquina nova exige {currentMacro?.operators_per_machine || '~1.8–2.2'} operadores por unidade. Verifique saldo de RH → pode exigir contratações ou demissões.
                                 </p>
                              </div>

                              <div className="space-y-2">
                                 <span className="font-semibold text-emerald-300">Treinamento obrigatório</span>
                                 <p className="leading-relaxed">
                                    Máquina de modelo novo → equipe precisa de treinamento (investimento em % da folha ou valor fixo). Sem treinamento → produtividade inicial reduzida em 20–40%.
                                 </p>
                              </div>

                              <div className="space-y-2">
                                 <span className="font-semibold text-rose-300">Deságio na venda</span>
                                 <p className="leading-relaxed">
                                    Definido pelo tutor: <strong>{currentMacro?.machine_sale_discount || 0}%</strong> ({currentMacro?.machine_sale_discount_label || 'DESÁGIO VENDA MÁQUINAS'}). Valor líquido recebido = valor contábil × (1 - deságio).
                                 </p>
                              </div>

                              <div className="space-y-2">
                                 <span className="font-semibold text-orange-300">Reajustes de preço</span>
                                 <p className="leading-relaxed">
                                    Máquinas novas sofrem reajuste acumulado por round. Varia por modelo (ver valores abaixo). Ajuste é cumulativo desde o round inicial.
                                 </p>
                              </div>

                              <div className="space-y-2">
                                 <span className="font-semibold text-slate-300">Disponibilidade</span>
                                 <p className="leading-relaxed">
                                    Nem todo round permite compra. Status atual: <strong>{currentMacro.allow_machine_sale ? 'Disponível' : 'Bloqueado neste round'}</strong>.
                                 </p>
                              </div>
                              </div>
                           </div>

                           {/* Seção 1: Parque Atual */}
                           <div className="space-y-8">
                              <div className="flex items-center justify-between">
                              <h4 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                                 <Warehouse size={28} className="text-blue-400" />
                                 Parque Operacional Atual (P-{round})
                              </h4>
                              <span className="text-sm font-medium text-slate-400 italic">
                                 {activeTeam?.kpis?.machines?.length || 0} unidades instaladas
                              </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                              {(activeTeam?.kpis?.machines || []).map((m: MachineInstance, idx: number) => {
                                 const isSold = decisions.machinery.sell_ids?.includes(m.id);
                                 const spec = currentMacro.machine_specs?.[m.model];
                                 const currentDeprec = m.accumulated_depreciation + (m.acquisition_value / (spec?.useful_life_years || 40));
                                 const currentValue = Math.max(0, m.acquisition_value - currentDeprec);
                                 const desagio = currentMacro?.machine_sale_discount || 0;
                                 const valorVendaLiquida = currentValue * (1 - desagio / 100);

                                 return (
                                    <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.06 }}
                                    className={`
                                       bg-slate-900/70 backdrop-blur-sm p-6 rounded-3xl border transition-all duration-300
                                       ${isSold 
                                          ? 'border-rose-500/50 bg-rose-950/20' 
                                          : 'border-white/10 hover:border-blue-500/30'}
                                    `}
                                    >
                                    <div className="flex justify-between items-start mb-6">
                                       <div>
                                          <span className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                                          Unidade #{m.id}
                                          </span>
                                          <h5 className="text-lg font-black text-white uppercase tracking-tight">
                                          {m.model.toUpperCase()}
                                          </h5>
                                          <span className="text-sm text-slate-400 italic">
                                          Idade: {m.age + 1} round{m.age + 1 !== 1 ? 's' : ''}
                                          </span>
                                       </div>
                                       <div className={`p-4 rounded-2xl ${isSold ? 'bg-rose-600/20' : 'bg-blue-600/10'}`}>
                                          <Settings2 size={24} className={isSold ? 'text-rose-400' : 'text-blue-400'} />
                                       </div>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                       <div className="flex justify-between border-t border-white/5 pt-3">
                                          <span className="text-slate-300">Valor Contábil Residual</span>
                                          <span className={`font-mono font-bold ${isSold ? 'text-rose-400 line-through opacity-70' : 'text-emerald-400'}`}>
                                          {formatCurrency(currentValue, activeArena?.currency || 'BRL')}
                                          </span>
                                       </div>

                                       {isSold && (
                                          <div className="flex justify-between text-rose-300">
                                          <span>Valor Líquido Após Deságio ({desagio}%)</span>
                                          <span className="font-bold">{formatCurrency(valorVendaLiquida, activeArena?.currency || 'BRL')}</span>
                                          </div>
                                       )}

                                       <label className="flex items-center justify-end gap-3 cursor-pointer group pt-2">
                                          <span className={`text-sm font-semibold uppercase transition-colors ${isSold ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-400'}`}>
                                          {isSold ? 'Marcada para Venda' : 'Marcar para Venda'}
                                          </span>
                                          <input
                                          type="checkbox"
                                          checked={isSold}
                                          onChange={(e) => {
                                             const ids = [...(decisions.machinery.sell_ids || [])];
                                             if (e.target.checked) {
                                                if (!ids.includes(m.id)) ids.push(m.id);
                                             } else {
                                                const index = ids.indexOf(m.id);
                                                if (index > -1) ids.splice(index, 1);
                                             }
                                             updateDecision('machinery.sell_ids', ids);
                                          }}
                                          className="w-5 h-5 rounded border-2 border-slate-600 accent-rose-600 bg-slate-950"
                                          />
                                       </label>
                                    </div>
                                    </motion.div>
                                 );
                              })}
                              </div>
                           </div>

                           {/* Seção 2: Novas Ordens de Compra */}
                           <div className="space-y-8 pt-10 border-t border-white/10">
                              <div className="flex items-center justify-between">
                              <h4 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                                 <Plus size={28} className="text-emerald-400" />
                                 Novas Ordens de Compra
                              </h4>
                              {currentMacro.allow_machine_sale ? (
                                 <span className="px-5 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-sm font-semibold text-emerald-300">
                                    Mercado Aberto
                                 </span>
                              ) : (
                                 <span className="px-5 py-2 bg-rose-600/20 border border-rose-500/30 rounded-xl text-sm font-semibold text-rose-300">
                                    Compras Bloqueadas neste Round
                                 </span>
                              )}
                              </div>

                              {/* Exibição dos reajustes atuais por modelo */}
                              <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/5 text-sm">
                              <h6 className="text-orange-400 font-semibold mb-4">Reajustes acumulados atuais (para novas compras):</h6>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div>
                                    <span className="text-slate-400">Alfa:</span>{' '}
                                    <span className="font-mono text-orange-300">
                                    +{((getCumulativeAdjust(activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM, round - 1, 'machine_alpha_price_adjust') - 1) * 100).toFixed(1)}%
                                    </span>
                                 </div>
                                 <div>
                                    <span className="text-slate-400">Beta:</span>{' '}
                                    <span className="font-mono text-orange-300">
                                    +{((getCumulativeAdjust(activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM, round - 1, 'machine_beta_price_adjust') - 1) * 100).toFixed(1)}%
                                    </span>
                                 </div>
                                 <div>
                                    <span className="text-slate-400">Gama:</span>{' '}
                                    <span className="font-mono text-orange-300">
                                    +{((getCumulativeAdjust(activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM, round - 1, 'machine_gamma_price_adjust') - 1) * 100).toFixed(1)}%
                                    </span>
                                 </div>
                              </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                              <AssetCard
                                 model="alfa"
                                 val={decisions.machinery.buy.alfa}
                                 onChange={(v: number) => updateDecision('machinery.buy.alfa', v)}
                                 price={currentMacro.machinery_values.alfa * getCumulativeAdjust(activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM, round - 1, 'machine_alpha_price_adjust')}
                                 spec={currentMacro.machine_specs.alfa}
                                 disabled={!currentMacro.allow_machine_sale}
                              />
                              <AssetCard
                                 model="beta"
                                 val={decisions.machinery.buy.beta}
                                 onChange={(v: number) => updateDecision('machinery.buy.beta', v)}
                                 price={currentMacro.machinery_values.beta * getCumulativeAdjust(activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM, round - 1, 'machine_beta_price_adjust')}
                                 spec={currentMacro.machine_specs.beta}
                                 disabled={!currentMacro.allow_machine_sale}
                              />
                              <AssetCard
                                 model="gama"
                                 val={decisions.machinery.buy.gama}
                                 onChange={(v: number) => updateDecision('machinery.buy.gama', v)}
                                 price={currentMacro.machinery_values.gama * getCumulativeAdjust(activeArena?.round_rules || DEFAULT_INDUSTRIAL_CHRONOGRAM, round - 1, 'machine_gamma_price_adjust')}
                                 spec={currentMacro.machine_specs.gama}
                                 disabled={!currentMacro.allow_machine_sale}
                              />
                              </div>
                           </div>

                           {/* Espaçamento final */}
                           <div className="h-20 lg:h-28" />
                        </div>
                        )}

                        {/* STEP 4 - SUPRIMENTOS */}
                        {activeStep === 3 && (
                        <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           {/* Cabeçalho do passo */}
                           <WizardStepHeader 
                              icon={<Package size={32} strokeWidth={2.5} />} 
                              title="Cadeia de Suprimentos" 
                              desc="Defina as quantidades de matéria-prima a serem adquiridas e as condições de pagamento aos fornecedores. Decisões críticas para evitar rupturas de estoque ou excesso de capital parado." 
                              help="Lembre-se: Produto Acabado consome 3 MP-A e 2 MP-B por unidade produzida."
                           />

                           {/* Seção: Compras de Matéria-Prima */}
                           <div className="space-y-10">
                              <div className="flex items-center justify-between">
                              <h4 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                                 <Boxes size={28} className="text-orange-400" />
                                 Aquisição de Insumos
                              </h4>
                              <span className="text-sm font-medium text-slate-400 italic">
                                 Para produção do próximo período
                              </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                              {/* MP-A */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
                                 <div className="flex justify-between items-start mb-8">
                                    <div>
                                    <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-1">
                                       Matéria-Prima A
                                    </h5>
                                    <p className="text-sm text-slate-400 italic">
                                       Consumo: 3 unidades por produto acabado
                                    </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-orange-600/10">
                                    <Package size={28} className="text-orange-400" />
                                    </div>
                                 </div>

                                 <div className="space-y-6">
                                    <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    Quantidade a Comprar (unidades)
                                    <HelpCircle size={16} className="text-slate-500 hover:text-orange-400 transition-colors cursor-help" />
                                    </label>
                                    <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={decisions.production.purchaseMPA}
                                    onChange={e => updateDecision('production.purchaseMPA', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                                    placeholder="0"
                                    />
                                    <p className="text-xs text-slate-500 italic pt-2">
                                    Sugestão baseada em capacidade atual: {Math.round((activeTeam?.kpis?.production_capacity || 0) * 3 * 1.1 / 100)} – {Math.round((activeTeam?.kpis?.production_capacity || 0) * 3 * 1.3 / 100)} unidades
                                    </p>
                                 </div>
                              </div>

                              {/* MP-B */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
                                 <div className="flex justify-between items-start mb-8">
                                    <div>
                                    <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-1">
                                       Matéria-Prima B
                                    </h5>
                                    <p className="text-sm text-slate-400 italic">
                                       Consumo: 2 unidades por produto acabado
                                    </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-orange-600/10">
                                    <Package size={28} className="text-orange-400" />
                                    </div>
                                 </div>

                                 <div className="space-y-6">
                                    <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    Quantidade a Comprar (unidades)
                                    <HelpCircle size={16} className="text-slate-500 hover:text-orange-400 transition-colors cursor-help" />
                                    </label>
                                    <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={decisions.production.purchaseMPB}
                                    onChange={e => updateDecision('production.purchaseMPB', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                                    placeholder="0"
                                    />
                                    <p className="text-xs text-slate-500 italic pt-2">
                                    Sugestão baseada em capacidade atual: {Math.round((activeTeam?.kpis?.production_capacity || 0) * 2 * 1.1 / 100)} – {Math.round((activeTeam?.kpis?.production_capacity || 0) * 2 * 1.3 / 100)} unidades
                                    </p>
                                 </div>
                              </div>
                              </div>
                           </div>

                           {/* Seção: Condições de Pagamento */}
                           <div className="space-y-10 pt-12 border-t border-white/10">
                              <h4 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                              <Landmark size={28} className="text-emerald-400" />
                              Forma de Pagamento aos Fornecedores
                              </h4>

                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl max-w-2xl mx-auto">
                              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide mb-6 flex items-center gap-3">
                                 Condições de Pagamento
                                 <HelpCircle size={18} className="text-slate-500 hover:text-emerald-400 transition-colors cursor-help" />
                              </label>

                              <select
                                 value={decisions.production.paymentType}
                                 onChange={e => updateDecision('production.paymentType', parseInt(e.target.value))}
                                 className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-lg lg:text-xl font-semibold text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all appearance-none"
                              >
                                 <option value={0}>À vista (desconto implícito)</option>
                                 <option value={1}>À vista + 50% no próximo período</option>
                                 <option value={2}>Parcelado: à vista + 33% + 33%</option>
                              </select>

                              <div className="mt-8 p-6 bg-slate-950/60 rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed">
                                 <p className="font-medium mb-3">Impactos esperados:</p>
                                 <ul className="space-y-2 list-disc pl-5">
                                    <li>À vista → Melhor preço unitário, mas exige caixa imediato</li>
                                    <li>Parcelado → Preserva liquidez no curto prazo, mas aumenta custo financeiro</li>
                                 </ul>
                              </div>
                              </div>
                           </div>

                           {/* Espaçamento final */}
                           <div className="h-24 lg:h-32" />
                        </div>
                        )}

                        {/* STEP 5 - FÁBRICA */}
                        {activeStep === 4 && (
                        <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           {/* Cabeçalho do passo */}
                           <WizardStepHeader 
                              icon={<Factory size={32} strokeWidth={2.5} />} 
                              title="Chão de Fábrica & Operações" 
                              desc="Configure o nível de utilização da capacidade instalada, turnos extras e investimento em P&D. Essas decisões definem o volume produzido, custos operacionais e ganhos de eficiência de longo prazo." 
                              help="Atenção: Turno extra aumenta custos de mão de obra em 50%. P&D reduz custo unitário progressivamente."
                           />

                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                              {/* 1. Uso da Capacidade */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
                              <div className="flex justify-between items-start mb-8">
                                 <div>
                                    <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2">
                                    Uso da Capacidade Instalada
                                    </h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                    Percentual de utilização das máquinas disponíveis. Valores acima de 90% podem gerar desgaste extra e custos de manutenção não planejados.
                                    </p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-orange-600/10 group-hover:bg-orange-600/20 transition-colors">
                                    <Zap size={28} className="text-orange-400" />
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Nível de Utilização
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
                                    </label>
                                    <span className="text-2xl lg:text-3xl font-mono font-bold text-orange-400">
                                    {decisions.production.activityLevel}%
                                    </span>
                                 </div>

                                 <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={decisions.production.activityLevel}
                                    onChange={e => updateDecision('production.activityLevel', parseInt(e.target.value) || 0)}
                                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-lg hover:accent-orange-500 transition-all"
                                 />

                                 <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                                    <div>Baixo: Menor custo, menor produção</div>
                                    <div className="text-right">Alto: Maior produção, risco de breakdown</div>
                                 </div>
                              </div>
                              </div>

                              {/* 2. Turno Extra */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
                              <div className="flex justify-between items-start mb-8">
                                 <div>
                                    <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2">
                                    Turno Extra / Horas Adicionais
                                    </h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                    Produção além da capacidade normal. Aumenta a folha de pagamento em 50% sobre as horas extras e pode gerar fadiga da equipe.
                                    </p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-rose-600/10 group-hover:bg-rose-600/20 transition-colors">
                                    <Hammer size={28} className="text-rose-400" />
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Percentual de Turno Extra
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
                                    </label>
                                    <span className="text-2xl lg:text-3xl font-mono font-bold text-rose-400">
                                    {decisions.production.extraProductionPercent}%
                                    </span>
                                 </div>

                                 <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="5"
                                    value={decisions.production.extraProductionPercent}
                                    onChange={e => updateDecision('production.extraProductionPercent', parseInt(e.target.value) || 0)}
                                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-lg hover:accent-rose-500 transition-all"
                                 />

                                 <div className="text-xs text-rose-300 italic pt-2">
                                    Custo adicional estimado: +50% sobre MOD das horas extras
                                 </div>
                              </div>
                              </div>

                              {/* 3. Investimento em P&D */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
                              <div className="flex justify-between items-start mb-8">
                                 <div>
                                    <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2">
                                    Investimento em P&D
                                    </h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                    Percentual do faturamento bruto alocado em pesquisa e desenvolvimento. Reduz custo unitário ao longo dos rounds e aumenta atratividade do produto.
                                    </p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors">
                                    <Cpu size={28} className="text-blue-400" />
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Percentual do Faturamento Bruto
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
                                    </label>
                                    <span className="text-2xl lg:text-3xl font-mono font-bold text-blue-400">
                                    {decisions.production.rd_investment}%
                                    </span>
                                 </div>

                                 <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={decisions.production.rd_investment}
                                    onChange={e => updateDecision('production.rd_investment', parseFloat(e.target.value) || 0)}
                                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-lg hover:accent-blue-500 transition-all"
                                 />

                                 <div className="text-xs text-blue-300 italic pt-2">
                                    Efeito cumulativo: redução de custo unitário ~0.5–1.5% por ponto investido (longo prazo)
                                 </div>
                              </div>
                              </div>
                           </div>

                           {/* Caixa de alerta / resumo rápido */}
                           <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-8 lg:p-10 max-w-4xl mx-auto text-center">
                              <div className="flex items-center justify-center gap-4 mb-6">
                              <AlertTriangle size={24} className="text-yellow-400" />
                              <h6 className="text-lg font-black text-yellow-300 uppercase tracking-wide">
                                 Equilíbrio Operacional
                              </h6>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
                              Altos níveis de capacidade + turno extra aumentam produção imediata, mas elevam custos e riscos. Investimento contínuo em P&D é a chave para competitividade sustentável nos rounds finais.
                              </p>
                           </div>

                           {/* Espaçamento final */}
                           <div className="h-24 lg:h-32" />
                        </div>
                        )}

                        {/* STEP 6 - TALENTOS */}
                        {activeStep === 5 && (
                        <div className="space-y-16 lg:space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           {/* Cabeçalho do passo */}
                           <WizardStepHeader 
                              icon={<Users2 size={32} strokeWidth={2.5} />} 
                              title="Gestão de Talentos & RH" 
                              desc="Defina contratações, demissões, piso salarial e incentivos. Essas decisões afetam diretamente a produtividade, motivação da equipe, custos fixos e risco de greves ou turnover elevado." 
                              help="Salário baixo + pouca motivação pode gerar queda de produtividade e eventos negativos. Treinamento e bônus são investimentos de retorno médio/longo prazo."
                           />

                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                              {/* 1. Novas Admissões */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 group">
                              <div className="flex justify-between items-start mb-8">
                                 <div>
                                    <h5 className="text-xl font-black text-emerald-400 uppercase tracking-tight mb-2">
                                    Novas Admissões
                                    </h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                    Quantidade de novos colaboradores contratados neste round. Aumenta a capacidade produtiva (operadores por máquina), mas gera custo imediato de integração e folha.
                                    </p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-emerald-600/10 group-hover:bg-emerald-600/20 transition-colors">
                                    <UserPlus size={28} className="text-emerald-400" />
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Número de Contratações
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors cursor-help" />
                                    </label>
                                    <span className="text-2xl lg:text-3xl font-mono font-bold text-emerald-400">
                                    +{decisions.hr.hired}
                                    </span>
                                 </div>

                                 <input
                                    type="number"
                                    min="0"
                                    step="5"
                                    value={decisions.hr.hired}
                                    onChange={e => updateDecision('hr.hired', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    placeholder="0"
                                 />

                                 <p className="text-xs text-emerald-300 italic">
                                    Impacto: +{Math.round((decisions.hr.hired || 0) * (currentMacro?.operators_per_machine || 1.8))} operadores efetivos (estimado)
                                 </p>
                              </div>
                              </div>

                              {/* 2. Desligamentos */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-rose-500/30 hover:shadow-rose-500/10 transition-all duration-300 group">
                              <div className="flex justify-between items-start mb-8">
                                 <div>
                                    <h5 className="text-xl font-black text-rose-400 uppercase tracking-tight mb-2">
                                    Desligamentos
                                    </h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                    Número de funcionários demitidos. Reduz folha salarial, mas gera multa rescisória (estimada em 1–2 salários) e perda imediata de capacidade produtiva.
                                    </p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-rose-600/10 group-hover:bg-rose-600/20 transition-colors">
                                    <UserMinus size={28} className="text-rose-400" />
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Número de Demissões
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-rose-400 transition-colors cursor-help" />
                                    </label>
                                    <span className="text-2xl lg:text-3xl font-mono font-bold text-rose-400">
                                    -{decisions.hr.fired}
                                    </span>
                                 </div>

                                 <input
                                    type="number"
                                    min="0"
                                    step="5"
                                    value={decisions.hr.fired}
                                    onChange={e => updateDecision('hr.fired', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                    placeholder="0"
                                 />

                                 <p className="text-xs text-rose-300 italic">
                                    Custo estimado de rescisão: ~${formatCurrency((decisions.hr.fired || 0) * (decisions.hr.salary || 2000) * 1.5, 'BRL')}
                                 </p>
                              </div>
                              </div>

                              {/* 3. Piso Salarial */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
                              <div className="flex justify-between items-start mb-8">
                                 <div>
                                    <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-2">
                                    Piso Salarial Base
                                    </h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                    Salário mensal base por colaborador. Valores baixos reduzem custos fixos, mas impactam negativamente motivação, produtividade e atratividade para novas contratações.
                                    </p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-orange-600/10 group-hover:bg-orange-600/20 transition-colors">
                                    <DollarSign size={28} className="text-orange-400" />
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Salário Mensal Base
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors cursor-help" />
                                    </label>
                                    <span className="text-2xl lg:text-3xl font-mono font-bold text-orange-400">
                                    {formatCurrency(decisions.hr.salary, 'BRL')}
                                    </span>
                                 </div>

                                 <input
                                    type="number"
                                    min="1000"
                                    step="100"
                                    value={decisions.hr.salary}
                                    onChange={e => updateDecision('hr.salary', parseInt(e.target.value) || 2000)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-2xl lg:text-3xl font-mono font-bold text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                                    placeholder="2000"
                                 />

                                 <p className="text-xs text-orange-300 italic">
                                    Mínimo regional sugerido: R$ {currentMacro?.min_salary || 1800}
                                 </p>
                              </div>
                              </div>
                           </div>

                           {/* Incentivos variáveis – segunda linha */}
                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pt-8 border-t border-white/10">
                              {/* Treinamento */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-blue-500/30 hover:shadow-blue-500/10 transition-all duration-300 group">
                              <h5 className="text-xl font-black text-blue-400 uppercase tracking-tight mb-4 flex items-center gap-3">
                                 <Zap size={24} /> Treinamento (% da folha)
                              </h5>
                              <p className="text-sm text-slate-400 mb-6">
                                 Percentual investido em capacitação. Aumenta produtividade por homem-hora e reduz risco de obsolescência técnica.
                              </p>
                              <div className="flex items-center justify-between mb-4">
                                 <span className="text-sm font-semibold text-slate-300">{decisions.hr.trainingPercent}%</span>
                              </div>
                              <input
                                 type="range"
                                 min="0"
                                 max="15"
                                 step="0.5"
                                 value={decisions.hr.trainingPercent}
                                 onChange={e => updateDecision('hr.trainingPercent', parseFloat(e.target.value) || 0)}
                                 className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 hover:accent-blue-500"
                              />
                              </div>

                              {/* Participação nos Lucros */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 group">
                              <h5 className="text-xl font-black text-emerald-400 uppercase tracking-tight mb-4 flex items-center gap-3">
                                 <Coins size={24} /> Participação nos Lucros (PPR %)
                              </h5>
                              <p className="text-sm text-slate-400 mb-6">
                                 Percentual do lucro líquido distribuído como bônus. Motiva alinhamento com resultados da empresa, mas só pago se houver lucro.
                              </p>
                              <div className="flex items-center justify-between mb-4">
                                 <span className="text-sm font-semibold text-slate-300">{decisions.hr.participationPercent}%</span>
                              </div>
                              <input
                                 type="range"
                                 min="0"
                                 max="20"
                                 step="1"
                                 value={decisions.hr.participationPercent}
                                 onChange={e => updateDecision('hr.participationPercent', parseInt(e.target.value) || 0)}
                                 className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 hover:accent-emerald-500"
                              />
                              </div>

                              {/* Prêmio Produtividade */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 transition-all duration-300 group">
                              <h5 className="text-xl font-black text-orange-400 uppercase tracking-tight mb-4 flex items-center gap-3">
                                 <TrendingUp size={24} /> Prêmio por Produtividade (%)
                              </h5>
                              <p className="text-sm text-slate-400 mb-6">
                                 Bônus imediato baseado no atingimento de metas de produção. Aumenta motivação no curto prazo e produtividade efetiva.
                              </p>
                              <div className="flex items-center justify-between mb-4">
                                 <span className="text-sm font-semibold text-slate-300">{decisions.hr.productivityBonusPercent}%</span>
                              </div>
                              <input
                                 type="range"
                                 min="0"
                                 max="15"
                                 step="0.5"
                                 value={decisions.hr.productivityBonusPercent}
                                 onChange={e => updateDecision('hr.productivityBonusPercent', parseFloat(e.target.value) || 0)}
                                 className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 hover:accent-orange-500"
                              />
                              </div>
                           </div>

                           {/* Resumo de trade-offs */}
                           <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-8 lg:p-10 max-w-4xl mx-auto text-center mt-12">
                              <div className="flex items-center justify-center gap-4 mb-6">
                              <HeartPulse size={24} className="text-yellow-400" />
                              <h6 className="text-lg font-black text-yellow-300 uppercase tracking-wide">
                                 Equilíbrio de Pessoal
                              </h6>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto">
                              Folha alta + incentivos fortes = equipe motivada e produtiva, mas margem pressionada. Demissões excessivas ou salários baixos podem gerar eventos negativos (greves, baixa qualidade). O ideal é equilíbrio entre custo e motivação para sustentabilidade de longo prazo.
                              </p>
                           </div>

                           {/* Espaçamento final */}
                           <div className="h-24 lg:h-32" />
                        </div>
                        )}
                        {/* STEP 7 - FINANÇAS & METAS */}
                        {activeStep === 6 && (
                        <div className="space-y-16 lg:space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           {/* Cabeçalho do passo */}
                           <WizardStepHeader 
                              icon={<Landmark size={32} strokeWidth={2.5} />} 
                              title="Finanças & Mercado de Capitais" 
                              desc="Gerencie liquidez, alavancagem e aplicações financeiras. Decisões aqui definem a saúde de caixa, custo de capital e capacidade de investimento nos próximos rounds. Equilíbrio entre endividamento e aplicações é chave para evitar crises ou perda de oportunidade." 
                              help="Empréstimos compulsórios ocorrem automaticamente se o caixa fechar negativo (com ágio maior). Aplicações rendem no próximo período."
                           />

                           {/* Seção 1: Mercado de Capitais – Empréstimo + Aplicação */}
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                              {/* Empréstimo */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-12 rounded-3xl border border-white/10 shadow-xl hover:border-rose-500/30 hover:shadow-rose-500/10 transition-all duration-300 group">
                              <div className="flex justify-between items-start mb-10">
                                 <div className="max-w-[75%]">
                                    <h5 className="text-2xl font-black text-rose-400 uppercase tracking-tight mb-3">
                                    Requisição de Empréstimo
                                    </h5>
                                    <p className="text-base text-slate-300 leading-relaxed mb-6">
                                    Solicitação de novo capital via financiamento bancário. Taxa base: {currentMacro?.interest_rate_tr || 2}% ao período + spread de risco. Prazo escolhido afeta o fluxo de amortização.
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-rose-300 italic">
                                    <AlertTriangle size={18} />
                                    Caso o caixa feche negativo, o Oracle aplica empréstimo compulsório com ágio de {currentMacro?.compulsory_loan_agio || 4}% sobre a taxa base.
                                    </div>
                                 </div>
                                 <div className="p-5 rounded-2xl bg-rose-600/10 group-hover:bg-rose-600/20 transition-colors shrink-0">
                                    <DollarSign size={32} className="text-rose-400" />
                                 </div>
                              </div>

                              <div className="space-y-8">
                                 <div className="space-y-4">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Valor Solicitado
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-rose-400 transition-colors cursor-help" />
                                    </label>
                                    <input
                                    type="number"
                                    min="0"
                                    step="10000"
                                    value={decisions.finance.loanRequest}
                                    onChange={e => updateDecision('finance.loanRequest', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-3xl font-mono font-bold text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                    placeholder="0"
                                    />
                                 </div>

                                 <div className="space-y-4">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Prazo de Amortização
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-rose-400 transition-colors cursor-help" />
                                    </label>
                                    <select
                                    value={decisions.finance.loanTerm}
                                    onChange={e => updateDecision('finance.loanTerm', parseInt(e.target.value))}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-xl font-semibold text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all appearance-none"
                                    >
                                    <option value={0}>Curto – Quitação no próximo round</option>
                                    <option value={1}>Médio – À vista + 50% no próximo</option>
                                    <option value={2}>Longo – Parcelado em 3x (33% cada)</option>
                                    </select>
                                 </div>

                                 <div className="pt-4 text-sm text-rose-300 italic">
                                    Custo financeiro estimado aproximado: R$ {formatCurrency((decisions.finance.loanRequest || 0) * (currentMacro?.interest_rate_tr || 0.02) * (decisions.finance.loanTerm + 1), 'BRL')}
                                 </div>
                              </div>
                              </div>

                              {/* Aplicação Financeira */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-12 rounded-3xl border border-white/10 shadow-xl hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 group">
                              <div className="flex justify-between items-start mb-10">
                                 <div className="max-w-[75%]">
                                    <h5 className="text-2xl font-black text-emerald-400 uppercase tracking-tight mb-3">
                                    Aplicação Financeira
                                    </h5>
                                    <p className="text-base text-slate-300 leading-relaxed mb-6">
                                    Valor aplicado em títulos de renda fixa. Sai do caixa imediatamente e retorna no próximo round acrescido de rendimento ({currentMacro?.investment_return_rate || 1.8}% estimado).
                                    </p>
                                    <div className="text-sm text-emerald-300 italic">
                                    Ideal para excesso de caixa temporário ou estratégia conservadora de preservação de valor.
                                    </div>
                                 </div>
                                 <div className="p-5 rounded-2xl bg-emerald-600/10 group-hover:bg-emerald-600/20 transition-colors shrink-0">
                                    <Activity size={32} className="text-emerald-400" />
                                 </div>
                              </div>

                              <div className="space-y-8">
                                 <div className="space-y-4">
                                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Valor a Aplicar
                                    <HelpCircle size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors cursor-help" />
                                    </label>
                                    <input
                                    type="number"
                                    min="0"
                                    step="10000"
                                    value={decisions.finance.application}
                                    onChange={e => updateDecision('finance.application', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-3xl font-mono font-bold text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    placeholder="0"
                                    />
                                 </div>

                                 <div className="pt-4 text-sm text-emerald-300 italic">
                                    Rendimento projetado no próximo round: ~R$ {formatCurrency((decisions.finance.application || 0) * (currentMacro?.investment_return_rate || 0.018), 'BRL')}
                                 </div>
                              </div>
                              </div>
                           </div>

                           {/* Seção 2: Projeções e Metas Oracle */}
                           <div className="space-y-12 pt-16 border-t border-white/10">
                              <h4 className="text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                              <Target size={32} className="text-yellow-400" />
                              Previsões para Premiação Oracle
                              </h4>
                              <p className="text-base text-slate-300 max-w-3xl">
                              Preencha com o máximo de precisão possível. As premiações de auditoria dependem da proximidade entre previsão e resultado real (dentro da tolerância definida pelo macro).
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                              {/* Previsão Custo Unitário */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all duration-300 group">
                                 <h5 className="text-xl font-black text-yellow-400 uppercase tracking-tight mb-4">
                                    Previsão Custo Unitário (CPP)
                                 </h5>
                                 <p className="text-sm text-slate-400 mb-6">
                                    Estimativa do custo médio ponderado de produção. Tolerância Oracle: ±{currentMacro?.award_values?.cost_precision || 'R$ 5,00'}.
                                 </p>
                                 <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={decisions.estimates.forecasted_unit_cost}
                                    onChange={e => updateDecision('estimates.forecasted_unit_cost', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-3xl font-mono font-bold text-white outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 transition-all"
                                 />
                              </div>

                              {/* Previsão Faturamento */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all duration-300 group">
                                 <h5 className="text-xl font-black text-yellow-400 uppercase tracking-tight mb-4">
                                    Previsão Faturamento Bruto
                                 </h5>
                                 <p className="text-sm text-slate-400 mb-6">
                                    Estimativa de receita total. Tolerância Oracle: ±{currentMacro?.award_values?.revenue_precision || 'R$ 50.000'}.
                                 </p>
                                 <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={decisions.estimates.forecasted_revenue}
                                    onChange={e => updateDecision('estimates.forecasted_revenue', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-3xl font-mono font-bold text-white outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 transition-all"
                                 />
                              </div>

                              {/* Previsão Lucro Líquido */}
                              <div className="bg-slate-900/70 backdrop-blur-sm p-8 lg:p-10 rounded-3xl border border-white/10 shadow-xl hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all duration-300 group">
                                 <h5 className="text-xl font-black text-yellow-400 uppercase tracking-tight mb-4">
                                    Previsão Lucro Líquido
                                 </h5>
                                 <p className="text-sm text-slate-400 mb-6">
                                    Estimativa do resultado líquido final. Tolerância Oracle: ±{currentMacro?.award_values?.profit_precision || 'R$ 20.000'}.
                                 </p>
                                 <input
                                    type="number"
                                    min="-1000000"
                                    step="1000"
                                    value={decisions.estimates.forecasted_net_profit}
                                    onChange={e => updateDecision('estimates.forecasted_net_profit', parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-6 py-5 text-3xl font-mono font-bold text-white outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 transition-all"
                                 />
                              </div>
                              </div>
                           </div>

                           {/* Resumo de trade-offs financeiros */}
                           <div className="bg-slate-950/70 border border-white/5 rounded-3xl p-10 lg:p-12 max-w-4xl mx-auto text-center mt-16">
                              <div className="flex items-center justify-center gap-4 mb-6">
                              <Scale size={28} className="text-yellow-400" />
                              <h6 className="text-xl font-black text-yellow-300 uppercase tracking-wide">
                                 Equilíbrio Financeiro Estratégico
                              </h6>
                              </div>
                              <p className="text-base text-slate-300 leading-relaxed max-w-3xl mx-auto">
                              Endividamento excessivo aumenta risco de compulsório caro. Aplicações protegem caixa, mas reduzem liquidez imediata para CapEx ou suprimentos. As previsões precisas geram premiações Oracle significativas — use as projeções do header para calibrar.
                              </p>
                           </div>

                           {/* Espaçamento final */}
                           <div className="h-32 lg:h-40" />
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
                                 <p className="text-slate-400 font-medium italic">"Revise seu protocolo tático antes de selar o ciclo P-{round}."</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-6xl mx-auto pt-12">
                                 <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-4">
                                    <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest italic mb-4">Resumo Comercial</h4>
                                    <SummaryLine label="Preço Médio" val={`$ ${(Object.values(decisions.regions).reduce((a:any,b:any)=>a+(b.price||0), 0) / Math.max(1, Object.keys(decisions.regions).length)).toFixed(2)}`} />
                                    <SummaryLine label="Total Marketing" val={`${Object.values(decisions.regions).reduce((a:any,b:any)=>a+(b.marketing||0), 0)} units`} />
                                 </div>
                                 <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-4">
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

              </motion.div>
            ) : (
              <motion.div 
                key="hub" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col bg-slate-950 p-6 lg:p-10"
              >
                 <div className="flex justify-between items-end mb-10 shrink-0">
                    <div className="space-y-2">
                       <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Strategic <span className="text-orange-500">Hub</span></h2>
                       <p className="text-slate-400 font-medium italic">Visão 360° do Império: Histórico Auditado + Projeção</p>
                    </div>
                    <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
                       <HubTabBtn active={hubTab === 'dre'} onClick={() => setHubTab('dre')} label="DRE Master" icon={<TrendingUp size={14}/>} />
                       <HubTabBtn active={hubTab === 'balance'} onClick={() => setHubTab('balance')} label="Balanço Master" icon={<Landmark size={14}/>} />
                       <HubTabBtn active={hubTab === 'cashflow'} onClick={() => setHubTab('cashflow')} label="Fluxo de Caixa (DFC)" icon={<Activity size={14}/>} />
                       <HubTabBtn active={hubTab === 'strategic'} onClick={() => setHubTab('strategic')} label="Comando Estratégico" icon={<Target size={14}/>} />
                       <HubTabBtn active={hubTab === 'gazette'} onClick={() => setHubTab('gazette')} label="Gazeta Oracle" icon={<Newspaper size={14}/>} />
                    </div>
                 </div>

                  <div className="flex-1 overflow-hidden">
                    {hubTab === 'gazette' && activeArena ? (
                      <GazetteViewer 
                        arena={activeArena} 
                        aiNews="" 
                        round={round - 1} 
                        activeTeam={activeTeam} 
                        onClose={() => setHubTab('dre')} 
                      />
                    ) : (
                      <FinancialReportMatrix 
                        type={hubTab as any} 
                        history={history} 
                        projection={projections} 
                        currency={activeArena?.currency || 'BRL'} 
                      />
                    )}
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
  <div className="flex items-center gap-6 border-b border-white/5 pb-8">
     <div className="p-6 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shrink-0 text-orange-500">{icon}</div>
     <div>
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none flex items-center gap-3">
           {title} {help && <span title={help} className="cursor-help"><HelpCircle size={16} className="text-slate-700" /></span>}
        </h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic">{desc}</p>
     </div>
  </div>
);

const InputCard = ({ label, val, icon, onChange, help }: any) => (
  <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 space-y-4 shadow-2xl group hover:border-orange-500/20 transition-all">
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
       className="w-full bg-slate-950 border-2 border-white/5 rounded-xl p-4 text-xl font-mono font-black text-white outline-none focus:border-orange-600 shadow-inner" 
     />
  </div>
);

const RangeInput = ({ label, val, onChange, help, color = "orange" }: any) => (
  <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 space-y-6 shadow-2xl">
     <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
           {label} {help && <span title={help} className="cursor-help"><HelpCircle size={12} className="text-slate-700" /></span>}
        </label>
        <span className={`text-xl font-black font-mono ${color === 'orange' ? 'text-orange-500' : 'text-blue-500'}`}>{val}%</span>
     </div>
     <input 
       type="range" 
       min="0" 
       max="100" 
       value={val} 
       onChange={e => onChange(parseInt(e.target.value) || 0)} 
       className={`w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-${color === 'orange' ? 'orange-600' : 'blue-600'}`}
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

const AssetCard = ({ model, val, onChange, price, spec, disabled }: any) => (
  <div className={`bg-slate-900/80 p-6 rounded-2xl border transition-all shadow-xl ${disabled ? 'opacity-40 grayscale pointer-events-none border-white/5' : 'border-white/5 group hover:border-blue-500/30'}`}>
     <div className="flex justify-between items-center">
        <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Machine {model.toUpperCase()}</h4>
        <Cpu className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
     </div>
     <div className="space-y-4">
        <div className="space-y-1">
           <span className="text-[9px] font-black text-slate-500 uppercase">Preço Unitário Oracle</span>
           <div className="text-xl font-black text-blue-400 font-mono">$ {price.toLocaleString()}</div>
        </div>
        
        {spec && (
           <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                 <Users size={12} className="text-slate-500" />
                 <span className="text-[14px] font-black text-slate-400 uppercase tracking-widest">{spec.operators_required} operators required</span>
              </div>
              <div className="flex items-center gap-2">
                 <Zap size={12} className="text-slate-500" />
                 <span className="text-[14px] font-black text-slate-400 uppercase tracking-widest">{spec.production_capacity} units capacity</span>
              </div>
           </div>
        )}
     </div>
     <div className="pt-6 space-y-4">
        <label className="text-[14px] font-black text-slate-500 uppercase tracking-widest italic ml-2">COMPRAR (Qtd)</label>
        <input 
          type="number" 
          min="0" 
          disabled={disabled}
          value={val} 
          onChange={e => onChange(parseInt(e.target.value) || 0)} 
          className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-5 text-2xl font-mono font-black text-white outline-none focus:border-blue-600 shadow-inner disabled:opacity-50" 
        />
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

const CurrencyInput = ({ value, onChange, currency }: { value: number, onChange: (v: number) => void, currency: string }) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const numeric = parseInt(digits || '0') / 100;
    onChange(numeric);
  };

  return (
    <input 
      type="text" 
      value={display} 
      onChange={handleChange} 
      className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl p-5 text-2xl font-mono font-black text-white outline-none focus:border-orange-600 shadow-inner" 
    />
  );
};

export default DecisionForm;
