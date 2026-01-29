
-- ==============================================================================
-- EMPIRION DATABASE SECURITY PATCH v28.6 - GRANULAR FINANCE SYNC
-- Objetivo: Suporte a Fluxo de Caixa Granular e Auditoria por Abas.
-- Data: 18/01/2026
-- ==============================================================================

-- 1. REFORÇO DE INTEGRIDADE: CHAMPIONSHIPS
-- Garante que a coluna dividend_percent esteja presente para o cálculo de PL retido
ALTER TABLE public.championships ADD COLUMN IF NOT EXISTS dividend_percent numeric DEFAULT 25.0;
ALTER TABLE public.trial_championships ADD COLUMN IF NOT EXISTS dividend_percent numeric DEFAULT 25.0;

-- 2. NOTA TÉCNICA: A estrutura JSONB em 'teams.kpis' agora deve incluir o nó 'statements.cash_flow'
-- com a estrutura de entrada/saída detalhada para renderização no Audit Node.

-- 3. AJUSTE DE PRIVILÉGIOS PARA RELATÓRIOS
GRANT SELECT ON public.public_reports TO authenticated, anon;

-- 4. POLÍTICA DE LEITURA REFORÇADA PARA DASHBOARD
DROP POLICY IF EXISTS "Public can view active championship teams" ON public.teams;
CREATE POLICY "Public can view active championship teams" ON public.teams
FOR SELECT TO anon, authenticated USING (true);
