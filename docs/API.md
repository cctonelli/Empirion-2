# API & AI Integrations - EMPIRION

## Google Gemini API
Utilizamos o SDK `@google/genai` para orquestrar as inteligências do jogo.

### 1. Oráculo Strategos (Gemini 3 Pro)
- **Endpoint:** `/services/geminiService.ts`
- **Função:** Analisa o `FinancialTree` da rodada e gera relatórios estratégicos personalizados para cada equipe.

### 2. Gazeta News (Gemini 3 Flash)
- **Endpoint:** `/utils/newsGenerator.ts`
- **Função:** Gera manchetes e notícias de mercado baseadas na performance agregada das equipes e indicadores macro.

## Simulação (Turnover API)
A simulação não é uma API externa, mas um serviço interno robusto (`simulation.ts`).
Ele pode ser acionado via Edge Functions (futuro) ou diretamente pelo Tutor Admin no frontend.
