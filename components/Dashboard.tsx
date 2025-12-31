
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign, 
  Clock,
  ChevronRight,
  Target
} from 'lucide-react';

const MOCK_FINANCIALS = [
  { round: 'R0', revenue: 100, profit: 10 },
  { round: 'R1', revenue: 120, profit: 15 },
  { round: 'R2', revenue: 110, profit: 8 },
  { round: 'R3', revenue: 150, profit: 25 },
  { round: 'R4', revenue: 190, profit: 32 },
];

const KPI_CARDS = [
  { label: 'Net Profit', value: 'R$ 32.5k', trend: '+12%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Market Share', value: '24.8%', trend: '+4%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Production', value: '1.2k units', trend: '-2%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Team Morale', value: '88%', trend: '+1%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here's what's happening in Round 4.</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-amber-100 border border-amber-200 rounded-lg text-amber-800">
          <Clock size={18} />
          <span className="font-semibold">04:22:15</span>
          <span className="text-sm opacity-75 ml-1">until round close</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
              <div className={`mt-2 flex items-center text-xs font-bold ${card.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {card.trend} <span className="text-slate-400 font-normal ml-1">vs last round</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Financial Growth</h3>
            <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div> Revenue
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div> Profit
                </span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_FINANCIALS}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="round" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Competitor Snapshot</h3>
          <div className="space-y-6">
            {[
              { name: 'Alpha Corp', share: 32, color: 'bg-blue-500' },
              { name: 'Beta Solutions', share: 28, color: 'bg-emerald-500' },
              { name: 'Empirion Team (You)', share: 24, color: 'bg-amber-500' },
              { name: 'Gamma Industries', share: 16, color: 'bg-slate-300' },
            ].map((team, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{team.name}</span>
                  <span className="text-slate-500">{team.share}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${team.color} h-full transition-all duration-1000`} style={{ width: `${team.share}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2">
            View All Competitors <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
