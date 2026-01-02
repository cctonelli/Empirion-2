// Fix: Added missing 'Zap' to lucide-react imports to resolve reference error in the Opal tab.
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Workflow, CreditCard, Activity, Users, Settings, 
  Terminal, Database, Globe, Lock, Unlock, Server, UserCog,
  CheckCircle2, AlertTriangle, Save, Loader2, RefreshCw, Star,
  Search, ShieldCheck, Eye, Trash2, Mail, ExternalLink, ShieldCheck as ShieldIcon,
  Zap
} from 'lucide-react';
// Removed non-existent updateUserRole from imports
import { listAllUsers, updateUserPremiumStatus, getPlatformConfig, updatePlatformConfig, supabase } from '../services/supabase';
import { UserProfile } from '../types';

const AdminCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'opal' | 'audit'>('system');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [opalUrl, setOpalUrl] = useState('');
  const [isSavingOpal, setIsSavingOpal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      alert("Configuração Global Sincronizada com o Core Node.");
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
      alert("Falha ao atualizar privilégios de Elite.");
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

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter italic">
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg"><ShieldAlert size={28} /></div> 
            Command <span className="text-red-600">Center</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Orquestração da Arena e Gestão de Protocolos SaaS.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
           <TabBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Health" />
           <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users Directory" />
           <TabBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} label="Audit Log" />
           <TabBtn active={activeTab === 'opal'} onClick={() => setActiveTab('opal')} label="Opal Master" />
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'opal' && (
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-200"><Workflow size={32} /></div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">Opal Global Integration</h3>
                      <p className="text-slate-400 font-medium">Link mestre para mini-apps Opal de auditoria elite.</p>
                   </div>
                </div>
                <div className="hidden lg:block text-right">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Build Version</span>
                  <span className="text-sm font-bold text-slate-900">OPAL-CORE-v2.1</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                         <Globe size={12} className="text-indigo-500" /> Google Opal Endpoint URL
                       </label>
                       <input 
                         value={opalUrl} 
                         onChange={e => setOpalUrl(e.target.value)} 
                         className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-slate-900 focus:ring-8 focus:ring-indigo-50 outline-none transition-all" 
                         placeholder="https://opal.google/shared/..." 
                       />
                       <p className="text-[9px] text-slate-400 font-medium">Esta URL será injetada nos Iframes de todos os usuários Premium Elite.</p>
                    </div>
                    <button 
                      onClick={handleSaveOpal} 
                      disabled={isSavingOpal} 
                      className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                    >
                      {isSavingOpal ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Sincronizar Hub Global</>}
                    </button>
                 </div>
                 
                 <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white space-y-6 relative overflow-hidden group">
                    <Zap className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-700" size={200} />
                    <h4 className="text-xs font-black uppercase text-indigo-400 tracking-[0.3em]">Business Rules</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      O acesso aos workflows avançados é restrito a perfis com a flag <span className="text-white font-black italic">is_opal_premium=true</span>.
                    </p>
                    <div className="pt-6 border-t border-white/5 space-y-4">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Auth Guard Active</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Contextual Injection ON</span>
                       </div>
                    </div>
                 </div>
              </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                <div className="relative flex-1 md:max-w-md">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     placeholder="Buscar estrategista por nome ou e-mail..."
                     className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm"
                   />
                </div>
                <button onClick={fetchUsers} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                   <RefreshCw size={20} />
                </button>
             </div>

             <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b border-slate-100">
                      <tr>
                         <th className="p-8">Estrategista</th>
                         <th className="p-8">Intelligence Level</th>
                         <th className="p-8">Access Role</th>
                         <th className="p-8 text-right">Ações de Comando</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {loadingUsers ? (
                         <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Consultando diretório neural...</td></tr>
                      ) : filteredUsers.length === 0 ? (
                         <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Nenhum operador encontrado.</td></tr>
                      ) : filteredUsers.map(user => (
                         <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                     <Users size={20} />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{user.name}</span>
                                     <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <Mail size={10} /> {user.email}
                                     </span>
                                  </div>
                               </div>
                            </td>
                            <td className="p-8">
                               <button 
                                  onClick={() => togglePremium(user.supabase_user_id, user.is_opal_premium)}
                                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all shadow-sm ${
                                    user.is_opal_premium 
                                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                  }`}
                               >
                                  {user.is_opal_premium ? <Star size={14} fill="white"/> : <Unlock size={14}/>}
                                  {user.is_opal_premium ? 'Premium Elite' : 'Standard'}
                               </button>
                            </td>
                            <td className="p-8">
                               <span className={`px-4 py-2 rounded-full font-black uppercase text-[9px] tracking-widest ${
                                 user.role === 'admin' 
                                   ? 'bg-red-50 text-red-600 border border-red-100' 
                                   : user.role === 'tutor' 
                                     ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                     : 'bg-blue-50 text-blue-600 border border-blue-100'
                               }`}>{user.role}</span>
                            </td>
                            <td className="p-8 text-right">
                               <div className="flex justify-end gap-3">
                                  <button className="p-3 hover:bg-white rounded-xl text-slate-400 hover:text-slate-950 border border-transparent hover:border-slate-200 transition-all active:scale-90 shadow-none hover:shadow-sm" title="Editar Perfil"><UserCog size={18} /></button>
                                  <button className="p-3 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all active:scale-90" title="Revogar Acesso"><Trash2 size={18} /></button>
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
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-slate-950 p-12 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/5 space-y-10 h-[750px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                  <Activity size={300} className="text-blue-500" />
                </div>
                
                <div className="flex items-center justify-between border-b border-white/5 pb-8 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-blue-400 border border-white/5 shadow-inner">
                        <Activity size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Real-time Decision Audit</h3>
                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em]">Stream de Telemetria Ativo</p>
                      </div>
                </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Sincronizado
                      </span>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar relative z-10">
                   {auditLogs.map((log, i) => (
                     <div 
                        key={i} 
                        className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all group/item"
                      >
                        <div className="flex items-center gap-6">
                           <div className="w-1.5 h-12 bg-indigo-500 rounded-full group-hover/item:scale-y-125 transition-transform"></div>
                           <div className="space-y-1">
                              <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">{log.user_name || 'System Operator'}</span>
                              <p className="text-base font-bold text-slate-200 tracking-tight">{log.action}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="block text-[11px] font-black text-slate-500 font-mono tracking-tighter group-hover/item:text-slate-300 transition-colors">
                              {new Date(log.created_at).toLocaleTimeString()}
                           </span>
                           <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                              {new Date(log.created_at).toLocaleDateString()}
                           </span>
                        </div>
                     </div>
                   ))}
                   {auditLogs.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-600 uppercase font-black text-xs italic opacity-40">
                        <Loader2 className="animate-spin" size={32} />
                        Aguardando transmissões da Arena...
                     </div>
                   )}
                </div>
                
                <div className="pt-6 border-t border-white/5 flex justify-between items-center opacity-40 relative z-10">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocol Node 08 • SIAGRO Fidelity</span>
                   <span className="text-[9px] font-black text-slate-500 uppercase">CVM SECURE SYNC</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <HealthCard label="Neural Engine (Gemini)" status="Online" color="emerald" icon={<Activity />} latency="42ms" />
                <HealthCard label="Market Oracle (Supabase)" status="Synchronized" color="blue" icon={<Database />} latency="18ms" />
                <HealthCard label="CVM Controller (Auth)" status="Operational" color="amber" icon={<ShieldIcon />} latency="24ms" />
             </div>
             
             <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Estatísticas do Protocolo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   <StatBox label="Arenas Ativas" val="14" sub="+2 hoje" />
                   <StatBox label="Usuários Elite" val={`${users.filter(u=>u.is_opal_premium).length}`} sub="v5.8 GOLD" />
                   <StatBox label="Decisões Auditadas" val="1.4k" sub="Ciclo P01" />
                   <StatBox label="Tempo de Uptime" val="99.9%" sub="Live v5.5" />
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
      active 
        ? 'bg-white text-slate-900 shadow-md border border-slate-200' 
        : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {label}
  </button>
);

const HealthCard = ({ label, status, color, icon, latency }: any) => (
  <div className="p-10 bg-white border border-slate-100 rounded-[3rem] flex flex-col gap-10 shadow-sm group hover:shadow-xl hover:translate-y-[-4px] transition-all">
     <div className={`p-4 rounded-2xl w-fit shadow-lg ${
       color === 'emerald' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100' : 
       color === 'blue' ? 'bg-blue-50 text-blue-600 shadow-blue-100' : 
       'bg-amber-50 text-amber-600 shadow-amber-100'
     }`}>
        {icon}
     </div>
     <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</span>
        <div className="flex items-center gap-3">
           <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
             color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-amber-500'
           }`} />
           <span className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">{status}</span>
        </div>
        <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
           <span className="text-[9px] font-bold text-slate-400 uppercase">Latência</span>
           <span className="text-[10px] font-mono font-black text-slate-900">{latency}</span>
        </div>
     </div>
  </div>
);

const StatBox = ({ label, val, sub }: any) => (
  <div className="space-y-1">
     <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
     <div className="text-3xl font-black text-slate-900 italic">{val}</div>
     <span className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">{sub}</span>
  </div>
);

export default AdminCommandCenter;