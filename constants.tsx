
import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit, GazetaMode, AccountNode, RegionType, AnalysisSource, MachineSpec, InitialMachine, MenuItemConfig } from './types';

export const APP_VERSION = "v14.2.0-Oracle-Master";
export const BUILD_DATE = "10/01/2026";
export const PROTOCOL_NODE = "Node 08-STREET-INDUSTRIAL-MASTER";
export const DEFAULT_INITIAL_SHARE_PRICE = 60.09; 
export const DEFAULT_TOTAL_SHARES = 5000000; 

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [];

export const MENU_STRUCTURE: MenuItemConfig[] = [
  { label: 'Início', path: '/' },
  { label: 'Ramos', path: '/branches', sub: [
    { id: 'ind', label: 'Industrial', path: '/branches/industrial', icon: 'Factory' },
    { id: 'com', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart' },
    { id: 'svc', label: 'Serviços', path: '/branches/services', icon: 'Briefcase' },
    { id: 'agr', label: 'Agronegócio', path: '/branches/agribusiness', icon: 'Tractor' },
    { id: 'fin', label: 'Financeiro', path: '/branches/finance', icon: 'DollarSign' },
    { id: 'con', label: 'Construção', path: '/branches/construction', icon: 'Hammer' },
  ]},
  { label: 'Soluções', path: '/solutions', sub: [
    { id: 'sim', label: 'Simuladores', path: '/solutions/simulators', icon: 'Cpu' },
    { id: 'trn', label: 'Torneios Abertos', path: '/solutions/open-tournaments', icon: 'Trophy' },
    { id: 'bpn', label: 'Plano de Negócios', path: '/solutions/business-plan', icon: 'PenTool' },
  ]},
  { label: 'Funcionalidades', path: '/features' },
  { label: 'Conteúdos', path: '/blog' },
  { label: 'Contato', path: '/contact' },
];

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
    title: "Empirion",
    subtitle: "Strategic Simulation",
    hero: { title: "Forje Seu Império", subtitle: "Strategos IA" }
  },
  'solutions-bp': { 
    title: "Business Plan", 
    subtitle: "Estratégia Guiada",
    steps: [
      { id: 0, label: "Visão Geral" },
      { id: 1, label: "Mercado" },
      { id: 2, label: "Operações" },
      { id: 3, label: "RH" },
      { id: 4, label: "Financeiro" }
    ]
  },
  'solutions-simulators': { 
    title: "Simuladores", 
    subtitle: "Nodos de Elite",
    items: [
      { id: 'ind', label: "Industrial", desc: "Produção $9M Assets", slug: 'industrial', icon: 'Factory' },
      { id: 'com', label: "Comercial", desc: "Varejo Híbrido", slug: 'commercial', icon: 'ShoppingCart' }
    ]
  },
  'solutions-training': { 
    tracks: [
      { id: 'online', label: "Online", body: "Treinamento remoto" },
      { id: 'corp', label: "Corporativo", body: "Treinamento in-company" }
    ] 
  },
  'features': { 
    items: [
      { id: 'f1', title: "Motor Realtime", body: "Sincronização instantânea" },
      { id: 'f2', title: "IA Strategos", body: "Mentoria via Gemini" }
    ] 
  },
  'blog': { 
    items: [
      { id: 'b1', title: "Lançamento v14", date: "01/01/2026", author: "Strategos" }
    ] 
  },
  'rewards': { 
    tiers: [
      { name: "Bronze", pts: 0, color: "text-orange-500" },
      { name: "Prata", pts: 1000, color: "text-slate-400" },
      { name: "Ouro", pts: 5000, color: "text-amber-500" },
      { name: "Elite", pts: 10000, color: "text-blue-500" }
    ], 
    accumulation: [
      { action: "Vitória", val: "500 pts" },
      { action: "Decisão", val: "10 pts" }
    ] 
  },
};

