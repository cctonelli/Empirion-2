
import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, BarChart3, Brain, ChevronRight, Landmark,
  ArrowUpRight, Target, Download, HeartPulse
} from 'lucide-react';
import { Branch } from '../types';
import { motion } from 'framer-motion';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [selectedRound, setSelectedRound] = useState(0);

  // Mock de dados históricos para o gráfico v12.8
  const plEvolutionData = {
    options: {
      chart: { id: 'pl-evolution', toolbar: { show: false }, background: 'transparent' },
      colors: ['#f97316', '#3b82f6'],
      stroke: { curve: 'smooth', width: [4, 2], dashArray: [0, 8] },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0 } },
      xaxis: { categories: ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'], labels: { style: { colors: '#94a3b8', fontWeight: 700 } } },
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
      { name: 'Patrimônio Líquido', type: 'area', data: [5055447, 5129375, 5080000, 5250000, 5400000, 5600000] },
      { name: 'CAPEX (Máquinas)', type: 'line', data: [2360000, 2360000, 3875000, 3875000, 3875000, 5390000] }
    ]
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end px-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Dossiê de Performance Consolidada v12.8 Stable</p>
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
                    <TrendingUp className="text-orange-500" /> Evolução de Patrimônio vs CAPEX
                  </h3>
                  <div className="flex gap-6">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                        <span className="text-[9px] font-black text-slate-500 uppercase">Patrimônio Líquido</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-blue-500 border-dashed" />
                        <span className="text-[9px] font-black text-slate-500 uppercase">CAPEX Acumulado</span>
                     </div>
                  </div>
               </div>
               <div className="h-[380px]">
                  <Chart options={plEvolutionData.options as any} series={plEvolutionData.series} type="line" height="100%" />
               </div>
            </div>

            <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] shadow-2xl space-y-8">
               <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Demonstrativo de Resultado (DRE)</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">P0{selectedRound} • Industrial Unit 08</span>
               </div>
               <div className="space-y-4 font-mono">
                  <ReportLine label="Receita de Vendas" val="3.322.735" bold />
                  <ReportLine label="(-) Custo dos Produtos Vendidos (CPV)" val="2.278.180" neg />
                  <ReportLine label="(=) LUCRO BRUTO" val="1.044.555" highlight />
                  <ReportLine label="(-) Despesas Operacionais" val="957.582" />
                  <ReportLine label="(=) LUCRO LÍQUIDO DO EXERCÍCIO" val="73.928" total />
               </div>
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="p-10 bg-indigo-600 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
               <Brain className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" size={200} />
               <h4 className="text-xl font-black uppercase italic mb-6">Oráculo Strategos Insight</h4>
               <p className="text-sm font-medium leading-relaxed italic">
                 "Seu lucro de $73k no Round 1 é resiliente. Note que o CAPEX subiu no Round 2, indicando expansão via compra de máquinas Beta. O PL acompanha a tendência, provando eficiência na alocação de capital."
               </p>
            </div>
            <div className="p-10 bg-white/5 border border-white/10 rounded-[4rem] space-y-10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-6">Audit Ratios</h4>
               <div className="space-y-8">
                  <Kpi label="ROI (Return on Investment)" val="4.2%" color="emerald" />
                  <Kpi label="WACC (Capital Cost)" val="12.5%" color="amber" />
                  <Kpi label="Rating de Crédito" val="AAA" color="blue" />
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportLine = ({ label, val, neg, bold, total, highlight }: any) => (
  <div className={`flex justify-between p-4 rounded-2xl transition-all ${total ? 'bg-slate-950 border-y-2 border-white/10 mt-6' : highlight ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}>
    <span className={`text-[11px] uppercase tracking-wider ${bold ? 'font-black text-white' : 'text-slate-500'}`}>{label}</span>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : total ? 'text-orange-500' : 'text-slate-200'}`}>{neg ? '(' : ''}$ {val}{neg ? ')' : ''}</span>
  </div>
);

const Kpi = ({ label, val, color }: any) => (
  <div className="flex justify-between items-end border-b border-white/5 pb-6 group">
    <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white transition-colors">{label}</span>
    <span className={`text-3xl font-black italic font-mono text-${color}-500`}>{val}</span>
  </div>
);

export default Reports;
