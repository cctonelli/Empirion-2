
import React, { useState, useEffect } from 'react';
import { 
  FileText, Package, DollarSign, Users, Globe, 
  Landmark, User, History, TrendingUp,
  Activity, CheckCircle2, ShieldCheck,
  ChevronRight, BarChart3, ArrowRight,
  ChevronDown, Search
} from 'lucide-react';
import { Branch } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getChampionshipHistoricalData } from '../services/supabase';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'market'>('individual');
  const [selectedRound, setSelectedRound] = useState(0);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const champId = localStorage.getItem('active_champ_id');
      if (champId) {
        const { data } = await getChampionshipHistoricalData(champId, selectedRound);
        setHistoricalData(data || []);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [selectedRound]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={20} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Oracle <span className="text-blue-500">Audit Terminal</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-2xl border border-white/10 shadow-xl">
                <History size={16} className="text-orange-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Ciclo Auditado:</span>
                <select 
                  value={selectedRound} 
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="bg-transparent text-blue-400 font-black text-sm outline-none cursor-pointer"
                >
                  <option value={0} className="bg-slate-900">P00 - Seed Inicial</option>
                  <option value={1} className="bg-slate-900">P01 - Snapshot Alpha</option>
                  <option value={2} className="bg-slate-900">P02 - Operação Live</option>
                </select>
             </div>
          </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
           <ReportTab active={reportMode === 'individual'} onClick={() => setReportMode('individual')} icon={<User size={14}/>} label="Dossiê Individual" />
           <ReportTab active={reportMode === 'collective'} onClick={() => setReportMode('collective')} icon={<Globe size={14}/>} label="Matriz de Mercado" />
           <ReportTab active={reportMode === 'market'} onClick={() => setReportMode('market')} icon={<Landmark size={14}/>} label="Indicadores Macro" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${reportMode}-${selectedRound}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {reportMode === 'individual' && <FinancialView round={selectedRound} />}
          {reportMode === 'collective' && <MatrixReportView round={selectedRound} data={historicalData} />}
          {reportMode === 'market' && <HistoricalMatrixView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const FinancialView = ({ round }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
     <div className="lg:col-span-8 space-y-12">
        <FinancialSection title="Balanço Patrimonial" icon={<Package size={24}/>} color="blue" lines={[
           { l: "ATIVO TOTAL", v: "9.176.940", b: true },
           { l: "Disponibilidades (Caixa)", v: "840.200", indent: true },
           { l: "Contas a Receber (Próximo Período)", v: "1.823.735", indent: true },
           { l: "ESTOQUES MP & ACABADO", v: "1.466.605", b: true },
           { l: "IMOBILIZADO LÍQUIDO", v: "5.886.600", b: true },
           { l: "PASSIVO TOTAL + PL", v: "9.176.940", b: true },
           { l: "Contas a Pagar Fornecedores", v: "717.605", indent: true },
           { l: "Empréstimos Curto Prazo", v: "1.872.362", indent: true },
           { l: "PATRIMÔNIO LÍQUIDO", v: "5.055.447", b: true }
        ]} />

        <FinancialSection title="DRE - Resultado Econômico" icon={<DollarSign size={24}/>} color="emerald" lines={[
           { l: "RECEITA BRUTA DE VENDAS", v: "3.322.735", b: true },
           { l: "(-) Custo dos Prod. Vendidos", v: "2.278.180", neg: true },
           { l: "(=) LUCRO BRUTO", v: "1.044.555", b: true },
           { l: "(-) Despesas Operacionais", v: "957.582", neg: true },
           { l: "(=) LUCRO LÍQUIDO", v: "73.928", b: true, p: true }
        ]} />
     </div>
     <div className="lg:col-span-4 space-y-8">
        <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 space-y-6">
           <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><BarChart3 className="text-orange-500" /> KPIs de Performance</h3>
           <div className="space-y-6">
              <KpiIndicator label="ROI" val="12.4%" trend="+2.1%" />
              <KpiIndicator label="Market Share" val="12.5%" trend="Estável" />
              <KpiIndicator label="Solvência Geral" val="1.8x" trend="-0.1" />
           </div>
        </div>
        <div className="p-8 bg-orange-600/10 border border-orange-500/20 rounded-[3rem] space-y-4">
           <h4 className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Nota do Auditor</h4>
           <p className="text-xs text-slate-300 italic leading-relaxed">
             "A saúde financeira da Unidade 01 permanece estável no P0{round}. O turnover de RH impactou a produtividade em 2%, mas foi compensado pelo mix de marketing regional."
           </p>
        </div>
     </div>
  </div>
);

const MatrixReportView = ({ round, data }: { round: number, data: any[] }) => {
  const teams = data.length > 0 ? data : [
    { team_name: 'Unidade 01', net_profit: 73928, asset: 9176940, share: 12.5 },
    { team_name: 'Unidade 02', net_profit: 68450, asset: 9176940, share: 12.5 },
    { team_name: 'Unidade 03', net_profit: 71200, asset: 9176940, share: 12.5 },
    { team_name: 'Unidade 04', net_profit: 75900, asset: 9176940, share: 12.5 },
    { team_name: 'Unidade 05', net_profit: 69800, asset: 9176940, share: 12.5 },
    { team_name: 'Unidade 06', net_profit: 72150, asset: 9176940, share: 12.5 },
    { team_name: 'Unidade 07', net_profit: 70500, asset: 9176940, share: 12.5 },
    { team_name: 'Unidade 08', net_profit: 74300, asset: 9176940, share: 12.5 },
  ];

  return (
    <div className="bg-slate-900 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
       <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><Globe size={24}/></div>
             <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Matriz Coletiva P0{round}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Benchmarking Side-by-Side de Todas as Equipes</p>
             </div>
          </div>
          <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-blue-400 uppercase">
             Oracle Node 08 Sync
          </div>
       </div>

       <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
             <thead className="bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-white/5">
                <tr>
                   <th className="p-8">Equipe / Competidor</th>
                   <th className="p-8">Receita Bruta</th>
                   <th className="p-8">EBITDA</th>
                   <th className="p-8">Lucro Líquido</th>
                   <th className="p-8">Ativo Total</th>
                   <th className="p-8">Share %</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {teams.map((t, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-all group">
                     <td className="p-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                              <User size={18} />
                           </div>
                           <span className="font-black text-white uppercase italic">{t.team_name}</span>
                        </div>
                     </td>
                     <td className="p-8 font-mono text-sm text-slate-400">$ 3.322.735</td>
                     <td className="p-8 font-mono text-sm text-slate-400">$ 1.044.555</td>
                     <td className="p-8 font-mono text-sm font-black text-emerald-400">$ {t.net_profit.toLocaleString()}</td>
                     <td className="p-8 font-mono text-sm text-slate-400">$ {t.asset.toLocaleString()}</td>
                     <td className="p-8">
                        <div className="flex items-center gap-3">
                           <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${t.share}%` }} />
                           </div>
                           <span className="text-xs font-black text-blue-500">{t.share}%</span>
                        </div>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};

const ReportTab = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 transition-all whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
     {icon} {label}
  </button>
);

const FinancialSection = ({ title, icon, color, lines }: any) => (
  <div className="premium-card p-12 rounded-[4rem] bg-slate-900/60 border-white/5 space-y-10 shadow-2xl group">
     <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl text-white shadow-xl transition-transform group-hover:scale-110 ${color === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'}`}>{icon}</div>
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">{title}</h3>
     </div>
     <div className="space-y-1">
        {lines.map((ln: any, i: number) => (
           <div key={i} className={`flex justify-between items-center py-4 border-b border-white/5 px-6 hover:bg-white/5 transition-colors ${ln.b ? 'bg-white/[0.03]' : ''}`}>
              <span className={`text-[10px] uppercase tracking-widest ${ln.b ? 'font-black text-slate-300' : 'text-slate-500'} ${ln.indent ? 'pl-8' : ''}`}>{ln.l}</span>
              <span className={`font-mono font-black text-sm ${ln.p ? 'text-emerald-400' : ln.neg ? 'text-rose-400' : ln.color || 'text-slate-300'}`}>$ {ln.v}</span>
           </div>
        ))}
     </div>
  </div>
);

const KpiIndicator = ({ label, val, trend }: any) => (
  <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all">
     <div><span className="block text-[8px] font-black text-slate-500 uppercase mb-1">{label}</span><span className="text-xl font-black text-white italic">{val}</span></div>
     <span className="text-[10px] font-black text-emerald-500">{trend}</span>
  </div>
);

const HistoricalMatrixView = () => (
  <div className="bg-slate-950 rounded-[4rem] border border-white/5 p-24 text-center space-y-12 relative overflow-hidden">
     <Globe size={120} className="text-slate-800/20 mx-auto animate-[spin_20s_linear_infinite]" />
     <div className="space-y-4 relative z-10">
        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Indicadores Macro-Econômicos</h3>
        <p className="text-slate-500 font-medium max-w-xl mx-auto italic leading-relaxed text-lg">
           Visualize a evolução de Inflação, Taxas Selic/TR e Curva de Demanda regional que moldaram este campeonato.
        </p>
     </div>
     <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-full text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all">
        Sincronizar Indices Oracle
     </button>
  </div>
);

export default Reports;
