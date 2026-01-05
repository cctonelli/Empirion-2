import { Branch, ChampionshipTemplate, MacroIndicators, Championship } from './types';

// VERSIONAMENTO OFICIAL EMPIRION - v12.8 ORACLE
export const APP_VERSION = "v12.8.0-Stable";
export const BUILD_DATE = "05/01/2026";
export const PROTOCOL_NODE = "Node 08-ALPHA-TENANT";

export const COLORS = {
  primary: '#020617',
  secondary: '#1e293b',
  accent: '#3b82f6',
  gold: '#fbbf24',
  empire_orange: '#f97316',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const ALPHA_TEST_USERS = [
  { id: 'tutor', name: 'Tutor Master', email: 'tutor@empirion.ia', role: 'tutor', icon: 'Shield' },
  { id: 'alpha', name: 'Capitão Alpha', email: 'alpha@empirion.ia', role: 'player', team: 'Equipe Alpha', icon: 'Zap' },
];

export const BRANCH_CONFIGS: Record<string, { label: string; icon: string }> = {
  industrial: { label: 'Industrial', icon: '🏭' },
  commercial: { label: 'Comercial', icon: '🛒' },
  services: { label: 'Serviços', icon: '💼' },
  agribusiness: { label: 'Agronegócio', icon: 'Tractor' },
  finance: { label: 'Financeiro', icon: '💰' },
  construction: { label: 'Construção', icon: '🔨' }
};

export const DEFAULT_MACRO: MacroIndicators = {
  growthRate: 3.0,
  inflationRate: 1.0,
  interestRateTR: 3.0,
  providerInterest: 2.0,
  salesAvgInterest: 1.5,
  avgProdPerMan: 20.64,
  importedProducts: 0,
  laborAvailability: 'medium',
  providerPrices: { mpA: 20.20, mpB: 40.40 },
  distributionCostUnit: 50.50,
  marketingExpenseBase: 10200,
  machineryValues: { 
    alfa: 505000, 
    beta: 1515000, 
    gama: 3030000 
  },
  sectorAvgSalary: 1313.00,
  stockMarketPrice: 60.09,
  initialExchangeRateUSD: 5.25,
  difficulty: {
    price_sensitivity: 2.0,
    marketing_effectiveness: 1.0
  }
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'tpl-industrial',
    name: 'Industrial Mastery',
    branch: 'industrial',
    sector: 'Manufacturing',
    description: 'Gestão de OEE, CapEx e logística em 9 regiões.',
    config: {
      roundFrequencyDays: 7,
      salesMode: 'hybrid',
      scenarioType: 'simulated',
      transparencyLevel: 'medium',
      modalityType: 'standard'
    },
    market_indicators: DEFAULT_MACRO,
    initial_financials: {
      balance_sheet: [],
      dre: []
    }
  }
];

export const MENU_STRUCTURE = [
  { label: 'início', path: '/' },
  { 
    label: 'ramos', 
    path: '/solutions/simulators',
    sub: [
      { id: 'ind', label: 'Industrial', path: '/branches/industrial', icon: 'Factory', desc: 'Produção em Massa' },
      { id: 'com', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart', desc: 'Varejo e Atacado' },
      { id: 'ser', label: 'Serviços', path: '/branches/services', icon: 'Briefcase', desc: 'Consultoria e TI' },
      { id: 'agr', label: 'Agronegócio', path: '/branches/agribusiness', icon: 'Tractor', desc: 'Commodities' },
      { id: 'fin', label: 'Financeiro', path: '/branches/finance', icon: 'Landmark', desc: 'Banking & Invest' },
      { id: 'con', label: 'Construção', path: '/branches/construction', icon: 'Hammer', desc: 'Real Estate' }
    ]
  },
  { label: 'soluções', path: '#', sub: [
    { id: 'sim', label: 'Simuladores', path: '/solutions/simulators', icon: 'Cpu' },
    { id: 'otp', label: 'Torneios Abertos', path: '/solutions/open-tournaments', icon: 'Trophy' }
  ]},
  { label: 'funcionalidades', path: '/features' },
  { label: 'conteúdos', path: '/blog' },
  { label: 'contato', path: '/contact' }
];

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
    hero: {
      title: "Forje Seu Império",
      empire: "BI Arena",
      subtitle: "A Arena Definitiva onde a IA e a Estratégia Humana colidem.",
      cta: "Entrar na Arena",
      secondaryCta: "Ver Atividades"
    },
    carousel: [
      { id: 1, title: "Mastery Industrial", subtitle: "Otimize seu OEE.", image: "https://images.unsplash.com/photo-1614850523296-e811cf7eeea4?q=80&w=2000", badge: "Live Arena", link: "/branches/industrial" }
    ],
    leaderboard: [
      { id: 'c1', name: "Industrial Mastery", status: "Rodada 1/12", teams: 8, lead: "Equipe Alpha" }
    ],
    sectors: [
      { id: 's1', name: 'Indústria', slug: 'industrial', icon: 'Factory', description: 'Otimize linhas de montagem e gerencie Capex complexo.' }
    ]
  },
  'branch-industrial': {
    name: 'Industrial',
    heroImage: 'https://images.unsplash.com/photo-1614850523296-e811cf7eeea4?q=80&w=2000',
    body: 'Otimize linhas de montagem e gerencie Capex complexo na vanguarda da simulação.',
    description: 'A modalidade Industrial Empirion é focada no gerenciamento de cadeias produtivas complexas.',
    features: ['Gestão de Máquinas Alfa/Beta/Gama', 'Obsolescência Programada', 'Supply Chain Global'],
    kpis: ['OEE Factory Efficiency', 'Giro de Estoque', 'Margem Bruta'],
    accent: 'orange'
  }
};

export const getPageContent = (slug: string) => {
  const branchKey = `branch-${slug}`;
  const activityKey = `activity-${slug}`;
  const content = (DEFAULT_PAGE_CONTENT as any)[branchKey] || (DEFAULT_PAGE_CONTENT as any)[activityKey];
  return content || null;
};