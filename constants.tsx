
import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit, GazetaMode, AccountNode, RegionType, AnalysisSource, MachineSpec, InitialMachine, MenuItemConfig } from './types';

export const APP_VERSION = "v15.2.0-Oracle-Gated";
export const BUILD_DATE = "12/01/2026";
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
  'branch-industrial': {
    name: "Industrial",
    heroImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200",
    body: "Produção $9M Assets. Gerencie cadeias de suprimento complexas.",
    description: "O motor industrial do Empirion simula operações de manufatura pesada com foco em CapEx e eficiência de produção.",
    features: ["CapEx Management", "Supply Chain Optimization", "Real-time Production Analytics"],
    kpis: ["TSR", "EBITDA Margin", "Capacity Utilization"],
    accent: "orange"
  },
  'branch-commercial': {
    name: "Comercial",
    heroImage: "https://images.unsplash.com/photo-1556740734-7f9a2b77d59a?q=80&w=1200",
    body: "Varejo Híbrido e Distribuição Omnichannel.",
    description: "Simulação focada em giro de estoque, pricing dinâmico e logística de última milha.",
    features: ["Inventory Management", "Dynamic Pricing", "Logistics Control"],
    kpis: ["Gross Margin", "Inventory Turnover", "Customer Acquisition Cost"],
    accent: "blue"
  }
};

export const getPageContent = (slug: string) => {
  return DEFAULT_PAGE_CONTENT[`branch-${slug}`] || DEFAULT_PAGE_CONTENT[`activity-${slug}`] || DEFAULT_PAGE_CONTENT[slug];
};

export const INITIAL_INDUSTRIAL_FINANCIALS = {
  balance_sheet: {
    assets: { total: 9176940 },
    liabilities: { total: 4121493 },
    equity: { total: 5055447 }
  }
};

