# 📊 Plano de Dashboards Dinâmicos e Histórico & Projeções (DASHBOARD_PLAN.md)

Este documento centraliza as definições de negócios, arquitetura, design tokens, regras de governança e guias de implementação para a nova experiência consolidada de **Dashboards Dinâmicos (Histórico & Projeções)** do EMPIRION ORACLE.

---

## 📅 Controle de Governança e Versionamento

- **Projeto:** EMPIRION ORACLE (Mapeamento Analítico v2026.130)
- **Status:** Em Desenho e Implementação
- **Responsável pela Governança:** Project Management Professional (PMP)
- **Time Multidisciplinar Responsável:**
  - **Contador Sênior:** Validação de taxas, demonstrativos DRE/Balanço e Heatmap Contábil sob CPC/IFRS.
  - **Coordenador de Inteligência de Mercado:** Regras de elasticidade regional, market share anônimo vs. identificado e precificação.
  - **Engenheiro de Software Sênior:** Construção de componentes modulares, integração ApexCharts de alta performance e DX excelente.
  - **Engenheiro de Banco de Dados:** Mapeamento de RLS, filtragem em cascata e consistência fiduciária de dados históricos.
  - **Arquiteto de UI/UX:** Definição da paleta neon sobre fundo azul profundo, redução de paddings, tooltips e design retrátil.

| Data | Versão | Autor | Alterações / Decisões Importantes |
| :--- | :--- | :--- | :--- |
| **17/06/2026** | `v2026.130` | *PMP & Equipe* | **Criação do Plano Estratégico de Dashboards.** Definição de 4 views principais (MACROECONOMICS, FINANCIAL & ACCOUNTING, LOGISTICS & MARKET, INDUSTRIAL & HR) com suporte a Filtros Globais de Governança Tática e Identidade de Equipes, alternância de séries por Dropdown interno de gráficos e zoom detalhado via modal. |

---

## 🚀 1. Conceito do Layout e Ergonomia (Zen Mode)

Para oferecer uma visualização limpa, livre de ruído e sem escrolagem na tela desktop clássica:
1. **fixed inset-0 viewport:** O painel de dashboards cobre a tela inteira quando invocado pelo cockpit.
2. **Abordagem Sem Rolagem:** A grade das quatro categorias de painéis se ajusta dinamicamente às proporções vertical e horizontal usando grids compactos.
3. **Sidebar Retrátil (Collapsible):** Menu vertical à esquerda com o logotipo do EMPIRION, botão de toggle (Toggle Collapse) com animações fluidas via `motion`, itens de navegação dedicados e botão para voltar ao cockpit principal.
4. **Acabamentos Visuais:** Vidro fosco sutil, sombras ricas e bordas curvas orgânicas.

---

## 🎨 2. Design Tokens e Paleta de Cores Neon

### Cores Estruturais
* **Fundo de Tela (Canvas):** Azul ultra-profundo (`#060B13`).
* **Fundo de Blocos de Gráficos:** Azul escuro acinzentado de alto contraste (`#0E1726` ou `#051523`).
* **Fundo de Cards de KPI:** Azul-escuro (`#1E1E2F`).
* **Texto Primário/Títulos:** Branco Puro (`#FFFFFF`).
* **Texto Secundário/Legendas/Rótulos:** Cinza Claro Azulado (`#E0E0E0` ou `#FFFFB5` em realce).

### Paleta Funcional Neon
* **Giro de Estoque/Eficiência:** Chartreuse Neon (`#DFFF00`)
* **Liquidez/Giro Positivo:** Azul Elétrico (`#00FFFF`)
* **Destaques de Crescimento/Produtividade/Metas:** Verde Neon (`#39FF14`)
* **Inadimplência/Falência/Zonas Críticas:** Vermelho Neon (`#FF073A`)
* **Estrutura de Capital/ROE:** Violeta/Índigo Neon (`#8F00FF` / `#4B0082`)
* **Ajustes Moderados/Custos Gerais/Risco Secundário:** Laranja Neon (`#FF5F1F`)

---

## 🛡️ 3. Filtros Consolidados de Governança e Identidade

Todos os dashboards herdam parâmetros globais que filtram os dados antes do carregamento gráfico:

