# Product Requirements Document (PRD) - EMPIRION ORACLE

## 📋 Controle do Documento
- **Produto:** EMPIRION ORACLE (v19.3 Sapphire)
- **Status do PRD:** Aprovado para Implementação e Evolução
- **Líder de Tecnologia:** Arquiteto Sênior Full-Stack
- **Propósito:** Consolidar todos os requisitos funcionais, não funcionais, arquitetura de software, infraestrutura de dados e regras de inteligência do motor simulador.

---

## 1. Visão Geral do Produto e Objetivos

O **EMPIRION ORACLE** é um simulador de "Digital Twin" de gestão contábil, industrial e financeira voltado para cenários de alta competitividade e capacitação corporativa de alto nível (MBA/Corporate Training). Através de um motor sequencial robusto de rodadas (Turnover Engine), as equipes tomam decisões e competem em mercados dinâmicos regulados por inteligência artificial e indexadores econômicos globais.

### 1.1 Missão e Objetivos Estratégicos
- **Fidelidade de Cenários:** Simular eventos contábeis, operacionais e de mercado com integridade fiscal absoluta baseada em padrões contábeis consagrados (DRE, DFC, Balanço Patrimonial).
- **IA Generativa Ativa:** Integrar inteligência neural ativa (Gemini API) para geração automatizada de relatórios analíticos personalizados (Oráculo) e mídias de opinião pública/tendências mercadológicas (Gazeta).
- **Proteção Integral de Dados:** Viabilizar disputas em larga escala com completo isolamento de escopo técnico, de dados e estratégico entre equipes em uma mesma arena.

### 1.2 Personas (Atores do Ecossistema)
1. **Player (Estrategista):** Membro de uma equipe industrial. Responsável por analisar dados históricos de rounds passados, interagir com o cockpit, planejar investimentos e submeter as decisões operacionais (Inputs).
2. **Arena Tutor (Orquestrador/Professor):** Criador e gerenciador de arenas competitivas. Possui visibilidade analítica irrestrita sobre as equipes, define indicadores macroeconômicos por rodada e gerencia o processamento das rodadas (Turnover).
3. **Market Observer (Avaliador):** Acesso estritamente observador para auditoria externa. Permite o acompanhamento de dados públicos consolidados sem capacidade de alteração ou visualização de informações confidenciais de equipes específicas.
4. **System Admin (Operador de Infraestrutura):** Permissões globais de bypass de segurança para correções de dados frios, manutenção de banco ou intervenções estruturais (`role = 'admin'`).

---

## 2. Visão Geral de Arquitetura e Integrações

O sistema baseia-se numa arquitetura híbrida de alta performance e desacoplamento (Clean Architecture), com backend distribuído focado nos serviços do Supabase e frontend em React 18 que executa simulações imediatas e renderiza interfaces ricas em micro-interações.

```
+-------------------------------------------------------------+
|                        Frontend UI                          |
|         React 18 + Vite + Tailwind CSS + Framer Motion       |
+------------------------------+------------------------------+
                               |
                               | (HTTPS / WSS / REST)
                               v
+------------------------------+------------------------------+
|                     Supabase Backend                        |
|       PostgreSQL | RLS Policies | Auth | Live Sync          |
+------------------------------+------------------------------+
                               |
                               | (Google GenAI TS SDK)
                               v
+------------------------------+------------------------------+
|                      Gemini Neural API                      |
|       Gemini 3 Pro (Oráculo) | Gemini 3 Flash (Gazeta)      |
+-------------------------------------------------------------+
```

### 2.1 Tecnologias Core
- **Desenvolvimento:** TypeScript strictly typed.
- **Frontend Engine:** React 18 e Vite (compilação otimizada, HMR desativado via sandbox de plataforma para estabilidade de renderização).
- **Animações e Transições:** `motion` de `motion/react` para animações fluidas, transições de steps de tomada de decisão e feedbacks táteis.
- **Visualização de Dados:** `recharts` e `d3` para mapeamento de tendências, market share, TSR e solvência dinâmica.
- **Bando de Dados:** PostgreSQL hospedado no Supabase.
- **Inteligência Artificial:** SDK `@google/genai` utilizando `process.env.GEMINI_API_KEY` (isolado no servidor) na orquestração dos modelos.

---

## 3. Modelo Contábil e Regras Industriais (Core Engine)

O motor de simulação contábil reside em `services/simulation.ts` e calcula com rigor de conformidade as decisões de produção, capex, opex e financiamentos.

### 3.1 Unidade Produtiva (Capacidade e Tecnologia)
As empresas gerenciam a infraestrutura fabril adquirindo e operando três modelos padrão de maquinários:

| Atributo | Máquina Alpha | Máquina Beta | Máquina Gamma |
| :--- | :--- | :--- | :--- |
| **Capacidade de Produção/Ciclo** | 2.000 Unidades | 6.000 Unidades | 12.000 Unidades |
| **Quadro Operacional Requerido** | 94 Operadores | 235 Operadores | 445 Operadores |
| **Vida Útil Declarada** | 40 Ciclos | 40 Ciclos | 40 Ciclos |
| **Depreciação de Máquina** | Linear (2.5% p.p) | Linear (2.5% p.p) | Linear (2.5% p.p) |

