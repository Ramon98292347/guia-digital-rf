# Segurança e RLS

## Objetivo

Documentar a arquitetura conceitual de autenticação, autorização, RBAC, isolamento multi-tenant, Row Level Security, Storage e acessos públicos/administrativos da plataforma Guia Digital RF Tecnologia.

Este documento não contém SQL definitivo, migrations executáveis, policies reais ou funções Postgres implementadas.

Regra principal:

**Um tenant jamais pode acessar dados privados de outro tenant.**

## Defesa em profundidade

Segurança não pode depender apenas do frontend.

Camadas planejadas:

```text
Interface
   ↓
Autenticação
   ↓
Autorização server-side
   ↓
Postgres Grants
   ↓
RLS
   ↓
Banco
```

Para operações sensíveis, utilizar mais de uma camada. Esconder um botão na interface nunca é mecanismo de segurança.

## Autenticação

A autenticação será planejada com **Supabase Auth**.

Usuários autenticados inicialmente:

* administradores do tenant;
* funcionários;
* Super Admin RF Tecnologia.

Hóspedes não precisam obrigatoriamente criar conta para acessar o Guia público. A arquitetura deve suportar autenticação de hóspedes futuramente quando funcionalidades privadas justificarem, como Minha Estadia.

## Profiles

`profiles` complementa `auth.users`.

Não duplicar:

* senha;
* tokens;
* credenciais de autenticação.

Campos conceituais:

```text
id = auth.users.id
full_name
avatar
phone
created_at
updated_at
```

Não colocar autorização principal em campos editáveis pelo usuário.

## Membership multi-tenant

`tenant_members` será a fonte de associação entre usuário e estabelecimento.

Exemplo:

```text
Usuário Ramon
   ├── Tenant A → tenant_admin
   └── Tenant B → tenant_staff
```

Um usuário poderá estar associado a vários tenants.

Nunca assumir:

```text
profile.tenant_id
```

como única associação possível.

## Papéis iniciais

```text
tenant_staff
tenant_admin
super_admin
```

O papel `guest` público não precisa ser membership.

### tenant_staff

Pode acessar somente recursos autorizados do tenant. Para o MVP, a recomendação é permitir edição de conteúdo operacional e moderação simples, mas não permitir administração crítica.

Pode, conforme política inicial:

* editar conteúdo;
* gerenciar mídia operacional;
* moderar experiências de hóspedes.

Não deve poder inicialmente:

* mudar branding;
* alterar domínio;
* alterar módulos;
* administrar usuários;
* alterar configurações críticas;
* publicar design global do tenant;
* acessar dados sensíveis sem necessidade.

### tenant_admin

Administra conteúdo e configurações permitidas do próprio tenant.

Pode, conforme política:

* gerenciar conteúdo;
* gerenciar mídia;
* configurar módulos;
* configurar aparência;
* administrar usuários do tenant;
* visualizar analytics do próprio tenant;
* publicar drafts quando permitido.

### super_admin

Administra a plataforma RF Tecnologia.

Pode, conforme autorização global:

* criar tenant;
* suspender tenant;
* gerenciar plano;
* prestar suporte;
* cadastrar administrador;
* visualizar métricas globais;
* configurar recursos globais.

Todas as ações críticas deverão ser auditáveis.

## Super Admin separado

O Super Admin não deve ser modelado como membro de todos os tenants.

Usar estrutura global separada:

```text
super_admins
```

Isso evita permissões implícitas excessivas e deixa claro quando uma ação é global.

## Não confiar no frontend

Nunca aceitar algo como prova de autorização:

```json
{
  "role": "super_admin"
}
```

Autorização deve ser derivada de fonte confiável:

* banco;
* sessão autenticada;
* claims controladas pelo servidor quando apropriado;
* funções seguras.

## JWT

Estratégia conservadora:

* não armazenar lista completa e mutável de tenants do usuário exclusivamente no JWT;
* não usar `user_metadata` editável pelo usuário para autorização;
* usar banco como fonte principal para membership.

Motivos:

