import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan, CompanyHistoryRecord } from '../types';
import { DEFAULT_MACRO } from '../constants';
import { calculateProjections } from './simulation';
import { logError, logInfo, LogContext } from '../utils/logger';

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
 * ALPHA BYPASS WHITELIST
 * Previne erros de sintaxe UUID ao usar IDs amigáveis no modo teste.
 * Intercepta IDs literais antes de chegar ao Postgres.
 */
const ALPHA_IDS = ['tutor', 'alpha', 'tutor_master', 'alpha_street', 'alpha_cell', 'alpha_user'];

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;

  // Intercepta IDs Alpha para evitar Erro 22P02 no Supabase
  if (ALPHA_IDS.includes(userId)) {
    return {
      id: userId, 
      supabase_user_id: userId, 
      name: userId.includes('tutor') ? 'Tutor Master Alpha' : 'Capitão Alpha Node 08',
      email: `${userId}@empirion.ia`, 
      role: userId.includes('tutor') ? 'tutor' : 'player', 
      is_opal_premium: true, 
      created_at: new Date().toISOString()
    };
  }
  
  // Validação estrita de UUID antes da consulta
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    logInfo(LogContext.AUTH, `Skipping invalid UUID format profile fetch: ${userId}`);
    return null;
  }

  const { data, error } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
  if (error) logError(LogContext.DATABASE, `Error fetching user profile ${userId}`, error);
  return data;
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  let realData: any[] = [];
  let trialData: any[] = [];
  
  try {
    // Busca simplificada para reduzir impacto de recursão RLS (Infinite Recursion mitigation)
    const { data, error } = await supabase
      .from('championships')
      .select('*, teams(id, name, status, equity, credit_limit, insolvency_status)')
      .order('created_at', { ascending: false });
    
    if (error) {
      if (error.code === '42P17') {
        logError(LogContext.DATABASE, "RLS Recursion detected. Retrying simple fetch.");
        const { data: simpleData } = await supabase.from('championships').select('*');
        realData = simpleData || [];
      } else {
        throw error;
      }
    } else {
      realData = data || [];
    }
  } catch (e: any) {
    logError(LogContext.DATABASE, "Championship fetch failure", e.message);
  }

  try {
    const { data } = await supabase.from('trial_championships').select('*, teams:trial_teams(*)').order('created_at', { ascending: false });
    if (data) trialData = data;
  } catch (e) {}

  const combined = [
    ...realData.map(c => ({ ...c, market_indicators: c.market_indicators || DEFAULT_MACRO, is_trial: false })), 
    ...trialData.map(c => ({ ...c, market_indicators: c.market_indicators || DEFAULT_MACRO, is_trial: true }))
  ];
  
  return { data: onlyPublic ? combined.filter(c => c.is_public || c.is_trial) : combined as Championship[], error: null };
};

export const processRoundTurnover = async (championshipId: string, currentRound: number) => {
  logInfo(LogContext.TURNOVER, `Initializing turnover for arena ${championshipId} | Round ${currentRound} -> ${currentRound + 1}`);
  
  try {
    const { data: arena, error: arenaFetchErr } = await supabase.from('championships').select('*').eq('id', championshipId).single();
    if (arenaFetchErr) throw arenaFetchErr;
    if (!arena) throw new Error(`Arena ${championshipId} not found.`);

    const { data: teams, error: teamsFetchErr } = await supabase.from('teams').select('*').eq('championship_id', championshipId);
    if (teamsFetchErr) throw teamsFetchErr;
    if (!teams || teams.length === 0) throw new Error(`No teams found for championship ${championshipId}.`);

    const { data: decisions } = await supabase.from('current_decisions').select('*').eq('championship_id', championshipId).eq('round', currentRound + 1);
    const { data: previousStates } = await supabase.from('companies').select('*').eq('championship_id', championshipId).eq('round', currentRound);

    const batchResults = teams.map(team => {
      const teamDecision = decisions?.find(d => d.team_id === team.id)?.data || {
        regions: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 1 }])),
        hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 0, sales_staff_count: 50 },
        production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0 },
        finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
        legal: { recovery_mode: 'none' }
      };

      const teamPrevState = currentRound === 0 ? arena.initial_financials : previousStates?.find(s => s.team_id === team.id);
      const result = calculateProjections(teamDecision as DecisionData, arena.branch, arena.ecosystemConfig, arena.market_indicators, teamPrevState);

      return {
        team_id: team.id,
        team_name: team.name, 
        championship_id: championshipId,
        round: currentRound + 1,
        state: { decisions: teamDecision },
        dre: result.statements?.dre,
        balance_sheet: result.statements?.balance_sheet,
        cash_flow: result.statements?.cash_flow,
        kpis: result.kpis,
        credit_rating: result.creditRating,
        insolvency_index: result.health.insolvency_risk,
        credit_limit: result.kpis.banking?.credit_limit || 0,
        equity: result.kpis.equity || 0
      };
    });

    const { error: insErr } = await supabase.from('companies').insert(batchResults);
    if (insErr) throw insErr;

    for (const res of batchResults) {
      await supabase.from('teams').update({ credit_limit: res.credit_limit, equity: res.equity }).eq('id', res.team_id);
    }

    await supabase.from('championships').update({ current_round: currentRound + 1, round_started_at: new Date().toISOString() }).eq('id', championshipId);
    return { success: true };
  } catch (err: any) {
    logError(LogContext.TURNOVER, "Turnover Fault", err.message);
    return { success: false, error: err.message };
  }
};

