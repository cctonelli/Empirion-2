
import React, { useState } from 'react';
import { 
  FileText, Package, DollarSign, Users, Globe, 
  Landmark, User, History, TrendingUp,
  Activity, CheckCircle2, ShieldCheck,
  ChevronRight, BarChart3
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
              Oracle <span className="text-blue-500">Audit Terminal</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-2xl border border-white/10 shadow-xl">
                <History size={16} className="text-orange-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Sincronizar Ciclo:</span>
                <select 
                  value={selectedRound} 
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="bg-transparent text-blue-400 font-black text-sm outline-none cursor-pointer"
                >
                  <option value={0} className="bg-slate-900">Período 00 (Initial Seed)</option>
                  <option value={1} className="bg-slate-900">Período 01 (Snapshot Alpha)</option>
                  <option value={2} className="bg-slate-900" disabled>Período 02 (Transmissão em curso)</option>
                </select>
             </div>
          </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
           <ReportTab active={reportMode === 'individual'} onClick={() => setReportMode('individual')} icon={<User size={14}/>} label="Individual P&L" />
           <ReportTab active={reportMode === 'collective'} onClick={() => setReportMode('collective')} icon={<Globe size={14}/>} label="Market Matrix" />
           <ReportTab active={reportMode === 'market'} onClick={() => setReportMode('market')} icon={<Landmark size={14}/>} label="Macro Indices" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${reportMode}-${selectedRound}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {reportMode === 'individual' && <FinancialView round={selectedRound} />}
          {reportMode === 'collective' && <HistoricalMatrixView />}
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
           { l: "Contas a Receber (Longo Prazo)", v: "450.000", indent: true, color: 'text-orange-400' },
           { l: "ESTOQUES MP & ACABADO", v: "1.466.605", b: true },
           { l: "PASSIVO TOTAL", v: "9.176.940", b: true },
           { l: "Contas a Pagar Fornecedores", v: "717.605", indent: true },
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
     </div>
  </div>
);

const ReportTab = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
     {icon} {label}
  </button>
);

const FinancialSection = ({ title, icon, color, lines }: any) => (
  <div className="premium-card p-12 rounded-[4rem] bg-slate-900/60 border-white/5 space-y-10 shadow-2xl">
     <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl text-white shadow-xl ${color === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'}`}>{icon}</div>
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
  <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
     <div><span className="block text-[8px] font-black text-slate-500 uppercase mb-1">{label}</span><span className="text-xl font-black text-white italic">{val}</span></div>
     <span className="text-[10px] font-black text-emerald-500">{trend}</span>
  </div>
);

const HistoricalMatrixView = () => (
  <div className="bg-slate-950 rounded-[4rem] border border-white/5 p-16 text-center space-y-10">
     <Globe size={64} className="text-slate-800 mx-auto" />
     <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Historical Market Evolution</h3>
     <p className="text-slate-500 font-medium max-w-xl mx-auto italic">O Oráculo está consolidando o histórico competitivo. Em breve, a matriz de evolução por round estará disponível aqui.</p>
  </div>
);

export default Reports;
