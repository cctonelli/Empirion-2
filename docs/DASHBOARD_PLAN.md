# Diretrizes de Padronização de Dashboards — EMPIRION

Este documento estabelece as regras de design, engenharia, contabilidade fiduciária, performance e ergonomia para a criação e manutenção de todos os painéis visuais (Dashboards) do ecossistema **EMPIRION**.

---

## 1. Visão Geral e Governança Ágil (PMP & Scrum)

Todos os painéis no ecossistema seguem uma divisão de camadas estruturadas sob governança tática com escopo e critérios bem delimitados:

1. **Estratégico:** Visão consolidada para tomadores de decisão macro (KPIs, índices globais de saúde).
2. **Tático:** Visão analítica por departamento (demonstrativos estruturados de Balanço, Margens, Estoque, RH, Câmbio).
3. **Operacional:** Visão imediata das ações correntes (auditoria de inputs, status e progresso de rounds).

*Nota Ágil:* Qualquer nova demanda de visualização segue o fluxo de refinamento em sprints junto ao Product Owner e será documentada neste plano antes de sua implementação.

---

## 2. Padrões de Design e Ergonomia (UI/UX Arquiteto)

* **Abordagem Sem Rolagem:** A grade das quatro categorias de painéis se ajusta dinamicamente às proporções vertical e horizontal usando grids compactos.
* **Resolução e Preenchimento:** Substituir percentuais flutuantes (`height="100%"`) por alturas rígidas de renderização controladas nos graficos do ApexCharts, prevenindo que eles entrem em colapso de dimensão-zero ou sobreposição de labels estruturais.
* **Cores Ousadas e Fiel Contraste (2026 Trends):**
  * *Contábil / Financeiro:* Amarelo / Ouro (`#FFD700`), Verde Esmeralda (`#1DE9B6`), Ciano (`#00FFFF`).
  * *Logística / Comercial:* Azul Ativo (`#3b82f6`), Laranja Vibrante (`#f97316`), Roxo Elétrico (`#8b5cf6`).
  * *Industrial / RH:* Amarelo Limão (`#CCFF00`), Rosa Choque (`#FF00FF`), Branco Gelo (`#ffffff`).
* **Micro-iterações e Motion:**
  * Uso de transições leves via `framer-motion` para entrada de cards (`duration: 500ms`).
  * Micro-estados de hover no menu lateral retrátil em transição de `72px` para `260px` sem re-fluir os gráficos centrais do canvas (padrão Overlay).

---

## 3. Estrutura e Métricas Financeiras CPC/IFRS (Contador Sênior)

* **Balanço Patrimonial:** Apresentação em blocos funcionais rigorosos:
  * Ativos Circulantes vs Não Circulantes.
  * Passivos de Curto Prazo vs Longo Prazo.
* **Demonstrativo do Resultado do Exercício (DRE):**
  * Alinhamento vertical claro: Receita Bruta -> Custos Industriais (CPV) -> EBITDA -> Lucro Líquido do Exercício.
* **Análise de Alavancagem e Rentabilidade:**
  * Gráficos específicos para o Retorno sobre o Patrimônio Líquido (ROE) e índices de endividamento de longo prazo.

---

## 4. Engenharia de Dados e Estrutura de Tabelas (DB Admin)

* **Políticas de RLS Securitárias:** Mapeamento tático do banco de dados protegendo segredos industriais das fórmulas de cada rodada.
* **Indexação Recomendada:** Criação de índices `BTREE` para as chaves estrangeiras `championship_id` e `team_id`, garantindo tempo de resposta sub-100ms em buscas históricas.
* **Rastreabilidade total:** Todas as tabelas devem manter `created_at` e `updated_at` ativos.
