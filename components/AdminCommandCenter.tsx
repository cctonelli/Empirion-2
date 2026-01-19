
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ArrowLeft, Monitor, Command, Users, Globe, CreditCard, Cpu, Gauge,
  X, Palette, Menu as MenuIcon, Save, AtSign, Phone, FileCode, UserPlus, UserMinus, Shield,
  Trophy, Settings, ShieldAlert, Sparkles, Landmark, ArrowRight, Activity, LayoutDashboard,
  PenTool, Newspaper, History, Settings2
} from 'lucide-react';
import { 
  getChampionships, 
  deleteChampionship, 
  supabase,
  getUserProfile,
  getAllUsers
} from '../services/supabase';
import { Championship, UserProfile, MenuItemConfig } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import GazetteViewer from './GazetteViewer';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { APP_VERSION, MENU_STRUCTURE, CHAMPIONSHIP_TEMPLATES } from '../constants';

type TutorView = 'dashboard' | 'planning' | 'decisions' | 'teams' | 'gazette';

const AdminCommandCenter: React.FC<{ preTab?: string }> = ({ preTab = 'system' }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  
  // View interna da Arena selecionada
  const [tutorView, setTutorView] = useState<TutorView>('dashboard');

  // CMS State
  const [heroTitle, setHeroTitle] = useState('Forje Seu Império');
  const [accentColor, setAccentColor] = useState('#f97316');
  const [menus, setMenus] = useState<MenuItemConfig[]>([]);

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
         if (isTrial && storedArenaId && !selectedArena) {
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

  useEffect(() => { fetchData(); }, [activeTab]);

  const isAdmin = profile?.role === 'admin';
  const isTrialSession = localStorage.getItem('is_trial_session') === 'true';

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans max-w-[1600px] mx-auto p-6 min-h-screen">
        
        {/* HEADER DA ARENA - DESIGN SEBRAE INSPIRED STICKY v13.8 */}
        <header className="sticky top-0 z-[1000] bg-slate-900 border-2 border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl space-y-8 mb-10 border-t-orange-500/40">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6 shrink-0">
                 <button onClick={() => { localStorage.removeItem('active_champ_id'); setSelectedArena(null); }} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl border border-white/10 transition-all active:scale-95"><ArrowLeft size={24} /></button>
                 <div>
                    <div className="flex items-center gap-3">
                       <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Arena <span className="text-orange-500">{selectedArena.name}</span></h1>
                       {selectedArena.is_trial && (
                         <span className="px-3 py-0.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">Sandbox Oracle</span>
                       )}
                    </div>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.5em] mt-2 italic opacity-70">Ciclo Ativo: 0{selectedArena.current_round} • Protocolo de Orquestração Industrial</p>
                 </div>
              </div>
              
              {/* MENU SUPERIOR TÁTICO - RÓTULOS OFICIAIS EMPIRION v13.8 */}
              <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-950 rounded-[2rem] border border-white/5 shadow-inner">
                 <ArenaNavBtn active={tutorView === 'dashboard'} onClick={() => setTutorView('dashboard')} label="COCKPIT" icon={<LayoutDashboard size={14}/>} />
                 <ArenaNavBtn active={tutorView === 'planning'} onClick={() => setTutorView('planning')} label="PLANEJAMENTO" icon={<PenTool size={14}/>} />
                 <ArenaNavBtn active={tutorView === 'decisions'} onClick={() => setTutorView('decisions')} label="ANÁLISE DAS DECISÕES" icon={<History size={14}/>} />
                 <ArenaNavBtn active={tutorView === 'teams'} onClick={() => setTutorView('teams')} label="EQUIPES" icon={<Users size={14}/>} />
                 <ArenaNavBtn active={tutorView === 'gazette'} onClick={() => setTutorView('gazette')} label="GAZETA INDUSTRIAL" icon={<Newspaper size={14}/>} />
              </div>
           </div>
        </header>

        {/* VIEWPORT OPERACIONAL */}
        <main className="relative z-10">
           <AnimatePresence mode="wait">
              {tutorView === 'dashboard' && (
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
                   <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
                </motion.div>
              )}

              {tutorView === 'decisions' && (
                <motion.div key="dec" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}}>
                   <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
                </motion.div>
              )}

              {tutorView === 'teams' && (
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
                         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 relative z-10">
                            <div className="space-y-1">
                               <span className="text-[8px] font-black text-slate-500 uppercase">Equity</span>
                               <span className="block text-sm font-mono font-bold">$ {t.equity.toLocaleString()}</span>
                            </div>
                            <div className="space-y-1">
                               <span className="text-[8px] font-black text-slate-500 uppercase">Rating</span>
                               <span className="block text-sm font-black text-orange-500">{t.kpis?.rating || 'AAA'}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </motion.div>
              )}

              {tutorView === 'gazette' && (
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
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
              {isAdmin ? 'Command' : 'Tutor'} <span className="text-orange-600">Center</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
           <div className="flex items-center gap-4">
              <div className={`w-3.5 h-3.5 rounded-full animate-pulse shadow-[0_0_15px] ${isAdmin ? 'bg-blue-500 shadow-blue-500' : 'bg-emerald-500 shadow-emerald-500'}`} />
              <div className="flex flex-col">
                 <span className="text-lg font-black text-white uppercase italic tracking-tight">{profile?.nickname || 'TRIAL_MASTER'}</span>
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
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">{champ.branch} Simulation Unit</p>
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

          {activeTab === 'system' && (
             <motion.div key="sys" initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <MetricCard label="Operadores Online" val="1.428" icon={<Users className="text-emerald-500"/>} trend="+12%" />
                <MetricCard label="Nodos Ativos" val={championships.length.toString()} icon={<Globe className="text-blue-500"/>} trend="Stable" />
                <MetricCard label="Receita SaaS" val="R$ 48.900" icon={<CreditCard className="text-amber-500"/>} trend="+5.4%" />
                <MetricCard label="Latência" val="14ms" icon={<Cpu className="text-indigo-500"/>} trend="Optimal" />
             </motion.div>
          )}

          {activeTab === 'uidesign' && (
            <motion.div key="cms" initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                  <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-4"><Palette className="text-orange-500" /> Branding Engine</h3>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Título do Hero (Home)</label>
                        <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-lg outline-none" />
                     </div>
                  </div>
                  <button className="w-full py-8 bg-orange-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:bg-white hover:text-orange-950 transition-all">
                     <Save size={24} /> Publicar Branding Node
                  </button>
               </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {users.map(u => (
                 <div key={u.id} className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                    <div className="flex justify-between items-start">
                       <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-emerald-500"><AtSign size={20}/></div>
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase text-slate-500">{u.role}</span>
                    </div>
                    <h4 className="text-xl font-black text-white uppercase italic">{u.nickname || 'Anônimo'}</h4>
                 </div>
               ))}
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div key="tpl" initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {CHAMPIONSHIP_TEMPLATES.map(tpl => (
                 <div key={tpl.id} className="bg-slate-900 border border-white/5 p-12 rounded-[4rem] flex flex-col justify-between min-h-[400px] group">
                    <h4 className="text-4xl font-black text-white uppercase italic tracking-tight group-hover:text-orange-500 transition-colors">{tpl.name}</h4>
                    <button className="text-[10px] font-black uppercase text-blue-400 hover:text-white tracking-[0.3em] transition-all flex items-center gap-3">Edit Blueprint <ArrowRight size={16}/></button>
                 </div>
               ))}
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

const ArenaNavBtn = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={onClick} 
    className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all italic active:scale-95 border-2 ${active ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.6)] scale-105 z-10' : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/5'}`}
  >
     {icon} {label}
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
