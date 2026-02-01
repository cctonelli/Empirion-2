
import React, { useState, useEffect, useMemo } from 'react';
// Fix: Use any to bypass react-router-dom type resolution issues in this environment
import * as Router from 'react-router-dom';
const { useLocation, useNavigate } = Router as any;
import { 
  Plus, Trash2, ArrowLeft, Monitor, Command, Users, Globe, CreditCard, Cpu, Gauge,
  X, Palette, Menu as MenuIcon, Save, AtSign, Phone, FileCode, UserPlus, UserMinus, Shield,
  Trophy, Settings, ShieldAlert, Sparkles, Landmark, ArrowRight, Activity, LayoutDashboard,
  PenTool, Newspaper, History, Settings2, Rocket, Lock, ChevronLeft, ChevronRight, Zap, CheckCircle2,
  RefreshCw, Loader2, User
} from 'lucide-react';
import { 
  getChampionships, 
  deleteChampionship, 
  supabase,
  getUserProfile,
  getAllUsers,
  provisionDemoEnvironment,
  processRoundTurnover
} from '../services/supabase';
import { Championship, UserProfile, MenuItemConfig, Team } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import GazetteViewer from './GazetteViewer';
import TrailWizard from './TrailWizard';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { APP_VERSION, MENU_STRUCTURE, CHAMPIONSHIP_TEMPLATES, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

type TutorView = 'dashboard' | 'teams' | 'decisions' | 'intervention' | 'gazette';

const SYSTEM_TUTOR_ID = '00000000-0000-0000-0000-000000000000';

const AdminCommandCenter: React.FC<{ preTab?: string }> = ({ preTab = 'system' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isCreatingTrial, setIsCreatingTrial] = useState(false);
  
  const [tutorView, setTutorView] = useState<TutorView>('dashboard');
  const [decisionStats, setDecisionStats] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await (supabase.auth as any).getSession();
      const isTrialSessionLocal = localStorage.getItem('is_trial_session') === 'true';
      const storedArenaId = localStorage.getItem('active_champ_id');

      const userId = session?.user?.id || SYSTEM_TUTOR_ID;
      const prof = await getUserProfile(userId);
      setProfile(prof);
      
      if ((isTrialSessionLocal || prof?.role === 'tutor') && activeTab === 'system') {
         setActiveTab('tournaments');
      }

      const { data } = await getChampionships();
      if (data) {
         setChampionships(data);
         if (storedArenaId && !selectedArena && !isCreatingTrial) {
            const found = data.find(c => c.id === storedArenaId);
            if (found) setSelectedArena(found);
         }
      }
      
      if (activeTab === 'users' && prof?.role === 'admin') {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      }
    } catch (err) { console.error("Sync Error:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab, isCreatingTrial]);

  useEffect(() => {
    if (!selectedArena) return;
    const fetchStatus = async () => {
       const table = selectedArena.is_trial ? 'trial_decisions' : 'current_decisions';
       const { data } = await supabase.from(table)
         .select('team_id')
         .eq('championship_id', selectedArena.id)
         .eq('round', selectedArena.current_round + 1);
       
       const stats: Record<string, boolean> = {};
       data?.forEach(d => stats[d.team_id] = true);
       setDecisionStats(stats);
    };
    fetchStatus();
  }, [selectedArena, tutorView]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'new_trial') {
       provisionDemoEnvironment();
       setIsCreatingTrial(true);
       setTutorView('intervention');
    }
  }, [location.search]);

  const handleTurnover = async () => {
    if (!selectedArena || isProcessing) return;
    if (!confirm(`CONFIRMAR TURNOVER: Processar fechamento do Ciclo 0${selectedArena.current_round}?`)) return;

    setIsProcessing(true);
    try {
      const res = await processRoundTurnover(selectedArena.id, selectedArena.current_round);
      if (res.success) {
        alert("TURNOVER CONCLUÍDO: Todos os nodos industriais foram sincronizados.");
        fetchData();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      alert(`ERRO CRÍTICO NO MOTOR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const isAdmin = profile?.role === 'admin';

  const tutorViewOrder: TutorView[] = ['dashboard', 'teams', 'decisions', 'intervention', 'gazette'];
  
  const handleNav = (dir: 'next' | 'prev') => {
    const currentIdx = tutorViewOrder.indexOf(tutorView);
    if (dir === 'next' && currentIdx < tutorViewOrder.length - 1) setTutorView(tutorViewOrder[currentIdx + 1]);
    if (dir === 'prev' && currentIdx > 0) setTutorView(tutorViewOrder[currentIdx - 1]);
  };

  const clusterMetrics = useMemo(() => {
    if (!selectedArena?.teams) return { avgShare: 0, insolvencyRate: 0 };
    const teams = selectedArena.teams as Team[];
    const totalShare = teams.reduce((acc, t) => acc + (t.kpis?.market_share || 0), 0);
    const insolventCount = teams.filter(t => t.insolvency_status === 'BANKRUPT' || t.insolvency_status === 'RJ').length;
    
    return {
      avgShare: totalShare / Math.max(teams.length, 1),
      insolvencyRate: (insolventCount / Math.max(teams.length, 1)) * 100
    };
  }, [selectedArena]);

  const computedAiNews = useMemo(() => {
     if (!selectedArena) return "";
     const currentRound = selectedArena.current_round;
     const nextRound = currentRound + 1;
     const nextRoundRules = selectedArena.round_rules?.[nextRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[nextRound];
     const requiresBP = nextRoundRules?.require_business_plan === true;
     
     let news = "O Oráculo Strategos está processando o briefing deste ciclo...\n\n";
     if (requiresBP) {
        news += "⚠️ [ALERTA DE PROTOCOLO]: Apresentação de BUSINESS PLAN exigida para o próximo Ciclo (P0" + (nextRound < 10 ? '0' + nextRound : nextRound) + ").";
     } else {
        news += "O mercado industrial apresenta estabilidade nos indicadores de demanda.";
     }
     return news;
  }, [selectedArena]);

  if (selectedArena || isCreatingTrial) {
    const arenaName = selectedArena?.name || "Strategos Trial Engine";
    const currentRound = selectedArena?.current_round || 0;

    return (
      <div className="flex flex-col h-full bg-[#020617] relative overflow-hidden">
        {!isCreatingTrial && (
           <>
              <button onClick={() => handleNav('prev')} disabled={tutorView === tutorViewOrder[0]} className="fixed left-6 top-1/2 -translate-y-1/2 p-6 bg-white/5 border border-white/10 rounded-full text-slate-500 hover:text-orange-500 hover:bg-white/10 transition-all z-[3000] disabled:opacity-0 active:scale-90 shadow-2xl">
                 <ChevronLeft size={32} />
              </button>
              <button onClick={() => handleNav('next')} disabled={tutorView === tutorViewOrder[tutorViewOrder.length - 1]} className="fixed right-6 top-1/2 -translate-y-1/2 p-6 bg-white/5 border border-white/10 rounded-full text-slate-500 hover:text-orange-500 hover:bg-white/10 transition-all z-[3000] disabled:opacity-0 active:scale-90 shadow-2xl">
                 <ChevronRight size={32} />
              </button>
           </>
        )}

        <header className="shrink-0 z-[2000] bg-slate-900/80 border-b border-white/10 px-8 py-3 backdrop-blur-3xl flex justify-between items-center shadow-xl">
           <div className="flex items-center gap-6">
              <button onClick={() => { 
                 localStorage.removeItem('active_champ_id'); 
                 setSelectedArena(null); 
                 setIsCreatingTrial(false);
                 navigate('/app/admin');
              }} className="text-slate-500 hover:text-white transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest"><ArrowLeft size={14}/> Sair</button>
              <div className="h-4 w-px bg-white/10" />
              <h1 className="text-xs font-black text-white uppercase italic tracking-widest">
                 Arena <span className="text-orange-500">{arenaName}</span>
              </h1>
           </div>
           
           <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/5">
              <ArenaNavBtn active={tutorView === 'dashboard'} onClick={() => setTutorView('dashboard')} label="Cockpit" icon={<LayoutDashboard size={12}/>} disabled={isCreatingTrial} />
              <ArenaNavBtn active={tutorView === 'teams'} onClick={() => setTutorView('teams')} label="Equipes" icon={<Users size={12}/>} disabled={isCreatingTrial} />
              <ArenaNavBtn active={tutorView === 'decisions'} onClick={() => setTutorView('decisions')} label="Decisões" icon={<History size={12}/>} disabled={isCreatingTrial} />
              <ArenaNavBtn active={tutorView === 'intervention'} onClick={() => setTutorView('intervention')} label="Planejamento" icon={<Zap size={12}/>} />
              <ArenaNavBtn active={tutorView === 'gazette'} onClick={() => setTutorView('gazette')} label="Gazeta" icon={<Newspaper size={12}/>} disabled={isCreatingTrial} />
           </div>

           <div className="flex items-center gap-4">
              {selectedArena && (
                <button 
                  onClick={handleTurnover}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>} 
                  Processar Turnover P0{selectedArena.current_round}
                </button>
              )}
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 max-w-[1600px] mx-auto w-full relative z-10">
           <AnimatePresence mode="wait">
              {tutorView === 'dashboard' && selectedArena && (
                <motion.div key="dash" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <MetricCard label="Equipes" val={selectedArena.teams?.length?.toString() || '0'} icon={<Users className="text-blue-500"/>} trend="Active" />
                      <MetricCard label="Market Share Médio" val={`${clusterMetrics.avgShare.toFixed(1)}%`} icon={<Activity className="text-emerald-500"/>} trend="Real-time" />
                      <MetricCard label="Insolvência" val={`${clusterMetrics.insolvencyRate.toFixed(0)}%`} icon={<ShieldAlert className="text-rose-500"/>} trend="Critical" />
                      <MetricCard label="Ciclos Restantes" val={(selectedArena.total_rounds - selectedArena.current_round).toString()} icon={<Trophy className="text-amber-500"/>} trend="Live" />
                   </div>
                   <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} isTrial={!!selectedArena.is_trial} />
                </motion.div>
              )}
              {tutorView === 'teams' && selectedArena && (
                <motion.div key="teams" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {selectedArena.teams?.map(t => (
                      <div key={t.id} className="p-10 bg-slate-900 border border-white/5 rounded-[4rem] space-y-6 shadow-xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="flex justify-between items-center relative z-10">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500"><Shield size={32}/></div>
                            <div className="flex flex-col items-end gap-2">
                               <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${t.is_bot ? 'bg-indigo-600/20 text-indigo-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                                  {t.is_bot ? 'Bot Node' : 'Human Operator'}
                               </span>
                               {decisionStats[t.id] ? (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg animate-pulse">
                                     <CheckCircle2 size={10} />
                                     <span className="text-[7px] font-black uppercase">Decisão Recebida</span>
                                  </div>
                               ) : (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-slate-500 rounded-lg">
                                     <Activity size={10} />
                                     <span className="text-[7px] font-black uppercase">Pendente</span>
                                  </div>
                               )}
                            </div>
                         </div>
                         <h4 className="text-3xl font-black text-white uppercase italic relative z-10">{t.name}</h4>
                         <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10 opacity-60">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Rating Round Zero: AAA</span>
                            <span className="text-[8px] font-mono text-slate-600 uppercase">ID: {t.id.split('-')[0]}</span>
                         </div>
                      </div>
                   ))}
                </motion.div>
              )}
              {tutorView === 'decisions' && selectedArena && (
                <motion.div key="dec" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}}>
                   <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} isTrial={!!selectedArena.is_trial} />
                </motion.div>
              )}
              {tutorView === 'intervention' && (
                <motion.div key="plan" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}} className="h-full">
                   {isCreatingTrial ? (
                      <TrailWizard onComplete={() => {
                        setIsCreatingTrial(false);
                        fetchData();
                        setTutorView('dashboard');
                      }} />
                   ) : selectedArena && (
                      <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
                   )}
                </motion.div>
              )}
              {tutorView === 'gazette' && selectedArena && (
                <motion.div key="gaz" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="flex justify-center">
                   <GazetteViewer arena={selectedArena} aiNews={computedAiNews} round={selectedArena.current_round} userRole="tutor" onClose={() => setTutorView('dashboard')} />
                </motion.div>
              )}
           </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 font-sans max-w-[1600px] mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-600 text-white rounded-[2rem] shadow-2xl"><Command size={40} /></div> 
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic leading-none">
              {isAdmin ? 'Command' : 'Tutor'} <span className="text-orange-600">Center</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 sticky top-0 z-[200] bg-[#020617]/80 backdrop-blur-xl py-4 border-b border-white/5">
         <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Arenas & Campeonatos" color="orange" />
         {isAdmin && <NavTab active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Usuários & RLS" color="emerald" />}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'tournaments' && (
            !showWizard ? (
              <motion.div key="list" initial={{opacity:0}} animate={{opacity:1}} className="space-y-16">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-900 p-12 md:p-16 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-10 relative z-10">
                       <div className="p-8 md:p-10 bg-orange-600 text-white rounded-[3rem] shadow-2xl"><Plus size={64} /></div>
                       <div>
                          <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tight leading-none">Implantar Arena</h3>
                          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mt-5 italic max-w-xl">Configure novos campeonatos e parametrize o cenário econômico inicial.</p>
                       </div>
                    </div>
                    <button onClick={() => setShowWizard(true)} className="px-12 md:px-20 py-6 md:py-8 bg-white text-slate-950 rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95 z-10 shrink-0">Novo Strategos Wizard</button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {championships.map((champ) => (
                      <div key={champ.id} className="bg-slate-900/50 p-12 rounded-[4rem] border border-white/5 shadow-2xl hover:border-orange-500/40 transition-all flex flex-col justify-between min-h-[420px] group">
                         <div>
                            <div className="flex justify-between items-start mb-12">
                               <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${champ.is_trial ? 'bg-orange-600 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                 {champ.is_trial ? 'Sandbox' : 'Live Arena'}
                               </span>
                               {isAdmin && <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-4 bg-white/5 rounded-2xl text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={24}/></button>}
                            </div>
                            <h5 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight mb-6 group-hover:text-orange-500 transition-colors">{champ.name}</h5>
                         </div>
                         <button onClick={() => { localStorage.setItem('active_champ_id', champ.id); setSelectedArena(champ); }} className="w-full py-6 mt-12 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-orange-600 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95">
                            <Monitor size={20} /> Entrar na Control Room
                         </button>
                      </div>
                    ))}
                 </div>
              </motion.div>
            ) : (
              <motion.div key="wizard" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="min-h-[80vh]">
                <div className="flex justify-between items-center mb-8 px-4">
                  <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">Strategos Orchestration Wizard</h2>
                  <button onClick={() => setShowWizard(false)} className="p-4 md:p-6 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all"><X size={20} /> Abortar Protocolo</button>
                </div>
                <ChampionshipWizard onComplete={() => { setShowWizard(false); fetchData(); }} />
              </motion.div>
            )
          )}

          {activeTab === 'users' && isAdmin && (
            <motion.div key="users" initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
               <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 shadow-xl">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-white/5">
                           <th className="pb-6 px-4">Identidade</th>
                           <th className="pb-6 px-4 text-center">Papel</th>
                           <th className="pb-6 px-4 text-center">Plano IA</th>
                           <th className="pb-6 px-4 text-right">Ações</th>
                        </tr>
                     </thead>
                     <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="group hover:bg-white/5 transition-all">
                             <td className="py-6 px-4">
                                <div className="flex items-center gap-4">
                                   {/* Fix: Added missing User icon to lucide-react imports to fix 'Cannot find name User' error. */}
                                   <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500"><User size={20}/></div>
                                   <div>
                                      <p className="text-sm font-black text-white uppercase italic">{u.name}</p>
                                      <p className="text-[9px] text-slate-500 font-mono">{u.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="py-6 px-4 text-center">
                                <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-rose-600 text-white' : 'bg-blue-600/20 text-blue-400'}`}>{u.role}</span>
                             </td>
                             <td className="py-6 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                   {u.is_opal_premium ? <span className="flex items-center gap-2 text-amber-500 font-black text-[9px] uppercase"><Sparkles size={12}/> Opal Elite</span> : <span className="text-slate-600 font-black text-[9px] uppercase tracking-widest">Base Standard</span>}
                                </div>
                             </td>
                             <td className="py-6 px-4 text-right">
                                <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-blue-500/50"><Settings size={16}/></button>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const NavTab = ({ active, onClick, label, color }: any) => {
  const activeClasses = {
    orange: 'bg-orange-600 text-white border-orange-500 shadow-[0_15px_40px_rgba(249,115,22,0.4)]',
    indigo: 'bg-indigo-600 text-white border-indigo-500 shadow-[0_15px_40px_rgba(79,70,229,0.4)]',
    emerald: 'bg-emerald-600 text-white border-emerald-500 shadow-[0_15px_40_rgba(16,185,129,0.4)]'
  }[color as 'orange' | 'indigo' | 'emerald'];

  return (
    <button onClick={onClick} className={`px-10 py-5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all border italic active:scale-95 whitespace-nowrap ${active ? activeClasses : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-300'}`}>
      {label}
    </button>
  );
};

const ArenaNavBtn = ({ active, onClick, label, icon, disabled }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    onClick={onClick} 
    className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all italic active:scale-95 border ${disabled ? 'opacity-30 cursor-not-allowed border-transparent text-slate-700' : active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'text-slate-500 border-transparent hover:text-slate-200'}`}
  >
     {disabled ? <Lock size={10} /> : icon} {label}
  </button>
);

const MetricCard = ({ label, val, icon, trend }: any) => (
  <div className="bg-slate-900 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-4">
     <div className="flex justify-between items-center">
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{trend}</span>
     </div>
     <div>
        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-3xl font-black text-white font-mono">{val}</span>
     </div>
  </div>
);

export default AdminCommandCenter;
