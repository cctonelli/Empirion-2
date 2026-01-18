
import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit, GazetaMode, AccountNode, RegionType, AnalysisSource } from './types';

export const APP_VERSION = "v13.2.0-Oracle-Gold";
export const BUILD_DATE = "08/01/2026";
export const PROTOCOL_NODE = "Node 08-STREET-INDUSTRIAL-STABLE";
export const DEFAULT_INITIAL_SHARE_PRICE = 1.00;
export const DEFAULT_TOTAL_SHARES = 5000000; 

/**
 * Restored INITIAL_INDUSTRIAL_FINANCIALS for simulation engine
 */
export const INITIAL_INDUSTRIAL_FINANCIALS = {
  balance_sheet: {
    assets: { 
      current: { cash: 1466605, receivables: 1823735 }, 
      total: 9176940 
    },
    equity: { 
      total: 5055447, 
      capital_social: 5000000, 
      accumulated_profit: 55447 
    },
    liabilities: { 
      current: 4121493, 
      total_debt: 4121493 
    }
  }
};

/**
 * Restored INITIAL_FINANCIAL_TREE for financial editors
 */
export const INITIAL_FINANCIAL_TREE = {
  balance_sheet: [
    { 
      id: 'assets', label: 'ATIVO TOTAL', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
        { 
          id: 'assets.current', label: 'ATIVO CIRCULANTE', value: 3290340, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Disponibilidades (Caixa/Bancos)', value: 1466605, type: 'asset', isEditable: true }
          ]
        }
      ]
    },
    { 
      id: 'liabilities', label: 'PASSIVO + PL', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
        { id: 'liabilities.current', label: 'PASSIVO CIRCULANTE', value: 4121493, type: 'totalizer', children: [] },
        { id: 'equity', label: 'PATRIMÔNIO LÍQUIDO', value: 5055447, type: 'totalizer', children: [] }
      ]
    }
  ],
  dre: [
    { id: 'rev', label: 'RECEITA BRUTA', value: 3322735, type: 'revenue', isEditable: true, children: [] },
    { id: 'exp', label: 'CUSTOS E DESPESAS', value: 3248807, type: 'totalizer', children: [] }
  ]
};

/**
 * Restored CHAMPIONSHIP_TEMPLATES for wizards
 */
export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  { id: 'tpl-industrial', name: 'Industrial Master', description: 'Simulação completa de manufatura e CapEx.', branch: 'industrial' },
  { id: 'tpl-commercial', name: 'Global Retail', description: 'Foco em logística e marketing de varejo.', branch: 'commercial' }
];

/**
 * Restored MENU_STRUCTURE for header and CMS
 */
