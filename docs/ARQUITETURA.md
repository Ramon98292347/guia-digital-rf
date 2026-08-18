# Arquitetura

## Objetivo

Documentar a arquitetura técnica planejada para o Guia Digital RF Tecnologia, uma plataforma SaaS multi-tenant para pousadas, chalés, hotéis e hospedagens.

Princípio permanente:

**Um sistema. Muitos clientes. Experiências completamente personalizadas.**

## Stack técnica planejada

### Frontend / Full Stack

Arquitetura recomendada:

* React;
* Next.js;
* TypeScript;
* Tailwind CSS;
* biblioteca de componentes reutilizáveis baseada em shadcn/ui.

A arquitetura deverá ser adequada para:

* PWA;
* mobile-first;
* SEO das páginas públicas quando necessário;
* performance;
* carregamento rápido;
* áreas administrativas;
* multi-tenancy.

Não há versões fixas definidas neste momento. Na etapa de instalação, deverão ser usadas versões estáveis e compatíveis entre si.

### Backend e banco

A infraestrutura principal planejada é o **Supabase**, utilizando:

* PostgreSQL;
* autenticação;
* banco de dados;
* Storage;
* Row Level Security;
* funções/backend quando necessário.

O Supabase não deve depender exclusivamente do frontend para garantir isolamento entre tenants. A segurança multi-tenant deverá existir também no banco, nas políticas de acesso e na camada server-side.

## Camadas da plataforma

Fluxo público do hóspede:

```text
HÓSPEDE
   ↓
GUIA DIGITAL / PWA
   ↓
CAMADA DE APLICAÇÃO
   ↓
SERVIÇOS / REGRAS DE NEGÓCIO
   ↓
CAMADA DE DADOS
   ↓
SUPABASE / POSTGRESQL
```

Fluxo administrativo do estabelecimento:

```text
ADMIN DO ESTABELECIMENTO
            ↓
       PAINEL ADMIN
            ↓
    MESMOS SERVIÇOS
            ↓
       MESMO BANCO
```

Fluxo da RF Tecnologia:

```text
SUPER ADMIN RF
       ↓
SUPER ADMIN
       ↓
PLATAFORMA
       ↓
TODOS OS TENANTS
```

O Guia, o Admin e o Concierge devem utilizar a mesma fonte de verdade. Dados alterados no painel administrativo deverão refletir nas telas públicas e nas respostas do Concierge.

## Resolução do tenant

A aplicação deverá possuir um `TenantResolver` centralizado, responsável por descobrir qual estabelecimento está sendo acessado.

Entrada conceitual:

```text
hostname
pathname
```

Saída conceitual:

```text
tenant
tenant_domain
canonical_url
resolution_type
```

A arquitetura deve aceitar futuramente:

### Domínio próprio

```text
guia.pousadaexemplo.com.br
```

### Subdomínio da plataforma

```text
pousadaexemplo.guia.rftecnologia.com.br
```

### Slug

```text
/guia/pousadaexemplo
```

### QR/NFC

```text
/guia/pousadaexemplo?source=nfc
```

Também deverá permitir identificadores próprios de pontos físicos, como recepção, chalé, restaurante, piscina, placa ou chaveiro NFC.

A resolução do tenant deve ficar centralizada. Não espalhar lógica de identificação de tenant pelos componentes.

Fluxo conceitual:

```text
Request
   ↓
Hostname / Pathname
   ↓
TenantResolver
   ↓
tenant_domains / tenants
   ↓
TenantContext
```

Resolução de tenant não substitui autorização. Após identificar o tenant, cada operação ainda deve validar membership, role, entitlement, RLS e permissões server-side.

## Tenant Context

Deverá existir uma camada central para fornecer as informações do tenant atual às áreas da aplicação.

Essa camada poderá disponibilizar:

```text
tenant
theme
branding
design
modules
settings
permissions
```

O objetivo é evitar múltiplas consultas desnecessárias e impedir que cada componente implemente sua própria forma de descobrir tenant, tema, módulos ou permissões.

## Features e entitlements

Planos comerciais, extras e contratos personalizados devem ser resolvidos por uma camada de entitlements.

