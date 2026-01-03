
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig } from '../types';

const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv[viteKey] || metaEnv[key] || '';
};

const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isTestMode = true;

/**
 * Persistência Inteligente: 
 * Diferencia entre tabelas de produção (championships) e sandbox (trial_championships).
 */
export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string }[], isTrial: boolean = false) => {
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
      config: champData.config || {},
      initial_financials: champData.initial_financials,
      initial_market_data: champData.initial_market_data,
      market_indicators: champData.market_indicators
    };

    if (!isTrial) {
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
      .maybeSingle();

    if (cErr) {
      console.error(`Error inserting into ${table}:`, cErr);
      throw cErr;
    }
    if (!champ) throw new Error("Arena record creation failed - no data returned.");

    const teamsToInsert = teams.map(t => ({
      name: t.name,
      championship_id: champ.id,
      ...(isTrial ? {} : { status: 'active', invite_code: `CODE-${Math.random().toString(36).substring(7).toUpperCase()}` })
    }));

    const { data: teamsData, error: tErr } = await supabase
      .from(teamsTable)
      .insert(teamsToInsert)
      .select();

    if (tErr) {
      console.error(`Error inserting into ${teamsTable}:`, tErr);
      throw tErr;
    }

    return { champ: { ...champ, is_trial: isTrial } as Championship, teams: teamsData as Team[] };
  } catch (err) {
    console.error("CRITICAL SUPABASE ORCHESTRATION ERROR:", err);
    throw err;
  }
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  // Query defensiva: se uma tabela falhar (ex: não existir trial), ainda tentamos a real
  let realData: any[] = [];
  let trialData: any[] = [];

  try {
    const { data } = await supabase.from('championships').select('*, teams(*)').order('created_at', { ascending: false });
    if (data) realData = data;
  } catch (e) { console.warn("Could not fetch main championships table."); }

  try {
    const { data } = await supabase.from('trial_championships').select('*, teams:trial_teams(*)').order('created_at', { ascending: false });
    if (data) trialData = data;
  } catch (e) { console.warn("Could not fetch trial championships table."); }

  const combined = [
    ...realData.map(c => ({ ...c, is_trial: false })),
    ...trialData.map(c => ({ ...c, is_trial: true }))
  ];

  if (onlyPublic) {
    return { data: combined.filter(c => c.is_public || c.is_trial) as Championship[], error: null };
  }

  return { data: combined as Championship[], error: null };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData, isTrial: boolean = false) => {
  const table = isTrial ? 'trial_decisions' : 'current_decisions';
  
  // Para trial, tentamos insert se não houver constraint de UNIQUE. Se houver, o upsert resolve.
  const { error } = await supabase.from(table).upsert({ 
    team_id: teamId, 
    championship_id: champId, 
    round, 
    data: decisions 
  }); 

  return { error };
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
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
  localStorage.setItem('is_trial_session', user.role === 'player' ? 'true' : 'false');
  return { data: { session: mockSession }, error: null };
};

export const provisionDemoEnvironment = async () => {};

export const resetAlphaData = async () => {
  const { error } = await supabase.from('current_decisions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  return { error };
};

export const listAllUsers = async () => {
  return await supabase.from('users').select('*');
};

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
