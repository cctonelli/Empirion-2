import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Trophy, LayoutGrid, Activity, 
  Monitor, Plus, Trash2, RefreshCw, ArrowLeft,
  Settings, Loader2, Hammer, HeartPulse, DollarSign, 
  Brain, Sparkles, TrendingUp, Palette, FileCode,
  Image as ImageIcon, Type, Menu as MenuIcon, Save
} from 'lucide-react';
import { 
  getChampionships, 
  deleteChampionship, 
  supabase 
} from '../services/supabase';
import { getTutorOutlook } from '../services/gemini';
import { CHAMPIONSHIP_TEMPLATES } from '../constants';
import { Championship, Team, InsolvencyStatus } from '../types';
import ChampionshipWizard from './ChampionshipWizard';
import TutorArenaControl from './TutorArenaControl';
import TutorDecisionMonitor from './TutorDecisionMonitor';
import OracleHealthCheck from './OracleHealthCheck';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCommandCenter: React.FC<{ preTab?: string }> = ({ preTab = 'tournaments' }) => {
  const [activeTab, setActiveTab] = useState(preTab);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Championship | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // UI CMS State
  const [heroTitle, setHeroTitle] = useState('Forje Seu Império');
  const [carouselImages, setCarouselImages] = useState(['https://images.unsplash.com/photo-1565106430482-8f6e74349ca1']);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await getChampionships();
    if (data) setChampionships(data);
    setLoading(false);
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

  if (selectedArena) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
        <header className="flex flex-col md:flex-row items-center justify-between px-4 gap-6">
           <div className="flex items-center gap-6">
              <button onClick={() => setSelectedArena(null)} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all"><ArrowLeft size={24} /></button>
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Arena: <span className="text-orange-500">{selectedArena.name}</span></h1>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Oracle Gold Build v12.9.1</p>
              </div>
           </div>
           <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
              <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Monitor" color="orange" />
              <NavTab active={activeTab === 'interventions'} onClick={() => setActiveTab('interventions')} label="Crise" color="indigo" />
           </div>
        </header>

        {activeTab === 'interventions' ? (
          <div className="space-y-10 px-4">
             <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[3rem] flex items-center gap-6">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><Hammer size={24}/></div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase italic">Módulo de Gestão de Crise</h3>
                   <p className="text-xs text-indigo-200 opacity-70 leading-relaxed uppercase font-bold">Resgate unidades insolventes injetando capital.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {selectedArena.teams?.map((team: Team) => (
                  <TeamInterventionCard key={team.id} team={team} onAction={handleManualIntervention} />
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-10">
            <TutorDecisionMonitor championshipId={selectedArena.id} round={selectedArena.current_round + 1} />
            <TutorArenaControl championship={selectedArena} onUpdate={(u) => setSelectedArena({...selectedArena, ...u})} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-5xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter italic">
            <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-2xl"><ShieldAlert size={32} /></div> 
            Command <span className="text-orange-600">Center</span>
          </h1>
          <p className="text-slate-500 mt-2 font-bold text-xs uppercase tracking-[0.3em] italic">Dono da Bola • Governança Global v12.9.1</p>
        </div>
      </div>

      <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-2">
         <NavTab active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} label="Arenas & Campeonatos" color="orange" />
         <NavTab active={activeTab === 'uidesign'} onClick={() => setActiveTab('uidesign')} label="UI Design (CMS)" color="indigo" />
         <NavTab active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} label="Templates Master" color="emerald" />
      </div>

      <div className="px-4">
        {activeTab === 'tournaments' && (
          !showWizard ? (
            <div className="space-y-12">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="p-6 bg-orange-600 text-white rounded-[2rem] shadow-2xl"><Plus size={40} /></div>
                     <div>
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Criar Nova Arena</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Implantar novos simuladores industriais ou comerciais.</p>
                     </div>
                  </div>
                  <button onClick={() => setShowWizard(true)} className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-2xl">Iniciar Orquestração</button>
                  <Sparkles className="absolute -bottom-10 -right-10 opacity-5 text-orange-500 group-hover:scale-150 transition-transform duration-1000" size={300} />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {championships.map((champ) => (
                    <div key={champ.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between">
                       <div>
                          <div className="flex justify-between items-start mb-8">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${champ.is_trial ? 'bg-orange-600/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'}`}>{champ.is_trial ? 'Teste Grátis' : 'Arena Live'}</span>
                             <button onClick={() => deleteChampionship(champ.id, !!champ.is_trial).then(fetchData)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
                          </div>
                          <h5 className="text-3xl font-black text-slate-900 uppercase italic leading-none mb-6">{champ.name}</h5>
                       </div>
                       <button onClick={() => setSelectedArena(champ)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl"><Monitor size={16}/> Gerenciar Unidade</button>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <ChampionshipWizard onComplete={() => { setShowWizard(false); fetchData(); }} />
          )
        )}

        {activeTab === 'uidesign' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-10">
             <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
                <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-4">
                  <Type className="text-indigo-400" /> Landing Content CMS
                </h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Título do Hero</label>
                      <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Imagem do Carrossel (URL)</label>
                      <input value={carouselImages[0]} onChange={e => setCarouselImages([e.target.value])} className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-mono text-xs outline-none focus:border-indigo-500" />
                   </div>
                </div>
                <button className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-white hover:text-indigo-900 transition-all">
                   <Save size={18} /> Publicar Alterações UI
                </button>
             </div>
             <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic flex items-center gap-4">
                   <MenuIcon className="text-orange-600" /> Navigation Labels
                </h3>
                <p className="text-sm text-slate-500 font-medium">Altere os nomes das seções do menu principal para adequação à campanha atual.</p>
                <div className="grid grid-cols-2 gap-4">
                   {['Início', 'Ramos', 'Soluções', 'Contato'].map(label => (
                     <div key={label} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between group">
                        <span className="text-[10px] font-black uppercase text-slate-600">{label}</span>
                        <button className="p-2 text-slate-300 group-hover:text-blue-600"><FileCode size={14}/></button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-10 animate-in zoom-in-95">
             <div className="bg-emerald-600/10 border border-emerald-500/20 p-12 rounded-[4rem] flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-6">
                   <div className="p-5 bg-emerald-600 text-white rounded-[2rem] shadow-2xl"><LayoutGrid size={32}/></div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Gestão de Modelos Oracle</h3>
                      <p className="text-emerald-100/60 text-sm font-medium">Crie templates com regras específicas de tributação e CapEx para cada setor.</p>
                   </div>
                </div>
                <button className="px-10 py-5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-xl">Novo Template</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {CHAMPIONSHIP_TEMPLATES.map(tpl => (
                  <div key={tpl.id} className="bg-slate-900 border border-white/5 p-10 rounded-[3.5rem] space-y-6 group hover:border-emerald-500/30 transition-all">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Ativo Industrial</span>
                        <div className="p-2 bg-white/5 rounded-lg text-slate-500"><Settings size={14}/></div>
                     </div>
                     <h4 className="text-2xl font-black text-white uppercase italic">{tpl.name}</h4>
                     <p className="text-xs text-slate-500 leading-relaxed italic">{tpl.description}</p>
                     <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-slate-600">Disponível em: Trial</span>
                        <button className="text-[9px] font-black uppercase text-blue-400 hover:text-white transition-colors">Editar Fórmulas</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavTab = ({ active, onClick, label, color }: any) => {
  const activeClasses = {
    orange: 'bg-orange-600 text-white shadow-orange-500/20',
    indigo: 'bg-indigo-600 text-white shadow-indigo-500/20',
    emerald: 'bg-emerald-600 text-white shadow-emerald-500/20'
  }[color as 'orange' | 'indigo' | 'emerald'];

  return (
    <button onClick={onClick} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-xl active:scale-95 ${active ? activeClasses : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}>{label}</button>
  );
};

const TeamInterventionCard = ({ team, onAction }: any) => (
  <div className="bg-slate-900 p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
     <div className="flex justify-between items-center">
        <h4 className="text-2xl font-black text-white uppercase italic">{team.name}</h4>
        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${team.insolvency_status === 'BANKRUPT' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>{team.insolvency_status || 'ESTÁVEL'}</span>
     </div>
     <div className="grid grid-cols-1 gap-3">
        <button onClick={() => onAction(team.id, 'CAPITAL', 1000000)} className="w-full flex items-center gap-3 p-5 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg">
           <DollarSign size={16}/> Injetar Aporte $1M
        </button>
        <button onClick={() => onAction(team.id, 'STATUS', 'SAUDAVEL')} className="w-full flex items-center gap-3 p-5 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg">
           <HeartPulse size={16}/> Revogar Falência
        </button>
     </div>
  </div>
);

export default AdminCommandCenter;