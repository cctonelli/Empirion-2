
import React, { useState, useEffect } from 'react';
// Fix: Use any to bypass react-router-dom type resolution issues in this environment
import * as Router from 'react-router-dom';
const { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } = Router as any;
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
import TrailWizard from './components/TrailWizard';
import Auth from './components/Auth';
import { supabase, getUserProfile, isTestMode, provisionDemoEnvironment } from './services/supabase';
import { UserProfile } from './types';

const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkInitialSession = async () => {
      const isTrial = localStorage.getItem('is_trial_session') === 'true';
      const demoSession = localStorage.getItem('empirion_demo_session');
      
      if (isTestMode && demoSession) {
        const parsed = JSON.parse(demoSession);
        setSession(parsed);
        await fetchProfile(parsed.user.id);
        return;
      }
      
      // Fix: Casting auth to any to resolve property missing error in this environment
      const { data: { session: realSession } } = await (supabase.auth as any).getSession();
      setSession(realSession);

      if (realSession) {
        await fetchProfile(realSession.user.id);
      } else if (isTrial) {
        // Se for trial mas não logado, ainda sim buscamos um "perfil mock" de tutor
        await fetchProfile('trial-master-id');
      } else {
        setLoading(false);
      }
    };
    checkInitialSession();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const prof = await getUserProfile(uid);
      setProfile(prof);
      
      if (location.pathname === '/app' || location.pathname === '/app/') {
        if (prof?.role === 'admin' || prof?.role === 'tutor') {
           navigate('/app/admin');
        } else {
           navigate('/app/dashboard');
        }
      }
    } catch (err) { 
      console.error("Profile sync error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSelectTeam = (champId: string, teamId: string, isTrial: boolean = false) => {
    localStorage.setItem('active_team_id', teamId);
    localStorage.setItem('active_champ_id', champId);
    localStorage.setItem('is_trial_session', isTrial ? 'true' : 'false');
    navigate('/app/dashboard');
  };

  const isTrialSession = localStorage.getItem('is_trial_session') === 'true';

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
       <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
       <span className="font-black uppercase italic tracking-[0.4em]">Node Syncing...</span>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-0"><LandingPage onLogin={() => navigate('/auth')}/></div></>} />
      <Route path="/auth" element={<Auth onAuth={() => navigate('/app')} onBack={() => navigate('/')} />} />
      <Route path="/test/industrial" element={<><PublicHeader onLogin={() => navigate('/auth')}/><div className="pt-20"><TestTerminal /></div></>} />
      
      {/* NOVO FLUXO TRIAL: Abre diretamente no Command Center em modo Orquestração */}
      <Route path="/trial/new" element={<Navigate to="/app/admin?mode=new_trial" replace />} />

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
        (session || isTrialSession || isTestMode) ? (
          <Layout
            userName={profile?.nickname || profile?.name || "Trial Orchestrator"}
            userRole={profile?.role || 'tutor'}
            onLogout={() => { localStorage.clear(); navigate('/'); window.location.reload(); }}
            activeView={location.pathname.replace('/app/', '') || 'dashboard'}
            onNavigate={(view) => navigate(`/app/${view}`)}
          >
            <Routes>
              <Route path="/" element={<Navigate to={profile?.role === 'admin' || profile?.role === 'tutor' ? 'admin' : 'dashboard'} />} />
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
