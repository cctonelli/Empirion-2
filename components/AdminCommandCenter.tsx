import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Trophy, LayoutGrid, Activity, 
  Monitor, Plus, Trash2, RefreshCw, ArrowLeft,
  Settings, Loader2, Hammer, HeartPulse, DollarSign, 
  Brain, Sparkles, TrendingUp, Palette, FileCode,
  Image as ImageIcon, Type, Menu as MenuIcon, Save,
  X, Terminal, Cpu, Zap, 
  // Fix: Added missing icons ArrowRight and ShieldCheck
  ArrowRight, ShieldCheck 
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
// Fix: Added missing import for CHAMPIONSHIP_TEMPLATES
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

  const isTrialSession = localStorage.getItem('is_trial_session') === 'true';

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
        <header className="flex flex-col md:flex-row items-center justify-between px-6 gap-6">
           <div className="flex items-center gap-6">
              <button onClick={() => setSelectedArena(null)} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all"><ArrowLeft size={24} /></button>
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Arena: <span className="text-orange-500">{selectedArena.name}</span></h1>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">{PROTOCOL_NODE} • {APP_VERSION}</p>
              </div>
           </div>
           <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
              <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Monitor" color="orange" />
              <NavTab active={activeTab === 'interventions'} onClick={() => setActiveTab('interventions')} label="Crise" color="indigo" />
           </div>
        </header>

        {activeTab === 'interventions' ? (
          <div className="space-y-10 px-6">
             <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[3rem] flex items-center gap-6">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><Hammer size={24}/></div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase italic">Módulo de Gestão de Crise</h3>
                   <p className="text-xs text-indigo-200 opacity-70 leading-relaxed uppercase font-bold tracking-widest">Resgate unidades insolventes injetando capital e revogando falências.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {selectedArena.teams?.map((team: Team) => (
                  <TeamInterventionCard key={team.id} team={team} onAction={handleManualIntervention} />
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-10 px-6">
            <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
            <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-2xl"><ShieldAlert size={32} /></div> 
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
              Command <span className="text-orange-600">Center</span>
            </h1>
          </div>
          <p className="text-slate-500 mt-2 font-bold text-[10px] uppercase tracking-[0.4em] italic">Dono da Bola • Governança Global {APP_VERSION}</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 border border-white/5 rounded-2xl p-4 shadow-xl">
           <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">NODE STATUS</span>
              <span className="text-[9px] font-mono text-emerald-500 font-bold mt-1">ACTIVE: {PROTOCOL_NODE}</span>
           </div>
           <div className="w-1.5 h-12 bg-white/5 rounded-full" />
           <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{profile?.name || 'TUTOR MASTER ALPHA'}</span>
           </div>
        </div>
      </div>

      <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar pb-2">
         <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Arenas & Campeonatos" color="orange" />
         <NavTab active={activeTab === 'uidesign'} onClick={() => setActiveTab('uidesign')} label="UI Design (CMS)" color="indigo" />
         <NavTab active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} label="Templates Master" color="emerald" />
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
                className="space-y-12"
              >
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-8 relative z-10">
                       <div className="p-8 bg-orange-600 text-white rounded-[2.5rem] shadow-2xl group-hover:scale-105 transition-transform duration-500"><Plus size={48} /></div>
                       <div>
                          <h3 className="text-4xl font-black text-white uppercase italic tracking-tight leading-none">Criar Nova Arena</h3>
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-3">Implantar novos simuladores industriais ou comerciais.</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setShowWizard(true)} 
                      className="px-16 py-7 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)] active:scale-95 z-10"
                    >
                      Iniciar Orquestração
                    </button>
                    <Sparkles className="absolute -bottom-20 -right-20 opacity-5 text-orange-500 group-hover:scale-150 transition-transform duration-1000 group-hover:rotate-12" size={400} />
                 </div>

                 {loading ? (
                   <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-orange-600" size={48} />
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Sincronizando Nodos...</span>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {championships.map((champ) => (
                        <div key={champ.id} className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl hover:border-orange-500/30 transition-all group flex flex-col justify-between min-h-[340px]">
                           <div>
                              <div className="flex justify-between items-start mb-10">
                                 <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${champ.is_trial ? 'bg-orange-600/10 text-orange-600 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                    {champ.is_trial ? 'Teste Grátis' : 'Arena Live'}
                                 </span>
                                 <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-rose-500 transition-colors">
                                    <Trash2 size={20}/>
                                 </button>
                              </div>
                              <h5 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none mb-4 group-hover:text-orange-500 transition-colors">{champ.name}</h5>
                              <div className="flex items-center gap-4 opacity-40">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><LayoutGrid size={12}/> {champ.branch}</span>
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Activity size={12}/> Ciclo 0{champ.current_round}</span>
                              </div>
                           </div>
                           <button onClick={() => setSelectedArena(champ)} className="w-full py-5 mt-10 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:border-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl">
                              <Monitor size={16}/> Gerenciar Unidade
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
                  className="absolute -top-20 right-0 p-4 text-slate-500 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                >
                  <X size={18} /> Abortar Orquestração
                </button>
                <ChampionshipWizard 
                  isTrial={isTrialSession} 
                  onComplete={() => { setShowWizard(false); fetchData(); }} 
                />
              </motion.div>
            )
          )}

          {activeTab === 'uidesign' && (
            <motion.div 
              key="cms-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
               <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                  <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4">
                    <Type className="text-indigo-400" /> Landing Content CMS
                  </h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título do Hero</label>
                        <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Imagem do Carrossel (URL)</label>
                        <input value={carouselImages[0]} onChange={e => setCarouselImages([e.target.value])} className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-mono text-xs outline-none focus:border-indigo-500 transition-all" />
                     </div>
                  </div>
                  <button className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-white hover:text-indigo-900 transition-all active:scale-95">
                     <Save size={18} /> Publicar Alterações UI
                  </button>
               </div>
               <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                  <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4">
                     <MenuIcon className="text-orange-600" /> Navigation Labels
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Altere os nomes das seções do menu principal para adequação à campanha atual.</p>
                  <div className="grid grid-cols-2 gap-4">
                     {['Início', 'Ramos', 'Soluções', 'Contato'].map(label => (
                       <div key={label} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-orange-500/30 transition-all">
                          <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">{label}</span>
                          <button className="p-2 text-slate-600 hover:text-blue-500 transition-colors"><FileCode size={14}/></button>
                       </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div 
              key="templates-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
               <div className="bg-emerald-600/10 border border-emerald-500/20 p-12 rounded-[4rem] flex flex-col md:flex-row items-center justify-between shadow-xl gap-8">
                  <div className="flex items-center gap-8">
                     <div className="p-6 bg-emerald-600 text-white rounded-[2.5rem] shadow-2xl"><LayoutGrid size={40}/></div>
                     <div>
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Gestão de Modelos Oracle</h3>
                        <p className="text-emerald-100/60 text-xs font-black uppercase tracking-[0.2em] mt-3">Crie templates com regras de tributação e CapEx.</p>
                     </div>
                  </div>
                  <button className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-xl active:scale-95">Novo Template Master</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {CHAMPIONSHIP_TEMPLATES.map(tpl => (
                    <div key={tpl.id} className="bg-slate-900 border border-white/5 p-10 rounded-[3.5rem] space-y-8 group hover:border-emerald-500/30 transition-all shadow-2xl">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-emerald-500 tracking-[0.4em] bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">Ativo Industrial</span>
                          <div className="p-2 bg-white/5 rounded-lg text-slate-500 group-hover:text-emerald-500 transition-colors"><Settings size={14}/></div>
                       </div>
                       <h4 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">{tpl.name}</h4>
                       <p className="text-xs text-slate-500 leading-relaxed italic font-medium">{tpl.description}</p>
                       <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Disponível: Oracle Gold</span>
                          <button className="text-[9px] font-black uppercase text-blue-400 hover:text-white tracking-widest transition-colors flex items-center gap-2 group-hover:translate-x-1 transition-transform">Editar Fórmulas <ArrowRight size={12}/></button>
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
    orange: 'bg-orange-600 text-white shadow-[0_10px_30px_rgba(249,115,22,0.3)] border-orange-500',
    indigo: 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)] border-indigo-500',
    emerald: 'bg-emerald-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-emerald-500'
  }[color as 'orange' | 'indigo' | 'emerald'];

  return (
    <button 
      onClick={onClick} 
      className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap active:scale-95 border ${
        active ? activeClasses : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
};

const TeamInterventionCard = ({ team, onAction }: any) => (
  <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
     <div className="flex justify-between items-start">
        <div className="space-y-1">
           <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">{team.name}</h4>
           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Unit Node {team.id.slice(0, 8)}</span>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
           team.insolvency_status === 'BANKRUPT' ? 'bg-rose-600/10 text-rose-600 border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        }`}>
           {team.insolvency_status || 'ESTÁVEL'}
        </span>
     </div>
     <div className="grid grid-cols-1 gap-4">
        <button onClick={() => onAction(team.id, 'CAPITAL', 1000000)} className="w-full flex items-center justify-between p-6 bg-slate-950 border border-white/5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-95 group/btn">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg group-hover/btn:bg-white/20"><DollarSign size={16}/></div>
              Aporte $1M
           </div>
           <Zap size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </button>
        <button onClick={() => onAction(team.id, 'STATUS', 'SAUDAVEL')} className="w-full flex items-center justify-between p-6 bg-slate-950 border border-white/5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95 group/btn">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover/btn:bg-white/20"><HeartPulse size={16}/></div>
              Revogar Falência
           </div>
           <ShieldCheck size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </button>
     </div>
  </div>
);

export default AdminCommandCenter;