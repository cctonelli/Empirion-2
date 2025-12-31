
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DecisionForm from './components/DecisionForm';
import MarketAnalysis from './components/MarketAnalysis';
import { Championship } from './types';
import { MOCK_CHAMPIONSHIPS } from './constants';
import { Trophy, ArrowRight, Play, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [user] = useState({ name: 'Marcelo Empirion', role: 'admin' });

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'championships':
        return <ChampionshipView onEnterChampionship={() => setActiveView('decisions')} />;
      case 'decisions':
        return <DecisionForm />;
      case 'market':
        return <MarketAnalysis />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <SettingsIcon size={48} className="mb-4 animate-spin-slow" />
            <p className="text-lg">Module "{activeView}" coming soon in MVP v2.0</p>
          </div>
        );
    }
  };

  return (
    <Layout 
      userName={user.name} 
      userRole={user.role} 
      activeView={activeView} 
      onNavigate={setActiveView}
    >
      {renderContent()}
    </Layout>
  );
};

const ChampionshipView: React.FC<{ onEnterChampionship: () => void }> = ({ onEnterChampionship }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Championships</h1>
          <p className="text-slate-500 mt-1">Join or manage your active business simulations.</p>
        </div>
        <button className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2">
          Create New <ArrowRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_CHAMPIONSHIPS.map((champ) => (
          <div key={champ.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="h-32 bg-slate-100 relative">
               <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600 border border-slate-200">
                 {champ.branch}
               </div>
               <img 
                 src={`https://picsum.photos/seed/${champ.id}/600/300`} 
                 className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                 alt={champ.name} 
               />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-900">{champ.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  champ.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {champ.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">{champ.description}</p>
              
              <div className="flex items-center justify-between mb-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1"><Trophy size={14} /> Round {champ.currentRound}/{champ.totalRounds}</div>
                <div>{champ.scenarioType.toUpperCase()}</div>
              </div>

              <button 
                onClick={onEnterChampionship}
                className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                {champ.status === 'active' ? 'Enter Simulation' : 'View Setup'}
                <Play size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
