
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, UserProfile, UserRole, Modality } from '../types';
import { ALPHA_TEST_USERS, DEMO_CHAMPIONSHIP_DATA, CHAMPIONSHIP_TEMPLATES } from '../constants';

const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv[viteKey] || metaEnv[key] || '';
};

const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const isTestMode = getSafeEnv('IS_TEST_MODE') === 'true' || true; 

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

export const silentTestAuth = async (user: typeof ALPHA_TEST_USERS[0]) => {
  if (isTestMode) {
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

  return { data, error };
};

/**
 * Provisiona o ambiente Alpha e a arena ARENA 2026 T2.
 */
export const provisionDemoEnvironment = async () => {
  try {
    const { data: existing } = await supabase.from('championships').select('id').eq('name', 'ARENA 2026 T2').maybeSingle();
    
    if (!existing) {
      console.log("ALPHA_CORE: Criando ARENA 2026 T2...");
      const arenaT2 = {
        ...DEMO_CHAMPIONSHIP_DATA,
        id: 'arena-2026-t2',
        name: 'ARENA 2026 T2',
        description: 'Arena oficial de teste grátis para validacão estratégica v6.0.',
        is_public: true,
        status: 'active'
      };
      await supabase.from('championships').insert([arenaT2]);
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  let query = supabase.from('championships').select('*').order('created_at', { ascending: false });
  if (onlyPublic) query = query.eq('is_public', true).eq('status', 'active');
  return query;
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

export const updateEcosystem = async (champId: string, ecosystemData: any) => {
  return secureAction(async () => {
    await supabase.from('championships').update(ecosystemData).eq('id', champId);
  });
};

export const getPublicReports = async (champId: string, round: number) => {
  const { data, error } = await supabase.from('public_reports').select('*').eq('championship_id', champId).eq('round', round);
  return { data, error };
};

// Fix: Implement missing submitCommunityVote function to allow community judges to cast votes.
export const submitCommunityVote = async (vote: any) => {
  return secureAction(async () => {
    return await supabase.from('community_votes').insert([vote]);
  });
};

export const resetAlphaData = async () => {
  return secureAction(async () => {
    await supabase.from('current_decisions').delete().eq('championship_id', 'arena-2026-t2');
  });
};
