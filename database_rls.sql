
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS PROTOCOL v19.3 SAPPHIRE
-- Foco: Integridade Contábil, Refatoração do Kernel e Fidelidade de KPIs
-- ==============================================================================

BEGIN;

-- 0. ATUALIZAÇÃO DE TELEMETRIA EM COMPANIES (LIVE & HISTÓRICO)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS supplier_interest_expenses NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS emergency_purchase_expenses NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS emergency_units_total INTEGER DEFAULT 0;

-- 1. ATUALIZAÇÃO DE TELEMETRIA EM TRIAL_COMPANIES (SANDBOX)
ALTER TABLE public.trial_companies 
ADD COLUMN IF NOT EXISTS supplier_interest_expenses NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS emergency_purchase_expenses NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS emergency_units_total INTEGER DEFAULT 0;

-- 2. ÍNDICES PARA MONITORAMENTO DE EFICIÊNCIA DE SUPRIMENTOS
CREATE INDEX IF NOT EXISTS idx_companies_emergency_exp ON public.companies (emergency_purchase_expenses DESC);
CREATE INDEX IF NOT EXISTS idx_companies_supplier_int ON public.companies (supplier_interest_expenses DESC);

-- 3. VIEW DE AUDITORIA DE SUPRIMENTOS PARA O TUTOR (NOVA)
DROP VIEW IF EXISTS public.view_supply_chain_health;
CREATE OR REPLACE VIEW public.view_supply_chain_health 
WITH (security_invoker = true)
AS
SELECT 
    c.championship_id,
    c.round,
    t.name as team_name,
    c.supplier_interest_expenses as interest_paid,
    c.emergency_purchase_expenses as emergency_costs,
    c.emergency_units_total as emergency_units,
    (c.emergency_purchase_expenses + c.supplier_interest_expenses) as total_supply_overhead
FROM public.companies c
JOIN public.teams t ON c.team_id = t.id;

-- 4. GARANTIR EXISTÊNCIA DA TABELA DE PERFIS (CORE)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_user_id UUID UNIQUE NOT NULL,
    name TEXT,
    nickname TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'player',
    is_opal_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1. ADIÇÃO DE COLUNAS DE TELEMETRIA E KPIs EM COMPANIES (LIVE & HISTÓRICO)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS revenue NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_profit NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_assets NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_mpa_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_mpb_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_recoverable NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_payable NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_assets_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_assets_depreciation NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ccc NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS interest_coverage NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_uk NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS compulsory_loan_balance NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS compulsory_loan_interest_paid NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tsr NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS nlcdg NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS solvency_score_kanitz NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS altman_z_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS dcf_valuation NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS scissors_effect NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS liquidity_current NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS solvency_index NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS inventory_turnover NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_receivable_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_payable_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_elasticity NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS carbon_footprint NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS market_share NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ebitda NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fco_livre NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS capex_manutencao NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS capex_estrategico NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS esds_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS esds_zone TEXT,
ADD COLUMN IF NOT EXISTS esds_gargalo TEXT,
ADD COLUMN IF NOT EXISTS esds_insights TEXT,
ADD COLUMN IF NOT EXISTS esds_top_gargalos JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS esds_main_drivers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS share_price NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_receivables NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_payables NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_rating TEXT CHECK (credit_rating = ANY (ARRAY['AAA'::text, 'AA'::text, 'A'::text, 'B'::text, 'C'::text, 'D'::text]));

-- 2. ADIÇÃO DE COLUNAS EM CHAMPIONSHIP_MACRO_RULES (ORACLE CORE)
ALTER TABLE public.championship_macro_rules
ADD COLUMN IF NOT EXISTS export_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_uk NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0;

-- 3. ADIÇÃO DE COLUNAS EM CHAMPIONSHIPS (BASE CONFIG)
ALTER TABLE public.championships
ADD COLUMN IF NOT EXISTS round_rules JSONB,
ADD COLUMN IF NOT EXISTS initial_financials JSONB,
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_share_price NUMERIC(20,2) DEFAULT 100.00;

