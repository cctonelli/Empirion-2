
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gkmjlejqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWpsZWplcW5kZmR2eHh2dXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxODk3MzgsImV4cCI6MjA4Mjc2NTczOH0.QD3HK_ggQJb8sQHBJSIA2ARhh9Vz8v-qTkh2tQyKLis';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper for Realtime channel for collaborative decisions
export const subscribeToDecisions = (teamId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`decisions-${teamId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'current_decisions', filter: `team_id=eq.${teamId}` }, callback)
    .subscribe();
};
