
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS PROTOCOL v19.3 SAPPHIRE
-- Foco: Integridade Contábil, Refatoração do Kernel e Fidelidade de KPIs
-- ==============================================================================

BEGIN;

-- 0.0 AJUSTE DE TIPOS DE DADOS PARA COMPATIBILIDADE DE TURN OVER (v19.74)
-- Caso as colunas existissem como INTEGER no banco de dados físico original do usuário,
-- este comando força a reclassificação para aceitação fidedigna de casas decimais na simulação contábil.
ALTER TABLE public.companies ALTER COLUMN market_share TYPE NUMERIC(10,2) USING market_share::numeric;
ALTER TABLE public.trial_companies ALTER COLUMN market_share TYPE NUMERIC(10,2) USING market_share::numeric;

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

-- 2. ÍNDICES PARA MONITORAMENTO DE EFICIÊNCIA DE SUPRIMENTOS (Mapeamento JSONB)
CREATE INDEX IF NOT EXISTS idx_companies_emergency_exp ON public.companies (((kpis->>'emergency_purchase_expenses')::numeric DESC));
CREATE INDEX IF NOT EXISTS idx_companies_supplier_int ON public.companies (((kpis->>'supplier_interest_expenses')::numeric DESC));

-- 3. VIEW DE AUDITORIA DE SUPRIMENTOS PARA O TUTOR (NOVA)
DROP VIEW IF EXISTS public.view_supply_chain_health;
CREATE OR REPLACE VIEW public.view_supply_chain_health 
WITH (security_invoker = true)
AS
SELECT 
    c.championship_id,
    c.round,
    t.name as team_name,
    COALESCE((c.kpis->>'supplier_interest_expenses')::numeric, 0) as interest_paid,
    COALESCE((c.kpis->>'emergency_purchase_expenses')::numeric, 0) as emergency_costs,
    COALESCE((c.kpis->>'emergency_units_total')::integer, 0) as emergency_units,
    (COALESCE((c.kpis->>'emergency_purchase_expenses')::numeric, 0) + COALESCE((c.kpis->>'supplier_interest_expenses')::numeric, 0)) as total_supply_overhead
FROM public.companies c
JOIN public.teams t ON c.team_id::text = t.id::text;

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
ADD COLUMN IF NOT EXISTS import_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS import_tariff_uk NUMERIC(10,2) DEFAULT 0,
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
ADD COLUMN IF NOT EXISTS import_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS import_tariff_uk NUMERIC(10,2) DEFAULT 0,
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
ADD COLUMN IF NOT EXISTS import_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS import_tariff_uk NUMERIC(10,2) DEFAULT 0,
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

-- 7. ÍNDICES PARA MONITORAMENTO DE "SAÚDE DOS ATIVOS" E KPIs (Mapeamento JSONB)
CREATE INDEX IF NOT EXISTS idx_companies_asset_vcl ON public.companies (((kpis->>'fixed_assets_value')::numeric DESC));
CREATE INDEX IF NOT EXISTS idx_companies_ccc ON public.companies (((kpis->>'ccc')::numeric ASC));
CREATE INDEX IF NOT EXISTS idx_companies_tsr ON public.companies (((kpis->>'tsr')::numeric DESC));
CREATE INDEX IF NOT EXISTS idx_companies_esds ON public.companies (((kpis->'esds'->>'esds_display')::numeric DESC));

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
    COALESCE((c.kpis->>'fixed_assets_value')::numeric, 0) as net_book_value,
    COALESCE((c.kpis->>'fixed_assets_depreciation')::numeric, 0) as accumulated_depreciation,
    COALESCE((c.kpis->'esds'->>'esds_display')::numeric, (c.kpis->>'esds_score')::numeric, 0) as esds_score,
    COALESCE(c.kpis->'esds'->>'zone', 'ALERTA') as esds_zone,
    CASE 
        WHEN (COALESCE((c.kpis->>'fixed_assets_value')::numeric, 0) + ABS(COALESCE((c.kpis->>'fixed_assets_depreciation')::numeric, 0))) = 0 THEN 0 
        ELSE ABS(COALESCE((c.kpis->>'fixed_assets_depreciation')::numeric, 0)) / (COALESCE((c.kpis->>'fixed_assets_value')::numeric, 0) + ABS(COALESCE((c.kpis->>'fixed_assets_depreciation')::numeric, 0))) * 100 
    END as exhaustion_percentage