- **Aquisição de Equipamentos:** O efeito produtivo é imediato. Adquirir maquinário no período $T$ disponibiliza a correspondente capacidade técnica para processamento no mesmo período da simulação.
- **Padrão de Produtividade & Treinamento:** Adutos de capex novos exigem investimento em treinamento de no mínimo **5% do valor total do capex** de aquisição. O não cumprimento dessa regra acarreta uma penalidade imediata de **25% na produtividade** industrial do ciclo.
- **Capas Operacionais (Mão de Obra):** A produção do ciclo é limitada pelo menor valor entre: a capacidade nominal do parque fabril e a quantidade contratada de operadores disponíveis para o round.
- **Turno Extra (Overtime):** Permite estender em até **50% a capacidade nominal** do maquinário disponível, aplicando um acréscimo estatutário penalizador de **50% sobre o custo-hora padrão da Mão de Obra Direta (MOD)** apenas para as unidades adicionais operadas.

### 3.2 Fisiologia do Produto Acabado (PA)
- **Matérias-Primas por Unidade de PA:** Cada unidade requer fisicamente **3 unidades de MP-A** e **2 unidades de MP-B**.
- **Regra de Custeio de Estoques:** Utilização estrita do **Custo Médio Ponderado Móvel (WAC)** sobre matérias-primas e produtos acabados.
- **Demanda e Elasticidade-Preço:** A absorção regional de produtos acabados é determinada pelas estratégias de precificação, marketing e elasticidade configuradas nos parâmetros macroeconômicos regionais.

### 3.3 Logística, Comercialização e Distribuição
- **Custo de Distribuição:** Encargo logístico unitário calculado individualmente por unidade comercializada na região de destino.
- **Estocagem:** Tarifações específicas por unidade estocada ao término do ciclo para MP e PA.
- **PECLD e Inadimplência:** A Provisão para Crédito de Liquidação Duvidosa é aplicada única e exclusivamente sob as contas do faturamento operadas em termos de prazo (Credit Sales).

---

## 4. Gestão Financeira, Tributária e Solvência

### 4.1 Gestão de Suprimentos Corporativos
- **Juros do Fornecedor:** Incide sobre o total do volume de aquisições de MP efetuados nos prazos de liquidação a prazo (A VISTA + 50% ou Parcelado), adicionando o encargo financeiro de forma embutida na ficha de custos de aquisição do respectivo suprimento.
- **Compra de Emergência:** Ativada de forma imperativa pelo motor contábil caso o saldo somado de estoque inicial + suprimentos planejados para o round se mostre insuficiente para atender as metas produtivas estabelecidas pela gestão de turno.
  - **Prêmio punitivo:** Aplicação do prêmio de emergência (`special_purchase_premium`) acrescendo de forma direta o valor da unidade adquirida.
  - **Cumulabilidade:** Eventuais compras de emergência programadas sob opções de parcelamento a prazo acumulam os custos do juros de fornecedor e a tarifa de emergência.

### 4.2 Arquitetura Contábil das Emissões Fiscais (IVA e PPR)
- **Tributo sobre Valor Agregado (IVA):** Sistema de compensação não-cumulativa onde os créditos fiscais referentes a compras com incidência tributária são devidamente registrados sob contas do ativo circulante e abatidos na apuração e apuração periódica de obrigações tributárias.
- **PPR (Programa de Participação nos Lucros):** Definição arbitrária das equipes variando de **0 a 10% do LAIR**.
  - **Provisão Contábil:** O valor apurado no período $T$ é provisionado no passivo circulante em `liabilities.current.ppr_payable` e registrado como despesa do DRE.
  - **Efetividade Contábil:** A liquidação financeira da provisão de PPR se dá compulsoriamente no período subsequente ($T+1$), exceto em casos de desligamento operacional, onde o montante proporcional provisionado do colaborador demitido é liquidado com a rescisão em $T$.

### 4.3 Empréstimo Compulsório Automático
- **Condição de Disparo:** Se ao final do balanço o fluxo de caixa final computado resultar em valor menor do que zero, o motor ativa uma injeção de solvência garantida.
- **Condições Contratuais:** Cobrança indexada conforme a taxa TR do ciclo somado de ágio punitivo estipulado (`compulsory_loan_agio`).
- **Quitação de Passivo:** Quitado de forma prioritária e total logo no ciclo imediatamente subsequente, estornando capital das contas de investimento líquido.

---

## 5. Modelos Avançados de Saúde Financeira e IA

### 5.1 E-SDS v1.2 (Empirion Solvency Dynamics Score)
O modelo de solvência proprietário do simulador avalia a resiliência dinâmica e classifica a unidade sob uma escala semântica precisa de cores.

$$\text{E-SDS} = w_1 P_1 + w_2 P_2 + w_3 P_3 + w_4 P_4 + w_5 P_5 + w_6 P_6$$

