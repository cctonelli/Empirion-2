
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Trophy, Settings, User, LogOut, 
  X, Menu, Shield, TrendingUp, FileText, BookOpen, 
  ChevronRight, PenTool, Globe, Server, Workflow
} from 'lucide-react';
import GlobalChat from './GlobalChat';
import LanguageSwitcher from './LanguageSwitcher';
import { APP_VERSION, PROTOCOL_NODE } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  onLogout: () => void;
  activeView: string;
  onNavigate: (v: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout, activeView, onNavigate }) => {
  const { t } = useTranslation('common');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'championships', label: t('championships'), icon: Trophy },
    { id: 'intelligence', label: 'Intelligence Hub', icon: Workflow }, 
    { id: 'business-planner', label: t('businessPlanner'), icon: PenTool },
    { id: 'reports', label: t('reports'), icon: FileText },
    { id: 'market', label: t('market'), icon: TrendingUp },
    { id: 'admin', label: t('admin'), icon: Shield, roles: ['admin', 'tutor'] },
    { id: 'guides', label: t('guides'), icon: BookOpen },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Command Module */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } bg-slate-900 border-r border-white/5 transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic shadow-lg shadow-blue-500/20">E</div>
              <span className="font-black tracking-tighter uppercase italic text-sm">Empirion</span>
            </Link>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeView === item.id ? 'text-white' : 'group-hover:text-blue-400'} />
              {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shadow-inner">
              <User size={20} />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-white uppercase truncate">{userName}</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{userRole}</span>
              </div>
            )}
          </div>
          
          {isSidebarOpen && (
            <div className="px-2 pt-2 pb-1 border-t border-white/5">
               <LanguageSwitcher light />
               <div className="mt-4 opacity-30 text-center">
                  <p className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-tighter">{APP_VERSION}</p>
                  <p className="text-[6px] font-mono text-slate-500 uppercase tracking-widest mt-1">{PROTOCOL_NODE}</p>
               </div>
            </div>
          )}

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all group"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Logout System</span>}
          </button>
        </div>
      </aside>

      {/* Main Strategic Display Area */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#020617]">
        <div className="p-10 max-w-[1600px] mx-auto">
          {children}
        </div>
        <GlobalChat />
      </main>
    </div>
  );
};

export default Layout;
