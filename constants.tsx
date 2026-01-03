
import { Branch, ChampionshipTemplate, MacroIndicators, Championship } from './types';

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
  machineryValues: { alfa: 505000, beta: 1515000, gama: 3030000 },
  sectorAvgSalary: 1313.00,
  stockMarketPrice: 60.09,
  initialExchangeRateUSD: 5.25
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'industrial-master-street',
    name: 'Industrial Empirion Street (Fidelidade PDF)',
    branch: 'industrial',
    sector: 'Bens de Consumo Duráveis',
    description: 'Template oficial sincronizado com o legado: Ativo de R$ 9.176.940, 9 regiões geográficas e 8 equipes idênticas.',
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
          { id: 'bs-1.1', label: '1.1 ATIVO CIRCULANTE', value: 3290340, type: 'totalizer', children: [
            { id: 'bs-1.1.1', label: 'CIRCULANTE OPERACIONAL', value: 3290340, type: 'totalizer', children: [
               { id: 'receivables', label: 'Contas a Receber', value: 1823735, type: 'asset', isEditable: true },
               { id: 'inventory-total', label: 'ESTOQUES', value: 1466605, type: 'totalizer', isReadOnly: true, children: [
                  { id: 'mp-a', label: 'Estoque MP-A', value: 628545, type: 'asset', isEditable: true },
                  { id: 'mp-b', label: 'Estoque MP-B', value: 838060, type: 'asset', isEditable: true },
                  { id: 'finished-goods', label: 'Estoque Prod. Acabado ALPHA', value: 0, type: 'asset', isEditable: true }
               ]}
            ]}
          ]},
          { id: 'bs-1.2', label: '1.2 ATIVO NÃO CIRCULANTE', value: 5886600, type: 'totalizer', children: [
            { id: 'machinery', label: 'Máquinas', value: 2360000, type: 'asset', isEditable: true },
            { id: 'depr-mach', label: '(-) Depreciação Acumulada Equip.', value: -811500, type: 'asset', isEditable: true },
            { id: 'land', label: 'Terrenos', value: 1200000, type: 'asset', isEditable: true },
            { id: 'buildings', label: 'Prédios e Instalações', value: 5440000, type: 'asset', isEditable: true },
            { id: 'depr-build', label: '(-) Depreciação Acumulada Prédios', value: -2301900, type: 'asset', isEditable: true },
          ]}
        ]},
        { id: 'bs-2', label: '2. PASSIVO E PL', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
          { id: 'bs-2.1', label: '2.1 PASSIVO CIRCULANTE', value: 4121493, type: 'totalizer', children: [
            { id: 'bs-2.1.1', label: 'CIRCULANTE OPERACIONAL', value: 730650, type: 'totalizer', children: [
               { id: 'payables', label: 'Fornecedores', value: 717605, type: 'liability', isEditable: true },
               { id: 'tax-pay', label: 'Imposto de Renda a Pagar', value: 13045, type: 'liability', isEditable: true },
            ]},
            { id: 'bs-2.1.2', label: 'CIRCULANTE FINANCEIRO', value: 3390843, type: 'totalizer', children: [
               { id: 'st-loans', label: 'Empréstimos Curto Prazo', value: 1872362, type: 'liability', isEditable: true },
               { id: 'dividends', label: 'Dividendos a Pagar', value: 18481, type: 'liability', isEditable: true }
            ]}
          ]},
          { id: 'bs-2.2', label: '2.2 EXIGÍVEL LONGO PRAZO', value: 1500000, type: 'totalizer', children: [
            { id: 'lt-loans', label: 'Empréstimos Longo Prazo', value: 1500000, type: 'liability', isEditable: true }
          ]},
          { id: 'bs-2.3', label: '2.3 PATRIMÔNIO LÍQUIDO', value: 5055447, type: 'totalizer', children: [
            { id: 'capital', label: 'Capital Social', value: 5000000, type: 'equity', isEditable: true },
            { id: 'retained', label: 'Lucros Acumulados', value: 55447, type: 'equity', isEditable: true },
          ]}
        ]}
      ],
      dre: [
        { id: 'dre-1', label: 'RECEITA DE VENDAS', value: 3322735, type: 'totalizer', isEditable: true },
        { id: 'dre-2', label: '( - ) CUSTO PROD. VENDIDO - CPV', value: 2278180, type: 'expense', isEditable: true },
        { id: 'dre-3', label: '( = ) LUCRO BRUTO', value: 1044555, type: 'totalizer', isReadOnly: true },
        { id: 'dre-4', label: '( - ) DESPESAS OPERACIONAIS', value: 957582, type: 'totalizer', children: [
          { id: 'sell-exp', label: 'De Vendas (Marketing/Distr.)', value: 802702, type: 'expense', isEditable: true },
          { id: 'adm-exp', label: 'Administrativas', value: 114880, type: 'expense', isEditable: true },
          { id: 'fin-exp', label: 'Financeiras Líquidas', value: 40000, type: 'expense', isEditable: true },
        ]},
        { id: 'dre-5', label: '(=) LUCRO OPERACIONAL', value: 86973, type: 'totalizer', isReadOnly: true },
        { id: 'dre-6', label: '( - ) PROVISÃO PARA O I.R.', value: 13045, type: 'expense', isEditable: true },
        { id: 'dre-7', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 73928, type: 'totalizer', isReadOnly: true }
      ]
    }
  }
];

export const DEMO_CHAMPIONSHIP_DATA: Championship = {
  id: 'brazilian-industrial-master',
  name: 'Empirion Street - Industrial Mastery',
  description: 'Arena oficial sincronizada com o legado contábil e operacional v5.0.',
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
    botsCount: 0
  },
  initial_financials: CHAMPIONSHIP_TEMPLATES[0].initial_financials,
  market_indicators: DEFAULT_MACRO,
  ecosystemConfig: {
    scenarioType: 'simulated',
    modalityType: 'standard',
    inflationRate: 0.01,
    demandMultiplier: 1.0,
    interestRate: 0.03,
    marketVolatility: 0.05
  }
};

export const MOCK_ONGOING_CHAMPIONSHIPS = [
  { id: 'c1', name: 'Master Cup Industrial', branch: 'Industrial', teams: 8, round: '1/12', leader: 'Equipe Alpha' },
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
      { id: 'c1', name: "Industrial Mastery", status: "Rodada 1/12", teams: 8, lead: "Equipe Alpha" }
    ],
    sectors: [
      { id: 's1', name: 'Indústria', slug: 'industrial', icon: 'Factory', description: 'Otimize linhas de montagem e gerencie Capex complexo.' }
    ]
  }
};
