
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Activity, DollarSign, Target, Zap, Briefcase, Globe, BarChart3, 
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Star, Users, Newspaper,
  AlertTriangle, ChevronRight, Gavel, Landmark, Info, Flame, Newspaper as NewspaperIcon,
  ShieldCheck, Leaf
} from 'lucide-react';
import ChampionshipTimer from './ChampionshipTimer';
import { generateMarketAnalysis, generateGazetaNews } from '../services/gemini';
import { BlackSwanEvent, ScenarioType } from '../types';

const Dashboard: React.FC = () => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [gazetaNews, setGazetaNews] = useState<string>('Sincronizando agências de notícias...');
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<BlackSwanEvent | null>(null);
  const [scenarioType, setScenarioType] = useState<ScenarioType>('simulated');

  useEffect(() => {
    const fetchMarketIntelligence = async () => {
      try {
        const [analysis, news] = await Promise.all([
          generateMarketAnalysis('Arena Industrial Alpha', 1, 'industrial', scenarioType),
          generateGazetaNews({ period: 1, leader: 'Empresa 8', inflation: '1.0%', scenarioType })
        ]);
        setAiInsight(analysis);
        setGazetaNews(news);
      } catch (err) {
        setAiInsight("Link tático comprometido. Verifique suas reservas.");
        setGazetaNews("Erro na transmissão da Gazeta. Aguardando novo período.");
      } finally {
        setIsInsightLoading(false);
      }
    };
    fetchMarketIntelligence();
  }, [scenarioType]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      {/* Dynamic Market Ticker */}
      <div className="bg-slate-900 overflow-hidden h-10 flex items-center border-b border-white/10 -mx-8 -mt-8 mb-8">
        <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap gap-12 text-[10px] font-black uppercase tracking-widest text-blue-400">
          <TickerItem label="Bolsa (IBOV)" value="128.450" change="+1.2%" />
          <TickerItem label="Inflação P1" value="1.0%" change="0.0%" color="text-slate-400" />
          <TickerItem label="Cotação MP A" value="20.20" change="+4.5%" color="text-rose-400" />
          <TickerItem label="Juros TR" value="2.0%" change="0.0%" color="text-slate-400" />
          <TickerItem label="Dólar" value="5.24" change="-0.8%" color="text-emerald-400" />
          <TickerItem label="Ação EMP-08" value="1.04" change="+4.2%" color="text-emerald-400" />
          {/* Duplicated for smooth infinite scroll */}
          <TickerItem label="Bolsa (IBOV)" value="128.450" change="+1.2%" />
          <TickerItem label="Inflação P1" value="1.0%" change="0.0%" color="text-slate-400" />
          <TickerItem label="Cotação MP A" value="20.20" change="+4.5%" color="text-rose-400" />
          <TickerItem label="Juros TR" value="2.0%" change="0.0%" color="text-slate-400" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                <BarChart3 size={24} />
             </div>
             Empirion War Room
          </h1>
          <div className="flex items-center gap-3">
             <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">
               Status Estratégico: Rodada 01 - Engine v5.1 GOLD
             </p>
             <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${scenarioType === 'real' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {scenarioType === 'real' ? 'Grounded AI Scenario' : 'Simulated Protocol'}
             </span>
          </div>
        </div>
        <ChampionshipTimer />
      </div>

      {activeEvent && (
        <div className="p-8 bg-rose-600 rounded-[2.5rem] text-white shadow-2xl animate-in slide-in-from-top-10 duration-700 border-4 border-white/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
              <Flame size={200} />
           </div>
           <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0 backdrop-blur-md">
                 <AlertTriangle size={40} className="text-white animate-pulse" />
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                 <h2 className="text-3xl font-black uppercase tracking-tight">{activeEvent.title}</h2>
                 <p className="text-rose-100 font-medium text-lg leading-relaxed">{activeEvent.description}</p>
                 <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Demanda: {(activeEvent.modifiers.demand * 100).toFixed(0)}%</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Inflação: +{(activeEvent.modifiers.inflation * 100).toFixed(0)}%</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Produtividade: {(activeEvent.modifiers.productivity * 100).toFixed(0)}%</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Newspaper-style Gazeta Industrial */}
           <div className="bg-white rounded-[3.5rem] border-[3px] border-slate-900 shadow-2xl overflow-hidden flex flex-col group min-h-[500px]">
              <div className="p-8 border-b-[3px] border-slate-900 bg-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 text-white rounded-xl">
                       <NewspaperIcon size={24} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 uppercase leading-none tracking-tighter italic">Gazeta Industrial</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Órgão Oficial de Informação do Setor • v5.1 GOLD</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="block text-[10px] font-black text-slate-900 uppercase">P01 • Jan/2026</span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Edição de Lançamento</span>
                 </div>
              </div>
              
              <div className="flex-1 p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="md:col-span-2 space-y-8">
                    <div className="space-y-6">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">
                          <Landmark size={12} /> Destaque CVM
                       </div>
                       <div className="text-4xl font-serif font-black text-slate-900 leading-[1.1] tracking-tight first-letter:text-7xl first-letter:float-left first-letter:mr-4 first-letter:font-black first-letter:leading-[0.8] first-letter:text-slate-900">
                          {gazetaNews}
                       </div>
                    </div>
                    <div className="h-[1px] bg-slate-100 w-full"></div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                             <TrendingUp size={18} />
                          </div>
                          <p className="text-xs font-bold text-slate-600 leading-tight">Projeção CVM: Setor Industrial deve crescer <span className="text-emerald-600 font-black">4.5%</span> no próximo período devido à baixa TR.</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 space-y-8 h-fit self-start">
                    <h4 className="text-[11px] font-black uppercase text-slate-900 border-b border-slate-200 pb-4 flex items-center gap-2">
                       <Info size={14} className="text-blue-500" /> Boletim Macro
                    </h4>
                    <div className="space-y-6">
                       <div>
                          <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">Insumo: MP A</span>
                          <div className="flex items-end justify-between">
                             <span className="text-xl font-black text-slate-900 font-mono">$ 20.20</span>
                             <span className="text-[10px] font-black text-rose-500">+4.5%</span>
                          </div>
                       </div>
                       <div>
                          <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">Piso Salarial</span>
                          <div className="flex items-end justify-between">
                             <span className="text-xl font-black text-slate-900 font-mono">$ 1.340</span>
                             <span className="text-[10px] font-black text-slate-400">Fixed</span>
                          </div>
                       </div>
                       <div>
                          <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">Câmbio (USD)</span>
                          <div className="flex items-end justify-between">
                             <span className="text-xl font-black text-slate-900 font-mono">$ 5.24</span>
                             <span className="text-[10px] font-black text-emerald-500">-0.8%</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-slate-900 flex justify-end">
                 <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:text-blue-400 transition-colors">
                    Leia o Relatório Coletivo Completo <ChevronRight size={14}/>
                 </button>
              </div>
           </div>

           {/* Strategos AI Oracle (v5.1 Gold) */}
           <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl border border-white/5">
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Sparkles size={24}/>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Strategos AI Predictive Core</span>
                          <span className="text-xs font-bold text-slate-400">Deep Reasoning Engine • v5.1 GOLD</span>
                       </div>
                    </div>
                 </div>
                 {isInsightLoading ? (
                    <div className="space-y-4">
                       <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
                       <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse"></div>
                       <div className="h-4 bg-white/5 rounded-full w-4/6 animate-pulse"></div>
                    </div>
                 ) : (
                    <p className="text-2xl font-bold italic leading-relaxed text-slate-100">
                      "{aiInsight}"
                    </p>
                 )}
              </div>
              <div className="absolute -bottom-20 -right-20 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Landmark size={400} />
              </div>
           </div>
        </div>

        {/* Sidebar KPIs and War Alerts */}
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 group transition-all hover:shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-4">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Target size={20}/></div>
                 Strategic Hub
              </h3>
              <div className="space-y-8">
                 <KpiRow label="Lucro Líquido" value="$ 73.926" trend="+100%" positive icon={<DollarSign size={16}/>} />
                 <KpiRow label="Market Share" value="12.5%" trend="+2.4%" positive icon={<Target size={16}/>} />
                 <KpiRow label="Reputação Score" value="82.4" trend="+4.1" positive icon={<Star size={16}/>} />
              </div>
           </div>

           <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <ShieldCheck size={80} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                 <Leaf className="text-emerald-400" size={24}/>
                 ESG Monitor (v5.1)
              </h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex gap-4 transition-colors hover:bg-white/10">
                    <Activity className="text-emerald-400 shrink-0" size={20} />
                    <div className="space-y-1">
                       <span className="block text-[10px] font-black uppercase text-blue-300 tracking-widest">Social Score</span>
                       <span className="text-sm font-black text-slate-100">88.5 - Excelência em RH</span>
                    </div>
                 </div>
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex gap-4 transition-colors hover:bg-white/10">
                    <Globe className="text-blue-400 shrink-0" size={20} />
                    <div className="space-y-1">
                       <span className="block text-[10px] font-black uppercase text-blue-300 tracking-widest">Governança</span>
                       <span className="text-sm font-black text-slate-100">Status: Regular CVM</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
              <h4 className="text-[11px] font-black uppercase tracking-widest mb-4">Métrica Community Arena</h4>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Star size={20} className="fill-current text-amber-400" />
                    <span className="text-3xl font-black">4.8</span>
                 </div>
                 <div className="text-right">
                    <span className="block text-[9px] font-black uppercase opacity-60">Score de Inovação</span>
                    <span className="text-xs font-bold">Top 3 do Campeonato</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
         <div className="px-6 py-2 bg-slate-100 rounded-full flex items-center gap-3 border border-slate-200">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">Empirion Gold Engine v5.1.0</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
         </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const TickerItem = ({ label, value, change, color = "text-white" }: any) => (
  <div className="flex items-center gap-3">
    <span className="text-slate-500">{label}</span>
    <span className={`font-mono font-black ${color}`}>{value}</span>
    <span className={`font-mono text-[8px] ${change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{change}</span>
  </div>
);

const KpiRow = ({ label, value, trend, positive, icon }: any) => (
  <div className="flex items-center justify-between group cursor-default">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
           {icon}
        </div>
        <div>
           <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
           <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{value}</span>
        </div>
     </div>
     <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend}
     </div>
  </div>
);

export default Dashboard;
