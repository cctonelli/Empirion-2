
import React, { useState, useMemo } from 'react';
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Bird, Scale, ShieldAlert,
  Award, User, Star, TrendingUp, X, EyeOff, Package, Users, Cpu, FileText,
  BarChart3, PieChart, Info, DollarSign, Activity, Target, Newspaper, 
  ChevronRight, MapPin, Truck, Warehouse, TrendingDown,
  Factory, CheckCircle2, ArrowUpCircle, ArrowDownCircle, Settings2, Flame,
  Briefcase, BarChart, ShoppingCart, Coins, Sparkles, Monitor, Percent, AlertOctagon
} from 'lucide-react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { Championship, UserRole, CreditRating, Team, CurrencyType, MachineModel } from '../types';

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
  
  // Sincroniza os indicadores com base no Round Auditado
  const currentMacro = useMemo(() => {
    return { ...arena.market_indicators, ...(arena.round_rules?.[round] || {}) };
  }, [arena, round]);

  /**
   * ORACLE COST ENGINE v16.7 - CÁLCULO CUMULATIVO
   */
  const supplierCosts = useMemo(() => {
    const getAdjusted = (base: number, adjustKey: string) => {
      let currentVal = base;
      for (let r = 0; r <= round; r++) {
        const roundRate = arena.round_rules?.[r]?.[adjustKey] ?? arena.market_indicators[adjustKey] ?? 0;
        currentVal *= (1 + roundRate / 100);
      }
      return currentVal;
    };

    const salaries = teams.map(t => t.kpis?.last_decision?.hr?.salary || arena.market_indicators.hr_base.salary);
    const avgSalary = salaries.reduce((a, b) => a + b, 0) / Math.max(teams.length, 1);

    return {
      mp_a: getAdjusted(arena.market_indicators.prices.mp_a, 'raw_material_a_adjust'),
      mp_b: getAdjusted(arena.market_indicators.prices.mp_b, 'raw_material_b_adjust'),
      distribution: getAdjusted(arena.market_indicators.prices.distribution_unit, 'distribution_cost_adjust'),
      marketing: getAdjusted(arena.market_indicators.prices.marketing_campaign, 'marketing_campaign_adjust'),
      alfa: getAdjusted(arena.market_indicators.machinery_values.alfa, 'machine_alpha_price_adjust'),
      beta: getAdjusted(arena.market_indicators.machinery_values.beta, 'machine_beta_price_adjust'),
      gama: getAdjusted(arena.market_indicators.machinery_values.gama, 'machine_gamma_price_adjust'),
      avg_salary: avgSalary
    };
  }, [arena, round, teams]);

  const geopoliticalStats = useMemo(() => {
    const regionsCount = arena.regions_count || 1;
    const demandVar = (currentMacro.demand_variation || 0) / 100;
    const iceFactor = 1 + ((currentMacro.ice || 0) / 100);
    const teamsCount = Math.max(arena.teams?.length || 1, 1);
    const globalBaseDemand = (10000 * teamsCount) * iceFactor * (1 + demandVar);
    
    return Array.from({ length: regionsCount }).map((_, i) => {
      const config = arena.region_configs?.[i];
      const weight = (config?.demand_weight || (100 / regionsCount)) / 100;
      const regionalDemand = globalBaseDemand * weight;
      const regionalMarketShare = 1 / teamsCount;
      return {
        id: i + 1,
        name: arena.region_names?.[i] || `Nodo Regional 0${i + 1}`,
        demand: regionalDemand,
        sales: (regionalDemand * regionalMarketShare) * 0.9742
      };
    });
  }, [arena, round, currentMacro]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-[#020617] border border-white/10 rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[90vh] max-w-[1400px] w-full relative"
    >
      <header className="bg-slate-950 px-12 py-8 border-b border-white/5 shrink-0 shadow-2xl relative z-10 flex items-center justify-between">
         <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_50px_rgba(249,115,22,0.4)] border border-orange-400/30">
               <Newspaper size={32} strokeWidth={2.5} />
            </div>
            <div>
               <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Gazette</h1>
               <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Auditoria Master: Ciclo 0{round}</span>
                  <div className="h-3 w-px bg-white/10" />
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                     <Monitor size={12} className="text-slate-500" />
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Optimized for Ultra-Wide Desktop</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <nav className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
               <TabBtn active={activeTab === 'individual'} onClick={() => setActiveTab('individual')} label="Performance Unidade" icon={<User size={14}/>} />
               <TabBtn active={activeTab === 'collective_fin'} onClick={() => setActiveTab('collective_fin')} label="Mercado Financeiro" icon={<Landmark size={14}/>} />
               <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Conjuntura Oracle" icon={<Zap size={14}/>} />
            </nav>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-2xl transition-all active:scale-90 border border-white/10"><X size={24} /></button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950/30 relative">
         <AnimatePresence mode="wait">
            {activeTab === 'individual' && (
               <motion.div key="ind" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                     <div className="lg:col-span-8 p-10 bg-orange-600/5 border border-orange-500/20 rounded-[4rem] flex justify-between items-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform"><ShieldAlert size={200}/></div>
                        <div className="flex items-center gap-8 relative z-10">
                           <div className="p-6 bg-orange-600 rounded-[2rem] text-white shadow-xl"><ShieldAlert size={40}/></div>
                           <div>
                              <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em]">Relatório Auditado de Unidade</span>
                              <h3 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none mt-2">{activeTeam?.name || 'NODE_ALPHA'}</h3>
                           </div>
                        </div>
                        <div className="text-right relative z-10">
                           <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Oracle Score</span>
                           <span className="text-6xl font-black text-white italic font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">AAA</span>
                        </div>
                     </div>
                     <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col justify-center text-center space-y-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Market Sentiment</span>
                        <div className="text-4xl font-black text-emerald-500 uppercase italic">Favorável</div>
                        <p className="text-[11px] text-slate-400 font-bold italic leading-relaxed">Sua unidade apresenta resiliência operacional superior à média do cluster.</p>
                     </div>
                  </div>

                  <div className="bg-slate-900/80 p-12 rounded-[5rem] border border-white/5 shadow-3xl relative overflow-hidden">
                     <div className="flex justify-between items-end mb-12">
                        <div className="space-y-2">
                           <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-6"><MapPin size={32} className="text-orange-500"/> Performance Geopolítica Ativa</h3>
                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.6em] italic">Análise de Fluxo Nodal v16.7 • Cluster Node 08</p>
                        </div>
                     </div>
                     <div className="matrix-container shadow-inner border border-white/10 bg-slate-950/60 p-2">
                        <table className="w-full text-[11px] font-black uppercase tracking-[0.15em] text-center border-separate border-spacing-4">
                           <thead>
                              <tr className="text-slate-600">
                                 <th className="bg-slate-900 p-6 rounded-3xl border border-white/5 min-w-[200px] text-left italic">METRIC_NODE</th>
                                 {geopoliticalStats.map((reg) => (
                                    <th key={reg.id} className="bg-slate-900 p-6 rounded-3xl border border-white/5 text-orange-500 min-w-[140px] truncate">{reg.name}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="font-mono text-sm text-white italic">
                              <tr className="group hover:bg-white/[0.02] transition-colors">
                                 <td className="bg-white/5 p-6 rounded-3xl text-slate-400 border border-white/5 text-left font-black">DEMANDA TOTAL</td>
                                 {geopoliticalStats.map((reg) => (
                                    <td key={reg.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 text-slate-300">{Math.round(reg.demand).toLocaleString()}</td>
                                 ))}
                              </tr>
                              <tr className="group hover:bg-white/[0.04] transition-colors">
                                 <td className="bg-white/5 p-6 rounded-3xl text-orange-500 border border-white/5 text-left font-black">VENDA REAL UNIDADE</td>
                                 {geopoliticalStats.map((reg) => (
                                    <td key={reg.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 text-emerald-500 font-black text-lg drop-shadow-sm">{Math.round(reg.sales).toLocaleString()}</td>
                                 ))}
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'macro' && (
               <motion.div key="macro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                     <div className="lg:col-span-7 bg-slate-900/60 p-12 rounded-[5rem] border border-white/10 shadow-3xl relative overflow-hidden group">
                        <div className="absolute -top-10 -left-10 p-10 opacity-[0.02] -rotate-12"><Coins size={300}/></div>
                        <div className="flex items-center gap-6 mb-12 relative z-10">
                           <div className="p-5 bg-orange-600 rounded-3xl text-white shadow-xl"><Coins size={32} strokeWidth={2.5}/></div>
                           <div>
                              <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Custos de Fornecedores Oracle</h3>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Reajuste Cumulativo P00 Auditado</p>
                           </div>
                        </div>
                        <div className="space-y-5 relative z-10 pr-4">
                           <CostRow label="Matéria-Prima A (Insumo Base)" val={supplierCosts.mp_a} />
                           <CostRow label="Matéria-Prima B (Componente Alpha)" val={supplierCosts.mp_b} />
                           <CostRow label="Distribuição Nodal Unitária" val={supplierCosts.distribution} />
                           <CostRow label="Campanha Marketing (Protocolo Base)" val={supplierCosts.marketing} />
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                              <CompactCostBox label="MÁQUINA ALFA" val={supplierCosts.alfa} color="text-blue-400" />
                              <CompactCostBox label="MÁQUINA BETA" val={supplierCosts.beta} color="text-indigo-400" />
                              <CompactCostBox label="MÁQUINA GAMA" val={supplierCosts.gama} color="text-orange-400" />
                           </div>
                           <div className="mt-10 pt-10 border-t border-white/10 flex justify-between items-center group/sal">
                              <div>
                                 <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] italic">Salário Médio do Setor</span>
                                 <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Média Ponderada das Equipes Ativas</p>
                              </div>
                              <span className="text-5xl font-black text-white font-mono italic group-hover/sal:text-blue-400 transition-all duration-500">$ {supplierCosts.avg_salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-5 space-y-10">
                        <div className="bg-blue-600/10 border border-blue-500/20 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                           <Sparkles className="absolute -top-16 -right-16 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000" size={250} />
                           <div className="relative z-10 space-y-6">
                              <h4 className="text-2xl font-black text-blue-400 uppercase italic flex items-center gap-4 italic"><Info size={24}/> Oracle Intelligence Hub</h4>
                              <p className="text-lg text-blue-100 font-medium leading-relaxed italic border-l-2 border-blue-500/30 pl-8">
                                "Atenção Operador: Os indicadores auditados refletem a realidade do PERÍODO 0{round}. Monitore as taxas de câmbio para otimizar suas vendas transfronteiriças."
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                           {/* INDICADORES ECONÔMICOS COMPLETOS (EXCETO VAR. DEMANDA) */}
                           <MacroSummaryBox label="Crescimento Econômico (ICE)" val={`${currentMacro.ice}%`} icon={<Activity size={20} className="text-emerald-500"/>} />
                           <MacroSummaryBox label="Inflação Período" val={`${currentMacro.inflation_rate}%`} icon={<Flame size={20} className="text-rose-500"/>} />
                           <MacroSummaryBox label="Juros Bancários (TR)" val={`${currentMacro.interest_rate_tr}%`} icon={<Landmark size={20} className="text-blue-500"/>} />
                           <MacroSummaryBox label="Inadimplência Clientes" val={`${currentMacro.customer_default_rate}%`} icon={<ShieldAlert size={20} className="text-orange-500"/>} />
                           
                           <MacroSummaryBox label="Juros Fornecedores" val={`${currentMacro.supplier_interest}%`} icon={<Truck size={20} className="text-amber-500"/>} />
                           <MacroSummaryBox label="Juros Médios Vendas" val={`${currentMacro.sales_interest_rate}%`} icon={<DollarSign size={20} className="text-emerald-400"/>} />
                           
                           <MacroSummaryBox label="Câmbio: Dólar (USD)" val={`${currentMacro.exchange_rates?.USD || 5.2}x`} icon={<DollarSign size={20} className="text-blue-400"/>} />
                           <MacroSummaryBox label="Câmbio: Euro (EUR)" val={`${currentMacro.exchange_rates?.EUR || 5.5}x`} icon={<Landmark size={20} className="text-indigo-400"/>} />
                           
                           <MacroSummaryBox label="Imposto de Renda" val={`${currentMacro.tax_rate_ir}%`} icon={<Scale size={20} className="text-slate-400"/>} />
                           <MacroSummaryBox label="Multa Atrasos" val={`${currentMacro.late_penalty_rate}%`} icon={<AlertOctagon size={20} className="text-rose-600"/>} />
                           
                           <MacroSummaryBox label="Deságio Máquinas" val={`${currentMacro.machine_sale_discount}%`} icon={<TrendingDown size={20} className="text-orange-600"/>} />
                           <MacroSummaryBox label="Venda Ativos" val={currentMacro.allow_machine_sale ? "LIBERADA" : "BLOQUEADA"} icon={<CheckCircle2 size={20} className={currentMacro.allow_machine_sale ? "text-emerald-500" : "text-rose-500"}/>} />
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </main>

      <footer className="px-12 py-6 bg-slate-950 border-t border-white/5 flex justify-between items-center opacity-60 shrink-0 relative z-10">
         <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.8em] italic leading-none">Build v16.7 Master Protocol • Ultra-High Fidelity Desktop Build</span>
         <div className="flex gap-8 items-center">
            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Node 08-Industrial-Cluster-A</span>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Sincronização Atômica Ativa</span>
            </div>
         </div>
      </footer>
    </motion.div>
  );
};

const CostRow = ({ label, val }: { label: string, val: number }) => (
   <div className="flex justify-between items-end border-b border-white/5 pb-4 group hover:translate-x-3 transition-all duration-300">
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] italic group-hover:text-slate-200 transition-colors">{label}</span>
      <span className="text-2xl font-black text-white font-mono italic group-hover:text-orange-500 transition-colors">$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
   </div>
);

const CompactCostBox = ({ label, val, color }: { label: string, val: number, color: string }) => (
   <div className="bg-slate-950 p-6 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all flex flex-col items-center gap-3">
      <span className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</span>
      <span className="text-xl font-black text-white font-mono italic">$ {Math.round(val).toLocaleString()}</span>
   </div>
);

const MacroSummaryBox = ({ label, val, icon }: any) => (
   <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] flex flex-col gap-4 shadow-xl hover:bg-white/[0.02] transition-all group">
      <div className="p-3 bg-white/5 rounded-2xl w-fit group-hover:bg-slate-950 group-hover:shadow-lg transition-all">{icon}</div>
      <div>
         <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 italic">{label}</span>
         <span className="text-3xl font-black text-white italic tracking-tighter truncate leading-none">{val}</span>
      </div>
   </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 border-2 italic active:scale-95 whitespace-nowrap ${active ? 'bg-orange-600 text-white border-orange-400 shadow-[0_15px_40px_rgba(249,115,22,0.4)]' : 'text-slate-500 hover:text-white bg-slate-950 border-transparent hover:border-white/10'}`}>
    {icon} {label}
  </button>
);

export default GazetteViewer;
