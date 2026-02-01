
-- ==============================================================================
-- EMPIRION SCHEMA POLISH v31.7 - ORACLE MASTER COMPATIBILITY
-- ==============================================================================

-- 1. AJUSTES NA TABELA DE USUÁRIOS (Suporte para Opal Premium)
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS is_opal_premium BOOLEAN DEFAULT false;

-- 2. AJUSTES NAS ARENAS (Suporte para Ecosystem Config)
ALTER TABLE IF EXISTS public.championships 
ADD COLUMN IF NOT EXISTS ecosystem_config jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.trial_championships 
ADD COLUMN IF NOT EXISTS ecosystem_config jsonb DEFAULT '{}'::jsonb;

-- 3. REFORÇO DE RLS IDEMPOTENTE
-- Garante que o RLS esteja ativo em todas as tabelas críticas reportadas
ALTER TABLE public.current_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO SEGURAS (DROP & CREATE)
DO $$ 
BEGIN
    -- Decisões: Jogadores gerenciam apenas o seu ID de equipe
    DROP POLICY IF EXISTS "Players_Manage_Own_Decisions" ON public.current_decisions;
    CREATE POLICY "Players_Manage_Own_Decisions" ON public.current_decisions
    FOR ALL TO authenticated
    USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

    -- Histórico: Tutors leem tudo do seu campeonato
    DROP POLICY IF EXISTS "Tutors_Read_Arena_History" ON public.companies;
    CREATE POLICY "Tutors_Read_Arena_History" ON public.companies
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.championships c WHERE c.id = championship_id AND c.tutor_id = auth.uid()));

    -- Planos de Negócio: Equipes gerenciam o seu
    DROP POLICY IF EXISTS "Team_Manage_Business_Plan" ON public.business_plans;
    CREATE POLICY "Team_Manage_Business_Plan" ON public.business_plans
    FOR ALL TO authenticated
    USING (team_id IN (SELECT team_members.team_id FROM team_members WHERE team_members.user_id = auth.uid()))
    WITH CHECK (team_id IN (SELECT team_members.team_id FROM team_members WHERE team_members.user_id = auth.uid()));
END $$;
