
import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Database, 
  Server, 
  Users, 
  CreditCard,
  Cpu,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const AdminCommandCenter: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-red-500" /> Command Center
          </h1>
          <p className="text-slate-500 mt-1">Global platform orchestration and system health monitoring.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors">
             <RefreshCw size={18} /> Refresh Logs
           </button>
           <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors">
             <Server size={18} /> System Status
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Sessions', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'DB Latency', value: '42ms', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'CPU Usage', value: '14.8%', icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Monthly Revenue', value: 'R$ 48.2k', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                   <stat.icon size={18} />
                </div>
             </div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> Active Championships
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
           </div>
           <div className="divide-y divide-slate-50">
              {[
                { name: 'Tech Frontier 2025', tutor: 'Dr. Santos', status: 'R4 Processing', load: 'Heavy' },
                { name: 'AgroBoost Global', tutor: 'Clarissa S.', status: 'Waiting R1', load: 'Light' },
                { name: 'Fashion Retail MVP', tutor: 'Admin', status: 'Draft', load: 'N/A' },
                { name: 'Solar Energy Cup', tutor: 'Bruno M.', status: 'R8 Complete', load: 'Medium' },
              ].map((c, i) => (
                <div key={i} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-white transition-colors">{c.name[0]}</div>
                      <div>
                         <h4 className="font-bold text-slate-900">{c.name}</h4>
                         <p className="text-xs text-slate-400">Lead Tutor: {c.tutor}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                         <p className="text-xs font-bold text-slate-700">{c.status}</p>
                         <p className="text-[10px] text-slate-400 uppercase font-black">Status</p>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <ExternalLink size={18} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <ShieldAlert size={120} />
              </div>
              <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-2">Supabase Health</h3>
                 <p className="text-slate-400 text-sm mb-6">Real-time sync service is operating at peak performance.</p>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Auth Service: Operational</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Storage Bucket: Healthy</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Edge Functions: Stable</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-slate-100 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Alerts</h3>
              <div className="space-y-4">
                 {[
                   { msg: 'Payment failed for Team Alpha', type: 'error' },
                   { msg: 'New template "Energy" created', type: 'info' },
                   { msg: 'Database backup completed', type: 'success' },
                 ].map((alert, i) => (
                   <div key={i} className={`p-4 rounded-2xl flex items-center gap-3 border ${
                     alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
                     alert.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                     'bg-emerald-50 border-emerald-100 text-emerald-700'
                   }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      <span className="text-sm font-semibold">{alert.msg}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommandCenter;
