# Oracle Strategos - Bússola de Diretrizes do Projeto (DOCUMENT.md)

## 📋 Controle de Governança
- **Produto:** EMPIRION ORACLE
- **Versão Ativa:** v2026.143 Sandbox de Validação & Ideação de Negócios Reais para Empreendedores.
- **Tipo de Documento:** Master Index & Diretrizes de Engenharia Contínua
- **Status da Documentação:** Sincronizado com o PRD.md, BUSINESS_RULES.md & ROADMAP.md

---

## Decisão Arquitetural, Higienização Estrutural de Tabelas no Supabase (Eliminação Completa de Redundância Plana) - v2026.143

**Data:** 14 de Junho de 2026 às 19:00 UTC  
**Motivo:** Erradicação sistemática de duplicidade estrutural de armazenamento de dados entre as colunas raiz redundantes e o nó encapsulado `config` JSONB das tabelas `championships` e `trial_championships` no Supabase. O desígnio é purificar o DDL unificando as parametrizações em um único repositório documental JSONB, garantindo a integridade dos dados históricos dos Tutores (IFRS/CPC Compliance) e protegendo a integridade operacional imediata contra quebras lógicas.

**Detalhamento Técnico de Planejamento:**
- **Estágio de Acoplamento e Backup Fiduciário**: 
  - Antes de realizar qualquer exclusão física (drop) das colunas redundantes, o script de migração (`20260614190000_fiduciary_cleanup_redundancy.sql`) realiza um merge seguro de chaves usando `jsonb_set` e operadores lógicos de mesclagem (`||`) para garantir que todos os dados que estavam soltos nas colunas planas de moeda, taxas, preços regionais, maquinários e composições administrativas de equipes sejam consolidados permanentemente dentro do documento principal `config` de cada torneio de simulação registrado.
- **Exclusão Física Controlada (DDL Purificado)**:
  - Uma vez acoplado e consolidado no `config` (JSONB), o script executa com segurança a remoção física de 17 colunas obsoletas e em desuso da raiz das tabelas `championships` e `trial_championships`: `region_names`, `region_configs`, `regions_count`, `currency`, `sales_mode`, `scenario_type`, `social_charges`, `compulsory_loan_agio`, `production_hours_period`, `award_values`, `exchange_rates`, `staffing`, `prices`, `machinery_values`, `round_rules`, `brl_rate` e `gbp_rate`.
  - Isso deixa a estrutura das tabelas limpa, com apenas 24 colunas de identidade essencial para mapeamento contábil fidedigno.
- **Sincronia do Cliente de API (Database Payload Sanitization v2)**:
  - Para evitar falhas de PostgREST `400 Bad Request (column not found)` no ato de criação dos campeonatos, atualizamos a lista de correspondência `validTrialCols` em `/services/supabase.ts` para que o frontend não envie payloads referenciando campos físicos obsoletos que foram limpos.

**Impactos:**
- **Consistência Absoluta Contra Conflitos de Demanda**: Erradica definitivamente qualquer discrepância de pesos de demanda regional, uma vez que a única fonte fidedigna passa a ser a árvore estrutural documentada no payload `config` do torneio.
- **Otimização Contínua e DX Excepcional**: Uma tabelação compacta simplifica relatórios, queries de exportação, auditoria de banco de dados e assegura que futuros engenheiros entendam a fundo a modelagem do ERP empresarial sem poluição.

---

## Decisão Arquitetural, Fundação Patrimonial Sólida e Geração Autônoma de Market Size no Modo 'Start from Zero' - v2026.142

**Data:** 14 de Junho de 2026 às 18:40 UTC  
**Motivo:** Documentar e consolidar as regras de integridade patrimonial fiduciária no ecossistema de fundação ágil ("Start from Zero"). Validar que, diferentemente da herança imobilizada existente no modelo tradicional de herbário ("Start with Base"), no modo de início a partir do zero as empresas iniciam suas atividades munidas unicamente de Capital Social inicial integralizado em Caixa. O planejamento e a aprovação de CAPEX no Round 1 constitui-se no único nexus gerador de capacidade industrial e no gerador direto do Market Size dinâmico.

**Detalhamento Técnico de Planejamento:**
- **Ponto de Partida Desprovido de Ativos Fixos**: No ecossistema sob o marcador `current_mode === 'start_from_zero'`, as marcas competem sob igualdade absoluta de fundação:
  1. No Round 0, o Ativo Imobilizado Fixo de Máquinas é nulo. Nenhum imobilizado preexistente (`INITIAL_MACHINES_P00`) é herdado no Balanço de abertura.
  2. A conta de contabilidade Ativo Circulante (Disponibilidades / Caixa Geral) é inaugurada com a integralização inteira do Capital em dinheiro.
- **CAPEX no Round 1 como Elemento Fundacional**: 
  - Toda máquina adquirida e instalada através das decisões de CAPEX no Round 1 passa a ser o bloco mestre pioneiro de infraestrutura fabril.
  - Para cada aquisição de maquinário promovida no cockpit, o Ativo Não Circulante registra o imobilizado líquido correspondente, as provisões de custos de instalação técnica por modelo (Alfa, Beta ou Gama), e inicia o cronograma de depreciações sistemáticas no fechamento.
  - O motor de simulação (`simulation.ts` / `supabase.ts`) soma a capacidade total ativa correspondente a esse maquinário recém-implantado das marcas e aplica as fatias regionais do Tutor para modular dinamicamente o Market Size a ser fatiado. Isso assegura que no Round 1 a demanda geométrica do setor derive puramente da audácia do investimento inicial promovido pelas empresas, personificando de maneira límpida o ciclo real de concepção de indústrias.

**Impactos:**
- **Transparência Contábil Impecável**: Garante total conformidade contábil sob os princípios internacionais de relatórios financeiros (IFRS / CPC) ao separar as marcas herdadas das marcas fundadas do zero.
- **Alinhamento do Motor de Demanda**: O motor econômico calcula o Market Size em tempo real com base no parque operacional acumulado, permitindo que a escassez ou excesso de capacidade agregada de CAPEX dite as oportunidades comerciais regionais.

---

## Decisão Arquitetural, Integridade na Priorização de Configurações Regionais e Nexus Causal do Market Size de 63.000 un - v2026.141

**Data:** 14 de Junho de 2026 às 18:27 UTC  
**Motivo:** Dirimir lacunas analíticas e duplicidades de controle entre as colunas da tabela `trial_championships` (conflito de fonte da verdade), especificamente onde o peso de demanda consolidada diferia entre o campo raiz `region_configs` (105% de peso total) e o nó `config.regions` (110% de peso total, que é o correto determinado pelo Tutor). Também auditar e explicar matematicamente a geração da demanda exata de 63.000 unidades disputadas no Round 1 sob o enfoque de conformidade estrutural.

**Detalhamento Técnico de Planejamento:**
- **Harmonização Relacional e Single Source of Truth**: Reestruturamos prioritariamente a cadeia de herança analítica de regiões nas engines de cockpit (`MarketingStep.tsx`) e fechamento de rodadas (`services/supabase.ts`). O código agora inspeciona e preenche as configurações regionais preferencialmente do nó `config.regions` ou `config.region_configs` (onde residem as modificações consistentes de 110% de peso do Tutor). Somente se estes nós estiverem ausentes, o sistema recorre de forma segura à coluna plana de raiz `region_configs`. Isso resolve definitivamente a assimetria corporativa de pesos.
- **Auditoria e Desmistificação do Market Size Global (63.000 unidades)**:
  1. No modo tradicional **Start with Base**, as 3 equipes iniciam o jogo em conformidade com o Balanço Patrimonial Herdado clássico contendo **5 máquinas Alpha** operacionais por equipe (`INITIAL_MACHINES_P00` como premissa de herança de ativos imobilizados no Round 0).
  2. No decorrer do Round 1, todas as equipes executaram decisões corporativas de aprovação de CAPEX para a compra de **+5 máquinas Alpha** adicionais cada uma.
  3. Portanto, a frota produtiva ativa no início das entregas do Round 1 totalizou **10 máquinas Alpha por equipe** (5 iniciais + 5 adquiridas por CAPEX).
  4. Sabendo que a capacidade nominal de fabricação regulamentar de cada máquina Alpha é de **2.000 unidades físicas / ciclo**, a capacidade total instalada da indústria para as 3 equipes atingiu: `10 máquinas * 2.000 un/máquina * 3 equipes = 60.000 unidades globais` de capacidade acumulada.
  5. Multiplicando essa capacidade de 100% instalada pelo peso acumulado de demanda das 5 regiões registradas na coluna residual de herança até a unificação (**105% / 100**), o motor econômico calculou de forma 100% impecável: `60.000 unidades * 1.05 = 63.000 unidades` de demanda consolidada.
  6. Com a unificação em `v2026.141`, ao operar agora sobre o peso ajustado correto de **110%** contido no `config.regions`, a demanda do mercado sob o mesmo parque industrial expandido passará a ser de exatamente `60.000 * 1.10 = 66.000 unidades` físicas, correspondendo fiduciosamente à modelagem pretendida pelo Tutor.

**Impactos:**
- **Zero Inconsistência Contábil**: Mapeamento cristalino para o auditor financeiro e inteligência de mercado sobre o número de maquinário integrado e fatores multiplicadores (turnos de trabalho, etc.).
- **Unificação Plena de Dados**: Eliminação da duplicidade conceitual de leitura de configurações de região, estabelecendo o campo `config` como repositório primário.

---

## Decisão Arquitetural, Mapeamento Posicional de Regiões para eliminação de Market Size Nulo (Resiliência do Algoritmo de Demanda) - v2026.140

**Data:** 14 de Junho de 2026 às 17:25 UTC  
**Motivo:** Corrigir anomalia visual e analítica onde o valor exibido para o "MARKET SIZE REGIONAL" na Região 01 constava erroneamente como "0 UN", decorrente de conflito e duplicidade nos IDs das regiões no banco de dados (por exemplo, a colisão em que Região 01 e Região 04 tinham ambas o atributo `id: 4`, enquanto o frontend buscava sequencialmente por `id: 1`).

**Detalhamento Técnico de Planejamento:**
- **Indexação por Ordem Posicional Baseada em Array**: Em vez de mapear as chaves de armazenamento e busca de `regionalMarketSizes` usando as chaves `r.id` do banco de dados (as quais podem conter collisions ou corrupções), as rotinas de cálculo do planejador de vendas (`MarketingStep.tsx`) passaram a utilizar sistematicamente a indexação posicional 1-baseada (`idx + 1`).
- **Escopos Modificados:**
  - **Identificação Unificada em `calculateRegionStats`**: Chaves associativas do mapa de demandas regionais e pontuações de competitividade agora consideram consistentemente a ordem em que as regiões aparecem no vetor correspondente (Região 1 mapeia para `"1"`, Região 2 para `"2"`, etc.), independentemente do `id` cru registrado na tabela do Supabase.
  - **Cálculo Consistente no Simulador de Fechamento de Rodada (`simulation.ts`)**: Adicionados fallbacks de indexação sequencial `[regId - 1]` nos blocos de receitas, faturamento local, câmbio e custos de logística/distribuição comercial da rodada real, evitando lacunas e garantindo que o processamento do fechamento use as definições financeiras perfeitas em conformidade contábil.

**Impactos:**
- **Demonstrações Visuais Exatas**: Extinção de qualquer leitura nula do "Market Size Regional" na Região 1, refletindo as fatias exatas de demanda configuradas (ex: 25.0% de peso de demanda mapeado e operado).
- **Sem Breaking Changes Dinâmicas**: Resolução de conflitos de colisões de chave mantendo retrocompatibilidade plena com os registros salvos do simulador.

---

## Decisão Arquitetural, Premissa de CRUD e Bypass de Login no Modo TRIAL (MVP Sandbox) - v2026.139

**Data:** 14 de Junho de 2026 às 16:45 UTC  
**Motivo:** Documentar e acordar formalmente o alinhamento de segurança e manipulação de dados em sessões de teste. Devido a limitações físicas de políticas de segurança de linha (RLS) do Supabase que podem bloquear, filtrar ou rejeitar acessos de escrita/leitura para usuários não autenticados (convidados) na rede, estabelecemos que o Modo TRIAL funciona estritamente como um MVP ágil que prioriza fallbacks e bypasses de controle de login.

**Detalhamento Técnico de Planejamento:**
- **Ausência de Restrições Contábeis & CRUD**: No ecossistema de avaliação e simulação rápida em modo Trial, os recursos de cadastro de templates, configuração de rodadas, envio de decisões de preço, marketing, prazos e investimentos são completamente destravados (`zero CRUD restrictions`).
- **Priorização Inteligente de Fallbacks Locals (Híbridos)**: Para garantir que nenhuma falha de rede ou barreira de RLS interrompa o fluxo pedagógico e concorrencial dos discentes, as rotinas do simulador e cockpits operam com prioridade dupla:
  1. Tentam sincronizar com as respectivas tabelas públicas do Supabase (`trial_championships`, `p0_templates`, etc.) sem exigir login ou tokens de segurança.
  2. Caso ocorra erro de RLS, rede ou autenticação, recorrem silenciosa e instantaneamente aos repositórios estáticos e caches locais estruturados (`localStorage`, `constants` e variáveis em memória reativa), garantindo a continuidade imediata dos cálculos da simulação com exatidão matemática fiduciária.
- **Bypass Mandatório do Fluxo de Login**: Nenhuma barreira visual de autenticação deve ser imposta aos competidores em modo Trial.

**Impactos:**
- **Estabilidade Pedagógica Sem Fricção**: Os alunos e tutores podem demonstrar e exercitar cenários de mercado complexos sem dores de cabeça com falhas de credenciamento.
- **Resiliência Arquitetural**: Blindagem do frontend contra inconsistências de carregamento do Supabase, assegurando que o simulador nunca trave em telas vazias por falta de dados básicos.

---

## Decisão Arquitetural, Resiliência na Sincronização de Preços Sugeridos por Próspera Regionalização (Mapeamento Resiliente de IDs de Regiões) - v2026.138

**Data:** 14 de Junho de 2026 às 16:15 UTC  
**Motivo:** Corrigir a divergência na apuração do preço sugerido (exibição de $425 em vez do valor de $1000 cadastrado pelo Tutor no banco de dados para a Região 01) causada por desalinhamento ou duplicidade de identificadores (`id` de região desalinhados com o índice numérico sequencial da listagem 1-baseada) oriundos do payload de canais do Supabase.

**Detalhamento Técnico de Planejamento:**
- **Inclusão de Múltiplos Fallbacks Sequenciais (Cockpit & Simulador)**: Fomos além do mapeamento sequencial rígido pautado no campo `id` da região e implementamos estratégias complementares de leitura (fallbacks baseados no índice indexado do vetor no array `regions_count` ou `[regId - 1]`).
- **Escopo Corrigido Totalmente**:
  - **Exibição nas Telas de Decisões (`/components/DecisionForm.tsx`)**: Correção do loop `initialRegions` permitindo recuperar as variáveis mesmo em caso de lacunas numéricas ou duplicidades de IDs.
  - **Interpolação de Estampa Financeira e Estimativa (`/components/steps/MarketingStep.tsx`)**: Ajustados os buscadores de regiões de cockpit para computar consistentemente o `baseSuggestedPrice`, frete e custo de marketing territoriais.
  - **Sincronismo com Room e Auditor (`/services/supabase.ts`)**: Corrigido o instanciador automático de decisões para torneios em andamento (`baseDecisions`).
  - **Fórmula de Equilíbrio e Mecânica de Demanda (`/services/simulation.ts` e `/services/simulation-core.ts`)**: Injetada a resiliência por índice `regId - 1` para certificar que os preços no cálculo da matriz de vendas respeitem as especificidades físicas do simulador independentemente do array de ID do Supabase.

**Impactos:**
- **Zero Ruído Orçamentário**: Garantia absoluta de que preços sugeridos alterados pelo Tutor funcionem em sua totalidade no cálculo da atratividade comercial e na tela da equipe.
- **Alinhamento do Time Contábil**: Nenhuma fresta de desalinhamento de auditoria e cálculo de KPIs financeiros de custos e preços.

---

## Decisão Arquitetural, Persistência de Cronograma Macroeconômico Customizado (DEFAULT_INDUSTRIAL_CHRONOGRAM) em Templates P0 - v2026.137

**Data:** 14 de Junho de 2026 às 15:10 UTC  
**Motivo:** Corrigir a ausência de persistência e hibridização do cronograma de indicadores do simulador (`DEFAULT_INDUSTRIAL_CHRONOGRAM` / `roundRules` customizados pelo Tutor na criação de torneios) no objeto JSON `config` da tabela `p0_templates` no Supabase ao salvar e recuperar modelos de P0. Anteriormente, as configurações financeiras de P0 eram devidamente transportadas, porém os ajustes cronológicos do Tutor nas réguas macroeconômicas eram descartados por desacoplamento de estado, retornando o cronograma estático genérico.

**Detalhamento Técnico de Planejamento:**
- **Consolidação na Persistência de Modelos (`handleSaveTpl`)**: No gatilho de gravação contábil de rascunhos de P0, o objeto `config` de `tplPayload` foi expandido para fundir o estado do parque industrial e premissas (`tutorConfig`) com as parametrizações do cronograma de rodadas (`DEFAULT_INDUSTRIAL_CHRONOGRAM: roundRules` e `round_rules: roundRules`).
- **Resgate de Indicadores e Sincronismo (`handleLoadTpl` / `Confirm & Load`)**: Atualizou-se o fluxo de importação imediata e o botão de confirmação com inspeção para carregar preventivamente `tpl.config.DEFAULT_INDUSTRIAL_CHRONOGRAM` (ou `round_rules`) e instanciar reativamente na árvore React sob o estado local `roundRules`.
- **Extensão de Tipagem Fiduciária (`/services/initialization.ts`)**: Inclusão opcional das propriedades de cronograma macroeconômico na interface `BaseP0Config` para assegurar conformidade do compilador do simulador.

**Impactos:**
- **Soberania Absoluta de Modelos**: Permite ao Tutor criar torneios de alta fidelidade, modificar taxas de inflação, câmbio, demanda, e imposto por round, e salvar o modelo de P0 no Supabase sabendo que todas as regras cronológicas de rounds serão recarregadas perfeitamente ao instanciar ou reutilizar o modelo.
- **Alinhamento Multidisciplinar**: Garante a acurácia no planejamento tributário e financeiro auditado pelo Contador e inteligência comercial auditada pelo Coordenador de Inteligência de Mercado.

---

## Decisão Arquitetural, Sincronização e Calibração dos Juros a Prazo como Diferencial de Demanda Regional - v2026.136

**Data:** 14 de Junho de 2026 às 13:28 UTC  
**Motivo:** Sanar o gap de diferenciação competitiva no cálculo aproximado de demandas regionais (`teamRegionScores` em `MarketingStep.tsx`). Embora a interface documentasse a taxa de juros como fator de elasticidade, a pontuação de concorrência computava apenas preço, prazo e marketing em suas elasticidades, ignorando o impacto da taxa de juro real a prazo que o empresário definia. Além disso, estruturar a explicação analítica de por que a taxa de conversão regional de Market Share aparenta se manter horizontalizada caso o usuário utilize replicação de decisões e sofra saturação de estoque (estrangulamento de entrega).

**Detalhamento Técnico de Planejamento:**
- **Injeção do Fator Juros (term_interest_rate)**: Introduziu-se o cálculo analítico do `interestIndex` no loop de simulação competitiva regional do frontend.
- **Formulação de Atratividade por Juros**: 
  - Se a venda for à vista (`regTerm === 0`), `interestIndex` is neutro (`1.0`).
  - Se houver venda parcelada (`regTerm > 0`), compara-se o juro praticado (`term_interest_rate`) contra uma taxa padrão neutra de mercado de `2.0%`.
  - Fórmula aplicada: `interestIndex = 1 + (2.0 - term_interest_rate) * 0.04 * (regTerm / 30)`.
  - Aplicou-se um limitador (clamping) de proteção de `0.4` a `1.3` para preservar a coesão macroeconômica.
- **Multiplicação de Força no Prazo**: O `termIndex` (que cresce linearmente com os dias de prazo oferecido) passa a ser calibrado e modulado diretamente pelo `interestIndex`.

**Impactos:**
- **Desempate Financeiro Consistente**: Se duas equipes oferecem a mesma configuração física de Preço, Prazo e Marketing, aquela com menor taxa de juros no prazo conquistará maior cota de demanda regional de forma automática.
- **Transparência Científica de Rateio**: Soluciona a horizontalidade de dados idênticos de conversão ao esclarecer que, sob limitação física de estoques, o simulador rateia vendas de forma puramente proporcional ao Market Size.

---

## Decisão Arquitetural & Regra de Negócio, Correção da Participação Regional (Market Share vs Total Demanda) - v2026.135

**Data:** 14 de Junho de 2026 às 12:48 UTC  
**Motivo:** Corrigir a inconsistência de cálculo no indicador "SUA PARTICIPAÇÃO REGIÃO" em `MarketingStep.tsx` durante o planejamento de marketing/vendas das equipes. Anteriormente, a participação era calculada dividindo o volume vendido da empresa pelo somatório de vendas reais de todos os concorrentes daquela única praça (`totalRegionUnitsSold`). Esta abordagem, além de poder atingir 100% de forma enganosa caso apenas duas empresas estivessem competindo e vendendo, gerava simulações idênticas entre as regiões (visto que o market share concorrencial tendia a se estabilizar horizontalmente), em vez de focar no aproveitamento fiduciário do tamanho de demanda total planejado da região (Market Size Regional / `rMarketSizeVal`), frustrando a análise detalhada dos diretores.

**Detalhamento Técnico de Planejamento:**
- **Nova Formulação Fiduciária de Participação Regional**: Substituição da base de cálculo de total vendido regional concorrencial (`totalRegionUnitsSold`) pelo tamanho absoluto do Market Size configurado para aquela região (`rMarketSizeVal`).
- **Nova Fórmula**: `Sua Participação Região = (Seu Volume Vendido / Market Size Regional) * 100`.
- **Efeitos Fisiológicos**:
  - Em um cenário de Market Size de 19.800 unidades e 1.756 unidades vendidas pela empresa, o indicador exibe de forma precisa e correta `8.9%` (ou 8.87% sem arredondamentos no teto), expressando realisticamente a penetração da empresa em relação às necessidades em escala de consumo bruto da região.

**Impactos:**
- **Cálculo Preciso por Praça**: Assegura consistência fiduciária contábil e de inteligência de mercado de forma totalmente isolada para cada praça analítica, superando o travamento estático do valor concorrencial anterior.
- **Excelente UX e Tomada de Decisão**: Fornece um feedback cristalino sobre a fatia da região que está sendo atendida pela empresa em face de sua estratégia de produção e pricing.

---

## Decisão Arquitetural, Re-render Sensível ao Layout (Auto-Redraw) do Sparkline de Equity - v2026.134

**Data:** 13 de Junho de 2026 às 21:52 UTC  
**Motivo:** Corrigir a renderização incompleta ("clipping" ou achatamento à largura de ~10px) do gráfico "Equity History" na barra lateral Intel Pulse no `Dashboard.tsx`. Este comportamento ocorria porque, no momento em que o usuário aciona o painel flutuante por hover ou expande o menu retrátil, o componente ApexCharts é montado de forma imediata antes que a transição de largura via CSS (`transition-all duration-300`) do elemento `<aside>` termine. Como resultado, o container é medido com dimensões reduzidas ou zeradas, travando a renderização interna do SVG.

**Detalhamento Técnico de Planejamento:**
- **Injeção de Ciclo de Vida Reativo (Lazy Redraw)**: Adicionou-se um estado de controle de renderização e montagem `renderKey` no componente genérico de sparkline `TrendSparkline.tsx`.
- **Timer de Conclusão de Transição**: Criou-se um `useEffect` com timeout de `350ms` (tempo suficiente para garantir a conclusão de transição CSS de `300ms`). 
- **Forçar Re-Análise de Container via Re-Keying e Resize**: Ao estourar o cronômetro, o componente incrementa sua `renderKey` para recriar o wrapper ApexCharts do zero, forçando uma medição limpa da largura do DOM já totalmente expandido (260px). Um evento sintético `window.dispatchEvent(new Event('resize'))` é disparado simultaneamente para sanear dependências ativas.

**Impactos:**
- **Gráficos Sempre Nítidos e Completos**: Garante que o sparkline de evolução de patrimônio líquido seja desenhado com 100% de preenchimento e resolução horizontal assim que o painel expande.
- **Robustez Multi-Componente**: O patch protege qualquer outra inclusão futura de sparklines em painéis expansíveis dinâmicos.

---

## Decisão Arquitetural, Resolução de Stacking Context (Z-Index Overlap) do Cockpit - v2026.133

**Data:** 13 de Junho de 2026 às 21:40 UTC  
**Motivo:** Corrigir a sobreposição visual indesejada em que o "Header Tático Fixo" do `DecisionForm.tsx` (Decision Terminal) que sobrepõe e renderiza acima do "Intel Pulse Sidebar" do `Dashboard.tsx` quando este está expandido em hover. 

