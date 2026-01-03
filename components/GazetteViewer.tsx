
import React, { useState, useMemo } from 'react';
import { 
  Newspaper, TrendingUp, Activity, AlertTriangle, 
  Landmark, DollarSign, Cpu, Boxes, ChevronLeft, Globe, Scale,
  BarChart3, PieChart as PieIcon, Briefcase, User, Layers,
  History, Table, Sliders, Zap, Shield, Map as MapIcon,
  Package, Info, TrendingDown, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship, UserRole } from '../types';
import Chart from 'react-apexcharts';

interface GazetteViewerProps {
  arena: Championship;
  news: string;
  round: number;
  userRole?: UserRole;
  onClose: () => void;
}

type GazetteTab = 'macro' | 'suppliers' | 'matrix' | 'demand' | 'history' | 'tutor';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, news, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('macro');
  const macro = arena.market_indicators;
  
  // Matriz de Balanços Públicos (Baseado no PDF Coletivo 1 - Round 0)
  const competitorMatrix = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Unidade Industrial 0${i + 1}`,
    asset: 9176940,
    equity: 5055447,
    revenue: round === 0 ? 3322735 : 3322735 + (Math.random() * 200000 - 100000),
    netProfit: round === 0 ? 73928 : 73928 + (Math.random() * 15000),
    status: i % 4 === 0 && round > 1 ? 'RJ' : 'NORMAL'
  })), [round]);

  // Gráfico de Evolução Macro
  const macroEvolutionOptions: any = {
    chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
    colors: ['#f97316', '#3b82f6'],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: ['P0', 'P1', 'P2'], labels: { style: { colors: '#64748b' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    legend: { labels: { colors: '#94a3b8' } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[1000px] relative"
    >
      {/* TOP HEADER */}
      <header className="bg-slate-950 p-6 border-b border-white/5 flex flex-col gap-6">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20"><Newspaper size={24} /></div>
               <div>
                  <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Empirion <span className="text-orange-500">Street</span></h1>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Industrial Intelligence Terminal • Ciclo 0{round}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full transition-all active:scale-90"><ChevronLeft size={20} /></button>
         </div>

         {/* NAVEGAÇÃO ESTRUTURADA */}
         <nav className="flex gap-1 p-1 bg-slate-900 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} icon={<Globe size={13}/>} label="Conjuntura" />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} icon={<Package size={13}/>} label="Fornecedores" />
            <TabBtn active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} icon={<Table size={13}/>} label="Matriz Coletiva" />
            <TabBtn active={activeTab === 'demand'} onClick={() => setActiveTab('demand')} icon={<MapIcon size={13}/>} label="Demanda Regional" />
            <TabBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={13}/>} label="Meu Histórico" />
            {userRole === 'tutor' && <TabBtn active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<Shield size={13}/>} label="Tutor Master" color="orange" />}
         </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
         <AnimatePresence mode="wait">
            
            {/* 1. CONJUNTURA ECONÔMICA */}
            {activeTab === 'macro' && (
              <motion.div key="macro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-8">
                       <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] italic border-l-2 border-orange-500 pl-4">Boletim Macroeconômico</h3>
                       <h2 className="text-5xl font-black text-white italic leading-none tracking-tight">Inflação e TR em Rota de Estabilidade</h2>
                       <p className="text-lg text-slate-400 leading-relaxed font-medium italic">
                          "O cenário industrial atual aponta para uma manutenção da taxa TR em 3%, permitindo um planejamento de CapEx mais agressivo para unidades com liquidez acima de 1.2x."
                       </p>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <MacroCard label="Inflação Período" val={`${macro.inflationRate}%`} icon={<TrendingUp size={14}/>} />
                          <MacroCard label="Taxa TR Mensal" val={`${macro.interestRateTR}%`} icon={<Activity size={14}/>} />
                          <MacroCard label="Crescimento Setor" val={`${macro.growthRate}%`} icon={<Target size={14}/>} />
                       </div>
                    </div>
                    <div className="lg:col-span-5 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-6">
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tendência de Juros vs Inflação</h4>
                       <div className="h-64">
                          <Chart options={macroEvolutionOptions} series={[{name: 'Inflação', data: [1.0, 1.2, macro.inflationRate]}, {name: 'TR', data: [3.0, 3.0, macro.interestRateTR]}]} type="line" height="100%" />
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* 2. TABELA DE FORNECEDORES & REAJUSTES */}
            {activeTab === 'suppliers' && (
              <motion.div key="suppliers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-center gap-4">
                    <Zap size={20} className="text-blue-400" />
                    <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest">Os preços de Matéria-Prima e Máquinas são fixados pelo Tutor e sofrem reajustes automáticos conforme o Ciclo.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden">
                       <div className="p-6 bg-slate-950 border-b border-white/5 flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-white tracking-widest italic">Insumos & Logística</h4>
                          <span className="text-[8px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded">Válido para P0{round}</span>
                       </div>
                       <table className="w-full text-left text-[11px]">
                          <thead className="text-slate-500 font-black uppercase tracking-widest bg-slate-950/50">
                             <tr><th className="p-4">Item</th><th className="p-4">Preço Anterior</th><th className="p-4 text-orange-500">Preço Atual</th><th className="p-4 text-right">Var %</th></tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300">
                             <TableRow label="Matéria-Prima A (MP-A)" old="20,20" curr={macro.providerPrices.mpA.toFixed(2)} var="+2.0%" />
                             <TableRow label="Matéria-Prima B (MP-B)" old="40,40" curr={macro.providerPrices.mpB.toFixed(2)} var="+2.0%" />
                             <TableRow label="Custo Distribuição" old="50,50" curr={macro.distributionCostUnit.toFixed(2)} var="+3.0%" />
                             <TableRow label="Salário Médio" old="1.313,00" curr={macro.sectorAvgSalary.toFixed(2)} var="0.0%" />
                          </tbody>
                       </table>
                    </div>
                    <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden">
                       <div className="p-6 bg-slate-950 border-b border-white/5">
                          <h4 className="text-xs font-black uppercase text-white tracking-widest italic">Ativos de Capital (CapEx)</h4>
                       </div>
                       <table className="w-full text-left text-[11px]">
                          <thead className="text-slate-500 font-black uppercase tracking-widest bg-slate-950/50">
                             <tr><th className="p-4">Máquina</th><th className="p-4">Valor Aquisição</th><th className="p-4">Produtividade</th><th className="p-4 text-right">Manutenção</th></tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-300">
                             <TableRow label="Máquina ALFA" old="505.000" curr={macro.machineryValues.alfa.toLocaleString()} var="12.000 un/p" />
                             <TableRow label="Máquina BETA" old="1.515.000" curr={macro.machineryValues.beta.toLocaleString()} var="40.000 un/p" />
                             <TableRow label="Máquina GAMA" old="3.030.000" curr={macro.machineryValues.gama.toLocaleString()} var="90.000 un/p" />
                          </tbody>
                       </table>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* 3. MATRIZ COLETIVA (TODOS VEEM TODOS) */}
            {activeTab === 'matrix' && (
              <motion.div key="matrix" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Benchmarking Industrial (Snapshot P0{round})</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-black uppercase text-slate-400">Dados Auditados via Oracle</span>
                    </div>
                 </div>
                 <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-xs">
                       <thead className="bg-slate-950 text-slate-500 font-black uppercase tracking-[0.2em] border-b border-white/5">
                          <tr>
                             <th className="p-6">Unidade</th>
                             <th className="p-6">Status Legal</th>
                             <th className="p-6">Ativo Total ($)</th>
                             <th className="p-6">Patrimônio Líquido</th>
                             <th className="p-6">Lucro Líquido</th>
                             <th className="p-6 text-right">Ações</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {competitorMatrix.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.03] transition-all group">
                               <td className="p-6 font-black text-white italic uppercase">{u.name}</td>
                               <td className="p-6">
                                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.status === 'RJ' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{u.status}</span>
                               </td>
                               <td className="p-6 font-mono text-slate-300">{u.asset.toLocaleString()}</td>
                               <td className="p-6 font-mono text-slate-300">{u.equity.toLocaleString()}</td>
                               <td className="p-6 font-mono text-emerald-400 font-bold">$ {u.netProfit.toLocaleString()}</td>
                               <td className="p-6 text-right"><button className="text-slate-600 hover:text-white"><Activity size={14}/></button></td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {/* 4. DEMANDA E VENDA REGIONAL (DADOS DO PDF COLETIVO 2) */}
            {activeTab === 'demand' && (
              <motion.div key="demand" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-6">
                       <h4 className="text-xs font-black uppercase text-orange-500 italic">Mapa de Calor Regional (P00)</h4>
                       <div className="grid grid-cols-3 gap-2">
                          {[1,2,3,4,5,6,7,8,9].map(r => (
                            <div key={r} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-4 border transition-all ${r === 9 ? 'bg-orange-600 border-white' : 'bg-white/5 border-white/5 hover:border-orange-500/30'}`}>
                               <span className="text-[10px] font-black uppercase opacity-60">Reg {r}</span>
                               <span className="text-xl font-black">{r === 9 ? '12.592' : '8.392'}</span>
                               <span className="text-[8px] font-bold uppercase opacity-40">Demanda</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-white/5 space-y-8 flex flex-col justify-center">
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Inteligência de Mercado</h3>
                       <p className="text-sm text-slate-400 leading-relaxed font-medium">A Região 09 apresenta uma demanda extraordinária de 12.592 unidades, representando 50% mais volume que as demais. Unidades com logística otimizada e preço abaixo de $ 380 dominarão o Share local.</p>
                       <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex items-center gap-4">
                          <Info size={24} className="text-orange-500" />
                          <p className="text-[10px] font-black uppercase text-orange-400 leading-tight">Sugestão: Priorize marketing na Região 09 para capturar o excedente de demanda.</p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

         </AnimatePresence>
      </main>

      <footer className="p-4 bg-slate-950 border-t border-white/5 flex justify-between px-10">
         <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">BUILD_INDUSTRIAL_MASTER_V7.0</p>
         <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest italic animate-pulse">Node 08 Sincronizado</p>
      </footer>
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, label, icon, color = 'blue' }: any) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${active ? (color === 'orange' ? 'bg-orange-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon} {label}
  </button>
);

const MacroCard = ({ label, val, icon }: any) => (
  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-2 hover:bg-white/10 transition-all group">
     <div className="flex items-center gap-2 text-slate-500 group-hover:text-orange-500 transition-colors">
        {icon}
        <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
     </div>
     <div className="text-2xl font-black text-white italic font-mono">{val}</div>
  </div>
);

const TableRow = ({ label, old, curr, var: variance }: any) => (
  <tr className="hover:bg-white/[0.02] transition-colors group">
     <td className="p-4 font-black uppercase italic tracking-tighter opacity-80 group-hover:opacity-100 group-hover:text-white transition-all">{label}</td>
     <td className="p-4 font-mono text-slate-500">$ {old}</td>
     <td className="p-4 font-mono text-white font-bold">$ {curr}</td>
     <td className="p-4 text-right font-black text-[10px] text-orange-500 uppercase italic">{variance}</td>
  </tr>
);

export default GazetteViewer;
