# 📘 Regras de Negócio do Projeto (BUSINESS_RULES.md)

Este documento centraliza as definições de negócios, fórmulas, restrições e diretrizes estratégicas que modelam o motor de simulação e o cockpit do simulador empresarial. Ele serve como a fonte de verdade absoluta para o desenvolvimento, contabilidade e inteligência comercial do projeto.

---

## 📅 Controle de Governança e Versionamento

- **Projeto:** EMPIRION ORACLE
- **Versão Ativa de Regras:** v2026.130
- **Responsável pela Governança:** Project Management Professional (PMP)
- **Time Multidisciplinar Responsável:**
  - **Contador Sênior:** CPC / IFRS e validação de relatórios contábeis/financeiros.
  - **Coodenador de Inteligência de Mercado:** Análise de concorrência e estratégias de penetração regional.
  - **Engenheiro de Software Sênior:** Arquitetura limpa, segurança e integridade do motor de cálculo.
  - **Engenheiro de Banco de Dados:** Normalização, concorrência e RLS.
  - **Arquiteto de UI/UX:** Apresentação elegante e acessível com micro-interações.

| Data | Versão | Autor | Alterações / Decisões Importantes |
| :--- | :--- | :--- | :--- |
| **18/06/2026** | `v2026.130` | *PMP & Equipe* | **Diretriz de Integridade Contábil-Financeira e Veto a Fallbacks Silenciosos.** Adicionada política de governança de dados rígida. Fica proibida a injeção unilateral de fallbacks "ocultos" ou geração de dados fictícios para encobrir buracos na simulação ou erros de carregamento na interface. Problemas de dados e erros de simulação devem ser investigados e tratados na raiz contábil, e falhas legítimas na UI devem ser visíveis ou informadas via loaders/warnings sem inventar números. |
| **18/06/2026** | `v2026.129` | *PMP & Equipe* | **Mapeamento do Efeito Tesoura e Dinâmica de Insolvência por Crescimento Desmedido (Overtrading).** Implementada no dashboard de gestão contábil a monitoração síncrona real-time multilinear a partir do round P-00 para identificar descompassos entre o crescimento de faturamento bruto e lucros e o descasamento dos prazos de financiamentos comerciais. Introduzidas as formulações do Ativo e Passivo Operacionais para determinação exata da Necessidade de Capital de Giro (NCG), do Capital de Giro Líquido (CDG) e do Saldo de Tesouraria (ST), em estrita conformidade com as normas CPC/IFRS. |
| **16/06/2026** | `v2026.128` | *PMP & Equipe* | **Algoritmo Concorrencial de Spillover por Ruptura de Estoque e Market Share de Entrega.** Corrigida a distorção contábil-operacional onde equipes que captavam demanda regional usando scores elevados de marketing/preço baixo mas falhavam em entregar unidades por inércia operacional (gargalo de operários ou insumos) "evaporavam" faturamento do campeonato e mantinham Market Share injustificado no painel. O simulador re-rateia a demanda não atendida (Ruptura/Stockout) aos demais concorrentes com estoque livre na região e computa o Market Share estritamente com base em volumes físicos de fato faturados e consolidados. |
| **14/06/2026** | `v2026.127` | *PMP & Equipe* | **Mapeamento Patrimonial e Delineação de CAPEX: Start from Zero vs. Start with Base.** Clarificação estrutural do comportamento do balanço e do market size sob abordagens táticas de fundação de empresas. No modo *Start from Zero*, as marcas iniciam exclusivamente com Capital Social e Caixa Física disponível — sem frota fabril inicial herdada do Round 0. Fica estabelecido o nexus de que o investimento e aprovação de CAPEX no Round 1 (adição de maquinário, custos de instalação técnica por modelo de máquina e amortizações de depreciação subsequentes) são os catalisadores soberanos e exclusivos que erguem o Ativo Imobilizado e constroem o Market Size de demanda regional na simulação. |
| **11/06/2026** | `v2026.126` | *PMP & Equipe* | **Generalização Multimoeda Dinâmica para Moeda-Base do Torneio.** |Multimoeda Dinâmica para Moeda-Base do Torneio.** Extensão do motor sob diretrizes do CPC 02 / IAS 21 para suportar qualquer moeda-base (BRL, USD, GBP, CNY) configurada pelo Tutor. O motor calcula dinamicamente as taxas de câmbio cruzadas (cross-rates) fallbacks e apura a variação cambial fiduciária (`fin.fx_variance`) para qualquer praça cuja moeda difira da moeda-base elegida consolidada. |
| **11/06/2026** | `v2026.125` | *PMP & Equipe* | **Tratamento Cambial CPC 02 / IAS 21 e Reconciliação Fiduciária Multimoeda.** Detalhamento técnico da conversão monetária de transações no exterior. As vendas e marketing/fretes em USD são convertidos a BRL com câmbio do round de transação. Variações cambiais subsequentes de parcelas a receber pendentes são lançadas em Resultado Financeiro no DRE (`fin.fx_variance`). Os cartões regionais no cockpit (mini-DRE) efetuam a lógica inversa (divisão) para CPV e Share Corporativo, mantendo exatidão de 100%. |
| **11/06/2026** | `v2026.124` | *PMP & Equipe* | **Saneamento Absoluto de Investimentos e CAPEX no Carry-Forward.** Alinhamento explícito exigindo que, no motor de recuperação por timeout automotivo, haja o zeramento absoluto de novas Aplicações Financeiras corporativas e toda a intenção de Compra de Máquinas de Qualquer Modelo (modelos Alfa, Beta e Gama) para resguardar a integridade de caixa físico disponível das marcas. |
| **11/06/2026** | `v2026.123` | *PMP & Equipe* | **Governança de Decisão por Timeout (Carry-Forward Automático).** Implementação do motor de recuperação e tratamento automático síncrono para equipes que não enviarem a decisão tempestivamente em virtude de estouro do timer de contagem regressiva. O motor de turnover clona a decisão do round anterior, expurga gastos não recorrentes/específicos (como Capex de maquinário e contratações do RH/empréstimos) e injeta como rascunho oficial ativo de simulação do round para manter a consistência contábil e de concorrência. |
| **11/06/2026** | `v2026.122` | *PMP & Equipe* | **Precificação Nominal Multi-moeda Regional.** Esclarecimento e documentação da regra de preenchimento de preços em praças de exportação/mercado externo. Fica estabelecido que o preço deve ser inserido sempre na moeda nominal de circulação configurada para a própria região (ex: USD), sem conversão prévia manual por parte da equipe, uma vez que o motor calcula os índices competitivos comparando com preços sugeridos expressos na mesma moeda e converge a receita total. |
| **11/06/2026** | `v2026.121` | *PMP & Equipe* | **Aprimoramento do Rateio Regional FRAE v2.** Reformulação do mini-DRE do *MarketingStep* integrando custos diretos regionais (marketing de praça e logística/frete) para obtenção do *Lucro de Contribuição Regional*, seguido do rateio das despesas holding consolidando 100% com a matriz. |
| **11/06/2026** | `v2026.120` | *PMP & Equipe* | **Sintetização da DRE Regional & Motor FRAE.** Simplificação do mini-DRE do *MarketingStep* com as 6 grandes linhas vitais de lucratividade e integração do método CPC 22 / IFRS 8 via *Motor de Rateio Regional Fiduciário* (FRAE) para reconciliação integral com o lucro consolidado e despesas comuns (folhas MOD/Adm/Vendas, P&D, PECLD, financeiro e tributário). |
| **11/06/2026** | `v2026.119` | *PMP & Equipe* | **Governança de Privacidade de Rascunhos.** Implementação de Row-Level Security (RLS) restrito nas tabelas de decisões para vedar leitura de rascunhos entre equipes em rounds ativos. |
| **10/06/2026** | `v2026.118` | *PMP & Equipe* | **Cálculo de DRE e Lucratividade Regional.** Adicionada a seção de custeio proporcional direto para medição de margem de contribuição e lucratividade líquida de vendas segregadas geograficamente. |
| **10/06/2026** | `v2026.117` | *PMP & Equipe* | **Criação do Documento.** Inclusão das regras de produtividade reduzida no round de aquisição de novas máquinas e detalhamento da fórmula do Market Size Dinâmico com variação conjuntural. |

