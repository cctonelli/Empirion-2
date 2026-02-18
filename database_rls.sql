
-- ==============================================================================
-- EMPIRION DATABASE SECURITY & COMPLIANCE PROTOCOL v24.2 PLATINUM (ULTRA FIX)
-- Foco: Resolução de dependências circulares e alteração de assinatura de função
-- ==============================================================================

-- 1. LIMPEZA DE DEPENDÊNCIAS (POLÍTICAS)
-- Devemos remover as políticas que utilizam a função antes de tentar dropá-la.
DROP POLICY IF EXISTS "Champs_Observer_Read" ON public.companies;
DROP POLICY IF EXISTS "Companies_History_Access" ON public.companies;
DROP POLICY IF EXISTS "Companies_Access_Master" ON public.companies;

-- 2. FIX: REMOÇÃO DA FUNÇÃO PARA ALTERAÇÃO DE PARÂMETROS
-- Agora que as dependências foram removidas, o drop deve funcionar sem CASCADE.
DROP FUNCTION IF EXISTS public.is_arena_observer(uuid);

-- 3. FUNÇÃO DE HELPER: VERIFICAÇÃO DE AUTORIDADE DE OBSERVAÇÃO
-- Otimizada para evitar recursão e garantir segurança definer
CREATE OR REPLACE FUNCTION public.is_arena_observer(target_arena_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM championships 
    WHERE id = target_arena_id 
    AND (
      auth.uid() = ANY(observers) 
      OR is_public = true 
      OR tutor_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. REFORÇO RLS: SITE_CONTENT (CMS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Global_Read_Content" ON public.site_content;
CREATE POLICY "Global_Read_Content" ON public.site_content 
FOR SELECT USING (true);

-- 5. RECREAÇÃO RLS: COMPANIES (BALANÇOS E KPIs)
-- Garante que observadores nominados possam ver o histórico de balanços
CREATE POLICY "Companies_Access_Master" ON public.companies 
FOR SELECT USING (
    is_arena_observer(championship_id) 
    OR team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_id = (SELECT id FROM users WHERE supabase_user_id = auth.uid())
    )
);

-- 6. REFORÇO RLS: DECISION_AUDIT_LOG
ALTER TABLE public.decision_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "AuditLog_Strict_Read" ON public.decision_audit_log;
CREATE POLICY "AuditLog_Strict_Read" ON public.decision_audit_log 
FOR SELECT USING (
    championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid()) 
    OR team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_id = (SELECT id FROM users WHERE supabase_user_id = auth.uid())
    )
);

-- 7. REFORÇO RLS: EMPIRE_POINTS
ALTER TABLE public.empire_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Points_Self_View" ON public.empire_points;
CREATE POLICY "Points_Self_View" ON public.empire_points 
FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM users WHERE supabase_user_id = auth.uid()) = 'admin');

-- 8. REFORÇO RLS: BUSINESS_PLANS (BMG)
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "BMG_Team_Access" ON public.business_plans;
DROP POLICY IF EXISTS "BMG_Strategic_Isolation" ON public.business_plans;
CREATE POLICY "BMG_Strategic_Isolation" ON public.business_plans 
FOR ALL USING (
    championship_id IN (SELECT id FROM championships WHERE tutor_id = auth.uid()) 
    OR team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_id = (SELECT id FROM users WHERE supabase_user_id = auth.uid())
    )
);

COMMIT;
