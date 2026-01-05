import React, { useState, useMemo } from 'react';
import { 
  Newspaper, Globe, Package, Table, History, Shield, 
  TrendingUp, Activity, BarChart3, PieChart as PieIcon,
  ChevronLeft, ArrowUpRight, Scale, Landmark, Zap, Info,
  Boxes, FileText, Target, AlertTriangle, Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship, UserRole, AdvancedIndicators } from '../types';
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
  const macro = arena.market_indicators;
  
  // Simulated Historical Data for Round 0-1 Transition
  const history: AdvancedIndicators[] = useMemo(() => [
    {
      nldcg_days: 70,
      trit: 0.95,
      insolvency_index: 2.19,
      prazos: { pmre: 58, pmrv: 49, pmpc: 46, pmdo: 69, pmmp: 96 },
      ciclos: { operacional: 107, financeiro: -7, economico: 62 },
      fontes_financiamento: { ecp: 2241288, ccp: -831153, elp: 1500000 },
      scissors_effect: { ncg: 2541209, available_capital: 668847, gap: -1890843 },
      nldcg_components: { receivables: 1823735, inventory_finished: 0, inventory_raw: 1466605, suppliers: 717605, other_payables: 0 }
    }
  ], []);

  const currentInd = history[0];

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
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Oracle System v8.0 Gold • Industrial Node 08</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex gap-4 mr-6">
                  <StatusBadge label="ROUND" val={`0${round}`} color="orange" />
                  <StatusBadge label="STATUS" val="Sincronizado" color="emerald" />
               </div>
               <button onClick={onClose} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-full border border-white/5 transition-all"><ChevronLeft size={24} /></button>
            </div>
         </div>

         <nav className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
            <TabBtn active={activeTab === 'macro'} onClick={() => setActiveTab('macro')} icon={<Globe size={14}/>} label="Conjuntura" />
            <TabBtn active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} icon={<Landmark size={14}/>} label="Fornecedores & Regras" />
            <TabBtn active={activeTab === 'cycles'} onClick={() => setActiveTab('cycles')} icon={<History size={14}/>} label="Ciclos & NLDCG" />
            <TabBtn active={activeTab === 'capital'} onClick={() => setActiveTab('capital')} icon={<Landmark size={14}/>} label="Fontes & Tesoura" />
            <TabBtn active={activeTab === 'benchmarking'} onClick={() => setActiveTab('benchmarking')} icon={<Table size={14}/>} label="Comparativo Coletivo" />
            {userRole === 'tutor' && <TabBtn active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<Shield size={14}/>} label="Tutor Override" color="orange" />}
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
                          <h3 className="text-orange-500 font-black text-xs uppercase tracking-[0.4em] mb-6 italic flex items-center gap-3">
                             <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" /> Headline Período 0{round}
                          </h3>
                          <h2 className="text-6xl font-black text-white italic leading-[0.9] tracking-tighter mb-8">{aiNews.split('\n')[0]}</h2>
                          <p className="text-2xl text-slate-400 font-medium italic leading-relaxed">"{aiNews.split('\n')[1] || "Estabilidade projetada para os próximos ciclos industriais."}"</p>
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
                             "O governo mantém a taxa de juros estável, mas sinaliza reajustes em insumos de MP-A para o Round 2."
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* TAB: CICLOS & NLDCG (FIDELITY PDF) */}
            {activeTab === 'cycles' && (
              <motion.div key="cycles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-10">
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                          <div className="p-3 bg-blue-600 rounded-xl"><History size={20}/></div> Decomposição NLDCG
                       </h3>
                       <div className="space-y-4">
                          <DataLine label="(+) Clientes" val="49" />
                          <DataLine label="(+) Estoque Acabados" val="0" />
                          <DataLine label="(+) Estoque MP-A" val="40" />
                          <DataLine label="(+) Estoque MP-B" val="0" />
                          <DataLine label="(-) Fornecedores" val="19" neg />
                          <DataLine label="(=) NLCDG EM DIAS VENDA" val="70" b highlight />
                       </div>
                       <div className="h-64 mt-10">
                          <Chart options={lineOptions(['P0','P1','P2'])} series={[{name: 'NLCDG Dias', data: [70, 65, 63]}]} type="line" height="100%" />
                       </div>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-10">
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                          <div className="p-3 bg-emerald-600 rounded-xl"><Zap size={20}/></div> Ciclos Estratégicos
                       </h3>
                       <div className="space-y-4">
                          <DataLine label="PMRE (Estoques)" val="58 dias" />
                          <DataLine label="PMRV (Recebimento)" val="49 dias" />
                          <DataLine label="CICLO OPERACIONAL" val="107 dias" b color="blue" />
                          <DataLine label="PMPC (Pagamento Compras)" val="46 dias" neg />
                          <DataLine label="CICLO FINANCEIRO" val="-7 dias" b color="emerald" />
                          <DataLine label="CICLO ECONÔMICO" val="62 dias" b />
                       </div>
                       <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem]">
                          <p className="text-sm text-blue-300 font-medium italic leading-relaxed">
                             "Um Ciclo Financeiro de -7 dias significa que sua unidade está se financiando via fornecedores antes mesmo de pagar a produção. Eficiência máxima em liquidez."
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* TAB: FONTES & TESOURA (PDF) */}
            {activeTab === 'capital' && (
              <motion.div key="capital" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-10">
                       <h3 className="text-xl font-black text-white uppercase italic">Fontes de Giro</h3>
                       <div className="space-y-6">
                          <GiroSource label="ECP (Exigível CP)" val="$ 2.241.288" color="rose" />
                          <GiroSource label="CCP (Capital Próprio)" val="$ -831.153" color="blue" />
                          <GiroSource label="ELP (Longo Prazo)" val="$ 1.500.000" color="emerald" />
                       </div>
                       <div className="h-64">
                          <Chart options={pieOptions(['ECP','CCP','ELP'])} series={[2241288, 831153, 1500000]} type="donut" height="100%" />
                       </div>
                    </div>
                    <div className="lg:col-span-8 bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-8">
                       <div className="flex justify-between items-center">
                          <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Efeito Tesoura</h3>
                          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${currentInd.scissors_effect.gap < 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-900'}`}>
                             Déficit: $ 1.890.843
                          </div>
                       </div>
                       <div className="h-[450px]">
                          <Chart 
                            options={areaOptions(['P0','P1','P2','P3','P4'])} 
                            series={[
                              { name: 'Receita', data: [3.3, 3.6, 3.8, 4.6, 4.8] },
                              { name: 'NCG', data: [2.5, 2.5, 2.6, 2.5, 2.5] },
                              { name: 'Tesouraria', data: [-1.8, -2.2, -2.7, -2.6, -2.9] }
                            ]} 
                            type="area" 
                            height="100%" 
                          />
                       </div>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center italic">
                          Análise da disparidade entre Necessidade de Capital de Giro e Recursos Disponíveis.
                       </p>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* TAB: FORNECEDORES & REGRAS (PDF STREET) */}
            {activeTab === 'suppliers' && (
              <motion.div key="suppliers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                          <div className="p-3 bg-orange-600 rounded-xl"><Landmark size={20}/></div> Tabela de Reajustes v7.5
                       </h3>
                       <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
                          <table className="w-full text-left">
                             <thead className="bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-white/5">
                                <tr><th className="p-6">Componente</th><th className="p-6">Reajuste %</th><th className="p-6">Observação</th></tr>
                             </thead>
                             <tbody className="divide-y divide-white/5 text-[11px] font-bold">
                                <tr><td className="p-6 text-white uppercase italic">Matéria-Prima A/B</td><td className="p-6 text-orange-500">+2,0%</td><td className="p-6 text-slate-500">Expectativa Round 1</td></tr>
                                <tr><td className="p-6 text-white uppercase italic">Custo Distribuição</td><td className="p-6 text-orange-500">+3,0%</td><td className="p-6 text-slate-500">Logística Global</td></tr>
                                <tr><td className="p-6 text-white uppercase italic">W/BRASIL Marketing</td><td className="p-6 text-orange-500">+2,0%</td><td className="p-6 text-slate-500">Fee Mensal</td></tr>
                                <tr><td className="p-6 text-white uppercase italic">Novas Máquinas</td><td className="p-6 text-orange-500">+2,0%</td><td className="p-6 text-slate-500">CapEx</td></tr>
                             </tbody>
                          </table>
                       </div>
                    </div>
                    <div className="space-y-8">
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-4">
                          <div className="p-3 bg-rose-600 rounded-xl"><Gavel size={20}/></div> Protocolos de Governo
                       </h3>
                       <div className="grid grid-cols-1 gap-4">
                          <GovCard icon={<Shield size={20}/>} title="Imposto de Renda" desc="Aliquota fixa de 15,0% sobre o lucro do período." />
                          <GovCard icon={<AlertTriangle size={20}/>} title="Multas e Mora" desc="Atrasos em fornecedores geram multa de 5,0% + TR." />
                          <GovCard icon={<Landmark size={20}/>} title="Financiamento BDI" desc="Linha de 60,0% do Ativo disponível no Período 3." />
                       </div>
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
  <button onClick={onClick} className={`px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 whitespace-nowrap active:scale-95 ${active ? (color === 'orange' ? 'bg-orange-600 text-white shadow-2xl scale-105' : 'bg-blue-600 text-white shadow-2xl scale-105') : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon} {label}
  </button>
);

const HighCard = ({ label, val, sub, trend, pos, icon }: any) => (
  <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[3rem] space-y-4 hover:bg-white/[0.06] transition-all group">
     <div className="flex justify-between items-start">
        <div className="p-4 bg-white/5 text-orange-500 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">{icon}</div>
        <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${pos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{trend}</div>
     </div>
     <div>
        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-3xl font-black text-white italic tracking-tighter">{val}</span>
        <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{sub}</p>
     </div>
  </div>
);

const MacroRow = ({ label, val }: any) => (
  <div className="flex justify-between items-center py-1 group">
     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
     <span className="text-lg font-black text-orange-500 italic font-mono">{val}</span>
  </div>
);

const DataLine = ({ label, val, b, neg, highlight, color }: any) => (
  <div className={`flex justify-between items-center py-3 px-4 rounded-xl transition-all ${highlight ? 'bg-white/5 border border-white/10' : ''} ${color === 'blue' ? 'text-blue-400' : color === 'emerald' ? 'text-emerald-400' : ''}`}>
     <span className={`text-[11px] uppercase tracking-widest ${b ? 'font-black' : 'font-bold text-slate-500'}`}>{label}</span>
     <span className={`text-sm font-black font-mono italic ${neg ? 'text-rose-500' : ''}`}>{neg ? '(' : ''}{val}{neg ? ')' : ''}</span>
  </div>
);

const GiroSource = ({ label, val, color }: any) => (
  <div className="flex justify-between items-center group">
     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     <span className={`text-lg font-black italic font-mono ${color === 'rose' ? 'text-rose-500' : color === 'blue' ? 'text-blue-500' : 'text-emerald-500'}`}>{val}</span>
  </div>
);

const GovCard = ({ icon, title, desc }: any) => (
  <div className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] flex gap-6 items-center group hover:bg-white/10 transition-all">
     <div className="p-4 bg-white/5 text-slate-400 rounded-2xl group-hover:bg-white group-hover:text-slate-900 transition-all">{icon}</div>
     <div>
        <h4 className="text-lg font-black text-white uppercase italic leading-none">{title}</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">{desc}</p>
     </div>
  </div>
);

const StatusBadge = ({ label, val, color }: any) => (
  <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}:</span>
     <span className={`text-[10px] font-black uppercase ${color === 'orange' ? 'text-orange-500' : 'text-emerald-500'}`}>{val}</span>
  </div>
);

// CHART CONFIGS
const lineOptions = (cats: string[]) => ({
  chart: { toolbar: { show: false }, background: 'transparent' },
  colors: ['#f97316'],
  stroke: { curve: 'smooth', width: 4 },
  xaxis: { categories: cats, labels: { style: { colors: '#64748b' } } },
  yaxis: { labels: { style: { colors: '#64748b' } } },
  grid: { borderColor: 'rgba(255,255,255,0.05)' },
  theme: { mode: 'dark' }
});

const pieOptions = (labels: string[]) => ({
  chart: { background: 'transparent' },
  labels,
  colors: ['#ef4444', '#3b82f6', '#10b981'],
  legend: { show: false },
  stroke: { show: false },
  theme: { mode: 'dark' }
});

const areaOptions = (cats: string[]) => ({
  chart: { toolbar: { show: false }, background: 'transparent' },
  colors: ['#3b82f6', '#f97316', '#ef4444'],
  stroke: { curve: 'straight', width: 2 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
  xaxis: { categories: cats, labels: { style: { colors: '#64748b' } } },
  yaxis: { labels: { style: { colors: '#64748b' } } },
  grid: { borderColor: 'rgba(255,255,255,0.05)' },
  theme: { mode: 'dark' },
  legend: { labels: { colors: '#94a3b8' } }
});

export default GazetteViewer;
