
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Fix: Use motion as any to bypass internal library type resolution issues in this environment
import { motion as _motion } from 'framer-motion';
const motion = _motion as any;
import { 
  Terminal, ShieldCheck, Rocket, Play, Loader2, Bot, 
  ChevronRight, Zap, Info, Factory, Cpu, Star, UserCheck
} from 'lucide-react';
import { ALPHA_TEST_USERS } from '../constants';
import { silentTestAuth, provisionDemoEnvironment } from '../services/supabase';
import EmpireParticles from '../components/EmpireParticles';

const TestTerminal: React.FC = () => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Provisiona o ambiente industrial alpha ao carregar
    provisionDemoEnvironment();
  }, []);

  const handleBypass = async (user: any) => {
    setLoadingId(user.id);
    setError(null);
    try {
      const result = await silentTestAuth(user);
      if (result?.data?.session) {
        // Redirecionamento Direto baseado na Role conforme especificação v12.8
        if (user.role === 'tutor') {
          navigate('/app/admin');
        } else {
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
             "Acesse instâncias reais da arena Empirion e valide sua estratégia em segundos."
           </p>
        </header>

        {/* Test Units Selection Grid */}
        <div className="max-w-6xl mx-auto">
           <div className="bg-slate-900/50 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl text-orange-500"><Star size={24} fill="currentColor" /></div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Seleção de Perfil Grátis</h3>
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Experiência Premium • Período de Avaliação</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Acesso Instantâneo</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 </div>
              </div>

              {error && (
                <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 font-bold text-xs uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {ALPHA_TEST_USERS.map((user) => (
                   <motion.button 
                     key={user.id}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => handleBypass(user)}
                     disabled={loadingId !== null}
                     className={`group p-10 rounded-[3.5rem] border-2 transition-all text-left relative overflow-hidden flex flex-col justify-between min-h-[320px] ${
                        user.role === 'tutor' 
                        ? 'bg-blue-600/5 border-blue-500/20 hover:bg-blue-600 hover:border-white' 
                        : 'bg-orange-600/5 border-orange-500/20 hover:bg-orange-600 hover:border-white'
                     }`}
                   >
                      <div className="relative z-10 space-y-6">
                         <div className="flex justify-between items-start">
                            <div className="p-4 bg-white/5 rounded-2xl text-white group-hover:bg-white group-hover:text-slate-900 transition-colors">
                               {user.role === 'tutor' ? <UserCheck size={32}/> : <Bot size={32}/>}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                               Profile Node {user.id.toUpperCase()}
                            </span>
                         </div>
                         <div>
                            <h4 className="text-3xl font-black text-white uppercase italic tracking-tight">{user.name}</h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 group-hover:text-white/80">
                               {user.role === 'tutor' ? 'Protocolo: Orquestração Total' : `Unidade: ${user.team || 'Alpha Cell'}`}
                            </p>
                         </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-white/20">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 group-hover:text-white">
                            {loadingId === user.id ? 'Sincronizando...' : 'Acessar Instância'}
                         </span>
                         {loadingId === user.id ? <Loader2 size={20} className="animate-spin text-white" /> : <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />}
                      </div>

                      {/* Decoration background icon */}
                      <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
                         {user.role === 'tutor' ? <Cpu size={240}/> : <Factory size={240}/>}
                      </div>
                   </motion.button>
                 ))}
              </div>

              <div className="mt-16 p-8 bg-white/5 border border-white/10 rounded-[3rem] flex items-center gap-6">
                 <div className="p-3 bg-blue-600 rounded-xl text-white"><Info size={24}/></div>
                 <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
                    Nota: O Teste Grátis utiliza um ambiente sandbox compartilhado. Algumas alterações podem ser resetadas periodicamente para manter a integridade do Nodo Industrial 08.
                 </p>
              </div>
           </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-4 opacity-50">
           <div className="flex items-center gap-4">
              <Zap className="text-orange-500" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Sem Cartão de Crédito</span>
           </div>
           <div className="flex items-center gap-4">
              <ShieldCheck className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Acesso Full v12.8.5</span>
           </div>
           <div className="flex items-center gap-4">
              <Terminal className="text-blue-500" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Suporte Oracle Node 08</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TestTerminal;
