# Fluxo de Autenticação - EMPIRION

## Provider
- **Supabase Auth:** Utilizamos o Supabase como provedor de identidade principal.
- **Login:** Implementado via `signInWithPassword` ou `signInWithOAuth` (Google).

## Gerenciamento de Sessão
- O token JWT é persistido no `localStorage` e renovado automaticamente pelo cliente Supabase.
- Proteção de rotas é feita via Hook `useAuth` e componentes de Layout.

## Perfis (Profiles)
- Após o login, o sistema sincroniza o `auth.uid()` com a tabela `public.user_profiles`.
- Se o perfil não existir, ele é criado automaticamente com o role default `player`.
