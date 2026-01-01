
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, ChevronRight, LogIn, Factory, ShoppingCart, Briefcase, 
  Tractor, DollarSign, Hammer, Menu, X, Box, Sparkles, Globe, Cpu
} from 'lucide-react';
import { MENU_STRUCTURE } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

const getIcon = (iconName?: string) => {
  const size = 16;
  switch(iconName) {
    case 'Factory': return <Factory size={size} />;
    case 'ShoppingCart': return <ShoppingCart size={size} />;
    case 'Briefcase': return <Briefcase size={size} />;
    case 'Tractor': return <Tractor size={size} />;
    case 'DollarSign': return <DollarSign size={size} />;
    case 'Hammer': return <Hammer size={size} />;
    default: return <Cpu size={size} />;
  }
};

const PublicHeader: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 z-[1000] flex items-center"
    >
      {/* Estrutura de Grade Isolada para Segurança de Layout */}
      <div className="w-full grid grid-cols-[240px_1fr_340px] items-center px-6 md:px-12">
        
        {/* COLUNA 1: BRANDING (INDEPENDENTE) */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/40 group-hover:rotate-6 transition-all duration-500 border border-white/10">
              <span className="text-white font-black text-2xl italic select-none">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase text-white italic leading-none group-hover:text-blue-400 transition-colors">EMPIRION</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none mt-1">Intelligence Arena</span>
            </div>
          </Link>
        </div>

        {/* COLUNA 2: NAVEGAÇÃO CENTRAL (FLEXÍVEL E ANTI-OVERFLOW) */}
        <nav className="hidden lg:flex justify-center items-center h-full">
          <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-full p-1 shadow-inner relative">
            {MENU_STRUCTURE.map((item) => {
              const isActive = location.pathname === item.path;
              const isHovered = activeMenu === item.label;

              return (
                <div 
                  key={item.label} 
                  className="relative px-1"
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link 
                    to={item.path}
                    className={`relative z-10 px-5 py-2.5 fluid-menu-item font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 rounded-full ${
                      isActive ? 'text-white' : isHovered ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t(item.label)}
                    {item.sub && <ChevronDown size={11} className={`transition-transform duration-300 ${isHovered ? 'rotate-180 text-blue-500' : ''}`} />}
                    
                    {/* PILL FOLLOWER EFFECT (WOW) */}
                    {isHovered && (
                      <motion.div 
                        layoutId="navPill"
                        className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                        initial={false}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>

                  {/* SUBMENU NÍVEL 1 (CASCADE) */}
                  <AnimatePresence>
                    {item.sub && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 w-72 bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.7)] p-4 mt-4 backdrop-blur-3xl"
                      >
                        <div className="space-y-1">
                          {item.sub.map((sub: any, idx: number) => (
                            <SubmenuItem key={sub.id} item={sub} index={idx} />
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

        {/* COLUNA 3: AÇÕES E LOGIN (ESPAÇO RESERVADO) */}
        <div className="flex items-center justify-end gap-6 h-full">
          <div className="hidden sm:block">
            <LanguageSwitcher light />
          </div>
          
          <button 
            onClick={onLogin}
            className="cyber-button hidden md:flex items-center gap-3 px-10 py-3.5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all border border-transparent whitespace-nowrap"
          >
            <LogIn size={15} /> {t('login')}
          </button>
          
          <button 
            className="lg:hidden p-3 text-white hover:bg-white/5 rounded-2xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU (DESIGN SUPREMO) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 top-20 bg-[#020617] p-10 z-[900] flex flex-col gap-12"
          >
            <nav className="flex flex-col gap-8">
              {MENU_STRUCTURE.map((item, i) => (
                <div key={item.label} className="space-y-4">
                   <Link 
                     to={item.path} 
                     className="text-4xl font-black uppercase tracking-tighter text-white italic flex items-center justify-between group" 
                     onClick={() => setIsMobileMenuOpen(false)}
                   >
                     {t(item.label)}
                     <ChevronRight size={28} className="text-blue-600 group-hover:translate-x-2 transition-transform" />
                   </Link>
                </div>
              ))}
            </nav>
            <div className="mt-auto space-y-6">
              <button onClick={onLogin} className="w-full py-8 bg-blue-600 text-white rounded-[3rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 cyber-button">Acessar Arena Suprema</button>
              <div className="flex justify-center"><LanguageSwitcher light /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

/* COMPONENTE DE SUBMENU RECURSIVO (PARA AMPLIAR SUBMENUS DOS SUBMENUS) */
// Fixed error: Type '{ key: any; item: any; index: number; }' is not assignable to type '{ item: any; index: number; }'.
// By adding key to the interface or defining the component as React.FC.
const SubmenuItem: React.FC<{ item: any; index: number }> = ({ item, index }) => {
  const [isGrandchildOpen, setIsGrandchildOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => item.sub && setIsGrandchildOpen(true)}
      onMouseLeave={() => setIsGrandchildOpen(false)}
    >
      <Link
        to={item.path}
        className="flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-blue-600/20 rounded-2xl transition-all group/sub"
      >
        <div className="p-3 bg-white/5 rounded-xl text-blue-500 group-hover/sub:bg-blue-600 group-hover/sub:text-white group-hover/sub:scale-110 transition-all shadow-sm">
           {getIcon(item.icon)}
        </div>
        {item.label}
        {item.sub && <ChevronRight size={14} className={`ml-auto transition-transform ${isGrandchildOpen ? 'translate-x-1' : ''}`} />}
      </Link>

      {/* SUBMENU NÍVEL 2+ (Grandchildren) */}
      <AnimatePresence>
        {item.sub && isGrandchildOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute left-[105%] top-0 w-64 bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl p-3 backdrop-blur-3xl"
          >
            <div className="space-y-1">
              {item.sub.map((grand: any) => (
                <Link
                  key={grand.id}
                  to={grand.path}
                  className="flex items-center gap-3 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  {grand.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHeader;