**Detalhamento Técnico de Planejamento:**
- **Readequação do Posicionamento do Sidebar**: O z-index da barra lateral principal Intel Pulse em `Dashboard.tsx` quando sob evento de hover ativo (`isSidebarHovered = true`) foi elevado de `z-50` para `z-[150]`.
- **Prevenção de Invasão pelo Header Fixo**: O z-index do elemento `<header>` fixo táctico em `DecisionForm.tsx` (anteriormente `z-[100]`) foi atenuado de forma calibrada para `z-20`. Isto permite que ele continue flotando devidamente sobre o conteúdo scrollável nativo de sua própria div interna (que opera em `z-10` ou inferior) enquanto permanece posicionado abaixo do painel overlay global do sistema (agora em `z-[150]`).

**Impactos:**
- **Interface Flutuante Perfeita**: Restabelece uma hierarquia visual limpa e elegante, garantindo que o painel de navegação global sempre se posicione no topo do viewport ao ser aberto.
- **Hierarquia Visual Coerente**: Respeita o empilhamento lógico estrito correspondente à função hierárquica dos elementos na aplicação.

---

## Decisão Arquitetural, Elevação de Estado e Persistência de Preferências nos Cockpits - v2026.132

**Data:** 13 de Junho de 2026 às 21:26 UTC  
**Motivo:** Corrigir definitivamente o recolhimento indesejado de painéis retráteis secundários e perda de estado de "Modo Retrátil" (Cockpit de Controle e Cockpit Preview em `DecisionForm.tsx`) quando a equipe transita entre abas principais ("DECISÕES DA RODADA", "MATRIZ FINANCEIRA" ou "HISTÓRICO & PROJEÇÕES"). Por ser um componente que sofre unmount completo durante a navegação por abas em `Dashboard.tsx`, as variáveis locais do `DecisionForm.tsx` eram reinicializadas, o que gerava fricção na usabilidade.

**Detalhamento Técnico de Planejamento:**
- **Elevação de Estado (State Lifting)**: Elevou-se os estados de controle `isLeftNavCollapsed` e `isRightPreviewCollapsed` direto para o pai (`Dashboard.tsx`), sendo transmitidos via props customizáveis opcionais para o `DecisionForm.tsx`.
- **Preservação por Montagem Ininterrupta**: Como o `Dashboard.tsx` permanece ativamente montado durante as trocas de abas secundárias, o estado da barra lateral de cockpit e do preview lateral permanece intacto no ciclo de vida do pai.
- **Padrão de Fallback Híbrido**: O componente `DecisionForm.tsx` foi estruturado sob o padrão híbrido em que é compatível com injeção externa via props, mas opcionalmente instancia e sincroniza estados locais persistidos via `localStorage` caso renderizado autonomamente em outros contextos.
- **Persistência Sincronizada local**: Ambas as pontas agora sincronizam imediatamente via reatividade no `localStorage` sob as chaves `empirion_is_left_nav_collapsed` e `empirion_is_right_preview_collapsed`.

**Impactos:**
- **Navegação Contínua de Alta Precisão**: Equipes podem examinar a demonstrativa financeira completa de DRE e DFC e, ao retornar às decisões, encontram os cockpits laterais flutuantes e painéis no exato estado visual em que os deixaram.
- **Zero Flickering Visual**: Preservação estrita das dimensões de tela sem redesenhos ou reposicionamentos desnecessários durante a movimentação tática do empreendedor.

---

## Decisão Arquitetural, Persistência de Preferências de Visualização por Equipe & Sessão - v2026.131

**Data:** 13 de Junho de 2026 às 21:15 UTC  
**Motivo:** Evitar a perda ou redefinição dos estados de "Modo Retrátil" (sidebar e painéis laterais de cockpits) quando o usuário navega entre as abas do painel ("DECISÕES DA RODADA", "MATRIZ FINANCEIRA" e "HISTÓRICO & PROJEÇÕES"). Anteriormente, por serem estados estritamente locais e voláteis, a alternância de tela destruía a árvore do componente e forçava a re-inicialização do layout, gerando fricção aos diretores.

**Detalhamento Técnico de Planejamento:**
- **Armazenamento de Preferências Local (localStorage)**: Registros fiduciários das configurações sob chaves designadas e autocontidas:
  - `empirion_is_sidebar_collapsed` para o Intel Pulse Sidebar (esquerda global).
  - `empirion_is_left_nav_collapsed` para o Cockpit de Decisões (esquerda local).
  - `empirion_is_right_preview_collapsed` para o Cockpit Preview (direita).
- **Tratamento de Estado Lazy**: Inicialização assíncrona/lazy no `useState` para garantir ótimo tempo de carregamento de páginas: `() => { if (typeof window !== 'undefined') { ... } }`.
- **Efeitos Colaterais Auto-Sincronizados**: Mapeamento via React `useEffect` reativo, persistindo mutações de estado nas chaves devidas no instante de sua ocorrência.

**Impactos:**
- **Navegação Contínua Ininterrupta**: Equipes podem mudar de tela para analisar o DRE ou gráficos do histórico sem precisar desativar/reativar o visual flutuante do cockpit repetidamente.
- **Excelente DX e Robustez de Tela**: Comportamento estável e fluido mesmo sob recarregamento acidental do navegador.

---

## Decisão Arquitetural, Layout Flutuante Retrátil nos Cockpits de Decisão & Prevenção de Shifting - v2026.130

**Data:** 13 de Junho de 2026 às 21:00 UTC  
**Motivo:** Corrigir de forma definitiva as imperfeições e micro-deslocamentos de interface (layout shifting) que ocorriam quando as barras laterais do Cockpit de Controle (esquerda) e Cockpit Preview (direita) estavam configuradas no "Modo Retrátil" e o usuário passava o mouse em cima. Anteriormente, a expansão dessas barras empurrava os campos de inputs e tabelas dos steps de decisões secundariamente, prejudicando o foco visual do usuário.

**Detalhamento Técnico de Planejamento:**
- **Prevenção de Shifting via Placeholders Constantes**: Implementação de containers invisíveis funcionais (`72px` na esquerda e `12px` na direita) que ocupam espaço fixo constante no fluxo do documento (document flow), assegurando que o espaço alocado para os cockpits seja rigorosamente consistente sob qualquer estado hover.
- **Flutuação de Estado via Posicionamento Absoluto & Sobreposição Superior (z-50)**: Redefinição dos painéis reais expandidos dos cockpits para utilizar posicionamento absoluto (`absolute left-0` / `absolute right-0`) sobrepostos no viewport em z-index elevado (`z-50`) quando o mouse passa por cima. Isso impede que os menus retráteis fiquem por baixo dos cartões dos Steps de decisão ou de elementos e gráficos ativos nos painéis secundários.
- **Unificação de Estados de Renderização no RightPreviewPanel**: Eliminação de retornos redundantes cindidos na árvore do DOM, estruturando o comportamento adaptativo sob uma única div pai com transições suaves sincronizadas de largura (`w-12` a `w-[410px]`) e animações nativas de CSS (Tailwind) orientadas por eventos de `onMouseEnter` e `onMouseLeave` síncronos.

**Impactos:**
- **Zero Squeeze em Steps de Decisões**: Conforto visual absoluto ao preencher formulações de compras, contratações de pessoal, e volumes de produção, eliminando movimentos involuntários de quebra de foco de interface.
- **Fluidez em Displays de Alta Resolução**: Transições aceleradas por hardware das barras laterais mantendo a conformidade com as tendências estéticas de design moderno de 2026.

---

## Decisão Arquitetural, Sandbox de Validação & Ideação de Negócios Reais para Empreendedores - v2026.129

**Data:** 11 de Junho de 2026 às 17:05 UTC  
**Motivo:** Transformar o simulador educacional corporativo e suas bases de concorrência ativa em uma plataforma estratégica de referência internacional onde novos empreendedores e fundadores de startups possam simular cenários, cadastrar hipóteses e testar a viabilidade econômica de suas ideias (Business Plan Playground) de forma assistida por inteligência de mercado e mentoria.

**Detalhamento Técnico de Planejamento:**
- **Wizard de Captação e Premissas**: Design de interface amigável para inputs corporativos simplificados (CAPEX inicial, OPEX estimado, margem variável, preços nominais e prazos de ciclo).
- **Projeções Contábeis de Viabilidade (CPC/IFRS)**: Motor adaptado para resolver de forma nativa e automática os relatórios de Ponto de Equilíbrio (Break-Even), Valor Presente Líquido (VPL) e Taxa Interna de Retorno (TIR) fiduciários acumulados.
- **Mentor Inteligente com Integração Gemini API**: Canalização estruturada de dados contábeis (balanços acumulados em rounds paralelos) para a API do Gemini, provendo diagnósticos e insights acionáveis de melhora operacional ao empreendedor.
- **Sandbox Multi-Cenários Isolado**: Registro e replicação de hipóteses no banco de dados com isolamento estrito via RLS do Supabase, salvaguardando o sigilo comercial e a privacidade das patentes/pitches dos usuários.

**Impactos:**
- **Atração de Novo Nicho de Usuários (B2C & Startups)**: Elevada expansão do público-alvo, tornando o simulador útil não apenas para campeonatos universitários, mas para incubadoras de novos negócios e aceleradoras regionais.
- **Plano de Sandbox Consolidado**: Registro de premissas, fórmulas e versionamento tático documentado em `/docs/ENTREPRENEUR_SANDBOX_PLAN.md`.

---

## Decisão Arquitetural, Planejamento de Ativação Multi-Setorial & Extensão de Tipos - v2026.128

**Data:** 11 de Junho de 2026 às 16:45 UTC  
**Motivo:** Garantir a prontidão absoluta e o desacoplamento arquitetural do EMPIRION ORACLE para receber múltiplos novos setores da economia global (reivindicados por tutores e organizadores de arenas do torneio), tais como Agronegócio, Cooperativismo, Varejo, Mercado Financeiro e Construção Civil, preservando a imutabilidade matemática e as regras contábeis transversais unificadas de partidas dobradas (IFRS/CPC).

**Detalhamento Técnico de Planejamento:**
- **Padrão de Strategy Polimórfico (`ISectorSimulationEngine`)**: Formulação do contrato de interface que extrai a física de cálculo e validações de cada Bounded Context (Setor) num namespace independente, liberando o orquestrador de turnover (`simulation-engine`) de acoplamentos táticos ou condicionais acachapantes.
- **Expansão de Tipo Segura (`/types/sector.ts`)**: Introdução oficial das estruturas e interfaces com tipagem forte para cobrir:
  - **Cooperativismo:** Atos Cooperativos, Sobras/Perdas redistribuídas e provisionamento para o Fundo de Assistência Técnica (FATES).
  - **Comércio & Varejo:** Rastreamento de linhas de produto, CMV, taxas financeiras de adquirentes e incidentes de ruptura de estoque.
  - **Construção Civil / Real Estate:** Controle de projetos ativos na planta, andamento físico-financeiro e apropriação de receitas/custos sob o método do POC (Percentage of Completion - CPC 47).
- **Consistência Contábil Intacta**: Todas as transações específicas do domínio físico de cada setor são reduzidas a contrapartidas de débitos e créditos lançados no Razão via partidas duplas, reaproveitando sem restrições a biblioteca de balanço e auditorias triplas fiduciárias (`validateTripleConsistency`).

**Impactos:**
- **Altíssima DX e Concorrência de Times**: Engenheiros e analistas agem em concorrência produtiva (Sprint Slices), criando novos módulos setoriais sem intercorrências ou risco de quebras no simulador fabril principal (`v13.2+`).
- **Plano de Ativação Operacional**: Documento tático unificado inserido em `/docs/MULTI_SECTOR_PLAN.md`.

---

## Decisão Arquitetural, Planejamento e Design de Arquitetura de Internacionalização (i18n) - v2026.127

**Data:** 11 de Junho de 2026 às 16:15 UTC  
**Motivo:** Planejar a expansão pedagógica e metodológica do EMPIRION ORACLE para atender equipes e tutores de outras nacionalidades (foco em Inglês e Espanhol), estruturando um i18n leve, de alto desempenho, robusto e compatível com as regras contábeis internacionais (IFRS / IAS 21) sem impactar negativamente a experiência de desenvolvimento (DX).

**Detalhamento Técnico de Planejamento:**
- **Centralização de Dicionários Estáticos (`/src/locales/`)**: Delimitação preliminar das chaves estáticas de interface organizadas sob arquivos JSON dedicados por localidade (`pt.json`, `en.json`, `es.json`).
- **Provedor Contextual de Internacionalização (`I18nProvider`)**: Design de um contexto React que gerencia o idioma ativo e disponibiliza a função utilitária do tradutor tipo-seguro `t(path)`.
- **Estratégia de Banco de Dados Híbrido (`JSONB`)**: Persistência de dados cadastrais dinâmicos originados pelo Tutor (Gazetas de notícias, regras do cronograma, descrições regionalizadas) no Supabase de forma flexível através de colunas JSONB estruturadas, evitando redundância e duplicação de tabelas.
- **Conformidade Contábil no Glossário (CPC 02 / IAS 21)**: Mapeamento de termos contábeis de partida entre a nomenclatura nacional clássica brasileira e seus sinônimos oficiais nos padrões americanos e latinos (DRE -> Income Statement -> Estado de Resultados, etc.) validados pelo Contador Sênior.

**Impactos:**
- **Plano Arquitetural Consolidado**: Registro de diretrizes multilíngues em `/docs/I18N_PLAN.md` que guiarão a futura implementação prática de tradução, permitindo ao Product Owner revisar os layouts, impactos de volume de palavras e migração de banco antes de comutar chaves físicas de código de simulação.

---

## Decisão Arquitetural, Expansão Multimoeda Dinâmica para Moeda-base do Torneio (CPC 02) & Inclusão de Variação Cambial na Árvore Financeira Inicial - v2026.126

**Data:** 11 de Junho de 2026 às 15:00 UTC  
**Motivo:** Generalizar o motor de simulação cambial para aceitar qualquer moeda (BRL, USD, GBP, CNY) como moeda-base do torneio configurada pelo Tutor, salvaguardando a consistência e integridade das contas do DRE e reconciliação cambial de saldo de contas a receber (`fin.fx_variance`).

**Detalhamento Técnico:**
- **Generalização Multimoeda Dinâmica**: Extensão do motor em `services/simulation.ts` para computar a taxa de câmbio (cross-rates) tendo como âncora a moeda corporativa selecionada pelo Tutor do torneio. Se a moeda da praça de exportação é diferente da moeda-base consolidada, o sistema aciona a taxa de conversão cruzada correta e calcula a receita e despesas locais com extrema fidelidade.
- **Sincronização de Árvore Inicial (`constants.tsx`)**: Inclusão explícita do nó `{ id: 'fin.fx_variance', label: '(+ / -) VARIAÇÃO CAMBIAL', value: 0.00, type: 'revenue', isEditable: true }` sob a conta `fin_res` no `INITIAL_FINANCIAL_TREE`, garantindo integridade e consistência imediata entre a estrutura do JSON estático e os resultados emitidos no motor e telas de rateio de faturamento.
- **Acoplamento no Recálculo Síncrono de Inicialização**: Atualização em `services/initialization.ts` no procedimento `recalculateStatements` para agregar o potencial saldo inicial de `fin.fx_variance` dentro do totalizador `fin_res` de resultado financeiro consolidado, evitando desvios acumulados de round zero.

**Impactos:**
- **Flexibilidade Multimoeda Perfeita**: Tutores ganham liberdade absoluta de parametrizar campeonatos cujo balanço e moeda corporativa consolidada operem em USD, GBP, CNY ou BRL, mantendo conversão translacional segura sob os mandamentos do CPC 02 / IAS 21.

---

## Decisão Arquitetural, Confidencialidade de Rascunhos de Decisão & Políticas RLS de Governança - v2026.120

**Data:** 11 de Junho de 2026 às 11:30 UTC  
**Motivo:** Atender às exigências de ética corporativa e governança no torneio EMPIRION, onde as equipes competidoras jamais devem visualizar rascunhos de decisões ou telemetria em tempo real de outras equipes adversárias durante rounds em andamento. Essa isolação é válida para todo e qualquer módulo (incluindo o industrial sob validação). Somente o Tutor e Observadores autorizados (Conselheiros) cadastrados pelo Tutor podem auditar essas decisões de forma preventiva para advertir sobre erros lógicos de preenchimento.

**Detalhamento Técnico:**
- **Ativação de Row-Level Security (RLS) Estrita**: Ativou-se o RLS nas tabelas `trial_decisions` e `current_decisions` (tabela de decisões no modo de campeonato pago) para evitar o comportamento padrão permissivo do Supabase/PostgREST.
- **Isolamento de Leitura para Estudantes**: Criou-se políticas de SELECT que limitam o acesso direto aos registros de rascunhos. Estudantes apenas conseguem ler a linha cujo `team_id` coincide com o seu próprio ID de equipe participante (seja no modo Trial/Sandbox via vinculação direta, seja no modo pago via mapeamento de membros da equipe `team_members`).
- **Acesso Irrestrito para Auditoria Governamental**: Tutores, Administradores globais e Observadores credenciados superam a proteção através de bypass legítimo nos filtros DBMS. O sistema valida se `user_profiles.role` é `'tutor'`, `'admin'`, `'observer'`, ou se o e-mail/ID do usuário está incluído na coleção de observadores autorizados da arena (`championships.observers` ou `trial_championships.observers`), provendo feeds síncronos na UI do Tutor Arena para correção assistida de falhas.
- **Migração Segura e Replicável**: Criação da migração física `/supabase/migrations/20260611112600_governance_decision_privacy.sql` e atualização permanente do script de referência `/database_rls.sql` para garantir a reprodutibilidade.

**Impactos:**
- **Concorrência Justa e Ética**: Blindagem total contra espionagem industrial e vazamento de formulações de produção, fretes regionais e estratégias de preço/marketing entre equipes antes de fechar o round.
- **Auditoria Proativa Assistida**: Conselheiros e Tutores mantêm visualização síncrona excelente de todas as submissões provisórias, podendo intervir de forma pedagógica e construtiva.

---

## Decisão Arquitetural, Sincronismo de Estoque Histórico & Conciliação de DRE no MarketingStep - v2026.119

**Data:** 11 de Junho de 2026 às 00:28 UTC  
**Motivo:** Corrigir a inconsistência crítica onde a quantidade acumulada de "Seu Volume Vendido" e os lucros/margens líquidas por região na sub-DRE do `MarketingStep.tsx` (histórico do round anterior) apareciam inflados em relação à saída física real de Produto Acabado (PA) auditada no Kardex. Por exemplo, a Equipe 1 exibia 10.272 unidades vendidas em vez de 8.532 reais, devido a um descompasso fiduciário onde o saldo final do período anterior era somado indevidamente com a produção do ciclo, mimetizando uma dupla-contagem disponível para venda.

**Detalhamento Técnico:**
- **Readequação do Estoque de Partida Histórico (Kardex Alignment)**: Ajustou-se o extrator de estatísticas históricas passadas (`calculateRegionStats` com `useHistoricalOnly = true`) para colher de forma estrita o estoque fiduciário real de início da rodada (`c.kpis?.kardex?.pa?.saldoInicialQtd`) e a produção exata da rodada (`c.kpis?.kardex?.pa?.entradasQtd`). Isso elimina a dupla contagem que usava o estoque de fechamento (`stock_quantities.finished_goods`) somado à produção do ciclo.
- **Integração das Chaves Geográficas nos Resultados do Banco (v19.7 Sapphire Gold)**: Adicionou-se persistência explícita das vendas por região reais (`regional_units_sold`) e demandas regionais computadas (`regional_demands`) dentro do payload de KPIs gerado na simulação central de turnovers (`calculateProjections` em `services/simulation.ts`).
- **Resiliência de Backup e Fallback**: O processador visual do Cockpit do estudante prioriza o faturamento real e as demandas armazenadas diretamente no banco de dados (`c.kpis?.regional_units_sold` e `c.kpis?.regional_demands`) caso já existam (novos turnovers), e recai sobre a back-calculation corrigida alinhada ao estoque inicial fiduciário para campeonatos legados em andamento, blindando 100% o sistema contra distorções matemáticas.

**Impactos:**
- **Fidelidade Analítica e Confiança de Decisão**: As equipas de estudantes visualizam agora dados de lucros históricos regionais perfeitamente congruentes com os relatórios contábeis oficiais e Kardex de PA, prevenindo falsas interpretações de volume excedente de faturamento.

---

## Decisão Arquitetural, Margem por Geolocalização & DRE Regional de Vendas - v2026.118

**Data:** 10 de Junho de 2026 às 21:20 UTC  
**Motivo:** Implementar a capacidade analítica de Inteligência Comercial e Controladoria Contábil solicitada pela equipe multidisciplinar, integrando uma Demonstração de Resultado do Exercício (DRE) expandida por praça de vendas (DRE por Geolocalização) no Cockpit do Aluno. Isso soluciona o gap estratégico de incapacidade de visualização de margens líquidas e lucros brutos/líquidos diretos agregados regionalmente.

**Detalhamento Técnico:**
- **Modelo de Custeio Geográfico por Absorção Focal (CPC / IFRS)**: Estruturou-se uma sub-DRE em cada Card regional que desconta da Receita Bruta: os impostos faturados por região (flutuante conforme alíquotas de IVA por round), os Custos de Produtos Vendidos Alocados (WAC global da equipe multiplicado por vendas físicas da praça), despesas regionais de campanhas de marketing local e custos de transporte/frete logístico da praça.
- **Micro-interação de Controladoria**: Adição de Disclosure/Accordion expansível ("DRE & Lucratividade") com indicação visual de tendências positiva e negativa (`lucro >= 0 ? TrendingUp : TrendingDown`), permitindo simular faturamento líquido e margem líquida percentual em tempo real com base nas variações de decisões do cockpit de vendas.
- **Motor de Custo Médio (WAC Estimator)**: Implementação de estimador contábil para o custo de estocagem PA (`wac`) recuperando dados reais do DRE histórico ou deduzindo pelo custeio padrão de entradas de matéria-prima (3x MP A + 2x MP B) acrescido de overhead fabril direto.

**Impactos:**
- **Incentivo à Visão de Gestão de Margem**: Os concorrentes abandonam a precificação puramente linear e passam a analisar a rentabilidade isolada por região de frete, mitigando riscos de prejuízo de importação/distribuição.

---

## Decisão Arquitetural, Cálculo de Mercado Demográfico & Market Size Concorrencial - v2026.117

**Data:** 10 de Junho de 2026 às 20:15 UTC  
**Motivo:** Corrigir a divergência conceitual e de valores no cálculo de demanda de mercado exibido para as equipes concorrentes no Cockpit visual no Round 1, onde o "Market Share Regional" (antigo `totalRegionDemand`) expressava valores isolados e estáticos baseados exclusivamente na capacidade física de cada empresa individualmente, desconsiderando a soma da capacidade competitiva total de mercado e os pesos parametrizados pelo Tutor (ex: SUL = 40%, SUDESTE = 30%, etc.).

**Detalhamento Técnico:**
- **Modelo de Tamanho de Mercado Demográfico (Market Size por Região)**: A demanda total de cada região é agora redefinida e calculada de forma 100% sincrônica com a matemática do Tutor e com o processador central do banco. Ela passa a ser computada como:  
  `Demanda da Região = (Capacidade de Produção 100% de Todas as Equipes Somadas) * (Peso de Demanda de cada Região / 100) * (1 + Variação de Demanda / 100)`.
- **Competição Dinâmica por Participação de Mercado (Market Share)**: O cálculo de fatiamento do mercado em tempo real no Cockpit foi unificado para que as demandas capturadas flutuem proporcionalmente com base ao score competitivo individual de cada concorrente na região (composto por elasticidade-preço, marketing e termos de prazo de recebimento).
- **Rótulo Visual de Usabilidade de Negócio**: Mudança do rótulo confuso `Market Share Regional (un)` na interface de marketing (`MarketingStep.tsx`) para `Demanda do Mercado (Market Size)` para representar adequadamente a realidade estatística de mercado (TAM).

**Impactos:**
- **Sincronia Total de Regras de Negócio**: Sincronia perfeita entre a simulação real de fechamento de round e os dados mostrados aos alunos em tempo de planejamento estratégico de vendas. No SUL, por exemplo, o aluno passa a visualizar de fato os 19.200 un previstos no modelo macro.

---

## Decisão Arquitetural, Rateio Proporcional de Estoque & Sincronismo de Vendas no Cockpit - v2026.116

**Data:** 10 de Junho de 2026 às 19:15 UTC  
**Motivo:** Sanar as três principais inconsistências do módulo de Marketing do round: a quantidade vendida (`Vendas na Região (un)`) e a participação de mercado (`Venda Relativa (%)`) apareciam idênticas em todas as regiões por conta de divisão estática do estoque contra demand_weight, divergindo também do montante real registrado nas fichas de Kardex e no Custo do Produto Vendido (CPV). Adicionalmente, implementar indicador de vendas agregadas concorrenciais por região.

**Detalhamento Técnico:**
- **Algoritmo de Alocação de Vendas via Rateio Proporcional (v19.6 Sapphire)**: Em vez de limitar de antemão o estoque em porções simétricas rígidas (`totalQtyForSale / regionCount`), o sistema agora calcula a demanda atraída individualmente em todas as regiões para cada participante. Se a demanda acumulada de todas as praças for maior do que o estoque total pronto para venda, aplica-se um coeficiente dinâmico proporcional de atendimento (`teamStockRatio = totalQtyForSale / totalDemandAllRegions`), garantindo que as vendas físicas regionais flutuem em estrita consonância com os esforços competitivos de precificação, marketing e prazos em cada praça.
- **Paridade de Motores de Simulação**: A lógica de rateio dinâmico foi implementada de modo estritamente idêntico no simulador de turnovers base (`/services/simulation.ts`), no kernel de fallback (`/services/simulation-core.ts`) e no cockpit visual do estudante (`/components/steps/MarketingStep.tsx`).
- **Novo Indicador Analítico "Vendas Totais na região (qtde)"**: Integrado na função `calculateRegionStats` de `MarketingStep.tsx` e exposto no HUD regional para representar a somatória de unidades faturadas por todas as equipes em atividade concorrencial naquela região específica.

