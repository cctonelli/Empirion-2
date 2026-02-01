
# 🚀 Empirion – Business Intelligence Arena (v15.25-Oracle Master)

**Forge Your Empire with AI-Driven Strategic Insight.**

---

## 🧠 1. Arquitetura de Inteligência Artificial (Gemini API)
... (conteúdo anterior mantido) ...

---

## 🏛️ 2. Segurança e Governança (RLS Protocol)

O Empirion utiliza **Row Level Security (RLS)** avançado no Supabase para garantir o isolamento total de dados entre arenas competitivas. O acesso é segmentado em quatro níveis de autoridade:

### 2.1 System Admin
*   **Permissões:** Acesso total a todas as tabelas, usuários e configurações globais do cluster.
*   **Identificação:** Usuários com `role = 'admin'`.

### 2.2 Arena Tutor (Orquestrador)
*   **Permissões:** Controle total sobre os campeonatos que criou (`tutor_id`). Pode ler todas as decisões, balanços e logs de auditoria de qualquer equipe dentro de sua arena.
*   **Mecânica:** Responsável por disparar o *Turnover* e gerenciar *Black Swans*.

### 2.3 Team Member (Estrategista)
*   **Permissões:** Leitura e escrita exclusivas nos dados de sua própria equipe. Pode visualizar relatórios públicos e a Gazeta conforme configurado pelo Tutor.
*   **Isolamento:** Membros da Equipe A não podem acessar o balanço detalhado ou o histórico de auditoria da Equipe B.

### 2.4 Market Observer
*   **Permissões:** Acesso de leitura (*Read-Only*) a dados consolidados da arena onde foram nomeados.
*   **Mecânica:** Identificados pelo campo `observers` (array de UUIDs) na tabela de campeonatos. Ideal para patrocinadores, professores ou juízes de banca.

---

## 🌎 3. Expansão Geopolítica e Multi-Moeda
... (conteúdo anterior mantido) ...
