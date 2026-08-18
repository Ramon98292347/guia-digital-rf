# Autenticação

## Objetivo

Documentar o fluxo inicial de autenticação, sessão SSR e seleção de tenant do Admin do Guia Digital RF Tecnologia.

Este fluxo é local e não conecta projeto Supabase remoto.

## Stack

O Admin usa:

* Supabase Auth;
* `@supabase/ssr`;
* Server Actions do App Router;
* `proxy.ts` do Next.js 16;
* validação server-side;
* RLS no banco.

Não usar `@supabase/auth-helpers-nextjs`.

## Fluxo de login

```text
Formulário /login
   ↓
Server Action
   ↓
Supabase Auth
   ↓
sessão em cookies
   ↓
tenant_members ativo
   ↓
Admin
```

Campos:

```text
E-mail
Senha
```

Não existe cadastro público. Administradores serão cadastrados ou convidados por fluxo controlado da plataforma.

Erros de autenticação devem ser genéricos e em português, como:

```text
E-mail ou senha inválidos.
```

## Sessão SSR

O cliente server-side em `src/lib/supabase/server.ts` lê e grava cookies via `@supabase/ssr`.

As páginas administrativas são Server Components por padrão e validam a sessão antes de buscar dados.

## Proxy

`src/proxy.ts` chama a rotina de autenticação em `src/features/auth/proxy.ts`.

Responsabilidades:

* renovar cookies de sessão;
* manter SSR coerente;
* redirecionar acesso sem sessão em `/admin` para `/login`.

O proxy não é fonte final de autorização. A autorização definitiva continua em:

```text
sessão
+
membership ativo
+
role
+
RLS
+
validação server-side
```

## Autorização

Autenticação não significa acesso ao Admin.

A fonte de verdade para acesso administrativo de tenant é:

```text
tenant_members
```

Somente memberships com `status = active` são considerados.

Não usar `profile.tenant_id`, `user_metadata`, parâmetro de rota, cookie ou estado de frontend como prova de autorização.

## Tenant atual

A decisão inicial do Admin é usar rota explícita:

```text
/admin/[tenantSlug]
```

Motivos:

* suporta usuários com múltiplos tenants;
* refresh preserva contexto;
* links ficam determinísticos;
* a URL pode ser compartilhada internamente sem depender de estado local.

O slug não concede permissão. O servidor resolve o tenant e valida membership antes de renderizar a página.

## Guards server-side

A camada reutilizável fica em:

```text
src/features/auth/server/admin-access.ts
```

Funções principais:

* `requireUser()`: exige usuário autenticado;
* `getAdminTenants()`: lista somente tenants acessíveis pelo usuário;
* `requireTenantAccess(tenantSlug)`: resolve tenant, membership e role antes de permitir acesso.

O contexto validado do Admin retorna:

```text
user
tenant
membership
role
tenants
```

## TenantSwitcher

O `TenantSwitcher` mostra somente tenants retornados pelo servidor para o usuário autenticado.

A troca de tenant navega para outra URL, mas cada destino valida novamente membership no servidor.

## Logout

Logout usa Server Action para chamar `auth.signOut()` e redirecionar para:

```text
/login
```

## 403 e 404

Para tenant inexistente ou inacessível via `/admin/[tenantSlug]`, a decisão inicial é usar uma resposta segura de não encontrado.

Motivo:

* evita revelar a existência de tenants;
* mantém isolamento entre estabelecimentos;
* ainda apresenta mensagem amigável ao usuário autenticado.

## Bootstrap local

O script local fica em:

```text
scripts/bootstrap-local-admin.mjs
```

Ele cria dados fictícios apenas para desenvolvimento:

```text
admin@local.test
AdminLocal!12345
Tenant Demo A
Tenant Demo B
```

`Tenant Demo A` recebe membership `tenant_admin`.

`Tenant Demo B` existe sem membership do usuário demo para validar isolamento.

O script é idempotente e aborta se `NEXT_PUBLIC_SUPABASE_URL` não apontar para host local, como:

```text
localhost
127.0.0.1
::1
```

Não inserir esses dados em migrations estruturais.

## Execução local

Fluxo recomendado:

```text
npm run db:start
npm run db:reset
npm run db:test
npm run dev:bootstrap-admin
npm run dev
```

Configurar `.env.local` com valores do Supabase local quando necessário, sem commitar secrets.

## Regras

* Não executar `supabase login`.
* Não executar `supabase link`.
* Não executar `supabase db push`.
* Não conectar banco remoto.
* Não cadastrar cliente real.
* Não inserir dados do Chalés Villa Caravaggio.
* Não usar service role em leituras normais do Admin.