FROM public.companies c
JOIN public.teams t ON c.team_id::text = t.id::text;

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
    USING (supabase_user_id::text = auth.uid()::text OR role IN ('tutor', 'admin'));

DROP POLICY IF EXISTS "Usuários criam seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários criam seu próprio perfil" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (supabase_user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Usuários atualizam seu próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários atualizam seu próprio perfil" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (supabase_user_id::text = auth.uid()::text OR role = 'admin');

-- ==============================================================================
-- POLÍTICAS PARA CHAMPIONSHIPS (LIVE & TRIAL)
-- ==============================================================================
DROP POLICY IF EXISTS "Leitura de campeonatos" ON public.championships;
CREATE POLICY "Leitura de campeonatos" ON public.championships
    FOR SELECT TO authenticated
    USING (
        is_public = true 
        OR EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id::text = auth.uid()::text AND role IN ('tutor', 'admin'))
        OR EXISTS (SELECT 1 FROM public.teams WHERE championship_id::text = championships.id::text AND EXISTS (SELECT 1 FROM public.user_profiles WHERE supabase_user_id::text = auth.uid()::text AND user_profiles.id::text = teams.id::text)) -- Simplificação: assume-se que team_id pode ser vinculado ao profile_id em alguns contextos, ou ajuste conforme a lógica de inscrição
    );

DROP POLICY IF EXISTS "Leitura de trial_championships" ON public.trial_championships;
CREATE POLICY "Leitura de trial_championships" ON public.trial_championships
    FOR SELECT TO public
    USING (true); -- Trial costuma ser mais aberto

DROP POLICY IF EXISTS "Gerenciamento de trial_championships" ON public.trial_championships;
CREATE POLICY "Gerenciamento de trial_championships" ON public.trial_championships
    FOR ALL TO public
    USING (true); -- Permite gerência (inserção, atualização, deleção) no modo Trial sem autenticação obrigatória

-- ==============================================================================
-- POLÍTICAS PARA TEAMS (LIVE & TRIAL)
-- ==============================================================================
DROP POLICY IF EXISTS "Times: Jogadores veem seu próprio time" ON public.teams;
DROP POLICY IF EXISTS "Teams_Visibility" ON public.teams;
DROP POLICY IF EXISTS "Leitura de equipes competidoras" ON public.teams;

CREATE POLICY "Leitura de equipes competidoras" ON public.teams
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
        )
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id::text = u.id::text
            WHERE u.supabase_user_id::text = auth.uid()::text
            AND tm.championship_id::text = teams.championship_id::text
        )
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND teams.championship_id::text IN (
                SELECT t.championship_id::text FROM public.teams t WHERE t.id::text = up.id::text
            )
        )
    );

DROP POLICY IF EXISTS "Times: Jogadores atualizam seu próprio time" ON public.teams;
DROP POLICY IF EXISTS "Jogadores atualizam seu proprio time_v2" ON public.teams;
CREATE POLICY "Jogadores atualizam seu proprio time_v2" ON public.teams
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
        )
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id::text = u.id::text
            WHERE u.supabase_user_id::text = auth.uid()::text
            AND tm.team_id::text = teams.id::text
        )
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = teams.id::text
        )
    );

-- ==============================================================================
-- POLÍTICAS PARA COMPANIES (LIVE & TRIAL)
-- ==============================================================================
DROP POLICY IF EXISTS "Companies: Jogadores veem sua própria empresa" ON public.companies;
DROP POLICY IF EXISTS "Companies_Access_Master" ON public.companies;
DROP POLICY IF EXISTS "Players_View_Own_History" ON public.companies;
DROP POLICY IF EXISTS "Leitura de empresas competidoras" ON public.companies;

CREATE POLICY "Leitura de empresas competidoras" ON public.companies
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
        )
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id::text = u.id::text
            WHERE u.supabase_user_id::text = auth.uid()::text
            AND tm.championship_id::text = companies.championship_id::text
        )
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND companies.championship_id::text IN (
                SELECT t.championship_id::text FROM public.teams t WHERE t.id::text = up.id::text
            )
        )
    );

