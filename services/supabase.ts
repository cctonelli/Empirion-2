import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan } from '../types';
import { DEFAULT_MACRO } from '../constants';
import { calculateProjections } from './simulation';

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
 * ORACLE TURNOVER ENGINE v12.8.2 GOLD (Final Production Build)
 * Optimized for high-concurrency arena processing.
 */
export const processRoundTurnover = async (championshipId: string, currentRound: number) => {
  console.log(`[TURNOVER v12.8.2 GOLD] Processing Arena: ${championshipId} | Cycle: 0${currentRound}`);

  try {
    const { data: arena } = await supabase.from('championships').select('*').eq('id', championshipId).single();
    if (!arena) throw new Error("Oracle Node: Arena synchronization lost.");

    const { data: teams } = await supabase.from('teams').select('*').eq('championship_id', championshipId);
    if (!teams || teams.length === 0) throw new Error("Oracle Node: No strategy units found.");

    const { data: decisions } = await supabase.from('current_decisions').select('*').eq('championship_id', championshipId).eq('round', currentRound + 1);
    const { data: previousStates } = await supabase.from('companies').select('*').eq('championship_id', championshipId).eq('round', currentRound);

    const batchResults = teams.map(team => {
      try {
        const teamDecision = decisions?.find(d => d.team_id === team.id)?.data || {
          regions: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 1 }])),
          hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 0, sales_staff_count: 50 },
          production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0 },
          finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
          legal: { recovery_mode: 'none' }
        };

        const teamPrevState = currentRound === 0 ? arena.initial_financials : previousStates?.find(s => s.team_id === team.id);
        
        const result = calculateProjections(
          teamDecision as DecisionData, 
          arena.branch, 
          arena.ecosystemConfig || { inflationRate: 0.01, demandMultiplier: 1.0, interestRate: 0.03, marketVolatility: 0.05, scenarioType: 'simulated', modalityType: 'standard' }, 
          arena.market_indicators, 
          teamPrevState
        );

        return {
          team_id: team.id,
          championship_id: championshipId,
          round: currentRound + 1,
          state: { decisions: teamDecision },
          dre: result.statements?.dre,
          balance_sheet: result.statements?.balance_sheet,
          cash_flow: result.statements?.cash_flow,
          kpis: result.kpis
        };
      } catch (e: any) {
        console.error(`[TEAM ERROR] Unit ${team.id} processing failure:`, e.message);
        return null;
      }
    }).filter(r => r !== null);

    if (batchResults.length === 0) throw new Error("Total Process Failure.");

    const { error: insErr } = await supabase.from('companies').insert(batchResults);
    if (insErr) throw insErr;

    const { error: updErr } = await supabase.from('championships').update({ 
      current_round: currentRound + 1,
      updated_at: new Date().toISOString() 
    }).eq('id', championshipId);
    
    if (updErr) throw updErr;

    return { success: true };
  } catch (err: any) {
    console.error("[CRITICAL TURNOVER FAILURE]:", err.message);
    return { success: false, error: err.message };
  }
};

export const getChampionshipHistoricalData = async (championshipId: string, round: number) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*, teams(name)')
    .eq('championship_id', championshipId)
    .eq('round', round);
  
  if (error) return { data: [], error };
  
  return { 
    data: data.map(item => ({
      team_name: item.teams?.name || 'Unidade Anônima',
      net_profit: item.dre?.net_profit || 0,
      asset: item.balance_sheet?.assets?.total || 9176940,
      share: item.kpis?.market_share || 12.5,
      kpis: item.kpis || {}
    })), 
    error: null 
  };
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
    .upsert({ ...plan, updated_at: new Date().toISOString() })
    .select()
    .single();
  return { data: data as BusinessPlan, error };
};

