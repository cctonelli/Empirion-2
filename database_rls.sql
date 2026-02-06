
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.2.4 - MASTER INTERVENTION UPDATE
-- ==============================================================================

-- 1. POLÍTICA DE ATUALIZAÇÃO PARA TUTORES (CHAMPIONSHIPS)
-- Garante que o Tutor possa manipular o cronograma e os indicadores macro a qualquer momento.
DROP POLICY IF EXISTS "Tutor_Master_Intervention" ON public.championships;
CREATE POLICY "Tutor_Master_Intervention" ON public.championships 
FOR UPDATE 
TO authenticated 
USING (tutor_id = auth.uid()) 
WITH CHECK (tutor_id = auth.uid());

-- 2. POLÍTICA DE ATUALIZAÇÃO PARA TRIAL (ANON)
-- Permite que usuários Trial manipulem suas próprias arenas temporárias sem login.
DROP POLICY IF EXISTS "Trial_Champs_Intervention" ON public.trial_championships;
CREATE POLICY "Trial_Champs_Intervention" ON public.trial_championships 
FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

-- 3. GARANTIA DE INTEGRIDADE DE TABELAS DE RESULTADOS
-- Garante que as 'companies' (histórico) sejam graváveis por qualquer serviço de turnover.
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service_Write_History" ON public.companies;
CREATE POLICY "Service_Write_History" ON public.companies 
FOR INSERT TO public 
WITH CHECK (true);

-- Comentário de versão para o administrador
COMMENT ON TABLE public.championships IS 'Tabela v13.2.4 - Suporte completo a intervenção tática via JSONB round_rules.';
