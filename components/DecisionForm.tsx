import React, { useState, useMemo, useEffect } from 'react';
import { 
  Loader2, Megaphone, Users2, Factory, DollarSign, 
  Gavel, ShieldCheck, ChevronLeft, ChevronRight, AlertTriangle, 
  Activity, BarChart3, Coins, Rocket, Sparkles, Sliders, Play, Landmark
} from 'lucide-react';
import { saveDecisions, getChampionships, supabase, getTeamSimulationHistory } from '../services/supabase';
import { DecisionData, Branch, Championship, Team, MachineInstance, MacroIndicators } from '../types';
import { calculateProjections } from '../services/simulation';
import { calculateESDS } from '../services/gemini';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM, INITIAL_MACHINES_P00 } from '../constants';
import { formatCurrency } from '../utils/formatters';

// Imports de Componentes Modulares de Steps
import { LegalStep } from './steps/LegalStep';
import { MarketingStep } from './steps/MarketingStep';
import { AssetsStep } from './steps/AssetsStep';
import { SupplyStep } from './steps/SupplyStep';
import { FactoryStep } from './steps/FactoryStep';
import { HRStep } from './steps/HRStep';
import { FinanceStep } from './steps/FinanceStep';
import { ReviewStep } from './steps/ReviewStep';
import { RightPreviewPanel } from './steps/RightPreviewPanel';

const STEPS = [
  { id: 'legal', label: '1. JURÍDICO', icon: Gavel },
  { id: 'marketing', label: '2. COMERCIAL', icon: Megaphone },
  { id: 'assets', label: '3. ATIVOS', icon: Factory },
  { id: 'production', label: '4. SUPRIMENTOS', icon: Coins },
  { id: 'factory', label: '5. FÁBRICA', icon: Factory },
  { id: 'hr', label: '6. TALENTOS', icon: Users2 },
  { id: 'finance', label: '7. FINANÇAS', icon: Landmark },
  { id: 'review', label: '8. ORÁCULO', icon: ShieldCheck },
];

