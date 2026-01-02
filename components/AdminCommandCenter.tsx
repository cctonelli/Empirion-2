
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Workflow, Users, Settings, 
  Terminal, Database, Globe, UserCog,
  CheckCircle2, Save, Loader2, RefreshCw, Star,
  Search, ShieldCheck, Trash2, Mail, Plus,
  Trophy, LayoutGrid, Activity, Calculator
} from 'lucide-react';
import { listAllUsers, updateUserPremiumStatus, getPlatformConfig, updatePlatformConfig, supabase } from '../services/supabase';
import { UserProfile } from '../types';
import ChampionshipWizard from './ChampionshipWizard';

const AdminCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'users' | 'opal' | 'system'>('tournaments');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [opalUrl, setOpalUrl] = useState('');

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
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg"><ShieldAlert size={28} /></div> 
            Tutor <span className="text-red-600">Command</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Gerenciamento de Nodos, Usuários e Parametrização de Arenas.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
           <TabBtn active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Campeonatos" />
           <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Estrategistas" />
           <TabBtn active={activeTab === 'opal'} onClick={() => setActiveTab('opal')} label="Opal Hub" />
           <TabBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Health" />
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'tournaments' && (
          <div className="space-y-8">
            {!showWizard ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl"><Trophy size={32} /></div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Arenas Ativas</h3>
                         <p className="text-slate-400 font-medium">Orquestre novos ciclos competitivos.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowWizard(true)}
                     className="px-10 py-5 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-4 shadow-xl active:scale-95"
                   >
                     <Plus size={20} /> Parametrizar Novo Campeonato
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-40 grayscale select-none cursor-not-allowed">
                   <div className="p-10 bg-white border border-slate-100 rounded-[4rem] text-center space-y-4">
                      <LayoutGrid size={48} className="mx-auto text-slate-300" />
                      <p className="font-bold text-slate-400 uppercase text-xs">Nenhuma Arena em Andamento</p>
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
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b border-slate-100">
                  <tr>
                     <th className="p-8">Estrategista</th>
                     <th className="p-8">Nível</th>
                     <th className="p-8">Role</th>
                     <th className="p-8 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-8">
                          <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                          <div className="text-slate-400 font-medium">{user.email}</div>
                       </td>
                       <td className="p-8">
                          <span className={`px-4 py-2 rounded-xl font-black uppercase text-[9px] ${user.is_opal_premium ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                            {user.is_opal_premium ? 'Elite IA' : 'Standard'}
                          </span>
                       </td>
                       <td className="p-8 font-black uppercase text-blue-600">{user.role}</td>
                       <td className="p-8 text-right"><button className="p-3 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button></td>
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

const TabBtn = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {label}
  </button>
);

export default AdminCommandCenter;
