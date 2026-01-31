
-- ==============================================================================
-- EMPIRION DATABASE SECURITY PATCH v31.0 - ORACLE MASTER CORE (ACCOUNTING EDITION)
-- Objetivo: Suporte a Histórico de Rounds, Gazeta e Auditoria Contábil Total.
-- Data: 01/02/2026
-- ==============================================================================

-- 1. EXPANSÃO DE RATINGS E CONSTRAINTS
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_credit_rating_check;
ALTER TABLE public.companies ADD CONSTRAINT companies_credit_rating_check 
CHECK (credit_rating = ANY (ARRAY['AAA'::text, 'AA'::text, 'A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, 'N/A'::text]));

-- 2. LIMPEZA DE POLÍTICAS PARA RE-SINCRONIZAÇÃO
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('championships', 'teams', 'current_decisions', 'business_plans', 'trial_decisions', 'companies', 'public_reports', 'community_ratings')) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. POLÍTICAS: CHAMPIONSHIPS (ARENAS)
CREATE POLICY "Championship_Select_Policy" ON public.championships FOR SELECT TO authenticated, anon
USING (
  is_public = true 
  OR tutor_id = auth.uid() 
  OR observers @> jsonb_build_array(auth.uid()::text)
  OR (auth.jwt() ->> 'email' IS NOT NULL AND observers @> jsonb_build_array(auth.jwt() ->> 'email'))
  OR EXISTS (SELECT 1 FROM public.championship_tutors ct WHERE ct.championship_id = id AND ct.user_id = auth.uid())
);

CREATE POLICY "Tutor_Manage_Championship" ON public.championships FOR ALL TO authenticated
USING (tutor_id = auth.uid()) WITH CHECK (tutor_id = auth.uid());

-- 4. POLÍTICAS: COMPANIES (HISTÓRICO DE PERFORMANCE - CRÍTICO PARA DRE/FC)
-- Jogadores veem apenas sua empresa, Tutores/Observadores veem tudo da arena.
CREATE POLICY "Company_History_Select" ON public.companies FOR SELECT TO authenticated, anon
USING (
  EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = companies.team_id AND tm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.championships c WHERE c.id = companies.championship_id AND (
      c.tutor_id = auth.uid() 
      OR c.observers @> jsonb_build_array(auth.uid()::text)
      OR c.is_public = true
  ))
);

-- 5. POLÍTICAS: PUBLIC_REPORTS (GAZETA E COMMUNITY FEED)
CREATE POLICY "Public_Reports_Read" ON public.public_reports FOR SELECT TO authenticated, anon
USING (true); -- Relatórios públicos são visíveis para auditoria externa

CREATE POLICY "Tutor_Manage_Reports" ON public.public_reports FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.championships c WHERE c.id = public_reports.championship_id AND c.tutor_id = auth.uid()));

-- 6. POLÍTICAS: COMMUNITY_RATINGS (VOTAÇÃO)
CREATE POLICY "Community_Vote_Read" ON public.community_ratings FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "User_Can_Vote" ON public.community_ratings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 7. POLÍTICAS: DECISIONS (PROTEÇÃO DE ESTRATÉGIA)
CREATE POLICY "Team_Manage_Own_Decision" ON public.current_decisions FOR ALL TO authenticated
USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

CREATE POLICY "Tutor_Read_All_Decisions" ON public.current_decisions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.championships c 
    WHERE c.id = current_decisions.championship_id 
    AND (c.tutor_id = auth.uid() OR c.observers @> jsonb_build_array(auth.uid()::text))
  )
);

-- 8. POLÍTICAS: TRIALS (SANDBOX MODE - ACESSO LIVRE)
CREATE POLICY "Trial_Arena_Access" ON public.trial_championships FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Trial_Teams_Access" ON public.trial_teams FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Trial_Decisions_Access" ON public.trial_decisions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 9. INDEXAÇÃO PARA PERFORMANCE DE BUSCA DE OBSERVADORES
CREATE INDEX IF NOT EXISTS idx_championships_observers_v31 ON public.championships USING gin (observers);
CREATE INDEX IF NOT EXISTS idx_companies_team_round ON public.companies (team_id, round);
CREATE INDEX IF NOT EXISTS idx_reports_champ_round ON public.public_reports (championship_id, round);
