
import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit, GazetaMode, AccountNode, RegionType, AnalysisSource, MachineSpec, InitialMachine } from './types';

export const APP_VERSION = "v14.0.0-Oracle-Master";
export const BUILD_DATE = "09/01/2026";
export const PROTOCOL_NODE = "Node 08-STREET-INDUSTRIAL-MASTER";
export const DEFAULT_INITIAL_SHARE_PRICE = 60.09; 
export const DEFAULT_TOTAL_SHARES = 5000000; 

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
    cpv: 2278180,
    opex: 917582,
    financial_revenue: 0,
    financial_expense: 40000,
    tax: 13045,
    net_profit: 73928
  }
};

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
        { id: 'opex.sales', label: 'VENDAS', value: 802702, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'opex.adm', label: 'ADMINISTRATIVAS', value: 114880, type: 'expense', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'operating_profit', label: '(=) LUCRO OPERACIONAL', value: 126973, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'fin_rev_group', label: '( + ) RECEITAS FINANCEIRAS', value: 0, type: 'totalizer', children: [
        { id: 'fin_rev.yields', label: 'RENDIMENTOS DE APLICAÇÕES FINANCEIRAS', value: 0, type: 'revenue', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'fin_exp_group', label: '( - ) DESPESAS FINANCEIRAS', value: -40000, type: 'totalizer', children: [
        { id: 'fin_exp.liquid', label: 'FINANCEIRAS LÍQUIDAS', value: 40000, type: 'expense', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'lair', label: '(=) LAIR - LUCRO LÍQUIDO ANTES DO IR', value: 86973, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'tax_prov', label: '( - ) PROVISÃO PARA O IR', value: -13045, type: 'expense', isEditable: true, isTemplateAccount: true },
    { id: 'net_profit_after_tax', label: '(=) LUCRO LÍQUIDO APÓS O I. R.', value: 73928, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'ppr', label: '( - ) PPR - PARTICIPAÇÃO NO LUCRO', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
    { id: 'final_profit', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 73928, type: 'totalizer', isReadOnly: true, children: [] }
  ]
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  { id: 'tpl-industrial', name: 'Industrial Master', description: 'Simulação completa de manufatura e CapEx.', branch: 'industrial' },
  { id: 'tpl-commercial', name: 'Global Retail', description: 'Foco em logística e marketing de varejo.', branch: 'commercial' }
];

export const DEFAULT_MACRO: MacroIndicators = {
  ice: 3.0,
  demand_variation: 0.0,
  inflation_rate: 1.0,
  customer_default_rate: 2.6,
  interest_rate_tr: 2.0,
  supplier_interest: 1.5,
  sales_interest_rate: 0.75, 
  tax_rate_ir: 15.0,
  late_penalty_rate: 5.0,
  machine_sale_discount: 10.0,
  exchange_rates: { BRL: 1.0, USD: 5.25, EUR: 5.60, GBP: 6.50 },
  dividend_percent: 10.0,
  
  raw_material_a_adjust: 1.0,
  raw_material_b_adjust: 1.0,
  marketing_campaign_adjust: 2.0,
  distribution_cost_adjust: 1.0,
  storage_cost_adjust: 2.0,
  machine_alpha_price_adjust: 1.0,
  machine_beta_price_adjust: 1.0,
  machine_gamma_price_adjust: 1.0,
  salary_adjust: 1.0,
  
  allow_machine_sale: false,
  labor_productivity: 1.0,
  labor_availability: 'MEDIA',
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
  maintenance_physics: { alpha: 0.05, beta: 1.2, gamma: 0.5 },
  prices: { 
    mp_a: 20.00, 
    mp_b: 40.00, 
    distribution_unit: 50.00, 
    marketing_campaign: 10000.00,
    storage_mp: 1.40,
    storage_finished: 20.00
  },
  machinery_values: { alfa: 500000, beta: 1500000, gama: 3000000 },
  staffing: {
    admin: { count: 10, salaries: 4 },
    sales: { count: 20, salaries: 4 },
    production: { count: 470, salaries: 1 }
  },
  hr_base: { salary: 1313.00, training: 0, profit_sharing: 0, misc: 0 }
};

export const DEFAULT_INDUSTRIAL_CHRONOGRAM: Record<number, Partial<MacroIndicators>> = {
  0: { 
    ice: 3.0, demand_variation: 0.0, inflation_rate: 1.0, customer_default_rate: 2.6, interest_rate_tr: 2.0, supplier_interest: 1.5, sales_interest_rate: 1.5, allow_machine_sale: false,
    raw_material_a_adjust: 0, machine_alpha_price_adjust: 0, machine_beta_price_adjust: 0, machine_gamma_price_adjust: 0, marketing_campaign_adjust: 0, distribution_cost_adjust: 0, storage_cost_adjust: 0
  },
  1: { 
    ice: 4.0, demand_variation: 6.7, inflation_rate: 2.0, customer_default_rate: 2.7, interest_rate_tr: 3.0, supplier_interest: 2.0, sales_interest_rate: 2.4, allow_machine_sale: false,
    raw_material_a_adjust: 1.0, machine_alpha_price_adjust: 1.0, machine_beta_price_adjust: 1.0, machine_gamma_price_adjust: 1.0, marketing_campaign_adjust: 2.0, distribution_cost_adjust: 1.0, storage_cost_adjust: 2.0
  },
  2: { 
    ice: 5.0, demand_variation: -6.3, inflation_rate: 3.0, customer_default_rate: 2.7, interest_rate_tr: 3.0, supplier_interest: 3.0, sales_interest_rate: 3.0, allow_machine_sale: true,
    raw_material_a_adjust: 2.0, machine_alpha_price_adjust: 2.0, machine_beta_price_adjust: 2.0, machine_gamma_price_adjust: 1.0, marketing_campaign_adjust: 2.0, distribution_cost_adjust: 3.0, storage_cost_adjust: 2.0
  }
};

/**
 * Fix: Added MENU_STRUCTURE export to satisfy component requirements.
 */
export const MENU_STRUCTURE = [
  { label: 'Início', path: '/' },
  { 
    label: 'Ramos', 
    path: '/solutions/simulators',
    sub: [
      { id: 'ind', label: 'Industrial', path: '/branches/industrial', icon: 'Factory', desc: 'Manufatura e CapEx' },
      { id: 'com', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart', desc: 'Varejo e Logística' },
      { id: 'srv', label: 'Serviços', path: '/branches/services', icon: 'Briefcase', desc: 'Capital Intelectual' },
      { id: 'agr', label: 'Agronegócio', path: '/branches/agribusiness', icon: 'Tractor', desc: 'Cadeia Produtiva' },
      { id: 'fin', label: 'Financeiro', path: '/branches/finance', icon: 'DollarSign', desc: 'Bancos e Fintechs' },
      { id: 'con', label: 'Construção', path: '/branches/construction', icon: 'Hammer', desc: 'Obras e Infra' },
    ]
  },
  {
    label: 'Soluções',
    path: '#',
    sub: [
      { id: 'sim', label: 'Simuladores', path: '/solutions/simulators', icon: 'Cpu', desc: 'Nodos de Treinamento' },
      { id: 'trn', label: 'Torneios Abertos', path: '/solutions/open-tournaments', icon: 'Trophy', desc: 'Arena Global' },
      { id: 'bpw', label: 'Plano de Negócios', path: '/solutions/business-plan', icon: 'PenTool', desc: 'Wizard Estratégico' },
      { id: 'edu', label: 'Educação / IES', path: '/solutions/university', icon: 'GraduationCap', desc: 'Portal Acadêmico' },
    ]
  },
  { label: 'Funcionalidades', path: '/features' },
  { label: 'Conteúdos', path: '/blog' },
  { label: 'Contato', path: '/contact' },
];

/**
 * Fix: Added DEFAULT_PAGE_CONTENT export to satisfy landing and solution pages.
 */
export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  landing: {
    hero: { title: "Forje Seu Império com Insight Estratégico IA", subtitle: "A arena definitiva onde inteligência neural e estratégia empresarial colidem." }
  },
  'solutions-bp': {
    title: "Strategos Business Architect",
    subtitle: "Estruture sua visão empresarial com assistência neural de alta fidelidade.",
    steps: [
      { id: 0, label: "Sumário Executivo" },
      { id: 1, label: "Análise de Mercado" },
      { id: 2, label: "Plano de Marketing" },
      { id: 3, label: "Plano Operacional" },
      { id: 4, label: "Plano Financeiro" }
    ]
  },
  rewards: {
    subtitle: "Sua excelência estratégica é convertida em ativos reais de plataforma.",
    tiers: [
      { name: 'BRONZE', pts: '0', color: 'text-orange-400' },
      { name: 'SILVER', pts: '5.000', color: 'text-slate-300' },
      { name: 'GOLD', pts: '15.000', color: 'text-amber-400' },
      { name: 'DIAMOND', pts: '50.000', color: 'text-blue-300' },
    ],
    accumulation: [
      { action: 'Participação Arena', val: '+100 pts' },
      { action: 'Vitória Ciclo', val: '+500 pts' },
      { action: 'Rating AAA', val: '+1.000 pts' },
      { action: 'Indicação Tutor', val: '+200 pts' },
    ]
  },
  features: {
    items: [
      { id: 'f1', title: 'Motor Oracle v6.0', body: 'Processamento de elasticidade-preço com precisão militar.' },
      { id: 'f2', title: 'IA Gemini 3 Pro', body: 'Raciocínio profundo para auditoria de planos e decisões.' },
      { id: 'f3', title: 'Real-time Sync', body: 'Sincronização instantânea via Supabase para simulações multiplayer.' },
      { id: 'f4', title: 'Global Grounding', body: 'Conectividade com dados reais do Google Search para cenários dinâmicos.' },
      { id: 'f5', title: 'Arquitetura Nodal', body: 'Suporte a múltiplas regiões e moedas em uma única arena.' },
      { id: 'f6', title: 'Audit Log Full', body: 'Rastreabilidade total de cada alteração feita pelas equipes.' }
    ]
  },
  blog: {
    subtitle: "Insights técnicos e táticos do Strategos Command Center.",
    items: [
      { id: 1, title: "O Impacto da Inflação no CAPEX Industrial", date: "02/01/2026", author: "Strategos Core" },
      { id: 2, title: "Maximizando o TSR em Mercados Voláteis", date: "01/01/2026", author: "Oracle Node 08" }
    ]
  },
  'solutions-simulators': {
    title: "Nodos de Simulação",
    subtitle: "Escolha seu setor e inicie a orquestração do seu império.",
    items: [
      { id: 'ind', label: 'Industrial', slug: 'industrial', icon: 'Factory', desc: 'Foco em Manufatura, CapEx e Escala.' },
      { id: 'com', label: 'Comercial', slug: 'commercial', icon: 'ShoppingCart', desc: 'Gestão de Varejo, Logística e Prazos.' },
      { id: 'srv', label: 'Serviços', slug: 'services', icon: 'Briefcase', desc: 'Foco em Capital Humano e Qualidade.' },
      { id: 'agr', label: 'Agribusiness', slug: 'agribusiness', icon: 'Tractor', desc: 'Gestão de Commodities e Clima.' },
      { id: 'fin', label: 'Financeiro', slug: 'finance', icon: 'DollarSign', desc: 'Spread, Risco e Liquidez Bancária.' },
      { id: 'con', label: 'Construção', slug: 'construction', icon: 'Hammer', desc: 'Grandes Obras e Fluxo de Insumos.' }
    ]
  },
  'solutions-training': {
    tracks: [
      { id: 'online', label: 'Online Academy', body: 'Treinamento remoto com mentor IA 24/7.' },
      { id: 'corp', label: 'Corporate Elite', body: 'Workshops intensivos para liderança executiva.' }
    ]
  },
  'branch-industrial': {
    name: "Industrial",
    heroImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000",
    body: "Domine a cadeia de produção e ativos fixos.",
    description: "O modo industrial desafia a gestão de máquinas (CapEx), mão de obra e eficiência de transformação.",
    features: ["Gestão de Depreciação", "Manutenção Preventiva", "Turnos de Trabalho"],
    kpis: ["ROE", "Giro de Ativos", "Margem de Contribuição"],
    accent: "orange"
  },
  'branch-commercial': {
    name: "Comercial",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000",
    body: "Varejo global e logística de alta performance.",
    description: "Foco total em canais de distribuição, marketing regional e gestão de estoques de revenda.",
    features: ["Mix de Produtos", "Elasticidade de Preço", "Logística Regional"],
    kpis: ["Market Share", "Prazos Médios", "Giro de Estoque"],
    accent: "blue"
  },
  'solution-university': {
    title: "Portal Acadêmico",
    icon: 'Users',
    body: "Ambiente gamificado para instituições de ensino superior.",
    accent: "blue"
  },
  'solution-corporate': {
    title: "Arena Corporativa",
    icon: 'Shield',
    body: "Simulações customizadas para treinamento de liderança e seleção.",
    accent: "indigo"
  },
  'solution-individual': {
    title: "Individual Strategos",
    icon: 'Brain',
    body: "Desenvolva sua visão estratégica competindo contra bots de elite.",
    accent: "emerald"
  }
};

/**
 * Fix: Added getPageContent helper to fix errors in ActivityDetail.
 */
export const getPageContent = (slug: string) => {
  return DEFAULT_PAGE_CONTENT[`branch-${slug}`] || DEFAULT_PAGE_CONTENT[`activity-${slug}`] || null;
};
