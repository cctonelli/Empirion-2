
import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle, Hourglass, Pause } from 'lucide-react';
import { DeadlineUnit } from '../types';

// Sintetizador nativo de alertas sonoros (Fidelidade do Oráculo de Contagem Regressiva)
const playCountdownBeep = (secondsRemaining: number) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    const isFinalSec = secondsRemaining <= 3;
    // Eleva o tom nos segundos finais (3, 2, 1) para efeito cinematográfico de cockpit sênior
    const frequency = isFinalSec ? 1200 : 880; 
    const duration = isFinalSec ? 0.20 : 0.08; 
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Conecta com rampa exponencial de ganho suave para eliminar estalos
    gainNode.gain.setValueAtTime(0.06, ctx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.debug('Aviso fiduciário de áudio bloqueado pelas políticas de interação do navegador:', err);
  }
};

interface ChampionshipTimerProps {
  roundStartedAt?: string; 
  deadlineValue?: number;
  deadlineUnit?: DeadlineUnit;
  onExpire?: () => void;
  createdAt?: string; // Fallback absoluto para arenas recém-criadas sem turnover
  variant?: 'default' | 'compact';
  isPaused?: boolean;
  remainingMsAtPause?: number;
}

const ChampionshipTimer: React.FC<ChampionshipTimerProps> = ({ 
  roundStartedAt, 
  deadlineValue = 7, 
  deadlineUnit = 'days', 
  onExpire, 
  createdAt,
  variant = 'default',
  isPaused = false,
  remainingMsAtPause
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('Sincronizando...');
  const [isCritical, setIsCritical] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const lastBeepSec = useRef<number | null>(null);
  const hasFiredExpire = useRef<boolean>(false);
  const prevTargetDate = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused && remainingMsAtPause !== undefined && remainingMsAtPause !== null) {
      const diff = remainingMsAtPause;
      if (diff <= 0) {
        setTimeLeft('ENCERRADO');
        setIsCritical(true);
        setIsUrgent(true);
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
      setIsCritical(diff < 12 * 60 * 60 * 1000);
      setIsUrgent(diff < 2 * 60 * 60 * 1000);
      return;
    }

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
    
    // Se mudamos de data limite, destrava o disparador
    if (prevTargetDate.current !== targetDate) {
      prevTargetDate.current = targetDate;
      hasFiredExpire.current = false;
    }

    const updateTick = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft('ENCERRADO');
        setIsCritical(true);
        setIsUrgent(true);
        if (onExpire && !hasFiredExpire.current) {
          hasFiredExpire.current = true;
          onExpire();
        }
        return false; // timer finalizado
      }

      // Alerta Sonoro de 10 segundos antes do limite da rodada
      if (diff <= 10000 && diff > 0) {
        const sec = Math.ceil(diff / 1000);
        if (lastBeepSec.current !== sec) {
          lastBeepSec.current = sec;
          playCountdownBeep(sec);
        }
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
      return true;
    };

    // Executa e calcula sincronamente o primeiro tick logo ao montar
    const isRunning = updateTick();

    if (!isRunning) return;

    const timer = setInterval(() => {
      const isStillRunning = updateTick();
      if (!isStillRunning) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [roundStartedAt, createdAt, deadlineValue, deadlineUnit, onExpire, isPaused, remainingMsAtPause]);

  if (variant === 'compact') {
    return (
      <div 
        className={`px-4 py-1.5 rounded-xl border flex items-center gap-4 transition-all duration-500 shadow-lg ${
          isPaused 
            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
            : isUrgent 
            ? 'bg-rose-700/90 border-rose-400 text-white animate-pulse' 
            : isCritical 
            ? 'bg-orange-700/90 border-orange-400 text-white' 
            : 'bg-slate-900/80 border-slate-600/40 text-slate-100'
        }`}
      >
        <div className="flex flex-col min-w-[80px]">
          <span className={`text-[7px] font-black uppercase tracking-[0.2em] mb-0.5 leading-none ${
            isPaused ? 'text-amber-400' : isUrgent || isCritical ? 'text-white/90' : 'text-orange-400'
          }`}>
            {isPaused ? 'CONGELADO' : isUrgent ? 'URGENTE' : isCritical ? 'PRAZO FINAL' : 'RESTA'}
          </span>
          <span className="text-xl font-mono font-black tracking-tighter leading-none">{timeLeft}</span>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md flex-shrink-0 ${
          isPaused ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' :
          isUrgent ? 'bg-white text-rose-700' : 
          isCritical ? 'bg-white text-orange-700' : 
          'bg-white/10 text-orange-400 border border-white/10'
        }`}>
          {isPaused ? <Pause size={20} strokeWidth={2.5} /> : isUrgent ? <AlertCircle size={22} strokeWidth={2.5} /> : <Clock size={22} strokeWidth={2} className={!isCritical ? 'animate-pulse' : ''} />}
        </div>
      </div>
    );
  }

  return (
    <div className={`px-8 py-4 rounded-[2rem] shadow-2xl border transition-all duration-700 flex items-center gap-6 ${
      isPaused ? 'bg-amber-950/85 border-amber-600/30 text-amber-200' :
      isUrgent ? 'bg-rose-600 border-white text-white animate-pulse scale-105' :
      isCritical ? 'bg-orange-600 border-orange-400 text-white' : 
      'bg-slate-900 border-white/10 text-slate-100'
    }`}>
      <div className="flex flex-col">
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${
          isPaused ? 'text-amber-400' : isUrgent || isCritical ? 'text-white' : 'text-orange-500'
        }`}>
          {isPaused ? 'DECISÕES CONGELADAS' : isUrgent ? 'URGENTE: TRANSMITA' : isCritical ? 'PRAZO FINAL' : 'RESTA PARA DECIDIR'}
        </span>
        <span className="text-2xl font-mono font-black tracking-tighter leading-none">{timeLeft}</span>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
        isPaused ? 'bg-amber-600/25 text-amber-400 border border-amber-500/20' :
        isUrgent ? 'bg-white text-rose-600' : 
        isCritical ? 'bg-white text-orange-600' : 
        'bg-white/5 text-orange-500 border border-white/5'
      }`}>
        {isPaused ? <Pause size={28} /> : isUrgent ? <AlertCircle size={32} /> : <Clock size={32} className={!isCritical ? 'animate-pulse' : ''} />}
      </div>
    </div>
  );
};

export default ChampionshipTimer;
