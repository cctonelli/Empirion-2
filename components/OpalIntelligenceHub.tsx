
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, BrainCircuit, Rocket, Lock, Sparkles, 
  ChevronRight, ArrowRight, ShieldCheck, Zap,
  BarChart3, FileSearch, PieChart, CreditCard,
  Target, TrendingUp, ShieldAlert, CheckCircle2, Loader2
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
  const [isUpgrading, setIsUpgrading] = useState(false);

  const workflows = [
    { 
      id: 'market', 
      title: 'Análise de Mercado 360', 
      icon: <FileSearch />, 
      desc: 'Pesquisa web em tempo real sobre inflação e concorrência usando Google Search Grounding.',
      badge: 'Grounded AI'
    },
    { 
      id: 'financial', 
      title: 'Auditoria de Fluxo de Caixa', 
      icon: <PieChart />, 
      desc: 'Projeções financeiras multi-rodada com detecção preditiva de insolvência.',
      badge: 'Predictive'
    },
    { 
      id: 'kpi', 
      title: 'Balanced Scorecard IA', 
      icon: <BarChart3 />, 
      desc: 'Geração automática de relatórios de desempenho e SWOT para o conselho administrativo.',
      badge: 'Master Report'
    }
  ];

  const opalUrl = config?.opal_url || 'https://opal.google/shared-mini-app-placeholder';

  const handleUpgradeClick = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      onUpgrade();
      setIsUpgrading(false);
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
         <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl text-white shadow-xl">
                  <Workflow size={24} />
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Intelligence <span className="text-indigo-400">Hub</span></h1>
            </div>
            <p className="text-slate-400 font-medium max-w-xl">
               Automatize seus fluxos estratégicos com <span className="text-white font-bold">Google Opal Mini-Apps</span>. Crie workflows no-code para dominar a arena industrial e comercial.
            </p>
         </div>
         {!isPremium && (
           <button 
             onClick={handleUpgradeClick}
             disabled={isUpgrading}
             className="px-8 py-4 bg-amber-500 text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3 group disabled:opacity-50"
           >
              {isUpgrading ? <Loader2 className="animate-spin" /> : <Zap size={16} fill="currentColor" className="group-hover:scale-125 transition-transform" />}
              Desbloquear Assistência Elite
           </button>
         )}
      </header>

      {!isPremium ? (
        <div className="relative">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 pointer-events-none blur-[2px] grayscale">
              {workflows.map(w => (
                <div key={w.id} className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                   <div className="p-4 bg-white/5 rounded-2xl w-fit text-slate-400">{w.icon}</div>
                   <h3 className="text-xl font-black text-white uppercase">{w.title}</h3>
                   <p className="text-xs text-slate-500 leading-relaxed">{w.desc}</p>
                </div>
              ))}
           </div>

           <div className="absolute inset-0 flex items-center justify-center z-20 px-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="max-w-md w-full p-12 bg-slate-900 border border-white/10 rounded-[4rem] text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
              >
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                 <div className="w-20 h-20 bg-indigo-600/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-500 border border-indigo-500/20 shadow-inner">
                    <Lock size={40} />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Acesso Restrito</h3>
                    <p className="text-slate-400 text-sm font-medium">Os fluxos avançados de assistência Opal requerem a camada de dados <span className="text-indigo-400">Empire Elite™</span> para processamento multi-step.</p>
                 </div>
                 <div className="space-y-4 pt-4">
                    <FeatureItem icon={<ShieldCheck size={16} className="text-emerald-500" />} label="Auditoria Cognitiva Gemini Pro" />
                    <FeatureItem icon={<TrendingUp size={16} className="text-blue-500" />} label="Integração Real-world Grounding" />
                    <FeatureItem icon={<Rocket size={16} className="text-orange-500" />} label="Exportação Google Sheets & Drive" />
                 </div>
                 <button onClick={handleUpgradeClick} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-2xl active:scale-95">
                    Upgrade por R$ 29,90 / mês
                 </button>
                 <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Cobre sua equipe inteira na arena ativa.</p>
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
                  className={`p-10 rounded-[3.5rem] border transition-all text-left group relative overflow-hidden ${
                    activeWorkflow === w.id ? 'bg-indigo-600 border-indigo-400 shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                   <div className={`p-4 rounded-2xl w-fit mb-8 transition-all ${activeWorkflow === w.id ? 'bg-white text-indigo-600' : 'bg-white/5 text-indigo-400 group-hover:scale-110'}`}>
                      {w.icon}
                   </div>
                   <div className="space-y-3">
                      <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${activeWorkflow === w.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                         {w.badge}
                      </div>
                      <h3 className={`text-xl font-black uppercase italic ${activeWorkflow === w.id ? 'text-white' : 'text-slate-200'}`}>{w.title}</h3>
                      <p className={`text-xs font-medium leading-relaxed ${activeWorkflow === w.id ? 'text-indigo-100' : 'text-slate-500'}`}>{w.desc}</p>
                   </div>
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
              {activeWorkflow ? (
                <motion.div 
                  key={activeWorkflow}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl min-h-[700px] flex flex-col relative"
                >
                   <div className="p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                         <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Opal AI Terminal Instance</span>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sincronizado com Oracle Node {activeWorkflow.toUpperCase()}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => setActiveWorkflow(null)} 
                        className="flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                      >
                         Terminar Sessão
                      </button>
                   </div>
                   <div className="flex-1 bg-slate-800 relative">
                      <iframe 
                        src={`${opalUrl}?workflow=${activeWorkflow}&theme=dark&context=empirion-v5`} 
                        className="absolute inset-0 w-full h-full border-0" 
                        title="Google Opal Workspace"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                   </div>
                   <div className="p-4 bg-slate-900 border-t border-white/5 flex justify-center gap-10">
                      <StatusIndicator label="API CONNECTION" status="STABLE" color="emerald" />
                      <StatusIndicator label="GEMINI REASONING" status="DEEP" color="blue" />
                      <StatusIndicator label="CVM COMPLIANCE" status="AUDITED" color="emerald" />
                   </div>
                </motion.div>
              ) : (
                <div className="p-24 text-center bg-white/[0.02] rounded-[4rem] border border-dashed border-white/10 group hover:bg-white/[0.04] transition-all">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-700 group-hover:scale-110 group-hover:text-indigo-400 transition-all">
                      <BrainCircuit size={48} />
                   </div>
                   <h4 className="text-2xl font-black text-slate-500 uppercase tracking-tight italic">Selecione um Workflow para Iniciar o Processamento</h4>
                   <p className="text-slate-600 font-medium mt-2 max-w-sm mx-auto">Cada workflow consome créditos de IA do seu plano Empire Elite.</p>
                </div>
              )}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const FeatureItem = ({ icon, label }: any) => (
  <div className="flex items-center gap-3 text-xs text-slate-400 font-bold justify-center bg-white/5 p-3 rounded-2xl">
     {icon} {label}
  </div>
);

const StatusIndicator = ({ label, status, color }: any) => (
  <div className="flex items-center gap-2">
     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}:</span>
     <span className={`text-[8px] font-black uppercase tracking-widest ${color === 'emerald' ? 'text-emerald-500' : 'text-blue-500'}`}>{status}</span>
  </div>
);

export default OpalIntelligenceHub;
