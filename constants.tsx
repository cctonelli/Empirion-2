import { ChampionshipTemplate } from './types';

export const COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  accent: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b'
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
  // --- INDUSTRIAL ---
  {
    id: 'ind-basico',
    name: "Industrial Básico - Máquinas Alfa/Beta/Gama",
    branch: "industrial",
    sector: "Indústria Bens Duráveis",
    description: "Simulação clássica 9 regiões, MP A/B, máquinas depreciadas. Fiel aos PDFs antigos.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 15, total_rounds: 12, sales_mode: "internal", scenario_type: "simulated", transparency_level: "medium", team_fee: 0, community_enabled: true, regionsCount: 9 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 0, accounts_receivable: 1823735, inventory_raw_a: 628545, inventory_raw_b: 838060, inventory_finished: 0, prepaid_expenses: 0 }, non_current_assets: { pp_e: { machinery: 2360000, buildings: 5440000, land: 1200000 }, accumulated_depreciation: -3111900 }, total_assets: 9176940 },
      liabilities_equity: { current_liabilities: { accounts_payable: 717605, short_term_loans: 1872362, taxes_payable: 13045, dividends_payable: 18481 }, non_current_liabilities: { long_term_loans: 1500000 }, equity: { capital_stock: 5000000, retained_earnings: 55444 }, total_liabilities_equity: 9176940 }
    },
    products: [{ name: "Produto Padrão", unit_cost_base: 40.4, suggested_price: 340, initial_stock: 0, max_capacity: 9700 }],
    resources: { water_consumption_monthly: 1800000, energy_consumption_monthly: 450000, co2_emissions_monthly: 1200 },
    market_indicators: { inflation_rate: 1.0, interest_rate_tr: 2.0, supplier_interest: 1.5, demand_regions: [8392, 8392, 8392, 8392, 8392, 8392, 8392, 8392, 12592], raw_a_price: 20.2, raw_b_price: 40.4, distribution_cost: 50.5, marketing_cost_unit: 10200, machine_alfa_price: 505000, machine_beta_price: 1515000, machine_gama_price: 3030000, average_salary: 1300 }
  },
  {
    id: 'ind-high-tech',
    name: "Industrial - Alta Tecnologia",
    branch: "industrial",
    sector: "Semicondutores",
    description: "Foco em R&D, depreciação rápida de equipamentos e alta sensibilidade ESG.",
    is_public: true,
    config: { currency: "USD", round_frequency_days: 30, total_rounds: 12, sales_mode: "hybrid", scenario_type: "simulated", transparency_level: "high", team_fee: 100, community_enabled: true, regionsCount: 4 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 500000, accounts_receivable: 1200000, inventory_raw_a: 400000, inventory_raw_b: 0, inventory_finished: 200000, prepaid_expenses: 50000 }, non_current_assets: { pp_e: { machinery: 8000000, buildings: 4000000, land: 1000000 }, accumulated_depreciation: -2000000 }, total_assets: 13350000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 800000, short_term_loans: 2000000, taxes_payable: 150000, dividends_payable: 0 }, non_current_liabilities: { long_term_loans: 4000000 }, equity: { capital_stock: 6000000, retained_earnings: 400000 }, total_liabilities_equity: 13350000 }
    },
    products: [{ name: "Processador Quântico", unit_cost_base: 450, suggested_price: 1800, initial_stock: 100, max_capacity: 500 }],
    resources: { water_consumption_monthly: 500000, energy_consumption_monthly: 2000000, co2_emissions_monthly: 150 },
    market_indicators: { inflation_rate: 0.5, interest_rate_tr: 1.0, supplier_interest: 0.8, demand_regions: [500, 600, 500, 800], raw_a_price: 120, raw_b_price: 0, distribution_cost: 200, marketing_cost_unit: 50000, machine_alfa_price: 2000000, machine_beta_price: 5000000, machine_gama_price: 10000000, average_salary: 4500 }
  },

  // --- COMMERCIAL ---
  {
    id: 'com-moda',
    name: "Comercial - Varejo Moda",
    branch: "commercial",
    sector: "Vestuário Premium",
    description: "Alto giro de estoque, markup alto e gestão intensiva de crédito a clientes.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 7, total_rounds: 24, sales_mode: "internal", scenario_type: "simulated", transparency_level: "medium", team_fee: 0, community_enabled: true, regionsCount: 3 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 200000, accounts_receivable: 800000, inventory_raw_a: 0, inventory_raw_b: 0, inventory_finished: 1500000, prepaid_expenses: 10000 }, non_current_assets: { pp_e: { machinery: 50000, buildings: 2000000, land: 0 }, accumulated_depreciation: -100000 }, total_assets: 4410000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 1200000, short_term_loans: 500000, taxes_payable: 45000, dividends_payable: 15000 }, non_current_liabilities: { long_term_loans: 1000000 }, equity: { capital_stock: 1500000, retained_earnings: 150000 }, total_liabilities_equity: 4410000 }
    },
    products: [{ name: "Coleção Estação", unit_cost_base: 85, suggested_price: 299, initial_stock: 10000, max_capacity: 50000 }],
    resources: { water_consumption_monthly: 50000, energy_consumption_monthly: 150000, co2_emissions_monthly: 20 },
    market_indicators: { inflation_rate: 1.2, interest_rate_tr: 3.0, supplier_interest: 2.0, demand_regions: [2000, 3000, 2500], raw_a_price: 0, raw_b_price: 0, distribution_cost: 15, marketing_cost_unit: 8000, machine_alfa_price: 20000, machine_beta_price: 50000, machine_gama_price: 100000, average_salary: 1900 }
  },
  {
    id: 'com-eletr',
    name: "Comercial - Importação Eletrônicos",
    branch: "commercial",
    sector: "Gadgets Importados",
    description: "Câmbio volátil, frete internacional e gestão de estoque importado de alto valor.",
    is_public: true,
    config: { currency: "USD", round_frequency_days: 15, total_rounds: 12, sales_mode: "hybrid", scenario_type: "simulated", transparency_level: "low", team_fee: 50, community_enabled: false, regionsCount: 2 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 100000, accounts_receivable: 400000, inventory_raw_a: 0, inventory_raw_b: 0, inventory_finished: 800000, prepaid_expenses: 20000 }, non_current_assets: { pp_e: { machinery: 20000, buildings: 500000, land: 0 }, accumulated_depreciation: -50000 }, total_assets: 1790000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 600000, short_term_loans: 300000, taxes_payable: 20000, dividends_payable: 0 }, non_current_liabilities: { long_term_loans: 500000 }, equity: { capital_stock: 300000, retained_earnings: 70000 }, total_liabilities_equity: 1790000 }
    },
    products: [{ name: "Smartphone Global", unit_cost_base: 450, suggested_price: 899, initial_stock: 1500, max_capacity: 5000 }],
    resources: { water_consumption_monthly: 10000, energy_consumption_monthly: 80000, co2_emissions_monthly: 400 },
    market_indicators: { inflation_rate: 0.2, interest_rate_tr: 0.5, supplier_interest: 0.3, demand_regions: [1000, 1200], raw_a_price: 0, raw_b_price: 0, distribution_cost: 45, marketing_cost_unit: 25000, machine_alfa_price: 15000, machine_beta_price: 30000, machine_gama_price: 60000, average_salary: 3200, exchange_rate: 5.5 }
  },

  // --- SERVICES ---
  {
    id: 'ser-cons',
    name: "Serviços - Consultoria Estratégica",
    branch: "services",
    sector: "Advisory",
    description: "Baixo estoque, alto Contas a Receber e folha de pagamento representando 70% dos custos.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 30, total_rounds: 12, sales_mode: "internal", scenario_type: "simulated", transparency_level: "full", team_fee: 0, community_enabled: true, regionsCount: 1 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 50000, accounts_receivable: 2500000, inventory_raw_a: 0, inventory_raw_b: 0, inventory_finished: 0, prepaid_expenses: 15000 }, non_current_assets: { pp_e: { machinery: 100000, buildings: 1500000, land: 0 }, accumulated_depreciation: -200000 }, total_assets: 2465000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 100000, short_term_loans: 200000, taxes_payable: 80000, dividends_payable: 50000 }, non_current_liabilities: { long_term_loans: 500000 }, equity: { capital_stock: 1000000, retained_earnings: 535000 }, total_liabilities_equity: 2465000 }
    },
    products: [{ name: "Projeto Estratégico", unit_cost_base: 2500, suggested_price: 15000, initial_stock: 0, max_capacity: 100 }],
    resources: { water_consumption_monthly: 20000, energy_consumption_monthly: 120000, co2_emissions_monthly: 5 },
    market_indicators: { inflation_rate: 0.5, interest_rate_tr: 1.5, supplier_interest: 1.0, demand_regions: [50], raw_a_price: 0, raw_b_price: 0, distribution_cost: 0, marketing_cost_unit: 15000, machine_alfa_price: 50000, machine_beta_price: 120000, machine_gama_price: 250000, average_salary: 8500 }
  },
  {
    id: 'ser-med',
    name: "Serviços - Clínica Médica",
    branch: "services",
    sector: "Healthcare",
    description: "Receita por procedimento, equipamentos médicos depreciados e alta regulação.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 30, total_rounds: 12, sales_mode: "internal", scenario_type: "real", transparency_level: "medium", team_fee: 100, community_enabled: true, regionsCount: 2 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 120000, accounts_receivable: 600000, inventory_raw_a: 50000, inventory_raw_b: 0, inventory_finished: 0, prepaid_expenses: 25000 }, non_current_assets: { pp_e: { machinery: 5000000, buildings: 3000000, land: 500000 }, accumulated_depreciation: -1200000 }, total_assets: 8095000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 250000, short_term_loans: 800000, taxes_payable: 45000, dividends_payable: 0 }, non_current_liabilities: { long_term_loans: 3000000 }, equity: { capital_stock: 4000000, retained_earnings: 0 }, total_liabilities_equity: 8095000 }
    },
    products: [{ name: "Checkup Avançado", unit_cost_base: 320, suggested_price: 2450, initial_stock: 0, max_capacity: 1500 }],
    resources: { water_consumption_monthly: 350000, energy_consumption_monthly: 900000, co2_emissions_monthly: 120 },
    market_indicators: { inflation_rate: 0.8, interest_rate_tr: 1.8, supplier_interest: 1.3, demand_regions: [800, 700], raw_a_price: 15.5, raw_b_price: 0, distribution_cost: 0, marketing_cost_unit: 32000, machine_alfa_price: 850000, machine_beta_price: 2100000, machine_gama_price: 4500000, average_salary: 4200 }
  },

  // --- AGRIBUSINESS ---
  {
    id: 'agr-pecuaria',
    name: "Agronegócio - Soja/Pecuária ILPF",
    branch: "agribusiness",
    sector: "Integração Rural",
    description: "Terras e gado, insumos dolarizados, eventos climáticos e créditos de carbono.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 30, total_rounds: 12, sales_mode: "hybrid", scenario_type: "simulated", transparency_level: "medium", team_fee: 150, community_enabled: true, regionsCount: 4 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 80000, accounts_receivable: 350000, inventory_raw_a: 200000, inventory_raw_b: 150000, inventory_finished: 400000, prepaid_expenses: 5000 }, non_current_assets: { pp_e: { machinery: 2500000, buildings: 1500000, land: 12000000 }, accumulated_depreciation: -1500000 }, total_assets: 15185000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 450000, short_term_loans: 1200000, taxes_payable: 35000, dividends_payable: 0 }, non_current_liabilities: { long_term_loans: 4500000 }, equity: { capital_stock: 8000000, retained_earnings: 1000000 }, total_liabilities_equity: 15185000 }
    },
    products: [{ name: "Saca de Soja", unit_cost_base: 85, suggested_price: 135, initial_stock: 5000, max_capacity: 20000 }],
    resources: { water_consumption_monthly: 8500000, energy_consumption_monthly: 45000, co2_emissions_monthly: -400 },
    market_indicators: { inflation_rate: 0.5, interest_rate_tr: 1.0, supplier_interest: 0.9, demand_regions: [1500, 1500, 1000, 1000], raw_a_price: 45, raw_b_price: 35, distribution_cost: 22, marketing_cost_unit: 1000, machine_alfa_price: 450000, machine_beta_price: 900000, machine_gama_price: 1800000, average_salary: 1650 }
  },
  {
    id: 'agr-cafe',
    name: "Agronegócio - Café Premium Export",
    branch: "agribusiness",
    sector: "Specialty Coffee",
    description: "Híbrido mercado local/exportação, cotação café live, ESG água/reuso.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 15, total_rounds: 24, sales_mode: "hybrid", scenario_type: "real", transparency_level: "high", team_fee: 250, community_enabled: true, regionsCount: 2 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 150000, accounts_receivable: 500000, inventory_raw_a: 120000, inventory_raw_b: 0, inventory_finished: 450000, prepaid_expenses: 5000 }, non_current_assets: { pp_e: { machinery: 1200000, buildings: 2000000, land: 5000000 }, accumulated_depreciation: -800000 }, total_assets: 8625000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 300000, short_term_loans: 1000000, taxes_payable: 25000, dividends_payable: 0 }, non_current_liabilities: { long_term_loans: 2000000 }, equity: { capital_stock: 5000000, retained_earnings: 300000 }, total_liabilities_equity: 8625000 }
    },
    products: [{ name: "Saca Café Gourmet", unit_cost_base: 280, suggested_price: 1200, initial_stock: 500, max_capacity: 2000 }],
    resources: { water_consumption_monthly: 4500000, energy_consumption_monthly: 120000, co2_emissions_monthly: 800 },
    market_indicators: { inflation_rate: 0.8, interest_rate_tr: 1.5, supplier_interest: 1.2, demand_regions: [1200, 1500], raw_a_price: 45, raw_b_price: 0, distribution_cost: 150, marketing_cost_unit: 5000, machine_alfa_price: 250000, machine_beta_price: 600000, machine_gama_price: 1200000, average_salary: 1800, exchange_rate: 5.5 }
  },

  // --- FINANCE ---
  {
    id: 'fin-banco',
    name: "Mercado Financeiro - Banco Comercial",
    branch: "finance",
    sector: "Retail Banking",
    description: "Ativo: Carteira de crédito/investimentos. Passivo: Depósitos. DRE: Spread e risco inadimplência.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 15, total_rounds: 24, sales_mode: "internal", scenario_type: "simulated", transparency_level: "low", team_fee: 500, community_enabled: false, regionsCount: 5 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 10000000, accounts_receivable: 50000000, inventory_raw_a: 0, inventory_raw_b: 0, inventory_finished: 0, prepaid_expenses: 0 }, non_current_assets: { pp_e: { machinery: 5000000, buildings: 15000000, land: 0 }, accumulated_depreciation: -2000000 }, total_assets: 78000000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 1000000, short_term_loans: 0, taxes_payable: 500000, dividends_payable: 200000, customer_deposits: 60000000 }, non_current_liabilities: { long_term_loans: 5000000 }, equity: { capital_stock: 10000000, retained_earnings: 1300000 }, total_liabilities_equity: 78000000 }
    },
    products: [{ name: "Crédito Pessoal", unit_cost_base: 0.02, suggested_price: 0.08, initial_stock: 0, max_capacity: 100000000 }],
    resources: { water_consumption_monthly: 150000, energy_consumption_monthly: 850000, co2_emissions_monthly: 45 },
    market_indicators: { inflation_rate: 0.4, interest_rate_tr: 10.5, supplier_interest: 8.5, demand_regions: [20000, 25000, 18000, 22000, 30000], raw_a_price: 0, raw_b_price: 0, distribution_cost: 0, marketing_cost_unit: 100000, machine_alfa_price: 100000, machine_beta_price: 250000, machine_gama_price: 500000, average_salary: 4800, risk_premium: 0.03 }
  },
  {
    id: 'fin-gestora',
    name: "Mercado Financeiro - Gestora Investimentos",
    branch: "finance",
    sector: "Asset Management",
    description: "Portfólio ações/renda fixa, fees de gestão e alta volatilidade de mercado.",
    is_public: true,
    config: { currency: "USD", round_frequency_days: 30, total_rounds: 12, sales_mode: "hybrid", scenario_type: "simulated", transparency_level: "high", team_fee: 300, community_enabled: true, regionsCount: 1 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 5000000, accounts_receivable: 500000, inventory_raw_a: 0, inventory_raw_b: 0, inventory_finished: 0, prepaid_expenses: 10000, portfolio_investments: 45000000 }, non_current_assets: { pp_e: { machinery: 200000, buildings: 1000000, land: 0 }, accumulated_depreciation: -100000 }, total_assets: 51610000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 200000, short_term_loans: 0, taxes_payable: 150000, dividends_payable: 0 }, non_current_liabilities: { long_term_loans: 0 }, equity: { capital_stock: 50000000, retained_earnings: 1260000 }, total_liabilities_equity: 51610000 }
    },
    products: [{ name: "Fundo Equities Alpha", unit_cost_base: 0.005, suggested_price: 0.02, initial_stock: 0, max_capacity: 500000000 }],
    resources: { water_consumption_monthly: 15000, energy_consumption_monthly: 200000, co2_emissions_monthly: 10 },
    market_indicators: { inflation_rate: 0.2, interest_rate_tr: 2.5, supplier_interest: 1.8, demand_regions: [100000], raw_a_price: 0, raw_b_price: 0, distribution_cost: 0, marketing_cost_unit: 50000, machine_alfa_price: 50000, machine_beta_price: 150000, machine_gama_price: 400000, average_salary: 12500, exchange_rate: 1.0 }
  },

  // --- CONSTRUCTION ---
  {
    id: 'con-residencia',
    name: "Construção - Incorporadora Residencial",
    branch: "construction",
    sector: "Real Estate",
    description: "Obras longo prazo, financiamento SFH, materiais voláteis e mão de obra sazonal.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 30, total_rounds: 36, sales_mode: "internal", scenario_type: "simulated", transparency_level: "medium", team_fee: 0, community_enabled: true, regionsCount: 3 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 2000000, accounts_receivable: 15000000, inventory_raw_a: 5000000, inventory_raw_b: 0, inventory_finished: 10000000, prepaid_expenses: 100000 }, non_current_assets: { pp_e: { machinery: 8000000, buildings: 2000000, land: 25000000 }, accumulated_depreciation: -2500000 }, total_assets: 62600000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 4000000, short_term_loans: 10000000, taxes_payable: 350000, dividends_payable: 150000 }, non_current_liabilities: { long_term_loans: 25000000 }, equity: { capital_stock: 20000000, retained_earnings: 3100000 }, total_liabilities_equity: 62600000 }
    },
    products: [{ name: "Apartamento Standard", unit_cost_base: 220000, suggested_price: 450000, initial_stock: 25, max_capacity: 200 }],
    resources: { water_consumption_monthly: 2500000, energy_consumption_monthly: 500000, co2_emissions_monthly: 4500 },
    market_indicators: { inflation_rate: 1.5, interest_rate_tr: 9.5, supplier_interest: 11.5, demand_regions: [15, 25, 12], raw_a_price: 85, raw_b_price: 0, distribution_cost: 0, marketing_cost_unit: 15000, machine_alfa_price: 1500000, machine_beta_price: 3500000, machine_gama_price: 8000000, average_salary: 2600 }
  },
  {
    id: 'con-infra',
    name: "Construção - Infraestrutura Pública",
    branch: "construction",
    sector: "Grandes Obras",
    description: "Projetos PPP, licitações, aditivos contratuais e riscos de atraso.",
    is_public: true,
    config: { currency: "BRL", round_frequency_days: 60, total_rounds: 12, sales_mode: "hybrid", scenario_type: "simulated", transparency_level: "low", team_fee: 1000, community_enabled: true, regionsCount: 2 },
    initial_financials: {
      balance_sheet: { current_assets: { cash: 5000000, accounts_receivable: 85000000, inventory_raw_a: 12000000, inventory_raw_b: 8000000, inventory_finished: 0, prepaid_expenses: 500000 }, non_current_assets: { pp_e: { machinery: 45000000, buildings: 12000000, land: 5000000 }, accumulated_depreciation: -8000000 }, total_assets: 164500000 },
      liabilities_equity: { current_liabilities: { accounts_payable: 18000000, short_term_loans: 35000000, taxes_payable: 1200000, dividends_payable: 0 }, non_current_liabilities: { long_term_loans: 80000000 }, equity: { capital_stock: 30000000, retained_earnings: 300000 }, total_liabilities_equity: 164500000 }
    },
    products: [{ name: "Km Rodovia Concluído", unit_cost_base: 850000, suggested_price: 1450000, initial_stock: 0, max_capacity: 500 }],
    resources: { water_consumption_monthly: 12000000, energy_consumption_monthly: 4500000, co2_emissions_monthly: 18500 },
    market_indicators: { inflation_rate: 0.7, interest_rate_tr: 7.5, supplier_interest: 6.5, demand_regions: [100, 150], raw_a_price: 120, raw_b_price: 95, distribution_cost: 0, marketing_cost_unit: 0, machine_alfa_price: 4500000, machine_beta_price: 12000000, machine_gama_price: 25000000, average_salary: 3100 }
  }
];

export const MOCK_CHAMPIONSHIPS = [
  {
    id: 'c1',
    name: 'Tech Frontier 2025',
    description: 'A high-stakes industrial simulation for electronics manufacturing.',
    branch: 'industrial',
    salesMode: 'hybrid',
    scenarioType: 'simulated',
    currency: 'BRL',
    currentRound: 2,
    totalRounds: 12,
    status: 'active',
    startDate: '2025-01-01',
    teamFee: 250,
    transparencyLevel: 'medium',
    regionsCount: 9
  },
  {
    id: 'c2',
    name: 'AgroBoost Global',
    description: 'Sustainable agribusiness management in the Brazilian interior.',
    branch: 'agribusiness',
    salesMode: 'external',
    scenarioType: 'real',
    currency: 'USD',
    currentRound: 0,
    totalRounds: 8,
    status: 'draft',
    startDate: '2025-02-15',
    teamFee: 500,
    transparencyLevel: 'low',
    regionsCount: 4
  }
];