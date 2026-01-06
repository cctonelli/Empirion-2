
# 🚀 Empirion – Business Intelligence Arena (v12.9.0-Gold)

**Forge Your Empire with AI-Driven Strategic Insight.**

O Empirion é a plataforma definitiva de simulação empresarial multiplayer, projetada para converter complexidade em vantagem competitiva. No build **v12.9.0 GOLD**, o sistema integra normas **CPC 26**, inteligência generativa **Gemini 3 Pro** e um motor de **Market Valuation** de alta fidelidade.

---

## 🏗️ 1. Processo de Criação de Campeonato (Tutor Master)

O Tutor atua como o Arquiteto do Ecossistema através do **Strategos Wizard Gold**.

### O Quê, Como, Quem e Quando:
*   **Quem:** Usuários com role `tutor` ou `admin`.
*   **Quando:** Fase de pré-ciclo (Round 0).
*   **Onde:** `components/ChampionshipWizard.tsx`.

### Etapas do Wizard:
1.  **Matriz de Atividade:** Escolha do DNA da simulação (Industrial, Comercial, Agro, etc). 
    *   *Tabelas:* `championship_templates`.
2.  **Protocolos de Escopo & IA:** 
    *   **Quantidade de Regiões:** 1 a 15 nodos de disputa.
    *   **Quantidade de Bots:** Competidores sintéticos (AI Bots) para preencher a arena.
    *   **Tipo de Região:** Nacional, Exterior ou Mesclado (afeta moedas e custos logísticos).
    *   **Fonte de Inteligência:**
        *   *Parametrizado:* IA interpreta as métricas (Inflação, TR, ICE) definidas pelo Tutor.
        *   *IA Real:* IA utiliza Google Search Grounding para trazer o cenário do mundo real para dentro da arena.
    *   **Protocolos Temporais:** Duração do ciclo e preço da ação inicial.
3.  **Transparência & Observadores:** Configuração do nível de exposição de dados e convite de avaliadores externos.
    *   *Campos:* `gazeta_mode` (Anonymous/Identified), `observers` (UUIDs).
4.  **Auditoria Estrutural (CPC 26):** Edição das contas contábeis iniciais.
    *   *Código:* `FinancialStructureEditor.tsx`.
    *   *Campos:* `initial_financials` (JSONB).
5.  **Módulo Business Plan:** Ativação da orquestração estratégica via IA.
6.  **Matriz de Competidores:** Nomeação das unidades operacionais e diferenciação visual de Bots.

---

## 🎮 2. Gerenciamento da Equipe (Strategist Flow)

As equipes operam dentro de um ciclo de decisão hermético assistido pelo **Oracle Kernel**.

### O Fluxo de Operação:
1.  **Análise (Intelligence Hub):** A equipe consulta o Oráculo para entender se o mercado é influenciado por parâmetros do tutor ou notícias mundiais.
2.  **Decisão Tática (`DecisionForm.tsx`):**
    *   **Comercial:** Definição de Preço e Marketing por região (conforme escopo Geográfico do Tutor).
    *   **RH:** Impacto na produtividade real.
    *   **Produção:** Gestão de Capex (Máquinas Alfa/Beta/Gama).
    *   **Financeiro:** Alocação de recursos e tomada de crédito.
3.  **Projeção Real-time:** Visualização do impacto esperado no TSR e Rating antes da transmissão.
4.  **Selo de Integridade:** Transmissão para o Oracle para processamento de turnover.

---

## 🤖 3. Competidores Sintéticos (AI Bots)
A arena Empirion suporta bots competitivos que:
*   Geram decisões táticas baseadas na rentabilidade do setor.
*   Disputam Market Share real com os jogadores humanos.
*   Aparecem na Gazeta e no Ranking Geral como unidades de inteligência.

---

## 📊 4. Dashboards & Indicadores de Performance

O Empirion v12.9 Gold não foca apenas em lucro, mas em **Geração de Valor**.

### Indicadores da Empresa:
*   **TSR (Total Shareholder Return):** Valorização da ação + Dividendos.
*   **NCG vs CCL (Efeito Tesoura):** Detecção automática de desequilíbrio de giro.
*   **Rating Oracle (AAA a D):** Custo de capital dinâmico.

### Indicadores de Mercado Global (IA & Tutor):
*   **Gazeta Empirion:** Notícias geradas dinamicamente com base no Escopo (Nacional/Internacional) e Fonte (Parametrizada/Real).
*   **Black Swan Engine:** Eventos disparados pelo Tutor para testar resiliência.

---

## 🛠️ Especificações Técnicas (Build Oracle)
*   **Frontend:** React 19 + Framer Motion.
*   **Backend:** Supabase (Realtime Sync).
*   **AI:** Gemini 3 Pro (Complex Logic) & Gemini 3 Flash (Fast Response).

---
*Empirion v12.9 Gold – Onde a estratégia encontra o valor real de mercado.*
