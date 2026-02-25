
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Landmark, Boxes, Loader2, Users, Cpu, ShieldAlert, Factory, Coins, Zap, PieChart,
  ShieldCheck, Activity, Landmark as BankIcon, ShoppingCart, Truck, Scale, ChevronDown, AlertCircle,
  ArrowDownLeft, ArrowUpRight, Receipt, Target, Clock, Sparkles, Globe, PoundSterling
} from 'lucide-react';
import { Branch, Championship, Team, AccountNode, CurrencyType } from '../types';
import { getChampionships } from '../services/supabase';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { formatCurrency } from '../utils/formatters';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<'dre' | 'cash_flow' | 'balance' | 'strategic'>('dre');

  useEffect(() => {
    const fetchContext = async () => {
      const champId = localStorage.getItem('active_champ_id');
      const teamId = localStorage.getItem('active_team_id');
      if (!champId) return;

      const { data } = await getChampionships();
      const arena = data?.find(a => a.id === champId);
      if (arena) {
        setActiveArena(arena);
        const team = arena.teams?.find((t: Team) => t.id === teamId);
        if (team) setActiveTeam(team);
      }
      setLoading(false);
    };
    fetchContext();
  }, []);

  const dre = useMemo(() => activeTeam?.kpis?.statements?.dre || {}, [activeTeam]);
  const cf = useMemo(() => activeTeam?.kpis?.statements?.cash_flow || { inflow: {}, outflow: {} }, [activeTeam]);
  const balanceSheet = useMemo((): AccountNode[] => activeTeam?.kpis?.statements?.balance_sheet || [], [activeTeam]);

  const currency = activeArena?.currency || 'BRL';
  const fmt = (v: number) => formatCurrency(v, currency);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto p-6">
      <header className="flex flex-col lg:flex-row justify-between lg:items-end px-6 gap-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Arena: {activeArena?.name} • Moeda: {currency}</p>
         </div>
         <div className="flex flex-wrap gap-3 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
            <ReportTabBtn active={activeReport === 'dre'} onClick={() => setActiveReport('dre')} label="DRE" icon={<TrendingUp size={14} />} color="orange" />
            <ReportTabBtn active={activeReport === 'cash_flow'} onClick={() => setActiveReport('cash_flow')} label="Fluxo de Caixa" icon={<Activity size={14} />} color="emerald" />
            <ReportTabBtn active={activeReport === 'balance'} onClick={() => setActiveReport('balance')} label="Balanço" icon={<Landmark size={14} />} color="blue" />
            <ReportTabBtn active={activeReport === 'strategic'} onClick={() => setActiveReport('strategic')} label="Estratégico" icon={<Target size={14} />} color="purple" />
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-12 bg-slate-900 border border-white/5 rounded-[4rem] p-8 md:p-12 shadow-2xl min-h-[600px]">
            <AnimatePresence mode="wait">
               {activeReport === 'dre' ? (
                  <motion.div key="dre" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                     <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">Demonstrativo de Resultados (Competência)</h3>
                     <div className="space-y-1 font-mono">
                        <ReportLine label="(+) RECEITAS BRUTAS" val={fmt(dre.revenue)} bold />
                        <ReportLine label="( - ) IVA SOBRE VENDAS" val={fmt(dre.vat_sales)} indent neg />
                        <ReportLine label="( = ) RECEITA LÍQUIDA" val={fmt(dre.net_sales)} highlight />
                        <ReportLine label="( - ) CUSTO PRODUTO VENDIDO (CPV)" val={fmt(dre.cpv)} neg />
                        <ReportLine label="( = ) LUCRO BRUTO" val={fmt(dre.gross_profit)} />
                        <ReportLine label="( - ) DESPESAS OPERACIONAIS" val={fmt(dre.opex)} neg />
                        <ReportLine label="( = ) RESULTADO OPERACIONAL" val={fmt(dre.operating_profit)} highlight />
                        <ReportLine label="( = ) LUCRO LÍQUIDO DO CICLO" val={fmt(dre.net_profit)} total />
                     </div>
                  </motion.div>
               ) : activeReport === 'cash_flow' ? (
                  <motion.div key="cf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                     <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">Fluxo de Caixa (Regime de Caixa)</h3>
                     <div className="space-y-1 font-mono">
                        <ReportLine label="(=) SALDO INICIAL" val={fmt(cf.start)} bold />
                        <div className="py-4 space-y-2 border-l-2 border-emerald-500/30 pl-6 my-4 bg-emerald-500/5 rounded-r-3xl">
                           <ReportLine label="(+) ENTRADAS TOTAIS" val={fmt(cf.inflow?.total)} color="text-emerald-400" />
                        </div>
                        <div className="py-4 space-y-2 border-l-2 border-rose-500/30 pl-6 my-4 bg-rose-500/5 rounded-r-3xl">
                           <ReportLine label="(-) SAÍDAS TOTAIS" val={fmt(cf.outflow?.total)} neg color="text-rose-400" />
                        </div>
                        <ReportLine label="(=) SALDO FINAL PROJETADO" val={fmt(cf.final)} total bold highlight color={cf.final <= 0 ? 'text-rose-500' : 'text-emerald-400'} />
                     </div>
                  </motion.div>
               ) : activeReport === 'balance' ? (
                  <motion.div key="bs" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                     <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">Balanço Patrimonial Auditado</h3>
                     <div className="matrix-container max-h-[600px] overflow-y-auto pr-2">
                        {balanceSheet.map(node => (
                          <AccountRow key={node.id} node={node} fmt={fmt} />
                        ))}
                     </div>
                  </motion.div>
               ) : (
                  <motion.div key="strategic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                     <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">Comando Estratégico - KPIs Avançados</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <KpiCard label="Ciclo de Conversão de Caixa" val={`${activeTeam?.kpis?.ccc?.toFixed(0) || 0} dias`} desc="PME + PMR - PMP" icon={<Clock size={20} />} color="text-blue-400" />
                        <KpiCard label="Cobertura de Juros" val={`${activeTeam?.kpis?.interest_coverage?.toFixed(2) || 0}x`} desc="EBIT / Despesas Financeiras" icon={<ShieldAlert size={20} />} color="text-orange-400" />
                        <KpiCard label="Elasticidade-Preço" val={`${activeTeam?.kpis?.price_elasticity?.toFixed(2) || 1.00}`} desc="Sensibilidade da Demanda" icon={<Zap size={20} />} color="text-purple-400" />
                        <KpiCard label="Pegada de Carbono" val={`${activeTeam?.kpis?.carbon_footprint?.toFixed(2) || 0} kg CO2`} desc="Impacto Ambiental Unitário" icon={<Sparkles size={20} />} color="text-emerald-400" />
                        <KpiCard label="Margem Líquida (DuPont)" val={`${((activeTeam?.kpis?.dupont?.margin || 0) * 100).toFixed(2)}%`} desc="Eficiência de Lucro" icon={<TrendingUp size={20} />} color="text-white" />
                        <KpiCard label="Giro do Ativo (DuPont)" val={`${activeTeam?.kpis?.dupont?.turnover?.toFixed(2) || 0}x`} desc="Eficiência Operacional" icon={<Activity size={20} />} color="text-white" />
                     </div>

                     <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6 pt-10">Global Trade Intelligence</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard label="Câmbio BRL" val={activeTeam?.kpis?.brl_rate?.toFixed(2) || '1.00'} desc="Real Brasileiro" icon={<Globe size={20} />} color="text-emerald-400" />
                        <KpiCard label="Câmbio GBP" val={activeTeam?.kpis?.gbp_rate?.toFixed(2) || '0.00'} desc="Libra Esterlina" icon={<PoundSterling size={20} />} color="text-blue-400" />
                        <KpiCard label="Tarifa Brasil" val={`${activeTeam?.kpis?.export_tariff_brazil || 0}%`} desc="Exportação p/ BR" icon={<Scale size={20} />} color="text-orange-400" />
                        <KpiCard label="Tarifa UK" val={`${activeTeam?.kpis?.export_tariff_uk || 0}%`} desc="Exportação p/ UK" icon={<Scale size={20} />} color="text-blue-400" />
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, val, desc, icon, color }: any) => (
  <div className="bg-slate-950/50 border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-white/10 transition-all group">
    <div className="flex justify-between items-center">
      <div className={`p-4 bg-white/5 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <span className="text-2xl font-mono font-black text-white">{val}</span>
    </div>
    <div>
      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</h4>
      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">{desc}</p>
    </div>
  </div>
);

const ReportTabBtn = ({ active, onClick, label, icon, color }: any) => {
  const activeClass = color === 'orange' ? 'bg-orange-600' : color === 'emerald' ? 'bg-emerald-600' : color === 'purple' ? 'bg-purple-600' : 'bg-blue-600';
  return (
    <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${active ? activeClass + ' text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
};

const AccountRow = ({ node, fmt, level = 0 }: { node: AccountNode, fmt: (v: number) => string, level?: number }) => {
  const isParent = node.children && node.children.length > 0;
  return (
    <div className="space-y-1">
      <div className={`flex justify-between p-4 rounded-2xl border transition-all ${isParent ? 'bg-white/5 border-white/10' : 'bg-slate-950/40 border-white/5 opacity-80'}`} style={{ marginLeft: level * 20 }}>
        <div className="flex items-center gap-3">
          {isParent && <ChevronDown size={14} className="text-slate-600" />}
          <span className={`text-[11px] uppercase tracking-wider ${isParent ? 'font-black text-white' : 'font-bold text-slate-400'}`}>{node.label}</span>
        </div>
        <span className="text-sm font-mono font-black text-slate-200">{fmt(node.value)}</span>
      </div>
      {isParent && node.children?.map(child => (
        <AccountRow key={child.id} node={child} fmt={fmt} level={level + 1} />
      ))}
    </div>
  );
};

const ReportLine = ({ label, val, neg, bold, total, highlight, indent, color, icon }: any) => (
  <div className={`flex justify-between p-3 rounded-xl transition-all ${total ? 'bg-orange-600/10 border border-orange-500/20 mt-4' : highlight ? 'bg-white/5' : ''} ${indent ? 'pl-12 opacity-70' : ''}`}>
    <div className="flex items-center gap-3">
       {icon && <span className="text-slate-600">{icon}</span>}
       <span className={`text-[10px] uppercase tracking-wider ${bold || total ? 'font-black' : 'text-slate-500'} ${color || ''}`}>{label}</span>
    </div>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : total ? 'text-orange-500' : color || 'text-slate-200'}`}>
      {neg ? '(' : ''}{val}{neg ? ')' : ''}
    </span>
  </div>
);

export default Reports;
