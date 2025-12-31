
import React from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign, 
  Clock,
  ChevronRight,
  Target,
  Zap,
  Briefcase
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Defensive component check for react-apexcharts in ESM
  const ApexChart = (Chart as any).default || Chart;

  const lineChartOptions: any = {
    chart: { 
      type: 'area', 
      toolbar: { show: false }, 
      zoom: { enabled: false }, 
      sparkline: { enabled: false },
      fontFamily: 'Inter, sans-serif'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3, colors: ['#3b82f6', '#10b981'] },
    fill: { 
      type: 'gradient', 
      gradient: { 
        shadeIntensity: 1, 
        opacityFrom: 0.45, 
        opacityTo: 0.05, 
        stops: [20, 100] 
      } 
    },
    xaxis: { 
      categories: ['R0', 'R1', 'R2', 'R3', 'R4'], 
      axisBorder: { show: false }, 
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
    },
    yaxis: {
      labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
    },
    grid: { show: true, borderColor: '#f1f5f9', strokeDashArray: 4 },
    colors: ['#3b82f6', '#10b981'],
    legend: { show: false },
    tooltip: { theme: 'light' }
  };

  const lineChartSeries = [
    { name: 'Revenue', data: [100, 120, 110, 150, 190] },
    { name: 'Profit', data: [10, 15, 8, 25, 32] }
  ];

  const radialOptions: any = {
    chart: { type: 'radialBar' },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: {
          name: { show: false },
          value: { offsetY: 5, fontSize: '24px', fontWeight: '900', color: '#0f172a' }
        }
      }
    },
    colors: ['#3b82f6'],
    stroke: { lineCap: 'round' }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Command Center</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
            <Briefcase size={16} className="text-blue-500" /> Alpha Solutions Group | Round 4
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
           <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center">
             <Clock size={20} className="animate-pulse" />
           </div>
           <div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Time Remaining</span>
             <span className="text-xl font-black text-slate-900">04:22:15</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Profit', value: 'R$ 32.5k', trend: '+12%', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Market Share', value: '24.8%', trend: '+4%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Production', value: '1,280', trend: '-2%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'ESG Score', value: '88/100', trend: '+1%', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-lg shadow-slate-100 border border-slate-100 flex flex-col justify-between hover:translate-y-[-4px] transition-all cursor-default">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${card.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Financial Performance</h3>
            <div className="flex gap-4">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Revenue
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Net Profit
                </span>
            </div>
          </div>
          <div className="h-[350px]">
            {ApexChart && <ApexChart options={lineChartOptions} series={lineChartSeries} type="area" height="100%" />}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 uppercase">Competitive Edge</h3>
          <div className="flex-1 space-y-8">
            <div className="flex flex-col items-center">
               {ApexChart && <ApexChart options={radialOptions} series={[72]} type="radialBar" height={250} />}
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-[-20px]">Market Dominance</p>
            </div>
            <div className="space-y-6">
              {[
                { name: 'Alpha Corp (You)', share: 72, color: 'bg-blue-600' },
                { name: 'Beta Dynamics', share: 58, color: 'bg-emerald-500' },
                { name: 'Gamma Global', share: 44, color: 'bg-slate-300' },
              ].map((team, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                    <span className="text-slate-700">{team.name}</span>
                    <span className="text-slate-400">{team.share}% Efficiency</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${team.color} h-full transition-all duration-1000`} style={{ width: `${team.share}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full mt-10 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
            Market Intelligence <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
