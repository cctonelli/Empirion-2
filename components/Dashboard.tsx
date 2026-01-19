import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Activity, DollarSign, Target, BarChart3, 
  Sparkles, Loader2, ShieldCheck, Newspaper, Cpu, 
  ChevronRight, Shield, FileEdit, PenTool, 
  Eye, Timer, Box, HeartPulse, Landmark, 
  Thermometer, EyeOff, Globe, Map, PieChart, Users,
  ArrowUpRight, ArrowDownRight, Layers, Table as TableIcon, Info,
  Trophy, AlertTriangle, Scale, Gauge, Activity as ActivityIcon,
  ChevronDown, Maximize2, Zap, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Fix: Use any to bypass react-router-dom type resolution issues in this environment
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
        
        if (!champId || !teamId) {
           navigate('/app/championships');
           return;
        }

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
      } catch (err: any) {
        logError(LogContext.DASHBOARD, "Cockpit Init Fault", err.message);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [navigate]);

  const isObserver = userRole === 'observer';

  const currentKpis = useMemo((): KPIs => {
    return activeTeam?.kpis || activeArena?.kpis || {
      ciclos: { pmre: 30, pmrv: 45, pmpc: 46, operacional: 75, financeiro: 29 },
      scissors_effect: { ncg: 1466605, ccl: 668847, tesouraria: 50000, ccp: 180000, tsf: -73.87, is_critical: false },
      market_valuation: { share_price: 60.09, total_shares: 5000000, market_cap: 300450000, tsr: 4.2 },
      rating: 'AAA' as CreditRating,
      insolvency_status: 'SAUDAVEL' as InsolvencyStatus,
      equity: 5055447,
      market_share: 12.5,
    } as KPIs;
  }, [activeArena, activeTeam]);

  const currencySymbol = activeArena?.currency === 'BRL' ? 'R$' : activeArena?.currency === 'EUR' ? '€' : '$';

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#020617]">
      <div className="text-center space-y-6">
        <Loader2 className="animate-spin text-orange-600 mx-auto" size={48} />
        <span className="text-white uppercase font-black text-xs tracking-[0.4em] animate-pulse italic">Connecting Node...</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans border-t border-white/5">
      {/* OBSERVER ALERT BANNER */}
      {isObserver && (
        <div className="h-10 bg-indigo-600 flex items-center justify-center gap-3 animate-pulse shrink-0">
           <ShieldAlert size={14} className="text-white" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Modo Observador: Acesso Read-Only Ativado</span>
        </div>
      )}

      <section className="h-20 grid grid-cols-2 md:grid-cols-6 bg-slate-900 border-b border-white/10 shrink-0 z-20">
         <CockpitStat label="Valuation" val={`${currencySymbol} ${currentKpis.market_valuation?.share_price.toFixed(2)}`} trend="+1.2%" pos icon={<TrendingUp size={16}/>} />
         <CockpitStat label="Receita Bruta" val={`${currencySymbol} 3.32M`} trend="Estável" pos icon={<DollarSign size={16}/>} />
         <CockpitStat label="Lucro Líquido" val={`${currencySymbol} 73.9K`} trend="+4.5%" pos icon={<ActivityIcon size={16}/>} />
         <CockpitStat label="Market Share" val={`${currentKpis.market_share.toFixed(1)}%`} trend="Target" pos icon={<PieChart size={16}/>} />
         <CockpitStat label="Rating" val={currentKpis.rating} trend="Prime" pos icon={<ShieldCheck size={16}/>} />
         <div className="px-8 flex items-center justify-between border-l border-white/5 bg-slate-950/40">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Remaining</span>
               <div className="scale-[0.8] origin-left -ml-1">
                  <ChampionshipTimer roundStartedAt={activeArena?.round_started_at} deadlineValue={activeArena?.deadline_value} deadlineUnit={activeArena?.deadline_unit} />
               </div>
            </div>
         </div>
      </section>

      <div className="flex flex-1 overflow-hidden">
         <aside className="w-80 bg-slate-900/60 border-r border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar shadow-2xl z-10">
            <div className="p-6 space-y-6">
               <header className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Landmark size={14}/> Auditoria Interna
                  </h3>
                  <span className="text-[10px] font-black text-slate-600 uppercase">Cycle 0{activeArena?.current_round}</span>
               </header>
               <div className="bg-slate-950/80 p-5 rounded-[2rem] border border-white/5 space-y-3 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DRE Tático</h4>
                     <Zap size={12} className="text-orange-500" />
                  </div>
                  <div className="space-y-2 font-mono text-[10px]">
                     <MiniFinRow label="Faturamento" val={`3.32M`} />
                     <MiniFinRow label="Custos (CPV)" val={`(2.27M)`} neg />
                     <MiniFinRow label="EBITDA" val={`126.9K`} bold />
                     <MiniFinRow label="Net Profit" val={`73.9K`} bold highlight />
                  </div>
               </div>
               <div className="bg-orange-600/5 p-5 rounded-[2rem] border border-orange-500/10 space-y-3">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-orange-500 uppercase italic">Tesoura (TSF)</span>
                     <Gauge size={14} className="text-orange-500" />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-3xl font-black text-white font-mono italic">{(currentKpis.scissors_effect?.tsf || 0).toFixed(2)}</span>
                     <span className={`text-[8px] font-black px-2 py-1 rounded-full ${currentKpis.scissors_effect?.is_critical ? 'bg-rose-600 text-white' : 'bg-emerald-600/20 text-emerald-500'}`}>
                        {currentKpis.scissors_effect?.is_critical ? 'CRÍTICO' : 'ÓTIMO'}
                     </span>
                  </div>
               </div>
               <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] space-y-3 shadow-lg">
                  <div className="flex items-center gap-3 text-indigo-400">
                     <Sparkles size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Oracle Advice</span>
                  </div>
                  <p className="text-[10px] text-indigo-100 font-medium italic leading-relaxed">
                     "Margens expandiram 2% este ciclo. Mantenha o Marketing regional acima de $5.000."
                  </p>
               </div>
            </div>
         </aside>

         <main className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative p-6">
            <div className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full">
               <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-6 shrink-0">
                  <div>
                     <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Decision <span className="text-orange-600">Matrix</span></h2>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Nodo {activeTeam?.name || 'ALPHA'}</p>
                  </div>
                  <button onClick={() => setShowGazette(true)} className="px-5 py-2.5 bg-slate-900 border border-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2">
                     <Newspaper size={14} /> Oracle Gazette
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
          <div className="fixed inset-0 z-[5000] p-6 md:p-12 bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center">
             <GazetteViewer arena={activeArena!} aiNews="" round={activeArena?.current_round || 0} userRole={userRole} onClose={() => setShowGazette(false)} />
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
        <span className={`text-[10px] font-black ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>
           {pos ? '▲' : '▼'}{trend}
        </span>
     </div>
     <span className="text-3xl font-black text-white font-mono tracking-tighter italic leading-none truncate drop-shadow-lg">{val}</span>
  </div>
);

const MiniFinRow = ({ label, val, neg, bold, highlight }: any) => (
  <div className={`flex justify-between items-center py-1 border-b border-white/[0.02] last:border-0 ${highlight ? 'text-orange-500 font-black' : ''}`}>
     <span className={`${bold ? 'font-black text-slate-400' : 'text-slate-600'}`}>{label}</span>
     <span className={`font-black ${neg ? 'text-rose-500' : bold ? 'text-white' : 'text-slate-500'}`}>{val}</span>
  </div>
);

export default Dashboard;