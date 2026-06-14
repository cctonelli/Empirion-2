-- ==============================================================================
-- EMPIRION DATABASE MIGRAÇÃO DE HIGIENIZAÇÃO FIDUCIÁRIA v2026.143 
-- Foco: Unificação estrutural no nó 'config' JSONB e exclusão de colunas obsoletas
-- ==============================================================================

BEGIN;

-- 1. Unificar dados legados de 'region_configs' para dentro de 'config' caso residam apenas na raiz
UPDATE public.trial_championships
SET config = jsonb_set(
    COALESCE(config, '{}'::jsonb),
    '{region_configs}',
    COALESCE(region_configs, '[]'::jsonb)
)
WHERE region_configs IS NOT NULL AND region_configs <> '[]'::jsonb 
  AND (config->>'region_configs' IS NULL OR config->>'region_configs' = '[]');

UPDATE public.championships
SET config = jsonb_set(
    COALESCE(config, '{}'::jsonb),
    '{region_configs}',
    COALESCE(region_configs, '[]'::jsonb)
)
WHERE region_configs IS NOT NULL AND region_configs <> '[]'::jsonb 
  AND (config->>'region_configs' IS NULL OR config->>'region_configs' = '[]');

-- 2. Drenar outras colunas planas redundantes do campeonato e trial_championships para o 'config' se necessário
-- (Fidelidade do CPC e IFRS: resguardando o histórico parametrizado pelos Tutores)
UPDATE public.trial_championships
SET config = COALESCE(config, '{}'::jsonb) || jsonb_build_object(
    'social_charges', COALESCE(social_charges, 35.0),
    'compulsory_loan_agio', COALESCE(compulsory_loan_agio, 3.0),
    'production_hours_period', COALESCE(production_hours_period, 946),
    'award_values', COALESCE(award_values, '{"cost_precision": 100000, "profit_precision": 100000, "revenue_precision": 100000}'::jsonb),
    'exchange_rates', COALESCE(exchange_rates, '{"BRL": 1.0, "EUR": 5.60, "GBP": 6.50, "USD": 5.25}'::jsonb),
    'staffing', COALESCE(staffing, '{"admin": {"count": 20, "salaries": 4}, "sales": {"count": 10, "salaries": 4}, "production": {"count": 470, "salaries": 1}}'::jsonb),
    'prices', COALESCE(prices, '{"mp_a": 20.00, "mp_b": 40.00, "storage_mp": 1.40, "storage_finished": 20.00, "distribution_unit": 50.00, "marketing_campaign": 10000.00}'::jsonb),
    'machinery_values', COALESCE(machinery_values, '{"alfa": 500000, "beta": 1500000, "gama": 3000000}'::jsonb),
    'currency', COALESCE(currency, 'BRL'),
    'sales_mode', COALESCE(sales_mode, 'hybrid'),
    'scenario_type', COALESCE(scenario_type, 'simulated'),
    'regions_count', COALESCE(regions_count, 1)
);

UPDATE public.championships
SET config = COALESCE(config, '{}'::jsonb) || jsonb_build_object(
    'social_charges', COALESCE(social_charges, 35.0),
    'compulsory_loan_agio', COALESCE(compulsory_loan_agio, 3.0),
    'production_hours_period', COALESCE(production_hours_period, 946),
    'award_values', COALESCE(award_values, '{"cost_precision": 100000, "profit_precision": 100000, "revenue_precision": 100000}'::jsonb),
    'exchange_rates', COALESCE(exchange_rates, '{"BRL": 1.0, "EUR": 5.60, "GBP": 6.50, "USD": 5.25}'::jsonb),
    'staffing', COALESCE(staffing, '{"admin": {"count": 20, "salaries": 4}, "sales": {"count": 10, "salaries": 4}, "production": {"count": 470, "salaries": 1}}'::jsonb),
    'prices', COALESCE(prices, '{"mp_a": 20.00, "mp_b": 40.00, "storage_mp": 1.40, "storage_finished": 20.00, "distribution_unit": 50.00, "marketing_campaign": 10000.00}'::jsonb),
    'machinery_values', COALESCE(machinery_values, '{"alfa": 500000, "beta": 1500000, "gama": 3000000}'::jsonb),
    'currency', COALESCE(currency, 'BRL'),
    'sales_mode', COALESCE(sales_mode, 'hybrid'),
    'scenario_type', COALESCE(scenario_type, 'simulated'),
    'regions_count', COALESCE(regions_count, 1)
);

-- 3. Excluir com segurança as colunas redundantes obsoletas da tabela trial_championships
ALTER TABLE public.trial_championships 
    DROP COLUMN IF EXISTS region_names,
    DROP COLUMN IF EXISTS region_configs,
    DROP COLUMN IF EXISTS regions_count,
    DROP COLUMN IF EXISTS currency,
    DROP COLUMN IF EXISTS sales_mode,
    DROP COLUMN IF EXISTS scenario_type,
    DROP COLUMN IF EXISTS social_charges,
    DROP COLUMN IF EXISTS compulsory_loan_agio,
    DROP COLUMN IF EXISTS production_hours_period,
    DROP COLUMN IF EXISTS award_values,
    DROP COLUMN IF EXISTS exchange_rates,
    DROP COLUMN IF EXISTS staffing,
    DROP COLUMN IF EXISTS prices,
    DROP COLUMN IF EXISTS machinery_values,
    DROP COLUMN IF EXISTS round_rules,
    DROP COLUMN IF EXISTS brl_rate,
    DROP COLUMN IF EXISTS gbp_rate;

-- 4. Excluir com segurança as colunas redundantes obsoletas da tabela championships
ALTER TABLE public.championships 
    DROP COLUMN IF EXISTS region_names,
    DROP COLUMN IF EXISTS region_configs,
    DROP COLUMN IF EXISTS regions_count,
    DROP COLUMN IF EXISTS currency,
    DROP COLUMN IF EXISTS sales_mode,
    DROP COLUMN IF EXISTS scenario_type,
    DROP COLUMN IF EXISTS social_charges,
    DROP COLUMN IF EXISTS compulsory_loan_agio,
    DROP COLUMN IF EXISTS production_hours_period,
    DROP COLUMN IF EXISTS award_values,
    DROP COLUMN IF EXISTS exchange_rates,
    DROP COLUMN IF EXISTS staffing,
    DROP COLUMN IF EXISTS prices,
    DROP COLUMN IF EXISTS machinery_values,
    DROP COLUMN IF EXISTS round_rules,
    DROP COLUMN IF EXISTS brl_rate,
    DROP COLUMN IF EXISTS gbp_rate;

COMMIT;
