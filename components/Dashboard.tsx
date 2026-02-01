
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Activity, DollarSign, Target, BarChart3, 
  Sparkles, Loader2, ShieldCheck, Newspaper, Cpu, 
  ChevronRight, Shield, FileEdit, PenTool, 
  Eye, Timer, Box, HeartPulse, Landmark, 
  Thermometer, EyeOff, Globe, Map, PieChart, Users,
  ArrowUpRight, ArrowDownRight, Layers, Table as TableIcon, Info,
  Trophy, AlertTriangle, Scale, Gauge, Activity as ActivityIcon,
  ChevronDown, Maximize2, Zap, ShieldAlert, ThermometerSun, Layers3,
  Factory, ShoppingCart, Flame
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM as any;
import ChampionshipTimer from './ChampionshipTimer';
import DecisionForm from './DecisionForm';
import GazetteViewer from './GazetteViewer';
import { supabase, getChampionships, getUserProfile } from '../services/supabase';
import { Branch, Championship, UserRole, CreditRating, InsolvencyStatus, Team, KPIs, RegionalData } from '../types';
import { logError, LogContext } from '../utils/logger';

const Dashboard: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const navigate = useNavigate();
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('player');
  const [loading, setLoading] = useState(true);
  const [showGazette, setShowGazette] = useState(false);

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
        }
      } catch (err: any) { logError(LogContext.DASHBOARD, "Cockpit Init Fault", err.message); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [navigate]);

  const isObserver = userRole === 'observer';

  const currentKpis = useMemo((): KPIs => {
    const baseFallback = {
      rating: 'AAA' as CreditRating,
      insolvency_status: 'SAUDAVEL' as InsolvencyStatus,
      equity: 5055447,
      market_share: 12.5,
      motivation_score: 0.85,
      is_on_strike: false,
      loans: [],
      market_valuation: { share_price: 1.01, tsr: 1.1 },
      statements: { 
        dre: { revenue: 3322735 },
        balance_sheet: { assets: { total: 9176940 } },
        cash_flow: { outflow: { total: 1200000, payroll: 450000, interest: 25000 } }
      }
    };
    if (!activeTeam?.kpis) return baseFallback as KPIs;
    return { ...baseFallback, ...activeTeam.kpis } as KPIs;
  }, [activeTeam]);

  const currencySymbol = activeArena?.currency === 'BRL' ? 'R$' : '$';
  const fmt = (val: number) => {
    const abs = Math.abs(val);
    if (abs >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(0);
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-orange-600" size={48} />
    </div>
  );

  const isStrike = currentKpis.is_on_strike;
  const burnRate = currentKpis.statements?.cash_flow?.outflow?.total || 0;

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans border-t border-white/5">
      {/* BANNER DE STATUS DO PAPEL */}
      {isObserver && (
        <div className="h-10 bg-indigo-600 flex items-center justify-center gap-3 shrink-0 shadow-lg z-[100] border-b border-indigo-400/30">
           <Eye size={16} className="text-white animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">MODO OBSERVADOR: ACESSO DE LEITURA APENAS</span>
        </div>
      )}

      <section className="h-20 grid grid-cols-2 md:grid-cols-6 bg-slate-900 border-b border-white/10 shrink-0 z-20">
         <CockpitStat label="Valuation" val={`${currencySymbol} ${currentKpis.market_valuation?.share_price.toFixed(2)}`} trend={`${currentKpis.market_valuation?.tsr.toFixed(1)}%`} pos={currentKpis.market_valuation?.tsr >= 0} icon={<TrendingUp size={16}/>} />
         <CockpitStat label="Equity" val={`${currencySymbol} ${fmt(currentKpis.equity || 0)}`} trend="Real" pos icon={<ShieldCheck size={16}/>} />
         <CockpitStat 
            label="Capital Burn" 
            val={`${currencySymbol} ${fmt(burnRate)}`} 
            trend="Período" 
            pos={false} 
            icon={<Flame size={16} className="text-rose-500" />} 
         />
         <CockpitStat label="Market Share" val={`${currentKpis.market_share?.toFixed(1)}%`} trend="Global" pos icon={<PieChart size={16}/>} />
         <CockpitStat label="Rating" val={currentKpis.rating} trend="Oracle" pos icon={<Shield size={16}/>} />
         <div className="px-8 flex items-center justify-between border-l border-white/5 bg-slate-950/40">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tempo de Round</span>
               <div className="scale-[0.8] origin-left -ml-1">
                  <ChampionshipTimer 
                    roundStartedAt={activeArena?.round_started_at} 
                    createdAt={activeArena?.created_at}
                    deadlineValue={activeArena?.deadline_value} 
                    deadlineUnit={activeArena?.deadline_unit} 
                  />
               </div>
            </div>
         </div>
      </section>

      <div className="flex flex-1 overflow-hidden">
         <aside className="w-80 bg-slate-900/60 border-r border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar shadow-2xl z-10">
            <div className="p-6 space-y-6">
               <header className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Landmark size={14}/> Node Telemetry
                  </h3>
                  <span className="text-[10px] font-black text-slate-600 uppercase italic">v15.25 Gold</span>
               </header>

               {/* TELEMETRIA DE FLUXO (NOVO v15.25) */}
               <div className="bg-slate-950/80 p-6 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                     <Zap size={12} className="text-blue-500" /> Dreno de Capital
                  </h4>
                  <div className="space-y-4">
                     <TelemetryLine label="Folha + Encargos" val={currentKpis.statements?.cash_flow?.outflow?.payroll || 0} color="text-indigo-400" />
                     <TelemetryLine label="Juros & Ágios" val={currentKpis.statements?.cash_flow?.outflow?.interest || 0} color="text-rose-400" />
                     <div className="pt-2 border-t border-white/5 flex justify-between items-end">
                        <span className="text-[8px] font-black text-slate-600 uppercase">Cash at Hand</span>
                        <span className="text-xl font-mono font-black text-emerald-500">{currencySymbol} {fmt(currentKpis.current_cash || 0)}</span>
                     </div>
                  </div>
               </div>

               {/* GAUGE DE CARGA SISTÊMICA (NOVO v15.25) */}
               <div className="bg-slate-950/80 p-6 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                     <Cpu size={12} className="text-orange-500" /> Carga da Fábrica
                  </h4>
                  <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${currentKpis.last_decision?.production?.activityLevel || 80}%` }}
                        className="absolute h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                     />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                     <span>Ocupação Real</span>
                     <span className="text-white">{currentKpis.last_decision?.production?.activityLevel || 80}%</span>
                  </div>
               </div>
            </div>
         </aside>

         <main className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative p-4 md:p-8">
            <div className="flex-1 flex flex-col overflow-hidden max-w-[1400px] mx-auto w-full">
               <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-4 shrink-0">
                  <div>
                     <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Matriz de <span className="text-orange-600">Decisão</span></h2>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Nodo Operacional: {activeTeam?.name}</p>
                  </div>
                  <button onClick={() => setShowGazette(true)} className="px-5 py-2.5 bg-slate-900 border border-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 active:scale-95">
                     <Newspaper size={14} /> Abrir Oracle Gazette
                  </button>
               </div>
               <div className="flex-1 overflow-hidden relative">
                  <DecisionForm 
                     teamId={activeTeam?.id} 
                     champId={activeArena?.id} 
                     round={(activeArena?.current_round || 0) + 1} 
                     branch={activeArena?.branch}
                     isReadOnly={isObserver}
                  />
               </div>
            </div>
         </main>
      </div>

      <AnimatePresence>
        {showGazette && (
          <div className="fixed inset-0 z-[5000] p-4 md:p-10 bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center">
             <GazetteViewer 
                arena={activeArena!} 
                aiNews="" 
                round={activeArena?.current_round || 0} 
                userRole={userRole} 
                activeTeam={activeTeam}
                onClose={() => setShowGazette(false)} 
             />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TelemetryLine = ({ label, val, color }: any) => (
   <div className="flex justify-between items-end">
      <span className="text-[8px] font-black text-slate-600 uppercase">{label}</span>
      <span className={`text-xs font-mono font-black ${color}`}>$ {val.toLocaleString()}</span>
   </div>
);

const CockpitStat = ({ label, val, trend, pos, icon }: any) => (
  <div className="px-8 border-r border-white/5 hover:bg-white/[0.02] transition-all group flex flex-col justify-center overflow-hidden">
     <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
           <div className="text-orange-500">{icon}</div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{label}</span>
        </div>
        <span className={`text-[10px] font-black ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>
           {pos ? '▲' : '▼'}{trend}
        </span>
     </div>
     <span className="text-3xl font-black text-white font-mono tracking-tighter italic leading-none truncate drop-shadow-lg">{val}</span>
  </div>
);

export default Dashboard;
