# 🗺️ ROADMAP DE INOVAÇÃO: MERCADO DE AÇÕES VIRTUAL (EMPIRION STOCK EXCHANGE)

## Versão do Documento: v1.0.0 (Planejamento Estratégico)
**Data:** 13 de Junho de 2026  
**Autores:** Equipe Multidisciplinar EMPIRION (PMP, Contador Sênior, Coordenador de Inteligência de Mercado, Arquiteto Sênior de UI/UX, Engenheiro de Software Sênior & DB Admin)

---

## 1. Visão Geral da Funcionalidade

Esta iniciativa visa transformar o **EMPIRION** em um ecossistema econômico mestre, convertendo as empresas virtuais criadas pelos participantes em empresas de capital aberto listadas em uma Bolsa de Valores integrada. 

Os participantes (e potencialmente especuladores externos ou robôs de mercado) poderão comprar, manter e vender ações de suas próprias empresas e de equipes concorrentes. O preço das ações flutuará de forma dinâmica de acordo com a **fiel performance contábil, financeira e socioambiental (ESG)** de cada empresa na simulação, combinada com a lei da oferta e da procura do mercado de capitais.

---

## 2. Parâmetros de Configuração do Torneio (Visão do Tutor)

No momento em que o Tutor estiver criando uma Arena (Championship ou Trial Arena), ele terá soberania absoluta para ditar as regras do mercado financeiro através de novos atributos de governança na tabela `championships` e `trial_championships`:

```sql
ALTER TABLE public.championships 
ADD COLUMN IF NOT EXISTS allow_stock_market BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stock_market_round_trigger INT DEFAULT 2, -- O round em que o IPO ocorre
ADD COLUMN IF NOT EXISTS stock_market_float_percentage NUMERIC(5,2) DEFAULT 25.00, -- % da empresa aberta ao mercado (Free Float)
ADD COLUMN IF NOT EXISTS stock_market_mode TEXT DEFAULT 'MOCK_SPECULATION'; -- 'MOCK_SPECULATION' | 'P2P_TRADING' | 'SANDBOX_HYBRID'
```

### Regras de Negócio Associadas:
1. **`allow_stock_market` (Habilitador de Capital):** Se `false`, o preço da ação (`share_price`) é meramente indicativo das métricas de valuation estáticas de cada rodada. Se `true`, a Bolsa de Valores é aberta no painel lateral das empresas.
2. **`stock_market_round_trigger` (O Momento do IPO):** Tipicamente, as empresas de simulação começam o Round 0 (P0) em modo fechado (Greenfield ou Ltda.). A partir deste round (por exemplo, Round 2 ou 3), a empresa passa por uma transição obrigatória para S.A. (Sociedade Anônima), recebendo recursos líquidos da abertura e flutuando em bolsa.
3. **`stock_market_float_percentage` (Percentual de Flutuação):** Qual parcela das ações da empresa será descarregada no mercado secundário para negociação aberta de terceiros, preservando o bloco de controle (Majoritário) na posse da própria equipe.

---

## 3. Mecânica Contábil e Financeira (Visão do Contador Sênior)

Em perfeita concordância com as normas brasileiras do **CPC (Comitê de Pronunciamentos Contábeis)** e internacionais do **IFRS (International Financial Reporting Standards)**, a mecânica da Bolsa obedecerá as seguintes premissas contábeis rígidas:

### A. O Valuation Intrínseco (Preço Base da Ação)
O preço da ação (`share_price`) não será flutuado apenas por especulação vazia. Ele será ancorado fiduciariamente em um algoritmo de Valuation Composto gerado pelas rotinas contábeis do simulador:

$$Valuation = (W_{EBITDA} \times EBITDA) + (W_{PL} \times Patrimônio\ Líquido) + (W_{ESG} \times E\_SDS\_Score) + (W_{DCF} \times DCF) - Passivo\ Descoberto$$

Onde os pesos ($W$) refletem o perfil do torneio (industrial, comercial, etc.), penalizando severamente empresas que entrem em distress financeiro (baixo *Altman Z-Score* e *Kanitz*) ou possuam pesada pegada de carbono (*Carbon Footprint*).

### B. Contabilização do IPO (Abertura de Capital)
No round de abertura, as equipes registrarão a subscrição e integralização de ações na DRE/Balanço:
- **Débito:** Ativo Circulante (Caixa e Equivalentes de Caixa) -> Recebimento do capital emitido.
- **Crédito:** Patrimônio Líquido (Capital Social) -> Pelo valor nominal das ações emitidas.
- **Crédito:** Patrimônio Líquido (Reserva de Capital / Ágio na Emissão de Ações) -> Pelo prêmio de mercado acima do valor fiduciário de P0.

