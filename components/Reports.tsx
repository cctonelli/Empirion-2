
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  PieChart as PieChartIcon,
  Columns,
  User,
  Activity,
  DollarSign
} from 'lucide-react';

const Reports: React.FC = () => {
  const [reportMode, setReportMode] = useState<'collective' | 'individual'>('collective');
  const [selectedTeam, setSelectedTeam] = useState<number>(1);

  // MOCK DATA based on Image 1 (Relatório Coletivo 1)
  const collectiveData = {
    assets: [
      { label: 'CAIXA', values: [0, 0, 0, 0, 0, 0, 0, 0] },
      { label: 'CLIENTES', values: [1823735, 1823735, 1823735, 1823735, 1823735, 1823735, 1823735, 1823735] },
      { label: 'MÁQUINAS', values: [2360000, 2360000, 2360000, 2360000, 2360000, 2360000, 2360000, 2360000] },
      { label: 'PRÉDIOS E INST.', values: [5440000, 5440000, 5440000, 5440000, 5440000, 5440000, 5440000, 5440000] },
      { label: 'TOTAL ATIVO', values: [9176940, 9176940, 9176940, 9176940, 9176940, 9176940, 9176940, 9176940] },
    ],
    dre: [
      { label: 'RECEITA DE VENDAS', values: [3322735, 3322735, 3322735, 3322735, 3322735, 3322735, 3322735, 3322735] },
      { label: 'LUCRO BRUTO', values: [1044555, 1044555, 1044555, 1044555, 1044555, 1044555, 1044555, 1044555] },
      { label: 'LUCRO LÍQUIDO', values: [73926, 73926, 73926, 73926, 73926, 73926, 73926, 73926] },
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Financial Intelligence</h1>
          <p className="text-slate-500 mt-1 font-medium">Audit the empire's performance based on the Period 1 archives.</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
           <button 
            onClick={() => setReportMode('collective')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportMode === 'collective' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
           >
             <Columns size={14} className="inline mr-2" /> Collective
           </button>
           <button 
            onClick={() => setReportMode('individual')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportMode === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
           >
             <User size={14} className="inline mr-2" /> Individual
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {reportMode === 'collective' ? 'Relatório Coletivo - Balanço & DRE' : `Relatório Individual - Empresa ${selectedTeam}`}
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Period 1 | Bernard-Style Simulation</p>
           </div>
           {reportMode === 'individual' && (
             <select 
               value={selectedTeam} 
               onChange={e => setSelectedTeam(Number(e.target.value))}
               className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
             >
               {[1,2,3,4,5,6,7,8].map(i => <option key={i} value={i}>Team {i}</option>)}
             </select>
           )}
        </div>

        <div className="p-8 overflow-x-auto">
          {reportMode === 'collective' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400">
                  <th className="p-4 border-b border-slate-50">CONTA / ITEM</th>
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <th key={i} className="p-4 border-b border-slate-50 text-right">EMP {i}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="bg-slate-50/50"><td colSpan={9} className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">ATIVO (Balanço Patrimonial)</td></tr>
                {collectiveData.assets.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-600">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`p-4 text-xs font-mono text-right ${row.label === 'TOTAL ATIVO' ? 'font-black text-slate-900' : 'text-slate-500'}`}>
                        {v.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-slate-50/50"><td colSpan={9} className="p-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest">DRE (Resultado do Exercício)</td></tr>
                {collectiveData.dre.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-600">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`p-4 text-xs font-mono text-right ${row.label === 'LUCRO LÍQUIDO' ? 'font-black text-emerald-600' : 'text-slate-500'}`}>
                        {v.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Cash Flow ($)</h4>
                  <div className="space-y-3">
                     <ReportLine label="SALDO INICIAL" value="170,000" />
                     <ReportLine label="VENDAS À VISTA" value="1,649,000" color="text-emerald-600" />
                     <ReportLine label="FOLHA PAGAMENTO" value="(767,000)" color="text-red-600" />
                     <ReportLine label="MARKETING" value="(275,400)" color="text-red-600" />
                     <ReportLine label="SALDO FINAL" value="0" isBold />
                  </div>
               </div>
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Inventory Units</h4>
                  <div className="space-y-3">
                     <ReportLine label="MATÉRIA-PRIMA A" value="30,900" />
                     <ReportLine label="MATÉRIA-PRIMA B" value="20,600" />
                     <ReportLine label="PRODUTO ACABADO" value="0" />
                     <ReportLine label="VENDAS TOTAIS" value="9,700" isBold />
                  </div>
               </div>
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">HR & Resources</h4>
                  <div className="space-y-3">
                     <ReportLine label="TOTAL EMPREGADOS" value="500" />
                     <ReportLine label="PRODUTIVIDADE" value="0.97" />
                     <ReportLine label="MOTIVAÇÃO" value="REGULAR" color="text-amber-500" />
                     <ReportLine label="MÁQUINAS ALFA" value="5" isBold />
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportLine = ({ label, value, color = "text-slate-900", isBold = false }: any) => (
  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
    <span className="text-[10px] font-bold text-slate-500">{label}</span>
    <span className={`text-xs font-mono ${isBold ? 'font-black underline' : 'font-bold'} ${color}`}>{value}</span>
  </div>
);

export default Reports;