-- 4. ADIÇÃO DE COLUNAS EM TRIAL_CHAMPIONSHIPS (BASE CONFIG)
ALTER TABLE public.trial_championships
ADD COLUMN IF NOT EXISTS total_rounds INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS sales_mode TEXT DEFAULT 'hybrid',
ADD COLUMN IF NOT EXISTS regions_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deadline_value INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deadline_unit TEXT DEFAULT 'hours',
ADD COLUMN IF NOT EXISTS transparency_level TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS gazeta_mode TEXT DEFAULT 'anonymous',
ADD COLUMN IF NOT EXISTS region_names TEXT[],
ADD COLUMN IF NOT EXISTS region_configs JSONB,
ADD COLUMN IF NOT EXISTS initial_financials JSONB,
ADD COLUMN IF NOT EXISTS market_indicators JSONB,
ADD COLUMN IF NOT EXISTS round_rules JSONB,
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_share_price NUMERIC(20,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT TRUE;

-- 5. ADIÇÃO DE COLUNAS DE TELEMETRIA E KPIs EM TRIAL_COMPANIES (SANDBOX)
ALTER TABLE public.trial_companies 
ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS revenue NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_profit NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_assets NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_mpa_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_mpb_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_recoverable NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_payable NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_assets_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_assets_depreciation NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ccc NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS interest_coverage NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_uk NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS compulsory_loan_balance NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS compulsory_loan_interest_paid NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tsr NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS nlcdg NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS solvency_score_kanitz NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS altman_z_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS dcf_valuation NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS scissors_effect NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS liquidity_current NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS solvency_index NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS inventory_turnover NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_receivable_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_payable_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_elasticity NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS carbon_footprint NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS market_share NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ebitda NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fco_livre NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS capex_manutencao NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS capex_estrategico NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS esds_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS esds_zone TEXT,
ADD COLUMN IF NOT EXISTS esds_gargalo TEXT,
ADD COLUMN IF NOT EXISTS esds_insights TEXT,
ADD COLUMN IF NOT EXISTS esds_top_gargalos JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS esds_main_drivers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS share_price NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_receivables NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_payables NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_rating TEXT CHECK (credit_rating = ANY (ARRAY['AAA'::text, 'AA'::text, 'A'::text, 'B'::text, 'C'::text, 'D'::text]));

-- 6. ADIÇÃO DE PERFIS ESTRATÉGICOS E KPIs EM TEAMS (LIVE & TRIAL)
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS strategic_profile TEXT DEFAULT 'EQUILIBRADO';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '{}';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS equity NUMERIC(20,2) DEFAULT 0;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS insolvency_status TEXT DEFAULT 'SAUDAVEL';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'pt-BR';

ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS strategic_profile TEXT DEFAULT 'EQUILIBRADO';
ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '{}';
ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS equity NUMERIC(20,2) DEFAULT 0;
ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS insolvency_status TEXT DEFAULT 'SAUDAVEL';
ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'pt-BR';

-- 7. ÍNDICES PARA MONITORAMENTO DE "SAÚDE DOS ATIVOS" E KPIs
CREATE INDEX IF NOT EXISTS idx_companies_asset_vcl ON public.companies (fixed_assets_value DESC);
CREATE INDEX IF NOT EXISTS idx_companies_ccc ON public.companies (ccc ASC);
CREATE INDEX IF NOT EXISTS idx_companies_tsr ON public.companies (tsr DESC);
CREATE INDEX IF NOT EXISTS idx_companies_esds ON public.companies (esds_score DESC);

-- 4. VIEW DE AUDITORIA DE CAPEX PARA O TUTOR (HELPER)
-- Fix: DROP VIEW antes de recriar para permitir mudança na estrutura de colunas
DROP VIEW IF EXISTS public.view_capex_health;
CREATE OR REPLACE VIEW public.view_capex_health 
WITH (security_invoker = true)
AS
SELECT 
    c.championship_id,
    c.round,
    t.name as team_name,
    c.fixed_assets_value as net_book_value,
    c.fixed_assets_depreciation as accumulated_depreciation,
    c.esds_score,
    c.esds_zone,
    CASE 
        WHEN (c.fixed_assets_value + ABS(c.fixed_assets_depreciation)) = 0 THEN 0 
        ELSE ABS(c.fixed_assets_depreciation) / (c.fixed_assets_value + ABS(c.fixed_assets_depreciation)) * 100 
    END as exhaustion_percentage
FROM public.companies c
JOIN public.teams t ON c.team_id = t.id;

-- Habilitar RLS em todas as tabelas core
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championship_macro_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_companies ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS PARA USER_PROFILES
-- ==============================================================================
DROP POLICY IF EXISTS "Usuários veem seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários veem seu próprio perfil" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (supabase_user_id = auth.uid() OR role IN ('tutor', 'admin'));

DROP POLICY IF EXISTS "Usuários criam seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários criam seu próprio perfil" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (supabase_user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários atualizam seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários atualizam seu próprio perfil" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (supabase_user_id = auth.uid() OR role = 'admin');

-- ==============================================================================
-- POLÍTICAS PARA CHAMPIONSHIPS (LIVE & TRIAL)
-- ==============================================================================
DROP POLICY IF EXISTS "Leitura de campeonatos" ON public.championships;
CREATE POLICY "Leitura de campeonatos" ON public.championships
    FOR SELECT TO authenticated
    USING (
        is_public = true 
        OR EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND role IN ('tutor', 'admin'))
        OR EXISTS (SELECT 1 FROM public.teams WHERE championship_id = championships.id AND EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND user_profiles.id = teams.id)) -- Simplificação: assume-se que team_id pode ser vinculado ao profile_id em alguns contextos, ou ajuste conforme a lógica de inscrição
    );

DROP POLICY IF EXISTS "Leitura de trial_championships" ON public.trial_championships;
CREATE POLICY "Leitura de trial_championships" ON public.trial_championships
    FOR SELECT TO authenticated
    USING (true); -- Trial costuma ser mais aberto

