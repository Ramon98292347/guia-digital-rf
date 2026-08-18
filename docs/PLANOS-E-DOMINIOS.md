# Planos e Domínios

## Objetivo

Definir como a plataforma Guia Digital RF Tecnologia controlará planos comerciais, features, extras, overrides e domínios sem criar projetos, códigos, bancos ou deployments separados por cliente.

Princípio permanente:

**Um sistema. Muitos clientes. Capacidades diferentes por configuração.**

## Regras permanentes

* Plano comercial não é tenant.
* Domínio não é tenant.
* Tenant não é projeto, pasta, branch, banco ou deployment.
* O mesmo código atende todos os clientes.
* O mesmo projeto Vercel deve atender todos os domínios planejados.
* Diferenças comerciais devem ser resolvidas por features, entitlements, extras e overrides.
* Diferenças visuais e de conteúdo devem vir do banco, Admin, branding, templates, presets e configurações.
* Nunca espalhar condicionais como `if plan == "guia_inteligente"` pela aplicação.

## Modelo comercial inicial

Os nomes abaixo representam ofertas comerciais. A implementação não deve depender diretamente desses nomes. O sistema deve consultar features resolvidas.

### Guia Essencial

Plano de entrada com estrutura visual controlada, personalização básica, conteúdo principal, Wi-Fi, horários, regras, contatos, acomodações básicas, QR/NFC e Admin simplificado.

Neste contexto, "simples" ou "estático" significa estrutura visual mais fixa. Não significa conteúdo hardcoded no código.

### Guia Personalizado

Inclui a base do Essencial e libera maior personalização: identidade visual avançada, templates, presets, variantes, AI Designer quando contratado, organização personalizada da Home, navegação personalizada, mídia avançada, galeria e acomodações mais ricas.

PWA, Concierge e domínio próprio podem ser liberados por feature do plano, extra ou override.

### Guia PWA

Oferta focada na experiência instalável: manifesto dinâmico por tenant, nome, ícone, splash, tema, cores próprias, cache, estratégia offline e sensação de aplicativo oficial do estabelecimento.

PWA deve ser tratado como capability, não como fork de aplicação.

### Guia Inteligente

Oferta avançada com Concierge Virtual, respostas baseadas na mesma fonte de verdade do Guia e do Admin, base de conhecimento complementar, perguntas sem resposta registradas, AI Designer quando habilitado, sugestões e automações futuras.

O plano libera capacidades. Ele não substitui autorização, RLS ou regras de segurança.

## Features e entitlements

O sistema deve resolver capacidades finais com a seguinte lógica conceitual:

```text
Plano base
  + features do plano
  + extras contratados
  + overrides manuais do tenant
  = entitlements finais do tenant
```

A aplicação deve consultar uma camada conceitual `TenantEntitlementResolver`.

Exemplos:

```text
hasFeature(tenantId, "pwa")
hasFeature(tenantId, "ai_designer")
hasFeature(tenantId, "concierge")
hasFeature(tenantId, "custom_domain")
```

O resolvedor também poderá retornar limites como administradores, mídia, acomodações, storage, uso de IA e pontos QR/NFC.

Não definir preços, cobrança ou integração de pagamento nesta etapa.

## Feature, módulo, entitlement e autorização

Feature é uma capacidade de produto vendida, liberada ou bloqueada.

Módulo é uma área funcional ou seção do produto que pode aparecer no Guia ou no Admin.

Entitlement é o resultado final resolvido para um tenant após plano, extras e overrides.

Autorização define o que um usuário específico pode fazer.

Exemplo:

```text
O tenant possui Concierge.
O usuário logado é editor de conteúdo.
Esse usuário não necessariamente pode alterar configurações do Concierge.
```

Entitlement nunca substitui RBAC, membership, RLS ou validação server-side.

## Regra para exibição de módulos

Um módulo só deve ficar utilizável quando as duas condições forem verdadeiras:

```text
feature comercial permitida
+ tenant_modules habilitado/configurado
= módulo disponível
```

Se uma feature não estiver contratada, o Admin pode ocultar, bloquear ou exibir chamada de upgrade futura. Não deve permitir ativação real.

## Extras e overrides

Extras são features ou limites adicionados fora do plano base, como PWA, Concierge, domínio próprio, limite adicional de mídia, limite adicional de QR/NFC ou pacote adicional de IA.

Overrides permitem exceções controladas por tenant: liberar feature extra, bloquear feature temporariamente, ajustar limite, criar condição comercial personalizada ou manter cliente legado em condição especial.