Fluxo conceitual:

```text
Tenant
   ↓
tenant_subscriptions
   ↓
Plan Features + Tenant Overrides
   ↓
TenantEntitlementResolver
   ↓
Available Capabilities
```

A aplicação deve consultar capacidades como `hasFeature(tenantId, "pwa")`, não nomes comerciais como "Guia Inteligente" ou "Guia PWA".

Feature não é módulo. Módulo é uma área funcional do Guia/Admin. Feature é uma capacidade comercial liberada. Entitlement é o resultado final para o tenant. Autorização define o que um usuário específico pode fazer.

Detalhes em `docs/PLANOS-E-DOMINIOS.md`.

## Domínios e Vercel

Estratégia inicial planejada:

```text
1 projeto Vercel
1 aplicação Next.js
N tenants
N hostnames
```

Não criar projeto Vercel, banco, branch, código ou deployment por cliente.

O mesmo projeto deve atender:

```text
guia.rftecnologia.com.br/cliente
cliente.guia.rftecnologia.com.br
guia.cliente.com.br
```

Integração automática com provedor de domínio é futura e deverá ser isolada por contratos como:

```text
DomainProvisioningService
DomainProvider
VercelDomainProvider
```

O MVP pode começar com DNS e verificação manuais.

## Configuração visual resolvida

A experiência visual do Guia deverá ser montada por configuração, não por componentes específicos de cliente.

Fluxo conceitual:

```text
Tenant
   ↓
Branding
+
Design Configuration
+
Modules
+
Home Sections
   ↓
UI Resolver
   ↓
Component Variants
   ↓
Guia personalizado
```

### UIConfigResolver

Planejar uma camada central como `UIConfigResolver`, responsável por combinar:

* template;
* tenant branding;
* design settings;
* AI Design Spec validada;
* section configuration;
* defaults da plataforma.

Fluxo conceitual:

```text
Platform Defaults
      ↓
Design Template
      ↓
Preset Snapshot
      ↓
AI Design Spec
      ↓
Tenant Overrides
      ↓
Section Overrides
      ↓
Resolved UI
```

Essa lógica deve ficar centralizada para evitar condicionais espalhadas pelos componentes.

Se uma opção não estiver configurada pelo tenant, a aplicação deverá usar fallback seguro do template ou da plataforma. Configuração ausente nunca deve quebrar a página.

Exemplo proibido:

```text
if tenant === "villa-caravaggio"
```

Exemplo esperado:

```text
Hero recebe variant = "fullscreen-image"
```

## AI Designer

Planejar uma camada conceitual de AI Designer para propor configurações visuais por tenant sem gerar aplicação, HTML, CSS arbitrário ou componentes específicos de cliente.

Fluxo conceitual:

```text
Branding + Conteúdo + Mídia
          ↓
      AI Designer
          ↓
     Design Spec
          ↓
   Schema Validation
          ↓
     Design Draft
          ↓
     UI Resolver
          ↓
       Preview
          ↓
       Publish
```

A arquitetura deverá prever um serviço abstrato, como `AIDesignService`, sem acoplamento obrigatório a um provedor ou modelo específico nesta etapa.

Toda proposta da IA deve passar por validação de schema, usar apenas opções existentes no Component Registry e nascer como draft. Publicação exige aprovação explícita.

Se a IA identificar necessidade de variante inexistente, deverá registrar uma sugestão de nova capacidade visual para avaliação da RF Tecnologia, não publicar valor desconhecido.

## Rotas conceituais

Organização conceitual futura:

```text
/
├── guia
│   └── [tenant]
│
├── admin
│
├── super-admin
│
└── api
```

Responsabilidades:

* `/guia/[tenant]`: experiência pública do hóspede, com identidade dinâmica e módulos ativos do estabelecimento.
* `/admin`: painel administrativo do estabelecimento autenticado.
* `/super-admin`: painel exclusivo da RF Tecnologia para gestão da plataforma.
* `/api`: rotas e integrações server-side quando necessárias.

A estrutura final poderá utilizar recursos adequados do Next.js. Não implementar agora.

## Rotas administrativas iniciais

