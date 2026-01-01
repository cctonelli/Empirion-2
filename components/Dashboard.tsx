
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, Zap, Briefcase, Globe, BarChart3, 
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Star, Users, Newspaper,
  AlertTriangle, ChevronRight, Gavel
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
        const result = await generateMarketAnalysis('Arena Industrial Alpha', 1, 'industrial');
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
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <BarChart3 size={24} />
             </div>
             Control Room
          </h1>
          <p className="text-slate-500 font-medium mt-1">Status Report: Período 1 - Modelo Clássico Industrial</p>
        </div>
        <ChampionshipTimer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Gazeta Industrial Card */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 bg-slate-50 md:w-80 flex flex-col justify-between border-r border-slate-100">
                 <div className="space-y-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                       <Newspaper size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase leading-none tracking-tighter">Gazeta Industrial</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edição Extra | Período 1</p>
                 </div>
                 <div className="pt-8 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase"><TrendingUp size={12}/> Inflação: 1.0%</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase"><Users size={12}/> Dissídio: 2.0%</div>
                 </div>
              </div>
              <div className="p-10 flex-1 space-y-6">
                 <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2">
                      Mercado em Ascensão <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-serif italic">
                       "Analistas da CVM apontam que o Período 1 consolidou a Empresa 08 como líder em eficiência operacional. O mercado de bens duráveis aguarda reajustes na MP A para o próximo ciclo."
                    </p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                       <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Previsão MP A (P2)</span>
                       <span className="text-sm font-black text-rose-600">+4,5%</span>
                    </div>
                    <div>
                       <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">TR Mensal (P2)</span>
                       <span className="text-sm font-black text-blue-600">2,50%</span>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Ver Gazeta Completa <ChevronRight size={14}/></button>
              </div>
           </div>

           {/* AI Insight Widget */}
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-blue-100">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Sparkles size={20}/></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Gemini Strategos Oracle</span>
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
                 <KpiRow label="Net Earnings" value="$ 73.926" trend="+100%" positive icon={<DollarSign size={14}/>} />
                 <KpiRow label="Market Dominance" value="12.5%" trend="+2.4%" positive icon={<Target size={14}/>} />
                 <KpiRow label="Stock Quote" value="1,04" trend="+4.2%" positive icon={<TrendingUp size={14}/>} />
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Gavel size={60} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-6">Próxima Rodada (P2)</h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase text-blue-200">Reajuste Salarial</span>
                    <span className="text-sm font-black text-emerald-400">+2.0%</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase text-blue-200">Preço MP B</span>
                    <span className="text-sm font-black text-slate-100">42,21</span>
                 </div>
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
