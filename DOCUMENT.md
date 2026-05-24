# Oracle Strategos - Bússola de Diretrizes do Projeto (DOCUMENT.md)

## 📋 Controle de Governança
- **Produto:** EMPIRION ORACLE
- **Versão Ativa:** v19.5 Sapphire Gold Edition (Centralização de KPIs & E-SDS v1.2 - Maio 2026)
- **Tipo de Documento:** Master Index & Diretrizes de Engenharia Contínua
- **Status da Documentação:** Sincronizado com o PRD.md

---

## 1. Visão Geral e Missão do Produto

O **EMPIRION ORACLE** é um simulador de "Digital Twin" de gestão contábil, industrial e financeira voltado para cenários de alta competitividade e capacitação corporativa de alto nível (MBA/Corporate Training). Através de um motor sequencial robusto de rodadas (Turnover Engine), as equipes tomam decisões operacionais e competem em mercados dinâmicos regulados por inteligência artificial e indexadores econômicos globais.

### 1.1 Objetivos Estratégicos (Princípios de Engenharia Sênior)
- **Fidelidade de Cenários:** Simular eventos contábeis, operacionais e de mercado com integridade fiscal e contábil absoluta baseada em padrões contábeis consagrados (DRE, DFC, Balanço Patrimonial).
- **IA Generativa Ativa:** Integrar inteligência neural ativa (Gemini API) para geração automatizada de relatórios analíticos personalizados (Oráculo) e mídias de opinião pública/tendências mercadológicas (Gazeta).
- **Proteção de Dados Multi-inquilino (Multi-tenant):** Viabilizar disputas em larga escala com completo isolamento de escopo técnico, de dados e estratégico entre equipes em uma mesma arena competitiva.

### 1.2 Personas do Ecossistema
1. **Player (Estrategista):** Membro de uma equipe industrial. Responsável por analisar dados históricos de rounds passados, interagir com o cockpit, planejar investimentos e submeter as decisões operacionais (Inputs).
2. **Arena Tutor (Orquestrador/Professor):** Criador e gerenciador de arenas competitivas. Possui visibilidade analítica irrestrita sobre as equipes, define indicadores macroeconômicos por rodada e gerencia o processamento das rodadas (Turnover).
3. **Market Observer (Avaliador):** Acesso estritamente observador para auditoria externa. Permite o acompanhamento de dados públicos consolidados sem capacidade de alteração ou visualização de informações confidenciais de equipes específicas.
4. **System Admin (Operador de Infraestrutura):** Permissões globais de bypass de segurança para correções de dados frios, manutenção de banco ou intervenções estruturais (`role = 'admin'`).

---

## 2. 🧠 Arquitetura de Inteligência Artificial (Gemini API)

O Empirion utiliza uma estrutura em camadas para orquestração de IA utilizando o SDK oficial `@google/genai` e chaves seguras mantidas server-side (`process.env.GEMINI_API_KEY`):

### 2.1 Oráculo Strategos (Gemini 3 Pro)
- **Função:** Atua como um consultor estratégico corporativo especializado (CFO virtual).
- **Entrada:** Analisa a `FinancialTree` da rodada atual e o histórico de decisões.
- **Saída:** Gera relatórios analíticos profundos, críticas de balanço, diagnósticos de fluxo de caixa e recomendações estratégicas exclusivas para cada equipe de forma privada.

### 2.2 Gazeta Oracle / Bots (Gemini 3 Flash)
- **Função:** Processamento de inteligência de alta velocidade e baixa latência.
- **Aplicações:**
  - **Autonomous Nodes (Bots Competitivos):** Geração de estratégias de mercado realistas para equipes virtuais com perfis atribuídos automaticamente:
    - *AGRESSIVO:* Foco em ganho de market share rápido, preços baixos e alta alavancagem.
    - *CONSERVADOR:* Prioriza a preservação de capital, liquidez imediata e baixo endividamento.
    - *EFICIENTE:* Busca a otimização máxima dos custos de produção e das margens operacionais.
    - *INOVADOR:* Foca em diferenciação de mercado através de investimentos em qualidade e marketing.
    - *EQUILIBRADO:* Mantém postura neutra, buscando balancear crescimento e segurança financeira.
  - **Gazette News Generator:** Geração dinâmica de manchetes, tendências de mercado, humor de mercado e colunas de opinião baseadas no desempenho agregado das equipes e indexadores macro.

