
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Landmark, Boxes, Loader2, Users, Cpu, Wrench, Clock, UserMinus, ShieldAlert, Heart, Flame, Factory, Database
} from 'lucide-react';
import { Branch, Championship, Team } from '../types';
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
       revenue: 0, cpv: 0, gross_profit: 0, opex: 0, lair: 0, tax: 0, net_profit: 0,
       details: { 
         cpp: 0, wac_pa: 0, mp_consumption: 0, mod_total: 0, maintenance: 0, depreciation_total: 0, overtime_cost: 0 
       }
     };
  }, [activeTeam]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto p-6">
      <header className="flex justify-between items-end px-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Arena: {activeArena?.name} • Ciclo de Auditoria</p>
         </div>
         <div className="flex gap-6">
            <MetricSummary label="CPP do Ciclo" val={`$ ${dre.details?.cpp?.toFixed(2)}`} icon={<Factory size={20}/>} />
            <MetricSummary label="WAC PA (Estoque)" val={`$ ${dre.details?.wac_pa?.toFixed(2)}`} icon={<Database size={20}/>} />
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-8 bg-slate-900 border border-white/5 rounded-[4rem] p-12 shadow-2xl space-y-8">
            <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">Demonstrativo de Resultados (DRE)</h3>
            <div className="space-y-4 font-mono">
               <ReportLine label="RECEITA LÍQUIDA" val={fmt(dre.revenue)} bold />
               <ReportLine label="(-) CPV (BASE WAC PA)" val={fmt(dre.cpv)} neg />
               <ReportLine label="(=) LUCRO BRUTO" val={fmt(dre.gross_profit)} highlight />
               <ReportLine label="(-) DESPESAS OPERACIONAIS" val={fmt(dre.opex)} neg />
               <ReportLine label="(=) LAIR" val={fmt(dre.lair)} bold />
               <ReportLine label="(-) IMPOSTO DE RENDA" val={fmt(dre.tax)} neg />
               <ReportLine label="(=) LUCRO LÍQUIDO" val={fmt(dre.net_profit)} total />
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-10 shadow-2xl space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Composição do CPP</h4>
               <div className="space-y-6">
                  <CostDetail label="Matéria-Prima (WAC)" val={fmt(dre.details?.mp_consumption)} />
                  <CostDetail label="Mão de Obra Direta" val={fmt(dre.details?.mod_total)} />
                  <CostDetail label="Manutenção de Ativos" val={fmt(dre.details?.maintenance)} />
                  <CostDetail label="Depreciação" val={fmt(dre.details?.depreciação_total)} />
                  
                  <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                     <span className="text-[8px] font-black text-slate-500 uppercase">Horas Extras Pagas</span>
                     <span className="text-sm font-mono font-black text-amber-500">$ {fmt(dre.details?.overtime_cost)}</span>
                  </div>
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportLine = ({ label, val, neg, bold, total, highlight }: any) => (
  <div className={`flex justify-between p-4 rounded-2xl ${total ? 'bg-orange-600/10 border border-orange-500/20 mt-4' : highlight ? 'bg-white/5' : ''}`}>
    <span className={`text-[10px] uppercase tracking-wider ${bold || total ? 'font-black text-white' : 'text-slate-500'}`}>{label}</span>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : total ? 'text-orange-500' : 'text-slate-200'}`}>{neg ? '(' : ''}$ {val}{neg ? ')' : ''}</span>
  </div>
);

const MetricSummary = ({ label, val, icon }: any) => (
  <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4">
    <div className="text-orange-500">{icon}</div>
    <div>
      <span className="block text-[8px] font-black text-slate-500 uppercase italic">{label}</span>
      <span className="text-xl font-mono font-black text-white">{val}</span>
    </div>
  </div>
);

const CostDetail = ({ label, val }: any) => (
  <div className="flex justify-between items-center group">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
    <span className="text-sm font-mono font-black text-white">$ {val}</span>
  </div>
);

export default Reports;
