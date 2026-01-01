import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Activity, DollarSign, Target, Zap, Briefcase, Globe, BarChart3, 
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Star, Users, Newspaper,
  AlertTriangle, ChevronRight, Gavel, Landmark, Info
} from 'lucide-react';
import ChampionshipTimer from './ChampionshipTimer';
import { generateMarketAnalysis, generateGazetaNews } from '../services/gemini';

const Dashboard: React.FC = () => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [gazetaNews, setGazetaNews] = useState<string>('Sincronizando agências de notícias...');
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  useEffect(() => {
    const fetchMarketIntelligence = async () => {
      try {
        const [analysis, news] = await Promise.all([
          generateMarketAnalysis('Arena Industrial Alpha', 1, 'industrial'),
          generateGazetaNews({ period: 1 })
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
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                <BarChart3 size={24} />
             </div>
             Empirion War Room
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
            Status Estratégico: Rodada 01 - Engine v5.0 Gold
          </p>
        </div>
        <ChampionshipTimer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Newspaper-style Gazeta Industrial */}
           <div className="bg-white rounded-[3.5rem] border-[3px] border-slate-900 shadow-2xl overflow-hidden flex flex-col md:flex-row group">
              <div className="p-10 bg-slate-50 md:w-80 flex flex-col justify-between border-r-[3px] border-slate-900 transition-colors group-hover:bg-slate-100">
                 <div className="space-y-6">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform group-hover:rotate-0">
                       <Newspaper size={32} />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 uppercase leading-none tracking-tighter">Gazeta Industrial</h3>
                    <div className="h-1 w-full bg-slate-900"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Edição Especial | MVP v5.0</p>
                 </div>
                 <div className="pt-8 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                       <span>Inflação</span>
                       <span className="text-rose-600 font-mono">1.0%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                       <span>Juros TR</span>
                       <span className="text-blue-600 font-mono">2.0%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                       <span>Market Index</span>
                       <span className="text-emerald-600 font-mono">1.04</span>
                    </div>
                 </div>
              </div>
              <div className="p-12 flex-1 space-y-8 bg-white relative">
                 <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">
                       <AlertTriangle size={12} /> Manchete Principal
                    </div>
                    <div className="text-3xl font-serif font-black text-slate-900 leading-tight tracking-tight first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:font-black">
                       {gazetaNews}
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 relative">
                    <div className="absolute top-4 right-6">
                       <Info size={14} className="text-slate-300" />
                    </div>
                    <div>
                       <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">Próximo Período: Fornecedores</span>
                       <span className="text-xl font-black text-rose-600 font-mono">+4,5% (MP A)</span>
                    </div>
                    <div>
                       <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">Próximo Período: Salários</span>
                       <span className="text-xl font-black text-slate-900 font-mono">$ 1.340,00</span>
                    </div>
                 </div>
                 <div className="flex justify-end">
                    <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                      Ver Análise Completa da CVM <ChevronRight size={14}/>
                    </button>
                 </div>
              </div>
           </div>

           {/* AI Oracle Card */}
           <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl border border-white/5">
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Sparkles size={24}/>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Strategos AI Predictive Engine</span>
                          <span className="text-xs font-bold text-slate-400">Analysis Mode: Deep Reasoning (Gemini 3)</span>
                       </div>
                    </div>
                 </div>
                 {isInsightLoading ? (
                    <div className="space-y-4">
                       <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
                       <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse"></div>
                       <div className="h-4 bg-white/5 rounded-full w-4/6 animate-pulse"></div>
                    </div>
                 ) : (
                    <p className="text-2xl font-bold italic leading-relaxed text-slate-100">
                      "{aiInsight}"
                    </p>
                 )}
              </div>
              <div className="absolute -bottom-20 -right-20 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Landmark size={400} />
              </div>
           </div>
        </div>

        {/* Sidebar KPIs and Alerts */}
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 group transition-all hover:shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-4">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Target size={20}/></div>
                 Performance Hub
              </h3>
              <div className="space-y-8">
                 <KpiRow label="Lucro Líquido" value="$ 73.926" trend="+100%" positive icon={<DollarSign size={16}/>} />
                 <KpiRow label="Market Share" value="12.5%" trend="+2.4%" positive icon={<Target size={16}/>} />
                 <KpiRow label="Idade das Máquinas" value="0.5 Per." trend="Ótimo" positive icon={<Zap size={16}/>} />
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-800 to-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <Gavel size={80} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                 <AlertTriangle className="text-amber-400" size={24}/>
                 Risk Monitor
              </h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex gap-4 transition-colors hover:bg-white/10">
                    <Activity className="text-emerald-400 shrink-0" size={20} />
                    <div className="space-y-1">
                       <span className="block text-[10px] font-black uppercase text-blue-300 tracking-widest">Produtividade RH</span>
                       <span className="text-sm font-black text-slate-100">0.97 - Acima da Média</span>
                    </div>
                 </div>
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex gap-4 transition-colors hover:bg-white/10">
                    <AlertTriangle className="text-rose-400 shrink-0" size={20} />
                    <div className="space-y-1">
                       <span className="block text-[10px] font-black uppercase text-blue-300 tracking-widest">Alerta de Insumos</span>
                       <span className="text-sm font-black text-slate-100">Estoque MP A: 1 Período</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
         <div className="px-6 py-2 bg-slate-100 rounded-full flex items-center gap-3 border border-slate-200">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">Empirion Gold Engine v5.0.0</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
         </div>
      </div>
    </div>
  );
};

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