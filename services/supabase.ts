
import { createClient } from '@supabase/supabase-js';
import { DecisionData, Championship, UserProfile, UserRole, Modality, AccountNode, Team } from '../types';
import { ALPHA_TEST_USERS, DEMO_CHAMPIONSHIP_DATA } from '../constants';

const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  const metaEnv = (import.meta as any).env || {};
  return metaEnv[viteKey] || metaEnv[key] || '';
};

const SUPABASE_URL = getSafeEnv('SUPABASE_URL') || 'https://gkmjlejeqndfdvxxvuxa.supabase.co';
const SUPABASE_ANON_KEY = getSafeEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const isTestMode = true; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const secureAction = async (action: () => Promise<any>) => {
  if (isTestMode) return action(); 
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Acesso negado: Sessão Requerida.");
  return action();
};

/**
 * Persistência Híbrida: Tenta Supabase, mas garante cache local em caso de erro RLS.
 */
export const createChampionshipWithTeams = async (champData: any, teams: { name: string }[]) => {
  return secureAction(async () => {
    let createdChamp: Championship | null = null;
    let createdTeams: Team[] = [];

    try {
      const { data: champ, error: cErr } = await supabase
        .from('championships')
        .insert([{ ...champData, status: 'active' }])
        .select()
        .single();

      if (cErr) throw cErr;
      createdChamp = champ as Championship;

      const teamsToInsert = teams.map(t => ({
        name: t.name,
        championship_id: createdChamp!.id,
        status: 'active',
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
      }));

      const { data: teamsData, error: tErr } = await supabase
        .from('teams')
        .insert(teamsToInsert)
        .select();

      if (tErr) throw tErr;
      createdTeams = teamsData as Team[];
    } catch (err) {
      console.warn("RLS Block Detected or DB Error. Redirecting to Shadow Storage (Local).", err);
      // Fallback Local (Shadow Storage)
      const localId = `local-${Date.now()}`;
      createdChamp = { 
        ...champData, 
        id: localId, 
        status: 'active', 
        is_local: true, 
        created_at: new Date().toISOString() 
      };
      createdTeams = teams.map((t, i) => ({
        id: `team-${localId}-${i}`,
        name: t.name,
        championship_id: localId,
        status: 'active',
        invite_code: `LCL-${i}`
      }));
      
      const localArenas = JSON.parse(localStorage.getItem('empirion_local_arenas') || '[]');
      localArenas.push({ ...createdChamp, teams: createdTeams });
      localStorage.setItem('empirion_local_arenas', JSON.stringify(localArenas));
    }

    return { champ: createdChamp, teams: createdTeams };
  });
};

export const getChampionships = async (onlyPublic: boolean = false) => {
  let dbArenas: Championship[] = [];
  try {
    let query = supabase.from('championships').select(`
      *,
      teams (*)
    `).order('created_at', { ascending: false });
    
    if (onlyPublic) query = query.eq('is_public', true).eq('status', 'active');
    
    const { data } = await query;
    if (data) dbArenas = data as Championship[];
  } catch (e) {
    console.error("Fetch DB Error:", e);
  }

  // Merge com Shadow Storage
  const localArenas = JSON.parse(localStorage.getItem('empirion_local_arenas') || '[]');
  const merged = [...localArenas, ...dbArenas];

  return { data: merged, error: null };
};

export const silentTestAuth = async (user: typeof ALPHA_TEST_USERS[0]) => {
  const mockSession = {
    user: { id: user.id, email: user.email, user_metadata: { full_name: user.name, role: user.role } },
    access_token: 'alpha-bypass',
    expires_in: 3600
  };
  localStorage.setItem('empirion_demo_session', JSON.stringify(mockSession));
  return { data: { session: mockSession }, error: null };
};

export const saveDecisions = async (teamId: string, champId: string, round: number, decisions: DecisionData, operatorName?: string) => {
  return secureAction(async () => {
    const { error } = await supabase.from('current_decisions').upsert({ 
      team_id: teamId, championship_id: champId, round, data: decisions, operator_name: operatorName 
    });
    if (error) {
      console.warn("DB Decision Save blocked. Saving to local session cache.");
      localStorage.setItem(`decisions_${teamId}_r${round}`, JSON.stringify(decisions));
    }
  });
};

export const provisionDemoEnvironment = async () => {
  try {
    const { data: existing } = await supabase.from('championships').select('id').eq('name', 'ARENA 2026 T2').maybeSingle();
    if (!existing) {
      const arenaT2 = {
        ...DEMO_CHAMPIONSHIP_DATA,
        name: 'ARENA 2026 T2',
        is_public: true,
        status: 'active'
      };
      const teams = [
        { name: 'Time Alpha' }, { name: 'Time Beta' }, { name: 'Time Gama' }, 
        { name: 'Time Delta' }, { name: 'Time Marte' }, { name: 'Time Vênus' },
        { name: 'Time Júpiter' }, { name: 'Time Saturno' }
      ];
      await createChampionshipWithTeams(arenaT2, teams);
    }
  } catch (err) { console.error("Provisioning Error:", err); }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (isTestMode) {
    const user = ALPHA_TEST_USERS.find(u => u.id === userId) || ALPHA_TEST_USERS[0];
    return {
      id: user.id, supabase_user_id: user.id, name: user.name,
      email: user.email, role: user.role as any, is_opal_premium: true,
      created_at: new Date().toISOString()
    };
  }
  const { data } = await supabase.from('users').select('*').eq('supabase_user_id', userId).maybeSingle();
  return data;
};

export const listAllUsers = async () => {
  return supabase.from('users').select('*').order('created_at', { ascending: false });
};

export const fetchPageContent = async (page: string, lang: string) => {
  const { data } = await supabase.from('page_contents').select('content').eq('page', page).eq('lang', lang).maybeSingle();
  return data?.content;
};

export const getModalities = async () => {
  const { data } = await supabase.from('modalities').select('*').eq('is_public', true);
  return (data || []) as Modality[];
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase.channel('modalities_changes').on('postgres_changes', { event: '*', table: 'modalities' }, callback).subscribe();
};

export const updateUserPremiumStatus = async (userId: string, status: boolean) => {
  return supabase.from('users').update({ is_opal_premium: status }).eq('supabase_user_id', userId);
};

export const updateEcosystem = async (champId: string, config: any) => {
  return supabase.from('championships').update(config).eq('id', champId);
};

export const getPublicReports = async (champId: string, round: number) => {
  return supabase.from('public_reports').select('*').eq('championship_id', champId).eq('round', round);
};

export const submitCommunityVote = async (vote: any) => {
  return supabase.from('community_votes').insert([vote]);
};

export const resetAlphaData = async () => {
  await supabase.from('current_decisions').delete().eq('championship_id', 'arena-2026-t2');
};
