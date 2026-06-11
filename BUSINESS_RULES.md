# 📘 Regras de Negócio do Projeto (BUSINESS_RULES.md)

Este documento centraliza as definições de negócios, fórmulas, restrições e diretrizes estratégicas que modelam o motor de simulação e o cockpit do simulador empresarial. Ele serve como a fonte de verdade absoluta para o desenvolvimento, contabilidade e inteligência comercial do projeto.

---

## 📅 Controle de Governança e Versionamento

- **Projeto:** EMPIRION ORACLE
- **Versão Ativa de Regras:** v2026.124
- **Responsável pela Governança:** Project Management Professional (PMP)
- **Time Multidisciplinar Responsável:**
  - **Contador Sênior:** CPC / IFRS e validação de relatórios contábeis/financeiros.
  - **Coodenador de Inteligência de Mercado:** Análise de concorrência e estratégias de penetração regional.
  - **Engenheiro de Software Sênior:** Arquitetura limpa, segurança e integridade do motor de cálculo.
  - **Engenheiro de Banco de Dados:** Normalização, concorrência e RLS.
  - **Arquiteto de UI/UX:** Apresentação elegante e acessível com micro-interações.

| Data | Versão | Autor | Alterações / Decisões Importantes |
| :--- | :--- | :--- | :--- |
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

### 💱 Governança Cambial: Tratamento de Moedas Locais de Praças de Exportação
Em cenários onde o Tutor parametriza uma região com moeda de circulação estrangeira (ex: **USD - Dólar** ou **EUR - Euro**) em arenas cuja moeda corporativa padrão é **BRL**:
- **Digitação Nominal Direta:** As equipes devem digitar o Preço Unitário de Venda no cockpit (`MarketingStep`) diretamente na **moeda nominal local** correspondente exibida pelo campo e sugerida para aquela praça de exportação (ex: digitar `120` se o preço nominal sugerido pelo mercado local for `USD 120,00`).
- **Comportamento do Motor:** O motor de cálculo simula a atratividade do produto comparando diretamente o preço nominal digitado com o preço sugerido (ambas na mesma base monetária da região). A receita bruta local é apurada no mesmo número direto para manter a integridade operacional e de estudos acadêmicos das planilhas de rateio, evitando complexidades adicionais de hedge ou spread de câmbio nas decisões táticas de venda.

> 📈 **Importância de Negócio:** Através desse rateio fiduciário estruturado em conformidade com o pronunciamento de relatórios segmentados (**CPC 22 / IFRS 8**), as marcas visualizam com exatidão a contribuição real líquida que cada praça traz para o grupo, sabendo se o volume de publicidade ou os fretes distantes de uma região específica estão de fato gerando fluxo de caixa líquido sadio de forma totalmente transparente e livre de ilusões de média consolidada.

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

## 6. 🎯 Próximos Passos e Verificação de Sincronia

- [x] Unificação dos cálculos de estatísticas do Cockpit (`MarketingStep.tsx`) para usar o modelo demográfico dinâmico unindo com o peso estipulado pelo Tutor.
- [x] Unificação dos rótulos visuais para fins de usabilidade corporativa e facilidade de estudo dos alunos concorrentes.
- [x] Construção e deploy do painel interativo de DRE e Lucratividade Regional expandido por card de decisão para uso síncrono das marcas.
- [x] Blindagem e implementação de Row-Level Security (RLS) nas tabelas `trial_decisions` e `current_decisions` para impedir vazamento concorrencial de rascunhos.
- [x] Implementação integral do protocolo de Fiduciary Carry-Forward para salvação de decisões por estouro de timer (Timeout) síncrono.
- [ ] Monitoramento constante de novas decisões de compra no Turno 2 pelas equipes para avaliar o impacto imediato na calibragem dos novos equipamentos instalados.
