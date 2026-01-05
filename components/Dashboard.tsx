import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, BarChart3, 
  Sparkles, Loader2, ShieldCheck, Newspaper, Cpu, 
  ChevronRight, RotateCcw, Shield, FileEdit, PenTool, 
  Eye, Lock, Timer, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChampionshipTimer from './ChampionshipTimer';
import LiveBriefing from './LiveBriefing';
import DecisionForm from './DecisionForm';
import GazetteViewer from './GazetteViewer';
import BusinessPlanWizard from './BusinessPlanWizard';
import { generateMarketAnalysis, generateGazetaNews } from '../services/gemini';
import { supabase, resetAlphaData, getChampionships, getUserProfile } from '../services/supabase';
import { ScenarioType, MessageBoardItem, Branch, Championship, UserRole } from '../types';

const Dashboard: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiNews, setAiNews] = useState<string>('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [scenarioType] = useState<ScenarioType>('simulated');
  const [isAlphaUser, setIsAlphaUser] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [showBusinessPlan, setShowBusinessPlan] = useState(false);
  const [showGazette, setShowGazette] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('player');
  
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeTeamName, setActiveTeamName] = useState<string | null>(null);
  
  const [messages] = useState<MessageBoardItem[]>([
    { id: '1', sender: 'Coordenação Central', text: 'Início do Período 2. Abram a folha de decisões.', timestamp: '08:00', isImportant: true },
    { id: '2', sender: 'Strategos AI', text: `Setor ${branch.toUpperCase()}: Analisem o reajuste de matérias-primas planejado.`, timestamp: '10:15' },
  ]);

  const isObserver = userRole === 'observer';

  // Oracle Fidelity Sincronização v12.8.2
  // Using optional chaining (Escape Hatch strategy) to ensure component stability
  const advancedMetrics = useMemo(() => {
    return activeArena?.advanced_indicators || {
      ciclos: { operacional: 60, financeiro: 35 },
      scissors_effect: { ncg: 150000, gap: -50000 },
      productivity: { oee: 84.2, csat: 9.1 },
      market_share: 12.5
    };
  }, [activeArena]);

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
    
    fetchArenaInfo();
    fetchIntelligence();
    const isTrial = localStorage.getItem('is_trial_session') === 'true';
    setIsAlphaUser(isTrial);
  }, [scenarioType, branch, activeArena?.name, activeArena?.current_round]);

  const handleResetAlpha = async () => {
    if (isObserver) return;
    if (!confirm("Confirmar RESET TOTAL das decisões desta arena?")) return;
    setIsResetting(true);
    try {
      await resetAlphaData();
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
          <button onClick={() => setShowBusinessPlan(false)} className="fixed top-10 left-10 z-[110] p-4 bg-slate-900 border border-white/10 text-white rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl">
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
                 <p className="text-[8px] font-bold text-orange-200 uppercase tracking-[0.2em] mt-0.5">Sessão Temporária v12.8.2 Oracle</p>
              </div>
           </div>
           <button 
             onClick={handleResetAlpha} 
             disabled={isResetting || isObserver} 
             className="px-4 py-2 bg-slate-950 text-orange-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
           >
              {isResetting ? <Loader2 className="animate-spin" size={12}/> : <RotateCcw size={12} />} Limpar Engine
           </button>
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
                 <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Observer Mode</span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-white/5">
             {activeArena?.name || 'Carregando Arena...'} • {activeTeamName || 'Equipe Alpha'}
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
             <ActionCard 
                onClick={() => !isObserver && setShowDecisionForm(true)} 
                icon={<FileEdit size={28}/>}
                title="Folha de Decisão"
                subtitle={isObserver ? 'Acesso Restrito' : `Ciclo 0${(activeArena?.current_round || 0) + 1}`}
                color="blue"
                disabled={isObserver}
             />
             <ActionCard 
                onClick={() => !isObserver && setShowBusinessPlan(true)} 
                icon={<PenTool size={28}/>}
                title="Plano de Negócios"
                subtitle={isObserver ? 'Acesso Restrito' : 'Evolução Progressiva Oracle'}
                color="indigo"
                disabled={isObserver}
             />
             <ActionCard 
                onClick={() => setShowGazette(true)} 
                icon={<Newspaper size={28}/>}
                title="Gazeta Empirion"
                subtitle={`Tendências P0${(activeArena?.current_round || 0) + 1}`}
                color="orange"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <EfficiencyCard 
               label="NCG (Capital de Giro)" 
               val={`$ ${advancedMetrics?.scissors_effect?.ncg?.toLocaleString() || '0'}`} 
               trend={advancedMetrics?.scissors_effect?.gap < 0 ? 'Optimal' : 'Gap Warning'} 
               positive={advancedMetrics?.scissors_effect?.gap < 0}
               icon={<Box size={20}/>}
             />
             <EfficiencyCard 
               label="Ciclo Financeiro" 
               val={`${advancedMetrics?.ciclos?.financeiro || '0'} dias`} 
               trend="Fidelity Stable" 
               positive={true}
               icon={<Timer size={20}/>}
             />
             <EfficiencyCard 
               label={branch === 'industrial' ? "OEE Factory" : "CSAT Index"} 
               val={branch === 'industrial' ? `${advancedMetrics?.productivity?.oee || '0'}%` : `${advancedMetrics?.productivity?.csat || '0'}/10`} 
               trend={activeArena?.current_round === 0 ? "Initial" : "+1.2%"} 
               positive={true}
               icon={<Activity size={20}/>}
             />
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
                   <p className="text-sm font-medium text-slate-300 leading-relaxed font-mono italic">
                     <span className="text-orange-500 font-black">MSG_P{(activeArena?.current_round || 0) + 1}:</span> {aiInsight || "Aguardando sincronização de briefing regional."}
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
                 <KpiRow label="Lucro Líquido" value={activeArena?.current_round === 0 ? "$ 0" : "$ 73.928"} trend={activeArena?.current_round === 0 ? "STABLE" : "+100%"} positive icon={<DollarSign size={16}/>} />
                 <KpiRow label="Rating Oracle" value={activeArena?.current_round === 0 ? "AAA" : "AAA"} trend="Audit OK" positive icon={<ShieldCheck size={16}/>} />
                 <KpiRow label="Market Share" value={`${advancedMetrics?.market_share || 12.5}%`} trend="Target" positive icon={<TrendingUp size={16}/>} />
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

const ActionCard = ({ onClick, icon, title, subtitle, color, disabled }: any) => {
  const baseClasses = `p-10 rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col justify-between group transition-all duration-500 overflow-hidden relative min-h-[260px]`;
  const themeClasses = {
    blue: disabled ? 'bg-slate-900/50 grayscale' : 'bg-blue-600 hover:bg-white',
    indigo: disabled ? 'bg-slate-900/50 grayscale' : 'bg-indigo-600 hover:bg-white',
    orange: 'bg-slate-900 hover:bg-orange-600'
  }[color as 'blue' | 'indigo' | 'orange'];

  return (
    <button onClick={onClick} className={`${baseClasses} ${themeClasses} ${disabled ? 'cursor-default' : ''}`}>
       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl ${disabled ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-900 group-hover:scale-110'}`}>
          {icon}
       </div>
       <div className="text-left">
          <h3 className={`text-xl font-black uppercase italic tracking-tighter leading-none ${color === 'orange' ? 'text-white' : (disabled ? 'text-slate-600' : 'text-white group-hover:text-slate-950')}`}>{title}</h3>
          <p className={`font-bold uppercase text-[8px] tracking-[0.3em] mt-3 italic ${color === 'orange' ? 'text-slate-400 group-hover:text-white' : (disabled ? 'text-slate-700' : 'text-white/70 group-hover:text-slate-500')}`}>{subtitle}</p>
       </div>
    </button>
  );
};

const EfficiencyCard = ({ label, val, trend, positive, icon }: any) => (
  <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[3rem] space-y-6 hover:bg-white/5 transition-all shadow-xl group">
     <div className="flex justify-between items-center">
        <div className="p-3 bg-white/5 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">{icon}</div>
        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{trend}</span>
     </div>
     <div>
        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-2xl font-black text-white font-mono italic">{val}</span>
     </div>
  </div>
);

const KpiRow = ({ label, value, trend, positive, icon }: any) => (
  <div className="flex items-center justify-between group cursor-default">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 text-orange-500 rounded-xl border border-white/5 group-hover:bg-orange-600 group-hover:text-white transition-all">{icon}</div>
        <div>
           <span className="block text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">{label}</span>
           <span className="text-2xl font-black text-white font-mono tracking-tighter italic">{value}</span>
        </div>
     </div>
     <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{trend}</div>
  </div>
);

export default Dashboard;
