# Regras de Negócio Core - EMPIRION

**Versão:** v19.9 Obsidian Diamond Enterprise II  
**Data:** 24 de Maio de 2026  
**Método Contábil:** Custeio por Absorção Completo (Full Absorption Costing)  
**Referências:** CPC 16 (R1) / IAS 2 / SAP & Oracle Best Practices

## 1. Princípios Contábeis Gerais (Imutáveis)

- O Empirion utiliza **Custeio por Absorção** como método oficial de custeio.
- Todos os custos de produção (MP + MOD + CIF) são **ativados no estoque** até o momento da venda.
- O CPV é apurado apenas sobre as unidades vendidas, utilizando **Weighted Average Cost (WAC)**.
- Depreciação é sempre tratada como despesa não-caixa (non-cash expense).
- Qualquer inconsistência tripla (DRE × BP × DFC) deve bloquear o fechamento da rodada.

---

## 2. Ciclo Industrial e Formação de Unidades
- **Consumo de MP por PA:** Cada unidade de Produto Acabado (PA) consome obrigatoriamente **3 unidades de MP-A** e **2 unidades de MP-B**.
- **Turnos e Capacidade:**
  - Standard: Operação regular usando a capacidade nominal máxima das máquinas com base em 100% de atividade.
  - Extra: Possibilidade de produzir unidades adicionais ativando o percentual de produção extra (até 50%). O custo unitário da Mão de Obra Direta (MOD) para o excedente produzido em turno extra sofre um acréscimo de **+50%** (multiplicador de 1.5x), integrado ao CPP como `extraProductionCost`.

---

## 3. Detalhamento e Formação do CPP (Custo de Produção do Período)

O **CPP** é a soma de todos os recursos econômicos consumidos para manufaturar mercadorias ao longo do ciclo. Ele é decomposto rigidamente em três pilares contábeis:

$$\text{CPP} = \text{Matéria-Prima Consumida (MP)} + \text{Mão de Obra Direta (MOD)} + \text{Custos Indiretos de Fabricação (CIF)}$$

---

### A. Matéria-Prima Consumida (MP)
Reflete o custo líquido (expurgado do IVA recuperável) de todos os insumos consumidos na fabricação de mercadorias no período.

1.  **Orquestração de Suprimentos:**
    O abastecimento de consumos fábrica segue uma esteira de priorização física estruturada:
    *   **Passo 1:** Consumo do Estoque Inicial de Matérias-Primas.
    *   **Passo 2:** Consumo de Compras Planejadas ativas na rodada.
    *   **Passo 3:** Ativação Automática de **Compra de Emergência** caso o estoque inicial somado às compras planejadas não cubra as necessidades produtivas pautadas pelo nível de atividade do operador. As compras emergenciais sofrem um acréscimo de ágio estipulado por `special_purchase_premium`.

2.  **Encargos Financeiros de Compra:**
    A decisão do tipo de pagamento influencia diretamente o custo de aquisição. Condições parceladas ou a prazo incluem juros de fornecedor (`supplier_interest_rate`), impactando o valor patrimonial da matéria-prima estocada e consumida.

3.  **Equação de Valoração da MP Consumida:**
    Calcula-se o Preço Médio Líquido de Matéria-Prima Consumida de MP-A (`avgNetMpaPrice`) e MP-B (`avgNetMpbPrice`):
    *   Consumo Total de MP-A = $\text{Unidades Produzidas} \times 3 \times \text{avgNetMpaPrice}$
    *   Consumo Total de MP-B = $\text{Unidades Produzidas} \times 2 \times \text{avgNetMpbPrice}$
    *   **Custo Total de Matéria-Prima Consumida (MP):**
        $$\text{Total MP} = (\text{Unidades Produzidas} \times 3 \times \text{avgNetMpaPrice}) + (\text{Unidades Produzidas} \times 2 \times \text{avgNetMpbPrice})$$

---

### B. Mão de Obra Direta (MOD)
Compreende todos os salários, encargos, benefícios e indenizações diretamente vinculados aos operadores responsáveis pela manufatura dos produtos.

1.  **Mão de Obra de Fábrica Base:**
    Calculada partir dos operadores requeridos (`operatorsRequired`), salário-base atual (`currentSalary`) e nível de atividade de produção (`activityLevel`):
    $$\text{payrollMOD} = \text{operatorsRequired} \times \text{currentSalary} \times \text{activityLevel}$$

