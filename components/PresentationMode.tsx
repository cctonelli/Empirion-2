
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, MonitorPlay, Shield, Trophy, Target, BarChart3 } from 'lucide-react';
import { Team, ProjectionResult } from '../types';

interface PresentationProps {
  team: Team;
  projections: ProjectionResult;
  onClose: () => void;
}

const PresentationMode: React.FC<PresentationProps> = ({ team, projections, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'cover',
      title: team.name,
      subtitle: 'Relatório de Gestão Estratégica',
      icon: <Shield size={80} className="text-orange-500" />,
      content: 'Arena de Simulação Industrial Empirion v12.8'
    },
    {
      id: 'kpis',
      title: 'Performance Consolidada',
      subtitle: 'Indicadores de Saúde Financeira',
      icon: <BarChart3 size={80} className="text-blue-500" />,
      content: (
        <div className="grid grid-cols-2 gap-10 w-full max-w-4xl">
           <SlideMetric label="Rating" val={projections.health?.rating || 'AAA'} />
           <SlideMetric label="Lucro Líquido" val={`$ ${(projections.netProfit || 0).toLocaleString()}`} />
           <SlideMetric label="Market Share" val={`${(projections.marketShare || 12.5).toFixed(1)}%`} />
           <SlideMetric label="Endividamento" val={`${(projections.debtRatio || 0).toFixed(1)}%`} />
        </div>
      )
    },
    {
      id: 'verdict',
      title: 'Veredito Estratégico',
      subtitle: 'Análise do Oráculo Strategos',
      icon: <Target size={80} className="text-emerald-500" />,
      content: (
        <p className="text-4xl text-slate-300 italic leading-relaxed text-center max-w-5xl">
          "A expansão tática da Unidade foi sustentada por uma margem bruta resiliente de 32%, permitindo a aquisição de novos ativos sem degradar o rating de crédito."
        </p>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-950 text-white flex flex-col font-sans">
      <header className="p-10 flex justify-between items-center bg-slate-900/50 border-b border-white/5">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-black italic">E</div>
            <span className="font-black tracking-tighter uppercase text-sm">Empirion Oracle Presentation</span>
         </div>
         <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-white rounded-full transition-all">
            <X size={24} />
         </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-20 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.05)_0%,transparent_70%)]" />
         
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentSlide}
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -50 }}
               className="flex flex-col items-center text-center space-y-12 relative z-10 w-full"
            >
               <div className="mb-6">{slides[currentSlide].icon}</div>
               <div className="space-y-4">
                  <h1 className="text-8xl font-black uppercase tracking-tighter italic leading-none">{slides[currentSlide].title}</h1>
                  <h2 className="text-2xl font-black text-orange-500 uppercase tracking-[0.5em]">{slides[currentSlide].subtitle}</h2>
               </div>
               <div className="w-full flex justify-center">{typeof slides[currentSlide].content === 'string' ? <p className="text-3xl text-slate-400 font-medium">{slides[currentSlide].content}</p> : slides[currentSlide].content}</div>
            </motion.div>
         </AnimatePresence>
      </main>

      <footer className="p-10 flex justify-between items-center bg-slate-900/50 border-t border-white/5">
         <button onClick={() => setCurrentSlide(s => Math.max(0, s-1))} className="p-6 bg-white/5 rounded-full hover:bg-white/10 disabled:opacity-20" disabled={currentSlide === 0}>
            <ChevronLeft size={32} />
         </button>
         <div className="flex gap-3">
            {slides.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-orange-500 scale-125 shadow-[0_0_10px_#f97316]' : 'bg-white/10'}`} />
            ))}
         </div>
         <button onClick={() => setCurrentSlide(s => Math.min(slides.length-1, s+1))} className="p-6 bg-white/5 rounded-full hover:bg-white/10 disabled:opacity-20" disabled={currentSlide === slides.length - 1}>
            <ChevronRight size={32} />
         </button>
      </footer>
    </div>
  );
};

const SlideMetric = ({ label, val }: any) => (
  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-center space-y-4">
     <span className="text-sm font-black uppercase text-slate-500 tracking-widest">{label}</span>
     <div className="text-6xl font-black italic text-white font-mono">{val}</div>
  </div>
);

export default PresentationMode;
