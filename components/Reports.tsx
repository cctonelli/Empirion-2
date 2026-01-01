
import React, { useState } from 'react';
import { 
  FileText, User, Columns, Activity, Package, DollarSign, Zap, Users, Globe, ChevronDown, Download
} from 'lucide-react';

const Reports: React.FC = () => {
  const [reportMode, setReportMode] = useState<'collective' | 'individual'>('individual');
  const [selectedTeam, setSelectedTeam] = useState<number>(8);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Audit & Intelligence</h1>
          <p className="text-slate-500 font-medium">Arquivos contábeis e mercadológicos - Período Atual.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
           <button onClick={() => setReportMode('individual')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportMode === 'individual' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Relatório Individual</button>
           <button onClick={() => setReportMode('collective')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportMode === 'collective' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Relatório Coletivo</button>
        </div>
      </div>

      {reportMode === 'individual' ? (
        <div className="space-y-8 px-4">
           {/* Header do Relatório Individual */}
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">8</div>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Empresa 08 S/A</h2>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Relatório de Desempenho Operacional - Período 1</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Resultado do Período</span>
                    <span className="text-xl font-black text-emerald-400">+$ 73.926</span>
                 </div>
                 <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                    <Download size={20} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quadro 1: Evolução de Estoques */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <Package className="text-blue-600" size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Evolução de Estoques (Unid.)</h3>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                       <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                          <tr>
                             <th className="p-3 text-left">ITEM</th>
                             <th className="p-3 text-right">INICIAL</th>
                             <th className="p-3 text-right">COMPRAS</th>
                             <th className="p-3 text-right">CONSUMO</th>
                             <th className="p-3 text-right">FINAL</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                          <tr><td className="p-3">Matéria-Prima A</td><td className="p-3 text-right">30.900</td><td className="p-3 text-right">30.900</td><td className="p-3 text-right">30.900</td><td className="p-3 text-right font-black">30.900</td></tr>
                          <tr><td className="p-3">Matéria-Prima B</td><td className="p-3 text-right">20.600</td><td className="p-3 text-right">20.600</td><td className="p-3 text-right">20.600</td><td className="p-3 text-right font-black">20.600</td></tr>
                          <tr><td className="p-3">Produto Acabado</td><td className="p-3 text-right">0</td><td className="p-3 text-right">9.700</td><td className="p-3 text-right">9.700</td><td className="p-3 text-right font-black">0</td></tr>
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Quadro 2: Fluxo de Caixa Detalhado */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <DollarSign className="text-emerald-600" size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Fluxo de Caixa Operacional ($)</h3>
                 </div>
                 <div className="space-y-2">
                    <ReportLine label="SALDO INICIAL" value="170.000" />
                    <ReportLine label="VENDAS À VISTA" value="1.649.000" isPositive />
                    <ReportLine label="PAGAMENTO FORNECEDORES" value="(581.400)" isNegative />
                    <ReportLine label="FOLHA DE PAGAMENTO" value="(767.000)" isNegative />
                    <ReportLine label="MARKETING & DISTRIBUIÇÃO" value="(380.200)" isNegative />
                    <ReportLine label="SALDO FINAL" value="0" isBold />
                 </div>
              </div>

              {/* Quadro 3: RH & Máquinas */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2"><Users size={16} className="text-amber-500" /><h4 className="text-[10px] font-black uppercase tracking-widest">Recursos Humanos</h4></div>
                    <div className="space-y-2">
                       <MiniStat label="Empregados" value="500" />
                       <MiniStat label="Produtividade" value="0.97" />
                       <MiniStat label="Motivação" value="REGULAR" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-2"><Zap size={16} className="text-blue-500" /><h4 className="text-[10px] font-black uppercase tracking-widest">Máquinas (Capacidade)</h4></div>
                    <div className="space-y-2">
                       <MiniStat label="Tipo Alfa" value="5" />
                       <MiniStat label="Tipo Beta" value="0" />
                       <MiniStat label="Tipo Gama" value="0" />
                    </div>
                 </div>
              </div>

              {/* Quadro 4: Vendas por Região */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <Globe className="text-indigo-600" size={20} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Demanda & Vendas Regionais</h3>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {[1,2,3,4,5,6,7,8,9].map(i => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                         <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">R-0{i}</span>
                         <span className="text-xs font-black text-slate-900">{i === 9 ? '12.592' : '8.392'}</span>
                         <span className="block text-[8px] font-bold text-blue-600 mt-1">100% Attained</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="px-4">
           {/* Relatório Coletivo: Implementação similar ao individual mas com o grid de empresas v4.2 */}
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Participação de Mercado (%)</h2>
              <div className="h-[400px] flex items-end justify-between gap-4">
                 {[12, 15, 8, 14, 18, 11, 10, 12].map((h, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-4">
                      <div className="w-full bg-blue-600 rounded-t-xl transition-all hover:bg-blue-500 shadow-lg shadow-blue-100" style={{ height: `${h * 15}px` }}></div>
                      <span className="text-[10px] font-black text-slate-400">EMP {i+1}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ReportLine = ({ label, value, isPositive, isNegative, isBold }: any) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    <span className={`font-mono font-black text-xs ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : isBold ? 'text-slate-900 underline' : 'text-slate-700'}`}>
      {value}
    </span>
  </div>
);

const MiniStat = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-[9px] border-b border-slate-50 py-1">
    <span className="text-slate-400 font-bold uppercase">{label}:</span>
    <span className="text-slate-900 font-black">{value}</span>
  </div>
);

export default Reports;
