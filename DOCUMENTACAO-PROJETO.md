# Documentação do Projeto — Guia Digital RF Tecnologia

Este documento consolida o estado atual do projeto, a arquitetura, os principais fluxos, as configurações e os pontos onde uma pessoa precisa mexer para continuar o desenvolvimento.

Ele foi criado para servir como guia de manutenção e onboarding para qualquer pessoa que precise editar, evoluir ou corrigir o sistema sem precisar reconstituir tudo do zero.

---

## 1. Visão geral do produto

O Guia Digital RF Tecnologia é uma plataforma SaaS multi-tenant para pousadas, chalés, hotéis e hospedagens.

Objetivo principal:

- Cadastrar estabelecimento
- Personalizar o guia
- Publicar
- Gerar QR/NFC

Princípio central:

- Um sistema. Muitos clientes. Experiências completamente personalizadas.

Cada estabelecimento é um tenant e os dados devem sempre permanecer isolados entre tenants.

---

## 2. Stack principal

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Zod
- Lucide React

---

## 3. Estrutura de pastas

```text
.
├─ AGENTS.md
├─ DOCUMENTACAO-PROJETO.md
├─ README.md
├─ components.json
├─ eslint.config.mjs
├─ next.config.ts
├─ package.json
├─ tsconfig.json
├─ docs/
│  ├─ ADMIN.md
│  ├─ AI-DESIGNER.md
│  ├─ ARQUITETURA.md
│  ├─ AUTENTICACAO.md
│  ├─ CONCIERGE.md
│  ├─ DECISOES-TECNICAS.md
│  ├─ DESIGN-SYSTEM.md
│  ├─ MIDIA-E-STORAGE.md
│  ├─ MODELO-DE-DADOS.md
│  ├─ MULTI-TENANT.md
│  ├─ PLANOS-E-DOMINIOS.md
│  ├─ PWA.md
│  ├─ QR-NFC.md
│  ├─ REGRAS-DE-NEGOCIO.md
│  ├─ SEGURANCA-E-RLS.md
│  ├─ SUPER-ADMIN.md
├─ public/
├─ scripts/
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ config/
│  ├─ features/
│  ├─ hooks/
│  ├─ lib/
│  ├─ services/
│  ├─ styles/
│  ├─ types/
│  └─ utils/
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/
│  ├─ snippets/
│  └─ tests/
└─ .env* (não versionado)
```

---

## 4. Comandos de execução

### Instalar dependências

