# Changelog - EMPIRION ORACLE

## [v2026.188] - 2026-07-01
### Fixed
- **Ativação de Novas Regiões Comerciais (Intervenção do Tutor):** Correção de anomalia crítica onde a nova região criada em intervenção (ex: "MEXICO (EXPORT)") ficava com `start_round = nextRoundIdx + 1` (Round 3) em vez de `nextRoundIdx` (Round 2). Isso provocava o isolamento e desativação da região durante o processamento do Turnover de R-1 para R-2 (calculando 0 vendas reais e zerando o DRE da região), enquanto as decisões enviadas já debitavam custos de marketing nas contas corporativas. Corrigido para `start_round = nextRoundIdx`.

## [v19.3 Sapphire] - 2026-05-02
### Added
- Estrutura completa de documentação Enterprise em `/docs`.
- Inicialização do Supabase CLI em `/supabase`.
- Migration `20260502000000_initial_schema.sql`.

### Changed
- Refatoração do `DOCUMENT.md` para servir como Master Index.
- Padronização de RLS para tabelas core.

## [v19.2 Diamond] - 2026-03-30
### Added
- Telemetria de suprimentos e custos de emergência.
- View de auditoria `view_supply_chain_health`.

## [v19.1 Kernel] - 2026-03-15
### Changed
- Mutação de parcelas BDI (LP -> CP).
- E-SDS v1.2 com pesos dinâmicos por setor.
