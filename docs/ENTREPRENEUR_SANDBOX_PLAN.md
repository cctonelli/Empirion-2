# Plano Diretor: Sandbox de Validação e Ideação para Empreendedores - EMPIRION ORACLE
## 🚀 Transformando o Simulador de Torneio em uma Plataforma de Reference de Playgrounds de Negócios Reais

- **Status:** **Proposta Estratégica & Design de Arquitetura (Aprovada pelo Conselho de Inovação)**
- **Versão do Plano:** `v1.2.0` (Governança: `v2026.129`)
- **Data:** 11 de Junho de 2026 às 17:00 UTC
- **Responsável:** Project Management Professional (PMP) & Conselho Multidisciplinar

---

## 1. Resumo do Entendimento
A proposta de elevar o **EMPIRION ORACLE** de um simulador de torneios corporativos concorrentes para uma **Plataforma de Referência com foco em Novos Empreendedores** é revolucionária e perfeitamente viável em nossa arquitetura atual. 

Muitos empreendedores naufragam nos primeiros anos por ausência de um modelo de viabilidade econômico-financeira (Business Plan) dinâmico e pela incapacidade de antever o impacto de suas decisões diárias (preço, prazo de compras, contratação, estoques e margem de contribuição) sobre o caixa operacional.

Com este plano, o **EMPIRION** assume um papel fiduciário estratégico: fornecer um **Playground Interativo e Inteligente (Dynamic Business Sandbox)** onde novos empreendedores possam cadastrar as especificidades e hipóteses de suas ideias de negócios locais (ou globais) e simular múltiplos rounds no tempo para colher projeções integradas de DRE, Balanço, Fluxo de Caixa e receber diagnósticos de inteligência acionáveis auditados pela **Gemini API (Oráculo Inteligente)**.

---

## 2. Visão de Negócio por Especialidade (Diretrizes de Equipe)

### 📊 1. Contador Sênior (Viabilidade, Capex/Opex e Capital de Giro)
A modelagem financeira para empreendedores em fase inicial precisa traduzir a dureza das métricas de viabilidade com linguagem simples, porém dotada de conformidade matemática (CPC/IFRS).
- **Inputs Essenciais do Empreendedor:**
  - **CAPEX Inicial (Investimento):** Investimentos em máquinas, instalações comerciais, marcas e patentes, bem como capital de giro fiduciário inicial necessário.
  - **Estrutura de Custos:** Custos fixos mensais (OPEX - aluguel, salários administrativos) e margens de custos variáveis (%) de insumos ou fornecedores.
  - **Premissas Comerciais:** Preço de venda pretendido por unidade, elasticidade de demanda esperada e prazo médio planejado para pagamentos e recebimentos (prazo a clientes vs. prazo de fornecedores).
- **Projeções de Viabilidade Contábil Automáticas:**
  - O motor do simulador calculará dinamicamente nas projeções de rounds:
    - **Ponto de Equilíbrio (Break-Even Point):** Quantas unidades ou receita nominal mínima o negócio precisa gerar todo período para neutralizar custos.
    - **VPL (Valor Presente Líquido) & TIR (Taxa Interna de Retorno):** Indicando de forma fiduciária a atratividade real do projeto sob uma Taxa Mínima de Atratividade (TMA) parametrizável.
    - **Payback Descontado:** O round exato de maturidade operacional onde o caixa líquido gerado supera o CAPEX fiduciário do dia zero.

### 🎯 2. Coordenador de Inteligência de Mercado (Market Sandbox e Competitividade)
Para que os cenários do empreendedor tenham aderência real ao mercado concorrente, disponibilizaremos o **Simulador Macro Bot**:
- **Ambientes de Mercado Predefinidos:** O empreendedor selecionará nichos (Ex: *Alimentação Saudável em Região Metropolitana*, *Indústria Tech B2B*, *Comércio de Vestuários em Cidade de Médio Porte*).
- **Motor Concorrente Inteligente:** O sistema gerará de forma randômica ou calibrada 5 a 10 marcas virtuais simuladas (concorrentes bots de IA) com base nas estatísticas históricas do segmento escolhido.
- **Análise de Elasticidade e Share:** Permite que o empreendedor execute aumentos nominais nos seus preços e anteveja a perda instantânea de Market Share e o deslocamento de sua margem em face das praças simuladas.

### 💻 3. Engenheiro de Software Sênior (Arquitetura e Integração com Gemini Core)
Nossa meta de DX e escalabilidade horizontal para esse módulo compreende criar a feature **EMPIRION Oracle Mentor (GenAI Context)**.
- **Core de Avaliação Assistida (Gemini API):**
  - Integramos um pipeline que captura a árvore financeira de simulação transitada do empreendedor (Balanço, DRE e Fluxo de Caixa gerada pelas partidas dobradas) e a envelopa num prompt de diagnóstico financeiro altamente treinado para a Gemini API.
  - O prompt injetará as diretrizes do **Contador Sênior** e do **Coordenador de Inteligência de Mercado** para extrair relatórios baseados em ações concretas do tipo: *"Seu prazo médio de recebimento de 45 dias está espremendo seu capital de giro. Negocie com seus fornecedores varejistas uma extensão para 30 dias de pagamento de compras para equalizar sua Liquidez Operacional"*.
