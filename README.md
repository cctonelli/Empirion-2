# 🚀 Empirion – Business Intelligence Arena (v15.0-Oracle Master)

**Forge Your Empire with AI-Driven Strategic Insight.**

O Empirion é a plataforma definitiva de simulação empresarial multiplayer. No build **v15.0 Oracle Master (International Build)**, o sistema utiliza a **Gemini API** para orquestrar um ecossistema cognitivo que transforma dados brutos em inteligência competitiva pura.

---

## 🧠 1. Arquitetura de Inteligência Artificial (Gemini API)

Abaixo estão detalhadas as funcionalidades onde a IA atua como motor central da experiência:

### 🤖 1.1 Strategos Mentor (Chat de Elite)
*   **Componente:** `GlobalChat.tsx`
*   **Modelo:** `gemini-3-pro-preview`
*   **Uso:** Fornece mentoria estratégica em tempo real utilizando raciocínio profundo (*Thinking Config*). Auxilia na interpretação de Balanços, DREs e conceitos de contabilidade gerencial.

### 🦾 1.2 Autonomous Synthetic Nodes (Bots Competidores)
*   **Serviço:** `services/gemini.ts` -> `generateBotDecision`
*   **Modelo:** `gemini-3-flash-preview`
*   **Uso:** Gera decisões táticas complexas (preço, marketing, produção, RH) para as equipes controladas pela IA, garantindo um mercado desafiador e equilibrado mesmo em arenas com poucos jogadores humanos.

### 🌐 1.3 Grounded Market Intelligence
*   **Componente:** `MarketAnalysis.tsx`
*   **Modelo:** `gemini-3-flash-preview`
*   **Uso:** Integra o **Google Search Grounding** para buscar tendências reais da economia global (preços de commodities, taxas de câmbio, notícias do setor industrial) e cruzá-las com os parâmetros da simulação.

### 📝 1.4 Business Plan Architect & Auditor
*   **Componente:** `BusinessPlanWizard.tsx`
*   **Modelos:** `gemini-3-flash-preview` (Geração) e `gemini-3-pro-preview` (Auditoria)
*   **Uso:** 
    *   **Geração:** Cria sugestões de textos profissionais para seções do plano de negócios.
    *   **Auditoria:** Analisa a coerência textual do usuário frente aos KPIs financeiros reais da equipe, atribuindo notas e identificando riscos estratégicos.

### 🎙️ 1.5 Oracle Live Briefing (Audio API)
*   **Componente:** `LiveBriefing.tsx`
*   **Modelo:** `gemini-2.5-flash-native-audio-preview-12-2025`
*   **Uso:** Transmite briefings táticos via áudio em tempo real com voz futurista, sintetizando o status da arena para o Operador Master.

### 🗞️ 1.6 Dynamic Gazette Headlines
*   **Serviço:** `services/gemini.ts` -> `generateGazetaNews`
*   **Modelo:** `gemini-3-flash-preview`
*   **Uso:** Redige manchetes e notícias contextuais para a "Oracle Gazette" baseadas nos resultados financeiros pós-fechamento e nos indicadores macroeconômicos do ciclo.

### 🦢 1.7 Black Swan Event Generator
*   **Serviço:** `services/gemini.ts` -> `generateBlackSwanEvent`
*   **Modelo:** `gemini-3-flash-preview`
*   **Uso:** Cria eventos inesperados (choques de oferta, pandemias, saltos tecnológicos) com impacto narrativo e modificadores numéricos que alteram o engine da simulação.

---

## 🌎 2. Expansão Geopolítica e Multi-Moeda

*   **Multi-Currency Nodes:** Suporte a BRL, USD e EUR com conversão cambial em tempo real no motor **Oracle Engine v15.2**.
*   **Demand Weighting:** Pesos regionais independentes para modelar mercados globais complexos.

---

## 🏛️ 3. Governança e Ambientes

*   **Admin Command Center:** Monitoramento de cluster e orquestração de arenas.
*   **Sandbox Trial:** Ambiente aberto para experimentação tática sem restrições.
*   **RLS Security:** Proteção de dados via Supabase para garantir a integridade da competição.

---

## 🛠️ 4. Stack Tecnológica

*   **Intelligence:** Gemini API (Pro & Flash).
*   **Database:** Supabase Realtime.
*   **Engine:** TypeScript Oracle Kernel v15.2.
*   **UI/UX:** Framer Motion & Tailwind CSS.

---
*Empirion v15.0 Oracle Master – Inteligência Nodal, Performance e Precisão.* 🚀