# Oracle Strategos - Documentação do Projeto

## Visão Geral
O Oracle Strategos é um simulador empresarial avançado (Modo Industrial Trial) focado em gestão financeira, operacional e estratégica. O objetivo é gerenciar uma unidade industrial, tomando decisões que afetam a produção, o mercado e a saúde financeira da empresa.

## 🧠 Arquitetura de Inteligência Artificial (Gemini API)
O Empirion utiliza o motor neural **Gemini 3 Pro** para orquestrar o Oráculo Strategos, fornecendo raciocínio profundo sobre balanços e planos de negócios. A versão **Gemini 3 Flash** é utilizada para processamento de baixa latência em bots competitivos e geração de notícias da Gazeta.

### Perfis Estratégicos de Bots (Autonomous Nodes)
Para garantir uma dinâmica de mercado realista e heterogênea, os bots recebem atribuições automáticas de perfis estratégicos:
*   **AGRESSIVO:** Foco em market share, preços baixos e alta alavancagem.
*   **CONSERVADOR:** Foco em preservação de capital e liquidez.
*   **EFICIENTE:** Foco em otimização de custos e margens.
*   **INOVADOR:** Foco em P&D, qualidade e diferenciação.
*   **EQUILIBRADO:** Postura moderada entre crescimento e segurança.

## 🏛️ Segurança e Governança (RLS Protocol)
O acesso é segmentado em quatro níveis de autoridade via Supabase RLS:
1. **System Admin:** Acesso total (`role = 'admin'`).
2. **Arena Tutor:** Controle total sobre campeonatos criados (`tutor_id`).
3. **Team Member:** Leitura/escrita exclusiva nos dados da própria equipe.
4. **Market Observer:** Acesso de leitura a dados consolidados da arena.

## 📊 Protocolo de Integridade Contábil
Todas as contas na `INITIAL_FINANCIAL_TREE` são **imutáveis**. Contas com valor zero no P0 servem como placeholders para o motor Oracle e não devem ser removidas.

## 🌎 Expansão Geopolítica e Multi-Moeda
O sistema suporta operações multi-regionais (até 15 regiões) com moedas dinâmicas:
*   **Moedas:** BRL (Base), USD, EUR, GBP, CNY, BTC.
*   **Câmbio:** Taxas definidas nos `MacroIndicators`. O motor realiza conversão automática e monitora a exposição cambial.

## Regras de Negócio (Core Industrial)

### 1. Produção e Capacidade
- **Modelos de Máquina:**
  - **Alfa:** Capacidade 2.000 unid/ciclo | 94 Operadores | Vida útil 40 ciclos.
  - **Beta:** Capacidade 6.000 unid/ciclo | 235 Operadores | Vida útil 40 ciclos.
  - **Gama:** Capacidade 12.000 unid/ciclo | 445 Operadores | Vida útil 40 ciclos.
- **Consumo de Matéria-Prima (PA):**
  - Cada unidade de Produto Acabado (PA) consome **3 unidades de MP-A** e **2 unidades de MP-B**.
- **Turno Extra:** Acréscimo de até 50% na produção, com custo-hora da MOD aumentado em 50%.
- **Manutenção:** Custo fixo baseado na capacidade instalada, reajustado pela inflação.
- **Depreciação:** 
  - Prédios: 0,2% por período sobre o valor histórico.
  - Máquinas: Linear baseada na vida útil (40 ciclos).

### 2. Gestão de Estoque
- **Método de Custeio:** Média Ponderada Móvel (WAC - Weighted Average Cost) para o estoque de Produtos Acabados.
- **Custos de Estocagem:** Cobrados por unidade em estoque ao final do período (MP e PA).

### 3. Financeiro e Crédito
- **Empréstimo Compulsório (v2025-10):**
  - **Gatilho:** Liberado automaticamente se o saldo final de caixa for negativo.
  - **Encargos:** Juros (Taxa TR) + Ágio (compulsory_loan_agio).
  - **Quitação:** 100% no ciclo subsequente.
  - **P0 Especial:** Unidades iniciam com **$ 1.372.362,00** de compulsório a ser quitado no P1.
- **Empréstimos Normais:** Prazos de Curto e Longo Prazo, com juros baseados na Taxa TR.
- **Tributação:** Imposto de Renda de 25% sobre o lucro tributável.
- **Dividendos:** Distribuição obrigatória de 25% do lucro líquido.
- **Auditoria (Audit Awards):** Premiações por precisão nas projeções de Custo Unitário, Faturamento e Lucro Líquido (Tolerância de 5%).

### 4. Recursos Humanos (Talentos)
- **Salário Base:** Reajustado pela inflação do período.
- **Encargos Sociais:** 35% sobre a folha de pagamento.
- **Produtividade:** Influenciada por investimentos em treinamento e bônus de produtividade.

### 5. Comercial e Mercado
- **Preço de Venda:** Influencia diretamente a demanda (Elasticidade-Preço).
- **Inadimplência (PECLD):** Percentual do faturamento a prazo que é provisionado como perda.
- **Marketing:** Investimento regional para aumentar a atratividade da marca.
- **Distribuição:** Custo logístico unitário por venda realizada.

## 🚀 Indicadores e KPIs Avançados (v18.8)