2.  **Encargos Sociais e Benefícios:**
    *   **Encargos Sociais:** Incidência tributária programática sobre a folha de pagamento base:
        $$\text{socialChargesMOD} = \text{payrollMOD} \times (\text{socialChargesAttr} - 1)$$
    *   **Prêmio de Produtividade:** Prêmio eventual concedido voluntariamente pela gestão:
        $$\text{productivityBonus} = \text{payrollMOD} \times \left(\frac{\text{productivityBonusPercent}}{100}\right)$$

3.  **Hora-Extra (Produção Extra):**
    Sobretaxa decorrente de produção acima de 100% da capacidade nominal (turno extra):
    $$\text{extraProductionCost} = \text{Fração de Produção do Turno Extra} \times 1.5_{\text{fator}} \times \text{MOD Base}$$

4.  **Indenizações Rescisórias de Pessoal Fabril:**
    Custos de desligamento de operadores fabris no período:
    $$\text{Rescisão} = \text{Indenização de Desligamento} + \text{PPR Proporcional para Desligados}$$

5.  **Custo Total de Mão de Obra Direta (MOD Completa):**
    No Custeio por Absorção, a conta da MOD incorpora todos os dispêndios laborais ativos e indenizações da fábrica:
    $$\text{MOD Completa} = \text{payrollMOD} + \text{socialChargesMOD} + \text{productivityBonus} + \text{extraProductionCost} + \text{Rescisão}$$

---

### C. Custos Indiretos de Fabricação (CIF)
Os Custos Indiretos de Fabricação acumulam todos os serviços corporativos necessários para dar suporte e viabilidade ao parque de manufatura nas suas operações diárias:

1.  **Manutenção das Máquinas:** Custo de manutenção preventiva e periódica indexada à infraestrutura operacional ativa e inflação do período:
    $$\text{Manutenção} = \text{Capacidade Nominal} \times 2.5 \times \text{inflationMult}$$

2.  **Despesas de Treinamento:** Realizadas no caso de aquisições de novos modelos de equipamentos (CAPEX) para calibrar a produtividade, com percentual estipulado sobre a folha líquida produtora:
    $$\text{Treinamento} = \text{payrollMOD} \times \left(\frac{\text{trainingPercent}}{100}\right)$$

3.  **Custo de Estocagem (Armazenagem):** Custos logísticos calculados sobre as posições de estoque remanescentes físicas nas duas frentes de matérias-primas (MP-A/MP-B) e estoques não liquidados de produtos acabados (PA) do período:
    $$\text{Estocagem} = (\text{Qtd Final PA} \times \text{Preço Unit. Armaz. PA}) + (\text{Qtd Final MPA} \times \text{Preço Unit. Armaz. MP}) + (\text{Qtd Final MPB} \times \text{Preço Unit. Armaz. MP})$$

4.  **Depreciação Industrial (Imobilizado do Parque):**
    *   **Depreciação de Máquinas:** Custo financeiro calculado individualmente para as máquinas operacionais ativas baseado no custo de aquisição e tempo de vida útil econômica útil.
    *   **Depreciação Predial:** Desgaste linear estipulado em 0.2% do valor contábil histórico das edificações de galpões fabris:
        $$\text{Depreciação Predial} = \text{Valor Histórico das Instalações} \times 0.002$$

5.  **Custo Total de Custos Indiretos (CIF Completo):**
    De acordo com a nossa governança e conformidade internacional societária (SAP/Oracle):
    $$\text{CIF Completo} = \text{Depreciação de Máquinas/Instalações} + \text{Manutenção} + \text{Treinamento} + \text{Estocagem}$$

Desta forma, o **CPP** acumula-se por:
$$\text{Total CPP} = \text{Total MP Consumida} + \text{MOD Completa} + \text{CIF Completo}$$

---

## 4. Gestão de Estoque e Cálculo de CPV (Método Kardex-WAC)

A valoração estruturada do fluxo físico-financeiro de Estoques segue o protocolo WAC (**Weighted Average Cost** - Custo Médio Ponderado / Média Ponderada Móvel).

**Fluxo:**
- Estoque Inicial + Produção (CPP) → Lote Disponível
- WAC Unitário = Valor Total Disponível / Quantidade Total
- CPV = Quantidade Vendida × WAC Unitário
- Estoque Final = (Quantidade Total - Vendida) × WAC Unitário

