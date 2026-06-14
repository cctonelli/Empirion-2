-- ==============================================================================
-- EMPIRION DATABASE MIGRAÇÃO DE HIGIENIZAÇÃO FIDUCIÁRIA DAS MARCAS v2026.144
-- Foco: Eliminação de dezenas de colunas acessórias de KPIs flutuantes nas tabelas
-- public.companies e public.trial_companies, unificando-as no JSONB 'kpis'
-- ==============================================================================

BEGIN;

-- 0. Remover temporariamente as views dependentes para viabilizar as alterações físicas do DDL
DROP VIEW IF EXISTS public.view_supply_chain_health CASCADE;
DROP VIEW IF EXISTS public.view_capex_health CASCADE;

-- 1. Primeira etapa de extrema segurança: Mesclar todos os valores das colunas escalares correntes
-- para o interior do campo 'kpis' (JSONB) no histórico de marcas humanas e trials.
UPDATE public.companies
SET kpis = COALESCE(kpis, '{}'::jsonb) || jsonb_build_object(
    'tsr', COALESCE(tsr, 0),
    'nlcdg', COALESCE(nlcdg, 0),
    'ebitda', COALESCE(ebitda, 0),
    'solvency_score_kanitz', COALESCE(solvency_score_kanitz, 0),
    'dcf_valuation', COALESCE(dcf_valuation, 0),
    'total_assets', COALESCE(total_assets, 0),
    'fixed_assets_value', COALESCE(fixed_assets_value, 0),
    'stock_value', COALESCE(stock_value, 0),
    'fixed_assets_depreciation', COALESCE(fixed_assets_depreciation, 0),
    'ccc', COALESCE(ccc, 0),
    'interest_coverage', COALESCE(interest_coverage, 0),
    'export_tariff_brazil', COALESCE(export_tariff_brazil, 0),
    'export_tariff_uk', COALESCE(export_tariff_uk, 0),
    'brl_rate', COALESCE(brl_rate, 1.0),
    'gbp_rate', COALESCE(gbp_rate, 0.0),
    'compulsory_loan_balance', COALESCE(compulsory_loan_balance, 0),
    'compulsory_loan_interest_paid', COALESCE(compulsory_loan_interest_paid, 0),
    'scissors_effect', COALESCE(scissors_effect, 0),
    'liquidity_current', COALESCE(liquidity_current, 0),
    'solvency_index', COALESCE(solvency_index, 0),
    'inventory_turnover', COALESCE(inventory_turnover, 0),
    'avg_receivable_days', COALESCE(avg_receivable_days, 0),
    'avg_payable_days', COALESCE(avg_payable_days, 0),
    'price_elasticity', COALESCE(price_elasticity, 0),
    'carbon_footprint', COALESCE(carbon_footprint, 0),
    'credit_rating', COALESCE(credit_rating, 'AAA'),
    'altman_z_score', COALESCE(altman_z_score, 0),
    'fco_livre', COALESCE(fco_livre, 0),
    'capex_manutencao', COALESCE(capex_manutencao, 0),
    'capex_estrategico', COALESCE(capex_estrategico, 0),
    'stock_mpa_value', COALESCE(stock_mpa_value, 0),
    'stock_mpb_value', COALESCE(stock_mpb_value, 0),
    'vat_recoverable', COALESCE(vat_recoverable, 0),
    'vat_payable', COALESCE(vat_payable, 0),
    'total_receivables', COALESCE(total_receivables, 0),
    'total_payables', COALESCE(total_payables, 0),
    'supplier_interest_expenses', COALESCE(supplier_interest_expenses, 0),
    'emergency_purchase_expenses', COALESCE(emergency_purchase_expenses, 0),
    'emergency_units_total', COALESCE(emergency_units_total, 0),
    'esds', jsonb_build_object(
        'esds_display', COALESCE(esds_score, 0),
        'zone', COALESCE(esds_zone, 'ALERTA'),
        'gargalo_principal', COALESCE(esds_gargalo, ''),
        'gemini_insights', COALESCE(esds_insights, ''),
        'top_gargalos', COALESCE(esds_top_gargalos, '[]'::jsonb),
        'main_drivers', COALESCE(esds_main_drivers, '[]'::jsonb)
    )
);

