
import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, BarChart3, 
  Sparkles, Loader2, ShieldCheck, Newspaper, Cpu, 
  ChevronRight, Shield, FileEdit, PenTool, 
  Eye, Timer, Box, HeartPulse, Landmark, 
  Thermometer, EyeOff, Globe, Map, PieChart, Users,
  ArrowUpRight, ArrowDownRight, Layers, Table as TableIcon, Info,
  Trophy, AlertTriangle, Scale, Gauge,
  ChevronDown, Maximize2, Zap, ShieldAlert, ThermometerSun, Layers3,
  Factory, ShoppingCart, Flame, AlertOctagon, FileWarning,
  CheckCircle2, Lock, X, Receipt, History
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM as any;
import ChampionshipTimer from './ChampionshipTimer';
import DecisionForm from './DecisionForm';
import GazetteViewer from './GazetteViewer';
import BusinessPlanWizard from './BusinessPlanWizard';
import AuditLogViewer from './AuditLogViewer';
import { supabase, getChampionships, getUserProfile, getActiveBusinessPlan, getTeamSimulationHistory } from '../services/supabase';
import { Branch, Championship, UserRole, CreditRating, InsolvencyStatus, Team, KPIs } from '../types';
import { DEFAULT_INDUSTRIAL_CHRONOGRAM, DEFAULT_MACRO } from '../constants';

import FinancialReportMatrix from './FinancialReportMatrix';
import { calculateProjections } from '../services/simulation';

