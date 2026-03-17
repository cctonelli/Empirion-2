
import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle, Hourglass } from 'lucide-react';
import { DeadlineUnit } from '../types';

interface ChampionshipTimerProps {
  roundStartedAt?: string; 
  deadlineValue?: number;
  deadlineUnit?: DeadlineUnit;
  onExpire?: () => void;
  createdAt?: string; // Fallback absoluto para arenas recém-criadas sem turnover
  variant?: 'default' | 'compact';
}

const ChampionshipTimer: React.FC<ChampionshipTimerProps> = ({ 
  roundStartedAt, 
  deadlineValue = 7, 
  deadlineUnit = 'days', 
  onExpire, 
  createdAt,
  variant = 'default'
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('Sincronizando...');
  const [isCritical, setIsCritical] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // FIX: Se não houver round_started_at, tenta usar a data de criação da arena. 
    // Isso evita o reset visual se o turnover ainda não ocorreu no ciclo 0.
    const effectiveStart = roundStartedAt || createdAt;
    
    if (!effectiveStart) {
       setTimeLeft('Aguardando...');
       return;
    }

    startTimeRef.current = new Date(effectiveStart).getTime();
    let durationMs = 0;

    switch(deadlineUnit) {
      case 'hours': durationMs = deadlineValue * 60 * 60 * 1000; break;
      case 'days': durationMs = deadlineValue * 24 * 60 * 60 * 1000; break;
      case 'weeks': durationMs = deadlineValue * 7 * 24 * 60 * 60 * 1000; break;
      case 'months': durationMs = deadlineValue * 30 * 24 * 60 * 60 * 1000; break;
      default: durationMs = 7 * 24 * 60 * 60 * 1000;
    }

    const targetDate = startTimeRef.current + durationMs;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft('ENCERRADO');
        setIsCritical(true);
        setIsUrgent(true);
        clearInterval(timer);
        if (onExpire) onExpire();
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      let formatted = "";
      if (d > 0) formatted += `${d}d `;
      formatted += `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      
      setTimeLeft(formatted);
      setIsCritical(diff < 12 * 60 * 60 * 1000); // 12h para alerta crítico
      setIsUrgent(diff < 2 * 60 * 60 * 1000);    // 2h para pulsante
    }, 1000);

    return () => clearInterval(timer);
  }, [roundStartedAt, createdAt, deadlineValue, deadlineUnit, onExpire]);

  if (variant === 'compact') {
    return (
      <div className={`px-3 py-1 rounded-xl border flex items-center gap-3 transition-all duration-500 shadow-xl ${
        isUrgent ? 'bg-rose-600 border-white text-white animate-pulse shadow-rose-600/20' :
        isCritical ? 'bg-orange-600 border-orange-400 text-white shadow-orange-600/20' : 
        'bg-slate-950 border-white/10 text-slate-100 shadow-black/40'
      }`}>
        <div className="flex flex-col">
           <span className={`text-[6px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${isUrgent || isCritical ? 'text-white/70' : 'text-orange-500'}`}>
              {isUrgent ? 'URGENTE' : isCritical ? 'PRAZO' : 'ROUND TIMER'}
           </span>
           <span className="text-sm font-mono font-black tracking-tighter leading-none">{timeLeft}</span>
        </div>
        <div className={`p-1.5 rounded-lg ${isUrgent || isCritical ? 'bg-white/20' : 'bg-white/5'}`}>
           <Clock size={14} className={!isCritical && !isUrgent ? 'text-orange-500 animate-pulse' : ''} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-5 transition-all duration-500 ${
        isUrgent 
          ? 'bg-rose-700/90 border-rose-400 text-white animate-pulse scale-[1.03]' 
          : isCritical 
          ? 'bg-orange-700/90 border-orange-400 text-white' 
          : 'bg-slate-900/80 border-slate-600/40 text-slate-100'
      }`}
    >
      {/* Texto + tempo */}
      <div className="flex flex-col min-w-[110px]">
        <span 
          className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 leading-none ${
            isUrgent || isCritical ? 'text-white' : 'text-orange-400'
          }`}
        >
          {isUrgent 
            ? 'URGENTE: TRANSMITA' 
            : isCritical 
            ? 'PRAZO FINAL' 
            : 'RESTA PARA DECIDIR'}
        </span>
        <span className="text-3xl font-mono font-extrabold tracking-[-0.05em] leading-none">
          {timeLeft}
        </span>
      </div>

      {/* Ícone maior e mais destacado */}
      <div 
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg flex-shrink-0 ${
          isUrgent 
            ? 'bg-white text-rose-700 border-2 border-white animate-pulse' 
            : isCritical 
            ? 'bg-white text-orange-700 border-2 border-white' 
            : 'bg-white/10 text-orange-400 border border-white/20'
        }`}
      >
        {isUrgent ? (
          <AlertCircle size={36} strokeWidth={2.5} />
        ) : (
          <Clock size={36} strokeWidth={2} className={!isCritical ? 'animate-pulse' : ''} />
        )}
      </div>
    </div>
  );

export default ChampionshipTimer;