---

## 1. 🏭 Parque Fabril & Produtividade na Aquisição de Novas Máquinas

A expansão de capacidade fabril através da compra ou substituição de maquinários (Alfa, Beta ou Gama) é um pilar estratégico essencial. No entanto, sua modelagem operacional simula com fidelidade o processo real de implementação industrial:

### Regra de Produtividade do Turno de Instalação (Calibração e Treinamento)

Quando uma equipe adquire novas máquinas em um round (Turno $N$):
1. **Disponibilidade Física imediata:** A máquina já consta no parque fabril e sua capacidade nominal é incluída no cálculo global de Tamanho de Mercado (Market Size).
2. **Gargalo Operacional no Turno de Setup:** No turno da aquisição (Turno $N$), a nova máquina **não opera com alta eficiência**. Ela passa por processos obrigatórios de:
   - Recebimento físico e logística interna.
   - Instalação técnica e calibração fina de hardware e automação.
   - Treinamento obrigatório de mão de obra direta (MOD) para adequação às especificidades do modelo.
3. **Preservação do Parque Existente:** O parque fabril preexistente (máquinas adquiridas em rounds anteriores à rodada atual) **não sofre impacto de produtividade** decorrente dessa calibragem, operando conforme os níveis de eficiência acumulados pela equipe (baseado no treinamento histórico, P&D e manutenção).
4. **Produtividade Plena nos Rounds Posteriores:** A partir do turno imediatamente seguinte (Turno $N+1$), com a equipe devidamente treinada e os equipamentos de setup concluídos, as novas máquinas passam a produzir à sua taxa máxima nominal (limitada apenas por fatores globais de desgaste natural e investimento em manutenção).

> ⚠️ **Alerta Estratégico:** As equipes devem estar cientes de que a decisão de comprar novas máquinas aumentará de imediato a capacidade instalada teórica e o Market Size global (TAM), mas o fluxo físico de entrada de mercadoria acabada (massa física estocada para venda imediata) no DRE/Caixa do round de compra sofrerá restrição pelo delay do setup físico do novo imobilizado.

