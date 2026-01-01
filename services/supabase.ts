
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, UserProfile, UserRole } from '../types';

// Robust environment variable resolution for Vite/Vercel/Next.js compatibility
// Fix: Use any cast to access env on import.meta to avoid TS error in mixed environments where ImportMeta is not fully typed
const SUPABASE_URL = 
  ((import.meta as any).env?.VITE_SUPABASE_URL) || 
  (process.env?.NEXT_PUBLIC_SUPABASE_URL) || 
  (process.env?.SUPABASE_URL) ||
  'https://gkmjlejeqndfdvxxvuxa.supabase.co';

// Fix: Use any cast to access env on import.meta to avoid TS error in mixed environments where ImportMeta is not fully typed
const SUPABASE_ANON_KEY = 
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  (process.env?.SUPABASE_ANON_KEY) ||
  ''; // Fallback to empty to prevent startup crash, though auth will fail if missing

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Dynamic Content Fetching (v5.1)
 * Adicionado fallback resiliente para evitar tela preta em caso de erro 406 ou RLS.
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
      // Fix for TS2339: Property 'status' does not exist on type 'PostgrestError'
      if (error.code === 'PGRST106' || (error as any).status === 406) {
        console.warn(`Supabase status 406 for ${slug}. Possible schema mismatch or RLS block.`);
      } else {
        console.error(`Supabase error fetching content for ${slug}:`, error);
      }
      return null;
    }
    return data?.content || null;
  } catch (err) {
    console.warn(`Critical failure fetching ${slug}, using fallback.`);
    return null;
  }
};

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('championships').select('id').limit(1);
    if (error) throw error;
    return { online: true };
  } catch (err: any) {
    console.error("Supabase Connection Health Check Failed:", err);
    return { online: false, error: err.message || "Unknown Error" };
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_user_id', userId)
      .maybeSingle();
    
    if (error) return null;
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
  if (error) throw error;
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

  if (decError) throw decError;

  await supabase
    .from('decision_audit_log')
    .insert({
      team_id: teamId,
      user_name: userName,
      action: `Locked decisions for Round ${round}`,
      metadata: { 
        timestamp: new Date().toISOString(),
        agent: navigator.userAgent,
        platform: 'Empirion-Vercel-Node'
      }
    });
};

export const updateEcosystem = async (championshipId: string, updates: Partial<Championship>) => {
  const { error } = await supabase.from('championships').update(updates).eq('id', championshipId);
  if (error) throw error;
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