export const INITIAL_FINANCIAL_TREE = {
  balance_sheet: [
    { 
      id: 'assets', label: 'ATIVO', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
        { 
          id: 'assets.current', label: 'ATIVO CIRCULANTE', value: 3290340, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: 0, type: 'asset', isEditable: true },
            { id: 'assets.current.clients', label: 'Clientes', value: 1823735, type: 'asset', isEditable: true },
            { id: 'assets.current.stock', label: 'ESTOQUE', value: 1466605, type: 'totalizer', children: [
                { id: 'assets.current.stock.mpa', label: 'Estoque MP A', value: 628545, type: 'asset', isEditable: true },
                { id: 'assets.current.stock.mpb', label: 'Estoque MP B', value: 838060, type: 'asset', isEditable: true }
            ]}
          ]
        },
        {
          id: 'assets.noncurrent', label: 'ATIVO NÃO CIRCULANTE', value: 5886600, type: 'totalizer', children: [
            { id: 'assets.noncurrent.fixed', label: 'IMOBILIZADO', value: 5886600, type: 'totalizer', children: [
                { id: 'assets.noncurrent.fixed.land', label: 'Terrenos', value: 1200000, type: 'asset', isEditable: true },
                { id: 'assets.noncurrent.fixed.buildings', label: 'Prédios e Instalações', value: 5440000, type: 'asset', isEditable: true },
                { id: 'assets.noncurrent.fixed.buildings_deprec', label: '(-) Deprec. Acum. Prédios/Inst.', value: -2176000, type: 'asset', isEditable: true },
                { id: 'assets.noncurrent.fixed.machines', label: 'Máquinas', value: 2360000, type: 'asset', isEditable: true },
                { id: 'assets.noncurrent.fixed.machines_deprec', label: '(-) Deprec. Acum. Máquinas', value: -811500, type: 'asset', isEditable: true }
            ]}
          ]
        }
      ]
    },
    { 
      id: 'liabilities_pl', label: 'PASSIVO + PL', value: 9176940, type: 'totalizer', isReadOnly: true, children: [
        { 
          id: 'liabilities.current', label: 'PASSIVO CIRCULANTE', value: 2621493, type: 'totalizer', children: [
            { id: 'liabilities.current.suppliers', label: 'Fornecedores', value: 717605, type: 'liability', isEditable: true },
            { id: 'liabilities.current.taxes', label: 'Imposto de Renda a pagar', value: 13045, type: 'liability', isEditable: true },
            { id: 'liabilities.current.loans_st', label: 'Empréstimos de curto prazo', value: 1872362, type: 'liability', isEditable: true }
          ] 
        },
        {
          id: 'liabilities.longterm', label: 'PASSIVO NÃO CIRCULANTE', value: 1500000, type: 'totalizer', children: [
            { id: 'liabilities.longterm.loans_lt', label: 'Empréstimos de longo prazo', value: 1500000, type: 'liability', isEditable: true }
          ]
        },
        { 
          id: 'equity', label: 'PATRIMÔNIO LÍQUIDO', value: 5055447, type: 'totalizer', children: [
            { id: 'equity.capital', label: 'Capital Social', value: 5000000, type: 'equity', isEditable: true },
            { id: 'equity.profit', label: 'Lucro/Prejuízo Acumulados', value: 55447, type: 'equity', isEditable: true }
          ] 
        }
      ]
    }
  ],
  dre: [
    { id: 'rev', label: '(+) RECEITAS BRUTAS DE VENDAS', value: 3322735, type: 'revenue', isEditable: true },
    { id: 'cpv', label: '( - ) CUSTO PROD. VENDIDO - CPV', value: -2278180, type: 'expense', isEditable: true },
    { id: 'gross_profit', label: '( = ) LUCRO BRUTO', value: 1044555, type: 'totalizer', isReadOnly: true },
    { id: 'opex', label: '( - ) DESPESAS OPERACIONAIS', value: -917582, type: 'totalizer', children: [
        { id: 'opex.sales', label: 'DE VENDAS', value: 802702, type: 'expense', isEditable: true },
        { id: 'opex.adm', label: 'ADMINISTRATIVAS', value: 114880, type: 'expense', isEditable: true },
        { id: 'opex.rd', label: 'P&D - PESQUISA E DESENVOLVIMENTO', value: 0, type: 'expense', isEditable: true }
    ]},
    { id: 'operating_profit', label: '( = ) LUCRO OPERACIONAL', value: 126973, type: 'totalizer', isReadOnly: true },
    { id: 'fin_res', label: '(+/-) RESULTADO FINANCEIRO', value: -40000, type: 'totalizer', children: [
        { id: 'fin.rev', label: '(+) RENDIMENTOS DE APLICAÇÕES', value: 0, type: 'revenue', isEditable: true },
        { id: 'fin.exp', label: '(-) DESPESAS FINANCEIRAS', value: 40000, type: 'expense', isEditable: true }
    ]},
    { id: 'lair', label: '( = ) LUCRO ANTES DO IR (LAIR)', value: 86973, type: 'totalizer', isReadOnly: true },
    { id: 'tax_prov', label: '( - ) PROVISÃO PARA O IR', value: -13045, type: 'expense', isEditable: true },
    { id: 'profit_after_tax', label: '( = ) LUCRO APÓS O IR', value: 73928, type: 'totalizer', isReadOnly: true },
    { id: 'ppr', label: '( - ) PLR - PARTICIPAÇÃO NO LUCRO', value: 0, type: 'expense', isEditable: true },
    { id: 'final_profit', label: '( = ) LUCRO LÍQUIDO DO EXERCÍCIO', value: 73928, type: 'totalizer', isReadOnly: true },
    { id: 'dividends', label: '( - ) DIVIDENDOS PROPOSTOS', value: 0, type: 'expense', isEditable: true },
    { id: 'retained_profit', label: '( = ) LUCRO RETIDO / ACUMULADO', value: 73928, type: 'totalizer', isReadOnly: true }
  ],
  cash_flow: [
    { id: 'cf.start', label: '(=) SALDO INICIAL DO PERÍODO', value: 170000, type: 'revenue', isEditable: true },
    { id: 'cf.inflow', label: '(+) ENTRADAS', value: 3264862, type: 'totalizer', children: [
        { id: 'cf.inflow.cash_sales', label: 'VENDAS À VISTA', value: 1649000, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.compulsory', label: 'EMPRÉSTIMO COMPULSÓRIO', value: 1372362, type: 'revenue', isEditable: true }
    ]},
    { id: 'cf.outflow', label: '(-) SAÍDAS', value: -3434862, type: 'totalizer', children: [
        { id: 'cf.outflow.payroll', label: 'FOLHA DE PAGAMENTO', value: 767000, type: 'expense', isEditable: true },
        { id: 'cf.outflow.social_charges', label: 'ENCARGOS SOCIAIS', value: 268450, type: 'expense', isEditable: true },
        { id: 'cf.outflow.suppliers', label: 'PAGAMENTO A FORNECEDORES', value: 1677000, type: 'expense', isEditable: true },
        { id: 'cf.outflow.rd', label: 'P&D - PESQUISA E DESENVOLVIMENTO', value: 0, type: 'expense', isEditable: true },
        { id: 'cf.outflow.taxes', label: 'IMPOSTO DE RENDA', value: 13045, type: 'expense', isEditable: true },
        { id: 'cf.outflow.dividends', label: 'DISTRIBUIÇÃO DE DIVIDENDOS', value: 0, type: 'expense', isEditable: true }
    ]},
    { id: 'cf.final', label: '(+) SALDO FINAL DO PERÍODO', value: 0, type: 'totalizer', isReadOnly: true }
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
  investment_return_rate: 1.0,
  avg_selling_price: 340.0,
  tax_rate_ir: 15.0,
  late_penalty_rate: 15.0,
  machine_sale_discount: 10.0,
  special_purchase_premium: 15.0,
  exchange_rates: { BRL: 1.0, USD: 5.25, EUR: 5.60, GBP: 6.50 },
  dividend_percent: 25.0, 
  social_charges: 35.0, 
  production_hours_period: 946, 
  
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
    beta: { model: 'beta', initial_value: 1576206, production_capacity: 6000, operators_required: 235, depreciation_rate: 0.025 },
    gama: { model: 'gama', initial_value: 3310975, production_capacity: 12000, operators_required: 445, depreciation_rate: 0.025 }
  },
  initial_machinery_mix: [
    { id: 'm1', model: 'alfa', age: 6 },
    { id: 'm2', model: 'alfa', age: 11 },
    { id: 'm3', model: 'alfa', age: 11 },
    { id: 'm4', model: 'alfa', age: 21 },
    { id: 'm5', model: 'alfa', age: 21 }
  ],
  maintenance_physics: { alpha: 0.05, beta: 0.03, gamma: 0.02 },
  prices: { 
    mp_a: 20.00, 
    mp_b: 40.00, 
    distribution_unit: 50.00, 
    marketing_campaign: 10000.00,
    storage_mp: 1.40,
    storage_finished: 20.00
  },
  machinery_values: { alfa: 500000, beta: 1576206, gama: 3310975 },
  staffing: {
    admin: { count: 20, salaries: 4 },
    sales: { count: 10, salaries: 4 },
    production: { count: 470, salaries: 1 }
  },
  hr_base: { salary: 1300.00, training: 0, profit_sharing: 0, misc: 0 }
};

