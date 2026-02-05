
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.2.3 - TRIAL SAVING PROTOCOL FIX
-- ==============================================================================

-- 1. GARANTIR QUE O USUÁRIO DE SISTEMA EXISTA (Evita erro de Foreign Key)
INSERT INTO public.users (id, supabase_user_id, name, email, role, nickname)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    '00000000-0000-0000-0000-000000000000', 
    'Oracle System', 
    'system@empirion.ia', 
    'admin', 
    'ORACLE_CORE'
)
ON CONFLICT (id) DO NOTHING;

-- 2. HABILITAR RLS EM TODAS AS TABELAS DE TRIAL
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_tutors ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS PERMISSIVAS PARA TABELAS TRIAL (Essencial para o Sandbox)
-- Qualquer pessoa (mesmo anon) pode criar e gerenciar dados de Trial
DROP POLICY IF EXISTS "Trial_Champs_Permissive" ON public.trial_championships;
CREATE POLICY "Trial_Champs_Permissive" ON public.trial_championships 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Trial_Teams_Permissive" ON public.trial_teams;
CREATE POLICY "Trial_Teams_Permissive" ON public.trial_teams 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Trial_Decisions_Permissive" ON public.trial_decisions;
CREATE POLICY "Trial_Decisions_Permissive" ON public.trial_decisions 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Trial_Tutors_Permissive" ON public.trial_tutors;
CREATE POLICY "Trial_Tutors_Permissive" ON public.trial_tutors 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

-- 4. ATUALIZAÇÃO DAS POLÍTICAS DA TABELA PRINCIPAL (CHAMPIONSHIPS)
-- Garante que se o app tentar salvar Trial na tabela principal, o Supabase permita
DROP POLICY IF EXISTS "Arenas_Creation" ON public.championships;
CREATE POLICY "Arenas_Creation" ON public.championships 
FOR INSERT TO public 
WITH CHECK (true);

DROP POLICY IF EXISTS "Teams_Creation" ON public.teams;
CREATE POLICY "Teams_Creation" ON public.teams 
FOR INSERT TO public 
WITH CHECK (true);

-- 5. AJUSTE DE VISIBILIDADE GLOBAL
-- Arenas Trial são sempre visíveis publicamente
DROP POLICY IF EXISTS "Arenas_Visibility" ON public.championships;
CREATE POLICY "Arenas_Visibility" ON public.championships 
FOR SELECT TO public
USING (
    is_public = true OR 
    is_trial = true OR 
    tutor_id = auth.uid() OR
    observers ? auth.uid()::text
);

-- Comentário de versão para o administrador
COMMENT ON TABLE public.trial_championships IS 'Tabela de arenas sandbox v13.2.3 - RLS totalmente aberto para prototipagem rápida.';
COMMENT ON TABLE public.championships IS 'Tabela principal v13.2.3 - Suporte a inserção pública para modo Trial.';
