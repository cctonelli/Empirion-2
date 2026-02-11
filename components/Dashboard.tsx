
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
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM as any;
import ChampionshipTimer from './ChampionshipTimer';
import DecisionForm from './DecisionForm';
import GazetteViewer from './GazetteViewer';
import BusinessPlanWizard from './BusinessPlanWizard';
import { supabase, getChampionships, getUserProfile, getActiveBusinessPlan, getTeamSimulationHistory } from '../services/supabase';
import { Branch, Championship, UserRole, CreditRating, InsolvencyStatus, Team, KPIs } from '../types';

const Dashboard: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const navigate = useNavigate();
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('player');
  const [loading, setLoading] = useState(true);
  const [showGazette, setShowGazette] = useState(false);
  const [showBP, setShowBP] = useState(false);
  const [bpStatus, setBpStatus] = useState<'pending' | 'draft' | 'submitted'>('pending');
  const [history, setHistory] = useState<any[]>([]);

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

          const round = (arena.current_round || 0) + 1;
          const { data: bp } = await getActiveBusinessPlan(teamId, round);
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

  // Gráfico de Tendência Histórica v17.0
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

  const requireBP = activeArena?.round_rules?.[(activeArena?.current_round || 0) + 1]?.require_business_plan;

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans border-t border-white/5">
      
      {/* COCKPIT STATS BAR - v17.0 Advanced Indicators */}
      <section className="h-20 grid grid-cols-2 md:grid-cols-6 bg-slate-900 border-b border-white/10 shrink-0 z-20 shadow-2xl">
         <CockpitStat label="Equity" val={`$ ${(currentKpis.equity / 1000000).toFixed(2)}M`} trend="Real" pos icon={<ShieldCheck size={16}/>} />
         <CockpitStat label="Solvência" val={(currentKpis.solvency_index || 1.0).toFixed(2)} trend="Oracle" pos icon={<Landmark size={16}/>} />
         <CockpitStat label="Giro Estoque" val={(currentKpis.inventory_turnover || 0).toFixed(1)} trend="Cycle" pos icon={<Box size={16}/>} />
         <CockpitStat label="Liquidez" val={(currentKpis.liquidity_current || 1.0).toFixed(2)} trend="Current" pos icon={<Activity size={16}/>} />
         <CockpitStat label="Rating" val={currentKpis.rating} trend="Audit" pos icon={<Shield size={16}/>} />
         <div className="px-8 flex items-center justify-center border-l border-white/5 bg-orange-600/5">
            <ChampionshipTimer roundStartedAt={activeArena?.round_started_at} createdAt={activeArena?.created_at} deadlineValue={activeArena?.deadline_value} deadlineUnit={activeArena?.deadline_unit} />
         </div>
      </section>

      <div className="flex flex-1 overflow-hidden">
         <aside className="w-80 bg-slate-900/60 border-r border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-10 p-6 space-y-6">
            <header className="flex items-center justify-between border-b border-white/10 pb-4">
               <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2"><History size={14}/> Intel Pulse</h3>
               <span className="text-[10px] font-black text-slate-600 uppercase">v17.0 Gold</span>
            </header>

            {/* STATUS DO BUSINESS PLAN COM ALERTA DE EXIGÊNCIA */}
            <div className={`p-6 rounded-[2.5rem] border-2 space-y-4 shadow-2xl transition-all ${requireBP && bpStatus !== 'submitted' ? 'bg-orange-600/20 border-orange-500/50 animate-pulse' : 'bg-slate-950 border-white/5'}`}>
               <div className="flex justify-between items-center">
                  <PenTool size={24} className={requireBP ? 'text-orange-500' : 'text-slate-600'} />
                  {bpStatus === 'submitted' && <CheckCircle2 size={16} className="text-emerald-500" />}
               </div>
               <div>
                  <h4 className="text-sm font-black uppercase text-white">Business Plan</h4>
                  <p className={`text-[9px] font-bold uppercase mt-1 ${requireBP && bpStatus !== 'submitted' ? 'text-orange-400' : 'text-slate-500'}`}>
                     {requireBP ? `Exigência Round ${activeArena?.current_round + 1}` : 'Opcional este ciclo'}
                  </p>
               </div>
               <button onClick={() => setShowBP(true)} className="w-full py-3 bg-white/5 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Editar Strategos Plan</button>
            </div>

            {/* GRÁFICO DE TENDÊNCIA HISTÓRICA */}
            <div className="bg-slate-950/80 p-6 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2"><TrendingUp size={12} className="text-blue-500" /> Histórico Equity</h4>
               <div className="h-40">
                  <Chart options={trendOptions} series={trendSeries} type="area" height="100%" />
               </div>
            </div>

            {/* ANALISE DE CICLO FINANCEIRO (PMR vs PMP) */}
            <div className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2"><Scale size={12} className="text-emerald-500" /> PMR vs PMP</h4>
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase"><span className="text-slate-600">Recebimento (PMR)</span><span className="text-white">{currentKpis.avg_receivable_days || 45} dias</span></div>
                  <div className="flex justify-between text-[10px] font-bold uppercase"><span className="text-slate-600">Pagamento (PMP)</span><span className="text-white">{currentKpis.avg_payable_days || 30} dias</span></div>
                  <div className="pt-2 border-t border-white/5 flex justify-between items-end">
                     <span className="text-[8px] font-black text-rose-500 uppercase">Gap Tesoura</span>
                     <span className="text-lg font-black text-rose-500">{(currentKpis.scissors_effect || -15)} dias</span>
                  </div>
               </div>
            </div>
         </aside>

         <main className="flex-1 bg-slate-950 p-8 overflow-hidden flex flex-col relative">
            <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col overflow-hidden">
               <header className="flex justify-between items-end border-b border-white/5 pb-6 mb-6">
                  <div>
                     <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Cockpit <span className="text-orange-600">Operacional</span></h2>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Protocolo v17.0 • Ciclo 0{(activeArena?.current_round || 0) + 1}</p>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setShowGazette(true)} className="px-8 py-3 bg-slate-900 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 shadow-xl">
                        <Newspaper size={16} /> Oracle Gazette
                     </button>
                  </div>
               </header>
               
               <div className="flex-1 overflow-hidden">
                  <DecisionForm 
                    teamId={activeTeam?.id} 
                    champId={activeArena?.id} 
                    round={(activeArena?.current_round || 0) + 1} 
                    branch={activeArena?.branch}
                    isReadOnly={userRole === 'observer' || (requireBP && bpStatus !== 'submitted')}
                  />
               </div>
            </div>
         </main>
      </div>

      <AnimatePresence>
        {showBP && (
          <div className="fixed inset-0 z-[6000] bg-slate-950/98 backdrop-blur-3xl overflow-y-auto">
             <button onClick={() => setShowBP(false)} className="fixed top-10 right-10 p-5 bg-white/5 hover:bg-rose-600 text-white rounded-full z-[7000] shadow-2xl transition-all"><X size={28}/></button>
             <BusinessPlanWizard championshipId={activeArena?.id} teamId={activeTeam?.id} currentRound={(activeArena?.current_round || 0) + 1} onClose={() => setShowBP(false)} />
          </div>
        )}
        {showGazette && (
          <div className="fixed inset-0 z-[5000] p-4 md:p-10 bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center">
             <GazetteViewer arena={activeArena!} aiNews="" round={activeArena?.current_round || 0} activeTeam={activeTeam} onClose={() => setShowGazette(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CockpitStat = ({ label, val, trend, pos, icon }: any) => (
  <div className="px-8 border-r border-white/5 hover:bg-white/[0.02] transition-all group flex flex-col justify-center overflow-hidden">
     <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
           <div className="text-orange-500">{icon}</div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{label}</span>
        </div>
        <span className={`text-[9px] font-black italic ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>
     </div>
     <span className="text-3xl font-black text-white font-mono tracking-tighter italic leading-none truncate drop-shadow-xl">{val}</span>
  </div>
);

export default Dashboard;
