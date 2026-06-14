-- Migração de Banco de Dados para Governança e Acesso Liberal de Templates (v2026.139 TRIAL MVP)
-- Detalhe: Alinhamento fiduciário do RLS na tabela de public.p0_templates para acomodar o fluxo de gravação livre (zero CRUD restrictions) no Modo Trial/Sandbox.
-- Isso permite a gravação de cenários calibrados como a "VARIAÇÃO DEMANDA 0%" por usuários anônimos (convidados do Trial).

BEGIN;

-- 1. CERTIFICAR QUE ROW LEVEL SECURITY ESTÁ ATIVO
ALTER TABLE public.p0_templates ENABLE ROW LEVEL SECURITY;

-- 2. RECONSTRUÇÃO DA POLÍTICA DE LEITURA (SELECT) 100% LIBERAL PARA O MODO TRIAL
DROP POLICY IF EXISTS "Leitura de templates públicos e próprios" ON public.p0_templates;
CREATE POLICY "Leitura de templates públicos e próprios" ON public.p0_templates
    FOR SELECT TO public
    USING (true);

-- 3. RECONSTRUÇÃO DA POLÍTICA DE GRAVAÇÃO/MUTAÇÃO (INSERT/UPDATE/DELETE) 100% LIBERAL PARA MODO TRIAL
DROP POLICY IF EXISTS "Escrita apenas para tutores e admins" ON public.p0_templates;
DROP POLICY IF EXISTS "Escrita de templates sem restricoes em modo Trial" ON public.p0_templates;

CREATE POLICY "Escrita de templates sem restricoes em modo Trial" ON public.p0_templates
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

COMMIT;
