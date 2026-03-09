
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
import { DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

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
        }
      } catch (err) { console.error("Cockpit Init Fault", err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [navigate]);

  const currentKpis = useMemo((): KPIs => {
    const baseFallback = {
      rating: 'AAA' as CreditRating,
      insolvency_status: 'SAUDAVEL' as InsolvencyStatus,
      equity: 7252171,
      market_share: 12.5,
      loans: [],
      statements: { dre: { revenue: 3322735 }, cash_flow: { outflow: { total: 0 } } }
    };
    return { ...baseFallback, ...(activeTeam?.kpis || {}) } as KPIs;
  }, [activeTeam]);

  const trendOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', sparkline: { enabled: false } },
    colors: ['#f97316', '#3b82f6'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    xaxis: { 
      categories: history.map(h => `P${h.round < 10 ? '0' : ''}${h.round}`), 
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 800 } } 
    },
    yaxis: { labels: { style: { colors: '#64748b', fontSize: '10px' } } },
    tooltip: { theme: 'dark' },
    legend: { show: false }
  };

  const trendSeries = [
    { name: 'Equity', data: history.map(h => h.equity) },
    { name: 'Liquidez', data: history.map(h => h.kpis?.liquidity_current || 0) }
  ];

  if (loading) return <div className="h-full flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-orange-600" size={48} /></div>;

  const currentRound = (activeArena?.current_round || 0) + 1;
  const requireBP = activeArena?.round_rules?.[currentRound]?.require_business_plan;
  const isPastRound = selectedRound < currentRound;
  const isFutureRound = selectedRound > currentRound;

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans border-t border-white/5">
      
      <section className="h-24 grid grid-cols-2 md:grid-cols-6 bg-slate-900/80 backdrop-blur-md border-b border-white/10 shrink-0 z-20 shadow-2xl">
         <CockpitStat label={t('Equity')} val={`$ ${(currentKpis.equity / 1000000).toFixed(2)}M`} trend="Real" pos icon={<ShieldCheck size={18}/>} />
         <CockpitStat 
            label="E-SDS" 
            val={(currentKpis.esds?.esds_display || 0).toFixed(1)} 
            trend={currentKpis.esds?.zone || 'ALERTA'} 
            pos={currentKpis.esds?.zone === 'Azul' || currentKpis.esds?.zone === 'Verde'}
            neg={currentKpis.esds?.zone === 'Laranja' || currentKpis.esds?.zone === 'Vermelho'}
            icon={<Gauge size={18}/>} 
            tooltip={
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-orange-500" />
                  <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Diagnóstico E-SDS v1.2</p>
                </div>
                <p className="text-[9px] text-slate-300 leading-relaxed italic">{currentKpis.esds?.gemini_insights || 'Análise indisponível'}</p>
                {currentKpis.esds?.top_gargalos && currentKpis.esds.top_gargalos.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Principais Detratores:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentKpis.esds.top_gargalos.map((g, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[7px] font-black rounded-full uppercase border border-rose-500/20" title={`${g.percentage}% de impacto`}>
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {currentKpis.esds?.is_estimated && (
                  <p className="text-[7px] font-bold text-amber-500 italic mt-2 flex items-center gap-1.5">
                    <Info size={10}/> Baseado em dados parciais (estimado)
                  </p>
                )}
              </div>
            }
         />
         <CockpitStat label={t('Inventory Turnover')} val={(currentKpis.inventory_turnover || 0).toFixed(1)} trend="Cycle" pos icon={<Box size={18}/>} />
         <CockpitStat label={t('Liquidity')} val={(currentKpis.liquidity_current || 1.0).toFixed(2)} trend="Current" pos icon={<Activity size={18}/>} />
         <CockpitStat label={t('Rating')} val={currentKpis.rating} trend="Audit" pos icon={<Shield size={18}/>} />
         <div className="px-8 flex items-center justify-center border-l border-white/5 bg-gradient-to-br from-orange-600/10 to-transparent">
            <ChampionshipTimer roundStartedAt={activeArena?.round_started_at} createdAt={activeArena?.created_at} deadlineValue={activeArena?.deadline_value} deadlineUnit={activeArena?.deadline_unit} />
         </div>
      </section>

      <div className="flex flex-1 overflow-hidden">
         <aside className="w-80 bg-slate-900/40 backdrop-blur-xl border-r border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-10 p-8 space-y-8">
            <header className="flex items-center justify-between border-b border-white/5 pb-6">
               <div className="flex flex-col">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                    <Zap size={12} className="fill-orange-500" /> {t('intel_pulse')}
                  </h3>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">Monitoramento em Tempo Real</span>
               </div>
               <button onClick={() => setShowAudit(true)} className="p-2.5 bg-white/5 hover:bg-orange-600 rounded-xl transition-all text-slate-500 hover:text-white group shadow-lg" title={t('audit_history')}>
                  <History size={14} className="group-hover:rotate-[-45deg] transition-transform" />
               </button>
            </header>

            <div className={`p-8 rounded-[3rem] border-2 space-y-6 shadow-2xl transition-all relative overflow-hidden group ${requireBP && bpStatus !== 'submitted' ? 'bg-orange-600/10 border-orange-500/40' : 'bg-slate-950/80 border-white/5 hover:border-white/10'}`}>
               {requireBP && bpStatus !== 'submitted' && (
                 <div className="absolute top-0 right-0 p-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                 </div>
               )}
               <div className="flex justify-between items-center">
                  <div className={`p-4 rounded-2xl ${requireBP ? 'bg-orange-600/20 text-orange-500' : 'bg-slate-800 text-slate-600'}`}>
                    <PenTool size={28} />
                  </div>
                  {bpStatus === 'submitted' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="text-[8px] font-black text-emerald-500 uppercase">Enviado</span>
                    </div>
                  )}
               </div>
               <div>
                  <h4 className="text-lg font-black uppercase text-white tracking-tight">{t('Business Plan')}</h4>
                  <p className={`text-[9px] font-bold uppercase mt-2 tracking-widest leading-relaxed ${requireBP && bpStatus !== 'submitted' ? 'text-orange-400' : 'text-slate-500'}`}>
                     {requireBP ? `${t('requirement')} P0${(activeArena?.current_round || 0) + 1}` : t('optional_cycle')}
                  </p>
               </div>
               <button onClick={() => setShowBP(true)} className="w-full py-4 bg-white/5 hover:bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl border border-white/5 hover:border-transparent active:scale-95">{t('Editar BP')}</button>
            </div>

            <div className="bg-slate-950/60 p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl group">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                    <TrendingUp size={14} className="text-blue-500" /> {t('Equity History')}
                  </h4>
                  <Maximize2 size={12} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
               </div>
               <div className="h-44 -mx-4">
                  <Chart options={trendOptions} series={trendSeries} type="area" height="100%" />
               </div>
            </div>

            <div className="bg-slate-950/60 p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                 <Scale size={14} className="text-emerald-500" /> PMR vs PMP
               </h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-slate-600">{t('Receivable Days')}</span>
                    <span className="text-white font-mono">{currentKpis.avg_receivable_days || 45} {t('days')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-slate-600">{t('Payable Days')}</span>
                    <span className="text-white font-mono">{currentKpis.avg_payable_days || 30} {t('days')}</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">{t('Scissors Effect')}</span>
                        <span className="text-[7px] text-slate-600 uppercase font-bold">Risco de Liquidez</span>
                     </div>
                     <span className="text-2xl font-black text-rose-500 italic tracking-tighter">{(currentKpis.scissors_effect || -15)} {t('days')}</span>
                  </div>
               </div>
            </div>
         </aside>

         <main className="flex-1 bg-slate-950 p-8 overflow-hidden flex flex-col relative">
            <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col overflow-hidden">
               <header className="flex justify-between items-end border-b border-white/5 pb-8 mb-8">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-1 bg-orange-600 rounded-full" />
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                          {t('cockpit')} <span className="text-orange-600 drop-shadow-[0_0_20px_rgba(234,88,12,0.4)]">{t('operational')}</span>
                        </h2>
                     </div>
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-3">
                       <Cpu size={14} className="text-orange-600/50" />
                       Protocolo v18.0 • {selectedRound === currentRound ? `${t('cycle')} 0${selectedRound}` : selectedRound < currentRound ? `Histórico P0${selectedRound}` : `Planejamento P0${selectedRound}`}
                     </p>
                  </div>
                  <div className="flex gap-4">
                     {isPastRound && (
                       <div className="px-8 py-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl backdrop-blur-md">
                         <History size={18} className="animate-pulse" /> Modo Consulta
                       </div>
                     )}
                     <button onClick={() => setShowGazette(true)} className="px-10 py-4 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 hover:border-orange-400 transition-all flex items-center gap-3 shadow-2xl active:scale-95 group">
                        <Newspaper size={18} className="group-hover:rotate-12 transition-transform" /> Oracle Gazette
                     </button>
                  </div>
               </header>
               
               <div className="flex-1 overflow-hidden flex flex-col">
                  {selectedRound === currentRound && requireBP && bpStatus !== 'submitted' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mb-4 p-4 bg-orange-600/20 border border-orange-500/50 rounded-2xl flex items-center gap-4 shadow-lg shrink-0"
                    >
                       <div className="p-2 bg-orange-600 rounded-xl text-white animate-pulse">
                          <AlertTriangle size={20} />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-[10px] font-black text-white uppercase italic">Protocolo de Decisão Bloqueado</h4>
                          <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mt-0.5">
                             Esta rodada exige o envio do **Business Plan** antes da liberação do Cockpit Operacional.
                          </p>
                       </div>
                       <button 
                         onClick={() => setShowBP(true)}
                         className="px-6 py-2 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-orange-600 transition-all shadow-xl"
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
                  />
               </div>
            </div>
         </main>
      </div>

      {/* Timeline de Rodadas */}
      <footer className="h-24 bg-slate-900 border-t border-white/10 flex items-center justify-center px-12 shrink-0 z-[3000]">
         <div className="max-w-7xl w-full flex items-center justify-between relative">
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
                      className={`relative z-10 w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center group ${
                        isSelected ? 'bg-orange-600 border-orange-400 scale-125 shadow-[0_0_20px_#f97316]' : 
                        isCurrent ? 'bg-slate-800 border-orange-500 animate-pulse' :
                        isPast ? 'bg-slate-800 border-blue-500/50' : 
                        'bg-slate-950 border-white/5 opacity-40'
                      }`}
                    >
                       <span className={`text-[10px] font-black font-mono ${isSelected ? 'text-white' : 'text-slate-500'}`}>P{i < 10 ? `0${i}` : i}</span>
                       
                       {/* Metadata Icons */}
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
                          {hasBP && <div className="p-0.5 bg-blue-600 rounded text-[5px] text-white font-black uppercase flex items-center gap-0.5 shadow-lg border border-white/20" title="Business Plan Obrigatório"><FileEdit size={5}/> BP</div>}
                       </div>
                    </button>
                    {isSelected && (
                      <div className="absolute -bottom-6 whitespace-nowrap">
                        <span className="text-[7px] font-black text-orange-500 uppercase tracking-tighter">{isCurrent ? 'Atual' : isPast ? 'Passado' : 'Futuro'}</span>
                      </div>
                    )}
                  </div>
               );
            })}
         </div>
      </footer>

      <AnimatePresence>
        {showBP && (
          <div className="fixed inset-0 z-[6000] bg-slate-950/98 backdrop-blur-3xl overflow-y-auto">
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
          <div className="fixed inset-0 z-[5000] p-4 md:p-10 bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center">
             <GazetteViewer arena={activeArena!} aiNews="" round={Math.max(0, selectedRound - 1)} activeTeam={activeTeam} userRole={userRole} onClose={() => setShowGazette(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CockpitStat = ({ label, val, trend, pos, neg, icon, tooltip }: any) => (
  <div className="px-8 border-r border-white/5 hover:bg-white/[0.03] transition-all group flex flex-col justify-center overflow-hidden relative">
     <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
           <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">{icon}</div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] truncate">{label}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
          pos ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
          neg ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        }`}>
          {pos ? <ArrowUpRight size={8} /> : neg ? <ArrowDownRight size={8} /> : <Activity size={8} />}
          {trend}
        </div>
     </div>
     <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white font-mono tracking-tighter italic leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{val}</span>
     </div>
     
     {tooltip && (
       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/98 backdrop-blur-md p-5 z-50 flex flex-col justify-center border-x border-white/5 translate-y-2 group-hover:translate-y-0">
         {typeof tooltip === 'string' ? (
           <p className="text-[9px] font-bold text-slate-300 leading-relaxed italic">{tooltip}</p>
         ) : (
           tooltip
         )}
       </div>
     )}
  </div>
);

export default Dashboard;