const DecisionForm: React.FC<{ 
  teamId?: string; 
  champId?: string; 
  round: number; 
  branch?: Branch; 
  isReadOnly?: boolean; 
  isExpiredWaiting?: boolean; 
  onDecisionsChange?: (d: DecisionData) => void; 
  isTournamentFinished?: boolean;
  isLeftNavCollapsed?: boolean;
  setIsLeftNavCollapsed?: (c: boolean) => void;
  isRightPreviewCollapsed?: boolean;
  setIsRightPreviewCollapsed?: (c: boolean) => void;
}> = ({ 
  teamId, 
  champId, 
  round = 1, 
  branch = 'industrial', 
  isReadOnly = false, 
  isExpiredWaiting = false, 
  onDecisionsChange, 
  isTournamentFinished = false,
  isLeftNavCollapsed: isLeftNavCollapsedProp,
  setIsLeftNavCollapsed: setIsLeftNavCollapsedProp,
  isRightPreviewCollapsed: isRightPreviewCollapsedProp,
  setIsRightPreviewCollapsed: setIsRightPreviewCollapsedProp
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [isCalculatingESDS, setIsCalculatingESDS] = useState(false);
  const [projectedESDS, setProjectedESDS] = useState<any>(null);

  const [localLeftNavCollapsed, setLocalLeftNavCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('empirion_is_left_nav_collapsed') === 'true';
    }
    return false;
  });
  const isLeftNavCollapsed = isLeftNavCollapsedProp !== undefined ? isLeftNavCollapsedProp : localLeftNavCollapsed;
  const setIsLeftNavCollapsed = setIsLeftNavCollapsedProp !== undefined ? setIsLeftNavCollapsedProp : setLocalLeftNavCollapsed;
  const [isLeftNavHovered, setIsLeftNavHovered] = useState(false);

  const [localRightPreviewCollapsed, setLocalRightPreviewCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('empirion_is_right_preview_collapsed') === 'true';
    }
    return false;
  });
  const isRightPreviewCollapsed = isRightPreviewCollapsedProp !== undefined ? isRightPreviewCollapsedProp : localRightPreviewCollapsed;
  const setIsRightPreviewCollapsed = setIsRightPreviewCollapsedProp !== undefined ? setIsRightPreviewCollapsedProp : setLocalRightPreviewCollapsed;
  const [isRightPreviewHovered, setIsRightPreviewHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('empirion_is_left_nav_collapsed', String(isLeftNavCollapsed));
    }
  }, [isLeftNavCollapsed]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('empirion_is_right_preview_collapsed', String(isRightPreviewCollapsed));
    }
  }, [isRightPreviewCollapsed]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showValidationWarningModal, setShowValidationWarningModal] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const [decisions, setDecisions] = useState<DecisionData>({
    judicial_recovery: false,
    regions: {}, 
    hr: { hired: 0, fired: 0, salary: 2500, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0 },
    production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 100, extraProductionPercent: 0, rd_investment: 0, term_interest_rate: 0.00 },
    machinery: { buy: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 }, sell: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 }, sell_ids: [] },
    finance: { loanRequest: 0, loanTerm: 0, application: 0 },
    estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 }
  });

  useEffect(() => {
    if (onDecisionsChange && decisions) {
      onDecisionsChange(decisions);
    }
  }, [decisions, onDecisionsChange]);

  const currentMacro = useMemo(() => {
    if (!activeArena) return DEFAULT_MACRO;
    const rules = activeArena.round_rules?.[round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[round] || {};
    return { ...DEFAULT_MACRO, ...activeArena.market_indicators, ...rules } as MacroIndicators;
  }, [activeArena, round]);

  const projections = useMemo(() => {
    if (!activeArena || !activeTeam) return null;
    const currentRound = round;
    const indicators = {
      ...DEFAULT_MACRO,
      ...(activeArena.market_indicators || {}),
      ...(activeArena.round_rules?.[currentRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[currentRound] || {})
    };
    
    return calculateProjections(
      decisions,
      activeArena.branch || 'industrial',
      { ...(activeArena.config || (activeArena as any).ecosystem_config || {}), currency: activeArena.currency } as any,
      indicators,
      activeTeam,
      [],
      round,
      activeArena.round_rules
    );
  }, [decisions, activeArena, activeTeam, round]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeStep]);

  // Persistência em memória local para evitar perda ao navegar entre abas
  useEffect(() => {
    if (!teamId || !champId || isLoadingDraft) return;
    const currentKey = `${champId}_${teamId}_${round}`;
    if (loadedKey !== currentKey) return; 

    const key = `draft_decisions_${champId}_${teamId}_${round}`;
    localStorage.setItem(key, JSON.stringify(decisions));
  }, [decisions, teamId, champId, round, isLoadingDraft, loadedKey]);

  useEffect(() => {
    const initializeForm = async () => {
      if (!champId || !teamId) {
        setIsLoadingDraft(false);
        return;
      }
      setIsLoadingDraft(true);
      setLoadedKey(null); 
      try {
        const champsRes = await getChampionships();
        const historyRes = await getTeamSimulationHistory(teamId);
        
        setHistory(historyRes);
        const found = champsRes.data?.find(a => a.id === champId);
        if (found) setActiveArena(found);

        let team = found?.teams?.find((t: Team) => t.id === teamId);
        
        if (isReadOnly && historyRes) {
          const snapshot = historyRes.find((h: any) => h.round === round);
          if (snapshot) {
            team = snapshot.team_data;
          }
        }

        if (team) {
           const isZeroMode = found?.config?.starting_mode === 'start_from_zero' || found?.starting_mode === 'start_from_zero';
           if (round === 1 && (!team.kpis?.machines || team.kpis.machines.length === 0) && !isZeroMode) {
              team.kpis = { ...team.kpis, machines: INITIAL_MACHINES_P00 as MachineInstance[] };
           }
           setActiveTeam(team);
        }

        const table = found?.is_trial ? 'trial_decisions' : 'current_decisions';
        const { data: draft } = await supabase.from(table).select('data').eq('team_id', teamId).eq('round', round).maybeSingle();

        const localKey = `draft_decisions_${champId}_${teamId}_${round}`;
        const localDraft = localStorage.getItem(localKey);
        let finalData = draft?.data;

        if (localDraft) {
          try {
            finalData = JSON.parse(localDraft);
          } catch (e) {
            console.error("Erro ao carregar rascunho local", e);
          }
        }

        if (!finalData && round > 1) {
          try {
            const prevRound = round - 1;
            const { data: prevDraft } = await supabase.from(table).select('data').eq('team_id', teamId).eq('round', prevRound).maybeSingle();
            
            if (prevDraft?.data) {
              const baseDecisions = JSON.parse(JSON.stringify(prevDraft.data));
              
              baseDecisions.machinery = {
                buy: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 },
                sell: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 },
                sell_ids: []
              };
              
              if (baseDecisions.hr) {
                baseDecisions.hr.hired = 0;
                baseDecisions.hr.fired = 0;
              }
              
              if (baseDecisions.finance) {
                baseDecisions.finance.loanRequest = 0;
                baseDecisions.finance.loanTerm = 0;
                baseDecisions.finance.application = 0;
              }
              
              if (baseDecisions.estimates) {
                baseDecisions.estimates.forecasted_unit_cost = 0;
                baseDecisions.estimates.forecasted_revenue = 0;
                baseDecisions.estimates.forecasted_net_profit = 0;
              }

              finalData = baseDecisions;
              console.log(`[DECISÕES COCKPIT] Carregou base anterior e sanitizou CAPEX do Round ${prevRound} para o Round ${round}`);
            }
          } catch (prevErr) {
            console.error("Falha ao recuperar decisão do round anterior para carry-forward fiduciário:", prevErr);
          }
        }

        const currentRulesForRound = found?.round_rules?.[round] || DEFAULT_INDUSTRIAL_CHRONOGRAM[round] || found?.market_indicators || {};
        const isAllowedToBuyMachines = currentRulesForRound.allow_machine_sale;
        const isRoundZeroAndZeroMode = (found?.config?.starting_mode === 'start_from_zero' || found?.starting_mode === 'start_from_zero') && round === 0;

        if (finalData && (!isAllowedToBuyMachines || isRoundZeroAndZeroMode)) {
          if (finalData.machinery) {
            finalData.machinery.buy = { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 };
          }
        }

        const initialRegions: any = {};
        for (let i = 1; i <= (found?.regions_count || 1); i++) {
          const regId = i;
          const regionConf = 
            found?.config?.regions?.find((r: any) => r.id === regId) || 
            found?.config?.region_configs?.find((r: any) => r.id === regId) ||
            found?.config?.regions?.[i - 1] ||
            found?.config?.region_configs?.[i - 1];
          const defaultSugPrice = regionConf?.suggested_price !== undefined ? Number(regionConf.suggested_price) : 425;
          initialRegions[i] = finalData?.regions?.[i] || { price: defaultSugPrice, term: 0, marketing: 0 };
        }

        if (finalData) {
          setDecisions({ ...finalData, regions: initialRegions });
        } else {
          setDecisions({
            judicial_recovery: false,
            regions: initialRegions,
            hr: { hired: 0, fired: 0, salary: 2500, trainingPercent: 0, participationPercent: 0, productivityBonusPercent: 0, misc: 0 },
            production: { purchaseMPA: 0, purchaseMPB: 0, paymentType: 0, activityLevel: 100, extraProductionPercent: 0, rd_investment: 0, term_interest_rate: 0.00 },
            machinery: { buy: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 }, sell: { alpha: 0, alfa: 0, beta: 0, gamma: 0, gama: 0 }, sell_ids: [] },
            finance: { loanRequest: 0, loanTerm: 0, application: 0 },
            estimates: { forecasted_unit_cost: 0, forecasted_revenue: 0, forecasted_net_profit: 0 }
          });
        }
        setLoadedKey(`${champId}_${teamId}_${round}`);
      } catch (err) { console.error("Cockpit Error:", err); } 
      finally { setIsLoadingDraft(false); }
    };
    initializeForm();
  }, [champId, teamId, round]);

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

  const executeSaveDecisions = async () => {
    if (!teamId || !champId || isReadOnly) return;
    setIsSaving(true);
    try {
      const res = await saveDecisions(teamId, champId, round, decisions) as any;
      if (res.success) {
        setShowSuccessModal(true);
        setShowValidationWarningModal(false);
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      alert(`FALHA NA TRANSMISSÃO: ${err.message}`);
    } 
    finally { setIsSaving(false); }
  };

  const handleTransmit = async () => {
    if (!teamId || !champId || isReadOnly) return;

    const machines = projections?.kpis?.machines || [];
    const specs = currentMacro?.machine_specs as any;
    const operatorsRequired = machines.reduce((acc: number, m: any) => {
      const normModel = (m.model as string) === 'alfa' ? 'alpha' : (m.model as string) === 'gama' ? 'gamma' : m.model;
      const sReq = specs?.[normModel]?.operators_required ?? (normModel === 'alpha' ? 94 : normModel === 'beta' ? 235 : 445);
      return acc + sReq;
    }, 0);
    const operatorsAvailable = projections?.kpis?.staffing?.production || 0;

    const hasCriticalDiscrepancy = operatorsRequired > 0 && operatorsAvailable <= 0;

    if (hasCriticalDiscrepancy) {
      setShowValidationWarningModal(true);
    } else {
      await executeSaveDecisions();
    }
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

  const applyPreset = (presetType: 'conservadora' | 'equilibrada' | 'agressiva') => {
    if (isReadOnly) return;
    
    if (presetType === 'conservadora') {
      setDecisions(prev => {
        const next = { ...prev };
        next.production = {
          ...next.production,
          activityLevel: 70,
          extraProductionPercent: 0,
          rd_investment: 1,
        };
        next.hr = {
          ...next.hr,
          hired: 0,
          fired: 5,
          salary: Math.max(1800, currentMacro?.min_salary || 2500),
          trainingPercent: 1.5,
          participationPercent: 2,
          productivityBonusPercent: 2,
        };
        return next;
      });
    } else if (presetType === 'equilibrada') {
      setDecisions(prev => {
        const next = { ...prev };
        next.production = {
          ...next.production,
          activityLevel: 90,
          extraProductionPercent: 10,
          rd_investment: 3,
        };
        next.hr = {
          ...next.hr,
          hired: 5,
          fired: 0,
          salary: Math.round((currentMacro?.min_salary || 2500) * 1.1),
          trainingPercent: 4.5,
          participationPercent: 5,
          productivityBonusPercent: 6,
        };
        return next;
      });
    } else if (presetType === 'agressiva') {
      setDecisions(prev => {
        const next = { ...prev };
        next.production = {
          ...next.production,
          activityLevel: 100,
          extraProductionPercent: 40,
          rd_investment: 6.5,
        };
        next.hr = {
          ...next.hr,
          hired: 15,
          fired: 0,
          salary: Math.round((currentMacro?.min_salary || 2500) * 1.25),
          trainingPercent: 8,
          participationPercent: 10,
          productivityBonusPercent: 12,
        };
        return next;
      });
    }
  };

  if (isLoadingDraft) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950/20 rounded-[3rem]">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Terminal...</span>
    </div>
  );

  if (isTournamentFinished) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-[#020617] rounded-xl border border-white/5 overflow-hidden shadow-3xl">
      {/* HEADER TÁTICO FIXO */}
      <header className="px-4 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-20 shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-6 h-0.5 bg-orange-600 rounded-full" />
                  <span className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em] italic leading-none">Decision Terminal v2026</span>
               </div>
               <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mt-0.5">
                  {false ? (
                    <>
                      <span className="text-orange-500 font-black tracking-tight">{activeArena?.name}</span>
                      <span className="text-slate-600 px-2">•</span>
                    </>
                  ) : null}
                  <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">TERMINAL DE DECISÕES</span>
               </h2>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-3">
               <QuickKpi label="EBITDA Projetado" val={formatCurrency(projections?.kpis?.ebitda || 0, activeArena?.currency || 'BRL')} icon={<Activity size={12}/>} color="text-orange-400" />
               <QuickKpi label="Caixa Final T+1" val={formatCurrency(projections?.kpis?.statements?.cash_flow?.find((n: any) => n.id === 'cf.final')?.value || 0, activeArena?.currency || 'BRL')} icon={<Coins size={12}/>} color="text-emerald-400" />
               
               <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-xl border border-white/5 group relative hover:border-orange-500/30 transition-all cursor-help">
                  <div className="flex flex-col">
                     <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">E-SDS Projetado</span>
                     <span className={`text-xs font-black italic tracking-tighter ${projectedESDS ? (projectedESDS.zone === 'Azul' || projectedESDS.zone === 'Verde' ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-400'}`}>
                        {isCalculatingESDS ? 'Calculando...' : projectedESDS ? `${projectedESDS.display.toFixed(1)} (${projectedESDS.zone})` : '---'}
                     </span>
                  </div>
                  <button 
                    type="button"
                    onClick={handleSimulateESDS} 
                    disabled={isCalculatingESDS || !projections}
                    className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-all disabled:opacity-50 shadow-lg active:scale-90"
                    title="Simular E-SDS com IA"
                  >
                    <Sparkles size={12} className={isCalculatingESDS ? 'animate-spin' : ''} />
                  </button>

                  {projectedESDS && (
                    <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-[200] pointer-events-none">
                       <p className="text-[10px] font-black uppercase text-orange-500 mb-2">Projeção E-SDS v1.2</p>
                       <p className="text-[9px] text-slate-300 leading-tight mb-3">{projectedESDS.gemini_insights}</p>
                       {projectedESDS.top_gargalos && projectedESDS.top_gargalos.length > 0 && (
                          <div className="pt-2 border-t border-white/5">
                            <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Gargalos Projetados:</p>
                            <div className="flex flex-wrap gap-1">
                              {projectedESDS.top_gargalos.map((g: any, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[7px] font-black rounded uppercase border border-rose-500/30" title={`${g.percentage}% de impacto`}>
                                  {g.name}
                                </span>
                              ))}
                            </div>
                          </div>
                       )}
                    </div>
                  )}
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <button
               type="button"
               onClick={handleTransmit}
               disabled={isSaving || isReadOnly || isExpiredWaiting}
               className={`px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] transition-all flex items-center gap-2 active:scale-95 group ${
                 (isReadOnly || isExpiredWaiting)
                   ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed shadow-none'
                   : 'bg-emerald-600 text-white hover:bg-white hover:text-emerald-950 shadow-2xl shadow-emerald-600/20 cursor-pointer'
               }`}
            >
               {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />} {isExpiredWaiting ? 'Aguardando Turnover' : 'Transmitir Decisão'}
            </button>
         </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL COM SCROLL REAL */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
         <AnimatePresence mode="wait">
              <motion.div 
                key="inputs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col lg:flex-row lg:overflow-hidden"
              >
                 {/* COCKPIT DE CONTROLE - NAVEGAÇÃO LATERAL ESQUERDA */}
                 {isLeftNavCollapsed && (
                    <div className="hidden lg:block w-[72px] shrink-0 transition-all duration-300 pointer-events-none" />
                 )}
                 <div 
                    onMouseEnter={() => { if (isLeftNavCollapsed) setIsLeftNavHovered(true); }}
                    onMouseLeave={() => { if (isLeftNavCollapsed) setIsLeftNavHovered(false); }}
                    className={`hidden lg:flex flex-col bg-[#030712]/95 shrink-0 overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${
                       !isLeftNavCollapsed ? 'relative w-64 p-4 border-r border-white/5 z-30' : 
                       isLeftNavHovered ? 'absolute left-0 top-0 bottom-0 h-full w-64 p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-r border-white/15 z-50' : 'absolute left-0 top-0 bottom-0 h-full w-[72px] p-3 border-r border-white/10 z-30'
                    }`}
                 >
                    <div className={`mb-4 flex items-center pb-3 border-b border-white/5 ${(!isLeftNavCollapsed || isLeftNavHovered) ? 'justify-between gap-1' : 'flex-col justify-center gap-2'}`}>
                       {(!isLeftNavCollapsed || isLeftNavHovered) ? (
                          <>
                             <span className="text-[10px] font-black tracking-[0.2em] text-orange-500 uppercase font-mono truncate animate-in fade-in duration-300 font-sans">Empire Cockpit v2.0</span>
                             <button 
                                type="button"
                                onClick={() => {
                                   setIsLeftNavCollapsed(true);
                                   setIsLeftNavHovered(false);
                                }} 
                                className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors shrink-0 cursor-pointer"
                                title="Recolher painel"
                              >
                                <ChevronLeft size={14} />
                             </button>
                          </>
                       ) : (
                          <button 
                             type="button"
                             onClick={() => {
                                setIsLeftNavCollapsed(false);
                                setIsLeftNavHovered(false);
                             }} 
                             className="p-1 hover:bg-white/5 rounded-lg text-orange-500 hover:text-orange-400 transition-colors cursor-pointer"
                             title="Expandir painel"
                          >
                             <ChevronRight size={16} />
                          </button>
                       )}
                    </div>

                    {/* Controle 1: O Toggle de Operação Retrátil */}
                    {(!isLeftNavCollapsed || isLeftNavHovered) && (
                       <div className="flex justify-center p-1.5 mb-4 w-full" title="Modo Retrátil">
                          <button
                             type="button"
                             onClick={() => {
                                const nextVal = !isLeftNavCollapsed;
                                setIsLeftNavCollapsed(nextVal);
                                if (!nextVal) setIsLeftNavHovered(false);
                             }}
                             className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isLeftNavCollapsed 
                                   ? 'bg-orange-500/20 border-orange-500/30' 
                                   : 'bg-slate-950 border border-white/10'
                             }`}
                          >
                             <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                                   isLeftNavCollapsed ? 'translate-x-4 bg-orange-400' : 'translate-x-0 bg-slate-400'
                                }`}
                             />
                          </button>
                       </div>
                    )}

                    <div className="flex flex-col gap-1.5 flex-1 animate-in fade-in duration-300 w-full font-sans">
                       {STEPS.map((s, idx) => {
                          const Icon = s.icon;
                          const isCurrentExpanded = !isLeftNavCollapsed || isLeftNavHovered;
                          return (
                            <button
                               type="button"
                               key={s.id}
                               onClick={() => setActiveStep(idx)}
                               className={`w-full py-3.5 rounded-xl transition-all flex items-center border relative overflow-hidden group cursor-pointer ${!isCurrentExpanded ? 'justify-center px-0 animate-pulse-subtle' : 'justify-between px-4 text-left'} ${activeStep === idx ? 'bg-orange-600/15 border-orange-500/40 text-white shadow-xl' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                               title={!isCurrentExpanded ? s.label : undefined}
                            >
                               {activeStep === idx && (
                                 <motion.div layoutId="activeStepVertical" className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                               )}
                               <div className={`flex items-center ${!isCurrentExpanded ? 'justify-center' : 'gap-2.5'}`}>
                                  <Icon size={14} className={activeStep === idx ? 'text-orange-400' : 'group-hover:text-slate-300'} />
                                  {isCurrentExpanded && (
                                     <span className="text-[9px] font-black uppercase tracking-wider animate-in fade-in duration-300">{s.label.split('. ')[1] || s.label}</span>
                                  )}
                                </div>
                               {isCurrentExpanded && (
                                  <ChevronRight size={10} className={`opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0 ${activeStep === idx ? 'opacity-105 translate-x-0 text-orange-400' : ''}`} />
                                )}
                            </button>
                          );
                       })}
                    </div>
                 </div>

                 {/* WRAPPER CENTRAL (FORMULÁRIO) & DIREITO (LIVE PREVIEW) */}
                 <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden h-full">
                      {/* SUB-WRAPPER CENTRAL (NAV MOBILE + CONTEÚDO ATIVO) */}
                      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                         {/* NAV BAR DE PASSOS SUPERIOR (HORIZONTAL - EXCLUSIVO EM MOBILE/TABLET) */}
                         <nav className="flex lg:hidden p-1 gap-1 bg-slate-900/40 backdrop-blur-md border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
                            {STEPS.map((s, idx) => (
                              <button type="button" key={s.id} onClick={() => setActiveStep(idx)} className={`flex-1 min-w-[120px] py-3 px-3 rounded-xl transition-all flex flex-col items-center gap-1.5 border group relative overflow-hidden cursor-pointer ${activeStep === idx ? 'bg-orange-600 border-orange-400 text-white shadow-2xl scale-[1.02] z-10' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                                 {activeStep === idx && (
                                   <motion.div layoutId="activeStep" className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700 -z-10" />
                                 )}
                                 <s.icon size={14} strokeWidth={activeStep === idx ? 3 : 2} className={activeStep === idx ? 'drop-shadow-lg' : 'group-hover:scale-110 transition-transform'} />
                                 <span className="text-[8px] font-black uppercase tracking-[0.1em]">{s.label}</span>
                              </button>
                            ))}
                         </nav>

                         {/* NOVO: BARRA DE PRESETS RÁPIDOS DE DECISÃO (FRENTE 3) */}
                         {!isReadOnly && (activeStep === 4 || activeStep === 5) && (
                           <div className="px-6 py-4 bg-slate-950/60 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                             <div className="flex items-center gap-2">
                               <Sliders size={14} className="text-orange-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 font-sans">Presets de Operações Rápidas</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <button 
                                 type="button"
                                 onClick={() => applyPreset('conservadora')}
                                 className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400 rounded-xl border border-white/5 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                               >
                                 <Play size={10} className="text-blue-400" /> Conservadora (Foco Caixa)
                               </button>
                               <button 
                                 type="button"
                                 onClick={() => applyPreset('equilibrada')}
                                 className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400 rounded-xl border border-white/5 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse-subtle"
                               >
                                 <Play size={10} className="text-yellow-400" /> Equilibrada
                               </button>
                               <button 
                                 type="button"
                                 onClick={() => applyPreset('agressiva')}
                                 className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-[9px] font-black uppercase tracking-wider text-slate-400 rounded-xl border border-white/5 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                               >
                                 <Play size={10} className="text-rose-400" /> Expansão Agressiva
                               </button>
                             </div>
                           </div>
                         )}

                         {/* CONTEÚDO DO PASSO COM SCROLL VERTICAL */}
                         <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 bg-slate-950/40 relative">
                            <div className="w-full mx-auto pb-40 space-y-8 px-2">
                               
                               {/* PASSO 1 - JURÍDICO */}
                               {activeStep === 0 && (
                                 <LegalStep decisions={decisions} updateDecision={updateDecision} isReadOnly={isReadOnly} />
                               )}

                               {/* PASSO 2 - COMERCIAL / MARKETING */}
                               {activeStep === 1 && (
                                 <MarketingStep decisions={decisions} updateDecision={updateDecision} replicateInCluster={replicateInCluster} activeArena={activeArena} activeTeam={activeTeam} isReadOnly={isReadOnly} />
                               )}

                               {/* PASSO 3 - GESTÃO DE ATIVOS & CAPEX */}
                               {activeStep === 2 && (
                                 <AssetsStep decisions={decisions} updateDecision={updateDecision} activeArena={activeArena} activeTeam={activeTeam} round={round} currentMacro={currentMacro} isReadOnly={isReadOnly} />
                               )}

                               {/* PASSO 4 - SUPRIMENTOS / CADEIA DE SUPRIMENTOS */}
                               {activeStep === 3 && (
                                 <SupplyStep decisions={decisions} updateDecision={updateDecision} activeArena={activeArena} activeTeam={activeTeam} round={round} currentMacro={currentMacro} isReadOnly={isReadOnly} />
                               )}

                               {/* PASSO 5 - CHÃO DE FÁBRICA & OPERAÇÕES */}
                               {activeStep === 4 && (
                                 <FactoryStep decisions={decisions} updateDecision={updateDecision} activeArena={activeArena} activeTeam={activeTeam} currentMacro={currentMacro} isReadOnly={isReadOnly} />
                               )}

                               {/* PASSO 6 - GESTÃO DE TALENTOS & RH */}
                               {activeStep === 5 && (
                                 <HRStep decisions={decisions} updateDecision={updateDecision} activeArena={activeArena} activeTeam={activeTeam} currentMacro={currentMacro} isReadOnly={isReadOnly} round={round} />
                               )}

                               {/* PASSO 7 - FINANÇAS & MERCADO DE CAPITAIS */}
                               {activeStep === 6 && (
                                 <FinanceStep decisions={decisions} updateDecision={updateDecision} activeArena={activeArena} currentMacro={currentMacro} isReadOnly={isReadOnly} />
                               )}

                               {/* PASSO 8 - ORÁCULO DE REVISÃO E TRANSMISSÃO */}
                               {activeStep === 7 && (
                                 <ReviewStep decisions={decisions} round={round} projections={projections} currentMacro={currentMacro} activeArena={activeArena} />
                               )}

                            </div>
                         </div>
                      </div>
                      
                      {/* Placeholder estrutural quando colapsado para não mexer nos inputs sob hover flutuante */}
                      {isRightPreviewCollapsed && (
                         <div className="hidden lg:block w-12 shrink-0 transition-all duration-300 pointer-events-none" />
                      )}
                      
                      {/* COCKPIT PREVIEW: PAINEL LATERAL DIREITO COM ANÁLISE DE RISCO TÁTICO */}
                      <RightPreviewPanel 
                         decisions={decisions}
                         projections={projections}
                         activeArena={activeArena}
                         activeTeam={activeTeam}
                         round={round}
                         isRightPreviewCollapsed={isRightPreviewCollapsed}
                         setIsRightPreviewCollapsed={setIsRightPreviewCollapsed}
                         projectedESDS={projectedESDS}
                         isCalculatingESDS={isCalculatingESDS}
                         handleSimulateESDS={handleSimulateESDS}
                      />

                       {/* Modal de Sucesso após Transmissão */}
                       <AnimatePresence>
                         {showSuccessModal && (
                            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                              {/* Backdrop de vidro desfocado */}
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSuccessModal(false)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                                id="transmit_success_backdrop"
                              />

                              {/* Card do Modal */}
                              <motion.div
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                                className="relative w-full max-w-md bg-slate-900 border-2 border-white/5 rounded-[2rem] shadow-3xl overflow-hidden z-[100000] p-8 text-center space-y-6"
                                id="transmit_success_modal_card"
                              >
                                {/* Decoração superior verde esmeralda brilhante */}
                                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-600" />
                                
                                {/* Botão de fechar no canto superior direito */}
                                <button 
                                  type="button" 
                                  onClick={() => setShowSuccessModal(false)}
                                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded-xl border border-transparent"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>

                                {/* Ícone de sucesso animado */}
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner shadow-emerald-500/10 animate-pulse">
                                  <ShieldCheck size={36} className="text-emerald-500" />
                                </div>
                                
                                <div className="space-y-3">
                                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-sans">
                                    DECISÕES TRANSMITIDAS COM SUCESSO!
                                  </h3>
                                  <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                                    VOCÊ PODE ALTERAR QUALQUER DECISÃO ANTES QUE O PRAZO DO ROUND SEJA ENCERRADO.
                                  </p>
                                </div>

                                <div className="pt-2">
                                  <button 
                                    type="button"
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-emerald-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/30"
                                  >
                                    <ShieldCheck size={14} /> Confirmar e Continuar
                                  </button>
                                </div>
                              </motion.div>
                            </div>
                         )}
                       </AnimatePresence>

                       {/* Modal de Alerta de Discrepância / Gargalo Físico */}
                       <AnimatePresence>
                         {showValidationWarningModal && (
                            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                              {/* Backdrop de vidro desfocado */}
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowValidationWarningModal(false)}
                                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
                                id="validation_warning_backdrop"
                              />

                              {/* Card do Modal */}
                              <motion.div
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                                className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-500/30 rounded-[2rem] shadow-3xl overflow-hidden z-[100000] p-8 text-left space-y-6"
                                id="validation_warning_modal_card"
                              >
                                {/* Decoração superior vermelha brilhante */}
                                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-500" />
                                
                                {/* Botão de fechar no canto superior direito */}
                                <button 
                                  type="button" 
                                  onClick={() => setShowValidationWarningModal(false)}
                                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded-xl border border-transparent"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>

                                {/* Ícone de alerta animado */}
                                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center shadow-inner shadow-rose-500/10 animate-pulse-subtle">
                                  <AlertTriangle size={36} className="text-rose-500" />
                                </div>
                                
                                <div className="space-y-3">
                                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-sans">
                                    ⚠️ ALERTA CRÍTICO: GARGALO FÍSICO DETECTADO!
                                  </h3>
                                  <div className="text-slate-300 text-xs font-semibold leading-relaxed space-y-3.5">
                                    <p>
                                      O Monitor Fiduciário do Oracle Shield identificou que a sua equipe possui **máquinas ativas**, mas decidiu por **ZERO operários ativos** para operar a unidade produtiva neste ciclo.
                                    </p>
                                    <p className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 font-bold font-sans">
                                      Por consequência, o seu faturamento de vendas será ZERO, sua produção será ZERO e a empresa arcará com prejuízos severos decorrentes das despesas fabris e taxas operacionais de ociosidade!
                                    </p>
                                  </div>
                                 </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setShowValidationWarningModal(false);
                                      setActiveStep(5); // Redireciona para o Passo do RH (Talentos)
                                    }}
                                    className="py-3 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/20"
                                  >
                                    <Users2 size={13} /> Corrigir no RH (Recomendado)
                                  </button>
                                  
                                  <button 
                                    type="button"
                                    onClick={executeSaveDecisions}
                                    className="py-3 bg-transparent hover:bg-white/5 text-rose-400 hover:text-rose-300 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-rose-500/20"
                                  >
                                    <Play size={10} /> Transmitir Mesmo Assim
                                  </button>
                                </div>
                              </motion.div>
                            </div>
                         )}
                       </AnimatePresence>

                  </div>
               </motion.div>
          </AnimatePresence>
      </div>
    </div>
  );
};

const QuickKpi = ({ label, val, icon, color }: any) => (
  <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 font-sans">
     <div className={`${color}`}>{icon}</div>
     <div className="flex flex-col">
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
        <span className="text-[11px] font-black text-white italic mt-1">{val}</span>
     </div>
  </div>
);

export default DecisionForm;