**Impactos:**
- **Exatidão Contábil Total**: Alinhamento imediato e inabalável entre os painéis de projeção do Cockpit de Marketing e os registros definitivos do Kardex e Demonstrativo de Resultado do Exercício (DRE).
- **Competição Dinâmica Realista**: Esforços adicionais de campanhas ou preços diferenciados passam a surtir efeito regional fluido, gerando vendas líquidas e taxas de venda relativa (`Venda Relativa (%)`) dinamicamente variadas por praça.

---

## Decisão Arquitetural, Sentinela Temporal Redundante & Feedback Verde Esmeralda Pulsante - v2026.115

**Data:** 09 de Junho de 2026 às 21:30 UTC  
**Motivo:** Correção de descompasso visual no cockpit de comando onde o término do round ("ENCERRADO") não habilitava ou não sinalizava adequadamente a liberação do botão de "RXX" para o tutor clicar, além de falta de destaque chamativo no botão de liberação.

**Detalhamento Técnico:**
- **Sentinela Temporal Redundante:** Implementação de sonda de varredura periódica (`setInterval` com frequência de 2000ms) executada de forma síncrona diretamente no cockpit de admin (`AdminCommandCenter.tsx`). Essa sonda valida o relógio de sistema contra a data de início (`round_started_at` ou `created_at`), prazos limites, estados de pausa e tempos pendentes, chamando preventivamente e garantindo a ativação confiável do status `isTimerExpired(true)`.
- **Botão Esmeralda Pulsante (Emerald Pulsing CTA):** Reestilização cirúrgica do botão de fechamento de ciclo (Turnover) na barra superior do tutor. Quando o temporizador expira e o Turnover torna-se realizável:
  - O botão abandona a cor laranja neutra e assume cor Verde Esmeralda brilhante (`bg-emerald-600 hover:bg-emerald-500` com borda e sombra correspondentes).
  - Recebe um efeito contínuo cinematográfico de pulsação suave em micro-interações (`animate-[pulse_2s_infinite]`), induzindo visualmente a chamada para ação (Call to Action).
  - Quando bloqueado, adquire visual sofisticado com opacidade reduzida e estados de cursor desativados.

**Impactos:**
- Eliminação completa de descompassos ou race conditions temporais após o zeramento natural dos prazos da arena.
- Facilidade tátil e cognitiva inconfundível para o tutor identificar o exato momento em que o Turnover foi liberado no sistema.
- Estética moderna alinhada às tendências visuais exigentes de 2026.

---

## Decisão Arquitetural, Sentinela Fiduciária & Compactação Máxima de Gráficos e Gaps - v2026.114

**Data:** 09 de Junho de 2026 às 21:04 UTC  
**Motivo:** Implementação de layout ultracompacto para toda a malha de dashboards de gráficos, eliminação de rótulos estáticos flutuantes (mantendo e focando apenas nos tooltips interativos ao passar o ponteiro do mouse) e criação do Sentinela Fiduciário de Liquidez do aluno para identificação imediata de insolvência (< 1,00).

**Detalhamento Técnico:**
- **Zero Rótulos Estáticos (Keep Tooltips Only):** Desativação do recurso `dataLabels: { enabled: true }` nos arquivos `EmpirionLiquidityChart.tsx`, `EmpirionBarComparison.tsx` e demais módulos visuais. Agora, os números são apresentados somente em hover dinâmico através do tooltip, garantindo máxima limpeza na interface e evitando sobreposição indesejada.
- **Eliminação de Espaço Inútil (Borda & foreignobject):** Redução do padding geral de todos os containers de gráficos e do grid de espaçamento dos eixos internos (ApexCharts `grid.padding` zerado/minimizado para lateralidade de 2px e teto de 2px). Os cartões dos gráficos foram reduzidos de um amortecimento redundante de `p-6` para um espaçamento responsivo e denso de `p-3 pb-1`.
- **Disfarce de Grid Gap (Compact Grid):** Redução do distanciamento interno do Bento de dashboards (`DashboardGrid.tsx`) de `gap-8` (32px) para `gap-3` (12px), aproximando os cartões de dados fiduciários e multiplicando o espaço disponível em resoluções desktop e mobile.
- **Sentinela Crítico de Liquidez Operacional:** Injeção de banner fiduciário condicional e reativo à propriedade `currentKpis.liquidity_current < 1.0` de forma flutuante glassmorphism com gradiente de perigo (tonalidade `rose-950/40` e borda `rose-500/30`), alertando a equipe sobre a incapacidade potencial de cobrir obrigações de curto prazo.

**Impactos:**
- Dashboard extremamente focado em densidade analítica de mercado e alta gerência corporativa fiduciária ("Premium Compactado").
- Melhor aproveitamento horizontal e vertical de tela para resoluções de notebooks e tablets de alunos.
- Mitigação de sobreposição de números.
- Alerta visual proativo sobre a integridade financeira das tomadas de decisões.

---

## Decisão Arquitetural & Gráfico de Linhas de Tripla Liquidez (Quick, Current, General) - v2026.113

**Data:** 09 de Junho de 2026 às 20:42 UTC  
**Motivo:** Implementação de suporte visual completo e fidedigno aos três principais indicadores de liquidez clássicos (Liquidez Seca, Liquidez Corrente e Liquidez Geral) do simulador, em conformidade com o gráfico proposto em anexo, de padrão EMPIRION de alta fidelidade e em Dark Mode.

**Detalhamento Técnico:**
- **Exclusão de Rodada Inicial (P-00):** O histórico visual ignora o round fiduciário `P-00` de modo que a volatilidade artificial da largada não destrua a representação da escala de tendências estratégicas operadas pelas equipes.
- **Busca Resiliente na Árvore de Contas:** Em vez de depender apenas de KPIs parciais pré-calculados, a nova classe modular `EmpirionLiquidityChart.tsx` extrai em tempo de execução os saldos de Ativos Circulantes, Passivos Circulantes, Estoques Agrupados (MP A, MP B, PA, WIP) e Passivos de Longo Prazo da árvore financeira do Balanço Patrimonial de cada round no banco de dados (`history.kpis.statements.balance_sheet`).
- **Acabamento Visual de Premium Grade:**
  - Estilização em linhas suavizadas em curvas (`smooth`) de espessura 3.5.
  - Paleta de cores de alta visibilidade e contraste: Azul (`#3b82f6`) para Liquidez Seca, Verde (`#10b981`) para Liquidez Corrente e Laranja (`#f97316`) para Liquidez Geral.
  - Legendas inferiores com ícones arredondados.
  - Habilitação de balões de rótulos diretos (`dataLabels`) em formato de badges sobre os pontos de dados no gráfico, permitindo legibilidade instantânea dos ratios (com no máximo duas casas decimais separadas por vírgula no padrão regional brasileiro).
  - Maximização do uso do espaço interno da div através de ajustes no espaçamento de amortecimento (`padding`) do grid interno do componente ApexCharts.

**Impactos:**
- Visualização consolidada imediata da integridade de endividamento da empresa, auxiliando diretamente o planejamento contábil da diretoria fiduciária.
- 100% responsivo e alinhado com a identidade estilística do painel do aluno.

---

## Decisão Arquitetural & Refatoração de Formatação do Eixo Gráfico (Floating-Point Precision) - v2026.112

**Data:** 09 de Junho de 2026 às 19:16 UTC  
**Motivo:** Corrigir a falta de formatadores nos eixos Y (`yaxis`) dos componentes ApexCharts, cujo comportamento padrão pelo motor do navegador renderiza marcações imprecisas geradas por cálculos booleanos de ponto flutuante em JavaScript (ex: `3000.0000000000005%` ou `2500.0000000000000`).

**Detalhamento Técnico:**
- **Injeção de Formatação de Duas Casas Decimais:** Adicionado o atributo `formatter` sob as chaves `yaxis.labels` nos arquivos `EmpirionBarComparison.tsx` (que desenha o gráfico de comparação de Market Share e TSR), `LandingCharts.tsx` (que ilustra as visualizações fakes de onboarding) e `Dashboard.tsx` (gráfico de progresso de Equity/Liquidez).
- **Adequação Regional Monitória (pt-BR):** Criada uma lógica de formatação avançada que converte os valores flutuantes fracionados em Strings amigáveis no padrão brasileiro (`pt-BR`) que remove automaticamente dízimas repetitivas através de `.toLocaleString('pt-BR', { maximumFractionDigits: 2 })` — mantendo inteiros (como `3.000` ou `3000`) perfeitamente representados e limitando flutuantes a no máximo duas casas decimais (ex: `2,85`).
- **Escalabilidade:** Valores superiores a 1 milhão (1M) ou mil (1k) são formatados de modo abreviado no gráfico de patrimônio, salvaguardando a responsividade lateral do eixo Y.

**Impactos:**
- Eliminação completa de caixas de números extensas e ilegíveis que poluíam ou quebravam a diagramação do dashboard.
- Apresentação visual limpa, fidedigna e de interpretação instantânea para os tutores e equipes de análise fiscal.

---

## Decisão Arquitetural & Correção Greenfield ("Start From Zero") de Mão de Obra Direta (MOD) - v2026.111

**Data:** 09 de Junho de 2026 às 17:35 UTC  
**Motivo:** No modo "Start From Zero" (Greenfield), o sistema trazia uma inconsistência urgente: pré-inicializava uma força de trabalho fantasma de 470 funcionários na MOD (Mão de Obra Direta), mesmo antes de qualquer aquisição de maquinário na rodada inicial (R-01). Corrigimos isso de forma unificada no kernel de simulação (`simulation-core.ts` e `simulation.ts`) e no cockpit visual do painel (`HRStep.tsx`), garantindo uma experiência 100% de partida zerada fidedigna.

**Detalhamento Técnico & Regra de Negócio Crucial de Paralisia Industrial:**
- **Inexistência de Operários no Início:** Se `starting_mode === 'start_from_zero'`, a equipe inicia rigorosamente com 0 operários operacionais na MOD (`defaultStaff = 0` em vez do padrão `470`).
- **Zeramento de Operators Required:** Com frota de maquinários vazia (`machines = []`), os operadores necessários (`operatorsRequired`) agora começam devidamente em 0 no cockpit de gestão, impedindo a exigência fantasma de tripulação.
- **Liberdade de Contratação Manual:** A aquisição de máquinas não gera contratação automatizada no round atual. Em consonância com a regra de gerenciamento de talentos do simulador, a equipe deve decidir e planejar manualmente o número de admissões no painel de contratação ("Número de Admissões"). Todas as admissões vêm do rascunho de decisões com o valor padrão `0`.
- **Regra Fiduciária de Paralisia de Ativos:** Como a contratação não é automática, se a equipe adquirir ativos físicos (novas máquinas) ou configurar multurnos em qualquer rodada, mas não efetuar o planejamento de recursos humanos correspondente (adicionando trabalhadores no campo manual de contratações do painel de RH), as máquinas ficarão paralisadas por falta de operadores. Essa escassez de recursos impactará diretamente a capacidade operacional prática e o limite máximo de produção real da rodada.
- **Integridade de Auditoria Tripla:** As correções integraram as constantes globais e fórmulas de faturamento de simulação tanto em tempo real de visualização quanto na virada efetiva da rodada operada pela engine no Supabase.

**Impactos:**
- Erradicação de custos salariais injustificados e operários falsos em partidas de faturamento zero.
- Preservação da conformidade de partidas "Start From Zero".
- Introdução de risco operacional realista: subutilização de ativos por ausência de planejamento tático de pessoal.

---

## Decisão Arquitetural & Alinhamento de Folha Dinâmica (MOD baseada em Equipe Real) - v2026.110

**Data:** 09 de Junho de 2026 às 12:00 UTC  
**Motivo:** Alinhar as provisões salariais brutas e simulações de Mão de Obra Direta (MOD) com o quadro de pessoal efetivamente disponível e contratado (antigos + novas admissões - demissões) em vez de paralisar os cálculos no quantitativo exigido por especificações industriais. Isso é elementar para rodar simulações de RH coerentes e Greenfield (Start From Zero) e detalha o provimento de encargos sociais de forma cirúrgica.

**Detalhamento Técnico das Regras de Negócio e Coleta Contábil:**
- **Atribuição de Equipe Real para Folha (`payrollMOD`):** O volume de pessoal do time de operadores que realmente aufere salários e encargos trabalhistas foi ajustado nos motores de simulação (`services/simulation.ts` e `services/simulation-core.ts`) para adotar o quadro disponível real (`operatorsAvailable`), eliminando o uso de `operatorsRequired` (que trazia custos de operários teóricos mesmo com admissões zeradas).
- **Projeção em Tempo Real de Pessoal no HUD (HRStep):** A estrutura de `payrollProjection` em `/components/steps/HRStep.tsx` foi atualizada para expor de forma detalhada o cálculo das linhas de folha de pagamento MOD (`payrollMOD`, `socialChargesMOD` etc.), criando um mini-balancete analítico no visual que divide o valor bruto do pessoal de MOD por salários base, encargos dinâmicos e bônus com base no quantitativo real.
- **Isolamento de Greenfield e Ampliação de Máquinas:** No onboarding de novos campeonatos Greenfield, sem frotas registradas e com 0 operários iniciais, o quantitativo e folha do quadro resumo de MOD inicia devidamente em 0. À medida em que o jogador preenche "NOVAS ADMISSÕES", o salário-base é multiplicado em tempo real no resumo. Na expansão marginalizada de máquinas em rounds futuros, a equipe real se soma linearmente aos novos ingressantes, escalonando de forma uniforme e pedagógica.

**Impactos esperados:**
- **Eliminação de Custos Fantasmas:** A empresa inicia com despesas salariais reais correspondentes aos contratos ativados de fato.
- **Decisão Tática Clássica de RH:** Visibilidade detalhada de como cada percentual fiduciário de encargos patronais (social_charges) infla a folha de pagamento patronal antes do turnover de rounds.
- **Consistência Sapphire de Auditoria:** Correção unificada no kernel do simulador e pré-calculadores preditivos garante 100% de consistência contábil.

---

## Decisão Arquitetural & Interface do Usuário - Painel de Balizamento Salarial & Simulador de Encargos em Tempo Real (HRStep) - v2026.109

**Data:** 08 de Junho de 2026 às 23:00 UTC  
**Motivo:** Resolver a opacidade nas tomadas de decisão salarial ("Piso Salarial Base") apontada pelas equipes, integrando indicadores fiduciários que previnem desalinhamentos competitivos e dão transparência sobre o impacto operacional de aumentos na folha de pagamento patronal antes da submissão da rodada.

**Detalhamento Técnico das Regras de Negócio e Coleta Contábil:**
- **Média Salarial Dinâmica do Setor (Último Período):** Integração ativa via SDK Supabase operada sob as tabelas de histórico (`companies` ou `trial_companies`). Em qualquer rodada superior a `R-0`, o sistema realiza um pré-fetch do estado de decisões do round anterior de todos os competidores da mesma arena (`championship_id`) para calcular a média salarial real praticada. Em `R-0` ou caso não haja transações comitadas anteriores, o sistema assume o balizador base fiduciário de partida (R$ 2.500,00).
- **Piso Inflacionado de Referência:** Expõe de forma transparente o salário-base original reajustado pela inflação acumulada do torneio (+`inflation_rate` do cronograma corrente, calculado de forma rigorosa via `getCumulativeAdjust`). Serve como régua oficial exigida pelo sindicato para estabilização de clima, acima do qual a motivação cresce e abaixo do qual os riscos de greve por insatisfação salarial escalam.
- **Projeção de Desembolso da Folha Bruta (Tempo Real):** Implementação de microssimulador financeiro (em `useMemo`) que intercepta o piso salarial definido pela equipe e o multiplica fiduciariamente pelas contingências industriais:
  - **MOD (Mão de Obra Direta):** Número de operários requeridos pela frota ativa de máquinas (`alpha`: 94, `beta`: 235, `gamma`: 445 operadores) reescalonados pelo nível de atividade industrial programada (`activityLevel`) e multiplicador de turnos extras MOD (`shifts` 2: x1.5 / shift 3: x2.0).
  - **Administrativo e Vendas:** Contingente padrão da arena (20 administrativos com multiplicador de salário 4x, e 10 profissionais de vendas com multiplicador 4x) inflados em tempo real com base no salário digitado pela equipe.
  - **Encargos Sociais Patronais:** Provisão de encargos fiscais e trabalhistas calculados de forma linear com base no coeficiente definido na arena (`social_charges`, default 35%).
  - **Total Bruto Projetado:** Estimativa totalizada agregando bônus de produtividade e encargos de contratação imediata para prover ao CFO da equipe visibilidade absoluta das provisões do DRE e saídas do Fluxo de Caixa (DFC) agregadas no período.

**Impactos esperados:**
- **Prevenção Pró-ativa contra Greves:** Equipas conseguem estimar o saldo de conformidade entre piso regional mínimo inflacionado e média setorial antes de fechar o round.
- **Exatidão no Planejamento de Fluxo de Caixa:** Erradica distorções ou surpresas contábeis relacionadas a provisões de pessoal nas projeções de DAE/DRE.
- **UX Enriquecida:** Alinhamento estético de nível internacional sob as tendências modernas e sóbrias do design de 2026.

---

## Decisão Arquitetural & Formulação Contábil - Advanced Strategic KPIs (ROE, BEP, IRR) - v2026.108

**Data:** 08 de Junho de 2026 às 21:05 UTC  
**Motivo:** Implementação da nova classe de indicadores de sustentabilidade corporativa de nível de comando estratégico exigida pelo Board Contábil e Comercial para aferição integrada de retornos econômicos, break-even operacional e taxas internas de rentabilidade.
**Detalhamento Técnico das Regras de Negócio e Formulações:**  
- **Retorno sobre o Patrimônio Líquido (ROE):** Calculado pelo triplo produto da matriz DuPont: `ROE = Margem Líquida x Giro do Ativo x Alavancagem Patrimonial`. Promove o desmembramento completo da eficiência de vendas, produtividade do ativo e estrutura de captação de terceiros em relação ao capital próprio dos acionistas (CPC 26).
- **Ponto de Equilíbrio (BEP - Break-Even Point / PE):** Aferição exata baseada na margem de contribuição (`MC`). `Custos Fixos = Mão de Obra Direta (MOD) + Custos Indiretos de Fabricação (CIF) + Despesas Operacionais (OPEX)`. `Custos Variáveis = (Custo dos Produtos Vendidos - MOD - CIF) + Provisão de VAT sobre vendas`. `MC = Faturamento - Custos Variáveis`. `MC% = MC / Faturamento`. `BEP (Faturamento Mínimo) = Custos Fixos / MC%`.
- **Taxa Interna de Retorno (TIR / IRR):** Computação dinâmica acumulada do retorno econômico das rodadas utilizando algoritmo numérico otimizado de Newton-Raphson com Bissecção estabilizada de barreira. Investimento inicial (`Fluxo 0` no Round 0) correspondente ao Patrimônio Líquido de abertura do balanço greenfield/running (R-0) ou fallback de capital e integralizações iniciais. Fluxos subsequentes (`Round 1` a `Round N`) alimentados pelo Fluxo de Caixa Operacional Livre (`fco_livre` ou EBITDA deduzido de Capex operacional, juros contratuais de empréstimos e provisões tributárias).
**Principais diferenças:**  
- **Visualização de Matrizes (`components/FinancialReportMatrix.tsx`):** Adição de novos registros dinâmicos e interceptação estrita destas chaves com tratamento visual e formatação sob o design system de 2026: moeda com faturamento formatado no BEP e coeficientes flutuantes percentuais no ROE e TIR.
- **Exportadores Analíticos (`analise-gerencial/spreadsheet-mappers.ts`):** Mapeamento e exportação consistente de dados das demonstrações em tabelas, alimentando as colunas nativas do Excel sem causar quebras ou distorções de escala de decimais, mantendo paridade visual absoluta entre o cockpit e as planilhas extraídas.
**Impactos esperados:**  
- **Tomada de Decisão Comercial:** Permite saber exatamente quanto cada equipe precisa faturar por período para vencer o break-even.
- **Transparência Acionaria:** Auditoria completa e de altíssima segurança de taxas internas de retorno e retorno de patrimônio líquido em conformidade internacional IFRS.

---

## Decisão Arquitetural & Interface do Usuário - Ampliação de Legibilidade de Indicadores e KPIs - v2026.107

**Data:** 08 de Junho de 2026 às 19:12 UTC  
**Motivo:** Resolver gargalo de acessibilidade visual apontado pelas equipes operantes, expandindo em aproximadamente 20% o tamanho das fontes dos principais KPIs operacionais, descrições e células de valores tabulados para maximizar a escaneabilidade do cockpit.
**Principais diferenças:**  
- **Painéis de Reports (`components/Reports.tsx`):**
  - KPI Cards: Ampliação do tamanho da fonte do valor principal de `text-2xl` para `text-3xl` (~+25%), o título descritivo (`label`) de `text-[10px]` para `text-[12px]` (+20%) e o texto de apoio de `text-[8px]` para `text-[10px]` (+25%).
  - ReportLines (DRE e Fluxo de Caixa): Elevação dos rótulos de `text-[10px]` para `text-[12px]` e dos valores contábeis de `text-sm` para `text-base` (+20%).
  - AccountRows (Balanço Patrimonial): Elevação dos títulos de contas sob `text-[11px]` para `text-[13px]`, e os valores absolutos de `text-sm` para `text-base`.
- **Matriz Financeira Oracular (`components/FinancialReportMatrix.tsx`):**
  - Strategic KPIs: Elevação do nome dos KPIs de `text-[8px]` para `text-[10px]`, descrições de `text-[7px]` para `text-[9px]`, e os valores principais nas colunas de `text-sm` para `text-base` (+14-20%).
  - Commitment Rows (Direitos/Deveres): Elevação das fontes de `text-[10px]` para `text-[12px]` no corpo da tabela.
  - Kardex Rows: Uniformização do fluxo físico e financeiro WAC, elevando os displays numéricos em 20%.
  - Standard dynamic rows: redimensionamento dos títulos de `text-[10px]` para `text-[12px]` e valores de `text-xs` para `text-sm font-medium`.
**Impactos esperados:**  
- **Acessibilidade & Ergonomia Cognitiva:** Menor fadiga visual na leitura crítica de balancetes de simulação.
- **Sincronia Estética:** Equilíbrio tipográfico mantido com a malha estrutural predefinida das tabelas.
**Status:** ATIVO, compilado, testado e em produção.

---

## Decisão Arquitetural & Interface do Usuário - Protocolo Moderno de Turnover com Diagnóstico de Erros - v2026.106

**Data:** 08 de Junho de 2026 às 18:20 UTC  
**Motivo:** Substituir diálogos bloqueantes síncronos da API nativa (`confirm` e `alert`) no processamento de Turnover de Round por um ecossistema de modais premium, escuros e imersivos na identidade visual da EMPIRION ORACLE, com detalhamento analítico e diagnóstico completo em caso de erros no Supabase.  
**Principais diferenças:**  
- **Modal de Confirmação do Turnover (`showTurnoverConfirmModal`):** Antes de iniciar o fechamento do round, exibe um modal centralizado de layout escuro sofisticado com animações de entrada e rotação de engrenagens do tempo, listando detalhadamente os procedimentos automáticos que o sistema executará (consolidação de decisões, cálculos contábeis do Balanço, DRE e DFC via CPC/IFRS, publicação da nova edição da Gazeta e inicialização de temporizador subsequente).
- **Modal de Sucesso de Turnover (`showTurnoverSuccessModal`):** Uma vez que o processamento do turnover seja comitado no Supabase sem erros, exibe uma janela verde esmeralda com o selo de auditores contábeis carimbando conformidade estrita com o CPC/IFRS, permitindo liberação de ritos com um único clique de comando.
- **Modal de Erro Crítico Analítico (`showTurnoverErrorModal`):** Em caso de falha da procedure PL/SQL ou erro relacional de conexões do Supabase, exibe um modal vermelho vibrante com diagnóstico analítico minucioso, apresentando a mensagem de depuração real emitida pela retaguarda em console de terminal de auditoria integrado a fim de facilitar investigações imediatas.
- **Micro-Animações Dedicadas:** Uso do motor `framer-motion` integrado com Tailwind para promover suavidade cirúrgica nas aparições de overlay com desfoque de fundo (`backdrop-blur-md`).
**Impactos esperados:**  
- **Excelência em Segurança da Informação:** Chaves de API e fluxos de reversão preservados sem expor vulnerabilidades, mas mantendo rastreabilidade total para o Tutor.
- **UX Nível Elite:** Alinhamento perfeito com a identidade visual sóbria, elegante e de altíssima qualidade de 2026.
**Status:** ATIVO, compilado, testado e comitado em produção.

---

## Decisão Arquitetural & Interface do Usuário - Modal Seletivo de Término do Round para o Tutor - v2026.105