```
   [Estoque Inicial PA] (Valores Retidos)
             │
             ├────────────────► (+) [Produção do Período] (CPP total)
             ▼
   [Lote de Mercadoria Disponível para Venda] 
   (Total Qtd = Estoque Inicial Qtd + Unidades Produzidas)
   (Total Valor = Estoque Inicial Valor + Custo CPP)
             │
             ├────────────────► Cálculo do Custo Unitário Médio Ponderado (WAC):
             │                  WAC = Total Valor / Total Qtd
             │
             ├─────────► Vendas Realizadas ───────► CPV = Qtd Vendida * WAC
             ▼
   [Estoque Final PA] (Qtd Restante * WAC) ───► Balanço Patrimonial (Ativo)
```

1.  **Agregação do Lote Disponível:**
    *   $\text{Quantidade Total para Venda (Lote)} = \text{Quantidade Estoque Inicial de PA} + \text{Unidades Produzidas (Período)}$
    *   $\text{Valor Contábil Total Disponível} = \text{Preço de Custo de Estoque Inicial} + \text{CPP total do Período}$

2.  **Cálculo da Média Ponderada Móvel (WAC Unitário):**
    O custo médio que valora todas os itens de forma equânime é extraído pela razão:
    $$\text{WAC Unitário} = \frac{\text{Contábil Total Disponível}}{\text{Quantidade Total de Lote}}$$

3.  **Valoração e Baixa Contábil (Formação do CPV):**
    *   **Custo de Mercadorias Vendidas (CPV total):** Dá-se a baixa do estoque e registra-se o impacto no DRE:
        $$\text{Total CPV} = \text{Quantidade Efetivamente Vendida} \times \text{WAC Unitário}$$
    *   **Estoque Final de PA (Balanço Patrimonial):** Contabilizado no Ativo Circulante:
        $$\text{Quantidade de Estoque Final} = \text{Quantidade de Lote} - \text{Quantidade Efetivamente Vendida}$$
        $$\text{Valor Patrimonial de Estoque Final} = \text{Quantidade de Estoque Final} \times \text{WAC Unitário}$$

---

## 5. Desmembramento Contábil do CPV no DRE

Para prover transparência gerencial e aderência extrema aos padrões internacionais de relatórios do setor (SAP/Oracle), o CPV total faturado no DRE não é apresentado como uma conta monolítica de baixa. Ele é dividido proporcionalmente de acordo com a composição de custos fabris incorridos na produção (CPP):

1.  **Extração das Proporções Industriais (CPP Ratios):**
    *   Fração de Matéria-Prima: $R_{MP} = \frac{\text{Total MP}}{\text{Total CPP}}$
    *   Fração de Mão de Obra Direta: $R_{MOD} = \frac{\text{MOD Completa}}{\text{Total CPP}}$
    *   Fração de Custos Indiretos: $R_{CIF} = \frac{\text{CIF Completo}}{\text{Total CPP}}$

2.  **Desmembramento e Baixa nos Lotes Vendidos (DRE Accounts):**
    No ato de faturamento, a conta subtotalizadora `cpv` recebe as seguintes alocações refinadas que juntas perfazem exatos 100% do custo de baixa:
    *   **`dre.cpv_mp`** (Matéria-Prima Consumida Vendida):
        $$\text{dre.cpv\_mp} = - (\text{Total CPV} \times R_{MP})$$
    *   **`dre.mod`** (Mão de Obra Direta Vendida):
        $$\text{dre.mod} = - (\text{Total CPV} \times R_{MOD})$$
    *   **`dre.cif`** (Custos Indiretos de Fabricação Vendidos):
        $$\text{dre.cif} = - (\text{Total CPV} \times R_{CIF})$$

Isso garante correspondência e integridade absoluta na equação:
$$\text{cpv} = \text{dre.cpv\_mp} + \text{dre.mod} + \text{dre.cif}$$

---

## 6. Trânsito Contábil pelas Três Demonstrações

### 6.1 DRE (Regime de Competência)
- CPV desmembrado (MP + MOD + CIF) é baixado no momento da venda.
- Depreciação parcialmente incluída no CIF.

