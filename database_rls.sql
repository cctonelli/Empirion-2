
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.2.5 - TRIAL CORE RECOVERY
-- ==============================================================================

-- 1. GARANTIA DE USUÁRIO DE SISTEMA (UUID 0000...0000)
-- Necessário para manter a integridade referencial em campeonatos trial sem login.
INSERT INTO public.users (id, supabase_user_id, name, email, role)
VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Trial Orchestrator', 'trial@empirion.com', 'tutor')
ON CONFLICT (id) DO NOTHING;

-- 2. LIBERAÇÃO DE TABELAS TRIAL PARA ACESSO PÚBLICO (ANON)
-- As tabelas trial são isoladas para permitir experimentos sem poluir a produção.

-- TRIAL_CHAMPIONSHIPS
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Trial_Champs_Access" ON public.trial_championships;
CREATE POLICY "Public_Trial_Champs_Access" ON public.trial_championships 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

-- TRIAL_TEAMS
ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Trial_Teams_Access" ON public.trial_teams;
CREATE POLICY "Public_Trial_Teams_Access" ON public.trial_teams 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

-- TRIAL_DECISIONS
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Trial_Decisions_Access" ON public.trial_decisions;
CREATE POLICY "Public_Trial_Decisions_Access" ON public.trial_decisions 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

-- TRIAL_TUTORS
ALTER TABLE public.trial_tutors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Trial_Tutors_Access" ON public.trial_tutors;
CREATE POLICY "Public_Trial_Tutors_Access" ON public.trial_tutors 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

-- 3. REFORÇO NA TABELA DE EMPRESAS (HISTÓRICO)
-- Garante que o motor de turnover possa gravar resultados mesmo para equipes trial.
DROP POLICY IF EXISTS "Public_History_Write" ON public.companies;
CREATE POLICY "Public_History_Write" ON public.companies 
FOR INSERT TO public 
WITH CHECK (true);

COMMENT ON TABLE public.trial_championships IS 'Tabela v13.2.5 - Acesso público total habilitado para Sandbox.';
