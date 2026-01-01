
import React, { useState } from 'react';
import { 
  FileText, Activity, Package, DollarSign, Zap, Users, Globe, 
  ChevronDown, Download, BarChart3, TrendingUp, Landmark, ArrowRight, Table as TableIcon,
  ShieldCheck, User
} from 'lucide-react';

const Reports: React.FC = () => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'market'>('individual');
  const [collectiveSubTab, setCollectiveSubTab] = useState<'bp' | 'dre' | 'vendas'>('vendas');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      {/* Tactical Report Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
             <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                <FileText size={24} />
             </div>
             Audit & Reports
          </h1>
          <p className="text-slate-500 font-medium mt-1">Sincronização de dados auditados - Período Atual: 01</p>
        </div>
        
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200 shadow-inner">
           {[
             { id: 'individual', label: 'Individual (Emp 8)', icon: User },
             { id: 'collective', label: 'Relatórios Coletivos', icon: Globe },
             { id: 'market', label: 'Bolsa & Macro', icon: TrendingUp }
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
              <button onClick={() => setCollectiveSubTab('bp')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${collectiveSubTab === 'bp' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Balanço Patrimonial</button>
              <button onClick={() => setCollectiveSubTab('dre')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${collectiveSubTab === 'dre' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>DRE Coletivo</button>
           </div>
           {collectiveSubTab === 'vendas' && <CollectiveSalesReport />}
           {collectiveSubTab === 'bp' && <CollectiveFinancialReport type="BP" />}
           {collectiveSubTab === 'dre' && <CollectiveFinancialReport type="DRE" />}
        </div>
      )}
      {reportMode === 'market' && <MarketIndicatorsPanel />}
    </div>
  );
};

// --- RELATÓRIO INDIVIDUAL (Empresa 8 - Fiel Image ID 1) ---
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
                 <ShieldCheck size={14} /> Relatório Individual de Desempenho - P01
              </p>
           </div>
        </div>
        <div className="flex items-center gap-8 relative z-10">
           <div className="text-right">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resultado Líquido</span>
              <span className="text-3xl font-black text-emerald-400">$ 73.926</span>
           </div>
           <button className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all shadow-xl">
              <Download size={24} />
           </button>
        </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quadro 1: Evolução de Estoques */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Package className="text-blue-600" size={24} />
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">1. Evolução de Estoques (Unid.)</h3>
              </div>
              <TableIcon size={18} className="text-slate-200" />
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

        {/* Quadro 2: Fluxo de Caixa Detalhado */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <DollarSign className="text-emerald-600" size={24} />
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">2. Fluxo de Caixa Operacional ($)</h3>
              </div>
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

        {/* Quadro 3: RH & Máquinas */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-6">
              <div className="flex items-center gap-3"><Users size={20} className="text-amber-500" /><h4 className="text-[11px] font-black uppercase tracking-widest">3. Recursos Humanos</h4></div>
              <div className="space-y-3">
                 <MiniStat label="Total Empregados" value="500" />
                 <MiniStat label="Produtividade" value="0.97" />
                 <MiniStat label="Nível de Motivação" value="REGULAR" />
                 <MiniStat label="Status Greve" value="NENHUMA" />
              </div>
           </div>
           <div className="space-y-6">
              <div className="flex items-center gap-3"><Zap size={20} className="text-indigo-500" /><h4 className="text-[11px] font-black uppercase tracking-widest">4. Máquinas e CapEx</h4></div>
              <div className="space-y-3">
                 <MiniStat label="Maq. Tipo ALFA" value="5 (Nova)" />
                 <MiniStat label="Maq. Tipo BETA" value="0" />
                 <MiniStat label="Maq. Tipo GAMA" value="0" />
                 <MiniStat label="Idade Média" value="0.5 Per." />
              </div>
           </div>
        </div>

        {/* Quadro 4: Demanda Regional (9 Regiões) */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Globe className="text-indigo-600" size={24} />
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">5. Demanda vs Vendas por Região</h3>
              </div>
           </div>
           <div className="grid grid-cols-3 gap-4">
              {[1,2,3,4,5,6,7,8,9].map(i => (
                <div key={i} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-center group hover:bg-slate-900 hover:text-white transition-all">
                   <span className="block text-[10px] font-black uppercase text-slate-400 mb-2 group-hover:text-blue-400">Região 0{i}</span>
                   <div className="flex flex-col gap-1">
                      <span className="text-lg font-black font-mono">{i === 9 ? '12.592' : '8.392'}</span>
                      <span className="block text-[8px] font-bold text-emerald-500 group-hover:text-emerald-300">Saturado 100%</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
     </div>
  </div>
);

// --- RELATÓRIO COLETIVO VENDAS (Fiel Image ID 0) ---
const CollectiveSalesReport = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Participação de Mercado por Região (%)</h3>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">Região 9 (Foco)</button>
              </div>
           </div>
           <div className="h-[300px] flex items-end justify-between gap-6 px-4">
              {[15.2, 12.8, 10.4, 14.1, 18.5, 12.0, 8.5, 8.5].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                   <div className="w-full bg-blue-600 rounded-t-2xl transition-all hover:bg-blue-400 shadow-xl shadow-blue-50 relative" style={{ height: `${h * 15}px` }}>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{h}%</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900">EMP {i+1}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
           <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Preços de Venda (BRL)</h3>
           <div className="space-y-4">
              {[1, 3, 8].map((emp) => (
                <div key={emp} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                   <span className="text-xs font-black">Empresa 0{emp}</span>
                   <span className="font-mono font-black text-blue-600">340,00</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase text-slate-400">Preço Médio Mercado</span>
                 <span className="font-black text-slate-900">340,00</span>
              </div>
           </div>
        </div>
     </div>
  </div>
);

// --- RELATÓRIO COLETIVO FINANCEIRO (Fiel Image ID 5) ---
const CollectiveFinancialReport = ({ type }: { type: 'BP' | 'DRE' }) => (
  <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-10">
     <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">{type === 'BP' ? 'Balanço Patrimonial Coletivo (Ativo)' : 'Demonstrativo de Resultados Coletivo (DRE)'}</h3>
           <Download size={20} className="text-slate-200" />
        </div>
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
                    <tr><td className="p-5 font-bold">Aplicações Financeiras</td><td className="p-5 text-right">450.000</td><td className="p-5 text-right">0</td><td className="p-5 text-right">150.000</td><td className="p-5 text-right">200.000</td></tr>
                    <tr><td className="p-5 font-bold">Contas a Receber</td><td className="p-5 text-right">1.540.000</td><td className="p-5 text-right">1.823.735</td><td className="p-5 text-right">1.823.735</td><td className="p-5 text-right">1.729.156</td></tr>
                    <tr><td className="p-5 font-bold">Estoques Totais</td><td className="p-5 text-right">1.466.605</td><td className="p-5 text-right">1.466.605</td><td className="p-4 text-right">1.466.605</td><td className="p-5 text-right">1.466.605</td></tr>
                    <tr><td className="p-5 font-bold italic">Terrenos / Prédios</td><td className="p-5 text-right">3.814.600</td><td className="p-5 text-right">3.814.600</td><td className="p-5 text-right">3.814.600</td><td className="p-5 text-right">3.814.600</td></tr>
                    <tr className="bg-slate-900 text-white font-black"><td className="p-5 uppercase">TOTAL ATIVO</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td></tr>
                   </>
                 ) : (
                   <>
                    <tr><td className="p-5 font-bold">Receita de Vendas</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td></tr>
                    <tr><td className="p-5 font-bold">Custo Prod. Vendidos (CPV)</td><td className="p-5 text-right">(2.390.400)</td><td className="p-5 text-right">(2.390.400)</td><td className="p-5 text-right">(2.390.400)</td><td className="p-5 text-right">(2.390.400)</td></tr>
                    <tr className="bg-emerald-50 text-emerald-900 font-black"><td className="p-5 uppercase">LUCRO BRUTO</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td></tr>
                    <tr><td className="p-5 font-bold">Despesas Operacionais</td><td className="p-5 text-right">(550.200)</td><td className="p-5 text-right">(550.200)</td><td className="p-5 text-right">(550.200)</td><td className="p-5 text-right">(550.200)</td></tr>
                    <tr><td className="p-5 font-bold italic">Resultado Financeiro</td><td className="p-5 text-right">(16.474)</td><td className="p-5 text-right">(16.474)</td><td className="p-5 text-right">(16.474)</td><td className="p-5 text-right">(16.474)</td></tr>
                    <tr className="bg-blue-600 text-white font-black"><td className="p-5 uppercase">LUCRO LÍQUIDO</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td></tr>
                   </>
                 )}
              </tbody>
           </table>
        </div>
     </div>
  </div>
);

// --- PAINEL DE INDICADORES DE MERCADO (Bolsa + Macro) ---
const MarketIndicatorsPanel = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
           <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Bolsa de Valores Empirion (Cotação Ações)</h3>
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
           <h3 className="text-xl font-black uppercase tracking-tight">Macroeconomia (P01)</h3>
           <div className="space-y-6">
              <MarketBox label="Inflação" value="1,00%" color="text-amber-400" />
              <MarketBox label="TR Mensal" value="2,00%" color="text-blue-400" />
              <MarketBox label="Juros Fornecedores" value="1,50%" color="text-emerald-400" />
              <MarketBox label="Salário Médio" value="1.300,00" color="text-slate-100" />
           </div>
        </div>
     </div>
  </div>
);

const ReportLine = ({ label, value, isPositive, isNegative, isBold }: any) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors px-2">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    <span className={`font-mono font-black text-sm ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : isBold ? 'text-slate-900 underline' : 'text-slate-700'}`}>
      {isNegative ? value : `$ ${value}`}
    </span>
  </div>
);

const MiniStat = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-[9px] border-b border-slate-50 py-1.5 px-1">
    <span className="text-slate-400 font-bold uppercase tracking-widest">{label}:</span>
    <span className="text-slate-900 font-black">{value}</span>
  </div>
);

const MarketBox = ({ label, value, color }: any) => (
  <div className="flex justify-between items-center pb-4 border-b border-white/10">
     <span className="text-[10px] font-black uppercase text-slate-400">{label}</span>
     <span className={`text-lg font-black font-mono ${color}`}>{value}</span>
  </div>
);

export default Reports;
