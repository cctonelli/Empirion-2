# Arquitetura de Software - EMPIRION ORACLE
**Versão Arquitetural:** v2026-06-07 Obsidian Diamond Enterprise  
**Data:** 07 de Junho de 2026  
**Padrão Arquitetural:** Clean Architecture + Domain-Driven Design (DDD) + Vertical Slices por Setor

---

## 1. Visão Geral da Arquitetura

O **EMPIRION** é um simulador de ecossistemas corporativos e contábeis de alta fidelidade e robustez. Para suportar o seu crescimento exponencial sem o surgimento de "spaghetti code", a arquitetura foi desenhada combinando os princípios de **Clean Architecture** (independência de frameworks, testabilidade do core e regras de negócio puras) com os conceitos de **Domain-Driven Design (DDD)** (organização em torno de *Bounded Contexts*, *Aggregate Roots*, *Value Objects* e isolamento de conhecimento tático por setores). This architecture is critical to ensure that our calculation systems and accounting algorithms are fully protected from modifications to database schemas or UI frameworks.

### Princípios Universais Adotados:
1. **Independência de Frameworks (Clean Arch):** A UI (React) e a persistência (Supabase PostgreSQL / RLS) são tratados como detalhes externos e residem nas bordas da aplicação. Caso o banco de dados mude amanhã, o coração das regras matemáticas e contábeis de simulação não será afetado.
2. **Design Orientado ao Domínio (DDD):** Linguagem Ubíqua implementada em código, definição rígida de fronteiras de contexto (*Bounded Contexts*) e entidades ricas contendo comportamentos reais (em vez de modelos anêmicos de dados).
3. **Custeio e Simulação Isolados (Sectors):** Cada setor econômico (Industrial, Agronegócio, Mercado de Capitais) é modelado de forma autônoma. O orquestrador central de simulação não precisa entender as minutias de fabricação do setor industrial ou do manejo agrícola; ele apenas pilota o ciclo de transição de rounds alimentado por regras setorizadas plugáveis.
4. **Alta Produtividade & DX (Developer Experience):** Estrutura modular limpa que reduz a fricção de onboarding de novos engenheiros seniores e previne conflitos de merge em times ágeis multidisciplinares (Scrum).

---

## 2. Mapa Estrutural de Pastas (Árvore Definitiva)

Abaixo está detalhada a verdadeira árvore estrutural adotada para o projeto, organizando de forma cristalina as camadas do ecossistema:

