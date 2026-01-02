
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
  'activity-industrial': {
    name: "Industrial",
    heroImage: "https://images.unsplash.com/photo-1565034946487-077786996e27?q=80&w=2000",
    body: "Domine a produção de larga escala, gerencie ativos complexos e enfrente a obsolescência tecnológica em um mercado global hipercompetitivo.",
    description: "A Atividade Industrial é o coração do Empirion. Aqui, as equipes gerenciam parques fabris com máquinas de diferentes gerações (Alfa, Beta e Gama), cada uma com taxas de produtividade e manutenção distintas. O desafio envolve o equilíbrio entre o CapEx para modernização e o OpEx para manutenção da fluidez logística em 9 regiões.",
    features: ["Gestão de Maquinário Crítico", "Depreciação Acelerada", "Cadeia de Suprimentos Global", "Manutenção Preditiva IA"],
    kpis: ["OEE (Eficiência Geral)", "Custo Unitário de Produção", "TSR (Shareholder Return)"],
    accent: "orange"
  },
  'activity-commercial': {
    name: "Comercial",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000",
    body: "Conquiste o varejo híbrido, domine canais de e-commerce e utilize precificação dinâmica para aniquilar a concorrência.",
    description: "No Hub Comercial, o foco sai da fábrica e entra na mente do consumidor. Equipes devem equilibrar a expansão de lojas físicas com o investimento agressivo em canais digitais. A elasticidade-preço é o principal motor, onde centavos decidem o market share de regiões inteiras.",
    features: ["Canais Digitais vs. Físicos", "Elasticidade de Demanda", "Logística de Última Milha", "Algoritmos de Satisfação"],
    kpis: ["Market Share Consolidado", "Customer Satisfaction (CSAT)", "Margem de Contribuição"],
    accent: "blue"
  },
  'activity-services': {
    name: "Serviços",
    heroImage: "https://images.unsplash.com/photo-1454165833767-131f72a1030c?q=80&w=2000",
    body: "Gerencie o capital intelectual, otimize a formação técnica e construa um prestígio de marca inabalável na economia do conhecimento.",
    description: "Na Matriz de Serviços, seu maior ativo são as pessoas. O desafio é gerenciar a alocação de consultores e técnicos em projetos de alta complexidade, garantindo que o turnover não destrua o conhecimento acumulado. O prestígio da marca dita o prêmio que você pode cobrar sobre o custo da hora-homem.",
    features: ["Treinamento e Retenção", "Gestão de Qualidade (QA)", "Contratos de Longo Prazo", "Escalabilidade de Conhecimento"],
    kpis: ["Receita por Consultor", "Churn Rate de Talentos", "Brand Equity Index"],
    accent: "emerald"
  },
  'activity-agribusiness': {
    name: "Agronegócio",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000",
    body: "Opere na fronteira entre a tecnologia e a natureza. Gerencie ativos biológicos, climas voláteis e a sazonalidade extrema das safras.",
    description: "A Cooperativa Agro traz o risco climático real para dentro da arena. Use modelos preditivos para decidir entre plantio extensivo ou intensivo. O hedge de commodities e o financiamento rural são as ferramentas de sobrevivência em anos de quebra de safra.",
    features: ["Simulação Climática Real", "Ciclo de Ativos Biológicos", "Hedge de Commodities", "Sazonalidade Financeira"],
    kpis: ["Produtividade por Hectare", "Net Exposure (Câmbio/Preço)", "ROI Safra"],
    accent: "amber"
  },
  'activity-finance': {
    name: "Financeiro",
    heroImage: "https://images.unsplash.com/photo-1611974717483-3600991e56aa?q=80&w=2000",
    body: "Navegue pelo mercado de capitais, gerencie spread bancário e proteja o capital contra a inflação e a volatilidade cambial.",
    description: "A arena financeira é o simulador de bancos e fundos de investimento. O core é o gerenciamento de risco e liquidez. Equipes devem alocar capital em carteiras de crédito, fundos de hedge e operar no mercado secundário enquanto monitoram a taxa TR e inflação real.",
    features: ["Gestão de Carteira Bancária", "Análise de Risco de Crédito", "Arbitragem e Liquidez", "Compliance e Regulação"],
    kpis: ["ROE (Return on Equity)", "Índice de Basiléia", "Alpha de Investimento"],
    accent: "rose"
  },
  'activity-construction': {
    name: "Construção",
    heroImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000",
    body: "Erga infraestruturas bilionárias, vença licitações complexas e domine a gestão de prazos e orçamentos em obras de larga escala.",
    description: "A Construtora de Elite foca em gestão de projetos (BIM) e licitações. O desafio é o fluxo de caixa: como manter a operação viva durante anos de obra sem receita imediata. Riscos ambientais e multas contratuais por atraso são as variáveis que derrubam impérios nesta atividade.",
    features: ["Licitações por Menor Preço", "Gestão de Prazos Críticos", "Insumos e Matérias-Primas", "Impacto Ambiental e ESG"],
    kpis: ["Evolução de Obra (Budget vs Actual)", "Margem Líquida por Contrato", "Taxa de Acidentes/Segurança"],
    accent: "indigo"
  },
  'activity-rodada-negocios': {
    name: "Rodada de Negócios",
    heroImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000",
    body: "Enfrente a volatilidade máxima do mercado em uma disputa comercial onde o preço e a gestão de caixa decidem o vencedor em cenários de alta inflação.",
    description: "A modalidade 'Rodada de Negócios' é o treinamento intensivo para gestão de crise. Diferente das arenas padrão, aqui a inflação é composta e agressiva, e os clientes são extremamente sensíveis a preço. É uma guerra de trincheiras comerciais onde o fluxo de caixa é o único oxigênio disponível.",
    features: ["Inflação Composta Programada", "Hedge de Contratos Futuros", "Elasticidade de Demanda Extrema", "Guerra de Market Share"],
    kpis: ["Margem de Contribuição", "Cash Runway", "Resiliência Inflacionária"],
    accent: "orange"
  },
  'activity-chao-de-fabrica': {
    name: "Chão-de-Fábrica",
    heroImage: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2000",
    body: "Otimize sua planta industrial utilizando metodologias MRP II e Just-in-Time para alcançar o OEE de classe mundial e a manufatura enxuta.",
    description: "A modalidade 'Chão-de-Fábrica' é um mergulho profundo na Engenharia de Produção. As equipes devem decidir entre estratégias PUSH (MRP) ou PULL (Kanban/JIT). Cada segundo perdido em um gargalo (Theory of Constraints) ou em um setup de máquina mal planejado (SMED) impacta diretamente o custo unitário e a competitividade.",
    features: ["Gestão de Gargalos (OPT)", "Níveis de Automação 4.0", "Setup de Máquinas (SMED)", "Lotes Dinâmicos e Kanban"],
    kpis: ["OEE (Eficiência Geral)", "Manufacturing Lead Time", "WIP (Work in Progress)"],
    accent: "blue"
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
