
import { Branch, ChampionshipTemplate, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, LaborAvailability, MachineModel, MachineSpec, InitialMachine, SalesMode, TransparencyLevel, GazetaMode, ScenarioType, RegionType, AnalysisSource, MenuItemConfig } from './types';

export const APP_VERSION = "v15.25.0-Oracle-Industrial-Gold";
export const BUILD_DATE = "02/02/2026";
export const PROTOCOL_NODE = "Node 08-STREET-INDUSTRIAL-MASTER";
export const DEFAULT_INITIAL_SHARE_PRICE = 60.09; 
export const DEFAULT_TOTAL_SHARES = 5000000; 

// ESTRUTURA FINANCEIRA INDUSTRIAL REALÍSTICA ( डीएनए EMPIRION )
export const INITIAL_FINANCIAL_TREE = {
  balance_sheet: [
    { 
      id: 'assets', label: 'ATIVO', value: 9544440.12, type: 'totalizer', children: [
        { 
          id: 'assets.current', label: 'ATIVO CIRCULANTE', value: 3531940.12, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: 170000.00, type: 'asset', isEditable: true },
            { id: 'assets.current.investments', label: 'Aplicação Financeira', value: 0.00, type: 'asset', isEditable: true },
            { id: 'assets.current.clients_group', label: 'CONTAS A RECEBER', value: 2073663.54, type: 'totalizer', children: [
                { id: 'assets.current.clients', label: 'Clientes', value: 2092193.00, type: 'asset', isEditable: true },
                { id: 'assets.current.pecld', label: '(-) PECLD Inadimplência Clientes', value: -18529.46, type: 'asset', isEditable: true }
            ]},
            { id: 'assets.current.stock', label: 'ESTOQUE', value: 1458276.58, type: 'totalizer', children: [
                { id: 'assets.current.stock.pa', label: 'Estoque Produto Acabado', value: 0.00, type: 'asset', isEditable: true },
                { id: 'assets.current.stock.mpa', label: 'Estoque MP A', value: 624975.68, type: 'asset', isEditable: true },
                { id: 'assets.current.stock.mpb', label: 'Estoque MP B', value: 833300.90, type: 'asset', isEditable: true }
            ]}
          ]
        },
        {
          id: 'assets.noncurrent', label: 'ATIVO NÃO CIRCULANTE', value: 6012500.00, type: 'totalizer', children: [
            { id: 'assets.noncurrent.fixed', label: 'ATIVO IMOBILIZADO', value: 6012500.00, type: 'totalizer', children: [
                { id: 'assets.noncurrent.fixed.land', label: 'Terrenos', value: 1200000.00, type: 'asset', isEditable: true },
                { id: 'assets.noncurrent.fixed.buildings', label: 'Prédios e Instalações', value: 5440000.00, type: 'asset', isEditable: true },
                { id: 'assets.noncurrent.fixed.buildings_deprec', label: '(-) Deprec. Acum. Prédios/Inst.', value: -2176000.00, type: 'asset', isEditable: true },
                { id: 'assets.noncurrent.fixed.machines', label: 'Máquinas', value: 2360000.00, type: 'asset', isEditable: true, isReadOnly: true }, 
                { id: 'assets.noncurrent.fixed.machines_deprec', label: '(-) Deprec. Acum. Máquinas', value: -811500.00, type: 'asset', isEditable: true }
            ]}
          ]
        }
      ]
    },
    { 
      id: 'liabilities_pl', label: 'PASSIVO + PL', value: 9544440.12, type: 'totalizer', children: [
        { 
          id: 'liabilities.current', label: 'PASSIVO CIRCULANTE', value: 2240991.80, type: 'totalizer', children: [
            { id: 'liabilities.current.suppliers', label: 'Fornecedores', value: 717605.00, type: 'liability', isEditable: true },
            { id: 'liabilities.current.taxes', label: 'Imposto de Renda a pagar', value: 14871.31, type: 'liability', isEditable: true },
            { id: 'liabilities.current.dividends', label: 'Dividendos a Pagar', value: 11153.49, type: 'liability', isEditable: true },
            { id: 'liabilities.current.loans_st', label: 'Empréstimos de curto prazo', value: 1497362.00, type: 'liability', isEditable: true }
          ] 
        },
        {
          id: 'liabilities.longterm', label: 'PASSIVO NÃO CIRCULANTE', value: 0.00, type: 'totalizer', children: [
            { id: 'liabilities.longterm.loans_lt', label: 'Empréstimos de longo prazo', value: 0.00, type: 'liability', isEditable: true }
          ]
        },
        { 
          id: 'equity', label: 'PATRIMÔNIO LÍQUIDO', value: 7303448.32, type: 'totalizer', children: [
            { id: 'equity.capital', label: 'Capital Social', value: 7200000.00, type: 'equity', isEditable: true },
            { id: 'equity.profit', label: 'Lucro/Prejuízo Acumulado', value: 103448.32, type: 'equity', isEditable: true }
          ] 
        }
      ]
    }
  ],
  dre: [
    { id: 'rev', label: '(+) RECEITAS BRUTAS DE VENDAS', value: 4184440.05, type: 'revenue', isEditable: true },
    { id: 'cpv', label: '(-) CPV-CUSTO PROD. VENDIDO', value: -2972830.93, type: 'expense', isEditable: true },
    { id: 'gross_profit', label: '(=) LUCRO BRUTO', value: 1211609.12, type: 'totalizer', isReadOnly: true },
    { id: 'opex', label: '(-) DESPESAS OPERACIONAIS', value: -1149623.86, type: 'totalizer', children: [
        { id: 'opex.sales', label: 'DE VENDAS', value: 873250.00, type: 'expense', isEditable: true },
        { id: 'opex.adm', label: 'ADMINISTRATIVAS', value: 216000.00, type: 'expense', isEditable: true },
        { id: 'opex.bad_debt', label: 'INADIMPLÊNCIA S/ SALDO CLIENTES', value: 18529.46, type: 'expense', isEditable: true },
        { id: 'opex.rd', label: 'P&D-PESQUISA E DESENVOLVIMENTO', value: 41844.40, type: 'expense', isEditable: true }
    ]},
    { id: 'operating_profit', label: '(=) RESULTADO OPERACIONAL', value: 61985.27, type: 'totalizer', isReadOnly: true },
    { id: 'fin_res', label: '(+/-) RESULTADO FINANCEIRO', value: -2500.00, type: 'totalizer', children: [
        { id: 'fin.rev', label: '(+) RENDIMENTOS DE APLICAÇÕES', value: 0, type: 'revenue', isEditable: true },
        { id: 'fin.exp', label: '(-) DESPESAS FINANCEIRAS', value: 2500.00, type: 'expense', isEditable: true }
    ]},
    { id: 'lair', label: '(=) LUCRO ANTES DO IR (LAIR)', value: 59485.26, type: 'totalizer', isReadOnly: true },
    { id: 'tax_prov', label: '(-) PROVISÃO PARA O IR', value: -14871.31, type: 'expense', isEditable: true },
    { id: 'profit_after_tax', label: '(=) LUCRO APÓS O IR', value: 44613.95, type: 'totalizer', isReadOnly: true },
    { id: 'ppr', label: '(-) PPR-PARTICIPAÇÃO NO LUCRO', value: 0.00, type: 'expense', isEditable: true },
    { id: 'final_profit', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 44613.95, type: 'totalizer', isReadOnly: true }
  ],
  cash_flow: [
    { id: 'cf.start', label: '(=) SALDO INICIAL DO PERÍODO', value: 170000.00, type: 'revenue', isEditable: true },
    { id: 'cf.inflow', label: '(+) ENTRADAS', value: 4158696.90, type: 'totalizer', children: [
        { id: 'cf.inflow.cash_sales', label: 'VENDAS À VISTA', value: 2092193.00, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.term_sales', label: 'VENDAS A PRAZO (-) PERDAS)', value: 694141.90, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.compulsory', label: 'EMPRÉSTIMO COMPULSÓRIO', value: 1372362.00, type: 'revenue', isEditable: true }
    ]},
    { id: 'cf.outflow', label: '(-) SAÍDAS', value: -4158696.90, type: 'totalizer', children: [
        { id: 'cf.outflow.payroll', label: 'FOLHA DE PAGAMENTO', value: 1180000.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.social_charges', label: 'ENCARGOS SOCIAIS', value: 413000.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.rd', label: 'P&D-PESQUISA E DESENVOLVIMENTO', value: 41844.40, type: 'expense', isEditable: true },
        { id: 'cf.outflow.marketing', label: 'CAMPANHAS DE MARKETING', value: 275400.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.distribution', label: 'DISTRIBUIÇÃO DE PRODUTOS', value: 489850.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.suppliers', label: 'PAGAMENTO A FORNECEDORES', value: 1414000.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.maintenance', label: 'MANUTENÇÃO DE MÁQUINAS', value: 146402.50, type: 'expense', isEditable: true },
        { id: 'cf.outflow.amortization', label: 'AMORTIZAÇÃO DE EMPRÉSTIMOS', value: 125000.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.interest', label: 'JUROS E ÁGIOS BANCÁRIOS', value: 2500.00, type: 'expense', isEditable: true }
    ]},
    { id: 'cf.final', label: '(+) SALDO FINAL DO PERÍODO', value: 170000.00, type: 'totalizer' }
  ]
};

