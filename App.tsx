import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import PublicHeader from './components/PublicHeader';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import MarketAnalysis from './components/MarketAnalysis';
import OpalIntelligenceHub from './components/OpalIntelligenceHub';
import AdminCommandCenter from './components/AdminCommandCenter';
import LandingPage from './components/LandingPage';
import ActivityDetail from './pages/ActivityDetail';
import OpenTournaments from './pages/OpenTournaments';
import SimulatorsPage from './pages/SimulatorsPage';
import BusinessPlanWizard from './components/BusinessPlanWizard';
import Auth from './components/Auth';
import { supabase, getUserProfile } from './services/supabase';
import { UserProfile } from './types';

const PublicLayout: React.FC<{ children: React.ReactNode; onLogin: () => void }> = ({ children, onLogin }) => (
  <>
    <PublicHeader onLogin={onLogin} />
    <div className="pt-20">
      {children}
    </div>
  </>
);

const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Initial Session Check
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    checkInitialSession();

    // 2. Realtime Auth Observer
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
        if (location.pathname.startsWith('/app')) navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const prof = await getUserProfile(uid);
      setProfile(prof);
    } catch (err) {
      console.error("Critical Profile Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Sincronizando Protocolo...</span>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<PublicLayout onLogin={() => navigate('/auth')}><LandingPage onLogin={() => navigate('/auth')} /></PublicLayout>} />
      <Route path="/auth" element={<Auth onAuth={() => navigate('/app/dashboard')} onBack={() => navigate('/')} />} />
      <Route path="/activities/:slug" element={<PublicLayout onLogin={() => navigate('/auth')}><ActivityDetail /></PublicLayout>} />
      <Route path="/solutions/open-tournaments" element={<PublicLayout onLogin={() => navigate('/auth')}><OpenTournaments /></PublicLayout>} />
      <Route path="/solutions/simulators" element={<PublicLayout onLogin={() => navigate('/auth')}><SimulatorsPage /></PublicLayout>} />
      <Route path="/solutions/business-plan" element={<PublicLayout onLogin={() => navigate('/auth')}><BusinessPlanWizard /></PublicLayout>} />

      <Route path="/app/*" element={
        session ? (
          <Layout
            userName={profile?.name || session.user.email}
            userRole={profile?.role || 'player'}
            onLogout={async () => { 
              await supabase.auth.signOut();
              navigate('/');
            }}
            activeView={location.pathname.replace('/app/', '') || 'dashboard'}
            onNavigate={(view) => navigate(`/app/${view}`)}
          >
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<Dashboard branch="industrial" />} />
              <Route path="reports" element={<Reports branch="industrial" />} />
              <Route path="market" element={<MarketAnalysis />} />
              <Route path="intelligence" element={
                <OpalIntelligenceHub 
                  isPremium={profile?.is_opal_premium || false} 
                  onUpgrade={() => alert("Redirecionando para o Gateway Stripe...")}
                  config={profile?.opal_config}
                />
              } />
              <Route path="admin" element={<AdminCommandCenter />} />
            </Routes>
          </Layout>
        ) : (
          <Navigate to="/auth" replace />
        )
      } />
    </Routes>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