### 🚀 Diferenciação Estratégica: Zero Mode (Start from Zero) vs. Tradicional (Start with Base)

O simulador suporta dois comportamentos distintos de infraestrutura e contabilidade no início do torneio:

1. **Modo Tradicional (Start with Base / Start with Running):**
   - As empresas herdam um balanço histórico consolidado (`INITIAL_MACHINES_P00`) contendo **5 máquinas Alpha** operacionais herdadas do Round 0.
   - Existe uma base instalada de capacidade inicial ($10.000$ unidades por equipe) que garante a existência de um tamanho de mercado inicial no Round 1, mesmo que nenhuma equipe invista em CAPEX adicional.

2. **Modo de Fundação (Start from Zero):**
   - As empresas iniciam as suas atividades puramente com **Caixa e Ativo Circulante (Capital Social)** obtido dos acionistas ($5.000.000,00$ ou valor configurado).
   - **Frota Inicial de Máquinas:** ZERADA. Nenhuma máquina Alfa, Beta ou Gama pré-existe no parque fabril das equipes concorrentes.
   - **A Força do CAPEX no Round 1:** Sob este modo, os investimentos realizados em CAPEX durante o Round 1 são os **únicos catalisadores** que criam os Ativos Imobilizados tangíveis e erguem a capacidade industrial do mercado (consequentemente determinando e criando o Market Size físico de demanda). 
   - **Custo de Instalação e Equipamentos:** Cada aquisição reverte em:
     - Ativação do valor de compra das máquinas no Ativo Não Circulante Imobilizado.
     - Prédios e Instalações Industriais adicionadas.
     - Início das provisões de depreciação mensal sobre a frota instalada no encerramento do período.
     - Alocação do fluxo financeiro como saída das Atividades de Investimento (Dfc / CAPEX) de forma isolada e limpa (sem heranças de passivos ou CAPEX residual de rounds passados).

---

## 2. 📊 Algoritmo do Market Size Dinâmico por Região (TAM)

O **Market Size Regional** (Tamanho Total de Endereçamento de Mercado) não é um valor estático e isolado de cada equipe concorrente. No modelo centralizado, ele representa o volume total real de demanda disponível para ser fatiada entre os competidores com base em fatores populacionais, pesos demográficos, excedentes de demanda programados pelo Tutor e variações macroeconômicas cíclicas do turno.

### Fórmula de Cálculo Centralizada

Para cada região do torneio, o cálculo do Market Size is estruturado a partir das seguintes variáveis:

$$\text{Tamanho do Mercado Geográfico (Market Size)} = \left[ \sum \text{Capacidade Nominal 100\% de Todas as Equipes} \right] \times \frac{\text{Peso da Região \%}}{100} \times \left(1 + \frac{\text{Variação de Demanda do Turno \%}}{100}\right)$$

#### Onde:
- **Soma das Capacidades Nominais:** A soma da capacidade produtiva das máquinas operando a 100% de todas as marcas/empresas registradas competindo no torneio.
  - *Exemplo:* Em uma arena com $4$ equipes, tendo cada empresa $12.000$ unidades de capacidade máxima de equipamentos ativa, a base agregada é de $48.000$ unidades produtivas em $100\%$.
- **Peso de Demanda de cada Região (Parametrizado pelo Tutor):** A soma geográfica dos pesos definidos no painel do Tutor tradicionalmente totaliza $120\%$, representando uma demanda de excedente natural de mercado (20% adicionais sobre a capacidade teórica agregada em condições 100% ideais de mercado).
  - *Distribuição Tradicional:* SUL ($40\%$), SUDESTE ($30\%$), CENTRO-OESTE ($25\%$), NORDESTE ($15\%$), NORTE ($10\%$) = Soma de $120\%$.
  - Sem a variação do turno, essa soma equivale a $48.000 \times 1,2 = 57.600$ unidades de Demanda Total de Mercado.
- **Variação de Demanda Conjuntural (Indicadores Gerais de Mercado):** É a variação infligida a cada turno, representando flutuações macroeconômicas (expansão, PIB, recessão ou sazonalidade definida pelo Tutor no cenário).
  - *Exemplo do Round 1:* Com a demanda variando em **$+8\%$** conjunturalmente, a demanda base de $57.600$ unidades é elevada em mais $8\%$:
    $$57.600 \times (1 + 0,08) = 60.480 \text{ unidades de Market Size Global}$$

### Rateio por Região no Round 1 (Aplicação Matemática)

Com base nos parâmetros da rodada atual e os pesos definidos pelo Tutor:
- **Tamanho Total de Mercado Agregativo (TAM):** $60.480$ unidades.
- **Distribuição Geográfica de Vendas Real:**
  - **SUL ($40\%$):** $60.480 \times 0,40 = 24.192$ unidades de Market Size Regional.
  - **SUDESTE ($30\%$):** $60.480 \times 0,30 = 18.144$ unidades de Market Size Regional.
  - **CENTRO-OESTE ($25\%$):** $60.480 \times 0,25 = 15.120$ unidades de Market Size Regional.
  - **NORDESTE ($15\%$):** $60.480 \times 0,15 = 9.072$ unidades de Market Size Regional.
  - **NORTE ($10\%$):** $60.480 \times 0,10 = 6.048$ unidades de Market Size Regional.
  - **Soma Consolidada das Demandas:** $60.480$ unidades.

