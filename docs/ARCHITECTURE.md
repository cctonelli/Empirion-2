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