export const getPageContent = (slug: string) => {
  return DEFAULT_PAGE_CONTENT[slug] || DEFAULT_PAGE_CONTENT[`branch-${slug}`] || DEFAULT_PAGE_CONTENT[`activity-${slug}`] || null;
};

export const INITIAL_INDUSTRIAL_FINANCIALS = {
  balance_sheet: {
    assets: { 
      current: { cash: 0, receivables: 1823735, inventory: 1466605 }, 
      total: 9176940 
    },
    equity: { 
      total: 5055447, 
      capital_social: 5000000, 
      accumulated_profit: 55447 
    },
    liabilities: { 
      current: 2621493, 
      current_loans: 1872362,
      long_term: 1500000,
      total_debt: 4121493 
    }
  },
  nlcdg: 2572735,
  financing_sources: {
    ecp: 1872362,
    elp: 1500000,
    ccp: 5055447
  },
  dre: {
    revenue: 3322735,
    cpv: 2278180,
    gross_profit: 1044555,
    opex: 916522,
    operating_profit: 128033,
    financial_revenue: 0,
    financial_expense: 40000,
    lair: 88033,
    tax: 13045,
    ppr: 0,
    net_profit: 74988
  }
};

export const INITIAL_FINANCIAL_TREE = {
  balance_sheet: [
    { 
      id: 'assets', label: 'ATIVO', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
        { 
          id: 'assets.current', label: 'ATIVO CIRCULANTE', value: 3290340, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa', value: 0, type: 'asset', isEditable: true, isTemplateAccount: true },
            { id: 'assets.current.app', label: 'Aplicação', value: 0, type: 'asset', isEditable: true, isTemplateAccount: true },
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
            { id: 'liabilities.current.ppr', label: 'Participações a pagar', value: 0, type: 'liability', isEditable: true, isTemplateAccount: true },
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
    { id: 'opex', label: '( - ) DESPESAS OPERACIONAIS', value: -916522, type: 'totalizer', children: [
        { id: 'opex.sales', label: 'VENDAS', value: 801642, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'opex.adm', label: 'ADMINISTRATIVAS', value: 114880, type: 'expense', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'operating_profit', label: '(=) LUCRO OPERACIONAL', value: 128033, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'fin_rev_group', label: '( + ) RECEITAS FINANCEIRAS', value: 0, type: 'totalizer', children: [
        { id: 'fin_rev.apps', label: 'RENDIMENTOS DE APLICAÇÕES FINANCEIRAS', value: 0, type: 'revenue', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'fin_exp_group', label: '( - ) DESPESAS FINANCEIRAS', value: -40000, type: 'totalizer', children: [
        { id: 'fin_exp.liquid', label: 'FINANCEIRAS LÍQUIDAS', value: 40000, type: 'expense', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'lair', label: '(=) LAIR - LUCRO LÍQUIDO ANTES DO IR', value: 88033, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'tax_prov', label: '( - ) PROVISÃO PARA O IR', value: -13045, type: 'expense', isEditable: true, isTemplateAccount: true },
    { id: 'profit_after_tax', label: '(=) LUCRO LÍQUIDO APÓS O I. R.', value: 74988, type: 'totalizer', isReadOnly: true, children: [] },
    { id: 'ppr', label: '( - ) PPR - PARTICIPAÇÃO NO LUCRO', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
    { id: 'final_profit', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 74988, type: 'totalizer', isReadOnly: true, children: [] }
  ],
  cash_flow: [
    { id: 'cf.start', label: '(=) SALDO INICIAL DO PERÍODO', value: 170000, type: 'revenue', isEditable: true, isTemplateAccount: true },
    { id: 'cf.inflow', label: '(+) ENTRADAS', value: 3264862, type: 'totalizer', children: [
        { id: 'cf.inflow.cash_sales', label: 'VENDAS À VISTA', value: 1649000, type: 'revenue', isEditable: true, isTemplateAccount: true },
        { id: 'cf.inflow.receivables', label: 'VENDAS À PRAZO', value: 243500, type: 'revenue', isEditable: true, isTemplateAccount: true },
        { id: 'cf.inflow.asset_resgate', label: 'RESGATE DA APLICAÇÃO', value: 0, type: 'revenue', isEditable: true, isTemplateAccount: true },
        { id: 'cf.inflow.machine_sale', label: 'VENDA DE MÁQUINAS', value: 0, type: 'revenue', isEditable: true, isTemplateAccount: true },
        { id: 'cf.inflow.loans_normal', label: 'EMPRÉSTIMOS NORMAIS', value: 0, type: 'revenue', isEditable: true, isTemplateAccount: true },
        { id: 'cf.inflow.loans_compulsory', label: 'EMPRÉSTIMO COMPULSÓRIO', value: 1372362, type: 'revenue', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'cf.outflow', label: '(-) SAÍDAS', value: -3434862, type: 'totalizer', children: [
        { id: 'cf.outflow.payroll', label: 'FOLHA DE PAGAMENTO', value: 767000, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.mkt', label: 'CAMPANHAS DE MARKETING', value: 275400, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.distribution', label: 'DISTRIBUIÇÃO DE PRODUTOS', value: 463362, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.misc', label: 'DIVERSOS E ATRASOS GERAIS', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.storage', label: 'GASTOS COM ESTOCAGEM', value: 70700, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.suppliers', label: 'PAGAMENTO A FORNECEDORES', value: 1677000, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.machine_buy', label: 'COMPRA DE MÁQUINAS', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.maintenance', label: 'MANUTENÇÃO DE MÁQUINAS', value: 141400, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.amortization', label: 'AMORTIZAÇÃO DE EMPRÉSTIMOS', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.interest', label: 'JUROS BANCÁRIOS', value: 40000, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.training', label: 'TREINAMENTO', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.taxes', label: 'IMPOSTO DE RENDA', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.dividends', label: 'DIVIDENDOS E PARTICIPAÇÕES', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true },
        { id: 'cf.outflow.application', label: 'APLICAÇÃO', value: 0, type: 'expense', isEditable: true, isTemplateAccount: true }
    ]},
    { id: 'cf.final', label: '(+) SALDO FINAL DO PERÍODO', value: 0, type: 'totalizer', isReadOnly: true, children: [] }
  ]
};

export const DEFAULT_MACRO: MacroIndicators = {
  ice: 3.0,
  demand_variation: 0.0,
  inflation_rate: 1.0,
  customer_default_rate: 2.6,
  interest_rate_tr: 2.0,
  supplier_interest: 1.5,
  sales_interest_rate: 1.5, 
  avg_selling_price: 340.0,
  tax_rate_ir: 15.0,
  late_penalty_rate: 15.0, // Default 15% para Empréstimo Compulsório
  machine_sale_discount: 10.0,
  special_purchase_premium: 15.0, // Default 15% para Ágio MPs
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

  award_values: {
    cost_precision: 100000,
    revenue_precision: 100000,
    profit_precision: 100000
  },
  
  allow_machine_sale: false,
  require_business_plan: false,
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
  hr_base: { salary: 1300.00, training: 0, profit_sharing: 0, misc: 0 }
};

export const DEFAULT_INDUSTRIAL_CHRONOGRAM: Record<number, Partial<MacroIndicators>> = {
  0: { 
    ice: 3.0, demand_variation: 0.0, inflation_rate: 1.0, customer_default_rate: 2.6, interest_rate_tr: 2.0, supplier_interest: 1.5, sales_interest_rate: 1.5, 
    allow_machine_sale: false, require_business_plan: false, machine_sale_discount: 10.0, raw_material_a_adjust: 1.0, machine_alpha_price_adjust: 1.0,
    machine_beta_price_adjust: 1.0, machine_gamma_price_adjust: 1.0, marketing_campaign_adjust: 2.0, distribution_cost_adjust: 1.0, storage_cost_adjust: 2.0
  },
  1: { 
    ice: 4.0, demand_variation: 6.7, inflation_rate: 2.0, customer_default_rate: 2.7, interest_rate_tr: 3.0, supplier_interest: 2.0, sales_interest_rate: 2.4, 
    allow_machine_sale: false, require_business_plan: false, machine_sale_discount: 10.0, raw_material_a_adjust: 2.0, machine_alpha_price_adjust: 2.0,
    machine_beta_price_adjust: 2.0, machine_gamma_price_adjust: 1.0, marketing_campaign_adjust: 2.0, distribution_cost_adjust: 3.0, storage_cost_adjust: 2.0
  },
  2: { 
    ice: 5.0, demand_variation: -6.3, inflation_rate: 3.0, customer_default_rate: 2.7, interest_rate_tr: 3.0, supplier_interest: 3.0, sales_interest_rate: 3.0, 
    allow_machine_sale: true, require_business_plan: false, machine_sale_discount: 5.0, raw_material_a_adjust: 3.0, machine_alpha_price_adjust: 2.0,
    machine_beta_price_adjust: 2.0, machine_gamma_price_adjust: 1.0, marketing_campaign_adjust: 3.0, distribution_cost_adjust: 3.0, storage_cost_adjust: 2.0
  },
  3: { 
    ice: 5.0, demand_variation: 55.0, inflation_rate: 3.0, customer_default_rate: 2.8, interest_rate_tr: 4.0, supplier_interest: 3.0, sales_interest_rate: 3.2, 
    allow_machine_sale: true, require_business_plan: false, machine_sale_discount: 10.0, raw_material_a_adjust: 3.0, machine_alpha_price_adjust: 3.0,
    machine_beta_price_adjust: 3.0, machine_gamma_price_adjust: 3.0, marketing_campaign_adjust: 3.0, distribution_cost_adjust: 3.0, storage_cost_adjust: 3.0
  },
  4: { 
    ice: 5.0, demand_variation: -25.0, inflation_rate: 4.0, customer_default_rate: 2.6, interest_rate_tr: 4.0, supplier_interest: 4.0, sales_interest_rate: 4.0, 
    allow_machine_sale: false, require_business_plan: true, machine_sale_discount: 15.0, raw_material_a_adjust: 4.0, machine_alpha_price_adjust: 4.0,
    machine_beta_price_adjust: 4.0, machine_gamma_price_adjust: 4.0, marketing_campaign_adjust: 4.0, distribution_cost_adjust: 4.0, storage_cost_adjust: 4.0
  },
  5: { 
    ice: 5.0, demand_variation: 18.2, inflation_rate: 4.5, customer_default_rate: 2.8, interest_rate_tr: 4.5, supplier_interest: 4.5, sales_interest_rate: 3.9, 
    allow_machine_sale: true, require_business_plan: false, machine_sale_discount: 20.0, raw_material_a_adjust: 4.3, machine_alpha_price_adjust: 5.0,
    machine_beta_price_adjust: 4.5, machine_gamma_price_adjust: 4.0, marketing_campaign_adjust: 5.0, distribution_cost_adjust: 5.0, storage_cost_adjust: 4.0
  },
  6: { 
    ice: 3.0, demand_variation: 9.2, inflation_rate: 4.5, customer_default_rate: 2.6, interest_rate_tr: 5.0, supplier_interest: 4.5, sales_interest_rate: 4.6, 
    allow_machine_sale: true, require_business_plan: false, machine_sale_discount: 10.0, raw_material_a_adjust: 4.0, machine_alpha_price_adjust: 4.0,
    machine_beta_price_adjust: 3.0, machine_gamma_price_adjust: 2.0, marketing_campaign_adjust: 4.0, distribution_cost_adjust: 4.0, storage_cost_adjust: 4.0
  },
  7: { 
    ice: 4.0, demand_variation: 56.2, inflation_rate: 4.5, customer_default_rate: 2.8, interest_rate_tr: 5.0, supplier_interest: 4.5, sales_interest_rate: 4.5, 
    allow_machine_sale: false, require_business_plan: false, machine_sale_discount: 10.0, raw_material_a_adjust: 4.0, machine_alpha_price_adjust: 4.0,
    machine_beta_price_adjust: 3.0, machine_gamma_price_adjust: 2.0, marketing_campaign_adjust: 4.0, distribution_cost_adjust: 4.0, storage_cost_adjust: 4.0
  },
  8: { 
    ice: 5.0, demand_variation: -18.0, inflation_rate: 5.0, customer_default_rate: 2.8, interest_rate_tr: 5.0, supplier_interest: 4.5, sales_interest_rate: 4.5, 
    allow_machine_sale: false, require_business_plan: true, machine_sale_discount: 15.0, raw_material_a_adjust: 5.0, machine_alpha_price_adjust: 4.0,
    machine_beta_price_adjust: 3.0, machine_gamma_price_adjust: 3.0, marketing_campaign_adjust: 5.0, distribution_cost_adjust: 4.5, storage_cost_adjust: 4.5
  },
  9: { 
    ice: 6.0, demand_variation: 6.0, inflation_rate: 5.5, customer_default_rate: 2.6, interest_rate_tr: 5.5, supplier_interest: 5.0, sales_interest_rate: 4.5, 
    allow_machine_sale: true, require_business_plan: false, machine_sale_discount: 20.0, raw_material_a_adjust: 5.0, machine_alpha_price_adjust: 4.0,
    machine_beta_price_adjust: 3.0, machine_gamma_price_adjust: 3.0, marketing_campaign_adjust: 5.5, distribution_cost_adjust: 5.0, storage_cost_adjust: 4.5
  },
  10: { 
    ice: 4.0, demand_variation: 7.5, inflation_rate: 4.0, customer_default_rate: 2.6, interest_rate_tr: 5.5, supplier_interest: 5.0, sales_interest_rate: 5.0, 
    allow_machine_sale: true, require_business_plan: false, machine_sale_discount: 10.0, raw_material_a_adjust: 5.0, machine_alpha_price_adjust: 4.0,
    machine_beta_price_adjust: 4.0, machine_gamma_price_adjust: 5.0, marketing_campaign_adjust: 4.5, distribution_cost_adjust: 5.0, storage_cost_adjust: 4.5
  },
  11: { 
    ice: 4.0, demand_variation: 52.5, inflation_rate: 4.5, customer_default_rate: 3.0, interest_rate_tr: 6.0, supplier_interest: 5.0, sales_interest_rate: 5.0, 
    allow_machine_sale: true, require_business_plan: false, machine_sale_discount: 10.0, raw_material_a_adjust: 5.0, machine_alpha_price_adjust: 4.0,
    machine_beta_price_adjust: 4.0, machine_gamma_price_adjust: 5.0, marketing_campaign_adjust: 5.0, distribution_cost_adjust: 5.0, storage_cost_adjust: 5.0
  },
  12: { 
    ice: 6.0, demand_variation: -24.0, inflation_rate: 5.0, customer_default_rate: 2.8, interest_rate_tr: 6.0, supplier_interest: 5.0, sales_interest_rate: 5.0, 
    allow_machine_sale: true, require_business_plan: true, machine_sale_discount: 10.0, raw_material_a_adjust: 5.0, machine_alpha_price_adjust: 4.0,
    machine_beta_price_adjust: 5.0, machine_gamma_price_adjust: 6.0, marketing_campaign_adjust: 5.0, distribution_cost_adjust: 5.0, storage_cost_adjust: 5.0
  }
};