// Fix: Exported INITIAL_INDUSTRIAL_FINANCIALS as requested by simulation.ts
export const INITIAL_INDUSTRIAL_FINANCIALS = INITIAL_FINANCIAL_TREE;

// Fix: Added award_values to DEFAULT_MACRO to match MacroIndicators interface
export const DEFAULT_MACRO: MacroIndicators = {
  ice: 3.0,
  demand_variation: 0.0,
  inflation_rate: 1.0,
  customer_default_rate: 2.6,
  interest_rate_tr: 2.0,
  supplier_interest: 1.5,
  investment_return_rate: 1.0,
  avg_selling_price: 375.0,
  tax_rate_ir: 25.0,
  late_penalty_rate: 5.0,
  machine_sale_discount: 10.0,
  special_purchase_premium: 15.0,
  compulsory_loan_agio: 3.0,
  exchange_rates: { BRL: 1.0, USD: 5.25, EUR: 5.60, GBP: 6.50 },
  dividend_percent: 25.0, 
  social_charges: 35.0, 
  production_hours_period: 946, 
  award_values: {
    cost_precision: 50000,
    revenue_precision: 100000,
    profit_precision: 150000,
  },
  prices: { 
    mp_a: 20.00, 
    mp_b: 40.00, 
    distribution_unit: 50.00, 
    marketing_campaign: 10000.00,
    storage_mp: 1.40,
    storage_finished: 20.00
  },
  machinery_values: { alfa: 500000, beta: 1500000, gama: 3000000 },
  machine_specs: {
    alfa: { 
      model: 'alfa', initial_value: 500000, production_capacity: 2000, operators_required: 94, depreciation_rate: 0.025,
      overload_coef: 1.4, aging_coef: 0.8, useful_life_years: 40, overload_extra_rate: 0.001 
    },
    beta: { 
      model: 'beta', initial_value: 1500000, production_capacity: 6000, operators_required: 235, depreciation_rate: 0.025,
      overload_coef: 1.2, aging_coef: 0.6, useful_life_years: 40, overload_extra_rate: 0.0007 
    },
    gama: { 
      model: 'gama', initial_value: 3000000, production_capacity: 12000, operators_required: 445, depreciation_rate: 0.025,
      overload_coef: 1.0, aging_coef: 0.5, useful_life_years: 40, overload_extra_rate: 0.0005 
    }
  },
  initial_machinery_mix: [
    { id: 'm1', model: 'alfa', age: 6, purchase_value: 500000 },
    { id: 'm2', model: 'alfa', age: 11, purchase_value: 500000 },
    { id: 'm3', model: 'alfa', age: 11, purchase_value: 500000 },
    { id: 'm4', model: 'alfa', age: 21, purchase_value: 500000 },
    { id: 'm5', model: 'alfa', age: 21, purchase_value: 500000 }
  ],
  staffing: {
    admin: { count: 20, salaries: 4 },
    sales: { count: 10, salaries: 4 },
    production: { count: 470, salaries: 1 }
  },
  hr_base: { salary: 1313.00 }
};

