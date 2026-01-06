
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan } from '../types';
import { DEFAULT_MACRO } from '../constants';
import { calculateProjections } from './simulation';

const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv[viteKey] || metaEnv[key] || '';
};

const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejendfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isTestMode = true;

/**
 * ORACLE TURNOVER ENGINE v12.8.2 GOLD
 * Correctly maps persistent columns for history (companies) and teams.
 */
export const processRoundTurnover = async (championshipId: string, currentRound: number) => {
  try {
    const { data: arena } = await supabase.from('championships').select('*').eq('id', championshipId).single();
    if (!arena) throw new Error("Arena synchronization lost.");

    const { data: teams } = await supabase.from('teams').select('*').eq('championship_id', championshipId);
    if (!teams || teams.length === 0) throw new Error("No strategy units found.");

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
          arena.ecosystemConfig || { inflation_rate: 0.01, demand_multiplier: 1.0, interest_rate: 0.03, market_volatility: 0.05, scenario_type: 'simulated', modality_type: 'standard' }, 
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
          kpis: result.kpis,
          credit_rating: result.creditRating,
          insolvency_index: result.health.insolvency_risk,
          // Fixed Database column names to match companies table schema
          credit_limit: result.kpis.banking?.credit_limit || 0,
          equity: result.kpis.equity || 0
        };
      } catch (e: any) {
        return null;
      }
    }).filter(r => r !== null) as any[];

    if (batchResults.length === 0) throw new Error("Total Process Failure.");

    // Insert history (companies table now has NOT NULL constraints on credit_limit/equity)
    const { error: insErr } = await supabase.from('companies').insert(batchResults);
    if (insErr) throw insErr;

    // Sync team current state
    for (const res of batchResults) {
      await supabase.from('teams').update({
        credit_limit: res.credit_limit,
        equity: res.equity
      }).eq('id', res.team_id);
    }

    // Increment Arena Round
    await supabase.from('championships').update({ 
      current_round: currentRound + 1,
      updated_at: new Date().toISOString() 
    }).eq('id', championshipId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string }[], isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  const { data: { session } } = await supabase.auth.getSession();
  
  try {
    const now = new Date().toISOString();
    const payload = {
      name: champData.name,
      description: champData.description || 'Arena de Simulação Estratégica Gold',
      branch: champData.branch,
      status: 'active',
      current_round: 0,
      total_rounds: champData.total_rounds || 12,
      sales_mode: champData.sales_mode || 'hybrid',
      scenario_type: champData.scenario_type || 'simulated',
      currency: champData.currency || 'BRL',
      round_frequency_days: champData.round_frequency_days || 7,
      transparency_level: champData.transparency_level || 'medium',
      gazeta_mode: champData.gazeta_mode || 'anonymous',
      observers: champData.observers || [],
      config: champData.config || {},
      initial_financials: champData.initial_financials || {},
      products: champData.config?.products || {},
      market_indicators: champData.market_indicators || DEFAULT_MACRO,
      round_started_at: now,
      tutor_id: isTrial ? null : session?.user?.id
    };

    const { data: champ, error: cErr } = await supabase.from(table).insert([payload]).select().single();
    if (cErr) throw cErr;

    const teamsToInsert = teams.map(t => ({
      name: t.name,
      championship_id: champ.id,
      equity: 5055447, // Initial Equity is NOT NULL
      credit_limit: 5000000, // Initial Credit is NOT NULL
      status: 'active',
      invite_code: `CODE-${Math.random().toString(36).substring(7).toUpperCase()}`
    }));

    const { data: teamsData, error: tErr } = await supabase.from(teamsTable).insert(teamsToInsert).select();
    if (tErr) throw tErr;
    return { champ: { ...champ, is_trial: isTrial } as Championship, teams: teamsData as Team[] };
  } catch (err: any) { throw err; }
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

  const hydrate = (c: any) => {
    const config = c.config || {};
    const market = c.market_indicators || config.market_indicators || DEFAULT_MACRO;
    return {
      ...c,
      description: c.description || config.description || 'Arena de Simulação Estratégica Empirion',
      gazeta_mode: c.gazeta_mode || config.gazeta_mode || 'anonymous',
      observers: c.observers || config.observers || [],
      deadline_value: c.deadline_value ?? config.deadline_value ?? 7,
      deadline_unit: c.deadline_unit ?? config.deadline_unit ?? 'days',
      market_indicators: {
        growth_rate: market.growth_rate ?? 3.0,
        inflation_rate: market.inflation_rate ?? 1.0,
        interest_rate_tr: market.interest_rate_tr ?? 3.0,
        tax_rate_ir: market.tax_rate_ir ?? 15.0,
        machinery_values: market.machinery_values ?? DEFAULT_MACRO.machinery_values,
        active_event: market.active_event
      }
    };
  };

  const combined = [
    ...realData.map(c => ({ ...hydrate(c), is_trial: false })), 
    ...trialData.map(c => ({ ...hydrate(c), is_trial: true }))
  ];
  
  return { data: onlyPublic ? combined.filter(c => c.is_public || c.is_trial) : combined as Championship[], error: null };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_decisions' : 'current_decisions';
  
  const { data: current } = await supabase.from(table).select('version').eq('team_id', teamId).eq('round', round).maybeSingle();
  const nextVersion = (current?.version || 0) + 1;

  return await supabase.from(table).upsert({ 
    team_id: teamId, 
    championship_id: champId, 
    round, 
    data: decisions, 
    status: 'sealed',
    version: nextVersion,
    updated_at: new Date().toISOString()
  }); 
};

export const getTeamSimulationHistory = async (teamId: string) => {
  const { data: decisions } = await supabase.from('current_decisions').select('*').eq('team_id', teamId).order('round', { ascending: true });
  return decisions || [];
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

export const listAllUsers = async () => {
  return await supabase.from('users').select('*').order('created_at', { ascending: false });
};

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  return await supabase.from(table).delete().eq('id', id);
};

export const purgeAllTrials = async () => {
  return await supabase.from('trial_championships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
};

export const purgeAllProduction = async () => {
  return await supabase.from('championships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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

export const provisionDemoEnvironment = () => {
  localStorage.setItem('is_trial_session', 'true');
  localStorage.setItem('active_branch', 'industrial');
};

export const updateEcosystem = async (championshipId: string, updates: any) => {
  return await supabase.from('championships').update(updates).eq('id', championshipId).select().single();
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

export const submitCommunityVote = async (data: any) => {
  return await supabase.from('community_ratings').insert(data);
};

export const subscribeToBusinessPlan = (teamId: string, callback: (payload: any) => void) => {
  return supabase.channel(`bp-${teamId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'business_plans', filter: `team_id=eq.${teamId}` }, callback).subscribe();
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
