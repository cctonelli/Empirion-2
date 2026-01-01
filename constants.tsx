import { Branch, BusinessPlanSection, ChampionshipTemplate } from './types';

export const COLORS = {
  primary: '#020617',
  secondary: '#1e293b',
  accent: '#3b82f6',
  gold: '#fbbf24',
  sebrae_orange: '#f97316',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
    hero: {
      title: "Empirion",
      empire: "BI Arena",
      subtitle: "A Arena Definitiva onde a Inteligência Artificial Gemini e a Estratégia Humana colidem.",
      cta: "Entrar na Arena",
      secondaryCta: "Ver Setores"
    },
    carousel: [
      { id: 1, title: "Industrial Mastery 2026", subtitle: "Inscrições abertas para a maior arena fabril do país.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000", badge: "Live Arena", link: "/solutions/open-tournaments" },
      { id: 2, title: "Strategos BP: Quiz IA", subtitle: "Crie seu plano de negócios com auditoria cognitiva Gemini.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000", badge: "New Feature", link: "/solutions/business-plan" }
    ],
    badges: [
      { id: 'm1', name: "Mestre Industrial", pts: 500, desc: "Alcance o topo do ranking TSR 5 vezes.", icon: "Factory" },
      { id: 'e1', name: "Herói ESG", pts: 300, desc: "Mantenha impacto ambiental zero por 10 rodadas.", icon: "Leaf" }
    ]
  },
  'solutions-bp': {
    title: "Strategos BP Wizard",
    subtitle: "Estruturação Profissional SEBRAE assistida por IA",
    steps: [
      { id: 0, label: 'Sumário Executivo', body: 'Visão geral do negócio e proposta de valor.' },
      { id: 1, label: 'Análise de Mercado', body: 'Estudo de concorrentes e segmentação.' },
      { id: 2, label: 'Plano de Marketing', body: 'Estratégia de canais e posicionamento.' },
      { id: 3, label: 'Plano Operacional', body: 'Layout, capacidade e processos.' },
      { id: 4, label: 'Plano Financeiro', body: 'Investimentos, DRE e fluxo de caixa.' },
      { id: 5, label: 'Cenários', body: 'Análise de riscos e cisnes negros.' }
    ]
  },
  'solutions-simulators': {
    title: "Intelligence Arenas",
    subtitle: "Escolha seu domínio estratégico",
    items: [
      { id: 'ind', label: 'Industrial', slug: 'industrial', desc: 'Produção massiva e CAPEX.', icon: 'Factory' },
      { id: 'com', label: 'Comercial', slug: 'commercial', desc: 'Varejo e satisfação SIMCO.', icon: 'ShoppingCart' },
      { id: 'ser', label: 'Serviços', slug: 'services', desc: 'Capital intelectual SISERV.', icon: 'Briefcase' },
      { id: 'agr', label: 'Agro', slug: 'agribusiness', desc: 'Ativos biológicos SIAGRO.', icon: 'Tractor' },
      { id: 'fin', label: 'Financeiro', slug: 'finance', desc: 'Liquidez e Hedge SINVEST.', icon: 'DollarSign' },
      { id: 'con', label: 'Construção', slug: 'construction', desc: 'BIM e Gestão de Obras.', icon: 'Hammer' }
    ]
  }
};

export const MENU_STRUCTURE = [
  { label: 'home', path: '/' },
  { 
    label: 'branches', 
    path: '/branches',
    sub: [
      { 
        id: 'ind_group', 
        label: 'Setor Industrial', 
        path: '/branches/industrial', 
        icon: 'Factory',
        sub: [
          { id: 'ind_master', label: 'Módulo SIND', path: '/branches/industrial' },
          { id: 'ind_agro', label: 'Módulo SIAGRO', path: '/branches/agribusiness' }
        ]
      },
      { 
        id: 'com_group', 
        label: 'Setor Comercial', 
        path: '/branches/commercial', 
        icon: 'ShoppingCart',
        sub: [
          { id: 'com_retail', label: 'Varejo SIMCO', path: '/branches/commercial' },
          { id: 'com_fin', label: 'Financeiro SINVEST', path: '/branches/finance' }
        ]
      },
      { id: 'services', label: 'Serviços SISERV', path: '/branches/services', icon: 'Briefcase' },
    ]
  },
  { 
    label: 'solutions', 
    path: '/solutions',
    sub: [
      { 
        id: 'arenas', 
        label: 'Arenas Virtuais', 
        path: '/solutions/simulators',
        sub: [
          { 
            id: 'education', 
            label: 'Educação', 
            path: '/solutions/university',
            sub: [
              { id: 'uni_pub', label: 'Universidade Pública', path: '/solutions/university' },
              { id: 'uni_priv', label: 'Escolas de Negócios', path: '/solutions/university' }
            ]
          },
          { id: 'corporate', label: 'Corporativo', path: '/solutions/corporate' },
          { id: 'individual', label: 'Individual (Solo)', path: '/solutions/individual' }
        ]
      },
      { id: 'bp_ia', label: 'Strategos Wizard (BP)', path: '/solutions/business-plan', icon: 'PenTool' },
      { 
        id: 'training', 
        label: 'Academy', 
        path: '/solutions/training-online',
        sub: [
          { id: 'online', label: 'Training Online', path: '/solutions/training-online' },
          { id: 'corp_train', label: 'Treinamento In-Company', path: '/solutions/training-corporate' }
        ]
      },
    ]
  },
  { label: 'features', path: '/features' },
  { label: 'blog', path: '/blog' },
  { label: 'contact', path: '/contact' }
];

