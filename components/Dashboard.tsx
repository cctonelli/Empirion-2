
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
  const [gazetaNews, setGazetaNews] = useState<string>('Carregando manchetes do mercado...');
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
        setAiInsight("Tactical feed compromised. Check reserves.");
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
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Activity size={24} />
             </div>
             Empirion Terminal
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Strategic Status: Período 1 - Modelo Bernard</p>
        </div>
        <ChampionshipTimer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[3.5rem] border border-slate-900 border-4 shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 bg-slate-50 md:w-80 flex flex-col justify-between border-r border-slate-900">
                 <div className="space-y-4">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                       <Newspaper size={28} />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 uppercase leading-none tracking-tighter">Gazeta Industrial</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edição #902 | Ano 2025</p>
                 </div>
                 <div className="pt-8 space-y-4 border-t border-slate-200">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-rose-600">
                       <span>Inflação P01</span>
                       <span>1.0%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-blue-600">
                       <span>TR Mensal</span>
                       <span>2.0%</span>
                    </div>
                 </div>
              </div>
              <div className="p-12 flex-1 space-y-8">
                 <div className="space-y-4">
                    <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest">Manchete do Período</span>
                    <div className="text-2xl font-serif font-black text-slate-900 leading-tight">
                       {gazetaNews}
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative">
                    <div className="absolute top-4 right-6">
                       <Info size={14} className="text-slate-300" />
                    </div>
                    <div>
                       <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">Previsão MP A (P2)</span>
                       <span className="text-xl font-black text-rose-600">+4,5%</span>
                    </div>
                    <div>
                       <span className="block text-[9px] font-black text-slate-400 uppercase mb-2">Salário Base (P2)</span>
                       <span className="text-xl font-black text-slate-900">$ 1.340</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Sparkles size={20}/></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Strategos Predictive Engine</span>
                 </div>
                 {isInsightLoading ? (
                    <div className="h-20 animate-pulse bg-white/5 rounded-2xl w-full"></div>
                 ) : (
                    <p className="text-xl font-bold italic leading-relaxed text-slate-100">"{aiInsight}"</p>
                 )}
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Landmark size={240} />
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-3"><Target size={20} className="text-blue-600"/> Dashboard KPIs</h3>
              <div className="space-y-6">
                 <KpiRow label="Net Profit" value="$ 73.926" trend="+100%" positive />
                 <KpiRow label="Market Share" value="12.5%" trend="+2.4%" positive />
                 <KpiRow label="Machine Age" value="0.5 Per." trend="Optimum" positive />
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Gavel size={60} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-8">Industrial Alerts</h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm flex gap-4">
                    <AlertTriangle className="text-amber-400 shrink-0" size={20} />
                    <div className="space-y-1">
                       <span className="block text-[9px] font-black uppercase text-blue-200">Risco de Greve</span>
                       <span className="text-xs font-bold text-slate-100">Nível: Mínimo (3%)</span>
                    </div>
                 </div>
                 <div className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm flex gap-4">
                    <Activity className="text-emerald-400 shrink-0" size={20} />
                    <div className="space-y-1">
                       <span className="block text-[9px] font-black uppercase text-blue-200">Produtividade</span>
                       <span className="text-xs font-bold text-slate-100">Atual: 0.97</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <footer className="text-center pt-8">
         <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Empirion v4.9.0-GOLD-BUILD-2025</span>
      </footer>
    </div>
  );
};

const KpiRow = ({ label, value, trend, positive }: any) => (
  <div className="flex items-center justify-between group">
     <div>
        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-lg font-black text-slate-900">{value}</span>
     </div>
     <div className={`px-2 py-1 rounded-md text-[8px] font-black ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend}
     </div>
  </div>
);

export default Dashboard;
