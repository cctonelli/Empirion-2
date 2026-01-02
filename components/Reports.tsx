
import React, { useState } from 'react';
import { 
  FileText, Package, DollarSign, Users, Globe, 
  Download, Landmark, ShieldCheck, 
  Info, Star, User, History, Search, Filter, Bot, TrendingUp
} from 'lucide-react';
import { Branch, TeamHistoricalData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'market'>('individual');
  const [collectiveSubTab, setCollectiveSubTab] = useState<'matrix' | 'vendas' | 'benchmark'>('matrix');
  const [selectedRound, setSelectedRound] = useState(1);
  const totalRoundsAvailable = 5;

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Archive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={20} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Audit <span className="text-blue-500">Terminal</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-white/10">
                <History size={14} className="text-orange-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Arquivo Histórico:</span>
                <select 
                  value={selectedRound} 
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="bg-transparent text-blue-400 font-black text-xs outline-none cursor-pointer"
                >
                  {Array.from({length: totalRoundsAvailable}, (_, i) => i + 1).map(r => (
                    <option key={r} value={r} className="bg-slate-900">Período {r}</option>
                  ))}
                  <option value={0} className="bg-slate-900">Período 0 (Inicial)</option>
                </select>
             </div>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
               Oracle Fidelity v6.0 • Consolidado P0{selectedRound}
             </p>
          </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
           {[
             { id: 'individual', label: `Meu Dashboard`, icon: User },
             { id: 'collective', label: 'Análise Concorrentes', icon: Globe },
             { id: 'market', label: 'Indicadores Globais', icon: Landmark }
           ].map(t => (
             <button 
               key={t.id}
               onClick={() => setReportMode(t.id as any)}
               className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                 reportMode === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
               }`}
             >
               <t.icon size={14} />
               {t.label}
             </button>
           ))}
        </div>
      </div>

      <div className="h-[1px] bg-gradient-to-r from-white/10 to-transparent w-full"></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${reportMode}-${selectedRound}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {reportMode === 'individual' && <IndividualReportView round={selectedRound} branch={branch} />}
          
          {reportMode === 'collective' && (
            <div className="space-y-8">
               <div className="flex flex-wrap gap-4 p-1.5 bg-slate-900 rounded-2xl border border-white/5 w-fit mx-auto">
                  {[
                    { id: 'matrix', label: 'Matriz Comparativa' },
                    { id: 'vendas', label: 'Market Share' },
                    { id: 'benchmark', label: 'Elite Benchmark' }
                  ].map(tab => (
                    <button 
                      key={tab.id} 
                      onClick={() => setCollectiveSubTab(tab.id as any)} 
                      className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        collectiveSubTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
               </div>
               {collectiveSubTab === 'matrix' && <HistoricalMatrixView round={selectedRound} />}
               {collectiveSubTab === 'vendas' && <CollectiveSalesReportView round={selectedRound} />}
               {collectiveSubTab === 'benchmark' && <EliteBenchmarkReportView round={selectedRound} />}
            </div>
          )}

          {reportMode === 'market' && <MarketIndicatorsPanel round={selectedRound} branch={branch} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const IndividualReportView = ({ round, branch }: any) => (
  <div className="space-y-8">
     <div className="premium-card p-12 rounded-[3.5rem] flex flex-col lg:flex-row justify-between items-center gap-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 p-20 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
           <ShieldCheck size={400} />
        </div>
        <div className="flex items-center gap-8 relative z-10">
           <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center font-black text-6xl italic text-white shadow-2xl transform rotate-3">8</div>
           <div className="space-y-2">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-white italic">Empresa 08 S/A</h2>
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                    <ShieldCheck size={12} /> Auditoria P0{round} Validada
                 </span>
                 <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">Build v6.0 GOLD</span>
              </div>
           </div>
        </div>
        <div className="flex gap-4 relative z-10">
           <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-slate-950 transition-all flex items-center gap-3">
              <Download size={16} /> Exportar P0{round}
           </button>
        </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FinancialSection title="Balanço Patrimonial" icon={<Package size={24}/>} color="blue" />
        <FinancialSection title="Demonstrativo de Resultados" icon={<DollarSign size={24}/>} color="emerald" />
     </div>
  </div>
);

const FinancialSection = ({ title, icon, color }: any) => (
  <div className="premium-card p-10 rounded-[3.5rem] space-y-8">
     <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl text-white shadow-lg ${color === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'}`}>{icon}</div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">{title}</h3>
     </div>
     <div className="space-y-4">
        <ReportLine label="ATIVO CIRCULANTE" value="2.823.735" isBold />
        <ReportLine label="CAIXA E EQUIVALENTES" value="1.000.000" />
        <ReportLine label="CONTAS A RECEBER" value="1.823.735" />
        <ReportLine label="ESTOQUES" value="0" />
        <ReportLine label="ATIVO NÃO CIRCULANTE" value="6.353.205" isBold />
        <div className="pt-4 border-t border-white/5">
           <ReportLine label="TOTAL DO ATIVO" value="9.176.940" isBold isPositive />
        </div>
     </div>
  </div>
);

const HistoricalMatrixView = ({ round }: { round: number }) => {
  const [activeMatrixTab, setActiveMatrixTab] = useState<'balance' | 'dre'>('balance');
  
  const teamsData: TeamHistoricalData[] = [
    { teamId: 't8', teamName: 'Empresa 08 (Você)', isUserTeam: true, isBot: false, financials: { balance_sheet: [], dre: [] } },
    { teamId: 't1', teamName: 'Equipe Alpha', isUserTeam: false, isBot: false, financials: { balance_sheet: [], dre: [] } },
    { teamId: 't2', teamName: 'Bot Conservador', isUserTeam: false, isBot: true, financials: { balance_sheet: [], dre: [] } },
    { teamId: 't3', teamName: 'Equipe Gamma', isUserTeam: false, isBot: false, financials: { balance_sheet: [], dre: [] } },
  ];

  const rows = activeMatrixTab === 'balance' ? [
    { label: 'Ativo Circulante', isTotal: true },
    { label: 'Disponível', isTotal: false },
    { label: 'Contas a Receber', isTotal: false },
    { label: 'Ativo Não Circulante', isTotal: true },
    { label: 'Imobilizado Líquido', isTotal: false },
    { label: 'TOTAL ATIVO', isTotal: true, highlight: true }
  ] : [
    { label: 'Receita Operacional Bruta', isTotal: true },
    { label: 'Deduções e Impostos', isTotal: false },
    { label: 'LUCRO BRUTO', isTotal: true, highlight: true },
    { label: 'Despesas Operacionais', isTotal: true },
    { label: 'LUCRO LÍQUIDO', isTotal: true, highlight: true }
  ];

  return (
    <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-8">
       <div className="flex items-center justify-between">
          <div className="flex gap-3 p-1 bg-slate-900 rounded-2xl border border-white/10">
             <button onClick={() => setActiveMatrixTab('balance')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeMatrixTab === 'balance' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Balanço Coletivo</button>
             <button onClick={() => setActiveMatrixTab('dre')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeMatrixTab === 'dre' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>DRE Coletivo</button>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                <input className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-[10px] font-bold text-white outline-none w-48" placeholder="Filtrar equipe..." />
             </div>
             <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><Filter size={14}/></button>
          </div>
       </div>

       <div className="premium-card rounded-[3.5rem] overflow-hidden border-2 border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto no-scrollbar">
             <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-500 font-black uppercase border-b border-white/10">
                   <tr>
                      <th className="p-8 min-w-[280px] sticky left-0 bg-slate-950 z-20 shadow-[10px_0_20px_rgba(0,0,0,0.2)]">Rubrica (Period {round})</th>
                      {teamsData.map(team => (
                        <th key={team.teamId} className={`p-8 text-center min-w-[200px] border-l border-white/5 ${team.isUserTeam ? 'bg-blue-600/10' : ''}`}>
                           <div className="flex flex-col items-center gap-2">
                              {team.isBot ? <Bot size={16} className="text-orange-500" /> : <User size={16} className="text-blue-400" />}
                              <span className={`tracking-widest ${team.isUserTeam ? 'text-blue-400' : 'text-white'}`}>{team.teamName}</span>
                              {team.isUserTeam && <span className="text-[7px] bg-blue-600 text-white px-2 py-0.5 rounded-full">Sua Empresa</span>}
                           </div>
                        </th>
                      ))}
                      <th className="p-8 text-center min-w-[150px] bg-slate-900/50 border-l border-white/5">Média Arena</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-bold text-slate-400">
                   {rows.map((row, idx) => (
                     <tr key={idx} className={`group hover:bg-white/[0.02] transition-colors ${row.highlight ? 'bg-white/[0.01]' : ''}`}>
                        <td className={`p-6 sticky left-0 z-10 transition-colors shadow-[10px_0_20px_rgba(0,0,0,0.1)] ${row.highlight ? 'bg-slate-900 text-white' : 'bg-slate-950'} ${row.isTotal ? 'font-black uppercase italic text-slate-300' : 'pl-12 font-medium text-slate-500'}`}>
                           {row.label}
                        </td>
                        {teamsData.map(team => (
                           <td key={team.teamId} className={`p-6 text-right font-mono border-l border-white/5 ${team.isUserTeam ? 'bg-blue-600/5' : ''} ${row.highlight ? 'text-white' : ''}`}>
                              {idx === rows.length - 1 ? '$ 9.176.940' : '$ 1.000.000'}
                           </td>
                        ))}
                        <td className="p-6 text-right font-mono bg-slate-900/30 border-l border-white/5">$ 8.450.000</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[3rem] flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
             <Info size={24} />
          </div>
          <div>
             <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Protocolo de Transparência Identificada</h4>
             <p className="text-xs text-blue-200 opacity-70 leading-relaxed mt-1">O tutor definiu o nível de transparência como <span className="text-blue-400 font-bold uppercase">Full Oracle</span>. Todos os nomes de equipes e rubricas detalhadas estão expostos para auditoria competitiva.</p>
          </div>
       </div>
    </div>
  );
};

const CollectiveSalesReportView = ({ round }: any) => (
  <div className="premium-card p-12 rounded-[4rem] text-center space-y-10">
     <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Market Share P0{round}</h3>
     <div className="h-[400px] flex items-end justify-between gap-6 px-10">
        {[15, 12, 18, 10, 14, 12, 10, 9].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-4">
             <div className="w-full bg-blue-600 rounded-t-2xl shadow-2xl relative group" style={{ height: `${h * 15}px` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-slate-950 px-2 py-1 rounded-lg text-[10px] font-black transition-opacity">{h}%</div>
             </div>
             <span className="text-[9px] font-black text-slate-500 uppercase">EMP 0{i+1}</span>
          </div>
        ))}
     </div>
  </div>
);

const EliteBenchmarkReportView = ({ round }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
     <BenchmarkCard label="ROE Supremo" value="15.2%" status="GOOD" />
     <BenchmarkCard label="Margem Ebitda" value="22.8%" status="ELITE" />
     <BenchmarkCard label="Brand Equity" value="88.4" status="HIGH" />
     <BenchmarkCard label="OEE / Prod." value="94.2%" status="OPTIM." />
  </div>
);

const BenchmarkCard = ({ label, value, status }: any) => (
  <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-4">
     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
     <div className="text-4xl font-black text-white italic">{value}</div>
     <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest w-fit border border-emerald-500/20">{status}</div>
  </div>
);

const MarketIndicatorsPanel = ({ round, branch }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     <div className="lg:col-span-2 premium-card p-12 rounded-[4rem] space-y-10">
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
           <TrendingUp className="text-blue-500" /> Market Dynamics P0{round}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[1,2,3,4,5,6,7,8].map(i => (
             <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase">EMP 0{i}</span>
                <span className="block text-2xl font-black text-white font-mono italic">1,04</span>
                <span className="text-[9px] text-emerald-500 font-bold">+4,2%</span>
             </div>
           ))}
        </div>
     </div>
     <div className="premium-card p-12 rounded-[4rem] space-y-8">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Macro DNA</h3>
        <div className="space-y-6">
           <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-slate-500">Inflação P0{round}</span>
              <span className="font-mono font-black text-rose-400">1,00%</span>
           </div>
           <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-slate-500">TR Mensal</span>
              <span className="font-mono font-black text-blue-400">2,00%</span>
           </div>
           <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-slate-500">Demanda Global</span>
              <span className="font-mono font-black text-emerald-400">1,12x</span>
           </div>
        </div>
     </div>
  </div>
);

const ReportLine = ({ label, value, isPositive, isNegative, isBold }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5 px-4 hover:bg-white/5 transition-colors group">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
    <span className={`font-mono font-black text-sm tracking-tighter ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : isBold ? 'text-white text-lg italic' : 'text-slate-300'}`}>
      $ {value}
    </span>
  </div>
);

export default Reports;
