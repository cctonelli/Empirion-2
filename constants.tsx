import { Branch, ChampionshipTemplate, MacroIndicators, SalesMode, ScenarioType, TransparencyLevel, ModalityType, DeadlineUnit, GazetaMode, AccountNode, RegionType, AnalysisSource } from './types';

export const APP_VERSION = "v13.2.0-Oracle-Gold";
export const BUILD_DATE = "08/01/2026";
export const PROTOCOL_NODE = "Node 08-STREET-INDUSTRIAL-STABLE";
export const DEFAULT_INITIAL_SHARE_PRICE = 1.00;
export const DEFAULT_TOTAL_SHARES = 5000000; 

export const INITIAL_INDUSTRIAL_FINANCIALS = {
  balance_sheet: {
    assets: {
      current: {
        cash: 0,
        banks: 0,
        investments: 0,
        receivables: 1823735,
        pvdd: 0,
        inventory_finished: 0,
        inventory_mpa: 628545,
        inventory_mpb: 838060
      },
      non_current: {
        long_term_receivables: 0,
        fixed_assets: {
          machinery: 2360000,
          depr_machinery: -811500,
          land: 1200000,
          buildings: 5440000,
          depr_buildings: -2301900
        }
      }
    },
    liabilities: {
      current: {
        suppliers: 717605,
        income_tax_payable: 13045,
        ppr_payable: 0,
        dividends_payable: 18481,
        loans_st: 1872362
      },
      non_current: {
        loans_lt: 1500000
      }
    },
    equity: {
      capital_social: 5000000,
      accumulated_profit: 55447
    }
  }
};

