import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  MessageSquare, 
  Star, 
  ChevronRight, 
  ShieldCheck, 
  Activity, 
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getPublicReports, submitCommunityVote, supabase } from '../services/supabase';
import { Championship, CommunityCriteria } from '../types';

interface CommunityViewProps {
  championship: Championship;
  onBack: () => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ championship, onBack }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedTeams, setVotedTeams] = useState<Set<string>>(new Set());
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const { data } = await getPublicReports(championship.id, championship.current_round);
      setReports(data || []);
      setLoading(false);
    };
    fetchReports();
  }, [championship]);

  const handleVote = async (teamId: string) => {
    setSubmitting(true);
    // Fix: Casting auth to any to resolve property missing error in this environment
    const { data: { session } } = await (supabase.auth as any).getSession();
    
    const voteData = {
      championship_id: championship.id,
      round: championship.current_round,
      company_alias: reports.find(r => r.team_id === teamId)?.alias || 'Empresa Anônima',
      user_id: session?.user?.id || null,
      ratings: ratings,
      comment: comment
    };

    const { error } = await submitCommunityVote(voteData);
    if (!error) {
      setVotedTeams(prev => new Set(prev).add(teamId));
      setSelectedTeam(null);
      setRatings({});
      setComment('');
    } else {
      console.error("Evaluation Error:", error.message);
      alert("Falha ao registrar voto. Protocolo Oracle interrompido.");
    }
    setSubmitting(false);
  };

  const criteria: CommunityCriteria[] = championship.config?.votingCriteria || [
    { id: 'innovation', label: 'Innovation', weight: 0.2 },
    { id: 'sustainability', label: 'Sustainability (ESG)', weight: 0.2 },
    { id: 'resilience', label: 'Economic Resilience', weight: 0.2 },
    { id: 'strategy', label: 'Strategic Clarity', weight: 0.4 }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Community Feed</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Public Observer Access</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Community Arena</h1>
          <p className="text-slate-500 mt-2 font-medium">Evaluate current market leaders and influence the final standings.</p>
        </div>
        <button onClick={onBack} className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Exit Arena</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {reports.length === 0 ? (
            <div className="p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
              <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest">No reports published for this round yet.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.team_id} className={`premium-card p-10 rounded-[3.5rem] flex flex-col md:flex-row gap-10 transition-all ${selectedTeam?.team_id === report.team_id ? 'ring-4 ring-blue-100 border-blue-600' : ''}`}>
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-4">
                    <span className="text-3xl font-black">{report.alias?.[0] || 'E'}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Team Reference</span>
                  <span className="text-lg font-black text-slate-900">{report.alias || 'Empresa Anônima'}</span>
                </div>

                <div className="flex-1 space-y-6">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Share</span>
                         <span className="text-lg font-black text-blue-600">{(report.kpis?.marketShare || 0).toFixed(1)}%</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Motivation</span>
                         <span className="text-lg font-black text-slate-900">{report.kpis?.motivation || 'Regular'}</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">EBITDA</span>
                         <span className="text-lg font-black text-emerald-600">${(report.statements?.dre?.operatingProfit || 0).toLocaleString()}</span>
                      </div>
                   </div>
                   
                   <p className="text-slate-500 text-sm italic font-medium">"Strategic focus on high-efficiency nodes in South-Alpha region while maintaining a conservative debt profile."</p>
                   
                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      {votedTeams.has(report.team_id) ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                           <CheckCircle2 size={16} /> Evaluation Submitted
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedTeam(report)}
                          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                          Cast Your Vote <Star size={14} className="fill-current" />
                        </button>
                      )}
                      <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        View Full P&L <ChevronRight size={14} />
                      </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="space-y-8">
           {selectedTeam ? (
             <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl space-y-10 animate-in slide-in-from-right-8 duration-500 sticky top-10">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">Active Evaluation</h3>
                   <p className="text-slate-400 text-xs mt-1 font-medium">Voting for: {selectedTeam.alias}</p>
                </div>

                <div className="space-y-8">
                   {criteria.map((c) => (
                     <div key={c.id} className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{c.label}</span>
                           <span className="text-lg font-black text-blue-400">{ratings[c.id] || 0}</span>
                        </div>
                        <input 
                          type="range" min="1" max="10" step="1"
                          value={ratings[c.id] || 1}
                          onChange={e => setRatings(prev => ({ ...prev, [c.id]: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                     </div>
                   ))}

                   <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Strategy Commentary</span>
                      <textarea 
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Why did you choose these scores? (Optional)"
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                      />
                   </div>
                </div>

                <button 
                  onClick={() => handleVote(selectedTeam.team_id)}
                  disabled={submitting || Object.keys(ratings).length < criteria.length}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Synchronize Vote'}
                </button>
             </div>
           ) : (
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto">
                   <Users size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Observer Role</h3>
                   <p className="text-slate-500 text-sm leading-relaxed mt-4 font-medium">
                     As a community judge, your scores represent the "Market Opinion". They influence 30% of the final tournament ranking.
                   </p>
                </div>
                <div className="pt-6 border-t border-slate-50 space-y-4">
                   <div className="flex items-center gap-3 justify-center text-slate-400 text-[10px] font-black uppercase">
                      <Globe size={14} /> Global Influence active
                   </div>
                </div>
             </div>
           )}
        </aside>
      </div>
    </div>
  );
};

export default CommunityView;