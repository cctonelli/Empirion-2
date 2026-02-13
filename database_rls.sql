
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.4.0 - CURRENCY EXPANSION & BLOG SEED
-- ==============================================================================

-- 1. GARANTIA DE FLEXIBILIDADE MONETÁRIA
-- Remove possíveis restrições antigas e garante que a coluna suporte novos tokens (CNY, BTC)
ALTER TABLE IF EXISTS public.championships ALTER COLUMN currency TYPE TEXT;
ALTER TABLE IF EXISTS public.trial_championships ALTER COLUMN currency TYPE TEXT;

-- 2. USUÁRIO DE SISTEMA (UUID 0000...0000)
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

-- 3. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.blog_posts;
CREATE POLICY "Public Read Access" ON public.blog_posts FOR SELECT USING (true);

ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Read_Modalities" ON public.modalities;
CREATE POLICY "Public_Read_Modalities" ON public.modalities FOR SELECT USING (true);

ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_BP_Policy" ON public.business_plans;
CREATE POLICY "Unified_Trial_BP_Policy" ON public.business_plans FOR ALL TO anon, authenticated USING (is_template = true OR EXISTS (SELECT 1 FROM trial_championships WHERE trial_championships.id = business_plans.championship_id) OR (user_id = auth.uid())) WITH CHECK (true);

ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Championship_Select_v15" ON public.championships;
CREATE POLICY "Championship_Select_v15" ON public.championships FOR SELECT TO authenticated USING ((tutor_id = auth.uid()) OR (is_public = true) OR (observers ? (auth.uid())::text) OR (id IN (SELECT championship_id FROM teams WHERE id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))));

ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Champs_Policy" ON public.trial_championships;
CREATE POLICY "Unified_Trial_Champs_Policy" ON public.trial_championships FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Teams_Policy" ON public.trial_teams;
CREATE POLICY "Unified_Trial_Teams_Policy" ON public.trial_teams FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Decisions_Policy" ON public.trial_decisions;
CREATE POLICY "Unified_Trial_Decisions_Policy" ON public.trial_decisions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_History_Policy" ON public.companies;
CREATE POLICY "Unified_History_Policy" ON public.companies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.championships IS 'Tabela v13.4.0 - Suporte a moedas dinâmicas CNY/BTC.';
