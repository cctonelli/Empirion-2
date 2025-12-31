import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship } from '../types';

const SUPABASE_URL = 'https://gkmjlejqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWpsZWplcW5kZmR2eHh2dXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxODk3MzgsImV4cCI6MjA4Mjc2NTczOH0.QD3HK_ggQJb8sQHBJSIA2ARhh9Vz8v-qTkh2tQyKLis';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Data Actions
export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData, userName: string) => {
  // 1. Update current decisions
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

  // 2. Insert audit log for "War Room" visibility
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

// Community Scoring & Public Access
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
