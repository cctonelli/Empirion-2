
import React, { useState } from 'react';
import { 
  FileText, Package, DollarSign, Users, Globe, 
  Landmark, User, History, TrendingUp,
  Activity, CheckCircle2, ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Branch } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'market'>('individual');
  const [selectedRound, setSelectedRound] = useState(0);

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
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Seletor de Ciclo:</span>
                <select 
                  value={selectedRound} 
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="bg-transparent text-blue-400 font-black text-xs outline-none cursor-pointer"
                >
                  <option value={0} className="bg-slate-900">Ciclo 0 (Balanço Inicial)</option>
                  <option value={1} className="bg-slate-900" disabled>Ciclo 1 (Em processamento...)</option>
                </select>
             </div>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
               Empirion Street Fidelity v6.0 • Auditado
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
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
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
           <FinancialSection title="Balanço Patrimonial Inicial (P0)" icon={<Package size={24}/>} color="blue" lines={[
              { l: "ATIVO TOTAL", v: "9.176.940", b: true, p: true },
              { l: "1.1 ATIVO CIRCULANTE", v: "3.290.340", b: true },
              { l: "Títulos a Receber", v: "1.823.735" },
              { l: "ESTOQUE TOTAL", v: "1.466.605", b: true },
              { l: "Matéria-Prima A", v: "628.545", indent: true },
              { l: "Matéria-Prima B", v: "838.060", indent: true },
              { l: "1.2 ATIVO NÃO CIRCULANTE", v: "5.886.600", b: true },
              { l: "Imobilizado Líquido", v: "5.886.600" },
              { l: "(-) Depreciação Acumulada", v: "-3.113.400", neg: true }
           ]} />
           
           <FinancialSection title="DRE - Resultado Inicial (P0)" icon={<DollarSign size={24}/>} color="emerald" lines={[
              { l: "RECEITA DE VENDAS", v: "3.322.735", b: true, p: true },
              { l: "(-) CPV", v: "2.278.180", neg: true },
              { l: "(=) LUCRO BRUTO", v: "1.044.555", b: true },
              { l: "(-) DESPESAS OPERACIONAIS", v: "957.582", neg: true },
              { l: "(=) LUCRO OPERACIONAL", v: "86.973", b: true },
              { l: "(-) PROVISÃO I.R.", v: "13.045", neg: true },
              { l: "(=) LUCRO LÍQUIDO", v: "73.928", b: true, p: true }
           ]} />
        </div>

        <div className="space-y-10">
           <div className="premium-card p-10 rounded-[3.5rem] bg-slate-900 border-white/10 space-y-6">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3"><Users className="text-orange-500" /> Unidade Alpha</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold"><span className="text-slate-500 uppercase">Status</span><span className="text-emerald-400 font-black">OPERACIONAL</span></div>
                 <div className="flex justify-between items-center text-xs font-bold"><span className="text-slate-500 uppercase">Empregados</span><span className="text-white">500 Unid.</span></div>
                 <div className="flex justify-between items-center text-xs font-bold"><span className="text-slate-500 uppercase">Máquinas</span><span className="text-blue-400">10 (Alfa)</span></div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest italic">
                 <ShieldCheck size={14} className="text-emerald-500" /> Dados Auditados Oracle Node
              </div>
           </div>
        </div>
     </div>
  </div>
);

