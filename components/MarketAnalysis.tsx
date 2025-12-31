import React, { useState, useEffect } from 'react';
import { generateMarketAnalysis, performGroundedSearch } from '../services/gemini';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Search, Globe, Link as LinkIcon, Loader2, ArrowRight } from 'lucide-react';

const MarketAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Grounded Intelligence State
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
    <div className="max-w-6xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Intelligence Terminal</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Predictive forecasting and real-time grounded market research.</p>
        </div>
        <button 
          onClick={fetchAnalysis}
          disabled={loading}
          className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm flex items-center gap-3"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          Synchronize Feed
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Forecast Card */}
        <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
          <Sparkles className="absolute top-0 right-0 p-10 text-blue-400 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000" size={300} />
          
          <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                <TrendingUp size={14} className="text-emerald-400" /> Strategic Forecast R4
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-white/10 rounded-full w-full animate-pulse"></div>
                  <div className="h-6 bg-white/10 rounded-full w-5/6 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight text-slate-100 italic">
                  "{analysis}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-4 group/item hover:bg-white/10 transition-colors">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Sector Momentum</span>
                    <span className="text-lg font-black">Bullish (0.84)</span>
                  </div>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-4 group/item hover:bg-white/10 transition-colors">
                  <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Supply Risk</span>
                    <span className="text-lg font-black">Moderate (0.32)</span>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Tips */}
        <div className="space-y-8">
          <div className="premium-card p-10 rounded-[3rem] space-y-6 border-slate-100">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl w-fit">
              <Lightbulb size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Advisor Protocol</h3>
              <p className="text-slate-500 text-sm leading-relaxed mt-4 font-medium">
                Initial reports suggest a 12% increase in regional demand for electronics in Region 04. 
                Consider diverting marketing budgets from Region 02 to maximize this window.
              </p>
            </div>
          </div>
          
          <div className="p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-white shadow-xl shadow-blue-200 space-y-6">
            <Globe size={48} className="opacity-20" />
            <h3 className="text-xl font-black uppercase tracking-tight">Macro Pulse</h3>
            <p className="text-sm font-bold opacity-80 leading-relaxed">
              Global logistics indices are stabilizing. Shipping costs projected to drop 4% next period.
            </p>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group">
              Full Macro Report <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Grounded Intelligence Search */}
      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl">
                 <Search size={28} />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Grounded Intelligence Search</h3>
                 <p className="text-slate-400 font-medium">Verify real-world trends with live Google Search integration.</p>
              </div>
           </div>
        </div>

        <form onSubmit={handleSearch} className="relative z-10 group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for industrial trends, commodity pricing, or sector innovations..."
            className="w-full pl-20 pr-40 py-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-bold text-slate-900 text-lg focus:ring-8 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-6 top-1/2 -translate-y-1/2 px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Query Core'}
          </button>
        </form>

        {searchResult && (
          <div className="animate-in fade-in slide-in-from-top-6 duration-700 space-y-8 relative z-10">
             <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-200 relative">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Grounding Output</span>
                </div>
                <p className="text-slate-800 text-lg leading-relaxed font-semibold mb-10">
                  {searchResult.text}
                </p>
                
                {searchResult.sources.length > 0 && (
                  <div className="pt-8 border-t border-slate-200">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <LinkIcon size={12} className="text-blue-500" /> Intelligence Sources
                    </h5>
                    <div className="flex flex-wrap gap-4">
                       {searchResult.sources.map((source: any, i: number) => (
                         <a 
                           key={i} 
                           href={source.uri} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                         >
                            <Globe size={14} /> {source.title}
                         </a>
                       ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}
        
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Globe size={240} className="text-slate-900" />
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
