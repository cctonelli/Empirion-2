
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan } from '../types';
import { DEFAULT_MACRO } from '../constants';
import { calculateProjections } from './simulation';
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

// NAVEGAÇÃO DE SEGURANÇA: LOCAL PERSISTENCE KEY
const LOCAL_CHAMPS_KEY = 'empirion_v12_arenas';

const ALPHA_IDS = ['tutor', 'alpha', 'tutor_master', 'alpha_street', 'alpha_cell', 'alpha_user'];

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
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
  const { data } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
  return data;
};

/**
 * FETCH ARENAS (HYBRID SYNC)
 * Prioriza LocalStorage para visualização instantânea e mescla com Supabase.
 */
export const getChampionships = async (onlyPublic: boolean = false) => {
  const finalArenas: Championship[] = [];
  
  // 1. RECOUP LOCAL (Garante que o que o usuário acabou de criar apareça)
  try {
    const local = localStorage.getItem(LOCAL_CHAMPS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      finalArenas.push(...parsed);
    }
  } catch (e) { console.error("Local sync fault", e); }

  // 2. FETCH SUPABASE (Cloud Storage)
  try {
    const { data: realChamps } = await supabase.from('championships').select('*').order('created_at', { ascending: false });
    if (realChamps) {
      for (const c of realChamps) {
        if (!finalArenas.find(a => a.id === c.id)) {
           const { data: teams } = await supabase.from('teams').select('*').eq('championship_id', c.id);
           finalArenas.push({ ...c, teams: teams || [], is_trial: false });
        }
      }
    }

    // Trial table support
    const { data: trialChamps } = await supabase.from('trial_championships').select('*').order('created_at', { ascending: false });
    if (trialChamps) {
      for (const tc of trialChamps) {
        if (!finalArenas.find(a => a.id === tc.id)) {
          const { data: tTeams } = await supabase.from('trial_teams').select('*').eq('championship_id', tc.id);
          finalArenas.push({ 
            ...tc, 
            teams: (tTeams || []).map(t => ({ ...t, equity: 5000000, credit_limit: 5000000 })), 
            is_trial: true 
          });
        }
      }
    }
  } catch (e) {
    logError(LogContext.DATABASE, "Cloud fetch deferred (using local cluster)", e);
  }

  const result = onlyPublic ? finalArenas.filter(a => a.is_public || a.is_trial) : finalArenas;
  return { data: result, error: null };
};

export const createChampionshipWithTeams = async (champData: Partial<Championship>, teams: { name: string, is_bot?: boolean }[], isTrialParam: boolean = false) => {
  const isTrial = isTrialParam || localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  
  const newId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // PREPARAÇÃO DO OBJETO DE REDUNDÂNCIA
  const teamsWithIds = teams.map(t => ({
    ...t,
    id: crypto.randomUUID(),
    championship_id: newId,
    equity: 5055447,
    credit_limit: 5000000,
    status: 'active',
    created_at: timestamp
  }));

  const fullChamp: Championship = {
    ...champData,
    id: newId,
    status: 'active',
    current_round: 0,
    created_at: timestamp,
    teams: teamsWithIds,
    is_trial: isTrial
  } as Championship;

  // 1. SALVAR LOCALMENTE (IMEDIATO)
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
    local.unshift(fullChamp);
    localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify(local));
  } catch (e) { console.error("Local persist failure", e); }

  // 2. SALVAR SUPABASE (ASSÍNCRONO)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const payload: any = {
      id: newId,
      name: champData.name,
      branch: champData.branch,
      status: 'active',
      current_round: 0,
      total_rounds: champData.total_rounds || 12,
      regions_count: champData.regions_count || 9,
      bots_count: champData.bots_count || 0,
      initial_financials: champData.initial_financials || {},
      market_indicators: champData.market_indicators || DEFAULT_MACRO,
      config: champData.config || {},
      sales_mode: champData.sales_mode || 'hybrid',
      region_type: champData.region_type || 'mixed',
      analysis_source: champData.analysis_source || 'parameterized'
    };

    if (!isTrial && session?.user) {
      payload.tutor_id = session.user.id;
      payload.description = champData.description || 'Arena Oracle';
    }

    const { error: cErr } = await supabase.from(table).insert([payload]);
    if (!cErr) {
       await supabase.from(teamsTable).insert(teamsWithIds.map(t => ({
         id: t.id,
         name: t.name,
         championship_id: newId,
         is_bot: t.is_bot,
         equity: t.equity,
         credit_limit: t.credit_limit,
         status: 'active'
       })));
    }
  } catch (err: any) { 
    logError(LogContext.SUPABASE, "Cloud push deferred", err.message);
  }

  return { champ: fullChamp, teams: teamsWithIds };
};

export const processRoundTurnover = async (championshipId: string, currentRound: number) => {
  logInfo(LogContext.TURNOVER, `Turnover v12.9.1 | Arena ${championshipId} | Ciclo ${currentRound}`);
  try {
    const { data: allArenas } = await getChampionships();
    const arena = allArenas?.find(a => a.id === championshipId);
    if (!arena) throw new Error("Arena não localizada no cluster.");

    const teams = arena.teams || [];
    const { data: decisions } = await supabase.from('current_decisions').select('*').eq('championship_id', championshipId).eq('round', currentRound + 1);
    const { data: previousStates } = await supabase.from('companies').select('*').eq('championship_id', championshipId).eq('round', currentRound);

    const initialSharePrice = arena.config?.initial_share_price || 1.0;
    const batchResults = [];
    
    for (const team of teams) {
      let teamDecision = decisions?.find(d => d.team_id === team.id)?.data;

      if (team.is_bot) {
         teamDecision = await generateBotDecision(arena.branch, currentRound + 1, arena.regions_count, arena.market_indicators);
         await saveDecisions(team.id, championshipId, currentRound + 1, teamDecision);
      }

      if (!teamDecision) {
         teamDecision = {
            regions: Object.fromEntries(Array.from({ length: arena.regions_count || 9 }, (_, i) => [i + 1, { price: 372, term: 1, marketing: 1000 }])),
            hr: { hired: 0, fired: 0, salary: 1313, trainingPercent: 0, participationPercent: 0, sales_staff_count: 50 },
            production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 50, rd_investment: 0 },
            finance: { loanRequest: 0, application: 0, buyMachines: { alfa: 0, beta: 0, gama: 0 } },
            legal: { recovery_mode: 'none' }
          };
      }

      const prevState = previousStates?.find(s => s.team_id === team.id);
      const teamPrevState = currentRound === 0 
        ? { kpis: { market_valuation: { share_price: initialSharePrice } } } 
        : prevState;
      
      const result = calculateProjections(teamDecision, arena.branch, arena.ecosystemConfig || {} as any, arena.market_indicators, teamPrevState, null, arena.region_type);

      batchResults.push({
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
      });
    }

    // UPDATE LOCAL
    const local = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
    const idx = local.findIndex((a: any) => a.id === championshipId);
    if (idx !== -1) {
       local[idx].current_round = currentRound + 1;
       local[idx].teams = local[idx].teams.map((t: any) => {
         const res = batchResults.find(r => r.team_id === t.id);
         return res ? { ...t, equity: res.equity, credit_limit: res.credit_limit } : t;
       });
       localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify(local));
    }

    // SYNC CLOUD
    await supabase.from('companies').insert(batchResults);
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

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_decisions' : 'current_decisions';
  const { error } = await supabase.from(table).upsert({ team_id: teamId, championship_id: champId, round, data: decisions }); 
  if (error) throw error;
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
  const local = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
  localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify(local.filter((a: any) => a.id !== id)));
  
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