const Dashboard: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('player');
  const [loading, setLoading] = useState(true);
  const [showGazette, setShowGazette] = useState(false);
  const [showBP, setShowBP] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [bpStatus, setBpStatus] = useState<'pending' | 'draft' | 'submitted'>('pending');
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'decisoes' | 'financeiro' | 'historico'>('decisoes');
  const [hubTab, setHubTab] = useState<'dre' | 'balance' | 'cashflow' | 'strategic' | 'commitments'>('dre');
  const [decisions, setDecisions] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const visibleHistory = useMemo(() => {
    return history.filter(h => h.round <= selectedRound);
  }, [history, selectedRound]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const champId = localStorage.getItem('active_champ_id');
        const teamId = localStorage.getItem('active_team_id');
        if (!champId || !teamId) { navigate('/app/championships'); return; }
        
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session) {
          const profile = await getUserProfile(session.user.id);
          if (profile) setUserRole(profile.role);
        }

        const { data } = await getChampionships();
        const arena = data?.find(a => a.id === champId);
        if (arena) {
          setActiveArena(arena);
          const team = arena.teams?.find((t: any) => t.id === teamId);
          if (team) setActiveTeam(team);

          const currentRound = (arena.current_round || 0) + 1;
          setSelectedRound(currentRound);
          const { data: bp } = await getActiveBusinessPlan(teamId, currentRound);
          if (bp) setBpStatus(bp.status);
          
          const teamHistory = await getTeamSimulationHistory(teamId);
          setHistory(teamHistory);

          // Fetch current decisions for projection
          const table = arena.is_trial ? 'trial_decisions' : 'current_decisions';
          const { data: draft } = await supabase.from(table).select('data').eq('team_id', teamId).eq('round', currentRound).maybeSingle();
          if (draft?.data) setDecisions(draft.data);
        }
      } catch (err) { console.error("Cockpit Init Fault", err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [navigate]);

  const projections = useMemo(() => {
    if (!decisions || !activeArena || !activeTeam) return null;
    const currentRound = (activeArena.current_round || 0) + 1;
    const indicators = {
      ...DEFAULT_MACRO,
      ...(activeArena.market_indicators || {}),
      ...(activeArena.round_rules?.[currentRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[currentRound] || {})
    };
    
    return calculateProjections(
      decisions,
      activeArena.branch || 'industrial',
      (activeArena as any).ecosystem_config || {},
      indicators,
      activeTeam,
      history,
      currentRound,
      activeArena.round_rules
    );
  }, [decisions, activeArena, activeTeam, history]);

  const currentKpis = useMemo((): KPIs => {
    const baseFallback = {
      rating: 'AAA' as CreditRating,
      insolvency_status: 'SAUDAVEL' as InsolvencyStatus,
      equity: 7252171,
      market_share: 12.5,
      loans: [],
      statements: { dre: { revenue: 3322735 }, cash_flow: { outflow: { total: 0 } } }
    };

    const currentRound = (activeArena?.current_round || 0) + 1;

    if (selectedRound < currentRound) {
      const past = history.find(h => h.round === selectedRound);
      if (past) {
        const merged = { ...baseFallback, ...past, ...past.kpis } as any;
        // Normalização para E-SDS se vier das colunas da tabela
        if (!merged.esds && past.esds_score !== undefined) {
          merged.esds = {
            esds_display: past.esds_score,
            zone: past.esds_zone,
            gargalo_principal: past.esds_gargalo,
            gemini_insights: past.esds_insights,
            top_gargalos: past.esds_top_gargalos,
            main_drivers: past.esds_main_drivers
          };
        }
        return merged as KPIs;
      }
    }
    
    if (selectedRound === currentRound && projections?.kpis) {
      return { ...baseFallback, ...projections.kpis } as KPIs;
    }

    return { ...baseFallback, ...(activeTeam?.kpis || {}) } as KPIs;
  }, [activeTeam, selectedRound, activeArena, history, projections]);

  const trendOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', sparkline: { enabled: false } },
    colors: ['#f97316', '#3b82f6'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    xaxis: { 
      categories: visibleHistory.map(h => `P${h.round < 10 ? '0' : ''}${h.round}`), 
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 800 } } 
    },
    yaxis: { labels: { style: { colors: '#64748b', fontSize: '10px' } } },
    tooltip: { theme: 'dark' },
    legend: { show: false }
  };

  const trendSeries = [
    { name: 'Equity', data: visibleHistory.map(h => h.equity) },
    { name: 'Liquidez', data: visibleHistory.map(h => h.kpis?.liquidity_current || 0) }
  ];

  if (loading) return <div className="flex-1 flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-orange-600" size={48} /></div>;

  const currentRound = (activeArena?.current_round || 0) + 1;
  const requireBP = activeArena?.round_rules?.[currentRound]?.require_business_plan;
  const isPastRound = selectedRound < currentRound;
  const isFutureRound = selectedRound > currentRound;

  return (
    <div className="flex-1 flex flex-col bg-[#020617] text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Header fixo superior – KPIs + Timer */}
      <section className="h-16 shrink-0 grid grid-cols-2 md:grid-cols-6 bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-20 shadow-2xl">
         <CockpitStat label={t('Equity')} val={`$ ${(currentKpis.equity / 1000000).toFixed(2)}M`} trend={selectedRound === currentRound ? "Proj" : "Real"} pos icon={<ShieldCheck size={12}/>} />
         <CockpitStat 
            label="E-SDS" 
            val={(currentKpis.esds?.esds_display || 0).toFixed(1)} 
            trend={selectedRound === currentRound ? "Proj" : (currentKpis.esds?.zone || 'ALERTA')} 
            pos={currentKpis.esds?.zone === 'Azul' || currentKpis.esds?.zone === 'Verde'}
            neg={currentKpis.esds?.zone === 'Laranja' || currentKpis.esds?.zone === 'Vermelho'}
            icon={<Gauge size={12}/>} 
            tooltip={
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={8} className="text-orange-500" />
                  <p className="text-[8px] font-black uppercase text-orange-500 tracking-widest">Diagnóstico E-SDS</p>
                </div>
                <p className="text-[7px] text-slate-300 leading-tight italic">{currentKpis.esds?.gemini_insights || 'Análise indisponível'}</p>
                {currentKpis.esds?.top_gargalos && currentKpis.esds.top_gargalos.length > 0 && (
                  <div className="pt-1.5 border-t border-white/10">
                    <p className="text-[6px] font-black uppercase text-slate-500 mb-0.5 tracking-widest">Principais Detratores:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentKpis.esds.top_gargalos.map((g, i) => (
                        <span key={i} className="px-1 py-0.5 bg-rose-500/10 text-rose-400 text-[5px] font-black rounded-full uppercase border border-rose-500/20" title={`${g.percentage}% de impacto`}>
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            }
         />
         <CockpitStat label={t('Inventory Turnover')} val={(currentKpis.inventory_turnover || 0).toFixed(1)} trend={selectedRound === currentRound ? "Proj" : "Real"} pos icon={<Box size={12}/>} />
         <CockpitStat label={t('Liquidity')} val={(currentKpis.liquidity_current || 1.0).toFixed(2)} trend={selectedRound === currentRound ? "Proj" : "Real"} pos icon={<Activity size={12}/>} />
         <CockpitStat label={t('Rating')} val={currentKpis.rating} trend={selectedRound === currentRound ? "Proj" : "Real"} pos icon={<Shield size={12}/>} />
         <div className="px-2 flex items-center justify-center border-l border-white/5 bg-gradient-to-br from-orange-600/10 to-transparent">
            <ChampionshipTimer variant="compact" roundStartedAt={activeArena?.round_started_at} createdAt={activeArena?.created_at} deadlineValue={activeArena?.deadline_value} deadlineUnit={activeArena?.deadline_unit} />
         </div>
      </section>
 
      {/* 2. Área principal expansível */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
         {/* Sidebar esquerda – Intel Pulse (fixa, scrollável) */}
         <aside className={`${isSidebarCollapsed ? 'w-12' : 'w-[260px]'} shrink-0 bg-slate-900/40 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 z-10 relative`}>
            {/* Toggle Button */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-2.5 top-16 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg z-20 hover:bg-orange-500 transition-colors"
            >
              <ChevronRight size={12} className={`transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>

            <div className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar p-3 space-y-4 ${isSidebarCollapsed ? 'items-center overflow-x-hidden' : ''}`}>
              <header className={`flex items-center justify-between border-b border-white/5 pb-2 ${isSidebarCollapsed ? 'flex-col gap-2' : ''}`}>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col">
                    <h3 className="text-[8px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-0.5">
                      <Zap size={8} className="fill-orange-500" /> {t('intel_pulse')}
                    </h3>
                    <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest italic">Monitoramento Live</span>
                  </div>
                )}
                {isSidebarCollapsed && <Zap size={12} className="text-orange-500" />}
                <button onClick={() => setShowAudit(true)} className="p-1.5 bg-white/5 hover:bg-orange-600 rounded-lg transition-all text-slate-500 hover:text-white group shadow-lg" title={t('audit_history')}>
                  <History size={10} className="group-hover:rotate-[-45deg] transition-transform" />
                </button>
              </header>

              {!isSidebarCollapsed ? (
                <>
                  <div className={`p-2.5 rounded-2xl border space-y-2 shadow-2xl transition-all relative overflow-hidden group ${requireBP && bpStatus !== 'submitted' ? 'bg-orange-600/10 border-orange-500/40' : 'bg-slate-950/80 border-white/5 hover:border-white/10'}`}>
                    {requireBP && bpStatus !== 'submitted' && (
                      <div className="absolute top-0 right-0 p-2">
                          <div className="w-1 h-1 bg-orange-500 rounded-full animate-ping" />
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                        <div className={`p-1 rounded-lg ${requireBP ? 'bg-orange-600/20 text-orange-500' : 'bg-slate-800 text-slate-600'}`}>
                          <PenTool size={14} />
                        </div>
                        {bpStatus === 'submitted' && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <CheckCircle2 size={8} className="text-emerald-500" />
                            <span className="text-[6px] font-black text-emerald-500 uppercase">Enviado</span>
                          </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase text-white tracking-tight">{t('Business Plan')}</h4>
                        <p className={`text-[7px] font-bold uppercase mt-0.5 tracking-widest leading-relaxed ${requireBP && bpStatus !== 'submitted' ? 'text-orange-400' : 'text-slate-500'}`}>
                          {requireBP ? `${t('requirement')} P-${(activeArena?.current_round || 0) + 1}` : t('optional_cycle')}
                        </p>
                    </div>
                    <button onClick={() => setShowBP(true)} className="w-full py-1 bg-white/5 hover:bg-orange-600 text-white rounded-lg text-[8px] font-black uppercase tracking-[0.1em] transition-all shadow-xl border border-white/5 hover:border-transparent active:scale-95">{t('Editar BP')}</button>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-3 shadow-2xl group">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                          <TrendingUp size={10} className="text-blue-500" /> {t('Equity History')}
                        </h4>
                        <Maximize2 size={8} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                    </div>
                    <div className="h-28 -mx-1">
                        <Chart options={trendOptions} series={trendSeries} type="area" height="100%" />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-3 shadow-2xl">
                    <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                      <Scale size={10} className="text-emerald-500" /> PMR vs PMP
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[8px] font-bold uppercase">
                          <span className="text-slate-600">{t('Receivable Days')}</span>
                          <span className="text-white font-mono">{currentKpis.avg_receivable_days?.toFixed(0) ?? 45} {t('days')}</span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-bold uppercase">
                          <span className="text-slate-600">{t('Payable Days')}</span>
                          <span className="text-white font-mono">{currentKpis.avg_payable_days?.toFixed(0) ?? 30} {t('days')}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between items-end">
                          <div className="flex flex-col">
                              <span className="text-[6px] font-black text-rose-500 uppercase tracking-widest mb-0.5">{t('Scissors Effect')}</span>
                              <span className="text-[5px] text-slate-600 uppercase font-bold">Risco de Liquidez</span>
                          </div>
                          <span className="text-lg font-black text-rose-500 italic tracking-tighter">{currentKpis.scissors_effect?.toFixed(1) ?? -15.0} {t('days')}</span>
                        </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 items-center py-2">
                  <button onClick={() => setShowBP(true)} className="p-2 bg-white/5 hover:bg-orange-600 text-white rounded-lg transition-all border border-white/5" title={t('Business Plan')}>
                    <PenTool size={16} />
                  </button>
                  <button onClick={() => setActiveTab('historico')} className="p-2 bg-white/5 hover:bg-blue-600 text-white rounded-lg transition-all border border-white/5" title={t('Equity History')}>
                    <TrendingUp size={16} />
                  </button>
                  <div className="p-2 bg-white/5 text-emerald-500 rounded-lg border border-white/5" title="PMR vs PMP">
                    <Scale size={16} />
                  </div>
                </div>
              )}
            </div>
         </aside>

         {/* Conteúdo central – tabs ou seções */}
         <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-950">
            <div className="w-full flex-1 flex flex-col p-1 lg:p-2">
               {/* Sub-header: Protocolo v18.0 • Cycle 0X + Oracle Gazette botão */}
               <header className="shrink-0 flex justify-between items-center mb-1 border-b border-white/10 pb-1">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">
                      COCKPIT <span className="text-orange-600 drop-shadow-[0_0_20px_rgba(234,88,12,0.4)]">OPERACIONAL</span>
                    </h2>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] italic flex items-center gap-1.5">
                      <Cpu size={10} className="text-orange-600/50" />
                      Protocolo v18.0 • {selectedRound === currentRound ? `${t('cycle')} 0${selectedRound}` : selectedRound < currentRound ? `Histórico P-${selectedRound}` : `Planejamento P-${selectedRound}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isPastRound && (
                      <div className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg font-black text-[8px] uppercase tracking-[0.1em] flex items-center gap-1.5 shadow-2xl backdrop-blur-md">
                        <History size={12} className="animate-pulse" /> Modo Consulta
                      </div>
                    )}
                    <button onClick={() => setShowGazette(true)} className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white rounded-lg font-black text-[8px] uppercase tracking-[0.1em] hover:bg-orange-600 hover:border-orange-400 transition-all flex items-center gap-1.5 shadow-2xl active:scale-95 group">
                      <Newspaper size={12} className="group-hover:rotate-12 transition-transform" /> Oracle Gazette
                    </button>
                  </div>
               </header>

               {/* Tabs principais */}
               <div className="flex-1 flex flex-col">
                  <nav className="shrink-0 flex gap-1 border-b border-white/5 mb-1.5">
                    <TabButton active={activeTab === 'decisoes'} onClick={() => setActiveTab('decisoes')} label="Decisões da Rodada" icon={<PenTool size={10}/>} />
                    <TabButton active={activeTab === 'financeiro'} onClick={() => setActiveTab('financeiro')} label="Matriz Financeira" icon={<TableIcon size={10}/>} />
                    <TabButton active={activeTab === 'historico'} onClick={() => setActiveTab('historico')} label="Histórico & Projeções" icon={<BarChart3 size={10}/>} />
                  </nav>

                  <div className="flex-1">
                    {activeTab === 'decisoes' && (
                      <div className="h-full">
                        {selectedRound === currentRound && requireBP && bpStatus !== 'submitted' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mb-3 p-3 bg-orange-600/20 border border-orange-500/50 rounded-lg flex items-center gap-3 shadow-lg shrink-0"
                          >
                             <div className="p-1.5 bg-orange-600 rounded-lg text-white animate-pulse">
                                <AlertTriangle size={16} />
                             </div>
                             <div className="flex-1">
                                <h4 className="text-[9px] font-black text-white uppercase italic">Protocolo de Decisão Bloqueado</h4>
                                <p className="text-[8px] font-bold text-orange-400 uppercase tracking-widest mt-0.5">
                                   Esta rodada exige o envio do **Business Plan** antes da liberação do Cockpit Operacional.
                                </p>
                             </div>
                             <button 
                                onClick={() => setShowBP(true)}
                                className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-orange-600 transition-all shadow-xl"
                             >
                                Abrir Wizard de Plano
                             </button>
                          </motion.div>
                        )}

                        <DecisionForm 
                          teamId={activeTeam?.id} 
                          champId={activeArena?.id} 
                          round={selectedRound} 
                          branch={activeArena?.branch}
                          isReadOnly={userRole === 'observer' || (requireBP && bpStatus !== 'submitted' && selectedRound === currentRound) || isPastRound || isFutureRound}
                          onDecisionsChange={(d) => setDecisions(d)}
                        />
                      </div>
                    )}

                    {activeTab === 'financeiro' && (
                      <div className="space-y-4 h-full flex flex-col">
                        <div className="flex gap-1 p-0.5 bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl shrink-0 overflow-x-auto no-scrollbar">
                          <HubTabBtn active={hubTab === 'dre'} onClick={() => setHubTab('dre')} label="DRE" icon={<TrendingUp size={10}/>} />
                          <HubTabBtn active={hubTab === 'balance'} onClick={() => setHubTab('balance')} label="Balanço Patrimonial" icon={<Landmark size={10}/>} />
                          <HubTabBtn active={hubTab === 'cashflow'} onClick={() => setHubTab('cashflow')} label="Fluxo de Caixa" icon={<Activity size={10}/>} />
                          <HubTabBtn active={hubTab === 'commitments'} onClick={() => setHubTab('commitments')} label="Agenda Financeira" icon={<Landmark size={10}/>} />
                          <HubTabBtn active={hubTab === 'strategic'} onClick={() => setHubTab('strategic')} label="Comando Estratégico" icon={<Target size={10}/>} />
                        </div>
                        <div className="flex-1">
                          <FinancialReportMatrix 
                            type={hubTab} 
                            history={visibleHistory} 
                            projection={selectedRound === currentRound ? projections : null} 
                            currency={activeArena?.currency || 'BRL'} 
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'historico' && (
                      <div className="space-y-6 pb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-3 shadow-2xl">
                             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                               <TrendingUp size={14} className="text-blue-500" /> Evolução do Patrimônio Líquido
                             </h4>
                             <div className="h-64">
                                <Chart options={{...trendOptions, chart: { ...trendOptions.chart, sparkline: { enabled: false } }}} series={[{ name: 'Equity', data: visibleHistory.map(h => h.equity) }]} type="area" height="100%" />
                             </div>
                          </div>
                          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-3 shadow-2xl">
                             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                               <Activity size={14} className="text-emerald-500" /> Índice de Liquidez Corrente
                             </h4>
                             <div className="h-64">
                                <Chart options={{...trendOptions, colors: ['#10b981']}} series={[{ name: 'Liquidez', data: visibleHistory.map(h => h.kpis?.liquidity_current || 0) }]} type="area" height="100%" />
                             </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-4 shadow-2xl">
                           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                             <AlertTriangle size={14} className="text-orange-500" /> Alertas de Gargalos Estratégicos (E-SDS)
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {currentKpis.esds?.top_gargalos?.map((g, i) => (
                                <div key={i} className="p-4 bg-slate-950/80 rounded-lg border border-white/5 space-y-1.5">
                                   <div className="flex justify-between items-start">
                                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">{g.name}</span>
                                      <span className="text-base font-black text-white italic">{g.percentage}%</span>
                                   </div>
                                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-rose-500" style={{ width: `${g.percentage}%` }} />
                                   </div>
                                   <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Impacto crítico na solvência dinâmica.</p>
                                </div>
                              ))}
                              {(!currentKpis.esds?.top_gargalos || currentKpis.esds.top_gargalos.length === 0) && (
                                <div className="col-span-3 py-6 text-center">
                                   <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-2 opacity-20" />
                                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Nenhum gargalo crítico detectado.</p>
                                </div>
                              )}
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
               </div>

               {/* 3. Timeline inferior – rodadas P-1–P12 (Movida para dentro do scrollable main) */}
               <footer className="mt-4 py-2 bg-slate-900/40 border-t border-white/5 flex items-center justify-center px-4 shrink-0">
                  <div className="w-full flex items-center justify-between relative">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                      {Array.from({ length: (activeArena?.total_rounds || 12) + 1 }).map((_, i) => {
                        const rules = activeArena?.round_rules?.[i] || DEFAULT_INDUSTRIAL_CHRONOGRAM[i] || activeArena?.market_indicators;
                        const hasBP = rules?.require_business_plan;
                        const isCurrent = i === currentRound;
                        const isSelected = i === selectedRound;
                        const isPast = i < currentRound;
                        
                        return (
                            <div key={i} className="relative flex flex-col items-center">
                              <button 
                                onClick={() => setSelectedRound(i)} 
                                className={`relative z-10 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center group ${
                                  isSelected ? 'bg-orange-600 border-orange-400 scale-110 shadow-[0_0_15px_#f97316]' : 
                                  isCurrent ? 'bg-slate-800 border-orange-500 animate-pulse' :
                                  isPast ? 'bg-slate-800 border-blue-500/50' : 
                                  'bg-slate-950 border-white/5 opacity-40'
                                }`}
                              >
                                  <span className={`text-[8px] font-black font-mono ${isSelected ? 'text-white' : 'text-slate-500'}`}>P{i < 10 ? `0${i}` : i}</span>
                                  
                                  {/* Metadata Icons */}
                                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1">
                                    {hasBP && <div className="p-0.5 bg-blue-600 rounded text-[3px] text-white font-black uppercase flex items-center gap-0.5 shadow-lg border border-white/20" title="Business Plan Obrigatório"><FileEdit size={3}/> BP</div>}
                                  </div>
                              </button>
                              {isSelected && (
                                <div className="absolute -bottom-4 whitespace-nowrap">
                                  <span className="text-[5px] font-black text-orange-500 uppercase tracking-tighter">{isCurrent ? 'Atual' : isPast ? 'Passado' : 'Futuro'}</span>
                                </div>
                              )}
                            </div>
                        );
                      })}
                  </div>
               </footer>
            </div>
         </main>
      </div>
      <AnimatePresence>
        {showBP && (
          <div className="fixed inset-0 z-[6000] bg-slate-950/98 backdrop-blur-2xl overflow-y-auto">
             <button onClick={() => setShowBP(false)} className="fixed top-10 right-10 p-5 bg-white/5 hover:bg-rose-600 text-white rounded-full z-[7000] shadow-2xl transition-all"><X size={28}/></button>
             <BusinessPlanWizard championshipId={activeArena?.id} teamId={activeTeam?.id} currentRound={(activeArena?.current_round || 0) + 1} onClose={() => setShowBP(false)} />
          </div>
        )}
        {showAudit && activeTeam && activeArena && (
          <div className="fixed inset-0 z-[6000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
             <AuditLogViewer teamId={activeTeam.id} round={(activeArena.current_round || 0) + 1} onClose={() => setShowAudit(false)} />
          </div>
        )}
        {showGazette && (
          <div className="fixed inset-0 z-[5000] p-4 md:p-10 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center">
             <GazetteViewer arena={activeArena!} aiNews="" round={Math.max(0, selectedRound - 1)} activeTeam={activeTeam} userRole={userRole} onClose={() => setShowGazette(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CockpitStat = ({ label, val, trend, pos, neg, icon, tooltip }: any) => (
  <div className="px-1 border-r border-white/5 hover:bg-white/[0.03] transition-all group flex flex-col justify-center overflow-hidden relative">
     <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5">
           <div className="p-1 bg-orange-500/10 rounded text-orange-500 group-hover:scale-110 transition-transform">{icon}</div>
           <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.1em] truncate">{label}</span>
        </div>
        <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[6px] font-black uppercase tracking-tighter ${
          pos ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
          neg ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        }`}>
          {pos ? <ArrowUpRight size={6} /> : neg ? <ArrowDownRight size={6} /> : <Activity size={6} />}
          {trend}
        </div>
     </div>
     <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-white font-mono tracking-tighter italic leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{val}</span>
     </div>
     
     {tooltip && (
       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/98 backdrop-blur-md p-3 z-50 flex flex-col justify-center border-x border-white/5 translate-y-2 group-hover:translate-y-0">
         {typeof tooltip === 'string' ? (
           <p className="text-[7px] font-bold text-slate-300 leading-relaxed italic">{tooltip}</p>
         ) : (
           tooltip
         )}
       </div>
     )}
  </div>
);

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-t-lg text-[8px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 border-b-2 italic active:scale-95 ${
      active 
        ? 'bg-orange-600/10 text-orange-500 border-orange-500 shadow-[0_-10px_30px_rgba(249,115,22,0.1)]' 
        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    {icon} {label}
  </button>
);

const HubTabBtn = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick} 
    className={`px-3 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 border-2 italic active:scale-95 whitespace-nowrap ${
      active 
        ? 'bg-orange-600 text-white border-orange-400 shadow-2xl scale-105 z-10' 
        : 'bg-slate-950 border-transparent text-slate-500 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon} {label}
  </button>
);

export default Dashboard;
