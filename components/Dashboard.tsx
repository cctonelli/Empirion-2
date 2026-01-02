
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, Zap, BarChart3, 
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Star, Users,
  ShieldCheck, MessageSquare, Megaphone, Send, Globe, Map as MapIcon,
  Cpu, Newspaper, Landmark, AlertTriangle, ChevronRight, LayoutGrid
} from 'lucide-react';
import ChampionshipTimer from './ChampionshipTimer';
import LiveBriefing from './LiveBriefing';
import { generateMarketAnalysis, generateGazetaNews } from '../services/gemini';
import { BlackSwanEvent, ScenarioType, MessageBoardItem, Branch } from '../types';

const Dashboard: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [gazetaNews, setGazetaNews] = useState<string>('Transmissão de dados criptografados...');
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [scenarioType, setScenarioType] = useState<ScenarioType>('simulated');
  
  const [messages, setMessages] = useState<MessageBoardItem[]>([
    { id: '1', sender: 'Coordenação Central', text: 'Início da Rodada 01. Analisem os relatórios de TSR.', timestamp: '08:00', isImportant: true },
    { id: '2', sender: 'Strategos AI', text: `Setor ${branch.toUpperCase()}: Detectada anomalia de custos na Região 04.`, timestamp: '10:15' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const [analysis, news] = await Promise.all([
          generateMarketAnalysis('Arena Empirion Supremo', 1, branch, scenarioType),
          generateGazetaNews({ period: 1, leader: 'Empresa 8', inflation: '1.0%', scenarioType, focus: [branch] })
        ]);
        setAiInsight(analysis);
        setGazetaNews(news);
      } catch (err) {
        setAiInsight("Falha no link neural.");
        setGazetaNews("Gazeta Offline.");
      } finally {
        setIsInsightLoading(false);
      }
    };
    fetchIntelligence();
  }, [scenarioType, branch]);

  const marketShareOptions: any = {
    chart: { type: 'donut', background: 'transparent' },
    stroke: { show: false },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6', '#f97316'],
    labels: ['Alpha', 'Beta', 'Gama', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Sua Equipe'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            name: { show: true, color: '#94a3b8', fontSize: '10px', fontWeight: 800 },
            value: { show: true, color: '#fff', fontSize: '20px', fontWeight: 900 },
            total: { show: true, label: 'MARKET SHARE', color: '#94a3b8' }
          }
        }
      }
    }
  };

  const tsrTrendOptions: any = {
    chart: { toolbar: { show: false }, sparkline: { enabled: true } },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#3b82f6'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } },
    tooltip: { enabled: false }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Ticker Supremo */}
      <div className="bg-slate-950 border-b border-white/5 h-12 flex items-center -mx-10 -mt-10 mb-10 overflow-hidden">
        <div className="flex animate-[ticker_40s_linear_infinite] whitespace-nowrap gap-16 text-[10px] font-black uppercase tracking-[0.2em]">
          <TickerItem label="Índice Empirion" value="1.04" change="+4.2%" up />
          <TickerItem label="Commodity Core" value="15.20" change="-0.8%" />
          <TickerItem label="Taxa Referencial (TR)" value="12.0%" change="0.0%" neutral />
          <TickerItem label="Market Cap Global" value="$ 82.4B" change="+1.2%" up />
          <TickerItem label="Oracle Audit" value="OK" change="v6.0" up />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4 md:px-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 className="text-white" size={20} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Strategic <span className="text-blue-500">Command</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                Build v6.0 GOLD • Engine Fidelity
             </span>
             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${
               scenarioType === 'real' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
             }`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${scenarioType === 'real' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                {scenarioType === 'real' ? 'Grounded AI Active' : 'Simulated Logic'}
             </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <LiveBriefing />
          <ChampionshipTimer />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4 md:px-0">
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card p-8 rounded-[3rem] flex flex-col items-center justify-center min-h-[300px]">
              <Chart options={marketShareOptions} series={[15, 12, 10, 14, 18, 12, 8, 11]} type="donut" width="100%" />
            </div>

            <div className="md:col-span-2 premium-card p-8 rounded-[3rem] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Cpu size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white"><Sparkles size={20} /></div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Strategos Advisor</h3>
                 </div>
                 {isInsightLoading ? (
                   <div className="space-y-3">
                      <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
                   </div>
                 ) : (
                   <p className="text-sm font-medium text-slate-300 leading-relaxed font-mono">
                     <span className="text-blue-500 font-black">SYSTEM_MSG:</span> {aiInsight}
                   </p>
                 )}
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center gap-4">
                 <button className="text-[10px] font-black uppercase text-blue-500 hover:text-white transition-colors">Solicitar Re-análise neural</button>
                 <div className="flex-1 h-[1px] bg-white/5"></div>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="premium-card rounded-[3.5rem] border-2 border-slate-800 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white text-slate-950 rounded-2xl flex items-center justify-center shadow-xl">
                    <Newspaper size={28} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Gazeta {branch}</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Órgão Oficial v6.0 GOLD • Registro Oracle Node: 2026-X</p>
                 </div>
              </div>
              <div className="text-right px-6 border-l border-white/5">
                 <span className="block text-[10px] font-black text-slate-400 uppercase">Período Fiscal</span>
                 <span className="text-2xl font-black text-white italic">P01</span>
              </div>
            </div>
            <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="md:col-span-2 space-y-6">
                  <h2 className="text-4xl font-black text-white leading-[1.1] tracking-tight hover:text-blue-400 transition-colors cursor-default">
                    {gazetaNews}
                  </h2>
                  <div className="h-[2px] bg-gradient-to-r from-blue-600 to-transparent w-full"></div>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                     <Activity size={18} className="text-orange-500" /> 
                     Relatório de Mercado: Investidores monitoram a taxa de TSR da Empresa 8 como benchmark de resiliência global.
                  </div>
               </div>
               <div className="glass-panel p-6 rounded-[2rem] space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2">
                    <Landmark size={14} /> Mercado de Capitais
                  </h4>
                  <div className="space-y-4">
                     <StockRow symbol="EMPR-08" price="1.04" up />
                     <StockRow symbol="EMPR-01" price="0.98" />
                     <StockRow symbol="EMPR-05" price="1.12" up />
                     <StockRow symbol="EMPR-02" price="1.00" neutral />
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="premium-card p-10 rounded-[3rem] space-y-10">
              <h3 className="text-xl font-black uppercase text-white flex items-center gap-4 italic leading-none">
                 <div className="p-2 bg-blue-600 rounded-xl"><Target size={20}/></div> Core KPIs
              </h3>
              <div className="space-y-10">
                 <KpiRow label="Resultado Líquido" value="$ 73.926" trend="+100%" positive icon={<DollarSign size={16}/>} />
                 <KpiRow label="Score Estratégico" value="82.4" trend="+4.1" positive icon={<Star size={16}/>} />
                 <KpiRow label="Eficiência de Staff" value="94.2%" trend="+2.4%" positive icon={<Users size={16}/>} />
              </div>
              <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-xl shadow-blue-500/20">Auditoria de Balanço</button>
           </div>

           <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white text-slate-950 rounded-lg"><MessageSquare size={18} /></div>
                    <h3 className="text-lg font-black text-white uppercase italic">War Feed</h3>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                 {messages.map(m => (
                   <div key={m.id} className={`p-5 rounded-3xl ${m.isImportant ? 'bg-blue-600/10 border border-blue-500/20' : 'bg-white/5 border border-white/5'}`}>
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[9px] font-black uppercase text-blue-400">{m.sender}</span>
                         <span className="text-[8px] font-bold text-slate-500">{m.timestamp}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed">{m.text}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

const TickerItem = ({ label, value, change, up, neutral }: any) => (
  <div className="flex items-center gap-4">
    <span className="text-slate-500">{label}</span>
    <span className="font-mono font-black text-white">{value}</span>
    <span className={`font-mono text-[9px] ${up ? 'text-emerald-500' : neutral ? 'text-slate-500' : 'text-rose-500'}`}>
      {change}
    </span>
  </div>
);

const StockRow = ({ symbol, price, up, neutral }: any) => (
  <div className="flex items-center justify-between group">
    <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 transition-colors">{symbol}</span>
    <div className="flex items-center gap-2">
       <span className="text-sm font-black text-white font-mono">{price}</span>
       {up ? <ArrowUpRight size={14} className="text-emerald-500" /> : neutral ? <Activity size={12} className="text-slate-500" /> : <ArrowDownRight size={14} className="text-rose-500" />}
    </div>
  </div>
);

const KpiRow = ({ label, value, trend, positive, icon }: any) => (
  <div className="flex items-center justify-between group cursor-default">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 text-slate-500 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          {icon}
        </div>
        <div>
           <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
           <span className="text-2xl font-black text-white font-mono tracking-tighter italic">{value}</span>
        </div>
     </div>
     <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
       {trend}
     </div>
  </div>
);

export default Dashboard;
