
-- ==============================================================================
-- EMPIRION DATABASE CONSOLIDATED SCHEMA v18.9 GOLD - TRIAL SUPPORT
-- Protocolo: ORACLE-CORE-RLS-IDEMPOTENT-FINAL-V3
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LIMPEZA AGRESSIVA DE TODAS AS POLÍTICAS EXISTENTES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'championships', 'teams', 'current_decisions', 'companies', 'business_plans', 'team_members', 'trial_championships', 'trial_teams', 'trial_decisions', 'site_content')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. HABILITAÇÃO DE RLS NAS TABELAS DE TRIAL
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS PARA TABELAS TRIAL (SANDBOX)
-- Permite que qualquer um veja arenas trial (necessário para o modo Trial Master)
CREATE POLICY "Trial_Champs_Visibility" ON public.trial_championships 
    FOR SELECT USING (true);

-- Permite inserção de arenas trial por qualquer usuário (ou o SYSTEM_TUTOR_ID)
CREATE POLICY "Trial_Champs_Insert" ON public.trial_championships 
    FOR INSERT WITH CHECK (true);

-- Permite visualização de equipes trial
CREATE POLICY "Trial_Teams_Visibility" ON public.trial_teams 
    FOR SELECT USING (true);

CREATE POLICY "Trial_Teams_Insert" ON public.trial_teams 
    FOR INSERT WITH CHECK (true);

-- 5. POLÍTICAS PARA TABELAS OFICIAIS (RLS REFORÇADO)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users_Read_Own" ON public.users FOR SELECT USING (auth.uid() = supabase_user_id);
CREATE POLICY "Championships_Tutor_All" ON public.championships FOR ALL USING (auth.uid() = tutor_id);
CREATE POLICY "Championships_Visibility" ON public.championships 
    FOR SELECT USING (
        is_public = true OR 
        auth.uid() = tutor_id OR 
        observers @> ARRAY[auth.uid()]
    );

-- 6. POLÍTICAS PARA CONTEÚDO (CMS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SiteContent_Public_Read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "SiteContent_Admin_Manage" ON public.site_content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.supabase_user_id = auth.uid() AND u.role = 'admin')
);

COMMIT;
