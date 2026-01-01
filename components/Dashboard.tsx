
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Activity, DollarSign, Target, Zap, Briefcase, Globe, BarChart3, 
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Star, Users, Newspaper,
  AlertTriangle, ChevronRight, Gavel, Landmark, Info, Flame, Newspaper as NewspaperIcon,
  ShieldCheck, Leaf, MessageSquare, Megaphone, Send
} from 'lucide-react';
import ChampionshipTimer from './ChampionshipTimer';
import { generateMarketAnalysis, generateGazetaNews } from '../services/gemini';
import { BlackSwanEvent, ScenarioType, MessageBoardItem } from '../types';

const Dashboard: React.FC = () => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [gazetaNews, setGazetaNews] = useState<string>('Sincronizando agências de notícias...');
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<BlackSwanEvent | null>(null);
  const [scenarioType, setScenarioType] = useState<ScenarioType>('simulated');
  
  // Bernard Fidelity features
  const [messages, setMessages] = useState<MessageBoardItem[]>([
    { id: '1', sender: 'Coordenador', text: 'Sejam bem-vindos à Arena Industrial P1. O mercado está volátil!', timestamp: '08:00', isImportant: true },
    { id: '2', sender: 'Strategos AI', text: 'Alerta: Preço da MP A subiu 4.5% no mercado global.', timestamp: '10:15' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMarketIntelligence = async () => {
      try {
        const [analysis, news] = await Promise.all([
          generateMarketAnalysis('Arena Industrial Alpha', 1, 'industrial', scenarioType),
          generateGazetaNews({ period: 1, leader: 'Empresa 8', inflation: '1.0%', scenarioType })
        ]);
        setAiInsight(analysis);
        setGazetaNews(news);
      } catch (err) {
        setAiInsight("Link tático comprometido. Verifique suas reservas.");
        setGazetaNews("Erro na transmissão da Gazeta. Aguardando novo período.");
      } finally {
        setIsInsightLoading(false);
      }
    };
    fetchMarketIntelligence();
  }, [scenarioType]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: MessageBoardItem = {
      id: Math.random().toString(),
      sender: 'Sua Equipe',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([msg, ...messages]);
    setNewMessage('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      {/* Dynamic Market Ticker with Stock Prices */}
      <div className="bg-slate-900 overflow-hidden h-10 flex items-center border-b border-white/10 -mx-8 -mt-8 mb-8">
        <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap gap-12 text-[10px] font-black uppercase tracking-widest text-blue-400">
          <TickerItem label="Bolsa (IBOV)" value="128.450" change="+1.2%" />
          <TickerItem label="Ação EMP-08" value="1.04" change="+4.2%" color="text-emerald-400" />
          <TickerItem label="Ação EMP-01" value="0.98" change="-1.5%" color="text-rose-400" />
          <TickerItem label="Cotação MP A" value="20.20" change="+4.5%" color="text-rose-400" />
          <TickerItem label="Dólar" value="5.24" change="-0.8%" color="text-emerald-400" />
          <TickerItem label="Inflação P1" value="1.0%" change="0.0%" color="text-slate-400" />
          <TickerItem label="Ação EMP-05" value="1.12" change="+0.5%" color="text-emerald-400" />
          {/* Duplicated for smooth infinite scroll */}
          <TickerItem label="Bolsa (IBOV)" value="128.450" change="+1.2%" />
          <TickerItem label="Ação EMP-08" value="1.04" change="+4.2%" color="text-emerald-400" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                <BarChart3 size={24} />
             </div>
             Empirion War Room
          </h1>
          <div className="flex items-center gap-3">
             <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">
               Status Estratégico: Rodada 01 - Engine v5.2 GOLD
             </p>
             <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${scenarioType === 'real' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {scenarioType === 'real' ? 'Grounded AI Scenario' : 'Simulated Protocol'}
             </span>
          </div>
        </div>
        <ChampionshipTimer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Newspaper-style Gazeta Industrial */}
           <div className="bg-white rounded-[3.5rem] border-[3px] border-slate-900 shadow-2xl overflow-hidden flex flex-col group min-h-[450px]">
              <div className="p-8 border-b-[3px] border-slate-900 bg-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 text-white rounded-xl">
                       <NewspaperIcon size={24} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 uppercase leading-none tracking-tighter italic">Gazeta Industrial</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Órgão Oficial de Informação do Setor • v5.2 GOLD</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="block text-[10px] font-black text-slate-900 uppercase">P01 • Jan/2026</span>
                 </div>
              </div>
              
              <div className="flex-1 p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="md:col-span-2 space-y-6">
                    <div className="text-4xl font-serif font-black text-slate-900 leading-[1.1] tracking-tight first-letter:text-7xl first-letter:float-left first-letter:mr-4 first-letter:font-black first-letter:leading-[0.8] first-letter:text-slate-900">
                       {gazetaNews}
                    </div>
                    <div className="h-[1px] bg-slate-100 w-full"></div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                          <TrendingUp size={18} />
                       </div>
                       <p className="text-xs font-bold text-slate-600 leading-tight italic">Mural SIND: Investimento recorde em P&D na Região 9 gera expectativa de novos produtos.</p>
                    </div>
                 </div>
                 
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-6 h-fit self-start">
                    <h4 className="text-[11px] font-black uppercase text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                       <Landmark size={14} className="text-blue-500" /> Bolsa de Valores
                    </h4>
                    <div className="space-y-4">
                       <StockRow symbol="EMPR 08" price="1.04" up />
                       <StockRow symbol="EMPR 01" price="0.98" />
                       <StockRow symbol="EMPR 05" price="1.12" up />
                    </div>
                 </div>
              </div>
           </div>

           {/* Mural de Recados (Bernard Fidelity Message Board) */}
           <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-xl flex flex-col h-[500px]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 text-white rounded-xl">
                       <Megaphone size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mural do Coordenador</h3>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                 {messages.map(m => (
                   <div key={m.id} className={`p-5 rounded-3xl ${m.isImportant ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50'}`}>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest">{m.sender}</span>
                         <span className="text-[8px] font-bold text-slate-400">{m.timestamp}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">{m.text}</p>
                   </div>
                 ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[3.5rem] flex gap-3">
                 <input 
                   type="text" 
                   value={newMessage} 
                   onChange={e => setNewMessage(e.target.value)}
                   placeholder="Enviar recado ao mural..." 
                   className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-blue-100 outline-none" 
                 />
                 <button type="submit" className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <Send size={18} />
                 </button>
              </form>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 group transition-all hover:shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-4">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Target size={20}/></div>
                 Strategic Hub
              </h3>
              <div className="space-y-8">
                 <KpiRow label="Lucro Líquido" value="$ 73.926" trend="+100%" positive icon={<DollarSign size={16}/>} />
                 <KpiRow label="Qualidade Produto" value="1.08" trend="+0.04" positive icon={<Sparkles size={16}/>} />
                 <KpiRow label="Reputação Score" value="82.4" trend="+4.1" positive icon={<Star size={16}/>} />
              </div>
           </div>

           <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <ShieldCheck size={80} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                 <Leaf className="text-emerald-400" size={24}/>
                 ESG & Social (v5.2)
              </h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex gap-4 transition-colors hover:bg-white/10">
                    <Activity className="text-emerald-400 shrink-0" size={20} />
                    <div className="space-y-1">
                       <span className="block text-[10px] font-black uppercase text-blue-300 tracking-widest">Motivation Index</span>
                       <span className="text-sm font-black text-slate-100">88% - Excellent</span>
                    </div>
                 </div>
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex gap-4 transition-colors hover:bg-white/10">
                    <Users className="text-blue-400 shrink-0" size={20} />
                    <div className="space-y-1">
                       <span className="block text-[10px] font-black uppercase text-blue-300 tracking-widest">Layoffs Impact</span>
                       <span className="text-sm font-black text-slate-100">0.0 - Stability Achieved</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const TickerItem = ({ label, value, change, color = "text-white" }: any) => (
  <div className="flex items-center gap-3">
    <span className="text-slate-500">{label}</span>
    <span className={`font-mono font-black ${color}`}>{value}</span>
    <span className={`font-mono text-[8px] ${change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{change}</span>
  </div>
);

const StockRow = ({ symbol, price, up }: { symbol: string, price: string, up?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-black text-slate-400">{symbol}</span>
    <div className="flex items-center gap-2">
       <span className="text-sm font-black text-slate-900 font-mono">{price}</span>
       {up ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-rose-500" />}
    </div>
  </div>
);

const KpiRow = ({ label, value, trend, positive, icon }: any) => (
  <div className="flex items-center justify-between group cursor-default">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
           {icon}
        </div>
        <div>
           <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
           <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{value}</span>
        </div>
     </div>
     <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend}
     </div>
  </div>
);

export default Dashboard;
