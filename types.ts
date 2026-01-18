/**
 * EMPIRION V13.6 - ORACLE COCKPIT BUILD
 * Advanced high-density data structures for ERP-style orchestration.
 */

export type UserRole = 'admin' | 'tutor' | 'player' | 'observer';
export type Branch = 'industrial' | 'commercial' | 'services' | 'agribusiness' | 'finance' | 'construction';
export type SalesMode = 'internal' | 'external' | 'hybrid';
export type ScenarioType = 'simulated' | 'real';
export type RegionType = 'national' | 'international' | 'mixed';
export type AnalysisSource = 'parameterized' | 'ai_real_world';
export type ChampionshipStatus = 'draft' | 'active' | 'finished';
export type TransparencyLevel = 'low' | 'medium' | 'high' | 'full';
export type GazetaMode = 'anonymous' | 'identified';
export type ModalityType = 'standard' | 'business_round' | 'factory_efficiency';
export type CurrencyType = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type DeadlineUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
export type RecoveryMode = 'none' | 'extrajudicial' | 'judicial';
export type CreditRating = 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A';
export type InsolvencyStatus = 'SAUDAVEL' | 'ALERTA' | 'RJ' | 'BANKRUPT';

// Add missing DecisionData
export interface DecisionData {
  regions: Record<number, { price: number; term: number; marketing: number }>;
  hr: {
    hired: number;
    fired: number;
    salary: number;
    trainingPercent: number;
    participationPercent: number;
    sales_staff_count: number;
  };
  production: {
    purchaseMPA: number;
    purchaseMPB: number;
    paymentType: number;
    activityLevel: number;
    rd_investment: number;
  };
  finance: {
    loanRequest: number;
    application: number;
    buyMachines: {
      alfa: number;
      beta: number;
      gama: number;
    };
  };
  legal: {
    recovery_mode: string;
  };
}

// Add missing RegionalData
export interface RegionalData {
  region_id: number;
  region_name: string;
  demand: number;
  units_sold: number;
  market_share: number;
  avg_price: number;
  competitors_count: number;
}

// Add missing MenuItemConfig
export interface MenuItemConfig {
  id: string;
  label: string;
  path: string;
  isVisible: boolean;
}

// Add missing Modality
export interface Modality {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  page_content: {
    hero: { title: string; subtitle: string };
    features: string[];
    kpis: string[];
    accent_color?: 'blue' | 'emerald' | 'orange';
  };
}

// Add missing TeamProgress and AuditLog
export interface AuditLog {
  user_id: string;
  changed_at: string;
  field_path: string;
  new_value: any;
}

export interface TeamProgress {
  team_id: string;
  team_name: string;
  status: string;
  rating: CreditRating;
  risk: number;
  insolvent: boolean;
  master_key_enabled?: boolean;
  auditLogs?: AuditLog[];
}

export interface EcosystemConfig {
  scenario_type: ScenarioType;
  modality_type: ModalityType;
  inflation_rate: number;
  demand_multiplier: number;
  interest_rate: number;
  market_volatility: number;
}

export interface MacroIndicators {
  // Índices Variáveis (Planilha Tutor)
  growth_rate_ice: number;
  demand_variation: number;
  inflation_rate: number;
  delinquency_rate: number; // Inadimplência
  interest_rate_tr: number;
  interest_suppliers: number;
  interest_sales_avg: number;
  tax_rate_ir: number;
  late_fee_fine: number;
  machine_sale_discount: number; // Deságio
  
  // Índices de Reajuste
  readjust_raw_material: number;
  readjust_machine_alfa: number;
  readjust_machine_beta: number;
  readjust_machine_gama: number;
  readjust_marketing: number;
  readjust_distribution: number;
  readjust_storage: number;

  // Valores de Base (Valor Inicial / P0)
  prices: {
    mp_a: number;
    mp_b: number;
    distribution_unit: number;
    marketing_campaign: number;
  };
  machinery_values: {
    alfa: number;
    beta: number;
    gama: number;
  };
  hr_base: {
    salary: number;
    training: number;
    profit_sharing: number;
    misc: number;
  };
  
  active_event?: BlackSwanEvent;
  [key: string]: any;
}

// Add missing ChampionshipTemplate
export interface ChampionshipTemplate {
  id: string;
  name: string;
  description: string;
  branch: Branch;
}

export interface Championship {
  id: string;
  name: string;
  description: string;
  branch: Branch;
  status: ChampionshipStatus;
  current_round: number; 
  total_rounds: number;   
  deadline_value: number;
  deadline_unit: DeadlineUnit;
  round_frequency_days: number;
  regions_count: number; 
  bots_count: number; 
  region_type: RegionType; 
  analysis_source: AnalysisSource; 
  initial_share_price: number; 
  is_public?: boolean;
  config: any;
  market_indicators: MacroIndicators;
  kpis?: KPIs;
  initial_financials: any;
  round_started_at: string;
  is_trial?: boolean;
  teams?: Team[];
  created_at: string;
  sales_mode: SalesMode;
  scenario_type: ScenarioType;
  currency: CurrencyType;
  transparency_level: TransparencyLevel;
  gazeta_mode: GazetaMode;
  observers: string[] | any[];
  ecosystemConfig?: EcosystemConfig;
}

export interface Team { id: string; name: string; championship_id: string; status?: string; invite_code?: string; is_bot?: boolean; master_key_enabled?: boolean; kpis?: KPIs; insolvency_status?: InsolvencyStatus; intervention_log?: any[]; created_at?: string; credit_limit: number; equity: number; }
export interface KPIs { market_share: number; rating: CreditRating; insolvency_status: InsolvencyStatus; [key: string]: any; }
export interface ProjectionResult { revenue: number; netProfit: number; debtRatio: number; creditRating: CreditRating; health: any; kpis: KPIs; marketShare?: number; statements: any; }
export interface AccountNode { id: string; label: string; value: number; type: string; isEditable?: boolean; isReadOnly?: boolean; isTemplateAccount?: boolean; children?: AccountNode[]; }
export interface BlackSwanEvent { title: string; description: string; impact: string; modifiers: any; }
export interface BusinessPlan { id: string; championship_id: string; team_id: string; round: number; version: number; data: Record<number, string>; status: string; }

// Add phone property to UserProfile
export interface UserProfile { 
  id: string; 
  supabase_user_id: string; 
  name: string; 
  nickname?: string; 
  email: string; 
  role: UserRole; 
  created_at: string;
  phone?: string;
  is_opal_premium?: boolean;
}

export interface CommunityCriteria { id: string; label: string; weight: number; }