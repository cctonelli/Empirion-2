
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS PROTOCOL v18.8 PLATINUM
-- Foco: Telemetria Avançada, KPIs Estratégicos e Segurança de Views
-- ==============================================================================

-- 1. ADIÇÃO DE COLUNAS DE TELEMETRIA E KPIs EM COMPANIES (LIVE & HISTÓRICO)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS fixed_assets_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_assets_depreciation NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ccc NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS interest_coverage NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_uk NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0;

-- 2. ADIÇÃO DE COLUNAS EM CHAMPIONSHIP_MACRO_RULES (ORACLE CORE)
ALTER TABLE public.championship_macro_rules
ADD COLUMN IF NOT EXISTS export_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_uk NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0;

-- 3. ADIÇÃO DE COLUNAS EM CHAMPIONSHIPS (BASE CONFIG)
ALTER TABLE public.championships
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0;

-- 4. ADIÇÃO DE COLUNAS EM TRIAL_CHAMPIONSHIPS (BASE CONFIG)
ALTER TABLE public.trial_championships
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_share_price NUMERIC(20,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT TRUE;

-- 5. ADIÇÃO DE COLUNAS DE TELEMETRIA E KPIs EM TRIAL_COMPANIES (SANDBOX)
ALTER TABLE public.trial_companies 
ADD COLUMN IF NOT EXISTS fixed_assets_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_assets_depreciation NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ccc NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS interest_coverage NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_brazil NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS export_tariff_uk NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS brl_rate NUMERIC(20,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS gbp_rate NUMERIC(20,6) DEFAULT 0;

-- 6. ADIÇÃO DE PERFIS ESTRATÉGICOS EM TEAMS (LIVE & TRIAL)
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS strategic_profile TEXT DEFAULT 'EQUILIBRADO';
ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS strategic_profile TEXT DEFAULT 'EQUILIBRADO';

-- 7. ÍNDICES PARA MONITORAMENTO DE "SAÚDE DOS ATIVOS" E KPIs
CREATE INDEX IF NOT EXISTS idx_companies_asset_vcl ON public.companies (fixed_assets_value DESC);
CREATE INDEX IF NOT EXISTS idx_companies_ccc ON public.companies (ccc ASC);

-- 4. VIEW DE AUDITORIA DE CAPEX PARA O TUTOR (HELPER)
-- Fix: SECURITY INVOKER para conformidade com políticas de RLS do Supabase
CREATE OR REPLACE VIEW public.view_capex_health 
WITH (security_invoker = true)
AS
SELECT 
    c.championship_id,
    c.round,
    t.name as team_name,
    c.fixed_assets_value as net_book_value,
    c.fixed_assets_depreciation as accumulated_depreciation,
    CASE 
        WHEN (c.fixed_assets_value + ABS(c.fixed_assets_depreciation)) = 0 THEN 0 
        ELSE ABS(c.fixed_assets_depreciation) / (c.fixed_assets_value + ABS(c.fixed_assets_depreciation)) * 100 
    END as exhaustion_percentage
FROM public.companies c
JOIN public.teams t ON c.team_id = t.id;

COMMIT;
