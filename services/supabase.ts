
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, UserProfile, UserRole, Modality } from '../types';
import { ALPHA_TEST_USERS, DEMO_CHAMPIONSHIP_DATA } from '../constants';

const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv[viteKey] || metaEnv[key] || '';
};

const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const isTestMode = getSafeEnv('IS_TEST_MODE') === 'true' || true; // Ativado por padrão no MVP para evitar erros de e-mail

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const secureAction = async (action: () => Promise<any>) => {
  if (isTestMode && localStorage.getItem('empirion_demo_session')) {
    return action();
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Acesso negado: Sessão expirada ou inválida.");
  return action();
};

/**
 * ALPHA TERMINAL: Protocolo de Autenticação Inabalável
 * Em Test Mode, injeta uma sessão mock para evitar validações de e-mail do servidor.
 */
export const silentTestAuth = async (user: typeof ALPHA_TEST_USERS[0]) => {
  if (isTestMode) {
    console.log("ALPHA_CORE: Injetando Sessão Simulada para", user.email);
    const mockSession = {
      user: { id: user.id, email: user.email, user_metadata: { full_name: user.name, role: user.role } },
      access_token: 'demo-token-bypass',
      expires_in: 3600
    };
    localStorage.setItem('empirion_demo_session', JSON.stringify(mockSession));
    return { data: { session: mockSession }, error: null };
  }

  const testPassword = 'empirion_alpha_2026';
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email.trim(),
    password: testPassword
  });

  if (error) {
    // Tenta registrar se for a primeira vez e não estiver em modo demo
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: user.email,
      password: testPassword,
      options: { data: { full_name: user.name, role: user.role } }
    });
    if (signUpError) throw signUpError;
    return { data: signUpData, error: null };
  }

  return { data, error };
};

export const provisionDemoEnvironment = async () => {
  try {
    const { data: champ } = await supabase.from('championships').select('id').eq('id', DEMO_CHAMPIONSHIP_DATA.id).maybeSingle();
    if (!champ) {
      console.log("ALPHA_CORE: Provisionando banco de dados...");
      await supabase.from('championships').insert([DEMO_CHAMPIONSHIP_DATA]);
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (isTestMode) {
    const user = ALPHA_TEST_USERS.find(u => u.id === userId) || ALPHA_TEST_USERS[0];
    return {
      id: user.id,
      supabase_user_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      is_opal_premium: true,
      created_at: new Date().toISOString()
    };
  }
  return secureAction(async () => {
    const { data } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
    return data;
  });
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData, userName: string) => {
  return secureAction(async () => {
    const { error } = await supabase.from('current_decisions').upsert({ 
      team_id: teamId, championship_id: champId, round, data: decisions 
    });
    if (error) throw error;
  });
};

export const getModalities = async (): Promise<Modality[]> => {
  const { data } = await supabase.from('modalities').select('*').eq('is_public', true);
  return data || [];
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase.channel('modalities-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, callback).subscribe();
};

export const listAllUsers = async () => {
  return secureAction(async () => {
    return await supabase.from('users').select('*').order('created_at', { ascending: false });
  });
};

export const updateUserPremiumStatus = async (userId: string, isPremium: boolean) => {
  return secureAction(async () => {
    await supabase.from('users').update({ is_opal_premium: isPremium }).eq('supabase_user_id', userId);
  });
};

export const fetchPageContent = async (slug: string, locale: string = 'pt') => {
  const { data } = await supabase.from('site_content').select('content').eq('page_slug', slug).eq('locale', locale).maybeSingle();
  return data?.content || null;
};

export const getPlatformConfig = async () => {
  const { data } = await supabase.from('platform_config').select('*').maybeSingle();
  return data;
};

export const updatePlatformConfig = async (config: any) => {
  return secureAction(async () => {
    await supabase.from('platform_config').upsert({ ...config, id: 1 });
  });
};

export const updateEcosystem = async (champId: string, ecosystemData: any) => {
  return secureAction(async () => {
    await supabase.from('championships').update(ecosystemData).eq('id', champId);
  });
};

export const getPublicReports = async (champId: string, round: number) => {
  const { data, error } = await supabase.from('public_reports').select('*').eq('championship_id', champId).eq('round', round);
  return { data, error };
};

export const submitCommunityVote = async (vote: any) => {
  return secureAction(async () => {
    return await supabase.from('community_votes').insert([vote]);
  });
};

export const resetAlphaData = async () => {
  return secureAction(async () => {
    await supabase.from('current_decisions').delete().eq('championship_id', DEMO_CHAMPIONSHIP_DATA.id);
  });
};
