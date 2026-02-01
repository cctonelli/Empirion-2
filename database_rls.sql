
-- ==============================================================================
-- EMPIRION SCHEMA REFINE v31.8 - BRANCH & COMPLIANCE UPDATE
-- ==============================================================================

-- 1. EXPANSÃO DE RAMOS (Suporte para Finance e Construction)
ALTER TABLE public.championships 
DROP CONSTRAINT IF EXISTS championships_branch_check;

ALTER TABLE public.championships 
ADD CONSTRAINT championships_branch_check 
CHECK (branch = ANY (ARRAY['industrial'::text, 'commercial'::text, 'services'::text, 'agribusiness'::text, 'finance'::text, 'construction'::text]));

-- 2. EXPANSÃO DE STATUS DE BUSINESS PLAN (Suporte para 'approved')
ALTER TABLE public.business_plans 
DROP CONSTRAINT IF EXISTS business_plans_status_check;

ALTER TABLE public.business_plans 
ADD CONSTRAINT business_plans_status_check 
CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text]));

-- 3. ADIÇÃO DE COLUNA DE PERFORMANCE (regions_count)
ALTER TABLE public.championships 
ADD COLUMN IF NOT EXISTS regions_count INTEGER DEFAULT 1;

ALTER TABLE public.trial_championships 
ADD COLUMN IF NOT EXISTS regions_count INTEGER DEFAULT 1;

-- 4. REFORÇO DE ÍNDICES PARA BUSCA RÁPIDA DE DECISÕES
CREATE INDEX IF NOT EXISTS idx_decisions_team_round_champ 
ON public.current_decisions (team_id, round, championship_id);

CREATE INDEX IF NOT EXISTS idx_trial_decisions_team_round_champ 
ON public.trial_decisions (team_id, round, championship_id);

-- 5. POLÍTICAS DE AUDITORIA (TUTOR READ ALL DECISIONS)
-- Garante que o Tutor possa ver todas as decisões da sua Arena para auditoria
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Tutors_Read_All_Decisions" ON public.current_decisions;
    CREATE POLICY "Tutors_Read_All_Decisions" ON public.current_decisions
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.championships c WHERE c.id = current_decisions.championship_id AND c.tutor_id = auth.uid()));

    DROP POLICY IF EXISTS "Tutors_Read_All_Audit" ON public.decision_audit_log;
    CREATE POLICY "Tutors_Read_All_Audit" ON public.decision_audit_log
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.championships c WHERE c.id = decision_audit_log.championship_id AND c.tutor_id = auth.uid()));
END $$;
