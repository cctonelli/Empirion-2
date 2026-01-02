
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Shield, Mail, Lock, LogIn, UserPlus, ChevronLeft, User, AlertTriangle, Settings } from 'lucide-react';
// Import framer-motion components to fix "Cannot find name 'AnimatePresence'" and "Cannot find name 'motion'" errors
import { motion, AnimatePresence } from 'framer-motion';

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type: 'standard' | 'critical' } | null>(null);

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
          options: {
            data: {
              full_name: name,
            }
          }
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado! Se o e-mail de confirmação estiver ativo, verifique sua caixa de entrada.');
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Auth Failure Node:", err);
      
      // Detecção de Provedor Desativado (Erro específico do Supabase)
      if (err.message?.toLowerCase().includes('email logins are disabled')) {
        setError({
          message: 'PROTOCOL_ALERT: O login via e-mail está desativado no painel administrativo do Supabase. Ative o provedor de "Email" em Authentication > Providers.',
          type: 'critical'
        });
      } else {
        setError({
          message: err.message || 'Falha na autenticação do sinal. Verifique as credenciais.',
          type: 'standard'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/app' }
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      setError({ message: 'Falha na sincronização via Google Auth.', type: 'standard' });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 font-sans relative overflow-hidden">
      {/* Background decoration */}
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
      
      <div className="max-w-md w-full space-y-8 bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-500 relative z-10">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
            <Shield className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic italic leading-none">
            {isLogin ? 'Command Access' : 'New Empire'}
          </h2>
          <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Protocolo de Acesso Strategos</p>
        </div>

        <div className="space-y-6">
          {isLogin && (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all disabled:opacity-50 shadow-xl"
              >
                {googleLoading ? (
                  <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></span>
                ) : (
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                )}
                Sincronizar Google
              </button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">Canal Terminal</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>
            </>
          )}

          <form className="space-y-4" onSubmit={handleAuth}>
            <div className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                    placeholder="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border ${error?.type === 'critical' ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-600`}
                  placeholder="E-mail de Operador"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 border ${error?.type === 'critical' ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-600`}
                  placeholder="Chave de Criptografia"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 ${error.type === 'critical' ? 'bg-red-500/20 border-red-500/40' : 'bg-red-500/10 border-red-500/20'} border rounded-2xl space-y-2`}
                >
                  <div className="flex items-start gap-3">
                    {error.type === 'critical' ? <Settings className="text-red-400 shrink-0" size={16} /> : <AlertTriangle className="text-red-400 shrink-0" size={16} />}
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                      {error.message}
                    </p>
                  </div>
                  {error.type === 'critical' && (
                    <div className="pt-2 border-t border-red-500/20">
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                        Status: Bloqueio de Kernel • Provedor Inativo
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full flex items-center justify-center gap-2 py-4 px-6 ${error?.type === 'critical' ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white hover:bg-white hover:text-slate-950'} rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all disabled:opacity-50 shadow-2xl active:scale-95`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : isLogin ? (
                <><LogIn size={18} /> Transmitir Credenciais</>
              ) : (
                <><UserPlus size={18} /> Inicializar Nodo</>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            {isLogin ? "Requisitar Novo Acesso" : "Autenticar Existente"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
