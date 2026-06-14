# Regras de Negócio Core - EMPIRION

**Versão:** v19.84 Obsidian Diamond Enterprise  
**Data:** 09 de Junho de 2026  
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

2.  **Encargos Financeiros de Compra (Proporcionalidade Contábil v19.12):**
    A decisão do tipo de pagamento influencia diretamente o custo de aquisição. Condições parceladas ou a prazo incluem juros de fornecedor (`supplier_interest_rate`), calculados estritamente sobre o **saldo devedor proporcional de principal remanescente por período**:
    *   **À vista (paymentType 0):** Sem encargos. Juros = 0.
    *   **À vista + 50% (paymentType 1):** Entrada correspondente a 50% pura sem encargos. Os 50% restantes (Parcela 2 em T+1) acumulam juros de 1 período:
        $$\text{P2}_{T+1} = \frac{\text{V\_base}}{2} \times (1 + \text{supplier\_interest\_rate})$$
        Fator de juros agregado no custo de estoque: $1 + 0.5 \times \text{supplier\_interest\_rate}$.
    *   **À vista 34% + 33% + 33% (paymentType 2):** Entrada de 34% pura sem encargos. As parcelas subsequentes pagam juros sobre os saldos devedores de principal anteriores:
        *   **Parcela 2 (T+1):** Amortização de 33% de principal + Juros sobre o saldo devedor de principal de 66% por 1 período:
            $$\text{P2}_{T+1} = \text{V\_base} \times (0.33 + 0.66 \times \text{supplier\_interest\_rate})$$
        *   **Parcela 3 (T+2):** Amortização de 33% de principal + Juros sobre o saldo devedor remanescente de 33% por mais 1 período:
            $$\text{P3}_{T+2} = \text{V\_base} \times (0.33 + 0.33 \times \text{supplier\_interest\_rate})$$
        Fator de juros agregado no custo de estoque: $1 + 0.99 \times \text{supplier\_interest\_rate}$.
    
    Toda a lógica foi parametrizada tanto no motor de simulação contábil quanto nas telas de relatórios visuais (Z-Guard e RightPreviewPanel) assegurando perfeita consistência matemática ao nível do centavo na reconciliação tripla.

3.  **Equação de Valoração da MP Consumida:**
    Calcula-se o Preço Médio Líquido de Matéria-Prima Consumida de MP-A (`avgNetMpaPrice`) e MP-B (`avgNetMpbPrice`):
    *   Consumo Total de MP-A = $\text{Unidades Produzidas} \times 3 \times \text{avgNetMpaPrice}$
    *   Consumo Total de MP-B = $\text{Unidades Produzidas} \times 2 \times \text{avgNetMpbPrice}$
    *   **Custo Total de Matéria-Prima Consumida (MP):**
        $$\text{Total MP} = (\text{Unidades Produzidas} \times 3 \times \text{avgNetMpaPrice}) + (\text{Unidades Produzidas} \times 2 \times \text{avgNetMpbPrice})$$

---

### B. Mão de Obra Direta (MOD)
Compreende todos os salários, encargos, benefícios e indenizações diretamente vinculados aos operadores responsáveis pela manufatura dos produtos.

1.  **Mão de Obra de Fábrica Base (alinhamento dinâmico de equipe real v19.84):**
    Calculada a partir dos operadores REAIS disponíveis de fato no ciclo (`operatorsAvailable = anterior + contratados - demitidos`), salário-base atual (`currentSalary`), nível de atividade de produção (`activityLevel`) e multiplicador de turnos extras (`modMult`):
    $$\text{payrollMOD} = \text{operatorsAvailable} \times \text{currentSalary} \times \text{activityLevel} \times \text{modMult}$$

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

### 2.1 Treinamento para Aquisição de Novos Modelos de Máquinas
- Sempre que a equipe adquirir **novos modelos de máquinas**, é obrigatório definir um percentual de investimento em Treinamento (`trainingPercent`).
- Este custo representa capacitação técnica específica para o novo equipamento.
- **Tratamento Contábil:**
  - **Fluxo de Caixa:** Registrado como saída direta em `cf.outflow.training` (pagamento a terceiros).
  - **Custeio:** Ativado como componente do **CIF** (Custos Indiretos de Fabricação).
  - **DRE:** Baixado proporcionalmente via `dre.cif` no CPV conforme as unidades produzidas forem vendidas.
  - **Balanço:** Integrado ao custo de ativação do ativo imobilizado ou ao estoque de produtos acabados.

3.  **Custo de Estocagem (Armazenagem):** Custos logísticos calculados sobre as posições de estoque remanescentes físicas nas duas frentes de matérias-primas (MP-A/MP-B) e estoques não liquidados de produtos acabados (PA) do período:
    $$\text{Estocagem} = (\text{Qtd Final PA} \times \text{Preço Unit. Armaz. PA}) + (\text{Qtd Final MPA} \times \text{Preço Unit. Armaz. MP}) + (\text{Qtd Final MPB} \times \text{Preço Unit. Armaz. MP})$$