Todo override deve registrar fonte, motivo, autor e data quando implementado.

Downgrade ou bloqueio de feature não deve destruir dados automaticamente. O comportamento esperado é desativar uso, esconder publicação ou impedir novas ações, preservando dados para reativação ou exportação.

## Tabelas conceituais

### plans

```text
id: uuid
key: text
name: text
description: text
status: active | archived
metadata: jsonb
created_at: timestamptz
updated_at: timestamptz
```

### features

```text
id: uuid
key: text
name: text
description: text
category: text
status: active | archived
default_limits: jsonb
created_at: timestamptz
updated_at: timestamptz
```

### plan_features

```text
id: uuid
plan_id: uuid
feature_id: uuid
enabled: boolean
limits: jsonb
created_at: timestamptz
updated_at: timestamptz
```

### tenant_subscriptions

```text
id: uuid
tenant_id: uuid
plan_id: uuid
status: trialing | active | suspended | cancelled
started_at: timestamptz
ended_at: timestamptz
metadata: jsonb
created_at: timestamptz
updated_at: timestamptz
```

Não representa billing completo.

### tenant_feature_overrides

```text
id: uuid
tenant_id: uuid
feature_id: uuid
enabled: boolean
limits: jsonb
reason: text
source: manual | contract | migration | support
starts_at: timestamptz
ends_at: timestamptz
created_by: uuid
created_at: timestamptz
updated_at: timestamptz
```

## Estratégia de URL

A plataforma deve aceitar três formas principais de acesso.

### URL da plataforma

```text
guia.rftecnologia.com.br/cliente
```

Uso previsto: MVP, fallback, testes, clientes sem domínio próprio e QR/NFC inicial. O `TenantResolver` identifica o tenant pelo path.

### Subdomínio RF

```text
cliente.guia.rftecnologia.com.br
```

Uso previsto: experiência mais profissional sem DNS do cliente e alternativa antes do domínio próprio. O `TenantResolver` identifica o tenant pelo hostname.

### Domínio do cliente

```text
guia.cliente.com.br
```

O site principal do cliente, como `www.cliente.com.br`, pode continuar em outro provedor. O Guia precisa apenas que o hostname contratado aponte para a aplicação.

## tenant_domains

```text
id: uuid
tenant_id: uuid
hostname: text
domain_type: platform_path | rf_subdomain | custom_domain
path_prefix: text
status: pending | verifying | active | failed | disabled
is_primary: boolean
verification_status: pending | verified | failed
verification_method: dns | file | manual
verified_at: timestamptz
created_at: timestamptz
updated_at: timestamptz
```

Um tenant pode ter vários domínios. Apenas um deve ser primário para URL canônica.

## TenantResolver

O `TenantResolver` deve receber:

```text
hostname
pathname
```

E retornar:

```text
tenant
tenant_domain
canonical_url
resolution_type
```

Fluxo conceitual:

```text
Request
  ↓
hostname + pathname
  ↓
TenantResolver
  ↓
tenant_domains / tenants
  ↓
TenantContext
  ↓
Guia / Admin / PWA / QR / NFC
```

Resolução de tenant não é autorização. Depois de descobrir o tenant, cada operação ainda deve validar acesso, membership, role, entitlement e RLS conforme o caso.

## Vercel e provisionamento

Estratégia inicial planejada:

```text
1 projeto Vercel
1 aplicação Next.js
N tenants
N domínios e subdomínios
```

Não criar projeto Vercel por cliente.

Integração automática com provider de domínio é futura. A arquitetura deve prever:

```text
DomainProvisioningService
DomainProvider
VercelDomainProvider
```

O MVP pode operar com configuração manual de DNS e domínio. SSL deve ser obrigatório para domínios públicos.

## PWA, QR e NFC

Manifest, links de instalação, QR Codes e NFC devem preferir a URL primária do tenant.

Se houver domínio próprio ativo, ele pode ser a URL canônica. Se não houver, usar subdomínio RF ou URL da plataforma.

## Super Admin e Admin

O Super Admin RF Tecnologia controla planos, features, limites, extras, overrides e domínios.

O Admin do estabelecimento não define plano nem features contratadas. Ele administra apenas recursos liberados para o tenant e permitidos por sua autorização.

## Billing

Billing, invoices, checkout, gateway de pagamento e cobrança automática são futuros.

Nesta etapa, planos, features, extras e overrides são documentação e modelagem conceitual para preparar migrations futuras.