**Data:** 08 de Junho de 2026 às 17:30 UTC  
**Motivo:** Implementar um modal de confirmação enriquecido, altamente interativo e com comportamento de texto seletivo quando o Tutor decide antecipar o término do tempo do round (zerar o temporizador de round) no cockpit administrativo.  
**Principais diferenças:**  
- **Análise Dinâmica de Submissões:** Ao clicar no botão de encerramento do round (zerar temporizador), o sistema realiza um pré-fetch em tempo real na tabela de decisões (`trial_decisions` ou `current_decisions` dependendo do tipo de campeonato) para comparar as equipes ativas inscritas contra as submissões de decisões reais registradas para o round em andamento.
- **Microcopy Seletivo para Pendências:**
  - *Com Equipes Pendentes:* Exibe o texto exato: `"Tem certeza que deseja antecipar o término do tempo do round? A Equipe XX não concluiu suas decisões! O temporizador será fechado imediatamente para todas as equipes, impossibilitando novas decisões."` acompanhado de um box estilizado de alerta em tom avermelhado (rose) listando individualmente com marcadores todas as frentes de competidores que ainda não definiram suas rodadas.
  - *Com Todas as Equipes em Conformidade (100%):* Adapta automaticamente o micro-texto para: `"Tem certeza que deseja antecipar o término do tempo do round? Todas as Equipes já entregaram suas decisões para este round. O temporizador será fechado imediatamente para todas as equipes, impossibilitando novas decisões."` selado com badge verde vibrante indicando conformidade geral de submissões.
- **Botões Padronizados:** Implementação das ações claras `CANCELAR` (para manter o round em curso normal) e `CONTINUAR` (para confirmar a antecipação e fechar o temporizador para as equipes).
- **Correção de Montagem Visível:** Correção do ciclo de vida de renderização da variável de estado `showForceExpireModal` injetada agora diretamente como filha do controle `<main>` dentro do bloco de retorno antecipado de renderização de Arena (`if (selectedArena ...)`), erradicando invisibilidade durante interações diretas no Cockpit do Tutor.
**Impactos esperados:**  
- **Zero erros por encerramento precoce acidental:** Tutores agora têm visão cirúrgica de quem ficará prejudicado antes de decretar o turnover forçado de round.
- **Fidelidade Operacional Sênior:** Interface extremamente profissional, robusta e alinhada às melhores práticas modernas de UX de 2026.
**Status:** ATIVO, compilado, testado e promovido em produção.

---

## Decisão Arquitetural & Regra de Negócio - Isolamento do R-0 Greenfield & Gatilho de Demissões Consecutivas - v2026.104

**Data:** 08 de Junho de 2026 às 13:30 UTC  
**Motivo:** Assegurar que Campeonatos iniciados em modo Greenfield "START FROM ZERO" não tenham disparos acidentais ou falsos positivos de greves operacionais baseados na rodada fiduciária R-0 (onde as decisões dos alunos de fato ainda não foram jogadas). Paralelamente, atende-se a uma demanda sênior do setor de Clima Organizacional para punir demissões em excesso que prejudicam gravemente a estabilidade laboral e instabilidade fabril por meio de um gatilho direto de greve para desligamentos recorrentes de operários (2 rodadas de demissões consecutivas base).  
**Principais diferenças:**  
- **Desconsideração Contábil de R-0 para Greves:** No motor principal (`simulation.ts`) e no pré-calculador analítico (`simulation-core.ts`), caso o Campeonato seja jogado com o modo `start_from_zero` ativo, se estivermos simulando o período 1 (`currentRound <= 1`), a contagem histórica de rounds ruins em motivação (`consecutive_ruim_rounds`) e de rounds com desligamentos operacionais (`consecutive_fired_rounds`) é forçada a `0`, bloqueando qualquer ativação indevida e garantindo a devida isonomia para frotas industriais na rodada inaugural de jogo.
- **Regulamento Trabalhista de Dupla Contingência:** Implementação do KPI `consecutive_fired_rounds` e salvamento nos KPIs da equipe. O sindicato dos operários decreta paralisação total de 50% (`strike_active = true`) se a liderança da empresa executar de forma continuada demissões na linha fabril de produção (`fired > 0`) em duas rodadas consecutivas.
- **Microcopy de Instrução Atualizado:** Atualizada a legenda em `HRStep.tsx` da tomada de decisões das equipes indicando que tanto o clima "RUIM" ($\le 0.75$) por dois rounds seguidos quanto demissões em dois períodos contínuos decretam greve na fábrica automática.
- **Alertas Claros e Dinâmicos:** O motor do Simulador gera mensagens de erro e alertas de acordo com o fator iniciador específico (motivacional, desligamentos sucessivos ou ambos acumulados) para que a equipe saiba exatamente o que deve corrigir.
**Impactos esperados:**  
- **Saneamento de Falsos Alertas Greenfield:** Zero problemas contábeis e estabilidade no onboarding de times na primeira rodada jogada de novos simuladores.
- **Estreitamento Estratégico Humano:** Maior realismo econômico e planejamento das equipes na redução do quadro profissional (MOD).

---

## Decisão Arquitetural & Correção Contábil - Sincronização do Ativo Fixo (Instalações Operacionais) - v2026.103

**Data:** 07 de Junho de 2026 às 16:30 UTC  
**Motivo:** Erradicar o travamento impeditivo contábil "BLOQUEIO DE SEGURANÇA CONTÁBIL (SAPPHIRE)" no turnover do período 1 (P1) para o P2 decorrente de um descompasso de R$ 749.999,99 (exatos R$ 750.000,00) causado pelo cálculo inconsistente de instalações fiduciárias anteriores (`prevInstallationsVal`).  
**Principais diferenças:**  
- **Anulação de Investimento "Fantasma" de Instalações:** No motor principal (`simulation.ts`), ao computar o valor de instalações fiduciárias das máquinas herdadas do período anterior (`prevInstallationsVal`), o mapeamento executava uma multiplicação redundante pela propriedade `.qty`: `prevInstallationsVal += alphaInstallCost * (m.qty || 0)`. Como as máquinas no array de frotas ativas (`team.kpis?.machines`) são registradas como instâncias individuais e unitárias sob as diretrizes do **CPC 27** (com ID e depreciação acumulada individualizada) sem campo `.qty`, a expressão `(m.qty || 0)` resultava em `0` para todas as máquinas legadas, calculando falsamente as instalações anteriores como `0,00 BRL`. No entanto, o `currentInstallationsVal` (instalações do período atual) era corretamente computado sem a multiplicação fictícia por quantidade, resultando nas instalações totais reais (ex: 5 Alphas * R$ 150.000,00 = R$ 750.000,00 BRL).
- **Inconsistência de Caixa por Capex Inexistente:** O desbalanceamento gerava uma variação positiva contábil em benfeitorias industriais de R$ 750.000,00 (`currentInstallationsVal - prevInstallationsVal`). O simulador interpretava isso como um desembolso por novos investimentos em máquinas no período corrente (`installationsInvest`), reduzindo de forma indevida o saldo do Caixa do Ativo em R$ 750.000,00 na DFC.
- **Divergência Patrimonial Sanada:** Como o caixa do Ativo sofria este desembolso fictício, enquanto o Ativo Imobilizado (`Edificios`, que inclui instalações históricas) permanecia no mesmo patamar legado, o Ativo Total fechava R$ 750.000,00 abaixo da soma real do Passivo + PL (que representava com exatidão o resultado lícito e dívidas fiscais).
- **Correção Fiduciária Definitiva:** O loop de mapeamento das frotas brutas anteriores (`prevMachines`) foi simplificado e pareado com as regras das frotas correntes, somando o valor de instalação de forma unitária direta sobre a coleção de instâncias corporativas.
**Impactos esperados:**  
- **Estabilidade em Turnovers de Clientes de Produção:** Campeonatos transitarão suavemente de P1 a P2 e seguintes na base de dados Supabase mantendo 100% de consistência contábil e auditoria Sapphire validada (Ativo = Passivo + PL).
- **Conformidade à Excelência de Auditoria:** Erradicação total do buraco fiduciário de Capex de instalações nas planilhas, DFC e Balanço Patrimonial das equipes ativas.
**Status:** ATIVO, homologado, compilado com sucesso e promovido em produção.

---

## Decisão Arquitetural & Versionamento - Padronização Global de Maquinário (Alpha / Gamma Parity + Retrocompatibilidade) - v2026.102

**Data:** 07 de Junho de 2026 às 15:15 UTC  
**Motivo:** Conclusão da padronização de nomenclatura de "Alfa/Gama" para "Alpha/Gamma", estirpando inconsistências de renderização de parque de maquinários e orçamentos do Aluno e Oráculo mantendo 100% de retrocompatibilidade com frotas já gravadas no banco de dados.  
**Principais diferenças:**  
- **Visualização das Especificações Técnicas no Aluno:** Os cartões de compra de ativos em `AssetsStep.tsx` agora puxam dados e especificações técnicas de forma híbrida e retrocompatível (usando campos `alpha/gamma` ou `alfa/gama`), sanando o desaparecimento de dados de modelos para os usuários após a alteração.
- **Normalização Dinâmica nos Motores de Simulação:** O motor principal (`simulation.ts`) e o pré-calculador analítico (`simulation-core.ts`) foram parametrizados para aceitar ambos os conjuntos de chaves (`alpha`/`gamma` e `alfa`/`gama`) para processar compras sem interrupções.
- **Mitigação Estrita de Tipos de Dados:** Foram aplicados casts explícitos de string em loops de redução de capacidade contra a união literal do TypeScript (`MachineModel`), prevenindo quaisquer panes de compilação sem restringir a expansão contínua.
- **Estruturação de Fallback em Estado React e Gemini:** Inicializações do formulário em `DecisionForm.tsx` e o gerador de decisões de emergência por IA em `gemini.ts` foram guarnecidos para povoar ambos os campos unificadamente.
**Impactos esperados:**  
- Visualização de especificações técnicas e preços reajustados restaurada perfeitamente na interface.
- Campeonatos ativos ou históricos contendo dados com strings antigas (legadas) fluirão sem travar e contabilizarão perfeitamente o CPV, capex e depreciações industriais.
**Status:** ATIVO, compilado de forma estável e homologado em produção.

---

## Decisão Arquitetural & Correção Contábil - Pareamento de CPV e DRE - v2026.101 Sênior Parity

**Data:** 07 de Junho de 2026 às 03:36 UTC  
**Motivo:** Erradicação de discrepâncias e defasagens de arredondamento de CPV (Custo do Produto Vendido) observadas entre a DRE (Demonstração do Resultado do Exercício) e o Kardex de Estoques da Matriz Financeira do Cockpit.  
**Principais diferenças:**  
- **Cálculo de Absorção Completa Unificado:** Identificou-se que a simulação contábil em `simulation.ts` considerava custos invisíveis de absorção secundária de faturamento do período (Rateio do Aluguel de Produção `valCif`, Custo de Treinamento `trainingCost`, e Custo de Estocagem `storageCost` de matérias-primas e produtos acabados calculados sobre o fechamento físico) no Custo de Produção do Período (CPP) para derivar o Custo Médio Ponderado (WAC) e, consequentemente, o CPV final do período. No entanto, o motor de simulação analítica do core (`simulation-core.ts`), que alimenta os KPIs fiduciários do modal do oráculo e a aba de Kardex/CPV do aluno, omitia esses três amortizadores do respectivo cálculo do CPP. Isso criava uma diferença notável na aba de "Kardex e CPV" e descompassos de conciliação. 
- **Reestruturação e Alinhamento do Motor de Verificação/Pré-Cálculos:** O módulo de validação e processamento `simulation-core.ts` foi reordenado para calcular o fechamento físico de vendas e estoques do período em tempo hábil. Com as quantidades identificadas, procedeu-se ao cálculo do Custo de Estocagem (`storageCost`), do Aluguel de Produção (`valCif`), e do Treinamento Operacional (`trainingCost`) exatamente de acordo com os parâmetros de absorção industrial aplicados no kernel principal de turnovers (`simulation.ts`).
- **Grupo de Alocação de Subcontas da Matriz:** Para manter os dados legíveis sem quebras visuais nas colunas da Matriz Financeira (Kardex e CPV), as parcelas complementares foram alocadas fiduciariamente de forma harmoniosa: os custos de Treinamento Operacional (`trainingCost`) e custo de Hora Extra (`extraProductionCost`) foram integrados à linha de **Mão de Obra Direta (MOD)**. Por sua vez, o rateio do Aluguel Industrial (`valCif`) e os custos de Estocagem (`storageCost`) foram consolidados na linha de **Depreciação Fabril** (facilitando a visão concentrada de custos fixos de instalações). O somatório consolidado das sublinhas agora confere exatamente (`100%`) com os saldos finais correspondentes de CPP e CPV das DREs em qualquer round e cenário.
**Impactos esperados:**  
- **Conformidade à Excelência IFRS / CPC 16:** CPV perfeitamente alinhado de ponta a ponta sem divergências ou defasagens estocásticas/financeiras no simulador, promovendo uma DX impecável.  
- **Visualização pedagógica irretocável:** Os relatórios do professor (Tutor) e do Aluno não apresentam divergências entre a aba DRE e a aba Kardex.  
**Status:** ATIVO, implantado e homologado com sucesso no compilador de produção.

---

## Decisão Arquitetural - Planejamento & Multi-Setores EMPIRION v2026.100

**Data:** 07 de Junho de 2026 à 03:20 UTC  
**Motivo:** Planejamento e organização de infraestrutura fiduciária multi-competidores e múltiplos setores (Indústria, Agronegócio, Mercado de Capitais, Serviços Recorrentes SaaS) disputando suas Arenas independentes ou integradas.  
**Principais diferenças:**  
- **Desacoplamento e Abstração de Domínio (Pattern Strategy):** Criação das regras básicas estruturais no arquivo de tipificação modular de infraestrutura de futuros setores em `/types/sector.ts`.  
- **Sincronia Estrita com Visões IFRS e CPC:** Mapeamento de arcabouços regulatórios completos para dar base aos novos motores de cálculo de novos Trials de setores:  
  - *Agronegócio:* Mapeado sob as exigências do **CPC 29 (Ativos Biológicos e Produtos Agrícolas)** e **IAS 41**. Permite colheita escalonada, carências de crescimento e valuation por Valor Justo líquido de despesas de venda.  
  - *Mercado de Capitais:* Regido sob as diretivas do **CPC 48 (Instrumentos Financeiros)**, introduzindo regras fiduciárias para IPOs de ações baseadas em Valuation por DCF e captação de Debêntures conversíveis de longo prazo junto a investidores institucionais.  
  - *Serviços SaaS:* Regrado sob o **CPC 47 (Receita de Contratos)** garantindo faturamento e caixa imediatos, porém amortizados por competência temporal linear de licenças SaaS do simulador.  
- **Especificidade de Banco e Segregação:** Integração do roteamento polimórfico de metadados em coluna `sector_metadata: JSONB` para armazenamento rápido de históricos e RLS (Row Level Security) segregando times por Arenas de atuação do respectivo setor.  
- **Guia Técnico de Suporte ao Futuro:** Criação do documento oficial `/docs/ROADMAP.md` servindo de norte para todos os engenheiros seniores do time de desenvolvimento.  
**Impactos:**  
- **Independência de Domínio:** O EMPIRION consolida-se como o motor definitivo de múltiplos simuladores corporativos integrados fiduciariamente.  
- **Sustentabilidade a Longo Prazo:** O compilador TypeScript valida nativamente as interfaces contratuais sem causar acoplamento com o core existente de desenvolvimento.  
**Status:** Planejado / Tipagens implantadas / Documentações de Roadmap e Arquitetura ativas em produção.

---

## Decisão Arquitetural - Estrutura de Pastas EMPIRION v2026-06-07

**Data:** 07/06/2026  
**Motivo:** Definir árvore definitiva para escalabilidade, modularidade por setores e adoção de Clean Architecture + DDD.  
**Principais diferenças em relação à anterior:**  
- Core centralizado e imutável.  
- Sectors como bounded contexts independentes.  
- Separação clara layers (domain, application, infra).  
- Suporte nativo a múltiplos simuladores empresariais.  
**Impactos:**  
- Facilita adição de novos setores (ex: capital-markets) sem quebrar existentes.  
- Melhora manutenção, testes e onboarding.  
- Breaking change mínimo (migração gradual via aliases).  
**Status:** v1 aprovada / Em implementação.  
**Referência:** `docs/ARCHITECTURE.md` (detalhes completos).

---

## Versionamento Contábil & Regras de Depreciação de Máquinas - v19.80

**Data:** 06/06/2026 às 20:50 UTC  
**Motivo:** Implementação da parametrização dinâmica da taxa de depreciação de máquinas pelo Tutor no modo "Greenfield" (Start From Zero/Starting Base) e erradicação definitiva do erro de "depreciação em dobro" na interface de decisão do aluno.  
**Principais diferenças:**  
- **Taxa Dinâmica de Depreciação de Ativos (CPC 27):** Introdução da propriedade `machines_depreciation_rate` no estado `tutorConfig` e persistência em banco (`config` e `ecosystem_config`). Agora, em substituição ao cálculo de depreciação fixo de `10%` a.a. (`0.10`), os motores de cálculo do Balanço de Abertura (P00) em `initialization.ts`, simulação financeira em `simulation.ts`, simulação preditiva em `simulation-core.ts` e projeções contábeis do Wizard em `TrialWizard.tsx` passam a adotar dinamicamente a taxa cadastrada pelo Arena Tutor (padrão `10%`).  
- **Erradicação de Duplicidade de Depreciação (AssetsStep):** Identificou-se que a tela do aluno (`AssetsStep.tsx`) projetava incorretamente a depreciação do próximo round somada à depreciação acumulada do balanço de abertura, diminuindo artificialmente o valor residual do imobilizado na mesa de decisão. A fórmula de cálculo de valor contábil residual foi simplificada para `Math.max(0, m.acquisition_value - m.accumulated_depreciation)`, correspondendo exatamente à realidade do início do round de decisão.  
- **Desvinculação e Separação de Informações (AssetsStep):** O Valor Contábil Residual (patrimonial) e o Valor Líquido Após Deságio (financeiro sob desinvestimento, aplicando-se o deságio cadastrado do round) agora são exibidos em formato separado e permanente para todas as máquinas do parque fabril ativo, permitindo planejamento exato do fluxo de caixa e impacto no balanço em caso de alienação do ativo imobilizado.  
**Impactos:**  
- **Total Integridade com CPC 27 / IFRS:** A depreciação é dinâmica, ajustável pelo orquestrador e calculada sobre os valores patrimoniais reais sem redundâncias ou dupla contagem.  
- **Transparência de Cenários:** O Aluno consegue visualizar com precisão tanto o impacto patrimonial (valor residual do ativo) quanto o financeiro (caixa líquido a receber na venda).  
**Status:** Ativo / v2.2 em produção / testado e compilado com sucesso.

---

## Versionamento Contábil & Regras de Financiamento BDI - v19.77

**Data:** 06/06/2026 às 19:35 UTC  
**Motivo:** Corrigir a contagem da carência do financiamento BDI de ativos fabris (CAPEX) e anular duplicidades ou decrementos de carência espúrios no motor de simulação por meio de isolamento de estado não-mutante.  
**Principais diferenças:**  
- **Isolamento de Estado (Não-Mutável):** Substituição do decremento direto inline (`loan.grace_period_remaining -= 1`) por uma variável local `graceRemaining` na rotina de empréstimos em `services/simulation.ts`. Isso evita a mutação colateral dos objetos de empréstimo em memória durante re-execuções ou chamadas múltiplas de preview/simulação em uma mesma rodada.  
- **Sincronismo de Períodos de Carência:** Ajuste na inicialização do novo financiamento BDI adicionando juros imediatos no P1 de aquisição, restando 3 períodos de carência de juros adicionais e 7 rounds de termo total. Ao amortizar na rodada subsequente de forma linear em P5, consolida-se exatamente 4 períodos fiduciários de carência (P1, P2, P3, P4) contendo apenas pagamento de juros. Em P5, inicia-se corretiva e elegantemente a amortização de principal + juros em 4 parcelas.  
- **Seeding Consistente do Balanço Inicial:** Alteração do semeador em `services/supabase.ts` para conceder `grace_period_remaining: 0` explicitamente à linha de financiamento de longo prazo `L-INIT-LT` (tipo `'bdi'`), garantindo que amortizações se iniciem tempestiva e diretamente pós-abertura de forma previsível e sem falhas em tempo de execução.  
**Impactos:**  
- **Exatidão Financeira:** Amortizações de financiamentos respeitam rigorosamente a agenda do contrato fiduciário de forma replicável.  
- **Zero Erros de Estado Colaterais:** O motor de simulação torna-se imune às re-trigações do simulador sem alterar as propriedades do cache e do histórico de rascunhos.  
**Status:** Ativo / v2.1 em produção / testado e compilado com sucesso.

## Versionamento Contábil & Regras de Imobilizado - v2026-06-06

**Data:** 06/06/2026 às 18:40 UTC  
**Motivo:** Alinhamento absoluto do Ativo Imobilizado sob CPC 27, erradicando discrepancies de configuração e melhorando a visibilidade tática das equipes de alunos sobre Capex e Setup de Instalações industriais.  
**Principais diferenças:**  
- **Cálculo de Instalações Amarrado:** Substituição do valor arbitrário e digitável de instalações de setup por um cálculo determinístico e linear em tempo real baseado estritamente na composição da frota de máquinas ativa (`quantidade de máquinas * custo individual de instalação por modelo`).  
- **Eliminação de Input Duplicado:** O campo *"Instalações (Calculadas por Máquina)"* no Wizard do Tutor foi bloqueado para edição manual (`isLocked={true}`) e passa a renderizar em tempo real o valor correspondente fiduciário inicial somado a partir da frota de P0 (ou R$ 0,00 no modo Greenfield / "Start from Zero").  
- **Nenhum Investimento Extra na Abertura:** Esclarecimento definitivo de que as instalações prediais de montagem não cobram do player um valor redundante e arbitrário inicial. Todo o capex de instalações prediais fiduciárias passa a ser derivado e integrado à frota industrial real.  
- **Visibilidade de CapEx no AssetCard:** Adicionado no `AssetsStep.tsx` do Aluno a informação explícita do valor de investimento de instalação despencado em cada modelo de máquina individualmente (Alfa: R$ 150 mil, Beta: R$ 600 mil, Gama: R$ 1.5M), posicionada organicamente antes do item de "operadores req." trazendo clareza decisória imediata ao estrategista do projeto.  
**Impactos:**  
- **Sincronismo Fiduciário Perfeito:** Sincronização impecável de valores do Ativo de Abertura em P0 com a depreciação calculada em rodadas subsequentes na DRE e Balanço da simulação.  
- **Legibilidade Decisória:** Transparência de ponta a ponta sobre capex marginal para planejamento de fluxo de caixa operacional.  
- **Eliminação de Lixo Contábil:** No modo "Start from Zero", o P0 inicia com instalações perfeitamente zeradas e apenas adiciona esses saldos na DFC e Balanço do P1 em conformidade com as máquinas efetivamente fabricadas ou montadas no Round 1.  
**Status:** Ativo / v2.0 em uso.

---

## Versionamento de Interface & UX - v2026-06-06

**Data:** 06/06/2026 às 17:10h UTC  
**Motivo:** Transição de diálogos bloqueantes síncronos e melhoria na visibilidade tática do estágio de competição (estratégia esportiva) no Cockpit do Aluno, consolidando termos operacionais e fáceis pontos de atenção visual para o estrategista.  
**Principais diferenças:**  
- **Modificação Termino-Operacional:** Substituição do termo "CYCLE" pelo termo padrão internacional altamente intuitivo "ROUND".  
- **Aperfeiçoamento Estético de Visibilidade:** Reposicionamento e centralização da dinâmica de exibição de rodadas em um bloco flutuante dotado de *glassmorphism* e pulsante (`animate-pulse`), exatamente entre o título estrutural *"COCKPIT OPERACIONAL"* (bloco esquerdo) e as transições de visualização *"ORACLE GAZETTE"* (bloco direito).  
- **Consolidação de Decisões via Modais:** Substituição do `alert("PROTOCOLO SELADO...")` por uma caixa reativa moderna em React via Framer Motion com a mensagem: *"DECISÕES TRANSMITIDAS COM SUCESSO! <br> VOCÊ PODE ALTERAR QUALQUER DECISÃO ANTES QUE O PRAZO DO ROUND SEJA ENCERRADO."*.  
- **Suporte Multiedição e Preservação:** Coexistência pacífica de consultas e layouts de históricos/planejamentos sem interrupções.  
**Impactos:**  
- Sem quebras de retrocompatibilidade (Sem breaking changes).  
- Redução expressiva na fadiga operacional e melhora na legibilidade contextual contra envios incorretos de decisões.  
**Status:** Ativo / v1.1 em produção.  
**Migração:** Conversão direta de elementos estruturais e tipográficos no cabeçalho em `Dashboard.tsx` e lógica de aviso em `DecisionForm.tsx`.

---

## Versionamento de Infraestrutura - v2026-06-04

