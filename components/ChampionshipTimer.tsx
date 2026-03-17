
// components/ChampionshipTimer.tsx
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ChampionshipTimerProps {
  roundStartedAt?: string | null;
  createdAt?: string | null;
  deadlineValue?: number;
  deadlineUnit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  variant?: 'compact' | 'default';
}

const ChampionshipTimer: React.FC<ChampionshipTimerProps> = ({
  roundStartedAt,
  createdAt,
  deadlineValue = 60,
  deadlineUnit = 'minutes',
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!deadlineValue) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      let endTime: number;

      const getUnitMs = (unit: string) => {
        switch (unit) {
          case 'months': return 30 * 24 * 3600000;
          case 'weeks': return 7 * 24 * 3600000;
          case 'days': return 24 * 3600000;
          case 'hours': return 3600000;
          case 'minutes': return 60000;
          default: return 60000;
        }
      };

      const duration = deadlineValue * getUnitMs(deadlineUnit);

      if (roundStartedAt) {
        const start = new Date(roundStartedAt).getTime();
        endTime = start + duration;
      } else if (createdAt) {
        const start = new Date(createdAt).getTime();
        endTime = start + duration;
      } else {
        endTime = now + duration; // fallback
      }

      const diff = Math.max(0, endTime - now);
      setTimeLeft(diff);
      setIsUrgent(diff < 300000); // < 5 minutos → urgente
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [roundStartedAt, createdAt, deadlineValue, deadlineUnit]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-xl border text-sm font-mono font-bold tracking-tight transition-all ${
      isExpired 
        ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse' 
        : isUrgent 
        ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 animate-pulse' 
        : 'bg-slate-900/70 border-slate-600/40 text-slate-200'
    }`}>
      <Clock size={16} className={isUrgent || isExpired ? 'text-inherit' : 'text-slate-400'} />
      
      <div className="flex items-baseline gap-1">
        {isExpired ? (
          <span className="text-rose-400 font-black uppercase tracking-wider text-xs">ENCERRADO</span>
        ) : (
          <>
            <span className="text-lg font-black">{formatTime(timeLeft)}</span>
            {isUrgent && <AlertTriangle size={12} className="text-amber-400 animate-pulse" />}
          </>
        )}
      </div>
    </div>
  );
};

export default ChampionshipTimer;
