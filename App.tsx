
import React, { useState, useEffect } from 'react';
import { supabase, getUserProfile } from './services/supabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import MarketAnalysis from './components/MarketAnalysis';
import AdminCommandCenter from './components/AdminCommandCenter';
import { TutorGuide, TeamGuide } from './components/InstructionGuides';
import Auth from './components/Auth';
import ChampionshipWizard from './components/ChampionshipWizard';
import DecisionForm from './components/DecisionForm';
import LandingPage from './components/LandingPage';
import BusinessPlanWizard from './components/BusinessPlanWizard';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'landing' | 'auth' | 'app'>('landing');
  const [loading, setLoading] = useState(true);
  const [currentBranch, setCurrentBranch] = useState<any>('industrial');

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
        setViewMode('app');
      } else {
        setLoading(false);
        setViewMode('landing');
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        setViewMode('app');
      } else {
        setProfile(null);
        setLoading(false);
        if (viewMode === 'app') setViewMode('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const prof = await getUserProfile(userId);
      setProfile(prof);
    } catch (error) {
      console.error("Empirion Profile Fetch Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setViewMode('landing');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Empirion Kernel v5.5 Initializing...</span>
        </div>
      </div>
    );
  }

  // Public views logic
  if (!session) {
    if (viewMode === 'landing') {
      return <LandingPage onLogin={() => setViewMode('auth')} />;
    }
    return <Auth onAuth={() => setViewMode('app')} onBack={() => setViewMode('landing')} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard branch={currentBranch} />;
      case 'reports': return <Reports branch={currentBranch} />;
      case 'market': return <MarketAnalysis />;
      case 'admin': return <AdminCommandCenter />;
      case 'decisions': return <DecisionForm round={1} branch={currentBranch} />; 
      case 'guides': return profile?.role === 'player' ? <TeamGuide /> : <TutorGuide />;
      case 'championships': return <ChampionshipWizard onComplete={() => setActiveView('dashboard')} />;
      case 'business-planner': return <BusinessPlanWizard />;
      default: return <Dashboard branch={currentBranch} />;
    }
  };

  return (
    <Layout
      userName={profile?.name || session.user.email}
      userRole={profile?.role || 'player'}
      activeView={activeView}
      onNavigate={setActiveView}
      onLogout={handleLogout}
    >
      <div className="min-h-full flex flex-col">
        <div className="flex-1">
          {renderContent()}
        </div>
        
        <footer className="py-24 px-6 text-center border-t border-slate-100 mt-20">
           <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">E</span>
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">EMPIRION</span>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                © 2025 EMPIRION SYSTEMS INC. | v5.5.0-GOLD (SIAGRO/SIND FIDELITY)
              </p>
              <div className="flex gap-4 text-[8px] font-black uppercase text-slate-300 tracking-widest">
                <span>Agribusiness Yield Engine</span>
                <span>•</span>
                <span>Perishability Simulation</span>
                <span>•</span>
                <span>Climate Intelligence</span>
              </div>
           </div>
        </footer>
      </div>
    </Layout>
  );
};

export default App;
