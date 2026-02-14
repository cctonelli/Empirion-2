
-- ==============================================================================
-- EMPIRION DATABASE CONSOLIDATED SCHEMA v18.8 GOLD
-- Protocolo: ORACLE-CORE-RLS-IDEMPOTENT-FINAL-V2
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LIMPEZA AGRESSIVA DE TODAS AS POLÍTICAS EXISTENTES
-- Este bloco evita o erro "policy already exists" ao rodar o script múltiplas vezes.
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

-- 3. NORMALIZAÇÃO DE COLUNA: observers (Conversão segura para UUID[])
-- Corrige o erro "operator does not exist: jsonb @> uuid[]"
DO $$ 
BEGIN 
    -- Para a tabela championships
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'championships' AND column_name = 'observers' AND data_type = 'jsonb') THEN
        ALTER TABLE public.championships ALTER COLUMN observers DROP DEFAULT;
        ALTER TABLE public.championships 
        ALTER COLUMN observers 
        TYPE UUID[] 
        USING (
            CASE 
                WHEN observers IS NULL OR jsonb_typeof(observers) <> 'array' THEN '{}'::uuid[] 
                ELSE ARRAY(SELECT jsonb_array_elements_text(observers)::uuid)::uuid[]
            END
        );
        ALTER TABLE public.championships ALTER COLUMN observers SET DEFAULT '{}'::uuid[];
    END IF;

    -- Para a tabela trial_championships
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trial_championships' AND column_name = 'observers' AND data_type = 'jsonb') THEN
        ALTER TABLE public.trial_championships ALTER COLUMN observers DROP DEFAULT;
        ALTER TABLE public.trial_championships 
        ALTER COLUMN observers 
        TYPE UUID[] 
        USING (
            CASE 
                WHEN observers IS NULL OR jsonb_typeof(observers) <> 'array' THEN '{}'::uuid[] 
                ELSE ARRAY(SELECT jsonb_array_elements_text(observers)::uuid)::uuid[]
            END
        );
        ALTER TABLE public.trial_championships ALTER COLUMN observers SET DEFAULT '{}'::uuid[];
    END IF;
END $$;

-- 4. HABILITAÇÃO DE RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE SEGURANÇA (NOVO ESTADO)

-- USUÁRIOS
CREATE POLICY "Users_Read_Own" ON public.users FOR SELECT USING (auth.uid() = supabase_user_id);
CREATE POLICY "Users_Manage_Own" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users_Admin_Select_All" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.supabase_user_id = auth.uid() AND u.role = 'admin'));

-- CAMPEONATOS
CREATE POLICY "Championships_Tutor_All" ON public.championships FOR ALL USING (auth.uid() = tutor_id);
CREATE POLICY "Championships_Visibility" ON public.championships 
    FOR SELECT USING (
        is_public = true OR 
        auth.uid() = tutor_id OR 
        observers @> ARRAY[auth.uid()] OR 
        EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.championship_id = championships.id AND tm.user_id = auth.uid())
    );

-- EQUIPES
CREATE POLICY "Teams_Visibility" ON public.teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.championships c
            WHERE c.id = teams.championship_id 
            AND (
                c.is_public = true OR 
                c.tutor_id = auth.uid() OR 
                c.observers @> ARRAY[auth.uid()] OR 
                EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid())
            )
        )
    );

-- DECISÕES
CREATE POLICY "Decisions_Write_Access" ON public.current_decisions 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = current_decisions.team_id AND tm.user_id = auth.uid())
    );

CREATE POLICY "Decisions_Read_Audit" ON public.current_decisions 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.championships c
            WHERE c.id = current_decisions.championship_id 
            AND (c.tutor_id = auth.uid() OR c.observers @> ARRAY[auth.uid()])
        )
    );

-- RESULTADOS (COMPANIES)
CREATE POLICY "Results_Visibility" ON public.companies 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.championships c
            WHERE c.id = companies.championship_id 
            AND (c.tutor_id = auth.uid() OR c.observers @> ARRAY[auth.uid()] OR c.is_public = true)
        ) OR
        EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = companies.team_id AND tm.user_id = auth.uid())
    );

-- BUSINESS PLANS
CREATE POLICY "BP_Author_Full" ON public.business_plans FOR ALL USING (user_id = auth.uid());
CREATE POLICY "BP_Tutor_Read" ON public.business_plans FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.championships c 
        WHERE c.id = business_plans.championship_id AND c.tutor_id = auth.uid()
    )
);

-- CONTEÚDO DO SITE (CMS)
CREATE POLICY "SiteContent_Public_Read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "SiteContent_Admin_Manage" ON public.site_content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.supabase_user_id = auth.uid() AND u.role = 'admin')
);

-- 6. TRIGGER DE SINCRONIZAÇÃO (CORREÇÃO DE CONFLITOS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, supabase_user_id, email, name, role)
    VALUES (
        new.id, 
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE(new.raw_user_meta_data->>'role', 'player')
    )
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        name = COALESCE(public.users.name, EXCLUDED.name);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
