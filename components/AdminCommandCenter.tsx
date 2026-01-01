
import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Database, 
  Server, 
  Users, 
  CreditCard,
  Cpu,
  RefreshCw,
  ExternalLink,
  Lock,
  Copy,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  ShieldCheck,
  UserCog,
  Trash2,
  Search
} from 'lucide-react';
import { supabase, listAllUsers, updateUserRole } from '../services/supabase';
import { UserProfile, UserRole } from '../types';

const TRIGGER_SQL = `-- Empirion User Sync Trigger (v4.3)
-- Executar no SQL Editor do Supabase para sincronizar Auth com public.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'player'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

const AdminCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'users'>('system');
  const [stats, setStats] = useState({ users: 0, championships: 0, activeTeams: 0, latency: '0ms' });
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchGlobalStats = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: champCount } = await supabase.from('championships').select('*', { count: 'exact', head: true });
      const { count: teamCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });
      
      const { data: users } = await listAllUsers();
      setUsersList(users || []);
      
      const end = performance.now();
      setStats({
        users: userCount || 0,
        championships: champCount || 0,
        activeTeams: teamCount || 0,
        latency: `${Math.round(end - start)}ms`
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, currentRole: UserRole) => {
    const nextRole: UserRole = currentRole === 'player' ? 'tutor' : currentRole === 'tutor' ? 'admin' : 'player';
    if (!confirm(`Confirmar alteração de role para ${nextRole.toUpperCase()}?`)) return;
    
    try {
      await updateUserRole(userId, nextRole);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
    } catch (e) {
      alert("Erro ao atualizar permissão.");
    }
  };

  const copyTrigger = () => {
    navigator.clipboard.writeText(TRIGGER_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <ShieldAlert className="text-red-500" size={32} /> Command Center
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Platform orchestration and user validation node.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
           <button onClick={() => setActiveTab('system')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}>System Health</button>
           <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}>User Directory</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Latency Node', value: stats.latency, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Teams', value: stats.activeTeams, icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Championships', value: stats.championships, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                   <stat.icon size={20} />
                </div>
             </div>
             <h3 className="text-4xl font-black text-slate-900 tracking-tight">{loading ? '...' : stat.value}</h3>
          </div>
        ))}
      </div>

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                        <Lock size={28} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Security Trigger</h3>
                        <p className="text-slate-400 font-medium">Automatic sync between Supabase Auth and User Profile table.</p>
                     </div>
                  </div>
                  <button onClick={copyTrigger} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-100'}`}>
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied' : 'Copy Sync Trigger'}
                  </button>
               </div>
               <div className="bg-slate-900 rounded-[2rem] p-6 overflow-hidden relative">
                  <pre className="text-[10px] text-blue-300 font-mono leading-relaxed opacity-60">
                    {TRIGGER_SQL.substring(0, 400)}...
                  </pre>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
               </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Activity size={20} className="text-blue-500" /> Active Arena Nodes
                  </h3>
               </div>
               <div className="divide-y divide-slate-50">
                  {['Industrial Alpha', 'Tech Frontier', 'Agro Global'].map((name, i) => (
                    <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all group">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-white shadow-inner transition-all">{name[0]}</div>
                          <div>
                             <h4 className="font-black text-slate-900 uppercase tracking-tight">{name}</h4>
                             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Status: Operational</p>
                          </div>
                       </div>
                       <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all shadow-sm">
                          <ExternalLink size={18} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                   <ShieldCheck size={180} />
                </div>
                <div className="relative z-10 space-y-8">
                   <h3 className="text-2xl font-black uppercase tracking-tight">Cloud Security</h3>
                   <div className="space-y-5">
                      {['Auth Service: 100%', 'Real-time: 4ms', 'Storage: 99.8%'].map((txt, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{txt}</span>
                        </div>
                      ))}
                   </div>
                   <button onClick={fetchGlobalStats} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Synchronize Logs
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="px-4 space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Validated Users</h3>
                    <p className="text-slate-400 font-medium">Verify credentials and promote user roles manually.</p>
                 </div>
                 <div className="relative group w-full md:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" size={18} />
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Find strategist..."
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-8 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-bold text-sm"
                    />
                 </div>
              </div>

              <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400">
                          <th className="p-6">Strategist Identity</th>
                          <th className="p-6">Current Role</th>
                          <th className="p-6">Joined Date</th>
                          <th className="p-6 text-right">Node Permissions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredUsers.map((u) => (
                         <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                            <td className="p-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:border-blue-200 transition-all">
                                     {u.name?.[0] || 'U'}
                                  </div>
                                  <div>
                                     <p className="font-black text-slate-900 uppercase text-sm tracking-tight">{u.name || 'Anonymous Strategist'}</p>
                                     <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6">
                               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 u.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' :
                                 u.role === 'tutor' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                 'bg-emerald-50 text-emerald-600 border-emerald-100'
                               }`}>
                                  {u.role}
                               </span>
                            </td>
                            <td className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                               {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-6 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  <button 
                                    onClick={() => handleRoleUpdate(u.id, u.role)}
                                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-all shadow-sm"
                                    title="Promote User"
                                  >
                                     <UserCog size={18} />
                                  </button>
                                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-400 transition-all shadow-sm">
                                     <Trash2 size={18} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommandCenter;
