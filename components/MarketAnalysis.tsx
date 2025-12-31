
import React, { useState, useEffect } from 'react';
import { generateMarketAnalysis, performGroundedSearch } from '../services/gemini';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Search, Globe, Link as LinkIcon, Loader2 } from 'lucide-react';

const MarketAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Real-time Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ text: string, sources: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    const result = await generateMarketAnalysis('Tech Frontier 2025', 4, 'industrial');
    setAnalysis(result);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const result = await performGroundedSearch(searchQuery);
    setSearchResult(result);
    setIsSearching(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Market Intelligence</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time data feeds and AI-driven predictive insights.</p>
        </div>
        <button 
          onClick={fetchAnalysis}
          disabled={loading}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Primary AI Analysis */}
      <div className="bg-brand-950 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
        <Sparkles className="absolute top-4 right-4 text-blue-400 opacity-20 group-hover:scale-125 transition-transform duration-1000" size={160} />
        
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
            <Sparkles size={14} className="text-blue-400" /> Scenario Forecaster
          </div>
          
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded-full w-full animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded-full w-5/6 animate-pulse"></div>
            </div>
          ) : (
            <p className="text-2xl leading-relaxed font-bold tracking-tight">
              "{analysis}"
            </p>
          )}

          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl flex items-center gap-3">
                <TrendingUp size={20} className="text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Market Momentum</span>
                  <span className="text-xs font-bold">Bullish Volatility</span>
                </div>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Supply Risk</span>
                  <span className="text-xs font-bold">Moderate Disruption</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Intelligence Search (Grounded Search) */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Globe size={24} />
           </div>
           <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Global Intelligence Search</h3>
              <p className="text-sm font-medium text-slate-400">Query live market data grounded by Google Search.</p>
           </div>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for recent industrial trends, competitor news, or commodity prices..."
            className="w-full pl-16 pr-32 py-6 bg-slate-50 border border-slate-200 rounded-3xl font-semibold text-slate-900 focus:ring-8 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-3 bg-brand-950 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-brand-600 disabled:opacity-50 transition-all shadow-lg"
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        {searchResult && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
             <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grounded Intelligence Result</h4>
                <p className="text-slate-700 leading-relaxed font-medium mb-6">
                  {searchResult.text}
                </p>
                {searchResult.sources.length > 0 && (
                  <div className="pt-6 border-t border-slate-200">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <LinkIcon size={12} /> Verified Sources
                    </h5>
                    <div className="flex flex-wrap gap-3">
                       {searchResult.sources.map((chunk: any, i: number) => {
                          const uri = chunk.web?.uri;
                          const title = chunk.web?.title || 'External Source';
                          if (!uri) return null;
                          return (
                            <a 
                              key={i} 
                              href={uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center gap-2"
                            >
                               <Globe size={10} /> {title}
                            </a>
                          );
                       })}
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="premium-card p-10 rounded-[2.5rem] space-y-6 group">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Lightbulb size={28} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Strategic Tip</h3>
            <p className="text-slate-500 text-sm leading-relaxed mt-2 font-medium">
              Based on the rising costs of raw materials, consider optimizing production efficiency 
              instead of aggressive expansion. A 5% reduction in waste could improve margins by 12% in this round.
            </p>
          </div>
        </div>

        <div className="premium-card p-10 rounded-[2.5rem] space-y-6 group">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Macro Outlook</h3>
            <p className="text-slate-500 text-sm leading-relaxed mt-2 font-medium">
              Global electronics demand is peaking. This is the ideal time to invest in premium 
              marketing segments as consumer price sensitivity is currently at its lowest for the year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
