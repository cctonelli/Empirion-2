-- Migração de Banco de Dados para Governança do EMPIRION v2026.120
-- Detalhe: Bloqueio de tráfego bilateral de decisões/rascunhos de competidores concorrentes durante rounds ativos.
-- Permissão total concedida exclusivamente para Tutors, Admins e Observers (Conselheiros) formalizados.

BEGIN;

-- ==============================================================================
-- 1. HABILITAR ROW LEVEL SECURITY (RLS) NAS TABELAS DE DECISÕES
-- ==============================================================================
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_decisions ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. RECONSTRUÇÃO DE POLÍTICAS PARA TRIAL_DECISIONS (BETA/SANDBOX)
-- ==============================================================================
DROP POLICY IF EXISTS "Leitura de trial_decisions" ON public.trial_decisions;
CREATE POLICY "Leitura de trial_decisions" ON public.trial_decisions
    FOR SELECT TO public
    USING (
        -- Permitir acesso instantâneo se não houver login ativo no Supabase (teste/Sandbox do Trial)
        auth.uid() IS NULL
        -- Se estiver autenticado, aplicar regras éticas e de governança estritas
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin', 'observer')
        )
        -- Observadores nominados nominalmente em trial_championships
        OR EXISTS (
            SELECT 1 FROM public.trial_championships tc
            WHERE tc.id::text = trial_decisions.championship_id::text
            AND tc.observers IS NOT NULL 
            AND auth.uid()::text = ANY (tc.observers::text[])
         )
        -- Jogador dono do rascunho de decisão correspondente à sua própria equipe
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = trial_decisions.team_id::text
        )
    );

DROP POLICY IF EXISTS "Gerenciamento de trial_decisions" ON public.trial_decisions;
CREATE POLICY "Gerenciamento de trial_decisions" ON public.trial_decisions
    FOR ALL TO public
    USING (
         -- Permitir mutação (gravação e alteração) se não estiver logado (modo temporário do Trial)
         auth.uid() IS NULL
         -- Se estiver autenticado, regras rígidas de segurança tomam efeito
         OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
         )
         OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = trial_decisions.team_id::text
         )
    );

-- ==============================================================================
-- 3. RECONSTRUÇÃO DE POLÍTICAS PARA CURRENT_DECISIONS (CAMPEONATOS PAGOS)
-- ==============================================================================
DROP POLICY IF EXISTS "Leitura de current_decisions" ON public.current_decisions;
CREATE POLICY "Leitura de current_decisions" ON public.current_decisions
    FOR SELECT TO authenticated
    USING (
        -- Tutor, Admin e Observadores do sistema global
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin', 'observer')
        )
        -- Observadores cadastrados nominalmente no campeonato correspondente
        OR EXISTS (
            SELECT 1 FROM public.championships c
            WHERE c.id::text = current_decisions.championship_id::text
            AND c.observers IS NOT NULL 
            AND auth.uid()::text = ANY (c.observers::text[])
        )
        -- Jogador dono do rascunho participante do respectivo time (via team_members)
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id::text = u.id::text
            WHERE u.supabase_user_id::text = auth.uid()::text
            AND tm.team_id::text = current_decisions.team_id::text
        )
        -- Jogador Sandbox / 1-para-1 fallback
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = current_decisions.team_id::text
        )
    );

DROP POLICY IF EXISTS "Gerenciamento de current_decisions" ON public.current_decisions;
CREATE POLICY "Gerenciamento de current_decisions" ON public.current_decisions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
        )
        -- Membro da equipe dona (via team_members)
        OR EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.users u ON tm.user_id::text = u.id::text
            WHERE u.supabase_user_id::text = auth.uid()::text
            AND tm.team_id::text = current_decisions.team_id::text
        )
        -- Sandbox 1-para-1 fallback
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.id::text = current_decisions.team_id::text
        )
    );

-- ==============================================================================
-- 4. ALINHAMENTO DE ACESSO PÚBLICO TEMPORÁRIO PARA FLUXO TRIAL/SANDBOX
-- ==============================================================================
DROP POLICY IF EXISTS "Leitura de trial_championships" ON public.trial_championships;
CREATE POLICY "Leitura de trial_championships" ON public.trial_championships
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Gerenciamento de trial_championships" ON public.trial_championships;
CREATE POLICY "Gerenciamento de trial_championships" ON public.trial_championships
    FOR ALL TO public
    USING (true);

DROP POLICY IF EXISTS "Trial Teams: Jogadores veem seu próprio time" ON public.trial_teams;
CREATE POLICY "Trial Teams: Jogadores veem seu próprio time" ON public.trial_teams
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Trial Teams: Jogadores atualizam seu próprio time" ON public.trial_teams;
CREATE POLICY "Trial Teams: Jogadores atualizam seu próprio time" ON public.trial_teams
    FOR ALL TO public
    USING (true);

DROP POLICY IF EXISTS "Trial Companies: Jogadores veem sua própria empresa" ON public.trial_companies;
CREATE POLICY "Trial Companies: Jogadores veem sua própria empresa" ON public.trial_companies
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Trial Companies: Jogadores atualizam sua própria empresa" ON public.trial_companies;
CREATE POLICY "Trial Companies: Jogadores atualizam sua própria empresa" ON public.trial_companies
    FOR ALL TO public
    USING (true);

COMMIT;
