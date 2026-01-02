
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, ChevronRight, LogIn, Factory, ShoppingCart, Briefcase, 
  Tractor, DollarSign, Hammer, Menu, X, Box, Cpu, Sparkles, Globe,
  LayoutGrid, Rocket, Info, MessageSquare, Newspaper, Zap, Gavel
} from 'lucide-react';
import { MENU_STRUCTURE } from '../constants';
import { useModalities } from '../hooks/useModalities';
import LanguageSwitcher from './LanguageSwitcher';

const getIcon = (iconName?: string) => {
  const size = 14; // Reduced from 16
  switch(iconName) {
    case 'Factory': return <Factory size={size} />;
    case 'ShoppingCart': return <ShoppingCart size={size} />;
    case 'Briefcase': return <Briefcase size={size} />;
    case 'Tractor': return <Tractor size={size} />;
    case 'DollarSign': return <DollarSign size={size} />;
    case 'Hammer': return <Hammer size={size} />;
    case 'Sparkles': return <Sparkles size={size} />;
    case 'Zap': return <Zap size={size} />;
    case 'Gavel': return <Gavel size={size} />;
    case 'Cpu': return <Cpu size={size} />;
    default: return <Box size={size} />;
  }
};

const PublicHeader: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { modalities } = useModalities();

  const menuWithDynamics = MENU_STRUCTURE.map(item => {
    if (item.label === 'activities') {
        // As atividades agora são consolidadas no constants.tsx, mas se houver 
        // modalidades dinâmicas no banco, elas aparecem aqui também.
        return item;
    }
    if (item.label === 'solutions') {
      const solutionsItem = { ...item };
      const arenasGroup = solutionsItem.sub?.find(s => s.id === 'arenas');
      if (arenasGroup) {
        const staticSub = (arenasGroup.sub || []).filter(s => !s.id.startsWith('mod-'));
        const dynamicItems = modalities.map(m => ({
          id: `mod-${m.slug}`,
          label: m.name,
          path: `/activities/${m.slug}`,
          icon: 'Sparkles'
        }));
        arenasGroup.sub = [...staticSub, ...dynamicItems];
      }
      return solutionsItem;
    }
    return item;
  });

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 z-[1000] flex items-center"
    >
      <div className="w-full flex items-center justify-between px-6 md:px-12 h-full">
        
        {/* LOGO SEBRAE-INSPIRED STYLE */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500 border border-white/10">
              <span className="text-white font-black text-xl italic select-none">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase text-white italic leading-none group-hover:text-blue-400 transition-colors">EMPIRION</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mt-1">Command Node 08</span>
            </div>
          </Link>
        </div>

        {/* DESKTOP MENU */}
        <nav className="hidden lg:flex justify-center items-center gap-1">
          {menuWithDynamics.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = activeMenu === item.label;

            return (
              <div key={item.label} className="relative" onMouseEnter={() => setActiveMenu(item.label)} onMouseLeave={() => setActiveMenu(null)}>
                <Link to={item.path} className={`relative z-10 px-5 py-2 fluid-menu-item font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 rounded-full ${isActive ? 'text-white' : isHovered ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'}`}>
                  {t(item.label)}
                  {item.sub && <ChevronDown size={10} className={`transition-transform duration-300 ${isHovered ? 'rotate-180 text-blue-500' : ''}`} />}
                  {isHovered && <motion.div layoutId="navGlowPill" className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-full -z-0" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                </Link>

                <AnimatePresence>
                  {item.sub && isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 10, scale: 0.98 }} 
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[300px] bg-[#0f172a]/95 border border-white/10 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.7)] p-2 mt-2 backdrop-blur-3xl max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar"
                    >
                      <div className="grid grid-cols-1 gap-0.5">
                        {item.sub.map((sub: any, idx: number) => <SubmenuItem key={sub.id || idx} item={sub} index={idx} />)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:block"><LanguageSwitcher light /></div>
          <button onClick={onLogin} className="cyber-button hidden md:flex items-center gap-3 px-8 py-3 bg-white text-slate-950 rounded-full font-black text-[9px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 border border-transparent whitespace-nowrap">
            <LogIn size={14} /> {t('login')}
          </button>
          <button className="lg:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-slate-950 z-[2000] p-8 flex flex-col gap-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-black uppercase text-white italic tracking-tighter">Command Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white"><X size={28} /></button>
            </div>
            <div className="flex flex-col gap-4">
              {menuWithDynamics.map(item => (
                <div key={item.label} className="space-y-3">
                    <Link to={item.path} onClick={() => !item.sub && setIsMobileMenuOpen(false)} className="block text-3xl font-black text-white uppercase tracking-tighter hover:text-blue-500 transition-colors">
                    {t(item.label)}
                    </Link>
                    {item.sub && (
                        <div className="grid grid-cols-1 gap-2 pl-4 border-l border-white/5">
                            {item.sub.map((sub: any) => (
                                <Link key={sub.id} to={sub.path} onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors py-1 flex items-center gap-2">
                                   <ChevronRight size={10} className="text-blue-500" /> {sub.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
              ))}
            </div>
            <div className="mt-auto pt-8 border-t border-white/5">
                <button onClick={() => { setIsMobileMenuOpen(false); onLogin(); }} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm">
                {t('login')}
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

const SubmenuItem: React.FC<{ item: any; index: number }> = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => item.sub && setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <Link to={item.path || '#'} className="flex items-center gap-3 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-blue-600/10 rounded-xl transition-all group/sub">
        <div className="p-2 bg-white/5 rounded-lg text-blue-500 group-hover/sub:bg-blue-600 group-hover/sub:text-white group-hover/sub:scale-105 transition-all shadow-sm shrink-0">
           {getIcon(item.icon)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="flex-1 truncate">{item.label}</span>
          {item.desc && <span className="text-[7px] font-bold opacity-30 truncate group-hover/sub:opacity-60">{item.desc}</span>}
        </div>
        {item.sub && <ChevronRight size={10} className={`ml-auto transition-transform ${isOpen ? 'translate-x-0.5' : ''}`} />}
      </Link>
      <AnimatePresence>
        {item.sub && isOpen && (
          <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }} className="absolute left-[100%] top-0 w-64 bg-[#1e293b]/95 border border-white/10 rounded-[1.5rem] shadow-2xl p-2 backdrop-blur-3xl z-[1100] ml-1">
            <div className="space-y-0.5">
              {item.sub.map((subChild: any, subIdx: number) => <SubmenuItem key={subChild.id || subIdx} item={subChild} index={subIdx} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHeader;
