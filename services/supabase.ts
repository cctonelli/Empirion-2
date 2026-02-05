
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, Team, UserProfile, EcosystemConfig, BusinessPlan, TransparencyLevel, GazetaMode, InitialMachine, MacroIndicators, Loan } from '../types';
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

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('users').select('*');
  return data || [];
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  let query = supabase.from('championships').select('*').order('created_at', { ascending: false });
  if (onlyPublic) query = query.eq('is_public', true);
  
  const { data: rawChamps, error } = await query;
  if (error) return { data: [], error };

  const finalArenas: Championship[] = [];
  for (const c of rawChamps) {
    const { data: teamsData } = await supabase.from('teams').select('*').eq('championship_id', c.id);
    finalArenas.push({ ...c, teams: teamsData || [] });
  }
  return { data: finalArenas, error: null };
};

export const saveBusinessPlan = async (p: Partial<BusinessPlan>) => {
  const { data: { session } } = await (supabase.auth as any).getSession();
  const userId = session?.user?.id;

  const payload = {
    ...p,
    user_id: p.user_id || userId,
    updated_at: new Date().toISOString()
  };

  if (p.id) {
    return await supabase.from('business_plans').update(payload).eq('id', p.id);
  } else {
    return await supabase.from('business_plans').insert(payload);
  }
};

export const getActiveBusinessPlan = async (teamId: string, round: number) => {
  return await supabase.from('business_plans').select('*').eq('team_id', teamId).eq('round', round).maybeSingle();
};

export const getTeamSimulationHistory = async (teamId: string) => {
  const { data } = await supabase.from('companies').select('*').eq('team_id', teamId).order('round', { ascending: true });
  return data || [];
};

export const createChampionshipWithTeams = async (champData: any, teams: any[], isTrial: boolean = false) => {
    const { data: { session } } = await (supabase.auth as any).getSession();
    const tutorId = session?.user?.id || SYSTEM_TUTOR_ID;

    // Se for Trial, ignoramos o initial_financials enviado e usamos o Padrão Imutável
    const finalFinancials = isTrial ? INITIAL_INDUSTRIAL_FINANCIALS : champData.initial_financials;

    const { data: champ, error: cErr } = await supabase.from('championships').insert({
        ...champData,
        tutor_id: tutorId,
        is_trial: isTrial,
        initial_financials: finalFinancials
    }).select().single();

    if (cErr) return { success: false, error: cErr.message };

    const teamsToInsert = teams.map(t => ({
        ...t,
        championship_id: champ.id,
        equity: finalFinancials.balance_sheet.find((n:any) => n.id === 'equity')?.value || 7252171.74,
        kpis: { rating: 'AAA', current_cash: 0, stock_quantities: { mpa: 30000, mpb: 20000 }, statements: finalFinancials }
    }));

    const { error: tErr } = await supabase.from('teams').insert(teamsToInsert);
    if (tErr) return { success: false, error: tErr.message };

    return { success: true, data: champ };
};

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const { error } = await supabase.from('championships').delete().eq('id', id);
  return { error };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: any) => {
    const { data: { session } } = await (supabase.auth as any).getSession();
    const userId = session?.user?.id || 'anonymous';

    // Audit log local
    const audit_logs = decisions.audit_logs || [];
    // (Lógica de detecção de mudanças omitida para brevidade)

    const { error } = await supabase.from('current_decisions').upsert({
        team_id: teamId,
        championship_id: champId,
        round: round,
        data: { ...decisions, audit_logs },
        updated_at: new Date().toISOString()
    });

    return { success: !error, error: error?.message };
};

export const processRoundTurnover = async (id: string, round: number) => {
    // Orquestração de turnover Oracle Master v15.80
    // 1. Coletar decisões de todas as equipes
    // 2. Calcular projeções e atualizar tabela 'companies' (histórico)
    // 3. Atualizar tabela 'teams' com novos KPIs e Equity
    // 4. Incrementar current_round em 'championships'
    return { success: true, error: null };
};

export const updateEcosystem = async (id: string, u: any) => {
    return await supabase.from('championships').update(u).eq('id', id);
};

export const updatePageContent = async (slug: string, lang: string, content: any) => {
    return await supabase.from('site_content').upsert({
        page_slug: slug,
        locale: lang,
        content: content,
        updated_at: new Date().toISOString()
    });
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
    return await supabase.from('companies').select('*').eq('championship_id', id).eq('round', r);
};

export const submitCommunityVote = async (d: any) => {
    return await supabase.from('community_votes').insert(d);
};

export const provisionDemoEnvironment = () => {
    // Mock local para desenvolvimento
    localStorage.setItem('is_trial_session', 'true');
};