- **Estruturação Funcional (Modularidade):**
  - O empreendedor poderá salvar "Cenários de Simulação" (Ex: Cenário Otimista com CAPEX elevado vs. Cenário Conservador Franquias) e ramificá-los de forma paralela acelerando a tomada de decisão do plano de negócios.

### 🗄️ 4. Engenheiro de Banco de Dados (Estrutura e Multi-Tenancy do Empreendedor)
A persistência do Sandbox no Supabase PostgreSQL deve garantir privacidade absoluta dos balanços projetados de cada autor (dados confidenciciais de inovação corporativa).
- **Modelo de Dados Replicável e Isolado:**
  - Criação de tabelas mapeando `entrepreneur_sandboxes` que armazenam o snapshot configurado pelo usuário.
  - Implementação de Políticas de RLS rigorosas onde o usuário somente consegue ler, atualizar ou excluir snapshots onde `user_id = auth.uid()`.
- **Versionamento de Cenários de Premissas:**
  - Possibilidade do empreendedor clonar um scenario a qualquer momento, gerando rastreabilidade histórica dos testes de estresse econômico de sua ideia original.

### 🎨 5. Arquiteto Sênior de UI/UX (O Cockpit de Ideação Intuitivo)
- **Painel Livre de Fricção (Zero Complexidade de Sistema):**
  - A interface abandonará termos exclusivamente voltados para campeonatos grandes de tutores. Apresentará um assistente em passadas (*Wizards*) de captação de dados das hipóteses da ideia de negócios do usuário de forma didática e elegante.
- **Dashboards Visualmente Impactantes:**
  - Uso de gráficos interativos baseados em Recharts combinando linhas de receita e custos cruzando com a barra do Ponto de Equilíbrio.
  - Uma área de trabalho esteticamente limpa no tom cinza carvão e off-whites acentuando fatias, prazos médios de recebimento e taxas de atratividade fiduciárias estruturadas.

---

## 3. Estruturação Conceitual dos Módulos do Sandbox

A entrega do Sandbox de Ideação de Negócios pode ser mapeada em três blocos operacionais acessíveis da plataforma:

```
  ┌─────────────────────────────┐
  │   1. Wizard de Premissas    │ ──► Cadastra CAPEX, custos variáveis,
  │   (Inputs Simples do Usuário)│     preço ideal e premissas de contratação.
  └──────────────┬──────────────┘
                 ▼
  ┌─────────────────────────────┐
  │ 2. Motor de Turnover Contínuo│ ──► Avança rounds fictícios de 1 a 12 (meses)
  │ (Física Contábil e Competit)│     simulando o ciclo financeiro e concorrência bot.
  └──────────────┬──────────────┘
                 ▼
  ┌─────────────────────────────┐
  │  3. Diagnóstico do Oráculo  │ ──► Gera o Score de Viabilidade Geral (SVE),
  │    (Gemini AI Mentor Core)  │     calcula TIR/VPL e dá insights de ajuste fino.
  └─────────────────────────────┘
```

---

## 4. Plano de Versões de Sandbox (Roadmap Tático)

| Pacote de Release | Finalidade Estratégica | Recursos Entregáveis | Versionamento Contábil |
| :--- | :--- | :--- | :--- |
| `sandbox-v1-wizard` | Captador de Cenários | Interface Wizard intuitiva para que o empreendedor cadastre premissas de seu negócio de forma visual sem se preocupar com debugar contabilidade pura. | `v2026.131` |
| `sandbox-v2-competitors` | Mercado Reativo | Ativação do motor de concorrência com bots virtuais locais configuráveis regulados por elasticidade e market share regional simulado. | `v2026.132` |
| `sandbox-v3-oracle` | Mentor Inteligente | Conector dedicado de IA usando a API do Gemini processando o fluxo acumulado para gerar orientações de ajustes fiscais e operacionais baseados em padrões de viabilidade. | `v2026.133` |

---

## 5. Próximos Passos Sugeridos

1. **Validação da Proposta de Sandbox:** O usuário examina o plano de ideação estruturado para integrar o modelo dinâmico à visão de negócios global da marca.
2. **Setup de Chaves e Rotas:** Criação das primeiras telas e endpoints focados na transformação de premissas estáticas de ideias em relatórios dinâmicos de maturidade empresarial.
3. **Calibração de Mentor Corporativo:** Ajuste do kernel de IA para interpretar árvores de relatórios produzidos, gerando insights comerciais e de estruturação tributária localizados.

---
*Lembrete de Governança: Este documento estratégico foi consolidado de acordo com o plano de evolução ágil da empresa sob o versionamento v2026.129. Consulte o Master INDEX (DOCUMENT.md) antes de prosseguir com implementações.*
