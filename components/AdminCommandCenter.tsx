
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Trophy, LayoutGrid, Activity, 
  Monitor, Plus, Trash2, RefreshCw, ArrowLeft,
  ShieldX, ShieldOff, AlertTriangle, Zap, Database,
  Settings, Loader2, Play, Hammer, HeartPulse, DollarSign, Gavel,
  CreditCard, Brain, Sparkles, TrendingUp
} from 'lucide-react';
import { 
  listAllUsers, getChampionships, processRoundTurnover, 
  deleteChampionship, purgeAllTrials, purgeAllProduction,
  createChampionshipWithTeams, supabase 
} from '../services/supabase';
import { getTutorOutlook } from '../services/gemini';
import { CHAMPIONSHIP_TEMPLATES, ALPHA_TEST_USERS } from '../constants';
import { UserProfile, Championship, Team, InsolvencyStatus, InterventionEntry } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import OracleHealthCheck from './OracleHealthCheck';
import { motion } from 'framer-motion';

const AdminCommandCenter: React.FC<{ preTab?: 'tournaments' | 'users' | 'system' | 'interventions' | 'outlook' }> = ({ preTab = 'tournaments' }) => {
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Outlook State
  const [outlookText, setOutlookText] = useState<string | null>(null);
  const [isOutlookLoading, setIsOutlookLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await getChampionships();
    if (data) setChampionships(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleGetOutlook = async () => {
    if (!selectedArena) return;
    setIsOutlookLoading(true);
    const outlook = await getTutorOutlook(selectedArena.market_indicators, selectedArena.teams || []);
    setOutlookText(outlook);
    setIsOutlookLoading(false);
  };

  const handleManualIntervention = async (teamId: string, type: 'CAPITAL' | 'FORGIVE' | 'STATUS' | 'CREDIT_LIMIT', value?: any) => {
    const confirmation = window.confirm(`PROTOCOLO MASTER: Esta intervenção alterará o curso da simulação. Confirmar?`);
    if (!confirmation) return;
    
    setLoading(true);
    try {
      let update: any = {};
      if (type === 'STATUS') update.insolvency_status = value as InsolvencyStatus;
      else if (type === 'CREDIT_LIMIT') update.credit_limit = value;
      else if (type === 'CAPITAL') {
        const team = selectedArena?.teams?.find(t => t.id === teamId);
        update.equity = (team?.equity || 0) + value;
      }
      
      await supabase.from('teams').update(update).eq('id', teamId);
      alert(`PROTOCOLO ATIVO: Unidade sincronizada.`);
      fetchData();
    } catch (e: any) { alert(`FALHA: ${e.message}`); }
    finally { setLoading(false); }
  };

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
        <header className="flex flex-col md:flex-row items-center justify-between px-4 gap-6">
           <div className="flex items-center gap-6">
              <button onClick={() => setSelectedArena(null)} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all"><ArrowLeft size={24} /></button>
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Arena: <span className="text-orange-500">{selectedArena.name}</span></h1>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Oracle Gold Build v12.8.5</p>
              </div>
           </div>
           <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
              <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Monitor" color="orange" />
              <NavTab active={activeTab === 'interventions'} onClick={() => setActiveTab('interventions')} label="Crise" color="indigo" />
              <NavTab active={activeTab === 'outlook'} onClick={() => setActiveTab('outlook')} label="Previsão IA" color="emerald" />
           </div>
        </header>

        {activeTab === 'outlook' ? (
          <div className="px-4 space-y-10 animate-in slide-in-from-right-10 duration-500">
             <div className="bg-emerald-600/10 border border-emerald-500/20 p-10 rounded-[4rem] flex flex-col md:flex-row items-center gap-10">
                <div className="p-6 bg-emerald-600 text-white rounded-3xl shadow-xl"><Brain size={48}/></div>
                <div className="space-y-4 text-center md:text-left">
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Strategos Prediction outlook</h3>
                   <p className="text-emerald-100/60 text-sm font-medium uppercase tracking-widest leading-relaxed max-w-2xl">
                     Simule o impacto das variáveis macro atuais antes do turnover. A IA analisará o "Efeito Borboleta" nas demonstrações financeiras das equipes.
                   </p>
                   <button 
                     onClick={handleGetOutlook}
                     disabled={isOutlookLoading}
                     className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-emerald-950 transition-all flex items-center gap-3 shadow-2xl disabled:opacity-50"
                   >
                     {isOutlookLoading ? <Loader2 className="animate-spin" size={16}/> : <><Sparkles size={16}/> Gerar Relatório de Previsão</>}
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-slate-900 border border-white/5 p-12 rounded-[4rem] min-h-[400px] relative overflow-hidden">
                   <TrendingUp className="absolute -bottom-10 -right-10 opacity-[0.02]" size={300}/>
                   <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-8 border-b border-white/5 pb-4 italic">Resultados da Simulação Neural</h4>
                   {outlookText ? (
                     <div className="text-slate-300 text-lg leading-relaxed italic font-medium whitespace-pre-wrap">
                        {outlookText}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center space-y-4">
                        <Activity size={64}/>
                        <p className="text-[10px] font-black uppercase tracking-widest">Inicie o protocolo de previsão para ver os dados.</p>
                     </div>
                   )}
                </div>
                <div className="lg:col-span-4 space-y-8">
                   <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                      <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Variáveis Sincronizadas</h4>
                      <div className="space-y-3">
                         <OutlookVar label="Inflação" val={`${selectedArena.market_indicators.inflation_rate}%`} />
                         <OutlookVar label="TR (Juros)" val={`${selectedArena.market_indicators.interest_rate_tr}%`} />
                         <OutlookVar label="ICE (Crescimento)" val={`${selectedArena.market_indicators.growth_rate}%`} />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : activeTab === 'interventions' ? (
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
                  <TeamInterventionCard key={team.id} team={team} onAction={handleManualIntervention} />
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-10">
            <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
            <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
          </div>
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
          <p className="text-slate-500 mt-1 font-medium text-sm italic">Fidelidade GOLD v12.8.5 • Sincronização v6.0</p>
        </div>
      </div>

      <div className="px-4">
        {!showWizard ? (
          <div className="space-y-12">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-6 relative z-10">
                   <div className="p-5 bg-orange-600 text-white rounded-3xl shadow-2xl"><Plus size={40} /></div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Criar Nova Arena</h3>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Protocolo de implantação de simuladores multiplayer.</p>
                   </div>
                </div>
                <button onClick={() => setShowWizard(true)} className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-2xl">Iniciar Orquestração</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {championships.map((champ) => (
                  <div key={champ.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${champ.is_trial ? 'bg-orange-600/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'}`}>{champ.is_trial ? 'Teste Grátis' : 'Arena Live'}</span>
                        <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                     </div>
                     <h5 className="text-2xl font-black text-slate-900 uppercase italic leading-tight mb-6">{champ.name}</h5>
                     <button onClick={() => setSelectedArena(champ)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg"><Monitor size={14}/> Gerenciar Unidade</button>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <ChampionshipWizard onComplete={() => { setShowWizard(false); fetchData(); }} />
        )}
      </div>
    </div>
  );
};

const NavTab = ({ active, onClick, label, color }: any) => {
  const activeClasses = {
    orange: 'bg-orange-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    emerald: 'bg-emerald-600 text-white'
  }[color as 'orange' | 'indigo' | 'emerald'];

  return (
    <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${active ? activeClasses : 'text-slate-500 hover:text-white'}`}>{label}</button>
  );
};

const TeamInterventionCard = ({ team, onAction }: any) => (
  <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
     <div className="flex justify-between items-center">
        <h4 className="text-xl font-black text-white uppercase italic">{team.name}</h4>
        <div className="text-right">
           <span className={`block text-[8px] font-black uppercase ${team.insolvency_status === 'BANKRUPT' ? 'text-rose-500' : 'text-emerald-500'}`}>{team.insolvency_status || 'ESTÁVEL'}</span>
           <span className="text-[10px] text-slate-500 font-mono italic">Equity: ${team.equity?.toLocaleString()}</span>
        </div>
     </div>
     <div className="grid grid-cols-1 gap-3">
        <InterventionBtn onClick={() => onAction(team.id, 'CAPITAL', 1000000)} label="Injetar $1M (Aporte)" icon={<DollarSign size={14}/>} color="emerald" />
        <InterventionBtn onClick={() => onAction(team.id, 'STATUS', 'SAUDAVEL')} label="Suspender Falência" icon={<HeartPulse size={14}/>} color="blue" />
        <InterventionBtn onClick={() => {
           const newVal = prompt("Novo limite de crédito ($):", team.credit_limit?.toString());
           if (newVal) onAction(team.id, 'CREDIT_LIMIT', Number(newVal));
        }} label="Ajustar Limite Crédito" icon={<CreditCard size={14}/>} color="indigo" />
     </div>
  </div>
);

const InterventionBtn = ({ label, icon, onClick, color }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all hover:text-white ${color === 'emerald' ? 'hover:bg-emerald-600 text-emerald-400' : color === 'blue' ? 'hover:bg-blue-600 text-blue-400' : 'hover:bg-indigo-600 text-indigo-400'}`}>
     {icon} {label}
  </button>
);

const OutlookVar = ({ label, val }: any) => (
  <div className="flex justify-between items-center">
     <span className="text-[8px] font-bold text-slate-500 uppercase">{label}</span>
     <span className="text-xs font-black text-white italic">{val}</span>
  </div>
);

export default AdminCommandCenter;
