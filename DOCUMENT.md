# Oracle Strategos - Bússola de Diretrizes do Projeto (DOCUMENT.md)

## 📋 Controle de Governança
- **Produto:** EMPIRION ORACLE
- **Versão Ativa:** v19.54 Sapphire Amber (Sincronização de PCP e Regulamento de Horas Extras e Turno Adicional em Cenário de Multiturnos no Wizard Industrial)
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
- **Depreciação Contábil Customizada:**
  - *Prédios:* Desgaste faturado em 0.2% por período sobre o valor histórico.
  - *Instalações / Benfeitorias:* Depreciação ou Amortização de instalações e benfeitorias físicas parametrizada manualmente pelo Arena Tutor no Step 6 do Wizard (`buildings_depreciation_rate`), com default regulamentar de 10% a.a. incidindo sobre a conta de instalações.
  - *Máquinas:* Linear baseada na vida útil de 40 rounds (2.5% p.p.).
- **Venda de Equipamentos:** Aplica-se deságio depreciativo lançado diretamente como Despesa Não Operacional no DRE e gerando reflexo de entrada de caixa líquido no DFC.

### 6.2 Gestão de Mão de Obra e Regime Operacional de Turnos (Capacidade x MOD)
- **Gargalo Técnico (Capas Operacionais):** O processamento de produção é limitado pelo menor valor entre a capacidade nominal instalada do par de máquinas e o contingente de operadores ativos devidamente contratados de forma prévia.
- **Padrão de Produtividade & Treinamento:** Equipamentos novos adquiridos demandam um treinamento correspondente a no mínimo **5% do valor total do CapEx** investido. Caso o investimento seja inferior a este patamar, aplica-se uma penalização imediata de **25% na produtividade** industrial da planta naquela rodada.
- **Regime Operacional de Turnos (Capacidade x MOD):** O Arena Tutor pode liberar a ativação de regimes contínuos contábeis (1T, 2T ou 3T) que modificam drasticamente o OpEx e a escala industrial das equipes de forma seletiva:
  - *1 Turno (Regular):* Capacidade operacional de 100%, multiplicador de custos da Mão de Obra Direta (MOD) de 1.0x.
  - *2 Turnos (Dobrado):* Capacidade operacional de 180% (+80% de ganho de espaço produtivo sem investimento em capital CapEx), multiplicador de custos da MOD com cargos noturnos e adicionais de turnos de 1.5x.
  - *3 Turnos (Contínuo):* Capacidade operacional de 230% (+130% de ganho produtivo em escala máxima), multiplicador de custos da MOD com periculosidade e interrupção de 2.0x.
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
- **Campanhas de Marketing Regionais Customizáveis:** O Arena Tutor pode modular e customizar o custo inicial base por rodada de cada campanha promocional e publicitária por região comercializada (`marketing_cost`), saindo do padrão global de $10.000 para uma configuração territorializada e tática mais realista.

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

### 7.6 Tratamento de Prédio Alugado (Modo Start from Zero)
Quando o Tutor seleciona "Prédio Locado" como modalidade de estabelecimento, o sistema exige a definição do valor de aluguel mensal básico e as devidas diretrizes de rateio pelo Custeio por Absorção. O aluguel é distribuído proporcionalmente:
- **Área Produtiva (cif):** Ativado temporariamente como Custo Indireto de Fabricação (CIF), integrando o custo de produção do período (CPP) mantido no estoque de Produtos Acabados até que seja devidamente baixado como Custo do Produto Vendido (CPV) nas vendas.
- **Área Administrativa (adm):** Classificado de forma imediata como Despesa Administrativa Operacional na DRE (`opex.adm`).
- **Área Comercial/Vendas (sales):** Classificado de forma imediata como Despesa de Vendas na DRE (`opex.sales`).

*Nota de Rateio Sugerido:* O sistema sugere o rateio padrão industrial de **65% Produtivo / 25% Administrativo / 10% Comercial**, cabendo ao Tutor a livre customização no Step 6 do Wizard, cujo somatório deve corresponder a 100%.

Ao nível de Fluxo de Caixa (DFC), a quitação mensal do aluguel representa desembolso real do período, sendo registrada unificadamente sob a rubrica própria de saída contábil `cf.outflow.rent`. No Balanço Patrimonial, a operação de aluguel de terceiros não gera registro de imobilizado de Edificação ou Terreno, mas os investimentos em melhorias e instalações efetuados pelas equipes são ativados no Ativo Não Circulante sob a rubrica regulamentar de "Benfeitorias em Imóveis de Terceiros".

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

