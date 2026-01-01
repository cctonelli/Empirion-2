
import React, { useState } from 'react';
import { 
  FileText, Activity, Package, DollarSign, Zap, Users, Globe, 
  ChevronDown, Download, BarChart3, TrendingUp, Landmark, ArrowRight, Table as TableIcon,
  ShieldCheck
} from 'lucide-react';

const Reports: React.FC = () => {
  const [reportMode, setReportMode] = useState<'collective' | 'individual' | 'gazette'>('individual');
  const [selectedSubReport, setSelectedSubReport] = useState<'individual' | 'financial' | 'collective_bp'>('individual');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      {/* Tactical Report Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
             <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                <FileText size={24} />
             </div>
             Auditoria Central
          </h1>
          <p className="text-slate-500 font-medium mt-1">Sincronização de dados auditados - Período Atual: 01</p>
        </div>
        
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200 shadow-inner">
           {[
             { id: 'individual', label: 'Indiv. (Emp 8)', icon: User },
             { id: 'collective', label: 'Coletivo Vendas', icon: Globe },
             { id: 'collective_bp', label: 'Coletivo Financeiro', icon: Landmark },
             { id: 'gazette', label: 'Gazeta Industrial', icon: Newspaper }
           ].map(t => (
             <button 
               key={t.id}
               onClick={() => {
                 if (t.id === 'gazette') setReportMode('gazette');
                 else if (t.id === 'individual') { setReportMode('individual'); setSelectedSubReport('individual'); }
                 else if (t.id === 'collective') { setReportMode('collective'); }
                 else if (t.id === 'collective_bp') { setReportMode('individual'); setSelectedSubReport('collective_bp'); }
               }}
               className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                 (reportMode === t.id || (t.id === 'collective_bp' && selectedSubReport === 'collective_bp')) ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {t.label}
             </button>
           ))}
        </div>
      </div>

      {reportMode === 'individual' && selectedSubReport === 'individual' && <IndividualReport />}
      {reportMode === 'collective' && <CollectiveSalesReport />}
      {reportMode === 'individual' && selectedSubReport === 'collective_bp' && <CollectiveFinancialReport />}
      {reportMode === 'gazette' && <IndustrialGazette />}
    </div>
  );
};

// --- RELATÓRIO INDIVIDUAL (Empresa 8 - Fiel Image ID 2) ---
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
        {/* Market Share Chart Area */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Vendas Relativas por Região (%)</h3>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">Região 9</button>
                 <button className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase">Consolidado</button>
              </div>
           </div>
           <div className="h-[300px] flex items-end justify-between gap-6 px-4">
              {[15, 12, 10, 14, 18, 12, 9, 10].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                   <div className="w-full bg-blue-600 rounded-t-2xl transition-all hover:bg-blue-400 shadow-xl shadow-blue-50 relative" style={{ height: `${h * 15}px` }}>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{h}%</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900">E-0{i+1}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Bolsa de Valores / Cotação */}
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white space-y-8 shadow-2xl">
           <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <BarChart3 className="text-blue-400" /> Bolsa de Valores
           </h3>
           <div className="space-y-4">
              {[
                { name: 'Empresa 08', val: '1,04', trend: '+4,2%', pos: true },
                { name: 'Empresa 03', val: '1,01', trend: '+0,8%', pos: true },
                { name: 'Empresa 01', val: '0,98', trend: '-2,1%', pos: false },
                { name: 'Empresa 05', val: '0,95', trend: '-4,5%', pos: false },
                { name: 'Empresa 04', val: '0,99', trend: '-1,0%', pos: false }
              ].map((stock, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                   <span className="text-xs font-black uppercase tracking-tighter">{stock.name}</span>
                   <div className="text-right">
                      <span className="block text-sm font-mono font-black">{stock.val}</span>
                      <span className={`text-[9px] font-black ${stock.pos ? 'text-emerald-400' : 'text-rose-400'}`}>{stock.trend}</span>
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full py-4 bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Relatório CVM Completo</button>
        </div>
     </div>

     {/* Indicadores Macroeconômicos */}
     <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-8">Indicadores de Mercado (P01)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
           <MarketBox label="ICE (Confiança)" value="100,0" />
           <MarketBox label="Inflação" value="1,0%" />
           <MarketBox label="TR Mensal" value="2,0%" />
           <MarketBox label="Salário Médio" value="1.300,00" />
           <MarketBox label="Preço Médio Venda" value="340,00" />
           <MarketBox label="Demanda Total" value="79.728" />
        </div>
     </div>
  </div>
);

// --- RELATÓRIO COLETIVO FINANCEIRO (Fiel Image ID 1) ---
const CollectiveFinancialReport = () => (
  <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-10">
     <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Balanço Patrimonial Coletivo (Ativo)</h3>
           <Download size={20} className="text-slate-200" />
        </div>
        <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
           <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                 <tr>
                    <th className="p-5">CONTA PATRIMONIAL</th>
                    <th className="p-5 text-right">EMP 01</th>
                    <th className="p-5 text-right">EMP 03</th>
                    <th className="p-5 text-right">EMP 08</th>
                    <th className="p-5 text-right">MÉDIA</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                 <tr><td className="p-5 font-bold">Disponível / Caixa</td><td className="p-5 text-right">0</td><td className="p-5 text-right">120.450</td><td className="p-5 text-right">0</td><td className="p-5 text-right">40.150</td></tr>
                 <tr><td className="p-5 font-bold">Aplicações Financeiras</td><td className="p-5 text-right">450.000</td><td className="p-5 text-right">0</td><td className="p-5 text-right">150.000</td><td className="p-5 text-right">200.000</td></tr>
                 <tr><td className="p-5 font-bold">Contas a Receber</td><td className="p-5 text-right">1.540.000</td><td className="p-5 text-right">1.823.735</td><td className="p-5 text-right">1.823.735</td><td className="p-5 text-right">1.729.156</td></tr>
                 <tr><td className="p-5 font-bold">Estoques Totais</td><td className="p-5 text-right">1.466.605</td><td className="p-5 text-right">1.466.605</td><td className="p-4 text-right">1.466.605</td><td className="p-5 text-right">1.466.605</td></tr>
                 <tr className="bg-slate-900 text-white font-black"><td className="p-5 uppercase">TOTAL ATIVO</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td><td className="p-5 text-right">9.176.940</td></tr>
              </tbody>
           </table>
        </div>
     </div>

     <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-10">Demonstrativo de Resultados Coletivo (DRE)</h3>
        <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
           <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                 <tr>
                    <th className="p-5">RUBRICA CONTÁBIL</th>
                    <th className="p-5 text-right">EMP 01</th>
                    <th className="p-5 text-right">EMP 03</th>
                    <th className="p-5 text-right">EMP 08</th>
                    <th className="p-5 text-right">MARKET AVG</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                 <tr><td className="p-5 font-bold">Vendas Líquidas</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td><td className="p-5 text-right">3.298.000</td></tr>
                 <tr><td className="p-5 font-bold">CPV (Custo de Vendas)</td><td className="p-5 text-right">(2.390.400)</td><td className="p-5 text-right">(2.390.400)</td><td className="p-5 text-right">(2.390.400)</td><td className="p-5 text-right">(2.390.400)</td></tr>
                 <tr className="bg-emerald-50 text-emerald-900 font-black"><td className="p-5 uppercase">LUCRO BRUTO</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td><td className="p-5 text-right">907.600</td></tr>
                 <tr><td className="p-5 font-bold">Despesas Administrativas</td><td className="p-5 text-right">(150.000)</td><td className="p-5 text-right">(150.000)</td><td className="p-5 text-right">(150.000)</td><td className="p-5 text-right">(150.000)</td></tr>
                 <tr><td className="p-5 font-bold">Resultado Financeiro</td><td className="p-5 text-right">(16.474)</td><td className="p-5 text-right">(16.474)</td><td className="p-5 text-right">(16.474)</td><td className="p-5 text-right">(16.474)</td></tr>
                 <tr className="bg-blue-600 text-white font-black"><td className="p-5 uppercase">LUCRO LÍQUIDO</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td><td className="p-5 text-right">73.926</td></tr>
              </tbody>
           </table>
        </div>
     </div>
  </div>
);

// --- GAZETA INDUSTRIAL (Fiel Image ID 3/4) ---
const IndustrialGazette = () => (
  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10 max-w-4xl mx-auto">
     <div className="bg-white p-16 rounded-[4rem] border-4 border-slate-900 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
           <Newspaper size={400} />
        </div>
        <div className="text-center border-b-8 border-slate-900 pb-12">
           <h2 className="text-7xl font-black text-slate-900 uppercase tracking-tighter mb-4">Gazeta Industrial</h2>
           <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
              <span>Ano XV - Edição 902</span>
              <span>São Paulo, 31 de Dezembro de 2025</span>
              <span>Preço: $ 0,05</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-800 leading-relaxed font-serif text-lg">
           <div className="space-y-6">
              <h4 className="text-2xl font-black font-sans uppercase tracking-tight">CVM Investiga Empresa 08 por Alta Performance</h4>
              <p>O mercado de bens duráveis foi pego de surpresa com os resultados consolidados do Período 1. A Empresa 08 S/A apresentou uma margem EBITDA recorde para o setor, alavancada por uma estratégia agressiva na Região 9.</p>
              <p>Analistas da Gazeta apontam que a manutenção dos estoques de MP A foi o diferencial tático, protegendo o caixa contra a inflação galopante de 1% observada no início do ciclo.</p>
           </div>
           <div className="space-y-6">
              <h4 className="text-2xl font-black font-sans uppercase tracking-tight">Indicadores para o Próximo Período (P02)</h4>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 font-sans space-y-4 shadow-inner">
                 <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">MP A (Reajuste)</span>
                    <span className="font-black text-rose-600">+4,5%</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">TR Mensal</span>
                    <span className="font-black text-blue-600">2,5%</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Câmbio Projetado</span>
                    <span className="font-black text-emerald-600">5,42</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Salário Base</span>
                    <span className="font-black text-slate-900">1.340,00</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="pt-10 border-t border-slate-200 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Editor Responsável: Strategos Core AI v3.0</p>
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

const MarketBox = ({ label, value }: any) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center group hover:bg-slate-900 hover:text-white transition-all">
     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-400">{label}</span>
     <span className="text-sm font-black text-slate-900 group-hover:text-white">{value}</span>
  </div>
);

const Newspaper = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
  </svg>
);

const User = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

export default Reports;
