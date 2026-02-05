
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.2.2 - FIX: TRIAL LAUNCH PROTOCOL
-- ==============================================================================

-- 1. GARANTIR COLUNAS DE TRIAL E GEOPOLÍTICA
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='is_trial') THEN
        ALTER TABLE public.championships ADD COLUMN is_trial BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='observers') THEN
        ALTER TABLE public.championships ADD COLUMN observers JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='region_configs') THEN
        ALTER TABLE public.championships ADD COLUMN region_configs JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='initial_share_price') THEN
        ALTER TABLE public.championships ADD COLUMN initial_share_price NUMERIC DEFAULT 100.00;
    END IF;
END $$;

-- 2. POLÍTICAS PARA A TABELA CHAMPIONSHIPS
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;

-- SELECT: Visibilidade pública para Trials e Arenas Públicas, restrita para Privadas
DROP POLICY IF EXISTS "Arenas_Visibility" ON public.championships;
CREATE POLICY "Arenas_Visibility" ON public.championships 
FOR SELECT TO public
USING (
    is_public = true OR 
    is_trial = true OR 
    tutor_id = auth.uid() OR
    observers ? auth.uid()::text
);

-- INSERT: Permitir que usuários autenticados (ou o sistema em trial) criem arenas
DROP POLICY IF EXISTS "Arenas_Creation" ON public.championships;
CREATE POLICY "Arenas_Creation" ON public.championships 
FOR INSERT TO public 
WITH CHECK (true); -- Permitimos a criação para possibilitar o modo Trial Sandbox

-- UPDATE: Apenas o Tutor ou Admin altera as regras
DROP POLICY IF EXISTS "Arena_Master_Control" ON public.championships;
CREATE POLICY "Arena_Master_Control" ON public.championships 
FOR UPDATE TO public
USING (tutor_id = auth.uid() OR tutor_id = '00000000-0000-0000-0000-000000000000'::uuid OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 3. POLÍTICAS PARA A TABELA TEAMS (EQUIPES)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- SELECT: Qualquer um vê as equipes de uma arena que tem acesso
DROP POLICY IF EXISTS "Teams_Visibility" ON public.teams;
CREATE POLICY "Teams_Visibility" ON public.teams 
FOR SELECT TO public 
USING (true);

-- INSERT: Necessário para o wizard criar as equipes logo após a arena
DROP POLICY IF EXISTS "Teams_Creation" ON public.teams;
CREATE POLICY "Teams_Creation" ON public.teams 
FOR INSERT TO public 
WITH CHECK (true);

-- 4. POLÍTICAS PARA DECISÕES (TRIAL E LIVE)
ALTER TABLE public.current_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Decisions_Control" ON public.current_decisions;
CREATE POLICY "Decisions_Control" ON public.current_decisions 
FOR ALL TO public 
USING (true) 
WITH CHECK (true);

-- 5. SITE CONTENT (CMS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public_Read_Content" ON public.site_content;
CREATE POLICY "Public_Read_Content" ON public.site_content 
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin_Update_Content" ON public.site_content;
CREATE POLICY "Admin_Update_Content" ON public.site_content 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

COMMENT ON TABLE public.championships IS 'Core v13.2.2 - Suporte total a Lançamento de Trial e Geopolítica.';
