
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
import { generateBotDecision, calculateESDS } from './gemini';
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
  
  const financials = config.initial_financials || INITIAL_FINANCIAL_TREE;
  const balanceSheet = financials.balance_sheet;

  const findAccount = (nodes: AccountNode[], id: string): AccountNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findAccount(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const totalAssets = findAccount(balanceSheet, 'assets')?.value || 9493163.54;
  const equity = findAccount(balanceSheet, 'equity')?.value || 7252171.74;
  const stockValue = findAccount(balanceSheet, 'assets.current.stock')?.value || 1407000.00;
  const fixedAssetsValue = findAccount(balanceSheet, 'assets.noncurrent.fixed')?.value || 6012500.00;
  const currentCash = findAccount(balanceSheet, 'assets.current.cash')?.value || 0;
  
  const buildingsDeprec = findAccount(balanceSheet, 'assets.noncurrent.fixed.buildings_deprec')?.value || 0;
  const machinesDeprec = findAccount(balanceSheet, 'assets.noncurrent.fixed.machines_deprec')?.value || 0;
  const totalDepreciation = Math.abs(buildingsDeprec) + Math.abs(machinesDeprec);

  // Initial KPIs for Round 0 (Individualized)
  const initialKpis = {
    statements: financials,
    machines: INITIAL_MACHINES_P00,
    current_cash: currentCash,
    stock_quantities: { mp_a: 30150, mp_b: 20100, finished_goods: 0 },
    equity: equity,
    total_assets: totalAssets,
    stock_value: stockValue,
    fixed_assets_value: fixedAssetsValue,
    fixed_assets_depreciation: totalDepreciation,
    rating: 'AAA',
    last_price: config.initial_share_price || 425,
    last_units_sold: 0,
    ebitda: 208387.77, 
    tsr: 0,
    ccc: 0,
    interest_coverage: 100,
    nlcdg: 0,
    solvency_score_kanitz: 1.5,
    altman_z_score: 6.25,
    dcf_valuation: 1.7,
    scissors_effect: 0,
    liquidity_current: 1.5,
    solvency_index: 2.0,
    inventory_turnover: 0,
    carbon_footprint: 0,
    // E-SDS v1.1 Inputs for P0
    fco_livre: 208387.77 - 50000 - 2500 - 14871, // EBITDA - Manutencao - Juros - IR (estimado P0)
    capex_manutencao: 50000,
    capex_estrategico: 0,
    juros_pagos: 2500,
    impostos_pagos: 14871,
    passivo_circulante: 2240991.80,
    despesas_operacionais_projetadas_proxima_rodada: 1149623.86,
    receita_liquida: 4184440.05,
    custo_medio_divida: 2500 / 2240991.80,
    alavancagem_efetiva: 2240991.80 / 208387.77,
    divida_liquida: 2240991.80 - currentCash,
    receita_recorrente_projetada: 0,
    caixa: currentCash,
    aplicacoes: 0,
    despesas_operacionais_diarias: 1149623.86 / 30,
    passivo_total: 2240991.80,
    pl: equity,
    percentual_divida_curto_prazo: 100
  };

  // Calculate initial E-SDS for P0
  const p0Esds = await calculateESDS(0, config.branch || 'industrial', initialKpis, []);
  if (p0Esds) {
    (initialKpis as any).esds = p0Esds;
  }

  const teamsWithChamp = teams.map(t => ({ ...t, championship_id: champ.id, kpis: initialKpis, equity: initialKpis.equity }));
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
    total_assets: initialKpis.total_assets,
    stock_value: initialKpis.stock_value,
    fixed_assets_value: initialKpis.fixed_assets_value,
    fixed_assets_depreciation: initialKpis.fixed_assets_depreciation,
    ccc: 0,
    interest_coverage: 100,
    brl_rate: 1,
    gbp_rate: 0,
    compulsory_loan_balance: 0,
    compulsory_loan_interest_paid: 0,
    tsr: 0,
    nlcdg: 0,
    solvency_score_kanitz: 1.5,
    altman_z_score: 6.25,
    dcf_valuation: 1.7,
    scissors_effect: 0,
    liquidity_current: 1.5,
    solvency_index: 2.0,
    inventory_turnover: 0,
    carbon_footprint: 0,
    esds_score: p0Esds?.display || 0,
    esds_zone: p0Esds?.zone || 'Verde',
    esds_gargalo: p0Esds?.gargalo_principal,
    esds_insights: p0Esds?.gemini_insights
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

export const getSystemSecret = async (name: string): Promise<string | null> => {
  const { data } = await supabase
    .from('system_secrets')
    .select('key_value')
    .eq('key_name', name)
    .maybeSingle();
  return data?.key_value || null;
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

        const teamResults: any[] = [];
        const marketDecisions: Record<string, any> = {};

        // 1. Coletar todas as decisões e gerar para bots
        for (const team of (teams || [])) {
            const { data: dec } = await supabase.from(decisionsTable).select('*').eq('team_id', team.id).eq('round', nextRound).maybeSingle();
            let finalDecision = dec?.data;
            
            if (team.is_bot && !finalDecision) {
              // Buscar KPIs atuais do BOT para decisão contextualizada
              const { data: lastHistory } = await supabase
                .from(historyTable)
                .select('kpis')
                .eq('team_id', team.id)
                .order('round', { ascending: false })
                .limit(1)
                .maybeSingle();

              finalDecision = await generateBotDecision(
                champ.branch, 
                nextRound, 
                champ.regions_count, 
                indicatorsForRound, 
                team.name, 
                team.strategic_profile,
                lastHistory?.kpis
              );
              await supabase.from(decisionsTable).insert({
                team_id: team.id,
                championship_id: id,
                round: nextRound,
                data: finalDecision
              });
            }
            marketDecisions[team.id] = finalDecision;
        }

        // 2. Calcular Médias de Mercado (Preço e Marketing) para Market Share Competitivo
        const validDecisions = Object.values(marketDecisions).filter(d => !!d);
        const avgPrice = validDecisions.length > 0 
          ? validDecisions.reduce((acc, d) => acc + (Object.values(d.regions || {})[0] as any)?.price || 0, 0) / validDecisions.length 
          : indicatorsForRound.avg_selling_price;
        
        const totalMarketing = validDecisions.reduce((acc, d) => acc + (Object.values(d.regions || {})[0] as any)?.marketing || 0, 0);
        const avgMarketing = validDecisions.length > 0 ? totalMarketing / validDecisions.length : 0;

        // 3. Processar cada equipe com o contexto competitivo
        for (const team of (teams || [])) {
            const finalDecision = marketDecisions[team.id];

            if (finalDecision) {
                // Ajustar indicadores com a média real do mercado para este round
                const competitiveIndicators = { ...indicatorsForRound, avg_selling_price: avgPrice };
                const res = calculateProjections(finalDecision, champ.branch, champ.config as EcosystemConfig, competitiveIndicators, team);
                
                // 3.1 Calcular E-SDS v1.1 via Gemini
                const { data: previousRounds } = await supabase
                  .from(historyTable)
                  .select('*')
                  .eq('team_id', team.id)
                  .order('round', { ascending: false })
                  .limit(3);

                const esdsResult = await calculateESDS(nextRound, champ.branch, res.kpis, previousRounds || []);
                if (esdsResult) {
                  res.kpis.esds = esdsResult;
                }

                // Cálculo de Market Share Competitivo (Relativo aos outros)
                const teamPrice = (Object.values(finalDecision.regions || {})[0] as any)?.price || avgPrice;
                const teamMarketing = (Object.values(finalDecision.regions || {})[0] as any)?.marketing || 0;
                
                const priceWeight = teamPrice > 0 ? (avgPrice / teamPrice) : 1;
                const marketingWeight = 1 + (teamMarketing > 0 ? Math.log10(teamMarketing + 1) / 10 : 0);
                const rawScore = priceWeight * marketingWeight;
                
                teamResults.push({ team, res, rawScore });
            }
        }

        // 4. Normalizar Market Share para somar 100%
        const totalScore = teamResults.reduce((acc, r) => acc + r.rawScore, 0);
        for (const item of teamResults) {
            const competitiveShare = totalScore > 0 ? (item.rawScore / totalScore) * 100 : (100 / teams!.length);
            item.res.kpis.market_share = competitiveShare;
            item.res.marketShare = competitiveShare;

            await supabase.from(historyTable).insert({
                team_id: item.team.id, 
                championship_id: id, 
                round: nextRound, 
                state: marketDecisions[item.team.id], 
                kpis: item.res.kpis, 
                equity: item.res.kpis.equity,
                revenue: item.res.revenue,
                net_profit: item.res.netProfit,
                total_assets: item.res.kpis.total_assets,
                stock_value: item.res.kpis.stock_value,
                fixed_assets_value: item.res.kpis.fixed_assets_value,
                fixed_assets_depreciation: item.res.kpis.fixed_assets_depreciation,
                ccc: item.res.kpis.ccc,
                interest_coverage: item.res.kpis.interest_coverage,
                export_tariff_brazil: item.res.kpis.export_tariff_brazil,
                export_tariff_uk: item.res.kpis.export_tariff_uk,
                brl_rate: item.res.kpis.brl_rate,
                gbp_rate: item.res.kpis.gbp_rate,
                compulsory_loan_balance: item.res.kpis.compulsory_loan_balance || 0,
                compulsory_loan_interest_paid: item.res.kpis.compulsory_loan_interest_paid || 0,
                tsr: item.res.kpis.tsr || 0,
                nlcdg: item.res.kpis.nlcdg || 0,
                solvency_score_kanitz: item.res.kpis.solvency_score_kanitz || 0,
                altman_z_score: item.res.kpis.altman_z_score || 0,
                dcf_valuation: item.res.kpis.dcf_valuation || 0,
                scissors_effect: item.res.kpis.scissors_effect || 0,
                liquidity_current: item.res.kpis.liquidity_current || 0,
                solvency_index: item.res.kpis.solvency_index || 0,
                inventory_turnover: item.res.kpis.inventory_turnover || 0,
                carbon_footprint: item.res.kpis.carbon_footprint || 0,
                fco_livre: item.res.kpis.fco_livre || 0,
                capex_manutencao: item.res.kpis.capex_manutencao || 0,
                capex_estrategico: item.res.kpis.capex_estrategico || 0,
                esds_score: item.res.kpis.esds?.display || 0,
                esds_zone: item.res.kpis.esds?.zone || 'ALERTA',
                esds_gargalo: item.res.kpis.esds?.gargalo_principal,
                esds_insights: item.res.kpis.esds?.gemini_insights,
                market_share: competitiveShare
            });

            await supabase.from(teamsTable).update({ 
                equity: item.res.kpis.equity, 
                kpis: item.res.kpis 
            }).eq('id', item.team.id);
        }

        // 5. Preparar indicadores para o PRÓXIMO round (round + 2)
        const nextNextRound = nextRound + 1;
        const nextRules = champ.round_rules?.[nextNextRound] || DEFAULT_INDUSTRIAL_CHRONOGRAM[nextNextRound] || indicatorsForRound;
        // Atualiza o preço médio de mercado para o próximo round baseado na realidade deste round
        const nextIndicators = { ...indicatorsForRound, ...nextRules, avg_selling_price: avgPrice };

        await supabase.from(champTable).update({ 
            current_round: nextRound, 
            market_indicators: nextIndicators,
            round_started_at: new Date().toISOString() 
        }).eq('id', id);
        
        return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
};
