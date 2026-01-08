# 🚀 Empirion – Business Intelligence Arena (v13.2-Oracle Gold)

**Forge Your Empire with AI-Driven Strategic Insight.**

O Empirion é a plataforma definitiva de simulação empresarial multiplayer. No build **v13.2 Oracle Gold**, o sistema consolida a **Separação Estrita de Ambientes**, garantindo ergonomia visual, segurança de dados via Supabase RLS e inteligência tática via Gemini 3 Pro.

---

## 👥 1. Matriz de Governança e Ambientes (Progresso v13.2)

O sistema identifica o perfil do operador no handshake inicial e direciona para um dos 5 nodos de experiência abaixo:

### 🏛️ A. Administrador Geral (System Owner)
*   **Ambiente:** `Command Center (Full Access)`
*   **Foco:** Saúde do ecossistema SaaS, métricas de cluster e integridade da marca.
*   **CMS Engine:** Painel de edição de menus, submenus e links globais.
*   **Branding Node:** Controle de cores, fontes e editor de carrossel da Landing Page.

### 🎓 B. Tutor (Arena Orchestrator)
*   **Ambiente:** `Control Room (Management Access)`
*   **Foco:** Condução estratégica e competitiva de campeonatos.
*   **Strategos Wizard:** Parametrização completa (Moeda Base, Regiões, Audit P00).
*   **Macro Control:** Ajuste de inflação, juros e volatilidade por ciclo.

### 🏢 C. Equipes & Empresas (Strategists)
*   **Ambiente:** `War Room / Cockpit (Operational Access)`
*   **Foco:** Gestão de capital, produção, marketing e market share.
*   **Oracle Cockpit:** Dashboards de alta densidade (DRE, Balanço, TSF).
*   **Decision Matrix:** Inputs táticos sincronizados via Supabase.

---

## 🧪 2. Modo TRAIL – Sandbox Público (Trial Master)

O ambiente **Trial Master (Industrial Node 08)** é a porta de entrada gratuita para experimentação aberta.

### 🕹️ Fluxo do Jogador Solo
1.  **Acesso Inicial:** Landing CTA "Teste Grátis" → `/test/industrial`.
2.  **Criação de Unidade:** O usuário define o nome da sua empresa (ex: "Atlas Industrial").
3.  **Engine Sandbox:** O sistema cria um registro em `trial_teams` vinculado ao Node 08 fixo.
4.  **Simulação:** Acesso ao Cockpit com capital inicial de $9.1M para testar decisões em tempo real.
5.  **Conversão:** Sugestão de upgrade para Campeonatos Reais (Multijogador) ao atingir o Ciclo 3.

### 🎓 Fluxo Tutor Demo
*   Tutores podem criar instâncias sandbox efêmeras para demonstrações rápidas.
*   Uso de `trial_championships` para isolamento total de dados de produção.

### 👁️ Fluxo Observador Público
*   Acesso read-only via `/trial/public` para visualização de rankings agregados e Gazetas anônimas do ambiente sandbox.

---

## 🛠️ 3. Stack Tecnológica de Isolamento

*   **Auth Proxy:** Roteamento inteligente em `App.tsx` que impede acesso cruzado.
*   **Database RLS:** Políticas de Row-Level Security no Supabase isolando arenas reais de instâncias `trial_*`.
*   **UI Viewports:** Componentes como `AdminCommandCenter` e `ChampionshipWizard` com headers/footers fixos para visão contida.

---
*Empirion v13.2 Oracle Gold – Governança Absoluta, Performance de Elite.*