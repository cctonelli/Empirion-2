# 🚀 EMPIRION ORACLE v19.3 SAPPHIRE

O Simulador Industrial mais avançado para gestão estratégica e financeira, movido por Inteligência Artificial (Google Gemini) e infraestrutura Supabase.

---

## 🏛️ Visão Estratégica
O **EMPIRION** é um simulador de "Digital Twin" financeiro que permite a gestores e estudantes operarem uma multinacional industrial complexa. Com monitoramento de solvência dinâmica (E-SDS), análise de balanços via IA e um motor de simulação de alta fidelidade.

## 📁 Estrutura de Documentação
Para garantir a escalabilidade e clareza do projeto, nossa documentação está segmentada por domínios:

### 📖 Guia do Projeto
- **[DOCUMENT.md](./DOCUMENT.md)** - Bússola mestre com Regras de Negócio e Histórico de Versões (Obrigatório para o Agent).

### 🛠️ Documentação Técnica (`docs/`)
- **[Arquitetura](./docs/ARCHITECTURE.md)** - Visão técnica, processamento de rodadas e stack.
- **[Banco de Dados](./docs/DATABASE.md)** - Design de schema, integridade contábil e entidades.
- **[Supabase & RLS](./docs/SUPABASE.md)** - Protocolos de segurança e infraestrutura.
- **[Autenticação](./docs/AUTH.md)** - Fluxos de login e gestão de perfis.
- **[API & IA](./docs/API.md)** - Integração com Google Gemini e Simulation Kernel.

### ⚙️ Infraestrutura e Comunidade
- **`supabase/`** - Configurações, migrações SQL e seeds oficiais.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Como contribuir com o projeto.
- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico detalhado de mudanças por versão.
- **[SECURITY.md](./SECURITY.md)** - Política de segurança e reporte de falhas.

## 🚀 Como Iniciar
1. **Configuração**: Certifique-se de que as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão no seu `.env`.
2. **Ambiente**: O projeto roda em React 18 com Vite.
3. **Database**: Migrations oficiais residem em `supabase/migrations/`.

---
*Developed for High-Stakes Strategic Competitions.*

