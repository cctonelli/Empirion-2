import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, UserProfile, UserRole } from '../types';

/**
 * Supabase Engine v6.4 (Environment-Safe Initialization)
 * Safely resolves variables across Vite (import.meta.env) and 
 * Node/Vercel (process.env) contexts to avoid "undefined" property access errors.
 */
const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const nextKey = `NEXT_PUBLIC_${key}`;
  
  // Safely access import.meta.env if available
  const metaEnv = (import.meta as any).env || {};
  
  // Safely access process.env if available
  const procEnv = (window as any).process?.env || {};
  
  return (
    metaEnv[viteKey] || 
    metaEnv[nextKey] || 
    metaEnv[key] || 
    procEnv[viteKey] || 
    procEnv[nextKey] || 
    procEnv[key] || 
    ''
  );
};

// Use specific project URL as hard fallback for initialization
const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Validation for runtime safety - Warning only to avoid breaking the UI
if (!getSafeEnv('SUPABASE_URL') || !getSafeEnv('SUPABASE_ANON_KEY')) {
  console.warn('Supabase: Missing specific VITE_ environment variables. Using placeholder/project defaults.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Centralized utility for handling PostgrestError (Supabase v2+)
 */
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase Error [${context}]:`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint
  });
  return null;
};

/**
 * Dynamic Content Fetching (v5.5 - Gold)
 */
export const fetchPageContent = async (slug: string, locale: string = 'pt') => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('page_slug', slug)
      .eq('locale', locale)
      .limit(1)
      .maybeSingle();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        handleSupabaseError(error, `fetchPageContent:${slug}`);
      }
      return null;
    }
    return data?.content || null;
  } catch (err) {
    console.warn(`Content fetch failed for ${slug}, utilizing local constants.`);
    return null;
  }
};

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('championships').select('id').limit(1);
    if (error) throw error;
    return { online: true };
  } catch (err: any) {
    handleSupabaseError(err, 'HealthCheck');
    return { online: false, error: err.message || "Connection Refused" };
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();
    
    if (error) {
      if (error.code !== 'PGRST116') handleSupabaseError(error, 'getUserProfile');
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole) => {
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('supabase_user_id', userId);
  if (error) {
    handleSupabaseError(error, 'updateUserRole');
    throw error;
  }
};

export const listAllUsers = async () => {
  return await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData, userName: string) => {
  const { error: decError } = await supabase
    .from('current_decisions')
    .upsert({ 
      team_id: teamId, 
      championship_id: champId, 
      round: round, 
      data: decisions,
      updated_at: new Date().toISOString()
    });

  if (decError) {
    handleSupabaseError(decError, 'saveDecisions');
    throw decError;
  }

  await supabase
    .from('decision_audit_log')
    .insert({
      team_id: teamId,
      user_name: userName,
      action: `Locked decisions for Round ${round}`,
      metadata: { 
        timestamp: new Date().toISOString(),
        agent: navigator.userAgent,
        platform: 'Empirion-Vite-Node'
      }
    });
};

export const updateEcosystem = async (championshipId: string, updates: Partial<Championship>) => {
  const { error } = await supabase.from('championships').update(updates).eq('id', championshipId);
  if (error) {
    handleSupabaseError(error, 'updateEcosystem');
    throw error;
  }
};

export const getPublicChampionships = async () => {
  return await supabase.from('championships').select('*').eq('is_public', true).eq('status', 'active');
};

export const getPublicReports = async (championshipId: string, round: number) => {
  return await supabase.from('public_reports').select('*').eq('championship_id', championshipId).eq('round', round);
};

export const submitCommunityVote = async (vote: any) => {
  return await supabase.from('community_ratings').insert([vote]);
}