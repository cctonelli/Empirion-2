
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Landmark, Boxes, Loader2, Users, Cpu, Wrench, Clock, UserMinus, ShieldAlert, Heart, Flame, Factory, Database, Coins, Award, Zap, Sparkles, PieChart,
  ShieldCheck, Activity, ArrowRight, ArrowDownLeft, ArrowUpRight, Wallet, ShoppingCart, Truck, Warehouse, AlertTriangle, Scale, Target, ChevronDown
} from 'lucide-react';
import { Branch, Championship, Team, AccountNode } from '../types';
import { getChampionships } from '../services/supabase';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<'dre' | 'cash_flow' | 'balance'>('dre');

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
       revenue: 0, cpv: 0, gross_profit: 0, opex: 0, operating_profit: 0, lair: 0, tax: 0, net_profit: 0,
       financial_result: 0, non_op_res: 0,
       details: { 
         cpp: 0, wac_pa: 0, rd_investment: 0, social_charges: 0, payroll_net: 0, non_op_rev: 0, non_op_exp: 0, productivity_bonus: 0, fin_rev: 0, bad_debt: 0, storage_cost: 0
       }
     };
  }, [activeTeam]);

  const cashFlow = useMemo(() => {
     return activeTeam?.kpis?.statements?.cash_flow || {
        start: 170000,
        inflow: { total: 0, cash_sales: 0, term_sales: 0, investment_withdrawal: 0, machine_sales: 0, awards: 0, loans_normal: 0, compulsory: 0 },
        outflow: { total: 0, payroll: 0, social_charges: 0, rd: 0, marketing: 0, distribution: 0, storage: 0, suppliers: 0, misc: 0, machine_buy: 0, maintenance: 0, amortization: 0, late_penalties: 0, interest: 0, training: 0, taxes: 0, dividends: 0 },
        investment_apply: 0,
        final: 0
     };
  }, [activeTeam]);

  const balanceSheet = useMemo((): AccountNode[] => {
    return activeTeam?.kpis?.statements?.balance_sheet || [];
  }, [activeTeam]);

  // Formatação com 2 casas para valores monetários totais
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  
  // Formatação com 4 casas para custos unitários sensíveis
  const fmt4 = (v: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(v);

  // Inteligência de Risco de Crédito (Markup Compensatório)
  const creditRiskMetrics = useMemo(() => {
    const loss = Math.abs(dre.details?.bad_debt || 0);
    const revenue = Math.max(1, dre.revenue);
    const lossRatio = (loss / revenue) * 100;
    const suggestedMarkupIncrease = lossRatio > 0 ? lossRatio + 0.5 : 0;
    
    return {
      loss,
      lossRatio,
      suggestedMarkupIncrease,
      isCritical: lossRatio > 2.0 
    };
  }, [dre]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  const isLoss = dre.net_profit < 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto p-6">
      <header className="flex flex-col lg:flex-row justify-between lg:items-end px-6 gap-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Arena: {activeArena?.name} • Ciclo Master v30.25</p>
         </div>
         <div className="flex flex-wrap gap-3 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
            <ReportTabBtn active={activeReport === 'dre'} onClick={() => setActiveReport('dre')} label="Demonstrativo (DRE)" icon={<TrendingUp size={14} />} color="orange" />
            <ReportTabBtn active={activeReport === 'cash_flow'} onClick={() => setActiveReport('cash_flow')} label="Fluxo de Caixa" icon={<Activity size={14} />} color="emerald" />
            <ReportTabBtn active={activeReport === 'balance'} onClick={() => setActiveReport('balance')} label="Balanço Patrimonial" icon={<Landmark size={14} />} color="blue" />
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-8 bg-slate-900 border border-white/5 rounded-[4rem] p-8 md:p-12 shadow-2xl space-y-8 min-h-[750px]">
            <AnimatePresence mode="wait">
               {activeReport === 'dre' ? (
                  <motion.div key="dre" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                     <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">DRE Tático Oracle</h3>
                     <div className="space-y-1 font-mono">
                        <ReportLine label="(+) RECEITAS BRUTAS DE VENDAS" val={fmt(dre.revenue)} bold />
                        <ReportLine label="( - ) CUSTO PROD. VENDIDO - CPV" val={fmt(dre.cpv)} neg />
                        <ReportLine label="( = ) LUCRO BRUTO" val={fmt(dre.gross_profit)} highlight />
                        
                        <div className="py-2 space-y-1 bg-white/[0.01] rounded-2xl border border-white/5 px-4 my-2">
                           <ReportLine label="( - ) DESPESAS OPERACIONAIS" val={fmt(dre.opex)} neg />
                           <div className="space-y-2">
                              <ReportLine label="INADIMPLÊNCIA (PERDA)" val={fmt(dre.details?.bad_debt || 0)} indent neg color="text-rose-400" />
                           </div>
                           <ReportLine label="P&D - INOVAÇÃO" val={fmt(dre.details?.rd_investment || 0)} indent color="text-blue-400" />
                           <ReportLine label="CUSTO DE ESTOCAGEM" val={fmt(dre.details?.storage_cost || 0)} indent neg color="text-slate-400" />
                        </div>

                        <ReportLine label="( = ) LUCRO OPERACIONAL" val={fmt(dre.operating_profit)} bold />
                        
                        <div className="py-2 space-y-1 opacity-90 border-l-2 border-indigo-500/20 ml-2 pl-4">
                           <ReportLine label="(+/-) RESULTADO FINANCEIRO" val={fmt(dre.financial_result || 0)} />
                           {dre.details?.fin_rev > 0 && <ReportLine label="(+) RENDIMENTOS DE APLICAÇÕES" val={fmt(dre.details.fin_rev)} indent color="text-emerald-400" />}
                        </div>

                        <ReportLine label="( = ) LUCRO ANTES DO IR (LAIR)" val={fmt(dre.lair)} bold highlight />
                        
                        <div className="py-2 space-y-1 opacity-80">
                           <ReportLine label="( - ) PROVISÃO PARA O IR" val={fmt(dre.tax)} neg color={dre.tax > 0 ? "text-rose-400" : "text-slate-600"} />
                        </div>

                        <ReportLine label="( = ) LUCRO LÍQUIDO DO EXERCÍCIO" val={fmt(dre.net_profit)} total />
                        
                        <div className="mt-8 pt-4 border-t border-white/5 opacity-40">
                           <ReportLine label="DETALHE: CPP (CUSTO PROD. PERÍODO)" val={fmt4(dre.details?.cpp || 0)} color="text-slate-500" />
                           <ReportLine label="DETALHE: WAC (CUSTO MÉDIO PA)" val={fmt4(dre.details?.wac_pa || 0)} color="text-slate-500" />
                        </div>
                     </div>
                  </motion.div>
               ) : activeReport === 'cash_flow' ? (
                  <motion.div key="cf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                     <div className="flex justify-between items-center border-b border-white/5 pb-6">
                        <h3 className="text-xl font-black text-white uppercase italic">Fluxo de Caixa Reconciliado</h3>
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[9px] font-black uppercase">
                           <Coins size={12} /> Regime de Caixa
                        </div>
                     </div>
                     <div className="space-y-1 font-mono">
                        <ReportLine label="(=) SALDO INICIAL DO PERÍODO" val={fmt(cashFlow.start)} bold highlight color="text-slate-300" />
                        
                        <div className="py-4 space-y-2">
                           <ReportLine label="(+) ENTRADAS TOTAIS" val={fmt(cashFlow.inflow.total)} color="text-emerald-400" bold />
                           <ReportLine label="RECEBIMENTOS DE CLIENTES" val={fmt(cashFlow.inflow.cash_sales + cashFlow.inflow.term_sales)} indent icon={<ShoppingCart size={10}/>} />
                           <ReportLine label="EMPRÉSTIMOS / RESGATES" val={fmt((cashFlow.inflow.loans || 0) + (cashFlow.inflow.investment_withdrawal || 0))} indent />
                        </div>

                        <div className="py-4 space-y-2 bg-white/[0.01] rounded-3xl border border-white/5 px-6">
                           <ReportLine label="(-) SAÍDAS TOTAIS" val={fmt(cashFlow.outflow.total)} neg color="text-rose-400" bold />
                           <ReportLine label="FOLHA DE PAGAMENTO" val={fmt(cashFlow.outflow.payroll)} indent neg icon={<Users size={10}/>} />
                           <ReportLine label="PAGAMENTO FORNECEDORES" val={fmt(cashFlow.outflow.suppliers)} indent neg />
                           <ReportLine label="OPEX (MKT/ADM/P&D)" val={fmt(cashFlow.outflow.marketing + cashFlow.outflow.distribution + cashFlow.outflow.rd)} indent neg icon={<Truck size={10}/>} />
                           <ReportLine label="JUROS & IMPOSTOS" val={fmt(cashFlow.outflow.interest + cashFlow.outflow.taxes)} indent neg />
                           <ReportLine label="DISTRIBUIÇÃO DE DIVIDENDOS" val={fmt(cashFlow.outflow.dividends || 0)} indent neg color="text-indigo-400" />
                        </div>

                        <div className="py-4">
                           <ReportLine label="(-) NOVA APLICAÇÃO FINANCEIRA" val={fmt(cashFlow.investment_apply || 0)} neg color="text-blue-400" />
                        </div>

                        <div className="mt-8 pt-8 border-t-4 border-white/10">
                           <ReportLine label="(=) SALDO FINAL DO PERÍODO" val={fmt(cashFlow.final)} total bold highlight color={cashFlow.final < 0 ? "text-rose-500" : "text-emerald-400"} />
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div key="bs" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                     <div className="flex justify-between items-center border-b border-white/5 pb-6">
                        <h3 className="text-xl font-black text-white uppercase italic">Balanço Patrimonial Auditado</h3>
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 text-[9px] font-black uppercase">
                           <ShieldCheck size={12} /> Audit Balanced
                        </div>
                     </div>
                     <div className="matrix-container max-h-[550px] overflow-y-auto pr-2">
                        {balanceSheet.length > 0 ? (
                           <div className="space-y-4">
                             {balanceSheet.map(node => (
                               <AccountRow key={node.id} node={node} fmt={fmt} />
                             ))}
                           </div>
                        ) : (
                           <div className="py-20 text-center opacity-30 italic">Aguardando fechamento do primeiro round...</div>
                        )}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-10 shadow-2xl space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Integridade Patrimonial</h4>
               <div className="space-y-6">
                  <CostDetail label="Patrimônio Líquido" val={fmt(activeTeam?.kpis?.equity || 5055447.12)} />
                  <CostDetail label="Liquidez Corrente" val="1.84" />
                  
                  <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                     <span className="text-[8px] font-black text-slate-500 uppercase italic">Veredito do Auditor</span>
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isLoss ? 'bg-rose-600/10 text-rose-500' : 'bg-emerald-600/10 text-emerald-500'}`}>
                           {isLoss ? <Flame size={20}/> : <ShieldCheck size={20}/>}
                        </div>
                        <span className={`text-2xl font-black italic font-mono ${isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {isLoss ? 'EROSÃO PL' : 'ESTÁVEL'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            <div className={`bg-slate-900 border rounded-[4rem] p-10 shadow-2xl space-y-6 transition-all ${creditRiskMetrics.loss > 0 ? 'border-rose-500/30' : 'border-white/10'}`}>
               <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400 italic">Análise de Risco</h4>
                  {creditRiskMetrics.loss > 0 && <ShieldAlert size={16} className="text-rose-500 animate-pulse" />}
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <span className="text-[9px] font-black text-slate-500 uppercase">Inadimplência Projetada</span>
                     <span className="text-2xl font-mono font-black text-white">$ {fmt(creditRiskMetrics.loss)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-rose-600 transition-all duration-1000" style={{ width: `${Math.min(100, creditRiskMetrics.lossRatio * 10)}%` }} />
                  </div>
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportTabBtn = ({ active, onClick, label, icon, color }: any) => {
  const activeClass = color === 'orange' ? 'bg-orange-600 text-white shadow-lg' : color === 'emerald' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg';
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${active ? activeClass : 'text-slate-500 hover:text-white'}`}
    >
      {icon} {label}
    </button>
  );
};

const AccountRow = ({ node, fmt, level = 0 }: { node: AccountNode, fmt: (v: number) => string, level?: number }) => {
  const isParent = node.children && node.children.length > 0;
  return (
    <div className="space-y-2">
      <div className={`flex justify-between p-4 rounded-2xl border transition-all ${isParent ? 'bg-white/5 border-white/10 shadow-sm' : 'bg-slate-950 border-white/5 opacity-80'}`} style={{ marginLeft: level * 20 }}>
        <div className="flex items-center gap-3">
          {isParent && <ChevronDown size={14} className="text-slate-600" />}
          <span className={`text-[11px] uppercase tracking-wider ${isParent ? 'font-black text-white' : 'font-bold text-slate-400'}`}>{node.label}</span>
        </div>
        <span className={`text-sm font-mono font-black ${node.value < 0 ? 'text-rose-500' : 'text-slate-200'}`}>$ {fmt(node.value)}</span>
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
      {neg ? '(' : ''}$ {val}{neg ? ')' : ''}
    </span>
  </div>
);

const CostDetail = ({ label, val }: any) => (
  <div className="flex justify-between items-center group">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
    <span className="text-sm font-mono font-bold text-white">$ {val}</span>
  </div>
);

export default Reports;
