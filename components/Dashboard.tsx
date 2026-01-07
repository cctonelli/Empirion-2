
import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, BarChart3, 
  Sparkles, Loader2, ShieldCheck, Newspaper, Cpu, 
  ChevronRight, Shield, FileEdit, PenTool, 
  Eye, Timer, Box, HeartPulse, Landmark, 
  Thermometer, EyeOff, Globe, Map, PieChart, Users,
  ArrowUpRight, ArrowDownRight, Layers, Table as TableIcon, Info,
  Trophy // Fix: Added missing Trophy icon import
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

  if (loading) return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-[#020617]">
      <div className="text-center space-y-6">
        <Loader2 className="animate-spin text-orange-600 mx-auto" size={48} />
        <span className="text-white uppercase font-black text-xs tracking-[0.4em] animate-pulse italic">Synchronizing Oracle Cockpit...</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#020617] overflow-hidden font-sans">
      
      {/* TOP STRATEGIC KPI STRIP (ERP Cockpit) */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/5 border-b border-white/5 shrink-0 shadow-2xl z-20">
         <CockpitStat label="Valor da Ação" val={`$ ${currentKpis.market_valuation?.share_price.toFixed(2)}`} sub="EMPR 08 Index" trend="+1.2%" pos icon={<TrendingUp size={14}/>} />
         <CockpitStat label="Receita Bruta" val={`$ ${(3322735).toLocaleString()}`} sub="Acumulado P0" trend="Consistente" pos icon={<DollarSign size={14}/>} />
         <CockpitStat label="Lucro Líquido" val={`$ ${(73928).toLocaleString()}`} sub="Margem 2.2%" trend="+4.5%" pos icon={<Activity size={14}/>} />
         <CockpitStat label="TSR (Shareholder)" val={`${currentKpis.market_valuation?.tsr || 0}%`} sub="Retorno p/ Sócio" trend="High" pos icon={<PieChart size={14}/>} />
         <CockpitStat label="Rating Oracle" val={currentKpis.rating} sub="Classificação de Risco" trend="Estável" pos icon={<ShieldCheck size={14}/>} />
      </section>

      {/* MAIN OPERATIONAL HUB */}
      <div className="flex flex-1 overflow-hidden relative">
         
         {/* LEFT WING: FINANCIAL CORE & RATIOS (20%) */}
         <aside className="w-80 bg-slate-900/40 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto no-scrollbar shadow-xl">
            <div className="p-6 space-y-8">
               <div className="space-y-4">
                  <header className="flex items-center justify-between border-b border-white/5 pb-2">
                     <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                        <Landmark size={14}/> Financial Core
                     </h3>
                     <span className="text-[8px] font-mono text-slate-500">P0 ACTIVE</span>
                  </header>
                  
                  {/* MINI DRE */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                     <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Mini-DRE (Auditado)</h4>
                     <div className="space-y-2 font-mono text-[10px]">
                        <MiniFinRow label="Receita Vendas" val="3.32M" />
                        <MiniFinRow label="CPV Total" val="(2.27M)" neg />
                        <MiniFinRow label="Lucro Oper." val="126K" bold />
                        <MiniFinRow label="Lucro Líq." val="73K" bold highlight />
                     </div>
                  </div>

                  {/* MINI BALANCE SHEET */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                     <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Posição Patrimonial</h4>
                     <div className="space-y-2 font-mono text-[10px]">
                        <MiniFinRow label="Ativo Circulante" val="3.29M" />
                        <MiniFinRow label="Ativo Fixo (Capex)" val="5.88M" />
                        <MiniFinRow label="Patrimônio Líq." val="5.05M" bold />
                     </div>
                  </div>

                  {/* SCISSORS EFFECT / TSF WIDGET */}
                  <div className="bg-orange-600/10 p-5 rounded-2xl border border-orange-500/20 space-y-4">
                     <header className="flex justify-between items-center">
                        <h4 className="text-[9px] font-black text-orange-500 uppercase tracking-tight">Efeito Tesoura</h4>
                        <Thermometer size={12} className="text-orange-500" />
                     </header>
                     <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Termômetro TSF</span>
                        <div className="flex items-center justify-between">
                           <span className="text-xl font-black text-white italic">{(currentKpis.scissors_effect?.tsf || 0).toFixed(2)}</span>
                           <span className={`text-[8px] font-black px-2 py-0.5 rounded ${currentKpis.scissors_effect?.is_critical ? 'bg-rose-500' : 'bg-emerald-500'} text-white`}>
                              {currentKpis.scissors_effect?.is_critical ? 'CRÍTICO' : 'ESTÁVEL'}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </aside>

         {/* CENTER HUB: DECISION WIZARD ENGINE (60%) */}
         <main className="flex-1 flex flex-col bg-[#020617] overflow-y-auto custom-scrollbar relative z-10">
            <div className="p-8 md:p-12">
               <div className="max-w-4xl mx-auto space-y-10">
                  <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                     <div>
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Decision <span className="text-orange-600">Hub</span></h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Orquestração tática para o Período 0{(activeArena?.current_round || 0) + 1}</p>
                     </div>
                     <div className="flex gap-4">
                        <ChampionshipTimer roundStartedAt={activeArena?.round_started_at} deadlineValue={activeArena?.deadline_value} deadlineUnit={activeArena?.deadline_unit} />
                        <button onClick={() => setShowGazette(true)} className="px-6 py-3 bg-slate-900 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3 shadow-xl">
                           <Newspaper size={16} /> Gazeta Empirion
                        </button>
                     </div>
                  </header>

                  <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-1 shadow-2xl overflow-hidden">
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

         {/* RIGHT WING: MARKET PULSE & MACRO (20%) */}
         <aside className="w-96 bg-slate-900/40 border-l border-white/5 flex flex-col shrink-0 overflow-y-auto no-scrollbar shadow-xl">
            <div className="p-6 space-y-8">
               
               {/* MACRO BOARD */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                     <Cpu size={14}/> Macro board
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                     <MacroTile label="ICE" val={`+${activeArena?.market_indicators.growth_rate}%`} icon={<TrendingUp size={12}/>} />
                     <MacroTile label="Inflação" val={`${activeArena?.market_indicators.inflation_rate}%`} icon={<Activity size={12}/>} />
                     <MacroTile label="TR (Juros)" val={`${activeArena?.market_indicators.interest_rate_tr}%`} icon={<Landmark size={12}/>} />
                     <MacroTile label="Mão de Obra" val="Média" icon={<Users size={12}/>} />
                  </div>
               </div>

               {/* REGIONAL INTELLIGENCE TABLE */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                     <Globe size={14}/> Regional Pulse
                  </h3>
                  <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shadow-inner">
                     <table className="w-full text-left">
                        <thead className="bg-white/5 text-[8px] font-black uppercase text-slate-500">
                           <tr>
                              <th className="px-4 py-3">Região</th>
                              <th className="px-2 py-3 text-center">Venda</th>
                              <th className="px-2 py-3 text-right">Share %</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[9px]">
                           {currentKpis.regional_pulse?.map((reg: RegionalData) => (
                             <tr key={reg.region_id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-4 py-3 text-slate-300 font-bold">{reg.region_name}</td>
                                <td className="px-2 py-3 text-white text-center">{reg.units_sold.toLocaleString()}</td>
                                <td className="px-2 py-3 text-right text-orange-500 font-black">{reg.market_share}%</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* MARKET DEPTH (Prices & Leaders) */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                     <Shield size={14}/> Competition Radar
                  </h3>
                  <div className="space-y-3">
                     <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex justify-between items-center group cursor-help hover:border-indigo-500/30 transition-all">
                        <div>
                           <span className="block text-[8px] font-black text-slate-500 uppercase">Preço Médio Mercado</span>
                           <span className="text-lg font-black text-white italic">$ 372,40</span>
                        </div>
                        <Info size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                     </div>
                     <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex justify-between items-center group cursor-help hover:border-orange-500/30 transition-all">
                        <div>
                           <span className="block text-[8px] font-black text-slate-500 uppercase">Líder Market Share</span>
                           <span className="text-lg font-black text-white italic">UNIT ALPHA</span>
                        </div>
                        <TrophyIcon size={14} className="text-orange-500" />
                     </div>
                  </div>
               </div>
            </div>
         </aside>
      </div>

      {/* GAZETTE MODAL OVERLAY */}
      <AnimatePresence>
        {showGazette && (
          <div className="fixed inset-0 z-[5000] p-10 bg-slate-950/90 backdrop-blur-md flex items-center justify-center">
             <GazetteViewer arena={activeArena!} aiNews="" round={activeArena?.current_round || 0} userRole={userRole} onClose={() => setShowGazette(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CockpitStat = ({ label, val, sub, trend, pos, icon }: any) => (
  <div className="p-6 hover:bg-white/[0.03] transition-all group flex flex-col justify-between min-h-[110px]">
     <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-white/5 rounded-lg text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-md">{icon}</div>
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className={`flex items-center gap-1 text-[9px] font-black ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>
           {pos ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {trend}
        </div>
     </div>
     <div className="mt-4">
        <span className="text-2xl font-black text-white font-mono tracking-tighter italic leading-none">{val}</span>
        <p className="text-[7px] font-bold text-slate-600 uppercase mt-1 tracking-widest">{sub}</p>
     </div>
  </div>
);

const MiniFinRow = ({ label, val, neg, bold, highlight }: any) => (
  <div className={`flex justify-between items-center py-1.5 ${highlight ? 'bg-orange-500/10 -mx-5 px-5 py-2' : ''}`}>
     <span className={`tracking-wider ${bold ? 'font-black text-slate-200' : 'text-slate-500'}`}>{label}</span>
     <span className={`font-black ${neg ? 'text-rose-500' : bold ? 'text-white' : 'text-slate-300'}`}>$ {val}</span>
  </div>
);

const MacroTile = ({ label, val, icon }: any) => (
  <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2 hover:border-blue-500/30 transition-all shadow-inner">
     <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-[7px] font-black uppercase tracking-tight">{label}</span>
     </div>
     <span className="block text-sm font-black text-white font-mono italic">{val}</span>
  </div>
);

const TrophyIcon = ({ size, className }: { size: number, className: string }) => <Trophy size={size} className={className} />;

export default Dashboard;