### Captura Competitiva de Demanda (Market Share Concorrencial)

1. **Pontuação Competitiva da Equipe (Competitiveness Score):** Cada equipe atrai uma fatia do mercado regional com base nas suas decisões comerciais: preço ofertado da rodada, investimento em campanhas de marketing locais e prazo de recebimento estipulado aos clientes.
2. **Capacidade Máxima e Logística Física (Estoque PA):** A demanda máxima que cada equipe de fato consegue *vender* na região sofre limite superior com base na soma do estoque inicial de mercadoria (PA) e as unidades físicas produzidas no turno corrente. O motor distribui de forma proporcional ao atrativo do produto quando as equipes têm escassez física de fornecimento (Kardex-WAC do motor de simulação).

---

## 3. 🗺️ DRE por Geolocalização & Lucratividade Líquida Regional (Método FRAE v2 - CPC 22 / IFRS 8)

Com o objetivo de dotar as equipes com alta capacidade analítica de inteligência de negócios, o Cockpit simula e apresenta uma Demonstração de Resultado do Exercício (DRE) regionalizada e conciliada baseada na geolocalização dos volumes físicos faturados e nas contas corporativas unificadas.

### Modelo Analítico de Margem Geográfica (FRAE v2)

Para cada região $R$, as linhas contábeis são estruturadas em tempo de cockpit de forma a diferenciar despesas locais diretas das despesas gerais da holding:

1. **Receita Bruta Regional ($R_B$):**
   $$R_B = Q \times P_{\text{regional}}$$
   *(Unidades Físicas vendidas na região $\times$ Preço estipulado na decisão).*
2. **Receita Líquida Regional ($R_L$):**
   $$R_L = R_B - T_{\text{IVA\_regional}}$$
   *(Receita Bruta deduzida do imposto IVA faturado na própria praça).*
3. **Custo do Produto Vendido (CPV) Alocado:**
   $$CPV_{\text{alocado}} = Q \times \text{Custo Unitário Histórico do Período (WAC)}$$
   *(Custo de produção amortizado por absorção sobre as unidades entregues).*
4. **Lucro Bruto Regional:**
   $$\text{Lucro Bruto} = R_L - CPV_{\text{alocado}}$$
5. **(-) Despesas Diretas Regionais de Operação:**
   - **Marketing Local ($Mkt_{\text{regional}}$):**
     $$Mkt_{\text{regional}} = \text{Campanhas locais} \times \text{Custo Unitário Ajustado pelo Turno}$$
   - **Logística e Frete ($Log_{\text{regional}}$):**
     $$Log_{\text{regional}} = Q \times \text{Custo de Transporte Unitário Ajustado da Região}$$
6. **(=) Lucro de Contribuição Regional ($LC_{\text{regional}}$):**
   $$LC_{\text{regional}} = \text{Lucro Bruto} - Mkt_{\text{regional}} - Log_{\text{regional}}$$
   *Este indicador revela a real eficiência física e comercial de precificação, marketing e penetração de cada praça, variando livremente de acordo com as campanhas e logística locais.*
7. **(-) Despesas Holding Rateadas ($DCR_{\text{regional}}$):**
    As despesas corporativas que não são associáveis diretamente às praças (como Folha Corporativa ADM/Vendas, PECLD, P&D, Resultado Financeiro, Resultado Não Operacional e Tributos Consolidados sobre a Renda) são rateadas fiduciariamente com base na representatividade de faturamento líquido de cada região:
    $$DCR_{\text{regional}} = \text{Despesas Indiretas Holding} \times \left( \frac{R_{L\_regional}}{R_{L\_consolidado}} \right)$$
    Onde:
    $$\text{Despesas Indiretas Holding} = \sum_{r} LC_{r} - LL_{\text{consolidadoMatriz}}$$
8. **(=) Lucro Líquido Regional ($LL_{\text{regional}}$):**
    $$LL_{\text{regional}} = LC_{\text{regional}} - DCR_{\text{regional}}$$
    *Garante conciliação exata de $100\%$ entre a soma das regiões e a demonstração financeira consolidada na Matriz Holding.*
9. **Margem Líquida Regional (\%):**
    $$\text{Margem Líquida Regional \%} = \frac{LL_{\text{regional}}}{R_L} \times 100$$

