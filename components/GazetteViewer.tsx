
import React, { useState, useMemo } from 'react';
import { 
  Newspaper, TrendingUp, Activity, AlertTriangle, 
  Landmark, DollarSign, Cpu, Boxes, ChevronLeft, Globe, Scale,
  BarChart3, PieChart as PieIcon, Briefcase, User, Layers,
  History, Table, Sliders, Zap, Shield, Map as MapIcon,
  Package, Info, TrendingDown, Target, FileText, ArrowUpRight,
  /* Added missing ChevronRight import */
  ChevronRight
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

type GazetteTab = 'macro' | 'suppliers' | 'matrix' | 'demand' | 'unit_report' | 'tutor';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, news, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('macro');
  const macro = arena.market_indicators;
  
  // Matriz de Balanços Públicos - Consolidado de todas as 8 empresas (Desde Round 0)
  const competitorMatrix = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Unidade Industrial 0${i + 1}`,
    asset: 9176940, // Baseado no PDF Coletivo 1
    equity: 5055447,
    revenue: round === 0 ? 3322735 : 3322735 + (Math.random() * 400000 - 200000),
    netProfit: round === 0 ? 73928 : 73928 + (Math.random() * 25000 - 10000),
    liquidity: round === 0 ? 0.74 : 0.74 + (Math.random() * 0.2),
    status: i % 4 === 0 && round > 1 ? 'RJ' : 'NORMAL'
  })), [round]);

  const macroEvolutionOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', sparkline: { enabled: false } },
    colors: ['#f97316', '#3b82f6'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0 } },
    xaxis: { categories: ['P0', 'P1', 'P2'], labels: { style: { colors: '#64748b', fontSize: '9px' } } },
    yaxis: { labels: { style: { colors: '#64748b', fontSize: '9px' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    legend: { labels: { colors: '#94a3b8' }, position: 'top', horizontalAlign: 'right' }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[1000px] relative"
    >
      {/* 1. HEADER SUPREMO - BRANDING & NAV */}
      <header className="bg-slate-950 p-6 border-b border-white/5 space-y-6">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
               <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20"><Newspaper size={24} /></div>
               <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Empirion <span className="text-orange-500">Street</span></h1>
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] font-black text-orange-500 uppercase tracking-widest">INDÚSTRIA v7.0</span>
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Industrial Intelligence Dashboard • Período Atual: 0{round}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full transition-all active:scale-90 border border-white/5"><ChevronLeft size={20} /></button>
         </div>

         {/* NAVEGAÇÃO MULTICAMADA */}
         <nav className="flex gap-1 p-1 bg-slate-900 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro'} icon={<Globe size={13}/>} label="Conjuntura" />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} icon={<Package size={13}/>} label="Fornecedores" />
            <TabBtn active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} icon={<Table size={13}/>} label="Benchmarking Coletivo" />
            <TabBtn active={activeTab === 'demand'} onClick={() => setActiveTab('demand')} icon={<MapIcon size={13}/>} label="Market Heatmap" />
            <TabBtn active={activeTab === 'unit_report'} onClick={() => setActiveTab('unit_report')} icon={<History size={13}/>} label="Dossiê de Unidade" color="emerald" />
            {userRole === 'tutor' && <TabBtn active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<Shield size={13}/>} label="Tutor Control" color="orange" />}
         </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
         <AnimatePresence mode="wait">
            
            {/* AMBIENTE 1: CONJUNTURA (COMMON) */}
            {activeTab === 'macro' && (
              <motion.div key="macro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-8">
                       <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] italic border-l-2 border-orange-500 pl-4">Manchete do Setor</h3>
                       <h2 className="text-6xl font-black text-white italic leading-[0.9] tracking-tighter">
                          {news.split('\n')[0] || "Economia Industrial em Fase de Estabilização"}
                       </h2>
                       <p className="text-xl text-slate-400 leading-relaxed font-medium italic">
                          "{news.substring(news.indexOf('\n') + 1) || "Analistas preveem manutenção da TR em 3% e leve reajuste em insumos logísticos."}"
                       </p>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                          <MacroCard label="Inflação" val="1.0%" sub="+0.2 esperado" icon={<TrendingUp size={14}/>} />
                          <MacroCard label="Taxa TR" val="3.0%" sub="Estável" icon={<Activity size={14}/>} />
                          <MacroCard label="Giro Médio" val="1.55x" sub="Setorial" icon={<Briefcase size={14}/>} />
                          <MacroCard label="ROE Médio" val="8.4%" sub="Anualizado" icon={<Target size={14}/>} />
                       </div>
                    </div>
                    <div className="lg:col-span-5 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.02]"><Activity size={120} /></div>
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><TrendingUp size={12}/> Evolução dos Indicadores de Referência</h4>
                       <div className="h-64">
                          <Chart options={macroEvolutionOptions} series={[{name: 'Inflação', data: [1.0, 1.2, 1.1]}, {name: 'TR', data: [3.0, 3.0, 3.0]}]} type="area" height="100%" />
                       </div>
                       <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl">
                          <p className="text-[9px] font-bold text-orange-400 uppercase leading-relaxed italic">
                             Nota: A taxa TR impacta diretamente o custo de capital de terceiros e a rentabilidade de aplicações.
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* AMBIENTE 2: FORNECEDORES (COMMON) */}
            {activeTab === 'suppliers' && (
              <motion.div key="suppliers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-center gap-4">
                    <Zap size={20} className="text-blue-400" />
                    <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest leading-relaxed">
                       A tabela de preços dos fornecedores é atualizada em cada ciclo. Reajustes médios de 2% em MP-A e MP-B detectados para este período.
                    </p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TableSection title="Insumos & Operações" badge="Snapshot P0" items={[
                       { label: 'Matéria-Prima A (MP-A)', old: '20,20', curr: '20,60', var: '+2.0%' },
                       { label: 'Matéria-Prima B (MP-B)', old: '40,40', curr: '41,20', var: '+2.0%' },
                       { label: 'Distribuição Unitária', old: '50,50', curr: '52,00', var: '+3.0%' },
                       { label: 'Marketing de Massa', old: '10.200', curr: '10.500', var: '+2.9%' }
                    ]} />
                    <TableSection title="Ativos de Capital (Máquinas)" badge="Sindicato Industrial" items={[
                       { label: 'Máquina ALFA', old: '505.000', curr: '515.100', var: '+2.0%' },
                       { label: 'Máquina BETA', old: '1.515.000', curr: '1.545.300', var: '+2.0%' },
                       { label: 'Máquina GAMA', old: '3.030.000', curr: '3.090.600', var: '+2.0%' },
                       { label: 'Depreciação Média', old: '2.5%', curr: '2.5%', var: '0.0%' }
                    ]} />
                 </div>
              </motion.div>
            )}

            {/* AMBIENTE 3: BENCHMARKING COLETIVO (PUBLIC) */}
            {activeTab === 'matrix' && (
              <motion.div key="matrix" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Matriz de Concorrência Industrial</h3>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Snapshot Auditado via Oracle • Round 0{round}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl shadow-xl">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-black uppercase text-emerald-400">Dados Sincronizados</span>
                    </div>
                 </div>

                 <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                       <thead className="bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                          <tr>
                             <th className="p-8">Unidade Fabril</th>
                             <th className="p-8">Status</th>
                             <th className="p-8">Ativo Total ($)</th>
                             <th className="p-8">Receita (DRE)</th>
                             <th className="p-8">Lucro Líquido</th>
                             <th className="p-8">Liquidez</th>
                             <th className="p-8 text-right">Ações</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {competitorMatrix.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.03] transition-all group">
                               <td className="p-8 font-black text-white italic uppercase tracking-tight group-hover:text-orange-500 transition-colors">{u.name}</td>
                               <td className="p-8">
                                  <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase border ${u.status === 'RJ' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>{u.status}</span>
                               </td>
                               <td className="p-8 font-mono text-slate-300 font-bold">{u.asset.toLocaleString()}</td>
                               <td className="p-8 font-mono text-slate-300">$ {u.revenue.toLocaleString()}</td>
                               <td className="p-8 font-mono text-emerald-400 font-black italic">$ {u.netProfit.toLocaleString()}</td>
                               <td className="p-8">
                                  <div className="flex items-center gap-2">
                                     <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${u.liquidity < 0.8 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(u.liquidity*50, 100)}%` }} />
                                     </div>
                                     <span className={`text-[10px] font-black font-mono ${u.liquidity < 0.8 ? 'text-rose-400' : 'text-slate-400'}`}>{u.liquidity.toFixed(2)}x</span>
                                  </div>
                               </td>
                               <td className="p-8 text-right"><button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><BarChart3 size={14}/></button></td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {/* AMBIENTE 4: HEATMAP (COMMON) */}
            {activeTab === 'demand' && (
              <motion.div key="demand" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
                       <div className="absolute -top-10 -right-10 p-20 opacity-5"><MapIcon size={240} /></div>
                       <h4 className="text-xs font-black uppercase text-orange-500 italic tracking-widest flex items-center gap-2"><MapIcon size={16}/> Distribuição Geográfica de Demanda (P0)</h4>
                       <div className="grid grid-cols-3 gap-3">
                          {[1,2,3,4,5,6,7,8,9].map(r => (
                            <div key={r} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-4 border transition-all ${r === 9 ? 'bg-orange-600 border-white shadow-xl scale-105' : 'bg-white/5 border-white/5 hover:border-orange-500/30'}`}>
                               <span className="text-[10px] font-black uppercase opacity-60">Reg {r}</span>
                               <span className="text-2xl font-black">{r === 9 ? '12.592' : '8.392'}</span>
                               <span className="text-[8px] font-bold uppercase opacity-40">Potencial un.</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-12 bg-slate-950/40 rounded-[3rem] border border-white/10 space-y-10 flex flex-col justify-center shadow-inner">
                       <div className="space-y-4">
                          <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Market Pulse Insight</h3>
                          <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
                             "A Região 09 concentra o maior volume de demanda reprimida. Estrategistas de elite focam nesta região para otimizar custos logísticos de distribuição em massa."
                          </p>
                       </div>
                       <div className="grid grid-cols-1 gap-4">
                          <InsightPill icon={<Activity size={16}/>} label="Elasticidade Regional: Alta (0.85)" />
                          <InsightPill icon={<Zap size={16}/>} label="Market Share Ótimo: 12.5%" />
                          <InsightPill icon={<Info size={16}/>} label="Custo Logístico Médio: $ 52.00/un" />
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* AMBIENTE 5: MEU HISTÓRICO / DOSSIÊ (TEAM) */}
            {activeTab === 'unit_report' && (
              <motion.div key="unit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <HistorySummaryCard title="Balanço Inicial (Round 0)" icon={<Package />} lines={[
                       { label: 'ATIVO TOTAL', val: '9.176.940', b: true },
                       { label: 'Disponibilidades', val: '840.200' },
                       { label: 'Estoques MP', val: '1.466.605' },
                       { label: 'Patrimônio Líquido', val: '5.055.447', b: true }
                    ]} />
                    <HistorySummaryCard title="DRE Consolidado" icon={<DollarSign />} lines={[
                       { label: 'Receita Bruta', val: '3.322.735', b: true },
                       { label: 'CPV Industrial', val: '2.278.180' },
                       { label: 'LUCRO BRUTO', val: '1.044.555', b: true },
                       { label: 'Lucro Líquido', val: '73.928', b: true, highlight: true }
                    ]} />
                    <HistorySummaryCard title="Estrutura de RH" icon={<User />} lines={[
                       { label: 'Mão de Obra Direta', val: '210' },
                       { label: 'Salário Base Setor', val: '1.313', b: true },
                       { label: 'Produtividade/Homem', val: '20,64' },
                       { label: 'Motivação', val: 'Média/Alta', b: true }
                    ]} />
                 </div>
                 <div className="p-12 bg-indigo-600/10 border border-indigo-500/20 rounded-[4rem] space-y-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5"><Zap size={140} /></div>
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 animate-pulse"><Zap size={24}/></div>
                       <h4 className="text-2xl font-black uppercase text-indigo-400 italic tracking-tighter">Strategos Private Advisor</h4>
                    </div>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed italic max-w-4xl">
                       "Sua Unidade industrial inicia com uma liquidez de 0.74x. Para o Período 1, a prioridade absoluta deve ser o controle do giro de estoque de MP-B, que representa 57% do custo de suprimentos acumulado no Round 0."
                    </p>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white bg-indigo-600 px-6 py-3 rounded-full hover:bg-white hover:text-indigo-950 transition-all shadow-xl">
                       Ver Auditoria Completa <ChevronRight size={14} />
                    </button>
                 </div>
              </motion.div>
            )}

            {/* AMBIENTE 6: TUTOR (ADMIN) */}
            {activeTab === 'tutor' && userRole === 'tutor' && (
              <motion.div key="tutor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 space-y-10 shadow-2xl">
                       <h4 className="text-xl font-black uppercase text-orange-500 italic flex items-center gap-3"><Sliders size={20}/> Saltiness Macro v7.0</h4>
                       <div className="space-y-12">
                          <TutorRange label="Fator de Inflação Próx. Round" val="1.2%" />
                          <TutorRange label="Volatilidade Cambial" val="Alta (0.15)" />
                          <TutorRange label="Escassez de Insumos" val="Moderada" />
                       </div>
                    </div>
                    <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 space-y-8 shadow-2xl relative">
                       <h4 className="text-xl font-black uppercase text-blue-500 italic flex items-center gap-3"><Newspaper size={20}/> Headline IA Generator</h4>
                       <p className="text-xs text-slate-400 font-medium italic leading-relaxed">Insira um tópico e deixe o Gemini 3 Pro criar a narrativa da Gazeta para as equipes:</p>
                       <textarea className="w-full h-40 bg-slate-950 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner" placeholder="Ex: Greve geral afeta logística na Região 09..."></textarea>
                       <button className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-white hover:text-orange-600 transition-all">Sincronizar Manchete com Arena</button>
                    </div>
                 </div>
              </motion.div>
            )}

         </AnimatePresence>
      </main>

      <footer className="p-5 bg-slate-950 border-t border-white/5 flex justify-between px-12 items-center">
         <div className="flex items-center gap-3">
            <div className="p-1.5 bg-orange-600 rounded text-white shadow-lg"><Activity size={10}/></div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] italic">EMPIRE_STREET_ORACLE_V7.0_GOLD</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Link Sincronizado</span>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_#f97316] animate-ping" />
         </div>
      </footer>
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, label, icon, color = 'blue' }: any) => (
  <button onClick={onClick} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${active ? (color === 'orange' ? 'bg-orange-600 text-white shadow-lg' : color === 'emerald' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon} {label}
  </button>
);

const MacroCard = ({ label, val, sub, icon }: any) => (
  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-2 hover:bg-white/10 transition-all group border-b-2 hover:border-b-orange-500 shadow-xl">
     <div className="flex items-center gap-2 text-slate-500 group-hover:text-orange-500 transition-colors">
        {icon}
        <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
     </div>
     <div className="flex flex-col">
        <span className="text-2xl font-black text-white italic font-mono leading-none">{val}</span>
        <span className="text-[7px] font-black text-slate-600 uppercase mt-1 tracking-tighter">{sub}</span>
     </div>
  </div>
);

const TableSection = ({ title, badge, items }: any) => (
  <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl group hover:border-white/10 transition-all">
     <div className="p-8 bg-slate-950 border-b border-white/5 flex items-center justify-between">
        <div className="space-y-1">
           <h4 className="text-sm font-black uppercase text-white tracking-widest italic">{title}</h4>
           <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">{badge}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl text-slate-500 group-hover:text-orange-500 transition-colors"><Table size={18}/></div>
     </div>
     <table className="w-full text-left text-[11px]">
        <thead className="text-slate-500 font-black uppercase tracking-widest bg-slate-950/50 border-b border-white/5">
           <tr><th className="p-5">Ativo/Insumo</th><th className="p-5">Anterior</th><th className="p-5 text-orange-500">Período 0{0}</th><th className="p-5 text-right">Var %</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-300">
           {items.map((it: any, i: number) => (
             <tr key={i} className="hover:bg-white/[0.02] transition-colors group/row">
                <td className="p-5 font-black uppercase italic tracking-tighter opacity-80 group-hover/row:opacity-100 group-hover/row:text-white">{it.label}</td>
                <td className="p-5 font-mono text-slate-500">$ {it.old}</td>
                <td className="p-5 font-mono text-white font-bold">$ {it.curr}</td>
                <td className="p-5 text-right font-black text-[10px] text-orange-500 italic">{it.var}</td>
             </tr>
           ))}
        </tbody>
     </table>
  </div>
);

const InsightPill = ({ icon, label }: any) => (
  <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
     <div className="p-2 bg-white/5 text-orange-500 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
  </div>
);

const HistorySummaryCard = ({ title, icon, lines }: any) => (
  <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">{React.cloneElement(icon, { size: 100 })}</div>
     <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-500/20">{React.cloneElement(icon, { size: 20 })}</div>
        <h4 className="text-xl font-black uppercase text-white italic tracking-tighter">{title}</h4>
     </div>
     <div className="space-y-4">
        {lines.map((ln: any, i: number) => (
          <div key={i} className="flex justify-between items-center py-1">
             <span className={`text-[10px] uppercase tracking-widest ${ln.b ? 'font-black text-slate-300' : 'text-slate-500'}`}>{ln.label}</span>
             <span className={`font-mono text-sm ${ln.highlight ? 'text-emerald-400 font-black italic' : 'text-slate-200 font-bold'}`}>$ {ln.val}</span>
          </div>
        ))}
     </div>
  </div>
);

const TutorRange = ({ label, val }: any) => (
  <div className="space-y-4 group">
     <div className="flex justify-between items-center text-[10px] font-black uppercase italic">
        <span className="text-slate-400 group-hover:text-white transition-colors">{label}</span>
        <span className="text-orange-500">{val}</span>
     </div>
     <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_15px_#f97316]" style={{ width: '65%' }} />
     </div>
  </div>
);

export default GazetteViewer;
