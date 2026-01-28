
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Landmark, Boxes, Loader2, Users, Cpu, Wrench, Clock, UserMinus, ShieldAlert, Heart, Flame, Factory, Database, Coins, Award, Zap, Sparkles, PieChart, Landmark as BankIcon,
  // Added missing ShieldCheck import
  ShieldCheck
} from 'lucide-react';
import { Branch, Championship, Team } from '../types';
import { getChampionships } from '../services/supabase';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

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
       details: { 
         cpp: 0, wac_pa: 0, rd_investment: 0, social_charges: 0, payroll_net: 0
       }
     };
  }, [activeTeam]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  const isLoss = dre.net_profit < 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto p-6">
      <header className="flex justify-between items-end px-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Arena: {activeArena?.name} • Ciclo DRE v28.0</p>
         </div>
         <div className="flex gap-6">
            <MetricSummary label="IR Provisionado" val={`$ ${fmt(dre.tax || 0)}`} icon={<BankIcon size={20}/>} />
            <MetricSummary label="Dividendos" val={`$ ${fmt(dre.dividends || 0)}`} icon={<Award size={20}/>} />
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-8 bg-slate-900 border border-white/5 rounded-[4rem] p-12 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">Demonstrativo de Resultados (DRE)</h3>
            <div className="space-y-1 font-mono">
               <ReportLine label="(+) RECEITAS BRUTAS DE VENDAS" val={fmt(dre.revenue)} bold />
               <ReportLine label="( - ) CUSTO PROD. VENDIDO - CPV" val={fmt(dre.cpv)} neg />
               <ReportLine label="( = ) LUCRO BRUTO" val={fmt(dre.gross_profit)} highlight />
               
               <div className="py-2 space-y-1 bg-white/[0.01] rounded-2xl border border-white/5 px-4 my-2">
                  <ReportLine label="( - ) DESPESAS OPERACIONAIS" val={fmt(dre.opex)} neg />
                  <ReportLine label="P&D - INOVAÇÃO" val={fmt(dre.details?.rd_investment || 0)} indent color="text-blue-400" />
               </div>

               <ReportLine label="( = ) LUCRO OPERACIONAL" val={fmt(dre.operating_profit)} bold />
               <ReportLine label="(+/-) RESULTADO FINANCEIRO" val={fmt(dre.financial_result || 0)} />

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
                           {/* ShieldCheck used here now has correct import */}
                           {isLoss ? <Flame size={20}/> : <ShieldCheck size={20}/>}
                        </div>
                        <span className={`text-2xl font-black italic font-mono ${isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {isLoss ? 'EROSÃO PL' : 'ACUMULANDO'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportLine = ({ label, val, neg, bold, total, highlight, indent, color }: any) => (
  <div className={`flex justify-between p-2 rounded-xl transition-all ${total ? 'bg-orange-600/10 border border-orange-500/20 mt-4' : highlight ? 'bg-white/5' : ''} ${indent ? 'pl-10 opacity-60' : ''}`}>
    <span className={`text-[9px] uppercase tracking-wider ${bold || total ? 'font-black' : 'text-slate-500'} ${color || ''}`}>{label}</span>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : total ? 'text-orange-500' : color || 'text-slate-200'}`}>
      {neg ? '(' : ''}$ {val}{neg ? ')' : ''}
    </span>
  </div>
);

const MetricSummary = ({ label, val, icon }: any) => (
  <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4">
    <div className="text-orange-500">{icon}</div>
    <div>
      <span className="block text-[8px] font-black text-slate-500 uppercase italic">{label}</span>
      <span className="text-xl font-mono font-black text-white">{val}</span>
    </div>
  </div>
);

const CostDetail = ({ label, val }: any) => (
  <div className="flex justify-between items-center group">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
    <span className="text-sm font-mono font-bold text-white">$ {val}</span>
  </div>
);

export default Reports;
