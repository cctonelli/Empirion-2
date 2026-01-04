
import React, { useState, useEffect } from 'react';
import { 
  FileText, Package, DollarSign, Globe, User, History, 
  TrendingUp, Activity, BarChart3, Database, ShieldAlert,
  Zap, Brain, ChevronRight, Scale, Landmark, Cpu, AlertTriangle,
  ArrowUpRight, Target, Users, Download, Maximize2, Filter
} from 'lucide-react';
import { Branch, Championship, Team } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getChampionshipHistoricalData, getChampionships } from '../services/supabase';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'matrix'>('individual');
  const [selectedRound, setSelectedRound] = useState(0);
  const [arena, setArena] = useState<Championship | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArenaAndHistory = async () => {
      setIsLoading(true);
      const champId = localStorage.getItem('active_champ_id');
      if (champId) {
        const { data: champs } = await getChampionships();
        const found = champs?.find(c => c.id === champId);
        if (found) setArena(found);

        const { data } = await getChampionshipHistoricalData(champId, selectedRound);
        setHistoricalData(data || []);
      }
      setIsLoading(false);
    };
    fetchArenaAndHistory();
  }, [selectedRound, reportMode]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20 max-w-[1800px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 text-white">
               <FileText size={32} />
            </div>
            <div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Oracle <span className="text-orange-500">Audit Node</span></h1>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Industrial mastery full fidelity • build 7.5</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-2xl border border-white/10 shadow-xl">
                <History size={16} className="text-blue-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Snap:</span>
                <select value={selectedRound} onChange={(e) => setSelectedRound(Number(e.target.value))} className="bg-transparent text-orange-500 font-black text-sm outline-none cursor-pointer">
                  <option value={0} className="bg-slate-900">ROUND 00 - Snapshot Inicial</option>
                  <option value={1} className="bg-slate-900">ROUND 01 - Consolidação</option>
                  <option value={2} className="bg-slate-900">ROUND 02 - Evolução</option>
                </select>
             </div>
             {isLoading && <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase animate-pulse"><Database size={12}/> Syncing...</div>}
          </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900 rounded-3xl border border-white/5 shadow-2xl">
           <ReportTab active={reportMode === 'individual'} onClick={() => setReportMode('individual')} icon={<User size={14}/>} label="Dossiê Unidade" />
           <ReportTab active={reportMode === 'collective'} onClick={() => setReportMode('collective')} icon={<Globe size={14}/>} label="Indicadores Arena" />
           <ReportTab active={reportMode === 'matrix'} onClick={() => setReportMode('matrix')} icon={<BarChart3 size={14}/>} label="Matriz 8 Equipes" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${reportMode}-${selectedRound}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6">
          {reportMode === 'individual' && <IndividualReportView round={selectedRound} arena={arena} />}
          {reportMode === 'collective' && <CollectiveReportView round={selectedRound} arena={arena} historical={historicalData} />}
          {reportMode === 'matrix' && <FullMatrixBenchmarking round={selectedRound} arena={arena} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// RELATÓRIO INDIVIDUAL (PDF INDIVIDUAL 1 & 2 Legado)
const IndividualReportView = ({ round, arena }: any) => {
  const teamId = localStorage.getItem('active_team_id');
  const teamName = arena?.teams?.find((t: any) => t.id === teamId)?.name || 'Sua Unidade Industrial';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
       <div className="lg:col-span-8 space-y-10">
          {/* BP INDUSTRIAL OVERHAUL */}
          <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] space-y-12 shadow-2xl">
             <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div className="space-y-1">
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Documento Auditado P0{round}</span>
                   <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                     <div className="p-3 bg-blue-600 rounded-xl shadow-xl"><Package size={28}/></div> {teamName}
                   </h2>
                </div>
                <div className="text-right">
                   <div className="text-5xl font-black text-orange-500 italic leading-none">9.176.940</div>
                   <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">ATIVO TOTAL CONSOLIDADO ($)</span>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-6">
                   <h4 className="text-[12px] font-black uppercase text-blue-400 tracking-[0.3em] italic">1. ATIVOS (OEE CORE)</h4>
                   <div className="space-y-1 text-[11px]">
                      <FinLine label="1.1 ATIVO CIRCULANTE" val="3.290.340" bold />
                      <FinLine label="Disponibilidades (Caixa/Bancos)" val="840.200" indent />
                      <FinLine label="Aplicações Financeiras" val="0" indent />
                      <FinLine label="Contas a Receber (T+1)" val="1.823.735" indent b />
                      <FinLine label="Estoque Matéria-Prima A" val="628.545" indent />
                      <FinLine label="Estoque Matéria-Prima B" val="838.060" indent />
                      <FinLine label="Estoque Prod. Acabados" val="0" indent />
                      
                      <FinLine label="1.2 ATIVO NÃO CIRCULANTE" val="5.886.600" bold className="mt-6" />
                      <FinLine label="Máquinas e Equipamentos" val="2.360.000" indent />
                      <FinLine label="(-) Depreciação Acumulada Máq." val="-811.500" indent neg />
                      <FinLine label="Prédios e Instalações" val="5.440.000" indent />
                      <FinLine label="(-) Depreciação Acumulada Prédios" val="-2.301.900" indent neg />
                      
                      <div className="mt-8 pt-4 border-t-2 border-white/10 flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                         <span className="text-[12px] font-black text-white uppercase italic">TOTAL DO ATIVO</span>
                         <span className="text-xl font-mono font-black text-blue-400">$ 9.176.940</span>
                      </div>
                   </div>
                </div>
                
                <div className="space-y-6">
                   <h4 className="text-[12px] font-black uppercase text-rose-400 tracking-[0.3em] italic">2. PASSIVOS & PL</h4>
                   <div className="space-y-1 text-[11px]">
                      <FinLine label="2.1 PASSIVO CIRCULANTE" val="4.121.493" bold />
                      <FinLine label="Fornecedores (Insumos/Máq)" val="717.605" indent />
                      <FinLine label="Empréstimos Curto Prazo" val="1.872.362" indent />
                      <FinLine label="Dividendos a Pagar" val="18.481" indent />
                      <FinLine label="IR a Pagar" val="13.045" indent />
                      
                      <FinLine label="2.2 EXIGÍVEL LONGO PRAZO" val="1.500.000" bold className="mt-6" />
                      <FinLine label="Financiamentos BDI" val="1.500.000" indent />
                      
                      <FinLine label="2.3 PATRIMÔNIO LÍQUIDO" val="5.055.447" bold className="mt-6" />
                      <FinLine label="Capital Social" val="5.000.000" indent />
                      <FinLine label="Lucros Acumulados" val="55.447" indent />
                      
                      <div className="mt-8 pt-4 border-t-2 border-white/10 flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                         <span className="text-[12px] font-black text-white uppercase italic">TOTAL DO PASSIVO + PL</span>
                         <span className="text-xl font-mono font-black text-rose-400">$ 9.176.940</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* DRE INDUSTRIAL OVERHAUL */}
          <div className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] space-y-10 shadow-2xl">
             <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4 border-b border-white/5 pb-8">
               <div className="p-3 bg-emerald-600 rounded-xl shadow-xl"><DollarSign size={28}/></div> Demonstração do Resultado (DRE)
             </h2>
             <div className="max-w-4xl space-y-1 text-[13px]">
                <FinLine label="RECEITA BRUTA DE VENDAS" val="3.322.735" bold />
                <FinLine label="(-) Custo dos Produtos Vendidos (CPV)" val="2.278.180" neg />
                <FinLine label="(=) LUCRO BRUTO" val="1.044.555" total className="bg-white/5 px-6 my-2" />
                <FinLine label="(-) Despesas Operacionais" val="957.582" />
                <FinLine label="Despesas de Vendas & Marketing" val="802.702" indent />
                <FinLine label="Despesas Administrativas" val="114.880" indent />
                <FinLine label="Despesas Financeiras Líquidas" val="40.000" indent />
                <FinLine label="(=) LUCRO OPERACIONAL (EBIT)" val="86.973" bold className="mt-4 border-t border-white/5 pt-2" />
                <FinLine label="(-) Provisão Imposto de Renda (15%)" val="13.045" neg />
                <FinLine label="(=) LUCRO LÍQUIDO DO PERÍODO" val="73.928" total highlight className="mt-6 border-t-2 border-white/10 pt-6" />
             </div>
          </div>
       </div>

       {/* SIDEBAR ANALYTICS */}
       <div className="lg:col-span-4 space-y-8">
          <div className="bg-indigo-900/20 border border-indigo-500/20 p-10 rounded-[4rem] space-y-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-all"><Brain size={140}/></div>
             <div className="flex items-center gap-3">
                <Zap size={24} className="text-indigo-400 animate-pulse" />
                <h3 className="text-2xl font-black text-indigo-400 uppercase italic tracking-tighter">Strategos Advisor</h3>
             </div>
             <p className="text-lg text-slate-300 font-medium italic leading-relaxed">
                {round === 0 ? (
                   `"Unidade ${teamName}: Todas as equipes iniciam o Round 0 em paridade absoluta. Seu Ativo Total de $ 9.176.940 é composto por 64% de Imobilizado. No P1, sua prioridade é o Giro de Estoque para proteger os $ 840.200 em caixa."`
                ) : (
                   `"Análise do Round ${round}: O CPV consumiu uma fatia significativa da sua margem. Recomendamos revisar o preço regional na Região 09, onde a demanda é elástica e sua Unidade perdeu 2% de Share."`
                )}
             </p>
          </div>
          <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
             <h3 className="text-xl font-black text-white uppercase italic border-b border-white/5 pb-6">Benchmarking Audit Profile</h3>
             <div className="space-y-8">
                <KpiStat label="Liquidez Corrente" val="0.74x" color="rose" trend="CRÍTICO" />
                <KpiStat label="Endividamento Total" val="45.1%" color="amber" trend="MÉDIO" />
                <KpiStat label="Margem Líquida" val="2.22%" color="emerald" trend="ESTÁVEL" />
                <KpiStat label="Giro de Estoque" val="1.55x" color="blue" trend="IDEAL" />
             </div>
          </div>
       </div>
    </div>
  );
};