-- ==============================================================================
-- POLÍTICAS PARA TEAMS (LIVE & TRIAL)
-- ==============================================================================
-- Nota: A lógica de 'propriedade' de um time pode variar. 
-- Se o ID do time for o ID do perfil do usuário (1:1), usamos auth.uid() vinculado ao user_profiles.
DROP POLICY IF EXISTS "Times: Jogadores veem seu próprio time" ON public.teams;
CREATE POLICY "Times: Jogadores veem seu próprio time" ON public.teams
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND (user_profiles.id = teams.id OR user_profiles.role IN ('tutor', 'admin')))
    );

DROP POLICY IF EXISTS "Times: Jogadores atualizam seu próprio time" ON public.teams;
CREATE POLICY "Times: Jogadores atualizam seu próprio time" ON public.teams
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND (user_profiles.id = teams.id OR user_profiles.role IN ('tutor', 'admin')))
    );

-- ==============================================================================
-- POLÍTICAS PARA COMPANIES (LIVE & TRIAL)
-- ==============================================================================
DROP POLICY IF EXISTS "Companies: Jogadores veem sua própria empresa" ON public.companies;
CREATE POLICY "Companies: Jogadores veem sua própria empresa" ON public.companies
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND (user_profiles.id = companies.team_id OR user_profiles.role IN ('tutor', 'admin')))
    );

DROP POLICY IF EXISTS "Companies: Jogadores atualizam sua própria empresa" ON public.companies;
CREATE POLICY "Companies: Jogadores atualizam sua própria empresa" ON public.companies
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND (user_profiles.id = companies.team_id OR user_profiles.role IN ('tutor', 'admin')))
    );

-- ==============================================================================
-- POLÍTICAS PARA MACRO RULES
-- ==============================================================================
DROP POLICY IF EXISTS "Todos leem macro rules" ON public.championship_macro_rules;
CREATE POLICY "Todos leem macro rules" ON public.championship_macro_rules
    FOR SELECT TO authenticated
    USING (true);

-- ==============================================================================
-- POLÍTICAS PARA TRIAL_TEAMS E TRIAL_COMPANIES
-- ==============================================================================
DROP POLICY IF EXISTS "Trial Teams: Jogadores veem seu próprio time" ON public.trial_teams;
CREATE POLICY "Trial Teams: Jogadores veem seu próprio time" ON public.trial_teams
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND (user_profiles.id = trial_teams.id OR user_profiles.role IN ('tutor', 'admin')))
    );

DROP POLICY IF EXISTS "Trial Teams: Jogadores atualizam seu próprio time" ON public.trial_teams;
CREATE POLICY "Trial Teams: Jogadores atualizam seu próprio time" ON public.trial_teams
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND (user_profiles.id = trial_teams.id OR user_profiles.role IN ('tutor', 'admin')))
    );

DROP POLICY IF EXISTS "Trial Companies: Jogadores veem sua própria empresa" ON public.trial_companies;
CREATE POLICY "Trial Companies: Jogadores veem sua própria empresa" ON public.trial_companies
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND (user_profiles.id = trial_companies.team_id OR user_profiles.role IN ('tutor', 'admin')))
    );

DROP POLICY IF EXISTS "Trial Companies: Jogadores atualizam sua própria empresa" ON public.trial_companies;
CREATE POLICY "Trial Companies: Jogadores atualizam sua própria empresa" ON public.trial_companies
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id = auth.uid() AND (user_profiles.id = trial_companies.team_id OR user_profiles.role IN ('tutor', 'admin')))
    );

-- 8. TABELA DE SEGREDOS DO SISTEMA (API KEYS)
CREATE TABLE IF NOT EXISTS public.system_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.system_secrets ENABLE ROW LEVEL SECURITY;

-- Políticas: Apenas usuários autenticados com role 'tutor' ou 'admin' podem ler
-- Nota: Assume-se que a tabela de perfis se chama 'user_profiles' conforme types.ts
DROP POLICY IF EXISTS "Tutores e Admins podem ler segredos" ON public.system_secrets;
CREATE POLICY "Tutores e Admins podem ler segredos" ON public.system_secrets
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.supabase_user_id = auth.uid()
            AND user_profiles.role IN ('tutor', 'admin')
        )
    );

-- Apenas Admins podem gerenciar (INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "Apenas Admins gerenciam segredos" ON public.system_secrets;
CREATE POLICY "Apenas Admins gerenciam segredos" ON public.system_secrets
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.supabase_user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 9. SEED DE SEGREDOS (API KEYS INICIAIS)
INSERT INTO public.system_secrets (key_name, key_value, description)
VALUES 
    ('GEMINI_API_KEY', 'AIzaSyCsvV4g71G6w7-G8dCnbJ9ugu-t9uLdiSg', 'Chave exclusiva do EMPIRION para IA Gemini'),
    ('API_KEY', 'AIzaSyCsvV4g71G6w7-G8dCnbJ9ugu-t9uLdiSg', 'Chave de fallback para serviços de IA')
ON CONFLICT (key_name) DO UPDATE 
SET key_value = EXCLUDED.key_value, 
    updated_at = now();

COMMIT;
