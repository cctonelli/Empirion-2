
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.3.0 - BLOG, MODALITIES & CORE STABILIZATION
-- ==============================================================================

-- 1. USUÁRIO DE SISTEMA (UUID 0000...0000)
-- Dono simbólico de dados gerados em modo TRIAL/SANDBOX.
INSERT INTO public.users (id, supabase_user_id, name, email, role, nickname)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '00000000-0000-0000-0000-000000000000', 
  'Trial Orchestrator', 
  'trial@empirion.com', 
  'tutor',
  'Oracle_Trial'
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS PARA BLOG & FAQ
-- Essencial para BlogPage.tsx
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.blog_posts;
CREATE POLICY "Public Read Access" ON public.blog_posts FOR SELECT USING (true);

-- 3. POLÍTICAS PARA MODALIDADES (RAMOS)
-- Usado no carrossel e detalhes de setor
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Read_Modalities" ON public.modalities;
CREATE POLICY "Public_Read_Modalities" ON public.modalities FOR SELECT USING (true);

-- 4. POLÍTICAS PARA BUSINESS PLANS (TRIAL COMPATIBLE)
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_BP_Policy" ON public.business_plans;

CREATE POLICY "Unified_Trial_BP_Policy" ON public.business_plans
FOR ALL TO anon, authenticated
USING (
  is_template = true 
  OR 
  EXISTS (
    SELECT 1 FROM trial_championships 
    WHERE trial_championships.id = business_plans.championship_id
  )
  OR
  (user_id = auth.uid())
)
WITH CHECK (
  is_template = false AND (
    EXISTS (
      SELECT 1 FROM trial_championships 
      WHERE trial_championships.id = business_plans.championship_id
    )
    OR (user_id = auth.uid())
    OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  )
);

-- 5. POLÍTICAS PARA CAMPEONATOS (ARENAS)
-- Regras de visibilidade para Tutores e Estrategistas
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Championship_Select_v15" ON public.championships;
CREATE POLICY "Championship_Select_v15" ON public.championships 
FOR SELECT TO authenticated 
USING (
  (tutor_id = auth.uid()) 
  OR (is_public = true) 
  OR (observers ? (auth.uid())::text)
  OR (id IN (
    SELECT championship_id FROM teams 
    WHERE id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  ))
);

-- 6. POLÍTICAS TRIAL (CHAMPS, TEAMS, DECISIONS)
-- Acesso total para anon e auth em tabelas experimentais
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Champs_Policy" ON public.trial_championships;
CREATE POLICY "Unified_Trial_Champs_Policy" ON public.trial_championships FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Teams_Policy" ON public.trial_teams;
CREATE POLICY "Unified_Trial_Teams_Policy" ON public.trial_teams FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Decisions_Policy" ON public.trial_decisions;
CREATE POLICY "Unified_Trial_Decisions_Policy" ON public.trial_decisions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 7. AUDITORIA & HISTÓRICO (COMPANIES)
-- Permite que o motor de IA e Relatórios leiam os dados históricos
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_History_Policy" ON public.companies;
CREATE POLICY "Unified_History_Policy" ON public.companies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. SITE CONTENT (CMS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site_Content_Public_Read" ON public.site_content;
CREATE POLICY "Site_Content_Public_Read" ON public.site_content FOR SELECT TO anon, authenticated USING (true);

-- 9. COMUNIDADE & VOTOS
ALTER TABLE public.community_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Community_Read_All" ON public.community_ratings;
CREATE POLICY "Community_Read_All" ON public.community_ratings FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.blog_posts IS 'Tabela v13.3.0 - FAQ e Conteúdos técnicos com busca LIKE.';
COMMENT ON TABLE public.modalities IS 'Tabela v13.3.0 - Definições dinâmicas de ramos (Ind, Com, Agro, etc).';
