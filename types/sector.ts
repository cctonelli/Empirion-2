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
