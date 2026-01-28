
-- ==============================================================================
-- EMPIRION DATABASE SECURITY PATCH v27.1 - FISCAL & STAFFING EVOLUTION
-- Objetivo: Suporte a Dividendos, Master Key e Headcount 20/10.
-- Data: 12/01/2026
-- ==============================================================================

-- 1. AJUSTES ESTRUTURAIS: CHAMPIONSHIPS (Live e Trial)
-- Adiciona percentual de dividendos definido pelo tutor
ALTER TABLE public.championships ADD COLUMN IF NOT EXISTS dividend_percent numeric DEFAULT 25.0;
ALTER TABLE public.trial_championships ADD COLUMN IF NOT EXISTS dividend_percent numeric DEFAULT 25.0;

-- 2. AJUSTES ESTRUTURAIS: TEAMS (Live e Trial)
-- Suporte a Master Key do Tutor e identificação de Bots
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS master_key_enabled boolean DEFAULT false;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;

ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS master_key_enabled boolean DEFAULT false;
ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;

-- 3. REFORÇO DE POLÍTICAS RLS PARA TUTORES
-- Garante que o tutor possa gerenciar indicadores macro sem restrições
DROP POLICY IF EXISTS "Tutors manage their own championships" ON public.championships;
CREATE POLICY "Tutors manage their own championships" ON public.championships
FOR ALL TO authenticated USING (auth.uid() = tutor_id) WITH CHECK (auth.uid() = tutor_id);

-- 4. GRANTS DE ACESSO PARA MODO TRIAL (NO-AUTH)
-- Essencial para que as operações de simulação não falhem por falta de privilégios em colunas novas
GRANT ALL ON public.trial_championships TO anon, authenticated;
GRANT ALL ON public.trial_teams TO anon, authenticated;

-- 5. VALIDAÇÃO DE INTEGRIDADE JSONB
-- Nota: O motor simulation.ts v27.0 agora espera as seguintes chaves dentro de current_decisions.data:
-- { "production": { "rd_investment": numeric, "net_profit_target_percent": numeric, "term_interest_rate": numeric } }
-- E dentro de market_indicators:
-- { "production_hours_period": integer, "social_charges": numeric }
