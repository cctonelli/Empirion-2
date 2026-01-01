
import { ChampionshipTemplate, Branch } from './types';

export const COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  accent: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const LANDING_PAGE_DATA = {
  hero: {
    title: "Empirion – Business Intelligence Arena v5.5 GOLD",
    subtitle: "Forge Your Empire with AI-Driven Strategic Insight",
    cta: "Start Your Empire",
    secondaryCta: "Explore Features"
  },
  menuItems: [
    { id: "home", label: "Início", icon: "Home" },
    { id: "features", label: "Funcionalidades", icon: "Zap" },
    { id: "branches", label: "Setores", icon: "Building" },
    { id: "ia", label: "Inteligência Artificial", icon: "Brain" },
    { id: "community", label: "Comunidade", icon: "Users" },
    { id: "roadmap", label: "Roadmap", icon: "Map" }
  ],
  features: [
    { id: "feat-1", title: "Simulação Realtime", description: "Decisões colaborativas com Supabase Channels e sincronia instantânea entre membros do time.", icon: "Clock" },
    { id: "feat-2", title: "Gazeta Industrial IA", description: "Notícias e análises de mercado geradas dinamicamente por Gemini 3 Pro baseadas no seu desempenho.", icon: "Newspaper" },
    { id: "feat-3", title: "Dashboards ApexCharts", description: "KPIs avançados, Market Share e indicadores macroeconômicos visualizados em tempo real.", icon: "BarChart3" },
    { id: "feat-4", title: "Command Center Admin", description: "Controle total para tutores: ajuste de inflação, demanda e eventos de 'Cisne Negro'.", icon: "Shield" }
  ],
  branchesOverview: [
    { id: "industrial", slug: "industrial", name: "Industrial", icon: "Factory", color: "text-blue-600", bg: "bg-blue-50", description: "Gestão completa de produção, suprimentos, máquinas Alfa/Beta/Gama e supply chain complexo.", cta: "Ver Detalhes" },
    { id: "commercial", slug: "commercial", name: "Comercial", icon: "ShoppingCart", color: "text-emerald-600", bg: "bg-emerald-50", description: "Varejo híbrido, e-commerce, comissões de venda e satisfação do consumidor (SIMCO).", cta: "Ver Detalhes" },
    { id: "services", slug: "services", name: "Serviços", icon: "Briefcase", color: "text-indigo-600", bg: "bg-indigo-50", description: "Níveis de formação, qualidade de imagem corporativa e gestão de contratos técnicos (SISERV).", cta: "Ver Detalhes" },
    { id: "agribusiness", slug: "agribusiness", name: "Agronegócio", icon: "Tractor", color: "text-amber-600", bg: "bg-amber-50", description: "Ativos biológicos, perecibilidade, sazonalidade de safra e Yield biotecnológico (SIAGRO).", cta: "Ver Detalhes" },
    { id: "finance", slug: "finance", name: "Financeiro", icon: "DollarSign", color: "text-rose-600", bg: "bg-rose-50", description: "Gestão de bancos, investimentos, hedge cambial, fundos e volatilidade de mercado real.", cta: "Ver Detalhes" },
    { id: "construction", slug: "construction", name: "Construção", icon: "Hammer", color: "text-orange-600", bg: "bg-orange-50", description: "Obras, licitações, gestão de materiais, prazos de projeto e riscos climáticos em tempo real.", cta: "Ver Detalhes" }
  ],
  branchesDetailData: {
    industrial: {
      title: "Simulação Industrial",
      subtitle: "Gestão completa de produção, suprimentos e CapEx em mercado compartilhado.",
      description: "Foco total na eficiência produtiva e gestão de ativos fixos. O simulador industrial exige coordenação fina entre a compra de matérias-primas e a manutenção da capacidade das máquinas.",
      features: [
        "Decisões em máquinas (Alfa/Beta/Gama) e compras spot/long-term.",
        "Obsolescência, depreciação, greves e eventos Black Swan.",
        "Relatórios regionais (até 15 regiões) e tomada de ativos.",
        "Integração IA: Gazeta Industrial com análises profundas Gemini."
      ],
      kpis: ["Market Share", "Margem Líquida", "TSR", "Produtividade Máquinas"],
      templateExample: "Template clássico com 3 produtos duráveis e bolsa fictícia dinâmica."
    },
    commercial: {
      title: "Simulação Comercial",
      subtitle: "Varejo híbrido, gestão de canais e satisfação do cliente final.",
      description: "Inspirado no modelo SIMCO, este ramo foca na distribuição e no equilíbrio entre lojas físicas e o canal digital (E-commerce).",
      features: [
        "Canais híbridos: tradicional + e-commerce (% alocação).",
        "Produtos perecíveis/duráveis com perda de estoque e sazonalidade.",
        "Antecipação de recebíveis e comissões para força de vendas.",
        "Gráficos de satisfação do consumidor e indicadores de conversão online."
      ],
      kpis: ["Channel Yield", "Consumer Satisfaction Index", "Stock Turnover", "Digital ROI"],
      templateExample: "Lojas de departamento com mix variado de eletrônicos e bens de consumo."
    },
    services: {
      title: "Simulação de Serviços",
      subtitle: "Capital humano, qualidade de entrega e prestígio de marca.",
      description: "O modelo SISERV foca no ativo mais valioso de uma empresa de serviços: o conhecimento. Gerencie equipes de diferentes níveis de formação.",
      features: [
        "3 níveis de formação: baixa/média/alta (limpeza, técnicos, consultores).",
        "Contratos prévios (multas por atraso) vs. contratos imediatos (spot).",
        "Qualidade e imagem da empresa acumulada rodada a rodada.",
        "Motivação de RH e produtividade sensível a salários e treinamento."
      ],
      kpis: ["Brand Prestige", "Labor Efficiency", "Quality Assurance Score", "Contract Renewal Rate"],
      templateExample: "Empresa de Consultoria Tech com foco em projetos de alta complexidade."
    },
    agribusiness: {
      title: "Simulação de Agronegócio",
      subtitle: "Commodities, clima real e perecibilidade biológica.",
      description: "O motor SIAGRO simula o ciclo de vida do campo. Decisões de plantio, colheita e logística cooperativa em um ambiente de alto risco climático.",
      features: [
        "Perecibilidade de estoque biológico e sazonalidade de safra real.",
        "Cadeia cooperativa e produtores rurais como fornecedores críticos.",
        "Financiamentos rurais específicos e horas-extras de colheita.",
        "Alertas IA para equilíbrio entre produção e venda no mercado futuro."
      ],
      kpis: ["Yield Safra", "Perishability Loss Rate", "Commodity Price Hedge", "Climate Resilience"],
      templateExample: "Cooperativa de Grãos com processamento industrial e exportação."
    },
    finance: {
      title: "Simulação Financeira",
      subtitle: "Bancos, investimentos e gestão de hedge em volatilidade real.",
      description: "Foco no mercado de capitais e gestão de spread. Simule a operação de um banco comercial ou um fundo de investimentos (SINVEST).",
      features: [
        "Gestão de carteira de crédito e fundos de investimentos.",
        "Empréstimos, hedge cambial e juros, aplicações de recursos.",
        "Indicadores de bolsa fictícia + modo Real (APIs CVM/BCB).",
        "Ranking por retorno de portfólio e risco ajustado (Sharpe Ratio)."
      ],
      kpis: ["Spread Bancário", "Return on Portfolio", "Capital Adequacy Ratio", "Risk Premium"],
      templateExample: "Banco de Investimentos operando em cenário de alta volatilidade inflacionária."
    },
    construction: {
      title: "Simulação de Construção",
      subtitle: "Obras pesadas, licitações e gestão de projetos complexos.",
      description: "Gerencie grandes canteiros de obras. O sucesso depende da gestão de prazos e do controle rigoroso dos custos de materiais e mão-de-obra.",
      features: [
        "Participação em licitações públicas/privadas com propostas de valor.",
        "Prazos de obra reais, riscos de atraso e multas contratuais.",
        "CapEx em terrenos e instalações pesadas (maquinário de obra).",
        "Eventos de clima e greves impactando o cronograma físico-financeiro."
      ],
      kpis: ["Project Margin", "Schedule Adherence (SPI)", "Quality Compliance", "Safety Index"],
      templateExample: "Construtora de infraestrutura urbana em expansão regional."
    }
  },
  iaFeatures: {
    title: "Strategos AI Oracle",
    description: "Nosso núcleo cognitivo oferece raciocínio profundo para decisões estratégicas de alto nível.",
    items: [
      { title: "Análise Grounded", desc: "Pesquisa real de mercado via Google Search integrado." },
      { title: "Projeções Contábeis", desc: "Cálculos automáticos de ROI, EBITDA e Ponto de Equilíbrio." },
      { title: "Strategic Advisor", desc: "Recomendações táticas personalizadas para sua empresa." },
      { title: "Black Swan Protocol", desc: "Simulação de eventos globais de impacto imprevisível." }
    ]
  },
  community: {
    title: "Junte-se à Arena Global",
    description: "Participe de campeonatos públicos, acompanhe o Community Score e receba avaliações de observadores ativos no mercado.",
    stats: [
      { label: "Usuários Ativos", val: "15k+" },
      { label: "Arenas Criadas", val: "1.2k" },
      { label: "Decisões Processadas", val: "1M+" }
    ]
  },
  roadmap: [
    { version: "v5.6", item: "Engine de Processamento Batch Automatizado" },
    { version: "v5.8", item: "ESG Score System & Sustentabilidade" },
    { version: "v6.0", item: "App Mobile War Room (iOS/Android)" },
    { version: "v6.2", item: "Modo Real com Integração de APIs Bancárias" }
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
  },
  {
    id: 'serv-prof',
    name: "Serviços Qualificados - SISERV Legacy",
    branch: "services",
    sector: "Consultoria & Tecnologia",
    description: "Inspirado no SISERV. Foco em capital humano com 3 níveis de formação (Baixa, Média, Alta). Gestão de Imagem da Empresa e Qualidade de Entrega.",
    is_public: true,
    config: { 
      currency: "BRL", 
      round_frequency_days: 30, 
      total_rounds: 12, 
      sales_mode: "internal", 
      scenario_type: "simulated", 
      transparency_level: "medium", 
      team_fee: 0, 
      community_enabled: true, 
      regionsCount: 5 
    },
    initial_financials: {
      balance_sheet: { 
        current_assets: { cash: 300000, accounts_receivable: 500000, inventory_raw_a: 0, inventory_raw_b: 0, inventory_finished: 0, prepaid_expenses: 50000 }, 
        non_current_assets: { pp_e: { machinery: 500000, buildings: 2000000, land: 0 }, accumulated_depreciation: -400000 }, 
        total_assets: 2450000 
      },
      liabilities_equity: { 
        current_liabilities: { accounts_payable: 150000, short_term_loans: 300000, taxes_payable: 45000, dividends_payable: 0 }, 
        non_current_liabilities: { long_term_loans: 500000 }, 
        equity: { capital_stock: 1000000, retained_earnings: 455000 }, 
        total_liabilities_equity: 2450000 
      }
    },
    products: [
      { name: "Consultoria Técnica", unit_cost_base: 150, suggested_price: 450, initial_stock: 0, max_capacity: 5000, formation_level: 'mid' }
    ],
    resources: { water_consumption_monthly: 50000, energy_consumption_monthly: 80000, co2_emissions_monthly: 20 },
    market_indicators: { 
      inflation_rate: 0.7, 
      interest_rate_tr: 1.8, 
      supplier_interest: 1.5, 
      demand_regions: [10000, 10000, 10000, 10000, 15000], 
      raw_a_price: 0, 
      raw_b_price: 0, 
      distribution_cost: 0, 
      marketing_cost_unit: 12000, 
      machine_alfa_price: 200000, 
      machine_beta_price: 500000, 
      machine_gama_price: 1000000, 
      average_salary: 3500 
    }
  },
  {
    id: 'comm-retail',
    name: "Lojas de Departamento - SIMCO Legacy",
    branch: "commercial",
    sector: "Varejo Híbrido",
    description: "Inspirado no SIMCO. Mercado dividido entre Lojas Físicas e E-commerce. Gestão de comissão de vendedores, satisfação do cliente e canais digitais.",
    is_public: true,
    config: { 
      currency: "BRL", 
      round_frequency_days: 15, 
      total_rounds: 12, 
      sales_mode: "hybrid", 
      scenario_type: "simulated", 
      transparency_level: "medium", 
      team_fee: 0, 
      community_enabled: true, 
      regionsCount: 8 
    },
    initial_financials: {
      balance_sheet: { 
        current_assets: { cash: 250000, accounts_receivable: 850000, inventory_raw_a: 0, inventory_raw_b: 0, inventory_finished: 500000, prepaid_expenses: 0 }, 
        non_current_assets: { pp_e: { machinery: 1000000, buildings: 4000000, land: 2000000 }, accumulated_depreciation: -1200000 }, 
        total_assets: 7400000 
      },
      liabilities_equity: { 
        current_liabilities: { accounts_payable: 400000, short_term_loans: 1200000, taxes_payable: 20000, dividends_payable: 0 }, 
        non_current_liabilities: { long_term_loans: 2000000 }, 
        equity: { capital_stock: 3000000, retained_earnings: 780000 }, 
        total_liabilities_equity: 7400000 
      }
    },
    products: [
      { name: "Bens de Consumo", unit_cost_base: 65, suggested_price: 240, initial_stock: 8000, max_capacity: 100000, is_durable: true, obsolescence_rate: 0.05 }
    ],
    resources: { water_consumption_monthly: 200000, energy_consumption_monthly: 100000, co2_emissions_monthly: 150 },
    market_indicators: { 
      inflation_rate: 0.9, 
      interest_rate_tr: 2.1, 
      supplier_interest: 1.8, 
      demand_regions: [12000, 12000, 12000, 12000, 12000, 12000, 12000, 20000], 
      raw_a_price: 70, 
      raw_b_price: 10, 
      distribution_cost: 25, 
      marketing_cost_unit: 9500, 
      machine_alfa_price: 400000, 
      machine_beta_price: 1200000, 
      machine_gama_price: 2500000, 
      average_salary: 1550,
      ecommerce_adoption_rate: 0.22,
      climate_status: 'optimal'
    }
  },
  {
    id: 'agro-coop',
    name: "Agro Cooperativa - SIAGRO Legacy",
    branch: "agribusiness",
    sector: "Processamento de Grãos",
    description: "Inspirado no SIAGRO. Gestão de perecibilidade, sazonalidade de safra e Yield tecnológico. Foco em exportação e mercado interno.",
    is_public: true,
    config: { 
      currency: "BRL", 
      round_frequency_days: 30, 
      total_rounds: 12, 
      sales_mode: "hybrid", 
      scenario_type: "simulated", 
      transparency_level: "high", 
      team_fee: 0, 
      community_enabled: true, 
      regionsCount: 6 
    },
    initial_financials: {
      balance_sheet: { 
        current_assets: { cash: 500000, accounts_receivable: 1200000, inventory_raw_a: 400000, inventory_raw_b: 0, inventory_finished: 0, prepaid_expenses: 0 }, 
        non_current_assets: { pp_e: { machinery: 5000000, buildings: 2000000, land: 10000000 }, accumulated_depreciation: -1000000 }, 
        total_assets: 18100000 
      },
      liabilities_equity: { 
        current_liabilities: { accounts_payable: 300000, short_term_loans: 1000000, taxes_payable: 50000, dividends_payable: 0 }, 
        non_current_liabilities: { long_term_loans: 5000000 }, 
        equity: { capital_stock: 10000000, retained_earnings: 1750000 }, 
        total_liabilities_equity: 18100000 
      }
    },
    products: [
      { name: "Grão Beneficiado", unit_cost_base: 80, suggested_price: 220, initial_stock: 5000, max_capacity: 50000, is_perishable: true, perishability_rate: 0.15 }
    ],
    resources: { water_consumption_monthly: 5000000, energy_consumption_monthly: 200000, co2_emissions_monthly: 800 },
    market_indicators: { 
      inflation_rate: 0.8, 
      interest_rate_tr: 1.5, 
      supplier_interest: 1.2, 
      demand_regions: [15000, 15000, 15000, 15000, 15000, 25000], 
      raw_a_price: 65, 
      raw_b_price: 15, 
      distribution_cost: 35, 
      marketing_cost_unit: 8000, 
      machine_alfa_price: 800000, 
      machine_beta_price: 2000000, 
      machine_gama_price: 4500000, 
      average_salary: 1450,
      seasonality_index: 1.2, // Harvest season
      climate_status: 'optimal'
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
