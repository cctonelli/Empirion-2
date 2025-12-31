import React, { useState, useEffect } from 'react';
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
import { Trophy, ArrowRight, Play, Settings as SettingsIcon, Plus, Globe, Sparkles, Loader2, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isCreatingChampionship, setIsCreatingChampionship] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChamp, setActiveChamp] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-slate-50 rounded-full"></div>
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0 shadow-xl shadow-blue-100"></div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-10 animate-subtle-pulse">Empirion Sync Engine</span>
    </div>
  );

  if (!session) return <Auth onAuth={() => {}} />;

  const user = {
    name: session.user.email?.split('@')[0] || 'Empirion User',
    role: 'admin'
  };

  const handleEnterChampionship = (champ: any) => {
    setActiveChamp(champ);
    setActiveView('decisions');
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
            <div className="space-y-8">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
                        <Clock size={24} />
                     </div>
                     <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Contagem Regressiva</h2>
                        <p className="text-xl font-mono font-black text-blue-600">04:22:15</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign</p>
                     <p className="text-lg font-black text-slate-900">{activeChamp?.name || 'Simulation Mode'}</p>
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
            <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
              <SettingsIcon size={64} className="mb-6 opacity-10 animate-spin-slow" />
              <p className="text-lg font-bold uppercase tracking-[0.2em]">Module Maintenance</p>
            </div>
          );
      }
    } catch (error) {
      console.error("View Error:", error);
      return (
        <div className="p-12 bg-red-50 border border-red-100 rounded-[3rem] text-center premium-shadow max-w-lg mx-auto mt-20">
           <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <SettingsIcon size={32} />
           </div>
           <h2 className="text-2xl font-black text-red-900 mb-2 uppercase tracking-tight">Deployment Error</h2>
           <p className="text-red-600 text-sm mb-8 font-medium">Ocorreu uma falha crítica na renderização do módulo.</p>
           <button 
             onClick={() => window.location.reload()} 
             className="px-10 py-4 bg-red-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-800 transition-all shadow-xl shadow-red-200"
           >
             Restart System Node
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
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {renderContent()}
      </div>
    </Layout>
  );
};

const ChampionshipView: React.FC<{ onEnterChampionship: (champ: any) => void; onCreateNew: () => void }> = ({ onEnterChampionship, onCreateNew }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Campaigns</h1>
          <p className="text-slate-500 mt-4 font-medium text-lg">Battle for market dominance in real-world scenarios.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="px-10 py-5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-[2rem] hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-4 shadow-2xl shadow-blue-200 group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform" /> New Championship
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {MOCK_CHAMPIONSHIPS.map((champ) => (
          <div key={champ.id} className="bg-white rounded-[3.5rem] border border-slate-100 premium-shadow overflow-hidden flex flex-col group hover:translate-y-[-10px] transition-all duration-700">
            <div className="h-56 bg-slate-900 relative overflow-hidden">
               <div className="absolute top-8 left-8 px-5 py-2.5 bg-white/95 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 z-10 shadow-2xl border border-slate-100">
                 {champ.branch}
               </div>
               <img 
                 src={`https://picsum.photos/seed/${champ.id}/1200/800`} 
                 className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-1000 opacity-70" 
                 alt={champ.name} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>
               <div className="absolute bottom-8 left-10">
                 <h3 className="text-3xl font-black text-white tracking-tight uppercase leading-none">{champ.name}</h3>
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
                    <span className="text-xs font-black text-slate-900">{champ.currentRound} OF {champ.totalRounds}</span>
                 </div>
              </div>

              <button 
                onClick={() => onEnterChampionship(champ)}
                className="w-full py-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2.5rem] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-slate-200"
              >
                {champ.status === 'active' ? 'ENTER SIMULATION' : 'VIEW LOBBY'}
                <Play size={20} className="group-hover:translate-x-2 transition-transform fill-current" />
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={onCreateNew}
          className="border-4 border-dashed border-slate-200 rounded-[3.5rem] p-16 flex flex-col items-center justify-center gap-8 text-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all group min-h-[500px]"
        >
          <div className="w-28 h-28 rounded-[2.5rem] bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-all shadow-inner group-hover:scale-110 group-hover:rotate-12 duration-500">
             <Plus size={48} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-center">
            <span className="block font-black text-2xl text-slate-900 uppercase tracking-tighter">Forge Arena</span>
            <p className="text-sm font-bold mt-2 uppercase tracking-widest opacity-40">Initialize New Economic Cluster</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default App;