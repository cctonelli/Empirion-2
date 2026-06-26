import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Award, 
  Activity, 
  Zap, 
  Smile, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Clock, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface RoundSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundNumber: number; // Ex: 0 para R-0, 1 para R-1, etc.
  history: any[];
  isLockedWaiting?: boolean; // Caso o temporizador tenha expirado e as decisões congeladas
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  isOpen,
  onClose,
  roundNumber,
  history,
  isLockedWaiting = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'financial' | 'operational'>('financial');

  // Encontrar dados da rodada atual e anterior
  const currentData = history.find(h => h.round === roundNumber);
  const previousData = history.find(h => h.round === Math.max(0, roundNumber - 1));

  // Cálculo de mudanças percentuais
  const getGrowth = (current: number, previous: number) => {
    if (!previous || previous === 0) return { percent: 0, text: '---', isPos: true };
    const diff = current - previous;
    const percent = (diff / Math.abs(previous)) * 100;
    return {
      percent,
      text: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
      isPos: percent >= 0
    };
  };

  const equityGrowth = currentData && previousData 
    ? getGrowth(currentData.equity ?? 0, previousData.equity ?? 0)
    : { percent: 0, text: '0.0%', isPos: true };

  const profitGrowth = currentData && previousData
    ? getGrowth(currentData.net_profit ?? 0, previousData.net_profit ?? 0)
    : { percent: 0, text: '0.0%', isPos: true };

  // Engine nativa de Confetes (HTML5 Canvas)
  useEffect(() => {
    if (!isOpen || isLockedWaiting || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#a855f7', '#ffffff'];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Populando partículas (origem esquerda e direita na parte inferior para spray triunfal)
    for (let i = 0; i < 150; i++) {
      const fromLeft = Math.random() > 0.5;
      particles.push({
        x: fromLeft ? 0 : width,
        y: height * 0.8,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (fromLeft ? 1 : -1) * (Math.random() * 15 + 10),
        speedY: -(Math.random() * 20 + 15),
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Gravidade e Resistência do Ar
        p.speedY += 0.5; // gravidade
        p.speedX *= 0.98; // atrito do ar
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        
        // Desenha pequenos cartões/retângulos giratórios
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 1.5);
        ctx.restore();

        // Se sair da tela, remove ou para
        if (p.y > height) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(updateAndDraw);
      }
    };

    updateAndDraw();

    // Som de comemoração de confetes bem sutil ao nascer
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const duration = 0.5;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'triangle';
        // Frequências harmoniosas (Arpejo triunfal em C)
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
        
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }
    } catch (_) {}

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, isLockedWaiting]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop de vidro desfocado */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          id="round_summary_backdrop"
        />

        {/* Canvas de Confetes */}
        {!isLockedWaiting && (
          <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-[100000]"
            id="round_summary_confetti_canvas"
          />
        )}

        {/* Card do Modal */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-700/80 rounded-[2.5rem] shadow-2xl overflow-hidden z-20"
          id="round_summary_modal_card"
        >
          {/* Decoração superior brilhante */}
          <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${isLockedWaiting ? 'from-amber-500 to-orange-600' : 'from-emerald-500 via-teal-400 to-indigo-600'}`} />

          {/* Botão de Fechar */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white transition-all cursor-pointer z-30"
          >
            <X size={20} />
          </button>

          {/* Conteúdo Central */}
          <div className="p-8 lg:p-12 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {isLockedWaiting ? (
              // VISTA: TEMPO ESGOTADO / CONGELADO PELA ARENA
              <div className="text-center space-y-6 py-6" id="locked_waiting_view">
                <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock size={40} className="animate-spin duration-1000" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white uppercase font-sans">
                  Tempo Limite Concluído!
                </h3>
                <p className="text-slate-300 max-w-xl mx-auto text-sm leading-relaxed">
                  O cronômetro fiduciário encerrou para o período **R-{roundNumber < 10 ? '0' : ''}{roundNumber}**. Suas decisões vigentes foram transmitidas com sucesso de maneira síncrona. O Oráculo está aguardando o processamento do Turnover pelo Tutor para liberar os relatórios fiscais e as apurações de mercado do próximo ciclo.
                </p>

                <div className="bg-slate-950/50 border border-white/5 p-6 rounded-2xl max-w-lg mx-auto text-left flex gap-4 items-center">
                  <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                  <p className="text-xs text-slate-400 leading-snug">
                    <span className="font-bold text-slate-200 block mb-1 uppercase tracking-wider">Atenção Competidores</span>
                    Sua equipe não conseguirá alterar as decisões do período R-{roundNumber < 10 ? '0' : ''}{roundNumber} a partir de agora. Aproveite para revisar o planejamento contábil da empresa.
                  </p>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={onClose}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    <CheckCircle2 size={16} /> Entendido, Continuar Cockpit
                  </button>
                </div>
              </div>
            ) : (
              // VISTA: RELATÓRIO E CELEBRAÇÃO DE CONVERSÃO DE RODADA
              <div className="space-y-8" id="round_celebration_view">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xxs font-black uppercase tracking-widest">
                      <Trophy size={11} /> Turno Resolvido com Sucesso
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
                      Resumo Gerencial do Round: {roundNumber < 10 ? '0' : ''}{roundNumber}
                    </h3>
                    <p className="text-sm text-slate-400">
                      O Oráculo e o conselho aprovaram os balanços contábeis, operacionais e fiscais.
                    </p>
                  </div>
                  
                  {/* Selo do Rating */}
                  {currentData?.kpis?.rating && (
                    <div className="bg-slate-800/80 border-2 border-slate-700 rounded-3xl p-4 flex items-center gap-4 shadow-xl">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                        <Award size={24} />
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">Rating Crédito</span>
                        <span className="text-xl font-mono font-black text-slate-100">{currentData.kpis.rating}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seleção de Abas do Resumo */}
                <div className="flex gap-2 border-b border-white/5 pb-1">
                  <button
                    onClick={() => setActiveTab('financial')}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      activeTab === 'financial' 
                        ? 'border-orange-500 text-white' 
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    Desempenho Financeiro
                  </button>
                  <button
                    onClick={() => setActiveTab('operational')}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      activeTab === 'operational' 
                        ? 'border-orange-500 text-white' 
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    Indicadores Operacionais & Climáticos
                  </button>
                </div>

                {activeTab === 'financial' ? (
                  // ABA 1: TABELA FINANCEIRA DE CRESCIMENTO (BENTO GRID)
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {/* CARD: Patrimônio Líquido */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Patrimônio Líquido</span>
                        <div className="text-2xl font-mono font-black text-white">
                          {formatCurrency(currentData?.equity ?? 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
                        <span className="text-xs text-slate-500">Evolução Líquida</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${equityGrowth.isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {equityGrowth.isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {equityGrowth.text}
                        </span>
                      </div>
                    </div>

                    {/* CARD: Lucro Líquido */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Lucro Líquido do Round</span>
                        <div className={`text-2xl font-mono font-black ${(currentData?.net_profit ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(currentData?.net_profit ?? 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
                        <span className="text-xs text-slate-500">Evolução do Lucro</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${profitGrowth.isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {profitGrowth.isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {profitGrowth.text}
                        </span>
                      </div>
                    </div>

                    {/* CARD: EBITDA */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">EBITDA Gerencial</span>
                        <div className="text-2xl font-mono font-black text-orange-400">
                          {formatCurrency(currentData?.kpis?.ebitda ?? currentData?.ebitda ?? 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
                        <span className="text-xs text-slate-500">Liquidez Imediata</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {formatCurrency(currentData?.kpis?.current_cash ?? currentData?.current_cash ?? 0)}
                        </span>
                      </div>
                    </div>

                    {/* CARD: Receita Bruta */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 col-span-1 md:col-span-2 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Faturamento Fiduciário</span>
                          <div className="text-3xl font-mono font-black text-white">
                            {formatCurrency(currentData?.revenue ?? 0)}
                          </div>
                        </div>
                        <div className="px-3.5 py-1 bg-slate-900 border border-white/5 rounded-xl">
                          <span className="text-[7px] text-slate-500 block uppercase font-bold text-center">Unidades Vendidas</span>
                          <span className="text-xs font-mono font-black font-extrabold text-blue-400 block text-center">
                            {(currentData?.kpis?.last_units_sold ?? 0).toLocaleString('pt-BR')} un
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-zinc-500 text-xs mt-4">
                        A receita líquida representa o total de vendas aprovadas no mercado e entregues fiduciariamente.
                      </p>
                    </div>

                    {/* CARD: Diagnóstico Rápido Contábil */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br from-indigo-500/5 to-transparent">
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Auditoria do Balanço</span>
                        <p className="text-xs text-slate-300 leading-relaxed mt-2">
                          Seu Balanço Patrimonial atingiu a Consistência Tripla Fiduciária rígida (Ativo = Passivo + PL).
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold pt-3">
                        <ShieldCheck size={16} /> Contabilidade Validada pelo Oráculo
                      </div>
                    </div>

                  </div>
                ) : (
                  // ABA 2: TABELA OPERACIONAL & CLIMÁTICA (BENTO GRID OPERATIONS)
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {/* CARD: Produtividade Industrial */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Rendimento industrial</span>
                        <div className="text-3xl font-mono font-black text-white">
                          {currentData?.kpis?.productivity_index ?? 100}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
                        <span className="text-xs text-slate-500">Idade Média da Fábrica</span>
                        <span className="text-xs font-bold text-indigo-400">
                          {currentData?.kpis?.machine_age_factor !== undefined ? `x${currentData.kpis.machine_age_factor.toFixed(2)}` : '1.00'}
                        </span>
                      </div>
                    </div>

                    {/* CARD: Clima Organizacional */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Índice Clima / Motivação</span>
                        <div className="text-3xl font-mono font-black text-emerald-400">
                          {currentData?.kpis?.motivation_index !== undefined ? `${(currentData.kpis.motivation_index * 100).toFixed(0)}%` : '100%'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
                        <span className="text-xs text-slate-500">Status Geral Sindicato</span>
                        <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[9px] font-black rounded-lg">
                          {currentData?.kpis?.motivation_level || 'BOM'}
                        </span>
                      </div>
                    </div>

                    {/* CARD: Alerta de Greve Sênior */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Greve Ativa na Fábrica</span>
                        <div className={`text-xl font-black uppercase font-mono ${currentData?.kpis?.strike_activated === 'SIM' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {currentData?.kpis?.strike_activated || 'NÃO'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
                        <span className="text-xs text-slate-500 font-sans">Turnos Operados</span>
                        <span className="text-xs font-mono font-black text-slate-200">
                          Período concluído
                        </span>
                      </div>
                    </div>

                    {/* CARD: Fatores Detalhados de Produtividade */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 col-span-1 md:col-span-3">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-4">Auditoria e Multiplicadores Operacionais</span>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-center">
                          <span className="text-[7px] text-zinc-500 uppercase font-black block mb-1">Treinamento</span>
                          <span className="text-lg font-mono font-bold text-sky-400">
                            x{currentData?.kpis?.training_factor !== undefined ? currentData.kpis.training_factor.toFixed(2) : '1.00'}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-center">
                          <span className="text-[7px] text-zinc-500 uppercase font-black block mb-1">Salário & PPR</span>
                          <span className="text-lg font-mono font-bold text-emerald-400">
                            x{currentData?.kpis?.motivation_factor !== undefined ? currentData.kpis.motivation_factor.toFixed(2) : '1.00'}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-center">
                          <span className="text-[7px] text-zinc-500 uppercase font-black block mb-1">Fadiga (Horas Extras)</span>
                          <span className="text-lg font-mono font-bold text-amber-500">
                            x{currentData?.kpis?.fatigue_factor !== undefined ? currentData.kpis.fatigue_factor.toFixed(2) : '1.00'}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-center">
                          <span className="text-[7px] text-zinc-500 uppercase font-black block mb-1">Insegurança (Demitidos)</span>
                          <span className="text-lg font-mono font-bold text-rose-400">
                            x{currentData?.kpis?.demission_insecurity_factor !== undefined ? currentData.kpis.demission_insecurity_factor.toFixed(2) : '1.00'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Botão de Fechar e Avançar */}
                <div className="flex gap-4 justify-end pt-6 border-t border-white/10">
                  <button 
                    onClick={onClose}
                    className="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Excelente, Ir para decisões de R-{(roundNumber < 10 ? '0' : '') + (roundNumber + 1)}
                  </button>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
  );
};