```text
empirion-2/                          # Raiz do projeto (Repositório Principal)
├── README.md                        # Instruções rápidas de setup rápido e execução
├── PRD.md                           # Visão de Produto e Escopo de Negócio (Product Owner)
├── DOCUMENT.md                      # Master Index - Regras de negócios, decisões e versionamentos
├── CHANGELOG.md                     # Histórico técnico de entregas e deploys (Scrum Master)
├── CONTRIBUTING.md                  # Guia de contribuição e convenções de código para novos Devs
├── SECURITY.md                      # Diretrizes de Segurança, Auditorias e Políticas RLS
├── LICENSE                          # Licença de Distribuição (MIT)
├── package.json                     # Arquivo de Manifesto e Configuração de Scripts (Vite, Linter, Build)
├── tsconfig.json                    # Diretivas estritas de tipagem do Compilador TypeScript
├── vite.config.ts                   # Modificadores de Build e aliasing das pastas do projeto (@core, @sectors, etc.)
├── .env.example                     # Declarações e exemplos de variáveis de ambiente obrigatórias
├── .gitignore                       # Políticas de ignorar pastas geradas de build ou dados sensíveis
│
├── docs/                            # Documentação Técnica e Arquitetural Avançada
│   ├── ARCHITECTURE.md              # [Este Arquivo] Diretrizes Arquiteturais e Mapas de Fluxos
│   ├── SUPABASE.md                  # Fluxos, conexões, autenticação externa e integrações com Supabase
│   ├── DATABASE.md                  # Dicionário de dados, schemas das tabelas e diagramas ERD
│   ├── BUSINESS_RULES.md            # Regras e fórmulas contábeis (CPC/IFRS), de simulação e de Greve
│   ├── AUTH.md                      # Protocolos de Perfis (Tutors, Alunos, Bots), Sessões e Registros
│   ├── API.md                       # Protocolos de chamadas ao Gemini SDK, Integradores e chaves seguras
│   └── ROADMAP.md                   # Planejamento estratégico de próximos módulos e lançamentos
│
├── supabase/                        # Ambiente de Desenvolvimento Local e IaC do Supabase CLI
│   ├── config.toml                  # Arquivo de configuração de portas e serviços da instância local
│   ├── migrations/                  # Migrações versionadas com timestamps para evolução do PostgreSQL
│   └── seed.sql                     # Dados e tabelas semeados de fábrica para desenvolvimento ágil local
│
└── src/                             # Diretório Raiz de Código-Fonte
    ├── core/                        # Núcleo Imutável da Aplicação (Comum a qualquer simulador da empresa)
    │   ├── accounting/              # Motor Contábil Genérico (Balanço de Partidas Dobradas, Razonete, Validador)
    │   │   ├── domain/              # Entidades, Value Objects (ex: Moeda, ContaContabil, Lancamento)
    │   │   ├── application/         # Casos de Uso Contábeis (ex: calcularPassivoTotal, gerarDemonstracoes)
    │   │   └── infra/               # Adaptadores Contábeis Externos (ex: conversores de dados à interface UI)
    │   ├── simulation-engine/       # Motor Abstrato para Controle e Orquestração de Turnovers de Grandes Projetos
    │   │   ├── domain/              # Regras de transição fiduciárias, Entidade Rodada e Ecossistema
    │   │   ├── application/         # Casos de Uso do Motor (ex: processarTurnover, congelarRascunhosAlunos)
    │   │   └── events/              # Eventos de Domínio Internos (ex: RoundStarted, FinancialImbalanceDetected)
    │   ├── models/                  # Estruturas padrão e árvores financeiras de fábrica imutáveis
    │   └── templates/               # Parâmetros e perfis padrão de início projetados pelo Arena Tutor
    │
    ├── sectors/                     # Módulos Setoriais Isolados (Bounded Contexts de Atividades de Simulação)
    │   ├── industrial/              # Módulo do Setor Industrial (Atual Principal)
    │   │   ├── config.ts            # Parametrizações locais do setor (especificações de maquinários, turnos)
    │   │   ├── rules.ts             # Algoritmos específicos (Fórmulas do CPP, depreciação linear fiduciária, etc.)
    │   │   ├── financial-tree.ts    # Extensões específicas de nós do Balanço Patrimonial / DRE do Setor
    │   │   ├── domain/              # Entidades exclusivas (ex: Maquina, LoteProducao, OperadorHoras)
    │   │   ├── application/         # Casos de uso do setor (ex: comprarMaquinaFiduciaria, calcularMOL)
    │   │   └── ui/                  # Componentes complexos exclusivos do setor (ex: FactoryStep, MachineryShop)
    │   │
    │   ├── agribusiness/            # Bounded Context de Setores Agrícolas / Agropecuários (Mapeado e Isolado)
    │   ├── services/                # Módulo Secundário de Prestação de Serviços Contratuais e Alocação de Staff
    │   └── capital-markets/         # Futuros Bounded Contexts de Engenharia Contábil Financeira
    │
    ├── features/                    # Vertical Slices (Funcionalidades Globais organizadas por Casos de Uso)
    │   ├── auth/                    # Casos de uso de autenticação de alunos e tutores (telas, hooks, validações)
    │   ├── dashboard/               # Painéis de controle iniciais compartilhados, estatísticas transversais e menus
    │   ├── simulation/              # Visões de simulação ativa, simulador preditivo de rascunhos em tempo de execução
    │   ├── turnover/                # Telas e controles administrativos de execução de rodadas e processamento do round
    │   └── reports/                 # Exibição de relatórios contábeis, download de planilhas e Auditorias Fiscais
    │
    ├── components/                  # Componentes React Reutilizáveis (Camada de Visão de Baixo Nível)
    │   ├── common/                  # Componentes genéricos da aplicação (Gráficos Recharts, Wizard, Accordions)
    │   ├── ui/                      # Elementos atômicos primitivos de Design System (Botoes, Modals, Inputs)
    │   └── sector-specific/         # Componentes organizados para injeções dinâmicas de interface setoriais
    │
    ├── services/                    # Serviços e Adaptadores de Aplicação / Conectores
    │   ├── api/                     # Instâncias de conexões seguras de APIs (Supabase client, Gemini SDK proxies)
    │   ├── simulation-core.ts       # Executador e integrador global físico do processamento de simulações
    │   └── initialization.ts        # Inicializador determinístico de cenários de abertura P0 Greenfield e Bases
    │
    ├── types/                       # Declaradores Globais de Tipos TypeScript do Projeto
    │   ├── sector.ts                # Definições extensíveis para mapeamento de novos simuladores setoriais
    │   └── common.ts                # Tipos de utilitários, moedas, usuários e metadatas comuns do sistema
    │
    ├── lib/                         # Bibliotecas Extensões de Terceiros Configuradas (SupabaseClient, TailwindUtils)
    ├── hooks/                       # Hooks Customizados do React para Estados, Eventos e Gestão de Conexões de Clientes
    └── stores/                      # Gerenciamento de Estado Global do Frontend (Zustand / Controle de Estados Centralizados)
```

---

## 3. Mapeamento de Domínio e Subdomínios (Setores)

O EMPIRION distribui seu escopo de negócios por meio do conceito de **Subdomínios (Subdomains)** do DDD para manter cada setor de aprendizagem absolutamente focado nas suas peculiaridades contábeis e industriais:

