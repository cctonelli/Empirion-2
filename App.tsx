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

// Main App component with navigation logic and session management
const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial authentication session check
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    // Real-time authentication state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch role-based profile from the 'users' table
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
  };

  // Loading screen for application initialization
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Empirion Kernel Initializing...</span>
        </div>
      </div>
    );
  }

  // Redirect to Auth screen if no session is active
  if (!session) {
    return <Auth onAuth={() => {}} />;
  }

  // Component router based on activeView state
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'reports': return <Reports />;
      case 'market': return <MarketAnalysis />;
      case 'admin': return <AdminCommandCenter />;
      case 'guides': return profile?.role === 'player' ? <TeamGuide /> : <TutorGuide />;
      case 'championships': return <ChampionshipWizard onComplete={() => setActiveView('dashboard')} />;
      default: return <Dashboard />;
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
        
        {/* Global Application Footer with build versioning */}
        <footer className="py-24 px-6 text-center border-t border-slate-100 mt-20">
           <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">E</span>
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">EMPIRION</span>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">© 2025 EMPIRION SYSTEMS INC. | v4.9.0-GOLD-BETA</p>
           </div>
        </footer>
      </div>
    </Layout>
  );
};

export default App;