### 💱 Governança Cambial: Tratamento de Moedas Locais de Praças de Exportação (CPC 02 / IAS 21)
Em cenários onde o Tutor parametriza uma região com moeda de circulação estrangeira (ex: **USD - Dólar** ou **EUR - Euro**) em arenas cuja moeda corporativa padrão é **BRL**:
- **Digitação Nominal Direta:** As equipes devem digitar o Preço Unitário de Venda no cockpit (`MarketingStep`) diretamente na **moeda nominal local** correspondente exibida pelo campo e sugerida para aquela praça de exportação (ex: digitar `120` se o preço nominal sugerido pelo mercado local for `USD 120,00`).
- **Conversão de Transações:** No DRE e balanço consolidado em BRL, a conversão das receitas, impostos locais, e despesas de marketing/distribuição comercial locais da região correspondente é feita pela taxa de câmbio histórica da rodada em que ocorreu a transação (EMPIRION: cotação do período de decisão do round).
- **Variações Cambiais de Saldo a Receber (Contas a Receber - Clientes):** Para vendas a prazo, a rubrica de Ativo Circulante (Clientes) é updated a cada rodada pela cotação de encerramento do novo período (câmbio de fechamento). A diferença decorrente da oscilação do câmbio sobre as parcelas já faturadas no passado e ainda pendentes de recebimento é reconhecida imediatamente no DRE sob a conta **`fin.fx_variance`** *(+/-) Variações Cambiais (Ativa/Passiva — Resultado Financeiro)*, refletindo com fidedignidade o impacto patrimonial na saúde financeira da holding. No caixa consolidado (DFC), essa variação também é acrescida/deduzida nos recebimentos de vendas (`cf.inflow.term_sales`).
- **Modelagem de Rateio Fiduciário Reverso (FRAE v2 - Align):** Para assegurar que o mini-DRE de cada região no cockpit no *MarketingStep* exiba dados nominalmente coerentes com a moeda daquela praça (ex: tudo em USD para a região americana):
  - Linhas de custo ou despesa originalmente calculadas na moeda base BRL da Matriz (como CPV/WAC de fabricação nacional e a fatia do rateio corporativo indireto corporativo) são convertidas de volta para a moeda regional local (dividindo pelo câmbio do round fechado).
  - Com isso, garante-se impecável integridade matemática e aderência aos relatórios segmentados de desempenho por região geográfica, impedindo distorções onde somas ou subtrações combinassem moedas nominalmente diferentes.

> 📈 **Importância de Negócio:** Através desse rateio fiduciário estruturado em conformidade com o pronunciamento de relatórios segmentados (**CPC 22 / IFRS 8**) e conversão de moeda (**CPC 02**), as marcas visualizam com exatidão a contribuição real líquida que cada praça traz para o grupo, sabendo se o volume de publicidade ou os fretes distantes de uma região específica estão de fato gerando fluxo de caixa líquido sadio de forma totalmente transparente e livre de ilusões de média consolidada.

---

## 4. 🔒 Confidencialidade e Governança de Decisões de Competidores (Rascunhos de Rounds)

Por questões éticas, segurança informacional e diretivas de Governança Estratégica do EMPIRION, as equipes inscritas jamais poderão acessar ou visualizar dados de decisões/rascunhos de outras equipes enquanto o round corrente estiver ativo/em andamento. 

### Diretrizes de Visibilidade Fiduciary (RLS & UI)
1. **Estudantes / Competidores:** Possuem isolamento estrito de leitura (direto via banco de dados e através da interface). Um jogador pertencente a uma equipe pode ler e gravar única e exclusivamente os registros e rascunhos correspondentes à sua própria marca (`trial_decisions` no modo Sandbox/Trial, ou `current_decisions` no campeonato pago).
2. **Tutores e Administradores:** Possuem autoridade e visibilidade irrestritas, podendo acessar simultaneamente os rascunhos de todas as equipes registradas no campeonato a qualquer momento antes do fechamento do round, servindo como auditores preventivos de concorrência.
3. **Observadores (Conselheiros):** Tutores podem credenciar usuários específicos como observadores oficiais do torneio. Licenciados através do perfil `role = 'observer'` ou declarados nominalmente por ID na coleção de observadores do campeonato (`championships.observers`), os Conselheiros possuem privilégio síncrono para visualizar as decisões pré-salvas e advertir e orientar os participantes sobre possíveis erros de formulação operacional.
4. **Resguardo de Algoritmos:** A barreira de segurança impossibilita qualquer vazamento que canibalize o mérito concorrencial das decisões de parque industrial, preços regionais ou investimentos em marketing.

---

## 5. ⏱️ Governança de Decisão por Timeout (Carry-Forward Automático)

Para resguardar os resultados contábeis, a concorrência leal de mercado e a fluidez do torneio acadêmico, o motor de turnover (`processRoundTurnover`) foi aperfeiçoado com um mecanismo resiliente de **Fiduciary Carry-Forward** caso alguma equipe humana atinja o timeout do cronômetro síncrono ou negligencie o envio final do formulário.

### Protocolo Operacional de Salvação por Inação:
1. **Intercepção de Ausência:** No início da rodada de simulação de turnover, caso a tabela (`trial_decisions` ou `current_decisions`) não possua nenhum registro submetido para a respectiva equipe no round sendo encerrado (`nextRound`), o motor inicia o protocolo automático.
2. **Clonagem e Higienização de Decisão:**
   - **Clonagem:** O motor busca na tabela de decisões o registro do round de origem anterior (`nextRound - 1`).
   - **Sanitização de CAPEX:** Zera todas as **compras/vendas e pedidos de aquisição de novos equipamentos fabris/maquinários de qualquer modelo (Modelos Alfa/Alpha, Beta e Gama/Gamma)**, assim como anula os IDs marcados para desinvestimentos pontuais de ativos imobilizados.
   - **Sanitização de RH:** Zera novos pedidos de contratação e demissões espontâneas (retornando a $0$ contratações/demissões líquidas).
   - **Sanitização de Finanças (Aplicações Financeiras & Empréstimos):** Anula totalmente qualquer **Aplicação Financeira** nova de caixa excedente (investments), assim como cancela solicitações de empréstimos táticos discricionários da rodada para proteger a liquidez do caixa e evitar distorções de rentabilidade geradas automaticamente.
   - **Sanitização de Prospecções:** Limpa as estimativas (forecasts) do oráculo para compelir recalibragem posterior no cockpit.
   - **Manutenção Comercial e de Operações:** Mantém os preços praticados por região (na moeda local nominal), níveis de publicidade da rodada anterior, e taxas de prazos concedidos que ditaram a saúde financeira do caixa.
