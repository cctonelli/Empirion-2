
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DecisionForm from './components/DecisionForm';
import MarketAnalysis from './components/MarketAnalysis';
import Reports from './components/Reports';
import ChampionshipWizard from './components/ChampionshipWizard';
import AdminCommandCenter from './components/AdminCommandCenter';
import { MOCK_CHAMPIONSHIPS } from './constants';
// Add Globe to the imported icons from lucide-react
import { Trophy, ArrowRight, Play, Settings as SettingsIcon, Plus, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isCreatingChampionship, setIsCreatingChampionship] = useState(false);
  const [user] = useState({ name: 'Marcelo Empirion', role: 'admin' });

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Championships</h1>
          <p className="text-slate-500 mt-1">Join or manage your active business simulations.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
        >
          <Plus size={20} /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {MOCK_CHAMPIONSHIPS.map((champ) => (
          <div key={champ.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
            <div className="h-40 bg-slate-100 relative overflow-hidden">
               <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/95 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-slate-700 border border-slate-200 z-10 shadow-sm">
                 {champ.branch}
               </div>
               <img 
                 src={`https://picsum.photos/seed/${champ.id}/800/400`} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                 alt={champ.name} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-slate-900">{champ.name}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  champ.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {champ.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-8 flex-1 leading-relaxed">{champ.description}</p>
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><Trophy size={14} className="text-amber-500" /> Round {champ.currentRound}/{champ.totalRounds}</div>
                <div className="flex items-center gap-1.5"><Globe size={14} className="text-blue-500" /> {champ.scenarioType}</div>
              </div>

              <button 
                onClick={onEnterChampionship}
                className="w-full py-4 bg-blue-50 text-blue-600 font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-sm shadow-blue-50"
              >
                {champ.status === 'active' ? 'Enter Simulation' : 'View Lobby'}
                <Play size={18} className="group-hover:translate-x-1 transition-transform fill-current" />
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={onCreateNew}
          className="border-4 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
             <Plus size={32} />
          </div>
          <span className="font-bold text-lg">Create Scenario</span>
        </button>
      </div>
    </div>
  );
};

export default App;
