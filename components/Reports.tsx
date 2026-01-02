import React, { useState } from 'react';
import { 
  FileText, Activity, Package, DollarSign, Zap, Users, Globe, 
  Download, BarChart3, Landmark, ArrowRight, ShieldCheck, 
  Info, Award, Star, AlertTriangle, Heart, User, TrendingUp
} from 'lucide-react';
import { Branch } from '../types';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'market'>('individual');
  const [collectiveSubTab, setCollectiveSubTab] = useState<'bp' | 'dre' | 'vendas' | 'benchmark'>('vendas');

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={20} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Audit <span className="text-blue-500">Terminal</span>
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic">
            Engine v6.0 GOLD • Consolidado Fiscal P01
          </p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
           {[
             { id: 'individual', label: `Individual`, icon: User },
             { id: 'collective', label: 'Coletivos', icon: Globe },
             { id: 'market', label: 'Indicadores Global', icon: Landmark }
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

      {reportMode === 'individual' && <IndividualReport branch={branch as Branch} />}
      {reportMode === 'collective' && (
        <div className="space-y-8">
           <div className="flex flex-wrap gap-4 p-1.5 bg-slate-900 rounded-2xl border border-white/5 w-fit mx-auto">
              {['vendas', 'bp', 'dre', 'benchmark'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setCollectiveSubTab(tab as any)} 
                  className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    collectiveSubTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'vendas' ? 'Market Share' : tab === 'bp' ? 'Balanço Global' : tab === 'dre' ? 'DRE Consolidado' : 'Elite Benchmark'}
                </button>
              ))}
           </div>
           {collectiveSubTab === 'vendas' && <CollectiveSalesReport />}
           {collectiveSubTab === 'bp' && <CollectiveFinancialReport type="BP" />}
           {collectiveSubTab === 'dre' && <CollectiveFinancialReport type="DRE" />}
           {collectiveSubTab === 'benchmark' && <EliteBenchmarkReport />}
        </div>
      )}
      {reportMode === 'market' && <MarketIndicatorsPanel branch={branch as Branch} />}
    </div>
  );
};

const IndividualReport = ({ branch }: { branch: Branch }) => (
  <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-1000">
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
                    <ShieldCheck size={12} /> Auditoria P01 Validada
                 </span>
                 <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">Oracle Engine v6.0</span>
              </div>
           </div>
        </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-10 rounded-[3.5rem] space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20"><Package size={24} /></div>
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">Estrutura de Ativos</h3>
              </div>
           </div>
           <div className="space-y-4">
              <ReportLine label="CAIXA E EQUIVALENTES" value="1.000.000" isPositive />
              <ReportLine label="CONTAS A RECEBER" value="1.823.735" isPositive />
              <ReportLine label="ESTOQUES TOTAIS" value="0" />
              <ReportLine label="IMOBILIZADO LÍQUIDO" value="5.153.205" isBold />
              <div className="pt-4 border-t border-white/5">
                 <ReportLine label="TOTAL DO ATIVO" value="9.176.940" isBold />
              </div>
           </div>
        </div>

        <div className="premium-card p-10 rounded-[3.5rem] space-y-8">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20"><DollarSign size={24} /></div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">Demonstrativo de Resultados</h3>
           </div>
           <div className="space-y-4">
              <ReportLine label="RECEITA OPERACIONAL BRUTA" value="3.298.000" isPositive />
              <ReportLine label="CUSTO DA PRODUÇÃO" value="(2.390.400)" isNegative />
              <ReportLine label="LUCRO BRUTO" value="907.600" isPositive />
              <ReportLine label="DESPESAS OPERACIONAIS" value="(1.147.200)" isNegative />
              <div className="pt-4 border-t border-white/5">
                 <ReportLine label="LUCRO LÍQUIDO" value="73.926" isBold isPositive />
              </div>
           </div>
        </div>
     </div>
  </div>
);

