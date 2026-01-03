
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan } from '../types';

const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv[viteKey] || metaEnv[key] || '';
};

const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isTestMode = true;

// Fix: Adicionando exportação ausente necessária para o TestTerminal.tsx
/**
 * Provisiona o ambiente de demonstração (Alpha/Trial).
 * No MVP, garante que o modo de teste esteja operacional.
 */
export const provisionDemoEnvironment = () => {
  if (isTestMode) {
    console.log("EMPIRE ENGINE: Provisioning Alpha Environment...");
    // No MVP, apenas garante que flags de trial existam no storage
    localStorage.setItem('is_trial_session', 'true');
    localStorage.setItem('active_branch', 'industrial');
  }
};

/**
 * Gestão Progressiva de Business Plans
 */
export const getActiveBusinessPlan = async (teamId: string, round: number) => {
  const { data, error } = await supabase
    .from('business_plans')
    .select('*')
    .eq('team_id', teamId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data: data as BusinessPlan | null, error };
};

export const saveBusinessPlan = async (plan: Partial<BusinessPlan>) => {
  const { data, error } = await supabase
    .from('business_plans')
    .upsert({
      ...plan,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  return { data: data as BusinessPlan, error };
};

export const subscribeToBusinessPlan = (teamId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`bp-${teamId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'business_plans',
      filter: `team_id=eq.${teamId}` 
    }, callback)
    .subscribe();
};

export const getTeamSimulationHistory = async (teamId: string) => {
  // Simulação de busca de histórico para o MVP
  const { data: decisions } = await supabase
    .from('current_decisions')
    .select('*')
    .eq('team_id', teamId)
    .order('round', { ascending: true });
    
  return decisions || [];
};

/**
 * Persistência Inteligente v8.1
 */
export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string }[], isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  const { data: { session } } = await supabase.auth.getSession();
  
  try {
    const payload: any = {
      name: champData.name,
      branch: champData.branch,
      status: 'active',
      current_round: 0,
      total_rounds: champData.total_rounds || 12,
      deadline_value: champData.deadline_value || 7,
      deadline_unit: champData.deadline_unit || 'days',
      config: champData.config || {},
      initial_financials: champData.initial_financials,
      market_indicators: champData.market_indicators,
      round_started_at: new Date().toISOString()
    };

    if (isTrial) {
      payload.initial_market_data = champData.market_indicators || champData.initial_market_data;
    } else {
      payload.is_public = champData.is_public || false;
      payload.sales_mode = champData.sales_mode;
      payload.scenario_type = champData.scenario_type;
      payload.currency = champData.currency;
      payload.round_frequency_days = champData.round_frequency_days;
      payload.transparency_level = champData.transparency_level;
      payload.tutor_id = session?.user?.id;
    }

    const { data: champ, error: cErr } = await supabase
      .from(table)
      .insert([payload])
      .select()
      .single();

    if (cErr) throw new Error(`Erro no motor Oracle: ${cErr.message}`);

    const teamsToInsert = teams.map(t => ({
      name: t.name,
      championship_id: champ.id,
      ...(isTrial ? {} : { status: 'active', invite_code: `CODE-${Math.random().toString(36).substring(7).toUpperCase()}` })
    }));

    const { data: teamsData, error: tErr } = await supabase
      .from(teamsTable)
      .insert(teamsToInsert)
      .select();

    if (tErr) throw tErr;
    return { champ: { ...champ, is_trial: isTrial } as Championship, teams: teamsData as Team[] };
  } catch (err: any) {
    console.error("ORCHESTRATION ENGINE CRASH:", err);
    throw err;
  }
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  let realData: any[] = [];
  let trialData: any[] = [];
  try {
    const { data } = await supabase.from('championships').select('*, teams(*)').order('created_at', { ascending: false });
    if (data) realData = data;
  } catch (e) { console.warn("Produção inacessível."); }
  try {
    const { data } = await supabase.from('trial_championships').select('*, teams:trial_teams(*)').order('created_at', { ascending: false });
    if (data) trialData = data;
  } catch (e) { console.warn("Sandbox inacessível."); }
  const combined = [...realData.map(c => ({ ...c, is_trial: false })), ...trialData.map(c => ({ ...c, is_trial: true }))];
  return { data: onlyPublic ? combined.filter(c => c.is_public || c.is_trial) : combined as Championship[], error: null };
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId || userId === 'tutor' || userId === 'alpha') {
    return {
      id: userId,
      supabase_user_id: userId,
      name: userId === 'tutor' ? 'Tutor Master' : 'Capitão Alpha',
      email: `${userId}@empirion.ia`,
      role: userId === 'tutor' ? 'tutor' : 'player',
      is_opal_premium: true,
      created_at: new Date().toISOString()
    };
  }
  const { data } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
  return data;
};

export const silentTestAuth = async (user: any) => {
  const mockSession = {
    user: { id: user.id, email: user.email, user_metadata: { full_name: user.name, role: user.role } },
    access_token: 'trial-token',
    expires_in: 3600
  };
  localStorage.setItem('empirion_demo_session', JSON.stringify(mockSession));
  localStorage.setItem('is_trial_session', 'true'); 
  return { data: { session: mockSession }, error: null };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData, isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_decisions' : 'current_decisions';
  return await supabase.from(table).upsert({ team_id: teamId, championship_id: champId, round, data: decisions }); 
};

export const resetAlphaData = async () => {
  return await supabase.from('trial_decisions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
};

export const listAllUsers = async () => { return await supabase.from('users').select('*'); };
export const updateUserPremiumStatus = async (userId: string, status: boolean) => {
  return await supabase.from('users').update({ is_opal_premium: status }).eq('supabase_user_id', userId);
};

export const fetchPageContent = async (slug: string, lang: string) => {
  const { data } = await supabase.from('site_content').select('*').eq('page_slug', slug).eq('locale', lang).maybeSingle();
  return data?.content || null;
};

export const getModalities = async () => {
  const { data } = await supabase.from('modalities').select('*');
  return data || [];
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase.channel('modalities_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, callback).subscribe();
};

export const updateEcosystem = async (champId: string, updates: { ecosystemConfig: EcosystemConfig }) => {
  return await supabase.from('championships').update(updates).eq('id', champId);
};

export const getPublicReports = async (champId: string, round: number) => {
  return await supabase.from('public_reports').select('*').eq('championship_id', champId).eq('round', round);
};

export const submitCommunityVote = async (vote: any) => {
  return await supabase.from('community_ratings').insert([vote]);
};
