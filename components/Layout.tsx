
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
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* ERP COMMAND HEADER - COMPACTED v13 */}
      <header className="h-14 bg-slate-900 border-b border-white/5 px-6 flex items-center justify-between z-[1000] sticky top-0 shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center font-black italic shadow-lg group-hover:rotate-6 transition-transform border border-white/10 text-xs">E</div>
            <span className="font-black tracking-tighter uppercase italic text-xs group-hover:text-orange-500 transition-colors">Empirion</span>
          </Link>

          <nav className="flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  activeView === item.id 
                    ? 'bg-orange-600 text-white shadow-lg scale-105' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <item.icon size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-slate-950 border border-white/5 rounded-full">
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">{PROTOCOL_NODE}</span>
            </div>
            <div className="w-px h-2 bg-white/10" />
            <span className="text-[8px] font-mono text-orange-500/80 font-black uppercase">{APP_VERSION}</span>
          </div>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
             <button className="p-1.5 text-slate-500 hover:text-white transition-colors relative">
                <Bell size={16} />
                <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-orange-600 rounded-full" />
             </button>
             <div className="flex items-center gap-2 cursor-default group">
                <div className="text-right hidden sm:block">
                   <p className="text-[9px] font-black text-white uppercase leading-none group-hover:text-orange-500 transition-colors">{userName}</p>
                   <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest mt-1">NODE {userRole.toUpperCase()}</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-white/5 group-hover:border-orange-500/30 transition-all">
                   <User size={16} />
                </div>
             </div>
             <button 
               onClick={onLogout}
               className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors"
               title="Desligar Nodo"
             >
               <LogOut size={16} />
             </button>
          </div>
        </div>
      </header>

      {/* OPERATIONAL VIEWPORT - FULL SCREEN MODE */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {children}
        <GlobalChat />
      </main>
    </div>
  );
};

export default Layout;
