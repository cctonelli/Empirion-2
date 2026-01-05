
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  FileText, Package, DollarSign, Globe, User, History, 
  TrendingUp, Activity, BarChart3, Database, ShieldAlert,
  Zap, Brain, ChevronRight, Scale, Landmark, Cpu, AlertTriangle,
  ArrowUpRight, Target, Users, Download, Maximize2, Filter,
  TrendingDown, HeartPulse
} from 'lucide-react';
import { Branch, Championship, Team } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective'>('individual');
  const [selectedRound, setSelectedRound] = useState(0);

  // Dados mockados para o gráfico de PL
  const plEvolutionData = {
    options: {
      chart: { id: 'pl-evolution', toolbar: { show: false }, background: 'transparent' },
      colors: ['#f97316', '#3b82f6'],
      stroke: { curve: 'smooth', width: [4, 2], dashArray: [0, 8] },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0 } },
      xaxis: { categories: ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'], labels: { style: { colors: '#94a3b8' } } },
      yaxis: { labels: { style: { colors: '#94a3b8' } } },
      grid: { borderColor: 'rgba(255,255,255,0.05)' },
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
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Industrial Mastery • v12.8 Stable</p>
         </div>
         <div className="flex gap-4">
            <button className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-orange-600 transition-all shadow-xl">
               Exportar DRE para Impressão
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-8 space-y-8">
            {/* GRÁFICO DE EVOLUÇÃO DE PATRIMÔNIO LÍQUIDO */}
            <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] shadow-2xl">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-4">
                    <TrendingUp className="text-orange-500" /> Evolução de Patrimônio vs CAPEX
                  </h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase">Patrimônio Líquido</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-blue-500 border-dashed" />
                        <span className="text-[9px] font-black text-slate-500 uppercase">CAPEX Acumulado</span>
                     </div>
                  </div>
               </div>
               <div className="h-[350px]">
                  <Chart options={plEvolutionData.options} series={plEvolutionData.series} type="line" height="100%" />
               </div>
            </div>

            {/* DEMONSTRATIVO SIMPLIFICADO */}
            <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] shadow-2xl space-y-6">
               <h3 className="text-xl font-black text-white uppercase italic tracking-tighter border-b border-white/5 pb-6">DRE Consolidada P0{selectedRound}</h3>
               <div className="space-y-4 font-mono">
                  <ReportLine label="Receita Bruta" val="3.322.735" bold />
                  <ReportLine label="(-) CPV Industrial" val="2.278.180" neg />
                  <ReportLine label="(=) Lucro Bruto" val="1.044.555" highlight />
                  <ReportLine label="(-) Despesas Operacionais" val="957.582" />
                  <ReportLine label="(=) Lucro Líquido" val="73.928" total />
               </div>
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="p-10 bg-indigo-600 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
               <Brain className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" size={200} />
               <h4 className="text-xl font-black uppercase italic mb-6">Oracle Advisor</h4>
               <p className="text-sm font-medium leading-relaxed italic">
                 "Sua orquestração de CAPEX no Round 2 (Compra de Beta) impactou a liquidez imediata, mas o gráfico de PL mostra uma tendência de valorização a longo prazo."
               </p>
            </div>
            <div className="p-10 bg-white/5 border border-white/10 rounded-[4rem] space-y-8">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Ratios de Desempenho</h4>
               <div className="space-y-6">
                  <Kpi label="ROI" val="4.2%" color="emerald" />
                  <Kpi label="WACC" val="12.5%" color="amber" />
                  <Kpi label="Rating" val="AAA" color="blue" />
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportLine = ({ label, val, neg, bold, total, highlight }: any) => (
  <div className={`flex justify-between p-4 rounded-xl ${total ? 'bg-slate-950 border-y-2 border-white/10 mt-4' : highlight ? 'bg-white/5' : ''}`}>
    <span className={`text-[11px] uppercase ${bold ? 'font-black text-white' : 'text-slate-500'}`}>{label}</span>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : total ? 'text-orange-500' : 'text-slate-200'}`}>{neg ? '(' : ''}$ {val}{neg ? ')' : ''}</span>
  </div>
);

const Kpi = ({ label, val, color }: any) => (
  <div className="flex justify-between items-end border-b border-white/5 pb-4">
    <span className="text-[10px] font-black uppercase text-slate-500">{label}</span>
    <span className={`text-2xl font-black italic font-mono text-${color}-500`}>{val}</span>
  </div>
);

export default Reports;
