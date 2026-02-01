
-- ==============================================================================
-- EMPIRION SCHEMA EVOLUTION v31.12.3.5 - TOTAL BLINDAGE CONSOLIDATION
-- ==============================================================================

-- 1. LIMPEZA E ATIVAÇÃO GLOBAL (15 TABELAS CRÍTICAS)
DO $$ 
DECLARE
    t text;
    p record;
BEGIN
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

-- 2. POLÍTICA DE RELATÓRIOS PÚBLICOS (REFORÇADA COM GAZETA_MODE)
CREATE POLICY "Public_Reports_Visibility" ON public.public_reports FOR SELECT TO authenticated, anon
USING (
    EXISTS (
        SELECT 1 FROM public.championships c
        WHERE c.id = public_reports.championship_id
        AND (
            c.is_public
            OR c.transparency_level = 'full'
            OR (c.transparency_level IN ('high','medium') AND c.gazeta_mode = 'identified')
        )
    )
);

-- 3. GESTÃO DE REGRAS MACRO (TUTOR E PARTICIPANTES)
CREATE POLICY "Macro_Rules_Tutor_Manage" ON public.championship_macro_rules FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM championships c WHERE c.id = championship_macro_rules.championship_id AND c.tutor_id = auth.uid()));

CREATE POLICY "Macro_Rules_Participant_Read" ON public.championship_macro_rules FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM team_members tm
        JOIN teams t ON tm.team_id = t.id
        WHERE t.championship_id = championship_macro_rules.championship_id
          AND tm.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM championships c WHERE c.id = championship_macro_rules.championship_id AND c.tutor_id = auth.uid())
);

-- 4. PLANOS DE NEGÓCIOS (BUSINESS PLANS)
CREATE POLICY "BusinessPlan_Team_Manage" ON public.business_plans FOR ALL TO authenticated
USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
WITH CHECK (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "BusinessPlan_Tutor_Read" ON public.business_plans FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM championships c WHERE c.id = business_plans.championship_id AND c.tutor_id = auth.uid()));

-- 5. POLÍTICAS DE USUÁRIOS E PERFIS
CREATE POLICY "Users_Read_Self" ON public.users FOR SELECT TO authenticated USING (supabase_user_id = auth.uid());
CREATE POLICY "Users_Update_Self" ON public.users FOR UPDATE TO authenticated USING (supabase_user_id = auth.uid());
CREATE POLICY "Admin_Full_Users" ON public.users FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users u WHERE u.supabase_user_id = auth.uid() AND u.role = 'admin'));

-- 6. POLÍTICAS DE TEMPLATES E MODALIDADES (SISTEMA)
CREATE POLICY "Public_Read_Templates" ON public.championship_templates FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public_Read_Modalities" ON public.modalities FOR SELECT TO authenticated, anon USING (is_public = true);

-- 7. AUDITORIA (DECISION_AUDIT_LOG)
CREATE POLICY "Audit_Read_Authorized" ON public.decision_audit_log FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.championships c WHERE c.id = decision_audit_log.championship_id AND (c.tutor_id = auth.uid() OR c.observers @> jsonb_build_array(auth.uid()::text))));