---

## 3. 🏛️ Segurança e Governança (RLS Protocol)

Toda a segurança de dados e concorrência é gerenciada no nível do banco de dados PostgreSQL com políticas de **Row Level Security (RLS)** granulares definidas em `database_rls.sql`:

1. **System Admin (`role = 'admin'`):** Bypass total para intervenções de suporte.
2. **Arena Tutor:** Acesso de leitura total a todas as equipes e companhias associadas às arenas que o tutor (`tutor_id`) gerencia.
3. **Team Member (Player):** Leitura e escrita restritas estritamente aos dados da sua própria equipe (`team_id`) e arena correspondente.
4. **Market Observer:** Visualização exclusivamente para relatórios consolidados públicos pertencentes à respectiva arena (`championship_id`).

---

## 4. 📊 Protocolo de Integridade Contábil

**REGRA DE PRESERVAÇÃO DE SCHEMA:**
Todas as contas listadas na `INITIAL_FINANCIAL_TREE` dentro de `constants.tsx` (Balanço Patrimonial, DRE e Fluxo de Caixa) são **imutáveis**.
- **Contas com Valor Zero:** Não devem ser removidas, pois servem como espaços reservados (placeholders) para preenchimentos dinâmicos executados pelo motor Oracle em rodadas subsequentes.
- **Rigor Fiduciário:** A quebra da árvore impede a consolidação contábil da simulação e rompe a persistência relacional do banco de dados.

---

## 5. 🌎 Expansão Geopolítica e Multi-Moeda

O simulador suporta operações industriais complexas distribuídas em até **15 regiões simultâneas**:
- **Consolidação Cambial:** Transações regionais usam cotações de moedas como **BRL (Base de liquidação), USD, EUR, GBP, CNY e BTC**.
- **Cotações Cruzadas:** Paridades e taxas de câmbio são reguladas através dos `MacroIndicators` lançados a cada rodada.
- **Segmentação Geopolítica:** Cada região possui peso de demanda exclusivo, moeda local própria, e atratividade comercial influenciada diretamente pelas tarifas aduaneiras e incentivos tributários regionais (Landed Cost).

---

## 6. Regras de Negócio (Core Industrial Engine)

O motor de simulação reside integralmente dentro de `services/simulation.ts` e calcula com rigor os inputs operacionais.

### 6.1 Capacidade Fabril e Gestão de Ativos (CapEx)
As equipes gerenciam sua planta fabril através de três modelos padrão de maquinários:

| Atributo | Máquina Alfa | Máquina Beta | Máquina Gama |
| :--- | :--- | :--- | :--- |
| **Capacidade de Produção/Ciclo** | 2.000 Unidades | 6.000 Unidades | 12.000 Unidades |
| **Quadro Operacional Requerido** | 94 Operadores | 235 Operadores | 445 Operadores |
| **Vida Útil Declarada** | 40 Ciclos (Rounds) | 40 Ciclos (Rounds) | 40 Ciclos (Rounds) |
| **Depreciação Periódica** | Linear (2.5% ao round) | Linear (2.5% ao round) | Linear (2.5% ao round) |

- **Aquisição de Equipamentos (Efeito Imediato):** Compras de maquinários efetuadas no período $T$ já integram a capacidade industrial ativa para produção no próprio período $T$.
- **Depreciação Contábil:**
  - *Prédios:* Desgaste faturado em 0.2% por período sobre o valor histórico.
  - *Máquinas:* Linear baseada na vida útil de 40 rounds (2.5% p.p.).
- **Venda de Equipamentos:** Aplica-se deságio depreciativo lançado diretamente como Despesa Não Operacional no DRE e gerando reflexo de entrada de caixa líquido no DFC.

### 6.2 Gestão de Mão de Obra (Operadores) e Turno Extra
- **Gargalo Técnico (Capas Operacionais):** O processamento de produção é limitado pelo menor valor entre a capacidade nominal instalada do par de máquinas e o contingente de operadores ativos devidamente contratados de forma prévia.
- **Padrão de Produtividade & Treinamento:** Equipamentos novos adquiridos demandam um treinamento correspondente a no mínimo **5% do valor total do CapEx** investido. Caso o investimento seja inferior a este patamar, aplica-se uma penalização imediata de **25% na produtividade** industrial da planta naquela rodada.
- **Turno Extra (Overtime):** Permite fabricar até **50% adicionais sobre a capacidade nominal** ativa das máquinas, de forma a absorver picos de demanda. Contudo, incide um acréscimo estatutário punitivo de **50% sobre o custo-hora padrão da Mão de Obra Direta (MOD)** apenas para as unidades adicionais excedentes operadas.
- **Encargos Sociais:** Encargos trabalhistas e previdenciários fixados em **35% sobre a folha total de pagamento**.

