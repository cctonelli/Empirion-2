import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2, Maximize2, Bot, User as UserIcon } from 'lucide-react';
import { createChatSession } from '../services/gemini';
import { GenerateContentResponse } from '@google/genai';

const GlobalChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Empirion Strategic Core active. I am utilizing Gemini 3 Pro reasoning to analyze your current position. How can I optimize your empire today?' }
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
      setMessages(prev => [...prev, { role: 'bot', text: 'Simulation kernel panic. My neural links were severed temporarily. Please re-state your query.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleChat}
        className="fixed bottom-8 right-8 w-20 h-20 bg-brand-950 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-110 hover:bg-brand-600 transition-all z-[100] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Sparkles size={28} className="group-hover:rotate-12 transition-transform relative z-10" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-full max-w-[400px] ${isMinimized ? 'h-20' : 'h-[600px] max-h-[80vh]'} bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden transition-all z-[100] animate-in slide-in-from-bottom-4 duration-500 border border-slate-100`}>
      {/* Header */}
      <div className="p-6 bg-brand-950 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Strategic Core</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
               <span className="text-[9px] opacity-60 uppercase font-black tracking-widest">Gemini 3 Pro Active</span>
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
          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-brand-950 text-white shadow-sm'
                }`}>
                  {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-white text-slate-700 rounded-tr-none border-slate-100' 
                    : 'bg-brand-950 text-slate-100 border-brand-900 rounded-tl-none'
                }`}>
                  {msg.text || (isLoading && idx === messages.length - 1 ? (
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  ) : '')}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex items-center gap-3">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Query strategic insights..."
              className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-semibold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 bg-brand-950 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-950/10"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default GlobalChat;
