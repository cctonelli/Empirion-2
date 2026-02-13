
-- ==============================================================================
-- EMPIRION DATABASE CORE RECOVERY v18.0 - GEOPOLÍTICA E ESTRATÉGIA GLOBAL
-- ==============================================================================

-- 1. GARANTIR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. INJEÇÃO DE CAMPOS DE CÂMBIO E TARIFAS (30 RUBRICAS PROTOCOLO)
DO $$ 
BEGIN 
    -- Tabela: championships
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championships' AND column_name='exchange_rates') THEN
        ALTER TABLE public.championships ADD COLUMN exchange_rates JSONB DEFAULT '{"BRL": 1.0, "USD": 5.25, "EUR": 5.60, "CNY": 0.72, "BTC": 0.00002}'::jsonb;
    END IF;

    -- Tabela: trial_championships
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trial_championships' AND column_name='exchange_rates') THEN
        ALTER TABLE public.trial_championships ADD COLUMN exchange_rates JSONB DEFAULT '{"BRL": 1.0, "USD": 5.25, "EUR": 5.60, "CNY": 0.72, "BTC": 0.00002}'::jsonb;
    END IF;

    -- Tabela de Regras Macro (Histórico de 30 Rubricas)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championship_macro_rules' AND column_name='vat_purchases_rate') THEN
        ALTER TABLE public.championship_macro_rules ADD COLUMN vat_purchases_rate NUMERIC DEFAULT 0.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championship_macro_rules' AND column_name='tax_rate_ir') THEN
        ALTER TABLE public.championship_macro_rules ADD COLUMN tax_rate_ir NUMERIC DEFAULT 25.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='championship_macro_rules' AND column_name='export_tariff_usa') THEN
        ALTER TABLE public.championship_macro_rules ADD COLUMN export_tariff_usa NUMERIC DEFAULT 0.0;
    END IF;
END $$;

-- 3. REFINAMENTO DE SEGURANÇA (RLS PARA OBSERVADORES NOMINADOS)
DROP POLICY IF EXISTS "Decisions_Select_Auth" ON public.current_decisions;
CREATE POLICY "Decisions_Select_Auth" ON public.current_decisions
FOR SELECT TO authenticated
USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()) OR 
    EXISTS (
        SELECT 1 FROM championships c 
        WHERE c.id = current_decisions.championship_id 
        AND (c.tutor_id = auth.uid() OR c.observers ? auth.uid()::text)
    )
);

-- 4. ÍNDICES DE PERFORMANCE (TELEMETRIA DE ALTA VELOCIDADE)
CREATE INDEX IF NOT EXISTS idx_companies_championship_round ON public.companies(championship_id, round);
CREATE INDEX IF NOT EXISTS idx_champs_tutor_status ON public.championships(tutor_id, status);

-- 5. COMENTÁRIOS DE PROTOCOLO
COMMENT ON COLUMN public.championships.region_configs IS 'Armazena nodos geográficos, moedas locais e pesos de demanda elástica v18.0.';
