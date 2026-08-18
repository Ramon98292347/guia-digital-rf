# Design System

## Objetivo

Documentar o Design System global RF Tecnologia e a estratégia de identidade visual dinâmica por tenant.

## Princípio

A aplicação terá um Design System global RF, mas cada estabelecimento poderá personalizar sua experiência por meio de tokens, branding, mídia e configurações.

Os componentes devem ser reutilizáveis e consumir tokens. Não criar componentes exclusivos apenas para mudar a identidade visual de um cliente quando a mesma solução puder ser configurável.

A personalização por tenant não deve significar apenas trocar logo, cores e imagens. A plataforma deverá permitir experiências visuais bastante diferentes usando a mesma aplicação, por meio de templates, presets, tokens, variantes e seções configuráveis.

## Stack visual planejada

* Tailwind CSS;
* biblioteca de componentes reutilizáveis baseada em shadcn/ui;
* tokens de design por tenant;
* componentes mobile-first;
* acessibilidade e responsividade como critérios permanentes.

## Tokens conceituais

Tokens globais e sobrescritas por tenant devem ser organizados por grupos:

```text
colors
typography
spacing
radius
shadows
buttons
cards
navigation
surfaces
media
```

Exemplos de tokens:

```text
colors.primary
colors.secondary
colors.accent
colors.background
colors.surface
colors.foreground
colors.muted
colors.border

typography.fontHeading
typography.fontBody
spacing.section
radius.card
shadows.card
buttons.variant
cards.variant
navigation.style
surfaces.opacity
media.heroTreatment
```

## Uso correto

Os componentes devem consumir tokens:

```text
background: theme.primary
```

Conceitualmente incorreto:

```text
background: "#39AAA5"
```

quando essa cor pertencer a um cliente específico.

## Identidade por tenant

Cada estabelecimento poderá configurar:

* logo;
* ícone;
* cores;
* imagens;
* vídeos;
* tipografia;
* estilo;
* splash screen;
* aparência de cards;
* textos;
* identidade do PWA.

## Branding vs layout

Separar claramente:

### Branding

Representa identidade visual da marca:

* logo;
* ícone;
* cores;
* fontes;
* imagens principais;
* identidade do PWA.

### Design/Layout

Representa composição e comportamento visual:

* template;
* preset inicial;
* variantes de componentes;
* estrutura da Home;
* navegação;
* densidade visual;
* espaçamento;
* estilo de cards;
* estilo de Hero;
* comportamento padrão de seções.

Evitar colocar tudo em uma tabela ou configuração gigante. Branding e layout podem evoluir separadamente.

## Templates de design

`design_templates` será um catálogo global mantido pela RF Tecnologia.

Exemplos conceituais:

```text
natureza-premium
luxo
rustico
praia
minimalista
contemporaneo
```

Esses nomes são exemplos. Templates são pontos de partida, não designs rígidos.

Cada template poderá definir padrões como:

* estilo de Hero;
* estilo dos cards;
* espaçamento;
* raios de borda;
* intensidade de sombra;
* estilo de navegação;
* densidade visual;
* composição da Home;
* comportamento padrão de seções.

## Presets

Presets são configurações reutilizáveis que podem preencher inicialmente:

* template;
* tokens;
* variantes;
* estrutura da Home;
* navegação.

Fluxo:

```text
Escolher preset
↓
Criar configuração inicial
↓
Personalizar
```

Alterar posteriormente um preset global não deve obrigatoriamente modificar clientes já publicados. A configuração inicial deve ser copiada como snapshot para o tenant.

Exemplos conceituais:

```text
Natureza Premium
Luxo Contemporâneo
Rústico Elegante
Praia
Minimalista
```

## Variantes reutilizáveis

Variantes deverão ser implementadas futuramente como opções de componentes reutilizáveis. Não criar componentes específicos por cliente.

As variantes precisam possuir metadata suficiente para serem utilizadas futuramente pelo AI Designer, pelo Schema Validator e pelo UIConfigResolver.

Exemplo conceitual:

```text
Hero.fullscreen-image

supports:
- image
- video?
- alignment
- overlay
- cta

mobileCompatible: true
```

Não implementar metadata agora. Apenas planejar o contrato.

### Hero

```text
hero.variant:
image-overlay
fullscreen-image
video
split
minimal
editorial
```

### Cards

```text
card.variant:
standard
glass
bordered
image-heavy
minimal
elevated
```

### Acomodações

```text
accommodations.variant:
carousel
grid
horizontal
large-cards
editorial
```

### Serviços

```text
services.variant:
icons
cards
carousel
image-grid
```

### Galeria

```text
gallery.variant:
grid
masonry
carousel
featured
```

Exemplo ruim:

```text
HeroNatureza
HeroLuxo
HeroHotel
HeroPousada
HeroVilla
```

Exemplo correto:

```text
Hero
 ├─ fullscreen
 ├─ split
 ├─ video
 ├─ minimal
 └─ editorial
```

Quando uma experiência realmente exigir estrutura muito diferente, poderá existir componente separado, desde que seja reutilizável e não pertença a um cliente específico.

## Home Builder controlado