* membership pode mudar;
* token pode permanecer válido por algum tempo;
* lista pode crescer;
* autorização precisa refletir alterações rapidamente.

Claims poderão futuramente ser usadas para informações globais pequenas e controladas, quando houver benefício claro.

## Funções auxiliares conceituais

Planejar funções internas como:

```text
is_tenant_member(tenant_id)
is_tenant_admin(tenant_id)
is_super_admin()
can_manage_tenant(tenant_id)
```

Essas funções poderão simplificar policies e evitar lógica duplicada em dezenas de tabelas.

Ainda não escrever SQL.

## SECURITY DEFINER

Caso funções `SECURITY DEFINER` sejam usadas futuramente:

* uso deve ser mínimo;
* schema deve ser controlado;
* `search_path` seguro;
* privilégios devem ser restritos;
* nenhuma entrada deve permitir escalada de privilégio;
* funções não devem ficar executáveis indiscriminadamente.

Tratar como ferramenta avançada, não solução padrão para tudo.

## Categorias de acesso

### A — Público do tenant

Conteúdo que pode aparecer no Guia do estabelecimento:

* tenant público;
* branding publicado;
* PWA pública;
* módulos públicos;
* Home publicada;
* acomodações publicadas;
* comodidades públicas;
* serviços publicados;
* horários públicos;
* regras públicas;
* contatos públicos;
* galeria publicada;
* dicas da região;
* eventos publicados;
* promoções publicadas;
* cardápio publicado.

### B — Administração do tenant

* configurações;
* drafts;
* mídia administrativa;
* módulos;
* design;
* navegação;
* FAQs;
* knowledge base;
* perguntas sem resposta;
* analytics;
* moderação.

### C — Dados sensíveis

* membros;
* estadias;
* conversas;
* logs;
* dados de hóspedes;
* credenciais/configurações privadas.

### D — Plataforma

* tenants completos;
* planos;
* Super Admin;
* configurações globais.

## Conteúdo público

Conteúdo público significa:

**visível ao hóspede daquele estabelecimento.**

Não significa leitura global indiscriminada. A aplicação sempre deverá resolver o tenant e consultar apenas seu conteúdo.

Recomendação equilibrada para o MVP:

* usar queries sempre filtradas por tenant resolvido;
* aplicar RLS por tenant e status;
* criar RPCs ou views seguras apenas quando simplificarem a superfície pública;
* evitar schema público complexo antes de necessidade real.

Dados editoriais só podem aparecer publicamente quando cumprirem critérios como:

```text
tenant.status = active
AND content.status = published
AND content.deleted_at IS NULL
```

Quando aplicável, também respeitar:

```text
is_active = true
```

Conteúdo `draft` nunca deve aparecer no Guia público.

## Tenant suspenso

Quando:

```text
tenant.status = suspended
```

o Guia não deverá continuar exibindo normalmente conteúdo público.

Resposta pública segura:

```text
Guia temporariamente indisponível.
```

O Admin poderá ter acesso limitado conforme regra de negócio da RF Tecnologia.

## Tenant Admin — SELECT

Um `tenant_admin` poderá visualizar dados administrativos do tenant somente quando existir membership ativa.

Conceito:

```text
auth.uid()
↓
tenant_members
↓
tenant_id correspondente
↓
role autorizado
```

Nunca apenas:

```text
record.tenant_id = tenant_id recebido do frontend
```

## Tenant Admin — INSERT

Ao criar conteúdo, impedir que um administrador force:

```text
tenant_id = outro_tenant
```

A policy deverá validar que o usuário possui permissão sobre o `tenant_id` inserido.

Pseudoconceito:

```text
WITH CHECK can_manage_tenant(new.tenant_id)
```

## Tenant Admin — UPDATE

Utilizar conceito equivalente a:

```text
USING
```

para validar registro existente, e:

```text
WITH CHECK
```

para garantir que a alteração continue dentro do tenant autorizado.

Objetivo: impedir troca maliciosa de `tenant_id`.

Pseudoconceito:

