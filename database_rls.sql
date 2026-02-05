
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v31.12.3.9.5 - TRIAL & CMS PROTOCOL
-- ==============================================================================

-- 1. EXPANSÃO DA TABELA CHAMPIONSHIPS
-- Suporte para flags de Trial, Observadores Nominados e Configurações de Região
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
END $$;

-- 2. CRIAÇÃO DA TABELA DE CONTEÚDO DINÂMICO (CMS)
-- Permite edição de landings, badges e ramos via painel Admin
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'pt',
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_by UUID REFERENCES public.users(id),
    UNIQUE(page_slug, locale)
);

-- RLS para Site Content
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public_Read_Content" ON public.site_content 
FOR SELECT TO public USING (true);

CREATE POLICY "Admin_Update_Content" ON public.site_content 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 3. REVISÃO DE POLÍTICA DE ACESSO A ARENAS (SELECT)
-- Agora permite acesso a: Tutores, Membros de Equipe e Observadores Nominados
DROP POLICY IF EXISTS "Arenas_Visibility" ON public.championships;

CREATE POLICY "Arenas_Visibility" ON public.championships 
FOR SELECT TO authenticated
USING (
    is_public = true OR
    tutor_id = auth.uid() OR
    observers ? auth.uid()::text OR
    id IN (
        SELECT championship_id FROM public.teams 
        WHERE id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
);

-- 4. LOGS DE AUDITORIA DE DECISÕES
-- Garante que o frontend possa extrair logs de auditoria salvos no jsonb de decisões
COMMENT ON COLUMN public.current_decisions.data IS 'Payload de decisões incluindo audit_logs array para rastreabilidade do tutor.';
