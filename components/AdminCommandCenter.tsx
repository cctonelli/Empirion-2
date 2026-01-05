import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Workflow, Users, Settings, 
  Terminal, Database, Globe, UserCog,
  CheckCircle2, Save, Loader2, RefreshCw, Star,
  Search, ShieldCheck, Trash2, Mail, Plus,
  Trophy, LayoutGrid, Activity, Calculator, Sliders,
  ChevronRight, Calendar, BarChart3, Radio, Monitor,
  Play, Pause, ArrowLeft, ShieldX, Zap, AlertTriangle, ShieldOff
} from 'lucide-react';
import { listAllUsers, updateUserPremiumStatus, getChampionships, supabase, processRoundTurnover, deleteChampionship, purgeAllTrials, purgeAllProduction } from '../services/supabase';
import { UserProfile, Championship } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import OracleHealthCheck from './OracleHealthCheck';

interface AdminProps {
  preTab?: 'tournaments' | 'users' | 'opal' | 'system';
}

const AdminCommandCenter: React.FC<AdminProps> = ({ preTab = 'tournaments' }) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'users' | 'opal' | 'system'>(preTab);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'users') {
      const { data } = await listAllUsers();
      if (data) setUsers(data as any[]);
    } else if (activeTab === 'tournaments' || activeTab === 'system') {
      const { data } = await getChampionships();
      if (data) setChampionships(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleTurnover = async () => {
    if (!selectedArena) return;
    if (!confirm(`CONFIRMAR TURNOVER: Deseja encerrar o Ciclo 0${selectedArena.current_round} e processar os resultados?`)) return;
    
    setIsProcessing(true);
    const result = await processRoundTurnover(selectedArena.id, selectedArena.current_round);
    setIsProcessing(false);

    if (result.success) {
      alert("CICLO CONCLUÍDO: Todos os balanços foram processados e a Gazeta P0" + (selectedArena.current_round + 1) + " está disponível.");
      setSelectedArena({ ...selectedArena, current_round: selectedArena.current_round + 1 });
    } else {
      alert("ERRO NO MOTOR ORACLE: " + result.error);
    }
  };

  const handleDeleteArena = async (id: string, isTrial: boolean, name: string) => {
    if (!confirm(`PROTOCOLO DE EXCLUSÃO v12.8.2: Tem certeza que deseja deletar a arena "${name}"? Esta ação removerá permanentemente todos os nodos e sessões vinculadas.`)) return;
    
    setLoading(true);
    const { error } = await deleteChampionship(id, isTrial);
    if (error) {
      alert("FALHA NA EXCLUSÃO: " + error.message);
    } else {
      alert("ARENA REMOVIDA: Nodos de memória local extirpados com sucesso.");
      fetchData();
    }
    setLoading(false);
  };

  const handlePurgeTrials = async () => {
    if (!confirm("LIMPEZA PROFUNDA: Deseja remover TODOS os campeonatos do modo Sandbox/Trial?")) return;
    setLoading(true);
    const { error } = await purgeAllTrials();
    if (!error) alert("SANDBOX LIMPA: Testes antigos removidos via Protocolo v12.8.2 GOLD.");
    else alert("ERRO DE EXPURGO: " + error.message);
    fetchData();
    setLoading(false);
  };

  const handlePurgeProduction = async () => {
    if (!confirm("ALERTA CRÍTICO: Deseja remover TODOS os campeonatos REAIS/LIVE? Esta ação apagará todo o histórico do projeto.")) return;
    if (!confirm("CONFIRMAÇÃO FINAL: Você tem certeza absoluta? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    const { error } = await purgeAllProduction();
    if (!error) alert("PRODUÇÃO LIMPA: Arena resetada para o estado de fábrica v12.8.2 GOLD.");
    else alert("ERRO DE EXPURGO: " + error.message);
    fetchData();
    setLoading(false);
  };

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="flex items-center justify-between px-4">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setSelectedArena(null)}
                className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Gestão: <span className="text-orange-500">{selectedArena.name}</span>
                 </h1>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">
                   Nodo de Operação Industrial v12.8.2 GOLD • Ciclo Atual: 0{selectedArena.current_round}
                 </p>
              </div>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={handleTurnover}
                disabled={isProcessing}
                className="px-8 py-4 bg-emerald-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-white hover:text-emerald-600 transition-all disabled:opacity-50"
              >
                 {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor"/>}
                 Processar Rodada
              </button>
           </div>
        </header>

        <div className="grid grid-cols-1 gap-12 px-4">
           <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
           <TutorArenaControl 
             championship={selectedArena} 
             onUpdate={(updates) => setSelectedArena({...selectedArena, ...updates})} 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter italic">
            <div className="p-2 bg-orange-600 text-white rounded-xl shadow-lg"><ShieldAlert size={28} /></div> 
            Tutor <span className="text-orange-600">Master Control</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Parametrização de Arenas e Gestão de Nodos v12.8.2 GOLD.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
           <TabBtn active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Gestão de Arenas" icon={<Trophy size={14}/>} />
           <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Estrategistas" icon={<Users size={14}/>} />
           <TabBtn active={activeTab === 'opal'} onClick={() => setActiveTab('opal')} label="Opal Hub" icon={<Workflow size={14}/>} />
           <TabBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Health & Maintenance" icon={<Activity size={14}/>} />
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'tournaments' && (
          <div className="space-y-8">
            {!showWizard ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
                      <Trophy size={160} className="text-white" />
                   </div>
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="p-5 bg-orange-600 text-white rounded-3xl shadow-2xl shadow-orange-500/20"><Plus size={40} /></div>
                      <div>
                         <h3 className="text-3xl font-black text-white uppercase tracking-tight italic">Criar Nova Arena</h3>
                         <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Configure parâmetros e regras GOLD v12.8.2.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowWizard(true)}
                     className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center gap-4 shadow-2xl active:scale-95 relative z-10"
                   >
                     <Settings size={20} /> Iniciar Orquestração
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between px-6">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Arenas sob sua Gestão</h4>
                      <button onClick={fetchData} className="text-blue-500 hover:text-white transition-colors flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                         <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh Oracle
                      </button>
                   </div>

                   {championships.length === 0 && !loading ? (
                     <div className="p-20 bg-slate-50 border border-slate-200 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-center gap-6 opacity-60">
                        <LayoutGrid size={48} className="text-slate-300" />
                        <p className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Sem arenas ativas detectadas.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {championships.map((champ) => (
                           <div key={champ.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between min-h-[320px]">
                              <div className="space-y-6">
                                 <div className="flex justify-between items-start">
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${champ.is_trial ? 'bg-orange-600/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                       {champ.is_trial ? 'Teste Grátis' : 'Arena Live'}
                                    </div>
                                    {champ.is_public && <Globe size={14} className="text-blue-500" />}
                                 </div>
                                 <div>
                                    <h5 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic leading-tight group-hover:text-orange-600 transition-colors">{champ.name}</h5>
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-widest">{champ.branch} Unit</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div className="space-y-1 text-slate-900 font-black">
                                       <Calendar size={12} className="text-orange-500" /> {champ.current_round}/{champ.total_rounds}
                                    </div>
                                 </div>
                              </div>
                              <div className="pt-8 flex gap-3">
                                 <button onClick={() => setSelectedArena(champ)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                   <Monitor size={14}/> Gerenciar
                                 </button>
                                 <button onClick={() => handleDeleteArena(champ.id, !!champ.is_trial, champ.name)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-500 hover:bg-rose-50 transition-colors border border-slate-100">
                                   <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            ) : (
              <ChampionshipWizard onComplete={() => { setShowWizard(false); fetchData(); }} />
            )}
          </div>
        )}

        {activeTab === 'users' && (
           <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
             <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b border-slate-100">
                   <tr>
                      <th className="p-8">Estrategista</th>
                      <th className="p-8">Nível de Inteligência</th>
                      <th className="p-8 text-right">Comandos</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {users.map(user => (
                     <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-8 font-black text-slate-900 text-sm">{user.name}</td>
                        <td className="p-8">
                           <button onClick={async () => { await updateUserPremiumStatus(user.supabase_user_id, !user.is_opal_premium); fetchData(); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${user.is_opal_premium ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-400'}`}>
                             {user.is_opal_premium ? 'Premium Elite' : 'Standard'}
                           </button>
                        </td>
                        <td className="p-8 text-right">
                           <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-12">
             <OracleHealthCheck />
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl"><Activity size={28} /></div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Integrity</h3>
                         <p className="text-slate-500 font-medium">Monitoramento de integridade e latência v12.8.2 GOLD.</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <HealthMetric label="Database Nodes" val="Active" status="online" />
                      <HealthMetric label="Turnover Engine" val="v12.8.2" status="stable" />
                      <HealthMetric label="Memory Stack" val="14%" status="online" />
                   </div>
                </div>

                <div className="bg-rose-600 p-10 rounded-[4rem] text-white shadow-2xl space-y-8 relative overflow-hidden group">
                   <ShieldX className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-transform" size={200} />
                   <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-3">
                         <AlertTriangle size={24} />
                         <h3 className="text-xl font-black uppercase italic tracking-tighter">Danger Zone</h3>
                      </div>
                      <p className="text-xs font-bold text-rose-100 leading-relaxed uppercase">Expurgar resíduos para garantir novos nodos GOLD. Ação irreversível via PostgreSQL Cascade.</p>
                   </div>
                   <div className="space-y-3 relative z-10">
                      <button onClick={handlePurgeTrials} disabled={loading} className="w-full py-5 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
                         <ShieldOff size={16} /> Limpar Sandbox (Testes)
                      </button>
                      <button onClick={handlePurgeProduction} disabled={loading} className="w-full py-5 bg-rose-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
                         <ShieldX size={16} /> Reset Total Produção
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HealthMetric = ({ label, val, status }: any) => (
  <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-2">
     <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     <div className="flex items-center justify-between">
        <span className="text-2xl font-black text-slate-900 italic font-mono">{val}</span>
        <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
     </div>
  </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap active:scale-95 ${active ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>{icon} {label}</button>
);

export default AdminCommandCenter;