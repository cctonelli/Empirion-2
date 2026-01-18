import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit, GazetaMode, AccountNode, RegionType, AnalysisSource, MachineSpec, InitialMachine } from './types';

export const APP_VERSION = "v13.2.0-Oracle-Gold";
export const BUILD_DATE = "08/01/2026";
export const PROTOCOL_NODE = "Node 08-STREET-INDUSTRIAL-STABLE";
export const DEFAULT_INITIAL_SHARE_PRICE = 1.00;
export const DEFAULT_TOTAL_SHARES = 5000000; 

/**
 * Restored INITIAL_INDUSTRIAL_FINANCIALS for simulation engine
 * Baseado no Período 0 do PDF
 */
export const INITIAL_INDUSTRIAL_FINANCIALS = {
  balance_sheet: {
    assets: { 
      current: { cash: 0, receivables: 1823735, inventory_mpa: 628545, inventory_mpb: 838060 }, 
      total: 9176940 
    },
    equity: { 
      total: 5055447, 
      capital_social: 5000000, 
      accumulated_profit: 55447 
    },
    liabilities: { 
      current: 2621493, 
      long_term: 1500000,
      total_debt: 4121493 
    }
  },
  dre: {
    revenue: 3322735,
    net_profit: 73928
  }
};

/**
 * FIXED INITIAL_FINANCIAL_TREE v13.2 GOLD
 * Cópia fiel da TELA 4 - Período 0
 */
