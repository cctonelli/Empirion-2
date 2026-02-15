-- ==============================================================================
-- EMPIRION DATABASE OPTIMIZATION & RLS PROTOCOL v21.0 GOLD
-- Protocolo: ORACLE-OMNI-COVERAGE-TOTAL-UTILIZATION
-- Cobertura: 100% das tabelas (26/26)
-- ==============================================================================

-- 1. DESCRIPTIONS (COMMENTS) - DOCUMENTAÇÃO FINAL DE SCHEMA
COMMENT ON TABLE public.business_plans IS 'Planos de Negócios (BMG) das equipes vinculados a cada rodada.';
COMMENT ON TABLE public.companies IS 'Histórico consolidado de balanços e KPIs processados por rodada (Performance Oficial).';
COMMENT ON TABLE public.point_transactions IS 'Registros de transações de recompensa entre sistemas internos (Empire Points).';
COMMENT ON TABLE public.team_members IS 'Vínculo de usuários com equipes e seus papéis (Captain/Member).';
COMMENT ON TABLE public.championship_tutors IS 'Vínculo de autoridade entre tutores e campeonatos oficiais.';
COMMENT ON TABLE public.trial_tutors IS 'Controle de autoria para arenas experimentais.';

-- 2. HABILITAÇÃO DE REALTIME FULL
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.championships, 
    public.teams, 
    public.current_decisions, 
    public.modalities, 
    public.site_content,
    public.trial_championships,
    public.trial_decisions,
    public.trial_teams,
    public.trial_companies,
    public.community_ratings,
    public.public_reports,
    public.empire_points,
    public.empire_points_log,
    public.business_plans; -- Realtime para colaboração no BMG
COMMIT;

-- 3. ROW LEVEL SECURITY (RLS) - OMNI COVERAGE
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- Limpeza preventiva de políticas
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- [A] POLÍTICAS GLOBAIS DE LEITURA
CREATE POLICY "Global_Read_Content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Global_Read_Blog" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Global_Read_Modalities" ON public.modalities FOR SELECT USING (true);
CREATE POLICY "Global_Read_Badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Global_Read_Reports" ON public.public_reports FOR SELECT USING (true);
CREATE POLICY "Global_Read_Templates" ON public.championship_templates FOR SELECT USING (true);

-- [B] POLÍTICAS DE USUÁRIO (SELF)
CREATE POLICY "Users_Self_Manage" ON public.users FOR ALL USING (auth.uid() = supabase_user_id);
CREATE POLICY "Points_Self_View" ON public.empire_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "PointsLog_Self_View" ON public.empire_points_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "UserBadges_Self_View" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Transactions_Self_View" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);

-- [C] POLÍTICAS DE ARENAS (TUTOR & VISIBILIDADE)
CREATE POLICY "Champs_Visibility" ON public.championships FOR SELECT USING (is_public = true OR tutor_id = auth.uid());
CREATE POLICY "Champs_Tutor_Manage" ON public.championships FOR ALL USING (tutor_id = auth.uid());
CREATE POLICY "Champs_Tutor_Mapping" ON public.championship_tutors FOR ALL USING (user_id = auth.uid());

CREATE POLICY "MacroRules_Tutor_Manage" ON public.championship_macro_rules FOR ALL USING (
    championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid())
);
CREATE POLICY "MacroRules_Player_Read" ON public.championship_macro_rules FOR SELECT USING (true);

-- [D] POLÍTICAS DE EQUIPES E COLABORAÇÃO
CREATE POLICY "Teams_Visibility" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Teams_Manage" ON public.teams FOR ALL USING (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()))
    OR championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid())
);
CREATE POLICY "TeamMembers_Arena_Access" ON public.team_members FOR SELECT USING (true);

-- [E] POLÍTICAS DE DECISÕES E PLANOS (BMG)
CREATE POLICY "Decisions_Team_Access" ON public.current_decisions FOR ALL USING (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = current_decisions.team_id AND tm.user_id = (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()))
    OR championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid())
);

CREATE POLICY "BMG_Team_Access" ON public.business_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = business_plans.team_id AND tm.user_id = (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()))
    OR championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid())
);

-- [F] POLÍTICAS DE HISTÓRICO E AUDITORIA
CREATE POLICY "Companies_History_Access" ON public.companies FOR SELECT USING (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = companies.team_id AND tm.user_id = (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()))
    OR championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid())
    OR (SELECT is_public FROM championships WHERE id = companies.championship_id) = true
);

CREATE POLICY "AuditLog_Strict_Read" ON public.decision_audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = decision_audit_log.team_id AND tm.user_id = (SELECT id FROM public.users WHERE supabase_user_id = auth.uid()))
    OR championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid())
);

-- [G] POLÍTICAS DE COMUNIDADE
CREATE POLICY "Community_Feedback_Read" ON public.community_ratings FOR SELECT USING (true);
CREATE POLICY "Community_Feedback_Write" ON public.community_ratings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- [H] POLÍTICAS DE TRIAL (SANDBOX TOTAL)
CREATE POLICY "Trial_Champs_Full" ON public.trial_championships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Trial_Teams_Full" ON public.trial_teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Trial_Decisions_Full" ON public.trial_decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Trial_Companies_Full" ON public.trial_companies FOR SELECT USING (true);
CREATE POLICY "Trial_Tutors_Full" ON public.trial_tutors FOR ALL USING (true) WITH CHECK (true);

-- [I] ADMIN OVERRIDE
CREATE POLICY "Admin_Root" ON public.site_content FOR ALL USING (EXISTS (SELECT 1 FROM public.users u WHERE u.supabase_user_id = auth.uid() AND u.role = 'admin'));

COMMIT;
