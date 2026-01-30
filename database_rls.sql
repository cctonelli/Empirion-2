
-- ==============================================================================
-- EMPIRION DATABASE SECURITY PATCH v30.0 - ORACLE MASTER CORE (UNIFIED)
-- Objetivo: Blindagem Tática, Suporte a Observadores e Expansão de Ratings.
-- Data: 24/01/2026
-- ==============================================================================

-- 1. CORREÇÃO DE CONSTRAINT: CREDIT RATING EXPANSION
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_credit_rating_check;
ALTER TABLE public.companies ADD CONSTRAINT companies_credit_rating_check 
CHECK (credit_rating = ANY (ARRAY['AAA'::text, 'AA'::text, 'A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, 'N/A'::text]));

-- 2. LIMPEZA TOTAL DE POLÍTICAS ANTIGAS (EVITAR CONFLITOS DE REDUNDÂNCIA)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('championships', 'teams', 'current_decisions', 'business_plans', 'trial_decisions')) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. POLÍTICAS UNIFICADAS: CHAMPIONSHIPS
CREATE POLICY "Unified_Championship_Select" ON public.championships FOR SELECT TO authenticated, anon
USING (
  is_public = true 
  OR tutor_id = auth.uid() 
  OR observers @> jsonb_build_array(auth.uid()::text)
  OR (auth.jwt() ->> 'email' IS NOT NULL AND observers @> jsonb_build_array(auth.jwt() ->> 'email'))
  OR EXISTS (SELECT 1 FROM public.championship_tutors ct WHERE ct.championship_id = id AND ct.user_id = auth.uid())
);

CREATE POLICY "Tutor_Championship_All" ON public.championships FOR ALL TO authenticated
USING (tutor_id = auth.uid()) WITH CHECK (tutor_id = auth.uid());

-- 4. POLÍTICAS UNIFICADAS: TEAMS
CREATE POLICY "Unified_Team_Select" ON public.teams FOR SELECT TO authenticated, anon
USING (
  EXISTS (SELECT 1 FROM public.championships c WHERE c.id = teams.championship_id) -- Regra base: visível se ligada a arena acessível
);

-- 5. POLÍTICAS UNIFICADAS: DECISIONS (PROTEÇÃO TÁTICA)
CREATE POLICY "Team_Decision_Manage" ON public.current_decisions FOR ALL TO authenticated
USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

CREATE POLICY "Tutor_Observer_Decision_Read" ON public.current_decisions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.championships c 
    WHERE c.id = current_decisions.championship_id 
    AND (
      c.tutor_id = auth.uid() 
      OR c.observers @> jsonb_build_array(auth.uid()::text)
      OR (auth.jwt() ->> 'email' IS NOT NULL AND c.observers @> jsonb_build_array(auth.jwt() ->> 'email'))
    )
  )
);

-- 6. POLÍTICAS UNIFICADAS: BUSINESS PLANS (READ-ONLY PARA OBSERVADORES)
CREATE POLICY "Team_BP_Manage" ON public.business_plans FOR ALL TO authenticated
USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

CREATE POLICY "Tutor_Observer_BP_Read" ON public.business_plans FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.championships c 
    WHERE c.id = business_plans.championship_id 
    AND (
      c.tutor_id = auth.uid() 
      OR c.observers @> jsonb_build_array(auth.uid()::text)
    )
  )
);

-- 7. POLÍTICAS PARA TRIALS (SANDBOX MODE)
CREATE POLICY "Trial_Arena_Public" ON public.trial_championships FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Trial_Teams_Public" ON public.trial_teams FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Trial_Decisions_Public" ON public.trial_decisions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 8. INDEXAÇÃO COMPLEMENTAR
CREATE INDEX IF NOT EXISTS idx_championships_observers_v30 ON public.championships USING gin (observers);
