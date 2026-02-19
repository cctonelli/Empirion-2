
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS PROTOCOL v24.3 PLATINUM
-- Consolidação: Simulation Kernel v18 + BMG Architect + Community Hub
-- ==============================================================================

-- 1. TABELAS DE NÚCLEO (ARENAS E EQUIPES)
-- Garantindo que colunas de governança e KPI existam
ALTER TABLE IF EXISTS public.championships 
ADD COLUMN IF NOT EXISTS transparency_level TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS gazeta_mode TEXT DEFAULT 'anonymous',
ADD COLUMN IF NOT EXISTS observers TEXT[] DEFAULT '{}';

ALTER TABLE IF EXISTS public.teams 
ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS strategic_profile TEXT DEFAULT 'EQUILIBRADO';

-- 2. TABELA DE AUDITORIA DE DECISÕES (REFERENCIADA NO DecisionForm)
CREATE TABLE IF NOT EXISTS public.decision_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID REFERENCES championships(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    field_path TEXT,
    old_value JSONB,
    new_value JSONB,
    comment TEXT,
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- 3. HISTÓRICO DE SIMULAÇÃO (COMPANIES - UTILIZADO PELA GAZETA)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID REFERENCES championships(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    equity NUMERIC(20,2) DEFAULT 0,
    kpis JSONB DEFAULT '{}'::jsonb,
    state JSONB DEFAULT '{}'::jsonb, -- Armazena a decisão que gerou este resultado
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PLANOS DE NEGÓCIO (BMG EDITION)
CREATE TABLE IF NOT EXISTS public.business_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID REFERENCES championships(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    round INTEGER NOT NULL,
    version INTEGER DEFAULT 1,
    data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'draft', -- draft, submitted, approved
    visibility TEXT DEFAULT 'private',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CMS E CONTEÚDO DINÂMICO
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'pt',
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(page_slug, locale)
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SISTEMA DE AVALIAÇÕES DA COMUNIDADE
CREATE TABLE IF NOT EXISTS public.community_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID REFERENCES championships(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    company_alias TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. REFORÇO DE SEGURANÇA (RLS)

-- Habilitar RLS em novas tabelas
ALTER TABLE public.decision_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_ratings ENABLE ROW LEVEL SECURITY;

-- Função auxiliar de observador
CREATE OR REPLACE FUNCTION public.is_arena_observer(target_arena_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM championships 
        WHERE id = target_arena_id 
        AND (
            auth.uid()::text = ANY(observers)
            OR is_public = true 
            OR tutor_id = auth.uid()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de Auditoria
DROP POLICY IF EXISTS "Tutors_View_Audit" ON public.decision_audit_log;
CREATE POLICY "Tutors_View_Audit" ON public.decision_audit_log 
FOR SELECT USING (championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid()));

-- Políticas de Planos de Negócio
DROP POLICY IF EXISTS "Teams_Manage_BP" ON public.business_plans;
CREATE POLICY "Teams_Manage_BP" ON public.business_plans 
FOR ALL USING (team_id IN (SELECT id FROM teams WHERE id IN (SELECT team_id FROM team_members WHERE user_id = (SELECT id FROM users WHERE supabase_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Tutors_View_BP" ON public.business_plans;
CREATE POLICY "Tutors_View_BP" ON public.business_plans 
FOR SELECT USING (championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid()));

-- Políticas de CMS (Público lê, Admin escreve)
DROP POLICY IF EXISTS "Public_Read_CMS" ON public.site_content;
CREATE POLICY "Public_Read_CMS" ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public_Read_Blog" ON public.blog_posts;
CREATE POLICY "Public_Read_Blog" ON public.blog_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin_Full_CMS" ON public.site_content;
CREATE POLICY "Admin_Full_CMS" ON public.site_content FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE supabase_user_id = auth.uid() AND role = 'admin'));

-- Políticas de Community Ratings
DROP POLICY IF EXISTS "Public_Read_Ratings" ON public.community_ratings;
CREATE POLICY "Public_Read_Ratings" ON public.community_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth_Insert_Rating" ON public.community_ratings;
CREATE POLICY "Auth_Insert_Rating" ON public.community_ratings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. SINCRONIZAÇÃO DE TABELAS TRIAL (REPLICANDO ESTRUTURA)
CREATE TABLE IF NOT EXISTS public.trial_companies (LIKE public.companies INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.trial_decisions (
    team_id UUID,
    championship_id UUID,
    round INTEGER,
    data JSONB,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (team_id, round)
);

COMMIT;
