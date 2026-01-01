
import React, { useState } from 'react';
import { 
  FileText, Activity, Package, DollarSign, Zap, Users, Globe, 
  ChevronDown, Download, BarChart3, TrendingUp, Landmark, ArrowRight, Table as TableIcon,
  ShieldCheck, User, Newspaper, Building2
} from 'lucide-react';

const Reports: React.FC = () => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'market'>('individual');
  const [collectiveSubTab, setCollectiveSubTab] = useState<'bp' | 'dre' | 'vendas'>('vendas');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
             <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                <FileText size={24} />
             </div>
             Audit Node
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Relatórios Auditados - Período Atual: 01</p>
        </div>
        
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200 shadow-inner">
           {[
             { id: 'individual', label: 'Indiv. (Emp 8)', icon: User },
             { id: 'collective', label: 'Coletivos', icon: Globe },
             { id: 'market', label: 'CVM & Macro', icon: Landmark }
           ].map(t => (
             <button 
               key={t.id}
               onClick={() => setReportMode(t.id as any)}
               className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                 reportMode === t.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {t.label}
             </button>
           ))}
        </div>
      </div>

      {reportMode === 'individual' && <IndividualReport />}
      {reportMode === 'collective' && (
        <div className="space-y-8">
           <div className="flex gap-4 p-1 bg-white rounded-2xl border border-slate-100 w-fit mx-auto shadow-sm">
              <button onClick={() => setCollectiveSubTab('vendas')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${collectiveSubTab === 'vendas' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Vendas Relativas</button>
              <button onClick={() => setCollectiveSubTab('bp')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${collectiveSubTab === 'bp' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Balanço Coletivo</button>
              <button onClick={() => setCollectiveSubTab('dre')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${collectiveSubTab === 'dre' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>DRE Coletivo</button>
           </div>
           {collectiveSubTab === 'vendas' && <CollectiveSalesReport />}
           {collectiveSubTab === 'bp' && <CollectiveFinancialReport type="BP" />}
           {collectiveSubTab === 'dre' && <CollectiveFinancialReport type="DRE" />}
        </div>
      )}
      {reportMode === 'market' && <MarketIndicatorsPanel />}
      
      <footer className="pt-10 border-t border-slate-100 flex justify-center">
         <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Empirion v4.9.0 - Bernard Fidelity Build</span>
      </footer>
    </div>
  );
};

const IndividualReport = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
     <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 p-20 opacity-5 pointer-events-none">
           <Zap size={300} />
        </div>
        <div className="flex items-center gap-8 relative z-10">
           <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-2xl">8</div>
           <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Empresa 08 S/A</h2>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                 <ShieldCheck size={14} /> Relatório Individual - P01 - Bernard Legacy
              </p>
           </div>
        </div>
        <div className="flex items-center gap-8 relative z-10">
           <div className="text-right">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status de Operação</span>
              <span className="text-2xl font-black text-emerald-400 uppercase">Regular</span>
           </div>
           <button className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all shadow-xl">
              <Download size={24} />
           </button>
        </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center gap-3">
              <Package className="text-blue-600" size={24} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Evolução de Estoques (Unid.)</h3>
           </div>
           <div className="overflow-x-auto rounded-2xl border border-slate-50">
              <table className="w-full text-left text-[11px]">
                 <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                    <tr>
                       <th className="p-4">Item Patrimonial</th>
                       <th className="p-4 text-right">Inicial</th>
                       <th className="p-4 text-right">Compras</th>
                       <th className="p-4 text-right">Consumo</th>
                       <th className="p-4 text-right">Final</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                    <tr><td className="p-4">Matéria-Prima A</td><td className="p-4 text-right">30.900</td><td className="p-4 text-right">30.900</td><td className="p-4 text-right">30.900</td><td className="p-4 text-right font-black text-blue-600">30.900</td></tr>
                    <tr><td className="p-4">Matéria-Prima B</td><td className="p-4 text-right">20.600</td><td className="p-4 text-right">20.600</td><td className="p-4 text-right">20.600</td><td className="p-4 text-right font-black text-blue-600">20.600</td></tr>
                    <tr><td className="p-4">Produto Acabado</td><td className="p-4 text-right">0</td><td className="p-4 text-right">9.700</td><td className="p-4 text-right">9.700</td><td className="p-4 text-right font-black text-blue-600">0</td></tr>
                 </tbody>
              </table>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center gap-3">
              <DollarSign className="text-emerald-600" size={24} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Fluxo de Caixa Operacional ($)</h3>
           </div>
           <div className="space-y-4">
              <ReportLine label="SALDO INICIAL DISPONÍVEL" value="170.000" />
              <ReportLine label="VENDAS À VISTA" value="1.649.000" isPositive />
              <ReportLine label="PAGAMENTO FORNECEDORES" value="(581.400)" isNegative />
              <ReportLine label="FOLHA DE PAGAMENTO" value="(767.000)" isNegative />
              <ReportLine label="VERBA MARKETING (GRP)" value="(102.000)" isNegative />
              <ReportLine label="CUSTOS DE DISTRIBUIÇÃO" value="(278.200)" isNegative />
              <ReportLine label="JUROS E TAXAS BANCÁRIAS" value="(16.474)" isNegative />
              <ReportLine label="SALDO FINAL DISPONÍVEL" value="0" isBold />
           </div>
        </div>
     </div>
  </div>
);

const CollectiveSalesReport = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
     <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Vendas Relativas por Empresa (%) - P01</h3>
        <div className="h-[300px] flex items-end justify-between gap-6 px-4">
           {[15.2, 12.8, 10.4, 14.1, 18.5, 12.0, 8.5, 8.5].map((h, i) => (
             <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full bg-slate-900 rounded-t-2xl transition-all hover:bg-blue-600 shadow-xl relative" style={{ height: `${h * 15}px` }}>
                   <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">{h}%</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900">EMP {i+1}</span>
             </div>
           ))}
        </div>
     </div>
  </div>
);

const CollectiveFinancialReport = ({ type }: { type: 'BP' | 'DRE' }) => (
  <div className="animate-in fade-in slide-in-from-left-4 space-y-10">
     <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-10">{type === 'BP' ? 'Balanço Patrimonial Coletivo (Ativo)' : 'Demonstrativo de Resultados Coletivo (DRE)'}</h3>
        <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
           <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                 <tr>
                    <th className="p-5 min-w-[200px]">{type === 'BP' ? 'CONTA PATRIMONIAL' : 'RUBRICA CONTÁBIL'}</th>
                    <th className="p-5 text-right">EMP 01</th>
                    <th className="p-5 text-right">EMP 03</th>
                    <th className="p-5 text-right">EMP 08</th>
                    <th className="p-5 text-right">MÉDIA</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                 {type === 'BP' ? (
                   <>
                    <tr><td className="p-5 font-bold">Disponível / Caixa</td><td className="p-5 text-right">0</td><td className="p-5 text-right">120.450</td><td className="p-5 text-right">0</td><td className="p-5 text-right">40.150</td></tr>
                    <tr><td className="p-5 font-bold">Contas a Receber</td><td className="p-5 text-right">1.540.000</td><td className="p-5 text-right">1.823.735</td><td className="p-5 text-right">1.823.735</td><td className="p-5 text-right">1.729.156</td></tr>
                    <tr><td className="p-5 font-bold italic">Terrenos / Prédios</td><td className="p-5 text-right">3.814.600</td><td className="p-5 text-right">3.814.600</td><td className="p-5 text-right">3.814.600</td><td className="p-5 text-right">3.814.600</td></tr>
                    <tr className="bg-slate-900 text-white font-black"><td className="p-5 uppercase">TOTAL ATIVO</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td></tr>
                   </>
                 ) : (
                   <>
                    <tr><td className="p-5 font-bold">Receita de Vendas</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td></tr>
                    <tr className="bg-emerald-50 text-emerald-900 font-black"><td className="p-5 uppercase">LUCRO BRUTO</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td></tr>
                    <tr className="bg-blue-600 text-white font-black"><td className="p-5 uppercase">LUCRO LÍQUIDO</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td></tr>
                   </>
                 )}
              </tbody>
           </table>
        </div>
     </div>
  </div>
);

const MarketIndicatorsPanel = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
           <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Bolsa de Valores (Cotação Ações)</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase mb-2">EMP 0{i}</span>
                   <span className="text-xl font-black text-slate-900">1,04</span>
                   <span className="text-[9px] font-bold text-emerald-600 mt-1">+4,2%</span>
                </div>
              ))}
           </div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl space-y-8">
           <h3 className="text-xl font-black uppercase tracking-tight">CVM Indicators (P01)</h3>
           <div className="space-y-6">
              <MarketBox label="Inflação Período" value="1,00%" color="text-amber-400" />
              <MarketBox label="TR Mensal" value="2,00%" color="text-blue-400" />
              <MarketBox label="Salário Médio" value="1.300,00" color="text-slate-100" />
           </div>
        </div>
     </div>
  </div>
);

const ReportLine = ({ label, value, isPositive, isNegative, isBold }: any) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-50 px-2 transition-colors hover:bg-slate-50">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    <span className={`font-mono font-black text-sm ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : isBold ? 'text-slate-900 underline' : 'text-slate-700'}`}>
      {isNegative ? value : `$ ${value}`}
    </span>
  </div>
);

const MarketBox = ({ label, value, color }: any) => (
  <div className="flex justify-between items-center pb-4 border-b border-white/10">
     <span className="text-[10px] font-black uppercase text-slate-400">{label}</span>
     <span className={`text-lg font-black font-mono ${color}`}>{value}</span>
  </div>
);

export default Reports;
