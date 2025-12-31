import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Target, 
  Zap, 
  Briefcase, 
  Globe, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Loader2,
  Star,
  Users
} from 'lucide-react';
import ChampionshipTimer from './ChampionshipTimer';
import { generateMarketAnalysis } from '../services/gemini';

const Dashboard: React.FC = () => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  // Safe reference for ESM
  const ApexChart = (Chart as any).default || Chart;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ApexCharts = ApexCharts;
      setChartReady(true);
    }

    const fetchInsight = async () => {
      try {
        const result = await generateMarketAnalysis('Alpha Group Hub', 4, 'industrial');
        setAiInsight(result);
      } catch (err) {
        setAiInsight("Unable to load strategic forecast.");
      } finally {
        setIsInsightLoading(false);
      }
    };
    fetchInsight();
  }, []);

  const lineChartOptions: any = {
    chart: { 
      type: 'area', 
      toolbar: { show: false }, 
      zoom: { enabled: false }, 
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      background: 'transparent'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 4, colors: ['#2563eb', '#10b981'] },
    fill: { 
      type: 'gradient', 
      gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0, stops: [0, 90, 100] } 
    },
    xaxis: { 
      categories: ['R0', 'R1', 'R2', 'R3', 'R4'], 
      labels: { style: { colors: '#64748b', fontWeight: 500, fontSize: '11px' } }
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontWeight: 500, fontSize: '11px' }, formatter: (v: number) => `$${v}k` }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    colors: ['#2563eb', '#10b981'],
    legend: { show: false }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <BarChart3 size={20} />
             </div>
             EMPIRE OVERVIEW
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
               <Briefcase size={14} className="text-blue-500" /> Alpha Group
            </span>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
               <Globe size={14} className="text-blue-500" /> Latin America Hub
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end px-6 border-r border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Shareholder Return</span>
              <span className="text-lg font-black text-emerald-600">+14.2%</span>
           </div>
           <ChampionshipTimer />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Operating Income', value: '$ 48,250', trend: '+18.5%', positive: true, icon: DollarSign },
          { label: 'Market Dominance', value: '24.8%', trend: '+4.2%', positive: true, icon: Target },
          { label: 'Community Rating', value: '8.4/10', trend: 'Public', positive: true, icon: Star },
          { label: 'Brand Equity', value: '742 pts', trend: '+12.0%', positive: true, icon: Zap },
        ].map((card, idx) => (
          <div key={idx} className="premium-card p-6 rounded-3xl flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <card.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${card.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {card.icon === Star ? <Users size={12} /> : card.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.trend}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{card.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">Growth Trajectory</h3>
              <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Profit</span>
                  </div>
              </div>
            </div>
            <div className="h-[380px] w-full">
              {chartReady && ApexChart && <ApexChart options={lineChartOptions} series={[{ name: 'Revenue', data: [100, 120, 110, 150, 190] }, { name: 'Net Profit', data: [10, 15, 8, 25, 32] }]} type="area" height="100%" />}
            </div>
          </div>

          {/* AI STRATEGIC FORECAST WIDGET */}
          <div className="bg-brand-950 p-10 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0">
                   <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      <Sparkles size={32} />
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Gemini Strategic Forecast</span>
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                   </div>
                   {isInsightLoading ? (
                     <div className="space-y-2">
                        <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded-full w-full animate-pulse"></div>
                     </div>
                   ) : (
                     <p className="text-xl font-bold leading-relaxed text-slate-100">
                       "{aiInsight}"
                     </p>
                   )}
                </div>
             </div>
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                <Activity size={200} />
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
             <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight mb-6">Market Share</h3>
             <div className="flex-1 space-y-6">
               <div className="h-[180px] w-full flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-slate-900">24%</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Share</span>
                    </div>
                    {chartReady && ApexChart && <ApexChart 
                      options={{
                        chart: { type: 'radialBar' },
                        plotOptions: { radialBar: { hollow: { size: '65%' }, dataLabels: { show: false } } },
                        colors: ['#2563eb'],
                        stroke: { lineCap: 'round' }
                      }} 
                      series={[24]} type="radialBar" height={200} 
                    />}
                  </div>
               </div>
               
               <div className="space-y-4">
                  {[
                    { name: 'Alpha (You)', share: 24.8, color: 'bg-blue-600' },
                    { name: 'Competitor B', share: 18.2, color: 'bg-slate-400' },
                    { name: 'Competitor C', share: 15.4, color: 'bg-slate-300' },
                  ].map((team, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${team.color}`}></div>
                          <span className="text-xs font-bold text-slate-600">{team.name}</span>
                       </div>
                       <span className="text-xs font-black text-slate-900">{team.share}%</span>
                    </div>
                  ))}
               </div>
             </div>
           </div>

           {/* Community Score Detail Card */}
           <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200">
                    <Star size={20} fill="currentColor" />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Market Perception</h3>
              </div>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                 The community values your <span className="font-bold">Sustainability</span> efforts but suggests more focus on <span className="font-bold">Innovation</span>.
              </p>
              <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-black uppercase text-amber-600">
                    <span>Public Approval</span>
                    <span>84%</span>
                 </div>
                 <div className="w-full h-2 bg-amber-200/50 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[84%]"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;