DROP POLICY IF EXISTS "Companies: Jogadores atualizam sua própria empresa" ON public.companies;
DROP POLICY IF EXISTS "Jogadores atualizam sua propria empresa_v2" ON public.companies;
CREATE POLICY "Jogadores atualizam sua propria empresa_v2" ON public.companies
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
        )
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id::text = u.id::text
            WHERE u.supabase_user_id::text = auth.uid()::text
            AND tm.team_id::text = companies.team_id::text
        )
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = companies.team_id::text
        )
    );

DROP POLICY IF EXISTS "Companies: Permissão de inserção para o campeonato" ON public.companies;
CREATE POLICY "Companies: Permissão de inserção para o campeonato" ON public.companies
    FOR INSERT TO authenticated
    WITH CHECK (true);

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
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Trial Teams: Jogadores atualizam seu próprio time" ON public.trial_teams;
CREATE POLICY "Trial Teams: Jogadores atualizam seu próprio time" ON public.trial_teams
    FOR ALL TO public
    USING (true); -- Permissão integral de gerenciamento para equipes Trial sem login obrigatório

DROP POLICY IF EXISTS "Trial Companies: Jogadores veem sua própria empresa" ON public.trial_companies;
CREATE POLICY "Trial Companies: Jogadores veem sua própria empresa" ON public.trial_companies
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Trial Companies: Jogadores atualizam sua própria empresa" ON public.trial_companies;
CREATE POLICY "Trial Companies: Jogadores atualizam sua própria empresa" ON public.trial_companies
    FOR ALL TO public
    USING (true); -- Permissão integral de gerenciamento para empresas Trial sem login obrigatório

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
            WHERE user_profiles.supabase_user_id::text = auth.uid()::text
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
            WHERE user_profiles.supabase_user_id::text = auth.uid()::text
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

-- 11. TABELA DE TEMPLATES DE CONFIGURAÇÃO DO P0 (v19.18 OBSIDIAN DIAMOND)
CREATE TABLE IF NOT EXISTS public.r0_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    tutor_id TEXT, -- Em sintonia com as persistências locais de tutor/user
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.r0_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS de Templates (Aprimoradas para Modo Trial/Híbrido)
-- Em modo Trial/Sandbox, permite a leitura e escrita cooperativa de templates tanto para autenticados quanto convidados.
DROP POLICY IF EXISTS "Leitura de templates públicos e próprios" ON public.r0_templates;
CREATE POLICY "Leitura de templates públicos e próprios" ON public.r0_templates
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Escrita apenas para tutores e admins" ON public.r0_templates;
DROP POLICY IF EXISTS "Escrita de templates sem restricoes em modo Trial" ON public.r0_templates;
CREATE POLICY "Escrita de templates sem restricoes em modo Trial" ON public.r0_templates
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- 12. NOTA DE GOVERNANÇA DE BANCO DE DADOS v19.14 (SAPPHIRE DIAMOND)
-- Conforme a Decisão Arquitetural Sênior ADR-DB-04, colunas de tráfego de controle e de simulação
-- (tais como 'initial_machines', 'initial_stock_quantities', 'tutor_name' e 'institution_name')
-- foram voluntariamente mantidas como propriedades de transporte em memória no ciclo Javascript.
-- Em vez de poluir as tabelas 'trial_championships' e 'championships' com campos específicos lógicos,
-- foi implementada uma Rotina de Higienização Fiduciária de Payload (Database Payload Sanitization)
-- no frontend em 'services/supabase.ts'. Essa rotina blinda o banco de dados contra erros de Schema Cache
-- no PostgREST, preservando a integridade original das tabelas sem necessidade de ALTER TABLE nocivo.

-- 13. ÍNDICES DE PERFORMANCE FIDUCIÁRIA v19.20 (OBSIDIAN ENHANCED)
-- Otimizações cirúrgicas de plano de execução (Query Plans) para as novas Views de Auditoria e Templates
CREATE INDEX IF NOT EXISTS idx_companies_champ_round_fiduciary ON public.companies (championship_id, round);
CREATE INDEX IF NOT EXISTS idx_companies_team_id_cast_text ON public.companies (((team_id)::text));
CREATE INDEX IF NOT EXISTS idx_teams_id_cast_text ON public.teams (((id)::text));
CREATE INDEX IF NOT EXISTS idx_r0_templates_tutor_public ON public.r0_templates (tutor_id, is_public);

