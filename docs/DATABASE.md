# Database Design & Integrity - EMPIRION

## Princípios de Design
- **Normalização:** 3FN como padrão, denormalização apenas para KPIs de performance.
- **Auditoria:** Campos `created_at`, `updated_at`, `created_by` obrigatórios em tabelas core.
- **Soft Delete:** Utilizado em registros sensíveis como equipes e campeonatos.

## Entidades Principais
- `user_profiles`: Extensão de `auth.users` com roles e metadados.
- `championships`: Arenas competitivas com regras de negócio customizadas.
- `teams`: Entidades de participação (vínculo entre usuário e arena).
- `companies`: O "Digital Twin" financeiro de cada equipe por rodada.
- `history`: Logs históricos de todas as rodadas passadas para telemetria.

## Protocolo de Integridade
- A `INITIAL_FINANCIAL_TREE` define a estrutura imutável de contas contábeis.
- Chaves estrangeiras com `ON DELETE RESTRICT` para evitar órfãos em dados históricos.

### Versionamento de Infraestrutura & RLS - 05/06/2026
* **Motivo:** Restabelecimento da persistência das demonstrações contábeis e Matriz Financeira (DRE, Balaço, Fluxo de Caixa, KPIs) em simulações Sandbox/Trial que retornavam registros vazios.
* **Diagnóstico:** Row Level Security (RLS) habilitado sem diretivas de `FOR INSERT` para conexões autenticadas do Tutor, ativando o comportamento default deny do PostgreSQL.
* **Ajuste:** Adicionadas políticas RLS sob medida mapeadoras do direito de inserção (`FOR INSERT`) para as tabelas `public.trial_companies` e `public.companies`, restringindo escritas contábeis exclusivamente aos perfis de Membros Autênticos da equipe respectiva, Tutores ou Admins do campeonato.