export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string }[], isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  // Fix: Use v1 session() for compatibility with SupabaseAuthClient
  const session = supabase.auth.session();
  
  try {
    const payload = {
      name: champData.name,
      description: champData.description,
      branch: champData.branch,
      status: 'active',
      current_round: 0,
      total_rounds: champData.total_rounds || 12,
      sales_mode: champData.sales_mode || 'hybrid',
      scenario_type: champData.scenario_type || 'simulated',
      currency: champData.currency || 'BRL',
      transparency_level: champData.transparency_level || 'medium',
      gazeta_mode: champData.gazeta_mode || 'anonymous',
      observers: champData.observers || [],
      initial_financials: champData.initial_financials || {},
      market_indicators: champData.market_indicators || DEFAULT_MACRO,
      tutor_id: isTrial ? null : session?.user?.id
    };

    const { data: champ, error: cErr } = await supabase.from(table).insert([payload]).select().single();
    if (cErr) throw cErr;

    const teamsToInsert = teams.map(t => ({
      name: t.name,
      championship_id: champ.id,
      equity: 5055447, 
      credit_limit: 5000000, 
      status: 'active'
    }));

    await supabase.from(teamsTable).insert(teamsToInsert);
    return { champ, teams: teamsToInsert };
  } catch (err: any) { 
    logError(LogContext.SUPABASE, "Creation Failed", err.message);
    throw err; 
  }
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_decisions' : 'current_decisions';
  await supabase.from(table).upsert({ 
    team_id: teamId, championship_id: champId, round, data: decisions, status: 'sealed'
  }); 
  return { success: true };
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

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  await supabase.from(table).delete().eq('id', id);
  return { error: null };
};

export const silentTestAuth = async (user: any) => {
  const mockSession = {
    user: { id: user.id, email: user.email, user_metadata: { full_name: user.name, role: user.role } },
    access_token: 'trial-token'
  };
  localStorage.setItem('empirion_demo_session', JSON.stringify(mockSession));
  localStorage.setItem('is_trial_session', 'true'); 
  return { data: { session: mockSession }, error: null };
};

export const provisionDemoEnvironment = () => {
  localStorage.setItem('is_trial_session', 'true');
};

export const updateEcosystem = async (championshipId: string, updates: any) => {
  const { data } = await supabase.from('championships').update(updates).eq('id', championshipId).select().single();
  return { data, error: null };
};

export const getPublicReports = async (championshipId: string, round: number) => {
  const { data } = await supabase.from('companies').select('*').eq('championship_id', championshipId).eq('round', round);
  return { data: data || [], error: null };
};

export const submitCommunityVote = async (data: any) => {
  await supabase.from('community_ratings').insert(data);
  return { error: null };
};

export const subscribeToBusinessPlan = (teamId: string, callback: (payload: any) => void) => {
  return supabase.channel(`bp-${teamId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'business_plans', filter: `team_id=eq.${teamId}` }, callback).subscribe();
};

export const getActiveBusinessPlan = async (teamId: string, round: number) => {
  const { data } = await supabase.from('business_plans').select('*').eq('team_id', teamId).order('version', { ascending: false }).limit(1).maybeSingle();
  return { data, error: null };
};

export const saveBusinessPlan = async (plan: Partial<BusinessPlan>) => {
  const { data } = await supabase.from('business_plans').upsert({ ...plan, updated_at: new Date().toISOString() }).select().single();
  return { data, error: null };
};

export const getTeamSimulationHistory = async (teamId: string) => {
  const { data } = await supabase.from('current_decisions').select('*').eq('team_id', teamId).order('round', { ascending: true });
  return data || [];
};