// MATRIZ COMPLETA (BENCHMARKING 8 EMPRESAS LADO A LADO - Legado Full)
const FullMatrixBenchmarking = ({ round, arena }: any) => {
  const teams = arena?.teams || [];
  
  return (
    <div className="space-y-10 animate-in zoom-in-95 duration-500">
       <header className="flex justify-between items-end px-4">
          <div>
             <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Empire <span className="text-orange-500">Comparison Matrix</span></h2>
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em] mt-3 italic">Benchmarking simultâneo das 8 unidades industriais • Round 0{round}</p>
          </div>
          <div className="flex gap-4">
             <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 flex items-center gap-3 font-black text-[10px] uppercase hover:text-white transition-all shadow-xl">
                <Download size={16}/> Export Full Snapshot
             </button>
             <button className="p-4 bg-orange-600 text-white rounded-2xl shadow-xl hover:bg-white hover:text-orange-600 transition-all"><Maximize2 size={20}/></button>
          </div>
       </header>

       <div className="bg-slate-900 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] sticky top-0 z-20">
                   <tr className="border-b border-white/10">
                      <th className="p-10 border-r border-white/5 bg-slate-950 sticky left-0 z-30 min-w-[320px]">ESTRUTURA CONTÁBIL ($)</th>
                      {teams.map((t: Team, i: number) => (
                        <th key={t.id} className="p-10 min-w-[240px] border-r border-white/5 text-center">
                           <div className="text-orange-500 italic text-lg mb-1">{t.name}</div>
                           <div className="text-[8px] font-black opacity-30 tracking-[0.4em] uppercase">Unidade Operacional 0{i+1}</div>
                        </th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[12px] font-mono">
                   <MatrixRow label="RECEITA BRUTA VENDAS" teams={teams} val="3.322.735" bold />
                   <MatrixRow label="(-) CPV INDUSTRIAL" teams={teams} val="2.278.180" neg />
                   <MatrixRow label="(=) LUCRO BRUTO" teams={teams} val="1.044.555" highlight />
                   <MatrixRow label="(-) DESPESAS OPERACIONAIS" teams={teams} val="957.582" />
                   <MatrixRow label="LUCRO OPERACIONAL (EBIT)" teams={teams} val="86.973" bold />
                   <MatrixRow label="LUCRO LÍQUIDO DO PERÍODO" teams={teams} val="73.928" total highlight />
                   <tr className="bg-white/10"><td colSpan={teams.length + 1} className="p-2 border-y border-white/5"></td></tr>
                   <MatrixRow label="ATIVO TOTAL CONSOLIDADO" teams={teams} val="9.176.940" bold />
                   <MatrixRow label="ATIVO CIRCULANTE" teams={teams} val="3.290.340" />
                   <MatrixRow label="CAIXA & BANCOS" teams={teams} val="840.200" indent />
                   <MatrixRow label="ESTOQUES TOTAIS" teams={teams} val="1.466.605" indent />
                   <MatrixRow label="CONTAS A RECEBER" teams={teams} val="1.823.735" indent />
                   <MatrixRow label="IMOBILIZADO LÍQUIDO" teams={teams} val="5.886.600" />
                   <tr className="bg-white/10"><td colSpan={teams.length + 1} className="p-2 border-y border-white/5"></td></tr>
                   <MatrixRow label="PASSIVO TOTAL" teams={teams} val="4.121.493" bold />
                   <MatrixRow label="EXIGÍVEL CP" teams={teams} val="2.241.288" indent />
                   <MatrixRow label="PATRIMÔNIO LÍQUIDO" teams={teams} val="5.055.447" highlight />
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

const CollectiveReportView = ({ round, arena, historical }: any) => {
   // Replicando Coletivo 1 & 2 Legado (Dashboard Dashboard)
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10">
            <div className="space-y-2">
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Ranking de Eficiência</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Baseado em Lucro Líquido Acumulado</p>
            </div>
            <div className="space-y-6">
               {arena?.teams?.map((t: any, i: number) => (
                 <div key={t.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[2.5rem] group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-6">
                       <span className="text-2xl font-black text-slate-700 italic">0{i+1}</span>
                       <span className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-emerald-400 transition-colors">{t.name}</span>
                    </div>
                    <div className="text-right">
                       <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Lucro Líquido</span>
                       <span className="text-xl font-black text-emerald-400 italic font-mono">$ 73.928</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         
         <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col justify-between space-y-12">
            <div className="space-y-2">
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Market Pulse Insight</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Snapshot Operacional da Arena</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
               <MarketCard label="Estrategistas" val="08 Units" icon={<Users size={24}/>} />
               <MarketCard label="Volume Global" val="$ 73.4M" icon={<TrendingUp size={24}/>} />
               <MarketCard label="Share de Referência" val="12.5%" icon={<Target size={24}/>} />
               <MarketCard label="Oracle Sync" val="Build 7.5" icon={<Activity size={24}/>} />
            </div>
            <div className="p-8 bg-blue-600 rounded-[3rem] shadow-2xl relative overflow-hidden group">
               <Globe size={140} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" />
               <h4 className="text-xl font-black text-white uppercase italic italic">Cenário Macroeconômico</h4>
               <p className="text-sm text-blue-100 font-bold mt-4 leading-relaxed uppercase">Todas as unidades iniciam o P0 em paridade. O motor industrial prevê reajustes de 2% em MP-A no Round 1.</p>
            </div>
         </div>
      </div>
   );
};

// COMPONENTES ATÔMICOS DE TABELA (SINTAXE FIDELIDADE)
const FinLine = ({ label, val, indent, bold, neg, total, highlight, className }: any) => (
  <div className={`flex justify-between py-4 px-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${bold ? 'font-black text-slate-200' : 'text-slate-400'} ${className || ''} ${highlight ? 'bg-orange-600/10 text-orange-400 border-orange-500/20' : ''} ${total ? 'bg-slate-950 font-black text-white py-6 border-y-2 border-white/10' : ''}`}>
     <span className={`${indent ? 'pl-10 text-[10px]' : ''} uppercase tracking-tight`}>{label}</span>
     <span className={`font-mono text-base ${neg ? 'text-rose-500 font-bold' : highlight ? 'text-orange-500' : 'text-slate-200'}`}>
        {neg && '('}$ {val}{neg && ')'}
     </span>
  </div>
);

const MatrixRow = ({ label, teams, val, bold, neg, highlight, total, indent }: any) => (
  <tr className={`hover:bg-white/[0.03] transition-all group ${bold ? 'font-black text-slate-200 bg-white/[0.02]' : 'text-slate-500'} ${total ? 'bg-slate-950' : ''}`}>
     <td className={`p-8 border-r border-white/5 sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 uppercase tracking-tighter text-[11px] ${highlight ? 'text-orange-500 italic' : ''} ${indent ? 'pl-16 italic text-[9px]' : ''}`}>
        {label}
     </td>
     {teams.map((t: any) => (
       <td key={t.id} className="p-8 border-r border-white/5 text-center font-mono text-base">
          <span className={`${neg ? 'text-rose-500 font-bold' : highlight ? 'text-orange-400 font-black' : ''}`}>
             {neg && '('}$ {val}{neg && ')'}
          </span>
       </td>
     ))}
  </tr>
);

const ReportTab = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 transition-all whitespace-nowrap active:scale-95 ${active ? 'bg-white text-slate-900 shadow-2xl scale-105' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>{icon} {label}</button>
);

const KpiStat = ({ label, val, trend, color }: any) => (
  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-white/20 transition-all">
     <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     <div className="flex justify-between items-end">
        <span className="text-4xl font-black text-white italic font-mono leading-none tracking-tighter">{val}</span>
        <span className={`text-[11px] font-black uppercase tracking-widest border-b-2 ${color === 'rose' ? 'text-rose-500 border-rose-500' : color === 'amber' ? 'text-amber-500 border-amber-500' : 'text-emerald-500 border-emerald-500'}`}>{trend}</span>
     </div>
  </div>
);

const MarketCard = ({ label, val, icon }: any) => (
   <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-6 hover:bg-white/10 hover:border-orange-500/20 transition-all shadow-xl group">
      <div className="p-4 bg-white/5 rounded-2xl w-fit text-orange-500 shadow-xl group-hover:bg-orange-600 group-hover:text-white transition-all">{icon}</div>
      <div>
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
         <div className="text-3xl font-black text-white italic tracking-tighter">{val}</div>
      </div>
   </div>
);

export default Reports;