export const DEFAULT_INDUSTRIAL_CHRONOGRAM: Record<number, Partial<MacroIndicators>> = {
  0: { ice: 3.0, demand_variation: 0.0, inflation_rate: 1.0, customer_default_rate: 2.6, interest_rate_tr: 2.0, investment_return_rate: 1.0 },
  1: { ice: 4.0, demand_variation: 6.7, inflation_rate: 2.0, customer_default_rate: 2.7, interest_rate_tr: 3.0, investment_return_rate: 2.0 },
  2: { ice: 5.0, demand_variation: -6.3, inflation_rate: 3.0, customer_default_rate: 2.7, interest_rate_tr: 3.0, investment_return_rate: 2.0 },
  3: { ice: 5.0, demand_variation: 55.0, inflation_rate: 3.0, customer_default_rate: 2.8, interest_rate_tr: 4.0, investment_return_rate: 2.5 },
  4: { ice: 5.0, demand_variation: -25.0, inflation_rate: 4.0, customer_default_rate: 2.6, interest_rate_tr: 4.0, investment_return_rate: 3.0 },
  5: { ice: 5.0, demand_variation: 18.2, inflation_rate: 4.5, customer_default_rate: 2.8, interest_rate_tr: 4.5, investment_return_rate: 3.5 },
  6: { ice: 3.0, demand_variation: 9.2, inflation_rate: 4.5, customer_default_rate: 2.6, interest_rate_tr: 5.0, investment_return_rate: 4.0 },
  7: { ice: 4.0, demand_variation: 56.2, inflation_rate: 4.5, customer_default_rate: 2.8, interest_rate_tr: 5.0, investment_return_rate: 4.0 },
  8: { ice: 5.0, demand_variation: -18.0, inflation_rate: 5.0, customer_default_rate: 2.8, interest_rate_tr: 5.0, investment_return_rate: 4.0 },
  9: { ice: 6.0, demand_variation: 6.0, inflation_rate: 5.5, customer_default_rate: 2.6, interest_rate_tr: 5.5, investment_return_rate: 4.5 },
  10: { ice: 4.0, demand_variation: 7.5, inflation_rate: 4.0, customer_default_rate: 2.6, interest_rate_tr: 5.5, investment_return_rate: 4.0 },
  11: { ice: 4.0, demand_variation: 52.5, inflation_rate: 4.5, customer_default_rate: 3.0, interest_rate_tr: 6.0, investment_return_rate: 4.5 },
  12: { ice: 6.0, demand_variation: -24.0, inflation_rate: 5.0, customer_default_rate: 2.8, interest_rate_tr: 6.0, investment_return_rate: 4.5 }
};
