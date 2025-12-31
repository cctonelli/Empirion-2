import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DecisionForm from './components/DecisionForm';
import MarketAnalysis from './components/MarketAnalysis';
import Reports from './components/Reports';
import ChampionshipWizard from './components/ChampionshipWizard';
import AdminCommandCenter from './components/AdminCommandCenter';
import Auth from './components/Auth';
import { supabase } from './services/supabase';
import { MOCK_CHAMPIONSHIPS } from './constants';
import { Trophy, ArrowRight, Play, Settings as SettingsIcon, Plus, Globe, Sparkles, Loader2, Clock, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isCreatingChampionship, setIsCreatingChampionship] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChamp, setActiveChamp] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Reset state on logout
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
        <div className="w-24 h-24 border-4 border-brand-600 border-t-transparent rounded-full animate-spin absolute inset-0 shadow-2xl shadow-brand-100"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-xs font-black text-brand-900">EMP</span>
        </div>
      </div>
      <div className="mt-12 text-center">
         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 block mb-2">Initializing Architecture</span>
         <div className="flex gap-1 justify-center">
            <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-brand-500 rounded-full animate-bounce"></div>
         </div>
      </div>
    </div>
  );

  if (!session) return <Auth onAuth={() => {}} />;

  const user = {
    name: session.user.email?.split('@')[0] || 'Empirion User',
    role: session.user.app_metadata?.role || 'admin' // Default to admin for MVP if not set
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
                     <div className="w-14 h-14 bg-brand-950 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Clock size={28} className="animate-pulse" />
                     </div>
                     <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cycle Submission Deadline</h2>
                        <p className="text-3xl font-mono font-black text-brand-950">04:22:15</p>
                     </div>
                  </div>
                  <div className="flex flex-col md:items-end">
                     <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100 mb-2">Active Campaign</span>
                     <p className="text-xl font-extrabold text-slate-900 tracking-tight">{activeChamp?.name || 'Standard Cluster R4'}</p>
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
      console.error("Critical Module Error:", error);
      return (
        <div className="p-16 bg-white border border-red-100 rounded-[3rem] text-center shadow-2xl shadow-red-50 max-w-2xl mx-auto mt-20">
           <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle size={40} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Simulation Integrity Fault</h2>
           <p className="text-slate-500 text-lg mb-10 font-medium">A recursive rendering loop or null pointer was detected in the active segment.</p>
           <button 
             onClick={() => window.location.reload()} 
             className="px-12 py-5 bg-brand-950 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-brand-800 transition-all shadow-xl shadow-brand-200"
           >
             Hard Reset Simulation
           </button>
        </div>
      );
    }
  };

  return (
    <Layout 
      userName={user.name} 
      userRole={user.role} 
      activeView={activeView} 
      onNavigate={(view) => {
        setIsCreatingChampionship(false);
        setActiveView(view);
      }}
      onLogout={handleLogout}
    >
      <div className="max-w-[1400px] mx-auto pb-10">
        {renderContent()}
      </div>
    </Layout>
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
        <button 
          onClick={onCreateNew}
          className="px-10 py-5 bg-brand-600 text-white font-black text-[10px] uppercase tracking-widest rounded-[2rem] hover:bg-brand-700 hover:scale-105 transition-all flex items-center gap-4 shadow-2xl shadow-brand-200 group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform" /> New Cluster
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {MOCK_CHAMPIONSHIPS.map((champ) => (
          <div key={champ.id} className="premium-card rounded-[3.5rem] overflow-hidden flex flex-col group">
            <div className="h-60 bg-slate-900 relative overflow-hidden">
               <div className="absolute top-8 left-8 px-5 py-2.5 bg-white/95 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 z-10 shadow-2xl border border-slate-100">
                 {champ.branch}
               </div>
               <img 
                 src={`https://picsum.photos/seed/${champ.id}/1200/800`} 
                 className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-1000 opacity-60" 
                 alt={champ.name} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-90"></div>
               <div className="absolute bottom-8 left-10 right-10">
                 <h3 className="text-3xl font-black text-white tracking-tight uppercase leading-none truncate">{champ.name}</h3>
               </div>
            </div>
            <div className="p-10 flex-1 flex flex-col">
              <p className="text-slate-500 text-sm mb-10 flex-1 leading-relaxed font-medium">
                {champ.description}
              </p>
              
              <div className="grid grid-cols-2 gap-5 mb-10">
                 <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stage</span>
                    <span className={`text-xs font-black uppercase tracking-widest ${champ.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>{champ.status}</span>
                 </div>
                 <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cycle</span>
                    <span className="text-xs font-black text-slate-900 uppercase">{champ.currentRound} of {champ.totalRounds}</span>
                 </div>
              </div>

              <button 
                onClick={() => onEnterChampionship(champ)}
                className="w-full py-6 bg-brand-950 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2.5rem] hover:bg-brand-600 transition-all flex items-center justify-center gap-3 group shadow-xl shadow-brand-100"
              >
                {champ.status === 'active' ? 'RESUME DEPLOYMENT' : 'ACCESS TERMINAL'}
                <Play size={20} className="group-hover:translate-x-2 transition-transform fill-current" />
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={onCreateNew}
          className="border-4 border-dashed border-slate-200 rounded-[3.5rem] p-16 flex flex-col items-center justify-center gap-8 text-slate-300 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all group min-h-[550px]"
        >
          <div className="w-32 h-32 rounded-[3rem] bg-slate-50 flex items-center justify-center group-hover:bg-brand-100 transition-all shadow-inner group-hover:scale-110 group-hover:rotate-12 duration-500">
             <Plus size={56} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
          </div>
          <div className="text-center">
            <span className="block font-black text-3xl text-slate-900 uppercase tracking-tighter">Forge Arena</span>
            <p className="text-sm font-bold mt-2 uppercase tracking-widest opacity-40">Initialize Economic Sub-Sector</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default App;