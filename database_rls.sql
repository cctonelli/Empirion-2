
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v31.12.3.6 - ORACLE FX & OBSERVER PROTOCOL
-- ==============================================================================

-- 0. GARANTIA DE ESTRUTURA (Colunas necessárias para v15.36)
DO $$ 
BEGIN
    -- Suporte a Observadores Nominados nas Arenas Live
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='observers') THEN
        ALTER TABLE public.championships ADD COLUMN observers JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Suporte a Observadores Nominados nas Arenas Sandbox
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trial_championships' AND column_name='observers') THEN
        ALTER TABLE public.trial_championships ADD COLUMN observers JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Garantia de que a tabela de membros de equipe existe (Base do RLS)
    -- Certifique-se que team_members possui team_id e user_id (sem championship_id direto)
END $$;

-- 1. LIMPEZA E ATIVAÇÃO DE RLS
-- Remove todas as políticas existentes para reinicialização limpa
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
            'point_transactions', 'empire_points', 'championship_tutors',
            'modalities', 'trial_championships', 'trial_teams', 'trial_decisions'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
        FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
        END LOOP;
    END LOOP;
END $$;

-- 2. POLÍTICAS PARA ARENAS (CHAMPIONSHIPS)
-- CORREÇÃO: O acesso via equipe deve ser feito joinando team_members com teams para achar o championship_id
CREATE POLICY "Championship_Select_v15" ON public.championships FOR SELECT TO authenticated
USING (
    tutor_id = auth.uid() 
    OR is_public = true 
    OR id IN (
        SELECT championship_id FROM public.teams 
        WHERE id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
    OR observers @> jsonb_build_array(auth.uid()::text)
);

CREATE POLICY "Championship_Tutor_All" ON public.championships FOR ALL TO authenticated
USING (tutor_id = auth.uid())
WITH CHECK (tutor_id = auth.uid());

-- 3. POLÍTICAS PARA EQUIPES (TEAMS)
CREATE POLICY "Teams_Select_Access" ON public.teams FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM championships c 
        WHERE c.id = teams.championship_id 
        AND (
            c.tutor_id = auth.uid() 
            OR c.is_public = true 
            OR c.observers @> jsonb_build_array(auth.uid()::text)
        )
    )
    OR id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- 4. REGRAS MACRO (CHAMPIONSHIP_MACRO_RULES)
-- Vital para o motor ler USD/EUR e os novos ajustes cambiais de P01-P12
CREATE POLICY "Macro_Rules_Read_v15" ON public.championship_macro_rules FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM championships c 
        WHERE c.id = championship_macro_rules.championship_id 
        AND (
            c.tutor_id = auth.uid() 
            OR c.is_public = true 
            OR c.observers @> jsonb_build_array(auth.uid()::text)
            OR c.id IN (
                SELECT championship_id FROM teams 
                WHERE id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
            )
        )
    )
);

CREATE POLICY "Macro_Rules_Tutor_Manage" ON public.championship_macro_rules FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM championships WHERE id = championship_macro_rules.championship_id AND tutor_id = auth.uid())
);

-- 5. DECISÕES E AUDITORIA (BLINDAGEM CONTRA ESPIONAGEM)
CREATE POLICY "Decisions_Select_Auth" ON public.current_decisions FOR SELECT TO authenticated
USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM championships c WHERE c.id = current_decisions.championship_id AND c.tutor_id = auth.uid())
);

CREATE POLICY "Decisions_Write_Own_Team" ON public.current_decisions FOR ALL TO authenticated
USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
WITH CHECK (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

-- 6. HISTÓRICO FINANCEIRO (COMPANIES)
-- Registro de KPIs onde as rubricas de Ganho/Perda Cambial são consolidadas
CREATE POLICY "Companies_Select_v15" ON public.companies FOR SELECT TO authenticated
USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM championships c 
        WHERE c.id = companies.championship_id 
        AND (c.tutor_id = auth.uid() OR c.observers @> jsonb_build_array(auth.uid()::text))
    )
);

-- 7. SANDBOX (TRIAL TABLES)
CREATE POLICY "Trial_Champs_Manage" ON public.trial_championships FOR ALL TO authenticated
USING (tutor_id = auth.uid() OR tutor_id IS NULL)
WITH CHECK (tutor_id = auth.uid() OR tutor_id IS NULL);

CREATE POLICY "Trial_Teams_Read" ON public.trial_teams FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "Trial_Decisions_Manage" ON public.trial_decisions FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- 8. USUÁRIOS E PERFIS
CREATE POLICY "Users_Self_Access" ON public.users FOR SELECT TO authenticated USING (supabase_user_id = auth.uid());
CREATE POLICY "Users_Self_Update" ON public.users FOR UPDATE TO authenticated USING (supabase_user_id = auth.uid());

-- 9. MODALIDADES (PÚBLICAS)
CREATE POLICY "Modalities_Public_Read" ON public.modalities FOR SELECT TO authenticated, anon USING (is_public = true);
