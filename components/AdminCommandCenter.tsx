
import React, { useEffect, useState } from 'react';
import { 
  Activity, ShieldAlert, Database, Server, Users, CreditCard,
  Cpu, RefreshCw, ExternalLink, Lock, Copy, CheckCircle2,
  AlertTriangle, UserPlus, ShieldCheck, UserCog, Trash2, Search,
  Plus, Box, LayoutGrid, Sparkles, Globe, Save, Loader2
} from 'lucide-react';
import { supabase, listAllUsers, updateUserRole, createModality } from '../services/supabase';
import { UserProfile, UserRole, Modality } from '../types';

const AdminCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'modalities'>('system');
  const [stats, setStats] = useState({ users: 0, championships: 0, activeTeams: 0, latency: '0ms' });
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [newModality, setNewModality] = useState({
    slug: '',
    name: '',
    description: '',
    accent_color: 'orange',
    hero_title: '',
    hero_subtitle: ''
  });

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployModality = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    try {
      const payload: Partial<Modality> = {
        slug: newModality.slug,
        name: newModality.name,
        description: newModality.description,
        is_public: true,
        page_content: {
          hero: { title: newModality.hero_title, subtitle: newModality.hero_subtitle },
          features: ["Real-time Sync", "Oracle Advisor", "Market Grounding"],
          kpis: ["ROE", "OEE", "Market Share"],
          accent_color: newModality.accent_color
        },
        config_template: { modality: newModality.slug }
      };
      await createModality(payload);
      alert("Nova Arena implantada com sucesso no Oracle Node!");
      setNewModality({ slug: '', name: '', description: '', accent_color: 'orange', hero_title: '', hero_subtitle: '' });
    } catch (e) {
      alert("Erro no deploy da modalidade.");
    } finally {
      setIsDeploying(false);
    }
  };

  useEffect(() => { fetchGlobalStats(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <ShieldAlert className="text-red-500" size={32} /> Command Center
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Platform orchestration and user validation node.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
           <button onClick={() => setActiveTab('system')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Health</button>
           <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Users</button>
           <button onClick={() => setActiveTab('modalities')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'modalities' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Modalities</button>
        </div>
      </div>

      {activeTab === 'modalities' ? (
        <div className="px-4 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-blue-600 text-white rounded-[2rem] shadow-xl"><Plus size={32} /></div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Deploy de Nova Modalidade</h3>
                    <p className="text-slate-400 font-medium">Crie novas arenas públicas ou particulares dinamicamente.</p>
                 </div>
              </div>

              <form onSubmit={handleDeployModality} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identificador (Slug)</label>
                       <input value={newModality.slug} onChange={e => setNewModality({...newModality, slug: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="ex: fintech-wars" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome da Modalidade</label>
                       <input value={newModality.name} onChange={e => setNewModality({...newModality, name: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="Fintech Global Wars" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cor de Acento</label>
                       <select value={newModality.accent_color} onChange={e => setNewModality({...newModality, accent_color: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                          <option value="orange">Laranja (Padrão)</option>
                          <option value="blue">Azul (Corporate)</option>
                          <option value="emerald">Verde (Agro/ESG)</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título da Página (Hero)</label>
                       <input value={newModality.hero_title} onChange={e => setNewModality({...newModality, hero_title: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="A Próxima Fronteira" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtítulo (Impacto)</label>
                       <textarea value={newModality.hero_subtitle} onChange={e => setNewModality({...newModality, hero_subtitle: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold h-32" placeholder="Compita na arena mais volátil do mercado..." />
                    </div>
                    <button type="submit" disabled={isDeploying} className="w-full py-6 bg-slate-950 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-4">
                       {isDeploying ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Deploy no Oracle Node</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      ) : activeTab === 'users' ? (
        <div className="px-4 space-y-8 animate-in slide-in-from-right-4 duration-500">
           {/* Tabela de usuários já existente... */}
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
             <h3 className="text-xl font-black text-slate-900 uppercase mb-8">Validated Strategists</h3>
             <table className="w-full text-left">
                <thead className="text-[10px] font-black uppercase text-slate-400">
                  <tr><th className="p-4">Identity</th><th className="p-4">Role</th><th className="p-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {usersList.map(u => (
                     <tr key={u.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-4"><span className="font-bold">{u.name}</span><br/><span className="text-xs text-slate-400">{u.email}</span></td>
                        <td className="p-4"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">{u.role}</span></td>
                        <td className="p-4 text-right"><button onClick={() => updateUserRole(u.supabase_user_id, 'tutor')} className="p-2 hover:bg-white rounded-lg shadow-sm border border-slate-100"><UserCog size={16}/></button></td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      ) : (
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
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}><stat.icon size={20} /></div>
               </div>
               <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommandCenter;