O Admin autenticado inicial usa App Router com:

```text
/login
/admin
/admin/select
/admin/no-access
/admin/[tenantSlug]
```

`/admin/[tenantSlug]` é a rota determinística do contexto administrativo atual.

O tenant é resolvido a partir do slug, mas autorização depende de sessão, membership ativa, role e RLS.

`src/proxy.ts` segue a convenção do Next.js 16 para renovação de sessão e redirecionamento simples antes das rotas.

## Área do hóspede

A área pública deverá ser preparada para módulos como:

```text
Início
Minha Estadia
Acomodações
Wi-Fi
Horários
Serviços
Reservas
Regras
Contatos
Galeria
Gastronomia
Cardápio
Frigobar
Lojinha
Dicas da Região
Eventos
Experiências
Promoções
Cupons
Concierge
```

Nenhum módulo deve ser obrigatório para todos os tenants. Cada tenant poderá ativar, desativar, ordenar e personalizar seus módulos.

## Sistema de módulos

A plataforma deverá utilizar configuração de módulos por tenant, conceitualmente representada por:

```text
tenant_modules
```

Exemplo conceitual:

```text
wifi = ativo
gallery = ativo
restaurant = desativado
shop = desativado
events = ativo
concierge = ativo
```

A interface deverá considerar somente módulos ativos e disponíveis para o tenant.

É proibido criar condições específicas como:

```text
if tenant === "villa-caravaggio"
```

Dados e comportamentos específicos devem vir de configuração, não de código fixo.

## Storage e mídia

O Storage deverá ser multi-tenant.

Estrutura conceitual:

```text
tenants/
  tenant-id/
    branding/
    accommodations/
    gallery/
    services/
    products/
    guest-uploads/
```

As mídias deverão ser administradas pela plataforma. Não utilizar permanentemente imagens remotas de sites institucionais dos clientes como fonte operacional.

## Analytics

A arquitetura deverá prever métricas internas respeitando privacidade, como:

* abertura do Guia;
* origem QR;
* origem NFC;
* módulo acessado;
* clique em reserva;
* clique em contato;
* abertura do Concierge;
* instalação PWA.

Não implementar nesta etapa.

## Permissões e segurança

Papéis conceituais:

```text
guest
tenant_staff
tenant_admin
super_admin
```

A arquitetura deve permitir permissões mais granulares futuramente.

Requisitos de segurança:

* RLS;
* autorização server-side;
* autenticação segura;
* isolamento entre tenants;
* validação de uploads;
* validação de entrada;
* sanitização;
* princípio do menor privilégio;
* logs de operações administrativas relevantes.

O frontend nunca será considerado camada suficiente de segurança.

Documento de referência:

```text
docs/SEGURANCA-E-RLS.md
```

Princípios adicionais:

* autenticação planejada com Supabase Auth;
* membership por `tenant_members`;
* Super Admin separado em estrutura global;
* RLS com default deny;
* grants mínimos;
* service role somente em ambiente server-side seguro;
* testes negativos obrigatórios para isolamento entre tenants.

## Dados sensíveis

Exigem cuidado especial:

* senha de Wi-Fi;
* dados de hóspedes;
* informações de estadia;
* conversas;
* dados administrativos;
* tokens;
* chaves de API.

Nenhuma chave privada deverá ser exposta no frontend.

## Arquitetura de pastas futura

Estrutura conceitual futura, sem criação nesta etapa:

```text
src/
  app/
  components/
  features/
  hooks/
  services/
  lib/
  types/
  utils/
  config/
```

Dentro de `features/`, a organização poderá seguir domínios:

```text
tenant/
auth/
accommodations/
wifi/
services/
gallery/
events/
promotions/
concierge/
admin/
super-admin/
qr-nfc/
```

## Primeiro tenant real

**Chalés Villa Caravaggio** será o primeiro tenant real usado para validar a arquitetura.

Nenhuma decisão estrutural poderá depender desse cliente. A arquitetura deverá funcionar igualmente para:

* pousada;
* hotel;
* chalé;
* resort;
* hostel;
* hospedagem rural;
* futuras categorias compatíveis.