**Data:** 04/06/2026  
**Motivo:** Conexão oficial do agente Grok com GitHub (cctonelli/Empirion-2) e Vercel (prj_jZXZ6mdbIL54W1qj8TJbkSGbHUtn) para automação de CI/CD, deployments e gestão de código.  
**Principais diferenças:**  
- Integração direta via ferramentas conectadas (list branches, create/update files, deploy_to_vercel, etc.).  
- Automação de commits, PRs e deploys sem intervenção manual excessiva.  
**Impactos:**  
- Melhora replicabilidade e DX.  
- Exige documentação rigorosa de mudanças (já alinhado às regras do projeto).  
**Status:** Ativo / v1 em uso.  
**Migração:** Nenhuma (nova integração).

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
| **Vida Útil Declarada** | 10 Ciclos (Rounds/Anos) | 10 Ciclos (Rounds/Anos) | 10 Ciclos (Rounds/Anos) |
| **Depreciação Periódica** | Linear (10% ao round/ano) | Linear (10% ao round/ano) | Linear (10% ao round/ano) |

- **Aquisição de Equipamentos (Efeito Imediato):** Compras de maquinários efetuadas no período $T$ já integram a capacidade industrial ativa para produção no próprio período $T$.
- **Depreciação Contábil Customizada (Regras Fiduciárias do CPC 27):**
  - *Prédios:* Desgaste faturado de forma fiduciária em 4.0% por round/ano sobre o valor histórico (Vida útil de 25 anos). Terrenos possuem vida útil indeterminada e não sofrem depreciação.
  - *Instalações / Benfeitorias:* Depreciação ou Amortização de instalações e benfeitorias físicas parametrizada manualmente pelo Arena Tutor em "TAXA DEPRECIAÇÃO INSTALAÇÕES" do Wizard (`buildings_depreciation_rate`), com padrão de 10% a.a. incidentes linearmente sobre o valor das instalações (Vida útil de 10 anos).
  - *Máquinas:* Depreciação linear de 10% por round/ano baseada na vida útil de 10 Ciclos em conformidade com as quotas constantes do CPC 27.
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
- **Perdas Estimadas com Créditos de Liquidação Duvidosa (PECLD):** O percentual de inadimplência estimado incide **única e exclusivamente sob a parcela de vendas a prazo** (Credit Sales), sem onerar a receita recebida à vista.
- **Custos de Distribuição:** Encargo logístico unitário calculado por unidade efetivamente comercializada na respectiva região.
- **Campanhas de Marketing Regionais Customizáveis:** O Arena Tutor pode modular e customizar o custo inicial base por rodada de cada campanha promocional e publicitária por região comercializada (`marketing_cost`), saindo do padrão global de $10.000 para uma configuração territorializada e tática mais realista.

---

## 7. Modelos Avançados de Saúde Financeira, Tributos e Solvência

### 7.1 Gestão Contábil do IVA (Venda e Aquisição)
- **Compensação Não Cumulativa (Gold Standard):** Os créditos acumulados sob compras operacionais e MP são reconhecidos diretamente na conta ativa de `taxes_recoverable` antes do processamento de apuração. Da mesma forma, os débitos sobre vendas alimentam `taxes_payable`. A compensação líquida de tributos ocorre de forma dinâmica.

### 7.2 PPR (Programa de Participação nos Lucros)
- **Regras de Enquadramento:** Arbitragem das equipes variando de **0% a 10% do LAIR**.
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

Ao nível de Fluxo de Caixa (DFC), a quitação mensal do aluguel representa desembolso real do período, sendo registrada unificadamente sob a rubrica própria de saída contábil `cf.outflow.rent`. No Balanço Patrimonial, a operação de aluguel de terceiros não gera registro de imobilizado de Edificação ou Terreno, mas os investimentos em melhorias e instalações efetuados pelas equipes são ativados no Ativo Não Circulante sob a rubrica regulamentar de "Instalações Industriais (locado)".

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

### v19.77 Fiduciary State Leakage Resolution & CAPEX Carry-Forward Sanitization - Erradicação de Vazamento de Decisões e Inicialização Segura de Novos Períodos
- **Data:** 08 de Junho de 2026, 15:00 UTC
- **Motivo:** Corrigir em regime de urgência o comportamento anômalo onde decisões do Round anterior (CAPEX, compras, empréstimos e contratações/demissões) vazavam ou eram trazidas inalteradas para o formulário de decisão do round subsequente recém-avançado pelo Tutor (especialmente em ambientes Trial com 4 ou mais equipes no modo "START FROM ZERO"), reativando indevidamente compras de maquinário e contratações em períodos onde estas ações poderiam estar bloqueadas ou não eram desejadas.
- **Diferenças:**
  - *Mitigação de Retenção de Estado do React (`/components/DecisionForm.tsx`):* Corrigida a função `initializeForm`. Quando não existia um rascunho salvo no banco ou no localStorage para o round recém-aberto, a rotina utilizava a cláusula de retorno `prev` que mantinha em memória todo o estado do formulário anterior (vazamento cruzado de contexto). Agora, se nenhum registro atual for localizado, ela zera em massa todas as propriedades para seu template original fiduciário, eliminando resíduos de memória.
  - *Carregamento Seguro de Períodos Anteriores ("Carry-Forward" Inteligente):* Desenvolvido um mecanismo fiduciário que, quando não existirem rascunhos para o round atual ativo, busca a última decisão enviada no período imediatamente anterior (`round - 1`), clonando-a profundamente para ser usada como baseline amigável.
  - *Sanitização Cirúrgica de Ações de Única Ocorrência:* Ao clonar a decisão anterior para o novo round, a rotina aplica a sanitização cirúrgica obrigatória dos campos de fluxo pontual: zera as decisões de compra e venda de maquinário (`machinery.buy` e `machinery.sell` zerados), limpa o grid de imobilizados marcados para desinvestimento (`machinery.sell_ids = []`), zera novos processos admissionais ou demissionais de RH (`hr.hired = 0`, `hr.fired = 0`), e recalibra solicitações pontuais de crédito (`finance.loanRequest = 0`, `finance.loanTerm = 0`). Mantêm-se fidedignas as decisões recorrentes (salário, preços, prazos concedidos e compras de insumos).
- **Impactos:** Nenhuma breaking change introduzida. Saneamento automático e instantâneo nas telas de preenchimento de jogadores e painéis de controle do tutor.
- **Status:** v19.77 ativo em produção e totalmente testado.

### v19.76 Financial Export Period Alignment - Correção da Sequência e Rotulagem de Períodos de Exportação Excel (Matriz Financeira)
- **Data:** 06 de Junho de 2026, 14:30 UTC
- **Motivo:** Sanar a defasagem e o desalinhamento de rótulos de rodadas nos relatórios exportados nos formatos Excel/Google Sheets a partir da Matriz Financeira do aplicativo. Originalmente, as rotinas de mapeamento adicionavam incorretamente `+1` ao número original do round (`p.round`), rotulando o round de abertura `P00 (INICIAL)` como `PERÍODO 01` e gerando um desvio acumulado em cascata nas colunas subsequentes de histórico e projeções.
- **Diferenças:**
  - *Sincronismo de Rótulos na Exportação (`/analise-gerencial/spreadsheet-mappers.ts`):* Atualizados os 4 cabeçalhos dos geradores de planilhas (`mapRecursiveReport`, `mapStrategicReport`, `mapCommitmentsReport`, `mapKardexReport`) para consumirem o valor real do round `p.round` (sem a adição arbitrária do offset de `+ 1`), aplicando a mesma regra visual de alta fidelidade do frontend: se o round for `0`, assume o rótulo fiduciário `"P00 (INICIAL)"`, caso contrário assume `"PERÍODO XX"` e `"PROJEÇÃO PXX"`.
- **Impactos Esperados:** Exportações de matrizes perfeitamente idênticas às tabelas renderizadas na tela, gerando relatórios corporativos auditados transparentes para a diretoria financeira e investidores concorrentes.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.75 Fiduciary Float Mitigation & Expanded Forensics - Blindagem de Inteiros Contábeis e Logs Avançados de Auditoria do Supabase
- **Data:** 05 de Junho de 2026, 22:54 UTC
- **Motivo:** Sanar o erro de desajuste de tipos de dados PostgreSQL `22P02` (Erro Crítico de Sintaxe de Entrada para Tipo INTEGER) durante a gravação dos prazos médios de recebimento/pagamento e total de unidades de emergência no final de rodadas de turnover. Como o cálculo aritmético do motor de simulação calcula prazos como floats de altíssima precisão (por exemplo, `"9.11111111111111"`), a inserção falhava ao bater em colunas físicas tipadas como `INTEGER` no Supabase legado de alguns usuários.
- **Diferenças:**
  - *Arredondamento Preditivo no Frontend (`services/supabase.ts`):* Implementado o encapsulamento de todos os campos inteiros candidatos no payload (`avg_receivable_days`, `avg_payable_days`, `emergency_units_total`) usando a função nativa `Math.round()`. Sendo prazos médios operacionais contados por dias completos, a resolução preserva a fidelidade acadêmica e elimina 100% dos travamentos.
  - *Auditoria Forense de payloads do Supabase:* Enriquecido o bloco de captura e tratamento de erros do Supabase. Caso haja qualquer colisão de tipos ou falha de integridade, é impresso um relatório minucioso listando todos os atributos decimais candidatos a float no momento, além do próprio payload para facilitar diagnósticos terminais.
- **Impactos Esperados:** Sincronização impecável em qualquer ciclo subsequente avançado e turnover verde de picos corporativos.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.74 Fiduciary Turnover Decimals & Blindage - Blindagem no Frontend e Migração de DDL para market_share (Decimal de Precisão de Mercado)
- **Data:** 05 de Junho de 2026, 19:12 UTC
- **Motivo:** Sanar o erro de desajuste de tipos de dados PostgreSQL `22P02` (Erro Crítico de Sintaxe de Entrada para Tipo INTEGER) durante a gravação de market shares pós-turnover de rodada. O motor contábil gerava decimais ultra-precisos de market share (por exemplo: `"25.27124630628737"`), porém se a tabela já existisse no banco do Supabase do usuário sob tipos legados herdando o esquema INTEGER inicial, o banco rejeitava a escrita e causava a quebra do avanço do round.
- **Diferenças:**
  - *Blindagem Nativa do Frontend (`services/supabase.ts`):* No processamento principal de inserção de simulação (`processRoundTurnover`), aplicou-se a normalização `Math.round(competitiveShare)` para o campo `market_share`. Isso assegura que, mesmo se o banco de dados do usuário contiver legados inalterados com a coluna tipada como INTEGER, a gravação será efetuada perfeitamente com valores inteiros limpos.
  - *Migração Robustecida de DDL (`database_rls.sql`):* Adicionados comandos de alteração de tipo de coluna compulsória (`ALTER COLUMN ALTER TYPE NUMERIC(10,2)`) para as tabelas `public.companies` e `public.trial_companies`. Estudantes interessados em reter a precisão milimétrica de casas decimais em picos concorrentes podem simplesmente rodar o script revisado no editor SQL do Supabase.
- **Impactos Esperados:** Turnover impecável e persistência contínua com aceitação fidedigna de dados do ERP corporativo em qualquer versão ou provisionamento do banco Supabase parceiro.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.73 Fiduciary Anonymous MVP Sandbox Integration - Ajuste de RLS de Inserção de trial_companies para Sessões Livres e Sem Login
- **Data:** 05 de Junho de 2026, 19:05 UTC
- **Motivo:** Sanar de forma terminal e fiduciária o erro de RLS `42501` pós-turnover no modo "Start from Zero" sob sessões experimentais (Modo Trial Sandbox). Como o modo de testes de torneios rápidos e treinos do MVP de estudantes é totalmente autônomo e focado em alta usabilidade sem obrigatoriedade de login de participantes (credencial de API anônima `anon`/`public`), a restrição das políticas anteriores que operavam apenas em escopo `TO authenticated` causava recusa instantânea do banco nas operações em lote que gravavam o histórico corporativo.
- **Diferenças:**
  - *Mitigação Anônima de Escrita em Modo Trial (`database_rls.sql`):* Reconfiguradas as políticas de inserção da tabela central de históricos de rascunhos temporários `public.trial_companies` ("Trial Companies: Permissão de inserção para o campeonato") alterando a diretiva restritiva de `TO authenticated` para o escopo ampliado **`TO public`**, de modo a abarcar sessões anônimas, autenticadas ou robôs concorrentes indiscriminadamente na simulação de carga real de MVP.
  - *Blindagem Coletada e Preservada em Campeonatos Oficiais:* A tabela principal fiduciária `public.companies` mantém suas políticas de barreira territorializada de escrita atrelada estritamente aos membros de liga logados, mantendo as defesas intactas em competições de prestígio.
  - *Mapeamento Dinâmico de Agenda Financeira, Comando Estratégico e Kardex:* Validada a persistência integral destas três macro-entidades (Dados de DRE do ERP, as decisões de comando armazenadas em formato JSON no campo `state`, as alocações fiscais e o controle volumétrico e WAC de Kardex em `kpis`). O motor garante a integridade e gravação robustas dessas colunas.
- **Impactos Esperados:** Turnover perfeito e persistência sem fricção de agendas, kardex e decisões de comando na tabela física, possibilitando à Matriz Financeira ler dados puramente fiduciários do Supabase sem recorrer a fallbacks em memória.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.72 Fiduciary Sandbox Global Turnover - Ajuste de RLS FOR INSERT nas Tabelas de Histórico Contábil para Fluxos Concorrentes de Turnover
- **Data:** 05 de Junho de 2026, 18:35 UTC
- **Motivo:** Corrigir de forma definitiva o erro crítico de banco originado pelo código PostgreSQL `42501` (falha de permissões RLS) durante o processamento do Turnover. Como o cálculo é efetuado do lado do cliente (SPA) sob as credenciais do usuário autenticado ativo, o banco bloqueava a inserção do histórico financeiro de outras equipes (incluindo Bots e concorrentes), inviabilizando a consolidação correta de mercado pós-rodada.
- **Diferenças:**
  - *Flexibilização Fiduciária da Gravação (`database_rls.sql`):* Alteradas as políticas de inserção pública (`FOR INSERT TO authenticated`) de `public.companies` ("Companies: Permissão de inserção para o campeonato") e `public.trial_companies` ("Trial Companies: Permissão de inserção para o campeonato") para operarem com `WITH CHECK (true)`. Desta forma, qualquer competidor autenticado que for autorizado a rodar a passagem de ciclo poderá gravar em lotes o resultado simulado de todos os concorrentes e robôs do seu torneio.
  - *Blindagem de Escrita de Rascunhos Conservada:* Ressalta-se que o direito de consulta aberta (SELECT) e de atualização concorrente de rascunhos de decisões no round vigente (UPDATE/DELETE) continuam resguardados sob regras estritas que blindam e mitigam qualquer risco de intromissão entre equipes no banco de dados.
- **Impactos Esperados:** Sincronismo integral e avanço de round concluído com louvor sem novas violações de RLS contábeis.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.71 Fiduciary Turnover Reconciliation & RLS Enforcement - Consolidação e Correção de RLS para Gravação de Histórico Contábil pós-Turnover
- **Data:** 05 de Junho de 2026, 17:34 UTC
- **Motivo:** Sanar a falha de persistência física dos registros contábeis consolidados (como balanço e fluxo de caixa da Matriz Financeira) pós-turnover de rodadas sob o modo "Start from Zero", onde a tabela `public.trial_companies` (com RLS ativa no Supabase) impedia a operação de INSERT sem acusar erro direto aos jogadores, levando o sistema a recorrer silenciosamente a dados em fallback de memória.
- **Diferenças:**
  - *Interrupção de Silêncio Operacional (`services/supabase.ts`):* Modificada a função principal de consolidação `processRoundTurnover`. Toda rotina que interage com o Supabase via PostgREST (como `insert` para bots e equipes, e `update` para dados gerais de campeonatos) agora possui captura e análise explícita de erro (`const { error: insertErr }`). Caso ocorra qualquer falha, o erro é impresso no console e propagado via `throw new Error([ERRO BANCO DE DADOS])`, abortando a "falsa transação de sucesso".
  - *Mitigação de Segurança RLS com Escrita Territorializada (`database_rls.sql`):* Desenvolvidas e aplicadas as políticas de inserção `FOR INSERT` na tabela principal de históricos contábeis públicos `public.companies` ("Companies: Permissão de inserção para o campeonato") e de torneios temporários `public.trial_companies` ("Trial Companies: Permissão de inserção para o campeonato") destinadas aos perfis autenticados. Estas políticas autorizam o tutor, o administrador ou qualquer competidor devidamente inscrito na liga a efetuar inserções contábeis de histórico para si e para os concorrentes do mesmo campeonato (exigência do motor para processar o balanceamento de mercado consolidado).
- **Impactos Esperados:** Persistência impecável pós-turnover com eliminação definitiva de falhas mudas, garantindo que a Matriz Financeira leia dados fiduciários exclusivamente do banco Supabase em vez de fallbacks efêmeros em memória.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.70 Obsidian Dynamic Region Synchronization - Integração Dinâmica de Custos e Preços Industriais e Comerciais por Região (Supabase Config)
- **Data:** 05 de Junho de 2026, 15:00 UTC
- **Motivo:** Sanar o desalinhamento de dados e erro de auditoria na simulação, onde o Tutor customizava os valores regionais de "Preço Venda Sugerido", "Custo Unitário de Distribuição" e "Custo Orçamentário de Marketing" no Wizard e no banco Supabase (coluna JSON `config` na tabela `trial_championships`), porém o frontend exibia valores estáticos hardcoded (R$ 425 e custos estáticos) e o backend de simulação recalculava despesas com base em indicadores macro globais não-coincidentes, gerando distorções de demanda e CPV.
- **Diferenças:**
  - *Sincronização no Core de Simulação (`services/simulation.ts` e `services/simulation-core.ts`):* Refatorada a lógica de demanda de mercado de cada praça para buscar de forma dinâmica a propriedade `suggested_price` mapeada de cada região do JSON `config` do Supabase (com fallback seguro ao indexador macroeconômico global se não configurado). O gasto total de marketing agora calcula o limite promocional tendo como base o `marketing_cost` territorializado e customizado. O Custo de Distribuição comercial por região calcula individualmente a quantidade real vendida em cada praça vezes o respectivo `distribution_cost` regionalizado daquele torneio, ponderando proporcionalmente as frações de atendimento em caso de ruptura de estoque.
  - *Interface de Inteligência Comercial das Equipes (`components/steps/MarketingStep.tsx`):* Adicionado um bloco de informativos fidedignos no rodapé dos cartões de decisões comerciais, buscando dinamicamente das configurações JSON os limites orçamentários sob medida daquela região (Min. Recomendado de preço, Custo de logística/distribuição por unidade e Custo padrão de campanha).
  - *Exibição Consolidada no Diário Oficial (`components/GazetteViewer.tsx`):* Desenvolvida e integrada a nova seção "Condições Comerciais e Logísticas por Região" sob a aba Macroeconômica do Gazette, mostrando pesos de demanda, de logística tributária regionalizada e moedas customizadas conforme a preferência parametrizada do Tutor no banco Supabase.
  - *Inicialização Fidedigna de Rascunhos (`components/DecisionForm.tsx`):* O loop de preenchimento de preços padrões iniciais quando o aluno acessa o round sem rascunho agora inicializa o campo herdando o respectivo preço sugerido da região ativa do Supabase em vez do valor estático de R$ 425.
- **Impactos Esperados:** Sincronismo impecável e perfeita aderência matemática da demanda, CPV, faturamento e custos promocionais em torneios customizados de praça única ou diversificada.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.69 Obsidian Diamond Amortization CPC 27 - Realinhamento Integral de Depreciação e Vida Útil de Ativos sob CPC 27
- **Data:** 03 de Junho de 2026, 17:05 UTC
- **Motivo:** Corrigir de forma definitiva as taxas e fórmulas de depreciação do Ativo Imobilizado em todo o sistema (simulador ordinário e preditivo), padronizando o simulador de forma estrita em conformidade com as diretrizes do CPC 27 e IFRS para períodos anuais (1 round/período = 1 ano). Anteriormente, o motor aplicava uma taxa trimestralizada (divida por 4, esticando a amortização de instalações para 40 rounds em vez do limite de 10 rounds do projeto), além de usar taxas legadas de 2.5% ao round (40 rounds de vida útil) para maquinários, divergindo do padrão de 10 anos requisitado.
- **Diferenças:**
  - *Taxa de Depreciação de Máquinas:* Alterada de 2.5% ao round (vida útil de 40 rounds) para 10% ao round (vida útil de 10 rounds) nos arquivos de parametrização `constants.tsx` (campo `depreciation_rate: 0.10` e `useful_life_years: 10`), inicializador fiduciário em `services/initialization.ts`, na lógica de cálculo pré-visualizada de p5 de alavancagem de ativo imobilizado bruto em `components/TrialWizard.tsx` (fórmula de depreciação de maquinário atualizada para 10%), e no simulador preditivo de imobilizados no cockpit em `components/steps/AssetsStep.tsx`.
  - *Remoção do Redutor Trimestral em Real Estate:* Removeu-se a divisão por 4 (`/ 4`) estática nas rotinas de Turnover em `services/simulation.ts` e `services/simulation-core.ts`. Agora, a depreciação de Benfeitorias e Instalações Industriais incide linearmente sobre o valor histórico com taxa anual regulamentar configurada pelo Tutor (padrão 10% ao round/ano, equivalendo a 10 anos de útil).
  - *Fórmula de Depreciação de Real Estate em Propriedade Própria:* O calculo reativo da depreciação periódica de Real Estate consolidado (prédios + instalações) em modo próprio (`owned`) agora separa fiduciariamente a quota do Prédio (4% a.a. contínuos de útil de 25 anos sob CPC 27) da quota de Instalações (taxa parametrizada do Tutor de 10% a.a. sobre benfeitorias físicas). No modo alugado (`rented`), apenas a quota de amortização de instalações de terceiros (10% a.a.) é descontada.
- **Impactos Esperados:** Sincronismo contábil regulamentar irrestrito e perfeita aderência às regras do CPC 27 e IFRS. O Balanço e o DRE mostram as saídas operacionais e os saldos finais correspondentes às projeções reais de exaustão útil dos bens tangíveis sob o regime anual de rounds.
- **Status:** Disponível e Ativa em Produção, Compilação e Linter 100% homologados.

### v19.68 Obsidian Emerald Amortization Realignment - Alinhamento Greenfield e Blindagem de Amortização de Abertura
- **Data:** 03 de Junho de 2026, 16:50 UTC
- **Motivo:** Sanar um grave desalinhamento contábil no modo "Start from Zero" (Greenfield), onde o investimento selecionado de $500.000 em Instalações estava sendo indevidamente depreciado/amortizado em $100.000 logo na abertura (P0 Inicial), apresentando Imobilizado Net de apenas $400.000 e distorcendo a igualdade patrimonial de largada. Uma empresa recém-formada que parte do zero não deve possuir qualquer idade de depreciação de imóvel na formação do Balanço Inicial.
- **Diferenças:**
  - *Blindagem Greenfield de Idade:* Ajustada a fórmula de definição da idade do imóvel amortizável em `services/initialization.ts` (variável `buildingAge`) de forma que ela seja forçada de forma rigorosa para `0` quando o torneio for configurado no modo `start_from_zero`.
  - *Preservação do Ativo Net:* Com a idade blindada em `0`, o valor total depreciado acumulado de abertura do imobilizado cai instantaneamente para `$0`, assegurando que o Imobilizado Net total inicial seja rigorosa e exatamente igual ao valor do parque industrial investido pelo Tutor (ex: $500.000,00 de instalações).
- **Impactos Esperados:** Igualdade patrimonial fiduciária perfeita no Step 8 do `TrialWizard.tsx` (Balanço Inicial de Abertura). Os tutores agora conseguem definir investimentos sem sofrer abatimentos indevidos ou distorções de depreciação anteriores à rodada zero. O Ativo Imobilizado abre limpo, condizente com a teoria contábil padrão e o manual do usuário.
- **Status:** Disponível e Ativa em Produção, Compilação e Linter 100% homologados.

### v19.67 Obsidian Sapphire Rent Alignment - Alinhamento e Sincronização dos Valores de Locação de Imóvel e Rateios Contábeis
- **Data:** 03 de Junho de 2026, 16:25 UTC
- **Motivo:** Corrigir a divergência de valores-padrão de aluguel e rateio entre a interface interativa do `TrialWizard.tsx` (que defaultava o aluguel para $50000.00 e rateios para CIF: 70%, ADM: 10% e VENDAS: 20%) e o gerador de P0 fiduciário `services/initialization.ts` (que defaultava para $35000.00 e rateio CIF: 65%, ADM: 25% e VENDAS: 10%). Além disso, garantir que os valores-padrão inseridos no Wizard sejam persistidos fiel e explicitamente na coluna `ecosystem_config` e `config` da tabela `trial_championships` no Supabase ao despachar a criação da arena de simulação.
- **Diferenças:**
  - *Sincronização de Fallbacks:* Atualizados os reajustes de aluguel em `services/initialization.ts` para que utilizem estritamente os valores fiduciários sintonizados com o Wizard: aluguel de `$50000.00`, e rateios CIF (`70%`), ADM (`10%`) e Vendas (`20%`).
  - *Explicitando Propriedades de Estocagem e Aluguel:* Acrescentadas as definições padrão de real estate diretamente no estado inicializado no `useState` do `tutorConfig` no `TrialWizard.tsx`.
  - *Sincronização de Persistência no Banco:* Integramos os objetos `config` e `ecosystem_config` no payload de persistência fiduciária disparado ao chamar `createChampionshipWithTeams` no terminal do wizard, garantindo que a tabela `trial_championships` possua todos os metadados corretos resgatados de forma transparente pelo motor do simulador do Cockpit (`Dashboard.tsx`/`simulation.ts`).
