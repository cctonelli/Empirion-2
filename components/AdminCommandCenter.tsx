import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Workflow, Users, Settings, 
  Terminal, Database, Globe, UserCog,
  CheckCircle2, Save, Loader2, RefreshCw, Star,
  Search, ShieldCheck, Trash2, Mail, Plus,
  Trophy, LayoutGrid, Activity, Calculator, Sliders
} from 'lucide-react';
import { listAllUsers, updateUserPremiumStatus, getPlatformConfig, updatePlatformConfig, supabase } from '../services/supabase';
import { UserProfile } from '../types';
import ChampionshipWizard from './ChampionshipWizard';

interface AdminProps {
  preTab?: 'tournaments' | 'users' | 'opal' | 'system';
}

const AdminCommandCenter: React.FC<AdminProps> = ({ preTab = 'tournaments' }) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'users' | 'opal' | 'system'>(preTab);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data } = await listAllUsers();
    if (data) setUsers(data);
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter italic">
            <div className="p-2 bg-orange-600 text-white rounded-xl shadow-lg"><ShieldAlert size={28} /></div> 
            Tutor <span className="text-orange-600">Master Control</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Parametrização de Arenas, Gestão de Nodos e Usuários Elite.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
           <TabBtn active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Gestão de Arenas" icon={<Trophy size={14}/>} />
           <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Estrategistas" icon={<Users size={14}/>} />
           <TabBtn active={activeTab === 'opal'} onClick={() => setActiveTab('opal')} label="Opal Hub" icon={<Workflow size={14}/>} />
           <TabBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Health" icon={<Activity size={14}/>} />
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'tournaments' && (
          <div className="space-y-8">
            {!showWizard ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
                      <Trophy size={160} />
                   </div>
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-200"><Plus size={40} /></div>
                      <div>
                         <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">Criar Nova Arena</h3>
                         <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Configure parâmetros, balanços e regras do zero.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowWizard(true)}
                     className="px-12 py-6 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-4 shadow-2xl active:scale-95 relative z-10"
                   >
                     <Settings size={20} /> Iniciar Orquestração
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {/* Placeholder para campeonatos existentes */}
                   <div className="p-10 bg-slate-50 border border-slate-200 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center gap-6 opacity-60">
                      <LayoutGrid size={48} className="text-slate-300" />
                      <div>
                        <p className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Sem arenas ativas</p>
                        <p className="text-slate-400 text-xs font-medium mt-2 max-w-[200px]">As arenas que você gerenciar aparecerão neste hub.</p>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <ChampionshipWizard onComplete={() => setShowWizard(false)} />
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="relative w-full max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-orange-50 outline-none" placeholder="Buscar estrategista..." />
                </div>
                <button onClick={fetchUsers} className="p-3 text-slate-400 hover:text-blue-600 transition-colors"><RefreshCw size={20} /></button>
             </div>
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b border-slate-100">
                  <tr>
                     <th className="p-8">Estrategista</th>
                     <th className="p-8">Nível de Inteligência</th>
                     <th className="p-8">Nodo de Acesso</th>
                     <th className="p-8 text-right">Comandos</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="p-8">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Users size={18} />
                             </div>
                             <div>
                                <div className="font-black text-slate-900 text-sm">{user.name}</div>
                                <div className="text-slate-400 font-medium flex items-center gap-1"><Mail size={10}/> {user.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="p-8">
                          <button 
                            onClick={() => updateUserPremiumStatus(user.supabase_user_id, !user.is_opal_premium)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${user.is_opal_premium ? 'bg-amber-100 text-amber-600 border border-amber-200 shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                            {user.is_opal_premium ? <Star size={12} fill="currentColor"/> : <Database size={12}/>}
                            {user.is_opal_premium ? 'Premium Elite' : 'Standard'}
                          </button>
                       </td>
                       <td className="p-8 font-black uppercase text-blue-600 italic tracking-tighter">{user.role}</td>
                       <td className="p-8 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:shadow-md transition-all active:scale-90"><UserCog size={16}/></button>
                             <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:shadow-md transition-all active:scale-90"><Trash2 size={16}/></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap active:scale-95 ${
      active ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon} {label}
  </button>
);

export default AdminCommandCenter;