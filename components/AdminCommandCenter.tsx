
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Workflow, CreditCard, Activity, Users, Settings, 
  Terminal, Database, Globe, Lock, Unlock, Server, UserCog,
  CheckCircle2, AlertTriangle, Save, Loader2, RefreshCw, Star,
  Search, ShieldCheck, Eye, Trash2
} from 'lucide-react';
import { listAllUsers, updateUserRole, updateUserPremiumStatus, getPlatformConfig, updatePlatformConfig, supabase } from '../services/supabase';
import { UserProfile } from '../types';

const AdminCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'opal' | 'audit'>('system');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [opalUrl, setOpalUrl] = useState('');
  const [isSavingOpal, setIsSavingOpal] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data } = await listAllUsers();
    if (data) setUsers(data);
    setLoadingUsers(false);
  };

  const fetchAuditLogs = async () => {
    const { data } = await supabase
      .from('decision_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setAuditLogs(data);
  };

  const fetchConfig = async () => {
    const config = await getPlatformConfig();
    if (config) setOpalUrl(config.opal_url);
  };

  const handleSaveOpal = async () => {
    setIsSavingOpal(true);
    try {
      await updatePlatformConfig({ opal_url: opalUrl });
      alert("Configuração Global Sincronizada.");
    } catch (e) {
      alert("Erro ao salvar.");
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
    if (activeTab === 'audit') fetchAuditLogs();
    
    // Realtime Audit Sub
    if (activeTab === 'audit') {
      const sub = supabase.channel('audit-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'decision_audit_log' }, (payload) => {
          setAuditLogs(prev => [payload.new, ...prev].slice(0, 50));
        }).subscribe();
      return () => { sub.unsubscribe(); };
    }
  }, [activeTab]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <ShieldAlert className="text-red-500" size={32} /> Command Center
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Orquestração da Arena e Gestão de Protocolos.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
           <TabBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Health" />
           <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" />
           <TabBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} label="Audit Log" />
           <TabBtn active={activeTab === 'opal'} onClick={() => setActiveTab('opal')} label="Opal AI" />
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'opal' && (
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-xl"><Workflow size={32} /></div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Opal Global Integration</h3>
                    <p className="text-slate-400 font-medium">Master link para os mini-apps Opal (Premium).</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Opal API Endpoint / Share URL</label>
                       <input value={opalUrl} onChange={e => setOpalUrl(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="https://opal.google/shared/..." />
                    </div>
                    <button onClick={handleSaveOpal} disabled={isSavingOpal} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                      {isSavingOpal ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Link Mestre</>}
                    </button>
                 </div>
                 <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200">
                    <h4 className="text-xs font-black uppercase text-slate-900 mb-4">Regras de Monetização</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">O acesso aos workflows avançados é restrito a perfis is_opal_premium=true. O billing deve ser gerenciado via Stripe/PIX externo por enquanto.</p>
                 </div>
              </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b border-slate-100">
                      <tr>
                         <th className="p-6">Estrategista</th>
                         <th className="p-6">Status Elite (IA)</th>
                         <th className="p-6">Nível de Acesso</th>
                         <th className="p-6 text-right">Ações</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {users.map(user => (
                         <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-6">
                               <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{user.email}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <button 
                                  onClick={() => togglePremium(user.supabase_user_id, user.is_opal_premium)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[9px] transition-all ${user.is_opal_premium ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
                               >
                                  {user.is_opal_premium ? <Star size={12} fill="white"/> : <Unlock size={12}/>}
                                  {user.is_opal_premium ? 'Premium Elite' : 'Standard'}
                               </button>
                            </td>
                            <td className="p-6">
                               <span className={`px-3 py-1 rounded-full font-black uppercase text-[9px] ${user.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{user.role}</span>
                            </td>
                            <td className="p-6 text-right">
                               <div className="flex justify-end gap-2">
                                  <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all"><UserCog size={16} /></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-white/5 space-y-8 h-[700px] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400"><Activity size={20} /></div>
                      <h3 className="text-xl font-black text-white uppercase italic">Real-time Decision Audit</h3>
                   </div>
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sincronizando via Supabase Realtime</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                   {auditLogs.map((log, i) => (
                     <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-1 h-10 bg-indigo-500 rounded-full"></div>
                           <div>
                              <span className="block text-[10px] font-black text-indigo-400 uppercase">{log.user_name || 'System Operator'}</span>
                              <p className="text-sm font-bold text-slate-200">{log.action}</p>
                           </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
             <HealthCard label="Neural Engine" status="Online" color="emerald" icon={<Activity />} />
             <HealthCard label="Market Oracle" status="Synchronized" color="blue" icon={<Database />} />
             <HealthCard label="CVM Controller" status="Active" color="amber" icon={<Server />} />
          </div>
        )}
      </div>
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
