
import { createClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  Championship, 
  Team, 
  BusinessPlan, 
  EcosystemConfig, 
  Branch, 
  StrategicProfile,
  AccountNode,
  CurrencyType,
  MacroIndicators,
  TransparencyLevel,
  GazetaMode,
  InsolvencyStatus,
  RegionConfig,
  Modality
} from '../types';
import { generateBotDecision } from './gemini';
import { calculateProjections } from './simulation';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isTestMode = true;

export const provisionDemoEnvironment = async () => {
  console.info("Empirion Demo Node: Provisioning simulated cluster...");
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('supabase_user_id', uid)
    .maybeSingle();
  if (error) console.error("Profile Fetch Fault:", error);
  return data;
};

export const getUserEmpirePoints = async (userId: string): Promise<number> => {
  const { data } = await supabase
    .from('empire_points')
    .select('total_points')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.total_points || 0;
};

export const getChampionships = async (isPublicOnly: boolean = false) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  
  let query = supabase.from(table).select(`*, teams:${teamsTable}(*)`);
  if (isPublicOnly) {
    query = query.eq('is_public', true).eq('status', 'active');
  }
  return await query;
};

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  return await supabase.from(table).delete().eq('id', id);
};

export const getActiveBusinessPlan = async (teamId: string, round: number) => {
  return await supabase
    .from('business_plans')
    .select('*')
    .eq('team_id', teamId)
    .eq('round', round)
    .maybeSingle();
};

export const saveBusinessPlan = async (payload: Partial<BusinessPlan>) => {
  if (payload.id) {
    return await supabase.from('business_plans').update(payload).eq('id', payload.id);
  }
  return await supabase.from('business_plans').insert(payload);
};

export const getTeamSimulationHistory = async (teamId: string) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const historyTable = isTrial ? 'trial_companies' : 'companies';
  const { data } = await supabase
    .from(historyTable)
    .select('*')
    .eq('team_id', teamId)
    .order('round', { ascending: true });
  return data || [];
};

export const saveDecisions = async (teamId: string, champId: string, round: number, data: any) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_decisions' : 'current_decisions';
  
  const { data: existing } = await supabase.from(table).select('id').eq('team_id', teamId).eq('round', round).maybeSingle();
  if (existing) {
    const { error } = await supabase.from(table).update({ data, championship_id: champId }).eq('id', existing.id);
    return { success: !error, error: error?.message };
  } else {
    const { error } = await supabase.from(table).insert({ team_id: teamId, championship_id: champId, round, data });
    return { success: !error, error: error?.message };
  }
};

export const createChampionshipWithTeams = async (config: any, teams: any[], isTrial: boolean) => {
  const champTable = isTrial ? 'trial_championships' : 'championships';
  const teamsTable = isTrial ? 'trial_teams' : 'teams';
  
  const { data: champ, error: champError } = await supabase.from(champTable).insert(config).select().single();
  if (champError) throw champError;
  
  const teamsWithChamp = teams.map(t => ({ ...t, championship_id: champ.id, kpis: {} }));
  const { error: teamsError } = await supabase.from(teamsTable).insert(teamsWithChamp);
  if (teamsError) throw teamsError;
  
  return champ;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('user_profiles').select('*');
  return data || [];
};

export const updateEcosystem = async (id: string, data: any) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_championships' : 'championships';
  return await supabase.from(table).update(data).eq('id', id);
};

export const updatePageContent = async (slug: string, lang: string, content: any) => {
  const { data: existing } = await supabase.from('site_content').select('id').eq('page_slug', slug).eq('locale', lang).maybeSingle();
  if (existing) {
    return await supabase.from('site_content').update({ content }).eq('id', existing.id);
  }
  return await supabase.from('site_content').insert({ page_slug: slug, locale: lang, content });
};

export const fetchPageContent = async (slug: string, lang: string) => {
  const { data } = await supabase.from('site_content').select('content').eq('page_slug', slug).eq('locale', lang).maybeSingle();
  return data?.content;
};

export const getPublicReports = async (champId: string, round: number) => {
  const isTrial = localStorage.getItem('is_trial_session') === 'true';
  const table = isTrial ? 'trial_companies' : 'companies';
  return await supabase.from(table).select('*').eq('championship_id', champId).eq('round', round);
};

export const submitCommunityVote = async (voteData: any) => {
  return await supabase.from('community_votes').insert(voteData);
};

export const getModalities = async (): Promise<Modality[]> => {
  const { data } = await supabase.from('modalities').select('*');
  return data || [];
};

export const subscribeToModalities = (callback: () => void) => {
  return supabase.channel('modalities-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'modalities' }, callback).subscribe();
};

export const getGlobalLeaderboard = async () => {
  return [];
};

export const getAvailableBadges = async () => {
  const { data } = await supabase.from('badges').select('*');
  return data || [];
};

export const getUserBadges = async (userId: string) => {
  const { data } = await supabase.from('user_badges').select('*').eq('user_id', userId);
  return data || [];
};

export const fetchBlogPosts = async (query?: string) => {
  let q = supabase.from('blog_posts').select('*');
  if (query) {
    q = q.ilike('question', `%${query}%`);
  }
  return await q;
};

export const getTeamAuditLog = async (teamId: string, round: number) => {
  const { data } = await supabase.from('audit_logs').select('*').eq('team_id', teamId).eq('round', round);
  return data || [];
};

export const processRoundTurnover = async (id: string, round: number) => {
    try {
        const isTrial = localStorage.getItem('is_trial_session') === 'true';
        const champTable = isTrial ? 'trial_championships' : 'championships';
        const teamsTable = isTrial ? 'trial_teams' : 'teams';
        const decisionsTable = isTrial ? 'trial_decisions' : 'current_decisions';
        const historyTable = isTrial ? 'trial_companies' : 'companies';

        const { data: champ } = await supabase.from(champTable).select('*').eq('id', id).single();
        const { data: teams } = await supabase.from(teamsTable).select('*').eq('championship_id', id);
        if (!champ) throw new Error("Arena não encontrada.");

        for (const team of (teams || [])) {
            const { data: dec } = await supabase.from(decisionsTable).select('*').eq('team_id', team.id).eq('round', round + 1).maybeSingle();
            let finalDecision = dec?.data;
            
            if (team.is_bot && !finalDecision) {
              finalDecision = await generateBotDecision(champ.branch, round + 1, champ.regions_count, champ.market_indicators, team.name, team.strategic_profile);
            }

            if (finalDecision) {
                const res = calculateProjections(finalDecision, champ.branch, champ.config as EcosystemConfig, champ.market_indicators, team);
                
                await supabase.from(historyTable).insert({
                    team_id: team.id, 
                    championship_id: id, 
                    round: round + 1, 
                    state: finalDecision, 
                    kpis: res.kpis, 
                    equity: res.kpis.equity,
                    revenue: res.revenue,
                    net_profit: res.netProfit,
                    total_assets: res.kpis.total_assets,
                    stock_value: res.kpis.stock_value,
                    fixed_assets_value: res.kpis.fixed_assets_value,
                    fixed_assets_depreciation: res.kpis.fixed_assets_depreciation 
                });

                await supabase.from(teamsTable).update({ 
                    equity: res.kpis.equity, 
                    kpis: res.kpis 
                }).eq('id', team.id);
            }
        }
        await supabase.from(champTable).update({ current_round: round + 1, round_started_at: new Date().toISOString() }).eq('id', id);
        return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
};
