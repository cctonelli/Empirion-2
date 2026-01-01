
import { ChampionshipTemplate, Branch, BusinessPlanSection } from './types';

export const COLORS = {
  primary: '#020617', // Deeper Slate
  secondary: '#1e293b',
  accent: '#3b82f6',
  gold: '#fbbf24',    // Gold highlight
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const BUSINESS_PLAN_STRUCTURE: BusinessPlanSection[] = [
  {
    id: 'executive_summary',
    title: 'Sumário Executivo',
    fields: [
      { id: 'resumo', label: 'Resumo do Negócio', type: 'textarea', placeholder: 'Descreva o conceito principal do seu império...', value: '', aiPrompt: 'Resuma os pontos principais do plano de negócios em um tom profissional e atraente.' },
      { id: 'missao', label: 'Missão e Valores', type: 'textarea', placeholder: 'Qual a razão de existir da sua empresa?', value: '', aiPrompt: 'Sugerir missão, visão e valores para uma empresa do setor informado.' },
      { id: 'setor', label: 'Setor de Atividade', type: 'text', placeholder: 'Ex: Industrial / Tecnologia', value: '' }
    ]
  },
  {
    id: 'market_analysis',
    title: 'Análise de Mercado',
    fields: [
      { id: 'clientes', label: 'Perfil dos Clientes', type: 'textarea', placeholder: 'Quem são seus compradores?', value: '', aiPrompt: 'Descrever o público-alvo ideal para uma empresa deste setor.' },
      { id: 'concorrentes', label: 'Análise de Concorrentes', type: 'textarea', placeholder: 'Como as outras empresas se comportam na arena?', value: '', aiPrompt: 'Analisar forças e fraquezas típicas de concorrentes neste ramo.' },
      { id: 'fornecedores', label: 'Fornecedores', type: 'textarea', placeholder: 'Quem provê seus insumos?', value: '' }
    ]
  },
  {
    id: 'marketing_plan',
    title: 'Plano de Marketing',
    fields: [
      { id: 'produtos', label: 'Descrição de Produtos/Serviços', type: 'textarea', placeholder: 'O que você vende?', value: '' },
      { id: 'preco', label: 'Estratégia de Preço', type: 'textarea', placeholder: 'Como você define seu markup?', value: '', aiPrompt: 'Sugerir uma estratégia de precificação baseada em valor percebido.' },
      { id: 'promocao', label: 'Estratégia Promocional', type: 'textarea', placeholder: 'Como você será visto no mercado?', value: '' }
    ]
  },
  {
    id: 'operational_plan',
    title: 'Plano Operacional',
    fields: [
      { id: 'layout', label: 'Arranjo Físico', type: 'textarea', placeholder: 'Como é a sua planta ou escritório?', value: '' },
      { id: 'capacidade', label: 'Capacidade Produtiva/Serviço', type: 'text', placeholder: 'Ex: 10.000 unidades/mês', value: '' },
      { id: 'pessoal', label: 'Corpo Técnico e RH', type: 'textarea', placeholder: 'Níveis de formação e headcount...', value: '' }
    ]
  },
  {
    id: 'financial_plan',
    title: 'Plano Financeiro',
    fields: [
      { id: 'investimentos', label: 'Investimento Inicial ($)', type: 'number', placeholder: '0.00', value: 0 },
      { id: 'faturamento', label: 'Faturamento Mensal Estimado ($)', type: 'number', placeholder: '0.00', value: 0 },
      { id: 'lucratividade', label: 'Lucratividade (%)', type: 'number', placeholder: '0%', value: 0, aiPrompt: 'Calcular a lucratividade média esperada com base nos dados fornecidos.' }
    ]
  }
];

export const LANDING_PAGE_DATA = {
  hero: {
    title: "Empirion – The Strategic Command v5.5 GOLD",
    subtitle: "A Arena Definitiva onde a Inteligência Artificial Gemini e a Estratégia Humana colidem em Simulações de Alta Performance.",
    cta: "Entrar na Arena",
    secondaryCta: "Conhecer Setores"
  },
  menuItems: [
    { id: "home", label: "Protocolo", icon: "Home" },
    { id: "features", label: "Engine", icon: "Zap" },
    { id: "branches", label: "Setores", icon: "Building" },
    { id: "ia", label: "Strategos AI", icon: "Brain" },
    { id: "community", label: "Network", icon: "Users" },
    { id: "roadmap", label: "Evolução", icon: "Map" }
  ],
  features: [
    { id: "feat-1", title: "Real-time Concurrency", description: "Infraestrutura Supabase para decisões coletivas instantâneas com latência zero.", icon: "Clock" },
    { id: "feat-2", title: "Gemini 3 Oracle", description: "O cérebro por trás da Gazeta e do Advisor. Raciocínio profundo aplicado ao seu Balanço.", icon: "Newspaper" },
    { id: "feat-3", title: "Deep Analytics", description: "Dashboards ApexCharts projetados para clareza máxima em cenários complexos.", icon: "BarChart3" },
    { id: "feat-4", title: "Master Command", description: "Controle granular para tutores: manipule a economia e desafie seus estrategistas.", icon: "Shield" },
    { id: "feat-5", title: "AI Business Builder", description: "Construa planos de negócios nível SEBRAE em minutos com automação total via IA.", icon: "FileText" }
  ],
  branchesOverview: [
    { id: "industrial", slug: "industrial", name: "Industrial", icon: "Factory", color: "text-blue-400", bg: "bg-blue-500/10", description: "CapEx massivo, obsolescência e cadeias de suprimento globais.", cta: "Explorar Módulo" },
    { id: "commercial", slug: "commercial", name: "Comercial", icon: "ShoppingCart", color: "text-emerald-400", bg: "bg-emerald-500/10", description: "Varejo híbrido e algoritmos de satisfação do consumidor SIMCO.", cta: "Explorar Módulo" },
    { id: "services", slug: "services", name: "Serviços", icon: "Briefcase", color: "text-indigo-400", bg: "bg-indigo-500/10", description: "Capital intelectual, formação técnica e prestígio de marca SISERV.", cta: "Explorar Módulo" },
    { id: "agribusiness", slug: "agribusiness", name: "Agronegócio", icon: "Tractor", color: "text-amber-400", bg: "bg-amber-500/10", description: "Ativos biológicos, clima real e sazonalidade SIAGRO.", cta: "Explorar Módulo" },
    { id: "finance", slug: "finance", name: "Financeiro", icon: "DollarSign", color: "text-rose-400", bg: "bg-rose-500/10", description: "Gestão bancária, hedge e volatilidade de mercado SINVEST.", cta: "Explorar Módulo" },
    { id: "construction", slug: "construction", name: "Construção", icon: "Hammer", color: "text-orange-400", bg: "bg-orange-500/10", description: "Obras pesadas, licitações e gestão de riscos estruturais.", cta: "Explorar Módulo" }
  ],
  branchesDetailData: {
    industrial: {
      title: "Célula Industrial",
      subtitle: "Dominância de Manufatura e Escala.",
      description: "O motor industrial clássico. Gerencie máquinas Alfa, Beta e Gama, cuide da depreciação e antecipe-se às quebras de estoque em até 15 regiões.",
      features: [
        "Gestão de Maquinário (Vida Útil & Manutenção).",
        "Compras de Longo Prazo vs Spot.",
        "Relatórios de Eficiência Produtiva OEE.",
        "Análises Gemini sobre custo marginal."
      ],
      kpis: ["OEE Index", "Unit Margin", "Inventory Turnover", "TSR"],
      templateExample: "Indústria de bens duráveis com alto CapEx inicial."
    },
    commercial: {
      title: "Hub Comercial",
      subtitle: "Varejo Híbrido e Customer Experience.",
      description: "Equilibre a operação de lojas físicas com o crescimento explosivo do e-commerce. Gerencie comissões e mantenha o CSAT (Satisfação) no topo.",
      features: [
        "Mix de Canais (Físico vs Digital).",
        "Logística de Última Milha.",
        "Gestão de Força de Vendas e CRM.",
        "Feedback dinâmico do consumidor final."
      ],
      kpis: ["CSAT Score", "E-com Conversion", "CAC/LTV", "Stock Loss Rate"],
      templateExample: "Varejista nacional em transição digital completa."
    },
    services: {
      title: "Matriz de Serviços",
      subtitle: "Economia do Conhecimento e Imagem.",
      description: "Seu maior ativo volta para casa todas as noites. Treine seu corpo técnico e gerencie contratos de alta complexidade com foco em QA.",
      features: [
        "Níveis de Formação Profissional.",
        "Qualidade Intrínseca vs Percebida.",
        "Retenção de Talentos & Turnover.",
        "Estratégias de Branding Corporativo."
      ],
      kpis: ["Brand Value", "Billable Hours", "Staff Retention", "NPS"],
      templateExample: "Consultoria de TI focada em Transformação Digital."
    },
    agribusiness: {
      title: "Cooperativa Agro",
      subtitle: "Sazonalidade e Ativos Biológicos.",
      description: "Plante, colha e processe. O risco climático é seu maior adversário. Use IA para prever quebras de safra e garantir o financiamento rural.",
      features: [
        "Monitoramento de Ciclo Biológico.",
        "Hedge de Commodities Chicago/B3.",
        "Logística de Armazenagem Perecível.",
        "Gestão de Crédito Rural Safra."
      ],
      kpis: ["Yield/Hectare", "Bio Loss Rate", "Hedge Efficiency", "Climate Index"],
      templateExample: "Cooperativa de Grãos com foco em exportação de valor agregado."
    },
    finance: {
      title: "Banco de Investimentos",
      subtitle: "Spread, Risco e Liquidez.",
      description: "Opere no mercado financeiro. Gerencie carteiras de crédito, fundos de investimento e proteja o capital contra a inflação e câmbio.",
      features: [
        "Análise de Risco de Crédito.",
        "Gestão de Portfólio SINVEST.",
        "Captação via CDB/LCA/LCI.",
        "Algoritmos de Arbitragem Real-time."
      ],
      kpis: ["Net Interest Margin", "Sharpe Ratio", "Default Rate", "Capital Adequacy"],
      templateExample: "Boutique de investimentos em cenário de alta volatilidade."
    },
    construction: {
      title: "Construtora de Elite",
      subtitle: "Infraestrutura e Projetos de Longo Prazo.",
      description: "Participe de licitações bilionárias. Gerencie prazos críticos, custos de materiais e riscos climáticos em grandes canteiros de obras.",
      features: [
        "Cálculo de Proposta para Licitação.",
        "Gestão de Cronograma Físico-Financeiro.",
        "CapEx em Equipamentos Pesados.",
        "Previsão de Fluxo de Caixa de Obra."
      ],
      kpis: ["Project Margin", "Delay Risk Index", "SPI/CPI", "HSE Compliance"],
      templateExample: "Construtora focada em Parcerias Público-Privadas."
    }
  },
  iaFeatures: {
    title: "Strategos Oracle AI",
    description: "Um núcleo cognitivo projetado para transformar dados frios em inteligência competitiva pura.",
    items: [
      { title: "Strategic Reasoning", desc: "Raciocínio lógico profundo para decisões complexas." },
      { title: "Market Grounding", desc: "Dados reais da economia global via Google Search." },
      { title: "Dynamic Reporting", desc: "Análise narrativa do seu Balanço e DRE P1/P12." },
      { title: "Predictive Alpha", desc: "Projeções baseadas em comportamento de bots e players." }
    ]
  },
  community: {
    title: "Global Competitive Network",
    description: "Milhares de estrategistas competindo em arenas públicas monitoradas pela comunidade global.",
    stats: [
      { label: "Brain Cycles", val: "2.4M" },
      { label: "Active Arenas", val: "840" },
      { label: "AI Entities", val: "12k" }
    ]
  },
  roadmap: [
    { version: "v5.6", item: "Batch Automation: Rodadas em tempo real sem interrupção." },
    { version: "v5.8", item: "ESG Engine: Penalidades ambientais e créditos de carbono." },
    { version: "v6.0", item: "War Room Mobile: Controle total no seu smartphone." },
    { version: "v6.5", item: "Metals Arena: Simulação de mineração e siderurgia profunda." }
  ]
};

export const BRANCH_CONFIGS: Record<string, { label: string; icon: string; description: string }> = {
  industrial: { label: 'Industrial', icon: '🏭', description: 'Produção, CapEx e supply chain.' },
  commercial: { label: 'Comercial', icon: '🏪', description: 'Giro de estoque, markup e logística.' },
  services: { label: 'Serviços', icon: '🤝', description: 'Capital humano e entrega de projetos.' },
  agribusiness: { label: 'Agronegócio', icon: '🌱', description: 'Ativos biológicos e commodities globais.' },
  finance: { label: 'Mercado Financeiro', icon: '🏛️', description: 'Investimentos, risco e spread.' },
  construction: { label: 'Construção Civil', icon: '🏗️', description: 'Obras, materiais e financiamento longo prazo.' }
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'ind-basico',
    name: "Industrial Básico - Bernard P1 Legacy",
    branch: "industrial",
    sector: "Indústria Bens Duráveis",
    description: "Fidelidade total ao modelo Bernard Sistemas. 9 regiões, Matéria-Prima A/B, máquinas depreciadas. Ativo Inicial: 9.176.940.",
    is_public: true,
    config: { 
      currency: "BRL", 
      round_frequency_days: 15, 
      total_rounds: 12, 
      sales_mode: "internal", 
      scenario_type: "simulated", 
      transparency_level: "medium", 
      team_fee: 0, 
      community_enabled: true, 
      regionsCount: 9 
    },
    initial_financials: {
      balance_sheet: { 
        current_assets: { 
          cash: 0, 
          accounts_receivable: 1823735, 
          inventory_raw_a: 628545, 
          inventory_raw_b: 838060, 
          inventory_finished: 0, 
          prepaid_expenses: 0,
          portfolio_investments: 150000
        }, 
        non_current_assets: { 
          pp_e: { machinery: 2360000, buildings: 5440000, land: 1200000 }, 
          accumulated_depreciation: -2825400 
        }, 
        total_assets: 9176940 
      },
      liabilities_equity: { 
        current_liabilities: { 
          accounts_payable: 717605, 
          short_term_loans: 1872362, 
          taxes_payable: 13045, 
          dividends_payable: 18481 
        }, 
        non_current_liabilities: { long_term_loans: 1500000 }, 
        equity: { capital_stock: 5000000, retained_earnings: 55447 }, 
        total_liabilities_equity: 9176940 
      }
    },
    products: [{ name: "Produto Padrão", unit_cost_base: 40.4, suggested_price: 340, initial_stock: 0, max_capacity: 9700 }],
    resources: { water_consumption_monthly: 1800000, energy_consumption_monthly: 450000, co2_emissions_monthly: 1200 },
    market_indicators: { 
      inflation_rate: 1.0, 
      interest_rate_tr: 2.0, 
      supplier_interest: 1.5, 
      demand_regions: [8392, 8392, 8392, 8392, 8392, 8392, 8392, 8392, 12592], 
      raw_a_price: 20.2, 
      raw_b_price: 40.4, 
      distribution_cost: 50.5, 
      marketing_cost_unit: 10200, 
      machine_alfa_price: 505000, 
      machine_beta_price: 1515000, 
      machine_gama_price: 3030000, 
      average_salary: 1300 
    }
  }
];

export const MOCK_CHAMPIONSHIPS = [
  {
    id: 'c1',
    name: 'Arena Industrial - Temporada Alpha',
    description: 'A mais alta fidelidade ao modelo clássico industrial de gestão estratégica.',
    branch: 'industrial',
    salesMode: 'internal',
    scenarioType: 'simulated',
    currency: 'BRL',
    currentRound: 1,
    totalRounds: 12,
    status: 'active',
    startDate: '2025-01-01',
    teamFee: 0,
    transparencyLevel: 'medium',
    regionsCount: 9
  }
];