### C. Distribuição de Dividendos e Juros sobre Capital Próprio (JCP)
O fluxo de caixa da equipe poderá deliberar sobre o pagamento de dividendos para reter acionistas virtuais e impulsionar a cotação:
- **Débito:** Patrimônio Líquido (Lucros Acumulados)
- **Crédito:** Ativo Circulante (Caixa/Equivalentes de Caixa)
- Impacto imediato: Reduz o caixa total da empresa física, mas injeta rentabilidade direta na carteira do investidor virtual, elevando o Índice de Retorno ao Acionista (TSR - Total Shareholder Return).

---

## 4. Engenharia de Dados e Banco de Dados (Visão DB Admin)

Para integrar a simulação de ordens clássica de uma corretora, utilizaremos as seguintes tabelas otimizadas e normalizadas no PostgreSQL do Supabase, prontas para as políticas de RLS (Row Level Security):

```sql
-- 1. TABELA DE ORDENS DE COMPRA E VENDA (LIVRO DE OFERTAS)
CREATE TABLE IF NOT EXISTS public.stock_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID REFERENCES public.championships(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    team_investor_id UUID, -- Se o investidor for outro time participante
    user_investor_id UUID REFERENCES public.user_profiles(id), -- Se o investidor for uma pessoa física/tutor
    target_company_id UUID NOT NULL, -- A empresa cuja ação está sendo negociada
    order_type TEXT CHECK (order_type = ANY (ARRAY['BUY'::text, 'SELL'::text])),
    execution_type TEXT CHECK (execution_type = ANY (ARRAY['LIMIT'::text, 'MARKET'::text])),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_limit NUMERIC(20,2), -- Preço máximo/mínimo estipulado para LIMIT orders
    status TEXT DEFAULT 'PENDING' CHECK (status = ANY (ARRAY['PENDING'::text, 'PARTIAL'::text, 'FILLED'::text, 'CANCELLED'::text])),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. HISTÓRICO DE NEGOCIAÇÕES (TIMESERIES PARA CANDLESTICKS)
CREATE TABLE IF NOT EXISTS public.stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID REFERENCES public.championships(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    buyer_team_id UUID,
    buyer_user_id UUID,
    seller_team_id UUID,
    seller_user_id UUID,
    company_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price_executed NUMERIC(20,2) NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CUSTÓDIA / PORTFÓLIO DOS PARTICIPANTES
CREATE TABLE IF NOT EXISTS public.stock_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID REFERENCES public.championships(id) ON DELETE CASCADE,
    investor_team_id UUID,
    investor_user_id UUID,
    company_id UUID NOT NULL,
    average_price NUMERIC(20,2) NOT NULL,
    quantity_held INTEGER NOT NULL CHECK (quantity_held >= 0),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_custody UNIQUE (investor_team_id, investor_user_id, company_id)
);

-- 4. POLÍTICAS DE RLS (ROW LEVEL SECURITY)
ALTER TABLE public.stock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_portfolios ENABLE ROW LEVEL SECURITY;

-- Leitura de ordens e transações é pública para todos os participantes do campeonato
CREATE POLICY "Leitura pública de ofertas" ON public.stock_orders
    FOR SELECT USING (true);

-- Apenas o próprio investidor pode criar/mutar suas ordens
CREATE POLICY "Gerência de ordens do investidor" ON public.stock_orders
    FOR ALL USING (
        (user_investor_id::text = auth.uid()::text)
        OR EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.supabase_user_id::text = auth.uid()::text
            AND up.role IN ('tutor', 'admin')
        )
    );
```

---

## 5. UI/UX do Mercado de Ações (Visão do Arquiteto de UI/UX)

Para deslumbrar os participantes e proporcionar uma experiência profissional imersiva de *wall street/farialima*, o design do painel de controle incorporará as tendências estéticas e ergonômicas mundiais de 2026:

### Diretivas Visuais e Arquitetura de Telas:
- **Painel de Cotações (Ticker Tape / Ticker Banner):** Um banner dinâmico de texto com as siglas das empresas fictícias listadas (ex: `IND_CORP`, `GREEN_ALU`, `PM_SOFT`) rolando sutilmente em verde/vermelho com as variações percentuais em tempo real no dashboard mestre.
- **Gráfico de Candlestick Operacional:** Utilização de `Recharts` ou `D3` integrados sob contêineres fluidos e responsivos para mostrar a variação do preço da ação ao longo de cada round e das decisões de compra intraprazo.
- **Order Book (Livro de Negociações) Estilo Glassmorphic:** Um painel de visualização translúcida mostrando as melhores ofertas de compra (em verde-menta neon) e as melhores ofertas de venda (em coral/vermelho-suave), facilitando a tomada de decisões imediatas de arbitragem.
- **Boleta de Execução Ultra-Sinalizada:** Painel de uma única tela de visualização com botões táteis amplos (targets de toque mestre de 48px para mobile) e inputs limpos para estipular a quantidade e confirmação sob rito fiduciário (Modais de dupla checagem ética).

