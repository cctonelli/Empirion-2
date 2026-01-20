
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan } from '../types';
import { DEFAULT_MACRO } from '../constants';
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
const LOCAL_DECISIONS_KEY = 'empirion_trial_decisions';

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
  } catch (e) { logError(LogContext.DATABASE, "Cloud fetch deferred", e); }
  const result = onlyPublic ? finalArenas.filter(a => a.is_public || a.is_trial) : finalArenas;
  return { data: result, error: null };
};

export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string, is_bot?: boolean }[], isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const newId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // Share Inicial Proporcional no P00 (Evita Mock)
  const initialShare = 100 / Math.max(teams.length, 1);

  const teamsWithIds = teams.map(t => ({
    ...t,
    id: crypto.randomUUID(),
    championship_id: newId,
    equity: 5055447,
    credit_limit: 5000000,
    status: 'active',
    created_at: timestamp,
    kpis: { 
      market_share: initialShare, 
      rating: 'AAA', 
      insolvency_status: 'SAUDAVEL', 
      kanitz_factor: 2.19,
      market_valuation: { share_price: 1.01, total_shares: 5000000, market_cap: 5055447, tsr: 1.1 }
    }
  }));

  const fullChamp = { ...champData, id: newId, status: 'active', current_round: 0, created_at: timestamp, teams: teamsWithIds, is_trial: isTrial } as Championship;

  localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify([fullChamp, ...JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]')]));
  localStorage.setItem('active_champ_id', newId);

  return { champ: fullChamp, teams: teamsWithIds };
};

/**
 * TURNOVER ORACLE v14.9 - ENGINE COMPETITIVA REAL
 */
export const processRoundTurnover = async (championshipId: string, currentRound: number) => {
  try {
    const { data: allArenas } = await getChampionships();
    const arena = allArenas?.find(a => a.id === championshipId);
    if (!arena) throw new Error("Arena não localizada.");

    const teams = arena.teams || [];
    const decisions: Record<string, DecisionData> = {};
    const attractions: Record<string, number> = {};

    // PASSO 1: COLETAR DECISÕES E CALCULAR ATRATIVIDADE
    for (const team of teams) {
      let teamDecision;
      if (team.is_bot) {
        teamDecision = await generateBotDecision(arena.branch, currentRound + 1, arena.regions_count, arena.market_indicators);
      } else {
        const { data } = await supabase.from('current_decisions').select('data').eq('team_id', team.id).eq('round', currentRound + 1).maybeSingle();
        teamDecision = data?.data;
      }

      // Fallback decisório se equipe estiver inativa
      if (!teamDecision) {
        teamDecision = {
          regions: Object.fromEntries(Array.from({ length: arena.regions_count || 4 }, (_, i) => [i + 1, { price: 375, term: 1, marketing: 0 }])),
          hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 0, sales_staff_count: 50, misc: 0 },
          production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 80, rd_investment: 0, extraProductionPercent: 0 },
          machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
          finance: { loanRequest: 0, loanType: 1, application: 0 },
          estimates: { forecasted_revenue: 0, forecasted_unit_cost: 0, forecasted_net_profit: 0 },
          judicial_recovery: false
        };
      }
      decisions[team.id] = teamDecision;
      attractions[team.id] = calculateAttractiveness(teamDecision);
    }

    // PASSO 2: CALCULAR SHARE RELATIVO
    const totalAttraction = Object.values(attractions).reduce((a, b) => a + b, 0);
    const batchResults = [];

    for (const team of teams) {
      const relativeShare = totalAttraction > 0 ? (attractions[team.id] / totalAttraction) * 100 : (100 / teams.length);
      
      const result = calculateProjections(
        decisions[team.id], 
        arena.branch, 
        arena.ecosystemConfig || {} as any, 
        arena.market_indicators, 
        team, 
        [], 
        currentRound + 1, 
        arena.round_rules,
        relativeShare // Injeta o share competitivo real
      );

      batchResults.push({
        team_id: team.id, team_name: team.name, championship_id: championshipId, round: currentRound + 1,
        kpis: result.kpis, equity: result.kpis.equity, credit_limit: 5000000
      });
    }

    // Persistência local (Trial)
    const local = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
    const idx = local.findIndex((a: any) => a.id === championshipId);
    if (idx !== -1) {
       local[idx].current_round = currentRound + 1;
       local[idx].teams = local[idx].teams.map((t: any) => {
         const res = batchResults.find(r => r.team_id === t.id);
         return res ? { ...t, kpis: res.kpis, equity: res.equity } : t;
       });
       localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify(local));
    }

    return { success: true };
  } catch (err: any) {
    logError(LogContext.TURNOVER, "Turnover Fault", err.message);
    return { success: false, error: err.message };
  }
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_decisions' : 'current_decisions';
  try {
    const { error } = await supabase.from(table).upsert({ team_id: teamId, championship_id: champId, round, data: decisions, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    const local = JSON.parse(localStorage.getItem(LOCAL_DECISIONS_KEY) || '{}');
    local[`${champId}_${teamId}_${round}`] = decisions;
    localStorage.setItem(LOCAL_DECISIONS_KEY, JSON.stringify(local));
    return { success: true, source: 'local' };
  }
};

export const fetchPageContent = async (slug: string, lang: string) => { return null; };
export const getModalities = async () => { return []; };
export const subscribeToModalities = (cb: any) => { return { unsubscribe: () => {} }; };
export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const local = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
  localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify(local.filter((a: any) => a.id !== id)));
  return { error: null };
};
export const provisionDemoEnvironment = () => { localStorage.setItem('is_trial_session', 'true'); };
export const updateEcosystem = async (id: string, up: any) => { return { error: null }; };
export const getPublicReports = async (id: string, r: number) => { return { data: [], error: null }; };
export const submitCommunityVote = async (d: any) => { return { error: null }; };
export const getActiveBusinessPlan = async (t: string, r: number) => { return { data: null, error: null }; };
export const saveBusinessPlan = async (p: any) => { return { data: null, error: null }; };
export const getTeamSimulationHistory = async (t: string) => { return []; };
// Fix: Added missing getAllUsers export to resolve error in AdminCommandCenter.tsx
export const getAllUsers = async (): Promise<UserProfile[]> => { return []; };
// Fix: Added missing subscribeToBusinessPlan export to resolve error in BusinessPlanWizard.tsx
export const subscribeToBusinessPlan = (t: string, r: number, cb: any) => { return { unsubscribe: () => {} }; };
