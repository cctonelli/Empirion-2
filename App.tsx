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
import { supabase } from './services/supabase';
import { MOCK_CHAMPIONSHIPS } from './constants';
import { Trophy, Play, Settings as SettingsIcon, Plus, AlertCircle, ShieldCheck, Zap, Globe, Users, BarChart3, ArrowRight, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isCreatingChampionship, setIsCreatingChampionship] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeChamp, setActiveChamp] = useState<any>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initSession();

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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-slate-200 rounded-full"></div>
        <div className="w-24 h-24 border-4 border-brand-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-xs font-black text-brand-900 font-sans">EMP</span>
        </div>
      </div>
      <div className="mt-8 text-center">
         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 block mb-2 font-sans">Synchronizing Systems</span>
      </div>
    </div>
  );

  // PUBLIC LANDING PAGE FOR NEW VISITORS
  if (!session) {
    if (showAuth) {
      return <Auth onAuth={() => setShowAuth(false)} onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowAuth(true)} />;
  }

  const user = {
    name: session.user.email?.split('@')[0] || 'Empirion User',
    role: session.user.app_metadata?.role || 'admin'
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
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 py-6 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                  <div className="flex items-center gap-5">
                     <ChampionshipTimer deadline={activeChamp?.deadline} />
                  </div>
                  <div className="flex flex-col md:items-end">
                     <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100 mb-2">Active Strategic Operation</span>
                     <p className="text-xl font-extrabold text-slate-900 tracking-tight">{activeChamp?.name || 'Standard Cluster'}</p>
                  </div>
               </div>
               <DecisionForm regionsCount={activeChamp?.regionsCount || 9} />
            </div>
          );
        case 'reports':
          return <Reports />;
        case 'market':
          return <MarketAnalysis />;
        case 'admin':
          return <AdminCommandCenter />;
        default:
          return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-slate-300">
              <SettingsIcon size={80} className="mb-6 opacity-10 animate-spin-slow" />
              <p className="text-lg font-extrabold uppercase tracking-[0.3em]">Module Synchronizing</p>
            </div>
          );
      }
    } catch (error) {
      console.error("View Rendering Error:", error);
      return (
        <div className="p-16 bg-white border border-red-100 rounded-[3rem] text-center shadow-2xl max-w-2xl mx-auto mt-20">
           <AlertCircle size={40} className="text-red-500 mx-auto mb-8" />
           <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase">Simulation Interface Error</h2>
           <p className="text-slate-500 mb-8 font-medium italic">A component failed to synchronize with the simulation core. This may be due to a data mismatch or an update conflict.</p>
           <button onClick={() => window.location.reload()} className="px-12 py-5 bg-slate-900 text-white font-black text-[10px] uppercase rounded-2xl transition-all hover:bg-red-600">Reset Interface</button>
        </div>
      );
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

const LandingPage: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 overflow-x-hidden">
      {/* Public Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
            <span className="text-white font-black text-xl">E</span>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">EMPIRION</span>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Solutions</a>
          </nav>
          <button 
            onClick={onLoginClick}
            className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:scale-105 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
          >
            Access Terminal <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
             <Zap size={14} className="fill-current" />
             <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Simulation Engine</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">
            Forge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Empire</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
            Empirion is the world's most advanced business intelligence simulator. Designed for elite teams, orchestrated by AI, and validated by real economic models.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
             <button 
              onClick={onLoginClick}
              className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 shadow-2xl shadow-slate-300 transition-all"
             >
               Start New Arena
             </button>
             <button className="px-12 py-6 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
               Watch Demo <Play size={16} className="fill-current" />
             </button>
          </div>
        </div>
        
        <div className="relative">
           <div className="absolute -inset-10 bg-blue-500/10 blur-[120px] rounded-full"></div>
           <div className="relative bg-slate-900 rounded-[4rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10 group overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                 </div>
                 <div className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase text-blue-400 border border-white/5">Real-time Hub</div>
              </div>
              <div className="space-y-6">
                 <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                       <BarChart3 size={24} className="text-blue-500 mb-2" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">EBITDA +24%</span>
                    </div>
                    <div className="h-32 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                       <Globe size={24} className="text-indigo-500 mb-2" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Reach</span>
                    </div>
                 </div>
                 <div className="p-6 bg-blue-600 rounded-3xl text-white">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest">Gemini Insight</span>
                       <ShieldCheck size={16} />
                    </div>
                    <p className="text-xs font-bold leading-relaxed">"Strategic reallocation of CapEx to the Tech-Alpha node suggested for Period 4 optimization."</p>
                 </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full"></div>
           </div>
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="bg-slate-50 py-24 border-y border-slate-100" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: ShieldCheck, title: "Multi-tenant Security", desc: "Enterprise-grade RLS ensures complete team data isolation and competitive integrity." },
              { icon: Zap, title: "Gemini AI Engine", desc: "Integrated reasoning provides real-time market forecasts and deep-dive financial analysis." },
              { icon: Users, title: "Collaborative Play", desc: "Teams of up to 5 members sync decisions in real-time with zero-latency PostgreSQL updates." }
            ].map((f, i) => (
              <div key={i} className="space-y-6 group">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200 border border-slate-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <f.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none"></div>
           <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                Ready to lead the <br /> <span className="text-blue-400">new economy?</span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                 <button 
                  onClick={onLoginClick}
                  className="px-12 py-6 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 shadow-2xl shadow-blue-900/40 transition-all"
                 >
                   Admin/Tutor Entrance
                 </button>
                 <button 
                  onClick={onLoginClick}
                  className="px-12 py-6 bg-white/10 text-white border border-white/20 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                 >
                   Team Access Portal
                 </button>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="font-black text-slate-900 text-sm tracking-tighter">EMPIRION BI PLATFORM</span>
           </div>
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">© 2025 EMPIRION SYSTEMS INC. ALL RIGHTS RESERVED.</p>
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