
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { Link, useLocation } = ReactRouterDOM as any;
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, ChevronRight, LogIn, Factory, ShoppingCart, Briefcase, 
  Tractor, DollarSign, Hammer, Menu, X, Box, Cpu, Sparkles, 
  Zap, Gavel, PenTool, Trophy, Terminal, Rocket, GraduationCap,
  ShieldCheck, PlayCircle, Settings, MapPin, Globe, User
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
    default: return <Box size={size} />;
  }
};

const PublicHeader: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const location = useLocation();
  const { t } = useTranslation('common');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/95 backdrop-blur-2xl border-b border-white/10 z-[1000] flex items-center shadow-2xl"
    >
      <div className="w-full flex items-center justify-between px-6 md:px-12 h-full max-w-[1800px] mx-auto">
        
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500 border border-white/10">
            <span className="text-white font-black text-2xl italic">E</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white italic leading-none group-hover:text-orange-500 transition-colors">EMPIRION</span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none mt-1">Strategic Command Node</span>
          </div>
        </Link>

        <nav className="hidden lg:flex justify-center items-center gap-2 relative">
          {MENU_STRUCTURE.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = activeMenu === item.label;
            const translatedLabel = t(`nav.${item.label.toLowerCase()}`, item.label);

            return (
              <div 
                key={item.label} 
                className="relative py-2 px-1"
                onMouseEnter={() => setActiveMenu(item.label)} 
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link 
                  to={item.path} 
                  className={`relative z-10 px-5 py-2.5 font-black uppercase text-[10px] tracking-[0.15em] transition-all flex items-center gap-2 rounded-full ${isActive || isHovered ? 'text-white' : 'text-slate-500'}`}
                >
                  {translatedLabel as any}
                  {item.sub && <ChevronDown size={10} className={`transition-transform duration-300 ${isHovered ? 'rotate-180 text-orange-500' : ''}`} />}
                  
                  {(isActive || isHovered) && (
                    <motion.div 
                      layoutId="navPill" 
                      className="absolute inset-0 bg-orange-600 rounded-full -z-10 shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {item.sub && isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 15, scale: 0.95 }} 
                      className="absolute top-full left-0 min-w-[280px] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] p-0 mt-2 backdrop-blur-3xl z-[1050]"
                    >
                      <div className="grid grid-cols-1 gap-0.5 p-2">
                        {item.sub.map((sub: any) => (
                           <Link 
                             key={sub.id} 
                             to={sub.path} 
                             className="flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-orange-600/10 rounded-2xl transition-all group/sub"
                           >
                             <div className="p-3 bg-white/5 rounded-xl text-orange-500 group-hover/sub:bg-orange-600 group-hover/sub:text-white transition-all border border-white/5">
                                {getIcon(sub.icon)}
                             </div>
                             <div className="flex flex-col">
                               {/* Fix: Casting i18next translation results to any to resolve property missing error in React 18+ components */}
                               <span>{t(`branches:${sub.id}.name`, { defaultValue: sub.label }) as any}</span>
                               <span className="text-[7px] opacity-30 group-hover/sub:opacity-60">{t('active_module') as any}</span>
                             </div>
                             <ChevronRight size={12} className="ml-auto opacity-0 group-hover/sub:opacity-100 transition-all" />
                           </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden xl:block scale-90"><LanguageSwitcher light /></div>
          <Link to="/test/industrial" className="hidden md:flex items-center gap-3 px-8 py-3 bg-white/5 text-white border border-white/10 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all active:scale-95 shadow-xl">
            <Rocket size={14} className="animate-pulse text-orange-500" /> Trial
          </Link>
          <button onClick={onLogin} className="hidden md:flex items-center gap-3 px-8 py-3 bg-orange-600 text-white rounded-full font-black text-[9px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(249,115,22,0.4)] hover:bg-white hover:text-orange-950 transition-all">
            <LogIn size={14} /> {t('login') as any}
          </button>
          <button className="lg:hidden p-3 text-white bg-white/5 rounded-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 top-20 bg-slate-950 z-[900] lg:hidden p-10 flex flex-col gap-8 overflow-y-auto"
          >
             <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-4">{t('language') as any}</span>
                <div className="grid grid-cols-3 gap-3">
                   {['pt', 'en', 'es'].map(lang => (
                      <button key={lang} className="py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase">{lang}</button>
                   ))}
                </div>
             </div>
             <div className="flex flex-col gap-6">
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-2">{t('navigation') as any}</span>
               {MENU_STRUCTURE.map(item => (
                 <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-white uppercase italic tracking-tighter">{t(`nav.${item.label.toLowerCase()}`, item.label) as any}</Link>
               ))}
             </div>
             <button onClick={() => { onLogin(); setIsMobileMenuOpen(false); }} className="mt-auto w-full py-6 bg-orange-600 text-white rounded-3xl font-black uppercase tracking-widest italic">{t('login') as any}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PublicHeader;