### A. Governança Tática (Filtro por Nível de Visibilidade)
Definido pelo Tutor ao configurar as premissas concorrenciais da Arena:
1. **Baixa (Sigilosa):** Equipe lê estritamente seus próprios dados operacionais e contábeis. Concorrentes aparecem zerados ou omitidos.
2. **Média (Padrão):** Exibe apenas dados agregados do campeonato. Exemplo: Média concorrencial ou Market Share global, sem detalhar balanços alheios.
3. **Alta (Transparente):** Libera indicadores estratégicos limitados (ex.: preço médio regional e volume de mercado).
4. **Total (Open Data):** Desbloqueia visibilidade total das séries históricas de todas as marcas competindo (DREs, Balanços, Estoques).

### B. Identidade de Equipes
1. **Anônima:** Os nomes das equipes concorrentes são mascarados dinamicamente nos gráficos e tabelas para marcas padrão ("Time 1", "Time 2", "Op. Bravo", etc.).
2. **Identificada:** Utiliza os nomes e cores reais das equipes cadastrados na base de dados.

---

## 📊 4. Detalhamento Técnico das 4 Visualizações

### MACROECONOMICS (Variáveis de Mercado Externo)
* **Ativo Principal:** Candlestick de Flutuação Cambial (BRL, USD, EUR, GBP, CNY, BTC) ao longo das rodadas.
* **ICE × Inflação × Variação de Demanda:** Linhas finas cruzadas correlacionando o crescimento conjuntural com o apetite do consumidor.
* **IVA (Compras vs. Vendas):** Barras agrupadas com cores complementares comparando crédito e débito fiduciário.
* **Tarifas de Exportação:** Matriz/Heatmap regional (Brasil, EUA, Euro, UK, China, BTC).
* **Evoluções do PIB Regional:** Gráfico de áreas preenchendo o quadrante inferior com curvas de expansão/recessão econômica.

### FINANCIAL & ACCOUNTING (Foco Contábil CPC/IFRS)
* **Linha Superior:** 6 Scorecards Compactos (Ativo, Passivo, PL, Capital Social, Lucro Acumulado, Endividamento CP/LP).
* **Balanço Comparativo:** Linhas finas de evolução contábil cruzadas com barras empilhadas para representar o endividamento estrutural.
* **DRE Comparativo:** Barras agrupadas (Faturamento Bruto, CPV, Lucro Líquido).
* **Heatmap Contábil (Células Coloridas automaticas):** Matriz de rounds x índices (Liquidez Corrente, Endividamento, ROE, Margem Líquida, Giro do Ativo).
* **Estrutura DuPont:** Análise e dispersão de drivers de rentabilidade por equipe.

### LOGISTICS & MARKET (Fatiamento de Demanda & Estoques)
* **Cards Superiores:** Gauges circulares (RadialBar) para Market Share ativo, demanda atendida e conversão promocional de marketing.
* **Market Share by Team:** Gráfico de rosca com detalhamento textual ao lado.
* **Vendas vs. Preço de Concorrência:** Gráfico de dispersão (Scatter Plot) traçando splines de correlação preço-volume-elasticidade.
* **Crescimento de Share:** Matriz Heatmap de flutuação de market share acumulativa por rodada.

### INDUSTRIAL & HR (Recursos Humanos & Produção)
* **Capacidade vs. Realizado:** Gráfico de colunas empilhadas mostrando ociosidade e horas extras de fábrica por round.
* **Controle de Estoque (Heatmap):** Rastreio de dias de segurança e giro físico de Matéria-Prima A, B e Produtos Acabados.
* **Painel de Incentivos & P&D:** Gráfico de radar (Spider Chart) cruzando investimentos em treinamento, PPR, bônus, salários-base e inovação (P&D) entre as marcas.
* **Evolução Salarial:** Estatística comparativa cruzando com piso indexado pela inflação fiduciária acumulada.

---

## 🛠️ 5. Práticas Técnicas Obligatórias de Visualização
* **Sem Rótulo de Dados:** Desabilitar rótulos estáticos no topo dos gráficos (`dataLabels: { enabled: false }`) para manter o visual limpo.
* **Acabamento nas Bordas:** Reduzir margens e espaçamentos internos para quase 0px, abrindo espaço visual máximo ao canvas do gráfico.
* **Comutação de Gráficos por Dropdown:** Cada widget traz um seletor sutil no canto superior para trocar a série de dados exibida (e.g., Balanço Patrimonial vs. Ativo-Passivo).
* **Zoom em Modais:** Ícone de expansão de tela cheia que abre um modal do Radix/Dialog clonando o gráfico em alta resolução para inspeção.
* **Tooltips Ricos:** Configurar tooltips robustos para mostrar detalhadamente porcentagens de variação (%) e valores monetários formatados.
