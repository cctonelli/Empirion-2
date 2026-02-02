
import React, { useState, useEffect, useMemo } from 'react';
import * as Router from 'react-router-dom';
const { useLocation, useNavigate } = Router as any;
// Fix: Added LayoutGrid to the lucide-react imports to resolve "Cannot find name 'LayoutGrid'" error
import { 
  Plus, Trash2, ArrowLeft, Command, Users, Globe, 
  X, Palette, Menu as MenuIcon, Save, AtSign, Phone, FileCode, UserPlus, UserMinus, Shield,
  Trophy, Settings, ShieldAlert, Sparkles, Landmark, ArrowRight, Activity, LayoutDashboard,
  PenTool, Newspaper, History, Settings2, Rocket, Lock, ChevronLeft, ChevronRight, Zap, CheckCircle2,
  RefreshCw, Loader2, User, AlertOctagon, Flame, Factory, ShoppingCart, Briefcase, Tractor, DollarSign, Hammer,
  LayoutGrid
} from 'lucide-react';
import { 
  getChampionships, 
  deleteChampionship, 
  supabase,
  getUserProfile,
  getAllUsers,
  provisionDemoEnvironment,
  processRoundTurnover,
  updateEcosystem
} from '../services/supabase';
import { generateBlackSwanEvent } from '../services/gemini';
import { Championship, UserProfile, MenuItemConfig, Team, BlackSwanEvent, Branch } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import GazetteViewer from './GazetteViewer';
import TrailWizard from './TrailWizard';
import { motion as _motion, AnimatePresence } from 'framer-motion';
const motion = _motion as any;
import { APP_VERSION, MENU_STRUCTURE, CHAMPIONSHIP_TEMPLATES, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

type TutorView = 'dashboard' | 'teams' | 'decisions' | 'intervention' | 'gazette';

const SYSTEM_TUTOR_ID = '00000000-0000-0000-0000-000000000000';

const AdminCommandCenter: React.FC<{ preTab?: string }> = ({ preTab = 'system' }) => {
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
  
  // Estados de Fluxo do Wizard
  const [showWizard, setShowWizard] = useState(false);
  const [isPickingTemplate, setIsPickingTemplate] = useState(false);
  const [isCreatingTrial, setIsCreatingTrial] = useState(false);
  
  const [tutorView, setTutorView] = useState<TutorView>('dashboard');

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
         
         // Fix: Only auto-select arena if we are NOT in creation flow
         const params = new URLSearchParams(location.search);
         const isCreatingNew = params.get('mode') === 'new_trial' || isPickingTemplate || showWizard;
         
         if (!isCreatingNew) {
           const storedArenaId = localStorage.getItem('active_champ_id');
           if (storedArenaId && !selectedArena) {
              const found = data.find(c => c.id === storedArenaId);
              if (found) setSelectedArena(found);
           }
         }
      }
      
      if (activeTab === 'users' && prof?.role === 'admin') {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      }
    } catch (err) { console.error("Sync Error:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'new_trial') {
      setSelectedArena(null); // Reset selection when forcing new trial mode
      setIsPickingTemplate(true);
    }
  }, [location.search]);

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
            interest_rate_tr: (currentMacro.interest_rate_tr || 2) + event.modifiers.interest
         };

         await updateEcosystem(selectedArena.id, {
            round_rules: {
               ...(selectedArena.round_rules || {}),
               [nextRound]: updatedMacro
            }
         });
         alert("CISNE NEGRO INTEGRADO AO PRÓXIMO TURNOVER.");
         fetchData();
      }
    } catch (err) {
      alert("Falha ao gerar evento neural.");
    } finally {
      setIsGeneratingEvent(false);
    }
  };

  const handleTurnover = async () => {
    if (!selectedArena || isProcessing) return;
    if (!confirm(`CONFIRMAR TURNOVER: Processar fechamento do Ciclo 0${selectedArena.current_round}?`)) return;

    setIsProcessing(true);
    try {
      const res = await processRoundTurnover(selectedArena.id, selectedArena.current_round);
      if (res.success) {
        alert("TURNOVER CONCLUÍDO.");
        fetchData();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      alert(`ERRO CRÍTICO: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectBranchTemplate = (branch: Branch) => {
    if (branch === 'industrial') {
      setIsPickingTemplate(false);
      setShowWizard(true);
    } else {
      alert(`PROTOCOLO ${branch.toUpperCase()} BLOQUEADO: Este ramo está em fase de mapeamento neural. Utilize o Template Industrial no momento.`);
    }
  };

  // Condition fix: Ensure Wizard and Picker take priority over selectedArena view
  if ((selectedArena || isCreatingTrial) && !showWizard && !isPickingTemplate) {
    const arenaName = selectedArena?.name || "Strategos Trial Engine";

    return (
      <div className="flex flex-col h-full bg-[#020617] relative overflow-hidden">
        <header className="shrink-0 z-[2000] bg-slate-900/80 border-b border-white/10 px-8 py-3 backdrop-blur-3xl flex justify-between items-center shadow-xl">
           <div className="flex items-center gap-6">
              <button onClick={() => { setSelectedArena(null); setIsCreatingTrial(false); navigate('/app/admin'); }} className="text-slate-500 hover:text-white transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest"><ArrowLeft size={14}/> Sair</button>
              <div className="h-4 w-px bg-white/10" />
              <h1 className="text-xs font-black text-white uppercase italic tracking-widest">Arena <span className="text-orange-500">{arenaName}</span></h1>
           </div>
           
           <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/5">
              <ArenaNavBtn active={tutorView === 'dashboard'} onClick={() => setTutorView('dashboard')} label="Cockpit" icon={<LayoutDashboard size={12}/>} />
              <ArenaNavBtn active={tutorView === 'teams'} onClick={() => setTutorView('teams')} label="Equipes" icon={<Users size={12}/>} />
              <ArenaNavBtn active={tutorView === 'intervention'} onClick={() => setTutorView('intervention')} label="Intervenção" icon={<Zap size={12}/>} />
              <ArenaNavBtn active={tutorView === 'gazette'} onClick={() => setTutorView('gazette')} label="Gazeta" icon={<Newspaper size={12}/>} />
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={handleBlackSwan}
                disabled={isGeneratingEvent}
                className="px-6 py-2 bg-rose-600/10 border border-rose-500/30 text-rose-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 active:scale-95"
              >
                {isGeneratingEvent ? <Loader2 size={12} className="animate-spin"/> : <AlertOctagon size={12}/>} 
                Cisne Negro (IA)
              </button>
              <button 
                onClick={handleTurnover}
                disabled={isProcessing}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 flex items-center gap-2 active:scale-95"
              >
                {isProcessing ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>} 
                Turnover P0{selectedArena?.current_round}
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 max-w-[1600px] mx-auto w-full relative z-10">
           <AnimatePresence mode="wait">
              {tutorView === 'dashboard' && selectedArena && (
                <motion.div key="dash" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-12">
                   <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} isTrial={!!selectedArena.is_trial} />
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {championships.map((champ) => (
          <div key={champ.id} className="bg-slate-900/50 p-12 rounded-[4rem] border border-white/5 shadow-2xl hover:border-orange-500/40 transition-all flex flex-col justify-between min-h-[350px] group">
             <div className="space-y-6">
                <div className="flex justify-between items-start">
                   <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase ${champ.is_trial ? 'bg-orange-600/20 text-orange-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                      {champ.is_trial ? 'Sandbox' : 'Fidelity Live'}
                   </span>
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
      </div>

      <AnimatePresence>
        {isPickingTemplate && (
          <div className="fixed inset-0 z-[6000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-10 overflow-hidden">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl w-full space-y-12">
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-orange-600 rounded-[2rem] flex items-center justify-center mx-auto text-white shadow-2xl mb-6">
                      <LayoutGrid size={40} />
                   </div>
                   <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Escolha a <span className="text-orange-500">Matriz de Ramo</span></h2>
                   <p className="text-slate-500 font-medium text-lg italic">Selecione um template de setor para inicializar os nodos da arena.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <TemplateCard 
                      branch="industrial" 
                      label="Mastery Industrial" 
                      icon={<Factory size={40} />} 
                      desc="CapEx massivo, máquinas Alfa/Beta/Gama e depreciação técnica." 
                      active 
                      onSelect={() => selectBranchTemplate('industrial')} 
                   />
                   <TemplateCard 
                      branch="commercial" 
                      label="Varejo Elite" 
                      icon={<ShoppingCart size={40} />} 
                      desc="Giro de estoque, marketing mix e algoritmos de CSAT." 
                      onSelect={() => selectBranchTemplate('commercial')} 
                   />
                   <TemplateCard 
                      branch="services" 
                      label="Intellect Matrix" 
                      icon={<Briefcase size={40} />} 
                      desc="Capital intelectual, horas-homem e contratos de prestação." 
                      onSelect={() => selectBranchTemplate('services')} 
                   />
                   <TemplateCard 
                      branch="agribusiness" 
                      label="Global Agro" 
                      icon={<Tractor size={40} />} 
                      desc="Ativos biológicos, ciclos de fazenda e riscos climáticos." 
                      onSelect={() => selectBranchTemplate('agribusiness')} 
                   />
                   <TemplateCard 
                      branch="finance" 
                      label="Sinvest Bank" 
                      icon={<DollarSign size={40} />} 
                      desc="Spread bancário, risco de crédito e hedge financeiro." 
                      onSelect={() => selectBranchTemplate('finance')} 
                   />
                   <TemplateCard 
                      branch="construction" 
                      label="Build Heavy" 
                      icon={<Hammer size={40} />} 
                      desc="Longo prazo, licitações e gestão de canteiros de obras." 
                      onSelect={() => selectBranchTemplate('construction')} 
                   />
                </div>

                <button onClick={() => setIsPickingTemplate(false)} className="mx-auto block text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">Cancelar Operação</button>
             </motion.div>
          </div>
        )}

        {showWizard && (
          <div className="fixed inset-0 z-[5000] bg-slate-950 p-4 md:p-10 flex items-center justify-center overflow-hidden">
             <TrailWizard onComplete={() => { setShowWizard(false); fetchData(); }} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TemplateCard = ({ label, icon, desc, active, onSelect }: any) => (
  <button 
    onClick={onSelect}
    className={`p-10 rounded-[3.5rem] border-2 text-left transition-all relative overflow-hidden group h-full flex flex-col justify-between ${
      active 
      ? 'bg-slate-900 border-orange-500 shadow-[0_20px_60px_rgba(249,115,22,0.2)] scale-100 hover:scale-[1.03]' 
      : 'bg-slate-950 border-white/5 opacity-40 grayscale cursor-not-allowed'
    }`}
  >
     <div className="space-y-6 relative z-10">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
           {icon}
        </div>
        <div className="space-y-2">
           <h3 className={`text-2xl font-black uppercase italic ${active ? 'text-white' : 'text-slate-500'}`}>{label}</h3>
           <p className={`text-sm font-medium leading-relaxed ${active ? 'text-slate-400' : 'text-slate-700'}`}>{desc}</p>
        </div>
     </div>
     
     <div className="pt-8 flex justify-between items-center relative z-10">
        {active ? (
          <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">Selecionar Protocolo <ArrowRight size={14}/></span>
        ) : (
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Lock size={12}/> Nodo Indisponível</span>
        )}
     </div>

     {active && (
       <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
          <Sparkles size={120} className="text-white" />
       </div>
     )}
  </button>
);

const NavTab = ({ active, onClick, label, color }: any) => (
    <button onClick={onClick} className={`px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border italic active:scale-95 whitespace-nowrap ${active ? 'bg-orange-600 text-white border-orange-500 shadow-lg' : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-300'}`}>{label}</button>
);

const ArenaNavBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all italic active:scale-95 border ${active ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'text-slate-50 border-transparent hover:text-slate-200'}`}>
     {icon} {label}
  </button>
);

export default AdminCommandCenter;
