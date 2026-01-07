
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Trophy, Settings, User, LogOut, 
  Shield, TrendingUp, FileText, BookOpen, 
  PenTool, Workflow, Bell, Terminal, Cpu, Zap
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
    <div className="h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* ELITE ERP HEADER - h-12 v13.0 */}
      <header className="h-12 bg-slate-900 border-b border-white/5 px-6 flex items-center justify-between z-[1000] shadow-2xl shrink-0">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center font-black italic shadow-lg group-hover:rotate-6 transition-transform border border-white/10 text-[10px]">E</div>
            <span className="font-black tracking-tighter uppercase italic text-[10px] group-hover:text-orange-500 transition-colors">Empirion</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeView === item.id 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <item.icon size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-950 border border-white/5 rounded-lg">
             <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[7px] font-mono text-slate-500 uppercase tracking-tighter">{PROTOCOL_NODE}</span>
             <div className="w-px h-2 bg-white/10 mx-1" />
             <span className="text-[7px] font-mono text-orange-500 font-black uppercase">{APP_VERSION}</span>
          </div>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-6">
             <button className="text-slate-500 hover:text-white transition-colors relative">
                <Bell size={14} />
                <div className="absolute -top-1 -right-1 w-1 h-1 bg-orange-600 rounded-full" />
             </button>
             <div className="flex items-center gap-2 cursor-default group">
                <div className="text-right hidden sm:block">
                   <p className="text-[8px] font-black text-white uppercase leading-none group-hover:text-orange-500 transition-colors">{userName}</p>
                </div>
                <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-slate-500 border border-white/5 group-hover:border-orange-500/30 transition-all">
                   <User size={12} />
                </div>
             </div>
             <button 
               onClick={onLogout}
               className="text-slate-600 hover:text-rose-500 transition-colors"
               title="Desligar Nodo"
             >
               <LogOut size={14} />
             </button>
          </div>
        </div>
      </header>

      {/* OPERATIONAL VIEWPORT - FULL SCREEN MODE */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-[#020617]">
        {children}
        <GlobalChat />
      </main>
    </div>
  );
};

export default Layout;
