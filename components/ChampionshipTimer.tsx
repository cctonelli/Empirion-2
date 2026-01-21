
import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle, Hourglass } from 'lucide-react';
import { DeadlineUnit } from '../types';

interface ChampionshipTimerProps {
  roundStartedAt?: string; 
  deadlineValue?: number;
  deadlineUnit?: DeadlineUnit;
  onExpire?: () => void;
  createdAt?: string; // Fallback absoluto para arenas recém-criadas sem turnover
}

const ChampionshipTimer: React.FC<ChampionshipTimerProps> = ({ roundStartedAt, deadlineValue = 7, deadlineUnit = 'days', onExpire, createdAt }) => {
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

  return (
    <div className={`px-8 py-4 rounded-[2rem] shadow-2xl border transition-all duration-700 flex items-center gap-6 ${
      isUrgent ? 'bg-rose-600 border-white text-white animate-pulse scale-105' :
      isCritical ? 'bg-orange-600 border-orange-400 text-white' : 
      'bg-slate-900 border-white/10 text-slate-100'
    }`}>
      <div className="flex flex-col">
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${
          isUrgent || isCritical ? 'text-white' : 'text-orange-500'
        }`}>
          {isUrgent ? 'URGENTE: TRANSMITA' : isCritical ? 'PRAZO FINAL' : 'RESTA PARA DECIDIR'}
        </span>
        <span className="text-2xl font-mono font-black tracking-tighter leading-none">{timeLeft}</span>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
        isUrgent ? 'bg-white text-rose-600' : 
        isCritical ? 'bg-white text-orange-600' : 
        'bg-white/5 text-orange-500 border border-white/5'
      }`}>
        {isUrgent ? <AlertCircle size={32} /> : <Clock size={32} className={!isCritical ? 'animate-pulse' : ''} />}
      </div>
    </div>
  );
};

export default ChampionshipTimer;
