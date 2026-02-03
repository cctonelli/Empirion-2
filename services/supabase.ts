
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan, TransparencyLevel, GazetaMode, InitialMachine, MacroIndicators, Loan } from '../types';
import { DEFAULT_MACRO, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { calculateProjections, calculateAttractiveness, sanitize } from './simulation';
import { logError, logInfo, LogContext } from '../utils/logger';
import { generateBotDecision } from './gemini';

const env = (import.meta as any)?.env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWpsZWplcW5kZmR2eHh2dXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxODk3MzgsImV4cCI6MjA4Mjc2NTczOH0.QD3HK_ggQJb8sQHBJSIA2ARhh9Vz8v-qTkh2tQyKLis';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const isTestMode = true;

const SYSTEM_TUTOR_ID = '00000000-0000-0000-0000-000000000000';
const LOCAL_CHAMPS_KEY = 'empirion_v12_arenas';

const preparePayload = (obj: any) => {
  return JSON.parse(JSON.stringify(obj, (k, v) => {
    if (v === undefined) return undefined;
    if (typeof v === 'number' && !isFinite(v)) return 0;
    return v;
  }));
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  
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

  const { data, error } = await supabase
    .from('users')
    .select('id, supabase_user_id, name, nickname, phone, email, role, is_opal_premium, created_at')
    .eq('supabase_user_id', userId)
    .maybeSingle();

  if (error) {
    logError(LogContext.DATABASE, "User fetch error", error);
    return null;
  }
  
  return data;
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  const finalArenas: Championship[] = [];
  try {
    const local = localStorage.getItem(LOCAL_CHAMPS_KEY);
    if (local) finalArenas.push(...JSON.parse(local));

    const { data: { session } } = await (supabase.auth as any).getSession();
    
    const { data: rawChamps, error: rawErr } = await supabase
      .from('championships')
      .select('*')
      .order('created_at', { ascending: false });

    if (!rawErr && rawChamps) {
       for (const c of rawChamps) {
          if (!finalArenas.find(a => a.id === c.id)) {
             const { data: teamsData } = await supabase.from('teams').select('*').eq('championship_id', c.id);
             finalArenas.push({ ...c, teams: teamsData || [], is_trial: false });
          }
       }
    }

    let trialQuery = supabase.from('trial_championships').select('*');
    if (session) {
       trialQuery = trialQuery.or(`tutor_id.eq.${session.user.id},tutor_id.is.null,tutor_id.eq.${SYSTEM_TUTOR_ID}`);
    } else {
       trialQuery = trialQuery.or(`tutor_id.is.null,tutor_id.eq.${SYSTEM_TUTOR_ID}`);
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
  const currentUserId = session?.user?.id || (isTrial ? null : SYSTEM_TUTOR_ID);

  const initialShare = 100 / Math.max(teams.length, 1);

  const baselineLoans: Loan[] = [
    { 
      id: `bdi-start-${newId}`, 
      type: 'normal', 
      principal: 1000000, 
      remaining_principal: 125000, 
      grace_periods: 0, 
      total_installments: 8, 
      remaining_installments: 1, 
      interest_rate: 2.0, 
      created_at_round: -1 
    },
    { 
      id: `compulsory-p00-${newId}`, 
      type: 'compulsory', 
      principal: 1372362, 
      remaining_principal: 1372362, 
      grace_periods: 0, 
      total_installments: 1, 
      remaining_installments: 1, 
      interest_rate: 5.0, 
      created_at_round: 0 
    }
  ];

  const teamsPayload = teams.map(t => ({
    id: crypto.randomUUID(),
    name: t.name,
    championship_id: newId,
    equity: 5055447,
    credit_limit: 5000000,
    current_cash: 170000,
    current_rating: 'AAA',
    status: 'active',
    insolvency_status: 'SAUDAVEL',
    is_bot: !!t.is_bot,
    master_key_enabled: false,
    created_at: timestamp,
    kpis: { 
        market_share: initialShare, 
        rating: 'AAA', 
        fleet: champData.market_indicators?.initial_machinery_mix || DEFAULT_MACRO.initial_machinery_mix,
        loans: baselineLoans,
        statements: {
            balance_sheet: champData.initial_financials?.balance_sheet || [],
            dre: champData.initial_financials?.dre || [],
            cash_flow: champData.initial_financials?.cash_flow || []
        }
    }
  }));

  const mkt = champData.market_indicators || DEFAULT_MACRO;

  const fullChamp = { 
    ...champData, 
    id: newId, 
    status: 'active', 
    current_round: 0, 
    created_at: timestamp,
    round_started_at: timestamp,
    is_trial: isTrial,
    tutor_id: currentUserId,
    dividend_percent: champData.dividend_percent || 25.0,
    deadline_value: champData.deadline_value || 7,
    deadline_unit: champData.deadline_unit || 'days',
    currency: champData.currency || 'BRL',
    sales_mode: champData.sales_mode || 'hybrid',
    scenario_type: champData.scenario_type || 'simulated',
    transparency_level: champData.transparency_level || 'medium',
    gazeta_mode: champData.gazeta_mode || 'anonymous',
    regions_count: champData.regions_count || 1,
    social_charges: mkt.social_charges || 35.0,
    compulsory_loan_agio: mkt.compulsory_loan_agio || 3.0,
    production_hours_period: mkt.production_hours_period || 946,
    award_values: mkt.award_values || DEFAULT_MACRO.award_values,
    exchange_rates: mkt.exchange_rates || DEFAULT_MACRO.exchange_rates,
    staffing: mkt.staffing || DEFAULT_MACRO.staffing,
    prices: mkt.prices || DEFAULT_MACRO.prices,
    machinery_values: mkt.machinery_values || DEFAULT_MACRO.machinery_values,
    observers: champData.observers || [],
    config: { 
      ...(champData.config || {}), 
      round_rules: champData.round_rules || {}
    }
  } as any;

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
      regions_count: fullChamp.regions_count,
      currency: fullChamp.currency,
      sales_mode: fullChamp.sales_mode,
      scenario_type: fullChamp.scenario_type,
      transparency_level: fullChamp.transparency_level,
      gazeta_mode: fullChamp.gazeta_mode,
      tutor_id: currentUserId,
      round_started_at: fullChamp.round_started_at,
      dividend_percent: fullChamp.dividend_percent,
      social_charges: fullChamp.social_charges,
      compulsory_loan_agio: fullChamp.compulsory_loan_agio,
      production_hours_period: fullChamp.production_hours_period,
      award_values: fullChamp.award_values,
      exchange_rates: fullChamp.exchange_rates,
      staffing: fullChamp.staffing,
      prices: fullChamp.prices,
      machinery_values: fullChamp.machinery_values,
      observers: fullChamp.observers,
      config: fullChamp.config
    });
    
    if (!champErr) {
       await supabase.from(teamsTable).insert(teamsPayload);
    } else {
       throw champErr;
    }
  } catch (err) {
    logError(LogContext.SUPABASE, "Cloud Sync Failed during creation", err);
  }

  const localArenas = JSON.parse(localStorage.getItem(LOCAL_CHAMPS_KEY) || '[]');
  localStorage.setItem(LOCAL_CHAMPS_KEY, JSON.stringify([{ ...fullChamp, teams: teamsPayload }, ...localArenas]));
  localStorage.setItem('active_champ_id', newId);

  return { champ: fullChamp, teams: teamsPayload };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData) => {
  try {
    const { data: allArenas } = await getChampionships();
    const arena = allArenas?.find(a => a.id === champId);
    if (!arena) throw new Error("Arena não localizada no nodo local.");

    const isTrial = !!arena.is_trial;
    const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';

    const cleanPayload = preparePayload(decisions);
    const { data: existingRow } = await supabase.from(decisionsTable)
        .select('id')
        .eq('championship_id', champId)
        .eq('team_id', teamId)
        .eq('round', round)
        .maybeSingle();

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

    logInfo(LogContext.DATABASE, "Decisão sincronizada com sucesso.");
    return { success: true };
  } catch (err: any) {
    logError(LogContext.DATABASE, "Falha na Transmissão de Decisão", err.message);
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
    
    const { data: roundMacroData } = await supabase
      .from('championship_macro_rules')
      .select('*')
      .eq('championship_id', championshipId)
      .eq('round', currentRound + 1)
      .maybeSingle();

    const effectiveMacro: MacroIndicators = {
      ...DEFAULT_MACRO,
      ...arena.market_indicators,
      ...(roundMacroData || {})
    };

    const batchResults = [];
    const now = new Date().toISOString();

    for (const team of teams) {
      let teamDecision;
      const decisionTable = isTrial ? 'trial_decisions' : 'current_decisions';
      if (team.is_bot) {
        teamDecision = await generateBotDecision(arena.branch, currentRound + 1, arena.regions_count, effectiveMacro);
      } else {
        const { data } = await supabase.from(decisionTable).select('data').eq('team_id', team.id).eq('round', currentRound + 1).maybeSingle();
        teamDecision = data?.data;
      }
      
      if (!teamDecision) {
        teamDecision = {
          regions: Object.fromEntries(Array.from({ length: arena.regions_count || 4 }, (_, i) => [i + 1, { price: effectiveMacro.avg_selling_price || 375, term: 1, marketing: 0 }])),
          hr: { hired: 0, fired: 0, salary: effectiveMacro.hr_base.salary, trainingPercent: 0, participationPercent: 0, sales_staff_count: effectiveMacro.staffing.sales.count, misc: 0 },
          production: { purchaseMPA: 10000, purchaseMPB: 5000, paymentType: 1, activityLevel: 80, rd_investment: 0, extraProductionPercent: 0, net_profit_target_percent: 5.0, term_interest_rate: effectiveMacro.sales_interest_rate || 1.5 },
          machinery: { buy: { alfa: 0, beta: 0, gama: 0 }, sell: { alfa: 0, beta: 0, gama: 0 } },
          finance: { loanRequest: 0, loanTerm: 1, application: 0 },
          estimates: { forecasted_revenue: 0, forecasted_unit_cost: 0, forecasted_net_profit: 0 },
          judicial_recovery: false
        };
      }

      const result = calculateProjections(teamDecision, arena.branch, arena.ecosystemConfig || {} as any, effectiveMacro, team, [], currentRound + 1, arena.round_rules, undefined, arena);
      
      const currentFleet = (team.kpis?.fleet || effectiveMacro.initial_machinery_mix) as InitialMachine[];
      const nextFleet = currentFleet.map(m => ({ ...m, age: m.age + 1 }));

      const buy = teamDecision.machinery.buy;
      if (buy.alfa > 0) {
        for (let i = 0; i < buy.alfa; i++) nextFleet.push({ id: `buy-alfa-${Date.now()}-${i}`, model: 'alfa', age: 0, purchase_value: effectiveMacro.machinery_values.alfa });
      }

      batchResults.push({ 
        team_id: team.id, 
        kpis: { ...result.kpis, fleet: nextFleet, statements: result.statements }, 
        equity: result.kpis.equity, 
        current_cash: result.health.cash,
        current_rating: result.health.rating,
        insolvency_status: result.kpis.insolvency_status 
      });

      const teamsTable = isTrial ? 'trial_teams' : 'teams';
      await supabase.from(teamsTable).update({ 
        kpis: { ...result.kpis, fleet: nextFleet, statements: result.statements }, 
        equity: result.kpis.equity, 
        current_cash: result.health.cash,
        current_rating: result.health.rating,
        insolvency_status: result.kpis.insolvency_status 
      }).eq('id', team.id);

      if (!isTrial) {
        await supabase.from('companies').insert({
          team_id: team.id,
          championship_id: championshipId,
          round: currentRound + 1,
          state: result.kpis,
          dre: result.statements.dre,
          balance_sheet: result.statements.balance_sheet,
          cash_flow: result.statements.cash_flow,
          equity: result.kpis.equity,
          credit_rating: result.creditRating
        });
      }
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
         return res ? { ...t, ...res } : t;
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
  if (updates.round_rules) {
    const rounds = Object.keys(updates.round_rules);
    for (const r of rounds) {
       const roundNum = parseInt(r);
       const ruleData = updates.round_rules[roundNum];
       await supabase.from('championship_macro_rules').upsert({
          championship_id: id,
          round: roundNum,
          ...ruleData,
          updated_at: new Date().toISOString()
       }, { onConflict: 'championship_id, round' });
    }
  }
  return { error };
};

export const getModalities = async () => {
    const { data } = await supabase.from('modalities').select('*').eq('is_public', true);
    return data || [];
};

export const subscribeToModalities = (cb: any) => {
    return supabase.channel('modalities-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, cb).subscribe();
};

export const fetchPageContent = async (slug: string, locale: string) => {
  const { data } = await supabase.from('site_content').select('content').eq('page_slug', slug).eq('locale', locale).maybeSingle();
  return data?.content;
};

// Nova função para o CMS do Administrador
export const updatePageContent = async (slug: string, locale: string, content: any) => {
  return await supabase.from('site_content').upsert({
    page_slug: slug,
    locale: locale,
    content: content,
    updated_at: new Date().toISOString()
  }, { onConflict: 'page_slug, locale' });
};

export const getPublicReports = async (id: string, r: number) => {
  return await supabase.from('public_reports').select('*').eq('championship_id', id).eq('round', r);
};

export const submitCommunityVote = async (d: any) => {
  return await supabase.from('community_ratings').insert(d);
};

export const getActiveBusinessPlan = async (t: string, r: number) => {
  return await supabase.from('business_plans').select('*').eq('team_id', t).eq('round', r).maybeSingle();
};

export const submitCommunityRating = async (ratingData: any) => {
  return await supabase.from('community_ratings').insert(ratingData);
};

export const saveBusinessPlan = async (p: any) => {
  const { championship_id, team_id, round, data, status, version } = p;
  const { data: existing } = await supabase.from('business_plans').select('id').eq('team_id', team_id).eq('round', round).maybeSingle();
  if (existing) {
    return await supabase.from('business_plans').update({ data, status, version, updated_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    return await supabase.from('business_plans').insert(p);
  }
};

export const getTeamSimulationHistory = async (teamId: string) => {
  const { data } = await supabase.from('companies').select('*').eq('team_id', teamId).order('round', { ascending: true });
  return data || [];
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('users').select('*');
  return data || [];
};

export const subscribeToBusinessPlan = (teamId: string, round: number, cb: any) => {
  return supabase.channel(`bp-${teamId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'business_plans', filter: `team_id=eq.${teamId}` }, cb).subscribe();
};
