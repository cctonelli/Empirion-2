import { Branch, ChampionshipTemplate, MacroIndicators, Championship } from './types';

// VERSIONAMENTO OFICIAL EMPIRION - ALINHADO COM ESCOPO V3.0
export const APP_VERSION = "v3.0.0-MVP-GOLD";
export const BUILD_DATE = "31/12/2025";
export const PROTOCOL_NODE = "Node 08-ALPHA";

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
    name: 'Industrial Empirion Street (Standard)',
    branch: 'industrial',
    sector: 'Bens de Consumo Duráveis',
    description: 'Template oficial Empirion: Ativo de R$ 9.176.940, 9 regiões geográficas e 8 equipes idênticas.',
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
            { id: 'bs-1.1.1', label: 'CIRCULANTE FINANCEIRO', value: 0, type: 'totalizer', children: [
               { id: 'cash', label: 'Caixa', value: 0, type: 'asset', isEditable: true },
               { id: 'bank', label: 'Bancos', value: 0, type: 'asset', isEditable: true },
               { id: 'investment', label: 'Aplicação', value: 0, type: 'asset', isEditable: true }
            ]},
            { id: 'bs-1.1.2', label: 'CIRCULANTE OPERACIONAL', value: 3290340, type: 'totalizer', children: [
               { id: 'bs-1.1.2.1', label: 'CONTAS A RECEBER', value: 1823735, type: 'totalizer', children: [
                  { id: 'receivables-titles', label: 'Titulos a Receber', value: 1823735, type: 'asset', isEditable: true },
                  { id: 'receivables-pdd', label: '(-) Provisão devedores duvidosos', value: 0, type: 'asset', isEditable: true }
               ]},
               { id: 'inventory-total', label: 'ESTOQUE', value: 1466605, type: 'totalizer', isReadOnly: true, children: [
                  { id: 'finished-goods', label: 'Estoque Prod. Acabado ALPHA', value: 0, type: 'asset', isEditable: true },
                  { id: 'mp-a', label: 'Estoque MP A', value: 628545, type: 'asset', isEditable: true },
                  { id: 'mp-b', label: 'Estoque MP B', value: 838060, type: 'asset', isEditable: true }
               ]}
            ]}
          ]},
          { id: 'bs-1.2', label: '1.2 ATIVO NÃO CIRCULANTE', value: 5886600, type: 'totalizer', children: [
            { id: 'bs-1.2.1', label: 'IMOBILIZADO', value: 5886600, type: 'totalizer', children: [
               { id: 'machinery', label: 'Máquinas', value: 2360000, type: 'asset', isEditable: true },
               { id: 'depr-mach', label: '(-) Depreciação acumulada de equipamentos', value: -811500, type: 'asset', isEditable: true },
               { id: 'land', label: 'Terrenos', value: 1200000, type: 'asset', isEditable: true },
               { id: 'buildings', label: 'Prédios e Instalações', value: 5440000, type: 'asset', isEditable: true },
               { id: 'depr-build', label: '(-) Depreciação acumulada de prédios e insta.', value: -2301900, type: 'asset', isEditable: true },
            ]}
          ]}
        ]},
        { id: 'bs-2', label: '2. PASSIVO E PL', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
          { id: 'bs-2.1', label: '2.1 PASSIVO CIRCULANTE', value: 4121493, type: 'totalizer', children: [
            { id: 'bs-2.1.1', label: 'PASSIVO CIRCULANTE OPERACIONAL', value: 730650, type: 'totalizer', children: [
               { id: 'payables', label: 'Fornecedores', value: 717605, type: 'liability', isEditable: true },
               { id: 'tax-pay', label: 'Imposto de Renda a pagar', value: 13045, type: 'liability', isEditable: true },
            ]},
            { id: 'bs-2.1.2', label: 'PASSIVO CIRCULANTE FINANCEIRO', value: 3390843, type: 'totalizer', children: [
               { id: 'bs-2.1.2.1', label: 'EXIGÍVEL À CURTO PRAZO', value: 1890843, type: 'totalizer', children: [
                  { id: 'dividends', label: 'Dividendos a pagar', value: 18481, type: 'liability', isEditable: true },
                  { id: 'st-loans', label: 'Empréstimos de curto prazo', value: 1872362, type: 'liability', isEditable: true }
               ]}
            ]}
          ]},
          { id: 'bs-2.2', label: '2.2 EXIGÍVEL À LONGO PRAZO', value: 1500000, type: 'totalizer', children: [
            { id: 'lt-loans', label: 'Empréstimos de longo prazo', value: 1500000, type: 'liability', isEditable: true }
          ]},
          { id: 'bs-2.3', label: '2.3 PATRIMÔNIO LÍQUIDO', value: 5055447, type: 'totalizer', children: [
            { id: 'capital', label: 'Capital Social', value: 5000000, type: 'equity', isEditable: true },
            { id: 'retained', label: 'Lucros Acumulados no ano', value: 55447, type: 'equity', isEditable: true },
          ]}
        ]}
      ],
      dre: [
        { id: 'dre-1', label: 'RECEITA DE VENDAS', value: 3322735, type: 'totalizer', isEditable: true },
        { id: 'dre-2', label: '( - ) CUSTO PROD. VENDIDO - CPV', value: 2278180, type: 'expense', isEditable: true },
        { id: 'dre-3', label: '( = ) LUCRO BRUTO', value: 1044555, type: 'totalizer', isReadOnly: true },
        { id: 'dre-4', label: '( - ) DESPESAS OPERACIONAIS:', value: 957582, type: 'totalizer', children: [
          { id: 'sell-exp', label: 'DE VENDAS', value: 802702, type: 'expense', isEditable: true },
          { id: 'adm-exp', label: 'ADMINISTRATIVAS', value: 114880, type: 'expense', isEditable: true },
          { id: 'fin-exp', label: 'FINANCEIRAS LÍQUIDAS', value: 40000, type: 'expense', isEditable: true },
        ]},
        { id: 'dre-5', label: '(=) LUCRO OPERACIONAL', value: 86973, type: 'totalizer', isReadOnly: true },
        { id: 'dre-6', label: '( - ) PROVISÃO PARA O I. R.', value: 13045, type: 'expense', isEditable: true },
        { id: 'dre-7', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 73928, type: 'totalizer', isReadOnly: true }
      ]
    }
  }
];

