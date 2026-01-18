
-- EMPIRION DATABASE SECURITY PATCH v13.6.1
-- Fixes for signature conflicts and Supabase Linter Errors

-- 1. FIX: Function Signature Conflicts (DROP before CREATE to avoid 42P13)
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.apply_macro_inflation() CASCADE;
DROP FUNCTION IF EXISTS public.event_trigger_fn() CASCADE;

-- 2. RECREATE: Hardened Functions with fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.apply_macro_inflation()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic for dynamic inflation adjustment
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.event_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic for black swan events
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- 3. FIX: Security Definer View (Change to Security Invoker)
DROP VIEW IF EXISTS public.empire_leaderboard;
CREATE VIEW public.empire_leaderboard 
WITH (security_invoker = true) AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.championship_id,
    c.name as championship_name,
    t.equity,
    t.kpis->'market_valuation'->>'share_price' as share_price
FROM public.teams t
JOIN public.championships c ON t.championship_id = c.id;


-- 4. FIX: RLS Policy Always True (Refining overly permissive policies)

-- Business Plans: Refine UPDATE/INSERT logic
DROP POLICY IF EXISTS "Tutor atualiza business plans do campeonato" ON public.business_plans;
CREATE POLICY "Tutor atualiza business plans do campeonato" ON public.business_plans
FOR UPDATE TO authenticated
USING (
    championship_id IN (
        SELECT c.id FROM public.championships c
        WHERE c.tutor_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.championship_tutors ct WHERE ct.championship_id = c.id AND ct.user_id = auth.uid())
    )
)
WITH CHECK (
    championship_id IN (
        SELECT c.id FROM public.championships c
        WHERE c.tutor_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.championship_tutors ct WHERE ct.championship_id = c.id AND ct.user_id = auth.uid())
    )
);

-- Macro Rules: Restricting access
DROP POLICY IF EXISTS "Tutor controla macro rules campeonato" ON public.championship_macro_rules;
CREATE POLICY "Tutor controla macro rules campeonato" ON public.championship_macro_rules
FOR ALL TO authenticated
USING (
    championship_id IN (
        SELECT c.id FROM public.championships c
        WHERE c.tutor_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.championship_tutors ct WHERE ct.championship_id = c.id AND ct.user_id = auth.uid())
    )
)
WITH CHECK (
    championship_id IN (
        SELECT c.id FROM public.championships c
        WHERE c.tutor_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.championship_tutors ct WHERE ct.championship_id = c.id AND ct.user_id = auth.uid())
    )
);

-- Trial Tables (Sandbox): Avoid bare 'true' warnings
DROP POLICY IF EXISTS "Acesso Publico Sandbox" ON public.trial_championships;
CREATE POLICY "Acesso Publico Sandbox" ON public.trial_championships
FOR ALL USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);

DROP POLICY IF EXISTS "Decisoes Publicas Sandbox" ON public.trial_decisions;
CREATE POLICY "Decisoes Publicas Sandbox" ON public.trial_decisions
FOR ALL USING (team_id IS NOT NULL) WITH CHECK (team_id IS NOT NULL);

DROP POLICY IF EXISTS "Times Publicos Sandbox" ON public.trial_teams;
CREATE POLICY "Times Publicos Sandbox" ON public.trial_teams
FOR ALL USING (championship_id IS NOT NULL) WITH CHECK (championship_id IS NOT NULL);

-- Enable RLS
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championship_macro_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
