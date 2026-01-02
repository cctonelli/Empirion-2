
import { Branch, BusinessPlanSection, ChampionshipTemplate, ModalityType } from './types';

export const COLORS = {
  primary: '#020617',
  secondary: '#1e293b',
  accent: '#3b82f6',
  gold: '#fbbf24',
  empire_orange: '#f97316',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const ALPHA_TEST_USERS = [
  { id: 'tutor', name: 'Tutor Teste', email: 'tutor@empirion.com.br', role: 'tutor', icon: 'Shield' },
  { id: 'alpha', name: 'Capitão Alpha', email: 'alpha@empirion.com.br', role: 'player', team: 'Equipe Alpha', icon: 'Zap' },
  { id: 'beta', name: 'Capitão Beta', email: 'beta@empirion.com.br', role: 'player', team: 'Equipe Beta', icon: 'Zap' },
  { id: 'gamma', name: 'Capitão Gamma', email: 'gamma@empirion.com.br', role: 'player', team: 'Equipe Gamma', icon: 'Zap' },
  { id: 'delta', name: 'Capitão Delta', email: 'delta@empirion.com.br', role: 'player', team: 'Equipe Delta', icon: 'Zap' },
];

export const DEMO_CHAMPIONSHIP_DATA = {
  id: 'alpha-test-2026',
  name: 'Teste Alpha Empirion - Indústria Brasileira',
  branch: 'industrial' as Branch,
  status: 'active',
  current_round: 1,
  total_rounds: 8,
  config: {
    modalityType: 'standard',
    rules: {
      random_events: true,
      obsolescence: true,
      inflation_schedule: { rate: 0.05 }
    }
  },
  initial_financials: {
    balance_sheet: {
      current_assets: { cash: 5000000, accounts_receivable: 2000000, inventory_raw_a: 1500000, inventory_raw_b: 1500000, total: 10000000 },
      non_current_assets: { pp_e: { machinery: 10000000, land: 0 }, accumulated_depreciation: -1000000, total: 9000000 },
      total_assets: 19000000
    },
    liabilities_equity: {
      current_liabilities: { accounts_payable: 1500000, short_term_loans: 1000000 },
      non_current_liabilities: { long_term_loans: 4000000 },
      equity: { capital_stock: 8000000, retained_earnings: 4500000 },
      total_liabilities_equity: 19000000
    }
  }
};

export const MODALITY_INFO: Record<ModalityType, { label: string; desc: string; icon: string }> = {
  standard: { label: 'Arena Padrão', desc: 'Simulação clássica multisetorial com foco em equilíbrio operacional.', icon: 'Layers' },
  business_round: { label: 'Rodada de Negócios', desc: 'Disputa comercial intensa por preço e mercado em alta volatilidade.', icon: 'Gavel' },
  factory_efficiency: { label: 'Chão-de-Fábrica', desc: 'Foco em Engenharia de Produção, OEE e Manufatura Enxuta.', icon: 'Cpu' }
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
      { id: 1, title: "Mastery Industrial", subtitle: "Aumente a eficiência do seu parque fabril no novo ciclo global.", image: "https://images.unsplash.com/photo-1614850523296-e811cf7eeea4?q=80&w=2000", badge: "Live Arena", link: "/solutions/open-tournaments" },
      { id: 2, title: "Rodada de Negócios", subtitle: "Domine a guerra de preços e o caixa em cenários de alta inflação.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000", badge: "Alta Intensidade", link: "/activities/rodada-negocios" },
      { id: 3, title: "Chão-de-Fábrica", subtitle: "Otimize cada segundo da produção com MRP e Lean Manufacturing.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000", badge: "Estratégia Lean", link: "/activities/chao-de-fabrica" }
    ],
    sectors: [
      { id: 'ind', name: "Industrial Node", slug: "industrial", description: "Simulação de parques fabris, otimização de OEE e gestão de cadeias de suprimentos globais.", icon: "Factory" },
      { id: 'com', name: "Commercial Hub", slug: "commercial", description: "Domínio de varejo híbrido, precificação dinâmica e elasticidade de demanda em arenas competitivas.", icon: "ShoppingCart" },
      { id: 'ser', name: "Services Matrix", slug: "services", description: "Gestão de capital intelectual, alocação de especialistas e prestígio de marca na economia do conhecimento.", icon: "Briefcase" },
      { id: 'agr', name: "Agro Cooperative", slug: "agribusiness", description: "Navegação em ciclos de ativos biológicos, hedge de commodities e impactos climáticos real-time.", icon: "Tractor" },
      { id: 'fin', name: "Financial Command", slug: "finance", description: "Operações em mercado de capitais, análise de risco de crédito e índices de solvência simulados.", icon: "DollarSign" },
      { id: 'con', name: "Construction Elite", slug: "construction", description: "Vencimento de licitações bilionárias, gestão de caminhos críticos e logística de insumos pesados.", icon: "Hammer" }
    ],
    features: [
      { id: 'f1', title: "Concorrência Real-time", desc: "Infraestrutura escalável para decisões coletivas instantâneas.", icon: "Zap" },
      { id: 'f2', title: "Oráculo Gemini 3", desc: "Raciocínio profundo aplicado ao seu Balanço e Gestão Estratégica.", icon: "Brain" },
      { id: 'f3', title: "Master Command", desc: "Controle granular para tutores: manipule a economia da arena.", icon: "Shield" }
    ],
    badges: [
      { id: 'm1', name: "Mestre Industrial", pts: 500, desc: "Alcance o topo do ranking de retorno 5 vezes.", icon: "Factory", color: "text-blue-400" },
      { id: 'e1', name: "Herói Sustentável", pts: 300, desc: "Mantenha impacto ambiental otimizado.", icon: "Leaf", color: "text-emerald-400" },
      { id: 'o1', name: "Oracle Strategist", pts: 1000, desc: "Sincronização Elite com o Strategos IA.", icon: "Zap", color: "text-amber-400" }
    ],
    leaderboard: [
      { id: 'c1', name: "Industrial Mastery", status: "Rodada 5/12", teams: 14, lead: "Alpha Group" },
      { id: 'c2', name: "Rodada Suprema", status: "Rodada 2/10", teams: 8, lead: "BioCore SA" }
    ]
  },
  'test-hub': {
    title: "Módulo de Testes Alpha",
    subtitle: "Acesso de Engenharia para avaliação de ambientes e mecânicas.",
    description: "Selecione o ambiente que deseja validar. O sistema realizará o bypass de autenticação automaticamente.",
    industrial: {
      name: "Industrial Alpha",
      desc: "Teste o motor industrial clássico: produção, OEE e Capex."
    }
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
    path: '/solutions/simulators',
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
  { 
    label: 'Teste', 
    path: '/test/industrial',
    sub: [
      { id: 'test-ind', label: 'Industrial', path: '/test/industrial', icon: 'Factory' }
    ]
  },
  { label: 'features', path: '/features' },
  { label: 'blog', path: '/blog' },
  { label: 'contact', path: '/contact' }
];

export const LANDING_PAGE_DATA = {
  hero: {
    title: "Empirion – Strategic Command v6.0",
    subtitle: "A Arena Definitiva onde a Inteligência Artificial Gemini e a Estratégia Humana colidem.",
    cta: "Entrar na Arena",
    secondaryCta: "Conhecer Atividades"
  }
};

export const BRANCH_CONFIGS: Record<string, { label: string; icon: string }> = {
  industrial: { label: 'Industrial', icon: '🏭' },
  commercial: { label: 'Comercial', icon: '🛒' },
  services: { label: 'Serviços', icon: '💼' },
  agribusiness: { label: 'Agronegócio', icon: '🚜' },
  finance: { label: 'Financeiro', icon: '💰' },
  construction: { label: 'Construção', icon: '🔨' },
  'rodada-negocios': { label: 'Rodada de Negócios', icon: '🤝' },
  'chao-de-fabrica': { label: 'Chão-de-Fábrica', icon: '⚙️' }
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'industrial-elite',
    name: 'Industrial Elite Mastery',
    branch: 'industrial',
    sector: 'Manufatura Global',
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
