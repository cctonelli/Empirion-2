import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Trophy, LayoutGrid, Activity, 
  Monitor, Plus, Trash2, RefreshCw, ArrowLeft,
  ShieldX, ShieldOff, AlertTriangle, Zap, Database,
  Settings, Loader2, Play
} from 'lucide-react';
import { 
  listAllUsers, getChampionships, processRoundTurnover, 
  deleteChampionship, purgeAllTrials, purgeAllProduction,
  createChampionshipWithTeams 
} from '../services/supabase';
import { CHAMPIONSHIP_TEMPLATES, ALPHA_TEST_USERS } from '../constants';
import { UserProfile, Championship } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import OracleHealthCheck from './OracleHealthCheck';

const AdminCommandCenter: React.FC<{ preTab?: 'tournaments' | 'users' | 'system' }> = ({ preTab = 'tournaments' }) => {
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

  const handleResetToIndustrial = async () => {
    if (!confirm("PROTOCOLO DE EMERGÊNCIA: Isso limpará TODOS os dados e instanciará o Template Industrial GOLD Period 0. Prosseguir?")) return;
    setLoading(true);
    await purgeAllTrials();
    await purgeAllProduction();
    
    const tpl = CHAMPIONSHIP_TEMPLATES[0];
    const teams = Array.from({ length: 8 }).map((_, i) => ({ name: `Unidade Industrial 0${i + 1}` }));
    
    try {
      await createChampionshipWithTeams({
        name: "Industrial Mastery GOLD (Factory Reset)",
        branch: tpl.branch,
        total_rounds: 12,
        sales_mode: tpl.config.salesMode,
        scenario_type: tpl.config.scenarioType,
        currency: 'BRL',
        deadline_value: 7,
        deadline_unit: 'days',
        transparency_level: tpl.config.transparencyLevel,
        initial_financials: tpl.initial_financials,
        market_indicators: tpl.market_indicators
      }, teams, false);
      alert("ARENA INDUSTRIAL GOLD INSTANCIADA: Sistema pronto para orquestração.");
      fetchData();
    } catch (e: any) {
      alert("ERRO DE INSTÂNCIA: " + e.message);
    }
    setLoading(false);
  };

  const handlePurge = async (type: 'trial' | 'prod') => {
    if (!confirm("AÇÃO IRREVERSÍVEL: Deseja expurgar todos os nodos desta categoria?")) return;
    setLoading(true);
    type === 'trial' ? await purgeAllTrials() : await purgeAllProduction();
    alert("PURGE CONCLUÍDO via Protocolo v12.8.2 GOLD.");
    fetchData();
    setLoading(false);
  };

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="flex items-center justify-between px-4">
           <div className="flex items-center gap-6">
              <button onClick={() => setSelectedArena(null)} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all"><ArrowLeft size={24} /></button>
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gestão: <span className="text-orange-500">{selectedArena.name}</span></h1>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Oracle GOLD Node v12.8.2 • Ciclo Atual: 0{selectedArena.current_round}</p>
              </div>
           </div>
        </header>
        <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
        <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
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
          <p className="text-slate-500 mt-1 font-medium text-sm">Parametrização Industrial v12.8.2 GOLD Stable.</p>
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
                         <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Configure parâmetros GOLD v12.8.2.</p>
                      </div>
                   </div>
                   <div className="flex gap-4 relative z-10">
                      <button onClick={handleResetToIndustrial} className="px-8 py-6 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all flex items-center gap-3">
                         <Database size={16} /> Factory Reset (Industrial)
                      </button>
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
                      <div className="p-6 bg-slate-50 rounded-3xl text-center"><span className="block text-[8px] font-black text-slate-400 uppercase">Engine</span><span className="text-xl font-black text-slate-900 font-mono italic">v12.8.2</span></div>
                      <div className="p-6 bg-slate-50 rounded-3xl text-center"><span className="block text-[8px] font-black text-slate-400 uppercase">Uptime</span><span className="text-xl font-black text-slate-900 font-mono italic">99.9%</span></div>
                   </div>
                </div>
                <div className="bg-rose-600 p-10 rounded-[4rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
                   <ShieldX className="absolute -bottom-10 -right-10 opacity-10" size={200} />
                   <h3 className="text-xl font-black uppercase italic flex items-center gap-3"><AlertTriangle /> Danger Zone</h3>
                   <div className="space-y-3 relative z-10">
                      <button onClick={() => handlePurge('trial')} className="w-full py-5 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-950 hover:text-white transition-all">Limpar Sandbox</button>
                      <button onClick={() => handlePurge('prod')} className="w-full py-5 bg-rose-950 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all">Reset Total Produção</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommandCenter;