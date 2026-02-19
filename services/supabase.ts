
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan, TransparencyLevel, GazetaMode, InitialMachine, MacroIndicators, Loan, Branch, AuditLog, StrategicProfile } from '../types';
import { DEFAULT_MACRO, INITIAL_INDUSTRIAL_FINANCIALS, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';
import { calculateProjections, sanitize } from './simulation';
import { logError, logInfo, LogContext } from '../utils/logger';
import { generateBotDecision } from './gemini';

const env = (import.meta as any)?.env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWpsZWplcW5kZmR2eHh2dXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxODk3MzgsImV4cCI6MjA4Mjc2NTczOH0.QD3HK_ggQJb8sQHBJSIA2ARhh9Vz8v-qTkh2tQyKLis';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const isTestMode = true;

const SYSTEM_TUTOR_ID = '00000000-0000-0000-0000-000000000000';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  if (isTrial || userId === SYSTEM_TUTOR_ID) {
    return {
      id: userId || SYSTEM_TUTOR_ID, 
      supabase_user_id: userId || SYSTEM_TUTOR_ID, 
      name: 'Trial User',
      nickname: 'Trial_Strategist',
      phone: '', email: '', role: 'player', is_opal_premium: true, created_at: new Date().toISOString()
    };
  }
  const { data } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
  return data;
};

export const getUserEmpirePoints = async (userId: string) => {
  const { data } = await supabase.from('empire_points').select('total_points').eq('user_id', userId).maybeSingle();
  return data?.total_points || 0;
};

export const getUserBadges = async (userId: string) => {
  const { data } = await supabase.from('user_badges').select('badge_id, earned_at, badges(*)').eq('user_id', userId);
  return data || [];
};

export const getAvailableBadges = async () => {
  const { data } = await supabase.from('badges').select('*');
  return data || [];
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('users').select('*');
  return data || [];
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  const fetchMain = async () => {
    let query = supabase.from('championships').select('*').order('created_at', { ascending: false });
    if (onlyPublic) query = query.eq('is_public', true);
    return await query;
  };

  const fetchTrial = async () => {
    let query = supabase.from('trial_championships').select('*').order('created_at', { ascending: false });
    return await query;
  };

  const [mainRes, trialRes] = await Promise.all([fetchMain(), fetchTrial()]);
  
  const allRaw = [
    ...(mainRes.data || []).map(c => ({ ...c, is_trial: !!c.is_trial })),
    ...(trialRes.data || []).map(c => ({ ...c, is_trial: true }))
  ];

  const finalArenas: Championship[] = [];
  for (const c of allRaw) {
    const table = c.is_trial ? 'trial_teams' : 'teams';
    const { data: teamsData } = await supabase.from(table).select('*').eq('championship_id', c.id).order('equity', { ascending: false });
    finalArenas.push({ ...c, teams: teamsData || [] });
  }

  return { data: finalArenas, error: mainRes.error || trialRes.error };
};

export const getGlobalLeaderboard = async () => {
    const { data } = await getChampionships(true);
    return (data || []).slice(0, 4).map(c => ({
        id: c.id,
        name: c.name,
        branch: c.branch,
        round: c.current_round,
        total: c.total_rounds,
        topTeams: (c.teams || []).slice(0, 3).map((t, idx) => ({
            name: t.name,
            equity: t.equity,
            tsr: t.kpis?.tsr || 0,
            pos: idx + 1
        }))
    }));
};

export const createChampionshipWithTeams = async (champData: any, teams: any[], isTrial: boolean = false) => {
    const { data: { session } } = await (supabase.auth as any).getSession();
    const tutorId = session?.user?.id || SYSTEM_TUTOR_ID;
    const champTable = isTrial ? 'trial_championships' : 'championships';
    const teamsTable = isTrial ? 'trial_teams' : 'teams';
    const finalFinancials = champData.initial_financials || INITIAL_INDUSTRIAL_FINANCIALS;

    const insertPayload = {
        name: champData.name,
        description: champData.description || '',
        total_rounds: champData.total_rounds || champData.totalRounds,
        regions_count: champData.regions_count || champData.regionsCount,
        currency: champData.currency,
        deadline_value: champData.deadline_value || champData.roundTime,
        deadline_unit: champData.deadline_unit || champData.roundUnit,
        branch: champData.branch || 'industrial',
        tutor_id: tutorId,
        is_trial: isTrial,
        initial_financials: finalFinancials,
        market_indicators: champData.market_indicators,
        round_rules: champData.round_rules || {},
        transparency_level: champData.transparency_level || champData.transparency || 'medium',
        gazeta_mode: champData.gazeta_mode || champData.gazetaMode || 'anonymous',
        observers: champData.observers || [],
        is_public: champData.is_public !== undefined ? champData.is_public : true
    };

    const { data: champ, error: cErr } = await supabase.from(champTable).insert(insertPayload).select().single();
    if (cErr) return { success: false, error: cErr.message };

    const profiles: StrategicProfile[] = ["AGRESSIVO", "CONSERVADOR", "EFICIENTE", "INOVADOR", "EQUILIBRADO"];
    const teamsToInsert = teams.map(t => ({
        name: t.name,
        is_bot: t.is_bot || false,
        strategic_profile: t.is_bot ? profiles[Math.floor(Math.random() * profiles.length)] : 'EQUILIBRADO',
        championship_id: champ.id,
        equity: finalFinancials.balance_sheet.find((n:any) => n.id === 'equity')?.value || 7252171.74,
        kpis: { rating: 'AAA', current_cash: 0, stock_quantities: { mpa: 30000, mpb: 20000 }, statements: finalFinancials }
    }));

    const { error: tErr } = await supabase.from(teamsTable).insert(teamsToInsert);
    if (tErr) return { success: false, error: tErr.message };

    return { success: true, data: champ };
};

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  const { error } = await supabase.from(table).delete().eq('id', id);
  return { error };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: any) => {
    const isTrial = localStorage.getItem('is_trial_session') === 'true';
    const table = isTrial ? 'trial_decisions' : 'current_decisions';
    
    const { data: { session } } = await (supabase.auth as any).getSession();
    
    if (session) {
        const { data: old } = await supabase.from(table).select('data').eq('team_id', teamId).eq('round', round).maybeSingle();
        if (old) {
           await supabase.from('decision_audit_log').insert({
               championship_id: champId,
               team_id: teamId,
               round: round,
               user_id: session.user.id,
               field_path: 'root_snapshot',
               old_value: old.data,
               new_value: decisions,
               comment: 'Alteração estratégica persistida'
           });
        }
    }

    const { error } = await supabase.from(table).upsert({
        team_id: teamId, championship_id: champId, round: round, data: { ...decisions }, updated_at: new Date().toISOString()
    });
    return { success: !error, error: error?.message };
};

export const getTeamAuditLog = async (teamId: string, round: number): Promise<AuditLog[]> => {
    const { data } = await supabase.from('decision_audit_log')
        .select('*')
        .eq('team_id', teamId)
        .eq('round', round)
        .order('changed_at', { ascending: false });
    return data || [];
};

export const processRoundTurnover = async (id: string, round: number) => {
    try {
        const isTrial = localStorage.getItem('is_trial_session') === 'true';
        const { data: champ } = await supabase.from(isTrial ? 'trial_championships' : 'championships').select('*').eq('id', id).single();
        const { data: teams } = await supabase.from(isTrial ? 'trial_teams' : 'teams').select('*').eq('championship_id', id);
        if (!champ) throw new Error("Arena não encontrada.");

        for (const team of (teams || [])) {
            const { data: dec } = await supabase.from(isTrial ? 'trial_decisions' : 'current_decisions').select('*').eq('team_id', team.id).eq('round', round + 1).maybeSingle();
            let finalDecision = dec?.data;
            
            if (team.is_bot && !finalDecision) {
              finalDecision = await generateBotDecision(
                champ.branch, 
                round + 1, 
                champ.regions_count, 
                champ.market_indicators,
                team.name,
                team.strategic_profile // Coerência tática persistida
              );
            }

            if (finalDecision) {
                const res = calculateProjections(finalDecision, champ.branch, champ.ecosystem_config, champ.market_indicators, team);
                await supabase.from(isTrial ? 'trial_companies' : 'companies').insert({
                    team_id: team.id, championship_id: id, round: round + 1, state: finalDecision, kpis: res.kpis, equity: res.kpis.equity
                });
                await supabase.from(isTrial ? 'trial_teams' : 'teams').update({ equity: res.kpis.equity, kpis: res.kpis }).eq('id', team.id);
            }
        }
        await supabase.from(isTrial ? 'trial_championships' : 'championships').update({ current_round: round + 1, round_started_at: new Date().toISOString() }).eq('id', id);
        return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
};

export const updateEcosystem = async (id: string, u: any) => {
    const isTrial = localStorage.getItem('is_trial_session') === 'true';
    return await supabase.from(isTrial ? 'trial_championships' : 'championships').update(u).eq('id', id);
};

export const saveBusinessPlan = async (p: Partial<BusinessPlan>) => {
  const { data: { session } } = await (supabase.auth as any).getSession();
  const payload = { ...p, user_id: p.user_id || session?.user?.id, updated_at: new Date().toISOString() };
  if (p.id) return await supabase.from('business_plans').update(payload).eq('id', p.id);
  return await supabase.from('business_plans').insert(payload);
};

export const getActiveBusinessPlan = async (teamId: string, round: number) => {
  return await supabase.from('business_plans').select('*').eq('team_id', teamId).eq('round', round).maybeSingle();
};

export const getTeamSimulationHistory = async (teamId: string) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const { data } = await supabase.from(isTrial ? 'trial_companies' : 'companies').select('*').eq('team_id', teamId).order('round', { ascending: true });
  return data || [];
};

export const updatePageContent = async (slug: string, lang: string, content: any) => {
    return await supabase.from('site_content').upsert({ page_slug: slug, locale: lang, content: content, updated_at: new Date().toISOString() });
};

export const fetchPageContent = async (slug: string, lang: string) => {
    const { data } = await supabase.from('site_content').select('content').eq('page_slug', slug).eq('locale', lang).maybeSingle();
    return data?.content || null;
};

export const getModalities = async () => {
    const { data } = await supabase.from('modalities').select('*');
    return data || [];
};

export const subscribeToModalities = (cb: any) => {
    return supabase.channel('modalities_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, cb).subscribe();
};

export const getPublicReports = async (id: string, r: number) => {
    const isTrial = localStorage.getItem('is_trial_session') === 'true';
    return await supabase.from(isTrial ? 'trial_companies' : 'companies').select('*').eq('championship_id', id).eq('round', r);
};

export const submitCommunityVote = async (d: any) => {
    return await supabase.from('community_ratings').insert(d);
};

export const provisionDemoEnvironment = () => {
    localStorage.setItem('is_trial_session', 'true');
};

export const fetchBlogPosts = async (searchQuery?: string) => {
  let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (searchQuery?.trim()) query = query.or(`question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`);
  return await query;
};
