import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship } from '../types';

// Updated credentials from user prompt
const SUPABASE_URL = 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9D6W-B35TZc5KfZqpqliXA_sWpk_klw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Health Check: Verifica se a instância do Supabase está respondendo.
 * Melhora a extração de mensagens de erro para evitar strings genéricas.
 */
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('championships').select('id').limit(1);
    if (error) throw error;
    return { online: true };
  } catch (err: any) {
    console.error("Supabase Connection Health Check Failed:", err);
    
    // Extrai a mensagem de erro da forma mais legível possível
    let errorMessage = "Unknown Error";
    if (typeof err === 'string') errorMessage = err;
    else if (err.message) errorMessage = err.message;
    else if (err.error_description) errorMessage = err.error_description;
    else if (err.details) errorMessage = err.details;
    else try { errorMessage = JSON.stringify(err); } catch(e) { errorMessage = "Complex Error Object"; }

    return { 
      online: false, 
      error: errorMessage,
      isDnsError: errorMessage.includes('Failed to fetch') || 
                  errorMessage.includes('address not found') || 
                  errorMessage.includes('NetworkError') ||
                  !window.navigator.onLine
    };
  }
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