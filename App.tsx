
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
import { Trophy, ArrowRight, Play, Settings as SettingsIcon, Plus, Globe, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isCreatingChampionship, setIsCreatingChampionship] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Empirion Syncing...</span>
    </div>
  );

  if (!session) return <Auth onAuth={() => {}} />;

  const user = {
    name: session.user.email?.split('@')[0] || 'Unknown Emperor',
    role: 'admin' // In a real app, fetch this from profile table
  };

  const renderContent = () => {
    if (isCreatingChampionship) {
      return <ChampionshipWizard onComplete={() => setIsCreatingChampionship(false)} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'championships':
        return <ChampionshipView 
                 onEnterChampionship={() => setActiveView('decisions')} 
                 onCreateNew={() => setIsCreatingChampionship(true)} 
               />;
      case 'decisions':
        return <DecisionForm />;
      case 'reports':
        return <Reports />;
      case 'market':
        return <MarketAnalysis />;
      case 'admin':
        return <AdminCommandCenter />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
            <SettingsIcon size={48} className="mb-4 opacity-20" />
            <p className="text-lg">Module "{activeView}" is under maintenance.</p>
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
      {renderContent()}
    </Layout>
  );
};

const ChampionshipView: React.FC<{ onEnterChampionship: () => void; onCreateNew: () => void }> = ({ onEnterChampionship, onCreateNew }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Campaigns</h1>
          <p className="text-slate-500 mt-2 font-medium">Command your team in high-stakes market battles.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="px-8 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] hover:bg-blue-700 transition-all flex items-center gap-3 shadow-2xl shadow-blue-200 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> New Championship
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {MOCK_CHAMPIONSHIPS.map((champ) => (
          <div key={champ.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col group hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500">
            <div className="h-48 bg-slate-900 relative overflow-hidden">
               <div className="absolute top-6 left-6 px-4 py-2 bg-white/95 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 z-10 shadow-lg border border-slate-100">
                 {champ.branch}
               </div>
               <div className="absolute top-6 right-6 z-10">
                 <Sparkles className="text-amber-400 fill-amber-400" size={20} />
               </div>
               <img 
                 src={`https://picsum.photos/seed/${champ.id}/1200/600`} 
                 className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-transform duration-1000 opacity-60" 
                 alt={champ.name} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
               <div className="absolute bottom-6 left-8">
                 <h3 className="text-2xl font-black text-white tracking-tight">{champ.name}</h3>
               </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <p className="text-slate-500 text-sm mb-8 flex-1 leading-relaxed font-medium">
                {champ.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                    <span className={`text-xs font-bold uppercase ${champ.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>{champ.status}</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Round</span>
                    <span className="text-xs font-bold text-slate-900">{champ.currentRound}/{champ.totalRounds}</span>
                 </div>
              </div>

              <button 
                onClick={onEnterChampionship}
                className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200"
              >
                {champ.status === 'active' ? 'Deployment Ready' : 'Lobby Access'}
                <Play size={18} className="group-hover:translate-x-1 transition-transform fill-current" />
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={onCreateNew}
          className="border-4 border-dashed border-slate-200 rounded-[3rem] p-12 flex flex-col items-center justify-center gap-6 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all group min-h-[400px]"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-all shadow-inner group-hover:scale-110 group-hover:rotate-6">
             <Plus size={40} />
          </div>
          <div className="text-center">
            <span className="block font-black text-xl text-slate-900 uppercase tracking-tighter">Forge Scenario</span>
            <p className="text-sm font-medium mt-1">Design a new battleground</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default App;