### 6.3 Fisiologia de Suprimentos (M matéria-Prima e Estoque)
- **Consumo Industrial:** Cada unidade final de Produto Acabado (PA) consome fisicamente **3 unidades de MP-A** e **2 unidades de MP-B**.
- **Custeio de Estoque:** Método de **Custo Médio Ponderado Móvel (WAC)** regulando a valoração do estoque residual de matérias-primas e produtos prontos ao fim da rodada.
- **Custos de Estocagem:** Custos específicos cobrados por unidade física de MP ou PA em estoque ao final do período.
- **Juros do Fornecedor (supplier_interest):** Incide sobre o valor total do volume de aquisições de MP quando a equipe opta por prazos de pagamento a prazo (A VISTA + 50% ou Parcelado). O encargo é embutido diretamente no preço faturado de aquisição da MP.
- **Compra de Emergência (special_purchase_premium):** Disparada de forma imperativa pelo motor de simulação se o somatório do Estoque Inicial de MP + Novas Compras Planejadas não cobrir a meta de produção inserida no cockpit.
  - *Ágio:* Aplica-se uma taxa punitiva (`special_purchase_premium`) acrescendo de forma direta o valor da unidade emergencial.
  - *Cumulabilidade:* Caso a compra de emergência seja efetuada sob modalidade de faturamento a prazo, acumulam-se o ágio punitivo e o juros do fornecedor.

### 6.4 Comercialização, Recebimento e PECLD
- **Mix de Recebimento Regional:** O cockpit permite configurar três termos de prazo de recebimento das vendas regionalizadas:
  - *A VISTA:* 100% liquidação em caixa no round da venda.
  - *AV + 50%: * 50% em caixa operacional, 50% provisionado no contas a receber (prazo médio PMP 15 dias).
  - *AV + 33% + 33%:* 33.3% liquidação à vista, restante distribuído em recebimentos a prazo futuros (PMP 30 dias).
- **Provisão para Devedores Duvidosos (PECLD):** O percentual de inadimplência estimado incide **única e exclusivamente sob a parcela de vendas a prazo** (Credit Sales), sem onerar a receita recebida à vista.
- **Custos de Distribuição:** Encargo logístico unitário calculado por unidade efetivamente comercializada na respectiva região.

---

## 7. Modelos Avançados de Saúde Financeira, Tributos e Solvência

### 7.1 Gestão Contábil do IVA (Venda e Aquisição)
- **Compensação Não Cumulativa (Gold Standard):** Os créditos acumulados sob compras operacionais e MP são reconhecidos diretamente na conta ativa de `taxes_recoverable` antes do processamento de apuração. Da mesma forma, os débitos sobre vendas alimentam `taxes_payable`. A compensação líquida de tributos ocorre de forma dinâmica.

### 7.2 PPR (Programa de Participação nos Lucros)
- **Regras de Enquadramento:** Arbitragem das equipes variando de **0% a 20% do LAIR**.
- **Competência Contábil:** O valor apurado no período $T$ é provisionado sob o passivo circulante (`ppr_payable`) e reconhecido de imediato na DRE como Despesa Operacional.
- **Liquidação:** Pagamento financeiro ocorre de forma total no período subsequente ($T+1$) através do caixa operacional.
- **Rescisão com Desligamento:** Em caso de demissões, o colaborador é desligado recebendo o PPR proporcional provisionado acumulado em períodos passados de forma imediata na quitação de multas rescisórias.

### 7.3 Empréstimo Compulsório Automático
- **Condição de Ativação:** Disparado de forma automática caso o caixa final líquido consolidado resulte em saldo negativo ao final do processamento das demonstrações de caixa.
- **Prêmio Estatutário:** Cobrança indexada conforme a taxa TR do ciclo somada ao ágio punitivo definido na arena (`compulsory_loan_agio`).
- **Quitação prioritária:** 100% amortizado e quitado obrigatoriamente logo no round subsequente ($T+1$), com estorno prioritário das disponibilidades financeiras.