```text
USING can_manage_tenant(record.tenant_id)
WITH CHECK can_manage_tenant(new.tenant_id)
```

## Tenant Admin — DELETE

Permitir somente conforme:

* tenant;
* role;
* regra da entidade.

Algumas entidades devem usar soft delete. Outras não devem permitir exclusão por staff.

## Permissões granulares futuras

Não construir sistema completo agora, mas preparar expansão:

```text
content.manage
media.manage
concierge.manage
guests.manage
branding.manage
members.manage
settings.manage
```

O MVP deve começar com `tenant_staff`, `tenant_admin` e `super_admin`.

## Matriz RBAC resumida

| Recurso | Público | Staff | Admin | Super Admin |
| --- | --- | --- | --- | --- |
| Conteúdo publicado do tenant | SELECT | SELECT | SELECT/INSERT/UPDATE/DELETE conforme entidade | SELECT conforme suporte |
| Drafts e conteúdo administrativo | Não | SELECT/INSERT/UPDATE limitado | SELECT/INSERT/UPDATE/DELETE | SELECT conforme suporte |
| Mídia publicada | SELECT | SELECT/gerenciar do tenant | SELECT/gerenciar do tenant | SELECT conforme suporte |
| Mídia não publicada | Não | Gerenciar limitado | Gerenciar | SELECT conforme suporte |
| Branding/design/PWA/navegação | SELECT publicado | Não ou limitado | SELECT/INSERT/UPDATE/publish | Gerenciar conforme suporte |
| Membros do tenant | Não | Não | SELECT/INSERT/UPDATE limitado | Gerenciar conforme suporte |
| Conversas do Concierge | Não público | SELECT limitado se autorizado | SELECT do tenant | SELECT autorizado para suporte |
| Perguntas sem resposta | Não | SELECT/UPDATE limitado | SELECT/UPDATE | SELECT conforme suporte |
| Analytics | INSERT controlado | SELECT limitado | SELECT do tenant | SELECT agregado/global |
| Audit logs | Não | Não | SELECT limitado | SELECT global/autorizado |
| Tenants completos/planos | Não | Não | Não | SELECT/INSERT/UPDATE |
| Super Admins | Não | Não | Não | Gerenciar global |

DELETE físico deve ser raro. Preferir status, archive ou soft delete quando histórico for importante.

## Matriz por tabela MVP

| Grupo/Tabelas | Public Read | Tenant Staff | Tenant Admin | Super Admin | Server Only |
| --- | --- | --- | --- | --- | --- |
| `tenants`, campos públicos | SELECT se `active` | SELECT do tenant | SELECT do tenant | SELECT/UPDATE global | operações críticas |
| `tenant_domains` | resolução controlada | Não | SELECT limitado | CRUD | verificação |
| `profiles` | Não | próprio perfil | próprio perfil | suporte limitado | sync auth |
| `tenant_members` | Não | Não | SELECT/gerenciar limitado | CRUD autorizado | convites |
| `super_admins` | Não | Não | Não | CRUD autorizado | validação global |
| `tenant_settings` | Não | SELECT limitado | CRUD | suporte | configs sensíveis |
| `tenant_branding`, `tenant_pwa_settings` | SELECT publicado | Não ou limitado | CRUD/publish | suporte | validação |
| `tenant_design_settings`, `tenant_design_versions` | SELECT publicado | Não ou draft limitado | CRUD/publish | suporte | resolução UI |
| `ai_design_jobs` | Não | Não | SELECT/INSERT do tenant | suporte | execução IA |
| `modules`, `design_templates`, `design_presets` | SELECT público controlado | SELECT | SELECT | CRUD global | seeds |
| `tenant_modules`, `tenant_home_sections`, `tenant_navigation`, `quick_actions` | SELECT ativo/publicado | UPDATE limitado | CRUD | suporte | validação |
| `media` | SELECT apenas publicado/autorizado | CRUD limitado | CRUD | suporte | upload processing |
| `accommodations`, `services`, `rules`, `contacts`, `gallery`, `local_tips` | SELECT publicado/ativo | CRUD limitado | CRUD | suporte | publicação |
| `schedules`, `wifi_networks` | SELECT público filtrado; Wi-Fi com cuidado | CRUD limitado | CRUD | suporte | proteção senha |
| `booking_settings`, `faqs`, `knowledge_items` | SELECT publicado/ativo | CRUD limitado | CRUD | suporte | validação |
| `concierge_settings`, `concierge_suggested_questions` | SELECT apenas necessário | UPDATE limitado | CRUD | suporte | orquestração |
| `concierge_conversations`, `concierge_messages` | Não | SELECT limitado | SELECT do tenant | suporte autorizado | processamento |
| `unanswered_questions` | Não | SELECT/UPDATE limitado | SELECT/UPDATE | suporte | agrupamento |
| `access_points` | resolução pública por código | Não ou limitado | CRUD | suporte | geração/resolução |
| `guest_experiences` | SELECT somente approved + consent | moderação limitada | moderação | suporte | upload intake |
| `analytics_events` | INSERT controlado | SELECT limitado | SELECT do tenant | SELECT global/agregado | ingestão |
| `audit_logs` | Não | Não | SELECT limitado | SELECT global/autorizado | INSERT append-only |