3. **Persistência de Registro Oficial:** Se a equipe não possuir nenhuma decisão anterior (ex: ausente no Round 1), uma matriz padrão com preços unitários de mercado recomendados nas moedas das regiões é sintetizada. Em ambos os casos, a decisão hipotética higienizada é **persistida no banco de dados**, disponibilizando o registro de auditoria para que os discentes compreendam detalhadamente quais métricas subsidiaram o resultado do novo round.

---

## 6. 🔒 Governança de Visibilidade e Controle de Templates P0 (Modo Trial vs. Oficial)

Com o objetivo de dotar a ferramenta de alta flexibilidade durante períodos de teste acadêmico e de rigores normativos estritos durante competições corporativas reais, o controle de visibilidade das formulações de balanço e simulação P0 (`p0_templates`) opera sob uma abordagem de transição de governança:

### Fase 1: Modo Trial / Sandbox (Colaboração Aberta)
- **Regra Geral:** Quer nas configurações industriais ativas quanto em novos modelos contábeis e operacionais táticos que venham a ser acoplados no simulador, **todos os templates são abertos para todos**.
- **Objetivo Prático:** Fomentar o aprendizado compartilhado, permitir que tutores convidados e estudantes analisem presets sugeridos uns dos outros de forma cooperativa, e acelerar o setup síncrono de cenários de teste complexos.
- **Implementação Técnica:** 
  - As queries de busca ao Postgres do Supabase em `getP0Templates()` não aplicam restrições de cláusulas de e-mail/ID (bypass do `tutor_id`) quando acionados em sessões marcadas como Trial.
  - A política de Row-Level Security (RLS) no Supabase é ajustada para leitura pública global (`FOR SELECT` e `FOR ALL` liberada para a role `public` quando marcadas como `is_public = true`), contornando rejeições para usuários não logados.
  - No fallback local híbrido via `LocalStorage`, dados gravados em diferentes navegadores sob a mesma máquina coexistem de forma a estender a resiliência do cockpit.

### Fase 2: Oficialização do Modo Campeonato (Isolamento Rígido)
- **Regra Geral:** Tão logo o campeonato ou os módulos entrem em vigor oficializado, o simulador passa a exigir **isolamento pleno e governança fiduciária rígida de templates**.
- **Objetivo Prático:** Garantir que um Tutor de uma instituição de ensino ou corporação competitiva não acesse, altere, delete ou plagie as predefinições de cenários exclusivos estruturados por outro Tutor participante de arenas concorrentes.
- **Implementação Técnica:**
  - **Filtro de Database:** O serviço de banco de dados ativa a cláusula `.eq('tutor_id', currentUser_id)` de forma mandatória com base no token JWT autenticado do usuário (`auth.uid()`).
  - **Higienização de LocalStorage:** Rotinas dinâmicas no frontend varrem o e-id local gravado em cache (`local_p0_templates`) e barram do fluxo todos os itens que não possuam autoria (`tutor_id`) coincidente com a sessão ativa.
  - **Higienização de Payload (Sanitization):** Toda gravação no Supabase passa pelo expurgo de chaves exclusivas de visual de interface (como `category` e `code`) de modo a impedir falhas de sincronização decorrentes de alteração de schema físico, salvaguardando o banco contra erros de REST API.

---

## 7. 🎯 Próximos Passos e Verificação de Sincronia

- [x] Unificação dos cálculos de estatísticas do Cockpit (`MarketingStep.tsx`) para usar o modelo demográfico dinâmico unindo com o peso estipulado pelo Tutor.
- [x] Unificação dos rótulos visuais para fins de usabilidade corporativa e facilidade de estudo dos alunos concorrentes.
- [x] Construção e deploy do painel interativo de DRE e Lucratividade Regional expandido por card de decisão para uso síncrono das marcas.
- [x] Blindagem e implementação de Row-Level Security (RLS) nas tabelas `trial_decisions` e `current_decisions` para impedir vazamento concorrencial de rascunhos.
- [x] Implementação integral do protocolo de Fiduciary Carry-Forward para salvação de decisões por estouro de timer (Timeout) síncrono.
- [x] Definição de Governança de Visibilidade Dinâmica de Templates (Modo Trial Aberto vs. Controle Rígido do Tutor Logado em Produção).
- [ ] Monitoramento constante de novas decisões de compra no Turno 2 pelas equipes para avaliar o impacto imediato na calibragem dos novos equipamentos instalados.
- [x] Correção de distorções de Market Share concorrencial através do algoritmo multi-passo de Stockout Demand Spillover.

