
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Trophy, Settings, User, LogOut, 
  X, Menu, Shield, TrendingUp, FileText, BookOpen, 
  ChevronRight, PenTool, Globe, Server
} from 'lucide-react';
import GlobalChat from './GlobalChat';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  onLogout: () => void;
  activeView: string;
  onNavigate: (v: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout, activeView }) => {
  const { t } = useTranslation('common');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'championships', label: t('championships'), icon: Trophy },
    { id: 'business-planner', label: t('businessPlanner'), icon: PenTool },
    { id: 'reports', label: t('reports'), icon: FileText },
    { id: 'market', label: t('market'), icon: TrendingUp },
    { id: 'admin', label: t('admin'), icon: Shield, roles: ['admin', 'tutor'] },
    { id: 'guides', label: t('guides'), icon: BookOpen },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const currentItem = navItems.find(item => item.id === activeView) || navItems[0];

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-100 font-sans">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#0f172a] transition-all duration-300 ease-in-out flex flex-col z-50 border-r border-white/5`}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-white font-black italic">E</span>
          </div>
          {isSidebarOpen && <span className="text-white font-black text-xl tracking-tighter uppercase italic">EMPIRION</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.filter(item => !item.roles || item.roles.includes(userRole)).map((item) => (
            <Link
              key={item.id}
              to={`/app/${item.id}`}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-xl' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`shrink-0 transition-transform ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          {isSidebarOpen && (
            <div className="px-4 py-3 bg-slate-900/50 rounded-xl border border-white/5 space-y-2">
               <div className="flex items-center gap-2 text-emerald-500">
                  <Server size={10} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Node: prj_jZXZ6mdb</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[98%]"></div>
               </div>
            </div>
          )}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 h-24 flex items-center justify-between px-10 z-40 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operation Terminal</span>
               <ChevronRight size={14} className="text-slate-700" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">{currentItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-slate-900 rounded-full border border-white/5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Vercel Edge: 4ms</span>
            </div>
            <LanguageSwitcher light />
            <div className="flex items-center gap-5 border-l border-white/10 pl-10">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-xs font-black text-white uppercase tracking-tight">{userName}</span>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{userRole}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-2xl hover:scale-105 transition-all">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#020617] custom-scrollbar">
          {children}
        </div>
        <GlobalChat />
      </main>
    </div>
  );
};

export default Layout;
