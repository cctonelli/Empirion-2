
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
import { INITIAL_FINANCIAL_TREE, INITIAL_MACHINES_P00, DEFAULT_INDUSTRIAL_CHRONOGRAM } from '../constants';

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

export const getChampionships = async (isPublicOnly: boolean = false, forceTable?: 'live' | 'trial') => {
  const isTrialSession = localStorage.getItem('is_trial_session') === 'true';
  
  const fetchFromTable = async (type: 'live' | 'trial') => {
    const table = type === 'trial' ? 'trial_championships' : 'championships';
    const teamsTable = type === 'trial' ? 'trial_teams' : 'teams';
    let query = supabase.from(table).select(`*, teams:${teamsTable}(*)`);
    if (isPublicOnly) {
      query = query.eq('is_public', true).eq('status', 'active');
    }
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(c => ({ ...c, is_trial: type === 'trial' }));
  };

  if (forceTable === 'live') return { data: await fetchFromTable('live'), error: null };
  if (forceTable === 'trial') return { data: await fetchFromTable('trial'), error: null };

  // Se não forçado, e estivermos em uma visualização de seleção (onde queremos ver tudo)
  // ou se o isTrialSession for o critério
  if (!isTrialSession) {
    // Tenta buscar de ambos para garantir que o Tutor veja tudo no Admin ou Seleção
    const [live, trial] = await Promise.all([fetchFromTable('live'), fetchFromTable('trial')]);
    return { data: [...live, ...trial], error: null };
  }

  return { data: await fetchFromTable('trial'), error: null };
};

export const deleteChampionship = async (id: string, isTrial: boolean) => {
  const table = isTrial ? 'trial_championships' : 'championships';
  return await supabase.from(table).delete().eq('id', id);
};