```bash
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Typecheck

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Banco local / Supabase

```bash
npm run db:start
npm run db:stop
npm run db:reset
npm run db:test
npm run db:lint
npm run db:types
```

### Seed / bootstrap

```bash
npm run dev:bootstrap-admin
npm run demo:villa
npm run prod:bootstrap-super-admin
```

---

## 5. Arquitetura multi-tenant

Regras obrigatórias:

- cada tenant deve ter isolamento de dados;
- não confiar no frontend para decidir autorização;
- sempre validar no backend e em RLS;
- não criar projeto, banco ou código separado por cliente;
- todo conteúdo do estabelecimento deve ser associado ao tenant;
- não usar service role para leitura de conteúdo comum do admin.

Arquivos importantes para manter isso em mente:

- AGENTS.md
- docs/MULTI-TENANT.md
- docs/SEGURANCA-E-RLS.md

---

## 6. Estrutura das rotas principais

### Administração

- /admin/[tenantSlug]
- /admin/[tenantSlug]/inicio
- /admin/[tenantSlug]/conteudos
- /admin/[tenantSlug]/guia-impresso
- /admin/select
- /admin/no-access

### Guia público do hóspede

- /guia/[tenantSlug]

### Super Admin

- /super-admin
- /super-admin/estabelecimentos

### Autenticação

- /login

---

## 7. Fluxos implementados importantes

### 7.1 Guia público do hóspede

Arquivo principal:

- src/features/public-guide/components/guide-home.tsx
- src/features/public-guide/server/service.ts

Responsável por renderizar:

- hero da página
- quick actions
- acomodações
- regras
- dicas da região
- galeria
- vídeos
- informações do conteúdo universal
- contato
- Wi-Fi
- mapas
- concierge

Este fluxo é o coração da experiência pública para o cliente final.

### 7.2 Conteúdos do Guia

Arquivos principais:

- src/features/admin/content-universal/components/content-page.tsx
- src/features/admin/content-universal/actions.ts
- src/features/admin/content-universal/service.ts

Funcionalidade:

- cadastrar áreas do guia;
- criar itens por área;
- associar imagens, textos, preços, links, endereço, validade e cupom;
- publicar/archivar itens;
- permitir que a página pública liste os itens por área.

Exemplos de áreas:

- Lojinha
- Frigobar
- Gastronomia
- Informações
- Como usar
- Promoção
- Outros

### 7.3 Guia impressor / livreto em PDF

Arquivos principais:

- src/app/admin/[tenantSlug]/guia-impresso/page.tsx
- src/features/admin/print-guide/components/printable-guide.tsx

Funcionalidade:

- gera visualização do guia em formato de livreto;
- permite troca de idioma;
- permite editar textos e imagens;
- permite escolher quais seções aparecem;
- possui botão de imprimir/PDF.

### 7.4 Home / hero do guia

Arquivos principais:

- src/features/admin/guide-home/components/guide-home-editor.tsx
- src/features/admin/guide-home/actions.ts
- src/features/public-guide/components/guide-home.tsx

Funcionalidade:

- configurar imagem principal do hero;
- ajustar overlay;
- selecionar variação visual;
- definir título, saudação, CTA;
- ajustar logo e posicionamento da mídia;
- controlar nível de sombra e estilos visuais.

Importante:

A opção "Sem overlay" foi adicionada para permitir imagem limpa sem escurecer a foto do hero.

---

## 8. Configuração do tema e identidade visual

Os dados visuais do tenant vêm do banco e do design settings, não do código.

Arquivos principais:

- src/features/public-guide/components/guide-home.tsx
- src/features/public-guide/server/service.ts

O tema é montado em runtime com valores como:

- primaryColor
- secondaryColor
- accentColor
- backgroundColor
- surfaceColor
- foregroundColor
- borderColor
- mutedColor
- titleColor
- subtitleColor
- radiusScale
- shadowLevel

Esses dados devem ser configuráveis por tenant.

---

## 9. Relacionamento com Supabase / banco

Estrutura fundamenta de dados relevante:

- tenants
- tenant_design_settings
- tenant_locations
- contacts
- media
- accommodations
- services
- local_tips
- rules
- content_collections
- content_items
- content_item_media
- wifi_networks
- bookings
- concierge settings

A assinatura dos tipos fica em:

- src/types/database.types.ts

---

## 10. Arquivos e módulos mais importantes

### Frontend geral

- src/app/
- src/components/
- src/features/
- src/lib/

### Módulos de interesse

- src/features/admin/
- src/features/public-guide/
- src/features/auth/
- src/features/media/
- src/features/tenant/
- src/features/ai-designer/

### Utilitários

- src/lib/utils.ts
- src/lib/env.ts

---

## 11. Regras de negócio e arquitetura importantes

### Multi-tenancy

- cada tenant precisa manter suas informações isoladas;
- nunca confiar no que o frontend manda como prova de autorização;
- qualquer dado pertencente a tenant deve ser validado no servidor.

### Conteúdo público

- só conteúdo publicado aparece na página pública;
- draft e archived não devem aparecer;
- itens e coleções precisam ter status correto antes de aparecer na interface pública.

### Design

- nunca deixar dados do cliente fixos no código;
- tudo que varia por cliente deve vir do banco ou painel admin.

### PWA / app

- o guia deve ser preparado para funcionar como instalação local/PWA;
- identidade visual dinâmica por tenant é obrigatória.

---

## 12. Como evoluir o projeto sem quebrar a estrutura

### Para mudar a home pública

Edite:

- src/features/public-guide/components/guide-home.tsx

### Para mudar a lógica de dados públicos

Edite:

- src/features/public-guide/server/service.ts

### Para alterar as áreas do guia no admin

Edite:

- src/features/admin/content-universal/components/content-page.tsx
- src/features/admin/content-universal/actions.ts

### Para rodar o guia impressor

Edite:

- src/features/admin/print-guide/components/printable-guide.tsx

### Para alterar o comportamento do hero

Edite:

- src/features/admin/guide-home/components/guide-home-editor.tsx
- src/features/admin/guide-home/actions.ts

### Para ajustar o tema visual

Edite:

- src/features/public-guide/components/guide-home.tsx
- src/features/public-guide/server/service.ts

---

## 13. Estado atual do projeto

O projeto está em fase de estrutura funcional e integração com conteúdo real. Já existem:

- arquitetura de tenant e admin
- guia público
- conteúdo universal
- temas e design dinâmico
- hero configurável
- guia impressor
- suporte a conteúdo por áreas
- estrutura multi-tenant

O que ainda precisa ser refinado em vários pontos:

- ajustes finos de UI/UX do público
- validações e regras finais de tenant
- revisão de dados reais do cliente Villa Caravaggio
- ajustes específicos por módulo no admin
- expansão de integrações e publicações

---

## 14. Checklist para outra pessoa continuar o projeto

Antes de mexer em algo, verifique:

1. AGENTS.md
2. docs/ e documentação relevante
3. se a funcionalidade já existe
4. se a mudança respeita multi-tenancy
5. se o dado é público ou do admin
6. se a tela pública depende de status publicado
7. validar com typecheck/lint

---

## 15. Ponto de atenção para o conteúdo do guia

A parte que mais costuma causar confusão é a relação entre:

- content_collections
- content_items
- content_item_media
- status de cada registro
- tenant_id

Se o item não aparece na página pública, normalmente é por um destes motivos:

- a coleção está em draft
- o item está em draft ou archived
- o tenant está diferente
- a categoria não está sendo carregada no public guide service
- o status publicado não está correto no banco

---

## 16. Observações finais

Este projeto foi construído pensando em:

- mobile-first
- experience premium
- conteúdo editável por admin
- 1 sistema para muitos clientes
- aparência adaptável por tenant

A documentação principal do projeto está em:

- AGENTS.md
- docs/
- README.md

Este arquivo serve como resumo prático de manutenção e continuidade do trabalho.
