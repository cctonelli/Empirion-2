
import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle, Hourglass } from 'lucide-react';
import { DeadlineUnit } from '../types';

interface ChampionshipTimerProps {
  roundStartedAt?: string; 
  deadlineValue?: number;
  deadlineUnit?: DeadlineUnit;
  onExpire?: () => void;
}

const ChampionshipTimer: React.FC<ChampionshipTimerProps> = ({ roundStartedAt, deadlineValue = 7, deadlineUnit = 'days', onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Calculando...');
  const [isCritical, setIsCritical] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  
  // Ref para garantir que o início do tempo não mude se o componente remontar sem novos dados
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // FIX: Se não vier roundStartedAt, não podemos usar Date.now() pois isso causa o "reset" ao atualizar a página.
    // Usamos o valor que veio do banco. Se não houver, o timer fica em "Calculando" até os dados chegarem.
    if (!roundStartedAt) {
       setTimeLeft('Sincronizando...');
       return;
    }

    startTimeRef.current = new Date(roundStartedAt).getTime();
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
        setTimeLeft('PERÍODO ENCERRADO');
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
      setIsCritical(diff < 24 * 60 * 60 * 1000); // Alerta laranja < 24h
      setIsUrgent(diff < 1 * 60 * 60 * 1000);   // Alerta pulsante < 1h
    }, 1000);

    return () => clearInterval(timer);
  }, [roundStartedAt, deadlineValue, deadlineUnit, onExpire]);

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
          {isUrgent ? 'Transmissão Crítica' : isCritical ? 'Prazo Próximo' : 'Tempo para Decisão'}
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
