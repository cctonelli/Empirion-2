
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, Zap, Briefcase, Globe, BarChart3, 
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Star, Users, Newspaper,
  AlertTriangle, ChevronRight
} from 'lucide-react';
import ChampionshipTimer from './ChampionshipTimer';
import { generateMarketAnalysis } from '../services/gemini';

const Dashboard: React.FC = () => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  const ApexChart = (Chart as any).default || Chart;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ApexCharts = ApexCharts;
      setChartReady(true);
    }

    const fetchInsight = async () => {
      try {
        const result = await generateMarketAnalysis('Industrial Hub Alpha', 1, 'industrial');
        setAiInsight(result);
      } catch (err) {
        setAiInsight("Intelligence feed interrupted. Maintain defensive posture.");
      } finally {
        setIsInsightLoading(false);
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <BarChart3 size={24} />
             </div>
             Control Room
          </h1>
          <p className="text-slate-500 font-medium mt-1">Status Report: Período 1 - Operação em regime de estabilidade.</p>
        </div>
        <ChampionshipTimer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        <div className="lg:col-span-2 space-y-8">
           {/* Gazeta Industrial Card */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 bg-slate-50 md:w-80 flex flex-col justify-between border-r border-slate-100">
                 <div className="space-y-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                       <Newspaper size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase leading-none">Gazeta Industrial</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edição Extra | Período 1</p>
                 </div>
                 <div className="pt-8 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase"><TrendingUp size={12}/> Inflação: 1.0%</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase"><Users size={12}/> Dissídio: 2.0%</div>
                 </div>
              </div>
              <div className="p-10 flex-1 space-y-6">
                 <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase text-lg">Mercado em Ebulição</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                       As empresas iniciam o ciclo com alta liquidez. O Período 1 marca a corrida pela eficiência produtiva. Analistas apontam que a Empresa 08 desponta com uma gestão conservadora de custos de marketing.
                    </p>
                 </div>
                 <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                    <AlertTriangle className="text-blue-600 shrink-0" size={20} />
                    <div>
                       <span className="block text-[10px] font-black text-blue-800 uppercase mb-1">Aviso CVM</span>
                       <p className="text-xs text-blue-700 font-medium">Reajuste programado nos preços de MP A no Período 2 (+4.2%). Planeje seus estoques estrategicamente.</p>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Ver Gazeta Completa <ChevronRight size={14}/></button>
              </div>
           </div>

           {/* AI Insight Widget */}
           <div className="bg-brand-950 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-blue-100">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Sparkles size={20}/></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Gemini Strategos Feed</span>
                 </div>
                 {isInsightLoading ? (
                    <div className="h-20 animate-pulse bg-white/5 rounded-2xl w-full"></div>
                 ) : (
                    <p className="text-xl font-bold italic leading-relaxed text-slate-100">"{aiInsight}"</p>
                 )}
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Activity size={240} />
              </div>
           </div>
        </div>

        {/* Sidebar KPI's */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Health Monitor</h3>
              <div className="space-y-6">
                 <KpiRow label="Operating Income" value="$ 48,250" trend="+12%" positive icon={<DollarSign size={14}/>} />
                 <KpiRow label="Market Dominance" value="12.5%" trend="+2.4%" positive icon={<Target size={14}/>} />
                 <KpiRow label="Community Score" value="8.4" trend="Public" positive icon={<Star size={14}/>} />
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-blue-800 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-200">
              <h3 className="text-lg font-black uppercase tracking-tight mb-6">Stock Exchange</h3>
              <div className="space-y-4">
                 {[
                   { name: 'EMP 08', price: '1,04', trend: '+4%' },
                   { name: 'EMP 01', price: '0,98', trend: '-2%' },
                   { name: 'EMP 03', price: '1,01', trend: '+1%' }
                 ].map(stock => (
                   <div key={stock.name} className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                      <span className="text-xs font-black">{stock.name}</span>
                      <div className="text-right">
                         <span className="block text-xs font-mono font-bold">{stock.price}</span>
                         <span className={`text-[8px] font-black ${stock.trend.includes('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{stock.trend}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KpiRow = ({ label, value, trend, positive, icon }: any) => (
  <div className="flex items-center justify-between group">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors text-slate-400 group-hover:text-blue-600">
           {icon}
        </div>
        <div>
           <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
           <span className="text-lg font-black text-slate-900">{value}</span>
        </div>
     </div>
     <div className={`px-2 py-1 rounded-md text-[8px] font-black ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend}
     </div>
  </div>
);

export default Dashboard;