export const MENU_STRUCTURE = [
  { label: 'Início', path: '/' },
  { 
    label: 'ramos', path: '/solutions/simulators', sub: [
      { id: 'ind', label: 'Industrial', path: '/branches/industrial', icon: 'Factory', desc: 'Produção $9M Assets' },
      { id: 'com', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart', desc: 'Varejo Híbrido' }
    ]
  },
  { 
    label: 'Soluções', path: '/solutions', sub: [
      { id: 'sim', label: 'Simuladores', path: '/solutions/simulators', icon: 'Cpu', desc: 'Engine v6.0' },
      { id: 'plan', label: 'Plano de Negócios', path: '/solutions/business-plan', icon: 'PenTool', desc: 'Oracle Wizard' }
    ]
  },
  { label: 'Funcionalidades', path: '/features' },
  { label: 'Conteúdos', path: '/blog' },
  { label: 'Contato', path: '/contact' }
];

/**
 * Restored DEFAULT_PAGE_CONTENT for landing and static pages
 */
export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': { 
    title: 'Forje Seu Império', 
    subtitle: 'A arena definitiva estrategos IA', 
    carousel: [
      { id: '1', title: 'Domine a Indústria', subtitle: 'Simulações de alta fidelidade', image: 'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1', badge: 'v13.2 Gold', link: '/branches/industrial' }
    ] 
  },
  'solutions-bp': { 
    title: 'Oracle Progress Plan', 
    subtitle: 'Arquitetura Estratégica', 
    steps: [
      { id: 0, label: 'Missão e Visão' },
      { id: 1, label: 'Análise de Mercado' },
      { id: 2, label: 'Estratégia de Marketing' },
      { id: 3, label: 'Operações' },
      { id: 4, label: 'Projeções Financeiras' }
    ]
  },
  'rewards': { 
    subtitle: 'Elite Prestige Node', 
    tiers: [
      { name: 'Bronze', pts: '0', color: 'text-amber-700' },
      { name: 'Silver', pts: '1.000', color: 'text-slate-400' },
      { name: 'Gold', pts: '5.000', color: 'text-amber-400' },
      { name: 'Elite Oracle', pts: '15.000', color: 'text-blue-400' }
    ], 
    accumulation: [
      { action: 'Participação', val: '50 pts' },
      { action: 'Vitória Arena', val: '500 pts' }
    ] 
  },
  'features': { 
    items: [
      { id: '1', title: 'Turnover Realtime', body: 'Processamento instantâneo de rounds.' },
      { id: '2', title: 'Audit Master', body: 'Auditoria completa via Oráculo IA.' }
    ] 
  },
  'blog': { 
    subtitle: 'Official Intelligence Feed', 
    items: [
      { id: '1', title: 'A Nova Era da Simulação Industrial', date: '08/01/2026', author: 'Oracle Core' }
    ] 
  },
  'solutions-simulators': { 
    title: 'Elite Simulators', 
    subtitle: 'Pro Experience', 
    items: [
      { id: 'ind', label: 'Industrial Master', desc: 'Produção $9M Assets', icon: 'Factory', slug: 'industrial' },
      { id: 'com', label: 'Commercial Oracle', desc: 'Varejo Híbrido', icon: 'ShoppingCart', slug: 'commercial' }
    ] 
  },
  'solutions-training': { 
    tracks: [
      { id: 'online', label: 'Online Master', body: 'Treinamento digital para indivíduos.' },
      { id: 'corp', label: 'Corporate Elite', body: 'Simulação in-company para times executivos.' }
    ] 
  },
  'branch-industrial': { name: 'Industrial', body: 'Manufatura de alta performance', features: ['Gestão de CapEx', 'Simulação de Produção'], kpis: ['OEE', 'EBITDA'] },
  'solution-university': { title: 'University', body: 'Academic strategic training', icon: 'Users' },
  'solution-corporate': { title: 'Corporate', body: 'Enterprise elite simulation', icon: 'Shield' },
  'solution-individual': { title: 'Individual', body: 'Personal strategy development', icon: 'Brain' }
};

/**
 * Restored getPageContent helper function
 */
export const getPageContent = (slug: string) => DEFAULT_PAGE_CONTENT[slug] || null;

export const DEFAULT_MACRO: MacroIndicators = {
  ice: 3.0,
  demand_variation: 0.0,
  inflation_rate: 1.0,
  customer_default_rate: 2.6,
  interest_rate_tr: 2.0,
  supplier_interest: 1.5,
  sales_interest_rate: 1.5,
  tax_rate_ir: 15.0,
  late_penalty_rate: 5.0,
  machine_sale_discount: 10.0,
  
  raw_material_a_adjust: 1.0,
  raw_material_b_adjust: 1.0,
  marketing_campaign_adjust: 2.0,
  distribution_cost_adjust: 1.0,
  storage_cost_adjust: 2.0,
  machine_alpha_price_adjust: 0.0,
  machine_beta_price_adjust: 0.0,
  machine_gamma_price_adjust: 0.0,

  allow_machine_sale: false,
  labor_productivity: 1.0,
  labor_availability: 'MEDIA',

  prices: {
    mp_a: 20.00,
    mp_b: 40.00,
    distribution_unit: 50.00,
    marketing_campaign: 10000.00
  },
  machinery_values: {
    alfa: 500000,
    beta: 1500000,
    gama: 3000000
  },
  hr_base: {
    salary: 1300.00,
    training: 0,
    profit_sharing: 0,
    misc: 0
  }
};
