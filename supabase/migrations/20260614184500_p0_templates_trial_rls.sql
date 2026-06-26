-- Migração de Banco de Dados para Governança e Acesso Liberal de Templates (v2026.139 TRIAL MVP)
-- Detalhe: Alinhamento fiduciário do RLS na tabela de public.r0_templates para acomodar o fluxo de gravação livre (zero CRUD restrictions) no Modo Trial/Sandbox.
-- Isso permite a gravação de cenários calibrados como a "VARIAÇÃO DEMANDA 0%" por usuários anônimos (convidados do Trial).

BEGIN;

-- 1. CRIAÇÃO DA TABELA CASO NÃO EXISTA (Alinhado com database_rls.sql)
CREATE TABLE IF NOT EXISTS public.r0_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    tutor_id TEXT, -- Em sintonia com as persistências locais de tutor/user
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CERTIFICAR QUE ROW LEVEL SECURITY ESTÁ ATIVO
ALTER TABLE public.r0_templates ENABLE ROW LEVEL SECURITY;

-- 3. RECONSTRUÇÃO DA POLÍTICA DE LEITURA (SELECT) 100% LIBERAL PARA O MODO TRIAL E PAGO
DROP POLICY IF EXISTS "Leitura de templates públicos e próprios" ON public.r0_templates;
CREATE POLICY "Leitura de templates públicos e próprios" ON public.r0_templates
    FOR SELECT TO public
    USING (true);

-- 4. RECONSTRUÇÃO DA POLÍTICA DE GRAVAÇÃO/MUTAÇÃO (INSERT/UPDATE/DELETE) 100% LIBERAL PARA MODO TRIAL E PAGO
DROP POLICY IF EXISTS "Escrita apenas para tutores e admins" ON public.r0_templates;
DROP POLICY IF EXISTS "Escrita de templates sem restricoes em modo Trial" ON public.r0_templates;

CREATE POLICY "Escrita de templates sem restricoes em modo Trial" ON public.r0_templates
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- 5. CRIAÇÃO DE ÍNDICES DE DESEMPENHO FIDUCIÁRIO
CREATE INDEX IF NOT EXISTS idx_r0_templates_tutor_public ON public.r0_templates (tutor_id, is_public);

COMMIT;
