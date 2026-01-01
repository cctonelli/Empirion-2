
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, BrainCircuit, Rocket, Lock, Sparkles, 
  ChevronRight, ArrowRight, ShieldCheck, Zap,
  BarChart3, FileSearch, PieChart, CreditCard
} from 'lucide-react';

interface OpalHubProps {
  isPremium: boolean;
  onUpgrade: () => void;
  config?: {
    opal_url: string;
  };
}

const OpalIntelligenceHub: React.FC<OpalHubProps> = ({ isPremium, onUpgrade, config }) => {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  // Mock de fluxos disponíveis no Opal
  const workflows = [
    { id: 'market', title: 'Análise de Mercado 360', icon: <FileSearch />, desc: 'Pesquisa web em tempo real sobre inflação e concorrência.' },
    { id: 'financial', title: 'Auditoria de Fluxo de Caixa', icon: <PieChart />, desc: 'Projeções financeiras multi-rodada com detecção de insolvência.' },
    { id: 'kpi', title: 'Balanced Scorecard IA', icon: <BarChart3 />, desc: 'Geração automática de relatórios de desempenho para acionistas.' }
  ];

  const opalUrl = config?.opal_url || 'https://opal.google/shared-mini-app-placeholder';

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
         <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl text-white shadow-xl">
                  <Workflow size={24} />
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Intelligence <span className="text-indigo-400">Hub</span></h1>
            </div>
            <p className="text-slate-400 font-medium max-w-xl">
               Automatize seus fluxos estratégicos com <span className="text-white font-bold">Google Opal</span>. Crie workflows no-code para dominar a arena.
            </p>
         </div>
         {!isPremium && (
           <button 
             onClick={onUpgrade}
             className="px-8 py-4 bg-amber-500 text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3"
           >
              <Zap size={16} fill="currentColor" /> Desbloquear Assistência Avançada
           </button>
         )}
      </header>

      {!isPremium ? (
        <div className="relative">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 pointer-events-none blur-[2px]">
              {workflows.map(w => (
                <div key={w.id} className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                   <div className="p-4 bg-white/5 rounded-2xl w-fit text-slate-400">{w.icon}</div>
                   <h3 className="text-xl font-black text-white uppercase">{w.title}</h3>
                   <p className="text-xs text-slate-500 leading-relaxed">{w.desc}</p>
                </div>
              ))}
           </div>

           <div className="absolute inset-0 flex items-center justify-center z-20">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full p-12 bg-slate-900 border border-white/10 rounded-[4rem] text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
              >
                 <div className="w-20 h-20 bg-indigo-600/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-500 border border-indigo-500/20">
                    <Lock size={40} />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white uppercase italic">Acesso Restrito</h3>
                    <p className="text-slate-400 text-sm font-medium">Os fluxos avançados de assistência Opal requerem o protocolo de dados <span className="text-indigo-400">Empire Elite</span>.</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold justify-center">
                       <ShieldCheck size={16} className="text-emerald-500" /> Auditoria Multi-step Ativa
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold justify-center">
                       <Rocket size={16} className="text-blue-500" /> Exportação Google Workspace
                    </div>
                 </div>
                 <button onClick={onUpgrade} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-2xl">
                    Upgrade por R$ 29,90 / mês
                 </button>
              </motion.div>
           </div>
        </div>
      ) : (
        <div className="space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {workflows.map(w => (
                <button 
                  key={w.id} 
                  onClick={() => setActiveWorkflow(w.id)}
                  className={`p-8 rounded-[3rem] border transition-all text-left group ${
                    activeWorkflow === w.id ? 'bg-indigo-600 border-indigo-400 shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                   <div className={`p-4 rounded-2xl w-fit mb-6 transition-all ${activeWorkflow === w.id ? 'bg-white text-indigo-600' : 'bg-white/5 text-indigo-400'}`}>
                      {w.icon}
                   </div>
                   <h3 className={`text-xl font-black uppercase mb-3 ${activeWorkflow === w.id ? 'text-white' : 'text-slate-200'}`}>{w.title}</h3>
                   <p className={`text-xs font-medium leading-relaxed ${activeWorkflow === w.id ? 'text-indigo-100' : 'text-slate-500'}`}>{w.desc}</p>
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
              {activeWorkflow ? (
                <motion.div 
                  key={activeWorkflow}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl min-h-[600px] flex flex-col"
                >
                   <div className="p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terminal de Execução Opal IA</span>
                      </div>
                      <button onClick={() => setActiveWorkflow(null)} className="text-[10px] font-black uppercase text-slate-500 hover:text-white">Fechar Instância</button>
                   </div>
                   {/* Iframe Real do Google Opal */}
                   <iframe 
                      src={`${opalUrl}?workflow=${activeWorkflow}&theme=dark`} 
                      className="flex-1 w-full border-0" 
                      title="Google Opal Workspace"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                   />
                </motion.div>
              ) : (
                <div className="p-20 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
                      <BrainCircuit size={40} />
                   </div>
                   <h4 className="text-xl font-black text-slate-500 uppercase tracking-tight italic">Selecione um Workflow para Iniciar o Processamento</h4>
                </div>
              )}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default OpalIntelligenceHub;
