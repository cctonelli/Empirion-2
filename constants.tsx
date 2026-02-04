
import { Branch, ChampionshipTemplate, AccountNode, DeadlineUnit, CurrencyType, MacroIndicators, LaborAvailability, MachineModel, MachineSpec, InitialMachine, SalesMode, TransparencyLevel, GazetaMode, ScenarioType, RegionType, AnalysisSource, MenuItemConfig } from './types';

export const APP_VERSION = "v15.50.0-Oracle-DoubleEntry-Verified";
export const BUILD_DATE = "04/02/2026";
export const PROTOCOL_NODE = "Node 08-STREET-ACCOUNTING-CORE";

// Added missing constant for initial share price baseline required by wizard components
export const DEFAULT_INITIAL_SHARE_PRICE = 1.00;

/**
 * ==============================================================================
 * EMPIRION CORE FINANCIAL GENOME - INITIAL_FINANCIAL_TREE
 * Ajustado para o cenário P00: MP A ($603k) + MP B ($804k)
 * ==============================================================================
 */
export const INITIAL_FINANCIAL_TREE = {
  balance_sheet: [
    { 
      id: 'assets', label: 'ATIVO', value: 9544440.12, type: 'totalizer', children: [
        { 
          id: 'assets.current', label: 'ATIVO CIRCULANTE', value: 3531940.12, type: 'totalizer', children: [
            { id: 'assets.current.cash', label: 'Caixa/Bancos', value: 0.00, type: 'asset', isEditable: true },
            { id: 'assets.current.investments', label: 'Aplicação Financeira', value: 0.00, type: 'asset', isEditable: true },
            { id: 'assets.current.clients_group', label: 'CONTAS A RECEBER', value: 2073663.54, type: 'totalizer', children: [
                { id: 'assets.current.clients', label: 'Clientes', value: 2092193.00, type: 'asset', isEditable: true },
                { id: 'assets.current.pecld', label: '(-) PECLD Inadimplência Clientes', value: -18529.46, type: 'asset', isEditable: true },
                { id: 'assets.current.vat_recoverable', label: 'Crédito de IVA a recuperar', value: 0.00, type: 'asset', isEditable: true }
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
			      { id: 'liabilities.current.vat_payable', label: 'IVA a recolher', value: 0.00, type: 'liability', isEditable: true },
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
    { id: 'vat_sales', label: '(-) IVA SOBRE VENDAS', value: 0.00, type: 'expense', isEditable: true },
    { id: 'net_sales', label: '(=) RECEITA LÍQUIDA DE VENDAS', value: 4184440.05, type: 'totalizer', isReadOnly: true },
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
    { id: 'non_op_res', label: '(+/-) RESULTADO NÃO OPERACIONAL', value: 0, type: 'totalizer', children: [
        { id: 'non_op.rev', label: '(+) RECEITAS NÃO OPERACIONAIS', value: 0, type: 'revenue', isEditable: true },
        { id: 'non_op.exp', label: '(-) DESPESAS NÃO OPERACIONAIS', value: 0, type: 'expense', isEditable: true }
    ]},
    { id: 'lair', label: '(=) LUCRO ANTES DO IR (LAIR)', value: 59485.26, type: 'totalizer', isReadOnly: true },
    { id: 'tax_prov', label: '(-) PROVISÃO PARA O IR', value: -14871.31, type: 'expense', isEditable: true },
    { id: 'profit_after_tax', label: '(=) LUCRO APÓS O IR', value: 44613.95, type: 'totalizer', isReadOnly: true },
    { id: 'ppr', label: '(-) PPR-PARTICIPAÇÃO NO LUCRO', value: 0.00, type: 'expense', isEditable: true },
    { id: 'final_profit', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 44613.95, type: 'totalizer', isReadOnly: true }
  ],
  cash_flow: [
    { id: 'cf.start', label: '(=) SALDO INICIAL DO PERÍODO', value: 0.00, type: 'revenue', isEditable: true },
    { id: 'cf.inflow', label: '(+) ENTRADAS', value: 4158696.90, type: 'totalizer', children: [
        { id: 'cf.inflow.cash_sales', label: 'VENDAS À VISTA', value: 2092193.00, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.term_sales', label: 'VENDAS A PRAZO (-) PERDAS)', value: 694141.90, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.investment_withdrawal', label: 'RESGATE DE APLICAÇÕES', value: 0.00, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.machine_sales', label: 'VENDA DE MÁQUINAS', value: 0.00, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.awards', label: 'PREMIAÇÕES RECEBIDAS', value: 0.00, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.loans_normal', label: 'EMPRÉSTIMOS NORMAIS', value: 0.00, type: 'revenue', isEditable: true },
        { id: 'cf.inflow.compulsory', label: 'EMPRÉSTIMO COMPULSÓRIO', value: 1372362.00, type: 'revenue', isEditable: true }
    ]},
    { id: 'cf.outflow', label: '(-) SAÍDAS', value: -4158696.90, type: 'totalizer', children: [
        { id: 'cf.outflow.payroll', label: 'FOLHA DE PAGAMENTO', value: 1180000.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.social_charges', label: 'ENCARGOS SOCIAIS', value: 413000.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.vat_payable', label: 'PAGAMENTO DE IVA', value: 0.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.rd', label: 'P&D-PESQUISA E DESENVOLVIMENTO', value: 41844.40, type: 'expense', isEditable: true },
        { id: 'cf.outflow.marketing', label: 'CAMPANHAS DE MARKETING', value: 275400.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.distribution', label: 'DISTRIBUIÇÃO DE PRODUTOS', value: 489850.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.storage', label: 'GASTOS COM ESTOCAGEM', value: 70700.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.suppliers', label: 'PAGAMENTO A FORNECEDORES', value: 1414000.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.misc', label: 'DIVERSOS E ATRASOS GERAIS', value: 0.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.machine_buy', label: 'COMPRA DE MÁQUINAS', value: 0.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.maintenance', label: 'MANUTENÇÃO DE MÁQUINAS', value: 146402.50, type: 'expense', isEditable: true },
        { id: 'cf.outflow.amortization', label: 'AMORTIZAÇÃO DE EMPRÉSTIMOS', value: 125000.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.late_penalties', label: 'MULTAS POR ATRASO', value: 0, type: 'expense', isEditable: true },
        { id: 'cf.outflow.interest', label: 'JUROS E ÁGIOS BANCÁRIOS', value: 2500.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.training', label: 'TREINAMENTO', value: 0, type: 'expense', isEditable: true },
        { id: 'cf.outflow.taxes', label: 'IMPOSTO DE RENDA', value: 0.00, type: 'expense', isEditable: true },
        { id: 'cf.outflow.dividends', label: 'DISTRIBUIÇÃO DE DIVIDENDOS', value: 0.00, type: 'expense', isEditable: true },
		    { id: 'cf.investment_apply', label: 'APLICAÇÃO FINANCEIRA', value: 0.00, type: 'expense', isEditable: true }
    ]},
    { id: 'cf.final', label: '(+) SALDO FINAL DO PERÍODO', value: 0.00, type: 'totalizer' }
  ]
};

export const INITIAL_INDUSTRIAL_FINANCIALS = INITIAL_FINANCIAL_TREE;

export const DEFAULT_MACRO: MacroIndicators = {
  ice: 3.0,
  demand_variation: 0.0,
  inflation_rate: 1.0,
  customer_default_rate: 2.6,
  interest_rate_tr: 2.0,
  supplier_interest: 1.0, // Juros do fornecedor baseline 1%
  investment_return_rate: 1.0,
  avg_selling_price: 370.0,
  late_penalty_rate: 5.0,
  machine_sale_discount: 10.0,
  special_purchase_premium: 5.0,
  compulsory_loan_agio: 3.0,
  social_charges: 35.0,
  allow_machine_sale: false,
  require_business_plan: false,
  tax_rate_ir: 25.0,
  vat_purchases_rate: 0.0, 
  vat_sales_rate: 0.0,     
  dividend_percent: 25.0, 
  production_hours_period: 976, 
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
    { id: 'm2', model: 'alfa', age: 11, purchase_value: 480000 },
    { id: 'm3', model: 'alfa', age: 11, purchase_value: 480000 },
    { id: 'm4', model: 'alfa', age: 21, purchase_value: 450000 },
    { id: 'm5', model: 'alfa', age: 21, purchase_value: 450000 }
  ],
  staffing: {
    admin: { count: 20, salaries: 4 },
    sales: { count: 10, salaries: 4 },
    production: { count: 470, salaries: 1 }
  },
  hr_base: { salary: 2000.00 },
  exchange_rates: { BRL: 1.0, USD: 5.25, EUR: 5.60, GBP: 6.50 },
};

export const DEFAULT_INDUSTRIAL_CHRONOGRAM: Record<number, Partial<MacroIndicators>> = {
  0: {ice: 3.0, demand_variation: 0.0, inflation_rate: 1.0, customer_default_rate: 2.6, interest_rate_tr: 2.0, supplier_interest: 1.0, sales_interest_rate: 1.0, investment_return_rate: 1.0, vat_purchases_rate: 0.0, vat_sales_rate: 0.0, tax_rate_ir: 25.0, late_penalty_rate: 5.0, machine_sale_discount: 10.0, special_purchase_premium: 5.0, compulsory_loan_agio: 3.0, social_charges: 35.0, raw_material_a_adjust: 1.0, machine_alpha_price_adjust: 1.0, machine_beta_price_adjust: 1.0, machine_gamma_price_adjust: 1.0, marketing_campaign_adjust: 2.0, distribution_cost_adjust: 1.0, storage_cost_adjust: 2.0, USD: 5.20, EUR: 6.20, allow_machine_sale: false, require_business_plan: false},
  1: {ice: 3.2, demand_variation: 6.7, inflation_rate: 1.2, customer_default_rate: 2.7, interest_rate_tr: 3.0, supplier_interest: 2.0, sales_interest_rate: 1.1, investment_return_rate: 2.0, vat_purchases_rate: 0.0, vat_sales_rate: 0.0, tax_rate_ir: 25.0, late_penalty_rate: 5.0, machine_sale_discount: 10.0, special_purchase_premium: 5.0, compulsory_loan_agio: 3.0, social_charges: 35.0, raw_material_a_adjust: 2.0, machine_alpha_price_adjust: 2.0, machine_beta_price_adjust: 2.0, machine_gamma_price_adjust: 1.0, marketing_campaign_adjust: 2.0, distribution_cost_adjust: 3.0, storage_cost_adjust: 2.0, USD: 5.26, EUR: 6.27, allow_machine_sale: true, require_business_plan: false},
  2: {ice: 2.8, demand_variation: -6.3, inflation_rate: 1.5, customer_default_rate: 2.7, interest_rate_tr: 3.0, supplier_interest: 3.0, sales_interest_rate: 1.2, investment_return_rate: 2.0, vat_purchases_rate: 0.0, vat_sales_rate: 0.0, tax_rate_ir: 25.0, late_penalty_rate: 5.0, machine_sale_discount: 5.0, special_purchase_premium: 5.0, compulsory_loan_agio: 3.0, social_charges: 35.0, raw_material_a_adjust: 3.0, machine_alpha_price_adjust: 2.0, machine_beta_price_adjust: 2.0, machine_gamma_price_adjust: 1.0, marketing_campaign_adjust: 3.0, distribution_cost_adjust: 3.0, storage_cost_adjust: 2.0, USD: 5.52, EUR: 6.53, allow_machine_sale: true, require_business_plan: false},
  3: {ice: 5.0, demand_variation: 55.0, inflation_rate: 1.8, customer_default_rate: 2.8, interest_rate_tr: 4.0, supplier_interest: 3.0, sales_interest_rate: 1.3, investment_return_rate: 2.5, vat_purchases_rate: 15.0, vat_sales_rate: 15.0, tax_rate_ir: 25.0, late_penalty_rate: 5.0, machine_sale_discount: 10.0, special_purchase_premium: 5.0, compulsory_loan_agio: 3.0, social_charges: 35.0, raw_material_a_adjust: 3.0, machine_alpha_price_adjust: 3.0, machine_beta_price_adjust: 3.0, machine_gamma_price_adjust: 3.0, marketing_campaign_adjust: 3.0, distribution_cost_adjust: 3.0, storage_cost_adjust: 3.0, USD: 5.77, EUR: 6.69, allow_machine_sale: true, require_business_plan: false},
  4: {ice: 5.0, demand_variation: -25.0, inflation_rate: 2.1, customer_default_rate: 2.6, interest_rate_tr: 4.0, supplier_interest: 4.0, sales_interest_rate: 1.4, investment_return_rate: 3.0, vat_purchases_rate: 15.0, vat_sales_rate: 15.0, tax_rate_ir: 25.0, late_penalty_rate: 5.0, machine_sale_discount: 15.0, special_purchase_premium: 5.0, compulsory_loan_agio: 3.5,social_charges: 35.0, raw_material_a_adjust: 4.0, machine_alpha_price_adjust: 4.0, machine_beta_price_adjust: 4.0, machine_gamma_price_adjust: 4.0, marketing_campaign_adjust: 4.0,distribution_cost_adjust: 4.0, storage_cost_adjust: 4.0, USD: 5.51, EUR: 6.55, allow_machine_sale: true, require_business_plan: true},
  12: {ice: 6.0, demand_variation: -24.0, inflation_rate: 5.0, customer_default_rate: 2.8, interest_rate_tr: 6.0, supplier_interest: 5.0, sales_interest_rate: 2.0, investment_return_rate: 4.5, vat_purchases_rate: 25.0, vat_sales_rate: 25.0, tax_rate_ir: 25.0, late_penalty_rate: 5.0, machine_sale_discount: 10.0, special_purchase_premium: 5.0, compulsory_loan_agio: 4.0, social_charges: 35.0, raw_material_a_adjust: 5.0, machine_alpha_price_adjust: 4.0, machine_beta_price_adjust: 5.0, machine_gamma_price_adjust: 6.0, marketing_campaign_adjust: 5.0, distribution_cost_adjust: 5.0, storage_cost_adjust: 5.0, USD: 5.32, EUR: 6.29, allow_machine_sale: true, require_business_plan: true}
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

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  { id: 'ind-master', name: 'Mastery Industrial', branch: 'industrial' },
  { id: 'com-master', name: 'Comercial Excellence', branch: 'commercial' },
];

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
     title: "Forge sua Equipe",
     subtitle: "Com EMPIRION!",
     hero: { title: "Seja Campeão em Estratégia", subtitle: "com EMPIRION SIMULATOR!" }
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

export const getPageContent = (slug: string) => {
  return DEFAULT_PAGE_CONTENT[`branch-${slug}`] || DEFAULT_PAGE_CONTENT[`activity-${slug}`];
};
