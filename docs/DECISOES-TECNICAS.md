# Decisões Técnicas

## Objetivo

Registrar as decisões arquiteturais definidas no Passo 2 do projeto Guia Digital RF Tecnologia.

## Plataforma única multi-tenant

### Decisão

Construir uma única plataforma SaaS multi-tenant para todos os estabelecimentos.

### Motivo

Evitar projetos separados por cliente e permitir escala, manutenção centralizada e personalização por configuração.

### Impacto

Toda funcionalidade deverá considerar isolamento, configuração por tenant e ausência de dados específicos no código.

### Alternativas futuras

Avaliar estratégias específicas de particionamento, replicação ou separação por instância apenas se houver necessidade técnica, regulatória ou comercial.

## Supabase

### Decisão

Utilizar Supabase como infraestrutura principal para PostgreSQL, autenticação, banco, Storage, RLS e funções/backend quando necessário.

### Motivo

Combina banco relacional, autenticação, Storage e recursos de segurança em uma base adequada para SaaS multi-tenant.

### Impacto

A modelagem deverá considerar RLS, políticas por tenant, Storage multi-tenant e autorização server-side.

### Alternativas futuras

Avaliar backend dedicado, serviços adicionais ou migração parcial se o produto exigir requisitos que ultrapassem o escopo do Supabase.

## Next.js, React e TypeScript

### Decisão

Planejar frontend/full stack com Next.js, React e TypeScript.

### Motivo

Atende PWA, SEO quando necessário, rotas públicas, áreas administrativas, performance e organização moderna de aplicação.

### Impacto

A implementação futura deverá usar componentes reutilizáveis, tipagem forte, serviços e separação por domínios.

### Alternativas futuras

Avaliar ajustes de framework somente antes da implementação ou diante de requisito técnico incompatível.

## Tailwind CSS e shadcn/ui

### Decisão

Planejar Tailwind CSS e biblioteca de componentes reutilizáveis baseada em shadcn/ui.

### Motivo

Permite criar interfaces consistentes, responsivas e customizáveis por tokens.

### Impacto

Componentes deverão consumir tokens e evitar cores ou estilos específicos de cliente fixos no código.

### Alternativas futuras

Avaliar bibliotecas complementares desde que preservem customização por tenant e performance.

## Configuração visual por tokens

### Decisão

Usar tokens de design globais com sobrescritas por tenant.

### Motivo

Permitir que cada estabelecimento tenha experiência visual própria sem duplicar componentes.

### Impacto

Tema, branding, PWA e componentes deverão usar dados do tenant.

### Alternativas futuras

Criar temas avançados, presets por categoria de hospedagem ou editor visual no Admin.

## Módulos por tenant

### Decisão

Controlar disponibilidade, ativação, ordenação e personalização de módulos por tenant.

### Motivo

Nem todo estabelecimento precisa dos mesmos recursos.

### Impacto

Interface pública e Admin deverão considerar `tenant_modules`, evitando condicionais hardcoded por cliente.

### Alternativas futuras

Associar módulos a planos, limites, permissões ou marketplace interno.

## Planos por features e entitlements

### Decisão

Modelar planos comerciais como conjuntos de features e limites resolvidos por tenant.

### Motivo

Permitir Guia Essencial, Guia Personalizado, Guia PWA, Guia Inteligente, extras e contratos personalizados sem criar forks, projetos, deployments ou condicionais por nome de plano.

### Impacto

A aplicação deverá consultar entitlements resolvidos, como `hasFeature(tenantId, "pwa")`, e não nomes comerciais de plano. Feature não é módulo. Entitlement não substitui autorização, membership, RBAC ou RLS.

### Alternativas futuras

Adicionar billing, contratos, invoices e gateway de pagamento quando o fluxo comercial real for implementado.

## Domínios múltiplos na mesma aplicação

### Decisão

Preparar a plataforma para resolver tenants por URL da plataforma, subdomínio RF e domínio do cliente dentro do mesmo projeto Vercel.

### Motivo

Permitir experiência profissional para cada estabelecimento sem criar um deployment por cliente ou domínio.

### Impacto