export const INITIAL_FINANCIAL_TREE = {
  balance_sheet: [
    { 
      id: 'assets', label: 'ATIVO', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
        { 
          id: 'assets.current', label: 'ATIVO CIRCULANTE', value: 3290340, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa', value: 0, type: 'asset', isEditable: true, isTemplateAccount: true },
            { id: 'assets.current.banks', label: 'Bancos', value: 0, type: 'asset', isEditable: true, isTemplateAccount: true },
            { id: 'assets.current.apps', label: 'Aplicação', value: 0, type: 'asset', isEditable: true, isTemplateAccount: true },
            { id: 'assets.current.clients', label: 'Clientes', value: 1823735, type: 'asset', isEditable: true, isTemplateAccount: true },
            { id: 'assets.current.stock', label: 'ESTOQUE', value: 1466605, type: 'totalizer', children: [
                { id: 'assets.current.stock.finished', label: 'Estoque Prod. Acabado ALPHA', value: 0, type: 'asset', isEditable: true, isTemplateAccount: true },
                { id: 'assets.current.stock.mpa', label: 'Estoque MP A', value: 628545, type: 'asset', isEditable: true, isTemplateAccount: true },
                { id: 'assets.current.stock.mpb', label: 'Estoque MP B', value: 838060, type: 'asset', isEditable: true, isTemplateAccount: true }
            ]}
          ]
        },
        {
          id: 'assets.noncurrent', label: 'ATIVO NÃO CIRCULANTE', value: 5886600, type: 'totalizer', children: [
            { id: 'assets.noncurrent.longterm', label: 'REALIZÁVEL À LONGO PRAZO', value: 0, type: 'totalizer', children: [
                { id: 'assets.noncurrent.longterm.sale', label: 'Venda de ativo imobilizado', value: 0, type: 'asset', isEditable: true, isTemplateAccount: true }
            ]},
            { id: 'assets.noncurrent.fixed', label: 'IMOBILIZADO', value: 5886600, type: 'totalizer', children: [
                { id: 'assets.noncurrent.fixed.machines', label: 'Máquinas', value: 2360000, type: 'asset', isEditable: true, isTemplateAccount: true },
                { id: 'assets.noncurrent.fixed.dep_machines', label: '(-) Depreciação acumulada de equipamentos', value: -811500, type: 'asset', isEditable: true, isTemplateAccount: true },
                { id: 'assets.noncurrent.fixed.land', label: 'Terrenos', value: 1200000, type: 'asset', isEditable: true, isTemplateAccount: true },
                { id: 'assets.noncurrent.fixed.buildings', label: 'Prédios e Instalações', value: 5440000, type: 'asset', isEditable: true, isTemplateAccount: true },
                { id: 'assets.noncurrent.fixed.dep_buildings', label: '(-) Depreciação acumulada de prédios e instalações', value: -2301900, type: 'asset', isEditable: true, isTemplateAccount: true }
            ]}
          ]
        }
      ]
    },
    { 
      id: 'liabilities_pl', label: 'PASSIVO + PL', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
        { 
          id: 'liabilities.current', label: 'PASSIVO CIRCULANTE', value: 2621493, type: 'totalizer', children: [
            { id: 'liabilities.current.suppliers', label: 'Fornecedores', value: 717605, type: 'liability', isEditable: true, isTemplateAccount: true },
            { id: 'liabilities.current.taxes', label: 'Imposto de Renda a pagar', value: 13045, type: 'liability', isEditable: true, isTemplateAccount: true },
            { id: 'liabilities.current.sharing', label: 'Participações a pagar', value: 0, type: 'liability', isEditable: true, isTemplateAccount: true },
            { id: 'liabilities.current.divs', label: 'Dividendos a pagar', value: 18481, type: 'liability', isEditable: true, isTemplateAccount: true },
            { id: 'liabilities.current.loans_st', label: 'Empréstimos de curto prazo', value: 1872362, type: 'liability', isEditable: true, isTemplateAccount: true }
          ] 
        },
        {
          id: 'liabilities.longterm', label: 'PASSIVO NÃO CIRCULANTE', value: 1500000, type: 'totalizer', children: [
            { id: 'liabilities.longterm.loans_lt', label: 'Empréstimos de longo prazo', value: 1500000, type: 'liability', isEditable: true, isTemplateAccount: true }
          ]
        },
        { 
          id: 'equity', label: 'PATRIMÔNIO LÍQUIDO', value: 5055447, type: 'totalizer', children: [
            { id: 'equity.capital', label: 'Capital Social', value: 5000000, type: 'equity', isEditable: true, isTemplateAccount: true },
            { id: 'equity.profit', label: 'Lucros Acumulados no ano', value: 55447, type: 'equity', isEditable: true, isTemplateAccount: true }
          ] 
        }
      ]
    }
  ],
  dre: [
    { id: 'rev', label: 'RECEITA DE VENDAS', value: 3322735, type: 'revenue', isEditable: true, isTemplateAccount: true },
    { id: 'cpv', label: '( - ) CUSTO PROD. VENDIDO - CPV', value: -2278180, type: 'expense', isEditable: true, isTemplateAccount: true },
    { id: 'gross_profit', label: '( = ) LUCRO BRUTO', value: 1044555, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'opex', label: '( - ) DESPESAS OPERACIONAIS', value: -917582, type: 'totalizer', children: [
        { id: 'opex.prod', label: 'PRODUÇÃO', value: 212100, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'opex.sales', label: 'VENDAS', value: 802702, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'opex.adm', label: 'ADMINISTRATIVAS', value: 114880, type: 'expense', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'operating_profit', label: '(=) LUCRO OPERACIONAL', value: 126973, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'fin_rev', label: '( + ) RECEITAS FINANCEIRAS', value: 0, type: 'revenue', isEditable: true, isTemplateAccount: true },
    { id: 'fin_exp', label: '( - ) DESPESAS FINANCEIRAS', value: -40000, type: 'totalizer', children: [
        { id: 'fin_exp.liquid', label: 'FINANCEIRAS LÍQUIDAS', value: 40000, type: 'expense', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'lair', label: '(=) LAIR - LUCRO LÍQUIDO ANTES DO IR', value: 86973, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'tax_prov', label: '( - ) PROVISÃO PARA O IR', value: -13045, type: 'expense', isEditable: true, isTemplateAccount: true },
    { id: 'net_profit_after_tax', label: '(=) LUCRO LÍQUIDO APÓS O I. R.', value: 73928, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'ppr', label: '( - ) PPR - PARTICIPAÇÃO NO LUCRO', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
    { id: 'final_profit', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 73928, type: 'totalizer', isReadOnly: true, children: [] }
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
  salary_adjust: 1.0,

  allow_machine_sale: false,
  labor_productivity: 1.0,
  labor_availability: 'MEDIA',

  // Machinery Specs v13.2
  machine_specs: {
    alfa: { model: 'alfa', initial_value: 500000, production_capacity: 2000, operators_required: 94, depreciation_rate: 0.025 },
    beta: { model: 'beta', initial_value: 1500000, production_capacity: 6000, operators_required: 235, depreciation_rate: 0.025 },
    gama: { model: 'gama', initial_value: 3000000, production_capacity: 12000, operators_required: 445, depreciation_rate: 0.025 }
  },
  initial_machinery_mix: [
    { id: 'm1', model: 'alfa', age: 6 },
    { id: 'm2', model: 'alfa', age: 11 },
    { id: 'm3', model: 'alfa', age: 11 },
    { id: 'm4', model: 'alfa', age: 21 },
    { id: 'm5', model: 'alfa', age: 21 }
  ],
  maintenance_physics: {
    alpha: 0.05,
    beta: 1.2,
    gamma: 0.5
  },

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