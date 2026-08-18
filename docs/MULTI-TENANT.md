# Multi-Tenant

## Objetivo

Documentar as regras de isolamento, segurança e modelagem conceitual para múltiplos estabelecimentos.

Cada estabelecimento é um tenant. A plataforma deve ser única, com dados, configurações, módulos, identidade visual e permissões separados por tenant.

## Regras permanentes

* Toda funcionalidade nova deve considerar múltiplos estabelecimentos.
* Dados de um tenant jamais podem aparecer para outro tenant.
* Entidades específicas de estabelecimentos deverão possuir associação ao tenant.
* Não confiar somente em `tenantId` enviado pelo frontend.
* A segurança e o isolamento deverão ser garantidos também no backend e banco de dados.
* Plano comercial não é boundary de isolamento.
* Domínio não é boundary de isolamento.
* Não criar projeto, pasta, banco ou deployment separado por cliente, plano ou domínio.

## Entidades estruturais

Entidades conceituais da base multi-tenant:

```text
tenants
tenant_members
tenant_settings
tenant_branding
tenant_design_settings
tenant_modules
tenant_domains
tenant_subscriptions
tenant_feature_overrides
```

Responsabilidades:

* `tenants`: cadastro principal dos estabelecimentos.
* `tenant_members`: vínculo entre usuários e estabelecimentos, com papéis e permissões.
* `tenant_settings`: configurações gerais do estabelecimento.
* `tenant_branding`: identidade visual do tenant, como logo, cores, fontes e mídia.
* `tenant_design_settings`: template, variantes, tokens avançados, navegação e composição visual.
* `tenant_modules`: módulos disponíveis, ativos, desativados, ordenação e configurações.
* `tenant_domains`: endereços que resolvem para o tenant.
* `tenant_subscriptions`: plano vigente do tenant.
* `tenant_feature_overrides`: extras, bloqueios e exceções comerciais do tenant.

Catálogos globais relacionados:

```text
design_templates
design_presets
modules
plans
features
plan_features
```

Templates e presets são mantidos pela RF Tecnologia. A escolha e os ajustes de cada cliente devem ficar associados ao tenant.

Planos e features são catálogos globais. Eles determinam capacidades comerciais, não isolamento de dados.

## Conteúdo por tenant

Entidades de conteúdo deverão possuir relacionamento com tenant:

```text
accommodations
amenities
services
schedules
wifi_networks
rules
contacts
media
gallery_items
local_tips
events
promotions
coupons
products
menus
menu_categories
menu_items
guest_experiences
faqs
knowledge_items
```

Essas entidades representam conteúdo administrável. Nenhuma delas deve depender de valores fixos no código para um cliente específico.

## Operacional

Entidades operacionais conceituais:

```text
concierge_settings
concierge_conversations
concierge_messages
unanswered_questions
qr_points
nfc_points
analytics_events
```

Responsabilidades:

* armazenar configurações e histórico do Concierge por tenant;
* registrar perguntas sem resposta;
* mapear pontos QR/NFC;
* registrar eventos analíticos internos respeitando privacidade.

## Segurança no banco

O Supabase/PostgreSQL deverá usar Row Level Security quando aplicável.

Requisitos:

* políticas por tenant;
* autorização server-side;
* validação de vínculo do usuário com o tenant;
* menor privilégio;
* logs de operações administrativas relevantes;
* bloqueio de acesso cruzado entre tenants.

Não criar SQL nesta etapa. Este documento registra apenas responsabilidades e relacionamentos conceituais.

Referência detalhada:

```text
docs/SEGURANCA-E-RLS.md
```

Regras complementares:

* membership deve vir de `tenant_members`, não de `profile.tenant_id`;
* Super Admin não deve ser tratado como membro de todos os tenants;
* conteúdo público é público apenas dentro do tenant resolvido;
* RLS deve usar default deny;
* toda nova tabela precisa de classificação de acesso antes de implementação.

## Primeiro tenant real

**Chalés Villa Caravaggio** será o primeiro tenant real para validar a arquitetura.

Ele deve ser tratado como dados, seed, configuração e conteúdo administrável, nunca como regra permanente da plataforma.
