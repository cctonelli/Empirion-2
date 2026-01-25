
-- EMPIRION DATABASE SECURITY PATCH v15.4 - ANONYMOUS TRIAL ACCESS
-- Habilita o modo Sandbox sem exigência de login para tabelas Trial

-- 1. TRIAL_CHAMPIONSHIPS: Permite que qualquer um (logado ou anon) crie e veja arenas trial
DROP POLICY IF EXISTS "Tutor cria trial championships" ON public.trial_championships;
CREATE POLICY "Acesso público trial championships"
ON public.trial_championships
FOR ALL 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- 2. TRIAL_TEAMS: Permite gestão de equipes trial sem auth
DROP POLICY IF EXISTS "Tutor cria trial teams" ON public.trial_teams;
DROP POLICY IF EXISTS "Tutor gerencia times do seu trial" ON public.trial_teams;
CREATE POLICY "Acesso público trial teams"
ON public.trial_teams
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- 3. TRIAL_DECISIONS: Permite transmissão de decisões trial sem auth
DROP POLICY IF EXISTS "Tutor audita decisões do seu trial" ON public.trial_decisions;
DROP POLICY IF EXISTS "Equipes criam decisões trial" ON public.trial_decisions;
CREATE POLICY "Acesso público trial decisions"
ON public.trial_decisions
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Nota: Certifique-se de que a coluna tutor_id nas tabelas trial_* aceite NULL 
-- ou use o UUID 00000000-0000-0000-0000-000000000000 como fallback.