-- ==============================================================================
-- 14. POLÍTICAS DE GOVERNANÇA E CONTROLE ÉTICO DE DECISÕES v2026.120 (EMPIRION SECURE)
-- ==============================================================================
-- Habilitar RLS nas tabelas de decisões para garantir a confidencialidade durante rounds em andamento
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_decisions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Leitura de trial_decisions" ON public.trial_decisions;
CREATE POLICY "Leitura de trial_decisions" ON public.trial_decisions
    FOR SELECT TO public
    USING (
        -- Permitir acesso instantâneo se não houver login ativo no Supabase (teste/Sandbox do Trial)
        auth.uid() IS NULL
        -- Se estiver autenticado, aplicar regras éticas e de governança estritas
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin', 'observer')
        )
        -- Observadores nominados nominalmente em trial_championships
        OR EXISTS (
            SELECT 1 FROM public.trial_championships tc
            WHERE tc.id::text = trial_decisions.championship_id::text
            AND tc.observers IS NOT NULL 
            AND auth.uid()::text = ANY (tc.observers::text[])
        )
        -- Jogador dono do rascunho de decisão correspondente à sua própria equipe
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = trial_decisions.team_id::text
        )
    );

DROP POLICY IF EXISTS "Gerenciamento de trial_decisions" ON public.trial_decisions;
CREATE POLICY "Gerenciamento de trial_decisions" ON public.trial_decisions
    FOR ALL TO public
    USING (
         -- Permitir mutação (gravação e alteração) se não estiver logado (modo temporário do Trial)
         auth.uid() IS NULL
         -- Se estiver autenticado, regras rígidas de segurança tomam efeito
         OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
         )
         OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = trial_decisions.team_id::text
         )
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS PARA CURRENT_DECISIONS (MÓDULO DE CAMPEONATO PAGO)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Leitura de current_decisions" ON public.current_decisions;
CREATE POLICY "Leitura de current_decisions" ON public.current_decisions
    FOR SELECT TO authenticated
    USING (
        -- Tutor, Admin e Observadores legítimos do sistema
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin', 'observer')
        )
        -- Observadores nominados no campeonato pago
        OR EXISTS (
            SELECT 1 FROM public.championships c
            WHERE c.id::text = current_decisions.championship_id::text
            AND c.observers IS NOT NULL 
            AND auth.uid()::text = ANY (c.observers::text[])
        )
        -- Jogador dono do rascunho participante do respectivo time (via team_members)
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id::text = u.id::text
            WHERE u.supabase_user_id::text = auth.uid()::text
            AND tm.team_id::text = current_decisions.team_id::text
        )
        -- Jogador Sandbox / 1-para-1 fallback
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = current_decisions.team_id::text
        )
    );

DROP POLICY IF EXISTS "Gerenciamento de current_decisions" ON public.current_decisions;
CREATE POLICY "Gerenciamento de current_decisions" ON public.current_decisions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
        )
        -- Membro da equipe dona (via team_members)
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id::text = u.id::text
            WHERE u.supabase_user_id::text = auth.uid()::text
            AND tm.team_id::text = current_decisions.team_id::text
        )
        -- Sandbox 1-para-1 fallback
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = current_decisions.team_id::text
        )
    );

-- ==============================================================================
-- 15. TABELA DE LOGS DE ERROS DE SISTEMA E SIMULAÇÃO v2026.162 (SAPPHIRE CORE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id TEXT,
    round INTEGER,
    error_message TEXT,
    context_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura de error_logs para tutores e admins" ON public.error_logs;
CREATE POLICY "Leitura de error_logs para tutores e admins" ON public.error_logs
    FOR SELECT TO public
    USING (
        auth.uid() IS NULL
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
        )
    );

DROP POLICY IF EXISTS "Escrita livre em error_logs" ON public.error_logs;
CREATE POLICY "Escrita livre em error_logs" ON public.error_logs
    FOR INSERT TO public
    WITH CHECK (true);

COMMIT;
