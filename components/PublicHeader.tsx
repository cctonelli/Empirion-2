import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, ChevronRight, LogIn, Factory, ShoppingCart, Briefcase, 
  Tractor, DollarSign, Hammer, Menu, X, Box, Sparkles
} from 'lucide-react';
import { MENU_STRUCTURE } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

const getIcon = (iconName?: string) => {
  switch(iconName) {
    case 'Factory': return <Factory size={14} />;
    case 'ShoppingCart': return <ShoppingCart size={14} />;
    case 'Briefcase': return <Briefcase size={14} />;
    case 'Tractor': return <Tractor size={14} />;
    case 'DollarSign': return <DollarSign size={14} />;
    case 'Hammer': return <Hammer size={14} />;
    default: return <Box size={14} />;
  }
};

const PublicHeader: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 z-[1000] flex items-center"
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* ZONA 1: LOGO INDEPENDENTE */}
        <div className="w-[220px] flex-shrink-0">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/40 group-hover:rotate-6 transition-all duration-500">
              <span className="text-white font-black text-2xl italic select-none">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter uppercase text-white italic leading-none group-hover:text-blue-400 transition-colors">EMPIRION</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none mt-1">Intelligence Arena</span>
            </div>
          </Link>
        </div>

        {/* ZONA 2: NAVEGAÇÃO CENTRAL ISOLADA (ANTI-SHIFT) */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-1">
          <div className="flex items-center bg-white/5 border border-white/5 rounded-full p-1 relative">
            {MENU_STRUCTURE.map((item) => {
              const isActive = location.pathname === item.path;
              const isHovered = activeMenu === item.label;

              return (
                <div 
                  key={item.label} 
                  className="relative px-2"
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link 
                    to={item.path}
                    className={`relative z-10 px-5 py-2.5 fluid-menu-item font-black uppercase tracking-[0.15em] transition-colors flex items-center gap-2 rounded-full ${
                      isActive ? 'text-white' : isHovered ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t(item.label)}
                    {item.sub && <ChevronDown size={10} className={`transition-transform duration-300 ${isHovered ? 'rotate-180 text-blue-500' : ''}`} />}
                    
                    {/* PILL FOLLOWER EFFECT */}
                    {isHovered && (
                      <motion.div 
                        layoutId="navPill"
                        className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-full -z-0"
                        initial={false}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </Link>

                  {/* SUBMENU SUPREMO */}
                  <AnimatePresence>
                    {item.sub && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-3 mt-4"
                      >
                        <div className="space-y-1">
                          {item.sub.map((sub: any, idx: number) => (
                            <motion.div
                              key={sub.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Link
                                to={sub.path}
                                className="flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-blue-600/20 rounded-2xl transition-all group/sub"
                              >
                                <div className="p-2.5 bg-white/5 rounded-xl text-blue-500 group-hover/sub:bg-blue-600 group-hover/sub:text-white group-hover/sub:scale-110 transition-all">
                                   {getIcon(sub.icon)}
                                </div>
                                {sub.label}
                                <ChevronRight size={12} className="ml-auto opacity-0 group-hover/sub:opacity-100 group-hover/sub:translate-x-1 transition-all" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </nav>

        {/* ZONA 3: AÇÕES DE DIREITA FIXAS */}
        <div className="w-[320px] flex-shrink-0 flex items-center justify-end gap-6">
          <div className="hidden sm:block">
            <LanguageSwitcher light />
          </div>
          
          <button 
            onClick={onLogin}
            className="cyber-button hidden md:flex items-center gap-3 px-10 py-3.5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 border border-transparent"
          >
            <LogIn size={14} /> {t('login')}
          </button>
          
          <button 
            className="lg:hidden p-3 text-white hover:bg-white/5 rounded-2xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY (SUPREMO) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="lg:hidden fixed inset-0 top-20 bg-[#020617] p-10 z-[900] flex flex-col gap-10"
          >
            <nav className="flex flex-col gap-8">
              {MENU_STRUCTURE.map((item, i) => (
                <motion.div 
                  key={item.label} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-5"
                >
                   <Link 
                     to={item.path} 
                     className="text-4xl font-black uppercase tracking-tighter text-white italic flex items-center justify-between" 
                     onClick={() => setIsMobileMenuOpen(false)}
                   >
                     {t(item.label)}
                     <ChevronRight size={24} className="text-blue-600" />
                   </Link>
                   {item.sub && (
                     <div className="pl-6 grid grid-cols-1 gap-4 border-l-2 border-white/5">
                        {item.sub.map((s: any) => (
                          <Link 
                            key={s.id} 
                            to={s.path} 
                            className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400" 
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {s.label}
                          </Link>
                        ))}
                     </div>
                   )}
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto space-y-6">
              <button onClick={onLogin} className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20">Acessar Arena Suprema</button>
              <div className="flex justify-center"><LanguageSwitcher light /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PublicHeader;