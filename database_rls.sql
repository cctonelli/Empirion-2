
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.2.1 - TRIAL & GEOPOLITICAL PROTOCOL
-- ==============================================================================

-- 1. EXPANSÃO DA TABELA CHAMPIONSHIPS
-- Adiciona suporte para is_trial, observadores e configurações regionais detalhadas
DO $$ 
BEGIN
    -- Flag para identificar arenas gratuitas/sandbox
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='is_trial') THEN
        ALTER TABLE public.championships ADD COLUMN is_trial BOOLEAN DEFAULT false;
    END IF;

    -- Array de UUIDs para observadores com acesso Read-Only
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='observers') THEN
        ALTER TABLE public.championships ADD COLUMN observers JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Configurações de Geopolítica (Nome, Moeda, Peso de Demanda)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='region_configs') THEN
        ALTER TABLE public.championships ADD COLUMN region_configs JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Preço da Ação inicial e Dividendos padrão
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='initial_share_price') THEN
        ALTER TABLE public.championships ADD COLUMN initial_share_price NUMERIC DEFAULT 100.00;
    END IF;
END $$;

-- 2. ATUALIZAÇÃO DA TABELA DE USUÁRIOS (PERFIS)
-- Garante que nickname e phone existam para o cockpit e auth
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='nickname') THEN
        ALTER TABLE public.users ADD COLUMN nickname TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;
END $$;

-- 3. TABELA DE CONTEÚDO DINÂMICO (CMS)
-- Permite que o Command Center edite landings e textos sem novo deploy
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'pt',
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_by UUID REFERENCES public.users(id),
    UNIQUE(page_slug, locale)
);

-- Habilitar RLS no CMS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um lê o conteúdo do site
DROP POLICY IF EXISTS "Public_Read_Content" ON public.site_content;
CREATE POLICY "Public_Read_Content" ON public.site_content 
FOR SELECT TO public USING (true);

-- Política: Apenas admins editam o CMS
DROP POLICY IF EXISTS "Admin_Update_Content" ON public.site_content;
CREATE POLICY "Admin_Update_Content" ON public.site_content 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 4. REVISÃO DE POLÍTICA DE VISIBILIDADE DE ARENAS
-- Agora permite acesso a: Tutores, Membros de Equipe e Observadores Nominados no JSONB
DROP POLICY IF EXISTS "Arenas_Visibility" ON public.championships;

CREATE POLICY "Arenas_Visibility" ON public.championships 
FOR SELECT TO authenticated
USING (
    is_public = true OR
    tutor_id = auth.uid() OR
    observers ? auth.uid()::text OR
    id IN (
        SELECT championship_id FROM public.teams 
        WHERE id IN (
            SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        )
    )
);

-- 5. SEGURANÇA DE EDIÇÃO DE CHAMPIONSHIPS
-- Apenas o Tutor original ou Admin pode alterar as regras/geopolítica
DROP POLICY IF EXISTS "Arena_Master_Control" ON public.championships;

CREATE POLICY "Arena_Master_Control" ON public.championships 
FOR UPDATE TO authenticated
USING (tutor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (tutor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Comentário de integridade para o motor Oracle
COMMENT ON TABLE public.championships IS 'Tabela core v13.2.1 com suporte a Geopolítica Regional e Protocolo de Imutabilidade Trial.';