UPDATE public.trial_companies
SET kpis = COALESCE(kpis, '{}'::jsonb) || jsonb_build_object(
    'tsr', COALESCE(tsr, 0),
    'nlcdg', COALESCE(nlcdg, 0),
    'ebitda', COALESCE(ebitda, 0),
    'solvency_score_kanitz', COALESCE(solvency_score_kanitz, 0),
    'dcf_valuation', COALESCE(dcf_valuation, 0),
    'total_assets', COALESCE(total_assets, 0),
    'fixed_assets_value', COALESCE(fixed_assets_value, 0),
    'stock_value', COALESCE(stock_value, 0),
    'fixed_assets_depreciation', COALESCE(fixed_assets_depreciation, 0),
    'ccc', COALESCE(ccc, 0),
    'interest_coverage', COALESCE(interest_coverage, 0),
    'export_tariff_brazil', COALESCE(export_tariff_brazil, 0),
    'export_tariff_uk', COALESCE(export_tariff_uk, 0),
    'brl_rate', COALESCE(brl_rate, 1.0),
    'gbp_rate', COALESCE(gbp_rate, 0.0),
    'compulsory_loan_balance', COALESCE(compulsory_loan_balance, 0),
    'compulsory_loan_interest_paid', COALESCE(compulsory_loan_interest_paid, 0),
    'scissors_effect', COALESCE(scissors_effect, 0),
    'liquidity_current', COALESCE(liquidity_current, 0),
    'solvency_index', COALESCE(solvency_index, 0),
    'inventory_turnover', COALESCE(inventory_turnover, 0),
    'avg_receivable_days', COALESCE(avg_receivable_days, 0),
    'avg_payable_days', COALESCE(avg_payable_days, 0),
    'price_elasticity', COALESCE(price_elasticity, 0),
    'carbon_footprint', COALESCE(carbon_footprint, 0),
    'credit_rating', COALESCE(credit_rating, 'AAA'),
    'altman_z_score', COALESCE(altman_z_score, 0),
    'fco_livre', COALESCE(fco_livre, 0),
    'capex_manutencao', COALESCE(capex_manutencao, 0),
    'capex_estrategico', COALESCE(capex_estrategico, 0),
    'stock_mpa_value', COALESCE(stock_mpa_value, 0),
    'stock_mpb_value', COALESCE(stock_mpb_value, 0),
    'vat_recoverable', COALESCE(vat_recoverable, 0),
    'vat_payable', COALESCE(vat_payable, 0),
    'total_receivables', COALESCE(total_receivables, 0),
    'total_payables', COALESCE(total_payables, 0),
    'supplier_interest_expenses', COALESCE(supplier_interest_expenses, 0),
    'emergency_purchase_expenses', COALESCE(emergency_purchase_expenses, 0),
    'emergency_units_total', COALESCE(emergency_units_total, 0),
    'esds', jsonb_build_object(
        'esds_display', COALESCE(esds_score, 0),
        'zone', COALESCE(esds_zone, 'ALERTA'),
        'gargalo_principal', COALESCE(esds_gargalo, ''),
        'gemini_insights', COALESCE(esds_insights, ''),
        'top_gargalos', COALESCE(esds_top_gargalos, '[]'::jsonb),
        'main_drivers', COALESCE(esds_main_drivers, '[]'::jsonb)
    )
);

-- 2. Remover as colunas obsoletas e redundantes das marcas humanas de championships
ALTER TABLE public.companies
    DROP COLUMN IF EXISTS tsr,
    DROP COLUMN IF EXISTS nlcdg,
    DROP COLUMN IF EXISTS ebitda,
    DROP COLUMN IF EXISTS solvency_score_kanitz,
    DROP COLUMN IF EXISTS dcf_valuation,
    DROP COLUMN IF EXISTS total_assets,
    DROP COLUMN IF EXISTS fixed_assets_value,
    DROP COLUMN IF EXISTS stock_value,
    DROP COLUMN IF EXISTS fixed_assets_depreciation,
    DROP COLUMN IF EXISTS ccc,
    DROP COLUMN IF EXISTS interest_coverage,
    DROP COLUMN IF EXISTS export_tariff_brazil,
    DROP COLUMN IF EXISTS export_tariff_uk,
    DROP COLUMN IF EXISTS brl_rate,
    DROP COLUMN IF EXISTS gbp_rate,
    DROP COLUMN IF EXISTS compulsory_loan_balance,
    DROP COLUMN IF EXISTS compulsory_loan_interest_paid,
    DROP COLUMN IF EXISTS scissors_effect,
    DROP COLUMN IF EXISTS liquidity_current,
    DROP COLUMN IF EXISTS solvency_index,
    DROP COLUMN IF EXISTS inventory_turnover,
    DROP COLUMN IF EXISTS avg_receivable_days,
    DROP COLUMN IF EXISTS avg_payable_days,
    DROP COLUMN IF EXISTS price_elasticity,
    DROP COLUMN IF EXISTS carbon_footprint,
    DROP COLUMN IF EXISTS credit_rating,
    DROP COLUMN IF EXISTS altman_z_score,
    DROP COLUMN IF EXISTS fco_livre,
    DROP COLUMN IF EXISTS capex_manutencao,
    DROP COLUMN IF EXISTS capex_estrategico,
    DROP COLUMN IF EXISTS esds_score,
    DROP COLUMN IF EXISTS esds_zone,
    DROP COLUMN IF EXISTS esds_gargalo,
    DROP COLUMN IF EXISTS esds_insights,
    DROP COLUMN IF EXISTS esds_top_gargalos,
    DROP COLUMN IF EXISTS esds_main_drivers,
    DROP COLUMN IF EXISTS stock_mpa_value,
    DROP COLUMN IF EXISTS stock_mpb_value,
    DROP COLUMN IF EXISTS vat_recoverable,
    DROP COLUMN IF EXISTS vat_payable,
    DROP COLUMN IF EXISTS total_receivables,
    DROP COLUMN IF EXISTS total_payables,
    DROP COLUMN IF EXISTS supplier_interest_expenses,
    DROP COLUMN IF EXISTS emergency_purchase_expenses,
    DROP COLUMN IF EXISTS emergency_units_total,
    DROP COLUMN IF EXISTS demand_variation,
    DROP COLUMN IF EXISTS non_op_res,
    DROP COLUMN IF EXISTS ppr;

