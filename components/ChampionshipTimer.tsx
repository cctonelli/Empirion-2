import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface ChampionshipTimerProps {
  deadline?: string; // ISO string or target timestamp
  onExpire?: () => void;
}

const ChampionshipTimer: React.FC<ChampionshipTimerProps> = ({ deadline, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    // If no deadline, default to 4h 22m for demo/fallback
    const targetDate = deadline ? new Date(deadline).getTime() : Date.now() + (4 * 60 * 60 + 22 * 60 + 15) * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        clearInterval(timer);
        if (onExpire) onExpire();
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      setTimeLeft(formatted);
      setIsCritical(diff < 30 * 60 * 1000); // Critical if less than 30 mins
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  return (
    <div className={`px-6 py-3 rounded-2xl shadow-sm border flex items-center gap-4 transition-all duration-500 ${
      isCritical ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="flex flex-col">
        <span className={`text-[10px] font-black uppercase tracking-widest ${isCritical ? 'text-rose-400' : 'text-slate-400'}`}>
          {isCritical ? 'Urgent Deadline' : 'Cycle Time Remaining'}
        </span>
        <span className="text-2xl font-mono font-black tracking-tighter">{timeLeft}</span>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
        isCritical ? 'bg-rose-100 text-rose-600 animate-bounce' : 'bg-blue-50 text-blue-600'
      }`}>
        {isCritical ? <AlertCircle size={24} /> : <Clock size={24} className="animate-pulse" />}
      </div>
    </div>
  );
};

export default ChampionshipTimer;