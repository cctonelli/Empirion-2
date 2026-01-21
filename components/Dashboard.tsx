
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
  Factory, ShoppingCart
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
    return activeTeam?.kpis || activeArena?.kpis || {
      ciclos: { pmre: 30, pmrv: 45, pmpc: 46, operacional: 75, financeiro: 29 },
      market_valuation: { share_price: 1.01, total_shares: 5000000, market_cap: 5055447, tsr: 1.1 },
      rating: 'AAA' as CreditRating,
      insolvency_status: 'SAUDAVEL' as InsolvencyStatus,
      equity: 5055447,
      market_share: 12.5,
      kanitz_factor: 2.19, 
      nlcdg: 2559690,
      financing_sources: { ecp: 2205716, elp: 1000000, ccp: -604097 },
      statements: { 
        dre: { revenue: 3322735, net_profit: 73928, cpv: 2278180, opex: 917582 },
        balance_sheet: { assets: { total: 9176940 } }
      }
    } as KPIs;
  }, [activeArena, activeTeam]);

  const currencySymbol = activeArena?.currency === 'BRL' ? 'R$' : activeArena?.currency === 'EUR' ? '€' : '$';
  const fmt = (val: number) => {
    if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(0);
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#020617]">
      <div className="text-center space-y-6">
        <Loader2 className="animate-spin text-orange-600 mx-auto" size={48} />
        <span className="text-white uppercase font-black text-xs tracking-[0.4em] animate-pulse italic">Connecting Node...</span>
      </div>
    </div>
  );

  const kanitz = currentKpis.kanitz_factor ?? 2.19;
  const kanitzLabel = kanitz > 0 ? 'SOLVENTE' : kanitz > -3 ? 'INDEFINIDA' : 'INSOLVENTE';
  const kanitzColor = kanitz > 0 ? 'text-emerald-500' : kanitz > -3 ? 'text-orange-500' : 'text-rose-500';
  
  const sources = currentKpis.financing_sources || { ecp: 0, elp: 0, ccp: 0 };
  const totalAbs = Math.abs(sources.ecp) + Math.abs(sources.elp) + Math.max(0, sources.ccp);

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans border-t border-white/5">
      {isObserver && (
        <div className="h-10 bg-indigo-600 flex items-center justify-center gap-3 animate-pulse shrink-0">
           <ShieldAlert size={14} className="text-white" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Modo Observador: Acesso Read-Only Ativado</span>
        </div>
      )}

      <section className="h-20 grid grid-cols-2 md:grid-cols-6 bg-slate-900 border-b border-white/10 shrink-0 z-20">
         <CockpitStat label="Valuation" val={`${currencySymbol} ${currentKpis.market_valuation?.share_price.toFixed(2)}`} trend={`${currentKpis.market_valuation?.tsr.toFixed(1)}%`} pos={currentKpis.market_valuation?.tsr >= 0} icon={<TrendingUp size={16}/>} />
         <CockpitStat label="Receita Bruta" val={`${currencySymbol} ${fmt(currentKpis.statements?.dre?.revenue || 0)}`} trend="Real" pos icon={<DollarSign size={16}/>} />
         <CockpitStat label="Mkt Share" val={`${(currentKpis.market_share || 0).toFixed(1)}%`} trend="Comp." pos icon={<PieChart size={16}/>} />
         <CockpitStat label="Produtividade" val={`${((activeArena?.market_indicators?.labor_productivity || 1) * 100).toFixed(0)}%`} trend="Eficiência" pos icon={<Cpu size={16}/>} />
         <CockpitStat label="Rating" val={currentKpis.rating} trend="Kanitz" pos icon={<ShieldCheck size={16}/>} />
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
               
               {/* FLEURIET BOX */}
               <div className="bg-slate-950/80 p-5 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fontes de Giro (Fleuriet)</h4>
                     <Layers3 size={12} className="text-blue-500" />
                  </div>
                  
                  <div className="flex h-12 w-full rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-slate-900">
                     <motion.div initial={{width:0}} animate={{width: `${(Math.abs(sources.elp) / totalAbs) * 100}%`}} className="h-full bg-blue-600 relative group" />
                     <motion.div initial={{width:0}} animate={{width: `${(Math.max(0, sources.ccp) / totalAbs) * 100}%`}} className={`h-full bg-slate-400 relative group ${sources.ccp < 0 ? 'opacity-0' : ''}`} />
                     <motion.div initial={{width:0}} animate={{width: `${(Math.abs(sources.ecp) / totalAbs) * 100}%`}} className="h-full bg-orange-600 relative group" />
                  </div>

                  <div className="space-y-2">
                     <SourceRow label="ECP (Curto Prazo)" val={fmt(sources.ecp)} color="bg-orange-600" />
                     <SourceRow label="ELP (Longo Prazo)" val={fmt(sources.elp)} color="bg-blue-600" />
                     <SourceRow label="CCP (Próprio)" val={fmt(sources.ccp)} color="bg-slate-400" />
                     <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[9px] font-black text-white uppercase italic">NLCDG TOTAL</span>
                        <span className="text-sm font-mono font-black text-orange-500">$ {fmt(currentKpis.nlcdg || 0)}</span>
                     </div>
                  </div>
               </div>

               {/* SPECIAL PURCHASES ALERT BOX */}
               <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-[2.5rem] space-y-3">
                  <div className="flex items-center gap-3 text-indigo-400">
                     <ShoppingCart size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Oracle Purchasing</span>
                  </div>
                  <p className="text-[10px] text-indigo-100 font-medium italic leading-relaxed">
                     { (currentKpis.special_purchases_impact && currentKpis.special_purchases_impact > 0) 
                       ? `ALERTA: Compras Especiais executadas ($ ${fmt(currentKpis.special_purchases_impact)}). Seu estoque não supriu a produção decidida.`
                       : "Protocolo Just-in-time ativo. Nenhuma compra especial necessária para o próximo fechamento." }
                  </p>
               </div>

               {/* SOLVENCY THERMOMETER */}
               <div className="bg-slate-950/80 p-5 rounded-[2.5rem] border border-white/5 space-y-3 shadow-inner group">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insolvência (Kanitz)</h4>
                     <ThermometerSun size={12} className={kanitzColor} />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className={`text-4xl font-black font-mono italic drop-shadow-lg ${kanitzColor}`}>{kanitz.toFixed(2)}</span>
                     <div className="text-right">
                        <span className={`block text-[8px] font-black uppercase tracking-widest ${kanitzColor}`}>{kanitzLabel}</span>
                        <span className="block text-[7px] text-slate-600 font-bold uppercase italic mt-1">Status Oracle</span>
                     </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
                     <div className={`h-full transition-all duration-1000 ${kanitzColor.replace('text', 'bg')}`} style={{ width: `${Math.min(100, Math.max(5, ((kanitz + 7) / 14) * 100))}%` }} />
                  </div>
               </div>
            </div>
         </aside>

         <main className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative p-4 md:p-8">
            <div className="flex-1 flex flex-col overflow-hidden max-w-[1400px] mx-auto w-full">
               <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-4 shrink-0">
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

const SourceRow = ({ label, val, color }: any) => (
   <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
         <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
         <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-[9px] font-mono font-bold text-slate-300">$ {val}</span>
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