`tenant_domains` deverá alimentar o `TenantResolver` usando `hostname` e `pathname`. O mesmo projeto Vercel atenderá múltiplos hostnames. Integração automática com Vercel/domínios fica para uma camada futura `DomainProvisioningService`.

### Alternativas futuras

Adicionar automação de DNS e verificação por provider quando a operação exigir escala.

## Downgrade preserva dados

### Decisão

Bloqueio, remoção ou downgrade de feature não deve apagar automaticamente dados do tenant.

### Motivo

Evitar perda acidental, permitir reativação, preservar histórico e reduzir risco operacional.

### Impacto

Uma feature desabilitada deve impedir uso, publicação ou novas ações conforme o caso, mas dados existentes precisam permanecer disponíveis para reativação, suporte, auditoria ou exportação controlada.

### Alternativas futuras

Definir políticas de retenção e expurgo explícitas por contrato ou requisito legal.

## Schema privado para autorização

### Decisão

Criar o schema `private` para funções internas de autorização da primeira migration real.

### Motivo

Centralizar checagens reutilizáveis de Super Admin, membership e Tenant Admin sem espalhar subconsultas pelas policies.

### Impacto

As funções `private.is_super_admin()`, `private.is_tenant_member(uuid)` e `private.is_tenant_admin(uuid)` são usadas por RLS. Elas utilizam `SECURITY DEFINER`, `search_path` explícito e não executam SQL dinâmico.

### Alternativas futuras

Adicionar funções auxiliares mais granulares somente quando houver fluxos reais de convite, suporte, permissões finas ou auditoria.

## RLS inicial conservadora

### Decisão

Na primeira migration real, limitar operações críticas de domínios, memberships, planos, subscriptions e overrides ao Super Admin.

### Motivo

Evitar autopromoção, troca indevida de plano, liberação indevida de features, vazamento entre tenants e alterações críticas antes de existirem fluxos administrativos completos.

### Impacto

Tenant Admin gerencia configurações operacionais do próprio tenant, mas não controla capabilities comerciais nem identidade estrutural da plataforma. Staff inicia com leitura limitada.

### Alternativas futuras

Abrir permissões adicionais com policies específicas, funções seguras, auditoria e testes negativos novos.

## Catálogo técnico inicial por migration

### Decisão

Inserir chaves técnicas iniciais de `features` e `modules` na migration `create_platform_core`.

### Motivo

Essas chaves representam capacidades e módulos da plataforma, não dados de cliente, e permitem testar o núcleo comercial sem seeds de produção.

### Impacto

Não foram inseridos planos comerciais, preços, tenants reais, domínios reais ou conteúdo de cliente.

### Alternativas futuras

Mover parte do catálogo para ferramenta interna de Super Admin se a RF Tecnologia precisar gerenciar capacidades sem migration.

## Conteúdo essencial antes de Concierge e Storage

### Decisão

Criar a migration `create_guide_core_content` com acomodações, comodidades, serviços, horários, Wi-Fi, regras, contatos, mídia metadata, galeria, dicas da região e reservas externas.

### Motivo

Estabilizar a fonte de verdade do Guia antes de abrir superfície pública, Storage, Concierge, Admin ou integrações externas.

### Impacto

Todas as entidades pertencem a tenant, têm RLS, índices de consulta previsíveis e testes negativos de isolamento. Nenhum bucket, upload, UI, Concierge, promoção, cupom, evento, produto, restaurante ou cliente real foi criado.

### Alternativas futuras

Adicionar tabelas de conteúdo avançado em migrations específicas quando cada domínio entrar no escopo.

## Status editorial do conteúdo

### Decisão

Usar `draft | published | archived` para conteúdo editorial e `draft | ready | published | archived` para mídia.

### Motivo

Evitar combinações confusas entre `status` e `is_active`, mantendo publicação clara para futura API pública.

### Impacto

A futura camada pública deverá filtrar somente conteúdo `published` de tenant ativo/publicado. Tabelas continuam fechadas para anon nesta etapa.

### Alternativas futuras

Adicionar workflows de aprovação ou agendamento se o Admin exigir.

## Integridade cross-tenant por FKs compostas