const CollectiveSalesReport = () => (
  <div className="animate-in slide-in-from-right-4 duration-1000">
     <div className="premium-card p-12 rounded-[4rem] space-y-12 relative overflow-hidden group">
        <div className="relative z-10">
           <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic">Market Dynamics</h3>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Market Share Consolidado • Ciclo P01</p>
        </div>
        <div className="h-[400px] flex items-end justify-between gap-10 px-8 relative z-10">
           {[15.2, 12.8, 10.4, 14.1, 18.5, 12.0, 8.5, 8.5].map((h, i) => (
             <div key={i} className="flex-1 flex flex-col items-center gap-6 group">
                <div className="w-full bg-slate-800 rounded-t-3xl transition-all hover:bg-blue-600 shadow-2xl relative" style={{ height: `${h * 15}px` }}>
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl">
                      {h}%
                   </div>
                </div>
                <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase italic">EMP {i+1}</span>
             </div>
           ))}
        </div>
     </div>
  </div>
);

const CollectiveFinancialReport = ({ type }: { type: 'BP' | 'DRE' }) => (
  <div className="animate-in fade-in duration-700">
     <div className="premium-card rounded-[4rem] overflow-hidden">
        <div className="p-10 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
           <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">
             {type === 'BP' ? 'Balanço Global' : 'DRE Coletivo de Arena'}
           </h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-500 font-black uppercase border-b border-white/5">
                 <tr>
                    <th className="p-6 min-w-[280px]">RUBRICAS (Protocolo Empirion)</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <th key={i} className="p-6 text-right">EMP {i}</th>)}
                    <th className="p-6 text-right bg-blue-600 text-white">MÉDIA</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold text-slate-400">
                 {type === 'BP' ? (
                   <>
                    <tr className="hover:bg-white/5 transition-colors"><td className="p-6 font-bold text-slate-100">Disponível</td>{new Array(8).fill(0).map((_, i) => <td key={i} className="p-6 text-right font-mono">1.000.000</td>)}<td className="p-6 text-right font-mono bg-white/5">1.000.000</td></tr>
                    <tr className="hover:bg-white/5 transition-colors"><td className="p-6 font-bold text-slate-100">Ativo Realizável</td>{new Array(8).fill(0).map((_, i) => <td key={i} className="p-6 text-right font-mono">1.823.735</td>)}<td className="p-6 text-right font-mono bg-white/5">1.823.735</td></tr>
                    <tr className="bg-slate-900/60 text-white font-black"><td className="p-6 uppercase italic">TOTAL ATIVO</td>{new Array(8).fill(0).map((_, i) => <td key={i} className="p-6 text-right font-mono">9.176.940</td>)}<td className="p-6 text-right font-mono bg-blue-900/40">9.176.940</td></tr>
                   </>
                 ) : (
                   <>
                    <tr className="hover:bg-white/5 transition-colors"><td className="p-6 font-bold text-slate-100">Receita Líquida</td>{new Array(8).fill(0).map((_, i) => <td key={i} className="p-6 text-right font-mono">3.298.000</td>)}<td className="p-6 text-right font-mono bg-white/5">3.298.000</td></tr>
                    <tr className="bg-emerald-900/20 text-emerald-400 font-black"><td className="p-6 uppercase italic">LUCRO BRUTO</td>{new Array(8).fill(0).map((_, i) => <td key={i} className="p-6 text-right font-mono">907.600</td>)}<td className="p-6 text-right font-mono bg-emerald-900/40">907.600</td></tr>
                    <tr className="bg-blue-600 text-white font-black"><td className="p-6 uppercase italic">LUCRO LÍQUIDO</td>{new Array(8).fill(0).map((_, i) => <td key={i} className="p-6 text-right font-mono">73.926</td>)}<td className="p-6 text-right font-mono bg-white/10 italic">73.926</td></tr>
                   </>
                 )}
              </tbody>
           </table>
        </div>
     </div>
  </div>
);

