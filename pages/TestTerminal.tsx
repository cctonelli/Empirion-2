
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Terminal, ShieldCheck, Rocket, Play, Loader2, Bot, 
  ChevronRight, Zap, Info, Factory, Cpu
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

  const handleBypass = async (user: typeof ALPHA_TEST_USERS[0]) => {
    setLoadingId(user.id);
    setError(null);
    try {
      const data = await silentTestAuth(user);
      if (data?.session) {
        // Redirecionamento Direto baseado na Role
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
        
        {/* Header */}
        <header className="text-center space-y-6 max-w-4xl mx-auto">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }}
             className="inline-flex p-6 bg-orange-600 text-white rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.3)] mb-4"
           >
              <Terminal size={40} />
           </motion.div>
           <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
              Módulo de <span className="text-orange-500">Testes</span>
           </h1>
           <p className="text-xl md:text-2xl text-slate-400 font-medium italic">
             "Ambiente Alpha: Acesse instantaneamente como Tutor ou Equipe sem formulários."
           </p>
        </header>

        {/* Test Units Selection */}
        <div className="max-w-6xl mx-auto">
           <div className="bg-slate-900/50 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl text-blue-400"><Factory size={24} /></div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Arena Industrial Alpha</h3>
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Snapshot v6.0 GOLD • Engine Ativa</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Acesso 1-Clique Disponível</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 </div>
              </div>

              {error && (
                <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 font-bold text-xs uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {ALPHA_TEST_USERS.map((user) => (
                   <button
                     key={user.id}
                     onClick={() => handleBypass(user)}
                     disabled={!!loadingId}
                     className={`p-8 rounded-[3rem] border transition-all text-left group relative overflow-hidden flex flex-col justify-between min-h-[240px] ${
                        user.role === 'tutor' 
                          ? 'bg-blue-600/10 border-blue-500/20 hover:bg-blue-600 hover:border-blue-400' 
                          : 'bg-white/5 border-white/10 hover:bg-orange-600 hover:border-orange-400 shadow-xl'
                     }`}
                   >
                      <div className="flex items-center justify-between">
                         <div className={`p-4 rounded-2xl ${user.role === 'tutor' ? 'bg-blue-600 text-white' : 'bg-white/10 text-orange-400'} group-hover:bg-white group-hover:text-slate-900 transition-colors`}>
                            {user.role === 'tutor' ? <ShieldCheck size={24} /> : <Zap size={24} />}
                         </div>
                         <div className="text-right">
                            <span className="block text-[8px] font-black text-slate-500 group-hover:text-white/60 uppercase">Protocolo Access</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'tutor' ? 'text-blue-400' : 'text-orange-500'} group-hover:text-white`}>
                              {user.role === 'tutor' ? 'Admin Node' : 'Arena Unit'}
                            </span>
                         </div>
                      </div>

                      <div>
                         <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">{user.name}</h4>
                         <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:text-white/80 transition-colors">
                           {user.team || 'Coordenação Central'}
                         </p>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Ambiente: {user.role === 'tutor' ? 'Master' : 'Alpha'}</span>
                         {loadingId === user.id ? (
                            <Loader2 size={20} className="animate-spin text-white" />
                         ) : (
                            <div className="p-2 bg-white/5 rounded-full group-hover:bg-white group-hover:text-slate-900 transition-all">
                               <Play size={14} fill="currentColor" />
                            </div>
                         )}
                      </div>

                      {/* Ripple Effect Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   </button>
                 ))}
              </div>
           </div>

           <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
              <div className="flex items-center gap-4 text-slate-500">
                 <Bot size={32} />
                 <p className="text-[10px] font-black uppercase tracking-widest max-w-sm leading-relaxed">
                   "O modo de testes permite simular fluxos de decisão em tempo real entre o tutor e as equipes para validar a integridade do motor Empirion."
                 </p>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Engine Version 6.0 GOLD Build</span>
                 <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-blue-400 uppercase">
                   Protocol Node: 08
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TestTerminal;
