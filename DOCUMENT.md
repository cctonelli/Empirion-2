# Oracle Strategos - Documentação do Projeto

## Visão Geral
O Oracle Strategos é um simulador empresarial avançado (Modo Industrial Trial) focado em gestão financeira, operacional e estratégica. O objetivo é gerenciar uma unidade industrial, tomando decisões que afetam a produção, o mercado e a saúde financeira da empresa.

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
