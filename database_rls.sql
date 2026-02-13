-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v16.9 - STRATEGIC COMMAND HUB
-- ==============================================================================

-- 1. EXTENSÃO DA TABELA DE HISTÓRICO (COMPANIES)
-- Adiciona colunas para persistir os KPIs calculados pelo motor Oracle
ALTER TABLE IF EXISTS public.companies 
ADD COLUMN IF NOT EXISTS tsr NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS nlcdg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS ebitda NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS solvency_score_kanitz NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS dcf_valuation NUMERIC DEFAULT 0;

-- 2. GARANTIA DE CAMPO DE OBSERVADORES NAS ARENAS
ALTER TABLE IF EXISTS public.championships 
ADD COLUMN IF NOT EXISTS observers JSONB DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS public.trial_championships 
ADD COLUMN IF NOT EXISTS observers JSONB DEFAULT '[]'::jsonb;

-- 3. POLÍTICA DE ACESSO PARA OBSERVADORES (READ-ONLY ACROSS THE BOARD)
-- Permite que usuários na lista 'observers' vejam detalhes do campeonato
DROP POLICY IF EXISTS "Observers_View_Arenas" ON public.championships;
CREATE POLICY "Observers_View_Arenas" ON public.championships 
FOR SELECT TO authenticated 
USING (
  (tutor_id = auth.uid()) OR 
  (observers ? (auth.uid())::text) OR
  (is_public = true)
);

-- 4. POLÍTICA DE SELEÇÃO DE DECISÕES (TUTOR + OBSERVADORES)
DROP POLICY IF EXISTS "Decisions_Select_Auth" ON public.current_decisions;
CREATE POLICY "Decisions_Select_Auth" ON public.current_decisions 
FOR SELECT TO authenticated 
USING (
  (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())) 
  OR 
  (EXISTS (
    SELECT 1 FROM championships c 
    WHERE c.id = current_decisions.championship_id 
    AND (c.tutor_id = auth.uid() OR (c.observers ? (auth.uid())::text)))
  )
);

-- 5. POLÍTICA DE ACESSO HISTÓRICO (COMPANIES) - TUTOR + OBSERVADORES
DROP POLICY IF EXISTS "Command_Center_History_Access" ON public.companies;
CREATE POLICY "Command_Center_History_Access" ON public.companies 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM championships c 
    WHERE c.id = companies.championship_id 
    AND (c.tutor_id = auth.uid() OR (c.observers ? (auth.uid())::text))
  )
  OR 
  (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

COMMENT ON COLUMN public.companies.dcf_valuation IS 'Valor presente do fluxo de caixa descontado da unidade no fechamento da rodada.';
COMMENT ON COLUMN public.companies.solvency_score_kanitz IS 'Termômetro de Kanitz calculado para análise de risco de falência.';
