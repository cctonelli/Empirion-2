
import React, { useState } from 'react';
import { 
  FileText, Package, DollarSign, Users, Globe, 
  Landmark, User, History, TrendingUp,
  Activity
} from 'lucide-react';
import { Branch } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'market'>('individual');
  const [selectedRound, setSelectedRound] = useState(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={20} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Oracle <span className="text-blue-500">Audit</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-white/10">
                <History size={14} className="text-orange-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Round Feed:</span>
                <select 
                  value={selectedRound} 
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="bg-transparent text-blue-400 font-black text-xs outline-none cursor-pointer"
                >
                  <option value={1} className="bg-slate-900">Período 1 (Inicial)</option>
                  <option value={2} className="bg-slate-900">Período 2</option>
                </select>
             </div>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
               Empirion Street Fidelity v5.0 • Sincronizado
             </p>
          </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
           {[
             { id: 'individual', label: `Relatório Individual`, icon: User },
             { id: 'collective', label: 'Relatório Coletivo', icon: Globe },
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

      <AnimatePresence mode="wait">
        <motion.div
          key={`${reportMode}-${selectedRound}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {reportMode === 'individual' && <IndividualReportView round={selectedRound} />}
          {reportMode === 'collective' && <HistoricalMatrixView />}
          {reportMode === 'market' && <MarketIndicatorsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const IndividualReportView = ({ round }: any) => (
  <div className="space-y-12">
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
           <FinancialSection title="Balanço Patrimonial (P01)" icon={<Package size={24}/>} color="blue" lines={[
              { l: "ATIVO TOTAL", v: "9.176.940", b: true, p: true },
              { l: "1.1 ATIVO CIRCULANTE", v: "3.290.340", b: true },
              { l: "Contas a Receber", v: "1.823.735" },
              { l: "ESTOQUE TOTAL", v: "1.466.605", b: true },
              { l: "Estoque MP-A", v: "628.545", indent: true },
              { l: "Estoque MP-B", v: "838.060", indent: true },
              { l: "1.2 ATIVO NÃO CIRCULANTE", v: "5.886.600", b: true },
              { l: "Imobilizado Líquido", v: "5.886.600" },
              { l: "(-) Depreciação Acumulada", v: "-3.113.400", neg: true }
           ]} />
           
           <FinancialSection title="Fluxo de Caixa (P01)" icon={<Activity size={24}/>} color="orange" lines={[
              { l: "(=) SALDO INICIAL", v: "170.000", b: true },
              { l: "(+) ENTRADAS TOTAIS", v: "3.264.862", p: true },
              { l: "Vendas à Vista", v: "1.649.000", indent: true },
              { l: "Empréstimos", v: "1.372.362", indent: true },
              { l: "(-) SAÍDAS TOTAIS", v: "3.434.862", neg: true },
              { l: "Folha de Pagamento", v: "767.000", indent: true },
              { l: "Campanhas Marketing", v: "275.400", indent: true },
              { l: "(=) SALDO FINAL", v: "0", b: true }
           ]} />
        </div>

        <div className="space-y-10">
           <FinancialSection title="DRE - Resultado (P01)" icon={<DollarSign size={24}/>} color="emerald" lines={[
              { l: "RECEITA DE VENDAS", v: "3.322.735", b: true, p: true },
              { l: "(-) CPV", v: "2.278.180", neg: true },
              { l: "(=) LUCRO BRUTO", v: "1.044.555", b: true },
              { l: "(-) DESPESAS OPERACIONAIS", v: "957.582", neg: true },
              { l: "(=) LUCRO OPERACIONAL", v: "86.973", b: true },
              { l: "(-) PROVISÃO I.R.", v: "13.045", neg: true },
              { l: "(=) LUCRO LÍQUIDO", v: "73.928", b: true, p: true }
           ]} />

           <div className="premium-card p-10 rounded-[3.5rem] bg-slate-900 border-white/10 space-y-6">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                 <Users className="text-orange-500" /> Status RH
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500 uppercase">Empregados</span>
                    <span className="text-white">500 Unid.</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500 uppercase">Produtividade</span>
                    <span className="text-emerald-400">97.0%</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500 uppercase">Motivação</span>
                    <span className="text-blue-400">REGULAR</span>
                 </div>
              </div>
           </div>
        </div>
     </div>
  </div>
);

const FinancialSection = ({ title, icon, color, lines }: any) => (
  <div className="premium-card p-10 rounded-[3.5rem] bg-slate-900/40 border-white/5 space-y-8">
     <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl text-white shadow-lg ${color === 'blue' ? 'bg-blue-600' : color === 'emerald' ? 'bg-emerald-600' : 'bg-orange-600'}`}>{icon}</div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">{title}</h3>
     </div>
     <div className="space-y-1">
        {lines.map((ln: any, i: number) => (
           <div key={i} className={`flex justify-between items-center py-3 border-b border-white/5 px-4 hover:bg-white/5 transition-colors group ${ln.b ? 'bg-white/[0.02]' : ''}`}>
              <span className={`text-[10px] uppercase tracking-widest group-hover:text-slate-200 transition-colors ${ln.b ? 'font-black text-slate-300' : 'text-slate-500'} ${ln.indent ? 'pl-6' : ''}`}>
                {ln.l}
              </span>
              <span className={`font-mono font-black text-sm tracking-tighter ${ln.p ? 'text-emerald-400' : ln.neg ? 'text-rose-400' : ln.b ? 'text-white italic' : 'text-slate-400'}`}>
                R$ {ln.v}
              </span>
           </div>
        ))}
     </div>
  </div>
);

const HistoricalMatrixView = () => (
  <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-8">
     <div className="premium-card rounded-[3.5rem] overflow-hidden border-2 border-slate-800 shadow-2xl">
        <table className="w-full text-left text-xs">
           <thead className="bg-slate-950 text-slate-500 font-black uppercase border-b border-white/10">
              <tr>
                 <th className="p-8">Rubrica Master</th>
                 {[1,2,3,4,5,6,7,8].map(i => <th key={i} className="p-8 text-center border-l border-white/5">Empresa {i}</th>)}
              </tr>
           </thead>
           <tbody className="divide-y divide-white/5 font-bold text-slate-400">
              {['Ativo Total', 'Lucro Líquido', 'Market Share'].map((r, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                   <td className="p-6 font-black uppercase italic text-slate-300">{r}</td>
                   {[1,2,3,4,5,6,7,8].map(i => (
                      <td key={i} className="p-6 text-center border-l border-white/5 font-mono">
                        {idx === 0 ? '9.176.940' : idx === 1 ? '73.928' : '12.5%'}
                      </td>
                   ))}
                </tr>
              ))}
           </tbody>
        </table>
     </div>
  </div>
);

const MarketIndicatorsPanel = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     <div className="lg:col-span-2 premium-card p-12 rounded-[4rem] space-y-10 bg-slate-900 border-white/10 shadow-2xl">
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Conjuntura Empirion Street</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <IndicatorBox label="Crescimento Econômico" value="3.0%" icon={<TrendingUp />} />
           <IndicatorBox label="Inflação Período" value="1.0%" icon={<Activity />} neg />
           <IndicatorBox label="Taxa TR Mensal" value="3.0%" icon={<Landmark />} />
           <IndicatorBox label="Salário Médio" value="R$ 1.313" icon={<Users />} />
        </div>
     </div>
     <div className="premium-card p-10 rounded-[3.5rem] space-y-8 bg-slate-900 border-white/10 shadow-2xl">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Preços Fornecedores</h3>
        <div className="space-y-6">
           <ReportLine label="Matéria-Prima A" value="20,20" />
           <ReportLine label="Matéria-Prima B" value="40,40" />
           <ReportLine label="Máquina Alfa" value="505.000" />
           <ReportLine label="Máquina Beta" value="1.515.000" />
        </div>
     </div>
  </div>
);

const IndicatorBox = ({ label, value, icon, neg }: any) => (
  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-6 items-center">
     <div className={`p-4 rounded-2xl ${neg ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>{icon}</div>
     <div>
        <span className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
        <span className="text-2xl font-black text-white font-mono">{value}</span>
     </div>
  </div>
);

const ReportLine = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5 px-4">
    <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
    <span className="font-mono font-black text-white">R$ {value}</span>
  </div>
);

export default Reports;
