
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.3.0 - BP TRIAL & CORE STABILIZATION
-- ==============================================================================

-- 1. GARANTIA DE USUÁRIO DE SISTEMA (UUID 0000...0000)
-- Este usuário é o "dono" simbólico de todos os dados gerados em modo TRIAL.
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

-- 2. POLÍTICAS PARA BUSINESS PLANS (TRIAL COMPATIBLE)
-- O modo TRIAL precisa salvar planos de negócios sem exigir Auth plena da Supabase.
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "BP_Owner_Access" ON public.business_plans;
DROP POLICY IF EXISTS "BP_Team_Access" ON public.business_plans;
DROP POLICY IF EXISTS "Unified_Trial_BP_Policy" ON public.business_plans;

-- Política Unificada para Business Plans em modo Trial/Public
CREATE POLICY "Unified_Trial_BP_Policy" ON public.business_plans
FOR ALL TO anon, authenticated
USING (
  -- Permite se for um plano de template publico
  is_template = true 
  OR 
  -- Permite se estiver vinculado a um campeonato TRIAL
  EXISTS (
    SELECT 1 FROM trial_championships 
    WHERE trial_championships.id = business_plans.championship_id
  )
  OR
  -- Permite se o usuário for o dono (auth padrão)
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

-- 3. REINICIALIZAÇÃO DE POLÍTICAS TRIAL (CHAMPS, TEAMS, DECISIONS)
-- Garante que 'anon' e 'authenticated' tenham acesso irrestrito às tabelas experimentais.

-- TRIAL_CHAMPIONSHIPS
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Champs_Policy" ON public.trial_championships;
CREATE POLICY "Unified_Trial_Champs_Policy" ON public.trial_championships 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- TRIAL_TEAMS
ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Teams_Policy" ON public.trial_teams;
CREATE POLICY "Unified_Trial_Teams_Policy" ON public.trial_teams 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- TRIAL_DECISIONS
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Decisions_Policy" ON public.trial_decisions;
CREATE POLICY "Unified_Trial_Decisions_Policy" ON public.trial_decisions 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 4. REFORÇO NA TABELA DE COMPANIES (HISTÓRICO / AUDITORIA)
-- Essencial para que a IA Gemini consiga ler o histórico de KPIs para auditar o Business Plan.
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_History_Policy" ON public.companies;
CREATE POLICY "Unified_History_Policy" ON public.companies 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 5. SITE CONTENT (CMS)
-- Permite que qualquer um leia o conteúdo, mas apenas o Admin (ou sistema) edite.
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site_Content_Public_Read" ON public.site_content;
CREATE POLICY "Site_Content_Public_Read" ON public.site_content 
FOR SELECT TO anon, authenticated 
USING (true);

COMMENT ON TABLE public.business_plans IS 'Tabela v13.3.0 - RLS Híbrido para suporte a Business Plan em modo Trial.';