export const DEFAULT_INDUSTRIAL_CHRONOGRAM: Record<number, Partial<MacroIndicators>> = {
  0: { ice: 3.0, inflation_rate: 1.0, demand_variation: 0 },
  1: { ice: 3.2, inflation_rate: 1.2, demand_variation: 2 },
  2: { ice: 2.8, inflation_rate: 1.5, demand_variation: -1 },
  3: { ice: 2.5, inflation_rate: 1.8, demand_variation: -5 },
  4: { ice: 2.2, inflation_rate: 2.1, demand_variation: -10 },
  5: { ice: 2.8, inflation_rate: 1.6, demand_variation: 0 },
  6: { ice: 3.5, inflation_rate: 1.2, demand_variation: 5 },
  7: { ice: 4.0, inflation_rate: 1.0, demand_variation: 10 },
  8: { ice: 4.2, inflation_rate: 0.9, demand_variation: 15 },
  9: { ice: 3.8, inflation_rate: 1.1, demand_variation: 8 },
  10: { ice: 3.2, inflation_rate: 1.3, demand_variation: 2 },
  11: { ice: 3.0, inflation_rate: 1.0, demand_variation: 0 },
  12: { ice: 3.0, inflation_rate: 1.0, demand_variation: 0 }
};

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

// Fix: Added CHAMPIONSHIP_TEMPLATES as requested by AdminCommandCenter.tsx and ChampionshipWizard.tsx
export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  { id: 'ind-master', name: 'Mastery Industrial', branch: 'industrial' },
  { id: 'com-master', name: 'Comercial Excellence', branch: 'commercial' },
];