### Decisão

Usar chaves compostas `(tenant_id, id)` para relações entre entidades de tenant.

### Motivo

Impedir que uma requisição direta ao banco associe registros de tenants diferentes, mesmo se passar por validações do frontend.

### Impacto

Relações como acomodação-mídia, acomodação-comodidade, galeria-categoria-mídia, serviço-mídia e dicas-mídia são protegidas no banco.

### Alternativas futuras

Adicionar triggers apenas para casos que FKs compostas não resolverem.

## Dinheiro em numeric

### Decisão

Usar `numeric(12,2)` para preços em serviços.

### Motivo

Evitar ponto flutuante para valores monetários e manter uma representação simples para o MVP.

### Impacto

Não há motor de preços, impostos, tarifas, estoque ou moeda por item nesta etapa.

### Alternativas futuras

Migrar para centavos inteiros ou estrutura comercial mais rica se o produto exigir cálculos avançados.

## Wi-Fi restrito a Tenant Admin

### Decisão

Permitir gerenciamento de `wifi_networks` apenas por Tenant Admin e Super Admin nesta fundação.

### Motivo

Senha de Wi-Fi é dado sensível e não deve ser tratada como conteúdo operacional comum.

### Impacto

Tenant Staff pode gerenciar conteúdo essencial, mas não altera senha de Wi-Fi. A superfície pública de Wi-Fi será criada futuramente de forma controlada.

### Alternativas futuras

Adicionar permissão granular específica para Wi-Fi se houver necessidade operacional.

## Storage com buckets privado e público

### Decisão

Criar dois buckets versionados por migration: `tenant-private-media` e `tenant-public-media`.

### Motivo

Separar uploads/drafts/previews administrativos de assets publicados no Guia.

### Impacto

Tenant Admin e Staff trabalham no bucket privado via sessão normal e RLS. O bucket público é legível, mas não recebe escrita direta de Admin/Staff pelo cliente normal.

### Alternativas futuras

Adicionar buckets específicos somente se houver requisito real de isolamento ou performance.

## Paths de mídia por tenant_id

### Decisão

Usar paths no formato `{tenant_id}/{category}/{uuid}.{ext}`.

### Motivo

Evitar acoplamento a nome, slug ou domínio do cliente e bloquear path traversal.

### Impacto

Policies de Storage conseguem validar o tenant pelo primeiro segmento do path.

### Alternativas futuras

Adicionar subpastas de derivados ou versões quando pipeline de otimização for implementado.

## Publicação server-side de mídia

### Decisão

Publicação de mídia é operação controlada server-side com service role, não alteração direta feita pelo navegador.

### Motivo

Evitar que qualquer usuário transforme upload privado em asset público manipulando `bucket_id` ou `storage_bucket`.

### Impacto

Foi criado cliente admin server-only e serviço TypeScript de mídia. Operações normais continuam preferindo sessão normal + RLS.

### Alternativas futuras

Adicionar fila, retry, processamento de derivados e job de cleanup de órfãos.

## PWA

### Decisão

Preparar o Guia como PWA instalável com identidade dinâmica por tenant.

### Motivo

O hóspede deve sentir que está usando o aplicativo oficial do estabelecimento.

### Impacto

Manifest, ícones, cores, cache e experiência offline deverão considerar o tenant atual.

### Alternativas futuras

Avaliar aplicativos nativos ou wrappers somente se houver necessidade posterior.

## RLS e segurança multi-tenant

### Decisão

Utilizar isolamento também no banco, com RLS e autorização server-side.

### Motivo

O frontend não é camada suficiente de segurança.

### Impacto

Toda modelagem, consulta e operação administrativa deverá validar tenant, usuário e permissões.

### Alternativas futuras

Adicionar auditoria avançada, trilhas de aprovação, criptografia extra ou separação por banco conforme maturidade do produto.

## Fonte única para Concierge

### Decisão

O Concierge deverá consultar os mesmos dados usados pelo Guia e pelo Admin.

### Motivo

Evitar informações duplicadas, desatualizadas ou divergentes.

### Impacto