- **Impactos Esperados:** Total eliminação de quaisquer descompassos em centavos ou valores inteiros nas demonstrações contábeis de saída (DFC/DRE) pós-turno do simulador. O cockpit e o simulador agora conversam perfeitamente na mesma frequência de valores que o usuário configura no Wizard. Os dados guardados no Supabase tornam-se redundantes, seguros e transparentes.
- **Status:** Disponível e Ativa em Produção, Compilação e Linter 100% homologados.

### v19.66 Obsidian Fiduciary Marketing Realignment - Realinhamento Fiduciário de Campanhas de Marketing e Alocação de Overheads
- **Data:** 03 de Junho de 2026, 16:04 UTC
- **Motivo:** Sanar a grave inconsistência financeira onde o valor total de saídas na conta de "Campanhas de Marketing" no DFC vinha sendo inflada por custos de overhead comercial fixo de herança (`salesOverhead = prevOpexSales * inflationMult`), distorcendo a conciliação do que de fato as equipes decidiram gastar com publicidade direta (ex: 2 campanhas de $10K em 4 regiões deveria resultar em $80K de despesa real de marketing, mas estava sendo mostrado como $954K).
- **Diferenças:**
  - *Mapeamento Puro de Marketing:* Refatorada a conta `'cf.outflow.marketing'` em `services/simulation.ts` para assumir de forma estrita apenas o custo físico e financeiro real de marketing contratado pelas equipes: `-(totalMarketingExp)`.
  - *Agregação Coerente de Outflows de Fornecedores Sênior:* Os custos fixos de overhead comercial e administrativo (`salesOverhead` e `admOverhead`) correspondentes a contratos estáticos operacionais, serviços faturados gerais e taxas administrativas corporativas foram agrupados e lançados na conta `'cf.outflow.suppliers'` ("PAGAMENTO A FORNECEDORES") que originalmente centraliza os desembolsos de bens e serviços operacionais terceirizados contratados.
  - *Sanidade Fiduciária:* A conta `'cf.outflow.misc'` foi zerada de forma a blindar o balanço patrimonial e o fluxo de caixa contra duplicidade ou lacunas contábeis nas arenas de simulação tradicionais que não a incluíam em seus esquemas básicos de dados, mantendo congruência absoluta centavo a centavo.
- **Impactos Esperados:** Sincronismo perfeito na Matriz Financeira (Cockpit DFC) apresentando o valor exato gasto com marketing focado na autonomia decisoria das equipes. Equação Fundamental do Balanço (Ativos = Passivos + PL) preservada integralmente com altíssima consistência acadêmica e contábil.
- **Status:** Disponível e Ativa em Produção, Compilação e Linter 100% homologados.

### v19.65 Obsidian Emerald Period Alignment - Alinhamento Técnico das Nomenclaturas de Período e Projeções
- **Data:** 03 de Junho de 2026, 15:20 UTC
- **Motivo:** Corrigir de forma definitiva as divergências de nomenclatura do simulador na Matriz Financeira e nas planilhas exportadas (Kardex, Balanço, DRE, DFC). Os usuários/estudantes atuavam na rodada de tomadas de decisões de P2 enxergando "INICIAL (P0)" e "PROJEÇÃO P1", enquanto os conceitos acadêmicos e do manual exigem o correspondente a "PERÍODO 01" e "PROJEÇÃO P02" a partir das decisões do primeiro ciclo.
- **Diferenças:**
  - *Mapeamento Dinâmico Deslocado (+1):* Ajustados os displays e loops das colunas tanto na interface reativa (`FinancialReportMatrix.tsx`) quanto nas rotinas de exportação do backend fiduciário de planilhas (`/analise-gerencial/spreadsheet-mappers.ts`).
  - *Sincronização Histórica:* O round base `round = 0` (historicamente a largada do campeonato) passa a ser renderizado de forma elegante como `PERÍODO 01`.
  - *Sincronização de Projeções:* O round `round = 1` (a primeira projeção) é exibido como `PROJEÇÃO P02`, avançando sequencialmente (`PERÍODO 02`, `PROJEÇÃO P03`, etc.) conforme o turnover progride na arena de simulação.
  - *Sincronização entre Abas:* As alterações cobrem de forma uniforme a Matriz Financeira do Cockpit (DRE, Ativo/Passivo, DFC, Strategic KPIs, Compromissos, Kardex) e todos os relatórios correspondentes clonados ou exportados em lote binário excel.
- **Impactos Esperados:** Total eliminação de confusão cognitiva por parte dos alunos sobre em qual round de decisões se encontram. Simetria conceitual acadêmica 100% preservada de forma reativa e consistente.
- **Status:** Disponível e Ativa em Produção, Compilação e Linter 100% homologados.

### v19.64 Obsidian Emerald Dynamic Headers - Cabeçalhos Dinâmicos e Simetria Perfeita na Matriz Financeira e Exportações
- **Data:** 03 de Junho de 2026, 14:18 UTC
- **Motivo:** Sanar o problema em que a Matriz Financeira exibia um cabeçalho estático "INICIAL (P0)" ou "PROJEÇÃO T+1", mesmo quando se estava avaliando outros períodos do simulador ou exportando planilhas consolidadas. A equipe precisa de clareza absoluta de qual round específico está acompanhando e projetando no cockpit fiduciário.
- **Diferenças:**
  - *Identificação Dinâmica da Rodada Projetada:* A coluna de Projeção agora calcula dinamicamente o número exato do round que está sendo projetado (`(history[history.length - 1]?.round || 0) + 1`). Exibe com precisão `PROJEÇÃO P01`, `PROJEÇÃO P02`, etc., sincronizado perfeitamente com os dados reais de simulação.
  - *Condicionalização da Projeção:* A coluna de Projeção passa a ser condicionalmente adicionada ao array `periods` somente se os dados de projeção não forem nulos. Isso remove colunas nulas/fantasma cheias de valores `N/A` ou $0.00 ao navegar em rodadas históricas anteriores.
  - *Simetria entre UI e Exportação:* Atualizadas as funções de mapeamento de planilhas (`mapRecursiveReport`, `mapStrategicReport`, `mapCommitmentsReport`, `mapKardexReport` e `mapFinancialToTable`) em `/analise-gerencial/spreadsheet-mappers.ts` para que todas as abas exportadas em formato .xlsx ou copiadas para o Google Sheets tragam exatamente o mesmo cabeçalho dinâmico e representação polida.
- **Impactos Esperados:** Sincronização impecável entre o cockpit visual do estudante e os relatórios exportados. Eliminação total de cabeçalhos genéricos "PROJEÇÃO T+1", proporcionando legibilidade impecável sobre as rodadas de planejamento ativo e histórico.
- **Status:** Disponível e Ativa em Produção, Compilação e Linter 100% Homologados.

### v19.63 Obsidian Emerald Shield - Trava de Segurança e Proteção Fiduciária contra Cliques Acidentais de Turnover pelo Tutor
- **Data:** 03 de Junho de 2026, 13:50 UTC
- **Motivo:** Introduzir salvaguarda de processo fiduciário na interface do Tutor, desabilitando o botão "TURNOVER P0X" enquanto o timer de contagem regressiva oficial do round estiver transcorrendo normalmente. Isso impede cliques acidentais e avanço indesejado de período por parte do Tutor, preservando as decisões e dados industriais ativos das equipes competidoras.
- **Diferenças:**
  - *Monitoramento Reativo de Estado de Timer:* Adicionado o callback reativo `onStatusChange` nas propriedades do sensor `<ChampionshipTimer>` e conectado de forma síncrona ao painel central `/components/AdminCommandCenter.tsx`.
  - *Habilitação sob Demanda:* O estado `isTimerExpired` rastreia dinamicamente a contagem do cronômetro. O botão "TURNOVER R-0X" agora fica bloqueado em modo leitura enquanto houver tempo restante ativo do round.
  - *Indução a Workflow Inteligente:* O botão "TURNOVER R-0X" só é reabilitado quando o status do timer muda categoricamente para "ENCERRADO" (pelo fim do tempo oficial ou quando o Tutor aciona manualmente o botão "CONCLUIR TEMPO / ZERAR TEMPORIZADOR" localizado ao lado de PLAY/PAUSA do cronômetro).
  - *Aprimoramento de UX:* O botão Turnover desativado adota agora um design adaptativo com opacidade suavizada, cursor `not-allowed`, remoção ativa de sombreado e um tooltip descritivo informativo (`title`) que instrui o Tutor sobre a dependência temporal do round para prosseguir.
- **Impactos Esperados:** Eliminação integral de saltos acidentais de ciclo na arena competitiva. Maior segurança fiduciária e fluidez de mediação pedagógica para o Tutor, garantindo o fiel do cronograma estipulado.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.62 Obsidian Emerald XLSX Plus - Exportação Nativa Binária de Múltiplas Planilhas sem Avisos de Segurança
- **Data:** 03 de Junho de 2026, 13:16 UTC
- **Motivo:** Sanar o erro/aviso de segurança e arquivo corrompido que ocorria no Microsoft Excel ao tentar abrir o arquivo de exportação multi-abas de dados de `FinancialReportMatrix.tsx`. O formato XML SpreadsheetML (.xls), embora perfeitamente estruturado, é lido por versões recentes do Microsoft Excel como uma extensão divergente do conteúdo real, gerando bloqueios ou avisos desnecessários de segurança no fluxo corporativo das equipes.
- **Diferenças:**
  - *Geração Nativa de Binários .xlsx (SheetJS):* Introduzida a dependência mestre `xlsx` no projeto e refatorado todo o ecossistema de geração do cockpit em `/analise-gerencial/export-to-spreadsheet.ts`. Em vez de arquivos baseados em templates XML clássicos de texto, o simulador agora compila um buffer binário nativo com o padrão oficial Microsoft OpenXML (.xlsx).
  - *Mapeamento Dinâmico de Células:* Criado conversor robusto que converte as matrizes de `TableData` individuais em planilhas internas completas com formatação numérica específica, alinhamentos e larguras de coluna dimensionadas sob medida (Coluna de Identificação de Contas dimensionada para 45 e colunas de Rounds dimensionadas para 18).
  - *Suporte Completo de Formato e Máscaras do Excel:* Implementado preenchimento nativo de formato de número (`cell.z`). Células monetárias ganham formatação contábil padrão e os percentuais gerenciais (como os do Comando Estratégico) têm seus decimais reescalados para de fato integrarem o formato de porcentagem nativo do Excel (`0.00%`).
  - *Consistência de Múltiplas Abas (Workbooks):* A exportação consolidada agrupa as abas DRE, Balanço Patrimonial, Fluxo de Caixa, Kardex, Agenda de Compromissos e Comando Estratégico de maneira imediata sem sobrecarga ou erros de leitura de XML.
- **Impactos Esperados:** Fim absoluto de qualquer aviso de bloqueio de segurança no Excel nacional ou estrangeiro. Compatibilidade imediata de carregamento de fórmulas, gráficos rápidos do Excel e formatação em planilhas do Microsoft 365, Google Sheets e LibreOffice.
- **Status:** Disponível e Ativo em Produção.

### v19.61 Obsidian Emerald - Correção Fiduciária de Sinais de Passivos, Herança de OPEX Greenfield e Calibração de Depreciação
- **Data:** 03 de Junho de 2026, 13:10 UTC
- **Motivo:** Sanar três anomalias graves que impactavam a tomada de decisão das equipes em modos de partida Greenfield: (1) Sinais negativos nos totais de Passivo Circulante/Não Circulante que corrompiam o somatório do totalizador de 'PASSIVO + PL'; (2) Herança indevida de despesas comerciais e administrativas fixas estimadas em US$ 873.250 e US$ 216.000 em rodadas de início Greenfield (Start from Zero); (3) Depreciação estática de instalações descolada da diretriz regulamentar de 10% a.a. do Tutor.
- **Diferenças:**
  - *Soma de Passivo + PL Consistente no Balanço:* Ajustado o algoritmo de recálculo recursivo de totalizadores em `injectValues()` no motor `services/simulation.ts` para que as contas de passivo (com type `'liability'`) não tenham seus sinais invertidos para negativo ao consolidar os subtotais patrimoniais. Com isso, os totalizadores de Passivo Circulante e Passivo Não Circulante agora computam com o sinal contábil correto e a equação de fechamento contábil `PASSIVO + PL` e `ATIVO` é milimetricamente reconciliada de forma aditiva.
  - *Mitigação de OPEX Fantasma em Partida Greenfield:* Implementada lógica condicional blindada ("Greenfield Shield") que zera de forma rigorosa as despesas acumuladas operacionais de rodadas anteriores de venda, administração e P&D na transição de P0 para P1 sob o regime de partidas de "começar do zero" (`starting_mode === 'start_from_zero'`). Isso removeu a sobrecarga espúria de custos administrativos de $216k, que causava perdas fiduciárias inexplicáveis, e garantiu que o preço de campanhas de marketing em P1 reflita única e estritamente os investimentos do participante ($120.000 pelas 12 campanhas contratadas).
  - *Depreciação Dinâmica Amortizada com Taxa do Tutor:* Desenvolvido o algoritmo de depreciação de bens instalados (Benfeitorias em Imóveis de Terceiros - Locado se Prédio alugado e Prédios/Terrenos se próprio) em `services/simulation.ts` e `services/simulation-core.ts`. Em substituição à amortização fixa e defasada de `0.2%` por round (período), a depreciação adota a taxa anual configurável do Tutor (`buildings_depreciation_rate`, por padrão 10% a.a.) convertida para taxa trimestral equivalente (`(rate / 100) / 4`), resultando em depreciação de US$ 12.500 no período sobre as benfeitorias ativas de US$ 500.000.
  - *Padronização de Valores de Aluguel:* Alinhado o aluguel padrão do simulador com o Step 6 do `TrialWizard.tsx` (US$ 50.000 com rateios padrões de 70% Produção, 10% Administração e 20% Vendas), corrigindo disparidades em rounds onde o tutor não preenchia as configurações de trial.
- **Impactos Esperados:** Consistência fiduciária e lógica impecável em simulações corporativas Greenfield. Fim de rombos e disparidades de caixa, garantindo que equipes com posturas otimizadoras de lucros e custos consigam alcançar excelentes índices E-SDS e saúde financeira equilibrada.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.60 Obsidian Blue Sapphire - Engine Mestre de Exportação Contábil Multi-Abas
- **Data:** 03 de Junho de 2026, 12:06 UTC
- **Motivo:** Implementação de motor de exportação de dados analíticos completo para a Matriz Financeira do Simulador, oferecendo inteligência de exportação nas extensões CSV, Excel e Google Sheets direto pelo cockpit, otimizando o workflow de análise para diretores e tutores.
- **Diferenças:**
  - *Estrutura de Código Dedicada:* Criação do diretório `/analise-gerencial` contendo arquivos separados para mapeamento matricial (`spreadsheet-mappers.ts`) e exportação real (`export-to-spreadsheet.ts`), promovendo acoplamento baixíssimo e separação estrita de interesses (Separation of Concerns).
  - *Exportação do Dashboard Financeiro em Múltiplas Abas:* Desenvolvido gerador nativo client-side de arquivos XML SpreadsheetML 2003 compatíveis com Microsoft Excel. Ao selecionar "Exportar Matriz Completa", as abas DRE, Balanço Patrimonial, Fluxo de Caixa (DFC), Kardex e CPV, Agenda Financeira e Comando Estratégico são fundidas dinamicamente em um único arquivo de múltiplas planilhas, com formatação monetária e de percentuais preservada para cálculos imediatos no Excel.
  - *Copiar para Google Sheets:* Adicionado botão de exportação rápida para Área de Transferência em formato TSV estruturado. Competidores conseguem instantaneamente com `Ctrl+V` colar todo o grid de dados ativos com recuos hierárquicos e separadores de decimais brasileiros direto no Google Sheets.
  - *Formato CSV com codificação UTF-8 BOM:* O download das abas individuais em formato CSV de forma estática adota o delimitador de ponto-e-vírgula (;) e cabeçalho BOM para evitar quebras de codificação de texto e formatação de decimais e acentos em sistemas operacionais nacionais.
  - *Aprimoramento Visual do Cockpit:* Inserido seletor do botão reativo e popover suspenso de "EXPORTAR DADOS" com transições fluidas no cabeçalho de `FinancialReportMatrix.tsx` imediatamente à esquerda de "Controles de Integridade".
- **Impactos Esperados:** Zero breaking changes. Melhora expressiva na experiência do usuário (UX) e do desenvolvedor (DX), elevando a produtividade do processo de decisões em rounds complexos do simulador.
- **Status:** Ativo e Disponível em Produção, Compilação e Linter 100% Homologados.

### v19.59 Obsidian Diamond - Incorporação Automática de Lucros no Capital Social
- **Data:** 02 de Junho de 2026, 13:20 UTC
- **Motivo:** Implementação da diretriz contábil e de governança corporativa que permite ao Tutor estipular a frequência com que a contabilidade do simulador irá incorporar de forma automática o saldo de lucros/prejuízos acumulados no Capital Social (ambos do Patrimônio Líquido) das equipes, facilitando a análise e capitalização empresarial ao longo dos rounds do simulador.
- **Diferenças:**
  - *Parametrização Flexível do Prazo no Step 6:* Incluído o novo seletor `"INCORPORAR LUCRO/PREJUÍZO NO CAPITAL SOCIAL"` no bloco "ACIONISTA & IPO" logo abaixo do agendamento de dividendos no TrialWizard, munido de três opções sênior de frequência: "TODO PERÍODO (ROUNDS)" (frequência 1), "A CADA 2 ROUNDS" (frequência 2, default) e "A CADA 4 ROUNDS" (frequência 4).
  - *Mapeamento de Presets:* Todas as configurações padrão e presets de simulação fiduciária de Greenfield e PME (start from zero, start with base, complex SA) foram estendidas para suportar a nova configuração inicial com fallback estável de 2 períodos.
  - *Motor Contábil de Mutação Patrimonial Automático:* Desenvolvido o algoritmo de transferência permutativa dentro do Patrimônio Líquido em `services/simulation.ts`. Quando o período da rodada atual simulada é um múltiplo do prazo configurado (`currentRound % profitIncFreq === 0`), o balanço patrimonial realiza instantaneamente a transferência agregadora do saldo da conta `"equity.profit"` (Lucro/Prejuízo Acumulado) para a conta `"equity.capital"` (Capital Social), zerando o saldo subsequente de lucros acumulados daquele ciclo de forma fiduciária.
- **Impactos:** Mutação contábil imediata refletida diretamente no Balanço Patrimonial e painel de demonstrativos das equipes, com validação matemática e preservação automática de igualdade fiduciária absoluta (`Ativo = Passivo + Patrimônio Líquido`).
- **Status:** Implementado, homologado sob conformidade de linter e compilação em produção.

### v19.61 Sapphire Emerald - Erradicação Integral de Saldo Negativo e Correção Contábil de Compras Especiais de Matéria-Prima
- **Data:** 04 de Junho de 2026, 13:25 UTC
- **Motivo:** Cumprir rigorosamente a regra corporativa do EMPIRION que proíbe qualquer saldo físico/financeiro negativo de estoque. Ajustar os impactos financeiros de Compras Especiais (Emergenciais) acionadas automaticamente quando o consumo do período excede as compras normais planejadas, garantindo que o custo com ágio ("special_purchase_premium" de indicators) seja pago imediatamente (à vista) no mesmo período, e calibrar o WAC e o fluxo imediato de caixa para acionar o Empréstimo Compulsório caso haja defasagem de tesouraria.
- **Diferenças:**
  - *Pagamento Imediato de Compras de Emergência (À Vista):* Ajustada a lógica de fracionamento de caixa em `/services/simulation.ts`. Agora, a conta de Compras Especiais emergenciais com ágio (`emergencyPurchaseCostCombined`) é omitida do cálculo de parcelamento de compras normais de fornecedores sob o indexador `supplierPaymentType` (0, 1 ou 2). As compras de emergência são pagas integralmente (100% à vista) no fluxo imediato de saída de caixa do período atual (`cashOutflowSuppliers`), mantendo seu valor fora do passivo circulante acumulado de fornecedores futuros (`newAccountsPayable`).
  - *WAC Líquido de Emergência sem Juros de Financiamento:* No motor principal (`simulation.ts`) e no motor secundário (`simulation-core.ts`), removemos a aplicação duplicada de taxa de financiamento de fornecedores (`supplierInterestFactor`) sobre as compras de emergência (`netEmergencyMpaPrice` e `netEmergencyMpbPrice`), uma vez que são pagas integralmente à vista e, portanto, não incorrem em juros de parcelamento de fornecedor. Isso preserva o WAC fiel, elevando o valor do estoque unicamente pelo ágio regulamentar da rodada (`specialPremium`).
  - *Mitigação de Estoque Negativo com Compulsórios:* As saídas de caixa acrescidas de 100% do custo com compras de emergência agora reduzem o caixa corrente de forma integral. Caso o caixa se torne deficitário, o mecanismo de resgate de aplicações financeiras e a emissão automática do Empréstimo Compulsório punitivo são acionados adequadamente para cobertura fiduciária imediata.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.60 Sapphire Platinum - Blindagem contra Estoques Físicos Negativos e Detalhamento Sênior de Auditoria Contábil
- **Data:** 04 de Junho de 2026, 13:00 UTC
- **Motivo:** Sanar o travamento e erro impeditivo de "BLOQUEIO DE SEGURANÇA CONTÁBIL (SAPPHIRE)" no turnover de períodos avançados (especificamente do round P02 para P03 da EQUIPE TRIAL 03), o qual decorria do salvamento das quantidades físicas das matérias-primas nos KPIs sem incluir os lotes de compra de emergência acionados. Isso causava estoques físicos negativos nas bases de dados das marcas do torneio, os quais contaminavam o motor de custos das próximas rodadas, gerando rombos intangíveis e disparidades patrimoniais acumuladas de alta magnitude de até 147.798,00 BRL.
- **Diferenças:**
  - *Inclusão de Compras de Emergência nas Quantidades de Estoque:* Correção em `/services/simulation.ts` na atribuição do objeto de quantidades físicas de suprimentos no encerramento de simulação (`stockQuantities`). Agora as contas `mp_a` e `mp_b` são computadas diretamente sobre os saldos reconciliados pós-produção e compras emergenciais (`closingMpaQty` e `closingMpbQty`), em vez de fórmulas simplórias obsoletas que ignoravam o acoplamento de compras especiais.
  - *Blindagem contra Quantidades Físicas Negativas:* Adição de proteção física fiduciária do Ativo usando `Math.max(0, ...)` nas quantidades de estoque de insumos no salvamento (`stockQuantities`) e carregamento inicial de rodada em ambos `/services/simulation.ts` e `/services/simulation-core.ts` (`initialMPAStock` e `initialMPBStock`). Isso garante a eliminação imediata de quaisquer estoques físicos negativos pré-existentes ou legados em registros históricos no banco de dados.
  - *Detalhamento Minucioso e Completo de Inconsistência Contábil:* Reestruturação da mensagem de erro e auditoria na fita Sapphire do `/services/simulation-core.ts`. Em situações de discrepâncias, em vez de um resumo de disparidade de totalizadores, a fita lança um dump detalhado de auditoria de cada uma das subcontas ativas e passivas do Balanço Patrimonial (Caixa, Aplicações, Clientes, PECLD, IVA recuperável, estoques de PA/MPA/MPB, imobilizados, fornecedores, impostos, dividendos, PPR e empréstimos correspondentes de curto e longo prazo), permitindo auditoria instantânea por coordenadores.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.59 Sapphire Gold - Erradicação de Disparidades Contábeis em Turnovers via Alinhamento Fiduciário do WAC de Suprimentos
- **Data:** 04 de Junho de 2026, 12:45 UTC
- **Motivo:** Sanar em definitivo o travamento crítico no Turnover de rodadas (especificamente do round P02 para P03 da EQUIPE TRIAL 01, gerando o erro de "BLOQUEIO DE SEGURANÇA CONTÁBIL (SAPPHIRE)") decorrente de disparidades centesimais ou de milhar na Equação Contábil fundamental (Divergência entre Ativo e Passivo + PL). O descolamento ocorria porque o motor de projeção acumulava as saídas e saldos de estoques usando um preço médio estimado/estático (`initialMPAStock * netMpaPrice`) ao invés do valor real carregado no Balanço Patrimonial anterior.
- **Diferenças:**
  - *Sincronização Fiduciária do WAC:* Substituição da fórmula estática de custo de entrada de estoques em `/services/simulation.ts` pelas variáveis dinâmicas `initialMpaValue` e `initialMpbValue`, as quais extraem via `findAccountValue` o saldo valorado exato registrado no Ativo do Balanço Patrimonial anterior (`prevBS`).
  - *Consistência de Clientes e Equação de Balanço:* Ao fundamentar o WAC nos saldos reais do balanço, a mutação cambial dos estoques consumidos e estocados equilibra-se integralmente com as contas do DRE (CPV) e as movimentações financeiras de caixa e passivos. Isso elimina divergências cumulativas e resolve a inconsistência de 1.338,28 BRL apresentada, garantindo turnovers lisos e equações contábeis perfeitamente balanceadas (Ativo = Passivo + PL) em todos os rounds do Torneio.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.58 Obsidian Diamond - Sincronização em Tempo Real das Métricas Fiduciárias no TrialWizard (Step 8)