### 7.4 Altman Z''-Score
Modelo preditivo de insolvência calibrado para empresas fechadas de mercados emergentes:

$$Z'' = 3.25 + (6.56 \times X_1) + (3.26 \times X_2) + (6.72 \times X_3) + (1.05 \times X_4)$$

- **Onde:**
  - $X_1$: Capital de Giro Líquido / Ativo Total
  - $X_2$: Lucros Retidos Acumulados / Ativo Total
  - $X_3$: EBIT / Ativo Total
  - $X_4$: Patrimônio Líquido Líquido / Passivo Total
- **Escala de Risco:** Seguro ($Z'' > 2.6$), Zona Cinzenta / Alerta ($1.1 \le Z'' \le 2.6$), Perigo Severo / Falência ($Z'' < 1.1$).

### 7.5 E-SDS v1.2 (Empirion Solvency Dynamics Score)
O motor dinâmico e proprietário do simulador avalia a resiliência global das companhias com base na composição ponderada de seis pilares ($P_1$ a $P_6$):

$$\text{E-SDS} = w_1 P_1 + w_2 P_2 + w_3 P_3 + w_4 P_4 + w_5 P_5 + w_6 P_6$$

#### Pilares de Medição ($P_n$):
- **$P_1$ (Fluxo de Caixa Livre Operacional):** Capacidade de manter a planta saudável autonomamente sem refinanciamentos constantes.
  - `(FCO - CapEx Manut - Juros - Impostos) / (Passivo Circulante + Despesas Projetadas)`
- **$P_2$ (Crescimento Sustentável):** Avaliação de receitas recorrentes contra endividamentos crescentes.
- **$P_3$ (Análise DuPont & Margens):** Resiliência da margem EBITDA ponderada pela recorrência de mercado setorial.
- **$P_4$ (Cobertura de Giro e Dias de Caixa):** Indicador de contingenciamento imediato por setor econômico.
- **$P_5$ (Alavancagem e Concentração):** Despenalizador que mensura passivos totais em relação ao patrimônio líquido.
- **$P_6$ (Volatilidade Cambial e de Receita):** Mede o desvio-padrão e estabilidade de geração de fluxo de caixa operacional livre do negócio.

#### Restrições Críticas (Regras Verificadoras):
- **Limitador de Alavancagem Máxima (Threshold Hard):** Se a relação $\frac{\text{Dívida Líquida}}{\text{EBITDA}} > 6.0$, o score sofre rebaixamento imediato compulsório para a faixa de perigo grave (Laranja/Vermelho), anulando demais ponderações positivas.
- **Classificação de Cores:**
  - 🔵 **Azul (Superior):** $Score \ge 8.0$
  - 🟢 **Verde (Sustentável):** $5.5 \le Score < 8.0$
  - 🟡 **Amarelo (Sinal de Alerta):** $3.0 \le Score < 5.5$
  - 🟠 **Laranja (Crítico):** $1.5 \le Score < 3.0$
  - 🔴 **Vermelho (Insolvência):** $Score < 1.5$

---

## 8. Decisões Arquiteturais e Padrão de Diretório

Para manter o projeto replicável, escalável e de fácil manutenção, os artefatos de governança estão distribuídos sob os seguintes domínios:

```
project-root/
├── README.md                      # Index de inicialização de desenvolvedores
├── PRD.md                         # Requisitos de Produto (Product Requirements)
├── DOCUMENT.md                    # Este arquivo - Regras de Negócio e Versões (Master Index)
├── CHANGELOG.md                   # Histórico sequencial detalhado de entregas de engenharia
├── CONTRIBUTING.md                # Diretrizes de contribuição técnica
├── SECURITY.md                    # Protocolos e políticas de segurança
├── LICENSE                        # Direitos de distribuição MIT
│
├── docs/                          # Documentações técnicas detalhadas
│   ├── ARCHITECTURE.md            # Visão de engenharia do frontend, motor contábil e simulação
│   ├── SUPABASE.md                # Conexões, RLS no banco e configurações de ambiente
│   ├── DATABASE.md                # Dicionário de dados, ERD e regras relacionais
│   ├── BUSINESS_RULES.md          # Manual de jogo, parâmetros industriais da DRE e DFC
│   ├── AUTH.md                    # Fluxo de login, ciclo de JWT e criação de profiles
│   ├── API.md                     # Integração com os modelos neurais Gemini e orquestração do SDK
│   └── ROADMAP.md                 # Visão de evolução de features futuras do simulador
│
└── supabase/                      # Pasta oficial para gerenciamento do Supabase CLI
    ├── config.toml                # Definição de portas locais, schemas e redirecionamentos
    ├── migrations/                # Schema persistente e atualizações de RLS de banco
    └── seed.sql                   # Cargas de dados fake para setup rápido local
```

