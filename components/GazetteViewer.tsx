import React, { useState, useMemo } from 'react';
import { 
  Newspaper, Globe, Package, Table, History, Shield, 
  TrendingUp, Activity, BarChart3, PieChart as PieIcon,
  ChevronLeft, ArrowUpRight, Scale, Landmark, Zap, Info,
  Boxes, FileText, Target, AlertTriangle, Gavel, Download, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship, UserRole, AdvancedIndicators, Team } from '../types';
import Chart from 'react-apexcharts';

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  onClose: () => void;
}

type GazetteTab = 'macro' | 'suppliers' | 'cycles' | 'capital' | 'benchmarking' | 'tutor';

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<GazetteTab>('macro');
  const teams = arena.teams || [];
  
  // Simulated Historical Data for Round 0-1 Transition
  const currentInd: AdvancedIndicators = useMemo(() => ({
    nldcg_days: 70,
    trit: 0.95,
    insolvency_index: 2.19,
    prazos: { pmre: 58, pmrv: 49, pmpc: 46, pmdo: 69, pmmp: 96 },
    ciclos: { operacional: 107, financeiro: -7, economico: 62 },
    fontes_financiamento: { ecp: 2241288, ccp: -831153, elp: 1500000 },
    scissors_effect: { ncg: 2541209, available_capital: 668847, gap: -1890843 },
    nldcg_components: { receivables: 1823735, inventory_finished: 0, inventory_raw: 1466605, suppliers: 717605, other_payables: 31528 }
  }), []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[1100px] relative"
    >
      {/* 1. TOP COMMAND BAR */}
      <header className="bg-slate-950 p-8 border-b border-white/5">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-orange-600 text-white rounded-3xl shadow-2xl shadow-orange-500/20"><Newspaper size={32} /></div>
               <div>
                  <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Empirion <span className="text-orange-500">Street</span></h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Oracle System v6.0 Gold • Audit Node 08</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex gap-4 mr-6">
                  <StatusBadge label="ROUND" val={`0${round}`} color="orange" />
                  <StatusBadge label="STATUS" val="Sincronizado" color="emerald" />
               </div>
               <button onClick={onClose} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-full border border-white/5 transition-all active:scale-90"><ChevronLeft size={24} /></button>
            </div>
         </div>

         <nav className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} icon={<Globe size={14}/>} label="Conjuntura" />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} icon={<Landmark size={14}/>} label="Fornecedores" />
            <TabBtn active={activeTab === 'cycles'} onClick={() => setActiveTab('cycles')} icon={<History size={14}/>} label="Ciclos & NLDCG" />
            <TabBtn active={activeTab === 'benchmarking'} onClick={() => setActiveTab('benchmarking')} icon={<Table size={14}/>} label="Matriz 8 Equipes" />
            {userRole === 'tutor' && <TabBtn active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<Shield size={14}/>} label="Tutor Master" color="orange" />}
         </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
         <AnimatePresence mode="wait">
            
            {/* TAB: CONJUNTURA (MACRO) */}
            {activeTab === 'macro' && (
              <motion.div key="macro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                       <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"><Zap size={200} /></div>
                          <h3 className="text-orange-500 font-black text-[9px] uppercase tracking-[0.4em] mb-6 italic flex items-center gap-3">
                             <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" /> Headline Período 0{round}
                          </h3>
                          <h2 className="text-6xl font-black text-white italic leading-[0.9] tracking-tighter mb-8">{aiNews.split('\n')[0] || "Empirion Street: Estabilidade Estratégica"}</h2>
                          <p className="text-2xl text-slate-400 font-medium italic leading-relaxed">"{aiNews.split('\n')[1] || "O conselho administrativo sinaliza paridade absoluta no início do ciclo industrial."}"</p>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <HighCard label="TRIT" val={`${currentInd.trit}%`} sub="Retorno Investimento" trend="+0.1%" pos icon={<Target size={20}/>} />
                          <HighCard label="SOLVÊNCIA" val={currentInd.insolvency_index.toString()} sub="Índice Kanitz" trend="Seguro" pos icon={<Shield size={20}/>} />
                          <HighCard label="NLDCG" val={`${currentInd.nldcg_days} dias`} sub="Dias de Venda" trend="Estável" pos icon={<Landmark size={20}/>} />
                       </div>
                    </div>
                    <div className="lg:col-span-4 bg-slate-900/50 p-10 rounded-[4rem] border border-white/5 space-y-8">
                       <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Ambiente Econômico</h3>
                       <div className="space-y-6">
                          <MacroRow label="Crescimento Setor" val="3.0%" />
                          <MacroRow label="Inflação Período" val="1.0%" />
                          <MacroRow label="Taxa TR Mensal" val="3.0%" />
                          <MacroRow label="Juros Fornecedor" val="2.0%" />
                          <MacroRow label="Importados" val="0.0%" />
                       </div>
                       <div className="pt-6 border-t border-white/5">
                          <p className="text-[11px] text-slate-400 leading-relaxed italic">
                             "O motor industrial prevê reajustes de 2% em insumos de MP-A para o Round 1. Planeje seu caixa."
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* TAB: BENCHMARKING (FULL MATRIX 8 EMPRESAS) */}
            {activeTab === 'benchmarking' && (
              <motion.div key="bench" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                 <div className="flex justify-between items-end">
                    <div>
                       <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Empire <span className="text-orange-500">Comparison Matrix</span></h2>
                       <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 italic">Snapshot simultâneo das 8 unidades industriais • Ciclo 0{round}</p>
                    </div>
                    <div className="flex gap-4">
                       <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 flex items-center gap-3 font-black text-[9px] uppercase hover:text-white transition-all shadow-xl">
                          <Download size={16}/> Export Full Snapshot
                       </button>
                    </div>
                 </div>

                 <div className="bg-slate-950 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                       <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-900 text-slate-500 font-black text-[9px] uppercase tracking-widest sticky top-0 z-20">
                             <tr className="border-b border-white/10">
                                <th className="p-8 border-r border-white/5 bg-slate-900 sticky left-0 z-30 min-w-[320px]">ESTRUTURA CONTÁBIL ($)</th>
                                {teams.map((t: Team, i: number) => (
                                  <th key={t.id} className="p-8 min-w-[200px] border-r border-white/5 text-center">
                                     <div className="text-orange-500 italic text-base mb-1">{t.name}</div>
                                     <div className="text-[7px] font-black opacity-30 tracking-[0.3em] uppercase">Unidade 0{i+1}</div>
                                  </th>
                                ))}
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                             <MatrixRow label="RECEITA BRUTA VENDAS" teams={teams} val="3.322.735" bold />
                             <MatrixRow label="(-) CPV INDUSTRIAL" teams={teams} val="2.278.180" neg />
                             <MatrixRow label="(=) LUCRO BRUTO" teams={teams} val="1.044.555" highlight />
                             <MatrixRow label="(-) DESPESAS VENDAS" teams={teams} val="802.702" indent />
                             <MatrixRow label="(-) DESPESAS ADM" teams={teams} val="114.880" indent />
                             <MatrixRow label="(-) DESPESAS FIN." teams={teams} val="40.000" indent />
                             <MatrixRow label="LUCRO OPERACIONAL (EBIT)" teams={teams} val="86.973" bold />
                             <MatrixRow label="(-) PROVISÃO IR (15%)" teams={teams} val="13.045" neg />
                             <MatrixRow label="LUCRO LÍQUIDO PERÍODO" teams={teams} val="73.928" total highlight />
                             
                             <tr className="bg-white/10"><td colSpan={teams.length + 1} className="p-2 border-y border-white/10"></td></tr>
                             
                             <MatrixRow label="ATIVO CIRCULANTE" teams={teams} val="3.290.340" bold />
                             <MatrixRow label="CAIXA & BANCOS" teams={teams} val="840.200" indent />
                             <MatrixRow label="ESTOQUES TOTAIS" teams={teams} val="1.466.605" indent />
                             <MatrixRow label="CONTAS A RECEBER" teams={teams} val="1.823.735" indent />
                             <MatrixRow label="IMOBILIZADO LÍQUIDO" teams={teams} val="5.886.600" bold />
                             <MatrixRow label="Máquinas e Equip." teams={teams} val="2.360.000" indent />
                             <MatrixRow label="(-) Depreciação Máq." teams={teams} val="-811.500" indent neg />
                             <MatrixRow label="TOTAL DO ATIVO" teams={teams} val="9.176.940" total highlight />

                             <tr className="bg-white/10"><td colSpan={teams.length + 1} className="p-2 border-y border-white/10"></td></tr>

                             <MatrixRow label="PASSIVO CIRCULANTE" teams={teams} val="4.121.493" bold />
                             <MatrixRow label="Fornecedores" teams={teams} val="717.605" indent />
                             <MatrixRow label="Empréstimos CP" teams={teams} val="1.872.362" indent />
                             <MatrixRow label="EXIGÍVEL LONGO PRAZO" teams={teams} val="1.500.000" bold />
                             <MatrixRow label="PATRIMÔNIO LÍQUIDO" teams={teams} val="5.055.447" bold highlight />
                          </tbody>
                       </table>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* TAB: FORNECEDORES & REGRAS */}
            {activeTab === 'suppliers' && (
              <motion.div key="suppliers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                       <div className="p-3 bg-orange-600 rounded-xl shadow-lg shadow-orange-500/20"><Landmark size={20}/></div> Tabela de Reajustes Oracle
                    </h3>
                    <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl">
                       <table className="w-full text-left">
                          <thead className="bg-slate-950 text-slate-500 font-black text-[9px] uppercase tracking-widest border-b border-white/10">
                             <tr><th className="p-8">Componente</th><th className="p-8">Preço/Taxa</th><th className="p-8">Expectativa</th></tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-[11px] font-bold">
                             <tr><td className="p-8 text-white uppercase italic">Matéria-Prima A (Unid)</td><td className="p-8 text-orange-500">$ 20,20</td><td className="p-8 text-slate-500">+2,0% Próximo Período</td></tr>
                             <tr><td className="p-8 text-white uppercase italic">Matéria-Prima B (Unid)</td><td className="p-8 text-orange-500">$ 40,40</td><td className="p-8 text-slate-500">+2,0% Próximo Período</td></tr>
                             <tr><td className="p-8 text-white uppercase italic">Custo Logístico (Unid)</td><td className="p-8 text-orange-500">$ 50,50</td><td className="p-8 text-slate-500">Estável</td></tr>
                             <tr><td className="p-8 text-white uppercase italic">Juros Fornecedor</td><td className="p-8 text-orange-500">2.0%</td><td className="p-8 text-slate-500">Mensal Composto</td></tr>
                          </tbody>
                       </table>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                       <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20"><Gavel size={20}/></div> Protocolos de Transmissão
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                       <GovCard icon={<Shield size={20}/>} title="Imposto de Renda" desc="Aliquota fixa de 15,0% sobre o lucro líquido (DRE)." />
                       <GovCard icon={<Landmark size={20}/>} title="Capacidade Maquinário" desc="Máquina Alfa: 10k unid/ciclo. Beta: 30k. Gama: 60k." />
                       <GovCard icon={<AlertTriangle size={20}/>} title="Prazo de Pagamento" desc="Fornecedores MP A/B exigem pagamento 100% à vista." />
                    </div>
                 </div>
              </motion.div>
            )}

         </AnimatePresence>
      </main>

      <footer className="p-8 bg-slate-950 border-t border-white/5 flex justify-between items-center px-14">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-xl text-white shadow-xl shadow-orange-500/20"><Landmark size={14}/></div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">EMPIRE_STREET_FIDELITY_GOLD_NODE_08</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Neural Oracle Sync: Active</span>
            <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_15px_#f97316]" />
         </div>
      </footer>
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, label, icon, color = 'blue' }: any) => (
  <button onClick={onClick} className={`px-8 py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-4 whitespace-nowrap active:scale-95 ${active ? (color === 'orange' ? 'bg-orange-600 text-white shadow-2xl scale-105' : 'bg-blue-600 text-white shadow-2xl scale-105') : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon} {label}
  </button>
);

const MatrixRow = ({ label, teams, val, bold, neg, highlight, total, indent }: any) => (
  <tr className={`hover:bg-white/[0.03] transition-all group ${bold ? 'font-black text-slate-200 bg-white/[0.02]' : 'text-slate-500'} ${total ? 'bg-slate-950' : ''}`}>
     <td className={`p-8 border-r border-white/5 sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 uppercase tracking-tighter text-[9px] ${highlight ? 'text-orange-500 italic' : ''} ${indent ? 'pl-16 italic text-[8px]' : ''}`}>
        {label}
     </td>
     {teams.map((t: any) => (
       <td key={t.id} className="p-8 border-r border-white/5 text-center font-mono text-base">
          <span className={`${neg ? 'text-rose-500 font-bold' : highlight ? 'text-orange-400 font-black' : ''}`}>
             {neg && '('}$ {val}{neg && ')'}
          </span>
       </td>
     ))}
  </tr>
);

const HighCard = ({ label, val, sub, trend, pos, icon }: any) => (
  <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[3rem] space-y-4 hover:bg-white/[0.06] transition-all group">
     <div className="flex justify-between items-start">
        <div className="p-4 bg-white/5 text-orange-500 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">{icon}</div>
        <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${pos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{trend}</div>
     </div>
     <div>
        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-3xl font-black text-white italic tracking-tighter">{val}</span>
        <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">{sub}</p>
     </div>
  </div>
);

const MacroRow = ({ label, val }: any) => (
  <div className="flex justify-between items-center py-1 group">
     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
     <span className="text-lg font-black text-orange-500 italic font-mono">{val}</span>
  </div>
);

const GovCard = ({ icon, title, desc }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex gap-6 items-center group hover:bg-white/10 transition-all shadow-xl">
     <div className="p-4 bg-white/5 text-slate-400 rounded-2xl group-hover:bg-white group-hover:text-slate-900 transition-all">{icon}</div>
     <div>
        <h4 className="text-lg font-black text-white uppercase italic leading-none">{title}</h4>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1">{desc}</p>
     </div>
  </div>
);

const StatusBadge = ({ label, val, color }: any) => (
  <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}:</span>
     <span className={`text-[10px] font-black uppercase ${color === 'orange' ? 'text-orange-500' : 'text-emerald-500'}`}>{val}</span>
  </div>
);

export default GazetteViewer;