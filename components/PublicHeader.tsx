import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronRight, LogIn, Factory, ShoppingCart, Briefcase, 
  Tractor, DollarSign, Hammer, Menu, X, Box, Cpu, Sparkles, 
  Zap, Gavel, PenTool, Trophy, Terminal, Rocket, GraduationCap,
  ShieldCheck, PlayCircle
} from 'lucide-react';
import { MENU_STRUCTURE, APP_VERSION } from '../constants';
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
    case 'Gavel': return <Gavel size={size} />;
    case 'Cpu': return <Cpu size={size} />;
    case 'PenTool': return <PenTool size={size} />;
    case 'Trophy': return <Trophy size={size} />;
    case 'Terminal': return <Terminal size={size} />;
    case 'Rocket': return <Rocket size={size} />;
    case 'GraduationCap': return <GraduationCap size={size} />;
    case 'ShieldCheck': return <ShieldCheck size={size} />;
    case 'PlayCircle': return <PlayCircle size={size} />;
    default: return <Box size={size} />;
  }
};

const PublicHeader: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { modalities } = useModalities();

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 h-20 bg-[#020617]/95 backdrop-blur-2xl border-b border-white/5 z-[1000] flex items-center shadow-2xl"
    >
      <div className="w-full flex items-center justify-between px-6 md:px-12 h-full">
        
        {/* LOGO DESIGN - PROFESSIONAL TACTICAL */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-11 h-11 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500 border border-white/10">
              <span className="text-white font-black text-xl italic select-none">E</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tighter uppercase text-white italic leading-none group-hover:text-orange-500 transition-colors">EMPIRION</span>
                <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-[6px] font-mono text-orange-500/80 font-black uppercase tracking-tighter hidden sm:block">{APP_VERSION}</span>
              </div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none mt-1">Strategic Node 08</span>
            </div>
          </Link>
        </div>

        {/* FULL DESKTOP MENU */}
        <nav className="hidden lg:flex justify-center items-center gap-1">
          {MENU_STRUCTURE.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = activeMenu === item.label;

            return (
              <div key={item.label} className="relative" onMouseEnter={() => setActiveMenu(item.label)} onMouseLeave={() => setActiveMenu(null)}>
                <Link 
                  to={item.path} 
                  className={`relative z-10 px-5 py-2 fluid-menu-item font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 rounded-full ${isActive ? 'text-orange-500' : isHovered ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {item.label}
                  {item.sub && <ChevronDown size={10} className={`transition-transform duration-300 ${isHovered ? 'rotate-180 text-orange-500' : ''}`} />}
                  {isHovered && (
                    <motion.div 
                      layoutId="navGlowPill" 
                      className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-0" 
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} 
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {item.sub && isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 10, scale: 0.98 }} 
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[320px] bg-[#0f172a]/98 border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] p-3 mt-2 backdrop-blur-3xl z-[1050]"
                    >
                      <div className="grid grid-cols-1 gap-1">
                        {item.sub.map((sub: any, idx: number) => (
                           <SubmenuItem key={sub.id || idx} item={sub} />
                        ))}
                        {item.label === 'ramos' && modalities.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/5">
                             <p className="px-4 pb-2 text-[8px] font-black text-orange-500 uppercase tracking-widest">Arenas Real-time</p>
                             {modalities.map(m => (
                               <SubmenuItem key={m.id} item={{ id: m.slug, label: m.name, path: `/activities/${m.slug}`, icon: 'Sparkles', desc: 'Sincronização Ativa' }} />
                             ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-5">
          <div className="hidden xl:block scale-90"><LanguageSwitcher light /></div>
          
          <Link 
            to="/test/industrial"
            className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all active:scale-95 shadow-lg"
          >
            <Rocket size={12} className="animate-pulse" /> Teste Grátis
          </Link>

          <button 
            onClick={onLogin} 
            className="cyber-button hidden md:flex items-center gap-3 px-8 py-3 bg-white/5 text-white border border-white/10 rounded-full font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 whitespace-nowrap hover:bg-white hover:text-slate-950"
          >
            <LogIn size={14} /> Entrar
          </button>
          
          <button className="lg:hidden p-2 text-white hover:bg-white/5 rounded-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
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
            className="fixed inset-0 bg-slate-950 z-[2000] p-8 flex flex-col gap-10 overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic">E</div>
                 <span className="font-black text-white uppercase italic tracking-tighter">Empirion</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-white bg-white/5 rounded-full"><X size={28} /></button>
            </div>
            <div className="flex flex-col gap-8">
              {MENU_STRUCTURE.map(item => (
                <div key={item.label} className="space-y-6">
                    <Link to={item.path} onClick={() => !item.sub && setIsMobileMenuOpen(false)} className="block text-4xl font-black text-white uppercase tracking-tighter hover:text-orange-500">
                      {item.label}
                    </Link>
                    {item.sub && (
                        <div className="grid grid-cols-1 gap-6 pl-4 border-l-2 border-orange-600/30">
                            {item.sub.map((sub: any) => (
                                <div key={sub.id} className="space-y-4">
                                  <Link to={sub.path} onClick={() => !sub.sub && setIsMobileMenuOpen(false)} className="text-slate-300 font-black uppercase text-sm tracking-widest hover:text-orange-500 flex items-center gap-2">
                                     <ChevronRight size={12} className="text-orange-500" /> {sub.label}
                                  </Link>
                                  {sub.sub && (
                                    <div className="grid grid-cols-1 gap-3 pl-6 border-l border-white/10">
                                      {sub.sub.map((child: any) => (
                                        <Link key={child.id} to={child.path} onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 font-bold uppercase text-xs hover:text-white">
                                          {child.label}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              ))}
              
              <div className="mt-auto pt-10 text-center opacity-20">
                 <p className="text-[10px] font-mono font-black text-white uppercase">{APP_VERSION}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

const SubmenuItem: React.FC<{ item: any }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSub = item.sub && item.sub.length > 0;

  return (
    <div className="relative" onMouseEnter={() => hasSub && setIsOpen(true)} onMouseLeave={() => hasSub && setIsOpen(false)}>
      <Link 
        to={item.path || '#'} 
        className="flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-orange-600/10 rounded-2xl transition-all group/sub"
      >
        <div className="p-2.5 bg-white/5 rounded-xl text-orange-500 group-hover/sub:bg-orange-600 group-hover/sub:text-white group-hover/sub:scale-105 transition-all shadow-sm shrink-0 border border-white/5">
           {getIcon(item.icon)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="flex-1 truncate group-hover/sub:translate-x-1 transition-transform">{item.label}</span>
          {item.desc && <span className="text-[7px] font-bold opacity-30 truncate group-hover/sub:opacity-60 uppercase tracking-widest mt-0.5">{item.desc}</span>}
        </div>
        {hasSub && <ChevronRight size={12} className={`ml-auto transition-transform ${isOpen ? 'translate-x-1 text-orange-500' : ''}`} />}
      </Link>
      
      {/* CASCADE SIDE MENU */}
      <AnimatePresence>
        {hasSub && isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 15 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 15 }} 
            className="absolute left-[102%] top-0 min-w-[260px] bg-[#1e293b]/98 border border-white/10 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] p-2 backdrop-blur-3xl z-[1100]"
          >
            <div className="space-y-0.5">
              {item.sub.map((subChild: any, subIdx: number) => (
                <SubmenuItem key={subChild.id || subIdx} item={subChild} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHeader;