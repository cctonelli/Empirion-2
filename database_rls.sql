
-- ==============================================================================
-- EMPIRION SCHEMA EVOLUTION v31.12.3.1 - TOTAL BLINDAGE PROTOCOL
-- ==============================================================================

-- 1. LIMPEZA E ATIVAÇÃO GLOBAL (15 TABELAS CRÍTICAS)
DO $$ 
DECLARE
    t text;
    p record;
BEGIN
    -- Lista COMPLETA de tabelas sob governança Empirion (incluindo pendentes do relatório Grok)
    FOR t IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN (
            'championships', 'teams', 'team_members', 'companies', 
            'current_decisions', 'decision_audit_log', 'public_reports', 
            'users', 'championship_macro_rules', 'business_plans', 
            'point_transactions', 'empire_points', 'championship_tutors',
            'championship_templates', 'modalities'
        )
    LOOP
        -- Remove todas as políticas existentes para garantir uma instalação limpa
        FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
        END LOOP;
        
        -- Ativa e força RLS (FORCE garante que até os donos sigam as regras)
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 2. CAMADA DE USUÁRIOS (USERS)
CREATE POLICY "Users_Read_Self" ON public.users FOR SELECT TO authenticated USING (supabase_user_id = auth.uid());
CREATE POLICY "Users_Update_Self" ON public.users FOR UPDATE TO authenticated USING (supabase_user_id = auth.uid());
CREATE POLICY "Admin_Full_Users" ON public.users FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users u WHERE u.supabase_user_id = auth.uid() AND u.role = 'admin'));

-- 3. CAMADA DE CAMPEONATOS (CHAMPIONSHIPS)
CREATE POLICY "Champs_Select_Access" ON public.championships FOR SELECT TO authenticated, anon 
USING (is_public = true OR tutor_id = auth.uid() OR observers @> jsonb_build_array(auth.uid()::text) OR EXISTS (SELECT 1 FROM public.team_members tm JOIN public.teams t ON tm.team_id = t.id WHERE t.championship_id = public.championships.id AND tm.user_id = auth.uid()));
CREATE POLICY "Tutor_Manage_Champs" ON public.championships FOR ALL TO authenticated USING (tutor_id = auth.uid());

-- 4. CAMADA DE EMPRESAS E HISTÓRICO (COMPANIES)
CREATE POLICY "Team_Read_Own_Company" ON public.companies FOR SELECT TO authenticated USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));
CREATE POLICY "Tutor_Read_Arena_Companies" ON public.companies FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.championships c WHERE c.id = companies.championship_id AND c.tutor_id = auth.uid()));
CREATE POLICY "Observer_Read_Arena_Companies" ON public.companies FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.championships c WHERE c.id = companies.championship_id AND c.observers @> jsonb_build_array(auth.uid()::text)));

-- 5. CAMADA DE DECISÕES TÁTICAS (CURRENT_DECISIONS)
CREATE POLICY "Team_Manage_Own_Decisions" ON public.current_decisions FOR ALL TO authenticated 
USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));
CREATE POLICY "Tutor_Read_Arena_Decisions" ON public.current_decisions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.championships c WHERE c.id = current_decisions.championship_id AND c.tutor_id = auth.uid()));

-- 6. CAMADA DE RELATÓRIOS PÚBLICOS (GAZETA)
CREATE POLICY "Public_Reports_Visibility" ON public.public_reports FOR SELECT TO authenticated, anon 
USING (EXISTS (SELECT 1 FROM public.championships c WHERE c.id = public_reports.championship_id AND (c.is_public OR c.transparency_level = 'full' OR (c.transparency_level IN ('high','medium')))));

-- 7. AUDITORIA (DECISION_AUDIT_LOG)
CREATE POLICY "Audit_Read_Authorized" ON public.decision_audit_log FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.championships c WHERE c.id = decision_audit_log.championship_id AND (c.tutor_id = auth.uid() OR c.observers @> jsonb_build_array(auth.uid()::text))));

-- 8. PONTOS E GAMIFICAÇÃO (EMPIRE_POINTS)
CREATE POLICY "Points_Read_Own" ON public.empire_points FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Transactions_Read_Own" ON public.point_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 9. GESTÃO DE ARENAS E TEMPLATES (CHAMPIONSHIP_TEMPLATES)
CREATE POLICY "Public_Read_Templates" ON public.championship_templates FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admin_Manage_Templates" ON public.championship_templates FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users u WHERE u.supabase_user_id = auth.uid() AND u.role = 'admin'));

-- 10. MODALIDADES (MODALITIES)
CREATE POLICY "Public_Read_Modalities" ON public.modalities FOR SELECT TO authenticated, anon USING (is_public = true);
CREATE POLICY "Admin_Manage_Modalities" ON public.modalities FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users u WHERE u.supabase_user_id = auth.uid() AND u.role = 'admin'));