Dados estruturados devem ser priorizados antes de FAQs ou conhecimento complementar. Perguntas sem resposta deverão ser registradas.

### Alternativas futuras

Adicionar mecanismos de busca semântica, embeddings ou integrações, desde que respeitem tenant, privacidade e fonte única.

## Modelo inicial de dados multi-tenant

### Decisão

Documentar a modelagem inicial em `docs/MODELO-DE-DADOS.md`, usando UUIDs, `tenant_id` nas entidades pertencentes a estabelecimentos, timestamps quando aplicável e RLS como requisito obrigatório.

### Motivo

Criar uma fundação consistente antes de executar SQL, Supabase ou migrations.

### Impacto

O próximo passo poderá desenhar policies, tabelas e migrations com base em uma referência conceitual comum.

### Alternativas futuras

Refinar entidades, status e relacionamentos antes da primeira migration real, conforme os fluxos de MVP forem fechados.

## Membership por tenant

### Decisão

Associar usuários a estabelecimentos por `tenant_members`, sem limitar `profiles` a um único `tenant_id`.

### Motivo

Um usuário poderá administrar mais de um estabelecimento no futuro.

### Impacto

Autorização e RLS deverão validar membership por tenant em vez de presumir uma relação única.

### Alternativas futuras

Adicionar permissões granulares com `permissions`, `role_permissions` ou `member_permissions`.

## Super Admin separado

### Decisão

Modelar Super Admin RF Tecnologia fora de memberships comuns de tenant.

### Motivo

Evitar tratar Super Admin como membro artificial de todos os tenants e preservar separação clara de privilégios.

### Impacto

Policies e autorização deverão ter caminhos distintos para Admin do tenant e Super Admin da plataforma.

### Alternativas futuras

Adicionar trilhas de auditoria e permissões mais granulares para diferentes perfis internos da RF Tecnologia.

## Access points para QR e NFC

### Decisão

Recomendar uma entidade comum `access_points` com `channel = qr | nfc`.

### Motivo

QR e NFC compartilham campos, destino, analytics e ciclo administrativo semelhantes.

### Impacto

Reduz duplicação e prepara novos canais de acesso sem criar tabelas quase idênticas.

### Alternativas futuras

Separar em `qr_points` e `nfc_points` se os canais passarem a ter integrações, regras ou ciclos de vida muito diferentes.

## JSONB controlado

### Decisão

Usar JSONB apenas para configurações variáveis, metadata e pequenos conjuntos flexíveis.

### Motivo

Preservar integridade relacional, filtros eficientes e clareza do modelo.

### Impacto

Dados estruturais como acomodações, mídia, horários, Wi-Fi, regras, contatos e produtos permanecem em tabelas próprias.

### Alternativas futuras

Reavaliar campos específicos conforme surgirem necessidades reais de customização por tenant.

## Custom CSS não inicial

### Decisão

Não incluir `custom_css` na modelagem inicial de branding.

### Motivo

CSS livre aumenta risco de segurança, inconsistência visual e dificuldade de suporte.

### Impacto

A personalização visual inicial deverá ocorrer por tokens controlados pela plataforma.

### Alternativas futuras

Avaliar editor visual, presets avançados ou CSS controlado apenas se houver governança e sanitização adequadas.

## Templates e presets visuais

### Decisão

Adicionar `design_templates`, `design_presets` e `tenant_design_settings` à modelagem conceitual.

### Motivo

Permitir experiências visuais realmente diferentes entre estabelecimentos sem criar código, pasta ou projeto separado por cliente.

### Impacto

A plataforma poderá oferecer pontos de partida como natureza, luxo, rústico, praia ou minimalista, mantendo a mesma aplicação e componentes reutilizáveis.

### Alternativas futuras

Evoluir para editor visual mais avançado somente se houver limites, governança, preview e validação responsiva suficientes.

## Branding separado de layout

### Decisão

Separar `tenant_branding` de `tenant_design_settings`.

### Motivo

Branding representa marca, como logo, cores e fontes. Layout/design representa template, variantes, estrutura da Home, navegação, splash e densidade visual.

### Impacto

Evita uma tabela gigante e permite evoluir identidade e composição visual de forma independente.

