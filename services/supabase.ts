
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan, TransparencyLevel, GazetaMode } from '../types';
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { calculateProjections, calculateAttractiveness } from './simulation';
import { logError, logInfo, LogContext } from '../utils/logger';
import { generateBotDecision } from './gemini';

const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv[viteKey] || metaEnv[key] || '';
};

const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const isTestMode = true;

const LOCAL_CHAMPS_KEY = 'empirion_v12_arenas';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  if (isTrial || ['admin', 'tutor', 'alpha'].includes(userId)) {
    const isTutor = isTrial || userId.includes('tutor');
    return {
      id: userId || 'trial-master-id', 
      supabase_user_id: userId || 'trial-master-id', 
      name: isTutor ? 'Trial Orchestrator' : 'Capitão Alpha Node 08',
      nickname: isTutor ? 'Tutor_Trial' : 'Alpha_Strategist',
      phone: '+5511999990000',
      email: `${userId || 'trial'}@empirion.ia`, 
      role: isTutor ? 'tutor' : 'player', 
      is_opal_premium: true, 
      created_at: new Date().toISOString()
    };
  }
  const { data } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
  return data;
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  const finalArenas: Championship[] = [];
  try {
    const local = localStorage.getItem(LOCAL_CHAMPS_KEY);
    if (local) finalArenas.push(...JSON.parse(local));

    const { data: realChamps } = await supabase.from('championships').select('*').order('created_at', { ascending: false });
    if (realChamps) {
      for (const c of realChamps) {
        if (!finalArenas.find(a => a.id === c.id)) {
           const { data: teams } = await supabase.from('teams').select('*').eq('championship_id', c.id);
           finalArenas.push({ ...c, teams: teams || [], is_trial: false });
        }
      }
    }

    const { data: { session } } = await (supabase.auth as any).getSession();
    if (session) {
      const { data: trialChamps } = await supabase.from('trial_championships').select('*').eq('tutor_id', session.user.id);
      if (trialChamps) {
        for (const tc of trialChamps) {
           if (!finalArenas.find(a => a.id === tc.id)) {
              const { data: tTeams } = await supabase.from('trial_teams').select('*').eq('championship_id', tc.id);
              finalArenas.push({ ...tc, teams: tTeams || [], is_trial: true });
           }
        }
      }
    }
  } catch (e) { 
    logError(LogContext.DATABASE, "Cloud fetch deferred", e); 
  }
  
  const result = onlyPublic ? finalArenas.filter(a => a.is_public || a.is_trial) : finalArenas;
  return { data: result, error: null };
};