export const MOCK_ONGOING_CHAMPIONSHIPS = [
  { id: 'c1', name: "Industrial Mastery 2026", branch: "Industrial", round: "5/12", teams: 14, leader: "Team Alpha (TSR 32.4%)", status: "live" },
  { id: 'c2', name: "Agro Global Challenge", branch: "Agronegócio", round: "3/10", teams: 8, leader: "BioCore (TSR 28.1%)", status: "live" }
];

export const LANDING_PAGE_DATA = {
  hero: {
    title: "Empirion – The Strategic Command v5.5 GOLD",
    subtitle: "A Arena Definitiva onde a Inteligência Artificial Gemini e a Estratégia Humana colidem.",
    cta: "Entrar na Arena",
    secondaryCta: "Conhecer Setores"
  },
  branchesOverview: [
    { id: 'ind', slug: 'industrial', bg: 'bg-blue-600/10', color: 'text-blue-400', icon: 'Factory' },
    { id: 'com', slug: 'commercial', bg: 'bg-emerald-600/10', color: 'text-emerald-400', icon: 'ShoppingCart' },
    { id: 'ser', slug: 'services', bg: 'bg-indigo-600/10', color: 'text-indigo-400', icon: 'Briefcase' },
    { id: 'agr', slug: 'agribusiness', bg: 'bg-amber-600/10', color: 'text-amber-400', icon: 'Tractor' },
    { id: 'fin', slug: 'finance', bg: 'bg-rose-600/10', color: 'text-rose-400', icon: 'DollarSign' },
    { id: 'con', slug: 'construction', bg: 'bg-orange-600/10', color: 'text-orange-400', icon: 'Hammer' }
  ],
  branchesDetailData: {
    industrial: { features: ['Manufatura 4.0', 'Supply Chain IA'], kpis: ['OEE', 'Markup'] },
    commercial: { features: ['Omnichannel', 'Mix'], kpis: ['Share', 'CAC'] },
    services: { features: ['Corpo Técnico', 'Qualidade'], kpis: ['NPS', 'Utilização'] },
    agribusiness: { features: ['Safra', 'Hedge'], kpis: ['Yield', 'EBITDA'] },
    finance: { features: ['Giro', 'Risco'], kpis: ['ROE', 'Liquidez'] },
    construction: { features: ['BIM', 'Insumos'], kpis: ['Evolução', 'Margem'] }
  }
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'ind-master',
    name: 'Industrial Mastery 2026',
    branch: 'industrial',
    sector: 'Manufatura Pesada',
    description: 'A arena definitiva industrial.',
    is_public: true,
    config: {
      currency: 'BRL', round_frequency_days: 7, total_rounds: 12, sales_mode: 'hybrid',
      scenario_type: 'simulated', transparency_level: 'medium', team_fee: 500, community_enabled: true, regionsCount: 9
    },
    initial_financials: {
        balance_sheet: { 
            current_assets: { cash: 1000000, accounts_receivable: 1823735, inventory_raw_a: 0, inventory_raw_b: 0, inventory_finished: 0, prepaid_expenses: 0 }, 
            non_current_assets: { pp_e: { machinery: 2360000, buildings: 2793205, land: 1200000 }, accumulated_depreciation: 0 }, 
            total_assets: 9176940 
        },
        liabilities_equity: { 
            current_liabilities: { accounts_payable: 300000, short_term_loans: 0, taxes_payable: 0, dividends_payable: 0 }, 
            non_current_liabilities: { long_term_loans: 1000000 },
            equity: { capital_stock: 7876940, retained_earnings: 0 }, 
            total_liabilities_equity: 9176940 
        }
    },
    products: [{ name: 'Core', unit_cost_base: 180, suggested_price: 340, initial_stock: 30000, max_capacity: 50000 }],
    resources: { water_consumption_monthly: 1000, energy_consumption_monthly: 5000, co2_emissions_monthly: 200 },
    market_indicators: {
        inflation_rate: 4, interest_rate_tr: 12, supplier_interest: 15, demand_regions: [12000], machine_alfa_price: 100000, average_salary: 1300,
        raw_a_price: 15, raw_b_price: 10, distribution_cost: 2, marketing_cost_unit: 10200, machine_beta_price: 150000, machine_gama_price: 200000
    }
  }
];

export const BRANCH_CONFIGS: Record<Branch, { label: string; icon: string }> = {
  industrial: { label: 'Industrial', icon: '🏭' },
  commercial: { label: 'Comercial', icon: '🛒' },
  services: { label: 'Serviços', icon: '💼' },
  agribusiness: { label: 'Agronegócio', icon: '🚜' },
  finance: { label: 'Financeiro', icon: '💰' },
  construction: { label: 'Construção', icon: '🔨' },
};

export const BUSINESS_PLAN_STRUCTURE: BusinessPlanSection[] = [
  {
    id: 'executive_summary',
    title: 'Sumário Executivo',
    fields: [
      { id: 'resumo', label: 'Resumo do Negócio', type: 'textarea', placeholder: 'Conceito...', value: '', aiPrompt: 'Resuma o plano em tom atraente.' },
      { id: 'missao', label: 'Missão', type: 'textarea', placeholder: 'Razão...', value: '', aiPrompt: 'Sugerir missão.' }
    ]
  }
];