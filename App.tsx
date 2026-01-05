
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import PublicHeader from './components/PublicHeader';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import MarketAnalysis from './components/MarketAnalysis';
import OpalIntelligenceHub from './components/OpalIntelligenceHub';
import AdminCommandCenter from './components/AdminCommandCenter';
import ChampionshipsView from './components/ChampionshipsView';
import LandingPage from './components/LandingPage';
import ActivityDetail from './pages/ActivityDetail';
import OpenTournaments from './pages/OpenTournaments';
import SimulatorsPage from './pages/SimulatorsPage';
import BusinessPlanWizard from './components/BusinessPlanWizard';
import FeaturesPage from './pages/FeaturesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import PublicRewards from './pages/PublicRewards';
import TestTerminal from './pages/TestTerminal';
import Auth from './components/Auth';
import { supabase, getUserProfile, isTestMode } from './services/supabase';
import { UserProfile } from './types';

const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkInitialSession = async () => {
      const demoSession = localStorage.getItem('empirion_demo_session');
      if (isTestMode && demoSession) {
        const parsed = JSON.parse(demoSession);
        setSession(parsed);
        await fetchProfile(parsed.user.id);
        return;
      }
      const { data: { session: realSession } } = await supabase.auth.getSession();
      setSession(realSession);
      if (realSession) await fetchProfile(realSession.user.id);
      else setLoading(false);
    };
    checkInitialSession();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const prof = await getUserProfile(uid);
      setProfile(prof);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSelectTeam = (champId: string, teamId: string, isTrial: boolean = false) => {
    localStorage.setItem('active_team_id', teamId);
    localStorage.setItem('active_champ_id', champId);
    localStorage.setItem('is_trial_session', isTrial ? 'true' : 'false');
    navigate('/app/dashboard');
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white font-black uppercase italic tracking-[0.4em]">Node Syncing...</div>;

  return (
    <Routes>
      <Route path="/" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><LandingPage onLogin={() => navigate('/auth')}/></div></>} />
      <Route path="/auth" element={<Auth onAuth={() => navigate('/app/dashboard')} onBack={() => navigate('/')} />} />
      <Route path="/test/industrial" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><TestTerminal /></div></>} />
      
      {/* PUBLIC SOLUTIONS ROUTES - UNIFIED ACTIVITY ENGINE v3.0 */}
      <Route path="/activities/:slug" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><ActivityDetail /></div></>} />
      <Route path="/branches/:slug" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><ActivityDetail /></div></>} />
      
      <Route path="/solutions/simulators" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><SimulatorsPage /></div></>} />
      <Route path="/solutions/open-tournaments" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><OpenTournaments /></div></>} />
      <Route path="/solutions/business-plan" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><BusinessPlanWizard /></div></>} />
      <Route path="/features" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><FeaturesPage /></div></>} />
      <Route path="/blog" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><BlogPage /></div></>} />
      <Route path="/contact" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><ContactPage /></div></>} />
      <Route path="/rewards" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><PublicRewards /></div></>} />

      <Route path="/app/*" element={
        (session || isTestMode) ? (
          <Layout
            userName={profile?.name || "Strategos Player"}
            userRole={profile?.role || 'player'}
            onLogout={() => { localStorage.clear(); navigate('/'); window.location.reload(); }}
            activeView={location.pathname.replace('/app/', '') || 'dashboard'}
            onNavigate={(view) => navigate(`/app/${view}`)}
          >
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<Dashboard branch="industrial" />} />
              <Route path="championships" element={<ChampionshipsView onSelectTeam={handleSelectTeam} />} />
              <Route path="reports" element={<Reports branch="industrial" />} />
              <Route path="market" element={<MarketAnalysis />} />
              <Route path="intelligence" element={<OpalIntelligenceHub isPremium={true} onUpgrade={() => {}} />} />
              <Route path="admin" element={<AdminCommandCenter />} />
              <Route path="settings" element={<AdminCommandCenter preTab="tournaments" />} />
            </Routes>
          </Layout>
        ) : <Navigate to="/auth" replace />
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
