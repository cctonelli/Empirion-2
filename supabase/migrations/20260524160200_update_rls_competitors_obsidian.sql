-- Migração para atualização de RLS da Obsidian Enterprise v19.8
-- Objetivo: Liberar visualização livre intra-campeonato na Oracle Gazette, e corrigir controle de autoria para as empresas.

BEGIN;

-- ==============================================================================
-- 1. LIMPEZA & RECONSTRUÇÃO DE RLS PARA TABELA COMPANIES
-- ==============================================================================
DROP POLICY IF EXISTS "Companies: Jogadores veem sua própria empresa" ON public.companies;
DROP POLICY IF EXISTS "Companies_Access_Master" ON public.companies;
DROP POLICY IF EXISTS "Players_View_Own_History" ON public.companies;
DROP POLICY IF EXISTS "Leitura de empresas competidoras" ON public.companies;

CREATE POLICY "Leitura de empresas competidoras" ON public.companies
    FOR SELECT TO authenticated
    USING (
        -- Tutores e Admins
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id = auth.uid()
            AND up.role IN ('tutor', 'admin')
        )
        -- Jogador participante de alguma equipe inscrita nesse campeonato (via team_members)
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id = u.id
            WHERE u.supabase_user_id = auth.uid()
            AND tm.championship_id = companies.championship_id
        )
        -- Mapeamento Sandbox/Trial 1-para-1
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id = auth.uid()
            AND companies.championship_id IN (
                SELECT t.championship_id FROM public.teams t WHERE t.id = up.id
            )
        )
    );

DROP POLICY IF EXISTS "Companies: Jogadores atualizam sua própria empresa" ON public.companies;
DROP POLICY IF EXISTS "Jogadores atualizam sua propria empresa_v2" ON public.companies;

CREATE POLICY "Jogadores atualizam sua propria empresa_v2" ON public.companies
    FOR UPDATE TO authenticated
    USING (
        -- Tutores e Admins
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id = auth.uid()
            AND up.role IN ('tutor', 'admin')
        )
        -- Membros que de fato jogam no respectivo time
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id = u.id
            WHERE u.supabase_user_id = auth.uid()
            AND tm.team_id = companies.team_id
        )
        -- Mapeamento Sandbox 1-para-1
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id = auth.uid()
            AND up.id = companies.team_id
        )
    );

-- ==============================================================================
-- 2. LIMPEZA & RECONSTRUÇÃO DE RLS PARA TABELA TEAMS
-- ==============================================================================
DROP POLICY IF EXISTS "Times: Jogadores veem seu próprio time" ON public.teams;
DROP POLICY IF EXISTS "Teams_Visibility" ON public.teams;
DROP POLICY IF EXISTS "Leitura de equipes competidoras" ON public.teams;

CREATE POLICY "Leitura de equipes competidoras" ON public.teams
    FOR SELECT TO authenticated
    USING (
        -- Tutores e Admins
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id = auth.uid()
            AND up.role IN ('tutor', 'admin')
        )
        -- Jogador participante de alguma equipe inscrita nesse campeonato (via team_members)
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id = u.id
            WHERE u.supabase_user_id = auth.uid()
            AND tm.championship_id = teams.championship_id
        )
        -- Mapeamento Sandbox 1-para-1
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id = auth.uid()
            AND teams.championship_id IN (
                SELECT t.championship_id FROM public.teams t WHERE t.id = up.id
            )
        )
    );

DROP POLICY IF EXISTS "Times: Jogadores atualizam seu próprio time" ON public.teams;
DROP POLICY IF EXISTS "Jogadores atualizam seu proprio time_v2" ON public.teams;

CREATE POLICY "Jogadores atualizam seu proprio time_v2" ON public.teams
    FOR UPDATE TO authenticated
    USING (
        -- Tutores e Admins
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id = auth.uid()
            AND up.role IN ('tutor', 'admin')
        )
        -- Membros que jogam no respectivo time
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id = u.id
            WHERE u.supabase_user_id = auth.uid()
            AND tm.team_id = teams.id
        )
        -- Mapeamento Sandbox 1-para-1
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id = auth.uid()
            AND up.id = teams.id
        )
    );

COMMIT;