A Home deverá ser configurável por seções profissionais pré-construídas, não por editor livre.

O administrador poderá:

* adicionar seção;
* remover seção;
* ativar;
* desativar;
* reorganizar;
* selecionar variante;
* editar conteúdo;
* selecionar fonte de dados;
* alterar configurações permitidas.

Não criar nesta fase algo parecido com Wix, Elementor, Webflow ou editor HTML livre.

Solução desejada:

**blocos profissionais pré-construídos + configurações.**

Isso preserva qualidade visual, segurança, consistência, performance e facilidade para o proprietário.

## Biblioteca de seções

A plataforma deverá possuir definições estruturais de seções, como:

```text
hero
welcome
quick_actions
stay_summary
accommodations
services
gallery
promotion
events
local_tips
testimonial
custom_content
concierge_cta
booking_cta
```

Cada definição deverá conhecer:

* variantes disponíveis;
* configurações permitidas;
* fontes de dados suportadas.

Recomendação: manter `section_definitions` como catálogo tipado no código inicialmente, porque representa estrutura da plataforma. As escolhas do tenant, como seção ativa, variante selecionada, ordem, textos e fonte de dados, devem ficar no banco.

## Component Registry

O Design System deverá expor conceitualmente um `Component Registry`: catálogo tipado de componentes, variantes, tokens, propriedades permitidas e compatibilidade mobile.

Esse catálogo informa ao sistema e ao AI Designer quais opções existem.

Exemplo:

```text
Hero:
- fullscreen-image
- video
- split
- minimal
- editorial

Gallery:
- grid
- masonry
- carousel
- featured

Accommodations:
- carousel
- grid
- horizontal
- large-cards
```

O Component Registry é estrutura da plataforma. Não é dado específico de cliente.

Se uma variante desejada pela IA não existir, ela deve ser registrada como sugestão de nova capacidade visual. Nunca publicar automaticamente uma variante desconhecida.

## AI Designer

O AI Designer poderá propor configurações visuais, mas sempre dentro das capacidades do Design System.

Regra:

```text
Design System
      ↓
define possibilidades
      ↓
AI Designer
      ↓
combina possibilidades
      ↓
Tenant Design
```

Não:

```text
AI
↓
HTML/CSS aleatório
↓
Produção
```

A saída da IA deve ser uma `AI Design Spec` tipada e validada, contendo somente templates, tokens, variantes, seções, navegação e propriedades permitidas.

## Navegação por tenant

A navegação mobile poderá variar por tenant dentro de limites controlados.

Exemplo A:

```text
Início
Explorar
Concierge
Estadia
Mais
```

Exemplo B:

```text
Início
Serviços
Reservar
Concierge
Perfil
```

Itens de navegação poderão configurar:

```text
label
icon
destination
position
enabled
highlighted
```

A plataforma deve limitar quantidade e opções para preservar usabilidade mobile.

## Splash / abertura

Configurações de abertura poderão incluir:

* logo;
* background;
* mídia;
* mensagem;
* estilo;
* tempo máximo;
* ativo/inativo.

Não permitir splash pesada que prejudique carregamento.

## Preview

O Admin poderá futuramente alterar design e conteúdo sem publicar imediatamente.

Quando necessário, configurações visuais poderão ter estados:

```text
draft
published
```

Não implementar agora.

## Estrutura da plataforma vs escolha do cliente

Estrutura da plataforma pode ficar no código.

Exemplo:

```text
Hero suporta variantes:
fullscreen
split
video
```

Escolha do cliente deve ficar no banco.

Exemplo:

```text
Villa Caravaggio escolheu:
hero.variant = fullscreen
```

Componentes nunca devem perguntar:

```text
if tenant === "villa-caravaggio"
```

Eles devem receber configuração resolvida.

## Exemplo conceitual Villa Caravaggio

**Chalés Villa Caravaggio** poderá futuramente usar uma configuração como:

```text
tenant:
Chalés Villa Caravaggio

preset:
Natureza Premium

hero:
fullscreen-image

cards:
rounded / image-heavy

accommodations:
carousel

gallery:
masonry ou featured

navigation:
bottom-navigation premium
```

Isso é apenas exemplo de configuração futura. Nenhum valor específico deve entrar na estrutura global.

## Novo cliente

Fluxo futuro:

```text
Super Admin
      ↓
Novo estabelecimento
      ↓
Escolher preset
      ↓
Cadastrar identidade
      ↓
Gerar configuração visual inicial
      ↓
Ativar módulos
      ↓
Organizar Home
      ↓
Cadastrar conteúdo
      ↓
Visualizar prévia
      ↓
Publicar
```

## Responsividade

As variantes devem ser criadas prioritariamente para celular.

O administrador não deverá configurar layouts que quebrem responsividade. A plataforma controla limites, opções e fallbacks.

## Experiência do hóspede

O Guia deve parecer o aplicativo oficial do estabelecimento, não uma página genérica da RF Tecnologia.

Critérios:

* mobile-first;
* rápido;
* elegante;
* moderno;
* intuitivo;
* acolhedor;
* premium;
* responsivo.

Não deve parecer Linktree, lista de links, landing page genérica, dashboard administrativo ou template genérico.
