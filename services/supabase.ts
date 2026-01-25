
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan, TransparencyLevel, GazetaMode } from '../types';
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { calculateProjections, calculateAttractiveness, sanitize } from './simulation';
import { logError, logInfo, LogContext } from '../utils/logger';
import { generateBotDecision } from './gemini';

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const isTestMode = true;

// UUID Reservado para o Sistema em modo No-Auth
const SYSTEM_TUTOR_ID = '00000000-0000-0000-0000-000000000000';
const LOCAL_CHAMPS_KEY = 'empirion_v12_arenas';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  // Se for Trial ou IDs reservados, retorna perfil mock
  if (isTrial || userId === SYSTEM_TUTOR_ID || ['admin', 'tutor', 'alpha'].includes(userId)) {
    const isTutor = isTrial || userId.includes('tutor') || userId === SYSTEM_TUTOR_ID;
    return {
      id: userId || SYSTEM_TUTOR_ID, 
      supabase_user_id: userId || SYSTEM_TUTOR_ID, 
      name: isTutor ? 'Trial Orchestrator' : 'Capitão Alpha Node 08',
      nickname: isTutor ? 'Tutor_Trial' : 'Alpha_Strategist',
      phone: '+5511999990000',
      email: `${userId || 'trial'}@empirion.ia`, 
      role: isTutor ? 'tutor' : 'player', 
      is_opal_premium: true, 
      created_at: new Date().toISOString()
    };
  }
  const { data, error } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
  if (error) logError(LogContext.DATABASE, "User fetch error", error);
  return data;
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  const finalArenas: Championship[] = [];
  try {
    const local = localStorage.getItem(LOCAL_CHAMPS_KEY);
    if (local) finalArenas.push(...JSON.parse(local));

    const { data: { session } } = await (supabase.auth as any).getSession();
    
    // Arenas Oficiais (Exige Auth para tutoria própria, mas anons veem públicas)
    const { data: rawChamps, error: rawErr } = await supabase
      .from('championships')
      .select('*')
      .order('created_at', { ascending: false });

    if (rawErr) {
       logError(LogContext.DATABASE, "Live Arenas query fail", rawErr);
    } else if (rawChamps) {
       for (const c of rawChamps) {
          if (!finalArenas.find(a => a.id === c.id)) {
             const { data: teamsData } = await supabase.from('teams').select('*').eq('championship_id', c.id);
             finalArenas.push({ ...c, teams: teamsData || [], is_trial: false });
          }
       }
    }

    // Arenas Trial (Públicas ou do usuário)
    let trialQuery = supabase.from('trial_championships').select('*');
    if (session) {
       // Se logado, tenta pegar as dele ou as globais do sistema
       trialQuery = trialQuery.or(`tutor_id.eq.${session.user.id},tutor_id.eq.${SYSTEM_TUTOR_ID}`);
    } else {
       // Se deslogado, pega apenas as do sistema (anon)
       trialQuery = trialQuery.eq('tutor_id', SYSTEM_TUTOR_ID);
    }

    const { data: rawTrials } = await trialQuery.limit(20);
    if (rawTrials) {
       for (const tc of rawTrials) {
          if (!finalArenas.find(a => a.id === tc.id)) {
             const { data: tTeams } = await supabase.from('trial_teams').select('*').eq('championship_id', tc.id);
             finalArenas.push({ ...tc, teams: tTeams || [], is_trial: true });
          }
       }
    }
  } catch (e) { 
    logError(LogContext.DATABASE, "Global data sync deferred", e); 
  }
  
  const result = onlyPublic ? finalArenas.filter(a => a.is_public || a.is_trial) : finalArenas;
  return { data: result, error: null };
};

