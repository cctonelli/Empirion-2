
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
import GenericSolutionPage from './pages/GenericSolutionPage';
import FeaturesPage from './pages/FeaturesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import PublicRewards from './pages/PublicRewards';
import TestTerminal from './pages/TestTerminal';
import Auth from './components/Auth';
import { supabase, getUserProfile, isTestMode } from './services/supabase';
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
    const checkInitialSession = async () => {
      // Prioridade para sessão demo se estivermos em modo teste
      const demoSession = localStorage.getItem('empirion_demo_session');
      if (isTestMode && demoSession) {
        const parsed = JSON.parse(demoSession);
        setSession(parsed);
        await fetchProfile(parsed.user.id);
        return;
      }

      const { data: { session: realSession } } = await supabase.auth.getSession();
      setSession(realSession);
      if (realSession) {
        await fetchProfile(realSession.user.id);
      } else {
        setLoading(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isTestMode && localStorage.getItem('empirion_demo_session')) return;
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
      console.error("Profile Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('empirion_demo_session');
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    navigate('/');
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Sincronizando Nodo...</span>
      </div>
    </div>
  );

  const authProps = { onLogin: () => navigate('/auth') };

  return (
    <Routes>
      <Route path="/" element={<PublicLayout {...authProps}><LandingPage onLogin={() => navigate('/auth')} /></PublicLayout>} />
      <Route path="/auth" element={<Auth onAuth={() => navigate('/app/dashboard')} onBack={() => navigate('/')} />} />
      <Route path="/features" element={<PublicLayout {...authProps}><FeaturesPage /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout {...authProps}><BlogPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout {...authProps}><ContactPage /></PublicLayout>} />
      <Route path="/rewards" element={<PublicLayout {...authProps}><PublicRewards /></PublicLayout>} />
      <Route path="/test/industrial" element={<PublicLayout {...authProps}><TestTerminal /></PublicLayout>} />
      <Route path="/activities/:slug" element={<PublicLayout {...authProps}><ActivityDetail /></PublicLayout>} />
      <Route path="/solutions/open-tournaments" element={<PublicLayout {...authProps}><OpenTournaments /></PublicLayout>} />
      <Route path="/solutions/simulators" element={<PublicLayout {...authProps}><SimulatorsPage /></PublicLayout>} />
      <Route path="/solutions/university" element={<PublicLayout {...authProps}><GenericSolutionPage type="university" /></PublicLayout>} />
      <Route path="/solutions/corporate" element={<PublicLayout {...authProps}><GenericSolutionPage type="corporate" /></PublicLayout>} />
      <Route path="/solutions/individual" element={<PublicLayout {...authProps}><GenericSolutionPage type="individual" /></PublicLayout>} />
      <Route path="/solutions/business-plan" element={<PublicLayout {...authProps}><BusinessPlanWizard /></PublicLayout>} />

      <Route path="/app/*" element={
        (session || isTestMode) ? (
          <Layout
            userName={profile?.name || "Estrategista Alpha"}
            userRole={profile?.role || 'player'}
            onLogout={handleLogout}
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
                  isPremium={true} 
                  onUpgrade={() => {}}
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
