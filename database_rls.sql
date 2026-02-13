
-- ==============================================================================
-- EMPIRION DATABASE CORE RECOVERY v18.0 - ESTRUTURA CONTÁBIL E DEMANDA
-- ==============================================================================

-- 1. ADIÇÃO DE CAMPOS DE DEMANDA E PPR NO HISTÓRICO DAS EMPRESAS
DO $$ 
BEGIN 
    -- Tabela: companies (Histórico de rounds)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='demand_variation') THEN
        ALTER TABLE public.companies ADD COLUMN demand_variation NUMERIC DEFAULT 0.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='non_op_res') THEN
        ALTER TABLE public.companies ADD COLUMN non_op_res NUMERIC DEFAULT 0.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='ppr') THEN
        ALTER TABLE public.companies ADD COLUMN ppr NUMERIC DEFAULT 0.0;
    END IF;

    -- Tabela de Regras Macro: Adicionar suporte para demand_variation se ausente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championship_macro_rules' AND column_name='demand_variation') THEN
        ALTER TABLE public.championship_macro_rules ADD COLUMN demand_variation NUMERIC DEFAULT 0.0;
    END IF;
END $$;

-- 2. REFINAMENTO DE ÍNDICES PARA BUSCA DE HISTÓRICO DRE
CREATE INDEX IF NOT EXISTS idx_companies_team_round ON public.companies(team_id, round);

-- 3. COMENTÁRIOS DE PROTOCOLO v18.0
COMMENT ON COLUMN public.companies.non_op_res IS 'Resultado não operacional acumulado no round (premiações e deságios).';
COMMENT ON COLUMN public.companies.ppr IS 'Participação nos lucros e resultados provisionada no round.';
COMMENT ON COLUMN public.companies.demand_variation IS 'Ajuste percentual de demanda real aplicado sobre a demanda base do ciclo.';
