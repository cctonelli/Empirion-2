
// Use ChampionshipTemplate instead of ChampionshipStatus for type safety in CHAMPIONSHIP_TEMPLATES
import { Branch, ChampionshipTemplate, ModalityType, ScenarioType, ChampionshipStatus, MacroIndicators, Championship } from './types';

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
  agribusiness: { label: 'Agronegócio', icon: '🚜' },
  finance: { label: 'Financeiro', icon: '💰' },
  construction: { label: 'Construção', icon: '🔨' }
};

export const DEFAULT_MACRO: MacroIndicators = {
  growthRate: 2.5,
  inflationRate: 4.5,
  interestRateTR: 12.75,
  providerInterest: 1.5,
  salesAvgInterest: 2.0,
  avgProdPerMan: 500,
  importedProducts: 10000,
  laborAvailability: 'medium',
  providerPrices: { mpA: 150.00, mpB: 220.00 },
  distributionCostUnit: 25.00,
  marketingExpenseBase: 500000,
  machineryValues: { alfa: 2000000, beta: 3500000, gama: 5000000 },
  sectorAvgSalary: 5000.00,
  stockMarketPrice: 15.00,
  initialExchangeRateUSD: 5.25
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'brazilian-industrial-master',
    name: 'Industrial Brasileiro Básico (PMC/SPED)',
    branch: 'industrial',
    sector: 'Manufatura de Bens de Consumo',
    description: 'Template ideal para universidades. Estrutura contábil brasileira com estoques discriminados e ativos de $9M.',
    config: {
      roundFrequencyDays: 7,
      salesMode: 'hybrid',
      scenarioType: 'simulated',
      transparencyLevel: 'medium',
      modalityType: 'standard'
    },
    market_indicators: DEFAULT_MACRO,
    initial_financials: {
      balance_sheet: [
        { id: 'bs-1', label: '1. ATIVO TOTAL', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
          { id: 'bs-1.1', label: '1.1 ATIVO CIRCULANTE', value: 2823735, type: 'totalizer', children: [
            { id: 'cash', label: 'Caixa e Equivalentes', value: 1000000, type: 'asset', isEditable: true },
            { id: 'receivables', label: 'Contas a Receber', value: 1823735, type: 'asset', isEditable: true },
            { id: 'inventory-total', label: 'Estoques Totais', value: 0, type: 'totalizer', isReadOnly: true, children: [
               { id: 'mp-total', label: 'Matérias-Primas', value: 0, type: 'totalizer', children: [
                  { id: 'mp-a', label: 'Almoxarifado MP-A', value: 0, type: 'asset', isEditable: true },
                  { id: 'mp-b', label: 'Almoxarifado MP-B', value: 0, type: 'asset', isEditable: true }
               ]},
               { id: 'wip', label: 'Produtos em Elaboração', value: 0, type: 'asset', isEditable: true },
               { id: 'finished-goods', label: 'Produtos Acabados', value: 0, type: 'asset', isEditable: true }
            ]},
          ]},
          { id: 'bs-1.2', label: '1.2 ATIVO NÃO CIRCULANTE', value: 6353205, type: 'totalizer', children: [
            { id: 'machinery', label: 'Máquinas e Equipamentos', value: 5153205, type: 'asset', isEditable: true },
            { id: 'depreciation', label: '(-) Depreciação Acumulada', value: 0, type: 'asset', isEditable: true },
            { id: 'land', label: 'Terras e Edificações', value: 1200000, type: 'asset', isEditable: true },
          ]}
        ]},
        { id: 'bs-2', label: '2. PASSIVO E PL', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
          { id: 'bs-2.1', label: '2.1 PASSIVO CIRCULANTE', value: 2000000, type: 'totalizer', children: [
            { id: 'payables', label: 'Fornecedores', value: 1000000, type: 'liability', isEditable: true },
            { id: 'st-debt', label: 'Empréstimos C.P.', value: 1000000, type: 'liability', isEditable: true },
          ]},
          { id: 'bs-2.3', label: '2.3 PATRIMÔNIO LÍQUIDO', value: 7176940, type: 'totalizer', children: [
            { id: 'capital', label: 'Capital Social', value: 6500000, type: 'equity', isEditable: true },
            { id: 'retained', label: 'Lucros/Prejuízos Acumulados', value: 676940, type: 'equity', isEditable: true },
          ]}
        ]}
      ],
      dre: [
        { id: 'dre-1', label: 'RECEITA LÍQUIDA', value: 0, type: 'totalizer', isReadOnly: true, children: [
          { id: 'gross-rev', label: 'Receita Bruta', value: 0, type: 'revenue', isEditable: true },
          { id: 'deductions', label: 'Deduções e Impostos S/ Vendas', value: 0, type: 'expense', isEditable: true },
        ]},
        { id: 'dre-2', label: 'CUSTOS OPERACIONAIS', value: 0, type: 'totalizer', children: [
          { id: 'cpv', label: 'Custo dos Produtos Vendidos', value: 0, type: 'expense', isEditable: true },
        ]},
        { id: 'dre-3', label: 'DESPESAS OPERACIONAIS', value: 0, type: 'totalizer', children: [
          { id: 'adm-exp', label: 'Despesas Administrativas', value: 0, type: 'expense', isEditable: true },
          { id: 'mkt-exp', label: 'Despesas de Marketing', value: 0, type: 'expense', isEditable: true },
        ]}
      ]
    }
  }
];

