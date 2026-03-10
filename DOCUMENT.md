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
- **Tributação:** 
  - Imposto de Renda de 25% sobre o lucro tributável.
  - **IVA (v2026-03.4):** Sistema de débito e crédito Gold Standard. O crédito das compras do período é reconhecido no ativo *antes* da apuração, garantindo compensação integral.
- **PPR (v2026-03.6):** Participação nos Lucros (0-20% do LAIR) provisionada no Passivo Circulante (`ppr_payable`) no período de apuração e paga integralmente no período seguinte. Em caso de demissão, o PPR proporcional provisionado é liquidado imediatamente junto com a rescisão.
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
- **E-SDS v1.2 (Empirion Solvency Dynamics Score - v2026-03.2):** Modelo proprietário de solvência dinâmica focado em fluxo de caixa real, dinâmica de rodadas e diferenciação entre estratégia e erro.
  - **Fórmula Base:** `E-SDS_raw = (W1×P1) + (W2×P2) + (W3×P3) + (W4×P4) + (W5×P5) + (W6×P6)`
  - **Pilares (P):**
    1. **P1 (FCO Livre):** `(FCO - CapEx Manut - Juros - Impostos) / (Passivo Circulante + Despesas Projetadas)`. Avalia a capacidade de honrar compromissos imediatos com caixa próprio.
    2. **P2 (Sustentabilidade):** `MA3(Δ Receita) / (Custo da Dívida × Alavancagem Efetiva)`. Verifica se o crescimento médio de 3 rodadas justifica o custo do capital de terceiros.
    3. **P3 (Margem + Recorrência):** `(EBITDA + (Receita × %Recorrência)) / Receita`. Mede a resiliência. Defaults: 60% (Serviços), 20% (Agro), 10% (Indústria).
    4. **P4 (Dias de Caixa):** `10 × (1 - e^(-Dias de Caixa / K))`. K=90 (Agro), 60 (Indústria), 45 (Serviços). Pontua a liquidez imediata.
    5. **P5 (Alavancagem):** `max(0, (Passivo Total / PL) - 3) × (1 + %Dívida CP)`. Penaliza o endividamento excessivo e a concentração no curto prazo.
    6. **P6 (Volatilidade):** `CV(FCO) × Multiplicador`. Penaliza a instabilidade crônica na geração de caixa (0.8 Agro, 0.5 Ind, 0.3 Serv).
  - **Pesos Dinâmicos (W):**
    - **P1:** 4.0 | **P2:** 3.0 | **P3:** 2.0 | **P4:** 1.5
    - **P5 (Penalizador):** -3.0 (Indústria/Agro) ou -2.5 (Serviços).
    - **P6 (Volatilidade):** Multiplicador de CV: 0.8 (Agro), 0.5 (Indústria), 0.3 (Serviços). Pesos finais: -2.0 (Agro), -1.2 (Indústria), -0.8 (Serviços).
  - **Threshold Hard:** Se `Dívida Líquida / EBITDA > 6.0`, o score é automaticamente rebaixado para a zona de perigo (Laranja/Vermelho), independentemente dos outros pilares.
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

### v2026-03.1 - Refinamento de PECLD e Mix de Prazo
- **Data:** Março de 2026
- **Motivo:** Ajuste na lógica de inadimplência (PECLD) para incidir apenas sobre vendas a prazo e inclusão de mix regional de recebimento (A VISTA, 50%, 33%+33%).
- **Diferenças:**
  - PECLD agora é calculado exclusivamente sobre a parcela de vendas a prazo (Credit Sales).
  - Implementação de 3 termos de recebimento por região: A VISTA (100% caixa), A VISTA + 50% (50% caixa), A VISTA + 33% + 33% (33% caixa).
  - Atualização do motor de simulação (`simulation.ts`) para processar vendas e fluxo de caixa de forma regionalizada.
- **Status:** Em produção.

### v2026-03.2 - Financiamento BDI e Ativos Fabris
- **Data:** Março de 2026
- **Motivo:** Implementação de regras específicas para aquisição/venda de máquinas, financiamento BDI e impacto de treinamento na produtividade.
- **Diferenças:**
  - **Financiamento BDI:** 4 rounds de carência (apenas juros) + 4 rounds de amortização (principal + juros). Implementada a **mutação de parcelas**, onde o principal a vencer no próximo round é reclassificado de Longo Prazo para Curto Prazo no Balanço Patrimonial.
  - **Venda de Máquinas:** Deságio lançado como Despesa Não Operacional; entrada de caixa líquida no DFC.
  - **Aquisição de Máquinas:** Efeito **imediato** na produção; novas máquinas já contribuem para a capacidade fabril no mesmo round da compra.
  - **E-SDS v1.2:** Refinamento do motor de diagnóstico financeiro:
    - **Pesos Dinâmicos:** Pesos de Alavancagem e Volatilidade agora variam por setor (Indústria/Agro vs Serviços/SaaS).
    - **Threshold Hard:** Se Dívida Líquida / EBITDA > 6.0, o score é forçado para zona de perigo (Laranja/Vermelho).
    - **Top Gargalos:** Identificação dos 3 principais detratores do score no dashboard.
    - **Pedagogia:** Insights traduzidos para linguagem simples e direta.
    - **Consistência:** Tratamento de dados faltantes com flag de "estimado".
  - **Treinamento:** Investimento obrigatório para novas máquinas; penalidade de 25% na produtividade se investimento < 5%.
  - **Capacidade:** Restrição de produção baseada na disponibilidade de operadores vs necessidade das máquinas.
- **Status:** Em produção.