export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string, is_bot?: boolean }[], isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const newId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const { data: { session } } = await (supabase.auth as any).getSession();
  // Se não houver sessão, usa o UUID de sistema para Trial
  const currentUserId = session?.user?.id || SYSTEM_TUTOR_ID;

  const initialShare = 100 / Math.max(teams.length, 1);

  const teamsWithIds = teams.map(t => ({
    id: crypto.randomUUID(),
    name: t.name,
    is_bot: !!t.is_bot,
    championship_id: newId,
    equity: 5055447,
    credit_limit: 5000000,
    status: 'active',
    insolvency_status: 'SAUDAVEL' as any,
    created_at: timestamp,
    kpis: { 
      market_share: initialShare, 
      rating: 'AAA', 
      insolvency_status: 'SAUDAVEL', 
      kanitz_factor: 2.19,
      market_valuation: { share_price: 1.01, total_shares: 5000000, market_cap: 5055447, tsr: 1.1 }
    }
  }));

  const fullChamp = { 
    ...champData, 
    id: newId, 
    status: 'active', 
    current_round: 0, 
    created_at: timestamp,
    round_started_at: timestamp,
    is_trial: isTrial,
    tutor_id: currentUserId,
    deadline_value: champData.deadline_value || 7,
    deadline_unit: champData.deadline_unit || 'days',
    region_names: champData.region_names || [],
    region_configs: champData.region_configs || [],
    currency: champData.currency || 'BRL',
    sales_mode: champData.sales_mode || 'hybrid',
    scenario_type: champData.scenario_type || 'simulated',
    transparency_level: champData.transparency_level || 'medium',
    gazeta_mode: champData.gazeta_mode || 'anonymous',
    config: { 
      ...(champData.config || {}), 
      round_rules: champData.round_rules || {} 
    }
  } as Championship;

  const champTable = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  
  try {
    const { error: champErr } = await supabase.from(champTable).insert({
      id: fullChamp.id,
      name: fullChamp.name,
      branch: fullChamp.branch,
      description: fullChamp.description,
      status: fullChamp.status,
      current_round: fullChamp.current_round,
      total_rounds: fullChamp.total_rounds,
      deadline_value: fullChamp.deadline_value,
      deadline_unit: fullChamp.deadline_unit,
      initial_financials: fullChamp.initial_financials,
      market_indicators: fullChamp.market_indicators,
      region_names: fullChamp.region_names,
      region_configs: fullChamp.region_configs,
      currency: fullChamp.currency,
      sales_mode: fullChamp.sales_mode,
      scenario_type: fullChamp.scenario_type,
      transparency_level: fullChamp.transparency_level,
      gazeta_mode: fullChamp.gazeta_mode,
      tutor_id: currentUserId,
      round_started_at: fullChamp.round_started_at,
      config: fullChamp.config
    });
    if (!champErr) {
       await supabase.from(teamsTable).insert(teamsWithIds);
    }
  } catch (err) {
    logError(LogContext.SUPABASE, "Cloud Sync Failed during creation", err);
  }

  const localArenas = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
  localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify([{ ...fullChamp, teams: teamsWithIds }, ...localArenas]));
  localStorage.setItem('active_champ_id', newId);

  return { champ: fullChamp, teams: teamsWithIds };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData) => {
  try {
    const { data: allArenas } = await getChampionships();
    const arena = allArenas?.find(a => a.id === champId);
    if (!arena) throw new Error("Arena não localizada no nodo local.");

    const isTrial = !!arena.is_trial;
    const champTable = isTrial ? 'trial_championships' : 'championships';
    const teamsTable = isTrial ? 'trial_teams' : 'teams';
    const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';

    const { data: arenaExists } = await supabase.from(champTable).select('id').eq('id', champId).maybeSingle();
    if (!arenaExists) {
      logInfo(LogContext.DATABASE, `Arena ${champId} ausente na Cloud. Sincronizando...`);
      const { error: arenaErr } = await supabase.from(champTable).insert({
        id: arena.id,
        name: arena.name,
        branch: arena.branch,
        status: arena.status,
        current_round: arena.current_round,
        total_rounds: arena.total_rounds,
        deadline_value: arena.deadline_value,
        deadline_unit: arena.deadline_unit,
        initial_financials: arena.initial_financials,
        market_indicators: arena.market_indicators,
        tutor_id: arena.tutor_id || SYSTEM_TUTOR_ID,
        config: arena.config
      });
      if (arenaErr) throw new Error(`Falha ao provisionar Arena: ${arenaErr.message}`);
    }

    const { data: teamExists } = await supabase.from(teamsTable).select('id').eq('id', teamId).maybeSingle();
    if (!teamExists) {
      const teamMeta = arena.teams?.find(t => t.id === teamId);
      if (teamMeta) {
         const { error: teamErr } = await supabase.from(teamsTable).insert({
           id: teamMeta.id,
           championship_id: arena.id,
           name: teamMeta.name,
           equity: teamMeta.equity || 5055447,
           credit_limit: teamMeta.credit_limit || 5000000,
           status: 'active',
           kpis: teamMeta.kpis
         });
         if (teamErr) throw new Error(`Falha ao provisionar Equipe: ${teamErr.message}`);
      } else {
         throw new Error("Metadados da equipe ausentes para provisionamento.");
      }
    }

    const cleanPayload = JSON.parse(JSON.stringify(decisions, (k, v) => (typeof v === 'number' && !isFinite(v)) ? 0 : v));
    const { data: existingRow } = await supabase.from(decisionsTable).select('id').eq('team_id', teamId).eq('round', round).maybeSingle();

    if (existingRow) {
      const { error } = await supabase.from(decisionsTable).update({
        data: cleanPayload,
        updated_at: new Date().toISOString()
      }).eq('id', existingRow.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from(decisionsTable).insert({
        team_id: teamId,
        championship_id: champId,
        round: round,
        data: cleanPayload,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
    }

    return { success: true };
  } catch (err: any) {
    logError(LogContext.DATABASE, "Decision transmission fault", err.message);
    return { success: false, error: err.message };
  }
};

export const processRoundTurnover = async (championshipId: string, currentRound: number) => {
  try {
    const { data: allArenas } = await getChampionships();
    const arena = allArenas?.find(a => a.id === championshipId);
    if (!arena) throw new Error("Arena não localizada.");

    const isTrial = !!arena.is_trial;
    const teams = arena.teams || [];
    const decisions: Record<string, DecisionData> = {};
    const attractions: Record<string, number> = {};

    for (const team of teams) {
      let teamDecision;
      const decisionTable = isTrial ? 'trial_decisions' : 'current_decisions';
      if (team.is_bot) {
        teamDecision = await generateBotDecision(arena.branch, currentRound + 1, arena.regions_count, arena.market_indicators);
      } else {
        const { data } = await supabase.from(decisionTable).select('data').eq('team_id', team.id).eq('round', currentRound + 1).maybeSingle();
        teamDecision = data?.data;
      }
      
      if (!teamDecision) {
        teamDecision = {
          regions: Object.fromEntries(Array.from({ length: arena.regions_count || 4 }, (_, i) => [i + 1, { price: 375, term: 1, marketing: 0 }])),
          hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 0, sales_staff_count: 50, misc: 0 },
          production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 80, rd_investment: 0, extraProductionPercent: 0 },
          machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
          finance: { loanRequest: 0, loanTerm: 1, application: 0 },
          estimates: { forecasted_revenue: 0, forecasted_unit_cost: 0, forecasted_net_profit: 0 },
          judicial_recovery: false
        };
      }
      decisions[team.id] = teamDecision;
      attractions[team.id] = calculateAttractiveness(teamDecision);
    }

    const totalAttraction = Object.values(attractions).reduce((a, b) => a + b, 0);
    const batchResults = [];
    const now = new Date().toISOString();

    for (const team of teams) {
      const relativeShare = totalAttraction > 0 ? (attractions[team.id] / totalAttraction) * 100 : (100 / teams.length);
      const roundRules = arena.config?.round_rules || {};
      const result = calculateProjections(decisions[team.id], arena.branch, arena.ecosystemConfig || {} as any, arena.market_indicators, team, [], currentRound + 1, roundRules, relativeShare, arena);
      
      batchResults.push({ team_id: team.id, kpis: result.kpis, equity: result.kpis.equity, insolvency_status: result.kpis.insolvency_status });

      const teamsTable = isTrial ? 'trial_teams' : 'teams';
      await supabase.from(teamsTable).update({ kpis: result.kpis, equity: result.kpis.equity, insolvency_status: result.kpis.insolvency_status }).eq('id', team.id);
    }

    const champTable = isTrial ? 'trial_championships' : 'championships';
    await supabase.from(champTable).update({ current_round: currentRound + 1, round_started_at: now }).eq('id', championshipId);

    const local = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
    const idx = local.findIndex((a: any) => a.id === championshipId);
    if (idx !== -1) {
       local[idx].current_round = currentRound + 1;
       local[idx].round_started_at = now;
       local[idx].teams = local[idx].teams.map((t: any) => {
         const res = batchResults.find(r => r.team_id === t.id);
         return res ? { ...t, kpis: res.kpis, equity: res.equity, insolvency_status: res.insolvency_status } : t;
       });
       localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify(local));
    }
    return { success: true };
  } catch (err: any) {
    logError(LogContext.TURNOVER, "Oracle Turnover Fault", err.message);
    return { success: false, error: err.message };
  }
};

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  await supabase.from(table).delete().eq('id', id);
  const local = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
  localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify(local.filter((a: any) => a.id !== id)));
  return { error: null };
};

export const provisionDemoEnvironment = () => { localStorage.setItem('is_trial_session', 'true'); };
export const updateEcosystem = async (id: string, updates: any) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  const { error } = await supabase.from(table).update(updates).eq('id', id);
  return { error };
};

export const fetchPageContent = async (s: string, l: string) => null;
export const getModalities = async () => [];
export const subscribeToModalities = (cb: any) => ({ unsubscribe: () => {} });
export const getPublicReports = async (id: string, r: number) => ({ data: [], error: null });
export const submitCommunityVote = async (d: any) => ({ error: null });
export const getActiveBusinessPlan = async (t: string, r: number) => ({ data: null, error: null });
export const saveBusinessPlan = async (p: any) => ({ data: null, error: null });
export const getTeamSimulationHistory = async (t: string) => [];
export const getAllUsers = async (): Promise<UserProfile[]> => [];
export const subscribeToBusinessPlan = (t: string, r: number, cb: any) => ({ unsubscribe: () => {} });
