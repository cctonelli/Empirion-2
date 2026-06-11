/**
 * EMPIRION SECULAR SYSTEM - MULTI-SECTOR INTERSTICES TYPES
 * Versão: v1.0.0 Future Ready
 * Data: 07 de Junho de 2026
 * 
 * Este arquivo define as estruturas de dados e contratos de negócio para novos setores do simulador,
 * permitindo integração desacoplada e modular de futuras Arenas e ecossistemas (Agronegócio, SaaS e Capital Markets).
 */

import { CurrencyType, KPIs } from '../types';

export type SimulationSector = 'industrial' | 'agribusiness' | 'capital_markets' | 'services_saas';

/**
 * Contrato Genérico de Motor de Regras por Setor (Strategy Pattern)
 */
export interface ISectorRulesEngine<TDecision = any, TState = any, TConfig = any> {
  sector: SimulationSector;
  
  /**
   * Processa a transição contábil-operacional de um round individual de equipe.
   */
  calculateTurnover(
    currentState: TState,
    decision: TDecision,
    marketIndicators: any,
    sectorConfig: TConfig
  ): Promise<TState>;

  /**
   * Valida as restrições e integridade de uma tomada de decisão setorial.
   * Retorna uma lista de strings contendo alertas ou erros de impedimento de commit.
   */
  validateDecision(decision: TDecision, sectorConfig: TConfig): string[];

  /**
   * Inicializa o patrimônio e contas contábeis de abertura (Período zero) para o setor.
   */
  generateInitialBalance(setupConfig: any): any;
}

/**
 * --- SECÇÃO DE ESPECIFICAÇÃO: AGRONEGÓCIO / BIOLOGICAL ASSETS (CPC 29 / IAS 41) ---
 */

export type CropStatus = 'plantio' | 'crescimento' | 'maturacao' | 'colhido' | 'perda';

export interface BiologicalAssetInstance {
  id: string;
  cultureType: 'soja' | 'milho' | 'algodao' | 'cafe';
  glebeSizeHectares: number;
  currentAgeRounds: number;
  roundsToHarvest: number;
  cumulativeCost: number;
  estimatedFairValue: number; // Valoração contábil reativa (CPC 29)
  status: CropStatus;
  humidityRate: number;
  infestationRiskPercent: number;
}

export interface AgribusinessEcosystemState extends KPIs {
  crops: BiologicalAssetInstance[];
  silo_capacity_tons: number;
  stored_grains_tons: Record<string, number>;
  cpr_hedging_contracts: Array<{
    id: string;
    grain_type: string;
    contract_volume_tons: number;
    strike_price: number;
    maturity_round: number;
    funding_type: 'physical_delivery' | 'financial_settlement';
  }>;
}

/**
 * --- SECÇÃO DE ESPECIFICAÇÃO: FINANÇAS E MERCADO DE CAPITAIS (CPC 48 / IFRS 9) ---
 */

export interface DebentureIssuance {
  id: string;
  face_value: number;
  interest_coupon_annual: number;
  maturity_rounds: number;
  outstanding_balance: number;
  holder_entity: 'tutor_bot' | 'external_funds';
}

export interface CapitalMarketsEcosystemState extends KPIs {
  current_share_price: number;
  outstanding_shares_qty: number;
  treasury_shares_qty: number;
  market_capitalization_value: number;
  issued_debentures: DebentureIssuance[];
  fx_hedge_derivatives: Array<{
    id: string;
    notional_value_usd: number;
    strike_rate: number;
    maturity_round: number;
    option_type: 'call' | 'put' | 'forward';
  }>;
}

/**
 * --- SECÇÃO DE ESPECIFICAÇÃO: SERVIÇOS RECORRENTES / SAAS (CPC 47 / IFRS 15) ---
 */

export interface SaasCustomerCohort {
  id: string;
  tier_name: 'basic' | 'pro' | 'enterprise';
  customer_count: number;
  monthly_recurring_revenue: number; // MRR
  average_contract_length_months: number;
  churn_rate_percent: number;
}

export interface SaasEcosystemState extends KPIs {
  deferred_revenue_balance: number; // Receita Diferida (Passivo CPC 47)
  active_cohorts: SaasCustomerCohort[];
  monthly_recurring_revenue_total: number;
  customer_lifetime_value_ltv: number;
  customer_acquisition_cost_cac: number;
  ltv_to_cac_ratio: number;
}

/**
 * --- SECÇÃO DE ESPECIFICAÇÃO: COOPERATIVISMO E CRÉDITO ASSOCIATIVO ---
 */

export interface CooperativeTransaction {
  id: string;
  associated_id: string;
  transaction_type: 'ato_cooperativo' | 'ato_nao_cooperativo';
  volume_value: number;
  margin_rate: number;
}

export interface CooperativeEcosystemState extends KPIs {
  fates_reserve_balance: number; // Fundo de Assistência Técnica, Educacional e Social (FATES)
  legal_reserve_balance: number; // Fundo de Reserva Legal obrigatório
  outstanding_cooperative_loans: number; // Carteira de empréstimos concedidos a associados
  cooperative_transactions_history: CooperativeTransaction[];
  total_accrued_surplus: number; // Sobras líquidas acumuladas (Equivalente a Lucros retidos)
  associated_members_count: number; // Número de cooperados ativos
}

/**
 * --- SECÇÃO DE ESPECIFICAÇÃO: COMÉRCIO (VAREJO E ATACADO - RETAIL) ---
 */

export interface RetailProductLine {
  id: string;
  name: string;
  purchase_unit_cost: number; // Custo de aquisição junto a fornecedores
  selling_price: number;
  stock_qty: number;
  minimum_required_stock: number;
  stockout_events_count: number; // Rupturas de gôndola registradas na rodada
  estimated_demand: number;
}

export interface RetailEcosystemState extends KPIs {
  product_lines: RetailProductLine[];
  acquiring_card_fees: number; // Custos de adquirente de cartão consolidados
  distribution_center_rent: number; // Custo de locação física e logística fiduciária
  marketing_mkt_footprint_index: number; // Atratividade comercial da marca
  average_collection_period_days: number; // Prazo médio de recebimento de clientes
}

/**
 * --- SECÇÃO DE ESPECIFICAÇÃO: CONSTRUÇÃO CIVIL E INCORPORAÇÃO (REAL ESTATE / POC) ---
 */

export interface ActiveConstructionProject {
  id: string;
  project_name: string;
  total_budgeted_cost: number; // Custo Total Orçado do Empreendimento
  accumulated_costs_incurred: number; // Custos já incorridos (Canteiro de obras, insumos consumidos)
  percentage_of_completion_poc: number; // % Conclusão (Incorridos / Orçados)
  total_recognized_revenue: number; // Receita já reconhecida na DRE via POC
  sales_revenue_contracted: number; // Valor de vendas contratadas na planta
  warranty_provision_balance: number; // Ativo/Passivo de provisão de garantia de defeitos
}

export interface ConstructionEcosystemState extends KPIs {
  active_projects: ActiveConstructionProject[];
  incc_index_adjustment: number; // Índice reajuste de insumos (INCC)
  landbank_value: number; // Carteira de terrenos disponíveis para incorporação
}