#### Pilares de Medição ($P_n$):
1. **$P_1$ (Fluxo de Caixa Livre Operacional):** Capacidade de manter a planta saudável autonomamente sem refinanciamentos constantes.
2. **$P_2$ (Crescimento Sustentável):** Avaliação de receitas recorrentes contra endividamentos crescentes.
3. **$P_3$ (Análise DuPont & Margens):** Resiliência da margem EBITDA ponderada pela recorrência de mercado setorial.
4. **$P_4$ (Cobertura de Giro e Dias de Caixa):** Indicador de contingenciamento imediato por setor econômico.
5. **$P_5$ (Alavancagem e Concentração):** Despenalizador que mensura passivos totais em relação ao patrimônio líquido.
6. **$P_6$ (Volatilidade Cambial e de Receita):** Mede o desvio-padrão e estabilidade de geração de fluxo de caixa operacional livre do negócio.

- **Threshold Restritivo:** Se a relação $\frac{\text{Dívida Líquida}}{\text{EBITDA}} > 6.0$, o score sofre rebaixamento imediato compulsório para a faixa de perigo grave (Laranja/Vermelho), anulando demais ponderações positivas.
- **Classificação de Saúde Financeira:**
  - 🔵 **Azul (Superior):** $Score \ge 8.0$
  - 🟢 **Verde (Sustentável):** $5.5 \le Score < 8.0$
  - 🟡 **Amarelo (Sinal de Alerta):** $3.0 \le Score < 5.5$
  - 🟠 **Laranja (Crítico):** $1.5 \le Score < 3.0$
  - 🔴 **Vermelho (Insolvência):** $Score < 1.5$

---

## 6. Governança e Orquestração de Banco de Dados

### 6.1 Supabase RLS (Row Level Security)
Segurança robusta na proteção multi-inquilina (*multi-tenant*). Nenhuma leitura ou escrita pode passar sem identificação correspondente:

```sql
-- Exemplo de isolamento no nível de leitura de companhias para Players
CREATE POLICY select_company_by_team ON public.companies
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT p.supabase_user_id 
            FROM public.user_profiles p
            JOIN public.teams t ON t.championship_id = companies.championship_id
            WHERE p.role = 'player' AND t.id = companies.team_id
        ) OR auth.uid() IN (
            SELECT p.supabase_user_id 
            FROM public.user_profiles p
            WHERE p.role = 'admin' OR p.id = (
                SELECT c.tutor_id 
                FROM public.championships c 
                WHERE c.id = companies.championship_id
            )
        )
    );
```

### 6.2 Estrutura e Práticas Relacionais
- **Normalização Escrita:** Adesão à Terceira Forma Normal (3FN). Dados de transação e logs de auditoria organizados para manter a indexação focada e otimizada (`idx_companies_championship_round`, `idx_audit_log_timestamp`).
- **Campos Mandatórios de Auditoria:**
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `deleted_at` (TIMESTAMPTZ para soft deletes)
  - `created_by` (UUID)
  - `updated_by` (UUID)

---

## 7. Requisitos Não Funcionais (NFR)

- **Latência de Simulação:** O cálculo sequencial e total de uma rodada consolidada com todas as equipes participantes na arena deve rodar em tempo de execução inferior a **2.5 segundos** no servidor de banco.
- **Consistência de Clientes:** Prevenção total de re-renders infinitos geridos por hooks de interface instáveis no cockpit de decisão. Os de dependências em `useEffect` devem centrar-se exclusivamente em tipos primitivos e memoização estrita de funções de simulação.
- **Acessibilidade Standard:** Cumprimento de taxas de contraste AA do W3C. Tipografia de alta leitura unindo Inter (interface corporativa), Space Grotesk (títulos e display) e JetBrains Mono (precisão de representação de contas no Strategic Hub).
- **Abstração de SDK de IA:** Uso exclusivo do SDK oficial da Google `@google/genai` com tratamento elegante de fallbacks (mensagens de alerta para o usuário) caso chaves corporativas não estejam preenchidas temporariamente.

---

## 8. Histórico de Versões e Evolução do Produto

O plano de evolução do ecossistema é mantido de forma explícita e sequencial na governança de engenharia:

### v2025-10
*Implementação preliminar de solvência automática (Empréstimo Compulsório com juros TR).*

### v2025-12
*Inclusão da métrica `share_price` (Valor da Ação) derivada do Patrimônio Líquido real e substituição do modelo clássico de Kanitz pelo Altman Z''-Score calibrado para mercados emergentes corporativos.*

### v2026-03
*Refinamento e entrega das diretrizes de PECLD sob vendas a prazo regionais, estruturação detalhada dos juros de fornecimento e ágio para suprimento emergencial automatizado.*

### v2026-04 (Release de Segurança e Transparência da Gazeta)
*Reforço geral de políticas granulares de segurança RLS no arquivo `database_rls.sql` para user profiles, championships e equipes. Sincronização inteligível de reajustes do cronograma de custos exibido na Oracle Gazette no início imediato de rodadas reais (P0 -> P1).*