export const subscribeToBusinessPlan = (teamId: string, callback: (payload: any) => void) => {
  return supabase.channel(`bp-${teamId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'business_plans', filter: `team_id=eq.${teamId}` }, callback).subscribe();
};

export const getTeamSimulationHistory = async (teamId: string) => {
  const { data: decisions } = await supabase.from('current_decisions').select('*').eq('team_id', teamId).order('round', { ascending: true });
  return decisions || [];
};

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
      initial_financials: champData.initial_financials || {},
      products: champData.config?.products || {},
      market_indicators: champData.market_indicators || DEFAULT_MACRO,
      sales_mode: champData.sales_mode || 'hybrid',
      scenario_type: champData.scenario_type || 'simulated'
    };

    if (!isTrial) {
      payload.is_public = champData.is_public || false;
      payload.tutor_id = session?.user?.id;
    }

    const { data: champ, error: cErr } = await supabase.from(table).insert([payload]).select().single();
    if (cErr) throw cErr;

    const teamsToInsert = teams.map(t => ({
      name: t.name,
      championship_id: champ.id,
      ...(isTrial ? {} : { status: 'active', invite_code: `CODE-${Math.random().toString(36).substring(7).toUpperCase()}` })
    }));

    const { data: teamsData, error: tErr } = await supabase.from(teamsTable).insert(teamsToInsert).select();
    if (tErr) throw tErr;
    return { champ: { ...champ, is_trial: isTrial } as Championship, teams: teamsData as Team[] };
  } catch (err: any) { throw err; }
};

/**
 * DELETE CHAMPIONSHIP v12.8.2 GOLD
 * Deep cleanup including local session to prevent ghost data references.
 */
export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  console.log(`[CLEANUP] Protocol: Deleting arena ${id} from ${table}`);
  
  if (localStorage.getItem('active_champ_id') === id) {
    localStorage.removeItem('active_champ_id');
    localStorage.removeItem('active_team_id');
  }

  return await supabase.from(table).delete().eq('id', id);
};

/**
 * PURGE SYSTEM DATA v12.8.2 GOLD
 * Mass deletion commands for total project environment reset.
 */
export const purgeAllTrials = async () => {
  console.log("[PURGE] Initiating total sandbox cleanup...");
  localStorage.removeItem('active_champ_id');
  localStorage.removeItem('active_team_id');
  // Deletes everything except the system reserved UUID if needed
  return await supabase.from('trial_championships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
};

export const purgeAllProduction = async () => {
  console.log("[PURGE] Initiating total production cleanup...");
  localStorage.removeItem('active_champ_id');
  localStorage.removeItem('active_team_id');
  return await supabase.from('championships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  let realData: any[] = [];
  let trialData: any[] = [];
  try {
    const { data } = await supabase.from('championships').select('*, teams(*)').order('created_at', { ascending: false });
    if (data) realData = data;
  } catch (e) {}
  try {
    const { data } = await supabase.from('trial_championships').select('*, teams:trial_teams(*)').order('created_at', { ascending: false });
    if (data) trialData = data;
  } catch (e) {}

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
    ecosystemConfig: c.ecosystemConfig ?? c.config?.ecosystemConfig
  });

  const combined = [
    ...realData.map(c => ({ ...hydrate(c), is_trial: false })), 
    ...trialData.map(c => ({ ...hydrate(c), is_trial: true }))
  ];
  
  return { data: onlyPublic ? combined.filter(c => c.is_public || c.is_trial) : combined as Championship[], error: null };
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId || userId === 'tutor' || userId === 'alpha') {
    return {
      id: userId, supabase_user_id: userId, name: userId === 'tutor' ? 'Tutor Master' : 'Capitão Alpha',
      email: `${userId}@empirion.ia`, role: userId === 'tutor' ? 'tutor' : 'player', is_opal_premium: true, created_at: new Date().toISOString()
    };
  }
  const { data } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
  return data;
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData, isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_decisions' : 'current_decisions';
  return await supabase.from(table).upsert({ team_id: teamId, championship_id: champId, round, data: decisions, status: 'sealed' }); 
};

export const resetAlphaData = async () => {
  const teamId = localStorage.getItem('active_team_id');
  if (!teamId) return;
  await supabase.from('trial_decisions').delete().eq('team_id', teamId);
};

/**
 * Updates the ecosystem parameters of an arena.
 */
export const updateEcosystem = async (championshipId: string, updates: any) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  
  if (updates.ecosystemConfig) {
    const { data: current } = await supabase.from(table).select('config').eq('id', championshipId).single();
    if (current) {
      updates.config = { ...current.config, ecosystemConfig: updates.ecosystemConfig };
      delete updates.ecosystemConfig;
    }
  }
  
  return await supabase.from(table).update(updates).eq('id', championshipId).select().single();
};

export const getPublicReports = async (championshipId: string, round: number) => {
  const { data, error } = await supabase.from('companies').select('*').eq('championship_id', championshipId).eq('round', round);
  if (error) return { data: [], error };
  return {
    data: data.map(item => ({
      team_id: item.team_id, alias: item.team_name, kpis: item.kpis,
      statements: { dre: item.dre, balance_sheet: item.balance_sheet, cash_flow: item.cash_flow }
    })),
    error: null
  };
};

/**
 * Submits community evaluations.
 */
export const submitCommunityVote = async (data: {
  championship_id: string;
  round: number;
  company_alias: string;
  user_id?: string | null;
  ratings: Record<string, number>;
  comment?: string;
}) => {
  const rows = Object.entries(data.ratings).map(([criteria, score]) => ({
    championship_id: data.championship_id,
    round: data.round,
    company_alias: data.company_alias,
    user_id: data.user_id || null,
    criteria,
    score,
    comment: data.comment
  }));
  return await supabase.from('community_ratings').insert(rows);
};

export const fetchPageContent = async (slug: string, lang: string) => {
  try {
    const { data } = await supabase.from('site_content').select('content').eq('page_slug', slug).eq('locale', lang).maybeSingle();
    return data?.content || null;
  } catch (e) { return null; }
};

export const getModalities = async () => {
  try {
    const { data } = await supabase.from('modalities').select('*').order('name');
    return (data as any[]) || [];
  } catch (e) { return []; }
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase.channel('modalities-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, callback).subscribe();
};

export const provisionDemoEnvironment = () => {
  if (isTestMode) {
    localStorage.setItem('is_trial_session', 'true');
    localStorage.setItem('active_branch', 'industrial');
  }
};

export const silentTestAuth = async (user: any) => {
  const mockSession = {
    user: { id: user.id, email: user.email, user_metadata: { full_name: user.name, role: user.role } },
    access_token: 'trial-token', expires_in: 3600
  };
  localStorage.setItem('empirion_demo_session', JSON.stringify(mockSession));
  localStorage.setItem('is_trial_session', 'true'); 
  return { data: { session: mockSession }, error: null };
};

export const listAllUsers = async () => {
  return await supabase.from('users').select('*').order('created_at', { ascending: false });
};

export const updateUserPremiumStatus = async (userId: string, status: boolean) => {
  return await supabase.from('users').update({ is_opal_premium: status }).eq('supabase_user_id', userId).select().single();
}