# Guia Digital RF Tecnologia

Plataforma SaaS multi-tenant para Guias Digitais de hospedagens.

Princípio permanente:

**Um sistema. Muitos clientes. Experiências completamente personalizadas.**

## Visão Geral

Esta aplicação será a base executável da plataforma Guia Digital RF Tecnologia. Cada estabelecimento será tratado como tenant, com conteúdo, identidade visual, módulos e permissões configuráveis.

## Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Supabase SDK
* Zod

## Requisitos

* Node.js compatível com a versão atual do Next.js
* npm

## Executar Localmente

```bash
npm install
npm run dev
```

Para validação:

```bash
npm run lint
npm run typecheck
npm run build
```

## Variáveis de Ambiente

Copie `.env.example` quando houver credenciais reais do Supabase.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Não use chaves privadas ou service role em variáveis públicas.

## Documentação

As decisões arquiteturais e regras permanentes estão em:

* `AGENTS.md`
* `docs/`

Toda implementação deve respeitar esses documentos.

## Estado Atual

Fundação técnica inicial configurada. Ainda não há banco, migrations, autenticação, Admin, Super Admin, Concierge, PWA, QR/NFC ou tenant real implementado.
