import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit, GazetaMode, AccountNode } from './types';

export const APP_VERSION = "v12.8.5-Gold";
export const BUILD_DATE = "06/01/2026";
export const PROTOCOL_NODE = "Node 08-STREET-INDUSTRIAL-STABLE";

/**
 * ESTRUTURA LEGADA PARA MOTOR DE SIMULAÇÃO (GOLD V12.8)
 * Necessário para o calculateProjections em simulation.ts
 */
export const INITIAL_INDUSTRIAL_FINANCIALS = {
  balance_sheet: {
    assets: {
      current: {
        cash: 840200,
        receivables: 1823735,
        inventory_mpa: 628545,
        inventory_mpb: 838060
      },
      fixed: {
        machinery_gross: 5000000,
        land: 1500000,
        accumulated_depreciation: -613540
      }
    },
    liabilities: {
      current: {
        suppliers: 717605,
        taxes_payable: 13045,
        loans_short_term: 1872362
      },
      long_term: {
        loans_long_term: 1500000
      }
    },
    equity: {
      capital_social: 5000000,
      accumulated_profit: 73928,
      total: 5073928
    }
  }
};

/**
 * ESTRUTURA DE ÁRVORE PARA EDITOR FINANCEIRO (GOLD V12.8)
 * Resolve TypeError .find convertendo o objeto legado em nós indexáveis.
 */
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
          label: '1.1 Ativo Circulante',
          value: 3290480,
          type: 'totalizer',
          children: [
            { id: 'cash', label: 'Caixa e Equivalentes', value: 840200, type: 'asset', isEditable: true },
            { id: 'receivables', label: 'Contas a Receber (P1)', value: 1823735, type: 'asset', isEditable: true },
            { id: 'inv_mpa', label: 'Estoque Matéria-Prima A', value: 628545, type: 'asset', isEditable: true },
            { id: 'inv_mpb', label: 'Estoque Matéria-Prima B', value: 838060, type: 'asset', isEditable: true }
          ]
        },
        {
          id: 'assets.fixed',
          label: '1.2 Ativo Não Circulante (CapEx)',
          value: 5886460,
          type: 'totalizer',
          children: [
            { id: 'land', label: 'Terrenos e Galpões', value: 1500000, type: 'asset', isEditable: true },
            { id: 'machinery', label: 'Maquinário Industrial', value: 5000000, type: 'asset', isEditable: true },
            { id: 'deprec', label: '(-) Depreciação Acumulada', value: -613540, type: 'asset', isEditable: true }
          ]
        }
      ]
    },
    {
      id: 'liabilities',
      label: '2. PASSIVO + PL',
      value: 9176940,
      type: 'totalizer',
      isReadOnly: true,
      children: [
        {
          id: 'liab.current',
          label: '2.1 Passivo Circulante',
          value: 2603012,
          type: 'totalizer',
          children: [
            { id: 'suppliers', label: 'Fornecedores (MP)', value: 717605, type: 'liability', isEditable: true },
            { id: 'taxes', label: 'Impostos a Recolher', value: 13045, type: 'liability', isEditable: true },
            { id: 'loans_st', label: 'Empréstimos Curto Prazo', value: 1872362, type: 'liability', isEditable: true }
          ]
        },
        {
          id: 'liab.long',
          label: '2.2 Passivo Não Circulante',
          value: 1500000,
          type: 'totalizer',
          children: [
            { id: 'loans_lt', label: 'Financiamentos Longo Prazo', value: 1500000, type: 'liability', isEditable: true }
          ]
        },
        {
          id: 'equity',
          label: '2.3 Patrimônio Líquido',
          value: 5073928,
          type: 'totalizer',
          children: [
            { id: 'capital', label: 'Capital Social Integralizado', value: 5000000, type: 'equity', isEditable: true },
            { id: 'profit', label: 'Lucros Acumulados', value: 73928, type: 'equity', isEditable: true }
          ]
        }
      ]
    }
  ],
  dre: [
    {
      id: 'rev',
      label: 'RECEITA OPERACIONAL BRUTA',
      value: 3322735,
      type: 'totalizer',
      isReadOnly: true,
      children: [
        { id: 'sales', label: 'Venda de Produtos Acabados', value: 3322735, type: 'revenue', isEditable: true }
      ]
    },
    {
      id: 'exp',
      label: 'CUSTOS E DESPESAS',
      value: -3248807,
      type: 'totalizer',
      isReadOnly: true,
      children: [
        { id: 'cpv', label: '(-) Custo Prod. Vendidos (CPV)', value: -2278180, type: 'expense', isEditable: true },
        { id: 'opex', label: '(-) Despesas Administrativas', value: -957582, type: 'expense', isEditable: true },
        { id: 'depr_round', label: '(-) Depreciação do Período', value: -13045, type: 'expense', isEditable: true }
      ]
    }
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
    description: 'Balanço Inicial de $ 9.176.940. Foco em OEE, CAPEX e Ciclo Financeiro Bernard v12.8.',
    config: {
      round_frequency_days: 7,
      sales_mode: 'internal' as SalesMode,
      scenario_type: 'simulated' as ScenarioType,
      transparency_level: 'high' as TransparencyLevel,
      gazeta_mode: 'anonymous' as GazetaMode,
      modality_type: 'standard' as ModalityType,
      deadline_value: 7,
      deadline_unit: 'days' as DeadlineUnit
    },
    market_indicators: DEFAULT_MACRO,
    initial_financials: INITIAL_FINANCIAL_TREE
  }
];

