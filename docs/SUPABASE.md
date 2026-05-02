# Supabase Architecture - Protocolo Oracle

## Infraestrutura
- **URL/Key:** Gerenciados via variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- **Modo Servidor:** O projeto utiliza RLS (Row Level Security) extensivo para garantir que a lógica de negócio esteja protegida no nível do banco.

## RLS (Row Level Security)
Implementamos 4 níveis de governança:
1. **Admin (`role = 'admin'`):** Bypass total.
2. **Tutor (`tutor_id`):** Visualização completa da arena gerenciada.
3. **Player:** Acesso exclusivo aos dados da própria `team_id`.
4. **Public:** Acesso a dados anonimizados da Gazeta.

## Migrations
As migrações seguem o padrão Supabase CLI e estão localizadas em `/supabase/migrations/`.
Sempre utilize migrações versionadas para alterações de schema ou RLS.

## Types
Tipos gerados via CLI residem em `/supabase/types/`.