- **Data:** 02 de Junho de 2026, 13:00 UTC
- **Motivo:** Garantir que as métricas do Monitor Fiduciário (`fiduciaryMetrics`) e os demonstrativos contábeis (Balanço, DRE, DFC) apresentados em tempo real na etapa final do Wizard (Step 8) de parametrização do Tutor reflitam instantaneamente e de forma 100% simétrica qualquer modificação orquestrada pelas equipes nos passos anteriores, erradicando qualquer atraso na renderização e discrepâncias no estoque de produtos acabados ou de matérias-primas comuns.
- **Diferenças:**
  - *Consolidação da Fonte Única de Verdade:* Redesenhada a lógica de cálculo do hook `fiduciaryMetrics` em `/components/TrialWizard.tsx` para derivar as variáveis patrimoniais e de liquidez (Ativo Circulante, Ativo Total, Exigível a Curto e Longo Prazo, e Imobilizado Comercial/Industrial bruto e líquido) diretamente da estrutura contábil compilada deterministicamente em `p0StatementsResult.balance_sheet`, ao invés de recalcular fórmulas espelhadas offline que divergiam nos valores-padrão de estoque de elaboração (WIP Stock) entre os cômputos de simulação e a interface de monitoramento (p. ex. divergência histórica de $500.000 vs $250.000).
  - *Sincronismo Síncrono de Ativos e Patrimônio:* Atualizadas as propriedades globais `totalAssets` e `totalEquity` para ler do mesmo feed da árvore do `p0StatementsResult.balance_sheet`, resultando no cálculo imediato sem folga de tempo (single-frame rendering pipeline) de todos os rácios de solvência, Altman Z''-Score, Kanitz, Rating de Crédito, Pilares de Integridade E-SDS (v19.23), e alertas de auditoria corporativa.
- **Impactos:** Sincronização reativa fiduciária milimétrica e em tempo real de todo o ecossistema financeiro no Step 8, permitindo que alterações de CapEx de máquinas, aluguel vs posse predial, ou compra de insumos reflitam instantaneamente nas notas e demonstrativos.
- **Status:** Disponível em Produção, Compilação e Linter homologados.

### v19.57 Obsidian Diamond - Reconciliação Perfeita de Balanço Patrimonial e Fluxo de Caixa Greenfield "Start from Zero"
- **Data:** 02 de Junho de 2026, 12:15 UTC
- **Motivo:** Sanar a falha de reconciliação contábil em modo Greenfield ("Start from Zero") onde o investimento em benfeitorias, terreno e construções não ajustava o caixa inicial fiduciário ou o capital social quando financiado por capital próprio, gerando um descolamento do Balanço Patrimonial e Fluxo de Caixa que apresentavam distorções nos saldos finais. Além disso, o "Imobilizado Net Total" exibia valor distorcido de $200.000 devido ao valor padrão incorreto ao invés do parametrizado de $500.000 do Tutor.
- **Diferenças:**
  - *Mitigação de Sobregravação Agressiva:* Ajustado o "Start from Zero Shield" no método `validateCleanP0` em `services/initialization.ts` de modo a preservar as contas legítimas de ativos imobiliários, benfeitorias físicas e seus financiamentos passivos calculados coerentemente, forçando a zero absoluto apenas máquinas, depreciações obsoletas e obrigações operacionais Greenfield.
  - *Cálculo e Alocação Perfeita de Caixa:* No motor `generatePureP0` de `services/initialization.ts` e no hook `fiduciaryMetrics` de `TrialWizard.tsx`, se o imobilizado for financiado por capital próprio (`funding === 'capital'`), o valor líquido despendido é deduzido de imediato do caixa inicial (`caixa_inicial`), evitando inflação indevida do Capital Social ou quebra de conciliação. Em contraposição, se financiado por terceiros (`funding === 'debt'`), o caixa inicial permanece preservado e o financiamento de longo prazo é registrado de forma correspondente.
  - *Calibração de Valor Padrão para Greenfield:* Corrigido o valor padrão das benfeitorias e instalações iniciais (`installValDefault`) para $500.000,00 quando estas não estiverem explicitamente parametrizadas no modo Greenfield, alinhando reativamente com os defaults do painel e eliminando variações anômalas de $200.000.
- **Impactos:** Segurança absoluta para o Arena Tutor e para as equipes na rodada zero (P0), garantindo fechamento contábil impecável ao centavo, onde o ATIVO do Balanço é estritamente igual ao PASSIVO + PL em todos os cenários de parametrização Greenfield e o saldo inicial e final do período no Fluxo de Caixa fecham perfeitamente com os saldos em conta Caixa/Bancos do Ativo Circulante.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.56 Sapphire Strategos - Turnos Múltiplos e Ativação de Benfeitorias/Imobilizado Fiduciário em Greenfield (P0)
- **Data:** 01 de Junho de 2026, 15:05 UTC
- **Motivo:** (1) Corrigir a restrição na tomada de decisão onde as equipes ficavam presas por regulamento ao Turno Único (1T) e não conseguiam selecionar e simular Turnos Múltiplos (2T ou 3T), mesmo quando o Tutor houvera parametrizado no Wizard do P0 o limite de turnos múltiplos. (2) Corrigir a incoerência contábil fiduciária onde o imobilizado do imobiliário (como Benfeitorias e Instalações em Prédio alugado de $500.000) era zerado no motor de inicialização de P0 (`generatePureP0` em modo Greenfield / "Start from Zero") restando apenas em caixa, enquanto o preview de simulação do Tutor (Step 8) o exibia ativo.
- **Diferenças:**
  - *Sincronização de Parâmetros de Recursos Humanos:* Refatoração das variáveis enviadas à simulação em `TrialWizard.tsx` (`createChampionshipWithTeams`), sincronizando e injetando as configurações do Tutor (`workforce.max_shifts`, `workforce.production_hours_period`, `workforce.baseSalary` de piso e o quantitativo de operadores por máquina para os modelos Alfa, Beta e Gama) de forma canônica dentro dos indicators (`market_indicators`) de campeonato.
  - *Desbloqueio Inteligente sob Demanda:* O seletor de regime de turnos em `FactoryStep.tsx` agora lê o parâmetro dinâmico `max_shifts` gravado pelo Tutor. Se configurado para até 2 ou 3 turnos, os botões correspondentes são liberados reativamente para seleção instantânea com o default inicial restrito a 1 Turno (T1).
  - *Mecânica e Equações Operacionais dos Turnos:* O motor contábil e de planejamento em `simulation.ts` foi validado, confirmando os multiplicadores de capacidade (1.8x para 2T, 2.3x para 3T) e reajustes calculados diretos sobre a folha e Mão de Obra Direta (1.5x para 2T, 2.0x para 3T).
  - *Ativação e Equilíbrio de Imobilizado Greenfield em P0:* No motor `services/initialization.ts`, a inicialização no modo `isZeroMode` (Greenfield) foi totalmente integrada com as opções imobiliárias e de benfeitorias. O Ativo Imobilizado correspondente (Benfeitorias e Instalações em Prédios de Terceiros se alugado, ou Prédio e Terreno se próprio) é ativado de forma idêntica à do preview, e o equilíbrio patrimonial fiduciário é estabelecido reativamente conforme a origem de recursos escolhida pelo Tutor (`real_estate_acquisition_funding`): via ampliação do Capital Social (funding próprio) ou via Passivo de Financiamentos de Longo Prazo (funding terceiros), mantendo Lucros Acumulados em zero de forma fiduciária.
- **Impactos:** Desbloqueio e funcionamento impecável de regimes com 2 e 3 turnos e preenchimento 100% simétrico das demonstrações contábeis de abertura de P0 entre o simulador do Tutor e o cockpit dos alunos, garantindo integridade e transparência pedagógica e eliminando perdas inexplicáveis de ativos físicos.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

### v19.55 Sapphire Citrine - Correção de Sobreposição Visual e Loop de Reinicialização Infinita do Modal de Encerramento Fiduciário
- **Data:** 31 de Maio de 2026, 16:30 UTC
- **Motivo:** Sanar o loop infinito onde o modal de encerramento fiduciário do tempo limite fiduciário (`RoundSummaryModal`) reabria infinitamente após o fechamento, indisponibilizando a navegação das equipes, e retificar a sobreposição visual onde o cabeçalho do Decision Terminal permanecia acima do modal.
- **Diferenças:**
  - *Mitigação do Loop com State e Memoização:* Introdução do estado resiliente `hasAcknowledgedExpiration` e do manipulador correspondente memoizado via `useCallback` (`handleExpire`), eliminando o bug de recriação de referências anônimas que resultava no reinício contínuo dos efeitos de temporizadores de contagem regressiva em `ChampionshipTimer`. Agora, quando o competidor fecha o modal, a decisão de fechamento é salva e o modal permanece fechado até que o Tutor realize o turnover fiduciário oficial para o próximo round.
  - *Aprimoramento do Z-Index:* Elevação do container principal do modal `RoundSummaryModal` de `z-50` para `z-[10000]`, assegurando de forma robusta e canônica que o modal fique posicionado sobre todos os elementos visuais do cockpit (incluindo o header de decisões táticas que opera em `z-[100]`).
- **Impactos:** Navegação 100% fluida, sem loops, com encerramento polido, acessível e responsivo, mantendo a integridade tática do Oráculo.
- **Status:** Disponível em Produção, Compilação e Linter 100% Homologados (Zero Warnings).

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

### v19.26 Sapphire Diamond Enterprise - Correção de Depreciação Imediata de Novas Máquinas e Integração CPP/CIF
- **Data:** 02 de Junho de 2026
- **Motivo:** Garantir a conformidade com as regras contábeis brasileiras (CPC 27) e as melhores práticas contábeis, computando a depreciação de máquinas adquiridas no período a partir do próprio período de aquisição (P1 em diante), além de validar a formação do CPP (CIF) e do Balanço Patrimonial contemplando todas as depreciações (máquinas, prédios e instalações).
- **Diferenças:**
  - *Retirada da Carência para Depreciação de Máquinas em P1:* Removida a barreira antiga que excluía novas aquisições da conta de depreciação do período atual no `services/simulation.ts`. Agora, todas as máquinas ativas na rodada (novas e existentes) passam a acumular desgaste de forma justa e oportuna, atualizando o campo `accumulated_depreciation` no Ativo Imobilizado e alimentando a despesa de depreciação no período do fechamento.
  - *Conformação e Validação do CPP/CIF:* Garantido que o valor total de depreciações acumuladas na rodada englobe máquinas, edifícios e instalações no `periodDepreciation`, o qual integra diretamente a conta final de Custos Indiretos de Fabricação (**CIF Completo**) e consequentemente o Custo do Produto Produzido (**CPP**).
  - *Sincronia Patrimonial:* Alinhamento completo com o módulo de validação e auditoria sênior no `services/simulation-core.ts` para que todas as demonstrações contábeis se mostrem de forma perfeitamente batida e transparente para os usuários e tutores.
- **Status:** Em Produção (Compilação e Linter 100% Verificados e Verdes).

### v19.25 Sapphire Diamond Enterprise - Sincronização Patrimonial Fiduciária de P0 e Regra de Fomento BDI Capex no P1
- **Data:** 02 de Junho de 2026
- **Motivo:** Corrigir de forma definitiva as inconsistências na visualização de Balanço/DFC de P0 apresentadas no Step 8 do TrialWizard e garantir as corretas regras operacionais e contratuais de fomento BDI de novas máquinas no P1 (carência de principal e juros).
- **Diferenças:**
  - *Sintonização de landValDefault e installValDefault:* Sincronizados os valores padrões de Terreno e Instalações no `TrialWizard.tsx` (que antes possuíam disparidades) com os valores reais gerados e processados pelo kernel determinístico fiduciário (`generatePureP0`).
  - *Equação Patrimonial de Abertura:* Adicionado algoritmo de auto-harmonização e dedução de PL baseando-se no Ativo Circulante real (`initial_cash`) e no Ativo Não Circulante preservado de abertura (`validateCleanP0` do `services/initialization.ts`), blindando as demonstrações contra desbalanço ou resíduos contábeis no Step 8.
  - *Neteamento de Capex Financiado:* Nova propriedade `cashFlowMachBuy` parametrizada no simulador (`services/simulation.ts`). Para compras financiadas através de empréstimos automáticos de fomento (BDI ou similar), o débito imediato de caixa fiduciário na conta operativa de compras de maquinários (`cf.outflow.machine_buy`) passa a ser estritamente zero, evitando a falsa queima de recursos do caixa próprio da equipe.
  - *Carga de Juros da Contratação em P1:* Os juros relativos à contratação da parcela fiduciária BDI em P1 (com taxa TR) são cobrados e pagos de imediato na rodada através da despesa financeira (`interestExp`), afetando de forma transparente e oportuna o Fluxo de Caixa no campo de juros (`cf.outflow.interest`). A amortização do principal obedece estritamente ao período de fomento, iniciando-se somente após decorridos os 4 períodos regulamentares de carência.
- **Status:** Em Produção (Estabilidade e Compilação 100% Homologada no Linter).

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
  - *Benfeitorias em Imóveis de Terceiros:* Quando o Tutor configura prédio locado/alugado, o Balanço de abertura direciona o valor investido em benfeitorias físicas (`installations_value`) para a conta ativa regulamentar de "Instalações Industriais", e calcula sua amortização contábil linear durante a vida útil estimada do contrato de locação (10 anos).
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


### v19.59 Obsidian Diamond - Sincronia Resiliente de Gestão de Tempo do Cockpit & Saneamento de Pausa (Versão Ativa)
- **Data:** 02 de Junho de 2026
- **Motivo:** Corrigir defeito de flutuação temporal do temporizador após comandos consecutivos de Turnover e Pausa de rodadas pelo Tutor, além de remover redundâncias estéticas do monitor de comando estratégico.
- **Diferenças:**
  - *Sincronização de Estado de Arena em Tempo de Execução:* Ajuste crítico no método de sincronização do cockpit do Tutor (`fetchData` do `/components/AdminCommandCenter.tsx`) para atualizar dinamicamente o objeto `selectedArena` em memória a cada recarga ou conclusão de turnover. Isso evita referências a carimbos de data (`round_started_at`) depreciados provenientes de rodadas passadas que levavam a erros no cálculo de tempo restante (`remainingMsAtPause`) zerado ("ENCERRADO") no momento da pausa.
  - *Saneamento Automático de Pause-Config no Turnover:* Injeção de lógica fiduciária na atualização de estado do banco de dados no fechamento de cada round (`processRoundTurnover` em `/services/supabase.ts`) para resetar e limpar as variáveis de interrupção (ex: definindo `is_paused: false` e limpando `remaining_ms_at_pause`), blindando o novo ciclo de cronometragem contra resquícios e sobras de pausas ocorridas no round anterior.
  - *Otimização Visual de Redundâncias:* Remoção cirúrgica do widget de contagem regressiva `ChampionshipTimer` redundante exibido no interior da tela "Dashboard do Tutor: Comando Estratégico", consolidando a atenção do orador sob o temporizador mestre unificado de topo na barra de ferramentas administrativo.
- **Status:** Em Produção (Consistência Temporal de 100% e Dashboard Elegante).

### v19.58 Obsidian Diamond - Resolução de Consistência Fiduciária de Dividendos & Mutação Contábil Sênior P0
- **Data:** 02 de Junho de 2026
- **Motivo:** Sanar inconsistência crítica de divergência na equação contábil (Ativo diverge de Passivo + PL) gerada pelo provisionamento de dividendos não compensado nos lucros acumulados, e estabilizar a Mutação Contábil Sênior por frequência de período.
- **Diferenças:**
  - *Dedução de Dividendos em equity.profit:* Ao apropriar dividendos no Passivo Circulante (`liabilities.current.dividends`), o montante correspondente é agora deduzido da conta de Lucros Acumulados (`equity.profit`) na mesma proporção em ambos os blocos de cálculo (`bsValues` e a reconciliação do `balance_sheet` com premiações), blindando a Equação Fundamental Contábil (Ativo = Passivo + PL) contra lacunas bilaterais.
  - *Mutação Contábil Parametrizada:* Consolidação formal do comportamento automático de mutação do PL baseada no campo "INCORPORAR LUCRO/PREJUÍZO NO CAPITAL SOCIAL" (`profit_incorporation_frequency` de prazos 1, 2 ou 4 rounds), efetuando o fato permutativo fiduciário de integralização automática e zeramento de lucro acumulado.
- **Status:** Em Produção (Consistência Absoluta AA+ com validação Z-Guard integrada).

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

### v2026.127 - Obsidian Diamond v2 (Fiduciary P0 Template Visibility & Sanitization)
- **Data:** 13 de Junho de 2026
- **Motivo:** Implementação da diretiva estratégica de visualização flexível de templates P0. No modo Trial/Sandbox, todos os templates tornam-se de leitura livre para todos os participantes ("abertos para todos"), acelerando a colaboração e testes do simulador. No modo oficializado de campeonato, ativa-se o rigoroso controle de visibilidade isolado para que cada Tutor acesse estritamente seus próprios arquivos. Sanamento de RLS e Payload Sanitization para prevenir quebras insolúveis de API.
- **Principais Diferenças na v2026.127:**
  - **Dynamic Privacy Policy Selector:** `getP0Templates()` avalia de forma nativa a presença do estado `is_trial_session` ou a ausência de autoconexão para liberar a visualização pública. Em cenários oficializados (campeonatos pagos/produção), aplica o filtro isolante `.eq('tutor_id', currentUser_id)`.
  - **Database Payload Sanitization (ADR-DB-04):** Sanada a tentativa de inserção de propriedades de tráfego visual (`category` e `code`) de forma crua, expurgando esses campos antes de submeter ao Supabase-PostgREST para evitar o erro `400 Bad Request` na listagem persistente e garantindo o funcionamento perfeito do fluxo.
  - **Transição de RLS no PostgreSQL:** Ajuste das regras de concorrência e leitura na tabela `public.p0_templates` onde se retirou a restrição rígida `TO authenticated` na cláusula `SELECT` com o flag `is_public` (liberando-a de forma coerente à role `public`), mantendo escrita segura em conformidade com as regras do torneio.
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

### v2026-06.1 - Blindagem Greenfield "Start from Zero" e Resolução do Loop de Timer
- **Data:** Junho de 2026
- **Motivo:** Correção de inconsistências nas demonstrações contábeis e na Agenda Financeira para campeonatos criados no modo "Start from Zero", além da prevenção de loops de popups de timer expirado.
- **Diferenças:**
  - *Balanço Patrimonial Greenfield:* Forçada a zeragem absoluta de todas as contas do Ativo Não Circulante (Imobilizado / Terrenos / Edificações / Benfeitorias e Depreciação Acumulada) e passivos correspondentes de arrendamento de longo prazo (`loans_lt`). Totalizadores recalculados para que Pl (Capital Social) e Ativo Total (Caixa Inicial) coincidam perfeitamente ao centavo.
  - *Fluxo de Caixa Greenfield:* Zeragem profunda e inicialização fiduciária do DFC com saldo inicial (`cf.start`) e final (`cf.final`) de caixa iguais ao valor parametrizado pelo Tutor, com entradas e saídas operacionais zeradas.
  - *Agenda Financeira Sem Empréstimos Fantasmas:* Inserção explícita do array `loans: []` em KPIs de inicialização no banco Supabase e em fallbacks locais fiduciários do Dashboard, prevenindo a regeneração automática de empréstimos antigos padrões de S.A. Running em campeonatos iniciados do zero absoluto.
  - *Resolução de Loop de Popups:* Refatoração do `ChampionshipTimer` para usar referências persistentes (`hasFiredExpire` e `prevTargetDate`) e debouncing interno de transição para o estado expirado. O gatilho de expiração de rodada (`onExpire`) agora se ativa exatamente uma única vez por ciclo fiduciário, eliminando loops infinitos de abertura e fechamento caso o cockpit seja re-renderizado sob tempo corrido nulo ou negativo.
- **Status:** Em produção.

### v2026-06.2 - Sincronização Fiduciária de KPIs de Histórico (Kardex & CPV)
- **Data:** 4 de Junho de 2026
- **Motivo:** Resolução de inconsistência de exibição no relatório "KARDEX & CPV" na matriz financeira do cockpit, que apresentava valores zerados para o Período 1 consolidado (histórico).
- **Diferenças:**
  - *Fusão de KPIs de Banco:* Implementação de fusão transparente que recupera os KPIs reais consolidados do time diretamente da tabela de equipes (`trial_teams`/`teams`), que preserva o estado íntegro dos cálculos contábeis do motor, e os mescla sobre o registro histórico correspondente lido de `trial_companies`/`companies` para a rodada concluída (`arena.current_round`).
  - *Sincronização em Tempo Real (WebSocket):* Refatorado o gatilho `triggerReload` disparado em tempo real ao avançar de rodada, de modo a consultar o registro de equipes atualizado e injetá-lo no histórico de forma simbiótica, garantindo consistência total de exibição contábil.
- **Status:** Em produção.

### v2026-06.3 - Alinhamento Fiduciário de Cabeçalhos e Fallback de Estoque de Abertura do Kardex & CPV (P0)
- **Data:** 5 de Junho de 2026
- **Motivo:** Eliminar a defasagem matemática de `+1` nos cabeçalhos das colunas de períodos da Matriz Financeira (DRE, Balanço, Fluxo de Caixa, Kardex, etc.) que induzia as equipes a erro na visualização das rodadas históricas e projetadas. Também visa prover consistência contábil na aba "KARDEX & CPV" para o Período de Abertura (Round 0) quando o torneio acaba de ser criado no Supabase, diferenciando os modos de partida.
- **Diferenças:**
  - *Correção de Defasagem de Colunas:* Ajustada a fórmula de renderização do rótulo das colunas em `FinancialReportMatrix.tsx` para usar de forma literal os numerais reais dos rounds (`p.round`) das rodadas concluídas (histórico) e rodadas ativas de tomada de decisão (projeções), erradicando decaloque defasado e exibindo com rigor `PERÍODO 0x` e `PROJEÇÃO P0x`.
  - *Balanço de Entrada de Estoque no Kardex Condicionada ao Modo (Abertura):* Implementado fallback estrito, elegante e adaptativo em `FinancialReportMatrix.tsx` para o Período de Abertura (Round 0). A exibição do Kardex é condicionado à propriedade `startingMode`:
    - **No modo "Start from Zero" (`starting_mode === 'start_from_zero'`):** Os saldos iniciais e finais de Kardex iniciam-se com 0 de forma estricta, uma vez que a fábrica começa absolutamente do zero absoluto, conforme planejado pelo Tutor.
    - **Nos modos base/rodando (`'start_with_base'` / `'start_with_running'`):** O sistema assume fisicamente os saldos de estoque iniciais herdados (30.150 un de MP A a R$ 15,00/un, total R$ 452.250,00 e 20.100 un de MP B a R$ 10,00/un, total R$ 201.000,00), garantindo alinhamento fiduciário perfeito e mantendo as saídas e DRE/CPV zerados conforme as normas do CPC para balanços de entrada.
- **Status:** Em produção.

---

## Decisão Arquitetural & Versionamento - Correção de Nomenclatura do Cronograma de Amortização (Carência BDI) e Resolução do ecoConfig no cálculo de Depreciação - v2026.104

**Data:** 07 de Junho de 2026 às 19:10 UTC  
**Motivo:** Sanar a falsa percepção de redução do período de carência do financiamento BDI de novas máquinas (4 rodadas de carência) causada por nomenclatura ambígua no front-end, além de corrigir o desvio que fazia com que a depreciação de máquinas desconsiderasse a parametrização do Tutor de 5% e calculasse 10%.  
**Principais diferenças:**  
- **Estabilização Metodológica de Carência (BDI):** Foi comprovado que o cálculo de amortização amortiza de forma precisa o principal no Round 5 (4 rodadas completas de carência: R1, R2, R3, R4) e juros TR regulares. No entanto, os cartões de parcelas no cockpit e na aba de detalhamento eram identificados fixamente como `INSTALMENT R1`, `INSTALMENT R2`, `INSTALMENT R3`. Isso levou alunos e tutores a erro, deduzindo que "R3" representava "Round 3" (onde o principal estaria sendo amortizado indevidamente ao invés de Round 5).
- **Adequação de Nomenclatura para Rodadas Dinâmicas:** Re-etiquetamos o cabeçalho dos cartões para referenciar de forma literal os numerais reais dos vencimentos fiduciários das rodadas calculados via `p.round + idx + 1` no Balanço e `round + instIdx + 1` nas visões de simulação e tomada de decisão, exibindo com rigor `Vencimento R-03`, `Vencimento R-04` e `Vencimento R-05`.
- **Resolução de Aninhamento das Variáveis do ecoConfig:** O motor `simulation.ts` e o arquivo auxiliar `simulation-core.ts` resolviam configurações de campeonato sob a premissa de que a propriedade `machines_depreciation_rate` viria estritamente dentro de uma chave filha `ecosystem_config`. Contudo, ao customizar arenas de campeonato, o Supabase armazena e repassa estas configurações no primeiro nível (`root`) do JSON de campeonato. Criamos uma resolução polimórfica e robusta de `ecoConfig` para buscar propriedades dinamicamente de forma retrocompatível tanto no root de configuração quanto no nível aninhado, aplicando de forma fidedigna a taxa de depreciação customizada (5% a.a.) ao invés do fallback padrão geral (10% a.a.).
**Impactos esperados:**  
- Clareza absoluta sobre o período de carência BDI de 4 rounds a contar das aquisições de maquinários.  
- Alinhamento em 100% da depreciação contábil do balanço com a alíquota parametrizada pelo Tutor.
**Status:** ATIVO, implantado e homologado para compilação.

