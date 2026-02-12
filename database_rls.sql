
-- ==============================================================================
-- EMPIRION DATABASE SCHEMA & RLS v13.3.0 - BLOG, MODALITIES & CORE STABILIZATION
-- ==============================================================================

-- 1. USUÁRIO DE SISTEMA (UUID 0000...0000)
INSERT INTO public.users (id, supabase_user_id, name, email, role, nickname)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '00000000-0000-0000-0000-000000000000', 
  'Trial Orchestrator', 
  'trial@empirion.com', 
  'tutor',
  'Oracle_Trial'
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS PARA BLOG & FAQ
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.blog_posts;
CREATE POLICY "Public Read Access" ON public.blog_posts FOR SELECT USING (true);

-- 3. POLÍTICAS PARA MODALIDADES (RAMOS)
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public_Read_Modalities" ON public.modalities;
CREATE POLICY "Public_Read_Modalities" ON public.modalities FOR SELECT USING (true);

-- 4. POLÍTICAS PARA BUSINESS PLANS (TRIAL COMPATIBLE)
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_BP_Policy" ON public.business_plans;
CREATE POLICY "Unified_Trial_BP_Policy" ON public.business_plans
FOR ALL TO anon, authenticated
USING (
  is_template = true 
  OR 
  EXISTS (
    SELECT 1 FROM trial_championships 
    WHERE trial_championships.id = business_plans.championship_id
  )
  OR
  (user_id = auth.uid())
)
WITH CHECK (
  is_template = false AND (
    EXISTS (
      SELECT 1 FROM trial_championships 
      WHERE trial_championships.id = business_plans.championship_id
    )
    OR (user_id = auth.uid())
    OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  )
);

-- 5. POLÍTICAS PARA CAMPEONATOS (ARENAS)
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Championship_Select_v15" ON public.championships;
CREATE POLICY "Championship_Select_v15" ON public.championships 
FOR SELECT TO authenticated 
USING (
  (tutor_id = auth.uid()) 
  OR (is_public = true) 
  OR (observers ? (auth.uid())::text)
  OR (id IN (
    SELECT championship_id FROM teams 
    WHERE id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  ))
);

-- 6. POLÍTICAS TRIAL (CHAMPS, TEAMS, DECISIONS)
ALTER TABLE public.trial_championships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Champs_Policy" ON public.trial_championships;
CREATE POLICY "Unified_Trial_Champs_Policy" ON public.trial_championships FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.trial_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Teams_Policy" ON public.trial_teams;
CREATE POLICY "Unified_Trial_Teams_Policy" ON public.trial_teams FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.trial_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_Trial_Decisions_Policy" ON public.trial_decisions;
CREATE POLICY "Unified_Trial_Decisions_Policy" ON public.trial_decisions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 7. AUDITORIA & HISTÓRICO (COMPANIES)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Unified_History_Policy" ON public.companies;
CREATE POLICY "Unified_History_Policy" ON public.companies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. SITE CONTENT (CMS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site_Content_Public_Read" ON public.site_content;
CREATE POLICY "Site_Content_Public_Read" ON public.site_content FOR SELECT TO anon, authenticated USING (true);

-- 9. COMUNIDADE & VOTOS
ALTER TABLE public.community_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Community_Read_All" ON public.community_ratings;
CREATE POLICY "Community_Read_All" ON public.community_ratings FOR SELECT TO authenticated USING (true);

-- 10. SEED DATA - BLOG POSTS (FAQ)
-- Nota: Usando $$ para permitir múltiplas linhas e formatação complexa.
INSERT INTO public.blog_posts (question, answer, category)
VALUES 
(
  'O que é o EMPIRION?', 
  'O EMPIRION é uma plataforma de simulação empresarial multiplayer com fidelidade contábil 100%. Integra IA Gemini 3 para mentoria e cenários dinâmicos. Focado em cursos de Administração, Economia, Comércio Exterior, MBA e treinamentos online ou in company, oferece mecânicas de mercado global, multissetoriais e gamificação para gestão estratégica real.',
  'Sobre'
),
(
  'Qual é a filosofia core do projeto EMPIRION?', 
  'A filosofia core do projeto EMPIRION, sintetizada no lema "Forge Your Empire" (Forje seu Império), reflete o compromisso em oferecer uma experiênia de aprendizado que é, ao mesmo tempo, envolvente e rigorosamente técnica.',
  'Filosofia'
),
(
  'O EMPIRION utiliza qual motor neural para orquestrar o Oracle Strategos e fornecer raciocínio profundo sobre balanços?', 
  $$O uso do motor neural Gemini 3 Pro no projeto EMPIRION é um dos pilares da sua arquitetura de inteligência artificial, sendo responsável pelas funções que exigem maior capacidade analítica e processamento de informações complexas.

Abaixo, detalho como essa tecnologia é aplicada e por que ela é central para o funcionamento do Oracle Strategos:

1. Orquestração do Oracle Strategos
O Gemini 3 Pro atua como o "cérebro" por trás do Oracle Strategos, uma entidade dentro do simulador que fornece raciocínio profundo sobre os demonstrativos financeiros. Enquanto outros modelos (como o Gemini 3 Flash) cuidam de tarefas de baixa latência, como bots e notícias, a versão Pro é reservada para análises que exigem uma compreensão detalhada de balanços patrimoniais e planos de negócios.

2. Mentoria Tática e Análise Preditiva
A integração desse motor neural permite que o simulador vá além de apenas mostrar números, oferecendo funcionalidades avançadas:
• Alertas de Insolvência: A IA monitora a saúde financeira das equipes em tempo real e emite avisos se detectar riscos de quebra.
• Hedge Preditivo: Ajuda os jogadores a entenderem riscos cambiais e estratégias de proteção (hedge) em um mercado com moedas dinâmicas (USD/EUR).
• Geração de Relatórios: O motor é capaz de gerar relatórios iniciais e análises de desempenho baseadas nas decisões tomadas pelas equipes.

3. Diferencial Competitivo ("Black Swan")
Uma das aplicações mais inovadoras citadas nas fontes é a capacidade da IA de gerar eventos do tipo "Black Swan" (Cisne Negro). Estes são eventos imprevisíveis e de grande impacto que desafiam a capacidade de adaptação dos gestores, tornando o EMPIRION mais preditivo e realista do que simuladores tradicionais, que costumam ser mais estáticos ou manuais.

4. Integração com a Integridade Contábil
Para que o Gemini 3 Pro funcione corretamente, o sistema mantém uma "árvore financeira" imutável. Isso significa que todas as contas contábeis (mesmo as que estão com valor zero) servem como "espaços de memória" ou placeholders para que o motor da IA possa processar as informações e calcular os rounds subsequentes sem quebras na lógica de consolidação.

Em resumo, a escolha do Gemini 3 Pro permite que o EMPIRION cumpra sua promessa de ser um "Strategic Command", oferecendo uma experiência de aprendizado onde a IA atua como uma mentora técnica de alto nível para estudantes de MBA e gestores corporativos.$$,
  'Inteligência Artificial'
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.blog_posts IS 'Tabela v13.3.0 - FAQ e Conteúdos técnicos com busca LIKE.';
COMMENT ON TABLE public.modalities IS 'Tabela v13.3.0 - Definições dinâmicas de ramos (Ind, Com, Agro, etc).';
