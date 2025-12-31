import React from 'react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign, 
  Clock,
  ChevronRight,
  Target,
  Zap,
  Briefcase,
  Globe,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Ensure ApexCharts is available globally for the react wrapper in ESM
if (typeof window !== 'undefined') {
  (window as any).ApexCharts = ApexCharts;
}

const Dashboard: React.FC = () => {
  // Defensive component check for react-apexcharts in ESM
  const ApexChart = (Chart as any).default || Chart;

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
      gradient: { 
        shadeIntensity: 1, 
        opacityFrom: 0.2, 
        opacityTo: 0, 
        stops: [0, 90, 100] 
      } 
    },
    xaxis: { 
      categories: ['Round 0', 'Round 1', 'Round 2', 'Round 3', 'Round 4'], 
      axisBorder: { show: false }, 
      axisTicks: { show: false },
      labels: { 
        style: { colors: '#64748b', fontWeight: 500, fontSize: '11px' },
        offsetY: 5
      }
    },
    yaxis: {
      labels: { 
        style: { colors: '#64748b', fontWeight: 500, fontSize: '11px' },
        formatter: (val: number) => `$${val}k`
      }
    },
    grid: { show: true, borderColor: '#f1f5f9', strokeDashArray: 4, padding: { left: 10, right: 10 } },
    colors: ['#2563eb', '#10b981'],
    legend: { show: false },
    tooltip: { 
      theme: 'light',
      style: { fontSize: '12px' },
      x: { show: false }
    }
  };

  const lineChartSeries = [
    { name: 'Revenue', data: [100, 120, 110, 150, 190] },
    { name: 'Net Profit', data: [10, 15, 8, 25, 32] }
  ];

  const barChartOptions: any = {
    chart: { type: 'bar', toolbar: { show: false }, stacked: true },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '35%' } },
    dataLabels: { enabled: false },
    colors: ['#2563eb', '#cbd5e1'],
    xaxis: { 
      categories: ['R1', 'R2', 'R3', 'R4'],
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 } }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    legend: { show: false }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Bar: Mission Status */}
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
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Shareholder Return</span>
              <span className="text-lg font-black text-emerald-600">+14.2%</span>
           </div>
           <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Deadline</span>
                <span className="text-lg font-mono font-black text-slate-900">04:22:15</span>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center animate-pulse">
                 <Clock size={20} />
              </div>
           </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Operating Income', value: '$ 48,250', trend: '+18.5%', positive: true, icon: DollarSign },
          { label: 'Market Dominance', value: '24.8%', trend: '+4.2%', positive: true, icon: Target },
          { label: 'Resource Efficiency', value: '92.4%', trend: '-1.2%', positive: false, icon: Activity },
          { label: 'Brand Equity', value: '742 pts', trend: '+12.0%', positive: true, icon: Zap },
        ].map((card, idx) => (
          <div key={idx} className="premium-card p-6 rounded-3xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <card.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${card.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {card.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">Growth Trajectory</h3>
               <p className="text-xs font-semibold text-slate-400 mt-0.5">Performance tracking across current simulation cycles</p>
            </div>
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
            {ApexChart && <ApexChart options={lineChartOptions} series={lineChartSeries} type="area" height="100%" />}
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
                    {ApexChart && <ApexChart 
                      options={{
                        chart: { type: 'radialBar' },
                        plotOptions: { radialBar: { hollow: { size: '65%' }, dataLabels: { show: false } } },
                        colors: ['#2563eb'],
                        stroke: { lineCap: 'round' }
                      }} 
                      series={[24]} 
                      type="radialBar" 
                      height={200} 
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

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Internal Benchmark</h4>
                 <h3 className="text-xl font-extrabold mb-6 uppercase">Production vs Demand</h3>
                 <div className="h-[120px] w-full">
                   {ApexChart && <ApexChart options={barChartOptions} series={[{name: 'Actual', data: [44, 55, 57, 56]}, {name: 'Target', data: [76, 85, 101, 98]}]} type="bar" height="100%" />}
                 </div>
                 <button className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                   View Full Audit <ChevronRight size={14} />
                 </button>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                 <TrendingUp size={180} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;