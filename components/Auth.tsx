
import React, { useState, useEffect } from 'react';
import { supabase, provisionDemoEnvironment } from '../services/supabase';
import { 
  Shield, Mail, Lock, LogIn, UserPlus, ChevronLeft, 
  User, AlertTriangle, Settings, Zap, ShieldCheck, 
  Bot, Terminal, Rocket, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALPHA_TEST_USERS } from '../constants';

interface AuthProps {
  onAuth: () => void;
  onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [alphaLoading, setAlphaLoading] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; type: 'standard' | 'critical' } | null>(null);

  useEffect(() => {
    // Inicializa o ambiente demo silenciosamente
    provisionDemoEnvironment();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        if (data.session) onAuth();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: name } }
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado! Se o e-mail de confirmação estiver ativo, verifique sua caixa de entrada.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError({ message: err.message || 'Falha na autenticação.', type: 'standard' });
    } finally {
      setLoading(false);
    }
  };

  const handleAlphaLogin = async (user: typeof ALPHA_TEST_USERS[0]) => {
    setAlphaLoading(user.id);
    setError(null);
    try {
      // Nota: Senha padrão para usuários de teste no Supabase provisionado
      const testPassword = 'empirion_alpha_2026';
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: user.email, 
        password: testPassword 
      });

      if (authError) {
        // Se o usuário não existir, tentamos criar rapidamente (fluxo alpha desburocratizado)
        if (authError.message.includes('Invalid login credentials')) {
          const { error: regError } = await supabase.auth.signUp({ 
            email: user.email, 
            password: testPassword,
            options: { data: { full_name: user.name, role: user.role } }
          });
          if (regError) throw regError;
          // Tentar login novamente após auto-reg
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ 
            email: user.email, 
            password: testPassword 
          });
          if (retryError) throw retryError;
          if (retryData.session) onAuth();
        } else {
          throw authError;
        }
      } else if (data.session) {
        onAuth();
      }
    } catch (err: any) {
      setError({ message: `Erro no Terminal Alpha: ${err.message}`, type: 'standard' });
    } finally {
      setAlphaLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] p-6 font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-30">
        <div className="w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full absolute -top-1/4 -left-1/4 animate-pulse"></div>
        <div className="w-[600px] h-[600px] bg-orange-600/10 blur-[130px] rounded-full absolute -bottom-1/4 -right-1/4 animate-pulse [animation-delay:2s]"></div>
      </div>

      {onBack && (
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all relative z-10"
        >
          <ChevronLeft size={16} /> Voltar para o Portal
        </button>
      )}
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        
        {/* LOGIN TRADICIONAL */}
        <div className="bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <Shield className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic leading-none">
              {isLogin ? 'Command Access' : 'New Empire'}
            </h2>
            <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest italic">Acesso via Protocolo Seguro</p>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input required className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none" placeholder="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="email" className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="password" minLength={6} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="text-red-400 shrink-0" size={16} />
                <p className="text-red-400 text-[10px] font-bold uppercase">{error.message}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white hover:bg-white hover:text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all disabled:opacity-50 shadow-2xl active:scale-95">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : isLogin ? 'Transmitir Credenciais' : 'Inicializar Nodo'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
              {isLogin ? "Requisitar Novo Acesso" : "Autenticar Existente"}
            </button>
          </div>
        </div>

        {/* ALPHA TERMINAL (DESBUROCRATIZAÇÃO) */}
        <div className="bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[3rem] border-2 border-orange-500/20 shadow-2xl space-y-8 flex flex-col justify-between">
           <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-lg"><Terminal size={24} /></div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Alpha Terminal</h3>
                      <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.3em] italic">Modo de Teste Interno Ativo</p>
                   </div>
                </div>
                <div className="flex gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>

              <div className="space-y-4">
                 <p className="text-slate-400 text-xs font-medium leading-relaxed italic mb-6">
                    "Acesso desburocratizado para avaliação da engine e matemáticas do MVP. Selecione uma identidade para entrar na Arena."
                 </p>

                 <div className="grid grid-cols-1 gap-3">
                    {ALPHA_TEST_USERS.map(user => (
                      <button 
                        key={user.id}
                        onClick={() => handleAlphaLogin(user)}
                        disabled={!!alphaLoading}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                          user.role === 'tutor' 
                            ? 'bg-blue-600/10 border-blue-500/30 hover:bg-blue-600 hover:border-blue-400' 
                            : 'bg-white/5 border-white/10 hover:bg-orange-600 hover:border-orange-400'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20">
                               {user.role === 'tutor' ? <ShieldCheck size={18} className="text-blue-400 group-hover:text-white" /> : <Rocket size={18} className="text-orange-400 group-hover:text-white" />}
                            </div>
                            <div className="text-left">
                               <span className="block text-[10px] font-black text-white uppercase tracking-widest">{user.name}</span>
                               <span className="text-[8px] font-bold text-slate-500 group-hover:text-white/60 uppercase">{user.team || 'Coordenador da Arena'}</span>
                            </div>
                         </div>
                         {alphaLoading === user.id ? <Loader2 size={16} className="animate-spin text-white" /> : <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-all" />}
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-white/5 flex items-center gap-4">
              <Bot className="text-orange-500" size={20} />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                 Strategos Alpha provisionou automaticamente o campeonato de teste <span className="text-white italic">"Indústria Brasileira"</span> com Ativo Inicial de R$ 19M.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
