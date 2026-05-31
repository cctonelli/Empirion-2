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

## Estrutura ideal para o crescimento do EMPIRION
Empirion-2/
├── core/                          ← Núcleo comum (não muda por setor)
│   ├── accounting/                ← Motor contábil genérico + validações triplas
│   ├── simulation-engine/         ← Motor de simulação abstrato
│   ├── models/                    ← AccountingModelTemplate (base)
│   └── templates/                 ← Sistema de templates do Tutor
│
├── sectors/                       ← Cada setor como um "módulo"
│   ├── industrial/
│   │   ├── config.ts
│   │   ├── financial-tree.ts
│   │   ├── rules.ts               ← Regras específicas (CPP, CPV, turnos, etc.)
│   │   └── components/            ← Steps específicos (FactoryStep, etc.)
│   ├── agribusiness/
│   ├── construction/
│   ├── services/
│   └── capital-markets/
│
├── components/
│   ├── common/                    ← Gráficos, Wizard base, DecisionForm genérico
│   ├── decision-form/             ← Sistema dinâmico de steps por setor
│   └── sector-specific/           ← Sobrescritas por setor quando necessário
│
├── services/
│   ├── initialization.ts          ← Geração dinâmica de P0 por setor
│   └── simulation-core.ts         ← Engine genérico
│
├── types/
│   └── sector.ts                  ← Interfaces extensíveis
│
└── docs/
    ├── API.md
    └── ARCHITECTURE.md
    └── AUTH.md
    └── BUSINESS_RULES.md
    └── CHANGELOG.md
    └── CONTRIBUTING.md
    └── DATABASE.md
    └── SECURITY.md
    └── SUPABASE.md




