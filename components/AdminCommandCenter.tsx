
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Trophy, LayoutGrid, Activity, 
  Monitor, Plus, Trash2, RefreshCw, ArrowLeft,
  ShieldX, ShieldOff, AlertTriangle, Zap, Database,
  Settings, Loader2, Play, Hammer, HeartPulse, DollarSign, Gavel
} from 'lucide-react';
import { 
  listAllUsers, getChampionships, processRoundTurnover, 
  deleteChampionship, purgeAllTrials, purgeAllProduction,
  createChampionshipWithTeams, supabase 
} from '../services/supabase';
import { CHAMPIONSHIP_TEMPLATES, ALPHA_TEST_USERS } from '../constants';
import { UserProfile, Championship, Team, InsolvencyStatus, InterventionEntry } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import OracleHealthCheck from './OracleHealthCheck';

const AdminCommandCenter: React.FC<{ preTab?: 'tournaments' | 'users' | 'system' | 'interventions' }> = ({ preTab = 'tournaments' }) => {
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await getChampionships();
    if (data) setChampionships(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleManualIntervention = async (teamId: string, type: 'CAPITAL' | 'FORGIVE' | 'STATUS', value?: any) => {
    const confirmation = window.confirm(`PROTOCOLO MASTER: Esta intervenção alterará o curso da simulação para esta unidade. Confirmar?`);
    if (!confirmation) return;
    
    setLoading(true);
    try {
      let update: any = {};
      const logEntry: InterventionEntry = {
        type: type === 'CAPITAL' ? 'CAPITAL_INJECTION' : type === 'FORGIVE' ? 'DEBT_FORGIVENESS' : 'MANUAL_STATUS',
        value: typeof value === 'number' ? value : undefined,
        tutor_note: `Manual intervention by Oracle Master. Action: ${type}`,
        timestamp: new Date().toISOString()
      };

      if (type === 'STATUS') {
        update.insolvency_status = value as InsolvencyStatus;
      }
      
      // Upsert logic for team table
      const { error } = await supabase.from('teams').update(update).eq('id', teamId);
      if (error) throw error;
      
      alert(`PROTOCOLO ATIVO: Unidade sincronizada com novos parâmetros.`);
      fetchData();
    } catch (e: any) {
      alert(`FALHA NA INTERVENÇÃO: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="flex items-center justify-between px-4">
           <div className="flex items-center gap-6">
              <button onClick={() => setSelectedArena(null)} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all"><ArrowLeft size={24} /></button>
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gestão: <span className="text-orange-500">{selectedArena.name}</span></h1>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Oracle GOLD Node v12.8.5 • Ciclo Atual: 0{selectedArena.current_round}</p>
              </div>
           </div>
           <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
              <button onClick={() => setActiveTab('tournaments')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'tournaments' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Monitor</button>
              <button onClick={() => setActiveTab('interventions')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'interventions' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Intervenções</button>
           </div>
        </header>

        {activeTab === 'interventions' ? (
          <div className="space-y-10 px-4">
             <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[3rem] flex items-center gap-6">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><Hammer size={24}/></div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase italic">Módulo de Gestão de Crise (ERPS)</h3>
                   <p className="text-xs text-indigo-200 opacity-70 leading-relaxed uppercase font-bold">Resgate unidades insolventes injetando capital ou perdoando dívidas para fins pedagógicos.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {selectedArena.teams?.map((team: Team) => (
                  <div key={team.id} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
                     <div className="flex justify-between items-center">
                        <h4 className="text-xl font-black text-white uppercase italic">{team.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${team.kpis?.insolvency_status === 'BANKRUPT' ? 'bg-rose-600 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           {team.kpis?.insolvency_status || 'ESTÁVEL'}
                        </span>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-3">
                        <InterventionBtn 
                           onClick={() => handleManualIntervention(team.id, 'CAPITAL', 1000000)} 
                           label="Injetar $1M (Aporte)" icon={<DollarSign size={14}/>} color="emerald" 
                        />
                        <InterventionBtn 
                           onClick={() => handleManualIntervention(team.id, 'STATUS', 'SAUDAVEL')} 
                           label="Suspender Falência" icon={<HeartPulse size={14}/>} color="blue" 
                        />
                        <InterventionBtn 
                           onClick={() => handleManualIntervention(team.id, 'FORGIVE', 0)} 
                           label="Perdoar Dívida CP" icon={<Gavel size={14}/>} color="indigo" 
                        />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <>
            <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
            <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
          </>
        )}
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
          <p className="text-slate-500 mt-1 font-medium text-sm">Orquestração Industrial v12.8.5 GOLD.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
           <button onClick={() => setActiveTab('tournaments')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tournaments' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>Arenas</button>
           <button onClick={() => setActiveTab('system')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>Sistema</button>
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'tournaments' && (
          <div className="space-y-12">
            {!showWizard ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="p-5 bg-orange-600 text-white rounded-3xl shadow-2xl"><Plus size={40} /></div>
                      <div>
                         <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Criar Nova Arena</h3>
                         <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Configure parâmetros de fidelidade industrial.</p>
                      </div>
                   </div>
                   <div className="flex gap-4 relative z-10">
                      <button onClick={() => setShowWizard(true)} className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">
                         Iniciar Orquestração
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {championships.map((champ) => (
                     <div key={champ.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${champ.is_trial ? 'bg-orange-600/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                              {champ.is_trial ? 'Teste Grátis' : 'Arena Live'}
                           </span>
                           <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                        <h5 className="text-2xl font-black text-slate-900 uppercase italic leading-tight mb-6">{champ.name}</h5>
                        <button onClick={() => setSelectedArena(champ)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                           <Monitor size={14}/> Gerenciar Unidade
                        </button>
                     </div>
                   ))}
                </div>
              </>
            ) : (
              <ChampionshipWizard onComplete={() => { setShowWizard(false); fetchData(); }} />
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-12">
             <OracleHealthCheck />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl"><Activity size={28} /></div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Integrity</h3>
                   </div>
                   <div className="grid grid-cols-3 gap-8">
                      <div className="p-6 bg-slate-50 rounded-3xl text-center"><span className="block text-[8px] font-black text-slate-400 uppercase">Latency</span><span className="text-xl font-black text-slate-900 font-mono italic">12ms</span></div>
                      <div className="p-6 bg-slate-50 rounded-3xl text-center"><span className="block text-[8px] font-black text-slate-400 uppercase">Engine</span><span className="text-xl font-black text-slate-900 font-mono italic">v12.8.5</span></div>
                      <div className="p-6 bg-slate-50 rounded-3xl text-center"><span className="block text-[8px] font-black text-slate-400 uppercase">Uptime</span><span className="text-xl font-black text-slate-900 font-mono italic">99.9%</span></div>
                   </div>
                </div>
                <div className="bg-rose-600 p-10 rounded-[4rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
                   <ShieldX className="absolute -bottom-10 -right-10 opacity-10" size={200} />
                   <h3 className="text-xl font-black uppercase italic flex items-center gap-3"><AlertTriangle /> Danger Zone</h3>
                   <div className="space-y-3 relative z-10">
                      <button onClick={() => purgeAllTrials()} className="w-full py-5 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-950 hover:text-white transition-all">Limpar Sandbox</button>
                      <button onClick={() => purgeAllProduction()} className="w-full py-5 bg-rose-950 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all">Reset Total Produção</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InterventionBtn = ({ label, icon, onClick, color }: any) => {
  const colors = {
    emerald: 'hover:bg-emerald-600 text-emerald-400',
    blue: 'hover:bg-blue-600 text-blue-400',
    indigo: 'hover:bg-indigo-600 text-indigo-400'
  }[color as 'emerald' | 'blue' | 'indigo'];

  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all hover:text-white ${colors}`}>
       {icon} {label}
    </button>
  );
}

export default AdminCommandCenter;
