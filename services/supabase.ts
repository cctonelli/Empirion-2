
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, UserProfile, UserRole } from '../types';

const SUPABASE_URL = 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9D6W-B35TZc5KfZqpqliXA_sWpk_klw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('championships').select('id').limit(1);
    if (error) throw error;
    return { online: true };
  } catch (err: any) {
    console.error("Supabase Connection Health Check Failed:", err);
    let errorMessage = "Unknown Error";
    if (typeof err === 'string') errorMessage = err;
    else if (err.message) errorMessage = err.message;
    return { online: false, error: errorMessage };
  }
};

/**
 * Perfil do Usuário e Role Management (v4.3)
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  return data;
};

export const updateUserRole = async (userId: string, newRole: UserRole) => {
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);
  
  if (error) throw error;
};

export const listAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Real-time subscriptions
export const subscribeToDecisions = (teamId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`decisions-${teamId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'current_decisions', filter: `team_id=eq.${teamId}` }, callback)
    .subscribe();
};

export const subscribeToDecisionAudit = (teamId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`audit-logs-${teamId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'decision_audit_log', 
      filter: `team_id=eq.${teamId}` 
    }, callback)
    .subscribe();
};

export const subscribeToChampionship = (championshipId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`champ-${championshipId}`)
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'championships', 
      filter: `id=eq.${championshipId}` 
    }, callback)
    .subscribe();
};

// Data Actions
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

  const { error: logError } = await supabase
    .from('decision_audit_log')
    .insert({
      team_id: teamId,
      user_name: userName,
      action: `Locked decisions for Round ${round}`,
      metadata: { timestamp: new Date().toISOString() }
    });

  if (logError) throw logError;
};

export const updateEcosystem = async (championshipId: string, updates: Partial<Championship>) => {
  const { error } = await supabase
    .from('championships')
    .update(updates)
    .eq('id', championshipId);
  
  if (error) throw error;
};

export const getPublicChampionships = async () => {
  const { data, error } = await supabase
    .from('championships')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'active');
  return { data, error };
};

export const getPublicReports = async (championshipId: string, round: number) => {
  const { data, error } = await supabase
    .from('public_reports')
    .select('*')
    .eq('championship_id', championshipId)
    .eq('round', round);
  return { data, error };
};

export const submitCommunityVote = async (vote: any) => {
  const { data, error } = await supabase
    .from('community_ratings')
    .insert([vote]);
  return { data, error };
}