export const getActiveBusinessPlan = async (teamId: string, round: number, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
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

export const getTeamSimulationHistory = async (teamId: string, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  const historyTable = isTrialSession ? 'trial_companies' : 'companies';
  const { data } = await supabase
    .from(historyTable)
    .select('*')
    .eq('team_id', teamId)
    .order('round', { ascending: true });
  return data || [];
};

export const saveDecisions = async (teamId: string, champId: string, round: number, data: any, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  const table = isTrialSession ? 'trial_decisions' : 'current_decisions';
  
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
  const historyTable = isTrial ? 'trial_companies' : 'companies';
  
  const { data: champ, error: champError } = await supabase.from(champTable).insert(config).select().single();
  if (champError) throw champError;
  
  // Initial KPIs for Round 0 (Individualized)
  const initialKpis = {
    statements: config.initial_financials || INITIAL_FINANCIAL_TREE,
    machines: INITIAL_MACHINES_P00,
    current_cash: 0,
    stock_quantities: { mp_a: 30150, mp_b: 20100, finished_goods: 0 },
    equity: 7252171.74,
    total_assets: 9493163.54,
    stock_value: 1407000.00,
    fixed_assets_value: 6012500.00,
    rating: 'AAA',
    last_price: 425,
    last_units_sold: 0,
    ebitda: 208387.77, // Operating Profit + Depreciation approx
    tsr: 0,
    ccc: 0,
    interest_coverage: 100
  };

  const teamsWithChamp = teams.map(t => ({ ...t, championship_id: champ.id, kpis: initialKpis }));
  const { data: createdTeams, error: teamsError } = await supabase.from(teamsTable).insert(teamsWithChamp).select();
  if (teamsError) throw teamsError;
  
  // Insert Round 0 into history for each team (Individualized)
  const historyEntries = (createdTeams || []).map(t => ({
    team_id: t.id,
    championship_id: champ.id,
    round: 0,
    state: {}, 
    kpis: initialKpis,
    equity: initialKpis.equity,
    revenue: 0,
    net_profit: 0,
    total_assets: 9493163.54,
    stock_value: 1407000.00,
    fixed_assets_value: 6012500.00,
    fixed_assets_depreciation: 0,
    ccc: 0,
    interest_coverage: 100,
    brl_rate: 1,
    gbp_rate: 0
  }));
  
  await supabase.from(historyTable).insert(historyEntries);
  
  return champ;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('user_profiles').select('*');
  return data || [];
};

export const updateEcosystem = async (id: string, data: any, isTrial?: boolean) => {
  const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
  const table = isTrialSession ? 'trial_championships' : 'championships';
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

export const processRoundTurnover = async (id: string, round: number, isTrial?: boolean) => {
    try {
        const isTrialSession = isTrial !== undefined ? isTrial : (localStorage.getItem('is_trial_session') === 'true');
        const champTable = isTrialSession ? 'trial_championships' : 'championships';
        const teamsTable = isTrialSession ? 'trial_teams' : 'teams';
        const decisionsTable = isTrialSession ? 'trial_decisions' : 'current_decisions';
        const historyTable = isTrialSession ? 'trial_companies' : 'companies';

        const { data: champ } = await supabase.from(champTable).select('*').eq('id', id).single();
        const { data: teams } = await supabase.from(teamsTable).select('*').eq('championship_id', id);
        if (!champ) throw new Error("Arena não encontrada.");

        const nextRound = round + 1;
        // Get indicators for the round being processed (Round 1, 2, etc.)
        const currentRules = champ.round_rules?.[nextRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[nextRound] || champ.market_indicators;
        const indicatorsForRound = { ...champ.market_indicators, ...currentRules };

        for (const team of (teams || [])) {
            const { data: dec } = await supabase.from(decisionsTable).select('*').eq('team_id', team.id).eq('round', nextRound).maybeSingle();
            let finalDecision = dec?.data;
            
            if (team.is_bot && !finalDecision) {
              finalDecision = await generateBotDecision(champ.branch, nextRound, champ.regions_count, indicatorsForRound, team.name, team.strategic_profile);
              // Persist bot decision for audit and visibility
              await supabase.from(decisionsTable).insert({
                team_id: team.id,
                championship_id: id,
                round: nextRound,
                data: finalDecision
              });
            }

            if (finalDecision) {
                const res = calculateProjections(finalDecision, champ.branch, champ.config as EcosystemConfig, indicatorsForRound, team);
                
                await supabase.from(historyTable).insert({
                    team_id: team.id, 
                    championship_id: id, 
                    round: nextRound, 
                    state: finalDecision, 
                    kpis: res.kpis, 
                    equity: res.kpis.equity,
                    revenue: res.revenue,
                    net_profit: res.netProfit,
                    total_assets: res.kpis.total_assets,
                    stock_value: res.kpis.stock_value,
                    fixed_assets_value: res.kpis.fixed_assets_value,
                    fixed_assets_depreciation: res.kpis.fixed_assets_depreciation,
                    ccc: res.kpis.ccc,
                    interest_coverage: res.kpis.interest_coverage,
                    export_tariff_brazil: res.kpis.export_tariff_brazil,
                    export_tariff_uk: res.kpis.export_tariff_uk,
                    brl_rate: res.kpis.brl_rate,
                    gbp_rate: res.kpis.gbp_rate
                });

                await supabase.from(teamsTable).update({ 
                    equity: res.kpis.equity, 
                    kpis: res.kpis 
                }).eq('id', team.id);
            }
        }

        // Prepare indicators for the NEXT round (round + 2)
        const nextNextRound = nextRound + 1;
        const nextRules = champ.round_rules?.[nextNextRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[nextNextRound] || indicatorsForRound;
        const nextIndicators = { ...indicatorsForRound, ...nextRules };

        await supabase.from(champTable).update({ 
            current_round: nextRound, 
            market_indicators: nextIndicators,
            round_started_at: new Date().toISOString() 
        }).eq('id', id);
        
        return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
};