### 6.2 Balanço Patrimonial
- Estoques (MP + PA) valorizados por WAC no Ativo Circulante.
- Imobilizado líquido após depreciação acumulada.

### 6.3 Fluxo de Caixa (DFC)
- Registra saídas reais: pagamento de MOD, Manutenção, Treinamento, Estocagem, Compras de MP e CapEx.
- Depreciação é adicionada de volta (non-cash).

---

## 7. Gestão Financeira, Financiamentos e Provedores do Mercado (v19.10)

O Empirion disponibiliza três classes de crédito estruturadas para suportar as necessidades operacionais e de investimento das equipes (CapEx e OpEx):

### A. Empréstimo Normal (Requisitado Manualmente)
*   **Finalidade:** Suporte programado ao Capital de Giro (NCG) ou folga operacional.
*   **Prazo (Term):** Escolha estipulada pela equipe (1, 2 ou 3 rodadas) na aba de Decisões de Finanças.
*   **Taxa de Juros ao Período:** Baseada no cenário macroeconômico (Selic/TR) acrescida do **Spread Fiduciário de Risco (Rating Spread)**:
    $$\text{Taxa de Juros (Normal)} = \text{Taxa TR \%} + \text{Spread de Rating (Risk Spread) \%}$$
*   **Amortização Constante (SAC):** O valor principal é diluído de forma constante sobre os rounds restantes:
    $$\text{Amortização} = \frac{\text{Saldo Devedor Atual}}{\text{Rounds Restantes}}$$

### B. Financiamento de Máquinas (BDI)
*   **Finalidade:** Financiar a aquisição de novas máquinas operacionais (CAPEX).
*   **Prazo e Carência:** 8 Rodadas de prazo com **4 rodadas de carência inicial (Grace Period)**.
*   **Durante a Carência:** A equipe paga apenas o encargo financeiro (juros incidentes sobre o saldo devedor integral); nenhuma amortização de principal ocorre.
    $$\text{Prestações (Carência)} = \text{Saldo Devedor} \times \text{Taxa TR \%}$$
*   **Após a Carência (Pós-Carência):** O saldo devedor é liquidado linearmente em parcelas constantes ao longo das 4 rodadas subsequentes.
    $$\text{Amortização} = \frac{\text{Saldo Devedor}}{\text{Remaining Rounds (4)}}$$

### C. Empréstimo Compulsório / Emergencial (De Liquidez Automática)
*   **Finalidade:** Socorrer emergencialmente o caixa da empresa em caso de saldo negativo temporário ao final de uma rodada (quebra de caixa contábil).
*   **Prazo:** Curto prazo severo – com vencimento e amortização INTEGRAL programada já no ciclo subsequente (1 round de prazo).
*   **Taxa de Juros Punitiva (Penalty Rate):** Desenvolvida sob alta sobretaxa fiduciária e ágios punitivos para penalizar severamente a inércia de controladoria do operador:
    $$\text{Taxa de Juros (Compulsório)} = \text{Taxa TR \%} + \text{Ágio de Compulsório \%} + \text{Spread de Rating \%} + 5.0\%_{\text{Sobretaxa Punitiva de Default}}$$
*   **Amortização:** 100% amortizado no período seguinte:
    $$\text{Amortização} = \text{Saldo Devedor Atual}$$

---

### D. Tabela Oficial de Spread de Rating Fiduciário (Corporate Risk Spreads)

O custo do capital das operações de crédito da equipe é dinamicamente atrelado à excelência de suas métricas econômicas e rating fiduciário vigente calculado na central de inteligência empresarial:

| Rating | Spread de Risco Adicional (% ao período) |
| :---: | :---: |
| **AAA** | + 1.5% |
| **AA** | + 2.0% |
| **A** | + 2.5% |
| **BBB** | + 3.5% |
| **BB** | + 4.5% |
| **B** | + 6.0% |
| **CCC** | + 8.0% |
| **CC** | + 10.0% |
| **C** | + 12.0% |
| **D** | + 15.0% |

---

### E. Penalidade Sistêmica de Default (Capacidade de Alavancagem e Impacto E-SDS)