## Wi-Fi

Senha de Wi-Fi exige cuidado especial.

A senha não deve:

* entrar em analytics;
* aparecer em logs;
* ficar em HTML estático;
* entrar em cache público indiscriminado;
* ser enviada para mecanismos externos desnecessariamente.

Campo de controle:

```text
is_guest_visible
```

Mesmo quando visível ao hóspede, minimizar exposição. Para o primeiro MVP, **não armazenar senha Wi-Fi no cache offline do PWA**.

## Concierge

O Concierge deve consultar somente dados pertencentes ao tenant atual.

Nunca permitir:

```text
Pergunta feita no Tenant A
↓
busca em conhecimento do Tenant B
```

Todas as consultas estruturadas e semânticas deverão carregar contexto de tenant.

Conversas não são públicas. Admin poderá visualizar conversas do próprio tenant conforme política. Super Admin somente quando autorizado para suporte ou operação.

`unanswered_questions` é privado para administração do tenant e Super Admin autorizado.

## Experiências dos hóspedes

Publicamente, somente:

```text
moderation_status = approved
AND consent_to_publish = true
```

Uploads pendentes não poderão ser lidos publicamente.

Hóspede poderá enviar conteúdo, mas nunca definir:

```text
approved
```

na própria requisição. Status inicial obrigatório:

```text
pending
```

## Upload anônimo

Não permitir upload aberto e irrestrito diretamente no Storage.

Fluxo seguro:

```text
Hóspede
↓
Solicitação validada
↓
Destino controlado
↓
Upload
↓
Registro pending
↓
Moderação
```

Considerar:

* limite de tamanho;
* MIME permitido;
* quantidade;
* rate limiting;
* tenant correto.

## Storage multi-tenant

Estrutura:

```text
tenants/{tenant_id}/branding/
tenants/{tenant_id}/accommodations/
tenants/{tenant_id}/gallery/
tenants/{tenant_id}/services/
tenants/{tenant_id}/products/
tenants/{tenant_id}/guest-uploads/
```

Admin só poderá gerenciar arquivos do tenant ao qual pertence.

Não confiar somente no path enviado pelo frontend. A autorização deve validar membership e destino permitido.

Branding publicado pode ser público. Upload, alteração e exclusão somente por membros autorizados.

`guest-uploads` deve ficar separado de mídia aprovada. Arquivos pendentes não devem aparecer em listagens públicas.

Tabela `media` deve respeitar:

```text
tenant_id
status
origem
finalidade
publicação
```

Não considerar automaticamente todo arquivo de um tenant como público.

## QR/NFC e access points

QR/NFC pode ter parte pública e parte administrativa.

Público poderá resolver:

```text
code
↓
tenant
↓
destination
```

Informações internas, analytics e gerenciamento não devem ser expostos.

QR/NFC não é autenticação. Acessar QR Code ou NFC não torna o hóspede usuário autenticado. Código de QR/NFC não é senha administrativa.

