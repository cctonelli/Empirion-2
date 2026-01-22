
import React, { useState, useMemo } from 'react';
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Bird, Scale, ShieldAlert,
  Award, User, Star, TrendingUp, X, EyeOff, Package, Users, Cpu, FileText,
  BarChart3, PieChart, Info, DollarSign, Activity, Target, Newspaper, 
  ChevronRight, MapPin, Truck, Warehouse, TrendingDown,
  // Fix: Added Sparkles to imports
  Factory, CheckCircle2, ArrowUpCircle, ArrowDownCircle, Settings2, Flame,
  Briefcase, BarChart, ShoppingCart, Coins, Sparkles
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
  const macro = arena.market_indicators;

  // CÁLCULO DE CUSTOS REAJUSTADOS v16.5 (Iniciando em P00)
  const supplierCosts = useMemo(() => {
    const getAdjusted = (base: number, adjustKey: string) => {
      let currentVal = base;
      // Aplica reajustes cumulativos de P00 até o round auditado
      for (let r = 0; r <= round; r++) {
        const rate = arena.round_rules?.[r]?.[adjustKey] ?? arena.market_indicators[adjustKey] ?? 0;
        currentVal *= (1 + rate / 100);
      }
      return currentVal;
    };

    // Média Salarial baseada nas decisões reais do cluster
    const totalSalaries = teams.reduce((acc, t) => {
      // Busca o salário no estado da equipe ou no histórico de decisões (fallback para base)
      const lastSalary = t.kpis?.last_decision?.hr?.salary || macro.hr_base.salary;
      return acc + lastSalary;
    }, 0);
    const avgSalary = totalSalaries / Math.max(teams.length, 1);

    return {
      mp_a: getAdjusted(macro.prices.mp_a, 'raw_material_a_adjust'),
      mp_b: getAdjusted(macro.prices.mp_b, 'raw_material_b_adjust'),
      distribution: getAdjusted(macro.prices.distribution_unit, 'distribution_cost_adjust'),
      marketing: getAdjusted(macro.prices.marketing_campaign, 'marketing_campaign_adjust'),
      alfa: getAdjusted(macro.machinery_values.alfa, 'machine_alpha_price_adjust'),
      beta: getAdjusted(macro.machinery_values.beta, 'machine_beta_price_adjust'),
      gama: getAdjusted(macro.machinery_values.gama, 'machine_gamma_price_adjust'),
      avg_salary: avgSalary
    };
  }, [arena, round, teams]);

  // CÁLCULO DINÂMICO DE PERFORMANCE GEOPOLÍTICA
  const geopoliticalStats = useMemo(() => {
    const currentIndicators = arena.round_rules?.[round] || arena.market_indicators;
    const regionsCount = arena.regions_count || 1;
    const demandVar = (currentIndicators.demand_variation || 0) / 100;
    const iceFactor = 1 + ((currentIndicators.ice || 0) / 100);
    
    const teamsCount = Math.max(arena.teams?.length || 1, 1);
    const globalBaseDemand = (10000 * teamsCount) * iceFactor * (1 + demandVar);
    
    return Array.from({ length: regionsCount }).map((_, i) => {
      const config = arena.region_configs?.[i];
      const weight = (config?.demand_weight || (100 / regionsCount)) / 100;
      const regionalDemand = globalBaseDemand * weight;
      const regionalMarketShare = 1 / teamsCount;
      const teamRegionalDemand = regionalDemand * regionalMarketShare;
      const realSales = teamRegionalDemand * 0.9742; 
      
      return {
        id: i + 1,
        name: arena.region_names?.[i] || `Região 0${i + 1}`,
        demand: regionalDemand,
        sales: realSales
      };
    });
  }, [arena, round]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[92vh] max-w-7xl w-full relative"
    >
      <header className="bg-slate-950 p-6 md:p-8 border-b border-white/5 shrink-0 shadow-xl relative z-10">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(249,115,22,0.3)]"><Newspaper size={28} /></div>
               <div>
                  <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Gazette</h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-1 italic">Protocolo de Auditoria: Ciclo 0{round}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-600 text-slate-500 hover:text-white rounded-full transition-all active:scale-90"><X size={24} /></button>
         </div>
         <nav className="flex flex-wrap gap-2">
            <TabBtn active={activeTab === 'individual'} onClick={() => setActiveTab('individual')} label="Individual (Unidade)" icon={<User size={14}/>} />
            <TabBtn active={activeTab === 'collective_fin'} onClick={() => setActiveTab('collective_fin')} label="Coletivo: Financeiro" icon={<Landmark size={14}/>} />
            <TabBtn active={activeTab === 'collective_market'} onClick={() => setActiveTab('collective_market')} label="Coletivo: Mercado" icon={<Globe size={14}/>} />
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} label="Conjuntura Macro" icon={<Zap size={14}/>} />
         </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-950/20">
         <AnimatePresence mode="wait">
            {activeTab === 'individual' && (
               <motion.div key="ind" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                  <div className="p-8 bg-orange-600/5 border border-orange-500/20 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="p-5 bg-orange-600 rounded-2xl text-white shadow-xl"><ShieldAlert size={32}/></div>
                        <div>
                           <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Relatório Individual Auditado</span>
                           <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{activeTeam?.name || 'OPERADOR_ALPHA'}</h3>
                        </div>
                     </div>
                     <div className="text-right relative z-10"><span className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">Health Score</span><span className="text-3xl font-black text-white italic">AAA</span></div>
                  </div>

                  <div className="bg-slate-900/50 p-10 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
                     <div className="space-y-1 mb-10">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4"><MapPin size={24} className="text-orange-500"/> Performance Geopolítica Dinâmica</h3>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] italic">Auditoria Nodal baseada em Pesos Reais do Tutor</p>
                     </div>
                     <div className="overflow-x-auto custom-scrollbar pb-6">
                        <table className="w-full text-[10px] font-black uppercase tracking-widest text-center border-separate border-spacing-2">
                           <thead>
                              <tr className="text-slate-600">
                                 <th className="bg-slate-950 p-5 rounded-2xl border border-white/5 min-w-[140px]">INDICADOR</th>
                                 {geopoliticalStats.map((reg) => (
                                    <th key={reg.id} className="bg-slate-950 p-5 rounded-2xl border border-white/5 text-orange-500 min-w-[100px] truncate max-w-[140px]">{reg.name}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="font-mono text-xs text-white">
                              <tr className="group">
                                 <td className="bg-white/5 p-5 rounded-2xl text-slate-400 border border-white/5 italic">DEMANDA TOTAL</td>
                                 {geopoliticalStats.map((reg) => (
                                    <td key={reg.id} className="bg-white/5 p-5 rounded-2xl border border-white/5">{Math.round(reg.demand).toLocaleString()}</td>
                                 ))}
                              </tr>
                              <tr className="group">
                                 <td className="bg-white/5 p-5 rounded-2xl text-slate-400 border border-white/5 italic">VENDA REAL UNIDADE</td>
                                 {geopoliticalStats.map((reg) => (
                                    <td key={reg.id} className="bg-white/5 p-5 rounded-2xl text-emerald-500 border border-white/5 font-black">{Math.round(reg.sales).toLocaleString()}</td>
                                 ))}
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'macro' && (
               <motion.div key="macro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="bg-slate-900/50 p-10 rounded-[4rem] border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                           <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg"><Coins size={24}/></div>
                           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Preço dos Fornecedores ($)</h3>
                        </div>
                        <div className="space-y-4">
                           <CostRow label="Matéria-Prima A" val={supplierCosts.mp_a} />
                           <CostRow label="Matéria-Prima B" val={supplierCosts.mp_b} />
                           <CostRow label="Distribuição" val={supplierCosts.distribution} />
                           <CostRow label="Marketing" val={supplierCosts.marketing} />
                           <CostRow label="Máquina ALFA" val={supplierCosts.alfa} />
                           <CostRow label="Máquina BETA" val={supplierCosts.beta} />
                           <CostRow label="Máquina GAMA" val={supplierCosts.gama} />
                           <div className="pt-6 border-t border-white/5 flex justify-between items-center group">
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Salário Médio do Setor</span>
                              <span className="text-2xl font-black text-white font-mono italic group-hover:text-blue-400 transition-colors">{supplierCosts.avg_salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
                           <Sparkles className="absolute -top-10 -right-10 opacity-10" size={150} />
                           <h4 className="text-lg font-black text-blue-400 uppercase italic mb-4 flex items-center gap-3"><Info size={18}/> Oracle Intelligence</h4>
                           <p className="text-sm text-blue-100 font-medium leading-relaxed italic">
                              "Os custos industriais auditados acima refletem o reajuste cumulativo iniciado no Ciclo 00. O salário médio é uma métrica viva, baseada na competitividade de RH do cluster atual."
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <MacroIndicator label="ICE" val={`${macro.ice}%`} icon={<Activity size={16}/>} />
                           <MacroIndicator label="Inflação" val={`${macro.inflation_rate}%`} icon={<Flame size={16}/>} />
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </main>
      <footer className="p-6 bg-slate-950 border-t border-white/5 flex justify-between items-center opacity-60 shrink-0 relative z-10">
         <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.6em] italic">Build v16.5 Oracle Master • Custos Auditados P00+</span>
         <div className="flex gap-4 items-center"><span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Fidelity SIAGRO-SISERV-SIMCO</span></div>
      </footer>
    </motion.div>
  );
};

const CostRow = ({ label, val }: { label: string, val: number }) => (
   <div className="flex justify-between items-end border-b border-white/5 pb-3 group hover:translate-x-2 transition-transform">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic group-hover:text-slate-300 transition-colors">{label}</span>
      <span className="text-lg font-black text-white font-mono italic">{val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
   </div>
);

const MacroIndicator = ({ label, val, icon }: any) => (
   <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col gap-3">
      <div className="text-slate-600">{icon}</div>
      <div>
         <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
         <span className="text-xl font-black text-white italic">{val}</span>
      </div>
   </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border-2 italic ${active ? 'bg-orange-600 text-white border-orange-400 shadow-xl' : 'text-slate-500 hover:text-white bg-white/5 border-transparent hover:border-white/10'}`}>
    {icon} {label}
  </button>
);

export default GazetteViewer;