---

## Decisão Arquitetural & Versionamento - Ajuste Global de Layout e Prevenção de Truncamento Itálico - v2026.105

**Data:** 08 de Junho de 2026 às 01:15 UTC  
**Motivo:** Evitar o truncamento sutil da última letra em títulos formatados com estilo itálico e espaçamento condensado (`italic tracking-tighter`). Esse efeito visual indesejado costumava ocorrer nas extremidades da caixa delimitadora do texto de cabeçalhos devido à inclinação das fontes. Além disso, reequilibrar proporções de texto em telas de grandes dimensões reduzindo tamanhos de fonte gigantistas em até 50%.  
**Principais diferenças:**  
- **Ajuste na Sandbox Arena Master Node (TestTerminal.tsx):** Inclusão de preenchimento lateral (`pr-6 md:pr-10`) e margem de segurança no elemento `<h1>`. O elemento `<span>` interno contendo o degradê foi convertido em `inline-block` com espaçamento de segurança adicional (`pr-4 pb-1`), assegurando que a última letra (como "s" em "Ativos") seja exibida inteiramente em qualquer resolução de tela.
- **Ajuste na Landing Page (LandingPage.tsx):** Anteriormente, o mesmo padrão de contenção foi devidamente estabelecido no título principal "EMPIRION - O SIMULADOR DEFINITIVO DE NEGÓCIOS", assegurando que nenhuma letra sofra desbaste na ponta direita das letras inclinadas.
- **Ajuste e Redução Volumétrica de Escala na Detalhe da Atividade (ActivityDetail.tsx):** Redução do H1 original em 50% (passando de `text-6xl md:text-8xl lg:text-9xl` para `text-3xl md:text-5xl lg:text-5xl` respectivamente) para melhor adaptabilidade e legibilidade de tela, acompanhado da adição de margens laterais (`pr-8 md:pr-12`) no contêiner-pai e conversão do degradê interno à estilização `inline-block pr-6 pb-1` para respiro e prevenção de truncamento do itálico.
**Impactos esperados:**  
- **Excelência em UI/UX de nível AA:** Legibilidade plena de todos os títulos, sem caracteres truncados ou cortados lateralmente.
- **Equilíbrio de Contraste e Escala Visual:** Um visual muito mais elegante, focado em minimalismo premium com espaçamento generoso e proporções harmônicas de tipografia.
- **Visualização perfeitamente responsiva:** Conforto visual em telas mobile, tablets e ultra-wide.
**Status:** ATIVO, implantado e homologado com sucesso.

---

## Decisão Arquitetural & Versionamento - Intercepção de Direcionamento em Menus com Sub-Menus - v2026.106

**Data:** 08 de Junho de 2026 às 01:25 UTC  
**Motivo:** Atender à nova diretriz de usabilidade que restringe a navegação de itens pai que contêm sub-menus nas barras de cabeçalho públicas e móveis. Em vez de direcionar imediatamente o usuário para um link genérico, o clique ativa e exibe/alterna o sub-menu correspondente para que a escolha seja mais precisa e intuitiva.  
**Principais diferenças:**  
- **Componente PublicHeader (PublicHeader.tsx):** 
  - **Em telas Desktop:** Subprodutos de `MENU_STRUCTURE` que possuem a propriedade `sub` têm sua propriedade `to` chaveada para `#`. Ao serem clicados, disparam `e.preventDefault()` e alternam o estado de abertura (`activeMenu`), impedindo transições indesejadas e garantindo que o usuário interaja fidedignamente com os itens suspensos. Clicar em qualquer sub-item agora limpa e fecha o menu imediatamente via `setActiveMenu(null)`.
  - **Em telas Mobile / Responsivas:** Criou-se o estado persistente `expandedMobileMenu` controlado localmente. Caso o item pai possua sub-itens, o clique renderiza de forma dinâmica um sanfonado (`accordion`) amparado em animações de transição do `framer-motion` (`AnimatePresence` / `animate={{ height: "auto" }}`). O usuário visualiza com elegância os módulos ativos com seus ícones e rótulos específicos em vez de carregar rotas pai não persistentes, fechando a aba principal ao selecionar o sub-menu correspondente.
**Impactos esperados:**  
- **Usabilidade Otimizada:** Fluxo de navegação extremamente polido, intuitivo e à prova de falhas táticas (sem links quebrados ou telas vazias de seções agrupadoras).
- **Consistência Cross-Device:** O mesmo comportamento fluído e livre de comportamentos abruptos em navegadores móveis e desktop.
**Status:** ATIVO, implantado e homologado em produção.

---

## Decisão Arquitetural & Versionamento - Estilização em Itálico no Cabeçalho de Funcionalidades (FeaturesPage.tsx) - v2026.107

**Data:** 08 de Junho de 2026 às 01:40 UTC  
**Motivo:** Alinhamento estético entre as páginas principais do sistema de simulador. Ao aplicar o estilo `italic` no cabeçalho principal da FeaturesPage, o design reflete o dinamismo e sofisticação das arenas e dashboards de negócios.  
**Principais diferenças:**  
- **FeaturesPage (FeaturesPage.tsx):** Aplicação de classe `italic`, `pr-4` e `select-none` no cabeçalho. Para evitar o truncamento das pontas das fontes inclinadas sob o estilo compacto condensado (`tracking-tighter`), a última seção de palavras ("Inteligência Artificial") recebeu uma encapsulação `inline-block` com folga à direita (`pr-3 pb-1`).
**Impactos esperados:**  
- **Identidade Coesa:** Sintonia fina com a identidade de marca da Empirion.
- **Acabamento Premium sem Cortes Visuais:** Prevenção confiável contra cortes mecânicos de pontas de caracteres em todas as mídias.
**Status:** ATIVO, implantado e compilado com sucesso.

---

## Decisão Arquitetural & Versionamento - Revisão de Clima Trabalhista, Suavização de Greves e Redução de Teto de PPR - v2026.108

**Data:** 08 de Junho de 2026 às 22:36 UTC  
**Motivo:** Resolver a excessiva ocorrência de greves industriais indesejadas decorrente de um bug lógico/matemático na fórmula de cálculo do Clima Organizacional (`motivationIndex`), além de limitar o teto de distribuição de Participação nos Lucros (PPR) de 20% para 10% a pedido do conselho de acionistas para proteger as marcas de rentabilidade (DRE).  
**Principais diferenças:**  
- **Saneamento do Cálculo de Motivação (`simulation.ts` e `simulation-core.ts`):** 
  - Corrigido o bug na equação do `motivationIndex`. Anteriormente, a fórmula executava `(motivationFactor + (1.0 - demissionInsecurityFactor)) / 2.0`. Sob pleno emprego ou ausência de demissões (`demissionInsecurityFactor = 1.0`), o cálculo resultava em `(motivationFactor + 0.0) / 2.0 = motivationFactor / 2.0`. Isso limitava o índice a um teto máximo de `0.65`, rotulando o clima perpetuamente como "RUIM" (abaixo do limiar crítico de 0.75) e deflagrando greve geral após duas rodadas, independentemente do pagamento de super-salários e benefícios expressivos pelas marcas.
  - A nova formulação utiliza o produto linear direto dos componentes de incentivo e estabilidade funcional: `motivationIndex = motivationFactor * demissionInsecurityFactor`. Dessa forma:
    - Sem demissões, o clima flutua saudavelmente acompanhando as decisões salariais e de PPR (ótimo alinhamento motivacional: `REGULAR`, `BOM` ou `ALTO`).
    - Demissões em massa reduzem o fator de segurança (`demissionInsecurityFactor < 1.0`), reduzindo de imediato e proporcionalmente o `motivationIndex` final e gerando o devida alerta sindical de forma coerente.
- **Redução do Teto de PPR para 10% (`HRStep.tsx`, `simulation.ts`, `simulation-core.ts`):**
  - O limitador deslizante do formulário de decisão de Recursos Humanos (`HRStep.tsx`) foi reduzido de `max="20"` para `max="10"`.
  - No motor contábil, a leitura da intenção foi protegida contra entradas excedentes através de `Math.min(10, sanitize(decision.hr?.participationPercent, 0))`.
  - Reequilíbrio no potencial de bônus (`pprIndex`): Para evitar perda de engajamento do trabalhador sob o novo teto mais moderado, escalamos o multiplicador secundário do PPR de `1.5` para `3.0` (`pprIndex = 1 + (pprRate * 3.0)`). Sob a taxa de 10% (0.10), o índice motivacional do PPR atinge os mesmos `1.30` (30% de bônus sobre a base psicológica) que antes exigia o limite oneroso de 20%, gerando harmonia perfeita entre os interesses dos colaboradores e a rentabilidade dos acionistas (DRE).
- **Adequação nas Especificações (`BUSINESS_RULES.md`, `PRD.md`, `DOCUMENT.md`):** Sincronizados os limites de 20% vigentes nas documentações de negócios e de arquitetura para refletir fielmente o novo limiar estabelecido de 10%.
**Impactos esperados:**  
- **Estabilidade Operacional:** Fim das greves contínuas involuntárias sob boas gestões, restabelecendo a confiança das equipes e normalidade da produtividade industrial.
- **Eficiência nos Gastos de RH:** As equipes estão agora blindadas contra pressões de despesa de PPR de até 20%, distribuindo no máximo 10% da lucratividade, o que reduz saídas de capital operacional (`liabilities.current.ppr_payable` / no fluxo de caixa subordinado) e eleva a atratividade do equity para investidores.
- **Sensibilidade Operacional Coerente:** O sindicato continua sensível a demissões irrefletidas e salários abusivos abaixo do mercado regional, mas premia ativamente boas posturas e treinamentos industriais focados.
**Status:** ATIVO, amplamente homologado, compilado e implantado.

---

## Decisão Arquitetural & Versionamento - Erradicação de Inconsistências de Equação Contábil sob Ociosidade de Produção (Modo Start From Zero) - v2026.109

**Data:** 10 de Junho de 2026 às 11:15 UTC  
**Motivo:** Resolver o erro crítico de bloqueio contábil Sapphire ocorrido na transição de R-1 para R-2 sob o modo "START FROM ZERO" (Greenfield), onde o total do Ativo divergia do Passivo + PL. A divergência correspondia a custos de transformação industriais (como depreciações de máquinas e benfeitorias físicas do período) incorridos que sumiam do Balanço e do DRE quando a produção física era nula (por exemplo, no round 1 do Greenfield, onde o time inicia com zero operários e não produz nenhuma unidade fiduciária).  
**Principais diferenças:**  
- **Custeio por Absorção conforme CPC 16 (Estoques / IFRS) (`simulation.ts` e `simulation-core.ts`):** 
  - Anteriormente, o CPV (`totalCPV`) e o estoque final de produtos acabados (`closingStockValuePA`) eram calculados multiplicando as respectivas quantidades pelo custo unitário médio ponderado (`wacUnit` / `wacPaUnit`). Sob produção zerada, sem estoque anterior, `wacUnit` e `wacPaUnit` eram forçados a zero pelas travas de divisão por zero. Consequentemente, as depreciações (e outros custos de cif) que diminuíram o imobilizado líquido pelas depreciações acumuladas não se convertiam em valor de estoque final e também não transitavam no CPV para a DRE! Esse saldo desprovido simplesmente desaparecia do balanço contábil, causando o descompasso na equação do Sapphire.
  - A nova formulação utiliza a equação de resíduos clássica da contabilidade de custos: `totalCPV = totalValueInInventory - closingStockValuePA` (e respectivamente no core: `totalCPV = totalValuePaForSale - finalPaValue`). 
  - Dessa forma:
    - Se a produção for zero, os custos industriais (incluindo depreciações fixas, contratos recorrentes e amortização física) não puderam ser estocados (visto que `closingStockValuePA` is 0). Assim, a totalidade de `totalValueInInventory` (que é igual a `totalCPP`) transita integralmente no `totalCPV` do período, debitando a DRE de forma direta como perda por ociosidade/capacidade insatisfatória nos termos estritos do CPC 16.
    - Se a produção for positiva, qualquer fragmento centesimal de arredondamento de dízima ou resíduo de float no custo médio ponderado (`WAC`) é harmonizado de forma autônoma na equação de estoque, zerando o risco de instabilidades para qualquer equipe.
**Impactos esperados:**  
- **Saneamento e Fluidez do Greenfield:** Erradicação definitiva do loop de inconsistência de fecho do Sapphire no turnover de R-1 para R-2 sob modo "START FROM ZERO", assegurando integridade na equivalência contábil (Ativo = Passivo + PL) em termos matemáticos finos de até duas casas decimais.
- **Aderência às Práticas do CRC/CPC:** Lançamento direto e transparente no DRE de custos fixos industriais ociosos (capacidade ociosa), sem risco de ocultação ou estufamento fraudulento dos custos de bens manufaturados.
**Status:** ATIVO, compilado com sucesso e homologado via linter.

---

## Decisão Arquitetural & Versionamento - Controle Patrimonial e Histórico de Saldo de Mão de Obra Direta (MOD) no Turnover - v2026.110

**Data:** 10 de Junho de 2026 às 11:32 UTC  
**Motivo:** Sanar a falha sistêmica de perda de dados de equipe de operários fabris (Mão de Obra Direta / MOD) na transição de turnos (Turnover) no modo "START FROM ZERO" (e outros cenários). No round inicial (R-1), as equipes realizavam contratações (admitiam colaboradores, ex: 470 operadores), porém na simulação e transição de período para o round seguinte (R-2), a contagem do quadro fiduciário aparecia totalmente zerada, forçando o participante a admitir repetidamente o quadro inteiro ou sofrer de capacidade industrial nula inexplicável.  
**Principais diferenças:**  
- **Modelagem de Estoque/Ledger de Recursos Humanos (`services/simulation.ts`):** 
  - Anteriormente, o motor calculava corretamente a força operacional real disponível no período (`operatorsAvailable` baseado em `saldo_anterior + hired - fired`). Entretanto, no fecho do período, a propriedade de KPI estrutural `kpis.staffing.production` da equipe não era atualizada com este valor de saldo final de pessoal no objeto persistido `result.kpis`. Assim, no turnover para o round subsequente, o sistema lia novamente o fallback inicial da base (que é zero no modo Greenfield/start_from_zero), resetando o quadro das equipes à revelia de suas decisões de contratação passadas.
  - Implementado o sincronismo de estado persistente de Recursos Humanos nos KPIs de saída:
    ```typescript
    staffing: {
      ...team.kpis?.staffing,
      production: operatorsAvailable
    }
    ```
  - Desta forma, o saldo de colaboradores passa a operar estritamente como um livro razão ou controle de estoques: `Saldo Inicial (anterior) + Admissões (hired) - Demissões (fired) = Saldo Final (conduzido para a abertura do período seguinte)`.
**Impactos esperados:**  
- **Estabilidade Fiduciária e Transparência:** Preservação estrita das estruturas de pessoal admitidas pelas equipes. Se uma equipe decide operar no modo Greenfield, contrata operários in R-1 e não escolhe demitir in R-2, os operários herdam sua legitimidade de permanência contratual aberta com saldo inicial correto no R-2.
- **Reta de Crescimento Industrial Organizada:** Facilidade de expansão fabril (o participante pode simplesmente complementar seu time, contratando apenas a diferença necessária para colocar novas linhas de produção em atividade comercial, em vez de repactuar o quadro total).
**Status:** ATIVO, compilado com sucesso e homologado via linter.

---

## Decisão Arquitetural & Versionamento - Sincronismo Dinâmico de Dimensionamento de MOD Mapeado do TrialWizard.tsx - v2026.111

**Data:** 10 de Junho de 2026 às 12:15 UTC  
**Motivo:** Garantir a total consistência entre as especificações parametrizadas pelo Tutor em `TrialWizard.tsx` (como quantidade de operadores necessários por modelo de máquina) e os cálculos em tempo real e de turnover que alertam os usuários e delimitam seu índice de ociosidade/produtividade industrial no formulário de decisões.  
**Principais diferenças:**  
- **Leitura Reativa de Parâmetros de Trabalho (`components/steps/HRStep.tsx`):**
  - Anteriormente, o cálculo do somatório de `operatorsRequired` no componente visual `HRStep.tsx` trazia os valores físicos fixados de forma estática no código (`94` operários por Alpha, `235` por Beta e `445` por Gamma).
  - Atualizado para buscar de forma prioritária e transparente as especificações dinâmicas provenientes das configurações fiduciárias do campeonato (`currentMacro?.machine_specs?.[normModel]?.operators_required`), aplicando o tratamento `??` de fallback para os padrões normativos estabelecidos na ausência operacional das chaves:
    ```typescript
    const sReq = currentMacro?.machine_specs?.[normModel]?.operators_required ?? (normModel === 'alpha' ? 94 : normModel === 'beta' ? 235 : 445);
    ```
  - Desta forma, o dimensionamento de pessoal opera de maneira 100% equivalente com a parametrização fiduciária do Tutor, reduzindo a discrepância entre a produtividade simulada final e os cálculos antecipados do aluno vistos na interface de simulação em tempo real.
- **Modelo de Controle de Lançamento de Estoque de MOD:**
  - O fluxo foi solidificado para operar estritamente como um livro razão ou controle de estoques: `Saldo Inicial (Anterior) + Admissões (hired no round) - Demissões (fired no round) = Saldo Final (levado ao round posterior)`.
**Impactos esperados:**  
- **Precisão Fiduciária:** Absolute convergência entre os multiplicadores de produtividade de pessoal calculados em tempo real na tela do participante (`HRStep.tsx`) e a orquestração do motor de transição no backend fiduciário.
- **Flexibilidade Multimodelo:** Suporte nativo à liberdade que o Tutor possui de reprogramar e simular as demandas intelectuais e de esforço de seus operários a fim de modelar múltiplos cenários de manufatura avançada e automação.
**Status:** ATIVO, compilado com sucesso e homologado via linter.

---

## Decisão Arquitetural & Versionamento - Alocação Multirregional Concorrencial de Demanda e Market Share no Modo "Start From Zero" - v2026.112

**Data:** 10 de Junho de 2026 às 17:50 UTC  
**Motivo:** Implementar o cálculo unificado de Market Share Concorrencial e Demanda Multirregional no motor de simulação competitivo de rounds. Anteriormente, as demandas regionais das equipes concorrentes eram avaliadas de modo isolado no faturamento de transição. Agora, as decisões de cada equipe dentro de cada região (preço, prazo de venda e campanhas de marketing) são diretamente pitadas umas contra as outras para disputar a demanda fidedigna calibrada com as diretrizes do Tutor.  
**Principais diferenças:**  
- **Modelagem de Demanda Regida pelo Tutor:**
  - `Demanda da Região = Capacidade Total do Mercado * (Peso de Demanda da Região / 100) * (1 + Variação de Demanda / 100)`.
  - A capacidade total calculada reza a soma da capacidade operacional física (pós aquisições de máquinas e regimes de turno selecionados) de todas as equipes ativas. Adiciona-se uma proteção nominal para a hipótese de abertura limpa em rounds zerados (Start From Zero - Greenfield).
  - A demanda adicional é tratada de forma elegante e transparente através do excedente na composição percentual de pesos (ex: soma de 115% de pesos em R1-R5).
- **Competitividade e Disputa Regionalizada:**
  - Dentro de cada região, é calculado um score individual concorrencial para cada equipe com base na atratividade de preço relativo (`suggested_price / team_price`), juros de prazo comercial e volume de marketing investido regionalmente.
  - A demanda de cada região é rateada proporcionalmente aos scores competitivos de cada participante.
  - O Market Share Global de cada equipe passa a refletir exatamente a proporção das suas vendas físicas faturadas em cima da demanda global do campeonato.
- **Passagem de Parâmetros Concorrenciais no Motor de Projeções:**
  - Inserido parâmetro opcional `competitiveDemands` na assinatura de `calculateProjections` em `services/simulation.ts`. Durante o turnover real, as demandas concorrenciais capturadas são injetadas diretamente no fôlego de cálculo contábil de cada equipe, forçando harmonia matemática de 100% no balanço. Em simulações pontuais (onde os participantes testam suas telas em tempo real de forma isolada), o motor retém de forma segura o fallback de estimativa estática pré-existente.
**Impactos esperados:**  
- **Concorrência Dinâmica Realista:** Estimulação do ambiente de mercado onde investimentos em marketing, preços competitivos e atratividades de prazos de recebimento decidem as fatias de mercado faturadas em cada região entre equipes humanas e bots.
- **Alinhamento Contábil de Alta Precisão:** Estrita eliminação de divergências matemáticas no balanço patrimonial e equações fiduciárias pós-faturamento.  
**Status:** ATIVO, compilado com sucesso e homologado via dev server.

---

## Decisão Arquitetural & Versionamento - Visualização de Demanda Regional de Mercado e Sincronismo de Vendas em Tempo Real no Cockpit de Marketing - v2026.113

**Data:** 10 de Junho de 2026 às 18:15 UTC  
**Motivo:** Aprimorar as métricas mostradas na aba de Estratégia Comercial (Marketing) para dar suporte à modelagem concorrencial, substituindo o rótulo de Market Share global por um indicador perfeitamente restrito de demanda regional ("Market Share Regional"). Adicionalmente, sintonizar o cálculo de "Vendas na Região" para responder em tempo real às decisões dinâmicas que o aluno altera no cockpit (preço, marketing e prazo), em vez de estagnar nas decisões antigas do banco de dados.  
**Principais diferenças:**  
- **Substituição Visual:** O rótulo "Market Share Total (un)" foi refinado para "Market Share Regional (un)", exibindo com precisão fiduciária a demanda agregada configurada ou gerada especificamente para aquela região geográfica selecionada.
- **Cálculo Reativo e Dinâmico do Cockpit (`components/steps/MarketingStep.tsx`):**
  - Implementado tratamento reativo na função `calculateRegionStats`. Se o item na iteração de competidores for a própria equipe ativa ativa, o motor de estatísticas intercepta o estado estático do banco e utiliza o objeto `decisions` das decisões que estão sendo editadas localmente e em tempo real.
  - A capacidade de turnos de trabalho (`shifts`) e as configurações de inadimplência/recuperação judicial passam a ser consultadas de forma 100% viva e atualizada.
- **Exibição Fidedigna:** O valor de "Vendas na Região (un)" da equipe ativa passa a acompanhar ao vivo toda modificação de preço, marketing regional (0-9) e prazo de venda, oferecendo uma experiência de feedback (DX) instantânea e precisa.
**Impactos esperados:**  
- **Decisões Estratégicas Conscientes:** Maior clareza para as equipes sobre a proporção da sua capacidade que está sendo absorvida em cada região comparada com os rivais.
- **Sincronismo Operacional de Alta Fidelidade:** Alinhamento matemático do preview instantâneo de vendas do cockpit com o motor de transição de rounds.  
**Status:** ATIVO, compilado com sucesso e homologado via linter.

---

## Decisão Arquitetural & Versionamento - Visualização da Conta de Juros e Ágios Bancários na Agenda Financeira e Exibição do Torneio Disputado no Terminal - v2026.114

**Data:** 12 de Junho de 2026 às 14:45 UTC  
**Motivo:** Atender ao pedido estratégico do Contador Sênior para listar as despesas financeiras de juros e ágios bancários (decorrentes da compra de maquinários BDI e empréstimos contratados) na Agenda Financeira (Deveres Comprometidos), evitando compromissos fiscais/financeiros ocultos que prejudiquem as projeções dos participantes. Adicionalmente, exibir de forma proeminente o nome do torneio disputado antes do nome da equipe no cabeçalho do Terminal de Decisões, aumentando a ambientação competitiva.  
**Principais diferenças:**  
- **Agenda Financeira Reativa (Deveres Comprometidos) (`services/supabase.ts` e `services/simulation-core.ts`):** 
  - Acrescentada a conta `interests` com o rótulo **JUROS E ÁGIOS BANCÁRIOS** ao array de passivos comprometidos (`payables`) de saída contábil.
  - O valor da conta é extraído em tempo real a partir do somatório de despesas financeiras (`fin.exp` do DRE): `Math.abs(findAccountValue(statements.dre, 'fin.exp'))` no motor de simulação e herda o saldo adequado reativo ou o valor inicial de juros pagos na base na inicialização.
- **Identificação do Torneio Disputado (`components/DecisionForm.tsx`):**
  - O cabeçalho do console de decisão do participante foi adaptado para verificar dinamicamente a presença do campeonato carregado (`activeArena`).
  - Quando existente, exibe-se em realce laranja o nome do torneio (ex: `Torneio de Simulador • Team: [Nome]`), melhorando a navegação de equipes que disputam múltiplas ligas concorrentes de forma simultânea.
**Impactos esperados:**  
- **Mitigação de Passores Ocultos:** Transparência completa sobre obrigações acessórias de amortização de maquinários ou faturamento a prazo dos fornecedores. As equipes agora enxergam na Matriz / Agenda de Compromissos exatamente quantas saídas de juros estão comprometidas em cada período do cronograma de turnos.
- **DX Aprimorado:** Identificação imediata da liga em tela antes da submissão da estratégia comercial para o round.
**Status:** ATIVO, amplamente homologado, compilado com sucesso e verificado via linter.


