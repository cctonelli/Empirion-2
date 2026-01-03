
import React from 'react';
import { 
  Newspaper, TrendingUp, Activity, AlertTriangle, 
  Landmark, DollarSign, Cpu, Boxes, ChevronLeft, Globe, Scale,
  BarChart3, PieChart as PieIcon, Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Championship } from '../types';
import Chart from 'react-apexcharts';

interface GazetteViewerProps {
  arena: Championship;
  news: string;
  round: number;
  onClose: () => void;
}

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, news, round, onClose }) => {
  const macro = arena.market_indicators;
  
  // MOCK DE DADOS COLETIVOS (Será substituído por agregações Supabase no futuro)
  const pulseData = arena.marketPulse || {
    total_rj: 2, total_rej: 1, total_loans_count: 5, total_loans_value: 4500000,
    machines_traded: { bought: 12, sold: 3 }, avg_liquidity: 1.15, avg_debt: 2.4
  };

  const statusOptions: any = {
    chart: { type: 'donut', background: 'transparent' },
    colors: ['#3b82f6', '#f59e0b', '#ef4444'],
    labels: ['Normal', 'Rec. Extrajudicial', 'Rec. Judicial'],
    legend: { show: true, position: 'bottom', labels: { colors: '#94a3b8' } },
    stroke: { show: false },
    plotOptions: { donut: { size: '65%' } }
  };

  const loanOptions: any = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    colors: ['#10b981'],
    xaxis: { categories: ['P1', 'P2', 'P3'], labels: { style: { colors: '#94a3b8' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)' }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f172a] border border-white/10 rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[950px] relative"
    >
      <header className="bg-slate-950 p-8 border-b border-white/10 flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12"><Newspaper size={250} /></div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20"><Newspaper size={28} /></div>
            <div>
               <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Empirion <span className="text-orange-500">Street</span></h1>
               <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Hub Administrativo v6.5 • Ciclo 0{round}</span>
               </div>
            </div>
         </div>
         <button onClick={onClose} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-full transition-all active:scale-90"><ChevronLeft size={24} /></button>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
         {/* SEÇÃO 1: ANALISE DE NOTICIAS IA */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-white/5 pb-12">
            <div className="lg:col-span-7 space-y-8">
               <h3 className="text-xs font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2 italic"> <Globe size={14}/> Manchetes de Ciclo</h3>
               <h2 className="text-5xl font-black text-white italic leading-none tracking-tight">{news.split('\n')[0]}</h2>
               <p className="text-xl text-slate-400 leading-relaxed italic font-medium">{news.substring(news.indexOf('\n') + 1)}</p>
               <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[3rem] space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Scale size={14}/> Veredito Macro Oráculo</h4>
                  <p className="text-xs text-slate-300 font-bold uppercase italic">"A arena industrial registra um aumento de 12% no endividamento agregado. As taxas de RJ estão subindo em resposta à volatilidade regional."</p>
               </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-inner">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-4">Pulso de Estabilidade</h3>
               <div className="h-64">
                  <Chart options={statusOptions} series={[80 - (pulseData.total_rj*10), pulseData.total_rej*10, pulseData.total_rj*10]} type="donut" height="100%" />
               </div>
               <div className="grid grid-cols-3 gap-4 text-center">
                  <StatBox label="RJ Ativas" val={pulseData.total_rj} color="rose" />
                  <StatBox label="Acordos REJ" val={pulseData.total_rej} color="amber" />
                  <StatBox label="Saudáveis" val={8 - pulseData.total_rj - pulseData.total_rej} color="blue" />
               </div>
            </div>
         </div>

         {/* SEÇÃO 2: MÉTRICAS FINANCEIRAS COLETIVAS */}
         <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3"><Activity className="text-blue-500" /> Fluxo de Mercado (Agregado)</h3>
               <span className="text-[9px] font-black text-slate-500 uppercase px-4 py-1.5 bg-white/5 rounded-full border border-white/5">Dados Anônimos Auditados</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <MetricCard icon={<Landmark size={18}/>} label="Crédito Concedido" val={`$ ${(pulseData.total_loans_value/1000000).toFixed(1)}M`} desc={`${pulseData.total_loans_count} Empresas Tomaram`} />
               <MetricCard icon={<Cpu size={18}/>} label="Maquinário (CapEx)" val={`+${pulseData.machines_traded.bought}`} desc={`${pulseData.machines_traded.sold} Máquinas Vendidas`} />
               <MetricCard icon={<TrendingUp size={18}/>} label="CVM (EMPR8)" val={`$ ${macro.stockMarketPrice}`} desc="Média do TSR de Ciclo" />
               <MetricCard icon={<Briefcase size={18}/>} label="Liquidez Média" val={`${pulseData.avg_liquidity}x`} desc="Capacidade de Pagamento" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-6">
                  <h4 className="text-xs font-black uppercase text-emerald-500 tracking-widest">Evolução de Empréstimos Bancários</h4>
                  <Chart options={loanOptions} series={[{ name: 'Volume Total ($)', data: [1200000, 2800000, pulseData.total_loans_value] }]} type="bar" height={220} />
               </div>
               <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-8 flex flex-col justify-center">
                  <h4 className="text-xs font-black uppercase text-indigo-500 tracking-widest">Indicadores Contábeis Médios</h4>
                  <div className="space-y-6">
                     <AvgProgress label="Endividamento Geral" val={72} color="rose" />
                     <AvgProgress label="Giro de Ativo" val={45} color="blue" />
                     <AvgProgress label="Margem Líquida" val={18} color="emerald" />
                  </div>
               </div>
            </div>
         </div>
      </main>

      <footer className="p-6 bg-slate-950 border-t border-white/5 text-center flex justify-between px-10">
         <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">TRANS_ORACLE_V6.5_FDP</p>
         <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest italic">Sincronização Ativa • Oráculo Node 08</p>
      </footer>
    </motion.div>
  );
};

const StatBox = ({ label, val, color }: any) => (
  <div className="space-y-1">
     <span className={`text-[8px] font-black uppercase tracking-tighter ${color === 'rose' ? 'text-rose-500' : color === 'amber' ? 'text-amber-500' : 'text-blue-500'}`}>{label}</span>
     <span className="block text-xl font-black text-white font-mono">{val}</span>
  </div>
);

const MetricCard = ({ icon, label, val, desc }: any) => (
  <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-3 hover:bg-white/[0.05] transition-all">
     <div className="p-2.5 bg-white/5 rounded-xl w-fit text-blue-400 shadow-lg">{icon}</div>
     <div>
        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-2xl font-black text-white italic">{val}</span>
        <span className="block text-[7px] font-bold text-slate-600 uppercase mt-1">{desc}</span>
     </div>
  </div>
);

const AvgProgress = ({ label, val, color }: any) => (
  <div className="space-y-2">
     <div className="flex justify-between text-[8px] font-black uppercase">
        <span className="text-slate-500">{label}</span>
        <span className="text-white">{val}%</span>
     </div>
     <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color === 'rose' ? 'bg-rose-500 shadow-[0_0_10px_#ef4444]' : color === 'blue' ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} style={{ width: `${val}%` }} />
     </div>
  </div>
);

export default GazetteViewer;