## Minha Estadia

`guest_stays` deverá ser altamente restrito.

Nunca permitir:

```text
/guia/tenant/stay/123
```

como forma suficiente de autorização.

Estratégias futuras:

* sessão autenticada;
* token temporário;
* link assinado;
* associação validada.

Não implementar agora.

## Analytics

Admin consulta analytics apenas do próprio tenant.

Super Admin consulta métricas globais.

Eventos públicos poderão ser inseridos de forma controlada, sem permitir ao cliente enviar arbitrariamente:

```text
tenant_id
```

sem validação.

## Audit logs

`audit_logs`:

* não público;
* tenant_admin poderá ter acesso limitado quando apropriado;
* Super Admin poderá consultar conforme autorização;
* usuários normais não podem editar logs.

Logs devem ser append-only conceitualmente.

## Service role e operações privilegiadas

Credenciais capazes de ignorar RLS:

* nunca no frontend;
* nunca no código enviado ao browser;
* nunca em variável pública;
* nunca em PWA.

Operações privilegiadas devem acontecer somente em ambiente server-side seguro.

Operações que podem exigir privilégios elevados:

* criar tenant;
* criar primeiro administrador;
* suspender tenant;
* manutenção;
* tarefas internas.

Planejar camada server-side específica. Não espalhar uso privilegiado pela aplicação.

## Server-side / API

Quando uma operação exigir autorização adicional:

```text
Cliente
↓
Server-side
↓
Validar sessão
↓
Validar tenant
↓
Validar permissão
↓
Executar
```

Camada server-side não substitui RLS. Usar ambos quando apropriado.

## TenantResolver não é autorização

`TenantResolver` resolve qual estabelecimento está sendo acessado.

Resolver tenant não concede permissão administrativa.

Separar:

```text
Tenant Resolution
```

de:

```text
Authorization
```

Domínio/subdomínio determina contexto do tenant, não identidade do usuário.

## AI Designer

O AI Designer só poderá acessar dados do tenant solicitado e autorizado.

Admin pode solicitar geração de design somente para tenant que administra.

Super Admin pode fazer isso conforme permissão global.

Design draft de outro tenant nunca poderá aparecer.

`ai_design_jobs` não é público e não deve expor prompts internos sensíveis, erros contendo secrets, credenciais ou dados de outros tenants.

## Planos e autorização

Separar:

```text
Entitlement
```

de:

```text
Authorization
```

Exemplo: tenant possuir módulo Concierge não significa que qualquer usuário pode gerenciar Concierge.

Da mesma forma, um tenant possuir uma feature por entitlement não significa que qualquer usuário pode usá-la ou administrá-la.

Fluxo correto:

```text
TenantResolver identifica tenant
  ↓
TenantEntitlementResolver identifica capacidades comerciais
  ↓
Autorização server-side valida usuário, membership e role
  ↓
RLS restringe acesso no banco
```

Entitlement não substitui autorização.

## Decisão RLS inicial do Passo 6

A primeira migration real adota postura conservadora:

* Super Admin gerencia tenants, domínios, memberships críticos, planos, features, subscriptions e overrides;
* Tenant Admin gerencia apenas configurações operacionais do próprio tenant, como settings, branding, design, PWA, módulos, Home e navegação;
* Tenant Staff começa com leitura limitada ao próprio tenant;
* Admin do tenant não altera plano, não libera feature, não se autopromove, não cria Super Admin e não gerencia domínio nesta fundação;
* operações futuras de convite, suporte e auditoria poderão abrir permissões adicionais com fluxos específicos e novos testes negativos.

## Decisão RLS do conteúdo essencial

A segunda migration real mantém `DEFAULT DENY` e não abre leitura direta para anon nas tabelas de conteúdo.

Regras aplicadas:

