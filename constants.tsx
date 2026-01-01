
import { Branch, BusinessPlanSection, ChampionshipTemplate } from './types';

export const COLORS = {
  primary: '#020617',
  secondary: '#1e293b',
  accent: '#3b82f6',
  gold: '#fbbf24',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const MENU_STRUCTURE = [
  { label: 'home', path: '/' },
  { 
    label: 'branches', 
    path: '/branches',
    sub: [
      { id: 'industrial', label: 'Industrial', path: '/branches/industrial', icon: 'Factory' },
      { id: 'commercial', label: 'Comercial', path: '/branches/commercial', icon: 'ShoppingCart' },
      { id: 'services', label: 'Serviços', path: '/branches/services', icon: 'Briefcase' },
      { id: 'agribusiness', label: 'Agronegócio', path: '/branches/agribusiness', icon: 'Tractor' },
      { id: 'finance', label: 'Financeiro', path: '/branches/finance', icon: 'DollarSign' },
      { id: 'construction', label: 'Construção', path: '/branches/construction', icon: 'Hammer' },
    ]
  },
  { label: 'features', path: '/features' },
  { 
    label: 'solutions', 
    path: '/solutions',
    sub: [
      { id: 'uni', label: 'Universidades', path: '/solutions/universities' },
      { id: 'corp', label: 'Corporativo', path: '/solutions/corporate' },
      { id: 'tourney', label: 'Torneios Abertos', path: '/solutions/tournaments' },
    ]
  },
  { label: 'rewards', path: '/rewards' },
  { label: 'blog', path: '/blog' },
  { label: 'contact', path: '/contact' }
];

export const EMPIRE_REWARDS_DATA = {
  title: "Empire Rewards Protocol",
  subtitle: "Onde o prestígio estratégico se transforma em ativos reais.",
  tiers: [
    { name: "Iniciante", pts: "0", color: "text-slate-400" },
    { name: "Mestre Regional", pts: "5.000", color: "text-blue-400" },
    { name: "Cezar da Indústria", pts: "25.000", color: "text-gold" },
    { name: "Oráculo Supremo", pts: "100.000", color: "text-indigo-400" }
  ],
  accumulation: [
    { action: "Criar Arena", val: "+500 pts" },
    { action: "Rodada Finalizada", val: "+100 pts" },
    { action: "Indicação Validada", val: "+1.000 pts" },
    { action: "Vitória (TSR Top 1)", val: "+5.000 pts" }
  ]
};

// Expanded LANDING_PAGE_DATA with all properties required by LandingPage component
export const LANDING_PAGE_DATA = {
  hero: {
    title: "Empirion – The Strategic Command v5.5 GOLD",
    subtitle: "A Arena Definitiva onde a Inteligência Artificial Gemini e a Estratégia Humana colidem em Simulações de Alta Performance.",
    cta: "Entrar na Arena",
    secondaryCta: "Conhecer Setores",
    nodeLabel: "Neural Node Status: Active",
    protocol: "Empirion Protocol Initializing..."
  },
  menuItems: [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Recursos' },
    { id: 'branches', label: 'Setores' },
    { id: 'ia', label: 'Strategos AI' },
    { id: 'community', label: 'Comunidade' },
    { id: 'roadmap', label: 'Evolução' }
  ],
  features: [
    { id: 'realtime', icon: 'Clock' },
    { id: 'grounding', icon: 'Globe' },
    { id: 'analytics', icon: 'BarChart3' },
    { id: 'security', icon: 'Shield' },
    { id: 'audit', icon: 'FileText' }
  ],
  branchesOverview: [
    { id: 'ind', slug: 'industrial', bg: 'bg-blue-600/10', color: 'text-blue-400', icon: 'Factory' },
    { id: 'com', slug: 'commercial', bg: 'bg-emerald-600/10', color: 'text-emerald-400', icon: 'ShoppingCart' },
    { id: 'ser', slug: 'services', bg: 'bg-indigo-600/10', color: 'text-indigo-400', icon: 'Briefcase' },
    { id: 'agr', slug: 'agribusiness', bg: 'bg-amber-600/10', color: 'text-amber-400', icon: 'Tractor' },
    { id: 'fin', slug: 'finance', bg: 'bg-rose-600/10', color: 'text-rose-400', icon: 'DollarSign' },
    { id: 'con', slug: 'construction', bg: 'bg-orange-600/10', color: 'text-orange-400', icon: 'Hammer' }
  ],
  branchesDetailData: {
    industrial: { features: ['Manufatura 4.0', 'Supply Chain IA', 'Capacidade Fabril'], kpis: ['OEE', 'Markup', 'Giro'], templateExample: 'SIND-Build-Legacy' },
    commercial: { features: ['Omnichannel', 'Mix de Produtos', 'Price Elasticity'], kpis: ['Share', 'CAC', 'Churn'], templateExample: 'SIMCO-Commerce' },
    services: { features: ['Corpo Técnico', 'Qualidade de Entrega', 'Project ROI'], kpis: ['NPS', 'Utilização', 'LTV'], templateExample: 'SISERV-Fidelity' },
    agribusiness: { features: ['Safra Dinâmica', 'Hedge Financeiro', 'Agro-Tech'], kpis: ['Yield', 'EBITDA/Ha', 'Loss'], templateExample: 'SIAGRO-Core' },
    finance: { features: ['Capital de Giro', 'Análise de Risco', 'Portfolio'], kpis: ['ROE', 'WACC', 'Liquidez'], templateExample: 'SIFIN-Banking' },
    construction: { features: ['Gestão de Obras', 'BIM Analysis', 'Controle de Insumos'], kpis: ['Evolução', 'Margem', 'QA'], templateExample: 'SICON-Master' }
  },
  roadmap: [
    { version: 'v5.5', item: 'Grounding Neural Engine' },
    { version: 'v5.6', item: 'Multiplayer Realtime Nodes' },
    { version: 'v6.0', item: 'Global Arena Federation' }
  ]
};

// Exported BRANCH_CONFIGS for ChampionshipWizard
export const BRANCH_CONFIGS: Record<Branch, { label: string; icon: string }> = {
  industrial: { label: 'Industrial', icon: '🏭' },
  commercial: { label: 'Comercial', icon: '🛒' },
  services: { label: 'Serviços', icon: '💼' },
  agribusiness: { label: 'Agronegócio', icon: '🚜' },
  finance: { label: 'Financeiro', icon: '💰' },
  construction: { label: 'Construção', icon: '🔨' },
};

// Exported CHAMPIONSHIP_TEMPLATES for ChampionshipWizard
export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'ind-master',
    name: 'Industrial Mastery 2026',
    branch: 'industrial',
    sector: 'Manufatura Pesada',
    description: 'A arena definitiva para testar sua capacidade de gestão industrial em larga escala.',
    is_public: true,
    config: {
      currency: 'BRL',
      round_frequency_days: 7,
      total_rounds: 12,
      sales_mode: 'hybrid',
      scenario_type: 'simulated',
      transparency_level: 'medium',
      team_fee: 500,
      community_enabled: true,
      regionsCount: 9
    },
    initial_financials: {
        balance_sheet: {
            current_assets: { cash: 1000000, accounts_receivable: 1823735, inventory_raw_a: 200000, inventory_raw_b: 200000, inventory_finished: 0, prepaid_expenses: 0 },
            non_current_assets: { pp_e: { machinery: 2360000, buildings: 1000000, land: 1200000 }, accumulated_depreciation: 0 },
            total_assets: 9176940
        },
        liabilities_equity: {
            current_liabilities: { accounts_payable: 300000, short_term_loans: 0, taxes_payable: 0, dividends_payable: 0 },
            non_current_liabilities: { long_term_loans: 1000000 },
            equity: { capital_stock: 7876940, retained_earnings: 0 },
            total_liabilities_equity: 9176940
        }
    },
    products: [{ name: 'Alfa-Core Industrial', unit_cost_base: 180, suggested_price: 340, initial_stock: 30000, max_capacity: 50000 }],
    resources: { water_consumption_monthly: 1000, energy_consumption_monthly: 5000, co2_emissions_monthly: 200 },
    market_indicators: {
        inflation_rate: 4, interest_rate_tr: 12, supplier_interest: 15, demand_regions: [12000, 12000, 12000, 12000, 12000, 12000, 12000, 12000, 12000],
        raw_a_price: 15, raw_b_price: 10, distribution_cost: 2, marketing_cost_unit: 10200,
        machine_alfa_price: 100000, machine_beta_price: 150000, machine_gama_price: 200000, average_salary: 1300
    }
  }
];

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
      { id: 'segmentacao', label: 'Segmentação de Clientes', type: 'textarea', placeholder: 'Quem é o seu público-alvo?', value: '', aiPrompt: 'Descreva o perfil ideal de cliente para este negócio.' },
      { id: 'concorrencia', label: 'Análise da Concorrência', type: 'textarea', placeholder: 'Quem são seus rivais?', value: '', aiPrompt: 'Analise os pontos fortes e fracos da concorrência.' }
    ]
  }
];
