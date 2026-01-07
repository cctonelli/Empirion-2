import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Trophy, LayoutGrid, Activity, 
  Monitor, Plus, Trash2, RefreshCw, ArrowLeft,
  Settings, Loader2, Hammer, HeartPulse, DollarSign, 
  Brain, Sparkles, TrendingUp, Palette, FileCode,
  Image as ImageIcon, Type, Menu as MenuIcon, Save,
  X, Terminal, Cpu, Zap, ArrowRight, ShieldCheck,
  Globe, Database, Command, Users, Landmark,
  BarChart3, Eye, Layers, CreditCard, Gauge
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

  // UI / CMS / Branding State
  const [heroTitle, setHeroTitle] = useState('Forje Seu Império');
  const [accentColor, setAccentColor] = useState('#f97316');
  const [baseFontSize, setBaseFontSize] = useState(14);

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

  const isAdmin = profile?.role === 'admin';
  const isTrialSession = localStorage.getItem('is_trial_session') === 'true';

  // Métricas exclusivas do Administrador Geral do Sistema
  const SystemMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
       <MetricCard label="Usuários Online" val="1.422" icon={<Users className="text-emerald-500"/>} trend="+12%" />
       <MetricCard label="Arenas Ativas" val={championships.length.toString()} icon={<Globe className="text-blue-500"/>} trend="Stable" />
       <MetricCard label="Receita SaaS (Mês)" val="R$ 48.200" icon={<CreditCard className="text-amber-500"/>} trend="+5.4%" />
       <MetricCard label="Nodo Latência" val="14ms" icon={<Gauge className="text-indigo-500"/>} trend="Optimal" />
    </div>
  );

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between px-6 gap-6">
           <div className="flex items-center gap-6">
              <button onClick={() => setSelectedArena(null)} className="p-5 bg-white/5 text-slate-400 hover:text-white rounded-[1.5rem] border border-white/5 transition-all shadow-xl active:scale-95"><ArrowLeft size={28} /></button>
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Arena: <span className="text-orange-500">{selectedArena.name}</span></h1>
                 <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mt-3 italic">Controle do Tutor • Orquestração P0{selectedArena.current_round}</p>
              </div>
           </div>
        </header>

        <div className="space-y-12 px-6">
          <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
          <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
        </div>
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
          <p className="text-slate-500 font-black text-[12px] uppercase tracking-[0.4em] italic pl-2">Governança Global Node 08 • Dono da Bola</p>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
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
             <NavTab active={activeTab === 'uidesign'} onClick={() => setActiveTab('uidesign')} label="UI Design & CMS" color="indigo" />
             <NavTab active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} label="Templates Oracle" color="emerald" />
             <NavTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Métricas de Sistema" color="indigo" />
           </>
         )}
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'system' && isAdmin && (
            <motion.div key="sys" initial={{opacity:0}} animate={{opacity:1}} className="space-y-12">
               <SystemMetrics />
               <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 shadow-2xl">
                  <h3 className="text-2xl font-black text-white uppercase italic mb-8 flex items-center gap-4"><Gauge className="text-indigo-400" /> Monitoramento de Infraestrutura</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <StatusNode label="API Gateway" ping="8ms" status="healthy" />
                     <StatusNode label="Gemini Core" ping="112ms" status="healthy" />
                     <StatusNode label="Supabase Sync" ping="24ms" status="healthy" />
                     <StatusNode label="Vercel Edge" ping="4ms" status="healthy" />
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'tournaments' && (
            !showWizard ? (
              <motion.div key="list" initial={{opacity:0}} animate={{opacity:1}} className="space-y-16">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-900 p-16 rounded-[5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-10 relative z-10">
                       <div className="p-10 bg-orange-600 text-white rounded-[3rem] shadow-2xl"><Plus size={64} /></div>
                       <div>
                          <h3 className="text-5xl font-black text-white uppercase italic tracking-tight leading-none">Criar Nova Arena</h3>
                          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mt-5 leading-relaxed italic max-w-xl">Implantar novos simuladores industriais, comerciais ou novos ramos no sistema.</p>
                       </div>
                    </div>
                    <button onClick={() => setShowWizard(true)} className="px-20 py-8 bg-white text-slate-950 rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95 z-10 shrink-0">Iniciar Orquestração</button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {championships.map((champ) => (
                      <div key={champ.id} className="bg-slate-900/50 p-12 rounded-[4rem] border border-white/5 shadow-2xl hover:border-orange-500/40 transition-all flex flex-col justify-between min-h-[420px]">
                         <div>
                            <div className="flex justify-between items-start mb-12">
                               <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${champ.is_trial ? 'bg-orange-600/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                  {champ.is_trial ? 'Free Trial' : 'Arena Live'}
                               </span>
                               <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-4 bg-white/5 rounded-2xl text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={24}/></button>
                            </div>
                            <h5 className="text-4xl font-black text-white uppercase italic tracking-tight mb-6">{champ.name}</h5>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">{champ.branch} Node</p>
                         </div>
                         <button onClick={() => setSelectedArena(champ)} className="w-full py-6 mt-12 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-orange-600 transition-all flex items-center justify-center gap-4 shadow-2xl">
                            <Monitor size={20} /> Painel do Tutor
                         </button>
                      </div>
                    ))}
                 </div>
              </motion.div>
            ) : (
              <motion.div key="wizard" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}}>
                <button onClick={() => setShowWizard(false)} className="absolute -top-24 right-0 p-6 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all"><X size={20} /> Abortar Setup</button>
                <ChampionshipWizard isTrial={isTrialSession} onComplete={() => { setShowWizard(false); fetchData(); }} />
              </motion.div>
            )
          )}

          {activeTab === 'uidesign' && isAdmin && (
            <motion.div key="cms" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-slate-900 p-16 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-4"><Type className="text-indigo-400" /> Vitrine Principal</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Edite o conteúdo público do Empirion.</p>
                  </div>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Título do Hero Principal</label>
                        <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full p-6 bg-white/5 border border-white/10 rounded-[1.5rem] text-white font-black text-lg outline-none" />
                     </div>
                  </div>
                  <button className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:bg-white hover:text-indigo-950 transition-all">
                     <Save size={24} /> Publicar no Site
                  </button>
               </div>

               <div className="bg-slate-900 p-16 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-white uppercase italic flex items-center gap-4"><Palette className="text-orange-500" /> Branding Engine</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Controle cores e escala visual global.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cor de Destaque</label>
                        <div className="flex gap-4 items-center">
                           <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-2 cursor-pointer" />
                           <span className="font-mono text-white font-black">{accentColor.toUpperCase()}</span>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Fonte Base (px)</label>
                        <input type="number" value={baseFontSize} onChange={e => setBaseFontSize(Number(e.target.value))} className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-center" />
                     </div>
                  </div>
                  <div className="p-6 bg-orange-600/5 border border-orange-500/20 rounded-[2rem] flex items-center gap-5">
                     <ShieldCheck className="text-orange-500" size={24} />
                     <p className="text-[10px] text-slate-400 font-black uppercase leading-tight tracking-widest italic">Alterações impactam globalmente todos os ambientes de jogo.</p>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'templates' && isAdmin && (
            <motion.div key="tpl" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {CHAMPIONSHIP_TEMPLATES.map(tpl => (
                 <div key={tpl.id} className="bg-slate-900 border border-white/5 p-12 rounded-[4rem] flex flex-col justify-between min-h-[480px] shadow-2xl group hover:border-emerald-500/40 transition-all">
                    <div className="space-y-8">
                       <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em] bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20 w-fit">Oracle Gold Blueprint</span>
                       <h4 className="text-4xl font-black text-white uppercase italic tracking-tight leading-[0.9]">{tpl.name}</h4>
                       <p className="text-sm text-slate-500 leading-relaxed italic font-medium">{tpl.description}</p>
                    </div>
                    <button className="text-[10px] font-black uppercase text-blue-400 hover:text-white tracking-[0.3em] transition-all flex items-center gap-3">Edit Blueprint <ArrowRight size={16}/></button>
                 </div>
               ))}
               <button className="border-4 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center gap-6 p-12 text-slate-600 hover:text-white hover:border-white/20 transition-all group">
                  <div className="p-8 bg-white/5 rounded-full group-hover:bg-orange-600 transition-all"><Plus size={48} /></div>
                  <span className="text-xl font-black uppercase tracking-tighter italic">Novo Ramo / Template</span>
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const NavTab = ({ active, onClick, label, color }: any) => {
  const activeClasses = {
    orange: 'bg-orange-600 text-white border-orange-500 shadow-[0_15px_40px_rgba(249,115,22,0.4)]',
    indigo: 'bg-indigo-600 text-white border-indigo-500 shadow-[0_15px_40px_rgba(79,70,229,0.4)]',
    emerald: 'bg-emerald-600 text-white border-emerald-500 shadow-[0_15px_40px_rgba(16,185,129,0.4)]'
  }[color as 'orange' | 'indigo' | 'emerald'];

  return (
    <button onClick={onClick} className={`px-12 py-5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap border italic active:scale-95 ${active ? activeClasses : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-300'}`}>
      {label}
    </button>
  );
};

const MetricCard = ({ label, val, icon, trend }: any) => (
  <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-4">
     <div className="flex justify-between items-center">
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{trend}</span>
     </div>
     <div>
        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-3xl font-black text-white font-mono">{val}</span>
     </div>
  </div>
);

const StatusNode = ({ label, ping, status }: any) => (
  <div className="p-6 bg-slate-950/80 border border-white/5 rounded-3xl flex items-center justify-between">
     <div className="space-y-1">
        <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-white font-mono">{ping}</span>
     </div>
     <div className={`w-3 h-3 rounded-full ${status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
  </div>
);

export default AdminCommandCenter;