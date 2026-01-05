
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan } from '../types';
import { DEFAULT_MACRO } from '../constants';

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
 * Recupera snapshots históricos de todas as equipes de um campeonato.
 */
export const getChampionshipHistoricalData = async (championshipId: string, round: number) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*, teams(name)')
    .eq('championship_id', championshipId)
    .eq('round', round);
  
  if (error) {
    console.warn("Snapshot Engine fallback: Dados históricos não encontrados.");
    return { data: [], error };
  }
  
  return { 
    data: data.map(item => ({
      team_name: item.teams?.name || 'Unidade Anônima',
      net_profit: item.dre?.net_profit || 0,
      asset: item.balance_sheet?.total_asset || 9176940,
      share: item.kpis?.market_share || 12.5
    })), 
    error: null 
  };
};

export const provisionDemoEnvironment = () => {
  if (isTestMode) {
    console.log("EMPIRE ENGINE: Provisioning Alpha Environment...");
    localStorage.setItem('is_trial_session', 'true');
    localStorage.setItem('active_branch', 'industrial');
  }
};

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
  const { data: decisions } = await supabase
    .from('current_decisions')
    .select('*')
    .eq('team_id', teamId)
    .order('round', { ascending: true });
    
  return decisions || [];
};

/**
 * Persistência Inteligente v8.5 - Resilient Schema Handling
 */
export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string }[], isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  const { data: { session } } = await supabase.auth.getSession();
  
  try {
    const now = new Date().toISOString();
    const payload: any = {
      name: champData.name,
      branch: champData.branch,
      status: 'active',
      current_round: 0,
      total_rounds: champData.total_rounds || 12,
      config: {
        ...(champData.config || {}),
        deadline_value: champData.deadline_value || 7,
        deadline_unit: champData.deadline_unit || 'days',
        market_indicators: champData.market_indicators || DEFAULT_MACRO,
        round_started_at: now,
        sales_mode: champData.sales_mode,
        scenario_type: champData.scenario_type,
        currency: champData.currency,
        transparency_level: champData.transparency_level
      },
      initial_financials: champData.initial_financials,
      market_indicators: champData.market_indicators || DEFAULT_MACRO
    };

    if (!isTrial) {
      payload.is_public = champData.is_public || false;
      payload.sales_mode = champData.sales_mode;
      payload.scenario_type = champData.scenario_type;
      payload.currency = champData.currency;
      payload.round_frequency_days = champData.round_frequency_days;
      payload.transparency_level = champData.transparency_level;
      payload.tutor_id = session?.user?.id;
      payload.round_started_at = now;
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

  // Recuperação inteligente de campos para isolamento de contexto (Multi-tenant)
  const hydrate = (c: any) => ({
    ...c,
    deadline_value: c.deadline_value ?? c.config?.deadline_value ?? 7,
    deadline_unit: c.deadline_unit ?? c.config?.deadline_unit ?? 'days',
    round_started_at: c.round_started_at ?? c.config?.round_started_at ?? c.created_at,
    market_indicators: c.market_indicators ?? c.config?.market_indicators ?? DEFAULT_MACRO,
    sales_mode: c.sales_mode ?? c.config?.sales_mode ?? 'hybrid',
    scenario_type: c.scenario_type ?? c.config?.scenario_type ?? 'simulated',
    currency: c.currency ?? c.config?.currency ?? 'BRL',
    transparency_level: c.transparency_level ?? c.config?.transparency_level ?? 'medium',
    ecosystemConfig: c.ecosystemConfig ?? c.config?.ecosystemConfig ?? { 
      inflationRate: 0.01, 
      demandMultiplier: 1.0, 
      interestRate: 0.03, 
      marketVolatility: 0.05, 
      scenarioType: 'simulated', 
      modalityType: 'standard' 
    }
  });

  const combined = [
    ...realData.map(c => ({ ...hydrate(c), is_trial: false })), 
    ...trialData.map(c => ({ ...hydrate(c), is_trial: true }))
  ];
  
  return { 
    data: onlyPublic ? combined.filter(c => c.is_public || c.is_trial) : combined as Championship[], 
    error: null 
  };
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
  const teamId = localStorage.getItem('active_team_id');
  if (!teamId) return;
  const { error } = await supabase
    .from('trial_decisions')
    .delete()
    .eq('team_id', teamId);
  return { error };
};

export const listAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateUserPremiumStatus = async (userId: string, status: boolean) => {
  const { data, error } = await supabase
    .from('users')
    .update({ is_opal_premium: status })
    .eq('supabase_user_id', userId)
    .select()
    .single();
  return { data, error };
};

export const updateEcosystem = async (championshipId: string, updates: any) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', championshipId)
    .select()
    .single();
  return { data, error };
};

export const getPublicReports = async (championshipId: string, round: number) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('championship_id', championshipId)
    .eq('round', round);
  
  if (error) return { data: [], error };

  return {
    data: data.map(item => ({
      team_id: item.team_id,
      alias: item.team_name,
      kpis: item.kpis,
      statements: item.statements
    })),
    error: null
  };
};

export const submitCommunityVote = async (vote: any) => {
  const { data, error } = await supabase
    .from('community_votes')
    .insert([vote])
    .select();
  return { data, error };
};

export const fetchPageContent = async (slug: string, lang: string) => {
  try {
    const { data } = await supabase
      .from('page_content')
      .select('content')
      .eq('slug', slug)
      .eq('lang', lang)
      .maybeSingle();
    return data?.content || null;
  } catch (e) {
    return null;
  }
};

export const getModalities = async () => {
  try {
    const { data } = await supabase
      .from('modalities')
      .select('*')
      .order('name');
    return (data as any[]) || [];
  } catch (e) {
    return [];
  }
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase
    .channel('modalities-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, callback)
    .subscribe();
};
