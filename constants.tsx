
import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit } from './types';

export const APP_VERSION = "v12.8.5-Gold";
export const BUILD_DATE = "01/01/2026";
export const PROTOCOL_NODE = "Node 08-ALPHA-TENANT-STABLE";

export const INITIAL_INDUSTRIAL_FINANCIALS = {
  balance_sheet: {
    assets: {
      current: {
        cash: 840200,
        receivables: 1823735,
        inventory_mpa: 628545,
        inventory_mpb: 838060,
        inventory_finished: 0
      },
      fixed: {
        land: 1500000,
        machinery_gross: 5000000,
        accumulated_depreciation: -613400
      },
      total: 9176940
    },
    liabilities: {
      current: {
        suppliers: 717605,
        taxes_payable: 13045,
        loans_short_term: 1872362
      },
      long_term: {
        loans_long_term: 1500000
      },
      equity: {
        capital_social: 5000000,
        accumulated_profit: 73928
      },
      total: 9176940
    }
  }
};

export const DEFAULT_MACRO: MacroIndicators = {
  growthRate: 3.0,
  inflationRate: 1.0,
  interestRateTR: 3.0,
  tax_rate_ir: 15.0,
  machineryValues: { alfa: 505000, beta: 1515000, gama: 3030000 },
  difficulty: { price_sensitivity: 2.0, marketing_effectiveness: 1.0 }
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'tpl-industrial-gold',
    name: 'Industrial Mastery GOLD',
    branch: 'industrial',
    sector: 'Manufacturing',
    description: 'Balanço Inicial de $ 9.176.940. Foco em OEE e Ciclo Financeiro.',
    config: {
      round_frequency_days: 7,
      sales_mode: 'internal' as SalesMode,
      scenario_type: 'simulated' as ScenarioType,
      transparency_level: 'high' as TransparencyLevel,
      modalityType: 'standard' as ModalityType,
      deadlineValue: 7,
      deadlineUnit: 'days' as DeadlineUnit
    },
    market_indicators: DEFAULT_MACRO,
    initial_financials: INITIAL_INDUSTRIAL_FINANCIALS
  }
];

export const MENU_STRUCTURE = [
  { label: 'início', path: '/' },
  { label: 'ramos', path: '/solutions/simulators', sub: [
    { id: 'ind', label: 'Industrial', path: '/branches/industrial', icon: 'Factory', desc: 'Produção $9M Assets' },
    { id: 'com', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart', desc: 'Varejo Híbrido' }
  ]},
  { label: 'soluções', path: '#', sub: [
    { id: 'sim', label: 'Simuladores', path: '/solutions/simulators', icon: 'Cpu' },
    { id: 'otp', label: 'Torneios Abertos', path: '/solutions/open-tournaments', icon: 'Trophy' }
  ]},
  { label: 'funcionalidades', path: '/features' },
  { label: 'conteúdos', path: '/blog' },
  { label: 'contato', path: '/contact' }
];

export const ALPHA_TEST_USERS = [
  { id: 'tutor', name: 'Tutor Master', email: 'tutor@empirion.ia', role: 'tutor' as const },
  { id: 'alpha', name: 'Capitão Alpha', email: 'alpha@empirion.ia', role: 'player' as const, team: 'Unidade Alpha GOLD' },
];

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
    hero: { title: "Forje Seu Império", empire: "GOLD Arena", subtitle: "Simulação Industrial v12.8.5: Onde $9M em ativos exigem maestria estratégica.", cta: "Entre na Arena", secondaryCta: "Ver Ramos" },
    carousel: [{ id: 1, title: "Industrial GOLD", subtitle: "Gestão de Ciclo Operacional.", image: "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?q=80&w=2000", badge: "P0 Validado", link: "/branches/industrial" }],
    leaderboard: [{ id: 'c1', name: "Industrial Mastery GOLD", status: "Ciclo 1/12", teams: 8, lead: "Unidade Alpha" }],
    sectors: [{ id: 's1', name: 'Indústria', slug: 'industrial', icon: 'Factory', description: 'Otimização de OEE e CAPEX.' }]
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
