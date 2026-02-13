
-- ==============================================================================
-- EMPIRION DATABASE CORE RECOVERY v17.7 - RESOLUÇÃO ERRO 42703
-- ==============================================================================

-- 1. GARANTIR EXTENSÕES E SCHEMAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. INJEÇÃO RESILIENTE DE COLUNAS (SOLUÇÃO DEFINITIVA)
-- Este bloco verifica cada tabela e garante a existência da coluna championship_id.
DO $$ 
BEGIN 
    -- Tabela: public.companies
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='companies' AND column_name='championship_id') THEN
        ALTER TABLE public.companies ADD COLUMN championship_id UUID;
        ALTER TABLE public.companies ADD CONSTRAINT companies_championship_id_fkey FOREIGN KEY (championship_id) REFERENCES public.championships(id) ON DELETE CASCADE;
    END IF;

    -- Tabela: public.current_decisions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='current_decisions' AND column_name='championship_id') THEN
        ALTER TABLE public.current_decisions ADD COLUMN championship_id UUID;
        ALTER TABLE public.current_decisions ADD CONSTRAINT current_decisions_championship_id_fkey FOREIGN KEY (championship_id) REFERENCES public.championships(id) ON DELETE CASCADE;
    END IF;

    -- Tabela: public.team_members
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='team_members' AND column_name='championship_id') THEN
        ALTER TABLE public.team_members ADD COLUMN championship_id UUID;
        ALTER TABLE public.team_members ADD CONSTRAINT team_members_championship_id_fkey FOREIGN KEY (championship_id) REFERENCES public.championships(id) ON DELETE CASCADE;
    END IF;

    -- Tabela: public.decision_audit_log
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='decision_audit_log' AND column_name='championship_id') THEN
        ALTER TABLE public.decision_audit_log ADD COLUMN championship_id UUID;
        ALTER TABLE public.decision_audit_log ADD CONSTRAINT decision_audit_log_championship_id_fkey FOREIGN KEY (championship_id) REFERENCES public.championships(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. CRIAÇÃO DE TABELAS DE SUPORTE SE FALTANTES
CREATE TABLE IF NOT EXISTS public.trial_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID REFERENCES public.trial_championships(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.trial_teams(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    equity NUMERIC DEFAULT 0,
    kpis JSONB DEFAULT '{}'::jsonb,
    tsr NUMERIC DEFAULT 0,
    nlcdg NUMERIC DEFAULT 0,
    ebitda NUMERIC DEFAULT 0,
    solvency_score_kanitz NUMERIC DEFAULT 0,
    dcf_valuation NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. LIMPEZA E UNIFICAÇÃO DE POLÍTICAS RLS (EVITA RECURSÃO E LENTIDÃO)
-- Removemos as políticas fragmentadas identificadas no dump JSON para evitar conflitos.

DROP POLICY IF EXISTS "Companies_Access_v3" ON public.companies;
DROP POLICY IF EXISTS "Companies_Audit_Policy" ON public.companies;
DROP POLICY IF EXISTS "Command_Center_History_Access" ON public.companies;
DROP POLICY IF EXISTS "Unified_History_Policy" ON public.companies;
DROP POLICY IF EXISTS "Team_Members_Access" ON public.team_members;
DROP POLICY IF EXISTS "Team_Members_Select_v3" ON public.team_members;

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_companies ENABLE ROW LEVEL SECURITY;

-- Nova Política Unificada: COMPANIES
-- Permite leitura se for o Tutor, Observador ou se o usuário for membro da equipe dona do registro.
CREATE POLICY "Companies_Master_Policy" ON public.companies
FOR SELECT TO authenticated
USING (
    championship_id IN (
        SELECT id FROM public.championships 
        WHERE tutor_id = auth.uid() 
        OR observers ? auth.uid()::text 
        OR is_public = true
    ) 
    OR 
    team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
);

-- Nova Política Unificada: TEAM_MEMBERS
CREATE POLICY "Team_Members_Master_Policy" ON public.team_members
FOR SELECT TO authenticated
USING (
    user_id = auth.uid() 
    OR 
    championship_id IN (
        SELECT id FROM public.championships WHERE tutor_id = auth.uid()
    )
);

-- Nova Política Unificada: TRIAL_COMPANIES
CREATE POLICY "Trial_Companies_Master_Policy" ON public.trial_companies
FOR SELECT TO authenticated
USING (
    championship_id IN (
        SELECT id FROM public.trial_championships 
        WHERE tutor_id = auth.uid() 
        OR is_public = true
    )
);

-- 5. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_companies_champ_round_v17 ON public.companies(championship_id, round);
CREATE INDEX IF NOT EXISTS idx_team_members_lookup_v17 ON public.team_members(user_id, championship_id);

-- 6. COMENTÁRIOS DE AUDITORIA
COMMENT ON TABLE public.companies IS 'Histórico de performance. championship_id é obrigatório para RLS v17+.';
COMMENT ON COLUMN public.team_members.championship_id IS 'Injetado para otimizar isolamento de arenas sem joins complexos.';