---

## 8. 📈 Modelo Concorrencial de Spillover por Ruptura de Estoque (Stockout Demand Spillover) & Market Share Físico Concreto

Para blindar o Simulador Empirion contra assimetrias de concorrência e o fenômeno da "Equipe Fantasma" (empresas que captam demanda teórica vantajosa via marketing e preço baixo, mas produzem zero unidades em função de colapsos ou negligência operacional de mão de obra direta/matéria-prima), o motor de processamento do campeonato foi atualizado sob uma modelagem econômica dinâmica de mercados:

### 1. Mecânica de Spillover de Ruptura de Estoque (Stockout Spillover)
O fluxo econômico do fechamento do round opera em duas rodadas iterativas sintonizadas ao longo das praças geográficas:
- **Rodada 1 (Demanda Comercial Teórica):** O sistema espalha as demandas de intenção de compra regionais calculadas com base nos scores comerciais de preço, prazo de crediário e investimento regional de campanha de marketing de cada competidor.
- **Detecção de Gaps Físicos:** O motor simula um primeiro passe das projeções. Se a demanda preliminar de uma equipe $T$ em uma região $R$ exceder o seu respectivo estoque disponível consolidado para venda imediata ($EstoqueInicial_{finished\_goods} + ProduçãoReal$), os consumidores deparam-se com uma **Ruptura de Estoque (Stockout)**:
  $$Stockout_{T, R} = DemandaPreliminar_{T, R} - VendasReaisR1_{T, R}$$
- **Disputa da Demanda Órfã:** A soma de todas as rupturas ocorridas em uma região gera a $DemandaOrf\tilde{a}_R$. Em vez de essa fatia sumir artificialmente do PIB da indústria (gerando declínio irracional na receita agregada), ela é colocada para re-rateio imediato!
- **Condições de Redistribuição:** Apenas as marcas concorrentes que possuem **estoque físico livre excedente** naquela região pós-vendas da Rodada 1 qualificam-se para receber parte da demanda órfã. O rateio do spillover é ponderado unicamente pelos scores competitivos relativos das marcas qualificadas e sobreviventes, limitando-se ao volume de estoque remanescente físico individual de cada uma.

### 2. Transição para o Market Share Real (Physical Market Share)
Historicamente, o `market_share` persistido correspondia à captação conceitual pura de marketing, blindando concorrentes improdutivos contra a penalização do ranking setorial. A partir desta atualização de diretrizes (Sapphire v20.0):
- **Cálculo Baseado em Faturamento Físico:** O Market Share final e oficial de cada concorrente no encerramento da rodada é calculado estritamente sobre a entrega comercial líquida consolidada (unidades vendidas reais de fato que foram entregues aos clientes):
  $$\text{Market Share Final \%}_T = \left( \frac{\text{Unidades Vendidas Finais Real}_T}{\sum_{All} \text{Unidades Vendidas Finais Real}} \right) \times 100$$
- **Impacto da Capacidade e Força Operacional:** Esta alteração resolve de forma holística os pontos expostos pelo campeonato. A capacidade fabril instalada, ajustada pelas taxas de contratações de operários e horas extras táticas, eleva diretamente o Market Share real. Uma equipe estruturalmente produtiva não apenas atende seus próprios compradores, como se torna a principal herdeira de fatias generosas de mercado quando concorrentes falham no abastecimento, capturando faturamento excedente e empurrando seu EBITDA ao ápice financeiro da rodada.
- **Salvaguarda Fiduciária de Equilíbrio Geral:** Caso a soma global de unidades vendidas do setor seja nula (por exemplo, em setups do tipo *Start from Zero* onde nenhuma fábrica produziu no Round 0), o sistema usa o Market Share conceitual nominal da captação prévia como salvaguarda tática de ranking, ou em última instância o rateio uniforme entre as companhias.

---

## 9. 📐 Equilíbrio de Tesouraria e Análise do Efeito Tesoura (CPC / IFRS)

O **Efeito Tesoura** (ou fenômeno do *Overtrading*) surge quando o crescimento acelerado de uma empresa gera uma necessidade de capital de giro (NCG) que suplanta com folga a captação de recursos de capital de giro líquido (CDG). Na modelagem fiduciária do cockpit, este monitoramento avalia o risco de colapso de caixa por descasamento estrutural de prazos de faturamento.

### 1. Fórmulas de Equilíbrio e Estrutura Contábil:
- **Capital de Giro Líquido (CDG):** Mede a folga ou a escassez dos recursos de longo prazo aplicados no capital circulante.
  $$\text{CDG} = (\text{Patrimônio Líquido} + \text{Passivo Não Circulante / ELP}) - \text{Ativo Não Circulante / ANC}$$
- **Capital Circulante Líquido (CCL):** Diferença clássica de liquidez operacional.
  $$\text{CCL} = \text{Ativo Circulante} - \text{Passivo Circulante}$$
- **Necessidade de Capital de Giro (NCG):** Quantidade de recursos que a operação drena do caixa para financiar clientes e estoques antes de receber de fato, compensado pelas obrigações mercantis de curto prazo.
  $$\text{NCG} = (\text{Clientes} + \text{Estoques}) - (\text{Fornecedores} + \text{Impostos a Pagar})$$
