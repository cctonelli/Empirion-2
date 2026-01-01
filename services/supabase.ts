
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, UserProfile, UserRole } from '../types';

const SUPABASE_URL = 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9D6W-B35TZc5KfZqpqliXA_sWpk_klw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Dynamic Content Fetching (v5.0)
 * Allows the portal to be 100% data-driven.
 */
export const fetchPageContent = async (slug: string, locale: string = 'pt') => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('page_slug', slug)
      .eq('locale', locale)
      .single();
    
    if (error) throw error;
    return data.content;
  } catch (err) {
    console.warn(`Content for ${slug} not found in DB, using fallback.`);
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
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('supabase_user_id', userId)
    .single();
  
  if (error) return null;
  return data;
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
      metadata: { timestamp: new Date().toISOString() }
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
