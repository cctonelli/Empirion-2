
import React, { useState, useEffect } from 'react';
// Fix: Use any to bypass react-router-dom type resolution issues in this environment
import * as Router from 'react-router-dom';
const { useLocation, useNavigate } = Router as any;
import { 
  Plus, Trash2, ArrowLeft, Monitor, Command, Users, Globe, CreditCard, Cpu, Gauge,
  X, Palette, Menu as MenuIcon, Save, AtSign, Phone, FileCode, UserPlus, UserMinus, Shield,
  Trophy, Settings, ShieldAlert, Sparkles, Landmark, ArrowRight, Activity, LayoutDashboard,
  PenTool, Newspaper, History, Settings2, Rocket, Lock
} from 'lucide-react';
import { 
  getChampionships, 
  deleteChampionship, 
  supabase,
  getUserProfile,
  getAllUsers,
  provisionDemoEnvironment
} from '../services/supabase';
import { Championship, UserProfile, MenuItemConfig } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import GazetteViewer from './GazetteViewer';
import TrailWizard from './TrailWizard';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { APP_VERSION, MENU_STRUCTURE, CHAMPIONSHIP_TEMPLATES } from '../constants';

type TutorView = 'dashboard' | 'planning' | 'decisions' | 'teams' | 'gazette';

