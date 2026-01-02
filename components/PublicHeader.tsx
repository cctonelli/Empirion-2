
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, ChevronRight, LogIn, Factory, ShoppingCart, Briefcase, 
  Tractor, DollarSign, Hammer, Menu, X, Box, Cpu, Sparkles, Globe,
  LayoutGrid, Rocket, Info, MessageSquare, Newspaper, Zap
} from 'lucide-react';
import { MENU_STRUCTURE } from '../constants';
import { useModalities } from '../hooks/useModalities';
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
    case 'Sparkles': return <Sparkles size={size} />;
    case 'Zap': return <Zap size={size} />;
    default: return <Cpu size={size} />;
  }
};

const PublicHeader: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { modalities } = useModalities();

  const menuWithDynamics = MENU_STRUCTURE.map(item => {
    if (item.label === 'solutions') {
      const solutionsItem = { ...item };
      const arenasGroup = solutionsItem.sub?.find(s => s.id === 'arenas');
      if (arenasGroup) {
        const staticSub = (arenasGroup.sub || []).filter(s => !s.id.startsWith('mod-'));
        const dynamicItems = modalities.map(m => ({
          id: `mod-${m.slug}`,
          label: m.name,
          path: `/solutions/${m.slug}`,
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
      className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/85 backdrop-blur-3xl border-b border-white/5 z-[1000] flex items-center"
    >
      <div className="w-full flex items-center justify-between px-6 md:px-12 h-full">
        
        {/* LOGO SEBRAE-INSPIRED STYLE */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500 border border-white/10">
              <span className="text-white font-black text-2xl italic select-none">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase text-white italic leading-none group-hover:text-blue-400 transition-colors">EMPIRION</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none mt-1">Strategic Command Node</span>
            </div>
          </Link>
        </div>

        {/* DESKTOP MENU */}
        <nav className="hidden lg:flex justify-center items-center gap-2">
          {menuWithDynamics.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = activeMenu === item.label;

            return (
              <div key={item.label} className="relative" onMouseEnter={() => setActiveMenu(item.label)} onMouseLeave={() => setActiveMenu(null)}>
                <Link to={item.path} className={`relative z-10 px-6 py-2.5 fluid-menu-item font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 rounded-full ${isActive ? 'text-white' : isHovered ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'}`}>
                  {t(item.label)}
                  {item.sub && <ChevronDown size={11} className={`transition-transform duration-300 ${isHovered ? 'rotate-180 text-blue-500' : ''}`} />}
                  {isHovered && <motion.div layoutId="navGlowPill" className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-full -z-0" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                </Link>

                <AnimatePresence>
                  {item.sub && isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 15, scale: 0.95 }} 
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[340px] bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] p-3 mt-4 backdrop-blur-3xl"
                    >
                      <div className="grid grid-cols-1 gap-1">
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
        <div className="flex items-center gap-6">
          <div className="hidden sm:block"><LanguageSwitcher light /></div>
          <button onClick={onLogin} className="cyber-button hidden md:flex items-center gap-3 px-10 py-3.5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 border border-transparent whitespace-nowrap">
            <LogIn size={15} /> {t('login')}
          </button>
          <button className="lg:hidden p-3 text-white hover:bg-white/5 rounded-2xl transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
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
            className="fixed inset-0 bg-slate-950 z-[2000] p-10 flex flex-col gap-10"
          >
            <div className="flex justify-between items-center">
              <span className="text-xl font-black uppercase text-white italic">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white"><X size={32} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
              {menuWithDynamics.map(item => (
                <Link key={item.label} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className="block text-4xl font-black text-white uppercase tracking-tighter hover:text-blue-500 transition-colors">
                  {t(item.label)}
                </Link>
              ))}
            </div>
            <button onClick={() => { setIsMobileMenuOpen(false); onLogin(); }} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-lg">
              {t('login')}
            </button>
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
      <Link to={item.path || '#'} className="flex items-center gap-4 px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-blue-600/20 rounded-2xl transition-all group/sub">
        <div className="p-3 bg-white/5 rounded-xl text-blue-500 group-hover/sub:bg-blue-600 group-hover/sub:text-white group-hover/sub:scale-110 transition-all shadow-sm">
           {getIcon(item.icon)}
        </div>
        <div className="flex flex-col">
          <span className="flex-1">{item.label}</span>
          {item.desc && <span className="text-[8px] font-bold opacity-40 lowercase group-hover/sub:opacity-80">{item.desc}</span>}
        </div>
        {item.sub && <ChevronRight size={12} className={`ml-auto transition-transform ${isOpen ? 'translate-x-1' : ''}`} />}
      </Link>
      <AnimatePresence>
        {item.sub && isOpen && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="absolute left-[100%] top-0 w-72 bg-[#1e293b] border border-white/10 rounded-[2.5rem] shadow-2xl p-3 backdrop-blur-3xl z-[1100]">
            <div className="space-y-1">
              {item.sub.map((subChild: any, subIdx: number) => <SubmenuItem key={subChild.id || subIdx} item={subChild} index={subIdx} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHeader;
