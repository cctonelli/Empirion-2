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

---

## 📊 5. Indicadores de Resultado e KPIs (Template Industrial)

O Empirion v18.0 oferece um conjunto exaustivo de métricas financeiras e operacionais, distribuídas entre os diferentes terminais de visualização.

### 5.1 Cockpit das Equipes (Projeções T+1)
Durante a fase de tomada de decisão, as equipes visualizam projeções em tempo real:
*   **EBITDA Projetado:** Potencial de geração de caixa operacional.
*   **Caixa Final T+1:** Disponibilidade líquida estimada após o fechamento do ciclo.
*   **Forecast de Receita:** Faturamento bruto projetado com base no preço e demanda estimada.
*   **Forecast de Lucro Líquido:** Resultado final estimado após tributação (IR/CSLL).
*   **CPP Unitário (Custo de Produção):** Eficiência fabril por unidade produzida.

### 5.2 Dashboard do Tutor (Monitoramento Live)
O Tutor possui visão privilegiada de todas as unidades de negócio:
*   **TSR (Total Shareholder Return):** O principal indicador de vitória, medindo a criação de valor para o acionista.
*   **Rating de Crédito:** Avaliação de risco (AAA a D) baseada em modelos de liquidez e endividamento.
*   **Market Share:** Percentual de unidades vendidas em relação ao mercado total.
*   **NLCDG:** Necessidade Líquida de Capital de Giro para sustentar a operação.
*   **Z-Score de Kanitz:** Indicador preditivo de insolvência/falência.
*   **DCF Valuation:** Valor de mercado da empresa calculado via Fluxo de Caixa Descontado.
*   **CCC (Cash Conversion Cycle):** Eficiência do ciclo financeiro em dias.
*   **Índice de Cobertura de Juros:** Margem de segurança para pagamento de obrigações financeiras.

### 5.3 Gazeta Oracle (Inteligência de Mercado)
O jornal oficial da arena destaca os movimentos mais relevantes:
*   **Ranking de Performance:** Comparativo direto de TSR e Lucratividade.
*   **Análise de ROI:** Retorno sobre o Investimento por perfil estratégico.
*   **Market Share Consolidado:** Gráficos de dominância por região e global.
*   **Alerta de Conjuntura:** Impacto do ICE (Confiança), Inflação e Juros nos resultados das equipes.

### 5.4 Indicadores de Gestão Interna
Disponíveis nos relatórios detalhados (DRE/Balanço):
*   **Giro de Estoque:** Eficiência na gestão de produtos acabados e matérias-primas.
*   **Prazo Médio de Recebimento (PMR):** Ciclo financeiro de vendas.
*   **Efeito Tesoura:** Descompasso entre crescimento e necessidade de caixa.
*   **Break-Even Point (Ponto de Equilíbrio):** Volume mínimo de vendas para cobertura de custos fixos.

---

## 🚀 6. Comando Estratégico e KPIs Avançados (v18.8)

O Empirion agora deriva métricas de alta complexidade para análise de MBA e decisões de diretoria:

### 6.1 Gestão de Liquidez e Capital de Giro
*   **CCC (Cash Conversion Cycle):** Mede a eficiência do capital de giro em dias (PME + PMR - PMP).
*   **Índice de Cobertura de Juros:** Capacidade do lucro operacional cobrir as despesas financeiras.
*   **Efeito Tesoura:** Monitoramento do descompasso entre crescimento operacional e disponibilidade de caixa.

### 6.2 Análise DuPont (ROE)
Decomposição do Retorno sobre o Patrimônio em três pilares:
*   **Margem Líquida:** Eficiência de custos e precificação.
*   **Giro do Ativo:** Eficiência na utilização dos ativos para gerar receita.
*   **Alavancagem Financeira:** Impacto do endividamento na rentabilidade do acionista.

### 6.3 Inteligência de Mercado e ESG
*   **Elasticidade-Preço Real:** Sensibilidade da demanda às alterações de preço praticadas.
*   **Landed Cost Regional:** Custo total do produto posto no destino (Produção + Logística + Tarifas).
*   **Pegada de Carbono Unitária:** Impacto ambiental projetado por unidade produzida e transportada.

### 6.4 Global Trade Intelligence (v18.8 Platinum)
O Empirion agora monitora a competitividade internacional através de:
*   **Arbitragem Cambial:** Monitoramento em tempo real das taxas de **BRL (Real)** e **GBP (Libra)** em relação ao Dólar.
*   **Geopolítica Tarifária:** Rastreamento de impostos de exportação específicos para **Brasil** e **Reino Unido (UK)**.
*   **Exposição Cambial Líquida:** Impacto das flutuações de moedas globais (EUR, CNY, BTC) na lucratividade consolidada.
