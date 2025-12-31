
import React, { useState, useEffect } from 'react';
import { generateMarketAnalysis } from '../services/gemini';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';

const MarketAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalysis = async () => {
    setLoading(true);
    const result = await generateMarketAnalysis('Tech Frontier 2025', 4, 'industrial');
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Market Intelligence</h1>
          <p className="text-slate-500 mt-1">AI-powered insights for current market conditions.</p>
        </div>
        <button 
          onClick={fetchAnalysis}
          disabled={loading}
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-blue-300 opacity-30" size={120} />
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> AI Analysis Engine
          </div>
          
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-5/6 animate-pulse"></div>
            </div>
          ) : (
            <p className="text-xl leading-relaxed font-medium">
              "{analysis}"
            </p>
          )}

          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                <TrendingUp size={18} className="text-green-300" />
                <span className="text-sm">Bullish Trend</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-300" />
                <span className="text-sm">Supply Chain Risk: Medium</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
            <Lightbulb size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Strategic Tip</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Based on the rising costs of raw materials, consider optimizing production efficiency 
            instead of aggressive expansion. A 5% reduction in waste could improve margins by 12% in this round.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Macro Outlook</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Global electronics demand is peaking. This is the ideal time to invest in premium 
            marketing segments as consumer price sensitivity is currently at its lowest for the year.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