export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string, is_bot?: boolean }[], isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const newId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const { data: { session } } = await (supabase.auth as any).getSession();
  const currentUserId = session?.user?.id;

  const initialShare = 100 / Math.max(teams.length, 1);

  const teamsWithIds = teams.map(t => ({
    id: crypto.randomUUID(),
    name: t.name,
    is_bot: !!t.is_bot,
    championship_id: newId,
    equity: 5055447,
    credit_limit: 5000000,
    status: 'active',
    insolvency_status: 'SAUDAVEL',
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
    // Fix: Como 'round_rules' não é uma coluna oficial no SQL fornecido para championships,
    // guardamos dentro de 'config' para garantir persistência sem erro de esquema.
    config: { 
      ...(champData.config || {}), 
      round_rules: champData.round_rules || {} 
    }
  } as Championship;

  if (isTrial && currentUserId) {
    try {
      const { error: champErr } = await supabase.from('trial_championships').insert({
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
      
      if (champErr) throw champErr;

      await supabase.from('trial_tutors').insert({
        championship_id: fullChamp.id,
        user_id: currentUserId,
        role: 'owner'
      });

      const { error: teamsErr } = await supabase.from('trial_teams').insert(teamsWithIds.map(t => ({
        id: t.id,
        championship_id: t.championship_id,
        name: t.name,
        kpis: t.kpis,
        equity: t.equity,
        credit_limit: t.credit_limit,
        status: t.status,
        insolvency_status: t.insolvency_status
      })));

      if (teamsErr) throw teamsErr;
      logInfo(LogContext.SUPABASE, "Absolute Trial Persisted to Cloud Node 08");
    } catch (err) {
      logError(LogContext.SUPABASE, "Cloud Persist Fault, local-only mode", err);
    }
  } else if (!isTrial && currentUserId) {
    try {
      const { error: champErr } = await supabase.from('championships').insert({
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
      if (champErr) throw champErr;
      
      await supabase.from('teams').insert(teamsWithIds);
    } catch (err) {
      logError(LogContext.SUPABASE, "Live Arena Persist Fault", err);
    }
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
    if (!arena) throw new Error("Arena não localizada.");

    const isTrial = !!arena.is_trial;
    const table = isTrial ? 'trial_decisions' : 'current_decisions';

    // Recupera dados existentes para anexar log no JSONB 'data' (compatível com seu SQL)
    const { data: existing } = await supabase.from(table).select('data').eq('team_id', teamId).eq('round', round).maybeSingle();
    const existingData = existing?.data || {};
    const oldLogs = Array.isArray(existingData.audit_logs) ? existingData.audit_logs : [];
    
    const newLogEntry = {
      changed_at: new Date().toISOString(),
      user_id: 'Operador Unidade',
      field_path: 'PROTOCOL_TRANSMISSION',
      new_value: 'Decisões Seladas via Wizard'
    };

    const updatedData = {
      ...decisions,
      audit_logs: [...oldLogs, newLogEntry]
    };

    const { error } = await supabase.from(table).upsert({
      team_id: teamId,
      championship_id: champId,
      round: round,
      data: updatedData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'team_id,championship_id,round' });

    if (error) throw error;
    logInfo(LogContext.DATABASE, `Decision Seal Sync: ${teamId}`);
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
      const { audit_logs, ...pureDecision } = teamDecision as any;
      decisions[team.id] = pureDecision as DecisionData;
      attractions[team.id] = calculateAttractiveness(pureDecision as DecisionData);
    }

    const totalAttraction = Object.values(attractions).reduce((a, b) => a + b, 0);
    const batchResults = [];
    const now = new Date().toISOString();

    for (const team of teams) {
      const relativeShare = totalAttraction > 0 ? (attractions[team.id] / totalAttraction) * 100 : (100 / teams.length);
      // Puxa regras de round de dentro do campo 'config' se não houver coluna direta
      const roundRules = arena.config?.round_rules || {};
      const result = calculateProjections(decisions[team.id], arena.branch, arena.ecosystemConfig || {} as any, arena.market_indicators, team, [], currentRound + 1, roundRules, relativeShare, arena);
      
      batchResults.push({ team_id: team.id, kpis: result.kpis, equity: result.kpis.equity, insolvency_status: result.kpis.insolvency_status });

      if (isTrial) {
        await supabase.from('trial_teams').update({ kpis: result.kpis, equity: result.kpis.equity, insolvency_status: result.kpis.insolvency_status }).eq('id', team.id);
      } else {
        await supabase.from('teams').update({ kpis: result.kpis, equity: result.kpis.equity, insolvency_status: result.kpis.insolvency_status }).eq('id', team.id);
      }
    }

    if (isTrial) {
       await supabase.from('trial_championships').update({ current_round: currentRound + 1, round_started_at: now }).eq('id', championshipId);
    } else {
       await supabase.from('championships').update({ current_round: currentRound + 1, round_started_at: now }).eq('id', championshipId);
    }

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

export const fetchPageContent = async (slug: string, lang: string) => { return null; };
export const getModalities = async () => { return []; };
export const subscribeToModalities = (cb: any) => { return { unsubscribe: () => {} }; };

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  if (isTrial) await supabase.from('trial_championships').delete().eq('id', id);
  else await supabase.from('championships').delete().eq('id', id);
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
export const getPublicReports = async (id: string, r: number) => { return { data: [], error: null }; };
export const submitCommunityVote = async (d: any) => { return { error: null }; };
export const getActiveBusinessPlan = async (t: string, r: number) => { return { data: null, error: null }; };
export const saveBusinessPlan = async (p: any) => { return { data: null, error: null }; };
export const getTeamSimulationHistory = async (t: string) => { return []; };
export const getAllUsers = async (): Promise<UserProfile[]> => { return []; };
export const subscribeToBusinessPlan = (t: string, r: number, cb: any) => { return { unsubscribe: () => {} }; };
