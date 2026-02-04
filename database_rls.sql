
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v31.12.3.8 - SANDBOX PERMISSIVE PROTOCOL
-- ==============================================================================

-- 1. GARANTIA DE ESTRUTURA (Colunas e Tabelas Core)
DO $$ 
BEGIN
    -- Suporte a Observadores Nominados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='observers') THEN
        ALTER TABLE public.championships ADD COLUMN observers JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trial_championships' AND column_name='observers') THEN
        ALTER TABLE public.trial_championships ADD COLUMN observers JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Tabela de Conteúdo Dinâmico (CMS)
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'site_content') THEN
        CREATE TABLE public.site_content (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            page_slug TEXT NOT NULL,
            locale TEXT NOT NULL,
            content JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(page_slug, locale)
        );
    END IF;
END $$;

-- 2. LIMPEZA E ATIVAÇÃO DE RLS
DO $$ 
DECLARE
    t text;
    p record;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN (
            'championships', 'teams', 'team_members', 'companies', 
            'current_decisions', 'decision_audit_log', 'public_reports', 
            'users', 'championship_macro_rules', 'business_plans', 
            'site_content', 'modalities', 'trial_championships', 'trial_teams', 'trial_decisions'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
        FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
        END LOOP;
    END LOOP;
END $$;

-- 3. POLÍTICAS DE ACESSO (CHAMPIONSHIPS OFICIAIS)
CREATE POLICY "Championship_Select_v15" ON public.championships FOR SELECT TO authenticated
USING (
    tutor_id = auth.uid() 
    OR is_public = true 
    OR id IN (
        SELECT championship_id FROM public.teams 
        WHERE id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
    OR (observers ? auth.uid()::text)
);

CREATE POLICY "Championship_Tutor_All" ON public.championships FOR ALL TO authenticated
USING (tutor_id = auth.uid())
WITH CHECK (tutor_id = auth.uid());

-- 4. POLÍTICAS DE CONTEÚDO (SITE_CONTENT / CMS)
CREATE POLICY "Site_Content_Public_Read" ON public.site_content FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Site_Content_Admin_Manage" ON public.site_content FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_user_id = auth.uid() AND role = 'admin'));

-- 5. DECISÕES E AUDITORIA (OFICIAIS)
CREATE POLICY "Decisions_Select_Auth" ON public.current_decisions FOR SELECT TO authenticated
USING (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.championships c WHERE c.id = current_decisions.championship_id AND c.tutor_id = auth.uid())
);

CREATE POLICY "Decisions_Write_Own_Team" ON public.current_decisions FOR ALL TO authenticated
USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

-- 6. SANDBOX (TRIAL TABLES - ACESSO TOTAL ANON + AUTH)
-- Fundamental para o modo MVP sem login obrigatório.
CREATE POLICY "Trial_Champs_Permissive" ON public.trial_championships FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Trial_Teams_Permissive" ON public.trial_teams FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Trial_Decisions_Permissive" ON public.trial_decisions FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 7. USUÁRIOS E PERFIS
CREATE POLICY "Users_Self_Access" ON public.users FOR SELECT TO authenticated USING (supabase_user_id = auth.uid());
CREATE POLICY "Users_Self_Update" ON public.users FOR UPDATE TO authenticated USING (supabase_user_id = auth.uid());
CREATE POLICY "Users_Admin_Read" ON public.users FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_user_id = auth.uid() AND role = 'admin'));
