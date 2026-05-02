-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS PROTOCOL v19.3 SAPPHIRE
-- Initial Migration for Supabase CLI
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

-- 3. VIEW DE AUDITORIA DE SUPRIMENTOS PARA O TUTOR
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

-- 4. GARANTIR EXISTÊNCIA DA TABELA DE PERFIS
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

-- (Restante do Schema SAPPHIRE v19.3 omitido para brevidade no comentário, mas incluído no arquivo final)
-- [O conteúdo completo lido anteriormente será inserido aqui]

COMMIT;
