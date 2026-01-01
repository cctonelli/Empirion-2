
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, ChevronRight, LogIn, Factory, ShoppingCart, Briefcase, 
  Tractor, DollarSign, Hammer, Menu, X, Shield, Settings, Info, Box
} from 'lucide-react';
import { MENU_STRUCTURE } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

const getIcon = (iconName?: string) => {
  switch(iconName) {
    case 'Factory': return <Factory size={16} />;
    case 'ShoppingCart': return <ShoppingCart size={16} />;
    case 'Briefcase': return <Briefcase size={16} />;
    case 'Tractor': return <Tractor size={16} />;
    case 'DollarSign': return <DollarSign size={16} />;
    case 'Hammer': return <Hammer size={16} />;
    default: return <Box size={16} />;
  }
};

const PublicHeader: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 h-24 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center px-8 md:px-16"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-xl italic">E</span>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase text-white italic">EMPIRION</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {MENU_STRUCTURE.map((item) => (
            <div 
              key={item.label} 
              className="relative py-4"
              onMouseEnter={() => item.sub && setActiveDropdown(item.label)}
              onMouseLeave={() => { setActiveDropdown(null); setActiveSubDropdown(null); }}
            >
              <Link 
                to={item.path}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                  location.pathname === item.path ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t(item.label)}
                {item.sub && <ChevronDown size={12} className={`transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
              </Link>

              {/* L1 Dropdown */}
              <AnimatePresence>
                {item.sub && activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-72 bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl p-4 overflow-visible"
                  >
                    <div className="space-y-1">
                      {item.sub.map((sub: any) => (
                        <div 
                          key={sub.id} 
                          className="relative"
                          onMouseEnter={() => sub.sub && setActiveSubDropdown(sub.id)}
                          onMouseLeave={() => setActiveSubDropdown(null)}
                        >
                          <Link
                            to={sub.path}
                            className="flex items-center justify-between px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-blue-500">{getIcon(sub.icon)}</span>
                              {sub.label}
                            </div>
                            {sub.sub && <ChevronRight size={12} />}
                          </Link>

                          {/* L2 Dropdown (Nesting) */}
                          <AnimatePresence>
                            {sub.sub && activeSubDropdown === sub.id && (
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="absolute top-0 left-full ml-4 w-64 bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl p-4"
                              >
                                {sub.sub.map((deep: any) => (
                                  <Link
                                    key={deep.id}
                                    to={deep.path}
                                    className="block px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                  >
                                    {deep.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:block"><LanguageSwitcher light /></div>
          <button 
            onClick={onLogin}
            className="hidden md:flex items-center gap-3 px-8 py-3.5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#f97316] hover:text-white transition-all shadow-2xl active:scale-95 border-b-4 border-slate-200 hover:border-orange-700"
          >
            <LogIn size={16} /> {t('login')}
          </button>
          
          <button 
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-[#020617] border-b border-white/5 p-6 overflow-hidden max-h-[80vh] overflow-y-auto"
          >
            <nav className="flex flex-col gap-6">
              {MENU_STRUCTURE.map((item) => (
                <div key={item.label} className="space-y-4">
                   <Link to={item.path} className="text-sm font-black uppercase tracking-widest text-white" onClick={() => setIsMobileMenuOpen(false)}>{t(item.label)}</Link>
                   {item.sub && (
                     <div className="pl-4 flex flex-col gap-4">
                        {item.sub.map((s: any) => (
                          <div key={s.id} className="space-y-3">
                             <Link to={s.path} className="text-[10px] font-bold uppercase tracking-widest text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>{s.label}</Link>
                             {s.sub && (
                               <div className="pl-4 flex flex-col gap-2 opacity-60">
                                 {s.sub.map((deep: any) => (
                                   <Link key={deep.id} to={deep.path} className="text-[9px] font-bold uppercase tracking-widest text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>{deep.label}</Link>
                                 ))}
                               </div>
                             )}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              ))}
              <button onClick={onLogin} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">Acessar Arena</button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PublicHeader;
