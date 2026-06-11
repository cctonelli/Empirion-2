# 📘 Regras de Negócio do Projeto (BUSINESS_RULES.md)

Este documento centraliza as definições de negócios, fórmulas, restrições e diretrizes estratégicas que modelam o motor de simulação e o cockpit do simulador empresarial. Ele serve como a fonte de verdade absoluta para o desenvolvimento, contabilidade e inteligência comercial do projeto.

---

## 📅 Controle de Governança e Versionamento

- **Projeto:** EMPIRION ORACLE
- **Versão Ativa de Regras:** v2026.120
- **Responsável pela Governança:** Project Management Professional (PMP)
- **Time Multidisciplinar Responsável:**
  - **Contador Sênior:** CPC / IFRS e validação de relatórios contábeis/financeiros.
  - **Coodenador de Inteligência de Mercado:** Análise de concorrência e estratégias de penetração regional.
  - **Engenheiro de Software Sênior:** Arquitetura limpa, segurança e integridade do motor de cálculo.
  - **Engenheiro de Banco de Dados:** Normalização, concorrência e RLS.
  - **Arquiteto de UI/UX:** Apresentação elegante e acessível com micro-interações.

| Data | Versão | Autor | Alterações / Decisões Importantes |
| :--- | :--- | :--- | :--- |
| **11/06/2026** | `v2026.120` | *PMP & Equipe* | **Governança de Privacidade de Rascunhos.** Implementação de Row-Level Security (RLS) restrito nas tabelas de decisões para vedar leitura de rascunhos entre equipes em rounds ativos. |
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

## 3. 🗺️ DRE por Geolocalização & Lucratividade Líquida Regional

Com o objetivo de dotar as equipes com alta capacidade analítica de inteligência de negócios, o Cockpit simula e apresenta uma Demonstração de Resultado do Exercício (DRE) setorial baseada na geolocalização dos volumes físicos faturados. 

### Modelo Analítico de Margem Geográfica (CPC / IFRS)

Para cada região $R$, as linhas contábeis são estruturadas em tempo de cockpit da seguinte forma:

1. **Receita Bruta Regional ($R_B$):**
   $$R_B = Q \times P_{\text{regional}}$$
   *(Unidades Físicas alocadas à equipe na região pelo motor de simulação $\times$ Preço estipulado na decisão).*
2. **(-) Deduções de IVA de Vendas ($T_{\text{IVA}}$):**
   $$T_{\text{IVA}} = R_B \times \frac{\text{Aliquota do IVA do Turno \%}}{100}$$
3. **(=) Receita Líquida Regional ($R_L$):**
   $$R_L = R_B - T_{\text{IVA}}$$
4. **(-) Custo do Produto Vendido Alocado (CPV via WAC):**
   $$CPV_{\text{regional}} = Q \times \text{Custo Unitário Histórico do Período (WAC)}$$
   *O Custo Unitário (WAC) de estocagem PA é uniforme para a planta industrial, mas o CPV total é fatiado proporcionalmente ao volume de demanda real entregue em cada praça.*
5. **(-) Despesas de Marketing Local ($Mkt$):**
   $$Mkt = \text{Campanhas locais parametrizadas (0-9)} \times \text{Custo Unitário da Campanha Ajustado pelo Turno}$$
6. **(-) Demanda de Logística / Frete de Distribuição ($Log$):**
   $$Log = Q \times \text{Custo de Transporte Unitário Ajustado da Região}$$
7. **(=) Lucro Líquido Regional ($LL_{\text{regional}}$):**
   $$LL_{\text{regional}} = R_L - CPV_{\text{regional}} - Mkt - Log$$
8. **Margem Líquida Geográfica (\%):**
   $$\text{Margem Líquida Regional \%} = \frac{LL_{\text{regional}}}{R_L} \times 100$$

> 📈 **Importância de Negócio:** Esta análise permite detectar se a acidez competitiva de uma praça de mercado (ex: guerra de preços ou marketing massivo no SUL) está canibalizando o capital operacional da marca, subsidiando fretes elevados, ou se praças menores de menor concorrência (ex: NORTE) estão sustentando o EBITDA real do grupo empresarial.

---

## 4. 🔒 Confidencialidade e Governança de Decisões de Competidores (Rascunhos de Rounds)

Por questões éticas, segurança informacional e diretivas de Governança Estratégica do EMPIRION, as equipes inscritas jamais poderão acessar ou visualizar dados de decisões/rascunhos de outras equipes enquanto o round corrente estiver ativo/em andamento. 

### Diretrizes de Visibilidade Fiduciary (RLS & UI)
1. **Estudantes / Competidores:** Possuem isolamento estrito de leitura (direto via banco de dados e através da interface). Um jogador pertencente a uma equipe pode ler e gravar única e exclusivamente os registros e rascunhos correspondentes à sua própria marca (`trial_decisions` no modo Sandbox/Trial, ou `current_decisions` no campeonato pago).
2. **Tutores e Administradores:** Possuem autoridade e visibilidade irrestritas, podendo acessar simultaneamente os rascunhos de todas as equipes registradas no campeonato a qualquer momento antes do fechamento do round, servindo como auditores preventivos de concorrência.
3. **Observadores (Conselheiros):** Tutores podem credenciar usuários específicos como observadores oficiais do torneio. Licenciados através do perfil `role = 'observer'` ou declarados nominalmente por ID na coleção de observadores do campeonato (`championships.observers`), os Conselheiros possuem privilégio síncrono para visualizar as decisões pré-salvas e advertir e orientar os participantes sobre possíveis erros de formulação operacional.
4. **Resguardo de Algoritmos:** A barreira de segurança impossibilita qualquer vazamento que canibalize o mérito concorrencial das decisões de parque industrial, preços regionais ou investimentos em marketing.

---

## 5. 🎯 Próximos Passos e Verificação de Sincronia

- [x] Unificação dos cálculos de estatísticas do Cockpit (`MarketingStep.tsx`) para usar o modelo demográfico dinâmico unindo com o peso estipulado pelo Tutor.
- [x] Unificação dos rótulos visuais para fins de usabilidade corporativa e facilidade de estudo dos alunos concorrentes.
- [x] Construção e deploy do painel interativo de DRE e Lucratividade Regional expandido por card de decisão para uso síncrono das marcas.
- [x] Blindagem e implementação de Row-Level Security (RLS) nas tabelas `trial_decisions` e `current_decisions` para impedir vazamento concorrencial de rascunhos.
- [ ] Monitoramento constante de novas decisões de compra no Turno 2 pelas equipes para avaliar o impacto imediato na calibragem dos novos equipamentos instalados.
