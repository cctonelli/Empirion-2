
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM as any;
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';
import { 
  Shield, Mail, Lock, ChevronLeft, 
  User, AlertTriangle, Loader2, Terminal,
  Phone, AtSign
} from 'lucide-react';
import { APP_VERSION } from '../constants';

interface AuthProps {
  onAuth: () => void;
  onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth, onBack }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type: 'standard' | 'critical' } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data: { session }, error: authError } = await (supabase.auth as any).signInWithPassword({ email, password });
        if (authError) throw authError;
        if (session) onAuth();
      } else {
        if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
           throw new Error("Formato de telefone inválido.");
        }
        if (nickname && !/^[a-zA-Z0-9_]{3,20}$/.test(nickname)) {
           throw new Error("Nickname deve ter de 3 a 20 caracteres.");
        }
        const { error: signUpError } = await (supabase.auth as any).signUp({ 
          email, 
          password,
          options: {
            data: { full_name: name, nickname: nickname, phone: phone }
          }
        });
        if (signUpError) throw signUpError;
        alert(t('success_msg') || 'Check your email!');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError({ message: err.message || 'Error', type: 'standard' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] p-6 font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-30">
        <div className="w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full absolute -top-1/4 -left-1/4 animate-pulse"></div>
        <div className="w-[600px] h-[600px] bg-orange-600/10 blur-[130px] rounded-full absolute -bottom-1/4 -right-1/4 animate-pulse [animation-delay:2s]"></div>
      </div>

      {onBack && (
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all relative z-10">
          <ChevronLeft size={16} /> {t('back')}
        </button>
      )}
      
      <div className="max-w-xl w-full relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/5">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <Shield className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic leading-none">
              {isLogin ? t('login_title') : t('signup_title')}
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder={t('name')} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="email" className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="password" minLength={6} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="text-red-400 shrink-0" size={16} />
                <p className="text-red-400 text-[10px] font-bold uppercase">{error.message}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white hover:bg-white hover:text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : isLogin ? t('submit_login') : t('submit_signup')}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white">
              {isLogin ? t('signup_title') : t('login_title')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
