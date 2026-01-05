
import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, Activity, DollarSign, Target, BarChart3, 
  Sparkles, Loader2, ShieldCheck, Newspaper, Cpu, 
  ChevronRight, RotateCcw, Shield, FileEdit, PenTool, 
  Eye, Timer, Box, AlertOctagon, HeartPulse, Gavel,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChampionshipTimer from './ChampionshipTimer';
import LiveBriefing from './LiveBriefing';
import DecisionForm from './DecisionForm';
import GazetteViewer from './GazetteViewer';
import BusinessPlanWizard from './BusinessPlanWizard';
import { generateMarketAnalysis, generateGazetaNews } from '../services/gemini';
import { supabase, getChampionships, getUserProfile } from '../services/supabase';
import { ScenarioType, Branch, Championship, UserRole, CreditRating, InsolvencyStatus, Team, KPIs } from '../types';

const Dashboard: React.FC<{ branch?: Branch }> = ({ branch = 'industrial' }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiNews, setAiNews] = useState<string>('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [scenarioType] = useState<ScenarioType>('simulated');
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [showBusinessPlan, setShowBusinessPlan] = useState(false);
  const [showGazette, setShowGazette] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('player');
  
  const [activeArena, setActiveArena] = useState<Championship | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);

  const currentKpis = useMemo((): KPIs => {
    const baseKpis: KPIs = activeArena?.kpis || {
      ciclos: { pmre: 30, pmrv: 45, pmpc: 46, operacional: 60, financeiro: 35 },
      scissors_effect: { ncg: 150000, ccl: 200000, gap: -50000, is_critical: false },
      productivity: { oee: 84.2, csat: 9.1 },
      market_share: 12.5,
      rating: 'AAA' as CreditRating,
      insolvency_status: 'SAUDAVEL' as InsolvencyStatus,
      banking: { score: 100, rating: 'AAA' as CreditRating, interest_rate: 0.03, credit_limit: 5000000, can_borrow: true },
      equity: 5055447
    };
    
    const k: KPIs = { ...baseKpis };
    
    if (activeTeam) {
      if (!k.banking) k.banking = { score: 100, rating: 'AAA', interest_rate: 0.03, credit_limit: 5000000, can_borrow: true };
      k.banking.credit_limit = activeTeam.credit_limit ?? k.banking.credit_limit;
      k.equity = activeTeam.equity ?? k.equity;
      k.insolvency_status = activeTeam.insolvency_status ?? k.insolvency_status;
    }

    return k;
  }, [activeArena, activeTeam]);

  const isBankrupt = currentKpis.insolvency_status === 'BANKRUPT';
  const isRJ = currentKpis.insolvency_status === 'RJ';
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
          if (team) setActiveTeam(team);
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
            inflation: `${activeArena?.market_indicators?.inflation_rate || 1.0}%`, 
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
  }, [scenarioType, branch, activeArena?.name, activeArena?.current_round]);

  const getStatusColor = (status: InsolvencyStatus) => {
    switch(status) {
      case 'BANKRUPT': return 'bg-slate-950 text-white border-white/20';
      case 'RJ': return 'bg-orange-600 text-white border-orange-400';
      case 'ALERTA': return 'bg-amber-500 text-slate-950 border-amber-300';
      default: return 'bg-emerald-500 text-white border-emerald-400';
    }
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
          userName={activeTeam?.name || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20 relative">
      {isBankrupt && (
        <div className="bg-slate-950 border-2 border-rose-600 p-8 rounded-[3rem] flex items-center justify-between shadow-2xl animate-pulse">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-rose-600 text-white rounded-2xl"><AlertOctagon size={32} /></div>
              <div>
                 <h2 className="text-3xl font-black uppercase text-white italic tracking-tighter">Nodo de Operação Falido</h2>
                 <p className="text-rose-400 font-bold uppercase text-[10px] tracking-widest italic">O Oráculo bloqueou o acesso às decisões comerciais. Aguarde intervenção do Tutor.</p>
              </div>
           </div>
           <HeartPulse className="text-rose-900" size={60} />
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
            <div className={`ml-4 px-4 py-1.5 border rounded-full flex items-center gap-2 ${getStatusColor(currentKpis.insolvency_status)}`}>
               <span className="text-[9px] font-black uppercase tracking-widest">{currentKpis.insolvency_status}</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-white/5">
             {activeArena?.name || 'Sincronizando Node...'} • {activeTeam?.name || 'Unidade Alpha'}
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
                onClick={() => !isObserver && !isBankrupt && setShowDecisionForm(true)} 
                icon={<FileEdit size={28}/>}
                title="Folha de Decisão"
                subtitle={isBankrupt ? 'BLOQUEADO: FALÊNCIA' : (isObserver ? 'Acesso Restrito' : `Protocolo P0${(activeArena?.current_round || 0) + 1}`)}
                color="blue"
                disabled={isObserver || isBankrupt}
             />
             <ActionCard 
                onClick={() => !isObserver && setShowBusinessPlan(true)} 
                icon={<PenTool size={28}/>}
                title="Plano de Negócios"
                subtitle={isObserver ? 'Acesso Restrito' : 'Evolução Oracle'}
                color="indigo"
                disabled={isObserver}
             />
             <ActionCard 
                onClick={() => setShowGazette(true)} 
                icon={<Newspaper size={28}/>}
                title="Gazeta Empirion"
                subtitle={`Oracle Digest P0${(activeArena?.current_round || 0) + 1}`}
                color="orange"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <EfficiencyCard label="NCG (Giro)" val={`$ ${currentKpis?.scissors_effect?.ncg?.toLocaleString() || '0'}`} trend={currentKpis?.scissors_effect?.is_critical ? 'Tesoura!' : 'Estável'} positive={!currentKpis?.scissors_effect?.is_critical} icon={<Box size={20}/>} />
             <EfficiencyCard label="Linha de Crédito" val={`$ ${currentKpis?.banking?.credit_limit?.toLocaleString() || '0'}`} trend={`Custo: ${((currentKpis?.banking?.interest_rate ?? 0) * 100).toFixed(1)}%`} positive={currentKpis?.banking?.can_borrow ?? false} icon={<CreditCard size={20}/>} />
             <EfficiencyCard label="Rating Oracle" val={currentKpis.rating} trend={`Score: ${currentKpis?.banking?.score ?? 0}`} positive={(currentKpis?.banking?.score ?? 0) > 50} icon={<ShieldCheck size={20}/>} />
          </div>

          <div className="md:col-span-2 premium-card p-8 rounded-[3rem] bg-slate-900 border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-2xl min-h-[300px]">
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

        <div className="space-y-8">
           <div className="premium-card p-10 rounded-[3rem] bg-slate-900 border-white/5 space-y-10 shadow-2xl">
              <h3 className="text-xl font-black uppercase text-orange-500 flex items-center gap-4 italic leading-none">
                 <div className="p-2 bg-orange-600 rounded-xl shadow-lg"><Target size={20} className="text-white"/></div> Core KPIs
              </h3>
              <div className="space-y-10">
                 <KpiRow label="Patrimônio (PL)" value={`$ ${currentKpis.equity?.toLocaleString() || '0'}`} trend="Persistent" positive icon={<Box size={16}/>} />
                 <KpiRow label="Solvência" value={currentKpis.insolvency_status} trend="Real-time" positive={!isBankrupt} icon={<HeartPulse size={16}/>} />
                 <KpiRow label="Market Share" value={`${currentKpis?.market_share || 12.5}%`} trend="Target" positive icon={<TrendingUp size={16}/>} />
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showGazette && (
          <div className="fixed inset-0 z-[1000] p-6 bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
             <GazetteViewer arena={activeArena!} aiNews={aiNews} round={activeArena?.current_round || 1} userRole={userRole} onClose={() => setShowGazette(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionCard = ({ onClick, icon, title, subtitle, color, disabled }: any) => {
  const themeClasses = {
    blue: disabled ? 'bg-slate-900/50 grayscale opacity-60' : 'bg-blue-600 hover:bg-white',
    indigo: disabled ? 'bg-slate-900/50 grayscale opacity-60' : 'bg-indigo-600 hover:bg-white',
    orange: 'bg-slate-900 hover:bg-orange-600'
  }[color as 'blue' | 'indigo' | 'orange'];

  return (
    <button onClick={onClick} disabled={disabled} className={`p-10 rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col justify-between group transition-all duration-500 overflow-hidden relative min-h-[260px] ${themeClasses} ${disabled ? 'cursor-not-allowed' : ''}`}>
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
