# Protocolo de Segurança e Proteção Fiduciária - EMPIRION
**Versão de Segurança:** v2026.04 Sênior Shield Protocol  
**Data:** 07 de Junho de 2026  
**Status:** ATIVO e Consolidado no Banco de Dados (Supabase PostgreSQL / RLS)

---

## 1. Diretrizes de Segurança do Core de Simulação (Fórmulas e Matemática)

O EMPIRION é um simulador fiduciário corporativo onde a integridade das fórmulas matemáticas e as engrenagens contábeis (cálculo de DRE, Balanços, Rating Spread de Empréstimos e depreciação linear) são ativos estratégicos proprietários e críticos.

1. **Blindagem e Execução Server-Side (Anti-Exploitation):**
   - **Proibição Absoluta de Cálculos Sensíveis no Client-Side:** Todas as simulações, turnovers de rodadas e consolidações de partidas dobradas são processados **exclusivamente** na camada de aplicação do servidor em `simulation-core.ts` e `simulation.ts`.
   - O navegador (client-side) do aluno recebe apenas visões consolidadas e relatórios gráficos processados. Nenhum dado bruto de elasticidade-preço de mercado, constantes de desgaste de frota, ou fatores multiplicativos de greve são computáveis no frontend, evitando manipulações de memória de execução do browser.
   - **Preditores Herméticos:** Simuladores de rascunhos para estimativas dos alunos utilizam chamadas de API sanitizadas ao servidor para processamento temporário, rodando no mesmo kernel seguro de turnovers oficiais.

2. **Sanitização de Inputs e Impedimento de SQL Injection / Injeção de Parâmetros:**
   - Todas as decisões fiduciárias digitadas pelos jogadores são submetidas a uma validação de tipos estrita (TypeScript Runtime Validation) e validadas contra as regras do respectivo Setor (`validateDecision`) e restrições de Caixa (impedindo que valores arbitrários negativos quebrem a matemática de débitos e créditos).
   - O ORM e as queries adhoc no Supabase utilizam **parametria estrita**, garantindo imunidade total contra injeções de SQL que pudessem adulterar saldos contábeis ou apagar históricos de rodadas anteriores.

---

## 2. Segregação de Dados e Controle de Acesso de Banco (Row Level Security - RLS)

O EMPIRION implementa políticas de defesa em profundidade a nível de banco de dados PostgreSQL no Supabase, garantindo que equipes concorrentes e usuários externos tenham acesso estrito e monitorado às suas respectivas áreas fiduciárias.

1. **Mandato de Isolamento Horizonal de Ingressos (RLS):**
   - Nenhuma tabela de banco de dados existe sem a cláusula `ENABLE ROW LEVEL SECURITY`.
   - **Políticas em `companies` e `teams`:** Jogadores só podem visualizar e alterar dados (`SELECT`/`UPDATE`) se o registro pertencer estritamente à sua respectiva equipe fiduciária authenticada ou campeonato ativo. A integridade desta validação é garantida via validações cruzadas contra a tabela `team_members` e IDs de autenticação do Supabase (`auth.uid()`).
   - Amortecedores e buffers de transição histórica são inacessíveis por rotas diretas dos estudantes, impedindo vazamento de dados estratégicos de concorrentes diretos no mesmo campeonato (estudo de concorrência restrito ao que é disponibilizado na Gazeta Científica).

2. **Proteção Completa de Chaves de API e Segredos do Sistema:**
   - **Tabela `system_secrets` Protegida:** Chaves críticas (como chaves de autenticação externa, credenciais de APIs de terceiros e a chave proprietária `GEMINI_API_KEY`) são armazenadas na tabela encapsulada `public.system_secrets`.
   - **RLS Restrito:** As políticas de banco bloqueiam qualquer tentativa de leitura pública. Apenas usuários cuja claim em `user_profiles.role` seja `'tutor'` ou `'admin'` são elegíveis a efetuar `SELECT`. Alunos e acessos não-autenticados recebem retorno nulo, blindando a telemetria do sistema de simulação de inteligência artificial.

---

## 3. Integridade Histórica e Auditorias de Turnovers

1. **Consolidação Imutável (Lock nas Rodadas Anteriores):**
   - Uma vez efetuado o processamento de turnover pelo Arena Tutor, as contas e Balanços Patrimoniais da rodada finalizada passam por um processo de congelamento lógico de escrita.
   - Políticas de banco e travas em backend rejeitam requisições de alteração de dados de rodadas menores ou iguais à última rodada encerrada, preservando de forma fidedigna e perpétua o histórico de evolução financeira.

2. **Logs de Auditoria de Lançamentos Fiscais (Soft-Delete e Históricos):**
   - Nenhuma modificação estrutural de saldo é apagada fisicamente sem manter as colunas de auditoria preenchidas:
     *   `created_at`, `updated_at`, `deleted_at` (soft delete para evitar perdas catastróficas de relatórios de alunos).
     *   `created_by`, `updated_by` identificando o usuário autenticado ator da modificação.

---

## 4. Reportando Vulnerabilidades

Se você identificar qualquer fraqueza estrutural, falhas de RLS no Supabase, tentativas de expropriação de fórmulas matemáticas contábeis ou brechas de segurança no ecossistema do simulador, por favor, envie um relatório privado criptografado ao comitê de segurança do projeto através do e-mail: `security@empirion.com`.

**Aprovado por:**  
*   **PMP Principal (Project Management Professional)**  
*   **Engenheiro Sênior de Bancos de Dados**  
*   **Arquiteto de Software Sênior**  
**Status do Protocolo:** Rigorosamente Ativo de Fábrica nas políticas de RLS e orquestradores Core.
