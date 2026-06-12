
import React, { useState, useEffect, useMemo } from 'react';
import * as Router from 'react-router-dom';
const { useLocation, useNavigate } = Router as any;
import { 
  Plus, Trash2, ArrowLeft, Command, Users, Globe, 
  X, Palette, Menu as MenuIcon, Save, AtSign, Phone, FileCode, UserPlus, UserMinus, Shield,
  Trophy, Settings, ShieldAlert, Sparkles, Landmark, ArrowRight, Activity, LayoutDashboard,
  PenTool, Newspaper, History, Settings2, Rocket, Lock, ChevronLeft, ChevronRight, Zap, CheckCircle2,
  RefreshCw, Loader2, User, AlertOctagon, Flame, Factory, ShoppingCart, Briefcase, Tractor, DollarSign, Hammer,
  LayoutGrid, FileJson, Languages, Database, Play, Pause, CheckSquare
} from 'lucide-react';
import { 
  getChampionships, 
  deleteChampionship, 
  supabase,
  getUserProfile,
  getAllUsers,
  provisionDemoEnvironment,
  processRoundTurnover,
  updateEcosystem,
  updatePageContent
} from '../services/supabase';
import { generateBlackSwanEvent } from '../services/gemini';
import { Championship, UserProfile, MenuItemConfig, Team, BlackSwanEvent, Branch } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import GazetteViewer from './GazetteViewer';
import TrialWizard from './TrialWizard';
import ChampionshipTimer from './ChampionshipTimer';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { APP_VERSION, MENU_STRUCTURE, CHAMPIONSHIP_TEMPLATES, DEFAULT_INDUSTRIAL_CHRONOGRAM, DEFAULT_PAGE_CONTENT } from '../constants';

type TutorView = 'dashboard' | 'teams' | 'decisions' | 'intervention' | 'gazette';

const SYSTEM_TUTOR_ID = '00000000-0000-0000-0000-000000000000';

