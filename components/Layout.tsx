
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Trophy, Settings, User, LogOut, 
  Shield, TrendingUp, FileText, BookOpen, 
  PenTool, Workflow, Bell, Terminal, Cpu
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

  const navItems = [
    { id: 'dashboard', label: 'Cockpit', icon: LayoutDashboard },
    { id: 'championships', label: 'Arenas', icon: Trophy },
    { id: 'intelligence', label: 'Opal Hub', icon: Workflow }, 
    { id: 'reports', label: 'Audit', icon: FileText },
    { id: 'admin', label: 'Command', icon: Shield, roles: ['admin', 'tutor'] },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-orange-500/30">
      {/* ERP COMMAND HEADER */}
      <header className="h-16 bg-slate-900 border-b border-white/5 px-6 flex items-center justify-between z-[1000] sticky top-0 shadow-2xl">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-black italic shadow-lg group-hover:rotate-6 transition-transform border border-white/10">E</div>
            <span className="font-black tracking-tighter uppercase italic text-sm group-hover:text-orange-500 transition-colors">Empirion</span>
          </Link>

          <nav className="flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all ${
                  activeView === item.id 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-slate-950 border border-white/5 rounded-full">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">{PROTOCOL_NODE}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[9px] font-mono text-orange-500 font-black">{APP_VERSION}</span>
          </div>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
             <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                <Bell size={18} />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
             </button>
             <div className="flex items-center gap-3 cursor-default">
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-black text-white uppercase leading-none">{userName}</p>
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{userRole}</p>
                </div>
                <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-white/5">
                   <User size={18} />
                </div>
             </div>
             <button 
               onClick={onLogout}
               className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
               title="Desligar Nodo"
             >
               <LogOut size={18} />
             </button>
          </div>
        </div>
      </header>

      {/* OPERATIONAL VIEWPORT */}
      <main className="flex-1 relative overflow-x-hidden">
        {children}
        <GlobalChat />
      </main>
    </div>
  );
};

export default Layout;
