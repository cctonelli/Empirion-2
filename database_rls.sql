
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.2.6 - TRIAL CORE STABILIZATION
-- ==============================================================================

-- 1. GARANTIA DE USUÁRIO DE SISTEMA (UUID 0000...0000)
INSERT INTO public.users (id, supabase_user_id, name, email, role)
VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Trial Orchestrator', 'trial@empirion.com', 'tutor')
ON CONFLICT (id) DO NOTHING;

-- 2. REINICIALIZAÇÃO DE POLÍTICAS TRIAL
-- Garante que 'anon' e 'authenticated' tenham acesso irrestrito às tabelas experimentais.

-- TRIAL_CHAMPIONSHIPS
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Trial_Champs_Access" ON public.trial_championships;
DROP POLICY IF EXISTS "Trial_Champs_Intervention" ON public.trial_championships;
DROP POLICY IF EXISTS "Trial_Champs_Permissive" ON public.trial_championships;

CREATE POLICY "Unified_Trial_Champs_Policy" ON public.trial_championships 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- TRIAL_TEAMS
ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Trial_Teams_Access" ON public.trial_teams;
DROP POLICY IF EXISTS "Trial_Teams_Permissive" ON public.trial_teams;

CREATE POLICY "Unified_Trial_Teams_Policy" ON public.trial_teams 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- TRIAL_DECISIONS
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Trial_Decisions_Access" ON public.trial_decisions;
DROP POLICY IF EXISTS "Trial_Decisions_Permissive" ON public.trial_decisions;

CREATE POLICY "Unified_Trial_Decisions_Policy" ON public.trial_decisions 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- TRIAL_TUTORS
ALTER TABLE public.trial_tutors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Trial_Tutors_Access" ON public.trial_tutors;
DROP POLICY IF EXISTS "Trial_Tutors_Permissive" ON public.trial_tutors;

CREATE POLICY "Unified_Trial_Tutors_Policy" ON public.trial_tutors 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 3. REFORÇO NA TABELA DE COMPANIES (HISTÓRICO)
-- Essencial para que o motor de turnover funcione para anon.
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_History_Write" ON public.companies;
DROP POLICY IF EXISTS "Service_Write_History" ON public.companies;

CREATE POLICY "Unified_History_Policy" ON public.companies 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

COMMENT ON TABLE public.trial_championships IS 'Tabela v13.2.6 - RLS Unificado para papel anon/authenticated.';