* Tenant Admin pode CRUD de conteúdo essencial do próprio tenant;
* Tenant Staff pode gerenciar conteúdo operacional do próprio tenant;
* Tenant Staff não gerencia Wi-Fi por envolver senha;
* Super Admin pode gerenciar conteúdo de qualquer tenant para suporte/configuração autorizada;
* usuário autenticado sem membership não lista conteúdo;
* anon não lista diretamente `accommodations`, `media`, `services`, `schedules`, `wifi_networks`, `rules`, `contacts`, `gallery_items` ou `local_tips`.

Wi-Fi:

* senha não deve ser registrada em audit metadata;
* senha não deve entrar em analytics;
* senha não deve ser exposta por API pública genérica;
* senha não deve ser cacheada offline pelo PWA.

Integridade cross-tenant:

* além de RLS, a migration usa FKs compostas para bloquear relacionamento entre registros de tenants diferentes.

## Storage multi-tenant

A migration `configure_tenant_media_storage` cria policies reais em `storage.objects`.

Buckets:

```text
tenant-private-media
tenant-public-media
```

Regras:

* Tenant Admin e Tenant Staff podem ler/escrever/remover objetos privados do próprio tenant;
* nenhum membro pode escrever diretamente no bucket público via cliente normal;
* anon não lê bucket privado;
* anon pode ler objetos do bucket público;
* paths precisam começar com `tenant_id`;
* paths maliciosos, sem tenant ou com categoria inválida são bloqueados;
* service role fica reservado para operação server-side controlada.

Storage não substitui RLS da tabela `media`. As duas camadas devem permanecer coerentes.

## RLS default deny

Princípio:

Se não existe regra explícita autorizando acesso:

**NEGAR.**

Ao criar tabela nova, não assumir exposição. Toda nova entidade deverá receber classificação de segurança.

## Grants

Planejar grants mínimos.

Conceito:

```text
anon: somente operações públicas necessárias
authenticated: somente operações necessárias
```

Não deixar permissões amplas apenas esperando que RLS resolva tudo.

Usar:

```text
GRANTS + RLS
```

como camadas complementares.

## Schemas

Recomendação inicial simples e segura:

```text
public
security
internal
```

Conceito:

* `public`: tabelas expostas pelo Supabase com RLS estrita e grants mínimos;
* `security`: funções auxiliares de autorização, quando necessárias;
* `internal`: estruturas/funções de sistema não destinadas à superfície pública direta.

Manter simples no MVP. Evitar excesso de schemas antes de necessidade real.

## Views

Se views forem usadas futuramente:

* verificar comportamento com RLS;
* evitar views que inadvertidamente ignorem policies;
* utilizar modo seguro compatível com a versão PostgreSQL utilizada;
* manter views sensíveis fora da superfície pública quando apropriado.

## Rate limit e antibot

RLS não resolve:

* spam;
* abuso;
* flood;
* uploads excessivos.

Planejar rate limiting para:

* Concierge;
* guest uploads;
* analytics;
* formulários;
* endpoints públicos sensíveis.

CAPTCHA/antibot pode ser opcional onde houver abuso, como upload de hóspede, formulário ou ações públicas.

## CSRF e sessões

Seguir estratégia segura da stack escolhida quando houver autenticação baseada em cookies/server-side.

No Admin inicial, sessão SSR usa Supabase Auth com `@supabase/ssr`.

`proxy.ts` renova cookies e redireciona acessos sem sessão em `/admin`, mas não é considerado camada final de autorização.

Páginas e operações administrativas devem validar novamente:

```text
usuário autenticado
+
tenant_members ativo
+
role
+
RLS
```

Server Actions de login e logout devem atualizar cookies corretamente e nunca revelar erros técnicos brutos ao usuário.

## Secrets

Nunca colocar no frontend:

* service role;
* segredo de IA;
* chaves privadas;
* credenciais de integração;
* tokens administrativos.

Separar variáveis:

```text
PUBLIC
```

de:

```text
SERVER ONLY
```

Credenciais de WhatsApp, IA, reservas e APIs devem ser tratadas como segredos quando aplicável.

## Dados enviados ao navegador

Pode chegar ao navegador do hóspede:

* conteúdo publicado;
* branding;
* navegação;
* acomodações;
* serviços;
* horários públicos;
* contatos;
* galeria.

