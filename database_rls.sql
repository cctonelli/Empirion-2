
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v31.12.3.9 - BUSINESS PLAN EXPANSION
-- ==============================================================================

-- 1. EXPANSÃO DA TABELA BUSINESS_PLANS
DO $$ 
BEGIN
    -- Adição de campos para o Modo Independente e Colaboração
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_plans' AND column_name='user_id') THEN
        ALTER TABLE public.business_plans ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Garantir que championship_id e team_id sejam opcionais para modo independente
    ALTER TABLE public.business_plans ALTER COLUMN championship_id DROP NOT NULL;
    ALTER TABLE public.business_plans ALTER COLUMN team_id DROP NOT NULL;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_plans' AND column_name='is_template') THEN
        ALTER TABLE public.business_plans ADD COLUMN is_template BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_plans' AND column_name='visibility') THEN
        ALTER TABLE public.business_plans ADD COLUMN visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_plans' AND column_name='shared_with') THEN
        ALTER TABLE public.business_plans ADD COLUMN shared_with JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_plans' AND column_name='exported_formats') THEN
        ALTER TABLE public.business_plans ADD COLUMN exported_formats JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='business_plans' AND column_name='constraints') THEN
        ALTER TABLE public.business_plans ADD COLUMN constraints JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. REVISÃO DE POLÍTICAS RLS PARA BUSINESS PLAN
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "BP_Owner_Access" ON public.business_plans;
DROP POLICY IF EXISTS "BP_Team_Access" ON public.business_plans;
DROP POLICY IF EXISTS "BP_Tutor_Access" ON public.business_plans;

-- Política de Dono (Acesso Total)
CREATE POLICY "BP_Owner_Access" ON public.business_plans FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política de Membros de Equipe (Se for modo Simulação)
CREATE POLICY "BP_Team_Access" ON public.business_plans FOR SELECT TO authenticated
USING (
    team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
);

-- Política de Tutor (Se for modo Simulação)
CREATE POLICY "BP_Tutor_Access" ON public.business_plans FOR SELECT TO authenticated
USING (
    championship_id IN (
        SELECT id FROM public.championships WHERE tutor_id = auth.uid()
    )
);

-- Política de Compartilhamento Manual
CREATE POLICY "BP_Shared_Access" ON public.business_plans FOR SELECT TO authenticated
USING (shared_with ? auth.uid()::text);