### 1. Gestão de Liquidez e Capital de Giro
- **CCC (Cash Conversion Cycle):** Eficiência do capital de giro em dias.
- **NLCDG:** Necessidade Líquida de Capital de Giro.
- **Efeito Tesoura:** Descompasso entre crescimento e disponibilidade de caixa.
- **Índice de Cobertura de Juros:** Capacidade de cobrir despesas financeiras.

### 2. Análise de Valor e Rentabilidade
- **TSR (Total Shareholder Return):** Principal indicador de vitória (Criação de Valor).
- **Análise DuPont:** Decomposição do ROE (Margem x Giro x Alavancagem).
- **DCF Valuation:** Valor de mercado via Fluxo de Caixa Descontado.
- **Altman Z''-Score (v2025-12.2):** Indicador preditivo de insolvência para mercados emergentes e empresas privadas.
- **E-SDS v1.1 (Empirion Solvency Dynamics Score - v2026-03):** Modelo proprietário de solvência dinâmica focado em fluxo de caixa real, dinâmica de rodadas e diferenciação entre estratégia e erro.
  - **Fórmula:** E-SDS_raw = (4.0 × Pilar1) + (3.0 × Pilar2) + (2.0 × Pilar3) + (1.5 × Pilar4) – (2.5 × Pilar5) – (1.0 × Pilar6).
  - **Pilares:** 1. Geração de Caixa Operacional Líquida | 2. Sustentabilidade do Crescimento Alavancado | 3. Margem de Segurança Bruta + Recorrência | 4. Eficiência de Giro de Caixa | 5. Penalizador de Alavancagem Excessiva | 6. Penalizador de Volatilidade de Caixa.
  - **Escala:** Azul (≥8.0), Verde (5.5-7.9), Amarelo (3.0-5.4), Laranja (1.5-2.9), Vermelho (<1.5).

### 3. Inteligência de Mercado e ESG
- **Elasticidade-Preço Real:** Sensibilidade da demanda.
- **Landed Cost:** Custo total do produto no destino.
- **Pegada de Carbono:** Impacto ambiental por unidade (Produção + Logística).

## Decisões Arquiteturais

### Simulação Financeira (`services/simulation.ts`)
- O motor de simulação (`calculateProjections`) processa as decisões de forma sequencial:
  1. Reajustes de Preços e Inflação.
  2. Gestão de Ativos (Compras/Vendas/Depreciação).
  3. Cálculo do CPP (Custo do Produto Produzido).
  4. Fluxo de Estoque (WAC).
  5. Resultados (DRE/DFC/Balanço).
  6. Gatilho de Empréstimo Compulsório.
  7. Auditoria e Premiações.

## Versionamento

### v2025-10 - Implementação de Empréstimo Compulsório
- **Data:** Outubro de 2025
- **Motivo:** Garantir solvência automática das unidades e penalizar má gestão de caixa.
- **Status:** Em produção.

### v2025-11 - Correção de Consumo de MP (3:2)
- **Data:** Novembro de 2025
- **Motivo:** Alinhamento do motor de simulação com a regra de negócio industrial (3 MP-A e 2 MP-B por PA).
- **Status:** Em produção.

### v2025-12 - Visibilidade de Mercado e Valor da Ação
- **Data:** Dezembro de 2025
- **Motivo:** Melhorar a transparência de mercado para o Tutor e Equipes, incluindo o cálculo do Valor da Ação.
- **Diferenças:**
  - Adição do KPI `share_price` (Valor da Ação) baseado no Patrimônio Líquido.
  - Tabela de Monitoramento da Gazeta agora exibe Receita, Lucro Líquido e Valor da Ação.
  - Tutor agora possui seletor de unidades na aba "Unidade" da Gazeta.
  - Identificação de equipes na Gazeta liberada para o Tutor independentemente do modo de anonimato.
  - Atualização do `database_rls.sql` com colunas `share_price`, `ebitda` e restrição de `credit_rating`.
- **Status:** Em produção.

### v2025-12.2 - Implementação do Altman Z''-Score
- **Data:** Dezembro de 2025
- **Motivo:** Substituição do modelo de Kanitz pelo Altman Z''-Score para maior eficácia global e alinhamento com mercados emergentes.
- **Diferenças:**
  - Implementação da fórmula Z'' = 3.25 + 6.56X1 + 3.26X2 + 6.72X3 + 1.05X4.
  - Atualização da interface do Tutor com escala de cores (Seguro/Alerta/Perigo).
  - Adição da coluna `altman_z_score` no banco de dados.
- **Status:** Em produção.

### v2025-12.3 - Autonomia de BOTs e Visualização de Solvência
- **Data:** Dezembro de 2025
- **Motivo:** Garantir competitividade realista entre BOTs e transparência de risco para os jogadores.
- **Status:** Em produção.

### v2026-03 - E-SDS v1.1 e Telemetria P0
- **Data:** Março de 2026
- **Motivo:** Implementação do modelo de solvência dinâmica E-SDS v1.1 e garantia de telemetria completa (KPIs e E-SDS) desde o Round 0 (P0).
- **Diferenças:**
  - Substituição do score de Kanitz pelo E-SDS v1.1 como principal métrica de saúde financeira.
  - Cálculo automático de KPIs para o Round 0 em arenas Trial e Championship.
  - Adição de colunas `esds_gargalo` e `esds_insights` para diagnósticos via IA.
  - Diferenciação entre CapEx de Manutenção e Estratégico no cálculo de fluxo de caixa livre.
- **Status:** Em produção.