---

## 9. Registro de Versionamento Histórico (Evolução Contínua)

### v19.7 Obsidian Plus (Obsidian Executive) - Abas Espaciais & Sparklines SVG
- **Data:** 24 de Maio de 2026
- **Motivo:** Solucionar a sobrecarga cognitiva e fadiga vertical do cockpit executivo, enriquecendo o painel `RightPreviewPanel.tsx` com visualizações vetoriais rápidas de evolução contábil e segmentação de foco.
- **Diferenças:**
  - *Arquitetura por Abas Táticas:* Divisão estrutural em 3 Abas ("Finanças", "Riscos & Auditoria", "Kardex/MP"), eliminando 60% do scroll vertical e permitindo maior concentração de dados em monitores padrão.
  - *Sparklines SVG Nativas:* Micrográficos vetoriais desenhados sob demanda em tempo real, calculando os gradientes de tendência e comparando os dados consolidados do Round Corrente (T) com as projeções simuladas de Tomada de Decisão (T+1) para receita, lucro, caixa e EBITDA.
  - *Alertas Reativos Dinâmicos:* Pontos pulsantes de aviso inseridos nos cabeçalhos de aba alertam intuitivamente o jogador quando há riscos ou inconsistências contábeis geradas pelo Z-Guard sem necessitar da aba de riscos visível.
- **Status:** Em Produção (Alta DX & UX).

### v19.6 Obsidian - Cockpit Modular & Presets Táticos
- **Data:** 24 de Maio de 2026
- **Motivo:** Decomposição arquitetural do painel monolítico de decisões `DecisionForm.tsx` em um hub modular, inteligente e ágil, mitigando a fadiga operacional do tomador de decisão.
- **Diferenças:**
  - *Modularização Estrita:* Distribuição estrutural do formulário em etapas isoladas (`/components/steps/`: SupplyStep, FactoryStep, HRStep, FinanceStep, etc.), facilitando grandemente o DX e a isolamento de bugs.
  - *Presets de Decisão Rápida:* Introdução de botões executivos de calibração ("Conservadora", "Equilibrada", "Agressiva") para preenchimento ágil de variáveis padrão e menor esforço manual de inputs.
  - *Torre de Controle Unificada:* Criação do arquivo `RightPreviewPanel.tsx` integrando o simulador instantâneo com Z-Guard para checar quebras de integridade tributária/caixa antes de enviar os dados ao Oráculo.
- **Status:** Em Produção.

### v19.5 Sapphire Gold Edition - Centralização de KPIs e E-SDS v1.2
- **Data:** 24 de Maio de 2026
- **Motivo:** Centralização técnica absoluta e unificação matemática das equações corporativas e do motor E-SDS v1.2 em `services/simulation-core.ts`, mitigando qualquer descompasso operacional offline-online e fechando as lacunas táticas de conciliação.
- **Diferenças:**
  - *Consolidação Estrita & Sem Redundância:* Migração integral e delegação unificada do custeio de estoques (Kardex-WAC), cálculo de CPV, `calculateKpisFromStatements` e `processRoundWithValidation` para a biblioteca unificada de núcleo contábil (`simulation-core.ts`).
  - *Simbiose E-SDS & Auditoria Contábil:* Integração direta da validação tripla contábil (`validateTripleConsistency`) dentro da computação do score de solvência E-SDS, penalizando descompassos contábeis em 3.0 pontos no score, forçando o rebaixamento da zona e registrando o gargalo de ruptura de integridade (Z-Guard).
  - *Cockpit de Tomada de Decisão com Kardex Ativo:* Inclusão de painel visual interativo com simulação em tempo real sobre fluxos de matéria-prima no cockpit das equipes (`DecisionForm.tsx`), alertando dinamicamente sobre risco de defasagem de estoques e compras de emergência.
  - *E-SDS v1.2 Dinâmico & Setorial:* Ponderação matemática dinâmica dos pilares (P1 a P6) com calibração estrita pelo tipo de branch (`agribusiness`, `services`, `industrial`) e desvio padrão quadrático da volatilidade histórica (P6).
  - *Quantificação Científica de Gargalos:* Abstração refinada de `top_gargalos` adaptada para representação de objetos de impacto e percentual compatíveis com as diretrizes do ecossistema.