Não deve chegar sem motivo:

* logs;
* membros;
* drafts;
* prompts internos;
* analytics brutos;
* conversas de outros hóspedes;
* dados administrativos;
* segredos.

Aplicar minimização:

Se o Guia precisa apenas:

```text
name
description
cover
```

não enviar:

```text
created_by
internal_notes
moderation_metadata
```

sem necessidade.

## Status, is_active e soft delete

Para conteúdo editorial, preferir:

```text
status = draft | published | archived
```

Para ativação simples sem fluxo editorial, usar:

```text
is_active = true | false
```

Evitar estados contraditórios. Quando uma entidade tiver ambos, documentar claramente:

* `status`: ciclo editorial/publicação;
* `is_active`: disponibilidade operacional.

Registros com:

```text
deleted_at
```

devem ser tratados como inexistentes publicamente.

## Contexto de tenant no Admin

Admin pode estar associado a mais de um tenant.

A interface poderá permitir:

```text
Selecionar estabelecimento
```

mas a troca visual do tenant não é segurança. Toda requisição continuará validando membership.

A rota inicial escolhida para contexto administrativo é:

```text
/admin/[tenantSlug]
```

O slug é apenas entrada de resolução. O servidor precisa confirmar que o usuário possui membership ativa no tenant resolvido.

Para tenant inexistente ou inacessível, a resposta pode ser `not found` seguro, evitando enumeração de estabelecimentos.

## Impersonation / suporte

Não implementar impersonation agora.

Se criada futuramente:

* deve ser explícita;
* auditada;
* limitada;
* nunca invisível;
* nunca reutilizar senha do cliente.

## Exclusão de tenant

Super Admin não deve executar exclusão física destrutiva facilmente.

Preferir:

```text
suspended
```

ou:

```text
archived
```

antes de exclusão definitiva.

Qualquer purga futura deverá possuir processo específico.

## Backup e recuperação

Requisito operacional futuro:

* backups;
* recuperação;
* proteção contra exclusões acidentais.

Não implementar agora.

## Checklist para toda nova tabela

Antes de criar nova tabela, responder:

```text
Ela pertence a tenant?
É pública?
Quem pode SELECT?
Quem pode INSERT?
Quem pode UPDATE?
Quem pode DELETE?
Contém dado sensível?
Precisa de RLS?
Precisa de Storage?
Precisa de auditoria?
```

Se não houver resposta, a tabela não deve ser considerada pronta.

## Testes de RLS obrigatórios

Planejar testes obrigatórios quando policies forem implementadas:

1. Admin Tenant A lê Tenant A: permitido.
2. Admin Tenant A lê Tenant B: negado.
3. Admin Tenant A altera Tenant B: negado.
4. Visitante lê conteúdo publicado: permitido.
5. Visitante lê draft: negado.
6. Visitante lê conversa: negado.
7. Staff altera branding sem permissão: negado.
8. Hóspede tenta aprovar própria experiência: negado.
9. Tenant suspenso bloqueia conteúdo público conforme regra.
10. Tentativa de trocar `tenant_id` em update: negado.

Priorizar testes negativos. Não testar somente usuário autorizado. Testar também que usuário não autorizado não consegue acessar.

Testes de policies devem acompanhar migrations quando a implementação começar.

## Revisão de segurança

Checklist:

* Tenant A não acessa Tenant B.
* Staff não possui acesso excessivo.
* Super Admin está separado.
* Service role restrita ao servidor.
* `user_metadata` fora da autorização crítica.
* Membership é fonte confiável.
* UPDATE impede alteração de `tenant_id`.
* Conteúdo público respeita status.
* Drafts ficam privados.
* Wi-Fi protegido contra cache indevido.
* Guest uploads começam como pending.
* Storage respeita tenant.
* Concierge respeita tenant.
* AI Designer respeita tenant.
* Analytics respeitam tenant.
* Operações privilegiadas são auditáveis.
* Default deny está definido.
* Grants mínimos estão previstos.
* Testes negativos estão planejados.
