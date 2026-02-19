
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS PROTOCOL v18.7 PLATINUM
-- Foco: Telemetria Avançada de Depreciação e Valor Contábil Líquido
-- ==============================================================================

-- 1. ADIÇÃO DE COLUNAS DE TELEMETRIA EM COMPANIES (LIVE)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS fixed_assets_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_assets_depreciation NUMERIC(20,2) DEFAULT 0;

-- 2. ADIÇÃO DE COLUNAS DE TELEMETRIA EM TRIAL_COMPANIES (SANDBOX)
ALTER TABLE public.trial_companies 
ADD COLUMN IF NOT EXISTS fixed_assets_value NUMERIC(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_assets_depreciation NUMERIC(20,2) DEFAULT 0;

-- 3. ÍNDICES PARA MONITORAMENTO DE "SAÚDE DOS ATIVOS" E EXAUSTÃO
CREATE INDEX IF NOT EXISTS idx_companies_asset_vcl ON public.companies (fixed_assets_value DESC);
CREATE INDEX IF NOT EXISTS idx_companies_asset_deprec ON public.companies (fixed_assets_depreciation ASC);

-- 4. VIEW DE AUDITORIA DE CAPEX PARA O TUTOR (HELPER)
-- Permite ver rapidamente quem está com parque de máquinas ou prédios sucateados
CREATE OR REPLACE VIEW public.view_capex_health AS
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
