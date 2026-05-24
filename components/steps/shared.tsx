import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export const WizardStepHeader = ({ icon, title, desc, help }: any) => (
  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
     <div className="p-4 bg-slate-900 border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.3)] shrink-0 text-orange-500 relative group">
        <div className="absolute inset-0 bg-orange-600/5 rounded-xl group-hover:bg-orange-600/10 transition-colors" />
        <div className="relative z-10">{icon}</div>
     </div>
     <div>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none flex items-center gap-4">
           {title} {help && <span title={help} className="cursor-help p-1.5 bg-white/5 rounded-full hover:bg-orange-600/20 transition-colors"><HelpCircle size={14} className="text-slate-600" /></span>}
        </h3>
        <p className="text-sm text-slate-400 mt-1.5 leading-relaxed font-sans">{desc}</p>
     </div>
  </div>
);

export const CurrencyInput = ({ value, onChange, currency }: { value: number, onChange: (v: number) => void, currency: string }) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const numeric = parseInt(digits || '0') / 100;
    onChange(numeric);
  };

  return (
    <input 
      type="text" 
      value={display} 
      onChange={handleChange} 
      className="w-full bg-slate-950 border-2 border-white/5 rounded-xl p-2 text-lg font-mono font-black text-white outline-none focus:border-orange-600 shadow-inner" 
    />
  );
};
