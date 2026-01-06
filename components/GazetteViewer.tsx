
import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  Globe, Landmark, Zap, AlertTriangle, LayoutGrid, Bird, Scale, ShieldAlert,
  Award, User, Star, TrendingUp, X, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Championship, UserRole } from '../types';

interface GazetteViewerProps {
  arena: Championship;
  aiNews: string;
  round: number;
  userRole?: UserRole;
  onClose: () => void;
}

const sanitizeAIContent = (text: string) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const GazetteViewer: React.FC<GazetteViewerProps> = ({ arena, aiNews, round, userRole = 'player', onClose }) => {
  const [activeTab, setActiveTab] = useState<'benchmarking' | 'macro' | 'solvency'>('benchmarking');
  const teams = arena.teams || [];
  const activeEvent = arena.market_indicators?.active_event;
  const isAnonymous = arena.gazeta_mode === 'anonymous' && userRole !== 'tutor' && userRole !== 'admin';
  
  const competitiveRanking = useMemo(() => {
    return teams.map((t, i) => ({
      id: t.id,
      name: isAnonymous ? `Unidade 0${i + 1}` : t.name,
      share: [12.5, 14.2, 11.1, 13.0, 10.5, 15.0, 12.0, 11.7][i] || 12.5,
      profit: [73928, -120500, 45000, 12000, -8000, 95000, 32000, 15000][i] || 0,
      socialScore: [4.8, 3.2, 4.5, 4.1, 2.8, 4.9, 3.9, 4.0][i] || 3.5
    })).sort((a, b) => b.profit - a.profit);
  }, [teams, isAnonymous]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#020617] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[92vh] max-w-6xl w-full relative"
    >
      <header className="bg-slate-950 p-8 border-b border-white/5">
         <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
               <Zap className="text-orange-500" size={32} />
               <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Oracle Gazette</h1>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
         {activeTab === 'benchmarking' && (
           <div className="space-y-12">
              <table className="w-full text-left">
                 <thead className="bg-slate-900 text-slate-500 font-black text-[9px] uppercase tracking-widest border-b border-white/5">
                    <tr>
                       <th className="p-6">Ranking</th>
                       <th className="p-6">Unidade</th>
                       <th className="p-6 text-center">Share</th>
                       <th className="p-6 text-right">Lucro</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 font-mono">
                    {competitiveRanking.map((r, i) => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                         <td className="p-6 text-slate-600">#0{i+1}</td>
                         <td className="p-6 text-white font-black uppercase italic">{r.name}</td>
                         <td className="p-6 text-blue-400 text-center">{r.share.toFixed(1)}%</td>
                         <td className={`p-6 text-right font-black ${r.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                           $ {r.profit.toLocaleString()}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}

         {activeTab === 'macro' && (
           <div className="space-y-8">
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                 <h3 className="text-orange-500 font-black text-[9px] uppercase tracking-widest mb-4">Headline Central</h3>
                 <div className="text-2xl text-white font-medium italic leading-relaxed whitespace-pre-wrap">
                    {sanitizeAIContent(aiNews)}
                 </div>
              </div>
           </div>
         )}
      </main>
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
    {icon} {label}
  </button>
);

export default GazetteViewer;
