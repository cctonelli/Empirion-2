
import { Branch, ChampionshipTemplate, ModalityType, ScenarioType, ChampionshipStatus } from './types';

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
  { id: 'tutor', name: 'Tutor Teste', email: 'tutor@example.com', role: 'tutor', icon: 'Shield' },
  { id: 'alpha', name: 'Capitão Alpha', email: 'alpha@example.com', role: 'player', team: 'Equipe Alpha', icon: 'Zap' },
  { id: 'beta', name: 'Capitão Beta', email: 'beta@example.com', role: 'player', team: 'Equipe Beta', icon: 'Zap' },
  { id: 'gamma', name: 'Capitão Gamma', email: 'gamma@example.com', role: 'player', team: 'Equipe Gamma', icon: 'Zap' },
  { id: 'delta', name: 'Capitão Delta', email: 'delta@example.com', role: 'player', team: 'Equipe Delta', icon: 'Zap' },
];

export const BRANCH_CONFIGS: Record<string, { label: string; icon: string }> = {
  industrial: { label: 'Industrial', icon: '🏭' },
  commercial: { label: 'Comercial', icon: '🛒' },
  services: { label: 'Serviços', icon: '💼' },
  agribusiness: { label: 'Agronegócio', icon: '🚜' },
  finance: { label: 'Financeiro', icon: '💰' },
  construction: { label: 'Construção', icon: '🔨' }
};

// Added missing MODALITY_INFO for championship configuration
export const MODALITY_INFO: Record<string, { label: string; desc: string }> = {
  standard: { label: 'Arena Padrão', desc: 'Equilíbrio entre produção e comercial sem variáveis extremas.' },
  business_round: { label: 'Rodada de Negócios', desc: 'Foco em Guerra de Preços, Elasticidade-Demanda Alta e Inflação Composta.' },
  factory_efficiency: { label: 'Eficiência de Fábrica', desc: 'Foco em OEE, Lead Time, JIT/MRP e Níveis de Automação Industrial.' }
};

export const MENU_STRUCTURE = [
  { label: 'home', path: '/', translationKey: 'home' },
  { 
    label: 'ramos', 
    path: '/solutions/simulators',
    sub: [
      { id: 'ind', label: 'Industrial', path: '/activities/industrial', icon: 'Factory' },
      { id: 'com', label: 'Comercial', path: '/activities/commercial', icon: 'ShoppingCart' },
      { id: 'ser', label: 'Serviços', path: '/activities/services', icon: 'Briefcase' },
      { id: 'agr', label: 'Agro', path: '/activities/agribusiness', icon: 'Tractor' },
      { id: 'fin', label: 'Financeiro', path: '/activities/finance', icon: 'DollarSign' },
      { id: 'con', label: 'Construção', path: '/activities/construction', icon: 'Hammer' },
    ]
  },
  { 
    label: 'solucoes', 
    path: '#',
    sub: [
      { 
        id: 'arenas', 
        label: 'Arenas Virtuais', 
        path: '/solutions/open-tournaments',
        icon: 'Trophy',
        sub: [
          { id: 'edu', label: 'Educação', path: '/solutions/university' },
          { id: 'corp', label: 'Corporativo', path: '/solutions/corporate' },
          { id: 'solo', label: 'Solo (Individual)', path: '/solutions/individual' }
        ]
      },
      { id: 'bp_ia', label: 'Strategos Wizard (BP)', path: '/solutions/business-plan', icon: 'PenTool' },
    ]
  },
  { label: 'funcionalidades', path: '/features' },
  { label: 'conteudos', path: '/blog' },
  { label: 'contato', path: '/contact' },
  { label: 'teste', path: '/test/industrial', icon: 'Terminal' }
];

export const DEMO_CHAMPIONSHIP_DATA = {
  id: 'alpha-arena-1',
  name: 'Arena Industrial Alpha (Demo)',
  branch: 'industrial' as Branch,
  status: 'active' as ChampionshipStatus,
  is_public: true,
  currentRound: 1,
  totalRounds: 12,
  config: {
    regionsCount: 9,
    initialStock: 30000,
    initialPrice: 340,
    modalityType: 'standard' as ModalityType
  },
  initial_financials: {
    balance_sheet: {
      total_assets: 9176940,
      current_assets: { cash: 1000000, accounts_receivable: 1823735, inventory: 0 },
      non_current_assets: { machinery: 5153205, land: 1200000 },
      liabilities_equity: { total: 9176940, current: 2000000, non_current: 3000000, equity: 4176940 }
    }
  },
  ecosystemConfig: {
    scenarioType: 'simulated' as ScenarioType,
    modalityType: 'standard' as ModalityType,
    inflationRate: 0.04,
    demandMultiplier: 1.0,
    interestRate: 0.12,
    marketVolatility: 0.2
  }
};

