
-- EMPIRION DATABASE SECURITY PATCH v15.8 - TRIAL MODE FIX
-- Objetivo: Garantir que o modo Sandbox funcione sem autenticação e suporte bots.

-- 1. AJUSTE DE ESQUEMA: trial_championships
-- Permite que a arena trial não tenha um tutor vinculado (necessário para modo no-auth)
ALTER TABLE public.trial_championships ALTER COLUMN tutor_id DROP NOT NULL;
-- Adiciona colunas de suporte caso não existam
ALTER TABLE public.trial_championships ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- 2. AJUSTE DE ESQUEMA: trial_teams
-- Adiciona a coluna is_bot que estava causando erro na transmissão das decisões
ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;

-- 3. RESET DE POLÍTICAS RLS PARA MODO TRIAL (Limpeza de conflitos)
-- Championship Policies
DROP POLICY IF EXISTS "Trial_Public_Access_v15" ON public.trial_championships;
DROP POLICY IF EXISTS "Acesso público trial championships" ON public.trial_championships;
DROP POLICY IF EXISTS "Tutor seleciona trial championships" ON public.trial_championships;

CREATE POLICY "Trial_Championships_Anonymous_Access"
ON public.trial_championships
FOR ALL 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Team Policies
DROP POLICY IF EXISTS "Trial_Teams_Public_Access_v15" ON public.trial_teams;
DROP POLICY IF EXISTS "Acesso público trial teams" ON public.trial_teams;

CREATE POLICY "Trial_Teams_Anonymous_Access"
ON public.trial_teams
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Decisions Policies
DROP POLICY IF EXISTS "Trial_Decisions_Public_Access_v15" ON public.trial_decisions;
DROP POLICY IF EXISTS "Acesso público trial decisions" ON public.trial_decisions;

CREATE POLICY "Trial_Decisions_Anonymous_Access"
ON public.trial_decisions
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- 4. GARANTIR PERMISSÕES DE TABELA PARA ROLE ANON
GRANT ALL ON public.trial_championships TO anon, authenticated;
GRANT ALL ON public.trial_teams TO anon, authenticated;
GRANT ALL ON public.trial_decisions TO anon, authenticated;
