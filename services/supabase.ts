
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, UserProfile, UserRole, Modality } from '../types';

const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const nextKey = `NEXT_PUBLIC_${key}`;
  const metaEnv = (import.meta as any).env || {};
  const procEnv = (window as any).process?.env || {};
  return metaEnv[viteKey] || metaEnv[nextKey] || metaEnv[key] || procEnv[viteKey] || procEnv[nextKey] || procEnv[key] || '';
};

const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase Error [${context}]:`, error);
  return null;
};

// --- Modalities Engine ---
export const getModalities = async (): Promise<Modality[]> => {
  const { data, error } = await supabase
    .from('modalities')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: true });
  
  if (error) {
    handleSupabaseError(error, 'getModalities');
    return [];
  }
  return data || [];
};

export const createModality = async (modality: Partial<Modality>) => {
  const { data, error } = await supabase
    .from('modalities')
    .insert([modality])
    .select();
  if (error) throw error;
  return data?.[0];
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase
    .channel('modalities-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, callback)
    .subscribe();
};

// --- Core App Functions ---
export const fetchPageContent = async (slug: string, locale: string = 'pt') => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('page_slug', slug)
      .eq('locale', locale)
      .limit(1)
      .maybeSingle();
    
    if (error) return null;
    return data?.content || null;
  } catch (err) {
    return null;
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
  const { error } = await supabase.from('users').update({ role: newRole }).eq('supabase_user_id', userId);
  if (error) throw error;
};

export const listAllUsers = async () => {
  return await supabase.from('users').select('*').order('created_at', { ascending: false });
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

  await supabase.from('decision_audit_log').insert({
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

// --- Community Functions ---
// Fix: Added missing export getPublicReports used in CommunityView component
export const getPublicReports = async (championshipId: string, round: number) => {
  return await supabase
    .from('public_reports')
    .select('*')
    .eq('championship_id', championshipId)
    .eq('round', round);
};

// Fix: Added missing export submitCommunityVote used in CommunityView component
export const submitCommunityVote = async (vote: any) => {
  return await supabase
    .from('community_votes')
    .insert([vote]);
};
