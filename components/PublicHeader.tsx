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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 z-[1000] flex items-center px-6 md:px-12"
    >
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Logo Modular */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-500">
              <span className="text-white font-black text-xl italic select-none">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase text-white italic leading-none group-hover:text-blue-400 transition-colors">EMPIRION</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mt-1">Intelligence Arena</span>
            </div>
          </Link>
        </div>

        {/* Centro: Navegação com Espaço Dedicado e Scroll se necessário */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-2 overflow-x-auto no-scrollbar px-4">
          {MENU_STRUCTURE.map((item) => (
            <div 
              key={item.label} 
              className="relative"
              onMouseEnter={() => item.sub && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link 
                to={item.path}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 rounded-full relative ${
                  location.pathname === item.path ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t(item.label)}
                {item.sub && <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
                
                {/* Hover Background Follower Effect */}
                <AnimatePresence>
                  {activeDropdown === item.label && (
                    <motion.div 
                      layoutId="navHover"
                      className="absolute inset-0 bg-white/5 border border-white/5 rounded-full -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
              </Link>

              {/* Dropdown L1 */}
              <AnimatePresence>
                {item.sub && activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 mt-2"
                  >
                    <div className="space-y-1">
                      {item.sub.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={sub.path}
                          className="flex items-center gap-4 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-blue-600/20 rounded-2xl transition-all group/sub"
                        >
                          <div className="p-2 bg-white/5 rounded-lg text-blue-500 group-hover/sub:bg-blue-600 group-hover/sub:text-white transition-all">
                             {getIcon(sub.icon)}
                          </div>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Lado Direito: Ações */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <div className="hidden sm:block">
            <LanguageSwitcher light />
          </div>
          
          <button 
            onClick={onLogin}
            className="hidden md:flex items-center gap-3 px-8 py-3 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-xl active:scale-95 border border-transparent hover:shadow-orange-500/20"
          >
            <LogIn size={14} /> {t('login')}
          </button>
          
          <button 
            className="lg:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 top-20 bg-[#020617] p-8 z-[900] flex flex-col gap-8"
          >
            <nav className="flex flex-col gap-6">
              {MENU_STRUCTURE.map((item) => (
                <div key={item.label} className="space-y-4">
                   <Link 
                     to={item.path} 
                     className="text-2xl font-black uppercase tracking-tighter text-white italic" 
                     onClick={() => setIsMobileMenuOpen(false)}
                   >
                     {t(item.label)}
                   </Link>
                   {item.sub && (
                     <div className="pl-4 grid grid-cols-1 gap-3">
                        {item.sub.map((s: any) => (
                          <Link 
                            key={s.id} 
                            to={s.path} 
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400" 
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {s.label}
                          </Link>
                        ))}
                     </div>
                   )}
                </div>
              ))}
            </nav>
            <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-4">
              <button onClick={onLogin} className="w-full py-6 bg-orange-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl">Acessar Arena</button>
              <div className="flex justify-center"><LanguageSwitcher light /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PublicHeader;