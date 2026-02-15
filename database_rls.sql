
-- ==============================================================================
-- EMPIRION DATABASE CONSOLIDATED SCHEMA v19.0 GOLD - ORACLE CORE FIX
-- Protocolo: ORACLE-TRIAL-LISTING-FIX-V1
-- ==============================================================================

-- 1. EXTENSÕES E PREPARAÇÃO
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. AJUSTES DE SCHEMA (COLUNAS FALTANTES QUE CAUSAM FALHA NO INSERT)
-- O App tenta inserir 'is_trial' e 'round_rules' diretamente nos payloads.
DO $$ 
BEGIN
    -- trial_championships
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trial_championships' AND column_name='is_trial') THEN
        ALTER TABLE public.trial_championships ADD COLUMN is_trial boolean DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trial_championships' AND column_name='round_rules') THEN
        ALTER TABLE public.trial_championships ADD COLUMN round_rules jsonb DEFAULT '{}'::jsonb;
    END IF;
    
    -- championships (oficial)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='round_rules') THEN
        ALTER TABLE public.championships ADD COLUMN round_rules jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. GARANTIR USUÁRIO DE SISTEMA (SYSTEM_TUTOR_ID)
-- Necessário para que a FK 'tutor_id' não quebre em modo Trial deslogado.
INSERT INTO public.users (id, supabase_user_id, name, email, role, nickname)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    '00000000-0000-0000-0000-000000000000', 
    'Empirion System', 
    'system@empirion.ia', 
    'admin', 
    'Oracle_Core'
)
ON CONFLICT (id) DO NOTHING;

-- 4. HABILITAÇÃO E LIMPEZA DE RLS
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_companies ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('trial_championships', 'trial_teams', 'trial_decisions', 'trial_companies')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 5. NOVAS POLÍTICAS TOTAIS PARA MODO TRIAL (SANDBOX)
-- Visibilidade pública para Arenas Trial
CREATE POLICY "Trial_Champs_Public_Select" ON public.trial_championships 
    FOR SELECT USING (true);

-- Permissão total de inserção (Anonymous e Logged)
CREATE POLICY "Trial_Champs_Universal_Insert" ON public.trial_championships 
    FOR INSERT WITH CHECK (true);

-- Permissão de update para o Tutor (mesmo se for o System ID)
CREATE POLICY "Trial_Champs_Tutor_Update" ON public.trial_championships 
    FOR UPDATE USING (true);

-- Equipes Trial: Visibilidade total
CREATE POLICY "Trial_Teams_Public_Select" ON public.trial_teams 
    FOR SELECT USING (true);

CREATE POLICY "Trial_Teams_Universal_Insert" ON public.trial_teams 
    FOR INSERT WITH CHECK (true);

-- Decisões Trial: Visibilidade e Inserção para operação fluída
CREATE POLICY "Trial_Decisions_Flow" ON public.trial_decisions 
    FOR ALL USING (true) WITH CHECK (true);

-- Histórico Trial: Visibilidade total
CREATE POLICY "Trial_Companies_Public_Select" ON public.trial_companies 
    FOR SELECT USING (true);

-- 6. REFORÇO RLS CHAMPIONSHIPS (OFICIAL)
DROP POLICY IF EXISTS "Championships_Visibility" ON public.championships;
CREATE POLICY "Championships_Visibility_V19" ON public.championships 
    FOR SELECT USING (
        is_public = true OR 
        auth.uid() = tutor_id OR 
        is_trial = true -- Garante que trials na tabela principal também apareçam
    );

COMMIT;