export const DEMO_CHAMPIONSHIP_DATA: Championship = {
  id: 'brazilian-industrial-master',
  name: 'Industrial Brasileiro Básico (PMC/SPED)',
  description: 'Template ideal para universidades.',
  branch: 'industrial',
  status: 'active',
  is_public: true,
  currentRound: 0,
  totalRounds: 12,
  config: {
    currency: 'BRL',
    roundFrequencyDays: 7,
    salesMode: 'hybrid',
    scenarioType: 'simulated',
    transparencyLevel: 'medium',
    modalityType: 'standard',
    teamsLimit: 8,
    botsCount: 4
  },
  initial_financials: CHAMPIONSHIP_TEMPLATES[0].initial_financials,
  market_indicators: DEFAULT_MACRO,
  ecosystemConfig: {
    scenarioType: 'simulated',
    modalityType: 'standard',
    inflationRate: 0.04,
    demandMultiplier: 1.0,
    interestRate: 0.12,
    marketVolatility: 0.2
  }
};

export const MOCK_ONGOING_CHAMPIONSHIPS = [
  { id: 'c1', name: 'Industrial Mastery', branch: 'Industrial', teams: 14, round: '5/12', leader: 'Alpha Group' },
  { id: 'c2', name: 'Comercial Pro S1', branch: 'Comercial', teams: 8, round: '2/8', leader: 'Varejo Force' },
];

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
      { id: 'arenas', label: 'Arenas Virtuais', path: '/solutions/open-tournaments', icon: 'Trophy' },
      { id: 'bp_ia', label: 'Strategos Wizard (BP)', path: '/solutions/business-plan', icon: 'PenTool' },
    ]
  },
  { label: 'funcionalidades', path: '/features' },
  { label: 'conteudos', path: '/blog' },
  { label: 'contato', path: '/contact' }
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
      { id: 1, title: "Mastery Industrial", subtitle: "Otimize seu OEE.", image: "https://images.unsplash.com/photo-1614850523296-e811cf7eeea4?q=80&w=2000", badge: "Live Arena", link: "/activities/industrial" }
    ],
    leaderboard: [
      { id: 'c1', name: "Industrial Mastery", status: "Rodada 5/12", teams: 14, lead: "Alpha Group" }
    ],
    sectors: [
      { id: 's1', name: 'Indústria', slug: 'industrial', icon: 'Factory', description: 'Otimize linhas de montagem e gerencie Capex complexo.' }
    ]
  }
};
