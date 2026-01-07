
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Trophy, LayoutGrid, Activity, 
  Monitor, Plus, Trash2, RefreshCw, ArrowLeft,
  Settings, Loader2, Hammer, HeartPulse, DollarSign, 
  Brain, Sparkles, TrendingUp, Palette, FileCode,
  Image as ImageIcon, Type, Menu as MenuIcon, Save,
  X, Terminal, Cpu, Zap, ArrowRight, ShieldCheck,
  Globe, Database, Command, Users, Landmark
} from 'lucide-react';
import { 
  getChampionships, 
  deleteChampionship, 
  supabase,
  getUserProfile
} from '../services/supabase';
import { Championship, Team, InsolvencyStatus, UserProfile } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_VERSION, PROTOCOL_NODE, CHAMPIONSHIP_TEMPLATES } from '../constants';

const AdminCommandCenter: React.FC<{ preTab?: string }> = ({ preTab = 'tournaments' }) => {
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // UI CMS State
  const [heroTitle, setHeroTitle] = useState('Forje Seu Império');
  const [carouselImages, setCarouselImages] = useState(['https://images.unsplash.com/photo-1565106430482-8f6e74349ca1']);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const prof = await getUserProfile(session.user.id);
        setProfile(prof);
      }
      
      const { data } = await getChampionships();
      if (data) setChampionships(data);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleManualIntervention = async (teamId: string, type: string, value?: any) => {
    const confirmation = window.confirm(`PROTOCOLO MASTER: Esta intervenção alterará o curso da simulação. Confirmar?`);
    if (!confirmation) return;
    
    setLoading(true);
    try {
      let update: any = {};
      if (type === 'STATUS') update.insolvency_status = value as InsolvencyStatus;
      if (type === 'CREDIT_LIMIT') update.credit_limit = value;
      
      await supabase.from('teams').update(update).eq('id', teamId);
      alert(`PROTOCOLO ATIVO: Unidade sincronizada.`);
      fetchData();
    } catch (e: any) { alert(`FALHA: ${e.message}`); }
    finally { setLoading(false); }
  };

  const isAdmin = profile?.role === 'admin';
  const isTrialSession = localStorage.getItem('is_trial_session') === 'true';

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between px-6 gap-6">
           <div className="flex items-center gap-6">
              <button onClick={() => setSelectedArena(null)} className="p-5 bg-white/5 text-slate-400 hover:text-white rounded-[1.5rem] border border-white/5 transition-all shadow-xl active:scale-95"><ArrowLeft size={28} /></button>
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Arena: <span className="text-orange-500">{selectedArena.name}</span></h1>
                 <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mt-3 italic">{PROTOCOL_NODE} • {APP_VERSION}</p>
              </div>
           </div>
           <div className="flex gap-2 p-2 bg-slate-900 rounded-[1.5rem] border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
              <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Arena Monitor" color="orange" />
              <NavTab active={activeTab === 'interventions'} onClick={() => setActiveTab('interventions')} label="Resgate (Crise)" color="indigo" />
           </div>
        </header>

        {activeTab === 'interventions' ? (
          <div className="space-y-10 px-6">
             <div className="bg-indigo-600/10 border border-indigo-500/20 p-10 rounded-[4rem] flex items-center gap-8 shadow-inner">
                <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-2xl"><Hammer size={32}/></div>
                <div>
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">Módulo de Gestão de Crise</h3>
                   <p className="text-xs text-indigo-300 font-bold uppercase tracking-[0.2em] mt-3">Intervenção Master para resgate de unidades insolventes via aporte de capital e revogação de falências.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {selectedArena.teams?.map((team: Team) => (
                  <TeamInterventionCard key={team.id} team={team} onAction={handleManualIntervention} />
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-12 px-6">
            <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
            <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 font-sans max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 pt-6">
        <div className="space-y-2">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(249,115,22,0.3)]"><Command size={40} /></div> 
            <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic">
              Command <span className="text-orange-600">Center</span>
            </h1>
          </div>
          <p className="text-slate-500 font-black text-[12px] uppercase tracking-[0.4em] italic pl-2">Dono da Bola • Governança Global Node 08</p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl border-t-orange-600/30">
           <div className="flex flex-col text-right">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">NODE STATUS</span>
              <span className="text-[10px] font-mono text-emerald-500 font-black mt-2 tracking-tighter">ACTIVE: {PROTOCOL_NODE}</span>
           </div>
           <div className="w-px h-16 bg-white/10" />
           <div className="flex items-center gap-4">
              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]" />
              <div className="flex flex-col">
                 <span className="text-lg font-black text-white uppercase italic tracking-tight">{profile?.name || 'TUTOR MASTER ALPHA'}</span>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{profile?.role?.toUpperCase() || 'PLAYER'} CORE</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar pb-4 sticky top-0 z-[100] bg-[#020617]/80 backdrop-blur-xl py-4 border-b border-white/5">
         <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Arenas & Campeonatos" color="orange" />
         {isAdmin && (
           <>
             <NavTab active={activeTab === 'uidesign'} onClick={() => setActiveTab('uidesign')} label="UI Design (CMS Global)" color="indigo" />
             <NavTab active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} label="Templates Master Hub" color="emerald" />
           </>
         )}
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'tournaments' && (
            !showWizard ? (
              <motion.div 
                key="arena-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-16"
              >
                 <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-900 p-16 rounded-[5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-10 relative z-10">
                       <div className="p-10 bg-orange-600 text-white rounded-[3rem] shadow-2xl group-hover:scale-105 transition-transform duration-700"><Plus size={64} /></div>
                       <div>
                          <h3 className="text-5xl font-black text-white uppercase italic tracking-tight leading-none">Criar Nova Arena</h3>
                          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mt-5 leading-relaxed italic max-w-xl">Inicie um novo ciclo de orquestração empresarial. Parametrize impostos, matérias-primas e ativos de capital.</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setShowWizard(true)} 
                      className="px-20 py-8 bg-white text-slate-950 rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-orange-600 hover:text-white transition-all shadow-[0_30px_70px_rgba(0,0,0,0.5)] active:scale-95 z-10 shrink-0"
                    >
                      Iniciar Orquestração
                    </button>
                    <Sparkles className="absolute -bottom-20 -right-20 opacity-5 text-orange-500 group-hover:scale-150 transition-transform duration-1000 group-hover:rotate-12 pointer-events-none" size={500} />
                 </div>

                 {loading ? (
                   <div className="py-40 flex flex-col items-center justify-center gap-6">
                      <Loader2 className="animate-spin text-orange-600" size={64} />
                      <span className="text-xs font-black uppercase text-slate-500 tracking-[0.5em] animate-pulse">Neural Node Link Syncing...</span>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      {championships.map((champ) => (
                        <div key={champ.id} className="bg-slate-900/50 backdrop-blur-2xl p-12 rounded-[4rem] border border-white/5 shadow-2xl hover:border-orange-500/40 transition-all group flex flex-col justify-between min-h-[420px] relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12 pointer-events-none">
                              <Trophy size={200} />
                           </div>
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-12">
                                 <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border ${champ.is_trial ? 'bg-orange-600/10 text-orange-500 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                    {champ.is_trial ? 'Teste Grátis' : 'Arena Live'}
                                 </span>
                                 <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-4 bg-white/5 rounded-[1.25rem] text-slate-600 hover:text-rose-500 transition-colors shadow-inner active:scale-90">
                                    <Trash2 size={24}/>
                                 </button>
                              </div>
                              <h5 className="text-4xl font-black text-white uppercase italic tracking-tight leading-none mb-6 group-hover:text-orange-500 transition-colors">{champ.name}</h5>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-2">
                                    <LayoutGrid size={16} className="text-slate-600" />
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{champ.branch}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-slate-600" />
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Ciclo 0{champ.current_round}</span>
                                 </div>
                              </div>
                           </div>
                           <button onClick={() => setSelectedArena(champ)} className="w-full py-6 mt-12 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-orange-600 hover:border-orange-600 transition-all flex items-center justify-center gap-4 shadow-2xl relative z-10 group/btn">
                              <Monitor size={20} className="group-hover/btn:scale-110 transition-transform" /> Orquestrar Unidade
                           </button>
                        </div>
                      ))}
                   </div>
                 )}
              </motion.div>
            ) : (
              <motion.div 
                key="wizard-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative"
              >
                <button 
                  onClick={() => setShowWizard(false)}
                  className="absolute -top-24 right-0 p-6 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                >
                  <X size={20} /> Abortar Orquestração
                </button>
                <ChampionshipWizard 
                  isTrial={isTrialSession} 
                  onComplete={() => { setShowWizard(false); fetchData(); }} 
                />
              </motion.div>
            )
          )}

          {activeTab === 'uidesign' && isAdmin && (
            <motion.div 
              key="cms-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
               <div className="bg-slate-900 p-16 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-4">
                       <Type className="text-indigo-400" /> Landing Content CMS
                     </h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Edite o conteúdo da vitrine pública do Empirion.</p>
                  </div>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Título do Hero Principal</label>
                        <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] text-white font-black text-lg outline-none focus:border-indigo-500 transition-all shadow-inner" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Imagem Dominante (URL)</label>
                        <input value={carouselImages[0]} onChange={e => setCarouselImages([e.target.value])} className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] text-indigo-300 font-mono text-xs outline-none focus:border-indigo-500 transition-all shadow-inner" />
                     </div>
                  </div>
                  <button className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:bg-white hover:text-indigo-900 transition-all active:scale-95 group">
                     <Save size={24} className="group-hover:scale-110 transition-transform" /> Publicar Alterações v13.0
                  </button>
               </div>
               <div className="bg-slate-900 p-16 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-4">
                        <MenuIcon className="text-orange-600" /> Navigation Labels
                     </h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Altere os nomes das seções do menu principal para adequação à campanha atual.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     {['Início', 'Ramos', 'Soluções', 'Contato', 'Recursos', 'Blog'].map(label => (
                       <div key={label} className="p-6 bg-slate-950 border border-white/5 rounded-[1.5rem] flex items-center justify-between group hover:border-orange-500/40 transition-all shadow-inner">
                          <span className="text-[12px] font-black uppercase text-slate-500 group-hover:text-white transition-colors">{label}</span>
                          <button className="p-2.5 bg-white/5 text-slate-600 hover:text-blue-400 rounded-xl transition-all"><FileCode size={18}/></button>
                       </div>
                     ))}
                  </div>
                  <div className="p-6 bg-orange-600/5 border border-orange-500/20 rounded-[2rem] flex items-center gap-5">
                     <ShieldCheck className="text-orange-500" size={24} />
                     <p className="text-[10px] text-slate-400 font-black uppercase leading-tight tracking-widest italic">Alterações globais impactam todos os nodos de renderização pública.</p>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'templates' && isAdmin && (
            <motion.div 
              key="templates-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
               <div className="bg-emerald-600/10 border border-emerald-500/20 p-16 rounded-[5rem] flex flex-col md:flex-row items-center justify-between shadow-2xl gap-10">
                  <div className="flex items-center gap-10">
                     <div className="p-8 bg-emerald-600 text-white rounded-[3rem] shadow-2xl"><Database size={48}/></div>
                     <div className="space-y-3">
                        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Oracle Models Hub</h3>
                        <p className="text-emerald-200/60 text-xs font-black uppercase tracking-[0.4em] italic">Engenharia de Cenários e Tributação Customizada.</p>
                     </div>
                  </div>
                  <button className="px-16 py-8 bg-white text-slate-950 rounded-full font-black text-[12px] uppercase tracking-[0.4em] hover:bg-emerald-600 hover:text-white transition-all shadow-2xl active:scale-95 shrink-0">Criar Master Template</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {CHAMPIONSHIP_TEMPLATES.map(tpl => (
                    <div key={tpl.id} className="bg-slate-900 border border-white/5 p-12 rounded-[4rem] space-y-10 group hover:border-emerald-500/40 transition-all shadow-2xl flex flex-col justify-between min-h-[480px]">
                       <div className="space-y-8">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em] bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20">Oracle Model v6</span>
                             <div className="p-3 bg-white/5 rounded-2xl text-slate-600 group-hover:text-emerald-500 transition-colors"><Settings size={20}/></div>
                          </div>
                          <h4 className="text-4xl font-black text-white uppercase italic tracking-tight leading-[0.9]">{tpl.name}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed italic font-medium">{tpl.description}</p>
                       </div>
                       <div className="pt-10 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">TIER: ORACLE GOLD</span>
                          <button className="text-[10px] font-black uppercase text-blue-400 hover:text-white tracking-[0.3em] transition-all flex items-center gap-3 group-hover:translate-x-3 duration-500">Edit Blueprint <ArrowRight size={16}/></button>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const NavTab = ({ active, onClick, label, color }: any) => {
  const activeClasses = {
    orange: 'bg-orange-600 text-white shadow-[0_15px_40px_rgba(249,115,22,0.4)] border-orange-500 scale-105',
    indigo: 'bg-indigo-600 text-white shadow-[0_15px_40px_rgba(79,70,229,0.4)] border-indigo-500 scale-105',
    emerald: 'bg-emerald-600 text-white shadow-[0_15px_40px_rgba(16,185,129,0.4)] border-emerald-500 scale-105'
  }[color as 'orange' | 'indigo' | 'emerald'];

  return (
    <button 
      onClick={onClick} 
      className={`px-12 py-5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap active:scale-95 border italic ${
        active ? activeClasses : 'bg-slate-950 border-white/5 text-slate-600 hover:bg-white/5 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
};

const TeamInterventionCard = ({ team, onAction }: any) => (
  <div className="bg-slate-900 p-12 rounded-[4.5rem] border border-white/5 space-y-12 shadow-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between min-h-[400px]">
     {/* Fix: Added missing Landmark icon to lucide-react import and using it here */}
     <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none rotate-12">
        <Landmark size={180} />
     </div>
     <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-start">
           <div className="space-y-2">
              <h4 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">{team.name}</h4>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] leading-none">NODE {team.id.slice(0, 8)}</span>
           </div>
           <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
              team.insolvency_status === 'BANKRUPT' ? 'bg-rose-600 text-white border-rose-500/50 animate-pulse' : 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20'
           }`}>
              {team.insolvency_status || 'ESTÁVEL'}
           </span>
        </div>
        <div className="p-6 bg-slate-950/80 rounded-[2rem] border border-white/5 space-y-3 shadow-inner">
           <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-600">
              <span>Equidade</span>
              <span className="text-white font-mono">$ {team.equity?.toLocaleString() || '5.05M'}</span>
           </div>
           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" style={{ width: '70%' }} />
           </div>
        </div>
     </div>
     <div className="grid grid-cols-1 gap-4 relative z-10">
        <button onClick={() => onAction(team.id, 'CAPITAL', 1000000)} className="w-full flex items-center justify-between p-7 bg-slate-950 border border-white/5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-xl active:scale-95 group/btn border-t-emerald-500/20">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl group-hover/btn:bg-white/20"><DollarSign size={20}/></div>
              Aporte de Capital $1M
           </div>
           <Zap size={18} className="opacity-0 group-hover/btn:opacity-100 transition-opacity animate-pulse" />
        </button>
        <button onClick={() => onAction(team.id, 'STATUS', 'SAUDAVEL')} className="w-full flex items-center justify-between p-7 bg-slate-950 border border-white/5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 group/btn border-t-blue-500/20">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover/btn:bg-white/20"><HeartPulse size={20}/></div>
              Revogar Insolventes
           </div>
           <ShieldCheck size={18} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </button>
     </div>
  </div>
);

export default AdminCommandCenter;