const AdminCommandCenter: React.FC<{ preTab?: string }> = ({ preTab = 'system' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isCreatingTrial, setIsCreatingTrial] = useState(false);
  
  // View interna da Arena selecionada
  const [tutorView, setTutorView] = useState<TutorView>('dashboard');

  // CMS State
  const [heroTitle, setHeroTitle] = useState('Forje Seu Império');
  const [accentColor, setAccentColor] = useState('#f97316');
  const [menus, setMenus] = useState<MenuItemConfig[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'new_trial') {
       provisionDemoEnvironment();
       setIsCreatingTrial(true);
       setTutorView('planning');
    }
  }, [location.search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fix: Casting auth to any to resolve property missing error in this environment
      const { data: { session } } = await (supabase.auth as any).getSession();
      const isTrial = localStorage.getItem('is_trial_session') === 'true';
      const storedArenaId = localStorage.getItem('active_champ_id');

      // Handshake do perfil
      const userId = session?.user?.id || 'trial_user';
      const prof = await getUserProfile(userId);
      setProfile(prof);
      
      // No Trial, forçamos a aba de Arenas se não estiver logado como admin real
      if ((isTrial || prof?.role === 'tutor') && activeTab === 'system') {
         setActiveTab('tournaments');
      }

      const { data } = await getChampionships();
      if (data) {
         setChampionships(data);
         // AUTO-LOAD TRIAL ARENA: Se estivermos em trial e houver um ID salvo, selecionamos automaticamente
         if (isTrial && storedArenaId && !selectedArena && !isCreatingTrial) {
            const found = data.find(c => c.id === storedArenaId);
            if (found) setSelectedArena(found);
         }
      }
      
      if (activeTab === 'users' && prof?.role === 'admin') {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      }
      setMenus(MENU_STRUCTURE.map((m, i) => ({ id: `m-${i}`, label: m.label, path: m.path, isVisible: true })));
    } catch (err) { console.error("Sync Error:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab, isCreatingTrial]);

  const isAdmin = profile?.role === 'admin';
  const isTrialSession = localStorage.getItem('is_trial_session') === 'true';

  // --- VIEW DE COMANDO (ARENA SELECIONADA OU EM CRIAÇÃO) ---
  if (selectedArena || isCreatingTrial) {
    const arenaName = selectedArena?.name || "Nova Arena Trial";
    const currentRound = selectedArena?.current_round || 0;

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans max-w-[1600px] mx-auto p-6 min-h-screen">
        
        {/* HEADER DA ARENA - DESIGN SEBRAE STICKY v13.9 */}
        <header className="sticky top-0 z-[2000] bg-slate-900 border-2 border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl space-y-8 mb-10 border-t-orange-500/40">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6 shrink-0">
                 <button onClick={() => { 
                   localStorage.removeItem('active_champ_id'); 
                   setSelectedArena(null); 
                   setIsCreatingTrial(false);
                   navigate('/app/admin');
                 }} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl border border-white/10 transition-all active:scale-95"><ArrowLeft size={24} /></button>
                 <div>
                    <div className="flex items-center gap-3">
                       <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Arena <span className="text-orange-500">{arenaName}</span></h1>
                       <span className="px-3 py-0.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">
                          {isCreatingTrial ? 'Orquestração Ativa' : 'Sandbox Oracle'}
                       </span>
                    </div>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.5em] mt-2 italic opacity-70">
                       Ciclo: 0{currentRound} • Protocolo Industrial v13.9
                    </p>
                 </div>
              </div>
              
              {/* MENU SUPERIOR TÁTICO - RÓTULOS OFICIAIS EMPIRION v13.9 */}
              <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-950 rounded-[2rem] border border-white/5 shadow-inner">
                 <ArenaNavBtn disabled={isCreatingTrial} active={tutorView === 'dashboard'} onClick={() => setTutorView('dashboard')} label="COCKPIT" icon={<LayoutDashboard size={14}/>} />
                 <ArenaNavBtn active={tutorView === 'planning'} onClick={() => setTutorView('planning')} label="PLANEJAMENTO" icon={<PenTool size={14}/>} />
                 <ArenaNavBtn disabled={isCreatingTrial} active={tutorView === 'decisions'} onClick={() => setTutorView('decisions')} label="ANÁLISE DAS DECISÕES" icon={<History size={14}/>} />
                 <ArenaNavBtn disabled={isCreatingTrial} active={tutorView === 'teams'} onClick={() => setTutorView('teams')} label="EQUIPES" icon={<Users size={14}/>} />
                 <ArenaNavBtn disabled={isCreatingTrial} active={tutorView === 'gazette'} onClick={() => setTutorView('gazette')} label="GAZETA INDUSTRIAL" icon={<Newspaper size={14}/>} />
              </div>
           </div>
        </header>

        {/* VIEWPORT OPERACIONAL */}
        <main className="relative z-10">
           <AnimatePresence mode="wait">
              {tutorView === 'dashboard' && selectedArena && (
                <motion.div key="dash" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <MetricCard label="Equipes" val={selectedArena.teams?.length?.toString() || '0'} icon={<Users className="text-blue-500"/>} trend="Active" />
                      <MetricCard label="Market Share Médio" val="12.5%" icon={<Activity className="text-emerald-500"/>} trend="Balanced" />
                      <MetricCard label="Insolvência" val="0%" icon={<ShieldAlert className="text-rose-500"/>} trend="Safe" />
                      <MetricCard label="Ciclos Restantes" val={(selectedArena.total_rounds - selectedArena.current_round).toString()} icon={<Trophy className="text-amber-500"/>} trend="Live" />
                   </div>
                   <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
                </motion.div>
              )}

              {tutorView === 'planning' && (
                <motion.div key="plan" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}}>
                   {isCreatingTrial ? (
                      <TrailWizard onComplete={() => {
                        setIsCreatingTrial(false);
                        fetchData();
                      }} />
                   ) : selectedArena && (
                      <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
                   )}
                </motion.div>
              )}

              {tutorView === 'decisions' && selectedArena && (
                <motion.div key="dec" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}}>
                   <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
                </motion.div>
              )}

              {tutorView === 'teams' && selectedArena && (
                <motion.div key="teams" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {selectedArena.teams?.map(t => (
                      <div key={t.id} className="p-8 bg-slate-900 border border-white/5 rounded-[3rem] space-y-6 shadow-xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="flex justify-between items-center relative z-10">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-500"><Shield size={20}/></div>
                            <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${t.is_bot ? 'bg-indigo-600/20 text-indigo-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                               {t.is_bot ? 'Bot Node' : 'Human Operator'}
                            </span>
                         </div>
                         <h4 className="text-2xl font-black text-white uppercase italic relative z-10">{t.name}</h4>
                      </div>
                   ))}
                </motion.div>
              )}

              {tutorView === 'gazette' && selectedArena && (
                <motion.div key="gaz" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="flex justify-center">
                   <GazetteViewer arena={selectedArena} aiNews="O Oráculo Strategos está processando o briefing deste ciclo..." round={selectedArena.current_round} userRole="tutor" onClose={() => setTutorView('dashboard')} />
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
        
        <div className="flex items-center gap-6 bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
           <div className="flex items-center gap-4">
              <div className={`w-3.5 h-3.5 rounded-full animate-pulse shadow-[0_0_15px] ${isAdmin ? 'bg-blue-500 shadow-blue-500' : 'bg-emerald-500 shadow-emerald-500'}`} />
              <div className="flex flex-col">
                 <span className="text-lg font-black text-white uppercase italic tracking-tight">{profile?.nickname || 'ARENA_MASTER'}</span>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{isAdmin ? 'SYSTEM OWNER' : isTrialSession ? 'ARENA ORCHESTRATOR' : 'ARENA TUTOR'}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 sticky top-0 z-[200] bg-[#020617]/80 backdrop-blur-xl py-4 border-b border-white/5">
         {isAdmin && <NavTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Cluster Metrics" color="indigo" />}
         <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Arenas & Campeonatos" color="orange" />
         {isAdmin && (
           <>
             <NavTab active={activeTab === 'uidesign'} onClick={() => setActiveTab('uidesign')} label="CMS & Branding" color="indigo" />
             <NavTab active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Usuários & RLS" color="emerald" />
             <NavTab active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} label="Templates Blueprints" color="emerald" />
           </>
         )}
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
                <ChampionshipWizard isTrial={isTrialSession} onComplete={() => { setShowWizard(false); fetchData(); }} />
              </motion.div>
            )
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
    className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all italic active:scale-95 border-2 ${disabled ? 'opacity-30 grayscale cursor-not-allowed border-transparent text-slate-700' : active ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.6)] scale-105 z-10' : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/5'}`}
  >
     {disabled ? <Lock size={12} /> : icon} {label}
     {active && (
       <motion.div 
         layoutId="navPulse" 
         className="absolute -inset-1 bg-orange-600/20 blur-xl rounded-2xl -z-10"
         transition={{ type: "spring", bounce: 0.2, duration: 1 }}
       />
     )}
  </button>
);

const MetricCard = ({ label, val, icon, trend }: any) => (
  <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-4">
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