// Fix: Added DEFAULT_PAGE_CONTENT with required keys for multiple pages
export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
     title: "Forje Seu Império",
     subtitle: "A arena definitiva onde inteligência neural Gemini e estratégia humana colidem.",
     hero: { title: "Forje Seu Império", subtitle: "Com Insight Estratégico IA" }
  },
  'solutions-bp': {
    title: "Plano de Negócios",
    subtitle: "Estruture sua visão estratégica",
    steps: [
      { id: 0, label: 'MISSÃO' },
      { id: 1, label: 'MERCADO' },
      { id: 2, label: 'OBJETIVOS' },
      { id: 3, label: 'OPERAÇÕES' },
      { id: 4, label: 'FINANÇAS' }
    ]
  },
  'rewards': {
    subtitle: "Conquiste honrarias auditadas pelo oráculo.",
    tiers: [
      { name: 'Bronze Node', pts: 1000, color: 'text-orange-400' },
      { name: 'Silver Hub', pts: 5000, color: 'text-slate-300' },
      { name: 'Gold Center', pts: 15000, color: 'text-amber-400' },
      { name: 'Platinum Elite', pts: 50000, color: 'text-indigo-400' }
    ],
    accumulation: [
      { action: 'Participação', val: '50 pts' },
      { action: 'Vitória', val: '500 pts' }
    ]
  },
  'branch-industrial': { name: 'Industrial', body: 'Fidelidade em CapEx e Produção', features: ['Gestão de Insumos', 'Eficiência Operacional'], kpis: ['OEE', 'ROI', 'Share'] },
  'branch-commercial': { name: 'Comercial', body: 'Varejo e Escala', features: ['Marketing Mix', 'Giro de Estoque'], kpis: ['Margem', 'Ticket Médio', 'Churn'] },
  'solutions-simulators': {
    title: "Simuladores de Elite",
    subtitle: "Escolha seu campo de batalha",
    items: [
      { id: 'ind', label: 'Industrial', slug: 'industrial', icon: 'Factory', desc: 'Produção massiva' },
      { id: 'com', label: 'Comercial', slug: 'commercial', icon: 'ShoppingCart', desc: 'Varejo global' }
    ]
  },
  'solutions-training': {
    tracks: [
      { id: 'online', label: 'Online Academy', body: 'Aprenda no seu ritmo' },
      { id: 'corp', label: 'Corporate Training', body: 'Simulações in-company' }
    ]
  },
  'features': {
    items: [
      { id: 'f1', title: 'Real-time', body: 'Sincronização via Supabase' },
      { id: 'f2', title: 'IA Powered', body: 'Motor Gemini 3 Pro' }
    ]
  },
  'blog': {
    subtitle: "Briefings táticos e novidades do motor.",
    items: [
      { id: 'p1', title: 'O Futuro das Simulações', date: '01/01/2026', author: 'Oracle' }
    ]
  },
  'solution-university': { title: 'Acadêmico', body: 'Para instituições de ensino', icon: 'Users' },
  'solution-corporate': { title: 'Corporativo', body: 'Treinamento de elite', icon: 'Shield' },
  'solution-individual': { title: 'Individual', body: 'Desafie-se', icon: 'Brain' }
};

// Fix: Added getPageContent function as requested by ActivityDetail.tsx
export const getPageContent = (slug: string) => {
  return DEFAULT_PAGE_CONTENT[`branch-${slug}`] || DEFAULT_PAGE_CONTENT[`activity-${slug}`];
};
