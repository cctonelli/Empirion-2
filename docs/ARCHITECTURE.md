# Arquitetura do Sistema - EMPIRION ORACLE

## Visão Geral
O EMPIRION é construído sobre uma arquitetura Full-Stack moderna, focada em alta fidelidade de simulação e escalabilidade.

## Stack Tecnológica
- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion.
- **Backend:** Supabase (PostgreSQL + Auth + Realtime).
- **Inteligência Artificial:** Gemini 3 Pro (Oráculo) e Gemini 3 Flash (Bots/Gazeta).
- **Simulação:** Simulation Kernel em TypeScript (`services/simulation.ts`).

## Componentes Principais
1. **Simulation Kernel:** Responsável pelo processamento sequencial das rodadas.
2. **Oracle Intel:** Integração com Gemini para análise de balanços e insights estratégicos.
3. **Cockpit UI:** Interface de alta densidade de dados para tomada de decisão.

## Fluxo de Processamento de Rodada (Turnover)
O motor de simulação (`calculateProjections`) segue estas fases:
1. **Financial Adjustment:** Reajustes de preços e inflação.
2. **Asset Management:** Processamento de CapEx/OpEx.
3. **Production Engine:** Cálculo de CPP e consumo de MP.
4. **Statements:** Geração de DRE, DFC e Balanço Patrimonial.
5. **Solvency Check:** Cálculo de Altman Z''-Score e E-SDS.
6. **Governance:** Auditorias e bônus.


Empirion-2 (Raiz do Projeto) https://github.com/cctonelli/Empirion-2
├── 📂 components/               # Componentes reutilizáveis da interface (UI)
├── 📂 docs/                     # Documentação técnica e arquitetura do sistema
├── 📂 hooks/                    # Custom Hooks do React para gerenciar estado e lógica
├── 📂 pages/                    # Páginas e telas principais da aplicação
├── 📂 public/                   # Arquivos estáticos públicos
│   └── 📂 locales/              # Arquivos de tradução/internacionalização (i18n)
├── 📂 services/                 # Integrações com APIs externas e serviços (ex: Gemini IA)
├── 📂 stubs/                    # Códigos de simulação/compatibilidade para testes
│   └── 📂 node-domexception/
├── 📂 supabase/                 # Infraestrutura do Banco de Dados
│   └── 📂 migrations/           # Scripts de migração SQL oficiais
├── 📂 utils/                    # Funções utilitárias e auxiliares de código geral
│
├── 📝 Configurações e Ambientes
│   ├── .env.example             # Modelo de variáveis de ambiente (Supabase URL/Keys)
│   ├── .gitignore               # Arquivos ignorados pelo Git
│   ├── .npmrc                   # Configurações do gerenciador de pacotes npm
│   ├── vercel.json              # Configurações de deploy na plataforma Vercel
│   ├── vite.config.ts           # Configuração do empacotador Vite
│   ├── tsconfig.json            # Configuração do compilador TypeScript
│   ├── tailwind.config.js       # Configuração do framework de estilização Tailwind CSS
│   └── postcss.config.js        # Configuração do pós-processador de CSS
│
├── 📝 Gerenciamento de Dependências
│   ├── package.json             # Manifesto do projeto (scripts e dependências)
│   └── package-lock.json        # Trava de versões exatas das dependências
│
├── 📝 Inicialização da Aplicação
│   ├── index.html               # Ponto de entrada HTML principal
│   ├── index.css                # Estilos globais do projeto
│   ├── index.tsx                # Ponto de entrada do React
│   ├── App.tsx                  # Componente raiz da aplicação
│   ├── i18n.ts                  # Configuração do sistema multilíngue
│   ├── constants.tsx            # Definição de constantes globais
│   └── types.ts                 # Definições de tipos globais do TypeScript
│
└── 📝 Documentação e Guias Globais
    ├── README.md                # Apresentação do projeto e instruções de inicialização
    ├── DOCUMENT.md              # Bússola mestre com Regras de Negócio (essencial para Agentes)
    ├── PRD.md                   # Documento de Requisitos do Produto (Product Requirement Document)
    ├── CHANGELOG.md             # Histórico detalhado de mudanças por versão
    ├── CONTRIBUTING.md          # Diretrizes para novos desenvolvedores colaborarem
    ├── LICENSE                  # Licença de uso do software (MIT License)
    ├── SECURITY.md              # Políticas de segurança e reportes de falhas
    └── database_rls.sql         # Políticas de Segurança em Nível de Linha do banco de dados