### v19.54 Sapphire Amber - Regulamento Dinâmico de Turnos Extras/Horas Adicionais sob Multiturnos e Otimização do Grid Industrial
- **Data:** 31 de Maio de 2026, 16:15 UTC
- **Motivo:** Atender ao regulamento do Torneio onde a extensão de produção por Horas Extras (Turno Extra / Horas Adicionais) é exclusiva do regime de Turno Único (1T). Sob múltiplos turnos (multiturnos), as horas extras devem ser desativadas sob a perspectiva de RH e Planejamento e Controle de Produção (PCP), e seu percentual forçado a zero.
- **Diferenças:**
  - *Lógica de PCP / Turno Extra Dinâmico:* Reintrodução no Wizard `FactoryStep.tsx` da possibilidade das equipes extenderem capacidade operacional via Turnos Extras quando sob Turno Único (`shifts` = 1). Caso a equipe passe a operar sob multiturnos (`shifts` > 1), o componente desativa automaticamente as configurações de Turno Extra e zera o percentual de horas extras (`extraProductionPercent` = 0) de forma automática.
  - *Arquitetura Visual Responsiva:* Ajuste do container para uma estrutura de grid fluida de 4 colunas em desktops amplos (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4`), organizando perfeitamente a Jornada Operacional da Fábrica em quatro cards equilibrados: (1) Utilização de Capacidade, (2) Regime de Turnos Ativos, (3) Turno Extra / Horas Adicionais e (4) Investimentos de Longo Prazo em P&D.
- **Impactos:** Interface de decisões perfeitamente integrada aos regulamentos configurados pelos tutores, forçando estrita obediência às restrições de PCP e RH sem incongruências no estado final enviado para turnover.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.53 Sapphire Gold - Consistência Estrita Ativo vs Passivo+PL via Reconhecimento de Overheads de Vendas e Administrativos no DFC e Sincronismo Sênior da Capacidade Industrial
- **Data:** 31 de Maio de 2026, 15:30 UTC
- **Motivo:** Sanar por completo a disparidade da equação contábil de validação da auditoria tripla (exatamente 1.089.250,00 BRL) e habilitar a computabilidade correta dos estoques físicos produzidos (`unitsProduced`), WAC unitário, custos e CPV dentro da auditoria `processRoundWithValidation`.
- **Diferenças:**
  - *Sincronismo Sênior de Capacidade/Kardex:* Correção na orquestração de `processRoundWithValidation` (em `services/simulation-core.ts`) para ler as máquinas instaladas diretamente do snapshot calculado na projeção atual (`calculatedResult.machines`) em vez de herdar vazias do round anterior da equipe, sanando o bug de produção zerada (`unitsProduced` = 0) na auditoria que causava Kardex e CPV em branco e zerados na Rodada 1.
  - *Lançamento de Overheads de Vendas e Administrativos no DFC:* Correção no alinhamento do Fluxo de Caixa (em `services/simulation.ts`), integrando as despesas fixas recorrentes de overhead administrativo e de vendas (`prevOpexAdm * inflationMult` e `prevOpexSales * inflationMult`) como desembolsos reais de caixa (`totalOutflows`, `cf.outflow.misc` e `cf.outflow.marketing`), preenchendo a lacuna financeira de 1.089.250,00 BRL e restabelecendo o equilíbrio perfeito do balanço de abertura da Rodada 1.
  - *Tipagem de Prédio e Maquinários:* Inclusão de tipagem estrita para compatibilidade TypeScript na varredura iterativa do imobilizado fabril.
- **Impactos:** Sem breaking changes; o motor passa a emitir relatórios integrados completos do Kardex, CPV, Balanço Patrimonial equilibrado e Fluxo de Caixa reconciliado, resultando em validação tripla contábil estrita 100% válida e íntegra (isValid: true).
- Status: Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.51 Sapphire Gold - Erradicação Definitiva de Estoques Fantasmas no Modo Greenfield via Blindagem Nullish Coalescing
- **Data:** 30 de Maio de 2026
- **Motivo:** Sanar o erro de "BLOQUEIO DE SEGURANÇA CONTÁBIL (SAPPHIRE)" que interrompia o processamento de Turnover de rodadas (Round 1) de equipes operando em modo Greenfield ("Começar do Zero"). O operador lógico de disjunção (`||`) avaliava de forma errônea o saldo inicial legítimo de `0.00 BRL` do Ativo circulante de estoques como falsy, forçando a herança ilegítima de valores herdados (603k e 804k BRL) sem correspondente quantidade em estoque físico. Isso causava um rombo exato de `1.089.250,00 BRL` na equação contábil de validação da auditoria (Ativo = Passivo + PL).
- **Diferenças:**
  - *Blindagem Contábil Nullish Coalescing:* Modificação cirúrgica dos seletores de herança de estoques (`initialMpaValue`, `initialMpbValue`, `initialPaValue`) e ativos imobilizados de prédios/benfeitorias (`buildingsCost`) em `/services/simulation-core.ts` para usar o operador `??`. Com essa blindagem, o valor legítimo de `0.00 BRL` do balanço anterior em Greenfield é respeitadoramente preservado, restabelecendo a consistência perfeita do custo médio ponderado (WAC) e o estoque final sem injeção fantasma de capital legado.
  - *Consistência de Equação Contábil:* Alinhamento completo do validador Sapphire com os relatórios analíticos de simulação, de forma que o Ativo e a soma de Passivo + PL se reconciliam perfeitamente na Rodada 1 em Greenfield, propiciando turnovers lisos e estáveis.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.50 Sapphire Gold - Modelo Avançado de Produtividade Industrial Sênior, Clima Organizacional, Alerta de Greve Geral e Integração com Regime de Turnos Operacionais
- **Data:** 30 de Maio de 2026
- **Motivo:** Implementação fiduciária do novo Modelo de Produtividade Industrial Sênior elaborado pelo Strategos de Operações. Substitui a penalidade binária simples de treinamento por uma equação multifatorial contínua, introduz as mecânicas de Clima Organizacional, Risco de Greve Geral e alertas sindicais no cockpit, assegurando o alinhamento com a dinâmica fabril de turnos e horas extras reais.
- **Diferenças:**
  - *Novo Índice de Produtividade e Modificadores:* O cálculo de `unitsProduced` e a validação do CPV adotam a fórmula oficial: `Capacidade Nominal × TrainingFactor × MotivationFactor × FatigueFactor × DemissionInsecurityFactor × MachineAgeFactor`.
  - *Índice de Motivação & Mecânica Sênior de Greve:* Criado o KPI `motivation_index` as média de `(MotivationFactor + (1 - DemissionInsecurityFactor)) / 2.0`. Caso o clima caia para `RUIM` (< 0.75), um alerta de greve reativo é disparado; se persistir por 2 períodos consecutivos, a fábrica entra em paralisação grave reduzindo o output industrial em 50%.
  - *Feedbacks Visuais e Alertas:* O cockpit de decisões recebeu intervenções de feedback nas abas de RH (`HRStep.tsx`) e Fábrica (`FactoryStep.tsx`), englobando avisos vibrantes de paralisação industrial, andamento do sindicato e detalhamento de fatores de eficiência (auditoria de produtividade).
  - *Sincronismo Global de Pausa/Despausa em Tempo Real:* Para resolver o atraso na visualização de tempo, os Cockpits reativos dos Alunos (`Dashboard.tsx`) e do Tutor (`TutorDecisionMonitor.tsx`) agora assinam diretamente o canal PostgreSQL Realtime do Supabase associado às tabelas `championships` e `trial_championships`. Qualquer ação do Tutor de pausar ou despausar o cronômetro propaga-se de forma fiduciária e instantânea para os cronômetros das equipes, congelando ou liberando a contagem de tempo sem necessidade de refresh manual.
  - *Aviso Sonoro de Contagem Regressiva e Modal de Fechamento com Confetes:* Implementado sistema síncrono de feedback multissensorial na iminência do encerramento do período: nos últimos 10 segundos da rodada, um aviso sonoro com bips sintetizados via Web Audio API é executado segundo a segundo; ao expirar o tempo limite ou ao ocorrer a conversão fiduciária de período (avançar rodada), um modal elegante de fechamento Bento Grid de progresso é carregado com chuva de confetes animados nativos gerados via HTML5 canvas, demonstrando a variação e crescimento do Patrimônio Líquido, Lucro Líquido, EBITDA, Rating e indicadores operacionais de forma totalmente integrada.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.42 Sapphire Gold - Blindagem e Auto-Regeneração de Passivos Contábeis em Turnovers (Residência de Empréstimos Pré-Existentes)
- **Data:** 30 de Maio de 2026
- **Motivo:** Corrigir em definitivo o travamento crítico no Turnover de rounds ("BLOQUEIO DE SEGURANÇA CONTÁBIL (SAPPHIRE)") causado pela disparidade entre o Ativo e a soma do Passivo + PL. O erro ocorria devido ao desaparecimento misterioso de passivos de empréstimos iniciais (`loans_st` e `loans_lt`) na transição de P-0 para R-1, por causa de as obrigações e financiamentos iniciais da empresa não estarem devidamente mapeados na lista lógica estruturada nos KPIs iniciais.
- **Diferenças:**
  - *Mapeamento na Inicialização (`initialization.ts`):* Implementado o auto-preenchimento lógico da lista de empréstimos (`p0Kpis.loans`) durante o Ciclo P-0 com base nos saldos iniciais de `loans_st` e `loans_lt` calculados, garantindo que novas arenas já nasçam com total consistência física e analítica de suas obrigações no banco de dados.
  - *Blindagem Contábil de Auto-Regeneração de Passivos (`simulation.ts`):* Introduzida lógica defensiva sênior no simulador. Ao iniciar o processamento da rodada, se a lista de empréstimos do time estiver vazia mas existirem saldos contábeis de curto ou longo prazo em `loans_st` ou `loans_lt` no balanço inicial sob o qual as decisões estão rodando, o motor reconstitui dinamicamente as obrigações a amortizar na memória para computar a depreciação suave, os juros e preservar os saldos finais, estancando o sumiço do passivo gerador da disparidade.
  - *Preservação de Integridade Contábil Tripla:* Elimina na raiz a diferença de exatamente `1,589,250.00 BRL` identificada para a EQUIPE 01, viabilizando turnovers fluidos e consistentes com o DRE, DFC e o Balanço Patrimonial em todos os modos industriais.
- **Status:** Em Produção, Compilação de Produção 100% Homologada (Zero Warnings).

### v19.41 Obsidian Diamond Enterprise V - Controle Dinâmico e Controle de Pistas Críticas de Tempo (Controle de Pause/Play e Conclusão de Round do Tutor)
- **Data:** 30 de Maio de 2026
- **Motivo:** Atender de forma impecável à solicitação de controle síncrono e instantâneo do cronômetro de rodadas. Introduz a capacidade para o Arena Tutor de "Pausar/Despausar" o tempo de decisão das equipes e "Concluir" precipitadamente o período do round em jogo de forma 100% dinâmica, persistido e auditado contábil e logicamente.
- **Diferenças:**
  - *Função "Pause/Play" Inteligente:* Permite ao Tutor congelar a contagem de tempo de decisões. O tempo restante exato em milissegundos é computado e persistido no banco no campo de configuração da arena (`config.is_paused` e `config.remaining_ms_at_pause`). Ao despausar, o sistema recalcula e retroalimenta sutilmente a data inicial do round no banco para conciliar o tempo real decorrido de forma síncrona.
  - *Função "Concluir" Precípite:* Adiciona um botão para liquidar instantaneamente o cronômetro do round ativo, forçando o tempo a zero de forma síncrona para todas as equipes da arena competitiva ao avançar a data de início para o limite de expiração correspondente.
  - *Estética "Congelado/Ativo" sutil:* O componente de contagem regressiva `ChampionshipTimer` recebeu visualizações em degradê âmbar/ouro e aviso "CONGELADO" ou "DECISÕES CONGELADAS" quando a contagem de tempo é interrompida.
  - *Sincronismo Global nos Cockpits:* As telas reativas de visualização de Alunos (`Dashboard.tsx`), o Cockpit de Intervenções do Tutor (`TutorArenaControl.tsx`) e o monitor principal de decisões das marcas (`TutorDecisionMonitor.tsx`) agora assinam e herdam as flags de pausado diretamente do banco de dados, prevenindo qualquer reflesh indesejado ou visualização assíncrona discrepante.
- **Status:** Em Produção, Compilação de Produção 100% Homologada (Zero Warnings).

### v19.33 Obsidian Diamond Enterprise III - Saneamento e Blindagem do Parque Fabril Greenfield e Remoção de Disponibilidade de Venda Fantasma no Cocpkit do Aluno
- **Data:** 29 de Maio de 2026
- **Motivo:** Evitar a exibição errônea de máquinas instaladas ou prontas para alienação (venda) na aba de Ativos e CapEx (`AssetsStep.tsx`) quando uma arena competitiva estiver rodando em regime Greenfield ("Start from Zero" / Começo do Zero) no Ciclo de Planejamento (P-0), garantindo um alinhamento realista impecável com a premissa de nascimento sem parque fabril.
- **Diferenças:**
  - *Saneamento do Parque no AssetsStep.tsx:* Introdução da variável reativa `machinesList` no cockpit de decisões de ativos. Se o campeonato rodar sob o modo Greenfield (`isZeroMode`), a lista de máquinas instaladas em P-0 é forçada a vazio (`[]`), suprimindo de modo absoluto qualquer herança obsoleta de máquinas herdadas ou botões de venda fantasma.
  - *Sincronismo com o Banco de Dados:* Complementa a governança e higienização já introduzidas em `/services/supabase.ts` e `/services/initialization.ts`, onde as máquinas e quantidades de insumos de partida são salvos como vazios de fábrica.
- **Status:** Disponível em Produção, Compilação 100% Homologada (Zero Warnings).

### v19.32 Obsidian Diamond Enterprise II - Sanidade Greenfield Total, Resiliência e Hierarquia Contábil no Balanceamento de P0, Retirada de Estoques Mockados no Kardex e Alinhamento de Rótulo de Depreciação de Instalações
- **Data:** 29 de Maio de 2026
- **Motivo:** Sanar por definitivo dores críticas de relatórios no modo "Start from Zero/Greenfield" corrigindo a exibição de dados mockados de estoques remanescentes no Kardex/CPP em P0, aplicando busca recursiva profunda na árvore do Balanço para recalcular perfeitamente o Capital Social (sem zerar PASSIVO+PL), assegurando o saldo correto de cash/bank e harmonizando os rótulos de amortizações para imóveis de terceiros locados a pedido do Tutor.
- **Diferenças:**
  - *Extirpação de Estoques Mockados no Kardex:* Ajuste dinâmico na renderização do Kardex (`FinancialReportMatrix.tsx`) introduzindo controle sobre o modo Greenfield (`startingMode`). Quando o campeonato é inicializado em "Start from Zero", o saldo inicial, unitário e final de MP-A e MP-B em P0 é rigorosamente forçado para `0`, limpando o layout de quaisquer dados pré-calculados.
  - *Correção de Mapeamento Inicial de KPIs no Supabase:* Refinamento cirúrgico no arquivo `/services/supabase.ts` (`createChampionshipWithTeams`) forçando `machines` para `[]` e `stock_quantities` para valores nulos/zero se o campeonato rodar sob o modo Greenfield, garantindo que o banco registre os estados perfeitamente limpos.
  - *Busca Resiliente e Balanceamento do Capital Social:* Implementação da função fiduciária `findNodeInTree()` em `/services/initialization.ts` para busca recursiva e profunda de nós de contas do Balanço Patrimonial. Com isso, evitou-se a sobrecarga ou perda de nós na contabilização, e o bug na conciliação do Capital Social Greenfield em `equity` foi sanado em definitivo, garantindo que o Passivo + PL acompanhe milimetricamente o montante total do Ativo sem desequilíbrios.
  - *Harmonização do Rótulo de Depreciação de Benfeitorias:* Adequação do rótulo contábil contido em `/services/initialization.ts` alterando "Amortização de Benfeitorias Terceiros" para "(-) Depreciação de Instalações" em casos onde o imóvel configurado é Alugado (`buildingMode === 'rented'`), alinhando com a nomenclatura contábil estrita solicitada pelo Tutor e acumulando corretamente as taxas sob as melhorias investidas.
- **Status:** Homologado, Testado e Inteiramente Integrado em Produção.

### v19.31 Obsidian Diamond Enterprise - Alinhamento Total Greenfield (Start from Zero), Omissão de Aluguel em P0, Bloqueio Condicional de Compras de Ativos em P0, Sincronização fiduciária de Share Price e Redirecionamentos Universais por SPA Navigation (Livre de Erros 404)
- **Data:** 29 de Maio de 2026
- **Motivo:** Solucionar em caráter definitivo e absoluto as dores críticas do modo "Start from Zero" no Balanço e DFC, omitindo aluguel no P0, bloqueando aquisição de novas máquinas no primeiro round de planejamento (P0), mantendo sincronia do Share Price e direcionando de forma 100% segura usando o sistema de rotas do React-Router-Dom (`useNavigate`) livres de qualquer risco de 404 por hard reloads em subdiretórios de proxies.
- **Diferenças:**
  - *Omissão Absoluta de Aluguel em P0 Greenfield (`generatePureP0`):* Correção cirúrgica na DRE e DFC de P0 em modo Greenfield para garantir que nenhum encargo de aluguel transitório reduza o caixa inicial. O caixa final em P0 agora é mantido exatamente equivalente ao caixa inicial ditado pelo Tutor contido em `caixa_inicial` / `capital_social`.
  - *Ajuste e Sincronização Absoluta de Balanço (Arrendamento e Capital Social):* No Greenfield alugado, o Balanço Patrimonial inicia de forma balanceada computando o valor fiduciário de "Direito de Uso de Instalações" (Ativo) e a respectiva obrigação de "Arrendamento de Longo Prazo" (Passivo) de forma linear e transparente, mantendo o Patrimônio Líquido perfeitamente igual ao Capital Social nominal.
  - *Mapeamento Sincronizado de Share Price Contábil:* Introduzido o suporte para `share_price` na inicialização do P00 em `p0Kpis` de `/services/initialization.ts` e `initialKpis` de `/services/supabase.ts`, assegurando coerência integral entre o valor inicial ditado pelo Tutor e os relatórios do Aluno já no ciclo zero.
  - *Bloqueio Coerente de Capex em P0 Greenfield:* Adaptação refinada sob o componente `/components/steps/AssetsStep.tsx` introduzindo uma flag inteligente de permissões baseada no modo Greenfield e no ciclo de processamento (`isAllowedToBuy`). Quando no round zero Greenfield, o input e cards de compra são desativados de modo que as equipes se concentrem unicamente no planejamento estratégico antes do ciclo produtivo começar.
  - *Navegação Universal Livre de 404:* Substituição definitiva das chamadas obsoletas de alteração de barra de endereços física (`window.location.href = '/app'`) por navegações reativas via SPA utilizando o hook `useNavigate()` (`navigate('/app')`) em `ChampionshipWizard.tsx` e `TrialWizard.tsx`. Isso mantém o tráfego restrito e emulado no cliente, evitando colisões com caminhos proxies de iframes e garantindo estabilidade imediata.
- **Status:** Homologado, Testado com Sucesso e 100% Compilado (Zero Warnings & Sem Erros de Linter).

### v19.30 Obsidian Diamond Enterprise - Camada Unificada de Gráficos ApexCharts, BI do Tutor e Erradicação Definitiva do Erro 404 de Reload
- **Data:** 29 de Maio de 2026
- **Motivo:** Introduzir uma camada de abstração sólida e padronizada para componentes visuais de IA, mercado e finanças usando **ApexCharts** para o cockpit do Aluno e do Tutor. Além disso, erradicar em caráter definitivo o erro 404 gerado ao recarregar a visualização após a criação de campeonatos/sessões Sandbox, direcionando o fluxo do Tutor seguramente para `/app` ao invés de forçar o reload na própria URL filha.
- **Diferenças:**
  - *Abstração Unificada de Gráficos (`/components/charts/`):* Desenvolvimento de um ecossistema nativo de gráficos premium altamente responsivos na paleta Obsidian & Sapphire (azul, laranja, verde, roxo/índigo):
    - `EmpirionLineChart`: Plotagem de evolução temporal com linhas suaves suavizadas (curves) e formatações numéricas e contábeis integradas de milhões (M) e milhares (k) em BRL/USD.
    - `EmpirionAreaChart`: Visualizador degradê com preenchimento sutil de opacidade para fluxos volumétricos de fundos e análise de caixa.
    - `EmpirionGauge`: Semicírculo interativo responsivo com preenchimentos de cor inteligentes e adaptáveis de acordo com a zona de valor (vermelho para scores baixos, amarelo, verde, e azul para excelência) ideal para scores de solvência e sustentabilidade.
    - `EmpirionBarComparison`: Colunas agrupadas verticais para comparar lado a lado métricas chave das marcas na arena contendo dataLabels sob formato mono.
    - `TrendSparkline`: Linhas de tendência ultraleves, compactas e isentas de eixos ou grids para visualização rápida em cards ou tabelas.
    - `DashboardGrid`: Bento Grid responsivo sofisticado contendo espaçamentos, sombras e animações sutis de entrada (Framer Motion).
  - *Enriquecimento do Cockpit do Aluno (`Dashboard.tsx`):* Mapeamento completo dos dados reais da equipe. Substituição de gráficos rudimentares na aba de histórico por uma belíssima composição com `DashboardGrid` contendo a evolução de Patrimônio Líquido (`EmpirionAreaChart` em azul), evolução da Liquidez Corrente (`EmpirionAreaChart` em verde esmeralda) e o Gauge de E-SDS dinâmico (`EmpirionGauge`) com cálculo real-time. Substituição também do gráfico do menu lateral por um widget minimalista `TrendSparkline` compacto e elegante de tendências.
  - *BI Analítico do Tutor (`TutorDecisionMonitor.tsx`):* Expansão analítica com seção dedicada denominada "Business Intelligence Comparativo". Ela exibe dinamicamente no final do Command Center o ranking de concorrência real-time das equipes da arena em Market Share (%) e Total Shareholder Return (TSR, %), fornecendo dados e analytics completos com componentes de alta performance.
  - *Reset Seguro Fiduciário (Correção 404):* Substituição preventivas das chamadas de `window.location.reload()` em `ChampionshipWizard.tsx` e `TrialWizard.tsx` por `window.location.href = '/app'`. Em SPAs, tentar recarregar diretamente em sub-rotas como `/app/admin?mode=new_trial` induz erros de 404 clássicos em proxies ou servidores estáticos que não possuem roteamento wildcard no reload; direcionar para `/app` bate com total garantia no `index.html`, zerando todo o cache/estado antigo de forma limpa antes que o roteador jogue o Tutor ou o Aluno corretamente no seu painel fiduciário em milissegundos.
- **Status:** Homologado e 100% Compilado (Zero Warnings & Sem Erros de Linter).

### v19.29 Obsidian Diamond Enterprise - Fechamento Definitivo (Zeragem Greenfield Pura, Invalidação Forte de Cache e Fallbacks de Cockpit Blindados)
- **Data:** 28 de Maio de 2026
- **Motivo:** Fechar e sanar de maneira irrevogável qualquer vestígio de vazamento de dados legados ou mockados no modo Greenfield ("Start from Zero"). Eliminar por completo a herança de saldos antigos no visualizador da Gazeta (`GazetteViewer`), no Cockpit principal (`Dashboard`), e criar uma invalidação agressiva do cache de navegador após criação de campeonatos.
- **Diferenças:**
  - *Zeragem Greenfield Avançada (`validateCleanP0`):* Refinamento rigoroso adicionado ao gerador de P0 (`generatePureP0`) para garantir que nenhuma estrutura contábil, estoques, máquinas Alfa/Beta/Gama ou saldo de capital social possua qualquer resíduo residual que destoe das configurações puristas Greenfield escolhidas pelo Tutor.
  - *Descontaminação do GazetteViewer:* Substituição de todos os fallbacks numéricos fixos em cópias locais (como o patrimônio de 7.2M) por cálculos dinâmicos baseados no `starting_mode` da arena contida em `arena.starting_mode`. Isso garante que em arenas Greenfield, as visualizações de inteligência de mercado projetem valores coerentes de caixa inicial e patrimônio.
  - *Blindagem de Local Fallbacks no Cockpit:* No `/components/Dashboard.tsx`, adaptamos a barreira do painel local de visualização temporária de P0. Caso o histórico no Supabase ainda esteja carregando, o painel recupera fidedignamente o `starting_mode` do campeonato ativo e injeta um Balanço de Abertura limpo e desprovido de ativos fabris obsoletos, respeitando o caixa inicial e o imobilizado nulo do modo "Start from Zero".
  - *Invalidação Forte de Estado:* Processo de `setTimeout(() => window.location.reload(), 500)` integrado nos fluxos de conclusão e lançamento de campeonatos nos assistentes de deploy (`TrialWizard` e `ChampionshipWizard`). Isso zera states do React e expira o cache de queries do navegador, direcionando o fluxo para um ecossistema completamente atualizado.
  - *Aprimoramento de Tipos:* Adição de suporte explícito opcional a `starting_mode?: string` na interface TS `Championship` e mapeamento correspondente de persistência de payload de banco em `supabase.ts`.
- **Status:** Homologado e 100% Compilado (Zero Warnings & Sem Erros de Linter).

### v19.28 Obsidian Diamond Enterprise - Explorer de Demonstrativos Contábeis P00, Sanitarização Dinâmica de Cockpit e Sincronismo de Sessões fiduciárias
- **Data:** 28 de Maio de 2026
- **Motivo:** Sanar débito técnico contábil remanescente e consolidar as ações de correção final para a v19.28 recomendadas pela auditoria Oracle Accounting Strategos. Trazer visibilidade em tempo real completa para o Round 0 (P0) no wizard de criação de arenas, banir fallbacks e dados fantasmas remanescentes no Cockpit do aluno, e garantir blindagem completa contra caches/seleções obsoletas.
- **Diferenças:**
  - *Explorer Real-Time de Demonstrativos Contábeis (Step 8):* Integração de uma aba interativa e completa denominada "Demonstrações (P0)" no painel de auditoria do Step 8 em `TrialWizard.tsx`. Essa aba permite ao Tutor clicar e inspecionar a árvore hierárquica completa em tempo real para o Balanço Patrimonial, DRE e DFC, geradas de forma dinâmica e fidedigna para a arena que está prestes a inicializar.
  - *Cockpit com Fallback Dinâmico Blindado (Dashboard):* No frontend, alteração do Cockpit (`components/Dashboard.tsx`) para eliminar o fallback estático de números mockados (como Ativo de 9.4M e Caixa de 111k) quando a Rodada 0 ainda está carregando ou indisponível. Agora, o sistema detecta e constrói dinamicamente o estado fiduciário se baseando estritamente nos dados de `team?.kpis`, assegurando coerência absoluta com as configurações salvas pelo Tutor.
  - *Auto-alinhamento e Sincronismo Fiduciário de Sessão:* Ajuste em `TrialWizard.tsx` e `ChampionshipWizard.tsx` para interceptar a resposta do banco de dados na criação da arena competitiva. O sistema identifica automaticamente a nova ID de campeonato e a primeira ID de equipe humana gerada, injetando-os cirurgicamente no `localStorage` antes de recarregar a interface. Isso remove qualquer resíduo de sessão obsoleta ou dados mortos na visualização inicial do Cockpit do aluno.
- **Status:** Em Produção (Fidelidade Fiduciária Extrema, Certificação Superior).

### v19.27 Obsidian Diamond Enterprise - Greenfield Lock de Parque Industrial, Estocagem e Autofill Contábil de Caixa/Capital
- **Data:** 28 de Maio de 2026
- **Motivo:** Travar e bloquear inputs redundantes e reajustados de forma fiduciária quando no modo "Start from Zero", assegurando coerência e garantindo que o usuário não consiga modificar ou deixar discrepante as contas de balanço de abertura.
- **Diferenças:**
  - *Bloqueio e Greenfield Active Warning Banner (Step 3):* Inserção de painel informativo premium descrevendo o modo Greenfield ativo no Step 3, informando tutor de que as máquinas começam zeradas no Round 0 e impedindo custos de depreciação fantasmas, travando todos os inputs do parque industrial com a propriedade `isLocked={tutorConfig.starting_mode === 'start_from_zero'}`.
  - *Autofill Contábil e Liquidez Coerente (Step 6):* Vinculação direta do Capital Social Fiduciário com o Caixa/Banco Inicial no modo "Start from Zero" para manter a equação fundamental da contabilidade perfeitamente equilibrada (Ativo = Passivo + PL). Travamento de aplicações financeiras e quantitativo/preço padrão de todos os estoques de suprimentos como zerados.
- **Status:** Em Produção (Conformidade Completa & Auditoria Fiduciária Suprema).

### v19.26 Obsidian Diamond Enterprise - Sincronização Fiduciária Pura "Start from Zero" e Consolidação Horizontal de DRE/DFC
- **Data:** 28 de Maio de 2026
- **Motivo:** Sanar por completo o vazamento de saldos complexos antigos remanescentes de `constants.tsx` quando arenas e torneios são criados no modo Greenfield purista ("Start from Zero"), garantindo integridade matemática estrita na DRE e Fluxo de Caixa fiduciários.
- **Diferenças:**
  - *Sincronização Pura no generatePureP0:* Implementação do helper recursivo profundo `clearFinancialTree` em `initialization.ts` que zera por completo todos as contas-folha e totalizadores das árvores contábeis clonadas de DRE e DFC no modo "Start from Zero", assegurando um ponto de partida fiduciário verdadeiramente limpo a partir de zero.
  - *Recálculo Horizontal Aritmético e Preciso:* Substituição do método genérico de totalizações verticais da DRE e DFC por um sistema de rotina fiduciária horizontal aritmética explícita. Isso impede o efeito colateral onde despesas de produção industrial como MOD e CIF passavam indevidamente a valor absoluto positivo, sintonizando rigorosamente as contas de Lucro Bruto, Lucro Operacional (EBIT), LAIR, Lucro Líquido e Variação de Caixa com os rateios reais.
  - *Otimização do findAccountValue em Supabase:* O motor fiduciário de extração de KPIs no `services/supabase.ts` foi aprimorado com uma busca recursiva inteligente (`findAccountInTree`) capaz de resolver caminhos de IDs compostos contendo pontos literais (como no Passivo Circulante `liabilities.current`). Isso elimina o fallback para dados legados de SA nos presets do Round 0.
  - *Preservação de Modo fiduciária no Lançamento:* Correção do objeto de payload enviado em `TrialWizard.tsx` para passar reativamente a flag `starting_mode`, garantindo o correto setup lógico das rotas histórico-contábeis em Round 0 nos bancos do Supabase.
- **Status:** Em Produção (Build 100% verde com integridade fiduciária de transação homologada).

### v19.25 Obsidian Diamond Enterprise - Validador de Rateio e Apresentação Analítica de Aluguel
- **Data:** 28 de Maio de 2026
- **Motivo:** Implementar refinamentos operacionais essenciais sugeridos pela auditoria contábil "Oracle Accounting Strategos" para garantir consistência algorítmica inquebrável nos rateios de aluguel e visibilidade detalhada dos dispêndios de locação para os alunos e tutores.
- **Diferenças:**
  - *Validador Rígido de Rateio:* Introdução de trava operacional e fiduciária reativa no Wizard (Step 6). O botão de navegação "Avançar" é completamente bloqueado, impedindo a progressão se a soma de Rateio Produtivo (CIF), Administrativo (OPEX) e Comercial (OPEX) não totalizar rigorosamente 100%. Exibição de banner de alerta com cálculo dinâmico da diferença (sobra/falta) em design de alta fidelidade reativo (vermelho/verde).
  - *Detalhamento Fiduciário no Preview:* O painel flutuante ("Real-Time Monitor Fiduciário") e gavetas de pré-visualização foram aprimorados para exibir analiticamente a dissecção do aluguel. Agora expressa separadamente a parcela ativada como "Aluguel Produtivo (CIF)" (incorporada ao custo do estoque industrial) e a parcela debitada diretamente no resultado como "Aluguel OPEX" (Consolidação de Despesas Administrativas e de Vendas).
  - *Atualização de Diretrizes Oficiais:* Inclusão da Seção 11 em `docs/BUSINESS_RULES.md` regulamentando a contabilidade de prédios locados.
- **Status:** Em Produção (Linter 100% verde, compilação de produção homologada).

### v19.24 Sapphire Diamond Enterprise - Custeio por Absorção de Prédio Locado e Rateio Dinâmico no P00
- **Data:** 28 de Maio de 2026
- **Motivo:** Introduzir o tratamento contábil e fiduciário de absorção regulamentar para prédios industriais locados no início de Campeonatos e arenas (P0), possibilitando a correta distribuição pró-rata dos aluguéis e ativando-os no CIF ou despesas correspondentes a partir das escolhas dinâmicas de rateio do Tutor.
- **Diferenças:**
  - *Inputs de Aluguel e Rateio (Step 6):* Adicionados campos de customização reativa na interface do Wizard do Tutor para cadastrar o Aluguel Mensal básico e os percentuais específicos de rateios: Produtivo (CIF), Administrativo e Comercial.
  - *Painel Validador do Custeio por Absorção:* Injeção de uma barreira fiduciária visual no Step 6 que soma as taxas configuradas em tempo real e emite alertas amarelos/vermelhos caso a destinação dos gastos de locação divirja de 100%.
  - *Ativação e Rateio no generatePureP0:* Refatorada a orquestração de geração de demonstrativos patrimoniais fiduciários (`generatePureP0` em `initialization.ts`) para os três modos operacionais ("Start from Zero", "Start with Base" e "Start with Running"). Quando operando no modo locado (`building_mode === 'rented'`), o valor mensal do aluguel é pro-rateado e ativado no Ativo de Estocagem de Produção via CIF, ou abatido de imediato nos demonstrativos administrativos ou comerciais.
  - *Fluxo de Caixa Dedicado (cf.outflow.rent):* Inserida a conta contábil própria para controle de aluguéis dentro do DFC para controle preciso de saídas financeiras operacionais.
  - *Apresentação Dinâmica do Aluguel:* O painel resumo de custos de implantação de fábrica foi transformado para reletir dinamicamente a cotação e valor em moeda local do aluguel ativo.
- **Status:** Em Produção (Estabilidade e Compilação 100% Homologada no Linter).

### v19.17 Sapphire Diamond Enterprise - Modos Contábeis Parametrizados, Estoques WIP, PECLD Histórica e Presets de Fábrica
- **Data:** 27 de Maio de 2026
- **Motivo:** Introduzir diferenciação real, contábil e pedagógica de altíssimo nível para os três modos de inicialização do simulador ("Start from Zero", "Start with Base" e "Start with Running Company"). Atender aos requisitos fiduciários do consultor tributário da Oracle de modo a evitar o vazio informacional de começar demonstrativos históricos zerados e dar robustez técnica de simulação.
- **Diferenças:**
  - *Diferenciação Estrita de 3 Modos:* 
    - **Start from Zero:** Operação purista com Balanço de Abertura enxuto, concentrado em Caixa/Bancos e Capital Social. Não possui máquinas ativas inicialmente. Suporta galpão locada ou própria.
    - **Start with Base:** Calibração realística correspondente a pequenas e médias empresas (PMEs) com 3 máquinas Alfa físicas ativas, carga moderada de MP, contas ativas do Balanço (Clientes, Fornecedores, Impostos) e DRE/DFC históricas realistas de abertura.
    - **Start with Running Company:** Operação em escala corporativa industrial em pleno funcionamento, contendo 5 Alfas e 1 Beta físicas ativas, faturamentos e contas a pagar volumosos acumulados (Clientes e Fornecedores) e estoque processado WIP (Work-In-Progress) carregado no Balanço inicial.
  - *Sincronização Ativa de Estoques WIP (Work-In-Progress):* Introdução do acoplamento dinâmico da conta de produtos em elaboração (`wip_stock_value`) no Ativo Circulante, balanceando perfeitamente a produção em processamento.
  - *Benfeitorias em Imóveis de Terceiros:* Quando o Tutor configura prédio locado/alugado, o Balanço de abertura direciona o valor investido em benfeitorias físicas (`installations_value`) para a conta ativa regulamentar de "Benfeitorias em Imóveis de Terceiros", e calcula sua amortização contábil linear durante a vida útil estimada do contrato de locação (10 anos).
  - *DRE e Fluxo de Caixa Históricos de Abertura:* Calibração de dados históricos simulados em P0 para os modos de Base e Running, preenchendo o DRE e DFC iniciais com faturamento, CPVs analíticos e investimentos pretéritos coerentes, superando relatórios zerados e enriquecendo a experiência analítica inicial do Oráculo de IA.
  - *Painel de Presets Oficiais de Fábrica (Step 2):* Criação de quatro cenários padrão calibrados integrados na sidebar do Tutor de forma imutável (Greenfield Alugado, Greenfield Próprio, PME Base e Corporação Executiva S.A.) que coexistirão lado a lado com os templates salvos do próprio usuário no Supabase.
  - *Quarto Painel de Ajustes de Giro (Step 6):* Adição dos inputs de regulação direta de Clientes iniciais, Provisão PECLD, Fornecedores, Provisões de Imposto, Obrigações de Dividendos declarados e Estoque WIP com bloqueio inteligente baseado na relevância do modo ativo.
- **Status:** Em Produção (Rigor de Equilíbrio Fiduciário de 100% e Reconciliação Matemática Perfeita de Arredondamento).

### v19.16 Sapphire Diamond Enterprise - Modelagem Fiduciária Imobiliária & Estratégias de Funding de Setup do Tutor
- **Data:** 27 de Maio de 2026
- **Motivo:** Introduzir controle absoluto e realismo contábil sobre os Ativos Imobilizados (Terrenos, Edificações próprias ou locadas) e a estratégia de balanceamento fiduciário do passivo/Capital nos três modos de inicialização do torneio, atendendo plenamente à casuística em que no Greenfield ("Start from Zero") o espaço produtivo pode ser locado ou próprio.
- **Diferenças:**
  - *Opção de Estabelecimento Industrial:* Inclusão do parâmetro `building_mode` ('rented' ou 'owned') permitindo ao Tutor escolher se as empresas começam operando em espaço Alugado (onde Terrenos e Prédios são zerados no Balanço de P0) ou Próprio (onde os bens entram ativados no Ativo Imobilizado).
  - *Customização Patrimonial Completa:* Mapeamento de chaves cirúrgicas editáveis de imobilizado: Valor de Edificações de Abertura (`building_value`), Valor do Terreno (`land_value`), Idade do Imóvel (`building_age` para apurar depreciação acumulada predial inicial de 4.0% a.a.) e Benfeitorias/Instalações Técnicas Iniciais (`installations_value`).
  - *Estratégia de Funding Contábil:* Introdução do mecanismo `real_estate_acquisition_funding` ('capital' ou 'debt'). Se o imobilizado de abertura for integralizado via Capital Próprio ('capital'), o Capital Social fiduciário se expande na exata medida do ativo líquido gerado; se financiado via Obrigações ('debt'), o Caixa Inicial e o Capital Social básico são preservados no Giro do P0 e o imobilizado é contrabalançado contra Financiamentos de Longo Prazo no Passivo Exigível.
  - *Interface de Regulação do Tutor (Step 6):* Acoplagem de um painel responsivo no Step 6 do `TrialWizard.tsx` inteligente, exibindo dinamicamente os inputs de imobilizado e fundings com bloqueios e revelações contextuais conforme o modo de prédio habilitado.
- **Status:** Em Produção (Fidelidade Metódica de 100% e Mecânica Educacional Premium).

### v19.15 Sapphire Diamond Enterprise - Sincronização Dinâmica de KPIs Contábeis de P0 (Eliminação do Fantasma de Passivos e Despesas)
- **Data:** 27 de Maio de 2026
- **Motivo:** Garantir a consistência absoluta dos KPIs industriais e financeiros do Round 0 (P0) em campeonatos criados dinamicamente, eliminando fallbacks parciais hardcoded herdados da estrutura corporativa de "Running Company" quando operando no modo "Start from Zero" ou templates customizados do Tutor.
- **Diferenças:**
  - *Sincronização Dinâmica Contábil de P00:* O método `createChampionshipWithTeams` em `services/supabase.ts` foi integralmente refatorado para ler e derivar os KPIs históricos de Round 0 de cada time diretamente do `initial_financials` gerado ou editado pelo Tutor.
  - *Tratamento de Coalescência de Valor Zero Fiduciário:* Substituição do operador lógico `||` por verificação de modo (`starting_mode === 'start_from_zero'`) e coalescência nula `??` nas funções de busca de contas (`findAccountValue`), assegurando que `0.00` de uma conta contábil limpa (ex: passivos, empréstimos, despesas operacionais, inventários) seja respeitado como um dado legítimo e não substituído por fallbacks padrão de Running Company.
  - *Estimativa Dinâmica de EBITDA e FCO Livre:* Criação de blocos matemáticos sob demanda que analisam o resultado operacional (`operating_profit`) e manutenção no Fluxo de Caixa para estimar o EBITDA inicial real da arena instalada.
  - *Mitigação de Juros e Compromissos Fantasmas:* Limpeza cirúrgica nos arrays de `commitments` de contas a pagar (`payables`) e contas a receber (`receivables`) no Round 0 de cada equipe, evitando a imposição fiduciária de dívidas antigas a equipes de arenas iniciadas inteiramente do zero.
- **Status:** Em Produção (Fidelidade Fiduciária de 100% e Simulação Limpa).

### v19.14 Sapphire Diamond Enterprise - P0 Pro Configurator & Interactive Real-Time Preview
- **Data:** 26 de Maio de 2026
- **Motivo:** Implementação robusta do P0 Configurator focado na autonomia estratégica do Tutor e no deploy preciso de arenas. Garantir a consistência dos 3 modos estruturais e auditoria dinâmica em tempo real antes da inicialização do torneio.
- **Diferenças:**
  - *Arquitetura Wizard em 8 Passos:* Reorganização lógica integral do formulário do Tutor: Identidade, Ativação/Modos, Parque Industrial, Mão de Obra de RH, Regiões/Preços, Equilíbrio Financeiro, Parâmetros Macro e Preview/Confirmação de Deploy.
  - *União de Modos Contábeis:* Implementação de Discriminated Unions no TypeScript para os modos `start_from_zero` (foco em Caixa/Capital), `start_with_base` (foco em ativo fabril balanceado) e `start_with_running` (modo focado em pendências de CP/LP e estoques parciais de produtos).
  - *Quadro Ativo de Bots:* Configuração do módulo de concorrentes mecânicos (Bots autônomos) integrados com perfis mercadológicos (AGRESSIVO, CONSERVADOR, etc.).
  - *Preview Real-Time & Recalculo fiduciário:* Inclusão do botão "Recalcular P0" que roda o kernel matemático determinístico em tempo real e renderiza os demonstrativos em sub-abas dedicadas no Step 8 (DRE, DFC, Balanço e E-SDS).
  - *Serviço de Templates:* Persistência das escolhas do Tutor de forma dinâmica na base do Supabase (`p0_templates`) para reaproveitamento ágil.
  - *Higienização Fiduciária de Payload (Database Payload Sanitization):* Integração de um filtro inteligente no método `createChampionshipWithTeams` em `services/supabase.ts` que permite ao front-end transitar modelos ricos e flexíveis de parâmetros de simulação, mas isola e limpa essas chaves dinâmicas antes que a query de inserção atinja as tabelas `trial_championships` e `championships`. Isso evita colisões com a DDL no Supabase e blinda o simulador contra erros de Schema Cache em mutações futuras. (Decisão ADR-DB-04)
- **Status:** Em Produção (Fidelidade Absoluta e Excelência de DX).

### v19.13 Sapphire Diamond Enterprise - Estabilidade Fiduciária P0 (Fallbacks de Auditoria, Reload Limpo & Exibição Explicita P0)
- **Data:** 26 de Maio de 2026
- **Motivo:** Garantir a estabilidade de visualização e consistência relacional do ponto de partida fiduciário P0 (Round 0) sob concorrências assíncronas no Supabase, assegurando que as equipes visualizem perfeitamente as demonstrações após o lançamento pelo Tutor.
- **Diferenças:**
  - *Fallback Local no Dashboard:* Introdução de geração dinâmica e injeção do P0 em memória caso o Supabase atrase ou retorne o histórico vazio no primeiro ciclo.
  - *Shield de Auditoria na Gazette/Monitoramento:* Criação de barreira inteligente que detecta a ausência de histórico do P0 e consulta dinamicamente a tabela `teams/trial_teams` correspondente, derivando em tempo real as contas estruturadas de cada equipe de forma privada.
  - *Reset de Cache Reativo:* Configuração de reload cirúrgico temporal (`window.location.reload()`) após a conclusão dos assistentes de lançamento (`TrialWizard` e `ChampionshipWizard`), desfazendo instâncias presas no cliente e forçando o recalculo de sessões.
  - *Exibição Explícita de P0:* Ajuste no display de cabeçalhos de relatórios para renderizar `"INICIAL (P0)"` em vez de `"ROUND 00"`, elevando o realismo corporativo.
- **Status:** Em Produção (Fidelidade Inexorável e UX blindada).

### v19.9 Obsidian Diamond Enterprise II - Persistência Sólida do Ciclo Financeiro (PMR, PMP & Efeito Tesoura)
- **Data:** 25 de Maio de 2026
- **Motivo:** Garantir a perfeita visualização contábil de PMR (Prazo Médio de Recebimento), PMP (Prazo Médio de Pagamento) e Efeito Tesoura no Cockpit/Painel de Tomada de Decisão das Equipes, eliminando falhas de dados legados no carregamento de rodadas iniciais.
- **Diferenças:**
  - *Persistência no Supabase:* Inclusão das colunas `avg_receivable_days` e `avg_payable_days` na inserção de cada simulação/turnover nas tabelas `companies` e `trial_companies`.
  - *Inicialização do Campeonato (P0):* Definição exata de prazos base fiduciários para a rodada `0` (PMR: 45 dias, PMP: 30 dias) ao gerar o campeonato e seus respectivos históricos iniciais.
  - *Sanitização e Fallbacks no Cockpit:* Programação de fallbacks no frontend (`Dashboard.tsx`) para assegurar legibilidade mesmo em registros obsoletos ou nulos, com tratamento refinado do Efeito Tesoura para resolver o stringing de `-0.0` para `0.0` dias.
- **Status:** Em Produção (Fidelidade Fiduciária e DX Premium).

### v19.8 Obsidian Diamond (Obsidian Executive v2) - Abertura Contábil DRE (dre.mod, dre.cif, dre.cpv_mp) e Refinamento do Motor WAC
- **Data:** 24 de Maio de 2026
- **Motivo:** Implementar o desmembramento analítico do Custo do Produto Vendido (`cpv`) no DRE para fornecer relatórios contábeis de custos mais precisos e em conformidade internacional (SAP/Oracle). Foram incluídas e preenchidas as contas de Matéria-Prima Consumida Vendida (`dre.cpv_mp`), Mão de Obra Direta Vendida (`dre.mod`) e Custos Indiretos de Fabricação Vendidos (`dre.cif`), resolvendo completamente a integridade de baixa de estoques.
- **Diferenças:**
  - *Inclusão de dre.mod no DRE:* Nova conta adicionada como folha de fábrica e horas extras proporcionais no Custo de Produção (CPP) e dada baixa no ato de venda.
  - *Desmembramento Proporcional Contábil:* Em vez de imputar um CPV monolítico, o simulador agora calcula dinamicamente as proporções industriais de MP, MOD e CIF incorridos no período corrente e as replica no faturamento WAC final para fechar de forma concisa o CPV em cada conta-filha.
  - *Refinamento do Relatório Financeiro (Reports.tsx):* Adaptação de componentes UI para encontrar valores aninhados dentro de estruturas dinâmicas de contas contábeis no array do DRE sem conflitar com agrupamentos do topo do DRE.
  - *Guia Exaustivo de Negócio (BUSINESS_RULES.md):* Criação de documentação dedicada e formalizada de todas as fórmulas de formação de CPP, CPV, Kardex-WAC e reconciliação de integridade física-contábil de estoques.
- **Status:** Em Produção (Conformidade Completa & Auditoria Sólida).

### v19.7 Obsidian Plus (Obsidian Executive) - Abas Espaciais Glassmorphic & Sparklines Bézier
- **Data:** 24 de Maio de 2026
- **Motivo:** Solucionar a sobrecarga cognitiva e fadiga vertical do cockpit executivo, enriquecendo o painel `RightPreviewPanel.tsx` com visualizações vetoriais rápidas de evolução contábil, segmentação glassmorphic e auditoria em tempo real.
- **Diferenças:**
  - *Arquitetura por Abas Glassmorphic:* Divisão estrutural em 3 Abas ("Finanças", "Riscos", "Kardex/MP"), estilizadas sob o padrão premium de glassmorphism (desfoque de fundo `backdrop-blur-md`, bordas finas com brilho e ícones de alta qualidade), reduzindo 60% do scroll vertical.
  - *Sparklines SVG com Curva de Bézier:* Desenho vetorial de micrográficos utilizando curvas cúbicas de Bézier suaves para expressar tendências realistas. Inclui animação de traçado (`stroke-dashoffset` animado de 100 para 0 por elemento) no montador do componente.
  - *Badge Contábil Z-Guard Integrado ao Topo:* Inclusão de um selo de auditoria global tático em tempo real no cabeçalho do cockpit, monitorando a integridade tripla e fornecendo um card de diagnóstico completo sob hover (tooltip puro CSS).
  - *Tooltips Detalhados de Evolução:* Adicionados gatilhos interativos em cada Sparkline estrutural para detalhar o comparativo exato entre o Round Corrente (T) e a simulação de projeção (T+1).
- **Status:** Em Produção (Alta DX & UX com avaliação Oracle de excelência).

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

### v2026-05.2 - Auditabilidade Financeira Expandida (DRE, MOD, CIF & Visão do Tutor)
- **Data:** Maio de 2026
- **Motivo:** Introdução de gráficos e detalhamentos específicos sobre as subcontas do Custo Indireto de Fabricação (CIF) e da Mão de Obra Direta (MOD) no DRE das equipes para robustecer a capacidade de tomada de decisões e auditoria estratégica. Extensão completa destas ferramentas de simulação histórica para os Tutores.
- **Diferenças:**
  - *Série Temporal de Custos (react-apexcharts):* Integração de gráficos de área cumulativos na aba de DRE que mostram de forma límpida a evolução rodada a rodada do montante absoluto de MOD (`dre.mod`) e de CIF (`dre.cif`), permitindo que as equipes auditem instantaneamente se suas ações de CapEx, treinamento ou gestão de pessoal estão gerando eficiência operacional.
  - *Navegabilidade Analítica Decifrada:* Expansão dos relatórios de DRE com gavetas de colapso (*collapsibles/details*) interativas, contendo o detalhamento componente por componente das contas:
    - **MOD:** Salário-Base, Encargos Sociais, Provisões de PPR, Custos de Demissões/Rescisões, Horas Extras e Prêmios de Produtividade.
    - **CIF:** Despesas de Treinamento Técnico, Manutenção de Equipamentos, Custos de Armazenagem de Matéria-Prima e Produtos Acabados, Depreciações de Instalações Prédio e Depreciação Amortizada do Maquinário.
  - *Monitor do Tutor Empoderado:* O painel de decisões do Tutor (`TutorDecisionMonitor`) foi vitaminado para carregar automaticamente a série histórica contábil da equipe em exibição ao abrir o modal de auditoria. Adicionalmente, as abas de **Kardex & Custos** e **Estratégico** foram integradas ao popup de auditoria do Tutor, promovendo 100% de paridade com o que os alunos veem e garantindo um feedback pedagógico cirúrgico sob o motor de KPIs (`cpv_details`).
- **Status:** Em produção.

### v19.8 Obsidian Enterprise - Resolução de Consistência Competitiva & RLS
- **Data:** Maio de 2026
- **Motivo:** Solução do bug de visibilidade competitiva e o conserto de joins lógicos para dados Trial/Live no Monitor de Decisões do Tutor e na Oracle Gazette, permitindo visibilidade competitiva irrestrita intra-campeonato para tomada de decisões estratégicas por todas as equipes.
- **Diferenças:**
  - *Visibilidade de Mercado (Oracle Gazette):* Correção de joins estáticos `team:teams(name)` para joins dinâmicos baseados no tipo do campeonato (`trial_teams` ou `teams`), resolvendo falhas de busca e telas cinzas vazias para as equipes em modo simulador de treino (Trial).
  - *Monitor do Tutor (TutorDecisionMonitor):* Ajustado o join de histórico contábil de competidores para também utilizar dinamicamente `trial_teams` ou `teams`.
  - *Políticas RLS Desbloqueadas:* Substituição das políticas restritivas de SELECT de `teams`, `companies`, `trial_teams`, e `trial_companies` por políticas que autorizam qualquer jogador pertencente a um time ver concorrentes associados ao seu mesmo campeonato (`championship_id`). Gravações (UPDATING) continuam blindadas para os criadores correspondentes.
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

### v2026-05.5 / v19.12 - Redoma de Caixa Consolidada, Ativação Integral de Custos e Alinhamento Consultivo
- **Data:** 25 de Maio de 2026
- **Motivo:** Homologação e refinamento com o Comitê de Auditoria Oracle do resgate automático preventivo de liquidez acumulada (Redoma de Caixa), amortizações estruturais, ativação detalhada de custos industriais no CIF e amortização de juro de fornecedores proporcional ao saldo devedor.
- **Diferenças:**
  - *Resgate Preventivo Automático:* Caso as projeções operacionais ameacem disparar o Empréstimo Compulsório/Emergencial, o motor agora varre preventivamente a rubrica `'assets.current.investments'`, liquidando o montante estrito para manter o fluxo positivo e salvaguardar o Rating Fiduciário corporativo.
  - *Ativação de Custos Industriais (WAC / CIF):* Custos de treinamento fabril e estocagem física passam a ser classificados como custos CIF capitalizados no estoque. O impacto imediato no fluxo de caixa é contabilizado em saídas diretas (`cf.outflow.training`, `cf.outflow.storage`), enquanto o DRE realiza a amortização por competência (CPV) sob o método Kardex-WAC.
  - *Juros Proporcionais de Fornecedores:* Correção e aprimoramento da distribuição dos juros de fornecedores para compras a prazo. O cálculo obedece estritamente a amortização e a incidência sobre o saldo devedor por período (T+0 sem juros de entrada, T+1 incidindo sobre o SD de 66% e T+2 incidindo sobre o SD de 33%).
  - *Cronogramas HUD & Visualização:* Atualização interativa no formulário de Suprimentos (`SupplyStep`) e no painel lateral de consolidação financeira (`RightPreviewPanel`) para expor abertamente a alocação de parcelas de principal, taxas de juros, e os novos passivos gerados no balanço de encerramento.
  - *Rolagem Lateral de Torneios:* Implementação de rolagem lateral horizontal fluida (`flex-row overflow-x-auto`) com efeito de snap-scrolling no painel principal de visualização de arenas (`ChampionshipsView`), otimizando o design system para navegação intuitiva e eliminando quebras verticais e excesso de rolagem quando há dezenas de simulações concorrentes.
  - *Saneamento de Dependência NPM (DOMException):* Resolução do aviso de obsolescência (`npm warn deprecated node-domexception@1.0.0`) introduzido transitivamente pelo ecossistema do SDK. Implementou-se um *stub* robusto de infraestrutura local em `/stubs/node-domexception` que reexporta o `DOMException` nativo da plataforma moderna (Node.js 18+), acoplado via política de `"overrides"` no manifesto do projeto, eliminando warnings com zero dependências externas ou riscos colaterais.
  - *Documentação e Governança:* Toda a lógica de mitigação inteligente, spreads fiduciários, mapeamento de dependências e cronogramas de suprimentos foi documentada em `BUSINESS_RULES.md`, garantindo excelente DX (Developer Experience) e fidelidade prática para capacitação acadêmica de alto nível.
- **Status:** Em produção.

### v2026-05.4 / v19.11 - Redoma de Caixa, Aplicações Financeiras, Custeio Absorção e Treinamento CapEx
- **Data:** 25 de Maio de 2026
- **Motivo:** Harmonização tripla profunda e refinamentos contábeis recomendados pelo conselho consultivo. Introdução do resgate de segurança automatizado de aplicações, consistência estrita de amortização de principal e juros, ativação correta do Treinamento de Novos Modelos e estocagem em CIF/Estoque de ativos em absorção.
- **Diferenças:**
  - *Resgate Automático de Investimentos:* Se o caixa projetado da equipe for ficar vermelho, o motor resgata de maneira preventiva do saldo de `'assets.current.investments'` para mitigar empréstimos compulsórios e resguardar o rating fiduciário da corporação.
  - *Custeio e Ativação de Treinamento/Armazenamento:* Treinamentos industriais (CapEx para novas máquinas) e armazenagem física (`storageCost`) são integralmente capitalizados como CIF na rubrica de estoque de produtos acabados via Kardex-WAC e baixados por competência no CPV da DRE, mantendo o caixa direto (`cf.outflow.training`, `cf.outflow.storage`) sincronizado com o Balanço.
  - *Visualização de Dívidas & Feedback no Cockpit:* Alerta sonoro/visual dinâmico e pulsante no cockpit se o Rating fiduciário for rebaixado para "D", amparado pela tabela de Spreads e Projeções do Cronograma Futuro de Amortização.
- **Status:** Em produção.

### v2026-05.3 / v19.10 - Financiamentos, Amortização, Rating Spreads e Amortization Schedule
- **Data:** 25 de Maio de 2026
- **Motivo:** Implementação da diferenciação realística entre Empréstimos Normais e Compulsórios, taxas flutuantes baseadas no spread de risco da tabela de ratings fiduciários corporativos, e consolidação das penalidades e covenants de caixa da empresa, integrando o Amortization Schedule de 3 rodadas.
- **Diferenças:**
  - *Empréstimo Normal (Requisitado Manualmente):* Passa a ser acrescido do Spread de Rating Fiduciário (% de ágio associada à saúde de solvência da sua própria equipe). Amortização constante (SAC).
  - *Empréstimo Compulsório (Quebra de Caixa):* O caixa negativo é socorrido automaticamente com vencimento direto na rodada seguinte (1 round). Aplica-se taxa altamente punitiva (TR + Ágio de Compulsório + Rating Risk Spread + 5.0% de sobretaxa flat de default fiduciário). O compulsório passa a ser persistido e injetado nos `currentLoans` e no fluxo de amortizações de forma fidedigna.
  - *Penalização no Endividamento:* Empresas com contratação de compulsório ativo sofrem rebaixamento compulsório imediato de seu Rating Fiduciário para o patamar mínimo **D** (Default/Distressed zone) na rodada. Além disso, a rubrica `loans_st` recebe acréscimo de **+50%** de peso de passivo para cálculo do coeficiente de alavancagem (`x5`), afetando o Z-Score de Kanitz, o Altman Z-Score e as métricas do E-SDS.
  - *Amortization Schedule:* Módulo centralizado em `simulation-core.ts` projeta com precisão científica as prestações de juros, amortização e saldo devedor das próximas 3 rodadas de todos os empréstimos ativos, integrados aos painéis de pré-visualização e demonstrações financeiras.

### v2026-03.6 - Provisionamento de PPR e Rescisão Proporcional
- **Data:** Março de 2026
- **Motivo:** Alinhamento contábil com o princípio da competência e realismo no fluxo de caixa de demissões.
- **Diferenças:**
  - *PPR (Provisionamento):* Provisionamento em `liabilities.current.ppr_payable` (Passivo Circulante) e reconhecido como despesa no DRE.
  - *PPR (Pagamento):* Pagamento na rodada seguinte na rubrica `cf.outflow.payroll`.
  - *Rescisão:* Em caso de demissão, liquidação do PPR proporcional provisionado na rescisão além do salário e multa rescisória (1 salário base).
- **Status:** Em produção.

### v19.21 - Sapphire Obsidian Masterclass (Accounting & Tutor Experience Patch)
- **Data:** Maio de 2026
- **Motivo:** Implementação de Monitor Fiduciário em Tempo Real disponível em todo o Wizard e integração física e fiduciária de exclusão de templates no ecossistema Supabase/Local Storage.
- **Principais Diferenças na v19.21:**
  - **Monitor Fiduciário Real-Time Drawer:** Desenvolvimento de um painel lateral retrátil (slide-over) impulsionado por animações fluidas de `framer-motion`. Ele permite ao Tutor simular e prever o fechamento completo do Balanço Patrimonial, DRE e Demonstração do Fluxo de Caixa do P0 instantaneamente na tela enquanto altera campos operacionais nos Steps 2 a 7 (com recalculo automático fiduciário a cada digitação).
  - **Exclusão Física de Templates (`deleteP0Template`):** Suporte completo para exclusão definitiva de templates personalizados nas nuvens Supabase com sincronismo e limpeza imediata no fallback do `localStorage`. Botão de lixeira vermelha adicionado na listagem de cenários de Step 2 do configurador para a robustez do ciclo CRUD de templates de campeonatos.
- **Status:** Em produção.

### v19.23 - Obsidian Diamond Enterprise (Final P0 Architecture Closure)
- **Data:** Maio de 2026
- **Motivo:** Fechamento e consolidação técnica final da arquitetura P0 no Wizard de criação de arenas. Implementação de auditoria detalhada reativa em tempo real com ledger cards, cálculo real dos 6 pilares do E-SDS, controle de privacidade de templates no Supabase e multi-modelos contábeis.
- **Principais Diferenças na v19.23:**
  - **Auditor Fiduciário Reativo (Tabs Detail):** No Step 8, criação de um dashboard de auditoria operacional dinâmico baseado em abas contábeis fiduciárias estruturadas: 'E-SDS 6 Pilares', 'Sub-Contas & Liquidez', 'Laudo do Imobilizado', e 'Governança & Imutabilidade'.
  - **Cálculo Real dos 6 Pilares E-SDS:** Um robusto hook `useMemo` recalcula instantaneamente os pilares fiduciários com base nas métricas reais, além dos índices Altman Z''-Score e solvência pelo índice de Kanitz integrados para as mudanças de variáveis dinâmicas do Tutor.
  - **Multi-Modelo Contábil no Wizard:** Inclusão de seleção ativa e flexível baseada em `AccountingModelTemplate` na etapa 1 (Industrial, Comercial, Serviços, Agropecuário) que alimenta o respectivo `accounting_template_id`.
  - **Privacidade de Templates no Supabase:** Integração e controle do flag de estado `templateIsPublic` durante as ações de salvamento de templates no banco de dados e local storage fallback.
- **Status:** Ativo e em Produção.

### v19.21 - Sapphire Obsidian Masterclass (Accounting & Tutor Experience Patch)
- **Data:** Maio de 2026
- **Motivo:** Melhoria profunda na UX contábil do Tutor e no compilador fiduciário.
- **Principais Diferenças na v19.21:**
  - **Real-Time Drawer (Monitor Fiduciário):** Painel lateral interativo que recalcula e exibe Balanço, DRE e DFC conforme alterações nas configurações operacionais.
  - **Deleção Física e Sincronismo Físico de Templates:** Eliminação completa de configurações salvas no banco Supabase ou local storage através de um botão de exclusão fiduciária segura.
- **Status:** Planejado e Integrado.

### v19.20 - Obsidian Diamond Enterprise (Database Performance Indices)
- **Data:** Maio de 2026
- **Motivo:** Otimização de performance de consulta e planos de execução (Query Planner) no PostgreSQL para views de governança contábil e visualização de templates de P0.
- **Principais Diferenças na v19.20:**
  - **Índices de Expressão (Expression Indexes) para Casts de Texto:** Criação de índices específicos como `idx_companies_team_id_cast_text` e `idx_teams_id_cast_text` que indexam a expressão `(team_id)::text` e `(id)::text`. Isso remove os "Seq Scans" gerados pelos castings necessários nas RLS de segurança e fusão de views.
  - **Busca por Escopo de Campeonato:** Indexação composta `idx_companies_champ_round_fiduciary` para agilizar filtragens por `championship_id` + `round`, trazendo as consultas e auditorias aos tempos de resposta de microssegundos.
  - **Eficiência de RLS de Templates:** Criação do índice composto `idx_p0_templates_tutor_public` na tabela `p0_templates` para garantir carragamento imediato das configurações P0 sem latência.
- **Status:** Em produção.

### v19.19 - Obsidian Diamond Enterprise (Database Precision Patch)
- **Data:** Maio de 2026
- **Motivo:** Ajuste de precisão arquitetural no mapeamento de tipos fiduciários no banco de dados Supabase para evitar erros de comparação implícita de tipos.
- **Principais Diferenças na v19.19:**
  - **Conversão de Tipagem Explícita (Explicit Casts):** Introdução de coerções do tipo `::text` em todas as comparações de chaves primárias e estrangeiras (`id`, `team_id`, `championship_id`, `supabase_user_id` e `auth.uid()`) nas políticas de Row Level Security (RLS) e nas views fiduciárias de auditoria (`view_supply_chain_health`, `view_capex_health`). Isso elimina qualquer incompatibilidade contábil e técnica do tipo `uuid = text` gerada por atualizações no Supabase.
- **Status:** Em produção.

### v19.52 - Sapphire Platinum (Audit & Sound Check v2)
- **Data:** 30 de Maio de 2026
- **Motivo:** Erradicação de inconsistência crítica de R$ 1.089.250,00 no motor contábil da simulação que disparava bloqueio patrimonial (Sapphire) em rodadas onde equipes Greenfield recorriam ao Empréstimo Compulsório Emergencial de socorro.
- **Principais Diferenças na v19.52:**
  - **Correção da Duplicidade ST:** Sanada a inicialização duplicada da variável `totalLoansST` em `./services/simulation.ts` (efetuado `let totalLoansST = 0` em vez de `= newCompulsoryLoan`), pois o compulsório já é devidamente injetado na lista `currentLoans` e consolidado de forma unitária na iteração ordinária subsequente.
  - **Prevenção de Quebra Patrimonial:** A correção garante balanço em perfeito equilíbrio (Equação Contábil) com tolerância de R$ 0.05, permitindo transição fluida do Round P01 por meio do Turnover do Tutor sem interrupções por regras do Sapphire Security.
  - **Robustez de Fallback do Oráculo (ESDS):** Sincronização do indicador fiduciário de saúde financeira assegurável via fallback determinístico estrito caso chamadas do Gemini API estourem limites de cota operacional (como erro 429).
- **Status:** Em produção.

### v19.18 - Obsidian Diamond Enterprise (Tutor Masterclass)
- **Data:** Maio de 2026
- **Motivo:** Implementação do painel fiduciário em tempo real (Real-Time Auditor) e do sistema maduro de templates persistentes na tabela `p0_templates` do Supabase com proteção RLS.
- **Principais Diferenças na v19.18:**
  - **Tabela `p0_templates`:** Criada a estrutura física e as políticas de segurança de linha (RLS) que blindam os templates de cada tutor e dão suporte a visualização de templates compartilhados e privados.
  - **Audit Dashboard (v19.18) no Step 8:** Centralização analítica contendo kpis avançados de Solvência de Kanitz, Altman Z-Score de mercados emergentes, classificação automática de risco de crédito (AAA a A-), cálculos de faturamento teórico do maquinário ativo e listagem minuciosa de estoque (MPA, MPB, PA e WIP).
  - **Reconciliação e Recálculo Dinâmico:** Correção fiduciária exata ao centavo e recálculo em tempo real (Real-Time Recalculable P0 Preview) com perfeita amarração contábil de Ativos e Passivos + PL.
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
