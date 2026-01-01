
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Workflow, CreditCard, Activity, Users, Settings, 
  Terminal, Database, Globe, Lock, Unlock, Server, UserCog,
  CheckCircle2, AlertTriangle, Save, Loader2, RefreshCw, Star
} from 'lucide-react';
import { listAllUsers, updateUserRole, updateUserPremiumStatus, getPlatformConfig, updatePlatformConfig } from '../services/supabase';
import { UserProfile } from '../types';

const AdminCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'modalities' | 'opal'>('system');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [opalUrl, setOpalUrl] = useState('');
  const [isSavingOpal, setIsSavingOpal] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data } = await listAllUsers();
    if (data) setUsers(data);
    setLoadingUsers(false);
  };

  const fetchConfig = async () => {
    const config = await getPlatformConfig();
    if (config) setOpalUrl(config.opal_url);
  };

  const handleSaveOpal = async () => {
    setIsSavingOpal(true);
    try {
      await updatePlatformConfig({ opal_url: opalUrl });
      alert("Configuração Opal Global Sincronizada!");
    } catch (e) {
      alert("Erro ao salvar configuração.");
    } finally {
      setIsSavingOpal(false);
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserPremiumStatus(userId, !currentStatus);
      setUsers(users.map(u => u.supabase_user_id === userId ? { ...u, is_opal_premium: !currentStatus } : u));
    } catch (e) {
      alert("Falha ao atualizar privilégios.");
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'opal') fetchConfig();
  }, [activeTab]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <ShieldAlert className="text-red-500" size={32} /> Command Center
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Platform orchestration and user validation node.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
           <TabBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Health" />
           <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" />
           <TabBtn active={activeTab === 'modalities'} onClick={() => setActiveTab('modalities')} label="Modalities" />
           <TabBtn active={activeTab === 'opal'} onClick={() => setActiveTab('opal')} label="Opal AI" />
        </div>
      </div>

      {activeTab === 'opal' && (
        <div className="px-4 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-xl"><Workflow size={32} /></div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Opal Global Integration</h3>
                    <p className="text-slate-400 font-medium">Configure os links dos mini-apps Opal e regras de paywall.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Opal Share URL</label>
                       <input 
                         value={opalUrl}
                         onChange={e => setOpalUrl(e.target.value)}
                         className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                         placeholder="https://opal.google/shared/..." 
                       />
                    </div>
                    <button 
                      onClick={handleSaveOpal}
                      disabled={isSavingOpal}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                      {isSavingOpal ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Configuração Global</>}
                    </button>
                    <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                       <CreditCard className="text-indigo-600" />
                       <div className="flex-1">
                          <span className="block text-[10px] font-black uppercase text-indigo-900">Subscription Price (BRL)</span>
                          <span className="text-lg font-black text-indigo-600">R$ 29,90 / mês</span>
                       </div>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 space-y-6">
                    <h4 className="text-xs font-black uppercase text-slate-900">Preview de Assistência</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Os usuários premium verão o iframe do Opal embutido no Intelligence Hub. Usuários free verão o banner de upgrade Empire Elite.</p>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                       <input type="checkbox" readOnly checked className="w-5 h-5 accent-indigo-600" />
                       <span className="text-[10px] font-black uppercase text-slate-400">Paywall Ativo Globalmente</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="px-4 space-y-6 animate-in slide-in-from-right-4">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 uppercase">Player Directory</h3>
              <button onClick={fetchUsers} className="p-3 hover:bg-slate-100 rounded-xl transition-all"><RefreshCw size={18} className={loadingUsers ? 'animate-spin' : ''}/></button>
           </div>
           
           <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                 <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b border-slate-100">
                    <tr>
                       <th className="p-6">User Identity</th>
                       <th className="p-6">Role</th>
                       <th className="p-6">Opal Premium</th>
                       <th className="p-6 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {users.map(user => (
                       <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-6">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{user.name}</span>
                                <span className="text-slate-400 font-medium">{user.email}</span>
                             </div>
                          </td>
                          <td className="p-6">
                             <span className={`px-3 py-1 rounded-full font-black uppercase text-[9px] ${user.role === 'admin' ? 'bg-red-50 text-red-600' : user.role === 'tutor' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                {user.role}
                             </span>
                          </td>
                          <td className="p-6">
                             <button 
                                onClick={() => togglePremium(user.supabase_user_id, user.is_opal_premium)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[9px] transition-all ${user.is_opal_premium ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:text-indigo-600'}`}
                             >
                                {user.is_opal_premium ? <Star size={12} fill="white"/> : <Unlock size={12}/>}
                                {user.is_opal_premium ? 'Premium Elite' : 'Standard'}
                             </button>
                          </td>
                          <td className="p-6 text-right">
                             <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900">
                                <UserCog size={16} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
           <HealthCard label="Neural Engine" status="Online" color="emerald" icon={<Activity />} />
           <HealthCard label="Market Oracle" status="Synchronized" color="blue" icon={<Database />} />
           <HealthCard label="CVM Controller" status="Active" color="amber" icon={<Server />} />
        </div>
      )}

      {activeTab === 'modalities' && (
        <div className="px-4 p-10 bg-white rounded-[3rem] border border-slate-100">
           <div className="flex items-center gap-3 mb-8 text-slate-400 uppercase font-black text-[10px] tracking-widest">
              <Settings size={16} /> Arena Ruleset Config
           </div>
           <p className="text-slate-500 italic">Modality configuration node is in maintenance mode. Use "Deploy" in landing editor.</p>
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
    {label}
  </button>
);

const HealthCard = ({ label, status, color, icon }: any) => (
  <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col gap-6 shadow-sm">
     <div className={`p-4 rounded-2xl w-fit ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
        {icon}
     </div>
     <div>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
        <div className="flex items-center gap-2 mt-1">
           <div className={`w-2 h-2 rounded-full animate-pulse ${color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-amber-500'}`} />
           <span className="text-xl font-black text-slate-900 italic uppercase">{status}</span>
        </div>
     </div>
  </div>
);

export default AdminCommandCenter;
