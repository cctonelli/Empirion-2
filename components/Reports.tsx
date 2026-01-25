
import React, { useState, useMemo, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, BarChart3, Brain, ChevronRight, Landmark,
  ArrowUpRight, Target, Download, HeartPulse, Zap, Plus, Minus, Loader2, Factory, Users, Cpu, Boxes
} from 'lucide-react';
import { Branch, Championship, Team, AccountNode } from '../types';
import { motion } from 'framer-motion';
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
       revenue: 3322735,
       cpv: 2278180,
       gross_profit: 1044555,
       opex: 917582,
       operating_profit: 126973,
       plr: 12697,
       net_profit: 114276,
       details: { mp_ponderada: 1400000, mod_with_charges: 630000, depreciation: 120000, maintenance: 45000, storage: 83180, unit_cost: 235, social_charges_rate: 35 }
     };
  }, [activeTeam]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto p-6">
      <header className="flex justify-between items-end px-6">
         <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Oracle <span className="text-orange-500">Audit Node</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
              Arena: {activeArena?.name || 'ORACLE_UNLINKED'} • Controladoria Industrial
            </p>
         </div>
         <div className="flex items-center gap-6">
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-right">
               <span className="block text-[8px] font-black text-slate-500 uppercase italic">Motivação Equipe</span>
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{width: `${(activeTeam?.kpis?.motivation_index || 1) * 80}%`}} />
                  </div>
                  <span className="text-sm font-mono font-black text-white">{(activeTeam?.kpis?.motivation_index || 1.0).toFixed(2)}</span>
               </div>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4">
               <div className="text-right">
                  <span className="block text-[8px] font-black text-slate-500 uppercase italic">Custo Unitário</span>
                  <span className="text-xl font-mono font-black text-orange-500">$ {dre.details?.unit_cost?.toFixed(2)}</span>
               </div>
               <Boxes className="text-orange-500" size={24} />
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
         <div className="lg:col-span-8 space-y-8">
            <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] shadow-2xl space-y-8">
               <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Demonstrativo de Resultado (DRE)</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Unidade: {activeTeam?.name || 'ALPHA'}</span>
               </div>
               
               <div className="space-y-4 font-mono">
                  <ReportLine label="Receita Bruta de Vendas" val={fmt(dre.revenue)} bold />
                  
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-3 relative overflow-hidden">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.5em] mb-4 block italic">Custo do Produto Vendido (CPV Industrial)</span>
                    <ReportLine label="Insumos (MP CMP Ponderada)" val={fmt(dre.details?.mp_ponderada || 0)} neg />
                    <ReportLine label={`Mão de Obra Direta (Salários + Encargos: ${dre.details?.social_charges_rate || 35}%)`} val={fmt(dre.details?.mod_with_charges || 0)} neg />
                    <ReportLine label="Depreciação de Ativos (Máquinas/Prédios)" val={fmt(dre.details?.depreciation || 0)} neg />
                    <ReportLine label="Outros Custos (Manut./Estocagem)" val={fmt(dre.details?.maintenance || 0)} neg />
                  </div>

                  <ReportLine label="(=) LUCRO BRUTO" val={fmt(dre.gross_profit)} highlight />
                  <ReportLine label="(-) Despesas Operacionais (Vendas/Adm/P&D)" val={fmt(dre.opex)} neg />
                  
                  <ReportLine label="(=) LUCRO OPERACIONAL" val={fmt(dre.operating_profit)} bold />
                  <ReportLine label="(-) Participação nos Resultados (PLR/PPR Global)" val={fmt(dre.plr)} neg />
                  
                  <ReportLine label="(=) LUCRO LÍQUIDO DO EXERCÍCIO" val={fmt(dre.net_profit)} total />
               </div>
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-8">
            <div className="p-10 bg-slate-900 border border-white/10 rounded-[4rem] space-y-8 shadow-2xl relative overflow-hidden">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Estrutura de Margem</h4>
               <div className="space-y-6 relative z-10">
                  <CostMetric label="Margem Bruta" val={`${((dre.gross_profit / dre.revenue) * 100).toFixed(1)}%`} icon={<Zap size={16}/>} />
                  <CostMetric label="Peso Insumos" val={`${((dre.details?.mp_ponderada / dre.cpv) * 100).toFixed(1)}%`} icon={<Boxes size={16}/>} />
                  <CostMetric label="Peso Folha + Encargos" val={`${((dre.details?.mod_with_charges / dre.cpv) * 100).toFixed(1)}%`} icon={<Users size={16}/>} />
                  <div className="pt-6 border-t border-white/5">
                     <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed">
                        {`Os encargos sociais dinâmicos de ${dre.details?.social_charges_rate || 35}% impactam tanto o custo de produção quanto as despesas de vendas e administrativas.`}
                     </p>
                  </div>
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const ReportLine = ({ label, val, neg, bold, total, highlight }: any) => (
  <div className={`flex justify-between p-4 rounded-2xl transition-all ${total ? 'bg-slate-950 border-y-2 border-orange-500/20 mt-6 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : highlight ? 'bg-white/5 border border-white/5' : 'hover:bg-white/[0.02]'}`}>
    <span className={`text-[11px] uppercase tracking-wider ${bold ? 'font-black text-white' : total ? 'font-black text-orange-500' : 'text-slate-500'}`}>{label}</span>
    <span className={`text-sm font-black ${neg ? 'text-rose-500' : total ? 'text-orange-500' : 'text-slate-200'}`}>{neg ? '(' : ''}$ {val}{neg ? ')' : ''}</span>
  </div>
);

const CostMetric = ({ label, val, icon }: any) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
    <div className="flex items-center gap-3">
      <div className="text-slate-600 group-hover:text-orange-500 transition-colors">{icon}</div>
      <span className="text-[10px] font-black uppercase text-slate-500">{label}</span>
    </div>
    <span className="text-lg font-black text-white italic">{val}</span>
  </div>
);

export default Reports;