### v2026-03.5 - Kernel v19.1: Decisões Dinâmicas & Recuperação Judicial
- **Data:** Março de 2026
- **Motivo:** Integração total dos inputs do `DecisionForm.tsx` ao motor de simulação, garantindo que todas as escolhas das equipes tenham impacto financeiro e operacional real.
- **Diferenças:**
  - **Recuperação Judicial (RJ):** Implementação de status de crise profunda. Se ativado:
    - Queda de 15% na demanda (estigma de mercado).
    - Ágio de 50% nas taxas de juros de empréstimos existentes.
    - Bloqueio total de novos financiamentos (BDI e Manuais).
    - CapEx limitado a 40% do valor solicitado (restrição de crédito).
  - **Gestão de Suprimentos:**
    - **Payment Type:** Escolha entre A Vista (100% caixa), 30 dias ou 60 dias (100% Fornecedores no Passivo).
  - **Produção Extra:** Implementação de turno extra (Hora Extra) que aumenta a capacidade mas penaliza o custo da MOD em 50% para as unidades excedentes.
  - **P&D Dinâmico:** Investimento em Pesquisa e Desenvolvimento agora é uma porcentagem direta da receita, permitindo estratégias de inovação agressivas.
  - **Recursos Humanos:**
    - **Salário:** Equipes podem definir o salário nominal, impactando diretamente o custo da MOD e OPEX.
    - **PPR Dinâmico:** Percentual de participação nos lucros (0-20%) definido pela equipe.
    - **Bônus de Produtividade:** Adicional sobre a folha para incentivar eficiência.
  - **Financeiro:**
    - **Empréstimos Manuais:** Processamento de solicitações de empréstimo com prazos de 6, 12 ou 24 rounds.
    - **Aplicações Financeiras:** Possibilidade de investir excedente de caixa para gerar rendimentos financeiros.
    - **Juros de Prazo:** Receita financeira gerada sobre as vendas a prazo (Term Interest Rate).
- **Status:** Em produção.

### v2026-03.6 - Provisionamento de PPR e Rescisão Proporcional
- **Data:** Março de 2026
- **Motivo:** Alinhamento contábil com o princípio da competência e realismo no fluxo de caixa de demissões.
- **Diferenças:**
  - **PPR (Provisionamento):** O PPR calculado na rodada atual (0-20% do LAIR) é provisionado na conta `liabilities.current.ppr_payable` (Passivo Circulante) e reconhecido como despesa no DRE.
  - **PPR (Pagamento):** O pagamento do PPR ocorre integralmente na rodada subsequente à sua apuração, saindo do caixa via `cf.outflow.payroll`.
  - **Rescisão:** Em caso de demissão, o colaborador recebe:
    - Salário do período + Multa Rescisória (1 salário base).
    - **PPR Proporcional:** A parcela do PPR que já estava provisionada no passivo (referente ao lucro de períodos anteriores) é liquidada imediatamente na rescisão.
  - **Impacto E-SDS:** Melhora a fidelidade da alavancagem (baixa correta do passivo) e reflete o custo real de saída de talentos no FCO.
- **Status:** Em produção.

### v2026-03.7 - Refatoração UI/UX: Cockpit & Strategic Hub v18.5
- **Data:** Março de 2026
- **Motivo:** Aprimorar a visualização estratégica e a experiência do usuário, transformando dados complexos em insights acionáveis.
- **Diferenças:**
  - **Cockpit Operacional (Dashboard):**
    - Implementação de **Glassmorphism** e hierarquia visual avançada nos KPIs superiores.
    - **E-SDS Diagnostic:** Tooltip interativo com insights da IA, identificação de gargalos e telemetria em tempo real.
    - **Sidebar Intel Pulse:** Monitoramento de histórico de patrimônio, efeito tesoura e status do Business Plan com feedback visual dinâmico.
  - **Decision Terminal (DecisionForm):**
    - Navegação por passos refatorada com animações fluidas (`framer-motion`) e ícones semânticos.
    - **War Room Header:** Visualização consolidada de EBITDA projetado, Caixa Final e E-SDS simulado via IA.
    - **Wizard UX:** Cabeçalhos de seção didáticos e cards de input com feedback tátil e visual.
  - **Strategic Hub (FinancialReportMatrix):**
    - Relatórios financeiros com design de alta fidelidade, bordas suaves e tipografia mono-espaçada para precisão.
    - **Trend Intelligence:** Indicadores de tendência (variação %) integrados diretamente nas linhas de KPIs estratégicos.
    - **Audit Visualization:** Diferenciação clara entre dados históricos auditados e projeções preditivas.
- **Status:** Em produção.

### v2026-03.8 - Agenda de Compromissos Financeiros (Cash Flow Commitments)
- **Data:** Março de 2026
- **Motivo:** Fornecer às equipes uma visão clara dos direitos e deveres já comprometidos no Balanço Patrimonial que impactarão o Fluxo de Caixa futuro.
- **Diferenças:**
  - **Agenda Financeira:** Novo relatório no Strategic Hub que consolida:
    - **Direitos (Receivables):** Contas a Receber (Clientes), Aplicações Financeiras e IVA a Recuperar.
    - **Deveres (Payables):** Fornecedores, Empréstimos (CP/LP), Imposto de Renda a Pagar, Dividendos a Pagar, PPR a Pagar e IVA a Recolher.
  - **Correção Contábil (DFC):** O Fluxo de Caixa Projetado agora liquida corretamente o **Imposto de Renda** provisionado no período anterior (`prevTaxes`), seguindo o regime de caixa para pagamentos de tributos.
  - **Transparência:** Facilita o planejamento financeiro ao separar o que é "geração de caixa operacional do período" do que é "liquidação de compromissos passados".
  - **Database (v19.1):** Adição das colunas `total_receivables` e `total_payables` nas tabelas `companies` e `trial_companies` para telemetria direta e auditoria rápida.
- **Status:** Em produção.
