
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Trophy, 
  Settings, 
  User, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  Shield, 
  TrendingUp,
  FileText,
  BookOpen,
  ChevronRight,
  Wifi,
  Zap,
  PenTool
} from 'lucide-react';
import GlobalChat from './GlobalChat';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  activeView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onNavigate, onLogout, activeView }) => {
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
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-950 font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 transition-all duration-300 ease-in-out flex flex-col z-50`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold">E</span>
          </div>
          {isSidebarOpen && <span className="text-white font-black text-xl tracking-tight uppercase">EMPIRION</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.filter(item => !item.roles || item.roles.includes(userRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all whitespace-nowrap group relative ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`shrink-0 transition-transform ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>}
              {!isSidebarOpen && activeView === item.id && (
                <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-black uppercase rounded shadow-xl pointer-events-none">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-3 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all group"
          >
            <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-8 z-40 shrink-0 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
               <span className="text-[10px] font-black uppercase tracking-widest hover:text-blue-600 cursor-pointer" onClick={() => onNavigate('dashboard')}>Empirion</span>
               <ChevronRight size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{currentItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <LanguageSwitcher />
            
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">{userName}</span>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{userRole}</span>
              </div>
              <button className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200 hover:scale-105 transition-all">
                <User size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </div>

        {/* Global AI Chatbot */}
        <GlobalChat />
      </main>
    </div>
  );
};

export default Layout;
