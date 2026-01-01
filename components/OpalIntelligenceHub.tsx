
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, BrainCircuit, Rocket, Lock, Sparkles, 
  ChevronRight, ArrowRight, ShieldCheck, Zap,
  BarChart3, FileSearch, PieChart, CreditCard,
  Target, TrendingUp, ShieldAlert, CheckCircle2, Loader2,
  Terminal, MessageSquare, Send, Bot, User as UserIcon
} from 'lucide-react';
import { createChatSession } from '../services/gemini';
import { GenerateContentResponse } from '@google/genai';

interface OpalHubProps {
  isPremium: boolean;
  onUpgrade: () => void;
  config?: {
    opal_url: string;
  };
}

const OpalIntelligenceHub: React.FC<OpalHubProps> = ({ isPremium, onUpgrade, config }) => {
  const [activeTab, setActiveTab] = useState<'oracle' | 'workflows'>('oracle');
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  // Oracle Chat State
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Strategos Oracle v5.5 ativo. Como posso otimizar sua arena hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendOracle = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msg = customMsg || input;
    if (!msg.trim() || isOracleLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsOracleLoading(true);

    try {
      if (!chatSessionRef.current) chatSessionRef.current = createChatSession();
      const streamResponse = await chatSessionRef.current.sendMessageStream({ message: msg });
      
      let botText = '';
      setMessages(prev => [...prev, { role: 'bot', text: '' }]);

      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        botText += c.text;
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1].text = botText;
          return last;
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Conexão neural instável. Tente novamente.' }]);
    } finally {
      setIsOracleLoading(false);
    }
  };

  const workflows = [
    { id: 'market', title: 'Análise de Mercado 360', icon: <FileSearch />, desc: 'Real-time grounding via Google Search.', badge: 'Grounded AI' },
    { id: 'financial', title: 'Auditoria de Fluxo', icon: <PieChart />, desc: 'Detecção preditiva de insolvência.', badge: 'Predictive' },
    { id: 'kpi', title: 'SWOT IA', icon: <BarChart3 />, desc: 'Relatório master para o conselho.', badge: 'Executive' }
  ];

  const opalUrl = config?.opal_url || 'https://opal.google/shared-mini-app-placeholder';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
         <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl text-white shadow-xl">
                  <BrainCircuit size={24} />
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Intelligence <span className="text-indigo-400">Hub</span></h1>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('oracle')}
                className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === 'oracle' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
              >
                Strategos Oracle (Core)
              </button>
              <button 
                onClick={() => setActiveTab('workflows')}
                className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'workflows' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
              >
                Opal Workflows {!isPremium && <Lock size={10} />}
              </button>
            </div>
         </div>
         {!isPremium && (
           <button 
             onClick={() => { setIsUpgrading(true); setTimeout(() => { onUpgrade(); setIsUpgrading(false); }, 1000); }}
             className="px-8 py-4 bg-amber-500 text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl flex items-center gap-3"
           >
              {isUpgrading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
              Upgrade para Elite IA
           </button>
         )}
      </header>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'oracle' ? (
            <motion.div 
              key="oracle-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Oracle Terminal */}
              <div className="lg:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
                 <div className="p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Terminal size={18} className="text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Neural Core Terminal</span>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                       <div className="w-2 h-2 rounded-full bg-amber-500/20"></div>
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
                    </div>
                 </div>
                 <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600 shadow-lg shadow-indigo-500/20'}`}>
                            {m.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                         </div>
                         <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-white text-slate-900 rounded-tr-none' : 'bg-slate-800 text-slate-100 border border-white/5 rounded-tl-none'}`}>
                            {m.text || (isOracleLoading && i === messages.length - 1 && 'Processando...')}
                         </div>
                      </div>
                    ))}
                 </div>
                 <form onSubmit={handleSendOracle} className="p-6 bg-slate-900 border-t border-white/5 flex gap-3">
                    <input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Solicitar análise estratégica..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button type="submit" className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-indigo-900 transition-all shadow-lg">
                       <Send size={20} />
                    </button>
                 </form>
              </div>

              {/* Quick Actions (Oracle Side) */}
              <div className="lg:col-span-4 space-y-6">
                 <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Quick Strategic Pulses</h3>
                    <div className="grid grid-cols-1 gap-3">
                       <QuickPulseBtn onClick={() => handleSendOracle(undefined, "Analise meu ponto de equilíbrio atual baseado no último DRE.")} label="Ponto de Equilíbrio" icon={<Target size={14}/>} />
                       <QuickPulseBtn onClick={() => handleSendOracle(undefined, "Quais são os maiores riscos de mercado para a próxima rodada?")} label="Risk Assessment" icon={<ShieldAlert size={14}/>} />
                       <QuickPulseBtn onClick={() => handleSendOracle(undefined, "Sugira um mix de marketing para aumentar meu market share em 5%.")} label="Marketing Mix IA" icon={<TrendingUp size={14}/>} />
                    </div>
                 </div>
                 <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-white shadow-xl space-y-4">
                    <Sparkles className="animate-pulse" />
                    <h4 className="text-lg font-black uppercase italic leading-none">Upgrade para Opal</h4>
                    <p className="text-[11px] font-medium text-indigo-100 opacity-80 leading-relaxed">
                      Desbloqueie fluxos multi-step, pesquisa web em tempo real e exportação automática para Google Sheets.
                    </p>
                    <button onClick={() => setActiveTab('workflows')} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
                      Conhecer Workflows <ArrowRight size={14} />
                    </button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="workflows-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
               {!isPremium ? (
                 <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-30 grayscale blur-[1px]">
                       {workflows.map(w => (
                         <div key={w.id} className="p-10 bg-white/5 border border-white/10 rounded-[3.5rem] min-h-[250px]">
                            <div className="p-4 bg-white/10 rounded-2xl w-fit mb-6">{w.icon}</div>
                            <h3 className="text-xl font-black text-white uppercase">{w.title}</h3>
                         </div>
                       ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="max-w-md w-full p-12 bg-slate-900 border border-white/10 rounded-[4rem] text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                          <div className="w-20 h-20 bg-amber-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20 shadow-inner">
                             <Lock size={40} />
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Workflows Elite</h3>
                             <p className="text-slate-400 text-sm font-medium leading-relaxed">
                               O terminal Opal requer o protocolo <span className="text-indigo-400">Empire Elite™</span> para processamento de alto impacto.
                             </p>
                          </div>
                          <button onClick={onUpgrade} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-2xl">
                             Assinar Elite R$ 29,90/mês
                          </button>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {workflows.map(w => (
                         <button 
                           key={w.id} 
                           onClick={() => setActiveWorkflow(w.id)}
                           className={`p-10 rounded-[3.5rem] border transition-all text-left relative group ${
                             activeWorkflow === w.id ? 'bg-indigo-600 border-indigo-400 shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'
                           }`}
                         >
                            <div className={`p-4 rounded-2xl w-fit mb-8 transition-all ${activeWorkflow === w.id ? 'bg-white text-indigo-600' : 'bg-white/5 text-indigo-400'}`}>
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
                    {activeWorkflow && (
                       <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl min-h-[700px] flex flex-col">
                          <div className="p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] font-black uppercase text-white">Opal AI Instance: {activeWorkflow.toUpperCase()}</span>
                             </div>
                             <button onClick={() => setActiveWorkflow(null)} className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-colors">Encerrar Sessão</button>
                          </div>
                          <iframe 
                             src={`${opalUrl}?workflow=${activeWorkflow}&theme=dark&context=empirion-v5`} 
                             className="flex-1 w-full border-0" 
                             title="Google Opal Workspace"
                             sandbox="allow-scripts allow-same-origin allow-forms"
                          />
                       </motion.div>
                    )}
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const QuickPulseBtn = ({ label, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 transition-all text-left group"
  >
     <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">{icon}</div>
        <span className="text-[11px] font-black uppercase tracking-tight text-slate-300">{label}</span>
     </div>
     <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 transition-all" />
  </button>
);

export default OpalIntelligenceHub;