-- 3. Remover as colunas obsoletas e redundantes das marcas da aba de testes/leads (trial_companies)
ALTER TABLE public.trial_companies
    DROP COLUMN IF EXISTS tsr,
    DROP COLUMN IF EXISTS nlcdg,
    DROP COLUMN IF EXISTS ebitda,
    DROP COLUMN IF EXISTS solvency_score_kanitz,
    DROP COLUMN IF EXISTS dcf_valuation,
    DROP COLUMN IF EXISTS total_assets,
    DROP COLUMN IF EXISTS fixed_assets_value,
    DROP COLUMN IF EXISTS stock_value,
    DROP COLUMN IF EXISTS fixed_assets_depreciation,
    DROP COLUMN IF EXISTS ccc,
    DROP COLUMN IF EXISTS interest_coverage,
    DROP COLUMN IF EXISTS export_tariff_brazil,
    DROP COLUMN IF EXISTS export_tariff_uk,
    DROP COLUMN IF EXISTS brl_rate,
    DROP COLUMN IF EXISTS gbp_rate,
    DROP COLUMN IF EXISTS compulsory_loan_balance,
    DROP COLUMN IF EXISTS compulsory_loan_interest_paid,
    DROP COLUMN IF EXISTS scissors_effect,
    DROP COLUMN IF EXISTS liquidity_current,
    DROP COLUMN IF EXISTS solvency_index,
    DROP COLUMN IF EXISTS inventory_turnover,
    DROP COLUMN IF EXISTS avg_receivable_days,
    DROP COLUMN IF EXISTS avg_payable_days,
    DROP COLUMN IF EXISTS price_elasticity,
    DROP COLUMN IF EXISTS carbon_footprint,
    DROP COLUMN IF EXISTS credit_rating,
    DROP COLUMN IF EXISTS altman_z_score,
    DROP COLUMN IF EXISTS fco_livre,
    DROP COLUMN IF EXISTS capex_manutencao,
    DROP COLUMN IF EXISTS capex_estrategico,
    DROP COLUMN IF EXISTS esds_score,
    DROP COLUMN IF EXISTS esds_zone,
    DROP COLUMN IF EXISTS esds_gargalo,
    DROP COLUMN IF EXISTS esds_insights,
    DROP COLUMN IF EXISTS esds_top_gargalos,
    DROP COLUMN IF EXISTS esds_main_drivers,
    DROP COLUMN IF EXISTS stock_mpa_value,
    DROP COLUMN IF EXISTS stock_mpb_value,
    DROP COLUMN IF EXISTS vat_recoverable,
    DROP COLUMN IF EXISTS vat_payable,
    DROP COLUMN IF EXISTS total_receivables,
    DROP COLUMN IF EXISTS total_payables,
    DROP COLUMN IF EXISTS supplier_interest_expenses,
    DROP COLUMN IF EXISTS emergency_purchase_expenses,
    DROP COLUMN IF EXISTS emergency_units_total;

-- 4. Reconstrução das views fiduciárias de auditoria e telemetria extraindo os dados diretamente de 'kpis' (JSONB)
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

COMMIT;
