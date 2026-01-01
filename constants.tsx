
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
  // --- INDUSTRIAL (Fiel aos Modelos Bernard Antigos - Image ID 0, 1, 5) ---
  {
    id: 'ind-basico',
    name: "Industrial Básico - Modelo Bernard P1",
    branch: "industrial",
    sector: "Indústria Bens Duráveis",
    description: "Simulação clássica 9 regiões, MP A/B, máquinas alfa/beta/gama. Ativo Total: 9.176.940. Fiel ao relatório de rodada 1 do sistema original.",
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
