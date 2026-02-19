import React, { useState, useRef, useEffect } from 'react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { 
  Workflow, BrainCircuit, Rocket, Lock, Sparkles, 
  ChevronRight, ArrowRight, ShieldCheck, Zap,
  BarChart3, FileSearch, PieChart, CreditCard,
  Target, TrendingUp, ShieldAlert, CheckCircle2, Loader2,
  Terminal, MessageSquare, Send, Bot, User as UserIcon,
  Search, Globe, Database, ShieldOff
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
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  
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
          systemInstruction: 'Você é o Strategos Oracle. Responda dúvidas estratégicas com base nos dados do jogo. Não tente acessar ferramentas externas de terceiros.'
        }
      });
      
      const botText = response.text || "Falha na transmissão neural.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      console.error("Oracle Error:", err);
      setMessages(prev => [...prev, { role: 'bot', text: 'Link tático instável. Reconectando...' }]);
    } finally {
      setIsOracleLoading(false);
    }
  };

  const workflows = [
    { id: 'market-360', title: 'Análise de Mercado 360', icon: <FileSearch className="text-blue-400" /> },
    { id: 'financial-audit', title: 'Auditoria Profética', icon: <PieChart className="text-emerald-400" /> },
    { id: 'swot-master', title: 'SWOT Master IA', icon: <BarChart3 className="text-indigo-400" /> }
  ];

  if (isTrial && activeTab === 'workflows') {
     return (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
           <div className="w-24 h-24 bg-rose-600/10 border-2 border-rose-500/30 rounded-[3rem] flex items-center justify-center text-rose-500 shadow-2xl">
              <ShieldOff size={48} />
           </div>
           <div className="space-y-3">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Workflows Externos Bloqueados</h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium italic">
                 No modo Trial, o processamento de dados é mantido 100% no cluster local. Módulos de terceiros e integração Opal estão inativos.
              </p>
           </div>
           <button onClick={() => setActiveTab('oracle')} className="px-10 py-4 bg-orange-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-orange-950 transition-all">Voltar ao Oracle Local</button>
        </div>
     );
  }

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
              <button onClick={() => setActiveTab('oracle')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === 'oracle' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>Strategos Oracle</button>
              {!isTrial && <button onClick={() => setActiveTab('workflows')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'workflows' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>Opal Workflows {!isPremium && <Lock size={10} />}</button>}
            </div>
         </div>
      </header>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'oracle' && (
            <motion.div key="oracle-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
                 <div className="p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Terminal size={18} className="text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Local Neural Engine</span>
                    </div>
                 </div>
                 <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-950/20">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600 shadow-lg shadow-indigo-500/20'}`}>
                            {m.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                         </div>
                         <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-white text-slate-900 rounded-tr-none' : 'bg-slate-800 text-slate-100 border border-white/5 rounded-tl-none'}`}>{m.text}</div>
                      </div>
                    ))}
                 </div>
                 <form onSubmit={handleSendOracle} className="p-6 bg-slate-900 border-t border-white/5 flex gap-3">
                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Solicitar análise direta..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600" />
                    <button type="submit" disabled={isOracleLoading} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-indigo-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"><Send size={20} /></button>
                 </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OpalIntelligenceHub;