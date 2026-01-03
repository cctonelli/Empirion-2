
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Package, DollarSign, Globe, User, History, 
  TrendingUp, Activity, BarChart3, Database, ShieldAlert,
  Zap, Brain, ChevronRight, Scale, Landmark, Cpu, AlertTriangle
} from 'lucide-react';
import { Branch } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getChampionshipHistoricalData } from '../services/supabase';

const Reports: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [reportMode, setReportMode] = useState<'individual' | 'collective' | 'market'>('individual');
  const [selectedRound, setSelectedRound] = useState(0);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const champId = localStorage.getItem('active_champ_id');
      if (champId) {
        const { data } = await getChampionshipHistoricalData(champId, selectedRound);
        setHistoricalData(data || []);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [selectedRound, reportMode]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><FileText className="text-white" size={20} /></div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Oracle <span className="text-blue-500">Audit Terminal</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-2xl border border-white/10 shadow-xl">
                <History size={16} className="text-orange-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Snapshot de Auditoria:</span>
                <select value={selectedRound} onChange={(e) => setSelectedRound(Number(e.target.value))} className="bg-transparent text-blue-400 font-black text-sm outline-none cursor-pointer">
                  <option value={0} className="bg-slate-900">P00 - Seed Industrial</option>
                  <option value={1} className="bg-slate-900">P01 - Consolidação Alpha</option>
                </select>
             </div>
             {isLoading && <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase animate-pulse"><Database size={12}/> Syncing...</div>}
          </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
           <ReportTab active={reportMode === 'individual'} onClick={() => setReportMode('individual')} icon={<User size={14}/>} label="Dossiê Individual" />
           <ReportTab active={reportMode === 'collective'} onClick={() => setReportMode('collective')} icon={<Globe size={14}/>} label="Matriz de Mercado" />
           <ReportTab active={reportMode === 'market'} onClick={() => setReportMode('market')} icon={<TrendingUp size={14}/>} label="Indicadores Macro" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${reportMode}-${selectedRound}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {reportMode === 'individual' && <FinancialView round={selectedRound} />}
          {reportMode === 'collective' && <MatrixReportView round={selectedRound} data={historicalData} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const FinancialView = ({ round }: any) => {
  // Simulação de IA: Alerta de Crise ou Oferta dependendo do Round/Caixa
  const isCrisis = round === 0; // No P0, sugerimos o próximo passo

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
       <div className="lg:col-span-8 space-y-12">
          
          {/* Strategos Advisor - Sugestões IA de Crise e Ofertas */}
          <div className={`p-10 rounded-[3rem] border transition-all space-y-8 relative overflow-hidden group ${isCrisis ? 'bg-gradient-to-r from-rose-900/30 to-slate-900 border-rose-500/20' : 'bg-gradient-to-r from-indigo-900/30 to-slate-900 border-indigo-500/20'}`}>
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-all duration-700">
                {isCrisis ? <ShieldAlert size={120} /> : <Zap size={120} />}
             </div>
             <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-2xl text-white shadow-xl animate-pulse ${isCrisis ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                   <Brain size={24}/>
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Strategos Oracle: Veredito P0{round}</h3>
                   <p className={`text-[10px] font-black uppercase tracking-widest ${isCrisis ? 'text-rose-400' : 'text-indigo-400'}`}>Deep Reasoning Prediction Node</p>
                </div>
             </div>
             <p className="text-base text-slate-300 leading-relaxed font-medium italic relative z-10">
               {isCrisis 
                 ? "Atenção: Sua liquidez corrente projetada está abaixo do limite de segurança (0.74x). Para evitar a falência técnica no Período 2, recomendamos protocolar Recuperação Judicial na próxima Folha de Decisões."
                 : "Sua unidade apresenta saúde estável. O mercado oráculo identificou uma oportunidade de expansão: limite de crédito disponível de $ 2.5M para aquisição de novas Máquinas BETA."}
             </p>
             <div className="flex flex-wrap gap-4 relative z-10">
                {isCrisis ? (
                   <>
                     <div className="px-5 py-2 bg-rose-600/20 rounded-xl text-rose-500 font-black text-[9px] uppercase tracking-widest border border-rose-500/20 flex items-center gap-2"><ShieldAlert size={12}/> Protocolar RJ</div>
                     <div className="px-5 py-2 bg-amber-600/20 rounded-xl text-amber-500 font-black text-[9px] uppercase tracking-widest border border-amber-500/20 flex items-center gap-2"><Landmark size={12}/> Requisitar Empréstimo</div>
                   </>
                ) : (
                   <>
                     <div className="px-5 py-2 bg-indigo-600/20 rounded-xl text-indigo-400 font-black text-[9px] uppercase tracking-widest border border-indigo-500/20 flex items-center gap-2"><Cpu size={12}/> Oferta: Máquina BETA</div>
                     <div className="px-5 py-2 bg-emerald-600/20 rounded-xl text-emerald-500 font-black text-[9px] uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2"><TrendingUp size={12}/> Upgrade de Share</div>
                   </>
                )}
             </div>
          </div>

          <FinancialSection title="Balanço Patrimonial Inicial" icon={<Package size={24}/>} color="blue" lines={[
             { l: "ATIVO TOTAL", v: "9.176.940", b: true },
             { l: "Disponibilidades (Caixa/Bancos)", v: "840.200", indent: true },
             { l: "ESTOQUES MP & ACABADO", v: "1.466.605", b: true },
             { l: "IMOBILIZADO LÍQUIDO", v: "5.886.600", b: true },
             { l: "PASSIVO TOTAL", v: "4.121.493", b: true },
             { l: "PATRIMÔNIO LÍQUIDO", v: "5.055.447", b: true }
          ]} />

          <FinancialSection title="DRE - Resultado Econômico" icon={<DollarSign size={24}/>} color="emerald" lines={[
             { l: "RECEITA BRUTA DE VENDAS", v: "3.322.735", b: true },
             { l: "(=) LUCRO BRUTO", v: "1.044.555", b: true },
             { l: "(=) LUCRO OPERACIONAL", v: "86.973", b: true },
             { l: "(=) LUCRO LÍQUIDO", v: "73.928", b: true, p: true }
          ]} />
       </div>
       
       <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 space-y-8 shadow-2xl">
             <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3 border-b border-white/5 pb-6"><BarChart3 className="text-orange-500" /> Performance Audit</h3>
             <div className="space-y-6">
                <KpiIndicator label="Liquidez Corrente" val="0.74x" trend="CRÍTICO" color="rose" />
                <KpiIndicator label="Endividamento" val="45%" trend="MÉDIO" color="amber" />
                <KpiIndicator label="Margem Líquida" val="2.2%" trend="ESTÁVEL" color="emerald" />
                <KpiIndicator label="Market Share" val="12.5%" trend="SEED" color="blue" />
             </div>
          </div>
          <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-4">
             <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500"/> Alerta de Recursos</h4>
             <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Sua produção extra consumirá 20% a mais de MP-A por unidade produzida. Monitore o estoque para evitar ruptura.</p>
          </div>
       </div>
    </div>
  );
};

const MatrixReportView = ({ round, data }: any) => {
  const teams = data.length > 0 ? data : Array.from({ length: 8 }).map((_, i) => ({
    team_name: `Unidade Industrial 0${i+1}`,
    net_profit: 73928,
    status: 'NORMAL'
  }));

  return (
    <div className="bg-slate-900 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
       <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Matriz Coletiva de Mercado (Snapshot P0{round})</h3>
          <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-black uppercase">Oracle Monitor Live</div>
       </div>
       <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-white/5">
             <tr><th className="p-8">Unidade</th><th className="p-8">Status</th><th className="p-8">Ativo Total</th><th className="p-8">Lucro Líquido</th><th className="p-8 text-right">Benchmarking</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
             {teams.map((t: any, i: number) => (
               <tr key={i} className="hover:bg-white/[0.03] transition-all group">
                  <td className="p-8 font-black text-white uppercase italic">{t.team_name}</td>
                  <td className="p-8">
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${t.status === 'RJ' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'}`}>{t.status}</span>
                  </td>
                  <td className="p-8 font-mono text-slate-300">9.176.940</td>
                  <td className="p-8 font-mono text-emerald-400 font-bold">$ {t.net_profit.toLocaleString()}</td>
                  <td className="p-8 text-right"><ChevronRight size={14} className="text-slate-700 ml-auto" /></td>
               </tr>
             ))}
          </tbody>
       </table>
    </div>
  );
};

const ReportTab = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 transition-all whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{icon} {label}</button>
);

const FinancialSection = ({ title, icon, color, lines }: any) => (
  <div className="p-10 rounded-[3.5rem] bg-slate-900 border border-white/5 space-y-8 shadow-2xl">
     <div className="flex items-center gap-4 text-white uppercase italic font-black text-xl border-b border-white/5 pb-6">
        <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'}`}>{icon}</div> {title}
     </div>
     <div className="space-y-1">
        {lines.map((ln: any, i: number) => (
           <div key={i} className={`flex justify-between py-4 border-b border-white/5 px-6 ${ln.b ? 'bg-white/[0.03]' : ''}`}>
              <span className={`text-[10px] uppercase tracking-widest ${ln.b ? 'font-black text-slate-300' : 'text-slate-500'} ${ln.indent ? 'pl-8' : ''}`}>{ln.l}</span>
              <span className={`font-mono font-black text-sm ${ln.p ? 'text-emerald-400' : 'text-slate-300'}`}>$ {ln.v}</span>
           </div>
        ))}
     </div>
  </div>
);

const KpiIndicator = ({ label, val, trend, color }: any) => (
  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
     <span className="block text-[8px] font-black text-slate-500 uppercase">{label}</span>
     <div className="flex justify-between items-end">
        <span className="text-2xl font-black text-white italic">{val}</span>
        <span className={`text-[10px] font-black uppercase ${color === 'rose' ? 'text-rose-500' : color === 'amber' ? 'text-amber-500' : 'text-emerald-500'}`}>{trend}</span>
     </div>
  </div>
);

export default Reports;
