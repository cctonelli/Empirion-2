import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2, Maximize2, Bot, User as UserIcon, ShieldCheck } from 'lucide-react';
import { createChatSession } from '../services/gemini';
import { GenerateContentResponse } from '@google/genai';

const GlobalChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Empirion Strategos initialized. I am powered by Gemini 3 Pro reasoning. How shall we optimize your empire today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
      }

      const streamResponse = await chatSessionRef.current.sendMessageStream({ message: userMessage });
      
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
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Strategos core offline. Tactical link severed. Re-attempting connection...' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleChat}
        className="fixed bottom-8 right-8 w-20 h-20 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-blue-600 transition-all z-[100] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Bot size={32} className="group-hover:rotate-12 transition-transform relative z-10" />
        <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-full max-w-[420px] ${isMinimized ? 'h-20' : 'h-[650px] max-h-[85vh]'} bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden transition-all z-[100] animate-in slide-in-from-bottom-8 duration-500 border border-slate-100`}>
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">Empirion Strategos</h3>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Gemini 3 Pro</span>
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 text-white shadow-md'
                }`}>
                  {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] p-5 rounded-[1.5rem] text-[13px] font-medium leading-relaxed shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-white text-slate-800 rounded-tr-none border-slate-100' 
                    : 'bg-slate-900 text-slate-100 border-slate-800 rounded-tl-none'
                }`}>
                  {msg.text || (isLoading && idx === messages.length - 1 ? (
                    <div className="flex gap-1.5 items-center h-4">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                  ) : '')}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex items-center gap-3">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Query strategic core..."
              className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default GlobalChat;