4.  **Depreciação Industrial (Imobilizado do Parque):**
    *   **Depreciação de Máquinas:** Custo financeiro calculado individualmente para as máquinas operacionais ativas (incluindo as adquiridas no período vigente) baseado no custo de aquisição e vida útil comercial. A depreciação se inicia de imediato no próprio período de aquisição (P1 em diante).
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
- **Participação nos Resultados (PPR):** Estipulada pela governança corporativa na faixa de 0% a 10% aplicados sobre o Lucro Antes do IR (LAIR).

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

- Ativados automaticamente quando caixa projetado < 0, após esgotados os recursos das Aplicações Financeiras disponíveis.
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

### 10.4 Redoma de Caixa e Resgate Automático de Aplicações (v19.12)

Para mitigar o acionamento indesejado do traumático Empréstimo Compulsório e resguardar de forma proativa o Rating Fiduciário da equipe, o motor financeiro executa um algoritmo inteligente de governança corporativa:
- **Resgate Preventivo:** Caso o saldo de caixa projetado antes do compulsório (`cashBeforeCompulsory`) passe a ser negativo, o sistema varrerá preventivamente o saldo das aplicações financeiras acumuladas (`assets.current.investments`).
- **Absorção Parcial ou Integral:** O montante demandado para zerar o saldo negativo é automaticamente liquidado da aplicação corporativa e reinjetado na conta de caixa ativo.
- **Contabilização de Suporte:**
  - **DFC (Entradas):** Registrado fidedignamente sob a rubrica `cf.inflow.investment_withdrawal`.
  - **Balanço Patrimonial:** Reduz proporcionalmente o saldo consolidado de aplicações temporárias e eleva correspondente no caixa corrente, preservando a reconciliação tripla perfeita sem qualquer distorção fiscal.

---

## 11. Regime de Prédio Locado e Rateio de Aluguel (v19.25)

Sempre que a equipe / campeonato optar por operar no modelo de **Prédio Locado** (alugado/terceirizado) em vez de Prédio Próprio, aplica-se o tratamento fiduciário rigoroso de rateio do aluguel mensal básico pelo regime de Custeio por Absorção:

1. **Parâmetros de Entrada (Step 6 do Wizard):**
   - **Valor do Aluguel Mensal ($):** O valor nominal mensal a ser pago pelo estabelecimento arrendado.
   - **Percentual de Rateio Produtivo (CIF) (%):** A fração do espaço correspondente às linhas industriais.
   - **Percentual de Rateio Administrativo (Adm) (%):** A fração correspondente às dependências de backoffice.
   - **Percentual de Rateio de Vendas (Sales) (%):** A fração correspondente às estruturas de showroom/comercial.

2. **Validador de Consistência Fiduciária (Bloqueio Fiduciário):**
   - Para garantir correspondência perfeita nas demonstrações, **a soma desses três percentuais de rateio deve totalizar rigorosamente 100%**.
   - É apresentada uma verificação visual reativa e o avanço no Wizard do Tutor (Step 6) é estritamente **bloqueado** caso a soma resulte em qualquer valor divergente de 100%.

3. **Tratamento no Custeio por Absorção:**
   - **Rateio Produtivo (CIF):** Injetado no parque fabril de imediato como Custo Indireto de Fabricação (CIF), somando-se ao Custo de Produção do Período (CPP). Consequentemente, essa porção é capitalizada no Estoque de Produtos Acabados (Kardex) no Balanço Patrimonial e só deduzida como perda de competência (CPV) na DRE no momento da venda.
   - **Rateio Administrativo:** Reconhecido integralmente no round como despesa operacional de administração imediata na DRE (`dre.opex.adm`).
   - **Rateio Comercial:** Reconhecido integralmente no round como despesa de vendas imediata na DRE (`dre.opex.sales`).

4. **Trânsito por Fluxo de Caixa e Balanço Patrimonial:**
   - **DFC:** O desembolso real integral do aluguel mensal é executado sob uma rubrica unificada própria de saídas contábeis (`cf.outflow.rent`).
   - **Balanço Patrimonial:** Não resulta no reconhecimento de nenhum Ativo Imobilizado material para Edificação ou Terreno (não gera depreciação do prédio na demonstração), sendo eventual cap de instalações adicionais ativadas estritamente em "Instalações Industriais (locado)".

---

## 12. Mecanismo de Greve e Gestão de Clima Organizacional (v19.83)

O sistema de simulação do Empirion incorpora uma lógica estrita de comportamento humano e clima organizacional para os operários fabris (MOD). O acionamento de greves segue regras de tolerância social e inteligência de relações trabalhistas rígidas:

1. **Índice de Motivação & Nível "RUIM":**
   - O clima organizacional da fábrica é determinado pelo **Índice de Motivação** (`motivationIndex`) calculado em cada ciclo.
   - Sempre que o Índice de Motivação for inferior a **0.75**, o status de clima da força de trabalho é classificado como **"RUIM"** (`motivation_level = 'RUIM'`).

