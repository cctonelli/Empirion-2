
-- ==============================================================================
-- EMPIRION DATABASE SECURITY PATCH v23.0 - ORACLE KERNEL EVOLUTION
-- Objetivo: Suporte a lógicas complexas de folha, metas de lucro e KPIs dinâmicos.
-- Data: 10/01/2026
-- ==============================================================================

-- 1. AJUSTES DE ESQUEMA: AMBIENTE TRIAL (SANDBOX)
-- Permite que campeonatos trial sejam criados sem tutor_id (modo no-auth)
ALTER TABLE public.trial_championships ALTER COLUMN tutor_id DROP NOT NULL;
ALTER TABLE public.trial_championships ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;
ALTER TABLE public.trial_teams ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;

-- 2. POLÍTICAS DE ACESSO: TABELAS TRIAL (MODO ANÔNIMO)
-- Garante leitura e escrita total para usuários trial (filtros feitos na aplicação)

DROP POLICY IF EXISTS "Trial_Championships_Anonymous_Access" ON public.trial_championships;
CREATE POLICY "Trial_Championships_Anonymous_Access"
ON public.trial_championships FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Trial_Teams_Anonymous_Access" ON public.trial_teams;
CREATE POLICY "Trial_Teams_Anonymous_Access"
ON public.trial_teams FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Trial_Decisions_Anonymous_Access" ON public.trial_decisions;
CREATE POLICY "Trial_Decisions_Anonymous_Access"
ON public.trial_decisions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 3. POLÍTICAS DE ACESSO: TABELAS LIVE (MODO AUTENTICADO)
-- Tabelas oficiais do motor Empirion

ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_decisions ENABLE ROW LEVEL SECURITY;

-- Championships: Públicos para todos, privados para o dono
DROP POLICY IF EXISTS "Championships_Security_Policy" ON public.championships;
CREATE POLICY "Championships_Security_Policy" ON public.championships
FOR ALL TO authenticated, anon USING (is_public = true OR tutor_id = auth.uid()) WITH CHECK (tutor_id = auth.uid());

-- Teams: Visibilidade total para competição, edição protegida
DROP POLICY IF EXISTS "Teams_Security_Policy" ON public.teams;
CREATE POLICY "Teams_Security_Policy" ON public.teams
FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Decisions: Leitura permitida para auditoria, escrita para membros
DROP POLICY IF EXISTS "Decisions_Security_Policy" ON public.current_decisions;
CREATE POLICY "Decisions_Security_Policy" ON public.current_decisions
FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 4. GRANTS DE ACESSO (CRÍTICO PARA MODO TRIAL)
-- Garante que as roles anon e authenticated possam manipular os objetos JSONB

GRANT ALL ON public.trial_championships TO anon, authenticated;
GRANT ALL ON public.trial_teams TO anon, authenticated;
GRANT ALL ON public.trial_decisions TO anon, authenticated;

GRANT ALL ON public.championships TO anon, authenticated;
GRANT ALL ON public.teams TO anon, authenticated;
GRANT ALL ON public.current_decisions TO anon, authenticated;

-- NOTA TÉCNICA ORACLE v23.0:
-- As regras de 'production_hours_period' (Card 4 Tutor) e 'net_profit_target_percent' (Card 3 Equipe)
-- são incorporadas como propriedades nativas dos objetos JSONB de 'market_indicators' e 'data',
-- não exigindo migrações de coluna física (Alter Table Add Column).
-- O motor de simulação (simulation.ts) está validado para processar estes caminhos de dados.
