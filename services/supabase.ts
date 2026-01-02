
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

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const secureAction = async (action: () => Promise<any>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Acesso negado: Sessão expirada ou inválida.");
  return action();
};

/**
 * ALPHA TERMINAL: Provisionamento Automático
 */
export const provisionDemoEnvironment = async () => {
  try {
    // 1. Verificar se o campeonato demo existe
    const { data: champ } = await supabase.from('championships').select('id').eq('id', DEMO_CHAMPIONSHIP_DATA.id).maybeSingle();
    
    if (!champ) {
      console.log("ALPHA_CORE: Provisionando campeonato de teste...");
      await supabase.from('championships').insert([DEMO_CHAMPIONSHIP_DATA]);
      
      // Criar as 4 equipes iniciais
      const teams = ALPHA_TEST_USERS.filter(u => u.team).map(u => ({
        name: u.team,
        championship_id: DEMO_CHAMPIONSHIP_DATA.id,
        invite_code: `${u.id}2026`,
        initial_financials: DEMO_CHAMPIONSHIP_DATA.initial_financials
      }));
      await supabase.from('teams').insert(teams);
    }
    return true;
  } catch (err) {
    console.error("ALPHA_PROVISION_ERROR:", err);
    return false;
  }
};

/**
 * ALPHA DEBUG: Reset de dados de teste
 */
export const resetAlphaData = async () => {
  return secureAction(async () => {
    // Deleta decisões do campeonato alpha
    const { error } = await supabase
      .from('current_decisions')
      .delete()
      .eq('championship_id', DEMO_CHAMPIONSHIP_DATA.id);
    
    if (error) throw error;

    // Log de auditoria do reset
    await supabase.from('decision_audit_log').insert({
      action: 'ALPHA_TERMINAL_RESET: Full Wipe Executed',
      user_name: 'Alpha Debug Controller',
      metadata: { timestamp: new Date().toISOString() }
    });

    return true;
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  return secureAction(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();
    if (error) return null;
    return data;
  });
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData, userName: string) => {
  return secureAction(async () => {
    const sanitizedData = JSON.parse(JSON.stringify(decisions));
    
    const { error: decError } = await supabase
      .from('current_decisions')
      .upsert({ 
        team_id: teamId, 
        championship_id: champId, 
        round: round, 
        data: sanitizedData,
        updated_at: new Date().toISOString()
      });

    if (decError) throw decError;

    await supabase.from('decision_audit_log').insert({
      team_id: teamId,
      user_name: userName,
      action: `PROTOCOL_SECURE_SAVE: R${round}`,
      metadata: { 
        ip_hash: "PROTECTED", 
        timestamp: new Date().toISOString() 
      }
    });
  });
};

export const getModalities = async (): Promise<Modality[]> => {
  const { data, error } = await supabase
    .from('modalities')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: true });
  return data || [];
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase
    .channel('modalities-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, callback)
    .subscribe();
};

export const listAllUsers = async () => {
  return secureAction(async () => {
    return await supabase.from('users').select('*').order('created_at', { ascending: false });
  });
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  return secureAction(async () => {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('supabase_user_id', userId);
    if (error) throw error;
  });
};

export const updateUserPremiumStatus = async (userId: string, isPremium: boolean) => {
  return secureAction(async () => {
    const { error } = await supabase
      .from('users')
      .update({ is_opal_premium: isPremium })
      .eq('supabase_user_id', userId);
    if (error) throw error;
  });
};

export const fetchPageContent = async (slug: string, locale: string = 'pt') => {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('page_slug', slug)
    .eq('locale', locale)
    .maybeSingle();
  return data?.content || null;
};

export const getPlatformConfig = async () => {
  const { data, error } = await supabase
    .from('platform_config')
    .select('*')
    .maybeSingle();
  if (error) return null;
  return data;
};

export const updatePlatformConfig = async (config: any) => {
  return secureAction(async () => {
    const { error } = await supabase
      .from('platform_config')
      .upsert({ ...config, id: 1 });
    if (error) throw error;
  });
};

export const updateEcosystem = async (champId: string, ecosystemData: any) => {
  return secureAction(async () => {
    const { error } = await supabase
      .from('championships')
      .update(ecosystemData)
      .eq('id', champId);
    if (error) throw error;
  });
};

export const getPublicReports = async (champId: string, round: number) => {
  const { data, error } = await supabase
    .from('public_reports')
    .select('*')
    .eq('championship_id', champId)
    .eq('round', round);
  return { data, error };
};

export const submitCommunityVote = async (vote: any) => {
  return secureAction(async () => {
    const { data, error } = await supabase
      .from('community_votes')
      .insert([vote]);
    return { data, error };
  });
};