export const INITIAL_FINANCIAL_TREE: { balance_sheet: AccountNode[], dre: AccountNode[] } = {
  balance_sheet: [
    {
      id: 'assets',
      label: '1. ATIVO TOTAL',
      value: 9176940,
      type: 'totalizer',
      isReadOnly: true,
      children: [
        {
          id: 'assets.current',
          label: '1.1 ATIVO CIRCULANTE',
          value: 3290340,
          type: 'totalizer',
          children: [
            { id: 'cash', label: 'Caixa', value: 0, type: 'asset', isEditable: true },
            { id: 'banks', label: 'Bancos', value: 0, type: 'asset', isEditable: true },
            { id: 'investments', label: 'Aplicação', value: 0, type: 'asset', isEditable: true },
            { id: 'receivables', label: 'Clientes', value: 1823735, type: 'asset', isEditable: true },
            { id: 'pvdd', label: '(-) Provisão devedores duvidosos', value: 0, type: 'asset', isEditable: true },
            {
              id: 'inventory',
              label: 'ESTOQUE',
              value: 1466605,
              type: 'totalizer',
              children: [
                { id: 'inv_finished', label: 'Estoque Prod. Acabado ALPHA', value: 0, type: 'asset', isEditable: true },
                { id: 'inv_mpa', label: 'Estoque MP A', value: 628545, type: 'asset', isEditable: true },
                { id: 'inv_mpb', label: 'Estoque MP B', value: 838060, type: 'asset', isEditable: true }
              ]
            }
          ]
        },
        {
          id: 'assets.noncurrent',
          label: '1.2 ATIVO NÃO CIRCULANTE',
          value: 5886600,
          type: 'totalizer',
          children: [
            {
              id: 'assets.longterm',
              label: 'REALIZÁVEL À LONGO PRAZO',
              value: 0,
              type: 'totalizer',
              children: [
                { id: 'fixed_sale', label: 'Venda de ativo imobilizado', value: 0, type: 'asset', isEditable: true }
              ]
            },
            {
              id: 'assets.fixed',
              label: 'IMOBILIZADO (CAPEX)',
              value: 5886600,
              type: 'totalizer',
              children: [
                { id: 'machines', label: 'Máquinas', value: 2360000, type: 'asset', isEditable: true },
                { id: 'depr_machines', label: '(-) Depreciação acumulada equipamentos', value: -811500, type: 'asset', isEditable: true },
                { id: 'land', label: 'Terrenos', value: 1200000, type: 'asset', isEditable: true },
                { id: 'buildings', label: 'Prédios e Instalações', value: 5440000, type: 'asset', isEditable: true },
                { id: 'depr_buildings', label: '(-) Depreciação acumulada prédios', value: -2301900, type: 'asset', isEditable: true }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'liabilities_equity',
      label: '2. PASSIVO + PL',
      value: 9176940,
      type: 'totalizer',
      isReadOnly: true,
      children: [
        {
          id: 'liab.current',
          label: '2.1 PASSIVO CIRCULANTE',
          value: 2621493,
          type: 'totalizer',
          children: [
            { id: 'suppliers', label: 'Fornecedores', value: 717605, type: 'liability', isEditable: true },
            { id: 'tax_payable', label: 'Imposto de Renda a pagar', value: 13045, type: 'liability', isEditable: true },
            { id: 'ppr_payable', label: 'Participações a pagar', value: 0, type: 'liability', isEditable: true },
            { id: 'dividends', label: 'Dividendos a pagar', value: 18481, type: 'liability', isEditable: true },
            { id: 'loans_st', label: 'Empréstimos de curto prazo', value: 1872362, type: 'liability', isEditable: true }
          ]
        },
        {
          id: 'liab.noncurrent',
          label: '2.2 PASSIVO NÃO CIRCULANTE',
          value: 1500000,
          type: 'totalizer',
          children: [
            { id: 'loans_lt', label: 'Empréstimos de longo prazo', value: 1500000, type: 'liability', isEditable: true }
          ]
        },
        {
          id: 'equity',
          label: '2.3 PATRIMÔNIO LÍQUIDO',
          value: 5055447,
          type: 'totalizer',
          children: [
            { id: 'capital', label: 'Capital Social', value: 5000000, type: 'equity', isEditable: true },
            { id: 'profit_acc', label: 'Lucros Acumulados no ano', value: 55447, type: 'equity', isEditable: true }
          ]
        }
      ]
    }
  ],
  dre: [
    {
      id: 'rev_gross',
      label: 'RECEITA DE VENDAS',
      value: 3322735,
      type: 'totalizer',
      children: [
        { id: 'sales_raw', label: 'Receita Bruta', value: 3322735, type: 'revenue', isEditable: true }
      ]
    },
    { id: 'cpv', label: '( - ) CUSTO PROD. VENDIDO - CPV', value: -2278180, type: 'expense', isEditable: true },
    { id: 'gross_profit', label: '( = ) LUCRO BRUTO', value: 1044555, type: 'totalizer', isReadOnly: true },
    {
      id: 'op_expenses_group',
      label: '( - ) DESPESAS OPERACIONAIS:',
      value: -917582,
      type: 'totalizer',
      children: [
        { id: 'exp_sales', label: 'DE VENDAS', value: -802702, type: 'expense', isEditable: true },
        { id: 'exp_admin', label: 'ADMINISTRATIVAS', value: -114880, type: 'expense', isEditable: true }
      ]
    },
    { id: 'op_profit', label: '(=) LUCRO OPERACIONAL', value: 126973, type: 'totalizer', isReadOnly: true },
    {
      id: 'fin_rev_group',
      label: '( + ) RECEITAS FINANCEIRAS',
      value: 0,
      type: 'totalizer',
      children: [
        { id: 'fin_yield', label: 'RENDIMENTOS DE APLICAÇÕES FINANCEIRAS', value: 0, type: 'revenue', isEditable: true }
      ]
    },
    {
      id: 'fin_exp_group',
      label: '( - ) DESPESAS FINANCEIRAS',
      value: -40000,
      type: 'totalizer',
      children: [
        { id: 'fin_net', label: 'FINANCEIRAS LÍQUIDAS', value: -40000, type: 'expense', isEditable: true }
      ]
    },
    { id: 'lair', label: '(=) LAIR - LUCRO LÍQUIDO ANTES DO IR', value: 86973, type: 'totalizer', isReadOnly: true },
    { id: 'ir_prev', label: '( - ) PROVISÃO PARA O IR', value: -13045, type: 'expense', isEditable: true },
    { id: 'net_after_tax', label: '(=) LUCRO LÍQUIDO APÓS O I. R.', value: 73928, type: 'totalizer', isReadOnly: true },
    { id: 'ppr', label: '( - ) PPR - PARTICIPAÇÃO NO LUCRO', value: 0, type: 'expense', isEditable: true },
    { id: 'final_profit', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', value: 73928, type: 'totalizer', isReadOnly: true }
  ]
};

export const DEFAULT_MACRO: MacroIndicators = {
  growth_rate_ice: 3.0,
  demand_variation: 0.0,
  inflation_rate: 1.0,
  delinquency_rate: 2.6,
  interest_rate_tr: 2.0,
  interest_suppliers: 1.5,
  interest_sales_avg: 1.5,
  tax_rate_ir: 15.0,
  late_fee_fine: 5.0,
  machine_sale_discount: 10.0,
  
  readjust_raw_material: 1.0,
  readjust_machine_alfa: 1.0,
  readjust_machine_beta: 1.0,
  readjust_machine_gama: 1.0,
  readjust_marketing: 2.0,
  readjust_distribution: 1.0,
  readjust_storage: 2.0,

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

// Add missing constants
export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  { id: 'ind-master', name: 'Master Industrial', description: 'Simulação completa de manufatura e CapEx.', branch: 'industrial' },
  { id: 'comm-retail', name: 'Varejo Híbrido', description: 'Foco em giro de estoque e canais digitais.', branch: 'commercial' },
  { id: 'serv-elite', name: 'Serviços de Elite', description: 'Gestão de capital intelectual e projetos.', branch: 'services' }
];

export const MENU_STRUCTURE = [
  { label: 'Início', path: '/' },
  { 
    label: 'ramos', 
    path: '#', 
    sub: [
      { id: 'ind', label: 'Industrial', path: '/branches/industrial', icon: 'Factory', desc: 'Produção $9M Assets' },
      { id: 'com', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart', desc: 'Varejo Híbrido' },
      { id: 'serv', label: 'Serviços', path: '/branches/services', icon: 'Briefcase', desc: 'Capital Intelectual' }
    ]
  },
  { 
    label: 'soluções', 
    path: '#',
    sub: [
      { id: 'sim', label: 'Simuladores', path: '/solutions/simulators', icon: 'Cpu', desc: 'Arenas Real-time' },
      { id: 'bp', label: 'Plano de Negócios', path: '/solutions/business-plan', icon: 'PenTool', desc: 'Strategos AI' }
    ]
  },
  { label: 'Funcionalidades', path: '/features' },
  { label: 'Conteúdos', path: '/blog' },
  { label: 'Contato', path: '/contact' }
];

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  landing: {
    carousel: [
      { id: 1, title: 'IA Generativa v13.2', subtitle: 'Assistência Oracle em tempo real.', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000', badge: 'Gold Build' }
    ]
  },
  'solutions-bp': {
    title: 'Strategos Business Plan',
    subtitle: 'Arquitetura neural para planos de elite.',
    steps: [
      { id: 0, label: 'Executivo' },
      { id: 1, label: 'Mercado' },
      { id: 2, label: 'Estratégia' },
      { id: 3, label: 'Operações' },
      { id: 4, label: 'Financeiro' }
    ]
  },
  'rewards': {
    subtitle: 'Seu prestígio convertido em ativos.',
    tiers: [
      { name: 'Bronze', pts: '0', color: 'text-amber-700' },
      { name: 'Silver', pts: '1000', color: 'text-slate-400' },
      { name: 'Gold', pts: '5000', color: 'text-amber-400' },
      { name: 'Platinum', pts: '10000', color: 'text-indigo-400' }
    ],
    accumulation: [
      { action: 'Participação', val: '50 pts' },
      { action: 'Vitória', val: '500 pts' }
    ]
  },
  'features': {
    items: [
      { id: 'ia', title: 'Oracle Intelligence', body: 'IA profunda para análise estratégica.' },
      { id: 'rt', title: 'Real-time Engine', body: 'Sincronização atômica v6.0.' }
    ]
  },
  'blog': {
    subtitle: 'Mantenha-se à frente com briefings oficiais.',
    items: [
      { id: 1, title: 'Novos Protocolos v13.2', date: '08 Jan 2026', author: 'Command Core' }
    ]
  },
  'solutions-simulators': {
    title: 'Nodos de Simulação',
    subtitle: 'Arenas de alta fidelidade para treinamento.',
    items: [
      { id: 'ind', label: 'Industrial Mastery', icon: 'Factory', desc: 'Produção $9M Assets', slug: 'industrial' }
    ]
  }
};

export const getPageContent = (slug: string) => {
    const contents: Record<string, any> = {
        'industrial': {
            name: 'Industrial Mastery',
            heroImage: 'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?q=80&w=2000',
            body: 'Orquestre cadeias de suprimentos e CapEx massivos.',
            description: 'O ramo industrial exige precisão na gestão de ativos fixos e fluxos produtivos.',
            features: ['Gestão de CapEx', 'OEE Real-time', 'Elasticidade Regional'],
            kpis: ['EBITDA', 'Rating', 'Market Share'],
            accent: 'orange'
        }
    };
    return contents[slug] || null;
};