### Alternativas futuras

Unificar apenas valores resolvidos em uma camada de cache ou materialização, sem perder a separação conceitual.

## Home Builder controlado

### Decisão

Expandir `tenant_home_sections` para usar `section_type`, `variant`, `content_source`, `settings` e `style_overrides`.

### Motivo

Permitir que o Admin organize a Home sem programador, preservando qualidade visual e segurança.

### Impacto

A solução será baseada em blocos profissionais pré-construídos, não em editor livre estilo Wix, Elementor ou Webflow.

### Alternativas futuras

Adicionar mais seções e variantes reutilizáveis conforme surgirem necessidades reais dos tenants.

## UIConfigResolver

### Decisão

Planejar uma camada central `UIConfigResolver`.

### Motivo

Combinar template, branding, design settings, configurações de seção e defaults sem espalhar condicionais pelos componentes.

### Impacto

Componentes recebem configuração resolvida, como `hero.variant = fullscreen-image`, sem conhecer o cliente.

### Alternativas futuras

Adicionar cache da configuração resolvida ou preview draft/publicado quando o produto exigir.

## Section definitions tipadas

### Decisão

Manter `section_definitions` como catálogo tipado no código inicialmente, não como tabela obrigatória no MVP.

### Motivo

Definições de seções, variantes suportadas e configurações permitidas são estrutura da plataforma, não conteúdo de cliente.

### Impacto

As escolhas do cliente ficam no banco em `tenant_home_sections`; a plataforma mantém controle sobre qualidade, responsividade e performance.

### Alternativas futuras

Persistir definições em banco se a RF Tecnologia precisar gerenciar catálogo de seções sem deploy.

## AI Designer baseado em configuração validada

### Decisão

Planejar o AI Designer como gerador de configuração visual validada, não como gerador de aplicação, HTML, CSS livre ou componentes específicos por cliente.

### Motivo

Possibilitar personalização visual em escala sem gerar projetos separados e sem quebrar a arquitetura multi-tenant.

### Impacto

Design System, Component Registry, Schema Validator e UIConfigResolver precisam possuir contratos claros. Toda `AI Design Spec` deve ser validada antes de virar draft ou configuração publicada.

### Alternativas futuras

Adicionar provedores de IA, prompts e automações somente depois de contratos, validação, preview e governança estarem definidos.

### Alternativa rejeitada

Geração de HTML/CSS livre por cliente.

## AIDesignService abstrato

### Decisão

Planejar um `AIDesignService` abstrato, sem escolher provedor, modelo ou SDK nesta etapa.

### Motivo

Evitar acoplamento prematuro e permitir trocar ou combinar provedores no futuro.

### Impacto

A aplicação dependerá de um contrato de geração de Design Spec, não de chamadas espalhadas a um fornecedor específico.

### Alternativas futuras

Selecionar provedor, modelo e estratégia de prompts quando a implementação do AI Designer for priorizada.

## Versionamento de design

### Decisão

Adicionar conceitualmente `tenant_design_versions` e `ai_design_jobs`.

### Motivo

Permitir draft, preview, comparação, histórico e publicação controlada de designs manuais, presets e propostas de IA.

### Impacto

Design publicado não será sobrescrito automaticamente por nova geração. Jobs de IA guardam apenas metadados mínimos e seguros.

### Alternativas futuras

Simplificar caso o MVP decida operar apenas com uma configuração draft/publicada, mantendo a regra de não sobrescrever publicação sem autorização.

## Segurança multi-tenant e RLS

### Decisão

Documentar a estratégia de autenticação, autorização, RBAC, Storage e RLS em `docs/SEGURANCA-E-RLS.md`, com default deny, grants mínimos e testes negativos obrigatórios.

### Motivo

Garantir que um tenant jamais acesse dados privados de outro tenant e que segurança não dependa apenas do frontend.

### Impacto

Toda tabela nova precisará de classificação de acesso. Membership será derivado do banco, Super Admin ficará separado, e policies futuras deverão validar SELECT, INSERT, UPDATE e DELETE por tenant e role.

### Alternativas futuras

