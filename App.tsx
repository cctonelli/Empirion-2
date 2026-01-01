
import React, { useState, useEffect } from 'react';
// Added Link to react-router-dom imports
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
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
import PublicHeader from './components/PublicHeader';
import PublicRewards from './pages/PublicRewards';

const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) await fetchProfile(session.user.id);
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const prof = await getUserProfile(userId);
      setProfile(prof);
    } catch (error) {
      console.error("Profile Fetch Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-white text-[10px] font-black uppercase tracking-[0.4em] italic opacity-50">Empirion Protocol Initializing...</span>
        </div>
      </div>
    );
  }

  // Handle Authentication Overlay for Modal Style Login from Landing
  if (showAuthModal && !session) {
    return <Auth onAuth={() => setShowAuthModal(false)} onBack={() => setShowAuthModal(false)} />;
  }

  return (
    <>
      {/* Public Pages Viewport */}
      {!isAppRoute && <PublicHeader onLogin={() => setShowAuthModal(true)} />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage onLogin={() => setShowAuthModal(true)} />} />
        <Route path="/rewards" element={<PublicRewards />} />
        <Route path="/branches" element={<div className="pt-40 text-center uppercase font-black text-2xl">Branches Explorer (WIP)</div>} />
        <Route path="/solutions" element={<div className="pt-40 text-center uppercase font-black text-2xl">Solutions Portal (WIP)</div>} />
        
        {/* Protected App Routes */}
        <Route path="/app/*" element={
          session ? (
            <Layout
              userName={profile?.name || session.user.email}
              userRole={profile?.role || 'player'}
              onLogout={async () => { await supabase.auth.signOut(); }}
              activeView={location.pathname.replace('/app/', '') || 'dashboard'}
              onNavigate={(view) => { window.location.href = `/app/${view}`; }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<Dashboard branch="industrial" />} />
                <Route path="reports" element={<Reports branch="industrial" />} />
                <Route path="market" element={<MarketAnalysis />} />
                <Route path="admin" element={<AdminCommandCenter />} />
                <Route path="decisions" element={<DecisionForm round={1} branch="industrial" />} />
                <Route path="guides" element={profile?.role === 'player' ? <TeamGuide /> : <TutorGuide />} />
                <Route path="championships" element={<ChampionshipWizard onComplete={() => {}} />} />
                <Route path="business-planner" element={<BusinessPlanWizard />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
      </Routes>

      {/* Global Footer (Public Only) */}
      {!isAppRoute && (
        <footer className="bg-slate-950 pt-32 pb-16 px-8 border-t border-white/5">
           <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
                 <div className="col-span-2 space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-black text-xl italic">E</span>
                       </div>
                       <span className="text-2xl font-black tracking-tighter uppercase text-white italic">EMPIRION</span>
                    </div>
                    <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">A arquitetura definitiva de simulação empresarial. Onde o prestígio acadêmico encontra a inovação neural.</p>
                 </div>
                 <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Navigation</h5>
                    <div className="flex flex-col gap-4">
                       <Link to="/" className="text-xs font-black uppercase text-slate-500 hover:text-white">Home</Link>
                       <Link to="/branches" className="text-xs font-black uppercase text-slate-500 hover:text-white">Branches</Link>
                       <Link to="/rewards" className="text-xs font-black uppercase text-slate-500 hover:text-white">Empire Rewards</Link>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Powered By</h5>
                    <div className="flex flex-col gap-4 text-xs font-black uppercase text-slate-500">
                       <span>Gemini 3 Oracle</span>
                       <span>Bernard Fidelity</span>
                       <span>Supabase Realtime</span>
                    </div>
                 </div>
              </div>
              <div className="text-center pt-16 border-t border-white/5">
                 <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.8em] italic">© 2026 EMPIRION BI ARENA | SIAGRO-SISERV-SIMCO FIDELITY</p>
              </div>
           </div>
        </footer>
      )}
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