const HistoricalMatrixView = () => (
  <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-8">
     <div className="premium-card rounded-[3.5rem] overflow-x-auto border-2 border-slate-800 shadow-2xl bg-slate-950">
        <table className="w-full text-left text-xs min-w-[1400px]">
           <thead className="bg-slate-900 text-slate-500 font-black uppercase border-b border-white/10">
              <tr>
                 <th className="p-8 sticky left-0 bg-slate-900 z-10">Indicador Estratégico (P0)</th>
                 {[1,2,3,4,5,6,7,8].map(i => <th key={i} className="p-8 text-center border-l border-white/5 whitespace-nowrap">Unidade 0{i} {i === 1 && '(Você)'}</th>)}
              </tr>
           </thead>
           <tbody className="divide-y divide-white/5 font-bold text-slate-400">
              {[
                { l: 'Ativo Total ($)', v: '9.176.940' },
                { l: 'Patrimônio Líquido ($)', v: '5.055.447' },
                { l: 'Lucro Líquido ($)', v: '73.928' },
                { l: 'Market Share (%)', v: '12.5%' },
                { l: 'Equipe de Vendas', v: '50' },
                { l: 'OEE Projetado (%)', v: '82.4%' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                   <td className="p-6 font-black uppercase italic text-slate-300 sticky left-0 bg-slate-950/80 backdrop-blur-md">{row.l}</td>
                   {[1,2,3,4,5,6,7,8].map(i => (
                      <td key={i} className={`p-6 text-center border-l border-white/5 font-mono ${i === 1 ? 'text-orange-500' : ''}`}>
                        {row.v}
                      </td>
                   ))}
                </tr>
              ))}
           </tbody>
        </table>
     </div>
     <div className="p-10 bg-blue-600/10 border border-blue-500/20 rounded-[3.5rem] flex items-center gap-8">
        <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-500/20"><Globe size={28} /></div>
        <div className="space-y-1">
           <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Análise de Benchmarking Coletivo</h4>
           <p className="text-xs text-blue-200 font-medium italic opacity-70">"No Período 0, todas as unidades iniciam com estruturas idênticas. A divergência tática ocorrerá a partir da orquestração do Ciclo 1."</p>
        </div>
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
           <IndicatorBox label="Salário Médio Industrial" value="R$ 1.313" icon={<Users />} />
        </div>
     </div>
     <div className="premium-card p-10 rounded-[3.5rem] space-y-8 bg-slate-900 border-white/10 shadow-2xl">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Tabela de Fornecedores</h3>
        <div className="space-y-6">
           <ReportLine label="Matéria-Prima A" value="20,20" />
           <ReportLine label="Matéria-Prima B" value="40,40" />
           <ReportLine label="Máquina Alfa" value="505.000" />
           <ReportLine label="Máquina Beta" value="1.515.000" />
           <ReportLine label="Máquina Gama" value="3.030.000" />
        </div>
     </div>
  </div>
);

const FinancialSection = ({ title, icon, color, lines }: any) => (
  <div className="premium-card p-10 rounded-[3.5rem] bg-slate-900/40 border-white/5 space-y-8 shadow-xl">
     <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl text-white shadow-lg ${color === 'blue' ? 'bg-blue-600' : color === 'emerald' ? 'bg-emerald-600' : 'bg-orange-600'}`}>{icon}</div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">{title}</h3>
     </div>
     <div className="space-y-1">
        {lines.map((ln: any, i: number) => (
           <div key={i} className={`flex justify-between items-center py-3 border-b border-white/5 px-4 hover:bg-white/5 transition-colors group ${ln.b ? 'bg-white/[0.02]' : ''}`}>
              <span className={`text-[10px] uppercase tracking-widest group-hover:text-slate-200 transition-colors ${ln.b ? 'font-black text-slate-300' : 'text-slate-500'} ${ln.indent ? 'pl-6' : ''}`}>{ln.l}</span>
              <span className={`font-mono font-black text-sm tracking-tighter ${ln.p ? 'text-emerald-400' : ln.neg ? 'text-rose-400' : ln.b ? 'text-white italic' : 'text-slate-400'}`}>R$ {ln.v}</span>
           </div>
        ))}
     </div>
  </div>
);

const IndicatorBox = ({ label, value, icon, neg }: any) => (
  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-6 items-center">
     <div className={`p-4 rounded-2xl ${neg ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>{icon}</div>
     <div><span className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span><span className="text-2xl font-black text-white font-mono">{value}</span></div>
  </div>
);

const ReportLine = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5 px-4"><span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span><span className="font-mono font-black text-white">R$ {value}</span></div>
);

export default Reports;