Refinar permissões granulares e schemas internos quando as migrations reais forem criadas.

## Supabase Auth com membership no banco

### Decisão

Usar Supabase Auth para autenticação e `tenant_members` como fonte principal de vínculo usuário-tenant.

### Motivo

Um usuário pode administrar múltiplos tenants, membership pode mudar, e autorização precisa refletir o banco.

### Impacto

Não usar `profile.tenant_id` como autorização principal nem `user_metadata` editável para decisões críticas.

### Alternativas futuras

Adicionar claims controladas pelo servidor para informações pequenas e estáveis quando houver benefício claro.

## Fundação executável inicial

### Decisão

Inicializar a aplicação com Next.js, React, TypeScript, App Router, `src/`, Tailwind CSS, ESLint, shadcn/ui, Supabase SDK e Zod.

### Motivo

Criar uma base executável mínima para evolução controlada da plataforma, sem implementar ainda banco, autenticação, Admin, Concierge, PWA, QR/NFC ou tenant real.

### Impacto

A raiz do projeto passa a conter a aplicação Next.js e preserva `AGENTS.md` e `docs/` como documentação oficial.

### Alternativas futuras

Adicionar bibliotecas específicas somente quando suas funcionalidades entrarem no escopo.

## Fontes iniciais do sistema

### Decisão

Usar fontes locais/sistema na fundação inicial, sem `next/font/google`.

### Motivo

Evitar falha de build quando o ambiente não consegue acessar Google Fonts.

### Impacto

O build fica independente de download externo de fonte. A tipografia dinâmica por tenant continua planejada para etapas futuras.

### Alternativas futuras

Usar fontes auto-hospedadas, fontes do tenant ou integração controlada quando o sistema de temas for implementado.

## Preservação do AGENTS.md oficial

### Decisão

Desativar `agentRules` no `next.config.ts`.

### Motivo

Evitar que o Next.js tente gerar ou alterar regras de agente e preservar o `AGENTS.md` oficial do projeto.

### Impacto

As instruções permanentes continuam centralizadas no arquivo mantido pela RF Tecnologia.

### Alternativas futuras

Reavaliar caso a geração automática de regras se torne necessária e compatível com a documentação oficial.

## Admin autenticado por tenantSlug

### Decisão

Usar `/admin/[tenantSlug]` como rota inicial do Admin de tenant.

### Motivo

Usuários poderão administrar mais de um estabelecimento. A URL explícita preserva contexto no refresh, simplifica links internos e evita depender de estado local para saber qual tenant está ativo.

### Impacto

`tenantSlug` é somente entrada de resolução. Toda página administrativa valida sessão, tenant, membership ativa e role no servidor antes de consultar dados. Tenant inexistente ou inacessível retorna uma resposta segura de não encontrado.

### Alternativas futuras

Adicionar preferência de último tenant em cookie seguro ou perfil do usuário, mantendo validação server-side a cada acesso.

## Proxy do Next.js 16 para sessão SSR

### Decisão

Criar `src/proxy.ts` para renovar sessão Supabase SSR e redirecionar acessos sem login em `/admin`.

### Motivo

Next.js 16 usa `proxy.ts` para esse papel, e o Admin precisa manter cookies de sessão coerentes entre Server Components e Server Actions.

### Impacto

O proxy melhora a experiência de sessão, mas não substitui RLS, membership, role ou validação server-side.

### Alternativas futuras

Adicionar regras mais específicas de roteamento apenas quando novos fluxos administrativos surgirem.

## Bootstrap local do Admin

### Decisão

Criar `scripts/bootstrap-local-admin.mjs` para gerar usuário e tenants fictícios em ambiente Supabase local.

### Motivo

Permitir validar login, sessão, seleção de tenant e isolamento Tenant A x Tenant B sem inserir seeds em migrations de produção e sem usar cliente real.

### Impacto

O script aborta fora de hosts locais e usa credenciais claramente fictícias. `Tenant Demo B` existe sem membership do usuário demo para testar bloqueio de acesso direto.

### Alternativas futuras

Substituir por fluxo de convite ou ferramenta interna do Super Admin quando a gestão real de usuários for implementada.
