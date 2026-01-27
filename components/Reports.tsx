
import React, { useState, useMemo, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, BarChart3, Brain, ChevronRight, Landmark,
  ArrowUpRight, Target, Download, HeartPulse, Zap, Plus, Minus, Loader2, Factory, Users, Cpu, Boxes,
  ShieldCheck, AlertCircle, Activity, Heart, ShieldAlert, Flame
} from 'lucide-react';
import { Branch, Championship, Team, AccountNode } from '../types';
import { motion } from 'framer-motion';
import { getChampionships } from '../services/supabase';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContext = async () => {
      const champId = localStorage.getItem('active_champ_id');
      const teamId = localStorage.getItem('active_team_id');
      if (!champId) return;

      const { data } = await getChampionships();
      const arena = data?.find(a => a.id === champId);
      if (arena) {
        setActiveArena(arena);
        const team = arena.teams?.find(t => t.id === teamId);
        if (team) setActiveTeam(team);
      }
      setLoading(false);
    };
    fetchContext();
  }, []);

  const dre = useMemo(() => {
     return activeTeam?.kpis?.statements?.dre || {
       revenue: 0, cpv: 0, gross_profit: 0, opex: 0, operating_profit: 0, lair: 0, tax: 0, profit_after_tax: 0, plr: 0, net_profit: 0,
       details: { unit_cost: 0, plr_per_employee: 0, total_staff: 500, motivation_index: 0.8 }
     };
  }, [activeTeam]);

  const motivation = activeTeam?.kpis?.motivation_score || dre.details?.motivation_index || 0.8;
  const isOnStrike = activeTeam?.kpis?.is_on_strike || false;
  
  const motivationColor = isOnStrike ? 'text-rose-600' : motivation > 0.8 ? 'text-emerald-500' : motivation > 0.5 ? 'text-orange-500' : 'text-rose-500';
  const motivationLabel = isOnStrike ? 'GREVE' : (motivation > 0.8 ? 'BOA' : motivation > 0.5 ? 'REGULAR' : 'RUIM');

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto p-6">
      <header className="flex justify-between items-end px-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
              Arena: {activeArena?.name || 'ORACLE_UNLINKED'} • Controladoria Industrial
            </p>
         </div>
         <div className="flex items-center gap-6">
            <div className={`bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4 group ${isOnStrike ? 'border-rose-500 animate-pulse' : ''}`}>
               <div className="text-right">
                  <span className="block text-[8px] font-black text-slate-500 uppercase italic">Clima Organizacional</span>
                  <span className={`text-xl font-mono font-black ${motivationColor}`}>{motivationLabel}</span>
               </div>
               {isOnStrike ? <Flame className="text-rose-500" size={24} /> : <Heart className={`${motivationColor} group-hover:scale-110 transition-transform`} size={24} fill="currentColor" />}
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4">
               <div className="text-right">
                  <span className="block text-[8px] font-black text-slate-500 uppercase italic">Custo Unitário</span>
                  <span className="text-xl font-mono font-black text-orange-500">$ {dre.details?.unit_cost?.toFixed(2)}</span>
               </div>
               <Boxes className="text-orange-500" size={24} />
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-8 space-y-8">
            <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] shadow-2xl space-y-8">
               <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Demonstrativo de Resultado (DRE)</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Unidade: {activeTeam?.name || 'ALPHA'}</span>
               </div>
               
               <div className="space-y-4 font-mono">
                  <ReportLine label="RECEITA BRUTA DE VENDAS" val={fmt(dre.revenue)} bold />
                  <ReportLine label="(-) CPV-CUSTO PROD. VENDIDO" val={fmt(dre.cpv)} neg />
                  <ReportLine label="(=) LUCRO BRUTO" val={fmt(dre.gross_profit)} highlight />
                  <ReportLine label="(-) DESPESAS OPERACIONAIS" val={fmt(dre.opex)} neg />
                  <ReportLine label="(=) LUCRO OPERACIONAL" val={fmt(dre.operating_profit)} bold />
                  <ReportLine label="(=) LAIR - LUCRO LÍQUIDO ANTES DO IR" val={fmt(dre.lair)} bold />
                  <ReportLine label="(-) PROVISÃO PARA O IR" val={fmt(dre.tax || 0)} neg />
                  <ReportLine label="(=) LUCRO LÍQUIDO APÓS O I. R." val={fmt(dre.profit_after_tax)} highlight />
                  <ReportLine label="(-) PLR - PARTICIPAÇÃO NO LUCRO" val={fmt(dre.plr)} neg highlightRed />
                  <ReportLine label="(=) LUCRO LÍQUIDO DO EXERCÍCIO" val={fmt(dre.net_profit)} total />
               </div>
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="p-10 bg-slate-900 border border-white/10 rounded-[4rem] space-y-8 shadow-2xl relative overflow-hidden">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Métricas de Gestão Humana</h4>
               <div className="space-y-6 relative z-10">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                     <span className="text-[8px] font-black text-slate-500 uppercase">PLR por Colaborador</span>
                     <div className="flex items-center justify-between mt-1">
                        <span className="text-2xl font-mono font-black text-emerald-400">
                           $ {fmt(dre.details?.plr_per_employee || 0)}
                        </span>
                        <Users className="text-slate-600" size={20} />
                     </div>
                  </div>
                  <CostMetric label="Total Colaboradores" val={dre.details?.total_staff || 500} icon={<Users size={16}/>} />
                  <CostMetric label="Estabilidade do Nodo" val={`${(motivation * 100).toFixed(0)}%`} icon={<Activity size={16}/>} />
                  
                  {isOnStrike ? (
                    <div className="p-6 bg-rose-600 border border-rose-400 rounded-3xl flex items-center gap-4 animate-bounce">
                       <ShieldAlert className="text-white" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">GREVE ATIVA: PRODUÇÃO ZERO</span>
                    </div>
                  ) : motivation < 0.35 && (
                    <div className="p-6 bg-rose-600/20 border border-rose-500/40 rounded-3xl flex items-center gap-4 animate-pulse">
                       <ShieldAlert className="text-rose-500" />
                       <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest">ALERTA: RISCO DE GREVE IMINENTE</span>
                    </div>
                  )}
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportLine = ({ label, val, neg, bold, total, highlight, highlightRed }: any) => (
  <div className={`flex justify-between p-4 rounded-2xl transition-all ${
     total ? 'bg-slate-950 border-y-2 border-orange-500/20 mt-6 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 
     highlight ? 'bg-white/5 border border-white/5' : 
     highlightRed ? 'bg-rose-500/5 border border-rose-500/20' :
     'hover:bg-white/[0.02]'
  }`}>
    <span className={`text-[11px] uppercase tracking-wider ${bold ? 'font-black text-white' : total ? 'font-black text-orange-500' : 'text-slate-500'}`}>{label}</span>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : total ? 'text-orange-500' : 'text-slate-200'}`}>{neg ? '(' : ''}$ {val}{neg ? ')' : ''}</span>
  </div>
);

const CostMetric = ({ label, val, icon }: any) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
    <div className="flex items-center gap-3">
      <div className="text-slate-600 group-hover:text-orange-500 transition-colors">{icon}</div>
      <span className="text-[10px] font-black uppercase text-slate-500">{label}</span>
    </div>
    <span className="text-lg font-black text-white italic">{val}</span>
  </div>
);

export default Reports;
