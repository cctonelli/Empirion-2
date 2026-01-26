
import React, { useState, useMemo, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, BarChart3, Brain, ChevronRight, Landmark,
  // Added missing Activity icon import
  ArrowUpRight, Target, Download, HeartPulse, Zap, Plus, Minus, Loader2, Factory, Users, Cpu, Boxes,
  ShieldCheck, AlertCircle, Activity
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
       revenue: 3322735,
       cpv: 2278180,
       gross_profit: 1044555,
       opex: 917582,
       operating_profit: 126973,
       precision_bonus: 0,
       plr: 12697,
       net_profit: 114276,
       details: { mp_ponderada: 1400000, mod_with_charges: 630000, overtime_cost: 0, unit_cost: 235, social_charges_rate: 35, target_gap: 0 }
     };
  }, [activeTeam]);

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
            {dre.precision_bonus > 0 && (
               <div className="bg-emerald-500/10 px-6 py-4 rounded-3xl border-2 border-emerald-500/30 flex items-center gap-4 animate-bounce">
                  <div className="text-right">
                     <span className="block text-[8px] font-black text-emerald-500 uppercase italic">Prêmio Precisão Meta</span>
                     <span className="text-xl font-mono font-black text-white">+ $ {fmt(dre.precision_bonus)}</span>
                  </div>
                  <Target className="text-emerald-500" size={24} />
               </div>
            )}
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
                  <ReportLine label="Receita Bruta de Vendas" val={fmt(dre.revenue)} bold />
                  
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-3 relative overflow-hidden">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.5em] mb-4 block italic">Custo do Produto Vendido (CPV Industrial)</span>
                    <ReportLine label="Insumos (MP CMP Ponderada)" val={fmt(dre.details?.mp_ponderada || 0)} neg />
                    <ReportLine label={`Mão de Obra Direta (MOD)`} val={fmt(dre.details?.mod_with_charges || 0)} neg />
                    {dre.details?.overtime_cost > 0 && (
                       <ReportLine label="Adicional de Horas Extras (Kernel v23)" val={fmt(dre.details.overtime_cost)} neg highlightRed />
                    )}
                    <ReportLine label="Depreciação e Outros Custos" val={fmt(dre.details?.depreciation || 150000)} neg />
                  </div>

                  <ReportLine label="(=) LUCRO BRUTO" val={fmt(dre.gross_profit)} highlight />
                  <ReportLine label="(-) Despesas Operacionais" val={fmt(dre.opex)} neg />
                  
                  <ReportLine label="(=) LUCRO OPERACIONAL ANTES DO IR" val={fmt(dre.operating_profit)} bold />
                  <ReportLine label="(-) Imposto de Renda" val={fmt(dre.tax || 0)} neg />
                  
                  {dre.precision_bonus > 0 && (
                     <ReportLine label="(+) Bônus Precisão Meta de Lucro" val={fmt(dre.precision_bonus)} highlightEmerald />
                  )}
                  
                  <ReportLine label="(-) Participação nos Resultados (PLR)" val={fmt(dre.plr)} neg />
                  <ReportLine label="(=) LUCRO LÍQUIDO DO EXERCÍCIO" val={fmt(dre.net_profit)} total />
               </div>
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="p-10 bg-slate-900 border border-white/10 rounded-[4rem] space-y-8 shadow-2xl relative overflow-hidden">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Estatísticas de Acuracidade</h4>
               <div className="space-y-6 relative z-10">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                     <span className="text-[8px] font-black text-slate-500 uppercase">Gap para Meta (%)</span>
                     <div className="flex items-center justify-between mt-1">
                        <span className={`text-2xl font-mono font-black ${dre.details?.target_gap <= 1.0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {dre.details?.target_gap?.toFixed(2)}%
                        </span>
                        {dre.details?.target_gap <= 1.0 ? <ShieldCheck className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
                     </div>
                  </div>
                  <CostMetric label="Margem Líquida Real" val={`${((dre.net_profit / dre.revenue) * 100).toFixed(1)}%`} icon={<Zap size={16}/>} />
                  <CostMetric label="Custo Horas Extras" val={`$ ${fmt(dre.details?.overtime_cost || 0)}`} icon={<Activity size={16}/>} />
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportLine = ({ label, val, neg, bold, total, highlight, highlightRed, highlightEmerald }: any) => (
  <div className={`flex justify-between p-4 rounded-2xl transition-all ${
     total ? 'bg-slate-950 border-y-2 border-orange-500/20 mt-6 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 
     highlight ? 'bg-white/5 border border-white/5' : 
     highlightRed ? 'bg-rose-500/5 border border-rose-500/20' :
     highlightEmerald ? 'bg-emerald-500/5 border border-emerald-500/20' :
     'hover:bg-white/[0.02]'
  }`}>
    <span className={`text-[11px] uppercase tracking-wider ${bold ? 'font-black text-white' : total ? 'font-black text-orange-500' : 'text-slate-500'}`}>{label}</span>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : total ? 'text-orange-500' : highlightEmerald ? 'text-emerald-500' : 'text-slate-200'}`}>{neg ? '(' : ''}$ {val}{neg ? ')' : ''}</span>
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
