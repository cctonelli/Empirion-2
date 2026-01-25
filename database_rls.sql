
-- EMPIRION DATABASE SECURITY PATCH v15.6 - ANONYMOUS TRIAL FREEDOM
-- Remove a obrigatoriedade de tutor logado para a sandbox

-- 1. AJUSTE DE SCHEMA: Permite que a arena trial não tenha um tutor vinculado
ALTER TABLE public.trial_championships ALTER COLUMN tutor_id DROP NOT NULL;

-- 2. LIMPEZA E UNIFICAÇÃO DE POLÍTICAS (Evita conflitos detectados no dump de políticas)
DROP POLICY IF EXISTS "Acesso Publico Sandbox" ON public.trial_championships;
DROP POLICY IF EXISTS "Acesso público trial championships" ON public.trial_championships;
DROP POLICY IF EXISTS "Tutor seleciona trial championships" ON public.trial_championships;
DROP POLICY IF EXISTS "Tutor atualiza trial championships" ON public.trial_championships;

CREATE POLICY "Trial_Public_Access_v15"
ON public.trial_championships
FOR ALL 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- 3. TEAMS: Permite gestão anônima
DROP POLICY IF EXISTS "Times Publicos Sandbox" ON public.trial_teams;
DROP POLICY IF EXISTS "Acesso público trial teams" ON public.trial_teams;
DROP POLICY IF EXISTS "Equipe acessa seu trial team" ON public.trial_teams;
DROP POLICY IF EXISTS "Tutor acessa trial teams" ON public.trial_teams;

CREATE POLICY "Trial_Teams_Public_Access_v15"
ON public.trial_teams
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- 4. DECISIONS: Permite transmissão anônima
DROP POLICY IF EXISTS "Decisoes Publicas Sandbox" ON public.trial_decisions;
DROP POLICY IF EXISTS "Acesso público trial decisions" ON public.trial_decisions;
DROP POLICY IF EXISTS "Equipe acessa suas trial decisions" ON public.trial_decisions;
DROP POLICY IF EXISTS "Trial Decisions Access" ON public.trial_decisions;

CREATE POLICY "Trial_Decisions_Public_Access_v15"
ON public.trial_decisions
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);
