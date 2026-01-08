import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit, GazetaMode, AccountNode, RegionType, AnalysisSource } from './types';

export const APP_VERSION = "v13.2.0-Oracle-Gold";
export const BUILD_DATE = "08/01/2026";
export const PROTOCOL_NODE = "Node 08-STREET-INDUSTRIAL-STABLE";
export const DEFAULT_INITIAL_SHARE_PRICE = 1.00;
export const DEFAULT_TOTAL_SHARES = 5000000; 

export const INITIAL_INDUSTRIAL_FINANCIALS = {
  balance_sheet: {
    assets: {
      current: {
        cash: 0,
        banks: 0,
        investments: 0,
        receivables: 1823735,
        pvdd: 0,
        inventory_finished: 0,
        inventory_mpa: 628545,
        inventory_mpb: 838060
      },
      non_current: {
        long_term_receivables: 0,
        fixed_assets: {
          machinery: 2360000,
          depr_machinery: -811500,
          land: 1200000,
          buildings: 5440000,
          depr_buildings: -2301900
        }
      }
    },
    liabilities: {
      current: {
        suppliers: 717605,
        income_tax_payable: 13045,
        ppr_payable: 0,
        dividends_payable: 18481,
        loans_st: 1872362
      },
      non_current: {
        loans_lt: 1500000
      }
    },
    equity: {
      capital_social: 5000000,
      accumulated_profit: 55447
    }
  }
};

