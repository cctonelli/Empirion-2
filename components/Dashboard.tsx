
import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, BarChart3, 
  Sparkles, Loader2, ShieldCheck, Newspaper, Cpu, 
  ChevronRight, Shield, FileEdit, PenTool, 
  Eye, Timer, Box, HeartPulse, Landmark, 
  Thermometer, EyeOff, Globe, Map, PieChart, Users,
  ArrowUpRight, ArrowDownRight, Layers, Table as TableIcon, Info,
  Trophy, AlertTriangle, Scale, Gauge, Activity as ActivityIcon,
  ChevronDown, Maximize2, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChampionshipTimer from './ChampionshipTimer';
import DecisionForm from './DecisionForm';
import GazetteViewer from './GazetteViewer';
import { supabase, getChampionships, getUserProfile } from '../services/supabase';
import { Branch, Championship, UserRole, CreditRating, InsolvencyStatus, Team, KPIs, RegionalData } from '../types';
import { logError, LogContext } from '../utils/logger';

const Dashboard: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const profile = await getUserProfile(session.user.id);
          if (profile) setUserRole(profile.role);
        }

        if (champId) {
          const { data } = await getChampionships();
          const arena = data?.find(a => a.id === champId);
          if (arena) {
            setActiveArena(arena);
            const team = arena.teams?.find((t: any) => t.id === teamId);
            if (team) setActiveTeam(team);
          }
        }
      } catch (err: any) {
        logError(LogContext.DASHBOARD, "Cockpit Init Fault", err.message);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const currentKpis = useMemo((): KPIs => {
    return activeTeam?.kpis || activeArena?.kpis || {
      ciclos: { pmre: 30, pmrv: 45, pmpc: 46, operacional: 75, financeiro: 29 },
      scissors_effect: { ncg: 1466605, ccl: 3290340 - 2621493, tesouraria: 50000, ccp: 180000, tsf: -73.87, is_critical: false },
      market_valuation: { share_price: 60.09, total_shares: 5000000, market_cap: 300450000, tsr: 4.2 },
      rating: 'AAA' as CreditRating,
      insolvency_status: 'SAUDAVEL' as InsolvencyStatus,
      equity: 5055447,
      market_share: 12.5,
      regional_pulse: Array.from({ length: 9 }).map((_, i) => ({
        region_id: i + 1,
        region_name: `Região 0${i + 1}`,
        demand: 12500,
        units_sold: 1562,
        market_share: 12.5,
        avg_price: 372.40,
        competitors_count: 8
      }))
    } as KPIs;
  }, [activeArena, activeTeam]);

  const currencySymbol = activeArena?.currency === 'BRL' ? 'R$' : activeArena?.currency === 'EUR' ? '€' : '$';

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#020617]">
      <div className="text-center space-y-6">
        <Loader2 className="animate-spin text-orange-600 mx-auto" size={48} />
        <span className="text-white uppercase font-black text-xs tracking-[0.4em] animate-pulse italic">Synchronizing Oracle Node...</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden font-sans border-t border-white/5">
      
      {/* KPI TOP BAR - RESPONSIVE & HIGH VISIBILITY */}
      <section className="h-16 grid grid-cols-2 md:grid-cols-6 bg-slate-900 border-b border-white/10 shrink-0 z-20">
         <CockpitStat label="Valuation" val={`${currencySymbol} ${currentKpis.market_valuation?.share_price.toFixed(2)}`} trend="+1.2%" pos icon={<TrendingUp size={12}/>} />
         <CockpitStat label="Receita Bruta" val={`${currencySymbol} 3.32M`} trend="Estável" pos icon={<DollarSign size={12}/>} />
         <CockpitStat label="Lucro Líquido" val={`${currencySymbol} 73.9K`} trend="+4.5%" pos icon={<ActivityIcon size={12}/>} />
         <CockpitStat label="Market Share" val={`${currentKpis.market_share.toFixed(1)}%`} trend="Target" pos icon={<PieChart size={12}/>} />
         <CockpitStat label="Rating" val={currentKpis.rating} trend="Prime" pos icon={<ShieldCheck size={12}/>} />
         <div className="px-6 flex items-center justify-between border-l border-white/5 bg-slate-950/40">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Time Remaining</span>
               <div className="scale-[0.8] origin-left -ml-2">
                  <ChampionshipTimer roundStartedAt={activeArena?.round_started_at} deadlineValue={activeArena?.deadline_value} deadlineUnit={activeArena?.deadline_unit} />
               </div>
            </div>
         </div>
      </section>

      {/* WORKSPACE LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
         
         {/* SIDEBAR LEFT: FINANCIAL AUDIT */}
         <aside className="w-72 bg-slate-900/60 border-r border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar shadow-2xl z-10">
            <div className="p-6 space-y-6">
               <header className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Landmark size={12}/> Auditoria Interna
                  </h3>
                  <span className="text-[9px] font-black text-slate-600 uppercase">Cycle 0{activeArena?.current_round}</span>
               </header>
               
               <div className="bg-slate-950/80 p-5 rounded-3xl border border-white/5 space-y-3 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">DRE Tático</h4>
                     <Zap size={10} className="text-orange-500" />
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                     <MiniFinRow label="Faturamento" val={`3.32M`} />
                     <MiniFinRow label="Custos (CPV)" val={`(2.27M)`} neg />
                     <MiniFinRow label="EBITDA" val={`126.9K`} bold />
                     <MiniFinRow label="Net Profit" val={`73.9K`} bold highlight />
                  </div>
               </div>

               <div className="bg-slate-950/80 p-5 rounded-3xl border border-white/5 space-y-4">
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Saúde de Capital</h4>
                  <div className="space-y-2">
                     <div className="flex justify-between items-end">
                        <span className="text-[9px] font-bold text-slate-600 uppercase">Liquidez Corrente</span>
                        <span className="text-sm font-black text-emerald-500 font-mono italic">1.25x</span>
                     </div>
                     <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '65%' }} />
                     </div>
                  </div>
               </div>

               <div className="bg-orange-600/5 p-5 rounded-3xl border border-orange-500/10 space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black text-orange-500 uppercase italic">Tesoura (TSF)</span>
                     <Gauge size={12} className="text-orange-500" />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xl font-black text-white font-mono italic">{(currentKpis.scissors_effect?.tsf || 0).toFixed(2)}</span>
                     <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${currentKpis.scissors_effect?.is_critical ? 'bg-rose-600 text-white shadow-lg' : 'bg-emerald-600/20 text-emerald-500'}`}>
                        {currentKpis.scissors_effect?.is_critical ? 'CRÍTICO' : 'ÓTIMO'}
                     </span>
                  </div>
               </div>
            </div>
         </aside>

         {/* CENTRAL: COMMAND FEED (WAR ROOM) */}
         <main className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32">
               <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Decision <span className="text-orange-600">Matrix</span></h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2 italic">Unit Command • Nodo {activeTeam?.name || 'ALPHA'}</p>
                     </div>
                     <button onClick={() => setShowGazette(true)} className="px-5 py-2.5 bg-slate-900 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 shadow-2xl">
                        <Newspaper size={14} /> Oracle Gazette
                     </button>
                  </div>

                  <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                     <DecisionForm 
                        teamId={activeTeam?.id} 
                        champId={activeArena?.id} 
                        round={(activeArena?.current_round || 0) + 1} 
                        branch={activeArena?.branch} 
                     />
                  </div>
               </div>
            </div>
         </main>

         {/* SIDEBAR RIGHT: MARKET PULSE */}
         <aside className="w-72 bg-slate-900/60 border-l border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar shadow-2xl z-10">
            <div className="p-6 space-y-6">
               
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                     <Globe size={12}/> Ingestão de Mundo
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                     <MacroTileCompact label="Growth" val={`+${activeArena?.market_indicators.growth_rate}%`} color="blue" />
                     <MacroTileCompact label="Inflação" val={`${activeArena?.market_indicators.inflation_rate}%`} color="rose" />
                     <MacroTileCompact label="Juros" val={`${activeArena?.market_indicators.interest_rate_tr}%`} color="amber" />
                     <MacroTileCompact label="Mão de Obra" val="Fixa" color="emerald" />
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                     <Scale size={12}/> Market Intelligence
                  </h3>
                  <div className="bg-slate-950/80 rounded-3xl border border-white/5 overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-white/5 text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                           <tr>
                              <th className="px-3 py-3">Equipe</th>
                              <th className="px-1 py-3 text-center">Share</th>
                              <th className="px-3 py-3 text-right">Yield</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[9px]">
                           {currentKpis.regional_pulse?.slice(0, 6).map((reg: RegionalData, i: number) => (
                             <tr key={reg.region_id} className="hover:bg-white/5 transition-colors">
                                <td className="px-3 py-3 text-slate-400 font-bold uppercase truncate max-w-[80px]">UNIT 0{i+1}</td>
                                <td className="px-1 py-3 text-white text-center">{reg.market_share}%</td>
                                <td className="px-3 py-3 text-right text-orange-500 font-black">{(reg.market_share * 1.15).toFixed(1)}%</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-indigo-400">
                     <Sparkles size={12} />
                     <span className="text-[8px] font-black uppercase tracking-widest">Dica Strategos</span>
                  </div>
                  <p className="text-[10px] text-indigo-100 font-medium italic leading-relaxed">
                     "O preço médio do setor subiu 2%. Suas margens podem ser expandidas sem perda de share este ciclo."
                  </p>
               </div>
            </div>
         </aside>
      </div>

      <AnimatePresence>
        {showGazette && (
          <div className="fixed inset-0 z-[5000] p-6 md:p-12 bg-slate-950/90 backdrop-blur-md flex items-center justify-center">
             <GazetteViewer arena={activeArena!} aiNews="" round={activeArena?.current_round || 0} userRole={userRole} onClose={() => setShowGazette(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CockpitStat = ({ label, val, trend, pos, icon }: any) => (
  <div className="px-6 border-r border-white/5 hover:bg-white/[0.02] transition-all group flex flex-col justify-center overflow-hidden">
     <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
           <div className="text-orange-500 group-hover:scale-110 transition-transform">{icon}</div>
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{label}</span>
        </div>
        <span className={`text-[8px] font-black ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>
           {pos ? '▲' : '▼'}{trend}
        </span>
     </div>
     <span className="text-xl font-black text-white font-mono tracking-tighter italic leading-none truncate drop-shadow-lg">{val}</span>
  </div>
);

const MiniFinRow = ({ label, val, neg, bold, highlight }: any) => (
  <div className={`flex justify-between items-center py-1 border-b border-white/[0.02] last:border-0 ${highlight ? 'text-orange-500 font-black' : ''}`}>
     <span className={`${bold ? 'font-black text-slate-400' : 'text-slate-600'}`}>{label}</span>
     <span className={`font-black ${neg ? 'text-rose-500' : bold ? 'text-white' : 'text-slate-500'}`}>{val}</span>
  </div>
);

const MacroTileCompact = ({ label, val, color }: any) => {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
    rose: 'text-rose-400 bg-rose-500/5 border-rose-500/10',
    amber: 'text-amber-400 bg-amber-500/5 border-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'
  }[color as 'blue' | 'rose' | 'amber' | 'emerald'];

  return (
    <div className={`p-2 rounded-2xl border flex flex-col gap-0.5 shadow-inner ${colors}`}>
       <span className="text-[7px] font-black uppercase opacity-60 truncate tracking-tighter">{label}</span>
       <span className="text-xs font-black font-mono leading-none italic">{val}</span>
    </div>
  );
};

export default Dashboard;