- **Status:** Em Produção (Fidelidade Mútua).

### v19.5 Sapphire - Integridade Contábil & Kardex de Estoque
- **Data:** Maio de 2026
- **Motivo:** Introdução de controle quantitativo e financeiro de estoque (Kardex-WAC) e auditoria tripla de consistência para estancar perdas e garantir reconciliação perfeita de DRE, DFC e Balanço Patrimonial.
- **Diferenças:**
  - *Kardex de Suprimentos:* Rastreamento minucioso do fluxo físico/financeiro para MP A, MP B e Produto Acabado de acordo com o WAC (Custo Médio Ponderado).
  - *Detalhamento CPP e CPV:* Exposição explícita do processo de custeio por absorção industrial, dividindo o custo acumulado em Matéria-Prima Consumida, MOD e GGF/CIF (Manutenção, Depreciação, PPR de demissão, Rescisões).
  - *Interface de Usuário:* Aba integrada de Kardex & CPV com dados históricos e projeção temporária T+1.
  - *Processo de Validação:* Estruturação de `processRoundWithValidation` em `services/simulation-core.ts` para checar e registrar logs contábeis e fiscais.
  - *Estúdio de Simulação Automatizada:* Adição de um estúdio interativo de simulação de Turnover no `OpalIntelligenceHub`, rodando cenários completos de equipe (compra de máquinas, captações de empréstimos, vendas à vista/a prazo, compras emergenciais e custeio WAC), fornecendo relatórios do Oráculo de IA baseados em feedbacks analíticos do Kardex.
- **Status:** Em produção.

### v2026-04 - RLS Sync & Gazette Intelligence (Versão Atual)
- **Data:** Abril de 2026
- **Motivo:** Fortalecimento da segurança de dados via Supabase RLS e precisão informativa na Oracle Gazette.
- **Diferenças:**
  - *RLS Master Data:* Implementação de políticas granulares no `database_rls.sql` para proteger `user_profiles`, `championships`, `teams` e `companies`.
  - *Gazette Preview:* Ajuste na lógica de exibição para mostrar preços realistas (ajustados pelo cronograma) no início de cada round.
  - *Moeda e Máscara:* Padronização de 4 casas decimais e máscara de moeda dinâmica conforme configuração da Arena.
- **Status:** Em produção.

### v2026-03.11 - Refatoração do Kernel & Integridade Contábil
- **Data:** Março de 2026
- **Motivo:** Centralização da lógica de cálculo de KPIs e garantia de integridade contábil absoluta entre demonstrações financeiras e indicadores.
- **Diferenças:**
  - *Modularização:* Extração da lógica de KPIs para a função `calculateKpisFromStatements`, garantindo que todos os indicadores (TSR, DuPont, Z-Score, E-SDS, etc.) sejam derivados diretamente das demonstrações financeiras finais (Balanço, DRE, DFC).
  - *Consistência:* Eliminação de cálculos redundantes no `calculateProjections`, reduzindo o risco de divergências entre o que é exibido nos relatórios e o que é armazenado no banco de dados.
  - *DX (Developer Experience):* Código mais limpo, testável e fácil de manter, com separação clara entre "Simulação de Eventos" e "Cálculo de Indicadores".
- **Status:** Em produção.

### v2026-03.10 - Telemetria de Suprimentos & Schema Supabase v19.2
- **Data:** Março de 2026
- **Motivo:** Persistência de dados de eficiência de suprimentos para auditoria avançada e monitoramento de planejamento de equipes.
- **Diferenças:**
  - *Database (v19.2 Diamond):* Adição das colunas `supplier_interest_expenses`, `emergency_purchase_expenses` e `emergency_units_total` nas tabelas `companies` e `trial_companies`.
  - *View de Auditoria:* Criação da view `view_supply_chain_health` para permitir ao Tutor identificar rapidamente equipes com custos excessivos de suprimentos.
  - *Simulation Kernel:* O motor de simulação agora exporta esses dados de telemetria para o Supabase em cada Turnover.