2. **Gatilhos de Ativação Consecutivos (Regra de Dois Rounds / Dupla Contingência):**
   - **Gatilho de Motivação RUIM:** Se a força de trabalho persistir por **2 rounds consecutivos** em clima **"RUIM"**, os trabalhadores iniciam greve.
     - *Rodada 1:* Dispara apenas o **Alerta de Greve**.
     - *Rodada 2:* Ativa a **Greve na Fábrica** (`strike_active = true`).
   - **Gatilho de Demissões Operacionais Consecutivas:** Caso a gestão realize demissões de operários da produção (`fired > 0`) em **2 rounds consecutivos**, o sindicato decreta greve imediata (`strike_active = true`) devido à acentuada instabilidade organizacional e clima severo de insegurança no trabalho.
     - *Rodada 1 com demissões:* Dispara um **Alerta de Insegurança**.
     - *Rodada 2 consecutiva com demissões:* Ativa a **Greve na Fábrica** (`strike_active = true`).
   - **Tratamento Fiduciário do Modo "START FROM ZERO" (Regra de Exclusão R-0):** 
     - No modo *Start from Zero*, o round inicial R-0 (Período de Abertura) é um round administrativo estruturante de setup e **não conta como rodada jogada**. 
     - Portanto, as contagens consecutivas tanto de motivação RUIM quanto de demissões são **reiniciadas em 0** quando se simula o Round 1 fiduciário. Não há sob qualquer hipótese ativação de greve imediata no Round 1 derivada de eventos simulados em R-0.

3. **Impacto Econômico e Operacional da Greve Ativa:**
   - **Paralisação de 50%:** Incide um fator de corte de **50% sobre toda a força produtiva** (`strikeFactor = 0.50`), afetando diretamente a equação de unidades fabricadas na rodada:
     $$\text{unitsProduced} = \text{Math.floor}(\text{effectiveCapacity} \times \text{activityLevel} \times \text{productivityIndex} \times 0.50)$$
   - **Placas de Avisos Segmentadas:** O cockpit exibe o aviso do sindicato correspondente ao gatilho ativo (Seja motivacional, por demissões, ou ambos).

4. **Resolução e Encerramento da Greve:**
   - Para encerrar a greve imposta por motivação RUIM, a gestão precisa elevar a motivação $\ge 0.75$ por meio de salários competitivos ou melhores taxas de PPR.
   - Para encerrar a greve imposta por demissões operacionais, a gestão deve suspender novos desligamentos por pelo menos 1 rodada. 
   - A superação do fator causador zera as respectivas contagens (`consecutive_ruim_rounds = 0` / `consecutive_fired_rounds = 0`), restabelecendo imediatamente 100% da capacidade industrial.

---

**Histórico de Versões**

- **v19.84** (09/06/2026) – Alinhamento dinâmico contábil da folha de pagamento e encargos MOD com base na equipe real disponível (contratadas e desligadas do período) no kernel simulador, core preditivo e projeções em tempo real do HUD (HRStep.tsx).
- **v19.83** (08/06/2026) – Correção de isolamento fiduciário do R-0 Greenfield no "START FROM ZERO" e ativação de dupla contingência sindical por demissões operacionais consecutivas (2 rodadas de demissões consecutivas) regulamentada em BUSINESS_RULES.md e DOCUMENT.md.
- **v19.82** (06/06/2026) – Documentação das regras de ativação de greves para operários baseadas no Índice de Motivação consecutivos (< 0.75 por 2 rounds) e o respectivo impacto operacional de 50% de redução na fabricação.
- **v19.25** (28/05/2026) – Introdução de travas fiduciárias reativas com validador de rateio (soma = 100% mandatória), breakdown analítico expandido de aluguel por CIF x OPEX no drawer de preview e documentação oficial completa de locação em BUSINESS_RULES.md.
- **v19.12** (25/05/2026) – Harmonização completa do Fluxo de Caixa pelo Comitê Contábil (v19.12), introdução da Redoma de Caixa (resgate preventivo de aplicações financeiras para preservação de rating de crédito) e ativação rigorosa de Treinamento e Estocagem no CIF contábil (Absorção).
- **v19.10** (25/05/2026) – Diferenciação analítica de Empréstimos Normais vs. Compulsórios, taxas por Rating Spreads, cap punitivo no rating corporativo e novo Cronograma de Amortização de Dívidas projetado (3 rounds).
- **v19.9** (24/05/2026) – Desmembramento completo de MOD e CIF + regras de Absorção.
- **v19.8** – Implementação do Kardex-WAC.
- **v19.5** – Validação tripla contábil.

**Aprovado por:** Oracle Accounting Strategos & Gestor de Gente & Gestão Sênior  
**Status:** Regra Viva do Sistema Empirion-2