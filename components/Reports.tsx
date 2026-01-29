
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Landmark, Boxes, Loader2, Users, Cpu, Wrench, Clock, UserMinus, ShieldAlert, Heart, Flame, Factory, Database, Coins, Award, Zap, Sparkles, PieChart, Landmark as BankIcon,
  ShieldCheck, Activity, ArrowRight, ArrowDownLeft, ArrowUpRight, Wallet, ShoppingCart, Truck, Warehouse
} from 'lucide-react';
import { Branch, Championship, Team } from '../types';
import { getChampionships } from '../services/supabase';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<'dre' | 'cash_flow'>('dre');

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
       revenue: 0, cpv: 0, gross_profit: 0, opex: 0, operating_profit: 0, lair: 0, tax: 0, profit_after_ir: 0, plr: 0, net_profit: 0, dividends: 0, retained_profit: 0,
       financial_result: 0, non_operational_result: 0,
       details: { 
         cpp: 0, wac_pa: 0, rd_investment: 0, social_charges: 0, payroll_net: 0, non_op_rev: 0, non_op_exp: 0, productivity_bonus: 0
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

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  const isLoss = dre.net_profit < 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto p-6">
      <header className="flex flex-col lg:flex-row justify-between lg:items-end px-6 gap-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Arena: {activeArena?.name} • Ciclo v28.8 MASTER</p>
         </div>
         <div className="flex gap-4 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveReport('dre')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeReport === 'dre' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <TrendingUp size={14} /> Demonstrativo (DRE)
            </button>
            <button 
              onClick={() => setActiveReport('cash_flow')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeReport === 'cash_flow' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <Activity size={14} /> Fluxo de Caixa
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-8 bg-slate-900 border border-white/5 rounded-[4rem] p-12 shadow-2xl space-y-8 min-h-[700px]">
            <AnimatePresence mode="wait">
               {activeReport === 'dre' ? (
                  <motion.div key="dre" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                     <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">DRE Tático v28.8</h3>
                     <div className="space-y-1 font-mono">
                        <ReportLine label="(+) RECEITAS BRUTAS DE VENDAS" val={fmt(dre.revenue)} bold />
                        <ReportLine label="( - ) CUSTO PROD. VENDIDO - CPV" val={fmt(dre.cpv)} neg />
                        <ReportLine label="( = ) LUCRO BRUTO" val={fmt(dre.gross_profit)} highlight />
                        
                        <div className="py-2 space-y-1 bg-white/[0.01] rounded-2xl border border-white/5 px-4 my-2">
                           <ReportLine label="( - ) DESPESAS OPERACIONAIS" val={fmt(dre.opex)} neg />
                           <ReportLine label="P&D - INOVAÇÃO" val={fmt(dre.details?.rd_investment || 0)} indent color="text-blue-400" />
                        </div>

                        <ReportLine label="( = ) LUCRO OPERACIONAL" val={fmt(dre.operating_profit)} bold />
                        
                        <div className="py-2 space-y-1 opacity-90 border-l-2 border-indigo-500/20 ml-2 pl-4">
                           <ReportLine label="(+/-) RESULTADO FINANCEIRO" val={fmt(dre.financial_result || 0)} />
                           <ReportLine label="(+/-) RESULTADO NÃO OPERACIONAL" val={fmt(dre.non_operational_result || 0)} />
                        </div>

                        <ReportLine label="( = ) LUCRO ANTES DO IR (LAIR)" val={fmt(dre.lair)} bold highlight />
                        
                        <div className="py-2 space-y-1 opacity-80">
                           <ReportLine label="( - ) PROVISÃO PARA O IR" val={fmt(dre.tax)} neg color={dre.tax > 0 ? "text-rose-400" : "text-slate-600"} />
                           <ReportLine label="( = ) LUCRO APÓS O IR" val={fmt(dre.profit_after_ir)} bold />
                           <ReportLine label="( - ) PLR - PARTICIPAÇÃO LUCROS" val={fmt(dre.plr)} neg color={dre.plr > 0 ? "text-amber-400" : "text-slate-600"} />
                        </div>

                        <ReportLine label="( = ) LUCRO LÍQUIDO DO EXERCÍCIO" val={fmt(dre.net_profit)} total />
                        
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
                           <ReportLine label="( - ) DIVIDENDOS PROPOSTOS" val={fmt(dre.dividends)} neg color={dre.dividends > 0 ? "text-indigo-400" : "text-slate-600"} />
                           <ReportLine 
                             label={isLoss ? "(=) PREJUÍZO ACUMULADO NO BALANÇO" : "(=) LUCRO RETIDO NO BALANÇO"} 
                             val={fmt(dre.retained_profit)} 
                             neg={isLoss}
                             highlight 
                             bold 
                             color={isLoss ? "text-rose-500" : "text-emerald-400"} 
                           />
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div key="cf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                     <div className="flex justify-between items-center border-b border-white/5 pb-6">
                        <h3 className="text-xl font-black text-white uppercase italic">Fluxo de Caixa v28.8</h3>
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[9px] font-black uppercase">
                           <Coins size={12} /> Auditado Real-time
                        </div>
                     </div>
                     <div className="space-y-1 font-mono">
                        <ReportLine label="(=) SALDO INICIAL DO PERÍODO" val={fmt(cashFlow.start)} bold highlight color="text-slate-300" />
                        
                        <div className="py-4 space-y-2">
                           <ReportLine label="(+) ENTRADAS TOTAIS" val={fmt(cashFlow.inflow.total)} color="text-emerald-400" bold />
                           <ReportLine label="VENDAS À VISTA" val={fmt(cashFlow.inflow.cash_sales)} indent icon={<ShoppingCart size={10}/>} />
                           <ReportLine label="VENDAS A PRAZO (LÍQUIDO)" val={fmt(cashFlow.inflow.term_sales)} indent icon={<Clock size={10}/>} color="text-blue-400" />
                           <ReportLine label="RESGATE DE APLICAÇÕES" val={fmt(cashFlow.inflow.investment_withdrawal)} indent />
                           <ReportLine label="VENDA DE MÁQUINAS" val={fmt(cashFlow.inflow.machine_sales)} indent />
                           <ReportLine label="PREMIAÇÕES RECEBIDAS" val={fmt(cashFlow.inflow.awards)} indent />
                           <ReportLine label="EMPRÉSTIMOS NORMAIS" val={fmt(cashFlow.inflow.loans_normal)} indent />
                           <ReportLine label="EMPRÉSTIMO COMPULSÓRIO" val={fmt(cashFlow.inflow.compulsory)} indent />
                        </div>

                        <div className="py-4 space-y-2 bg-white/[0.01] rounded-3xl border border-white/5 px-6">
                           <ReportLine label="(-) SAÍDAS TOTAIS" val={fmt(cashFlow.outflow.total)} neg color="text-rose-400" bold />
                           <ReportLine label="FOLHA DE PAGAMENTO" val={fmt(cashFlow.outflow.payroll)} indent neg icon={<Users size={10}/>} />
                           <ReportLine label="ENCARGOS SOCIAIS" val={fmt(cashFlow.outflow.social_charges)} indent neg />
                           <ReportLine label="P&D-PESQUISA E DESENVOLVIMENTO" val={fmt(cashFlow.outflow.rd)} indent neg />
                           <ReportLine label="CAMPANHAS DE MARKETING" val={fmt(cashFlow.outflow.marketing)} indent neg />
                           <ReportLine label="DISTRIBUIÇÃO DE PRODUTOS" val={fmt(cashFlow.outflow.distribution)} indent neg icon={<Truck size={10}/>} />
                           <ReportLine label="GASTOS COM ESTOCAGEM" val={fmt(cashFlow.outflow.storage)} indent neg icon={<Warehouse size={10}/>} />
                           <ReportLine label="PAGAMENTO A FORNECEDORES" val={fmt(cashFlow.outflow.suppliers)} indent neg />
                           <ReportLine label="DIVERSOS E ATRASOS GERAIS" val={fmt(cashFlow.outflow.misc)} indent neg />
                           <ReportLine label="COMPRA DE MÁQUINAS" val={fmt(cashFlow.outflow.machine_buy)} indent neg />
                           <ReportLine label="MANUTENÇÃO DE MÁQUINAS" val={fmt(cashFlow.outflow.maintenance)} indent neg />
                           <ReportLine label="AMORTIZAÇÃO DE EMPRÉSTIMOS" val={fmt(cashFlow.outflow.amortization)} indent neg />
                           <ReportLine label="MULTAS POR ATRASO" val={fmt(cashFlow.outflow.late_penalties)} indent neg />
                           <ReportLine label="JUROS BANCÁRIOS" val={fmt(cashFlow.outflow.interest)} indent neg />
                           <ReportLine label="TREINAMENTO" val={fmt(cashFlow.outflow.training)} indent neg />
                           <ReportLine label="IMPOSTO DE RENDA" val={fmt(cashFlow.outflow.taxes)} indent neg />
                           <ReportLine label="DISTRIBUIÇÃO DE DIVIDENDOS" val={fmt(cashFlow.outflow.dividends)} indent neg />
                        </div>

                        <div className="py-4">
                           <ReportLine label="(-) APLICAÇÃO FINANCEIRA" val={fmt(cashFlow.investment_apply)} neg color="text-blue-400" />
                        </div>

                        <div className="mt-8 pt-8 border-t-4 border-white/10">
                           <ReportLine label="(=) SALDO FINAL DO PERÍODO" val={fmt(cashFlow.final)} total bold highlight color={cashFlow.final < 0 ? "text-rose-500" : "text-emerald-400"} />
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-10 shadow-2xl space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Integridade Patrimonial</h4>
               <div className="space-y-6">
                  <CostDetail label="Patrimônio Líquido P00" val={fmt(activeTeam?.equity || 5055447)} />
                  <div className="flex justify-between items-center group">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resultado Período</span>
                    <span className={`text-sm font-mono font-black ${isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>{isLoss ? '-' : '+'}$ {fmt(Math.abs(dre.retained_profit))}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                     <span className="text-[8px] font-black text-slate-500 uppercase italic">Veredito do Auditor</span>
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isLoss ? 'bg-rose-600/10 text-rose-500' : 'bg-emerald-600/10 text-emerald-500'}`}>
                           {isLoss ? <Flame size={20}/> : <ShieldCheck size={20}/>}
                        </div>
                        <span className={`text-2xl font-black italic font-mono ${isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {isLoss ? 'EROSÃO PL' : 'ACUMULANDO'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-10 shadow-2xl space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 italic">Liquidez Imediata</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <span className="text-[9px] font-black text-slate-500 uppercase">Disponível</span>
                     <span className={`text-2xl font-mono font-black ${cashFlow.final < 0 ? 'text-rose-500' : 'text-white'}`}>$ {fmt(cashFlow.final)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${Math.min(100, (cashFlow.final / 500000) * 100)}%` }} />
                  </div>
               </div>
            </div>
         </aside>
      </div>
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
