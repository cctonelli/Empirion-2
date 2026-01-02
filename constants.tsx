
import { Branch, BusinessPlanSection, ChampionshipTemplate, ModalityType } from './types';

export const COLORS = {
  primary: '#020617',
  secondary: '#1e293b',
  accent: '#3b82f6',
  gold: '#fbbf24',
  sebrae_orange: '#f97316',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const MODALITY_INFO: Record<ModalityType, { label: string; desc: string; icon: string }> = {
  standard: { label: 'Arena Padrão', desc: 'Simulação clássica multisetorial.', icon: 'Layers' },
  business_round: { label: 'Rodada de Negócios', desc: 'Disputa comercial intensa por preço e mercado.', icon: 'Gavel' },
  factory_efficiency: { label: 'Chão-de-Fábrica', desc: 'Foco em Engenharia de Produção, OEE e Automação.', icon: 'Cpu' }
};

export const DEFAULT_PAGE_CONTENT: Record<string, any> = {
  'landing': {
    hero: {
      title: "Empirion",
      empire: "BI Arena",
      subtitle: "A Arena Definitiva onde a Inteligência Artificial Gemini e a Estratégia Humana colidem em Simulações de Alta Performance.",
      cta: "Entrar na Arena",
      secondaryCta: "Ver Atividades"
    },
    carousel: [
      { id: 1, title: "Industrial Mastery 2026", subtitle: "Inscrições abertas para a maior arena fabril do país.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000", badge: "Live Arena", link: "/solutions/open-tournaments" },
      { id: 2, title: "Rodada de Negócios", subtitle: "Domine a guerra de preços e o caixa em cenários de alta inflação.", image: "https://images.unsplash.com/photo-1454165833767-131f72a1030c?q=80&w=2000", badge: "Alta Intensidade", link: "/activities/rodada-negocios" },
      { id: 3, title: "Chão-de-Fábrica", subtitle: "Otimize cada segundo da produção com MRP e Lean Manufacturing.", image: "https://images.unsplash.com/photo-1565034946487-077786996e27?q=80&w=2000", badge: "Estratégia Lean", link: "/activities/chao-de-fabrica" }
    ],
    features: [
      { id: 'f1', title: "Concorrência Real-time", desc: "Infraestrutura Supabase para decisões coletivas instantâneas.", icon: "Zap" },
      { id: 'f2', title: "Oráculo Gemini 3", desc: "Raciocínio profundo aplicado ao seu Balanço e DRE.", icon: "Brain" },
      { id: 'f3', title: "Master Command", desc: "Controle granular para tutores: manipule a economia.", icon: "Shield" }
    ],
    badges: [
      { id: 'm1', name: "Mestre Industrial", pts: 500, desc: "Alcance o topo do ranking TSR 5 vezes.", icon: "Factory", color: "text-blue-400" },
      { id: 'e1', name: "Herói ESG", pts: 300, desc: "Mantenha impacto ambiental zero.", icon: "Leaf", color: "text-emerald-400" },
      { id: 'o1', name: "Oracle Strategist", pts: 1000, desc: "Sincronização Elite com o Strategos AI.", icon: "Zap", color: "text-amber-400" }
    ],
    leaderboard: [
      { id: 'c1', name: "Industrial Mastery", status: "Rodada 5/12", teams: 14, lead: "Alpha Group" },
      { id: 'c2', name: "Rodada Suprema", status: "Rodada 2/10", teams: 8, lead: "BioCore SA" }
    ]
  },
  'solutions-bp': {
    title: "Strategos BP Wizard",
    subtitle: "Estruturação Profissional SEBRAE assistida por IA",
    steps: [
      { id: 0, label: 'Sumário Executivo', body: 'Visão geral do negócio e proposta de valor.' },
      { id: 1, label: 'Análise de Mercado', body: 'Estudo de concorrentes e segmentação.' },
      { id: 2, label: 'Plano de Marketing', body: 'Estratégia de canais e posicionamento.' },
      { id: 3, label: 'Plano Operacional', body: 'Layout, capacidade e processos.' },
      { id: 4, label: 'Plano Financeiro', body: 'Investimentos, DRE e fluxo de caixa.' },
      { id: 5, label: 'Cenários', body: 'Análise de riscos e cisnes negros.' }
    ]
  },
  'solutions-simulators': {
    title: "Intelligence Arenas",
    subtitle: "Escolha seu domínio estratégico",
    items: [
      { id: 'ind', label: 'Industrial', slug: 'industrial', desc: 'Produção massiva e CapEx.', icon: 'Factory' },
      { id: 'com', label: 'Comercial', slug: 'commercial', desc: 'Varejo e satisfação do cliente.', icon: 'ShoppingCart' },
      { id: 'ser', label: 'Serviços', slug: 'services', desc: 'Capital intelectual e qualidade.', icon: 'Briefcase' },
      { id: 'agr', label: 'Agro', slug: 'agribusiness', desc: 'Ativos biológicos e safras.', icon: 'Tractor' },
      { id: 'fin', label: 'Financeiro', slug: 'finance', desc: 'Liquidez, hedge e investimentos.', icon: 'DollarSign' },
      { id: 'con', label: 'Construção', slug: 'construction', desc: 'BIM e Gestão de Obras.', icon: 'Hammer' },
      { id: 'rn', label: 'Rodada de Negócios', slug: 'rodada-negocios', desc: 'Guerra de preços e caixa crítico.', icon: 'Gavel' },
      { id: 'cf', label: 'Chão-de-Fábrica', slug: 'chao-de-fabrica', desc: 'Eficiência lean e automação.', icon: 'Cpu' }
    ]
  },
  'activity-rodada-negocios': {
    name: "Rodada de Negócios",
    body: "Enfrente a volatilidade máxima do mercado em uma disputa comercial onde o preço e a gestão de caixa decidem o vencedor.",
    features: ["Inflação Programada", "Hedge de Contratos", "Elasticidade Extrema", "Guerra de Share"],
    kpis: ["Margem de Contribuição", "Cash Runway", "Market Share"]
  },
  'activity-chao-de-fabrica': {
    name: "Chão-de-Fábrica",
    body: "Otimize sua planta industrial utilizando metodologias MRP II e Just-in-Time para alcançar o OEE de classe mundial.",
    features: ["Gestão de Gargalos", "Níveis de Automação", "Setup SMED", "Lotes Dinâmicos"],
    kpis: ["OEE (Eficiência Geral)", "Lead Time", "Custo Unitário"]
  }
};

export const MENU_STRUCTURE = [
  { label: 'home', path: '/' },
  { 
    label: 'activities', 
    path: '/solutions/simulators',
    sub: [
      { id: 'ind', label: 'Industrial', path: '/activities/industrial', icon: 'Factory' },
      { id: 'com', label: 'Comercial', path: '/activities/commercial', icon: 'ShoppingCart' },
      { id: 'ser', label: 'Serviços', path: '/activities/services', icon: 'Briefcase' },
      { id: 'agr', label: 'Agro', path: '/activities/agribusiness', icon: 'Tractor' },
      { id: 'fin', label: 'Financeiro', path: '/activities/finance', icon: 'DollarSign' },
      { id: 'con', label: 'Construção', path: '/activities/construction', icon: 'Hammer' },
      { id: 'rn', label: 'Rodada de Negócios', path: '/activities/rodada-negocios', icon: 'Gavel' },
      { id: 'cf', label: 'Chão-de-Fábrica', path: '/activities/chao-de-fabrica', icon: 'Cpu' },
    ]
  },
  { 
    label: 'solutions', 
    path: '/solutions',
    sub: [
      { 
        id: 'arenas', 
        label: 'Arenas Virtuais', 
        path: '/solutions/simulators',
        sub: [
          { id: 'education', label: 'Educação', path: '/solutions/university' },
          { id: 'corporate', label: 'Corporativo', path: '/solutions/corporate' },
          { id: 'individual', label: 'Individual (Solo)', path: '/solutions/individual' }
        ]
      },
      { id: 'bp_ia', label: 'Strategos Wizard (BP)', path: '/solutions/business-plan', icon: 'PenTool' },
    ]
  },
  { label: 'features', path: '/features' },
  { label: 'contact', path: '/contact' }
];

export const LANDING_PAGE_DATA = {
  hero: {
    title: "Empirion – The Strategic Command v5.5 GOLD",
    subtitle: "A Arena Definitiva onde a Inteligência Artificial Gemini e a Estratégia Humana colidem.",
    cta: "Entrar na Arena",
    secondaryCta: "Conhecer Atividades"
  },
  branchesOverview: [
    { id: 'ind', slug: 'industrial', bg: 'bg-blue-600/10', color: 'text-blue-400', icon: 'Factory' },
    { id: 'com', slug: 'commercial', bg: 'bg-emerald-600/10', color: 'text-emerald-400', icon: 'ShoppingCart' },
    { id: 'ser', slug: 'services', bg: 'bg-indigo-600/10', color: 'text-indigo-400', icon: 'Briefcase' },
    { id: 'agr', slug: 'agribusiness', bg: 'bg-amber-600/10', color: 'text-amber-400', icon: 'Tractor' },
    { id: 'fin', slug: 'finance', bg: 'bg-rose-600/10', color: 'text-rose-400', icon: 'DollarSign' },
    { id: 'con', slug: 'construction', bg: 'bg-orange-600/10', color: 'text-orange-400', icon: 'Hammer' },
    { id: 'rn', slug: 'rodada-negocios', bg: 'bg-orange-600/10', color: 'text-orange-500', icon: 'Gavel' },
    { id: 'cf', slug: 'chao-de-fabrica', bg: 'bg-blue-600/10', color: 'text-blue-500', icon: 'Cpu' }
  ]
};

export const BRANCH_CONFIGS: Record<string, { label: string; icon: string }> = {
  industrial: { label: 'Industrial', icon: '🏭' },
  commercial: { label: 'Comercial', icon: '🛒' },
  services: { label: 'Serviços', icon: '💼' },
  agribusiness: { label: 'Agronegócio', icon: '🚜' },
  finance: { label: 'Financeiro', icon: '💰' },
  construction: { label: 'Construção', icon: '🔨' },
  'rodada-negocios': { label: 'Rodada de Negócios', icon: '🔨' },
  'chao-de-fabrica': { label: 'Chão-de-Fábrica', icon: '⚙️' }
};

// Fix: Add CHAMPIONSHIP_TEMPLATES and MOCK_ONGOING_CHAMPIONSHIPS to constants.tsx to resolve import errors
export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'industrial-elite',
    name: 'Industrial Elite Mastery',
    branch: 'industrial',
    sector: 'Heavy Industry',
    description: 'Foco em Capex pesado e gestão de longo prazo.',
    is_public: true,
    config: {
      currency: 'BRL',
      round_frequency_days: 7,
      total_rounds: 12,
      sales_mode: 'hybrid',
      scenario_type: 'simulated',
      transparency_level: 'medium',
      team_fee: 150,
      community_enabled: true,
      regionsCount: 9,
      modalityType: 'factory_efficiency'
    },
    initial_financials: {
       balance_sheet: {
          current_assets: { cash: 1000000, accounts_receivable: 500000, inventory_raw_a: 100000, inventory_raw_b: 100000, inventory_finished: 0, prepaid_expenses: 0 },
          non_current_assets: { pp_e: { machinery: 2000000, buildings: 1000000, land: 500000 }, accumulated_depreciation: 0 },
          total_assets: 5200000
       },
       liabilities_equity: {
          current_liabilities: { accounts_payable: 200000, short_term_loans: 0, taxes_payable: 0, dividends_payable: 0 },
          non_current_liabilities: { long_term_loans: 1000000 },
          equity: { capital_stock: 4000000, retained_earnings: 0 },
          total_liabilities_equity: 5200000
       }
    },
    products: [{ name: 'Alpha Insumo', unit_cost_base: 180, suggested_price: 340, initial_stock: 30000, max_capacity: 50000 }],
    resources: { water_consumption_monthly: 5000, energy_consumption_monthly: 12000, co2_emissions_monthly: 450 },
    market_indicators: { 
      inflation_rate: 0.01, interest_rate_tr: 0.02, supplier_interest: 0.05, 
      demand_regions: [12000, 15000, 11000, 14000, 16000, 13000, 12500, 14500, 15500],
      raw_a_price: 15.2, raw_b_price: 12.1, distribution_cost: 2.5, marketing_cost_unit: 1.2,
      machine_alfa_price: 250000, machine_beta_price: 450000, machine_gama_price: 850000, average_salary: 3500
    }
  }
];

export const MOCK_ONGOING_CHAMPIONSHIPS = [
  { id: '1', name: 'Industrial Mastery 2026', branch: 'industrial', round: '5/12', teams: 14, leader: 'Alpha Group' },
  { id: '2', name: 'Rodada Suprema', branch: 'commercial', round: '2/10', teams: 8, leader: 'BioCore SA' },
  { id: '3', name: 'Agro Elite Cup', branch: 'agribusiness', round: '8/12', teams: 20, leader: 'Fazenda Futuro' }
];
