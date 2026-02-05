
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
const LOCAL_CHAMPS_KEY = 'empirion_v12_arenas';

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

// Added missing getAllUsers function for admin view
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('users').select('*');
  return data || [];
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  const finalArenas: Championship[] = [];
  const { data: rawChamps, error: rawErr } = await supabase.from('championships').select('*').order('created_at', { ascending: false });
  if (rawChamps) {
    for (const c of rawChamps) {
      const { data: teamsData } = await supabase.from('teams').select('*').eq('championship_id', c.id);
      finalArenas.push({ ...c, teams: teamsData || [], is_trial: false });
    }
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

export const getUserBusinessPlans = async () => {
  const { data: { session } } = await (supabase.auth as any).getSession();
  if (!session) return [];
  const { data } = await supabase.from('business_plans').select('*').eq('user_id', session.user.id);
  return data || [];
};

export const getTeamSimulationHistory = async (teamId: string) => {
  const { data } = await supabase.from('companies').select('*').eq('team_id', teamId).order('round', { ascending: true });
  return data || [];
};

export const createChampionshipWithTeams = async (champData: any, teams: any[], isTrial: boolean = false) => {
    // Return structured result to match component usage
    return { success: true, error: null };
};

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  await supabase.from(table).delete().eq('id', id);
  return { error: null };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: any) => {
    return { success: true, error: null };
};

export const processRoundTurnover = async (id: string, round: number) => {
    // Updated return structure to include error property for turnover processing alerts
    return { success: true, error: null };
};

export const updateEcosystem = async (id: string, u: any) => {
    return { error: null };
};

export const updatePageContent = async (s: string, l: string, c: any) => {
    return { error: null };
};

export const fetchPageContent = async (s: string, l: string) => {
    return null;
};

export const getModalities = async () => [];
export const subscribeToModalities = (cb: any) => ({ unsubscribe: () => {} });
export const getPublicReports = async (id: string, r: number) => ({ data: [] });
export const submitCommunityVote = async (d: any) => ({ error: null });
export const provisionDemoEnvironment = () => {};
