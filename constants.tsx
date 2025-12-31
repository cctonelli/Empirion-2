
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
  industrial: { label: 'Industrial', icon: '🏭', description: 'Focus on production, CapEx, and supply chain.' },
  commercial: { label: 'Commercial', icon: '🏪', description: 'Retail management, inventory turnover, and pricing.' },
  services: { label: 'Services', icon: '🤝', description: 'Human capital, project delivery, and customer LTV.' },
  agribusiness: { label: 'Agribusiness', icon: '🌱', description: 'Climate impact, biological assets, and global commodities.' }
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 'industrial-v4',
    name: "Industrial Básico - Máquinas Alfa/Beta/Gama",
    branch: "industrial",
    sector: "Indústria de Bens Duráveis",
    description: "Simulação clássica com 9 regiões, 2 matérias-primas, 3 tipos de máquinas e mercado compartilhado.",
    is_public: true,
    config: {
      currency: "BRL",
      round_frequency_days: 15,
      total_rounds: 12,
      sales_mode: "internal",
      scenario_type: "simulated",
      transparency_level: "medium",
      team_fee: 0.00,
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
          prepaid_expenses: 0
        },
        non_current_assets: {
          pp_e: {
            machinery: 2360000,
            buildings: 5440000,
            land: 1200000
          },
          accumulated_depreciation: -3111900
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
        non_current_liabilities: {
          long_term_loans: 1500000
        },
        equity: {
          capital_stock: 5000000,
          retained_earnings: 55444
        },
        total_liabilities_equity: 9176940
      }
    },
    products: [
      {
        name: "Produto Padrão",
        unit_cost_base: 40.4,
        suggested_price: 340,
        initial_stock: 0,
        max_capacity: 9700
      }
    ],
    resources: {
      water_consumption_monthly: 1800000,
      energy_consumption_monthly: 450000,
      co2_emissions_monthly: 1200
    },
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
    id: 'agro-v4',
    name: "Café Premium Híbrido",
    branch: "agribusiness",
    sector: "Agronegócio de Exportação",
    description: "Produção de café de alta qualidade com vendas locais e internacionais e exposição a variação cambial.",
    is_public: true,
    config: {
      currency: "BRL",
      round_frequency_days: 30,
      total_rounds: 8,
      sales_mode: "hybrid",
      scenario_type: "simulated",
      transparency_level: "high",
      team_fee: 250.00,
      community_enabled: true,
      regionsCount: 5
    },
    initial_financials: {
      balance_sheet: {
        current_assets: {
          cash: 150000,
          accounts_receivable: 500000,
          inventory_raw_a: 120000,
          inventory_raw_b: 0,
          inventory_finished: 450000,
          prepaid_expenses: 5000
        },
        non_current_assets: {
          pp_e: {
            machinery: 1200000,
            buildings: 2000000,
            land: 5000000
          },
          accumulated_depreciation: -800000
        },
        total_assets: 8625000
      },
      liabilities_equity: {
        current_liabilities: {
          accounts_payable: 300000,
          short_term_loans: 1000000,
          taxes_payable: 25000,
          dividends_payable: 0
        },
        non_current_liabilities: {
          long_term_loans: 2000000
        },
        equity: {
          capital_stock: 5000000,
          retained_earnings: 300000
        },
        total_liabilities_equity: 8625000
      }
    },
    products: [
      {
        name: "Saca Café Gourmet (60kg)",
        unit_cost_base: 280.0,
        suggested_price: 1200,
        initial_stock: 500,
        max_capacity: 2000
      }
    ],
    resources: {
      water_consumption_monthly: 4500000,
      energy_consumption_monthly: 120000,
      co2_emissions_monthly: 800
    },
    market_indicators: {
      inflation_rate: 0.8,
      interest_rate_tr: 1.5,
      supplier_interest: 1.2,
      demand_regions: [1200, 1500, 1100, 900, 3000],
      raw_a_price: 45.0,
      raw_b_price: 0.0,
      distribution_cost: 150.0,
      marketing_cost_unit: 5000,
      machine_alfa_price: 250000,
      machine_beta_price: 600000,
      machine_gama_price: 1200000,
      average_salary: 1800
    }
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
