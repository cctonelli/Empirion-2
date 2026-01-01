
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, BrainCircuit, Rocket, Lock, Sparkles, 
  ChevronRight, ArrowRight, ShieldCheck, Zap,
  BarChart3, FileSearch, PieChart, CreditCard,
  Target, TrendingUp, ShieldAlert, CheckCircle2, Loader2,
  Terminal, MessageSquare, Send, Bot, User as UserIcon,
  Search, Globe, Database
} from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

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
    { role: 'bot', text: 'Strategos Oracle v5.8 ativo. Como posso otimizar seu império hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendOracle = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msg = customMsg || input;
    if (!msg.trim() || isOracleLoading) return;

    const userMsg = msg.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsOracleLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: 'Você é o Strategos Oracle, a interface de inteligência rápida do Empirion. Sua função é responder dúvidas estratégicas, sugerir táticas de marketing e explicar conceitos contábeis de forma concisa e técnica. Use um tom executivo e futurista.'
        }
      });
      
      const botText = response.text || "Falha na transmissão neural. Tente novamente.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      console.error("Oracle Error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Link tático instável. Reconectando ao núcleo Gemini...' }]);
    } finally {
      setIsOracleLoading(false);
    }
  };

  const workflows = [
    { 
      id: 'market-360', 
      title: 'Análise de Mercado 360', 
      icon: <FileSearch className="text-blue-400" />, 
      desc: 'Grounding via Google Search em tempo real para tendências globais.', 
      badge: 'Grounded AI',
      features: ['Pesquisa Web Ativa', 'Análise de Concorrência Real', 'Previsão de Commodities']
    },
    { 
      id: 'financial-audit', 
      title: 'Auditoria Profética', 
      icon: <PieChart className="text-emerald-400" />, 
      desc: 'Detecção preditiva de insolvência e otimização de fluxo de caixa.', 
      badge: 'Predictive',
      features: ['Análise de Balanço Profunda', 'Simulação de Stress Test', 'Recomendação de Dividendos']
    },
    { 
      id: 'swot-master', 
      title: 'SWOT Master IA', 
      icon: <BarChart3 className="text-indigo-400" />, 
      desc: 'Relatório master executivo para o conselho administrativo.', 
      badge: 'Executive',
      features: ['Exportação PDF/Excel', 'Raciocínio Pro Preview', 'Gráficos de Projeção']
    }
  ];

  const opalUrl = config?.opal_url || 'https://opal.google/shared-mini-app-placeholder';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
         <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
                  <BrainCircuit size={24} />
               </div>
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Intelligence <span className="text-indigo-400">Hub</span></h1>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('oracle')}
                className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === 'oracle' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
              >
                Strategos Oracle (Tier Free)
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
             className="px-8 py-4 bg-amber-500 text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3"
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
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Strategos Core Alpha v5.8</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex gap-1.5 items-center px-3 py-1 bg-white/5 rounded-full border border-white/5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Connection Stable</span>
                       </div>
                       <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                          <div className="w-2 h-2 rounded-full bg-amber-500/20"></div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                       </div>
                    </div>
                 </div>
                 <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-950/20">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600 shadow-lg shadow-indigo-500/20'}`}>
                            {m.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                         </div>
                         <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-white text-slate-900 rounded-tr-none' : 'bg-slate-800 text-slate-100 border border-white/5 rounded-tl-none'}`}>
                            {m.text}
                         </div>
                      </div>
                    ))}
                    {isOracleLoading && (
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse">
                            <Bot size={18} />
                         </div>
                         <div className="p-6 bg-slate-800 border border-white/5 rounded-[2rem] rounded-tl-none flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-indigo-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Processando resposta...</span>
                         </div>
                      </div>
                    )}
                 </div>
                 <form onSubmit={handleSendOracle} className="p-6 bg-slate-900 border-t border-white/5 flex gap-3">
                    <input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Solicitar análise rápida ao Oráculo..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600"
                    />
                    <button type="submit" disabled={isOracleLoading} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-indigo-900 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                       <Send size={20} />
                    </button>
                 </form>
              </div>

              {/* Oracle Perks & Info */}
              <div className="lg:col-span-4 space-y-6">
                 <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Comandos Estratégicos</h3>
                    <div className="grid grid-cols-1 gap-3">
                       <QuickPulseBtn onClick={() => handleSendOracle(undefined, "Analise meu ponto de equilíbrio baseado no último DRE.")} label="Ponto de Equilíbrio" icon={<Target size={14}/>} />
                       <QuickPulseBtn onClick={() => handleSendOracle(undefined, "Quais são os maiores riscos competitivos na Rodada Atual?")} label="Risk Pulse" icon={<ShieldAlert size={14}/>} />
                       <QuickPulseBtn onClick={() => handleSendOracle(undefined, "Sugira um mix de marketing para aumentar meu Share em 3%.")} label="Marketing Mix IA" icon={<TrendingUp size={14}/>} />
                       <QuickPulseBtn onClick={() => handleSendOracle(undefined, "Explique o conceito de TSR (Total Shareholder Return).")} label="Dicionário Financeiro" icon={<Database size={14}/>} />
                    </div>
                 </div>
                 <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-white shadow-xl space-y-4 relative overflow-hidden group">
                    <Sparkles className="absolute -top-10 -right-10 opacity-10 group-hover:scale-150 transition-transform duration-1000" size={150} />
                    <div className="relative z-10">
                      <h4 className="text-lg font-black uppercase italic leading-none">Desbloqueie o Opal</h4>
                      <p className="text-[11px] font-medium text-indigo-100 opacity-80 leading-relaxed mt-4">
                        Workflows multi-step, pesquisa web Google em tempo real e exportação automatizada de auditoria.
                      </p>
                      <button onClick={() => setActiveTab('workflows')} className="mt-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform bg-white/10 px-4 py-2 rounded-full w-fit">
                        Ver Planos <ArrowRight size={14} />
                      </button>
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-30 grayscale blur-[2px] pointer-events-none">
                       {workflows.map(w => (
                         <div key={w.id} className="p-10 bg-white/5 border border-white/10 rounded-[3.5rem] min-h-[300px]">
                            <div className="p-4 bg-white/10 rounded-2xl w-fit mb-6">{w.icon}</div>
                            <h3 className="text-xl font-black text-white uppercase">{w.title}</h3>
                         </div>
                       ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                       <div className="max-w-md w-full p-12 bg-slate-900 border border-white/10 rounded-[4rem] text-center space-y-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500">
                          <div className="w-24 h-24 bg-amber-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20 shadow-inner">
                             <Lock size={48} />
                          </div>
                          <div className="space-y-4">
                             <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Arena Elite (Opal)</h3>
                             <p className="text-slate-400 text-sm font-medium leading-relaxed">
                               O terminal Opal requer o protocolo <span className="text-indigo-400 font-black">Empire Elite™</span> para processamento profundo.
                             </p>
                             <ul className="text-left space-y-3 pt-4">
                               {['Gemini 3 Pro Reasoning (32k tokens)', 'Integração Google Search Grounding', 'Auditoria SWOT Master Profissional'].map(f => (
                                 <li key={f} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                                   <CheckCircle2 size={14} className="text-indigo-500" /> {f}
                                 </li>
                               ))}
                             </ul>
                          </div>
                          <button onClick={onUpgrade} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-2xl shadow-indigo-500/20">
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
                            <div className="space-y-4">
                               <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${activeWorkflow === w.id ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                  {w.badge}
                               </div>
                               <h3 className={`text-xl font-black uppercase italic ${activeWorkflow === w.id ? 'text-white' : 'text-slate-200'}`}>{w.title}</h3>
                               <p className={`text-xs font-medium leading-relaxed ${activeWorkflow === w.id ? 'text-indigo-100' : 'text-slate-500'}`}>{w.desc}</p>
                               
                               <ul className="space-y-2 mt-4">
                                 {w.features.map(f => (
                                   <li key={f} className={`flex items-center gap-2 text-[8px] font-black uppercase ${activeWorkflow === w.id ? 'text-indigo-200' : 'text-slate-600'}`}>
                                      <Zap size={10} fill="currentColor" /> {f}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                         </button>
                       ))}
                    </div>

                    {activeWorkflow && (
                       <motion.div 
                         initial={{ opacity: 0, y: 30 }} 
                         animate={{ opacity: 1, y: 0 }} 
                         className="bg-slate-900 rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl min-h-[800px] flex flex-col"
                       >
                          <div className="p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><Workflow size={18} /></div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Opal Terminal v5.8 Elite</span>
                                  <span className="text-[8px] font-bold text-slate-500 uppercase">Contexto: {activeWorkflow.toUpperCase()} • Grounding: ON</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="hidden md:flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                  <span className="text-[8px] font-black text-slate-400 uppercase">Secure Neural Stream Active</span>
                                </div>
                                <button onClick={() => setActiveWorkflow(null)} className="px-6 py-2 bg-white/5 hover:bg-rose-600/20 hover:text-rose-400 text-slate-500 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">Encerrar Sessão</button>
                             </div>
                          </div>
                          <div className="flex-1 relative bg-slate-950">
                             <iframe 
                                src={`${opalUrl}?workflow=${activeWorkflow}&theme=dark&context=empirion-elite-v5`} 
                                className="absolute inset-0 w-full h-full border-0" 
                                title="Google Opal Premium Terminal"
                                sandbox="allow-scripts allow-same-origin allow-forms"
                             />
                          </div>
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