```
                  ┌──────────────────────────────────────────────┐
                  │                EMPIRION CORE                 │
                  │   - Accounting Engine   - Admin Round Rules  │
                  └───────────────────────┬──────────────────────┘
                                          │
                  ┌───────────────────────┼──────────────────────┐
                  ▼                       ▼                      ▼
       ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
       │   Bounded Context    ││   Bounded Context    ││   Bounded Context    │
       │     INDUSTRIAL       ││     AGRIBUSINESS     ││   CAPITAL MARKETS    │
       │                      ││                      ││                      │
       │- CPP/CPV Calculation ││- Biological Assets  ││- Debt & Debentures   │
       │- Production Capacity ││- Harvest Cycles     ││- Share Issuance (IPO)│
       │- Machine Maintenance ││- Fair Value (CPC 29)││- Financial Valuation │
       └──────────────────────┘└──────────────────────┘└──────────────────────┘
```

1. **Subdomínio Núcleo (Core Domain):** O motor de contabilidade linear por partidas dobradas. Garante que qualquer lançamento que altere o ativo obrigatoriamente gere uma contrapartida correspondente no passivo ou patrimônio líquido do ecossistema, impedindo inconsistências contábeis. É protegido em `/src/core/accounting/`.
2. **Subdomínio de Apoio (Supporting Subdomain) - Simulação:** O simulador do ecossistema que transiciona rounds e coleta as decisões dos alunos. Não entende de física produtiva; ele apenas recebe os balanços transformados de cada equipe e consolida o ranking em tempo real. Localizado em `/src/core/simulation-engine/`.
3. **Subdomínio Genérico (Generic Subdomains) - Infraestrutura:** Manipulação de autenticação com cookies seguros, gravação remota no banco de dados, alertas disparados no Slack/Discord e relatórios gerados por inteligência artificial (Gemini SDK).

---

## 4. Direção de Dependências e Desacoplamento

Seguindo o princípio da **Inversão de Dependências (Dependency Inversion Principle)** da Clean Architecture, as dependências apontam estritamente de fora para dentro. A regra de ouro é: **As camadas internas não conhecem absolutamente nada sobre as camadas externas.**

*   **A camada de Domínio (`/src/core/accounting/domain/`)** contém apenas lógica contábil teórica imutável. Ela não importa o cliente do Supabase, não sabe que é exibida em React e é agnóstica a bancos de dados relacionais.
*   **A camada de Aplicação (`/src/core/accounting/application/`)** orquestra os fluxos de negócios contábeis e expõe portas/interfaces.
*   **As camadas de Infraestrutura (`/src/core/services/api/` ou `/src/lib/`)** implementam essas portas usando o Supabase, gerenciam retornos lidos do banco de dados e serializam entidades para salvamento de histórico.

---

## 5. Estratégias de Escalabilidade Contínua

### Workspaces e Preparação para Monorepo
Atualmente, o projeto é empacotado em um único serviço centralizado para maximizar a agilidade e performance. No entanto, a organização fiduciária em `/src/sectors/` foi desenhada para permitir que qualquer setor econômico seja extraído para um pacote NPM ou microsserviço independente com alterações negligenciáveis de escopo. 

### Aliases de Imports no Vite
Para evitar imports relativos caóticos (como `import ... from "../../../../core"`) que quebram builds nas refatorações, o arquivo `vite.config.ts` injeta e consome Aliases estritos mapeados no `tsconfig.json`:
*   `@core/*` correspondendo a `src/core/*`
*   `@sectors/*` correspondendo a `src/sectors/*`
*   `@features/*` correspondendo a `src/features/*`
*   `@components/*` correspondendo a `src/components/*`

---

## 6. Governança e Melhores Práticas de Desenvolvimento

No contexto da metodologia ágil **Scrum**, a coordenação de engenharia estabelece as seguintes obrigações para os desenvolvedores do time:
1. **Comentários de Negócio:** Códigos de cálculo (como em `simulation.ts`, `simulation-core.ts` e `initialization.ts`) devem conter extensivos comentários explicando a base econômico-financeira (CPC, IFRS) que sustenta os algoritmos de simulação.
2. **Fidelidade de Histórico:** Alterações em motores de cálculo críticas devem obrigatoriamente criar uma nova versão documentada na seção de Versionamento do arquivo `DOCUMENT.md` e em `CHANGELOG.md`.
3. **Migrações e RLS do Banco:** Toda alteração de schema nos ecossistemas do Supabase deve ser acompanhada de uma migration versionada na pasta `/supabase/migrations/` garantindo proteção absoluta via políticas de Row Level Security (RLS).

---

**Aprovado por:**  
- **PMP Principal (Project Management Professional)**  
- **Arquiteto de Software Sênior**  
- **Contador Sênior e Especialista IFRS**  
- **Engenheiro de Banco de Dados**  
**Status da Estrutura:** Aprovada e Ativa para Implementação Gradual.
