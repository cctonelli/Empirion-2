
-- EMPIRION DATABASE SECURITY PATCH v15.3 - ABSOLUTE TRIAL GOVERNANCE
-- Consolidação de permissões para Orquestração Sandbox

-- 1. ESTRUTURA DE CO-TUTORIA TRIAL
ALTER TABLE public.trial_tutors ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA TRIAL_CHAMPIONSHIPS
DROP POLICY IF EXISTS "Tutor cria trial championships" ON public.trial_championships;
CREATE POLICY "Tutor cria trial championships"
ON public.trial_championships
FOR INSERT
TO authenticated
WITH CHECK (tutor_id = auth.uid());

DROP POLICY IF EXISTS "Tutor seleciona trial championships" ON public.trial_championships;
CREATE POLICY "Tutor seleciona trial championships"
ON public.trial_championships
FOR SELECT
TO authenticated
USING (
  (tutor_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.trial_tutors tt
    WHERE tt.championship_id = trial_championships.id
      AND tt.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Tutor atualiza trial championships" ON public.trial_championships;
CREATE POLICY "Tutor atualiza trial championships"
ON public.trial_championships
FOR UPDATE
TO authenticated
USING (
  (tutor_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.trial_tutors tt
    WHERE tt.championship_id = trial_championships.id
      AND tt.user_id = auth.uid()
  )
);

-- 3. POLÍTICAS PARA TRIAL_TEAMS (VÍNCULO COM TUTOR)
DROP POLICY IF EXISTS "Tutor cria trial teams" ON public.trial_teams;
CREATE POLICY "Tutor cria trial teams"
ON public.trial_teams
FOR INSERT
TO authenticated
WITH CHECK (
  championship_id IN (
    SELECT tc.id
    FROM public.trial_championships tc
    WHERE tc.tutor_id = auth.uid()
       OR EXISTS (
         SELECT 1 FROM public.trial_tutors tt
         WHERE tt.championship_id = tc.id
           AND tt.user_id = auth.uid()
       )
  )
);

DROP POLICY IF EXISTS "Tutor gerencia times do seu trial" ON public.trial_teams;
CREATE POLICY "Tutor gerencia times do seu trial"
ON public.trial_teams
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trial_championships tc
    WHERE tc.id = trial_teams.championship_id
      AND (tc.tutor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.trial_tutors tt WHERE tt.championship_id = tc.id AND tt.user_id = auth.uid()))
  )
);

-- 4. POLÍTICAS PARA TRIAL_DECISIONS
DROP POLICY IF EXISTS "Tutor audita decisões do seu trial" ON public.trial_decisions;
CREATE POLICY "Tutor audita decisões do seu trial"
ON public.trial_decisions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trial_championships tc
    WHERE tc.id = trial_decisions.championship_id
      AND (tc.tutor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.trial_tutors tt WHERE tt.championship_id = tc.id AND tt.user_id = auth.uid()))
  )
);

DROP POLICY IF EXISTS "Equipes criam decisões trial" ON public.trial_decisions;
CREATE POLICY "Equipes criam decisões trial"
ON public.trial_decisions
FOR ALL
TO authenticated
USING (true);