export const INITIAL_FINANCIAL_TREE: { balance_sheet: AccountNode[], dre: AccountNode[] } = {
  balance_sheet: [
    {
      id: 'assets',
      label: '1. ATIVO TOTAL',
      value: 9176940,
      type: 'totalizer',
      isReadOnly: true,
      children: [
        {
          id: 'assets.current',
          label: '1.1 ATIVO CIRCULANTE',
          value: 3290340,
          type: 'totalizer',
          children: [
            { id: 'cash', label: 'Caixa', value: 0, type: 'asset', isEditable: true },
            { id: 'banks', label: 'Bancos', value: 0, type: 'asset', isEditable: true },
            { id: 'investments', label: 'Aplicação', value: 0, type: 'asset', isEditable: true },
            { id: 'receivables', label: 'Clientes', value: 1823735, type: 'asset', isEditable: true },
            { id: 'pvdd', label: '(-) Provisão devedores duvidosos', value: 0, type: 'asset', isEditable: true },
            {
              id: 'inventory',
              label: 'ESTOQUE',
              value: 1466605,
              type: 'totalizer',
              children: [
                { id: 'inv_finished', label: 'Estoque Prod. Acabado ALPHA', value: 0, type: 'asset', isEditable: true },
                { id: 'inv_mpa', label: 'Estoque MP A', value: 628545, type: 'asset', isEditable: true },
                { id: 'inv_mpb', label: 'Estoque MP B', value: 838060, type: 'asset', isEditable: true }
              ]
            }
          ]
        },
        {
          id: 'assets.noncurrent',
          label: '1.2 ATIVO NÃO CIRCULANTE',
          value: 5886600,
          type: 'totalizer',
          children: [
            {
              id: 'assets.longterm',
              label: 'REALIZÁVEL À LONGO PRAZO',
              value: 0,
              type: 'totalizer',
              children: [
                { id: 'fixed_sale', label: 'Venda de ativo imobilizado', value: 0, type: 'asset', isEditable: true }
              ]
            },
            {
              id: 'assets.fixed',
              label: 'IMOBILIZADO (CAPEX)',
              value: 5886600,
              type: 'totalizer',
              children: [
                { id: 'machines', label: 'Máquinas', value: 2360000, type: 'asset', isEditable: true },
                { id: 'depr_machines', label: '(-) Depreciação acumulada equipamentos', value: -811500, type: 'asset', isEditable: true },
                { id: 'land', label: 'Terrenos', value: 1200000, type: 'asset', isEditable: true },
                { id: 'buildings', label: 'Prédios e Instalações', value: 5440000, type: 'asset', isEditable: true },
                { id: 'depr_buildings', label: '(-) Depreciação acumulada prédios', value: -2301900, type: 'asset', isEditable: true }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'liabilities_equity',
      label: '2. PASSIVO + PL',
      value: 9176940,
      type: 'totalizer',
      isReadOnly: true,
      children: [
        {
          id: 'liab.current',
          label: '2.1 PASSIVO CIRCULANTE',
          value: 2621493,
          type: 'totalizer',
          children: [
            { id: 'suppliers', label: 'Fornecedores', value: 717605, type: 'liability', isEditable: true },
            { id: 'tax_payable', label: 'Imposto de Renda a pagar', value: 13045, type: 'liability', isEditable: true },
            { id: 'ppr_payable', label: 'Participações a pagar', value: 0, type: 'liability', isEditable: true },
            { id: 'dividends', label: 'Dividendos a pagar', value: 18481, type: 'liability', isEditable: true },
            { id: 'loans_st', label: 'Empréstimos de curto prazo', value: 1872362, type: 'liability', isEditable: true }
          ]
        },
        {
          id: 'liab.noncurrent',
          label: '2.2 PASSIVO NÃO CIRCULANTE',
          value: 1500000,
          type: 'totalizer',
          children: [
            { id: 'loans_lt', label: 'Empréstimos de longo prazo', value: 1500000, type: 'liability', isEditable: true }
          ]
        },
        {
          id: 'equity',
          label: '2.3 PATRIMÔNIO LÍQUIDO',
          value: 5055447,
          type: 'totalizer',
          children: [
            { id: 'capital', label: 'Capital Social', value: 5000000, type: 'equity', isEditable: true },
            { id: 'profit_acc', label: 'Lucros Acumulados no ano', value: 55447, type: 'equity', isEditable: true }
          ]
        }
      ]
    }
  ],
  dre: [
    {
      id: 'rev_gross',
      label: 'RECEITA DE VENDAS',
      value: 3322735,
      type: 'totalizer',
      children: [
        { id: 'sales_raw', label: 'Receita Bruta', value: 3322735, type: 'revenue', isEditable: true }
      ]
    },
    { id: 'cpv', label: '( - ) CUSTO PROD. VENDIDO - CPV', value: -2278180, type: 'expense', isEditable: true },
    { id: 'gross_profit', label: '( = ) LUCRO BRUTO', value: 1044555, type: 'totalizer', isReadOnly: true },
    {
      id: 'op_expenses_group',
      label: '( - ) DESPESAS OPERACIONAIS:',
      value: -917582,
      type: 'totalizer',
      children: [
        { id: 'exp_sales', label: 'DE VENDAS', value: -802702, type: 'expense', isEditable: true },
        { id: 'exp_admin', label: 'ADMINISTRATIVAS', value: -114880, type: 'expense', isEditable: true }
      ]
    },
    { id: 'op_profit', label: '(=) LUCRO OPERACIONAL', value: 126973, type: 'totalizer', isReadOnly: true },
    {
      id: 'fin_rev_group',
      label: '( + ) RECEITAS FINANCEIRAS',
      value: 0,
      type: 'totalizer',
      children: [
        { id: 'fin_yield', label: 'RENDIMENTOS DE APLICAÇÕES FINANCEIRAS', value: 0, type: 'revenue', isEditable: true }
      ]
    },
    {
      id: 'fin_exp_group',
      label: '( - ) DESPESAS FINANCEIRAS',
      value: -40000,
      type: 'totalizer',
      children: [
        { id: 'fin_net', label: 'FINANCEIRAS LÍQUIDAS', value: -40000, type: 'expense', isEditable: true }
      ]
    },
    { id: 'lair', label: '(=) LAIR - LUCRO LÍQUIDO ANTES DO IR', value: 86973, type: 'totalizer', isReadOnly: true },
    { id: 'ir_prev', label: '( - ) PROVISÃO PARA O IR', value: -13045, type: 'expense', isEditable: true },
    { id: 'net_after_tax', label: '(=) LUCRO LÍQUIDO APÓS O I. R.', value: 73928, type: 'totalizer', isReadOnly: true },
    { id: 'ppr', label: '( - ) PPR - PARTICIPAÇÃO NO LUCRO', value: 0, type: 'expense', isEditable: true },
    { id: 'final_profit', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 73928, type: 'totalizer', isReadOnly: true }
  ]
};

export const DEFAULT_MACRO: MacroIndicators = {
  growth_rate: 3.0,
  inflation_rate: 1.0,
  interest_rate_tr: 3.0,
  tax_rate_ir: 15.0,
  machinery_values: { alfa: 505000, beta: 1515000, gama: 3030000 },
  difficulty: { price_sensitivity: 2.0, marketing_effectiveness: 1.0 },
  providerPrices: { mpA: 62.8, mpB: 83.8 },
  distributionCostUnit: 12.5
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'tpl-industrial-gold',
    name: 'Empirion Street: Industrial Mastery',
    branch: 'industrial',
    sector: 'Manufacturing',
    description: 'Balanço Inicial de $ 9.176.940 conforme CPC 26. Gestão total de Imobilizado e Ciclos Empirion.',
    config: {
      total_rounds: 12,
      round_frequency_days: 7,
      regions_count: 9,
      bots_count: 2,
      region_type: 'mixed' as RegionType,
      analysis_source: 'parameterized' as AnalysisSource,
      sales_mode: 'internal' as SalesMode,
      scenario_type: 'simulated' as ScenarioType,
      transparency_level: 'high' as TransparencyLevel,
      gazeta_mode: 'anonymous' as GazetaMode,
      modality_type: 'standard' as ModalityType,
      deadline_value: 7,
      deadline_unit: 'days' as DeadlineUnit,
      teams_limit: 8
    },
    market_indicators: DEFAULT_MACRO,
    initial_financials: INITIAL_FINANCIAL_TREE
  }
];

export const ALPHA_TEST_USERS = [
  { id: 'tutor_master', name: 'Tutor Master', email: 'tutor@empirion.ia', role: 'tutor' as const },
  { id: 'alpha_street', name: 'Capitão Alpha', email: 'alpha@empirion.ia', role: 'player' as const, team: 'Unidade Alpha STREET' },
];

export const MENU_STRUCTURE = [
  { label: 'início', path: '/' },
  { label: 'ramos', path: '/solutions/simulators', sub: [
    { id: 'ind', label: 'Empirion Street', path: '/branches/industrial', icon: 'Factory', desc: 'Produção $9M Assets' },
    { id: 'com', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart', desc: 'Varejo Híbrido' },
    { id: 'ser', label: 'Serviços', path: '/branches/services', icon: 'Briefcase', desc: 'Capital Intelectual' },
    { id: 'agr', label: 'Agronegócio', path: '/branches/agribusiness', icon: 'Tractor', desc: 'Ativos Biológicos' },
    { id: 'fin', label: 'Financeiro', path: '/branches/finance', icon: 'DollarSign', desc: 'Spread & Risco' },
    { id: 'con', label: 'Construção', path: '/branches/construction', icon: 'Hammer', desc: 'Obras Pesadas' }
  ]},
  { label: 'soluções', path: '#', sub: [
    { id: 'sim', label: 'Simuladores', path: '/solutions/simulators', icon: 'Cpu', sub: [
        { id: 'sim-live', label: 'Arenas Live', path: '/solutions/simulators', icon: 'Zap' },
        { id: 'sim-custom', label: 'Customizados', path: '/solutions/simulators', icon: 'Settings' }
    ]},
    { id: 'otp', label: 'Torneios Abertos', path: '/solutions/open-tournaments', icon: 'Trophy', sub: [
        { id: 'otp-global', label: 'Ranking Global', path: '/rewards', icon: 'Globe' },
        { id: 'otp-local', label: 'Sessões Locais', path: '/solutions/open-tournaments', icon: 'MapPin' }
    ]},
    { id: 'ibp', label: 'Plano de Negócios', path: '/solutions/business-plan', icon: 'PenTool' }
  ]},
  { label: 'funcionalidades', path: '/features' },
  { label: 'conteúdos', path: '/blog' },
  { label: 'contato', path: '/contact' }
];

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
    hero: { 
      title: "Forje Seu Império", 
      empire: "Insight Estratégico IA", 
      subtitle: "A maior arena de simulações empresariais multiplayer assistida por Gemini IA.", 
      cta: "Entre na Arena", 
      secondaryCta: "Trial Master (Sandbox)" 
    },
    carousel: [
      { 
        id: 1, 
        title: "Empirion Street", 
        subtitle: "Gestão de Ciclo Operacional Empirion v13.0 Gold.", 
        image: "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?q=80&w=2000", 
        badge: "Industrial Node 08", 
        link: "/branches/industrial" 
      },
      { 
        id: 2, 
        title: "Hub Comercial", 
        subtitle: "Omnichannel e Varejo Híbrido de Alto Desempenho.", 
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000", 
        badge: "Retail Node 05", 
        link: "/branches/commercial" 
      },
      { 
        id: 3, 
        title: "Agro Intelligence", 
        subtitle: "Gestão de Ativos Biológicos e Risco Climático.", 
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000", 
        badge: "Agro Node 12", 
        link: "/branches/agribusiness" 
      }
    ],
    leaderboard: [
      { id: 'c1', name: "Industrial Mastery: Node 08", status: "Ciclo 4/12", teams: 15, lead: "Unidade Alpha" },
      { id: 'c2', name: "Varejo Híbrido: São Paulo", status: "Ciclo 1/10", teams: 8, lead: "Beta Retail" },
      { id: 'c3', name: "Agro Global: Ciclo Safra", status: "Finalizado", teams: 24, lead: "Farm Tech" }
    ],
    badges: [
      { id: 'b1', name: 'Elite Strategist', icon: 'Award', color: 'text-amber-500' },
      { id: 'b2', name: 'Master Financer', icon: 'TrendingUp', color: 'text-emerald-500' },
      { id: 'b3', name: 'Industrial Titan', icon: 'Factory', color: 'text-blue-500' }
    ]
  },
  'solutions-bp': {
    title: "Plano de Negócios Progressivo",
    subtitle: "Orquestração Estratégica via IA",
    steps: [
      { id: 0, label: "Executivo", body: "Resumo da visão estratégica do império." },
      { id: 1, label: "Mercado", body: "Análise competitiva e SWOT regional." },
      { id: 2, label: "Operações", body: "Configuração de CAPEX e infraestrutura." },
      { id: 3, label: "Marketing", body: "Estratégia de penetração e elasticidade." },
      { id: 4, label: "Finanças", body: "Projeção de fluxo de caixa e Rating." }
    ]
  }
};

export const getPageContent = (slug: string) => {
  return DEFAULT_PAGE_CONTENT[`branch-${slug}`] || DEFAULT_PAGE_CONTENT[`activity-${slug}`];
};