---

## 6. Planejamento de Lançamento (Roadmap de Releases)

A implantação desta grande funcionalidade será executada de forma modular protegendo o kernel contábil básico do EMPIRION:

```
┌────────────────────────────────────────────────────────┐
│  FASE 1: ALGORITMO E EXPOSIÇÃO ESTÁTICA (MOCKUP)     │ -> Preço varia puramente baseado nos relatórios do round.
└───────────┬────────────────────────────────────────────┘
            ▼
┌────────────────────────────────────────────────────────┐
│  FASE 2: SIMULADOR DE AGENTES EXTERNOS (BOTS)          │ -> Robôs compram/vendem baseados no Valuation do Contador.
└───────────┬────────────────────────────────────────────┘
            ▼
┌────────────────────────────────────────────────────────┐
│  FASE 3: P2P REAL E LIVRO DE OFERTAS COLETIVO         │ -> Competição síncrona real de investidores.
└────────────────────────────────────────────────────────┘
```

1. **Sprint 1 (Fase 1):** Validação e modelagem do algoritmo complexo de preço com o Contador Sênior. Exposição simples do gráfico de preço no cockpit da empresa participante.
2. **Sprint 2 (Fase 2):** Inclusão de BOTS programados (Mercado Operacional Automatizado) que fornecem liquidez para a venda e compra das ações fiduciárias das rodadas.
3. **Sprint 3 (Fase 3):** Implementação de banco de dados SQL e segurança RLS para negociação direta entre as equipes na arena e o Tutor.

---

## 7. Próximos Passos Sugeridos para o Scrum Team

- [ ] **Discussão Fiduciária:** Definir o multiplicador ideal do Valuation de P0 para determinar o valor nominal mestre inicial (`initial_share_price`).
- [ ] **Mapeamento de Performance:** Analisar se o motor sínclinal do Node-Vite sofrerá latências com simulação de compra em massa e programar índices no PostgreSQL para isso.
- [ ] **Revisão de UI:** Integrar a prévia do Ticker Tape sob o cabeçalho mestre no configurador do Tutor (`TrialWizard.tsx`).

---

## 8. Internacionalização e Localização Global (i18n & Multi-Locale)

**Versão da Iniciativa:** v1.1.0 (Planejamento de Globalização)  
**Data:** 24 de Junho de 2026  
**Autores:** Equipe Multidisciplinar (PMP, Engenheiro de Software Sênior, UI/UX e Inteligência de Mercado)

### Diretrizes e Regras de Negócio de Tradução:
1. **Idioma Base (Core):** Português do Brasil (pt-BR) permanecerá como a fundação de desenvolvimento de conteúdo do simulador.
2. **Idiomas Alvo:** Inglês (en-US) e Espanhol (es-ES / es-MX).
3. **Escopo de Tradução:** Todas as telas de decisão (Supply, Factory, HR, Assets, Legal, Marketing, Finance), relatórios contábeis de saída (Balanço, DRE, Fluxo de Caixa) e mensagens didáticas emitidas pelas inteligências do Tutor e Oráculo de IA.
4. **Acoplamento Monetário:** O simulador herda a moeda regional cadastrada no ato da intervenção ou setup da arena (ex: USD, BRL, EUR, MXN), adaptando os símbolos contábeis dinamicamente sem forçar conversões fixas de câmbio, garantindo consistência técnica em qualquer mercado do mundo.

### Arquitetura de Software Proposta (Visão Engenheiro Sênior):
Para garantir uma transição extremamente limpa, rápida e de alto desempenho (DX excelente e baixo overhead de carregamento em produção), implementaremos o padrão de **Dicionários Estáticos de Tradução Baseados em Tipagem Estrita** antes de adicionar frameworks pesados de i18n, se necessário. 

Esboço da estrutura de arquivos planejada para o diretório `/src/locales/`:
- `pt.ts` -> Dicionário estático em português brasileiro.
- `en.ts` -> Dicionário estático traduzido para inglês.
- `es.ts` -> Dicionário estático traduzido para espanhol.
- `index.ts` -> Gerenciador unificado de contexto React (`LocaleProvider`) para troca instantânea de idioma em tempo de execução sem flicagem visual ou reloads de página.

---