// Added missing MOCK_ONGOING_CHAMPIONSHIPS for tournament display
export const MOCK_ONGOING_CHAMPIONSHIPS = [
  { id: 'c1', name: 'Elite Industrial Alpha', branch: 'Industrial', round: '04/12', teams: 14, leader: 'Equipe Alpha' },
  { id: 'c2', name: 'Master Varejo Global', branch: 'Comercial', round: '02/10', teams: 22, leader: 'Varejo Pro' },
  { id: 'c3', name: 'Agro Delta Challenge', branch: 'Agro', round: '07/12', teams: 8, leader: 'Fazenda Futuro' },
];

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'industrial-elite-gold',
    name: 'Industrial Elite Mastery (Bernard Fidelity)',
    branch: 'industrial',
    sector: 'Manufatura de Bens de Capital',
    description: 'O template mais completo para simulação industrial brasileira. Inclui 9 regiões geográficas e balanço inicial de $9.1M.',
    is_public: true,
    config: {
      currency: 'BRL',
      round_frequency_days: 7,
      total_rounds: 12,
      sales_mode: 'hybrid',
      scenario_type: 'simulated',
      transparency_level: 'medium',
      team_fee: 150,
      community_enabled: true,
      regionsCount: 9,
      modalityType: 'standard'
    },
    initial_financials: {
      balance_sheet: {
        total_assets: 9176940,
        current_assets: { cash: 1000000, accounts_receivable: 1823735, inventory: 0 },
        non_current_assets: { machinery: 5153205, land: 1200000 },
        liabilities_equity: { total: 9176940, current: 2000000, non_current: 3000000, equity: 4176940 }
      },
      share_price_initial: 100.00,
      shares_outstanding: 80000
    },
    products: [{ name: 'Alpha Insumo', suggested_price: 340, initial_stock: 30000 }],
    resources: { water: 5000, energy: 12000 },
    market_indicators: { 
      inflation_rate: 0.04, 
      interest_rate_tr: 0.12, 
      exchange_rate: 5.50,
      demand_potential: 120000
    }
  }
];

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
    hero: {
      title: "Empirion",
      empire: "BI Arena",
      subtitle: "A Arena Definitiva onde a IA e a Estratégia Humana colidem.",
      cta: "Entrar na Arena",
      secondaryCta: "Ver Atividades"
    },
    carousel: [
      { id: 1, title: "Mastery Industrial", subtitle: "Otimize seu OEE.", image: "https://images.unsplash.com/photo-1614850523296-e811cf7eeea4?q=80&w=2000", badge: "Live Arena", link: "/activities/industrial" },
      { id: 2, title: "Rodada de Negócios", subtitle: "Domine a guerra de preços.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000", badge: "Live Arena", link: "/activities/rodada-negocios" }
    ],
    leaderboard: [
      { id: 'c1', name: "Industrial Mastery", status: "Rodada 5/12", teams: 14, lead: "Alpha Group" }
    ],
    sectors: [
      { id: 's1', name: 'Indústria', slug: 'industrial', icon: 'Factory', description: 'Otimize linhas de montagem e gerencie Capex complexo.' },
      { id: 's2', name: 'Comércio', slug: 'commercial', icon: 'ShoppingCart', description: 'Guerra de preços e gestão de canais de distribuição omni.' },
      { id: 's3', name: 'Serviços', slug: 'services', icon: 'Briefcase', description: 'Gestão de capital humano e níveis de SLA críticos.' },
      { id: 's4', name: 'Agro', slug: 'agribusiness', icon: 'Tractor', description: 'Ciclos de colheita e volatilidade de commodities globais.' },
      { id: 's5', name: 'Finanças', slug: 'finance', icon: 'DollarSign', description: 'Alavancagem, derivativos e gestão de risco sistêmico.' },
      { id: 's6', name: 'Construção', slug: 'construction', icon: 'Hammer', description: 'Gerenciamento de projetos e fluxos de caixa de longo prazo.' }
    ]
  }
};