const AdminCommandCenter: React.FC<{ preTab?: string }> = ({ preTab = 'tournaments' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingEvent, setIsGeneratingEvent] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  
  // CMS State
  const [cmsPage, setCmsPage] = useState('landing');
  const [cmsLang, setCmsLang] = useState('pt');
  const [cmsData, setCmsData] = useState<string>('');
  const [isCmsSaving, setIsCmsSaving] = useState(false);

  // Fluxo de Wizard
  const [showWizard, setShowWizard] = useState(false);
  const [isPickingTemplate, setIsPickingTemplate] = useState(false);
  const [isCreatingTrial, setIsCreatingTrial] = useState(false);
  
  const [tutorView, setTutorView] = useState<TutorView>('dashboard');
  const [isTimerExpired, setIsTimerExpired] = useState(false);

  // Custom force expire modal states
  const [showForceExpireModal, setShowForceExpireModal] = useState(false);
  const [checkingTeamsLoading, setCheckingTeamsLoading] = useState(false);
  const [pendingTeams, setPendingTeams] = useState<{ id: string; name: string }[]>([]);

  // Estados para os novos modais modernos de Turnover (v2026.105)
  const [showTurnoverConfirmModal, setShowTurnoverConfirmModal] = useState(false);
  const [showTurnoverSuccessModal, setShowTurnoverSuccessModal] = useState(false);
  const [showTurnoverErrorModal, setShowTurnoverErrorModal] = useState(false);
  const [turnoverErrorDetails, setTurnoverErrorDetails] = useState<string | null>(null);
  const [turnoverSuccessRound, setTurnoverSuccessRound] = useState<number | null>(null);

  useEffect(() => {
    setIsTimerExpired(false);
  }, [selectedArena?.id]);

  // Sentinela fiduciário redundante que verifica a integridade temporal do round a cada 2 segundos
  useEffect(() => {
    if (!selectedArena) return;
    
    const verificarExpiracaoTempo = () => {
      // Se a arena terminou todas as rodadas, quem cuida é o painel de torneio concluído
      const isFinished = selectedArena.current_round >= (selectedArena.total_rounds || 6);
      if (isFinished) {
        setIsTimerExpired(true);
        return;
      }

      if (selectedArena.config?.is_paused) {
        const remaining = selectedArena.config?.remaining_ms_at_pause ?? 0;
        if (remaining <= 0) {
          setIsTimerExpired(true);
        }
        return;
      }
      
      const start = selectedArena.round_started_at || selectedArena.created_at;
      if (!start) return;
      
      const startTime = new Date(start).getTime();
      let durationMs = 0;
      const value = selectedArena.deadline_value ?? 7;
      const unit = selectedArena.deadline_unit ?? 'days';
      
      switch (unit) {
        case 'hours': durationMs = value * 60 * 60 * 1000; break;
        case 'days': durationMs = value * 24 * 60 * 60 * 1000; break;
        case 'weeks': durationMs = value * 7 * 24 * 60 * 60 * 1000; break;
        case 'months': durationMs = value * 30 * 24 * 60 * 60 * 1000; break;
        default: durationMs = 7 * 24 * 60 * 60 * 1000;
      }
      
      const hasPassed = Date.now() >= (startTime + durationMs);
      if (hasPassed) {
        setIsTimerExpired(true);
      }
    };

    verificarExpiracaoTempo();

    // Sonda periódica ativa no cockpit do tutor para liberar o turnover de forma reativa
    const intervalId = setInterval(verificarExpiracaoTempo, 2000);
    return () => clearInterval(intervalId);
  }, [selectedArena]);

  const isAdmin = profile?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await (supabase.auth as any).getSession();
      const userId = session?.user?.id || SYSTEM_TUTOR_ID;
      const prof = await getUserProfile(userId);
      setProfile(prof);
      
      const { data } = await getChampionships();
      if (data) {
         setChampionships(data);
         const params = new URLSearchParams(location.search);
         
         // Lógica para abrir o Wizard automaticamente se solicitado via URL
         if (params.get('mode') === 'new_trial' && !showWizard) {
            setShowWizard(true);
         }

         const isCreatingNew = params.get('mode') === 'new_trial' || isPickingTemplate || showWizard;
         if (!isCreatingNew) {
           const storedArenaId = localStorage.getItem('active_champ_id');
           if (storedArenaId) {
              const found = data.find(c => c.id === storedArenaId);
              if (found) setSelectedArena(found);
           }
         }
      }
      
      if (activeTab === 'users' && prof?.role === 'admin') {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      }

      if (activeTab === 'cms') {
        loadCmsData('landing', 'pt');
      }
    } catch (err) { console.error("Sync Error:", err); } finally { setLoading(false); }
  };

  const loadCmsData = async (slug: string, lang: string) => {
     setCmsPage(slug);
     setCmsLang(lang);
     const { data } = await supabase.from('site_content').select('content').eq('page_slug', slug).eq('locale', lang).maybeSingle();
     if (data) {
        setCmsData(JSON.stringify(data.content, null, 2));
     } else {
        setCmsData(JSON.stringify(DEFAULT_PAGE_CONTENT[slug] || {}, null, 2));
     }
  };

  const saveCms = async () => {
     if (!cmsData.trim()) return;
     setIsCmsSaving(true);
     try {
        const parsed = JSON.parse(cmsData);
        const { error } = await updatePageContent(cmsPage, cmsLang, parsed);
        if (error) throw error;
        alert("PROTOCOLO CMS SALVO: Alterações de UI propagadas para a nuvem.");
     } catch (err: any) {
        alert(`FALHA NA EDIÇÃO: JSON Inválido ou Erro de Rede. ${err.message}`);
     } finally {
        setIsCmsSaving(false);
     }
  };

  const seedDefaults = async () => {
     if (!confirm("Sincronizar Defaults? Isso populará a tabela site_content com os textos locais v13.2.")) return;
     setIsCmsSaving(true);
     try {
        for (const [slug, content] of Object.entries(DEFAULT_PAGE_CONTENT)) {
           await updatePageContent(slug, 'pt', content);
        }
        alert("SITE CONTENT POPULADO COM SUCESSO.");
        loadCmsData(cmsPage, cmsLang);
     } catch (err: any) {
        alert(`FALHA NO SEED: ${err.message}`);
     } finally {
        setIsCmsSaving(false);
     }
  };

  useEffect(() => { fetchData(); }, [activeTab, location.search]);

  const handleBlackSwan = async () => {
    if (!selectedArena || isGeneratingEvent) return;
    setIsGeneratingEvent(true);
    try {
      const event: BlackSwanEvent = await generateBlackSwanEvent(selectedArena.branch);
      if (confirm(`DESEJA EXECUTAR EVENTO: "${event.title}"?\n\n${event.description}\n\nImpacto: ${event.impact}`)) {
         const nextRound = selectedArena.current_round + 1;
         const currentMacro = selectedArena.round_rules?.[nextRound] || selectedArena.market_indicators;
         const updatedMacro = {
            ...currentMacro,
            inflation_rate: (currentMacro.inflation_rate || 1) + event.modifiers.inflation,
            demand_variation: (currentMacro.demand_variation || 0) + event.modifiers.demand,
            interest_rate_tr: (currentMacro.interest_rate_tr || 2) + event.modifiers.interest,
            is_black_swan: true,
            black_swan_title: event.title,
            black_swan_description: event.description
         };
         await updateEcosystem(selectedArena.id, { round_rules: { ...(selectedArena.round_rules || {}), [nextRound]: updatedMacro } }, !!selectedArena.is_trial);
         alert("CISNE NEGRO INTEGRADO AO PRÓXIMO TURNOVER.");
         fetchData();
      }
    } catch (err) { alert("Falha ao gerar evento neural."); } finally { setIsGeneratingEvent(false); }
  };

  const handleTurnover = async () => {
    if (!selectedArena || isProcessing) return;
    const currentRoundLabel = (selectedArena?.current_round ?? 0) + 1;
    setTurnoverSuccessRound(currentRoundLabel);
    setShowTurnoverConfirmModal(true);
  };

  const confirmRunTurnover = async () => {
    setShowTurnoverConfirmModal(false);
    if (!selectedArena) return;
    const currentRoundLabel = (selectedArena?.current_round ?? 0) + 1;
    setIsProcessing(true);
    try {
      const res = await processRoundTurnover(selectedArena.id, selectedArena.current_round, !!selectedArena.is_trial);
      if (res.success) { 
        setTurnoverSuccessRound(currentRoundLabel);
        setShowTurnoverSuccessModal(true); 
        fetchData(); 
        const maxRounds = selectedArena.total_rounds || 6;
        if (currentRoundLabel >= maxRounds) {
          setTutorView('dashboard');
        }
      } else { 
        throw new Error(res.error); 
      }
    } catch (err: any) { 
      console.error("[CRITICAL] Falha no fechamento do período:", err);
      setTurnoverErrorDetails(err?.message || JSON.stringify(err));
      setShowTurnoverErrorModal(true);
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleTogglePause = async () => {
    if (!selectedArena) return;
    const isPaused = !!selectedArena.config?.is_paused;
    const config = selectedArena.config || {};
    
    // Calcular a duração atual em ms para achar o targetDate
    let durationMs = 0;
    const deadlineVal = selectedArena.deadline_value ?? 7;
    const deadlineUnit = selectedArena.deadline_unit ?? 'days';
    
    switch(deadlineUnit) {
      case 'hours': durationMs = deadlineVal * 60 * 60 * 1000; break;
      case 'days': durationMs = deadlineVal * 24 * 60 * 60 * 1000; break;
      case 'weeks': durationMs = deadlineVal * 7 * 24 * 60 * 60 * 1000; break;
      case 'months': durationMs = deadlineVal * 30 * 24 * 60 * 60 * 1000; break;
      default: durationMs = 7 * 24 * 60 * 60 * 1000;
    }

    if (!isPaused) {
      // Pausar: calcular quanto tempo restava para salvar no banco
      const start = new Date(selectedArena.round_started_at || selectedArena.created_at || '').getTime();
      const targetDate = start + durationMs;
      const remainingMs = Math.max(0, targetDate - Date.now());
      
      const updatedConfig = {
        ...config,
        is_paused: true,
        paused_at: new Date().toISOString(),
        remaining_ms_at_pause: remainingMs
      };
      
      await updateEcosystem(selectedArena.id, { config: updatedConfig }, !!selectedArena.is_trial);
      setSelectedArena({ ...selectedArena, config: updatedConfig });
    } else {
      // Despausar: ajustar a data inicial para alinhar com o tempo restante salvo
      const remainingMs = config.remaining_ms_at_pause || 0;
      const newRoundStartedAt = new Date(Date.now() + remainingMs - durationMs).toISOString();
      
      const updatedConfig = {
        ...config,
        is_paused: false,
        paused_at: null,
        remaining_ms_at_pause: null
      };

      await updateEcosystem(selectedArena.id, { 
        round_started_at: newRoundStartedAt,
        config: updatedConfig 
      }, !!selectedArena.is_trial);
      
      setSelectedArena({ 
        ...selectedArena, 
        round_started_at: newRoundStartedAt,
        config: updatedConfig 
      });
    }
  };

  const openForceExpireConfirmation = async () => {
    if (!selectedArena) return;
    setCheckingTeamsLoading(true);
    try {
      const isTrial = !!selectedArena.is_trial;
      const teamsTable = isTrial ? 'trial_teams' : 'teams';
      const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';
      const targetRound = selectedArena.current_round + 1;

      // Buscar as equipes inscritas nesta arena
      const { data: teamsData } = await supabase
        .from(teamsTable)
        .select('id, name, is_bot')
        .eq('championship_id', selectedArena.id);

      // Buscar decisões registradas para este round atual
      const { data: decisionsData } = await supabase
        .from(decisionsTable)
        .select('team_id')
        .eq('championship_id', selectedArena.id)
        .eq('round', targetRound);

      const submittedTeamIds = new Set((decisionsData || []).map(d => d.team_id));

      // Filtrar as equipes (por convenção, apenas equipes de jogadores humanos, is_bot !== true) que não entregaram
      const pending = (teamsData || [])
        .filter(t => !t.is_bot && !submittedTeamIds.has(t.id))
        .map(t => ({ id: t.id, name: t.name }));

      setPendingTeams(pending);
      setShowForceExpireModal(true);
    } catch (err) {
      console.error("[CRITICAL] Falha ao verificar decisões pendentes:", err);
      setPendingTeams([]);
      setShowForceExpireModal(true);
    } finally {
      setCheckingTeamsLoading(false);
    }
  };

  const confirmForceExpire = async () => {
    setShowForceExpireModal(false);
    if (!selectedArena) return;
    
    let durationMs = 0;
    const deadlineVal = selectedArena.deadline_value ?? 7;
    const deadlineUnit = selectedArena.deadline_unit ?? 'days';
    
    switch(deadlineUnit) {
      case 'hours': durationMs = deadlineVal * 60 * 60 * 1000; break;
      case 'days': durationMs = deadlineVal * 24 * 60 * 60 * 1000; break;
      case 'weeks': durationMs = deadlineVal * 7 * 24 * 60 * 60 * 1000; break;
      case 'months': durationMs = deadlineVal * 30 * 24 * 60 * 60 * 1000; break;
      default: durationMs = 7 * 24 * 60 * 60 * 1000;
    }

    const expiredRoundStartedAt = new Date(Date.now() - durationMs - 5000).toISOString();
    const config = selectedArena.config || {};
    const updatedConfig = {
      ...config,
      is_paused: false,
      paused_at: null,
      remaining_ms_at_pause: null
    };

    await updateEcosystem(selectedArena.id, { 
      round_started_at: expiredRoundStartedAt,
      config: updatedConfig 
    }, !!selectedArena.is_trial);

    setSelectedArena({ 
      ...selectedArena, 
      round_started_at: expiredRoundStartedAt,
      config: updatedConfig 
    });
  };

  const selectBranchTemplate = (branch: Branch) => {
    if (branch === 'industrial') { setIsPickingTemplate(false); setShowWizard(true); } 
    else { alert(`PROTOCOLO ${branch.toUpperCase()} BLOQUEADO: Utilize o Template Industrial no momento.`); }
  };

  if ((selectedArena || isCreatingTrial) && !showWizard && !isPickingTemplate) {
    const arenaName = selectedArena?.name || "Strategos Trial Engine";
    return (
      <div className="flex flex-col h-full bg-[#020617] relative overflow-hidden">
        <header className="shrink-0 z-[2000] bg-slate-900/80 border-b border-white/10 px-8 py-3 backdrop-blur-3xl flex justify-between items-center shadow-xl">
           <div className="flex items-center gap-6">
              <button onClick={() => { setSelectedArena(null); setIsCreatingTrial(false); navigate('/app/admin'); }} className="text-slate-500 hover:text-white transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest"><ArrowLeft size={14}/> Sair</button>
              <div className="h-4 w-px bg-white/10" />
              {selectedArena && (
                <div className="flex items-center gap-3">
                  <ChampionshipTimer 
                    variant="compact"
                    roundStartedAt={selectedArena.round_started_at}
                    deadlineValue={selectedArena.deadline_value}
                    deadlineUnit={selectedArena.deadline_unit}
                    createdAt={selectedArena.created_at}
                    isPaused={selectedArena.config?.is_paused}
                    remainingMsAtPause={selectedArena.config?.remaining_ms_at_pause}
                    onStatusChange={setIsTimerExpired}
                    isTournamentFinished={selectedArena.current_round >= (selectedArena.total_rounds || 6)}
                  />
                  
                  {/* Botões do Tutor para Pausar e Concluir / Terminar o Round */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/5 shadow-inner">
                    <button 
                       onClick={handleTogglePause}
                       title={selectedArena.config?.is_paused ? "Retomar contagem de tempo" : "Pausar contagem de tempo"}
                       className={`p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
                         selectedArena.config?.is_paused 
                           ? 'bg-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:bg-amber-400' 
                           : 'text-slate-400 hover:text-white hover:bg-white/5'
                       }`}
                    >
                       {selectedArena.config?.is_paused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                    </button>
                    <button 
                       onClick={openForceExpireConfirmation}
                       disabled={checkingTeamsLoading}
                       title="Concluir tempo (Zerar Temporizador)"
                       className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-35 rounded-lg transition-all active:scale-90 flex items-center justify-center cursor-pointer"
                    >
                       {checkingTeamsLoading ? <Loader2 size={12} className="animate-spin text-orange-500" /> : <CheckSquare size={12} />}
                    </button>
                  </div>
                </div>
              )}
              <h1 className="text-xs font-black text-white uppercase italic tracking-widest">Arena <span className="text-orange-500">{arenaName}</span></h1>
           </div>
           <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/5">
              <ArenaNavBtn active={tutorView === 'dashboard'} onClick={() => setTutorView('dashboard')} label="Cockpit" icon={<LayoutDashboard size={12}/>} />
              <ArenaNavBtn active={tutorView === 'teams'} onClick={() => setTutorView('teams')} label="Equipes" icon={<Users size={12}/>} />
              <ArenaNavBtn active={tutorView === 'intervention'} onClick={() => setTutorView('intervention')} label="Intervenção" icon={<Zap size={12}/>} />
              <ArenaNavBtn active={tutorView === 'gazette'} onClick={() => setTutorView('gazette')} label="Gazeta" icon={<Newspaper size={12}/>} />
           </div>
           <div className="flex items-center gap-4">
              <button onClick={handleBlackSwan} disabled={isGeneratingEvent} className="px-6 py-2 bg-rose-600/10 border border-rose-500/30 text-rose-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 active:scale-95">
                {isGeneratingEvent ? <Loader2 size={12} className="animate-spin"/> : <AlertOctagon size={12}/>} Cisne Negro (IA)
              </button>
              {selectedArena && selectedArena.current_round >= (selectedArena.total_rounds || 6) ? (
                <button 
                  disabled={true} 
                  title="Torneio Finalizado! Todas as rodadas foram concluídas."
                  className="px-6 py-2 bg-slate-800 text-slate-500 border border-white/5 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-not-allowed flex items-center gap-2"
                >
                  <Trophy size={12} className="text-yellow-500 shrink-0"/> Torneio Concluído
                </button>
              ) : (
                <button 
                  onClick={handleTurnover} 
                  disabled={isProcessing || !isTimerExpired} 
                  title={!isTimerExpired ? "O turnover só pode ser processado após o encerramento ou a conclusão (zeramento) do temporizador de round." : "Processar a virada de round e inicializar o próximo ciclo"}
                  className={`px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 border ${
                    isTimerExpired && !isProcessing
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-xl shadow-emerald-500/20 animate-[pulse_2s_infinite] cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed opacity-40 shadow-none'
                  }`}
                >
                  {isProcessing ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>} Turnover R-0{(selectedArena?.current_round ?? 0) + 1}
                </button>
              )}
           </div>
        </header>
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 max-w-[1600px] mx-auto w-full relative z-10">
          <AnimatePresence>
            {showForceExpireModal && (
              <div className="fixed inset-0 z-[7000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="max-w-xl w-full bg-[#0b1329] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative text-left"
                >
                   <div className="p-8 space-y-6">
                     {/* Header com Ícone e Título */}
                     <div className="flex items-start gap-4">
                       <div className="p-3 bg-orange-600/10 text-orange-500 rounded-xl">
                         <AlertOctagon size={24} className="animate-pulse" />
                       </div>
                       <div className="space-y-1">
                         <h3 className="text-lg font-black text-white uppercase tracking-wider italic">Antecipar Término do Round</h3>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocolo de Emergência do Tutor</p>
                       </div>
                     </div>

                     {/* Corpo do Texto Dinâmico */}
                     <div className="space-y-4">
                       {pendingTeams.length > 0 ? (
                         <div className="space-y-4">
                           <p className="text-sm text-slate-100 leading-relaxed text-center">
                             Tem certeza que deseja antecipar o término do tempo do round?<br />
                             <span className="text-rose-400 font-extrabold uppercase mt-1 inline-block">
                               {pendingTeams.length === 1 
                                 ? `A Equipe "${pendingTeams[0].name}"`
                                 : `As Equipes ${pendingTeams.map(t => `"${t.name}"`).join(', ')}`
                               } não concluiu suas decisões!
                             </span><br />
                             <span className="text-slate-400 text-xs mt-1 inline-block">
                               O temporizador será fechado imediatamente para todas as equipes, impossibilitando novas decisões.
                             </span>
                           </p>

                           <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl space-y-2">
                             <p className="text-[10px] text-rose-400 font-black uppercase tracking-wider text-center">Equipes Pendentes:</p>
                             <div className="flex flex-wrap gap-2 justify-center">
                               {pendingTeams.map((team) => (
                                 <span 
                                   key={team.id} 
                                   className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-black uppercase rounded-lg animate-pulse"
                                 >
                                   ● {team.name}
                                 </span>
                               ))}
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="space-y-4">
                           <p className="text-sm text-slate-100 leading-relaxed text-center">
                             Tem certeza que deseja antecipar o término do tempo do round?<br />
                             <span className="text-emerald-400 font-extrabold uppercase mt-1 inline-block">
                               Todas as Equipes já entregaram suas decisões para este round.
                             </span><br />
                             <span className="text-slate-400 text-xs mt-1 inline-block">
                               O temporizador será fechado imediatamente para todas as equipes, impossibilitando novas decisões.
                             </span>
                           </p>

                           <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-center gap-2">
                             <CheckCircle2 size={16} className="text-emerald-400 animate-bounce" />
                             <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">
                               Selo de Conformidade Geral • 100% de Conclusão IP
                             </span>
                           </div>
                         </div>
                       )}
                     </div>

                     {/* Botões de Ação */}
                     <div className="flex justify-end gap-3 pt-2">
                       <button 
                         onClick={() => setShowForceExpireModal(false)}
                         className="px-5 py-3 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-white/5 transition-all active:scale-95"
                       >
                         CANCELAR
                       </button>
                       <button 
                         onClick={confirmForceExpire}
                         className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-orange-500 hover:shadow-orange-600/25 transition-all active:scale-95"
                       >
                         CONTINUAR
                       </button>
                     </div>
                   </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

            {showTurnoverConfirmModal && (
              <div className="fixed inset-0 z-[7000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="max-w-xl w-full bg-[#0b1329] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative text-left font-sans text-slate-200"
                >
                   <div className="p-8 space-y-6">
                     {/* Header */}
                     <div className="flex items-start gap-4">
                       <div className="p-3 bg-orange-600/10 text-orange-500 rounded-xl">
                         <History size={24} className="animate-spin duration-1000 text-orange-500" />
                       </div>
                       <div className="space-y-1">
                         <h3 className="text-lg font-black text-white uppercase tracking-wider italic">Confirmar Turnover</h3>
                         <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest leading-none">Fechamento do Período Contábil</p>
                       </div>
                     </div>

                     {/* Body */}
                     <div className="space-y-4">
                       <p className="text-sm text-slate-200 leading-relaxed font-sans">
                         Você está prestes a realizar o **TURNOVER do Round {turnoverSuccessRound}**. Este procedimento consolidará definitivamente as decisões desse ciclo.
                       </p>

                       <div className="bg-slate-950/50 border border-white/5 p-4 rounded-xl space-y-2">
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ações que serão executadas automaticamente:</p>
                         <ul className="text-xs text-slate-300 space-y-1.5 list-none pl-1">
                           <li className="flex items-center gap-2">
                             <span className="text-orange-500 font-extrabold">•</span> Consolidar decisões de todas as equipes de forma final;
                           </li>
                           <li className="flex items-center gap-2">
                             <span className="text-orange-500 font-extrabold">•</span> Executar cálculos contábeis do Balanço Patrimonial, DRE e Fluxo de Caixa via CPC/IFRS;
                           </li>
                           <li className="flex items-center gap-2">
                             <span className="text-orange-500 font-extrabold">•</span> Gerar e publicar a nova edição da Gazeta de Notícias;
                           </li>
                           <li className="flex items-center gap-2">
                             <span className="text-orange-500 font-extrabold">•</span> Inicializar o temporizador e abrir a submissão de decisões para o ciclo subsequente.
                           </li>
                         </ul>
                       </div>

                       <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex items-start gap-3">
                         <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
                         <p className="text-[11px] text-amber-300 leading-relaxed">
                           <strong className="uppercase">Atenção:</strong> Uma vez processado, o sistema recalculará a economia da arena inteira e essa operação é irreversível para os competidores.
                         </p>
                       </div>
                     </div>

                     {/* Footer Buttons */}
                     <div className="flex justify-end gap-3 pt-2 font-sans">
                       <button 
                         onClick={() => setShowTurnoverConfirmModal(false)}
                         className="px-5 py-3 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
                       >
                         CANCELAR
                       </button>
                       <button 
                         onClick={confirmRunTurnover}
                         className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-orange-500 hover:shadow-orange-600/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2 font-sans animate-pulse"
                       >
                         <RefreshCw size={12} className="animate-spin" /> PROCESSAR FECHAMENTO
                       </button>
                     </div>
                   </div>
                </motion.div>
              </div>
            )}

            {showTurnoverSuccessModal && (
              <div className="fixed inset-0 z-[7000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="max-w-xl w-full bg-[#0b1329] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative text-left"
                >
                   <div className="p-8 space-y-6">
                     {/* Header */}
                     <div className="flex items-start gap-4">
                       <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl font-sans">
                         <CheckCircle2 size={24} className="text-emerald-400 animate-bounce" />
                       </div>
                       <div className="space-y-1">
                         <h3 className="text-lg font-black text-white uppercase tracking-wider italic">Turnover Concluído</h3>
                         <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none">Processamento Sincronizado</p>
                       </div>
                     </div>

                     {/* Body */}
                     <div className="space-y-4">
                       <p className="text-sm text-slate-200 leading-relaxed text-center font-sans">
                         O **Turnover do Round {turnoverSuccessRound}** foi realizado com sucesso!<br />
                         <span className="text-slate-400 text-xs inline-block mt-1">
                           Todos os dados macroeconômicos, índices de mercado e relatórios de empresas foram computados com 100% de consistência.
                         </span>
                       </p>

                       <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl flex items-center justify-center gap-3">
                         <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                         <span className="text-[10px] text-emerald-300 font-black uppercase tracking-wider font-sans">
                           Selo de Auditores Contábeis • CPC/IFRS Consistentes
                         </span>
                       </div>

                       <p className="text-[11px] text-slate-400 italic text-center p-3 bg-slate-950/40 rounded-xl border border-white/5 font-sans">
                         Dados consolidados e comitados com integridade relacional no Supabase. O próximo período já está disponível para as equipes.
                       </p>
                     </div>

                     {/* Footer Button */}
                     <div className="flex justify-end pt-2">
                       <button 
                         onClick={() => setShowTurnoverSuccessModal(false)}
                         className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-emerald-500 transition-all active:scale-95 cursor-pointer text-center font-sans"
                       >
                         CONCLUIR PROTOCOLO
                       </button>
                     </div>
                   </div>
                </motion.div>
              </div>
            )}

            {showTurnoverErrorModal && (
              <div className="fixed inset-0 z-[7000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans text-slate-200">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="max-w-2xl w-full bg-[#0b1329] border border-rose-500/20 rounded-[2rem] overflow-hidden shadow-2xl relative text-left animate-in fade-in zoom-in duration-300"
                >
                   <div className="p-8 space-y-6">
                     {/* Header */}
                     <div className="flex items-start gap-4">
                       <div className="p-3 bg-rose-600/10 text-rose-500 rounded-xl">
                         <ShieldAlert size={24} className="text-rose-500 animate-pulse" />
                       </div>
                       <div className="space-y-1">
                         <h3 className="text-lg font-black text-rose-400 uppercase tracking-wider italic">Erro Crítico no Supabase</h3>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Investigação e Diagnóstico Técnico</p>
                       </div>
                     </div>

                     {/* Body */}
                     <div className="space-y-4">
                       <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">
                         Ocorreu uma falha inesperada durante a execução da procedure de Turnover. Os dados do banco foram revertidos preventivamente para assegurar consistência transacional.
                       </p>

                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Detalhes do erro analítico:</label>
                         <div className="bg-slate-950/80 border border-rose-500/20 p-4 rounded-xl max-h-[180px] overflow-y-auto custom-scrollbar font-mono text-xs text-rose-400 leading-relaxed break-words">
                           {turnoverErrorDetails || "Nenhuma mensagem de depuração adicional fornecida pela API."}
                         </div>
                       </div>

                       <div className="p-3 bg-slate-900 border border-white/5 rounded-lg flex items-center gap-2 text-[10px] text-slate-400">
                         <Activity size={12} className="text-rose-500" />
                         <span>Terminal de Auditoria Administrativo da Empirion v13.2</span>
                       </div>
                     </div>

                     {/* Footer Button */}
                     <div className="flex justify-end pt-2">
                       <button 
                         onClick={() => setShowTurnoverErrorModal(false)}
                         className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                       >
                         FECHAR DIAGNÓSTICO
                       </button>
                     </div>
                   </div>
                </motion.div>
              </div>
            )}
           <AnimatePresence mode="wait">
              {tutorView === 'dashboard' && selectedArena && (
                <motion.div key="dash" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-12">
                   <TutorDecisionMonitor 
                      championshipId={selectedArena.id} 
                      round={selectedArena.current_round >= selectedArena.total_rounds ? selectedArena.total_rounds : selectedArena.current_round + 1} 
                      isTrial={!!selectedArena.is_trial} 
                    />
                    {selectedArena.current_round >= selectedArena.total_rounds && (
                      <div className="mt-8">
                        <TournamentSummary championship={selectedArena} teams={selectedArena.teams || []} />
                      </div>
                    )}
                </motion.div>
              )}
              {tutorView === 'intervention' && selectedArena && (
                <motion.div key="plan" initial={{opacity:0, x:20}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                   <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
                </motion.div>
              )}
           </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 font-sans max-w-[1600px] mx-auto p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-orange-600 text-white rounded-[2rem] shadow-2xl"><Command size={40} /></div> 
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic leading-none">Command <span className="text-orange-600">Center</span></h1>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 sticky top-0 z-[200] bg-[#020617]/80 backdrop-blur-xl py-4 border-b border-white/5">
         <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Arenas Live" color="orange" />
         {isAdmin && <NavTab active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="RLS Control" color="emerald" />}
         {isAdmin && <NavTab active={activeTab === 'cms'} onClick={() => setActiveTab('cms')} label="Site CMS" color="blue" />}
      </div>

      <AnimatePresence mode="wait">
         {activeTab === 'tournaments' && (
           <motion.div key="arenas" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             {championships.map((champ) => (
               <div key={champ.id} className="bg-slate-900/50 p-12 rounded-[4rem] border border-white/5 shadow-2xl hover:border-orange-500/40 transition-all flex flex-col justify-between min-h-[350px] group">
                  <div className="space-y-6">
                     <div className="flex justify-between items-start">
                        <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase ${champ.is_trial ? 'bg-orange-600/20 text-orange-400' : 'bg-emerald-600/20 text-emerald-400'}`}>{champ.is_trial ? 'Sandbox' : 'Fidelity Live'}</span>
                        {isAdmin && <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-3 bg-white/5 rounded-xl text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>}
                     </div>
                     <h5 className="text-3xl font-black text-white uppercase italic group-hover:text-orange-500 transition-colors">{champ.name}</h5>
                  </div>
                  <button onClick={() => { setSelectedArena(null); setSelectedArena(champ); }} className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95">Acessar Control Room</button>
               </div>
             ))}
             <button onClick={() => { setSelectedArena(null); setIsPickingTemplate(true); }} className="bg-white/5 p-12 rounded-[4rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 group hover:bg-white/10 transition-all">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-500 group-hover:bg-orange-600 group-hover:text-white transition-all"><Plus size={40}/></div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Implantar Nova Arena</span>
             </button>
           </motion.div>
         )}

         {activeTab === 'cms' && isAdmin && (
           <motion.div key="cms" initial={{opacity:0}} animate={{opacity:1}} className="space-y-10">
              <div className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                 <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl"><FileJson size={32}/></div>
                       <div>
                          <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Content Management System</h3>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Edite o JSON de conteúdo das páginas diretamente na nuvem v13.2.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={seedDefaults} className="px-6 py-3 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                          <Database size={12}/> Seed Defaults
                       </button>
                       <button onClick={saveCms} disabled={isCmsSaving} className="px-10 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-blue-900 transition-all flex items-center gap-3 active:scale-95">
                          {isCmsSaving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>} Salvar Protocolo CMS
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 italic">Selecionar Página</label>
                          <div className="flex flex-col gap-2">
                             {Object.keys(DEFAULT_PAGE_CONTENT).map(slug => (
                                <button key={slug} onClick={() => loadCmsData(slug, cmsLang)} className={`p-4 rounded-xl text-left text-[10px] font-black uppercase transition-all border ${cmsPage === slug ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-300'}`}>{slug}</button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 italic">Idioma / Localização</label>
                          <div className="flex gap-2">
                             {['pt', 'en', 'es'].map(l => (
                                <button key={l} onClick={() => loadCmsData(cmsPage, l)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${cmsLang === l ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-300'}`}>{l.toUpperCase()}</button>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="lg:col-span-3 space-y-4">
                       <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border border-white/5 rounded-t-3xl">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">JSON Core Editor - {cmsPage.toUpperCase()} ({cmsLang})</span>
                          <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_blue]"/>
                             <div className="w-2 h-2 rounded-full bg-white/10"/>
                          </div>
                       </div>
                       <textarea 
                          value={cmsData} 
                          onChange={e => setCmsData(e.target.value)}
                          className="w-full h-[500px] bg-slate-950 p-10 rounded-b-[3rem] border border-white/5 text-blue-400 font-mono text-xs outline-none focus:border-blue-500/50 shadow-inner resize-none custom-scrollbar"
                       />
                    </div>
                 </div>
              </div>
           </motion.div>
         )}

         {activeTab === 'users' && isAdmin && (
           <motion.div key="users" initial={{opacity:0}} animate={{opacity:1}} className="bg-slate-900/60 p-10 rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden">
              <table className="w-full text-left">
                 <thead className="border-b border-white/5">
                    <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                       <th className="p-6">Operador</th>
                       <th className="p-6">Role / Nodo</th>
                       <th className="p-6">Email Alpha</th>
                       <th className="p-6 text-right">Ações</th>
                    </tr>
                 </thead>
                 <tbody>
                    {users.map(u => (
                       <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black italic">{u.nickname?.[0] || u.name?.[0]}</div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-white uppercase italic">{u.nickname || u.name}</span>
                                   <span className="text-[8px] font-bold text-slate-600 uppercase">{u.id}</span>
                                </div>
                             </div>
                          </td>
                          <td className="p-6"><span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-orange-600 text-white' : u.role === 'tutor' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{u.role}</span></td>
                          <td className="p-6 text-xs font-mono text-slate-400">{u.email}</td>
                          <td className="p-6 text-right"><button className="p-3 text-slate-600 hover:text-white transition-colors"><Settings2 size={16}/></button></td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </motion.div>
         )}
      </AnimatePresence>

      <AnimatePresence>
        {isPickingTemplate && (
          <div className="fixed inset-0 z-[6000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-10 overflow-hidden">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl w-full space-y-12">
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-orange-600 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-2xl mb-6"><LayoutGrid size={40} /></div>
                   <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Escolha a <span className="text-orange-500">Matriz de Ramo</span></h2>
                   <p className="text-slate-500 font-medium text-lg italic">Selecione um template de setor para inicializar os nodos da arena.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <TemplateCard branch="industrial" label="Mastery Industrial" icon={<Factory size={40} />} desc="CapEx massivo, máquinas Alfa/Beta/Gama e depreciação técnica." active onSelect={() => selectBranchTemplate('industrial')} />
                   <TemplateCard branch="commercial" label="Varejo Elite" icon={<ShoppingCart size={40} />} desc="Giro de estoque, marketing mix e algoritmos de CSAT." onSelect={() => selectBranchTemplate('commercial')} />
                   <TemplateCard branch="services" label="Intellect Matrix" icon={<Briefcase size={40} />} desc="Capital intelectual, horas-homem e contratos de prestação." onSelect={() => selectBranchTemplate('services')} />
                </div>
                <button onClick={() => setIsPickingTemplate(false)} className="mx-auto block text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">Cancelar Operação</button>
             </motion.div>
          </div>
        )}
        {showWizard && (
          <div className="fixed inset-0 z-[5000] bg-slate-950 p-4 md:p-10 flex items-center justify-center overflow-hidden">
             <TrialWizard onComplete={() => { setShowWizard(false); fetchData(); }} />
          </div>
        )}
        {showForceExpireModal && (
          <div className="fixed inset-0 z-[7000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.95 }}
               className="max-w-xl w-full bg-[#0b1329] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative"
            >
               <div className="p-8 space-y-6">
                 {/* Header com Ícone e Título */}
                 <div className="flex items-start gap-4">
                   <div className="p-3 bg-orange-600/10 text-orange-500 rounded-xl">
                     <AlertOctagon size={24} className="animate-pulse" />
                   </div>
                   <div className="space-y-1">
                     <h3 className="text-lg font-black text-white uppercase tracking-wider italic">Antecipar Término do Round</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocolo de Emergência do Tutor</p>
                   </div>
                 </div>

                 {/* Corpo do Texto */}
                 <div className="space-y-4">
                   <p className="text-sm text-slate-100 leading-relaxed">
                     Tem certeza que deseja antecipar o término do tempo do round?
                   </p>

                   {pendingTeams.length > 0 ? (
                     <div className="space-y-3 bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl">
                       <p className="text-xs text-rose-400 font-bold uppercase tracking-wider leading-relaxed">
                         {pendingTeams.length === 1 
                           ? `A Equipe "${pendingTeams[0].name}" não concluiu suas decisões!`
                           : `As seguintes equipes não concluíram as decisões:`
                         }
                       </p>
                       <div className="flex flex-wrap gap-2 pt-1">
                         {pendingTeams.map((team) => (
                           <span 
                             key={team.id} 
                             className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-black uppercase rounded-lg"
                           >
                             ● {team.name}
                           </span>
                         ))}
                       </div>
                     </div>
                   ) : (
                     <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                       <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                         Todas as Equipes já entregaram suas decisões para este round.
                       </p>
                     </div>
                   )}

                   <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-950/40 p-3 border border-white/5 rounded-lg">
                     O temporizador será fechado imediatamente para todas as equipes, impossibilitando novas decisões.
                   </p>
                 </div>

                 {/* Botões de Ação */}
                 <div className="flex justify-end gap-3 pt-2">
                   <button 
                     onClick={() => setShowForceExpireModal(false)}
                     className="px-5 py-3 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-white/5 transition-all active:scale-95"
                   >
                     CANCELAR
                   </button>
                   <button 
                     onClick={confirmForceExpire}
                     className="px-6 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-orange-500 hover:shadow-orange-600/25 transition-all active:scale-95"
                   >
                     CONTINUAR
                   </button>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TemplateCard = ({ label, icon, desc, active, onSelect }: any) => (
  <button onClick={onSelect} className={`p-10 rounded-[3.5rem] border-2 text-left transition-all relative overflow-hidden group h-full flex flex-col justify-between ${active ? 'bg-slate-900 border-orange-500 shadow-[0_20px_60px_rgba(249,115,22,0.2)] scale-100 hover:scale-[1.03]' : 'bg-slate-950 border-white/5 opacity-40 grayscale cursor-not-allowed'}`}>
     <div className="space-y-6 relative z-10">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-600'}`}>{icon}</div>
        <div className="space-y-2">
           <h3 className={`text-2xl font-black uppercase italic ${active ? 'text-white' : 'text-slate-500'}`}>{label}</h3>
           <p className={`text-sm font-medium leading-relaxed ${active ? 'text-slate-400' : 'text-slate-700'}`}>{desc}</p>
        </div>
     </div>
     <div className="pt-8 flex justify-between items-center relative z-10">
        {active ? <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">Selecionar Protocolo <ArrowRight size={14}/></span> : <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Lock size={12}/> Nodo Indisponível</span>}
     </div>
  </button>
);

const NavTab = ({ active, onClick, label, color }: any) => {
    const activeColors = color === 'orange' ? 'bg-orange-600 border-orange-500' : color === 'emerald' ? 'bg-emerald-600 border-emerald-500' : 'bg-blue-600 border-blue-500';
    return (
        <button onClick={onClick} className={`px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border italic active:scale-95 whitespace-nowrap ${active ? `${activeColors} text-white shadow-lg` : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-300'}`}>{label}</button>
    );
};

const ArenaNavBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all italic active:scale-95 border ${active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'text-slate-50 border-transparent hover:text-slate-200'}`}>{icon} {label}</button>
);

export const TournamentSummary: React.FC<{ championship: Championship; teams: Team[] }> = ({ championship, teams }) => {
  const sortedTeams = useMemo(() => {
    return [...(teams || [])].sort((a, b) => {
      const aVal = a.equity ?? a.kpis?.equity ?? 0;
      const bVal = b.equity ?? b.kpis?.equity ?? 0;
      return bVal - aVal;
    });
  }, [teams]);

  return (
    <div className="bg-slate-950/90 border border-orange-500/30 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden backdrop-blur-xl font-sans text-slate-100 max-w-6xl w-full mx-auto space-y-6 animate-in fade-in duration-500 text-left">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full -ml-20 -mb-20 animate-pulse pointer-events-none" />

      {/* Header com os Troféus e Título */}
      <div className="text-center space-y-2 relative z-10">
        <div className="inline-flex p-3 bg-orange-600/10 text-orange-500 rounded-2xl border border-orange-500/20 mb-1">
          <Trophy size={40} className="animate-bounce" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-amber-500">
          PARABÉNS!
        </h2>
        <div className="text-xs md:text-sm font-medium max-w-2xl mx-auto text-slate-300 uppercase tracking-widest leading-relaxed">
          CHEGAMOS AO FINAL DO TORNEIO <span className="text-orange-500 font-extrabold">{championship.name}</span>
        </div>
        <p className="text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-[0.15em] leading-relaxed">
          ABAIXO LISTAMOS AS EQUIPES PARTICIPANTES E SUAS COLOCAÇÕES POR ORDEM DO MELHOR AO PIOR CLASSIFICADO NO TORNEIO
        </p>
      </div>

      {/* Destaque para os 3 Primeiros Colocados (Pódio) */}
      {sortedTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 relative z-10 items-end">
          {/* Segundo Lugar */}
          {sortedTeams[1] ? (
            <div className="order-2 md:order-1 bg-slate-900/60 border border-slate-700/30 p-4 rounded-[1.5rem] text-center space-y-2 flex flex-col items-center justify-center min-h-[160px] shadow-lg hover:border-slate-500/30 transition-all">
              <div className="w-10 h-10 bg-slate-300/10 border-2 border-slate-400 text-slate-300 rounded-xl flex items-center justify-center text-sm font-black italic">
                2º
              </div>
              <div className="space-y-0.5 w-full">
                <h4 className="font-extrabold text-base text-slate-100 uppercase tracking-tight italic truncate max-w-full px-2">
                  {sortedTeams[1].name}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Segunda Colocada</p>
              </div>
              <div className="px-3 py-1 bg-slate-950/60 rounded-lg border border-white/5 font-mono text-xs text-slate-300">
                $ {parseFloat(String(sortedTeams[1].equity ?? sortedTeams[1].kpis?.equity ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ) : (
            <div className="order-2 md:order-1 md:block hidden min-h-[160px]" />
          )}

          {/* Primeiro Lugar (Destaque Central) */}
          {sortedTeams[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-yellow-500/15 to-slate-900/60 border-2 border-yellow-500/40 p-5 rounded-[1.75rem] text-center space-y-2 flex flex-col items-center justify-center min-h-[190px] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse duration-1000 pointer-events-none" />
              <div className="w-12 h-12 bg-yellow-500/10 border-2 border-yellow-500 text-yellow-400 rounded-2xl flex items-center justify-center text-xl font-black italic animate-bounce">
                1º
              </div>
              <div className="space-y-0.5 w-full">
                <h4 className="font-black text-xl text-yellow-300 uppercase tracking-tight italic truncate max-w-full px-2">
                  {sortedTeams[0].name}
                </h4>
                <p className="text-[9px] text-yellow-400 font-black uppercase tracking-[0.25em]">SUPREMA CAMPEÃ</p>
              </div>
              <div className="px-4 py-1.5 bg-yellow-950/40 rounded-xl border border-yellow-500/25 font-mono text-xs text-yellow-400 font-black font-mono">
                $ {parseFloat(String(sortedTeams[0].equity ?? sortedTeams[0].kpis?.equity ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}

          {/* Terceiro Lugar */}
          {sortedTeams[2] ? (
            <div className="order-3 md:order-3 bg-slate-900/60 border border-amber-900/20 p-4 rounded-[1.5rem] text-center space-y-2 flex flex-col items-center justify-center min-h-[150px] shadow-lg hover:border-amber-700/20 transition-all">
              <div className="w-10 h-10 bg-amber-700/10 border-2 border-amber-700 text-amber-600 rounded-xl flex items-center justify-center text-sm font-black italic">
                3º
              </div>
              <div className="space-y-0.5 w-full">
                <h4 className="font-extrabold text-sm text-slate-100 uppercase tracking-tight italic truncate max-w-full px-2">
                  {sortedTeams[2].name}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terceira Colocada</p>
              </div>
              <div className="px-3 py-1 bg-slate-950/60 rounded-lg border border-white/5 font-mono text-xs text-slate-300">
                $ {parseFloat(String(sortedTeams[2].equity ?? sortedTeams[2].kpis?.equity ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ) : (
            <div className="order-3 md:order-3 md:block hidden min-h-[150px]" />
          )}
        </div>
      )}

      {/* Tabela de Colocações com os demais classificados (4º em diante) */}
      {sortedTeams.length > 3 && (
        <div className="bg-slate-950/60 border border-white/5 rounded-[1.5rem] p-4 relative z-10 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 font-mono">Outros competidores ranqueados:</p>
          <div className="divide-y divide-white/5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
            {sortedTeams.slice(3).map((team, idx) => {
              const position = idx + 4;
              return (
                <div key={team.id} className="flex items-center justify-between py-2 px-2 hover:bg-white/5 rounded-lg transition-all">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-500 text-xs w-6">#{position}</span>
                    <span className="font-bold text-xs text-slate-300 uppercase tracking-tight truncate max-w-[250px]">{team.name}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-400 font-bold">
                    $ {parseFloat(String(team.equity ?? team.kpis?.equity ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommandCenter;
