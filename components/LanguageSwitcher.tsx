
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const LanguageSwitcher: React.FC<{ light?: boolean }> = ({ light = false }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all border ${
          light 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
            : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200'
        }`}
      >
        <Globe size={16} className={light ? 'text-blue-400' : 'text-blue-600'} />
        <span className="text-[10px] font-black uppercase tracking-widest">{currentLang.code}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-0 mt-3 w-48 rounded-[1.5rem] shadow-2xl border z-[200] overflow-hidden ${
              light ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'
            }`}
          >
            <div className="p-2 space-y-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    i18n.language === lang.code 
                      ? (light ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700')
                      : (light ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-xs font-bold uppercase tracking-tight">{lang.name}</span>
                  </div>
                  {i18n.language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
