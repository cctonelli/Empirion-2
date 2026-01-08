import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, ShieldCheck, Rocket, Play, Loader2, Bot, 
  ChevronRight, Zap, Info, Factory, Cpu, Star, UserCheck,
  Building2, ArrowRight
} from 'lucide-react';
import { ALPHA_TEST_USERS } from '../constants';
import { silentTestAuth, provisionDemoEnvironment, getChampionships, createTrialTeam } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const TestTerminal: React.FC = () => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trialArenaId, setTrialArenaId] = useState<string | null>(null);
  const [customTeamName, setCustomTeamName] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  useEffect(() => {
    provisionDemoEnvironment();
    const fetchTrialArena = async () => {
      const { data } = await getChampionships();
      const trial = data?.find(a => a.is_trial);
      if (trial) setTrialArenaId(trial.id);
    };
    fetchTrialArena();
  }, []);

  const handleBypass = async (user: any) => {
    setLoadingId(user.id);
    setError(null);
    try {
      const result = await silentTestAuth(user);
      if (result?.data?.session) {
        if (user.role === 'tutor') {
          navigate('/app/admin');
        } else {
          // If it's a predefined team, we need to set the team ID
          if (user.team) {
            localStorage.setItem('active_team_id', user.id); // Predefined users use their ID as team ID in mocks
            localStorage.setItem('active_champ_id', trialArenaId || 'trial-master-node-08');
          }
          navigate('/app/dashboard');
        }
      }
    } catch (err: any) {
      console.error("Bypass Failure:", err);
      setError(`Falha no protocolo Alpha: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTeamName.trim() || !trialArenaId) return;
    
    setIsCreatingCustom(true);
    setError(null);
    try {
      // 1. Create Team in trial_teams
      const newTeam = await createTrialTeam(trialArenaId, customTeamName);
      
      // 2. Perform silent auth as a guest
      const guestUser = {
        id: newTeam.id,
        name: `CEO ${customTeamName}`,
        email: `trial_${newTeam.id}@empirion.ia`,
        role: 'player'
      };
      
      const result = await silentTestAuth(guestUser);
      if (result?.data?.session) {
        localStorage.setItem('active_team_id', newTeam.id);
        localStorage.setItem('active_champ_id', trialArenaId);
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      console.error("Trial Creation Failure:", err);
      setError(`Protocolo de criação interrompido: ${err.message}`);
    } finally {
      setIsCreatingCustom(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] pt-32 pb-32">
      <EmpireParticles />
      <div className="container mx-auto px-6 md:px-24 relative z-10 space-y-16">
        
        {/* Header - High Fidelity WOW */}
        <header className="text-center space-y-6 max-w-4xl mx-auto">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }}
             className="inline-flex p-6 bg-orange-600 text-white rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.3)] mb-4"
           >
              <Rocket size={40} className="animate-pulse" />
           </motion.div>
           <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
              Inicie seu <span className="text-orange-500">Teste Grátis</span>
           </h1>
           <p className="text-xl md:text-2xl text-slate-400 font-medium italic">
             "Modo TRAIL: Acesse instâncias reais da arena Industrial Node 08 e valide sua estratégia."
           </p>
        </header>

        {/* Test Units Selection Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
           
           {/* GUEST CREATION BOX */}
           <div className="bg-slate-900/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-orange-500/20 shadow-2xl flex flex-col justify-between">
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-600 text-white rounded-3xl shadow-xl shadow-orange-500/20">
                       <Building2 size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Criar Unidade Trial</h3>
                       <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Handshake dinâmico • Sandbox v13.2</p>
                    </div>
                 </div>
                 
                 <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                   Inicie sua própria operação sandbox solo. Suas decisões serão auditadas pelo engine Oracle Node 08.
                 </p>

                 <form onSubmit={handleCreateTrial} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nome da Empresa</label>
                       <input 
                         value={customTeamName}
                         onChange={e => setCustomTeamName(e.target.value)}
                         placeholder="Ex: ATLAS INDUSTRIAL"
                         className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-white font-black uppercase tracking-widest outline-none focus:border-orange-500 transition-all placeholder:text-slate-800 shadow-inner"
                       />
                    </div>
                    <button 
                      type="submit"
                      disabled={isCreatingCustom || !customTeamName.trim() || !trialArenaId}
                      className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-orange-950 transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 group"
                    >
                       {isCreatingCustom ? <Loader2 className="animate-spin" /> : <><Rocket size={18} /> Inicializar Comando <ArrowRight className="group-hover:translate-x-2 transition-transform" /></>}
                    </button>
                 </form>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3 text-emerald-500">
                 <ShieldCheck size={16} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Protocolo Trial Master Node 08 Sincronizado</span>
              </div>
           </div>

           {/* PRESET USERS BOX */}
           <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-white/5 rounded-3xl text-orange-500 border border-white/5">
                    <Star size={32} fill="currentColor" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Perfis Pré-configurados</h3>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Unidades de Elite • Fast Access</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {ALPHA_TEST_USERS.map((user) => (
                   <button 
                     key={user.id}
                     onClick={() => handleBypass(user)}
                     disabled={loadingId !== null || isCreatingCustom}
                     className={`group p-6 rounded-3xl border transition-all text-left flex items-center justify-between ${
                        user.role === 'tutor' 
                        ? 'bg-blue-600/5 border-blue-500/20 hover:bg-blue-600 hover:border-white' 
                        : 'bg-white/5 border-white/10 hover:bg-white hover:border-slate-900'
                     }`}
                   >
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white/5 rounded-xl text-white group-hover:bg-white group-hover:text-slate-900 transition-colors">
                            {user.role === 'tutor' ? <UserCheck size={24}/> : <Bot size={24}/>}
                         </div>
                         <div>
                            <h4 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-current">{user.name}</h4>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-current/60">
                               {user.role === 'tutor' ? 'Protocolo: Orquestração' : `Unit: ${user.team}`}
                            </p>
                         </div>
                      </div>
                      {loadingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} className="text-slate-700 group-hover:text-current" />}
                   </button>
                 ))}
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 font-bold text-[9px] uppercase tracking-widest text-center">
                  {error}
                </div>
              )}
           </div>
        </div>

        <div className="max-w-6xl mx-auto p-10 bg-white/5 border border-white/10 rounded-[3rem] flex items-center gap-8 opacity-70">
           <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 shrink-0"><Info size={28}/></div>
           <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
             O **Modo TRAIL** utiliza um ambiente sandbox compartilhado em tempo real. Algumas alterações podem ser resetadas periodicamente pelo Oráculo para manter a integridade do Nodo Industrial 08. Para persistência absoluta e torneios reais, crie uma conta.
           </p>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-4 opacity-40">
           <div className="flex items-center gap-4">
              <Zap className="text-orange-500" />
              <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Sem Cartão de Crédito</span>
           </div>
           <div className="flex items-center gap-4">
              <ShieldCheck className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Acesso Oracle Gold</span>
           </div>
           <div className="flex items-center gap-4">
              <Terminal className="text-blue-500" />
              <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Suporte Node 08 Active</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TestTerminal;