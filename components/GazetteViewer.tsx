import React, { useState, useMemo } from 'react';
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Bird, Scale, ShieldAlert,
  Award, User, Star, TrendingUp, X, EyeOff, Package, Users, Cpu, FileText,
  BarChart3, PieChart, Info, DollarSign, Activity, Target, Newspaper, 
  ChevronRight, MapPin, Truck, Warehouse, TrendingDown,
  Factory, CheckCircle2, ArrowUpCircle, ArrowDownCircle, Settings2
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { Championship, UserRole, CreditRating, Team } from '../types';

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  activeTeam?: Team | null;
  onClose: () => void;
}

type GazetteTab = 'individual' | 'collective_fin' | 'collective_market' | 'macro';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, userRole = 'player', activeTeam, onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('individual');
  const teams = arena.teams || [];
  const isAnonymous = arena.gazeta_mode === 'anonymous' && userRole !== 'tutor' && userRole !== 'admin';
  
  const currencySymbol = arena.currency === 'BRL' ? 'R$' : '$';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[92vh] max-w-7xl w-full relative"
    >
      {/* HEADER DE COMANDO v16.0 */}
      <header className="bg-slate-950 p-6 md:p-8 border-b border-white/5 shrink-0 shadow-xl relative z-10">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(249,115,22,0.3)]">
                  <Newspaper size={28} strokeWidth={2.5} />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Gazette</h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-1 italic">Protocolo de Auditoria: Ciclo 0{round}</p>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden lg:flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest italic">Sincronização Nodal Ativa</span>
               </div>
               <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-full transition-all active:scale-90">
                  <X size={24} />
               </button>
            </div>
         </div>
         
         <nav className="flex flex-wrap gap-2">
            <TabBtn active={activeTab === 'individual'} onClick={() => setActiveTab('individual')} label="Relatório Individual" icon={<User size={14}/>} />
            <TabBtn active={activeTab === 'collective_fin'} onClick={() => setActiveTab('collective_fin')} label="Benchmarking Financeiro" icon={<Landmark size={14}/>} />
            <TabBtn active={activeTab === 'collective_market'} onClick={() => setActiveTab('collective_market')} label="Visão de Mercado" icon={<Globe size={14}/>} />
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Indicadores Macro" icon={<Zap size={14}/>} />
         </nav>
      </header>

      {/* VIEWPORT DE DADOS DE ALTA DENSIDADE */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-950/20 relative">
         <AnimatePresence mode="wait">
            {activeTab === 'individual' && (
               <motion.div key="ind" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                  
                  {/* HEADER INDIVIDUAL PERSONALIZADO */}
                  <div className="p-8 bg-orange-600/5 border border-orange-500/20 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Warehouse size={120}/></div>
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="p-5 bg-orange-600 rounded-2xl text-white shadow-xl"><ShieldAlert size={32}/></div>
                        <div>
                           <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Relatório da Unidade de Operação</span>
                           <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{activeTeam?.name || 'NODE_OPERATOR'}</h3>
                        </div>
                     </div>
                     <div className="text-right relative z-10">
                        <span className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">Status da Planta</span>
                        <span className="text-3xl font-black text-emerald-500 italic font-mono uppercase tracking-tighter">Operacional</span>
                     </div>
                  </div>

                  {/* MATRIZ DE ESTOQUE (INSPIRADO NO PDF) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-8 bg-slate-900/50 p-10 rounded-[4rem] border border-white/5 shadow-2xl">
                        <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic"><Package size={18}/> Audit: Movimentação de Estoque (Unidades)</h3>
                        <div className="overflow-x-auto">
                           <table className="w-full text-xs font-bold text-slate-400 border-separate border-spacing-y-2">
                              <thead className="text-slate-600 border-b border-white/5">
                                 <tr className="text-[9px] font-black uppercase tracking-widest italic">
                                    <th className="pb-4 text-left">DESCRIÇÃO DO ATIVO</th>
                                    <th className="pb-4 text-right">MATÉRIA-PRIMA A</th>
                                    <th className="pb-4 text-right">MATÉRIA-PRIMA B</th>
                                    <th className="pb-4 text-right">PRODUTO ACABADO</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 <tr className="bg-white/5 rounded-xl"><td className="p-4 rounded-l-xl uppercase italic">(=) ESTOQUE INICIAL</td><td className="text-right p-4 text-white font-mono">30.000</td><td className="text-right p-4 text-white font-mono">30.000</td><td className="text-right p-4 text-white font-mono rounded-r-xl">0</td></tr>
                                 <tr className="hover:bg-white/[0.02]"><td className="p-4 uppercase italic">(+) COMPRAS PROGRAMADAS</td><td className="text-right p-4 text-emerald-500 font-mono">30.000</td><td className="text-right p-4 text-emerald-500 font-mono">30.000</td><td className="text-right p-4">--</td></tr>
                                 <tr className="hover:bg-white/[0.02]"><td className="p-4 uppercase italic">(+) COMPRAS ESPECIAIS</td><td className="text-right p-4 text-orange-500 font-mono">0</td><td className="text-right p-4 text-orange-500 font-mono">0</td><td className="text-right p-4">--</td></tr>
                                 <tr className="hover:bg-white/[0.02]"><td className="p-4 uppercase italic">(-) CONSUMO / PRODUÇÃO</td><td className="text-right p-4 text-rose-500 font-mono">29.100</td><td className="text-right p-4 text-rose-500 font-mono">19.400</td><td className="text-right p-4 text-emerald-500 font-mono">9.700</td></tr>
                                 <tr className="hover:bg-white/[0.02]"><td className="p-4 uppercase italic">(-) VENDAS E EXPEDIÇÃO</td><td className="text-right p-4">--</td><td className="text-right p-4">--</td><td className="text-right p-4 text-rose-500 font-mono">9.700</td></tr>
                                 <tr className="bg-orange-600/10 font-black"><td className="p-4 rounded-l-xl text-orange-500 uppercase italic">(=) ESTOQUE FINAL</td><td className="text-right p-4 text-orange-500 font-mono">30.900</td><td className="text-right p-4 text-orange-500 font-mono">40.600</td><td className="text-right p-4 text-orange-500 font-mono rounded-r-xl">0</td></tr>
                              </tbody>
                           </table>
                        </div>
                     </div>

                     {/* INDICADORES AUXILIARES (FINANÇAS/RH) */}
                     <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-xl space-y-6">
                           <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-3 italic"><DollarSign size={18}/> Finanças Ativas</h3>
                           <div className="space-y-4">
                              <StatRow label="Limite Crédito P01" val={`${currencySymbol} 1.155.791`} />
                              <StatRow label="Atrasos Bancários" val={`${currencySymbol} 0,00`} />
                              <StatRow label="Inadimplência Real" val={`${currencySymbol} 6.500`} color="text-rose-500" />
                              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                 <span className="text-[10px] font-black uppercase text-slate-500 italic">Audit Status</span>
                                 <div className="px-4 py-1 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded-lg text-[9px] font-black uppercase">SEM ATRASOS</div>
                              </div>
                           </div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-xl space-y-6">
                           <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-3 italic"><Users size={18}/> Recursos Humanos</h3>
                           <div className="space-y-4">
                              <StatRow label="Corpo Técnico" val="500 Operadores" />
                              <StatRow label="Produtividade" val="97,00%" color="text-emerald-500" />
                              <StatRow label="Nível de Motivação" val="REGULAR" color="text-amber-500" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* GRID REGIONAL - PERFORMANCE GEOPOLÍTICA */}
                  <div className="bg-slate-900/50 p-10 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
                     <div className="flex justify-between items-center mb-10">
                        <div className="space-y-1">
                           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4"><MapPin size={24} className="text-orange-500"/> Performance Regional de Unidade</h3>
                           <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] italic">Análise de Demanda Nodal vs Venda Efetiva do Ciclo</p>
                        </div>
                     </div>
                     <div className="overflow-x-auto custom-scrollbar pb-6">
                        <table className="w-full text-[10px] font-black uppercase tracking-widest text-center border-separate border-spacing-2">
                           <thead>
                              <tr className="text-slate-600">
                                 <th className="bg-slate-950 p-5 rounded-2xl border border-white/5 min-w-[140px]">DATA NODE</th>
                                 {Array.from({ length: 9 }).map((_, i) => (
                                    <th key={i} className="bg-slate-950 p-5 rounded-2xl border border-white/5 text-orange-500 min-w-[100px]">Região 0{i+1}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="font-mono text-xs">
                              <tr className="group">
                                 <td className="bg-white/5 p-5 rounded-2xl text-slate-400 border border-white/5 group-hover:bg-white/10 transition-colors italic">DEMANDA BASE</td>
                                 {Array.from({ length: 8 }).map((_, i) => <td key={i} className="bg-white/5 p-5 rounded-2xl text-white border border-white/5 group-hover:bg-white/10">1.049</td>)}
                                 <td className="bg-white/5 p-5 rounded-2xl text-white border border-white/5 group-hover:bg-white/10">1.574</td>
                              </tr>
                              <tr className="group">
                                 <td className="bg-white/5 p-5 rounded-2xl text-slate-400 border border-white/5 group-hover:bg-white/10 transition-colors italic">VENDA REAL</td>
                                 <td className="bg-white/5 p-5 rounded-2xl text-emerald-500 border border-white/5 group-hover:bg-white/10">1.022</td>
                                 {Array.from({ length: 6 }).map((_, i) => <td key={i} className="bg-white/5 p-5 rounded-2xl text-emerald-500 border border-white/5 group-hover:bg-white/10">1.017</td>)}
                                 <td className="bg-white/5 p-5 rounded-2xl text-emerald-500 border border-white/5 group-hover:bg-white/10 font-black">1.049</td>
                                 <td className="bg-white/5 p-5 rounded-2xl text-emerald-500 border border-white/5 group-hover:bg-white/10 font-black">1.527</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* PARQUE DE MÁQUINAS */}
                  <div className="bg-slate-900/50 p-10 rounded-[4rem] border border-white/5 shadow-2xl space-y-10">
                     <h3 className="text-xl font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-4 italic"><Cpu size={24}/> Auditoria de Ativos de Capital (Máquinas)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MachineCard model="ALFA" qtde={5} age={14.0} icon={<Factory className="text-orange-500"/>} />
                        <MachineCard model="BETA" qtde={0} age={0} icon={<Zap className="text-blue-500"/>} />
                        <MachineCard model="GAMA" qtde={0} age={0} icon={<Cpu className="text-emerald-500"/>} />
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'collective_fin' && (
               <motion.div key="fin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="p-10 bg-slate-900/60 rounded-[4rem] border border-white/10 shadow-2xl flex items-center justify-between relative group">
                     <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform"><BarChart3 size={250} /></div>
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-2xl shadow-indigo-600/30"><BarChart3 size={32} strokeWidth={2.5}/></div>
                        <div>
                           <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Benchmarking Master</h3>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 italic">Comparativo Consolidado de Saúde Patrimonial e Financeira</p>
                        </div>
                     </div>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar bg-slate-900/40 rounded-[4rem] border border-white/10 shadow-inner">
                     <table className="w-full text-left border-collapse border-separate border-spacing-0">
                        <thead className="bg-slate-900 sticky top-0 z-20">
                           <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                              <th className="p-10 border-b border-r border-white/10 min-w-[320px] bg-slate-900 italic">CONTAS CONSOLIDADAS ($)</th>
                              {teams.map((t, i) => (
                                 <th key={t.id} className={`p-10 border-b border-r border-white/10 text-center min-w-[180px] ${i % 2 === 0 ? 'bg-slate-950/20' : 'bg-slate-900'}`}>
                                    <span className="text-orange-500 block mb-2 font-mono text-lg">E0{i+1}</span>
                                    <span className="text-white text-[11px] font-black truncate max-w-[140px] block mx-auto">{isAnonymous ? 'ANON_NODE' : t.name}</span>
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="text-xs font-mono font-bold text-slate-400">
                           <tr className="bg-white/[0.02] font-black text-white uppercase italic hover:bg-white/5 transition-colors">
                              <td className="p-8 border-b border-r border-white/10"><div className="flex items-center gap-3"><ArrowUpCircle size={14} className="text-emerald-500"/> ATIVO TOTAL</div></td>
                              {teams.map(t => <td key={t.id} className="p-8 border-b border-r border-white/10 text-center text-lg">9.176.940</td>)}
                           </tr>
                           <tr className="hover:bg-white/[0.02]"><td className="p-6 pl-16 border-b border-r border-white/10 opacity-50 uppercase">Ativo Circulante</td>{teams.map(t => <td key={t.id} className="p-6 border-b border-r border-white/10 text-center">3.290.340</td>)}</tr>
                           <tr className="hover:bg-white/[0.02]"><td className="p-6 pl-16 border-b border-r border-white/10 opacity-50 uppercase">Ativo Imobilizado (Líquido)</td>{teams.map(t => <td key={t.id} className="p-6 border-b border-r border-white/10 text-center">5.886.600</td>)}</tr>
                           
                           <tr className="bg-white/[0.02] font-black text-white uppercase italic hover:bg-white/5 transition-colors">
                              <td className="p-8 border-b border-r border-white/10 border-t border-white/10"><div className="flex items-center gap-3"><Scale size={14}/> PATRIMÔNIO LÍQUIDO</div></td>
                              {teams.map(t => <td key={t.id} className="p-8 border-b border-r border-white/10 text-center text-lg font-black text-blue-400">5.055.447</td>)}
                           </tr>

                           <tr className="bg-slate-950 font-black text-white uppercase italic text-center"><td className="p-6 border-b border-r border-white/10" colSpan={teams.length + 1}>DEMONSTRATIVO DE RESULTADOS (DRE P00)</td></tr>
                           <tr className="hover:bg-white/[0.02]"><td className="p-8 font-black text-emerald-400 uppercase italic border-b border-r border-white/10"><div className="flex items-center gap-3"><Target size={14}/> RECEITA DE VENDAS</div></td>{teams.map(t => <td key={t.id} className="p-8 border-b border-r border-white/10 text-center text-lg font-black text-emerald-400">3.322.735</td>)}</tr>
                           <tr className="hover:bg-white/[0.02]"><td className="p-6 pl-16 border-b border-r border-white/10 opacity-60">(-) Custo Produção (CPV)</td>{teams.map(t => <td key={t.id} className="p-6 border-b border-r border-white/10 text-center text-rose-500/80">2.278.180</td>)}</tr>
                           <tr className="bg-emerald-600/10 font-black text-emerald-400 italic hover:bg-emerald-600/20 transition-colors">
                              <td className="p-10 border-b border-r border-white/10 text-xl tracking-tighter"><div className="flex items-center gap-3"><CheckCircle2 size={24}/> LUCRO LÍQUIDO DO CICLO</div></td>
                              {teams.map(t => <td key={t.id} className="p-10 border-b border-r border-white/10 text-center text-3xl">73.928</td>)}
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </motion.div>
            )}

            {activeTab === 'collective_market' && (
               <motion.div key="market" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  {/* MARKET SHARE RELATIVO POR REGIÃO */}
                  <div className="p-12 bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-[0.01] rotate-6"><Globe size={280} /></div>
                     <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 flex items-center gap-4 relative z-10">
                        <PieChart className="text-orange-500" size={32} /> Market Share Relativo (%) por Nodo Regional
                     </h3>
                     <div className="overflow-x-auto custom-scrollbar relative z-10">
                        <table className="w-full text-[10px] font-black uppercase text-center border-separate border-spacing-2">
                           <thead className="bg-slate-950 text-slate-600 italic">
                              <tr>
                                 <th className="p-5 text-left rounded-xl border border-white/5">NODO DE MERCADO</th>
                                 {teams.map((_, i) => <th key={i} className="p-5 rounded-xl border border-white/5 text-orange-500">Unidade 0{i+1}</th>)}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 font-mono text-xs">
                              {Array.from({ length: 9 }).map((_, rIdx) => (
                                 <tr key={rIdx} className="hover:bg-white/[0.04] transition-all group">
                                    <td className="p-5 text-left text-slate-500 bg-white/5 rounded-l-2xl border-l border-white/5 group-hover:text-white transition-colors uppercase italic">REGIÃO 0{rIdx+1}</td>
                                    {teams.map((_, tIdx) => (
                                       <td key={tIdx} className="p-5 text-white bg-white/[0.02] border-r border-white/5 last:rounded-r-2xl last:border-r-0">
                                          {(12.45).toFixed(2)}%
                                       </td>
                                    ))}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* PREÇOS PRATICADOS POR REGIÃO */}
                  <div className="p-12 bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 left-0 p-10 opacity-[0.01] -rotate-6 transition-transform group-hover:scale-110"><Target size={280} /></div>
                     <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 flex items-center gap-4 relative z-10">
                        <Target className="text-blue-500" size={32} /> Política de Preços Decidida ($) por Unidade
                     </h3>
                     <div className="overflow-x-auto custom-scrollbar relative z-10">
                        <table className="w-full text-[10px] font-black uppercase text-center border-separate border-spacing-2">
                           <thead className="bg-slate-950 text-slate-600 italic">
                              <tr>
                                 <th className="p-5 text-left rounded-xl border border-white/5">UNIDADE IA</th>
                                 {Array.from({ length: 9 }).map((_, i) => <th key={i} className="p-5 rounded-xl border border-white/5 text-blue-400">R0{i+1}</th>)}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 font-mono text-xs">
                              {teams.map((t, tIdx) => (
                                 <tr key={tIdx} className="hover:bg-white/[0.04] transition-all group">
                                    <td className="p-5 text-left text-orange-500 bg-white/5 rounded-l-2xl border-l border-white/5 group-hover:translate-x-2 transition-transform">E0{tIdx+1}</td>
                                    {Array.from({ length: 9 }).map((_, rIdx) => (
                                       <td key={rIdx} className="p-5 text-white bg-white/[0.02] border-r border-white/5 last:rounded-r-2xl last:border-r-0">340,00</td>
                                    ))}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* MONITORAMENTO BOLSA (EMPIRE SHARES) */}
                  <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10 shadow-2xl">
                     <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-10 text-center italic">Cotação Global Empirion Shares ($)</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                        {teams.map((_, i) => (
                           <div key={i} className="bg-slate-950 p-6 rounded-3xl border border-white/5 text-center space-y-3 hover:border-orange-500/40 transition-all group">
                              <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest group-hover:text-orange-500">UNIDADE 0{i+1}</span>
                              <div className="text-xl font-mono font-black text-white">60,09</div>
                              <div className="flex items-center justify-center gap-1 text-[8px] font-black text-emerald-500">
                                 <TrendingUp size={10}/> +1.2%
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'macro' && (
               <motion.div key="macro" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                  {/* BRIEFING DO ORÁCULO */}
                  <div className="p-12 bg-white/[0.02] border border-white/10 rounded-[4rem] relative overflow-hidden group shadow-2xl">
                     <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform"><Bird size={280} /></div>
                     <h3 className="text-orange-500 font-black text-[11px] uppercase tracking-[0.6em] mb-10 flex items-center gap-5 italic relative z-10">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-[0_0_15px_#f97316]" /> Strategos Intelligence Feed
                     </h3>
                     <div className="text-4xl text-white font-medium italic leading-[1.3] whitespace-pre-wrap max-w-5xl relative z-10 drop-shadow-2xl">
                        {aiNews || "O Oráculo Strategos está processando os dados de mercado. Sincronização em tempo real via rede neural Oracle Master v16.0..."}
                     </div>
                  </div>

                  {/* INDICADORES ECONÔMICOS E FORNECEDORES */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="p-12 bg-slate-900 border border-white/10 rounded-[4.5rem] shadow-2xl space-y-12 group">
                        <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em] flex items-center gap-5 italic border-b border-white/5 pb-8 relative overflow-hidden">
                           <TrendingUp size={20}/> Conjuntura Econômica Global
                           <div className="absolute bottom-0 left-0 h-0.5 bg-blue-400 w-24 group-hover:w-full transition-all duration-700" />
                        </h4>
                        <div className="grid grid-cols-1 gap-8">
                           <MacroVal label="ICE (CRESCIMENTO ECONÔMICO)" val="3,00%" icon={<Activity size={16} className="text-emerald-500"/>} />
                           <MacroVal label="ÍNDICE DE INFLAÇÃO" val="1,00%" icon={<Flame size={16} className="text-rose-500"/>} />
                           <MacroVal label="JUROS BANCÁRIOS (TR)" val="2,00%" icon={<Landmark size={16} className="text-blue-500"/>} />
                           <MacroVal label="JUROS MÉDIOS DE VENDAS" val="1,50%" icon={<DollarSign size={16} className="text-emerald-400"/>} />
                           <MacroVal label="PRODUÇÃO MÉDIA POR OPERADOR" val="20,64 Units" icon={<Users size={16} className="text-indigo-400"/>} />
                        </div>
                     </div>
                     <div className="p-12 bg-slate-900 border border-white/10 rounded-[4.5rem] shadow-2xl space-y-12 group">
                        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.5em] flex items-center gap-5 italic border-b border-white/5 pb-8 relative overflow-hidden">
                           <Package size={20}/> Custos de Fornecedores Oracle
                           <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-400 w-24 group-hover:w-full transition-all duration-700" />
                        </h4>
                        <div className="grid grid-cols-1 gap-8">
                           <MacroVal label="MATÉRIA-PRIMA A (Base)" val={`${currencySymbol} 20,20`} icon={<Package size={16}/>} />
                           <MacroVal label="MATÉRIA-PRIMA B (Base)" val={`${currencySymbol} 40,40`} icon={<Package size={16}/>} />
                           <MacroVal label="LOGÍSTICA E DISTRIBUIÇÃO" val={`${currencySymbol} 50,50`} icon={<Truck size={16}/>} />
                           <MacroVal label="MÁQUINA ALFA (Base Unit.)" val={`${currencySymbol} 505.000,00`} icon={<Cpu size={16}/>} />
                           <MacroVal label="MÁQUINA GAMA (Base Unit.)" val={`${currencySymbol} 3.030.000,00`} icon={<Cpu size={16}/>} />
                           <MacroVal label="SALÁRIO MÉDIO DO SETOR" val={`${currencySymbol} 1.300,00`} icon={<Users size={16}/>} />
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </main>
      
      {/* FOOTER DE GOVERNANÇA */}
      <footer className="p-6 bg-slate-950 border-t border-white/5 flex justify-between items-center opacity-60 shrink-0 relative z-10">
         <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.6em] italic">Build v16.0 Oracle Master • Node 08-STREET-INDUSTRIAL-MASTER</span>
         <div className="flex gap-4 items-center">
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-orange-600/40" />
            </div>
            <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Fidelity SIAGRO-SISERV-SIMCO</span>
         </div>
      </footer>
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 border-2 italic ${active ? 'bg-orange-600 text-white border-orange-400 shadow-xl shadow-orange-600/20' : 'text-slate-500 hover:text-white bg-white/5 border-transparent hover:border-white/10'}`}>
    {icon} {label}
  </button>
);

const StatRow = ({ label, val, color }: any) => (
   <div className="flex justify-between items-center group/row">
      <span className="text-[10px] font-bold text-slate-500 uppercase group-hover/row:text-slate-300 transition-colors italic">{label}</span>
      <span className={`text-sm font-mono font-black ${color || 'text-white'} group-hover/row:scale-110 transition-transform`}>{val}</span>
   </div>
);

const MachineCard = ({ model, qtde, age, icon }: any) => (
   <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] text-center space-y-4 hover:bg-white/10 transition-all group shadow-xl">
      <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mx-auto border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
         {icon}
      </div>
      <div>
         <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{model}</span>
         <div className="text-3xl font-black text-white font-mono leading-none italic">{qtde}</div>
      </div>
      <div className="pt-4 border-t border-white/5">
         <span className="block text-[8px] font-bold text-slate-600 uppercase tracking-tight">Idade Média: <span className="text-slate-400">{age.toFixed(2)}</span></span>
      </div>
   </div>
);

const MacroVal = ({ label, val, icon }: any) => (
   <div className="flex justify-between items-end border-b border-white/5 pb-6 hover:translate-x-2 transition-transform cursor-default group">
      <div className="flex items-center gap-4">
         <div className="p-2 bg-white/5 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-all">{icon || <Settings2 size={12}/>}</div>
         <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-slate-300 transition-colors italic">{label}</span>
      </div>
      <span className="text-2xl font-black text-white italic tracking-tighter drop-shadow-lg">{val}</span>
   </div>
);

const Flame = ({ size, className }: any) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
   </svg>
);

export default GazetteViewer;