- **Status:** Em produção.

### v2026-03.9 - Suprimentos Estratégicos & Dashboard do Tutor
- **Data:** Março de 2026
- **Motivo:** Implementação de juros de fornecedor, ágio de compra de emergência e ampliação da telemetria estratégica para o Tutor.
- **Diferenças:**
  - *Juros de Fornecedor:* Acréscimo no custo de aquisição de MP para compras a prazo.
  - *Compra de Emergência:* Aquisição automática de MP faltante com incidência de ágio (`special_purchase_premium`).
  - *Dashboard do Tutor:* Inclusão de indicadores de juros, ágio, reajustes de MP e alertas visuais para eventos "Black Swan".
- **Status:** Em produção.

### v2026-03.8 - Agenda de Compromissos Financeiros (Cash Flow Commitments)
- **Data:** Março de 2026
- **Motivo:** Fornecer às equipes uma visão clara dos direitos e deveres já comprometidos no Balanço Patrimonial que impactarão o Fluxo de Caixa futuro.
- **Diferenças:**
  - *Agenda Financeira:* Novo relatório no Strategic Hub que consolida Direitos (Receivables) e Deveres (Payables).
  - *Correção Contábil (DFC):* O Fluxo de Caixa Projetado agora liquida corretamente o Imposto de Renda provisionado no período anterior (`prevTaxes`), seguindo o regime de caixa para pagamentos de tributos.
  - *Transparência:* Facilita o planejamento financeiro ao separar o que é "geração de caixa operacional do período" do que é "liquidação de compromissos passados".
  - *Database:* Adição das colunas `total_receivables` e `total_payables` nas tabelas `companies` e `trial_companies` para telemetria direta e auditoria rápida.
- **Status:** Em produção.

### v2026-03.7 - Refatoração UI/UX: Cockpit & Strategic Hub v18.5
- **Data:** Março de 2026
- **Motivo:** Aprimorar a visualização estratégica e a experiência do usuário, transformando dados complexos em insights acionáveis.
- **Diferenças:**
  - *Cockpit Operacional (Dashboard):* Glassmorphism, tooltip de E-SDS dinâmico por IA, Sidebar Intel Pulse.
  - *Decision Terminal (DecisionForm):* Wizard UX por passos com animações fluidas (`framer-motion`), War Room Header unificado, inputs didáticos.
  - *Strategic Hub:* Design de alta fidelidade das tabelas de DRE/Balanço com tipografia mono-espaçada nos valores, variação em percentual integrada de tendência e visualização de auditoria.
- **Status:** Em produção.

### v2026-05.1 - Reconciliação Contábil Oracle-Sapphire
- **Data:** Maio de 2026
- **Motivo:** Garantir integridade fiduciária impecável entre o fluxo de caixa (DFC), a movimentação de passivos nos demonstrativos fiscais e as baixas de clientes e PECLD no Balanço Patrimonial, mitigando descompassos decimais de float através de uma validação de fechamento exata.
- **Diferenças:**
  - *Fluxo de Impostos no Caixa:* Substituição do `taxProv` do período atual pelo pagamento real do tributo acumulado anterior `prevTaxes` (regime de caixa puro).
  - *Sincronização de Financiamento de Capex:* Inclusão do financiamento BDI de ativos novos (`newBdiLoanAmount`) no caixa e registro nas entradas da DFC de empréstimos, impedindo quedas artificiais do caixa operacional por compras a prazo de imobilizados.
  - *Contas a Receber e PECLD:* Reconciliação do recebimento de vendas a prazo para considerar a baixa contábil líquida anterior (`prevClients - prevPecld`), zerando disparidades de créditos.
  - *Auditoria Float Precision (Z-Guard):* Uma rotina de auditoria matemática do Balanço de Encerramento absorve divergências microscópicas de arredondamento de float do JavaScript e equilibra de forma inexorável o Ativo com o Passivo + PL.
- **Status:** Em produção.

### v2026-03.6 - Provisionamento de PPR e Rescisão Proporcional
- **Data:** Março de 2026
- **Motivo:** Alinhamento contábil com o princípio da competência e realismo no fluxo de caixa de demissões.
- **Diferenças:**
  - *PPR (Provisionamento):* Provisionamento em `liabilities.current.ppr_payable` (Passivo Circulante) e reconhecido como despesa no DRE.
  - *PPR (Pagamento):* Pagamento na rodada seguinte na rubrica `cf.outflow.payroll`.
  - *Rescisão:* Em caso de demissão, liquidação do PPR proporcional provisionado na rescisão além do salário e multa rescisória (1 salário base).
