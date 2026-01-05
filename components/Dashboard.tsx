import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, Zap, BarChart3, 
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Star, Users,
  ShieldCheck, MessageSquare, Megaphone, Send, Globe, Map as MapIcon,
  Cpu, Newspaper, Landmark, AlertTriangle, ChevronRight, LayoutGrid,
  RefreshCw, RotateCcw, Shield, Box, FileEdit, ClipboardList,
  ArrowRight, X, PenTool, FileText, Eye, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChampionshipTimer from './ChampionshipTimer';
import LiveBriefing from './LiveBriefing';
import DecisionForm from './DecisionForm';
import GazetteViewer from './GazetteViewer';
import BusinessPlanWizard from './BusinessPlanWizard';
import { generateMarketAnalysis, generateGazetaNews } from '../services/gemini';
import { supabase, resetAlphaData, getChampionships, getUserProfile } from '../services/supabase';
import { BlackSwanEvent, ScenarioType, MessageBoardItem, Branch, Championship, UserRole } from '../types';

const Dashboard: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiNews, setAiNews] = useState<string>('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [scenarioType, setScenarioType] = useState<ScenarioType>('simulated');
  const [isAlphaUser, setIsAlphaUser] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [showBusinessPlan, setShowBusinessPlan] = useState(false);
  const [showGazette, setShowGazette] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('player');
  
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeTeamName, setActiveTeamName] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<MessageBoardItem[]>([
    { id: '1', sender: 'Coordenação Central', text: 'Início do Período 2. Abram a folha de decisões.', timestamp: '08:00', isImportant: true },
    { id: '2', sender: 'Strategos AI', text: `Setor ${branch.toUpperCase()}: Analisem o reajuste de matérias-primas planejado.`, timestamp: '10:15' },
  ]);

  const isObserver = userRole === 'observer';

  useEffect(() => {
    const fetchArenaInfo = async () => {
      const champId = localStorage.getItem('active_champ_id');
      const teamId = localStorage.getItem('active_team_id');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getUserProfile(session.user.id);
        if (profile) setUserRole(profile.role);
      }

      if (champId) {
        const { data } = await getChampionships();
        const arena = data?.find(a => a.id === champId);
        if (arena) {
          setActiveArena(arena);
          setActiveTeamId(teamId);
          const team = arena.teams?.find((t: any) => t.id === teamId);
          if (team) setActiveTeamName(team.name);
        }
      }
    };

    const fetchIntelligence = async () => {
      try {
        const [analysis, newsContent] = await Promise.all([
          generateMarketAnalysis(activeArena?.name || 'Arena Empirion Supremo', 1, branch, scenarioType),
          generateGazetaNews({ 
            period: (activeArena?.current_round || 0) + 1, 
            leader: 'Equipe Alpha', 
            inflation: `${activeArena?.market_indicators?.inflationRate || 1.0}%`, 
            scenarioType, 
            focus: [branch] 
          })
        ]);
        setAiInsight(analysis);
        setAiNews(newsContent);
      } catch (err) {
        setAiInsight("Aguardando sincronização neural...");
        setAiNews("Gazeta em manutenção: Aguardando boletim oficial.");
      } finally {
        setIsInsightLoading(false);
      }
    };
    
    const checkAlphaStatus = async () => {
      const isTrial = localStorage.getItem('is_trial_session') === 'true';
      setIsAlphaUser(isTrial);
    };

    fetchArenaInfo();
    fetchIntelligence();
    checkAlphaStatus();
  }, [scenarioType, branch, activeArena?.name, activeArena?.current_round]);

  const handleResetAlpha = async () => {
    if (isObserver) return;
    if (!confirm("Confirmar RESET TOTAL das decisões desta arena?")) return;
    setIsResetting(true);
    try {
      await resetAlphaData();
      alert("ENGINE RESET: Limpeza concluída.");
      window.location.reload();
    } catch (err) { alert("Falha no Reset."); }
    finally { setIsResetting(false); }
  };

  const marketShareOptions: any = {
    chart: { type: 'donut', background: 'transparent' },
    stroke: { show: false },
    colors: ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'],
    labels: ['Sua Unidade', 'Unit 02', 'Unit 03', 'Unit 04', 'Unit 05', 'Unit 06', 'Unit 07', 'Unit 08'],
    legend: { show: false },
    plotOptions: { donut: { size: '75%', labels: { show: true, total: { show: true, label: 'SHARE', color: '#f97316' } } } }
  };

  if (showBusinessPlan) {
    return (
       <div className="animate-in fade-in duration-500">
          <button onClick={() => setShowBusinessPlan(false)} className="fixed top-10 left-10 z-[110] p-4 bg-slate-900 border border-white/10 text-white rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
             <ChevronRight size={14} className="rotate-180" /> Dashboard
          </button>
          <BusinessPlanWizard 
            championshipId={activeArena?.id}
            teamId={activeTeamId || undefined}
            currentRound={activeArena?.current_round || 1}
            onClose={() => setShowBusinessPlan(false)}
          />
       </div>
    );
  }

  if (showDecisionForm) {
    return (
      <div className="animate-in fade-in duration-500">
        <button onClick={() => setShowDecisionForm(false)} className="mb-8 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">
          <ChevronRight size={14} className="rotate-180" /> Voltar para Dashboard
        </button>
        <DecisionForm 
          teamId={activeTeamId || undefined} 
          champId={activeArena?.id} 
          round={(activeArena?.current_round || 0) + 1} 
          userName={activeTeamName || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20 relative">
      
      <AnimatePresence>
         {showGazette && activeArena && (
           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowGazette(false)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              />
              <div className="w-full max-w-7xl relative z-10">
                 <GazetteViewer 
                    arena={activeArena} 
                    aiNews={aiNews} 
                    round={(activeArena?.current_round || 0) + 1} 
                    userRole={userRole}
                    onClose={() => setShowGazette(false)} 
                 />
              </div>
           </div>
         )}
      </AnimatePresence>

      {isAlphaUser && (
        <div className="bg-orange-600 px-6 py-3 -mx-10 -mt-10 flex items-center justify-between shadow-2xl z-50">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg"><Shield size={16} className="text-white" /></div>
              <div>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Sandbox Mode Active</span>
                 <p className="text-[8px] font-bold text-orange-200 uppercase tracking-[0.2em] mt-0.5">Sessão Temporária • Persistência em Trial Tables</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={handleResetAlpha} 
                disabled={isResetting || isObserver} 
                className={`px-4 py-2 bg-slate-950 text-orange-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all flex items-center gap-2 disabled:opacity-50`}
              >
                 {isResetting ? <Loader2 className="animate-spin" size={12}/> : <RotateCcw size={12} />} Limpar Decisões
              </button>
           </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white" size={20} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Arena <span className="text-orange-500">Dashboard</span>
            </h1>
            {isObserver && (
              <div className="ml-4 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center gap-2">
                 <Eye size={12} className="text-blue-400" />
                 <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Observer Mode (Read-Only)</span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-white/5">
             {activeArena?.name || 'Carregando...'} • {activeTeamName || 'Equipe Alpha'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <LiveBriefing />
          {activeArena && (
            <ChampionshipTimer 
              roundStartedAt={activeArena.round_started_at || activeArena.created_at} 
              deadlineValue={activeArena.deadline_value}
              deadlineUnit={activeArena.deadline_unit}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <button 
                onClick={() => !isObserver && setShowDecisionForm(true)}
                className={`p-10 rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col justify-between group transition-all duration-500 overflow-hidden relative min-h-[260px] ${isObserver ? 'bg-slate-900/50 cursor-default grayscale' : 'bg-blue-600 hover:bg-white'}`}
             >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl ${isObserver ? 'bg-slate-800 text-slate-500' : 'bg-white text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                   {isObserver ? <Lock size={28} /> : <FileEdit size={28} />}
                </div>
                <div className="text-left">
                   <h3 className={`text-xl font-black uppercase italic tracking-tighter leading-none ${isObserver ? 'text-slate-600' : 'text-white group-hover:text-slate-950'}`}>Folha de Decisão</h3>
                   <p className={`font-bold uppercase text-[8px] tracking-[0.3em] mt-3 italic ${isObserver ? 'text-slate-700' : 'text-blue-100 group-hover:text-blue-600'}`}>
                      {isObserver ? 'Acesso Restrito' : `Protocolo Ciclo 0${(activeArena?.current_round || 0) + 1}`}
                   </p>
                </div>
             </button>

             <button 
                onClick={() => !isObserver && setShowBusinessPlan(true)}
                className={`p-10 rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col justify-between group transition-all duration-500 overflow-hidden relative min-h-[260px] ${isObserver ? 'bg-slate-900/50 cursor-default grayscale' : 'bg-indigo-600 hover:bg-white'}`}
             >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl ${isObserver ? 'bg-slate-800 text-slate-500' : 'bg-white text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                   {isObserver ? <Lock size={28} /> : <PenTool size={28} />}
                </div>
                <div className="text-left">
                   <h3 className={`text-xl font-black uppercase italic tracking-tighter leading-none ${isObserver ? 'text-slate-600' : 'text-white group-hover:text-slate-950'}`}>Plano de Negócios</h3>
                   <p className={`font-bold uppercase text-[8px] tracking-[0.3em] mt-3 italic ${isObserver ? 'text-slate-700' : 'text-indigo-100 group-hover:text-indigo-600'}`}>
                      {isObserver ? 'Acesso Restrito' : 'Evolução Progressiva Simulation-Ready'}
                   </p>
                </div>
             </button>

             <button 
                onClick={() => setShowGazette(true)}
                className="bg-slate-900 hover:bg-orange-600 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col justify-between group transition-all duration-500 overflow-hidden relative min-h-[260px]"
             >
                <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-orange-600 transition-all shadow-xl">
                   <Newspaper size={28} />
                </div>
                <div className="text-left">
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Gazeta Empirion</h3>
                   <p className="text-slate-400 group-hover:text-white font-bold uppercase text-[8px] tracking-[0.3em] mt-3 italic">
                      Tendências P0{(activeArena?.current_round || 0) + 1}
                   </p>
                </div>
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card p-8 rounded-[3rem] bg-slate-900 border-white/5 flex flex-col items-center justify-center min-h-[300px] shadow-2xl">
              <Chart options={marketShareOptions} series={[12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5]} type="donut" width="100%" />
            </div>

            <div className="md:col-span-2 premium-card p-8 rounded-[3rem] bg-slate-900 border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Cpu size={120} className="text-orange-500" /></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-lg text-white shadow-lg"><Sparkles size={20} /></div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-orange-500 italic">Strategos Advisor</h3>
                 </div>
                 {isInsightLoading ? (
                   <div className="space-y-3"><div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse"></div><div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div></div>
                 ) : (
                   <p className="text-sm font-medium text-slate-300 leading-relaxed font-mono">
                     <span className="text-orange-500 font-black italic">MSG_P{(activeArena?.current_round || 0) + 1}:</span> {aiInsight || "Aguardando início do período para análise regional."}
                   </p>
                 )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="premium-card p-10 rounded-[3rem] bg-slate-900 border-white/5 space-y-10 shadow-2xl">
              <h3 className="text-xl font-black uppercase text-orange-500 flex items-center gap-4 italic leading-none">
                 <div className="p-2 bg-orange-600 rounded-xl shadow-lg"><Target size={20} className="text-white"/></div> Core KPIs
              </h3>
              <div className="space-y-10">
                 <KpiRow label="Lucro Líquido P1" value="$ 73.928" trend="+100%" positive icon={<DollarSign size={16}/>} />
                 <KpiRow label="Equilíbrio Ativo" value="$ 9.176.940" trend="OK" positive icon={<ShieldCheck size={16}/>} />
                 <KpiRow label="Giro de Estoque" value="1.55x" trend="-0.2" positive={false} icon={<Box size={16}/>} />
              </div>
           </div>

           <div className="bg-slate-950 border border-white/5 p-10 rounded-[3rem] flex flex-col h-[400px] shadow-2xl">
              <h3 className="text-lg font-black text-orange-500 uppercase italic mb-8">War Feed</h3>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                 {messages.map(m => (
                   <div key={m.id} className={`p-5 rounded-3xl ${m.isImportant ? 'bg-orange-600/10 border border-orange-500/20' : 'bg-white/5 border border-white/5'}`}>
                      <span className="text-[9px] font-black uppercase text-orange-500 block mb-2">{m.sender}</span>
                      <p className="text-xs font-medium text-slate-200 leading-relaxed italic">{m.text}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KpiRow = ({ label, value, trend, positive, icon }: any) => (
  <div className="flex items-center justify-between group cursor-default">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 text-orange-500 rounded-xl border border-white/5">{icon}</div>
        <div>
           <span className="block text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">{label}</span>
           <span className="text-2xl font-black text-white font-mono tracking-tighter italic">{value}</span>
        </div>
     </div>
     <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{trend}</div>
  </div>
);

export default Dashboard;