export const DEMO_CHAMPIONSHIP_DATA: Championship = {
  id: 'brazilian-industrial-master',
  name: 'Empirion Street - Industrial Mastery',
  description: 'Arena oficial baseada na arquitetura operacional Empirion Systems.',
  branch: 'industrial',
  status: 'active',
  is_public: true,
  is_trial: false,
  current_round: 0,
  total_rounds: 12,
  sales_mode: 'hybrid',
  scenario_type: 'simulated',
  currency: 'BRL',
  round_frequency_days: 7,
  deadline_value: 7,
  deadline_unit: 'days',
  transparency_level: 'medium',
  config: {
    currency: 'BRL',
    roundFrequencyDays: 7,
    deadlineValue: 7,
    deadlineUnit: 'days',
    salesMode: 'hybrid',
    scenarioType: 'simulated',
    transparencyLevel: 'medium',
    modalityType: 'standard',
    teamsLimit: 8,
    botsCount: 0
  },
  initial_financials: CHAMPIONSHIP_TEMPLATES[0].initial_financials,
  market_indicators: DEFAULT_MACRO,
  created_at: new Date().toISOString(),
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
  { id: 'c1', name: "Industrial Mastery", branch: "Industrial", status: "Rodada 1/12", current_round: 1, total_rounds: 12, teamsCount: 8, lead: "Equipe Alpha" }
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
      { id: 'arenas', label: 'Arenas Virtuais', path: '/solutions/open-tournaments', icon: 'Trophy', desc: 'Competições Globais' },
      { 
        id: 'academy', label: 'Empirion Academy', path: '#', icon: 'GraduationCap', desc: 'Treinamentos Elite',
        sub: [
          { id: 'online', label: 'Cursos Online', path: '/solutions/training/online', icon: 'PlayCircle' },
          { id: 'corp', label: 'In-Company', path: '/solutions/training/corporate', icon: 'Briefcase' },
        ]
      },
      { id: 'bp_ia', label: 'Strategos Wizard', path: '/solutions/business-plan', icon: 'PenTool', desc: 'Plano de Negócios IA' },
      { id: 'consulting', label: 'Audit Consulting', path: '/solutions/consulting', icon: 'ShieldCheck', desc: 'Auditoria Gerencial' },
    ]
  },
  { label: 'funcionalidades', path: '/features' },
  { label: 'conteudos', path: '/blog' },
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
      { id: 1, title: "Mastery Industrial", subtitle: "Otimize seu OEE.", image: "https://images.unsplash.com/photo-1614850523296-e811cf7eeea4?q=80&w=2000", badge: "Live Arena", link: "/activities/industrial" }
    ],
    leaderboard: [
      { id: 'c1', name: "Industrial Mastery", status: "Rodada 1/12", teams: 8, lead: "Equipe Alpha" }
    ],
    sectors: [
      { id: 's1', name: 'Indústria', slug: 'industrial', icon: 'Factory', description: 'Otimize linhas de montagem e gerencie Capex complexo.' }
    ]
  },
  'activity-industrial': {
    name: 'Industrial',
    heroImage: 'https://images.unsplash.com/photo-1614850523296-e811cf7eeea4?q=80&w=2000',
    body: 'Otimize linhas de montagem e gerencie Capex complexo na vanguarda da simulação.',
    description: 'A modalidade Industrial Empirion é focada no gerenciamento de cadeias produtivas complexas. Strategistas devem equilibrar o OEE (Overall Equipment Effectiveness), turnover de mão de obra e elasticidade-preço em 9 regiões independentes.',
    features: ['Gestão de Máquinas Alfa/Beta/Gama', 'Obsolescência Programada', 'Supply Chain Global', 'Turnover de RH Realista'],
    kpis: ['OEE Factory Efficiency', 'Giro de Estoque MP-A/B', 'Margem Bruta Industrial'],
    accent: 'orange'
  },
  'activity-commercial': {
    name: 'Comercial',
    heroImage: 'https://images.unsplash.com/photo-1534452286302-2f55043531b9?q=80&w=2000',
    body: 'Varejo híbrido e algoritmos de satisfação do consumidor.',
    description: 'Gerencie operações de varejo em larga escala, equilibrando estoque, promoções sazonais e treinamento de equipe de vendas.',
    features: ['Mix de Produtos Dinâmico', 'E-commerce Integration', 'CRM Predictive Data', 'Logística de Last-Mile'],
    kpis: ['Consumer Satisfaction Index', 'Vendas por Metro Quadrado', 'Ticket Médio Regional'],
    accent: 'blue'
  },
  'activity-services': {
    name: 'Serviços',
    heroImage: 'https://images.unsplash.com/photo-1454165833767-1316b0215b3f?q=80&w=2000',
    body: 'Capital intelectual e gestão de prestígio SISERV.',
    description: 'A simulação de serviços foca na gestão de horas faturáveis, treinamento técnico e reputação de marca. O sucesso depende da retenção de talentos e na eficiência da entrega de contratos complexos.',
    features: ['Gestão de Talentos Senior/Pleno', 'Acordos de Nível de Serviço (SLA)', 'Quality Assurance Audit', 'Brand Reputation Engine'],
    kpis: ['Billability Rate', 'Client Satisfaction Score', 'Margem por Contrato'],
    accent: 'emerald'
  },
  'activity-agribusiness': {
    name: 'Agronegócio',
    heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000',
    body: 'Sazonalidade extrema e gestão de ativos biológicos SIAGRO.',
    description: 'Enfrente os desafios do campo, desde a volatilidade das commodities até o risco climático. Use inteligência preditiva para maximizar a colheita e gerenciar a logística de exportação.',
    features: ['Market Commodity Pricing', 'Climate Volatility Simulator', 'Biological Asset Valuation', 'Supply Chain Export Logistics'],
    kpis: ['Yield per Hectare', 'Commodity Exposure Index', 'Logistics Cost Ratio'],
    accent: 'orange'
  },
  'activity-finance': {
    name: 'Financeiro',
    heroImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000',
    body: ' Spread bancário, hedge e volatilidade SINVEST.',
    description: 'Opere como uma instituição financeira de elite. Gerencie carteiras de crédito, fundos de investimento e proteja o capital contra a inflação e variações cambiais.',
    features: ['Spread Optimization Engine', 'Risk-Weighted Assets (RWA)', 'Arbitrage Tracking', 'Derivatives & Hedge Tools'],
    kpis: ['Net Interest Margin', 'Capital Adequacy Ratio', 'ROE Progressivo'],
    accent: 'blue'
  },
  'activity-construction': {
    name: 'Construção',
    heroImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2000',
    body: 'Obras pesadas, licitações e gestão de riscos estruturais.',
    description: 'Participe de grandes licitações e gerencie projetos de infraestrutura de longo prazo. Equilibre custos de materiais, prazos críticos e segurança operacional.',
    features: ['Bidding & Tenders Logic', 'Critical Path Management (CPM)', 'Material Price Indexing', 'Operational Safety Metrics'],
    kpis: ['Project Completion Rate', 'Material Efficiency Index', 'Cost Overrun Risk'],
    accent: 'orange'
  }
};