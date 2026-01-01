
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import MarketAnalysis from './components/MarketAnalysis';
import OpalIntelligenceHub from './components/OpalIntelligenceHub';
import AdminCommandCenter from './components/AdminCommandCenter';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import { supabase, getUserProfile } from './services/supabase';
import { UserProfile } from './types';

/**
 * AppContent handles the session and profile state management within the router context.
 */
const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check for initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Handle authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const prof = await getUserProfile(uid);
      setProfile(prof);
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLogin={() => window.location.href = '/auth'} />} />
      <Route path="/auth" element={<Auth onAuth={() => window.location.href = '/app'} />} />
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
          <Navigate to="/" />
        )
      } />
    </Routes>
  );
};

/**
 * Main App component wrapped in BrowserRouter for navigation support.
 */
const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
