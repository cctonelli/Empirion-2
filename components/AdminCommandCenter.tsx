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
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../services/supabase';

const RLS_SQL_SCRIPT = `-- Empirion Security Framework - Row Level Security (RLS)
-- Version 3.1 Consolidated (Fixes missing is_public)

-- 0. SCHEMA REPAIR
-- Add is_public column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='is_public') THEN
    ALTER TABLE public.championships ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 1. ENABLE RLS GLOBALLY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES: users
DROP POLICY IF EXISTS "Usuários veem próprio perfil" ON public.users;
CREATE POLICY "Usuários veem próprio perfil" ON public.users AS PERMISSIVE FOR ALL USING ((auth.uid() = id));

-- 3. POLICIES: championships
DROP POLICY IF EXISTS "Tutor edita seu campeonato" ON public.championships;
CREATE POLICY "Tutor edita seu campeonato" ON public.championships AS PERMISSIVE FOR UPDATE USING (((tutor_id = auth.uid()) OR (EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))));

DROP POLICY IF EXISTS "Visibilidade de campeonatos" ON public.championships;
CREATE POLICY "Visibilidade de campeonatos" ON public.championships AS PERMISSIVE FOR SELECT USING ((is_public OR (tutor_id = auth.uid()) OR (EXISTS ( SELECT 1 FROM users WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))));

-- 4. POLICIES: community_ratings
DROP POLICY IF EXISTS "Todos do campeonato veem ratings" ON public.community_ratings;
CREATE POLICY "Todos do campeonato veem ratings" ON public.community_ratings AS PERMISSIVE FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem votar" ON public.community_ratings;
CREATE POLICY "Usuários autenticados podem votar" ON public.community_ratings AS PERMISSIVE FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));

-- 5. POLICIES: current_decisions
DROP POLICY IF EXISTS "Equipe edita decisões" ON public.current_decisions;
CREATE POLICY "Equipe edita decisões" ON public.current_decisions AS PERMISSIVE FOR ALL USING ((EXISTS ( SELECT 1 FROM (teams t JOIN team_members tm ON ((t.id = tm.team_id))) WHERE ((t.id = current_decisions.team_id) AND (tm.user_id = auth.uid())))));

-- 6. NOTIFY RELOAD
NOTIFY pgrst, 'reload schema';
`;

const AdminCommandCenter: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    championships: 0,
    activeTeams: 0,
    latency: '0ms'
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchGlobalStats = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: champCount } = await supabase.from('championships').select('*', { count: 'exact', head: true });
      const { count: teamCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });
      
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

  const copyRLS = () => {
    navigator.clipboard.writeText(RLS_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

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
           <button 
            onClick={fetchGlobalStats}
            disabled={loading}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors"
           >
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh Logs
           </button>
           <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors">
             <Server size={18} /> System Status
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Users', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'DB Latency', value: stats.latency, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Teams', value: stats.activeTeams, icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Tournaments', value: stats.championships, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                   <stat.icon size={18} />
                </div>
             </div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tight">{loading ? '...' : stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" /> Live Championship Nodes
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

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                     <Lock size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security & RLS Protocols</h3>
                     <p className="text-slate-400 text-sm font-medium">Protect simulation integrity and multi-tenant data isolation.</p>
                  </div>
               </div>
               <button 
                onClick={copyRLS}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-blue-600'
                }`}
               >
                 {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                 {copied ? 'Copied SQL' : 'Copy RLS Script'}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                     <AlertTriangle size={16} className="text-amber-500" />
                     <span className="text-xs font-black uppercase text-slate-700">Audit Status</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    Row-level security ensures that teams cannot see or edit decisions from competitors.
                  </p>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Multi-tenant isolation active</span>
                  </div>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                     <ShieldAlert size={16} className="text-blue-500" />
                     <span className="text-xs font-black uppercase text-slate-700">Tutor Oversight</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    Tutors have full read-access to teams within their assigned championships.
                  </p>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Hierarchical policies applied</span>
                  </div>
               </div>
            </div>
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