# 🚀 Empirion – Business Intelligence Arena (v15.25-Oracle Master)

**Forge Your Empire with AI-Driven Strategic Insight.**

---

## 🧠 1. Arquitetura de Inteligência Artificial (Gemini API)
O Empirion utiliza o motor neural **Gemini 3 Pro** para orquestrar o Oráculo Strategos, fornecendo raciocínio profundo sobre balanços e planos de negócios. A versão **Gemini 3 Flash** é utilizada para processamento de baixa latência em bots competitivos e geração de notícias da Gazeta.

---

## 🏛️ 2. Segurança e Governança (RLS Protocol)

O Empirion utiliza **Row Level Security (RLS)** avançado no Supabase para garantir o isolamento total de dados entre arenas competitivas. O acesso é segmentado em quatro níveis de autoridade:

### 2.1 System Admin
*   **Permissões:** Acesso total a todas as tabelas, usuários e configurações globais do cluster.
*   **Identificação:** Usuários com `role = 'admin'`.

### 2.2 Arena Tutor (Orquestrador)
*   **Permissões:** Controle total sobre os campeonatos que criou (`tutor_id`). Pode ler todas as decisões, balanços e logs de auditoria de qualquer equipe dentro de sua arena.

### 2.3 Team Member (Estrategista)
*   **Permissões:** Leitura e escrita exclusivas nos dados de sua própria equipe.

### 2.4 Market Observer
*   **Permissões:** Acesso de leitura (*Read-Only*) a dados consolidados da arena onde foram nomeados.

---

## 📊 3. Protocolo de Integridade Contábil (Imutabilidade de Contas)

**REGRA CRÍTICA DE DESENVOLVIMENTO:**
Todas as contas listadas na `INITIAL_FINANCIAL_TREE` dentro de `constants.tsx` (Balanço Patrimonial, DRE e Fluxo de Caixa) são **imutáveis em sua existência**. 

*   **Contas com Valor 0:** É estritamente proibido remover contas que possuam valor zero no P00 (Baseline). 
*   **Motivo:** Estas contas servem como "espaços de memória" (placeholder) para o motor Oracle. Elas serão populadas e calculadas nos rounds subsequentes (P01-P12). 
*   **Impacto:** A remoção de qualquer conta, mesmo zerada, quebra a lógica de consolidação do motor de simulação e impede que as equipes tomem decisões relacionadas àquelas rubricas no futuro.

---

## 🌎 4. Expansão Geopolítica e Multi-Moeda

O Empirion v18.0 introduz um motor de câmbio dinâmico e suporte a operações multi-regionais, permitindo que as empresas atuem como verdadeiras multinacionais.

### 4.1 Novas Moedas Suportadas
O sistema agora processa transações e cotações nas seguintes moedas:
*   **BRL (Real):** Moeda base de liquidação.
*   **USD (Dólar Americano):** Padrão para comércio exterior.
*   **EUR (Euro):** Foco em mercados europeus.
*   **GBP (Libra Esterlina):** Alta estabilidade e valor.
*   **CNY (Yuan Chinês):** Foco em cadeias de suprimentos asiáticas.
*   **BTC (Bitcoin):** Ativo digital para cenários de alta volatilidade e hedge tecnológico.

### 4.2 Cotações Cruzadas e Câmbio Dinâmico
As taxas de câmbio são definidas nos `MacroIndicators` de cada round. O motor Oracle realiza a conversão automática de receitas e custos baseada na paridade do round vigente:
*   **Hedge Cambial:** As empresas podem optar por vender em regiões com moedas mais fortes para proteger seu patrimônio líquido contra a desvalorização do Real.
*   **Impacto no DRE:** As variações cambiais influenciam diretamente a Receita Líquida e os Custos de Importação (quando aplicável).

### 4.3 Vendas para Múltiplas Regiões
O simulador suporta a configuração de até **15 regiões simultâneas**. Cada região possui:
*   **Peso de Demanda:** Define a atratividade e o tamanho do mercado local.
*   **Moeda Local:** Preços são definidos na moeda da região, mas consolidados no balanço da empresa na moeda base.
*   **Estratégia de Precificação:** As equipes podem definir preços, prazos e investimentos em marketing específicos para cada região, permitindo estratégias de penetração de mercado diferenciadas.