- **Saldo de Tesouraria (ST):** O pulmão ou a folga financeira real e líquida da holding. Revela se a empresa dispõe de sobra de caixa ou se depende exclusivamente de endividamentos bancários de curto prazo.
  $$\text{ST} = \text{CDG} - \text{NCG}$$
- **Capital Circulante Próprio (CCP):** Recursos próprios aportados que sobram para financiar o circulante líquido.
  $$\text{CCP} = \text{Patrimônio Líquido} - \text{Ativo Não Circulante}$$

### 2. Comportamento e Diagnóstico nos Gráficos:
1. **Tesouraria Positiva (Folga Segura):** CDG > NCG. O Saldo de Tesouraria se mantém no quadrante positivo. O crescimento operacional está totalmente sustentado pelo capital de giro próprio ou dívidas de longo prazo sadias.
2. **Efeito Tesoura Clássico (Vulnerabilidade de Liquidez):** NCG cresce exponencialmente (devido ao faturamento em alta que expande contas a receber e requisições massivas de estocagem) enquanto o CDG se mantém estável ou é reduzido por baixa lucratividade líquida ou pagamento agressivo de dividendos. As curvas de NCG e CDG cruzam-se, empurrando o Saldo de Tesouraria (ST) para o negativo. A empresa sobrevive captando empréstimos bancários táticos de curtíssimo prazo (ECP), gerando risco de insolvência severo.

---

## 10. 🛡️ Diretriz de Integridade de Dados contra Mocks Silenciosos e Fallbacks Arbitrários (Anti-Slop / Anti-Fallback)

Para garantir a absoluta **fidelidade e rastreabilidade contábil** do simulador, fica estabelecida uma política de tolerância zero contra a criação negligente de dados fictícios. Os agentes de IA de programação, contabilidade ou banco de dados, bem como profissionais humanos que atuam no projeto, devem seguir rigorosamente as regras abaixo:

### 1. Proibição de Fallbacks Silenciosos com Valores "Mágicos"
- É terminantemente **proibido** criar fallbacks estáticos de dados financeiros chaves nas telas ou gráficos do cockpit (Exemplos reais proibidos: `equity || 1200000`, `revenue || 1500000`, `market_share || 16.3`, `liability_lt || (liabilities / 2)`).
- **Justificativa Técnico-Contábil:** A injeção silenciosa de números inventados impede o diagnóstico de falhas críticas nas estruturas de processamento de rounds e esconde a inconsistência de dados do banco. Um Balanço Patrimonial cujos valores mimetizam sucesso com aproximações arbitrárias quebra a confiança do usuário e desqualifica o rigor acadêmico do simulador.

### 2. Protocolo de Governança de Dados
- **Pergunte Antes de Criar:** Se houver dúvidas quanto à representatividade de um valor em rounds sem histórico (ex: Round 0 em Greenfield), o agente **nunca** deve estimar ou hardcodar valores estáticos que simulem faturamento, vendas ou lucros para cobrir a ausência de dados, a menos que tal fórmula de salvaguarda esteja explicitamente assinada na tabela de Auditoria ou nas fórmulas declaradas deste guia.
- **Tratamento de Exceções Legítimas:** Em caso de dados ausentes (`null` ou `undefined`), o sistema deve adotar uma destas três abordagens de governança fiduciária, dependendo do contexto:
  1. **Zerar Concretamente (Greenfield):** Se a empresa iniciou do zero, o faturamento, custos e market share anteriores são de fato **zero** (`0`), e o sistema deve computá-los e exibi-los como zero ao invés de buscar médias de mercado.
  2. **Indisponibilidade Sinalizada na Interface:** Em vez de disfarçar erros com números estáticos sadios para que a tela renderize em silêncio, a interface deve exibir um loader, uma mensagem de "Dados de simulação não calculados no banco" ou renderização condicional amigável (ex: `-` ou `N/A`) que conduza o usuário a rodar o turnover de simulação.
  3. **Identificação e Tratamento na Origem:** O Engenheiro e o Contador devem depurar a consulta SQL no Supabase, a política de RLS, ou a função geradora de turnover (`simulation.ts`) para garantir que os dados históricos reais sejam escritos no banco de dados com integridade matemática integral, eliminando a discrepância já na raiz de persistência.

### 3. Sinceridade na Depuração (Rastreabilidade)
- Quando houver quebra de testes ou compilação, o programador ou contador deve focar em **corrigir a consulta ou a lógica de carregamento do estado** e **nunca** remendar o componente visual para "passar de ano" adicionando uma cascata de operadores coalescentes (`??` ou `||`) com dados fictícios de mercado por fora.
- Todos os campos e estados estruturados no front-end devem, preferencialmente, carregar dados tipados originados das APIs e submetidos à validação prévia. Se um fallback temporário de segurança for inserido para blindar falha crítica de compilação, ele deve ser de curtíssimo alcance (ex: `0` para números e `""` para textos), e documentado explicitamente com um comentário `// TODO: Investigar causa raiz contábil em...` e reportado imediatamente ao PMP e ao time de desenvolvimento.
