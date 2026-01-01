
import React, { useState } from 'react';
import { 
  ShieldAlert, Workflow, CreditCard, Activity, Users, Settings, 
  Terminal, Database, Globe, Lock, Unlock, Server 
} from 'lucide-react';

/**
 * AdminCommandCenter provides platform orchestration and user validation tools for admins and tutors.
 */
const AdminCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'modalities' | 'opal'>('system');

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
           <button onClick={() => setActiveTab('opal')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'opal' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Opal AI</button>
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
                       <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="https://opal.google/shared/..." />
                    </div>
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
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Os usuários premium verão o iframe do Opal embutido. Usuários free verão o banner de upgrade. Ative esta opção para monetizar fluxos de consultoria automática.</p>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" readOnly checked className="w-5 h-5 accent-indigo-600" />
                       <span className="text-[10px] font-black uppercase text-slate-400">Paywall Ativo Globalmente</span>
                    </div>
                 </div>
              </div>
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

      {activeTab === 'users' && (
        <div className="px-4 p-10 bg-white rounded-[3rem] border border-slate-100">
           <div className="flex items-center gap-3 mb-8 text-slate-400 uppercase font-black text-[10px] tracking-widest">
              <Users size={16} /> Player Directory
           </div>
           <p className="text-slate-500 italic">User management interface is in maintenance mode.</p>
        </div>
      )}

      {activeTab === 'modalities' && (
        <div className="px-4 p-10 bg-white rounded-[3rem] border border-slate-100">
           <div className="flex items-center gap-3 mb-8 text-slate-400 uppercase font-black text-[10px] tracking-widest">
              <Settings size={16} /> Arena Ruleset Config
           </div>
           <p className="text-slate-500 italic">Modality configuration node is in maintenance mode.</p>
        </div>
      )}
    </div>
  );
};

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
