-- ==============================================================================
-- EMPIRION DATABASE MIGRAÇÃO DE HIGIENIZAÇÃO POLIMÓRFICA v2026.196
-- Foco: Higienização definitiva de colunas legadas e migração para o JSONB 'config'
-- Autor: Project Management Professional & Database Engineer
-- ==============================================================================

BEGIN;

-- 1. Drenar valores de dividend_percent e initial_share_price para dentro do JSONB 'config' caso ainda não constem nele
UPDATE public.trial_championships
SET config = jsonb_set(
    jsonb_set(
        COALESCE(config, '{}'::jsonb),
        '{dividend_percent}',
        COALESCE(to_jsonb(dividend_percent), '25.0'::jsonb)
    ),
    '{initial_share_price}',
    COALESCE(to_jsonb(initial_share_price), '100.00'::jsonb)
)
WHERE (config->>'dividend_percent' IS NULL OR config->>'initial_share_price' IS NULL);

UPDATE public.championships
SET config = jsonb_set(
    jsonb_set(
        COALESCE(config, '{}'::jsonb),
        '{dividend_percent}',
        COALESCE(to_jsonb(dividend_percent), '25.0'::jsonb)
    ),
    '{initial_share_price}',
    COALESCE(to_jsonb(initial_share_price), '100.00'::jsonb)
)
WHERE (config->>'dividend_percent' IS NULL OR config->>'initial_share_price' IS NULL);

-- 2. Exclusão física definitiva de colunas legadas em trial_championships
ALTER TABLE public.trial_championships 
    DROP COLUMN IF EXISTS initial_market_data,
    DROP COLUMN IF EXISTS dividend_percent,
    DROP COLUMN IF EXISTS initial_share_price,
    DROP COLUMN IF EXISTS round_rules,
    DROP COLUMN IF EXISTS region_configs,
    DROP COLUMN IF EXISTS region_names,
    DROP COLUMN IF EXISTS regions_count,
    DROP COLUMN IF EXISTS sales_mode,
    DROP COLUMN IF EXISTS currency,
    DROP COLUMN IF EXISTS scenario_type,
    DROP COLUMN IF EXISTS social_charges,
    DROP COLUMN IF EXISTS compulsory_loan_agio,
    DROP COLUMN IF EXISTS production_hours_period,
    DROP COLUMN IF EXISTS award_values,
    DROP COLUMN IF EXISTS exchange_rates,
    DROP COLUMN IF EXISTS staffing,
    DROP COLUMN IF EXISTS prices,
    DROP COLUMN IF EXISTS machinery_values,
    DROP COLUMN IF EXISTS brl_rate,
    DROP COLUMN IF EXISTS gbp_rate;

-- 3. Exclusão física definitiva de colunas legadas em championships
ALTER TABLE public.championships 
    DROP COLUMN IF EXISTS initial_market_data,
    DROP COLUMN IF EXISTS dividend_percent,
    DROP COLUMN IF EXISTS initial_share_price,
    DROP COLUMN IF EXISTS round_rules,
    DROP COLUMN IF EXISTS region_configs,
    DROP COLUMN IF EXISTS region_names,
    DROP COLUMN IF EXISTS regions_count,
    DROP COLUMN IF EXISTS sales_mode,
    DROP COLUMN IF EXISTS currency,
    DROP COLUMN IF EXISTS scenario_type,
    DROP COLUMN IF EXISTS social_charges,
    DROP COLUMN IF EXISTS compulsory_loan_agio,
    DROP COLUMN IF EXISTS production_hours_period,
    DROP COLUMN IF EXISTS award_values,
    DROP COLUMN IF EXISTS exchange_rates,
    DROP COLUMN IF EXISTS staffing,
    DROP COLUMN IF EXISTS prices,
    DROP COLUMN IF EXISTS machinery_values,
    DROP COLUMN IF EXISTS brl_rate,
    DROP COLUMN IF EXISTS gbp_rate;

COMMIT;