Empresas que incorrerem em quebra de caixa e requererem **Empréstimo Compulsório** sofrem as seguintes punições de governança fiduciária:
1.  **Rebaixamento e Cap do Rating de Crédito:** O rating fiduciário corporativo é sumariamente rebaixado e limitado ao teto **D** (Default/Distressed zone) no round em que houver compulsório ativo.
2.  **Sinal de Risco na Alavancagem:** Para cálculo do Z-Score de Kanitz, o passivo circulante de quebra de caixa (`loans_st`) de compulsório recebe um acréscimo multiplicador punitivo de **+50%** de ponderação no passivo para cálculo do indicador de dependência de capital de terceiros (`x5`), derrubando o score geral de solvência de Kanitz e as métricas estruturais do E-SDS.

---

## 8. Gestão de Tributos e Provedores do Mercado
- **Tributação Corporativa:**
  - Imposto de Renda Provisão (IR): Alíquota nominal de 25% calculada sobre o lucro do período (LAIR).
  - Impostos Indiretos (IVA): Mecanismo de crédito/débito incidente na circulação comercial de produtos e insumos.
  - Dividendos Obrigatórios: Distribuição legal prioritária fixada em 25% do lucro líquido gerado.
- **Participação nos Resultados (PPR):** Estipulada pela governança corporativa na faixa de 0% a 20% aplicados sobre o Lucro Antes do IR (LAIR).

---

## 9. Avaliação de Desempenho (Métricas e Relatórios)
- **TSR (Total Shareholder Return):** Composto pelo crescimento patrimonial ponderado pelas distribuições e valorização histórica do equity. Principal diretriz de competitividade.
- **E-SDS Score:** Algoritmo dinâmico de avaliação com 6 pilares de integridade financeira baseado em faixas alertivas de cores (Azul, Verde, Amarelo, Laranja, Vermelho).
- **Z-Score de Solvência:** Combinação estatística paramétrica baseada no Altman Z''-Score de emergentes e no Kanitz Index para blindagem tática contra inadimplências.
- **Venda a Prazo & Risco de Crédito:** Vendas com prazos alongados promovem a aceleração de penetração de mercado fabril, contudo, criam maior necessidade de financiamento de giro operacional (NCG) e ativam provisões estatísticas de créditos de liquidação duvidosa (PECLD).

---

## 10. Regras de Financiamento e Crédito

### 10.1 Empréstimos Normais (Voluntários)

- Decididos pela equipe no Step Financeiro.
- Taxa final = Taxa Base + Spread por Rating de Crédito.
- Spreads:
  - AAA: +1.5%
  - AA/A: +2.5%
  - B: +6.0%
  - D (Default): +15.0%

**Contabilização:**
- DFC: Entrada imediata (`cf.inflow.loans_normal`).
- DRE: Juros como despesa financeira.
- BP: Registrado em Passivo (Circulante / Não Circulante).

### 10.2 Financiamento de Máquinas (CapEx com Carência)

- Possui período de carência configurável (padrão 2-4 rodadas).
- Durante carência: paga apenas juros.
- Após carência: amortização (PRICE ou SAC).

**Contabilização:**
- Ativo: + Imobilizado (máquina).
- Passivo: + Financiamento.
- DRE: Juros + Depreciação (CIF).
- DFC: Saída de juros durante carência; juros + amortização depois.

### 10.3 Empréstimos Compulsórios

- Ativados automaticamente quando caixa projetado < 0.
- Taxa punitiva: Taxa Base + Spread Rating + 5.0% flat de sobretaxa.
- Amortização preferencial na rodada seguinte.
- **Consequências:**
  - Rebaixamento automático para Rating D.
  - Penalidade de +50% no peso da dívida para cálculo de alavancagem e E-SDS.
  - Impacto negativo forte nos scores de solvência.

**Contabilização:**
- DFC: Entrada emergencial + forte saída na rodada seguinte.
- DRE: Juros elevados.
- BP: Passivo Circulante com peso majorado.

---

**Histórico de Versões**

- **v19.10** (25/05/2026) – Diferenciação analítica de Empréstimos Normais vs. Compulsórios, taxas por Rating Spreads, cap punitivo no rating corporativo e novo Cronograma de Amortização de Dívidas projetado (3 rounds).
- **v19.9** (24/05/2026) – Desmembramento completo de MOD e CIF + regras de Absorção.
- **v19.8** – Implementação do Kardex-WAC.
- **v19.5** – Validação tripla contábil.

**Aprovado por:** Oracle Accounting Strategos  
**Status:** Regra Viva do Sistema Empirion-2