- **Status:** Em produção.

### v2026-03.5 - Kernel v19.1: Decisões Dinâmicas & Recuperação Judicial
- **Data:** Março de 2026
- **Motivo:** Integração total dos inputs do `DecisionForm.tsx` ao motor de simulação, garantindo que todas as escolhas das equipes tenham impacto real.
- **Diferenças:**
  - *Recuperação Judicial (RJ):* Queda de 15% na demanda, ágio de 50% sob juros, bloqueio de novos empréstimos/BDI e limite de 40% no CapEx.
  - *Gestão de Suprimentos:* Payment Type integrado (A Vista, 15 dias, 30 dias).
  - *Produção Extra:* Turno Extra (Hora Extra) ativo com penalidade hora de 50%.
  - *P&D Dinâmico:* Investimento em P&D como percentual direto de receita.
  - *Recursos Humanos:* Salários, bônus de produtividade e PPR dinâmicos.
  - *Financeiro:* Processamento de empréstimos manuais de 6, 12 ou 24 rounds, aplicações financeiras operacionais e Term Interest Rate (receitas a prazo).
- **Status:** Em produção.

### v2026-03.2 - Financiamento BDI e Ativos Fabris
- **Data:** Março de 2026
- **Motivo:** Regras de CapEx (compra/venda de equipamentos), carência de financiamento BDI e impacto de treinamento de novas tecnologias na produtividade.
- **Diferenças:**
  - *Financiamento BDI:* Carência de 4 rounds (juros apenas) + 4 rounds de amortização (principal+juros). Mutação de parcelas (reclassificação de LP para CP no Balanço).
  - *Treinamento:* Exigência mínima de 5% do CapEx de novas máquinas para operar com 100% de produtividade (caso contrário, penalização imediata de 25%).
  - *Capacidade:* Restrição baseada na disponibilidade física de operadores contratados vs maquinários.
  - *E-SDS v1.2:* Incorporação de pesos dinâmicos por setor de atuação de arenas e threshold de rebaixamento de score por Dívida Líquida / EBITDA > 6.0.
- **Status:** Em produção.

### v2026-03.1 - Refinamento de PECLD e Mix de Prazo
- **Data:** Março de 2026
- **Motivo:** Ajuste na lógica de PECLD para incidir única e exclusivamente sobre vendas a prazo e inclusão de prazos de recebimento regional (A vista, 50%, 33%).
- **Status:** Em produção.

### v2026-03 - E-SDS v1.1 e Telemetria P0
- **Data:** Março de 2026
- **Motivo:** Substituição de Kanitz pelo E-SDS v1.1 e telemetria de auditoria para o Round 0 (P0).
- **Status:** Em produção.

### v2025-12.3 - Autonomia de BOTs e Visualização de Solvência
- **Data:** Dezembro de 2025
- **Motivo:** Garantir concorrência em tempo real equilibrada com bots autônomos e clareza de solvência de caixa para as equipes.
- **Status:** Em produção.

### v2025-12.2 - Implementação do Altman Z''-Score
- **Data:** Dezembro de 2025
- **Motivo:** Substituição de Kanitz pelo Altman Z''-Score para exatidão internacional focado nos mercados emergentes fechados.
- **Status:** Em produção.

### v2025-12 - Visibilidade de Mercado e Valor da Ação
- **Data:** Dezembro de 2025
- **Motivo:** Introdução do KPI `share_price` derivado de PL líquido e tabelas ampliadas na Gazeta News para monitoramento e auditoria transparente do Tutor.
- **Status:** Em produção.

### v2025-11 - Correção de Consumo de MP (3:2)
- **Data:** Novembro de 2025
- **Motivo:** Garantir a proporcionalidade correta na fabricação de unidades industriais (3 MP-A e 2 MP-B por PA).
- **Status:** Em produção.

### v2025-10 - Implementação de Empréstimo Compulsório
- **Data:** Outubro de 2025
- **Motivo:** Proteção contra quebra de caixas e solvência imediata com juros TR automáticos.
- **Status:** Em produção.
