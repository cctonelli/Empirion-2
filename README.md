# 🚀 Empirion – Business Intelligence Arena (v13.0-Oracle Gold)

**Forge Your Empire with AI-Driven Strategic Insight.**

O Empirion é a plataforma definitiva de simulação empresarial multiplayer. No build **v13.0 Oracle Gold**, o sistema consolida a **Separação Estrita de Ambientes**, garantindo ergonomia visual, segurança de dados via Supabase RLS e inteligência tática via Gemini 3 Pro.

---

## 👥 1. Matriz de Governança e Ambientes

O sistema identifica o perfil do operador no handshake inicial e direciona para um dos 5 nodos de experiência abaixo:

### 🏛️ A. Administrador Geral (System Owner)
*   **Ambiente:** `Command Center (Full Access)`
*   **Foco:** Saúde do ecossistema SaaS e integridade da marca.
*   **Funcionalidades Exclusivas:**
    *   **CMS Engine:** Alteração dinâmica de menus, submenus e links de navegação.
    *   **Branding Node:** Controle de cores globais, fontes e conteúdo do carrossel principal.
    *   **User Governance:** Gestão de RLS, promoção de usuários a Tutores e logs de auditoria.
    *   **Blueprint Master:** Criação e publicação de novos ramos (Industrial, Agro, etc.) e templates oficiais.
*   **Métricas:** Latência de Nodos, Conversão de Assinaturas, Usuários Online.

### 🎓 B. Tutor (Arena Orchestrator)
*   **Ambiente:** `Control Room (Management Access)`
*   **Foco:** Condução pedagógica e competitiva de campeonatos específicos.
*   **Funcionalidades Exclusivas:**
    *   **Arena Wizard:** Parametrização de moedas, regiões, impostos e ativos iniciais (Audit P00).
    *   **Macro Control:** Manipulação de taxas de juros, inflação e volatilidade de demanda por ciclo.
    *   **Oracle Turnover:** Processamento manual ou agendado de rodadas e geração de Gazetas.
    *   **Feedback Tático:** Monitor de decisões em tempo real com canal de briefing direto para as equipes.

### 🏢 C. Equipes & Empresas (Strategists)
*   **Ambiente:** `War Room (Operational Access)`
*   **Foco:** Gestão de capital, produção e market share.
*   **Funcionalidades Exclusivas:**
    *   **Oracle Cockpit:** Dashboard de alta densidade com KPIs financeiros (DRE, Balanço, Fluxo de Caixa).
    *   **Decision Matrix:** Interface tabular para decisões de Preço, Marketing, RH e CAPEX.
    *   **Business Plan IA:** Elaboração de planos estratégicos com auditoria neural do Gemini 3.
    *   **Rating HUD:** Monitoramento contínuo de solvência e risco de falência técnica.

### 👁️ D. Observadores (Market Community)
*   **Ambiente:** `Public Arena (Read-Only Access)`
*   **Foco:** Análise externa, benchmarking e influência de mercado.
*   **Funcionalidades Exclusivas:**
    *   **Public Reports:** Acesso a relatórios financeiros anonimizados das empresas líderes.
    *   **Community Voting:** Avaliação de empresas em critérios de inovação e ESG.
    *   **Ranking Global:** Acompanhamento do Total Shareholder Return (TSR) em tempo real.

### 🌐 E. Usuários Comuns (Public Visitors)
*   **Ambiente:** `Site Institucional (Open Access)`
*   **Foco:** Conversão, informação e experimentação.
*   **Funcionalidades Exclusivas:**
    *   **Landing Page:** Visualização do carrossel de ramos e funcionalidades.
    *   **Trial Mode:** Acesso ao simulador sandbox (Industrial Node 08) para testes rápidos.
    *   **Intelligence Feed:** Blog (Gazeta) com novidades sobre economia e simulação.

---

## 🛠️ 2. Stack Tecnológica de Isolamento

*   **Auth Proxy:** Motor de rotas inteligente em `App.tsx` que impede o "cross-role access".
*   **Database RLS:** Políticas de Row-Level Security no Supabase garantem que uma equipe nunca acesse as decisões de outra.
*   **AI Grounding:** Gemini 3 Pro configurado com `systemInstruction` específico para cada ambiente (Mentor para equipes, Auditor para tutores).
*   **Visual Fidelity:** Componentes customizados (Wizard, Editor Estrutural) com estados independentes por perfil.

---
*Empirion v13.0 Oracle Gold – Governança Absoluta, Performance de Elite.*