export const MENU_STRUCTURE = [
  { label: 'início', path: '/' },
  { label: 'ramos', path: '/solutions/simulators', sub: [
    { id: 'ind', label: 'Empirion Street', path: '/branches/industrial', icon: 'Factory', desc: 'Produção $9M Assets' },
    { id: 'com', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart', desc: 'Varejo Híbrido' },
    { id: 'ser', label: 'Serviços', path: '/branches/services', icon: 'Briefcase', desc: 'Capital Intelectual' },
    { id: 'agr', label: 'Agronegócio', path: '/branches/agribusiness', icon: 'Tractor', desc: 'Ativos Biológicos' },
    { id: 'fin', label: 'Financeiro', path: '/branches/finance', icon: 'DollarSign', desc: 'Hedge & Liquidez' },
    { id: 'con', label: 'Construção', path: '/branches/construction', icon: 'Hammer', desc: 'Obras Pesadas' }
  ]},
  { label: 'soluções', path: '#', sub: [
    { id: 'sim', label: 'Simuladores', path: '/solutions/simulators', icon: 'Cpu' },
    { id: 'otp', label: 'Torneios Abertos', path: '/solutions/open-tournaments', icon: 'Trophy' },
    { id: 'ibp', label: 'Plano de Negócios', path: '/solutions/business-plan', icon: 'PenTool' }
  ]},
  { label: 'funcionalidades', path: '/features' },
  { label: 'conteúdos', path: '/blog' },
  { label: 'contato', path: '/contact' }
];

export const ALPHA_TEST_USERS = [
  { id: 'tutor_master', name: 'Tutor Master', email: 'tutor@empirion.ia', role: 'tutor' as const },
  { id: 'alpha_street', name: 'Capitão Alpha', email: 'alpha@empirion.ia', role: 'player' as const, team: 'Unidade Alpha STREET' },
];

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
    hero: { 
      title: "Forje Seu Império", 
      empire: "STREET Arena", 
      subtitle: "Simulação Industrial v12.8.5: Onde $9M em ativos exigem maestria estratégica.", 
      cta: "Entre na Arena", 
      secondaryCta: "Ver Ramos" 
    },
    carousel: [
      { 
        id: 1, 
        title: "Empirion Street", 
        subtitle: "Gestão de Ciclo Operacional Bernard v12.8.", 
        image: "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?q=80&w=2000", 
        badge: "Industrial Node 08", 
        link: "/branches/industrial" 
      },
      { 
        id: 2, 
        title: "Global Supply Chain", 
        subtitle: "Logística integrada e volatilidade de MP-A/MP-B.", 
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000", 
        badge: "Supply Engine", 
        link: "/features" 
      }
    ],
    leaderboard: [
      { id: 'c1', name: "Empirion Street: Industrial Mastery", status: "Ciclo 1/12", teams: 8, lead: "Unidade Alpha" }
    ],
    sectors: [
      { id: 's1', name: 'Empirion Street', slug: 'industrial', icon: 'Factory', description: 'Otimização de OEE e CAPEX.' }
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