const EliteBenchmarkReport = () => (
  <div className="space-y-8 animate-in slide-in-from-bottom-6">
     <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
        <div className="relative z-10 space-y-12">
           <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="p-5 bg-white/10 backdrop-blur-3xl rounded-3xl shadow-xl">
                 <Star size={40} className="fill-white text-white animate-pulse" />
              </div>
              <div>
                 <h3 className="text-4xl font-black uppercase tracking-tighter italic">Elite Benchmark Node</h3>
                 <p className="text-blue-200 font-medium">Performance Metrics vs Market Best in Class (v6.0 GOLD)</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <BenchmarkCard label="ROE Supremo" value="2.2%" target="15.0%" status="LOW" color="rose" />
              <BenchmarkCard label="Fidelidade Qualidade" value="88.2" target="95.0" status="GOOD" color="emerald" />
              <BenchmarkCard label="Brand Equity" value="82.5" target="85.0" status="HIGH" color="blue" />
              <BenchmarkCard label="OEE / Produtividade" value="94.2%" target="98.0%" status="EXCEL." color="emerald" />
           </div>
        </div>
     </div>
  </div>
);

const BenchmarkCard = ({ label, value, target, status, color }: any) => {
  const colorMap: any = {
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5'
  };

  return (
    <div className={`p-8 rounded-[3rem] border backdrop-blur-3xl transition-all hover:scale-105 ${colorMap[color]} space-y-4 shadow-2xl`}>
       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
       <div className="flex items-end justify-between">
          <span className="text-4xl font-black italic">{value}</span>
          <span className="text-[8px] font-black uppercase opacity-40">Target: {target}</span>
       </div>
       <div className="h-[2px] bg-white/10 w-full rounded-full overflow-hidden">
          <div className="h-full bg-current" style={{ width: '45%' }}></div>
       </div>
       <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest">{status} PERFORMANCE</span>
       </div>
    </div>
  );
};

const MarketIndicatorsPanel = ({ branch }: { branch: Branch }) => (
  <div className="space-y-8 animate-in slide-in-from-bottom-4">
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card p-12 rounded-[4rem] space-y-10 group">
           <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-4 italic">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl group-hover:rotate-12 transition-transform"><TrendingUp size={24} /></div>
              Market Exchange Node (Arena Pulse)
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col items-center group/item hover:bg-white hover:border-transparent transition-all hover:-translate-y-2 hover:shadow-2xl">
                   <span className="text-[9px] font-black text-slate-500 uppercase mb-3 group-hover/item:text-slate-400">EMPR 0{i}</span>
                   <span className="text-3xl font-black text-white font-mono group-hover/item:text-slate-950 italic">1,04</span>
                   <span className="text-[10px] font-black text-emerald-500 mt-2 bg-emerald-500/10 px-3 py-1 rounded-full">+4,2%</span>
                </div>
              ))}
           </div>
        </div>
        <div className="premium-card p-12 rounded-[4rem] flex flex-col justify-between border-2 border-slate-800">
           <div className="space-y-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Economic DNA</h3>
              <div className="space-y-6">
                 <MarketBox label="Inflação Setorial" value="1,00%" color="text-rose-400" />
                 <MarketBox label="TR Mensal" value="2,00%" color="text-blue-400" />
                 <MarketBox label="Custo Unitário Base" value="$ 180" color="text-white" />
                 <MarketBox label="Demanda Global" value="1,08x" color="text-emerald-400" />
              </div>
           </div>
           <div className="pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 text-slate-500">
                 <ShieldCheck size={20} className="text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Oracle Audit Active</span>
              </div>
           </div>
        </div>
     </div>
  </div>
);

const ReportLine = ({ label, value, isPositive, isNegative, isBold }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5 px-4 hover:bg-white/5 transition-colors group">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
    <span className={`font-mono font-black text-sm tracking-tighter ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : isBold ? 'text-white text-lg italic' : 'text-slate-300'}`}>
      {isNegative ? value : `$ ${value}`}
    </span>
  </div>
);

const MarketBox = ({ label, value, color }: any) => (
  <div className="flex justify-between items-center pb-6 border-b border-white/5 group">
     <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest group-hover:text-slate-300">{label}</span>
     <span className={`text-2xl font-black font-mono italic ${color}`}>{value}</span>
  </div>
);

export default Reports;
