
import React, { useState } from 'react';
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
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  onNavigate: (view: string) => void;
  activeView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onNavigate, activeView }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'championships', label: 'Championships', icon: Trophy },
    { id: 'reports', label: 'Financial Reports', icon: FileText },
    { id: 'market', label: 'Market Analysis', icon: TrendingUp },
    { id: 'admin', label: 'Command Center', icon: ShieldCheck, roles: ['admin', 'tutor'] },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 transition-all duration-300 ease-in-out flex flex-col z-50`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          {isSidebarOpen && <span className="text-white font-bold text-xl tracking-tight">EMPIRION</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.filter(item => !item.roles || item.roles.includes(userRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-4 overflow-hidden">
            <div className="shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
              <User size={20} />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-white text-sm font-semibold truncate">{userName}</span>
                <span className="text-slate-500 text-xs capitalize">{userRole}</span>
              </div>
            )}
          </div>
          <button className="w-full flex items-center gap-4 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 z-40 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full w-64 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
