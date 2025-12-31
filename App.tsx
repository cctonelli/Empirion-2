import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DecisionForm from './components/DecisionForm';
import MarketAnalysis from './components/MarketAnalysis';
import Reports from './components/Reports';
import ChampionshipWizard from './components/ChampionshipWizard';
import AdminCommandCenter from './components/AdminCommandCenter';
import Auth from './components/Auth';
import ChampionshipTimer from './components/ChampionshipTimer';
import CommunityView from './components/CommunityView';
import TutorArenaControl from './components/TutorArenaControl';
import { TutorGuide, TeamGuide } from './components/InstructionGuides';
import { supabase, getPublicChampionships, subscribeToChampionship, checkSupabaseConnection } from './services/supabase';
import { MOCK_CHAMPIONSHIPS } from './constants';
import { Trophy, Play, Settings as SettingsIcon, Plus, AlertCircle, Shield, Zap, Globe, Users, BarChart3, ArrowRight, ChevronRight, Star, Cpu, WifiOff, RefreshCw, User, Mail, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isCreatingChampionship, setIsCreatingChampionship] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeChamp, setActiveChamp] = useState<any>(null);
  const [publicChampionships, setPublicChampionships] = useState<any[]>([]);
  const [isCommunityMode, setIsCommunityMode] = useState(false);

  const initializeApp = async () => {
    setLoading(true);
    setConnectionError(null);
    try {
      const health = await checkSupabaseConnection();
      if (!health.online) {
        setConnectionError(health);
        setLoading(false);
        return;
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      const { data } = await getPublicChampionships();
      setPublicChampionships(data || []);

    } catch (err: any) {
      console.error("Initialization Error:", err);
      setConnectionError({ online: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        setShowAuth(false);
      } else {
        setActiveView('dashboard');
        setActiveChamp(null);
        setIsCreatingChampionship(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (activeChamp?.id) {
      const subscription = subscribeToChampionship(activeChamp.id, (payload) => {
        const updated = payload.new;
        setActiveChamp(prev => ({ ...prev, ...updated }));
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeChamp?.id]);

  const handleLogout = async () => {
    setLoading(true);
    try { 
      await supabase.auth.signOut(); 
    } catch (err) { 
      console.error("Sign out error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEnterChampionship = (champ: any) => {
    setActiveChamp(champ);
    setActiveView('decisions');
  };

  const enterAsObserver = (champ: any) => {
    setActiveChamp(champ);
    setIsCommunityMode(true);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-slate-200 rounded-full"></div>
        <div className="w-24 h-24 border-4 border-brand-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-xs font-black text-brand-900 font-sans tracking-widest">EMP</span>
        </div>
      </div>
      <p className="mt-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] animate-pulse">Initializing Neural Link...</p>
    </div>
  );

  if (connectionError) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-red-100 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-red-100">
           <WifiOff size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Servidor Inacessível</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {connectionError.isDnsError 
              ? "Não foi possível resolver o endereço do servidor. Se o projeto estiver pausado no painel do Supabase, clique em 'Restore Project' para reativá-lo."
              : `Erro de Conexão: ${connectionError.error}`}
          </p>
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Host de Destino</p>
           <code className="text-[10px] font-mono font-bold text-red-600 break-all">gkmjlejeqndfdvxxvuxa.supabase.co</code>
        </div>
        <button 
          onClick={initializeApp}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
        >
          <RefreshCw size={18} /> Tentar Reconectar
        </button>
        <p className="text-[10px] text-slate-400 font-bold uppercase underline">
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener">Verificar Painel Supabase</a>
        </p>
      </div>
    </div>
  );

  if (isCommunityMode && activeChamp) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <CommunityView championship={activeChamp} onBack={() => setIsCommunityMode(false)} />
      </div>
    );
  }

  if (!session) {
    if (showAuth) {
      return <Auth onAuth={() => setShowAuth(false)} onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowAuth(true)} publicArenas={publicChampionships} onEnterObserver={enterAsObserver} />;
  }

  const user = {
    name: session.user.email?.split('@')[0] || 'Empirion User',
    role: session.user.app_metadata?.role || 'admin',
    email: session.user.email
  };

  const renderContent = () => {
    try {
      if (isCreatingChampionship) {
        return <ChampionshipWizard onComplete={() => setIsCreatingChampionship(false)} />;
      }

      switch (activeView) {
        case 'dashboard':
          return <Dashboard />;
        case 'championships':
          return <ChampionshipView 
                   onEnterChampionship={handleEnterChampionship} 
                   onCreateNew={() => setIsCreatingChampionship(true)} 
                 />;
        case 'decisions':
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-8 py-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                     <Cpu size={120} className="text-blue-400" />
                  </div>
                  <div className="flex items-center gap-5 relative z-10">
                     <ChampionshipTimer deadline={activeChamp?.deadline} />
                     <div className="hidden lg:flex flex-col">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Operation Mode</span>
                        <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                           <Zap size={12} className="text-amber-400 fill-current" /> Live War Room
                        </span>
                     </div>
                  </div>
                  <div className="flex flex-col md:items-end relative z-10">
                     <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-2">Active Strategic Deployment</span>
                     <p className="text-xl font-extrabold text-white tracking-tight uppercase">{activeChamp?.name || 'Standard Cluster'}</p>
                  </div>
               </div>
               <DecisionForm 
                  regionsCount={activeChamp?.config?.regionsCount || 9} 
                  teamId={activeChamp?.id} 
                  champId={activeChamp?.id}
                  round={activeChamp?.currentRound || 1}
               />
            </div>
          );
        case 'admin':
          return user.role === 'admin' || user.role === 'tutor' ? (
            activeChamp ? (
              <TutorArenaControl 
                championship={activeChamp} 
                onUpdate={(upd) => setActiveChamp({...activeChamp, ...upd})} 
              />
            ) : <AdminCommandCenter />
          ) : <Dashboard />;
        case 'reports':
          return <Reports />;
        case 'market':
          return <MarketAnalysis />;
        case 'guides':
          return user.role === 'admin' || user.role === 'tutor' ? <TutorGuide /> : <TeamGuide />;
        case 'settings':
          return <SettingsView user={user} />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error("View Rendering Error:", error);
      return <div className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest">Initialization Error</div>;
    }
  };

  return (
    <Layout userName={user.name} userRole={user.role} activeView={activeView} onNavigate={setActiveView} onLogout={handleLogout}>
      <div className="max-w-[1400px] mx-auto pb-10">
        {renderContent()}
      </div>
    </Layout>
  );
};

const SettingsView: React.FC<{ user: any }> = ({ user }) => (
  <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
    <div className="border-b border-slate-200 pb-6">
      <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Terminal Settings</h1>
      <p className="text-slate-500 font-medium">Configure your profile and system preferences.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                   <User size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Profile Identity</h3>
             </div>
             
             <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Display Name</label>
                   <input type="text" defaultValue={user.name} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">System Email</label>
                   <div className="flex items-center gap-3 p-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500">
                      <Mail size={18} />
                      <span className="font-bold">{user.email}</span>
                   </div>
                </div>
             </div>
             
             <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">Update Profile</button>
          </section>

          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                   <SettingsIcon size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security Access</h3>
             </div>
             <p className="text-sm text-slate-500 font-medium">Manage your cryptographic keys and session tokens.</p>
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Shield className="text-emerald-600" size={20} />
                   <span className="text-sm font-bold">Two-Factor Authentication</span>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer p-1">
                   <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
             </div>
          </section>
       </div>

       <div className="space-y-8">
          <div className="bg-brand-950 p-8 rounded-[2.5rem] text-white space-y-6">
             <Shield className="text-blue-400" size={40} />
             <h4 className="text-lg font-black uppercase tracking-tight leading-tight">System Authority</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                   <span className="text-slate-400 font-bold">Role</span>
                   <span className="font-black text-blue-400 uppercase">{user.role}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <span className="text-slate-400 font-bold">Level</span>
                   <span className="font-black text-amber-400">Master Strategist</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
);

const LandingPage: React.FC<{ onLoginClick: () => void; publicArenas: any[]; onEnterObserver: (c: any) => void }> = ({ onLoginClick, publicArenas, onEnterObserver }) => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
              <span className="text-white font-black text-xl">E</span>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">EMPIRION</span>
          </div>
          
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8 mr-8">
               <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Features</a>
               <a href="#arenas" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Arenas</a>
               <a href="#about" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Vision</a>
            </nav>
            <button 
              onClick={onLoginClick}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:scale-105 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
            >
              Access Terminal <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-48 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
             <Zap size={14} className="fill-current" />
             <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Simulation Engine</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">
            Forge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Empire</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
            Empirion is the world's most advanced business intelligence simulator. Designed for elite teams, orchestrated by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
             <button onClick={onLoginClick} className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all">Start New Arena</button>
             <a href="#arenas" className="px-12 py-6 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">Explore Public Arenas</a>
          </div>
        </div>
        
        <div className="relative">
           <div className="absolute -inset-10 bg-blue-500/10 blur-[120px] rounded-full"></div>
           <div className="relative bg-slate-900 rounded-[4rem] p-10 shadow-2xl border border-white/10 group overflow-hidden h-[400px] flex items-center justify-center">
              <BarChart3 size={200} className="text-blue-500 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <p className="text-4xl font-black text-white tracking-tighter text-center uppercase">Strategic <br/>Intelligence</p>
              </div>
           </div>
        </div>
      </section>

      <section id="arenas" className="bg-slate-50 py-32 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Public Arenas</h2>
              <p className="text-slate-500 font-medium mt-2">Enter as an Active Observer and influence the community score.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Fixed: Use publicArenas prop instead of non-existent publicChampionships */}
            {publicArenas.length === 0 ? (
              <div className="lg:col-span-3 py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
                 <span className="text-[10px] font-black uppercase text-slate-400">No public arenas available right now.</span>
              </div>
            ) : (
              /* Fixed: Use publicArenas prop instead of non-existent publicChampionships */
              publicArenas.map((champ) => (
                <div key={champ.id} className="premium-card p-10 rounded-[3rem] space-y-8 flex flex-col">
                  <div className="flex justify-between items-start">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">Round {champ.currentRound}</span>
                    <Globe size={24} className="text-slate-200" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{champ.name}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-2 line-clamp-2">{champ.description}</p>
                  </div>
                  <button 
                    onClick={() => onEnterObserver(champ)}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    Enter as Observer <Users size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="py-24 px-6 text-center border-t border-slate-100 mt-20">
         <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">E</span>
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">EMPIRION</span>
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">© 2025 EMPIRION SYSTEMS INC.</p>
         </div>
      </footer>
    </div>
  );
};

const ChampionshipView: React.FC<{ onEnterChampionship: (champ: any) => void; onCreateNew: () => void }> = ({ onEnterChampionship, onCreateNew }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Campaigns</h1>
          <p className="text-slate-500 mt-4 font-medium text-lg">Orchestrate high-stakes operations across global markets.</p>
        </div>
        <button onClick={onCreateNew} className="px-10 py-5 bg-brand-600 text-white font-black text-[10px] uppercase tracking-widest rounded-[2rem] hover:bg-brand-700 transition-all flex items-center gap-4 shadow-2xl shadow-brand-200 group">
          <Plus size={22} className="group-hover:rotate-90 transition-transform" /> New Arena
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {MOCK_CHAMPIONSHIPS.map((champ) => (
          <div key={champ.id} className="premium-card rounded-[3.5rem] overflow-hidden flex flex-col group">
            <div className="h-60 bg-slate-900 relative overflow-hidden">
               <div className="absolute top-8 left-8 px-5 py-2.5 bg-white/95 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 z-10 shadow-2xl">
                 {champ.branch}
               </div>
               <img src={`https://picsum.photos/seed/${champ.id}/1200/800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60" alt={champ.name} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-90"></div>
               <div className="absolute bottom-8 left-10 right-10">
                 <h3 className="text-3xl font-black text-white tracking-tight uppercase leading-none truncate">{champ.name}</h3>
               </div>
            </div>
            <div className="p-10 flex-1 flex flex-col">
              <p className="text-slate-500 text-sm mb-10 flex-1 leading-relaxed font-medium">{champ.description}</p>
              <div className="grid grid-cols-2 gap-5 mb-10">
                 <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-2">Stage</span>
                    <span className={`text-xs font-black uppercase ${champ.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>{champ.status}</span>
                 </div>
                 <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-2">Cycle</span>
                    <span className="text-xs font-black text-slate-900 uppercase">{champ.currentRound} / {champ.totalRounds}</span>
                 </div>
              </div>
              <button onClick={() => onEnterChampionship(champ)} className="w-full py-6 bg-brand-950 text-white font-black text-[10px] uppercase rounded-[2.5rem] hover:bg-brand-600 transition-all flex items-center justify-center gap-3">
                {champ.status === 'active' ? 'RESUME DEPLOYMENT' : 'ACCESS TERMINAL'} <Play size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;