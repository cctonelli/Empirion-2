
import React, { useState, useMemo, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, BarChart3, Brain, ChevronRight, Landmark,
  ArrowUpRight, Target, Download, HeartPulse, Zap, Plus, Minus, Loader2
} from 'lucide-react';
import { Branch, Championship, Team, AccountNode } from '../types';
import { motion } from 'framer-motion';
import { getChampionships, supabase } from '../services/supabase';

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

  // Dados Reais para o Gráfico de Evolução (Mockado com fallback inteligente se round > 0)
  const chartData = useMemo(() => {
    const currentEquity = activeTeam?.equity || 5055447;
    const history = [5055447, currentEquity]; 
    const rounds = Array.from({ length: history.length }, (_, i) => `R${i}`);

    return {
      options: {
        chart: { id: 'pl-evolution', toolbar: { show: false }, background: 'transparent' },
        colors: ['#f97316', '#3b82f6'],
        stroke: { curve: 'smooth', width: [4, 2], dashArray: [0, 8] },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0 } },
        xaxis: { categories: rounds, labels: { style: { colors: '#94a3b8', fontWeight: 700 } } },
        yaxis: { 
          labels: { 
            style: { colors: '#94a3b8' }, 
            formatter: (v: number) => v ? `$${(v/1000000).toFixed(1)}M` : '$0' 
          } 
        },
        grid: { borderColor: 'rgba(255,255,255,0.05)' },
        tooltip: { theme: 'dark' },
        legend: { show: false }
      },
      series: [
        { name: 'Patrimônio Líquido', type: 'area', data: history },
        { name: 'CapEx Real', type: 'line', data: Array(history.length).fill(5886600) }
      ]
    };
  }, [activeTeam]);

  // Extração real do DRE
  const dre = useMemo(() => {
     return activeTeam?.kpis?.statements?.dre || activeArena?.initial_financials?.dre || {
       revenue: 3322735,
       cpv: 2278180,
       opex: 917582,
       financial_revenue: 0,
       financial_expense: 40000,
       net_profit: 73928
     };
  }, [activeTeam, activeArena]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR').format(v);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end px-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
              Arena: {activeArena?.name || 'ORACLE_UNLINKED'} • Ciclo Atual: 0{activeArena?.current_round}
            </p>
         </div>
         <div className="flex gap-4">
            <button className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-orange-600 transition-all shadow-xl flex items-center gap-3">
               <Download size={16} /> Exportar Relatório Executivo
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-8 space-y-8">
            <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] shadow-2xl">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-4">
                    <TrendingUp className="text-orange-500" /> Evolução de Patrimônio (Real)
                  </h3>
               </div>
               <div className="h-[380px]">
                  <Chart options={chartData.options as any} series={chartData.series} type="line" height="100%" />
               </div>
            </div>

            <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] shadow-2xl space-y-8">
               <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Demonstrativo de Resultado (DRE)</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unidade: {activeTeam?.name || 'N/A'}</span>
               </div>
               <div className="space-y-4 font-mono">
                  <ReportLine label="Receita de Vendas" val={fmt(dre.revenue)} bold />
                  <ReportLine label="(-) Custo dos Produtos Vendidos (CPV)" val={fmt(dre.cpv)} neg />
                  <ReportLine label="(=) LUCRO BRUTO" val={fmt(dre.revenue - dre.cpv)} highlight />
                  <ReportLine label="(-) Despesas Operacionais (Vendas + Admin)" val={fmt(dre.opex)} neg />
                  
                  <div className="bg-white/5 p-4 rounded-2xl space-y-3">
                    <ReportLine label="( + ) Receitas Financeiras" val={fmt(dre.financial_revenue || 0)} pos icon={<Plus size={10}/>} />
                    <ReportLine label="( - ) Despesas Financeiras" val={fmt(dre.financial_expense || 0)} neg icon={<Minus size={10}/>} />
                  </div>

                  <ReportLine label="(=) LUCRO LÍQUIDO DO EXERCÍCIO" val={fmt(dre.net_profit)} total />
               </div>
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="p-10 bg-indigo-600 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
               <Brain className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" size={200} />
               <h4 className="text-xl font-black uppercase italic mb-6">Oráculo Strategos Insight</h4>
               <p className="text-sm font-medium leading-relaxed italic">
                 { activeTeam?.equity && activeTeam.equity < 5000000 
                   ? "Alerta: Degradação de Patrimônio Líquido detectada. Suas operações estão destruindo valor."
                   : "Saúde patrimonial estável. Continue monitorando o ROE (Return on Equity)." }
               </p>
            </div>
            <div className="p-10 bg-white/5 border border-white/10 rounded-[4rem] space-y-10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-6">Audit Ratios Real-time</h4>
               <div className="space-y-8">
                  <Kpi label="Rating de Crédito" val={activeTeam?.kpis?.rating || 'AAA'} color="blue" />
                  <Kpi label="Market Share" val={`${(activeTeam?.kpis?.market_share || 0).toFixed(1)}%`} color="emerald" />
                  <Kpi label="Patrimônio" val={`$ ${( (activeTeam?.equity || 5055447) / 1000000 ).toFixed(2)}M`} color="orange" />
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportLine = ({ label, val, neg, pos, bold, total, highlight, icon }: any) => (
  <div className={`flex justify-between p-4 rounded-2xl transition-all ${total ? 'bg-slate-950 border-y-2 border-white/10 mt-6' : highlight ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}>
    <div className="flex items-center gap-2">
      {icon && <span className={neg ? 'text-rose-500' : 'text-emerald-500'}>{icon}</span>}
      <span className={`text-[11px] uppercase tracking-wider ${bold ? 'font-black text-white' : 'text-slate-500'}`}>{label}</span>
    </div>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : pos ? 'text-emerald-500' : total ? 'text-orange-500' : 'text-slate-200'}`}>{neg ? '(' : ''}$ {val}{neg ? ')' : ''}</span>
  </div>
);

const Kpi = ({ label, val, color }: any) => (
  <div className="flex justify-between items-end border-b border-white/5 pb-6 group">
    <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white transition-colors">{label}</span>
    <span className={`text-3xl font-black italic font-mono text-${color}-500`}>{val}</span>
  </div>
);

export default Reports;
