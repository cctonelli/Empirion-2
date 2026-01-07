import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ArrowLeft, Monitor, Command, Users, Globe, CreditCard, Cpu, Gauge,
  X, Palette, Menu as MenuIcon, Save, AtSign, Phone, FileCode, UserPlus, UserMinus, Shield,
  Trophy, Settings, ShieldAlert, Sparkles, Landmark, ArrowRight, Activity
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
import { motion, AnimatePresence } from 'framer-motion';
import { APP_VERSION, MENU_STRUCTURE, CHAMPIONSHIP_TEMPLATES } from '../constants';

const AdminCommandCenter: React.FC<{ preTab?: string }> = ({ preTab = 'system' }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // CMS State
  const [heroTitle, setHeroTitle] = useState('Forje Seu Império');
  const [accentColor, setAccentColor] = useState('#f97316');
  const [menus, setMenus] = useState<MenuItemConfig[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const prof = await getUserProfile(session.user.id);
        setProfile(prof);
        if (prof?.role === 'tutor' && activeTab === 'system') setActiveTab('tournaments');
      }
      const { data } = await getChampionships();
      if (data) setChampionships(data);
      if (activeTab === 'users') {
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
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans max-w-[1600px] mx-auto p-6">
        <header className="flex items-center gap-6">
           <button onClick={() => setSelectedArena(null)} className="p-5 bg-white/5 text-slate-400 hover:text-white rounded-[1.5rem] border border-white/5 transition-all active:scale-95"><ArrowLeft size={28} /></button>
           <div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Control <span className="text-orange-500">Room</span></h1>
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mt-3 italic">Arena: {selectedArena.name}</p>
           </div>
        </header>
        <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
        <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 font-sans max-w-[1600px] mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-600 text-white rounded-[2rem] shadow-2xl"><Command size={40} /></div> 
            <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic">
              {isAdmin ? 'Command' : 'Tutor'} <span className="text-orange-600">Center</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
           <div className="flex items-center gap-4">
              <div className={`w-3.5 h-3.5 rounded-full animate-pulse shadow-[0_0_15px] ${isAdmin ? 'bg-blue-500 shadow-blue-500' : 'bg-emerald-500 shadow-emerald-500'}`} />
              <div className="flex flex-col">
                 <span className="text-lg font-black text-white uppercase italic tracking-tight">{profile?.nickname || 'ADMIN MASTER'}</span>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{isAdmin ? 'SYSTEM OWNER' : 'ARENA TUTOR'}</span>
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
                 <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-900 p-16 rounded-[5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-10 relative z-10">
                       <div className="p-10 bg-orange-600 text-white rounded-[3rem] shadow-2xl"><Plus size={64} /></div>
                       <div>
                          <h3 className="text-5xl font-black text-white uppercase italic tracking-tight leading-none">Implantar Arena</h3>
                          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mt-5 italic max-w-xl">Configure novos campeonatos e parametrize o cenário econômico inicial.</p>
                       </div>
                    </div>
                    <button onClick={() => setShowWizard(true)} className="px-20 py-8 bg-white text-slate-950 rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95 z-10 shrink-0">Novo Strategos Wizard</button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {championships.map((champ) => (
                      <div key={champ.id} className="bg-slate-900/50 p-12 rounded-[4rem] border border-white/5 shadow-2xl hover:border-orange-500/40 transition-all flex flex-col justify-between min-h-[420px]">
                         <div>
                            <div className="flex justify-between items-start mb-12">
                               <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${champ.is_trial ? 'bg-orange-600/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                 {champ.is_trial ? 'Trial Instance' : 'Live Arena'}
                               </span>
                               {isAdmin && <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-4 bg-white/5 rounded-2xl text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={24}/></button>}
                            </div>
                            <h5 className="text-4xl font-black text-white uppercase italic tracking-tight mb-6">{champ.name}</h5>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">{champ.branch} Cluster Node</p>
                         </div>
                         <button onClick={() => setSelectedArena(champ)} className="w-full py-6 mt-12 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-orange-600 transition-all flex items-center justify-center gap-4 shadow-2xl">
                            <Monitor size={20} /> Entrar na Control Room
                         </button>
                      </div>
                    ))}
                 </div>
              </motion.div>
            ) : (
              <motion.div key="wizard" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="min-h-[80vh]">
                <div className="flex justify-between items-center mb-8 px-4">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Strategos Orchestration Wizard</h2>
                  <button onClick={() => setShowWizard(false)} className="p-6 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all"><X size={20} /> Abortar Protocolo</button>
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
                        <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] text-white font-black text-lg outline-none" />
                     </div>
                  </div>
                  <button className="w-full py-8 bg-orange-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:bg-white hover:text-orange-950 transition-all">
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
                 <div key={tpl.id} className="bg-slate-900 border border-white/5 p-12 rounded-[4rem] flex flex-col justify-between min-h-[400px]">
                    <h4 className="text-4xl font-black text-white uppercase italic tracking-tight">{tpl.name}</h4>
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